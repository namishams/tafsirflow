import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, Switch, Text, TextInput, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { VideoView, useVideoPlayer } from "expo-video";
import { ARABIC_FONT, FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton, OutlineButton, Segmented } from "@/components/brand";
import { FormError, LabeledField } from "@/components/form";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { getChapters, type Chapter } from "@/lib/quran";
import { VERSE_COUNTS } from "@/web/counts";
import { T, upload, type PostingStatus } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { AccessGate, SafetyBar, useTalentAccess, useTalentErr } from "@/features/talents/ui";
import { PostingChecklist } from "@/features/talents/Checklist";
import { useST } from "@/features/sijill/text";
import { ClipVisual, useKeyVerses } from "@/features/talents/ClipVisual";
import { PASS, useWordCheck } from "@/features/talents/wordcheck";

// /talents/record – a recitation clip, recorded only here (no upload from the gallery):
// 1 verse(s) by key → 2 on-device word check must pass → 3 record 10–30 s (voice; camera optional, off by default)
// → 4 preview with the generated emerald/gold visual → publish as story (24 h) or post. An admin approves it first.
type Step = "verse" | "check" | "record" | "preview" | "sent";
export default function RecordClip() {
  const t = useTheme();
  const st = useST(); // posting switched off (config): the screen only says so
  const tt = useTT();
  const err = useTalentErr();
  const { lang } = useLang();
  const a = useTalentAccess();
  const [status, setStatus] = useState<PostingStatus | null>(null);
  const [step, setStep] = useState<Step>("verse");
  const [surah, setSurah] = useState<number | null>(null);
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [picker, setPicker] = useState(false);
  const [kind, setKind] = useState<"post" | "story">("post");
  const [video, setVideo] = useState(false);
  const [clip, setClip] = useState<{ uri: string; ms: number; wave: number[]; video: boolean } | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { if (a.state === "ok") T.posting().then(setStatus).catch((e) => setMsg(err(e))); }, [a.state]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);

  const max = surah ? VERSE_COUNTS[surah - 1] : 0;
  const f = Math.min(max, Math.max(1, Number(from) || 1));
  const tv = to ? Math.min(max, Math.min(f + 10, Math.max(f, Number(to) || f))) : f;
  const key = surah ? (tv > f ? `${surah}:${f}-${tv}` : `${surah}:${f}`) : null;
  const { verses } = useKeyVerses(step === "verse" ? null : key);
  const check = useWordCheck(verses);
  const rules = status?.rules;

  const publish = async () => {
    if (!clip || !key) return;
    setBusy(true); setMsg("");
    try {
      await upload("/api/community/posts", {
        type: kind, verseKey: key, durationMs: String(clip.ms), hasVideo: clip.video ? "1" : "0",
        waveform: JSON.stringify(clip.wave), wordCheck: String(Math.round(check.score * 100)), caption,
      }, { file: { uri: clip.uri, name: clip.video ? "clip.mp4" : "clip.m4a", type: clip.video ? "video/mp4" : "audio/mp4" } });
      setStep("sent");
    } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset arcade={false} eyebrow={tt("network")} title={tt("newClip")} lead={tt("recordLead")} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 16 }}>
            {status && status.enabled === false ? (
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted }}>{st("postingOff")}</Text>
            ) : !status ? (msg ? <FormError text={msg} /> : <Loading />) : !status.ok ? (
              <PostingChecklist s={status} />
            ) : step === "sent" ? (
              <View style={{ gap: 14 }}>
                <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 16, lineHeight: 23, color: t.accent }}>{tt("clipSent")}</Text>
                <GoldButton title={tt("myTalentProfile")} onPress={() => router.replace(`/talents/u/${a.me?.profile?.username ?? ""}` as Href)} />
              </View>
            ) : (
              <>
                <Steps step={step} />
                {step === "verse" ? (
                  <View style={{ gap: 14 }}>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted }}>{tt("chooseVerseLead")}</Text>
                    <Pressable onPress={() => setPicker(true)} accessibilityRole="button" style={{ height: 52, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 16, color: surah ? t.ink : t.muted }}>
                        {surah ? `${surah}. ${chapters.find((c) => c.id === surah)?.name_simple ?? ""}` : tt("chooseSurah")}
                      </Text>
                      <Icon name="chevronDown" color={t.muted} size={16} />
                    </Pressable>
                    {surah ? (
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <View style={{ flex: 1 }}><LabeledField label={tt("fromVerse")} value={from} onChangeText={(v) => setFrom(v.replace(/\D/g, "").slice(0, 3))} keyboardType="number-pad" /></View>
                        <View style={{ flex: 1 }}><LabeledField label={tt("toVerse")} hint={tt("toVerseHint")} value={to} onChangeText={(v) => setTo(v.replace(/\D/g, "").slice(0, 3))} keyboardType="number-pad" placeholder={String(f)} /></View>
                      </View>
                    ) : null}
                    {key ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{tt("selected")}: {key}</Text> : null}
                    <GoldButton title={tt("next")} onPress={() => setStep("check")} disabled={!key} />
                  </View>
                ) : step === "check" ? (
                  <View style={{ gap: 14 }}>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted }}>{tt("checkLead", { n: Math.round(PASS * 100) })}</Text>
                    {!verses ? <Loading /> : (
                      <View style={{ flexDirection: "row-reverse", direction: "ltr", flexWrap: "wrap", gap: 6, padding: 12, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                        {check.words.map((w, i) => (
                          <Text key={i} style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 40, paddingHorizontal: 4, borderRadius: R.sm, color: check.ok ? (check.ok[i] ? t.accent : t.danger) : t.ink, backgroundColor: check.ok?.[i] ? t.accentSoft : "transparent" }}>{w}</Text>
                        ))}
                      </View>
                    )}
                    {check.state === "unavailable" ? <FormError text={tt("checkUnavailable")} /> : check.state === "denied" ? <FormError text={tt("micDenied")} /> : (
                      <OutlineButton title={check.state === "listening" ? tt("checkStop") : tt("checkStart")} onPress={() => (check.state === "listening" ? check.stop() : void check.start())} disabled={!verses} />
                    )}
                    {check.ok ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: check.passed ? t.accent : t.muted }}>{tt("checkScore", { n: Math.round(check.score * 100) })}{check.passed ? ` · ${tt("checkPassed")}` : ""}</Text> : null}
                    <GoldButton title={tt("next")} onPress={() => { check.stop(); setStep("record"); }} disabled={!check.passed} />
                    <OutlineButton title={tt("back")} onPress={() => setStep("verse")} />
                  </View>
                ) : step === "record" && rules ? (
                  <Recorder minS={rules.minSeconds} maxS={rules.maxSeconds} video={video} setVideo={setVideo} kind={kind} setKind={setKind}
                    onDone={(c) => { setClip(c); setStep("preview"); }} />
                ) : step === "preview" && clip && key ? (
                  <View style={{ gap: 14 }}>
                    <Preview clip={clip} verseKey={key} name={a.me?.profile?.name ?? ""} />
                    <LabeledField label={tt("caption")} value={caption} onChangeText={setCaption} maxLength={300} multiline />
                    <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{kind === "story" ? tt("storyNote", { n: rules?.storyHours ?? 24 }) : tt("postNote")}</Text>
                    <FormError text={msg} />
                    <GoldButton title={tt("publish")} onPress={() => void publish()} busy={busy} disabled={busy} />
                    <OutlineButton title={tt("recordAgain")} onPress={() => { setClip(null); setStep("record"); }} />
                  </View>
                ) : null}
              </>
            )}
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
      <SurahPicker visible={picker} chapters={chapters} onClose={() => setPicker(false)} onPick={(s) => { setSurah(s); setFrom("1"); setTo(""); setPicker(false); }} />
    </>
  );
}

