import { memo, useState, type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, G, Line, Path, Pattern, RadialGradient, Rect, Stop, LinearGradient as SvgLinear } from "react-native-svg";
import { Wordmark } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { ARABIC_BOLD, ARABIC_FONT, FONT } from "@/lib/theme";
import { BadgeMark } from "@/features/talents/badges";
import { StickerArt } from "@/features/feed/Sticker";
import type { StickerDef } from "@/features/feed/gamify";
import { TreeArt } from "@/features/garden/Tree";
import type { TreeType } from "@/features/garden/garden";
import { CARD_SIZE, PALETTES, darkPaletteFor, type Palette, type ShareFormat, type ShareOpts } from "./formats";
import { useTemplateText } from "./templateTexts";

// The share templates: magazine-quality images for every post kind (verse, hadith, tafsir, course insight, names
// of Allah, dua, quiz with its answer, achievement, tree stage, sticker), each in five designs (night, emerald, dawn,
// parchment, marble) and three formats (story 9:16, portrait 4:5, square 1:1). Every image has the same frame:
// a ground with a fine girih lattice, a double gold frame with khatam corner stars (a pointed arch on tall formats),
// the kicker with an ornamental rule, the content, and the gold Quran Masterclass wordmark with
// quranmasterclass.com/app (optionally "shared by @username" with the member's badge).
// Fixed layout without font scaling; texts come from the app's data (Quran text only from the Quran data).
// Rendered only while the share sheet is open (on demand), captured at 1080 px width.

const SERIF = "Fraunces_400Regular";
const SERIF_ITALIC = "Fraunces_400Regular_Italic";
const SERIF_BOLD = "Fraunces_600SemiBold";

export type Lay = { padX: number; top: number; bottom: number; frame: number; arch: number; kicker: number; foot: number };
export const LAYOUT: Record<ShareFormat, Lay> = {
  // story: Instagram keeps the top ~13 % and the bottom ~12 % for its own controls
  story: { padX: 36, top: 96, bottom: 74, frame: 14, arch: 70, kicker: 40, foot: 64 },
  post: { padX: 34, top: 46, bottom: 30, frame: 12, arch: 38, kicker: 36, foot: 56 },
  square: { padX: 32, top: 34, bottom: 24, frame: 11, arch: 0, kicker: 32, foot: 52 },
};

/** the room in the middle of a card, between kicker and footer */
export function contentBox(format: ShareFormat, sharer: boolean) {
  const { w, h } = CARD_SIZE[format];
  const l = LAYOUT[format];
  return { w: w - l.padX * 2, h: h - l.top - l.bottom - l.kicker - l.foot - (sharer ? 18 : 0) - 16 };
}

/** a font size that lets `len` characters fill the box (width × height), within min…max */
function fit(len: number, boxW: number, boxH: number, charW: number, lineH: number, min: number, max: number) {
  if (len <= 0 || boxH <= 0) return max;
  const s = Math.sqrt((boxW * boxH) / (len * charW * lineH));
  return Math.max(min, Math.min(max, Math.floor(s * 2) / 2));
}
/** visible Arabic letters (marks have no width of their own) */
const arLen = (s: string) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ\s]/g, "").length + (s.match(/\s/g)?.length ?? 0) * 0.6;
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toAr = (n: number | string) => String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
const clean = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const hash = (s: string) => { let h = 11; for (const ch of s) h = (h * 33 + ch.charCodeAt(0)) >>> 0; return h; };
function rng(seed: string) { let x = hash(seed) || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 10000) / 10000; }; }

// ---------- the ground ----------
const TILE = 44;
const GIRIH = (() => {
  const c = TILE / 2, r = 12, a = r * Math.SQRT1_2;
  const diamond = `M${c} ${c - r}L${c + r} ${c}L${c} ${c + r}L${c - r} ${c}Z`;
  const square = `M${c - a} ${c - a}L${c + a} ${c - a}L${c + a} ${c + a}L${c - a} ${c + a}Z`;
  const links = `M${c} 0V${c - r}M${c} ${c + r}V${TILE}M0 ${c}H${c - r}M${c + r} ${c}H${TILE}`
    + `M0 0L${c - a} ${c - a}M${TILE} 0L${c + a} ${c - a}M0 ${TILE}L${c - a} ${c + a}M${TILE} ${TILE}L${c + a} ${c + a}`;
  return { star: `${diamond}${square}`, links };
})();

