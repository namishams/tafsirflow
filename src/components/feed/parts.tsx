"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { statQuiz } from "@/lib/learn/feed/statsStore";
import type { WebCard, WebCta, WebVerse } from "@/lib/feedWeb/types";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { AppIcon, type IconName } from "./icons";
import { GOLD_BUTTON, STAGE, toneGradient, toneOf } from "./tokens";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@/styles/feed.css";

// Small parts of the feed cards, ported from mobile/src/features/feed (ornament.tsx, ui.tsx, KnowledgePost.tsx).

/** app points at a 360 pt card width → container query units of the card (`.fd-sq`) */
export const u = (n: number) => `${(n / 3.6).toFixed(3)}cqw`;

/** a fine gold rule with a lozenge in the middle (the dividers of a mushaf page) */
export function Rule({ width = "42%", color = "rgba(214,180,108,0.6)", className = "" }: { width?: string | number; color?: string; className?: string }) {
  return (
    <span aria-hidden className={`relative mx-auto flex h-[7px] items-center justify-center ${className}`} style={{ width }}>
      <span className="absolute inset-x-0 h-[1.5px]" style={{ background: `linear-gradient(90deg, rgba(214,180,108,0), ${color}, rgba(214,180,108,0))` }} />
      <span className="h-[5px] w-[5px] rotate-45" style={{ background: color }} />
    </span>
  );
}

/** the double gold hairline frame inside a post, with small lozenges in the corners (an illuminated page) */
export function GoldFrame({ inset }: { inset: number }) {
  const c = (pos: CSSProperties) => <span className="absolute h-[6px] w-[6px] rotate-45" style={{ background: "rgba(214,180,108,0.75)", ...pos }} />;
  return (
    <span aria-hidden className="pointer-events-none absolute" style={{ left: inset, right: inset, top: inset, bottom: inset }}>
      <span className="absolute inset-0 border" style={{ borderColor: "rgba(214,180,108,0.5)" }} />
      <span className="absolute border" style={{ left: 4, right: 4, top: 4, bottom: 4, borderColor: "rgba(214,180,108,0.22)" }} />
      {c({ left: -3, top: -3 })}{c({ right: -3, top: -3 })}{c({ left: -3, bottom: -3 })}{c({ right: -3, bottom: -3 })}
    </span>
  );
}

/** the round avatar of a post header: a gold ring around the post's tone, with an icon or initials */
export function RingAvatar({ seed, icon, text, size = 38 }: { seed: string; icon?: IconName; text?: string; size?: number }) {
  return (
    <span aria-hidden className="grid shrink-0 place-items-center rounded-full p-[1.5px]" style={{ width: size, height: size, background: "linear-gradient(135deg,#f3e2b6,#c6a65e 55%,#8a6a2c)" }}>
      <span className="grid h-full w-full place-items-center rounded-full bg-bg p-[1.5px]">
        <span className="grid h-full w-full place-items-center rounded-full" style={{ background: toneGradient(toneOf(seed), 150), color: "rgb(233,207,153)" }}>
          {text ? <span className="text-[11.5px] font-bold">{text}</span> : <AppIcon name={icon ?? "book"} size={17} />}
        </span>
      </span>
    </span>
  );
}

/** icon button of the action rows (44 px target) */
export function IconBtn({ label, onClick, selected, disabled, children, className = "", pop }: { label: string; onClick?: () => void; selected?: boolean; disabled?: boolean; children: ReactNode; className?: string; pop?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} aria-pressed={selected}
      className={`grid h-11 w-11 place-items-center rounded-full transition hover:bg-accent-soft/60 active:opacity-60 disabled:opacity-40 ${pop ? "fd-pop" : ""} ${className}`}>
      {children}
    </button>
  );
}

/** the gold heart of a double tap (a calm fade, no bounce); `n` changes for every burst */
export function HeartBurst({ n }: { n: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!n) return;
    setOn(true);
    const id = window.setTimeout(() => setOn(false), 900);
    return () => window.clearTimeout(id);
  }, [n]);
  if (!on) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      <span className="fd-heart" style={{ color: "#b8913f" }}><AppIcon name="heart" filled size={104} mirror={false} /></span>
    </span>
  );
}

