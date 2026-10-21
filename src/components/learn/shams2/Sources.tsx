"use client";
// The verses and hadith of the Shams Method page (/shams), rendered from their sources (BLUEPRINT §4: nothing is typed):
// verses from the website's Quran store (/api/q: Uthmani text and the translation in the page's language, none in
// Arabic), the demo verse's words with first-letter cues derived from them, and the hadith of "Why learning the Quran
// matters" from fawazahmed0/hadith-api. A source that cannot be reached leaves its item out; nothing replaces it.
// App: mobile/src/features/library/shamsSources.tsx
import { useEffect, useState, type ReactNode } from "react";
import { useLang } from "@/lib/learn/i18n";
import { getResources, translationFor } from "@/lib/learn/quran";
import { firstLetter } from "@/lib/learn/shams2/memory";
import { loadShamsHadith, HADITH_API_NAME, SHAMS_DEMO_KEY, type ShamsHadith, type ShamsWhyItem } from "@/lib/shamsContent";
import { loadVerseByKey, useVerseByKey } from "@/components/learn/QuranVerse";
import IslamShamsDemo from "@/components/art/IslamShamsDemo";
import { IslamStarMark, starPath } from "@/components/art/IslamArt";

/** the name of the translation shown in this language (its source), once */
const names = new Map<string, Promise<string>>();
function useTranslationName(): string {
  const { lang } = useLang();
  const [name, setName] = useState("");
  useEffect(() => {
    if (lang === "ar") { setName(""); return; }
    let live = true;
    let p = names.get(lang);
    if (!p) {
      p = Promise.all([translationFor(lang), getResources()]).then(([id, r]) => { const t = r.translations.find((x) => x.id === id); return t ? t.author_name || t.name : ""; });
      p.catch(() => names.delete(lang));
      names.set(lang, p);
    }
    p.then((n) => { if (live) setName(n); }).catch(() => undefined);
    return () => { live = false; };
  }, [lang]);
  return name;
}

/** "Why Shams": a verse in its card (Arabic, translation, reference with the translation's author) */
export function ShamsNameVerse({ verseKey, label }: { verseKey: string; label: string }) {
  const { verse, error } = useVerseByKey(verseKey);
  const tr = useTranslationName();
  if (error) return <p className="mt-3"><span className="isl-ref"><IslamStarMark />{label}</span></p>;
  return (
    <>
      {verse ? <p className="font-arabic text-[26px] leading-[1.9] text-[rgb(var(--isl-head))] sm:text-[30px]" dir="rtl" lang="ar">{verse.text_uthmani}</p>
        : <span aria-hidden className="mx-auto block h-12 max-w-md animate-pulse rounded-md bg-line/50" />}
      {verse?.translation ? <p className="mx-auto mt-1 max-w-md text-[15px] text-muted">{verse.translation}</p> : null}
      <p className="mt-3"><span className="isl-ref"><IslamStarMark />{label}{verse?.translation && tr ? ` · ${tr}` : ""}</span></p>
    </>
  );
}

/** step 7: the verse the "why" text refers to, on the dark journey card */
export function ShamsStepVerse({ verseKey }: { verseKey: string }) {
  const { verse, error } = useVerseByKey(verseKey);
  const tr = useTranslationName();
  if (error) return null;
  return (
    <figure className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
      {verse ? <p className="font-arabic text-[22px] leading-[2] text-white" dir="rtl" lang="ar">{verse.text_uthmani}</p>
        : <span aria-hidden className="block h-10 animate-pulse rounded-md bg-white/10" />}
      {verse?.translation ? <p className="mt-2 text-[14.5px] leading-relaxed text-white/80">{verse.translation}</p> : null}
      <figcaption className="mt-2 text-[12px] font-semibold text-[rgb(233_207_153)]">{verseKey}{verse?.translation && tr ? ` · ${tr}` : ""}</figcaption>
    </figure>
  );
}

