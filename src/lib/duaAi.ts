// Server: the personal words of the guided dua journey (POST /api/dua-generator with v: 2), composed by the OpenAI mini
// model at a low temperature, with moderation before and after, and checked on the server (duaJourney.ts: no quotations,
// no verse or hadith numbers, no claims about the sources, the right script, the chosen length). The authentic duas of
// the Quran and the Sunnah are never written by the model: the app and the website show them by reference.
import { localeMeta } from "@/i18n/locales";
import { NAMES, type Topic } from "./duaGenerator";
import { LENGTH_RULE, checkArabic, checkPersonal, looksHarmful, type DuaLength, type Occasion, type WhoJ, type Direction } from "./duaJourney";

const OCCASION_EN: Record<Occasion, string> = {
  hardship: "something weighs on them",
  hope: "they hope for something good",
  thanks: "they want to give thanks",
  begin: "they are about to begin something",
  closer: "they want to come closer to Allah",
  other: "someone else needs this dua",
};
const WHO_EN: Record<WhoJ, string> = {
  me: "themselves", mother: "their mother", father: "their father", parents: "their parents", spouse: "their spouse", child: "their child",
  friend: "a friend", loved: "someone they love", ummah: "the whole Ummah",
};
const DIRECTION_EN: Record<Direction, string> = {
  forgiveness: "forgiveness", provision: "lawful provision and work", health: "health and healing", family: "their family", guidance: "guidance in a decision",
  exams: "study and exams", grief: "grief and loss", gratitude: "gratitude", worry: "relief from worry and anxiety", heart: "a firm heart and faith",
  protection: "protection", travel: "a journey", deceased: "someone who has passed away",
};

export type ComposeIn = { occasion: Occasion; who: WhoJ; direction: Direction; topic: Topic; text: string; len: DuaLength; lang: string; arabic: boolean; names: string[]; user: string };
export type ComposeOut = { ok: true; personal: string; arabic?: string } | { ok: false; error: "refused" | "ai" };

const MODEL = () => process.env.OPENAI_DUA_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";

/** OpenAI moderation (free); null when it could not be asked */
export async function flagged(key: string, input: string): Promise<boolean | null> {
  try {
    const r = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "omni-moderation-latest", input }),
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) return null;
    const d = (await r.json()) as { results?: { flagged?: boolean; categories?: Record<string, boolean> }[] };
    const res = d.results?.[0];
    if (!res) return null;
    // sadness and worry are what people bring to dua: only harm to others, hate, violence, sexual content and
    // self-harm intent count (self-harm is answered with a gentle refusal and help in the app texts)
    const c = res.categories ?? {};
    return !!(c.harassment || c["harassment/threatening"] || c.hate || c["hate/threatening"] || c.violence || c["violence/graphic"] || c.sexual || c["sexual/minors"] || c["self-harm/intent"] || c["self-harm/instructions"] || c.illicit || c["illicit/violent"]);
  } catch {
    return null;
  }
}

function system(i: ComposeIn) {
  const lang = `${localeMeta(i.lang).resourceLang} (language code "${i.lang}"${i.lang === "fa" ? ", Dari Persian as spoken in Afghanistan" : ""})`;
  const rule = LENGTH_RULE[i.len];
  const names = i.names.map((n) => NAMES[n]?.id).filter(Boolean).join(", ") || "rahman, rahim";
  return `You help a Muslim put the personal part of a supplication (dua) into words. Write in ${lang}.
What you write is ONLY the personal request. The app shows it separately and labels it as personal words composed with AI, next to authentic duas from the Quran and the Sunnah that are quoted from their sources. You never write those.
Rules:
- ${rule.min} to ${rule.max} short sentences, humble, warm and sincere, addressed directly to Allah ("O Allah" in that language). Polite and dignified wording; in German use reverent "Du/Dich/Dein" only for Allah.
- You may call on these beautiful names of Allah (by their meaning in the language): ${names}.
- Never quote, paraphrase, imitate or invent Quran verses or hadith, never use their wording as a quotation, never give verse or hadith numbers, never name the Quran, a hadith, the Prophet's words, a scholar or a source.
- Never claim that Allah has promised, said or decreed something, never promise an answer or a result, never state rulings, virtues, numbers or times.
- No Arabic script unless the language itself is written in it, no transliteration, no emojis, no headings, no lists, no quotation marks. Do not mention artificial intelligence.
- Do not repeat personal names or sensitive details; speak of "my mother", "my friend" etc.
- If the request asks for harm, a curse or punishment against anyone, for something sinful, or is not a dua at all, do not write it: answer with status "refuse".
Answer as JSON only: {"status":"ok"|"refuse","personal":"…"${i.arabic ? `,"arabic":"the same personal words in clear Modern Standard Arabic, with full tashkeel where natural, again only personal words and never a Quran or hadith quotation"` : ""}}.`;
}

function user(i: ComposeIn) {
  return [
    `Why they come to dua: ${OCCASION_EN[i.occasion]}.`,
    `They pray for: ${WHO_EN[i.who]}.`,
    `Direction of the dua: ${DIRECTION_EN[i.direction]}.`,
    i.text ? `Their situation in their own words (any language): ${i.text}` : "They did not describe their situation.",
  ].join("\n");
}

async function ask(key: string, i: ComposeIn, temperature: number, hint?: string): Promise<{ status?: string; personal?: string; arabic?: string } | null> {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL(), temperature, max_tokens: LENGTH_RULE[i.len].tokens * (i.arabic ? 2 : 1) + 60, user: i.user,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system(i) }, { role: "user", content: user(i) + (hint ? `\n\n${hint}` : "") }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) return null;
  const d = (await r.json().catch(() => ({}))) as { choices?: { message?: { content?: string } }[] };
  try { return JSON.parse(d.choices?.[0]?.message?.content ?? "") as { status?: string; personal?: string; arabic?: string }; } catch { return null; }
}

const clean = (s: unknown) => String(s ?? "").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim();

/** the request itself: false when it asks for harm (checked before a credit is used) */
export async function requestOk(key: string, text: string): Promise<boolean> {
  if (!text) return true;
  if (looksHarmful(text)) return false;
  return !(await flagged(key, text));
}

/** composes the personal words (call requestOk first); two tries, the second even calmer, before giving up */
export async function composePersonal(key: string, i: ComposeIn): Promise<ComposeOut> {
  let hint: string | undefined;
  for (const temperature of [0.4, 0.2]) {
    const out = await ask(key, i, temperature, hint).catch(() => null);
    if (!out) continue;
    if (out.status === "refuse") return { ok: false, error: "refused" };
    const personal = clean(out.personal);
    const c = checkPersonal(personal, i.lang, i.len);
    let arabic: string | undefined;
    let ca: { ok: boolean; why?: string } = { ok: true };
    if (i.arabic && i.lang !== "ar") { arabic = clean(out.arabic); ca = arabic ? checkArabic(arabic) : { ok: false, why: "missing" }; }
    if (c.ok && ca.ok) {
      const f = await flagged(key, [personal, arabic].filter(Boolean).join("\n"));
      if (f) return { ok: false, error: "refused" };
      return { ok: true, personal, arabic };
    }
    if (!c.ok && c.why === "harm") return { ok: false, error: "refused" };
    hint = "Your last answer broke a rule (a quotation, a reference, a source, a link, the wrong script or the wrong length). Write only personal words, following every rule.";
  }
  return { ok: false, error: "ai" };
}
