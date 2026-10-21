import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Chip, GoldButton, GoldCard, SectionTitle, SmallStar, StageStat } from "@/components/brand";
import { Page, PageHero, RowGroup, LinkRow } from "@/components/page";
import { CALLIG_FONT, FONT, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { usePro } from "@/lib/pro";
import { readJSON } from "@/lib/store";
import { DAY, toHijri, todayUtc } from "@/web/hijri";
import { readSrs } from "@/web/learning";
import { GAMIFY_KEY, STICKER, type Gamify } from "@/features/feed/gamify";
import { StickerArt } from "@/features/feed/Sticker";
import { ShareSheet, CARD_SIZE, BrandFoot, type ShareFormat } from "@/features/feed/share";
import { activeTree, readGarden, treeStage } from "@/features/garden/garden";
import { readCP } from "@/features/courses/progress";
import { readProgress as readLang } from "@/features/arabic-lang/progress";
import { formatNumber } from "@/features/progress/format";
import { useJourneyData } from "./hooks";
import { allStats } from "./stats";
import { activeDaysByHijri, defOf, hijriBounds, MYTHIC, yearDef, YEAR_DAYS, type JDef } from "./stickers";
import { useJourney, type EngineId } from "./store";
import { HorizonVerse, Seal } from "./ui";
import { useJT, type JKey } from "./texts";

// /journey/year – the Hijri year in review: learning days, points, time, records of the year, cycles completed,
// stickers and certificates earned in the year, the tree, and a card to share. Every number is a count of the year,
// compared only with the learner's own other years.

const utcDay = (ms: number) => Math.floor(ms / DAY);
const localToUtc = (d: number) => d; // feed/journey day numbers are local calendar days; the same number names the same date

export default function JourneyYearScreen() {
  const t = useTheme();
  const jt = useJT();
  const { lang } = useLang();
  const { pro } = usePro();
  const nf = (n: number) => formatNumber(n, lang);
  const { M } = useJourneyData();
  const j = useJourney();
  const nowY = toHijri(todayUtc()).y;
  const byYear = useMemo(() => activeDaysByHijri(), [M]); // eslint-disable-line react-hooks/exhaustive-deps
  const years = useMemo(() => [...new Set([...byYear.keys(), nowY])].sort((a, b) => b - a), [byYear, nowY]);
  const [y, setY] = useState(nowY);
  const [share, setShare] = useState(false);
  const b = hijriBounds(y);
  const data = useMemo(() => {
    if (!b) return null;
    const { from, to } = b;
    const inY = (d: number) => d >= from && d <= to;
    const per = Object.fromEntries(allStats().filter((s) => s.perDays).map((s) => [s.id, s.perDays!(from, to)]));
    const srs = readSrs();
    const learned = Object.values(srs).filter((x) => typeof x.first === "number" && inY(x.first)).length;
    const gm = readJSON<Partial<Gamify>>(GAMIFY_KEY, {});
    const feedSt = Object.entries(gm.stickers ?? {}).filter(([, d]) => inY(localToUtc(d))).map(([id]) => STICKER.get(id)).filter((x): x is NonNullable<typeof x> => !!x);
    const pathSt = Object.entries(j.stickers).filter(([, d]) => inY(localToUtc(d))).map(([id]) => jdefOf(id)).filter((x): x is JDef => !!x);
    const cycles: Partial<Record<EngineId, number>> = {};
    for (const [e, d] of j.log) if (inY(localToUtc(d))) cycles[e] = (cycles[e] ?? 0) + 1;
    const cp = readCP();
    const courses = Object.values(cp.complete ?? {}).filter((ms) => inY(utcDay(ms))).length;
    const rp = readJSON<{ certs?: Record<string, string> }>("qmc.reciterPath", {});
    const rpCerts = Object.values(rp.certs ?? {}).filter((s) => inY(utcDay(Date.parse(`${s}T12:00:00Z`)))).length;
    const arCerts = Object.values(readLang().certs ?? {}).filter((c) => c && inY(utcDay(c.at))).length;
    const g = readGarden();
    const tree = activeTree(g, pro);
    const best = Math.max(0, ...[...byYear.entries()].filter(([yy]) => yy !== y).map(([, n]) => n));
    return { per, learned, feedSt, pathSt, cycles, certs: courses + rpCerts + arCerts, tree: tree ? { name: tree.name, stage: treeStage(tree, pro) } : null, best };
  }, [y, M, j, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const days = data?.per.activeDays ?? 0;
  const yd = yearDef(y);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back arabic="رحلة العلم" eyebrow={jt("eyebrow")} title={jt("yearTitle")} lead={jt("yearLead")}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {years.map((x) => <Chip key={x} onStage label={jt("hijriYear", { y: nf(x) })} selected={x === y} onPress={() => setY(x)} />)}
          </View>
        </PageHero>
        {data ? (
          <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 26 }}>
            <View style={{ borderRadius: 12, overflow: "hidden", backgroundColor: stage.bg, paddingHorizontal: 16 }}>
              <View style={{ flexDirection: "row" }}>
                <StageStat value={nf(days)} label={jt("y_days")} />
                <StageStat value={nf(data.per.points ?? 0)} label={jt("y_points")} />
              </View>
              <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: stage.hair }}>
                <StageStat value={nf(Math.round((data.per.minutes ?? 0) / 60))} label={jt("y_hours")} />
                <StageStat value={nf(data.per.bestStreak ?? 0)} label={jt("y_streak")} />
              </View>
              <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: stage.hair }}>
                <StageStat value={nf(data.learned)} label={jt("y_learned")} />
                <StageStat value={nf(data.per.bestDay ?? 0)} label={jt("y_bestDay")} />
              </View>
            </View>
            {days > 0 && days >= data.best ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.gold }}>{jt("y_bestYear")}</Text> : null}

            <GoldCard>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <Seal def={yd} size={72} locked={!j.stickers[yd.id]} pct={days / YEAR_DAYS} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{jt("s_hijri", { n: nf(y) })}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{j.stickers[yd.id] ? jt("earned") : jt("y_sealHow", { n: nf(Math.min(days, YEAR_DAYS)), m: nf(YEAR_DAYS) })}</Text>
                </View>
              </View>
            </GoldCard>

            <View>
              <SectionTitle title={jt("y_cycles")} />
              <RowGroup>
                {(["khatm", "review", "tafsir", "hadith", "lemma", "mut"] as EngineId[]).map((e, i) => (
                  <LinkRow key={e} first={i === 0} title={jt(`e_${e}` as JKey)} right={<Text style={{ fontFamily: FONT.display, fontSize: 16, color: t.ink }}>{nf(data.cycles[e] ?? 0)}</Text>} />
                ))}
                <LinkRow title={jt("y_certs")} right={<Text style={{ fontFamily: FONT.display, fontSize: 16, color: t.ink }}>{nf(data.certs)}</Text>} />
                {data.tree ? <LinkRow title={jt("y_tree", { name: data.tree.name })} right={<Text style={{ fontFamily: FONT.display, fontSize: 16, color: t.ink }}>{jt("stageN", { n: nf(data.tree.stage) })}</Text>} /> : null}
              </RowGroup>
            </View>

            <View>
              <SectionTitle title={jt("y_stickers", { n: nf(data.feedSt.length + data.pathSt.length) })} />
              {data.feedSt.length + data.pathSt.length === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{jt("y_noStickers")}</Text> : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  {data.pathSt.map((d) => <Seal key={d.id} def={d} size={58} />)}
                  {data.feedSt.slice(0, 40).map((d) => <StickerArt key={d.id} def={d} size={58} />)}
                </View>
              )}
            </View>

            <GoldButton title={jt("y_share")} icon="share" onPress={() => setShare(true)} />
            <HorizonVerse />
          </View>
        ) : null}
        {data ? (
          <ShareSheet visible={share} onClose={() => setShare(false)} noDecoration link="" message={jt("y_shareText", { y: nf(y), d: nf(days) })}
            renderCard={(f) => <YearCard f={f} y={y} days={days} points={data.per.points ?? 0} hours={Math.round((data.per.minutes ?? 0) / 60)} learned={data.learned} seals={[...data.pathSt.filter((x) => !x.mythic).slice(-4), ...data.pathSt.filter((x) => x.mythic)].slice(-5)} nf={nf} jt={jt} />} />
        ) : null}
      </Page>
    </>
  );
}

