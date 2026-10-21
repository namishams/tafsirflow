import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Directory, File, Paths } from "expo-file-system";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero } from "@/components/page";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { FONT, R, useTheme } from "@/lib/theme";
import { align } from "@/web/recite";
import { VerseWords } from "@/features/reciter-path/Practice";
import { useVerse, wordsOf } from "@/features/reciter-path/useVerse";
import { useMt } from "./texts";
import { Card, Chip, Muted, Recorder, Row, Section, RED, type Take } from "./ui";
import { STUDY_VERSES } from "./StyleStudy";

// Daily recording journal: one recitation a day, private on this device (the audio in the app's documents, the
// numbers under "qmc.mishary.journal", written silently so nothing is synced or shared). Charts per week: average
// loudness from the recorder's metering, pace in words per minute (verse words / recording length) and the
// on-device word check.

const KEY = "qmc.mishary.journal";
export type JournalEntry = { day: string; verseKey: string; durMs: number; avgDb: number; words: number; wpm: number; acc: number | null; file: string };
const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dir = () => new Directory(Paths.document, "mishary-journal");

function avgLoudness(levels: number[]): number {
  const voiced = levels.filter((v) => v > -50);
  const xs = voiced.length >= levels.length / 4 ? voiced : levels;
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : -60;
}
function saveEntry(e: Omit<JournalEntry, "file">, take: Take): boolean {
  try {
    const d = dir();
    if (!d.exists) d.create({ intermediates: true });
    const target = new File(d, `${e.day}.m4a`);
    if (target.exists) target.delete();
    new File(take.uri).copy(target);
    const list = readJSON<JournalEntry[]>(KEY, []).filter((x) => x.day !== e.day);
    writeJSON(KEY, [...list, { ...e, file: target.uri }].sort((a, b) => a.day.localeCompare(b.day)).slice(-800), true);
    return true;
  } catch { return false; }
}
function deleteEntry(day: string) {
  const list = readJSON<JournalEntry[]>(KEY, []);
  const e = list.find((x) => x.day === day);
  try { if (e) { const f = new File(e.file); if (f.exists) f.delete(); } } catch { /* already gone */ }
  writeJSON(KEY, list.filter((x) => x.day !== day), true);
}

// expo-speech-recognition is native: loaded lazily (web and Expo Go still open the screen)
type SR = typeof import("expo-speech-recognition");
let sr: SR | null | undefined;
function speech(): SR | null {
  if (sr === undefined) { try { sr = require("expo-speech-recognition") as SR; } catch { sr = null; } } // eslint-disable-line @typescript-eslint/no-require-imports
  return sr;
}
/** on-device word check that reports the share of verse words heard (memorisation, not tajweed) */
function WordCheckCapture({ words, onResult }: { words: string[]; onResult: (acc: number) => void }) {
  const t = useTheme();
  const mt = useMt();
  const [state, setState] = useState<"idle" | "listening" | "done" | "na">("idle");
  const [acc, setAcc] = useState<number | null>(null);
  const subs = useRef<{ remove: () => void }[]>([]);
  useEffect(() => () => { subs.current.forEach((s) => s.remove()); try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* idle */ } }, []);
  const start = async () => {
    const m = speech()?.ExpoSpeechRecognitionModule;
    try {
      if (!m || !m.isRecognitionAvailable() || !m.supportsOnDeviceRecognition()) { setState("na"); return; }
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setState("na"); return; }
      subs.current.forEach((s) => s.remove());
      subs.current = [
        m.addListener("result", (e) => {
          const ok = align(words, e.results[0]?.transcript ?? "").ok;
          const a = Math.round((ok.filter(Boolean).length / Math.max(1, words.length)) * 100);
          setAcc(a); onResult(a);
        }),
        m.addListener("end", () => setState((s) => (s === "listening" ? "done" : s))),
        m.addListener("error", () => setState("done")),
      ];
      m.start({ lang: "ar-SA", interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: false });
      setState("listening");
    } catch { setState("na"); }
  };
  const stop = () => { try { speech()?.ExpoSpeechRecognitionModule.stop(); } catch { /* ended */ } setState("done"); };
  if (state === "na") return <Muted>{mt("wordCheckNa")}</Muted>;
  return (
    <Row>
      <Pressable onPress={() => (state === "listening" ? stop() : void start())} accessibilityRole="button"
        style={{ height: 40, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: state === "listening" ? RED : t.accent, flexDirection: "row", alignItems: "center", gap: 8 }}>
        {state === "listening" ? <ActivityIndicator color="#fff" size="small" /> : <Icon name="speaker" size={15} color="#fff" />}
        <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: "#fff" }}>{state === "listening" ? mt("wordCheckStop") : mt("wordCheckStart")}</Text>
      </Pressable>
      {acc !== null ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{mt("accuracy", { n: acc })}</Text> : null}
    </Row>
  );
}

