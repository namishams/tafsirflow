import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import Svg, { Path, Rect } from "react-native-svg";
import { GoldButton, OutlineButton, SmallStar, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { intlLocale, useLang } from "@/i18n";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { align } from "@/web/recite";
import { useVerse, wordsOf } from "@/features/reciter-path/useVerse";
import type { ExamSession, MyCertificate } from "./integrity";
import { useExamT } from "./texts";

// The visible parts of the exam rules: the timer bar, the "not yet" card, the recitation part and the verdict with
// the verifiable certificate. Used through small hooks in the existing runners.

const RED = "rgb(200,72,72)";
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** timer for the exam and the current question, with the rules on first sight */
export function ExamBar({ session: s, showRules = true }: { session: ExamSession; showRules?: boolean }) {
  const t = useTheme();
  const et = useExamT();
  if (s.phase !== "running" || !s.rule) return null;
  const low = s.examLeft !== null && s.examLeft <= 60;
  return (
    <View style={{ gap: 8 }}>
      <View accessibilityLiveRegion="polite" style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: R.lg, borderWidth: 1, borderColor: low ? RED : t.line, backgroundColor: t.surface }}>
        <Icon name="clock" size={16} color={low ? RED : t.gold} />
        <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13.5, color: low ? RED : t.ink, fontVariant: ["tabular-nums"] }}>{et("timeLeft", { t: mmss(s.examLeft ?? 0) })}</Text>
        {s.questionLeft !== null ? (
          <View style={{ minWidth: 54, alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill, backgroundColor: s.questionLeft <= 10 ? "rgba(200,72,72,0.12)" : t.accentSoft }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: s.questionLeft <= 10 ? RED : t.accent, fontVariant: ["tabular-nums"] }}>{et("questionTime", { s: s.questionLeft })}</Text>
          </View>
        ) : null}
      </View>
      {showRules ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted }}>{`${et("rule1")} ${et("rule2")} ${et("rule3")}`}</Text> : null}
    </View>
  );
}

