import { useState } from "react";
import { AccessibilityInfo, Alert, Platform, Switch, Text, TextInput, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import Constants from "expo-constants";
import { FONT, R, useTheme } from "@/lib/theme";
import { Chip, GoldButton, OutlineButton, Segmented, TextLink } from "@/components/brand";
import { readDaily, setDaily, type DailyReminder } from "@/lib/daily";
import { LinkRow, Page, PageHero, ProBadge, RowGroup } from "@/components/page";
import { Icon } from "@/components/icons";
import { intlLocale, langLabel, useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { removeKey, storedKeys } from "@/lib/store";
import { useWebT } from "@/i18n/web";
import { request } from "@/features/extra/http";
import { TraditionSetting } from "@/features/hadith/cards";
import { useHadithText } from "@/features/hadith/texts";
import { useSettings } from "@/lib/settings";
import { openPro, usePro } from "@/lib/pro";
import { manageSubscriptions } from "@/lib/iap";
import { ProPromo } from "@/features/learn/ProPromo";
import type { AppearanceSetting } from "@/lib/theme";
import { FeedLinks, FeedStatsRow } from "@/features/feed/FeedStats";
import { GardenNotifySetting, GardenWidget } from "@/features/garden/widgets";
import { ShareCounter, SharePromptSetting } from "@/features/share/SharePrompt";
import { SharerBadge } from "@/features/share/SharerUI";
import { useMySharer } from "@/features/share/sharer";
import { useSchoolT } from "@/features/school/texts";
import { TalentsAccount, TalentsInbox } from "@/features/talents/AccountSection";
import { useTT } from "@/features/talents/text";
import { ConfirmCode } from "@/features/auth/ConfirmCode";
import { securityApi } from "@/features/auth/api";
import { useAuthT } from "@/features/auth/text";
import { TravelSetting } from "@/features/talents/TravelCard";

// /account/settings – everything the Account tab showed before it became the own profile (owner, 21.10.2026: the last tab
// is the Instagram/TikTok profile; the menu button opens this screen). Unchanged content: Pro, sign-in, confirm the
// e-mail, garden, reminders, shares, feed statistics, appearance, language, tradition, daily reminder, sharer, Quran
// Talents links, Today, profile, statistics, Madrasa and certificates, map, legal, sign out, delete the account.
export default function AccountSettingsScreen() {
  const t = useT();
  const tt = useTT();
  const theme = useTheme();
  const { lang, setting } = useLang();
  const { appearance, setAppearance } = useSettings();
  const hx = useHadithText();
  const { user, logout, deleteAccount, refresh } = useAuth();
  const tx = useAuthT();
  // accounts created with an e-mail code have no password: they confirm the deletion with a code (features/auth)
  const [noPassword, setNoPassword] = useState(false);
  const [codeOk, setCodeOk] = useState(false);
  const [byCode, setByCode] = useState(false);
  const [verifyByCode, setVerifyByCode] = useState(false);
  const startDelete = () => {
    setDeleting(true); setError(""); setCodeOk(false); setByCode(false);
    securityApi.load().then((r) => { if (r.ok) setNoPassword(!r.data.hasPassword); }).catch(() => undefined);
  };
  const codeWay = noPassword || byCode;
  const sharer = useMySharer();
  const { pro, until } = usePro();
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState(false); // after the deletion: a clear line where the form was (App Review 5.1.1(v))
  const wa = useWebT("account");
  const wn = useWebT("nav");
  const [resent, setResent] = useState<"" | "busy" | "sent" | "error">("");
  const resend = async () => {
    setResent("busy");
    try { const r = await request("/api/auth/resend", { locale: lang }); setResent(r.ok ? "sent" : "error"); } catch { setResent("error"); }
  };
  const [daily, setDailyState] = useState<DailyReminder>(readDaily());
  const updateDaily = async (next: DailyReminder) => { const ok = await setDaily(next, lang); setDailyState(ok ? next : { ...next, on: false }); };

  const go = (href: string) => router.push(href as Href);
  const sct = useSchoolT();
  const confirmDelete = async () => {
    setBusy(true); setError("");
    try {
      await deleteAccount(codeWay ? undefined : password); setDeleting(false); setPassword("");
      // the learning progress on this device belonged to the deleted account (as on the profile page)
      for (const k of storedKeys()) if (k.startsWith("tf:")) removeKey(k);
      setDeleted(true); AccessibilityInfo.announceForAccessibility(t("account.deleted"));
    }
    catch (e) {
      if (codeWay) setCodeOk(false); // the confirmation ran out (15 minutes): ask for a new code
      setError(e instanceof ApiError && e.code === "current" ? (codeWay ? tx("errExpired") : t("account.wrongPassword")) : t("common.error"));
    }
    finally { setBusy(false); }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={tt("settings")} title={user ? user.name ?? user.email : t("account.title")} lead={user ? t("account.signedInAs", { email: user.email }) : t("account.notSignedIn")}>
          {!user ? (
            <>
              <GoldButton title={t("account.createAccount")} onPress={() => go("/register")} />
              <OutlineButton title={t("account.signIn")} onStage onPress={() => go("/sign-in")} />
            </>
          ) : sharer.tier > 0 ? <SharerBadge tier={sharer.tier} onStage /> : null}
        </PageHero>

        <View style={{ padding: 16, gap: 22 }}>
          {/* notifications, messages and requests first, with their unread counts (the profile's menu shows a dot) */}
          <TalentsInbox />
          <FeedStatsRow />
          <GardenWidget />
          <GardenNotifySetting />
          <ShareCounter />
          <FeedLinks />
          {user && !user.emailVerified ? (
            <View style={{ backgroundColor: theme.accentSoft, padding: 12, borderRadius: R.sm, gap: 10 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: theme.ink }}>{t("auth.verifyHint")}</Text>
              {resent === "sent" ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: theme.accent }}>{wa("resent")}</Text> : (
                <>
                  {resent === "error" ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 13, color: theme.danger }}>{wa("errGeneric")}</Text> : null}
                  <OutlineButton compact title={wa("resend")} icon="repeat" disabled={resent === "busy"} onPress={() => void resend()} style={{ alignSelf: "flex-start" }} />
                </>
              )}
              {verifyByCode ? <ConfirmCode email={user.email} onConfirmed={() => { setVerifyByCode(false); void refresh(); }} />
                : <TextLink title={tx("verifyByCode")} onPress={() => setVerifyByCode(true)} style={{ fontSize: 14, paddingVertical: 2 }} />}
            </View>
          ) : null}

          {pro ? (
            <RowGroup>
              <LinkRow first title={t("pro.active")} subtitle={until ? t("pro.activeUntil", { date: new Date(until).toLocaleDateString(intlLocale(lang)) }) : t("pro.name")} icon="sun" right={<ProBadge />} />
              <LinkRow title={t("pro.manage")} onPress={manageSubscriptions} />
            </RowGroup>
          ) : (
            <>
              <ProPromo compact />
              <RowGroup><LinkRow first title={t("pro.restore")} onPress={() => openPro("general")} /></RowGroup>
            </>
          )}

          <Section title={t("account.appearance")}>
            <Segmented<AppearanceSetting> value={appearance} options={[["system", t("account.system")], ["light", t("account.light")], ["dark", t("account.dark")]]} onChange={setAppearance} />
          </Section>
          <Section title={t("account.language")}>
            <RowGroup>
              <LinkRow first title={setting === "system" ? `${t("account.languageSystem")} · ${langLabel(lang)}` : langLabel(setting)} icon="globe" onPress={() => go("/language")} />
            </RowGroup>
          </Section>
          <Section title={hx.tradTitle}>
            <TraditionSetting />
          </Section>

          <Section title={t("account.dailyTitle")}>
            <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, padding: 14, gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: theme.ink }}>{t("account.dailyQuestion")}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: theme.muted, marginTop: 2 }}>{t("account.dailyLead")}</Text>
                </View>
                <Switch value={daily.on} onValueChange={(on) => void updateDaily({ ...daily, on })} trackColor={{ true: theme.accent }} accessibilityLabel={t("account.dailyTitle")} />
              </View>
              {daily.on ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {[6, 8, 12, 18, 21].map((h) => <Chip key={h} label={`${String(h).padStart(2, "0")}:00`} selected={daily.hour === h} onPress={() => void updateDaily({ ...daily, hour: h, minute: 0 })} />)}
                </View>
              ) : null}
            </View>
          </Section>
          <View style={{ marginBottom: 16 }}><SharePromptSetting /></View>
          {/* travel mode (owner, 21.10.2026): prayer times for the destination, travel duas, the note on praying while travelling */}
          <TravelSetting />

          <TalentsAccount />

          <RowGroup>
            <LinkRow first title={t("tabs.home")} icon="sun" onPress={() => go("/today")} />
            <LinkRow title={t("account.profile")} icon="user" onPress={() => go("/profile")} />
            <LinkRow title={t("account.stats")} icon="list" onPress={() => go("/stats")} />
            <LinkRow title={sct("title")} subtitle={sct("certificates")} icon="cap" onPress={() => go("/school")} />
            <LinkRow title={t("account.map")} icon="map" onPress={() => go("/map")} />
          </RowGroup>

          <Section title={t("account.legal")}>
            <RowGroup>
              <LinkRow first title={t("account.terms")} onPress={() => go("/legal/terms")} />
              <LinkRow title={t("account.privacy")} onPress={() => go("/legal/privacy")} />
              <LinkRow title={t("account.imprint")} onPress={() => go("/legal/imprint")} />
              <LinkRow title={t("account.support")} onPress={() => go("/feedback")} />
              <LinkRow title={t("account.about")} onPress={() => go("/about")} />
              <LinkRow title={t("account.changelog")} onPress={() => go("/changelog")} />
            </RowGroup>
          </Section>

          {user ? (
            <RowGroup>
              <LinkRow first title={tx("security")} icon="shield" onPress={() => go("/account/security")} />
              <LinkRow title={t("account.signOut")} icon="logout" onPress={() => void logout()} />
              {user.role !== "admin" ? <LinkRow title={t("account.deleteAccount")} onPress={startDelete} /> : null}
            </RowGroup>
          ) : null}

          {user && deleting ? (
            <View style={{ gap: 12, borderRadius: R.lg, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, padding: 16 }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 18, color: theme.ink }}>{t("account.deleteTitle")}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: theme.muted }}>{t("account.deleteBody")}</Text>
              {codeWay ? (
                <>
                  {noPassword ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: theme.muted }}>{tx("deleteByCode")}</Text> : null}
                  {codeOk ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: theme.accent }}>{tx("confirmed")}</Text>
                    : <ConfirmCode email={user.email} onConfirmed={() => setCodeOk(true)} />}
                </>
              ) : (
                <>
                  <TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" placeholder={t("account.currentPassword")} placeholderTextColor={theme.muted} accessibilityLabel={t("account.currentPassword")}
                    style={{ height: 48, borderRadius: R.md, borderWidth: 1, borderColor: theme.line, paddingHorizontal: 14, fontFamily: FONT.regular, fontSize: 16, color: theme.ink, backgroundColor: theme.bg }} />
                  <TextLink title={tx("verifyByCode")} onPress={() => { setByCode(true); setError(""); }} style={{ fontSize: 14, paddingVertical: 2 }} />
                </>
              )}
              {error ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: theme.danger }} accessibilityLiveRegion="polite">{error}</Text> : null}
              <OutlineButton title={t("account.deleteConfirm")} disabled={(codeWay ? !codeOk : !password) || busy} onPress={() =>
                Platform.OS === "web" ? void confirmDelete() :
                Alert.alert(t("account.deleteTitle"), t("account.deleteBody"), [{ text: t("common.cancel"), style: "cancel" }, { text: t("account.deleteConfirm"), style: "destructive", onPress: () => void confirmDelete() }])} />
              <OutlineButton title={t("common.cancel")} onPress={() => setDeleting(false)} />
            </View>
          ) : null}
          {deleted && !user ? (
            <View accessibilityLiveRegion="polite" style={{ flexDirection: "row", alignItems: "center", gap: 10, borderRadius: R.lg, backgroundColor: theme.accentSoft, padding: 16 }}>
              <Icon name="checkCircle" color={theme.accent} size={20} />
              <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, lineHeight: 22, color: theme.ink }}>{t("account.deleted")}</Text>
            </View>
          ) : null}

          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: theme.muted, textAlign: "center" }}>{t("account.version", { v: Constants.expoConfig?.version ?? "1.0.0" })}</Text>
        </View>
      </Page>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ gap: 10 }}><Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: t.muted }}>{title}</Text>{children}</View>;
}
