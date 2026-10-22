import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ScrollViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Markdown } from "@/features/extra/Markdown";
import { useLang } from "@/i18n";
import { openPro, usePro } from "@/lib/pro";
import { useProPrice, withPrice } from "@/lib/purchases";
import { BACK, FONT, R, goldButton, useTheme } from "@/lib/theme";
import { askError, askTutor, tutorStatus, type AskError, type TutorContext, type TutorStatus } from "./api";
import { TutorFace } from "./Face";
import { useTutor } from "./hooks";
import { AiSeal, Answer, ConsentCard, GOLD, GlassCard, TodayCard, TutorChoice, alpha } from "./Parts";
import { clearChat, hasConsent, readChat, readPrefs, saveChat, useChat, useTutorPrefs, type ChatMsg } from "./prefs";
import { useTutorProgress } from "./progress";

// Dalil / Hidaya – the tutor's one chat screen (app). The conversation is kept only on this device (prefs.ts). Entry
// points pass a context (lesson, quiz, verse, carousel …) and optionally a first question; the server answers only
// from the platform's reviewed content and shows its sources (website: src/components/tutor/TutorChat.tsx, 1:1).

const GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();

export function TutorChat({ context, initial }: { context?: TutorContext | null; initial?: string }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { lang } = useLang();
  const { ui, f, persona, name, address } = useTutor();
  const prefs = useTutorPrefs();
  const consented = hasConsent(prefs);
  const msgs = useChat();
  const progress = useTutorProgress();
  const price = useProPrice();
  // Pro bought without an account (guest Pro) unlocks the Pro limit only after sign-in: the server knows only accounts
  const { pro } = usePro();
  const [status, setStatus] = useState<TutorStatus | null>(null);
  const [net, setNet] = useState<"loading" | "ok" | "offline">("loading");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<AskError | null>(null);
  const [settings, setSettings] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);
  const asked = useRef(false);

  const check = useCallback(() => {
    setNet("loading");
    tutorStatus().then((s) => { setStatus(s); setNet("ok"); }).catch(() => setNet("offline"));
  }, []);
  useEffect(check, [check]);

  const send = useCallback(async (q: string, ctx: TutorContext | null = null) => {
    const question = q.trim();
    const p = readPrefs();
    if (!question || busy || !p.consent || !hasConsent(p)) return;
    const before = readChat();
    const next: ChatMsg[] = [...before, { role: "user", content: question, at: Date.now() }];
    saveChat(next); setText(""); setBusy(true); setErr(null);
    try {
      const a = await askTutor({ question, history: before, lang, context: ctx, address, persona, consent: p.consent, progress });
      saveChat([...next, {
        role: "assistant", content: a.answer, at: Date.now(), id: a.id, status: a.status, notice: a.notice, sources: a.sources, related: a.related,
        followups: a.followups, scripture: a.scripture, persona,
      }]);
      setStatus((s) => (s ? { ...s, quota: { ...s.quota, ...a.quota } } : s));
    } catch (e) {
      const k = askError(e);
      setErr(k);
      if (k === "offline") setNet("offline");
    } finally { setBusy(false); }
  }, [busy, lang, address, persona, progress]);

  // an entry point's question is asked once, as soon as the tutor is reachable and the consent is given
  useEffect(() => {
    if (asked.current || !initial || net !== "ok" || !status?.enabled || !consented) return;
    asked.current = true;
    void send(initial, context ?? null);
  }, [initial, context, net, status, consented, send]);

  const left = status?.quota?.left;
  const errorText = err === "pro" ? (pro ? ui.login : ui.limitFree) : err === "limit" ? ui.limitPro : err === "login" ? ui.login : err === "verify" ? ui.verify
    : err === "busy" || err === "rate" ? ui.busy : err === "off" ? ui.off : err === "offline" ? ui.offline : err === "consent" ? ui.consentNeeded : err === "age" ? ui.age : err ? ui.err : "";
  const md = (s: string) => <Markdown text={s} />;
  const lastQuestion = (i: number) => { for (let j = i - 1; j >= 0; j--) if (msgs[j].role === "user") return msgs[j].content; return undefined; };

  const header = (
    <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 12, paddingBottom: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {GLASS ? <GlassView glassEffectStyle="regular" isInteractive style={StyleSheet.absoluteFill} /> : null}
          <Text style={{ fontSize: 20, color: t.ink }}>{BACK}</Text>
        </Pressable>
        <TutorFace persona={persona} size={44} speaking={busy} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 18, color: t.ink }}>{name}</Text>
            <AiSeal />
          </View>
          <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{busy ? f(ui.thinking) : context?.title ?? f(ui.title)}</Text>
        </View>
        <Pressable onPress={() => setSettings((v) => !v)} accessibilityRole="button" accessibilityLabel={ui.tutor} hitSlop={10}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {GLASS ? <GlassView glassEffectStyle="regular" isInteractive style={StyleSheet.absoluteFill} /> : null}
          <Icon name="settings" size={18} color={t.ink} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {header}
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }} keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => { if (msgs.length) scroll.current?.scrollToEnd({ animated: true }); }}>
        {settings ? (
          <GlassCard>
            <TutorChoice />
            {msgs.length ? <OutlineButton title={ui.clear} icon="close" compact style={{ marginTop: 14 }}
              onPress={() => Alert.alert(ui.clear, ui.clearAsk, [{ text: ui.later, style: "cancel" }, { text: ui.clear, style: "destructive", onPress: () => { clearChat(); setErr(null); } }])} /> : null}
          </GlassCard>
        ) : null}

        {!consented ? <ConsentCard onDone={() => setErr(null)} onLater={() => router.back()} /> : null}

        {consented && msgs.length === 0 ? (
          <>
            <View style={{ alignItems: "center", gap: 10, paddingTop: 8 }}>
              <TutorFace persona={persona} size={132} />
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted, textAlign: "center", maxWidth: 420 }}>{f(ui.lead)}</Text>
            </View>
            <TodayCard p={progress} onAsk={() => void send(ui.todayAsk, { kind: "progress", title: ui.todayTitle })} />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {ui.sugg.map((s) => <OutlineButton key={s} title={s} compact onPress={() => void send(s, context ?? null)} />)}
            </View>
          </>
        ) : null}

        {msgs.map((m, i) => m.role === "user" ? (
          <View key={i} style={{ alignItems: "flex-end" }}>
            <View style={{ maxWidth: "85%", borderRadius: 18, borderTopRightRadius: 6, backgroundColor: t.accent, paddingHorizontal: 16, paddingVertical: 11 }}>
              <Text selectable style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.onAccent }}>{m.content}</Text>
            </View>
          </View>
        ) : (
          <View key={i} style={{ flexDirection: "row", gap: 10 }}>
            <TutorFace persona={m.persona ?? persona} size={34} still />
            <Answer m={m} question={lastQuestion(i)} md={md} onFollow={(q) => void send(q, null)} />
          </View>
        ))}

        {busy ? (
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <TutorFace persona={persona} size={34} speaking />
            <ActivityIndicator color={GOLD} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{f(ui.thinking)}</Text>
          </View>
        ) : null}

        {err ? (
          <View accessibilityRole="alert" style={{ borderRadius: R.lg, borderWidth: 1, borderColor: alpha(GOLD, 0.45), backgroundColor: alpha(GOLD, 0.06), padding: 16, gap: 12 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink }}>{f(errorText)}</Text>
            {err === "pro" && !pro ? <GoldButton title={withPrice(ui.proCta, price)} compact onPress={() => openPro("general")} /> : null}
            {err === "login" || (err === "pro" && pro) ? <GoldButton title={ui.signIn} compact onPress={() => router.push("/sign-in")} /> : null}
            {err === "offline" || err === "busy" || err === "error" ? <OutlineButton title={ui.retry} compact onPress={() => { setErr(null); check(); }} /> : null}
          </View>
        ) : null}
        {net === "offline" && !err ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{f(ui.offline)}</Text> : null}
        {net === "ok" && status && !status.enabled ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{f(ui.off)}</Text> : null}
      </ScrollView>

      {consented ? (
        <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 10) }}>
          <Composer value={text} onChange={setText} onSend={() => void send(text, context ?? null)} disabled={busy || net !== "ok" || !status?.enabled} placeholder={ui.ph} send={ui.send} />
          <Text style={{ marginTop: 6, fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 16, color: t.muted }}>
            {typeof left === "number" ? <Text style={{ fontFamily: FONT.semibold, color: goldButton.line }}>{left === 1 ? ui.leftOne : f(ui.left, { n: left })} · </Text> : null}
            {f(ui.note)}
          </Text>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

