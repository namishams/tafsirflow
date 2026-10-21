import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { ARABIC_FONT, CALLIG_FONT, FONT, FWD, R, stage, useTheme } from "@/lib/theme";
import { GoldProgress, SmallStar, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero, useWide } from "@/components/page";
import { isRTL, useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { FREE, usePro } from "@/lib/pro";
import { useStoreVersion } from "@/lib/store";
import { getChapters, type Chapter } from "@/lib/quran";
import { PASS, UNITS, dailyGoal, lessonsOf, levelOf, levelStart, nextLesson, readProgress, secondsPerQuestion, streakOf } from "@/web/academy";
import { today, weakestVerses } from "@/web/learning";
import { ageProfile } from "@/web/age";
import { GoldRing, StarBadge } from "@/features/today/art";
import { SURAH_PREFIX } from "@/features/quran/arabic";
import { HmCard, QuranQuote } from "@/features/extra/art";
import { MoreTiles } from "@/features/practice/art";
import { tileFor } from "@/web/tiles";
import { CoursesEntry } from "@/features/courses/Screens";
import { ShamsEntries } from "@/features/courses/Shams";
import { Shams2Entry } from "@/features/shams2/Hub";
import { VocabDecksEntry } from "@/features/courses/Vocab";

// "More in the Academy" (website academy/page.tsx MODULES)
const MODULES = [
  { href: "/plan", key: "mPlan" }, { href: "/shams", key: "mShams" }, { href: "/tajweed", key: "mTajweed" }, { href: "/vocab", key: "mVocab" },
  { href: "/khatm", key: "mKhatm" }, { href: "/guides", key: "mGuides" }, { href: "/duas", key: "mDuas" },
];

// Academy (website AcademyHome.tsx): daily goal, level, streak, the next lesson, weak verses and the path through all
// 114 surahs in five units, then the other modules of the academy and more courses. Tests of surahs beyond al-Fātiḥa
// and Juz ʿAmma are part of Pro.
export default function Academy() {
  const t = useTheme();
  const w = useWebT("academy");
  const { lang } = useLang();
  const { pro } = usePro();
  useStoreVersion();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [open, setOpen] = useState("u1");
  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const p = readProgress();
  const lvl = levelOf(p.xp);
  const into = p.xp - levelStart(lvl), need = levelStart(lvl + 1) - levelStart(lvl);
  const goal = dailyGoal(p), todayXp = p.days[today()] ?? 0;
  const streak = streakOf(p);
  const nl = nextLesson(p);
  const ch = (id: number) => chapters.find((c) => c.id === id);
  const name = (s: number) => ch(s)?.name_simple ?? String(s);
  const weak = weakestVerses(6).filter((x) => x.strength < 0.9);
  const doneCount = Object.values(p.done).filter((x) => x >= PASS).length;
  const go = (s: number, from: number) => router.push(`/academy/${s}/${from}` as Href);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={w("eyebrow")} title={w("title")} lead={w("lead")}>
          <QuranQuote verseKey="20:114" size={22} color="rgb(233,207,153)" citeColor="rgba(255,255,255,0.5)" center={false} />
        </PageHero>
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Card>
              <GoldRing value={todayXp / Math.max(1, goal)} size={78} stroke={5} dark={false}>
                <Text style={{ fontFamily: FONT.display, fontSize: 17, color: t.ink }}>{Math.min(todayXp, goal)}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 9.5, color: t.muted }}>/ {goal} XP</Text>
              </GoldRing>
              <Label>{w("dailyGoal")}</Label>
            </Card>
            <Card>
              <StarBadge tone="gold" size={78}>{lvl}</StarBadge>
              <Label>{w("level")}</Label>
              <View style={{ alignSelf: "stretch" }}><GoldProgress value={into / Math.max(1, need)} /></View>
            </Card>
            <Card>
              <StarBadge tone="emerald" size={78}>{streak}</StarBadge>
              <Label>{w("streak")}</Label>
            </Card>
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{todayXp >= goal ? w("goalReached") : w("goalHint")} · {w("levelHint", { secs: secondsPerQuestion(lvl, ageProfile().testBonus), xp: need - into })} · {w("streakHint", { n: doneCount })}</Text>

          <Pressable onPress={() => go(nl.s, nl.from)} accessibilityRole="button" accessibilityLabel={`${w("continue")}: ${name(nl.s)} ${nl.from}–${nl.to}`}>
            <Stage rounded={R.card}>
              <View style={{ padding: 20, flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: stage.gold }}>{w("continue")}</Text>
                  {ch(nl.s)?.name_arabic ? <Text numberOfLines={1} style={{ fontFamily: CALLIG_FONT, fontSize: 28, lineHeight: 46, color: "rgb(233,207,153)" }}>{`${SURAH_PREFIX}${ch(nl.s)!.name_arabic}`}</Text> : null}
                  <Text style={{ fontFamily: FONT.bold, fontSize: 19, color: "#fff" }}>{name(nl.s)} · {nl.from}–{nl.to}</Text>
                </View>
                <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#d3b673" }}><Icon name="chevronRight" color="rgb(8,38,29)" size={20} /></View>
              </View>
            </Stage>
          </Pressable>

          {weak.length > 0 ? (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{w("weakTitle")}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, marginTop: 2, marginBottom: 10 }}>{w("weakLead")}</Text>
              <View style={{ gap: 8 }}>
                {weak.map((x) => { const [s, v] = x.key.split(":"); return (
                  <Pressable key={x.key} onPress={() => router.push(`/shams/${s}?v=${v}` as Href)} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: "rgba(150,116,52,0.25)", backgroundColor: t.surface }}>
                    <StarBadge size={32}>{v}</StarBadge>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, flex: 1 }} numberOfLines={1}>{name(Number(s))}</Text>
                    <View style={{ width: 64 }}><GoldProgress value={x.strength} /></View>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{Math.round(x.strength * 100)}%</Text>
                  </Pressable>); })}
              </View>
            </View>
          ) : null}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 9, marginTop: 18 }}><SmallStar size={15} color={t.gold} /><Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 23, color: t.ink }}>{w("path")}</Text></View>
          {UNITS.map((u, ui) => {
            const lessons = u.surahs.flatMap(lessonsOf);
            const done = lessons.filter((l) => (p.done[l.id] ?? 0) >= PASS).length;
            const isOpen = open === u.id;
            return (
              <View key={u.id} style={{ borderRadius: R.card, borderWidth: 1, borderColor: isOpen ? "rgba(150,116,52,0.55)" : "rgba(150,116,52,0.25)", backgroundColor: t.surface, overflow: "hidden" }}>
                <Pressable onPress={() => setOpen(isOpen ? "" : u.id)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }} style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16 }}>
                  <StarBadge size={48} tone={done === lessons.length && lessons.length > 0 ? "emerald" : isOpen ? "gold" : "light"}>{ui + 1}</StarBadge>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: t.gold }}>{w("unit", { n: ui + 1 })}</Text>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 16.5, lineHeight: 22, color: t.ink, marginTop: 3 }}>{w(u.id)}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, marginTop: 2 }}>{w("unitMeta", { surahs: u.surahs.length, lessons: lessons.length, done })}</Text>
                    <View style={{ marginTop: 8, maxWidth: 240 }}><GoldProgress value={done / Math.max(1, lessons.length)} /></View>
                  </View>
                  <Icon name="chevronDown" color={t.gold} size={18} />
                </Pressable>
                {isOpen ? u.surahs.map((s) => {
                  const ls = lessonsOf(s);
                  const d = ls.filter((l) => (p.done[l.id] ?? 0) >= PASS).length;
                  const locked = !pro && !FREE.shamsSurah(s);
                  return (
                    <View key={s} style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "rgba(150,116,52,0.15)" }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <StarBadge size={30}>{s}</StarBadge>
                        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, flex: 1 }} numberOfLines={1}>{name(s)}</Text>
                        {ch(s)?.name_arabic ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 18, color: t.gold }}>{ch(s)!.name_arabic}</Text> : null}
                        {locked ? <Icon name="lock" color={t.gold} size={15} /> : <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{d}/{ls.length}</Text>}
                      </View>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                        {ls.map((l) => {
                          const sc = p.done[l.id];
                          const passed = sc !== undefined && sc >= PASS;
                          return (
                            <Pressable key={l.id} onPress={() => go(l.s, l.from)} accessibilityRole="button" accessibilityLabel={`${name(s)} ${l.from}–${l.to}${passed ? ", ✓" : ""}`}
                              style={{ minWidth: 42, height: 32, paddingHorizontal: 8, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: passed ? "rgb(6,108,78)" : sc !== undefined ? "rgba(150,116,52,0.3)" : "rgba(150,116,52,0.12)" }}>
                              <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: passed ? "#fff" : t.gold }}>{l.from}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  );
                }) : null}
              </View>
            );
          })}

          <Modules />
          <CoursesEntry />
          <Shams2Entry />
          <ShamsEntries />
          <VocabDecksEntry />
        </View>
        <MoreTiles keys={["shams", "arabic", "salah", "tajweed"]} />
      </Page>
    </>
  );
}

