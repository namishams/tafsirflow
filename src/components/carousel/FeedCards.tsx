"use client";
import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { markSeen } from "@/lib/feedWeb/client";
import { statPost } from "@/lib/learn/feed/statsStore";
import { PALETTES } from "@/lib/share/formats";
import { carouselText } from "@/lib/feed/carousels/uiText";
import type { ResolvedCarousel, ResolvedWisdom } from "@/lib/feed/carousels/resolve";
import CarouselViewer, { WisdomViewer } from "./CarouselViewer";

// The carousel and wisdom posts of the website feed (Home list and Reels), as in the app's features/carousel/Posts.tsx:
// header, the slides swiped inside the post, actions, caption with sources. Used by the feed renderers in
// src/components/feed through `card.carousel` / `card.wisdom`.

function useSeen(id: string, onActive?: (id: string) => void, active?: boolean) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !onActive) return;
    const io = new IntersectionObserver((e) => { if (e[0]?.isIntersecting) onActive(id); }, { threshold: [0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, [id, onActive]);
  useEffect(() => { if (active) { markSeen(id); statPost(id.includes("wisdom") ? "wisdom" : "carousel", id); } }, [active, id]);
  return ref;
}

function Avatar({ palette }: { palette: keyof typeof PALETTES }) {
  const p = PALETTES[palette];
  return (
    <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: `linear-gradient(135deg, ${p.bg[0]}, ${p.bg[2]})`, border: `1px solid ${p.line}` }}>
      <span className="h-3.5 w-3.5 rotate-45 border" style={{ borderColor: p.line }} />
    </span>
  );
}

export function CarouselFeedCard({ id, c, active, onActive, dark }: { id: string; c: ResolvedCarousel; active?: boolean; onActive?: (id: string) => void; dark?: boolean }) {
  const tx = carouselText(c.lang);
  const ref = useSeen(id, onActive, active);
  return (
    <article ref={ref} className={`mx-auto w-full max-w-[560px] pb-5 ${dark ? "text-white" : ""}`} aria-label={c.cover.title}>
      <header className="flex h-14 items-center gap-2.5 px-3">
        <Avatar palette={c.palette} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">{c.seriesLabel}</p>
          <p className={`truncate text-[12px] ${dark ? "text-white/65" : "text-muted"}`}>{tx.carousel} · {c.slides.length + 2}</p>
        </div>
        <Link href={`/carousels/${c.id}`} className={`h-8 shrink-0 rounded-full border px-3 text-[12.5px] font-semibold leading-8 ${dark ? "border-white/30" : "border-line text-accent"}`}>{tx.carousels}</Link>
      </header>
      <div className="px-0 sm:px-3"><CarouselViewer c={c} compact /></div>
      <div className="mt-2 grid gap-0.5 px-3.5">
        <p className="text-[14.5px] font-semibold leading-5">{c.cover.title}</p>
        {c.cover.sub ? <p className="line-clamp-2 text-[13.5px] leading-[19px]">{c.cover.sub}</p> : null}
        <p className={`line-clamp-1 text-[11.5px] ${dark ? "text-white/60" : "text-muted"}`}>{tx.sources}: {c.sources.map((s) => s.label).join(" · ")}</p>
        {c.review ? <p className={`text-[11px] ${dark ? "text-white/55" : "text-muted"}`}>{tx.review}</p> : null}
      </div>
    </article>
  );
}

