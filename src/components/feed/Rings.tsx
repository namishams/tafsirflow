"use client";
import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRadio } from "@/components/RadioProvider";
import { TreeArt } from "@/components/learn/garden/Tree";
import { useGardenRing } from "@/lib/learn/garden/garden";
import { useGardenText } from "@/lib/learn/garden/texts";
import { todaysQuests } from "@/lib/learn/feed/gamify";
import { streakOf, useFeedStats } from "@/lib/learn/feed/statsStore";
import { readTradition } from "@/lib/learn/tradition";
import { readJSON, useHydrated, useStored } from "@/lib/learn/store";
import { countdown, todayUtc } from "@/lib/hijri";
import { VERSES_OF_THE_DAY } from "@/lib/votd";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { AppIcon, type IconName } from "./icons";
import { fmtN, toneGradient } from "./tokens";

// The round shortcuts at the start of the Home rail (mobile/src/features/feed/Rings.tsx TodayRings): garden, today's quests,
// next prayer, countdown to the next Islamic day, feed streak, radio live, verse of the day, ranking, statistics, Shams;
// then the story circles (Bubble in HomeFeed.tsx). The website has no Pro ring: everything on the website is free.

const GOLD_FRESH = "conic-gradient(from 135deg, #f6e7bf, #d6b46c, #8a6a2c, #e9cf99, #f6e7bf)";
const GOLD_PLAIN = "linear-gradient(135deg, #f3e2b6, #c6a65e 55%, #a9802f)";

type Ring = { id: string; label: string; value: string; icon: IconName; tone: [string, string]; href: string; live?: boolean; fresh?: boolean; progress?: number; node?: ReactNode };

