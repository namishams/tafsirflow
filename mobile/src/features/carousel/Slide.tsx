import { memo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Wordmark } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ARABIC_BOLD, ARABIC_FONT, FONT } from "@/lib/theme";
import { CARD_SIZE, PALETTES, type Palette, type ShareFormat } from "@/features/share/formats";
import { OrnamentRule, Rosette, ShareFrame, ShareGround, type Lay } from "@/features/share/ShareTemplates";
import { carouselText, fill } from "./text";
import type { CarouselPayload, CarouselSlide, PaletteId, Scripture, WisdomPayload } from "./types";

// The slides of a carousel and the wisdom card, drawn like the share templates (features/share/ShareTemplates.tsx):
// the five designs (night, emerald, dawn, parchment, marble), the girih ground, the double gold frame with khatam
// corners, the ornamental rule, Amiri for Arabic, Fraunces for titles and the gold wordmark. Every slide has a fixed
// size in points (CARD_SIZE: 360 × 450 for Instagram's 4:5, 360 × 360 for 1:1, 360 × 640 for stories) and is captured
// at exactly 1080 × 1350 / 1080 × 1080 / 1080 × 1920 px. In the story format the top 250 px and the bottom 340 px
// (Instagram's own controls) hold no content: only the brand line sits low. Scripture comes from the sources
// (scripture.ts); a reference slide without its text shows the reference only.

const SERIF = "Fraunces_400Regular";
const SERIF_ITALIC = "Fraunces_400Regular_Italic";
const SERIF_BOLD = "Fraunces_600SemiBold";
const RTL = new Set(["ar", "ur", "fa", "ps"]);
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const digits = (n: number | string, lang: string) => (lang === "ar" ? String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]) : String(n));

/** per format: side padding, room above / below the content (story: Instagram's safe zones), frame, arch */
type Box = { padX: number; top: number; bottom: number; foot: number; frame: Lay };
const BOX: Record<ShareFormat, Box> = {
  post: { padX: 30, top: 34, bottom: 26, foot: 30, frame: { padX: 0, top: 0, bottom: 0, frame: 12, arch: 34, kicker: 0, foot: 0 } },
  square: { padX: 28, top: 26, bottom: 22, foot: 26, frame: { padX: 0, top: 0, bottom: 0, frame: 11, arch: 0, kicker: 0, foot: 0 } },
  // 250 px / 340 px of 1920 px at 360 pt width: 84 pt above, 114 pt below
  story: { padX: 32, top: 88, bottom: 116, foot: 34, frame: { padX: 0, top: 0, bottom: 0, frame: 14, arch: 70, kicker: 0, foot: 0 } },
};

