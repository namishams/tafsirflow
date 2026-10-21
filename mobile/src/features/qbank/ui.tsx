import { useState, type ReactNode } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, Text, View } from "react-native";
import { SmallStar } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { ARABIC_FONT, FONT, GARNET, R, stage as ST, useTheme } from "@/lib/theme";
import { useVerse, wordsOf } from "@/features/reciter-path/useVerse";
import { subjectMeta, type QLang, type Q } from "./bank";
import { reportQuestion, toggleBookmark } from "./engine";
import { CareNote } from "@/components/CareNote";
import { useQbankT } from "./text";

// The visible parts shared by the centre's screens: verse with the highlighted word, question and options, the
// explanation with source, tradition and review status, small stat tiles and bars. Emerald and gold.

export const pctText = (x: number | null | undefined) => (x === null || x === undefined ? "—" : `${Math.round(x * 100)} %`);
const LETTERS = ["A", "B", "C", "D"];
const LETTERS_AR = ["أ", "ب", "ج", "د"];

/** the verse a question points at, rendered from the Quran.com data; word `w` highlighted */
export function VerseCard({ verseKey, word, reveal }: { verseKey: string; word?: number; reveal?: boolean }) {
  const t = useTheme();
  const qt = useQbankT();
  const { verse, error } = useVerse(verseKey);
  const [showTr, setShowTr] = useState(false);
  const words = verse ? wordsOf(verse) : [];
  return (
    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: "rgba(201,166,94,0.5)", backgroundColor: t.surface, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <SmallStar size={10} color={t.gold} />
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, color: t.gold }}>{qt("verseShown", { key: verseKey })}</Text>
      </View>
      {verse ? (
        <View style={{ flexDirection: "row-reverse", direction: "ltr", flexWrap: "wrap", gap: 4 }} accessibilityLanguage="ar">
          {words.map((w) => {
            const on = word === w.position;
            return (
              <View key={w.position} style={{ paddingHorizontal: 5, borderRadius: R.md, backgroundColor: on ? "rgba(214,180,108,0.28)" : "transparent", borderWidth: on ? 1 : 0, borderColor: t.gold }}>
                <Text accessibilityLabel={on ? `${w.text_uthmani}, ${qt("highlighted")}` : undefined} style={{ fontFamily: ARABIC_FONT, fontSize: 25, lineHeight: 46, color: on ? t.ink : t.arabic }}>{w.text_uthmani}</Text>
              </View>
            );
          })}
        </View>
      ) : error ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{qt("verseError")}</Text> : <ActivityIndicator color={t.accent} />}
      {word && verse ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{qt("highlighted")}</Text> : null}
      {reveal && verse?.translation ? (
        showTr ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted }}>{verse.translation.replace(/<[^>]+>/g, "")}</Text>
          : <Pressable onPress={() => setShowTr(true)} accessibilityRole="button" hitSlop={8}><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>{qt("showTranslation")}</Text></Pressable>
      ) : null}
    </View>
  );
}

export type OptionState = "idle" | "picked" | "right" | "wrong" | "dim";
export function OptionButton({ index, text, state, rtl, disabled, onPress }: { index: number; text: string; state: OptionState; rtl: boolean; disabled?: boolean; onPress: () => void }) {
  const t = useTheme();
  const tone = state === "right" ? t.accent : state === "wrong" ? GARNET : state === "picked" ? t.gold : t.line;
  const bg = state === "right" ? t.accentSoft : state === "wrong" ? "rgba(150,52,52,0.08)" : state === "picked" ? "rgba(214,180,108,0.12)" : t.surface;
  const letter = (rtl ? LETTERS_AR : LETTERS)[index] ?? "";
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ selected: state === "picked" || state === "right" || state === "wrong", disabled }}
      accessibilityLabel={`${letter}. ${text}`}
      style={({ pressed }) => ({ flexDirection: rtl ? "row-reverse" : "row", direction: rtl ? "ltr" : "inherit", alignItems: "center", gap: 12, minHeight: 56, paddingVertical: 12, paddingHorizontal: 14, borderRadius: R.lg, borderWidth: state === "idle" || state === "dim" ? 1 : 1.5, borderColor: tone, backgroundColor: pressed && !disabled ? t.bg : bg, opacity: state === "dim" ? 0.55 : 1 })}>
      <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: state === "idle" || state === "dim" ? t.line : tone, alignItems: "center", justifyContent: "center", backgroundColor: state === "right" ? t.accent : state === "wrong" ? GARNET : "transparent" }}>
        {state === "right" ? <Icon name="check" size={15} color="#fff" /> : state === "wrong" ? <Icon name="close" size={14} color="#fff" />
          : <Text style={{ fontFamily: rtl ? ARABIC_FONT : FONT.bold, fontSize: rtl ? 16 : 13, color: state === "picked" ? t.gold : t.muted }}>{letter}</Text>}
      </View>
      <Text style={{ flex: 1, fontFamily: rtl ? ARABIC_FONT : FONT.medium, fontSize: rtl ? 18 : 15.5, lineHeight: rtl ? 30 : 22, color: t.ink, textAlign: rtl ? "right" : "left", writingDirection: rtl ? "rtl" : "ltr" }}>{text}</Text>
    </Pressable>
  );
}

