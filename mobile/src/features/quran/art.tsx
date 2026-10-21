import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, I18nManager, StyleSheet, Text, View, type LayoutChangeEvent, type TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as SvgLinear, Mask, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { ARABIC_FONT, CALLIG_FONT, FONT, type Theme } from "@/lib/theme";
import { turn, useSpin } from "@/features/radio/motion";
import type { Chapter } from "@/lib/quran";
import { VERSE_COUNTS } from "@/web/counts";
import { JUZ_START } from "@/web/quranIndex";
import { BUNDLED_UI_VERSES, ringOf } from "./uiVerses";

// The ornaments of the website's Quran page (src/components/art/QuranArt.tsx, src/styles/art-quran.css,
// src/app/[locale]/(app)/quran/page.tsx), drawn natively with the same path data: the shamsa medallion with its
// ring of verses, the floral inlay, the marble hero with its turning lattice and beams of light, the star medallion of
// a surah, the mihrab outline behind the Arabic name, the Kaaba / Green Dome marks and the juz data (QuranMeta.ts).

// ---------- colours (art-quran.css: marble, ink gold, emerald), light and dark ----------
export type QPal = {
  dark: boolean; bg: string; surface: string; ink: string; inkSoft: string; inkFaint: string; muted: string; gold: string;
  inkGold: string; tile: string; marbleA: string; marbleB: string;
};
/** the same colour with another opacity ("rgba(13,31,25,1)" -> "rgba(13,31,25,0.88)") */
export const withAlpha = (c: string, a: number) => {
  const m = c.match(/[\d.]+/g);
  return m && m.length >= 3 ? `rgba(${m[0]},${m[1]},${m[2]},${a})` : c;
};
const palettes = new WeakMap<Theme, QPal>();
/** one stable palette object per theme (rows compare it by reference) */
export function qPalette(t: Theme): QPal {
  let p = palettes.get(t);
  if (!p) {
    p = {
      dark: t.dark, bg: t.bg, surface: t.surface, ink: t.ink, inkSoft: withAlpha(t.ink, 0.88), inkFaint: withAlpha(t.ink, 0.75), muted: t.muted, gold: t.gold,
      inkGold: t.dark ? "rgb(222,190,124)" : "rgb(128,96,38)",
      tile: t.dark ? "rgb(14,35,28)" : "rgb(255,255,255)",
      marbleA: t.dark ? "rgb(14,42,33)" : "rgb(252,249,241)",
      marbleB: t.dark ? "rgb(8,28,22)" : "rgb(244,236,218)",
    };
    palettes.set(t, p);
  }
  return p;
}
export const EMERALD: readonly [string, string] = ["rgb(13,68,52)", "rgb(6,36,27)"];

// ---------- texts copied verbatim from the website by script, never typed by hand ----------
// the verses around the medallion (54:17 and 56:77–80, Uthmani script) from the Quran data (uiVerses.ts: the stored
// copy via useUiVerses(), this constant is the bundled snapshot), as on the website's /quran page
export const QURAN_RING = ringOf(BUNDLED_UI_VERSES);
// src/components/art/QuranArt.tsx QuranShamsa: the words in the centre of the medallion
export const SHAMSA_LINES = ["القرآن", "الكريم"] as const;