/** "One verse, four stages": the words of 1:2 from the Quran store, the cues derived with firstLetter() */
export function ShamsDemoLive({ stages, title }: { stages: string[]; title: string }) {
  const { lang } = useLang();
  const [words, setWords] = useState<string[] | null>(null);
  useEffect(() => {
    let live = true;
    loadVerseByKey(SHAMS_DEMO_KEY, lang)
      .then((v) => { if (live) setWords(v.text_uthmani.split(/\s+/).filter((w) => /[ء-يٱ-ۓ]/.test(w))); })
      .catch(() => { if (live) setWords([]); });
    return () => { live = false; };
  }, [lang]);
  if (!words) return <div aria-hidden className="isl-card min-h-[320px] animate-pulse" />;
  if (!words.length) return null;
  return <IslamShamsDemo words={words} cues={words.map(firstLetter)} stages={stages} title={title} />;
}

const mem = new Map<string, Promise<unknown>>();
function getJSON(url: string): Promise<unknown> {
  let p = mem.get(url);
  if (!p) {
    p = fetch(url, { headers: { Accept: "application/json" } }).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); });
    p.catch(() => mem.delete(url));
    mem.set(url, p);
  }
  return p;
}

function Quote({ wide, children, cite }: { wide?: boolean; children: ReactNode; cite: string }) {
  return (
    <li className={wide ? "md:col-span-2" : ""}>
      <figure className="isl-quote !my-0 h-full">
        <span className="isl-quote-star"><svg viewBox="0 0 24 24" className="h-full w-full"><path d={starPath(12, 12, 11, 5)} fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1" /><circle cx="12" cy="12" r="2.2" fill="currentColor" /></svg></span>
        {children}
        <figcaption><span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--isl-gold))]">{cite}</span></figcaption>
      </figure>
    </li>
  );
}

function HadithQuote({ item, cite }: { item: Extract<ShamsWhyItem, { kind: "hadith" }>; cite: string }) {
  const { lang } = useLang();
  const [h, setH] = useState<ShamsHadith | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    setH(undefined);
    loadShamsHadith(item.collection, item.number, lang, getJSON).then((x) => { if (live) setH(x); }).catch(() => { if (live) setH(null); });
    return () => { live = false; };
  }, [item.collection, item.number, lang]);
  if (h === null) return null;
  return (
    <Quote cite={`${cite} · ${HADITH_API_NAME}`}>
      {h === undefined ? <span aria-hidden className="block h-16 animate-pulse rounded-md bg-line/50" /> : (
        <>
          {h.arabic ? <p className="font-arabic text-[20px] leading-[1.9] text-[rgb(var(--isl-head))]" dir="rtl" lang="ar">{h.arabic}</p> : null}
          {h.text ? <blockquote className={`text-[16px] sm:text-[17px] ${h.arabic ? "mt-3" : ""}`} lang={h.textLang ?? undefined}>{h.text}</blockquote> : null}
        </>
      )}
    </Quote>
  );
}

function VerseQuote({ verseKey, cite, wide }: { verseKey: string; cite: string; wide?: boolean }) {
  const { verse, error } = useVerseByKey(verseKey);
  const tr = useTranslationName();
  if (error) return null;
  return (
    <Quote wide={wide} cite={`${cite}${verse?.translation && tr ? ` · ${tr}` : ""}`}>
      {verse ? (
        <>
          <p className="font-arabic text-[22px] leading-[1.9] text-[rgb(var(--isl-head))]" dir="rtl" lang="ar">{verse.text_uthmani}</p>
          {verse.translation ? <blockquote className="mt-3 text-[17px] sm:text-[19px]">{verse.translation}</blockquote> : null}
        </>
      ) : <span aria-hidden className="block h-16 animate-pulse rounded-md bg-line/50" />}
    </Quote>
  );
}

/** "Why learning the Quran matters": the hadith and the verse by reference; cites = the labels (shams.why1s …) */
export function ShamsWhyList({ items, cites, note }: { items: ShamsWhyItem[]; cites: string[]; note?: string }) {
  return (
    <>
      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {items.map((it, i) => it.kind === "hadith"
          ? <HadithQuote key={i} item={it} cite={cites[i]} />
          : <VerseQuote key={i} verseKey={it.key} cite={cites[i]} wide={i === items.length - 1} />)}
      </ul>
      {note ? <p className="mx-auto mt-6 max-w-3xl text-center text-[13px] leading-relaxed text-muted">{note}</p> : null}
    </>
  );
}
