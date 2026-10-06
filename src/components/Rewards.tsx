"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LOUD, addActiveMinute, levelOf, totalPoints, type PointKind } from "@/lib/points";
import { buildCtx, earnedIds, markSeen, readSeen, stickerById } from "@/lib/stickers";
import { getSnapshot as verseSnapshot } from "@/lib/versePlayback";
import { readJSON, writeJSON } from "@/lib/storage";
import Sticker from "./Sticker";

type Moment = { kind: "sticker"; id: string } | { kind: "level"; n: number };

// Counts active time on the site, shows "+n" for earned points and celebrates new stickers and levels
export default function Rewards() {
  const t = useTranslations("rewards");
  const locale = useLocale();
  const [gain, setGain] = useState<{ pts: number; kind: PointKind; key: number } | null>(null);
  const [queue, setQueue] = useState<Moment[]>([]);
  const lastInput = useRef(Date.now());
  const media = useRef(new Set<EventTarget>());
  const check = useRef<ReturnType<typeof setTimeout> | null>(null);

  // active time: the tab is visible and the learner did something in the last 90 seconds, or recitation/radio is playing
  useEffect(() => {
    const touch = () => { lastInput.current = Date.now(); };
    const evs = ["pointerdown", "keydown", "scroll", "touchstart", "wheel"] as const;
    evs.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const onPlay = (e: Event) => media.current.add(e.target!);
    const onStop = (e: Event) => media.current.delete(e.target!);
    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onStop, true);
    document.addEventListener("ended", onStop, true);
    let acc = 0;
    const iv = setInterval(() => {
      const playing = verseSnapshot().playing || media.current.size > 0;
      if (document.visibilityState !== "visible" && !playing) return;
      if (!playing && Date.now() - lastInput.current > 90_000) return;
      acc += 15;
      if (acc >= 60) { acc -= 60; addActiveMinute(); }
    }, 15_000);
    return () => {
      evs.forEach((e) => window.removeEventListener(e, touch));
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onStop, true);
      document.removeEventListener("ended", onStop, true);
      clearInterval(iv);
    };
  }, []);

  // new stickers and levels; on the very first run everything already earned is taken as seen (no flood of celebrations)
  useEffect(() => {
    const run = () => {
      const ctx = buildCtx();
      const earned = earnedIds(ctx);
      const first = readJSON<string[] | null>("tf:stickers", null) === null;
      const seen = new Set(readSeen());
      const fresh = first ? [] : earned.filter((id) => !seen.has(id));
      markSeen(earned);
      const lvl = levelOf(totalPoints()).n;
      const prevLvl = readJSON<number>("tf:level", 0);
      if (prevLvl !== lvl) writeJSON("tf:level", lvl, true);
      const moments: Moment[] = fresh.map((id) => ({ kind: "sticker" as const, id }));
      if (prevLvl > 0 && lvl > prevLvl) moments.unshift({ kind: "level", n: lvl });
      if (moments.length) setQueue((q) => [...q, ...moments]);
    };
    const later = () => { if (check.current) clearTimeout(check.current); check.current = setTimeout(run, 900); };
    const onPts = (e: Event) => {
      const d = (e as CustomEvent<{ pts: number; kind: PointKind }>).detail;
      if (LOUD.includes(d.kind)) setGain((g) => ({ pts: (g && Date.now() - g.key < 1600 ? g.pts : 0) + d.pts, kind: d.kind, key: Date.now() }));
      later();
    };
    window.addEventListener("tf-points", onPts);
    window.addEventListener("tf-synced", later);
    run();
    return () => { window.removeEventListener("tf-points", onPts); window.removeEventListener("tf-synced", later); };
  }, []);

  useEffect(() => {
    if (!gain) return;
    const id = setTimeout(() => setGain(null), 1800);
    return () => clearTimeout(id);
  }, [gain]);

  const m = queue[0];
  const close = () => setQueue((q) => q.slice(1));
  const def = m?.kind === "sticker" ? stickerById(m.id) : undefined;

  return (
    <>
      {gain && (
        <div key={gain.key} role="status" className="points-pop pointer-events-none fixed inset-x-0 top-[72px] z-[70] flex justify-center">
          <span className="rounded-full border border-[rgb(var(--gold))]/50 bg-[rgb(var(--stage))] px-4 py-1.5 text-sm font-bold text-[rgb(var(--gold))] shadow-lg">+{gain.pts} {t("pts")} · {t(`k_${gain.kind}`)}</span>
        </div>
      )}
      {m && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={close}>
          <div className="stage girih relative w-full max-w-sm overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/30 p-7 text-center text-[#eef0f3]" onClick={(e) => e.stopPropagation()}>
            <div className="sticker-rays pointer-events-none absolute left-1/2 top-[110px] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2" aria-hidden />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">{m.kind === "level" ? t("newLevel") : t("newSticker")}</p>
            <div className="sticker-pop relative mx-auto mt-4 grid place-items-center">
              {def ? <Sticker def={def} size={148} /> : <LevelSeal n={m.kind === "level" ? m.n : 1} />}
            </div>
            {m.kind === "level" ? (
              <>
                <p className="font-callig relative mt-4 text-4xl text-[rgb(var(--gold))]" dir="rtl" lang="ar">{levelOf(totalPoints()).ar}</p>
                {locale !== "ar" && <h2 className="relative mt-1 text-2xl font-bold">{t(`l${m.n}`)}</h2>}
                <p className="relative mt-2 text-sm leading-relaxed text-white/70">{t("levelBody", { n: m.n })}</p>
              </>
            ) : def && (
              <>
                <p className="font-callig relative mt-4 text-4xl text-[rgb(var(--gold))]" dir="rtl" lang="ar">{def.ar}</p>
                {locale !== "ar" && <h2 className="relative mt-1 text-2xl font-bold">{t(`s_${def.id}`)}</h2>}
                <p className="relative mt-2 text-sm leading-relaxed text-white/70">{t(`d_${def.id}`)}</p>
                {def.verse && <p className="relative mt-4 font-arabic text-xl leading-loose text-white/90" dir="rtl" lang="ar">{def.verse} <span className="text-xs text-white/50">({def.ref})</span></p>}
              </>
            )}
            <div className="relative mt-6 flex justify-center gap-2">
              <Link href="/stats" onClick={close} className="inline-flex h-11 items-center rounded-md btn-gold px-5 text-sm font-bold">{t("seeAll")}</Link>
              <button onClick={close} className="h-11 rounded-md border border-white/25 px-5 text-sm font-bold hover:border-white">{t("continue")}</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// level seal: a gilded rosette with the level number in Kufic numerals style
export function LevelSeal({ n, size = 148 }: { n: number; size?: number }) {
  const pts = Array.from({ length: 24 }, (_, i) => { const a = (Math.PI / 12) * i - Math.PI / 2, r = i % 2 ? 40 : 49; return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`; });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="drop-shadow-[0_6px_14px_rgba(0,0,0,.3)]">
      <defs><linearGradient id="lvl-m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e7bf" /><stop offset=".45" stopColor="#c9a65e" /><stop offset=".7" stopColor="#efe2bf" /><stop offset="1" stopColor="#8f7238" /></linearGradient></defs>
      <path d={`M${pts.join("L")}Z`} fill="url(#lvl-m)" />
      <circle cx="50" cy="50" r="35" fill="#0f2d20" stroke="#5c4519" strokeOpacity=".5" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#f3e2b6" strokeOpacity=".35" strokeDasharray="1 2.6" />
      <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="700" fill="#f3e2b6" className="font-display">{n}</text>
    </svg>
  );
}
