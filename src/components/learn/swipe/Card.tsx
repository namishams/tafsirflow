"use client";
// One learning card of Swipe & Learn on the website; mirrors mobile/src/features/swipe/Card.tsx. Drawn like the share
// templates: a girih ground in night or emerald, a double gold frame with an arched top, the kicker over an ornamental
// rule, Arabic in Amiri, titles in Fraunces, the source in gold. Quran text only from the Quran data (verse keys, or the
// corpus card resolved on the server), hadith only from their sources. Cards with a back side turn on a click or Enter.
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import { memo, type CSSProperties, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useLang } from "@/lib/learn/i18n";
import { meaning } from "@/lib/vocabI18n";
import { useVerseData } from "@/lib/learn/srs/verseHooks";
import { useCardFace } from "@/components/learn/srs/CardFace";
import { sijillText } from "@/lib/sijillWeb";
import { momentLine } from "@/lib/sijillMoment";
import { useSwipeT, type SwipeKey } from "@/lib/learn/swipe/texts";
import type { SCard } from "./deck";

const SERIF = "'Fraunces Variable', Georgia, serif";
const CALLIG = "'Aref Ruqaa', 'Amiri', serif";
export const KIND_KEY: Record<SCard["kind"], SwipeKey> = {
  srs: "k_srs", word: "k_word", verse: "k_verse", tajweed: "k_tajweed", name: "k_name", quiz: "k_quiz", course: "k_course", maqasid: "k_maqasid",
  grammar: "k_grammar", hadith: "k_hadith", tafsir: "k_tafsir", dua: "k_dua", insight: "k_insight", moment: "k_moment",
};
export const hasBack = (c: SCard) => c.kind === "srs" || c.kind === "word" || c.kind === "name" || c.kind === "grammar";

type Pal = { id: "night" | "emerald"; bg: string; line: string; arabic: string; ink: string; soft: string; muted: string; accent: string };
const NIGHT: Pal = { id: "night", bg: "linear-gradient(170deg,#0B2B21,#05170F 55%,#020906)", line: "#D6B46C", arabic: "#FBF1D6", ink: "#FFFFFF", soft: "rgba(243,226,182,0.9)", muted: "rgba(243,226,182,0.62)", accent: "#E2C27F" };
const EMERALD: Pal = { id: "emerald", bg: "linear-gradient(170deg,#13704F,#0A4A37 55%,#05281E)", line: "#E4C682", arabic: "#FFFFFF", ink: "#FFFFFF", soft: "rgba(246,236,210,0.92)", muted: "rgba(246,236,210,0.66)", accent: "#EED49A" };
const hash = (s: string) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
/** night or emerald, stable per card (features/share/formats.ts darkPaletteFor) */
export const palOf = (id: string): Pal => (hash(id) % 2 ? NIGHT : EMERALD);
// the girih lattice of the share templates as a tile
const GIRIH = (line: string) => {
  const c = 22, r = 12, a = r * Math.SQRT1_2;
  const d = `M${c} ${c - r}L${c + r} ${c}L${c} ${c + r}L${c - r} ${c}ZM${c - a} ${c - a}L${c + a} ${c - a}L${c + a} ${c + a}L${c - a} ${c + a}Z`;
  const l = `M${c} 0V${c - r}M${c} ${c + r}V44M0 ${c}H${c - r}M${c + r} ${c}H44M0 0L${c - a} ${c - a}M44 0L${c + a} ${c - a}M0 44L${c - a} ${c + a}M44 44L${c + a} ${c + a}`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><g fill='none' stroke='${line}' stroke-width='0.7'><path d='${d}' stroke-opacity='0.1'/><path d='${l}' stroke-opacity='0.06'/></g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const clean = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\*\*|__/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
const arLen = (s: string) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ\s]/g, "").length;
const arSize = (s: string, max: number, min = 20) => Math.max(min, Math.min(max, Math.round(max - Math.max(0, arLen(s) - 12) * 0.32)));

