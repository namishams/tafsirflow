// mirrors mobile/src/features/feed/Sticker.tsx (StickerArt) and the Seal of mobile/src/features/journey/ui.tsx: the
// collectible seals drawn 1:1 as DOM SVG (frozen look, BLUEPRINT §8: same shapes, motifs, tones, foil and cartouche).
// A seal struck in gold: foil rim with an engraved inner line, an enamel field in the tone, the motif embossed (a dark
// shadow under the motif) and the milestone on a pointed gold cartouche. Mythic seals carry the mother-of-pearl sheen
// of the app; the app's one-time light sweep is left out on the website (no decorative animation).
import { memo, useId } from "react";
import type { Motif, Shape, StickerDef, Tone } from "@/lib/learn/feed/gamify";
import type { JDef } from "@/lib/learn/journey/stickers";

const TONES: Record<Tone, { bg: [string, string]; rim: string; ink: string; ribbon: string; ribbonInk: string }> = {
  emerald: { bg: ["#1d6b52", "#0b3d2e"], rim: "#c6a65e", ink: "#f3e2b6", ribbon: "#c6a65e", ribbonInk: "#0b3d2e" },
  gold: { bg: ["#e3c98a", "#a07a32"], rim: "#f8ecc8", ink: "#0b3d2e", ribbon: "#0b3d2e", ribbonInk: "#f3e2b6" },
  night: { bg: ["#14523f", "#072a20"], rim: "#c6a65e", ink: "#f3e2b6", ribbon: "#c6a65e", ribbonInk: "#1f473b" },
  rare: { bg: ["#5a4518", "#241a08"], rim: "#f3e2b6", ink: "#f8ecc8", ribbon: "#f3e2b6", ribbonInk: "#473a1f" },
};
const LOCKED = { bg: ["#7d8582", "#4a524f"] as [string, string], rim: "#a3aba8", ink: "#d9dedc", ribbon: "#a3aba8", ribbonInk: "#3a413e" };

export const star = (cx: number, cy: number, r1: number, r2: number, pts = 8) =>
  `M${Array.from({ length: pts * 2 }, (_, i) => { const a = (i * Math.PI) / pts - Math.PI / 2; const r = i % 2 ? r2 : r1; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join("L")}Z`;
const poly = (cx: number, cy: number, r: number, n: number, rot = 0) =>
  `M${Array.from({ length: n }, (_, i) => { const a = (i * 2 * Math.PI) / n + rot; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join("L")}Z`;
