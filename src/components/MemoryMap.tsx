"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { VERSE_COUNTS } from "@/lib/counts";
import { JUZ_START, indexOf, keyAt, TOTAL_VERSES } from "@/lib/quranIndex";
import { readSrs, strength, type Srs } from "@/lib/learning";
import { getChapters, type Chapter } from "@/lib/quran";

// Quran map: every box is a surah, a juz or a verse; the colour shows how well you know it right now
type Level = "none" | "weak" | "mid" | "strong";
const COLOR: Record<Level, string> = { none: "bg-line", weak: "bg-red-500/80", mid: "bg-gold/70", strong: "bg-accent" };
const levelOf = (s: number | null): Level => (s === null ? "none" : s >= 0.8 ? "strong" : s >= 0.5 ? "mid" : "weak");

function verseStrength(srs: Srs, key: string): number | null {
  const e = srs[key];
  if (!e) return null;
  const lapsePenalty = Math.min(0.3, (e.lapses ?? 0) * 0.05); // verses you often got wrong count as harder
  return Math.max(0, strength(e) - lapsePenalty);
}

export default function MemoryMap({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("map");
  const locale = useLocale();
  const [srs, setSrs] = useState<Srs>({});
  const [mode, setMode] = useState<"surah" | "juz">("surah");
  const [open, setOpen] = useState<number | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  useEffect(() => {
    const load = () => setSrs(readSrs());
    load();
    getChapters(locale).then(setChapters).catch(() => undefined);
    window.addEventListener("tf-synced", load);
    window.addEventListener("focus", load);
    return () => { window.removeEventListener("tf-synced", load); window.removeEventListener("focus", load); };
  }, [locale]);
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
    const vals = Object.keys(srs).map((k) => levelOf(verseStrength(srs, k)));
    return { strong: vals.filter((x) => x === "strong").length, mid: vals.filter((x) => x === "mid").length, weak: vals.filter((x) => x === "weak").length };
  }, [srs]);

  const box = (u: { learned: number; avg: number | null; cover: number }) => {
    const lv = levelOf(u.avg);
    // partly learned units are drawn lighter
    return `${COLOR[lv]} ${lv !== "none" && u.cover < 0.5 ? "opacity-60" : ""}`;
  };
  const list = mode === "surah" ? surahs : juz;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-md border border-line bg-surface p-1 text-sm font-semibold">
          {(["surah", "juz"] as const).map((m) => <button key={m} onClick={() => { setMode(m); setOpen(null); }} className={`rounded px-3 py-1.5 ${mode === m ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}>{t(m)}</button>)}
        </div>
        <ul className="flex flex-wrap gap-3 text-xs text-muted">
          {(["strong", "mid", "weak", "none"] as Level[]).map((l) => <li key={l} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded-sm ${COLOR[l]}`} />{t(l)}{l !== "none" ? ` · ${totals[l as "strong"]}` : ""}</li>)}
        </ul>
      </div>
      <div className={`mt-4 grid gap-1 ${mode === "surah" ? "grid-cols-[repeat(auto-fill,minmax(1.6rem,1fr))]" : "grid-cols-6 sm:grid-cols-10"}`}>
        {list.map((u) => (
          <button key={u.id} onClick={() => mode === "surah" && setOpen(open === u.id ? null : u.id)} title={mode === "surah" ? `${u.id}. ${name(u.id)} – ${u.learned}/${u.n}` : `Juz ${u.id} – ${u.learned}/${u.n}`}
            className={`relative aspect-square rounded-[4px] text-[10px] font-bold tabular-nums transition hover:scale-110 ${box(u)} ${open === u.id ? "ring-2 ring-ink ring-offset-1" : ""} ${levelOf(u.avg) === "none" ? "text-muted/60" : "text-white"}`}>
            {mode === "juz" || !compact ? u.id : ""}
          </button>
        ))}
      </div>
      {open !== null && mode === "surah" && (
        <div className="mt-5 rounded-lg border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold">{open}. {name(open)}</h3>
            <span className="text-sm text-muted">{t("learnedOf", { n: surahs[open - 1].learned, total: surahs[open - 1].n })}</span>
          </div>
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-1">
            {Array.from({ length: VERSE_COUNTS[open - 1] }, (_, i) => {
              const key = `${open}:${i + 1}`, s = verseStrength(srs, key), lv = levelOf(s);
              return <Link key={key} href={`/surah/${open}?v=${i + 1}${lv === "none" ? "&shams=1" : "&m=2"}`} title={`${key}${s !== null ? ` · ${Math.round(s * 100)}%` : ""}`} className={`grid aspect-square place-items-center rounded-[4px] text-[10px] font-bold tabular-nums hover:scale-110 ${COLOR[lv]} ${lv === "none" ? "text-muted" : "text-white"}`}>{i + 1}</Link>;
            })}
          </div>
          <p className="mt-3 text-xs text-muted">{t("tapVerse")}</p>
        </div>
      )}
    </div>
  );
}
