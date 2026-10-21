import { useState, type ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { CareNote } from "@/components/CareNote";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, useTheme, type Theme } from "@/lib/theme";
import { SOURCES, TERMS, termOf, type Review, type SourceRef } from "./sources";
import { useS2 } from "./text";
import type { Level } from "./qualityModel";

/** emerald scale for scores, gold for itqān; hairline when nothing is memorised */
export function scoreColor(t: Theme, score: number | null): string {
  if (score === null) return t.line;
  if (score >= 90) return t.dark ? "rgb(214,178,106)" : "rgb(176,138,62)";
  const a = 0.22 + (Math.max(0, score) / 90) * 0.78;
  return `rgba(${t.dark ? "58,190,146" : "6,108,78"},${a.toFixed(2)})`;
}
export const onScore = (score: number | null) => (score !== null && score >= 45 ? "#ffffff" : undefined);

export function Card({ children, style, gold }: { children: ReactNode; style?: StyleProp<ViewStyle>; gold?: boolean }) {
  const t = useTheme();
  return <View style={[{ padding: 16, borderRadius: R.card, borderWidth: 1, borderColor: gold ? "rgba(201,166,94,0.55)" : t.line, backgroundColor: t.surface, gap: 10 }, style]}>{children}</View>;
}

export function H({ children, sub }: { children: string; sub?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 27, color: t.ink, textAlign: "left" }}>{children}</Text>
      {sub ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "left" }}>{sub}</Text> : null}
    </View>
  );
}

/** Arabic term, transliteration and meaning in the reader's language (content languages: de, en, ar) */
export function Term({ id, inline }: { id: string; inline?: boolean }) {
  const t = useTheme();
  const { cl } = useS2();
  const x = termOf(id);
  const meaning = cl === "ar" ? x.arDef : cl === "de" ? x.de : x.en;
  if (inline) return <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.gold }}>{`${x.ar} · ${x.tr}`}</Text>;
  return (
    <View accessible accessibilityLabel={`${x.tr}: ${meaning}`} style={{ gap: 2 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 34, color: t.gold, writingDirection: "rtl" }}>{x.ar}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink, fontStyle: "italic" }}>{x.tr}</Text>
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "left" }}>{meaning}</Text>
    </View>
  );
}

/** the discreet source line under every explanatory text, with the scholarly review status */
export function SourceNote({ src, review, style }: { src: SourceRef[]; review?: Review; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const { s } = useS2();
  const [open, setOpen] = useState(false);
  const status = !review ? "" : review.status === "reviewed" ? s("reviewedBy", { by: review.by, at: review.at }) : "";
  return (
    <View style={[{ gap: 4 }, style]}>
    <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${s("sources")}. ${status}`} style={{ gap: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Icon name="book" size={12} color={t.muted} />
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: t.muted }}>{s("sources")}</Text>
        {status ? <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: review?.status === "reviewed" ? t.accent : t.gold }}>{`· ${status}`}</Text> : null}
        <Icon name={open ? "chevronDown" : "chevronRight"} size={11} color={t.muted} />
      </View>
      {open ? src.map((k) => <Text key={k} style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 16, color: t.muted, textAlign: "left" }}>{`– ${SOURCES[k].label}`}</Text>) : null}
    </Pressable>
    {review?.status === "draft" ? <CareNote /> : null}
    </View>
  );
}

export function LevelPill({ level }: { level: Level }) {
  const t = useTheme();
  const { s } = useS2();
  if (level === "none") return null;
  const gold = level === "itqan";
  return (
    <View style={{ paddingHorizontal: 10, height: 24, borderRadius: R.pill, justifyContent: "center", backgroundColor: gold ? "rgba(201,166,94,0.18)" : t.accentSoft, borderWidth: 1, borderColor: gold ? "rgba(201,166,94,0.6)" : "transparent" }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: gold ? t.gold : t.accent }}>{s(`lv_${level}` as never)}</Text>
    </View>
  );
}

export function Btn({ title, onPress, primary, icon, disabled, label }: { title: string; onPress: () => void; primary?: boolean; icon?: Parameters<typeof Icon>[0]["name"]; disabled?: boolean; label?: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label ?? title} accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => ({ minHeight: 40, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1, borderColor: primary ? "rgb(201,166,94)" : t.line, backgroundColor: primary ? "#d4b877" : t.surface, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 })}>
      {icon ? <Icon name={icon} size={14} color={primary ? "rgb(8,38,29)" : t.ink} /> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: primary ? "rgb(8,38,29)" : t.ink }}>{title}</Text>
    </Pressable>
  );
}

export function Glossary() {
  const t = useTheme();
  const { s } = useS2();
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{s("glossary")}</Text>
        <Icon name={open ? "chevronDown" : "chevronRight"} size={14} color={t.muted} />
      </Pressable>
      {open ? (
        <View style={{ gap: 12 }}>
          {TERMS.map((x) => <Term key={x.id} id={x.id} />)}
          <SourceNote src={["halaqa", "jazari", "nawawi", "kirmani"]} review={{ status: "draft" }} />
        </View>
      ) : null}
    </Card>
  );
}
