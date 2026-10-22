"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { QuranInlay } from "@/components/art/QuranArt";
import { useRadio } from "@/components/RadioProvider";
import { reciterName } from "@/lib/quran";
import { markSeen } from "@/lib/feedWeb/client";
import { statPost } from "@/lib/learn/feed/statsStore";
import type { WebCard } from "@/lib/feedWeb/types";
import { fill } from "@/lib/feedWeb/texts";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { CardBody, SERIF } from "./bodies";
import { useFeed } from "./ctx";
import { AppIcon } from "./icons";
import { cardIcon, isKnowledge, kindLabel } from "./kinds";
import { countShare, useVerseLike } from "./likes";
import { HeartBurst, SourceLine, Cta, useTapGestures } from "./parts";
import { StoryPill } from "./HomePosts";
import { STAGE, toneGradient, toneOf, fmtN } from "./tokens";
import { CarouselReelPage, WisdomReelPage } from "@/components/carousel/FeedCards";

// The Reels view: one full-screen page per post on its own slowly moving emerald background, the recitation of the page
// in view playing, and the round action column (heart, save, share, reader). Ports mobile/src/features/feed/FeedPage.tsx,
// StoryPage.tsx (hadith, names), KnowledgePost.tsx `KnowledgePage` and art.tsx `FeedBackdrop`.

/** the feed's background: the post's tone, a soft glow from above, two fine circles, the drifting lattice, beams and the floral inlay */
export function Backdrop({ tone, animate }: { tone: [string, string]; animate: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 isolate overflow-hidden" style={{ background: toneGradient(tone, 160) }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(85% 60% at 50% 0%, rgba(214,180,108,0.16), rgba(214,180,108,0))" }} />
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" fill="none" stroke="rgb(214,180,108)">
        <circle cx="50" cy="46" r="42" strokeOpacity=".12" strokeWidth=".25" /><circle cx="50" cy="46" r="44" strokeOpacity=".06" strokeWidth=".25" />
      </svg>
      <div className="fd-lattice absolute inset-0" style={animate ? undefined : { animation: "none" }} />
      <div className="fd-beam absolute -top-[10%] start-[10%] h-[80%] w-[80%]" style={animate ? undefined : { animation: "none" }}>
        <span className="absolute h-full" style={{ left: "20%", width: "14%", background: "linear-gradient(180deg, rgba(233,207,153,0.13), rgba(233,207,153,0))" }} />
        <span className="absolute" style={{ left: "52%", width: "9%", height: "85%", background: "linear-gradient(180deg, rgba(233,207,153,0.09), rgba(233,207,153,0))" }} />
        <span className="absolute" style={{ left: "72%", width: "6%", height: "70%", background: "linear-gradient(180deg, rgba(233,207,153,0.07), rgba(233,207,153,0))" }} />
      </div>
      <QuranInlay className="!bottom-[6%] !end-[-9%] !start-auto !top-auto !z-0 !w-[min(62vw,520px)] !opacity-90 text-[rgb(214,180,108)]" />
      <QuranInlay className="!start-[-12%] !top-[8%] !end-auto !bottom-auto !z-0 !w-[min(43vw,360px)] rotate-180 !opacity-50 text-[rgb(214,180,108)]" />
      <div className="absolute inset-x-0 bottom-0 h-[35%]" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.45))" }} />
    </div>
  );
}

/** a round action of the side column */
function Action({ icon, label, a11y, onClick, selected, filled, color, disabled, href, pop }: { icon: Parameters<typeof AppIcon>[0]["name"]; label: string; a11y: string; onClick?: () => void; selected?: boolean; filled?: boolean; color?: string; disabled?: boolean; href?: string; pop?: boolean }) {
  const inner = (
    <>
      <span className={`grid h-[46px] w-[46px] place-items-center rounded-full border ${pop ? "fd-pop" : ""}`} style={{ background: "rgba(5,28,21,0.45)", borderColor: "rgba(214,180,108,0.35)", color: color ?? "#fff" }}>
        <AppIcon name={icon} size={22} filled={filled} mirror={false} />
      </span>
      <span className="line-clamp-2 text-center text-[11px] font-semibold leading-[13px] text-white [text-shadow:0_0_3px_rgba(0,0,0,0.5)]">{label}</span>
    </>
  );
  const cls = "flex w-[70px] flex-col items-center gap-1 transition active:opacity-70 disabled:opacity-50";
  return href
    ? <Link href={href} aria-label={a11y} className={cls}>{inner}</Link>
    : <button type="button" onClick={onClick} disabled={disabled} aria-label={a11y} aria-pressed={selected} className={cls}>{inner}</button>;
}

