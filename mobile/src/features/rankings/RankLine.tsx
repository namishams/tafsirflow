import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import { router, type Href } from "expo-router";
import { FONT, R, goldButton, stage } from "@/lib/theme";
import { useLang } from "@/i18n";
import { countryName } from "@/lib/countries";
import { rankingsApi } from "./api";
import { useRT } from "./text";

/** "#123 worldwide · #4 in Germany" on a Sijill profile; nothing unless the member joined the rankings by name */
export function RankLine({ username }: { username: string }) {
  const rt = useRT();
  const { lang } = useLang();
  const [r, setR] = useState<{ world: number | null; country: number | null; countryCode: string | null } | null>(null);
  useEffect(() => {
    let off = false;
    rankingsApi.of(username).then((d) => { if (!off) setR(d.rank); }).catch(() => undefined);
    return () => { off = true; };
  }, [username]);
  if (!r?.world) return null;
  const text = [rt("profileRank", { n: r.world }), r.country && r.countryCode ? rt("profileRankCountry", { n: r.country, c: countryName(r.countryCode, lang) }) : ""].filter(Boolean).join(" · ");
  return (
    <Pressable onPress={() => router.push("/ranking" as Href)} accessibilityRole="link" accessibilityLabel={text}
      style={{ alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: R.pill, borderWidth: 1, borderColor: goldButton.line, backgroundColor: "rgba(214,180,108,0.12)" }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{text}</Text>
    </Pressable>
  );
}