/** Monday of the week of a YYYY-MM-DD day */
const weekOf = (day: string) => { const d = new Date(`${day}T12:00:00`); const w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return dayStr(d); };

function LineChart({ points, min, max, color, unit }: { points: { label: string; v: number }[]; min: number; max: number; color: string; unit: string }) {
  const t = useTheme();
  if (!points.length) return null;
  const W = 300, H = 90, pad = 8;
  const x = (i: number) => (points.length === 1 ? W / 2 : pad + (i / (points.length - 1)) * (W - 2 * pad));
  const y = (v: number) => H - pad - ((Math.min(max, Math.max(min, v)) - min) / Math.max(1e-6, max - min)) * (H - 2 * pad);
  const last = points.at(-1)!;
  return (
    <View style={{ gap: 4 }}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Line x1={0} x2={W} y1={H - pad} y2={H - pad} stroke={t.line} strokeWidth={1} />
        <Polyline points={points.map((p, i) => `${x(i)},${y(p.v)}`).join(" ")} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
        {points.map((p, i) => <Circle key={p.label} cx={x(i)} cy={y(p.v)} r={3.5} fill={color} />)}
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Muted size={11}>{points[0].label.slice(5)}</Muted>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.ink }}>{Math.round(last.v)} {unit}</Text>
        <Muted size={11}>{last.label.slice(5)}</Muted>
      </View>
    </View>
  );
}

function EntryRow({ e, onDelete }: { e: JournalEntry; onDelete: () => void }) {
  const t = useTheme();
  const mt = useMt();
  const player = useAudioPlayer(null);
  const st = useAudioPlayerStatus(player);
  const toggle = () => { if (st.playing) { player.pause(); return; } player.replace({ uri: e.file }); void player.seekTo(0); player.play(); };
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: t.line }}>
      <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={mt("play")} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: t.accentSoft }}>
        <Icon name={st.playing ? "pause" : "play"} size={14} color={t.accent} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{e.day} · {e.verseKey}</Text>
        <Muted size={12}>{Math.round(e.durMs / 1000)} s · {mt("wpm", { n: e.wpm })}{e.acc !== null ? ` · ${mt("accuracy", { n: e.acc })}` : ""}</Muted>
      </View>
      <Pressable onPress={onDelete} accessibilityRole="button" accessibilityLabel={mt("delete")} hitSlop={8}><Icon name="close" size={16} color={t.muted} /></Pressable>
    </View>
  );
}

