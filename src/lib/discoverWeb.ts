// Texts of "Discover talents" on the website (/talents/discover, 22.10.2026), the same screen as the app's /talents:
// search, filters and the paged list. English and German here; the other 12 locales in discoverWeb/<locale>.json, taken
// from the app's "talents" module (mobile/src/i18n/app/<lang>.json), merged over English. Polite address everywhere.
import ar from "./discoverWeb/ar.json";
import bn from "./discoverWeb/bn.json";
import es from "./discoverWeb/es.json";
import fa from "./discoverWeb/fa.json";
import fr from "./discoverWeb/fr.json";
import id from "./discoverWeb/id.json";
import ms from "./discoverWeb/ms.json";
import ps from "./discoverWeb/ps.json";
import ru from "./discoverWeb/ru.json";
import tr from "./discoverWeb/tr.json";
import ur from "./discoverWeb/ur.json";
import zh from "./discoverWeb/zh.json";

const en = {
  discoverTitle: "Discover talents",
  discoverLead: "Find reciters and teachers from all over the world, follow them and connect.",
  search: "Search name or @username",
  filterLevel: "Level",
  all: "All",
  verifiedOnly: "Verified only",
  filterCountry: "Country",
  anyCountry: "All countries",
  filterRewaya: "Rewaya",
  rewayaFilterHint: "For example Hafs or Warsh",
  empty: "No talents found.",
  loadMore: "Load more",
  signIn: "Please sign in to use the community.",
  signInBtn: "Sign in",
  e_generic: "That did not work.",
  retry: "Try again",
};
export type DwKey = keyof typeof en;
const de: Record<DwKey, string> = {
  discoverTitle: "Talente entdecken",
  discoverLead: "Finden Sie Rezitatorinnen, Rezitatoren und Lehrende aus aller Welt, folgen Sie ihnen und vernetzen Sie sich.",
  search: "Name oder @benutzername suchen",
  filterLevel: "Stufe",
  all: "Alle",
  verifiedOnly: "Nur verifiziert",
  filterCountry: "Land",
  anyCountry: "Alle Länder",
  filterRewaya: "Rewaya",
  rewayaFilterHint: "Zum Beispiel Hafs oder Warsch",
  empty: "Keine Talente gefunden.",
  loadMore: "Mehr laden",
  signIn: "Bitte melden Sie sich an, um die Community zu nutzen.",
  signInBtn: "Anmelden",
  e_generic: "Das hat leider nicht geklappt.",
  retry: "Erneut versuchen",
};
const OTHER: Record<string, Partial<Record<DwKey, string>>> = { ar, bn, es, fa, fr, id, ms, ps, ru, tr, ur, zh };
export function discoverText(locale: string): Record<DwKey, string> {
  if (locale === "de") return de;
  return { ...en, ...(OTHER[locale] ?? {}) };
}
