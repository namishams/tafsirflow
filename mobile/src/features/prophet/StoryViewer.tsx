import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, I18nManager, Modal, PanResponder, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Icon } from "@/components/icons";
import { SITE } from "@/lib/api";
import { FONT, stage } from "@/lib/theme";
import { openPro } from "@/lib/pro";
import { useLang } from "@/i18n";
import { useStored } from "@/lib/store";
import { useReducedMotionX } from "@/features/extra/motion";
import { FeedBackdrop, toneOf } from "@/features/feed/art";
import { ShareSheet } from "@/features/feed/share";
import { ProCard, StoryContent } from "./StoryContent";
import { StoryShareCard } from "./StoryShareCard";
import type { StoryGroup } from "./stories";
import { useProphetText } from "./texts";
import { SAVED_KEY, markSeen, toggleSavedStory, useStoryQuota } from "./useStories";

// Full-screen story viewer (Instagram stories): progress bars per card of the group, tap the far side to go on and
// the near side to go back (mirrored right to left), touch and hold to pause, swipe down to close. Cards move on by
// themselves after a reading time; with Reduce Motion or VoiceOver they wait for the person (buttons at the bottom).
// Free accounts see FREE_STORIES_PER_DAY cards a day, then the Pro card.

const readMs = (words: number) => Math.min(45000, Math.max(8000, (words / 3.2) * 1000));