// ——— /mishary/journal ———
export function JournalScreen() {
  const t = useTheme();
  const mt = useMt();
  const entries = useStored<JournalEntry[]>(KEY, []);
  const [key, setKey] = useState(() => readJSON<JournalEntry[]>(KEY, []).at(-1)?.verseKey ?? STUDY_VERSES[0]);
  const { verse } = useVerse(key);
  const [take, setTake] = useState<Take | null>(null);
  const [acc, setAcc] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const today = dayStr();
  const done = entries.some((e) => e.day === today);

  const words = verse ? wordsOf(verse).map((w) => w.text_uthmani) : [];
  const save = () => {
    if (!take || !verse) return;
    const ok = saveEntry({ day: today, verseKey: key, durMs: take.durMs, avgDb: avgLoudness(take.levels), words: words.length, wpm: Math.round((words.length / Math.max(1, take.durMs)) * 60_000), acc }, take);
    setMsg(ok ? mt("saved") : mt("error"));
    if (ok) { setTake(null); setAcc(null); }
  };

  const weeks = useMemo(() => {
    const m = new Map<string, JournalEntry[]>();
    for (const e of entries) { const w = weekOf(e.day); m.set(w, [...(m.get(w) ?? []), e]); }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12)
      .map(([w, es]) => ({ w, loud: es.reduce((a, e) => a + e.avgDb, 0) / es.length + 60, wpm: es.reduce((a, e) => a + e.wpm, 0) / es.length,
        acc: es.some((e) => e.acc !== null) ? es.filter((e) => e.acc !== null).reduce((a, e) => a + (e.acc ?? 0), 0) / es.filter((e) => e.acc !== null).length : null }));
  }, [entries]);
  const streak = useMemo(() => {
    const days = new Set(entries.map((e) => e.day));
    let n = 0; const d = new Date();
    if (!days.has(dayStr(d))) d.setDate(d.getDate() - 1);
    while (days.has(dayStr(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [entries]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={mt("kicker")} title={mt("journalTitle")} lead={mt("journalLead")} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 22 }}>
          <Row><Icon name="lock" size={14} color={t.accent} /><Muted>{mt("journalPrivate")}</Muted></Row>
          <Section title={mt("today")} right={streak ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold }}>{mt("streak", { n: streak })}</Text> : undefined}>
            <Card>
              {done ? <Row><Icon name="checkCircle" size={16} color={t.accent} /><Text style={{ fontFamily: FONT.semibold, color: t.accent }}>{mt("todayDone")}</Text></Row> : null}
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{mt("chooseVerse")}</Text>
              <Row>{STUDY_VERSES.map((k) => <Chip key={k} label={k} on={k === key} onPress={() => { setKey(k); setTake(null); setAcc(null); }} />)}</Row>
              {verse ? <VerseWords verse={verse} size={22} /> : <Muted>{mt("loading")}</Muted>}
              <Recorder key={key} maxSec={120} minSec={2} onTake={(tk) => { setTake(tk); setMsg(""); }} />
              <View style={{ height: 1, backgroundColor: t.line }} />
              <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{mt("wordCheck")}</Text>
              {words.length ? <WordCheckCapture key={key} words={words} onResult={setAcc} /> : null}
              <GoldButton title={mt("saveEntry")} icon="check" disabled={!take || !verse} onPress={save} />
              {msg ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: msg === mt("saved") ? t.accent : RED }}>{msg}</Text> : null}
            </Card>
          </Section>
          <Section title={mt("tabStats")}>
            {weeks.length ? (
              <View style={{ gap: 12 }}>
                <Card><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{mt("chartLoud")}</Text><LineChart points={weeks.map((w) => ({ label: w.w, v: w.loud }))} min={0} max={60} color={t.accent} unit="/60" /><Muted size={12}>{mt("loudNote")}</Muted></Card>
                <Card><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{mt("chartPace")}</Text><LineChart points={weeks.map((w) => ({ label: w.w, v: w.wpm }))} min={0} max={Math.max(60, ...weeks.map((w) => w.wpm))} color={t.gold} unit="wpm" /></Card>
                {weeks.some((w) => w.acc !== null) ? (
                  <Card><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{mt("chartAcc")}</Text><LineChart points={weeks.filter((w) => w.acc !== null).map((w) => ({ label: w.w, v: w.acc! }))} min={0} max={100} color={t.accent} unit="%" /></Card>
                ) : null}
              </View>
            ) : <Muted>{mt("chartEmpty")}</Muted>}
          </Section>
          <Section title={mt("entries")}>
            <Card style={{ gap: 0 }}>
              {entries.length ? [...entries].reverse().slice(0, 30).map((e) => <EntryRow key={e.day} e={e} onDelete={() => deleteEntry(e.day)} />) : <Muted>{mt("noEntries")}</Muted>}
            </Card>
          </Section>
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}
