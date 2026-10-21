import * as Notifications from "expo-notifications";
import { readJSON, writeJSON } from "@/lib/store";
import { dayFor } from "@/web/prayer";
import { spotNow } from "@/features/feed/Extras";
import { readDaily } from "@/lib/daily";
import { activeTree, clearNotifyStage, progressOf, readGarden, resting, type Garden } from "./garden";
import { fillG, gardenText } from "./texts";

// Gentle local reminders from the tree: at most one a day (one identifier, replaced on every reschedule), only between
// 9:00 and 20:00, never within 30 minutes of a prayer time, never shaming. Kinds by priority: a stage reached, ripe
// fruits, a little water. Off with the setting; asks for permission only when the user turns it on.
const KEY = "qmc.garden-notify";
const ID = "qmc-garden";
export const readGardenNotify = () => readJSON<{ on: boolean }>(KEY, { on: true });

export async function setGardenNotify(on: boolean, g: Garden, pro: boolean, lang: string): Promise<boolean> {
  if (on) {
    const perm = await Notifications.getPermissionsAsync();
    const ok = perm.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (!ok) { writeJSON(KEY, { on: false }, true); return false; }
  }
  writeJSON(KEY, { on }, true);
  await scheduleGardenNotification(g, pro, lang);
  return true;
}

/** a calm slot tomorrow: the daily reminder's hour if set, else 17:30; moved out of prayer windows and night hours */
function slot(): Date {
  const d = readDaily();
  const at = new Date();
  at.setDate(at.getDate() + 1);
  at.setHours(d.on ? d.hour : 17, d.on ? d.minute + 5 : 30, 0, 0);
  try {
    const times = Object.values(dayFor(spotNow(), at).times).map((x) => x.getTime());
    for (let i = 0; i < 12 && times.some((t) => Math.abs(t - at.getTime()) < 30 * 60000); i++) at.setMinutes(at.getMinutes() + 20);
  } catch { /* no prayer times */ }
  if (at.getHours() < 9) at.setHours(9, 0);
  if (at.getHours() >= 20) at.setHours(19, 30);
  return at;
}

export async function scheduleGardenNotification(g: Garden, pro: boolean, lang: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(ID).catch(() => undefined);
    const t = activeTree(g, pro);
    if (!t || !readGardenNotify().on) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    const tx = gardenText(lang);
    const p = progressOf(t.gp, pro);
    const name = t.name || tx[`t_${t.type}`];
    let title: string, body: string;
    if (g.notifyStage) { title = fillG(tx.stageUp, { n: g.notifyStage }); body = fillG(tx.nStageB, { name, stage: tx[`s${p.stage}` as "s0"] }); clearNotifyStage(); }
    else if (p.stage >= 5 && !resting(g)) { title = tx.nFruitsT; body = fillG(tx.nFruitsB, { name }); }
    else { title = fillG(tx.nThirstyT, { name }); body = fillG(tx.nThirstyB, { type: tx[`t_${t.type}`] }); }
    await Notifications.scheduleNotificationAsync({
      identifier: ID,
      content: { title, body, data: { qmc: "garden", url: "/garden" } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: slot() },
    });
  } catch { /* notifications are optional */ }
}
export function rescheduleGarden(pro: boolean, lang: string) { void scheduleGardenNotification(readGarden(), pro, lang); }
