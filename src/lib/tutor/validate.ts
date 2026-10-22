import type { Doc } from "./corpus";
import type { ModelAnswer } from "./prompt";
import { fold, hadithRefsIn, isHadithRef, isVerseKey, verseRefsIn } from "./text";

// Server-side checks of every model answer before anyone sees it. An answer is rejected (and the learner gets the honest
// "I could not find this in our lessons" with the related pages) when it is not grounded in the retrieved passages.

export type Checked =
  | { ok: true; status: "answered" | "views"; answer: string; used: Doc[]; verses: string[]; hadith: string[]; followups: string[]; notes: string[] }
  | { ok: false; reason: "no_sources" | "not_found" | "ungrounded_ref" | "scripture_text" | "invented_number" | "empty" | "format"; notes: string[] };

/** Arabic with full vowel marks (as in a muṣḥaf): the model must never write scripture itself */
const VOWELLED = /[؀-ۿؐ-ًؚ-ٰٟۖ-ۭ\s]{12,}/g;
function heavyTashkeel(s: string): boolean {
  for (const m of s.match(VOWELLED) ?? []) {
    const marks = (m.match(/[ً-ْٰ]/g) ?? []).length;
    const letters = (m.match(/[ء-ي]/g) ?? []).length;
    if (letters >= 8 && marks / letters > 0.55) return true;
  }
  return false;
}

/** quoted passages of 8+ words that do not appear in any retrieved passage (a "quote" the model made up) */
function inventedQuotes(answer: string, docs: Doc[]): string[] {
  const hay = fold(docs.map((d) => d.text).join("\n")).replace(/[^\p{L}\p{N}]+/gu, " ");
  const out: string[] = [];
  const re = /["“„«»‚‘]([^"“”„«»‚‘’]{30,})["”“»«’‘]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(answer))) {
    const q = m[1];
    if (q.trim().split(/\s+/).length < 8) continue;
    const f = fold(q).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    // the middle part must be in the sources (models trim the edges of a quote)
    const words = f.split(" ");
    const core = words.slice(1, Math.max(2, words.length - 1)).join(" ");
    if (!hay.includes(core)) out.push(q);
  }
  return out;
}

/** numbers in the answer must appear in a passage (or in the question): the tutor never invents figures */
function inventedNumbers(answer: string, docs: Doc[], extra: string): string[] {
  const allowed = new Set<string>();
  for (const t of [...docs.map((d) => d.text + " " + d.title), extra]) for (const m of t.match(/\d+(?:[.,]\d+)?/g) ?? []) allowed.add(m.replace(",", "."));
  const plain = answer
    .replace(/\[S?\d{1,2}\]/gi, " ")
    .replace(/^\s*\d{1,2}[.)]\s/gm, " ")
    .replace(/\b\d{1,3}:\d{1,3}(?:\s?[–-]\s?\d{1,3})?\b/g, " ")
    .replace(/\b\d{1,2}:\d{2}\s?(am|pm|uhr|h)\b/gi, " ");
  const out: string[] = [];
  for (const m of plain.match(/\d+(?:[.,]\d+)?/g) ?? []) {
    const n = m.replace(",", ".");
    if (allowed.has(n) || Number(n) <= 1) continue;
    out.push(m);
  }
  return out;
}

export function checkAnswer(a: unknown, docs: Doc[], extraVerses: string[] = [], question = ""): Checked {
  const notes: string[] = [];
  if (!a || typeof a !== "object") return { ok: false, reason: "format", notes };
  const x = a as Partial<ModelAnswer>;
  if (x.status === "not_found") return { ok: false, reason: "not_found", notes };
  if (x.status !== "answered" && x.status !== "views") return { ok: false, reason: "format", notes };
  let answer = String(x.answer ?? "").trim();
  if (answer.length < 20) return { ok: false, reason: "empty", notes };

  // 1. the passages used must be among the ones retrieved
  const ids = new Map(docs.map((d, i) => [`S${i + 1}`, d]));
  const cited = new Set<string>();
  for (const s of Array.isArray(x.sources) ? x.sources : []) { const k = String(s).replace(/[[\]\s]/g, "").toUpperCase(); if (ids.has(k)) cited.add(k); else notes.push(`unknown source ${k}`); }
  answer = answer.replace(/\[(S\d{1,2})\]/gi, (all, k: string) => {
    const id = k.toUpperCase();
    if (ids.has(id)) { cited.add(id); return `[${id}]`; }
    notes.push(`unknown marker ${id}`);
    return "";
  });
  if (!cited.size) return { ok: false, reason: "no_sources", notes };
  const used = [...cited].sort((p, q) => Number(p.slice(1)) - Number(q.slice(1))).map((k) => ids.get(k)!);

  // 2. scripture references only from the retrieved passages (or the verse the learner is looking at)
  const allowedVerses = new Set([...docs.flatMap((d) => d.verses), ...extraVerses]);
  const allowedHadith = new Set(docs.flatMap((d) => d.hadith));
  const plain = answer.replace(/\b\d{1,2}:\d{2}\s?(am|pm|a\.m\.|p\.m\.|uhr|h)\b/gi, "");
  for (const k of verseRefsIn(plain)) {
    if (!allowedVerses.has(k)) return { ok: false, reason: "ungrounded_ref", notes: [...notes, `verse ${k} in text not retrieved`] };
  }
  const verses = [...new Set((Array.isArray(x.verses) ? x.verses : []).map(String).filter((k) => isVerseKey(k)))];
  for (const k of verses) if (!allowedVerses.has(k)) return { ok: false, reason: "ungrounded_ref", notes: [...notes, `verse ${k} not retrieved`] };
  const hadith = [...new Set((Array.isArray(x.hadith) ? x.hadith : []).map((h) => String(h).toLowerCase().replace(/\s+/g, "")).filter(isHadithRef))];
  for (const h of hadithRefsIn(answer)) if (!allowedHadith.has(h)) return { ok: false, reason: "ungrounded_ref", notes: [...notes, `hadith ${h} in text not retrieved`] };
  for (const h of hadith) if (!allowedHadith.has(h)) return { ok: false, reason: "ungrounded_ref", notes: [...notes, `hadith ${h} not retrieved`] };

  // 3. no scripture written by the model, no invented quotes
  if (heavyTashkeel(answer)) return { ok: false, reason: "scripture_text", notes: [...notes, "vowelled arabic"] };
  const invented = inventedQuotes(answer, used);
  if (invented.length) return { ok: false, reason: "scripture_text", notes: [...notes, `invented quote: ${invented[0].slice(0, 60)}`] };

  const nums = inventedNumbers(answer, docs, question);
  if (nums.length) return { ok: false, reason: "invented_number", notes: [...notes, `numbers not in the sources: ${nums.slice(0, 4).join(", ")}`] };

  const followups = (Array.isArray(x.followups) ? x.followups : []).map((f) => String(f).trim()).filter((f) => f.length > 3 && f.length < 160).slice(0, 3);
  return { ok: true, status: x.status, answer: answer.replace(/\n{3,}/g, "\n\n").slice(0, 4000), used, verses: verses.slice(0, 6), hadith: hadith.slice(0, 4), followups, notes };
}
