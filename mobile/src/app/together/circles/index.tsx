import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { Chip, GoldButton, OutlineButton } from "@/components/brand";
import { CheckRow, FormError } from "@/components/form";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { SafetyBar } from "@/features/talents/ui";
import { TG, type CircleKind, type CircleSummary, type Gender, type GoalKind, type Settings } from "@/features/together/api";
import { demoOn } from "@/features/together/sample";
import { useTg, type TgKey } from "@/features/together/text";
import { Body, Label, NumberField, Progress, Section, Tile, TogetherGate, useTgErr, useTogetherAccess } from "@/features/together/ui";
import { readIdentity } from "@/lib/identity";

// /together/circles – the member's study circles, "Create a circle" and "Join with a code". Circles are brothers,
// sisters (self-declared once), family or teacher-led (the leader approves every member). No chat; joining needs the
// consent that members see the weekly progress.
const KINDS: CircleKind[] = ["brothers", "sisters", "family", "teacher"];
const GOALS: GoalKind[] = ["days", "xp", "verses"];
const DEFAULT_GOAL: Record<GoalKind, string> = { days: "20", xp: "2000", verses: "30" };

export default function TogetherCircles() {
  const t = useTheme();
  const tg = useTg();
  const err = useTgErr();
  const a = useTogetherAccess();
  const p = useLocalSearchParams<{ new?: string; join?: string; code?: string }>();
  const [list, setList] = useState<CircleSummary[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mode, setMode] = useState<"new" | "join" | null>(p.new ? "new" : p.join || p.code ? "join" : null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<CircleKind | null>(null);
  const [goalKind, setGoalKind] = useState<GoalKind>("days");
  const [goal, setGoal] = useState(DEFAULT_GOAL.days);
  const [approval, setApproval] = useState(true);
  // preselected from the onboarding's brother/sister (lib/identity.ts); the member still confirms it, and the server
  // keeps its rule: set once, later changes only through support
  const [gender, setGender] = useState<Gender | null>(() => readIdentity().gender);
  const [code, setCode] = useState(p.code ?? "");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const ready = demoOn() || (a.state === "ok" && !!a.age?.interact && !!a.me?.profile);
  const load = () => {
    TG.circles().then((d) => setList(d.circles)).catch((e) => { setMsg(err(e)); setList([]); });
    TG.settings().then((d) => setSettings(d.settings)).catch(() => undefined);
  };
  useEffect(() => { if (ready) load(); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const needGender = !settings?.gender && (mode === "join" || kind === "brothers" || kind === "sisters");

  const create = async () => {
    if (!kind) return;
    setBusy(true); setMsg("");
    try {
      const r = await TG.createCircle({ name: name.trim(), kind, goalKind, goal: Number(goal), approval, consent: true, gender: gender ?? undefined });
      router.replace(`/together/circles/${r.id}` as Href);
    } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  const join = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await TG.joinCircle({ code, consent: true, gender: gender ?? undefined });
      router.replace(`/together/circles/${r.id}` as Href);
    } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  const genderPick = needGender ? (
    <View style={{ gap: 8 }}>
      <Label>{tg("gender")}</Label>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["brother", "sister"] as const).map((g) => <Chip key={g} label={tg(`gender_${g}` as TgKey)} selected={gender === g} onPress={() => setGender(g)} />)}
      </View>
      <Body muted size={12.5}>{tg("genderNote")}</Body>
    </View>
  ) : null;
  const consentRow = (
    <CheckRow checked={consent} onChange={setConsent} label={tg("consentCircle")}>
      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink }}>{tg("consentCircle")}</Text>
    </CheckRow>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={tg("eyebrow")} title={tg("circles")} lead={tg("circlesLead")} />
        <TogetherGate a={a}>
          <View style={{ padding: 16, gap: 22 }}>
            {!list ? <Loading /> : (
              <Section title={tg("circles")}>
                {list.length ? list.map((c) => (
                  <Pressable key={c.id} onPress={() => router.push(`/together/circles/${c.id}` as Href)} accessibilityRole="button" accessibilityLabel={c.name}>
                    <Tile>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{c.name}</Text>
                          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>
                            {[tg(`kind_${c.kind}` as TgKey), c.role === "leader" ? tg("leader") : null, tg("membersN", { n: c.members }), c.status === "pending" ? tg("pending") : null, c.pending ? tg("pendingN", { n: c.pending }) : null].filter(Boolean).join(" · ")}
                          </Text>
                        </View>
                        <Icon name="chevronRight" color={t.muted} size={16} />
                      </View>
                      {c.status === "member" && !c.suspended ? <Progress value={c.progress} max={c.goal} label={tg(`goal_${c.goalKind}` as TgKey)} /> : null}
                    </Tile>
                  </Pressable>
                )) : <Body muted>{tg("noCircles")}</Body>}
              </Section>
            )}
            <View style={{ flexDirection: "row", gap: 8 }}>
              <GoldButton title={tg("circleNew")} compact onPress={() => { setMode("new"); setConsent(false); setMsg(""); }} style={{ flex: 1 }} />
              <OutlineButton title={tg("circleJoin")} compact onPress={() => { setMode("join"); setConsent(false); setMsg(""); }} style={{ flex: 1 }} />
            </View>

            {mode === "new" ? (
              <Tile>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{tg("circleNew")}</Text>
                <Label>{tg("circleName")}</Label>
                <TextInput value={name} onChangeText={setName} maxLength={40} placeholder={tg("circleNameHint")} placeholderTextColor={t.muted} accessibilityLabel={tg("circleName")}
                  style={{ height: 48, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 14, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
                <Label>{tg("kind")}</Label>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {KINDS.map((k) => <Chip key={k} label={tg(`kind_${k}` as TgKey)} selected={kind === k} onPress={() => setKind(k)} />)}
                </View>
                {kind ? <Body muted size={13}>{tg(`kindHint_${kind}` as TgKey)}</Body> : null}
                {genderPick}
                <Label>{tg("goalKind")}</Label>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {GOALS.map((g) => <Chip key={g} label={tg(`goal_${g}` as TgKey)} selected={goalKind === g} onPress={() => { setGoalKind(g); setGoal(DEFAULT_GOAL[g]); }} />)}
                </View>
                <Label>{tg("goalAmount")}</Label>
                <NumberField value={goal} onChange={setGoal} label={tg("goalAmount")} />
                {kind === "brothers" || kind === "sisters" ? (
                  <CheckRow checked={approval} onChange={setApproval} label={tg("approval")}><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{tg("approval")}</Text></CheckRow>
                ) : null}
                {consentRow}
                <FormError text={msg} />
                <GoldButton title={tg("create")} onPress={create} busy={busy} disabled={busy || !consent || !kind || name.trim().length < 3 || !goal || (needGender && !gender)} />
              </Tile>
            ) : null}

            {mode === "join" ? (
              <Tile>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{tg("circleJoin")}</Text>
                <Label>{tg("codeLabel")}</Label>
                <TextInput value={code} onChangeText={(v) => setCode(v.toUpperCase().slice(0, 9))} autoCapitalize="characters" autoCorrect={false} placeholder={tg("codeHint")} placeholderTextColor={t.muted} accessibilityLabel={tg("codeLabel")}
                  style={{ height: 52, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 14, fontFamily: FONT.bold, fontSize: 20, letterSpacing: 3, color: t.ink, textAlign: "center" }} />
                {genderPick}
                {consentRow}
                <FormError text={msg} />
                <GoldButton title={tg("join")} onPress={join} busy={busy} disabled={busy || !consent || code.replace(/[^A-Z0-9]/g, "").length !== 8} />
              </Tile>
            ) : null}
            <Body muted size={13}>{tg("safety")}</Body>
            <SafetyBar />
          </View>
        </TogetherGate>
      </Page>
    </>
  );
}
