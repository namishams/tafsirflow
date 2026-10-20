import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { FONT, useTheme } from "@/lib/theme";
import { useWebT } from "@/i18n/web";
import { readJSON } from "@/lib/store";
import { today } from "@/web/learning";
import { HM_GOLD, Rosette } from "./art";
import { HmCard } from "./ProgressPanel";
import { Heatmap } from "./Heatmap";
import { MemoryMap } from "./MemoryMap";
import { useLive } from "./hooks";
import { go } from "./links";
import { ArrowLink } from "./ui";

// The two progress cards of the website's Today dashboard (TodayDashboard.tsx), ready to embed on the Today tab.

function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
        <Rosette size={20} color={HM_GOLD} />
        <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, flexShrink: 1 }}>{children}</Text>
      </View>
      {right}
    </View>
  );
}

/** "Your week": verses practised in the last 7 days and the 12-week heatmap */
export function WeekCard() {
  const t = useTheme();
  const tr = useWebT("today");
  const week = useLive(() => { const days = readJSON<Record<string, number>>("tf:days", {}); const d = today(); let n = 0; for (let i = d - 6; i <= d; i++) n += Number(days[String(i)] ?? 0); return n; });
  return (
    <HmCard>
      <CardTitle>{tr("weekTitle")}</CardTitle>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 4, marginBottom: 12 }}>{tr("weekHint", { n: week })}</Text>
      <Heatmap />
    </HmCard>
  );
}

/** "Your Quran map": the compact map with a link to /map */
export function MapCard() {
  const tr = useWebT("map");
  return (
    <HmCard>
      <CardTitle right={<ArrowLink title={tr("todayLink")} onPress={() => go("/map")} size={13} />}>{tr("todayTitle")}</CardTitle>
      <View style={{ marginTop: 12 }}><MemoryMap compact /></View>
    </HmCard>
  );
}
