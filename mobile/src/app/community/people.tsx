import { SharerBadge, SharerRing, TopSharers } from "@/features/share/SharerUI";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Stack, router, useFocusEffect, type Href } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Page, PageHero, ErrorState } from "@/components/page";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useCT } from "@/features/community/text";
import { Avatar, FollowButton, RoleBadge, errText, type Profile } from "@/features/community/ui";

// /community/people – search and list of reciters and teachers
const FILTERS = ["", "reciter", "teacher", "learner"] as const;

export default function People() {
  const t = useTheme();
  const c = useCT();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<(typeof FILTERS)[number]>("");
  const [list, setList] = useState<Profile[] | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const seq = useRef(0);

  const load = useCallback(async () => {
    if (!user) return;
    const n = ++seq.current;
    try {
      const d = await api<{ profiles: Profile[] }>(`/api/community/profiles?q=${encodeURIComponent(q.trim())}${role ? `&role=${role}` : ""}`);
      if (n === seq.current) { setList(d.profiles); setErr(""); }
    } catch (e) { if (n === seq.current) setErr(errText(e, c)); }
  }, [q, role, user, c]);
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggle = async (p: Profile) => {
    setBusy(p.username);
    try {
      const d = await api<{ followed: boolean; followers: number }>(`/api/community/follow/${p.username}`, { method: p.followed ? "DELETE" : "POST" });
      setList((l) => l?.map((x) => (x.username === p.username ? { ...x, followed: d.followed, followers: d.followers } : x)) ?? l);
    } catch (e) { setErr(errText(e, c)); } finally { setBusy(""); }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset arcade={false} eyebrow="Quran Masterclass" title={c("title")} lead={c("lead")}>
          {user ? <OutlineButton onStage compact icon="user" title={c("myProfile")} onPress={() => router.push("/community/me" as Href)} /> : null}
        </PageHero>
        {!user ? (
          <View style={{ padding: 20, gap: 14 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{c("signIn")}</Text>
            <GoldButton title={c("signInBtn")} onPress={() => router.push("/sign-in" as Href)} />
          </View>
        ) : (
          <View style={{ padding: 16, gap: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14 }}>
              <Icon name="search" color={t.muted} size={18} />
              <TextInput value={q} onChangeText={setQ} placeholder={c("search")} placeholderTextColor={t.muted} accessibilityLabel={c("search")} autoCapitalize="none" autoCorrect={false} returnKeyType="search"
                style={{ flex: 1, fontFamily: FONT.regular, fontSize: 16, color: t.ink, paddingVertical: 0, textAlign: "auto" }} />
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {FILTERS.map((f) => {
                const on = role === f;
                const label = f === "" ? c("all") : c(f === "reciter" ? "reciters" : f === "teacher" ? "teachers" : "learner");
                return (
                  <Pressable key={f || "all"} onPress={() => setRole(f)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={label}
                    style={{ minHeight: 40, paddingHorizontal: 14, justifyContent: "center", borderRadius: 999, borderWidth: 1, borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accentSoft : t.surface }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: on ? t.accent : t.ink }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TopSharers />
            {err && !list ? <ErrorState text={err} retry={load} /> : null}
            {err && list ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.danger }}>{err}</Text> : null}
            {list && list.length === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "center", paddingVertical: 24 }}>{c("empty")}</Text> : null}
            <View style={{ borderRadius: R.card, borderWidth: list?.length ? 1 : 0, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
              {list?.map((p, i) => (
                <View key={p.username} style={[{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 }, i > 0 && { borderTopWidth: 1, borderTopColor: t.line }]}>
                  <Pressable onPress={() => router.push(`/community/u/${p.username}` as Href)} accessibilityRole="button" accessibilityLabel={`${p.name}, @${p.username}${p.role !== "learner" ? `, ${c(p.role)}` : ""}`}
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56 }}>
                    <SharerRing tier={p.sharerTier ?? 0} size={52}><Avatar name={p.name} /></SharerRing>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink }}>{p.name}</Text>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "left", writingDirection: "ltr" }}>@{p.username}</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}><RoleBadge role={p.role} /><SharerBadge tier={p.sharerTier ?? 0} compact /></View>
                    </View>
                  </Pressable>
                  <FollowButton followed={!!p.followed} busy={busy === p.username} name={p.name} onPress={() => toggle(p)} />
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </>
  );
}
