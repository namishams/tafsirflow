"use client";
// mirrors mobile/src/features/shams2/Drill.tsx: /shams/drill?s=&v=&w=&mode= – drills of Shams 3.0 for one verse:
//   word   – the reciter's word n times (flex.wordLoop, default 3) with a pause, then the learner says it (word check);
//   phrase – the same for phrases (cut at stop marks, at most four words, as in talaqqī), prompts by the grade;
//   link   – the end of verse v-1 from the reciter, then the beginning of verse v from memory; held or stalled goes
//            to links.v1.
// Word results go to the word statistics; never a pronunciation score.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Verse } from "@/lib/learn/quran";
import { useSurahVerses, wordsOf } from "@/lib/learn/reciter-path/useVerse";
import { useShams2 } from "@/lib/learn/shams2/model";
import { noteWords } from "@/lib/learn/shams2/store";
import { linkKey, noteLink, useFlex } from "@/lib/learn/shams2/store2";
import { useS2 } from "@/lib/learn/shams2/text";
import { useRec } from "@/lib/learn/shams2/rec/text";
import { announceAudio } from "@/components/learn/media";
import { Card, LearnHero, LearnMain, Spinner } from "@/components/learn/ui";
import { PromptedWords, SpeechCheck, type CheckResult, type W } from "./recite";
import { phrasesOf } from "./Talaqqi";
import { Chip, Live, Segmented, useBack, useNames, useWebT } from "./ui";
import { Capsule, Dock } from "./RecUi";

export type DrillMode = "word" | "phrase" | "link";

