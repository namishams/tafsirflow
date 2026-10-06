"use client";
import { IconFlame, IconSpeaker, IconStarBig, IconTrophy, ArrowNext } from "./Icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LESSONS, PASS_PCT, buildLesson, saveArabic, starsFor, type Ex } from "@/lib/arabic";
import { logDay } from "@/lib/learning";

const T = {
  de: { check: "Prüfen", next: "Weiter", right: "Richtig!", wrong: "Nicht ganz – richtig ist:", listen: "Anhören", again: "Nochmal üben", overview: "Zur Kursübersicht", nextLesson: "Nächste Lektion", done: "Lektion geschafft!", notYet: "Fast geschafft!", needPass: `Ab ${PASS_PCT} % ist die nächste Lektion frei. Wiederhole die Lektion – die Fehler kommen gezielt zurück.`, score: "richtig beim ersten Versuch", xp: "XP", match: "Finde die Paare", review: "Wiederholung", quit: "Beenden", learn: "Neu", tip: "Sprich jeden Laut laut mit – Lesen lernt man mit dem Mund.", readQuran: "Jetzt im Koran lesen" },
  ar: { check: "تحقّق", next: "متابعة", right: "أحسنت!", wrong: "ليس تمامًا – الصواب:", listen: "استمع", again: "تدرّب مرة أخرى", overview: "إلى صفحة الدورة", nextLesson: "الدرس التالي", done: "أتممت الدرس!", notYet: "اقتربت كثيرًا!", needPass: `يُفتح الدرس التالي عند ${PASS_PCT}٪، أعد الدرس وستعود إليك الأخطاء لتثبيتها.`, score: "صحيحة من المحاولة الأولى", xp: "نقطة", match: "طابِق الأزواج", review: "مراجعة", quit: "إنهاء", learn: "جديد", tip: "انطق كل صوت بصوت مسموع، فالقراءة تُتعلَّم باللسان.", readQuran: "اقرأ في المصحف الآن" },
  en: { check: "Check", next: "Continue", right: "Correct!", wrong: "Not quite – the answer is:", listen: "Listen", again: "Practise again", overview: "Course overview", nextLesson: "Next lesson", done: "Lesson complete!", notYet: "Almost there!", needPass: `From ${PASS_PCT}% the next lesson unlocks. Repeat the lesson – your mistakes come back on purpose.`, score: "correct on the first try", xp: "XP", match: "Find the pairs", review: "Review", quit: "Quit", learn: "New", tip: "Say every sound out loud – you learn to read with your mouth.", readQuran: "Read it in the Quran now" },
};

// tiny feedback tones (no audio files needed)
function tone(ok: boolean) {
  try {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new C(); const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination); o.type = "sine";
    const t0 = ctx.currentTime;
    if (ok) { o.frequency.setValueAtTime(660, t0); o.frequency.setValueAtTime(880, t0 + 0.09); } else o.frequency.setValueAtTime(220, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (ok ? 0.28 : 0.25));
    o.start(t0); o.stop(t0 + 0.3); setTimeout(() => ctx.close(), 500);
  } catch { /* sound is optional */ }
}

