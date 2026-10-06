"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { vocabFor, type Deck, type Word } from "@/lib/vocab";
import { readJSON, writeJSON } from "@/lib/storage";
import { today } from "@/lib/learning";

// Leitner boxes: a known word moves up a box and comes back later (1, 2, 4, 8, 16 days)
type Box = Record<string, { box: number; due: number }>;
const KEY = "tf:vocab";
const GAP = [0, 1, 2, 4, 8, 16];
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export default function VocabTrainer() {
  const t = useTranslations("vocab");
  const locale = useLocale();
  const de = locale === "de";
  const VOCAB_DECKS = useMemo(() => vocabFor(locale), [locale]);
  const [boxes, setBoxes] = useState<Box>({});
  const [deck, setDeck] = useState<Deck | null>(null);
  const [mode, setMode] = useState<"cards" | "quiz">("cards");
  const [queue, setQueue] = useState<Word[]>([]);
  const [flip, setFlip] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const [opts, setOpts] = useState<string[]>([]);
  const [score, setScore] = useState({ ok: 0, n: 0 });
  useEffect(() => { setBoxes(readJSON<Box>(KEY, {})); }, []);

  const mean = (w: Word) => (de ? w.de : w.en);
  const known = (d: Deck) => d.words.filter((w) => (boxes[w.id]?.box ?? 0) >= 3).length;
  const dueIn = (d: Deck) => d.words.filter((w) => !boxes[w.id] || boxes[w.id].due <= today());

  const begin = (d: Deck, m: "cards" | "quiz") => {
    const due = dueIn(d);
    setDeck(d); setMode(m); setQueue(shuffle(due.length ? due : d.words).slice(0, 15)); setFlip(false); setPick(null); setScore({ ok: 0, n: 0 });
  };
  const cur = queue[0];
  useEffect(() => {
    if (!cur || !deck || mode !== "quiz") return;
    const all = VOCAB_DECKS.flatMap((d) => d.words).filter((w) => w.id !== cur.id).map(mean);
    setOpts(shuffle([mean(cur), ...shuffle(Array.from(new Set(all))).slice(0, 3)]));
    setPick(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur?.id, mode]);

  const grade = (ok: boolean) => {
    if (!cur) return;
    const b = boxes[cur.id]?.box ?? 0;
    const nb = ok ? Math.min(5, b + 1) : 1;
    const next = { ...boxes, [cur.id]: { box: nb, due: today() + GAP[nb] } };
    setBoxes(next); writeJSON(KEY, next);
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }));
    setQueue((q) => (ok ? q.slice(1) : [...q.slice(1), cur])); // missed words come back at the end
    setFlip(false);
  };

  const totalKnown = useMemo(() => VOCAB_DECKS.reduce((n, d) => n + known(d), 0), [boxes]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = VOCAB_DECKS.reduce((n, d) => n + d.words.length, 0);

  if (deck) {
    return (
      <section className="mt-6">
        <button onClick={() => setDeck(null)} className="text-sm font-semibold text-muted hover:text-ink">← {t("decks")}</button>
        <h2 className="font-display mt-2 text-3xl">{de ? deck.title_de : deck.title_en}</h2>
        {!cur ? (
          <div className="mt-6 rounded-lg border border-line bg-surface p-6 text-center">
            <p className="text-4xl">🌟</p>
            <p className="mt-2 text-lg font-bold">{t("roundDone", { ok: score.ok, n: score.n })}</p>
            <div className="mt-4 flex justify-center gap-3">
              <button onClick={() => begin(deck, mode)} className="h-11 rounded-md bg-ink px-5 text-sm font-bold text-bg">{t("again")}</button>
              <button onClick={() => setDeck(null)} className="h-11 rounded-md border border-line px-5 text-sm font-bold">{t("decks")}</button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-sm text-muted">{t("left", { n: queue.length })}</p>
            <div className="mt-3 rounded-lg border border-line bg-surface p-6 text-center">
              <p className="font-arabic text-5xl leading-[1.8]" dir="rtl">{cur.ar}</p>
              {mode === "cards" && !flip && <button onClick={() => setFlip(true)} className="mt-6 h-11 rounded-md bg-ink px-6 text-sm font-bold text-bg">{t("show")}</button>}
              {(mode === "cards" ? flip : pick !== null) && (
                <div className="mt-4">
                  <p className="italic text-gold">{cur.tr}{cur.root ? ` · ${t("root")}: ${cur.root}` : ""}</p>
                  <p className="mt-1 text-2xl font-bold">{mean(cur)}</p>
                  {cur.ex && <Link href={`/surah/${cur.ex.key.split(":")[0]}?v=${cur.ex.key.split(":")[1]}`} className="mt-3 inline-block text-sm text-accent hover:underline"><span className="font-arabic text-lg" dir="rtl">{cur.ex.ar}</span> · {cur.ex.key}</Link>}
                </div>
              )}
              {mode === "cards" && flip && (
                <div className="mt-6 flex justify-center gap-3">
                  <button onClick={() => grade(false)} className="h-11 rounded-md border border-line px-5 text-sm font-bold">↺ {t("notYet")}</button>
                  <button onClick={() => grade(true)} className="h-11 rounded-md bg-accent px-5 text-sm font-bold text-white">✓ {t("knew")}</button>
                </div>
              )}
              {mode === "quiz" && (
                <div className="mt-6 grid gap-2 text-start">
                  {opts.map((o, n) => {
                    const right = o === mean(cur);
                    const cls = pick === null ? "border-line hover:border-ink" : right ? "border-accent bg-accent-soft" : n === pick ? "border-red-500" : "border-line opacity-60";
                    return <button key={n} disabled={pick !== null} onClick={() => setPick(n)} className={`rounded-md border p-3 ${cls}`}>{o}</button>;
                  })}
                  {pick !== null && <button onClick={() => grade(opts[pick] === mean(cur))} className="mt-2 h-11 rounded-md bg-ink text-sm font-bold text-bg">{t("next")}</button>}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      <p className="mt-6 text-sm font-semibold text-muted">{t("known", { n: totalKnown, total })}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent" style={{ width: `${(totalKnown / total) * 100}%` }} /></div>
      <ul className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
        {VOCAB_DECKS.map((d, i) => (
          <li key={d.id} className="bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">{t("deck", { n: i + 1 })} · {known(d)}/{d.words.length}</p>
            <h2 className="mt-1 text-[17px] font-bold">{de ? d.title_de : d.title_en}</h2>
            <p className="mt-1 text-sm text-muted">{de ? d.desc_de : d.desc_en}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => begin(d, "cards")} className="h-10 rounded-md bg-ink px-4 text-sm font-bold text-bg">{t("cards")}</button>
              <button onClick={() => begin(d, "quiz")} className="h-10 rounded-md border border-line px-4 text-sm font-bold hover:border-ink">{t("quiz")}</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
