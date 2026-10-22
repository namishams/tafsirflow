// The texts behind the references of the adab pillar on the website, loaded in the browser only when a reader asks for
// them: hadith from hadith-api (fawazahmed0, The Unlicense) and from the Thaqalayn API, in the way resolveHadith
// (src/lib/feed/resolve.ts) and the app's content/sources/hadith.ts load them. Nothing is typed here; the label and the
// sunnah.com link use the usual number (lib/hadithNumber.ts). Kept in memory for the visit.
import { hadithLabel, usualHadithNumber } from "@/lib/hadithNumber";

const CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const RAW = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions";
const TQ = "https://www.thaqalayn-api.net/api/v2";
const NAMES: Record<string, string> = { bukhari: "Sahih al-Bukhari", muslim: "Sahih Muslim", abudawud: "Sunan Abi Dawud", tirmidhi: "Jamiʿ at-Tirmidhi", nasai: "Sunan an-Nasaʾi", ibnmajah: "Sunan Ibn Majah", malik: "Muwatta Malik" };
// translation editions hadith-api publishes per collection (as in resolveHadith); English otherwise
const EDS: Record<string, string[]> = {
  bukhari: ["ben", "eng", "fra", "ind", "rus", "tur", "urd"], muslim: ["ben", "eng", "fra", "ind", "rus", "tur", "urd"], abudawud: ["ben", "eng", "fra", "ind", "rus", "tur", "urd"],
  tirmidhi: ["ben", "eng", "ind", "tur", "urd"], nasai: ["ben", "eng", "fra", "ind", "tur", "urd"], ibnmajah: ["ben", "eng", "fra", "ind", "tur", "urd"], malik: ["ben", "eng", "fra", "ind", "tur", "urd"],
};
const PREFIX: Record<string, string> = { en: "eng", tr: "tur", ur: "urd", bn: "ben", ru: "rus", fr: "fra", id: "ind" };

export type LoadedText = { arabic?: string; text: string; ref: string; grade?: string };

const mem = new Map<string, Promise<unknown>>();
function json<T>(urls: string[]): Promise<T> {
  const key = urls[0];
  if (!mem.has(key)) {
    const p = (async () => {
      for (const u of urls) {
        try { const r = await fetch(u, { headers: { Accept: "application/json" } }); if (r.ok) return (await r.json()) as T; } catch { /* next source */ }
      }
      throw new Error("offline");
    })();
    p.catch(() => mem.delete(key));
    mem.set(key, p);
  }
  return mem.get(key) as Promise<T>;
}

type Doc = { hadiths: { hadithnumber: number; arabicnumber?: number | string | null; text: string; grades?: { name: string; grade: string }[] }[] };
const one = (ed: string, n: number) => json<Doc>([`${CDN}/${ed}/${n}.min.json`, `${RAW}/${ed}/${n}.json`]).then((d) => d.hadiths[0]).catch(() => undefined);

/** one hadith of a Sunni collection by its hadith-api number */
export async function loadSunni(c: string, n: number, lang: string): Promise<LoadedText | null> {
  if (!NAMES[c]) return null;
  const p = PREFIX[lang];
  const trEd = lang === "ar" ? null : `${p && EDS[c].includes(p) ? p : "eng"}-${c}`;
  const [ar, local] = await Promise.all([one(`ara-${c}`, n), trEd ? one(trEd, n) : Promise.resolve(undefined)]);
  let tr = local;
  if (trEd && !trEd.startsWith("eng-") && !(tr?.text ?? "").trim()) tr = await one(`eng-${c}`, n);
  const text = (tr?.text ?? "").trim(), arabic = (ar?.text ?? "").trim();
  if (!arabic && !text) return null;
  const g = (tr?.grades ?? ar?.grades ?? []).find((x) => x.grade);
  return { arabic: arabic || undefined, text, ref: hadithLabel(NAMES[c], usualHadithNumber(c, n, ar?.arabicnumber ?? tr?.arabicnumber)), grade: g ? `${g.grade} (${g.name})` : undefined };
}

type Tq = { id: number; book: string; chapter?: string; englishText?: string; arabicText?: string; frenchText?: string };
/** one narration of a Thaqalayn book (al-Kāfī …) */
export async function loadShia(book: string, n: number, lang: string, cite: string): Promise<LoadedText | null> {
  const h = await json<Tq>([`${TQ}/${encodeURIComponent(book)}/${n}`]);
  const br = (s?: string | null) => (s ?? "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
  const text = lang === "ar" ? "" : (lang === "fr" && br(h.frenchText)) || br(h.englishText);
  const arabic = br(h.arabicText);
  if (!arabic && !text) return null;
  return { arabic: arabic || undefined, text, ref: `${cite} · thaqalayn.net` };
}
