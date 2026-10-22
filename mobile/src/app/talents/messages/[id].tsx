import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { FONT, R, useTheme } from "@/lib/theme";
import { PageHero, Loading } from "@/components/page";
import { GLASS_R, GlassButton, GlassIconButton, GlassSurface, GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { T, errCode } from "@/features/talents/api";
import { AccessGate, ReportSheet, SafetyBar, useTalentAccess } from "@/features/talents/ui";
import { M, REACTIONS, type ChatMessage, type Reaction, type ThreadInfo } from "@/features/messenger/api";
import { errorText, fill, systemLine } from "@/features/messenger/text";
import { ImageBubble, REACTION_ICON, ReactionRow, ThreadAvatar, VoiceBubble, reactionLabel, useMT } from "@/features/messenger/ui";

// /talents/messages/[id] – one chat (one-to-one, group or study-circle chat). Text, replies, reactions (icons),
// photos (re-encoded on the device and again on the server without metadata), voice notes up to two minutes,
// read receipts, typing indicator. Long press on a message: react, reply, delete (own) or report (others).
// Polls every 4 seconds while open. Incoming message requests show accept / decline / report / block first.
const MAX_VOICE_MS = 120_000;

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
  const [sheet, setSheet] = useState<ChatMessage | null>(null);
  const [report, setReport] = useState<{ messageId: string | null } | null>(null);
  const [full, setFull] = useState<{ uri: string; headers?: Record<string, string> } | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);
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
  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setNote("");
    try { await fn(); } catch (e) { setNote(errorText(mt, errCode(e))); } finally { setBusy(false); }
  };
  const send = () => run(async () => {
    const body = text.trim();
    if (!id || !body) return;
    const d = await M.sendText(id, body, replyTo?.id);
    setText(""); appendMine(d.message);
  });
  const onType = (v: string) => {
    setText(v);
    if (id && v && Date.now() - lastTyping.current > 3000) { lastTyping.current = Date.now(); void M.typing(id).catch(() => undefined); }
  };

  // photo: the system picker (no access to the whole library), re-encoded as JPEG of at most 1600 px on the device
  const pickPhoto = () => run(async () => {
    if (!id) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.9, exif: false });
    if (r.canceled || !r.assets[0]) return;
    const asset = r.assets[0];
    const scale = Math.min(1, 1600 / Math.max(asset.width || 1600, asset.height || 1600));
    const ctx = ImageManipulator.manipulate(asset.uri).resize({ width: Math.round((asset.width || 1600) * scale), height: Math.round((asset.height || 1600) * scale) });
    const img = await (await ctx.renderAsync()).saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
    const d = await M.sendImage(id, img.uri, replyTo?.id);
    appendMine(d.message);
  });

  // voice note: tap to start, tap to send (at most two minutes, stops by itself)
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const rec = useAudioRecorderState(recorder, 250);
  const [recording, setRecording] = useState(false);
  const startRec = async () => {
    const p = await requestRecordingPermissionsAsync();
    if (!p.granted) { setNote(mt.micDenied); return; }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecording(true);
  };
  const stopRec = async (sendIt: boolean) => {
    const ms = rec.durationMillis ?? 0;
    try { await recorder.stop(); } catch { /* already stopped */ }
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    setRecording(false);
    if (!sendIt || !recorder.uri || !id || ms < 700) return;
    await run(async () => { const d = await M.sendVoice(id, recorder.uri!, Math.min(ms, MAX_VOICE_MS), replyTo?.id); appendMine(d.message); });
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
      setMsgs((o) => (o ?? []).map((x) => (x.id === m.id ? { ...x, deleted: true, text: null, media: null, reactions: {} } : x)));
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
        <PageHero back topInset arcade={false} eyebrow={info?.kind === "circle" ? mt.circleChat : isGroup ? fill(mt.members, info?.memberCount ?? 0) : mt.title} title={info?.title ?? ""} />
        <AccessGate a={a}>
          {!msgs || !info ? <Loading /> : (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 8 }}>
                <ThreadAvatar kind={info.kind} title={info.title} photo={info.photo} avatar={info.with?.avatar} size={36} />
                <Pressable style={{ flex: 1, minHeight: 40, justifyContent: "center" }} accessibilityRole="link"
                  onPress={() => router.push((info.kind === "direct" && info.with ? `/talents/u/${info.with.username}` : `/talents/messages/info/${info.id}`) as Href)}>
                  <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>
                    {info.kind === "direct" && info.with ? `@${info.with.username}` : mt.groupInfo}
                  </Text>
                </Pressable>
                {info.kind === "direct" ? (
                  <GlassIconButton size={38} icon="flag" label={mt.reportChat} onPress={() => setReport({ messageId: null })} />
                ) : (
                  <GlassIconButton size={38} icon="settings" label={mt.groupInfo} onPress={() => router.push(`/talents/messages/info/${info.id}` as Href)} />
                )}
              </View>

              <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 6 }} keyboardDismissMode="interactive"
                onScroll={(e) => { const n = e.nativeEvent; atBottom.current = n.contentOffset.y + n.layoutMeasurement.height >= n.contentSize.height - 80; }} scrollEventThrottle={100}
                onContentSizeChange={() => { if (atBottom.current) scroll.current?.scrollToEnd({ animated: false }); }}>
                {more ? <Pressable onPress={() => void older()} accessibilityRole="button" style={{ alignSelf: "center", minHeight: 40, justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{mt.loadOlder}</Text></Pressable> : null}
                {info.kind === "circle" ? <Text style={{ textAlign: "center", fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, paddingBottom: 6 }}>{mt.circleHint}</Text> : null}
                {msgs.map((m) => m.kind === "system" ? (
                  <Text key={m.id} style={{ alignSelf: "center", fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, paddingVertical: 4 }}>{systemLine(mt, m.system)}</Text>
                ) : (
                  <View key={m.id} style={{ alignSelf: m.mine ? "flex-end" : "flex-start", maxWidth: "84%", alignItems: m.mine ? "flex-end" : "flex-start" }}>
                    {isGroup && !m.mine && m.sender ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold, marginBottom: 2, marginHorizontal: 6 }}>{m.sender.name}</Text> : null}
                    <Pressable onPress={!m.deleted && !m.removed && m.kind !== "voice" ? () => tap(m) : undefined} onLongPress={!m.deleted && !m.removed ? () => setSheet(m) : undefined} delayLongPress={300}
                      accessibilityRole="text" accessibilityHint={mt.doubleTapHint}
                      accessibilityLabel={`${m.mine ? `${mt.you}: ` : m.sender ? `${m.sender.name}: ` : ""}${m.deleted ? mt.deleted : m.removed ? mt.removed : m.kind === "voice" ? mt.voiceMsg : m.kind === "image" ? `${mt.photoMsg} ${m.text ?? ""}` : m.text ?? ""}, ${time(m.at)}`}
                      accessibilityActions={!m.deleted && !m.removed ? [{ name: "activate", label: mt.react }, { name: "reply", label: mt.reply }, ...(m.mine ? [{ name: "delete", label: mt.delete }] : [{ name: "report", label: mt.reportMsg }])] : undefined}
                      onAccessibilityAction={(e) => {
                        const n = e.nativeEvent.actionName;
                        if (n === "reply") setReplyTo(m); else if (n === "delete") del(m); else if (n === "report") setReport({ messageId: m.id }); else setSheet(m);
                      }}
                      style={{ paddingHorizontal: m.kind === "image" ? 4 : 13, paddingVertical: m.kind === "image" ? 4 : 9, borderRadius: R.card,
                        backgroundColor: m.mine ? "rgb(8,58,44)" : t.surface, borderWidth: m.mine ? 0 : 1, borderColor: t.line, gap: 6 }}>
                      {m.reply ? (
                        <View style={{ borderLeftWidth: 3, borderLeftColor: t.gold, paddingLeft: 8, paddingVertical: 2, marginHorizontal: m.kind === "image" ? 8 : 0, marginTop: m.kind === "image" ? 6 : 0 }}>
                          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: m.mine ? "#E2C77F" : t.gold }}>{m.reply.name || mt.you}</Text>
                          <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 13, color: m.mine ? "rgba(255,255,255,0.75)" : t.muted }}>
                            {m.reply.gone ? mt.deleted : m.reply.kind === "image" ? mt.photoMsg : m.reply.kind === "voice" ? mt.voiceMsg : m.reply.text ?? ""}
                          </Text>
                        </View>
                      ) : null}
                      {m.deleted || m.removed ? (
                        <Text style={{ fontFamily: FONT.italic, fontSize: 14.5, color: m.mine ? "rgba(255,255,255,0.7)" : t.muted }}>{m.deleted ? mt.deleted : mt.removed}</Text>
                      ) : (
                        <>
                          {m.kind === "image" && m.media ? <ImageBubble path={m.media} onOpen={setFull} /> : null}
                          {m.kind === "voice" && m.media ? <VoiceBubble path={m.media} durationMs={m.durationMs} mine={m.mine} labels={{ play: mt.play, pause: mt.pause, voice: mt.voiceMsg }} /> : null}
                          {m.text ? <Text selectable style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 21, color: m.mine ? "#ffffff" : t.ink, paddingHorizontal: m.kind === "image" ? 8 : 0 }}>{m.text}</Text> : null}
                        </>
                      )}
                      <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: m.mine ? "rgba(255,255,255,0.6)" : t.muted, alignSelf: "flex-end", paddingHorizontal: m.kind === "image" ? 8 : 0, paddingBottom: m.kind === "image" ? 4 : 0 }}>{time(m.at)}</Text>
                    </Pressable>
                    <ReactionRow reactions={m.reactions} mine={m.myReaction} onPress={(r) => void react(m, r)} t={mt} />
                    {lastMine && m.id === lastMine.id && seenLine ? <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted, marginTop: 2 }}>{seenLine}</Text> : null}
                  </View>
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
                  {replyTo ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingBottom: 6 }}>
                      <Icon name="reply" size={15} color={t.gold} />
                      <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>
                        {fill(mt.replyingTo, replyTo.mine ? mt.you : replyTo.sender?.name ?? "")}: {replyTo.kind === "image" ? mt.photoMsg : replyTo.kind === "voice" ? mt.voiceMsg : replyTo.text}
                      </Text>
                      <Pressable onPress={() => setReplyTo(null)} accessibilityRole="button" accessibilityLabel={mt.cancel} hitSlop={10}><Icon name="close" size={15} color={t.muted} /></Pressable>
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
                        {problem !== "request_text_only" ? <GlassIconButton size={42} icon="image" label={mt.photo} onPress={() => void pickPhoto()} disabled={busy} /> : null}
                        <TextInput value={text} onChangeText={onType} placeholder={mt.write} placeholderTextColor={t.muted} accessibilityLabel={mt.write} multiline maxLength={2000}
                          style={{ flex: 1, minHeight: 42, maxHeight: 130, paddingHorizontal: 10, paddingTop: 11, paddingBottom: 11, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
                        {text.trim() ? (
                          <GlassIconButton size={42} variant="gold" icon="send" label={mt.send} onPress={() => void send()} disabled={busy} />
                        ) : problem !== "request_text_only" ? (
                          <GlassIconButton size={42} icon="mic" label={mt.voice} onPress={() => void startRec()} disabled={busy} />
                        ) : null}
                      </>
                    )}
                  </GlassSurface>
                </View>
              ) : (
                <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted, padding: 16, paddingBottom: insets.bottom + 16, borderTopWidth: 1, borderTopColor: t.line }}>
                  {errorText(mt, problem)}
                </Text>
              )}
            </>
          )}
        </AccessGate>
      </KeyboardAvoidingView>

      {/* long press: reactions as icons, reply, delete own, report others */}
      <Modal visible={!!sheet} transparent animationType="fade" onRequestClose={() => setSheet(null)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end", padding: 12, paddingBottom: insets.bottom + 12 }} onPress={() => setSheet(null)} accessibilityLabel={mt.cancel}>
          {sheet ? (
            <Pressable onPress={() => undefined}>
              <GlassSurface strong style={{ borderRadius: GLASS_R.card, padding: 14, gap: 12, backgroundColor: t.surface }}>
                <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                  {REACTIONS.map((r) => (
                    <Pressable key={r} onPress={() => void react(sheet, r)} accessibilityRole="button" accessibilityLabel={reactionLabel(mt, r)} accessibilityState={{ selected: sheet.myReaction === r }}
                      style={{ alignItems: "center", gap: 4, minWidth: 72, paddingVertical: 6, borderRadius: 14, backgroundColor: sheet.myReaction === r ? "rgba(198,166,94,0.18)" : "transparent" }}>
                      <Icon name={REACTION_ICON[r]} size={26} color={r === "heart" ? "rgb(170,60,70)" : t.gold} />
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.ink }}>{reactionLabel(mt, r)}</Text>
                    </Pressable>
                  ))}
                </View>
                {canSend ? <GlassButton icon="reply" title={mt.reply} onPress={() => { setReplyTo(sheet); setSheet(null); }} /> : null}
                {sheet.mine ? <GlassButton icon="trash" title={mt.delete} onPress={() => del(sheet)} />
                  : <GlassButton icon="flag" title={mt.reportMsg} onPress={() => { setReport({ messageId: sheet.id }); setSheet(null); }} />}
              </GlassSurface>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>

      <Modal visible={!!full} transparent animationType="fade" onRequestClose={() => setFull(null)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center" }} onPress={() => setFull(null)} accessibilityRole="button" accessibilityLabel={mt.cancel}>
          {full ? <Image source={full} resizeMode="contain" style={{ width: "100%", height: "80%" }} /> : null}
        </Pressable>
      </Modal>

      <ReportSheet visible={!!report} title={report?.messageId ? mt.reportMsg : info?.kind === "direct" ? mt.reportChat : mt.reportGroup} onClose={() => setReport(null)}
        onSubmit={(c, r) => (id ? M.report(id, c, r, report?.messageId).then(() => undefined) : Promise.resolve())} />
    </>
  );
}
