import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { PageHero, goBack } from "@/components/page";
import { LANGS, deviceLang, langLabel, useLang, useT, type LangSetting } from "@/i18n";

// The app language: the device's language (when the app speaks it) or one of the website's languages, each written
// in its own script. Arabic, Persian, Urdu and Pashto turn the layout to right-to-left; the app restarts for that.
export default function LanguageScreen() {
  const t = useT();
  const theme = useTheme();
  const { setting, setSetting } = useLang();
  const rows: [LangSetting, string][] = [["system", `${t("account.languageSystem")} · ${langLabel(deviceLang())}`], ...LANGS.map((l) => [l, langLabel(l)] as [LangSetting, string])];
  const choose = (s: LangSetting) => { setSetting(s); goBack(); };
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <PageHero back topInset title={t("account.chooseLanguage")} arcade={false} />
        <View style={{ padding: 16, width: "100%", maxWidth: 620, alignSelf: "center" }}>
          <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, overflow: "hidden" }}>
            {rows.map(([value, label], i) => {
              const on = setting === value;
              return (
                <Pressable key={value} onPress={() => choose(value)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={label}
                  style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 15, borderTopWidth: i ? 1 : 0, borderTopColor: theme.line, backgroundColor: pressed ? theme.bg : theme.surface })}>
                  <Text style={{ flex: 1, fontFamily: on ? FONT.semibold : FONT.regular, fontSize: 16.5, color: on ? theme.accent : theme.ink }}>{label}</Text>
                  {on ? <Icon name="check" color={theme.accent} size={18} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
