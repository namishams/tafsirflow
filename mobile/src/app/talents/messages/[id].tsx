import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance, type TextInputInstance } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { VideoView, useVideoPlayer } from "expo-video";
import { FONT, R, useTheme } from "@/lib/theme";
import { PageHero, Loading } from "@/components/page";
import { GLASS_R, GlassButton, GlassIconButton, GlassSurface, GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { T, errCode, mediaSource } from "@/features/talents/api";
import { AccessGate, ReportSheet, SafetyBar, useTalentAccess } from "@/features/talents/ui";
import { M, REACTIONS, openViewOnce, type ChatMessage, type Reaction, type ThreadInfo } from "@/features/messenger/api";
import { errorText, fill, systemLine } from "@/features/messenger/text";
import {
  ImageBubble, ProfileMiniCard, REACTION_ICON, ReactionRow, ShareCardBubble, SwipeToReply, ThreadAvatar, VideoTile, ViewOnceBubble, VoiceBubble, cardLabel, reactionLabel, useMT,
} from "@/features/messenger/ui";

// /talents/messages/[id] – one chat (one-to-one, group or study-circle chat). Text, replies (long press or swipe),
// reactions (icons), photos and videos (re-encoded without metadata on the device and again on the server), view-once
// photos and videos (one-to-one, both 18+; opened once, then wiped), voice notes with a waveform, shared cards (verse,
// surah, course, carousel, profile, post), editing within 15 minutes, delete for me, unsend, read receipts, typing,
// and the profile mini card with the opt-in "active now" dot. Polls every 4 seconds while open. Incoming message
// requests show accept / decline / report / block first. Screenshots cannot be prevented (stated in the attach sheet).
const MAX_VOICE_MS = 120_000;
const MAX_VIDEO_MS = 60_000;
type Src = { uri: string; headers?: Record<string, string> };

/** full-screen video (a chat video with the sign-in header, or a view-once file from the cache) */
function VideoModal({ src, onClose, label }: { src: Src | null; onClose: () => void; label: string }) {
  const player = useVideoPlayer(src ? { uri: src.uri, headers: src.headers } : null, (p) => { p.loop = false; });
  useEffect(() => { if (src) player.play(); }, [src, player]);
  return (
    <Modal visible={!!src} transparent animationType="fade" onRequestClose={onClose} supportedOrientations={["portrait", "landscape"]}>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {src ? <VideoView player={player} style={{ flex: 1 }} nativeControls contentFit="contain" allowsPictureInPicture={false} /> : null}
        <View style={{ position: "absolute", top: 54, right: 16 }}>
          <GlassIconButton size={44} icon="close" label={label} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

export default function Chat() {
  const t = useTheme();
  const mt = useMT();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const a = useTalentAccess();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [info, setInfo] = useState<ThreadInfo | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[] | null>(null);
  const [more, setMore] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [sheet, setSheet] = useState<ChatMessage | null>(null);
  const [attach, setAttach] = useState(false);
  const [report, setReport] = useState<{ messageId: string | null } | null>(null);
  const [full, setFull] = useState<Src | null>(null);
  const [video, setVideo] = useState<Src | null>(null);
  const once = useRef<(() => void) | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);
  const input = useRef<TextInputInstance>(null);
  const lastTyping = useRef(0);
  const atBottom = useRef(true);
  const lastTap = useRef<{ id: string; at: number }>({ id: "", at: 0 });
  // double tap: MashaAllah (like the heart on other messengers)
  const tap = (m: ChatMessage) => {
    const now = Date.now();
    if (lastTap.current.id === m.id && now - lastTap.current.at < 320) { lastTap.current = { id: "", at: 0 }; if (m.myReaction !== "mashallah") void react(m, "mashallah"); return; }
    lastTap.current = { id: m.id, at: now };
  };

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const d = await M.page(id);
      setInfo(d.thread); setCanSend(d.canSend); setProblem(d.sendProblem);
      setMsgs((old) => {
        const first = d.messages[0]?.id;
        const keep = old && first ? old.filter((m) => Number(m.id) < Number(first)) : [];
        return [...keep, ...d.messages];
      });
      setMore((m) => m ?? d.more);
    } catch (e) { setNote(errorText(mt, errCode(e))); setMsgs((m) => m ?? []); }
  }, [id, mt]);
  useEffect(() => {
    if (a.state !== "ok") return;
    void load();
    const h = setInterval(() => { void load(); }, 4000);
    return () => clearInterval(h);
  }, [a.state, load]);

  const older = async () => {
    if (!id || !more) return;
    try { const d = await M.page(id, { before: more }); setMsgs((o) => [...d.messages, ...(o ?? [])]); setMore(d.more); } catch (e) { setNote(errorText(mt, errCode(e))); }
  };
  const appendMine = (m: ChatMessage | null) => {
    if (m) setMsgs((o) => [...(o ?? []).filter((x) => x.id !== m.id), m]);
    setReplyTo(null);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);
  };
  const replace = (m: ChatMessage | null) => { if (m) setMsgs((o) => (o ?? []).map((x) => (x.id === m.id ? m : x))); };
  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setNote("");
    try { await fn(); } catch (e) { setNote(errorText(mt, errCode(e))); } finally { setBusy(false); }
  };
  const send = () => run(async () => {
    const body = text.trim();
    if (!id) return;
    if (editing) {
      if (!body && editing.kind === "text") return;
      const d = await M.edit(editing.id, body);
      replace(d.message); setEditing(null); setText("");
      return;
    }
    if (!body) return;
    const d = await M.sendText(id, body, replyTo?.id);
    setText(""); appendMine(d.message);
  });
  const onType = (v: string) => {
    setText(v);
    if (id && v && !editing && Date.now() - lastTyping.current > 3000) { lastTyping.current = Date.now(); void M.typing(id).catch(() => undefined); }
  };
  const startReply = useCallback((m: ChatMessage) => { setEditing(null); setReplyTo(m); setTimeout(() => input.current?.focus(), 50); }, []);
  const startEdit = (m: ChatMessage) => { setSheet(null); setReplyTo(null); setEditing(m); setText(m.text ?? ""); setTimeout(() => input.current?.focus(), 50); };

  // photo: the system picker (no access to the whole library), re-encoded as JPEG of at most 1600 px on the device
  const pickPhoto = (viewOnce = false) => run(async () => {
    setAttach(false);
    if (!id) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.9, exif: false });
    if (r.canceled || !r.assets[0]) return;
    const asset = r.assets[0];
    const scale = Math.min(1, 1600 / Math.max(asset.width || 1600, asset.height || 1600));
    const ctx = ImageManipulator.manipulate(asset.uri).resize({ width: Math.round((asset.width || 1600) * scale), height: Math.round((asset.height || 1600) * scale) });
    const img = await (await ctx.renderAsync()).saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
    const d = await M.sendImage(id, img.uri, replyTo?.id, viewOnce);
    appendMine(d.message);
  });
  // video: up to one minute from the system picker, converted to H.264 without metadata on the server
  const pickVideo = (viewOnce = false) => run(async () => {
    setAttach(false);
    if (!id) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["videos"], videoMaxDuration: MAX_VIDEO_MS / 1000, allowsEditing: true, quality: 0.7, exif: false,
      videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720 });
    if (r.canceled || !r.assets[0]) return;
    const asset = r.assets[0];
    const d = await M.sendVideo(id, asset.uri, Math.min(asset.duration ?? 0, MAX_VIDEO_MS), replyTo?.id, viewOnce);
    appendMine(d.message);
  });
  const openOnce = (m: ChatMessage) => run(async () => {
    const f = await openViewOnce(m.id);
    once.current = f.done;
    setMsgs((o) => (o ?? []).map((x) => (x.id === m.id ? { ...x, viewOnce: { opened: true, canOpen: false } } : x)));
    if (f.video) setVideo({ uri: f.uri }); else setFull({ uri: f.uri });
  });
  const closeMedia = () => { setFull(null); setVideo(null); once.current?.(); once.current = null; };
  const openVideo = async (path: string) => setVideo(await mediaSource(path));

  // voice note: tap to start, tap to send (at most two minutes, stops by itself); levels are kept for the waveform
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const rec = useAudioRecorderState(recorder, 120);
  const [recording, setRecording] = useState(false);
  const levels = useRef<number[]>([]);
  useEffect(() => {
    if (!recording || typeof rec.metering !== "number") return;
    // metering is in dB (about -60 silent to 0 loud) -> 0..9
    levels.current.push(Math.max(0, Math.min(9, Math.round(((rec.metering + 55) / 55) * 9))));
  }, [recording, rec.metering]);
  const startRec = async () => {
    const p = await requestRecordingPermissionsAsync();
    if (!p.granted) { setNote(mt.micDenied); return; }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    levels.current = [];
    recorder.record();
    setRecording(true);
  };
  const stopRec = async (sendIt: boolean) => {
    const ms = rec.durationMillis ?? 0;
    try { await recorder.stop(); } catch { /* already stopped */ }
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    setRecording(false);
    if (!sendIt || !recorder.uri || !id || ms < 700) return;
    const l = levels.current;
    const wave = l.length ? Array.from({ length: Math.min(64, l.length) }, (_, i) => l[Math.floor((i / Math.min(64, l.length)) * l.length)]).join("") : undefined;
    await run(async () => { const d = await M.sendVoice(id, recorder.uri!, Math.min(ms, MAX_VOICE_MS), replyTo?.id, wave); appendMine(d.message); });
  };
  useEffect(() => { if (recording && (rec.durationMillis ?? 0) >= MAX_VOICE_MS) void stopRec(true); }, [recording, rec.durationMillis]); // eslint-disable-line react-hooks/exhaustive-deps

  const react = async (m: ChatMessage, r: Reaction) => {
    setSheet(null);
    const next = m.myReaction === r ? null : r;
    setMsgs((o) => (o ?? []).map((x) => {
      if (x.id !== m.id) return x;
      const reactions = { ...x.reactions };
      if (x.myReaction) reactions[x.myReaction] = Math.max(0, (reactions[x.myReaction] ?? 1) - 1);
      if (next) reactions[next] = (reactions[next] ?? 0) + 1;
      return { ...x, reactions, myReaction: next };
    }));
    try { await M.react(m.id, next); } catch (e) { setNote(errorText(mt, errCode(e))); }
  };
  const del = (m: ChatMessage) => {
    setSheet(null);
    Alert.alert(mt.delete, mt.deleteConfirm, [{ text: mt.cancel, style: "cancel" }, { text: mt.delete, style: "destructive", onPress: () => void run(async () => {
      await M.remove(m.id);
      setMsgs((o) => (o ?? []).map((x) => (x.id === m.id ? { ...x, deleted: true, text: null, media: null, card: null, viewOnce: null, reactions: {} } : x)));
    }) }]);
  };
  const hide = (m: ChatMessage) => {
    setSheet(null);
    Alert.alert(mt.deleteForMe, mt.deleteForMeConfirm, [{ text: mt.cancel, style: "cancel" }, { text: mt.deleteForMe, style: "destructive", onPress: () => void run(async () => {
      await M.hide(m.id);
      setMsgs((o) => (o ?? []).filter((x) => x.id !== m.id));
    }) }]);
  };
  const block = () => info?.with && Alert.alert(mt.block, mt.confirmBlock, [{ text: mt.cancel, style: "cancel" }, {
    text: mt.block, style: "destructive", onPress: () => void T.block(info.with!.username, true).then(() => router.back()).catch((e) => setNote(errorText(mt, errCode(e)))),
  }]);
  const answer = (action: "accept" | "decline") => run(async () => {
    if (!id) return;
    await M.request(id, action);
    if (action === "decline") router.back(); else await load();
  });

  const time = (iso: string) => new Date(iso).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" });
  const isGroup = info && info.kind !== "direct";
  const lastMine = msgs ? [...msgs].reverse().find((m) => m.mine && m.kind !== "system") : undefined;
  const seenLine = (() => {
    if (!info || !lastMine) return "";
    if (info.kind === "direct") return info.readUpTo !== null && Number(lastMine.id) <= info.readUpTo ? mt.seen : mt.sent;
    const n = (info.readers ?? []).filter((r) => r >= Number(lastMine.id)).length;
    return n ? fill(mt.seenBy, n) : mt.sent;
  })();
  const incoming = info?.request?.incoming && info.request.status === "pending";
  const kindLabel = (m: Pick<ChatMessage, "kind" | "text" | "card" | "viewOnce">) =>
    m.viewOnce ? (m.kind === "video" ? mt.viewOnceVideo : mt.viewOncePhoto)
      : m.kind === "image" ? mt.photoMsg : m.kind === "voice" ? mt.voiceMsg : m.kind === "video" ? mt.videoMsg
      : m.kind === "share" && m.card ? `${cardLabel(mt, m.card.type)}: ${m.card.title}` : m.text ?? "";
  const live = (m: ChatMessage) => !m.deleted && !m.removed;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
        <PageHero back topInset arcade={false} eyebrow={info?.kind === "circle" ? mt.circleChat : isGroup ? fill(mt.members, info?.memberCount ?? 0) : mt.title} title={info?.kind === "direct" ? "" : info?.title ?? ""} />
        <AccessGate a={a}>
          {!msgs || !info ? <Loading /> : (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 8 }}>
                {info.kind === "direct" && info.with ? (
                  <ProfileMiniCard who={info.with} card={info.card} active={!!info.active} t={mt} />
                ) : (
                  <>
                    <ThreadAvatar kind={info.kind} title={info.title} photo={info.photo} size={36} />
                    <Pressable style={{ flex: 1, minHeight: 40, justifyContent: "center" }} accessibilityRole="link" onPress={() => router.push(`/talents/messages/info/${info.id}` as Href)}>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{mt.groupInfo}</Text>
                    </Pressable>
                  </>
                )}
                {info.kind === "direct" ? (
                  <GlassIconButton size={38} icon="flag" label={mt.reportChat} onPress={() => setReport({ messageId: null })} />
                ) : (
                  <GlassIconButton size={38} icon="settings" label={mt.groupInfo} onPress={() => router.push(`/talents/messages/info/${info.id}` as Href)} />
                )}
              </View>

              <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 6 }} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled"
                onScroll={(e) => { const n = e.nativeEvent; atBottom.current = n.contentOffset.y + n.layoutMeasurement.height >= n.contentSize.height - 80; }} scrollEventThrottle={100}
                onContentSizeChange={() => { if (atBottom.current) scroll.current?.scrollToEnd({ animated: false }); }}>
                {more ? <Pressable onPress={() => void older()} accessibilityRole="button" style={{ alignSelf: "center", minHeight: 40, justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{mt.loadOlder}</Text></Pressable> : null}
                {info.kind === "circle" ? <Text style={{ textAlign: "center", fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, paddingBottom: 6 }}>{mt.circleHint}</Text> : null}
                {msgs.map((m) => m.kind === "system" ? (
                  <Text key={m.id} style={{ alignSelf: "center", fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, paddingVertical: 4 }}>{systemLine(mt, m.system)}</Text>
                ) : (
                  <SwipeToReply key={m.id} mine={m.mine} enabled={canSend && live(m)} onReply={() => startReply(m)}>
                    <View style={{ alignSelf: m.mine ? "flex-end" : "flex-start", maxWidth: "84%", alignItems: m.mine ? "flex-end" : "flex-start" }}>
                      {isGroup && !m.mine && m.sender ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold, marginBottom: 2, marginHorizontal: 6 }}>{m.sender.name}</Text> : null}
                      <Pressable onPress={live(m) && m.kind !== "voice" && !m.viewOnce ? () => tap(m) : undefined} onLongPress={live(m) ? () => setSheet(m) : undefined} delayLongPress={300}
                        accessibilityRole="text" accessibilityHint={mt.doubleTapHint}
                        accessibilityLabel={`${m.mine ? `${mt.you}: ` : m.sender ? `${m.sender.name}: ` : ""}${m.deleted ? mt.deleted : m.removed ? mt.removed : kindLabel(m)}${m.kind !== "text" && m.text ? ` ${m.text}` : ""}${m.edited ? `, ${mt.edited}` : ""}, ${time(m.at)}`}
                        accessibilityActions={live(m) ? [{ name: "activate", label: mt.react }, { name: "reply", label: mt.reply }, ...(m.editable ? [{ name: "edit", label: mt.edit }] : []),
                          { name: "hide", label: mt.deleteForMe }, ...(m.mine ? [{ name: "delete", label: mt.delete }] : [{ name: "report", label: mt.reportMsg }])] : undefined}
                        onAccessibilityAction={(e) => {
                          const n = e.nativeEvent.actionName;
                          if (n === "reply") startReply(m); else if (n === "edit") startEdit(m); else if (n === "hide") hide(m); else if (n === "delete") del(m);
                          else if (n === "report") setReport({ messageId: m.id }); else setSheet(m);
                        }}
                        style={{ paddingHorizontal: (m.kind === "image" || m.kind === "video") && !m.viewOnce ? 4 : 13, paddingVertical: (m.kind === "image" || m.kind === "video") && !m.viewOnce ? 4 : 9, borderRadius: R.card,
                          backgroundColor: m.mine ? "rgb(8,58,44)" : t.surface, borderWidth: m.mine ? 0 : 1, borderColor: t.line, gap: 6 }}>
                        {m.reply ? (
                          <View style={{ borderLeftWidth: 3, borderLeftColor: t.gold, paddingLeft: 8, paddingVertical: 2, marginHorizontal: m.kind === "image" ? 8 : 0, marginTop: m.kind === "image" ? 6 : 0 }}>
                            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: m.mine ? "#E2C77F" : t.gold }}>{m.reply.name || mt.you}</Text>
                            <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 13, color: m.mine ? "rgba(255,255,255,0.75)" : t.muted }}>
                              {m.reply.gone ? mt.deleted : m.reply.kind === "image" ? mt.photoMsg : m.reply.kind === "voice" ? mt.voiceMsg : m.reply.kind === "video" ? mt.videoMsg : m.reply.kind === "share" ? mt.sharedMsg : m.reply.text ?? ""}
                            </Text>
                          </View>
                        ) : null}
                        {m.deleted || m.removed ? (
                          <Text style={{ fontFamily: FONT.italic, fontSize: 14.5, color: m.mine ? "rgba(255,255,255,0.7)" : t.muted }}>{m.deleted ? mt.deleted : mt.removed}</Text>
                        ) : m.viewOnce ? (
                          <ViewOnceBubble video={m.kind === "video"} opened={m.viewOnce.opened} canOpen={m.viewOnce.canOpen} mine={m.mine} t={mt} onOpen={() => void openOnce(m)} />
                        ) : (
                          <>
                            {m.kind === "image" && m.media ? <ImageBubble path={m.media} onOpen={setFull} /> : null}
                            {m.kind === "video" && m.media ? <VideoTile durationMs={m.durationMs} label={mt.videoMsg} onOpen={() => void openVideo(m.media!)} /> : null}
                            {m.kind === "voice" && m.media ? <VoiceBubble id={m.id} path={m.media} wave={m.wave} durationMs={m.durationMs} mine={m.mine} labels={{ play: mt.play, pause: mt.pause, voice: mt.voiceMsg }} /> : null}
                            {m.kind === "share" && m.card ? <ShareCardBubble card={m.card} mine={m.mine} t={mt} /> : null}
                            {m.text ? <Text selectable style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 21, color: m.mine ? "#ffffff" : t.ink, paddingHorizontal: m.kind === "image" || m.kind === "video" ? 8 : 0 }}>{m.text}</Text> : null}
                          </>
                        )}
                        <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: m.mine ? "rgba(255,255,255,0.6)" : t.muted, alignSelf: "flex-end", paddingHorizontal: m.kind === "image" || m.kind === "video" ? 8 : 0, paddingBottom: m.kind === "image" || m.kind === "video" ? 4 : 0 }}>
                          {m.edited && live(m) ? `${mt.edited} · ` : ""}{time(m.at)}
                        </Text>
                      </Pressable>
                      <ReactionRow reactions={m.reactions} mine={m.myReaction} onPress={(r) => void react(m, r)} t={mt} />
                      {lastMine && m.id === lastMine.id && seenLine ? <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted, marginTop: 2 }}>{seenLine}</Text> : null}
                    </View>
                  </SwipeToReply>
                ))}
                {info.typing.length ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.italic, fontSize: 13, color: t.muted }}>{info.typing.length > 1 ? mt.typingMany : fill(mt.typing, info.typing[0])}</Text> : null}
              </ScrollView>

              {note ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.danger, paddingHorizontal: 16, paddingBottom: 6 }}>{note}</Text> : null}

              {incoming ? (
                <View style={{ padding: 16, paddingBottom: insets.bottom + 12, gap: 10, borderTopWidth: 1, borderTopColor: t.line }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{fill(mt.requestIncoming, info.title)}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{mt.requestsHint}</Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <GoldButton compact title={mt.accept} onPress={() => void answer("accept")} busy={busy} style={{ flex: 1 }} />
                    <GlassButton compact title={mt.decline} onPress={() => void answer("decline")} style={{ flex: 1 }} />
                  </View>
                  <SafetyBar onReport={() => setReport({ messageId: null })} onBlock={block} />
                </View>
              ) : canSend ? (
                <View style={{ paddingHorizontal: 10, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 10) }}>
                  {problem === "request_text_only" || (info.request && !info.request.incoming) ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, paddingHorizontal: 8, paddingBottom: 6 }}>{mt.requestWait}</Text> : null}
                  {replyTo || editing ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingBottom: 6 }}>
                      <Icon name={editing ? "pen" : "reply"} size={15} color={t.gold} />
                      <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>
                        {editing ? mt.editing : `${fill(mt.replyingTo, replyTo!.mine ? mt.you : replyTo!.sender?.name ?? "")}: ${kindLabel(replyTo!)}`}
                      </Text>
                      <Pressable onPress={() => { if (editing) { setEditing(null); setText(""); } setReplyTo(null); }} accessibilityRole="button" accessibilityLabel={mt.cancel} hitSlop={10}><Icon name="close" size={15} color={t.muted} /></Pressable>
                    </View>
                  ) : null}
                  {/* glass composer dock: sits on the safe area and moves up with the keyboard */}
                  <GlassSurface strong style={{ borderRadius: GLASS_R.dock, padding: 6, flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
                    {recording ? (
                      <>
                        <GlassIconButton size={42} icon="close" label={mt.cancel} onPress={() => void stopRec(false)} />
                        <View style={{ flex: 1, minHeight: 42, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 6 }}>
                          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "rgb(190,60,60)" }} />
                          <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>
                            {mt.recording} {Math.floor((rec.durationMillis ?? 0) / 60000)}:{String(Math.floor(((rec.durationMillis ?? 0) % 60000) / 1000)).padStart(2, "0")} / 2:00
                          </Text>
                        </View>
                        <GlassIconButton size={42} variant="gold" icon="send" label={mt.stopSend} onPress={() => void stopRec(true)} />
                      </>
                    ) : (
                      <>
                        {problem !== "request_text_only" && !editing ? <GlassIconButton size={42} icon="plus" label={`${mt.photo}, ${mt.video}`} onPress={() => setAttach(true)} disabled={busy} /> : null}
                        <TextInput ref={input} value={text} onChangeText={onType} placeholder={editing ? mt.editing : mt.write} placeholderTextColor={t.muted} accessibilityLabel={editing ? mt.editing : mt.write} multiline maxLength={2000}
                          style={{ flex: 1, minHeight: 42, maxHeight: 130, paddingHorizontal: 10, paddingTop: 11, paddingBottom: 11, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
                        {text.trim() || editing ? (
                          <GlassIconButton size={42} variant="gold" icon={editing ? "check" : "send"} label={editing ? mt.save : mt.send} onPress={() => void send()} disabled={busy} />
                        ) : problem !== "request_text_only" ? (
                          <GlassIconButton size={42} icon="mic" label={mt.voice} onPress={() => void startRec()} disabled={busy} />
                        ) : null}
                      </>
                    )}
                  </GlassSurface>
                </View>
              ) : (
                <View style={{ padding: 16, paddingBottom: insets.bottom + 16, gap: 10, borderTopWidth: 1, borderTopColor: t.line }}>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted }}>{errorText(mt, problem)}</Text>
                  {problem === "pro_required" ? <GoldButton compact title={mt.proCta} onPress={() => router.push("/pro" as Href)} /> : null}
                  {info.kind === "direct" ? <SafetyBar onReport={() => setReport({ messageId: null })} onBlock={block} /> : null}
                </View>
              )}
            </>
          )}
        </AccessGate>
      </KeyboardAvoidingView>

      {/* attach: photo, video, and view once (one-to-one, both 18+) with the screenshot note */}
      <Modal visible={attach} transparent animationType="fade" onRequestClose={() => setAttach(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end", padding: 12, paddingBottom: insets.bottom + 12 }} onPress={() => setAttach(false)} accessibilityLabel={mt.cancel}>
          <Pressable onPress={() => undefined}>
            <GlassSurface strong style={{ borderRadius: GLASS_R.card, padding: 14, gap: 10, backgroundColor: t.surface }}>
              <GlassButton icon="image" title={mt.photo} onPress={() => void pickPhoto(false)} />
              <GlassButton icon="reels" title={mt.video} onPress={() => void pickVideo(false)} />
              {info?.canViewOnce ? (
                <>
                  <GlassButton icon="eye" title={mt.viewOncePhoto} onPress={() => void pickPhoto(true)} />
                  <GlassButton icon="eye" title={mt.viewOnceVideo} onPress={() => void pickVideo(true)} />
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, paddingHorizontal: 4 }}>{mt.viewOnceHint}</Text>
                </>
              ) : null}
            </GlassSurface>
          </Pressable>
        </Pressable>
      </Modal>

      {/* long press: reactions as icons, reply, edit (15 minutes), delete for me, unsend own, report others */}
      <Modal visible={!!sheet} transparent animationType="fade" onRequestClose={() => setSheet(null)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end", padding: 12, paddingBottom: insets.bottom + 12 }} onPress={() => setSheet(null)} accessibilityLabel={mt.cancel}>
          {sheet ? (
            <Pressable onPress={() => undefined}>
              <GlassSurface strong style={{ borderRadius: GLASS_R.card, padding: 14, gap: 10, backgroundColor: t.surface }}>
                <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                  {REACTIONS.map((r) => (
                    <Pressable key={r} onPress={() => void react(sheet, r)} accessibilityRole="button" accessibilityLabel={reactionLabel(mt, r)} accessibilityState={{ selected: sheet.myReaction === r }}
                      style={{ alignItems: "center", gap: 4, minWidth: 72, paddingVertical: 6, borderRadius: 14, backgroundColor: sheet.myReaction === r ? "rgba(198,166,94,0.18)" : "transparent" }}>
                      <Icon name={REACTION_ICON[r]} size={26} color={r === "heart" ? "rgb(170,60,70)" : t.gold} />
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.ink }}>{reactionLabel(mt, r)}</Text>
                    </Pressable>
                  ))}
                </View>
                {canSend ? <GlassButton icon="reply" title={mt.reply} onPress={() => { startReply(sheet); setSheet(null); }} /> : null}
                {sheet.editable ? <GlassButton icon="pen" title={mt.edit} onPress={() => startEdit(sheet)} /> : null}
                <GlassButton icon="close" title={mt.deleteForMe} onPress={() => hide(sheet)} />
                {sheet.mine ? <GlassButton icon="trash" title={mt.delete} onPress={() => del(sheet)} />
                  : <GlassButton icon="flag" title={mt.reportMsg} onPress={() => { setReport({ messageId: sheet.id }); setSheet(null); }} />}
              </GlassSurface>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>

      <Modal visible={!!full} transparent animationType="fade" onRequestClose={closeMedia}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center" }} onPress={closeMedia} accessibilityRole="button" accessibilityLabel={mt.close}>
          {full ? <Image source={full} resizeMode="contain" style={{ width: "100%", height: "80%" }} /> : null}
        </Pressable>
      </Modal>
      <VideoModal src={video} onClose={closeMedia} label={mt.close} />

      <ReportSheet visible={!!report} title={report?.messageId ? mt.reportMsg : info?.kind === "direct" ? mt.reportChat : mt.reportGroup} onClose={() => setReport(null)}
        onSubmit={(c, r) => (id ? M.report(id, c, r, report?.messageId).then(() => undefined) : Promise.resolve())} />
    </>
  );
}