function Modules() {
  const t = useTheme();
  const w = useWebT("academy");
  const wh = useWebT("home2");
  const wide = useWide();
  const { lang } = useLang();
  return (
    <View style={{ marginTop: 32 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}><SmallStar size={15} color={t.gold} /><Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 23, color: t.ink }}>{w("modules")}</Text></View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
        {MODULES.map((m) => (
          <HmCard key={m.href} onPress={() => router.push(m.href as Href)} accessibilityLabel={`${w(m.key)}. ${w(`${m.key}D`)}`} style={{ width: wide ? "48.5%" : "100%", overflow: "hidden" }}>
            <Text allowFontScaling={false} numberOfLines={1} style={{ position: "absolute", bottom: -24, end: 0, fontFamily: CALLIG_FONT, fontSize: 60, lineHeight: 96, color: "rgba(201,166,94,0.14)" }}
              accessibilityElementsHidden importantForAccessibility="no">{tileFor(m.href)?.ar ?? ""}</Text>
            <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{w(m.key)}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 4 }}>{w(`${m.key}D`)}</Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: isRTL(lang) ? 0 : 1.4, textTransform: "uppercase", color: t.accent, marginTop: 12 }}>{wh("open")} {FWD}</Text>
          </HmCard>
        ))}
      </View>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ flex: 1, alignItems: "center", gap: 8, padding: 12, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(150,116,52,0.25)", backgroundColor: t.surface }}>{children}</View>;
}
function Label({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.4, textTransform: "uppercase", color: t.gold }}>{children}</Text>;
}
