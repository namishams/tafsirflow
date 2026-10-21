import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ARABIC_FONT, CALLIG_FONT, FONT, stage, useTheme, AR_RIGHT } from "@/lib/theme";
import { Arcade, GoldButton, OutlineButton, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ErrorState } from "@/components/page";
import { openPro, usePro } from "@/lib/pro";
import { RECITERS } from "@/lib/quran";
import { useLang, pick } from "@/i18n";
import { RECITER_BIOS, bioText, reciterBio } from "@/web/reciters";
import { Callout, Kicker, QuranSeal, StarBullet, useQ } from "@/features/radio/art";
import { isFreeReciter, radio, useRadioSelect } from "@/features/radio/engine";
import { RadioMiniPlayer, MINI_SPACE } from "@/features/radio/MiniPlayer";
import { useAppT } from "@/features/radio/strings";
import { useReciter } from "@/features/quran/reciter";
import { LBL, styleName } from "./texts";
import { Markdown } from "./Markdown";
import { CalligraphyBackdrop, QPageWash, QTile, bioInitials, countryName } from "./common";
import { goBack } from "@/components/page";

// /reciters/[slug] – the website's reciter biography: hero with country, life and style, "listen in the player",
// the biography, "known for" and the way to recite yourself, previous / next reciter. Free to read.
export default function ReciterScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const th = useTheme();
  const q = useQ();
  const a = useAppT();
  const { lang } = useLang();
  const { pro } = usePro();
  const started = useRadioSelect((s) => s.started);
  const radioReciters = useRadioSelect((s) => s.reciters);
  const [, setReaderReciter] = useReciter();
  const insets = useSafeAreaInsets();
  const r = reciterBio(String(slug ?? ""));
  if (!r) return <><Stack.Screen options={{ headerShown: true, title: "" }} /><ErrorState retry={() => router.replace("/reciters" as Href)} /></>;

  const tx = bioText(r, lang);
  const L = pick(LBL, lang);
  const i = RECITER_BIOS.indexOf(r);
  const prev = RECITER_BIOS[i - 1], next = RECITER_BIOS[i + 1];
  const player = r.playerSlug ? RECITERS.find((x) => x.slug === r.playerSlug) : undefined;
  const locked = !!player && !pro && !isFreeReciter(player);
  // the same voice on the radio, when its audio is on the server
  const onRadio = r.playerSlug ? radioReciters.find((x) => x.slug === r.playerSlug) : undefined;
  const listen = () => {
    if (!player) return;
    if (locked) { openPro("reciters"); return; }
    setReaderReciter(player);
    router.push("/quran/1" as Href); // the website's /surah/1?reciter=…: the app's reader keeps its voice in useReciter

  };
  const listenRadio = () => {
    if (!onRadio) return;
    if (!radio.listenWith(onRadio.folder)) { openPro("reciters"); return; }
  };
  const life = r.born || r.died ? `${r.born ?? "?"}${r.died ? ` – ${r.died}` : ""}` : "";

  return (
    <View style={{ flex: 1, backgroundColor: th.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: (started ? MINI_SPACE : 0) + 40 + insets.bottom }}>
        <Stage hairlines={false}>
          <CalligraphyBackdrop text={r.arabic} />
          <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20, paddingBottom: 52 }}>
            <Pressable onPress={() => (router.canGoBack() ? goBack() : router.replace("/reciters" as Href))} accessibilityRole="link" accessibilityLabel={L.all} hitSlop={10}
              style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingVertical: 8 }}>
              <Icon name="chevronLeft" color="rgba(255,255,255,0.6)" size={16} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{L.all}</Text>
            </Pressable>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 36, lineHeight: 39, letterSpacing: -0.9, color: "#eef0f3", marginTop: 18 }}>{r.name}</Text>
            <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 30, lineHeight: 56, color: stage.gold, writingDirection: "rtl", textAlign: "left", marginTop: 4 }}>{r.arabic}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 17.5, lineHeight: 28, color: "rgba(255,255,255,0.75)", marginTop: 12 }}>{tx.short}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 30, rowGap: 12, marginTop: 26 }}>
              <Fact label={L.country} value={countryName(r, lang)} />
              {life ? <Fact label={L.life} value={life} /> : null}
              <Fact label={L.style} value={r.styles.map((s) => styleName(s, lang)).join(" · ")} />
            </View>
            {player ? (
              <View style={{ marginTop: 28, gap: 12 }}>
                <GoldButton title={L.listen} icon={locked ? "lock" : "play"} onPress={listen} />
                {onRadio ? <OutlineButton title={a("listenRadio")} icon={locked ? "lock" : "radio"} onStage onPress={listenRadio} /> : null}
              </View>
            ) : null}
          </View>
          <View style={{ opacity: 0.7 }}><Arcade /></View>
        </Stage>

        <View>
          <QPageWash />
          <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
            <Markdown text={tx.body} />
          </View>
          <View style={{ paddingHorizontal: 16, marginTop: 34 }}>
            <Callout>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <QuranSeal size={48}>{bioInitials(r)}</QuranSeal>
                <Kicker>{L.known}</Kicker>
              </View>
              <View style={{ marginTop: 16, gap: 10 }}>
                {tx.knownFor.map((k) => (
                  <View key={k} style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ marginTop: 5 }}><StarBullet color={th.gold} /></View>
                    <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: th.ink }}>{k}</Text>
                  </View>
                ))}
              </View>
            </Callout>
            <QTile onPress={() => router.push("/islam/reciter-path" as Href)} style={{ padding: 20, marginTop: 16 }} label={`${L.learn}. ${L.learnBody}`}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 14.5, color: th.ink }}>{L.learn}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: th.muted, marginTop: 4 }}>{L.learnBody}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.accent }}>{L.path}</Text>
                <Icon name="chevronRight" color={th.accent} size={14} />
              </View>
            </QTile>
          </View>

          {/* previous / next reciter */}
          <View style={{ paddingHorizontal: 16, marginTop: 30, gap: 12 }}>
            {prev ? (
              <QTile onPress={() => router.replace(`/reciters/${prev.slug}` as Href)} style={{ padding: 16 }} label={prev.name}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Icon name="chevronLeft" color={th.gold} size={18} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 15, color: th.ink }}>{prev.name}</Text>
                    <Text numberOfLines={1} allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 16, lineHeight: 26, color: q.inkGold, writingDirection: "rtl", textAlign: "left" }}>{prev.arabic}</Text>
                  </View>
                </View>
              </QTile>
            ) : null}
            {next ? (
              <QTile onPress={() => router.replace(`/reciters/${next.slug}` as Href)} style={{ padding: 16 }} label={next.name}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ flex: 1, minWidth: 0, alignItems: "flex-end" }}>
                    <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 15, color: th.ink, textAlign: "right" }}>{next.name}</Text>
                    <Text numberOfLines={1} allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 16, lineHeight: 26, color: q.inkGold, writingDirection: "rtl", textAlign: AR_RIGHT }}>{next.arabic}</Text>
                  </View>
                  <Icon name="chevronRight" color={th.gold} size={18} />
                </View>
              </QTile>
            ) : null}
          </View>
        </View>
      </ScrollView>
      <RadioMiniPlayer />
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{label}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#ffffff", marginTop: 2 }}>{value}</Text>
    </View>
  );
}
