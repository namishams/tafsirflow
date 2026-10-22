"use client";
// mirrors mobile/src/features/shams2/Makhraj.tsx: /shams/makhraj?l=ayn – the makhraj coach (Shams 3.0, free): learn
// where the letter is made (drawing of mouth and throat), listen to the reciter's words (the model) and the practice
// syllables (the browser's voice, orientation only), repeat with an own recording (it stays in this tab) and A/B, rate
// yourself, train the ear with pairs of words from the word data, read words with the letter from your own portion,
// and send the recording to a teacher. Nothing here judges pronunciation.
import { useEffect, useMemo, useRef, useState } from "react";
import { wordAudioUrl } from "@/lib/arabic";
import { useSurahs } from "@/lib/learn/qaida/words";
import { useShams2 } from "@/lib/learn/shams2/model";
import { noteMakhraj, useMakhraj } from "@/lib/learn/shams2/store2";
import { useS2 } from "@/lib/learn/shams2/text";
import { MAKHRAJ_LETTERS, letterById, quizItems, wordsWithLetter, type LetterId, type MakhrajLetter, type QuizItem, type WordRef } from "@/lib/learn/shams2/makhrajData";
import { useMk, type MkKey } from "@/lib/learn/shams2/makhraj/text";
import { announceAudio, stopClips, tone, useArabicVoice, useClip } from "@/components/learn/media";
import { Card, LearnHero, LearnMain } from "@/components/learn/ui";
import { SendToTeacher, type WebTake } from "@/components/teacher/SendToTeacher";
import { MouthDiagram } from "./MouthDiagram";
import { Live, SourceNote, useBack, useNames } from "./ui";

const STEPS = ["learn", "hear", "repeat", "quiz", "words", "send"] as const;
type Step = (typeof STEPS)[number];
const QUIZ_N = 8;
type Rec = WebTake & { s?: number; from?: number; to?: number };
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const capsule = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 text-[14px] font-semibold transition hover:border-[rgb(var(--hm-gold))]/70 disabled:cursor-not-allowed disabled:opacity-45";
const goldBtn = "btn-gold inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold disabled:opacity-45";

export function MakhrajScreen({ initial }: { initial?: string }) {
  const mk = useMk();
  return (
    <>
      <LearnHero back={useBack()} kicker={mk("kicker")} title={mk("title")} lead={mk("lead")} word="مخارج" uid="mkh" />
      <LearnMain className="grid gap-5">
        <Live><Body initial={initial} /></Live>
        <SourceNote src={["jazari"]} review={{ status: "draft" }} />
      </LearnMain>
    </>
  );
}

function Body({ initial }: { initial?: string }) {
  const mk = useMk();
  const [id, setId] = useState<LetterId>(letterById(initial).id);
  const l = letterById(id);
  const [step, setStep] = useState<Step>("learn");
  const [take, setTake] = useState<Rec | null>(null);
  const [quiz, setQuiz] = useState({ ok: 0, miss: 0 });
  const [self, setSelf] = useState<number | null>(null);
  useEffect(() => { setStep("learn"); setTake(null); setQuiz({ ok: 0, miss: 0 }); setSelf(null); stopClips(); }, [id]);
  const i = STEPS.indexOf(step);
  const go = (n: number) => { stopClips(); setStep(STEPS[n]); };
  return (
    <div className="grid gap-5">
      <LetterPicker value={id} onChange={setId} />
      <Stepper i={i} onPick={go} />
      {step === "learn" && <Learn l={l} />}
      {step === "hear" && <Hear l={l} />}
      {step === "repeat" && <Repeat l={l} self={self} onSelf={setSelf} onTake={setTake} />}
      {step === "quiz" && <Quiz l={l} onAnswer={(r) => setQuiz((q) => ({ ok: q.ok + (r ? 1 : 0), miss: q.miss + (r ? 0 : 1) }))} />}
      {step === "words" && <OwnWords l={l} self={self} onSelf={setSelf} onTake={setTake} />}
      {step === "send" && <Send l={l} take={take} quiz={quiz} self={self} />}
      <div className="flex gap-3">
        {i > 0 && <button type="button" onClick={() => go(i - 1)} className={cx(capsule, "flex-1")}>{mk("prev")}</button>}
        {i < STEPS.length - 1 && <button type="button" onClick={() => go(i + 1)} className={cx(goldBtn, "flex-1")}>{mk("next")}</button>}
      </div>
      <Stats l={l} />
    </div>
  );
}

