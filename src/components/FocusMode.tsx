"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Chapter, Verse } from "@/lib/quran";
import { IconEye, IconNext, IconPause, IconPlay, IconPrev, IconRepeat } from "./Icons";

// Focus mode for listening and reciting, as in the app's reader (mobile/src/features/reader/FocusMode.tsx): the current
// verse with the recited word lit and its translation (can be hidden), the words of the verse as a grid, and a magnifier
// with only the current word, very large, with its transliteration and meaning (not for Arabic). Without word timings
// (or while paused) the magnifier steps through the words (the arrows, the keys ← →; the next word lies to the left).
// Practise covers apply: a covered word shows only once it was recited or revealed here. Controls: repeat, previous /
// next verse, play / pause; Escape closes.
export type Cover = "none" | "hidden" | "soft" | "cue";
const REPEATS = [1, 2, 3, 5, 10];

export default function FocusMode({ chapter, verse, total, activeWord, timed, playing, repeat, coverAt, cueOf, arabicUi, dir, onClose, onToggle, onPrev, onNext, onRepeat, onPlayWord }: {
  chapter: Chapter; verse: Verse; total: number; activeWord: number | null; timed: boolean; playing: boolean; repeat: number;
  /** the cover of word i of n of this verse (the reader's practise / test cover) */
  coverAt: (i: number, n: number) => Cover; cueOf: (word: string) => string; arabicUi: boolean; dir: "ltr" | "rtl";
  onClose: () => void; onToggle: () => void; onPrev: () => void; onNext: () => void; onRepeat: (n: number) => void; onPlayWord: (pos: number) => void;
}) {
  const t = useTranslations("player");
  const r = useTranslations("reader");
  const words = useMemo(() => verse.words.filter((w) => w.char_type_name === "word"), [verse]);
  const [cursor, setCursor] = useState(0);
  const [heard, setHeard] = useState<Set<number>>(() => new Set());
  const [showTr, setShowTr] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => { setCursor(0); setHeard(new Set()); }, [verse.verse_key]);

  // with word timings the magnifier follows the recitation, and every recited word counts as heard
  const following = timed && playing && activeWord != null;
  useEffect(() => {
    if (!following) return;
    const i = words.findIndex((w) => w.position === activeWord);
    if (i < 0) return;
    setCursor(i);
    setHeard((h) => (h.has(i) ? h : new Set(h).add(i)));
  }, [following, activeWord, words]);

  const wi = Math.min(cursor, Math.max(0, words.length - 1));
  const word = words[wi];
  const isHidden = (i: number) => coverAt(i, words.length) !== "none" && !heard.has(i);
  const hiddenNow = word ? isHidden(wi) : false;
  const reveal = (i: number) => setHeard((h) => new Set(h).add(i));
  const step = (d: number) => setCursor((c) => Math.max(0, Math.min(words.length - 1, Math.min(c, words.length - 1) + d)));
  const meaning = !arabicUi && word && !hiddenNow ? word.translation?.text : undefined;
  const translit = !arabicUi && word && !hiddenNow ? word.transliteration?.text : undefined;
  const nextRepeat = REPEATS[(REPEATS.indexOf(repeat) + 1) % REPEATS.length] ?? 1;

  // the page behind stays still; Escape closes; ← → step through the words (Arabic order: the next word is on the left)
  const keys = useRef({ onClose, step });
  keys.current = { onClose, step };
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") keys.current.onClose();
      else if (e.key === "ArrowLeft") keys.current.step(1);
      else if (e.key === "ArrowRight") keys.current.step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, []);
  useEffect(() => { chips.current[wi]?.scrollIntoView({ block: "nearest", inline: "nearest" }); }, [wi]);

  const round = "grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink transition hover:border-ink";
  return (
    <div role="dialog" aria-modal="true" aria-label={`${r("focus")}: ${chapter.name_simple}, ${t("verse")} ${verse.verse_number}/${total}`} className="fixed inset-0 z-[70] flex flex-col bg-bg text-ink">
      {/* bar */}
      <div className="flex h-14 shrink-0 items-center px-2">
        <button ref={closeRef} onClick={onClose} aria-label={t("closeTafsir")} className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="font-callig truncate text-lg leading-7 text-gold" dir="rtl" lang="ar">{chapter.name_arabic}</p>
          <p className="truncate text-xs font-semibold tabular-nums text-muted">{chapter.name_simple} · {verse.verse_number}/{total}</p>
        </div>
        {arabicUi || !verse.translation ? <span className="w-11" /> : (
          <button role="switch" aria-checked={showTr} onClick={() => setShowTr((x) => !x)} aria-label={showTr ? r("hideTranslation") : r("showTranslation")}
            className={`grid h-11 w-11 place-items-center rounded-full hover:bg-surface ${showTr ? "text-accent" : "text-muted"}`}><IconEye /></button>
        )}
      </div>

      {/* surah progress */}
      <div role="progressbar" aria-label={r("verseProgress", { n: verse.verse_number, total })} aria-valuemin={0} aria-valuemax={total} aria-valuenow={verse.verse_number}
        className="mx-4 flex h-[3px] shrink-0 overflow-hidden rounded-full bg-line" dir="rtl">
        <span className="h-full bg-[rgb(201_166_94)] motion-safe:transition-all" style={{ width: `${Math.round((verse.verse_number / Math.max(1, total)) * 1000) / 10}%` }} />
      </div>

      {/* the verse */}
      <div className="max-h-[30vh] shrink-0 overflow-y-auto px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <p className="flex flex-wrap gap-x-2 font-arabic text-[26px] leading-[2.1] sm:text-[30px]" dir="rtl" lang="ar">
            {words.map((w, i) => {
              const c = heard.has(i) ? "none" : coverAt(i, words.length);
              const lit = i === wi;
              return (
                <button key={w.position} type="button" onClick={() => { setCursor(i); if (c !== "none") reveal(i); else onPlayWord(w.position); }}
                  aria-label={c === "none" ? undefined : r(c === "soft" ? "blurredWord" : c === "cue" ? "cueWord" : "hiddenWord", { n: i + 1, total: words.length })}
                  className={`rounded-lg px-1 transition ${lit && c === "none" ? "bg-accent-soft text-accent" : ""} ${c === "hidden" ? "select-none bg-line text-transparent blur-sm" : ""} ${c === "soft" ? "select-none opacity-40 blur-[3px]" : ""} ${c === "cue" ? "text-gold" : ""}`}>
                  {c === "cue" ? cueOf(w.text_uthmani) : w.text_uthmani}
                </button>
              );
            })}
          </p>
          {showTr && !arabicUi && verse.translation ? <p className="mt-2 text-sm leading-relaxed text-muted" dir={dir}>{verse.translation}</p> : null}
        </div>
      </div>

      {/* word by word */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <p className="mx-auto mb-1.5 max-w-3xl text-[11px] font-semibold uppercase tracking-[0.16em] text-muted rtl:tracking-normal">{r("wordGrid")}</p>
        <div className="mx-auto flex max-w-3xl flex-wrap gap-2" dir="rtl">
          {words.map((w, i) => {
            const active = i === wi;
            const hid = isHidden(i);
            return (
              <button key={w.position} ref={(el) => { chips.current[i] = el; }} type="button" onClick={() => setCursor(i)} aria-pressed={active}
                aria-label={`${hid ? r("coveredWord") : w.text_uthmani}, ${r("wordOf", { n: i + 1, total: words.length })}${!arabicUi && !hid && w.translation?.text ? `, ${w.translation.text}` : ""}`}
                className={`grid min-h-11 min-w-16 max-w-[40%] justify-items-center rounded-lg border px-2.5 py-1.5 transition ${active ? "border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15" : "border-line bg-surface hover:border-ink/40"}`}>
                <span className={`font-arabic text-[22px] leading-10 ${hid ? "text-muted" : active ? "text-accent" : ""}`} lang={hid ? undefined : "ar"}>{hid ? "?" : w.text_uthmani}</span>
                {!arabicUi && !hid && w.transliteration?.text ? <span className="max-w-full truncate text-[11px] italic text-gold" dir="ltr">{w.transliteration.text}</span> : null}
                {!arabicUi && !hid && w.translation?.text ? <span className="line-clamp-2 text-[11px] text-muted" dir={dir}>{w.translation.text}</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* the magnifier */}
      <div className="shrink-0 border-t border-[rgb(201_166_94)]/35 bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 pt-3" dir="ltr">
          <button type="button" onClick={() => step(1)} aria-label={r("nextWord")} className={round}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted rtl:tracking-normal" aria-live="polite">{r("magnifier")} · {wi + 1}/{words.length}</p>
            {hiddenNow ? (
              <div className="mx-auto mt-2 grid h-28 w-40 place-items-center rounded-2xl border-[1.5px] border-dashed border-muted bg-line text-5xl font-bold text-muted" aria-label={r("coveredWord")}>?</div>
            ) : (
              <p className={`truncate font-arabic text-[64px] leading-[1.8] sm:text-[96px] ${following ? "text-accent" : ""}`} dir="rtl" lang="ar">{word?.text_uthmani ?? ""}</p>
            )}
            {translit ? <p className="-mt-1 truncate text-[17px] italic text-gold" dir="ltr">{translit}</p> : null}
            {meaning ? <p className="truncate text-base text-muted" dir={dir}>{meaning}</p> : null}
            {hiddenNow ? <p className="mt-2 text-sm font-medium text-muted">{r("coveredWord")}</p> : null}
            <div className="mt-2 flex justify-center">
              {hiddenNow && word ? (
                <button type="button" onClick={() => reveal(wi)} className="btn-gold h-11 rounded-full px-5 text-sm font-bold">{r("revealWord")}</button>
              ) : word ? (
                <button type="button" onClick={() => onPlayWord(word.position)} className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-accent hover:bg-bg">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10v4h4l5 4V6L8 10z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /></svg>
                  {r("hearWord")}
                </button>
              ) : null}
            </div>
          </div>
          <button type="button" onClick={() => step(-1)} aria-label={r("prevWord")} className={round}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>

        {/* controls */}
        <div className="flex items-center justify-center gap-4 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" dir="ltr">
          <button type="button" onClick={() => onRepeat(nextRepeat)} aria-label={`${t("repeat")}: ×${repeat}`}
            className={`inline-flex h-11 min-w-[3.25rem] items-center justify-center gap-1 rounded-full border px-2 text-xs font-semibold tabular-nums ${repeat > 1 ? "border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15" : "border-line bg-surface hover:border-ink"}`}>
            <IconRepeat />×{repeat}
          </button>
          <button type="button" onClick={onPrev} aria-label={t("prev")} className={round}><IconPrev /></button>
          <button type="button" onClick={onToggle} aria-label={playing ? t("pause") : t("play")} className="btn-gold grid h-16 w-16 place-items-center rounded-full shadow-card">{playing ? <IconPause /> : <IconPlay />}</button>
          <button type="button" onClick={onNext} aria-label={t("next")} className={round}><IconNext /></button>
          <span className="w-[3.25rem]" />
        </div>
      </div>
    </div>
  );
}
