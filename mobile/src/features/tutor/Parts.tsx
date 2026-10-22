import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { GoldButton, OutlineButton, Segmented } from "@/components/brand";
import { Icon } from "@/components/icons";
import { openHref } from "@/features/library/links";
import { useLang } from "@/i18n";
import { ARABIC_FONT, FONT, R, goldButton, useTheme } from "@/lib/theme";
import { reportAnswer } from "./api";
import { TutorFace } from "./Face";
import { useTutor } from "./hooks";
import { giveConsent, saveAddress, savePersona, type ChatMsg, type Consent, type Persona } from "./prefs";
import type { Progress } from "./progress";
import { appChips, nextUi } from "./next";
import { useSpeak } from "./voice";

// The parts of the tutor's chat: consent card, tutor and address choice, today's card, an answer with its sources and
// scripture, the report sheet. Emerald and gold, Liquid Glass surfaces on current iOS (hairline cards elsewhere).

const GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();
export const GOLD = "#c9a14a";
export const alpha = (hex: string, a: number) => `${hex}${Math.round(a * 255).toString(16).padStart(2, "0")}`;

/** a soft glass card (Liquid Glass on iOS 26+, a hairline surface card elsewhere) */
export function GlassCard({ children, style, gold }: { children: React.ReactNode; style?: object; gold?: boolean }) {
  const t = useTheme();
  const border = { borderWidth: StyleSheet.hairlineWidth, borderColor: gold ? alpha(GOLD, 0.55) : t.line, borderRadius: 20, overflow: "hidden" as const };
  if (GLASS) return <GlassView glassEffectStyle="regular" tintColor={t.dark ? "rgba(12,74,55,0.20)" : "rgba(255,255,255,0.55)"} style={[border, { padding: 16 }, style]}>{children}</GlassView>;
  return <View style={[border, { padding: 16, backgroundColor: t.surface }, style]}>{children}</View>;
}

/** Apple 5.1.2(i): what goes to OpenAI, before the first question; age 13+ or a parent */
export function ConsentCard({ onDone, onLater }: { onDone: (c: Consent) => void; onLater?: () => void }) {
  const t = useTheme();
  const { ui, f, persona } = useTutor();
  const [age, setAge] = useState<Consent["age"] | null>(null);
  return (
    <GlassCard gold>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <TutorFace persona={persona} size={52} />
        <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 18, color: t.ink }}>{f(ui.consentTitle)}</Text>
      </View>
      {ui.consentPoints.map((p, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
          <Text style={{ color: GOLD, fontFamily: FONT.semibold, fontSize: 14, lineHeight: 21 }}>✦</Text>
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink }}>{f(p)}</Text>
        </View>
      ))}
      <Text onPress={() => openHref("/legal/privacy")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent, marginBottom: 14 }}>{ui.privacy}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: t.muted, marginBottom: 8 }}>{ui.consentAge}</Text>
      {(["13plus", "parent"] as const).map((a) => (
        <Pressable key={a} onPress={() => setAge(a)} accessibilityRole="radio" accessibilityState={{ selected: age === a }}
          style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: age === a ? GOLD : t.line, alignItems: "center", justifyContent: "center" }}>
            {age === a ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD }} /> : null}
          </View>
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14.5, color: t.ink }}>{a === "13plus" ? ui.age13 : ui.ageParent}</Text>
        </Pressable>
      ))}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        {onLater ? <OutlineButton title={ui.later} onPress={onLater} style={{ flex: 1 }} /> : null}
        <GoldButton title={ui.agree} disabled={!age} onPress={() => { if (!age) return; giveConsent(age); onDone({ v: 1, age, at: Date.now() }); }} style={{ flex: 1.4 }} />
      </View>
    </GlassCard>
  );
}

/** brother / sister (shared identity) and, for sisters, Dalil or Hidaya */
export function TutorChoice() {
  const t = useTheme();
  const { ui, f, persona, address } = useTutor();
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{f(ui.address)}</Text>
      <Segmented<"brother" | "sister" | "none"> value={address ?? "none"} options={[["brother", ui.brother], ["sister", ui.sister], ["none", ui.none]]}
        onChange={(v) => saveAddress(v === "none" ? null : v)} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{ui.addressNote}</Text>
      {address === "sister" ? (
        <>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, marginTop: 6 }}>{ui.tutor}</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {(["hidaya", "dalil"] as Persona[]).map((p) => (
              <Pressable key={p} onPress={() => savePersona(p)} accessibilityRole="radio" accessibilityState={{ selected: persona === p }}
                style={{ flex: 1, alignItems: "center", gap: 8, paddingVertical: 12, borderRadius: 18, borderWidth: persona === p ? 2 : StyleSheet.hairlineWidth, borderColor: persona === p ? GOLD : t.line, backgroundColor: persona === p ? alpha(GOLD, 0.08) : "transparent" }}>
                <TutorFace persona={p} size={56} still={persona !== p} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{p === "hidaya" ? "Hidaya" : "Dalil"}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{ui.sisterOnly}</Text>
        </>
      ) : null}
    </View>
  );
}

