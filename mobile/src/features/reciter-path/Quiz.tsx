import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { GoldButton, OutlineButton } from "@/components/brand";
import { FONT, R, useTheme } from "@/lib/theme";
import type { TapItem } from "./curriculum";
import { useContent } from "./content";
import { useRpT } from "./texts";
import { VerseWords } from "./Practice";
import { useVerse } from "./useVerse";

export type Question = { kind: "tap"; item: TapItem } | { kind: "mcq"; q: string; options: string[]; answer: number };

/** a stable order of the options (the content lists the right answer first) */
function order(n: number, seed: string) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}

function TapQuestion({ item, picked, setPicked, revealed }: { item: TapItem; picked: number[]; setPicked: (p: number[]) => void; revealed: boolean }) {
  const t = useTheme();
  const rt = useRpT();
  const c = useContent();
  const { verse, error } = useVerse(item.key);
  return (
    <View style={{ gap: 14 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 17, lineHeight: 24, color: t.ink }}>{rt("tapPrompt", { rule: c.rules[item.rule].name })}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{item.key}</Text>
      {verse ? (
        <VerseWords verse={verse} picked={picked} mark={revealed ? item.answer : undefined}
          onWord={revealed ? undefined : (pos) => setPicked(picked.includes(pos) ? picked.filter((x) => x !== pos) : [...picked, pos])} />
      ) : error ? <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{rt("offline")}</Text> : <ActivityIndicator color={t.accent} />}
    </View>
  );
}

/** unit test or level exam: one question at a time, answer checked with feedback, score at the end */
export function Quiz({ questions, seed, onDone }: { questions: Question[]; seed: string; onDone: (score: number) => void }) {
  const t = useTheme();
  const rt = useRpT();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [right, setRight] = useState(0);
  const q = questions[i];
  const ord = useMemo(() => (q?.kind === "mcq" ? order(q.options.length, `${seed}:${i}`) : []), [q, seed, i]);
  if (!q) return null;

  const isRight = q.kind === "tap"
    ? picked.length === q.item.answer.length && q.item.answer.every((a) => picked.includes(a))
    : choice === q.answer;
  const check = () => { setRevealed(true); if (isRight) setRight((r) => r + 1); };
  const next = () => {
    if (i + 1 >= questions.length) { onDone(right / questions.length); return; }
    setI(i + 1); setPicked([]); setChoice(null); setRevealed(false);
  };

  return (
    <View style={{ gap: 16 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, color: t.gold }}>{`${i + 1} / ${questions.length}`}</Text>
      {q.kind === "tap" ? <TapQuestion item={q.item} picked={picked} setPicked={setPicked} revealed={revealed} /> : (
        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 17, lineHeight: 24, color: t.ink }}>{q.q}</Text>
          {ord.map((k) => {
            const sel = choice === k;
            const good = revealed && k === q.answer;
            const bad = revealed && sel && k !== q.answer;
            return (
              <Pressable key={k} disabled={revealed} onPress={() => setChoice(k)} accessibilityRole="radio" accessibilityState={{ selected: sel }}
                style={{ padding: 14, borderRadius: R.lg, borderWidth: 1.5, borderColor: good ? t.accent : bad ? "rgb(220,38,38)" : sel ? t.gold : t.line, backgroundColor: good ? t.accentSoft : t.surface }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{q.options[k]}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {revealed ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.bold, fontSize: 15, color: isRight ? t.accent : "rgb(220,38,38)" }}>{isRight ? rt("correct") : rt("wrong")}</Text> : null}
      {revealed
        ? <GoldButton title={i + 1 >= questions.length ? rt("finish") : rt("next")} onPress={next} />
        : <OutlineButton title={rt("check")} onPress={check} disabled={q.kind === "tap" ? picked.length === 0 : choice === null} />}
    </View>
  );
}
