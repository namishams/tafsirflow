import { Image } from "expo-image";
import { Platform, Pressable, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ARABIC_FONT, FONT, stage, useTheme } from "@/lib/theme";
import { useWebT } from "@/i18n/web";
import { Corners, IslCard, IslH2 } from "@/features/library/art";
import { GoldPill, OutlinePill, StageCard } from "@/features/library/ui";
import { SERIF, useIsl } from "@/features/library/palette";

// The founder, Nami Shams (owner's own statements, 22.10.2026; texts: website messages → founderAbout), the same as the
// website's src/components/FounderAbout.tsx: "full" on the About screen, "compact" ("About the founder") on the founder's
// Quran Talents profile. The book link stays exactly this clean URL (no tracking).
const BOOK_URL = "https://www.amazon.com/dp/B0D13DKT9T";
const go = (href: string) => router.push(href as Href);
const LINKS = {
  listen: "/quran/1?reciter=Alafasy", // the website's /surah/1?reciter=Alafasy (reader keeps the voice)
  star: "/talents/u/mishary.alafasy",
  reciter: "/reciters/mishary-rashid-alafasy",
  path: "/mishary",
};

/** the real cover of the German Nahj al-Balagha, served by the website so the app stays small */
const COVER_URL = "https://quranmasterclass.com/images/nahjul-balagha-cover.jpg";

export function FounderBook({ small = false }: { small?: boolean }) {
  const t = useWebT("founderAbout");
  const isl = useIsl();
  // iOS: the book card only, no outbound purchase link (App Review 3.1.1); the website keeps the Amazon link
  const link = Platform.OS !== "ios";
  const open = link ? () => void WebBrowser.openBrowserAsync(BOOK_URL).catch(() => undefined) : undefined;
  const w = small ? 60 : 99, h = small ? 92 : 150;
  return (
    <IslCard onPress={open} accessibilityLabel={link ? `${t("bookTitle")}. ${t("bookCta")}` : t("bookTitle")} style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 16 }}>
      <Image source={{ uri: COVER_URL }} accessibilityIgnoresInvertColors contentFit="cover" style={{ width: w, height: h, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, borderTopRightRadius: 8, borderBottomRightRadius: 8 }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: isl.gold }}>{t("bookEyebrow")}</Text>
        <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 21, lineHeight: 26, color: isl.ink }}>{t("bookTitle")}</Text>
        <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: isl.muted }}>{t("bookSub")}</Text>
        {open ? <GoldPill small title={t("bookCta")} onPress={open} style={{ marginTop: 10 }} /> : null}
      </View>
    </IslCard>
  );
}

function ReciterLinks({ onStage }: { onStage?: boolean }) {
  const t = useWebT("founderAbout");
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      <GoldPill small title={t("linkListen")} onPress={() => go(LINKS.listen)} />
      <OutlinePill onStage={onStage} title={t("linkStar")} onPress={() => go(LINKS.star)} />
      <OutlinePill onStage={onStage} title={t("linkReciter")} onPress={() => go(LINKS.reciter)} />
      <OutlinePill onStage={onStage} title={t("linkPath")} onPress={() => go(LINKS.path)} />
    </View>
  );
}

function UaeFlag() {
  return (
    <Svg width={30} height={20} viewBox="0 0 30 20" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Rect width={30} height={20} fill="#fff" />
      <Rect width={30} height={6.67} fill="#00732f" />
      <Rect y={13.33} width={30} height={6.67} fill="#000" />
      <Rect width={8} height={20} fill="#ce1126" />
    </Svg>
  );
}