const scallop = (cx: number, cy: number, r: number, n: number) => {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = (i * 2 * Math.PI) / n, a1 = ((i + 1) * 2 * Math.PI) / n, am = (a0 + a1) / 2;
    const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)], c = [cx + (r + 7) * Math.cos(am), cy + (r + 7) * Math.sin(am)];
    d += `${i ? "" : `M${p0[0].toFixed(1)},${p0[1].toFixed(1)}`}Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
  }
  return `${d}Z`;
};
const SHAPES: Record<Shape, string> = {
  circle: "M50,6A44,44 0 1 1 49.9,6Z",
  star: star(50, 50, 46, 38),
  arch: "M10,94V44A40,40 0 0 1 90,44V94Z",
  hex: poly(50, 50, 46, 6, Math.PI / 6),
  rosette: scallop(50, 50, 39, 12),
};
const INNER: Record<Shape, string> = {
  circle: "M50,13A37,37 0 1 1 49.9,13Z",
  star: star(50, 50, 39, 32),
  arch: "M17,88V45A33,33 0 0 1 83,45V88Z",
  hex: poly(50, 50, 39, 6, Math.PI / 6),
  rosette: "M50,15A35,35 0 1 1 49.9,15Z",
};

function MotifArt({ m, c }: { m: Motif; c: string }) {
  const s = { fill: "none", stroke: c, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (m) {
    case "book": return <g {...s}><path d="M28,38Q39,33 50,39Q61,33 72,38V62Q61,57 50,63Q39,57 28,62Z" /><path d="M50,39V63" /></g>;
    case "wave": return <g {...s}>{[30, 40, 50, 60, 70].map((x, i) => <path key={x} d={`M${x},${50 - [6, 12, 18, 12, 6][i]}V${50 + [6, 12, 18, 12, 6][i]}`} strokeWidth={4} />)}</g>;
    case "word": return <g {...s}><path d="M30,34H70Q74,34 74,38V54Q74,58 70,58H48L40,66V58H30Q26,58 26,54V38Q26,34 30,34Z" /><path d="M36,46H64" /></g>;
    case "check": return <g {...s}><circle cx={50} cy={50} r={20} /><path d="M40,50L47,57L61,43" strokeWidth={4} /></g>;
    case "plane": return <g {...s}><path d="M26,50L74,30L62,72L50,56Z" /><path d="M50,56L74,30" /></g>;
    case "flame": return <path d="M50,28C59,38 66,46 63,57C60,68 40,68 37,57C35,49 43,45 46,36C48,43 53,45 50,28Z" fill={c} />;
    case "chevrons": return <g {...s} strokeWidth={4}><path d="M36,64L50,52L64,64" /><path d="M36,52L50,40L64,52" /><path d="M36,40L50,28L64,40" /></g>;
    case "target": return <g {...s}><circle cx={50} cy={50} r={20} /><circle cx={50} cy={50} r={11} /><circle cx={50} cy={50} r={3} fill={c} /></g>;
    case "crescent": return <g><path d="M58,28A22,22 0 1 0 58,72A17,17 0 1 1 58,28Z" fill={c} /><path d={star(66, 40, 5, 2, 5)} fill={c} /></g>;
    case "star8": return <g><path d={star(50, 50, 22, 15)} fill="none" stroke={c} strokeWidth={3} /><path d={star(50, 50, 9, 5)} fill={c} /></g>;
    case "lantern": return <g {...s}><path d="M50,24V30" /><path d="M42,30H58L62,38H38Z" /><path d="M40,38Q36,52 42,66H58Q64,52 60,38" /><path d="M44,66V71H56V66" /><path d="M50,44V60" /></g>;
    case "palm": return <g {...s}><path d="M50,74Q48,58 50,40" strokeWidth={4} /><path d="M50,40Q38,30 26,38" /><path d="M50,40Q62,30 74,38" /><path d="M50,40Q40,40 32,52" /><path d="M50,40Q60,40 68,52" /><path d="M50,40Q50,30 46,24" /><circle cx={46} cy={46} r={2.5} fill={c} /><circle cx={54} cy={46} r={2.5} fill={c} /></g>;
    case "dome": return <g {...s}><path d="M30,68H70" /><path d="M34,68V56H66V68" /><path d="M36,56Q36,38 50,34Q64,38 64,56" /><path d="M50,34V27" /><path d="M74,68V36" /><path d="M72,36L74,30L76,36" /><path d="M46,68V60Q50,56 54,60V68" /></g>;
    case "arch": return <g {...s}><path d="M32,70V48Q32,30 50,28Q68,30 68,48V70" /><path d="M38,70V50Q38,38 50,36Q62,38 62,50V70" /><path d="M28,70H72" /></g>;
    case "dove": return <g {...s}><path d="M28,54Q38,44 52,48Q60,38 72,36Q66,44 66,50Q62,62 46,62Q36,62 28,54Z" /><path d="M52,48Q48,56 40,56" /><circle cx={64} cy={42} r={1.6} fill={c} /><path d="M72,40L78,42L72,44" /></g>;
    case "rose": return <g {...s}><circle cx={50} cy={46} r={14} /><path d="M50,32Q58,40 50,46Q42,40 50,32" /><path d="M36,46Q46,50 50,46Q54,50 64,46" /><path d="M50,60V74" /><path d="M50,68Q42,64 38,68" /></g>;
    case "pen": return <g {...s}><path d="M34,68L62,30L70,36L42,74Z" /><path d="M34,68L32,76L42,74" /><path d="M58,34L66,40" /></g>;
    case "scroll": return <g {...s}><rect x={32} y={32} width={36} height={36} rx={3} /><path d="M28,32Q28,26 34,26H72Q66,26 66,32" /><path d="M38,42H62M38,50H62M38,58H54" /></g>;
    case "sunrise": return <g {...s}><path d="M32,58A18,18 0 0 1 68,58" /><path d="M26,58H74M32,66H68" /><path d="M50,30V36M34,38L38,42M66,38L62,42" /></g>;
    case "night": return <g><path d="M56,30A20,20 0 1 0 64,64A16,16 0 1 1 56,30Z" fill={c} /><path d={star(68, 34, 4, 1.6, 4)} fill={c} /><path d={star(36, 30, 3, 1.2, 4)} fill={c} /><path d={star(72, 52, 3, 1.2, 4)} fill={c} /></g>;
    case "hourglass": return <g {...s}><path d="M36,28H64M36,72H64" /><path d="M38,28Q38,44 50,50Q62,44 62,28" /><path d="M38,72Q38,56 50,50Q62,56 62,72" /><path d="M44,66H56" strokeWidth={4} /></g>;
    case "drop": return <g {...s}><path d="M38,62Q34,44 44,36Q48,44 46,52" /><path d="M62,62Q66,44 56,36Q52,44 54,52" /><path d="M38,62Q50,70 62,62" /><circle cx={50} cy={30} r={3} fill={c} /></g>;
    case "mat": return <g {...s}><rect x={32} y={26} width={36} height={50} rx={3} /><path d="M38,48Q38,34 50,32Q62,34 62,48V70H38Z" /><path d="M32,72H68" /></g>;
    case "heart": return <g {...s}><path d="M50,70Q30,56 30,44Q30,34 40,34Q47,34 50,41Q53,34 60,34Q70,34 70,44Q70,56 50,70Z" /><path d={star(50, 50, 6, 3, 4)} fill={c} /></g>;
    case "calendar": return <g {...s}><rect x={28} y={32} width={44} height={38} rx={5} /><path d="M28,44H72M38,26V36M62,26V36" /><path d={star(50, 57, 7, 3.5, 5)} fill={c} /></g>;
    default: return null;
  }
}

const FOIL = ["#f6e7bf", "#d6b46c", "#a9802f", "#ecd7a2", "#8a6a2c"];
const FOIL_LOCKED = ["#d9dedc", "#a3aba8", "#7d8582", "#c4cac7", "#6d7572"];

/** the sticker art of the feed album, 1:1 with the app (decorative: labels belong to the surrounding element) */
export const StickerArt = memo(function StickerArt({ def, size = 88, locked = false }: { def: StickerDef; size?: number; locked?: boolean }) {
  const t = locked ? LOCKED : TONES[def.tone];
  const foil = locked ? FOIL_LOCKED : FOIL;
  const id = `g${useId().replace(/[^A-Za-z0-9_-]/g, "")}${locked ? "l" : ""}`;
  const label = def.n !== undefined ? String(def.n) : def.fam === "names99" ? "99" : def.fam === "names33" ? "33" : "";
  const motif = label ? "translate(50 44) scale(0.85) translate(-50 -50)" : undefined;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false" className="block">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t.bg[0]} /><stop offset="1" stopColor={t.bg[1]} /></linearGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">{foil.map((c, i) => <stop key={c} offset={i / (foil.length - 1)} stopColor={c} />)}</linearGradient>
      </defs>
      <path d={SHAPES[def.shape]} fill={`url(#${id}f)`} />
      <path d={SHAPES[def.shape]} fill="none" stroke="#5c4519" strokeOpacity={0.45} strokeWidth={0.6} transform="translate(50 50) scale(0.955) translate(-50 -50)" />
      <path d={SHAPES[def.shape]} fill={`url(#${id})`} transform="translate(50 50) scale(0.91) translate(-50 -50)" />
      <path d={INNER[def.shape]} fill="none" stroke={`url(#${id}f)`} strokeWidth={0.8} opacity={0.75} />
      <g transform={motif}>
        <g transform="translate(0.8 1.1)" opacity={0.35}><MotifArt m={def.motif} c="#000" /></g>
        <MotifArt m={def.motif} c={t.ink} />
      </g>
      {def.rare && !locked ? [[50, 9], [91, 50], [50, 91], [9, 50]].map(([x, y]) => <path key={`${x}-${y}`} d={star(x, y, 3.2, 1.1, 4)} fill="#fff6dc" opacity={0.9} />) : null}
      <path d="M22 34a32 32 0 0 1 30-18" stroke="#fff" strokeOpacity={0.18} strokeWidth={2} fill="none" strokeLinecap="round" />
      {label ? (
        <g>
          <path d="M30,77.5L35,70H65L70,77.5L65,85H35Z" fill={`url(#${id}f)`} />
          <path d="M32.5,77.5L36.2,72H63.8L67.5,77.5L63.8,83H36.2Z" fill="none" stroke="#5c4519" strokeOpacity={0.5} strokeWidth={0.5} />
          <text x={50} y={81.6} fontSize={label.length > 3 ? 9.5 : 11} fontWeight="700" letterSpacing={0.6} fill={locked ? "#3a413e" : "#3d2a0b"} textAnchor="middle" direction="ltr" fontFamily="system-ui, sans-serif">{label}</text>
        </g>
      ) : null}
    </svg>
  );
});

