"use client";
// mirrors mobile/src/features/shams2/Tadabbur.tsx: Tadabbur & Maqāṣid – what the Qurʾān wants to teach; understanding
// makes memorising easier. Surah card (central theme, setting, asbāb al-nuzūl where well known, links to the
// neighbouring surahs, key lessons), the structure by sections with "what this teaches us", a practical takeaway and
// questions for reflection, plus live tafsir of each verse from the reader's tafsir sources (Quran.com; the website's
// own tafsir first when one exists for this language). Also the compact Briefing used in the wird and the drills.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { maqasidOf, sectionOf, type L, type LL, type Section } from "@/lib/learn/shams2/maqasid";
import { useS2, type CL } from "@/lib/learn/shams2/text";
import { LimitError, OWN_TAFSIR_ID, getOwnTafsir, getResources, getTafsir, hasOwnTafsir, tafsirBlocks, tafsirOptionsFor, type Resource, type Tafsir } from "@/lib/learn/quran";
import { readJSON, writeJSON } from "@/lib/learn/store";
import { useLang } from "@/lib/learn/i18n";
import { Card, GoldLink, LearnHero, LearnMain, Spinner } from "@/components/learn/ui";
import { Chip, Fold, NamesProvider, S2Kicker, SourceNote, useBack, useNames, useWebT, type NameRow } from "./ui";

const pick = (x: L, cl: CL) => x[cl] || x.en;
const pickL = (x: LL | undefined, cl: CL) => (x ? (x[cl]?.length ? x[cl] : x.en) : []);

function Bullets({ items, accent }: { items: string[]; accent?: boolean }) {
  return (
    <ul className="grid gap-1.5">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed">
          <span aria-hidden className={`mt-[0.6em] h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] ${accent ? "bg-accent" : "bg-[rgb(var(--hm-gold))]"}`} />
          <span className="min-w-0">{x}</span>
        </li>
      ))}
    </ul>
  );
}

/** "What this teaches us" for one section – shown before the sabaq and as a review prompt */
export function SectionLessons({ s: surah, section, compact }: { s: number; section: Section; compact?: boolean }) {
  const { s, cl, nf } = useS2();
  const lessons = pickL(section.lessons, cl);
  const qs = pickL(section.questions, cl);
  return (
    <div className="grid gap-2">
      {compact && <p className="text-[15px] font-bold">{`${pick(section.title, cl)} · ${s("versesAB", { a: nf(section.from), b: nf(section.to) })}`}</p>}
      {lessons.length > 0 && <><S2Kicker>{s("teachesUs")}</S2Kicker><Bullets items={compact ? lessons.slice(0, 2) : lessons} /></>}
      {section.takeaway && <p className="rounded-lg bg-accent-soft p-3 text-[14px] font-semibold leading-relaxed text-accent">{`${s("takeaway")}: ${pick(section.takeaway, cl)}`}</p>}
      {!compact && qs.length > 0 && <><S2Kicker>{s("reflect")}</S2Kicker><Bullets items={qs} accent /></>}
      {compact && <Link href={`/shams/tadabbur?s=${surah}&v=${section.from}`} className="w-fit text-[13px] font-semibold text-accent hover:underline">{s("moreTadabbur")}</Link>}
    </div>
  );
}

/** compact briefing for the verse where the sabaq starts (or a review prompt) – nothing when no content exists */
export function Briefing({ s: surah, v, review }: { s: number; v: number; review?: boolean }) {
  const { s, cl } = useS2();
  const m = maqasidOf(surah);
  const sec = sectionOf(surah, v);
  if (!m) return null;
  if (review) {
    const qs = [...pickL(sec?.questions, cl), ...pickL(m.questions, cl)];
    if (!qs.length) return null;
    return <p className="text-[13.5px] italic leading-relaxed text-muted">{`${s("reflect")}: ${qs[(surah * 31 + v) % qs.length]}`}</p>;
  }
  if (sec?.lessons) return <div className="rounded-lg border border-[rgb(var(--hm-gold))]/45 p-3"><SectionLessons s={surah} section={sec} compact /></div>;
  return (
    <Link href={`/shams/tadabbur?s=${surah}&v=${v}`} className="grid gap-1 rounded-lg border border-[rgb(var(--hm-gold))]/45 p-3 transition hover:bg-[rgb(var(--hm-gold))]/[0.06]">
      <S2Kicker>{s("maqsad")}</S2Kicker>
      <span className="text-[14px] leading-relaxed">{pick(m.theme, cl)}</span>
      <span className="text-[13px] font-semibold text-accent">{s("moreTadabbur")}</span>
    </Link>
  );
}

