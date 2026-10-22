import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { File } from "expo-file-system";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { Page, PageHero } from "@/components/page";
import { Chip, GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, GARNET, R, useTheme } from "@/lib/theme";
import { wordAudioUrl } from "@/web/arabic";
import { markAudioSessionChanged, stopClips, tone, useClip } from "@/features/coursekit/audio";
import { useArabicVoice } from "@/features/coursekit/voice";
import { useSurahs } from "@/features/qaida/words";
import { SendToTeacher, type SendTake } from "@/features/teacher/SendToTeacher";
import { useIntl } from "@/features/srs/format";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { addTake, noteMakhraj, useMakhraj } from "./store2";
import { deleteTakeFile, pruneTakes, takeDir } from "./take";
import { MAKHRAJ_LETTERS, letterById, quizItems, wordsWithLetter, type MakhrajLetter, type QuizItem, type WordRef } from "./makhrajData";
import { MouthDiagram } from "./MouthDiagram";
import { useMk, type MkKey } from "./makhraj/text";
import { Card, SourceNote } from "./ui";

// /shams/makhraj?l=ayn – the makhraj coach (Shams 3.0, free in the app): learn where the letter is made (drawing of
// mouth and throat), listen to the reciter's words (the model) and the practice syllables (device voice, orientation
// only), repeat with own recording and A/B, rate yourself, train the ear with pairs of words from the word data, read
// words with the letter from your own portion, and send the recording to a teacher. Nothing here judges pronunciation:
// the own rating is labelled as such, the listening quiz checks hearing only. Mirrors src/components/learn/shams2/Makhraj.tsx.
const STEPS = ["learn", "hear", "repeat", "quiz", "words", "send"] as const;
type Step = (typeof STEPS)[number];
const QUIZ_N = 8;
type Rec = SendTake & { s?: number; from?: number; to?: number };

export function MakhrajScreen({ initial }: { initial?: string }) {
  const mk = useMk();
  const [id, setId] = useState(letterById(initial).id);
  const l = letterById(id);
  const [step, setStep] = useState<Step>("learn");
  const [take, setTake] = useState<Rec | null>(null);
  const [quiz, setQuiz] = useState({ ok: 0, miss: 0 });
  const [self, setSelf] = useState<number | null>(null);
  useEffect(() => { setStep("learn"); setTake(null); setQuiz({ ok: 0, miss: 0 }); setSelf(null); stopClips(); }, [id]);
  const i = STEPS.indexOf(step);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={mk("kicker")} arabic="مَخَارِجُ الحُرُوف" title={mk("title")} lead={mk("lead")} />
        <View style={{ padding: 16, gap: 14 }}>
          <LetterPicker value={id} onChange={setId} />
          <Stepper i={i} onPick={(n) => setStep(STEPS[n])} />
          {step === "learn" ? <Learn l={l} /> : null}
          {step === "hear" ? <Hear l={l} /> : null}
          {step === "repeat" ? <Repeat l={l} self={self} onSelf={setSelf} onTake={setTake} /> : null}
          {step === "quiz" ? <Quiz l={l} onAnswer={(right) => setQuiz((q) => ({ ok: q.ok + (right ? 1 : 0), miss: q.miss + (right ? 0 : 1) }))} /> : null}
          {step === "words" ? <OwnWords l={l} self={self} onSelf={setSelf} onTake={setTake} /> : null}
          {step === "send" ? <Send l={l} take={take} quiz={quiz} self={self} /> : null}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {i > 0 ? <OutlineButton style={{ flex: 1 }} icon="chevronLeft" title={mk("prev")} onPress={() => { stopClips(); setStep(STEPS[i - 1]); }} /> : null}
            {i < STEPS.length - 1 ? <GoldButton style={{ flex: 1 }} title={mk("next")} onPress={() => { stopClips(); setStep(STEPS[i + 1]); }} /> : null}
          </View>
          <Stats l={l} />
          <SourceNote src={["jazari"]} review={{ status: "draft" }} />
        </View>
      </Page>
    </>
  );
}

