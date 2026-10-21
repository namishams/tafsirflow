import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View, type ScrollViewInstance } from "react-native";
import { router, Stack, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { GoldButton, GoldCard, OutlineButton, Stage, Arcade } from "@/components/brand";
import { courseLang } from "./lang";
import { useLang, useT } from "@/i18n";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { LESSONS } from "@/web/arabic";
import { TILES } from "@/web/tiles";
import { ArchSoft, Girih, PracticeStar, PracticeStarNum, PracticeWindow, goldA, stageGoldA } from "../coursekit/art";
import { Callout } from "../coursekit/ui";
import { MoreTiles } from "../coursekit/MoreTiles";
import { useReduceMotion } from "../coursekit/motion";
import { AlphabetRing, LetterSheet } from "./Alphabet";
import { ArabicHome } from "./ArabicHome";
import { PAGE_C, SIGN_LESSONS } from "./texts";
import { goBack } from "@/components/page";
import { QaidaCard } from "../qaida/Screens";
import { LangCourseCard } from "../arabic-lang/Screens";

// /arabic – the website's "Read the Quran" page (src/app/[locale]/(app)/arabic/page.tsx): the alphabet on a ring of
// light, the learning path, how you learn, the signs of the script, where the sounds come from, every letter at a
// glance, questions, and what comes after the course.

export function ArabicPage() {
  const t = useTheme();
  const lang = courseLang(useLang().lang);
  const c = PAGE_C[lang];
  const tx = (v: { de: string; en: string; ar?: string }) => v[lang] ?? v.en;
  const scroll = useRef<ScrollViewInstance>(null);
  const pathY = useRef(0);
  const reduce = useReduceMotion();
  const signs = SIGN_LESSONS.flatMap((id) => LESSONS.find((l) => l.id === id)?.learn ?? []);
  const h2 = { fontFamily: FONT.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.7, color: t.ink } as const;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView ref={scroll} style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* hero: the alphabet on a ring of light */}
        <Hero onPath={() => scroll.current?.scrollTo({ y: pathY.current, animated: !reduce })} />

        <View onLayout={(e) => { pathY.current = e.nativeEvent.layout.y; }} style={{ paddingHorizontal: 16, paddingTop: 48 }}>
          <View style={{ marginBottom: 32, gap: 16 }}><QaidaCard /><LangCourseCard /></View>
          <Text accessibilityRole="header" style={[h2, { marginBottom: 28 }]}>{c.pathTitle}</Text>
          <ArabicHome />
        </View>

        {/* how it works */}
        <View style={{ marginTop: 56, borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 16, paddingVertical: 48 }}>
          <Text accessibilityRole="header" style={h2}>{c.howTitle}</Text>
          <View style={{ marginTop: 28, gap: 16 }}>
            {c.how.map(([h, d], i) => (
              <GoldCard key={h} style={{ padding: 20, paddingTop: 24 }}>
                <PracticeStarNum n={i + 1} size={46} />
                <Text style={{ marginTop: 12, fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{h}</Text>
                <Text style={{ marginTop: 6, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 23, color: t.muted }}>{d}</Text>
              </GoldCard>
            ))}
          </View>
          <Callout style={{ marginTop: 24, padding: 20 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: t.ink }}>{c.teacher}</Text>
          </Callout>
        </View>

        {/* the signs of the script */}
        <View style={{ paddingHorizontal: 16, paddingTop: 48 }}>
          <Text accessibilityRole="header" style={h2}>{c.signsTitle}</Text>
          <Text style={{ marginTop: 14, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: t.muted }}>{c.signsLead}</Text>
          <View style={{ marginTop: 28, gap: 16 }}>
            {signs.map((x) => (
              <GoldCard key={x.ar + tx(x.title)} style={{ padding: 20, flexDirection: "row", gap: 16 }}>
                <ArchSoft style={{ width: 84, height: 92, alignItems: "center", justifyContent: "center", paddingTop: 12, paddingHorizontal: 4 }} fill={goldA(t, 0.07)} stroke={goldA(t, 0.35)} ry={64} rb={12}>
                  <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}
                    style={{ fontFamily: ARABIC_FONT, fontSize: x.ar.length > 7 ? 19 : x.ar.length > 4 ? 25 : 34, lineHeight: (x.ar.length > 7 ? 19 : x.ar.length > 4 ? 25 : 34) * 1.6, color: t.gold }}>{x.ar}</Text>
                </ArchSoft>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 16, lineHeight: 21, color: t.ink }}>{tx(x.title)}</Text>
                  <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: t.muted }}>{tx(x.body)}</Text>
                </View>
              </GoldCard>
            ))}
          </View>
        </View>

        {/* where the sounds come from */}
        <Stage style={{ marginTop: 56 }} pattern={false}>
          <Girih />
          <View style={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 40 }}>
            <Text accessibilityRole="header" style={[h2, { color: "#eef0f3" }]}>{c.makhTitle}</Text>
            <Text style={{ marginTop: 14, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: "rgba(255,255,255,0.7)" }}>{c.makhLead}</Text>
            <View style={{ marginTop: 28, gap: 16 }}>
              {c.makh.map(([h, letters, d]) => (
                <ArchSoft key={h} fill="rgba(255,255,255,0.04)" stroke={stageGoldA(0.3)} niche="rgba(233,207,153,0.16)" style={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 32, alignItems: "center" }}>
                  <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 28, lineHeight: 48, color: "#f3e2b6", textAlign: "center", writingDirection: "rtl" }}>{letters}</Text>
                  <Text style={{ marginTop: 8, fontFamily: FONT.bold, fontSize: 17, color: "#ffffff", textAlign: "center" }}>{h}</Text>
                  <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{d}</Text>
                </ArchSoft>
              ))}
            </View>
          </View>
          <Arcade />
        </Stage>

        {/* every letter */}
        <View style={{ paddingHorizontal: 16, paddingTop: 48 }}>
          <Text accessibilityRole="header" style={h2}>{c.sheetTitle}</Text>
          <Text style={{ marginTop: 14, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: t.muted }}>{c.sheetLead}</Text>
          <View style={{ marginTop: 28 }}><LetterSheet /></View>
        </View>

        {/* questions */}
        <View style={{ paddingHorizontal: 16, paddingTop: 56 }}>
          <Text accessibilityRole="header" style={h2}>{c.faqTitle}</Text>
          <View style={{ marginTop: 22, gap: 12 }}>
            {c.faq.map(([q, a]) => <Faq key={q} q={q} a={a} />)}
          </View>
        </View>

        {/* after the course */}
        <Stage style={{ marginTop: 56 }} pattern={false}>
          <Girih />
          <View style={{ paddingHorizontal: 20, paddingVertical: 48, alignItems: "center" }}>
            <PracticeWindow word={TILES.arabic.ar} lamp height={220} />
            <Text accessibilityRole="header" style={[h2, { color: "#eef0f3", marginTop: 28, textAlign: "center" }]}>{c.after}</Text>
            <Text style={{ marginTop: 14, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{c.afterBody}</Text>
            <View style={{ marginTop: 26, gap: 12, alignSelf: "stretch" }}>
              <GoldButton compact title={c.ctaShams} onPress={() => router.push("/shams" as Href)} style={{ alignSelf: "stretch" }} />
              <OutlineButton compact onStage title={c.ctaTajweed} onPress={() => router.push("/tajweed" as Href)} style={{ alignSelf: "stretch" }} />
            </View>
          </View>
        </Stage>

        <MoreTiles keys={["salah", "tajweed", "vocab", "shams"]} />
      </ScrollView>
    </>
  );
}

