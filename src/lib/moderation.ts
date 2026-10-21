import { pool } from "./db";

// Islam-conform comment moderation.
// 1. HARD block (comment is rejected at once, the author gets a strike): profanity, sexual language, blasphemy / mockery of
//    Allah, the Prophets and the Quran, hate and takfir slurs, links, e-mail/phone numbers (spam, contact fishing).
// 2. SOFT flag (goes to the review queue marked): rulings ("fatwa", "haram", "bid'ah"), damnation talk, politics.
// 3. Everything else is held for review as well; nothing is public until the admin approves (unless auto-approve is on).
// The lists are a starting point; the admin extends them in the Moderation tab (stored in settings.filter).

const BLOCK: string[] = [
  // profanity / sexual (en)
  "fuck", "shit", "bitch", "bastard", "asshole", "dick", "pussy", "cunt", "whore", "slut", "porn", "nude", "sex", "horny", "nigger", "faggot", "retard",
  // de
  "scheisse", "scheiße", "arschloch", "fotze", "hurensohn", "wichser", "schlampe", "ficken", "fick dich", "nutte", "schwuchtel", "missgeburt", "fotze",
  // fr / es / tr / ru / ur transliterations
  "merde", "putain", "salope", "connard", "encule", "enculé", "puta", "mierda", "cabron", "cabrón", "pendejo", "joder", "coño",
  "orospu", "siktir", "amk", "piç", "gerizekalı", "yarrak", "göt", "bokuntu",
  "blyat", "suka", "pidor", "hui", "хуй", "сука", "блядь", "пизда", "пидор",
  "madarchod", "behenchod", "bhosdi", "chutiya", "harami", "haramzada", "kutta", "kanjri", "lanti",
  // ar
  "كس امك", "كسمك", "ابن الشرموطة", "شرموطة", "عرص", "منيوك", "نيك", "زب", "ابن الكلب", "يلعن", "لعنة الله على الاسلام",
  // blasphemy / mockery of the sacred
  "fuck allah", "fuck islam", "fuck muhammad", "fuck quran", "fuck the quran", "allah is fake", "quran is fake", "quran is a lie", "muhammad was a pedophile", "prophet was a pedophile",
  "islam ist scheiße", "islam ist scheisse", "koran ist scheiße", "koran ist scheisse", "allah ist ein", "mohammed war ein", "burn the quran", "koran verbrennen",
  "اسب الله", "سب الدين", "سب النبي", "القرآن كذب", "قرآن جھوٹ", "kuran yalan", "allah yok",
  // hate / takfir slurs / sectarian insults
  "kuffar scum", "kafir scum", "death to", "tod den", "terrorist muslims", "muslim terrorist", "sunni scum", "shia scum", "rafidi", "rafida", "nasibi", "wahhabi scum", "munafiq scum", "murtad scum",
  "kill all", "alle töten", "jew scum", "zionist pig", "nazi", "heil hitler",
  // gambling / alcohol / drug promotion & spam
  "casino", "betting", "bet365", "poker", "viagra", "bitcoin", "crypto", "forex", "onlyfans", "telegram", "whatsapp me", "dm me", "follow me", "subscribe to my",
];

const SOFT: string[] = [
  "fatwa", "fatwā", "haram", "bidah", "bid'ah", "bid’ah", "kufr", "shirk", "mushrik", "hellfire", "go to hell", "will burn", "kommt in die hölle", "verbrannt", "politic", "politik", "israel", "palestine", "palästina", "trump", "election",
  "فتوى", "حرام", "بدعة", "كفر", "شرك", "النار",
];

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i", "+": "t", "€": "e", "ß": "ss" };

export function normalize(text: string): string {
  let s = text.normalize("NFKD").toLowerCase();
  s = s.replace(/[̀-ͯؐ-ًؚ-ٰٟۖ-ۭـ]/g, ""); // Latin accents, Arabic harakat, tatweel
  s = s.replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[ڪک]/g, "ك").replace(/[ہھ]/g, "ه").replace(/[یې]/g, "ي");
  s = s.replace(/[0134578@$!+€ß]/g, (c) => LEET[c] ?? c);
  s = s.replace(/(.)\1{2,}/g, "$1$1"); // fuuuuck -> fuuck
  return s.replace(/\s+/g, " ").trim();
}