// ---------- header parts ----------
function LetterPicker({ value, onChange }: { value: string; onChange: (id: MakhrajLetter["id"]) => void }) {
  const t = useTheme();
  const mk = useMk();
  const stats = useMakhraj();
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: t.gold, textAlign: "left" }}>{mk("choose")}</Text>
      <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between" }}>
        {MAKHRAJ_LETTERS.map((x) => {
          const on = x.id === value;
          const st = stats[x.ch];
          const practised = !!st && (st.ok + st.miss > 0 || st.self !== undefined);
          return (
            <Pressable key={x.id} onPress={() => onChange(x.id)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={mk(`n_${x.id}` as MkKey)}
              style={({ pressed }) => ({ flex: 1, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", borderWidth: on ? 1.5 : 1, borderColor: on ? "#c6a65e" : t.line, backgroundColor: on ? (t.dark ? "rgba(201,166,94,0.16)" : "rgba(201,166,94,0.14)") : t.surface, opacity: pressed ? 0.8 : 1 })}>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 28, lineHeight: 40, color: on ? t.ink : t.muted }}>{x.ch}</Text>
              {practised ? <View style={{ position: "absolute", bottom: 7, width: 5, height: 5, borderRadius: 3, backgroundColor: "#c6a65e" }} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Stepper({ i, onPick }: { i: number; onPick: (n: number) => void }) {
  const t = useTheme();
  const mk = useMk();
  const nf = useIntl();
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {STEPS.map((s, n) => (
          <Pressable key={s} onPress={() => onPick(n)} accessibilityRole="button" accessibilityState={{ selected: n === i }} accessibilityLabel={mk(`st_${s}` as MkKey)} hitSlop={6}
            style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: n <= i ? "#c6a65e" : t.line }} />
        ))}
      </View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{`${mk("stepOf", { i: nf(i + 1), n: nf(STEPS.length) })} · ${mk(`st_${STEPS[i]}` as MkKey)}`}</Text>
    </View>
  );
}

function Stats({ l }: { l: MakhrajLetter }) {
  const t = useTheme();
  const mk = useMk();
  const nf = useIntl();
  const st = useMakhraj()[l.ch];
  const parts = st ? [st.ok + st.miss > 0 ? mk("stats", { ok: nf(st.ok), miss: nf(st.miss) }) : "", st.self !== undefined ? mk("statsSelf", { s: nf(st.self) }) : ""].filter(Boolean) : [];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.ink }}>{mk("statsT")}</Text>
      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{parts.length ? parts.join(" · ") : mk("statsNone")}</Text>
    </View>
  );
}

function Label({ children }: { children: string }) {
  const t = useTheme();
  return <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink, textAlign: "left" }}>{children}</Text>;
}
const AR_RUN = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+)/;
/** a paragraph with practice syllables inside (Arabic runs isolated, so the sentence keeps its order) */
function Para({ children, muted }: { children: string; muted?: boolean }) {
  const t = useTheme();
  const size = muted ? 13 : 14.5;
  return (
    <Text style={{ fontFamily: FONT.regular, fontSize: size, lineHeight: muted ? 19 : 24, color: muted ? t.muted : t.ink, textAlign: "left" }}>
      {children.split(AR_RUN).map((x, i) => (i % 2 ? <Text key={i} style={{ fontFamily: FONT.semibold, color: t.ink }}>{`\u2068${x}\u2069`}</Text> : x))}
    </Text>
  );
}

// ---------- 1 learn ----------
function Learn({ l }: { l: MakhrajLetter }) {
  const t = useTheme();
  const mk = useMk();
  const name = mk(`n_${l.id}` as MkKey), pname = mk(`n_${l.partner.id}` as MkKey);
  const region = mk(`rg_${l.region}` as MkKey), pregion = mk(`rg_${l.partner.region}` as MkKey);
  return (
    <Card gold>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 56, lineHeight: 84, color: t.ink }}>{l.ch}</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink, textAlign: "left" }}>{name}</Text>
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 17, lineHeight: 26, color: t.gold, textAlign: "left" }}>{l.arName}</Text>
          <Text style={{ fontFamily: FONT.medium, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{mk(l.heavy ? "heavy" : "light")}</Text>
        </View>
      </View>
      <MouthDiagram region={l.region} partner={l.partner.region} letter={l.ch} partnerLetter={l.partner.ch}
        label={mk("diagram", { l: name, r: region, p: pname, q: pregion })} legendThis={mk("legendThis")} legendPartner={mk("legendPartner")} />
      <Label>{mk("where")}</Label>
      <Para>{region.charAt(0).toUpperCase() + region.slice(1)}</Para>
      <Label>{mk("how")}</Label>
      <Para>{mk(`${l.id}_how` as MkKey)}</Para>
      <Label>{mk("mistake")}</Label>
      <Para>{mk(`${l.id}_mistake` as MkKey)}</Para>
      <Label>{mk("vs", { a: `${name} ${l.ch}`, b: `${pname} ${l.partner.ch}` })}</Label>
      <Para>{mk(`${l.id}_vs` as MkKey)}</Para>
    </Card>
  );
}

