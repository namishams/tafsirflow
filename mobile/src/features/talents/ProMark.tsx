import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FONT } from "@/lib/theme";

// PRO mark (owner 22.10.2026): a small, elegant gold capsule next to the name of every Pro subscriber, set from the
// server's Pro entitlement and gone when Pro ends. Same drawing as the website's ProMark.
export function ProMark({ size = 14, pro }: { size?: number; pro?: boolean | null }) {
  if (!pro) return null;
  const h = Math.round(size * 1.05);
  return (
    <View accessible accessibilityLabel="Pro" style={{ height: h, borderRadius: h / 2, overflow: "hidden", borderWidth: 0.75, borderColor: "rgba(120,90,30,0.55)" }}>
      <LinearGradient colors={["#F3E2B6", "#D9B970", "#B8924A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: "100%", paddingHorizontal: Math.round(h * 0.42), justifyContent: "center" }}>
        <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: Math.round(h * 0.6), letterSpacing: 0.8, color: "rgb(8,38,29)" }}>PRO</Text>
      </LinearGradient>
    </View>
  );
}
