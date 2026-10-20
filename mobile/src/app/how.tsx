import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { FONT, TONES, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { Poster, PosterGrid, gradientColors } from "@/components/brand";
import { tileFor } from "@/web/tiles";
import { APP_TILES } from "@/lib/features";
import { HeroKicker, HeroLead, HeroTitle, IslCard, IslH2, IslHero, IslamNum, Marble } from "@/features/library/art";
import { ArrowLink, GoldPill } from "@/features/library/ui";
import { IslScreen } from "@/features/library/screen";
import { SERIF, useIsl } from "@/features/library/palette";
import { openHref } from "@/features/library/links";
import { howContent } from "@/features/library/content/how";

// /how – how the Quran Masterclass is built: the path in six stages, a typical learning day and the companions on the
// way (website: src/app/[locale]/(app)/how/page.tsx). Tiles the app leaves out (APP_TILES) are left out here too.
export default function HowPage() {
  const { lang } = useLang();
  const isl = useIsl();
  const t = useTheme();
  const tr = useWebT("home2");
  const c = howContent(lang);
  // tiles the app leaves out (lib/features.ts APP_TILES) are left out here too
  const tools = c.tools.filter(([href]) => { const x = tileFor(href); return !x || APP_TILES.some((a) => a.key === x.key); }).map(([href, title, desc], i) => {
    const x = tileFor(href);
    return { href, title, desc, badge: tr(`badge_${x?.badge ?? "course"}`), ar: x?.ar ?? "علم", colors: x ? gradientColors(x.bg) : TONES[i % TONES.length] };
  });
  return (
    <IslScreen>
      <IslHero callig="الطريق" fall={460} paddingBottom={96}>
        <HeroKicker>{c.kicker}</HeroKicker>
        <HeroTitle size={38} style={{ lineHeight: 40.3 }}>{c.title}</HeroTitle>
        <HeroLead style={{ marginTop: 20 }}>{c.lead}</HeroLead>
      </IslHero>
      <Marble>
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 56 }}>
          <IslH2 size={30}>{c.stepsTitle}</IslH2>
          <View style={{ marginTop: 40, gap: 16 }}>
            <LinearGradient pointerEvents="none" colors={["transparent", isl.a("goldSoft", 0.7), isl.a("goldSoft", 0.7), "transparent"]} locations={[0, 0.08, 0.92, 1]}
              style={{ position: "absolute", top: 28, bottom: 28, left: 27, width: 1 }} />
            {c.steps.map((s) => (
              <View key={s.n} style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isl.paper, alignItems: "center", justifyContent: "center" }}>
                  <IslamNum n={s.n} size={56} fontSize={17} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <IslCard style={{ padding: 16 }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <Text style={{ fontFamily: FONT.bold, fontSize: 18, lineHeight: 24, color: isl.ink, flexShrink: 1 }}>{s.title}</Text>
                      <View style={{ borderRadius: 999, borderWidth: 1, borderColor: isl.a("goldSoft", 0.4), paddingHorizontal: 10, paddingVertical: 2 }}>
                        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: isl.gold }}>{s.time}</Text>
                      </View>
                    </View>
                    <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: isl.muted }}>{s.body}</Text>
                    <ArrowLink title={s.cta} onPress={() => openHref(s.href)} style={{ marginTop: 6 }} />
                  </IslCard>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
          <IslH2 size={30}>{c.dayTitle}</IslH2>
          <View style={{ marginTop: 32, gap: 12 }}>
            {c.day.map(([m, d], i) => (
              <IslCard key={m} style={{ padding: 20 }}>
                <Svg width={64} height={64} style={{ position: "absolute", right: -12, top: -12 }} pointerEvents="none">
                  <Defs><RadialGradient id={`day${i}`} cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor={isl.goldSoft} stopOpacity={0.35 - i * 0.07} /><Stop offset="0.7" stopColor={isl.goldSoft} stopOpacity={0} /></RadialGradient></Defs>
                  <Rect width={64} height={64} fill={`url(#day${i})`} />
                </Svg>
                <Text style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 30, color: isl.gold }}>{m}</Text>
                <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 14, lineHeight: 22.75, color: isl.muted }}>{d}</Text>
              </IslCard>
            ))}
          </View>
        </View>
      </Marble>
      <View style={{ backgroundColor: t.bg, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 64 }}>
        <IslH2 size={30}>{c.toolsTitle}</IslH2>
        <View style={{ marginTop: 24 }}>
          <PosterGrid>
            {tools.map((x) => <Poster key={x.href} title={x.title} desc={x.desc} badge={x.badge} arabic={x.ar} colors={x.colors} cta={tr("open")} onPress={() => openHref(x.href)} />)}
          </PosterGrid>
        </View>
        <GoldPill title={c.start} onPress={() => openHref("/today")} style={{ marginTop: 40, alignSelf: "center" }} />
      </View>
    </IslScreen>
  );
}
