import { memo } from "react";
import Svg, { Circle, Defs, G, LinearGradient as SvgGrad, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
import type { LibTopic } from "./library";
import { STICKER, type Motif, type Shape, type StickerDef, type Tone } from "./gamify";
import type { GameText } from "./gamifyTexts";
import type { FeedText } from "./texts";

// The collectible stickers, drawn in the app's gold and emerald with react-native-svg: a seal shape, a motif from
// Islamic ornament and everyday objects (books, lanterns, domes, palms, stars) and the milestone number on a ribbon.
// Seals and medallions, not cartoon stickers. No figurative depictions of people and no prophets; every shape is original and geometric.

const TONES: Record<Tone, { bg: [string, string]; rim: string; ink: string; ribbon: string; ribbonInk: string }> = {
  emerald: { bg: ["#1d6b52", "#0b3d2e"], rim: "#c6a65e", ink: "#f3e2b6", ribbon: "#c6a65e", ribbonInk: "#0b3d2e" },
  gold: { bg: ["#e3c98a", "#a07a32"], rim: "#f8ecc8", ink: "#0b3d2e", ribbon: "#0b3d2e", ribbonInk: "#f3e2b6" },
  night: { bg: ["#14523f", "#072a20"], rim: "#c6a65e", ink: "#f3e2b6", ribbon: "#c6a65e", ribbonInk: "#1f473b" },
  rare: { bg: ["#5a4518", "#241a08"], rim: "#f3e2b6", ink: "#f8ecc8", ribbon: "#f3e2b6", ribbonInk: "#473a1f" },
};
const LOCKED = { bg: ["#7d8582", "#4a524f"] as [string, string], rim: "#a3aba8", ink: "#d9dedc", ribbon: "#a3aba8", ribbonInk: "#3a413e" };

const star = (cx: number, cy: number, r1: number, r2: number, pts = 8) =>
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
    case "book": return <G {...s}><Path d="M28,38Q39,33 50,39Q61,33 72,38V62Q61,57 50,63Q39,57 28,62Z" /><Path d="M50,39V63" /></G>;
    case "wave": return <G {...s}>{[30, 40, 50, 60, 70].map((x, i) => <Path key={x} d={`M${x},${50 - [6, 12, 18, 12, 6][i]}V${50 + [6, 12, 18, 12, 6][i]}`} strokeWidth={4} />)}</G>;
    case "word": return <G {...s}><Path d="M30,34H70Q74,34 74,38V54Q74,58 70,58H48L40,66V58H30Q26,58 26,54V38Q26,34 30,34Z" /><Path d="M36,46H64" /></G>;
    case "check": return <G {...s}><Circle cx={50} cy={50} r={20} /><Path d="M40,50L47,57L61,43" strokeWidth={4} /></G>;
    case "plane": return <G {...s}><Path d="M26,50L74,30L62,72L50,56Z" /><Path d="M50,56L74,30" /></G>;
    case "flame": return <Path d="M50,28C59,38 66,46 63,57C60,68 40,68 37,57C35,49 43,45 46,36C48,43 53,45 50,28Z" fill={c} />;
    case "chevrons": return <G {...s} strokeWidth={4}><Path d="M36,64L50,52L64,64" /><Path d="M36,52L50,40L64,52" /><Path d="M36,40L50,28L64,40" /></G>;
    case "target": return <G {...s}><Circle cx={50} cy={50} r={20} /><Circle cx={50} cy={50} r={11} /><Circle cx={50} cy={50} r={3} fill={c} /></G>;
    case "crescent": return <G><Path d="M58,28A22,22 0 1 0 58,72A17,17 0 1 1 58,28Z" fill={c} /><Path d={star(66, 40, 5, 2, 5)} fill={c} /></G>;
    case "star8": return <G><Path d={star(50, 50, 22, 15)} fill="none" stroke={c} strokeWidth={3} /><Path d={star(50, 50, 9, 5)} fill={c} /></G>;
    case "lantern": return <G {...s}><Path d="M50,24V30" /><Path d="M42,30H58L62,38H38Z" /><Path d="M40,38Q36,52 42,66H58Q64,52 60,38" /><Path d="M44,66V71H56V66" /><Path d="M50,44V60" /></G>;
    case "palm": return <G {...s}><Path d="M50,74Q48,58 50,40" strokeWidth={4} /><Path d="M50,40Q38,30 26,38" /><Path d="M50,40Q62,30 74,38" /><Path d="M50,40Q40,40 32,52" /><Path d="M50,40Q60,40 68,52" /><Path d="M50,40Q50,30 46,24" /><Circle cx={46} cy={46} r={2.5} fill={c} /><Circle cx={54} cy={46} r={2.5} fill={c} /></G>;
    case "dome": return <G {...s}><Path d="M30,68H70" /><Path d="M34,68V56H66V68" /><Path d="M36,56Q36,38 50,34Q64,38 64,56" /><Path d="M50,34V27" /><Path d="M74,68V36" /><Path d="M72,36L74,30L76,36" /><Path d="M46,68V60Q50,56 54,60V68" /></G>;
    case "arch": return <G {...s}><Path d="M32,70V48Q32,30 50,28Q68,30 68,48V70" /><Path d="M38,70V50Q38,38 50,36Q62,38 62,50V70" /><Path d="M28,70H72" /></G>;
    case "dove": return <G {...s}><Path d="M28,54Q38,44 52,48Q60,38 72,36Q66,44 66,50Q62,62 46,62Q36,62 28,54Z" /><Path d="M52,48Q48,56 40,56" /><Circle cx={64} cy={42} r={1.6} fill={c} /><Path d="M72,40L78,42L72,44" /></G>;
    case "rose": return <G {...s}><Circle cx={50} cy={46} r={14} /><Path d="M50,32Q58,40 50,46Q42,40 50,32" /><Path d="M36,46Q46,50 50,46Q54,50 64,46" /><Path d="M50,60V74" /><Path d="M50,68Q42,64 38,68" /></G>;
    case "pen": return <G {...s}><Path d="M34,68L62,30L70,36L42,74Z" /><Path d="M34,68L32,76L42,74" /><Path d="M58,34L66,40" /></G>;
    case "scroll": return <G {...s}><Rect x={32} y={32} width={36} height={36} rx={3} /><Path d="M28,32Q28,26 34,26H72Q66,26 66,32" /><Path d="M38,42H62M38,50H62M38,58H54" /></G>;
    case "sunrise": return <G {...s}><Path d="M32,58A18,18 0 0 1 68,58" /><Path d="M26,58H74M32,66H68" /><Path d="M50,30V36M34,38L38,42M66,38L62,42" /></G>;
    case "night": return <G><Path d="M56,30A20,20 0 1 0 64,64A16,16 0 1 1 56,30Z" fill={c} /><Path d={star(68, 34, 4, 1.6, 4)} fill={c} /><Path d={star(36, 30, 3, 1.2, 4)} fill={c} /><Path d={star(72, 52, 3, 1.2, 4)} fill={c} /></G>;
    case "hourglass": return <G {...s}><Path d="M36,28H64M36,72H64" /><Path d="M38,28Q38,44 50,50Q62,44 62,28" /><Path d="M38,72Q38,56 50,50Q62,56 62,72" /><Path d="M44,66H56" strokeWidth={4} /></G>;
    case "drop": return <G {...s}><Path d="M38,62Q34,44 44,36Q48,44 46,52" /><Path d="M62,62Q66,44 56,36Q52,44 54,52" /><Path d="M38,62Q50,70 62,62" /><Circle cx={50} cy={30} r={3} fill={c} /></G>;
    case "mat": return <G {...s}><Rect x={32} y={26} width={36} height={50} rx={3} /><Path d="M38,48Q38,34 50,32Q62,34 62,48V70H38Z" /><Path d="M32,72H68" /></G>;
    case "calendar": return <G {...s}><Rect x={28} y={32} width={44} height={38} rx={5} /><Path d="M28,44H72M38,26V36M62,26V36" /><Path d={star(50, 57, 7, 3.5, 5)} fill={c} /></G>;
  }
}

