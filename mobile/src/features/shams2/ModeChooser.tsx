import { useMemo, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { router, useRootNavigationState, type Href } from "expo-router";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useIsl } from "@/features/library/palette";
import { useStoreVersion } from "@/lib/store";
import { tick } from "@/features/feed/haptics";
import { learner } from "@/web/coach";
import { continueHref, methodHref, setShamsMode, useShamsMode, type ShamsMode } from "./mode";
import { useModeT, type ModeT } from "./modeText";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { useS2 } from "./text";

// The choice between the two Shams methods: "Shams Method – classic" (listen, understand, repeat, recite, surah by
// surah; the sessions under /shams/[surah]) and "Shams Method 2.0" (the madrasa system under /shams/method). Two cards,
// the chosen one marked "Your method". The choice only decides where "Continue" and "Today's step" lead; both methods
// keep their own progress, so switching never loses anything (mode.ts).
const GOLD_LINE = "rgba(214,180,108,0.4)";

const AR: Record<ShamsMode, string> = { classic: "شَمْس", v2: "مَنْهَج شَمْس" };
const nameOf = (mode: ShamsMode, m: ModeT) => m(mode === "v2" ? "v2Title" : "classicTitle");

/** where the classic method continues: the learner's next verse, or al-Fātiḥa for someone who has not begun */
function classicAt() {
  const me = learner();
  return me.learned > 0 && me.next ? { surah: me.next.surah, verse: me.next.verse } : null;
}

/** the classic place, recomputed when the store changed (only when it is needed) */
function useClassicAt(needed: boolean) {
  const version = useStoreVersion();
  return useMemo(() => (needed ? classicAt() : null), [needed, version]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** the target and the wording of "Continue" / "Today's step" for the method in use */
export function useShamsContinue() {
  const m = useModeT();
  const { mode } = useShamsMode();
  const { name } = useSurahNames();
  const at = useClassicAt(mode === "classic");
  return {
    mode,
    href: continueHref(mode, at),
    /** label of a "Continue" button; classic keeps the caller's own wording (null) */
    label: mode === "v2" ? m("continueWird") : null,
    /** the line under "Today's step" */
    line: at ? m("classicNext", { surah: name(at.surah), v: at.verse }) : m("classicStart"),
    kicker: m("todayStep"),
    title: nameOf(mode, m),
  };
}

function ClassicNext({ m }: { m: ModeT }) {
  const { name } = useSurahNames();
  const at = useClassicAt(true);
  return <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: stage.gold, textAlign: "left" }}>{at ? m("classicNext", { surah: name(at.surah), v: at.verse }) : m("classicStart")}</Text>;
}

function V2Today() {
  const { s } = useS2();
  const { wird, grade } = useShams2();
  return <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: stage.gold, textAlign: "left" }}>{`${s("entryToday", { a: wird.sabaq.verses, b: wird.sabqi.verses, c: wird.manzil.verses })} · ${grade.tr}`}</Text>;
}

function MethodCard({ mode, chosen, suggested, nested, side, onPick }: { mode: ShamsMode; chosen: boolean; suggested: boolean; nested?: boolean; side?: boolean; onPick: (m: ShamsMode) => void }) {
  const m = useModeT();
  const title = nameOf(mode, m);
  const lead = m(mode === "v2" ? "v2Lead" : "classicLead");
  const forWhom = m(mode === "v2" ? "v2For" : "classicFor");
  return (
    <View style={{ ...(side ? { flex: 1, minWidth: 260 } : null), borderRadius: R.card, borderWidth: chosen ? 1.5 : 1, borderColor: chosen ? stage.gold : GOLD_LINE, backgroundColor: nested ? "rgba(0,0,0,0.22)" : stage.bg, padding: 16, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <Text allowFontScaling={false} accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 34, color: stage.gold, textAlign: "left" }}>{AR[mode]}</Text>
        {chosen ? (
          <View accessible accessibilityLabel={m("yourMethod")} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, height: 26, borderRadius: R.pill, backgroundColor: "rgba(214,180,108,0.16)", borderWidth: 1, borderColor: stage.gold }}>
            <Icon name="check" size={13} color={stage.gold} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.gold }}>{m("yourMethod")}</Text>
          </View>
        ) : suggested ? <Text style={{ fontFamily: FONT.medium, fontSize: 12, color: stage.textMuted }}>{m("suggested")}</Text> : null}
      </View>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 18, lineHeight: 24, color: stage.text, textAlign: "left" }}>{title}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft, textAlign: "left" }}>{lead}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: stage.textMuted, textAlign: "left" }}>{forWhom}</Text>
      {chosen ? (mode === "v2" ? <V2Today /> : <ClassicNext m={m} />) : null}
      <Pressable onPress={() => onPick(mode)} accessibilityRole="button" accessibilityLabel={`${chosen ? m("open") : m("choose")}: ${title}`}
        style={({ pressed }) => ({ marginTop: 6, minHeight: 46, borderRadius: R.pill, borderWidth: 1, borderColor: chosen ? stage.gold : "rgba(255,255,255,0.28)", alignItems: "center", justifyContent: "center", paddingHorizontal: 18, opacity: pressed ? 0.8 : 1 })}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: chosen ? stage.gold : "#ffffff" }}>{chosen ? m("open") : m("choose")}</Text>
      </Pressable>
    </View>
  );
}