const arSize = (n: number, wide: boolean) => `${Math.round((n < 60 ? 36 : n < 140 ? 31 : n < 280 ? 26 : n < 520 ? 22 : 19) * (wide ? 1.2 : 1))}px`;

function VersePage({ card, active }: { card: WebCard; active: boolean }) {
  const T = useFeedTexts();
  const ws = useTranslations("social");
  const wp = useTranslations("player");
  const locale = useLocale();
  const radio = useRadio();
  const f = useFeed();
  const fr = useRef(f);
  fr.current = f;
  const verse = card.verse!;
  const like = useVerseLike(verse.key, active);
  const [burst, setBurst] = useState(0);
  const [pop, setPop] = useState(0);
  const saved = f.saved(verse.key);
  const reciter = reciterName(radio.reciter, locale);
  const playing = f.player.key === verse.key && f.player.playing;
  const toggle = () => { if (playing) f.pause(); else { f.play(verse.key); } };
  const doLike = () => { if (!like.liked) setPop((n) => n + 1); void like.toggle(); };
  const tap = useTapGestures(toggle, () => { setBurst((n) => n + 1); if (!like.liked) doLike(); });
  const pct = f.player.key === verse.key && f.player.dur > 0 ? Math.min(1, f.player.pos / f.player.dur) : 0;
  const ref = `${verse.chapter} · ${verse.key}`;
  const href = `/surah/${verse.s}?v=${verse.v}`;
  const word = card.kind === "word" ? card.word : undefined;
  const size = arSize(verse.arabic.length, false);

  return (
    <>
      {active ? <div aria-hidden className="pointer-events-none absolute inset-x-3.5 top-[88px] z-10 h-[2.5px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}><div className="h-full" style={{ width: `${pct * 100}%`, background: STAGE.gold }} /></div> : null}
      <div className="relative flex h-full w-full">
        <div className="flex min-w-0 flex-1 flex-col items-center">
          {/* centred with auto margins, not items-center: a long verse with its translation (2:255) then starts below the
              top bar and scrolls, instead of overflowing upwards under the chips where it can never be scrolled to */}
          <div className="flex min-h-0 w-full max-w-[680px] flex-1 overflow-y-auto ps-[22px] pe-3 pb-2 pt-[110px]">
            <button type="button" onClick={tap} className="my-auto block w-full text-start" aria-label={`${ref}. ${verse.translation}`}>
              <h2 className="mb-[18px] text-[12px] font-semibold uppercase tracking-[0.16em] rtl:tracking-normal" style={{ color: STAGE.gold }}>{word ? `${T.feed.wordTitle} · ${ref}` : ref}</h2>
              {word ? (
                <div className="mb-[26px]">
                  <p dir="rtl" lang="ar" className="font-arabic text-[62px] leading-[1.7] md:text-[76px]" style={{ color: "rgb(233,207,153)" }}>{word.ar}</p>
                  {word.tl ? <p className="mt-0.5 text-[17px] italic" style={{ color: STAGE.textSoft }}>{word.tl}</p> : null}
                  <p className="font-display mt-2 text-[26px] leading-[31px] text-white md:text-[30px] md:leading-9">{word.tr}</p>
                </div>
              ) : null}
              <p dir="rtl" lang="ar" className="font-arabic text-end leading-[1.9] text-white" style={{ fontSize: word ? "22px" : size, color: word ? "rgba(255,255,255,0.85)" : "#fff" }}>
                {word ? verse.arabic.split(/\s+/).map((w, i) => <span key={i} style={i + 1 === word.pos ? { color: "rgb(233,207,153)" } : undefined}>{i ? " " : ""}{w}</span>) : verse.arabic}
              </p>
              {verse.translation ? <p dir="auto" className={`mt-5 text-white/90 ${verse.translation.length > 400 || word ? "text-[15px] leading-[23px]" : "text-[17px] leading-[26px] md:text-[19px] md:leading-[29px]"}`}>{verse.translation}</p> : null}
            </button>
          </div>
          <p className="w-full truncate px-[22px] pb-1 pt-2.5 text-[12.5px]" style={{ color: STAGE.textMuted }}>{fill(T.feed.reciter, { name: reciter })}</p>
          <HeartBurst n={burst} />
        </div>
        <div className="flex w-[72px] shrink-0 flex-col items-center justify-end gap-4 pb-8 pe-1.5">
          <Action icon="heart" filled={like.liked} color={like.liked ? "#b8913f" : "#fff"} label={like.count !== null ? new Intl.NumberFormat(locale, { notation: "compact", numberingSystem: "latn" }).format(like.count) : ws("like")} a11y={`${ws("like")}${like.count !== null ? `, ${fmtN(like.count, locale)}` : ""}`} selected={like.liked} onClick={doLike} pop={pop > 0} />
          <Action icon="bookmark" filled={saved} color={saved ? STAGE.gold : "#fff"} label={saved ? T.feed.saved : T.feed.save} a11y={saved ? wp("bookmarked") : wp("bookmark")} selected={saved} onClick={() => f.toggleSave(verse.key)} />
          <Action icon="send" label={ws("share")} a11y={ws("share")} onClick={() => { countShare(verse.key); f.shareVerse(verse); }} />
          <Action icon="book" label={T.feed.reader} a11y={T.feed.reader} href={href} />
          <Action icon="cap" label={T.feed.learn} a11y={T.feed.learn} href={href} />
        </div>
      </div>
    </>
  );
}

/** names, hadith, tafsir, courses, quizzes …: the card on the stage with the side column */
function CardPage({ card }: { card: WebCard }) {
  const T = useFeedTexts();
  const f = useFeed();
  const know = isKnowledge(card);
  return (
    <div className="relative flex h-full w-full">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-[600px] flex-col justify-center px-[18px] pb-6 pt-[104px]">
          {know ? (
            <>
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border" style={{ background: toneGradient(toneOf(`lib:${card.kind}`), 150), borderColor: STAGE.goldSoft, color: "rgb(233,207,153)" }}><AppIcon name={cardIcon(card)} size={17} /></span>
                <div className="min-w-0"><p className="truncate text-[14px] font-semibold text-white">{kindLabel(T, card)}</p>{card.eyebrow ? <p className="truncate text-[12px] text-white/65">{card.eyebrow}</p> : null}</div>
              </div>
              <div className="relative mt-1.5 overflow-hidden rounded-[12px] border p-[22px]" style={{ borderColor: STAGE.goldSoft, background: "rgba(0,0,0,0.18)" }}>
                <CardBody card={card} full />
              </div>
              <Cta card={card} full />
            </>
          ) : (
            <>
              <p className="mb-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] rtl:tracking-normal" style={{ color: STAGE.gold }}>{kindLabel(T, card)}{card.eyebrow ? ` · ${card.eyebrow}` : ""}</p>
              {card.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.image.url} alt={card.title} loading="lazy" className="mb-3.5 max-h-[34vh] w-full rounded-[12px] object-cover" />
              ) : null}
              {card.arabic ? <p dir="rtl" lang="ar" className="mb-4 text-end font-arabic text-[25px] leading-[1.9] text-white md:text-[30px]">{card.arabic}</p> : null}
              <h2 dir="auto" className="mb-3 text-[19px] font-semibold leading-[1.3]" style={{ fontFamily: SERIF, color: STAGE.cream }}>{card.title}</h2>
              {card.body ? <p dir="auto" className="whitespace-pre-line text-[17px] leading-[27px] text-white/90 md:text-[20px] md:leading-[31px]">{card.body}</p> : null}
            </>
          )}
          <SourceLine card={card} light className="!px-0" />
        </div>
      </div>
      <div className="flex w-[72px] shrink-0 flex-col items-center justify-end gap-4 pb-8 pe-1.5">
        <Action icon="send" label={T.prophet.share} a11y={T.prophet.share} onClick={() => f.shareCard(card)} />
        {card.href ? <Action icon="book" label={T.prophet.readMore} a11y={T.prophet.readMore} href={card.href} /> : null}
      </div>
    </div>
  );
}

