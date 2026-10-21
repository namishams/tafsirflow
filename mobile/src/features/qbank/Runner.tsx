import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useEntitlement } from "@/lib/entitlements";
import { usePro } from "@/lib/pro";
import { useStored } from "@/lib/store";
import { ARABIC_FONT, FONT, GARNET, R, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { award } from "@/web/points";
import { bonusXp, gEvent, useGamify } from "@/features/feed/gamify";
import { success } from "@/features/feed/haptics";
import { takeBurst, tickGarden } from "@/features/garden/garden";
import { shuffleWith } from "@/features/exam/integrity";
import { SUBJECTS, locOf, qLangOf, type Q, type QLang } from "./bank";
import { QBANK_KEY, consumeFreeQ, recordAnswer, recordSession, type Hist, type Mode, type QbankStore } from "./engine";
import { CareNote } from "@/components/CareNote";
import { useQbankT } from "./text";
import { Bar, Explanation, OptionButton, confirmReport, Panel, QuestionMeta, StatTile, VerseCard, pctText } from "./ui";
import type { QStage, QSubject } from "./types";

// One run through a list of questions. Feedback modes (practice, drill, daily, bookmarks, repetition) show the
// answer and its explanation at once; the timed test and the mock exam collect the answers and show them at the end.

export type Answer = { q: Q; order: number[]; picked: number | null; ok: boolean; ms: number };

/** the question language chosen in the centre's settings (or the app language) */
export function useQLang(): QLang {
  const { lang } = useLang();
  const s = useStored<Partial<QbankStore>>(QBANK_KEY, {});
  return qLangOf(lang, s.qlang ?? "auto");
}

/** rewards through the app's existing systems: points (quiz), feed XP via gamify, tree growth in the garden */
export function useQbankRewards() {
  const gm = useGamify();
  const { pro } = usePro();
  return useCallback((correct: number, total: number, bonus = 0) => {
    if (!total) return;
    award("quiz");
    for (let i = 0; i < Math.min(correct, 10); i++) gEvent({ t: "quiz", right: true });
    if (bonus) bonusXp(bonus);
    takeBurst();
    tickGarden(gm.xp + bonus, false, pro, gm.names);
  }, [gm.xp, gm.names, pro]);
}

type RunnerProps = {
  questions: Q[];
  mode: Mode;
  /** collect answers and show them at the end (timed test, mock exam) */
  deferred?: boolean;
  /** seconds per question for the runner's own timer (timed test); the mock exam's timer comes from `questionLeft` */
  questionSec?: number;
  /** remaining seconds from an exam session (mock exam) */
  questionLeft?: number | null;
  rand?: () => number;
  /** practice without Pro: count each answer against the free allowance */
  countFree?: boolean;
  /** stop early when the free allowance runs out */
  limit?: number;
  onIndex?: (i: number, open: boolean) => void;
  onDone: (answers: Answer[]) => void;
  timeoutSignal?: number;
  /** a ref that always holds the answers so far (the mock exam needs them when its time runs out) */
  mirror?: { current: Answer[] };
};

export function Runner({ questions, mode, deferred, questionSec, questionLeft, rand, countFree, limit, onIndex, onDone, timeoutSignal, mirror }: RunnerProps) {
  const t = useTheme();
  const qt = useQbankT();
  const lang = useQLang();
  const rtl = lang === "ar";
  const store = useStored<Partial<QbankStore>>(QBANK_KEY, {});
  const orders = useMemo(() => questions.map((q) => shuffleWith([0, 1, 2, 3], rand ?? Math.random)), [questions]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const answers = useRef<Answer[]>([]);
  const started = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const q = questions[i];
  const order = orders[i];
  const loc = q ? locOf(q, lang) : null;
  const correctDisplay = order ? order.indexOf(0) : 0;
  const n = Math.min(questions.length, limit ?? questions.length);

  useEffect(() => { onIndex?.(i, !revealed); }, [i, revealed]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!questionSec || revealed) return;
    const tm = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(tm);
  }, [questionSec, revealed, i]);

  const commit = useCallback((display: number | null) => {
    if (!q || !order) return;
    const ms = Date.now() - started.current;
    const ok = display !== null && order[display] === 0;
    answers.current = [...answers.current.filter((a) => a.q.id !== q.id), { q, order, picked: display, ok, ms }];
    if (mirror) mirror.current = answers.current;
    recordAnswer(q, ok, ms);
    if (countFree) consumeFreeQ(1);
    return ok;
  }, [q, order, countFree, mirror]);

  const advance = useCallback(() => {
    if (i + 1 >= n) { onDone(answers.current); return; }
    setI(i + 1); setPicked(null); setRevealed(false); started.current = Date.now(); setNow(Date.now());
  }, [i, n, onDone]);

  // runner's own question timer (timed test)
  const left = questionSec && !revealed ? Math.max(0, Math.ceil((started.current + questionSec * 1000 - now) / 1000)) : null;
  const timedOut = useRef(-1);
  useEffect(() => {
    if (left === 0 && timedOut.current !== i) { timedOut.current = i; commit(picked); advance(); }
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  // the exam session's question timer (mock exam): a signal from outside
  const lastSignal = useRef(timeoutSignal ?? 0);
  useEffect(() => {
    if (timeoutSignal !== undefined && timeoutSignal !== lastSignal.current) { lastSignal.current = timeoutSignal; commit(picked); advance(); }
  }, [timeoutSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!q || !loc || !order) return null;
  const pick = (d: number) => {
    if (revealed) return;
    if (deferred) { setPicked(d); return; }
    setPicked(d); setRevealed(true);
    if (commit(d)) success();
  };
  const stateOf = (d: number) => {
    if (!revealed) return picked === d ? "picked" : "idle";
    if (d === correctDisplay) return "right";
    if (d === picked) return "wrong";
    return "dim";
  };
  const shownLeft = left ?? questionLeft ?? null;
  const bm = (store.bm ?? []).includes(q.id);
  const progress = (i + (revealed ? 1 : 0)) / Math.max(1, n);

  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{qt("q_of", { i: i + 1, n })}</Text>
          {shownLeft !== null ? (
            <View accessibilityLiveRegion="polite" style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 26, borderRadius: R.pill, backgroundColor: shownLeft <= 10 ? "rgba(150,52,52,0.12)" : t.accentSoft }}>
              <Icon name="clock" size={13} color={shownLeft <= 10 ? GARNET : t.accent} />
              <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: shownLeft <= 10 ? GARNET : t.accent, fontVariant: ["tabular-nums"] }}>{qt("seconds", { s: shownLeft })}</Text>
            </View>
          ) : null}
        </View>
        <Bar value={progress} color={t.gold} />
      </View>
      <QuestionMeta q={q} bookmarked={bm} />
      {q.v ? <VerseCard key={q.id} verseKey={q.v} word={q.w} reveal={revealed} /> : null}
      <Text style={{ fontFamily: rtl ? ARABIC_FONT : FONT.bold, fontSize: rtl ? 21 : 18.5, lineHeight: rtl ? 36 : 27, color: t.ink, textAlign: rtl ? "right" : "left", writingDirection: rtl ? "rtl" : "ltr" }} accessibilityRole="header">{loc[0]}</Text>
      <View style={{ gap: 10 }}>
        {order.map((orig, d) => <OptionButton key={`${q.id}-${d}`} index={d} text={loc[1][orig]} state={stateOf(d)} rtl={rtl} disabled={revealed} onPress={() => pick(d)} />)}
      </View>
      {revealed ? <Explanation q={q} lang={lang} ok={picked !== null && order[picked] === 0} picked={picked === null ? undefined : loc[1][order[picked]]} correctText={loc[1][0]} /> : null}
      {revealed ? <GoldButton title={i + 1 >= n ? qt("finish") : qt("next")} icon={i + 1 >= n ? "checkCircle" : "chevronRight"} onPress={advance} />
        : deferred ? <GoldButton title={i + 1 >= n ? qt("finish") : qt("next")} icon="chevronRight" disabled={picked === null} onPress={() => { commit(picked); advance(); }} /> : null}
      {mode !== "mock" && q.review === "needs_review" ? <CareNote onReport={() => confirmReport(q.id, qt)} /> : null}
    </View>
  );
}

