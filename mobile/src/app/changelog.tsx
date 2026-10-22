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

// The app shows only what concerns the app: entries about the website alone (search engines, sitemap, domain), the
// Android app, Google Play or payments outside the App Store (Ziina) are left out; mixed entries lose that clause.
const WEB_ONLY = /android|أندرويد|google play|\bapk\b|search engines|suchmaschinen|محركات البحث|sitemap|ziina/i;
function appItems(list: string[]): string[] {
  return list.flatMap((x) => {
    if (!WEB_ONLY.test(x)) return [x];
    // a payment clause inside a longer entry is cut out; anything else that concerns the website or Android goes
    if (!/ziina/i.test(x) || WEB_ONLY.test(x.replace(/[^,،;؛]*ziina[^,،;؛]*/gi, ""))) return [];
    const parts = x.split(/(?<=[,،;؛])\s+/);
    if (parts.length < 2) return [];
    const kept = parts.filter((p) => !WEB_ONLY.test(p));
    if (!kept.length) return [];
    const out = kept.join(" ").replace(/[,،;؛]\s*$/, "");
    return [/[.。]$/.test(out) ? out : `${out}.`];
  });
}
const appTitle = (s: string) => s.replace(/,\s*Android app and/i, " and").replace(/,\s*Android-App und/i, " und").replace(/\s*و?تطبيق أندرويد\s*/, " ").replace(/,\s*Android app/i, "").replace(/,\s*Android-App/i, "").replace(/\s{2,}/g, " ").trim();
const RELEASES = CHANGELOG.map((r) => ({
  ...r,
  title_en: appTitle(r.title_en), title_de: appTitle(r.title_de), title_ar: r.title_ar ? appTitle(r.title_ar) : r.title_ar,
  items_en: appItems(r.items_en), items_de: appItems(r.items_de), items_ar: r.items_ar ? appItems(r.items_ar) : r.items_ar,
}));

// /changelog – what changed on Quran Masterclass, newest first (website: src/app/[locale]/(app)/changelog/page.tsx)
export default function ChangelogPage() {
  const { lang } = useLang();
  const t = useWebT("feedback");
  const theme = useTheme();
  const sw = useSaw();
  const de = lang === "de", ar = lang === "ar";
  // Arabic entries where the release has them (title_ar / items_ar), otherwise English, as on the website
  const title = (r: (typeof CHANGELOG)[number]) => (de ? r.title_de : ar && r.title_ar ? r.title_ar : r.title_en);
  const items = (r: (typeof CHANGELOG)[number]) => (de ? r.items_de : ar && r.items_ar?.length ? r.items_ar : r.items_en);
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "" }} />
      <Page style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 96 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 40, lineHeight: 42, letterSpacing: -0.9, color: theme.ink }}>{t("changelog")}</Text>
        <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 17, lineHeight: 27.6, color: theme.muted }}>{t("changelogLead")}</Text>
        <View style={{ marginTop: 40, marginStart: 5, borderStartWidth: 1, borderStartColor: theme.line, paddingStart: 24 }}>
          {RELEASES.map((r, n) => (
            <View key={`${r.date}-${n}`} style={{ marginBottom: 48 }}>
              <View style={{ position: "absolute", left: -30, top: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: theme.accent }} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: theme.gold }}>{longDate(r.date, lang)}</Text>
              <Text accessibilityRole="header" style={{ marginTop: 4, fontFamily: FONT.display, fontSize: 24, lineHeight: 28, letterSpacing: -0.5, color: theme.ink }}>{title(r)}</Text>
              <View style={{ marginTop: 12, gap: 8 }}>
                {items(r).map((x, i) => (
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
