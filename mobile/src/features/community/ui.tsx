import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { ApiError } from "@/lib/api";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { useCT, type CKey } from "./text";

export type Profile = {
  username: string; name: string; bio: string; country: string | null; role: "learner" | "reciter" | "teacher"; style: string; ijaza: boolean;
  public: boolean; followers: number; following: number; followed?: boolean; mine?: boolean; blocked?: boolean;
};

export const initials = (n: string) => (n.trim().split(/\s+/).slice(0, 2).map((w) => Array.from(w)[0] ?? "").join("") || "?").toUpperCase();

export function Avatar({ name, size = 52 }: { name: string; size?: number }) {
  const t = useTheme();
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.accentSoft, borderWidth: 2, borderColor: goldButton.line, alignItems: "center", justifyContent: "center" }}>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: size * 0.36, color: t.accent }}>{initials(name)}</Text>
    </View>
  );
}

export function RoleBadge({ role }: { role: Profile["role"] }) {
  const t = useTheme();
  const c = useCT();
  if (role === "learner") return null;
  return (
    <View style={{ alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: t.accentSoft }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.accent }}>{c(role)}</Text>
    </View>
  );
}

export function FollowButton({ followed, busy, onPress, name }: { followed: boolean; busy?: boolean; onPress: () => void; name: string }) {
  const t = useTheme();
  const c = useCT();
  return (
    <Pressable onPress={onPress} disabled={busy} accessibilityRole="button" accessibilityState={{ selected: followed, busy: !!busy }} accessibilityLabel={`${followed ? c("following") : c("follow")}, ${name}`}
      style={({ pressed }) => ({ minHeight: 40, minWidth: 96, paddingHorizontal: 16, borderRadius: R.md, alignItems: "center", justifyContent: "center", opacity: busy || pressed ? 0.7 : 1,
        backgroundColor: followed ? "transparent" : goldButton.to, borderWidth: 1, borderColor: followed ? t.line : goldButton.line })}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: followed ? t.ink : goldButton.text }}>{followed ? c("following") : c("follow")}</Text>
    </Pressable>
  );
}

export function errText(e: unknown, c: ReturnType<typeof useCT>): string {
  if (e instanceof ApiError) {
    if (e.code === "age") return c("ageErr");
    if (e.code === "profile_required") return c("needProfile");
    const k = `e_${e.code}` as CKey;
    try { const s = c(k); if (s) return s; } catch { /* fall through */ }
  }
  return c("e_generic");
}

/** entry card for Discover and Today */
export function CommunityCard() {
  const t = useTheme();
  const c = useCT();
  return (
    <Pressable onPress={() => router.push("/community/people" as Href)} accessibilityRole="button" accessibilityLabel={`${c("card")}. ${c("cardText")}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: R.lg ?? R.md, borderWidth: 1, borderColor: t.line, backgroundColor: pressed ? t.bg : t.surface })}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.accentSoft, alignItems: "center", justifyContent: "center" }}><Icon name="user" color={t.accent} size={22} /></View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{c("card")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, marginTop: 2 }}>{c("cardText")}</Text>
      </View>
      <Icon name="chevronRight" color={t.muted} size={16} />
    </Pressable>
  );
}
