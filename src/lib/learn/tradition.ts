// mirrors readTradition() of mobile/src/lib/tradition.ts: the learner's tradition, kept on this device only in the key of
// the app's prayer setup ("qmc.prayerSetup".tradition). The rules live in the shared identity module (src/lib/identity.ts);
// the website reads and sets it there (profile, /start, the trainers' default). null = never chosen, show everything.
import { readJSON, useStored, useStoreVersion, writeJSON } from "./store";
import { readTraditionChoice, saveTraditionChoice, trainerOf, type TraditionChoice } from "../identity";

export type { TraditionChoice };
export const readTradition = (): TraditionChoice | null => readTraditionChoice();
export const saveTradition = (t: TraditionChoice) => saveTraditionChoice(t);
/** the trainers' default (prayer, wudu): Ja'fari for Shia, otherwise Sunni */
export const trainerTradition = (t: TraditionChoice | null = readTradition()) => trainerOf(t);
/** mirrors showsShia() of mobile/src/lib/tradition.ts: Shia content unless the learner chose Sunni */
export const showsShia = (t: TraditionChoice | null) => t !== "sunni";

// mirrors the Nahj al-Balagha switch of mobile/src/lib/tradition.ts: Shia mode shows it by default (feed, school,
// knowledge posts); everyone else can switch it on. The library and /nahj are open to everyone.
export const NAHJ_OPTIN_KEY = "qmc.nahjOptIn";
export const showsNahj = (t: TraditionChoice | null, optIn: boolean = readJSON<boolean>(NAHJ_OPTIN_KEY, false)) => t === "shia" || optIn;
export const setNahjOptIn = (on: boolean) => writeJSON(NAHJ_OPTIN_KEY, on);
/** reactive: the Nahj al-Balagha is visible for the current tradition and opt-in (false during server rendering) */
export function useNahjVisible(): boolean {
  const v = useStoreVersion();
  const optIn = useStored<boolean>(NAHJ_OPTIN_KEY, false);
  return v >= 0 && showsNahj(readTradition(), optIn);
}
