import { useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, Pattern, Path, Rect, RadialGradient, Stop } from "react-native-svg";
import { ARABIC_BOLD, ARABIC_FONT, FONT, stage, useTheme } from "@/lib/theme";
import { IslamNum, IslBreak, QuoteStar, StarMark, saw, useSvgId } from "./art";
import { STAGE_GOLD, SERIF, SERIF_ITALIC, useIsl, type Isl } from "./palette";
import { openHref, openVerse } from "./links";

// Native port of the website's src/components/Markdown.tsx: our own small Markdown (## / ### headings, - and 1. lists,
// > quotes, **bold**, *italic*, [links](/path)). Variant "plain" is the compact look of side texts; variant "article"
// sets long chapters like an illuminated book: an illuminated initial, numbered section medallions with ornamental
// breaks, framed quotations, verse references as gold chips that open the verse, Arabic in Amiri (right to left), and
// the 99 names as calligraphy tiles. The parsing rules are the website's, character for character.

// ---------- parsing (identical to the website) ----------
type Item = { text: string; sub: boolean };
type Block = { kind: "h2"; text: string } | { kind: "h3"; text: string } | { kind: "p"; text: string } | { kind: "quote"; text: string } | { kind: "ul"; items: Item[] } | { kind: "ol"; items: Item[] };

export function parse(text: string): Block[] {
  const out: Block[] = [];
  let para: string[] = [], quote: string[] = [];
  const flush = () => {
    if (para.length) { out.push({ kind: "p", text: para.join(" ") }); para = []; }
    if (quote.length) { out.push({ kind: "quote", text: quote.join(" ") }); quote = []; }
  };
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) { flush(); continue; }
    if (line.startsWith("> ")) { if (para.length) { out.push({ kind: "p", text: para.join(" ") }); para = []; } quote.push(line.slice(2).trim()); continue; }
    const ul = line.match(/^(\s*)[-*] (.*)$/), ol = line.match(/^(\s*)\d+[.)] (.*)$/);
    if (line.startsWith("### ")) { flush(); out.push({ kind: "h3", text: line.slice(4) }); continue; }
    if (line.startsWith("## ")) { flush(); out.push({ kind: "h2", text: line.slice(3) }); continue; }
    if (ul || ol) {
      flush();
      const kind = ul ? "ul" : "ol";
      const m = (ul ?? ol)!;
      const last = out[out.length - 1];
      const item = { text: m[2], sub: m[1].length > 0 };
      if (last && (last.kind === kind || (item.sub && (last.kind === "ul" || last.kind === "ol")))) (last as { items: Item[] }).items.push(item);
      else out.push(kind === "ul" ? { kind: "ul", items: [item] } : { kind: "ol", items: [item] });
      continue;
    }
    if (quote.length) { out.push({ kind: "quote", text: quote.join(" ") }); quote = []; }
    para.push(line.trim());
  }
  flush();
  return out;
}

/** the "## " headings of a text, in order (tables of contents) */
export function mdHeadings(text: string): string[] {
  return text.replace(/\r/g, "").split("\n").filter((l) => l.startsWith("## ")).map((l) => l.slice(3).replace(/\*\*/g, "").trim());
}

const AR_CH = "\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDF9\\uFDFB-\\uFDFF\\uFE70-\\uFEFF";
const AR_ANY = new RegExp(`[${AR_CH}]`, "g");
const NON_LETTER = /[\s\d\p{P}\p{S}]/gu;
export const isArabic = (s: string) => { const letters = s.replace(NON_LETTER, ""); return letters.length > 0 && (s.match(AR_ANY)?.length ?? 0) / letters.length > 0.6; };
const REF = /(?<![\d:.,])(\d{1,3}):(\d{1,3})(?:\s*[–-]\s*(\d{1,3}))?(?![\d:])/g;
const validRef = (s: number, v: number) => s >= 1 && s <= 114 && v >= 1 && v <= 286;
export const hasRef = (s: string) => { for (const m of s.matchAll(REF)) if (validRef(+m[1], +m[2])) return true; return false; };
const LEAD_QUOTE = /^([„“"«])(.{40,}?)([“”"»])\s*(?:\(([^()]+)\))?([.,;:!?]?)\s*(.*)$/s;
const NAME_ITEM = /^\*\*([^*]+)\*\*\s*[–-]\s*(.+)$/;

