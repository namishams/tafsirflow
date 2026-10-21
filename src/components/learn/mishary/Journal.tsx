"use client";
// mirrors mobile/src/features/mishary/Journal.tsx – the daily recording journal (/mishary/journal): one recitation a
// day, private in this browser (audio in IndexedDB, numbers under "qmc.mishary.journal", written silently so nothing
// is synced or uploaded). Weekly charts: average loudness from the recorder's levels, pace in words per minute (verse
// words / recording length) and the optional word check (the browser's Arabic recognition, Web Speech API).
import { useEffect, useMemo, useRef, useState } from "react";
import { useMt } from "@/lib/learn/mishary/texts";
import { STUDY_VERSES } from "@/lib/learn/mishary/style";
import { JOURNAL_KEY, audioOf, avgLoudness, dayStr, deleteEntry, saveEntry, weekOf, type JournalEntry } from "@/lib/learn/mishary/journal";
import { readJSON, useHydrated, useStored } from "@/lib/learn/store";
import { useVerse, wordsOf } from "@/lib/learn/reciter-path/useVerse";
import { announceAudio, useWordCheck } from "@/components/learn/media";
import { VerseWords } from "@/components/learn/reciter-path/Practice";
import { Card, GoldButton, LearnHero, LearnMain, Spinner } from "@/components/learn/ui";
import { IconClose, IconLock, IconPause, IconPlay } from "@/components/Icons";
import { Chip, LineChart, Muted, Recorder, Section, type Take } from "./ui";

