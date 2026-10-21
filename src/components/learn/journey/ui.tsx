"use client";
// mirrors mobile/src/features/journey/ui.tsx: shared pieces of the long path on the website: the reminder of
// Quran 12:76 at every top of the path (fetched from the Quran API, never typed here) and the map of the Marāḥil as
// stations on a winding gold path over deep emerald (no last station). Seals live in ./Seal.tsx.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { getVerseByKey, type SingleVerse } from "@/lib/learn/quran";
import { useLang } from "@/lib/learn/i18n";
import { useJT } from "@/lib/learn/journey/texts";
import { star } from "./Seal";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

// ---------- Quran 12:76: above every possessor of knowledge is one more knowing ----------
const verseCache = new Map<string, SingleVerse>();
export function HorizonVerse({ onStage = false }: { onStage?: boolean }) {
  const { lang } = useLang();
  const jt = useJT();
  const [v, setV] = useState<SingleVerse | null>(null);
  useEffect(() => {
    if (verseCache.has(lang)) { setV(verseCache.get(lang)!); return; }
    let off = false;
    getVerseByKey("12:76", lang).then((x) => { verseCache.set(lang, x); if (!off) setV(x); }).catch(() => undefined);
    return () => { off = true; };
  }, [lang]);
  if (!v) return null;
  const translation = v.translation.replace(/<[^>]+>/g, "");
  return (
    <figure className={cx("grid gap-2 border-t pt-4", onStage ? "border-white/15" : "border-line")}>
      <figcaption className={cx("text-[12px] font-semibold tracking-[0.08em] rtl:tracking-normal", onStage ? "text-[rgb(var(--gold))]" : "text-[rgb(var(--hm-gold-d))]")}>{jt("horizon")}</figcaption>
      <blockquote className="grid gap-2">
        <p lang="ar" dir="rtl" className={cx("font-arabic text-end text-[22px] leading-[2]", onStage ? "text-white" : "")}>{v.text_uthmani}</p>
        {translation ? <p className={cx("text-[14.5px] leading-relaxed", onStage ? "text-white/70" : "text-muted")}>{translation}</p> : null}
      </blockquote>
      <p className={cx("text-[12px] font-medium", onStage ? "text-white/60" : "text-muted")}>{jt("quranRef", { k: "12:76" })}</p>
    </figure>
  );
}

// ---------- the map ----------
export type MapNode = { m: number; state: "done" | "current" | "ahead"; frac: number; title: string; sub: string };
const ROW = 104;