// ---------- inline segments of the article variant ----------
type Seg =
  | { t: "text"; s: string } | { t: "b"; s: string } | { t: "ar"; s: string } | { t: "i"; s: string } | { t: "a"; s: string; href: string }
  | { t: "chip"; label: string; s: string; v: string }
  | { t: "paren"; parts: Seg[] }
  | { t: "qq"; open: string; body: string; close: string; ws: string; paren: Seg };

// "(Koran 2:255)" becomes one chip; longer parentheses keep their text and get a chip for every reference
function refParen(inner: string): Seg {
  const refs = [...inner.matchAll(REF)].filter((m) => validRef(+m[1], +m[2]));
  if (refs.length === 1 && inner.length <= 34) return { t: "chip", label: inner.trim(), s: refs[0][1], v: refs[0][2] };
  const parts: Seg[] = [{ t: "text", s: "(" }];
  let last = 0;
  for (const m of refs) {
    parts.push({ t: "text", s: inner.slice(last, m.index) });
    parts.push({ t: "chip", label: m[0], s: m[1], v: m[2] });
    last = m.index! + m[0].length;
  }
  parts.push({ t: "text", s: inner.slice(last) + ")" });
  return { t: "paren", parts };
}

function inlineSegs(text: string, arabicDoc: boolean): Seg[] {
  const out: Seg[] = [];
  const re = new RegExp(
    String.raw`\*\*(.+?)\*\*` +
    String.raw`|\[([^\]]+)\]\(([^)\s]+)\)` +
    String.raw`|\*([^*\s][^*]*?)\*` +
    String.raw`|([„“"«])([^„“”"«»]{6,}?)([“”"»])(\s*)\(([^()]*?\d{1,3}:\d{1,3}[^()]*?)\)` +
    String.raw`|\(([^()]*?\d{1,3}:\d{1,3}[^()]*?)\)` +
    (arabicDoc ? "" : `|([${AR_CH}][${AR_CH}\\u064B-\\u065F\\u0670]*(?:\\s+[${AR_CH}][${AR_CH}\\u064B-\\u065F\\u0670]*)*)`),
    "g");
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[11] !== undefined && (m[11].replace(/[^ء-ي]/g, "").length < 2)) continue; // a lone ﷺ or letter stays as it is
    if ((m[9] !== undefined && !hasRef(m[9])) || (m[10] !== undefined && !hasRef(m[10]))) continue;
    if (m.index > last) out.push({ t: "text", s: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push(!arabicDoc && isArabic(m[1]) ? { t: "ar", s: m[1] } : { t: "b", s: m[1] });
    else if (m[4] !== undefined) out.push({ t: "i", s: m[4] });
    else if (m[3] !== undefined) out.push({ t: "a", s: m[2], href: m[3] });
    else if (m[5] !== undefined) out.push({ t: "qq", open: m[5], body: m[6], close: m[7], ws: m[8], paren: refParen(m[9]) });
    else if (m[10] !== undefined) out.push(refParen(m[10]));
    else if (m[11] !== undefined) out.push({ t: "ar", s: m[11] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: "text", s: text.slice(last) });
  return out;
}

const segText = (g: Seg): string => {
  switch (g.t) {
    case "chip": return g.label;
    case "paren": return g.parts.map(segText).join("");
    case "qq": return g.open + g.body + g.close + g.ws + segText(g.paren);
    default: return g.s;
  }
};

type Ctx = { isl: Isl; dark: boolean; size: number; lh: number };

/** a verse chip inside running text (an inline view; tap opens the verse) */
function InlineChip({ label, s, v, ctx }: { label: string; s: string; v: string; ctx: Ctx }) {
  const fs = Math.round(ctx.size * 0.74 * 10) / 10;
  const color = ctx.dark ? STAGE_GOLD : ctx.isl.gold;
  return (
    <Pressable onPress={() => openVerse(s, v)} accessibilityRole="link" accessibilityLabel={label} hitSlop={6} style={{ transform: [{ translateY: ctx.size * 0.2 }] }}>
      {({ pressed }) => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginHorizontal: 2, paddingLeft: 5, paddingRight: 7, borderRadius: 999, borderWidth: 1,
          borderColor: ctx.dark ? "rgba(233,207,153,0.4)" : ctx.isl.a("goldSoft", 0.45), backgroundColor: pressed ? ctx.isl.a("goldSoft", 0.35) : ctx.dark ? "rgba(233,207,153,0.1)" : ctx.isl.a("goldSoft", 0.12) }}>
          <StarMark size={fs * 0.95} color={color} center={ctx.dark ? stage.bg : ctx.isl.paper} />
          <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: fs, lineHeight: fs * 1.4, color, fontVariant: ["tabular-nums"] }}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

