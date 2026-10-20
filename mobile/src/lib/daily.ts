import * as Notifications from "expo-notifications";
import { readJSON, writeJSON } from "./store";
import { moduleText } from "@/i18n/app";

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

export async function setDaily(next: DailyReminder, lang: string): Promise<boolean> {
  await Notifications.cancelScheduledNotificationAsync(ID).catch(() => undefined);
  if (!next.on) { writeJSON(KEY, next, true); return true; }
  const perm = await Notifications.getPermissionsAsync();
  const granted = perm.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) { writeJSON(KEY, { ...next, on: false }, true); return false; }
  const text = moduleText("dailyReminder", TEXTS, lang);
  await Notifications.scheduleNotificationAsync({
    identifier: ID,
    content: { title: text.title, body: text.body, data: { qmc: "daily", url: "/?moment=1" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: next.hour, minute: next.minute },
  });
  writeJSON(KEY, next, true);
  return true;
}

/** after a language change the scheduled text follows the app language */
export async function refreshDaily(lang: string) {
  const d = readDaily();
  if (d.on) await setDaily(d, lang).catch(() => undefined);
}