/** a journey sticker id back to its definition */
function jdefOf(id: string): JDef | null {
  const my = MYTHIC.find((x) => x.id === id);
  if (my) return my;
  const m = /^rihla-hijri-(\d+)$/.exec(id);
  if (m) return yearDef(Number(m[1]));
  const s = /^rihla-([a-z]+)-(\d+)$/.exec(id);
  return s ? defOf(s[1], Number(s[2]), 0) : null;
}

function YearCard({ f, y, days, points, hours, learned, seals, nf, jt }: { f: ShareFormat; y: number; days: number; points: number; hours: number; learned: number; seals: JDef[]; nf: (n: number) => string; jt: ReturnType<typeof useJT> }) {
  const { w, h } = CARD_SIZE[f];
  return (
    <View style={{ width: w, height: h, overflow: "hidden" }}>
      <LinearGradient colors={["#0c4a37", "#051c15"]} style={{ flex: 1, padding: 26, justifyContent: "space-between" }}>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={11} color={stage.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.6, color: stage.gold }}>{jt("yearTitle")}</Text></View>
          <Text style={{ fontFamily: CALLIG_FONT, fontSize: 28, lineHeight: 46, color: stage.gold }}>{"رحلة العلم"}</Text>
          <Text style={{ fontFamily: FONT.display, fontSize: 30, color: "#fff" }}>{jt("hijriYear", { y: nf(y) })}</Text>
        </View>
        <View style={{ gap: 14 }}>
          {[[nf(days), jt("y_days")], [nf(points), jt("y_points")], [nf(hours), jt("y_hours")], [nf(learned), jt("y_learned")]].map(([v, l]) => (
            <View key={l} style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 26, color: "#f3e2b6" }}>{v}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{l}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>{seals.map((d) => <Seal key={d.id} def={d} size={52} />)}</View>
        <BrandFoot />
      </LinearGradient>
    </View>
  );
}