/** the end of a run: score, time, subjects, and every answer with its explanation */
export function Results({ answers, mode, stage, passMark, onAgain, extra }: { answers: Answer[]; mode: Mode; stage?: QStage; passMark?: number; onAgain?: () => void; extra?: React.ReactNode }) {
  const t = useTheme();
  const qt = useQbankT();
  const lang = useQLang();
  const rtl = lang === "ar";
  const c = answers.filter((a) => a.ok).length, n = answers.length;
  const ms = n ? answers.reduce((x, a) => x + a.ms, 0) / n : 0;
  const bySub = SUBJECTS.map((s) => ({ s: s.id, n: answers.filter((a) => a.q.s === s.id).length, c: answers.filter((a) => a.q.s === s.id && a.ok).length })).filter((x) => x.n);
  const [open, setOpen] = useState<string | null>(null);
  const wrong = answers.filter((a) => !a.ok);
  const pro = useEntitlement("qbank").allowed;
  return (
    <View style={{ gap: 16 }}>
      <Panel title={qt("result")}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatTile value={pctText(n ? c / n : null)} label={qt("score", { c, n })} />
          <StatTile value={qt("seconds", { s: Math.round(ms / 1000) })} label={qt("avgTime", { s: Math.round(ms / 1000) })} />
        </View>
        {passMark !== undefined ? <Bar value={n ? c / n : 0} mark={passMark} /> : null}
        {extra}
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{qt("xp")}</Text>
      </Panel>
      {bySub.length > 1 ? (
        <Panel title={qt("bySubject")}>
          {bySub.map((x) => (
            <View key={x.s} style={{ gap: 6 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{qt(`s_${x.s}`)}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{qt("score", { c: x.c, n: x.n })}</Text>
              </View>
              <Bar value={x.c / x.n} />
            </View>
          ))}
        </Panel>
      ) : null}
      <Panel title={qt("reviewAnswers")}>
        {answers.map((a, k) => {
          const loc = locOf(a.q, lang);
          const isOpen = open === a.q.id;
          return (
            <View key={a.q.id} style={{ gap: 8, borderTopWidth: k ? 1 : 0, borderTopColor: t.line, paddingTop: k ? 10 : 0 }}>
              <Pressable onPress={() => setOpen(isOpen ? null : a.q.id)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <Icon name={a.ok ? "checkCircle" : "flag"} size={17} color={a.ok ? t.accent : GARNET} />
                <Text style={{ flex: 1, fontFamily: rtl ? ARABIC_FONT : FONT.medium, fontSize: rtl ? 16 : 14, lineHeight: rtl ? 28 : 20, color: t.ink, textAlign: rtl ? "right" : "left" }} numberOfLines={isOpen ? undefined : 2}>{`${k + 1}. ${loc[0]}`}</Text>
                <Icon name="chevronDown" size={15} color={t.muted} />
              </Pressable>
              {isOpen ? (
                <View style={{ gap: 8 }}>
                  {a.q.v ? <VerseCard verseKey={a.q.v} word={a.q.w} reveal /> : null}
                  {!a.ok ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: GARNET }}>{a.picked === null ? qt("noAnswer") : qt("yourAnswer", { a: loc[1][a.order[a.picked]] })}</Text> : null}
                  <Explanation q={a.q} lang={lang} ok={null} correctText={loc[1][0]} />
                </View>
              ) : null}
            </View>
          );
        })}
      </Panel>
      <View style={{ gap: 10 }}>
        {wrong.length && mode !== "mock" && pro ? <GoldButton title={qt("drillMistakes")} icon="repeat" onPress={() => router.replace({ pathname: "/exams/session", params: { mode: "drill", ids: wrong.map((a) => a.q.id).join(",") } } as unknown as Href)} /> : null}
        {onAgain ? <OutlineButton title={qt("again")} icon="repeat" onPress={onAgain} /> : null}
        <OutlineButton title={qt("backHome")} icon="cap" onPress={() => router.replace("/exams" as Href)} />
      </View>
    </View>
  );
}

/** stores a finished run in the history */
export function saveRun(mode: Mode, answers: Answer[], opts: { s?: QSubject; g?: QStage; pass?: boolean; void?: boolean; n?: number } = {}): Hist {
  const h: Hist = { at: Date.now(), mode, c: answers.filter((a) => a.ok).length, ms: answers.reduce((x, a) => x + a.ms, 0), ...opts, n: Math.max(opts.n ?? 0, answers.length) };
  recordSession(h);
  return h;
}
