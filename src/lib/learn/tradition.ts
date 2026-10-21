// mirrors readTradition() of mobile/src/lib/tradition.ts: the learner's tradition as kept by the app's prayer setup
// ("qmc.prayerSetup".tradition). On the website it is only read (null = never chosen, show everything).
import { readJSON } from "./store";

export type TraditionChoice = "sunni" | "shia" | "both";
export function readTradition(): TraditionChoice | null {
  const t = readJSON<{ tradition?: string }>("qmc.prayerSetup", {}).tradition;
  return t === "sunni" || t === "shia" ? t : t === "unsure" ? "both" : null;
}
/** mirrors showsShia() of mobile/src/lib/tradition.ts: Shia content unless the learner chose Sunni */
export const showsShia = (t: TraditionChoice | null) => t !== "sunni";
