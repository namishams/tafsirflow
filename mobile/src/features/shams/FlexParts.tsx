import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { BlurView } from "expo-blur";
import { Chip, GoldButton, GoldCard, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import type { Verse } from "@/lib/quran";
import { wordAudioUrl } from "@/web/arabic";
import { useClip } from "@/features/coursekit/audio";
import { maqasidOf, sectionOf, type L, type LL } from "@/features/shams2/maqasid";
import { linkKey, noteLink, noteUnderstand, saveFlex, useFlex } from "@/features/shams2/store2";
import { comprehensionQ, plainTranslation, repeatPauseMs } from "./flex";
import { useVerseRoots } from "./roots";
import { useFlexT } from "./flex/text";

// The pieces of the flexible classic path (Shams 3.0, package 3) for the Shams session (app/shams/[surah].tsx): the
// quick check, the word grid with single-word audio, word loop and roots, "what comes next", the short tafsir first,
// the comprehension question, the transition chips, the card for today's verses in one go and the bottom dock that keeps
// the main action within thumb reach (Liquid Glass on current iOS). The website has the same pieces in
// src/components/learn/shamsflex/Parts.tsx.

type CL = "de" | "en" | "ar";
const useCl = (): CL => { const { lang } = useLang(); return lang === "de" || lang === "ar" ? lang : "en"; };
const pick = (x: L | undefined, cl: CL) => (x ? x[cl] || x.en : "");
const pickL = (x: LL | undefined, cl: CL) => (x ? (x[cl]?.length ? x[cl] : x.en) : []);
const wordsOf = (v: Verse) => v.words.filter((w) => w.char_type_name === "word");

const GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();

/** the main action of the step, at the bottom within thumb reach: a floating glass capsule over the content */
export function ThumbDock({ children, bottom }: { children: ReactNode; bottom: number }) {
  const t = useTheme();
  const body = <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 8 }}>{children}</View>;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingBottom: Math.max(bottom, 12) }}>
      {GLASS ? (
        <GlassView glassEffectStyle="regular" isInteractive tintColor={t.dark ? "rgba(8,38,29,0.55)" : "rgba(255,255,255,0.45)"} style={[d.dock, { borderColor: t.dark ? "rgba(214,180,108,0.28)" : "rgba(201,166,94,0.35)" }]}>{body}</GlassView>
      ) : (
        <View style={[d.dock, { borderColor: t.dark ? "rgba(214,180,108,0.28)" : "rgba(201,166,94,0.35)", backgroundColor: Platform.OS === "android" ? t.surface : "transparent" }]}>
          {Platform.OS === "ios" ? <BlurView intensity={60} tint={t.dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} style={StyleSheet.absoluteFill} /> : null}
          {body}
        </View>
      )}
    </View>
  );
}
const d = StyleSheet.create({
  dock: { borderRadius: 30, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, shadowColor: "#031912", shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
});

/** step 0: "I know this already" – recite from memory, reveal, say honestly whether it sat */
export function QuickCheck({ revealed, placement, disabled = false, onReveal, onPass, onFail }: { revealed: boolean; placement: boolean; disabled?: boolean; onReveal: () => void; onPass: () => void; onFail: () => void }) {
  const f = useFlexT();
  return (
    <View style={{ marginTop: 16, gap: 10 }}>
      {placement ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, lineHeight: 19, color: stage.gold }}>{f("quickPlacement")}</Text> : null}
      <Text style={{ fontFamily: FONT.bold, fontSize: 20, lineHeight: 26, color: "#fff" }}>{f("quickTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: stage.textSoft }}>{f("quickLead")}</Text>
      {!revealed ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          <GoldButton title={f("quickReveal")} icon="eye" onPress={onReveal} />
          <OutlineButton title={f("quickLearn")} onStage onPress={onFail} />
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
          <Pressable onPress={onFail} disabled={disabled} accessibilityRole="button" accessibilityLabel={f("quickFail")} accessibilityState={{ disabled }}
            style={({ pressed }) => [d2.pill, { opacity: disabled ? 0.45 : 1, borderWidth: 1, borderColor: "rgba(214,130,118,0.55)", backgroundColor: pressed ? "rgba(160,58,52,0.2)" : "rgba(160,58,52,0.1)" }]}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: "rgb(236,200,190)" }}>{f("quickFail")}</Text>
          </Pressable>
          <GoldButton title={f("quickPass")} onPress={onPass} disabled={disabled} style={{ flex: 1 }} />
        </View>
      )}
    </View>
  );
}
const d2 = StyleSheet.create({ pill: { flex: 1, height: 52, borderRadius: R.pill, alignItems: "center", justifyContent: "center" } });

