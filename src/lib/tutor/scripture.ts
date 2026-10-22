import { getTafsir } from "../quran";
import { resolveHadith, resolveVerse, translationIdFor, type ResolvedHadith, type ResolvedVerse } from "../feed/resolve";
import { memo, stripHtml, withTimeout, DAY } from "../feedWeb/net";
import type { Doc } from "./corpus";
import { TUTOR_LIMITS } from "./config";
import { hadithRefsIn, verseRefsIn } from "./text";

// Scripture for the tutor, always from its sources by reference (Quran.com, hadith-api, Thaqalayn) – never written by
// the model. 1. passages for a verse the learner looks at (translation + Ibn Kathir abridged), 2. the texts of the verses
// and hadith an answer cites, shown under the answer.

const TAFSIR_EN = 169; // Ibn Kathir (abridged), English – the reader's default English tafsir

export async function verseDocs(key: string, lang: string): Promise<Doc[]> {
  const [s, a] = key.split(":");
  const link = `/surah/${s}?v=${a}`;
  const out: Doc[] = [];
  const trLang = lang === "de" ? "de" : "en";
  const tr = await translationIdFor(trLang);
  const v = await resolveVerse(key, trLang, tr).catch(() => null);
  if (v?.translation) {
    out.push({ id: `verse:${key}@${trLang}`, base: `verse:${key}`, kind: "tafsir", lang: trLang, title: `${v.chapter} ${key} – ${trLang === "de" ? "Übersetzung" : "translation"}`, text: `Translation of ${key}: ${v.translation}`, link, verses: [key], hadith: [], tradition: "all" });
  }
  const t = await memo(`tutor:tafsir:${key}`, 30 * DAY, () => withTimeout(getTafsir(TAFSIR_EN, key), 8000)).catch(() => null);
  if (t?.text) {
    const text = stripHtml(t.text).replace(/\s+\n/g, "\n").trim().slice(0, TUTOR_LIMITS.passageChars * 2);
    out.push({ id: `tafsir:${key}@en`, base: `tafsir:${key}`, kind: "tafsir", lang: "en", title: `Tafsir Ibn Kathir (abridged) – ${key}`, text, link, verses: [...new Set([key, ...(t.verseKeys ?? []), ...verseRefsIn(text)])], hadith: hadithRefsIn(text), tradition: "all" });
  }
  return out;
}

export type TutorScripture = { verses: ResolvedVerse[]; hadith: (ResolvedHadith & { id: string })[] };

/** the cited verses and hadith with their text from the sources; references that cannot be loaded are left out */
export async function resolveScripture(verses: string[], hadith: string[], lang: string): Promise<TutorScripture> {
  const tr = await translationIdFor(lang).catch(() => 0);
  const [v, h] = await Promise.all([
    Promise.all(verses.slice(0, 6).map((k) => resolveVerse(k, lang, tr).catch(() => null))),
    Promise.all(hadith.slice(0, 4).map(async (id) => { const r = await resolveHadith(id, lang).catch(() => null); return r ? { ...r, id } : null; })),
  ]);
  return { verses: v.filter((x): x is ResolvedVerse => !!x), hadith: h.filter((x): x is ResolvedHadith & { id: string } => !!x) };
}
