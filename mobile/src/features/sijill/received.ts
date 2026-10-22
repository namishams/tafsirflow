import * as Notifications from "expo-notifications";
import { readJSON, writeJSON } from "@/lib/store";
import { dayNum } from "@/features/feed/statsStore";
import { bonusXp, setSocialTotals } from "@/features/feed/gamify";
import { growFromKindness } from "@/features/garden/garden";
import { ApiError } from "@/lib/api";
import { getToken } from "@/lib/storage";
import { sijillApi } from "./api";
import { sijillT } from "./text";

// Rewards for encouragement: the server counts reactions received (never your own, never across blocks, capped per giver
// and per day, see src/lib/sijill.ts). Here the new ones become a little XP and garden growth, with a daily cap, the
// totals open the "MashaAllah received" and "Encourager" stickers, and one gentle notice a day tells how many arrived.
const KEY = "qmc.sijill.received.v1";
export const XP_PER_RECEIVED = 5;
export const XP_DAILY_CAP = 100;   // 20 reactions a day
const GP_DAILY_CAP = 3;
type St = { seen: number; day: number; xp: number; gp: number; today: number; noticeDay: number; at: number; off?: number; offFor?: string };
const EMPTY: St = { seen: 0, day: 0, xp: 0, gp: 0, today: 0, noticeDay: 0, at: 0 };
let busy = false;
/** after "not signed in" (401) or "no community profile" (403 profile_required) the server is not asked again for this
 *  long with the same sign-in; a new sign-in (another token) asks at once. Before (builds 13–24) every app start and
 *  every return to the app called /api/community/achievements and got 401/403 (131 in the server log). */
const OFF_MS = 12 * 60 * 60_000;
/** which sign-in the pause belongs to: a 32-bit FNV-1a hash of the token (nothing of the token itself is stored) */
const tokenTag = (t: string) => { let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 0x01000193); return (h >>> 0).toString(36); };

/** at most every 10 minutes: reads the counted totals, rewards what is new, notifies once a day. Only for a signed-in
 *  member with a community profile; anything else is quiet. */
export async function collectReceived(lang = "en"): Promise<number> {
  if (busy) return 0;
  const st = { ...EMPTY, ...readJSON<Partial<St>>(KEY, {}) };
  if (Date.now() - st.at < 10 * 60_000) return 0;
  busy = true;
  try {
    const token = await getToken();
    if (!token) return 0;
    const tag = tokenTag(token);
    if (st.off && st.offFor === tag && Date.now() - st.off < OFF_MS) return 0;
    let sijill;
    try { ({ sijill } = await sijillApi.mine(lang)); } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) writeJSON(KEY, { ...st, off: Date.now(), offFor: tag }, true);
      return 0;
    }
    st.off = undefined; st.offFor = undefined;
    const total = sijill.received ?? 0;
    const d = dayNum();
    if (st.day !== d) { st.day = d; st.xp = 0; st.gp = 0; st.today = 0; }
    st.at = Date.now();
    const fresh = Math.max(0, total - st.seen);
    st.seen = Math.max(st.seen, total);
    if (fresh > 0) {
      const xp = Math.min(fresh * XP_PER_RECEIVED, XP_DAILY_CAP - st.xp);
      if (xp > 0) { bonusXp(xp); st.xp += xp; }
      const gp = Math.min(fresh, GP_DAILY_CAP - st.gp);
      if (gp > 0) { growFromKindness(gp); st.gp += gp; }
      st.today += fresh;
    }
    setSocialTotals(total, sijill.given ?? 0);
    if (st.today > 0 && st.noticeDay !== d) {
      st.noticeDay = d;
      await notify(lang, st.today);
    }
    writeJSON(KEY, st, true);
    return fresh;
  } catch { return 0; } finally { busy = false; }
}

async function notify(lang: string, n: number) {
  try {
    const hour = new Date().getHours();
    if (hour < 8 || hour >= 21) return; // never at night
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    await Notifications.scheduleNotificationAsync({
      identifier: "qmc-received",
      content: { title: sijillT(lang, "recvNotifTitle"), body: n === 1 ? sijillT(lang, "recvNotifBodyOne") : sijillT(lang, "recvNotifBody", { n }), data: { qmc: "received", url: "/talents/sijill" } },
      trigger: null,
    });
  } catch { /* not essential */ }
}
