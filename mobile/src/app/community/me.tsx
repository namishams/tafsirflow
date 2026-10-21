import { SharerBadge, SharerRing } from "@/features/share/SharerUI";
import { syncSharer, useMySharer } from "@/features/share/sharer";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton } from "@/components/brand";
import { CheckRow, FormError, LabeledField } from "@/components/form";
import { useCT } from "@/features/community/text";
import { Avatar, errText, type Profile } from "@/features/community/ui";
import { useTT } from "@/features/talents/text";
import { T as Talents } from "@/features/talents/api";
import { useGardenRing } from "@/features/garden/garden";
import { usePro } from "@/lib/pro";
import { useStored } from "@/lib/store";
import { EMPTY_TESTS, TESTS_KEY, type TestStore } from "@/features/srs/gate";
import { TalentAvatar, AgeStep, SmallButton } from "@/features/talents/ui";
import { CountryPicker } from "@/features/talents/CountryPicker";
import { pickAvatar } from "@/features/talents/avatar";
import { readPending } from "@/features/talents/pendingProfile";
import { UsernameStatus, useUsernameCheck, usernameBlocked } from "@/features/talents/UsernameCheck";
import { countryName } from "@/lib/countries";
import { useLang } from "@/i18n";
import { Icon } from "@/components/icons";

// /community/me – create or edit your own profile (also the Quran Talents fields: rewaya, maqam, ijazah chain and
// whether the garden tree and juz certificates show on the profile), profile picture, country, and for new
// profiles the birth year confirmation and the acceptance of terms and community guidelines)
const ROLES = ["learner", "reciter", "teacher"] as const;

