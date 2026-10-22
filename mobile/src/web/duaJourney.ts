// The guided "personal dua" journey (website DuaJourney.tsx, app features/duaJourney): a few gentle questions, then
// a dua built around authentic duas of the Quran and the Sunnah (shown by reference from their data sources: the Quran
// through the Quran.com API, the Sunnah from sunnahDuas) with personal words for the situation. Only the personal
// words may be composed by AI (server, POST /api/dua-generator with v: 2); they are always marked as personal words and
// as composed with AI. Nothing here is ever presented as revelation or as words of Allah or of the Prophet ﷺ.
// Pure module (no server, React or Next.js code): copied into the app by mobile/scripts/sync-web.mjs.
import { PLAN, TOPICS, type Topic } from "./duaGenerator";

/** what brings the person to dua (question 1) */
export const OCCASIONS = ["hardship", "hope", "thanks", "begin", "closer", "other"] as const;
export type Occasion = (typeof OCCASIONS)[number];

/** for whom (question 2): the generator's WHO plus spouse and friend */
export const WHO_J = ["me", "mother", "father", "parents", "spouse", "child", "friend", "loved", "ummah"] as const;
export type WhoJ = (typeof WHO_J)[number];

/** the direction (question 3); each points to the generator's concern (PLAN) whose authentic duas carry the dua */
export const DIRECTIONS = ["forgiveness", "provision", "health", "family", "guidance", "exams", "grief", "gratitude", "worry", "heart", "protection", "travel", "deceased"] as const;
export type Direction = (typeof DIRECTIONS)[number];
/** one Arabic word per direction for the tiles (a plain word, not a quotation) */
export const DIRECTION_AR: Record<Direction, string> = {
  forgiveness: "مَغْفِرَة", provision: "رِزْق", health: "شِفَاء", family: "أُسْرَة", guidance: "هِدَايَة", exams: "عِلْم", grief: "صَبْر",
  gratitude: "شُكْر", worry: "طُمَأْنِينَة", heart: "ثَبَات", protection: "حِفْظ", travel: "سَفَر", deceased: "رَحْمَة",
};
export function topicFor(d: Direction, who: WhoJ): Topic {
  switch (d) {
    case "health": return "illness";
    case "exams": return "knowledge";
    case "grief": return "worry";
    case "family": return who === "child" ? "children" : who === "mother" || who === "father" || who === "parents" ? "parents" : "marriage";
    default: return d as Topic;
  }
}
/** a direction for a concern the generator was opened with (?topic=… from the feed) */
export function directionFor(topic: string | null | undefined): Direction | null {
  if (!topic || !(TOPICS as readonly string[]).includes(topic)) return null;
  const map: Partial<Record<Topic, Direction>> = { illness: "health", knowledge: "exams", parents: "family", children: "family", marriage: "family" };
  return map[topic as Topic] ?? ((DIRECTIONS as readonly string[]).includes(topic) ? (topic as Direction) : null);
}

/** preferred length (question 5): sentences of the personal words and the token budget */
export const LENGTHS = ["short", "medium", "long"] as const;
export type DuaLength = (typeof LENGTHS)[number];
export const LENGTH_RULE: Record<DuaLength, { min: number; max: number; tokens: number; chars: number }> = {
  short: { min: 2, max: 3, tokens: 220, chars: 520 },
  medium: { min: 3, max: 5, tokens: 380, chars: 900 },
  long: { min: 5, max: 8, tokens: 600, chars: 1500 },
};

/** the languages of the personal words (question 6): every language the site speaks, named in itself */
export const DUA_LANGS: [string, string][] = [
  ["en", "English"], ["de", "Deutsch"], ["ar", "العربية"], ["tr", "Türkçe"], ["ur", "اردو"], ["fa", "فارسی (دری)"], ["ps", "پښتو"],
  ["fr", "Français"], ["es", "Español"], ["id", "Bahasa Indonesia"], ["ms", "Bahasa Melayu"], ["bn", "বাংলা"], ["ru", "Русский"], ["zh", "中文"],
];
export const isDuaLang = (l: string) => DUA_LANGS.some(([c]) => c === l);
/** languages written in Arabic script (an Arabic version of the personal words is then not offered separately) */
export const ARABIC_SCRIPT = new Set(["ar", "ur", "fa", "ps"]);