function Steps({ step }: { step: Step }) {
  const t = useTheme();
  const tt = useTT();
  const all: [Step, string][] = [["verse", tt("stepVerse")], ["check", tt("stepCheck")], ["record", tt("stepRecord")], ["preview", tt("stepPreview")]];
  const at = all.findIndex(([s]) => s === step);
  return (
    <View accessible accessibilityLabel={`${at + 1}/${all.length}: ${all[at]?.[1] ?? ""}`} style={{ flexDirection: "row", gap: 6 }}>
      {all.map(([s, label], i) => (
        <View key={s} style={{ flex: 1, gap: 4 }}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: i <= at ? goldButton.to : t.line }} />
          <Text numberOfLines={1} style={{ fontFamily: i === at ? FONT.bold : FONT.regular, fontSize: 11.5, color: i === at ? t.ink : t.muted }}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

/** voice recorder with metering (or the camera when video is on); stops by itself at maxS */
function Recorder({ minS, maxS, video, setVideo, kind, setKind, onDone }: {
  minS: number; maxS: number; video: boolean; setVideo: (v: boolean) => void; kind: "post" | "story"; setKind: (k: "post" | "story") => void;
  onDone: (c: { uri: string; ms: number; wave: number[]; video: boolean }) => void;
}) {
  const t = useTheme();
  const tt = useTT();
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const rec = useAudioRecorderState(recorder, 100);
  const levels = useRef<number[]>([]);
  const [msg, setMsg] = useState("");
  const [camPerm, askCam] = useCameraPermissions();
  const [micPerm, askMic] = useMicrophonePermissions();
  const cam = useRef<CameraView>(null);
  const [camRec, setCamRec] = useState(false);
  const [camMs, setCamMs] = useState(0);
  const camStart = useRef(0);

  useEffect(() => {
    if (rec.isRecording && typeof rec.metering === "number") levels.current.push(Math.round(((Math.min(0, Math.max(-60, rec.metering)) + 60) / 60) * 100));
    if (rec.isRecording && rec.durationMillis >= maxS * 1000) void stopAudio();
  }, [rec.durationMillis]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!camRec) return;
    const h = setInterval(() => setCamMs(Date.now() - camStart.current), 200);
    return () => clearInterval(h);
  }, [camRec]);

  const bars = (v: number[]) => { const n = 60; if (v.length <= n) return v; return Array.from({ length: n }, (_, i) => Math.max(...v.slice(Math.floor((i * v.length) / n), Math.floor(((i + 1) * v.length) / n)))); };
  const startAudio = async () => {
    try {
      const p = await requestRecordingPermissionsAsync();
      if (!p.granted) { setMsg(tt("micDenied")); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      levels.current = []; setMsg("");
      recorder.record();
    } catch { setMsg(tt("micDenied")); }
  };
  async function stopAudio() {
    const ms = rec.durationMillis;
    try { await recorder.stop(); } catch { /* stopped */ }
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    if (ms < minS * 1000) { setMsg(tt("tooShort", { n: minS })); return; }
    if (recorder.uri) onDone({ uri: recorder.uri, ms: Math.min(ms, maxS * 1000), wave: bars(levels.current), video: false });
  }
  const startVideo = async () => {
    if (!camPerm?.granted && !(await askCam()).granted) { setMsg(tt("camDenied")); return; }
    if (!micPerm?.granted && !(await askMic()).granted) { setMsg(tt("micDenied")); return; }
    if (!cam.current) return;
    setMsg(""); setCamRec(true); camStart.current = Date.now(); setCamMs(0);
    try {
      const r = await cam.current.recordAsync({ maxDuration: maxS });
      const ms = Date.now() - camStart.current;
      setCamRec(false);
      if (ms < minS * 1000) { setMsg(tt("tooShort", { n: minS })); return; }
      if (r?.uri) onDone({ uri: r.uri, ms: Math.min(ms, maxS * 1000), wave: [], video: true });
    } catch { setCamRec(false); setMsg(tt("e_generic")); }
  };
  const recording = rec.isRecording || camRec;
  const secs = Math.floor((rec.isRecording ? rec.durationMillis : camMs) / 1000);
  return (
    <View style={{ gap: 14 }}>
      <Segmented<"post" | "story"> value={kind} onChange={setKind} options={[["post", tt("typePost")], ["story", tt("typeStory")]]} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{tt("withVideo")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{tt("withVideoHint")}</Text>
        </View>
        <Switch value={video} onValueChange={setVideo} disabled={recording} trackColor={{ true: t.accent }} accessibilityLabel={tt("withVideo")} />
      </View>
      {video ? (
        <View style={{ height: 380, borderRadius: R.lg, overflow: "hidden", backgroundColor: "#000" }}>
          <CameraView ref={cam} style={{ flex: 1 }} facing="front" mode="video" mute={false} />
        </View>
      ) : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted }}>{tt("recordHint", { n: minS, m: maxS })}</Text>
      <Pressable onPress={() => (recording ? (camRec ? cam.current?.stopRecording() : void stopAudio()) : video ? void startVideo() : void startAudio())}
        accessibilityRole="button" accessibilityLabel={recording ? tt("stopRec") : tt("startRec")}
        style={{ alignSelf: "center", width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: goldButton.line, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: recording ? 30 : 62, height: recording ? 30 : 62, borderRadius: recording ? 6 : 31, backgroundColor: "rgb(178,58,52)" }} />
      </Pressable>
      {recording ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "center", fontVariant: ["tabular-nums"] }}>{secs} / {maxS} s</Text> : null}
      <FormError text={msg} />
    </View>
  );
}