/** click and double click on one surface (Instagram): a single click waits briefly for a second one */
export function useTapGestures(onTap: () => void, onDouble: () => void) {
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  return () => {
    if (timer.current) { window.clearTimeout(timer.current); timer.current = null; onDouble(); return; }
    timer.current = window.setTimeout(() => { timer.current = null; onTap(); }, 260);
  };
}

/** scales the text inside a fixed box down until it fits (the app's adjustsFontSizeToFit with minimumFontScale) */
export function useFit(box: RefObject<HTMLElement | null>, content: RefObject<HTMLElement | null>, deps: unknown[], min = 0.45) {
  useLayoutEffect(() => {
    const b = box.current, c = content.current;
    if (!b || !c) return;
    const run = () => {
      let f = 1;
      c.style.setProperty("--fit", "1");
      while (f > min && c.scrollHeight > b.clientHeight + 1) { f = Math.round((f - 0.05) * 100) / 100; c.style.setProperty("--fit", String(f)); }
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(b);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** the gold wordmark (public/brand) at a height in cqw/px */
export function Wm({ tone = "gold", height, className = "" }: { tone?: "gold" | "deep"; height: string; className?: string }) {
  const ar = useLocale() === "ar";
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/brand/wordmark${ar ? "-ar" : ""}-${tone}.svg`} alt={ar ? "ماستركلاس القرآن" : "Quran Masterclass"} draggable={false} className={`block w-auto ${className}`} style={{ height: ar ? `calc(${height} * 1.3)` : height }} />;
}

/** a verse card text from the Quran data: with highlighted words (`mark`) or "find the word" taps (`find`) */
export function VerseBlock({ verse, mark, find, full, onFound, label }: { verse: WebVerse; mark?: number[]; find?: boolean; full?: boolean; onFound?: (ok: boolean) => void; label?: string }) {
  const T = useFeedTexts();
  const [tapped, setTapped] = useState<number | null>(null);
  const words = verse.arabic.split(/\s+/).filter(Boolean);
  const solved = tapped !== null && !!mark?.includes(tapped);
  const size = full ? "text-[1.7rem] sm:text-[2rem]" : "text-[1.45rem] sm:text-[1.6rem]";
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
      {find && mark?.length ? (
        <div dir="rtl" lang="ar" className="flex flex-wrap justify-center gap-1">
          {words.map((w, i) => {
            const pos = i + 1;
            const hit = tapped !== null && mark.includes(pos) && (solved || tapped === pos);
            const miss = tapped === pos && !mark.includes(pos);
            return (
              <button key={pos} type="button" disabled={solved} onClick={() => { setTapped(pos); onFound?.(mark.includes(pos)); }}
                className={`rounded-[10px] px-1.5 font-arabic leading-[1.9] text-white transition ${size} ${hit ? "bg-[rgba(58,190,146,0.35)]" : miss ? "bg-[rgba(150,52,52,0.45)]" : "bg-black/20 hover:bg-black/30"}`}>
                {w}
              </button>
            );
          })}
        </div>
      ) : (
        <p dir="rtl" lang="ar" className={`text-center font-arabic leading-[1.9] text-white ${size}`}>
          {mark?.length ? words.map((w, i) => <span key={i} style={mark.includes(i + 1) ? { color: STAGE.gold } : undefined}>{i ? " " : ""}{w}</span>) : verse.arabic}
        </p>
      )}
      {verse.translation && !find ? <p className="line-clamp-5 text-center text-[12.5px] leading-[1.45] text-white/70">{verse.translation}</p> : null}
      <p className="text-center text-[11px] font-semibold tracking-[0.04em]" dir="auto" style={{ color: "rgba(214,180,108,0.9)" }}>
        {label ?? T.feed.verseLabel} {verse.key}{tapped !== null && find ? ` · ${solved ? T.know.right : T.know.wrong}` : ""}
      </p>
    </div>
  );
}

/** an exam-centre question: tap an option, then the explanation */
export function QuizBlock({ card, full }: { card: WebCard; full?: boolean }) {
  const T = useFeedTexts();
  const [pick, setPick] = useState<number | null>(null);
  const q = card.quiz;
  if (!q) return null;
  const done = pick !== null;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5">
      {q.options.map((o, i) => {
        const ok = i === q.answer;
        const bg = done && ok ? "rgba(58,190,146,0.35)" : done && i === pick ? "rgba(150,52,52,0.45)" : "rgba(0,0,0,0.25)";
        return (
          <button key={`${i}-${o}`} type="button" disabled={done} aria-pressed={pick === i}
            onClick={() => { setPick(i); statQuiz(i === q.answer); }}
            className={`min-h-[44px] rounded-[14px] border px-3.5 py-2 text-center font-semibold leading-5 text-white transition hover:enabled:bg-black/35 ${full ? "text-[15.5px]" : "text-[14.5px]"}`}
            style={{ background: bg, borderColor: done && ok ? "rgba(58,190,146,0.7)" : "rgba(255,255,255,0.18)" }}>
            {o}
          </button>
        );
      })}
      {done ? (
        <div role="status" className="mt-1 grid gap-1">
          <p className="text-center text-[14px] font-semibold" style={{ color: STAGE.gold }}>{pick === q.answer ? T.know.right : T.know.wrong}</p>
          {q.explain ? <p className="text-[13.5px] leading-5 text-white/90"><span className="font-semibold">{T.know.explanation}: </span>{q.explain}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export function ctaLabel(T: ReturnType<typeof useFeedTexts>, c: WebCta): string {
  switch (c) {
    case "shams": return T.know.ctaShams;
    case "exam": return T.know.ctaExam;
    case "lesson": return T.know.ctaLesson;
    case "reader": return T.feed.reader;
    case "read": return T.prophet.readMore;
    default: return T.know.ctaCourse;
  }
}

/** the one gold action at the end of a knowledge post */
export function Cta({ card, full }: { card: WebCard; full?: boolean }) {
  const T = useFeedTexts();
  if (!card.href || !card.cta) return null;
  return (
    <Link href={card.href} aria-label={`${ctaLabel(T, card.cta)}: ${card.title}`}
      className={`fd-gold-btn flex items-center justify-center gap-2 rounded-full px-5 font-semibold shadow-sm transition active:scale-[0.98] ${full ? "mt-4 h-[50px] w-full text-[16px]" : "mx-auto mt-3 h-11 w-fit text-[14.5px]"}`}
      style={{ background: `linear-gradient(180deg, ${GOLD_BUTTON.from}, ${GOLD_BUTTON.to})`, color: GOLD_BUTTON.text }}>
      {ctaLabel(T, card.cta)}<AppIcon name="chevronRight" size={15} />
    </Link>
  );
}

/** the source line of a post: name, licence and a link to the original */
export function SourceLine({ card, light, className = "" }: { card: WebCard; light?: boolean; className?: string }) {
  const T = useFeedTexts();
  const text = `${T.feed.sourceLabel}: ${card.source}${card.license ? ` · ${card.license}` : ""}${card.review ? ` · ${T.know.review}` : ""}`;
  const cls = `block px-3.5 pt-2 text-[11.5px] leading-4 ${light ? "text-white/65" : "text-muted"} ${className}`;
  return card.sourceUrl ? <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer" className={`${cls} hover:underline`}>{text}</a> : <p className={cls}>{text}</p>;
}

export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={`fd-skel block ${className}`} style={style} />;
}
export function PostSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[560px] pt-2" aria-hidden>
      <div className="flex items-center gap-2.5 p-3"><Skeleton className="h-9 w-9 rounded-full" /><div className="grid gap-1.5"><Skeleton className="h-[11px] w-[150px] rounded-md" /><Skeleton className="h-[9px] w-[90px] rounded-md" /></div></div>
      <Skeleton className="aspect-square w-full" />
      <div className="grid gap-2 p-3"><Skeleton className="h-[11px] w-[120px] rounded-md" /><Skeleton className="h-[10px] w-[90%] rounded-md" /></div>
    </div>
  );
}
