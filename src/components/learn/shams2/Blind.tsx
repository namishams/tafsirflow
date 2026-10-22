"use client";
// mirrors mobile/src/features/shams2/Blind.tsx: /shams/blind?s=&from=&to= – blind recitation (Shams 3.0): a whole
// passage from memory with the text hidden. One take with the browser's speech recognition (take.ts), aligned with the
// verses (blindAlign.ts): words heard and possibly missed per verse, transitions, pauses (timing only). The learner
// hears the own take from any word and the reciter's word, confirms a rating per verse (FSRS via rateGrade) and the
// transitions; words, checks and links are recorded. Without recognition: a self check verse by verse. On the website
// every surah is free. Never a pronunciation or tajweed score.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { VERSE_COUNTS } from "@/lib/counts";
import type { Verse } from "@/lib/learn/quran";
import { useSurahVerses, wordsOf } from "@/lib/learn/reciter-path/useVerse";
import { shamsGrow } from "@/lib/learn/garden/garden";
import { useShams2 } from "@/lib/learn/shams2/model";
import { maqasidOf } from "@/lib/learn/shams2/maqasid";
import type { Range } from "@/lib/learn/shams2/plan";
import { noteCheck, noteWords } from "@/lib/learn/shams2/store";
import { NOTHING_SAVED, saveRatings, wasSaved, type SavedRatings } from "@/lib/learn/shams2/rated";
import { blindAlignAsync, fitVerses, suggestedGrades, type BlindResult, type LinkReason, type RefVerse } from "@/lib/learn/shams2/blindAlign";
import { useTake, type TakeOut } from "@/lib/learn/shams2/take";
import { useS2 } from "@/lib/learn/shams2/text";
import { useRec } from "@/lib/learn/shams2/rec/text";
import { announceAudio } from "@/components/learn/media";
import { Card, LearnHero, LearnMain, Spinner } from "@/components/learn/ui";
import { Chip, Live, Segmented, useBack, useNames, useWebT } from "./ui";
import { Capsule, Dock, MarkedWords, Pill, RateChips, Stepper } from "./RecUi";

type Src = "today" | "surah" | "page" | "section";
type Phase = "pick" | "ready" | "result" | "manual";
const clampRange = (r: Range): Range => {
  const s = Math.max(1, Math.min(114, r.s || 1));
  const n = VERSE_COUNTS[s - 1];
  const from = Math.max(1, Math.min(n, r.from || 1));
  return { s, from, to: Math.max(from, Math.min(n, r.to || n)) };
};

export function BlindScreen({ initial }: { initial?: Range }) {
  const { r } = useRec();
  return (
    <>
      <LearnHero back={useBack()} kicker={r("eyebrow")} title={r("blindTitle")} lead={r("blindLead")} word="التسميع" uid="s2b" />
      <LearnMain className="grid gap-4">
        <Live><Body initial={initial} /></Live>
        <p className="text-[12.5px] leading-relaxed text-muted">{r("honest")}</p>
      </LearnMain>
    </>
  );
}

function Body({ initial }: { initial?: Range }) {
  const [range, setRange] = useState<Range | null>(initial ? clampRange(initial) : null);
  const [phase, setPhase] = useState<Phase>(initial ? "ready" : "pick");
  if (phase === "pick" || !range) return <Picker initial={range} onPick={(x) => { setRange(clampRange(x)); setPhase("ready"); }} />;
  return <Session key={`${range.s}:${range.from}-${range.to}`} range={range} phase={phase} setPhase={setPhase} />;
}

