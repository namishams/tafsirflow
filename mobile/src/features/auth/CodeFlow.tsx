import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { FONT, R, useTheme } from "@/lib/theme";
import { Chip, Divider, GoldButton, GoldCard, OutlineButton, TextLink } from "@/components/brand";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page";
import { CheckRow, FormError, LabeledField, SelectRow } from "@/components/form";
import { useLang, useT } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { useAuth } from "@/lib/auth";
import { SITE } from "@/lib/api";
import { countryList, countryName } from "@/lib/countries";
import { codeApi, passkeySignIn, passkeysAvailable } from "./api";
import { CodeInput } from "./CodeInput";
import { useAuthT } from "./text";

// Sign in or create the account with a 6-digit code by e-mail (app, 21.10.2026; the same flow as the website):
// e-mail -> code (6 boxes, paste, auto-submit, new code after 30 s) -> signed in. A new address gets the short welcome
// form (name, country, year of birth, terms; nothing preselected) and the account is created confirmed. "Sign in with a
// passkey" opens the website's passkey page in the system sign-in sheet. `secondary` is the password way.
type Step = "email" | "code" | "welcome";
const GOALS = [["hifz", "goalHifz"], ["fahm", "goalFahm"], ["tilawa", "goalTilawa"], ["all", "goalAll"]] as const;

