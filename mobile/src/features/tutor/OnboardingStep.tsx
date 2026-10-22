import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoldButton, OutlineButton, Stage } from "@/components/brand";
import { openHref } from "@/features/library/links";
import { useLang } from "@/i18n";
import { readTradition } from "@/lib/tradition";
import { FONT, R, stage } from "@/lib/theme";
import { readIdentity } from "@/lib/identity";
import type { Plan } from "@/features/plan/plan";
import { readV2 } from "@/features/plan/v2";
import { tailorPath, tutorStatus, type PathStep } from "./api";
import { TutorFace } from "./Face";
import { useTutor } from "./hooks";
import { ConsentCard } from "./Parts";
import { hasConsent, readPrefs } from "./prefs";

// Onboarding, the optional last step (after the plan and the planting ceremony, before the paywall): "Ask Dalil to
// tailor your plan". Only option ids of the onboarding answers go to the server (no name); without consent, AI or a
// connection the step is skipped or can be skipped – the plan made by the app stays as it is. The frozen onboarding
// scenes (BLUEPRINT §9) are not touched: this is a screen of its own on the same emerald stage.
export function TutorPlanStep({ plan, onDone }: { plan: Plan | null; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { lang } = useLang();
  const { ui, f, persona, address } = useTutor();
  const [ready, setReady] = useState<boolean | null>(null);
  const [consent, setConsent] = useState(hasConsent());
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(false);
  const [res, setRes] = useState<{ intro: string; steps: PathStep[] } | null>(null);

  // the step only appears when the tutor is switched on and reachable; otherwise the funnel goes straight on
  useEffect(() => {
    let live = true;
    tutorStatus().then((s) => { if (live) { if (s.enabled) setReady(true); else onDone(); } }).catch(() => { if (live) onDone(); });
    return () => { live = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async () => {
    const c = readPrefs().consent;
    if (!c || !hasConsent()) { setAsk(true); return; }
    setBusy(true); setFail(false);
    const v2 = readV2();
    const a = plan?.answers;
    const t = readTradition();
    const answers: Record<string, string> = {
      goals: (v2?.goals ?? []).join(","), interests: (v2?.interests ?? []).join(","), challenges: (v2?.challenges ?? []).join(","),
      level: a?.level ?? "", minutes: a ? String(a.minutes) : "", motivation: a?.motivation ?? "", reciter: a?.reciter ? "chosen" : "",
      tradition: t ?? "", age: readIdentity().age ?? "",
    };
    try { setRes(await tailorPath({ answers, locale: lang, address, persona, consent: c })); }
    catch { setFail(true); }
    finally { setBusy(false); }
  };

  if (ready === null) return <Stage style={{ flex: 1 }}><View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={stage.gold} /></View></Stage>;
  return (
    <Stage style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32, paddingHorizontal: 20, gap: 18, maxWidth: 560, width: "100%", alignSelf: "center" }}>
        <View style={{ alignItems: "center", gap: 14 }}>
          <TutorFace persona={persona} size={150} speaking={busy} />
          <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 24, lineHeight: 30, color: stage.text, textAlign: "center" }}>{f(ui.obTitle)}</Text>
          {!res ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 23, color: stage.textSoft, textAlign: "center" }}>{f(ui.obText)}</Text> : null}
        </View>

        {ask && !consent ? <ConsentCard onDone={() => { setConsent(true); setAsk(false); void run(); }} onLater={() => setAsk(false)} /> : null}

        {busy ? <View style={{ alignItems: "center", gap: 10 }}><ActivityIndicator color={stage.gold} /><Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textMuted }}>{f(ui.obWorking)}</Text></View> : null}
        {fail ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: stage.textSoft, textAlign: "center" }}>{f(ui.obFail)}</Text> : null}

        {res ? (
          <View style={{ gap: 12 }}>
            {res.intro ? <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: stage.text }}>{res.intro}</Text> : null}
            {res.steps.map((s, i) => (
              <Pressable key={s.id} onPress={() => { onDone(); setTimeout(() => openHref(s.link), 300); }} accessibilityRole="link" accessibilityLabel={`${s.title}. ${s.why}`}
                style={({ pressed }) => ({ flexDirection: "row", gap: 12, borderRadius: R.lg, borderWidth: 1, borderColor: pressed ? stage.gold : stage.goldSoft, backgroundColor: "rgba(6,30,23,0.62)", padding: 14 })}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: stage.gold, minWidth: 18 }}>{i + 1}</Text>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: stage.text }}>{s.title}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: stage.textMuted }}>{s.why}</Text>
                </View>
              </Pressable>
            ))}
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted }}>{ui.obNote} · {f(ui.note)}</Text>
          </View>
        ) : null}

        <View style={{ gap: 10, marginTop: 6 }}>
          {!res && !busy && !(ask && !consent) && !fail ? <GoldButton title={ui.obCta} onPress={() => void run()} /> : null}
          <OutlineButton title={res || fail ? ui.cont : ui.obSkip} onStage onPress={onDone} />
        </View>
      </ScrollView>
    </Stage>
  );
}
