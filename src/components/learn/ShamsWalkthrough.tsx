"use client";
// Interactive walkthrough of the Shams steps with a real verse (Al-Fatihah 1:2, text, word-by-word meaning, timing
// segments and the chosen reciter's audio all from the existing Quran data – no hand-typed Arabic). Audio plays only
// on tap; the caption is always visible; during "Hear" the word being recited is highlighted from the audio segments.
// "Recall" is the try-it-yourself part: only first letters, tap a word to check yourself.
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useLang } from "@/lib/learn/i18n";
import { getVerses, type Verse } from "@/lib/learn/quran";
import { useAllowedReciter } from "@/lib/learn/reciter";
import { firstLetter } from "@/lib/learn/shams2/memory";
import { SHAMS_DEMO_KEY } from "@/lib/shamsContent";

const N = 6;
// the translation comes with footnote markers and tags from Quran.com; shown as plain text only
const plain = (html: string) => html.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export default function ShamsWalkthrough({ className = "" }: { className?: string }) {
  const t = useTranslations("shamsWhy");
  const { lang } = useLang();
  const reciter = useAllowedReciter();
  const [vs, setVs] = useState<{ prev?: Verse; v: Verse; next?: Verse } | null | false>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(-1);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const audio = useRef<HTMLAudioElement | null>(null);
  const [ch, vn] = SHAMS_DEMO_KEY.split(":").map(Number);

  useEffect(() => {
    let live = true;
    getVerses(ch, lang, reciter).then((all) => {
      const i = all.findIndex((x) => x.verse_number === vn);
      if (live) setVs(i >= 0 ? { prev: all[i - 1], v: all[i], next: all[i + 1] } : false);
    }).catch(() => { if (live) setVs(false); });
    return () => { live = false; };
  }, [ch, vn, lang, reciter]);

  useEffect(() => () => { audio.current?.pause(); }, []);

  if (vs === false) return null;
  const words = vs ? vs.v.words.filter((w) => w.char_type_name === "word") : [];

  const play = () => {
    if (!vs) return;
    if (playing) { audio.current?.pause(); return; }
    const a = audio.current ?? new Audio();
    audio.current = a;
    if (a.src !== vs.v.audioUrl) a.src = vs.v.audioUrl;
    a.currentTime = 0;
    a.ontimeupdate = () => {
      const ms = a.currentTime * 1000;
      const s = vs.v.segments.find((g) => ms >= g.start && ms < g.end);
      setCur(s ? s.word - 1 : -1);
    };
    a.onpause = a.onended = () => { setPlaying(false); setCur(-1); };
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const go = (n: number) => { setStep(Math.max(0, Math.min(N - 1, n))); setShown(new Set()); };
  const capWord = cur >= 0 ? words[cur]?.translation?.text : undefined;

  return (
    <section aria-labelledby="shams-wt-title" className={className}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("wtKicker")}</p>
      <h2 id="shams-wt-title" className="font-display mt-3 text-3xl leading-[1.1] sm:text-[40px]">{t("wtTitle")}</h2>
      <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-muted">{t("wtLead")}</p>

      <div className="stage girih mt-6 overflow-hidden rounded-2xl border border-[rgb(var(--gold))] p-4 text-white sm:p-7">
        <ol className="flex gap-1.5 overflow-x-auto pb-1" role="tablist">
          {Array.from({ length: N }, (_, i) => (
            <li key={i} className="shrink-0">
              <button type="button" role="tab" aria-selected={i === step} onClick={() => go(i)}
                className={`h-9 rounded-full px-3 text-[13px] font-bold transition ${i === step ? "bg-[rgb(var(--gold))] text-[#1a1408]" : "border border-white/20 text-white/75 hover:border-white/50"}`}>
                {i + 1}. {t(`wtStep${i + 1}`)}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-5 min-h-[170px]" aria-live="polite">
          {!vs ? <div aria-hidden className="h-[150px] animate-pulse rounded-xl bg-white/5" /> : (
            <>
              <p className="font-arabic text-center text-[28px] leading-[2] sm:text-[34px]" dir="rtl" lang="ar">
                {words.map((w, i) => {
                  const hidden = step === 1 ? i < words.length - 1 - (shown.size % words.length) : false;
                  const recall = step === 4 && !shown.has(i);
                  return (
                    <span key={i} className="inline-flex flex-col items-center px-1.5 align-top">
                      <button type="button" disabled={step !== 4 && step !== 1}
                        onClick={() => setShown((s) => { const n = new Set(s); n.add(step === 4 ? i : s.size); return n; })}
                        className={`rounded-md px-0.5 transition duration-300 motion-reduce:transition-none ${cur === i ? "bg-[rgb(var(--gold)/0.3)] text-[rgb(233_207_153)]" : ""} ${hidden ? "opacity-15" : ""} ${recall ? "text-[rgb(233_207_153)]" : ""}`}>
                        {recall ? firstLetter(w.text_uthmani) + "…" : w.text_uthmani}
                      </button>
                      {step === 2 && <span dir="auto" className="mt-1 max-w-[9rem] text-center font-sans text-[12px] leading-tight text-white/70">{w.translation?.text}</span>}
                    </span>
                  );
                })}
              </p>
              {step === 3 && <p dir="auto" className="mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-white/85">{plain(vs.v.translation)}</p>}
              {step === 5 && (
                <div className="mx-auto mt-3 grid max-w-2xl gap-2 text-center">
                  {vs.prev && <p className="font-arabic text-[19px] leading-[1.9] text-white/55" dir="rtl" lang="ar">{vs.prev.text_uthmani} <span className="font-sans text-[11px]">({vs.prev.verse_key})</span></p>}
                  {vs.next && <p className="font-arabic text-[19px] leading-[1.9] text-white/55" dir="rtl" lang="ar">{vs.next.text_uthmani} <span className="font-sans text-[11px]">({vs.next.verse_key})</span></p>}
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-4 min-h-[3.5rem] rounded-xl bg-black/25 px-4 py-3 text-[15px] leading-relaxed text-white/90">
          {capWord ? <><span className="font-bold text-[rgb(233_207_153)]">{capWord}</span> · </> : null}{t(`wtCap${step + 1}`)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={play} disabled={!vs} className="btn-gold inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-bold disabled:opacity-50">
            <span aria-hidden>{playing ? "❚❚" : "▶"}</span>{playing ? t("wtPause") : t("wtPlay")}
          </button>
          <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="inline-flex h-11 items-center rounded-full border border-white/25 px-4 text-[14px] font-bold text-white/85 disabled:opacity-40">{t("wtBack")}</button>
          <button type="button" onClick={() => go(step + 1)} disabled={step === N - 1} className="inline-flex h-11 items-center rounded-full border border-white/25 px-4 text-[14px] font-bold text-white/85 disabled:opacity-40">{t("wtNext")}</button>
          {vs && <span className="text-[12px] text-white/50">{vs.v.verse_key} · {reciter.name}</span>}
        </div>
      </div>
    </section>
  );
}
