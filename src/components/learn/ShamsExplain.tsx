"use client";
// "Why it works": four small animated scales for the Shams Method (classic, 2.0 and 3.0) – spacing flattens the
// forgetting curve, the seven-step loop, 2.0's adaptive difficulty and 3.0's three pillars. Plain SVG + CSS, plays once
// when scrolled into view; with prefers-reduced-motion everything is shown in its final state without movement.
// Claims stay general (spacing effect, retrieval practice, dual coding); the charts are schematic, never measured data.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CSS = `
.sx-anim .sx-draw{stroke-dasharray:1;stroke-dashoffset:1}
.sx-play .sx-draw{animation:sx-draw 1.4s ease-out forwards;animation-delay:var(--d,0s)}
.sx-anim .sx-pop{opacity:0;transform:scale(.6);transform-box:fill-box;transform-origin:center}
.sx-play .sx-pop{animation:sx-pop .5s ease-out forwards;animation-delay:var(--d,0s)}
.sx-anim .sx-fade{opacity:0}
.sx-play .sx-fade{animation:sx-fade .7s ease-out forwards;animation-delay:var(--d,0s)}
.sx-play .sx-orbit{animation:sx-spin 14s linear infinite;transform-origin:150px 150px}
.sx-play .sx-lit{animation:sx-lit 14s linear infinite;animation-delay:var(--d,0s)}
.sx-play .sx-seek{animation:sx-seek 4.5s ease-in-out forwards}
.sx-play .sx-grow{animation:sx-grow 1s ease-out forwards;animation-delay:var(--d,0s);transform-box:fill-box;transform-origin:left center}
.sx-anim .sx-grow{transform:scaleX(0)}
@keyframes sx-draw{to{stroke-dashoffset:0}}
@keyframes sx-pop{to{opacity:1;transform:scale(1)}}
@keyframes sx-fade{to{opacity:1}}
@keyframes sx-spin{to{transform:rotate(360deg)}}
@keyframes sx-lit{0%,10%{fill-opacity:1}14%,100%{fill-opacity:.18}}
@keyframes sx-seek{0%{transform:translateX(0)}25%{transform:translateX(330px)}50%{transform:translateX(60px)}75%{transform:translateX(230px)}100%{transform:translateX(180px)}}
@keyframes sx-grow{to{transform:scaleX(1)}}
@media (prefers-reduced-motion:reduce){
  .sx-anim .sx-draw{stroke-dashoffset:0}.sx-anim .sx-pop,.sx-anim .sx-fade{opacity:1;transform:none}
  .sx-anim .sx-grow{transform:none}.sx-play *{animation:none!important}.sx-seek{transform:translateX(180px)}
}`;

function usePlay<T extends Element>() {
  const ref = useRef<T>(null);
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setPlay(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setPlay(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, play] as const;
}

function Card({ title, text, children, tag }: { title: string; text: string; children: ReactNode; tag?: string }) {
  const [ref, play] = usePlay<HTMLDivElement>();
  return (
    <figure ref={ref} className={`sx-anim ${play ? "sx-play" : ""} grid min-w-0 gap-3 rounded-2xl border border-line bg-surface p-5 sm:p-6`}>
      <div dir="ltr" className="text-[rgb(var(--isl-head,var(--ink)))]">{children}</div>
      <figcaption>
        {tag && <span className="mb-2 inline-block rounded-full border border-[rgb(var(--gold)/0.6)] px-2.5 py-0.5 text-[11px] font-bold text-[rgb(var(--gold))]">{tag}</span>}
        <h3 className="font-display text-[22px] leading-tight">{title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
      </figcaption>
    </figure>
  );
}

// spacing vs cramming (everything on day 0, then nothing): retention drops after each review, but every review makes the next drop flatter (schematic)
function SpacingCurve({ review, day, none, withR }: { review: string; day: string; none: string; withR: string }) {
  const reviews = [0, 1, 3, 7, 14, 30];
  const X = (d: number) => 30 + (d / 34) * 300, Y = (r: number) => 20 + (1 - r) * 150;
  let path = "";
  for (let i = 0; i < reviews.length; i++) {
    const a = reviews[i], b = reviews[i + 1] ?? 34, s = 1.2 * Math.pow(2.3, i);
    for (let d = a; d <= b + 0.001; d += 0.25) path += `${path ? "L" : "M"}${X(d).toFixed(1)},${Y(Math.exp(-(d - a) / s)).toFixed(1)} `;
  }
  let flat = "";
  for (let d = 0; d <= 34; d += 0.25) flat += `${flat ? "L" : "M"}${X(d).toFixed(1)},${Y(0.18 + 0.82 * Math.exp(-d / 1.8)).toFixed(1)} `;
  return (
    <svg viewBox="0 0 340 200" className="w-full" role="img" aria-label={`${withR} / ${none}`}>
      <line x1="30" y1="170" x2="332" y2="170" stroke="currentColor" strokeOpacity=".25" />
      <line x1="30" y1="14" x2="30" y2="170" stroke="currentColor" strokeOpacity=".25" />
      <path d={flat} pathLength={1} className="sx-draw" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="1" />
      <path d={path} pathLength={1} className="sx-draw" style={{ ["--d" as string]: ".3s" }} fill="none" stroke="rgb(var(--gold))" strokeWidth="2.5" strokeLinejoin="round" />
      {reviews.slice(1).map((d, i) => (
        <g key={d} className="sx-pop" style={{ ["--d" as string]: `${0.5 + i * 0.22}s` }}>
          <circle cx={X(d)} cy={Y(1)} r="4.5" fill="rgb(var(--gold))" />
          <text x={X(d)} y="186" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity=".6">{d}</text>
        </g>
      ))}
      <text x="332" y="198" textAnchor="end" fontSize="10" fill="currentColor" fillOpacity=".55">{day}</text>
      <g fontSize="10.5"><circle cx="210" cy="24" r="4" fill="rgb(var(--gold))" /><text x="219" y="28" fill="currentColor">{review}</text>
        <line x1="205" y1="42" x2="216" y2="42" stroke="currentColor" strokeOpacity=".4" strokeDasharray="2 2" /><text x="219" y="45" fill="currentColor" fillOpacity=".7">{none}</text></g>
    </svg>
  );
}

// seven steps as one loop; a light travels around and lights each step in turn
function StepLoop({ steps }: { steps: string[] }) {
  const n = steps.length, R = 108;
  const P = (i: number) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return [150 + R * Math.cos(a), 150 + R * Math.sin(a)] as const; };
  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[320px]" role="img" aria-label={steps.join(" → ")}>
      <circle cx="150" cy="150" r={R} fill="none" stroke="rgb(var(--gold))" strokeOpacity=".35" strokeWidth="2" strokeDasharray="3 5" />
      <g className="sx-orbit"><circle cx="150" cy={150 - R} r="6" fill="rgb(var(--gold))" /></g>
      {steps.map((s, i) => {
        const [x, y] = P(i);
        return (
          <g key={s} className="sx-pop" style={{ ["--d" as string]: `${i * 0.12}s` }}>
            <circle cx={x} cy={y} r="17" className="sx-lit" style={{ ["--d" as string]: `${(i / n) * 14}s` }} fill="rgb(var(--gold))" fillOpacity=".18" stroke="rgb(var(--gold))" />
            <text x={x} y={y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">{i + 1}</text>
            <text x={x} y={y + (y > 150 ? 32 : -24)} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity=".8">{s}</text>
          </g>
        );
      })}
      <text x="150" y="155" textAnchor="middle" fontSize="20" fill="rgb(var(--gold))" className="font-arabic">شَمْس</text>
    </svg>
  );
}

// 2.0: difficulty scale with the learning zone; the marker overshoots both ways and settles in the zone,
// below it the review gaps grow for verses you master
function Adaptive({ easy, hard, zone }: { easy: string; hard: string; zone: string }) {
  const gaps = [1, 3, 7, 14, 30];
  return (
    <svg viewBox="0 0 400 190" className="w-full" role="img" aria-label={`${easy} – ${zone} – ${hard}`}>
      <defs><linearGradient id="sx-scale" x1="0" x2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".12" /><stop offset=".5" stopColor="rgb(var(--gold))" stopOpacity=".55" /><stop offset="1" stopColor="currentColor" stopOpacity=".12" /></linearGradient></defs>
      <rect x="20" y="30" width="360" height="16" rx="8" fill="url(#sx-scale)" />
      <rect x="160" y="26" width="120" height="24" rx="12" fill="none" stroke="rgb(var(--gold))" strokeWidth="1.5" />
      <text x="20" y="66" fontSize="11" fill="currentColor" fillOpacity=".6">{easy}</text>
      <text x="380" y="66" textAnchor="end" fontSize="11" fill="currentColor" fillOpacity=".6">{hard}</text>
      <text x="220" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="rgb(var(--gold))">{zone}</text>
      <g className="sx-seek" style={{ transform: "translateX(180px)" }}><path d="M40 52 l-7 12 h14 z" fill="rgb(var(--gold))" /></g>
      {gaps.map((g, i) => (
        <g key={g}>
          <rect x="20" y={90 + i * 18} width={(Math.log2(g + 1) / Math.log2(31)) * 330} height="10" rx="5" className="sx-grow" style={{ ["--d" as string]: `${0.4 + i * 0.18}s` }} fill="rgb(var(--gold))" fillOpacity={0.3 + i * 0.15} />
          <text x={28 + (Math.log2(g + 1) / Math.log2(31)) * 330} y={99 + i * 18} fontSize="10" fill="currentColor" fillOpacity=".65" className="sx-fade" style={{ ["--d" as string]: `${0.8 + i * 0.18}s` }}>{g}</text>
        </g>
      ))}
    </svg>
  );
}

// 3.0: adab, recitation and understanding overlap; the reciter grows where all three meet
function Pillars({ a, r, u }: { a: string; r: string; u: string }) {
  const C = [[150, 95, a], [112, 160, r], [188, 160, u]] as const;
  return (
    <svg viewBox="0 0 300 250" className="mx-auto w-full max-w-[320px]" role="img" aria-label={`${a} · ${r} · ${u}`}>
      {C.map(([x, y, l], i) => (
        <g key={l} className="sx-pop" style={{ ["--d" as string]: `${i * 0.35}s` }}>
          <circle cx={x} cy={y} r="62" fill="rgb(var(--gold))" fillOpacity=".14" stroke="rgb(var(--gold))" strokeWidth="1.5" />
          <text x={x + (i === 0 ? 0 : i === 1 ? -24 : 24)} y={y + (i === 0 ? -26 : 34)} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">{l}</text>
        </g>
      ))}
      <g className="sx-pop" style={{ ["--d" as string]: "1.2s" }}><circle cx="150" cy="138" r="16" fill="rgb(var(--gold))" /><text x="150" y="143" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1a1408">3.0</text></g>
    </svg>
  );
}

export default function ShamsExplain({ className = "", only }: { className?: string; only?: "v2" | "v3" }) {
  const t = useTranslations("shamsWhy");
  const steps = [1, 2, 3, 4, 5, 6, 7].map((i) => t(`step${i}`));
  return (
    <section aria-labelledby="shams-why-title" className={className}>
      <style>{CSS}</style>
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("kicker")}</p>
      <h2 id="shams-why-title" className="font-display mt-3 text-3xl leading-[1.1] sm:text-[40px]">{t("title")}</h2>
      <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-muted">{t("lead")}</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {only !== "v3" && <Card title={t("curveTitle")} text={t("curveText")}><SpacingCurve review={t("review")} day={t("days")} none={t("cram")} withR={t("withReview")} /></Card>}
        {!only && <Card title={t("loopTitle")} text={t("loopText")}><StepLoop steps={steps} /></Card>}
        {only !== "v3" && <Card tag="Shams 2.0" title={t("adaptTitle")} text={t("adaptText")}><Adaptive easy={t("easy")} hard={t("hard")} zone={t("zone")} /></Card>}
        <Card tag="Shams 3.0" title={t("pillarsTitle")} text={t("pillarsText")}><Pillars a={t("pAdab")} r={t("pRecite")} u={t("pUnderstand")} /></Card>
      </div>
      <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted">{t("note")}</p>
    </section>
  );
}

/** the promotion block for public pages (home, /how, courses, surahs): 3.0 recommended, 2.0, link to the chooser */
export function ShamsPromo({ className = "", compact }: { className?: string; compact?: boolean }) {
  const t = useTranslations("shamsWhy");
  return (
    <section className={`stage girih overflow-hidden rounded-2xl border border-[rgb(var(--gold))] p-5 text-white sm:p-8 ${className}`}>
      <div className={`grid gap-6 ${compact ? "" : "md:grid-cols-[1.2fr_0.8fr] md:items-center"} [&>*]:min-w-0`}>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("promoKicker")}</p>
          <h2 className="font-display mt-3 text-[28px] leading-[1.1] sm:text-4xl">{t("promoTitle")}</h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80">{t("promoText")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shams#shams-versions-title" className="btn-gold inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold">{t("promoV3")}</Link>
            <Link href="/shams/method" className="inline-flex h-11 items-center rounded-full border border-[rgb(233_207_153)]/50 px-5 text-[15px] font-bold text-white/90 hover:border-[rgb(233_207_153)]">{t("promoV2")}</Link>
            <Link href="/shams" className="inline-flex h-11 items-center px-1 text-[15px] font-semibold text-[rgb(233_207_153)] underline-offset-4 hover:underline">{t("promoChoose")}</Link>
          </div>
          <p className="mt-4 text-[13px] text-white/60">{t("promoTutor")}</p>
        </div>
        {!compact && (
          <ul className="grid gap-2.5 text-[15px]">
            {(["promoP1", "promoP2", "promoP3"] as const).map((k) => <li key={k} className="flex gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-white/85"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[rgb(var(--gold))]" />{t(k)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
