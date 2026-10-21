import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { PageHero, Loading } from "@/components/page";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { T, type Level, type Message } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { AccessGate, Muted, ReportSheet, SafetyBar, useTalentAccess, useTalentErr } from "@/features/talents/ui";

// /talents/messages/[id] – 1:1 chat with a connection (text only). Long press on a received message reports it;
// report profile, block and the guidelines sit above the conversation. Refreshes every 10 seconds while open.
type With = { username: string; name: string; level: Level; verified: boolean };
export default function Chat() {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const a = useTalentAccess();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [who, setWho] = useState<With | null>(null);
  const [msgs, setMsgs] = useState<Message[] | null>(null);
  const [more, setMore] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [report, setReport] = useState<{ kind: "msg"; id: string } | { kind: "profile" } | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const d = await T.messages(id);
      setWho(d.with); setCanSend(d.canSend);
      setMsgs((old) => {
        // keep older pages that were loaded, replace the newest page
        const first = d.messages[0]?.id;
        const keep = old && first ? old.filter((m) => Number(m.id) < Number(first)) : [];
        return [...keep, ...d.messages];
      });
      setMore((m) => m ?? d.more);
    } catch (e) { setNote(err(e)); setMsgs((m) => m ?? []); }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (a.state !== "ok") return;
    void load();
    const h = setInterval(() => { void load(); }, 10_000);
    return () => clearInterval(h);
  }, [a.state, load]);

  const older = async () => {
    if (!id || !more) return;
    try { const d = await T.messages(id, more); setMsgs((o) => [...d.messages, ...(o ?? [])]); setMore(d.more); } catch (e) { setNote(err(e)); }
  };
  const send = async () => {
    const body = text.trim();
    if (!id || !body) return;
    setBusy(true); setNote("");
    try { const d = await T.send(id, body); setMsgs((o) => [...(o ?? []), d.message]); setText(""); setTimeout(() => scroll.current?.scrollToEnd({ animated: false }), 50); }
    catch (e) { setNote(err(e)); } finally { setBusy(false); }
  };
  const block = () => who && Alert.alert(tt("block"), tt("confirmBlock"), [{ text: tt("cancel"), style: "cancel" }, {
    text: tt("block"), style: "destructive", onPress: () => void T.block(who.username, true).then(() => router.back()).catch((e) => setNote(err(e))),
  }]);
  const time = (iso: string) => new Date(iso).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
        <PageHero back topInset arcade={false} eyebrow={tt("messages")} title={who?.name ?? ""} />
        <AccessGate a={a}>
          {!msgs ? <Loading /> : (
            <>
              <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
                <SafetyBar onReport={() => setReport({ kind: "profile" })} onBlock={block} />
                {who ? <Pressable onPress={() => router.push(`/talents/u/${who.username}` as Href)} accessibilityRole="link" style={{ minHeight: 32, justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent, textAlign: "left", writingDirection: "ltr" }}>@{who.username}</Text></Pressable> : null}
              </View>
              <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 8 }} onContentSizeChange={() => { if (!more || msgs.length <= 30) scroll.current?.scrollToEnd({ animated: false }); }}>
                {more ? <Pressable onPress={() => void older()} accessibilityRole="button" style={{ alignSelf: "center", minHeight: 40, justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{tt("loadOlder")}</Text></Pressable> : null}
                {!msgs.length ? <Muted>{tt("textOnly")}</Muted> : null}
                {msgs.map((m) => (
                  <Pressable key={m.id} onLongPress={!m.mine && !m.removed ? () => setReport({ kind: "msg", id: m.id }) : undefined} delayLongPress={350}
                    accessibilityRole="text" accessibilityLabel={`${m.mine ? tt("youPrefix") : ""}${m.removed ? tt("removedMsg") : m.text ?? ""}, ${time(m.at)}`}
                    accessibilityActions={!m.mine && !m.removed ? [{ name: "report", label: tt("reportMessage") }] : undefined}
                    onAccessibilityAction={() => setReport({ kind: "msg", id: m.id })}
                    style={{ alignSelf: m.mine ? "flex-end" : "flex-start", maxWidth: "82%", paddingHorizontal: 13, paddingVertical: 9, borderRadius: R.card,
                      backgroundColor: m.mine ? "rgb(8,58,44)" : t.surface, borderWidth: m.mine ? 0 : 1, borderColor: t.line }}>
                    <Text style={{ fontFamily: m.removed ? FONT.italic : FONT.regular, fontSize: 15, lineHeight: 21, color: m.mine ? "#ffffff" : m.removed ? t.muted : t.ink }}>
                      {m.removed ? tt("removedMsg") : m.text}
                    </Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 11, marginTop: 3, color: m.mine ? "rgba(255,255,255,0.6)" : t.muted, alignSelf: "flex-end" }}>{time(m.at)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              {note ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.danger, paddingHorizontal: 16, paddingBottom: 6 }}>{note}</Text> : null}
              {canSend ? (
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 12, paddingTop: 8, paddingBottom: insets.bottom + 8, borderTopWidth: 1, borderTopColor: t.line, backgroundColor: t.surface }}>
                  <TextInput value={text} onChangeText={setText} placeholder={tt("writePlaceholder")} placeholderTextColor={t.muted} accessibilityLabel={tt("writePlaceholder")} multiline maxLength={500}
                    style={{ flex: 1, minHeight: 44, maxHeight: 120, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 12, paddingTop: 11, paddingBottom: 11, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
                  <Pressable onPress={() => void send()} disabled={busy || !text.trim()} accessibilityRole="button" accessibilityLabel={tt("send")}
                    style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: goldButton.to, alignItems: "center", justifyContent: "center", opacity: busy || !text.trim() ? 0.5 : 1 }}>
                    <Icon name="send" color={goldButton.text} size={19} />
                  </Pressable>
                </View>
              ) : (
                <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted, padding: 16, paddingBottom: insets.bottom + 16, borderTopWidth: 1, borderTopColor: t.line }}>{tt("chatClosed")}</Text>
              )}
            </>
          )}
        </AccessGate>
      </KeyboardAvoidingView>
      <ReportSheet visible={!!report} title={report?.kind === "msg" ? tt("reportMessage") : tt("reportProfile")} onClose={() => setReport(null)}
        onSubmit={(c, r) => (report?.kind === "msg" ? T.reportMessage(report.id, c, r) : who ? T.reportProfile(who.username, c, r) : Promise.resolve()).then(() => undefined)} />
    </>
  );
}
