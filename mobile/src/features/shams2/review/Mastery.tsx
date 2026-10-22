import { Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { FONT, useTheme } from "@/lib/theme";
import { useIntl } from "@/features/srs/format";
import { DIMS, type Dim, type MasteryCell, type MasterySource } from "../mastery";
import { Btn, Card } from "../ui";
import { useRv, type RvKey } from "./text";

// The mastery card of /shams/quality (Shams 3.0): six separate dimensions of the selected cell (or of all verses), each
// with its source; a dimension without data says "noch keine Daten" and how to measure it. Never mixed into one number,
// never a pronunciation score from speech recognition. The website has the same card in
// src/components/learn/shams2/review/Mastery.tsx.

/** where each dimension is measured (app routes; `s`/`v` = a verse of the selected cell) */
export function measureHref(d: Dim, s: number, v: number): string {
  switch (d) {
    case "hifz": case "links": return "/shams/wird";
    case "words": return "/shams/weak";
    case "understand": return `/shams/${s}?v=${v}`;
    case "tajweed": return `/shams/talaqqi?s=${s}&v=${v}`;
    case "similar": return "/shams/mutashabihat";
  }
}
const SRC_ORDER: MasterySource[] = ["teacher", "self", "memory", "wordCheck", "links", "quiz", "mut"];

export function MasteryCard({ cell, scope, at }: { cell: MasteryCell; scope: string; at: { s: number; v: number } }) {
  const t = useTheme();
  const rv = useRv();
  const nf = useIntl();
  return (
    <Card gold>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink, textAlign: "left" }}>{rv("mTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "left" }}>{rv("mLead")}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 0.6, color: t.gold, textAlign: "left" }}>{rv("mFor", { x: scope })}</Text>
      {DIMS.map((d) => {
        const a = cell.dims[d];
        const label = rv(`d_${d}` as RvKey);
        const src = SRC_ORDER.filter((k) => a.src[k]).map((k) => rv("srcN", { src: rv(`src_${k}` as RvKey), n: nf(a.src[k] ?? 0) })).join(" · ");
        return (
          <View key={d} style={{ gap: 5, paddingTop: 10, borderTopWidth: 1, borderTopColor: t.line }} accessible={a.pct !== null} accessibilityLabel={a.pct !== null ? `${label}: ${nf(a.pct)} %. ${src}` : undefined}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink, textAlign: "left" }}>{label}</Text>
              <Text style={{ fontFamily: FONT.display, fontSize: 17, color: a.pct === null ? t.muted : a.pct >= 90 ? t.gold : t.ink }}>{a.pct === null ? "–" : `${nf(a.pct)} %`}</Text>
            </View>
            <View style={{ height: 7, borderRadius: 4, backgroundColor: t.line, overflow: "hidden" }}>
              {a.pct !== null ? <View style={{ width: `${Math.max(2, a.pct)}%`, height: 7, borderRadius: 4, backgroundColor: a.pct >= 90 ? t.gold : t.accent }} /> : null}
            </View>
            {a.pct !== null ? (
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted, textAlign: "left" }}>{src}</Text>
            ) : (
              <View style={{ gap: 6 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{rv("noData")}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>{rv(`how_${d}` as RvKey)}</Text>
                <View style={{ alignSelf: "flex-start" }}><Btn title={rv("go")} icon="chevronRight" onPress={() => router.push(measureHref(d, at.s, at.v) as Href)} label={`${rv("go")}: ${label}`} /></View>
              </View>
            )}
          </View>
        );
      })}
    </Card>
  );
}
