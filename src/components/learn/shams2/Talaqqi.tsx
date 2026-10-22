"use client";
// mirrors mobile/src/features/shams2/Talaqqi.tsx: /shams/talaqqi?s=&v=&to= – talaqqī and mushāfaha with a master
// reciter: listen phrase by phrase (cut from the reciter's word timings, 1×/3×/5×), then recite the phrase yourself
// (ʿarḍ) with the prompts and pass mark of your grade; at the end the whole verse, the browser's word check and the
// A/B comparison with your own recording (RecordCompare of the Reciter Path, reused). Recordings stay in this tab.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { Verse } from "@/lib/learn/quran";
import { useSurahVerses, wordsOf } from "@/lib/learn/reciter-path/useVerse";
import { shamsGrow } from "@/lib/learn/garden/garden";
import { gEvent } from "@/lib/learn/feed/gamify";
import { useShams2 } from "@/lib/learn/shams2/model";
import { noteCheck, noteWords } from "@/lib/learn/shams2/store";
import { useS2 } from "@/lib/learn/shams2/text";
import { announceAudio } from "@/components/learn/media";
import { RecordCompare } from "@/components/learn/reciter-path/Practice";
import { Card, GoldButton, LearnHero, LearnMain, Spinner } from "@/components/learn/ui";
import { PromptedWords, SpeechCheck, type CheckResult, type W } from "./recite";
import { Chip, Live, SmallBtn, SourceNote, Term, useBack, useNames, useWebT } from "./ui";
import { ContinueNext } from "./Continue";
import { Rubric } from "./Rubric";
import { useRec } from "@/lib/learn/shams2/rec/text";

export const WAQF = /[ۖ-ۜ]/;

export type Phrase = { words: W[]; start: number; end: number };
export function phrasesOf(v: Verse): Phrase[] {
  const ws = wordsOf(v);
  const seg = (p: number) => v.segments.find((x) => x.word === p);
  const out: Phrase[] = [];
  let cur: W[] = [];
  const push = () => {
    if (!cur.length) return;
    const a = seg(cur[0].position), b = seg(cur[cur.length - 1].position);
    out.push({ words: cur, start: a?.start ?? 0, end: b?.end ?? 0 });
    cur = [];
  };
  for (const w of ws) {
    cur.push({ position: w.position, text: w.text_uthmani });
    if (WAQF.test(w.text_uthmani) || cur.length >= 4) push();
  }
  push();
  // a last phrase of one word joins the one before
  if (out.length > 1 && out[out.length - 1].words.length === 1) { const l = out.pop()!; const p = out[out.length - 1]; p.words.push(...l.words); p.end = l.end || p.end; }
  return out;
}

/** one recording at a time: the whole verse, or a phrase (from–to in ms) repeated n times; self-hosted file first */
export function usePhrasePlayer() {
  const el = useRef<HTMLAudioElement | null>(null);
  const range = useRef<{ start: number; end: number; left: number } | null>(null);
  const raf = useRef(0);
  const [playing, setPlaying] = useState(false);
  const tick = useCallback(() => {
    const a = el.current, r = range.current;
    if (a && r && !a.paused && a.currentTime * 1000 >= r.end) {
      if (r.left > 1) { r.left--; a.currentTime = r.start / 1000; } else { a.pause(); range.current = null; }
    }
    raf.current = requestAnimationFrame(tick);
  }, []);
  const stop = useCallback(() => { range.current = null; el.current?.pause(); }, []);
  useEffect(() => () => { cancelAnimationFrame(raf.current); el.current?.pause(); }, []);
  const play = useCallback((v: Verse, r?: { start: number; end: number; reps: number }) => {
    el.current?.pause();
    const a = new Audio(v.audioUrl);
    el.current = a;
    range.current = r ? { start: r.start, end: r.end, left: r.reps } : null;
    let fell = false;
    a.onplay = () => setPlaying(true);
    a.onpause = () => setPlaying(false);
    a.onended = () => setPlaying(false);
    a.onloadedmetadata = () => { if (r) a.currentTime = r.start / 1000; };
    a.onerror = () => { if (!fell && v.remoteAudioUrl) { fell = true; a.src = v.remoteAudioUrl; void a.play().catch(() => setPlaying(false)); } else setPlaying(false); };
    announceAudio();
    void a.play().catch(() => undefined);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
  }, [tick]);
  return { playing, play, stop };
}