/** the authentic duas the dua is built around: the first Quran dua and the first Sunnah dua of the concern */
export function anchorsFor(topic: Topic): { quran: string; sunnah: string | null } {
  const p = PLAN[topic];
  return { quran: p.quran[0], sunnah: p.sunnah[0] ?? null };
}

/** the steps of the journey; the landscape behind it dawns as they are answered */
export const STEPS = ["intro", "why", "who", "direction", "situation", "length", "language", "ready", "reveal", "card"] as const;
export type Step = (typeof STEPS)[number];
export const QUESTION_STEPS: Step[] = ["why", "who", "direction", "situation", "length", "language"];
export function dawnOf(step: Step): number {
  const i = QUESTION_STEPS.indexOf(step);
  if (step === "intro") return 0.05;
  if (i >= 0) return 0.12 + (i / QUESTION_STEPS.length) * 0.62;
  return step === "ready" ? 0.8 : 1;
}

/** the timeline of the reveal (ms): the niche draws, light gathers into the lantern, the tree grows, the word appears,
 *  then the lines of the dua. The reveal never ends before the server has answered. */
export const REVEAL = { niche: 1400, gather: 2600, tree: 3600, word: 4600, lines: 5600, min: 6800, line: 520 } as const;
/** stages the small tree passes through during the reveal (TreeArt stages) */
export const REVEAL_TREE = [0, 1, 2, 3, 4, 5] as const;

// ---- the reveal scene, drawn the same on the website (SVG) and in the app (react-native-svg); viewBox 0 0 300 360 ----
/** the niche (mihrab) arch outline */
export const NICHE_PATH = "M40 352 L40 168 C40 92 92 44 150 20 C208 44 260 92 260 168 L260 352";
export const NICHE_INNER = "M62 352 L62 176 C62 112 104 70 150 48 C196 70 238 112 238 176 L238 352";
export const NICHE_LEN = 840;
/** the lantern hanging from the apex of the niche (chain, cap, glass, base) */
export const LANTERN = {
  chain: "M150 20 L150 70",
  cap: "M136 78 L150 66 L164 78 Z",
  body: "M134 80 L166 80 L172 104 L162 128 L138 128 L128 104 Z",
  base: "M140 130 L160 130 L156 138 L144 138 Z",
  cx: 150, cy: 104,
};
/** a leaf (drawn at the origin, about 18 × 8) */
export const LEAF_PATH = "M0 0 C5 -5 13 -5 18 0 C13 5 5 5 0 0 Z";

// ---- saved duas (favourites): only on this device ----
export const MY_DUAS_KEY = "tf:mydua";
export const MY_DUAS_MAX = 60;
/** the AI consent (version); asked once before the first personal words are composed */
export const DUA_AI_CONSENT_KEY = "tf:duaAiOk";
export const DUA_AI_CONSENT_VERSION = 1;

export type SavedDua = {
  id: string;
  at: number;
  direction: Direction;
  topic: Topic;
  who: WhoJ;
  lang: string;
  /** the personal words in the chosen language */
  personal: string;
  /** the personal words in Arabic (optional) */
  arabic?: string;
  /** true when the personal words were composed with AI */
  ai: boolean;
  quran: string;
  sunnah: string | null;
  names: string[];
};

