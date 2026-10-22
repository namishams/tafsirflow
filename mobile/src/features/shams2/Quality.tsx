import { useMemo, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Segmented } from "@/components/brand";
import { FONT, R, useTheme } from "@/lib/theme";
import { useIntl } from "@/features/srs/format";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { usePageMap } from "./pages";
import { levelOf, pageCells, verseScore, type Cell } from "./qualityModel";
import { useS2 } from "./text";
import { Btn, Card, LevelPill, SourceNote, Term, onScore, scoreColor } from "./ui";
import { masteryOf } from "./mastery";
import { MasteryCard } from "./review/Mastery";
import { useRv } from "./review/text";

// /shams/quality – hifz quality (itqān) as a heatmap over the 604 pages of the Madani mushaf, the 114 surahs or the
// 30 ajzāʾ. Tap a cell for its score, how it is made up and its weakest verses.
type Mode = "page" | "surah" | "juz";

export function QualityScreen({ juz: initialJuz }: { juz?: number }) {
  const t = useTheme();
  const { s } = useS2();
  const nf = useIntl();
  const { width } = useWindowDimensions();
  const { name } = useSurahNames();
  const m = useShams2();
  const [mode, setMode] = useState<Mode>(initialJuz ? "juz" : "page");
  const [sel, setSel] = useState<number | null>(initialJuz ?? null);
  const surahsWithVerses = useMemo(() => m.q.surahs.filter((c) => c.known > 0).map((c) => c.id), [m.q.surahs]);
  const pages = usePageMap(surahsWithVerses);
  const pageList = useMemo(() => pageCells(pages, m.q.scores), [pages, m.q.scores]);
  const cells: Cell[] = mode === "page" ? pageList : mode === "surah" ? m.q.surahs : m.q.juz;
  const cur = sel ? cells[sel - 1] : null;
  const inner = Math.min(width, 860) - 32;
  const cols = mode === "page" ? 20 : mode === "surah" ? 12 : 6;
  const gap = mode === "page" ? 2 : 4;
  const size = Math.floor((inner - gap * (cols - 1)) / cols);
  const label = (c: Cell) => (mode === "page" ? s("pageN", { n: nf(c.id) }) : mode === "surah" ? `${nf(c.id)}. ${name(c.id)}` : s("juzN", { n: nf(c.id) }));
  const rv = useRv();
  // Shams 3.0: the six dimensions of the selected cell (a page: its verses), or of all verses
  const mcell = useMemo(() => {
    const mm = m.mastery();
    if (!cur) return mm.overall;
    if (mode === "surah") return mm.surahs[cur.id - 1];
    if (mode === "juz") return mm.juz[cur.id - 1];
    const keys: string[] = [];
    for (const [sr, list] of Object.entries(pages)) list.forEach((p, i) => { if (p === cur.id) keys.push(`${sr}:${i + 1}`); });
    return masteryOf(keys, mm.verses, cur.id);
  }, [m, cur, mode, pages]);
  const mAt = useMemo(() => {
    const k = cur?.weakest[0]?.key ?? (mode === "surah" && cur ? `${cur.id}:1` : [...m.known.keys()][0] ?? "1:1");
    const [a, b] = k.split(":").map(Number);
    return { s: a || 1, v: b || 1 };
  }, [cur, mode, m.known]);
  const parts = useMemo(() => {
    if (!cur) return null;
    const ks = cur.weakest.map((w) => m.known.get(w.key)).filter(Boolean);
    if (!ks.length) return null;
    const v = ks.map((k) => verseScore(k!, { words: m.words, checks: m.checks, mut: m.mut }));
    const avg = (f: (x: (typeof v)[number]) => number | null) => { const xs = v.map(f).filter((x): x is number => x !== null); return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) : null; };
    return { recall: avg((x) => x.recall), maturity: avg((x) => x.maturity), accuracy: avg((x) => x.accuracy), steadiness: avg((x) => x.steadiness) };
  }, [cur, m]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="الإتْقان" title={s("qualityTitle")} lead={s("qualityLead")} />
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: scoreColor(t, m.q.overall), alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(201,166,94,0.6)" }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 22, color: onScore(m.q.overall) ?? t.ink }}>{m.q.overall === null ? "–" : nf(m.q.overall)}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{s("overall")}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "left" }}>{s("versesMemorised", { n: nf(m.q.count) })}</Text>
              <LevelPill level={levelOf(m.q.overall)} />
            </View>
          </View>
          <Segmented value={mode} options={[["page", s("byPage")], ["surah", s("bySurah")], ["juz", s("byJuz")]]} onChange={(x) => { setMode(x); setSel(null); }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap }} accessibilityLabel={s("heatmap")}>
            {cells.map((c) => {
              const on = sel === c.id;
              return (
                <Pressable key={c.id} onPress={() => setSel(c.id)} accessibilityRole="button" accessibilityState={{ selected: on }}
                  accessibilityLabel={`${label(c)}, ${c.score === null ? s("notYet") : s("scoreP", { p: nf(c.score) })}`}
                  style={{ width: size, height: mode === "page" ? Math.round(size * 1.35) : size, borderRadius: mode === "page" ? 2 : R.sm, backgroundColor: scoreColor(t, c.score), borderWidth: on ? 2 : 0, borderColor: t.gold, alignItems: "center", justifyContent: "center" }}>
                  {mode !== "page" ? <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: mode === "juz" ? 13 : 10, color: onScore(c.score) ?? t.muted }}>{nf(c.id)}</Text> : null}
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {[null, 20, 55, 80, 95].map((v, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: scoreColor(t, v) }} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted }}>{s(`lv_${levelOf(v)}` as never)}</Text>
              </View>
            ))}
          </View>
          {mode === "page" ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "left" }}>{s("pageNote")}</Text> : null}
          {cur ? (
            <Card gold>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "left" }}>{label(cur)}</Text>
                <LevelPill level={levelOf(cur.score)} />
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "left" }}>{cur.score === null ? s("notYet") : `${s("scoreP", { p: nf(cur.score) })} · ${s("knownOf", { n: nf(cur.known), total: nf(cur.total) })}`}</Text>
              {parts ? (
                <View style={{ gap: 6 }}>
                  {([["recall", parts.recall], ["maturity", parts.maturity], ["accuracy", parts.accuracy], ["steadiness", parts.steadiness]] as const).map(([k, v]) => (
                    <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ width: 120, fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{s(`part_${k}` as never)}</Text>
                      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: t.line, overflow: "hidden" }}><View style={{ width: `${v ?? 0}%`, height: 6, backgroundColor: t.accent }} /></View>
                      <Text style={{ width: 36, fontFamily: FONT.semibold, fontSize: 12, color: t.ink, textAlign: "right" }}>{v === null ? "–" : nf(v)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {cur.weakest.length ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{s("weakestHere")}</Text> : null}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {cur.weakest.map((w) => {
                  const [a, b] = w.key.split(":");
                  return <Btn key={w.key} title={`${name(Number(a))} ${nf(Number(b))} · ${nf(w.score)}`} onPress={() => router.push(`/shams/talaqqi?s=${a}&v=${b}` as Href)} />;
                })}
              </View>
              {cur.known ? <Btn primary title={s("drillWeak")} onPress={() => router.push((mode === "surah" ? `/shams/weak?s=${cur.id}` : "/shams/weak") as Href)} /> : null}
            </Card>
          ) : null}
          <MasteryCard cell={mcell} scope={cur ? label(cur) : rv("mOverall")} at={mAt} />
          <View style={{ gap: 10 }}><Term id="itqan" /><Term id="juz" /></View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 20, color: t.muted, textAlign: "left" }}>{s("qualityHow")}</Text>
          <SourceNote src={["app", "fsrs", "quranApi"]} review={{ status: "draft" }} />
        </View>
      </Page>
    </>
  );
}
