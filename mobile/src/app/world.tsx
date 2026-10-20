import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { FONT, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { Corners, FactCartouche, HeroKicker, HeroLead, HeroTitle, IslCard, IslH2, IslHero, IslamNum, Marble, Mosque, starPath, useSaw } from "@/features/library/art";
import { ArrowLink, GoldPill, MoreTiles } from "@/features/library/ui";
import { IslScreen } from "@/features/library/screen";
import { SERIF, useIsl } from "@/features/library/palette";
import { useReducedMotion } from "@/features/library/motion";
import { openHref } from "@/features/library/links";
import { COUNTRIES, REGIONS, worldContent } from "@/features/library/content/world";

// /world – "Muslims around the world": share of all Muslims by region as a gilded rosette, the countries with the most
// Muslims as bars, Sunni and Shia (website: src/app/[locale]/(app)/world/page.tsx; figures: Pew Research Center).
// The website draws no map, so neither does the app.

/** the region colours of the website: rgb(var(--accent)) and rgb(var(--gold)) follow the theme, the rest are fixed */
function useRegionColor() {
  const t = useTheme();
  return (css: string) => (css === "rgb(var(--accent))" ? t.accent : css === "rgb(var(--gold))" ? t.gold : css);
}

function Donut({ lang, center }: { lang: "de" | "en"; center: string }) {
  const isl = useIsl();
  const color = useRegionColor();
  const reduce = useReducedMotion();
  const turn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const a = Animated.loop(Animated.timing(turn, { toValue: 1, duration: 90000, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [reduce, turn]);
  const r = 70, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <View style={{ width: 224, height: 224, alignItems: "center", justifyContent: "center" }} accessible accessibilityRole="image" accessibilityLabel={REGIONS.map((x) => `${x[lang]} ${x.pct}%`).join(", ")}>
      <Svg width={224} height={224} viewBox="0 0 180 180" style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={90} cy={90} r={87} fill="none" stroke={isl.goldSoft} strokeOpacity={0.5} />
        <Circle cx={90} cy={90} r={53} fill="none" stroke={isl.goldSoft} strokeOpacity={0.5} />
        {REGIONS.map((x) => {
          const len = (x.pct / 100) * c;
          const el = <Circle key={x.en} cx={90} cy={90} r={r} fill="none" stroke={color(x.color)} strokeWidth={26} strokeDasharray={`${Math.max(0, len - 1.2)} ${c - Math.max(0, len - 1.2)}`} strokeDashoffset={-off} />;
          off += len;
          return el;
        })}
      </Svg>
      <Animated.View style={{ position: "absolute", width: 94, height: 94, transform: [{ rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }}>
        <Svg width={94} height={94} viewBox="0 0 100 100"><G><Path d={starPath(50, 50, 48, 38, 16)} fill={isl.goldSoft} fillOpacity={0.1} stroke={isl.goldSoft} strokeWidth={1} /></G></Svg>
      </Animated.View>
      <Text style={{ fontFamily: FONT.display, fontSize: 17, lineHeight: 20, color: isl.gold, textAlign: "center", maxWidth: 90 }}>{center}</Text>
    </View>
  );
}

export default function WorldPage() {
  const { lang } = useLang();
  const isl = useIsl();
  const sw = useSaw();
  const color = useRegionColor();
  const theme = useTheme();
  const c = worldContent(lang);
  const max = Math.max(...COUNTRIES.map((x) => x.m));
  const nf = (n: number) => { try { return new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(n); } catch { return String(n); } };
  return (
    <IslScreen>
      <IslHero callig="الأمة" dome fall={520} paddingBottom={96}>
        <HeroKicker>{c.kicker}</HeroKicker>
        <HeroTitle size={36} style={{ lineHeight: 38 }}>{c.title}</HeroTitle>
        <HeroLead style={{ marginTop: 20 }}>{c.lead}</HeroLead>
        <View style={{ marginTop: 40, flexDirection: "row", gap: 10 }}>
          {c.stats.map(([n, l]) => <FactCartouche key={l} n={n} l={l} nSize={20} style={{ flex: 1 }} />)}
        </View>
      </IslHero>

      <Marble>
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 64 }}>
          <IslCard style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 36 }}>
            <Corners />
            <IslH2 size={24} style={{ textAlign: "center", paddingHorizontal: 16, lineHeight: 30 }}>{c.regions}</IslH2>
            <View style={{ marginTop: 24, alignItems: "center", gap: 32 }}>
              <Donut lang={lang} center={c.stats[0][0]} />
              <View style={{ alignSelf: "stretch", gap: 10 }}>
                {REGIONS.map((x, i) => (
                  <View key={x.en} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingBottom: 8, borderBottomWidth: i < REGIONS.length - 1 ? 1 : 0, borderBottomColor: isl.a("goldSoft", 0.15) }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                      <View style={{ width: 14, height: 14, borderRadius: 2, backgroundColor: color(x.color), borderWidth: 1, borderColor: isl.a("goldSoft", 0.5), transform: [{ rotate: "45deg" }] }} />
                      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, color: isl.ink }}>{x[lang]}</Text>
                    </View>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: isl.ink, fontVariant: ["tabular-nums"] }}>{nf(x.pct)} %</Text>
                  </View>
                ))}
              </View>
            </View>
          </IslCard>

          <IslH2 size={30} style={{ marginTop: 56 }}>{c.top}</IslH2>
          <View style={{ marginTop: 24, gap: 8 }}>
            {COUNTRIES.map((x, i) => {
              const ae = x.id === "ae";
              const row = (
                <>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <IslamNum n={ae ? "" : i + 1} size={32} fontSize={11} />
                      <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: isl.ink }}>{x[lang]}</Text>
                    </View>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: isl.ink, fontVariant: ["tabular-nums"] }}>
                      <Text style={{ fontFamily: FONT.bold }}>{nf(x.m)}</Text> {c.mio} · <Text style={{ color: isl.muted }}>{x.pct} %</Text>
                    </Text>
                  </View>
                  <View style={{ marginTop: 8, paddingLeft: 42, flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ flex: 1, height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: isl.a("goldSoft", 0.15) }}>
                      <View style={{ height: 8, borderRadius: 4, width: `${(x.m / max) * 100}%`, backgroundColor: isl.accent, opacity: 0.9 }} />
                    </View>
                    <View style={{ width: 80, height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: isl.a("goldSoft", 0.15) }} accessibilityLabel={c.share}>
                      <View style={{ height: 8, borderRadius: 4, width: `${x.pct}%`, backgroundColor: "#d9bf80", experimental_backgroundImage: "linear-gradient(90deg, #c9a65e, #ecd6a2)" }} />
                    </View>
                  </View>
                </>
              );
              return ae
                ? <IslCard key={x.id} highlight radius={12} style={{ padding: 12, borderColor: isl.a("goldSoft", 0.7) }}>{row}</IslCard>
                : <View key={x.id} style={{ borderRadius: 12, borderWidth: 1, borderColor: isl.a("goldSoft", 0.2), backgroundColor: isl.a("surface", 0.6), padding: 12 }}>{row}</View>;
            })}
          </View>
          <View style={{ marginTop: 12, flexDirection: "row", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><View style={{ height: 8, width: 16, borderRadius: 4, backgroundColor: isl.accent }} /><Text style={{ fontFamily: FONT.regular, fontSize: 12, color: isl.muted }}>{c.mio}</Text></View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><View style={{ height: 8, width: 16, borderRadius: 4, backgroundColor: theme.gold }} /><Text style={{ fontFamily: FONT.regular, fontSize: 12, color: isl.muted }}>{c.share}</Text></View>
          </View>
          <IslCard style={{ marginTop: 32, paddingHorizontal: 24, paddingVertical: 32, gap: 24 }}>
            <Corners />
            <Text style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 31, color: isl.a("ink", 0.85) }}>{c.uae}</Text>
            <View style={{ alignItems: "center" }}><Mosque width={220} color={isl.goldSoft} /></View>
          </IslCard>

          <View style={{ marginTop: 56 }}>
            <IslH2 size={24} style={{ lineHeight: 30 }}>{c.schools}</IslH2>
            <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: isl.a("ink", 0.75) }}>{sw(c.schoolsBody)}</Text>
            <ArrowLink title={c.schoolsLink} onPress={() => openHref("/islam/sunni-shia")} style={{ marginTop: 6 }} />
            <GoldPill title={c.learn} onPress={() => openHref("/arabic")} style={{ marginTop: 24 }} />
          </View>
          <Text style={{ marginTop: 48, fontFamily: FONT.regular, fontSize: 12, lineHeight: 19.5, color: isl.muted }}>{c.note}</Text>
        </View>
      </Marble>
      <MoreTiles keys={["islam", "salah", "arabic", "assistant"]} />
    </IslScreen>
  );
}
