import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { GoldButton, GoldCard, GoldProgress, SectionTitle, SmallStar } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { LinkRow, Page, PageHero, READ_WIDTH, RowGroup } from "@/components/page";
import { CALLIG_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { formatNumber } from "@/features/progress/format";
import { useJourneyData } from "./hooks";
import { marhala, fracOf, doneOf, marhalaPoints, type Area, type Milestone } from "./marahil";
import { BAND } from "./rank";
import { albumOf, gardenAreas, MYTHIC } from "./stickers";
import { markFreshSeen, toggleQiraat, useJourney } from "./store";
import { dayNum } from "@/features/feed/statsStore";
import { HorizonVerse, MarahilMap, Seal, type MapNode } from "./ui";
import { useJT, type JKey } from "./texts";

// /journey – Riḥlat al-ʿIlm: the long path of learning. A map of the Marāḥil (no last one), the app rank with its next
// horizon, the milestones of the chosen Marḥala, the garden areas opened after the tree's last stage, and the album of
// the path with the mythic seals. One primary action: today's plans.

const AREA_ICON: Record<Area, IconName> = {
  madrasa: "cap", hifz: "sun", itqan: "starBig", tajweed: "speaker", qiraat: "volume", arabic: "pen", tafsir: "book", hadith: "note",
  seerah: "map", academy: "cap", nahj: "book", khatm: "book", review: "repeat", lemma: "list", mut: "grid", garden: "sun", streak: "flame",
};

export function useMarhalaTitle() {
  const jt = useJT();
  return (m: number) => (m <= 7 ? jt(`mh_${m}` as JKey) : jt("mh_n", { n: m }));
}

export default function JourneyScreen() {
  const t = useTheme();
  const jt = useJT();
  const { lang } = useLang();
  const nf = (n: number) => formatNumber(n, lang);
  const { width } = useWindowDimensions();
  const { M, done, current } = useJourneyData();
  const j = useJourney();
  const [sel, setSel] = useState(current);
  const [all, setAll] = useState(false);
  useEffect(() => { setSel(current); }, [current]);
  useEffect(() => () => { markFreshSeen(); }, []);
  const mt = useMarhalaTitle();
  const W = Math.min(width, READ_WIDTH) - 32;

  // the map shows the stations up to one past the learner's Marḥala, at least seven; long paths show a window
  const last = Math.max(7, current + 1);
  const first = all ? 1 : Math.max(1, current - 5);
  const nodes: MapNode[] = useMemo(() => Array.from({ length: last - first + 1 }, (_, i) => {
    const m = first + i;
    const ms = m === current ? marhala(m, M) : null;
    const state = m <= done ? "done" : m === current ? "current" : "ahead";
    const frac = ms ? fracOf(ms) : 0;
    const pts = ms ? marhalaPoints(ms) : null;
    return { m, state, frac, title: jt("marhalaN", { n: m }), sub: pts ? `${mt(m)} · ${jt("towardNext", { a: formatNumber(pts[0], lang), b: formatNumber(pts[1], lang), n: m + 1 })}` : state === "done" ? `${mt(m)} · ${jt("reached")}` : mt(m) } as MapNode;
  }), [M, done, current, first, last]); // eslint-disable-line react-hooks/exhaustive-deps

  const ms = useMemo(() => marhala(sel, M), [sel, M]);
  const areas = gardenAreas(M, done);
  const album = useMemo(() => albumOf(M, j.stickers), [M, j.stickers]);
  const r = M.rank;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back arabic="رحلة العلم" eyebrow={jt("eyebrow")} title={jt("title")} lead={jt("lead")}>
          <GoldButton title={jt("todayCta")} icon="calendar" onPress={() => router.push("/journey/today" as Href)} />
        </PageHero>

        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 28 }}>
          {/* the app rank: always a next level, the 12:76 reminder from level 8 on */}
          <GoldCard>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, color: t.gold }}>{jt("rankKicker")}</Text>
                <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink, marginTop: 6 }}>{jt("levelN", { n: nf(r.level) })}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted, marginTop: 2 }}>
                  {r.k > 0 ? `${r.tr} · ${jt("bandStep", { b: nf(r.band), s: r.step, of: BAND })}` : jt("learningLevels")}
                </Text>
              </View>
              <Text style={{ fontFamily: CALLIG_FONT, fontSize: 26, lineHeight: 44, color: t.gold }}>{r.ar}</Text>
            </View>
            <View style={{ marginTop: 14, gap: 6 }}>
              <GoldProgress value={r.pct} />
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{jt("toNext", { n: nf(r.level + 1), a: nf(Math.max(0, Math.ceil((1 - r.pct) * (r.to - r.from)))) })}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted }}>{jt("rankNote")}</Text>
            </View>
            {r.level >= 8 ? <View style={{ marginTop: 16 }}><HorizonVerse /></View> : null}
          </GoldCard>

          <View>
            <SectionTitle title={jt("mapTitle")} action={current > 6 ? (all ? jt("showRecent") : jt("showAll")) : undefined} onAction={() => setAll((x) => !x)} />
            <MarahilMap nodes={nodes} selected={sel} onSelect={setSel} width={W} />
          </View>

          {/* the chosen Marḥala */}
          <View>
            <SectionTitle title={`${jt("marhalaN", { n: sel })} · ${mt(sel)}`} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginBottom: 12 }}>
              {sel <= done ? jt("marhalaDone", { n: sel + 1 }) : jt("marhalaOpen", { d: doneOf(ms), n: ms.length, a: formatNumber(marhalaPoints(ms)[0], lang), b: formatNumber(marhalaPoints(ms)[1], lang), m: sel + 1 })}
            </Text>
            <RowGroup>{ms.map((x, i) => <MilestoneRow key={x.id} x={x} first={i === 0} />)}</RowGroup>
            {ms.some((x) => x.q) ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted, marginTop: 8 }}>{jt("qiraatNote")}</Text> : null}
            {sel === current ? <View style={{ marginTop: 16 }}><HorizonVerse /></View> : null}
          </View>

          {/* the garden keeps growing after the tree's last stage */}
          <View>
            <SectionTitle title={jt("gardenTitle")} action={jt("openGarden")} onAction={() => router.push("/garden" as Href)} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginBottom: 12 }}>{jt("gardenLead")}</Text>
            <RowGroup>
              {Array.from({ length: areas }, (_, i) => <LinkRow key={i} first={i === 0} icon="sun" title={gardenName(jt, i + 1)} subtitle={jt("gardenOpened")} />)}
              <LinkRow first={areas === 0} icon="lock" title={gardenName(jt, areas + 1)} subtitle={M.treeStage >= 12 ? jt("gardenNextMarhala", { n: done + 1 }) : jt("gardenNeedsTree")} />
            </RowGroup>
          </View>

          {/* album of the path */}
          <View>
            <SectionTitle title={jt("albumTitle")} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginBottom: 12 }}>{jt("albumLead")}</Text>
            <View style={{ gap: 18 }}>
              {album.filter((row) => row.items.length).map((row) => (
                <View key={row.fam}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink, marginBottom: 8 }}>{jt(`row_${row.fam}` as JKey)}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                    {row.items.map(({ def, have, prog }) => {
                      const label = jt(def.key as JKey, { n: typeof def.n === "number" ? nf(def.n) : "" });
                      const fresh = j.fresh.includes(def.id);
                      return (
                        <View key={def.id} style={{ width: 84, alignItems: "center", gap: 4 }} accessible accessibilityLabel={`${label}${have ? "" : `, ${jt("locked")}: ${nf(prog?.[0] ?? 0)} / ${nf(prog?.[1] ?? 0)}`}`}>
                          <Seal def={def} size={72} locked={!have} pct={prog ? prog[0] / Math.max(1, prog[1]) : 0} />
                          <Text style={{ fontFamily: FONT.medium, fontSize: 11, lineHeight: 14, color: have ? t.ink : t.muted, textAlign: "center" }} numberOfLines={2}>{label}</Text>
                          {fresh ? <Text style={{ fontFamily: FONT.bold, fontSize: 10, color: t.gold }}>{jt("new")}</Text> : null}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* mythic */}
          <View style={{ borderRadius: R.card, backgroundColor: stage.bg, borderWidth: 1, borderColor: "rgba(214,180,108,0.45)", padding: 18, gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={12} color={stage.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, color: stage.gold }}>{jt("mythicKicker")}</Text></View>
            <Text style={{ fontFamily: FONT.display, fontSize: 22, color: "#fff" }}>{jt("mythicTitle")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft }}>{jt("mythicLead")}</Text>
            <View style={{ gap: 14, marginTop: 6 }}>
              {MYTHIC.map((x) => {
                const have = !!j.stickers[x.id];
                const [a, b] = x.prog(M);
                return (
                  <View key={x.id} style={{ flexDirection: "row", alignItems: "center", gap: 14 }} accessible accessibilityLabel={`${jt(x.key as JKey)}. ${have ? jt("earned") : `${nf(Math.min(a, b))} / ${nf(b)}`}`}>
                    <Seal def={x} size={64} locked={!have} pct={a / Math.max(1, b)} />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ fontFamily: FONT.bold, fontSize: 14.5, color: "#fff" }}>{jt(x.key as JKey)}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: stage.textMuted }}>{jt(`${x.key}_how` as JKey)}</Text>
                      {have ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.gold }}>{jt("earned")}</Text>
                        : <><GoldProgress value={Math.min(1, a / Math.max(1, b))} track="rgba(255,255,255,0.12)" /><Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: stage.textMuted }}>{`${nf(Math.min(a, b))} / ${nf(b)}`}</Text></>}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <RowGroup>
            <LinkRow first icon="calendar" title={jt("yearTitle")} subtitle={jt("yearRow")} onPress={() => router.push("/journey/year" as Href)} />
            <LinkRow icon="list" title={jt("statsTitle")} subtitle={jt("statsRow")} onPress={() => router.push("/journey/stats" as Href)} />
            <LinkRow icon="repeat" title={jt("todayTitle")} subtitle={jt("todayRow")} onPress={() => router.push("/journey/today" as Href)} />
          </RowGroup>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted }}>{jt("healthy")}</Text>
        </View>
      </Page>
    </>
  );
}

