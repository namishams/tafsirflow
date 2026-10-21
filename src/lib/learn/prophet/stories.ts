// mirrors mobile/src/features/prophet/stories.ts (copied for the website; keep both in step)
import type { IslamChapter } from "@/lib/islam";
import type { SecretsContent } from "@/lib/secrets/content";
import { RECITER_BIOS, bioText, type ReciterBio } from "@/lib/reciters";

// Short story cards built ONLY from content that already exists and is vetted in the app: the Islam library
// (web/islam, every language through its own translations), the reciter biographies (web/reciters), the Secrets of
// the Quran (web/secrets) and the Shams Method texts of the website (messages "shams"). Nothing is written here –
// the builders only cut the existing texts into short cards (title, 2–5 paragraphs, the original sources) and link
// to the full page. Long texts show their first part and "Read the full chapter".

export type StoryCat = "prophet" | "islam" | "reciters" | "tips" | "secrets";
export type Story = {
  id: string; cat: StoryCat; group: string; groupTitle: string; arabic: string;
  title: string; kicker?: string; badge?: { text: string; tone: "ok" | "no" | "info" };
  paragraphs: string[]; points?: { title: string; items: string[] };
  truncated: boolean; sources: string[];
  /** app route of the full text */ href: string;
  /** path on quranmasterclass.com (without the language) */ webPath: string;
  reciter?: ReciterBio;
};
export type StoryGroup = { id: string; cat: StoryCat; title: string; arabic: string; stories: Story[] };

/** chapters per category (slugs of web/islam) */
export const PROPHET_SLUGS = ["prophet", "prophets", "sahaba"] as const;
export const ISLAM_SLUGS = ["history", "cities", "mosques", "emirates", "art", "future", "madhahib"] as const;

// ---------- the library's Markdown subset → plain paragraphs ----------
const inline = (s: string) => s
  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .replace(/\*\*([^*]+)\*\*/g, "$1")
  .replace(/(^|[\s(„“"«])\*([^*\n]+)\*/g, "$1$2")
  .replace(/`([^`]+)`/g, "$1")
  .trim();
const isPara = (block: string) => !/^(\s*[-*+]\s|\s*\d+\.\s|\s*\||\s*>|\s*#)/.test(block);

type Section = { title: string; parent?: string; paras: string[]; list: string[] };
/** split a chapter body at ## and ### headings; paragraphs and list items of each section */
export function sections(body: string): Section[] {
  const out: Section[] = [];
  let h2 = "";
  let cur: Section | null = null;
  const blocks = body.replace(/\r/g, "").split(/\n\s*\n/);
  for (const raw of blocks) {
    const lines = raw.split("\n");
    let rest: string[] = [];
    for (const line of lines) {
      const m = line.match(/^(#{2,3})\s+(.+)$/);
      if (m) {
        if (cur && rest.length) push(cur, rest.join("\n"));
        rest = [];
        const title = inline(m[2]);
        if (m[1] === "##") h2 = title;
        cur = { title, parent: m[1] === "###" ? h2 : undefined, paras: [], list: [] };
        out.push(cur);
      } else rest.push(line);
    }
    if (rest.join("").trim()) {
      if (!cur) { cur = { title: "", paras: [], list: [] }; out.push(cur); }
      push(cur, rest.join("\n"));
    }
  }
  return out;
}
function push(sec: Section, block: string) {
  const b = block.trim();
  if (!b) return;
  if (isPara(b)) sec.paras.push(inline(b.replace(/\n/g, " ")));
  else for (const l of b.split("\n")) { const m = l.match(/^\s*(?:[-*+]|\d+\.)\s+(.+)$/); if (m) sec.list.push(inline(m[1])); }
}

/** at most 5 paragraphs and about 1400 characters; a longer first paragraph is cut after a full sentence */
export function excerpt(paras: string[], max = 1400): { paragraphs: string[]; truncated: boolean } {
  const out: string[] = [];
  let used = 0;
  for (const p of paras) {
    if (out.length >= 5) return { paragraphs: out, truncated: true };
    if (used + p.length <= max) { out.push(p); used += p.length; continue; }
    if (!out.length) {
      const cut = p.slice(0, max);
      const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "), cut.lastIndexOf("。"), cut.lastIndexOf("۔ "), cut.lastIndexOf("؟ "));
      out.push(end > 200 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(" "))} …`);
    }
    return { paragraphs: out, truncated: true };
  }
  return { paragraphs: out, truncated: false };
}

/** story cards of one library chapter: one card per section that has paragraphs */
export function chapterGroup(slug: string, arabic: string, c: IslamChapter, cat: StoryCat): StoryGroup {
  const stories: Story[] = [];
  sections(c.body).forEach((s, i) => {
    if (!s.paras.length) return;
    const ex = excerpt(s.paras);
    stories.push({
      id: `${slug}#${i}`, cat, group: slug, groupTitle: c.title, arabic,
      title: s.title || c.title, kicker: s.parent && s.parent !== s.title ? s.parent : c.kicker,
      paragraphs: ex.paragraphs, truncated: ex.truncated || s.list.length > 0, sources: c.sources,
      href: `/islam/${slug}`, webPath: `/islam/${slug}`,
    });
  });
  return { id: slug, cat, title: c.title, arabic, stories };
}