/** the word check reports the share of verse words heard (memorisation, not tajweed) */
function WordCheckCapture({ words, onResult }: { words: string[]; onResult: (acc: number) => void }) {
  const mt = useMt();
  const c = useWordCheck(words);
  const acc = c.ok ? Math.round((c.ok.filter(Boolean).length / Math.max(1, words.length)) * 100) : null;
  const report = useRef(onResult);
  report.current = onResult;
  useEffect(() => { if (acc !== null) report.current(acc); }, [acc]);
  if (!c.supported || c.state === "unsupported" || c.state === "denied") return <Muted>{c.state === "denied" ? mt("micDenied") : mt("wordCheckNa")}</Muted>;
  const listening = c.state === "listening";
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button type="button" onClick={() => (listening ? c.stop() : c.start())}
        className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-bold text-white ${listening ? "bg-red-700" : "bg-accent"}`}>
        {listening && <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white" />}{listening ? mt("wordCheckStop") : mt("wordCheckStart")}
      </button>
      {acc !== null && <span aria-live="polite" className="text-[13.5px] font-semibold">{mt("accuracy", { n: acc })}</span>}
    </div>
  );
}

function EntryRow({ e, onDelete }: { e: JournalEntry; onDelete: () => void }) {
  const mt = useMt();
  const [playing, setPlaying] = useState(false);
  const el = useRef<HTMLAudioElement | null>(null);
  const url = useRef<string | null>(null);
  useEffect(() => () => { el.current?.pause(); if (url.current) URL.revokeObjectURL(url.current); }, []);
  const toggle = async () => {
    if (el.current && !el.current.paused) { el.current.pause(); return; }
    if (!url.current) {
      const blob = await audioOf(e.day);
      if (!blob) return;
      url.current = URL.createObjectURL(blob);
    }
    const a = (el.current ??= new Audio());
    a.src = url.current;
    a.onplay = () => setPlaying(true);
    a.onpause = () => setPlaying(false);
    a.onended = () => setPlaying(false);
    announceAudio();
    void a.play().catch(() => setPlaying(false));
  };
  const own = e.file.startsWith("idb:");
  return (
    <li className="flex items-center gap-3 py-2.5">
      <button type="button" onClick={() => void toggle()} disabled={!own} aria-label={`${mt("play")} ${e.day}`}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent disabled:opacity-40 [&>svg]:h-4 [&>svg]:w-4">{playing ? <IconPause /> : <IconPlay />}</button>
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-semibold"><span dir="ltr">{e.day} · {e.verseKey}</span></p>
        <p className="text-[12.5px] text-muted">{Math.round(e.durMs / 1000)} s · {mt("wpm", { n: e.wpm })}{e.acc !== null ? ` · ${mt("accuracy", { n: e.acc })}` : ""}</p>
      </div>
      <button type="button" onClick={onDelete} aria-label={`${mt("delete")} ${e.day}`} className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-red-600/10 hover:text-red-700 [&>svg]:h-4 [&>svg]:w-4"><IconClose /></button>
    </li>
  );
}

// ——— /mishary/journal ———
export function JournalScreen() {
  const mt = useMt();
  const hydrated = useHydrated();
  const stored = useStored<JournalEntry[]>(JOURNAL_KEY, []);
  const entries = useMemo(() => (Array.isArray(stored) ? stored : []), [stored]);
  const [key, setKey] = useState(STUDY_VERSES[0]);
  useEffect(() => { const last = readJSON<JournalEntry[]>(JOURNAL_KEY, []).at?.(-1)?.verseKey; if (last && STUDY_VERSES.includes(last)) setKey(last); }, []);
  const { verse } = useVerse(key);
  const [take, setTake] = useState<Take | null>(null);
  const [acc, setAcc] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [today, setToday] = useState("");
  useEffect(() => setToday(dayStr()), []);
  const done = !!today && entries.some((e) => e.day === today);

  const words = verse ? wordsOf(verse).map((w) => w.text_uthmani) : [];
  const save = async () => {
    if (!take || !verse || !today) return;
    setBusy(true);
    const ok = await saveEntry({ day: today, verseKey: key, durMs: take.durMs, avgDb: avgLoudness(take.levels), words: words.length, wpm: Math.round((words.length / Math.max(1, take.durMs)) * 60_000), acc }, take.blob);
    setBusy(false);
    setMsg({ ok, text: ok ? mt("saved") : mt("error") });
    if (ok) { setTake(null); setAcc(null); }
  };

  const weeks = useMemo(() => {
    const m = new Map<string, JournalEntry[]>();
    for (const e of entries) { const w = weekOf(e.day); m.set(w, [...(m.get(w) ?? []), e]); }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12).map(([w, es]) => {
      const withAcc = es.filter((e) => e.acc !== null);
      return { w, loud: es.reduce((a, e) => a + e.avgDb, 0) / es.length + 60, wpm: es.reduce((a, e) => a + e.wpm, 0) / es.length,
        acc: withAcc.length ? withAcc.reduce((a, e) => a + (e.acc ?? 0), 0) / withAcc.length : null };
    });
  }, [entries]);
  const streak = useMemo(() => {
    if (!today) return 0;
    const days = new Set(entries.map((e) => e.day));
    let n = 0; const d = new Date();
    if (!days.has(dayStr(d))) d.setDate(d.getDate() - 1);
    while (days.has(dayStr(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [entries, today]);

  return (
    <>
      <LearnHero back={{ href: "/mishary", label: mt("kicker") }} kicker={mt("kicker")} title={mt("journalTitle")} lead={mt("journalLead")} word="يومية" uid="mj" />
      <LearnMain className="grid gap-8">
        <p className="flex items-start gap-2 text-[14px] leading-relaxed text-muted"><span aria-hidden className="mt-0.5 text-accent [&>svg]:h-4 [&>svg]:w-4"><IconLock /></span>{mt("journalPrivate")}</p>
        <Section title={mt("today")} right={streak ? <span className="text-[13.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{mt("streak", { n: streak })}</span> : undefined}>
          <Card className="grid gap-4">
            {done && <p className="font-semibold text-accent" role="status">{mt("todayDone")}</p>}
            <p className="text-[13.5px] font-semibold text-muted">{mt("chooseVerse")}</p>
            <div className="flex flex-wrap gap-2">
              {STUDY_VERSES.map((k) => <Chip key={k} label={<span dir="ltr">{k}</span>} on={k === key} onClick={() => { setKey(k); setTake(null); setAcc(null); }} />)}
            </div>
            {verse ? <VerseWords verse={verse} size={24} /> : <Spinner label={mt("loading")} />}
            <Recorder key={key} maxSec={120} minSec={2} onTake={(tk) => { setTake(tk); setMsg(null); }} />
            <hr className="border-line" />
            <h3 className="text-[15px] font-bold">{mt("wordCheck")}</h3>
            {words.length > 0 && <WordCheckCapture key={key} words={words} onResult={setAcc} />}
            <GoldButton onClick={() => void save()} disabled={!take || !verse || busy} className="w-fit">{mt("saveEntry")}</GoldButton>
            {msg && <p role="status" className={`text-[13.5px] font-semibold ${msg.ok ? "text-accent" : "text-red-700 dark:text-red-400"}`}>{msg.text}</p>}
          </Card>
        </Section>
        <Section title={mt("tabStats")}>
          {hydrated && weeks.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="grid gap-2"><p className="text-[13.5px] font-semibold">{mt("chartLoud")}</p><LineChart points={weeks.map((w) => ({ label: w.w, v: w.loud }))} min={0} max={60} unit="/60" /><Muted className="text-[12.5px]">{mt("loudNote")}</Muted></Card>
              <Card className="grid gap-2"><p className="text-[13.5px] font-semibold">{mt("chartPace")}</p><LineChart points={weeks.map((w) => ({ label: w.w, v: w.wpm }))} min={0} max={Math.max(60, ...weeks.map((w) => w.wpm))} unit="wpm" className="text-[rgb(var(--hm-gold))]" /></Card>
              {weeks.some((w) => w.acc !== null) && (
                <Card className="grid gap-2"><p className="text-[13.5px] font-semibold">{mt("chartAcc")}</p><LineChart points={weeks.filter((w) => w.acc !== null).map((w) => ({ label: w.w, v: w.acc! }))} min={0} max={100} unit="%" /></Card>
              )}
            </div>
          ) : <Muted>{mt("chartEmpty")}</Muted>}
        </Section>
        <Section title={mt("entries")}>
          <Card>
            {hydrated && entries.length ? (
              <ul className="divide-y divide-line">{[...entries].reverse().slice(0, 30).map((e) => <EntryRow key={e.day} e={e} onDelete={() => void deleteEntry(e.day)} />)}</ul>
            ) : <Muted>{mt("noEntries")}</Muted>}
          </Card>
        </Section>
      </LearnMain>
    </>
  );
}
