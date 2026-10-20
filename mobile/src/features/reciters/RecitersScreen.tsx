import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { G, Path } from "react-native-svg";
import { CALLIG_FONT, FONT, stage, useTheme, AR_RIGHT } from "@/lib/theme";
import { Arcade, GoldButton, OutlineButton, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { usePro } from "@/lib/pro";
import { RECITERS } from "@/lib/quran";
import { useLang, pick } from "@/i18n";
import { RECITER_BIOS, STYLE, bioText } from "@/web/reciters";
import { Pill, QuranSeal, useQ } from "@/features/radio/art";
import { isFreeReciter, useRadioSelect } from "@/features/radio/engine";
import { RadioMiniPlayer, MINI_SPACE } from "@/features/radio/MiniPlayer";
import { goBack } from "@/features/radio/controls";
import { useAppT } from "@/features/radio/strings";
import { C, HERO_CALLIGRAPHY } from "./texts";
import { CalligraphyBackdrop, MoreTiles, QPageWash, QTile, bioInitials, countryName } from "./common";

// /reciters – the website's reciters page: 50 great reciters with their story; biographies are free to read.
export default function RecitersScreen() {
  const th = useTheme();
  const q = useQ();
  const { lang } = useLang();
  const { pro } = usePro();
  const started = useRadioSelect((s) => s.started);
  const a = useAppT();
  const insets = useSafeAreaInsets();
  const c = pick(C, lang);

  return (
    <View style={{ flex: 1, backgroundColor: th.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: (started ? MINI_SPACE : 0) + 40 + insets.bottom }}>
        <Stage hairlines={false}>
          <CalligraphyBackdrop text={HERO_CALLIGRAPHY} />
          <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20, paddingBottom: 56 }}>
            <Pressable onPress={() => goBack()} accessibilityRole="button" accessibilityLabel={a("back")} hitSlop={12} style={{ width: 40, height: 40, justifyContent: "center", marginStart: -6 }}>
              <Icon name="chevronLeft" color="#ffffff" size={24} />
            </Pressable>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.6, textTransform: "uppercase", color: stage.gold, marginTop: 18 }}>{c.kicker}</Text>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 36, lineHeight: 39, letterSpacing: -0.9, color: "#eef0f3", marginTop: 14 }}>{c.title}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 17, lineHeight: 27, color: "rgba(255,255,255,0.7)", marginTop: 18 }}>{c.lead}</Text>
            <View style={{ marginTop: 26, gap: 12 }}>
              <GoldButton title={c.path} onPress={() => router.push("/islam/reciter-path" as Href)} />
              <OutlineButton title={c.radio} onPress={() => router.push("/radio" as Href)} onStage icon="radio" />
            </View>
          </View>
          <View style={{ opacity: 0.7 }}><Arcade /></View>
        </Stage>

        <View>
          <QPageWash />
          <View style={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: 36, gap: 14 }}>
            {RECITER_BIOS.map((r, i) => {
              const tx = bioText(r, lang);
              const player = r.playerSlug ? RECITERS.find((x) => x.slug === r.playerSlug) : undefined;
              const locked = !!player && !pro && !isFreeReciter(player);
              const years = r.born || r.died ? ` · ${r.born ?? "?"}${r.died ? `–${r.died}` : ""}` : "";
              return (
                <QTile key={r.slug} onPress={() => router.push(`/reciters/${r.slug}` as Href)} style={{ padding: 18 }}
                  label={`${r.name}, ${countryName(r, lang)}${years ? `, ${years.slice(3)}` : ""}. ${tx.short}`}>
                  <Svg width={110} height={120} viewBox="0 0 110 120" style={{ position: "absolute", top: 10, right: 10, opacity: 0.13 }} pointerEvents="none">
                    <G fill="none" stroke={th.gold} strokeWidth={1}>
                      <Path d="M8 120V52C8 26 32 10 55 3c23 7 47 23 47 49v68" />
                      <Path d="M18 120V54c0-20 19-33 37-39 18 6 37 19 37 39v66" />
                      <Path d="M55 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
                    </G>
                  </Svg>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                    <QuranSeal>{bioInitials(r)}</QuranSeal>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: q.inkGold, fontVariant: ["tabular-nums"] }}>{String(i + 1).padStart(2, "0")} · {countryName(r, lang)}{years}</Text>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 17, lineHeight: 22, color: th.ink, marginTop: 2 }}>{r.name}</Text>
                      <Text numberOfLines={1} allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 19, lineHeight: 30, color: q.inkGold, writingDirection: "rtl", textAlign: AR_RIGHT }}>{r.arabic}</Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: th.muted, marginTop: 12 }}>{tx.short}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                    {r.styles.map((s) => <Pill key={s} label={pick(STYLE[s], lang)} />)}
                    {r.playerSlug ? <Pill play locked={locked} label={c.listen} /> : null}
                  </View>
                </QTile>
              );
            })}
          </View>
          <MoreTiles keys={["radio", "shams", "tajweed", "courses"]} />
        </View>
      </ScrollView>
      <RadioMiniPlayer />
    </View>
  );
}
