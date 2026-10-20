import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";
import { radius, type, useTheme } from "@/lib/theme";

// Building blocks in the style of Apple's own apps: grouped lists, one clear primary action, quiet colours.

export type IconName = { ios: SFSymbol; android: string };

export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color: string }) {
  return <SymbolView name={{ ios: name.ios, android: name.android as never, web: name.android as never }} size={size} tintColor={color} weight="regular" />;
}

/** scrolling page on the grouped background; works with large titles */
export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={[{ paddingBottom: 32 }, style]} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Section({ header, footer, children }: { header?: string; footer?: string; children: ReactNode }) {
  const t = useTheme();
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={styles.section}>
      {header ? <Text style={[type.footnote, styles.sectionHeader, { color: t.secondary }]} accessibilityRole="header">{header}</Text> : null}
      <View style={[styles.card, { backgroundColor: t.card }]}>
        {rows.map((r, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={[styles.separator, { backgroundColor: t.separator }]} /> : null}
            {r}
          </Fragment>
        ))}
      </View>
      {footer ? <Text style={[type.footnote, styles.sectionFooter, { color: t.secondary }]}>{footer}</Text> : null}
    </View>
  );
}

type Accessory = "chevron" | "check" | "lock" | "none";
export function Row({ title, subtitle, value, icon, accessory = "none", onPress, destructive, disabled, right, accessibilityLabel }: {
  title: string; subtitle?: string; value?: string; icon?: IconName; accessory?: Accessory; onPress?: () => void;
  destructive?: boolean; disabled?: boolean; right?: ReactNode; accessibilityLabel?: string;
}) {
  const t = useTheme();
  const body = (
    <View style={[styles.row, disabled && { opacity: 0.4 }]}>
      {icon ? <View style={styles.rowIcon}><Icon name={icon} color={destructive ? t.danger : t.tint} /></View> : null}
      <View style={styles.rowText}>
        <Text style={[type.body, { color: destructive ? t.danger : t.text }]}>{title}</Text>
        {subtitle ? <Text style={[type.subhead, { color: t.secondary, marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={[type.body, { color: t.secondary, marginLeft: 8 }]} numberOfLines={1}>{value}</Text> : null}
      {right}
      {accessory === "chevron" ? <View style={styles.accessory}><Icon name={{ ios: "chevron.right", android: "chevron_right" }} size={13} color={t.tertiary} /></View> : null}
      {accessory === "check" ? <View style={styles.accessory}><Icon name={{ ios: "checkmark", android: "check" }} size={16} color={t.tint} /></View> : null}
      {accessory === "lock" ? <View style={styles.accessory}><Icon name={{ ios: "lock.fill", android: "lock" }} size={14} color={t.secondary} /></View> : null}
    </View>
  );
  if (!onPress) return <View accessible accessibilityLabel={accessibilityLabel}>{body}</View>;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => pressed ? { backgroundColor: t.fill } : undefined}>
      {body}
    </Pressable>
  );
}

export function ToggleRow({ title, subtitle, value, onChange }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void }) {
  const t = useTheme();
  return <Row title={title} subtitle={subtitle} accessibilityLabel={title} right={<Switch value={value} onValueChange={onChange} trackColor={{ true: t.tint }} accessibilityLabel={title} />} />;
}

export function Field(props: TextInputProps & { label: string }) {
  const t = useTheme();
  const { label, style, ...rest } = props;
  return (
    <View style={styles.row}>
      <TextInput
        placeholder={label}
        accessibilityLabel={label}
        placeholderTextColor={t.tertiary}
        style={[type.body, { flex: 1, color: t.text, paddingVertical: 0 }, style]}
        {...rest}
      />
    </View>
  );
}

/** the one main action of a screen: full width, always the same height */
export function PrimaryButton({ title, onPress, busy, disabled }: { title: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled || busy} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }}
      style={({ pressed }) => [styles.button, { backgroundColor: t.tint, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 }]}>
      {busy ? <ActivityIndicator color={t.tintText} /> : <Text style={[type.headline, { color: t.tintText }]}>{title}</Text>}
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title}
      style={({ pressed }) => [styles.button, { backgroundColor: t.tintSoft, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 }]}>
      <Text style={[type.headline, { color: t.tint }]}>{title}</Text>
    </Pressable>
  );
}

export function Notice({ text, tone = "neutral" }: { text: string; tone?: "neutral" | "error" }) {
  const t = useTheme();
  return <Text style={[type.footnote, { color: tone === "error" ? t.danger : t.secondary, marginHorizontal: 32, marginTop: 8 }]} accessibilityLiveRegion="polite">{text}</Text>;
}

export function Loading() {
  const t = useTheme();
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.bg, padding: 32 }}><ActivityIndicator /></View>;
}

export function ErrorState({ text, retry, retryLabel }: { text: string; retry: () => void; retryLabel: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.bg, padding: 32, gap: 16 }}>
      <Text style={[type.body, { color: t.secondary, textAlign: "center" }]}>{text}</Text>
      <View style={{ alignSelf: "stretch" }}><SecondaryButton title={retryLabel} onPress={retry} /></View>
    </View>
  );
}

export const styles = StyleSheet.create({
  section: { marginTop: 24, marginHorizontal: 16 },
  sectionHeader: { textTransform: "none", marginLeft: 16, marginBottom: 7 },
  sectionFooter: { marginHorizontal: 16, marginTop: 7 },
  card: { borderRadius: radius, overflow: "hidden" },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: { minHeight: 44, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 11 },
  rowIcon: { width: 28, marginRight: 12, alignItems: "center" },
  rowText: { flex: 1 },
  accessory: { marginLeft: 8 },
  button: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
});
