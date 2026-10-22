import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { align, same } from "@/web/recite";
import { normalizeArabic } from "@/web/vocabStudy";
import { loadVerse, type VWord } from "@/features/srs/verse";
import { markAudioSessionChanged } from "../coursekit/audio";
import { useArabicVoice } from "../coursekit/voice";
import { GoldRing } from "../coursekit/motion";
import type { Ex } from "./build";
import type { LItem } from "./curriculum";
import { useLT } from "./texts";
import type { Line } from "./types";

// The exercise cards of the language course. Each scored card calls onCheck(ok, correct) once; the lesson screen
// shows the feedback bar and moves on.
export type Check = (ok: boolean, correct: string) => void;

export function Ar({ children, size = 28, color, center = true }: { children: string; size?: number; color?: string; center?: boolean }) {
  const t = useTheme();
  return (
    <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.75, color: color ?? t.ink, writingDirection: "rtl", textAlign: center ? "center" : "right" }}>{children}</Text>
  );
}

function Prompt({ children }: { children: string }) {
  const t = useTheme();
  return <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 18, lineHeight: 24, color: t.ink, textAlign: "center" }}>{children}</Text>;
}

export function SayButton({ text, label, big = false, auto = false }: { text: string; label?: string; big?: boolean; auto?: boolean }) {
  const t = useTheme();
  const lt = useLT();
  const { canSpeak, speak, state } = useArabicVoice();
  // listening exercises say their text once by themselves
  const said = useRef(false);
  useEffect(() => { if (auto && canSpeak && !said.current) { said.current = true; speak(text); } }, [auto, canSpeak, speak, text]);
  if (!canSpeak) return null;
  const on = state !== "idle";
  if (big) {
    return (
      <Pressable onPress={() => speak(text)} accessibilityRole="button" accessibilityLabel={label ?? lt("listen")} accessibilityState={{ busy: state === "starting" }}
        style={({ pressed }) => ({ alignSelf: "center", width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", backgroundColor: on ? t.accent : t.accentSoft, opacity: pressed ? 0.85 : 1 })}>
        {state === "starting" ? <ActivityIndicator color={t.onAccent} /> : <Icon name="speaker" size={30} color={on ? t.onAccent : t.accent} />}
      </Pressable>
    );
  }
  return (
    <Pressable onPress={() => speak(text)} accessibilityRole="button" accessibilityLabel={label ?? lt("listen")} accessibilityState={{ busy: state === "starting" }} hitSlop={8}
      style={({ pressed }) => ({ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1, borderColor: on ? t.gold : t.line, backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 })}>
      {state === "starting" ? <ActivityIndicator size="small" color={t.gold} /> : <Icon name="speaker" size={18} color={t.gold} />}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{label ?? lt("listen")}</Text>
    </Pressable>
  );
}

function CheckButton({ disabled, onPress, label }: { disabled?: boolean; onPress: () => void; label?: string }) {
  const t = useTheme();
  const lt = useLT();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled: !!disabled }}
      style={{ marginTop: 8, height: 52, borderRadius: R.pill, alignItems: "center", justifyContent: "center", backgroundColor: disabled ? t.line : t.accent }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: disabled ? t.muted : "#fff" }}>{label ?? lt("check")}</Text>
    </Pressable>
  );
}

function Option({ label, ar, selected, onPress }: { label: string; ar: boolean; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={label}
      style={{ minHeight: 56, borderRadius: R.card, borderWidth: selected ? 2 : 1, borderColor: selected ? t.accent : t.line, backgroundColor: selected ? t.accentSoft : t.surface, paddingHorizontal: 16, paddingVertical: ar ? 2 : 14, justifyContent: "center" }}>
      {ar ? <Ar size={24}>{label}</Ar> : <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: t.ink, textAlign: "center" }}>{label}</Text>}
    </Pressable>
  );
}

export function IntroCard({ item, onNext }: { item: LItem; onNext: () => void }) {
  const t = useTheme();
  const lt = useLT();
  return (
    <View style={{ gap: 14 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: t.gold, textAlign: "center" }}>{lt("isNew")}</Text>
      <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 20, gap: 6 }}>
        <Ar size={34}>{item.ar}</Ar>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "center" }}>{item.tr}</Text>
        <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "center" }}>{item.local}</Text>
      </View>
      <SayButton text={item.ar} />
      <CheckButton onPress={onNext} label={lt("next")} />
    </View>
  );
}