function renderSeg(g: Seg, k: string, ctx: Ctx, plain = false): ReactNode {
  const { isl, dark } = ctx;
  const gold = dark ? STAGE_GOLD : isl.gold;
  switch (g.t) {
    case "text": return <Text key={k}>{saw(g.s, gold, k)}</Text>;
    case "b": return <Text key={k} style={{ fontFamily: FONT.semibold, color: dark ? "#ffffff" : isl.ink }}>{saw(g.s, gold, k)}</Text>;
    case "ar": return <Text key={k} style={{ fontFamily: ARABIC_BOLD, fontSize: ctx.size * 1.22, lineHeight: ctx.lh, color: gold, writingDirection: "rtl" }}>{g.s}</Text>;
    case "i": return <Text key={k} style={{ fontFamily: FONT.italic }}>{g.s}</Text>;
    case "a": return (
      <Text key={k} onPress={plain ? undefined : () => openHref(g.href)} accessibilityRole="link"
        style={{ fontFamily: FONT.semibold, color: dark ? stage.gold : isl.accent, textDecorationLine: "underline", textDecorationColor: isl.a("goldSoft", 0.5) }}>{g.s}</Text>
    );
    // measuring copy: the label alone, set a little wider so it takes about the room of the chip
    case "chip": return plain ? <Text key={k} style={{ fontFamily: FONT.bold, fontSize: ctx.size * 0.86, letterSpacing: 1.2 }}>{g.label}</Text> : <InlineChip key={k} label={g.label} s={g.s} v={g.v} ctx={ctx} />;
    case "paren": return <Text key={k}>{g.parts.map((p, i) => renderSeg(p, `${k}p${i}`, ctx, plain))}</Text>;
    case "qq": return (
      <Text key={k}>
        <Text style={{ backgroundColor: isl.a("goldSoft", 0.16) }}>{g.open}{saw(g.body, gold, `${k}q`)}{g.close}</Text>
        {g.ws}{renderSeg(g.paren, `${k}r`, ctx, plain)}
      </Text>
    );
  }
}

function useCtx(dark: boolean, size: number, lh: number): Ctx {
  const isl = useIsl();
  return { isl, dark, size, lh };
}

// ---------- article blocks ----------

/** quotation from the Quran or the Sunnah, set like a framed passage of a manuscript (.isl-quote) */
export function FramedQuote({ children, cite, citeNode, size = 17, dark = false, style }: { children: ReactNode; cite?: string; citeNode?: ReactNode; size?: number; dark?: boolean; style?: StyleProp<ViewStyle> }) {
  const isl = useIsl();
  const id = useSvgId("q");
  const fs = size * 1.16;
  return (
    <View style={[{ marginTop: size * 2 + 6, marginBottom: size * 1.6 }, style]}>
      <View style={{ borderRadius: 14, borderWidth: 1, borderColor: dark ? "rgba(233,207,153,0.3)" : isl.a("goldSoft", 0.35), backgroundColor: dark ? "rgba(255,255,255,0.03)" : isl.a("surface", 0.55), paddingTop: size * 1.75, paddingHorizontal: size * 1.4, paddingBottom: size * 1.3 }}>
        <Svg style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} pointerEvents="none">
          <Defs>
            <RadialGradient id={id} cx="50%" cy="0%" rx="100%" ry="120%">
              <Stop offset="0" stopColor={dark ? "rgb(233,207,153)" : isl.goldSoft} stopOpacity={dark ? 0.1 : 0.13} />
              <Stop offset="0.7" stopColor={dark ? "rgb(233,207,153)" : isl.goldSoft} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" rx={14} fill={`url(#${id})`} />
        </Svg>
        <View pointerEvents="none" style={{ position: "absolute", top: 5, left: 5, right: 5, bottom: 5, borderRadius: 10, borderWidth: 1, borderColor: dark ? "rgba(233,207,153,0.16)" : isl.a("goldSoft", 0.18) }} />
        <Text style={{ fontFamily: SERIF_ITALIC, fontStyle: "italic", fontSize: fs, lineHeight: fs * 1.65, color: dark ? "#f3ead6" : isl.head, textAlign: "center" }}>{children}</Text>
        {citeNode ? <View style={{ marginTop: size * 0.7, alignItems: "center" }}>{citeNode}</View>
          : cite ? <Text style={{ marginTop: size * 0.7, textAlign: "center", fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.44, textTransform: "uppercase", color: dark ? STAGE_GOLD : isl.gold }}>{cite}</Text> : null}
      </View>
      <View pointerEvents="none" style={{ position: "absolute", top: -17, left: 0, right: 0, alignItems: "center" }}>
        <QuoteStar color={dark ? "rgb(233,207,153)" : isl.goldSoft} bg={dark ? stage.bg : isl.paper} />
      </View>
    </View>
  );
}

