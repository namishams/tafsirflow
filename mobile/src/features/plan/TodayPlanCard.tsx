import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { GoldButton, GoldCard, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { openPro, usePro } from "@/lib/pro";
import { FONT, R, useTheme } from "@/lib/theme";
import { tick, success } from "@/features/feed/haptics";
import { doneToday, planDay, streakOf, todaysSteps, toggleStep, useDone, usePlan } from "./plan";
import { fmt, usePlanT } from "./texts";
import { planStepHref, useShamsMode } from "@/features/shams2/mode";

/** "Today's plan" on the Masterclass tab: today's steps with checkboxes, the streak, and Pro for locked steps.
 *  Without a plan it invites to the short quiz (/onboarding). secondary: the invitation as an outline button, for
 *  screens whose one gold action is another (the Shams tab's "Continue"). */
export function TodayPlanCard({ secondary }: { secondary?: boolean } = {}) {
  const t = useTheme();
  const p = usePlanT();
  const { pro } = usePro();
  const plan = usePlan();
  const done = useDone();
  const { mode } = useShamsMode(); // the Shams steps open today's wird for Shams Method 2.0
  if (!plan) {
    return (
      <GoldCard>
        <Text style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{p.makePlan}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 4 }}>{p.makePlanD}</Text>
        {secondary ? <OutlineButton title={p.next} onPress={() => router.push("/onboarding" as Href)} style={{ marginTop: 14 }} />
          : <GoldButton title={p.next} onPress={() => router.push("/onboarding" as Href)} style={{ marginTop: 14 }} />}
      </GoldCard>
    );
  }
  const steps = todaysSteps(plan);
  const today = doneToday(done);
  const streak = streakOf(done);
  const all = steps.length > 0 && steps.every((s) => today.has(s.id) || (s.pro && !pro));
  return (
    <GoldCard>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{p.todayTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, marginTop: 2 }}>{fmt(p.dayOf, { n: planDay(plan) })}</Text>
        </View>
        {streak > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, height: 28, borderRadius: R.pill, backgroundColor: t.accentSoft }} accessible accessibilityLabel={fmt(p.streak, { n: streak })}>
            <Icon name="flame" color={t.gold} size={15} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.ink }}>{fmt(p.streak, { n: streak })}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ marginTop: 12, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
        {steps.map((s, i) => {
          const locked = s.pro && !pro;
          const on = today.has(s.id);
          return (
            <View key={s.id} style={{ flexDirection: "row", alignItems: "center", borderTopWidth: i ? 1 : 0, borderTopColor: t.line, minHeight: 56 }}>
              <Pressable onPress={() => { if (locked) { openPro("general"); return; } const next = !on; toggleStep(s.id, next); if (next) { if (steps.every((x) => x.id === s.id || today.has(x.id) || (x.pro && !pro))) success(); else tick(); } }}
                accessibilityRole="checkbox" accessibilityState={{ checked: on, disabled: locked }} accessibilityLabel={p[`s_${s.id}`]} hitSlop={6}
                style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
                {locked ? <Icon name="lock" color={t.gold} size={20} /> : (
                  <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accent : "transparent", alignItems: "center", justifyContent: "center" }}>
                    {on ? <Icon name="check" color="#ffffff" size={14} /> : null}
                  </View>
                )}
              </Pressable>
              <Pressable onPress={() => (locked ? openPro("general") : router.push(planStepHref(s.id, s.href, mode) as Href))} accessibilityRole="button" accessibilityLabel={locked ? `${p[`s_${s.id}`]}, ${p.unlock}` : p[`s_${s.id}`]}
                style={({ pressed }) => ({ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingRight: 14, paddingVertical: 12, opacity: pressed ? 0.7 : 1 })}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textDecorationLine: on ? "line-through" : "none" }}>{p[`s_${s.id}`]}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: locked ? t.gold : t.muted, marginTop: 2 }}>{locked ? p.unlock : fmt(p.stepMin, { n: s.minutes })}</Text>
                </View>
                <Icon name="chevronRight" color={t.muted} size={16} />
              </Pressable>
            </View>
          );
        })}
      </View>
      {all ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent, marginTop: 10 }} accessibilityLiveRegion="polite">{p.todayDone}</Text> : null}
      <Text onPress={() => router.push("/onboarding" as Href)} accessibilityRole="button" style={{ fontFamily: FONT.medium, fontSize: 13.5, color: t.accent, marginTop: 10, alignSelf: "flex-start", paddingVertical: 4 }}>{p.adjust}</Text>
    </GoldCard>
  );
}
