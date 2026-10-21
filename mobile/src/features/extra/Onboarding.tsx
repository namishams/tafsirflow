import { useEffect, useState } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { router, type Href } from "expo-router";
import { Display, GoldButton, Stage } from "@/components/brand";
import { readJSON } from "@/lib/store";
import { FONT, R, stage } from "@/lib/theme";
import { readGoal, type Goal } from "@/web/coach";
import { readSrs } from "@/web/learning";
import { usePlanT } from "@/features/plan/texts";
import { IllumFrame } from "./art";

/** true on the first start: no plan, no goal, nothing learned yet and not skipped (same rule as the website) */
export function shouldOnboard(): boolean {
  return !readJSON("qmc.plan", null) && !readGoal() && Object.keys(readSrs()).length === 0 && !readJSON<boolean>("tf:onboardSkip", false);
}

/** where the website sends a learner with this goal (website paths = app routes, the reader is /quran/<n>) */
export function pathFor(g: Goal): { href: string; key: string } | null {
  if (g.read === "no") return { href: "/arabic", key: "pRead" };
  if (g.read === "some") return { href: "/arabic/placement", key: "pPlace" };
  if (g.aim === "hifz") return { href: "/plan", key: "pHifz" };
  if (g.aim === "read") return { href: "/khatm", key: "pKhatm" };
  if (g.aim === "understand") return { href: "/quran/1", key: "pUnderstand" };
  return null; // Juz ʿAmma: today's guided session
}

/**
 * The invitation card on Today while no personal plan exists: opens the onboarding quiz (/onboarding, features/plan).
 * `force` shows it even when shouldOnboard() is false.
 */
export function Onboarding({ force = false, style }: { force?: boolean; style?: StyleProp<ViewStyle> }) {
  const p = usePlanT();
  const [show, setShow] = useState(force);
  useEffect(() => { if (!force) setShow(shouldOnboard()); }, [force]);
  if (!show) return null;
  return (
    <Stage rounded={R.card} style={[{ marginTop: 16 }, style]}>
      <IllumFrame />
      <View style={{ padding: 24 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{p.kicker}</Text>
        <Display size="title1" onStage style={{ marginTop: 10 }}>{p.makePlan}</Display>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: stage.textSoft, marginTop: 8 }}>{p.makePlanD}</Text>
        <GoldButton title={p.next} onPress={() => router.push("/onboarding" as Href)} style={{ marginTop: 18 }} />
      </View>
    </Stage>
  );
}
