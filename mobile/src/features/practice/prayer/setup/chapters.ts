import { prayerShia } from "@/web/islam/prayer-shia";
import { prayerSunni } from "@/web/islam/prayer-sunni";
import type { IslamDoc } from "@/web/islam/types";

// Religious wording of the prayer setup comes from the website's chapters (src/lib/islam/prayer-shia.ts and
// prayer-sunni.ts, synced into @/web/islam), never from the app: we pick the passage and show it with its chapter.
type L = "de" | "en";

/** Markdown subset of the chapters → plain text (links keep their text, bold/italic marks go) */
const plain = (md: string) => md.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").trim();

/** first paragraph under the "## …" heading that matches */
function paragraphUnder(doc: IslamDoc, lang: L, heading: RegExp): string {
  const parts = doc[lang].body.split(/\n(?=## )/);
  const sec = parts.find((p) => heading.test(p.split("\n")[0]));
  if (!sec) return "";
  const para = sec.split("\n").slice(1).join("\n").trim().split(/\n\s*\n/)[0] ?? "";
  return plain(para);
}

export type Passage = { text: string; chapter: string; href: string };

/** Ja'fari school: Dhuhr with Asr and Maghrib with Isha may be combined (section "Prayer times and combining") */
export function combinePassage(lang: L): Passage | null {
  const text = paragraphUnder(prayerShia, lang, /Zusammenlegen|combining/i);
  return text ? { text, chapter: prayerShia[lang].title, href: `/islam/${prayerShia.slug}` } : null;
}

/** the Asr time in the four Sunni schools (list item "3. Asr" of "The five prayers and their times") */
export function asrPassage(lang: L): Passage | null {
  const line = prayerSunni[lang].body.split("\n").find((l) => /^3\. \*\*Asr\*\*/.test(l));
  return line ? { text: plain(line.replace(/^3\.\s*/, "")), chapter: prayerSunni[lang].title, href: `/islam/${prayerSunni.slug}` } : null;
}

/** "the prayer of Shia and Sunni Muslims is essentially the same prayer" (first section of the Shia chapter) */
export function samePrayerPassage(lang: L): Passage | null {
  const para = prayerShia[lang].body.split(/\n\s*\n/).find((x) => /dasselbe Gebet|essentially the same prayer/.test(x));
  const sentence = para?.split(/(?<=[.!?])\s+/).find((x) => /dasselbe Gebet|essentially the same prayer/.test(x));
  if (!sentence) return null;
  const text = plain(sentence.replace(/^[^:]*:\s*/, ""));
  return { text: text.charAt(0).toUpperCase() + text.slice(1), chapter: prayerShia[lang].title, href: `/islam/${prayerShia.slug}` };
}