export function ChooseCard({ ex, onCheck }: { ex: Extract<Ex, { k: "choose" | "listen" | "conj" }>; onCheck: Check }) {
  const t = useTheme();
  const lt = useLT();
  const [sel, setSel] = useState<number | null>(null);
  const optsAr = ex.k === "choose" ? ex.optsAr : true;
  return (
    <View style={{ gap: 12 }}>
      {ex.k === "choose" ? (
        <>
          <Prompt>{ex.qAr ? lt("chooseMeaning") : lt("chooseArabic")}</Prompt>
          {ex.qAr ? <Ar size={34}>{ex.q}</Ar> : <Text style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: t.ink, textAlign: "center", marginVertical: 8 }}>{ex.q}</Text>}
          {ex.say ? <SayButton text={ex.say} /> : null}
        </>
      ) : ex.k === "listen" ? (
        <>
          <Prompt>{lt("listenPick")}</Prompt>
          <SayButton text={ex.say} big auto />
        </>
      ) : (
        <>
          <Prompt>{lt("conjQ")}</Prompt>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "center" }}>{ex.title}</Text>
          <Ar size={30} color={t.gold}>{ex.label}</Ar>
        </>
      )}
      <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
        {ex.opts.map((o, i) => <Option key={o + i} label={o} ar={optsAr} selected={sel === i} onPress={() => setSel(i)} />)}
      </View>
      <CheckButton disabled={sel === null} onPress={() => sel !== null && onCheck(sel === ex.ans, ex.opts[ex.ans])} />
    </View>
  );
}

export function TilesCard({ ex, onCheck }: { ex: Extract<Ex, { k: "tiles" }>; onCheck: Check }) {
  const t = useTheme();
  const lt = useLT();
  const [row, setRow] = useState<number[]>([]);
  const chip = (w: string, on: boolean, onPress: () => void, k: string) => (
    <Pressable key={k} onPress={onPress} accessibilityRole="button" accessibilityLabel={w}
      style={{ paddingHorizontal: 12, borderRadius: R.md, borderWidth: 1, borderColor: on ? t.line : t.gold, backgroundColor: on ? t.bg : t.surface, opacity: on ? 0.35 : 1 }}>
      <Ar size={22} center>{w}</Ar>
    </Pressable>
  );
  return (
    <View style={{ gap: 14 }}>
      <Prompt>{lt("tilesQ")}</Prompt>
      <Text style={{ fontFamily: FONT.display, fontSize: 21, lineHeight: 28, color: t.ink, textAlign: "center" }}>{ex.q}</Text>
      <View style={{ minHeight: 64, borderBottomWidth: 1, borderColor: t.line, flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, paddingVertical: 6, direction: "ltr" }}>
        {row.map((i, n) => chip(ex.pool[i], false, () => setRow(row.filter((_, m) => m !== n)), `r${n}`))}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "center" }}>{lt("tilesHint")}</Text>
      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, justifyContent: "center", direction: "ltr" }}>
        {ex.pool.map((w, i) => chip(w, row.includes(i), () => { if (!row.includes(i)) setRow([...row, i]); }, `p${i}`))}
      </View>
      <CheckButton disabled={!row.length} onPress={() => {
        const built = row.map((i) => ex.pool[i]);
        onCheck(built.length === ex.answer.length && built.every((w, i) => normalizeArabic(w) === normalizeArabic(ex.answer[i])), ex.answer.join(" "));
      }} />
    </View>
  );
}

