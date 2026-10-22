import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PersonaliseCard } from "@/features/plan/Onboard2";
import { GardenWidget } from "@/features/garden/widgets";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { Eyebrow, GoldButton, GoldCard, GoldProgress, OutlineButton, Poster, PosterGrid, SectionTitle, Stage, StarNumber, SurahBanner, TextButton, gradientColors } from "@/components/brand";
import { ShamsModeChooser } from "@/features/shams2/ModeChooser";
import { continueHref, useShamsMode } from "@/features/shams2/mode";
import { useModeT } from "@/features/shams2/modeText";
import { tile, routeOf } from "@/lib/features";
import { Icon } from "@/components/icons";
import { Page, ProBadge } from "@/components/page";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { FREE, openPro, usePro } from "@/lib/pro";
import { useStoreVersion } from "@/lib/store";
import { getChapters, type Chapter } from "@/lib/quran";
import { learner, surahProgress, type SurahProgress } from "@/web/coach";
import { shamsContent } from "@/web/shamsContent";
import { ProPromo } from "@/features/learn/ProPromo";
import { TodayPlanCard } from "@/features/plan/TodayPlanCard";
import { SrsEntryCard } from "@/features/srs";
import { SwipeEntryCard } from "@/features/swipe";
import { ReciterPathCard } from "@/features/reciter-path/Screens";
import { SchoolEntryCard } from "@/features/school/Screens";
import { JourneyEntryCard } from "@/features/journey/JourneyScreen";
import { QbankEntryCard } from "@/features/qbank/Screens";
import { QaidaCard } from "@/features/qaida/Screens";
import { LangCourseCard } from "@/features/arabic-lang/Screens";
import { useLearnT } from "@/features/learn/texts";
import { DiscoverRows } from "@/features/library/Discover";

// The Masterclass tab: learning the tafsir of the Quran with the Shams Method – hero like the website's /shams page,
// "continue learning", the course path (free: al-Fātiḥa and Juz ʿAmma; Pro: every surah), courses and tools.
// One gold action: "Continue" in the Shams card. Once a method is chosen the chooser folds to "Your method · Change".
// The courses and tools that Discover shows as well (the Madrasa) sit in one folded section "More from the Madrasa"
// with a link to Discover; nothing is removed, every card is one tap away.
const FREE_PATH = [1, ...Array.from({ length: 37 }, (_, i) => 114 - i)];
const PRO_PATH = [67, 36, 18, 55, 56, 32, 2, 12, 19, 25, 24, 49];