function Hero({ onPath }: { onPath: () => void }) {
  const lang = courseLang(useLang().lang);
  const c = PAGE_C[lang];
  return (
    <Stage hairlines={false} pattern={false}>
      <Girih />
      <LinearGradient pointerEvents="none" colors={["rgba(233,207,153,0.10)", "transparent"]} start={{ x: 0.8, y: 0.55 }} end={{ x: 0.2, y: 0.1 }} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" }} />
      <HeroText c={c} onPath={onPath} />
      <View style={{ paddingBottom: 40, paddingTop: 8 }} accessibilityLabel={c.alphaTitle}>
        <AlphabetRing />
      </View>
      <Arcade />
    </Stage>
  );
}

function HeroText({ c, onPath }: { c: (typeof PAGE_C)["en"]; onPath: () => void }) {
  const insets = useSafeAreaInsets();
  const tr = useT();
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 32 }}>
      <Pressable onPress={() => (router.canGoBack() ? goBack() : router.replace("/" as Href))} accessibilityRole="button" accessibilityLabel={tr("common.back")} hitSlop={12}
        style={{ width: 40, height: 40, justifyContent: "center", marginStart: -6 }}>
        <Icon name="chevronLeft" color="#ffffff" size={24} />
      </Pressable>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, lineHeight: 17, letterSpacing: 2.6, textTransform: "uppercase", color: stage.gold, marginTop: 12 }}>{c.kicker}</Text>
      <Text accessibilityRole="header" style={{ marginTop: 14, fontFamily: FONT.display, fontSize: 36, lineHeight: 39, letterSpacing: -0.9, color: "#eef0f3" }}>{c.title}</Text>
      <Text style={{ marginTop: 22, fontFamily: FONT.regular, fontSize: 17, lineHeight: 27, color: "rgba(255,255,255,0.7)" }}>{c.lead}</Text>
      <View style={{ marginTop: 26, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {c.stats.map((s) => (
          <View key={s} style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: R.pill, borderWidth: 1, borderColor: stageGoldA(0.3), backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 12, paddingVertical: 4 }}>
            <PracticeStar size={9} color={stage.gold} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{s}</Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 30, gap: 12 }}>
        <GoldButton compact title={c.ctaPath} onPress={onPath} style={{ alignSelf: "stretch" }} />
        <OutlineButton compact onStage title={c.ctaPlace} onPress={() => router.push("/arabic/placement" as Href)} style={{ alignSelf: "stretch" }} />
      </View>
    </View>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={q}
      style={{ borderRadius: R.card, borderWidth: 1, borderColor: goldA(t, 0.26), backgroundColor: t.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
      <View pointerEvents="none" style={{ position: "absolute", top: 4, left: 4, right: 4, bottom: 4, borderRadius: 9, borderWidth: 1, borderColor: goldA(t, 0.14) }} />
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 17, lineHeight: 23, color: t.ink }}>{q}</Text>
        <View style={{ marginTop: 1, width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: goldA(t, 0.5), alignItems: "center", justifyContent: "center", transform: [{ rotate: open ? "45deg" : "0deg" }] }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 16, lineHeight: 18, color: t.gold }}>+</Text>
        </View>
      </View>
      {open ? <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: t.muted }}>{a}</Text> : null}
    </Pressable>
  );
}
