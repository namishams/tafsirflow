import { type ReactNode } from "react";
import { Platform, Pressable, Share, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";
import { Chip, GlassButton, GlassIconButton } from "@/components/brand";

// Buttons and small form controls of the radio in the website's style.

/** round glass button on the stage (player transport): the shared GlassIconButton */
export function RoundButton({ icon, label, onPress, size = 48, disabled, fixed }: { icon: IconName; label: string; onPress: () => void; size?: number; disabled?: boolean; fixed?: boolean }) {
  return (
    <GlassIconButton onStage label={label} onPress={onPress} size={size} disabled={disabled}>
      <Icon name={icon} color="#ffffff" size={size * 0.4} fixed={fixed} />
    </GlassIconButton>
  );
}

/** the big gold play button: the shared gold round button */
export function GoldPlay({ playing, onPress, labels, size = 64 }: { playing: boolean; onPress: () => void; labels: [string, string]; size?: number }) {
  return (
    <View accessibilityState={{ selected: playing }}>
      <GlassIconButton variant="gold" icon={playing ? "pause" : "play"} label={playing ? labels[0] : labels[1]} onPress={onPress} size={size} />
    </View>
  );
}

/** pill button on the stage: the shared glass capsule */
export function StagePill({ title, onPress, icon }: { title: string; onPress: () => void; icon?: IconName }) {
  return <GlassButton onStage compact title={title} icon={icon} onPress={onPress} style={{ alignSelf: "auto" }} />;
}

/** a row of choices (the website's <select>) as the shared glass chips: gold when chosen; on the stage or on the canvas */
export function Choices<T extends string | number>({ value, options, onChange, onStage, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; onStage?: boolean; label: string }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map(([v, l]) => <Chip key={String(v)} label={l} selected={v === value} onStage={onStage} onPress={() => onChange(v)} />)}
    </View>
  );
}

/** checkbox row (input type=checkbox + label) */
export function Check({ checked, onChange, children, label }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; label: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => onChange(!checked)} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={label}
      style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 6 }}>
      <View style={{ width: 22, height: 22, marginTop: 1, borderRadius: 5, borderWidth: 1.5, borderColor: checked ? t.accent : t.muted, backgroundColor: checked ? t.accent : "transparent", alignItems: "center", justifyContent: "center" }}>
        {checked ? <Icon name="check" color={t.dark ? t.onAccent : "#ffffff"} size={15} /> : null}
      </View>
      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{children}</Text>
    </Pressable>
  );
}

/** label above a field (text-sm text-muted) */
export function FieldLabel({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, marginBottom: 8 }}>{children}</Text>;
}

export const fmtTime = (s: number) => {
  const v = Math.max(0, Math.floor(s));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`;
};

/** back, or to a sensible page when the screen was opened directly (deep link) */
export const goBack = (fallback = "/") => (router.canGoBack() ? router.back() : router.replace(fallback as Href));

/** share sheet with a title and the website's page (iOS shows the link as a preview, Android sends the text) */
export function shareLink(title: string, url: string) {
  void Share.share(Platform.OS === "ios" ? { title, message: title, url } : { title, message: `${title}\n${url}` }).catch(() => undefined);
}
