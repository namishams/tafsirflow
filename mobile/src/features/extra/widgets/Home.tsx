import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { Display, GoldButton, OutlineButton, Poster, PosterGrid, Stage, gradientColors } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import { useAuth } from "@/lib/auth";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { HOME_TILES, TILES } from "@/web/tiles";
import { Arch, GOLD, GOLD_L, HmCard, HomeStar, IllumFrame, QuranQuote, StarGlyph, WarmSection, alpha, useHm, useVerseText } from "../art";
import { KidsToggle } from "../KidsToggle";
import { appHref } from "../links";
import { useReducedMotionX } from "../motion";
import { CountUp } from "./Signature";
import { COURSES_AR, GLOSSARY_AR, METHOD, PATHS, POPULAR } from "./homeData";

// The sections of the website's home page (src/app/[locale]/page.tsx) as native widgets. Each one is self-contained
// (own padding and background) so they can be placed on the Today and Masterclass tabs or stacked on /welcome.
// Quran verses quoted in them are loaded from the server by reference (QuranQuote), never typed.

const go = (webPath: string) => router.push(appHref(webPath) as Href);
const H2 = ({ children, onStage }: { children: string; onStage?: boolean }) => {
  const t = useTheme();
  return <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.7, color: onStage ? "#ffffff" : t.ink }}>{children}</Text>;
};
const Lead = ({ children, onStage }: { children: string; onStage?: boolean }) => {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: onStage ? "rgba(255,255,255,0.7)" : t.muted, marginTop: 12 }}>{children}</Text>;
};
const Callig = ({ children, size = 30, color }: { children: string; size?: number; color: string }) => (
  <Text allowFontScaling={false} accessibilityElementsHidden importantForAccessibility="no" style={{ fontFamily: CALLIG_FONT, fontSize: size, lineHeight: size * 1.6, color, writingDirection: "rtl" }}>{children}</Text>
);

/** 1 Hero: basmala, title, lead, two buttons, the numbers and the verse card whose words light up one after another */
export function HomeHero({ topInset = 0 }: { topInset?: number }) {
  const w = useWebT("home2");
  const basmala = useVerseText("1:1");
  const reduced = useReducedMotionX();
  const words = basmala ? basmala.split(/\s+/) : [];
  const [lit, setLit] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced || !words.length) return;
    const id = setInterval(() => setLit((i) => (i + 1) % words.length), 1500);
    const loop = Animated.loop(Animated.timing(progress, { toValue: 1, duration: 1500 * words.length, useNativeDriver: false }));
    loop.start();
    return () => { clearInterval(id); loop.stop(); };
  }, [reduced, words.length, progress]);
  return (
    <Stage hairlines={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: topInset + 36, paddingBottom: 40 }}>
        {basmala ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: stage.gold, writingDirection: "rtl", textAlign: "left" }}>{basmala}</Text> : <View style={{ height: 44 }} />}
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", color: stage.gold, marginTop: 14 }}>Quran Masterclass</Text>
        <Display onStage style={{ fontSize: 40, lineHeight: 42, marginTop: 14 }}>{w("heroTitle")}</Display>
        <Lead onStage>{w("heroLead")}</Lead>
        <View style={{ gap: 12, marginTop: 26 }}>
          <GoldButton title={w("heroCta")} onPress={() => go("/academy")} />
          <OutlineButton title={w("heroCta2")} onStage onPress={() => go("/shams")} />
        </View>
        <View style={{ flexDirection: "row", marginTop: 26, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(214,180,108,0.15)" }}>
          {([[114, "statSurahs"], [6236, "statVerses"]] as [number, string][]).map(([v, k], i) => (
            <View key={k} style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, borderLeftWidth: i ? 1 : 0, borderLeftColor: "rgba(214,180,108,0.15)" }}>
              <CountUp to={v} style={{ fontFamily: FONT.display, fontSize: 24, color: "#ffffff" }} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}><StarGlyph size={8} color={stage.gold} /><Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{w(k)}</Text></View>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 28, borderRadius: R.card, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(214,180,108,0.2)", padding: 22 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <IllumFrame />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Al-Fatihah · 1</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Mishary Alafasy</Text>
          </View>
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 34, lineHeight: 66, color: "#ffffff", writingDirection: "rtl", textAlign: "right", marginTop: 12 }}>
            {words.map((wd, i) => <Text key={i} style={i === lit && !reduced ? { color: stage.gold } : null}>{wd}{i < words.length - 1 ? " " : ""}</Text>)}
          </Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{w("heroVerse")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(214,180,108,0.2)" }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: stage.gold, alignItems: "center", justifyContent: "center" }}><Icon name="pause" size={16} color={stage.bg} /></View>
            <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
              <Animated.View style={{ height: 4, borderRadius: 2, backgroundColor: stage.gold, width: reduced ? "40%" : progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }} />
            </View>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.5)", fontVariant: ["tabular-nums"] }}>0:06</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {["chipWords", "chipTafsir", "chipHide", "chipRepeat"].map((k) => (
              <Text key={k} style={{ fontFamily: FONT.semibold, fontSize: 11, color: "rgba(255,255,255,0.75)", borderWidth: 1, borderColor: "rgba(214,180,108,0.25)", borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4, overflow: "hidden" }}>{w(k)}</Text>
            ))}
          </View>
        </View>
      </View>
    </Stage>
  );
}