/** today's card: only the learner's own figures, as the device knows them; nothing is estimated */
export function TodayCard({ p, onAsk }: { p: Progress | null; onAsk: () => void }) {
  const t = useTheme();
  const { ui, f } = useTutor();
  const lines: string[] = [];
  if (p?.milestone) lines.push(`${ui.mashaAllah} ${p.milestone}`);
  if (p?.streak) lines.push(p.streak === 1 ? ui.streakOne : f(ui.streak, { n: p.streak }));
  if (p?.versesMemorised) lines.push(f(ui.verses, { n: p.versesMemorised }));
  if (p?.weakestDim && typeof p.weakestPct === "number") lines.push(f(ui.weakest, { dim: ui.dims[p.weakestDim], n: p.weakestPct }));
  if ((p?.todayNew ?? 0) + (p?.todayReview ?? 0) > 0) lines.push(f(ui.today, { a: p?.todayNew ?? 0, b: p?.todayReview ?? 0 }));
  return (
    <GlassCard gold>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: goldButton.line, marginBottom: 8 }}>{ui.todayTitle}</Text>
      {lines.length ? lines.map((l, i) => <Text key={i} style={{ fontFamily: i === 0 && p?.milestone ? FONT.semibold : FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{l}</Text>)
        : <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{f(ui.noData)}</Text>}
      <OutlineButton title={ui.todayAsk} icon="calendar" compact onPress={onAsk} style={{ marginTop: 12 }} />
    </GlassCard>
  );
}