/** opens a method: Shams Method 2.0's hub is taken back to when it is already open below (never a second hub on the
 *  stack, e.g. hub → Shams page → hub), everything else is pushed */
function useOpenMethod() {
  const root = useRootNavigationState();
  return (to: ShamsMode) => {
    const href = methodHref(to, classicAt()) as Href;
    if (to === "v2" && root?.routes?.some((r) => r.name === "shams/method")) router.dismissTo(href);
    else router.push(href);
  };
}

/** "Your method: … · Change" in the colours of the place it sits in (the dark Shams card or a light page) */
function ModeBarRow({ onStage, onChange }: { onStage: boolean; onChange: () => void }) {
  const t = useTheme();
  const m = useModeT();
  const { mode } = useShamsMode();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 14, borderRadius: R.card, borderWidth: 1,
      borderColor: onStage ? GOLD_LINE : t.line, backgroundColor: onStage ? "rgba(0,0,0,0.22)" : t.surface }}>
      <Icon name="sun" size={16} color={onStage ? stage.gold : t.accent} />
      <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: onStage ? stage.text : t.ink, textAlign: "left" }}>{m("methodIs", { name: nameOf(mode, m) })}</Text>
      <Pressable onPress={onChange} accessibilityRole="button" accessibilityLabel={`${m("change")}: ${m("chooserTitle")}`} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: onStage ? stage.gold : t.accent }}>{m("change")}</Text>
      </Pressable>
    </View>
  );
}

/** The two methods as cards. tone "page": on the Shams page (title above the cards in the page's colours); tone "stage":
 *  inside the dark Shams card of the Masterclass tab. Choosing marks the method as "Your method" and opens it.
 *  collapsible: once a method is chosen only the slim "Your method · Change" bar shows; "Change" opens the cards in place.
 *  here: the method whose screen the chooser sits on (the 2.0 hub): picking it again only closes the cards. */
export function ShamsModeChooser({ tone = "page", collapsible, here, onClose }: { tone?: "page" | "stage"; collapsible?: boolean; here?: ShamsMode; onClose?: () => void }) {
  const m = useModeT();
  const isl = useIsl();
  const { width } = useWindowDimensions();
  const { mode, chosen, suggested } = useShamsMode();
  const onStage = tone === "stage";
  const [open, setOpen] = useState(false);
  const openMethod = useOpenMethod();
  const pick = (to: ShamsMode) => {
    if (!(chosen && mode === to)) { setShamsMode(to); tick(); }
    setOpen(false);
    onClose?.();
    if (to !== here) openMethod(to);
  };
  if (collapsible && chosen && !open) return <ModeBarRow onStage={onStage} onChange={() => { tick(); setOpen(true); }} />;
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, color: onStage ? "#ffffff" : isl.ink, textAlign: "left" }}>{m("chooserTitle")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: onStage ? stage.textSoft : isl.muted, textAlign: "left" }}>{m("chooserLead")}</Text>
      </View>
      <View style={{ flexDirection: width >= 700 ? "row" : "column", gap: 12 }}>
        {(["classic", "v2"] as const).map((k) => <MethodCard key={k} mode={k} chosen={chosen && mode === k} suggested={!chosen && suggested === k} nested={onStage} side={width >= 700} onPick={pick} />)}
      </View>
    </View>
  );
}

/** One line for the plan screen: which method is in use and that it can be changed on the Shams page. */
export function ShamsModeNote({ top = 12 }: { top?: number }) {
  const m = useModeT();
  const { mode, chosen } = useShamsMode();
  const why = chosen ? "" : ` ${m(mode === "v2" ? "whyV2" : "whyClassic")}`;
  return (
    <View accessible accessibilityLabel={`${m("planNote", { name: nameOf(mode, m) })}${why}`}
      style={{ marginTop: top, flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(214,180,108,0.25)", backgroundColor: "rgba(255,255,255,0.04)", padding: 14 }}>
      <Icon name="sun" size={16} color={stage.gold} />
      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: stage.textSoft, textAlign: "left" }}>{`${m("planNote", { name: nameOf(mode, m) })}${why}`}</Text>
    </View>
  );
}

/** A slim bar on the Shams Method 2.0 hub: the method in use and a way to change it. "Change" opens the two cards in
 *  place (as on the website's hub) instead of the long Shams page, so no second hub is stacked when 2.0 is kept. */
export function ShamsModeBar() {
  const [open, setOpen] = useState(false);
  if (open) return <ShamsModeChooser here="v2" onClose={() => setOpen(false)} />;
  return <ModeBarRow onStage={false} onChange={() => { tick(); setOpen(true); }} />;
}
