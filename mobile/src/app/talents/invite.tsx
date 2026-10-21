import { useState } from "react";
import { Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { FONT, useTheme } from "@/lib/theme";
import { Page, PageHero } from "@/components/page";
import { GoldButton } from "@/components/brand";
import { FormError, LabeledField } from "@/components/form";
import { T } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { AccessGate, SafetyBar, useTalentAccess, useTalentErr } from "@/features/talents/ui";

// /talents/invite – redeem a master invitation code (from the Account tab)
export default function RedeemInvite() {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const a = useTalentAccess();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const redeem = async () => {
    setBusy(true); setMsg("");
    try { await T.redeem(code); setOk(true); } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  const mine = a.me?.profile?.username;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back arcade={false} eyebrow={tt("network")} title={tt("inviteTitle")} lead={tt("inviteLead")} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 16 }}>
            {!mine ? (
              <>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{tt("needProfile")}</Text>
                <GoldButton title={tt("createProfile")} onPress={() => router.push("/community/me" as Href)} />
              </>
            ) : ok ? (
              <>
                <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 16, lineHeight: 23, color: t.accent }}>{tt("inviteOk")}</Text>
                <GoldButton title={tt("myTalentProfile")} onPress={() => router.replace(`/talents/u/${mine}` as Href)} />
              </>
            ) : (
              <>
                <LabeledField label={tt("inviteCode")} value={code} onChangeText={(v) => setCode(v.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 14))}
                  autoCapitalize="characters" autoCorrect={false} placeholder="XXXX-XXXX-XXXX" style={{ letterSpacing: 1.5, writingDirection: "ltr", textAlign: "left" }} />
                <FormError text={msg} />
                <GoldButton title={tt("redeem")} onPress={() => void redeem()} busy={busy} disabled={busy || code.replace(/-/g, "").length !== 12} />
              </>
            )}
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
    </>
  );
}
