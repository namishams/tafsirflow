import { useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { Field, Notice, Row, Screen, Section, PrimaryButton } from "@/components/ui";
import { useLang, useT, type LangSetting } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { SITE, ApiError } from "@/lib/api";
import { useSettings } from "@/lib/settings";
import { type, useTheme, type AppearanceSetting } from "@/lib/theme";

export default function AccountScreen() {
  const t = useT();
  const theme = useTheme();
  const { lang, setting, setSetting } = useLang();
  const { appearance, setAppearance } = useSettings();
  const { user, logout, deleteAccount } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const open = (path: string) => WebBrowser.openBrowserAsync(`${SITE}/${lang}${path}`);
  const appearances: [AppearanceSetting, string][] = [["system", t("account.system")], ["light", t("account.light")], ["dark", t("account.dark")]];
  const languages: [LangSetting, string][] = [["system", t("account.languageSystem")], ["de", t("account.german")], ["en", t("account.english")]];

  const confirmDelete = async () => {
    setBusy(true); setError("");
    try {
      await deleteAccount(password);
      setDeleting(false); setPassword("");
    } catch (e) {
      setError(e instanceof ApiError && e.code === "current" ? t("account.wrongPassword") : t("common.error"));
    } finally { setBusy(false); }
  };

  return (
    <Screen>
      {user ? (
        <Section footer={user.emailVerified ? undefined : t("auth.verifyHint")}>
          <Row title={user.name ?? user.email} subtitle={t("account.signedInAs", { email: user.email })} icon={{ ios: "person.crop.circle", android: "account_circle" }} />
        </Section>
      ) : (
        <Section footer={t("account.notSignedIn")}>
          <Row title={t("account.signIn")} icon={{ ios: "person.crop.circle", android: "account_circle" }} accessory="chevron" onPress={() => router.push("/sign-in")} />
          <Row title={t("account.createAccount")} icon={{ ios: "person.badge.plus", android: "person_add" }} accessory="chevron" onPress={() => router.push("/register")} />
        </Section>
      )}

      <Section header={t("account.appearance")}>
        {appearances.map(([v, label]) => <Row key={v} title={label} accessory={appearance === v ? "check" : "none"} onPress={() => setAppearance(v)} />)}
      </Section>

      <Section header={t("account.language")}>
        {languages.map(([v, label]) => <Row key={v} title={label} accessory={setting === v ? "check" : "none"} onPress={() => setSetting(v)} />)}
      </Section>

      <Section header={t("account.legal")}>
        <Row title={t("account.terms")} accessory="chevron" onPress={() => open("/legal/terms")} />
        <Row title={t("account.privacy")} accessory="chevron" onPress={() => open("/legal/privacy")} />
        <Row title={t("account.imprint")} accessory="chevron" onPress={() => open("/legal/imprint")} />
        <Row title={t("account.support")} accessory="chevron" onPress={() => open("/feedback")} />
      </Section>

      {user ? (
        <Section>
          <Row title={t("account.signOut")} onPress={() => void logout()} />
          {user.role !== "admin" ? <Row title={t("account.deleteAccount")} destructive onPress={() => { setDeleting(true); setError(""); }} /> : null}
        </Section>
      ) : null}

      {user && deleting ? (
        <>
          <Section header={t("account.deleteTitle")} footer={t("account.deleteBody")}>
            <Field label={t("account.currentPassword")} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" />
          </Section>
          {error ? <Notice text={error} tone="error" /> : null}
          <View style={{ marginHorizontal: 16, marginTop: 16, gap: 12 }}>
            <PrimaryButton title={t("account.deleteConfirm")} busy={busy} disabled={!password} onPress={() =>
              Platform.OS === "web" ? void confirmDelete() :
              Alert.alert(t("account.deleteTitle"), t("account.deleteBody"), [{ text: t("common.cancel"), style: "cancel" }, { text: t("account.deleteConfirm"), style: "destructive", onPress: () => void confirmDelete() }])} />
          </View>
        </>
      ) : null}

      <Text style={[type.footnote, { color: theme.tertiary, textAlign: "center", marginTop: 24 }]}>{t("account.version", { v: Constants.expoConfig?.version ?? "1.0.0" })}</Text>
    </Screen>
  );
}
