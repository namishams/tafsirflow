import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Field, Notice, PrimaryButton, Row, Screen, Section, ToggleRow } from "@/components/ui";
import { useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { ApiError, SITE } from "@/lib/api";
import { COUNTRIES, countryList } from "@/lib/countries";
import { type, useTheme } from "@/lib/theme";

// Nothing is preselected: country and consent are chosen by the learner.
export default function Register() {
  const t = useT();
  const theme = useTheme();
  const { lang } = useLang();
  const { register } = useAuth();
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", password: "", birthYear: "", country: "" });
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (v: string) => setF((o) => ({ ...o, [k]: v }));
  const list = useMemo(() => countryList(lang).filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())), [lang, query]);

  const submit = async () => {
    setError("");
    if (!f.firstName.trim() || !f.lastName.trim()) return setError(t("auth.errors.name"));
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError(t("auth.errors.email"));
    if (f.password.length < 10) return setError(t("auth.errors.weak"));
    if (!f.country) return setError(t("auth.errors.country"));
    if (!/^\d{4}$/.test(f.birthYear)) return setError(t("auth.errors.age"));
    if (!terms) return setError(t("auth.errors.terms"));
    setBusy(true);
    try {
      await register({ ...f, email: f.email.trim(), birthYear: Number(f.birthYear), acceptTerms: true, marketing, locale: lang });
      router.back();
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "";
      const known: Record<string, string> = { exists: "auth.errors.exists", weak: "auth.errors.weak", terms: "auth.errors.terms", age: "auth.errors.age", country: "auth.errors.country", rate: "auth.errors.rate" };
      setError(t(known[code] ?? "common.error"));
    } finally { setBusy(false); }
  };

  if (picking) {
    return (
      <Screen>
        <Section>
          <Field label={t("auth.chooseCountry")} value={query} onChangeText={setQuery} autoFocus autoCorrect={false} />
        </Section>
        <Section>
          {list.map((c) => <Row key={c.code} title={c.name} accessory={f.country === c.code ? "check" : "none"} onPress={() => { set("country")(c.code); setPicking(false); setQuery(""); }} />)}
        </Section>
      </Screen>
    );
  }

  return (
    <Screen>
      <Section>
        <Field label={t("auth.firstName")} value={f.firstName} onChangeText={set("firstName")} autoComplete="given-name" textContentType="givenName" />
        <Field label={t("auth.lastName")} value={f.lastName} onChangeText={set("lastName")} autoComplete="family-name" textContentType="familyName" />
      </Section>
      <Section>
        <Field label={t("auth.email")} value={f.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" />
        <Field label={t("auth.password")} value={f.password} onChangeText={set("password")} secureTextEntry autoComplete="new-password" textContentType="newPassword" />
      </Section>
      <Section>
        <Row title={t("auth.country")} value={f.country ? COUNTRIES[f.country]?.[lang === "de" ? 1 : 0] : t("auth.chooseCountry")} accessory="chevron" onPress={() => setPicking(true)} />
        <Field label={t("auth.birthYear")} value={f.birthYear} onChangeText={(v) => set("birthYear")(v.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" />
      </Section>
      <Section>
        <ToggleRow title={t("auth.terms")} value={terms} onChange={setTerms} />
        <ToggleRow title={t("auth.marketing")} value={marketing} onChange={setMarketing} />
      </Section>
      <View style={{ flexDirection: "row", gap: 20, marginHorizontal: 32, marginTop: 8 }}>
        <Text style={[type.footnote, { color: theme.tint }]} onPress={() => WebBrowser.openBrowserAsync(`${SITE}/${lang}/legal/terms`)}>{t("account.terms")}</Text>
        <Text style={[type.footnote, { color: theme.tint }]} onPress={() => WebBrowser.openBrowserAsync(`${SITE}/${lang}/legal/privacy`)}>{t("account.privacy")}</Text>
      </View>
      {error ? <Notice text={error} tone="error" /> : null}
      <View style={{ marginHorizontal: 16, marginTop: 24 }}>
        <PrimaryButton title={t("auth.registerTitle")} busy={busy} onPress={() => void submit()} />
      </View>
    </Screen>
  );
}