/** plays a stretch of a verse n times with a pause between (0.9–3 s, growing with the stretch) */
function useLoop() {
  const el = useRef<HTMLAudioElement | null>(null);
  const raf = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [busy, setBusy] = useState(false);
  const stop = useCallback(() => { cancelAnimationFrame(raf.current); if (timer.current) clearTimeout(timer.current); el.current?.pause(); setBusy(false); }, []);
  useEffect(() => stop, [stop]);
  const play = useCallback((v: Verse, start: number, end: number, times: number) => {
    stop();
    const a = new Audio(v.audioUrl);
    el.current = a;
    let left = Math.max(1, times);
    const gap = Math.round(Math.max(900, Math.min(3000, (end - start) * 1.2)));
    const tick = () => {
      if (a.currentTime * 1000 >= end) {
        a.pause();
        if (--left > 0) { timer.current = setTimeout(() => { a.currentTime = start / 1000; void a.play().catch(() => undefined); raf.current = requestAnimationFrame(tick); }, gap); }
        else setBusy(false);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    a.onloadedmetadata = () => { a.currentTime = start / 1000; };
    a.onerror = () => { if (v.remoteAudioUrl && a.src !== v.remoteAudioUrl) { a.src = v.remoteAudioUrl; void a.play().catch(() => undefined); } else setBusy(false); };
    setBusy(true);
    announceAudio();
    void a.play().catch(() => setBusy(false));
    raf.current = requestAnimationFrame(tick);
  }, [stop]);
  return { busy, play, stop };
}

function Body({ surah, verse, words, mode: initialMode }: { surah: number; verse: number; words: number[]; mode: DrillMode }) {
  const { s } = useS2();
  const { r, nf } = useRec();
  const w = useWebT();
  const { name } = useNames();
  const m = useShams2();
  const flex = useFlex();
  const { verses, error } = useSurahVerses(surah);
  const [mode, setMode] = useState<DrillMode>(verse > 1 || initialMode !== "link" ? initialMode : "phrase");
  const v = verses?.find((x) => x.verse_number === verse) ?? null;
  const prev = verses?.find((x) => x.verse_number === verse - 1) ?? null;
  const loop = useLoop();
  const all: W[] = useMemo(() => (v ? wordsOf(v).map((x) => ({ position: x.position, text: x.text_uthmani })) : []), [v]);
  const phrases = useMemo(() => (v && v.segments.length ? phrasesOf(v) : []), [v]);
  const items = useMemo((): { words: W[]; start: number; end: number }[] => {
    if (!v) return [];
    const want = new Set(words);
    if (mode === "word") {
      return all.filter((x) => !want.size || want.has(x.position)).map((x) => {
        const seg = v.segments.find((g) => g.word === x.position);
        return { words: [x], start: seg?.start ?? 0, end: seg?.end ?? 0 };
      });
    }
    if (mode === "phrase") {
      const hit = phrases.filter((p) => !want.size || p.words.some((x) => want.has(x.position)));
      return hit.length ? hit : phrases;
    }
    const a = prev && prev.segments.length ? phrasesOf(prev).at(-1) : null;
    const b = phrases[0];
    return a && b ? [{ words: b.words, start: a.start, end: a.end }] : [];
  }, [v, prev, mode, all, phrases, words]);
  const [i, setI] = useState(0);
  const [turn, setTurn] = useState(false);
  const [res, setRes] = useState<CheckResult | null>(null);
  const [linkOk, setLinkOk] = useState<boolean | null>(null);
  useEffect(() => { setI(0); setTurn(false); setRes(null); setLinkOk(null); loop.stop(); }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const item = items[i] ?? null;
  const timed = !!item && item.end > item.start;
  const done = !!v && items.length > 0 && i >= items.length;
  const listen = () => { if (v && item && timed) loop.play(mode === "link" && prev ? prev : v, item.start, item.end, mode === "link" ? 1 : flex.wordLoop); };
  const next = () => { loop.stop(); setTurn(false); setRes(null); setLinkOk(null); setI(i + 1); };
  const onCheck = (x: CheckResult) => {
    if (!v || !item) return;
    setRes(x);
    noteWords(v.verse_key, item.words.map((y, k) => ({ position: y.position, ok: !!x.ok[k] })));
    if (mode === "link") { setLinkOk(x.pass); noteLink(linkKey(surah, verse), x.pass); }
  };
  const markLink = (ok: boolean) => { if (linkOk !== null) return; setLinkOk(ok); noteLink(linkKey(surah, verse), ok); };
  const modes: [DrillMode, string][] = [["word", r("mode_word")], ["phrase", r("mode_phrase")], ...(verse > 1 ? [["link", r("mode_link")] as [DrillMode, string]] : [])];

  if (error) return <p className="text-muted">{r("loadFailed")}</p>;
  if (!v) return verses ? <p className="text-muted">{r("loadFailed")}</p> : <Spinner label={w.loading} />; // a verse the surah does not have: no endless spinner
  return (
    <div className="grid gap-3">
      <h2 className="text-[19px] font-bold">{`${name(surah)} · ${s("verseN", { v: nf(verse) })}`}</h2>
      <Segmented value={mode} onChange={setMode} options={modes} label={r("drillTitle")} />
      {done ? <Card><p className="font-display text-[21px]">{r("drillDone")}</p></Card>
        : !item ? <Card><p className="text-muted">{mode === "link" || phrases.length === 0 ? s("noTimings") : r("noTargets")}</p></Card>
        : (
          <Card className="grid gap-3">
            <p className="text-[13px] font-semibold text-muted">
              {mode === "word" ? r("wordOf", { i: nf(i + 1), n: nf(items.length) }) : mode === "phrase" ? r("phraseOf", { i: nf(i + 1), n: nf(items.length) }) : r("linkLead", { a: nf(verse - 1), b: nf(verse) })}
            </p>
            {mode === "word"
              ? <p lang="ar" dir="rtl" className="font-arabic text-center text-[44px] leading-[1.8]">{item.words[0].text}</p>
              : <PromptedWords words={item.words} prompt={!turn ? "full" : mode === "link" ? "hidden" : m.grade.prompt} size={28} />}
            {!timed ? <p className="text-[13px] text-muted">{s("noTimings")}</p> : mode !== "link" && !turn && <p className="text-[13px] text-muted">{r("loopN", { n: nf(flex.wordLoop) })}</p>}
            {turn && (
              <>
                <SpeechCheck words={item.words} pass={mode === "word" ? 1 : m.grade.wordPass} onResult={onCheck} compact={mode === "word"} />
                {res && <p className={`text-[13.5px] font-semibold ${res.pass ? "text-accent" : "text-[rgb(var(--hm-gold-d))]"}`}>{res.pass ? s("passed") : s("notYetPassed")}</p>}
                {mode === "link" && (
                  <div className="flex flex-wrap gap-2">
                    <Chip label={r("linkHeld")} on={linkOk === true} onClick={() => markLink(true)} />
                    <Chip label={r("linkStalled")} on={linkOk === false} onClick={() => markLink(false)} />
                  </div>
                )}
              </>
            )}
          </Card>
        )}
      <Dock>
        {done || !item ? <Capsule tone="quiet" href={`/shams/blind?s=${surah}&from=${verse}&to=${verse}`}>{r("other")}</Capsule>
          : !turn ? (
            <>
              <Capsule tone="quiet" disabled={!timed} onClick={() => (loop.busy ? loop.stop() : listen())}>{loop.busy ? r("stop") : r("listen")}</Capsule>
              <Capsule tone="emerald" onClick={() => { loop.stop(); setTurn(true); }}>{r("yourTurn")}</Capsule>
            </>
          ) : <Capsule onClick={next}>{r("next")}</Capsule>}
      </Dock>
    </div>
  );
}

export function DrillScreen(p: { surah: number; verse: number; words: number[]; mode: DrillMode }) {
  const { r } = useRec();
  return (
    <>
      <LearnHero back={useBack()} kicker={r("eyebrow")} title={r("drillTitle")} lead={r("drillLead")} word="التكرار" uid="s2d" />
      <LearnMain className="grid gap-4">
        <Live><Body {...p} /></Live>
        <p className="text-[12.5px] leading-relaxed text-muted">{r("honest")}</p>
      </LearnMain>
    </>
  );
}