/** step 2: every word on its own – tap = the word's own recording (Quran.com word by word, like the website), optional
 *  loop (n times with a pause to repeat), and under each word its root and how often words of that root occur */
export function WordStudy({ verse, surah, activeWord, beforePlay }: { verse: Verse; surah: number; activeWord: number | null; beforePlay: () => void }) {
  const t = useTheme();
  const f = useFlexT();
  const flex = useFlex();
  const [loopOn, setLoopOn] = useState(false);
  const roots = useVerseRoots(surah, verse.verse_number);
  const clip = useClip();
  const [on, setOn] = useState<number | null>(null);
  const loop = useRef<{ pos: number; left: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(0);
  const ref = (pos: number) => `${surah}:${verse.verse_number}:${pos}`;
  const play = (pos: number) => { started.current = Date.now(); clip.play(wordAudioUrl(ref(pos))); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (clip.state === "playing" || clip.state === "loading") return;
    const l = loop.current;
    // the word could not be played (or a fallback spoke instead): no loop over a missing recording
    if (clip.state === "error" || clip.state === "fallback") { if (timer.current) { clearTimeout(timer.current); timer.current = null; } loop.current = null; setOn(null); return; }
    if (clip.state === "idle" && l && l.left > 0) {
      // a pause as long as the word took, then the same word again
      const pause = repeatPauseMs(Date.now() - started.current);
      l.left -= 1;
      timer.current = setTimeout(() => { if (loop.current === l) play(l.pos); }, pause);
      return;
    }
    if (!l || l.left <= 0) { loop.current = null; setOn(null); }
  }, [clip.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const tap = (pos: number) => {
    if (timer.current) clearTimeout(timer.current);
    beforePlay();
    loop.current = loopOn ? { pos, left: Math.max(0, flex.wordLoop - 1) } : null;
    setOn(pos);
    play(pos);
  };
  const words = wordsOf(verse);
  const anyRoot = Object.keys(roots).length > 0;
  return (
    <View style={{ marginTop: 14, gap: 12 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <Chip label={f("wordLoop", { n: flex.wordLoop })} selected={loopOn} onPress={() => setLoopOn((x) => !x)} />
        {loopOn ? [2, 3, 5].map((n) => <Chip key={n} label={`×${n}`} selected={flex.wordLoop === n} onPress={() => saveFlex({ wordLoop: n })} />) : null}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{loopOn ? f("wordLoopOn", { n: flex.wordLoop }) : f("wordTap")}</Text>
      <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", gap: 8 }}>
        {words.map((w) => {
          const hi = on === w.position || activeWord === w.position;
          const r = roots[w.position];
          return (
            <Pressable key={w.position} onPress={() => tap(w.position)} accessibilityRole="button"
              accessibilityLabel={`${w.transliteration?.text ?? ""}, ${w.translation?.text ?? ""}${r ? `, ${f("rootOf", { r: r.letters })}, ${f("rootCount", { n: r.count })}` : ""}`}
              style={({ pressed }) => ({ minWidth: 80, alignItems: "center", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1,
                borderColor: hi ? goldButton.line : t.line, backgroundColor: hi || pressed ? t.accentSoft : t.surface, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: hi ? t.accent : t.arabic }}>{w.text_uthmani}</Text>
              {w.transliteration?.text ? <Text style={{ fontFamily: FONT.italic, fontSize: 12, color: t.gold }}>{w.transliteration.text}</Text> : null}
              {w.translation?.text ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "center", maxWidth: 120 }}>{w.translation.text}</Text> : null}
              {r ? (
                <View style={{ marginTop: 6, paddingTop: 5, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.line, alignItems: "center" }}>
                  <Text style={{ fontFamily: ARABIC_FONT, fontSize: 15, lineHeight: 24, color: t.gold }}>{r.letters}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{f("rootCount", { n: r.count })}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {anyRoot ? <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{f("rootSource")}</Text> : null}
    </View>
  );
}

/** step 3: what comes next (the next verse's meaning) and the core of the passage (maqāṣid takeaway) */
export function NextUp({ surah, verse, next }: { surah: number; verse: number; next?: Verse }) {
  const f = useFlexT();
  const cl = useCl();
  const sec = sectionOf(surah, verse);
  const take = pick(sec?.takeaway, cl);
  if (!next?.translation && !take) return null;
  return (
    <View style={{ marginTop: 14, gap: 10 }}>
      {next?.translation ? (
        <View style={{ borderRadius: 14, padding: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: StyleSheet.hairlineWidth, borderColor: stage.hair }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{f("nextTitle")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, marginTop: 2 }}>{f("nextLead", { v: next.verse_number })}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: "#fff", marginTop: 6 }}>{next.translation}</Text>
        </View>
      ) : null}
      {take ? (
        <View style={{ borderRadius: 14, padding: 12, backgroundColor: "rgba(214,180,108,0.12)", borderWidth: StyleSheet.hairlineWidth, borderColor: stage.goldSoft }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{f("takeaway")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: "#fff", marginTop: 4 }}>{take}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** step 4: the short version first – what the passage is about (maqāṣid section) – then the detailed tafsir on request.
 *  Returns null when the surah has no section for this verse (then the detailed tafsir shows right away). */
export function ShortTafsir({ surah, verse, onFull }: { surah: number; verse: number; onFull: () => void }) {
  const t = useTheme();
  const f = useFlexT();
  const cl = useCl();
  const sec = sectionOf(surah, verse);
  const m = maqasidOf(surah);
  if (!sec || !m) return null;
  const lessons = pickL(sec.lessons, cl).slice(0, 3);
  const take = pick(sec.takeaway, cl);
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 17, lineHeight: 23, color: t.ink }}>{pick(sec.title, cl)}</Text>
      {lessons.length ? lessons.map((x, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 8 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.gold }}>{"•"}</Text>
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink }}>{x}</Text>
        </View>
      )) : <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink }}>{pick(m.theme, cl)}</Text>}
      {take ? <View style={{ padding: 10, borderRadius: R.md, backgroundColor: t.accentSoft }}><Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 21, color: t.accent }}>{`${f("takeaway")}: ${take}`}</Text></View> : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted }}>{f("draft")}</Text>
      <OutlineButton title={f("readFull")} icon="book" onPress={onFull} style={{ marginTop: 4 }} />
      <Pressable onPress={() => saveFlex({ tafsir: "full" })} accessibilityRole="switch" accessibilityState={{ checked: false }} hitSlop={6} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 }}>
        <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: t.line }} />
        <Text style={{ fontFamily: FONT.medium, fontSize: 13.5, color: t.muted }}>{f("alwaysFull")}</Text>
      </Pressable>
    </View>
  );
}