const compact = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, "");
const isLatin = (w: string) => /^[a-z' ’]+$/.test(w);

function build(words: string[]) {
  return words.map((w) => normalize(w)).filter(Boolean).map((w) => {
    const c = compact(w).replace(/(.)\1{2,}/g, "$1$1");
    return { w, c, latin: isLatin(w), multi: w.includes(" ") };
  });
}

function matches(text: string, list: ReturnType<typeof build>): string | null {
  const n = normalize(text);
  const raw = n.split(/[^\p{L}\p{N}'’]+/u).filter(Boolean);
  // "f u c k" -> "fuck": runs of single letters are joined into one token
  const tokens: string[] = [];
  let run = "";
  for (const tk of raw) {
    if (/^\p{L}$/u.test(tk)) { run += tk; continue; }
    if (run) { tokens.push(run); run = ""; }
    tokens.push(tk);
  }
  if (run) tokens.push(run);
  const set = new Set(tokens);
  const collapse = (x: string) => x.replace(/(.)\1+/gu, "$1");
  const collapsed = new Set(tokens.map(collapse));
  const joined = " " + tokens.join(" ") + " ";
  const c = compact(n).replace(/(.)\1{2,}/g, "$1$1");
  for (const e of list) {
    if (e.multi) { if (joined.includes(" " + e.w + " ")) return e.w; continue; }
    if (e.latin) {
      // whole-word match avoids the "Scunthorpe problem"; long words are also caught when letters are spaced out (f u c k)
      if (e.w.length >= 4 && collapsed.has(collapse(e.w))) return e.w;
      if (set.has(e.w) || set.has(e.w + "s") || set.has(e.w + "ing") || set.has(e.w + "ed")) return e.w;
      if (e.c.length >= 5 && c.includes(e.c)) return e.w;
    } else if (set.has(e.w) || (e.w.length >= 6 && n.includes(e.w))) return e.w; // short Arabic/Cyrillic words: whole token only
  }
  return null;
}

export type Verdict = { ok: true; flagged: string | null } | { ok: false; reason: "links" | "contact" | "word" | "length" | "caps" | "repeat"; hit?: string };

export async function filterWords(): Promise<{ block: string[]; soft: string[] }> {
  try {
    const r = await pool()?.query("SELECT value FROM settings WHERE key = 'filter'");
    const v = r?.rows[0]?.value ?? {};
    return { block: Array.isArray(v.block) ? v.block : [], soft: Array.isArray(v.soft) ? v.soft : [] };
  } catch {
    return { block: [], soft: [] };
  }
}

export async function moderate(raw: string): Promise<Verdict> {
  const body = raw.trim();
  if (body.length < 2 || body.length > 500) return { ok: false, reason: "length" };
  if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|me|ly|tv|ru|cn|xyz|info|co|de|ae|pk|ir|tr)\b)/i.test(body)) return { ok: false, reason: "links" };
  if (/[\w.+-]+\s*(@|\(at\))\s*[\w-]+\s*(\.|\(dot\))\s*\w+/i.test(body) || /(?:\+?\d[\s().-]*){8,}/.test(body)) return { ok: false, reason: "contact" };
  const letters = body.replace(/[^\p{L}]/gu, "");
  if (letters.length > 12 && body.replace(/[^A-ZÄÖÜ]/g, "").length / letters.length > 0.7) return { ok: false, reason: "caps" };
  if (/(.{3,})\1{4,}/.test(body)) return { ok: false, reason: "repeat" };
  const extra = await filterWords();
  const hard = matches(body, build([...BLOCK, ...extra.block]));
  if (hard) return { ok: false, reason: "word", hit: hard };
  const soft = matches(body, build([...SOFT, ...extra.soft]));
  return { ok: true, flagged: soft };
}

export const MAX_STRIKES = 5;

// Second opinion by an AI model (OpenAI) after the word filter. It decides whether a comment may go live by itself:
// "approve" – respectful and fitting; "review" – unclear, a human moderator decides; "reject" – clearly against the rules.
// Without OPENAI_API_KEY (or if the service fails) everything stays in the human review queue, as before.
export type AiVerdict = { decision: "approve" | "review" | "reject"; reason: string };
const AI_RULES = `You moderate comments on verses of the Quran on quranmasterclass.com, a respectful Islamic learning platform from the UAE.
Decide for ONE comment and answer only with JSON: {"decision":"approve"|"review"|"reject","reason":"<max 12 words, English>"}.
approve: respectful reflections, questions, du'a, thanks, personal lessons, short praise – in any language.
review: unclear meaning, religious rulings stated as facts that may be wrong or disputed, debates between schools, anything you are unsure about.
reject: insults or mockery of Allah, the Prophet ﷺ, the Quran, any prophet, Companions, Ahl al-Bayt, scholars, schools of thought, sects or religions; takfir; hate, harassment, sexual content, violence or extremism; politics and propaganda; advertising, spam, links or contact details; off-topic chatter; gibberish.
When in doubt choose review, never approve.`;

export async function aiReview(text: string): Promise<AiVerdict | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODERATION_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0,
        max_tokens: 60,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: AI_RULES }, { role: "user", content: text.slice(0, 1500) }],
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) return null;
    const d = (await r.json()) as { choices?: { message?: { content?: string } }[] };
    const v = JSON.parse(d.choices?.[0]?.message?.content ?? "{}") as Partial<AiVerdict>;
    if (v.decision !== "approve" && v.decision !== "review" && v.decision !== "reject") return null;
    return { decision: v.decision, reason: String(v.reason ?? "").slice(0, 120) };
  } catch {
    return null;
  }
}
