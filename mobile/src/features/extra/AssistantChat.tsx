import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { GoldButton, Stage } from "@/components/brand";
import { useLang, useT } from "@/i18n";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAiCredits } from "@/lib/purchases";
import { ARABIC_FONT, FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { GOLD, alpha } from "./art";
import { Markdown } from "./Markdown";
import { fill, useX } from "./strings";

type Msg = { role: "user" | "assistant"; content: string };

/** the round stage medallion with the letter qaf, the assistant's avatar on the website */
function Avatar() {
  return (
    <Stage rounded={18} hairlines={false} pattern={false} style={{ width: 36, height: 36 }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 18, lineHeight: 30, color: stage.gold }}>ق</Text>
      </View>
    </Stage>
  );
}

/** example questions as quiet chips (also shown to free users under the Pro gate, then without action) */
export function AssistantSuggestions({ onPick }: { onPick?: (q: string) => void }) {
  const t = useTheme();
  const x = useX();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {x.assistant.sugg.map((s) => (
        <Pressable key={s} disabled={!onPick} onPress={() => onPick?.(s)} accessibilityRole={onPick ? "button" : "text"} accessibilityLabel={s}
          style={({ pressed }) => ({ borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? GOLD : t.line, backgroundColor: t.surface, paddingHorizontal: 12, paddingVertical: 8 })}>
          <Text style={{ fontFamily: FONT.medium, fontSize: 13.5, color: t.ink }}>{s}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/**
 * The assistant chat of the website (AssistantChat.tsx) as a full-height screen part: messages, example questions,
 * and the composer pinned above the keyboard with the safety note and today's remaining questions.
 * The server route is the website's /api/assistant (same rules, same limits). `header` scrolls above the messages.
 * In the app the assistant is part of Pro: wrap this with ProGate (see app/assistant.tsx).
 */
export function AssistantChat({ header }: { header?: ReactNode }) {
  const t = useTheme();
  const x = useX().assistant;
  const xa = useX();
  const { lang } = useLang();
  const tr = useT();
  const { user } = useAuth();
  const { credits, refresh } = useAiCredits();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<"loading" | "on" | "off" | "offline">("loading");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const scroll = useRef<ScrollViewInstance>(null);

  const check = useCallback(() => {
    setStatus("loading");
    api<{ enabled?: boolean }>("/api/assistant").then((d) => setStatus(d.enabled ? "on" : "off")).catch(() => setStatus("offline"));
  }, []);
  useEffect(check, [check]);

  const send = async (q: string) => {
    const content = q.trim();
    if (!content || busy) return;
    const next = [...msgs, { role: "user" as const, content }];
    setMsgs(next); setText(""); setBusy(true); setErr("");
    try {
      const d = await api<{ answer?: string }>("/api/assistant", { body: { messages: next, locale: lang } });
      if (d.answer) setMsgs([...next, { role: "assistant", content: d.answer }]); else setErr(x.err);
      void refresh();
    } catch (e) {
      const s = e instanceof ApiError ? e.status : 0;
      setErr(s === 429 ? x.limit : s === 401 ? "login" : s === 403 ? "verify" : s === 0 ? xa.offline : x.err);
    } finally { setBusy(false); }
  };

  const left = credits?.assistantLeft;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => { if (msgs.length) scroll.current?.scrollToEnd({ animated: true }); }}>
        {header}
        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 16 }}>
          {status === "off" ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, borderWidth: 1, borderColor: t.line, borderRadius: R.lg, backgroundColor: t.surface, padding: 18 }}>{x.off}</Text> : null}
          {status === "offline" ? (
            <View style={{ borderWidth: 1, borderColor: t.line, borderRadius: R.lg, backgroundColor: t.surface, padding: 18, gap: 12 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted }}>{xa.offline}</Text>
              <Text onPress={check} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent }}>{tr("common.retry")}</Text>
            </View>
          ) : null}
          {status === "loading" ? <ActivityIndicator color={t.accent} style={{ marginTop: 12 }} /> : null}
          {status === "on" ? (
            <>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Avatar />
                <View style={{ flex: 1, borderRadius: 16, borderTopLeftRadius: 4, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, paddingHorizontal: 16, paddingVertical: 12 }}>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink }}>{x.hello}</Text>
                </View>
              </View>
              {msgs.length === 0 ? <View style={{ paddingLeft: 48 }}><AssistantSuggestions onPick={(s) => void send(s)} /></View> : null}
              {msgs.map((m, i) => m.role === "user" ? (
                <View key={i} style={{ alignItems: "flex-end" }}>
                  <View style={{ maxWidth: "85%", borderRadius: 16, borderTopRightRadius: 4, backgroundColor: t.accent, paddingHorizontal: 16, paddingVertical: 12 }}>
                    <Text selectable style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.onAccent }}>{m.content}</Text>
                  </View>
                </View>
              ) : (
                <View key={i} style={{ flexDirection: "row", gap: 12 }}>
                  <Avatar />
                  <View style={{ flex: 1, borderRadius: 16, borderTopLeftRadius: 4, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, paddingHorizontal: 16, paddingVertical: 12 }}>
                    <Markdown text={m.content} />
                  </View>
                </View>
              ))}
              {busy ? <Text style={{ paddingLeft: 48, fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{x.thinking}</Text> : null}
              {err === "login" || err === "verify" ? (
                <View accessibilityRole="alert" style={{ marginLeft: 48, borderRadius: R.lg, borderWidth: 1, borderColor: alpha(GOLD, 0.45), backgroundColor: alpha(GOLD, 0.06), padding: 16, gap: 12 }}>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink }}>{err === "login" ? x.login : xa.verify}</Text>
                  {err === "login" && !user ? <GoldButton title={xa.signIn} compact onPress={() => router.push("/sign-in")} /> : null}
                </View>
              ) : err ? <Text accessibilityRole="alert" style={{ paddingLeft: 48, fontFamily: FONT.regular, fontSize: 14, color: t.danger }}>{err}</Text> : null}
            </>
          ) : null}
        </View>
      </ScrollView>

      {status === "on" ? (
        <View style={{ borderTopWidth: 1, borderTopColor: t.line, backgroundColor: t.surface, paddingHorizontal: 12, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 10) }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
            <TextInput value={text} onChangeText={setText} placeholder={x.ph} placeholderTextColor={t.muted} multiline maxLength={1200} accessibilityLabel={x.ph}
              style={{ flex: 1, minHeight: 52, maxHeight: 140, borderRadius: 12, borderWidth: 1, borderColor: text ? alpha(GOLD, 0.7) : t.line, backgroundColor: t.bg, paddingHorizontal: 14, paddingTop: 15, paddingBottom: 12, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
            <GoldButton title={x.send} onPress={() => void send(text)} disabled={busy || !text.trim()} style={{ width: 92 }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
            <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 16, color: t.muted }}>
              {typeof left === "number" ? <Text style={{ fontFamily: FONT.semibold, color: goldButton.line }}>{left === 1 ? x.leftOne : fill(x.left, { n: left })} · </Text> : null}
              {x.note}
            </Text>
            {msgs.length ? <Text onPress={() => { setMsgs([]); setErr(""); }} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.ink }}>{x.clear}</Text> : null}
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
