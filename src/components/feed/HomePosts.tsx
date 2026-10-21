"use client";
import { memo, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useRadio } from "@/components/RadioProvider";
import { reciterName } from "@/lib/quran";
import { markSeen } from "@/lib/feedWeb/client";
import { statPost } from "@/lib/learn/feed/statsStore";
import type { WebCard } from "@/lib/feedWeb/types";
import { fill } from "@/lib/feedWeb/texts";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { PALETTES, paletteFor } from "@/lib/share/formats";
import { LAYOUT, ornamentRuleInner } from "@/lib/share/svg";
import { PostPanel, ShareArt } from "@/components/share/ShareArt";
import { CardBody, CardImage, SERIF } from "./bodies";
import { useFeed } from "./ctx";
import { AppIcon } from "./icons";
import { cardIcon, isKnowledge, kindLabel } from "./kinds";
import { useVerseLike, countShare } from "./likes";
import { Cta, HeartBurst, IconBtn, RingAvatar, Rule, SourceLine, Wm, u, useFit, useTapGestures } from "./parts";
import { STAGE, fmtN, toArDigits } from "./tokens";
import { CarouselFeedCard, WisdomFeedCard } from "@/components/carousel/FeedCards";

// The posts of the Home list, ported from mobile/src/features/feed/HomeFeed.tsx (Post: verses), LibraryPost.tsx and
// KnowledgePost.tsx: a header with the gold ring, the card (a square in the share design for verses, a framed emerald
// panel for everything else), the action row, the caption and the source.

/** report when this post is the one in view (at least 60 % visible) */
function useInView(card: WebCard, onActive: (id: string) => void) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0]?.isIntersecting) onActive(card.id); }, { threshold: [0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, [card.id, onActive]);
  return ref;
}

/** seen window, statistics: once when a post becomes the visible one */
function useSeen(card: WebCard, active: boolean) {
  useEffect(() => {
    if (!active) return;
    markSeen(card.id);
    statPost(card.kind, card.id);
  }, [active, card.id, card.kind]);
}

export function StoryGlyph({ size = 15 }: { size?: number }) {
  return (
    <span aria-hidden className="relative grid place-items-center rounded-[2.5px] border-[1.5px] border-current" style={{ width: size * 0.66, height: size }}>
      <span className="absolute bg-current" style={{ width: size * 0.34, height: 1.5 }} />
      <span className="absolute bg-current" style={{ width: 1.5, height: size * 0.34 }} />
    </span>
  );
}

/** the gold "Story" pill: the post as a story image in one tap */
export function StoryPill({ onClick, disabled, dark }: { onClick: () => void; disabled?: boolean; dark?: boolean }) {
  const T = useFeedTexts();
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={T.tpl.shareStory}
      className={`inline-flex h-[34px] items-center gap-[7px] rounded-full border px-[13px] text-[13px] font-semibold transition active:opacity-70 disabled:opacity-40 ${dark ? "text-[#f3e2b6]" : "text-ink"}`}
      style={{ borderColor: dark ? STAGE.gold : "rgb(var(--gold))", background: dark ? "rgba(214,180,108,0.14)" : "rgb(var(--gold) / 0.1)" }}>
      <span style={{ color: dark ? STAGE.gold : "rgb(var(--gold))" }}><StoryGlyph /></span>{T.tpl.story}
    </button>
  );
}