function Circle({ r, radioOn, onAir }: { r: Ring; radioOn: boolean; onAir: string }) {
  const border = r.id === "radio" && radioOn ? "linear-gradient(135deg, #fff3d6, #d6b46c 40%, #8a6a2c 75%, #e9cf99)" : r.fresh ? GOLD_FRESH : GOLD_PLAIN;
  return (
    <Link href={r.href} aria-label={[r.label, r.value].filter(Boolean).join(", ")} className="relative flex w-[78px] shrink-0 flex-col items-center gap-[5px] transition active:scale-[0.97]">
      {r.progress !== undefined ? (
        <span className="relative block h-[72px] w-[72px]">
          <svg width="72" height="72" className="absolute inset-0" aria-hidden>
            <circle cx="36" cy="36" r="34" stroke="rgb(var(--line))" strokeWidth="2.5" fill="none" />
            {r.progress > 0 ? <circle cx="36" cy="36" r="34" stroke="#c6a65e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray={`${(2 * Math.PI * 34 * Math.min(1, r.progress)).toFixed(1)} 999`} transform="rotate(-90 36 36)" /> : null}
          </svg>
          <span className="absolute inset-[4.5px] grid place-items-center overflow-hidden rounded-full border" style={{ background: toneGradient(r.tone, 150), borderColor: "rgba(214,180,108,0.55)" }}>
            {r.node ?? <span className="grid justify-items-center gap-px text-[rgb(233,207,153)]"><AppIcon name={r.icon} size={17} /><span className="text-[12px] font-bold text-white">{r.value}</span></span>}
          </span>
        </span>
      ) : (
        <span className="block h-[72px] w-[72px] rounded-full p-[2px]" style={{ background: border }}>
          <span className="block h-full w-full rounded-full bg-bg p-[2.5px]">
            <span className="grid h-full w-full place-items-center rounded-full border" style={{ background: toneGradient(r.tone, 150), borderColor: "rgba(214,180,108,0.55)" }}>
              <span className="grid justify-items-center gap-px text-[rgb(233,207,153)]">
                <AppIcon name={r.icon} size={r.value ? 17 : 24} />
                {r.value ? <span className="max-w-[60px] truncate px-1 text-[12px] font-bold text-white">{r.value}</span> : null}
              </span>
            </span>
          </span>
        </span>
      )}
      {r.live ? <span className="absolute top-[58px] rounded-[3px] border px-1.5 text-[8.5px] font-semibold uppercase leading-[14px] tracking-[0.1em]" style={{ background: "rgb(8,38,29)", borderColor: "rgb(214,180,108)", color: "rgb(233,207,153)" }}>{onAir}</span> : null}
      <span className="max-w-[76px] truncate text-[11px] font-medium tracking-[0.2px]">{r.label}</span>
    </Link>
  );
}

export const TodayRings = memo(function TodayRings() {
  const T = useFeedTexts();
  const locale = useLocale();
  const hydrated = useHydrated();
  const wp = useTranslations("prayer");
  const nav = useTranslations("nav");
  const radio = useRadio();
  const stats = useFeedStats();
  const gr = useGardenRing(true);
  const gtx = useGardenText();
  const [next, setNext] = useState<{ p: string; time: string } | null>(null);

  // next prayer at the place of the Today screen ("tf:city" / "tf:myspot", default Makkah)
  useEffect(() => {
    let alive = true;
    void import("@/lib/prayer").then((m) => {
      try {
        const city = readJSON<string>("tf:city", "makkah");
        const spot = city === "mine" ? (readJSON<(typeof m.CITIES)[number] | null>("tf:myspot", null) ?? m.CITIES[0]) : (m.CITIES.find((c) => c.id === city) ?? m.CITIES[0]);
        const d = m.dayFor(spot, new Date());
        const now = Date.now();
        for (const p of ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const) { const at = d.times[p]; if (at && at.getTime() > now) { if (alive) setNext({ p, time: m.fmtTime(at, spot.tz, locale) }); return; } }
      } catch { /* no prayer times */ }
    });
    return () => { alive = false; };
  }, [locale]);

  const days = useMemo(() => { try { return countdown(hydrated ? readTradition() : null, todayUtc(), 1)?.days ?? null; } catch { return null; } }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps
  const votd = VERSES_OF_THE_DAY[Math.floor(Date.now() / 86400000) % VERSES_OF_THE_DAY.length];
  const quests = hydrated ? todaysQuests() : [];
  const qDone = quests.filter((q) => q.p >= q.n).length;
  const qFrac = quests.length ? quests.reduce((a, q) => a + Math.min(1, q.p / q.n), 0) / quests.length : 0;
  const radioOn = radio.started && radio.playing;
  const [vk, vv] = votd.split(":");

  const rings: Ring[] = [
    { id: "garden", label: gtx.ring, value: "", icon: "heart", tone: ["#0b3d2e", "#1d6b52"], progress: gr.frac, fresh: gr.fruits > 0, node: <TreeArt id={gr.id} type={gr.type} stage={gr.planted ? Math.min(gr.stage, 8) : 0} size={46} still />, href: gr.planted ? "/garden" : "/garden?plant=1" },
    { id: "quests", label: T.game.questsRing, value: `${qDone}/${quests.length}`, icon: "checkCircle", tone: ["#0b3d2e", "#1d6b52"], progress: qFrac, href: "/stats" },
    { id: "prayer", label: next ? wp(next.p) : T.feed.ringPrayer, value: next?.time ?? "", icon: "mosque", tone: ["#0b3d2e", "#1d6b52"], href: "/prayer" },
    { id: "countdown", label: T.feed.ringCountdown, value: days !== null ? fmtN(days, locale) : "", icon: "moon", tone: ["#1f473b", "#3e8c75"], href: "/calendar" },
    { id: "streak", label: T.feed.ringStreak, value: String(hydrated ? streakOf(stats) : 0), icon: "flame", tone: ["#3d2a0b", "#a67c2e"], href: "/stats" },
    { id: "radio", label: T.feed.ringRadio, value: "", icon: "radio", tone: ["#473614", "#a27a29"], href: "/radio", live: true },
    { id: "verse", label: T.feed.ringVerse, value: votd, icon: "book", tone: ["#473a1f", "#8c723e"], href: `/surah/${vk}?v=${vv}` },
    { id: "ranking", label: nav("ranking"), value: "", icon: "trophy", tone: ["#3d2a0b", "#a67c2e"], href: "/ranking" },
    { id: "stats", label: T.feed.statsOpen, value: "", icon: "trophy", tone: ["#10382c", "#1f6953"], href: "/stats" },
    { id: "shams", label: T.feed.ringShams, value: "", icon: "sun", tone: ["#3d2a0b", "#8c6a1d"], href: "/shams" },
  ];
  return <>{rings.map((r) => <Circle key={r.id} r={r} radioOn={radioOn} onAir={T.feed.onAir} />)}</>;
});

// ---------- story circles ----------
export type RailGroup = { id: string; cat: string; title: string; arabic: string; ids: string[] };
export const SEEN_STORIES = "qmc.stories-seen";

let railCache: { locale: string; rail: RailGroup[] } | null = null;
/** the story circles of the page language (one small request, cached by the server) */
export function useRail(locale: string): RailGroup[] | null {
  const [rail, setRail] = useState<RailGroup[] | null>(railCache?.locale === locale ? railCache.rail : null);
  useEffect(() => {
    if (railCache?.locale === locale) { setRail(railCache.rail); return; }
    let alive = true;
    fetch(`/api/feed/stories?locale=${locale}`).then((r) => (r.ok ? r.json() : null)).then((d: { rail?: RailGroup[] } | null) => {
      if (!alive || !d?.rail) return;
      railCache = { locale, rail: d.rail };
      setRail(d.rail);
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [locale]);
  return rail;
}

const hash = (s: string) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const BUBBLE_TONES: [string, string][] = [["#0c4a37", "#06221a"], ["#3a2f12", "#14110a"], ["#0f3f3a", "#061c19"], ["#13392b", "#071a13"], ["#33290f", "#120e06"], ["#24381c", "#0d160a"]];

export const Bubble = memo(function Bubble({ g, fresh, onOpen }: { g: RailGroup; fresh: boolean; onOpen: () => void }) {
  const tone = BUBBLE_TONES[hash(g.id) % BUBBLE_TONES.length];
  return (
    <button type="button" onClick={onOpen} aria-label={`${g.title}, ${g.ids.length}`} className="flex w-[78px] shrink-0 flex-col items-center gap-[5px] transition active:scale-[0.97]">
      <span className="block h-[72px] w-[72px] rounded-full p-[2px]" style={{ background: fresh ? GOLD_FRESH : "rgb(var(--line))" }}>
        <span className="block h-full w-full rounded-full bg-bg p-[2.5px]">
          <span className="grid h-full w-full place-items-center overflow-hidden rounded-full border" style={{ background: toneGradient(tone, 150), borderColor: "rgba(214,180,108,0.55)" }}>
            <span className="max-w-full truncate px-1.5 text-[20px] leading-10" style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif", color: "rgb(233,207,153)" }}>{g.arabic}</span>
          </span>
        </span>
      </span>
      <span className={`max-w-[76px] truncate text-[11px] font-medium tracking-[0.2px] ${fresh ? "" : "text-muted"}`}>{g.title}</span>
    </button>
  );
});

/** the rail: today's rings first, then the story circles (unseen ones first) */
export function StoriesRail({ onOpen }: { onOpen: (rail: RailGroup[], index: number) => void }) {
  const T = useFeedTexts();
  const locale = useLocale();
  const rail = useRail(locale);
  const seen = useStored<string[]>(SEEN_STORIES, []);
  const ordered = useMemo(() => {
    if (!rail) return null;
    const fresh = (g: RailGroup) => g.ids.some((id) => !seen.includes(id));
    return [...rail.filter(fresh), ...rail.filter((g) => !fresh(g))];
  }, [rail]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="fd-rail flex gap-3.5 overflow-x-auto px-3.5 py-1" role="list" aria-label={T.feed.stories}>
      <TodayRings />
      {ordered
        ? ordered.map((g, i) => <Bubble key={g.id} g={g} fresh={g.ids.some((id) => !seen.includes(id))} onOpen={() => onOpen(ordered, i)} />)
        : Array.from({ length: 6 }, (_, i) => <span key={i} aria-hidden className="fd-skel mx-[5px] block h-[68px] w-[68px] shrink-0 rounded-full" />)}
    </div>
  );
}