export type MashaView = "open" | "already" | "dayFull" | "sent" | "profile" | "error";
export type CardProps = { card: SCard; flipped: boolean; onFlip: () => void; answer: number | null; onAnswer: (i: number) => void; masha?: MashaView; hidden?: boolean };

export const LearnCard = memo(function LearnCard(props: CardProps) {
  const { card } = props;
  const st = useSwipeT();
  const p = palOf(card.id);
  const kicker = card.kind === "srs" ? st("k_srs") : card.web?.eyebrow ? card.web.eyebrow : st(KIND_KEY[card.kind]);
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[22px] text-white shadow-[0_18px_44px_-18px_rgba(0,0,0,0.6)]" style={{ background: p.bg }}>
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: GIRIH(p.line), backgroundSize: "44px 44px" }} />
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(233,207,153,0.18), transparent 55%)" }} />
      <Frame p={p} />
      <div className="relative flex h-full flex-col px-6 pb-5 pt-[60px] sm:px-8">
        <div className="mb-3 grid justify-items-center gap-2">
          <p className="line-clamp-2 text-center text-[12px] font-semibold leading-4 tracking-[0.05em] rtl:tracking-normal" style={{ color: p.accent }}>{kicker}</p>
          <Rule p={p} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain py-1 [scrollbar-width:none]">
          <div className="my-auto">
            <Body {...props} p={p} />
          </div>
        </div>
      </div>
    </div>
  );
});

function Frame({ p }: { p: Pal }) {
  const lz = (pos: CSSProperties) => <span className="absolute h-[7px] w-[7px] rotate-45" style={{ background: p.line, ...pos }} />;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <span className="absolute inset-[9px] border" style={{ borderColor: `${p.line}D9` }} />
      <span className="absolute inset-[14px] border" style={{ borderColor: `${p.line}66`, borderTopLeftRadius: "50% 44px", borderTopRightRadius: "50% 44px" }} />
      <span className="absolute inset-x-0 top-[10px] mx-auto h-[8px] w-[8px] rotate-45" style={{ background: p.line }} />
      {lz({ left: 6, top: 6 })}{lz({ right: 6, top: 6 })}{lz({ left: 6, bottom: 6 })}{lz({ right: 6, bottom: 6 })}
    </span>
  );
}
function Rule({ p, w = 116 }: { p: Pal; w?: number }) {
  return (
    <span aria-hidden className="relative flex h-[9px] items-center justify-center" style={{ width: w }}>
      <span className="absolute inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${p.line}, transparent)` }} />
      <span className="h-[7px] w-[7px] rotate-45 border" style={{ borderColor: p.line, background: "rgba(0,0,0,0.25)" }} />
    </span>
  );
}

function Body(props: CardProps & { p: Pal }) {
  switch (props.card.kind) {
    case "srs": return <SrsBody {...props} />;
    case "word": return <WordBody {...props} />;
    case "verse": return <VerseBody {...props} />;
    case "moment": return <MomentBody {...props} />;
    case "quiz": return <QuizBody {...props} />;
    case "name": return <NameBody {...props} />;
    case "grammar": return <GrammarBody {...props} />;
    case "tajweed": return <BiteBody {...props} />;
    default: return <WebBody {...props} />;
  }
}