export default function MyProfile() {
  const t = useTheme();
  const c = useCT();
  const { user } = useAuth();
  const sharer = useMySharer();
  const [ready, setReady] = useState(false);
  const [exists, setExists] = useState(false);
  const [username, setUsername] = useState("");
  const [savedName, setSavedName] = useState<string | null>(null);
  const nameCheck = useUsernameCheck(username, savedName);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("learner");
  const [style, setStyle] = useState("");
  const [ijaza, setIjaza] = useState(false);
  const [isPublic, setPublic] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const tt = useTT();
  const { pro } = usePro();
  const ring = useGardenRing(pro);
  const tests = useStored<TestStore>(TESTS_KEY, EMPTY_TESTS);
  const [rewaya, setRewaya] = useState("");
  const [maqam, setMaqam] = useState("");
  const [chain, setChain] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  const { lang } = useLang();
  const [country, setCountry] = useState<string | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [guidelines, setGuidelines] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [ageKnown, setAgeKnown] = useState(true);
  const [picMsg, setPicMsg] = useState("");

  useEffect(() => {
    if (!user) { setReady(true); return; }
    Talents.age().then((s) => setAgeKnown(s.known)).catch(() => undefined);
    api<{ profile: Profile | null; talent?: { guidelines?: boolean } }>("/api/community/me").then((d) => {
      const p = d.profile;
      if (d.talent?.guidelines) { setAccepted(true); setGuidelines(true); }
      if (p) {
        setExists(true); setUsername(p.username); setSavedName(p.username); setName(p.name); setBio(p.bio); setRole(p.role); setStyle(p.style); setIjaza(p.ijaza); setPublic(p.public);
        const x = p as Profile & { rewaya?: string; maqam?: string; ijazahChain?: string; progress?: unknown; avatar?: string | null };
        setRewaya(x.rewaya ?? ""); setMaqam(x.maqam ?? ""); setChain(x.ijazahChain ?? ""); setShowProgress(!!x.progress);
        setCountry(p.country); setAvatar(x.avatar ?? null);
      }
      else {
        // a profile set up in the onboarding that is not created yet (e.g. age not confirmed): prefill it
        const pend = readPending();
        setName(pend?.name || user.name || ""); if (pend?.username) setUsername(pend.username);
      }
    }).catch((e) => setErr(errText(e, c))).finally(() => setReady(true));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setBusy(true); setErr(""); setOk(false);
    try {
      await api("/api/community/me", { method: "PUT", body: { username: username.trim().toLowerCase(), name, bio, role, style, ijaza, public: isPublic, rewaya, maqam, ijazahChain: chain, country, ...(guidelines ? { guidelines: true } : {}) } });
      if (guidelines) setAccepted(true);
      // Quran Talents: garden and certificates only when the member chose to show them (status only)
      await Talents.progress({ show: showProgress, treeStage: ring.planted ? ring.stage : 0, treeType: ring.planted ? ring.type : "", certJuz: tests.certs.map((c) => c.juz) }).catch(() => undefined);
      setExists(true); setOk(true); setSavedName(username.trim().toLowerCase());
      void syncSharer();
    } catch (e) { setErr(errText(e, c)); } finally { setBusy(false); }
  };

  if (!ready) return <Loading />;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset arcade={false} title={exists ? c("edit") : c("create")} lead={c("lead")} />
        {!user ? (
          <View style={{ padding: 20, gap: 14 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{c("signIn")}</Text>
            <GoldButton title={c("signInBtn")} onPress={() => router.push("/sign-in" as Href)} />
          </View>
        ) : !exists && !ageKnown ? (
          // Quran Talents: a new profile needs the confirmed birth year first (community from 13)
          <View style={{ padding: 16 }}><AgeStep onDone={(s) => setAgeKnown(s.known)} /></View>
        ) : (
          <View style={{ padding: 16, gap: 16 }}>
            <View style={{ alignItems: "center", gap: 8 }}>
              <SharerRing tier={sharer.tier} size={84}>{avatar ? <TalentAvatar name={name || username || "?"} size={84} uri={avatar} /> : <Avatar name={name || username || "?"} size={84} />}</SharerRing>
              <View style={{ alignSelf: "center" }}><SharerBadge tier={sharer.tier} /></View>
              {exists ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                  {(["library", "camera"] as const).map((src) => (
                    <SmallButton key={src} title={src === "library" ? tt("photoPick") : tt("photoTake")} onPress={() => { setPicMsg(""); void pickAvatar(src).then((u) => { if (u) setAvatar(u); }).catch((e) => setPicMsg(e instanceof Error && e.message === "permission" ? tt("photoDenied") : errText(e, c))); }} />
                  ))}
                  {avatar ? <SmallButton title={tt("photoRemove")} tone="danger" onPress={() => void Talents.deleteAvatar().then(() => setAvatar(null)).catch((e) => setPicMsg(errText(e, c)))} /> : null}
                </View>
              ) : <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "center" }}>{tt("photoAfterCreate")}</Text>}
              {picMsg ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.danger }}>{picMsg}</Text> : null}
            </View>
            <LabeledField label={c("username")} hint={c("usernameHint")} value={username} onChangeText={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
              autoCapitalize="none" autoCorrect={false} maxLength={20} style={{ textAlign: "left", writingDirection: "ltr" }} />
            <UsernameStatus state={nameCheck} />
            <LabeledField label={c("name")} value={name} onChangeText={setName} maxLength={40} />
            <LabeledField label={c("bio")} hint={`${c("bioHint")} ${bio.length}/160`} value={bio} onChangeText={setBio} maxLength={160} multiline />
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{c("role")}</Text>
              <View accessibilityRole="radiogroup" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {ROLES.map((r) => {
                  const on = role === r;
                  return (
                    <Pressable key={r} onPress={() => setRole(r)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={c(r)}
                      style={{ minHeight: 44, paddingHorizontal: 18, justifyContent: "center", borderRadius: R.md, borderWidth: 1.5, borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accentSoft : t.surface }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: on ? t.accent : t.ink }}>{c(r)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{tt("filterCountry")}</Text>
              <Pressable onPress={() => setCountryOpen(true)} accessibilityRole="button" accessibilityLabel={`${tt("filterCountry")}: ${country ? countryName(country, lang) : tt("chooseCountry")}`}
                style={{ height: 52, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" }}>
                <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 16, color: country ? t.ink : t.muted }}>{country ? countryName(country, lang) : tt("chooseCountry")}</Text>
                <Icon name="chevronDown" color={t.muted} size={16} />
              </Pressable>
            </View>
            <LabeledField label={c("style")} hint={c("styleHint")} value={style} onChangeText={setStyle} maxLength={40} />
            <CheckRow checked={ijaza} onChange={setIjaza} label={c("hasIjaza")}><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{c("hasIjaza")}</Text></CheckRow>
            <LabeledField label={tt("rewaya")} hint={tt("rewayaHint")} value={rewaya} onChangeText={setRewaya} maxLength={60} />
            <LabeledField label={tt("maqam")} hint={tt("maqamHint")} value={maqam} onChangeText={setMaqam} maxLength={40} />
            <LabeledField label={tt("ijazahChain")} hint={`${tt("ijazahChainHint")} ${chain.length}/500`} value={chain} onChangeText={setChain} maxLength={500} multiline style={{ minHeight: 44 }} />
            <CheckRow checked={showProgress} onChange={setShowProgress} label={tt("showProgress")}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{tt("showProgress")}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, marginTop: 2 }}>{tt("showProgressHint")}</Text>
            </CheckRow>
            <CheckRow checked={isPublic} onChange={setPublic} label={c("isPublic")}><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{c("isPublic")}</Text></CheckRow>
            {!accepted ? (
              <CheckRow checked={guidelines} onChange={setGuidelines} label={tt("acceptGuidelines")}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 21, color: t.ink }}>{tt("acceptGuidelines")}</Text>
                <View style={{ flexDirection: "row", gap: 14, marginTop: 4 }}>
                  <Text onPress={() => router.push("/talents/guidelines" as Href)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{tt("guidelines")}</Text>
                  <Text onPress={() => router.push("/legal/terms" as Href)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{tt("terms")}</Text>
                </View>
              </CheckRow>
            ) : null}
            <FormError text={err} />
            {ok ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{c("saved")}</Text> : null}
            <GoldButton title={c("save")} onPress={save} busy={busy} disabled={busy || usernameBlocked(nameCheck) || username.length < 3 || !name.trim() || (!exists && !guidelines)} />
            {exists ? <Pressable onPress={() => router.push(`/community/u/${username}` as Href)} accessibilityRole="link" style={{ minHeight: 44, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent }}>{c("myProfile")}</Text></Pressable> : null}
            {exists ? <Pressable onPress={() => router.push(`/talents/u/${username}` as Href)} accessibilityRole="link" style={{ minHeight: 44, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent }}>{tt("myTalentProfile")}</Text></Pressable> : null}
            <Pressable onPress={() => router.push("/talents/guidelines" as Href)} accessibilityRole="link" style={{ minHeight: 44, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{tt("guidelines")}</Text></Pressable>
          </View>
        )}
      </Page>
      <CountryPicker visible={countryOpen} onClose={() => setCountryOpen(false)} onPick={(code) => { setCountry(code); setCountryOpen(false); }} />
    </>
  );
}
