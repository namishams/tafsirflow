import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ARABIC_FONT, FONT, R, stage, useTheme, AR_RIGHT } from "@/lib/theme";
import { useLang } from "@/i18n";
import { RECITERS, getVerses, type Verse } from "@/lib/quran";
import { noteMistake } from "@/web/learning";
import { fill, journeyText } from "@/web/journey";
import { alpha, RED } from "./art";
import { useNf } from "./hooks";
import { StepIn } from "./motion";
import { GoldPill, Kicker, OutlinePill } from "./ui";

// "Which verse comes next?" – a short quiz on the verses of one surah you have already learned (opened from the surah
// panel of the Quran map; website: SurahQuiz.tsx). You see the end of a learned verse and pick the beginning of the
// verse that follows. The verse text comes from the server, never from the app.
type Q = { v: number; prompt: string; cut: boolean; options: { v: number; text: string }[]; answer: number };

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean);
const head = (t: string, n = 7) => { const w = words(t); return w.length > n ? `${w.slice(0, n).join(" ")} …` : w.join(" "); };

function build(all: Verse[], learned: number[], count = 5): Q[] {
  const byNum = new Map(all.map((v) => [v.verse_number, v]));
  const cands = shuffle(learned.filter((v) => byNum.has(v) && byNum.has(v + 1))).slice(0, count);
  const out: Q[] = [];
  for (const v of cands) {
    const cur = byNum.get(v)!, nxt = byNum.get(v + 1)!;
    const correct = head(nxt.text_uthmani);
    // distractors: preferably verses close by (they sound alike), never the right one or one with the same opening
    const near = shuffle(all.filter((x) => x.verse_number !== v + 1 && x.verse_number !== v && Math.abs(x.verse_number - (v + 1)) <= 5));
    const far = shuffle(all.filter((x) => x.verse_number !== v + 1 && x.verse_number !== v && Math.abs(x.verse_number - (v + 1)) > 5));
    const seen = new Set([correct]);
    const opts: { v: number; text: string }[] = [{ v: v + 1, text: correct }];
    for (const x of [...near, ...far, cur]) {
      if (opts.length >= 3) break;
      const t = head(x.text_uthmani);
      if (seen.has(t)) continue;
      seen.add(t); opts.push({ v: x.verse_number, text: t });
    }
    if (opts.length < 2) continue;
    const w = words(cur.text_uthmani);
    const options = shuffle(opts);
    out.push({ v, prompt: w.slice(-10).join(" "), cut: w.length > 10, options, answer: options.findIndex((o) => o.v === v + 1) });
  }
  return out;
}