export const ReelPage = memo(function ReelPage({ card, active, near }: { card: WebCard; active: boolean; near: boolean }) {
  const f = useFeed();
  const fr = useRef(f);
  fr.current = f;
  useEffect(() => {
    if (!active) return;
    markSeen(card.id);
    statPost(card.kind, card.id);
  }, [active, card.id, card.kind]);
  // a page that is not a verse has no recitation of its own
  useEffect(() => { if (active && !(card.kind === "verse" || card.kind === "word") && fr.current.player.playing) fr.current.pause(); }, [active, card.kind]);
  const tone = toneOf(card.verse?.key ?? card.id);
  return (
    <section className="relative h-full w-full overflow-hidden" aria-label={card.title}>
      {near ? <Backdrop tone={tone} animate={active} /> : <div aria-hidden className="absolute inset-0" style={{ background: toneGradient(tone, 160) }} />}
      {near ? ((card.kind === "verse" || card.kind === "word") && card.verse ? <VersePage card={card} active={active} />
        : card.kind === "carousel" && card.carousel ? <CarouselReelPage id={card.id} c={card.carousel} active={active} />
        : card.kind === "wisdom" && card.wisdom ? <WisdomReelPage id={card.id} w={card.wisdom} active={active} />
        : <CardPage card={card} />) : null}
    </section>
  );
});