/** one card per reciter: the short text, the first paragraphs of the biography, "known for" */
export function reciterGroups(lang: string, knownFor: string): StoryGroup[] {
  return RECITER_BIOS.map((r) => {
    const b = bioText(r, lang);
    const first = sections(b.body).flatMap((s) => s.paras);
    const ex = excerpt([b.short, ...first], 900);
    const story: Story = {
      id: `reciter:${r.slug}`, cat: "reciters", group: `reciter:${r.slug}`, groupTitle: r.name, arabic: r.arabic,
      title: lang === "ar" ? r.arabic : r.name, kicker: [r.country, r.born ? `${r.born}${r.died ? `–${r.died}` : ""}` : ""].filter(Boolean).join(" · "),
      paragraphs: ex.paragraphs, points: b.knownFor.length ? { title: knownFor, items: b.knownFor } : undefined,
      truncated: true, sources: [], href: `/reciters/${r.slug}`, webPath: `/reciters/${r.slug}`, reciter: r,
    };
    return { id: story.group, cat: "reciters", title: story.title, arabic: r.arabic, stories: [story] };
  });
}

/** the Shams Method principles and the day plan (website messages "shams") */
export function tipGroups(t: (k: string) => string, titles: { method: string; day: string }): StoryGroup[] {
  const ok = (k: string) => t(k) !== k;
  const principles: Story[] = [];
  for (let i = 1; i <= 10; i++) {
    if (!ok(`p${i}t`)) continue;
    principles.push({ id: `tip:p${i}`, cat: "tips", group: "tip:method", groupTitle: titles.method, arabic: "شمس", title: t(`p${i}t`), kicker: titles.method, paragraphs: [t(`p${i}d`)], truncated: false, sources: [], href: "/shams", webPath: "/shams" });
  }
  const day: Story[] = [];
  for (let i = 1; i <= 4; i++) {
    if (!ok(`day${i}t`)) continue;
    day.push({ id: `tip:day${i}`, cat: "tips", group: "tip:day", groupTitle: titles.day, arabic: "يوم", title: t(`day${i}t`), kicker: titles.day, paragraphs: [t(`day${i}d`)], truncated: false, sources: [], href: "/shams", webPath: "/shams" });
  }
  const how = [1, 2, 3].filter((i) => ok(`how${i}`)).map((i) => t(`how${i}`));
  if (how.length && day.length) day.push({ id: "tip:how", cat: "tips", group: "tip:day", groupTitle: titles.day, arabic: "يوم", title: titles.day, kicker: titles.day, paragraphs: [], points: { title: titles.day, items: how }, truncated: false, sources: [], href: "/plan", webPath: "/plan" });
  return [
    { id: "tip:method", cat: "tips" as const, title: titles.method, arabic: "شمس", stories: principles },
    { id: "tip:day", cat: "tips" as const, title: titles.day, arabic: "يوم", stories: day },
  ].filter((g) => g.stories.length);
}

/** Secrets of the Quran: checked claims (with the verdict), facts and "more secrets", each with its source */
export function secretGroups(s: SecretsContent): StoryGroup[] {
  const tone = (v: string) => (v === "false" ? "no" : v === "method" ? "info" : "ok") as "ok" | "no" | "info";
  const claims: Story[] = s.claims.map((c, i) => ({
    id: `secret:c${i}`, cat: "secrets", group: "secret:claims", groupTitle: s.claimsTitle, arabic: "تحقق", title: c.q, kicker: s.claimsTitle,
    badge: { text: s.verdicts[c.v], tone: tone(c.v) }, paragraphs: [c.a], truncated: false, sources: c.key ? [`Quran ${c.key}`] : [], href: "/secrets", webPath: "/secrets",
  }));
  const fact = (prefix: string, title: string, list: { ar: string; title: string; body: string; src: string }[]): Story[] => list.map((f, i) => ({
    id: `secret:${prefix}${i}`, cat: "secrets", group: `secret:${prefix}`, groupTitle: title, arabic: f.ar, title: f.title, kicker: title,
    paragraphs: [f.body], truncated: false, sources: [f.src], href: "/secrets", webPath: "/secrets",
  }));
  return [
    { id: "secret:facts", cat: "secrets" as const, title: s.factsTitle, arabic: "أسرار", stories: fact("f", s.factsTitle, s.facts) },
    { id: "secret:claims", cat: "secrets" as const, title: s.claimsTitle, arabic: "تحقق", stories: claims },
    { id: "secret:m", cat: "secrets" as const, title: s.moreTitle ?? s.factsTitle, arabic: "عجائب", stories: fact("m", s.moreTitle ?? s.factsTitle, s.more ?? []) },
  ].filter((g) => g.stories.length);
}

/** the 99 names of Allah from the library chapter "names" (list lines "**الرحمن** – Ar-Rahman – meaning") */
export type AllahName = { ar: string; latin: string; meaning: string };
export function allahNames(c: IslamChapter | undefined): AllahName[] {
  if (!c) return [];
  const out: AllahName[] = [];
  for (const line of c.body.split("\n")) {
    const m = line.match(/^\s*-\s+\*\*([؀-ۿ\s]+)\*\*\s+[–-]\s+([^–]+?)\s+[–-]\s+(.+)$/);
    if (m) out.push({ ar: m[1].trim(), latin: m[2].trim(), meaning: inline(m[3]) });
  }
  // only the vetted list itself (it has 99 rows); anything much shorter means the format was not recognised
  return out.length >= 90 ? out.slice(0, 99) : [];
}