function Preview({ clip, verseKey, name }: { clip: { uri: string; ms: number; wave: number[]; video: boolean }; verseKey: string; name: string }) {
  const tt = useTT();
  const audio = useAudioPlayer(clip.video ? null : { uri: clip.uri });
  const st = useAudioPlayerStatus(audio);
  const vplayer = useVideoPlayer(clip.video ? { uri: clip.uri } : null, (p) => { p.loop = true; });
  const progress = st.duration ? st.currentTime / st.duration : 0;
  return (
    <View style={{ gap: 10 }}>
      <View style={{ height: 460, borderRadius: R.lg, overflow: "hidden" }}>
        {clip.video ? <VideoView player={vplayer} style={{ flex: 1 }} contentFit="cover" nativeControls /> : <ClipVisual verseKey={verseKey} name={name} waveform={clip.wave} progress={st.playing ? progress : 1} />}
      </View>
      {!clip.video ? <OutlineButton title={st.playing ? tt("pause") : tt("listen")} onPress={() => { if (st.playing) audio.pause(); else { if (st.didJustFinish || progress >= 0.99) void audio.seekTo(0); audio.play(); } }} /> : null}
    </View>
  );
}

function SurahPicker({ visible, chapters, onClose, onPick }: { visible: boolean; chapters: Chapter[]; onClose: () => void; onPick: (s: number) => void }) {
  const t = useTheme();
  const tt = useTT();
  const [q, setQ] = useState("");
  const data = useMemo(() => {
    const all = chapters.length ? chapters : Array.from({ length: 114 }, (_, i) => ({ id: i + 1, name_simple: String(i + 1), name_arabic: "", verses_count: VERSE_COUNTS[i], translated_name: { name: "" } } as Chapter));
    const f = q.trim().toLowerCase();
    return f ? all.filter((c) => String(c.id) === f || c.name_simple.toLowerCase().includes(f)) : all;
  }, [chapters, q]);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}>
          <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{tt("chooseSurah")}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tt("cancel")} hitSlop={10} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}><Icon name="close" color={t.muted} size={20} /></Pressable>
        </View>
        <View style={{ margin: 16, height: 46, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14, justifyContent: "center" }}>
          <TextInput value={q} onChangeText={setQ} placeholder={tt("search")} placeholderTextColor={t.muted} accessibilityLabel={tt("search")} style={{ fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
        </View>
        {!data.length ? <ActivityIndicator /> : (
          <FlatList data={data} keyExtractor={(c) => String(c.id)} keyboardShouldPersistTaps="handled" renderItem={({ item: c }) => (
            <Pressable onPress={() => onPick(c.id)} accessibilityRole="button" style={({ pressed }) => ({ minHeight: 54, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: t.line, backgroundColor: pressed ? t.surface : t.bg })}>
              <Text style={{ width: 30, fontFamily: FONT.semibold, fontSize: 13, color: t.gold }}>{c.id}</Text>
              <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{c.name_simple}</Text>
              {c.name_arabic ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 18, color: t.ink }}>{c.name_arabic}</Text> : null}
            </Pressable>
          )} />
        )}
      </View>
    </Modal>
  );
}