const PAD = "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ة ى ء أ إ".split(" ");
/** typing with tolerance: vowel signs, hamza seats and tāʾ marbūṭa/hāʾ do not matter, small slips are forgiven */
export function TypeCard({ ex, onCheck }: { ex: Extract<Ex, { k: "type" }>; onCheck: Check }) {
  const t = useTheme();
  const lt = useLT();
  const [v, setV] = useState("");
  const { canSpeak } = useArabicVoice();
  const dict = !!ex.say && canSpeak;
  const ok = () => {
    const a = ex.target.split(/\s+/), b = v.trim().split(/\s+/);
    return normalizeArabic(v) === normalizeArabic(ex.target) || (a.length === b.length && a.every((w, i) => same(w, b[i])));
  };
  return (
    <View style={{ gap: 12 }}>
      <Prompt>{dict ? lt("typeDict") : lt("typeQ")}</Prompt>
      {dict ? <SayButton text={ex.say!} big />
        : <Text style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, color: t.ink, textAlign: "center" }}>{ex.q}</Text>}
      <TextInput value={v} onChangeText={setV} autoCorrect={false} autoCapitalize="none" accessibilityLabel={lt("typeQ")} placeholder="…"
        placeholderTextColor={t.muted}
        style={{ minHeight: 60, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14, fontFamily: ARABIC_FONT, fontSize: 26, color: t.ink, textAlign: "right", writingDirection: "rtl" }} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "center" }}>{lt("typeHint")}</Text>
      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 6, justifyContent: "center", direction: "ltr" }} accessibilityLabel={lt("typePad")}>
        {PAD.map((c) => (
          <Pressable key={c} onPress={() => setV(v + c)} accessibilityRole="button" accessibilityLabel={c}
            style={{ width: 38, height: 42, borderRadius: R.sm, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
            <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 34, color: t.ink }}>{c}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setV(v + " ")} accessibilityRole="button" accessibilityLabel={lt("space")} style={{ paddingHorizontal: 12, height: 42, borderRadius: R.sm, borderWidth: 1, borderColor: t.line, alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{lt("space")}</Text></Pressable>
        <Pressable onPress={() => setV(v.slice(0, -1))} accessibilityRole="button" accessibilityLabel={lt("del")} style={{ paddingHorizontal: 12, height: 42, borderRadius: R.sm, borderWidth: 1, borderColor: t.line, alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{lt("del")}</Text></Pressable>
      </View>
      <CheckButton disabled={!v.trim()} onPress={() => onCheck(ok(), ex.target)} />
    </View>
  );
}

// expo-speech-recognition is native: loaded lazily so builds without it still work (same as the reading course)
type SR = typeof import("expo-speech-recognition");
let sr: SR | null | undefined;
function speech(): SR | null {
  if (sr === undefined) { try { sr = require("expo-speech-recognition") as SR; } catch { sr = null; } } // eslint-disable-line @typescript-eslint/no-require-imports
  return sr;
}

/** speaking: on-device recognition only, scored with align() from the recite check; skippable */
export function SpeakCard({ ex, onCheck, onSkip }: { ex: Extract<Ex, { k: "speak" }>; onCheck: Check; onSkip: () => void }) {
  const t = useTheme();
  const lt = useLT();
  const [state, setState] = useState<"idle" | "listening" | "done" | "unavailable">("idle");
  const [ok, setOk] = useState<boolean[] | null>(null);
  const words = useMemo(() => ex.target.replace(/[.،,؟?!]/g, "").split(/\s+/).filter(Boolean), [ex.target]);
  const subs = useRef<{ remove: () => void }[]>([]);
  useEffect(() => () => { subs.current.forEach((s) => s.remove()); try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ } }, []);
  const start = async () => {
    const m = speech()?.ExpoSpeechRecognitionModule;
    try {
      if (!m || !m.isRecognitionAvailable() || !m.supportsOnDeviceRecognition()) { setState("unavailable"); return; }
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setState("unavailable"); return; }
      setOk(null);
      subs.current.forEach((s) => s.remove());
      subs.current = [
        m.addListener("result", (e) => setOk(align(words, e.results[0]?.transcript ?? "").ok)),
        // recognition leaves the audio session in record mode: the next sound sets playback again
        m.addListener("end", () => { markAudioSessionChanged(); setState((s) => (s === "listening" ? "done" : s)); }),
        m.addListener("error", () => { markAudioSessionChanged(); setState("done"); }),
      ];
      markAudioSessionChanged();
      m.start({ lang: "ar-SA", interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: false });
      setState("listening");
    } catch { setState("unavailable"); }
  };
  const stop = () => { try { speech()?.ExpoSpeechRecognitionModule.stop(); } catch { /* ended */ } markAudioSessionChanged(); setState("done"); };
  const n = ok?.filter(Boolean).length ?? 0;
  return (
    <View style={{ gap: 12 }}>
      <Prompt>{lt("speakQ")}</Prompt>
      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 8, direction: "ltr" }}>
        {words.map((w, i) => <Text key={i} allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 28, lineHeight: 50, color: ok?.[i] ? t.accent : t.ink }}>{w}</Text>)}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "center" }}>{ex.q}</Text>
      <SayButton text={ex.target} />
      {state === "unavailable" ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "center" }}>{lt("speakNA")}</Text> : null}
      {ok ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, textAlign: "center" }}>{lt("speakHeard", { n, total: words.length })}</Text> : null}
      {state === "idle" || state === "done" ? (
        <View style={{ gap: 8 }}>
          {state === "done" && ok ? <CheckButton onPress={() => onCheck(n / words.length >= 0.6, ex.target)} /> : null}
          <Pressable onPress={start} accessibilityRole="button" style={{ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, height: 48, paddingHorizontal: 20, borderRadius: R.pill, backgroundColor: state === "done" ? t.surface : t.accent, borderWidth: 1, borderColor: t.accent }}>
            <Icon name="speaker" size={18} color={state === "done" ? t.accent : "#fff"} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: state === "done" ? t.accent : "#fff" }}>{lt("speakStart")}</Text>
          </Pressable>
        </View>
      ) : state === "listening" ? (
        <Pressable onPress={stop} accessibilityRole="button" style={{ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, height: 48, paddingHorizontal: 20, borderRadius: R.pill, backgroundColor: t.gold }}>
          <Icon name="stop" size={16} color="#fff" /><Text style={{ fontFamily: FONT.bold, fontSize: 15, color: "#fff" }}>{lt("speakStop")}</Text>
        </Pressable>
      ) : null}
      <Pressable onPress={onSkip} accessibilityRole="button" hitSlop={8} style={{ alignSelf: "center", padding: 8 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted, textDecorationLine: "underline" }}>{lt("skip")}</Text>
      </Pressable>
    </View>
  );
}