export const ShareGround = memo(function Ground({ p, w, h, seed }: { p: Palette; w: number; h: number; seed: string }) {
  const r = rng(`${seed}|${p.id}`);
  const stars = p.id === "night" ? Array.from({ length: 46 }, () => ({ x: r() * w, y: r() * h * 0.5, s: 0.35 + r() * 0.9, o: 0.25 + r() * 0.6 })) : [];
  const veins = p.id === "marble" ? Array.from({ length: 6 }, (_, i) => {
    const y0 = r() * h, y1 = y0 + (r() - 0.3) * h * 0.7;
    return { d: `M${-20} ${y0.toFixed(0)}C${(w * 0.3).toFixed(0)} ${(y0 + (r() - 0.5) * 160).toFixed(0)} ${(w * 0.65).toFixed(0)} ${(y1 + (r() - 0.5) * 160).toFixed(0)} ${w + 20} ${y1.toFixed(0)}`, gold: i === 2, wd: 0.5 + r() * 1.2 };
  }) : [];
  const pat = p.dark ? 0.1 : 0.12;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={p.bg as [string, string, ...string[]]} start={{ x: 0.35, y: 0 }} end={{ x: 0.65, y: 1 }} style={StyleSheet.absoluteFill} />
      <Svg width={w} height={h}>
        <Defs>
          <Pattern id="sg-girih" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
            <G fill="none" stroke={p.line} strokeWidth={0.7}>
              <Path d={GIRIH.star} strokeOpacity={pat} />
              <Path d={GIRIH.links} strokeOpacity={pat * 0.6} />
            </G>
          </Pattern>
          <RadialGradient id="sg-veil" cx="50%" cy="52%" rx="62%" ry="46%">
            <Stop offset="0" stopColor={p.veil} stopOpacity={0.94} />
            <Stop offset="0.7" stopColor={p.veil} stopOpacity={0.55} />
            <Stop offset="1" stopColor={p.veil} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="sg-glow" cx="50%" cy="0%" rx="85%" ry="55%">
            <Stop offset="0" stopColor={p.glow} stopOpacity={1} />
            <Stop offset="1" stopColor={p.glow} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="sg-vig" cx="50%" cy="50%" rx="75%" ry="70%">
            <Stop offset="0.6" stopColor="#6b4a17" stopOpacity={0} />
            <Stop offset="1" stopColor="#6b4a17" stopOpacity={p.id === "parchment" ? 0.28 : p.dark ? 0 : 0.08} />
          </RadialGradient>
          <RadialGradient id="sg-sun" cx="50%" cy="100%" rx="70%" ry="38%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.85} />
            <Stop offset="0.5" stopColor="#FFE9C4" stopOpacity={0.35} />
            <Stop offset="1" stopColor="#FFE9C4" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {veins.map((v, i) => <Path key={i} d={v.d} fill="none" stroke={v.gold ? p.line : "#5d625e"} strokeOpacity={v.gold ? 0.28 : 0.1} strokeWidth={v.wd} />)}
        <Rect width={w} height={h} fill="url(#sg-girih)" />
        <Rect width={w} height={h} fill="url(#sg-veil)" />
        {p.id === "dawn" ? (
          <G>
            <Rect width={w} height={h} fill="url(#sg-sun)" />
            {[0.5, 0.62, 0.76].map((k) => <Circle key={k} cx={w / 2} cy={h * 1.04} r={w * k} fill="none" stroke={p.line} strokeOpacity={0.14} strokeWidth={0.7} />)}
          </G>
        ) : null}
        <Rect width={w} height={h} fill="url(#sg-glow)" />
        {stars.map((s, i) => <Circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#FFF6DC" fillOpacity={s.o} />)}
        <Rect width={w} height={h} fill="url(#sg-vig)" />
      </Svg>
    </View>
  );
});

// ---------- the frame ----------
/** an eight-pointed star (khatam) as a path */
function star8(cx: number, cy: number, r: number, inner = 0.72) {
  return `M${Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8 - Math.PI / 2; const rr = i % 2 ? r * inner : r; return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`; }).join("L")}Z`;
}
/** the inner frame: a rectangle, on tall formats with a pointed arch at the top (a mihrab) */
function archPath(x0: number, y0: number, x1: number, y1: number, arch: number) {
  if (!arch) return `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
  const cx = (x0 + x1) / 2, ys = y0 + arch;
  return `M${x0} ${y1}V${ys}C${x0} ${ys - arch * 0.55} ${cx - (cx - x0) * 0.42} ${y0 + arch * 0.22} ${cx} ${y0}`
    + `C${cx + (x1 - cx) * 0.42} ${y0 + arch * 0.22} ${x1} ${ys - arch * 0.55} ${x1} ${ys}V${y1}Z`;
}
/** a corner piece: a khatam star with two small leaves along the edges (drawn for the top-left corner) */
function Corner({ p, x, y, sx, sy }: { p: Palette; x: number; y: number; sx: 1 | -1; sy: 1 | -1 }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
      <Path d="M9 0q9 -5.5 19 0q-10 5.5 -19 0Z" fill={p.line} fillOpacity={0.55} />
      <Path d="M0 9q-5.5 9 0 19q5.5 -10 0 -19Z" fill={p.line} fillOpacity={0.55} />
      <Path d="M30 0h10M0 30v10" stroke={p.line} strokeOpacity={0.6} strokeWidth={0.8} />
      <Path d={star8(0, 0, 8.5)} fill={p.bg[1]} stroke={p.line} strokeWidth={0.9} />
      <Path d={star8(0, 0, 4.6)} fill={p.line} fillOpacity={0.8} />
    </G>
  );
}