// ---------- building blocks ----------
const Ar = ({ p, children, size, callig }: { p: Pal; children: string; size: number; callig?: boolean }) => (
  <p lang="ar" dir="rtl" className="text-center" style={{ fontFamily: callig ? CALLIG : "Amiri, serif", fontSize: size, lineHeight: callig ? 1.6 : 1.85, color: p.arabic }}>{children}</p>
);
const Title = ({ p, children, size = 22 }: { p: Pal; children: string; size?: number }) => (
  <h2 className="text-center font-semibold" style={{ fontFamily: SERIF, fontSize: size, lineHeight: 1.28, letterSpacing: "-0.01em", color: p.ink }}>{children}</h2>
);
const Para = ({ p, children, quote, size = 16 }: { p: Pal; children: string; quote?: boolean; size?: number }) => (
  <p className="whitespace-pre-line text-center" style={{ fontFamily: quote ? SERIF : undefined, fontStyle: quote ? "italic" : undefined, fontSize: size, lineHeight: 1.5, color: p.soft }}>
    {quote ? <span style={{ color: p.accent, fontStyle: "normal" }}>“</span> : null}{children}{quote ? <span style={{ color: p.accent, fontStyle: "normal" }}>”</span> : null}
  </p>
);
const Source = ({ p, children }: { p: Pal; children: string }) => (
  <p className="mt-1.5 line-clamp-3 text-center text-[11.5px] font-semibold leading-4 tracking-[0.03em]" style={{ color: p.accent }}>{children}</p>
);
const Note = ({ p, children }: { p: Pal; children: string }) => <p className="text-center text-[12px] leading-[17px]" style={{ color: p.muted }}>{children}</p>;
const Hint = ({ p, children }: { p: Pal; children: string }) => <p className="mt-2 text-center text-[12px] font-medium" style={{ color: p.muted }}>{children}</p>;
const Stack = ({ children, className = "" }: { children: ReactNode; className?: string }) => <div className={`grid justify-items-center gap-2.5 ${className}`}>{children}</div>;
function Bullets({ p, items }: { p: Pal; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="grid w-full gap-1.5">
      {items.map((b, i) => (
        <li key={i} className="flex items-start gap-2 text-start text-[14.5px] leading-[21px]" style={{ color: p.soft }}>
          <span aria-hidden className="mt-2 h-[5px] w-[5px] shrink-0 rotate-45" style={{ background: p.line }} />{clean(b)}
        </li>
      ))}
    </ul>
  );
}
function More({ p, href }: { p: Pal; href?: string }) {
  const st = useSwipeT();
  if (!href) return null;
  return (
    <Link href={href} data-swipe-ignore className="mt-2 inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition hover:bg-white/10" style={{ borderColor: p.line, color: p.ink }}>
      {st("learnMore")}<span aria-hidden style={{ color: p.line }}>›</span>
    </Link>
  );
}
function Flip({ flipped, onFlip, front, back, label }: { flipped: boolean; onFlip: () => void; front: ReactNode; back: ReactNode; label: string }) {
  return (
    <button type="button" onClick={onFlip} aria-expanded={flipped} aria-label={label} data-swipe-flip className="block w-full cursor-pointer rounded-xl text-inherit focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgb(214,180,108)]">
      <span className="sr-only">{label}</span>
      {flipped ? back : front}
    </button>
  );
}

/** a verse from the Quran data (by key) with optional highlighted word positions */
function VerseText({ p, verseKey, highlight, size = 30, translation = true }: { p: Pal; verseKey: string; highlight?: number[]; size?: number; translation?: boolean }) {
  const { lang } = useLang();
  const st = useSwipeT();
  const v = useVerseData(verseKey, lang);
  if (!v?.data) return v?.error ? <Note p={p}>{st("offline")}</Note> : <span aria-hidden className="my-3 block h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: p.line, borderTopColor: "transparent" }} />;
  const words = v.data.words;
  const text = words.map((x) => x.text).join(" ");
  const hi = new Set(highlight ?? []);
  return (
    <Stack>
      <p lang="ar" dir="rtl" className="text-center" style={{ fontFamily: "Amiri, serif", fontSize: arSize(text, size, 19), lineHeight: 1.85, color: p.arabic }}>
        {words.map((x, i) => <span key={x.position} style={hi.has(x.position) ? { color: p.accent, textDecoration: "underline", textUnderlineOffset: 8 } : undefined}>{i ? " " : ""}{x.text}</span>)}
      </p>
      {translation && v.data.translation ? <><Rule p={p} w={60} /><Para p={p} quote size={15.5}>{clean(v.data.translation)}</Para></> : null}
      <Source p={p}>{st("verseRef", { key: verseKey })}</Source>
    </Stack>
  );
}

