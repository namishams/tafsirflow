import * as Notifications from "expo-notifications";
import { readJSON, writeJSON } from "./store";
import { moduleText } from "@/i18n/app";
import { calText, countdown, todayUtc } from "@/web/hijri";
import { readTradition } from "./tradition";

// The daily reminder "Have you remembered Allah today?": a local notification at the time the user chose. It is off
// until the user turns it on (Apple 4.5.4: reminders that mention offers need an explicit opt-in), and it says so.
export type DailyReminder = { on: boolean; hour: number; minute: number };
const KEY = "qmc.daily";
const ID = "qmc-daily-remembrance";

export const readDaily = () => readJSON<DailyReminder>(KEY, { on: false, hour: 8, minute: 0 });

const TEXTS = {
  de: { title: "Heute schon an Allah gedacht?", body: "Eine Minute für einen Vers, ein Gedenken und auf Wunsch eine persönliche Dua für dein Anliegen." },
  en: { title: "Have you remembered Allah today?", body: "One minute for a verse, a remembrance and, if you wish, a personal dua for your concern." },
};

const ISLAMIC = "qmc-islamic-";

/** "Ramadan in 7 days" / "Ramadan is tomorrow" at the reminder time, for the next few days of the chosen tradition.
 *  Only while the daily reminder is on; rescheduled whenever the reminder, the language or the app state is refreshed. */
async function scheduleIslamicDays(next: DailyReminder, lang: string) {
  const pending = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  await Promise.all(pending.filter((p) => p.identifier.startsWith(ISLAMIC)).map((p) => Notifications.cancelScheduledNotificationAsync(p.identifier).catch(() => undefined)));
  if (!next.on) return;
  const { t, ev } = calText(lang);
  const cd = countdown(readTradition(), todayUtc(), 4);
  if (!cd) return;
  for (const { e, o } of cd.list) {
    for (const before of [7, 1]) {
      const [y, m, d] = new Date(o.t - before * 86_400_000).toISOString().slice(0, 10).split("-").map(Number);
      const at = new Date(y, m - 1, d, next.hour, next.minute, 0);
      if (at.getTime() <= Date.now()) continue;
      const name = ev(e.id).name;
      await Notifications.scheduleNotificationAsync({
        identifier: `${ISLAMIC}${e.id}-${before}`,
        content: { title: name, body: t(before === 1 ? "notifTomorrow" : "notifDays", { name, n: before }), data: { qmc: "islamic-day", url: "/calendar" } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
      }).catch(() => undefined);
    }
  }
}

export async function setDaily(next: DailyReminder, lang: string): Promise<boolean> {
  await Notifications.cancelScheduledNotificationAsync(ID).catch(() => undefined);
  if (!next.on) { await scheduleIslamicDays(next, lang).catch(() => undefined); writeJSON(KEY, next, true); return true; }
  const perm = await Notifications.getPermissionsAsync();
  const granted = perm.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) { writeJSON(KEY, { ...next, on: false }, true); return false; }
  const text = moduleText("dailyReminder", TEXTS, lang);
  await Notifications.scheduleNotificationAsync({
    identifier: ID,
    content: { title: text.title, body: text.body, data: { qmc: "daily", url: "/?moment=1" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: next.hour, minute: next.minute },
  });
  await scheduleIslamicDays(next, lang).catch(() => undefined);
  writeJSON(KEY, next, true);
  return true;
}

/** after a language change the scheduled text follows the app language */
export async function refreshDaily(lang: string) {
  const d = readDaily();
  if (d.on) await setDaily(d, lang).catch(() => undefined);
}
