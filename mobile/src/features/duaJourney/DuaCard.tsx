import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { ARABIC_FONT, CALLIG_FONT, FONT, stage } from "@/lib/theme";
import { WordmarkVector } from "@/components/brand";
import { CARD_SIZE, type ShareFormat } from "@/features/share/formats";
import { NICHE_INNER, NICHE_PATH } from "@/web/duaJourney";

// The dua card (website components/dua/DuaCard.tsx): emerald night with a gold niche, the names of Allah in
// calligraphy, the Quran dua it is rooted in (Arabic from the Quran API, with its reference), the personal words
// clearly labelled (composed with AI or prepared), the Sunnah dua with its source and the short disclosure line.
// "screen" fits the width of the screen; the share formats render at CARD_SIZE (story 1080×1920, portrait 1080×1350).
export type DuaView = {
  kicker: string;
  title: string;
  names: string;
  namesTr: string;
  quran: { key: string; ar: string; tr: string; ref: string } | null;
  sunnah: { ar: string; tr: string; src: string } | null;
  personalLabel: string;
  personal: string;
  arabicLabel: string;
  arabic: string | null;
  forWho: string | null;
  /** a dua given to someone: "For my mother" at the top of the card */
  addressee?: string | null;
  disclosure: string;
  footer: string;
  /** the personal words are in a right-to-left language (ar, ur, fa, ps) */
  rtl?: boolean;
};

