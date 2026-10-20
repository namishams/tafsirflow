"use client";
import { ArrowBack, IconCheckCircle, IconSpeaker } from "./Icons";
import { PracticeCelebrate, PracticeMedallion, PracticeStarNum, PracticeWindow } from "./art/PracticeArt";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Deck, Word } from "@/lib/vocab";
import { deckDesc, deckTitle, meaning, vocabFor } from "@/lib/vocabI18n";
import {
  REVIEW_ROUND, canListen, deckStats, dueWords, findWordPosition, hasAudio, nextBox, options, readerPath, roundWords,
  wordClipUrl, type Boxes, type VerseWord, type VocabMode,
} from "@/lib/vocabStudy";
import { getResources, pickTranslation } from "@/lib/quran";
import { readJSON, writeJSON } from "@/lib/storage";
import { today } from "@/lib/learning";
import { award } from "@/lib/points";

// Quran vocabulary: flashcards, quiz (Arabic → meaning), reverse quiz (meaning → Arabic) and listening quiz
// (hear the word → pick the Arabic), per deck or as "review due words" across all decks. Leitner boxes and the
// round logic live in lib/vocabStudy.ts (shared with the app), meanings in every language in lib/vocabI18n.ts.
// Word recordings: Quran.com word-by-word audio of the example verse; the word's position in that verse is found
// by matching it against the verse's words from our Quran API and cached in this browser.
const KEY = "tf:vocab";
const POS_KEY = "tf:vocab-pos"; // { wordId: position | 0 } – this device only, not synced
const AUTO_KEY = "tf:vocab-auto";
const API = process.env.NEXT_PUBLIC_API_BASE ?? "/api/q";

type Session = { id: string; title: string; words: Word[]; mode: VocabMode; review: boolean };
type VerseData = { words: VerseWord[]; translation: string };