// ---------- the kinds ----------
function SrsBody({ card, p, flipped, onFlip }: CardProps & { p: Pal }) {
  const st = useSwipeT();
  const face = useCardFace(card.srs ?? "", 1);
  return (
    <Flip flipped={flipped} onFlip={onFlip} label={st("a11yFlip")}
      front={<Stack>{face.front}<Hint p={p}>{st("tapFlip")}</Hint></Stack>}
      back={<div className="hm-card grid justify-items-center gap-1.5 rounded-xl bg-surface p-5 text-ink">{face.back}</div>} />
  );
}

function WordBody({ card, p, flipped, onFlip }: CardProps & { p: Pal }) {
  const st = useSwipeT();
  const { lang } = useLang();
  const w = card.word!;
  return (
    <Flip flipped={flipped} onFlip={onFlip} label={st("a11yFlip")}
      front={<Stack><Ar p={p} size={64}>{w.ar}</Ar>{lang !== "ar" ? <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: p.soft }}>{w.tr}</p> : null}<Hint p={p}>{st("tapFlip")}</Hint></Stack>}
      back={(
        <Stack>
          <Ar p={p} size={40}>{w.ar}</Ar>
          <Title p={p} size={26}>{meaning(w, lang)}</Title>
          {w.root ? <p className="text-[13px]" style={{ color: p.muted }}>{st("root")} <span lang="ar" dir="rtl" style={{ fontFamily: "Amiri, serif", fontSize: 17, color: p.soft }}>{w.root}</span></p> : null}
          {w.ex ? <div className="mt-1.5 w-full"><VerseText p={p} verseKey={w.ex.key} size={22} translation={false} /></div> : null}
          <Note p={p}>{st("newWord")}</Note>
        </Stack>
      )} />
  );
}

function VerseBody({ card, p }: CardProps & { p: Pal }) {
  const st = useSwipeT();
  const v = card.web?.verse;
  // a corpus verse comes resolved from the server; a local one is loaded from the Quran data
  if (!v) return <VerseText p={p} verseKey={card.verse!} size={34} />;
  return (
    <Stack>
      <p lang="ar" dir="rtl" className="text-center" style={{ fontFamily: "Amiri, serif", fontSize: arSize(v.arabic, 34, 19), lineHeight: 1.85, color: p.arabic }}>{v.arabic}</p>
      {v.translation ? <><Rule p={p} w={60} /><Para p={p} quote size={15.5}>{clean(v.translation)}</Para></> : null}
      <Source p={p}>{`${v.chapter ? `${v.chapter} · ` : ""}${st("verseRef", { key: v.key })}`}</Source>
    </Stack>
  );
}

function NameBody({ card, p, flipped, onFlip }: CardProps & { p: Pal }) {
  const st = useSwipeT();
  const c = card.web!;
  return (
    <Flip flipped={flipped} onFlip={onFlip} label={st("a11yFlip")}
      front={<Stack>{c.arabic ? <Ar p={p} size={58} callig>{c.arabic}</Ar> : null}<Title p={p} size={24}>{clean(c.title)}</Title><Hint p={p}>{st("tapFlip")}</Hint></Stack>}
      back={(
        <Stack>
          {c.arabic ? <Ar p={p} size={34} callig>{c.arabic}</Ar> : null}
          <Title p={p} size={22}>{clean(c.title)}</Title>
          {c.body ? <Para p={p} size={17}>{clean(c.body)}</Para> : null}
          {c.verse ? <VerseInline p={p} c={c.verse} /> : null}
          <Source p={p}>{c.source}</Source>
          <More p={p} href={c.href} />
        </Stack>
      )} />
  );
}
function VerseInline({ p, c, mark }: { p: Pal; c: NonNullable<SCard["web"]>["verse"]; mark?: number[] }) {
  const st = useSwipeT();
  if (!c) return null;
  const words = c.arabic.split(/\s+/).filter(Boolean);
  const hi = new Set(mark ?? []);
  return (
    <Stack className="mt-1 w-full">
      <p lang="ar" dir="rtl" className="text-center" style={{ fontFamily: "Amiri, serif", fontSize: arSize(c.arabic, 24, 18), lineHeight: 1.85, color: p.arabic }}>
        {words.map((w, i) => <span key={i} style={hi.has(i + 1) ? { color: p.accent, textDecoration: "underline", textUnderlineOffset: 8 } : undefined}>{i ? " " : ""}{w}</span>)}
      </p>
      <Source p={p}>{st("verseRef", { key: c.key })}</Source>
    </Stack>
  );
}