/** the "…" menu of a post */
function PostMenu({ items, label }: { items: { label: string; icon: Parameters<typeof AppIcon>[0]["name"]; href?: string; onClick?: () => void }[]; label: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  if (!items.length) return null;
  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={label} aria-expanded={open} aria-haspopup="menu" className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-accent-soft/60">
        <span className="flex gap-[3.5px]">{[0, 1, 2].map((i) => <span key={i} className="h-1 w-1 rounded-full bg-ink" />)}</span>
      </button>
      {open ? (
        <div role="menu" className="absolute end-0 top-10 z-30 w-56 overflow-hidden rounded-xl border bg-surface py-1 shadow-xl" style={{ borderColor: "rgb(var(--gold) / 0.35)" }}>
          {items.map((it) => {
            const cls = "flex h-11 w-full items-center gap-3.5 px-4 text-start text-[15px] font-medium hover:bg-accent-soft";
            const inner = <><span style={{ color: "rgb(var(--gold))" }}><AppIcon name={it.icon} size={20} /></span>{it.label}</>;
            return it.href
              ? <Link key={it.label} role="menuitem" href={it.href} onClick={() => setOpen(false)} className={cls}>{inner}</Link>
              : <button key={it.label} role="menuitem" type="button" onClick={() => { setOpen(false); it.onClick?.(); }} className={cls}>{inner}</button>;
          })}
        </div>
      ) : null}
    </div>
  );
}

// ---------- verse posts ----------
const arabicSize = (n: number) => (n < 70 ? 28 : n < 160 ? 23 : n < 320 ? 18 : n < 520 ? 14.5 : 12);