export const ShareFrame = memo(function Frame({ p, w, h, l }: { p: Palette; w: number; h: number; l: Lay }) {
  const m = l.frame, i1 = m + 5, i2 = m + 8;
  return (
    <Svg pointerEvents="none" width={w} height={h} style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgLinear id="sf-arch" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={p.line} stopOpacity={0.75} />
          <Stop offset="1" stopColor={p.line} stopOpacity={0.4} />
        </SvgLinear>
      </Defs>
      <Rect x={m} y={m} width={w - m * 2} height={h - m * 2} fill="none" stroke={p.line} strokeOpacity={0.85} strokeWidth={1.1} />
      <Path d={archPath(i1, i1, w - i1, h - i1, l.arch)} fill="none" stroke="url(#sf-arch)" strokeWidth={0.75} />
      <Path d={archPath(i2, i2 + (l.arch ? 2 : 0), w - i2, h - i2, l.arch ? l.arch - 1 : 0)} fill="none" stroke={p.line} strokeOpacity={0.22} strokeWidth={0.5} />
      {l.arch ? <Path d={star8(w / 2, i1 + 1, 4)} fill={p.line} /> : null}
      {/* small lozenges in the middle of the sides */}
      {[[w / 2, h - m], [m, h / 2], [w - m, h / 2]].map(([x, y]) => <Path key={`${x}-${y}`} d={`M${x} ${y - 3.5}L${x + 3.5} ${y}L${x} ${y + 3.5}L${x - 3.5} ${y}Z`} fill={p.line} />)}
      <Corner p={p} x={m} y={m} sx={1} sy={1} />
      <Corner p={p} x={w - m} y={m} sx={-1} sy={1} />
      <Corner p={p} x={m} y={h - m} sx={1} sy={-1} />
      <Corner p={p} x={w - m} y={h - m} sx={-1} sy={-1} />
    </Svg>
  );
});

