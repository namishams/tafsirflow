import { Text, View } from "react-native";
import { FONT } from "@/lib/theme";

// A country as a badge: its two-letter code on a calm emerald or gold disc (no emoji flags, the same on every device)
const TONES: [string, string][] = [["#0b3d2e", "#e9cf99"], ["#10382c", "#d6b46c"], ["#1d6b52", "#f6ecd0"], ["#3d2a0b", "#e9cf99"], ["#1f473b", "#d9c28a"], ["#473614", "#f1e2b4"]];
export function CountryBadge({ code, size = 34 }: { code: string | null; size?: number }) {
  const c = (code ?? "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return <View style={{ width: size, height: size }} />;
  const [bg, fg] = TONES[(c.charCodeAt(0) * 31 + c.charCodeAt(1)) % TONES.length];
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderWidth: 1, borderColor: "rgba(214,180,108,0.65)", alignItems: "center", justifyContent: "center" }}>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: Math.round(size * 0.34), letterSpacing: 0.4, color: fg }}>{c}</Text>
    </View>
  );
}