/** 1b Courses and tools: the poster catalogue on the stage (HOME_TILES), link to the Academy */
export function HomeCourses() {
  const w = useWebT();
  return (
    <Stage hairlines={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 36 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
          <View style={{ flex: 1 }}>
            <Callig size={26} color={GOLD_L}>{COURSES_AR}</Callig>
            <H2 onStage>{w("home2.coursesTitle")}</H2>
          </View>
          <Text onPress={() => go("/academy")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold, paddingBottom: 4 }}>{w("home2.coursesAll")}</Text>
        </View>
        <PosterGrid>
          {HOME_TILES.map((k) => TILES[k]).filter(Boolean).map((tile) => (
            <Poster key={tile.key} title={w(`nav.${tile.key}`)} desc={w(`home2.${tile.desc}`)} badge={w(`home2.badge_${tile.badge}`)} arabic={tile.ar}
              colors={gradientColors(tile.bg)} cta={w("home2.open")} onPress={() => go(tile.href)} />
          ))}
        </PosterGrid>
      </View>
    </Stage>
  );
}

/** 3 Why: "a Quran learning platform for memorizing, understanding and reciting", verse 17:9 */
export function HomeWhy() {
  const w = useWebT("landing");
  const t = useTheme();
  const hm = useHm(t);
  return (
    <WarmSection>
      <View style={{ paddingHorizontal: 20, paddingVertical: 44 }}>
        <H2>{w("whyTitle")}</H2>
        <View style={{ marginTop: 18 }}><QuranQuote verseKey="17:9" size={22} color={hm.goldD} center={false} /></View>
        <View style={{ gap: 14, marginTop: 18, borderLeftWidth: 1, borderLeftColor: alpha(GOLD, 0.3), paddingLeft: 16 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.muted }}>{w("whyP1")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.muted }}>{w("whyP2")}</Text>
        </View>
      </View>
    </WarmSection>
  );
}

/** 4 Three paths (Hifz, Fahm, Tilawa) in mihrab arches */
export function HomePaths() {
  const t = useTheme();
  const hm = useHm(t);
  const w = useWebT("home2");
  return (
    <View style={{ paddingHorizontal: 20, paddingVertical: 44 }}>
      <H2>{w("pathsTitle")}</H2>
      <Lead>{w("pathsIntro")}</Lead>
      <View style={{ gap: 36, marginTop: 40 }}>
        {PATHS.map(([k, href, word]) => (
          <Arch key={k}>
            <View style={{ paddingHorizontal: 24, paddingBottom: 28, marginTop: -36, alignItems: "center" }}>
              <Callig size={38} color={hm.goldD}>{word}</Callig>
              <Text style={{ fontFamily: FONT.display, fontSize: 25, letterSpacing: -0.5, color: t.ink, textAlign: "center" }}>{w(`${k}T`)}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, textAlign: "center", marginTop: 10 }}>{w(`${k}D`)}</Text>
              <OutlineButton title={w(`${k}Cta`)} compact onPress={() => go(href)} style={{ alignSelf: "center", marginTop: 18, borderColor: alpha(GOLD, 0.6) }} />
            </View>
          </Arch>
        ))}
      </View>
    </View>
  );
}