// a seal struck in gold: a foil rim with an engraved inner line, an enamel field in the tone, the motif embossed
// (a dark shadow under a gold line) and the milestone on a pointed gold cartouche
const FOIL = ["#f6e7bf", "#d6b46c", "#a9802f", "#ecd7a2", "#8a6a2c"];
const FOIL_LOCKED = ["#d9dedc", "#a3aba8", "#7d8582", "#c4cac7", "#6d7572"];
export const StickerArt = memo(function StickerArt({ def, size = 88, locked = false }: { def: StickerDef; size?: number; locked?: boolean }) {
  const t = locked ? LOCKED : TONES[def.tone];
  const foil = locked ? FOIL_LOCKED : FOIL;
  const id = `g${def.id}${locked ? "l" : ""}`;
  const label = def.n !== undefined ? String(def.n) : def.fam === "names99" ? "99" : def.fam === "names33" ? "33" : "";
  const motif = label ? "translate(50 44) scale(0.85) translate(-50 -50)" : undefined;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <SvgGrad id={id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={t.bg[0]} /><Stop offset="1" stopColor={t.bg[1]} /></SvgGrad>
        <SvgGrad id={`${id}f`} x1="0" y1="0" x2="1" y2="1">{foil.map((c, i) => <Stop key={c} offset={i / (foil.length - 1)} stopColor={c} />)}</SvgGrad>
      </Defs>
      <Path d={SHAPES[def.shape]} fill={`url(#${id}f)`} />
      <Path d={SHAPES[def.shape]} fill="none" stroke="#5c4519" strokeOpacity={0.45} strokeWidth={0.6} transform="translate(50 50) scale(0.955) translate(-50 -50)" />
      <Path d={SHAPES[def.shape]} fill={`url(#${id})`} transform="translate(50 50) scale(0.91) translate(-50 -50)" />
      <Path d={INNER[def.shape]} fill="none" stroke={`url(#${id}f)`} strokeWidth={0.8} opacity={0.75} />
      <G transform={motif}>
        <G transform="translate(0.8 1.1)" opacity={0.35}><MotifArt m={def.motif} c="#000" /></G>
        <MotifArt m={def.motif} c={t.ink} />
      </G>
      {def.rare && !locked ? [[50, 9], [91, 50], [50, 91], [9, 50]].map(([x, y]) => <Path key={`${x}-${y}`} d={star(x, y, 3.2, 1.1, 4)} fill="#fff6dc" opacity={0.9} />) : null}
      <Path d="M22 34a32 32 0 0 1 30-18" stroke="#fff" strokeOpacity={0.18} strokeWidth={2} fill="none" strokeLinecap="round" />
      {label ? (
        <G>
          <Path d="M30,77.5L35,70H65L70,77.5L65,85H35Z" fill={`url(#${id}f)`} />
          <Path d="M32.5,77.5L36.2,72H63.8L67.5,77.5L63.8,83H36.2Z" fill="none" stroke="#5c4519" strokeOpacity={0.5} strokeWidth={0.5} />
          <SvgText x={50} y={81.6} fontSize={label.length > 3 ? 9.5 : 11} fontWeight="700" letterSpacing={0.6} fill={locked ? "#3a413e" : "#3d2a0b"} textAnchor="middle">{label}</SvgText>
        </G>
      ) : null}
    </Svg>
  );
});

