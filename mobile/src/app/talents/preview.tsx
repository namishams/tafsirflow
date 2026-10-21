import { useMemo, useState } from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { usePro } from "@/lib/pro";
import { buildSummary } from "@/features/sijill/summary";
import { SijillShowcase, TreeBanner } from "@/features/sijill/Showcase";
import { MomentCard } from "@/features/sijill/Moments";
import { useST } from "@/features/sijill/text";
import type { Moment, Sijill, Summary } from "@/features/sijill/api";
import { Muted } from "@/features/talents/ui";

// /talents/preview?view=mine|other|moments|friends – development only (__DEV__): renders the Sijill components with the
// record computed on this device ("mine") or clearly marked sample data, for design review and store screenshots before
// the endpoints are deployed. Not reachable in release builds.
const toSijill = (s: Summary, all: boolean): Sijill => ({
  updatedAt: new Date().toISOString(), reactions: all ? 0 : 47, moments: all ? 0 : 12,
  level: { xp: s.level.xp, level: s.level.level, talentLevel: "talent", stage: s.rank.stage, rank: s.rank.rank, overall: s.rank.overall },
  hifz: s.hifz, tree: s.tree.type ? s.tree : undefined, stickers: s.stickers, memorised: s.memorised, time: s.time,
  activity: { xp: s.level.xp, level: s.level.level, week: s.week.xp, active: s.week.active }, courses: s.courses,
  sharer: { tier: 2, shares: 14 }, certificates: [], exams: [],
});
const SAMPLE: Summary = {
  v: 1, level: { xp: 6840, level: 14 }, rank: { stage: "idadi", rank: "mutaqaddim", overall: 88 },
  hifz: { grade: 4, verses: 1240, tests: 9, quality: null },
  tree: { type: "olive", stage: 8, trees: 2, fruits: 36, name: "Nur", days: 213 },
  stickers: { total: 1460, catalog: 7120, feed: 41, rare: 120, epic: 31, legendaryN: 4, legendary: ["j:30", "s:36", "n:1", "p:25"], series: ["juz", "months"] },
  memorised: { verses: 1240, juz: [100, 64, 12, ...Array(26).fill(0), 100], surahs: [100, 40, ...Array(64).fill(0), ...Array(48).fill(100)], current: 18 },
  time: { totalMin: 9120, weekMin: 312, streak: 41, best: 66, wird: 38 },
  week: { monday: 0, xp: [120, 210, 90, 260, 180, 0, 140], active: 6 },
  courses: { done: 5, ids: ["seerah", "aqidah", "adhkar"], qaida: 42, arabic: 28, rp: 17, arLevels: ["A1", "A2"] },
  goal: { minutes: 30, focus: "hifz" },
};
const momentsSample = (st: ReturnType<typeof useST>): Moment[] => {
  const a = (name: string, username: string) => ({ username, name: `${name} (${st("sijill")})`, badge: null, avatar: null });
  const base = { at: new Date().toISOString(), title: null, own: false, total: 0, mine: null };
  return [
    { ...base, id: "p1", kind: "juz", ref: "J30", data: { n: 30 }, author: a("Amina", "sample.amina"), counts: { like: 12, mashallah: 9, barakallah: 4, barik: 2 }, mine: "mashallah" },
    { ...base, id: "p2", kind: "exam", ref: "qbank:1", data: { exam: "qbank", ref: "1", pct: 92 }, author: a("Yusuf", "sample.yusuf"), counts: { like: 6, mashallah: 3, barakallah: 1, barik: 0 } },
    { ...base, id: "p3", kind: "tree", ref: "palm:9", data: { type: "palm", n: 9 }, author: a("Maryam", "sample.maryam"), counts: { like: 4, mashallah: 2, barakallah: 0, barik: 1 } },
    { ...base, id: "p4", kind: "streak", ref: "D30", data: { n: 30 }, author: a("Bilal", "sample.bilal"), counts: { like: 8, mashallah: 5, barakallah: 2, barik: 3 } },
    { ...base, id: "p5", kind: "hifz", ref: "G4", data: { n: 4 }, author: a("Khadija", "sample.khadija"), counts: { like: 3, mashallah: 4, barakallah: 1, barik: 0 } },
  ] as Moment[];
};

export default function SijillPreview() {
  const st = useST();
  const { pro } = usePro();
  const { view } = useLocalSearchParams<{ view?: string }>();
  const mine = useMemo(() => { try { return buildSummary(pro); } catch { return SAMPLE; } }, [pro]);
  const [moments, setMoments] = useState(() => momentsSample(st));
  if (!__DEV__) return <Page><Muted>{st("nothingYet")}</Muted></Page>;
  const v = view ?? "mine";
  const s = v === "mine" ? toSijill(mine.tree.type ? mine : { ...mine, tree: SAMPLE.tree }, true) : toSijill(SAMPLE, false);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset arcade={false} eyebrow={st("sijill")} title={v === "friends" ? st("friends") : v === "moments" ? st("tabMoments") : st("title")} lead={v === "mine" ? st("leadMine") : v === "friends" ? st("friendsLead") : st("lead")} />
        <View style={{ padding: 16, gap: 14 }}>
          {v === "friends" || v === "moments" ? moments.map((m) => <MomentCard key={m.id} m={m} showAuthor={v === "friends"} onChange={(x) => setMoments((l) => l.map((y) => (y.id === x.id ? x : y)))} />) : (
            <>
              {s.tree ? <TreeBanner tree={s.tree} /> : null}
              <SijillShowcase s={s} mine={v === "mine"} name={v === "mine" ? "" : "Amina"} username={v === "mine" ? "preview" : "sample.amina"} noTree />
            </>
          )}
        </View>
      </Page>
    </>
  );
}