export default function FounderAbout({ variant = "full" }: { variant?: "full" | "compact" }) {
  const t = useWebT("founderAbout");
  const isl = useIsl();
  const th = useTheme();
  const body = { fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: isl.muted } as const;
  if (variant === "compact") {
    return (
      <IslCard style={{ padding: 20, alignSelf: "stretch", marginTop: 12 }}>
        <Corners />
        <IslH2 size={20} style={{ lineHeight: 26 }}>{t("profileTitle")}</IslH2>
        <Text style={{ ...body, fontSize: 14.5, lineHeight: 22, marginTop: 8 }}>{t("profileShort")}</Text>
        <View style={{ marginTop: 14 }}><FounderBook small /></View>
        <View style={{ marginTop: 14 }}><ReciterLinks /></View>
        <Pressable onPress={() => go("/about")} accessibilityRole="link" style={{ marginTop: 14 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: isl.accent }}>{t("more")}</Text>
        </Pressable>
      </IslCard>
    );
  }
  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
      <IslCard style={{ paddingHorizontal: 22, paddingVertical: 36 }}>
        <Corners />
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.92, textTransform: "uppercase", color: th.gold }}>{t("eyebrow")}</Text>
        <IslH2 size={36} style={{ marginTop: 8, lineHeight: 40 }}>{t("title")}</IslH2>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 36, color: isl.gold, writingDirection: "rtl" }}>نامي شمس</Text>
        <Text style={{ marginTop: 14, fontFamily: SERIF, fontSize: 18, lineHeight: 28, color: isl.ink }}>{t("lead")}</Text>
        <Text style={{ marginTop: 28, fontFamily: FONT.bold, fontSize: 18, color: isl.ink }}>{t("focusTitle")}</Text>
        <Text style={{ ...body, marginTop: 6 }}>{t("focus")}</Text>
        <View style={{ marginTop: 28 }}><FounderBook /></View>
        <Text style={{ ...body, marginTop: 12 }}>{t("bookText")}</Text>
        <Text style={{ marginTop: 28, fontFamily: FONT.bold, fontSize: 18, color: isl.ink }}>{t("whyTitle")}</Text>
        <Text style={{ ...body, marginTop: 6 }}>{t("why")}</Text>
      </IslCard>
      <LinearGradient colors={["#0c4a37", "#06221a"]} style={{ marginTop: 20, borderRadius: 16, overflow: "hidden" }}>
        <StageCard style={{ padding: 22 }}>
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 44, color: stage.gold, writingDirection: "rtl" }}>مشاري راشد العفاسي</Text>
          <Text style={{ marginTop: 6, fontFamily: FONT.display, fontSize: 26, lineHeight: 32, color: "#eef0f3" }}>{t("misharyTitle")}</Text>
          <Text style={{ marginTop: 10, fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 25, color: "rgba(255,255,255,0.75)" }}>{t("mishary")}</Text>
          <View style={{ marginTop: 18 }}><ReciterLinks onStage /></View>
        </StageCard>
      </LinearGradient>
      <LinearGradient colors={["#0c4a37", "#06221a"]} style={{ marginTop: 20, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(201,166,94,0.4)" }}>
        <StageCard style={{ padding: 22 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <UaeFlag />
            <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: "#eef0f3" }}>{t("uaTitle")}</Text>
          </View>
          <Text style={{ marginTop: 14, fontFamily: SERIF, fontSize: 15.5, lineHeight: 25, color: "rgba(255,255,255,0.8)" }}>{t("uaP1")}</Text>
          <Text style={{ marginTop: 10, fontFamily: SERIF, fontSize: 15.5, lineHeight: 25, color: "rgba(255,255,255,0.8)" }}>{t("uaP2")}</Text>
          <Text style={{ marginTop: 10, fontFamily: SERIF, fontSize: 15.5, lineHeight: 25, color: "rgba(255,255,255,0.8)" }}>{t("uaP3")}</Text>
          <Text style={{ marginTop: 10, fontFamily: SERIF, fontSize: 15.5, lineHeight: 25, color: stage.gold }}>{t("uaP4")}</Text>
          <Text style={{ marginTop: 14, fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{t("uaSign")}</Text>
          <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.55)" }}>{t("uaNote")}</Text>
        </StageCard>
      </LinearGradient>
    </View>
  );
}