export function WisdomFeedCard({ id, w, active, onActive, dark }: { id: string; w: ResolvedWisdom; active?: boolean; onActive?: (id: string) => void; dark?: boolean }) {
  const tx = carouselText(w.lang);
  const ref = useSeen(id, onActive, active);
  return (
    <article ref={ref} className={`mx-auto w-full max-w-[560px] pb-5 ${dark ? "text-white" : ""}`} aria-label={w.themeLabel}>
      <header className="flex h-14 items-center gap-2.5 px-3">
        <Avatar palette={w.palette} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">{w.kind === "reflection" ? tx.reflection : tx.wisdom}</p>
          <p className={`truncate text-[12px] ${dark ? "text-white/65" : "text-muted"}`}>{w.themeLabel}</p>
        </div>
      </header>
      <div className="px-0 sm:px-3"><WisdomViewer w={w} /></div>
      <p className={`mt-2 px-3.5 text-[11.5px] ${dark ? "text-white/60" : "text-muted"}`}>
        {tx.source}: {w.scripture?.url ? <a href={w.scripture.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{w.scripture.ref}</a> : w.scripture?.ref ?? w.source.label}
        {w.review && w.kind !== "verse" ? ` · ${tx.review}` : ""}
      </p>
    </article>
  );
}

/** Reels: a carousel full screen (the slides as large as the screen allows, swiped horizontally) */
export function CarouselReelPage({ id, c }: { id: string; c: ResolvedCarousel; active: boolean }) {
  // the Reels list marks the page as seen itself
  const ref = useSeen(id, undefined, false);
  const tx = carouselText(c.lang);
  return (
    <section ref={ref} className="relative flex h-full w-full flex-col items-center justify-center overflow-y-auto px-3 py-16 text-white" style={{ background: PALETTES[c.palette].bg[2] }} aria-label={c.cover.title}>
      <div className="w-full" style={{ maxWidth: "min(520px, calc((100dvh - 260px) * 0.8))" }}><CarouselViewer c={c} compact /></div>
      <div className="mt-3 w-full max-w-[520px] px-1">
        <p className="text-[13px] font-semibold" style={{ color: "rgb(214 180 108)" }}>{c.seriesLabel} · {tx.carousel}</p>
        <p className="mt-0.5 text-[15px] font-semibold leading-5">{c.cover.title}</p>
        {c.review ? <p className="mt-1 text-[11px] text-white/60">{tx.review}</p> : null}
      </div>
    </section>
  );
}
export function WisdomReelPage({ id, w }: { id: string; w: ResolvedWisdom; active: boolean }) {
  const ref = useSeen(id, undefined, false);
  return (
    <section ref={ref} className="relative flex h-full w-full items-center justify-center overflow-y-auto px-3 py-16 text-white" style={{ background: PALETTES[w.palette].bg[2] }} aria-label={w.themeLabel}>
      <div className="w-full" style={{ maxWidth: "min(520px, calc((100dvh - 220px) * 0.8))" }}><WisdomViewer w={w} /></div>
    </section>
  );
}

/** Explore: the square cover (carousel, with the carousel mark) or the wisdom theme */
export function FeedTile({ c, w, big, onOpen }: { c?: ResolvedCarousel; w?: ResolvedWisdom; big?: boolean; onOpen: () => void }) {
  const palette = c?.palette ?? w?.palette ?? "night";
  const p = PALETTES[palette];
  const title = c ? c.cover.title : w?.text ?? w?.scripture?.text ?? "";
  const kicker = c ? c.seriesLabel : w?.themeLabel ?? "";
  const arabic = c ? c.cover.arabic : w?.scripture?.arabic ?? w?.arabic;
  return (
    <button type="button" onClick={onOpen} aria-label={[kicker, title].filter(Boolean).join(". ")} className="relative block h-full w-full overflow-hidden p-px text-center transition active:scale-[0.97]">
      <span className="relative flex h-full w-full flex-col items-center justify-center gap-1 overflow-hidden px-2" style={{ background: `linear-gradient(160deg, ${p.bg[0]}, ${p.bg[2]})`, boxShadow: `inset 0 0 0 1px ${p.line}55` }}>
        <span className="line-clamp-1 text-[9.5px] font-semibold tracking-[0.08em]" style={{ color: p.accent }}>{kicker}</span>
        {arabic ? <span lang="ar" dir="rtl" className={`font-arabic ${big ? "line-clamp-3 text-[26px] leading-[44px]" : "line-clamp-2 text-[15px] leading-[26px]"}`} style={{ color: p.arabic }}>{arabic}</span> : null}
        <span dir="auto" className={`${big ? "line-clamp-4 text-[16px]" : "line-clamp-3 text-[11.5px]"} font-semibold leading-tight`} style={{ color: p.ink, fontFamily: "'Fraunces Variable', Georgia, serif" }}>{title}</span>
      </span>
      {c ? (
        <span aria-hidden className="absolute end-2 top-2 h-4 w-4">
          <span className="absolute end-0 top-0 h-3 w-3 rounded-[2px] border-[1.5px] border-white" />
          <span className="absolute bottom-0 start-0 h-3 w-3 rounded-[2px] border-[1.5px] border-white bg-black/25" />
        </span>
      ) : null}
    </button>
  );
}
