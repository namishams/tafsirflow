"use client";
// /vocab-decks/[deck] – cards ("Show meaning", "I knew it" / "Again") and a quiz for one deck. Web port of
// VocabDeckScreen in mobile/src/features/courses/Vocab.tsx: surah decks take every distinct word of the surah with its
// word-by-word meaning from the Quran data (nothing typed), theme decks come from the core vocabulary. Each rated card
// counts as vocabulary points, a finished quiz as quiz points.
import { useEffect, useMemo, useState } from "react";
import { GoldButton, LearnHero, LearnMain, Note, OutlineButton, Bar, Spinner } from "@/components/learn/ui";
import { award } from "@/lib/points";
import { meaning } from "@/lib/vocabI18n";
import { formatNumber, useLang } from "@/lib/learn/i18n";
import { RECITERS, getChapters, getVerses } from "@/lib/learn/quran";
import { ALL_WORDS, typeWords, type DeckRef } from "@/lib/learn/courses/decks";
import { useCT } from "@/lib/learn/courses/texts";
import { Quiz, shuffle, type RunQ } from "./parts";
import { useWT } from "./strings";

type Card = { ar: string; tr: string };

function useDeck(deck: DeckRef, lang: string, attempt: number): { title: string; cards: Card[] | null; failed: boolean } {
  const c = useCT();
  const [cards, setCards] = useState<Card[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [title, setTitle] = useState("");
  const key = deck.kind === "surah" ? `s${deck.surah}` : deck.kind === "type" ? `t${deck.type}` : `r${deck.root}`;
  useEffect(() => {
    let live = true;
    setCards(null); setFailed(false);
    if (deck.kind === "surah") {
      const s = deck.surah;
      setTitle(String(s));
      Promise.all([getVerses(s, lang, RECITERS[0]), getChapters(lang)]).then(([vs, chs]) => {
        if (!live) return;
        setTitle(chs.find((x) => x.id === s)?.name_simple ?? String(s));
        const seen = new Map<string, Card>();
        for (const v of vs) for (const w of v.words) if (w.char_type_name === "word" && !seen.has(w.text_uthmani) && (w.translation?.text ?? "").trim()) seen.set(w.text_uthmani, { ar: w.text_uthmani, tr: w.translation!.text.trim() });
        setCards([...seen.values()]);
      }).catch(() => { if (live) setFailed(true); });
    } else if (deck.kind === "type") {
      setTitle(c(`theme_${deck.type}` as never));
      setCards(typeWords(deck.type).map((w) => ({ ar: w.ar, tr: meaning(w, lang) })));
    } else {
      setTitle(c("theme_root", { r: deck.root }));
      setCards(ALL_WORDS.filter((w) => w.root === deck.root).map((w) => ({ ar: w.ar, tr: meaning(w, lang) })));
    }
    return () => { live = false; };
  }, [key, lang, attempt]); // eslint-disable-line react-hooks/exhaustive-deps
  return { title, cards, failed };
}

export default function VocabDeck({ deck }: { deck: DeckRef }) {
  const c = useCT();
  const w = useWT();
  const { lang } = useLang();
  const [attempt, setAttempt] = useState(0);
  const { title, cards, failed } = useDeck(deck, lang, attempt);
  const [mode, setMode] = useState<"cards" | "quiz">("cards");
  const [queue, setQueue] = useState<Card[]>([]);
  const [shown, setShown] = useState(false);
  const [known, setKnown] = useState(0);
  const [quizDone, setQuizDone] = useState<number | null>(null);
  const [quizRound, setQuizRound] = useState(0);
  useEffect(() => { if (cards) { setQueue(shuffle(cards)); setKnown(0); setShown(false); } }, [cards]);
  const qs: RunQ[] = useMemo(() => {
    if (!cards || cards.length < 4) return [];
    return shuffle(cards).slice(0, 10).map((k) => {
      const opts = shuffle([k.tr, ...shuffle(cards.filter((x) => x.tr !== k.tr)).slice(0, 3).map((x) => x.tr)]);
      return { q: k.ar, qAr: true, options: opts, answer: opts.indexOf(k.tr) };
    });
  }, [cards, quizRound]);
  const cur = queue[0];
  const rate = (ok: boolean) => {
    award("vocab");
    if (ok) setKnown((n) => n + 1);
    setQueue((q) => (ok ? q.slice(1) : [...q.slice(1), q[0]]));
    setShown(false);
  };
  const startQuiz = () => { setQuizDone(null); setQuizRound((r) => r + 1); setMode("quiz"); };
  const modes: ["cards" | "quiz", string][] = [["cards", c("vdCards")], ...(qs.length ? [["quiz", c("vdQuiz")] as ["quiz", string]] : [])];

  return (
    <div>
      <LearnHero uid="vdk" back={{ href: "/vocab-decks", label: c("vdTitle") }} kicker={c("vdTitle")} title={title || c("vdTitle")}
        lead={cards ? c("vdWords", { n: formatNumber(cards.length, lang) }) : undefined} word="كلمات" />
      <LearnMain>
        {failed ? (
          <div className="space-y-4">
            <Note tone="red" title={w("loadFailed")} />
            <GoldButton onClick={() => setAttempt((a) => a + 1)}>{w("tryAgain")}</GoldButton>
          </div>
        ) : !cards ? (
          <Spinner label={w("loading")} />
        ) : (
          <div className="space-y-6">
            {modes.length > 1 && (
              <div className="hm-seg max-w-xs" role="group" aria-label={c("vdTitle")} style={{ ["--i" as string]: mode === "cards" ? 0 : 1, ["--n" as string]: modes.length } as React.CSSProperties}>
                <span className="hm-seg-ind" aria-hidden />
                {modes.map(([m, label]) => (
                  <button key={m} type="button" aria-pressed={mode === m} onClick={() => (m === "quiz" ? startQuiz() : setMode("cards"))}>{label}</button>
                ))}
              </div>
            )}
            {mode === "cards" ? (
              cur ? (
                <div className="space-y-4">
                  <Bar value={known / Math.max(1, cards.length)} gold label={c("vdKnown", { n: known, m: cards.length })} />
                  <p className="text-[13px] text-muted" aria-live="polite">{c("vdKnown", { n: formatNumber(known, lang), m: formatNumber(cards.length, lang) })}</p>
                  <button type="button" onClick={() => setShown(true)} aria-expanded={shown}
                    className="hm-card relative flex min-h-[220px] w-full flex-col items-center justify-center gap-3 p-6 text-center">
                    <span lang="ar" dir="rtl" className="font-arabic text-[42px] leading-[1.8] sm:text-[48px]">{cur.ar}</span>
                    {shown
                      ? <span className="text-lg font-semibold text-accent" aria-live="polite">{cur.tr}</span>
                      : <span className="text-[14px] text-muted">{c("vdShow")}</span>}
                  </button>
                  {shown && (
                    <div className="grid grid-cols-2 gap-3">
                      <OutlineButton onClick={() => rate(false)}>{c("vdAgain")}</OutlineButton>
                      <GoldButton onClick={() => rate(true)}>{c("vdKnew")}</GoldButton>
                    </div>
                  )}
                </div>
              ) : cards.length ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <h2 className="font-display text-[26px]" aria-live="polite">{c("vdDone")}</h2>
                  <GoldButton onClick={() => { setQueue(shuffle(cards)); setKnown(0); }}>{c("tjAgain")}</GoldButton>
                </div>
              ) : <Note tone="muted" title={c("vdWords", { n: 0 })} />
            ) : quizDone === null ? (
              <Quiz key={quizRound} qs={qs} onDone={(r) => { award("quiz"); setQuizDone(r); }} />
            ) : (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <h2 className="font-display text-[26px]" aria-live="polite">{c("result", { n: formatNumber(quizDone, lang), m: formatNumber(qs.length, lang) })}</h2>
                <GoldButton onClick={startQuiz}>{c("tjAgain")}</GoldButton>
              </div>
            )}
          </div>
        )}
      </LearnMain>
    </div>
  );
}