export const gardenName = (jt: ReturnType<typeof useJT>, n: number) => (n <= 7 ? jt(`garden_${n}` as JKey) : jt("garden_n", { n }));

function MilestoneRow({ x, first }: { x: Milestone; first: boolean }) {
  const t = useTheme();
  const jt = useJT();
  const { lang } = useLang();
  const j = useJourney();
  const nf = (n: number) => formatNumber(n, lang);
  const ok = x.have >= x.goal;
  const vars = Object.fromEntries(Object.entries(x.vars ?? {}).map(([k, v]) => [k, typeof v === "number" ? nf(v) : v]));
  const title = jt(x.key as JKey, vars);
  const status = ok ? jt("done") : x.goal === 100 && !x.q ? jt("pctDone", { p: x.have }) : x.q ? jt("notMarked") : `${nf(x.have)} / ${nf(x.goal)}`;
  // qirāʾāt steps are marked by the learner; a mark can be taken back only on the day it was set
  const canToggle = !!x.q && (!j.q[x.q] || j.q[x.q] === dayNum());
  const press = x.q ? (canToggle ? () => toggleQiraat(x.q!) : undefined) : x.href ? () => router.push(x.href as Href) : undefined;
  return (
    <Pressable onPress={press} disabled={!press} accessibilityRole={press ? (x.q ? "checkbox" : "button") : undefined} accessibilityState={x.q ? { checked: ok } : undefined} accessibilityLabel={`${title}, ${status}`}
      style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, minHeight: 60, backgroundColor: pressed ? t.bg : t.surface }, !first && { borderTopWidth: 1, borderTopColor: t.line }]}>
      <View style={{ width: 36, height: 36, borderRadius: R.md, backgroundColor: ok ? "rgba(201,166,94,0.18)" : t.accentSoft, alignItems: "center", justifyContent: "center" }}>
        <Icon name={ok ? "check" : AREA_ICON[x.area]} color={ok ? t.gold : t.accent} size={18} />
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, lineHeight: 20, color: t.ink }}>{title}</Text>
        {!ok && !x.q ? <GoldProgress value={x.goal ? x.have / x.goal : 0} /> : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: ok ? t.gold : t.muted }}>{x.q && !ok ? jt("tapToMark") : status}</Text>
      </View>
      {x.q ? <Icon name={ok ? "checkCircle" : "plus"} color={ok ? t.gold : t.muted} size={20} /> : press ? <Icon name="chevronRight" color={t.muted} size={16} /> : null}
    </Pressable>
  );
}