/** a fine ornamental rule: tapering lines, a khatam star in the middle and two dots */
export function OrnamentRule({ p, width = 120 }: { p: Palette; width?: number }) {
  const c = width / 2;
  return (
    <Svg width={width} height={12} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <SvgLinear id="or-l" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={p.line} stopOpacity={0} /><Stop offset="1" stopColor={p.line} stopOpacity={0.9} /></SvgLinear>
        <SvgLinear id="or-r" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={p.line} stopOpacity={0.9} /><Stop offset="1" stopColor={p.line} stopOpacity={0} /></SvgLinear>
      </Defs>
      <Line x1={0} y1={6} x2={c - 13} y2={6} stroke="url(#or-l)" strokeWidth={0.9} />
      <Line x1={c + 13} y1={6} x2={width} y2={6} stroke="url(#or-r)" strokeWidth={0.9} />
      <Circle cx={c - 10} cy={6} r={1.2} fill={p.line} />
      <Circle cx={c + 10} cy={6} r={1.2} fill={p.line} />
      <Path d={star8(c, 6, 5.5)} fill="none" stroke={p.line} strokeWidth={0.9} />
      <Circle cx={c} cy={6} r={1.6} fill={p.line} />
    </Svg>
  );
}

// ---------- the canvas ----------
export function ShareCanvas({ format, opts, seed, kicker, children }: { format: ShareFormat; opts: ShareOpts; seed: string; kicker?: string; children: ReactNode }) {
  const { w, h } = CARD_SIZE[format];
  const l = LAYOUT[format];
  const p = PALETTES[opts.palette];
  const tt = useTemplateText();
  return (
    <View style={{ width: w, height: h, overflow: "hidden", backgroundColor: p.bg[1] }}>
      <ShareGround p={p} w={w} h={h} seed={seed} />
      <ShareFrame p={p} w={w} h={h} l={l} />
      <View style={{ flex: 1, paddingHorizontal: l.padX, paddingTop: l.top, paddingBottom: l.bottom }}>
        <View style={{ height: l.kicker, alignItems: "center", justifyContent: "flex-start", gap: 6 }}>
          {kicker ? <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: format === "story" ? 12 : 11, letterSpacing: 1.8, color: p.accent, textAlign: "center" }}>{kicker}</Text> : null}
          <OrnamentRule p={p} width={format === "story" ? 132 : 112} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", paddingVertical: 8 }}>{children}</View>
        <View style={{ alignItems: "center", gap: 5, minHeight: l.foot, marginTop: 10, justifyContent: "flex-end" }}>
          {opts.sharer ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 10.5, color: p.muted }}>{tt.sharedBy}</Text>
              <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 11, color: p.ink }}>@{opts.sharer.username}</Text>
              {opts.sharer.badge ? <BadgeMark badge={opts.sharer.badge} size={12} /> : null}
            </View>
          ) : null}
          <Wordmark tone={p.wordmark} height={format === "story" ? 25 : 21} />
          <Text allowFontScaling={false} style={{ fontFamily: FONT.medium, fontSize: 9.5, letterSpacing: 1.3, color: p.muted }}>quranmasterclass.com/app</Text>
        </View>
      </View>
    </View>
  );
}

// ---------- verse ----------
export function VerseTemplate({ format, opts, arabic, translation, reference, verseKey }: { format: ShareFormat; opts: ShareOpts; arabic: string; translation: string; reference: string; verseKey?: string }) {
  const p = PALETTES[opts.palette];
  const box = contentBox(format, !!opts.sharer);
  const n = (verseKey ?? reference.match(/\d+:(\d+)/)?.[0] ?? "").split(":")[1];
  const ar = arabic.replace(/[\s٠-٩۰-۹]+$/, "").trim();
  const tr = clean(translation);
  const refH = 26, ruleH = 26;
  const hAr = (box.h - refH - (tr ? ruleH : 0)) * (tr ? (arLen(ar) > tr.length * 0.8 ? 0.6 : 0.5) : 1);
  const hTr = box.h - refH - ruleH - hAr;
  const max = format === "story" ? 46 : format === "post" ? 36 : 30;
  const sAr = fit(arLen(ar) + 4, box.w, hAr, 0.5, 1.85, 13, max);
  const linesAr = Math.max(2, Math.floor(hAr / (sAr * 1.85)));
  const sTr = tr ? fit(tr.length, box.w, hTr, 0.46, 1.45, 10.5, format === "story" ? 21 : 18) : 0;
  const linesTr = Math.max(2, Math.floor(hTr / (sTr * 1.45 || 1)));
  return (
    <ShareCanvas format={format} opts={opts} seed={verseKey ?? reference} kicker={reference}>
      <View style={{ alignItems: "center" }}>
        <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={linesAr} style={{ fontFamily: ARABIC_FONT, fontSize: sAr, lineHeight: sAr * 1.85, color: p.arabic, textAlign: "center", writingDirection: "rtl" }}>
          {ar}{n ? <Text style={{ color: p.accent, fontSize: sAr * 0.78 }}>{` ﴿${toAr(n)}﴾`}</Text> : null}
        </Text>
        {tr ? (
          <>
            <View style={{ height: ruleH, justifyContent: "center" }}><OrnamentRule p={p} width={72} /></View>
            <Text allowFontScaling={false} numberOfLines={linesTr} style={{ fontFamily: SERIF_ITALIC, fontSize: sTr, lineHeight: sTr * 1.45, color: p.soft, textAlign: "center" }}>
              <Text style={{ fontFamily: SERIF, color: p.accent }}>“</Text>{tr}<Text style={{ fontFamily: SERIF, color: p.accent }}>”</Text>
            </Text>
          </>
        ) : null}
      </View>
    </ShareCanvas>
  );
}