/** the composer: a glass capsule with the text field and a gold send button */
function Composer({ value, onChange, onSend, disabled, placeholder, send }: { value: string; onChange: (s: string) => void; onSend: () => void; disabled: boolean; placeholder: string; send: string }) {
  const t = useTheme();
  const can = !disabled && value.trim().length > 1;
  const inner: ReactNode = (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 6 }}>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={t.muted} multiline maxLength={800} accessibilityLabel={placeholder}
        style={{ flex: 1, minHeight: 44, maxHeight: 140, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
      <Pressable onPress={onSend} disabled={!can} accessibilityRole="button" accessibilityLabel={send}
        style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: can ? goldButton.to : alpha(GOLD, 0.25), transform: [{ scale: pressed ? 0.94 : 1 }] })}>
        <Icon name="send" size={18} color={goldButton.text} />
      </Pressable>
    </View>
  );
  const shape = { borderRadius: 26, borderWidth: StyleSheet.hairlineWidth, borderColor: value ? alpha(GOLD, 0.7) : t.line, overflow: "hidden" as const };
  return GLASS
    ? <GlassView glassEffectStyle="regular" tintColor={t.dark ? "rgba(12,74,55,0.25)" : "rgba(255,255,255,0.6)"} style={shape}>{inner}</GlassView>
    : <View style={[shape, { backgroundColor: t.surface }]}>{inner}</View>;
}
