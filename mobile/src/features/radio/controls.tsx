import { type ReactNode } from "react";
import { Platform, Pressable, Share, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";

// Buttons and small form controls of the radio in the website's style.

/** round button on the stage: hairline ring, white icon (h-12 w-12 rounded-full border-white/20) */
export function RoundButton({ icon, label, onPress, size = 48, disabled, fixed }: { icon: IconName; label: string; onPress: () => void; size?: number; disabled?: boolean; fixed?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: pressed ? "#ffffff" : "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1 })}>
      <Icon name={icon} color="#ffffff" size={size * 0.4} fixed={fixed} />
    </Pressable>
  );
}

/** the big gold play button (h-16 w-16 rounded-full bg-gold) */
export function GoldPlay({ playing, onPress, labels, size = 64 }: { playing: boolean; onPress: () => void; labels: [string, string]; size?: number }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={playing ? labels[0] : labels[1]} accessibilityState={{ selected: playing }}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }], width: size, height: size, borderRadius: size / 2, backgroundColor: stage.gold, shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } })}>
      <LinearGradient colors={["#e6cd92", stage.gold]} style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}>
        <Icon name={playing ? "pause" : "play"} color={goldButton.text} size={size * 0.4} />
      </LinearGradient>
    </Pressable>
  );
}

/** pill button on the stage (h-12 rounded-full border-white/30 px-5 text-sm font-bold) */
export function StagePill({ title, onPress, icon }: { title: string; onPress: () => void; icon?: IconName }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}
      style={({ pressed }) => ({ height: 48, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? "#ffffff" : "rgba(255,255,255,0.32)", paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 6 })}>
      {icon ? <Icon name={icon} color="#ffffff" size={16} /> : null}
      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: "#ffffff" }}>{title}</Text>
    </Pressable>
  );
}

/** a row of choices (the website's <select>), as gold-ringed pills; on the stage or on the canvas */
export function Choices<T extends string | number>({ value, options, onChange, onStage, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; onStage?: boolean; label: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map(([v, l]) => {
        const on = v === value;
        if (on) {
          return (
            <Pressable key={String(v)} onPress={() => onChange(v)} accessibilityRole="radio" accessibilityState={{ checked: true }} accessibilityLabel={l}>
              <LinearGradient colors={onStage ? [goldButton.from, goldButton.to] : ["rgb(13,68,52)", "rgb(6,36,27)"]}
                style={{ height: 38, paddingHorizontal: 14, borderRadius: R.pill, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: onStage ? goldButton.line : "rgba(214,180,108,0.5)" }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: onStage ? goldButton.text : "#f3e2b6" }}>{l}</Text>
              </LinearGradient>
            </Pressable>
          );
        }
        return (
          <Pressable key={String(v)} onPress={() => onChange(v)} accessibilityRole="radio" accessibilityState={{ checked: false }} accessibilityLabel={l}
            style={({ pressed }) => ({ height: 38, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1, alignItems: "center", justifyContent: "center",
              borderColor: onStage ? (pressed ? "#ffffff" : "rgba(255,255,255,0.2)") : pressed ? goldButton.line : "rgba(201,166,94,0.4)",
              backgroundColor: onStage ? "rgba(255,255,255,0.04)" : t.surface })}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: onStage ? "rgba(255,255,255,0.82)" : t.ink }}>{l}</Text>
          </Pressable>
        );
      })}
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