// ---------- text: hadith, tafsir, insight, dua, story ----------
export function TextTemplate({ format, opts, kicker, seed, arabic, title, body, source, quote, icon }: {
  format: ShareFormat; opts: ShareOpts; kicker: string; seed?: string;
  arabic?: string; title?: string; body?: string;
  /** the source line under the text (collection and number, course name) */
  source?: string;
  /** body as a quotation (hadith, dua) in the serif italic */
  quote?: boolean;
  icon?: IconName;
}) {
  const p = PALETTES[opts.palette];
  const box = contentBox(format, !!opts.sharer);
  const ar = arabic ? clean(arabic) : "";
  const b = body ? clean(body) : "";
  const iconH = icon ? 46 : 0;
  const titleS = title ? (format === "square" ? 19 : format === "post" ? 21 : 24) : 0;
  const titleH = title ? titleS * 1.3 * Math.min(3, Math.ceil((title.length * titleS * 0.52) / box.w)) + 10 : 0;
  const srcH = source ? 30 : 0;
  const rest = box.h - iconH - titleH - srcH - (ar && b ? 22 : 0);
  const hAr = ar ? rest * (b ? (arLen(ar) > b.length * 0.6 ? 0.5 : 0.38) : 1) : 0;
  const hB = rest - hAr;
  const sAr = ar ? fit(arLen(ar), box.w, hAr, 0.5, 1.85, 12.5, b ? (format === "story" ? 30 : 26) : (format === "story" ? 40 : 34)) : 0;
  const sB = b ? fit(b.length, box.w, hB, quote ? 0.46 : 0.5, 1.5, 10.5, format === "story" ? 20 : 17.5) : 0;
  return (
    <ShareCanvas format={format} opts={opts} seed={seed ?? kicker} kicker={kicker}>
      <View style={{ alignItems: "center", gap: 10 }}>
        {icon ? <Rosette p={p} size={40}><Icon name={icon} color={p.line} size={17} /></Rosette> : null}
        {ar ? <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={Math.max(2, Math.floor(hAr / (sAr * 1.85)))} style={{ fontFamily: ARABIC_FONT, fontSize: sAr, lineHeight: sAr * 1.85, color: p.arabic, textAlign: "center", writingDirection: "rtl" }}>{ar}</Text> : null}
        {ar && b ? <OrnamentRule p={p} width={64} /> : null}
        {title ? <Text allowFontScaling={false} numberOfLines={3} style={{ fontFamily: SERIF_BOLD, fontSize: titleS, lineHeight: titleS * 1.28, letterSpacing: -0.2, color: p.ink, textAlign: "center" }}>{title}</Text> : null}
        {b ? (
          <Text allowFontScaling={false} numberOfLines={Math.max(2, Math.floor(hB / (sB * 1.5)))} style={{ fontFamily: quote ? SERIF_ITALIC : FONT.regular, fontSize: sB, lineHeight: sB * 1.5, color: p.soft, textAlign: "center" }}>
            {quote ? <Text style={{ fontFamily: SERIF, color: p.accent }}>“</Text> : null}{b}{quote ? <Text style={{ fontFamily: SERIF, color: p.accent }}>”</Text> : null}
          </Text>
        ) : null}
        {source ? <Text allowFontScaling={false} numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 0.6, color: p.accent, textAlign: "center", marginTop: 2 }}>{source}</Text> : null}
      </View>
    </ShareCanvas>
  );
}

