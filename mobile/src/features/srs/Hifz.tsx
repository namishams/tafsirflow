import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { GoldCard, Segmented } from "@/components/brand";
import { useLang } from "@/i18n";
import { getChapters, type Chapter } from "@/lib/quran";
import { useStored } from "@/lib/store";
import { FONT, R, useTheme } from "@/lib/theme";
import { VERSE_COUNTS } from "@/web/counts";
import { recall as verseRecall, today, type Srs } from "@/web/learning";
import { JUZ_START, TOTAL_VERSES, indexOf } from "@/web/quranIndex";
import { BigButton, CourseHero } from "../coursekit/ui";
import { strengthOf } from "./fsrs";
import { useIntl } from "./format";
import { useSrsState } from "./store";
import { useSrsT } from "./texts";

// /cards/hifz – how well each surah and juz is known: a verse counts when it is in the verse reviews of the reader
// (web/learning.ts, "tf:srs") or is a verse card here. Cell colour = share of verses known × average recall today.
type Cell = { id: number; known: number; total: number; strength: number };

const juzRange = (j: number) => {
  const from = indexOf(...(JUZ_START[j - 1].split(":").map(Number) as [number, number]));
  const to = j < 30 ? indexOf(...(JUZ_START[j].split(":").map(Number) as [number, number])) : TOTAL_VERSES;
  return [from, to] as const;
};

export function useHifzCells() {
  const verseSrs = useStored<Srs>("tf:srs", {});
  const s = useSrsState();
  return useMemo(() => {
    const day = today();
    const known = new Map<number, number>(); // verse index -> recall 0…1
    for (const [k, e] of Object.entries(verseSrs)) {
      const [a, b] = k.split(":").map(Number);
      if (!a || !b) continue;
      const r = e.s !== undefined && e.last !== undefined ? verseRecall(e.s, day - e.last) : 0.8;
      known.set(indexOf(a, b), r);
    }
    for (const [id, c] of Object.entries(s.cards)) {
      if (!c.m || !(id.startsWith("verse:") || id.startsWith("dua:"))) continue;
      const [a, b] = id.split(":").slice(1).map(Number);
      const i = indexOf(a, b);
      known.set(i, Math.max(known.get(i) ?? 0, strengthOf(c.m, day)));
    }
    const cell = (id: number, from: number, to: number): Cell => {
      let n = 0, sum = 0;
      for (let i = from; i < to; i++) { const r = known.get(i); if (r !== undefined) { n++; sum += r; } }
      return { id, known: n, total: to - from, strength: n ? sum / n : 0 };
    };
    const surahs = VERSE_COUNTS.map((c, i) => cell(i + 1, indexOf(i + 1, 1), indexOf(i + 1, 1) + c));
    const juz = Array.from({ length: 30 }, (_, i) => { const [a, b] = juzRange(i + 1); return cell(i + 1, a, b); });
    return { surahs, juz };
  }, [verseSrs, s]);
}

export function HifzScreen() {
  const t = useTheme();
  const st = useSrsT();
  const nf = useIntl();
  const { lang } = useLang();
  const { surahs, juz } = useHifzCells();
  const [mode, setMode] = useState<"juz" | "surah">("juz");
  const [sel, setSel] = useState<number | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const cells = mode === "juz" ? juz : surahs;
  const cur = sel ? cells[sel - 1] : null;
  const name = (c: Cell) => (mode === "juz" ? st("juzN", { n: nf(c.id) }) : chapters[c.id - 1] ? `${nf(c.id)}. ${chapters[c.id - 1].name_simple}` : st("surahN", { n: nf(c.id) }));
  const shade = (c: Cell) => {
    const v = c.total ? (c.known / c.total) * (0.4 + 0.6 * c.strength) : 0;
    return v <= 0 ? t.line : `rgba(${t.dark ? "58,190,146" : "6,108,78"},${0.18 + v * 0.82})`;
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 56 }}>
        <CourseHero back title={st("hifz")} lead={st("hifzLead")} />
        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 16 }}>
          <Segmented value={mode} options={[["juz", st("byJuz")], ["surah", st("bySurah")]]} onChange={(m) => { setMode(m); setSel(null); }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {cells.map((c) => (
              <Pressable key={c.id} onPress={() => setSel(c.id)} accessibilityRole="button" accessibilityState={{ selected: sel === c.id }}
                accessibilityLabel={`${name(c)}, ${st("learnedOf", { n: nf(c.known), total: nf(c.total) })}`}
                style={{ width: mode === "juz" ? 52 : 34, height: mode === "juz" ? 52 : 34, borderRadius: R.sm, backgroundColor: shade(c), alignItems: "center", justifyContent: "center", borderWidth: sel === c.id ? 2 : 0, borderColor: t.gold }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: mode === "juz" ? 13 : 10.5, color: c.known ? "#fff" : t.muted }}>{nf(c.id)}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{st("legend")}</Text>
          {cur ? (
            <GoldCard star={false} style={{ alignItems: "stretch", gap: 8 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "left" }}>{name(cur)}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "left" }}>{st("learnedOf", { n: nf(cur.known), total: nf(cur.total) })}</Text>
              <BigButton title={mode === "juz" ? st("juzExam") : st("surahExam")} variant="outline" onPress={() => router.push(`/tests/${mode}?ref=${cur.id}` as Href)} />
            </GoldCard>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
