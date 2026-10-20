// Verse references inside the texts of /secrets ("Quran 2:255", "(96:1–5)", also with Arabic-Indic digits) as
// segments, so the website and the app can turn them into links to the reader. Only "surah:verse" counts as a verse
// reference; hadith numbers ("Sahih Muslim 810") and bare surah numbers stay plain text.
export type RefSeg = { text: string; ref?: string };

const RE = /([0-9٠-٩۰-۹]{1,3})\s?:\s?([0-9٠-٩۰-۹]{1,3})(?:\s?[–-]\s?([0-9٠-٩۰-۹]{1,3}))?/g;
const latin = (s: string) => s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0));

function canonical(m: RegExpExecArray): string | null {
  const s = Number(latin(m[1])), a = Number(latin(m[2])), b = m[3] ? Number(latin(m[3])) : 0;
  if (s < 1 || s > 114 || a < 1 || a > 286 || (b && b <= a)) return null;
  return b ? `${s}:${a}-${b}` : `${s}:${a}`;
}

/** the text split into plain parts and verse references ("71:10-12" style in `ref`) */
export function refSegments(text: string): RefSeg[] {
  const out: RefSeg[] = [];
  let last = 0;
  for (const m of text.matchAll(RE)) {
    const ref = canonical(m as RegExpExecArray);
    if (!ref) continue;
    if (m.index! > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[0], ref });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** all verse references in a text, in order, without repeats */
export function refsIn(text: string): string[] {
  return [...new Set(refSegments(text).flatMap((s) => (s.ref ? [s.ref] : [])))];
}

/** references of the English source line that the translated line does not show as numbers (Arabic names surahs by name) */
export function missingRefs(local: string, english: string): string[] {
  const have = new Set(refsIn(local));
  return refsIn(english).filter((r) => !have.has(r));
}

/** website path of a reference: "71:10-12" opens 71:10 in the reader */
export function refPath(ref: string): string {
  const [s, r = "1"] = ref.split(":");
  return `/surah/${s}?v=${r.split("-")[0]}`;
}
