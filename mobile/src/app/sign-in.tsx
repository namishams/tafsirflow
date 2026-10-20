import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Stack, router } from "expo-router";
import { FONT, useTheme } from "@/lib/theme";
import { Divider, GoldButton, GoldCard, TextLink } from "@/components/brand";
import { PageHero, goBack } from "@/components/page";
import { FormError, LabeledField } from "@/components/form";
import { useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { useWebT } from "@/i18n/web";
import { request } from "@/features/extra/http";

// Sign in with the website account (same e-mail and password as on quranmasterclass.com). "Forgot password?" asks
// for the reset link right here (POST /api/auth/forgot, like the website's form; app requests need no captcha); the
// link in the e-mail opens /reset-password in the app.
export default function SignIn() {
  const t = useT();
  const theme = useTheme();
  const { lang } = useLang();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const wa = useWebT("account");
  const [forgot, setForgot] = useState(false);
  const [sent, setSent] = useState(false);

  const sendReset = async () => {
    setBusy(true); setError("");
    try {
      const r = await request<{ error?: string }>("/api/auth/forgot", { email: email.trim(), locale: lang });
      if (r.ok) setSent(true);
      else setError(r.data.error === "rate" ? wa("errRate") : wa("errGeneric"));
    } catch { setError(t("common.offline")); } finally { setBusy(false); }
  };

  const submit = async () => {
    setBusy(true); setError("");
    try {
      await login(email.trim(), password);
      goBack();
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "";
      setError(code === "invalid" ? t("auth.errors.invalid") : code === "rate" ? t("auth.errors.rate") : t("common.error"));
    } finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
        <PageHero back eyebrow="Quran Masterclass" title={forgot ? wa("forgotTitle") : t("auth.signInTitle")} lead={forgot ? wa("forgotHint") : t("account.notSignedIn")} />
        <View style={{ padding: 16 }}>
          {forgot ? (
            <GoldCard>
              <View style={{ gap: 16 }}>
                {sent ? (
                  <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: theme.ink, backgroundColor: theme.accentSoft, borderRadius: 10, padding: 14, overflow: "hidden" }}>{wa("forgotSent")}</Text>
                ) : (
                  <>
                    <LabeledField label={t("auth.email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" returnKeyType="send" onSubmitEditing={() => { if (email.includes("@")) void sendReset(); }} />
                    <FormError text={error} />
                    <GoldButton title={wa("sendReset")} busy={busy} disabled={!email.includes("@")} onPress={() => void sendReset()} />
                  </>
                )}
                <TextLink title={wa("backToLogin")} onPress={() => { setForgot(false); setSent(false); setError(""); }} style={{ alignSelf: "center", fontSize: 14 }} />
              </View>
            </GoldCard>
          ) : (
          <GoldCard>
            <View style={{ gap: 16 }}>
              <LabeledField label={t("auth.email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" returnKeyType="next" />
              <LabeledField label={t("auth.password")} secure value={password} onChangeText={setPassword} autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={() => void submit()} />
              <TextLink title={t("auth.forgot")} onPress={() => { setForgot(true); setSent(false); setError(""); }} style={{ alignSelf: "flex-end", fontSize: 14, paddingVertical: 0 }} />
              <FormError text={error} />
              <GoldButton title={t("auth.signInTitle")} busy={busy} disabled={!email.includes("@") || !password} onPress={() => void submit()} />
            </View>
          </GoldCard>
          )}
          <Divider style={{ marginVertical: 22 }} />
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: theme.muted }}>{t("auth.noAccount")}</Text>
            <TextLink title={t("account.createAccount")} onPress={() => router.replace("/register")} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
