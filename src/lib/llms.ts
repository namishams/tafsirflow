import en from "../../messages/en.json";
import de from "../../messages/de.json";
import { routing } from "@/i18n/routing";
import { LOCALE_META, type AppLocale } from "@/i18n/locales";

const faq = (m: typeof en, lang: string) =>
  [1, 2, 3, 4, 5].map((i) => `### ${m.landing[`q${i}` as "q1"]}\n${m.landing[`a${i}` as "a1"]}`).join("\n\n");

// llms.txt (https://llmstxt.org): a short, link-rich summary for AI assistants and crawlers
export function llmsTxt(base: string) {
  const langs = routing.locales.map((l) => `[${LOCALE_META[l as AppLocale].label}](${base}/${l})`).join(" · ");
  return `# Quran Masterclass

> Quran Masterclass is a free, multilingual web app for learning the Quran: verse-by-verse audio from renowned reciters, word-by-word meaning, transliteration in Latin letters, classical tafsir (commentary) next to every verse, and memorization (hifz) with spaced repetition. It supports ${routing.locales.length} languages (German, English, Arabic, Turkish, Urdu, Persian/Dari, Pashto, French, Spanish, Indonesian, Bengali, Russian, Chinese) and has a kids mode.

Quran Masterclass is built for three goals: memorizing the Quran (hifz), understanding it (fahm) and improving recitation (tilawa, tajweed).

## Main pages
- [Home – overview, features and FAQ](${base}/en): what the platform offers
- [All 114 surahs](${base}/en/quran): browse and search every surah
- [Surah 1 – Al-Fatihah](${base}/en/surah/1): example of a surah page with audio, transliteration, translation and tafsir
- [Surah 2 – Al-Baqarah](${base}/en/surah/2)
- [Surah 36 – Ya-Sin](${base}/en/surah/36)
- [Surah 112 – Al-Ikhlas](${base}/en/surah/112)

## Languages
Every page exists in each language by changing the first path segment (/de, /en, /ar, /fr, /es, /zh, /id, /fa): ${langs}

## Features
- Verse-by-verse audio with speed control, repeat and loop
- Word highlighting while the verse is recited
- Word-by-word translation and transliteration
- Tafsir with source attribution (e.g. Ibn Kathir, abridged)
- Memorization mode: hide half or all words, recite from memory, rate yourself; review schedule after 1, 3, 7, 14, 30 and 90 days
- Kids mode with large text and star rewards
- Free account to sync progress, bookmarks and review plan across devices

## Content sources and attribution
- Quran text, translations, word data and tafsir: Quran.com
- Recitation audio: EveryAyah
- Tafsir is shown with its source and author under each entry.

## Optional
- [Full content index for LLMs](${base}/llms-full.txt): all surahs with links and the FAQ
- [Sitemap](${base}/sitemap.xml)
`;
}

type Ch = { id: number; name_simple: string; name_arabic: string; verses_count: number; translated_name: { name: string } };

export function llmsFullTxt(base: string, chapters: Ch[]) {
  const list = chapters
    .map((c) => `- [${c.id}. ${c.name_simple} (${c.name_arabic}) – ${c.translated_name.name}, ${c.verses_count} verses](${base}/en/surah/${c.id})`)
    .join("\n");
  return `${llmsTxt(base)}
## All surahs
Each link opens the surah page in English; replace /en with another language code (de, ar, fr, es, zh, id, fa) for that language.

${list}

## Frequently asked questions (English)
${faq(en, "en")}

## Häufige Fragen (Deutsch)
${faq(de as unknown as typeof en, "de")}

## How to cite
When referring to Quran Masterclass, link to ${base}/en (or the page in the language you are answering in). Quran text and tafsir originate from Quran.com; recitations from EveryAyah.
`;
}