// Arabic speech from the device (if it has an Arabic voice) – used as a pronunciation helper, not as recitation
function useArabicVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pick = () => setVoice(window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("ar")) ?? null);
    pick(); window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);
  const speak = (text: string) => { if (!voice) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.voice = voice; u.lang = voice.lang; u.rate = 0.7; window.speechSynthesis.speak(u); };
  return { canSpeak: !!voice, speak };
}

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export default function ArabicLesson({ id }: { id: string }) {
  const locale = useLocale();
  const lang = locale === "de" ? "de" : locale === "ar" ? "ar" : "en";
  const t = T[lang];
  const lesson = LESSONS.find((l) => l.id === id)!;
  const next = LESSONS[LESSONS.indexOf(lesson) + 1];
  const [seed, setSeed] = useState(0);
  const base = useMemo(() => buildLesson(lesson, lang), [lesson, lang, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [queue, setQueue] = useState<Ex[]>(base);
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState({ first: 0, firstRight: 0, xp: 0, combo: 0 });
  const wrongKeys = useRef<string[]>([]);
  const retried = useRef(new Set<number>());
  const [finished, setFinished] = useState<null | { pct: number; xp: number }>(null);
  const { canSpeak, speak } = useArabicVoice();
  useEffect(() => { setQueue(base); setPos(0); setPicked(null); setChecked(false); setStats({ first: 0, firstRight: 0, xp: 0, combo: 0 }); wrongKeys.current = []; retried.current = new Set(); setFinished(null); }, [base]);

  const ex = queue[pos];
  const total = queue.length;
  const isRetry = retried.current.has(pos);

  const finish = (s = stats) => {
    const pct = s.first ? Math.round((s.firstRight / s.first) * 100) : 100;
    const bonus = starsFor(pct) * 10;
    saveArabic(lesson.id, pct, s.xp + bonus, wrongKeys.current);
    logDay();
    setFinished({ pct, xp: s.xp + bonus });
  };
  const advance = (s = stats) => { setPicked(null); setChecked(false); if (pos + 1 >= queue.length) finish(s); else setPos(pos + 1); };

  const grade = (ok: boolean, key: string) => {
    tone(ok);
    const s = { ...stats };
    if (!isRetry) { s.first += 1; if (ok) s.firstRight += 1; }
    if (ok) { s.combo += 1; s.xp += isRetry ? 5 : 10 + Math.min(10, s.combo * 2); }
    else {
      s.combo = 0; wrongKeys.current.push(key);
      // Babbel-style: a missed exercise comes back once at the end
      if (!isRetry && ex.t !== "learn") { setQueue((q) => { retried.current.add(q.length); const again = ex.t === "choose" ? { ...ex, ...(() => { const order = shuffle(ex.options.map((_, i) => i)); return { options: order.map((i) => ex.options[i]), answer: order.indexOf(ex.answer) }; })() } : ex; return [...q, again]; }); }
    }
    setStats(s);
    return s;
  };

  if (finished) {
    const stars = starsFor(finished.pct);
    const passed = finished.pct >= PASS_PCT;
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <p className="flex justify-center text-gold" aria-hidden>{passed ? <IconStarBig /> : <IconTrophy />}</p>
        <h1 className="font-display mt-4 text-4xl">{passed ? t.done : t.notYet}</h1>
        <p className="mt-6 flex justify-center gap-2 text-4xl" aria-label={`${stars}/3`}>{[1, 2, 3].map((n) => <span key={n} className={n <= stars ? "text-gold" : "text-line"}>★</span>)}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-line bg-surface p-4"><p className="font-display text-3xl">{finished.pct} %</p><p className="text-sm text-muted">{t.score}</p></div>
          <div className="rounded-lg border border-line bg-surface p-4"><p className="font-display text-3xl text-gold">+{finished.xp}</p><p className="text-sm text-muted">{t.xp}</p></div>
        </div>
        {!passed && <p className="mt-5 text-[15px] text-muted">{t.needPass}</p>}
        <div className="mt-8 grid gap-3">
          {passed && next && <Link href={`/arabic/${next.id}`} className="btn-gold inline-flex h-12 items-center justify-center rounded-md text-[15px] font-bold">{t.nextLesson} <ArrowNext /></Link>}
          {passed && !next && <Link href="/surah/1?shams=1" className="btn-gold inline-flex h-12 items-center justify-center rounded-md text-[15px] font-bold">{t.readQuran} <ArrowNext /></Link>}
          <button onClick={() => setSeed((n) => n + 1)} className="h-12 rounded-md border border-line bg-surface text-[15px] font-bold hover:border-ink">{t.again}</button>
          <Link href="/arabic" className="text-sm font-semibold text-muted hover:text-ink">{t.overview}</Link>
        </div>
      </div>
    );
  }
  if (!ex) return null;

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-xl flex-col py-4">
      {/* progress */}
      <div className="flex items-center gap-3">
        <Link href="/arabic" aria-label={t.quit} className="grid h-9 w-9 place-items-center rounded-full text-xl text-muted hover:bg-line/50">×</Link>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-line/70"><div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(pos / total) * 100}%` }} /></div>
        <span className="min-w-[3.5rem] text-end text-sm font-bold text-gold">{stats.xp} {t.xp}</span>
      </div>
      {stats.combo >= 3 && <p className="mt-2 text-center text-xs font-bold text-accent"><IconFlame /> {stats.combo}×</p>}

      <div className="flex-1 pt-8">
        {ex.t === "learn" && <LearnCard ex={ex} t={t} canSpeak={canSpeak} speak={speak} />}
        {ex.t === "choose" && (
          <div>
            {isRetry && <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gold">{t.review}</p>}
            <h2 className="text-xl font-bold leading-snug">{ex.q}</h2>
            {ex.ar && (
              <div className="mt-6 flex items-center justify-center gap-4 rounded-xl border border-line bg-surface py-8">
                <span className="font-arabic text-[64px] leading-[1.6]" dir="rtl">{ex.ar}</span>
                {canSpeak && ex.speak && <SpeakBtn label={t.listen} onClick={() => speak(ex.speak!)} />}
              </div>
            )}
            {!ex.ar && canSpeak && ex.speak && <div className="mt-4"><SpeakBtn label={t.listen} onClick={() => speak(ex.speak!)} wide /></div>}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {ex.options.map((o, i) => {
                const state = checked ? (i === ex.answer ? "right" : i === picked ? "wrong" : "idle") : i === picked ? "picked" : "idle";
                return (
                  <button key={i} disabled={checked} onClick={() => setPicked(i)}
                    className={`min-h-[72px] rounded-xl border-2 px-3 py-2 text-center transition ${state === "right" ? "border-accent bg-accent-soft" : state === "wrong" ? "border-red-500 bg-red-500/10" : state === "picked" ? "border-gold bg-gold/10" : "border-line bg-surface hover:border-ink/40"}`}>
                    {o.ar ? <span className="font-arabic text-[34px] leading-[1.7]" dir="rtl">{o.ar}</span> : <span className="text-[16px] font-semibold">{o.text}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {ex.t === "match" && <MatchCard key={`${pos}-${ex.key}`} ex={ex} t={t} onDone={(mistakes) => { const s = grade(mistakes <= 1, ex.key); setTimeout(() => advance(s), 700); }} />}
      </div>

      {/* bottom bar */}
      {ex.t === "learn" && <button onClick={() => advance()} className="btn-gold mt-8 h-14 w-full rounded-xl text-[16px] font-bold">{t.next}</button>}
      {ex.t === "choose" && (
        <div className={`mt-8 rounded-xl p-4 ${checked ? (picked === ex.answer ? "bg-accent-soft" : "bg-red-500/10") : ""}`}>
          {checked && (
            <p className={`mb-3 font-bold ${picked === ex.answer ? "text-accent" : "text-red-600"}`}>
              {picked === ex.answer ? t.right : <>{t.wrong} <span className={ex.options[ex.answer].ar ? "font-arabic text-2xl" : ""}>{ex.options[ex.answer].ar ?? ex.options[ex.answer].text}</span></>}
            </p>
          )}
          {!checked
            ? <button disabled={picked === null} onClick={() => { setChecked(true); grade(picked === ex.answer, ex.key); }} className="btn-gold h-14 w-full rounded-xl text-[16px] font-bold disabled:opacity-40">{t.check}</button>
            : <button onClick={() => advance()} className={`h-14 w-full rounded-xl text-[16px] font-bold text-white ${picked === ex.answer ? "bg-accent" : "bg-red-600"}`}>{t.next}</button>}
        </div>
      )}
    </div>
  );
}

function SpeakBtn({ label, onClick, wide = false }: { label: string; onClick: () => void; wide?: boolean }) {
  return <button onClick={onClick} aria-label={label} className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-bold text-white ${wide ? "w-full" : ""}`}><IconSpeaker />{wide && label}</button>;
}

function LearnCard({ ex, t, canSpeak, speak }: { ex: Extract<Ex, { t: "learn" }>; t: (typeof T)["de"]; canSpeak: boolean; speak: (s: string) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="stage flex min-h-[200px] items-center justify-center gap-4 px-4 py-8 text-[#eef0f3]">
        <span className="font-arabic text-[72px] leading-[1.6] text-[rgb(var(--gold))]" dir="rtl">{ex.ar}</span>
        {canSpeak && ex.speak && <button onClick={() => speak(ex.speak!)} aria-label={t.listen} className="grid h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20"><IconSpeaker /></button>}
      </div>
      <div className="p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">{t.learn}</p>
        <h2 className="font-display mt-1 text-2xl">{ex.title}</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-ink/85">{ex.body}</p>
        <p className="mt-4 text-sm text-muted">{t.tip}</p>
      </div>
    </div>
  );
}

function MatchCard({ ex, t, onDone }: { ex: Extract<Ex, { t: "match" }>; t: (typeof T)["de"]; onDone: (mistakes: number) => void }) {
  const left = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ i, v: p.ar }))), [ex]);
  const right = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ i, v: p.text }))), [ex]);
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [bad, setBad] = useState<number | null>(null);
  const mistakes = useRef(0);
  const pickRight = (i: number) => {
    if (sel === null) return;
    if (i === sel) { const d = [...done, i]; setDone(d); setSel(null); tone(true); if (d.length === ex.pairs.length) onDone(mistakes.current); }
    else { mistakes.current += 1; setBad(i); tone(false); setTimeout(() => setBad(null), 450); }
  };
  return (
    <div>
      <h2 className="text-xl font-bold">{t.match}</h2>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="grid gap-3">
          {left.map((l) => <button key={l.i} disabled={done.includes(l.i)} onClick={() => setSel(l.i)} className={`h-16 rounded-xl border-2 transition ${done.includes(l.i) ? "border-transparent bg-accent-soft opacity-40" : sel === l.i ? "border-gold bg-gold/10" : "border-line bg-surface"}`}><span className="font-arabic text-[30px] leading-[1.7]" dir="rtl">{l.v}</span></button>)}
        </div>
        <div className="grid gap-3">
          {right.map((r) => <button key={r.i} disabled={done.includes(r.i)} onClick={() => pickRight(r.i)} className={`h-16 rounded-xl border-2 px-2 text-[15px] font-semibold transition ${done.includes(r.i) ? "border-transparent bg-accent-soft opacity-40" : bad === r.i ? "border-red-500 bg-red-500/10" : "border-line bg-surface"}`}>{r.v}</button>)}
        </div>
      </div>
    </div>
  );
}
