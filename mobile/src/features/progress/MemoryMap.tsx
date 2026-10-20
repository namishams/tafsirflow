import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { VERSE_COUNTS } from "@/web/counts";
import { JUZ_START, TOTAL_VERSES, indexOf, keyAt } from "@/web/quranIndex";
import { readSrs, strength, type Srs } from "@/web/learning";
import { NOT_COUNTED } from "@/web/coach";
import { fill, journeyText } from "@/web/journey";
import { alpha, RED } from "./art";
import { useChapterNames, useLive } from "./hooks";
import { go } from "./links";
import { SurahQuiz } from "./SurahQuiz";
import { GoldPill, InkSegmented, Kicker, OutlinePill } from "./ui";

// Quran map (website: MemoryMap.tsx): every box is a surah, a juz or a verse; the colour shows how well you know it
// right now. Green sits, gold wobbles, red is difficult, grey is not learned yet.
type Level = "none" | "weak" | "mid" | "strong";
const levelOf = (s: number | null): Level => (s === null ? "none" : s >= 0.8 ? "strong" : s >= 0.5 ? "mid" : "weak");

function verseStrength(srs: Srs, key: string): number | null {
  const e = srs[key];
  if (!e) return null;
  const lapsePenalty = Math.min(0.3, (e.lapses ?? 0) * 0.05); // verses you often got wrong count as harder
  return Math.max(0, strength(e) - lapsePenalty);
}

// example progress for visitors: the short surahs at the end are learned first, a few longer ones in progress
function demoSrs(): Srs {
  const out: Srs = {};
  const t0 = Math.floor(Date.now() / 86400000);
  const put = (s: number, from: number, to: number, stg: number, overdue: number, lapses = 0) => { for (let v = from; v <= to; v++) out[`${s}:${v}`] = { stage: stg, due: t0 - overdue, last: t0 - overdue - 1, lapses }; };
  for (let s = 100; s <= 114; s++) put(s, 1, VERSE_COUNTS[s - 1], 4, 0);
  put(1, 1, 7, 5, 0);
  for (let s = 93; s <= 99; s++) put(s, 1, VERSE_COUNTS[s - 1], s % 2 ? 3 : 2, s % 3 ? 2 : 9, s === 96 ? 3 : 0);
  for (let s = 87; s <= 92; s++) put(s, 1, Math.ceil(VERSE_COUNTS[s - 1] / (s % 2 ? 1 : 2)), 1, 6, s === 89 ? 4 : 1);
  put(36, 1, 30, 2, 5, 1); put(67, 1, 30, 3, 1); put(18, 1, 10, 1, 12, 3); put(2, 255, 257, 4, 0); put(55, 1, 40, 2, 4);
  return out;
}

/** cells of equal size that fill the width: at least `min` points wide (CSS repeat(auto-fill, minmax(min, 1fr))) */
function useCells(width: number, min: number, gap: number, fixedCols?: number) {
  const cols = fixedCols ?? Math.max(1, Math.floor((width + gap) / (min + gap)));
  // rounded down to half a point, so pixel rounding never pushes the last cell of a row onto the next one
  return { cols, size: width ? Math.floor(((width - gap * (cols - 1)) / cols) * 2) / 2 : 0 };
}

export type MemoryMapProps = {
  /** surah boxes without numbers (for small embeds like the Today tab) */
  compact?: boolean;
  /** a clearly marked example map instead of the learner's own (signed out / nothing learned yet) */
  demo?: boolean;
  /** drawn on the dark stage */
  dark?: boolean;
};