function Picker({ initial, onPick }: { initial: Range | null; onPick: (r: Range) => void }) {
  const { cl } = useS2();
  const { r, nf } = useRec();
  const { name } = useNames();
  const m = useShams2();
  const today = useMemo(() => (["sabaq", "sabqi", "manzil"] as const).flatMap((k) => m.wird[k].ranges.map((x) => ({ k, x }))), [m.wird]);
  const memorised = useMemo(() => [...new Set([...m.known.keys()].map((k) => Number(k.split(":")[0])))].sort((a, b) => a - b), [m.known]);
  const [src, setSrc] = useState<Src>(today.length && !initial ? "today" : "surah");
  const [sur, setSur] = useState(initial?.s ?? memorised[0] ?? 1);
  const n = VERSE_COUNTS[sur - 1];
  const [from, setFrom] = useState(initial?.from ?? 1);
  const [to, setTo] = useState(initial?.to ?? n);
  // another surah resets the verses; the first run keeps the passage the picker opened with
  const firstSur = useRef(true);
  useEffect(() => { if (firstSur.current) { firstSur.current = false; return; } setFrom(1); setTo(VERSE_COUNTS[sur - 1]); }, [sur]); // eslint-disable-line react-hooks/exhaustive-deps
  const { verses } = useSurahVerses(src === "page" ? sur : null);
  const pages = useMemo(() => {
    const out = new Map<number, Range>();
    for (const v of verses ?? []) { const cur = out.get(v.page); out.set(v.page, cur ? { ...cur, to: Math.max(cur.to, v.verse_number) } : { s: sur, from: v.verse_number, to: v.verse_number }); }
    return [...out.entries()].sort((a, b) => a[0] - b[0]);
  }, [verses, sur]);
  const sections = maqasidOf(sur)?.sections ?? [];
  const label = (x: Range) => `${name(x.s)} · ${x.from === x.to ? r("verseOne", { a: nf(x.from) }) : r("verses", { a: nf(x.from), b: nf(x.to) })}`;
  const opt = (key: string, title: string, sub: string, onClick: () => void) => (
    <button key={key} type="button" onClick={onClick} className="hm-card hm-lift flex w-full items-center gap-3 p-4 text-start">
      <span className="grid min-w-0 flex-1 gap-0.5"><span className="text-[15px] font-semibold">{title}</span>{sub && <span className="text-[13px] text-muted">{sub}</span>}</span>
      <span aria-hidden className="text-muted rtl:rotate-180">›</span>
    </button>
  );
  return (
    <div className="grid gap-3">
      <h2 className="font-display text-[22px]">{r("pick")}</h2>
      <Segmented value={src} onChange={setSrc} label={r("pick")} options={[["today", r("src_today")], ["surah", r("src_surah")], ["page", r("src_page")], ["section", r("src_section")]]} />
      {src !== "today" && (
        <Card className="grid gap-3">
          <Stepper label={r("src_surah")} value={sur} min={1} max={114} onChange={setSur} format={(x) => `${nf(x)} · ${name(x)}`} />
          {memorised.length > 0 && <div className="flex gap-1.5 overflow-x-auto pb-1">{memorised.map((x) => <Chip key={x} label={name(x)} on={x === sur} onClick={() => setSur(x)} />)}</div>}
        </Card>
      )}
      {src === "today" ? (
        today.length ? today.map(({ k, x }) => opt(`${k}:${x.s}:${x.from}`, label(x), r(`k_${k}` as never), () => onPick(x))) : <p className="text-[14px] text-muted">{r("noToday")}</p>
      ) : src === "surah" ? (
        <Card className="grid gap-3">
          <div className="flex gap-3">
            <Stepper label={r("from")} value={from} min={1} max={to} onChange={setFrom} format={(x) => nf(x)} />
            <Stepper label={r("to")} value={to} min={from} max={n} onChange={setTo} format={(x) => nf(x)} />
          </div>
          <div><Chip label={r("wholeSurah")} on={from === 1 && to === n} onClick={() => { setFrom(1); setTo(n); }} /></div>
          <Capsule onClick={() => onPick({ s: sur, from, to })}>{label({ s: sur, from, to })}</Capsule>
        </Card>
      ) : src === "page" ? (
        !verses ? <Spinner /> : pages.map(([p, x]) => opt(`p${p}`, r("pageN", { p: nf(p) }), label(x), () => onPick(x)))
      ) : sections.length ? (
        sections.map((x) => opt(`sec${x.from}`, x.title[cl], label({ s: sur, from: x.from, to: x.to }), () => onPick({ s: sur, from: x.from, to: x.to })))
      ) : opt("whole", r("wholeSurah"), label({ s: sur, from: 1, to: n }), () => onPick({ s: sur, from: 1, to: n }))}
    </div>
  );
}