// ---------- 2 listen: reciter's words (model) and the syllables (device voice) ----------
function WordChip({ w, onPress, active }: { w: WordRef; onPress: () => void; active?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={w.ref}
      style={({ pressed }) => ({ minHeight: 52, paddingHorizontal: 16, borderRadius: 26, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: active ? "#c6a65e" : t.line, backgroundColor: active ? "rgba(201,166,94,0.14)" : t.surface, opacity: pressed ? 0.8 : 1 })}>
      <Icon name="speaker" size={14} color={t.gold} />
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 40, color: t.ink, writingDirection: "rtl" }}>{w.ar}</Text>
    </Pressable>
  );
}

function useModelWords(l: MakhrajLetter, max = 6) {
  const { verses, error } = useSurahs(l.quizSurahs);
  const words = useMemo(() => (verses ? wordsWithLetter(verses, l, max, l.partner.chars) : []), [verses, l, max]);
  return { words, loading: !verses && !error, error };
}

function Hear({ l }: { l: MakhrajLetter }) {
  const t = useTheme();
  const mk = useMk();
  const clip = useClip();
  const voice = useArabicVoice();
  const { words, loading, error } = useModelWords(l);
  const [cur, setCur] = useState<string | null>(null);
  return (
    <>
      <Card>
        <Label>{mk("modelT")}</Label>
        <Para muted>{mk("modelLead")}</Para>
        {loading ? <Para muted>{mk("loading")}</Para> : error ? <Para muted>{mk("loadFailed")}</Para> : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
            {words.map((w) => <WordChip key={w.ref} w={w} active={cur === w.ref && clip.state === "playing"} onPress={() => { setCur(w.ref); clip.play(wordAudioUrl(w.ref)); }} />)}
          </View>
        )}
      </Card>
      <Card>
        <Label>{mk("syllT")}</Label>
        <Para muted>{mk("syllLead")}</Para>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
          {l.syllables.map((x) => (
            <Pressable key={x} disabled={!voice.canSpeak} onPress={() => { stopClips(); voice.speak(x); }} accessibilityRole="button" accessibilityLabel={x}
              style={({ pressed }) => ({ minWidth: 64, height: 52, paddingHorizontal: 14, borderRadius: 26, alignItems: "center", justifyContent: "center", borderWidth: 1, borderStyle: "dashed", borderColor: t.line, backgroundColor: t.surface, opacity: !voice.canSpeak ? 0.45 : pressed ? 0.8 : 1 })}>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 38, color: t.ink }}>{x}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
          <Icon name="eye" size={14} color={t.muted} />
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted, textAlign: "left" }}>{voice.ready && !voice.canSpeak ? mk("noVoice") : mk("voiceNote")}</Text>
        </View>
      </Card>
    </>
  );
}

