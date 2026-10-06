"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { VERSE_COUNTS } from "@/lib/counts";
import { JUZ_START, indexOf, keyAt, TOTAL_VERSES } from "@/lib/quranIndex";
import { readSrs, strength, type Srs } from "@/lib/learning";
import { NOT_COUNTED } from "@/lib/coach";
import { getChapters, type Chapter } from "@/lib/quran";
import { fill, journeyText } from "@/lib/journey";
import SurahQuiz from "./SurahQuiz";

// Quran map: every box is a surah, a juz or a verse; the colour shows how well you know it right now
type Level = "none" | "weak" | "mid" | "strong";
const COLOR: Record<Level, string> = { none: "bg-[rgb(var(--line))]", weak: "bg-red-500/80", mid: "bg-gold/70", strong: "bg-accent" };
const levelOf = (s: number | null): Level => (s === null ? "none" : s >= 0.8 ? "strong" : s >= 0.5 ? "mid" : "weak");

function verseStrength(srs: Srs, key: string): number | null {
  const e = srs[key];
  if (!e) return null;
  const lapsePenalty = Math.min(0.3, (e.lapses ?? 0) * 0.05); // verses you often got wrong count as harder
  return Math.max(0, strength(e) - lapsePenalty);
}

// example progress for visitors: the short surahs at the end are learned first, a few longer ones in progress
function demoSrs(): Srs {
  const out: Srs = {};
  const t0 = Math.floor(Date.now() / 86400000);
  const put = (s: number, from: number, to: number, stage: number, overdue: number, lapses = 0) => { for (let v = from; v <= to; v++) out[`${s}:${v}`] = { stage, due: t0 - overdue, last: t0 - overdue - 1, lapses }; };
  for (let s = 100; s <= 114; s++) put(s, 1, VERSE_COUNTS[s - 1], 4, 0);
  put(1, 1, 7, 5, 0);
  for (let s = 93; s <= 99; s++) put(s, 1, VERSE_COUNTS[s - 1], s % 2 ? 3 : 2, s % 3 ? 2 : 9, s === 96 ? 3 : 0);
  for (let s = 87; s <= 92; s++) put(s, 1, Math.ceil(VERSE_COUNTS[s - 1] / (s % 2 ? 1 : 2)), 1, 6, s === 89 ? 4 : 1);
  put(36, 1, 30, 2, 5, 1); put(67, 1, 30, 3, 1); put(18, 1, 10, 1, 12, 3); put(2, 255, 257, 4, 0); put(55, 1, 40, 2, 4);
  return out;
}

