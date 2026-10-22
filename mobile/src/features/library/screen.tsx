import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, View, useWindowDimensions, type ScrollViewInstance } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { stage } from "@/lib/theme";
import { useIsl } from "./palette";
import { useProgressiveChildren } from "@/lib/progressive";

// The frame of every library page: no stack header (each hero has its own back button), the marble canvas, and a
// calm band behind the status bar that fades in once the dark hero has scrolled away (like the website's sticky header).
type ScreenCtx = {
  scrollY: Animated.Value;
  setHeroHeight: (h: number) => void;
  scrollTo: (y: number) => void;
  viewport: number;
  topInset: number;
};
const Ctx = createContext<ScreenCtx | null>(null);
export const useIslScreen = () => useContext(Ctx);

export function IslScreen({ children, overlay, onScrollY }: { children: ReactNode; overlay?: ReactNode; onScrollY?: (y: number) => void }) {
  const isl = useIsl();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const scrollY = useRef(new Animated.Value(0)).current;
  const ref = useRef<ScrollViewInstance>(null);
  const [heroH, setHeroH] = useState(0);
  const [covered, setCovered] = useState(false);
  const coveredRef = useRef(false);
  const heroRef = useRef(0);
  const setHeroHeight = useCallback((h: number) => { heroRef.current = h; setHeroH(h); }, []);
  const scrollTo = useCallback((y: number) => ref.current?.scrollTo({ y: Math.max(0, y), animated: true }), []);
  const onScroll = useMemo(() => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = e.nativeEvent.contentOffset.y;
      const c = heroRef.current > 0 && y > heroRef.current - insets.top - 8;
      if (c !== coveredRef.current) { coveredRef.current = c; setCovered(c); }
      onScrollY?.(y);
    },
  }), [scrollY, insets.top, onScrollY]);
  const value = useMemo(() => ({ scrollY, setHeroHeight, scrollTo, viewport: height, topInset: insets.top }), [scrollY, setHeroHeight, scrollTo, height, insets.top]);
  const start = Math.max(1, heroH - insets.top - 24);
  // the sections below the first screen are built over the next frames (lib/progressive.ts)
  const sections = useProgressiveChildren(children);
  return (
    <Ctx.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: isl.paper2 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style={covered && !isl.dark ? "dark" : "light"} />
        <Animated.ScrollView ref={ref} style={{ flex: 1 }} onScroll={onScroll} scrollEventThrottle={16} contentInsetAdjustmentBehavior="never">
          {/* pulling down past the top shows the stage, not the marble */}
          <View pointerEvents="none" style={{ position: "absolute", top: -1000, left: 0, right: 0, height: 1000, backgroundColor: stage.bg }} />
          {sections}
        </Animated.ScrollView>
        <Animated.View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: insets.top, backgroundColor: isl.paper, borderBottomWidth: 0.5, borderBottomColor: isl.a("goldSoft", 0.3),
          opacity: heroH ? scrollY.interpolate({ inputRange: [start, start + 24], outputRange: [0, 0.97], extrapolate: "clamp" }) : 0 }} />
        {overlay}
      </View>
    </Ctx.Provider>
  );
}