// ---------- recorder (own recording, A/B with a model word, kept as a take on this device) ----------
function Recorder({ model, onTake, meta }: { model: WordRef | null; onTake: (r: Rec) => void; meta: { letter: string; s?: number; from?: number; to?: number } }) {
  const t = useTheme();
  const mk = useMk();
  const nf = useIntl();
  const clip = useClip();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const rec = useAudioRecorderState(recorder, 200);
  const player = useAudioPlayer(null);
  const [mine, setMine] = useState<Rec | null>(null);
  const [err, setErr] = useState("");
  const thenMine = useRef(false);
  useEffect(() => { if (thenMine.current && clip.state === "idle") { thenMine.current = false; playMine(); } }, [clip.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const start = async () => {
    try {
      clip.stop(); player.pause();
      const p = await requestRecordingPermissionsAsync();
      if (!p.granted) { setErr(mk("micDenied")); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      markAudioSessionChanged();
      await recorder.prepareToRecordAsync();
      setErr("");
      recorder.record();
    } catch { setErr(mk("micDenied")); }
  };
  const stop = async () => {
    const ms = rec.durationMillis;
    try { await recorder.stop(); } catch { /* already stopped */ }
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    markAudioSessionChanged();
    const uri = recorder.uri;
    if (!uri || ms < 400) return;
    // kept in the takes folder (index in store2.ts; take.ts pruneTakes keeps the newest within its count and size limits)
    let kept = uri;
    try { const target = new File(takeDir(), `mk-${Date.now().toString(36)}.m4a`); new File(uri).copy(target); kept = target.uri; } catch { /* stays in the cache */ }
    const { take, dropped } = addTake({ uri: kept, kind: "makhraj", ms, letter: meta.letter, s: meta.s, from: meta.from, to: meta.to });
    dropped.forEach((d) => deleteTakeFile(d.uri));
    pruneTakes();
    const r: Rec = { uri: kept, ms, id: take.id, s: meta.s, from: meta.from, to: meta.to };
    setMine(r); onTake(r);
  };
  function playMine() {
    if (!mine) return;
    clip.stop();
    player.replace({ uri: mine.uri });
    void player.seekTo(0);
    player.play();
  }
  const playModel = (andThen = false) => { if (!model) return; player.pause(); thenMine.current = andThen; clip.play(wordAudioUrl(model.ref)); };
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {rec.isRecording ? (
          <Pressable onPress={() => void stop()} accessibilityRole="button" accessibilityLabel={mk("stopRec")}
            style={{ height: 48, paddingHorizontal: 18, borderRadius: 24, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: GARNET }}>
            <View style={{ width: 11, height: 11, borderRadius: 2, backgroundColor: "#fff" }} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: "#fff" }}>{`${mk("stopRec")} · ${nf(Math.round(rec.durationMillis / 1000))} s`}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => void start()} accessibilityRole="button" accessibilityLabel={mk("record")}
            style={({ pressed }) => ({ height: 48, paddingHorizontal: 18, borderRadius: 24, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, opacity: pressed ? 0.8 : 1 })}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: GARNET }} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{mk("record")}</Text>
          </Pressable>
        )}
        {model ? <OutlineButton compact icon="play" title={mk("model")} onPress={() => playModel()} /> : null}
        {mine ? <OutlineButton compact icon="play" title={mk("you")} onPress={playMine} /> : null}
        {mine && model ? <OutlineButton compact icon="repeat" title={mk("ab")} onPress={() => playModel(true)} /> : null}
      </View>
      {err ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.danger, textAlign: "left" }}>{err}</Text> : null}
      {mine ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{mk("saved", { n: nf(Math.round(mine.ms / 1000)) })}</Text> : null}
    </View>
  );
}

function SelfRating({ l, value, onChange }: { l: MakhrajLetter; value: number | null; onChange: (n: number) => void }) {
  const t = useTheme();
  const mk = useMk();
  const nf = useIntl();
  return (
    <View style={{ gap: 8 }}>
      <Label>{mk("rateT")}</Label>
      <Para muted>{mk("rateQ", { l: mk(`n_${l.id}` as MkKey) })}</Para>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => { onChange(n); noteMakhraj(l.ch, { self: n }); }} accessibilityRole="button" accessibilityState={{ selected: value === n }} accessibilityLabel={`${nf(n)} / 5`}
            style={({ pressed }) => ({ flex: 1, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: value === n ? "#c6a65e" : t.line, backgroundColor: value === n ? "rgba(201,166,94,0.18)" : t.surface, opacity: pressed ? 0.8 : 1 })}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{nf(n)}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "left" }}>{value !== null ? mk("rated") : mk("rateScale")}</Text>
    </View>
  );
}

// ---------- 3 repeat ----------
function Repeat({ l, self, onSelf, onTake }: { l: MakhrajLetter; self: number | null; onSelf: (n: number) => void; onTake: (r: Rec) => void }) {
  const mk = useMk();
  const { words } = useModelWords(l, 1);
  return (
    <Card gold>
      <Label>{mk("repeatT")}</Label>
      <Para muted>{mk("repeatLead")}</Para>
      <Recorder model={words[0] ?? null} onTake={onTake} meta={{ letter: l.ch }} />
      <SelfRating l={l} value={self} onChange={onSelf} />
      <Honesty />
    </Card>
  );
}

