import { useMemo } from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { GoldProgress, SectionTitle } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero, RowGroup } from "@/components/page";
import { FONT, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { formatNumber } from "@/features/progress/format";
import { useJourneyData } from "./hooks";
import { allStats, GROUPS, type StatCtx, type StatDef } from "./stats";
import { useJT, type JKey } from "./texts";

// /journey/stats – every statistic of the registry (stats.ts): lifetime counters, personal records that can always be
// beaten, and bounded sub-goals that show their next horizon once reached. Nothing here ever reads as "finished".

export default function JourneyStatsScreen() {
  const jt = useJT();
  const { lang } = useLang();
  const { M } = useJourneyData();
  const ctx: StatCtx = { M, lang, jt };
  const rows = useMemo(() => allStats().map((d) => {
    let v = 0, of = 0;
    try { v = d.value(ctx); of = d.of?.(ctx) ?? 0; } catch { /* a provider without data shows 0 */ }
    return { d, v, of };
  }), [M, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arabic="رحلة العلم" eyebrow={jt("eyebrow")} title={jt("statsTitle")} lead={jt("statsLead")} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 28 }}>
          {GROUPS.map((g) => {
            const list = rows.filter((r) => r.d.group === g);
            if (!list.length) return null;
            return (
              <View key={g}>
                <SectionTitle title={jt(`grp_${g}` as JKey)} />
                <RowGroup>{list.map((r, i) => <StatRow key={r.d.id} d={r.d} v={r.v} of={r.of} first={i === 0} ctx={ctx} />)}</RowGroup>
              </View>
            );
          })}
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: useTheme().muted }}>{jt("statsNote")}</Text>
        </View>
      </Page>
    </>
  );
}

function StatRow({ d, v, of, first, ctx }: { d: StatDef; v: number; of: number; first: boolean; ctx: StatCtx }) {
  const t = useTheme();
  const { jt, lang } = ctx;
  const nf = (n: number) => formatNumber(n, lang);
  const unit = d.unit === "min" ? jt("unitMin", { n: nf(v) }) : d.unit === "days" ? jt("unitDays", { n: nf(v) }) : d.unit === "pts" ? jt("unitPts", { n: nf(v) }) : nf(v);
  const reached = d.kind === "bounded" && of > 0 && v >= of;
  const name = d.label(ctx);
  const sub = d.kind === "best" ? jt("kindBest") : d.kind === "total" ? jt("kindTotal") : reached ? `${jt("reached")} · ${d.next ? d.next(ctx) : jt("nx_generic")}` : `${nf(v)} / ${nf(of)}`;
  return (
    <View style={[{ paddingHorizontal: 16, paddingVertical: 13, gap: 6, backgroundColor: t.surface }, !first && { borderTopWidth: 1, borderTopColor: t.line }]} accessible accessibilityLabel={`${name}: ${d.kind === "bounded" ? sub : `${unit}, ${sub}`}`}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{name}</Text>
        {d.kind === "bounded" ? (reached ? <Icon name="checkCircle" color={t.gold} size={18} /> : <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.muted }}>{`${Math.floor((100 * v) / Math.max(1, of))} %`}</Text>)
          : <Text style={{ fontFamily: FONT.display, fontSize: 17, color: t.ink }}>{unit}</Text>}
      </View>
      {d.kind === "bounded" && !reached ? <GoldProgress value={v / Math.max(1, of)} /> : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: reached ? t.gold : t.muted }}>{sub}</Text>
    </View>
  );
}