/** 5 The method: Sabaq, Sabqi, Manzil */
export function HomeMethod() {
  const t = useTheme();
  const hm = useHm(t);
  const w = useWebT();
  return (
    <WarmSection>
      <View style={{ paddingHorizontal: 20, paddingVertical: 44 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.9, textTransform: "uppercase", color: t.muted, marginBottom: 10 }}>{w("landing.howTitle")}</Text>
        <H2>{w("home2.methodTitle")}</H2>
        <Lead>{w("home2.methodIntro")}</Lead>
        <View style={{ gap: 30, marginTop: 34 }}>
          {METHOD.map(([k, num, word]) => (
            <View key={k} style={{ alignItems: "center" }}>
              <HomeStar size={58} tone="gold">{num}</HomeStar>
              <View style={{ marginTop: 8 }}><Callig size={28} color={hm.goldD}>{word}</Callig></View>
              <Text style={{ fontFamily: FONT.display, fontSize: 23, letterSpacing: -0.4, color: t.ink, textAlign: "center" }}>{w(`home2.${k}T`)}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, textAlign: "center", marginTop: 6, maxWidth: 340 }}>{w(`home2.${k}D`)}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 34, borderRadius: R.md, borderWidth: 1, borderColor: alpha(GOLD, 0.35), backgroundColor: alpha(GOLD, 0.07), padding: 18 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.ink }}>{w("home2.methodOutro")}</Text>
        </View>
      </View>
    </WarmSection>
  );
}

/** 7 Everything in one place: the website's numbered features (without "{n} languages": the app speaks German and English) */
export function HomeFeatures() {
  const t = useTheme();
  const w = useWebT();
  const keys = ["f1", "f2", "f3", "f4", "f5", "f7", "f8", "f9"];
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 44 }}>
      <View style={{ paddingHorizontal: 4 }}><H2>{w("home2.featTitle")}</H2></View>
      <View style={{ gap: 10, marginTop: 24 }}>
        {keys.map((k, i) => {
          const ns = Number(k.slice(1)) <= 6 ? "landing" : "home2";
          return (
            <HmCard key={k} corners={false} style={{ padding: 18 }}>
              <View style={{ flexDirection: "row", gap: 16 }}>
                <HomeStar size={44}>{String(i + 1).padStart(2, "0")}</HomeStar>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{w(`${ns}.${k}t`)}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted, marginTop: 4 }}>{w(`${ns}.${k}d`)}</Text>
                </View>
              </View>
            </HmCard>
          );
        })}
      </View>
    </View>
  );
}

/** 8 Map teaser: a panel of 114 glazed tiles on the stage (illustration: the short surahs learned first) */
export function HomeMapTeaser() {
  const w = useWebT("home2");
  const cells = Array.from({ length: 114 }, (_, i) => (i >= 100 ? 3 : i >= 92 ? (i % 3 ? 3 : 2) : i >= 84 ? (i % 4 === 0 ? 1 : 2) : i < 2 ? 3 : i === 66 || i === 35 ? 2 : 0));
  const bg = ["rgba(255,255,255,0.08)", "rgba(190,98,76,0.85)", "rgba(214,180,108,0.85)", "rgba(58,190,146,0.85)"];
  const [w0, setW] = useState(0);
  const cw = w0 ? Math.floor(((w0 - 12 - 18 * 3) / 19) * 100) / 100 : 0; // 19 columns × 6 rows like the website
  return (
    <Stage hairlines={false}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 44 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{w("mapSoon")}</Text>
        <View style={{ marginTop: 10 }}><H2 onStage>{w("mapTitle")}</H2></View>
        <Lead onStage>{w("mapBody")}</Lead>
        <GoldButton title={w("mapCta")} onPress={() => go("/map")} style={{ marginTop: 24 }} />
        <View style={{ marginTop: 28, borderRadius: R.card, backgroundColor: "rgba(0,0,0,0.2)", borderWidth: 1, borderColor: "rgba(214,180,108,0.2)", padding: 18 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <IllumFrame />
          <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ flexDirection: "row", flexWrap: "wrap", gap: 3, padding: 6 }}>
            {cw > 0 ? cells.map((lvl, i) => <View key={i} style={{ width: cw, height: cw, borderRadius: 3, backgroundColor: bg[lvl], borderWidth: lvl ? 0 : 1, borderColor: "rgba(214,180,108,0.1)" }} />) : null}
          </View>
        </View>
      </View>
    </Stage>
  );
}

