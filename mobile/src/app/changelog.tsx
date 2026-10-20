import { Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { FONT, R, type as typo, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { Page } from "@/components/page";
import { CHANGELOG } from "@/web/changelog";
import { useSaw } from "@/features/library/art";
import { longDate } from "@/features/library/content";
import { openHref } from "@/features/library/links";

// /changelog – what changed on Quran Masterclass, newest first (website: src/app/[locale]/(app)/changelog/page.tsx)
export default function ChangelogPage() {
  const { lang } = useLang();
  const t = useWebT("feedback");
  const theme = useTheme();
  const sw = useSaw();
  const de = lang === "de";
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "" }} />
      <Page style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 96 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 40, lineHeight: 42, letterSpacing: -0.9, color: theme.ink }}>{t("changelog")}</Text>
        <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 17, lineHeight: 27.6, color: theme.muted }}>{t("changelogLead")}</Text>
        <View style={{ marginTop: 40, marginLeft: 5, borderLeftWidth: 1, borderLeftColor: theme.line, paddingLeft: 24 }}>
          {CHANGELOG.map((r) => (
            <View key={r.date} style={{ marginBottom: 48 }}>
              <View style={{ position: "absolute", left: -30, top: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: theme.accent }} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: theme.gold }}>{longDate(r.date, lang)}</Text>
              <Text accessibilityRole="header" style={{ marginTop: 4, fontFamily: FONT.display, fontSize: 24, lineHeight: 28, letterSpacing: -0.5, color: theme.ink }}>{de ? r.title_de : r.title_en}</Text>
              <View style={{ marginTop: 12, gap: 8 }}>
                {(de ? r.items_de : r.items_en).map((x, i) => (
                  <View key={i} style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ width: 12, height: 1, marginTop: 12, backgroundColor: theme.gold }} />
                    <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: theme.muted }}>{sw(x)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
        <Pressable onPress={() => openHref("/feedback")} accessibilityRole="button" accessibilityLabel={t("wish")}
          style={({ pressed }) => ({ alignSelf: "flex-start", height: 44, borderRadius: R.sm, paddingHorizontal: 20, justifyContent: "center", backgroundColor: theme.ink, opacity: pressed ? 0.85 : 1 })}>
          <Text style={[typo.button, { fontSize: 14, color: theme.bg }]}>{t("wish")}</Text>
        </Pressable>
      </Page>
    </>
  );
}
