import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Field, Notice, PrimaryButton, Row, Screen, Section } from "@/components/ui";
import { useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { ApiError, SITE } from "@/lib/api";

export default function SignIn() {
  const t = useT();
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
      router.back();
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "";
      setError(code === "invalid" ? t("auth.errors.invalid") : code === "rate" ? t("auth.errors.rate") : t("common.error"));
    } finally { setBusy(false); }
  };

  return (
    <Screen>
      <Section>
        <Field label={t("auth.email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" />
        <Field label={t("auth.password")} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" onSubmitEditing={() => void submit()} />
      </Section>
      {error ? <Notice text={error} tone="error" /> : null}
      <View style={{ marginHorizontal: 16, marginTop: 24 }}>
        <PrimaryButton title={t("auth.signInTitle")} busy={busy} disabled={!email.includes("@") || !password} onPress={() => void submit()} />
      </View>
      <Section>
        <Row title={t("auth.forgot")} accessory="chevron" onPress={() => WebBrowser.openBrowserAsync(`${SITE}/${lang}/account?forgot=1`)} />
        <Row title={`${t("auth.noAccount")} ${t("account.createAccount")}`} accessory="chevron" onPress={() => router.replace("/register")} />
      </Section>
    </Screen>
  );
}