export function SurahQuiz({ surah, learned, dark = false, onClose }: { surah: number; learned: number[]; dark?: boolean; onClose: () => void }) {
  const t = useTheme();
  const { lang } = useLang();
  const T = journeyText(lang).quiz;
  const nf = useNf();
  const [all, setAll] = useState<Verse[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [round, setRound] = useState(0);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);

  useEffect(() => {
    let off = false;
    getVerses(surah, lang, RECITERS[0]).then((v) => { if (!off) setAll(v); }).catch(() => { if (!off) setFailed(true); });
    return () => { off = true; };
  }, [surah, lang]);

  // questions are drawn once per round, so a refresh of the map behind the quiz never reshuffles them mid-way
  const learnedRef = useRef(learned);
  learnedRef.current = learned;
  const [built, setBuilt] = useState<Q[] | null>(null);
  useEffect(() => { if (all) setBuilt(build(all, learnedRef.current)); }, [all, round]);
  const qs = built ?? [];
  const q = qs[i];
  const doneAll = qs.length > 0 && i >= qs.length;

  const choose = (n: number) => {
    if (picked !== null || !q) return;
    setPicked(n);
    if (n === q.answer) setRight((x) => x + 1);
    else if (learned.includes(q.v + 1)) noteMistake(`${surah}:${q.v + 1}`); // a slip in a test makes the verse come back sooner
  };
  const again = () => { setRound((r) => r + 1); setI(0); setPicked(null); setRight(0); };

  const ink = dark ? "#eef0f3" : t.ink;
  const sub = dark ? "rgba(255,255,255,0.6)" : t.muted;
  const optStyle = (n: number) => {
    if (picked === null) return { borderColor: dark ? "rgba(255,255,255,0.15)" : t.line, backgroundColor: dark ? "transparent" : t.surface, opacity: 1 };
    if (n === q.answer) return { borderColor: t.accent, backgroundColor: alpha(t.accent, 0.15), opacity: 1 };
    if (n === picked) return { borderColor: alpha(RED, 0.8), backgroundColor: alpha(RED, 0.1), opacity: 1 };
    return { borderColor: dark ? "rgba(255,255,255,0.1)" : t.line, backgroundColor: "transparent", opacity: 0.5 };
  };

  return (
    <View style={{ marginTop: 16, borderRadius: R.md, borderWidth: 1, borderColor: dark ? "rgba(255,255,255,0.1)" : t.line, backgroundColor: dark ? "rgba(8,38,29,0.6)" : t.bg, padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Kicker color={stage.gold}>{T.title}</Kicker>
          {q && !doneAll ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: sub, marginTop: 4 }}>{fill(T.of, { i: nf(i + 1), n: nf(qs.length) })}</Text> : null}
        </View>
        <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8} style={{ paddingHorizontal: 8, paddingVertical: 4, marginTop: -4, marginEnd: -8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: sub }}>{T.close}</Text>
        </Pressable>
      </View>

      {failed ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: sub, marginTop: 12 }}>{T.error}</Text> : null}
      {!failed && !built ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: sub, marginTop: 12 }}>{T.loading}</Text> : null}

      {q && !doneAll ? (
        <StepIn key={`${round}-${i}`}>
          {i === 0 && picked === null ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: sub, marginTop: 8 }}>{T.lead}</Text> : null}
          <View style={{ marginTop: 12, borderRadius: R.sm, borderWidth: 1, borderColor: "rgba(214,180,108,0.25)", backgroundColor: "rgba(214,180,108,0.06)", paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 46, writingDirection: "rtl", textAlign: AR_RIGHT, color: ink }}>
              {q.cut ? "… " : ""}{q.prompt} <Text style={{ color: t.gold }}>﴿{nf(q.v)}﴾</Text>
            </Text>
          </View>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: dark ? "rgba(255,255,255,0.8)" : t.ink, marginTop: 12 }}>{fill(T.prompt, { v: nf(q.v) })}</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {q.options.map((o, n) => (
              <Pressable key={n} onPress={() => choose(n)} disabled={picked !== null} accessibilityRole="button" accessibilityLabel={o.text}
                style={[{ borderRadius: R.sm, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 }, optStyle(n)]}>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 40, writingDirection: "rtl", textAlign: AR_RIGHT, color: ink }}>{o.text}</Text>
              </Pressable>
            ))}
          </View>
          {picked !== null ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12 }}>
              <Text accessibilityLiveRegion="polite" style={{ flex: 1, minWidth: 160, fontFamily: FONT.semibold, fontSize: 14, color: picked === q.answer ? t.accent : dark ? "rgb(232,176,164)" : "rgb(160,58,52)" }}>
                {picked === q.answer ? T.right : fill(learned.includes(q.v + 1) ? T.wrongNote : T.wrong, { v: nf(q.v + 1) })}
              </Text>
              <GoldPill pill={false} arrow={false} title={i + 1 >= qs.length ? T.finish : T.next} onPress={() => { setI(i + 1); setPicked(null); }} />
            </View>
          ) : null}
        </StepIn>
      ) : null}

      {doneAll ? (
        <StepIn style={{ marginTop: 12 }}>
          <Text style={{ fontFamily: FONT.display, fontSize: 24, color: ink }}>{fill(T.result, { c: nf(right), n: nf(qs.length) })}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <GoldPill pill={false} arrow={false} title={T.again} onPress={again} />
            <OutlinePill title={T.close} onPress={onClose} onStage={dark} />
          </View>
        </StepIn>
      ) : null}
      {built && built.length === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: sub, marginTop: 12 }}>{T.error}</Text> : null}
    </View>
  );
}

export default SurahQuiz;