/** a gold rosette: double ring and a sixteen-point star, with content in the middle */
export function Rosette({ p, size, children }: { p: Palette; size: number; children?: ReactNode }) {
  const r = size / 2;
  const rays = Array.from({ length: 32 }, (_, i) => { const a = (i * Math.PI) / 16 - Math.PI / 2; const rr = i % 2 ? r * 0.8 : r * 0.97; return `${(r + rr * Math.cos(a)).toFixed(2)},${(r + rr * Math.sin(a)).toFixed(2)}`; }).join("L");
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Path d={`M${rays}Z`} fill={p.dark ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.45)"} stroke={p.line} strokeWidth={0.9} />
        <Circle cx={r} cy={r} r={r * 0.72} fill="none" stroke={p.line} strokeWidth={1} />
        <Circle cx={r} cy={r} r={r * 0.66} fill="none" stroke={p.line} strokeOpacity={0.45} strokeWidth={0.6} />
        <Path d={star8(r, r, r * 0.6, 0.76)} fill="none" stroke={p.line} strokeOpacity={0.22} strokeWidth={0.6} />
      </Svg>
      {children}
    </View>
  );
}

// ---------- names of Allah ----------
export function NameTemplate({ format, opts, kicker, arabic, latin, meaning }: { format: ShareFormat; opts: ShareOpts; kicker: string; arabic: string; latin: string; meaning: string }) {
  const p = PALETTES[opts.palette];
  const size = format === "story" ? 230 : format === "post" ? 186 : 150;
  const sAr = Math.min(size * 0.3, (size * 0.62 * 2.2) / Math.max(3, arLen(arabic)));
  return (
    <ShareCanvas format={format} opts={opts} seed={`name:${latin}`} kicker={kicker}>
      <View style={{ alignItems: "center", gap: format === "square" ? 8 : 14 }}>
        <Rosette p={p} size={size}>
          <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={1} style={{ fontFamily: ARABIC_BOLD, fontSize: sAr, lineHeight: sAr * 1.7, color: p.arabic, textAlign: "center" }}>{arabic}</Text>
        </Rosette>
        <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: SERIF_BOLD, fontSize: format === "square" ? 22 : 27, letterSpacing: -0.3, color: p.ink, textAlign: "center" }}>{latin}</Text>
        <Text allowFontScaling={false} numberOfLines={format === "square" ? 2 : 4} style={{ fontFamily: SERIF_ITALIC, fontSize: format === "square" ? 14.5 : 17, lineHeight: format === "square" ? 20 : 24, color: p.soft, textAlign: "center" }}>{meaning}</Text>
      </View>
    </ShareCanvas>
  );
}

