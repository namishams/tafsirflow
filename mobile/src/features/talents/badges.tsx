import { createContext, useContext, useState, type ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { GoldButton } from "@/components/brand";
import { useTT, type TKey } from "./text";
import { ARABESQUE, BADGE_STYLE, CHECK, CHECK_FOUNDER, CROWN, KHATAM, KHATAM_INNER } from "./badgeShape";

// The badges of Quran Talents (granted automatically, see the website's src/lib/talentBadges.ts): "emerald" = confirmed
// and complete profile, "gold" = Masterclass Reciter (Reciter Path certificate, the top tier), official star (proven
// public channel or invitation) and "founder" (exactly one account, set on the server). Colours (owner 22.10.2026, the
// same on the website's BadgeIcon): founder gold, Masterclass Reciter grey, confirmed learners blue, official star as
// before. The stored values keep their names. Tapping a badge explains what it means.
// "star" (owner 22.10.2026): a well-known reciter who took over his star profile; emerald disc, light ring, white tick.
export type Badge = "emerald" | "gold" | "official" | "founder" | "star";

export { BADGE_COLORS } from "./badgeShape";

/** the badge mark (khatam with arabesque ring and check, shared path data in ./badgeShape.ts, same as the website) */
export function BadgeMark({ badge, size = 16 }: { badge: Badge; size?: number }) {
  const s = BADGE_STYLE[badge];
  const fine = size < 18 ? 0.9 : 0.6;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {s.doubleRing ? <Circle cx={12} cy={12} r={11.4} fill="none" stroke={s.doubleRing} strokeWidth={0.8} /> : null}
      <Path d={KHATAM} fill={s.fill} stroke={s.edge} strokeWidth={1} strokeLinejoin="round" />
      {size >= 18 ? <Path d={KHATAM_INNER} fill="none" stroke={s.inner} strokeWidth={0.5} /> : null}
      <Path d={ARABESQUE} fill="none" stroke={s.ring} strokeWidth={fine} opacity={0.85} />
      {s.crown ? <Path d={CROWN} fill={s.crown} /> : null}
      <Path d={s.crown ? CHECK_FOUNDER : CHECK} fill="none" stroke={s.check} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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
  const rows: Badge[] = open === "founder" ? ["founder", "official", "gold", "emerald"] : open === "star" ? ["star", "official", "gold", "emerald"] : ["official", "gold", "emerald"];
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