function VersePost({ card, active, onActive }: { card: WebCard; active: boolean; onActive: (id: string) => void }) {
  const T = useFeedTexts();
  const ws = useTranslations("social");
  const wp = useTranslations("player");
  const locale = useLocale();
  const radio = useRadio();
  const router = useRouter();
  const f = useFeed();
  const fr = useRef(f);
  fr.current = f;
  const verse = card.verse!;
  const uid = `qr${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ref = useInView(card, onActive);
  useSeen(card, active);
  const like = useVerseLike(verse.key, active);
  const [burst, setBurst] = useState(0);
  const [pop, setPop] = useState(0);
  const [open, setOpen] = useState(false);
  const arBox = useRef<HTMLDivElement>(null);
  const arIn = useRef<HTMLDivElement>(null);
  useFit(arBox, arIn, [verse.arabic, verse.translation]);

  // the recitation of the post in view plays (muted by default; the speaker toggles it)
  useEffect(() => {
    if (!active) return;
    if (f.muted) { if (fr.current.player.key === verse.key) fr.current.pause(); return; }
    fr.current.play(verse.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, f.muted, verse.key]);

  const pal = PALETTES[paletteFor(verse.key)];
  const reciter = reciterName(radio.reciter, locale);
  const initials = reciter.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const label = `${verse.chapter} · ${verse.key}`;
  const caption = verse.translation;
  const long = caption.length > 110;
  const liked = like.liked;
  const doLike = () => { if (!liked) setPop((n) => n + 1); void like.toggle(); };
  const tap = useTapGestures(() => f.toggleMute(), () => { setBurst((n) => n + 1); if (!liked) doLike(); });
  const saved = f.saved(verse.key);
  const count = like.count;
  const likeLine = count === null ? "" : liked && count > 1 ? fill(T.feed.likedByYou, { n: fmtN(count - 1, locale) }) : count === 1 ? T.feed.like1 : fill(T.feed.likesN, { n: fmtN(count, locale) });
  const href = `/surah/${verse.s}?v=${verse.v}`;
  const share = (quick = false) => { countShare(verse.key); f.shareVerse(verse, quick); };
  const arSize = arabicSize(verse.arabic.length);
  const ending = ` ﴿${toArDigits(String(verse.v))}﴾`;

  return (
    <article ref={ref} className="mx-auto w-full max-w-[560px] pb-3.5" aria-label={label}>
      <header className="flex h-14 items-center gap-2.5 px-3">
        <RingAvatar seed={verse.key} text={initials || undefined} icon="book" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold tracking-[-0.1px]">Quran Masterclass · {verse.chapter}</p>
          <p className="truncate text-[11.5px] tracking-[0.2px] text-muted">{reciter}</p>
        </div>
        <Link href={href} className="hidden h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[12.5px] font-semibold text-accent hover:border-accent sm:inline-flex"><AppIcon name="cap" size={15} />{T.feed.learnThis}</Link>
        <PostMenu label={T.feed.options} items={[
          { label: ws("share"), icon: "send", onClick: () => share() },
          { label: T.feed.reader, icon: "book", href },
          { label: T.feed.learn, icon: "cap", href },
        ]} />
      </header>

      <div className="fd-sq relative aspect-square w-full overflow-hidden" style={{ background: STAGE.deep }}>
        <button type="button" onClick={tap} aria-label={`${label}. ${verse.translation}`} className="absolute inset-0 block h-full w-full cursor-pointer text-start">
          <div className={`absolute inset-0 ${active ? "fd-ken" : ""}`}>
            <ShareArt palette={pal.id} seed={verse.key} w={360} h={360} layout={LAYOUT.square} className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: `${u(30)} ${u(30)} ${u(22)}` }}>
              <div className="grid justify-items-center" style={{ gap: u(6) }}>
                <span className="max-w-full truncate font-semibold" style={{ color: pal.accent, fontSize: u(11), letterSpacing: "0.15em" }}>{label}</span>
                <svg viewBox="0 0 104 12" style={{ width: u(104), height: u(12) }} aria-hidden dangerouslySetInnerHTML={{ __html: ornamentRuleInner(pal, 104, `${uid}a`) }} />
              </div>
              <div ref={arBox} className="flex min-h-0 flex-1 items-center justify-center overflow-hidden" style={{ paddingBlock: u(6) }}>
                <div ref={arIn} className="grid w-full justify-items-center" style={{ gap: u(8) }}>
                  <p dir="rtl" lang="ar" className="text-center font-arabic" style={{ color: pal.arabic, fontSize: `calc(${u(arSize)} * var(--fit, 1))`, lineHeight: 1.85 }}>
                    {verse.arabic}<span style={{ color: pal.accent, fontSize: "0.78em" }}>{ending}</span>
                  </p>
                  {verse.translation ? (
                    <>
                      <svg viewBox="0 0 56 12" style={{ width: u(56), height: u(12) }} aria-hidden dangerouslySetInnerHTML={{ __html: ornamentRuleInner(pal, 56, `${uid}b`) }} />
                      <p dir="auto" className="text-center italic" style={{ color: pal.soft, fontFamily: SERIF, fontSize: `calc(${u(14)} * var(--fit, 1))`, lineHeight: 1.5 }}>{verse.translation}</p>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="flex justify-center"><Wm tone={pal.wordmark} height={u(18)} /></div>
            </div>
          </div>
          <HeartBurst n={burst} />
        </button>
        <button type="button" onClick={() => f.toggleMute()} aria-label={f.muted ? T.feed.unmute : T.feed.mute} aria-pressed={!f.muted}
          className="absolute bottom-3 end-3 grid h-8 w-8 place-items-center rounded-full border text-[#f3e2b6]" style={{ background: "rgba(5,28,21,0.7)", borderColor: STAGE.goldSoft }}>
          <AppIcon name={f.muted ? "volume" : "speaker"} size={16} className={f.muted ? "opacity-70" : ""} />
          {f.muted ? <span aria-hidden className="absolute h-[1.6px] w-5 -rotate-45 bg-current" /> : null}
        </button>
      </div>

      <div className="flex h-[46px] items-center px-2">
        <IconBtn label={ws("like")} selected={liked} onClick={doLike} pop={pop > 0} key={`l${pop}`}><span style={{ color: liked ? "#b8913f" : undefined }}><AppIcon name="heart" filled={liked} size={25} mirror={false} /></span></IconBtn>
        <IconBtn label={T.feed.viewComments} onClick={() => router.push(href)}><AppIcon name="comment" size={24} /></IconBtn>
        <IconBtn label={ws("share")} onClick={() => share()}><AppIcon name="send" size={24} /></IconBtn>
        <span className="flex-1" />
        <span className="me-0.5"><StoryPill onClick={() => share(true)} /></span>
        <IconBtn label={saved ? wp("bookmarked") : wp("bookmark")} selected={saved} onClick={() => f.toggleSave(verse.key)}><span style={{ color: saved ? "rgb(var(--gold))" : undefined }}><AppIcon name="bookmark" filled={saved} size={24} /></span></IconBtn>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-1 px-3.5">
        {likeLine ? <p className="text-[13.5px] font-semibold">{likeLine}</p> : null}
        <p dir="auto" className={`text-[13.5px] leading-[19px] ${open ? "" : "line-clamp-2"}`}><span className="font-semibold">{label}</span>{caption ? `  ${caption}` : ""}</p>
        {long && !open ? <button type="button" onClick={() => setOpen(true)} className="justify-self-start text-[13.5px] text-muted">{T.feed.moreCaption}</button> : null}
        <Link href={href} className="justify-self-start text-[13.5px] text-muted hover:underline">{T.feed.viewComments}</Link>
        <p className="mt-[3px] truncate text-[10px] font-semibold uppercase tracking-[0.14em] rtl:tracking-normal" style={{ color: "rgb(var(--gold))" }}>{card.votd ? T.feed.votd : T.feed.verseLabel}</p>
      </div>
      <div className="mt-4"><Rule width="42%" color="rgb(var(--gold) / 0.45)" /></div>
    </article>
  );
}

// ---------- every other post ----------
function InfoPost({ card, active, onActive }: { card: WebCard; active: boolean; onActive: (id: string) => void }) {
  const T = useFeedTexts();
  const f = useFeed();
  const ref = useInView(card, onActive);
  useSeen(card, active);
  const know = isKnowledge(card);
  const label = kindLabel(T, card);
  const sub = card.eyebrow ?? (know ? undefined : card.title);
  const head = know || card.kind === "word" ? label : card.title;
  const seed = card.id;
  const hasImage = !!card.image;
  const pill = (
    <div className="flex items-center gap-1">
      <StoryPill onClick={() => f.shareCard(card, true)} />
      <IconBtn label={T.feed.shareTitle} onClick={() => f.shareCard(card)}><AppIcon name="send" size={22} /></IconBtn>
    </div>
  );
  return (
    <article ref={ref} className="mx-auto w-full max-w-[560px] pb-4" aria-label={card.title}>
      <header className="flex h-14 items-center gap-2.5 px-3">
        <RingAvatar seed={`lib:${card.kind}`} icon={cardIcon(card)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">{head}</p>
          <p className="truncate text-[12px] text-muted">{know || card.kind === "word" ? sub : label}</p>
        </div>
        {card.cta === "read" && card.href ? <Link href={card.href} className="hidden h-8 shrink-0 items-center gap-1.5 rounded-full border border-line px-3 text-[12.5px] font-semibold text-accent hover:border-accent sm:inline-flex"><AppIcon name="book" size={15} />{T.prophet.readMore}</Link> : null}
        {pill}
      </header>
      {hasImage ? (
        <>
          <CardImage card={card} />
          {card.body ? <p dir="auto" className="mt-2 line-clamp-6 px-3.5 text-[14.5px] leading-[21px]">{card.body}</p> : null}
        </>
      ) : (
        <div className="mx-3 overflow-hidden rounded-[12px]">
          <PostPanel seed={seed} className={know || card.kind === "word" ? "p-[22px] py-[26px]" : "p-6 py-7"}>
            <CardBody card={card} />
            {know ? <Cta card={card} /> : null}
          </PostPanel>
        </div>
      )}
      <SourceLine card={card} />
    </article>
  );
}

export const HomePost = memo(function HomePost({ card, active, onActive }: { card: WebCard; active: boolean; onActive: (id: string) => void }) {
  if (card.kind === "verse" && card.verse) return <VersePost card={card} active={active} onActive={onActive} />;
  if (card.kind === "carousel" && card.carousel) return <CarouselFeedCard id={card.id} c={card.carousel} active={active} onActive={onActive} />;
  if (card.kind === "wisdom" && card.wisdom) return <WisdomFeedCard id={card.id} w={card.wisdom} active={active} onActive={onActive} />;
  return <InfoPost card={card} active={active} onActive={onActive} />;
});
