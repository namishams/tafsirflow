import { Platform } from "react-native";
import { monthOf, fmtTime, spotToday, type Prayer, type PrayerSettings, type Spot } from "@/web/prayer";
import { readJSON } from "@/lib/store";
import de from "@/web/messages/de.json";
import en from "@/web/messages/en.json";
import { placeLabel, storedPlace } from "./place";

// Prayer reminders as local notifications: one per chosen prayer for the next 7 days, computed on the device with
// the website's own calculation (lib/prayer.ts, adhan). Nothing is preselected; the permission is asked when the
// first prayer is switched on. Our notifications carry data.tag = TAG, so we only ever cancel our own.
export const ALERTS_KEY = "qmc.prayerAlerts"; // local only, not synced
export const ALERT_PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const satisfies readonly Prayer[];
export type AlertPrayer = (typeof ALERT_PRAYERS)[number];
export type Alerts = Partial<Record<AlertPrayer, boolean>>;
const TAG = "qmc-prayer";
const CHANNEL = "prayer-times";
const DAYS = 7;

type N = typeof import("expo-notifications");
let mod: Promise<N | null> | null = null;
/** the notifications module, or null when this build does not contain it yet */
function notifications(): Promise<N | null> {
  mod ??= import("expo-notifications").then((m) => (typeof m.scheduleNotificationAsync === "function" ? m : null)).catch(() => null);
  return mod;
}
export async function alertsAvailable() { return (await notifications()) !== null; }

/** asks for permission (only called when a prayer is switched on); "granted" | "denied" | "unavailable" */
export async function ensurePermission(): Promise<"granted" | "denied" | "unavailable"> {
  const n = await notifications();
  if (!n) return "unavailable";
  try {
    const cur = await n.getPermissionsAsync();
    if (cur.granted || cur.ios?.status === n.IosAuthorizationStatus.PROVISIONAL) return "granted";
    if (!cur.canAskAgain) return "denied";
    const r = await n.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
    return r.granted || r.ios?.status === n.IosAuthorizationStatus.PROVISIONAL ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

async function cancelOurs(n: N) {
  const all = await n.getAllScheduledNotificationsAsync().catch(() => []);
  await Promise.all(all.filter((r) => (r.content.data as { tag?: string } | undefined)?.tag === TAG).map((r) => n.cancelScheduledNotificationAsync(r.identifier).catch(() => undefined)));
}

/** the prayer times of the next DAYS days at the spot (the website's monthOf, so the times are identical) */
export function upcomingTimes(spot: Spot, st: PrayerSettings, now = new Date()) {
  const d = spotToday(now, spot.tz);
  const next = new Date(d.y, d.m + 1, 1);
  const rows = [...monthOf(spot, d.y, d.m, st), ...monthOf(spot, next.getFullYear(), next.getMonth(), st)];
  const start = new Date(d.y, d.m, d.d).getTime();
  return rows.filter((r) => r.date.getTime() >= start).slice(0, DAYS + 1);
}

let queue: Promise<unknown> = Promise.resolve();
/** cancels our scheduled reminders and plans them again from what is stored (place, settings, chosen prayers) */
export function reschedulePrayerAlerts(lang: "de" | "en"): Promise<number> {
  const run = async () => {
    const n = await notifications();
    if (!n) return 0;
    await cancelOurs(n);
    const alerts = readJSON<Alerts>(ALERTS_KEY, {});
    const chosen = ALERT_PRAYERS.filter((p) => alerts[p]);
    if (!chosen.length) return 0;
    const perm = await n.getPermissionsAsync().catch(() => null);
    if (!perm?.granted && perm?.ios?.status !== n.IosAuthorizationStatus.PROVISIONAL) return 0;
    const tr = (lang === "de" ? de : en).prayer as Record<string, string>;
    const { main, settings } = storedPlace();
    const place = placeLabel(main, lang, tr.yourPlace);
    if (Platform.OS === "android") {
      await n.setNotificationChannelAsync(CHANNEL, { name: lang === "de" ? "Gebetszeiten" : "Prayer times", importance: n.AndroidImportance.HIGH, sound: "default" }).catch(() => undefined);
    }
    const now = Date.now(), until = now + DAYS * 86400000;
    let count = 0;
    for (const day of upcomingTimes(main, settings)) {
      for (const p of chosen) {
        const at = day.times[p];
        if (at.getTime() <= now + 30000 || at.getTime() > until) continue;
        const time = fmtTime(at, main.tz, lang);
        await n.scheduleNotificationAsync({
          identifier: `${TAG}-${p}-${at.getTime()}`,
          content: { title: `${tr[p]} · ${time}`, body: `${tr.timeFor} ${tr[p]} – ${place}`, sound: "default", data: { tag: TAG, prayer: p, at: at.getTime() } },
          trigger: { type: n.SchedulableTriggerInputTypes.DATE, date: at, ...(Platform.OS === "android" ? { channelId: CHANNEL } : {}) },
        }).then(() => { count++; }).catch(() => undefined);
      }
    }
    return count;
  };
  const p = queue.then(run, run);
  queue = p.catch(() => undefined);
  return p;
}