/** the vertical, snapping list of pages; `onEnd` loads more near the end, `autoplay` moves on when a recitation ends */
export function ReelList({ cards, onEnd, topbar, startId, visible = true }: { cards: WebCard[]; onEnd: () => void; topbar: React.ReactNode; startId?: string; visible?: boolean }) {
  const f = useFeed();
  const T = useFeedTexts();
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const activeRef = useRef(0);
  activeRef.current = active;
  const touched = useRef(false);
  const fr = useRef(f);
  fr.current = f;

  const go = useCallback((i: number) => {
    // scroll the list itself (scrollIntoView would also move the page)
    const root = box.current, el = root?.children[i] as HTMLElement | undefined;
    if (root && el) root.scrollTo({ top: el.offsetTop, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, []);

  // which page is in view
  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { const i = Array.prototype.indexOf.call(root.children, e.target); if (i >= 0) { setActive(i); touched.current = false; } }
    }, { root, threshold: [0.6] });
    Array.from(root.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [cards.length]);

  // near the end: more
  useEffect(() => { if (cards.length && active >= cards.length - 4) onEnd(); }, [active, cards.length, onEnd]);

  // opened from Explore: that page first
  useEffect(() => { if (startId) go(0); }, [startId, go]);

  // the recitation of the page in view plays (a verse), and the feed moves on by itself when it ends (like Reels)
  const card = cards[active];
  useEffect(() => {
    if (!card || !visible) return;
    const isVerse = (card.kind === "verse" || card.kind === "word") && card.verse;
    if (isVerse) {
      if (fr.current.mutedReels) return;
      fr.current.play(card.verse!.key, () => { if (autoplay && !touched.current) go(activeRef.current + 1); });
      return () => { fr.current.stop(); };
    }
    return undefined;
  }, [card?.id, card?.kind, autoplay, go, visible]); // eslint-disable-line react-hooks/exhaustive-deps
  // muted verses and name cards stay a little while, then move on
  useEffect(() => {
    if (!card || !autoplay || !visible) return;
    const isVerse = (card.kind === "verse" || card.kind === "word") && card.verse;
    const ms = isVerse ? (f.mutedReels ? 10000 : 0) : card.kind === "name" ? 8000 : 0;
    if (!ms) return;
    const id = window.setTimeout(() => { if (!touched.current) go(activeRef.current + 1); }, ms);
    return () => window.clearTimeout(id);
  }, [card?.id, card?.kind, autoplay, f.mutedReels, go, visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative h-full w-full" onPointerDown={() => { touched.current = true; }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 px-3 pt-3">
        <div className="pointer-events-auto flex items-center gap-2.5">
          <div className="min-w-0 flex-1">{topbar}</div>
          <button type="button" onClick={() => setAutoplay((a) => !a)} aria-label={T.feed.autoplay} aria-pressed={autoplay} className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border" style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(255,255,255,0.14)", color: autoplay ? STAGE.gold : "rgba(255,255,255,0.6)" }}><AppIcon name="repeat" size={20} /></button>
          <button type="button" onClick={() => f.toggleMuteReels()} aria-label={f.mutedReels ? T.feed.unmute : T.feed.mute} aria-pressed={!f.mutedReels} className="relative grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border text-white" style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(255,255,255,0.14)" }}>
            <AppIcon name="speaker" size={20} />{f.mutedReels ? <span aria-hidden className="absolute h-[1.8px] w-6 -rotate-45 bg-white" /> : null}
          </button>
        </div>
      </div>
      <div ref={box} className="fd-reels h-full w-full overflow-y-auto" tabIndex={0} aria-label={T.feed.reels} aria-roledescription="carousel">
        {cards.map((c, i) => (
          <div key={c.id} className="fd-reel h-full w-full"><ReelPage card={c} active={i === active} near={Math.abs(i - active) <= 2} /></div>
        ))}
      </div>
    </div>
  );
}