export default function Masterclass() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const lt = useLearnT();
  const w = useWebT();
  const { lang } = useLang();
  const { pro } = usePro();
  useStoreVersion();
  const c = shamsContent(lang);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allFree, setAllFree] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const byId = useMemo(() => new Map(chapters.map((ch) => [ch.id, ch])), [chapters]);
  const progress = surahProgress();
  const me = learner();
  const next = me.learned > 0 ? me.next : null;
  const nextChapter = next ? byId.get(next.surah) : undefined;
  const open = (surah: number, verse?: number) => router.push(`/shams/${surah}${verse ? `?v=${verse}` : ""}` as Href);
  // "Continue" follows the learner's Shams method: the classic session where they left off, or today's wird (2.0)
  const { mode } = useShamsMode();
  const mt = useModeT();

  const freeShown = allFree ? FREE_PATH : FREE_PATH.slice(0, 8);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        {/* tab 3 is the Shams Method (owner): Shams first; the Madrasa (hero, faculty rails) lives in Discover */}
        <View style={{ paddingHorizontal: 16, marginTop: insets.top + 12, gap: 28 }}>
          {/* the Shams Method (the former page hero) with the Shams Method 2.0 hub */}
          <Stage rounded={R.card} hairlines={false} style={{ borderWidth: 1, borderColor: "rgba(214,180,108,0.45)" }}>
            <View style={{ padding: 20, gap: 12 }}>
              <Eyebrow onStage>{c.heroKicker}</Eyebrow>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 28, lineHeight: 32, color: "#fff" }}>{c.heroTitle}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: stage.textSoft }}>{c.heroLead}</Text>
              {c.heroFacts ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {c.heroFacts.map((f) => (
                    <View key={f.l} style={{ flex: 1, borderRadius: R.lg, borderWidth: 1, borderColor: "rgba(233,207,153,0.22)", backgroundColor: "rgba(255,255,255,0.04)", padding: 12 }}>
                      <Text style={{ fontFamily: FONT.display, fontSize: 22, color: "rgb(233,207,153)" }}>{f.n}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 15, color: stage.textMuted, marginTop: 6 }}>{f.l}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <GoldButton title={mode === "v2" ? mt("continueWird") : next ? lt("continue") : w("shams.cta")} icon="sun" onPress={() => (mode === "v2" ? router.push(continueHref("v2") as Href) : next ? open(next.surah, next.verse) : open(1))} />
              <OutlineButton title={lt("about")} onStage onPress={() => router.push("/shams" as Href)} />
              <ShamsModeChooser tone="stage" collapsible />
            </View>
          </Stage>
          <TodayPlanCard secondary />
          <GardenWidget />
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 32, gap: 28 }}>
          {mode === "classic" && next && nextChapter ? (
            <GoldCard>
              <SurahBanner arabic={nextChapter.name_arabic} onStage={false} />
              <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink, marginTop: 12, textAlign: "center" }}>{lt("continueAt", { surah: `${nextChapter.id}. ${nextChapter.name_simple}`, verse: next.verse })}</Text>
              <GoldButton title={lt("continue")} onPress={() => open(next.surah, next.verse)} style={{ marginTop: 14 }} />
            </GoldCard>
          ) : null}

          <SrsEntryCard />

          <View>
            <SectionTitle title={lt("pathTitle")} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, marginTop: -6, marginBottom: 16 }}>{lt("pathLead")}</Text>

            <PathHeader title={lt("freeTitle")} lead={lt("freeLead")} />
            <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
              {freeShown.map((id, i) => <SurahRow key={id} id={id} chapter={byId.get(id)} p={progress[id - 1]} first={i === 0} onPress={() => open(id)} />)}
            </View>
            <TextButton title={allFree ? lt("showLess") : `${lt("showMore")} (${FREE_PATH.length})`} onPress={() => setAllFree(!allFree)} style={{ marginTop: 4 }} />

            <PathHeader title={lt("proTitle")} lead={lt("proLead")} pro={!pro} />
            <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
              {PRO_PATH.map((id, i) => <SurahRow key={id} id={id} chapter={byId.get(id)} p={progress[id - 1]} first={i === 0} locked={!pro && !FREE.shamsSurah(id)} onPress={() => (!pro && !FREE.shamsSurah(id) ? openPro("shams") : open(id))} />)}
              <Pressable onPress={() => (pro ? router.push("/quran" as Href) : openPro("shams"))} accessibilityRole="button"
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: t.line, backgroundColor: pressed ? t.bg : t.surface })}>
                <View style={{ width: 34, alignItems: "center" }}><Icon name="book" color={t.gold} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{lt("allSurahs")}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, marginTop: 2 }}>{lt("allSurahsSub")}</Text>
                </View>
                {pro ? <Icon name="chevronRight" color={t.muted} size={16} /> : <Icon name="lock" color={t.gold} size={17} />}
              </Pressable>
            </View>
          </View>

          <ProPromo title={lt("proCardTitle")} lead={lt("proCardLead")} feature="shams" />

          {/* the Madrasa's courses and tools (also in Discover), folded: one tap shows every card as before */}
          <MadrasaMore open={moreOpen} onToggle={() => setMoreOpen(!moreOpen)} />
        </View>
        {moreOpen ? (
          <>
            <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 28 }}>
              <SwipeEntryCard />
              <QbankEntryCard />
              <PersonaliseCard />
              <QaidaCard />
              <SchoolEntryCard />
              <JourneyEntryCard />
              <LangCourseCard />
              <ReciterPathCard />
            </View>
            {/* every course, tool and section directly; the endless discovery lives in the Feed */}
            <View style={{ paddingHorizontal: 16, marginTop: 32 }}>
              <SectionTitle title={lt("toolsTitle")} />
              <PosterGrid>
                {["courses", "arabic", "tajweed", "vocab", "salah", "wudu", "plan", "map"].map((k) => tile(k)).filter((x) => !!x).map((x) => (
                  <Poster key={x!.key} title={w(`nav.${x!.key}`)} desc={w(`home2.${x!.desc}`)} badge={w(`home2.badge_${x!.badge}`)} arabic={x!.ar}
                    colors={gradientColors(x!.bg)} cta={w("home2.open")} onPress={() => router.push(routeOf(x!) as Href)} />
                ))}
              </PosterGrid>
            </View>
            <View style={{ marginTop: 32 }}><DiscoverRows /></View>
          </>
        ) : null}
      </Page>
    </>
  );
}