// ---------- the seal of the long path (mythic sheen, progress ring on locked seals) ----------
const MYTHIC_SHAPE = star(50, 50, 46, 38);
/** mother-of-pearl over gold: emerald, pearl and gold, like the inlay of a mushaf binding */
const PEARL = ["#fff6dc", "#bfe3d0", "#f3e2b6", "#9fd6c1", "#f8ecc8", "#d6b46c"];

function MythicSheen({ size }: { size: number }) {
  const id = `m${useId().replace(/[^A-Za-z0-9_-]/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false" className="pointer-events-none absolute inset-0">
      <defs>
        <clipPath id={`${id}c`}><path d={MYTHIC_SHAPE} /></clipPath>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="1" y2="1">{PEARL.map((c, i) => <stop key={c + i} offset={i / (PEARL.length - 1)} stopColor={c} />)}</linearGradient>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width={100} height={100} fill={`url(#${id}p)`} opacity={0.28} />
        {[[50, 4], [96, 50], [50, 96], [4, 50], [18, 18], [82, 18], [82, 82], [18, 82]].map(([cx, cy]) => <path key={`${cx}-${cy}`} d={star(cx, cy, 3.4, 1.2, 4)} fill="#fffaf0" opacity={0.95} />)}
      </g>
      <path d={MYTHIC_SHAPE} fill="none" stroke="#fff6dc" strokeOpacity={0.7} strokeWidth={1.2} />
    </svg>
  );
}

export const Seal = memo(function Seal({ def, size = 76, locked = false, pct = 0 }: { def: JDef | StickerDef; size?: number; locked?: boolean; pct?: number }) {
  const mythic = "mythic" in def && def.mythic;
  return (
    <span aria-hidden className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <span className="block" style={locked ? { opacity: 0.45 } : undefined}><StickerArt def={def} size={size} locked={locked} /></span>
      {mythic && !locked ? <MythicSheen size={size} /> : null}
      {locked && pct > 0 ? (
        <svg width={size} height={size} viewBox="0 0 100 100" focusable="false" className="pointer-events-none absolute inset-0">
          <circle cx={50} cy={50} r={48} fill="none" stroke="rgb(var(--hm-gold, 201 166 94))" strokeWidth={2.5} strokeLinecap="round" strokeDasharray={`${(Math.min(1, pct) * 301).toFixed(1)} 400`} transform="rotate(-90 50 50)" />
        </svg>
      ) : null}
    </span>
  );
});
