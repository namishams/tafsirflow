import { useCallback } from "react";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { SETUP_KEY, reschedulePrayerAlerts, type PrayerSetup } from "@/features/practice/prayer/alerts";
import { SETTINGS_KEY } from "@/features/practice/prayer/place";
import type { PrayerSettings } from "@/web/prayer";

// The learner's tradition, asked once (Today) and changeable in Account. It is kept where the guided prayer setup
// keeps it ("qmc.prayerSetup".tradition: "sunni" | "shia" | "unsure"), so the setup, the trainers and the hadith
// screens always agree. "unsure" is shown as "I'd rather not say / show both". Local only, never synced.
export type TraditionChoice = "sunni" | "shia" | "both";
/** what the prayer and wudu trainers open with */
export type TrainerTradition = "sunni" | "shia";

const fromStored = (t: PrayerSetup["tradition"]): TraditionChoice | null => (t === "sunni" || t === "shia" ? t : t === "unsure" ? "both" : null);

/** the stored choice, or null when it was never asked */
export function readTradition(): TraditionChoice | null {
  return fromStored(readJSON<PrayerSetup>(SETUP_KEY, {}).tradition);
}
/** Shia only when chosen; Sunni otherwise (also for "both", as the website's trainers do) */
export const trainerTradition = (t: TraditionChoice | null = readTradition()): TrainerTradition => (t === "shia" ? "shia" : "sunni");

/** stores the choice and moves the prayer-time method along: Ja'fari (Tehran) for Shia, back to the regional
 *  method when leaving Shia mode – but only when the method was not picked by hand to something else */
export function saveTradition(t: TraditionChoice, lang: string) {
  const setup = readJSON<PrayerSetup>(SETUP_KEY, {});
  const before = fromStored(setup.tradition);
  writeJSON(SETUP_KEY, { ...setup, tradition: t === "both" ? "unsure" : t } satisfies PrayerSetup, true);
  const st = readJSON<Partial<PrayerSettings>>(SETTINGS_KEY, {});
  let next: Partial<PrayerSettings> | null = null;
  if (t === "shia" && st.method !== "Tehran") next = { ...st, method: "Tehran", madhab: "shafi" };
  else if (t !== "shia" && before === "shia" && st.method === "Tehran") next = { ...st, method: "auto", madhab: "auto" };
  if (next) {
    writeJSON(SETTINGS_KEY, next, true);
    void reschedulePrayerAlerts(lang).catch(() => undefined);
  }
}

/** the choice as state: tradition (null = not asked yet), set(), and the trainers' default */
export function useTradition() {
  const setup = useStored<PrayerSetup>(SETUP_KEY, {});
  const tradition = fromStored(setup.tradition);
  const set = useCallback((t: TraditionChoice, lang: string) => saveTradition(t, lang), []);
  return { tradition, asked: tradition !== null, set, trainer: trainerTradition(tradition) };
}

/** which content a mode shows: Sunni hadith for Sunni and "both", Shia hadith for Shia and "both", the Nahj al-Balagha
 *  feed for Shia only. Not chosen yet counts as "both". */
export const showsSunni = (t: TraditionChoice | null) => t !== "shia";
export const showsShia = (t: TraditionChoice | null) => t !== "sunni";
export const NAHJ_OPTIN_KEY = "qmc.nahjOptIn";
/** Shia mode shows the Nahj al-Balagha by default; everyone else switches it on ("Show Nahj al-Balagha" in Account or on its Discover card) */
export const showsNahj = (t: TraditionChoice | null, optIn: boolean = readJSON<boolean>(NAHJ_OPTIN_KEY, false)) => t === "shia" || optIn;
export const setNahjOptIn = (on: boolean) => writeJSON(NAHJ_OPTIN_KEY, on, true);
/** reactive: the Nahj al-Balagha is visible for the current tradition and opt-in */
export function useNahjVisible(): boolean {
  const { tradition } = useTradition();
  const optIn = useStored<boolean>(NAHJ_OPTIN_KEY, false);
  return showsNahj(tradition, optIn);
}
/** the library chapter on how to pray in this tradition */
export const prayerChapter = (t: TraditionChoice | null) => (t === "shia" ? "/islam/prayer-shia" : "/islam/prayer-sunni");