/** the entry card on the Masterclass tab */
export function JourneyEntryCard() {
  const jt = useJT();
  const { lang } = useLang();
  const { M, current } = useJourneyData();
  const mt = useMarhalaTitle();
  const cur = marhala(current, M);
  const frac = fracOf(cur);
  const pts = marhalaPoints(cur);
  return (
    <Pressable onPress={() => router.push("/journey" as Href)} accessibilityRole="button" accessibilityLabel={`${jt("title")}: ${jt("marhalaN", { n: current })}, ${mt(current)}`}
      style={{ borderRadius: R.card, overflow: "hidden", backgroundColor: stage.bg, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)", padding: 20, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={12} color={stage.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, color: stage.gold }}>{jt("eyebrow")}</Text></View>
        <Text style={{ fontFamily: CALLIG_FONT, fontSize: 20, lineHeight: 34, color: stage.gold }}>{"رحلة العلم"}</Text>
      </View>
      <Text style={{ fontFamily: FONT.display, fontSize: 26, lineHeight: 30, color: "#fff" }}>{jt("title")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft }}>{jt("entryLead")}</Text>
      <View style={{ gap: 6, marginTop: 4 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.cream }}>{`${jt("marhalaN", { n: formatNumber(current, lang) })} · ${mt(current)} · ${jt("levelN", { n: formatNumber(M.rank.level, lang) })}`}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted }}>{jt("towardNext", { a: formatNumber(pts[0], lang), b: formatNumber(pts[1], lang), n: current + 1 })}</Text>
        <GoldProgress value={frac} track="rgba(255,255,255,0.12)" />
      </View>
      <View style={{ marginTop: 6, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1, borderColor: stage.gold }}>
        <Icon name="map" size={16} color={stage.gold} />
        <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: stage.gold }}>{jt("openMap")}</Text>
      </View>
    </Pressable>
  );
}
