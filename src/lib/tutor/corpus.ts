import { SERVER_COURSES as COURSES } from "./courses";
import { TAJWEED_LESSONS } from "../tajweed";
import { GUIDES } from "../guides";
import { ISLAM } from "../islam";
import { PRINCIPLES } from "../learn/shams2/handbook";
import { SOURCES, TERMS } from "../learn/shams2/sources";
import { carouselPayload, carouselStore } from "../feed/carousels/store";
import { CHAPTER_TRADITION } from "../islam/hub";
import { ADAB_ITEMS, ADAB_SOURCES, ADAB_TOPICS, type AdabRef } from "../learn/shams2/adab/data";
import sistersDe from "../sisters/de";
import sistersEn from "../sisters/en";
import { SOURCES as SISTER_SOURCES } from "../sisters/sources";
import type { Position, SistersText } from "../sisters/types";
import { hadithRefsIn, isHadithRef, isVerseKey, verseRefsIn } from "./text";

// The tutor's library: only the platform's own reviewed content. Every passage knows where it comes from (a link inside
// the platform), which verses and hadith it names, and for which tradition it was written. The model may only explain
// with these passages; scripture is shown from its source by reference (feed/resolve.ts), never written by the model.

export type DocKind = "course" | "tajweed" | "guide" | "islam" | "handbook" | "glossary" | "carousel" | "tafsir" | "progress" | "adab" | "sisters";
export type Lang = "en" | "de" | "ar";
export type Doc = {
  /** unique per passage ("course:aqidah:a01#0@en") */
  id: string;
  /** the same passage in every language ("course:aqidah:a01#0") */
  base: string;
  kind: DocKind;
  lang: Lang;
  title: string;
  text: string;
  /** the page inside the platform (website path without locale; the app maps it to its own route) */
  link: string;
  verses: string[];
  hadith: string[];
  tradition: "sunni" | "shia" | "all";
};

const MAX_CHUNK = 1400;

