import { type ReactNode } from "react";
import { Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { router, Stack, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Arcade, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { FREE, openPro, usePro } from "@/lib/pro";
import { useStored } from "@/lib/store";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { TAJWEED_LESSONS, tajweedFor, type Lesson } from "@/web/tajweed";
import { TILES } from "@/web/tiles";
import { Girih, PracticeStar, PracticeStarNum, PracticeWindow, Rail, goldA } from "../coursekit/art";
import { Markdown } from "../coursekit/Markdown";
import { MoreTiles } from "../coursekit/MoreTiles";
import { openVerse } from "../coursekit/links";
import { useCourseT } from "../coursekit/strings";
import { ChipButton, CourseHero, ProCard } from "../coursekit/ui";
import { TajweedQuiz } from "./TajweedQuiz";

// /tajweed and /tajweed/[id]: the website's tajweed course (src/app/[locale]/(app)/tajweed): every lesson with its
// rule as an illuminated text, examples from the Quran and a short quiz. The first lessons are free; the rest carry a
// small gold lock and open the Pro sheet. Content comes unchanged from src/lib/tajweed.ts.

const isPro = (i: number) => i >= FREE.tajweedLessons;
const WORD = TILES.tajweed.ar;

function CardFrame({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[{ borderRadius: R.card, borderWidth: 1, borderColor: goldA(t, 0.26), backgroundColor: t.surface }, style]}>
      <View pointerEvents="none" style={{ position: "absolute", top: 4, left: 4, right: 4, bottom: 4, borderRadius: 9, borderWidth: 1, borderColor: goldA(t, 0.14) }} />
      {children}
    </View>
  );
}

export function TajweedListPage() {
  const t = useTheme();
  const w = useWebT("tajweed");
  const ct = useCourseT();
  const { lang } = useLang();
  const { pro } = usePro();
  const de = lang === "de";
  const LS = tajweedFor(lang);
  const scores = useStored<Record<string, number>>("tf:tajweed", {});
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 48 }}>
        <CourseHero back word={WORD} title={w("title")} lead={w("lead")} />
        <View style={{ paddingHorizontal: 16, paddingTop: 48 }}>
          <View>
            <Rail left={27} top={32} bottom={32} />
            <View style={{ gap: 16 }}>
              {LS.map((l, i) => {
                const locked = !pro && isPro(i);
                const score = scores[l.id];
                return (
                  <View key={l.id}>
                    <Pressable onPress={() => (locked ? openPro("tajweed") : router.push(`/tajweed/${l.id}` as Href))} accessibilityRole="button"
                      accessibilityLabel={`${i + 1}. ${de ? l.title_de : l.title_en}${locked ? `, ${ct("proLabel")}` : ""}`}
                      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.99 : 1 }] }]}>
                      <CardFrame style={{ padding: 16, flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
                        <PracticeStarNum n={i + 1} size={56} filled={score !== undefined && score >= 70} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: FONT.bold, fontSize: 17, lineHeight: 22, color: t.ink }}>{de ? l.title_de : l.title_en}</Text>
                          <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: t.muted }}>{de ? l.summary_de : l.summary_en}</Text>
                          <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                            <View style={{ flexDirection: "row", gap: 4 }}>{Array.from({ length: 3 }, (_, k) => <PracticeStar key={k} size={9} dim={k >= l.level} />)}</View>
                            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold }}>
                              {`${w("levelN", { n: l.level })} · ${w("quizN", { n: l.quiz.length })}${score !== undefined ? ` · ${score} %` : ""}`}
                            </Text>
                          </View>
                        </View>
                        {locked ? <Icon name="lock" size={17} color={t.gold} /> : null}
                      </CardFrame>
                    </Pressable>
                    {!pro && i === FREE.tajweedLessons - 1 ? (
                      <ProCard feature="tajweed" title={ct("tajweedProTitle")} text={ct("tajweedProText", { n: FREE.tajweedLessons, total: LS.length })} style={{ marginTop: 16 }} />
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        <MoreTiles keys={["arabic", "vocab", "salah", "shams"]} />
      </ScrollView>
    </>
  );
}

export function TajweedLessonPage({ id }: { id: string }) {
  const t = useTheme();
  const { pro } = usePro();
  const ct = useCourseT();
  const i = TAJWEED_LESSONS.findIndex((x) => x.id === id);
  if (i < 0) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ fontFamily: FONT.regular, fontSize: 16, color: t.muted }}>{ct("notFound")}</Text>
        <ChipButton title={ct("toOverview")} onPress={() => router.replace("/tajweed" as Href)} />
      </View>
    );
  }
  return <LessonBody i={i} locked={!pro && isPro(i)} />;
}

