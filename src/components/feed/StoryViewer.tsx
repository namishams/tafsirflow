"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import type { Story, StoryGroup } from "@/lib/learn/prophet/stories";
import { fill } from "@/lib/feedWeb/texts";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { useFeed } from "./ctx";
import { AppIcon } from "./icons";
import { Backdrop } from "./Reels";
import { SEEN_STORIES, type RailGroup } from "./Rings";
import { STAGE, toneOf } from "./tokens";

// The full-screen story viewer (mobile/src/features/prophet/StoryViewer.tsx): progress bars per card of the group, tap the
// far side to go on and the near side to go back (mirrored right to left), touch and hold to pause, swipe down or the cross
// at the top to close. Cards move on by themselves after a reading time; with reduced motion they wait for the person.
// The website is free: no daily allowance, no Pro card.

const SAVED = "tf:story-saves";
const readMs = (words: number) => Math.min(45000, Math.max(8000, (words / 3.2) * 1000));

export type StoryLib = { groups: Record<string, StoryGroup[]>; byId: Map<string, StoryGroup> };
type Lib = StoryLib;
let libCache: { locale: string; lib: Lib } | null = null;
/** every story card of the page language (one request, cached by the server and kept for the visit) */
export async function loadStoryLibrary(locale: string): Promise<Lib> {
  if (libCache?.locale === locale) return libCache.lib;
  const r = await fetch(`/api/feed/stories?locale=${locale}&full=1`);
  if (!r.ok) throw new Error(String(r.status));
  const d = (await r.json()) as { groups: Record<string, StoryGroup[]> };
  const byId = new Map<string, StoryGroup>();
  for (const list of Object.values(d.groups)) for (const g of list) byId.set(g.id, g);
  libCache = { locale, lib: { groups: d.groups, byId } };
  return libCache.lib;
}

function markStorySeen(id: string) {
  const cur = readJSON<string[]>(SEEN_STORIES, []);
  if (!cur.includes(id)) writeJSON(SEEN_STORIES, [...cur.slice(-1500), id], true);
}

function Badge({ badge }: { badge: NonNullable<Story["badge"]> }) {
  const bg = badge.tone === "no" ? "rgba(160,58,52,0.55)" : badge.tone === "info" ? "rgba(214,180,108,0.32)" : "rgba(58,190,146,0.38)";
  return <span className="inline-block self-start rounded-full px-2.5 py-1 text-[12px] font-bold text-white" style={{ background: bg }}>{badge.text}</span>;
}

/** the text of one story card on the dark stage */
function StoryContent({ story, onNavigate }: { story: Story; onNavigate: () => void }) {
  const T = useFeedTexts();
  return (
    <div className="relative grid grid-cols-[minmax(0,1fr)] gap-3.5">
      <span aria-hidden className="pointer-events-none absolute -top-8 -end-1.5 text-[64px] leading-[110px]" style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif", color: "rgba(214,180,108,0.14)" }}>{story.arabic}</span>
      {story.kicker ? <p className="text-[12px] font-semibold uppercase tracking-[0.15em] rtl:tracking-normal" style={{ color: STAGE.gold }}>{story.kicker}</p> : null}
      {story.badge ? <Badge badge={story.badge} /> : null}
      <h2 dir="auto" className="font-display text-[28px] leading-[33px] tracking-[-0.5px] text-white md:text-[34px] md:leading-[40px]">{story.title}</h2>
      {story.paragraphs.map((p, i) => <p key={i} dir="auto" className="select-text text-[16.5px] leading-[26px] text-white/90 md:text-[19px] md:leading-[30px]">{p}</p>)}
      {story.points ? (
        <div className="grid gap-2">
          <p className="text-[14px] font-bold" style={{ color: STAGE.gold }}>{story.points.title}</p>
          {story.points.items.map((it, i) => (
            <div key={i} className="flex gap-2.5"><span aria-hidden className="mt-[9px] h-[7px] w-[7px] shrink-0 rotate-45" style={{ background: STAGE.gold }} /><span dir="auto" className="text-[15px] leading-[22px] text-white/90">{it}</span></div>
          ))}
        </div>
      ) : null}
      {story.sources.length ? (
        <div className="mt-1 grid gap-1">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] rtl:tracking-normal" style={{ color: STAGE.textMuted }}>{T.prophet.sources}</p>
          <p className="text-[12.5px] leading-[18px]" style={{ color: STAGE.textMuted }}>{story.sources.join(" · ")}</p>
        </div>
      ) : null}
      <Link href={story.webPath} onClick={onNavigate} className="mt-1 inline-flex items-center gap-1.5 self-start py-2 text-[14.5px] font-bold" style={{ color: STAGE.gold }}>
        {story.truncated && story.href.startsWith("/islam/") ? T.prophet.readFull : T.prophet.readMore}<AppIcon name="chevronRight" size={16} />
      </Link>
    </div>
  );
}

