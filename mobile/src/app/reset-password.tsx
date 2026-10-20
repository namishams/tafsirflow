import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { GoldButton } from "@/components/brand";
import { Page, PageHero } from "@/components/page";
import { request } from "@/features/extra/http";
import { useWebT } from "@/i18n/web";
import { FONT, R, useTheme } from "@/lib/theme";

// The password-reset link from the e-mail (website /account/reset?token=…) opens the app through the universal link:
// choose the new password here, like the website's ResetForm (POST /api/auth/reset).
export default function ResetPassword() {
  const t = useTheme();
  const w = useWebT("account");
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    setBusy(true); setErr("");
    try {
      const r = await request<{ error?: string }>("/api/auth/reset", { token: String(token ?? ""), password: pw });
      if (r.ok) setDone(true);
      else setErr(w(r.data.error === "token" ? "errToken" : r.data.error === "weak" ? "errWeak" : "errGeneric"));
    } catch { setErr(w("errGeneric")); } finally { setBusy(false); }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset title={w("resetTitle")} />
        <View style={{ padding: 20, gap: 16 }}>
          {done ? (
            <>
              <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink, backgroundColor: t.accentSoft, borderRadius: R.md, padding: 14, overflow: "hidden" }}>{w("resetDone")}</Text>
              <GoldButton title={w("signIn")} onPress={() => { router.replace("/account" as never); router.push("/sign-in"); }} />
            </>
          ) : (
            <>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{w("newPassword")}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", height: 52, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingStart: 14 }}>
                <TextInput value={pw} onChangeText={setPw} secureTextEntry={!show} autoComplete="new-password" textContentType="newPassword" autoCapitalize="none" accessibilityLabel={w("newPassword")}
                  style={{ flex: 1, height: 50, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
                <Pressable onPress={() => setShow(!show)} accessibilityRole="button" style={{ paddingHorizontal: 14, height: 50, justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{show ? w("hideP") : w("showP")}</Text>
                </Pressable>
              </View>
              {err ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 14, color: t.danger }}>{err}</Text> : null}
              <GoldButton title={w("resetTitle")} busy={busy} disabled={pw.length < 10 || !token} onPress={() => void submit()} />
            </>
          )}
        </View>
      </Page>
    </>
  );
}