/** one answer: text, the scholar note, Quran and hadith from their sources, the passages used, follow-ups, copy and report */
export function Answer({ m, question, onFollow, md }: { m: ChatMsg; question?: string; onFollow: (q: string) => void; md: (text: string) => React.ReactNode }) {
  const t = useTheme();
  const { ui } = useTutor();
  const [copied, setCopied] = useState(false);
  const [report, setReport] = useState(false);
  const { lang } = useLang();
  const nx = nextUi(lang);
  const voice = useSpeak(lang);
  const cites = m.sources?.length ? m.sources : m.related ?? [];
  const chips = appChips(cites, nx);
  const canReport = !!m.id && !m.local;
  const sid = `${m.at}`;
  const reading = voice.speaking === sid;
  return (
    <View style={{ flex: 1, gap: 10 }}>
      <View style={{ borderRadius: 18, borderTopLeftRadius: 6, backgroundColor: t.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: t.line, paddingHorizontal: 16, paddingVertical: 12 }}>
        {md(m.content)}
        {m.notice ? <Text style={{ marginTop: 10, fontFamily: FONT.medium, fontSize: 13, lineHeight: 19, color: goldButton.line }}>{m.notice}</Text> : null}
      </View>
      {m.scripture?.verses.map((v) => (
        <Pressable key={v.key} onPress={() => openHref(`/surah/${v.key.split(":")[0]}?v=${v.key.split(":")[1]}`)} accessibilityRole="link" accessibilityLabel={`${ui.quran} ${v.key}`}>
          <GlassCard>
            <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 44, color: t.arabic, textAlign: "right", writingDirection: "rtl" }}>{v.arabic}</Text>
            {v.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, marginTop: 6 }}>{v.translation}</Text> : null}
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: goldButton.line, marginTop: 8 }}>{ui.quran} {v.key} · {v.chapter} · {nx.playVerse}</Text>
          </GlassCard>
        </Pressable>
      ))}
      {m.scripture?.hadith.map((h) => (
        <Pressable key={h.id} onPress={() => (h.url ? openHref(h.url) : undefined)} accessibilityRole={h.url ? "link" : "text"}>
          <GlassCard>
            {h.arabic ? <Text numberOfLines={6} style={{ fontFamily: ARABIC_FONT, fontSize: 18, lineHeight: 34, color: t.arabic, textAlign: "right", writingDirection: "rtl" }}>{h.arabic}</Text> : null}
            {h.text ? <Text numberOfLines={8} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, marginTop: 6 }}>{h.text}</Text> : null}
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: goldButton.line, marginTop: 8 }}>{ui.hadith} · {h.reference}{h.grades?.[0] ? ` · ${h.grades[0].grade} (${h.grades[0].by})` : ""}</Text>
          </GlassCard>
        </Pressable>
      ))}
      {cites.length ? (
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase", color: t.muted }}>{m.sources?.length ? ui.sources : ui.related}</Text>
          {cites.map((c) => (
            <Pressable key={`${c.n}${c.link}`} onPress={() => openHref(c.link)} accessibilityRole="link" style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: goldButton.line, minWidth: 18 }}>{c.n}</Text>
              <Text style={{ flex: 1, fontFamily: FONT.medium, fontSize: 13.5, lineHeight: 19, color: t.accent }}>{c.title}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {m.followups?.length || chips.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {chips.map((c) => <OutlineButton key={c.href} title={c.label} icon="chevronRight" compact onPress={() => openHref(c.href)} />)}
          {m.followups?.map((q) => <OutlineButton key={q} title={q} compact onPress={() => onFollow(q)} />)}
        </View>
      ) : null}
      {!m.local ? (
        <View style={{ flexDirection: "row", gap: 18 }}>
          {voice.can && m.content ? (
            <Pressable onPress={() => voice.speak(sid, m.content)} accessibilityRole="button" accessibilityHint={nx.voiceNote} accessibilityState={{ selected: reading }} hitSlop={8} style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
              <Icon name={reading ? "stop" : "speaker"} size={14} color={t.muted} /><Text style={{ fontFamily: FONT.medium, fontSize: 12.5, color: t.muted }}>{reading ? nx.stop : `${nx.listen} (${ui.ai})`}</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => { void Clipboard.setStringAsync(m.content); setCopied(true); setTimeout(() => setCopied(false), 1500); }} accessibilityRole="button" hitSlop={8} style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            <Icon name="copy" size={14} color={t.muted} /><Text style={{ fontFamily: FONT.medium, fontSize: 12.5, color: t.muted }}>{copied ? ui.copied : ui.copy}</Text>
          </Pressable>
          {canReport ? (
            <Pressable onPress={() => setReport(true)} accessibilityRole="button" hitSlop={8} style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
              <Icon name="flag" size={14} color={t.muted} /><Text style={{ fontFamily: FONT.medium, fontSize: 12.5, color: t.muted }}>{ui.report}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {report ? <ReportSheet m={m} question={question} onClose={() => setReport(false)} /> : null}
    </View>
  );
}

function ReportSheet({ m, question, onClose }: { m: ChatMsg; question?: string; onClose: () => void }) {
  const t = useTheme();
  const { ui } = useTutor();
  const { lang } = useLang();
  const [reason, setReason] = useState<keyof typeof ui.reasons | null>(null);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "err">("idle");
  const send = async () => {
    if (!reason || !m.id) return;
    setState("busy");
    try {
      await reportAnswer({ id: m.id, reason, note: note.trim() || undefined, question, answer: m.content, sources: (m.sources ?? []).map((s) => s.link), locale: lang });
      setState("done");
      setTimeout(onClose, 1400);
    } catch { setState("err"); }
  };
  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} onPress={onClose} accessibilityLabel={ui.later} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, gap: 10 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 18, color: t.ink }}>{ui.reportTitle}</Text>
          {state === "done" ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{ui.reportThanks}</Text> : (
            <>
              {(Object.keys(ui.reasons) as (keyof typeof ui.reasons)[]).map((k) => (
                <Pressable key={k} onPress={() => setReason(k)} accessibilityRole="radio" accessibilityState={{ selected: reason === k }}
                  style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: reason === k ? 2 : StyleSheet.hairlineWidth, borderColor: reason === k ? GOLD : t.line }}>
                  <Text style={{ fontFamily: FONT.medium, fontSize: 15, color: t.ink }}>{ui.reasons[k]}</Text>
                </Pressable>
              ))}
              <TextInput value={note} onChangeText={setNote} placeholder={ui.reportNote} placeholderTextColor={t.muted} maxLength={500} multiline
                style={{ minHeight: 64, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: t.line, padding: 12, fontFamily: FONT.regular, fontSize: 15, color: t.ink }} />
              {state === "err" ? <Text style={{ color: t.danger, fontFamily: FONT.regular }}>{ui.err}</Text> : null}
              <GoldButton title={ui.reportSend} disabled={!reason} busy={state === "busy"} onPress={() => void send()} />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** the small "AI" seal next to the tutor's name */
export function AiSeal() {
  const { ui } = useTutor();
  return (
    <View style={{ borderRadius: R.pill, borderWidth: 1, borderColor: alpha(GOLD, 0.7), paddingHorizontal: 7, paddingVertical: 1 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1, color: goldButton.line }}>{ui.ai}</Text>
    </View>
  );
}
