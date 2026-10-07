"use client";
import { ArrowBack } from "./Icons";
import { PracticeCelebrate, PracticeMedallion, PracticeStarNum, PracticeWindow } from "./art/PracticeArt";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { vocabFor, type Deck, type Word } from "@/lib/vocab";
import { readJSON, writeJSON } from "@/lib/storage";
import { today } from "@/lib/learning";
import { award } from "@/lib/points";

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
  useEffect(() => {
    const load = () => setBoxes(readJSON<Box>(KEY, {}));
    load();
    window.addEventListener("tf-synced", load); // the account copy arrives after the first render on a new device
    return () => window.removeEventListener("tf-synced", load);
  }, []);

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
    const all = VOCAB_DECKS.flatMap((d) => d.words).filter((w) => w.id !== cur.id).map(mean).filter((m) => m !== mean(cur));
    setOpts(shuffle([mean(cur), ...shuffle(Array.from(new Set(all))).slice(0, 3)]));
    setPick(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur?.id, mode]);

  const grade = (ok: boolean) => {
    if (!cur) return;
    const b = boxes[cur.id]?.box ?? 0;
    const nb = ok ? Math.min(5, b + 1) : 1;
    const next = { ...boxes, [cur.id]: { box: nb, due: today() + GAP[nb] } };
    setBoxes(next); writeJSON(KEY, next); award("vocab");
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }));
    setQueue((q) => (ok ? q.slice(1) : [...q.slice(1), cur])); // missed words come back at the end
    setFlip(false); setPick(null); // pick must reset here: a missed last word comes back as the same card and the options effect does not re-run
  };

  const totalKnown = useMemo(() => VOCAB_DECKS.reduce((n, d) => n + known(d), 0), [boxes]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = VOCAB_DECKS.reduce((n, d) => n + d.words.length, 0);

  if (deck) {
    const pct = score.n ? score.ok / score.n : 0;
    return (
      <section className="mt-8">
        <button onClick={() => setDeck(null)} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><ArrowBack /> {t("decks")}</button>
        <h2 className="font-display mt-2 text-3xl">{de ? deck.title_de : deck.title_en}</h2>
        {!cur ? (
          <div className="pa-card relative mt-6 overflow-hidden p-6 pt-8 text-center">
            {pct >= 0.7 && <PracticeCelebrate />}
            <PracticeMedallion pct={pct} size={132} uid="vc-m" className="pa-medal-in mx-auto" turn={pct >= 0.7}>
              <span className="font-display text-[26px] leading-none tabular-nums" dir="ltr">{score.ok}<span className="text-[15px] text-[#f3e2b6]/60">/{score.n}</span></span>
            </PracticeMedallion>
            <p className="relative mt-4 text-lg font-bold">{t("roundDone", { ok: score.ok, n: score.n })}</p>
            <div className="relative mt-5 flex flex-wrap justify-center gap-3">
              <button onClick={() => begin(deck, mode)} className="btn-gold h-11 rounded-full px-6 text-sm font-bold">{t("again")}</button>
              <button onClick={() => setDeck(null)} className="h-11 rounded-full border border-line px-6 text-sm font-bold hover:border-[rgb(201_166_94)]">{t("decks")}</button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 text-sm text-muted">
              <span>{t("left", { n: queue.length })}</span>
              <span className="tabular-nums" dir="ltr">{score.ok} / {score.n}</span>
            </div>
            <div className={`pa-flip mt-3 ${mode === "cards" && flip ? "is-flipped" : ""}`}>
              <div className="pa-flip-inner min-h-[300px]">
                {/* front: the word in an arch of light */}
                <div className="pa-flip-face stage girih relative grid min-h-[300px] place-items-center overflow-hidden rounded-2xl border border-[rgb(214_180_108)]/35 px-5 py-10 text-center text-[#eef0f3]">
                  <PracticeWindow uid="vc-w" className="absolute left-1/2 top-3 h-[calc(100%-24px)] w-auto -translate-x-1/2 opacity-35" />
                  <div className="relative">
                    <p key={cur.id} className="pa-letter-swap font-arabic text-[54px] leading-[1.7] text-[#f6e7bf] drop-shadow-[0_0_22px_rgba(233,207,153,.3)]" dir="rtl" lang="ar">{cur.ar}</p>
                    {mode === "quiz" && pick !== null && <p className="mt-1 text-[15px] italic text-[rgb(233_207_153)]">{cur.tr}</p>}
                  </div>
                </div>
                {/* back: meaning, transliteration, root and the verse it comes from */}
                {mode === "cards" && (
                  <div className="pa-flip-face pa-flip-back pa-card grid place-items-center p-6 text-center">
                    <div className="relative">
                      <p className="font-arabic text-[34px] leading-[1.7] text-gold" dir="rtl" lang="ar">{cur.ar}</p>
                      <p className="italic text-gold">{cur.tr}{cur.root ? ` · ${t("root")}: ${cur.root}` : ""}</p>
                      <p className="font-display mt-2 text-2xl">{mean(cur)}</p>
                      {cur.ex && <Link href={`/surah/${cur.ex.key.split(":")[0]}?v=${cur.ex.key.split(":")[1]}`} className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 text-sm text-accent hover:underline"><span className="font-arabic text-lg" dir="rtl" lang="ar">{cur.ex.ar}</span> · {cur.ex.key}</Link>}
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
            {mode === "quiz" && (
              <div className="mt-5 grid gap-2.5">
                {opts.map((o, n) => {
                  const right = o === mean(cur);
                  const cls = pick === null ? "border-line bg-surface hover:border-[rgb(201_166_94)]/60" : right ? "pa-right border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15" : n === pick ? "pa-shake border-[rgb(190_84_104)] bg-[rgb(190_84_104)]/10" : "border-line opacity-60";
                  return <button key={n} disabled={pick !== null} onClick={() => setPick(n)} className={`rounded-xl border-2 p-3.5 text-[15px] font-semibold transition ${cls}`}>{o}</button>;
                })}
                {pick !== null && (
                  <div className="step-in mt-1 text-center">
                    {cur.ex && <Link href={`/surah/${cur.ex.key.split(":")[0]}?v=${cur.ex.key.split(":")[1]}`} className="inline-flex flex-wrap items-center justify-center gap-2 text-sm text-accent hover:underline"><span className="font-arabic text-lg" dir="rtl" lang="ar">{cur.ex.ar}</span> · {cur.ex.key}</Link>}
                    <button onClick={() => grade(opts[pick] === mean(cur))} className={`mt-3 h-12 w-full rounded-full text-sm font-bold ${opts[pick] === mean(cur) ? "btn-gold" : "bg-ink text-bg"}`}>{t("next")}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      <div className="pa-card mt-8 flex flex-wrap items-center gap-5 p-5 pt-6 sm:p-6">
        <PracticeMedallion pct={total ? totalKnown / total : 0} size={96} uid="vc-all"><span className="font-display text-[17px] leading-none tabular-nums">{total ? Math.round((totalKnown / total) * 100) : 0}%</span></PracticeMedallion>
        <p className="min-w-0 flex-1 text-[16px] font-semibold">{t("known", { n: totalKnown, total })}</p>
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
        {VOCAB_DECKS.map((d, i) => {
          const k = known(d), all = k === d.words.length;
          return (
            <li key={d.id} className="min-w-0">
              <div className={`pa-gate flex h-full flex-col items-center px-4 pb-5 pt-5 text-center ${all ? "is-done" : ""}`}>
                <PracticeStarNum n={all ? "✓" : i + 1} size={34} filled={all} />
                <p className="font-arabic mt-1 text-[34px] leading-[1.7] text-gold" dir="rtl" lang="ar">{d.words[0]?.ar}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold rtl:tracking-normal">{t("deck", { n: i + 1 })} · <span dir="ltr">{k}/{d.words.length}</span></p>
                <h2 className="mt-1.5 text-[17px] font-bold leading-snug">{de ? d.title_de : d.title_en}</h2>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{de ? d.desc_de : d.desc_en}</p>
                <span className="mt-3 block h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-line" aria-hidden><span className="block h-full rounded-full bg-gradient-to-r from-[#c6a65e] to-[#ecd7a2]" style={{ width: `${(k / d.words.length) * 100}%` }} /></span>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button onClick={() => begin(d, "cards")} className="btn-gold h-10 rounded-full px-4 text-sm font-bold">{t("cards")}</button>
                  <button onClick={() => begin(d, "quiz")} className="h-10 rounded-full border border-line px-4 text-sm font-bold hover:border-[rgb(201_166_94)]">{t("quiz")}</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
