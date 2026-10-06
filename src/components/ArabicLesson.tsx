"use client";
import { IconFlame, IconPlay, IconSpeaker, ArrowNext } from "./Icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { syncQuranText } from "@/lib/arabicQuran";
import { LESSONS, PASS_PCT, PLACEMENT_UNITS, UNITS, buildLesson, lessonById, nextArabic, placementResult, saveArabic, savePlacement, starsFor, verseAudioUrl, wordAudioUrl, type Ex, type PlacementResult } from "@/lib/arabic";
import { logDay } from "@/lib/learning";
import { PracticeCelebrate, PracticeMedallion, PracticeStar, PracticeStarNum, PracticeWindow } from "./art/PracticeArt";

const T = {
  de: { check: "Prüfen", next: "Weiter", right: "Richtig!", wrong: "Nicht ganz – richtig ist:", listen: "Anhören", again: "Nochmal üben", overview: "Zur Kursübersicht", nextLesson: "Nächste Lektion", done: "Lektion geschafft!", notYet: "Fast geschafft!", needPass: `Ab ${PASS_PCT} % ist die nächste Lektion frei. Wiederhole die Lektion – die Fehler kommen gezielt zurück.`, score: "richtig beim ersten Versuch", xp: "XP", match: "Finde die Paare", review: "Wiederholung", quit: "Beenden", learn: "Neu", tip: "Sprich jeden Laut laut mit – Lesen lernt man mit dem Mund.", readQuran: "Jetzt im Koran lesen",
    hearHint: "Tippe auf den Knopf, um das Wort (nochmal) zu hören.", offline: "Die Aufnahme ist gerade nicht erreichbar.", wordIs: "Das Wort lautet:", voice: "Mit Gerätestimme anhören", verse: "Ganzen Vers anhören", tapOrder: "Tippe die Wörter der Reihe nach an – das erste steht rechts.", emptyRow: "Hier entsteht der Vers", reset: "Zurücksetzen", meaningLbl: "Bedeutung",
    pLabel: "Einstufungstest", pHead: "Dein Einstieg", pFrom: "Du startest bei Einheit {n}.", pAll: "Du beherrschst die Grundlagen – weiter geht es mit Einheit 7: Hören und lesen.", pRight: "{a} von {b} richtig", pGo: "Weiter bei:", pRetry: "Test wiederholen", pNote: "Sicher gelöste Einheiten gelten als bestanden (1 Stern). Du kannst jede Lektion trotzdem jederzeit wiederholen.", unitWord: "Einheit", known: "sicher", open: "noch üben" },
  ar: { check: "تحقّق", next: "متابعة", right: "أحسنت!", wrong: "ليس تمامًا – الصواب:", listen: "استمع", again: "تدرّب مرة أخرى", overview: "إلى صفحة الدورة", nextLesson: "الدرس التالي", done: "أتممت الدرس!", notYet: "اقتربت كثيرًا!", needPass: `يُفتح الدرس التالي عند ${PASS_PCT}٪، أعد الدرس وستعود إليك الأخطاء لتثبيتها.`, score: "صحيحة من المحاولة الأولى", xp: "نقطة", match: "طابِق الأزواج", review: "مراجعة", quit: "إنهاء", learn: "جديد", tip: "انطق كل صوت بصوت مسموع، فالقراءة تُتعلَّم باللسان.", readQuran: "اقرأ في المصحف الآن",
    hearHint: "اضغط على الزر لتسمع الكلمة (مرةً أخرى).", offline: "التسجيل غير متاح الآن.", wordIs: "الكلمة هي:", voice: "استمع بصوت الجهاز", verse: "استمع إلى الآية كاملة", tapOrder: "اضغط على الكلمات بالترتيب – الكلمة الأولى عن اليمين.", emptyRow: "هنا تتكوّن الآية", reset: "إعادة", meaningLbl: "المعنى",
    pLabel: "اختبار تحديد المستوى", pHead: "نقطة انطلاقك", pFrom: "تبدأ من الوحدة {n}.", pAll: "أنت تُتقن الأساسيات – تابع مع الوحدة 7: استمع واقرأ.", pRight: "{a} من {b} صحيحة", pGo: "تابع مع:", pRetry: "أعد الاختبار", pNote: "تُحسب الوحدات التي أجبتَ عنها بثقة منجَزة (نجمة واحدة)، ويمكنك إعادة أي درسٍ متى شئت.", unitWord: "الوحدة", known: "متقَنة", open: "للتدرّب" },
  en: { check: "Check", next: "Continue", right: "Correct!", wrong: "Not quite – the answer is:", listen: "Listen", again: "Practise again", overview: "Course overview", nextLesson: "Next lesson", done: "Lesson complete!", notYet: "Almost there!", needPass: `From ${PASS_PCT}% the next lesson unlocks. Repeat the lesson – your mistakes come back on purpose.`, score: "correct on the first try", xp: "XP", match: "Find the pairs", review: "Review", quit: "Quit", learn: "New", tip: "Say every sound out loud – you learn to read with your mouth.", readQuran: "Read it in the Quran now",
    hearHint: "Tap the button to hear the word (again).", offline: "The recording is not available right now.", wordIs: "The word is:", voice: "Listen with the device voice", verse: "Listen to the whole verse", tapOrder: "Tap the words one after another – the first one goes on the right.", emptyRow: "Your verse appears here", reset: "Reset", meaningLbl: "Meaning",
    pLabel: "Placement test", pHead: "Where you start", pFrom: "You start at unit {n}.", pAll: "You already know the basics – continue with unit 7: Listen and read.", pRight: "{a} of {b} correct", pGo: "Continue with:", pRetry: "Repeat the test", pNote: "Units you solved confidently count as passed (1 star). You can repeat any lesson at any time.", unitWord: "Unit", known: "known", open: "to practise" },
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

// one recording at a time (word recordings from Quran.com, verse recordings from our own server); pauses the site radio first.
// If the file cannot be loaded (offline, blocked, missing) the state becomes "error" and the UI shows a quiet hint instead.
function useClip() {
  const el = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const stop = () => { const a = el.current; if (!a) return; a.onplaying = a.onended = a.onerror = null; try { a.pause(); } catch { /* ignore */ } };
  const play = (url: string) => {
    stop();
    try {
      const a = new Audio(url);
      el.current = a;
      a.onplaying = () => setState("playing");
      a.onended = () => setState("idle");
      a.onerror = () => setState("error");
      window.dispatchEvent(new Event("tf-audio-start"));
      setState("loading");
      a.play().catch((e: unknown) => {
        if (el.current !== a) return; // replaced by a newer clip
        const name = (e as { name?: string } | null)?.name;
        setState(name === "NotAllowedError" || name === "AbortError" ? "idle" : "error"); // autoplay blocked → the button is still there
      });
    } catch { setState("error"); }
  };
  useEffect(() => stop, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { state, play, stop };
}

// after "Check" the feedback and the continue button scroll into view (the tab bar covers the bottom of the screen)
function useReveal(on: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (on) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [on]);
  return ref;
}

// the options after a wrong answer come back in a new order (the exercise itself is re-queued once)
const reshuffled = (ex: Ex): Ex => {
  if (ex.t !== "choose" && ex.t !== "listen") return ex;
  const order = shuffle((ex.options as unknown[]).map((_, i) => i));
  return { ...ex, options: order.map((i) => ex.options[i]), answer: order.indexOf(ex.answer) } as Ex;
};

export default function ArabicLesson({ id }: { id: string }) {
  const locale = useLocale();
  const lang = locale === "de" ? "de" : locale === "ar" ? "ar" : "en";
  const t = T[lang];
  const lesson = lessonById(id)!;
  const isPlacement = !!lesson.placement;
  const next = LESSONS[LESSONS.indexOf(lesson) + 1];
  const [seed, setSeed] = useState(0);
  // units 7 and 8 read real verses: first load Quran.com's exact text, then build the exercises
  const [qReady, setQReady] = useState(lesson.unit < 7);
  useEffect(() => { if (!qReady) void syncQuranText().finally(() => setQReady(true)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const base = useMemo(() => buildLesson(lesson, lang), [lesson, lang, seed, qReady]); // eslint-disable-line react-hooks/exhaustive-deps
  const [queue, setQueue] = useState<Ex[]>(base);
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState({ first: 0, firstRight: 0, xp: 0, combo: 0 });
  const wrongKeys = useRef<string[]>([]);
  const retried = useRef(new Set<number>());
  const [finished, setFinished] = useState<null | { pct: number; xp: number }>(null);
  const unitRes = useRef<Record<number, { ok: number; n: number }>>({}); // placement test: right answers per unit
  const [placed, setPlaced] = useState<null | { res: PlacementResult; next: { id: string; title: string } | null }>(null);
  const { canSpeak, speak } = useArabicVoice();
  const barRef = useReveal(checked);
  useEffect(() => { setQueue(base); setPos(0); setPicked(null); setChecked(false); setStats({ first: 0, firstRight: 0, xp: 0, combo: 0 }); wrongKeys.current = []; retried.current = new Set(); unitRes.current = {}; setPlaced(null); setFinished(null); }, [base]);

  const ex = queue[pos];
  const total = queue.length;
  const isRetry = retried.current.has(pos);

  const finish = (s = stats) => {
    const pct = s.first ? Math.round((s.firstRight / s.first) * 100) : 100;
    if (isPlacement) {
      // the placement test marks the units the learner already knows as done – it does not give XP or stars of its own
      const res = placementResult(unitRes.current);
      const nx = nextArabic(savePlacement(res, wrongKeys.current));
      logDay();
      setPlaced({ res, next: nx ? { id: nx.id, title: nx.title[lang] ?? nx.title.en } : null });
      setFinished({ pct, xp: 0 });
      return;
    }
    const bonus = starsFor(pct) * 10;
    saveArabic(lesson.id, pct, s.xp + bonus, wrongKeys.current);
    logDay();
    setFinished({ pct, xp: s.xp + bonus });
  };
  const advance = (s = stats) => { setPicked(null); setChecked(false); if (pos + 1 >= queue.length) finish(s); else setPos(pos + 1); };

  const grade = (ok: boolean, key: string) => {
    tone(ok);
    const s = { ...stats };
    if (!isRetry) {
      s.first += 1; if (ok) s.firstRight += 1;
      if (ex.u) { const r = (unitRes.current[ex.u] ??= { ok: 0, n: 0 }); r.n += 1; if (ok) r.ok += 1; }
    }
    if (ok) { s.combo += 1; s.xp += isRetry ? 5 : 10 + Math.min(10, s.combo * 2); }
    else {
      s.combo = 0; wrongKeys.current.push(key);
      // Babbel-style: a missed exercise comes back once at the end (not in the placement test – it must measure, not teach)
      if (!isRetry && ex.t !== "learn" && !isPlacement) { setQueue((q) => { retried.current.add(q.length); return [...q, reshuffled(ex)]; }); }
    }
    setStats(s);
    return s;
  };

  if (finished && isPlacement && placed) {
    const { res } = placed;
    return (
      <div className="relative mx-auto max-w-xl py-10 text-center">
        {res.passed.length > 0 && <PracticeCelebrate />}
        <PracticeMedallion pct={res.total ? res.correct / res.total : 0} size={136} uid="pl-m" className="pa-medal-in mx-auto" turn>
          <span className="font-display text-[26px] leading-none tabular-nums">{res.correct}<span className="text-[15px] text-[#f3e2b6]/60">/{res.total}</span></span>
        </PracticeMedallion>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gold rtl:tracking-normal">{t.pLabel}</p>
        <h1 className="font-display mt-1 text-4xl">{t.pHead}</h1>
        <p className="mt-4 text-[17px] leading-relaxed">{res.start > PLACEMENT_UNITS.length ? t.pAll : t.pFrom.replace("{n}", String(res.start))}</p>
        <p className="mt-1 text-sm text-muted">{t.pRight.replace("{a}", String(res.correct)).replace("{b}", String(res.total))}</p>
        <ul className="pa-card pa-plain mt-6 divide-y divide-line overflow-hidden text-start">
          {PLACEMENT_UNITS.map((u) => {
            const known = res.passed.includes(u);
            const un = UNITS.find((x) => x.n === u)!;
            return (
              <li key={u} className="flex items-center gap-3 px-4 py-3">
                <span aria-hidden><PracticeStarNum n={known ? "✓" : u} size={34} filled={known} /></span>
                <span className="min-w-0 flex-1 font-semibold leading-snug">{t.unitWord} {u} · {un.title[lang] ?? un.title.en}</span>
                <span className={`shrink-0 text-xs font-bold ${known ? "text-gold" : "text-muted"}`}>{known ? t.known : t.open}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-muted">{t.pNote}</p>
        <div className="mt-8 grid gap-3">
          {placed.next
            ? <Link href={`/arabic/${placed.next.id}`} className="btn-gold inline-flex h-12 items-center justify-center rounded-full px-4 text-[15px] font-bold"><span className="truncate">{t.pGo} {placed.next.title}</span> <ArrowNext /></Link>
            : <Link href="/surah/1?shams=1" className="btn-gold inline-flex h-12 items-center justify-center rounded-full text-[15px] font-bold">{t.readQuran} <ArrowNext /></Link>}
          <button onClick={() => setSeed((n) => n + 1)} className="h-12 rounded-full border border-line bg-surface text-[15px] font-bold hover:border-[rgb(201_166_94)]">{t.pRetry}</button>
          <Link href="/arabic" className="text-sm font-semibold text-muted hover:text-ink">{t.overview}</Link>
        </div>
      </div>
    );
  }
  if (finished) {
    const stars = starsFor(finished.pct);
    const passed = finished.pct >= PASS_PCT;
    return (
      <div className="relative mx-auto max-w-xl py-10 text-center">
        {passed && <PracticeCelebrate />}
        {passed && lang !== "ar" && <p className="font-callig text-[40px] leading-tight text-gold" dir="rtl" lang="ar">أحسنت</p>}
        <PracticeMedallion pct={finished.pct / 100} size={150} uid="ls-m" className="pa-medal-in mx-auto mt-3" turn={passed}>
          <span className="font-display text-[30px] leading-none tabular-nums">{finished.pct}%</span>
        </PracticeMedallion>
        <h1 className="font-display mt-5 text-4xl">{passed ? t.done : t.notYet}</h1>
        <p className="mt-4 flex justify-center gap-3" aria-label={`${stars}/3`}>{[1, 2, 3].map((n) => <PracticeStar key={n} size={30} className={`${n <= stars ? "pa-medal-in" : "opacity-20"}`} />)}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="pa-card pa-plain p-4"><p className="font-display text-3xl">{finished.pct} %</p><p className="text-sm text-muted">{t.score}</p></div>
          <div className="pa-card pa-plain p-4"><p className="font-display text-3xl text-gold">+{finished.xp}</p><p className="text-sm text-muted">{t.xp}</p></div>
        </div>
        {!passed && <p className="mt-5 text-[15px] text-muted">{t.needPass}</p>}
        <div className="mt-8 grid gap-3">
          {passed && next && <Link href={`/arabic/${next.id}`} className="btn-gold inline-flex h-12 items-center justify-center rounded-full text-[15px] font-bold">{t.nextLesson} <ArrowNext /></Link>}
          {passed && !next && <Link href="/surah/1?shams=1" className="btn-gold inline-flex h-12 items-center justify-center rounded-full text-[15px] font-bold">{t.readQuran} <ArrowNext /></Link>}
          <button onClick={() => setSeed((n) => n + 1)} className="h-12 rounded-full border border-line bg-surface text-[15px] font-bold hover:border-[rgb(201_166_94)]">{t.again}</button>
          <Link href="/arabic" className="text-sm font-semibold text-muted hover:text-ink">{t.overview}</Link>
        </div>
      </div>
    );
  }
  if (!qReady) return <div className="mx-auto mt-8 h-64 max-w-xl animate-pulse rounded-2xl bg-line/40" />;
  if (!ex) return null;

  // answer buttons shared by "choose" and "listen": long words get a smaller size, long meanings (whole verses) one column
  const letters = (s: string) => s.replace(/[ً-ٰٟـۖ-ۭ]/g, "").length;
  const renderOptions = (opts: { ar?: string; text?: string }[], answer: number) => {
    const small = opts.some((o) => letters(o.ar ?? "") > 6);
    const wide = opts.some((o) => (o.text ?? "").length > 40);
    return (
      <div className={`mt-6 grid gap-3 ${wide ? "grid-cols-1" : "grid-cols-2"}`}>
        {opts.map((o, i) => {
          const state = checked ? (i === answer ? "right" : i === picked ? "wrong" : "idle") : i === picked ? "picked" : "idle";
          return (
            <button key={i} disabled={checked} onClick={() => setPicked(i)}
              className={`min-h-[72px] rounded-xl border-2 px-3 py-2 text-center transition ${state === "right" ? "pa-right border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15" : state === "wrong" ? "pa-shake border-[rgb(190_84_104)] bg-[rgb(190_84_104)]/10" : state === "picked" ? "border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/10 shadow-[0_0_0_3px_rgb(201_166_94/0.15)]" : "border-line bg-surface hover:border-[rgb(201_166_94)]/60"}`}>
              {o.ar ? <span className={`font-arabic leading-[1.7] ${small ? "text-[28px]" : "text-[34px]"}`} dir="rtl">{o.ar}</span> : <span className={`font-semibold ${wide ? "text-[15px] leading-snug" : "text-[16px]"}`}>{o.text}</span>}
            </button>
          );
        })}
      </div>
    );
  };
  const choice = ex.t === "choose" || ex.t === "listen" ? ex : null;
  const answerOpt = choice ? (choice.options[choice.answer] as { ar?: string; text?: string }) : null;

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-xl flex-col py-4">
      {/* progress */}
      <div className="flex items-center gap-3">
        <Link href="/arabic" aria-label={t.quit} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-xl text-muted transition hover:border-[rgb(201_166_94)] hover:text-ink">×</Link>
        <div className="relative h-3 flex-1 rounded-full bg-line/70">
          <div className="h-full rounded-full bg-gradient-to-r from-[#c6a65e] to-[#ecd7a2] transition-all duration-500 rtl:bg-gradient-to-l" style={{ width: `${(pos / total) * 100}%` }} />
          <span aria-hidden className="absolute top-1/2 -translate-y-1/2 transition-all duration-500" style={{ insetInlineStart: `calc(${(pos / total) * 100}% - 9px)` }}><PracticeStar size={18} /></span>
        </div>
        <span className="shrink-0 rounded-full border border-[rgb(201_166_94)]/40 bg-[rgb(201_166_94)]/10 px-3 py-1 text-sm font-bold tabular-nums text-gold">{stats.xp} {t.xp}</span>
      </div>
      {stats.combo >= 3 && <p className="mt-2 text-center text-xs font-bold text-gold"><IconFlame /> {stats.combo}×</p>}
      {isPlacement && <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-gold">{t.pLabel} · {Math.min(pos + 1, total)}/{total}</p>}

      {ex.t === "build" ? (
        <BuildCard key={`${pos}-${ex.key}`} ex={ex} t={t} isRetry={isRetry} onGrade={(ok) => grade(ok, ex.key)} onNext={() => advance()} />
      ) : (
      <div className="flex-1 pt-8">
        {ex.t === "learn" && <LearnCard ex={ex} t={t} canSpeak={canSpeak} speak={speak} />}
        {ex.t === "choose" && (
          <div>
            {isRetry && <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gold">{t.review}</p>}
            <h2 className="text-xl font-bold leading-snug">{ex.q}</h2>
            {ex.ar && (
              <div className="pa-card mt-6 flex items-center justify-center gap-4 px-3 py-8">
                <span className={ex.ar.length > 14 ? "font-arabic text-center text-[34px] leading-[2]" : "font-arabic text-[64px] leading-[1.6]"} dir="rtl">{ex.ar}</span>
                {canSpeak && ex.speak && <SpeakBtn label={t.listen} onClick={() => speak(ex.speak!)} />}
              </div>
            )}
            {!ex.ar && canSpeak && ex.speak && <div className="mt-4"><SpeakBtn label={t.listen} onClick={() => speak(ex.speak!)} wide /></div>}
            {renderOptions(ex.options, ex.answer)}
          </div>
        )}
        {ex.t === "listen" && (
          <div>
            <ListenCard key={`${pos}-${ex.key}`} ex={ex} t={t} isRetry={isRetry} canSpeak={canSpeak} speak={speak} />
            {renderOptions(ex.options, ex.answer)}
          </div>
        )}
        {ex.t === "match" && <MatchCard key={`${pos}-${ex.key}`} ex={ex} t={t} onDone={(mistakes) => { const s = grade(mistakes <= 1, ex.key); setTimeout(() => advance(s), 700); }} />}
      </div>
      )}

      {/* bottom bar */}
      {ex.t === "learn" && <button onClick={() => advance()} className="btn-gold mt-8 h-14 w-full rounded-xl text-[16px] font-bold">{t.next}</button>}
      {choice && answerOpt && (
        <div ref={barRef} className={`step-in mt-8 scroll-mb-28 rounded-xl p-4 ${checked ? (picked === choice.answer ? "border border-[rgb(201_166_94)]/45 bg-[rgb(201_166_94)]/12" : "border border-[rgb(190_84_104)]/30 bg-[rgb(190_84_104)]/[0.08]") : ""}`}>
          {checked && (
            <div className="mb-3">
              <p className={`flex flex-wrap items-center gap-2 font-bold ${picked === choice.answer ? "text-gold" : "text-[rgb(190_84_104)]"}`}>{picked === choice.answer && <PracticeStar size={16} />}
                {picked === choice.answer ? t.right : <>{t.wrong} <span className={answerOpt.ar ? "font-arabic text-2xl" : ""}>{answerOpt.ar ?? answerOpt.text}</span></>}
              </p>
              {choice.t === "listen" && <p className="mt-1 text-sm text-ink/80">{choice.info}</p>}
            </div>
          )}
          {!checked
            ? <button disabled={picked === null} onClick={() => { setChecked(true); grade(picked === choice.answer, choice.key); }} className="btn-gold h-14 w-full rounded-xl text-[16px] font-bold disabled:opacity-40">{t.check}</button>
            : <button onClick={() => advance()} className={`h-14 w-full rounded-xl text-[16px] font-bold ${picked === choice.answer ? "btn-gold" : "bg-[rgb(176_72_96)] text-white"}`}>{t.next}</button>}
        </div>
      )}
    </div>
  );
}

// "Which word do you hear?" – a real recording of one Quran word (Quran.com), started once when the card appears
function ListenCard({ ex, t, isRetry, canSpeak, speak }: { ex: Extract<Ex, { t: "listen" }>; t: (typeof T)["de"]; isRetry: boolean; canSpeak: boolean; speak: (s: string) => void }) {
  const clip = useClip();
  const play = () => clip.play(wordAudioUrl(ex.ref));
  useEffect(() => { play(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const word = ex.options[ex.answer].ar;
  return (
    <div>
      {isRetry && <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gold">{t.review}</p>}
      <h2 className="text-xl font-bold leading-snug">{ex.q}</h2>
      <div className="pa-card mt-5 flex flex-col items-center px-4 py-7 text-center">
        <button onClick={play} aria-label={t.listen} className="stage relative grid h-24 w-24 place-items-center rounded-full text-[#f3e2b6] shadow-[0_12px_28px_-12px_rgba(6,58,44,.9)] ring-2 ring-[rgb(201_166_94)]/70 ring-offset-4 ring-offset-[rgb(var(--surface))] transition active:scale-95">
          {clip.state === "playing" && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[rgb(201_166_94)]/30" />}
          <span className="relative scale-[1.7]">{clip.state === "playing" ? <IconSpeaker /> : <IconPlay />}</span>
        </button>
        {clip.state === "error" ? (
          // the recording cannot be loaded: say so quietly and give the transliteration, so the exercise stays solvable
          <div className="mt-4">
            <p className="text-sm text-muted">{t.offline} {t.wordIs}</p>
            <p className="mt-1 text-lg font-bold">{ex.tr}</p>
            {canSpeak && <button onClick={() => speak(word)} className="mt-2 inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold hover:border-ink"><IconSpeaker />{t.voice}</button>}
          </div>
        ) : <p className="mt-4 text-sm text-muted">{t.hearHint}</p>}
      </div>
    </div>
  );
}

// "Put the words in order" – tap the word tiles (Arabic, right to left); a tapped tile moves into the answer row, tapping it there moves it back
function BuildCard({ ex, t, isRetry, onGrade, onNext }: { ex: Extract<Ex, { t: "build" }>; t: (typeof T)["de"]; isRetry: boolean; onGrade: (ok: boolean) => void; onNext: () => void }) {
  const order = useMemo(() => {
    const idx = ex.tiles.map((_, i) => i);
    let o = shuffle(idx);
    for (let k = 0; k < 8 && o.every((v, i) => ex.tiles[v] === ex.tiles[i]); k++) o = shuffle(idx); // never start in the solved order
    return o;
  }, [ex]);
  const [placed, setPlaced] = useState<number[]>([]); // slots of the tile pool, in the order they were tapped
  const [checked, setChecked] = useState(false);
  const barRef = useReveal(checked);
  const clip = useClip();
  const text = (slot: number) => ex.tiles[order[slot]];
  const right = (slot: number, pos: number) => text(slot) === ex.tiles[pos];
  const ok = placed.length === ex.tiles.length && placed.every(right);
  const full = placed.length === ex.tiles.length;
  const playVerse = () => clip.play(verseAudioUrl(ex.s, ex.a));
  const check = () => { setChecked(true); onGrade(ok); if (ok) playVerse(); };
  const tile = "min-h-[56px] rounded-xl border-2 px-4 font-arabic text-[28px] leading-[1.7] transition";
  return (
    <>
      <div className="flex-1 pt-8">
        {isRetry && <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gold">{t.review}</p>}
        <h2 className="text-xl font-bold leading-snug">{ex.q}</h2>
        <p className="mt-3 rounded-lg callout p-3 text-[15px] leading-snug"><span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-gold">{t.meaningLbl}</span>{ex.hint}</p>

        {/* answer row: first tapped tile sits on the right */}
        <div dir="rtl" aria-label={t.emptyRow} className={`mt-5 flex min-h-[84px] flex-wrap content-start items-center gap-2 rounded-xl border-2 border-dashed p-3 ${checked ? (ok ? "pa-right border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/12" : "border-[rgb(190_84_104)]/60 bg-[rgb(190_84_104)]/5") : "border-[rgb(var(--gold))]/35 bg-surface"}`}>
          {placed.length === 0 && <span dir="auto" className="w-full text-center text-sm text-muted">{t.emptyRow}</span>}
          {placed.map((slot, i) => (
            <button key={slot} disabled={checked} onClick={() => setPlaced(placed.filter((s) => s !== slot))}
              className={`${tile} ${checked ? (right(slot, i) ? "border-[rgb(201_166_94)] bg-surface" : "border-[rgb(190_84_104)] bg-[rgb(190_84_104)]/10") : "border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/10 hover:border-ink/40"}`}>{text(slot)}</button>
          ))}
        </div>

        {/* tile pool: placed tiles leave a dashed gap so nothing jumps around */}
        <div dir="rtl" className="mt-4 flex flex-wrap justify-start gap-2">
          {order.map((_, slot) => placed.includes(slot)
            ? <span key={slot} aria-hidden className={`${tile} invisible border-transparent`}>{text(slot)}</span>
            : <button key={slot} disabled={checked} onClick={() => setPlaced([...placed, slot])} className={`${tile} border-line bg-surface hover:border-[rgb(201_166_94)]/60`}>{text(slot)}</button>)}
        </div>
        {!checked && <p className="mt-4 flex items-center justify-between gap-3 text-sm text-muted"><span>{t.tapOrder}</span>{placed.length > 0 && <button onClick={() => setPlaced([])} className="shrink-0 font-semibold text-ink/70 underline underline-offset-2 hover:text-ink">{t.reset}</button>}</p>}
      </div>

      <div ref={barRef} className={`mt-8 scroll-mb-28 rounded-xl p-4 ${checked ? (ok ? "border border-[rgb(201_166_94)]/45 bg-[rgb(201_166_94)]/12" : "border border-[rgb(190_84_104)]/30 bg-[rgb(190_84_104)]/[0.08]") : ""}`}>
        {checked && (
          <div className="mb-3">
            <p className={`flex items-center gap-2 font-bold ${ok ? "text-gold" : "text-[rgb(190_84_104)]"}`}>{ok && <PracticeStar size={16} />}{ok ? t.right : t.wrong}</p>
            <p className="mt-1 font-arabic text-2xl leading-[1.9]" dir="rtl">{ex.tiles.join(" ")}</p>
            <p className="text-sm text-ink/80">{ex.tr}</p>
            {clip.state !== "error" && <button onClick={playVerse} className="mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold hover:border-ink"><IconSpeaker />{t.verse}</button>}
          </div>
        )}
        {!checked
          ? <button disabled={!full} onClick={check} className="btn-gold h-14 w-full rounded-xl text-[16px] font-bold disabled:opacity-40">{t.check}</button>
          : <button onClick={onNext} className={`h-14 w-full rounded-xl text-[16px] font-bold ${ok ? "btn-gold" : "bg-[rgb(176_72_96)] text-white"}`}>{t.next}</button>}
      </div>
    </>
  );
}

function SpeakBtn({ label, onClick, wide = false }: { label: string; onClick: () => void; wide?: boolean }) {
  return <button onClick={onClick} aria-label={label} className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-bold text-white ${wide ? "w-full" : ""}`}><IconSpeaker />{wide && label}</button>;
}

function LearnCard({ ex, t, canSpeak, speak }: { ex: Extract<Ex, { t: "learn" }>; t: (typeof T)["de"]; canSpeak: boolean; speak: (s: string) => void }) {
  const clip = useClip();
  // a card with a word reference plays the real recording; without one (or if it cannot be loaded) the device's Arabic voice is used, if there is one
  const real = !!ex.ref && clip.state !== "error";
  const hasButton = real || (canSpeak && !!ex.speak);
  const size = ex.ar.length > 18 ? "text-[40px] leading-[1.9]" : ex.ar.length > 9 ? "text-[54px] leading-[1.7]" : "text-[72px] leading-[1.6]";
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/30 bg-surface shadow-[0_24px_50px_-34px_rgba(201,166,94,.8)]">
      <div className="stage girih relative flex min-h-[230px] flex-wrap items-center justify-center gap-4 px-4 pb-8 pt-12 text-[#eef0f3]">
        {ex.ar.length <= 9 ? <PracticeWindow uid={`lc-${ex.ar.length}`} className="absolute left-1/2 top-3 h-[calc(100%-12px)] w-auto -translate-x-1/2 opacity-90" /> : <span aria-hidden className="illum-frame" />}
        <span className={`relative font-arabic text-center text-[#f6e7bf] drop-shadow-[0_0_22px_rgba(233,207,153,.35)] ${size}`} dir="rtl">{ex.ar}</span>
        {hasButton && <button onClick={() => (real ? clip.play(wordAudioUrl(ex.ref!)) : speak(ex.speak!))} aria-label={t.listen} className={`relative grid h-12 w-12 place-items-center rounded-full border border-[rgb(214_180_108)]/50 hover:bg-white/20 ${clip.state === "playing" ? "bg-white/25" : "bg-white/10"}`}><IconSpeaker /></button>}
        {ex.ref && clip.state === "error" && !canSpeak && <p className="w-full text-center text-xs text-white/60">{t.offline}</p>}
      </div>
      <div className="p-6">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold rtl:tracking-normal"><PracticeStar size={10} />{t.learn}</p>
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
          {left.map((l) => <button key={l.i} disabled={done.includes(l.i)} onClick={() => setSel(l.i)} className={`h-16 rounded-xl border-2 transition ${done.includes(l.i) ? "border-transparent bg-[rgb(201_166_94)]/15 opacity-40" : sel === l.i ? "border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/10 shadow-[0_0_0_3px_rgb(201_166_94/0.15)]" : "border-line bg-surface hover:border-[rgb(201_166_94)]/60"}`}><span className="font-arabic text-[30px] leading-[1.7]" dir="rtl">{l.v}</span></button>)}
        </div>
        <div className="grid gap-3">
          {right.map((r) => <button key={r.i} disabled={done.includes(r.i)} onClick={() => pickRight(r.i)} className={`h-16 rounded-xl border-2 px-2 text-[15px] font-semibold transition ${done.includes(r.i) ? "border-transparent bg-[rgb(201_166_94)]/15 opacity-40" : bad === r.i ? "pa-shake border-[rgb(190_84_104)] bg-[rgb(190_84_104)]/10" : "border-line bg-surface hover:border-[rgb(201_166_94)]/60"}`}>{r.v}</button>)}
        </div>
      </div>
    </div>
  );
}