function GrammarBody({ card, p, flipped, onFlip }: CardProps & { p: Pal }) {
  const st = useSwipeT();
  const b = card.bite!;
  return (
    <Flip flipped={flipped} onFlip={onFlip} label={st("a11yFlip")}
      front={<Stack><Title p={p} size={21}>{b.title}</Title><VerseText p={p} verseKey={b.verse} highlight={b.words} size={26} translation={false} />{b.ask ? <Para p={p} size={15.5}>{b.ask}</Para> : null}<Hint p={p}>{st("tapFlip")}</Hint></Stack>}
      back={<Stack><Title p={p} size={21}>{b.title}</Title><Para p={p} size={15.5}>{b.body}</Para><Source p={p}>{b.source}</Source><More p={p} href={b.href} /></Stack>} />
  );
}

function BiteBody({ card, p }: CardProps & { p: Pal }) {
  const st = useSwipeT();
  const b = card.bite!;
  return (
    <Stack>
      {b.arabic ? <Ar p={p} size={arSize(b.arabic, 40, 20)}>{b.arabic}</Ar> : null}
      <Title p={p} size={b.title.length > 70 ? 18 : 22}>{b.title}</Title>
      {b.body ? <Para p={p} size={15.5}>{b.body}</Para> : null}
      <Bullets p={p} items={b.note ? [b.note] : undefined} />
      <Source p={p}>{st("verseRef", { key: b.verse })}</Source>
      <Source p={p}>{b.source}</Source>
      <More p={p} href={b.href} />
    </Stack>
  );
}

function QuizBody({ card, p, answer, onAnswer }: CardProps & { p: Pal }) {
  const st = useSwipeT();
  const c = card.web!;
  const q = c.quiz!;
  const shown = answer !== null;
  return (
    <div className="grid gap-2.5">
      <Title p={p} size={clean(c.title).length > 120 ? 17 : 20}>{clean(c.title)}</Title>
      {c.verse ? <VerseInline p={p} c={c.verse} mark={c.words} /> : null}
      <div className="mt-1 grid gap-2">
        {q.options.map((o, i) => {
          const right = i === q.answer, chosen = answer === i;
          return (
            <button key={`${i}-${o}`} type="button" disabled={shown} aria-pressed={chosen} onClick={() => onAnswer(i)} data-swipe-ignore
              className="min-h-[46px] rounded-[10px] border px-3.5 py-2 text-start text-[15px] leading-[21px] transition enabled:hover:bg-white/10"
              style={{ borderColor: shown && right ? p.accent : shown && chosen ? "rgba(214,120,110,0.9)" : "rgba(214,180,108,0.35)", background: shown && right ? "rgba(214,180,108,0.16)" : "rgba(255,255,255,0.04)", color: p.ink, fontWeight: shown && right ? 700 : 500 }}>
              {o}{shown && right ? <span className="sr-only">, {st("correct")}</span> : null}
            </button>
          );
        })}
      </div>
      {shown ? (
        <div role="status" className="mt-1 grid gap-1.5">
          <p className="text-center text-[15px] font-bold" style={{ color: answer === q.answer ? p.accent : p.soft }}>{answer === q.answer ? st("correct") : st("notQuite")}</p>
          {q.explain ? <Para p={p} size={14.5}>{clean(q.explain)}</Para> : null}
        </div>
      ) : (
        <button type="button" onClick={() => onAnswer(-1)} data-swipe-ignore className="mx-auto py-1.5 text-[13px] font-semibold underline" style={{ color: p.muted }}>{st("showAnswer")}</button>
      )}
      {c.review ? <Note p={p}>{st("reviewNote")}</Note> : null}
      <Source p={p}>{c.source}</Source>
    </div>
  );
}