function LetterPicker({ value, onChange }: { value: LetterId; onChange: (id: LetterId) => void }) {
  const mk = useMk();
  const stats = useMakhraj();
  return (
    <div className="grid gap-2">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold rtl:tracking-normal">{mk("choose")}</p>
      <div role="group" aria-label={mk("choose")} className="grid grid-cols-5 gap-2">
        {MAKHRAJ_LETTERS.map((x) => {
          const on = x.id === value, st = stats[x.ch];
          const practised = !!st && (st.ok + st.miss > 0 || st.self !== undefined);
          return (
            <button key={x.id} type="button" onClick={() => onChange(x.id)} aria-pressed={on} aria-label={mk(`n_${x.id}` as MkKey)}
              className={cx("relative grid h-16 place-items-center rounded-full border transition", on ? "border-[1.5px] border-[#c6a65e] bg-[#c6a65e]/15" : "border-line bg-surface hover:border-[#c6a65e]/60")}>
              <span lang="ar" className={cx("font-arabic text-[28px] leading-none", on ? "text-ink" : "text-muted")}>{x.ch}</span>
              {practised && <span className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-[#c6a65e]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stepper({ i, onPick }: { i: number; onPick: (n: number) => void }) {
  const mk = useMk();
  const { nf } = useS2();
  return (
    <div className="grid gap-2">
      <div className="flex gap-1">
        {STEPS.map((s, n) => <button key={s} type="button" onClick={() => onPick(n)} aria-label={mk(`st_${s}` as MkKey)} aria-current={n === i ? "step" : undefined} className={cx("h-1.5 flex-1 rounded-full", n <= i ? "bg-[#c6a65e]" : "bg-line")} />)}
      </div>
      <p className="text-[13px] font-semibold text-muted">{`${mk("stepOf", { i: nf(i + 1), n: nf(STEPS.length) })} · ${mk(`st_${STEPS[i]}` as MkKey)}`}</p>
    </div>
  );
}

function Stats({ l }: { l: MakhrajLetter }) {
  const mk = useMk();
  const { nf } = useS2();
  const st = useMakhraj()[l.ch];
  const parts = st ? [st.ok + st.miss > 0 ? mk("stats", { ok: nf(st.ok), miss: nf(st.miss) }) : "", st.self !== undefined ? mk("statsSelf", { s: nf(st.self) }) : ""].filter(Boolean) : [];
  return <p className="text-[13px] text-muted"><span className="font-semibold text-ink">{mk("statsT")}</span> · {parts.length ? parts.join(" · ") : mk("statsNone")}</p>;
}

const H = ({ children }: { children: React.ReactNode }) => <h2 className="text-[16px] font-bold">{children}</h2>;
const AR_RUN = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+)/;
/** a paragraph with practice syllables inside (Arabic runs in the Arabic font, isolated so the sentence keeps its order) */
const P = ({ children, muted }: { children: React.ReactNode; muted?: boolean }) => (
  <p className={muted ? "text-[13.5px] leading-relaxed text-muted" : "text-[15px] leading-relaxed"}>
    {typeof children === "string" ? children.split(AR_RUN).map((x, i) => (i % 2 ? <bdi key={i} lang="ar" className="font-arabic text-[1.25em] text-ink">{x}</bdi> : x)) : children}
  </p>
);

function Learn({ l }: { l: MakhrajLetter }) {
  const mk = useMk();
  const name = mk(`n_${l.id}` as MkKey), pname = mk(`n_${l.partner.id}` as MkKey);
  const region = mk(`rg_${l.region}` as MkKey), pregion = mk(`rg_${l.partner.region}` as MkKey);
  return (
    <Card className="grid gap-4">
      <div className="flex items-center gap-4">
        <span lang="ar" className="font-arabic text-[56px] leading-none">{l.ch}</span>
        <div className="grid gap-0.5">
          <p className="font-display text-[22px]">{name}</p>
          <p lang="ar" className="font-arabic text-[17px] text-gold">{l.arName}</p>
          <p className="text-[13px] text-muted">{mk(l.heavy ? "heavy" : "light")}</p>
        </div>
      </div>
      <MouthDiagram region={l.region} partner={l.partner.region} letter={l.ch} partnerLetter={l.partner.ch}
        label={mk("diagram", { l: name, r: region, p: pname, q: pregion })} legendThis={mk("legendThis")} legendPartner={mk("legendPartner")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1"><H>{mk("where")}</H><P>{region.charAt(0).toUpperCase() + region.slice(1)}</P></div>
        <div className="grid gap-1"><H>{mk("how")}</H><P>{mk(`${l.id}_how` as MkKey)}</P></div>
        <div className="grid gap-1"><H>{mk("mistake")}</H><P>{mk(`${l.id}_mistake` as MkKey)}</P></div>
        <div className="grid gap-1"><H>{mk("vs", { a: `${name} ${l.ch}`, b: `${pname} ${l.partner.ch}` })}</H><P>{mk(`${l.id}_vs` as MkKey)}</P></div>
      </div>
    </Card>
  );
}

function WordBtn({ w, onClick, active }: { w: WordRef; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={w.ref} className={cx("inline-flex min-h-[52px] items-center gap-2 rounded-full border px-4 transition", active ? "border-[#c6a65e] bg-[#c6a65e]/15" : "border-line bg-surface hover:border-[#c6a65e]/60")}>
      <span aria-hidden="true" className="text-gold">▸</span><span lang="ar" dir="rtl" className="font-arabic text-[24px] leading-[1.6]">{w.ar}</span>
    </button>
  );
}

function useModelWords(l: MakhrajLetter, max = 6) {
  const { verses, error } = useSurahs(l.quizSurahs);
  const words = useMemo(() => (verses ? wordsWithLetter(verses, l, max, l.partner.chars) : []), [verses, l, max]);
  return { words, loading: !verses && !error, error };
}

function Hear({ l }: { l: MakhrajLetter }) {
  const mk = useMk();
  const clip = useClip();
  const voice = useArabicVoice();
  const { words, loading, error } = useModelWords(l);
  const [cur, setCur] = useState<string | null>(null);
  return (
    <>
      <Card className="grid gap-3">
        <H>{mk("modelT")}</H><P muted>{mk("modelLead")}</P>
        {loading ? <P muted>{mk("loading")}</P> : error ? <P muted>{mk("loadFailed")}</P> : (
          <div dir="rtl" className="flex flex-wrap gap-2">{words.map((w) => <WordBtn key={w.ref} w={w} active={cur === w.ref && clip.state === "playing"} onClick={() => { setCur(w.ref); clip.play(wordAudioUrl(w.ref)); }} />)}</div>
        )}
      </Card>
      <Card className="grid gap-3">
        <H>{mk("syllT")}</H><P muted>{mk("syllLead")}</P>
        <div dir="rtl" className="flex flex-wrap gap-2">
          {l.syllables.map((x) => (
            <button key={x} type="button" disabled={!voice.canSpeak} onClick={() => { stopClips(); voice.speak(x); }} aria-label={x}
              className="inline-flex h-[52px] min-w-16 items-center justify-center rounded-full border border-dashed border-line bg-surface px-4 disabled:opacity-45"><span lang="ar" className="font-arabic text-[24px]">{x}</span></button>
          ))}
        </div>
        <p className="text-[12.5px] leading-relaxed text-muted">{voice.ready && !voice.canSpeak ? mk("noVoice") : mk("voiceNote")}</p>
      </Card>
    </>
  );
}

/** own recording in this tab (MediaRecorder), A/B with a model word */
function Recorder({ model, onTake, meta }: { model: WordRef | null; onTake: (r: Rec) => void; meta: { s?: number; from?: number; to?: number } }) {
  const mk = useMk();
  const { nf } = useS2();
  const clip = useClip();
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const [mine, setMine] = useState<Rec | null>(null);
  const [err, setErr] = useState("");
  const media = useRef<MediaRecorder | null>(null);
  const started = useRef(0);
  const timer = useRef<number | null>(null);
  const me = useRef<HTMLAudioElement | null>(null);
  const thenMine = useRef(false);
  useEffect(() => () => { media.current?.stream.getTracks().forEach((t) => t.stop()); if (timer.current) clearInterval(timer.current); me.current?.pause(); }, []);
  useEffect(() => { if (thenMine.current && clip.state === "idle") { thenMine.current = false; playMine(); } }, [clip.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const start = async () => {
    try {
      clip.stop(); me.current?.pause();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const m = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      m.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      m.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timer.current) { clearInterval(timer.current); timer.current = null; }
        const ms = Date.now() - started.current;
        const blob = new Blob(chunks, { type: m.mimeType || "audio/webm" });
        setRecording(false);
        if (ms < 400) return;
        const r: Rec = { blob, url: URL.createObjectURL(blob), ms, ...meta };
        setMine(r); onTake(r);
      };
      media.current = m; started.current = Date.now(); setSecs(0); setErr("");
      timer.current = window.setInterval(() => setSecs(Math.round((Date.now() - started.current) / 1000)), 250);
      m.start(); setRecording(true);
    } catch { setErr(mk("micDenied")); }
  };
  const stop = () => { if (media.current?.state === "recording") media.current.stop(); };
  function playMine() { if (!mine) return; clip.stop(); me.current ??= new Audio(); me.current.src = mine.url; announceAudio(); void me.current.play().catch(() => undefined); }
  const playModel = (andThen = false) => { if (!model) return; me.current?.pause(); thenMine.current = andThen; clip.play(wordAudioUrl(model.ref)); };
  return (
    <div className="grid gap-2.5">
      <div className="flex flex-wrap gap-2">
        {recording
          ? <button type="button" onClick={stop} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[rgb(150,52,52)] px-5 text-[14px] font-bold text-white"><span className="h-3 w-3 rounded-sm bg-white" />{`${mk("stopRec")} · ${nf(secs)} s`}</button>
          : <button type="button" onClick={() => void start()} className={capsule}><span className="h-3 w-3 rounded-full bg-[rgb(150,52,52)]" />{mk("record")}</button>}
        {model && <button type="button" onClick={() => playModel()} className={capsule}>{mk("model")}</button>}
        {mine && <button type="button" onClick={playMine} className={capsule}>{mk("you")}</button>}
        {mine && model && <button type="button" onClick={() => playModel(true)} className={capsule}>{mk("ab")}</button>}
      </div>
      {err && <p role="alert" className="text-[13px] text-[rgb(160,58,52)]">{err}</p>}
      {mine && <p className="text-[12.5px] text-muted">{mk("saved", { n: nf(Math.round(mine.ms / 1000)) })}</p>}
    </div>
  );
}

function SelfRating({ l, value, onChange }: { l: MakhrajLetter; value: number | null; onChange: (n: number) => void }) {
  const mk = useMk();
  const { nf } = useS2();
  return (
    <div className="grid gap-2">
      <H>{mk("rateT")}</H>
      <P muted>{mk("rateQ", { l: mk(`n_${l.id}` as MkKey) })}</P>
      <div role="group" aria-label={mk("rateT")} className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-pressed={value === n} onClick={() => { onChange(n); noteMakhraj(l.ch, { self: n }); }}
            className={cx("min-h-11 rounded-full border text-[15px] font-bold", value === n ? "border-[#c6a65e] bg-[#c6a65e]/20" : "border-line bg-surface")}>{nf(n)}</button>
        ))}
      </div>
      <p className="text-[12.5px] text-muted">{value !== null ? mk("rated") : mk("rateScale")}</p>
    </div>
  );
}

const Honesty = () => { const mk = useMk(); return <p className="rounded-2xl bg-accent-soft p-3 text-[13px] leading-relaxed">{mk("honesty")}</p>; };

function Repeat({ l, self, onSelf, onTake }: { l: MakhrajLetter; self: number | null; onSelf: (n: number) => void; onTake: (r: Rec) => void }) {
  const mk = useMk();
  const { words } = useModelWords(l, 1);
  return (
    <Card className="grid gap-4">
      <H>{mk("repeatT")}</H><P muted>{mk("repeatLead")}</P>
      <Recorder model={words[0] ?? null} onTake={onTake} meta={{}} />
      <SelfRating l={l} value={self} onChange={onSelf} />
      <Honesty />
    </Card>
  );
}

function Quiz({ l, onAnswer }: { l: MakhrajLetter; onAnswer: (right: boolean) => void }) {
  const mk = useMk();
  const { nf } = useS2();
  const clip = useClip();
  const { verses, error } = useSurahs(l.quizSurahs);
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const items: QuizItem[] = useMemo(() => (verses ? quizItems(verses, l, QUIZ_N, seed) : []), [verses, l, seed]);
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState<"letter" | "partner" | null>(null);
  const [right, setRight] = useState(0);
  useEffect(() => { setN(0); setPicked(null); setRight(0); }, [seed, l.id]);
  if (error) return <Card><P muted>{mk("loadFailed")}</P></Card>;
  if (!verses) return <Card><P muted>{mk("loading")}</P></Card>;
  if (!items.length) return <Card><P muted>{mk("quizNone")}</P></Card>;
  const it = items[n];
  const name = mk(`n_${l.id}` as MkKey), pname = mk(`n_${l.partner.id}` as MkKey);
  const answer = (a: "letter" | "partner") => {
    if (!it || picked) return;
    const ok = a === it.answer;
    setPicked(a); if (ok) setRight((x) => x + 1);
    tone(ok); noteMakhraj(l.ch, { right: ok }); onAnswer(ok);
  };
  const opt = (a: "letter" | "partner") => {
    const ch = a === "letter" ? l.ch : l.partner.ch, label = a === "letter" ? name : pname;
    const isRight = !!picked && a === it.answer, isWrong = picked === a && a !== it.answer;
    return (
      <button key={a} type="button" onClick={() => answer(a)} disabled={!!picked} aria-label={label}
        className={cx("grid h-24 flex-1 place-items-center rounded-[30px] border", isRight ? "border-2 border-accent bg-accent-soft" : isWrong ? "border-2 border-[rgb(160,58,52)]" : "border-line bg-surface hover:border-[#c6a65e]/60")}>
        <span lang="ar" className="font-arabic text-[38px] leading-none">{ch}</span><span className="text-[12.5px] font-semibold text-muted">{label}</span>
      </button>
    );
  };
  return (
    <Card className="grid gap-4">
      <H>{mk("quizT")}</H>
      {n >= items.length ? (
        <>
          <p className="font-display text-[26px]">{mk("quizDone", { n: nf(right), m: nf(items.length) })}</p>
          <button type="button" onClick={() => setSeed((x) => x + 1)} className={goldBtn}>{mk("quizMore")}</button>
        </>
      ) : (
        <>
          <P muted>{mk("quizLead", { a: `${name} ${l.ch}`, b: `${pname} ${l.partner.ch}` })}</P>
          <div className="flex items-center justify-between text-[13px] font-semibold"><span className="text-muted">{`${nf(n + 1)} / ${nf(items.length)}`}</span>{it.exact && <span className="text-gold">{mk("pair")}</span>}</div>
          <button type="button" onClick={() => clip.play(wordAudioUrl(it.word.ref))} className={goldBtn}>{picked ? mk("again") : mk("play")}</button>
          <div className="flex gap-3">{opt("letter")}{opt("partner")}</div>
          {picked && (
            <div className="grid gap-2">
              <p role="status" className={cx("text-[15px] font-bold", picked === it.answer ? "text-accent" : "text-[rgb(160,58,52)]")}>{picked === it.answer ? mk("right") : mk("wrong", { l: it.answer === "letter" ? name : pname })}</p>
              <p lang="ar" dir="rtl" className="text-center font-arabic text-[30px]">{it.word.ar}</p>
              <button type="button" onClick={() => { setPicked(null); setN(n + 1); }} className={capsule}>{mk("next")}</button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function OwnWords({ l, self, onSelf, onTake }: { l: MakhrajLetter; self: number | null; onSelf: (n: number) => void; onTake: (r: Rec) => void }) {
  const mk = useMk();
  const { nf } = useS2();
  const clip = useClip();
  const m = useShams2();
  const { name } = useNames();
  const ranges = (m.wird.sabaq.ranges.length ? m.wird.sabaq.ranges : m.wird.sabqi.ranges).slice(0, 2);
  const key = ranges.map((r) => r.s).join(",");
  const own = useSurahs(useMemo(() => [...new Set(ranges.map((r) => r.s))], [key])); // eslint-disable-line react-hooks/exhaustive-deps
  const fall = useSurahs(l.quizSurahs);
  const inRange = useMemo(() => (own.verses ?? []).filter((v) => { const [s, a] = v.verse_key.split(":").map(Number); return ranges.some((r) => r.s === s && a >= r.from && a <= r.to); }), [own.verses, key]); // eslint-disable-line react-hooks/exhaustive-deps
  const ownWords = useMemo(() => wordsWithLetter(inRange, l, 8), [inRange, l]);
  const fallback = !ownWords.length;
  const words = fallback ? (fall.verses ? wordsWithLetter(fall.verses, l, 8) : []) : ownWords;
  const label = fallback ? l.quizSurahs.map((s) => name(s)).join(", ") : ranges.map((r) => `${name(r.s)} ${r.from === r.to ? nf(r.from) : `${nf(r.from)}–${nf(r.to)}`}`).join(", ");
  const meta = fallback || !ranges[0] ? {} : { s: ranges[0].s, from: ranges[0].from, to: ranges[0].to };
  const [cur, setCur] = useState<string | null>(null);
  const loading = (!own.verses && !own.error && ranges.length > 0) || (fallback && !fall.verses && !fall.error);
  const ln = mk(`n_${l.id}` as MkKey);
  return (
    <Card className="grid gap-4">
      <H>{mk("wordsT")}</H>
      {loading ? <P muted>{mk("loading")}</P> : (
        <>
          <P muted>{fallback ? mk("wordsFallback", { l: ln, r: label }) : mk("wordsLead", { l: ln, r: label })}</P>
          <div dir="rtl" className="flex flex-wrap gap-2">{words.map((w) => <WordBtn key={w.ref} w={w} active={cur === w.ref && clip.state === "playing"} onClick={() => { setCur(w.ref); clip.play(wordAudioUrl(w.ref)); }} />)}</div>
          <P muted>{mk("wordsSukun", { l: ln })}</P>
          <Recorder model={words[0] ?? null} onTake={onTake} meta={meta} />
          <SelfRating l={l} value={self} onChange={onSelf} />
        </>
      )}
    </Card>
  );
}

function Send({ l, take, quiz, self }: { l: MakhrajLetter; take: Rec | null; quiz: { ok: number; miss: number }; self: number | null }) {
  const mk = useMk();
  const name = mk(`n_${l.id}` as MkKey);
  const lines = [mk("sumTitle", { l: l.ch, n: name })];
  if (quiz.ok + quiz.miss > 0) lines.push(mk("sumQuiz", { ok: quiz.ok, miss: quiz.miss }));
  if (self !== null) lines.push(mk("sumSelf", { s: self }));
  return (
    <Card className="grid gap-3">
      <H>{mk("sendT")}</H>
      <P muted>{mk("sendLead", { l: name })}</P>
      {!take && <P muted>{mk("noTake")}</P>}
      <SendToTeacher take={take} kind="makhraj" letter={l.ch} surah={take?.s} from={take?.from} to={take?.to}
        summary={{ ...(self !== null ? { self } : {}), ...(quiz.ok + quiz.miss > 0 ? { quizOk: quiz.ok, quizMiss: quiz.miss } : {}) }} shareText={lines.join("\n")} />
    </Card>
  );
}
