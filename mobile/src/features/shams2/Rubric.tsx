import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FONT, R, useTheme } from "@/lib/theme";
import { RUBRIC_FIELDS, noteRubric, useRubric, type RubricField, type RubricScores } from "./store2";
import { useRec } from "./rec/text";
import { Btn } from "./ui";

// The learner's own pronunciation rating after the A/B comparison (Shams 3.0): makhārij, tajweed rules, stopping and
// starting, pace – 1 to 5 each, saved in rubric.v1 as "self". It is labelled as an own assessment, never computed
// from speech recognition; a teacher's rating of the same verse is shown and takes precedence in the mastery view.
export function Rubric({ verseKey }: { verseKey: string }) {
  const t = useTheme();
  const { r, nf } = useRec();
  const all = useRubric();
  const entry = all[verseKey];
  const [scores, setScores] = useState<RubricScores>({});
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const own = entry?.self;
    setScores(own ? Object.fromEntries(RUBRIC_FIELDS.filter((f) => typeof own[f] === "number").map((f) => [f, own[f]])) : {});
    setSaved(false);
  }, [verseKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const teacher = entry?.teacher;
  const tVals = teacher ? RUBRIC_FIELDS.map((f) => teacher[f]).filter((x): x is number => typeof x === "number") : [];
  const set = (f: RubricField, v: number) => { setScores((s) => ({ ...s, [f]: v })); setSaved(false); };
  return (
    <View style={{ gap: 10 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{r("rbTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{r("rbLead")}</Text>
      {tVals.length ? (
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.accent }}>
          {r("rbTeacher", { by: teacher?.by ?? "–", v: nf(Math.round((tVals.reduce((a, b) => a + b, 0) / tVals.length) * 10) / 10) })}
        </Text>
      ) : null}
      {RUBRIC_FIELDS.map((f) => (
        <View key={f} style={{ gap: 6 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.ink }}>{r(`rb_${f}` as never)}</Text>
          <View style={{ flexDirection: "row", gap: 6 }} accessibilityRole="radiogroup" accessibilityLabel={r(`rb_${f}` as never)}>
            {[1, 2, 3, 4, 5].map((v) => {
              const on = scores[f] === v;
              return (
                <Pressable key={v} onPress={() => set(f, v)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${r(`rb_${f}` as never)} ${v}`}
                  style={{ flex: 1, height: 34, borderRadius: R.pill, borderWidth: 1, borderColor: on ? "rgb(201,166,94)" : t.line, backgroundColor: on ? "rgba(201,166,94,0.18)" : t.surface, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: on ? t.gold : t.ink }}>{nf(v)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
      <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted }}>{r("rbScale")}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Btn title={r("rbSave")} disabled={!Object.keys(scores).length} onPress={() => { if (noteRubric(verseKey, scores, "self")) setSaved(true); }} />
        {saved ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.accent }}>{r("rbSaved")}</Text> : null}
      </View>
    </View>
  );
}