/** report a question as a possible mistake (asks first on a phone) */
export function confirmReport(id: string, qt: ReturnType<typeof useQbankT>, onChange?: () => void) {
  const go = () => { reportQuestion(id, "user"); onChange?.(); if (Platform.OS !== "web") Alert.alert(qt("reported")); };
  if (Platform.OS === "web") { go(); return; }
  Alert.alert(qt("reportTitle"), qt("reportBody"), [{ text: qt("cancel"), style: "cancel" }, { text: qt("send"), onPress: go }]);
}

/** subject · tier · tradition chips above a question, with bookmark and report */
export function QuestionMeta({ q, bookmarked, onChange }: { q: Q; bookmarked: boolean; onChange?: () => void }) {
  const t = useTheme();
  const qt = useQbankT();
  const meta = subjectMeta(q.s);
  const report = () => confirmReport(q.id, qt, onChange);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Pill icon={meta?.icon} text={qt(`s_${q.s}`)} />
      <Pill text={`${qt("tier", { n: q.d })} · ${qt(`tier_${q.d}`)}`} gold={q.d >= 6} />
      {(q.tr ?? []).map((x) => <Pill key={x} text={qt(`tr_${x}`)} />)}
      <View style={{ flex: 1 }} />
      <Pressable onPress={() => { toggleBookmark(q.id); onChange?.(); }} hitSlop={10} accessibilityRole="button" accessibilityLabel={bookmarked ? qt("bookmarked") : qt("bookmark")} accessibilityState={{ selected: bookmarked }}>
        <Icon name="bookmark" size={20} color={bookmarked ? t.gold : t.muted} filled={bookmarked} />
      </Pressable>
      <Pressable onPress={report} hitSlop={10} accessibilityRole="button" accessibilityLabel={qt("report")}>
        <Icon name="flag" size={18} color={t.muted} />
      </Pressable>
    </View>
  );
}

export function Pill({ text, icon, gold }: { text: string; icon?: IconName; gold?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, height: 24, borderRadius: R.pill, borderWidth: 1, borderColor: gold ? t.gold : t.line, backgroundColor: gold ? "rgba(214,180,108,0.12)" : t.surface }}>
      {icon ? <Icon name={icon} size={12} color={gold ? t.gold : t.accent} /> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: gold ? t.gold : t.muted }}>{text}</Text>
    </View>
  );
}

/** explanation, source and review status after an answer */
export function Explanation({ q, lang, ok, picked, correctText }: { q: Q; lang: QLang; ok: boolean | null; picked?: string; correctText: string }) {
  const t = useTheme();
  const qt = useQbankT();
  const rtl = lang === "ar";
  const loc = q[lang] ?? q.en;
  const dir = { textAlign: rtl ? "right" : "left", writingDirection: rtl ? "rtl" : "ltr" } as const;
  return (
    <View accessibilityLiveRegion="polite" style={{ borderRadius: R.lg, borderWidth: 1, borderColor: ok ? t.accent : ok === false ? GARNET : t.line, backgroundColor: t.surface, padding: 14, gap: 8 }}>
      {ok !== null ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name={ok ? "checkCircle" : "flag"} size={18} color={ok ? t.accent : GARNET} />
          <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: ok ? t.accent : GARNET }}>{ok ? qt("correct") : picked === undefined ? qt("noAnswer") : qt("wrong")}</Text>
        </View>
      ) : null}
      {!ok ? <Text style={[{ fontFamily: rtl ? ARABIC_FONT : FONT.semibold, fontSize: rtl ? 16 : 14, lineHeight: rtl ? 28 : 20, color: t.ink }, dir]}>{qt("correctAnswer", { a: correctText })}</Text> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase", color: t.gold }}>{qt("explanation")}</Text>
      <Text style={[{ fontFamily: rtl ? ARABIC_FONT : FONT.regular, fontSize: rtl ? 17 : 14.5, lineHeight: rtl ? 30 : 22, color: t.ink }, dir]}>{loc[2]}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{`${qt("source")}: ${q.src}`}</Text>
      {q.review === "needs_review" ? <CareNote onReport={() => confirmReport(q.id, qt)} /> : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="shield" size={13} color={q.review === "reviewed" ? t.accent : t.gold} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: q.review === "reviewed" ? t.accent : t.gold }}>{qt(`review_${q.review}`)}</Text>
        </View>
      )}
    </View>
  );
}

export function StatTile({ value, label, onStage }: { value: string; label: string; onStage?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, minWidth: 90, borderRadius: R.lg, borderWidth: 1, borderColor: onStage ? "rgba(233,207,153,0.22)" : t.line, backgroundColor: onStage ? "rgba(255,255,255,0.04)" : t.surface, padding: 12 }}>
      <Text style={{ fontFamily: FONT.display, fontSize: 22, color: onStage ? ST.cream : t.ink, fontVariant: ["tabular-nums"] }}>{value}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 15, color: onStage ? ST.textMuted : t.muted, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

/** a thin horizontal bar 0..1 with an optional mark (e.g. the pass mark) */
export function Bar({ value, mark, color }: { value: number; mark?: number; color?: string }) {
  const t = useTheme();
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: t.line, overflow: "hidden" }}>
      <View style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, height: 8, borderRadius: 4, backgroundColor: color ?? t.accent }} />
      {mark !== undefined ? <View style={{ position: "absolute", left: `${Math.round(mark * 100)}%`, top: 0, bottom: 0, width: 2, backgroundColor: t.gold }} /> : null}
    </View>
  );
}

/** a white tile with a gold eyebrow title */
export function Panel({ title, children, right }: { title?: string; children: ReactNode; right?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16, gap: 12 }}>
      {title ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{title}</Text>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}
