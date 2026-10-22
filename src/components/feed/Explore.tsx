"use client";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { WebCard } from "@/lib/feedWeb/types";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { AppIcon } from "./icons";
import { kindLabel, topicLabel } from "./kinds";
import { STAGE, toneGradient, toneOf } from "./tokens";
import type { StreamTopic } from "./stream";
import { FeedTile } from "@/components/carousel/FeedCards";

// Explore (mobile/src/features/feed/Explore.tsx): a grid of three square tiles per row (every other block of six has one
// large 2x2 tile, alternating sides), a search bar that opens the full search, and the topic chips. A tile opens the
// Reels view at that post.

export const TOPIC_CHIPS: StreamTopic[] = ["all", "verses", "tafsir", "hadith", "duas", "stories", "prayer", "seerah", "quran", "holy", "names", "scholars", "history", "art"];

export function TopicChips({ value, onChange, dark, className = "" }: { value: StreamTopic; onChange: (t: StreamTopic) => void; dark?: boolean; className?: string }) {
  const T = useFeedTexts();
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} role="tablist" aria-label={T.feed.topics} className={`fd-rail flex gap-2 overflow-x-auto px-3.5 py-2.5 ${className}`}>
      {TOPIC_CHIPS.map((k) => {
        const on = value === k;
        const label = topicLabel(T, k as Parameters<typeof topicLabel>[1]);
        return dark ? (
          <button key={k} type="button" role="tab" aria-selected={on} onClick={() => onChange(k)} className="fd-chip-dark h-[30px] shrink-0 rounded-full border px-3 text-[13px] font-semibold">{label}</button>
        ) : (
          <button key={k} type="button" role="tab" aria-selected={on} onClick={() => onChange(k)}
            className={`h-8 shrink-0 rounded-full border px-[15px] text-[13px] tracking-[0.2px] transition active:scale-[0.97] ${on ? "font-semibold text-[#f3e2b6]" : "font-medium text-ink hover:border-ink/40"}`}
            style={on ? { background: STAGE.bg, borderColor: STAGE.gold } : { borderColor: "rgb(var(--line))" }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Tile({ card, big, onOpen }: { card: WebCard; big?: boolean; onOpen: () => void }) {
  const T = useFeedTexts();
  const tone = toneOf(card.verse?.key ?? card.id);
  const label = card.kind === "verse" || card.kind === "word" ? `${T.feed.verseLabel} ${card.verse?.key ?? ""}` : kindLabel(T, card);
  const ar = card.verse && (card.kind === "verse" || card.kind === "word") ? card.verse.arabic : card.arabic ?? "";
  const body = card.kind === "verse" ? "" : card.title;
  return (
    <button type="button" onClick={onOpen} aria-label={[label, body].filter(Boolean).join(". ")} className="relative block h-full w-full overflow-hidden p-px text-start transition active:scale-[0.97]">
      <span className="relative flex h-full w-full flex-col justify-between overflow-hidden p-2" style={{ background: toneGradient(tone, 135) }}>
        {card.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.image.url} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <span className="relative truncate text-[9.5px] font-semibold uppercase tracking-[0.1em] rtl:tracking-normal" style={{ color: STAGE.gold, textShadow: card.image ? "0 0 4px rgba(0,0,0,0.7)" : undefined }}>{label}</span>
        {ar ? <span dir="rtl" lang="ar" className={`relative text-center font-arabic text-white ${big ? "line-clamp-6 text-[22px] leading-[40px]" : "line-clamp-4 text-[14px] leading-[26px]"}`}>{ar}</span> : null}
        {body ? <span dir="auto" className={`relative text-center text-[11px] leading-[15px] text-white/85 ${ar ? "line-clamp-1" : "line-clamp-5"}`} style={{ textShadow: card.image ? "0 0 4px rgba(0,0,0,0.7)" : undefined }}>{body}</span> : <span />}
      </span>
    </button>
  );
}
const MemoTile = memo(Tile);

/** blocks of six: every other block has one large 2x2 tile, alternating sides */
function Grid({ cards, onOpen }: { cards: WebCard[]; onOpen: (c: WebCard) => void }) {
  const blocks = useMemo(() => {
    const out: { id: string; items: WebCard[]; big: boolean; left: boolean }[] = [];
    for (let i = 0, b = 0; i < cards.length; i += 6, b++) out.push({ id: `${cards[i].id}-${i}`, items: cards.slice(i, i + 6), big: b % 2 === 1 && cards.length - i >= 6, left: b % 4 === 1 });
    return out;
  }, [cards]);
  return (
    <div className="mx-auto w-full max-w-[700px]">
      {blocks.map((b) => (
        <div key={b.id} className="grid grid-cols-3 [grid-auto-flow:dense]">
          {b.items.map((c, i) => (
            <div key={c.id} className={b.big && i === 0 ? `col-span-2 row-span-2 ${b.left ? "col-start-1" : "col-start-2"}` : b.big ? (b.left ? "col-start-3" : "col-start-1") : ""}>
              <div className="aspect-square">{c.carousel || c.wisdom ? <FeedTile c={c.carousel} w={c.wisdom} big={b.big && i === 0} onOpen={() => onOpen(c)} /> : <MemoTile card={c} big={b.big && i === 0} onOpen={() => onOpen(c)} />}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ExploreView({ cards, topic, onTopic, onOpen, onEnd, loading, query, onQuery }: {
  cards: WebCard[]; topic: StreamTopic; onTopic: (t: StreamTopic) => void; onOpen: (c: WebCard) => void; onEnd: () => void; loading: boolean; query: string; onQuery: (q: string) => void;
}) {
  const T = useFeedTexts();
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0]?.isIntersecting) onEnd(); }, { rootMargin: "1200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [onEnd, cards.length]);
  const q = query.trim().toLowerCase();
  const shown = useMemo(() => {
    if (!q) return cards;
    return cards.filter((c) => `${c.title} ${c.body} ${c.arabic ?? ""} ${c.eyebrow ?? ""} ${c.verse?.key ?? ""} ${c.verse?.translation ?? ""}`.toLowerCase().includes(q));
  }, [cards, q]);
  const ref = q.match(/^(\d{1,3})[:.\s](\d{1,3})$/);
  return (
    <div>
      {/* the search bar opens the full search (accounts and content); a query that comes back from there filters this grid */}
      {query ? (
        <div className="mx-3.5 mt-2.5 flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3">
          <AppIcon name="search" size={16} className="text-muted" />
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder={T.feed.exploreSearch} aria-label={T.feed.exploreSearch} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
          <button type="button" onClick={() => onQuery("")} aria-label={T.feed.close} className="grid h-8 w-8 place-items-center text-muted"><AppIcon name="close" size={16} /></button>
        </div>
      ) : (
        <Link href="/talents/search" role="search" aria-label={T.feed.exploreSearch} className="mx-3.5 mt-2.5 flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-[15px] text-muted">
          <AppIcon name="search" size={16} />{T.feed.exploreSearch}
        </Link>
      )}
      <TopicChips value={topic} onChange={onTopic} />
      {ref ? <Link href={`/surah/${Number(ref[1])}?v=${Number(ref[2])}`} className="mx-3.5 mb-2 flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-[14.5px] font-semibold text-accent"><AppIcon name="book" size={18} />Quran {Number(ref[1])}:{Number(ref[2])}</Link> : null}
      {shown.length ? <Grid cards={shown} onOpen={onOpen} /> : loading ? (
        <div className="mx-auto grid max-w-[700px] grid-cols-3" aria-hidden>{Array.from({ length: 12 }, (_, i) => <span key={i} className="fd-skel aspect-square" />)}</div>
      ) : <p className="px-6 py-12 text-center text-[14.5px] text-muted">{T.feed.savedEmpty}</p>}
      <div ref={sentinel} className="h-10" aria-hidden />
    </div>
  );
}