/** the "always full" switch under the detailed tafsir (to go back to the short version first) */
export function AlwaysFullSwitch() {
  const t = useTheme();
  const f = useFlexT();
  const flex = useFlex();
  const on = flex.tafsir === "full";
  return (
    <Pressable onPress={() => saveFlex({ tafsir: on ? "short" : "full" })} accessibilityRole="switch" accessibilityState={{ checked: on }} hitSlop={6} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4, marginTop: 10 }}>
      <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: on ? goldButton.line : t.line, backgroundColor: on ? goldButton.to : "transparent", alignItems: "center", justifyContent: "center" }}>
        {on ? <Icon name="check" size={13} color={goldButton.text} /> : null}
      </View>
      <Text style={{ fontFamily: FONT.medium, fontSize: 13.5, color: t.muted }}>{f("alwaysFull")}</Text>
    </Pressable>
  );
}

/** step 6: which meaning belongs to this verse (its own translation among its neighbours') -> qmc.shams2.understand.v1 */
export function Comprehension({ verses, idx }: { verses: Verse[]; idx: number }) {
  const f = useFlexT();
  const q = useMemo(() => comprehensionQ(verses, idx), [verses, idx]);
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => setPicked(null), [idx]);
  // no meaning to ask about (the Arabic interface loads no translation and no short tafsir per verse): say so plainly
  // instead of a question in another language
  if (!q) return plainTranslation(verses[idx]?.translation) ? null : <Text style={{ marginTop: 14, fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: stage.textMuted }}>{f("compNone")}</Text>;
  const answer = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    noteUnderstand(q.key, i === q.answer);
  };
  return (
    <View style={{ marginTop: 14, gap: 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#fff" }}>{f("compQ")}</Text>
      {q.options.map((o, i) => {
        const right = picked !== null && i === q.answer;
        const wrong = picked === i && i !== q.answer;
        return (
          <Pressable key={o.key} onPress={() => answer(i)} disabled={picked !== null} accessibilityRole="button" accessibilityState={{ selected: picked === i, disabled: picked !== null }}
            style={({ pressed }) => ({ borderRadius: 16, padding: 12, borderWidth: 1,
              borderColor: right ? stage.gold : wrong ? "rgba(214,130,118,0.6)" : "rgba(255,255,255,0.16)",
              backgroundColor: right ? "rgba(214,180,108,0.16)" : wrong ? "rgba(160,58,52,0.14)" : pressed ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)" })}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: right ? "#fff" : stage.textSoft }}>{o.text}</Text>
          </Pressable>
        );
      })}
      {picked !== null ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: picked === q.answer ? stage.gold : "rgb(236,200,190)" }}>{picked === q.answer ? f("compRight") : f("compWrong")}</Text> : null}
    </View>
  );
}

/** step 7: how the transition from the previous verse went -> qmc.shams2.links.v1 */
export function LinkChips({ surah, verse }: { surah: number; verse: number }) {
  const f = useFlexT();
  const [done, setDone] = useState<boolean | null>(null);
  useEffect(() => setDone(null), [surah, verse]);
  const mark = (ok: boolean) => { if (done !== null) return; setDone(ok); noteLink(linkKey(surah, verse), ok); };
  return (
    <View style={{ marginTop: 14, gap: 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#fff" }}>{f("linkQ")}</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Chip label={f("linkOk")} onStage selected={done === true} onPress={() => mark(true)} disabled={done === false} />
        <Chip label={f("linkMiss")} onStage selected={done === false} onPress={() => mark(false)} disabled={done === true} />
      </View>
      {done !== null ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 13, color: stage.gold }}>{f("linkSaved")}</Text> : null}
    </View>
  );
}

/** the end card: today's verses in one go, from memory (blind recitation of the range learned in this sitting) */
export function BlindCard({ s, from, to, onStage }: { s: number; from: number; to: number; onStage?: boolean }) {
  const t = useTheme();
  const f = useFlexT();
  const go = () => router.push(`/shams/blind?s=${s}&from=${from}&to=${to}` as Href);
  const inner = (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="sun" size={14} color={onStage ? stage.gold : t.gold} />
        <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, lineHeight: 22, color: onStage ? "#fff" : t.ink }}>{f("blindTitle")}</Text>
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: onStage ? stage.textSoft : t.muted }}>{from === to ? f("blindLeadOne", { a: from }) : f("blindLead", { a: from, b: to })}</Text>
      <OutlineButton title={f("blindGo")} icon="repeat" onStage={onStage} onPress={go} style={{ marginTop: 4 }} />
    </View>
  );
  if (onStage) return <View style={{ borderRadius: 18, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: stage.goldSoft, backgroundColor: "rgba(255,255,255,0.05)" }}>{inner}</View>;
  return <GoldCard star={false}>{inner}</GoldCard>;
}