/** a font size that lets `len` characters fill the box, within min…max */
function fit(len: number, w: number, h: number, charW: number, lineH: number, min: number, max: number) {
  if (len <= 0 || h <= 0) return max;
  const s = Math.sqrt((w * h) / (len * charW * lineH));
  return Math.max(min, Math.min(max, Math.floor(s * 2) / 2));
}
/** visible Arabic letters (marks have no width) */
const arLen = (s: string) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ\s]/g, "").length + (s.match(/\s/g)?.length ?? 0) * 0.6;
const clean = (s?: string) => (s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
/** cut a long source text at a word with an ellipsis (the full text is one tap away in the app) */
const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, Math.max(s.lastIndexOf(" ", n), n * 0.8))} …`);

type Fonts = { title: string; body: string; italic: string; rtl: boolean };
const fontsFor = (lang: string): Fonts => (RTL.has(lang) ? { title: ARABIC_BOLD, body: ARABIC_FONT, italic: ARABIC_FONT, rtl: true } : { title: SERIF_BOLD, body: FONT.regular, italic: SERIF_ITALIC, rtl: false });

// ---------- the canvas: ground, frame, number, content, brand line ----------
function Canvas({ format, p, seed, children, n, total, lang, brand = "small", topRight }: {
  format: ShareFormat; p: Palette; seed: string; children: ReactNode; n?: number; total?: number; lang: string;
  brand?: "small" | "big" | "none"; topRight?: ReactNode;
}) {
  const { w, h } = CARD_SIZE[format];
  const b = BOX[format];
  return (
    <View style={{ width: w, height: h, overflow: "hidden", backgroundColor: p.bg[1] }}>
      <ShareGround p={p} w={w} h={h} seed={seed} />
      <ShareFrame p={p} w={w} h={h} l={b.frame} />
      {n !== undefined && total ? (
        <View style={{ position: "absolute", top: format === "story" ? b.top - 30 : b.frame.frame + 12, end: b.frame.frame + 14, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 1.2, color: p.accent }}>{digits(n, lang)}/{digits(total, lang)}</Text>
        </View>
      ) : null}
      {topRight}
      <View style={{ flex: 1, paddingHorizontal: b.padX, paddingTop: b.top, paddingBottom: b.bottom }}>
        <View style={{ flex: 1, justifyContent: "center" }}>{children}</View>
        {brand === "none" ? null : (
          <View style={{ height: brand === "big" ? b.foot + 18 : b.foot, alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
            <Wordmark tone={p.wordmark} height={brand === "big" ? (format === "story" ? 24 : 20) : format === "story" ? 15 : 13} />
            {brand === "big" ? <Text allowFontScaling={false} style={{ fontFamily: FONT.medium, fontSize: 9.5, letterSpacing: 1.3, color: p.muted }}>quranmasterclass.com/app</Text> : null}
          </View>
        )}
      </View>
    </View>
  );
}

/** an eight-pointed star with the slide number */
function NumberStar({ p, n, lang, size = 30 }: { p: Palette; n: number; lang: string; size?: number }) {
  const r = size / 2;
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8 - Math.PI / 2; const rr = i % 2 ? r * 0.76 : r * 0.98; return `${(r + rr * Math.cos(a)).toFixed(2)},${(r + rr * Math.sin(a)).toFixed(2)}`; }).join("L");
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Path d={`M${pts}Z`} fill={p.dark ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.55)"} stroke={p.line} strokeWidth={0.9} />
      </Svg>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: size * 0.4, color: p.ink }}>{digits(n, lang)}</Text>
    </View>
  );
}

// ---------- cover ----------
export function CoverSlide({ c, format, palette, total }: { c: CarouselPayload; format: ShareFormat; palette?: PaletteId; total: number }) {
  const p = PALETTES[palette ?? c.palette];
  const f = fontsFor(c.lang);
  const tx = carouselText(c.lang);
  const { w } = CARD_SIZE[format];
  const boxW = w - BOX[format].padX * 2;
  const small = format === "square";
  const rosette = c.cover.arabic ? (format === "story" ? 150 : small ? 92 : 118) : 0;
  const tS = fit(c.cover.title.length, boxW, small ? 96 : format === "story" ? 170 : 130, f.rtl ? 0.5 : 0.52, 1.18, 21, format === "story" ? 40 : small ? 30 : 34);
  const arS = c.cover.arabic ? Math.min(rosette * 0.3, (rosette * 0.64 * 2.1) / Math.max(2.5, arLen(c.cover.arabic))) : 0;
  return (
    <Canvas format={format} p={p} seed={`cr:${c.id}`} lang={c.lang} brand="big">
      <View style={{ alignItems: "center", gap: small ? 8 : 12 }}>
        <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.6, color: p.accent, textAlign: "center" }}>{c.cover.kicker}</Text>
        <OrnamentRule p={p} width={110} />
        {c.cover.arabic ? (
          <Rosette p={p} size={rosette}>
            <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={1} style={{ fontFamily: ARABIC_BOLD, fontSize: arS, lineHeight: arS * 1.75, color: p.arabic, textAlign: "center" }}>{c.cover.arabic}</Text>
          </Rosette>
        ) : null}
        <Text allowFontScaling={false} numberOfLines={4} style={{ fontFamily: f.title, fontSize: tS, lineHeight: tS * (f.rtl ? 1.55 : 1.16), letterSpacing: f.rtl ? 0 : -0.4, color: p.ink, textAlign: "center", writingDirection: f.rtl ? "rtl" : "ltr" }}>{c.cover.title}</Text>
        {c.cover.sub ? <Text allowFontScaling={false} numberOfLines={small ? 2 : 3} style={{ fontFamily: f.italic, fontSize: small ? 13.5 : 15, lineHeight: small ? 19 : f.rtl ? 26 : 21, color: p.soft, textAlign: "center", writingDirection: f.rtl ? "rtl" : "ltr" }}>{c.cover.sub}</Text> : null}
        <View style={{ flexDirection: f.rtl ? "row-reverse" : "row", alignItems: "center", gap: 6, marginTop: small ? 2 : 8, paddingHorizontal: 14, height: 28, borderRadius: 14, borderWidth: 1, borderColor: p.line }}>
          <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: p.ink }}>{tx.swipe}</Text>
          <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 10.5, color: p.accent }}>{digits(total, c.lang)}</Text>
          <Icon name={f.rtl ? "chevronLeft" : "chevronRight"} color={p.line} size={13} />
        </View>
      </View>
    </Canvas>
  );
}

// ---------- the content slides ----------
function Title({ s, p, f, size }: { s: string; p: Palette; f: Fonts; size: number }) {
  return <Text allowFontScaling={false} numberOfLines={3} style={{ fontFamily: f.title, fontSize: size, lineHeight: size * (f.rtl ? 1.55 : 1.22), letterSpacing: f.rtl ? 0 : -0.2, color: p.ink, textAlign: "center", writingDirection: f.rtl ? "rtl" : "ltr" }}>{s}</Text>;
}
function Body({ s, p, f, size, lines, italic, align = "center" }: { s: string; p: Palette; f: Fonts; size: number; lines: number; italic?: boolean; align?: "center" | "auto" }) {
  return <Text allowFontScaling={false} numberOfLines={lines} style={{ fontFamily: italic ? f.italic : f.body, fontSize: size, lineHeight: size * (f.rtl ? 1.7 : 1.5), color: p.soft, textAlign: align, writingDirection: f.rtl ? "rtl" : "ltr" }}>{s}</Text>;
}
/** the editors' note under a scripture block: a quiet line in a soft frame */
function Note({ s, p, f, small }: { s: string; p: Palette; f: Fonts; small: boolean }) {
  return (
    <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderColor: p.line, paddingTop: small ? 6 : 9, marginTop: 2 }}>
      <Text allowFontScaling={false} numberOfLines={small ? 2 : 3} style={{ fontFamily: f.body, fontSize: small ? 11.5 : 12.5, lineHeight: (small ? 11.5 : 12.5) * (f.rtl ? 1.7 : 1.45), color: p.ink, textAlign: "center", writingDirection: f.rtl ? "rtl" : "ltr" }}>{s}</Text>
    </View>
  );
}

/** one block of scripture: Arabic, translation, reference (sizes fit the room) */
function ScriptureBlock({ sc, p, f, w, h, lang, quote }: { sc: Scripture; p: Palette; f: Fonts; w: number; h: number; lang: string; quote?: boolean }) {
  const ar = clean(sc.arabic);
  const tr = lang === "ar" ? "" : clean(sc.text);
  const refH = 18;
  const room = h - refH - (ar && tr ? 14 : 0);
  // Arabic gets the larger share when it is the longer text; very long Arabic (a long hadith) yields to the translation
  const arShare = !tr ? 1 : !ar ? 0 : arLen(ar) > 360 ? 0.32 : arLen(ar) > tr.length * 0.7 ? 0.55 : 0.45;
  const hAr = room * arShare, hTr = room - hAr;
  const arMax = h > 300 ? 30 : 26;
  const sAr = ar ? fit(arLen(ar) + 4, w, hAr, 0.5, 1.8, 11.5, tr ? arMax : 34) : 0;
  const linesAr = Math.max(1, Math.floor(hAr / (sAr * 1.8 || 1)));
  const sTr = tr ? fit(tr.length, w, hTr, 0.47, 1.45, 9.5, h > 300 ? 17 : 15.5) : 0;
  const linesTr = Math.max(1, Math.floor(hTr / (sTr * 1.45 || 1)));
  const trFont = RTL.has(lang) ? ARABIC_FONT : SERIF_ITALIC;
  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      {ar ? <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={linesAr} style={{ fontFamily: ARABIC_FONT, fontSize: sAr, lineHeight: sAr * 1.8, color: p.arabic, textAlign: "center", writingDirection: "rtl" }}>{ar}</Text> : null}
      {ar && tr ? <OrnamentRule p={p} width={56} /> : null}
      {tr ? (
        <Text allowFontScaling={false} numberOfLines={linesTr} style={{ fontFamily: trFont, fontSize: sTr, lineHeight: sTr * 1.45, color: p.soft, textAlign: "center", writingDirection: RTL.has(lang) ? "rtl" : "ltr" }}>
          {quote ? <Text style={{ fontFamily: SERIF, color: p.accent }}>“</Text> : null}{tr}{quote ? <Text style={{ fontFamily: SERIF, color: p.accent }}>”</Text> : null}
        </Text>
      ) : null}
      <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 0.6, color: p.accent, textAlign: "center" }}>
        {sc.ref}{sc.repeat && sc.repeat > 1 ? ` · ${fill(carouselText(lang).times, { n: digits(sc.repeat, lang) })}` : ""}
      </Text>
    </View>
  );
}

/** a reference whose text is not loaded yet / offline: the reference as a seal, never invented text */
function Placeholder({ s, p, lang }: { s: CarouselSlide; p: Palette; lang: string }) {
  const tx = carouselText(lang);
  const label = s.t === "verse" || s.t === "pair" ? `${tx.quran} ${s.keys ? s.keys.join(" · ") : `${s.key}${s.to ? `–${s.to}` : ""}`}` : s.t === "hadith" ? `${tx.hadith} · ${s.c} ${s.num}` : `${tx.dua} · Hisnul Muslim ${s.h}`;
  return (
    <View style={{ alignItems: "center", gap: 8, paddingVertical: 10 }}>
      <Rosette p={p} size={58}><Icon name={s.t === "dua" ? "hands" : "book"} color={p.line} size={20} /></Rosette>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 12, color: p.accent, textAlign: "center" }}>{label}</Text>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 11, color: p.muted, textAlign: "center" }}>{tx.offline}</Text>
    </View>
  );
}

export function ContentSlide({ c, s, format, palette, texts, total }: { c: CarouselPayload; s: CarouselSlide; format: ShareFormat; palette?: PaletteId; texts?: Scripture[]; total: number }) {
  const p = PALETTES[palette ?? c.palette];
  const f = fontsFor(c.lang);
  const small = format === "square";
  const { w, h } = CARD_SIZE[format];
  const bx = BOX[format];
  const boxW = w - bx.padX * 2;
  const room = h - bx.top - bx.bottom - bx.foot - 8;
  const titleS = small ? 17 : format === "story" ? 22 : 19;
  const title = s.title ? clean(s.title) : "";
  const body = s.body ? clean(s.body) : "";
  const isRef = s.t !== "text";
  const head = (
    <View style={{ alignItems: "center", gap: small ? 5 : 8 }}>
      <NumberStar p={p} n={s.n} lang={c.lang} size={small ? 26 : 30} />
      {title ? <Title s={title} p={p} f={f} size={isRef ? titleS - 2 : titleS} /> : null}
    </View>
  );
  const headH = (small ? 26 : 30) + (title ? (isRef ? titleS - 2 : titleS) * 1.3 * Math.min(2, Math.ceil((title.length * titleS * 0.5) / boxW)) + 8 : 0) + 8;
  let content: ReactNode;
  if (isRef) {
    const noteH = body ? (small ? 40 : 56) : 0;
    const blockH = room - headH - noteH;
    if (!texts?.length) content = <Placeholder s={s} p={p} lang={c.lang} />;
    else if (s.t === "pair") {
      content = (
        <View style={{ gap: small ? 6 : 10 }}>
          {texts.map((sc, i) => (
            <View key={i} style={{ borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: p.line, padding: small ? 6 : 9, backgroundColor: p.dark ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.35)" }}>
              <ScriptureBlock sc={sc} p={p} f={f} w={boxW - 20} h={(blockH - 12) / 2 - 18} lang={c.lang} />
            </View>
          ))}
        </View>
      );
    } else content = <ScriptureBlock sc={texts[0]} p={p} f={f} w={boxW} h={blockH} lang={c.lang} quote={s.t !== "verse"} />;
    content = (
      <View style={{ gap: small ? 6 : 10 }}>
        {head}
        {content}
        {body ? <Note s={body} p={p} f={f} small={small} /> : null}
      </View>
    );
  } else {
    const ar = s.arabic ? clean(s.arabic) : "";
    const list = s.list ?? [];
    const arS = ar ? (small ? 28 : format === "story" ? 40 : 34) : 0;
    const listH = list.length ? list.length * (small ? 24 : 30) : 0;
    const bodyRoom = Math.max(40, room - headH - (ar ? arS * 1.8 + 6 : 0) - listH - 12);
    const bodyS = body ? fit(body.length, boxW, bodyRoom, 0.5, f.rtl ? 1.7 : 1.5, 11.5, format === "story" ? 18.5 : 16.5) : 0;
    content = (
      <View style={{ gap: small ? 7 : 11 }}>
        {head}
        {ar ? <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={1} style={{ fontFamily: ARABIC_BOLD, fontSize: arS, lineHeight: arS * 1.8, color: p.arabic, textAlign: "center" }}>{ar}</Text> : null}
        <OrnamentRule p={p} width={64} />
        {body ? <Body s={body} p={p} f={f} size={bodyS} lines={Math.max(2, Math.floor(bodyRoom / (bodyS * (f.rtl ? 1.7 : 1.5))))} /> : null}
        {list.length ? (
          <View style={{ gap: small ? 5 : 8, alignSelf: "stretch" }}>
            {list.map((it, i) => (
              <View key={i} style={{ flexDirection: f.rtl ? "row-reverse" : "row", alignItems: "center", gap: 9 }}>
                <View style={{ width: small ? 18 : 21, height: small ? 18 : 21, borderRadius: 11, borderWidth: 1, borderColor: p.line, alignItems: "center", justifyContent: "center" }}>
                  <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: small ? 9.5 : 10.5, color: p.accent }}>{digits(i + 1, c.lang)}</Text>
                </View>
                <Text allowFontScaling={false} numberOfLines={2} style={{ flex: 1, fontFamily: f.body, fontSize: small ? 12 : format === "story" ? 15 : 13.5, lineHeight: (small ? 12 : format === "story" ? 15 : 13.5) * (f.rtl ? 1.65 : 1.38), color: p.ink, textAlign: f.rtl ? "right" : "left", writingDirection: f.rtl ? "rtl" : "ltr" }}>{it}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  }
  return <Canvas format={format} p={p} seed={`cr:${c.id}:${s.n}`} lang={c.lang} n={s.n} total={total}>{content}</Canvas>;
}

// ---------- the final slide: sources and the call to action ----------
export function FinalSlide({ c, format, palette }: { c: CarouselPayload; format: ShareFormat; palette?: PaletteId }) {
  const p = PALETTES[palette ?? c.palette];
  const f = fontsFor(c.lang);
  const tx = carouselText(c.lang);
  const small = format === "square";
  const max = small ? 5 : format === "story" ? 9 : 7;
  const shown = c.sources.slice(0, max);
  const more = c.sources.length - shown.length;
  return (
    <Canvas format={format} p={p} seed={`cr:${c.id}:end`} lang={c.lang} brand="none">
      <View style={{ alignItems: "center", gap: small ? 8 : 12 }}>
        <Rosette p={p} size={small ? 50 : 62}><Icon name="bookmark" color={p.line} size={small ? 17 : 21} /></Rosette>
        <Title s={tx.saveShare} p={p} f={f} size={small ? 19 : 23} />
        <Text allowFontScaling={false} numberOfLines={2} style={{ fontFamily: f.italic, fontSize: small ? 12.5 : 14, lineHeight: small ? 17 : 20, color: p.soft, textAlign: "center", writingDirection: f.rtl ? "rtl" : "ltr" }}>{c.cover.title}</Text>
        {shown.length ? (
          <View style={{ alignSelf: "stretch", borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: p.line, paddingVertical: small ? 6 : 9, gap: 3, marginTop: 2 }}>
            <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 1.4, color: p.accent, textAlign: "center", marginBottom: 2 }}>{tx.sources}</Text>
            {shown.map((s, i) => <Text key={i} allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: small ? 9.5 : 10.5, lineHeight: small ? 13 : 15, color: p.soft, textAlign: "center" }}>{s.label}</Text>)}
            {more > 0 ? <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 9.5, color: p.muted, textAlign: "center" }}>+{digits(more, c.lang)} {tx.more}</Text> : null}
          </View>
        ) : null}
        <View style={{ alignItems: "center", gap: 5, marginTop: small ? 4 : 10 }}>
          <Wordmark tone={p.wordmark} height={format === "story" ? 28 : small ? 20 : 24} />
          <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.2, color: p.ink }}>quranmasterclass.com/app</Text>
          <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 10.5, color: p.muted, textAlign: "center" }}>{tx.cta}</Text>
        </View>
      </View>
    </Canvas>
  );
}

/** slide i of a carousel: 0 = cover, 1…n = content, n+1 = final */
export const slideCount = (c: CarouselPayload) => c.slides.length + 2;
export const CarouselSlideView = memo(function CarouselSlideView({ c, index, format, palette, texts }: { c: CarouselPayload; index: number; format: ShareFormat; palette?: PaletteId; texts: Record<number, Scripture[]> }) {
  const total = slideCount(c);
  if (index <= 0) return <CoverSlide c={c} format={format} palette={palette} total={total} />;
  if (index > c.slides.length) return <FinalSlide c={c} format={format} palette={palette} />;
  const s = c.slides[index - 1];
  return <ContentSlide c={c} s={s} format={format} palette={palette} texts={texts[s.n]} total={c.slides.length} />;
});

// ---------- wisdom: one image ----------
export function WisdomCard({ w, format, palette, scripture }: { w: WisdomPayload; format: ShareFormat; palette?: PaletteId; scripture: Scripture | null }) {
  const p = PALETTES[palette ?? w.palette];
  const f = fontsFor(w.lang);
  const tx = carouselText(w.lang);
  const { w: W, h: H } = CARD_SIZE[format];
  const bx = BOX[format];
  const boxW = W - bx.padX * 2;
  const room = H - bx.top - bx.bottom - bx.foot - 60;
  const kicker = w.kind === "reflection" ? `${tx.reflection} · ${w.themeLabel}` : w.themeLabel;
  let content: ReactNode;
  if (w.key || w.c) content = scripture ? <ScriptureBlock sc={scripture} p={p} f={f} w={boxW} h={room} lang={w.lang} quote={!!w.c} /> : <Placeholder s={{ n: 0, t: w.key ? "verse" : "hadith", key: w.key, to: w.to, c: w.c, num: w.num }} p={p} lang={w.lang} />;
  else {
    const text = clean(w.text);
    const ar = clean(w.arabic);
    const hAr = ar ? room * 0.42 : 0;
    const sAr = ar ? fit(arLen(ar), boxW, hAr, 0.5, 1.8, 13, format === "story" ? 30 : 26) : 0;
    const sT = fit(text.length, boxW, room - hAr - (w.by ? 40 : 10), f.rtl ? 0.5 : 0.48, f.rtl ? 1.7 : 1.42, 13, format === "story" ? 28 : format === "post" ? 24 : 21);
    content = (
      <View style={{ alignItems: "center", gap: 10 }}>
        {ar ? <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={Math.max(2, Math.floor(hAr / (sAr * 1.8)))} style={{ fontFamily: ARABIC_FONT, fontSize: sAr, lineHeight: sAr * 1.8, color: p.arabic, textAlign: "center", writingDirection: "rtl" }}>{ar}</Text> : null}
        {ar ? <OrnamentRule p={p} width={56} /> : null}
        <Text allowFontScaling={false} numberOfLines={9} style={{ fontFamily: w.kind === "reflection" ? f.title : f.italic, fontSize: sT, lineHeight: sT * (f.rtl ? 1.7 : 1.38), letterSpacing: f.rtl ? 0 : -0.2, color: p.ink, textAlign: "center", writingDirection: f.rtl ? "rtl" : "ltr" }}>
          {w.kind === "reflection" ? null : <Text style={{ fontFamily: SERIF, color: p.accent }}>“</Text>}{text}{w.kind === "reflection" ? null : <Text style={{ fontFamily: SERIF, color: p.accent }}>”</Text>}
        </Text>
        {w.by || w.work ? <Text allowFontScaling={false} numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 0.5, color: p.accent, textAlign: "center" }}>{[w.by, w.work].filter(Boolean).join(" · ")}</Text> : null}
      </View>
    );
  }
  return (
    <Canvas format={format} p={p} seed={`ws:${w.id}`} lang={w.lang} brand="big">
      <View style={{ alignItems: "center", gap: format === "square" ? 8 : 12 }}>
        <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.6, color: p.accent, textAlign: "center" }}>{kicker}</Text>
        <OrnamentRule p={p} width={104} />
        {content}
      </View>
    </Canvas>
  );
}