function useWidth<T extends HTMLElement>(fallback = 360) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => setW(Math.max(260, Math.round(el.clientWidth)));
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** the Marāḥil as stations on a winding gold path; the path never ends (dots after the last station) */
export function MarahilMap({ nodes, selected, onSelect }: { nodes: MapNode[]; selected: number; onSelect: (m: number) => void }) {
  const jt = useJT();
  const { rtl } = useLang();
  const [ref, width] = useWidth<HTMLDivElement>();
  const h = nodes.length * ROW + 70;
  // the winding line is mirrored for right-to-left reading
  const fx = (f: number) => (rtl ? 1 - f : f) * width;
  const xs = nodes.map((_, i) => fx(i % 4 === 0 ? 0.3 : i % 4 === 1 ? 0.62 : i % 4 === 2 ? 0.74 : 0.42));
  const ys = nodes.map((_, i) => 52 + i * ROW);
  const seg = (i: number) => `M${xs[i]},${ys[i]} C${xs[i]},${ys[i] + ROW * 0.55} ${xs[i + 1]},${ys[i + 1] - ROW * 0.55} ${xs[i + 1]},${ys[i + 1]}`;
  const lastX = xs[xs.length - 1] ?? width / 2, lastY = ys[ys.length - 1] ?? 52;
  const cols = Math.ceil(width / 64), rows = Math.ceil(h / 64);
  return (
    <div ref={ref} className="relative overflow-hidden rounded-2xl border border-[rgb(214_180_108/0.45)] bg-[#08261d]" style={{ height: h }}>
      <svg width={width} height={h} aria-hidden focusable="false" className="absolute inset-0">
        <defs>
          <linearGradient id="jbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c4a37" /><stop offset="1" stopColor="#051c15" /></linearGradient>
          <linearGradient id="jgold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e7bf" /><stop offset="0.5" stopColor="#d6b46c" /><stop offset="1" stopColor="#a9802f" /></linearGradient>
        </defs>
        <rect width={width} height={h} fill="url(#jbg)" />
        {/* a quiet lattice of eight-pointed stars */}
        {Array.from({ length: rows * cols }, (_, i) => { const c = i % cols, r = Math.floor(i / cols); return <path key={i} d={star(c * 64 + 32, r * 64 + 32, 7, 4)} fill="none" stroke="#d6b46c" strokeOpacity={0.07} strokeWidth={1} />; })}
        {nodes.slice(0, -1).map((n, i) => (
          <path key={`p${n.m}`} d={seg(i)} fill="none" stroke={n.state === "done" ? "url(#jgold)" : "rgba(214,180,108,0.45)"} strokeWidth={n.state === "done" ? 3 : 2} strokeDasharray={n.state === "done" ? undefined : "2 7"} strokeLinecap="round" />
        ))}
        {[0, 1, 2].map((k) => <circle key={`h${k}`} cx={lastX} cy={lastY + 30 + k * 12} r={2.2 - k * 0.5} fill="#d6b46c" opacity={0.6 - k * 0.18} />)}
        {nodes.map((n, i) => {
          const x = xs[i], y = ys[i], sel = n.m === selected;
          return (
            <g key={`n${n.m}`}>
              {sel ? <circle cx={x} cy={y} r={30} fill="rgba(214,180,108,0.12)" /> : null}
              <path d={`M${x - 15},${y - 15}h30v30h-30z`} fill={n.state === "done" ? "url(#jgold)" : "#08261d"} stroke="url(#jgold)" strokeWidth={1.5} />
              <path d={`M${x},${y - 21}L${x + 21},${y}L${x},${y + 21}L${x - 21},${y}Z`} fill={n.state === "done" ? "url(#jgold)" : "#08261d"} stroke="url(#jgold)" strokeWidth={1.5} />
              {n.state === "current" ? <circle cx={x} cy={y} r={27} fill="none" stroke="#e9cf99" strokeWidth={2.5} strokeLinecap="round" strokeDasharray={`${(Math.max(0.02, n.frac) * 169.6).toFixed(1)} 200`} transform={`rotate(-90 ${x} ${y})`} /> : null}
            </g>
          );
        })}
      </svg>
      <ol className="absolute inset-0 m-0 list-none p-0">
        {nodes.map((n, i) => {
          const left = xs[i] < width / 2;
          return (
            <li key={`l${n.m}`}>
              <button type="button" onClick={() => onSelect(n.m)} aria-pressed={n.m === selected} aria-label={`${n.title}. ${n.sub}`}
                className="absolute inset-x-0 h-[60px] rounded-lg text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e9cf99]" style={{ top: ys[i] - 30 }}>
                <span aria-hidden dir="ltr" className={cx("absolute top-[19px] w-[42px] text-center text-[15px] font-bold tabular-nums", n.state === "done" ? "text-[#08261d]" : "text-[#f3e2b6]")} style={{ left: xs[i] - 21 }}>{n.m}</span>
                <span aria-hidden className={cx("absolute top-[8px] grid gap-0.5", left ? "text-left" : "text-right")}
                  style={left ? { left: xs[i] + 36, right: 12 } : { right: width - xs[i] + 36, left: 12 }}>
                  <span className={cx("block truncate text-[14.5px] font-bold", n.state === "ahead" ? "text-white/70" : "text-white")}>{n.title}</span>
                  <span className={cx("line-clamp-2 block text-[12px] leading-snug", n.state === "current" ? "text-[#d6b46c]" : "text-white/55")}>{n.sub}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="absolute inset-x-0 text-center text-[13px] font-semibold text-[#d6b46c]" style={{ top: lastY + 62 }}>{jt("horizonOn")}</p>
    </div>
  );
}

/** a small square tile with a glyph (milestone rows, plan rows) */
export function Glyph({ ok = false }: { ok?: boolean }) {
  return (
    <span aria-hidden className={cx("grid h-9 w-9 place-items-center rounded-md", ok ? "bg-[rgb(201_166_94/0.18)] text-[rgb(var(--hm-gold-d))]" : "bg-accent-soft text-accent")}>
      {ok ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 100 100"><path d={star(50, 50, 44, 30)} fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" /></svg>
      )}
    </span>
  );
}

/** a chip (portion sizes, verse ranges, Hijri years) */
export function Chip({ children, selected = false, onClick, href, onStage = false, label }: { children: React.ReactNode; selected?: boolean; onClick?: () => void; href?: string; onStage?: boolean; label?: string }) {
  const cls = cx("inline-flex min-h-9 items-center rounded-full border px-3.5 text-[13.5px] font-semibold tabular-nums transition",
    onStage
      ? selected ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))] text-[#08261d]" : "border-[rgb(var(--gold))]/40 text-white hover:border-[rgb(var(--gold))]"
      : selected ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/15 text-[rgb(var(--hm-gold-d))]" : "border-line hover:border-[rgb(var(--hm-gold))]/70");
  if (href) return <Link href={href} className={cls} aria-label={label}>{children}</Link>;
  return <button type="button" onClick={onClick} aria-pressed={selected} aria-label={label} className={cls}>{children}</button>;
}
