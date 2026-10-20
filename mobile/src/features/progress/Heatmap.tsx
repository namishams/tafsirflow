import { useState } from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { readJSON } from "@/lib/store";
import { today } from "@/web/learning";
import { FONT, useTheme } from "@/lib/theme";
import { useWebT } from "@/i18n/web";
import { alpha, HM_GOLD } from "./art";
import { useLive } from "./hooks";

/**
 * Last 12 weeks, one square per day – the darker, the more verses practised (website: Heatmap.tsx).
 * Rows are weekdays (Monday on top), columns are weeks; the current week ends today. Reads tf:days.
 */
export function Heatmap() {
  const t = useTheme();
  const tr = useWebT("session");
  const [w, setW] = useState(0);
  const data = useLive(() => {
    const days = readJSON<Record<string, number>>("tf:days", {});
    const end = today();
    const start = end - ((new Date(end * 86400000).getUTCDay() + 6) % 7) - 77;
    const cells = Array.from({ length: end - start + 1 }, (_, i) => { const d = start + i; return { d, n: Number(days[String(d)] ?? 0) }; });
    const max = Math.max(1, ...cells.map((c) => c.n));
    return { end, cells, max, active: cells.filter((c) => c.n > 0).length, total: cells.reduce((a, c) => a + c.n, 0) };
  });
  const gap = 3;
  const size = w ? (w - gap * 11) / 12 : 0;
  return (
    <View>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: size ? size * 7 + gap * 6 : 120 }}
        accessible accessibilityLabel={tr("heat", { days: data.active, verses: data.total })}>
        {size ? data.cells.map((c, i) => {
          const col = Math.floor(i / 7), row = i % 7;
          const f = c.n / data.max;
          const isToday = c.d === data.end;
          return (
            <View key={c.d} style={{ position: "absolute", left: col * (size + gap), top: row * (size + gap), width: size, height: size }}>
              {c.n > 0 && f >= 0.85 ? (
                <LinearGradient colors={["#e3cb93", "#c6a65e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 3 }} />
              ) : (
                <View style={{ flex: 1, borderRadius: 3, backgroundColor: c.n === 0 ? "rgba(201,166,94,0.09)" : alpha(t.accent, f < 0.25 ? 0.3 : f < 0.5 ? 0.55 : 0.85), borderWidth: c.n === 0 ? 1 : 0, borderColor: "rgba(201,166,94,0.12)" }} />
              )}
              {isToday ? <View pointerEvents="none" style={{ position: "absolute", top: -2.5, left: -2.5, right: -2.5, bottom: -2.5, borderRadius: 5, borderWidth: 1.5, borderColor: HM_GOLD }} /> : null}
            </View>
          );
        }) : null}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, marginTop: 12 }}>{tr("heat", { days: data.active, verses: data.total })}</Text>
    </View>
  );
}

export default Heatmap;