export function CodeFlow({ fresh = false, onDone, secondary }: { fresh?: boolean; onDone: () => void; secondary: { title: string; onPress: () => void } }) {
  const theme = useTheme();
  const t = useT();
  const tx = useAuthT();
  const wa = useWebT("account");
  const { lang } = useLang();
  const { adopt } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [ticket, setTicket] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [help, setHelp] = useState(false);
  const [left, setLeft] = useState(0);
  const [f, setF] = useState({ firstName: "", lastName: "", country: "", city: "", birthYear: "" });
  const [goal, setGoal] = useState("");
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const list = useMemo(() => countryList(lang).filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())), [lang, query]);
  const set = (k: keyof typeof f) => (v: string) => setF((o) => ({ ...o, [k]: v }));
  const open = (doc: string) => WebBrowser.openBrowserAsync(`${SITE}/${lang}/legal/${doc}`);
  const mail = email.trim().toLowerCase();

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const requestCode = async (again = false) => {
    setError(""); setInfo("");
    if (!/^\S+@\S+\.\S+$/.test(mail)) return setError(tx("errEmail"));
    setBusy(true);
    try {
      const r = await codeApi.request(mail, lang);
      if (r.ok) { setStep("code"); setCode(""); setLeft(r.data.resendIn ?? 30); if (again) setInfo(tx("resent")); return; }
      const e = r.data.error;
      if (e === "wait") { setStep("code"); setLeft(r.data.retryAfter ?? 30); setError(tx("errWait", { s: r.data.retryAfter ?? 30 })); return; }
      setError(e === "email" ? tx("errEmail") : e === "rate" ? tx("errRate") : tx("errGeneric"));
    } catch { setError(t("common.offline")); } finally { setBusy(false); }
  };

  const verify = async (v: string) => {
    setBusy(true); setError(""); setInfo("");
    try {
      const r = await codeApi.verify(mail, v);
      if (r.ok && r.data.user) { await adopt({ user: r.data.user, token: r.data.token }); onDone(); return; }
      if (r.ok && r.data.registrationRequired && r.data.ticket) { setTicket(r.data.ticket); setStep("welcome"); return; }
      setCode("");
      const e = r.data.error;
      setError(e === "code" ? tx("errCode", { n: r.data.left ?? 0 }) : e === "expired" ? tx("errExpired") : e === "rate" ? tx("errRate") : tx("errGeneric"));
    } catch { setError(t("common.offline")); } finally { setBusy(false); }
  };

  const create = async () => {
    setError("");
    if (!f.firstName.trim() || !f.lastName.trim()) return setError(t("auth.errors.name"));
    if (!f.country) return setError(t("auth.errors.country"));
    if (!/^\d{4}$/.test(f.birthYear)) return setError(t("auth.errors.age"));
    if (!terms) return setError(t("auth.errors.terms"));
    setBusy(true);
    try {
      const r = await codeApi.register({ ticket, ...f, city: f.city.trim() || undefined, goal: goal || undefined, birthYear: Number(f.birthYear), acceptTerms: true, marketing, locale: lang });
      if (r.ok && r.data.user) { await adopt({ user: r.data.user, token: r.data.token }); onDone(); return; }
      const e = r.data.error;
      if (e === "ticket") { setStep("email"); setTicket(""); setError(tx("errTicket")); return; }
      const known: Record<string, string> = { name: "auth.errors.name", terms: "auth.errors.terms", age: "auth.errors.age", country: "auth.errors.country", rate: "auth.errors.rate" };
      setError(e && known[e] ? t(known[e]) : tx("errGeneric"));
    } catch { setError(t("common.offline")); } finally { setBusy(false); }
  };

  const withPasskey = async () => {
    setBusy(true); setError(""); setInfo("");
    try {
      const r = await passkeySignIn(lang);
      if (r.ok) { await adopt(r.session); onDone(); return; }
      if (r.error !== "cancelled") setError(r.error === "offline" ? t("common.offline") : r.error === "rate" ? tx("errRate") : tx("errPasskey"));
    } finally { setBusy(false); }
  };

  if (step === "welcome" && picking) {
    return (
      <>
        <PageHero title={t("auth.chooseCountry")} arcade={false} />
        <View style={{ padding: 16, gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: R.pill, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, paddingHorizontal: 16 }}>
            <Icon name="search" color={theme.muted} size={18} />
            <TextInput value={query} onChangeText={setQuery} autoFocus autoCorrect={false} placeholder={t("auth.country")} placeholderTextColor={theme.muted} style={{ flex: 1, fontFamily: FONT.regular, fontSize: 16, color: theme.ink }} accessibilityLabel={t("auth.country")} />
          </View>
          <TextLink title={t("common.cancel")} onPress={() => { setPicking(false); setQuery(""); }} style={{ alignSelf: "flex-end", fontSize: 14, paddingVertical: 2 }} />
          <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, overflow: "hidden" }}>
            {list.map((c, i) => (
              <Pressable key={c.code} onPress={() => { set("country")(c.code); setPicking(false); setQuery(""); }} accessibilityRole="button" accessibilityState={{ selected: f.country === c.code }}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, borderTopWidth: i ? 1 : 0, borderTopColor: theme.line, backgroundColor: pressed ? theme.bg : theme.surface })}>
                <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15.5, color: theme.ink }}>{c.name}</Text>
                {f.country === c.code ? <Icon name="check" color={theme.accent} size={17} /> : null}
              </Pressable>
            ))}
          </View>
        </View>
      </>
    );
  }

  if (step === "welcome") {
    return (
      <>
        <PageHero back eyebrow="Quran Masterclass" title={tx("welcomeTitle")} lead={tx("welcomeLead", { email: mail })} />
        <View style={{ padding: 16 }}>
          <GoldCard>
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}><LabeledField label={t("auth.firstName")} value={f.firstName} onChangeText={set("firstName")} autoComplete="given-name" textContentType="givenName" /></View>
                <View style={{ flex: 1 }}><LabeledField label={t("auth.lastName")} value={f.lastName} onChangeText={set("lastName")} autoComplete="family-name" textContentType="familyName" /></View>
              </View>
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
              <GoldButton title={tx("create")} busy={busy} onPress={() => void create()} />
            </View>
          </GoldCard>
        </View>
      </>
    );
  }

  if (step === "code") {
    return (
      <>
        <PageHero back eyebrow="Quran Masterclass" title={tx("codeTitle")} lead={tx("codeLead", { email: mail })} />
        <View style={{ padding: 16 }}>
          <GoldCard>
            <View style={{ gap: 16 }}>
              <CodeInput value={code} onChange={(v) => { setCode(v); if (error) setError(""); }} onComplete={(v) => void verify(v)} disabled={busy} invalid={!!error} />
              <FormError text={error} />
              {info && !error ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 14, color: theme.accent }}>{info}</Text> : null}
              <GoldButton title={tx("confirm")} busy={busy} disabled={code.length !== 6} onPress={() => void verify(code)} />
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                {left > 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: theme.muted, paddingVertical: 8 }}>{tx("resendIn", { s: left })}</Text>
                  : <TextLink title={tx("resend")} onPress={() => void requestCode(true)} style={{ fontSize: 14 }} />}
                <TextLink title={tx("otherEmail")} onPress={() => { setStep("email"); setCode(""); setError(""); setInfo(""); }} style={{ fontSize: 14, color: theme.muted }} />
              </View>
              <View style={{ borderTopWidth: 1, borderTopColor: theme.line, paddingTop: 8 }}>
                <TextLink title={tx("noCode")} onPress={() => setHelp((h) => !h)} style={{ fontSize: 14, color: theme.muted }} />
                {help ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: theme.muted }}>{tx("noCodeHelp")}</Text> : null}
              </View>
            </View>
          </GoldCard>
        </View>
      </>
    );
  }

  return (
    <>
      <PageHero back eyebrow="Quran Masterclass" title={fresh ? tx("newTitle") : tx("signInTitle")} lead={tx("lead")} />
      <View style={{ padding: 16 }}>
        <GoldCard>
          <View style={{ gap: 16 }}>
            <LabeledField label={tx("email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="username" returnKeyType="send" onSubmitEditing={() => void requestCode()} />
            <FormError text={error} />
            <GoldButton title={tx("continue")} busy={busy} disabled={!email.includes("@")} onPress={() => void requestCode()} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: theme.muted }}>{tx("privacyNote")}</Text>
          </View>
        </GoldCard>
        {passkeysAvailable ? (
          <View style={{ marginTop: 18, gap: 8 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: theme.muted, textAlign: "center" }} accessibilityElementsHidden>{tx("or")}</Text>
            <OutlineButton title={tx("passkey")} icon="lock" disabled={busy} onPress={() => void withPasskey()} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: theme.muted, textAlign: "center" }}>{tx("passkeyHint")}</Text>
          </View>
        ) : null}
        <Divider style={{ marginVertical: 22 }} />
        <View style={{ alignItems: "center" }}>
          <TextLink title={secondary.title} onPress={secondary.onPress} />
        </View>
      </View>
    </>
  );
}