/** cooldown or weekly limit reached */
export function ExamBlocked({ session: s }: { session: ExamSession }) {
  const t = useTheme();
  const et = useExamT();
  const { lang } = useLang();
  if (s.phase !== "blocked") return null;
  const date = s.nextAt ? new Date(s.nextAt).toLocaleString(intlLocale(lang), { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 18, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Icon name="clock" color={t.gold} /><Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{et("blockedTitle")}</Text></View>
      {date ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{et("blockedCooldown", { date })}</Text> : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{`${et("rule1")} ${et("rule3")}`}</Text>
    </View>
  );
}

// expo-speech-recognition is native: loaded lazily (web and Expo Go still open the screen)
type SR = typeof import("expo-speech-recognition");
let sr: SR | null | undefined;
function speech(): SR | null {
  if (sr === undefined) { try { sr = require("expo-speech-recognition") as SR; } catch { sr = null; } } // eslint-disable-line @typescript-eslint/no-require-imports
  return sr;
}

/** the recitation part: on-device word check (align from the website's recite check) and a recording of the attempt */
export function RecitationStep({ session: s }: { session: ExamSession }) {
  const t = useTheme();
  const et = useExamT();
  const plan = s.recite;
  const { verse, error } = useVerse(plan?.verse ?? null);
  const [state, setState] = useState<"idle" | "listening" | "done" | "unavailable" | "mic">("idle");
  const [ok, setOk] = useState<boolean[] | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const heard = useRef("");
  const subs = useRef<{ remove: () => void }[]>([]);
  useEffect(() => () => { subs.current.forEach((x) => x.remove()); try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ } }, []);
  if (s.phase !== "recite" || !plan) return null;
  const words = verse ? wordsOf(verse) : [];
  const need = Math.round((s.rule?.recitation?.threshold ?? 0.8) * 100);
  const score = ok && words.length ? ok.filter(Boolean).length / words.length : 0;

  const start = async () => {
    const m = speech()?.ExpoSpeechRecognitionModule;
    try {
      if (!m || !m.isRecognitionAvailable() || !m.supportsOnDeviceRecognition()) { setState("unavailable"); return; }
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setState("mic"); return; }
      heard.current = ""; setOk(null); setUri(null);
      subs.current.forEach((x) => x.remove());
      subs.current = [
        m.addListener("result", (e) => { heard.current = e.results[0]?.transcript ?? heard.current; setOk(align(words.map((w) => w.text_uthmani), heard.current).ok); }),
        m.addListener("audioend", (e) => { if (e.uri) setUri(e.uri); }),
        m.addListener("end", () => setState((x) => (x === "listening" ? "done" : x))),
        m.addListener("error", () => setState("done")),
      ];
      m.start({ lang: "ar-SA", interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: false, recordingOptions: { persist: true } });
      setState("listening");
    } catch { setState("unavailable"); }
  };
  const stop = () => { try { speech()?.ExpoSpeechRecognitionModule.stop(); } catch { /* ended */ } setState("done"); };
  const shown = plan.mode === "memory" ? words.slice(0, 2) : words;

  return (
    <View style={{ gap: 12, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Icon name="speaker" color={t.gold} /><Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{et("reciteTitle")}</Text></View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted }}>{et(plan.mode === "memory" ? "reciteLeadMemory" : "reciteLeadReading")}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.gold }}>{`${et("reciteVerse", { key: plan.verse })} · ${et("reciteNeed", { pct: need })}`}</Text>
      {verse ? (
        <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 6 }}>
          {(ok ? words : shown).map((w, i) => (
            <View key={w.position} style={{ paddingHorizontal: 6, borderRadius: R.md, backgroundColor: ok ? (ok[i] ? t.accentSoft : "rgba(200,72,72,0.08)") : "transparent" }}>
              <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: ok ? (ok[i] ? t.accent : RED) : t.ink }}>{w.text_uthmani}</Text>
            </View>
          ))}
          {!ok && plan.mode === "memory" ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: t.muted }}>{"…"}</Text> : null}
        </View>
      ) : error ? <Text style={{ fontFamily: FONT.regular, color: t.muted }}>{et("sendError")}</Text> : <ActivityIndicator color={t.accent} />}
      {state === "unavailable" || state === "mic" ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, lineHeight: 19, color: t.muted }}>{et(state === "mic" ? "reciteMic" : "reciteUnavailable")}</Text> : null}
      {ok ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: score * 100 >= need ? t.accent : t.ink }}>{et("reciteHeard", { n: ok.filter(Boolean).length, total: words.length })}</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {state !== "done" ? (
          <Pressable onPress={() => (state === "listening" ? stop() : void start())} disabled={!verse} accessibilityRole="button"
            style={{ height: 44, paddingHorizontal: 18, borderRadius: R.pill, backgroundColor: state === "listening" ? RED : t.accent, flexDirection: "row", alignItems: "center", gap: 8, opacity: verse ? 1 : 0.5 }}>
            {state === "listening" ? <ActivityIndicator color="#fff" size="small" /> : <Icon name="speaker" size={15} color="#fff" />}
            <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: "#fff" }}>{state === "listening" ? et("reciteStop") : et("reciteStart")}</Text>
          </Pressable>
        ) : null}
        {state === "done" || state === "unavailable" || state === "mic" ? (
          <GoldButton title={et("reciteSubmit")} icon="checkCircle" onPress={() => s.finishRecitation(ok ? score : null, uri)} />
        ) : null}
        {state === "done" ? <OutlineButton title={et("reciteStart")} onPress={() => void start()} /> : null}
      </View>
    </View>
  );
}

/** after the questions: recitation part, sending, server verdict, certificate */
export function ExamVerdict({ session: s }: { session: ExamSession }) {
  const t = useTheme();
  const et = useExamT();
  if (s.phase === "off" || s.phase === "checking" || s.phase === "running" || s.phase === "blocked") return null;
  if (s.phase === "recite") return <RecitationStep session={s} />;
  if (s.phase === "void") {
    const why = s.voidReason === "background" ? et("voidBackground") : s.voidReason === "timeout" ? et("voidTimeout") : et("voidLeft");
    return <Note icon="flag" color={RED} title={et("voided")} text={why} />;
  }
  if (s.phase === "submitting") return <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}><ActivityIndicator color={t.accent} /><Text style={{ fontFamily: FONT.regular, color: t.muted }}>{et("submitting")}</Text></View>;
  // finished
  if (!s.signedIn) return (
    <View style={{ gap: 10 }}>
      <Note icon="shield" color={t.gold} title={et("notVerified")} text={et("signInForCert")} />
      <OutlineButton title={et("signIn")} icon="user" onPress={() => router.push("/sign-in" as Href)} />
    </View>
  );
  if (s.offline || s.submitError) return <Note icon="shield" color={t.muted} title={et("notVerified")} text={s.offline ? et("offlineNote") : et("sendError")} />;
  const r = s.submitted;
  if (!r) return null;
  const c = r.certificate;
  return (
    <View style={{ gap: 10 }}>
      <Note icon="checkCircle" color={t.accent} title={et("verified")} text={!r.result.passed && r.result.score / Math.max(1, r.result.total) >= (s.rule?.pass ?? 1) ? et("notAccepted") : ""} />
      {r.missingUnits?.length ? <Note icon="list" color={t.gold} title={et("getVerified")} text={et("missingUnits", { list: r.missingUnits.join(", ") })} /> : null}
      {c ? (
        <>
          <Note icon="trophy" color={t.gold} title={c.status === "pending" ? et("certPending") : et("certIssued")} text={c.status === "pending" ? et("certPendingNote") : `${et("code")}: ${c.code}`} />
          {c.status === "pending" && s.recordingSent !== null ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: s.recordingSent ? t.accent : RED }}>{et(s.recordingSent ? "recordingSent" : "recordingFailed")}</Text> : null}
          <OutlineButton title={et("myCerts")} icon="trophy" onPress={() => router.push("/school/certificates" as Href)} />
        </>
      ) : null}
    </View>
  );
}

