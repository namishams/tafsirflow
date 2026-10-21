"use client";
// Swipe & Learn on the website (/swipe); mirrors mobile/src/features/swipe/SwipeScreen.tsx. A card is read mindfully
// first: a thin gold bar fills over `minSeconds` (owner: 10 s, from src/lib/feed/config.json "swipe"); before that the
// card resists a drag. Then it goes to the LEFT ("learned, next"): drag or swipe it left, press ← or the space bar, or
// use the gold button. A drag to the right (or →) bounces back with a gentle hint. Enter turns cards that have a back.
// After every `sessionSize` cards a short summary. Achievement moments of other learners come in between; sending one
// to the left sends that member a MashaAllah (the existing reaction endpoint and its caps).
import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { Link } from "@/i18n/navigation";
import { useLang } from "@/lib/learn/i18n";
import { useIntl } from "@/lib/learn/srs/format";
import { useHydrated } from "@/lib/learn/store";
import { bonusXp, initGamify } from "@/lib/learn/feed/gamify";
import { useFeedTimer } from "@/lib/learn/feed/statsStore";
import type { SwipeConfig } from "@/lib/learn/swipe/config";
import { XP_SET, answered, learned, sendMasha } from "@/lib/learn/swipe/learn";
import { flushShown, mashaState, swipeStreak, useSwipeStats } from "@/lib/learn/swipe/store";
import { useSwipeT } from "@/lib/learn/swipe/texts";
import { SwipeDeck, type SCard } from "./deck";
import { KIND_KEY, LearnCard, hasBack, type MashaView } from "./Card";

const AHEAD = 3;
type Session = { n: number; words: number; reviews: number; masha: number; xp: number };
const EMPTY_SESSION: Session = { n: 0, words: 0, reviews: 0, masha: 0, xp: 0 };
type Toast = { text: string; sub?: string } | null;

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(m.matches);
    on(); m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return r;
}

/** read time of the current card: counts only while the tab is visible */
function useReadTimer(key: string, seconds: number, on: boolean) {
  const [st, setSt] = useState({ key, ms: 0 });
  const acc = useRef({ key, ms: 0, from: 0 });
  if (acc.current.key !== key) acc.current = { key, ms: 0, from: Date.now() };
  useEffect(() => {
    if (!on || !key) return;
    const a = acc.current;
    a.from = Date.now();
    const spent = () => a.ms + (Date.now() - a.from);
    const id = window.setInterval(() => { if (!document.hidden) setSt({ key, ms: spent() }); else { a.ms = spent(); a.from = Date.now(); } }, 200);
    const vis = () => { if (document.hidden) { a.ms = spent(); } a.from = Date.now(); };
    document.addEventListener("visibilitychange", vis);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", vis); a.ms = spent(); };
  }, [key, on]);
  const ms = st.key === key ? st.ms : 0;
  const total = seconds * 1000;
  return { ready: ms >= total, left: Math.max(0, Math.ceil((total - ms) / 1000)), frac: total ? Math.min(1, ms / total) : 1 };
}