/** "More from the Madrasa": the folded courses and tools of this tab, with the way to Discover where they also live */
function MadrasaMore({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const t = useTheme();
  const lt = useLearnT();
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${lt("madrasaTitle")}. ${lt("madrasaLead")}`}
        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, backgroundColor: pressed ? t.bg : t.surface })}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.accentSoft, alignItems: "center", justifyContent: "center" }}><Icon name="book" size={17} color={t.accent} /></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{lt("madrasaTitle")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, textAlign: "left" }}>{lt("madrasaLead")}</Text>
        </View>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{open ? lt("showLess") : lt("showMore")}</Text>
      </Pressable>
      <Pressable onPress={() => router.navigate("/library" as Href)} accessibilityRole="link" accessibilityLabel={lt("toDiscover")}
        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: t.line, backgroundColor: pressed ? t.bg : t.surface })}>
        <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink, textAlign: "left" }}>{lt("toDiscover")}</Text>
        <Icon name="chevronRight" color={t.muted} size={16} />
      </Pressable>
    </View>
  );
}

function PathHeader({ title, lead, pro }: { title: string; lead: string; pro?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ marginBottom: 10, marginTop: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 18, color: t.ink }}>{title}</Text>
        {pro ? <ProBadge /> : null}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted, marginTop: 3 }}>{lead}</Text>
    </View>
  );
}

function SurahRow({ id, chapter, p, first, locked, onPress }: { id: number; chapter?: Chapter; p?: SurahProgress; first: boolean; locked?: boolean; onPress: () => void }) {
  const t = useTheme();
  const lt = useLearnT();
  const done = p ? p.learned : 0;
  const total = p ? p.total : chapter?.verses_count ?? 0;
  const status = !done ? lt("notStarted") : done >= total ? lt("complete") : lt("verses", { done, total });
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${id}. ${chapter?.name_simple ?? ""}, ${status}${locked ? ", Pro" : ""}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 12, minHeight: 64, backgroundColor: pressed ? t.bg : t.surface, borderTopWidth: first ? 0 : 1, borderTopColor: t.line })}>
      <StarNumber n={id} size={34} active={done > 0} />
      <View style={{ flex: 1, gap: 5 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink, flexShrink: 1 }} numberOfLines={1}>{chapter?.name_simple ?? "…"}</Text>
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 19, color: t.ink }}>{chapter?.name_arabic ?? ""}</Text>
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{chapter ? `${chapter.translated_name.name} · ` : ""}{status}</Text>
        {done > 0 && total > 0 ? <GoldProgress value={done / total} /> : null}
      </View>
      {locked ? <Icon name="lock" color={t.gold} size={17} /> : <Icon name="chevronRight" color={t.muted} size={16} />}
    </Pressable>
  );
}