function BarButton({ icon, label, onClick, filled }: { icon: Parameters<typeof AppIcon>[0]["name"]; label: string; onClick: () => void; filled?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="grid h-[46px] w-[46px] place-items-center rounded-full border transition hover:bg-white/15 active:bg-white/20" style={{ background: "rgba(0,0,0,0.28)", borderColor: "rgba(255,255,255,0.14)", color: filled ? STAGE.gold : "#fff" }}>
      <AppIcon name={icon} size={20} filled={filled} />
    </button>
  );
}

export function StoryViewer({ rail, start, onClose }: { rail: RailGroup[]; start: { group: number; story: number } | null; onClose: () => void }) {
  const T = useFeedTexts();
  const locale = useLocale();
  const f = useFeed();
  const saves = useStored<string[]>(SAVED, []);
  const [lib, setLib] = useState<Lib | null>(libCache?.locale === locale ? libCache.lib : null);
  const [failed, setFailed] = useState(false);
  const [pos, setPos] = useState(start ?? { group: 0, story: 0 });
  const [paused, setPaused] = useState(false);
  const [sheetPause, setSheetPause] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [dragY, setDragY] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const hold = useRef<number | null>(null);
  const touch = useRef<{ y: number; x: number } | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const rtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  useEffect(() => { setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  useEffect(() => { if (start) setPos(start); }, [start]);
  useEffect(() => {
    if (!start || lib) return;
    let alive = true;
    loadStoryLibrary(locale).then((l) => { if (alive) setLib(l); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [start, lib, locale]);

  const groups = useMemo(() => (lib ? rail.map((g) => lib.byId.get(g.id)).filter((g): g is StoryGroup => !!g && g.stories.length > 0) : []), [lib, rail]);
  // the position in `groups` (the rail may hold groups without cards)
  const group = groups[Math.min(pos.group, Math.max(0, groups.length - 1))];
  const story = group?.stories[Math.min(pos.story, Math.max(0, (group?.stories.length ?? 1) - 1))];
  const startedId = start ? rail[start.group]?.id : null;
  useEffect(() => {
    if (!lib || !startedId) return;
    const i = groups.findIndex((g) => g.id === startedId);
    if (i >= 0) setPos((p) => (p.group === start?.group ? { group: i, story: p.story } : p));
    // only once, when the library has arrived
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lib]);

  const next = useCallback(() => {
    if (!group) return;
    if (pos.story + 1 < group.stories.length) setPos({ group: pos.group, story: pos.story + 1 });
    else if (pos.group + 1 < groups.length) setPos({ group: pos.group + 1, story: 0 });
    else onClose();
  }, [group, groups.length, pos, onClose]);
  const prev = useCallback(() => {
    if (pos.story > 0) setPos({ group: pos.group, story: pos.story - 1 });
    else if (pos.group > 0) setPos({ group: pos.group - 1, story: Math.max(0, (groups[pos.group - 1]?.stories.length ?? 1) - 1) });
  }, [groups, pos]);

  // seen, a fresh timer for each card
  useEffect(() => {
    if (!story) return;
    markStorySeen(story.id);
    elapsed.current = 0;
    setSheetPause(false);
    if (bar.current) bar.current.style.width = "0%";
    scroller.current?.scrollTo({ top: 0 });
  }, [story?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // the reading timer: eight seconds at least, longer for longer texts
  const auto = !reduce;
  useEffect(() => {
    if (!story || !start || !auto || paused || sheetPause) return;
    const words = `${story.title} ${story.paragraphs.join(" ")}`.split(/\s+/).length;
    const dur = readMs(words);
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      elapsed.current += t - last;
      last = t;
      const p = Math.min(1, elapsed.current / dur);
      if (bar.current) bar.current.style.width = `${p * 100}%`;
      if (p >= 1) { next(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [story?.id, auto, paused, sheetPause, !!start, next]); // eslint-disable-line react-hooks/exhaustive-deps

  // keyboard, scroll lock, focus on the close cross
  useEffect(() => {
    if (!start) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); }
      else if (e.key === "ArrowRight") { rtl ? prev() : next(); }
      else if (e.key === "ArrowLeft") { rtl ? next() : prev(); }
    };
    document.addEventListener("keydown", key);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = overflow; };
  }, [start, onClose, next, prev, rtl]);

  if (!start || typeof document === "undefined") return null;
  const saved = !!story && saves.includes(story.id);
  const toggleSave = () => { if (!story) return; const cur = readJSON<string[]>(SAVED, []); writeJSON(SAVED, cur.includes(story.id) ? cur.filter((x) => x !== story.id) : [...cur, story.id]); };

  const onTap = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    const nearSide = rtl ? e.clientX > window.innerWidth * 0.7 : e.clientX < window.innerWidth * 0.3;
    if (nearSide) prev(); else next();
  };
  const down = (e: React.PointerEvent) => {
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = window.setTimeout(() => setPaused(true), 250);
    if (e.pointerType === "touch") touch.current = { y: e.clientY, x: e.clientX };
  };
  const up = () => {
    if (hold.current) { window.clearTimeout(hold.current); hold.current = null; }
    setPaused(false);
    if (dragY > 120) { setDragY(0); onClose(); return; }
    setDragY(0);
    touch.current = null;
  };
  const move = (e: React.PointerEvent) => {
    const t = touch.current;
    if (!t || (scroller.current?.scrollTop ?? 0) > 2) return;
    const dy = e.clientY - t.y;
    if (dy > 12 && dy > Math.abs(e.clientX - t.x) * 1.5) setDragY(dy);
  };

  const label = group && story ? fill(T.prophet.storyOf, { n: pos.story + 1, total: group.stories.length }) : "";
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={group?.title ?? T.feed.stories} className="fixed inset-0 z-[120] overflow-hidden" style={{ background: STAGE.deep, transform: `translateY(${dragY}px)`, opacity: 1 - Math.min(0.4, dragY / 750), transition: dragY ? "none" : "transform .2s, opacity .2s" }}>
      <Backdrop tone={toneOf(story?.group ?? "stories")} animate={!reduce} />
      {/* progress bars of this group */}
      {group ? (
        <div className="absolute inset-x-2.5 z-20 flex gap-1" style={{ top: "calc(env(safe-area-inset-top) + 8px)" }} role="img" aria-label={label}>
          {group.stories.map((s, i) => (
            <div key={s.id} className="h-[2.5px] flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.25)" }}>
              {i < pos.story ? <div className="h-full w-full bg-white" /> : i === pos.story ? <div ref={bar} className="h-full bg-white" style={auto ? { width: "0%" } : { width: "100%" }} /> : null}
            </div>
          ))}
        </div>
      ) : null}
      {/* the title and the cross at the top: above the card text, so a tap on it always closes */}
      <div className="absolute inset-x-0 z-30 flex items-center gap-2.5 ps-3.5 pe-2" style={{ top: "calc(env(safe-area-inset-top) + 20px)" }}>
        <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-white">{group?.title ?? ""}</p>
        <button ref={closeBtn} type="button" onClick={onClose} aria-label={T.prophet.close} title={T.prophet.close} className="pointer-events-auto grid h-11 w-11 shrink-0 place-items-center rounded-full text-white transition hover:bg-black/40 active:bg-black/50" style={{ background: "rgba(0,0,0,0.3)" }}>
          <AppIcon name="close" size={22} mirror={false} />
        </button>
      </div>

      <div ref={scroller} className="absolute inset-x-0 top-0 overflow-y-auto" style={{ bottom: "calc(66px + max(env(safe-area-inset-bottom), 12px))" }} onClick={onTap} onPointerDown={down} onPointerUp={up} onPointerCancel={up} onPointerLeave={() => { if (hold.current) { window.clearTimeout(hold.current); hold.current = null; } setPaused(false); }} onPointerMove={move}>
        <div className="mx-auto flex min-h-full w-full max-w-[720px] flex-col justify-center px-6 pb-6 pt-24">
          {story ? <StoryContent story={story} onNavigate={onClose} />
            : failed ? <p className="text-center text-white/80">{T.feed.offline}</p>
              : <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-[rgb(214,180,108)]" role="status" aria-label={T.feed.loading} />}
        </div>
      </div>

      {/* the bottom bar: previous / next for everyone, save, share */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-3.5 pt-2" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>
        <BarButton icon="chevronLeft" label={T.prophet.prev} onClick={prev} />
        {story ? (
          <div className="flex gap-1.5">
            <BarButton icon="bookmark" label={saved ? T.prophet.unsave : T.prophet.save} filled={saved} onClick={toggleSave} />
            <BarButton icon="send" label={T.prophet.share} onClick={() => { setSheetPause(true); f.shareStory(story); }} />
          </div>
        ) : <span />}
        <BarButton icon="chevronRight" label={T.prophet.next} onClick={next} />
      </div>
    </div>,
    document.body,
  );
}