function Honesty() {
  const t = useTheme();
  const mk = useMk();
  return (
    <View style={{ flexDirection: "row", gap: 8, padding: 12, borderRadius: R.md, backgroundColor: t.dark ? "rgba(58,190,146,0.08)" : "rgba(6,108,78,0.06)" }}>
      <Icon name="shield" size={15} color={t.accent} />
      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.ink, textAlign: "left" }}>{mk("honesty")}</Text>
    </View>
  );
}

// ---------- 4 ear training ----------
function Quiz({ l, onAnswer }: { l: MakhrajLetter; onAnswer: (right: boolean) => void }) {
  const t = useTheme();
  const mk = useMk();
  const nf = useIntl();
  const clip = useClip();
  const { verses, error } = useSurahs(l.quizSurahs);
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const items: QuizItem[] = useMemo(() => (verses ? quizItems(verses, l, QUIZ_N, seed) : []), [verses, l, seed]);
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState<"letter" | "partner" | null>(null);
  const [right, setRight] = useState(0);
  useEffect(() => { setN(0); setPicked(null); setRight(0); }, [seed, l.id]);
  const it = items[n];
  const name = mk(`n_${l.id}` as MkKey), pname = mk(`n_${l.partner.id}` as MkKey);
  const answer = (a: "letter" | "partner") => {
    if (!it || picked) return;
    const ok = a === it.answer;
    setPicked(a); if (ok) setRight((x) => x + 1);
    tone(ok); noteMakhraj(l.ch, { right: ok }); onAnswer(ok);
  };
  if (error) return <Card><Para muted>{mk("loadFailed")}</Para></Card>;
  if (!verses) return <Card><Para muted>{mk("loading")}</Para></Card>;
  if (!items.length) return <Card><Para muted>{mk("quizNone")}</Para></Card>;
  const done = n >= items.length;
  const opt = (a: "letter" | "partner") => {
    const ch = a === "letter" ? l.ch : l.partner.ch, label = a === "letter" ? name : pname;
    const isRight = picked && it && a === it.answer, isWrong = picked === a && it && a !== it.answer;
    return (
      <Pressable key={a} onPress={() => answer(a)} disabled={!!picked} accessibilityRole="button" accessibilityLabel={label}
        style={({ pressed }) => ({ flex: 1, height: 96, borderRadius: 30, alignItems: "center", justifyContent: "center", gap: 0, borderWidth: isRight || isWrong ? 2 : 1, borderColor: isRight ? t.accent : isWrong ? t.danger : t.line, backgroundColor: isRight ? t.accentSoft : t.surface, opacity: pressed ? 0.85 : 1 })}>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 38, lineHeight: 58, color: t.ink }}>{ch}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{label}</Text>
      </Pressable>
    );
  };
  return (
    <Card gold>
      <Label>{mk("quizT")}</Label>
      {done ? (
        <>
          <Text style={{ fontFamily: FONT.display, fontSize: 26, color: t.ink, textAlign: "left" }}>{mk("quizDone", { n: nf(right), m: nf(items.length) })}</Text>
          <GoldButton icon="repeat" title={mk("quizMore")} onPress={() => setSeed((x) => x + 1)} />
        </>
      ) : (
        <>
          <Para muted>{mk("quizLead", { a: `${name} ${l.ch}`, b: `${pname} ${l.partner.ch}` })}</Para>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{`${nf(n + 1)} / ${nf(items.length)}`}</Text>
            {it.exact ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold }}>{mk("pair")}</Text> : null}
          </View>
          <GoldButton icon="play" title={picked ? mk("again") : mk("play")} onPress={() => clip.play(wordAudioUrl(it.word.ref))} />
          <View style={{ flexDirection: "row", gap: 10 }}>{opt("letter")}{opt("partner")}</View>
          {picked ? (
            <View style={{ gap: 8, alignItems: "stretch" }}>
              <Text accessibilityRole="alert" style={{ fontFamily: FONT.bold, fontSize: 14.5, color: picked === it.answer ? t.accent : t.danger, textAlign: "left" }}>
                {picked === it.answer ? mk("right") : mk("wrong", { l: it.answer === "letter" ? name : pname })}
              </Text>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 30, lineHeight: 50, color: t.ink, textAlign: "center", writingDirection: "rtl" }}>{it.word.ar}</Text>
              <OutlineButton title={mk("next")} onPress={() => { setPicked(null); setN(n + 1); }} />
            </View>
          ) : null}
        </>
      )}
    </Card>
  );
}

