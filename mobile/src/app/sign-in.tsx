import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Stack, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { FONT, useTheme } from "@/lib/theme";
import { Divider, GoldButton, GoldCard, TextLink } from "@/components/brand";
import { PageHero, goBack } from "@/components/page";
import { FormError, LabeledField } from "@/components/form";
import { useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { ApiError, SITE } from "@/lib/api";

// Sign in with the website account (same e-mail and password as on quranmasterclass.com)
export default function SignIn() {
  const t = useT();
  const theme = useTheme();
  const { lang } = useLang();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
        <PageHero back eyebrow="Quran Masterclass" title={t("auth.signInTitle")} lead={t("account.notSignedIn")} />
        <View style={{ padding: 16 }}>
          <GoldCard>
            <View style={{ gap: 16 }}>
              <LabeledField label={t("auth.email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" returnKeyType="next" />
              <LabeledField label={t("auth.password")} secure value={password} onChangeText={setPassword} autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={() => void submit()} />
              <TextLink title={t("auth.forgot")} onPress={() => WebBrowser.openBrowserAsync(`${SITE}/${lang}/account?forgot=1`)} style={{ alignSelf: "flex-end", fontSize: 14, paddingVertical: 0 }} />
              <FormError text={error} />
              <GoldButton title={t("auth.signInTitle")} busy={busy} disabled={!email.includes("@") || !password} onPress={() => void submit()} />
            </View>
          </GoldCard>
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