/** the cite line of a quotation: a chip if it holds a verse reference, otherwise small gold capitals */
function CiteRefs({ cite, ctx }: { cite: string; ctx: Ctx }) {
  const seg = refParen(cite);
  if (seg.t === "chip") return <InlineChip label={seg.label} s={seg.s} v={seg.v} ctx={{ ...ctx, size: ctx.size * 1.05 }} />;
  return <Text style={{ fontFamily: FONT.regular, fontSize: ctx.size * 0.95, lineHeight: ctx.lh, color: ctx.isl.muted, textAlign: "center" }}>{renderSeg(seg, "c", ctx)}</Text>;
}

/** a passage written in Arabic, inside a fine illuminated frame (.isl-arpanel) */
function ArabicPanel({ text, size }: { text: string; size: number }) {
  const isl = useIsl();
  const id = useSvgId("ap");
  const fs = size * 1.45;
  return (
    <View style={{ marginVertical: size * 1.6, borderRadius: 14, borderWidth: 1, borderColor: isl.a("goldSoft", 0.45), backgroundColor: isl.a("surface", 0.6), paddingVertical: size * 1.3, paddingHorizontal: size * 1.4 }}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="0%" rx="100%" ry="100%">
            <Stop offset="0" stopColor={isl.goldSoft} stopOpacity={0.14} /><Stop offset="0.7" stopColor={isl.goldSoft} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" rx={14} fill={`url(#${id})`} />
      </Svg>
      <View pointerEvents="none" style={{ position: "absolute", top: 5, left: 5, right: 5, bottom: 5, borderRadius: 10, borderWidth: 1, borderStyle: "dashed", borderColor: isl.a("goldSoft", 0.3) }} />
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: fs, lineHeight: fs * 2.05, color: isl.head, textAlign: "center", writingDirection: "rtl" }}>{text}</Text>
    </View>
  );
}

