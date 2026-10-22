import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { ARABIC_FONT, CALLIG_FONT, FONT, stage } from "@/lib/theme";
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
  disclosure: string;
  footer: string;
  /** the personal words are in a right-to-left language (ar, ur, fa, ps) */
  rtl?: boolean;
};

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, s.lastIndexOf(" ", n) > 0 ? s.lastIndexOf(" ", n) : n)} …` : s);
const plain = (s: string) => s.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "");

export function DuaCard({ v, format = "screen", hideTr = false }: { v: DuaView; format?: ShareFormat | "screen"; hideTr?: boolean }) {
  const share = format !== "screen";
  const box = share ? CARD_SIZE[format] : null;
  const story = format === "story";
  const k = share ? (story ? 1 : 0.86) : 1;
  const personal = share ? clip(v.personal, story ? 420 : 240) : v.personal;
  return (
    <View style={[{ borderRadius: share ? 0 : 22, overflow: "hidden", borderWidth: share ? 0 : 1, borderColor: "rgba(214,180,108,0.4)" }, box ? { width: box.w, height: box.h } : null]}>
      <LinearGradient colors={["#06231a", "#0a3a2b", "#041510"]} locations={[0, 0.55, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      {/* the niche behind the text */}
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: share ? 18 : 10, bottom: 0, alignItems: "center", opacity: 0.55 }}>
        <Svg width="94%" height="100%" viewBox="0 0 300 360" preserveAspectRatio="none">
          <Path d={NICHE_PATH} stroke="rgba(214,180,108,0.55)" strokeWidth={1.4} fill="none" />
          <Path d={NICHE_INNER} stroke="rgba(214,180,108,0.22)" strokeWidth={1} fill="none" />
        </Svg>
      </View>
      <View style={{ paddingHorizontal: share ? 30 : 24, paddingTop: share ? (story ? 70 : 42) : 44, paddingBottom: share ? 26 : 28, flex: share ? 1 : undefined, alignItems: "center", gap: 14 * k }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{v.kicker}</Text>
        <Text allowFontScaling={!share} style={{ fontFamily: CALLIG_FONT, fontSize: 30 * k, lineHeight: 48 * k, color: stage.gold, textAlign: "center", writingDirection: "rtl" }}>{v.names}</Text>
        {!hideTr && !share ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: stage.textMuted, textAlign: "center", marginTop: -8 }}>{v.namesTr}</Text> : null}
        {v.quran ? (
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text allowFontScaling={!share} numberOfLines={share ? (story ? 4 : 3) : undefined} style={{ fontFamily: ARABIC_FONT, fontSize: 21 * k, lineHeight: 40 * k, color: "#ffffff", textAlign: "center", writingDirection: "rtl" }}>{v.quran.ar}</Text>
            {!hideTr && v.quran.tr && (!share || story) ? <Text allowFontScaling={!share} numberOfLines={share ? 3 : undefined} style={{ fontFamily: FONT.regular, fontSize: 13.5 * k, lineHeight: 20 * k, color: stage.textSoft, textAlign: "center" }}>{plain(v.quran.tr)}</Text> : null}
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: "rgba(214,180,108,0.85)" }}>{v.quran.ref}</Text>
          </View>
        ) : null}
        <View style={{ alignSelf: "stretch", borderRadius: 16, borderWidth: 1, borderColor: "rgba(214,180,108,0.35)", backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 18, paddingVertical: 16, gap: 8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.6, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{v.personalLabel}</Text>
          <Text allowFontScaling={!share} numberOfLines={share ? (story ? 10 : 6) : undefined} ellipsizeMode="tail" style={{ fontFamily: FONT.regular, fontSize: 16.5 * k, lineHeight: 26 * k, color: "#f6ead0", textAlign: "center", writingDirection: v.rtl ? "rtl" : "ltr" }}>{personal}</Text>
          {v.forWho ? <Text numberOfLines={share ? 2 : undefined} style={{ writingDirection: v.rtl ? "rtl" : "ltr", fontFamily: FONT.regular, fontSize: 14 * k, color: stage.textSoft, textAlign: "center" }}>{v.forWho}</Text> : null}
          {v.arabic && (!share || story) ? (
            <>
              <View style={{ height: 1, backgroundColor: "rgba(214,180,108,0.25)", marginVertical: 4 }} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(214,180,108,0.8)", textAlign: "center" }}>{v.arabicLabel}</Text>
              <Text allowFontScaling={!share} numberOfLines={share ? 4 : undefined} style={{ fontFamily: ARABIC_FONT, fontSize: 19 * k, lineHeight: 36 * k, color: stage.cream, textAlign: "center", writingDirection: "rtl" }}>{v.arabic}</Text>
            </>
          ) : null}
        </View>
        {v.sunnah && !share ? (
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 38, color: "#ffffff", textAlign: "center", writingDirection: "rtl" }}>{v.sunnah.ar}</Text>
            {!hideTr && v.sunnah.tr ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: stage.textSoft, textAlign: "center" }}>{v.sunnah.tr}</Text> : null}
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: "rgba(214,180,108,0.85)" }}>{v.sunnah.src}</Text>
          </View>
        ) : null}
        {share ? <View style={{ flex: 1 }} /> : null}
        <Text numberOfLines={share ? 4 : undefined} style={{ flexShrink: 0, fontFamily: FONT.regular, fontSize: share ? 9.5 : 11.5, lineHeight: share ? 13 : 17, color: stage.textMuted, textAlign: "center", maxWidth: 480 }}>{v.disclosure}</Text>
        {share ? <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.2, color: stage.gold }}>{v.footer}</Text> : null}
      </View>
    </View>
  );
}
