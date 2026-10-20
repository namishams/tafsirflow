import { Fragment, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { Display, GoldButton, Stage } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import { readJSON, writeJSON } from "@/lib/store";
import { CALLIG_FONT, FONT, R, stage } from "@/lib/theme";
import { readGoal, type Goal } from "@/web/coach";
import { readSrs } from "@/web/learning";
import { HomeStar, IllumFrame, StarGlyph, alpha } from "./art";
import { KidsToggle } from "./KidsToggle";
import { useX } from "./strings";
import { goBack } from "@/components/page";

type Read = Goal["read"]; type Aim = Goal["aim"]; type Age = "child" | "teen" | "adult" | "senior";
const MINUTES = [5, 10, 20, 30];
// a representative year of birth per age group: lib/age.ts only needs the group (child < 13, teen < 18, senior >= 60)
const AGE_YEARS: Record<Age, number> = { child: 9, teen: 15, adult: 30, senior: 65 };

/** true on the first start: no goal, nothing learned yet and not skipped (same rule as the website) */
export function shouldOnboard(): boolean {
  return !readGoal() && Object.keys(readSrs()).length === 0 && !readJSON<boolean>("tf:onboardSkip", false);
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
 * First-run questions of the website (Onboarding.tsx) – can you read Arabic, what is your goal, how much time a day –
 * plus "who is learning" for the app (ages 6+): it sets tf:age (slower audio, more repetitions and test time for
 * children and seniors, lib/age.ts) unless the account already did, and offers kids mode for children.
 * Writes tf:goal like the website (synced with the account). Props:
 * - force: show even when shouldOnboard() is false (the /onboarding route)
 * - fullScreen: fill the screen (route) instead of a rounded card (Today tab)
 * - onClose: "Skip" / "Later" (default: goBack() in full screen, otherwise just hide)
 * - onStartSession: the Juz ʿAmma path starts today's session (default: the Today tab)
 */
export function Onboarding({ force = false, fullScreen = false, onClose, onStartSession, style }: {
  force?: boolean; fullScreen?: boolean; onClose?: () => void; onStartSession?: () => void; style?: StyleProp<ViewStyle>;
}) {
  const w = useWebT("onboard");
  const x = useX().onboard;
  const insets = useSafeAreaInsets();
  const [show, setShow] = useState(force);
  const [askAge] = useState(() => readJSON<number | null>("tf:age", null) === null);
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<Age | null>(null);
  const [read, setRead] = useState<Read | null>(null);
  const [aim, setAim] = useState<Aim | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  useEffect(() => { if (!force) setShow(shouldOnboard()); }, [force]);
  if (!show) return null;

  const total = askAge ? 4 : 3;
  const qIndex = askAge ? step : step + 1; // 0 age, 1 read, 2 aim, 3 minutes, 4 ready
  const close = () => { setShow(false); if (onClose) onClose(); else if (fullScreen && router.canGoBack()) goBack(); };
  const skip = () => { writeJSON("tf:onboardSkip", true); close(); };
  const chooseAge = (a: Age) => {
    setAge(a);
    writeJSON("tf:age", new Date().getFullYear() - AGE_YEARS[a], true);
    setStep(step + 1);
  };
  const save = (minutes: number) => { const g: Goal = { read: read!, aim: aim!, minutes, at: Date.now() }; writeJSON("tf:goal", g); setGoal(g); setStep(step + 1); };
  const path = goal ? pathFor(goal) : null;
  const go = () => {
    setShow(false);
    if (path) { if (fullScreen) router.replace(path.href as Href); else router.push(path.href as Href); return; }
    if (onStartSession) onStartSession(); else router.navigate("/" as Href);
  };

  const opt = (on: boolean, label: string, desc: string, onPress: () => void) => (
    <Pressable key={label} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${label}. ${desc}`}
      style={({ pressed }) => ({ borderRadius: R.md, borderWidth: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14,
        borderColor: on ? stage.gold : pressed ? alpha(stage.gold, 0.6) : alpha(stage.gold, 0.22), backgroundColor: on ? alpha(stage.gold, 0.12) : pressed ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)" })}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: "#ffffff" }}>{label}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>{desc}</Text>
    </Pressable>
  );
  const title = (s: string) => <Display size="title1" onStage style={{ marginBottom: 16 }}>{s}</Display>;

  const body = (
    <View style={{ padding: 24, paddingTop: 22 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{w("kicker")} · {Math.min(step + 1, total)}/{total}</Text>
        {qIndex < 4 ? <Text onPress={skip} accessibilityRole="button" style={{ fontFamily: FONT.medium, fontSize: 13.5, color: "rgba(255,255,255,0.6)", paddingVertical: 6 }}>{w("skip")}</Text> : null}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14, marginBottom: 22 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {Array.from({ length: total }, (_, i) => (
          <Fragment key={i}>
            <StarGlyph size={14} color={i <= step ? stage.gold : "rgba(255,255,255,0.25)"} />
            {i < total - 1 ? <View style={{ flex: 1, height: 1, backgroundColor: i < step ? stage.gold : "rgba(255,255,255,0.15)" }} /> : null}
          </Fragment>
        ))}
      </View>

      {qIndex === 0 ? (
        <>
          {title(x.qAge)}
          <View style={{ gap: 8 }}>{([["child", x.a_child, x.a_childD], ["teen", x.a_teen, x.a_teenD], ["adult", x.a_adult, x.a_adultD], ["senior", x.a_senior, x.a_seniorD]] as [Age, string, string][]).map(([a, l, d]) => opt(age === a, l, d, () => chooseAge(a)))}</View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.55)", marginTop: 14 }}>{x.qAgeD}</Text>
        </>
      ) : null}
      {qIndex === 1 ? (
        <>
          {title(w("q1"))}
          <View style={{ gap: 8 }}>{(["no", "some", "fluent"] as Read[]).map((r) => opt(read === r, w(`r_${r}`), w(`r_${r}D`), () => { setRead(r); setStep(step + 1); }))}</View>
        </>
      ) : null}
      {qIndex === 2 ? (
        <>
          {title(w("q2"))}
          <View style={{ gap: 8 }}>{(["juzamma", "hifz", "read", "understand"] as Aim[]).map((a) => opt(aim === a, w(`a_${a}`), w(`a_${a}D`), () => { setAim(a); setStep(step + 1); }))}</View>
        </>
      ) : null}
      {qIndex === 3 ? (
        <>
          {title(w("q3"))}
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            {MINUTES.map((m) => (
              <Pressable key={m} onPress={() => save(m)} accessibilityRole="button" accessibilityLabel={`${m} ${w("min")}`}
                style={({ pressed }) => ({ flex: 1, alignItems: "center", gap: 6, paddingVertical: 8, borderRadius: R.lg, backgroundColor: pressed ? "rgba(255,255,255,0.06)" : "transparent" })}>
                <HomeStar size={58} tone="dark">{m}</HomeStar>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{w("min")}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.55)", marginTop: 12 }}>{w("q3D")}</Text>
        </>
      ) : null}
      {qIndex === 4 && goal ? (
        <>
          <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 34, lineHeight: 56, color: stage.gold, writingDirection: "rtl", textAlign: "left" }}>بارك الله فيك</Text>
          <Display size="title1" onStage>{w("ready")}</Display>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: "rgba(255,255,255,0.75)", marginTop: 10 }}>{path ? w(path.key) : w("pSession", { min: goal.minutes })}</Text>
          {age === "child" ? (
            <View style={{ marginTop: 18, gap: 10 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: "rgba(255,255,255,0.7)" }}>{x.kidsHint}</Text>
              <KidsToggle onStage />
            </View>
          ) : null}
          <View style={{ marginTop: 24, gap: 12 }}>
            <GoldButton title={path ? w("go") : x.sessionCta} onPress={go} />
            <Text onPress={close} accessibilityRole="button" style={{ alignSelf: "center", fontFamily: FONT.medium, fontSize: 14, color: "rgba(255,255,255,0.65)", paddingVertical: 8 }}>{w("later")}</Text>
          </View>
        </>
      ) : null}
    </View>
  );

  if (fullScreen) {
    return (
      <Stage hairlines={false} style={[{ flex: 1 }, style]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}>{body}</ScrollView>
      </Stage>
    );
  }
  return (
    <Stage rounded={R.card} style={[{ marginTop: 16 }, style]}>
      <IllumFrame />
      {body}
    </Stage>
  );
}