/** the illuminated initial: a gold letter on emerald in a gilded frame (.isl-drop::first-letter) */
function DropCap({ letter, size }: { letter: string; size: number }) {
  const id = useSvgId("dc");
  return (
    <View style={{ width: 64, height: 78, borderRadius: 6, overflow: "hidden", alignItems: "center", justifyContent: "center", marginTop: size * 0.36, marginRight: 13 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id={`${id}r`} cx="30%" cy="20%" r="90%"><Stop offset="0" stopColor="rgb(18,92,68)" /><Stop offset="1" stopColor="rgb(6,40,30)" /></RadialGradient>
          <Pattern id={`${id}p`} width={18} height={18} patternUnits="userSpaceOnUse">
            <Path d="M4.5 4.5h9v9h-9zM9 1.9l7.1 7.1L9 16.1 1.9 9z" fill="none" stroke="#d6b46c" strokeOpacity={0.18} strokeWidth={0.6} />
          </Pattern>
        </Defs>
        <Rect width={100} height={100} fill={`url(#${id}r)`} />
        <Rect width={100} height={100} fill={`url(#${id}p)`} />
        <Rect x={3} y={3} width={94} height={94} rx={4} fill="none" stroke="#d6b46c" strokeOpacity={0.9} strokeWidth={1.6} />
        <Rect x={8} y={8} width={84} height={84} rx={2} fill="none" stroke="#d6b46c" strokeOpacity={0.45} strokeWidth={1} />
        <Path d="M8 3l2 5-2 5-2-5z M92 3l2 5-2 5-2-5z M8 87l2 5-2 5-2-5z M92 87l2 5-2 5-2-5z" fill="#d6b46c" />
      </Svg>
      <Text allowFontScaling={false} style={{ fontFamily: SERIF, fontWeight: "600", fontSize: size * 3.3, lineHeight: size * 3.6, color: "rgb(233,207,153)", textAlign: "center", includeFontPadding: false }}>{letter}</Text>
    </View>
  );
}

/** split segments after `n` characters of display text (composite pieces stay whole) */
function splitSegs(segs: Seg[], n: number): [Seg[], Seg[]] {
  const a: Seg[] = [], b: Seg[] = [];
  let used = 0;
  for (const g of segs) {
    const len = segText(g).length;
    if (used >= n) { b.push(g); continue; }
    if (used + len <= n) { a.push(g); used += len; continue; }
    const cut = n - used;
    if (g.t === "text" || g.t === "b" || g.t === "i" || g.t === "a" || g.t === "ar") {
      a.push({ ...g, s: g.s.slice(0, cut) } as Seg);
      b.push({ ...g, s: g.s.slice(cut) } as Seg);
    } else b.push(g);
    used = n;
  }
  return [a, b];
}

/** the opening paragraph with the illuminated initial; the text beside it is measured so it wraps around the initial */
function LeadWithInitial({ segs, ctx, style }: { segs: Seg[]; ctx: Ctx; style: StyleProp<TextStyle> }) {
  const [w, setW] = useState(0);
  const [cut, setCut] = useState<number | null>(null);
  // the first letter of the first piece with text (as ::first-letter does, also inside **bold**)
  const { letter, rest } = useMemo(() => {
    const i = segs.findIndex((g) => segText(g).trim().length > 0);
    const g = segs[i];
    if (!g || !(g.t === "text" || g.t === "b" || g.t === "i")) return { letter: "", rest: segs };
    const lead = g.s.match(/^\s*/)![0].length;
    const ch = [...g.s.slice(lead)][0] ?? "";
    const copy = segs.slice();
    copy[i] = { ...g, s: g.s.slice(lead + ch.length) };
    return { letter: ch, rest: copy };
  }, [segs]);
  const full = segs.map(segText).join("");
  const colW = w - 64 - 13;
  if (!letter) return <Text style={style}>{segs.map((g, i) => renderSeg(g, `l${i}`, ctx))}</Text>;
  const onLayout = (e: LayoutChangeEvent) => { const nw = e.nativeEvent.layout.width; if (Math.abs(nw - w) > 1) { setW(nw); setCut(null); } };
  let body: ReactNode;
  if (!w || cut === null) {
    body = (
      <>
        <Text style={style}>{segs.map((g, i) => renderSeg(g, `l${i}`, ctx))}</Text>
        {w ? (
          <Text style={[style, { position: "absolute", opacity: 0, width: colW, left: 0, top: 0 }]} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
            onTextLayout={(e) => { const lines = e.nativeEvent.lines; setCut(lines.slice(0, 3).reduce((n, l) => n + l.text.length, 0)); }}>
            {rest.map((g, i) => renderSeg(g, `m${i}`, ctx, true))}
          </Text>
        ) : null}
      </>
    );
  } else {
    const [a, b] = splitSegs(rest, cut);
    body = (
      <View accessible accessibilityLabel={full}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <DropCap letter={letter} size={ctx.size} />
          <Text style={[style, { flex: 1 }]}>{a.map((g, i) => renderSeg(g, `a${i}`, ctx))}</Text>
        </View>
        {b.length && b.some((g) => segText(g).trim()) ? <Text style={style}>{b.map((g, i) => renderSeg(g, `b${i}`, ctx))}</Text> : null}
      </View>
    );
  }
  return <View onLayout={onLayout}>{body}</View>;
}

/** the 99 names and similar lists: tiles of Arabic calligraphy (.isl-names) */
function NameTiles({ items }: { items: Item[] }) {
  const isl = useIsl();
  const rows: Item[][] = [];
  items.forEach((it, i) => { if (i % 2 === 0) rows.push([]); rows[rows.length - 1].push(it); });
  return (
    <View style={{ gap: 10, marginTop: 24 }}>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: "row", gap: 10 }}>
          {r.map((it, ci) => {
            const li = ri * 2 + ci;
            const m = it.text.match(NAME_ITEM)!;
            const rest = m[2].split(/\s+[–-]\s+/);
            return (
              <View key={li} style={{ flex: 1, minWidth: 0, alignItems: "center", gap: 4, paddingTop: 16, paddingHorizontal: 10, paddingBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: isl.a("goldSoft", 0.3), backgroundColor: isl.a("surface", 0.6), overflow: "hidden" }}
                accessible accessibilityLabel={`${li + 1}. ${m[1]}, ${m[2]}`}>
                <LinearGradient pointerEvents="none" colors={[isl.a("goldSoft", 0.12), "transparent"]} style={[StyleSheet.absoluteFill, { height: 90 }]} />
                <View pointerEvents="none" style={{ position: "absolute", top: 5, left: 5, right: 5, bottom: 5, borderTopLeftRadius: 60, borderTopRightRadius: 60, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderWidth: 1, borderColor: isl.a("goldSoft", 0.16) }} />
                <Text style={{ position: "absolute", top: 7, left: 9, fontFamily: FONT.bold, fontSize: 10, color: isl.muted, fontVariant: ["tabular-nums"] }}>{li + 1}</Text>
                <Text style={{ fontFamily: ARABIC_BOLD, fontSize: 26, lineHeight: 44, color: isl.gold, writingDirection: "rtl" }}>{m[1]}</Text>
                <Text style={{ fontSize: 13.5, lineHeight: 19.6, color: isl.a("ink", 0.8), textAlign: "center", fontFamily: FONT.regular }}>
                  {rest.length > 1 ? <><Text style={{ fontFamily: FONT.bold, color: isl.ink }}>{rest[0]}{"\n"}</Text>{rest.slice(1).join(" – ")}</> : rest[0]}
                </Text>
              </View>
            );
          })}
          {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
}

/** long text set like an illuminated book (Markdown variant "article"); reports where each "## " section starts */
export function Article({ text, numbered = true, onHeading }: { text: string; numbered?: boolean; onHeading?: (n: number, y: number) => void }) {
  const isl = useIsl();
  const SIZE = 17, LH = 30.6;
  const ctx = useCtx(false, SIZE, LH);
  const blocks = useMemo(() => parse(text), [text]);
  const arabicDoc = useMemo(() => (text.match(AR_ANY)?.length ?? 0) > text.replace(NON_LETTER, "").length * 0.3, [text]);
  const base: TextStyle = { fontFamily: FONT.regular, fontSize: SIZE, lineHeight: LH, color: isl.a("ink", 0.9), writingDirection: arabicDoc ? "rtl" : undefined };
  const segs = (t: string) => inlineSegs(t, arabicDoc);
  const inl = (t: string, k: string) => segs(t).map((g, i) => renderSeg(g, `${k}${i}`, ctx));
  const gap = SIZE * 1.05;
  let h2n = 0, firstP = true;
  const out: ReactNode[] = [];
  blocks.forEach((b, bi) => {
    if (b.kind === "h2") {
      h2n++;
      const n = h2n;
      if (bi > 0) out.push(<IslBreak key={`br${bi}`} />);
      out.push(
        <View key={bi} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }} onLayout={onHeading ? (e) => onHeading(n, e.nativeEvent.layout.y) : undefined}>
          <IslamNum n={numbered ? n : ""} size={32.5} fontSize={13} />
          <Text accessibilityRole="header" style={{ flex: 1, fontFamily: SERIF, fontWeight: "600", fontSize: SIZE * 1.62, lineHeight: SIZE * 1.62 * 1.18, letterSpacing: -0.4, color: isl.head }}>{inl(b.text, `h${bi}`)}</Text>
        </View>,
      );
      return;
    }
    if (b.kind === "h3") {
      out.push(
        <View key={bi} style={{ flexDirection: "row", alignItems: "center", gap: 9, marginTop: SIZE * 1.9 }}>
          <View style={{ width: 9, height: 9, borderWidth: 1.5, borderColor: isl.goldSoft, borderRadius: 1, transform: [{ rotate: "45deg" }] }} />
          <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.bold, fontSize: SIZE * 1.08, lineHeight: SIZE * 1.08 * 1.5, color: isl.head }}>{inl(b.text, `h${bi}`)}</Text>
        </View>,
      );
      return;
    }
    if (b.kind === "quote") { out.push(<FramedQuote key={bi} size={SIZE}>{inl(b.text, `q${bi}`)}</FramedQuote>); return; }
    if (b.kind === "p") {
      if (!arabicDoc && isArabic(b.text)) { out.push(<ArabicPanel key={bi} text={b.text} size={SIZE} />); return; }
      const q = b.text.match(LEAD_QUOTE);
      if (q && (!q[4] || hasRef(q[4]) || q[4].length < 40) && (q[6] === "" || q[4] !== undefined)) {
        out.push(<FramedQuote key={`${bi}q`} size={SIZE} citeNode={q[4] ? (hasRef(q[4]) ? <CiteRefs cite={q[4]} ctx={ctx} /> : undefined) : undefined} cite={q[4] && !hasRef(q[4]) ? q[4] : undefined}>{inl(q[2], `q${bi}`)}</FramedQuote>);
        if (q[6]) out.push(<Text key={bi} style={[base, { marginTop: gap }]}>{inl(q[6], `p${bi}`)}</Text>);
        firstP = false;
        return;
      }
      const plain = b.text.replace(/^[*[\s]+/, "");
      const drop = firstP && !arabicDoc && /^\p{Lu}/u.test(plain) && b.text.length > 160;
      if (firstP) {
        const lead: TextStyle = { ...base, fontSize: SIZE * 1.12, lineHeight: SIZE * 1.12 * 1.75, marginTop: gap };
        const leadCtx = { ...ctx, size: SIZE * 1.12, lh: SIZE * 1.12 * 1.75 };
        out.push(drop
          ? <View key={bi} style={{ marginTop: gap }}><LeadWithInitial segs={segs(b.text)} ctx={leadCtx} style={{ ...lead, marginTop: 0 }} /></View>
          : <Text key={bi} style={lead}>{segs(b.text).map((g, i) => renderSeg(g, `p${bi}${i}`, leadCtx))}</Text>);
      } else out.push(<Text key={bi} style={[base, { marginTop: gap }]}>{inl(b.text, `p${bi}`)}</Text>);
      firstP = false;
      return;
    }
    // lists
    const names = b.kind === "ul" && b.items.length >= 6 && b.items.every((it) => { const m = it.text.match(NAME_ITEM); return !!m && isArabic(m[1]); });
    if (names) { out.push(<NameTiles key={bi} items={b.items} />); return; }
    if (b.kind === "ul") {
      out.push(
        <View key={bi} style={{ marginTop: gap, gap: SIZE * 0.55 }}>
          {b.items.map((it, li) => (
            <View key={li} style={{ flexDirection: "row", gap: SIZE * 0.75, marginLeft: it.sub ? SIZE * 1.6 : 0 }}>
              {it.sub
                ? <View style={{ width: 6, height: 6, marginTop: SIZE * 0.72 + 4, borderWidth: 1, borderColor: isl.goldSoft, transform: [{ rotate: "45deg" }] }} />
                : <View style={{ width: 13, height: 13, marginTop: SIZE * 0.62 + 2, alignItems: "center", justifyContent: "center", borderRadius: 2, backgroundColor: isl.a("goldSoft", 0.12), transform: [{ rotate: "45deg" }] }}>
                  <View style={{ width: 9, height: 9, backgroundColor: isl.a("goldSoft", 0.2), borderWidth: 1, borderColor: isl.goldSoft }} />
                </View>}
              <Text style={[base, { flex: 1 }]}>{inl(it.text, `u${bi}${li}`)}</Text>
            </View>
          ))}
        </View>,
      );
      return;
    }
    let n = 0;
    out.push(
      <View key={bi} style={{ marginTop: gap, gap: SIZE * 0.7 }}>
        {b.items.map((it, li) => (
          <View key={li} style={{ flexDirection: "row", alignItems: "flex-start", gap: SIZE * 0.7, marginLeft: it.sub ? SIZE * 2.2 : 0 }}>
            {it.sub
              ? <View style={{ width: 6, height: 6, marginTop: SIZE * 0.7 + 4, borderWidth: 1, borderColor: isl.goldSoft, transform: [{ rotate: "45deg" }] }} />
              : <View style={{ marginTop: 2 }}><IslamNum n={++n} size={25.3} fontSize={11.5} /></View>}
            <Text style={[base, { flex: 1 }]}>{inl(it.text, `o${bi}${li}`)}</Text>
          </View>
        ))}
      </View>,
    );
  });
  return <View>{out}</View>;
}

