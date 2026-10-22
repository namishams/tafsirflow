import { VERSE_COUNTS } from "../counts";

// Text helpers of the tutor: normalising, tokens for retrieval, and the scripture references found in a text.

/** lower case, without Latin accents, Arabic harakat, tatweel and transliteration marks */
export function fold(text: string): string {
  return text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
    .replace(/[ʿʾ'’‘`´]/g, "")
    .replace(/ß/g, "ss");
}

const STOP = new Set([
  // en
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are", "was", "were", "be", "been", "it", "its", "this", "that", "these", "those",
  "what", "why", "how", "who", "whom", "which", "when", "where", "do", "does", "did", "can", "could", "should", "would", "will", "i", "me", "my", "you", "your",
  "we", "our", "he", "she", "they", "them", "his", "her", "their", "with", "as", "at", "by", "from", "about", "into", "not", "no", "yes", "if", "so", "but",
  "there", "than", "then", "also", "more", "most", "very", "just", "please", "tell", "explain", "mean", "means", "meaning", "say", "says", "said",
  // de
  "der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "einer", "und", "oder", "von", "zu", "zum", "zur", "im", "in", "ist", "sind", "war",
  "was", "wie", "wer", "warum", "wieso", "weshalb", "welche", "welcher", "welches", "wann", "wo", "ich", "mir", "mich", "mein", "sie", "ihr", "ihre", "wir",
  "uns", "es", "er", "mit", "auf", "für", "fur", "an", "am", "bei", "aus", "nicht", "kein", "keine", "auch", "noch", "nur", "sehr", "bitte", "erklären",
  "erklaren", "bedeutet", "bedeutung", "heißt", "heisst", "man", "kann", "soll", "dass", "über", "uber",
  // ar (folded)
  "في", "من", "علي", "الي", "عن", "ما", "ماذا", "لماذا", "كيف", "هل", "هو", "هي", "ان", "او", "و", "ثم", "هذا", "هذه", "ذلك", "التي", "الذي",
]);

/** a light stem: plural / verb endings of English and German (good enough for keyword retrieval) */
function stem(w: string): string {
  if (/^[a-z]+$/.test(w)) {
    if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
    if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
    if (w.length > 4 && w.endsWith("es")) return w.slice(0, -2);
    if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
    if (w.length > 5 && /(en|er|em)$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
    if (w.length > 4 && w.endsWith("e")) return w.slice(0, -1);
  }
  // Arabic: the article
  if (/^ال[؀-ۿ]{3,}$/.test(w)) return w.slice(2);
  return w;
}

/** tokens for retrieval: folded words without stop words, stemmed; "wudu'" and "wudu" become one token */
export function tokens(text: string): string[] {
  const out: string[] = [];
  for (const raw of fold(text).split(/[^\p{L}\p{N}]+/u)) {
    // single Arabic letters stay (a question about ض must find the lessons on ض)
    if (!raw || (raw.length < 2 && !/[\u0621-\u064A]/.test(raw)) || STOP.has(raw)) continue;
    if (/^\d+$/.test(raw)) continue;
    out.push(stem(raw));
  }
  return out;
}

/** a valid verse key "s:a" (surah 1–114, ayah within the surah) */
export function isVerseKey(key: string): boolean {
  const m = /^(\d{1,3}):(\d{1,3})$/.exec(key);
  if (!m) return false;
  const s = Number(m[1]), a = Number(m[2]);
  return s >= 1 && s <= 114 && a >= 1 && a <= VERSE_COUNTS[s - 1];
}

/** verse keys named in a text: "2:255", "(Koran 7:180)", "59:22–24" (a range gives every key of it, at most 10) */
export function verseRefsIn(text: string): string[] {
  const out = new Set<string>();
  const re = /(?<![\d.:/])(\d{1,3}):(\d{1,3})(?:\s?[–-]\s?(\d{1,3}))?(?![\d:])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const s = Number(m[1]), a = Number(m[2]), to = m[3] ? Number(m[3]) : a;
    if (!isVerseKey(`${s}:${a}`)) continue;
    for (let v = a; v <= Math.min(to, a + 9); v++) if (isVerseKey(`${s}:${v}`)) out.add(`${s}:${v}`);
  }
  return [...out];
}

const HADITH_BOOKS: [RegExp, string][] = [
  [/(?:sahih\s+)?(?:al-?\s?)?bu[kc]h(?:a|ā)ri/i, "bukhari"],
  [/(?:sahih\s+)?muslim/i, "muslim"],
  [/(?:at-?\s?)?tirmi(?:dh|z)i/i, "tirmidhi"],
  [/abu\s?da(?:w|ou)u?d/i, "abudawud"],
  [/(?:an-?\s?)?nasa(?:'|ʾ)?i/i, "nasai"],
  [/ibn\s?majah?/i, "ibnmajah"],
  [/muwatt?a(?:'|ʾ)?\s?(?:imam\s)?malik/i, "malik"],
  [/nawawi(?:'?s)?\s?(?:40|forty|arba)/i, "nawawi"],
];
/** hadith references named in a text: "(al-Bukhari 2736, Muslim 2677)" → ["bukhari:2736", "muslim:2677"] */
export function hadithRefsIn(text: string): string[] {
  const out = new Set<string>();
  const re = /((?:sahih\s+)?(?:al-?\s?|at-?\s?|an-?\s?)?(?:bu[kc]h(?:a|ā)ri|muslim|tirmi(?:dh|z)i|abu\s?da(?:w|ou)u?d|nasa(?:'|ʾ)?i|ibn\s?majah?|muwatt?a(?:'|ʾ)?\s?(?:imam\s)?malik))[\s,]*(?:no\.?\s*|nr\.?\s*|hadith\s*|#\s*)?(\d{1,4})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const book = HADITH_BOOKS.find(([b]) => b.test(m![1]))?.[1];
    if (book) out.add(`${book}:${Number(m[2])}`);
  }
  return [...out];
}

export const isHadithRef = (ref: string) => /^(bukhari|muslim|tirmidhi|abudawud|nasai|ibnmajah|malik|nawawi|qudsi|ahmad):\d{1,4}$/.test(ref) || /^thaqalayn:[\w.-]+:\d{1,5}$/.test(ref);
