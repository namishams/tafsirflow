import { Children, type ReactNode } from "react";
import { Pressable, Text, View, useWindowDimensions, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { ProBadge } from "@/components/page";
import { GoldButton } from "@/components/brand";
import { openPro } from "@/lib/pro";
import { useT } from "@/i18n";

// Small building blocks shared by the progress screens, in the website's classes.

/** columns like the website's responsive grid: 1 below 640 px, `sm` from 640, `lg` from 1024 */
export function useCols(base: number, sm = base, lg = sm) {
  const { width } = useWindowDimensions();
  return width >= 1024 ? lg : width >= 640 ? sm : base;
}

/** lays children out in rows of `cols`, each cell the same width */
export function Grid({ cols, gap = 12, rowGap, children, style }: { cols: number; gap?: number; rowGap?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const rows: ReactNode[][] = [];
  Children.toArray(children).forEach((c, i) => { if (i % cols === 0) rows.push([]); rows[rows.length - 1].push(c); });
  return (
    <View style={[{ gap: rowGap ?? gap }, style]}>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: "row", gap }}>
          {r.map((c, j) => <View key={j} style={{ flex: 1, minWidth: 0 }}>{c}</View>)}
          {Array.from({ length: cols - r.length }, (_, j) => <View key={`f${j}`} style={{ flex: 1 }} />)}
        </View>
      ))}
    </View>
  );
}

/** h2.font-display in the website's section size (text-3xl on phones) */
export function H2({ children, onStage, size = 30, style }: { children: ReactNode; onStage?: boolean; size?: number; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text accessibilityRole="header" style={[{ fontFamily: FONT.display, fontSize: size, lineHeight: size * 1.1, letterSpacing: -size * 0.02, color: onStage ? "#eef0f3" : t.ink }, style]}>{children}</Text>;
}

/** small uppercase gold label (text-[11px] font-semibold uppercase tracking-[0.14em] text-gold) */
export function Kicker({ children, color, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ fontFamily: FONT.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.5, textTransform: "uppercase", color: color ?? t.gold }, style]}>{children}</Text>;
}

/** rounded-lg border border-line bg-surface p-5 */
export function Card({ children, style, onPress, label }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string }) {
  const t = useTheme();
  const base: StyleProp<ViewStyle> = [{ borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 20 }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [base, pressed && { borderColor: "rgba(201,166,94,0.5)" }]}>{children}</Pressable>;
}