// ---------- geometry (QuranArt.tsx) ----------
const pt = (r: number, deg: number, cx = 0, cy = 0) => { const a = (deg * Math.PI) / 180; return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`; };
// khatam: union of two squares (16 vertices)
const octagram = (a: number, cx: number, cy: number) => `M${Array.from({ length: 16 }, (_, i) => pt(i % 2 ? a / Math.cos(Math.PI / 8) : a * Math.SQRT2, i * 22.5 - 90, cx, cy)).join("L")}Z`;
const STAR = octagram(11.6, 26, 26);
const RAYS = Array.from({ length: 72 }, (_, i) => { const d = i * 5; const long = i % 2 === 0; return `M${pt(172, d, 200, 200)}L${pt(long ? 194 : 183, d, 200, 200)}`; }).join("");
const DOTS = Array.from({ length: 24 }, (_, i) => pt(199, i * 15 + 2.5, 200, 200).split(",").map(Number));
const LOBES = (() => {
  const n = 16, span = 360 / n; let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = i * span - 90, a1 = a0 + span, m = a0 + span / 2;
    d += `${i ? "L" : "M"}${pt(110, a0, 200, 200)}Q${pt(124, a0 + span * 0.12, 200, 200)} ${pt(130, m, 200, 200)}Q${pt(124, a1 - span * 0.12, 200, 200)} ${pt(110, a1, 200, 200)}`;
  }
  return d + "Z";
})();
const BIG_STAR = octagram(70, 200, 200);

// ---------- motion ----------
/** 0 -> 1 -> 0 … with ease-in-out on each half (CSS animation-direction: alternate) */
function usePingPong(on: boolean, halfMs: number): Animated.Value {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!on) { v.stopAnimation(); return; }
    const ease = Easing.inOut(Easing.ease);
    const a = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: halfMs, easing: ease, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: halfMs, easing: ease, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [on, halfMs, v]);
  return v;
}
/** fades in once after a delay (stands at 1 with reduced motion) */
function useFadeAfter(reduce: boolean, delay: number, duration: number): Animated.Value {
  const v = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    if (reduce) { v.setValue(1); return; }
    const a = Animated.timing(v, { toValue: 1, delay, duration, easing: Easing.bezier(0.45, 0, 0.25, 1), useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [reduce, delay, duration, v]);
  return v;
}

// ---------- small marks ----------
/** the four-pointed star in front of the hero kicker */
export function FourStar({ size = 12, color }: { size?: number; color: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8z" fill={color} /></Svg>;
}

/** bookmark ribbon (SurahBrowser Ribbon) */
export function Ribbon({ color, width = 10, height = 14 }: { color: string; width?: number; height?: number }) {
  return <Svg width={width} height={height} viewBox="0 0 12 16"><Path d="M1 0h10v15.5L6 11.8 1 15.5z" fill={color} /></Svg>;
}

/** .q-ribbon: the gold ribbon on the tile of the surah you are reading */
export function TileRibbon() {
  return (
    <Svg width={10} height={16} viewBox="0 0 10 16" pointerEvents="none" style={{ position: "absolute", top: -1, end: 14 }}>
      <Defs><SvgLinear id="qt-rib" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#e6cd92" /><Stop offset="1" stopColor="#b98f45" /></SvgLinear></Defs>
      <Path d="M0 0H10V16L5 11.52L0 16Z" fill="url(#qt-rib)" />
    </Svg>
  );
}

export type Place = "makki" | "madani";
/** Kaaba for Makkah, the Green Dome with its minaret for Madinah (QuranPlaceIcon); `color` is the text colour */
export function PlaceIcon({ place, color, gold, size = 14 }: { place: Place; color: string; gold: string; size?: number }) {
  return place === "makki" ? (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d="M2 5.4 8 3l6 2.4L8 7.8z" fill={color} fillOpacity={0.25} stroke={color} strokeWidth={0.9} strokeLinejoin="round" />
      <Path d="M2 5.4v7.2L8 15V7.8zM14 5.4v7.2L8 15V7.8z" fill={color} fillOpacity={0.75} stroke={color} strokeWidth={0.9} strokeLinejoin="round" />
      <Path d="M2 7.6l6 2.4 6-2.4" fill="none" stroke={gold} strokeWidth={1.1} />
    </Svg>
  ) : (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d="M2.6 11.2c0-3.3 2.2-5.4 4.4-6.2 2.2.8 4.4 2.9 4.4 6.2z" fill={color} fillOpacity={0.75} stroke={color} strokeWidth={0.9} strokeLinejoin="round" />
      <Path d="M7 5V2.4M7 2.4c.7 0 1-.4 1-.9" fill="none" stroke={gold} strokeWidth={1} strokeLinecap="round" />
      <Path d="M2 11.2h10v3.6H2z" fill={color} fillOpacity={0.3} stroke={color} strokeWidth={0.9} />
      <Path d="M13 14.8V4.8l.9-2.6.9 2.6v10z" fill={color} fillOpacity={0.5} stroke={color} strokeWidth={0.8} strokeLinejoin="round" />
    </Svg>
  );
}

/** .q-tile-arch: mihrab outline behind the Arabic name, on the end side of a surah tile */
export function TileArch({ color }: { color: string }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 7, bottom: 7, end: 8, width: 92 }}>
      <Svg width="100%" height="100%" viewBox="0 0 92 72" preserveAspectRatio="xMidYMax meet">
        <G fill="none" stroke={color} strokeOpacity={0.16} strokeWidth={1}>
          <Path d="M6 72V36C6 18 26 7 46 2c20 5 40 16 40 34v36" />
          <Path d="M14 72V38c0-13 15-22 32-27 17 5 32 14 32 27v34" />
        </G>
      </Svg>
    </View>
  );
}

const TRACK = 2 * Math.PI * 24.5;
/** QuranStar: the number inside an eight-pointed star; the dotted ring around it fills with gold as verses are learned */
export const QuranStar = memo(function QuranStar({ n, pct = 0, size = 50, ink, gold, onStage }: { n: number | string; pct?: number; size?: number; ink: string; gold: string; onStage?: boolean }) {
  const p = Math.max(0, Math.min(100, pct));
  const full = p >= 100;
  const long = String(n).length > 2;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 52 52" style={StyleSheet.absoluteFill}>
        <Circle cx={26} cy={26} r={24.5} fill="none" stroke={onStage ? "rgba(233,207,153,0.45)" : "rgba(201,166,94,0.4)"} strokeWidth={1} strokeDasharray="0.6 3.2" strokeLinecap="round" />
        {p > 0 ? <Circle cx={26} cy={26} r={24.5} fill="none" stroke="rgb(201,166,94)" strokeWidth={2.4} strokeLinecap="round" strokeDasharray={`${(Math.max(p, 3) / 100) * TRACK} ${TRACK}`} transform="rotate(-90 26 26)" /> : null}
        <Path d={STAR} fill={full ? "rgba(214,180,108,0.85)" : onStage ? "rgba(233,207,153,0.1)" : "rgba(201,166,94,0.1)"} stroke={onStage ? "rgba(233,207,153,0.8)" : gold} strokeWidth={1} strokeLinejoin="round" />
        <Circle cx={26} cy={26} r={9.6} fill="none" stroke="rgba(201,166,94,0.4)" strokeWidth={0.7} />
      </Svg>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: long ? 10.5 : 12.5, letterSpacing: long ? -0.42 : -0.25, color: full ? "rgb(8,38,29)" : onStage ? "#f3e2b6" : ink, fontVariant: ["tabular-nums"] }}>{n}</Text>
    </View>
  );
});

// q-window: an arched window (border-radius 50% 50% 8px 8px / 32% 32% 8px 8px) with a fine gold frame
const win = (d: number) => { const rx = 32 - d, ry = 25.6 - d; return `M${d} 25.6A${rx} ${ry} 0 0 1 32 ${d}A${rx} ${ry} 0 0 1 ${64 - d} 25.6V72Q${64 - d} ${80 - d} 56 ${80 - d}H8Q${d} ${80 - d} ${d} 72Z`; };
const WIN_OUT = win(0.5), WIN_SHADE = win(2.5), WIN_IN = win(5);
/** .q-window of the "continue" card: the Arabic name of the surah in an arched window */
export function ArchWindow({ children }: { children: ReactNode }) {
  return (
    <View style={{ width: 64, height: 80, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}>
      <Svg width={64} height={80} viewBox="0 0 64 80" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="qw-light" cx={32} cy={24} r={64.5} fx={32} fy={24} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="rgb(233,207,153)" stopOpacity={0.18} /><Stop offset="0.7" stopColor="rgb(233,207,153)" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Path d={WIN_OUT} fill="rgba(255,255,255,0.03)" />
        <Path d={WIN_OUT} fill="url(#qw-light)" stroke="rgba(233,207,153,0.55)" strokeWidth={1} />
        <Path d={WIN_SHADE} fill="none" stroke="rgba(5,28,21,0.5)" strokeWidth={4} />
        <Path d={WIN_IN} fill="none" stroke="rgba(233,207,153,0.2)" strokeWidth={1} />
      </Svg>
      {children}
    </View>
  );
}

// ---------- the floral inlay (pietra dura of the Grand Mosque) ----------
const LEAF = "M0 0C7-9 21-10 30-2C21 4 8 5 0 0Z";
const LEAVES: [number, number, number][] = [[34, 160, -40], [58, 118, -70], [66, 92, 200], [96, 34, -10], [108, 152, -20], [134, 124, -55], [20, 182, -15]];
/** QuranInlay: a vine with a rosette flower, a tulip and leaves, in gold at half opacity */
export function QuranInlay({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" opacity={0.5}>
      <G fill={color} fillOpacity={0.08} stroke={color} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 198C52 176 78 128 70 76C66 46 88 22 118 16" fill="none" />
        <Path d="M30 186C82 182 124 160 150 112" fill="none" />
        {LEAVES.map(([x, y, r], i) => <Path key={i} d={LEAF} transform={`translate(${x} ${y}) rotate(${r})`} />)}
        <G transform="translate(70 76)">
          {Array.from({ length: 8 }, (_, i) => <Ellipse key={i} cx={0} cy={-11} rx={5.2} ry={10} transform={`rotate(${i * 45})`} />)}
          <Circle r={5.5} fillOpacity={0.25} />
        </G>
        <Path d="M118 30c-11-6-12-19-6-27 3 5 6 7 6 11 0-4 3-6 6-11 6 8 5 21-6 27z" transform="translate(4 -6)" fillOpacity={0.16} />
        <G transform="translate(150 112)">
          {Array.from({ length: 6 }, (_, i) => <Ellipse key={i} cx={0} cy={-6.5} rx={3.2} ry={6} transform={`rotate(${i * 60})`} />)}
          <Circle r={3} fillOpacity={0.3} />
        </G>
        <Circle cx={34} cy={128} r={2.2} fillOpacity={0.4} /><Circle cx={112} cy={70} r={2.2} fillOpacity={0.4} /><Circle cx={160} cy={150} r={2.2} fillOpacity={0.4} />
      </G>
    </Svg>
  );
}

// ---------- page and hero backgrounds ----------
/** .q-page over the body: the canvas, a very fine girih tessellation and a warm parchment wash (fixed behind the list) */
export function QuranPageBackdrop({ pal }: { pal: QPal }) {
  const wash = pal.dark ? [withAlpha(pal.marbleB, 0.6), withAlpha(pal.marbleB, 0)] as const : [withAlpha(pal.marbleB, 0.7), withAlpha(pal.marbleB, 0.42)] as const;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: pal.bg }]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="qp-girih" width={120} height={120} patternUnits="userSpaceOnUse">
            <G fill="none" stroke="#c9a65e" strokeOpacity={0.075} strokeWidth={1}>
              <Path d="M60 18l12 30 30 12-30 12-12 30-12-30-30-12 30-12z" />
              <Path d="M30 30h60v60H30z" />
              <Path d="M0 0l30 30M120 0L90 30M0 120l30-30M120 120L90 90" />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#qp-girih)" />
      </Svg>
      <LinearGradient colors={wash} style={StyleSheet.absoluteFill} />
    </View>
  );
}

/** .q-hero::before: lattice of eight-fold stars, masked to a pool of light, turning very slowly (300 s) */
function HeroLattice({ w, h, reduce }: { w: number; h: number; reduce: boolean }) {
  const spin = useSpin(!reduce, 300_000);
  // the pseudo element is inset -55 %: 2.1 times the hero; the mask is a circle at 66 % 44 % fading out at 34 % of the
  // distance to the farthest corner. Only that pool is drawn; the empty box around it turns with it.
  const bw = 2.1 * w, bh = 2.1 * h, cx = 0.66 * bw, cy = 0.44 * bh;
  const r = 0.34 * Math.hypot(Math.max(cx, bw - cx), Math.max(cy, bh - cy));
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", left: -0.55 * w, top: -0.55 * h, width: bw, height: bh, transform: [{ rotate: turn(spin) }] }}>
      <Svg width={2 * r} height={2 * r} style={{ position: "absolute", left: cx - r, top: cy - r }}>
        <Defs>
          <Pattern id="qh-lattice" width={120} height={120} patternUnits="userSpaceOnUse">
            <G fill="none" stroke="#b08a3e" strokeOpacity={0.16} strokeWidth={1}>
              <Path d="M60 8l15 37 37 15-37 15-15 37-15-37-37-15 37-15z" />
              <Path d="M23 23h74v74H23z" />
              <Circle cx={60} cy={60} r={17} />
              <Path d="M0 0l23 23M120 0L97 23M0 120l23-23M120 120L97 97M60 0v8M60 112v8M0 60h8M112 60h8" />
            </G>
          </Pattern>
          <RadialGradient id="qh-pool" cx={r} cy={r} r={r} fx={r} fy={r} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#fff" stopOpacity={1} /><Stop offset="1" stopColor="#fff" stopOpacity={0} />
          </RadialGradient>
          <Mask id="qh-mask"><Rect width={2 * r} height={2 * r} fill="url(#qh-pool)" /></Mask>
        </Defs>
        <Rect width={2 * r} height={2 * r} fill="url(#qh-lattice)" mask="url(#qh-mask)" />
      </Svg>
    </Animated.View>
  );
}

/** .q-hero::after: soft beams of light, like sun through the dome, swaying 30 px over 18 s */
function HeroBeams({ w, h, dark, reduce }: { w: number; h: number; dark: boolean; reduce: boolean }) {
  const v = usePingPong(!reduce, 18_000);
  const move = reduce ? null : { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-30, 30] }) }] };
  return (
    <Animated.View pointerEvents="none" style={[{ position: "absolute", left: -30, top: 0, width: w + 60, height: h, opacity: dark ? 0.08 : 0.55 }, move]}>
      <Svg width={w + 60} height={h}>
        <Defs>
          {/* repeating-linear-gradient(112deg, transparent 0 46px, beam 46px 54px, transparent 54px 120px) */}
          <Pattern id="qh-beam" width={120} height={120} patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
            <Rect x={46} y={0} width={8} height={120} fill="rgb(255,248,226)" fillOpacity={0.55} />
          </Pattern>
          {/* mask: linear-gradient(200deg, #000, transparent 65%) */}
          <SvgLinear id="qh-beam-fade" x1="0.67" y1="0" x2="0.33" y2="1">
            <Stop offset="0" stopColor="#fff" stopOpacity={1} /><Stop offset="0.65" stopColor="#fff" stopOpacity={0} />
          </SvgLinear>
          <Mask id="qh-beam-mask"><Rect width={w + 60} height={h} fill="url(#qh-beam-fade)" /></Mask>
        </Defs>
        <Rect width={w + 60} height={h} fill="url(#qh-beam)" mask="url(#qh-beam-mask)" />
      </Svg>
    </Animated.View>
  );
}

/** .q-hero background: white marble with gold (dark: deep green), the light of the lattice dome, the floral inlay */
export function QuranHeroBackdrop({ width, height, pal, reduce, inlay }: { width: number; height: number; pal: QPal; reduce: boolean; inlay: number }) {
  // the light falls on the medallion; a right-to-left layout puts the medallion on the left, so the light follows it
  const rtl = I18nManager.isRTL;
  const sunX = rtl ? "18%" : "82%";
  const sun = pal.dark ? "rgb(214,180,108)" : "rgb(255,233,178)";
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[pal.marbleA, pal.marbleB]} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="qh-sun" cx={sunX} cy="38%" rx="70%" ry="90%" fx={sunX} fy="38%">
            <Stop offset="0" stopColor={sun} stopOpacity={pal.dark ? 0.16 : 0.55} /><Stop offset="0.62" stopColor={sun} stopOpacity={0} />
          </RadialGradient>
          {pal.dark ? (
            <RadialGradient id="qh-under" cx="50%" cy="-20%" rx="71%" ry="170%" fx="50%" fy="-20%">
              <Stop offset="0" stopColor="rgb(18,74,56)" stopOpacity={0.9} /><Stop offset="0.6" stopColor="rgb(18,74,56)" stopOpacity={0} />
            </RadialGradient>
          ) : (
            <RadialGradient id="qh-under" cx={rtl ? "100%" : "0%"} cy="100%" rx="50%" ry="70%" fx={rtl ? "100%" : "0%"} fy="100%">
              <Stop offset="0" stopColor="rgb(214,180,108)" stopOpacity={0.14} /><Stop offset="0.7" stopColor="rgb(214,180,108)" stopOpacity={0} />
            </RadialGradient>
          )}
        </Defs>
        <Rect width="100%" height="100%" fill="url(#qh-under)" />
        <Rect width="100%" height="100%" fill="url(#qh-sun)" />
      </Svg>
      {width > 0 && height > 0 ? <HeroLattice w={width} h={height} reduce={reduce} /> : null}
      <View style={{ position: "absolute", start: -24, bottom: -16, transform: rtl ? [{ scaleX: -1 }] : undefined }}>
        <QuranInlay size={inlay} color={pal.gold} />
      </View>
      {width > 0 && height > 0 ? <HeroBeams w={width} h={height} dark={pal.dark} reduce={reduce} /> : null}
    </View>
  );
}

// ---------- the shamsa ----------
// Amiri's vertical metrics (em): the baseline lies (ascent - descent) / 2 below the centre of a line box
const AMIRI_ASC = 1.124, AMIRI_DESC = 0.634, AMIRI_SPACE = 0.292;

/** the ring of verses, set on the circle r = 144 like <textPath>: every word is shaped as a whole (so the letters
 *  join on every platform) and turned to the tangent; the words are measured once, then placed */
function VerseRing({ text, size, color }: { text: string; size: number; color: string }) {
  const words = useMemo(() => text.split(" ").filter(Boolean), [text]);
  const fs = (size * 19) / 400;
  const style: TextStyle = { fontFamily: ARABIC_FONT, fontSize: fs, lineHeight: fs * (AMIRI_ASC + AMIRI_DESC), color, includeFontPadding: false, writingDirection: "rtl" };
  const acc = useRef(new Map<number, number[]>());
  const [measured, setMeasured] = useState<{ fs: number; w: number[] } | null>(null);
  const onWord = (i: number) => (e: LayoutChangeEvent) => {
    const arr = acc.current.get(fs) ?? [];
    arr[i] = e.nativeEvent.layout.width;
    acc.current.set(fs, arr);
    if (words.every((_, k) => arr[k] !== undefined)) setMeasured({ fs, w: arr.slice(0, words.length) });
  };
  const w = measured && measured.fs === fs && measured.w.length === words.length ? measured.w : null;
  if (!w) {
    return (
      <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, opacity: 0, alignItems: "flex-start" }}>
        {words.map((word, i) => <Text key={`${fs}-${i}`} allowFontScaling={false} numberOfLines={1} onLayout={onWord(i)} style={style}>{word}</Text>)}
      </View>
    );
  }
  // the text starts at the left of the circle (startOffset 0) and runs clockwise over the top; Arabic reads from its
  // far end back towards the start, so the first word stands furthest along the path
  const r = (size * 144) / 400;
  const gap = fs * AMIRI_SPACE;
  const total = w.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  const lift = r + (fs * (AMIRI_ASC - AMIRI_DESC)) / 2;
  let run = 0;
  return (
    <>
      {words.map((word, i) => {
        const mid = run + w[i] / 2;
        run += w[i] + gap;
        const theta = Math.PI + (total - mid) / r;
        return (
          <View key={i} pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
            <Text allowFontScaling={false} numberOfLines={1}
              style={[style, { transform: [{ translateX: Math.cos(theta) * lift }, { translateY: Math.sin(theta) * lift }, { rotate: `${(theta * 180) / Math.PI + 90}deg` }] }]}>{word}</Text>
          </View>
        );
      })}
    </>
  );
}

/** QuranShamsa: rays that turn slowly, a ring of verses turning the other way, a scalloped gold band and a dark
 *  centre with "al-Qur'an al-Karim" in gold */
export const QuranShamsa = memo(function QuranShamsa({ size, pal, reduce, ring = QURAN_RING, lines = SHAMSA_LINES }: { size: number; pal: QPal; reduce: boolean; ring?: string; lines?: readonly [string, string] }) {
  const rays = useSpin(!reduce, 220_000), verse = useSpin(!reduce, 160_000), star = useSpin(!reduce, 90_000);
  const breath = usePingPong(!reduce, 4500);
  const first = useFadeAfter(reduce, 300, 3400), second = useFadeAfter(reduce, 1100, 3400);
  const line = pal.gold;
  const glow = pal.dark ? "rgb(214,180,108)" : "rgb(255,226,160)";
  const inset = size * 0.06;
  const layer = { position: "absolute" as const, top: 0, left: 0, width: size, height: size };
  return (
    <View style={{ width: size, height: size }} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {/* .q-shamsa-glow: breathes (scale .94 to 1.06 over 9 s) */}
      <Animated.View style={[{ position: "absolute", top: inset, left: inset, right: inset, bottom: inset },
        reduce ? null : { opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }), transform: [{ scale: breath.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] }) }] }]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="qs-glow" cx={50} cy={50} r={70.71} fx={50} fy={50} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={glow} stopOpacity={pal.dark ? 0.22 : 0.55} /><Stop offset="0.68" stopColor={glow} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={100} height={100} fill="url(#qs-glow)" />
        </Svg>
      </Animated.View>
      <Animated.View style={[layer, { transform: [{ rotate: turn(rays) }] }]}>
        <Svg width={size} height={size} viewBox="0 0 400 400">
          <Path d={RAYS} fill="none" stroke={line} strokeOpacity={0.55} strokeWidth={1} />
          {DOTS.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={1.7} fill={line} fillOpacity={0.55} />)}
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 400 400" style={layer}>
        <Defs>
          <RadialGradient id="qs-disc" cx="50%" cy="38%" r="70%" fx="50%" fy="38%">
            <Stop offset="0" stopColor="#135640" /><Stop offset="0.6" stopColor="#0a3427" /><Stop offset="1" stopColor="#05211a" />
          </RadialGradient>
          <SvgLinear id="qs-gold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#f6e7bf" /><Stop offset="0.42" stopColor="#d9b56c" /><Stop offset="0.7" stopColor="#f3e2b6" /><Stop offset="1" stopColor="#b98f45" />
          </SvgLinear>
          <Pattern id="qs-girih" width={28} height={28} patternUnits="userSpaceOnUse">
            <Path d="M7 7h14v14H7zM14 2.5L25.5 14 14 25.5 2.5 14z" fill="none" stroke="#e9cf99" strokeOpacity={0.12} strokeWidth={0.8} />
          </Pattern>
        </Defs>
        <Circle cx={200} cy={200} r={168} fill="none" stroke={line} strokeOpacity={0.55} strokeWidth={1.3} />
        <Circle cx={200} cy={200} r={163} fill="none" stroke={line} strokeOpacity={0.55} strokeWidth={0.6} strokeDasharray="1.5 4" />
        <Circle cx={200} cy={200} r={134} fill="none" stroke={line} strokeOpacity={0.55} strokeWidth={1} />
        <Path d={LOBES} fill={line} fillOpacity={0.1} stroke={line} strokeOpacity={0.7} strokeWidth={1} />
        <Circle cx={200} cy={200} r={106} fill="url(#qs-disc)" stroke="url(#qs-gold)" strokeWidth={2} />
        <Circle cx={200} cy={200} r={106} fill="url(#qs-girih)" />
        <Circle cx={200} cy={200} r={99} fill="none" stroke="#e9cf99" strokeOpacity={0.45} strokeWidth={0.8} strokeDasharray="1 3" />
        <Path d="M200 116l3 7.2 7.2 3-7.2 3-3 7.2-3-7.2-7.2-3 7.2-3z" fill="url(#qs-gold)" opacity={0.85} />
      </Svg>
      {/* .q-shamsa-verse: the ring of verses turns back once in 160 s */}
      <Animated.View style={[layer, { transform: [{ rotate: turn(verse, -1) }] }]}>
        <VerseRing text={ring} size={size} color={withAlpha(pal.inkGold, 0.9)} />
      </Animated.View>
      <Animated.View style={[layer, { transform: [{ rotate: turn(star) }] }]}>
        <Svg width={size} height={size} viewBox="0 0 400 400">
          <Path d={BIG_STAR} fill="none" stroke="#e9cf99" strokeOpacity={0.2} strokeWidth={1} />
        </Svg>
      </Animated.View>
      {/* the calligraphy is set as text (not SVG) so the letters join on every device; it fades in where the website draws it */}
      <View style={[layer, { alignItems: "center", justifyContent: "center", paddingTop: size * 0.07 }]}>
        <Animated.Text allowFontScaling={false} style={{ opacity: first, fontFamily: CALLIG_FONT, fontSize: size * 0.15, lineHeight: size * 0.22, color: "#e9cf99", writingDirection: "rtl", textAlign: "center" }}>{lines[0]}</Animated.Text>
        <Animated.Text allowFontScaling={false} style={{ opacity: second, fontFamily: CALLIG_FONT, fontSize: size * 0.09, lineHeight: size * 0.13, color: "#e9cf99", writingDirection: "rtl", textAlign: "center" }}>{lines[1]}</Animated.Text>
      </View>
    </View>
  );
});

// ---------- juz head ----------
/** .q-juz-head: emerald with a gold glow from the top corner and a girih lattice fading in from the right */
export function JuzHeadArt() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={EMERALD} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="qj-glow" cx="100%" cy="0%" rx="120%" ry="140%" fx="100%" fy="0%">
            <Stop offset="0" stopColor="rgb(214,180,108)" stopOpacity={0.18} /><Stop offset="0.55" stopColor="rgb(214,180,108)" stopOpacity={0} />
          </RadialGradient>
          <Pattern id="qj-girih" width={28} height={28} patternUnits="userSpaceOnUse">
            <Path d="M7 7h14v14H7zM14 2.5L25.5 14 14 25.5 2.5 14z" fill="none" stroke="#e9cf99" strokeOpacity={0.1} strokeWidth={0.8} />
          </Pattern>
          <SvgLinear id="qj-fade" x1="1" y1="0" x2="0" y2="0">
            <Stop offset="0" stopColor="#fff" stopOpacity={0.9} /><Stop offset="0.7" stopColor="#fff" stopOpacity={0} />
          </SvgLinear>
          <Mask id="qj-mask"><Rect width="100%" height="100%" fill="url(#qj-fade)" /></Mask>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#qj-glow)" />
        <Rect width="100%" height="100%" fill="url(#qj-girih)" mask="url(#qj-mask)" />
      </Svg>
    </View>
  );
}

// ---------- place of revelation and the 30 parts (QuranMeta.ts) ----------
// Place of revelation as Quran.com lists it (used when the chapter data does not carry revelation_place)
const MADANI = new Set([2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 99, 110]);
export function placeOf(c: Chapter): Place {
  const p = c.revelation_place;
  if (p) return /madin|medin/i.test(p) ? "madani" : "makki";
  return MADANI.has(c.id) ? "madani" : "makki";
}

const starts = JUZ_START.map((k) => k.split(":").map(Number) as [number, number]);
export type JuzPart = { s: number; from: number; to: number };
export type Juz = { n: number; from: string; to: string; total: number; parts: JuzPart[] };
/** the 30 parts: where each begins and ends, and the part of every surah that lies inside it */
export const JUZ: Juz[] = starts.map(([s0, v0], i) => {
  const next = starts[i + 1];
  const [s1, v1] = next ? (next[1] > 1 ? [next[0], next[1] - 1] : [next[0] - 1, VERSE_COUNTS[next[0] - 2]]) : [114, VERSE_COUNTS[113]];
  const parts: JuzPart[] = [];
  for (let s = s0; s <= s1; s++) parts.push({ s, from: s === s0 ? v0 : 1, to: s === s1 ? v1 : VERSE_COUNTS[s - 1] });
  return { n: i + 1, from: `${s0}:${v0}`, to: `${s1}:${v1}`, total: parts.reduce((a, p) => a + p.to - p.from + 1, 0), parts };
});
/** part in which each surah begins (index 0 = surah 1) */
export const JUZ_OF_SURAH: number[] = Array.from({ length: 114 }, (_, i) => JUZ.find((j) => j.parts.some((p) => p.s === i + 1 && p.from === 1))?.n ?? 1);