// ---------- quiz with its answer ----------
export function QuizTemplate({ format, opts, kicker, question, arabic, options, answer, explain }: { format: ShareFormat; opts: ShareOpts; kicker: string; question: string; arabic?: string; options: string[]; answer: number; explain?: string }) {
  const p = PALETTES[opts.palette];
  const tt = useTemplateText();
  const small = format === "square";
  const opt = options.slice(0, 4);
  const qS = (small ? 17 : format === "post" ? 19 : 22) * (question.length > 110 ? 0.82 : question.length > 70 ? 0.9 : 1);
  const oS = small ? 12.5 : 14;
  const sAr = arabic ? (small ? 30 : format === "post" ? 36 : 44) : 0;
  return (
    <ShareCanvas format={format} opts={opts} seed={`quiz:${question}`} kicker={kicker}>
      <View style={{ gap: small ? 7 : 11 }}>
        {arabic ? <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={1} style={{ fontFamily: ARABIC_FONT, fontSize: sAr, lineHeight: sAr * 1.7, color: p.arabic, textAlign: "center" }}>{arabic}</Text> : null}
        <Text allowFontScaling={false} numberOfLines={small ? 3 : 4} style={{ fontFamily: SERIF_BOLD, fontSize: qS, lineHeight: qS * 1.28, color: p.ink, textAlign: "center" }}>{question}</Text>
        <View style={{ gap: small ? 5 : 7, marginTop: 2 }}>
          {opt.map((o, i) => {
            const ok = i === answer;
            return (
              <View key={`${i}-${o}`} style={{ minHeight: small ? 30 : 38, borderRadius: 999, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
                backgroundColor: ok ? (p.dark ? "rgba(214,180,108,0.2)" : "rgba(160,123,54,0.14)") : "transparent", borderWidth: ok ? 1.2 : 0.8, borderColor: ok ? p.line : p.dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)" }}>
                {ok ? <Icon name="check" color={p.line} size={small ? 13 : 15} /> : null}
                <Text allowFontScaling={false} numberOfLines={small ? 1 : 2} style={{ flexShrink: 1, fontFamily: ok ? FONT.semibold : FONT.regular, fontSize: oS, color: ok ? p.ink : p.muted, textAlign: "center" }}>{o}</Text>
              </View>
            );
          })}
        </View>
        {explain ? (
          <Text allowFontScaling={false} numberOfLines={small ? 2 : format === "post" ? 3 : 5} style={{ fontFamily: SERIF_ITALIC, fontSize: small ? 11.5 : 13, lineHeight: small ? 16 : 19, color: p.soft, textAlign: "center", marginTop: 2 }}>
            <Text style={{ fontFamily: FONT.semibold, color: p.accent }}>{tt.answer}: </Text>{clean(explain)}
          </Text>
        ) : null}
      </View>
    </ShareCanvas>
  );
}

// ---------- achievement ----------
export function AchievementTemplate({ format, opts, kicker, big, title, sub, icon, seed }: { format: ShareFormat; opts: ShareOpts; kicker: string; big?: string; title?: string; sub?: string; icon?: IconName; seed?: string }) {
  const p = PALETTES[opts.palette];
  const size = format === "story" ? 220 : format === "post" ? 172 : 136;
  const bigS = big ? Math.min(size * 0.3, (size * 0.6) / Math.max(1, big.length * 0.55)) : 0;
  return (
    <ShareCanvas format={format} opts={opts} seed={seed ?? `ach:${kicker}`} kicker={kicker}>
      <View style={{ alignItems: "center", gap: format === "square" ? 8 : 14 }}>
        <Rosette p={p} size={size}>
          {big ? <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: SERIF_BOLD, fontSize: bigS, letterSpacing: -0.5, color: p.ink }}>{big}</Text> : <Icon name={icon ?? "trophy"} color={p.line} size={size * 0.28} />}
        </Rosette>
        {title ? <Text allowFontScaling={false} numberOfLines={3} style={{ fontFamily: SERIF_BOLD, fontSize: format === "square" ? 19 : 24, lineHeight: format === "square" ? 25 : 31, letterSpacing: -0.2, color: p.ink, textAlign: "center" }}>{title}</Text> : null}
        {sub ? <Text allowFontScaling={false} numberOfLines={format === "square" ? 2 : 4} style={{ fontFamily: SERIF_ITALIC, fontSize: format === "square" ? 13.5 : 15.5, lineHeight: format === "square" ? 19 : 22, color: p.soft, textAlign: "center" }}>{sub}</Text> : null}
      </View>
    </ShareCanvas>
  );
}

