// mirrors readTradition() of mobile/src/lib/tradition.ts: the learner's tradition, kept on this device only in the key of
// the app's prayer setup ("qmc.prayerSetup".tradition). The rules live in the shared identity module (src/lib/identity.ts);
// the website reads and sets it there (profile, /start, the trainers' default). null = never chosen, show everything.
import { readTraditionChoice, saveTraditionChoice, trainerOf, type TraditionChoice } from "../identity";

export type { TraditionChoice };
export const readTradition = (): TraditionChoice | null => readTraditionChoice();
export const saveTradition = (t: TraditionChoice) => saveTraditionChoice(t);
/** the trainers' default (prayer, wudu): Ja'fari for Shia, otherwise Sunni */
export const trainerTradition = (t: TraditionChoice | null = readTradition()) => trainerOf(t);
/** mirrors showsShia() of mobile/src/lib/tradition.ts: Shia content unless the learner chose Sunni */
export const showsShia = (t: TraditionChoice | null) => t !== "sunni";
