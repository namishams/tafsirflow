import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, LayoutAnimation, Pressable, ScrollView, Text, View } from "react-native";
import { FONT } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { IslamNum, useSaw } from "./art";
import { useIsl } from "./palette";
import { useIslScreen } from "./screen";

// Reading aids for long chapters (IslamReader.tsx): a gold progress line under the status bar and, while the chapter
// is on screen, a slim bar with the current section that opens the table of contents. Section positions come from
// <Article onHeading>; `base` is where the article starts in the scroll content.

export type ReaderModel = {
  /** where the article starts in the scroll content, and its height */
  setArticle: (top: number, height: number) => void;
  /** position of section n (1-based) inside the article */
  setHeading: (n: number, y: number) => void;
  /** feed the scroll position */
  onScrollY: (y: number) => void;
};

export function useReader(count: number) {
  const pos = useRef<{ top: number; height: number; heads: number[] }>({ top: 0, height: 0, heads: [] });
  const listener = useRef<((y: number) => void) | null>(null);
  const [range, setRange] = useState({ top: 0, height: 0 });
  const model: ReaderModel = {
    setArticle: useCallback((top: number, height: number) => { pos.current.top = top; pos.current.height = height; setRange((r) => (Math.abs(r.top - top) < 1 && Math.abs(r.height - height) < 1 ? r : { top, height })); }, []),
    setHeading: useCallback((n: number, y: number) => { pos.current.heads[n - 1] = y; }, []),
    onScrollY: useCallback((y: number) => listener.current?.(y), []),
  };
  return { model, pos, listener, range, count };
}

export function ReadingBar({ reader, sections, title }: { reader: ReturnType<typeof useReader>; sections: string[]; title: string }) {
  const isl = useIsl();
  const sw = useSaw();
  const screen = useIslScreen();
  const [state, setState] = useState({ cur: 0, inside: false });
  const [open, setOpen] = useState(false);
  const top = screen?.topInset ?? 0;
  const vh = screen?.viewport ?? 800;
  const BAR = 44;
  useEffect(() => {
    reader.listener.current = (y: number) => {
      const { top: at, height, heads } = reader.pos.current;
      if (!height) return;
      const view = y + top + BAR;
      let cur = 0;
      for (let n = 1; n <= sections.length; n++) { const h = heads[n - 1]; if (h !== undefined && at + h < view + 40) cur = n; else if (h !== undefined) break; }
      const inside = at < y + top + 40 && at + height > y + vh * 0.5;
      setState((s) => (s.cur === cur && s.inside === inside ? s : { cur, inside }));
    };
    return () => { reader.listener.current = null; };
  }, [reader, sections.length, top, vh]);
  useEffect(() => { if (!state.inside) setOpen(false); }, [state.inside]);
  const { top: at, height } = reader.range;
  const scrollY = screen?.scrollY;
  const pct = scrollY && height ? scrollY.interpolate({ inputRange: [at - top - 56, Math.max(at - top - 55, at + height - vh)], outputRange: [0, 1], extrapolate: "clamp" }) : null;
  const go = (n: number) => {
    setOpen(false);
    const h = reader.pos.current.heads[n - 1];
    if (h !== undefined) screen?.scrollTo(reader.pos.current.top + h - top - BAR - 12);
  };
  const shown = state.inside && sections.length > 1;
  const cur = Math.max(1, state.cur);
  return (
    <>
      {pct ? (
        <Animated.View pointerEvents="none" style={{ position: "absolute", top: top, left: 0, right: 0, height: 2, zIndex: 3,
          opacity: pct.interpolate({ inputRange: [0, 0.001, 0.999, 1], outputRange: [0, 1, 1, 0] }) }}>
          <Animated.View style={{ height: 2, width: "100%", backgroundColor: isl.goldSoft, transformOrigin: "left", transform: [{ scaleX: pct }] }} />
        </Animated.View>
      ) : null}
      {shown ? (
        <View style={{ position: "absolute", top, left: 0, right: 0, zIndex: 2, backgroundColor: isl.a("surface", 0.97), borderBottomWidth: 1, borderBottomColor: isl.a("goldSoft", 0.3) }}>
          <Pressable onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setOpen((o) => !o); }} accessibilityRole="button" accessibilityState={{ expanded: open }}
            accessibilityLabel={`${cur}/${sections.length}: ${state.cur ? sections[state.cur - 1] : title}`}
            style={{ height: BAR, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20 }}>
            <IslamNum n={cur} on size={28.6} fontSize={13} />
            <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13.5, color: isl.ink }}>{sw(state.cur ? sections[state.cur - 1] : title)}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: isl.muted, fontVariant: ["tabular-nums"] }}>{cur}/{sections.length}</Text>
            <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}><Icon name="chevronDown" size={16} color={isl.muted} /></View>
          </Pressable>
          {open ? (
            <ScrollView style={{ maxHeight: vh * 0.6, borderTopWidth: 1, borderTopColor: isl.a("goldSoft", 0.2) }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: isl.muted, paddingVertical: 8 }}>{title}</Text>
              {sections.map((h, i) => {
                const on = state.cur === i + 1;
                return (
                  <Pressable key={i} onPress={() => go(i + 1)} accessibilityRole="link" accessibilityState={{ selected: on }}
                    style={({ pressed }) => ({ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 6, paddingHorizontal: 6, marginHorizontal: -6, borderRadius: 8, backgroundColor: on ? isl.a("goldSoft", 0.12) : pressed ? isl.a("goldSoft", 0.08) : "transparent" })}>
                    <IslamNum n={i + 1} on={on} size={23.1} fontSize={10.5} />
                    <Text style={{ flex: 1, paddingTop: 2, fontFamily: on ? FONT.bold : FONT.regular, fontSize: 14, lineHeight: 19, color: on ? isl.ink : isl.a("ink", 0.72) }}>{sw(h)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}
        </View>
      ) : null}
    </>
  );
}
