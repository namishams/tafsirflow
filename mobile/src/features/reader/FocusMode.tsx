import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Modal, type ScrollViewInstance, PanResponder, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import type { Chapter, Verse } from "@/lib/quran";
import { VerseWords, coverOf, type Cover, type Hide } from "@/features/quran/VerseWords";
import { useReaderT } from "./texts";
import { useSheetBarStyle } from "./statusBar";

// Full-screen focus mode for listening and reciting. Top half: the current verse, the recited word lit (word timings),
// the translation small below (can be hidden). Bottom half: a magnifier with only the current word, very large, with
// its transliteration and meaning (not for Arabic). Without word timings (or while paused) the magnifier steps through
// the words by tap / swipe / the arrows. Practise covers apply: a covered word appears in the magnifier only once it
// was recited or revealed. Controls: play/pause, previous / next verse, repeat, close.
const REPEATS = [1, 2, 3, 5, 10];

function Round({ icon, label, onPress, size = 52, fixed }: { icon: IconName; label: string; onPress: () => void; size?: number; fixed?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: pressed ? t.ink : t.line, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" })}>
      <Icon name={icon} color={t.ink} size={Math.round(size * 0.4)} fixed={fixed} />
    </Pressable>
  );
}

export function FocusMode({ open, onClose, chapter, verse, total, activeWord, timed, playing, repeat, hide, revealed, seed, shown, testPos, reduce, arabicUi,
  onToggle, onPrev, onNext, onRepeat, onRevealWord, onPlayWord }: {
  open: boolean; onClose: () => void; chapter: Chapter; verse: Verse; total: number; activeWord: number | null; timed: boolean; playing: boolean; repeat: number;
  hide: Hide; revealed: boolean; seed: number; shown: ReadonlySet<number>; testPos: number; reduce: boolean; arabicUi: boolean;
  onToggle: () => void; onPrev: () => void; onNext: () => void; onRepeat: (n: number) => void; onRevealWord: (wi: number, pos: number) => void; onPlayWord: (pos: number) => void;
}) {
  const t = useTheme();
  // the light focus surface: dark status bar text in light mode while it is open
  useSheetBarStyle(open, t.dark ? "light" : "dark", t.dark ? "light" : "dark");
  const w = useWebT("player");
  const r = useReaderT();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const words = useMemo(() => verse.words.filter((x) => x.char_type_name === "word"), [verse]);
  const [cursor, setCursor] = useState(0);
  const [heard, setHeard] = useState<Set<number>>(() => new Set());
  const [showTr, setShowTr] = useState(true);
  useEffect(() => { setCursor(0); setHeard(new Set()); }, [verse.verse_key]);
  // with timings the magnifier follows the recitation, and every recited word counts as heard
  const following = timed && playing && activeWord != null;
  useEffect(() => {
    if (!following) return;
    const wi = words.findIndex((x) => x.position === activeWord);
    if (wi < 0) return;
    setCursor(wi);
    setHeard((h) => (h.has(wi) ? h : new Set(h).add(wi)));
  }, [following, activeWord, words]);
  const wi = Math.min(cursor, Math.max(0, words.length - 1));
  const word = words[wi];
  const cover: Cover = word ? coverOf(hide, verse.verse_key, seed, wi, words.length, { revealed, shown, testPos }) : "none";
  const hiddenNow = cover !== "none" && !heard.has(wi);

  const step = (d: number) => {
    const n = Math.max(0, Math.min(words.length - 1, wi + d));
    setCursor(n);
    const x = words[n];
    if (x) AccessibilityInfo.announceForAccessibility(`${r("wordOf", { n: n + 1, total: words.length })}`);
  };
  const stepRef = useRef(step);
  stepRef.current = step;
  // swipe up = next verse, swipe down = previous verse
  const verseRef = useRef({ next: onNext, prev: onPrev });
  verseRef.current = { next: onNext, prev: onPrev };

  // word-by-word grid: remember each chip's row and keep the active one in view
  const gridRef = useRef<ScrollViewInstance>(null);
  const chipY = useRef<number[]>([]);
  const gridH = useRef(0);
  useEffect(() => { chipY.current = []; gridRef.current?.scrollTo({ y: 0, animated: false }); }, [verse.verse_key]);
  // swipe: in Arabic the next word lies to the left, so the words move to the right (like turning a mushaf page)
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) => Math.max(Math.abs(g.dx), Math.abs(g.dy)) > 18,
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) >= Math.abs(g.dy)) { if (Math.abs(g.dx) > 40) stepRef.current(g.dx > 0 ? 1 : -1); }
      else if (Math.abs(g.dy) > 50) (g.dy < 0 ? verseRef.current.next : verseRef.current.prev)();
    },
  }), []);

  // a calm fade when the word changes (none with Reduce Motion)
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduce) { fade.setValue(1); return; }
    fade.setValue(0.35);
    const a = Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [wi, verse.verse_key, reduce, fade]);

  const big = Math.min(120, Math.max(72, Math.round(Math.min(width, 700) * 0.26)));
  const maxW = Math.min(width - 32, 820);
  useEffect(() => {
    const y = chipY.current[wi];
    if (y == null) return;
    gridRef.current?.scrollTo({ y: Math.max(0, y - gridH.current / 3), animated: !reduce });
  }, [wi, reduce]);
  const progress = total > 0 ? verse.verse_number / total : 0;
  const nextRepeat = REPEATS[(REPEATS.indexOf(repeat) + 1) % REPEATS.length] ?? 1;
  const meaning = !arabicUi && word && !hiddenNow ? word.translation?.text : undefined;
  const translit = !arabicUi && word && !hiddenNow ? word.transliteration?.text : undefined;

  return (
    <Modal visible={open} animationType={reduce ? "none" : "slide"} presentationStyle="fullScreen" onRequestClose={onClose} supportedOrientations={["portrait", "landscape"]}>
      <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {/* bar */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, height: 52 }}>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={w("closeTafsir")} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Icon name="chevronDown" color={t.ink} size={24} />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }} accessible accessibilityRole="header" accessibilityLabel={`${r("focus")}: ${chapter.name_simple}, ${w("verse")} ${verse.verse_number}/${total}`}>
            <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 18, lineHeight: 28, color: t.gold }}>{chapter.name_arabic}</Text>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted, fontVariant: ["tabular-nums"] }}>{chapter.name_simple} · {verse.verse_number}/{total}</Text>
          </View>
          {arabicUi || !verse.translation ? <View style={{ width: 44 }} /> : (
            <Pressable onPress={() => setShowTr((x) => !x)} accessibilityRole="switch" accessibilityState={{ checked: showTr }} accessibilityLabel={showTr ? r("hideTranslation") : r("showTranslation")}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Icon name="eye" color={showTr ? t.accent : t.muted} size={20} filled={showTr} />
            </Pressable>
          )}
        </View>

        {/* surah progress */}
        <View accessible accessibilityRole="progressbar" accessibilityLabel={r("verseProgress", { n: verse.verse_number, total })}
          accessibilityValue={{ min: 0, max: total, now: verse.verse_number }}
          style={{ height: 3, marginHorizontal: 16, borderRadius: 2, backgroundColor: t.line, overflow: "hidden", flexDirection: "row", direction: "rtl" }}>
          <View style={{ width: `${Math.round(progress * 1000) / 10}%`, backgroundColor: "rgb(201,166,94)" }} />
        </View>

        {/* top: the verse */}
        <ScrollView style={{ flexGrow: 0, maxHeight: height * 0.3 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" }}>
          <View style={{ width: maxW }}>
            <VerseWords verse={verse} activeWord={word?.position ?? null} hide={hide} revealed={revealed} seed={seed} shown={new Set([...shown, ...heard])} testPos={testPos} reduce={reduce}
              size={height < 700 ? 26 : 30}
              onWord={(pos, i, c) => { setCursor(i); if (c !== "none") onRevealWord(i, pos); else onPlayWord(pos); }}
              labels={(c, n, tot) => r(c === "soft" ? "blurredWord" : c === "cue" ? "cueWord" : "hiddenWord", { n, total: tot })} />
            {showTr && !arabicUi && verse.translation ? (
              <Text allowFontScaling maxFontSizeMultiplier={1.8} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 8 }}>{verse.translation}</Text>
            ) : null}
          </View>
        </ScrollView>

        {/* middle: word by word */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text maxFontSizeMultiplier={1} style={{ width: maxW, fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: t.muted, marginBottom: 6 }}>{r("wordGrid")}</Text>
          <ScrollView ref={gridRef} style={{ alignSelf: "stretch" }} onLayout={(e) => { gridH.current = e.nativeEvent.layout.height; }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, alignItems: "center" }}>
            <View style={{ width: maxW, flexDirection: "row", flexWrap: "wrap", direction: "rtl", gap: 8 }}>
              {words.map((x, i) => {
                const active = i === wi;
                const c: Cover = coverOf(hide, verse.verse_key, seed, i, words.length, { revealed, shown, testPos });
                const hid = c !== "none" && !heard.has(i);
                const tr = !arabicUi && !hid ? x.transliteration?.text : undefined;
                const mn = !arabicUi && !hid ? x.translation?.text : undefined;
                return (
                  <Pressable key={x.position} onLayout={(e) => { chipY.current[i] = e.nativeEvent.layout.y; }}
                    onPress={() => setCursor(i)} accessibilityRole="button" accessibilityState={{ selected: active }}
                    accessibilityLabel={hid ? r("coveredWord") : x.text_uthmani} accessibilityLanguage={hid ? undefined : "ar"}
                    accessibilityValue={{ text: `${r("wordOf", { n: i + 1, total: words.length })}${mn ? `, ${mn}` : ""}` }} accessibilityHint={r("chipHint")}
                    style={({ pressed }) => ({ minWidth: 64, maxWidth: maxW / 2.6, minHeight: 44, paddingHorizontal: 10, paddingVertical: 6, borderRadius: R.md, alignItems: "center",
                      borderWidth: active ? 1.5 : 1, borderColor: active ? "rgb(201,166,94)" : pressed ? t.ink : t.line,
                      backgroundColor: active ? "rgba(201,166,94,0.15)" : t.surface })}>
                    <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 40, color: hid ? t.muted : active ? t.accent : t.arabic, writingDirection: "rtl", textAlign: "center" }}>
                      {hid ? "?" : x.text_uthmani}
                    </Text>
                    {tr ? <Text numberOfLines={1} maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.italic, fontSize: 11, color: t.gold, textAlign: "center" }}>{tr}</Text> : null}
                    {mn ? <Text numberOfLines={2} maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted, textAlign: "center" }}>{mn}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* bottom: the magnifier */}
        <View style={{ flex: 1.3, borderTopWidth: 1, borderTopColor: "rgba(201,166,94,0.35)", backgroundColor: t.surface, alignItems: "center" }}>
          <LinearGradient colors={["rgba(201,166,94,0)", "rgb(201,166,94)", "rgba(201,166,94,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 2, alignSelf: "stretch" }} />
          <View style={{ flex: 1, width: maxW, flexDirection: "row", direction: "ltr", alignItems: "center" }}>
            {/* Arabic order: the next word is on the left, the previous on the right */}
            <Round icon="chevronLeft" fixed size={44} label={r("nextWord")} onPress={() => step(1)} />
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }} {...pan.panHandlers}>
              <Pressable onPress={() => (hiddenNow && word ? onRevealWord(wi, word.position) : following ? undefined : step(1))}
                accessible accessibilityRole="adjustable" accessibilityLabel={hiddenNow ? r("coveredWord") : word?.text_uthmani ?? ""} accessibilityLanguage={hiddenNow ? undefined : "ar"}
                accessibilityValue={{ text: `${r("wordOf", { n: wi + 1, total: words.length })}${meaning ? `, ${meaning}` : ""}` }}
                accessibilityHint={following ? r("verseSwipeHint") : `${r("stepHint")} ${r("verseSwipeHint")}`}
                accessibilityActions={[{ name: "increment" }, { name: "decrement" }, { name: "activate" }]}
                onAccessibilityAction={(e) => { const n = e.nativeEvent.actionName; if (n === "increment") step(1); else if (n === "decrement") step(-1); else if (word) (hiddenNow ? onRevealWord(wi, word.position) : onPlayWord(word.position)); }}
                style={{ alignSelf: "stretch", alignItems: "center", paddingVertical: 8 }}>
                <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: t.muted }}>{r("magnifier")} · {wi + 1}/{words.length}</Text>
                <Animated.View style={{ opacity: fade, alignItems: "center", alignSelf: "stretch", marginTop: 4 }}>
                  {hiddenNow ? (
                    <View style={{ height: big * 1.6, minWidth: big * 1.6, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1.5, borderStyle: "dashed", borderColor: t.muted, backgroundColor: t.line, alignItems: "center", justifyContent: "center" }}>
                      <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.bold, fontSize: big * 0.5, color: t.muted }}>?</Text>
                    </View>
                  ) : (
                    <Text adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.4} maxFontSizeMultiplier={1}
                      style={{ alignSelf: "stretch", textAlign: "center", fontFamily: ARABIC_FONT, fontSize: big, lineHeight: Math.round(big * 1.9), color: following ? t.accent : t.arabic, writingDirection: "rtl" }}>
                      {word?.text_uthmani ?? ""}
                    </Text>
                  )}
                  {translit ? <Text maxFontSizeMultiplier={1.6} style={{ fontFamily: FONT.italic, fontSize: 17, color: t.gold, marginTop: -6, textAlign: "center" }}>{translit}</Text> : null}
                  {meaning ? <Text maxFontSizeMultiplier={1.6} style={{ fontFamily: FONT.regular, fontSize: 16, color: t.muted, marginTop: 2, textAlign: "center" }}>{meaning}</Text> : null}
                  {hiddenNow ? <Text maxFontSizeMultiplier={1.6} style={{ fontFamily: FONT.medium, fontSize: 14, color: t.muted, marginTop: 10, textAlign: "center" }}>{r("coveredWord")}</Text> : null}
                </Animated.View>
              </Pressable>
              {hiddenNow && word ? (
                <Pressable onPress={() => onRevealWord(wi, word.position)} accessibilityRole="button" accessibilityLabel={r("revealWord")} style={{ marginTop: 6 }}>
                  <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ minHeight: 44, borderRadius: R.pill, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" }}>
                    <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{r("revealWord")}</Text>
                  </LinearGradient>
                </Pressable>
              ) : word ? (
                <Pressable onPress={() => onPlayWord(word.position)} accessibilityRole="button" accessibilityLabel={r("hearWord")}
                  style={{ minHeight: 44, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Icon name="volume" color={t.accent} size={16} />
                  <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>{r("hearWord")}</Text>
                </Pressable>
              ) : null}
            </View>
            <Round icon="chevronRight" fixed size={44} label={r("prevWord")} onPress={() => step(-1)} />
          </View>

          {/* controls */}
          <View style={{ flexDirection: "row", direction: "ltr", alignItems: "center", justifyContent: "center", gap: 18, paddingVertical: 12 }}>
            <Pressable onPress={() => onRepeat(nextRepeat)} accessibilityRole="button" accessibilityLabel={`${w("repeat")}: ×${repeat}`}
              style={({ pressed }) => ({ minWidth: 52, height: 44, borderRadius: 22, borderWidth: 1, borderColor: repeat > 1 ? "rgb(201,166,94)" : pressed ? t.ink : t.line, backgroundColor: repeat > 1 ? "rgba(201,166,94,0.15)" : t.surface, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, paddingHorizontal: 8 })}>
              <Icon name="repeat" color={t.ink} size={16} />
              <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.ink, fontVariant: ["tabular-nums"] }}>×{repeat}</Text>
            </Pressable>
            <Round icon="prev" label={w("prev")} onPress={onPrev} />
            <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={playing ? w("pause") : w("play")}>
              <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center" }}>
                <Icon name={playing ? "pause" : "play"} color={goldButton.text} size={28} />
              </LinearGradient>
            </Pressable>
            <Round icon="next" label={w("next")} onPress={onNext} />
            <View style={{ minWidth: 52 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