const verseCache = new Map<string, Promise<VerseData>>();
let tidCache: Promise<number> | null = null;
function loadVerse(key: string, locale: string): Promise<VerseData> {
  const ck = `${key}|${locale}`;
  let p = verseCache.get(ck);
  if (!p) {
    p = (async () => {
      tidCache ??= getResources().then((r) => pickTranslation(locale, r.translations)).catch(() => 20);
      const tid = await tidCache;
      const res = await fetch(`${API}/verses/by_key/${key}?language=${locale}&words=true&word_fields=text_uthmani&translations=${tid}&fields=text_uthmani`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const d = (await res.json()) as { verse: { words?: { position: number; text_uthmani: string; char_type_name: string }[]; translations?: { text: string }[] } };
      return {
        words: (d.verse.words ?? []).filter((w) => w.char_type_name === "word").map((w) => ({ position: w.position, text: w.text_uthmani })),
        // Arabic readers read the original: no translation (as in the reader)
        translation: locale === "ar" ? "" : String(d.verse.translations?.[0]?.text ?? "").replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").trim(),
      };
    })();
    p.catch(() => verseCache.delete(ck));
    verseCache.set(ck, p);
  }
  return p;
}

/** the example verse of a word and the word's position in it (position cached per word) */
function useVerse(word: Word | undefined, locale: string) {
  const [state, setState] = useState<{ id: string; data?: VerseData; pos: number | null; error?: boolean } | null>(null);
  useEffect(() => {
    if (!word?.ex) { setState(null); return; }
    let live = true;
    const cached = readJSON<Record<string, number>>(POS_KEY, {})[word.id];
    setState({ id: word.id, pos: cached === undefined ? null : cached || null });
    loadVerse(word.ex.key, locale).then((data) => {
      if (!live) return;
      const pos = hasAudio(word) ? findWordPosition(word, data.words) : null;
      const all = readJSON<Record<string, number>>(POS_KEY, {});
      if (all[word.id] !== (pos ?? 0)) writeJSON(POS_KEY, { ...all, [word.id]: pos ?? 0 }, true);
      setState({ id: word.id, data, pos });
    }).catch(() => { if (live) setState((s) => ({ id: word.id, pos: s?.pos ?? null, error: true })); });
    return () => { live = false; };
  }, [word, locale]);
  return state && state.id === word?.id ? state : null;
}

export default function VocabTrainer() {
  const t = useTranslations("vocab");
  const locale = useLocale();
  const decks = useMemo(() => vocabFor(locale), [locale]);
  const allWords = useMemo(() => decks.flatMap((d) => d.words), [decks]);
  const [boxes, setBoxes] = useState<Boxes>({});
  const [kids, setKids] = useState(false);
  const [auto, setAuto] = useState(false);
  const [day, setDay] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [queue, setQueue] = useState<Word[]>([]);
  const [flip, setFlip] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const [opts, setOpts] = useState<string[]>([]);
  const [score, setScore] = useState({ ok: 0, n: 0 });
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioErr, setAudioErr] = useState(false);

  useEffect(() => {
    const load = () => setBoxes(readJSON<Boxes>(KEY, {}));
    const readKids = () => setKids(document.documentElement.dataset.kids === "1");
    load(); readKids(); setDay(today());
    setAuto(readJSON<boolean>(AUTO_KEY, false));
    window.addEventListener("tf-synced", load); // the account copy arrives after the first render on a new device
    window.addEventListener("tf-kids", readKids);
    return () => { window.removeEventListener("tf-synced", load); window.removeEventListener("tf-kids", readKids); audio.current?.pause(); };
  }, []);

  const mean = useCallback((w: Word) => meaning(w, locale), [locale]);
  const cur = queue[0];
  const verse = useVerse(cur, locale);
  const pos = verse?.pos ?? null;
  const mode = session?.mode ?? "cards";
  const answered = mode === "cards" ? flip : pick !== null;

  const play = useCallback((w: Word, p: number | null) => {
    if (!w.ex || !p) return;
    audio.current ??= new Audio();
    const el = audio.current;
    el.onplaying = () => { setPlaying(true); setAudioErr(false); };
    el.onended = () => setPlaying(false);
    el.onpause = () => setPlaying(false);
    el.onerror = () => { setPlaying(false); setAudioErr(true); };
    el.src = wordClipUrl(w.ex.key, p);
    window.dispatchEvent(new Event("tf-audio-start"));
    el.play().catch(() => setPlaying(false));
  }, []);

  // listening quiz: play each new word as soon as its position is known; a word without a recording is skipped
  // flashcards and quizzes with "play automatically": play the word when it is shown
  useEffect(() => {
    if (!cur || !verse) return;
    if (mode === "listen") {
      if (verse.pos) play(cur, verse.pos);
      else if (verse.data || verse.error) setQueue((q) => (q[0]?.id === cur.id ? q.slice(1) : q));
    } else if (auto && verse.pos && mode !== "reverse") play(cur, verse.pos);
  }, [cur?.id, verse?.pos, verse?.data, verse?.error, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setAudioErr(false); }, [cur?.id]);

  // answer options for the three quiz modes
  useEffect(() => {
    if (!cur || !session || mode === "cards") return;
    const pool = session.words;
    setOpts(mode === "quiz" ? options(cur, pool, allWords, mean) : options(cur, pool, allWords, (w) => w.ar, mode === "listen" ? hasAudio : undefined));
    setPick(null);
  }, [cur?.id, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const right = cur ? (mode === "quiz" ? mean(cur) : cur.ar) : "";

  const begin = (s: Omit<Session, "words"> & { words: Word[] }) => {
    const d = today();
    setDay(d);
    const words = s.review ? roundWords(dueWords(decks, boxes, d), boxes, d, s.mode, REVIEW_ROUND) : roundWords(s.words, boxes, d, s.mode);
    setSession(s); setQueue(words); setFlip(false); setPick(null); setScore({ ok: 0, n: 0 });
  };
  const beginDeck = (d: Deck, m: VocabMode) => begin({ id: d.id, title: deckTitle(d, locale), words: d.words, mode: m, review: false });
  const beginReview = (m: VocabMode) => begin({ id: "review", title: t("review"), words: dueWords(decks, boxes, today()), mode: m, review: true });

  const grade = (ok: boolean) => {
    if (!cur) return;
    const next = nextBox(boxes, cur.id, ok, today());
    setBoxes(next); writeJSON(KEY, next); award("vocab");
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }));
    setQueue((q) => (ok ? q.slice(1) : [...q.slice(1), cur])); // missed words come back at the end
    setFlip(false); setPick(null); // pick must reset here: a missed last word comes back as the same card and the options effect does not re-run
  };

  const toggleAuto = () => { const v = !auto; setAuto(v); writeJSON(AUTO_KEY, v, true); };

  const stats = useMemo(() => decks.map((d) => deckStats(d, boxes, day)), [decks, boxes, day]);
  const totalKnown = stats.reduce((n, s) => n + s.known, 0);
  const total = stats.reduce((n, s) => n + s.total, 0);
  const due = useMemo(() => (day ? dueWords(decks, boxes, day) : []), [decks, boxes, day]);
  const practised = Object.keys(boxes).length;
  const arBig = kids ? "text-[40px]" : "text-[30px]";

  const modeButtons = (words: Word[], onStart: (m: VocabMode) => void) => (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button onClick={() => onStart("cards")} className="btn-gold h-10 rounded-full px-4 text-sm font-bold">{t("cards")}</button>
      <button onClick={() => onStart("quiz")} className="h-10 rounded-full border border-line px-4 text-sm font-bold hover:border-[rgb(201_166_94)]">{t("quiz")}</button>
      {!kids && <button onClick={() => onStart("reverse")} className="h-10 rounded-full border border-line px-4 text-sm font-bold hover:border-[rgb(201_166_94)]">{t("reverse")}</button>}
      {canListen(words) && <button onClick={() => onStart("listen")} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-bold hover:border-[rgb(201_166_94)]"><IconSpeaker className="h-4 w-4" />{t("listen")}</button>}
    </div>
  );

  const playButton = (light?: boolean) => !cur || !hasAudio(cur) || (verse && !verse.pos && (verse.data || verse.error)) ? null : (
    <button onClick={() => play(cur, pos)} disabled={!pos} aria-label={t("play")} title={audioErr ? t("noAudio") : t("play")}
      className={`relative inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition disabled:opacity-50 ${light ? "bg-white/10 text-[#f3e2b6] ring-1 ring-[rgb(201_166_94)]/60 hover:bg-white/15" : "border border-line hover:border-[rgb(201_166_94)]"} ${playing ? "ring-2 ring-[rgb(201_166_94)]" : ""}`}>
      <IconSpeaker className="h-5 w-5" /><span>{audioErr ? t("noAudio") : t("play")}</span>
    </button>
  );

  if (session) {
    const pct = score.n ? score.ok / score.n : 0;
    const ask = mode === "quiz" ? t("askMeaning") : mode === "reverse" ? t("askArabic") : mode === "listen" ? t("askHeard") : null;
    return (
      <section className="mt-8">
        <button onClick={() => { audio.current?.pause(); setSession(null); setDay(today()); }} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><ArrowBack /> {t("decks")}</button>
        <h2 className="font-display mt-2 text-3xl">{session.title}</h2>
        {!cur ? (
          <div className="pa-card relative mt-6 overflow-hidden p-6 pt-8 text-center">
            {pct >= 0.7 && <PracticeCelebrate />}
            {score.n ? (
              <>
                <PracticeMedallion pct={pct} size={132} uid="vc-m" className="pa-medal-in mx-auto" turn={pct >= 0.7}>
                  <span className="font-display text-[26px] leading-none tabular-nums" dir="ltr">{score.ok}<span className="text-[15px] text-[#f3e2b6]/60">/{score.n}</span></span>
                </PracticeMedallion>
                <p className="relative mt-4 text-lg font-bold">{t("roundDone", { ok: score.ok, n: score.n })}</p>
              </>
            ) : (
              <p className="relative text-lg font-bold">{t("allDone")}</p>
            )}
            <div className="relative mt-5 flex flex-wrap justify-center gap-3">
              {(!session.review || dueWords(decks, boxes, today()).length > 0) && <button onClick={() => begin(session)} className="btn-gold h-11 rounded-full px-6 text-sm font-bold">{t("again")}</button>}
              <button onClick={() => { setSession(null); setDay(today()); }} className="h-11 rounded-full border border-line px-6 text-sm font-bold hover:border-[rgb(201_166_94)]">{t("decks")}</button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <span>{t("left", { n: queue.length })}</span>
              <label className="inline-flex cursor-pointer items-center gap-2">
                {mode !== "listen" && mode !== "reverse" && <><input type="checkbox" checked={auto} onChange={toggleAuto} className="h-4 w-4 accent-[rgb(201_166_94)]" />{t("autoplay")}</>}
              </label>
              <span className="tabular-nums" dir="ltr">{score.ok} / {score.n}</span>
            </div>
            {ask && <p className="mt-4 text-center text-[15px] font-semibold text-muted">{ask}</p>}
            <div className={`pa-flip mt-3 ${mode === "cards" && flip ? "is-flipped" : ""}`}>
              <div className="pa-flip-inner min-h-[300px]">
                {/* front: the word (or its meaning, or its sound) in an arch of light */}
                <div className="pa-flip-face stage girih relative grid min-h-[300px] place-items-center overflow-hidden rounded-2xl border border-[rgb(214_180_108)]/35 px-5 py-10 text-center text-[#eef0f3]">
                  <PracticeWindow uid="vc-w" className="absolute left-1/2 top-3 h-[calc(100%-24px)] w-auto -translate-x-1/2 opacity-35" />
                  <div key={`${cur.id}-${score.n}`} className="pa-letter-swap relative flex flex-col items-center">
                    {mode === "reverse" ? (
                      <p className="font-display max-w-md text-[28px] leading-snug text-[#f6e7bf]">{mean(cur)}</p>
                    ) : mode === "listen" && pick === null ? (
                      <button onClick={() => play(cur, pos)} disabled={!pos} aria-label={t("play")} className={`grid h-24 w-24 place-items-center rounded-full bg-white/10 text-[#f6e7bf] ring-1 ring-[rgb(201_166_94)]/60 transition hover:bg-white/15 disabled:opacity-50 ${playing ? "ring-4" : ""}`}>
                        <IconSpeaker className="h-10 w-10" />
                      </button>
                    ) : (
                      <p className={`font-arabic leading-[1.7] text-[#f6e7bf] drop-shadow-[0_0_22px_rgba(233,207,153,.3)] ${kids ? "text-[76px]" : "text-[54px]"}`} dir="rtl" lang="ar">{cur.ar}</p>
                    )}
                    {mode !== "cards" && pick !== null && (
                      <p className="mt-1 text-[15px] italic text-[rgb(233_207_153)]">{mode === "reverse" || mode === "listen" ? <><span className="font-arabic not-italic text-[22px]" dir="rtl" lang="ar">{cur.ar}</span> · {cur.tr} · {mean(cur)}</> : cur.tr}</p>
                    )}
                    {(mode === "cards" || mode === "quiz") && <div className="mt-4">{playButton(true)}</div>}
                  </div>
                </div>
                {/* back: meaning, transliteration and root */}
                {mode === "cards" && (
                  <div className="pa-flip-face pa-flip-back pa-card grid place-items-center p-6 text-center">
                    <div className="relative">
                      <p className={`font-arabic leading-[1.7] text-gold ${kids ? "text-[48px]" : "text-[34px]"}`} dir="rtl" lang="ar">{cur.ar}</p>
                      <p className="italic text-gold">{cur.tr}{cur.root ? ` · ${t("root")}: ` : ""}{cur.root && <span dir="rtl" lang="ar" className="not-italic">{cur.root}</span>}</p>
                      <p className="font-display mt-2 text-2xl">{mean(cur)}</p>
                      <div className="mt-4 flex justify-center">{playButton()}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {mode === "cards" && !flip && <div className="mt-5 flex justify-center"><button onClick={() => setFlip(true)} className="btn-gold h-12 rounded-full px-8 text-sm font-bold">{t("show")}</button></div>}
            {mode === "cards" && flip && (
              <div className="step-in mt-5 grid grid-cols-2 gap-3">
                <button onClick={() => grade(false)} className="h-12 rounded-full border-2 border-[rgb(190_84_104)]/40 text-sm font-bold text-[rgb(190_84_104)] hover:bg-[rgb(190_84_104)]/[0.06]">{t("notYet")}</button>
                <button onClick={() => grade(true)} className="btn-gold h-12 rounded-full text-sm font-bold">{t("knew")}</button>
              </div>
            )}
            {mode !== "cards" && (
              <div className={`mt-5 grid gap-2.5 ${mode !== "quiz" ? "grid-cols-2" : ""}`}>
                {opts.map((o, n) => {
                  const ok = o === right;
                  const cls = pick === null ? "border-line bg-surface hover:border-[rgb(201_166_94)]/60" : ok ? "pa-right border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15" : n === pick ? "pa-shake border-[rgb(190_84_104)] bg-[rgb(190_84_104)]/10" : "border-line opacity-60";
                  return mode === "quiz"
                    ? <button key={n} disabled={pick !== null} onClick={() => setPick(n)} className={`rounded-xl border-2 p-3.5 text-[15px] font-semibold transition ${cls}`}>{o}</button>
                    : <button key={n} disabled={pick !== null} onClick={() => setPick(n)} className={`font-arabic rounded-xl border-2 px-3 py-2 leading-[1.8] transition ${arBig} ${cls}`} dir="rtl" lang="ar">{o}</button>;
                })}
              </div>
            )}
            {answered && cur.ex && <VerseBlock word={cur} verse={verse} locale={locale} />}
            {mode !== "cards" && pick !== null && (
              <div className="step-in mt-4">
                <button onClick={() => grade(opts[pick] === right)} className={`h-12 w-full rounded-full text-sm font-bold ${opts[pick] === right ? "btn-gold" : "bg-ink text-bg"}`}>{t("next")}</button>
              </div>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      {/* review across all decks: first, with the number of words due today */}
      <div className="pa-card mt-8 p-5 pt-6 text-center sm:p-6">
        {due.length > 0 ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold rtl:tracking-normal">{t("dueCount", { n: due.length })}</p>
            <h2 className="mt-1 text-xl font-bold">{t("review")}</h2>
            <p className="mt-1 text-sm text-muted">{t("reviewLead")}</p>
            {modeButtons(due, beginReview)}
          </>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-gold"><IconCheckCircle className="h-9 w-9" /></span>
            <h2 className="mt-2 text-xl font-bold">{practised ? t("allDone") : t("nothingYet")}</h2>
            <p className="mt-1 max-w-md text-sm text-muted">{practised ? t("allDoneLead") : t("nothingYetLead")}</p>
          </div>
        )}
      </div>

      <div className="pa-card mt-4 flex flex-wrap items-center gap-5 p-5 pt-6 sm:p-6">
        <PracticeMedallion pct={total ? totalKnown / total : 0} size={96} uid="vc-all"><span className="font-display text-[17px] leading-none tabular-nums">{total ? Math.round((totalKnown / total) * 100) : 0}%</span></PracticeMedallion>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold">{t("known", { n: totalKnown, total })}</p>
          <details className="group mt-2">
            <summary className="cursor-pointer text-sm font-semibold text-accent">{t("howTitle")}</summary>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{t("howText")}</p>
          </details>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
        {decks.map((d, i) => {
          const s = stats[i], all = s.known === s.total;
          return (
            <li key={d.id} className="min-w-0">
              <div className={`pa-gate flex h-full flex-col items-center px-4 pb-5 pt-5 text-center ${all ? "is-done" : ""}`}>
                <PracticeStarNum n={all ? <IconCheckCircle className="h-4 w-4" /> : i + 1} size={34} filled={all} />
                <p className={`font-arabic mt-1 leading-[1.7] text-gold ${kids ? "text-[44px]" : "text-[34px]"}`} dir="rtl" lang="ar">{d.words[0]?.ar}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold rtl:tracking-normal">{t("deck", { n: i + 1 })}</p>
                <h2 className="mt-1.5 text-[17px] font-bold leading-snug">{deckTitle(d, locale)}</h2>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{deckDesc(d, locale)}</p>
                <span className="mt-3 block h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-line" aria-hidden><span className="block h-full rounded-full bg-gradient-to-r from-[#c6a65e] to-[#ecd7a2]" style={{ width: `${(s.known / s.total) * 100}%` }} /></span>
                <p className="mt-2 flex flex-wrap justify-center gap-x-2 text-xs text-muted">
                  <span>{t("deckKnown", { k: s.known, n: s.total })}</span>
                  {s.due > 0 && <span className="font-semibold text-gold">· {t("dueCount", { n: s.due })}</span>}
                </p>
                {modeButtons(d.words, (m) => beginDeck(d, m))}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** the example verse from the Quran API with the word highlighted, its translation and a link into the reader */
function VerseBlock({ word, verse, locale }: { word: Word; verse: ReturnType<typeof useVerse>; locale: string }) {
  const t = useTranslations("vocab");
  if (!word.ex) return null;
  const key = word.ex.key;
  return (
    <div className="step-in pa-card mt-4 p-4 text-center sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold rtl:tracking-normal">{t("inVerse")} · <span dir="ltr">{key}</span></p>
      {verse?.data ? (
        <>
          <p className="font-arabic mt-2 text-[24px] leading-[2]" dir="rtl" lang="ar">
            {verse.data.words.map((w) => (
              <span key={w.position} className={w.position === verse.pos ? "rounded-md bg-[rgb(201_166_94)]/20 px-1 text-gold" : ""}>{w.text} </span>
            ))}
          </p>
          {locale !== "ar" && verse.data.translation && <p className="mt-2 text-[15px] leading-relaxed text-muted">{verse.data.translation}</p>}
        </>
      ) : verse?.error ? (
        <p className="mt-2 text-sm text-muted">{t("verseError")}</p>
      ) : (
        <div className="mx-auto mt-3 h-8 w-3/4 animate-pulse rounded-lg bg-line" aria-hidden />
      )}
      <Link href={readerPath(key)} className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-accent hover:underline">{t("openReader")}</Link>
    </div>
  );
}