function WebBody({ card, p }: CardProps & { p: Pal }) {
  const st = useSwipeT();
  const c = card.web;
  if (!c) return null;
  const body = clean(c.body ?? "");
  const quote = card.kind === "dua" || card.kind === "hadith";
  const ar = c.arabic ? clean(c.arabic) : c.word?.ar ?? "";
  return (
    <Stack>
      {ar ? <Ar p={p} size={arSize(ar, card.kind === "insight" ? 44 : 26, 17)}>{ar}</Ar> : null}
      {ar && body && card.kind === "hadith" ? <Rule p={p} w={60} /> : null}
      {c.title && card.kind !== "hadith" ? <Title p={p} size={c.title.length > 70 ? 18 : 22}>{clean(c.title)}</Title> : null}
      {body ? <Para p={p} quote={quote} size={body.length > 600 ? 14 : body.length > 300 ? 15 : 16}>{body}</Para> : null}
      <Bullets p={p} items={c.bullets} />
      {c.verse && card.kind !== "hadith" && card.kind !== "dua" ? <VerseInline p={p} c={c.verse} mark={c.words} /> : null}
      {c.note ? <Note p={p}>{clean(c.note)}</Note> : null}
      {c.review ? <Note p={p}>{st("reviewNote")}</Note> : null}
      <Source p={p}>{`${c.source}${c.license ? ` · ${c.license}` : ""}`}</Source>
      <More p={p} href={c.href} />
    </Stack>
  );
}

function MomentBody({ card, p, masha }: CardProps & { p: Pal }) {
  const st = useSwipeT();
  const { lang } = useLang();
  const m = card.moment!;
  const state = masha ?? "open";
  const msg = state === "sent" ? st("mashaSent") : state === "already" || state === "dayFull" ? st("mashaAlready") : state === "profile" ? st("mashaProfile") : state === "error" ? st("mashaError") : st("mashaHint");
  const initials = m.author.name.split(/\s+/).map((x) => x[0] ?? "").join("").slice(0, 2).toUpperCase();
  return (
    <Stack className="gap-3">
      <Link href={`/talents/${m.author.username}`} data-swipe-ignore className="grid justify-items-center gap-2">
        <span className="grid h-[76px] w-[76px] place-items-center rounded-full p-[2px]" style={{ background: "linear-gradient(135deg,#f3e2b6,#c6a65e 55%,#8a6a2c)" }}>
          {m.author.avatar
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={m.author.avatar} alt="" className="h-full w-full rounded-full object-cover" />
            : <span className="grid h-full w-full place-items-center rounded-full bg-[rgb(8,38,29)] text-[22px] font-bold" style={{ fontFamily: CALLIG, color: p.accent }}>{initials}</span>}
        </span>
        <span className="text-[21px] font-semibold" style={{ fontFamily: SERIF, color: p.ink }}>{m.author.name}</span>
        <span className="text-[12.5px]" style={{ color: p.muted }}>@{m.author.username} · {m.follow ? st("following") : st("community")}</span>
      </Link>
      <span aria-hidden className="grid h-[58px] w-[58px] place-items-center rounded-full border-2" style={{ borderColor: p.line, color: p.line }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></svg>
      </span>
      <Title p={p} size={21}>{momentLine(m, sijillText(lang))}</Title>
      <p role="status" className="mt-1.5 rounded-full border px-4 py-2 text-center text-[13.5px] font-semibold" style={{ borderColor: p.line, color: p.ink, background: state === "sent" || state === "already" ? "rgba(214,180,108,0.16)" : "transparent" }}>{msg}</p>
    </Stack>
  );
}
