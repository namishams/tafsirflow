import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton } from "@/components/brand";
import { CheckRow, FormError, LabeledField } from "@/components/form";
import { FONT, useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { AgeStep, useTalentErr } from "@/features/talents/ui";
import { T, type AgeStatus } from "@/features/talents/api";
import { UsernameStatus, usernameBlocked, useUsernameCheck } from "@/features/talents/UsernameCheck";
import { useUsernameText } from "@/features/talents/usernameText";
import { markUsernamePrompted } from "@/features/talents/usernamePrompt";

// /username – choose the unique @username (owner 22.10.2026, like Instagram): needed before the profile and every social
// feature; mandatory: shown after sign-in and on every open while an account has none (cannot be skipped). Creates the community profile (PUT /api/community/me) with the
// username, a display name and the accepted guidelines. Profiles are reachable only by username, never by e-mail or id.
export default function ChooseUsername() {
  const t = useTheme();
  const u = useUsernameText();
  const err = useTalentErr();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const state = useUsernameCheck(username, null, !!user);
  const [age, setAge] = useState<AgeStatus | null>(null);
  useEffect(() => { T.age().then(setAge).catch(() => setAge({ known: true, confirmed: true, community: true, interact: false })); }, []);
  const save = async () => {
    setBusy(true); setMsg("");
    try {
      await api("/api/community/me", { method: "PUT", body: { username: username.trim().toLowerCase(), name: name.trim() || username.trim(), role: "learner", bio: "", guidelines: true } });
      markUsernamePrompted(user?.id);
      router.replace("/account" as Href);
    } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <>
      {/* mandatory (owner 22.10.2026): no back button, no swipe back; under 13 the app goes on without a profile */}
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <Page>
        <PageHero topInset title={u.title} lead={u.lead} />
        {!age ? <Loading /> : !age.known ? <View style={{ padding: 16 }}><AgeStep onDone={setAge} /></View> : !age.community ? (
          <View style={{ padding: 16, gap: 14 }}><GoldButton title="OK" onPress={() => router.replace("/" as Href)} /></View>
        ) : <View style={{ padding: 16, gap: 14 }}>
          <LabeledField label={u.label} value={username} onChangeText={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 20))} autoCapitalize="none" autoCorrect={false} />
          <UsernameStatus state={state} />
          <LabeledField label={u.name} value={name} onChangeText={setName} maxLength={40} />
          <CheckRow checked={ok} onChange={setOk} label={u.guidelines}><Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14.5, color: t.ink }}>{u.guidelines}</Text></CheckRow>
          <FormError text={msg} />
          <GoldButton title={u.save} onPress={save} busy={busy} disabled={busy || !ok || state !== "ok"} />
        </View>}
      </Page>
    </>
  );
}