function LessonBody({ i, locked }: { i: number; locked: boolean }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const w = useWebT("tajweed");
  const ct = useCourseT();
  const { lang } = useLang();
  const { pro } = usePro();
  const de = lang === "de";
  const LS = tajweedFor(lang);
  const l = LS[i], next = LS[i + 1], prev = LS[i - 1];
  const go = (target: Lesson, k: number) => (!pro && isPro(k) ? openPro("tajweed") : router.replace(`/tajweed/${target.id}` as Href));
  const h2 = { fontFamily: FONT.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.7, color: t.ink } as const;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>
        <Stage hairlines={false} pattern={false}>
          <Girih />
          <PracticeWindow word={WORD} height={220} opacity={0.25} style={{ position: "absolute", right: -40, top: insets.top + 16 }} />
          <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 48 }}>
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/tajweed" as Href))} accessibilityRole="button" hitSlop={8}
              style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
              <Icon name="chevronLeft" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{w("title")}</Text>
            </Pressable>
            <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 16 }}>
              <PracticeStarNum n={i + 1} size={58} filled onStage />
              <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", color: stage.gold }}>{w("lessonN", { n: i + 1, total: TAJWEED_LESSONS.length })}</Text>
            </View>
            <Text accessibilityRole="header" style={{ marginTop: 16, fontFamily: FONT.display, fontSize: 36, lineHeight: 40, letterSpacing: -0.9, color: "#eef0f3" }}>{de ? l.title_de : l.title_en}</Text>
            <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 17, lineHeight: 27, color: "rgba(255,255,255,0.7)" }}>{de ? l.summary_de : l.summary_en}</Text>
          </View>
          <Arcade />
        </Stage>

        {locked ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 32 }}>
            <ProCard feature="tajweed" title={ct("lessonLocked")} text={ct("tajweedProText", { n: FREE.tajweedLessons, total: LS.length })} />
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, paddingTop: 32 }}>
            {/* the rule, set like a quiet paper page (pa-paper) */}
            <View style={{ borderRadius: 14, borderWidth: 1, borderColor: goldA(t, 0.22), backgroundColor: t.surface, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
              shadowColor: t.gold, shadowOpacity: 0.25, shadowRadius: 30, shadowOffset: { width: 0, height: 30 } }}>
              <View pointerEvents="none" style={{ position: "absolute", top: 6, left: 6, right: 6, bottom: 6, borderRadius: 10, borderWidth: 1, borderColor: goldA(t, 0.12) }} />
              <Markdown text={de ? l.body_de : l.body_en} />
            </View>

            {l.examples.length > 0 ? (
              <View style={{ marginTop: 48 }}>
                <Text accessibilityRole="header" style={h2}>{w("examples")}</Text>
                <View style={{ marginTop: 24, gap: 16 }}>
                  {l.examples.map((e, n) => (
                    <CardFrame key={n} style={{ padding: 20, paddingTop: 24 }}>
                      <View pointerEvents="none" style={{ position: "absolute", top: -6, left: 0, right: 0, alignItems: "center" }}><PracticeStar size={12} color="#c9a65e" /></View>
                      <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 30, lineHeight: 60, color: t.ink, textAlign: "center", writingDirection: "rtl" }}>{e.ar}</Text>
                      <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: t.muted }}>{de ? e.note_de : e.note_en}</Text>
                      {e.key ? <ChipButton accent title={w("listenIn", { key: e.key })} onPress={() => openVerse(e.key!)} style={{ marginTop: 16 }} /> : null}
                    </CardFrame>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ marginTop: 48 }}>
              <Text accessibilityRole="header" style={h2}>{w("quiz")}</Text>
              <TajweedQuiz id={l.id} />
            </View>
          </View>
        )}

        <View style={{ marginTop: 48, marginHorizontal: 16, paddingTop: 24, borderTopWidth: 1, borderTopColor: goldA(t, 0.25), gap: 12 }}>
          {prev ? (
            <Pressable onPress={() => go(prev, i - 1)} accessibilityRole="button" accessibilityLabel={de ? prev.title_de : prev.title_en}>
              <CardFrame style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Icon name="chevronLeft" size={16} color={t.muted} />
                <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 14, lineHeight: 19, color: t.muted }}>{de ? prev.title_de : prev.title_en}</Text>
              </CardFrame>
            </Pressable>
          ) : null}
          {next ? (
            <Pressable onPress={() => go(next, i + 1)} accessibilityRole="button" accessibilityLabel={de ? next.title_de : next.title_en}>
              <CardFrame style={{ padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 14, lineHeight: 19, color: t.accent, textAlign: "right" }}>{de ? next.title_de : next.title_en}</Text>
                {!pro && isPro(i + 1) ? <Icon name="lock" size={15} color={t.gold} /> : <Icon name="chevronRight" size={16} color={t.accent} />}
              </CardFrame>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