// ---------- 5 words from the learner's own portion ----------
function OwnWords({ l, self, onSelf, onTake }: { l: MakhrajLetter; self: number | null; onSelf: (n: number) => void; onTake: (r: Rec) => void }) {
  const mk = useMk();
  const nf = useIntl();
  const clip = useClip();
  const m = useShams2();
  const { name } = useSurahNames();
  const ranges = (m.wird.sabaq.ranges.length ? m.wird.sabaq.ranges : m.wird.sabqi.ranges).slice(0, 2);
  const own = useSurahs(useMemo(() => [...new Set(ranges.map((r) => r.s))], [ranges.map((r) => r.s).join(",")])); // eslint-disable-line react-hooks/exhaustive-deps
  const fall = useSurahs(l.quizSurahs);
  const inRange = useMemo(() => (own.verses ?? []).filter((v) => { const [s, a] = v.verse_key.split(":").map(Number); return ranges.some((r) => r.s === s && a >= r.from && a <= r.to); }), [own.verses, ranges]); // eslint-disable-line react-hooks/exhaustive-deps
  const ownWords = useMemo(() => wordsWithLetter(inRange, l, 8), [inRange, l]);
  const fallback = !ownWords.length;
  const words = fallback ? (fall.verses ? wordsWithLetter(fall.verses, l, 8) : []) : ownWords;
  const label = fallback ? l.quizSurahs.map((s) => name(s)).join(", ") : ranges.map((r) => `${name(r.s)} ${r.from === r.to ? nf(r.from) : `${nf(r.from)}–${nf(r.to)}`}`).join(", ");
  const meta = fallback || !ranges[0] ? { letter: l.ch } : { letter: l.ch, s: ranges[0].s, from: ranges[0].from, to: ranges[0].to };
  const [cur, setCur] = useState<string | null>(null);
  const loading = (!own.verses && !own.error && ranges.length > 0) || (fallback && !fall.verses && !fall.error);
  return (
    <Card gold>
      <Label>{mk("wordsT")}</Label>
      {loading ? <Para muted>{mk("loading")}</Para> : (
        <>
          <Para muted>{fallback ? mk("wordsFallback", { l: mk(`n_${l.id}` as MkKey), r: label }) : mk("wordsLead", { l: mk(`n_${l.id}` as MkKey), r: label })}</Para>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
            {words.map((w) => <WordChip key={w.ref} w={w} active={cur === w.ref && clip.state === "playing"} onPress={() => { setCur(w.ref); clip.play(wordAudioUrl(w.ref)); }} />)}
          </View>
          <Para muted>{mk("wordsSukun", { l: mk(`n_${l.id}` as MkKey) })}</Para>
          <Recorder model={words[0] ?? null} onTake={onTake} meta={meta} />
          <SelfRating l={l} value={self} onChange={onSelf} />
        </>
      )}
    </Card>
  );
}

// ---------- 6 send to teacher ----------
function Send({ l, take, quiz, self }: { l: MakhrajLetter; take: Rec | null; quiz: { ok: number; miss: number }; self: number | null }) {
  const mk = useMk();
  const name = mk(`n_${l.id}` as MkKey);
  const lines = [mk("sumTitle", { l: l.ch, n: name })];
  if (quiz.ok + quiz.miss > 0) lines.push(mk("sumQuiz", { ok: quiz.ok, miss: quiz.miss }));
  if (self !== null) lines.push(mk("sumSelf", { s: self }));
  return (
    <Card gold>
      <Label>{mk("sendT")}</Label>
      <Para muted>{mk("sendLead", { l: name })}</Para>
      {!take ? <Para muted>{mk("noTake")}</Para> : null}
      <SendToTeacher take={take} kind="makhraj" letter={l.ch} surah={take?.s} from={take?.from} to={take?.to}
        summary={{ ...(self !== null ? { self } : {}), ...(quiz.ok + quiz.miss > 0 ? { quizOk: quiz.ok, quizMiss: quiz.miss } : {}) }} shareText={lines.join("\n")} />
    </Card>
  );
}
