// The usual number of a hadith loaded from fawazahmed0/hadith-api, for its label and its sunnah.com link. The text is
// always fetched by the API's own number (`hadithnumber`); only what the reader sees as the reference uses the usual one.
// - Sahih Muslim: the API counts every narration in sequence (hadith 1874), books and sunnah.com cite the numbering of
//   Muhammad Fu'ad 'Abd al-Baqi (Muslim 804). The API gives that number as `arabicnumber` and the narrations under one
//   number as two decimals: "804.01" is sunnah.com 804a, "804.02" is 804b (up to ".26" = z), "805" stays 805 (checked
//   against sunnah.com's in-book references on 2026-10-22: 804a, 805, 1102c, 1211z, 3033b). Where the API gives none
//   (the introduction and a few narrations), no number is shown and the link goes to the API file the text came from.
// - The other collections of the API already use the usual numbering (hadithnumber = arabicnumber in their Arabic
//   editions).
// Shared by the website (feed, carousels, learning journey) and the app (copied to mobile/src/web by sync-web).

export const HADITH_API_EDITIONS = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
/** the sunnah.com path of each hadith-api collection */
export const SUNNAH_COM_SLUG: Record<string, string> = {
  bukhari: "bukhari", muslim: "muslim", abudawud: "abudawud", tirmidhi: "tirmidhi", nasai: "nasai", ibnmajah: "ibnmajah",
  malik: "malik", nawawi: "nawawi40", qudsi: "qudsi40", dehlawi: "shahwaliullah40",
};

/** `label`: the number readers cite ("804"); `sunnah`: the narration on sunnah.com ("804a") */
export type UsualHadithNumber = { label: string; sunnah: string };

/** the usual number of hadith `n` of a hadith-api collection (`arabicnumber` from the API's answer); null when the API
 *  gives Sahih Muslim none: then the label carries no number (never the API's own count) */
export function usualHadithNumber(collection: string, n: number, arabicnumber?: number | string | null): UsualHadithNumber | null {
  if (collection !== "muslim") return Number.isInteger(n) && n > 0 ? { label: String(n), sunnah: String(n) } : null;
  const m = /^(\d+)(?:\.(\d{2}))?$/.exec(String(arabicnumber ?? "").trim());
  const sub = m?.[2] ? Number(m[2]) : 0;
  if (!m || Number(m[1]) < 1 || sub > 26) return null;
  return { label: m[1], sunnah: sub ? `${m[1]}${String.fromCharCode(96 + sub)}` : m[1] };
}

/** "Sahih Muslim 804"; the collection's name alone when there is no usual number */
export const hadithLabel = (name: string, num: UsualHadithNumber | null): string => (num ? `${name} ${num.label}` : name);

/** the sunnah.com page of the narration; without a usual number the API file of `edition` the text was loaded from */
export function hadithLink(collection: string, n: number, num: UsualHadithNumber | null, edition = `eng-${collection}`): string {
  const slug = SUNNAH_COM_SLUG[collection];
  return slug && num ? `https://sunnah.com/${slug}:${num.sunnah}` : `${HADITH_API_EDITIONS}/${edition}/${n}.json`;
}