// ---------- sticker ----------
export function StickerTemplate({ format, opts, kicker, def, name, sub }: { format: ShareFormat; opts: ShareOpts; kicker: string; def: StickerDef; name: string; sub?: string }) {
  const p = PALETTES[opts.palette];
  const size = format === "story" ? 230 : format === "post" ? 180 : 140;
  return (
    <ShareCanvas format={format} opts={opts} seed={`sticker:${def.id}`} kicker={kicker}>
      <View style={{ alignItems: "center", gap: format === "square" ? 8 : 14 }}>
        <View style={{ width: size * 1.25, height: size * 1.12, alignItems: "center", justifyContent: "center" }}>
          <Svg width={size * 1.25} height={size * 1.12} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="st-halo" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={p.dark ? "#E9CF99" : "#FFFFFF"} stopOpacity={p.dark ? 0.35 : 0.9} />
                <Stop offset="1" stopColor={p.dark ? "#E9CF99" : "#FFFFFF"} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={size * 0.625} cy={size * 0.56} r={size * 0.6} fill="url(#st-halo)" />
            {Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8; const cx = size * 0.625, cy = size * 0.56; return <Line key={i} x1={cx + size * 0.5 * Math.cos(a)} y1={cy + size * 0.5 * Math.sin(a)} x2={cx + size * 0.58 * Math.cos(a)} y2={cy + size * 0.58 * Math.sin(a)} stroke={p.line} strokeOpacity={0.5} strokeWidth={0.8} />; })}
          </Svg>
          <StickerArt def={def} size={size} />
        </View>
        <Text allowFontScaling={false} numberOfLines={2} style={{ fontFamily: SERIF_BOLD, fontSize: format === "square" ? 20 : 25, lineHeight: format === "square" ? 26 : 32, color: p.ink, textAlign: "center" }}>{name}</Text>
        {sub ? <Text allowFontScaling={false} numberOfLines={2} style={{ fontFamily: SERIF_ITALIC, fontSize: 14.5, lineHeight: 20, color: p.soft, textAlign: "center" }}>{sub}</Text> : null}
      </View>
    </ShareCanvas>
  );
}

// ---------- tree stage ----------
/** the learner's tree (the approved tree art, unchanged) at its stage */
export function TreeTemplate({ format, opts, kicker, tree, title, sub }: { format: ShareFormat; opts: ShareOpts; kicker: string; tree: { id: string; type: TreeType; stage: number; fruits?: number }; title: string; sub?: string }) {
  const p = PALETTES[opts.palette];
  const size = format === "story" ? 270 : format === "post" ? 196 : 150;
  return (
    <ShareCanvas format={format} opts={opts} seed={`tree:${tree.id}`} kicker={kicker}>
      <View style={{ alignItems: "center", gap: format === "square" ? 4 : 10 }}>
        <View style={{ alignItems: "center" }}>
          <TreeArt id={tree.id} type={tree.type} stage={tree.stage} fruits={tree.fruits ?? 0} size={size} still />
          <View style={{ marginTop: -6 }}><OrnamentRule p={p} width={size * 0.8} /></View>
        </View>
        <Text allowFontScaling={false} numberOfLines={2} style={{ fontFamily: SERIF_BOLD, fontSize: format === "square" ? 20 : 25, lineHeight: format === "square" ? 26 : 32, color: p.ink, textAlign: "center" }}>{title}</Text>
        {sub ? <Text allowFontScaling={false} numberOfLines={2} style={{ fontFamily: SERIF_ITALIC, fontSize: format === "square" ? 13.5 : 15.5, lineHeight: 21, color: p.soft, textAlign: "center" }}>{sub}</Text> : null}
      </View>
    </ShareCanvas>
  );
}

// ---------- the panel of a feed card ----------
const PANEL: Lay = { padX: 0, top: 0, bottom: 0, frame: 8, arch: 0, kicker: 0, foot: 0 };
/** a feed card's ground in the share designs (night or emerald, so the white card text stays legible), measured on layout */
export function PostPanel({ seed, children, style }: { seed: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const p = PALETTES[darkPaletteFor(seed)];
  return (
    <View onLayout={(e) => { const { width, height } = e.nativeEvent.layout; if (!size || Math.abs(size.w - width) > 1 || Math.abs(size.h - height) > 1) setSize({ w: width, h: height }); }}
      style={[{ backgroundColor: p.bg[1], overflow: "hidden" }, style]}>
      {size ? <><ShareGround p={p} w={size.w} h={size.h} seed={seed} /><ShareFrame p={p} w={size.w} h={size.h} l={PANEL} /></> : null}
      {children}
    </View>
  );
}