export default function SwipeLearn({ config }: { config: SwipeConfig }) {
  const st = useSwipeT();
  const nf = useIntl();
  const { lang, rtl } = useLang();
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const stats = useSwipeStats();
  const deck = useRef<SwipeDeck | null>(null);
  const [stack, setStack] = useState<SCard[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [masha, setMasha] = useState<MashaView>("open");
  const [session, setSession] = useState<Session>(EMPTY_SESSION);
  const [summary, setSummary] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const cur = stack[0];

  // ---------- the deck ----------
  // the stack lives in a ref as well: taking cards from the deck is a side effect and must not run inside a state updater
  const stackRef = useRef<SCard[]>([]);
  const setCards = useCallback((next: SCard[]) => { stackRef.current = next; setStack(next); }, []);
  const topUp = useCallback(() => {
    const d = deck.current;
    if (!d) return;
    const out = [...stackRef.current];
    while (out.length < AHEAD) { const c = d.take(); if (!c) break; out.push(c); }
    if (out.length !== stackRef.current.length) setCards(out);
  }, [setCards]);
  useEffect(() => {
    if (!hydrated) return;
    initGamify();
    const d = new SwipeDeck(lang, { momentEvery: config.momentEvery });
    deck.current = d;
    setCards([]);
    const off = d.onChange(topUp);
    topUp();
    const t = window.setTimeout(topUp, 600);
    return () => { window.clearTimeout(t); off(); d.dispose(); flushShown(); };
  }, [lang, hydrated, config.momentEvery, topUp, setCards]);
  useEffect(() => {
    if (cur) { setWaiting(false); return; }
    const t = window.setTimeout(() => setWaiting(true), 8000);
    const r = window.setInterval(topUp, 1500);
    return () => { window.clearTimeout(t); window.clearInterval(r); };
  }, [cur, topUp]);
  useEffect(() => {
    setFlipped(false); setAnswer(null); setHint(null); setDx(0); setLeaving(false);
    if (cur?.kind === "moment" && cur.moment) setMasha(mashaState(cur.moment.author.username) === "open" ? "open" : "already");
  }, [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const seconds = cur?.kind === "moment" ? Math.min(config.momentSeconds, config.minSeconds) : config.minSeconds;
  const timer = useReadTimer(cur?.id ?? "", seconds, !!cur && !summary);
  useFeedTimer(!summary);

  // ---------- learning a card ----------
  const showToast = useCallback((t: Toast) => { setToast(t); if (t) window.setTimeout(() => setToast((x) => (x === t ? null : x)), 3200); }, []);
  const advance = useCallback(() => {
    const c = stack[0];
    if (!c) return;
    if (c.kind === "moment") {
      void sendMasha(c).then((r) => {
        if (r === "sent") { setSession((s) => ({ ...s, masha: s.masha + 1 })); showToast({ text: st("mashaSent") }); }
        if (r === "profile") { deck.current?.stopMoments(); showToast({ text: st("mashaProfile") }); }
        if (r === "dayFull") deck.current?.stopMoments();
      });
    } else {
      const r = learned(c, config.dailyGrowth);
      const set = (session.n + 1) % config.sessionSize === 0;
      if (set) bonusXp(XP_SET);
      setSession((s) => ({ n: s.n + 1, words: s.words + (r.newWord ? 1 : 0), reviews: s.reviews + (r.review ? 1 : 0), masha: s.masha, xp: s.xp + r.xp + (set ? XP_SET : 0) }));
      if (r.streak) showToast({ text: st("streakTitle", { n: nf(r.streak) }), sub: r.xp ? st("summaryXp", { n: nf(r.xp) }) : undefined });
      if (set) setSummary(true);
    }
    setCards(stackRef.current.slice(1));
    topUp();
  }, [stack, config.dailyGrowth, config.sessionSize, session.n, showToast, st, nf, topUp, setCards]);

  const live = useRef({ ready: false, left: 0, advance, reduce, cur, summary });
  live.current = { ready: timer.ready, left: timer.left, advance, reduce, cur, summary };
  /** the card that is flying out (a second key press or drag must not skip the next card) */
  const leavingId = useRef<string | null>(null);
  const nudge = useCallback((text: string) => { setHint(text); setDx(0); }, []);
  const dismiss = useCallback(() => {
    const L = live.current;
    if (!L.cur || !L.ready || L.summary || leavingId.current === L.cur.id) return;
    leavingId.current = L.cur.id;
    if (L.reduce) { L.advance(); return; }
    setLeaving(true);
    window.setTimeout(() => L.advance(), 220);
  }, []);
  const tryLeft = useCallback(() => {
    const L = live.current;
    if (!L.cur || L.summary) return;
    if (L.ready) dismiss(); else nudge(st("tooEarly", { n: L.left }));
  }, [dismiss, nudge, st]);
  const flip = useCallback(() => { const c = live.current.cur; if (c && hasBack(c)) setFlipped((f) => !f); }, []);

  // ---------- keyboard: ← / space = learned (after the read time), → = bounce and hint, Enter = turn ----------
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      const onControl = !!el && /^(BUTTON|A)$/.test(el.tagName) && !el.hasAttribute("data-swipe-flip");
      if (typing) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); tryLeft(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); nudge(st("swipeLeft")); }
      else if (e.key === " " && !onControl) { e.preventDefault(); tryLeft(); }
      else if (e.key === "Enter" && !el?.closest("button, a")) { flip(); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [tryLeft, nudge, flip, st]);

  // ---------- drag with mouse, pen or finger ----------
  const drag = useRef<{ id: number; x: number; y: number; on: boolean; moved: boolean } | null>(null);
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-swipe-ignore]")) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, on: false, moved: false };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const mx = e.clientX - d.x, my = e.clientY - d.y;
    if (!d.on) {
      if (Math.abs(mx) < 8 || Math.abs(mx) < Math.abs(my) * 1.2) return;
      d.on = true; d.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (live.current.reduce) return;
    setDx(mx < 0 ? (live.current.ready ? mx : mx * 0.16) : mx * 0.3);
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.on) return;
    const mx = e.clientX - d.x;
    suppressClick.current = true;
    window.setTimeout(() => { suppressClick.current = false; }, 0);
    if (mx < -90) { if (live.current.ready) { dismiss(); return; } nudge(st("tooEarly", { n: live.current.left })); return; }
    if (mx > 50) { nudge(st("swipeLeft")); return; }
    setDx(0);
  };
  const suppressClick = useRef(false);

  const streak = hydrated ? swipeStreak(stats) : 0;
  const mom = cur?.kind === "moment";
  const wait = `${st("readMindfully")} · ${st("seconds", { n: nf(timer.left) })}`;
  const buttonTitle = !cur ? st("loading") : !timer.ready ? wait : mom ? (masha === "open" ? st("sendMasha") : st("nextCard")) : st("learned");
  // the button counts down; the line above says what to do (dimmed until the card is read)
  const status = hint ?? (mom && masha === "open" ? st("mashaHint") : st("swipeLeft"));
  const x = leaving ? "-125%" : `${dx}px`;
  const rot = leaving ? -9 : Math.max(-9, Math.min(9, dx / 40));

  return (
    <section className="stage girih relative overflow-hidden text-[#eef0f3]">
      <div className="relative mx-auto flex max-w-xl flex-col px-4 pb-6 pt-3" style={{ minHeight: "calc(100dvh - 8.5rem)" }}>
        {/* the bar: close, title, progress of the set and the streak */}
        <div className="flex h-14 items-center gap-2">
          <Link href="/masterclass" aria-label={st("close")} className="grid h-11 w-11 place-items-center rounded-full text-[#f3e2b6] transition hover:bg-white/10">
            <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="text-[16px] font-bold leading-tight text-white">{st("title")}</h1>
            <p className="text-[12px] text-white/60" aria-live="polite">{st("progress", { n: nf((session.n % config.sessionSize) + (summary ? config.sessionSize : 0)), total: nf(config.sessionSize) })}</p>
          </div>
          <p className="flex h-11 w-11 items-center justify-center gap-0.5 text-[13px] font-bold" aria-label={st("entryStreak", { n: nf(streak) })}>
            <svg aria-hidden width="15" height="15" viewBox="0 0 24 24" fill={streak ? "rgb(214,180,108)" : "none"} stroke={streak ? "rgb(214,180,108)" : "rgba(255,255,255,0.6)"} strokeWidth="1.8"><path d="M12 22c4.4 0 7-2.9 7-6.6 0-3.7-2.6-6.1-4.6-8.9-.5 2-1.6 3.2-2.9 3.9C11.8 7.6 10.4 4.5 8.6 2c-.1 3.6-3.6 6.4-3.6 11.6C5 18.6 7.6 22 12 22z" /></svg>
            <span className={streak ? "text-[#f3e2b6]" : "text-white/60"}>{nf(streak)}</span>
          </p>
        </div>

        {/* the stack */}
        <div className="relative my-2 flex-1" style={{ minHeight: "max(380px, min(60dvh, 640px))" }}>
          {summary ? (
            <Summary s={session} size={config.sessionSize} streak={streak} onContinue={() => { setSummary(false); topUp(); }} />
          ) : cur ? (
            <>
              {stack[1] ? (
                <div aria-hidden inert className="pointer-events-none absolute inset-0 opacity-90" style={{ transform: `translateY(12px) scale(${0.94 + Math.min(0.06, Math.abs(dx) / 4000)})` }}>
                  <LearnCard card={stack[1]} flipped={false} onFlip={() => undefined} answer={null} onAnswer={() => undefined} hidden />
                </div>
              ) : null}
              <div role="group" aria-roledescription="card" aria-label={st("a11yCard", { kind: st(KIND_KEY[cur.kind]) })}
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { drag.current = null; setDx(0); }}
                onClickCapture={(e) => { if (suppressClick.current) { e.stopPropagation(); e.preventDefault(); } }}
                className="absolute inset-0 touch-pan-y select-none"
                style={{ transform: `translateX(${x}) rotate(${reduce ? 0 : rot}deg)`, transition: drag.current?.on ? "none" : reduce ? "none" : leaving ? "transform 220ms ease-in" : "transform 320ms cubic-bezier(.2,1.4,.4,1)" }}>
                <LearnCard key={cur.id} card={cur} flipped={flipped} masha={masha} onFlip={flip}
                  answer={answer} onAnswer={(i) => { if (answer !== null) return; const q = cur.web?.quiz; setAnswer(i < 0 ? q?.answer ?? 0 : i); if (i >= 0) answered(i === q?.answer); }} />
                {/* the read timer: a thin gold bar along the top of the card */}
                <span aria-hidden className="pointer-events-none absolute inset-x-[22px] top-[14px] h-[3px] overflow-hidden rounded bg-[rgba(214,180,108,0.2)]">
                  <span className="absolute inset-y-0 start-0 block rounded bg-[rgb(214,180,108)]" style={{ width: `${timer.frac * 100}%`, transition: reduce ? "none" : "width 200ms linear" }} />
                </span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center rounded-[22px] border border-[rgba(214,180,108,0.35)] p-6 text-center">
              <p aria-live="polite" className="text-[15px] font-semibold text-[#f3e2b6]">{waiting ? st("offline") : st("loading")}</p>
            </div>
          )}
        </div>

        {/* status line and the one gold action */}
        {!summary ? (
          <div className="grid justify-items-center gap-3 pt-2">
            <p aria-live="polite" className={`flex min-h-[22px] items-center gap-2 text-center text-[13.5px] font-medium ${timer.ready ? "text-[#f3e2b6]" : "text-white/60"}`}>
              {timer.ready && cur ? <span aria-hidden className="text-[16px] font-bold text-[rgb(214,180,108)]">←</span> : null}{cur ? status : ""}
            </p>
            <button type="button" onClick={dismiss} disabled={!cur || !timer.ready}
              className="h-[52px] w-full max-w-[420px] rounded-full text-[15px] font-bold shadow-sm transition active:scale-[0.985] disabled:opacity-45"
              style={{ background: "linear-gradient(180deg,#dcc48c,#c6a65e)", color: "rgb(8,38,29)" }}>
              {buttonTitle}
            </button>
            <p className="text-center text-[12px] text-white/55">{cur && hasBack(cur) && !flipped ? `${st("tapFlip")} · ` : ""}{st("keys")}</p>
          </div>
        ) : null}

        {toast ? (
          <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center px-4">
            <div role="status" className="rounded-full border border-[rgb(214,180,108)] bg-[rgb(8,38,29)] px-5 py-2.5 text-center shadow-lg">
              <p className="text-[14px] font-bold text-[#f3e2b6]">{toast.text}</p>
              {toast.sub ? <p className="mt-0.5 text-[12px] font-semibold text-[rgb(214,180,108)]">{toast.sub}</p> : null}
            </div>
          </div>
        ) : null}
        <span className="sr-only" dir={rtl ? "rtl" : "ltr"}>{st("lead")}</span>
      </div>
    </section>
  );
}

