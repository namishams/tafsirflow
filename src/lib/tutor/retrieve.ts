import type { Doc, Lang } from "./corpus";
import { tokens } from "./text";
import type { TutorContext, Tradition } from "./config";

// Keyword retrieval (BM25) over the tutor's library. The question is searched as typed and with the English and
// learner-language keywords from the planning step, so a question in Urdu still finds the English passage.

type Index = { docs: Doc[]; tf: Map<string, number>[]; len: number[]; avg: number; df: Map<string, number> };
const indexes = new WeakMap<Doc[], Index>();

function indexOf(docs: Doc[]): Index {
  const hit = indexes.get(docs);
  if (hit) return hit;
  const tf: Map<string, number>[] = [], len: number[] = [], df = new Map<string, number>();
  for (const d of docs) {
    const m = new Map<string, number>();
    // the title counts three times: a passage titled "Wudu" is about wudu
    const all = [...tokens(d.title), ...tokens(d.title), ...tokens(d.title), ...tokens(d.text)];
    for (const t of all) m.set(t, (m.get(t) ?? 0) + 1);
    for (const t of m.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    tf.push(m); len.push(all.length);
  }
  const ix = { docs, tf, len, avg: len.reduce((a, b) => a + b, 0) / Math.max(1, len.length), df };
  indexes.set(docs, ix);
  return ix;
}

export type Hit = { doc: Doc; score: number };

/** the best passages for a query; one language version per passage (the learner's language when it exists) */
export function search(docs: Doc[], query: string, o: { lang: string; tradition: Tradition; k: number; context?: TutorContext | null }): Hit[] {
  const ix = indexOf(docs);
  const q = [...new Set(tokens(query))];
  const N = ix.docs.length, k1 = 1.2, b = 0.75;
  const scores: Hit[] = [];
  const ctxLink = contextLink(o.context);
  for (let i = 0; i < N; i++) {
    let s = 0;
    const m = ix.tf[i];
    for (const t of q) {
      const f = m.get(t);
      if (!f) continue;
      const n = ix.df.get(t) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      s += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * ix.len[i]) / ix.avg)));
    }
    if (s <= 0) continue;
    const d = ix.docs[i];
    if (o.tradition !== "all" && d.tradition !== "all") s *= d.tradition === o.tradition ? 1.15 : 0.9;
    if (ctxLink && d.link === ctxLink) s *= 1.4;
    if (o.context?.verse && d.verses.includes(o.context.verse)) s *= 1.3;
    scores.push({ doc: d, score: s });
  }
  scores.sort((a, b2) => b2.score - a.score);
  // one language version per passage: keep the best, then prefer the learner's language for the same passage
  const pref: Lang = o.lang === "de" ? "de" : o.lang === "ar" ? "ar" : "en";
  const byBase = new Map<string, Hit>();
  for (const h of scores) {
    const cur = byBase.get(h.doc.base);
    if (!cur) { byBase.set(h.doc.base, h); continue; }
    if (cur.doc.lang !== pref && h.doc.lang === pref) byBase.set(h.doc.base, { doc: h.doc, score: cur.score });
  }
  const out = [...byBase.values()].sort((a, b2) => b2.score - a.score);
  // no more than two passages of one page, so the answer can draw on several sources
  const perLink = new Map<string, number>();
  const res: Hit[] = [];
  for (const h of out) {
    const n = perLink.get(h.doc.link) ?? 0;
    if (n >= 2) continue;
    perLink.set(h.doc.link, n + 1);
    res.push(h);
    if (res.length >= o.k) break;
  }
  return res;
}

/** passages that belong to the place the learner asked from (the lesson, the carousel, the tajweed lesson) */
export function contextDocs(docs: Doc[], ctx: TutorContext | null | undefined, lang: string): Doc[] {
  const link = contextLink(ctx);
  if (!link && !ctx?.verse) return [];
  const pref = lang === "de" ? "de" : lang === "ar" ? "ar" : "en";
  const pick = new Map<string, Doc>();
  for (const d of docs) {
    const match = (link && d.link === link) || (!link && ctx?.verse && d.verses.includes(ctx.verse));
    if (!match) continue;
    const cur = pick.get(d.base);
    if (!cur || (cur.lang !== pref && d.lang === pref) || (cur.lang !== pref && cur.lang !== "en" && d.lang === "en")) pick.set(d.base, d);
  }
  return [...pick.values()].slice(0, 3);
}

function contextLink(ctx: TutorContext | null | undefined): string | null {
  if (!ctx?.id) return null;
  const id = ctx.id.replace(/[^\w:-]/g, "");
  // a tajweed quiz names its lesson as "tajweed:<id>"
  if (ctx.kind === "quiz" && id.startsWith("tajweed:")) return `/tajweed/${id.slice(8)}`;
  if ((ctx.kind === "lesson" || ctx.kind === "quiz") && ctx.lesson) return `/courses/${id}/${ctx.lesson.replace(/[^\w:-]/g, "")}`;
  if (ctx.kind === "tajweed") return `/tajweed/${id}`;
  if (ctx.kind === "carousel") return `/carousels/${id}`;
  if (ctx.kind === "guide") return `/guides/${id}`;
  return null;
}
