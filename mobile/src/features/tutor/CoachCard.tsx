import { Pressable, Text, View } from "react-native";
import { useLang } from "@/i18n";
import { openHref } from "@/features/library/links";
import { useStored, writeJSON } from "@/lib/store";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { openTutor } from "./AskTutor";
import { useCoachInput } from "./coach";
import { TutorFace } from "./Face";
import { useTutor } from "./hooks";
import { dailyCheckIn, fillNext, nextUi, practicePlan } from "./next";
import { AiSeal, GOLD, GlassCard, alpha } from "./Parts";

// The daily check-in and the recitation coach on the Shams screens (website: src/components/tutor/CoachCard.tsx).
// One calm message a day from the learner's own figures (no notification, hidden for the day with one tap); after a
// Shams step the 10-minute plan with links into the drills, and the way to ask the tutor (AI) about the weak spots.
const HIDE_KEY = "qmc.tutor.checkin.v1";
const today = () => new Date().toISOString().slice(0, 10);

export function CoachCard({ after = false }: { after?: boolean }) {
  const t = useTheme();
  const { lang } = useLang();
  const nx = nextUi(lang);
  const { name, persona } = useTutor();
  const input = useCoachInput();
  const hiddenDay = useStored<string>(HIDE_KEY, "");
  if (!input || (!after && hiddenDay === today())) return null;
  const ci = dailyCheckIn(input);
  const plan = after || input.spots.length ? practicePlan(input) : [];
  const f = (s: string, v: Record<string, string | number> = {}) => fillNext(s, { name, ...v });
  return (
    <GlassCard gold>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <TutorFace persona={persona} size={40} still />
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase", color: goldButton.line }}>{after ? nx.coachTitle : nx.checkTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{after ? nx.coachLead : nx.fromData}</Text>
        </View>
        {!after ? (
          <Pressable onPress={() => writeJSON(HIDE_KEY, today(), true)} accessibilityRole="button" hitSlop={8}>
            <Text style={{ fontFamily: FONT.medium, fontSize: 12.5, color: t.muted }}>{nx.dismiss}</Text>
          </Pressable>
        ) : null}
      </View>
      {!after ? (
        <Pressable onPress={() => openHref(ci.href)} accessibilityRole="link">
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>
            {f(nx.check[ci.kind], { n: ci.n ?? 0, ref: ci.ref ?? "" })} <Text style={{ fontFamily: FONT.semibold, color: t.accent }}>{nx.open}</Text>
          </Text>
        </Pressable>
      ) : null}
      {plan.length ? (
        <View style={{ gap: 6, marginTop: after ? 0 : 12 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{nx.planTitle}</Text>
          {plan.map((s, i) => (
            <Pressable key={`${s.kind}${i}`} onPress={() => openHref(s.href)} accessibilityRole="link"
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingHorizontal: 12, paddingVertical: 9, borderRadius: R.md, borderWidth: 1, borderColor: pressed ? GOLD : t.line })}>
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, color: t.ink }}>{f(nx.steps[s.kind], { ref: s.ref ?? "", letter: s.letter ?? "" })}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: goldButton.line }}>{f(nx.min, { n: s.minutes })}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {input.spots.length || after ? (
        <Pressable onPress={() => openTutor({ kind: "shams", title: nx.coachTitle }, nx.coachAsk)} accessibilityRole="button"
          style={({ pressed }) => ({ alignSelf: "flex-start", marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, paddingStart: 6, paddingEnd: 12, borderRadius: 999, borderWidth: 1, borderColor: alpha(GOLD, 0.6), backgroundColor: alpha(GOLD, pressed ? 0.16 : 0.08) })}>
          <TutorFace persona={persona} size={26} still />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{f(nx.coachAskBtn)}</Text>
          <AiSeal />
        </Pressable>
      ) : null}
    </GlassCard>
  );
}
