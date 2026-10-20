import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname, type Href } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { useTabBarSpace } from "@/components/TabBar";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { reciterName } from "@/lib/quran";
import { useRadioSelect } from "@/features/radio/engine";
import * as vp from "./versePlayback";

// Mini bar for a verse session that keeps playing after the learner left the surah reader (the website's VerseMini in
// RadioProvider.tsx): surah · verse and the reciter, play/pause, next verse, close. Tapping it opens the reader at the
// verse. Mounted once in the root layout next to the radio mini player; the two never play at the same time, and when
// both are visible the verse bar sits above the radio bar.
const TAB_ROOTS = ["/quran", "/learn", "/library", "/account"];
const READER = ["/quran/", "/shams/"];

export function VerseMiniPlayer() {
  const v = vp.useVersePlayback();
  const radioStarted = useRadioSelect((s) => s.started);
  const radioPlaying = useRadioSelect((s) => s.playing);
  const t = useWebT("radio");
  const tn = useWebT("nav");
  const { lang } = useLang();
  const th = useTheme();
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const path = usePathname();
  const s = v.session;
  if (!s || v.attached) return null;
  const reader = READER.some((p) => path.startsWith(p));
  // the radio's own bar (see features/radio/MiniPlayer.tsx): whatever plays wins, otherwise the radio
  const radioBar = radioStarted && !path.startsWith("/radio") && !(reader && !radioPlaying);
  if (radioBar && !v.playing) return null;
  const onTabs = path === "/" || TAB_ROOTS.some((p) => path === p || path.startsWith(`${p}/`));
  const base = reader ? insets.top + 56 : onTabs ? tabSpace : insets.bottom + 10;
  const shift = radioBar ? 70 : 0;
  const place = reader ? { top: base + shift } : { bottom: base + shift };
  const title = `${s.chapterName} · ${s.idx + 1}`;
  const sub = reciterName({ folder: s.reciterFolder, name: s.reciterName }, lang);
  const open = () => router.push(`/quran/${s.chapterId}?v=${s.idx + 1}` as Href);

  return (
    <View pointerEvents="box-none" style={[{ position: "absolute", left: 12, right: 12, alignItems: "center" }, place]}>
      <View style={{ width: "100%", maxWidth: 768, flexDirection: "row", alignItems: "center", gap: 10, padding: 8, paddingEnd: 10, borderRadius: R.lg, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface,
        shadowColor: "#000", shadowOpacity: th.dark ? 0.5 : 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
        <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`${t("openSurah")}: ${title}, ${sub}`}
          style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: R.sm, backgroundColor: th.accentSoft, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: th.accent, fontVariant: ["tabular-nums"] }}>{s.chapterId}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 14, color: th.ink }}>{title}</Text>
            <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted, marginTop: 1 }}>{sub}</Text>
          </View>
        </Pressable>
        <Pressable onPress={vp.toggle} accessibilityRole="button" accessibilityLabel={v.playing ? t("pause") : t("play")} hitSlop={4}
          style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, backgroundColor: th.accent, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.85 : 1 })}>
          <Icon name={v.playing ? "pause" : "play"} color={th.dark ? th.onAccent : "#ffffff"} size={20} />
        </Pressable>
        <Pressable onPress={() => vp.step(1)} accessibilityRole="button" accessibilityLabel={t("nextVerse")} hitSlop={4} disabled={s.idx >= s.items.length - 1}
          style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: pressed ? th.ink : th.line, alignItems: "center", justifyContent: "center", opacity: s.idx >= s.items.length - 1 ? 0.4 : 1 })}>
          <Icon name="next" color={th.ink} size={18} />
        </Pressable>
        <Pressable onPress={vp.stop} accessibilityRole="button" accessibilityLabel={tn("close")} hitSlop={6}
          style={{ width: 34, height: 36, alignItems: "center", justifyContent: "center" }}>
          <Icon name="close" color={th.muted} size={18} />
        </Pressable>
      </View>
    </View>
  );
}
