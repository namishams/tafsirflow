import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FONT, R, stage } from "@/lib/theme";
import { useLang } from "@/i18n";
import { usePro } from "@/lib/pro";
import { countryName } from "@/lib/countries";
import { BadgeMark } from "@/features/talents/badges";
import { CountryBadge } from "@/features/rankings/Flag";
import { DIVISION_MARK } from "./career";
import { statsApi, type CareerStats as Stats } from "./api";
import { localStats } from "./local";
import { demoStats } from "./demo";
import { useCT, type CKey } from "./text";
import { TierEmblem } from "./TierEmblem";

// The career card at the top of every profile (owner 22.10.2026): tier emblem and name (endless Grandmaster steps),
// level, Shams method, verified tier, country flag, world and country rank, current streak, verses memorised, member
// since. Tapping it opens the full "Statistik" tab. Same data as the tab (GET /api/community/stats/<username>).
export function ProfileStrip({ username, own, local, name, demo, onOpen }: { username: string | null; own: boolean; local?: boolean; name: string; demo?: boolean; onOpen?: () => void }) {
  const ct = useCT();
  const { lang } = useLang();
  const { pro } = usePro();
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    if (__DEV__ && demo) { setS(demoStats(own)); return; }
    if (!username || local) { setS(localStats(name, username ?? "", pro)); return; }
    statsApi.of(username, lang).then((d) => setS(d.stats ?? null)).catch(() => setS(own ? localStats(name, username, pro) : null));
  }, [username, local, lang, demo]); // eslint-disable-line react-hooks/exhaustive-deps
  const nf = useMemo(() => { try { return new Intl.NumberFormat(lang); } catch { return new Intl.NumberFormat("en"); } }, [lang]);
  if (!s) return null;
  const c = s.career;
  const tierName = c ? `${ct(`tier_${c.tier}` as CKey)}${c.division ? ` ${DIVISION_MARK[c.division]}` : ""}${(c.gm ?? 0) >= 2 ? ` ${nf.format(c.gm)}` : ""}` : "";
  const method = s.sijill.level?.method;
  const vt = s.badge === "founder" ? ct("tierFounder") : s.badge === "gold" || s.badge === "official" ? ct("tierMaster") : s.badge ? ct("tierLearner") : "";
  const cells: [string, string][] = [
    [s.ranks?.xp?.rank ? `#${nf.format(s.ranks.xp.rank)}` : "–", ct("worldwide")],
    [s.ranks?.xp?.country ? `#${nf.format(s.ranks.xp.country)}` : "–", ct("countryRank")],
    [s.sijill.time ? nf.format(s.sijill.time.streak) : "–", ct("streakNow")],
    [s.sijill.memorised ? nf.format(s.sijill.memorised.verses) : "–", ct("cat_verses")],
  ];
  const chip = (key: string, body: React.ReactNode) => (
    <View key={key} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, height: 26, borderRadius: R.pill, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: stage.hair }}>{body}</View>
  );
  const ctext = (t: string) => <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.text }}>{t}</Text>;
  return (
    <Pressable onPress={onOpen} disabled={!onOpen} accessibilityRole={onOpen ? "button" : undefined} accessibilityLabel={`${ct("careerCard")}: ${tierName}. ${ct("openStats")}`}
      style={({ pressed }) => ({ marginHorizontal: 16, marginTop: 14, borderRadius: 20, overflow: "hidden", opacity: pressed ? 0.85 : 1 })}>
      <LinearGradient colors={[stage.glow, stage.bg, stage.deep]} style={{ padding: 14, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {c ? <TierEmblem tier={c.tier} division={c.division} size={62} progress={c.into} label={tierName} /> : null}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1, color: stage.gold }}>{ct("careerCard")}</Text>
            <Text numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: 21, color: stage.cream }}>{tierName || ct("hidden")}</Text>
            {c ? <Text style={{ fontFamily: FONT.medium, fontSize: 12.5, color: stage.textSoft }}>{ct("levelN", { n: nf.format(c.level.level) })}</Text> : null}
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
          {method ? chip("m", ctext(ct(`method_${method}` as CKey))) : null}
          {s.badge && vt ? chip("v", <><BadgeMark badge={s.badge} size={13} />{ctext(vt)}</>) : null}
          {s.country ? chip("c", <><CountryBadge code={s.country} size={15} />{ctext(countryName(s.country, lang))}</>) : null}
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {cells.map(([v, l]) => (
            <View key={l} style={{ flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: R.md, backgroundColor: "rgba(255,255,255,0.07)" }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: stage.cream }}>{v}</Text>
              <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 10.5, color: stage.textMuted }}>{l}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