function Session({ range, phase, setPhase }: { range: Range; phase: Phase; setPhase: (p: Phase) => void }) {
  const { r, nf } = useRec();
  const w = useWebT();
  const { name } = useNames();
  const { verses, error } = useSurahVerses(range.s);
  const all = useMemo(() => (verses ?? []).filter((v) => v.verse_number >= range.from && v.verse_number <= range.to), [verses, range]);
  const fit = useMemo(() => fitVerses(all.map((v) => wordsOf(v).length)), [all]);
  const list = useMemo(() => all.slice(0, fit), [all, fit]);
  const ref: RefVerse[] = useMemo(() => list.map((v) => ({ key: v.verse_key, words: wordsOf(v).map((x) => ({ position: x.position, text: x.text_uthmani })) })), [list]);
  const wordCount = ref.reduce((a, v) => a + v.words.length, 0);
  const take = useTake();
  const [res, setRes] = useState<BlindResult | null>(null);
  const [aligning, setAligning] = useState(false);
  useEffect(() => {
    if (!take.result) return;
    setAligning(true);
    let gone = false;
    // in slices with pauses, so a long passage does not freeze the page
    void blindAlignAsync(ref, take.result.words, {}, () => gone).then((x) => { if (gone || !x) return; setRes(x); setAligning(false); setPhase("result"); });
    return () => { gone = true; };
  }, [take.result]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (take.state === "unavailable" || take.state === "denied") setPhase("manual"); }, [take.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const last = list.at(-1)?.verse_number ?? range.to;
  const title = `${name(range.s)} · ${range.from === last ? r("verseOne", { a: nf(range.from) }) : r("verses", { a: nf(range.from), b: nf(last) })}`;
  const again = () => { take.reset(); setRes(null); setPhase("ready"); };
  const other = () => { take.reset(); setRes(null); setPhase("pick"); };

  if (error) return <div className="grid gap-3"><p className="text-muted">{r("loadFailed")}</p><Dock><Capsule tone="quiet" onClick={other}>{r("other")}</Capsule></Dock></div>;
  if (!verses) return <Spinner label={w.loading} />;
  if (phase === "manual" || (!take.supported && phase === "ready")) return <Manual list={list} title={title} denied={take.state === "denied"} onOther={other} />;
  if (phase === "result" && res && take.result) return <Result range={range} list={list} res={res} take={take.result} title={title} onAgain={again} onOther={other} />;

  const listening = take.state === "listening" || take.state === "stopping";
  return (
    <div className="grid gap-3">
      <h2 className="text-[19px] font-bold">{title}</h2>
      <p className="text-[13px] text-muted">{r("words", { n: nf(wordCount) })}</p>
      {list.length < all.length && <p className="text-[13px] text-[rgb(var(--hm-gold-d))]">{r("tooLong", { v: nf(last) })}</p>}
      <Card className="grid justify-items-center gap-3 py-10 text-center">
        <span className={`grid h-24 w-24 place-items-center rounded-full border ${listening ? "border-[rgb(160,58,52)]/40 bg-[rgb(160,58,52)]/10" : "border-[rgb(var(--hm-gold))]/55 bg-accent-soft"}`}>
          {listening ? <span className="h-5 w-5 animate-pulse rounded-full bg-[rgb(160,58,52)]" /> : <span aria-hidden className="font-arabic text-[34px] text-[rgb(var(--hm-gold-d))]">۝</span>}
        </span>
        <p aria-live="polite" className="text-[15px] font-semibold">{aligning ? r("aligning") : listening ? r("listening", { n: nf(take.count) }) : take.state === "silent" ? r("heardNothing") : r("hidden")}</p>
        <p className="max-w-md text-[12.5px] leading-relaxed text-muted">{r("inBrowser")}</p>
      </Card>
      {!listening && <div><Chip label={r("other")} onClick={other} /></div>}
      <Dock>
        {listening ? <Capsule tone="red" disabled={take.state === "stopping"} onClick={take.stop}>{r("stop")}</Capsule> : (
          <Capsule tone="emerald" disabled={!ref.length || aligning} onClick={() => void take.start()}>{r("start")}</Capsule>
        )}
      </Dock>
    </div>
  );
}

/** the own take from a time; the reciter's word from the verse audio */
function usePlayback(take: TakeOut | null) {
  const mineEl = useRef<HTMLAudioElement | null>(null);
  const recEl = useRef<HTMLAudioElement | null>(null);
  const raf = useRef(0);
  useEffect(() => () => { mineEl.current?.pause(); recEl.current?.pause(); cancelAnimationFrame(raf.current); }, []);
  const mine = useCallback((ms: number) => {
    if (!take?.url) return;
    recEl.current?.pause();
    const a = mineEl.current ?? new Audio(take.url);
    mineEl.current = a;
    const go = () => { a.currentTime = Math.max(0, (ms - 600) / 1000); announceAudio(); void a.play().catch(() => undefined); };
    if (a.readyState >= 1) go(); else a.onloadedmetadata = go;
  }, [take]);
  const reciter = useCallback((v: Verse, position: number) => {
    mineEl.current?.pause();
    recEl.current?.pause();
    const seg = v.segments.find((x) => x.word === position);
    const a = new Audio(v.audioUrl);
    recEl.current = a;
    a.onloadedmetadata = () => { if (seg) a.currentTime = seg.start / 1000; };
    a.onerror = () => { if (v.remoteAudioUrl && a.src !== v.remoteAudioUrl) { a.src = v.remoteAudioUrl; void a.play().catch(() => undefined); } };
    announceAudio();
    void a.play().catch(() => undefined);
    cancelAnimationFrame(raf.current);
    const tick = () => { if (seg && a.currentTime * 1000 >= seg.end) { a.pause(); return; } raf.current = requestAnimationFrame(tick); };
    if (seg) raf.current = requestAnimationFrame(tick);
  }, []);
  return { mine, reciter, hasMine: !!take?.url };
}

const WHY: Record<LinkReason, "why_missing" | "why_order" | "why_restart" | "why_pause"> = { missing: "why_missing", order: "why_order", restart: "why_restart", pause: "why_pause" };

function Result({ range, list, res, take, title, onAgain, onOther }: { range: Range; list: Verse[]; res: BlindResult; take: TakeOut; title: string; onAgain: () => void; onOther: () => void }) {
  const { s } = useS2();
  const { r, nf } = useRec();
  const router = useRouter();
  const play = usePlayback(take);
  // no rating is chosen for the verses after the last heard word (the take may have ended there), nor their transitions
  const reached = useMemo(() => new Set(res.verses.slice(0, res.lastHeard + 1).map((v) => v.key)), [res]);
  const [grades, setGrades] = useState<Record<string, 1 | 2 | 3 | 4 | null>>(() => suggestedGrades(res));
  const [links, setLinks] = useState<Record<string, boolean | undefined>>(() => Object.fromEntries(res.links.map((l) => [l.key, reached.has(l.key) ? l.ok : undefined])));
  const [active, setActive] = useState<{ key: string; position: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const done = useRef<SavedRatings>(NOTHING_SAVED); // what the saves so far have written
  const grownRef = useRef(0);
  const missed = res.total - res.heard;
  const byKey = useMemo(() => new Map(list.map((v) => [v.verse_key, v])), [list]);
  const vNum = (k: string) => nf(Number(k.split(":")[1]));
  const save = () => {
    if (saved) return;
    // the heard words are recorded once (for the verses the take reached); ratings: only what changed since the last save
    if (!wasSaved(done.current)) for (const v of res.verses) if (reached.has(v.key)) { noteWords(v.key, v.words.map((x) => ({ position: x.position, ok: x.ok }))); noteCheck(v.key, v.heard, v.total); }
    const { saved: next, newlyGood } = saveRatings(done.current, grades, links);
    done.current = next;
    for (let k = 0; k < newlyGood.length && grownRef.current < 10; k++) { shamsGrow("verse", false); grownRef.current++; }
    setSaved(true);
  };
  const practise = () => {
    const weak = res.verses.find((v) => v.words.some((x) => !x.ok));
    if (weak) { const [a, b] = weak.key.split(":"); router.push(`/shams/drill?s=${a}&v=${b}&w=${weak.words.filter((x) => !x.ok).map((x) => x.position).slice(0, 12).join(",")}`); return; }
    const stalled = res.links.find((l) => links[l.key] === false);
    if (stalled) { const [a, b] = stalled.key.split(":"); router.push(`/shams/drill?s=${a}&v=${b}&mode=link`); return; }
    router.push(`/shams/drill?s=${range.s}&v=${range.from}&mode=phrase`);
  };
  const anyRating = Object.values(grades).some((g) => !!g) || Object.values(links).some((x) => x !== undefined);
  const onWord = (key: string, position: number) => {
    setActive({ key, position });
    const v = res.verses.find((x) => x.key === key);
    if (!v) return;
    const i = v.words.findIndex((x) => x.position === position);
    const at = v.words.slice(0, i + 1).reverse().find((x) => x.t !== null)?.t ?? v.t;
    if (at !== null && play.hasMine) play.mine(at);
  };
  return (
    <div className="grid gap-3">
      <h2 className="text-[19px] font-bold">{title}</h2>
      <Card className="grid gap-2">
        <h3 className="font-display text-[22px]">{r("result")}</h3>
        <p className={`text-[15px] font-semibold ${missed ? "text-[rgb(var(--hm-gold-d))]" : "text-accent"}`}>{s("heardOf", { n: nf(res.heard), total: nf(res.total) })}</p>
        {missed > 0 && <p className="text-[14px] leading-relaxed">{r("missed", { n: nf(missed) })}</p>}
        {play.hasMine && <p className="text-[13px] text-muted">{r("tapWord")}</p>}
      </Card>
      <h3 className="mt-1 text-[15px] font-semibold">{r("rateTitle")}</h3>
      <p className="text-[13px] leading-relaxed text-muted">{r("rateLead")}</p>
      {res.verses.map((v) => {
        const verse = byKey.get(v.key);
        const marks = new Map(v.words.map((x) => [x.position, x.ok] as const));
        const act = active?.key === v.key ? active.position : null;
        return (
          <Card key={v.key} className="grid gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14.5px] font-bold">{s("verseN", { v: vNum(v.key) })}</span>
              <Pill label={r(`st_${v.status}` as never)} tone={v.status === "ok" ? "ok" : v.status === "partial" ? "warn" : "bad"} />
              {v.repeated && <Pill label={r("repeated")} tone="info" />}
              <span className="ms-auto text-[12px] text-muted">{`${nf(v.heard)}/${nf(v.total)}`}</span>
            </div>
            {verse && <MarkedWords words={wordsOf(verse).map((x) => ({ position: x.position, text: x.text_uthmani }))} marks={marks} active={act} onWord={(p) => onWord(v.key, p)} />}
            {act !== null && verse && (
              <div className="flex gap-2">
                {play.hasMine && <Chip label={r("mine")} onClick={() => onWord(v.key, act)} />}
                <Chip label={r("reciter")} onClick={() => play.reciter(verse, act)} />
              </div>
            )}
            <RateChips value={grades[v.key] ?? 0} onChange={(g) => { setGrades((x) => ({ ...x, [v.key]: g })); setSaved(false); }} labels={[r("r1"), r("r2"), r("r3"), r("r4")]} />
          </Card>
        );
      })}
      {res.links.length > 0 && (
        <Card className="grid gap-2">
          <h3 className="text-[15px] font-semibold">{r("links")}</h3>
          {res.links.map((l) => (
            <div key={l.key} className="grid gap-1 py-1">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-[13.5px] font-semibold">{`${vNum(l.from)} → ${vNum(l.key)}`}</span>
                <Chip label={r("link_ok")} on={links[l.key] === true} onClick={() => { setLinks((x) => ({ ...x, [l.key]: true })); setSaved(false); }} />
                <Chip label={r("link_stalled")} on={links[l.key] === false} onClick={() => { setLinks((x) => ({ ...x, [l.key]: false })); setSaved(false); }} />
              </div>
              {l.reason && <p className="text-[12.5px] text-muted">{r(WHY[l.reason], { s: nf(Math.round((l.pauseMs ?? 0) / 100) / 10) })}</p>}
            </div>
          ))}
        </Card>
      )}
      {res.hesitations.length > 0 && (
        <Card className="grid gap-1">
          <h3 className="text-[15px] font-semibold">{r("pauses")}</h3>
          {res.hesitations.slice(0, 12).map((h) => <p key={`${h.key}:${h.position}`} className="text-[13px] text-muted">{r("pauseAt", { s: nf(Math.round(h.ms / 100) / 10), w: nf(h.position), v: vNum(h.key) })}</p>)}
        </Card>
      )}
      {saved && <p aria-live="polite" className="text-[14px] font-semibold text-accent">{r("saved")}</p>}
      <div className="flex flex-wrap gap-2"><Chip label={r("again")} onClick={onAgain} /><Chip label={r("other")} onClick={onOther} /></div>
      <Dock>{saved ? <Capsule onClick={practise}>{r("practise")}</Capsule> : <Capsule disabled={!anyRating} onClick={save}>{r("save")}</Capsule>}</Dock>
    </div>
  );
}

function Manual({ list, title, denied, onOther }: { list: Verse[]; title: string; denied: boolean; onOther: () => void }) {
  const { s } = useS2();
  const { r, nf } = useRec();
  const [shown, setShown] = useState<Set<string>>(new Set());
  const [grades, setGrades] = useState<Record<string, 1 | 2 | 3 | 4>>({});
  const [links, setLinks] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const done = useRef<SavedRatings>(NOTHING_SAVED); // what the saves so far have written
  const grownRef = useRef(0);
  // a second save applies only the changed verses and transitions, replacing their earlier rating (rated.ts)
  const save = () => {
    if (saved) return;
    const { saved: next, newlyGood } = saveRatings(done.current, grades, links);
    done.current = next;
    for (let k = 0; k < newlyGood.length && grownRef.current < 10; k++) { shamsGrow("verse", false); grownRef.current++; }
    setSaved(true);
  };
  return (
    <div className="grid gap-3">
      <h2 className="text-[19px] font-bold">{title}</h2>
      <Card className="grid gap-2"><p className="text-[14px] leading-relaxed">{denied ? r("denied") : r("unavailable")}</p><p className="text-[13px] leading-relaxed text-muted">{r("manualLead")}</p></Card>
      {list.map((v, i) => {
        const open = shown.has(v.verse_key);
        return (
          <Card key={v.verse_key} className="grid gap-2.5">
            <span className="text-[14.5px] font-bold">{s("verseN", { v: nf(v.verse_number) })}</span>
            {open ? <MarkedWords words={wordsOf(v).map((x) => ({ position: x.position, text: x.text_uthmani }))} marks={new Map()} /> : <div><Chip label={r("reveal")} onClick={() => setShown((x) => new Set(x).add(v.verse_key))} /></div>}
            {open && <RateChips value={grades[v.verse_key] ?? 0} onChange={(g) => { setGrades((x) => ({ ...x, [v.verse_key]: g })); setSaved(false); }} labels={[r("r1"), r("r2"), r("r3"), r("r4")]} />}
            {open && i > 0 && list[i - 1].verse_number === v.verse_number - 1 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex-1 text-[12.5px] text-muted">{`${r("links")} ${nf(v.verse_number - 1)} → ${nf(v.verse_number)}`}</span>
                <Chip label={r("link_ok")} on={links[v.verse_key] === true} onClick={() => { setLinks((x) => ({ ...x, [v.verse_key]: true })); setSaved(false); }} />
                <Chip label={r("link_stalled")} on={links[v.verse_key] === false} onClick={() => { setLinks((x) => ({ ...x, [v.verse_key]: false })); setSaved(false); }} />
              </div>
            )}
          </Card>
        );
      })}
      {saved && <p aria-live="polite" className="text-[14px] font-semibold text-accent">{r("saved")}</p>}
      <div><Chip label={r("other")} onClick={onOther} /></div>
      <Dock><Capsule disabled={(!Object.keys(grades).length && !Object.keys(links).length) || saved} onClick={save}>{r("save")}</Capsule></Dock>
    </div>
  );
}