function Summary({ s, size, streak, onContinue }: { s: Session; size: number; streak: number; onContinue: () => void }) {
  const st = useSwipeT();
  const nf = useIntl();
  const lines = [
    s.words ? (s.words === 1 ? st("summaryWord1") : st("summaryWords", { n: nf(s.words) })) : null,
    s.reviews ? st("summaryReviews", { n: nf(s.reviews) }) : null,
    s.masha ? st("summaryMasha", { n: nf(s.masha) }) : null,
  ].filter((x): x is string => !!x);
  return (
    <div className="absolute inset-0 grid place-content-center justify-items-center gap-3.5 rounded-[22px] border border-[rgb(214,180,108)] bg-[rgb(8,38,29)] p-7 text-center">
      <span className="grid h-[78px] w-[78px] place-items-center rounded-full border-2 border-[rgb(214,180,108)] font-display text-[26px] text-[#f3e2b6]">{nf(size)}</span>
      <h2 className="text-[30px] font-semibold text-white" style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }}>{st("summaryTitle")}</h2>
      <p className="text-[17px] font-bold text-[#f3e2b6]">{[st("summaryCards", { n: nf(size) }), ...lines].join(" · ")}</p>
      {s.xp ? <p className="text-[14px] font-semibold text-[rgb(214,180,108)]">{st("summaryXp", { n: nf(s.xp) })}</p> : null}
      {streak ? <p className="text-[13.5px] text-white/75">{st("entryStreak", { n: nf(streak) })}</p> : null}
      <div className="mt-2.5 grid w-full max-w-[360px] gap-2.5">
        <button type="button" onClick={onContinue} autoFocus className="h-[52px] rounded-full text-[15px] font-bold" style={{ background: "linear-gradient(180deg,#dcc48c,#c6a65e)", color: "rgb(8,38,29)" }}>{st("continue")}</button>
        <Link href="/masterclass" className="grid h-[52px] place-items-center rounded-full border border-white/30 bg-white/5 text-[15px] font-bold text-white hover:border-white">{st("finish")}</Link>
      </div>
    </div>
  );
}
