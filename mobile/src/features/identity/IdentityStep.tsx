import { useState } from "react";
import { router, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Chip, Display, GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { alpha } from "@/features/extra/art";
import { AGE_BANDS, PRAYER_POSTURES, readIdentity, readPosture, saveIdentity, savePosture, useIdentity, type AgeBand, type Gender, type PrayerPosture } from "@/lib/identity";
import { SistersSetup } from "@/features/sisters/ui";
import { idText, restartLabel, type IdKey } from "@/web/identityText";

// Brother/sister and age band: one onboarding step (features/plan/Funnel.tsx) and the same choice in the profile
// settings (IdentitySetting). Both answers are optional: "Keine Angabe" and "Skip" store nothing but "asked".
// The step has up to three pages: who (brother/sister, age band) → prayer posture (device only, GDPR Art. 9) → for a
// sister only, the opt-in for "Für Schwestern" (features/sisters: consent first, then her school; device only).

export function useIdT() {
  const { lang } = useLang();
  return (k: IdKey) => idText(lang, k);
}

/** the onboarding step on the dark journey stage; `onDone` gets the personal reply the funnel shows */
export function IdentityStep({ disabled, onDone }: { disabled?: boolean; onDone: (reply: string) => void }) {
  const tx = useIdT();
  const [gender, setGender] = useState<Gender | null>(() => readIdentity().gender);
  const [age, setAge] = useState<AgeBand | null>(() => readIdentity().age);
  const opt = (g: Gender | null, label: string) => {
    const on = gender === g;
    return (
      <Pressable key={g ?? "none"} disabled={disabled} onPress={() => setGender(g)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={label}
        style={({ pressed }) => ({ flex: 1, minHeight: 56, alignItems: "center", justifyContent: "center", gap: 4, borderRadius: R.md, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 12,
          borderColor: on ? stage.gold : pressed ? alpha(stage.gold, 0.6) : alpha(stage.gold, 0.22), backgroundColor: on ? alpha(stage.gold, 0.12) : pressed ? "rgba(255,255,255,0.06)" : "rgba(6,30,23,0.62)" })}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: g ? 16 : 13.5, color: g ? "#ffffff" : stage.textMuted, textAlign: "center" }}>{label}</Text>
        {on ? <Icon name="checkCircle" color={stage.gold} size={16} /> : null}
      </Pressable>
    );
  };
  const [page, setPage] = useState<"who" | "posture" | "sisters">("who");
  const [posture, setPosture] = useState<PrayerPosture | null>(() => readPosture());
  const finish = (store: boolean) => {
    const id = store ? saveIdentity({ gender, age }) : saveIdentity({});
    if (!store) { onDone(tx("reply")); return; }
    void id;
    setPage("posture");
  };
  const afterPosture = (store: boolean) => {
    if (store) savePosture(posture);
    if (readIdentity().gender === "sister") setPage("sisters");
    else onDone(tx("reply"));
  };
  if (page === "sisters") return <SistersSetup onStage onDone={(agreed) => onDone(agreed ? tx("replySister") : tx("reply"))} />;
  if (page === "posture") {
    return (
      <View>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold, marginBottom: 8 }}>{tx("kicker")}</Text>
        <Display size="title1" onStage style={{ marginBottom: 10 }}>{tx("postureTitle")}</Display>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: stage.textSoft, marginBottom: 16 }}>{tx("postureLead")}</Text>
        <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
          {[...PRAYER_POSTURES, null].map((p) => {
            const on = posture === p;
            const label = p ? tx(p) : tx("none");
            return (
              <Pressable key={p ?? "none"} disabled={disabled} onPress={() => setPosture(p)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={label}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", minHeight: 52, borderRadius: R.md, borderWidth: 1, paddingHorizontal: 16,
                  borderColor: on ? stage.gold : pressed ? alpha(stage.gold, 0.6) : alpha(stage.gold, 0.22), backgroundColor: on ? alpha(stage.gold, 0.12) : pressed ? "rgba(255,255,255,0.06)" : "rgba(6,30,23,0.62)" })}>
                <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: p ? 16 : 14, color: p ? "#ffffff" : stage.textMuted }}>{label}</Text>
                {on ? <Icon name="checkCircle" color={stage.gold} size={18} /> : null}
              </Pressable>
            );
          })}
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: stage.textMuted, marginTop: 14 }}>{tx("posturePrivacy")}</Text>
        {!disabled ? (
          <>
            <GoldButton title={tx("next")} onPress={() => afterPosture(true)} style={{ marginTop: 18 }} />
            <Text onPress={() => afterPosture(false)} accessibilityRole="button" style={{ fontFamily: FONT.medium, fontSize: 14, color: stage.textMuted, textAlign: "center", paddingVertical: 14 }}>{tx("skip")}</Text>
          </>
        ) : null}
      </View>
    );
  }
  return (
    <View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold, marginBottom: 8 }}>{tx("kicker")}</Text>
      <Display size="title1" onStage style={{ marginBottom: 10 }}>{tx("title")}</Display>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: stage.textSoft, marginBottom: 16 }}>{tx("lead")}</Text>
      <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: 8 }}>
        {opt("brother", tx("brother"))}
        {opt("sister", tx("sister"))}
      </View>
      <View style={{ flexDirection: "row", marginTop: 8 }}>{opt(null, tx("none"))}</View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#ffffff", marginTop: 22, marginBottom: 10 }}>{tx("ageTitle")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {AGE_BANDS.map((b) => <Chip key={b} onStage label={tx(b)} selected={age === b} disabled={disabled} onPress={() => setAge(age === b ? null : b)} />)}
        <Chip onStage label={tx("none")} selected={age === null} disabled={disabled} onPress={() => setAge(null)} />
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: stage.textMuted, marginTop: 14 }}>{tx("privacy")}</Text>
      {!disabled ? (
        <>
          <GoldButton title={tx("next")} onPress={() => finish(true)} style={{ marginTop: 18 }} />
          <Text onPress={() => finish(false)} accessibilityRole="button" style={{ fontFamily: FONT.medium, fontSize: 14, color: stage.textMuted, textAlign: "center", paddingVertical: 14 }}>{tx("skip")}</Text>
        </>
      ) : null}
    </View>
  );
}