/** splits a Markdown body at "## " headings, long sections again at paragraphs */
function chunks(body: string): { head: string; text: string }[] {
  const out: { head: string; text: string }[] = [];
  const parts = body.split(/\n(?=##\s)/);
  for (const part of parts) {
    const m = /^##+\s+(.+)\n?/.exec(part);
    const head = m ? m[1].trim() : "";
    const rest = (m ? part.slice(m[0].length) : part).trim();
    if (!rest) continue;
    let cur = "";
    for (const p of rest.split(/\n{2,}/)) {
      if (cur && cur.length + p.length > MAX_CHUNK) { out.push({ head, text: cur.trim() }); cur = ""; }
      cur += (cur ? "\n\n" : "") + p;
    }
    if (cur.trim()) out.push({ head, text: cur.trim() });
  }
  return out;
}

const uniq = (a: string[]) => [...new Set(a)];
const clean = (s: string) => s.replace(/\r/g, "").trim();

function push(out: Doc[], d: Omit<Doc, "id" | "verses" | "hadith"> & { verses?: string[]; hadith?: string[] }) {
  const text = clean(d.text);
  if (text.length < 40) return;
  out.push({
    ...d,
    text,
    id: `${d.base}@${d.lang}`,
    verses: uniq([...(d.verses ?? []).filter(isVerseKey), ...verseRefsIn(text)]),
    hadith: uniq([...(d.hadith ?? []).filter(isHadithRef), ...hadithRefsIn(text)]),
  });
}

function courseDocs(out: Doc[]) {
  for (const c of COURSES) {
    if (c.id === "names") continue; // the 99 names come from the Islam chapter "names" below
    for (const l of c.lessons) {
      const tradition = l.tags?.includes("jafari") && !l.tags.some((t) => t === "hanafi" || t === "maliki" || t === "shafii" || t === "hanbali") ? "shia" : "all";
      for (const lang of ["en", "de", "ar"] as const) {
        const body = l.body[lang];
        if (!body) continue;
        const title = `${c.title[lang] || c.title.en} · ${l.title[lang] || l.title.en}`;
        chunks(body).forEach((ch, i) => push(out, {
          base: `course:${c.id}:${l.id}#${i}`, kind: "course", lang, title: ch.head ? `${title} – ${ch.head}` : title,
          text: (c.note && i === 0 ? `${c.note[lang] || c.note.en}\n\n` : "") + ch.text,
          link: `/courses/${c.id}/${l.id}`, verses: l.verses, hadith: l.hadith, tradition,
        }));
        // the quiz explanations are reviewed teaching text as well ("why is this answer wrong?")
        const ex = l.quiz.map((q) => (q.explain ? `${q.q[lang] || q.q.en} – ${q.options[q.answer]?.[lang] || q.options[q.answer]?.en}: ${q.explain[lang] || q.explain.en}` : "")).filter(Boolean).join("\n");
        if (ex) push(out, { base: `course:${c.id}:${l.id}#quiz`, kind: "course", lang, title: `${title} – Quiz`, text: ex, link: `/courses/${c.id}/${l.id}`, verses: l.verses, hadith: l.hadith, tradition });
      }
    }
  }
}

function tajweedDocs(out: Doc[]) {
  for (const l of TAJWEED_LESSONS) {
    for (const lang of ["en", "de"] as const) {
      const title = lang === "de" ? l.title_de : l.title_en;
      const body = `${lang === "de" ? l.summary_de : l.summary_en}\n\n${lang === "de" ? l.body_de : l.body_en}`;
      const verses = l.examples.map((e) => e.key).filter((k): k is string => !!k);
      chunks(body).forEach((ch, i) => push(out, { base: `tajweed:${l.id}#${i}`, kind: "tajweed", lang, title: ch.head ? `${title} – ${ch.head}` : title, text: ch.text, link: `/tajweed/${l.id}`, verses, tradition: "all" }));
      const ex = l.quiz.map((q) => `${lang === "de" ? q.q_de : q.q_en} – ${(lang === "de" ? q.options_de : q.options_en)[q.answer]}: ${lang === "de" ? q.explain_de : q.explain_en}`).join("\n");
      if (ex) push(out, { base: `tajweed:${l.id}#quiz`, kind: "tajweed", lang, title: `${title} – Quiz`, text: ex, link: `/tajweed/${l.id}`, tradition: "all" });
    }
  }
}

function guideDocs(out: Doc[]) {
  for (const g of GUIDES) {
    for (const lang of ["en", "de"] as const) {
      const title = lang === "de" ? g.title_de : g.title_en;
      chunks(lang === "de" ? g.body_de : g.body_en).forEach((ch, i) => push(out, { base: `guide:${g.slug}#${i}`, kind: "guide", lang, title: ch.head ? `${title} – ${ch.head}` : title, text: ch.text, link: `/guides/${g.slug}`, tradition: "all" }));
      const faq = g.faq.map((f) => `${lang === "de" ? f.q_de : f.q_en}\n${lang === "de" ? f.a_de : f.a_en}`).join("\n\n");
      if (faq) push(out, { base: `guide:${g.slug}#faq`, kind: "guide", lang, title: `${title} – FAQ`, text: faq, link: `/guides/${g.slug}`, tradition: "all" });
    }
  }
}

// the hub's tradition of each chapter (islam/hub.ts: prayers-special-shia, ziyarat, reciter-path-shia, the Ja'fari
// school are Shia; the special Sunni prayers and the four schools Sunni), plus two the hub leaves to everyone
const SHIA_DOCS = new Set(["zaydi"]);
const SUNNI_DOCS = new Set(["zahiri"]);
function islamDocs(out: Doc[]) {
  for (const d of ISLAM) {
    const tradition = CHAPTER_TRADITION[d.slug] ?? (SHIA_DOCS.has(d.slug) ? "shia" : SUNNI_DOCS.has(d.slug) ? "sunni" : "all");
    for (const lang of ["en", "de"] as const) {
      const ch = d[lang];
      const link = d.slug === "names" ? "/names" : `/islam/${d.slug}`;
      push(out, { base: `islam:${d.slug}#lead`, kind: "islam", lang, title: ch.title, text: `${ch.lead}\n\n${ch.facts.map((f) => `${f.n}: ${f.l}`).join("\n")}\n\n${lang === "de" ? "Quellen" : "Sources"}: ${ch.sources.join("; ")}`, link, tradition });
      chunks(ch.body).forEach((c, i) => push(out, { base: `islam:${d.slug}#${i}`, kind: "islam", lang, title: c.head ? `${ch.title} – ${c.head}` : ch.title, text: c.text, link, tradition }));
      const faq = ch.faq.map((f) => `${f.q}\n${f.a}`).join("\n\n");
      if (faq) push(out, { base: `islam:${d.slug}#faq`, kind: "islam", lang, title: `${ch.title} – FAQ`, text: faq, link, tradition });
    }
  }
}

function handbookDocs(out: Doc[]) {
  const label = (refs: readonly string[]) => refs.map((r) => SOURCES[r as keyof typeof SOURCES]?.label).filter(Boolean).join("; ");
  for (const p of PRINCIPLES) {
    for (const lang of ["en", "de", "ar"] as const) {
      push(out, { base: `handbook:${p.id}`, kind: "handbook", lang, title: `${lang === "de" ? "Shams-Methode" : lang === "ar" ? "منهج شمس" : "Shams Method"} – ${p.title[lang]}`, text: `${p.body[lang]}\n\n(${label(p.src)})`, link: "/shams/handbook", tradition: "all" });
    }
  }
  // the glossary of classical terms, a few terms per passage
  for (let i = 0; i < TERMS.length; i += 6) {
    const part = TERMS.slice(i, i + 6);
    for (const lang of ["en", "de", "ar"] as const) {
      const text = part.map((t) => `${t.ar} (${t.tr}): ${lang === "de" ? t.de : lang === "ar" ? t.arDef : t.en}`).join("\n");
      push(out, { base: `glossary:${i / 6}`, kind: "glossary", lang, title: lang === "de" ? "Glossar der Shams-Methode" : lang === "ar" ? "مصطلحات منهج شمس" : "Shams Method glossary", text, link: "/shams/handbook", tradition: "all" });
    }
  }
}

async function carouselDocs(out: Doc[]) {
  try {
    const st = await carouselStore();
    for (const [, e] of st.carousels) {
      for (const lang of ["en", "de", "ar"] as const) {
        const p = carouselPayload(st, e, lang);
        if (p.lang !== lang) continue;
        const verses: string[] = [], hadith: string[] = [];
        const body = p.slides.map((s) => {
          if (s.key) verses.push(s.key);
          if (s.keys) verses.push(...s.keys);
          if (s.c && s.num) hadith.push(`${s.c}:${s.num}`);
          return [s.title, s.body, ...(s.list ?? [])].filter(Boolean).join(" – ");
        }).filter(Boolean).join("\n");
        push(out, {
          base: `carousel:${p.id}`, kind: "carousel", lang, title: `${p.seriesLabel} – ${p.cover.title}`,
          text: `${p.cover.sub ? `${p.cover.sub}\n` : ""}${body}\n\n${p.sources.map((s) => s.label).join("; ")}`.slice(0, 2600),
          link: `/carousels/${p.id}`, verses, hadith, tradition: p.tradition,
        });
      }
    }
  } catch (e) {
    console.error("tutor corpus: carousels", e);
  }
}

// ---- the pillar "Adab des Qurʾān-Trägers" (Shams 3.0): one passage per practice, the Jaʿfarī note as its own passage
const STATUS: Record<string, { de: string; en: string }> = {
  fard: { de: "Pflicht (farḍ)", en: "obligatory (farḍ)" }, wajib: { de: "Pflicht (wājib)", en: "obligatory (wājib)" }, sunnah: { de: "Sunna", en: "sunnah" },
  mustahabb: { de: "empfohlen (mustaḥabb)", en: "recommended (mustaḥabb)" }, adab: { de: "Anstand (adab)", en: "good manners (adab)" },
  makruh: { de: "verpönt (makrūh)", en: "disliked (makrūh)" }, haram: { de: "verboten (ḥarām)", en: "forbidden (ḥarām)" },
};
function adabRefs(refs: AdabRef[]) {
  const verses: string[] = [], names: string[] = [];
  for (const r of refs) {
    if (r.k === "verse") verses.push(r.key);
    else if (r.k === "hadith" || r.k === "kafi") names.push(r.cite);
    else if (r.k === "src") names.push(ADAB_SOURCES[r.id]?.label ?? "");
  }
  return { verses, names: names.filter(Boolean) };
}
function adabDocs(out: Doc[]) {
  for (const it of ADAB_ITEMS) {
    const topic = ADAB_TOPICS.find((x) => x.id === it.topic);
    for (const lang of ["en", "de"] as const) {
      const pillar = lang === "de" ? "Adab des Qurʾān-Trägers" : "Adab of the carrier of the Qurʾān";
      const title = `${pillar} – ${topic ? topic.title[lang] : it.topic} – ${it.title[lang]}`;
      const { verses, names } = adabRefs(it.refs);
      const status = it.status.map((x) => STATUS[x]?.[lang] ?? x).join(" / ");
      const srcLabel = lang === "de" ? "Quellen" : "Sources";
      const text = `${it.practice[lang]}\n${lang === "de" ? "Stellung" : "Status"}: ${status}.${it.note ? `\n${it.note[lang]}` : ""}${names.length ? `\n${srcLabel}: ${names.join("; ")}` : ""}`;
      push(out, { base: `adab:${it.id}`, kind: "adab", lang, title, text, link: "/shams/adab", verses, tradition: "all" });
      if (it.jafari) {
        const j = adabRefs(it.jafari.refs);
        push(out, {
          base: `adab:${it.id}#jafari`, kind: "adab", lang, title: `${title} (Jaʿfarī)`,
          text: `${it.practice[lang]}\n${lang === "de" ? "Dschaʿfari-Position" : "Jaʿfarī position"}: ${it.jafari.note[lang]}${j.names.length ? `\n${srcLabel}: ${j.names.join("; ")}` : ""}`,
          link: "/shams/adab", verses: j.verses, tradition: "shia",
        });
      }
    }
  }
}

// ---- "Für Schwestern": per block the Sunni positions and the Jaʿfarī position as separate passages, so the learner's
// tradition setting can prefer one; the listening days and the women of the Quran as their own passages
function sistersDocs(out: Doc[]) {
  const src = (ids: string[] = []) => ids.map((i) => SISTER_SOURCES[i]?.title).filter(Boolean).join("; ");
  for (const [lang, T] of [["en", sistersEn], ["de", sistersDe]] as [Lang, SistersText][]) {
    const head = T.kicker;
    const line = (p: Position) => `${T.schools[p.school]}: ${p.text}${p.src.length ? ` (${src(p.src)})` : ""}`;
    const split = (base: string, title: string, lead: string | undefined, positions: Position[], extra: string[] = []) => {
      const sunni = positions.filter((p) => p.school !== "jafari"), jafari = positions.filter((p) => p.school === "jafari");
      push(out, { base, kind: "sisters", lang, title, text: [lead, ...sunni.map(line), ...extra, T.notFatwa].filter(Boolean).join("\n"), link: "/sisters", tradition: jafari.length ? "sunni" : "all" });
      if (jafari.length) push(out, { base: `${base}#jafari`, kind: "sisters", lang, title: `${title} (${T.schools.jafari})`, text: [lead, ...jafari.map(line), T.notFatwa].filter(Boolean).join("\n"), link: "/sisters", tradition: "shia" });
    };
    for (const b of T.partRecite.blocks) split(`sisters:${b.id}`, `${head} – ${T.partRecite.title} – ${b.title}`, b.lead, b.positions ?? [], (b.points ?? []).map((p) => `${p.text}${p.src?.length ? ` (${src(p.src)})` : ""}`));
    split("sisters:sajda", `${head} – ${T.partSajda.title}`, T.partSajda.lead, T.partSajda.positions);
    push(out, { base: "sisters:shams", kind: "sisters", lang, title: `${head} – ${T.partShams.title}`, text: [T.partShams.lead, ...T.partShams.steps.map((s) => `${s.title}: ${s.text}`), ...T.partShams.notes.map((n) => n.text)].join("\n"), link: "/sisters", tradition: "all" });
    const w = T.partWomen;
    push(out, {
      base: "sisters:women", kind: "sisters", lang, title: `${head} – ${w.title}`,
      text: [w.lead, `${w.versesTitle}: ${w.verses.map((v) => `${v.ref} (${v.topic})`).join("; ")}`, `${w.companionsTitle}: ${w.companions.map((p) => p.text).join(" ")}`, `${w.scholarsTitle}: ${w.scholars.map((p) => p.text).join(" ")}`, `${w.recitersTitle}: ${w.reciters.map((p) => p.text).join(" ")}`].join("\n").slice(0, 3000),
      link: "/sisters", verses: w.verses.map((v) => v.ref), tradition: "all",
    });
  }
}

let built: Promise<Doc[]> | null = null;
let builtAt = 0;
/** the whole library (built once, refreshed every 6 hours so new carousels and courses are found) */
export function corpus(): Promise<Doc[]> {
  if (built && Date.now() - builtAt < 6 * 60 * 60_000) return built;
  builtAt = Date.now();
  built = (async () => {
    const out: Doc[] = [];
    courseDocs(out); tajweedDocs(out); guideDocs(out); islamDocs(out); handbookDocs(out); adabDocs(out); sistersDocs(out);
    await carouselDocs(out);
    return out;
  })().catch((e) => { built = null; throw e; });
  return built;
}