/** 9 Popular surahs and verses to learn */
export function HomePopular() {
  const t = useTheme();
  const hm = useHm(t);
  const w = useWebT("home2");
  return (
    <WarmSection>
      <View style={{ paddingHorizontal: 16, paddingVertical: 44 }}>
        <View style={{ paddingHorizontal: 4 }}><H2>{w("popTitle")}</H2><Lead>{w("popIntro")}</Lead></View>
        <View style={{ gap: 10, marginTop: 24 }}>
          {POPULAR.map((p) => (
            <HmCard key={p.n} corners={false} onPress={() => go(p.href)} accessibilityLabel={w(`pop${p.n}`)} style={{ padding: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <HomeStar size={46}>{p.s}</HomeStar>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 16.5, color: t.ink }}>{w(`pop${p.n}`)}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted, marginTop: 3 }}>{w(`pop${p.n}d`)}</Text>
                </View>
                <Callig size={24} color={hm.goldD}>{p.ar}</Callig>
              </View>
            </HmCard>
          ))}
        </View>
      </View>
    </WarmSection>
  );
}

/** 10 For children and families (with the kids-mode switch) + learn to recite beautifully (verse 73:4) */
export function HomeKidsTajweed() {
  const t = useTheme();
  const hm = useHm(t);
  const w = useWebT("home2");
  const medal = (icon: "kid" | "volume", tone: string) => (
    <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: tone, borderWidth: 2, borderColor: GOLD }}>
      <Icon name={icon} size={28} color={GOLD_L} />
    </View>
  );
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 44, gap: 14 }}>
      <HmCard style={{ padding: 24 }}>
        {medal("kid", "rgb(120,74,10)")}
        <View style={{ marginTop: 18 }}><H2>{w("kidsTitle")}</H2></View>
        <Lead>{w("kidsBody")}</Lead>
        <View style={{ marginTop: 18, gap: 12 }}>
          <KidsToggle />
          <OutlineButton title={w("kidsCta")} compact onPress={() => go("/surah/112")} style={{ borderColor: alpha(GOLD, 0.6) }} />
        </View>
      </HmCard>
      <HmCard style={{ padding: 24 }}>
        {medal("volume", "rgb(14,74,82)")}
        <View style={{ marginTop: 18 }}><H2>{w("tajTitle")}</H2></View>
        <Lead>{w("tajBody")}</Lead>
        <View style={{ marginTop: 18 }}><QuranQuote verseKey="73:4" size={24} color={hm.goldD} /></View>
      </HmCard>
    </View>
  );
}

/** 12 Quran learning glossary with the Arabic terms */
export function HomeGlossary() {
  const t = useTheme();
  const hm = useHm(t);
  const w = useWebT("home2");
  return (
    <View style={{ paddingHorizontal: 20, paddingVertical: 44 }}>
      <H2>{w("glossTitle")}</H2>
      <View style={{ marginTop: 20 }}>
        {GLOSSARY_AR.map((ar, i) => (
          <View key={i} style={{ flexDirection: "row", gap: 14, borderTopWidth: 1, borderTopColor: alpha(GOLD, 0.25), paddingVertical: 16 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><StarGlyph size={9} color={GOLD} /><Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{w(`gT${i + 1}`)}</Text></View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted, marginTop: 4 }}>{w(`gD${i + 1}`)}</Text>
            </View>
            {ar ? <Callig size={28} color={alpha(hm.goldD, 0.8)}>{ar}</Callig> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/** 12b Everything you need to learn the Quran: six tool cards with the Arabic word as watermark */
export function HomeTools() {
  const t = useTheme();
  const w = useWebT("home2");
  return (
    <WarmSection>
      <View style={{ paddingHorizontal: 16, paddingVertical: 44 }}>
        <View style={{ paddingHorizontal: 4 }}><H2>{w("toolsTitle")}</H2></View>
        <View style={{ gap: 10, marginTop: 24 }}>
          {["academy", "shams", "tajweed", "vocab", "khatm", "guides"].map((k) => (
            <HmCard key={k} corners={false} onPress={() => go(`/${k}`)} accessibilityLabel={w(`tool_${k}`)} style={{ padding: 22, overflow: "hidden" }}>
              <Text allowFontScaling={false} style={{ position: "absolute", right: 0, bottom: -18, fontFamily: CALLIG_FONT, fontSize: 64, lineHeight: 100, color: alpha(GOLD, 0.14) }}>{TILES[k === "academy" ? "courses" : k]?.ar}</Text>
              <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink }}>{w(`tool_${k}`)}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted, marginTop: 4, paddingRight: 40 }}>{w(`tool_${k}D`)}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: t.accent, marginTop: 14 }}>{w("open")}</Text>
            </HmCard>
          ))}
        </View>
      </View>
    </WarmSection>
  );
}

