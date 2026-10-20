import { Platform } from "react-native";
import { monthOf, fmtTime, spotToday, type Prayer, type PrayerSettings, type Spot } from "@/web/prayer";
import { PRAYERS as SALAH_PRAYERS } from "@/web/salah";
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

// The answers of the guided prayer setup (local only). combine = Ja'fari practice of praying Dhuhr with Asr and
// Maghrib with Isha: then there are three reminders (Fajr, Dhuhr, Maghrib), the latter two naming both prayers.
export const SETUP_KEY = "qmc.prayerSetup";
export type Tradition = "sunni" | "shia" | "unsure";
export type PrayerSetup = { tradition?: Tradition; combine?: boolean; minutesBefore?: 0 | 5 | 10 | 15; sound?: "adhan" | "soft"; done?: boolean; declined?: boolean; at?: number };
export const COMBINED_PRAYERS = ["fajr", "dhuhr", "maghrib"] as const satisfies readonly AlertPrayer[];
/** the prayers a reminder at p stands for (Dhuhr → Dhuhr and Asr when combined) */
export const remindsOf = (p: AlertPrayer, combine: boolean): AlertPrayer[] => (combine && p === "dhuhr" ? ["dhuhr", "asr"] : combine && p === "maghrib" ? ["maghrib", "isha"] : [p]);
/** the prayers that can have a reminder in this mode */
export const alertPrayers = (combine: boolean): readonly AlertPrayer[] => (combine ? COMBINED_PRAYERS : ALERT_PRAYERS);
/** prayer names as the prayer trainer writes them (Fadschr, Dhuhr, Asr …), for "Dhuhr und Asr" */
export const prayerName = (p: AlertPrayer, lang: "de" | "en") => SALAH_PRAYERS.find((x) => x.id === p)?.name[lang] ?? p;
const AND = { de: "und", en: "and" };
const SOON = { de: "In {n} Minuten:", en: "In {n} minutes:" };
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
    const setup = readJSON<PrayerSetup>(SETUP_KEY, {});
    const combine = !!setup.combine;
    const before = Math.max(0, Math.min(60, Number(setup.minutesBefore ?? 0))) * 60000;
    const chosen = alertPrayers(combine).filter((p) => alerts[p]);
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
        const fire = at.getTime() - before;
        if (fire <= now + 30000 || at.getTime() > until) continue;
        const time = fmtTime(at, main.tz, lang);
        const group = remindsOf(p, combine);
        // one prayer: the website's own words ("Zeit für Dhuhr – Berlin"); combined: "Zeit für Dhuhr und Asr – Berlin"
        const name = group.length > 1 ? group.map((x) => prayerName(x, lang)).join(` ${AND[lang]} `) : tr[p];
        const lead = before ? SOON[lang].replace("{n}", String(before / 60000)) : tr.timeFor;
        await n.scheduleNotificationAsync({
          identifier: `${TAG}-${p}-${at.getTime()}`,
          content: { title: `${name} · ${time}`, body: `${lead} ${name} – ${place}`, sound: "default", data: { tag: TAG, prayer: p, at: at.getTime() } },
          trigger: { type: n.SchedulableTriggerInputTypes.DATE, date: new Date(fire), ...(Platform.OS === "android" ? { channelId: CHANNEL } : {}) },
        }).then(() => { count++; }).catch(() => undefined);
      }
    }
    return count;
  };
  const p = queue.then(run, run);
  queue = p.catch(() => undefined);
  return p;
}

/** the adhan recording that fits the tradition (ids as in /api/adhan: "tehran" for Shia, Makkah/Madinah for Sunni) */
export function adhanForTradition<F extends { id: string }>(tradition: Tradition | undefined, files: F[]): F | null {
  if (!tradition || !files.length) return null;
  if (tradition === "shia") return files.find((f) => /tehran/i.test(f.id)) ?? null;
  return files.find((f) => /makkah|madinah/i.test(f.id)) ?? files.find((f) => !/tehran/i.test(f.id)) ?? null;
}
