import { HADITH_API, HADITH_API_NAME, hadithMatn, hadithMirrors, hadithTextOf } from "@/lib/shamsContent";

// The hadith quotes of "Secrets of the Quran" ("read" and the wealth hadith), rendered from their source
// (BLUEPRINT §4: nothing typed): each carries `ref`, collection and number in fawazahmed0/hadith-api – the API's own
// number, so Sahih Muslim 804 is "muslim:1874" (lib/hadithNumber.ts). Where the API publishes the collection in the
// reader's language, the page shows that edition's text (Arabic: the Prophet's words, hadithMatn); where it does not,
// and while the source cannot be reached, it shows the item's `text`: a summary in our own words that says it is one
// ("Sinngemäß: …", "In essence: …"), never set as the wording. Hadith mentioned inside the other texts of the page are
// summarised in the same way. Used by the website (secrets/page.tsx, on the server) and the app (app/secrets.tsx),
// each with its own cached fetch.
export { HADITH_API_NAME };

// the translations hadith-api publishes for these collections (as in lib/feed/resolve.ts; Arabic always exists)
const EDITIONS: Record<string, string[]> = {
  bukhari: ["ben", "eng", "fra", "ind", "rus", "tur", "urd"],
  muslim: ["ben", "eng", "fra", "ind", "rus", "tur", "urd"],
  abudawud: ["ben", "eng", "fra", "ind", "rus", "tur", "urd"],
  tirmidhi: ["ben", "eng", "ind", "tur", "urd"],
  ibnmajah: ["ben", "eng", "fra", "ind", "tur", "urd"],
};
const PREFIX: Record<string, string> = { en: "eng", tr: "tur", ur: "urd", bn: "ben", ru: "rus", fr: "fra", id: "ind" };

/** the edition with this hadith in the reader's language ("eng-bukhari", Arabic "ara-bukhari"); null where there is none */
export function hadithEdition(ref: string, locale: string): string | null {
  const [c, n] = ref.split(":");
  if (!EDITIONS[c] || !/^\d+$/.test(n ?? "")) return null;
  if (locale === "ar") return `ara-${c}`;
  const p = PREFIX[locale];
  return p && EDITIONS[c].includes(p) ? `${p}-${c}` : null;
}

/** the wording of a hadith in the reader's language from hadith-api (Arabic: the Prophet's words in «»); null where there
 *  is no edition in this language or the source cannot be reached – then the summary is shown. `getJSON` is the
 *  caller's cached fetch. */
export async function hadithWording(ref: string, locale: string, getJSON: (url: string) => Promise<unknown>): Promise<string | null> {
  const ed = hadithEdition(ref, locale);
  if (!ed) return null;
  for (const url of hadithMirrors(`${HADITH_API}/editions/${ed}/${ref.split(":")[1]}.min.json`)) {
    try {
      const t = hadithTextOf(await getJSON(url));
      if (!t) continue;
      if (locale !== "ar") return t;
      const matn = hadithMatn(t);
      return matn ? `«${matn}»` : t;
    } catch { /* next mirror */ }
  }
  return null;
}