/** 13 Frequently asked questions (expandable, nothing open at first) */
export function HomeFaq() {
  const t = useTheme();
  const hm = useHm(t);
  const w = useWebT();
  const [open, setOpen] = useState<number | null>(null);
  const text = (i: number, kind: "q" | "a") => (i <= 5 ? w(`landing.${kind}${i}`) : w(`home2.${kind}${i}`));
  return (
    <WarmSection>
      <View style={{ paddingHorizontal: 16, paddingVertical: 44 }}>
        <View style={{ paddingHorizontal: 4 }}>
          <H2>{w("landing.faqTitle")}</H2>
          <View style={{ marginTop: 16 }}><QuranQuote verseKey="16:43" size={21} color={hm.goldD} center={false} /></View>
        </View>
        <View style={{ gap: 8, marginTop: 24 }}>
          {Array.from({ length: 12 }, (_, k) => k + 1).map((i) => {
            const on = open === i;
            return (
              <View key={i} style={{ borderRadius: R.md, borderWidth: 1, borderColor: alpha(GOLD, on ? 0.5 : 0.22), backgroundColor: t.dark ? "rgba(13,33,26,0.7)" : "rgba(255,255,255,0.7)" }}>
                <Pressable onPress={() => setOpen(on ? null : i)} accessibilityRole="button" accessibilityState={{ expanded: on }} style={{ flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16 }}>
                  <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 16, lineHeight: 22, color: t.ink }}>{text(i, "q")}</Text>
                  <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: alpha(GOLD, 0.5), alignItems: "center", justifyContent: "center", transform: [{ rotate: on ? "45deg" : "0deg" }] }}>
                    <Icon name="plus" size={14} color={hm.goldD} />
                  </View>
                </Pressable>
                {on ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, paddingHorizontal: 16, paddingBottom: 18 }}>{text(i, "a")}</Text> : null}
              </View>
            );
          })}
        </View>
      </View>
    </WarmSection>
  );
}

/** 14 Final call: under a mihrab of light, verse 96:1, "Begin today – one verse is enough" */
export function HomeFinalCta() {
  const w = useWebT();
  const { user } = useAuth();
  return (
    <Stage hairlines={false}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 48 }}>
        <Arch dark ratio={0.3}>
          <View style={{ paddingHorizontal: 20, paddingBottom: 36, marginTop: -30, alignItems: "center" }}>
            <QuranQuote verseKey="96:1" size={22} color={GOLD_L} citeColor="rgba(233,207,153,0.7)" />
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.6, color: "#ffffff", textAlign: "center", marginTop: 14 }}>{w("home2.finalTitle")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 12 }}>{w("home2.finalBody")}</Text>
            <View style={{ alignSelf: "stretch", gap: 12, marginTop: 24 }}>
              <GoldButton title={w("landing.cta")} onPress={() => router.push("/quran" as Href)} />
              {!user ? <OutlineButton title={w("landing.cta2")} onStage onPress={() => router.push("/register")} /> : null}
            </View>
          </View>
        </Arch>
      </View>
    </Stage>
  );
}
