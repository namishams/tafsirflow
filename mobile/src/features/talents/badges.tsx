import { createContext, useContext, useState, type ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { GoldButton } from "@/components/brand";
import { useTT, type TKey } from "./text";

// The three badges of Quran Talents (granted automatically, see the website's src/lib/talentBadges.ts):
// emerald check (confirmed and complete profile), gold check "Masterclass Reciter" (Reciter Path certificate),
// official star (proven public channel or invitation). Tapping a badge explains what it means.
export type Badge = "emerald" | "gold" | "official";

const EMERALD = "#0F8A63";
const GOLD = goldButton.to;
const DEEP = "rgb(8,58,44)";

/** the badge mark; `label` for VoiceOver */
export function BadgeMark({ badge, size = 16 }: { badge: Badge; size?: number }) {
  if (badge === "official") {
    // radiant gold star on a deep emerald disc
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={12} fill={DEEP} />
        <Circle cx={12} cy={12} r={11} fill="none" stroke={GOLD} strokeWidth={1.2} />
        <Path d="M12 4.2l2.2 4.7 5.1.6-3.8 3.5 1 5.1L12 15.6l-4.5 2.5 1-5.1-3.8-3.5 5.1-.6z" fill="#F3E2B6" stroke={GOLD} strokeWidth={0.8} strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={12} fill={badge === "gold" ? GOLD : EMERALD} />
      <Path d="M7 12.4l3.2 3.2L17.2 8.6" fill="none" stroke={badge === "gold" ? goldButton.text : "#FFFFFF"} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const Ctx = createContext<(b: Badge) => void>(() => undefined);

/** wrap a screen once; every Badge inside opens the explanation sheet */
export function BadgeSheetHost({ children }: { children: ReactNode }) {
  const t = useTheme();
  const tt = useTT();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<Badge | null>(null);
  const rows: Badge[] = ["emerald", "gold", "official"];
  return (
    <Ctx.Provider value={setOpen}>
      {children}
      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable onPress={() => setOpen(null)} accessibilityRole="button" accessibilityLabel={tt("done")} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
          <Pressable onPress={() => undefined} style={{ backgroundColor: t.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20, paddingBottom: insets.bottom + 20, gap: 14 }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{tt("badgeWhat")}</Text>
            {rows.map((b) => (
              <View key={b} style={{ flexDirection: "row", gap: 12, padding: 12, borderRadius: R.lg, borderWidth: 1, borderColor: open === b ? goldButton.line : t.line, backgroundColor: open === b ? "rgba(201,166,94,0.08)" : t.surface }}>
                <BadgeMark badge={b} size={26} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{tt(`badge_${b}` as TKey)}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted }}>{tt(`badge_${b}_text` as TKey)}</Text>
                </View>
              </View>
            ))}
            <GoldButton title={tt("badgeMine")} onPress={() => { setOpen(null); router.push("/talents/badges" as Href); }} />
          </Pressable>
        </Pressable>
      </Modal>
    </Ctx.Provider>
  );
}

/** a badge that explains itself when tapped (inside BadgeSheetHost) */
export function BadgeButton({ badge, size = 16 }: { badge: Badge | null | undefined; size?: number }) {
  const tt = useTT();
  const open = useContext(Ctx);
  if (!badge) return null;
  return (
    <Pressable onPress={() => open(badge)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${tt(`badge_${badge}` as TKey)}. ${tt("badgeWhat")}`}>
      <BadgeMark badge={badge} size={size} />
    </Pressable>
  );
}
