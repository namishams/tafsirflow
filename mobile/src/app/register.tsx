import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Stack, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { FONT, R, useTheme } from "@/lib/theme";
import { Chip, Divider, GoldButton, GoldCard, SmallStar, TextLink } from "@/components/brand";
import { Icon } from "@/components/icons";
import { PageHero, goBack } from "@/components/page";
import { CheckRow, FormError, LabeledField, SelectRow } from "@/components/form";
import { useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { ApiError, SITE } from "@/lib/api";
import { countryList, countryName } from "@/lib/countries";
import { useWebT } from "@/i18n/web";
import { CodeFlow } from "@/features/auth/CodeFlow";
import { useAuthT } from "@/features/auth/text";

// learning goals of the website's registration form (src/lib/countries.ts GOALS), texts account.goal<Name>
const GOALS = [["hifz", "goalHifz"], ["fahm", "goalFahm"], ["tilawa", "goalTilawa"], ["all", "goalAll"]] as const;

// Create the account (the same account as on the website). First view (21.10.2026): the e-mail code flow
// (features/auth/CodeFlow) – the code confirms the address, then the same details as below; this password form stays
// one tap away ("Create an account with a password"). Nothing is preselected: country and consent are chosen
// by the learner; the year of birth lets the Shams Method adapt to children and seniors. City and goal are optional,
// as on the website.
export default function Register() {
  const t = useT();
  const theme = useTheme();
  const { lang } = useLang();
  const { register } = useAuth();
  const wa = useWebT("account");
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", password: "", birthYear: "", country: "", city: "" });
  const [goal, setGoal] = useState("");
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [byCode, setByCode] = useState(true);
  const tx = useAuthT();
  const set = (k: keyof typeof f) => (v: string) => setF((o) => ({ ...o, [k]: v }));
  const list = useMemo(() => countryList(lang).filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())), [lang, query]);
  const open = (doc: string) => WebBrowser.openBrowserAsync(`${SITE}/${lang}/legal/${doc}`);

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
      await register({ ...f, email: f.email.trim(), city: f.city.trim() || undefined, goal: goal || undefined, birthYear: Number(f.birthYear), acceptTerms: true, marketing, locale: lang });
      goBack();
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "";
      const known: Record<string, string> = { exists: "auth.errors.exists", weak: "auth.errors.weak", terms: "auth.errors.terms", age: "auth.errors.age", country: "auth.errors.country", rate: "auth.errors.rate" };
      setError(t(known[code] ?? "common.error"));
    } finally { setBusy(false); }
  };

  if (byCode) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
          <CodeFlow fresh onDone={goBack} secondary={{ title: tx("passwordRegister"), onPress: () => { setByCode(false); setError(""); } }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (picking) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <Stack.Screen options={{ headerShown: false }} />
        <PageHero topInset title={t("auth.chooseCountry")} arcade={false} />
        <View style={{ padding: 16, gap: 10, flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: R.pill, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, paddingHorizontal: 16 }}>
            <Icon name="search" color={theme.muted} size={18} />
            <TextInput value={query} onChangeText={setQuery} autoFocus autoCorrect={false} placeholder={t("auth.country")} placeholderTextColor={theme.muted} style={{ flex: 1, fontFamily: FONT.regular, fontSize: 16, color: theme.ink }} accessibilityLabel={t("auth.country")} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ borderRadius: R.lg, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}>
            {list.map((c, i) => (
              <Pressable key={c.code} onPress={() => { set("country")(c.code); setPicking(false); setQuery(""); }} accessibilityRole="button" accessibilityState={{ selected: f.country === c.code }}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, borderTopWidth: i ? 1 : 0, borderTopColor: theme.line, backgroundColor: pressed ? theme.bg : theme.surface })}>
                <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15.5, color: theme.ink }}>{c.name}</Text>
                {f.country === c.code ? <Icon name="check" color={theme.accent} size={17} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
        <PageHero back eyebrow="Quran Masterclass" title={t("auth.registerTitle")} lead={t("account.notSignedIn")} />
        <View style={{ padding: 16 }}>
          <GoldCard>
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}><LabeledField label={t("auth.firstName")} value={f.firstName} onChangeText={set("firstName")} autoComplete="given-name" textContentType="givenName" /></View>
                <View style={{ flex: 1 }}><LabeledField label={t("auth.lastName")} value={f.lastName} onChangeText={set("lastName")} autoComplete="family-name" textContentType="familyName" /></View>
              </View>
              <LabeledField label={t("auth.email")} value={f.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" />
              <LabeledField label={t("auth.password")} secure value={f.password} onChangeText={set("password")} autoComplete="new-password" textContentType="newPassword" hint={t("auth.passwordHint")} />
              <SelectRow label={t("auth.country")} value={f.country ? countryName(f.country, lang) : undefined} placeholder={t("auth.chooseCountry")} onPress={() => setPicking(true)} />
              <LabeledField label={`${wa("city")} (${wa("optional")})`} value={f.city} onChangeText={set("city")} autoComplete="postal-address-locality" textContentType="addressCity" maxLength={80} />
              <LabeledField label={t("auth.birthYear")} value={f.birthYear} onChangeText={(v) => set("birthYear")(v.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" maxLength={4} />
              <View style={{ gap: 8 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: theme.ink }}>{wa("goal")} <Text style={{ fontFamily: FONT.regular, color: theme.muted }}>({wa("optional")})</Text></Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {GOALS.map(([id, key]) => <Chip key={id} label={wa(key)} selected={goal === id} onPress={() => setGoal(goal === id ? "" : id)} />)}
                </View>
              </View>
              <CheckRow checked={terms} onChange={setTerms} label={t("auth.terms")}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: theme.ink }}>{t("auth.terms")}</Text>
                <View style={{ flexDirection: "row", gap: 16, marginTop: 2 }}>
                  <TextLink title={t("account.terms")} onPress={() => void open("terms")} style={{ fontSize: 13.5, paddingVertical: 2 }} />
                  <TextLink title={t("account.privacy")} onPress={() => void open("privacy")} style={{ fontSize: 13.5, paddingVertical: 2 }} />
                </View>
              </CheckRow>
              <CheckRow checked={marketing} onChange={setMarketing} label={t("auth.marketing")}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: theme.muted }}>{t("auth.marketing")}</Text>
              </CheckRow>
              <FormError text={error} />
              <GoldButton title={t("auth.registerTitle")} busy={busy} onPress={() => void submit()} />
              <TextLink title={tx("withCode")} onPress={() => { setByCode(true); setError(""); }} style={{ alignSelf: "center", fontSize: 14 }} />
            </View>
          </GoldCard>
          <Divider style={{ marginVertical: 22 }} />
          <View style={{ alignItems: "center", gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><SmallStar size={10} color={theme.gold} /><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: theme.muted }}>{t("auth.haveAccount")}</Text></View>
            <TextLink title={t("account.signIn")} onPress={() => router.replace("/sign-in")} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
