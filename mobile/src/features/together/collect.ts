import * as Notifications from "expo-notifications";
import { readJSON, writeJSON } from "@/lib/store";
import { getToken } from "@/lib/storage";
import { ApiError } from "@/lib/api";
import { TG } from "./api";
import { demoOn } from "./sample";
import { tgT, type TgKey } from "./text";

// Together without a push server: when the app comes to the foreground (at most every 15 minutes) it reads the
// Together inbox. New nudges, challenges and invitations become one gentle local notification, only with notification permission, only between 8 and 21 o'clock,
// at most twice a day. Members without the features (401/403) are not asked again for 12 hours.
const KEY = "qmc.together.collect.v1";
type St = { at: number; seen: string[]; day: number; shown: number; off?: number };
const DAY = 86_400_000;
let busy = false;

export async function collectTogether(lang = "en") {
  if (busy || demoOn()) return;
  const st = readJSON<St>(KEY, { at: 0, seen: [], day: 0, shown: 0 });
  if (Date.now() - st.at < 15 * 60_000) return;
  if (st.off && Date.now() - st.off < 12 * 3_600_000) return;
  busy = true;
  try {
    if (!(await getToken())) return;
    let box;
    try { box = await TG.inbox(); } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) writeJSON(KEY, { ...st, at: Date.now(), off: Date.now() });
      return;
    }
    const ids = [...box.nudges.filter((n) => !n.read).map((n) => `n${n.id}`), ...box.challenges.map((c) => `c${c.id}`), ...box.invites.map((i) => `i${i.id}`)];
    const fresh = ids.filter((id) => !st.seen.includes(id));
    const d = Math.floor(Date.now() / DAY);
    if (st.day !== d) { st.day = d; st.shown = 0; }
    if (fresh.length && st.shown < 2) {
      const h = new Date().getHours();
      if (h >= 8 && h < 21) {
        const n = box.nudges.find((x) => fresh.includes(`n${x.id}`));
        const body = fresh.length === 1 && n ? tgT(lang, "notifNudge", { u: n.from.name, t: tgT(lang, `nudge_${n.kind}` as TgKey) }) : tgT(lang, "notifItems", { n: fresh.length });
        try {
          const perm = await Notifications.getPermissionsAsync();
          if (perm.granted) {
            await Notifications.scheduleNotificationAsync({ identifier: "qmc-together", content: { title: tgT(lang, "notifTitle"), body, data: { qmc: "together", url: "/together" } }, trigger: null });
            st.shown += 1;
          }
        } catch { /* not essential */ }
      }
    }
    writeJSON(KEY, { at: Date.now(), seen: [...new Set([...fresh, ...st.seen])].slice(0, 200), day: st.day, shown: st.shown });
  } catch { /* quiet */ } finally { busy = false; }
}