// ---------- plain variant ----------
function plainInline(text: string, colors: { strong: string; link: string; ext: string }, family?: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*\s][^*]*?)\*/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<Text key={`b${i++}`} style={family ? { fontFamily: family, fontWeight: "600", color: colors.strong } : { fontFamily: FONT.semibold, color: colors.strong }}>{m[1]}</Text>);
    else if (m[4]) parts.push(<Text key={`i${i++}`} style={family ? { fontStyle: "italic" } : { fontFamily: FONT.italic }}>{m[4]}</Text>);
    else {
      const href = m[3];
      parts.push(<Text key={`l${i++}`} accessibilityRole="link" onPress={() => openHref(href)} style={{ fontFamily: family ?? FONT.semibold, fontWeight: family ? "600" : undefined, color: href.startsWith("/") ? colors.link : colors.ext }}>{m[2]}</Text>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** compact Markdown (variant "plain"); `dark` = on the stage */
export function Markdown({ text, dark = false, style, size = 16, color, family }: { text: string; dark?: boolean; style?: StyleProp<ViewStyle>; size?: number; color?: string; family?: string }) {
  const t = useTheme();
  const isl = useIsl();
  const gold = dark ? stage.gold : t.gold;
  const colors = { strong: dark ? "#ffffff" : t.ink, link: dark ? stage.gold : t.accent, ext: t.accent };
  const base: TextStyle = { fontFamily: family ?? FONT.regular, fontSize: size, lineHeight: size * 1.75, color: color ?? (dark ? "rgba(255,255,255,0.8)" : isl.a("ink", 0.9)) };
  const blocks = useMemo(() => parse(text), [text]);
  const withSaw = (nodes: ReactNode[]) => nodes.map((n, i) => (typeof n === "string" ? <Text key={`s${i}`}>{saw(n, gold, `s${i}`)}</Text> : n));
  const inl = (s: string) => withSaw(plainInline(s, colors, family));
  return (
    <View style={style}>
      {blocks.map((b, bi) => {
        if (b.kind === "h2") return <Text key={bi} accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.5, color: dark ? "#ffffff" : t.ink, marginTop: 40 }}>{inl(b.text)}</Text>;
        if (b.kind === "h3") return <Text key={bi} accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 18, lineHeight: 26, color: dark ? "#ffffff" : t.ink, marginTop: 32 }}>{inl(b.text)}</Text>;
        if (b.kind === "p") return <Text key={bi} style={[base, { marginTop: 16 }]}>{inl(b.text)}</Text>;
        if (b.kind === "quote") return <View key={bi} style={{ marginTop: 16, borderLeftWidth: 2, borderLeftColor: dark ? "rgba(214,180,108,0.6)" : t.dark ? "rgba(214,178,106,0.6)" : "rgba(150,116,52,0.6)", paddingLeft: 16 }}><Text style={[base, family ? { fontStyle: "italic" } : { fontFamily: FONT.italic }]}>{inl(b.text)}</Text></View>;
        if (b.kind === "ul") return (
          <View key={bi} style={{ marginTop: 16, gap: 8 }}>
            {b.items.map((it, li) => (
              <View key={li} style={{ flexDirection: "row", gap: 12, marginLeft: it.sub ? 24 : 0 }}>
                <View style={{ width: 12, height: 1, marginTop: size * 0.875, backgroundColor: gold }} />
                <Text style={[base, { flex: 1 }]}>{inl(it.text)}</Text>
              </View>
            ))}
          </View>
        );
        return (
          <View key={bi} style={{ marginTop: 16, gap: 8, paddingLeft: 4 }}>
            {b.items.map((it, li) => (
              <View key={li} style={{ flexDirection: "row", gap: 8 }}>
                <Text style={[base, { fontFamily: FONT.bold, color: gold, minWidth: 18, textAlign: "right" }]}>{li + 1}.</Text>
                <Text style={[base, { flex: 1 }]}>{inl(it.text)}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
