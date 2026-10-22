import { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { R, useTheme } from "@/lib/theme";
import { SafetyBar } from "@/features/talents/ui";
import { TG, type Feature, type Settings } from "@/features/together/api";
import { demoOn } from "@/features/together/sample";
import { useTg, type TgKey } from "@/features/together/text";
import { Body, ToggleRow, TogetherGate, useTgErr, useTogetherAccess } from "@/features/together/ui";

// /together/settings – privacy of "Together": every feature is off until the member switches it on (opt-in per
// feature), with one sentence on what others see. The self-declared gender for brothers/sisters circles is shown, not
// editable (set once; support can change it).
// "circles" is no switch: consent is given per circle when joining and ends by leaving (circlesNote)
const ORDER: Feature[] = ["activity", "league", "challenges", "nudges", "community", "bestList"];

export default function TogetherSettings() {
  const t = useTheme();
  const tg = useTg();
  const err = useTgErr();
  const a = useTogetherAccess();
  const [s, setS] = useState<Settings | null>(null);
  const [msg, setMsg] = useState("");
  const ready = demoOn() || (a.state === "ok" && !!a.age?.interact && !!a.me?.profile);
  useEffect(() => { if (ready) TG.settings().then((d) => setS(d.settings)).catch((e) => setMsg(err(e))); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = async (f: Feature, v: boolean) => {
    if (!s) return;
    const patch: Partial<Settings> = { [f]: v };
    if (f === "community" && !v) patch.bestList = false;
    setS({ ...s, ...patch });
    try { setS((await TG.saveSettings(patch)).settings); } catch (e) { setMsg(err(e)); }
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={tg("eyebrow")} title={tg("settings")} lead={tg("settingsLead")} />
        <TogetherGate a={a}>
          <View style={{ padding: 16, gap: 16 }}>
            {msg ? <Body muted>{msg}</Body> : null}
            {!s ? <Loading /> : (
              <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
                {ORDER.map((f, i) => (
                  <ToggleRow key={f} first={i === 0} title={tg(`set_${f}` as TgKey)} hint={tg(`setHint_${f}` as TgKey)} value={s[f]}
                    disabled={f === "bestList" && !s.community} onChange={(v) => void set(f, v)} />
                ))}
              </View>
            )}
            <Body muted size={13}>{tg("circlesNote")}</Body>
            {s?.gender ? <Body muted size={13}>{`${tg("gender")}: ${tg(`gender_${s.gender}` as TgKey)}. ${tg("genderNote")}`}</Body> : null}
            <Body muted size={13}>{tg("safety")}</Body>
            <SafetyBar />
          </View>
        </TogetherGate>
      </Page>
    </>
  );
}