export function MemoryMap({ compact = false, demo = false, dark = false }: MemoryMapProps) {
  const t = useTheme();
  const tr = useWebT("map");
  const { lang } = useLang();
  const J = journeyText(lang).map;
  const name = useChapterNames();
  const srs = useLive(() => (demo ? demoSrs() : readSrs()), [demo]);
  const [mode, setMode] = useState<"surah" | "juz">("surah");
  const [open, setOpen] = useState<number | null>(null);
  const [quiz, setQuiz] = useState(false);
  const [gridW, setGridW] = useState(0);
  const [verseW, setVerseW] = useState(0);

  const COLOR: Record<Level, string> = { none: t.line, weak: alpha(RED, 0.8), mid: alpha(t.gold, 0.7), strong: t.accent };

  // aggregate: average strength over all verses of the unit (unlearned verses count as 0) + share learned
  const unit = (from: number, to: number) => {
    let sum = 0, learned = 0;
    for (let i = from; i < to; i++) { const k = keyAt(i); const s = verseStrength(srs, `${k.s}:${k.v}`); if (s !== null) { learned++; sum += s; } }
    const n = to - from;
    return { learned, n, avg: learned ? sum / learned : null, cover: learned / n };
  };
  const surahs = useMemo(() => VERSE_COUNTS.map((c, i) => ({ id: i + 1, ...unit(indexOf(i + 1, 1), indexOf(i + 1, 1) + c) })), [srs]); // eslint-disable-line react-hooks/exhaustive-deps
  const juz = useMemo(() => JUZ_START.map((k, i) => {
    const [s, v] = k.split(":").map(Number); const from = indexOf(s, v);
    const to = i < 29 ? indexOf(...(JUZ_START[i + 1].split(":").map(Number) as [number, number])) : TOTAL_VERSES;
    return { id: i + 1, ...unit(from, to) };
  }), [srs]); // eslint-disable-line react-hooks/exhaustive-deps
  const totals = useMemo(() => {
    const vals = Object.keys(srs).filter((k) => !NOT_COUNTED.has(k)).map((k) => levelOf(verseStrength(srs, k)));
    return { strong: vals.filter((x) => x === "strong").length, mid: vals.filter((x) => x === "mid").length, weak: vals.filter((x) => x === "weak").length };
  }, [srs]);
  const list = mode === "surah" ? surahs : juz;

  // the open surah: next verse to learn, weak and wobbling verses, learned verses (basmala of al-Fatiha excluded)
  const detail = useMemo(() => {
    if (open === null) return null;
    const weak: number[] = [], mid: number[] = [], learned: number[] = [];
    let next: number | null = null;
    for (let v = 1; v <= VERSE_COUNTS[open - 1]; v++) {
      const key = `${open}:${v}`;
      if (NOT_COUNTED.has(key)) continue;
      const lv = levelOf(verseStrength(srs, key));
      if (lv === "none") { next ??= v; continue; }
      learned.push(v);
      if (lv === "weak") weak.push(v); else if (lv === "mid") mid.push(v);
    }
    return { weak, mid, learned, next };
  }, [open, srs]);

  const gap = 4;
  const grid = useCells(gridW, 25.6, gap, mode === "juz" ? (gridW >= 600 ? 10 : 6) : undefined);
  const vgrid = useCells(verseW, 32, gap);
  const sub = dark ? "rgba(255,255,255,0.6)" : t.muted;
  const ink = dark ? "#eef0f3" : t.ink;

  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <InkSegmented dark={dark} value={mode} options={[["surah", tr("surah")], ["juz", tr("juz")]]} onChange={(m) => { setMode(m); setOpen(null); }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {(["strong", "mid", "weak", "none"] as Level[]).map((l) => (
            <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: COLOR[l] }} />
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: dark ? "rgba(255,255,255,0.7)" : t.muted }}>{tr(l)}{l !== "none" ? ` · ${totals[l as "strong"]}` : ""}</Text>
            </View>
          ))}
        </View>
      </View>

      <View onLayout={(e) => setGridW(e.nativeEvent.layout.width)} style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap }}>
        {grid.size ? list.map((u) => {
          const lv = levelOf(u.avg);
          const none = lv === "none";
          const selected = open === u.id && mode === "surah";
          return (
            <Pressable key={`${mode}-${u.id}`}
              onPress={() => { if (mode === "surah") { setOpen(open === u.id ? null : u.id); setQuiz(false); } }}
              onLongPress={mode === "surah" ? () => go(`/surah/${u.id}`) : undefined}
              accessibilityRole={mode === "surah" ? "button" : "text"}
              accessibilityLabel={mode === "surah" ? `${u.id}. ${name(u.id)} – ${u.learned}/${u.n}, ${tr(lv)}` : `Juz ${u.id} – ${u.learned}/${u.n}, ${tr(lv)}`}
              accessibilityState={mode === "surah" ? { expanded: selected } : undefined}
              style={({ pressed }) => [{ width: grid.size, height: grid.size, borderRadius: 4, alignItems: "center", justifyContent: "center",
                backgroundColor: none ? (dark ? "rgba(255,255,255,0.1)" : COLOR.none) : COLOR[lv], opacity: !none && u.cover < 0.5 ? 0.6 : 1, transform: [{ scale: pressed ? 1.1 : 1 }] }]}>
              {mode === "juz" || !compact ? <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 10, color: none ? (dark ? "rgba(255,255,255,0.4)" : alpha(t.muted, 0.6)) : "#ffffff" }}>{u.id}</Text> : null}
              {selected ? <View pointerEvents="none" style={{ position: "absolute", top: -3, left: -3, right: -3, bottom: -3, borderRadius: 6, borderWidth: 2, borderColor: dark ? "#ffffff" : t.ink }} /> : null}
            </Pressable>
          );
        }) : null}
      </View>

      {open !== null && mode === "surah" ? (
        <View style={{ marginTop: 20, borderRadius: R.md, borderWidth: 1, borderColor: dark ? "rgba(255,255,255,0.1)" : t.line, backgroundColor: dark ? "rgba(255,255,255,0.04)" : t.surface, padding: 16 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 18, color: ink }}>{open}. {name(open)}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: sub }}>{tr("learnedOf", { n: surahs[open - 1].learned, total: surahs[open - 1].n })}</Text>
          </View>
          <View onLayout={(e) => setVerseW(e.nativeEvent.layout.width)} style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap }}>
            {vgrid.size ? Array.from({ length: VERSE_COUNTS[open - 1] }, (_, i) => {
              const key = `${open}:${i + 1}`, s = verseStrength(srs, key), lv = levelOf(s);
              return (
                <Pressable key={key} onPress={() => go(`/surah/${open}?v=${i + 1}${lv === "none" ? "&shams=1" : "&m=2"}`)} accessibilityRole="link"
                  accessibilityLabel={`${key}${s !== null ? ` · ${Math.round(s * 100)}%` : ""}`}
                  style={({ pressed }) => ({ width: vgrid.size, height: vgrid.size, borderRadius: 4, alignItems: "center", justifyContent: "center", backgroundColor: COLOR[lv], transform: [{ scale: pressed ? 1.1 : 1 }] })}>
                  <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 10, color: lv === "none" ? t.muted : "#ffffff" }}>{i + 1}</Text>
                </Pressable>
              );
            }) : null}
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: dark ? "rgba(255,255,255,0.5)" : t.muted, marginTop: 12 }}>{tr("tapVerse")}</Text>
          {detail ? (
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: dark ? "rgba(255,255,255,0.1)" : t.line }}>
              <Kicker color={dark ? stage.gold : t.gold}>{J.actions}</Kicker>
              <View style={{ marginTop: 10, gap: 8 }}>
                {detail.next !== null
                  ? <GoldPill block pill={false} arrow={false} title={fill(J.learnNext, { key: `${open}:${detail.next}` })} onPress={() => go(`/surah/${open}?v=${detail.next}&shams=1`)} />
                  : <Text style={{ fontFamily: FONT.semibold, fontSize: 14, paddingVertical: 10, color: dark ? stage.gold : t.accent }}>{J.allLearned}</Text>}
                {detail.weak.length > 0
                  ? <OutlinePill block onStage={dark} title={fill(J.repeatWeak, { n: detail.weak.length })} onPress={() => go(`/surah/${open}?v=${detail.weak[0]}&m=2`)} />
                  : detail.mid.length > 0 ? <OutlinePill block onStage={dark} title={fill(J.refreshMid, { n: detail.mid.length })} onPress={() => go(`/surah/${open}?v=${detail.mid[0]}&m=2`)} /> : null}
                <OutlinePill block onStage={dark} title={J.listen} onPress={() => go(`/surah/${open}`)} />
                {!demo && detail.learned.length >= 3 ? <OutlinePill block onStage={dark} active={quiz} title={J.quiz} onPress={() => setQuiz(!quiz)} /> : null}
              </View>
              {!demo && detail.learned.length > 0 && detail.learned.length < 3 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: dark ? "rgba(255,255,255,0.5)" : t.muted, marginTop: 8 }}>{J.quizNeed}</Text> : null}
              {quiz && !demo ? <SurahQuiz key={open} surah={open} learned={detail.learned} dark={dark} onClose={() => setQuiz(false)} /> : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default MemoryMap;
