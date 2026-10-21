"use client";
// mirrors mobile/src/features/mishary/StyleStudy.tsx – style studies of the masters (/mishary/masters and
// /mishary/masters/<key>): phrase-by-phrase listening from the word timings, pace and pauses drawn from the gaps
// between the timings (no audio analysis), the Reciter Path's A/B recording (RecordCompare) and style notes in our own
// words (drafts until a teacher has checked them). The master's voice comes from the website's audio (self-hosted,
// Quran.com as fallback); every voice is free on the website. Verse text comes from the Quran API only.
import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/lib/learn/i18n";
import { getVerses, reciterName, type Reciter, type Segment, type Verse } from "@/lib/learn/quran";
import { useReciterList } from "@/lib/learn/reciter";
import { useMt } from "@/lib/learn/mishary/texts";
import { MASTERS, PAUSE_MS, STUDY_VERSES, masterByKey, paceOf, phrasesOf } from "@/lib/learn/mishary/style";
import { announceAudio } from "@/components/learn/media";
import { Ar, Card, CardLink, LearnHero, LearnMain, Spinner } from "@/components/learn/ui";
import { IconPause, IconPlay } from "@/components/Icons";
import { RecordCompare, VerseWords } from "@/components/learn/reciter-path/Practice";
import { Chip, Muted, NeedsReview, Section } from "./ui";

function useMasterVerse(reciter: Reciter | null, key: string) {
  const { lang } = useLang();
  const [state, setState] = useState<{ verse: Verse | null; error: boolean }>({ verse: null, error: false });
  useEffect(() => {
    if (!reciter) return;
    let alive = true;
    setState({ verse: null, error: false });
    const surah = Number(key.split(":")[0]);
    getVerses(surah, lang, reciter).then((vs) => { if (alive) setState({ verse: vs.find((v) => v.verse_key === key) ?? null, error: false }); })
      .catch(() => { if (alive) setState({ verse: null, error: true }); });
    return () => { alive = false; };
  }, [reciter, key, lang]);
  return state;
}

// ——— /mishary/masters ———
export function MastersScreen() {
  const mt = useMt();
  const { lang } = useLang();
  return (
    <>
      <LearnHero back={{ href: "/mishary", label: mt("kicker") }} kicker={mt("kicker")} title={mt("mastersTitle")} lead={mt("mastersLead")} word="أسلوب" uid="mm" />
      <LearnMain>
        <ul className="grid gap-4 sm:grid-cols-2">
          {MASTERS.map((m) => (
            <li key={m.key} className="min-w-0">
              <CardLink href={`/mishary/masters/${m.key}`} className="h-full gap-2">
                <span className="text-[17px] font-bold">{reciterName({ name: m.name, slug: m.key }, lang)}</span>
                <Ar size="text-[20px]" className="text-[rgb(var(--hm-gold-d))]">{m.ar}</Ar>
                <span className="text-[14px] leading-relaxed text-muted">{mt(m.note).split(". ")[0]}.</span>
              </CardLink>
            </li>
          ))}
        </ul>
      </LearnMain>
    </>
  );
}

/** word blocks and pauses on one time axis */
function PaceBar({ segs }: { segs: Segment[] }) {
  const s = [...segs].sort((a, b) => a.start - b.start);
  if (!s.length) return null;
  const from = s[0].start, span = Math.max(1, s.at(-1)!.end - from);
  const x = (ms: number) => ((ms - from) / span) * 1000;
  return (
    <svg width="100%" height={26} viewBox="0 0 1000 26" preserveAspectRatio="none" aria-hidden>
      {s.slice(1).map((w, i) => { const g = w.start - s[i].end; return g >= PAUSE_MS ? <rect key={`g${i}`} x={x(s[i].end)} y={2} width={Math.max(3, x(w.start) - x(s[i].end))} height={22} rx={3} className="fill-[rgb(var(--hm-gold))]" opacity={0.35} /> : null; })}
      {s.map((w) => <rect key={`${w.word}-${w.start}`} x={x(w.start)} y={6} width={Math.max(3, x(w.end) - x(w.start) - 2)} height={14} rx={3} className="fill-accent" />)}
    </svg>
  );
}

/** one player for the verse: a phrase (start..end from the timings) or the whole verse; position for highlighting */
function usePhraseAudio() {
  const el = useRef<HTMLAudioElement | null>(null);
  const end = useRef<number | null>(null);
  const raf = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const onEnd = useRef<() => void>(() => undefined);
  useEffect(() => () => { cancelAnimationFrame(raf.current); el.current?.pause(); }, []);
  const tick = () => {
    const a = el.current;
    if (a) {
      const ms = a.currentTime * 1000;
      setPos(ms);
      if (end.current !== null && !a.paused && ms >= end.current) { a.pause(); end.current = null; onEnd.current(); }
    }
    raf.current = requestAnimationFrame(tick);
  };
  const play = (url: string, fallback: string, o: { fromMs?: number; toMs?: number } = {}) => {
    el.current?.pause();
    const a = new Audio(url);
    el.current = a;
    end.current = o.toMs ?? null;
    let tried = false;
    a.onplay = () => setPlaying(true);
    a.onpause = () => setPlaying(false);
    a.onended = () => { setPlaying(false); end.current = null; onEnd.current(); };
    a.onerror = () => { if (!tried && fallback) { tried = true; a.src = fallback; a.currentTime = (o.fromMs ?? 0) / 1000; void a.play().catch(() => setPlaying(false)); } else setPlaying(false); };
    a.onloadedmetadata = () => { if (o.fromMs) a.currentTime = o.fromMs / 1000; };
    announceAudio();
    void a.play().catch(() => undefined);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
  };
  const pause = () => { end.current = null; el.current?.pause(); };
  return { playing, pos, play, pause, onEnd };
}

