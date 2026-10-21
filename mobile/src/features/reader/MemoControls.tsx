import { Pressable, Switch, Text, View } from "react-native";
import { FONT, R, useTheme } from "@/lib/theme";
import { useWebT } from "@/i18n/web";
import { useReaderT, type ReaderKey } from "./texts";
import { LEVELS, TOOLS, type Level, type Memo, type Tool } from "./memo";

// The memorising controls shared by the active verse card and the whole-surah bar, so both always show the same mode:
// a segmented control for the mode, the practise levels as a numbered progression, short explanations of each.

/** segmented control in the website's style (rounded-full bg-bg p-1, white active pill); every option ≥ 44 pt high */
export function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: [T, string, string?][]; onChange: (v: T) => void; label: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignSelf: "flex-start", backgroundColor: t.bg, borderRadius: 24, padding: 2, borderWidth: 1, borderColor: t.line }}
      accessibilityRole="tablist" accessibilityLabel={label}>
      {options.map(([v, l, a11y]) => {
        const on = v === value;
        return (
          <Pressable key={String(v)} onPress={() => onChange(v)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={a11y ?? l}
            style={{ paddingHorizontal: 14, minHeight: 44, justifyContent: "center", borderRadius: 22, backgroundColor: on ? t.surface : "transparent", borderWidth: on ? 1 : 0, borderColor: t.line,
              shadowColor: "#000", shadowOpacity: on ? 0.06 : 0, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}>
            <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: on ? FONT.bold : FONT.semibold, fontSize: 13.5, color: on ? t.ink : t.muted }}>{l}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function useToolLabels() {
  const w = useWebT("player");
  const r = useReaderT();
  return (tool: Tool) => (tool === "read" ? w("toolRead") : tool === "practice" ? w("toolPractice") : tool === "test" ? w("toolTest") : tool === "listen" ? r("modeListen") : r("modeCheck"));
}

export function useLevelLabels() {
  const w = useWebT("player");
  const wsh = useWebT("shams");
  return (l: Level) => (l === 1 ? w("hideSoft") : l === 2 ? wsh("hAcrostic") : l === 3 ? w("hideHalf") : l === 4 ? w("hideRandom") : w("hideHard"));
}

const TOOL_D: Record<Tool, ReaderKey> = { read: "modeReadD", practice: "modePractiseD", test: "modeTestD", listen: "modeListenD", check: "modeCheckD" };
const LEVEL_D: Record<Level, ReaderKey> = { 1: "lvl1D", 2: "lvl2D", 3: "lvl3D", 4: "lvl4D", 5: "lvl5D" };

/** mode, level, explanations (and in the whole-surah bar: "cover every verse") */
export function MemoControls({ memo, onTool, onLevel, onShuffle, onAll, compact }: {
  memo: Memo; onTool: (t: Tool) => void; onLevel: (l: Level) => void; onShuffle?: () => void; onAll?: (on: boolean) => void; compact?: boolean;
}) {
  const t = useTheme();
  const w = useWebT("player");
  const r = useReaderT();
  const toolLabel = useToolLabels();
  const levelLabel = useLevelLabels();
  const tools = TOOLS;
  const tool = tools.includes(memo.tool) ? memo.tool : "read";
  const small = { fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted } as const;
  return (
    <View style={{ gap: 10 }}>
      <Seg value={tool} label={w("memorize")} onChange={onTool} options={tools.map((x) => [x, toolLabel(x)] as [Tool, string])} />
      {compact ? null : <Text maxFontSizeMultiplier={1.8} style={small}>{r(TOOL_D[tool])}</Text>}
      {tool === "practice" ? (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }} accessibilityRole="tablist" accessibilityLabel={w("hideLabel")}>
            {LEVELS.map((l) => {
              const on = memo.level === l;
              return (
                <Pressable key={l} onPress={() => { if (l === 4 && on) onShuffle?.(); onLevel(l); }} accessibilityRole="tab" accessibilityState={{ selected: on }}
                  accessibilityLabel={`${r("level", { n: l })}: ${levelLabel(l)}`} accessibilityHint={r(LEVEL_D[l])}
                  style={{ minHeight: 44, paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 7,
                    borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accentSoft : t.surface }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: on ? t.accent : t.bg, borderWidth: on ? 0 : 1, borderColor: t.line }}>
                    <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: FONT.bold, fontSize: 12, color: on ? (t.dark ? t.onAccent : "#ffffff") : t.muted, fontVariant: ["tabular-nums"] }}>{l}</Text>
                  </View>
                  <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.semibold, fontSize: 13, color: on ? t.accent : t.ink }}>{levelLabel(l)}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 12 }}>
            <Text maxFontSizeMultiplier={1.8} style={[small, { flexShrink: 1 }]}>{r(LEVEL_D[memo.level])}</Text>
            {memo.level === 4 && onShuffle ? (
              <Pressable onPress={onShuffle} accessibilityRole="button" accessibilityLabel={w("shuffle")} style={{ minHeight: 44, justifyContent: "center" }}>
                <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>↻ {w("shuffle")}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
      {onAll && (tool === "practice" || tool === "test") ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44 }}>
          <Text maxFontSizeMultiplier={1.6} style={{ flex: 1, fontFamily: FONT.medium, fontSize: 14, color: t.ink }}>{r("coverAll")}</Text>
          <Switch value={memo.all} onValueChange={onAll} trackColor={{ true: t.accent }} accessibilityLabel={r("coverAll")} />
        </View>
      ) : null}
    </View>
  );
}