export function StoryViewer({ groups, start, onClose }: { groups: StoryGroup[]; start: { group: number; story: number } | null; onClose: () => void }) {
  const tx = useProphetText();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduce = useReducedMotionX();
  const quota = useStoryQuota();
  const saves = useStored<string[]>(SAVED_KEY, []);
  const [pos, setPos] = useState(start ?? { group: 0, story: 0 });
  const [paused, setPaused] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [reader, setReader] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const scrollTop = useRef(true);

  useEffect(() => { if (start) setPos(start); }, [start]);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isScreenReaderEnabled().then((v) => { if (alive) setReader(v); }).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("screenReaderChanged", setReader);
    return () => { alive = false; sub.remove(); };
  }, []);

  const group = groups[pos.group];
  const story = group?.stories[pos.story];
  // our own promo cards between the groups (feed/HomeFeed) never use up a free story
  const promo = !!story?.id.startsWith("promo-");
  const allowed = story ? promo || quota.allowed(story.id) : false;

  const next = () => {
    if (!group) return;
    if (pos.story + 1 < group.stories.length) setPos({ group: pos.group, story: pos.story + 1 });
    else if (pos.group + 1 < groups.length) setPos({ group: pos.group + 1, story: 0 });
    else onClose();
  };
  const prev = () => {
    if (pos.story > 0) setPos({ group: pos.group, story: pos.story - 1 });
    else if (pos.group > 0) setPos({ group: pos.group - 1, story: Math.max(0, groups[pos.group - 1].stories.length - 1) });
  };

  // count, mark seen, and run the reading timer
  const auto = !reduce && !reader && allowed;
  useEffect(() => {
    if (!story || !start) return;
    if (allowed && !promo) { quota.mark(story.id); markSeen(story.id); }
    progress.setValue(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, !!start]);
  useEffect(() => {
    if (!story || !start || !auto || paused || sharing) { progress.stopAnimation(); return; }
    const words = `${story.title} ${story.paragraphs.join(" ")}`.split(/\s+/).length;
    let left = 1;
    progress.stopAnimation((v) => { left = 1 - (v ?? 0); });
    const a = Animated.timing(progress, { toValue: 1, duration: readMs(words) * left, easing: Easing.linear, useNativeDriver: false });
    a.start(({ finished }) => { if (finished) next(); });
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, auto, paused, sharing, !!start]);

  // swipe down to close (only when the text is scrolled to the top)
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => scrollTop.current && g.dy > 12 && Math.abs(g.dy) > Math.abs(g.dx) * 1.5,
    onPanResponderGrant: () => setPaused(true),
    onPanResponderMove: (_, g) => dragY.setValue(Math.max(0, g.dy)),
    onPanResponderRelease: (_, g) => {
      setPaused(false);
      if (g.dy > 120 || g.vy > 1.1) { dragY.setValue(0); onClose(); return; }
      Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
    },
    onPanResponderTerminate: () => { setPaused(false); dragY.setValue(0); },
  })).current;

  const onTap = (x: number) => {
    const forwardRight = !I18nManager.isRTL;
    const nearSide = forwardRight ? x < width * 0.3 : x > width * 0.7;
    if (nearSide) prev(); else next();
  };

  if (!start || !group || !story) return null;
  const saved = saves.includes(story.id);
  const wide = width >= 700;
  const opacity = dragY.interpolate({ inputRange: [0, 300], outputRange: [1, 0.6], extrapolate: "clamp" });

  return (
    <Modal visible animationType={reduce ? "none" : "fade"} onRequestClose={onClose} statusBarTranslucent supportedOrientations={["portrait", "landscape"]}>
      <StatusBar style="light" />
      <Animated.View style={{ flex: 1, backgroundColor: stage.deep, opacity, transform: [{ translateY: dragY }] }} {...pan.panHandlers}>
        <FeedBackdrop tone={toneOf(story.group)} width={width} height={height} animate={!reduce} still={reduce} />
        {/* progress bars of this group */}
        <View style={{ position: "absolute", top: insets.top + 8, left: 10, right: 10, flexDirection: "row", gap: 4 }} accessible accessibilityLabel={tx.storyOf.replace("{n}", String(pos.story + 1)).replace("{total}", String(group.stories.length))}>
          {group.stories.map((s, i) => (
            <View key={s.id} style={{ flex: 1, height: 2.5, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
              {i < pos.story ? <View style={{ flex: 1, backgroundColor: "#fff" }} /> : i === pos.story ? (
                auto ? <Animated.View style={{ height: "100%", backgroundColor: "#fff", width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }} /> : <View style={{ flex: 1, backgroundColor: "#fff" }} />
              ) : null}
            </View>
          ))}
        </View>
        <View style={{ position: "absolute", top: insets.top + 20, left: 14, right: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13.5, color: "#fff" }}>{group.title}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tx.close} hitSlop={10} style={{ padding: 8 }}><Icon name="close" color="#fff" size={22} /></Pressable>
        </View>

        <Pressable style={{ flex: 1 }} accessible={false} onPress={(e) => onTap(e.nativeEvent.pageX)} onLongPress={() => setPaused(true)} onPressOut={() => setPaused(false)} delayLongPress={250}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingTop: insets.top + 70, paddingBottom: 24, maxWidth: 720, alignSelf: "center", width: "100%" }}
            onScroll={(e) => { scrollTop.current = e.nativeEvent.contentOffset.y <= 2; }} scrollEventThrottle={32}>
            {allowed ? (
              <StoryContent story={story} wide={wide} onReadMore={() => { onClose(); router.push(story.href as Href); }} />
            ) : (
              <ProCard onPro={() => { onClose(); openPro("general"); }} onLater={onClose} />
            )}
          </ScrollView>
        </Pressable>

        {/* the bottom bar: previous / next for everyone (also VoiceOver), save, share */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12) }}>
          <BarButton icon={I18nManager.isRTL ? "chevronRight" : "chevronLeft"} label={tx.prev} onPress={prev} />
          {allowed ? (
            <View style={{ flexDirection: "row", gap: 6 }}>
              <BarButton icon="bookmark" label={saved ? tx.unsave : tx.save} filled={saved} onPress={() => toggleSavedStory(story.id)} />
              <BarButton icon="send" label={tx.share} onPress={() => setSharing(true)} />
            </View>
          ) : <View />}
          <BarButton icon={I18nManager.isRTL ? "chevronLeft" : "chevronRight"} label={tx.next} onPress={next} />
        </View>
      </Animated.View>
      <ShareSheet visible={sharing} onClose={() => setSharing(false)} link={`${SITE}/${lang}${story.webPath}`} message={`${story.title}\n${story.groupTitle}`}
        renderCard={(f) => <StoryShareCard story={story} format={f} />} />
    </Modal>
  );
}

function BarButton({ icon, label, onPress, filled }: { icon: "chevronLeft" | "chevronRight" | "bookmark" | "send"; label: string; onPress: () => void; filled?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}
      style={({ pressed }) => ({ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.28)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" })}>
      <Icon name={icon} color={filled ? stage.gold : "#fff"} filled={filled} size={20} fixed />
    </Pressable>
  );
}