function PhrasePlayer({ verse }: { verse: Verse }) {
  const mt = useMt();
  const audio = usePhraseAudio();
  const [active, setActive] = useState<number | null>(null);
  const phrases = useMemo(() => phrasesOf(verse.segments), [verse]);
  audio.onEnd.current = () => setActive(null);
  const playPhrase = (i: number) => {
    const p = phrases[i];
    setActive(i);
    audio.play(verse.audioUrl, verse.remoteAudioUrl, { fromMs: Math.max(0, p.start - 40), toMs: p.end + 60 });
  };
  const current = active !== null ? phrases[active] : null;
  const activeWord = current ? verse.segments.find((s) => s.start <= audio.pos && audio.pos < s.end && current.words.includes(s.word))?.word ?? null : null;
  return (
    <div className="grid gap-3">
      <VerseWords verse={verse} size={26} mark={current?.words} active={activeWord} />
      {phrases.length ? (
        <div className="flex flex-wrap gap-2">
          {phrases.map((_, i) => <Chip key={i} label={mt("phrase", { n: i + 1 })} icon={<IconPlay />} on={active === i}
            onClick={() => (active === i && audio.playing ? (audio.pause(), setActive(null)) : playPhrase(i))} />)}
          <Chip label={mt("playAll")} icon={<IconPlay />} onClick={() => { setActive(null); audio.play(verse.audioUrl, verse.remoteAudioUrl); }} />
        </div>
      ) : <Muted>{mt("noTimings")}</Muted>}
      {audio.playing && <Chip label={mt("stop")} icon={<IconPause />} className="w-fit" onClick={() => { setActive(null); audio.pause(); }} />}
    </div>
  );
}

// ——— /mishary/masters/[key] ———
export function MasterStudyScreen({ id }: { id: string }) {
  const mt = useMt();
  const { lang } = useLang();
  const master = masterByKey(id);
  const [key, setKey] = useState(STUDY_VERSES[0]);
  const all = useReciterList();
  const reciter = all.find((r) => r.id === master?.id) ?? null;
  const { verse, error } = useMasterVerse(reciter, key);
  if (!master) return null;
  const pace = verse ? paceOf(verse.segments) : null;
  return (
    <>
      <LearnHero back={{ href: "/mishary/masters", label: mt("mastersTitle") }} kicker={mt("mastersTitle")} title={reciterName({ name: master.name, slug: master.key }, lang)}
        lead={<Ar size="text-[24px]" className="text-[rgb(var(--gold))]">{master.ar}</Ar>} word="أسلوب" uid="ms" />
      <LearnMain className="grid gap-8">
        <Section title={mt("styleNotes")} right={<NeedsReview />}>
          <Card className="grid gap-2.5"><p className="text-[15.5px] leading-relaxed">{mt(master.note)}</p><Muted className="text-[12.5px]">{mt("needsReviewNote")}</Muted></Card>
        </Section>
        {!reciter ? <Card><Muted>{mt("notOnServer")}</Muted></Card> : (
          <>
            <Section title={mt("verse")}>
              <div className="flex flex-wrap gap-2" role="group" aria-label={mt("chooseVerse")}>
                {STUDY_VERSES.map((k) => <Chip key={k} label={<span dir="ltr">{k}</span>} on={k === key} onClick={() => setKey(k)} />)}
              </div>
            </Section>
            {verse ? (
              <div key={`${reciter.folder}-${key}`} className="grid gap-8">
                <Section title={mt("phrases")}><Card><PhrasePlayer verse={verse} /></Card></Section>
                <Section title={mt("paceTitle")}>
                  <Card className="grid gap-3">
                    {pace ? (
                      <>
                        <p className="text-[15px]"><span className="font-bold">{mt("wpm", { n: pace.wpm })}</span> <span className="text-muted">· {mt("pauses", { n: pace.pauses })} · {mt("longestPause", { s: (pace.longest / 1000).toFixed(1) })}</span></p>
                        <PaceBar segs={verse.segments} />
                        <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
                          <span aria-hidden className="h-3 w-3 rounded-[3px] bg-accent" />{mt("legendWords")}
                          <span aria-hidden className="ms-2 h-3 w-3 rounded-[3px] bg-[rgb(var(--hm-gold))] opacity-50" />{mt("legendPauses")}
                        </div>
                      </>
                    ) : <Muted>{mt("noTimings")}</Muted>}
                  </Card>
                </Section>
                <Section title={mt("yourTurn")}><Card><RecordCompare verse={verse} /></Card></Section>
              </div>
            ) : error ? <Muted>{mt("offline")}</Muted> : <Spinner label={mt("loading")} />}
          </>
        )}
      </LearnMain>
    </>
  );
}