export default function MemoryMap({ compact = false, demo = false, dark = false }: { compact?: boolean; demo?: boolean; dark?: boolean }) {
  const t = useTranslations("map");
  const locale = useLocale();
  const [srs, setSrs] = useState<Srs>({});
  const [mode, setMode] = useState<"surah" | "juz">("surah");
  const [open, setOpen] = useState<number | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [quiz, setQuiz] = useState(false);
  const J = journeyText(locale).map;
  useEffect(() => {
    const load = () => setSrs(demo ? demoSrs() : readSrs());
    load();
    getChapters(locale).then(setChapters).catch(() => undefined);
    window.addEventListener("tf-synced", load);
    window.addEventListener("focus", load);
    return () => { window.removeEventListener("tf-synced", load); window.removeEventListener("focus", load); };
  }, [locale, demo]);
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${s}`;

  // aggregate: average strength over all verses of the unit (unlearned verses count as 0) + share learned
  const unit = (from: number, to: number) => {
    let sum = 0, learned = 0;
    for (let i = from; i < to; i++) { const k = keyAt(i); const s = verseStrength(srs, `${k.s}:${k.v}`); if (s !== null) { learned++; sum += s; } }
    const n = to - from;
    return { learned, n, avg: learned ? sum / learned : null, cover: learned / n };
  };
  const surahs = useMemo(() => VERSE_COUNTS.map((c, i) => ({ id: i + 1, ...unit(indexOf(i + 1, 1), indexOf(i + 1, 1) + c) })), [srs]); // eslint-disable-line react-hooks/exhaustive-deps
  const juz = useMemo(() => JUZ_START.map((k, i) => {
    const [s, v] = k.split(":").map(Number); const from = indexOf(s, v);
    const to = i < 29 ? indexOf(...(JUZ_START[i + 1].split(":").map(Number) as [number, number])) : TOTAL_VERSES;
    return { id: i + 1, ...unit(from, to) };
  }), [srs]); // eslint-disable-line react-hooks/exhaustive-deps
  const totals = useMemo(() => {
    const vals = Object.keys(srs).filter((k) => !NOT_COUNTED.has(k)).map((k) => levelOf(verseStrength(srs, k)));
    return { strong: vals.filter((x) => x === "strong").length, mid: vals.filter((x) => x === "mid").length, weak: vals.filter((x) => x === "weak").length };
  }, [srs]);

  const box = (u: { learned: number; avg: number | null; cover: number }) => {
    const lv = levelOf(u.avg);
    // partly learned units are drawn lighter
    return `${COLOR[lv]} ${lv !== "none" && u.cover < 0.5 ? "opacity-60" : ""}`;
  };
  const list = mode === "surah" ? surahs : juz;

  // the open surah: next verse to learn, weak and wobbling verses, learned verses (basmala of al-Fatiha excluded)
  const detail = useMemo(() => {
    if (open === null) return null;
    const weak: number[] = [], mid: number[] = [], learned: number[] = [];
    let next: number | null = null;
    for (let v = 1; v <= VERSE_COUNTS[open - 1]; v++) {
      const key = `${open}:${v}`;
      if (NOT_COUNTED.has(key)) continue;
      const lv = levelOf(verseStrength(srs, key));
      if (lv === "none") { next ??= v; continue; }
      learned.push(v);
      if (lv === "weak") weak.push(v); else if (lv === "mid") mid.push(v);
    }
    return { weak, mid, learned, next };
  }, [open, srs]);
  const act = `inline-flex min-h-10 w-full items-center justify-center rounded-md border px-3.5 py-2 text-center text-sm font-semibold leading-snug transition sm:w-auto ${dark ? "border-white/15 hover:border-white/50" : "border-line bg-surface hover:border-ink"}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`inline-flex rounded-md border p-1 text-sm font-semibold ${dark ? "border-white/15 bg-white/5" : "border-line bg-surface"}`}>
          {(["surah", "juz"] as const).map((m) => <button key={m} onClick={() => { setMode(m); setOpen(null); }} className={`rounded px-3 py-1.5 ${mode === m ? (dark ? "bg-white text-[rgb(var(--stage))]" : "bg-ink text-bg") : dark ? "text-white/60 hover:text-white" : "text-muted hover:text-ink"}`}>{t(m)}</button>)}
        </div>
        <ul className={`flex flex-wrap gap-3 text-xs ${dark ? "text-white/70" : "text-muted"}`}>
          {(["strong", "mid", "weak", "none"] as Level[]).map((l) => <li key={l} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded-sm ${COLOR[l]}`} />{t(l)}{l !== "none" ? ` · ${totals[l as "strong"]}` : ""}</li>)}
        </ul>
      </div>
      <div className={`mt-4 grid gap-1 ${mode === "surah" ? "grid-cols-[repeat(auto-fill,minmax(1.6rem,1fr))]" : "grid-cols-6 sm:grid-cols-10"}`}>
        {list.map((u) => (
          <button key={u.id} data-surah={mode === "surah" ? u.id : undefined} onClick={() => { if (mode === "surah") { setOpen(open === u.id ? null : u.id); setQuiz(false); } }} title={mode === "surah" ? `${u.id}. ${name(u.id)} – ${u.learned}/${u.n}` : `Juz ${u.id} – ${u.learned}/${u.n}`}
            className={`relative aspect-square rounded-[4px] text-[10px] font-bold tabular-nums transition hover:scale-110 ${box(u)} ${open === u.id ? "ring-2 ring-ink ring-offset-1" : ""} ${levelOf(u.avg) === "none" ? (dark ? "bg-white/10 text-white/40" : "text-muted/60") : "text-white"}`}>
            {mode === "juz" || !compact ? u.id : ""}
          </button>
        ))}
      </div>
      {open !== null && mode === "surah" && (
        <div className={`mt-5 rounded-lg border p-4 ${dark ? "border-white/10 bg-white/[0.04]" : "border-line bg-surface"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold">{open}. {name(open)}</h3>
            <span className={`text-sm ${dark ? "text-white/60" : "text-muted"}`}>{t("learnedOf", { n: surahs[open - 1].learned, total: surahs[open - 1].n })}</span>
          </div>
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-1">
            {Array.from({ length: VERSE_COUNTS[open - 1] }, (_, i) => {
              const key = `${open}:${i + 1}`, s = verseStrength(srs, key), lv = levelOf(s);
              return <Link key={key} href={`/surah/${open}?v=${i + 1}${lv === "none" ? "&shams=1" : "&m=2"}`} title={`${key}${s !== null ? ` · ${Math.round(s * 100)}%` : ""}`} className={`grid aspect-square place-items-center rounded-[4px] text-[10px] font-bold tabular-nums hover:scale-110 ${COLOR[lv]} ${lv === "none" ? "text-muted" : "text-white"}`}>{i + 1}</Link>;
            })}
          </div>
          <p className={`mt-3 text-xs ${dark ? "text-white/50" : "text-muted"}`}>{t("tapVerse")}</p>
          {detail && (
            <div className={`mt-4 border-t pt-4 ${dark ? "border-white/10" : "border-line"}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold))] rtl:tracking-normal">{J.actions}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {detail.next !== null
                  ? <Link href={`/surah/${open}?v=${detail.next}&shams=1`} className="btn-gold inline-flex min-h-10 w-full items-center justify-center rounded-md px-4 py-2 text-center text-sm font-bold leading-snug sm:w-auto">{fill(J.learnNext, { key: `${open}:${detail.next}` })}</Link>
                  : <span className={`inline-flex min-h-10 items-center text-sm font-semibold ${dark ? "text-[rgb(var(--gold))]" : "text-accent"}`}>{J.allLearned}</span>}
                {detail.weak.length > 0
                  ? <Link href={`/surah/${open}?v=${detail.weak[0]}&m=2`} className={act}>{fill(J.repeatWeak, { n: detail.weak.length })}</Link>
                  : detail.mid.length > 0 && <Link href={`/surah/${open}?v=${detail.mid[0]}&m=2`} className={act}>{fill(J.refreshMid, { n: detail.mid.length })}</Link>}
                <Link href={`/surah/${open}`} className={act}>{J.listen}</Link>
                {!demo && detail.learned.length >= 3 && <button onClick={() => setQuiz(!quiz)} aria-expanded={quiz} className={`${act} ${quiz ? "border-[rgb(var(--gold))]/60" : ""}`}>{J.quiz}</button>}
              </div>
              {!demo && detail.learned.length > 0 && detail.learned.length < 3 && <p className={`mt-2 text-xs ${dark ? "text-white/50" : "text-muted"}`}>{J.quizNeed}</p>}
              {quiz && !demo && <SurahQuiz key={open} surah={open} learned={detail.learned} dark={dark} onClose={() => setQuiz(false)} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
