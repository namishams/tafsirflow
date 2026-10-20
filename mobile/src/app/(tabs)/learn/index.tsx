import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { GoldButton, GoldCard, GoldProgress, OutlineButton, Poster, PosterGrid, SectionTitle, StarNumber, SurahBanner, gradientColors } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero, ProBadge } from "@/components/page";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { FREE, openPro, usePro } from "@/lib/pro";
import { useStoreVersion } from "@/lib/store";
import { getChapters, type Chapter } from "@/lib/quran";
import { learner, surahProgress, type SurahProgress } from "@/web/coach";
import { shamsContent } from "@/web/shamsContent";
import { tile, routeOf } from "@/lib/features";
import { ProPromo } from "@/features/learn/ProPromo";
import { useLearnT } from "@/features/learn/texts";

// The Masterclass tab: learning the tafsir of the Quran with the Shams Method – hero like the website's /shams page,
// "continue learning", the course path (free: al-Fātiḥa and Juz ʿAmma; Pro: every surah), courses and tools.
const FREE_PATH = [1, ...Array.from({ length: 37 }, (_, i) => 114 - i)];
const PRO_PATH = [67, 36, 18, 55, 56, 32, 2, 12, 19, 25, 24, 49];

export default function Masterclass() {
  const t = useTheme();
  const lt = useLearnT();
  const w = useWebT();
  const { lang } = useLang();
  const { pro } = usePro();
  useStoreVersion();
  const c = shamsContent(lang);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allFree, setAllFree] = useState(false);
  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const byId = useMemo(() => new Map(chapters.map((ch) => [ch.id, ch])), [chapters]);
  const progress = surahProgress();
  const me = learner();
  const next = me.learned > 0 ? me.next : null;
  const nextChapter = next ? byId.get(next.surah) : undefined;
  const open = (surah: number, verse?: number) => router.push(`/shams/${surah}${verse ? `?v=${verse}` : ""}` as Href);

  const freeShown = allFree ? FREE_PATH : FREE_PATH.slice(0, 8);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset eyebrow={c.heroKicker} title={c.heroTitle} lead={c.heroLead}>
          {c.heroFacts ? (
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
              {c.heroFacts.map((f) => (
                <View key={f.l} style={{ flex: 1, borderRadius: R.lg, borderWidth: 1, borderColor: "rgba(233,207,153,0.22)", backgroundColor: "rgba(255,255,255,0.04)", padding: 12 }}>
                  <Text style={{ fontFamily: FONT.display, fontSize: 24, color: "rgb(233,207,153)" }}>{f.n}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 15, color: stage.textMuted, marginTop: 6 }}>{f.l}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <GoldButton title={next ? lt("continue") : w("shams.cta")} icon="sun" onPress={() => (next ? open(next.surah, next.verse) : open(1))} />
          <OutlineButton title={lt("about")} onStage onPress={() => router.push("/shams" as Href)} />
        </PageHero>

        <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 28 }}>
          {next && nextChapter ? (
            <GoldCard>
              <SurahBanner arabic={nextChapter.name_arabic} onStage={false} />
              <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink, marginTop: 12, textAlign: "center" }}>{lt("continueAt", { surah: `${nextChapter.id}. ${nextChapter.name_simple}`, verse: next.verse })}</Text>
              <GoldButton title={lt("continue")} onPress={() => open(next.surah, next.verse)} style={{ marginTop: 14 }} />
            </GoldCard>
          ) : null}

          <View>
            <SectionTitle title={lt("pathTitle")} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, marginTop: -6, marginBottom: 16 }}>{lt("pathLead")}</Text>

            <PathHeader title={lt("freeTitle")} lead={lt("freeLead")} />
            <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
              {freeShown.map((id, i) => <SurahRow key={id} id={id} chapter={byId.get(id)} p={progress[id - 1]} first={i === 0} onPress={() => open(id)} />)}
            </View>
            <Pressable onPress={() => setAllFree(!allFree)} accessibilityRole="button" style={{ paddingVertical: 12 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{allFree ? lt("showLess") : `${lt("showMore")} (${FREE_PATH.length})`}</Text>
            </Pressable>

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

          <View>
            <SectionTitle title={lt("toolsTitle")} />
            <PosterGrid>
              {["courses", "arabic", "tajweed", "vocab", "salah", "wudu", "plan", "map"].map((k) => tile(k)).filter((x) => !!x).map((x) => (
                <Poster key={x!.key} title={w(`nav.${x!.key}`)} desc={w(`home2.${x!.desc}`)} badge={w(`home2.badge_${x!.badge}`)} arabic={x!.ar}
                  colors={gradientColors(x!.bg)} cta={w("home2.open")} onPress={() => router.push(routeOf(x!) as Href)} />
              ))}
            </PosterGrid>
          </View>
        </View>
      </Page>
    </>
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
