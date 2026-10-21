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

// /community/me – create or edit your own profile
const ROLES = ["learner", "reciter", "teacher"] as const;

export default function MyProfile() {
  const t = useTheme();
  const c = useCT();
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [exists, setExists] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("learner");
  const [style, setStyle] = useState("");
  const [ijaza, setIjaza] = useState(false);
  const [isPublic, setPublic] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) { setReady(true); return; }
    api<{ profile: Profile | null }>("/api/community/me").then((d) => {
      const p = d.profile;
      if (p) { setExists(true); setUsername(p.username); setName(p.name); setBio(p.bio); setRole(p.role); setStyle(p.style); setIjaza(p.ijaza); setPublic(p.public); }
      else setName(user.name ?? "");
    }).catch((e) => setErr(errText(e, c))).finally(() => setReady(true));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setBusy(true); setErr(""); setOk(false);
    try {
      await api("/api/community/me", { method: "PUT", body: { username: username.trim().toLowerCase(), name, bio, role, style, ijaza, public: isPublic } });
      setExists(true); setOk(true);
    } catch (e) { setErr(errText(e, c)); } finally { setBusy(false); }
  };

  if (!ready) return <Loading />;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back arcade={false} title={exists ? c("edit") : c("create")} lead={c("lead")} />
        {!user ? (
          <View style={{ padding: 20, gap: 14 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{c("signIn")}</Text>
            <GoldButton title={c("signInBtn")} onPress={() => router.push("/sign-in" as Href)} />
          </View>
        ) : (
          <View style={{ padding: 16, gap: 16 }}>
            <View style={{ alignItems: "center" }}><Avatar name={name || username || "?"} size={84} /></View>
            <LabeledField label={c("username")} hint={c("usernameHint")} value={username} onChangeText={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
              autoCapitalize="none" autoCorrect={false} maxLength={20} style={{ textAlign: "left", writingDirection: "ltr" }} />
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
            <LabeledField label={c("style")} hint={c("styleHint")} value={style} onChangeText={setStyle} maxLength={40} />
            <CheckRow checked={ijaza} onChange={setIjaza} label={c("hasIjaza")}><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{c("hasIjaza")}</Text></CheckRow>
            <CheckRow checked={isPublic} onChange={setPublic} label={c("isPublic")}><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{c("isPublic")}</Text></CheckRow>
            <FormError text={err} />
            {ok ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{c("saved")}</Text> : null}
            <GoldButton title={c("save")} onPress={save} busy={busy} disabled={busy || username.length < 3 || !name.trim()} />
            {exists ? <Pressable onPress={() => router.push(`/community/u/${username}` as Href)} accessibilityRole="link" style={{ minHeight: 44, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent }}>{c("myProfile")}</Text></Pressable> : null}
          </View>
        )}
      </Page>
    </>
  );
}
