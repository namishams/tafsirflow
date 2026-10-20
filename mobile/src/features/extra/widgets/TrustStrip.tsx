import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Icon } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { useHm } from "../art";
import { splitRich, useWebRaw } from "../rich";

// shield, mail, lock, star – the four promises of TrustStrip.tsx; every claim is backed by what the platform really does
const ICONS = [
  "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z",
  "M4 6h16v12H4zM4 7l8 6 8-6",
  "M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z",
  "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z",
];
const TrustIcon = ({ d, color, size = 18 }: { d: string; color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" /></Svg>
);

/**
 * "Your data is protected · no spam · a protected place to learn · become a confident reciter" (website TrustStrip).
 * Props: variant "grid" (four tiles with a short explanation, default), "compact" (one line each, for the account or
 * footer); dark (on the stage); details (the expandable "what we actually do" list with the privacy link).
 */
export function TrustStrip({ variant = "grid", dark = false, details = false }: { variant?: "grid" | "compact"; dark?: boolean; details?: boolean }) {
  const t = useTheme();
  const hm = useHm(t);
  const w = useWebT("trust");
  const raw = useWebRaw();
  const [open, setOpen] = useState(false);
  const items = [w("data"), w("spam"), w("space"), w("master")];
  const sub = [w("dataD"), w("spamD"), w("spaceD"), w("masterD")];
  const gold = dark ? stage.gold : hm.goldD;
  const ink = dark ? "#ffffff" : t.ink;
  const muted = dark ? "rgba(255,255,255,0.6)" : t.muted;

  const how = (details || variant === "compact") ? (
    <View style={{ marginTop: 12 }}>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: muted, textDecorationLine: "underline" }}>{w("howTitle")}</Text>
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}><Icon name="chevronDown" size={13} color={muted} /></View>
      </Pressable>
      {open ? (
        <View style={{ gap: 6, marginTop: 6 }}>
          {w("how").split("\n").map((l) => (
            <View key={l} style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: muted }}>•</Text>
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: muted }}>{l}</Text>
            </View>
          ))}
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: muted, marginTop: 4 }}>
            {splitRich(raw("trust.howMore")).map(([k, v], i) => k === "privacy"
              ? <Text key={i} onPress={() => router.push("/legal/privacy" as Href)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, color: dark ? stage.gold : t.accent, textDecorationLine: "underline" }}>{v}</Text>
              : v)}
          </Text>
        </View>
      ) : null}
    </View>
  ) : null;

  if (variant === "compact") {
    return (
      <View>
        <View style={{ gap: 9 }}>
          {items.map((it, i) => (
            <View key={it} style={{ flexDirection: "row", alignItems: "center", gap: 10 }} accessible accessibilityLabel={`${it}. ${sub[i]}`}>
              <TrustIcon d={ICONS[i]} color={gold} size={16} />
              <Text style={{ fontFamily: FONT.medium, fontSize: 13.5, color: ink }}>{it}</Text>
            </View>
          ))}
        </View>
        {how}
      </View>
    );
  }
  return (
    <View>
      <View style={{ gap: 10 }}>
        {items.map((it, i) => (
          <View key={it} accessible accessibilityLabel={`${it}. ${sub[i]}`}
            style={{ flexDirection: "row", gap: 12, borderRadius: R.sm, borderWidth: 1, padding: 12, borderColor: dark ? "rgba(255,255,255,0.1)" : t.line, backgroundColor: dark ? "rgba(255,255,255,0.03)" : t.surface }}>
            <View style={{ paddingTop: 1 }}><TrustIcon d={ICONS[i]} color={gold} size={20} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: ink }}>{it}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: muted, marginTop: 2 }}>{sub[i]}</Text>
            </View>
          </View>
        ))}
      </View>
      {how}
    </View>
  );
}

/** one-line version for forms and badges: shield + "Data protected · no spam · no ads" */
export function TrustLine({ dark = false }: { dark?: boolean }) {
  const t = useTheme();
  const w = useWebT("trust");
  const c = dark ? "rgba(255,255,255,0.7)" : t.muted;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <TrustIcon d={ICONS[0]} color={c} size={15} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: c }}>{w("short")}</Text>
    </View>
  );
}