const TOPIC_TX: Record<LibTopic, keyof FeedText> = { tafsir: "topicTafsir", hadith: "hadith", duas: "topicDuas", prayer: "topicPrayer", holy: "topicHoly", seerah: "topicSeerah", quran: "topicQuran", scholars: "topicScholars", history: "topicHistory", art: "topicArt" };
export const topicLabel = (tp: LibTopic, tx: FeedText) => tx[TOPIC_TX[tp]] as string;
const FAM: Record<string, keyof GameText> = {
  verses: "sVerses", posts: "sPosts", words: "sWords", quiz: "sQuiz", share1: "sShare1", shares: "sShares", shareStreak: "sShareStreak", streak: "sStreak", level: "sLevel", quest1: "sQuest1", quests: "sQuests",
  topic1: "sTopic1", topic2: "sTopic2", names33: "sNames33", names99: "sNames99", holy10: "sHoly10", holyAll: "sHolyAll", ramadan7: "sRamadan7", ramadan29: "sRamadan29",
  tahajjud1: "sTahajjud1", tahajjud10: "sTahajjud10", fajr7: "sFajr7", friday4: "sFriday4", hours10: "sHours10",
  "rare-moon": "rMoon", "rare-lantern": "rLantern", "rare-palm": "rPalm", "rare-star": "rStar", "rare-rose": "rRose", "rare-ink": "rInk", "rare-arch": "rArch", "rare-dove": "rDove",
};
export function stickerName(id: string, gt: GameText, tx: FeedText, nf: (n: number) => string): string {
  const d = STICKER.get(id);
  if (!d) return "";
  const s = gt[FAM[d.fam]] as string;
  return s.replace("{n}", d.n !== undefined ? nf(d.n) : "").replace("{topic}", d.topic ? topicLabel(d.topic, tx) : "");
}