/** three illuminated styles for the card and the shared image (owner, 22.10.2026) */
export type CardStyle = "night" | "dawn" | "parchment";
export const CARD_STYLES: CardStyle[] = ["night", "dawn", "parchment"];
const PAL: Record<CardStyle, { bg: [string, string, string]; ink: string; soft: string; muted: string; gold: string; line: string; panel: string; ar: string }> = {
  night: { bg: ["#06231a", "#0a3a2b", "#041510"], ink: "#f6ead0", soft: stage.textSoft, muted: stage.textMuted, gold: stage.gold, line: "rgba(214,180,108,0.55)", panel: "rgba(255,255,255,0.05)", ar: "#ffffff" },
  dawn: { bg: ["#123f35", "#8c845a", "#f0d49c"], ink: "#fffaf0", soft: "rgba(255,250,240,0.85)", muted: "rgba(255,250,240,0.72)", gold: "#fff1c4", line: "rgba(255,241,196,0.7)", panel: "rgba(8,38,29,0.35)", ar: "#ffffff" },
  parchment: { bg: ["#f6ecd2", "#efe0b8", "#e2c98d"], ink: "#2b2010", soft: "rgba(43,32,16,0.8)", muted: "rgba(43,32,16,0.62)", gold: "#8a6a2c", line: "rgba(138,106,44,0.6)", panel: "rgba(255,255,255,0.45)", ar: "#1d1608" },
};
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, s.lastIndexOf(" ", n) > 0 ? s.lastIndexOf(" ", n) : n)} …` : s);
const plain = (s: string) => s.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "");

export function DuaCard({ v, format = "screen", hideTr = false, look = "night" }: { v: DuaView; format?: ShareFormat | "screen"; hideTr?: boolean; look?: CardStyle }) {
  const c = PAL[look];
  const share = format !== "screen";
  const box = share ? CARD_SIZE[format] : null;
  const story = format === "story";
  const k = share ? (story ? 1 : 0.86) : 1;
  const personal = share ? clip(v.personal, story ? 420 : 240) : v.personal;
  return (
    <View style={[{ borderRadius: share ? 0 : 22, overflow: "hidden", borderWidth: share ? 0 : 1, borderColor: "rgba(214,180,108,0.4)" }, box ? { width: box.w, height: box.h } : null]}>
      <LinearGradient colors={c.bg} locations={[0, 0.55, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      {/* the niche behind the text */}
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: share ? 18 : 10, bottom: 0, alignItems: "center", opacity: 0.55 }}>
        <Svg width="94%" height="100%" viewBox="0 0 300 360" preserveAspectRatio="none">
          <Path d={NICHE_PATH} stroke={c.line} strokeWidth={1.4} fill="none" />
          <Path d={NICHE_INNER} stroke={c.line} opacity={0.4} strokeWidth={1} fill="none" />
        </Svg>
      </View>
      <View style={{ paddingHorizontal: share ? 30 : 24, paddingTop: share ? (story ? 70 : 42) : 44, paddingBottom: share ? 26 : 28, flex: share ? 1 : undefined, alignItems: "center", gap: 14 * k }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: c.gold, textAlign: "center" }}>{v.kicker}</Text>
        {v.addressee ? <Text style={{ fontFamily: FONT.display, fontSize: 20 * k, lineHeight: 26 * k, color: c.ink, textAlign: "center", marginTop: -4 }}>{v.addressee}</Text> : null}
        <Text allowFontScaling={!share} style={{ fontFamily: CALLIG_FONT, fontSize: 30 * k, lineHeight: 48 * k, color: c.gold, textAlign: "center", writingDirection: "rtl" }}>{v.names}</Text>
        {!hideTr && !share ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: c.muted, textAlign: "center", marginTop: -8 }}>{v.namesTr}</Text> : null}
        {v.quran ? (
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text allowFontScaling={!share} numberOfLines={share ? (story ? 4 : 3) : undefined} style={{ fontFamily: ARABIC_FONT, fontSize: 21 * k, lineHeight: 40 * k, color: c.ar, textAlign: "center", writingDirection: "rtl" }}>{v.quran.ar}</Text>
            {!hideTr && v.quran.tr && (!share || story) ? <Text allowFontScaling={!share} numberOfLines={share ? 3 : undefined} style={{ fontFamily: FONT.regular, fontSize: 13.5 * k, lineHeight: 20 * k, color: c.soft, textAlign: "center" }}>{plain(v.quran.tr)}</Text> : null}
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: c.gold }}>{v.quran.ref}</Text>
          </View>
        ) : null}
        <View style={{ alignSelf: "stretch", borderRadius: 16, borderWidth: 1, borderColor: c.line, backgroundColor: c.panel, paddingHorizontal: 18, paddingVertical: 16, gap: 8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.6, textTransform: "uppercase", color: c.gold, textAlign: "center" }}>{v.personalLabel}</Text>
          <Text allowFontScaling={!share} numberOfLines={share ? (story ? 10 : 6) : undefined} ellipsizeMode="tail" style={{ fontFamily: FONT.regular, fontSize: 16.5 * k, lineHeight: 26 * k, color: c.ink, textAlign: "center", writingDirection: v.rtl ? "rtl" : "ltr" }}>{personal}</Text>
          {v.forWho ? <Text numberOfLines={share ? 2 : undefined} style={{ writingDirection: v.rtl ? "rtl" : "ltr", fontFamily: FONT.regular, fontSize: 14 * k, color: c.soft, textAlign: "center" }}>{v.forWho}</Text> : null}
          {v.arabic && (!share || story) ? (
            <>
              <View style={{ height: 1, backgroundColor: c.line, marginVertical: 4 }} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: c.gold, textAlign: "center" }}>{v.arabicLabel}</Text>
              <Text allowFontScaling={!share} numberOfLines={share ? 4 : undefined} style={{ fontFamily: ARABIC_FONT, fontSize: 19 * k, lineHeight: 36 * k, color: c.ink, textAlign: "center", writingDirection: "rtl" }}>{v.arabic}</Text>
            </>
          ) : null}
        </View>
        {v.sunnah && !share ? (
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 38, color: c.ar, textAlign: "center", writingDirection: "rtl" }}>{v.sunnah.ar}</Text>
            {!hideTr && v.sunnah.tr ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: c.soft, textAlign: "center" }}>{v.sunnah.tr}</Text> : null}
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: c.gold }}>{v.sunnah.src}</Text>
          </View>
        ) : null}
        {share ? <View style={{ flex: 1 }} /> : null}
        <Text numberOfLines={share ? 4 : undefined} style={{ flexShrink: 0, fontFamily: FONT.regular, fontSize: share ? 9.5 : 11.5, lineHeight: share ? 13 : 17, color: c.muted, textAlign: "center", maxWidth: 480 }}>{v.disclosure}</Text>
        {share ? (
          // the app's watermark: the wordmark and the address
          <View style={{ alignItems: "center", gap: 4, opacity: 0.95 }}>
            <WordmarkVector height={16} tone={look === "parchment" ? "deep" : "gold"} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 1.4, color: c.gold }}>{v.footer}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