function Body({ surah, from, to }: { surah: number; from: number; to?: number }) {
  const { s, nf } = useS2();
  const w = useWebT();
  const router = useRouter();
  const { name } = useNames();
  const { grade } = useShams2();
  const { verses, error } = useSurahVerses(surah);
  const [vi, setVi] = useState(Math.max(1, from));
  const [pi, setPi] = useState(0);
  const [step, setStep] = useState<"listen" | "recite" | "verse">("listen");
  const [reps, setReps] = useState(1);
  const audio = usePhrasePlayer();
  const verse = verses?.find((x) => x.verse_number === vi) ?? null;
  const phrases = useMemo(() => (verse && verse.segments.length ? phrasesOf(verse) : []), [verse]);
  const timed = phrases.length > 0 && phrases.every((p) => p.end > p.start);
  const phrase = timed ? phrases[Math.min(pi, phrases.length - 1)] : null;
  const allWords: W[] = useMemo(() => (verse ? wordsOf(verse).map((x) => ({ position: x.position, text: x.text_uthmani })) : []), [verse]);
  const last = Math.min(to ?? verses?.length ?? from, verses?.length ?? Infinity);

  useEffect(() => { setPi(0); setStep(timed ? "listen" : "verse"); }, [vi, timed]);

  const verseMs = verse?.segments.length ? Math.max(...verse.segments.map((x) => x.end)) - Math.min(...verse.segments.map((x) => x.start)) : null;
  // XP and growth come once per verse and visit (a passed check or the first "well done"), never per tap
  const rewarded = useRef(new Set<string>());
  const reward = (key: string) => { if (rewarded.current.has(key)) return; rewarded.current.add(key); gEvent({ t: "verse" }); shamsGrow("verse", false); };
  const onPhrase = (r: CheckResult) => { if (verse && phrase) noteWords(verse.verse_key, phrase.words.map((x, i) => ({ position: x.position, ok: !!r.ok[i] }))); };
  const onVerse = (r: CheckResult) => {
    if (!verse) return;
    noteWords(verse.verse_key, allWords.map((x, i) => ({ position: x.position, ok: !!r.ok[i] })));
    noteCheck(verse.verse_key, r.ok.filter(Boolean).length, r.ok.length);
    setMissed(allWords.filter((_, i) => !r.ok[i]).map((x) => x.position));
    if (r.pass) reward(verse.verse_key);
  };
  const [rated, setRated] = useState<"good" | "slip" | null>(null);
  // words the verse check did not hear: offered as a word drill (Shams 3.0)
  const [missed, setMissed] = useState<number[]>([]);
  useEffect(() => { setRated(null); setMissed([]); }, [vi]);
  const { r } = useRec();
  // the self-assessment is recorded once per verse (the first answer); a later click only changes what is shown
  const selfRate = (good: boolean) => {
    if (!verse) return;
    const first = rated === null;
    setRated(good ? "good" : "slip");
    if (!first) return;
    noteCheck(verse.verse_key, good ? allWords.length : Math.floor(allWords.length / 2), allWords.length);
    if (good) reward(verse.verse_key);
  };
  const nextVerse = () => { audio.stop(); if (vi < last) { setVi(vi + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } else router.replace(`/shams/next?s=${surah}`); };

  if (error) return <div className="grid gap-3"><p className="text-muted">{s("loadFailed")}</p><SmallBtn onClick={() => window.location.reload()}>{w.retry}</SmallBtn></div>;
  if (!verses || !verse) return <Spinner label={w.loading} />;
  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-[19px] font-bold">{`${name(surah)} · ${s("verseN", { v: nf(vi) })}`}</h2>
        <p className="mt-1 text-[13px] text-muted">{s("gradeLine", { g: grade.tr, p: s(`prompt_${grade.prompt}` as never), m: nf(Math.round(grade.wordPass * 100)) })}</p>
      </div>
      {timed && step !== "verse" && phrase ? (
        <Card className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <Term id={step === "listen" ? "talaqqi" : "ard"} inline />
            <span className="text-[13px] font-semibold text-muted">{s("phraseOf", { i: nf(pi + 1), n: nf(phrases.length) })}</span>
          </div>
          {step === "listen" ? (
            <>
              <PromptedWords words={phrase.words} prompt="full" size={28} />
              <div className="flex flex-wrap items-center gap-2">
                {audio.playing ? <SmallBtn onClick={audio.stop}>{w.stop}</SmallBtn> : <SmallBtn onClick={() => audio.play(verse, { start: phrase.start, end: phrase.end, reps })}>{s("listenPhrase")}</SmallBtn>}
                {[1, 3, 5].map((n) => <Chip key={n} label={`${nf(n)}×`} on={reps === n} onClick={() => setReps(n)} />)}
              </div>
              <p className="text-[13.5px] leading-relaxed text-muted">{s("listenHint")}</p>
              <GoldButton className="w-fit" onClick={() => { audio.stop(); setStep("recite"); }}>{s("nowRecite")}</GoldButton>
            </>
          ) : (
            <>
              <PromptedWords words={phrase.words} prompt={grade.prompt} size={28} />
              <SpeechCheck words={phrase.words} pass={grade.wordPass} targetMs={(phrase.end - phrase.start) * grade.pace} onResult={onPhrase} />
              <div className="flex flex-wrap gap-2">
                <SmallBtn onClick={() => setStep("listen")}>{s("again")}</SmallBtn>
                <GoldButton onClick={() => { if (pi + 1 < phrases.length) { setPi(pi + 1); setStep("listen"); } else setStep("verse"); }}>{pi + 1 < phrases.length ? s("nextPhrase") : s("wholeVerse")}</GoldButton>
              </div>
            </>
          )}
        </Card>
      ) : (
        <Card className="grid gap-3">
          <Term id="ard" inline />
          {!timed && <p className="text-[13px] text-muted">{s("noTimings")}</p>}
          <PromptedWords words={allWords} prompt={grade.prompt} />
          <div className="flex flex-wrap gap-2">{audio.playing ? <SmallBtn onClick={audio.stop}>{w.stop}</SmallBtn> : <SmallBtn onClick={() => audio.play(verse)}>{s("listenVerse")}</SmallBtn>}</div>
          <SpeechCheck words={allWords} pass={grade.wordPass} targetMs={verseMs ? verseMs * grade.pace : null} onResult={onVerse} />
          {missed.length ? <SmallBtn href={`/shams/drill?s=${surah}&v=${vi}&w=${missed.slice(0, 12).join(",")}`}>{r("drillMissed")}</SmallBtn> : null}
          <div className="flex flex-wrap gap-1.5">
            <Chip label={s("selfGood")} on={rated === "good"} onClick={() => selfRate(true)} />
            <Chip label={s("selfSlip")} on={rated === "slip"} onClick={() => selfRate(false)} />
          </div>
          <hr className="border-line" />
          <p className="text-[14px] font-semibold">{s("abTitle")}</p>
          <RecordCompare verse={verse} />
          <Rubric verseKey={verse.verse_key} />
          <GoldButton className="w-fit" onClick={nextVerse}>{vi < last ? s("nextVerse") : s("finish")}</GoldButton>
        </Card>
      )}
      {vi >= last && step === "verse" && <Card><ContinueNext surah={surah} /></Card>}
    </div>
  );
}

export function TalaqqiScreen({ surah, from, to }: { surah: number; from: number; to?: number }) {
  const { s } = useS2();
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={s("talaqqiTitle")} lead={s("talaqqiLead")} word="التلقي" uid="s2l" />
      <LearnMain className="grid gap-5">
        <Live><Body key={`${surah}:${from}`} surah={surah} from={from} to={to} /></Live>
        <div className="grid gap-3 sm:grid-cols-2"><Term id="talaqqi" /><Term id="mushafaha" /><Term id="ard" /><Term id="sanad" /></div>
        <p className="text-[13px] leading-relaxed text-muted">{s("talaqqiNote")}</p>
        <SourceNote src={["jazari", "nawawi", "quranApi"]} review={{ status: "draft" }} />
      </LearnMain>
    </>
  );
}