// ---- checks of the personal words (server; kept here so they can be tested and read next to the rules) ----
const URL_RE = /(https?:\/\/|www\.|\.com\b|\.org\b|@)/i;
const EMOJI_RE = /\p{Extended_Pictographic}/u;
/** a verse or hadith number such as 2:255 or (Bukhari 123) */
const REF_RE = /\b\d{1,3}\s*[:：]\s*\d{1,3}\b|\(\s*\d{2,5}\s*\)/;
/** words that would turn personal words into a quotation or a claim about the sources, or mention the machine */
const QUOTE_WORDS = /\b(qur'?an|koran|coran|corán|hadith|hadis|hadiz|sura|surah|ayah|ayat|verse|versículo|verset|sunnah|bukhari|muslim said|tirmidhi|chatgpt|openai|artificial intelligence|künstliche intelligenz|ai model)\b|allah (says|said|sagt|sprach)|the prophet (said|says)|der prophet (sagte|sprach)/i;
const QUOTE_AR = /قال الله|قال تعالى|قال رسول|قال النبي|حديث|سورة|آية|القرآن|قرآن|﴿|﴾/;
const ARABIC_LETTERS = /[؀-ۿݐ-ݿࢠ-ࣿ]/g;
/** harmful requests: curses against people, asking for harm (several languages); the server also asks OpenAI moderation */
const HARM_LATIN = /\b(curse (him|her|them|my|his|their|on|upon)|damn (him|her|them)|destroy (him|her|them)|kill (him|her|them)|death to|punish (him|her|them)|make (him|her|them) (suffer|sick|die|poor|fail)|verfluche|vernichte (ihn|sie)|bestrafe (ihn|sie)|lass (ihn|sie) (leiden|sterben|krank)|tod (ihm|ihr|ihnen)|maudis|maudire|maldice|maldigo|maldición|lanet olsun|beddua|beddua|kahret|laknat|kutuk)\b/i;
const HARM_OTHER = /прокля|убей|اللهم (العن|اهلك|أهلك|دمر|اقتل)|لعنة|ادع على|بددعا|نفرین|诅咒/;
export const looksHarmful = (s: string) => HARM_LATIN.test(s) || HARM_OTHER.test(s);

export type PersonalCheck = { ok: true } | { ok: false; why: string };
/** the personal words: length, no links, emojis, numbers of verses or hadith, quotations or claims about the sources,
 *  no Arabic letters in a language not written in Arabic script */
export function checkPersonal(text: string, lang: string, len: DuaLength): PersonalCheck {
  const t = text.trim();
  if (t.length < 25) return { ok: false, why: "short" };
  if (t.length > LENGTH_RULE[len].chars + 200) return { ok: false, why: "long" };
  if (URL_RE.test(t)) return { ok: false, why: "link" };
  if (EMOJI_RE.test(t)) return { ok: false, why: "emoji" };
  if (REF_RE.test(t)) return { ok: false, why: "reference" };
  if (QUOTE_WORDS.test(t) || QUOTE_AR.test(t)) return { ok: false, why: "quote" };
  if (/["“”„«»]/.test(t) && /["“”„«»][^"“”„«»]{40,}["“”„«»]/.test(t)) return { ok: false, why: "quote" };
  if (!ARABIC_SCRIPT.has(lang) && (t.match(ARABIC_LETTERS) ?? []).length > 0) return { ok: false, why: "arabic" };
  if (looksHarmful(t)) return { ok: false, why: "harm" };
  return { ok: true };
}
/** the Arabic version of the personal words: mostly Arabic letters, no quotation marks of the Quran, no claims */
export function checkArabic(text: string): PersonalCheck {
  const t = text.trim();
  if (t.length < 15 || t.length > 1600) return { ok: false, why: "length" };
  const letters = (t.match(/\p{L}/gu) ?? []).length;
  if (!letters || (t.match(ARABIC_LETTERS) ?? []).length / letters < 0.9) return { ok: false, why: "script" };
  if (URL_RE.test(t) || EMOJI_RE.test(t) || REF_RE.test(t) || QUOTE_AR.test(t)) return { ok: false, why: "quote" };
  if (looksHarmful(t)) return { ok: false, why: "harm" };
  return { ok: true };
}

/** one line of plain text for copying or sharing (the authentic lines are added by the caller with their references) */
export const splitLines = (s: string) => s.split(/(?<=[.!?؟。！？۔])\s+/u).map((x) => x.trim()).filter(Boolean);