// ---------- live tafsir (mirrors mobile/src/features/quran/TafsirPanel.tsx in a reduced form) ----------
const TAFSIR_KEY = "qmc.tafsir";
const RTL_LANGS = ["arabic", "urdu", "persian", "farsi", "pashto", "kurdish", "sindhi", "uyghur", "hebrew", "dhivehi"];
const cache = new Map<string, Tafsir | null>();

function TafsirPanel({ surah, verse }: { surah: number; verse: number }) {
  const { lang } = useLang();
  const w = useWebT();
  const [opts, setOpts] = useState<Resource[]>([]);
  const [id, setId] = useState<number | null>(null);
  const [tafsir, setTafsir] = useState<Tafsir | null | undefined>(undefined);
  const [limit, setLimit] = useState(false);
  const tick = useRef(0);
  useEffect(() => {
    let off = false;
    setId(readJSON<number | null>(TAFSIR_KEY, null));
    Promise.all([getResources(), hasOwnTafsir(lang)])
      .then(([r, own]) => {
        if (off) return;
        const { options } = tafsirOptionsFor(lang, r.tafsirs);
        setOpts(own ? [{ id: OWN_TAFSIR_ID, name: "Quran Masterclass", author_name: "", language_name: lang }, ...options] : options);
      })
      .catch(() => { if (!off) setOpts([{ id: 169, name: "Ibn Kathir (Abridged)", author_name: "Hafiz Ibn Kathir", language_name: "english" }]); });
    return () => { off = true; };
  }, [lang]);
  const active = useMemo(() => (opts.some((o) => o.id === id) ? id : opts[0]?.id ?? null), [opts, id]);
  const source = opts.find((o) => o.id === active);
  useEffect(() => {
    if (active === null) return;
    const run = ++tick.current;
    setTafsir(undefined); setLimit(false);
    (async () => {
      try {
        if (active === OWN_TAFSIR_ID) { const r = await getOwnTafsir(lang, surah, verse); if (run === tick.current) setTafsir(r); return; }
        // an empty entry belongs to the nearest earlier verse (tafsir of a passage)
        for (let n = verse; n >= 1; n--) {
          const key = `${active}:${surah}:${n}`;
          let r = cache.get(key);
          if (r === undefined) { r = await getTafsir(active, `${surah}:${n}`, n === verse); cache.set(key, r); }
          if (run !== tick.current) return;
          if (r) { setTafsir(r); return; }
        }
        if (run === tick.current) setTafsir(null);
      } catch (e) {
        if (run !== tick.current) return;
        if (e instanceof LimitError) setLimit(true);
        setTafsir(null);
      }
    })();
  }, [active, surah, verse, lang]);
  const rtl = RTL_LANGS.includes((source?.language_name ?? "").toLowerCase());
  return (
    <div className="grid gap-2.5 rounded-lg border border-line p-3.5">
      {opts.length > 1 && (
        <label className="grid gap-1 text-[12.5px] font-semibold text-muted">
          {w.tafsirSource}
          <select value={active ?? ""} onChange={(e) => { const v = Number(e.target.value); setId(v); writeJSON(TAFSIR_KEY, v); }} className="h-10 rounded-md border border-line bg-surface px-2 text-[14px] font-normal text-ink">
            {opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </label>
      )}
      {tafsir === undefined ? <Spinner label={w.loading} /> : limit ? (
        <p className="text-[13.5px] text-muted">{w.tafsirLimit} <Link href={`/surah/${surah}?v=${verse}`} className="font-semibold text-accent hover:underline">{w.openReader}</Link></p>
      ) : !tafsir ? <p className="text-[13.5px] text-muted">{w.tafsirNone}</p> : (
        <div dir={rtl ? "rtl" : "ltr"} className="grid max-h-[28rem] gap-2 overflow-y-auto pe-1">
          {tafsirBlocks(tafsir.html).map((b, i) => b.kind === "h" ? <p key={i} className="text-[15px] font-bold">{b.text}</p>
            : b.kind === "ar" ? <p key={i} lang="ar" dir="rtl" className="font-arabic text-[20px] leading-[1.9]">{b.text}</p>
            : <p key={i} className="text-[14.5px] leading-relaxed">{b.text}</p>)}
        </div>
      )}
      {source && tafsir && <p className="text-[12px] text-muted">{`${source.name}${source.author_name ? ` · ${source.author_name}` : ""}`}</p>}
    </div>
  );
}

function SectionTafsir({ surah, sec }: { surah: number; sec: Section }) {
  const { s, nf } = useS2();
  const [tv, setTv] = useState(sec.from);
  const verses = Array.from({ length: Math.min(40, sec.to - sec.from + 1) }, (_, i) => sec.from + i);
  return (
    <div className="grid gap-2">
      <S2Kicker>{s("liveTafsir")}</S2Kicker>
      <div className="flex flex-wrap gap-1.5">{verses.map((v) => <Chip key={v} label={nf(v)} on={v === tv} onClick={() => setTv(v)} ariaLabel={s("verseN", { v: nf(v) })} />)}</div>
      <TafsirPanel key={`${surah}:${tv}`} surah={surah} verse={tv} />
    </div>
  );
}

function Screen({ surah, verse }: { surah: number; verse?: number }) {
  const { s, cl, nf } = useS2();
  const { name, arabic, place } = useNames();
  const m = maqasidOf(surah);
  const initial = verse && m ? Math.max(0, m.sections.findIndex((x) => verse >= x.from && verse <= x.to)) : 0;
  const [open, setOpen] = useState<Set<number>>(() => new Set([initial]));
  const p = place(surah);
  const toggle = (i: number, on: boolean) => setOpen((o) => { const n = new Set(o); if (on) n.add(i); else n.delete(i); return n; });
  return (
    <>
      <LearnHero back={useBack()} kicker={s("tadabburEyebrow")} title={`${nf(surah)}. ${name(surah)}`} lead={m ? pick(m.theme, cl) : s("noMaqasid")} word={arabic(surah) || "تدبر"} uid="s2t">
        {surah > 1 && <Link href={`/shams/tadabbur?s=${surah - 1}`} className="inline-flex min-h-10 items-center rounded-full border border-[rgb(var(--gold))]/40 px-4 text-[13.5px] font-semibold text-white hover:border-[rgb(var(--gold))]"><span aria-hidden className="me-1 rtl:-scale-x-100">←</span>{`${nf(surah - 1)}. ${name(surah - 1)}`}</Link>}
        {surah < 114 && <Link href={`/shams/tadabbur?s=${surah + 1}`} className="inline-flex min-h-10 items-center rounded-full border border-[rgb(var(--gold))]/40 px-4 text-[13.5px] font-semibold text-white hover:border-[rgb(var(--gold))]">{`${nf(surah + 1)}. ${name(surah + 1)}`}<span aria-hidden className="ms-1 rtl:-scale-x-100">→</span></Link>}
      </LearnHero>
      <LearnMain className="grid gap-5">
        {m ? (
          <>
            <Card className="grid gap-3">
              <S2Kicker>{s("context")}</S2Kicker>
              {p && <p className="text-[13px] font-semibold text-muted">{p === "madinah" ? s("medinan") : s("meccan")}</p>}
              <p className="text-[15px] leading-relaxed">{pick(m.context, cl)}</p>
              {m.asbab && <><S2Kicker>{s("asbab")}</S2Kicker><p className="text-[15px] leading-relaxed">{pick(m.asbab, cl)}</p></>}
              <S2Kicker>{s("connects")}</S2Kicker>
              <p className="text-[15px] leading-relaxed">{pick(m.connects, cl)}</p>
              <S2Kicker>{s("keyLessons")}</S2Kicker>
              <Bullets items={pickL(m.lessons, cl)} />
              {m.questions && <><S2Kicker>{s("reflect")}</S2Kicker><Bullets items={pickL(m.questions, cl)} accent /></>}
              <SourceNote src={m.src} review={m.review} />
            </Card>
            <h2 className="font-display text-[24px]">{s("structure")}</h2>
            <div className="grid gap-2.5">
              {m.sections.map((x, i) => (
                <Fold key={`${x.from}-${x.to}`} meta={`${nf(x.from)}–${nf(x.to)}`} title={pick(x.title, cl)} defaultOpen={i === initial} onToggle={(on) => toggle(i, on)}>
                  {x.lessons && <SectionLessons s={surah} section={x} />}
                  <GoldLink href={`/surah/${surah}?v=${x.from}&shams=1`} className="w-fit">{s("memoriseSection")}</GoldLink>
                  {open.has(i) && <SectionTafsir surah={surah} sec={x} />}
                </Fold>
              ))}
            </div>
          </>
        ) : (
          <Card className="grid gap-3"><p className="text-[15px] text-muted">{s("noMaqasid")}</p><TafsirPanel surah={surah} verse={verse ?? 1} /></Card>
        )}
        <p className="text-[12.5px] leading-relaxed text-muted">{s("tadabburNote")}</p>
      </LearnMain>
    </>
  );
}

export function TadabburScreen({ surah, verse, names }: { surah: number; verse?: number; names?: NameRow[] }) {
  return <NamesProvider names={names ?? null}><Screen surah={surah} verse={verse} /></NamesProvider>;
}
