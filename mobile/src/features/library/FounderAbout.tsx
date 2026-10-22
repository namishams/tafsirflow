import { Pressable, Text, View } from "react-native";
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

export function FounderBook({ small = false }: { small?: boolean }) {
  const t = useWebT("founderAbout");
  const isl = useIsl();
  const open = () => void WebBrowser.openBrowserAsync(BOOK_URL).catch(() => undefined);
  const w = small ? 66 : 90, h = small ? 92 : 126;
  return (
    <IslCard onPress={open} accessibilityLabel={`${t("bookTitle")}. ${t("bookCta")}`} style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 16 }}>
      <LinearGradient colors={["#0c4a37", "#06221a"]} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }}
        style={{ width: w, height: h, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, borderTopRightRadius: 10, borderBottomRightRadius: 10, borderWidth: 1, borderColor: "rgba(217,185,112,0.7)", alignItems: "center", justifyContent: "center" }}>
        <View pointerEvents="none" style={{ position: "absolute", top: 5, left: 5, right: 5, bottom: 5, borderWidth: 1, borderColor: "rgba(217,185,112,0.45)", borderRadius: 6 }} />
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: small ? 14 : 19, lineHeight: small ? 24 : 32, color: stage.gold, writingDirection: "rtl", textAlign: "center" }}>نهج البلاغة</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 8, letterSpacing: 1.4, color: "rgba(217,185,112,0.8)" }}>DEUTSCH</Text>
      </LinearGradient>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: isl.gold }}>{t("bookEyebrow")}</Text>
        <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 21, lineHeight: 26, color: isl.ink }}>{t("bookTitle")}</Text>
        <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: isl.muted }}>{t("bookSub")}</Text>
        <GoldPill small title={t("bookCta")} onPress={open} style={{ marginTop: 10 }} />
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
    </View>
  );
}
