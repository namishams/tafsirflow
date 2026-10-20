import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Icon } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { FONT, R, useTheme } from "@/lib/theme";
import { HEART } from "./SocialBar";
import { openVerse } from "./links";

/**
 * The verses you have liked, newest first (website MyLikes.tsx, /api/social/mine) as heart chips that open the verse.
 * No props. Signed out: a short note with a sign-in link. Used on /community (agent "islam") and in the profile.
 */
export function MyLikes() {
  const t = useTheme();
  const w = useWebT("community");
  const { user } = useAuth();
  const [list, setList] = useState<{ key: string }[] | null | "login">(null);

  useEffect(() => {
    let live = true;
    api<{ login?: boolean; likes?: { key: string }[] }>("/api/social/mine")
      .then((d) => { if (live) setList(d.login ? "login" : d.likes ?? []); })
      .catch(() => { if (live) setList([]); });
    return () => { live = false; };
  }, [user?.id]);

  if (list === null) return <View style={{ height: 40, borderRadius: R.md, backgroundColor: t.line, opacity: 0.4 }} />;
  if (list === "login") {
    return (
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted }}>
        {w("mineLogin")} <Text onPress={() => router.push("/sign-in")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, color: t.accent }}>{w("mineLoginCta")}</Text>
      </Text>
    );
  }
  if (list.length === 0) return <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted }}>{w("mineEmpty")}</Text>;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {list.map((x) => (
        <Pressable key={x.key} onPress={() => openVerse(x.key)} accessibilityRole="button" accessibilityLabel={`Quran ${x.key}`}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, height: 38, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? "rgba(201,64,90,0.5)" : t.line, backgroundColor: t.surface })}>
          <Icon name="heart" filled color={HEART} size={14} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, fontVariant: ["tabular-nums"] }}>{x.key}</Text>
        </Pressable>
      ))}
    </View>
  );
}