/** the website's segmented control: rounded-md border p-1, the active option on ink (white on the stage) */
export function InkSegmented<T extends string | number>({ value, options, onChange, dark, stretch, locked }: {
  value: T; options: [T, string][]; onChange: (v: T) => void; dark?: boolean; stretch?: boolean; locked?: T[];
}) {
  const t = useTheme();
  return (
    <View accessibilityRole="tablist" style={[{ flexDirection: "row", flexWrap: "wrap", padding: 4, gap: 2, borderRadius: R.sm, borderWidth: 1, borderColor: dark ? "rgba(255,255,255,0.15)" : t.line, backgroundColor: dark ? "rgba(255,255,255,0.05)" : t.surface }, stretch ? null : { alignSelf: "flex-start" }]}>
      {options.map(([v, label]) => {
        const on = v === value;
        const lock = locked?.includes(v);
        return (
          <Pressable key={String(v)} onPress={() => onChange(v)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={lock ? `${label}, Pro` : label} hitSlop={4}
            style={[{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 4, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: on ? (dark ? "#ffffff" : t.ink) : "transparent" }, stretch && { flex: 1 }]}>
            {lock ? <Icon name="lock" size={12} color={on ? (dark ? "rgb(8,38,29)" : t.bg) : t.gold} /> : null}
            <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, color: on ? (dark ? "rgb(8,38,29)" : t.bg) : dark ? "rgba(255,255,255,0.6)" : t.muted }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** a statistics section that belongs to Pro: the title stays visible with a lock, the content is a quiet preview */
export function ProLock({ title, onStage, height = 120, style }: { title: string; onStage?: boolean; height?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const tr = useT();
  const bar = onStage ? "rgba(255,255,255,0.12)" : t.line;
  return (
    <View style={[{ borderRadius: R.md, borderWidth: 1, borderColor: onStage ? "rgba(255,255,255,0.1)" : t.line, backgroundColor: onStage ? "rgba(255,255,255,0.04)" : t.surface, padding: 20 }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 14, color: onStage ? "#eef0f3" : t.ink }}>{title}</Text>
        <ProBadge onStage={onStage} />
      </View>
      <View style={{ height, flexDirection: "row", alignItems: "flex-end", gap: 4, marginTop: 16, opacity: 0.6 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {[0.35, 0.6, 0.45, 0.8, 0.5, 0.7, 0.3, 0.55, 0.9, 0.4, 0.65, 0.5].map((h, i) => <View key={i} style={{ flex: 1, height: `${h * 100}%`, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: bar }} />)}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: onStage ? "rgba(255,255,255,0.65)" : t.muted, marginTop: 14 }}>{tr("pro.why_stats")}</Text>
      <GoldButton compact title={tr("pro.cta")} onPress={() => openPro("stats")} style={{ marginTop: 12 }} />
    </View>
  );
}

/** bordered tile on the stage: rounded-lg border-white/10 bg-white/[0.04] */
export function StageBox({ children, style, onPress, label }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string }) {
  const base: StyleProp<ViewStyle> = [{ borderRadius: R.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)", padding: 16 }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [base, pressed && { borderColor: "rgba(255,255,255,0.3)" }]}>{children}</Pressable>;
}

/** inline link in the accent colour with an arrow (ArrowNext) */
export function ArrowLink({ title, onPress, color, size = 14, style }: { title: string; onPress: () => void; color?: string; size?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const c = color ?? t.accent;
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={title} hitSlop={8} style={[{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start" }, style]}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: size, color: c }}>{title}</Text>
      <Icon name="chevronRight" size={size} color={c} />
    </Pressable>
  );
}

/** a statistic: big number over a small label, with a hairline at its start (dl > div.border-s) */
export function HairStat({ value, label, onStage = true, size = 30 }: { value: string; label: string; onStage?: boolean; size?: number }) {
  const t = useTheme();
  return (
    <View style={{ borderStartWidth: 1, borderStartColor: onStage ? "rgba(255,255,255,0.15)" : t.line, paddingStart: 12 }} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={{ fontFamily: FONT.display, fontSize: size, lineHeight: size * 1.15, color: onStage ? stage.gold : t.gold }}>{value}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 16, color: onStage ? "rgba(255,255,255,0.6)" : t.muted, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

/** btn-gold as a pill or a block that may wrap onto two lines (long texts like "Next: An-Naba, from verse 12") */
export function GoldPill({ title, onPress, arrow = true, pill = true, block, disabled, style }: { title: string; onPress: () => void; arrow?: boolean; pill?: boolean; block?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [{ alignSelf: block ? "stretch" : "flex-start", opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }, style]}>
      <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ minHeight: 44, borderRadius: pill ? R.pill : R.sm, paddingHorizontal: 20, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 14, lineHeight: 19, color: goldButton.text, textAlign: "center", flexShrink: 1 }}>{title}</Text>
        {arrow ? <Icon name="chevronRight" size={14} color={goldButton.text} /> : null}
      </LinearGradient>
    </Pressable>
  );
}

/** quiet outline button (border-line / border-white/25 on the stage), may wrap */
export function OutlinePill({ title, onPress, onStage, block, active, style }: { title: string; onPress: () => void; onStage?: boolean; block?: boolean; active?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: active }}
      style={({ pressed }) => [{ minHeight: 40, borderRadius: R.sm, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center", justifyContent: "center", alignSelf: block ? "stretch" : "flex-start",
        borderColor: active ? "rgba(214,180,108,0.6)" : onStage ? (pressed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)") : pressed ? t.ink : t.line, backgroundColor: onStage ? "transparent" : t.surface }, style]}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 19, textAlign: "center", color: onStage ? "#eef0f3" : t.ink }}>{title}</Text>
    </Pressable>
  );
}
