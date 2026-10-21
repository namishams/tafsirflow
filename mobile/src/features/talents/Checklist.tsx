import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { GoldButton } from "@/components/brand";
import { openPro } from "@/lib/pro";
import type { PostingStatus } from "./api";
import { useTT } from "./text";

// "Your path to posting": every requirement with its state and the next step (age, badge, learning level, Pro only
// when the server switches it on). The server decides; this only shows its answer (GET /api/community/posting).
export function PostingChecklist({ s, onRecord }: { s: PostingStatus; onRecord?: () => void }) {
  const t = useTheme();
  const tt = useTT();
  const rows: { ok: boolean; title: string; sub: string; action?: [string, () => void] }[] = [
    { ok: s.profile, title: tt("pathProfile"), sub: tt("pathProfileText"), action: s.profile ? undefined : [tt("createProfile"), () => router.push("/community/me" as Href)] },
    { ok: s.age.ok, title: tt("pathAge", { n: s.rules.minAge }), sub: tt("pathAgeText") },
    { ok: s.verified.ok, title: tt("pathBadge"), sub: tt("pathBadgeText"), action: s.verified.ok ? undefined : [tt("badgeMine"), () => router.push("/talents/badges" as Href)] },
    { ok: s.level.ok, title: tt("pathLevel", { n: s.level.need }), sub: tt("pathLevelText", { n: s.level.have, m: s.level.need }), action: s.level.ok ? undefined : [tt("pathLevelGo"), () => router.push("/reciter-path" as Href)] },
    ...(s.pro.required ? [{ ok: s.pro.ok, title: tt("pathPro"), sub: tt("pathProText"), action: s.pro.ok ? undefined : [tt("pathProGo"), () => openPro("general")] as [string, () => void] }] : []),
  ];
  const done = rows.filter((r) => r.ok).length;
  return (
    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: s.ok ? goldButton.line : t.line, backgroundColor: t.surface, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{tt("pathTitle")}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{done}/{rows.length}</Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: t.line, overflow: "hidden" }}>
        <View style={{ width: `${(done / rows.length) * 100}%`, height: 6, backgroundColor: goldButton.to }} />
      </View>
      {rows.map((r) => (
        <View key={r.title} accessible accessibilityLabel={`${r.title}: ${r.ok ? tt("pathDone") : tt("pathOpen")}. ${r.sub}`} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, marginTop: 1, alignItems: "center", justifyContent: "center", backgroundColor: r.ok ? goldButton.to : "transparent", borderWidth: r.ok ? 0 : 1.5, borderColor: t.line }}>
            {r.ok ? <Icon name="check" color={goldButton.text} size={14} weight={2.6} /> : null}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{r.title}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{r.sub}</Text>
            {r.action ? (
              <Pressable onPress={r.action[1]} accessibilityRole="button" style={{ minHeight: 36, justifyContent: "center", alignSelf: "flex-start" }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{r.action[0]}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ))}
      {s.ok && onRecord ? <GoldButton title={tt("newClip")} onPress={onRecord} /> : null}
    </View>
  );
}