function Note({ icon, color, title, text }: { icon: "flag" | "shield" | "checkCircle" | "trophy" | "list"; color: string; title: string; text: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 10, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
      <Icon name={icon} size={18} color={color} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{title}</Text>
        {text ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted }}>{text}</Text> : null}
      </View>
    </View>
  );
}

/** the QR of the verify link, drawn from the server's rows of 0/1 (no QR library in the app) */
export function QrCode({ rows, size = 120, color = "#0e221b", bg = "#ffffff" }: { rows: string[]; size?: number; color?: string; bg?: string }) {
  const n = rows.length;
  if (!n) return null;
  const q = 2; // quiet zone in modules
  let d = "";
  rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === "1") d += `M${x + q} ${y + q}h1v1h-1z`; });
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${n + 2 * q} ${n + 2 * q}`} accessibilityLabel="QR">
      <Rect x={0} y={0} width={n + 2 * q} height={n + 2 * q} fill={bg} />
      <Path d={d} fill={color} />
    </Svg>
  );
}

/** a verifiable certificate: holder, course, date, status, short code and QR to /verify/<code> */
export function VerifiedCertCard({ cert, width }: { cert: MyCertificate; width?: number }) {
  const et = useExamT();
  const { lang } = useLang();
  const date = new Date(cert.issuedAt).toLocaleDateString(intlLocale(lang), { year: "numeric", month: "long", day: "numeric" });
  const tone = cert.status === "valid" ? "rgb(140,230,195)" : cert.status === "pending" ? stage.cream : "rgb(245,180,180)";
  return (
    <Stage rounded={R.card} style={{ width, borderWidth: 1.5, borderColor: stage.gold }}>
      <View style={{ padding: 22, alignItems: "center", gap: 8 }}>
        <SmallStar size={16} color={stage.gold} />
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: stage.gold }}>Quran Masterclass</Text>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, color: stage.gold }}>{"شهادة"}</Text>
        {cert.holder ? <Text style={{ fontFamily: FONT.display, fontSize: 24, color: "#fff", textAlign: "center" }}>{cert.holder}</Text> : null}
        <Text style={{ fontFamily: FONT.display, fontSize: 19, lineHeight: 25, color: stage.cream, textAlign: "center" }}>{cert.title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: stage.textSoft }}>{`${cert.pct} % · ${et("issued", { date })}`}</Text>
        <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: R.pill, borderWidth: 1, borderColor: tone }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 12.5, color: tone }}>{et(`status_${cert.status}`)}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 8 }}>
          <View style={{ borderRadius: 6, overflow: "hidden" }}><QrCode rows={cert.qr} size={96} /></View>
          <View style={{ gap: 4, flexShrink: 1 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: stage.gold }}>{et("code")}</Text>
            <Text selectable style={{ fontFamily: FONT.bold, fontSize: 16, letterSpacing: 1.2, color: "#fff" }}>{cert.code}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 11, lineHeight: 15, color: stage.textMuted }}>{et("verifyAt")}</Text>
          </View>
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 10.5, lineHeight: 15, color: stage.textMuted, textAlign: "center", marginTop: 6 }}>{et("ijazahNote")}</Text>
      </View>
    </Stage>
  );
}