/** grammar spotting: the verse words come from the Quran API (never typed by hand); tap the asked word(s) */
export function SpotCard({ ex, onCheck }: { ex: Extract<Ex, { k: "spot" }>; onCheck: Check }) {
  const t = useTheme();
  const lt = useLT();
  const { lang } = useLang();
  const [words, setWords] = useState<VWord[] | null>(null);
  const [err, setErr] = useState(false);
  const [sel, setSel] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  useEffect(() => {
    let live = true;
    setWords(null); setErr(false); setSel([]);
    loadVerse(ex.key, lang).then((d) => { if (live) setWords(d.words); }).catch(() => { if (live) setErr(true); });
    return () => { live = false; };
  }, [ex.key, lang, tries]);
  const toggle = (p: number) => setSel(sel.includes(p) ? sel.filter((x) => x !== p) : [...sel, p]);
  const correct = words ? words.filter((w) => ex.pos.includes(w.position)).map((w) => w.text).join(" ") : "";
  return (
    <View style={{ gap: 12 }}>
      <Prompt>{ex.ask}</Prompt>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "center" }}>{`${lt("spotHint")} · ${ex.key}`}</Text>
      {err ? (
        <View style={{ gap: 10, alignItems: "center" }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{lt("spotOffline")}</Text>
          <Pressable onPress={() => setTries(tries + 1)} accessibilityRole="button" style={{ padding: 8 }}><Text style={{ fontFamily: FONT.semibold, color: t.accent }}>{lt("retry")}</Text></Pressable>
        </View>
      ) : !words ? (
        <View style={{ alignItems: "center", gap: 8, paddingVertical: 20 }}><ActivityIndicator color={t.accent} /><Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{lt("spotLoading")}</Text></View>
      ) : (
        <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 8, direction: "ltr" }}>
          {words.map((w) => {
            const on = sel.includes(w.position);
            return (
              <Pressable key={w.position} onPress={() => toggle(w.position)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${w.tr} – ${w.meaning}`}
                style={{ paddingHorizontal: 10, borderRadius: R.md, borderWidth: on ? 2 : 1, borderColor: on ? t.gold : t.line, backgroundColor: on ? t.accentSoft : t.surface }}>
                <GoldRing on={on} radius={R.md} />
                <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 28, lineHeight: 52, color: t.ink, textAlign: "center" }}>{w.text}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted, textAlign: "center", marginTop: -6, marginBottom: 6 }} numberOfLines={1}>{w.meaning}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      <CheckButton disabled={!sel.length || !words} onPress={() => onCheck(sel.length === ex.pos.length && ex.pos.every((p) => sel.includes(p)), correct)} />
    </View>
  );
}

export function DialogueView({ lines, onNext }: { lines: Line[]; onNext: () => void }) {
  const t = useTheme();
  const lt = useLT();
  const { lang } = useLang();
  const { canSpeak, speak } = useArabicVoice();
  return (
    <View style={{ gap: 12 }}>
      <Prompt>{lt("dialogue")}</Prompt>
      {lines.map((l, i) => {
        const b = l.who === "b";
        return (
          <Pressable key={i} onPress={() => canSpeak && speak(l.ar)} accessibilityRole={canSpeak ? "button" : "text"} accessibilityLabel={lang === "de" ? l.de : l.en}
            style={{ alignSelf: b ? "flex-start" : "flex-end", maxWidth: "88%", borderRadius: R.card, padding: 12, backgroundColor: b ? t.surface : t.accentSoft, borderWidth: 1, borderColor: t.line }}>
            <Ar size={22} center={false}>{l.ar}</Ar>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted }}>{lang === "de" ? l.de : l.en}</Text>
            {canSpeak ? <View style={{ position: "absolute", top: 8, left: 8 }}><Icon name="speaker" size={14} color={t.gold} /></View> : null}
          </Pressable>
        );
      })}
      <CheckButton onPress={onNext} label={lt("next")} />
    </View>
  );
}