/** the same choice in the profile settings (light surface); saves at once */
export function IdentitySetting() {
  const t = useTheme();
  const { lang } = useLang();
  const tx = useIdT();
  const id = useIdentity();
  const [posture, setPostureS] = useState<PrayerPosture | null>(() => readPosture());
  const row = (label: string, children: React.ReactNode) => (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{children}</View>
    </View>
  );
  return (
    <View style={{ gap: 12, padding: 16, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
      <View style={{ gap: 4 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{tx("settingsTitle")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "left" }}>{tx("settingsLead")}</Text>
      </View>
      {row(tx("title"), (
        <>
          {(["brother", "sister"] as const).map((g) => <Chip key={g} label={tx(g)} selected={id.gender === g} onPress={() => saveIdentity({ gender: g })} />)}
          <Chip label={tx("none")} selected={id.gender === null} onPress={() => saveIdentity({ gender: null })} />
        </>
      ))}
      {row(tx("ageTitle"), (
        <>
          {AGE_BANDS.map((b) => <Chip key={b} label={tx(b)} selected={id.age === b} onPress={() => saveIdentity({ age: b })} />)}
          <Chip label={tx("none")} selected={id.age === null} onPress={() => saveIdentity({ age: null })} />
        </>
      ))}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted, textAlign: "left" }}>{tx("privacy")}</Text>
      {row(tx("postureTitle"), (
        <>
          {PRAYER_POSTURES.map((p) => <Chip key={p} label={tx(p)} selected={posture === p} onPress={() => { savePosture(p); setPostureS(p); }} />)}
          <Chip label={tx("none")} selected={posture === null} onPress={() => { savePosture(null); setPostureS(null); }} />
        </>
      ))}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted, textAlign: "left" }}>{tx("posturePrivacy")}</Text>
      {/* "Onboarding neu starten": the funnel with the current answers (personalise keeps plan and tree, deletes nothing) */}
      <Text onPress={() => router.push("/onboarding?personalise=1" as Href)} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent, textAlign: "left" }}>{restartLabel(lang)}</Text>
    </View>
  );
}
