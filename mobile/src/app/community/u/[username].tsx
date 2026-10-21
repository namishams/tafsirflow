import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Page, PageHero, Loading, ErrorState } from "@/components/page";
import { GoldButton, OutlineButton } from "@/components/brand";
import { useCT } from "@/features/community/text";
import { Avatar, FollowButton, RoleBadge, errText, type Profile } from "@/features/community/ui";

// /community/u/[username] – profile header like Instagram: avatar, counts, follow, block, report
export default function UserProfile() {
  const t = useTheme();
  const c = useCT();
  const { user } = useAuth();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [p, setP] = useState<Profile | null>(null);
  const [state, setState] = useState<"load" | "missing" | "error" | "ok">("load");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user || !username) { setState("ok"); return; }
    try { const d = await api<{ profile: Profile }>(`/api/community/u/${encodeURIComponent(username)}`); setP(d.profile); setState("ok"); }
    catch (e) { setState(e instanceof ApiError && e.status === 404 ? "missing" : "error"); }
  }, [user, username]);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<void>) => { setBusy(true); setMsg(""); try { await fn(); } catch (e) { setMsg(errText(e, c)); } finally { setBusy(false); } };
  const follow = () => p && run(async () => {
    const d = await api<{ followed: boolean; followers: number }>(`/api/community/follow/${p.username}`, { method: p.followed ? "DELETE" : "POST" });
    setP({ ...p, followed: d.followed, followers: d.followers });
  });
  const block = () => p && run(async () => {
    await api(`/api/community/block/${p.username}`, { method: p.blocked ? "DELETE" : "POST" });
    setP({ ...p, blocked: !p.blocked, followed: false });
  });
  const askBlock = () => {
    if (!p) return;
    if (p.blocked) { block(); return; }
    Alert.alert(c("block"), c("confirmBlock"), [{ text: c("cancel"), style: "cancel" }, { text: c("block"), style: "destructive", onPress: block }]);
  };
  const report = () => p && run(async () => { await api(`/api/community/report/${p.username}`, { method: "POST", body: {} }); setMsg(c("reported")); });

  if (state === "load" && user) return <Loading />;
  const stat = (n: number, label: string) => (
    <View accessible accessibilityLabel={`${n} ${label}`} style={{ alignItems: "center", minWidth: 80 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink }}>{n}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{label}</Text>
    </View>
  );
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back arcade={false} title={`@${username ?? ""}`} />
        {!user ? (
          <View style={{ padding: 20, gap: 14 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{c("signIn")}</Text>
            <GoldButton title={c("signInBtn")} onPress={() => router.push("/sign-in" as Href)} />
          </View>
        ) : state === "missing" ? (
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "center", padding: 32 }}>{c("notFound")}</Text>
        ) : state === "error" || !p ? (
          <ErrorState retry={load} />
        ) : (
          <View style={{ padding: 16, gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
              <Avatar name={p.name} size={84} />
              <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-around" }}>
                {stat(p.followers, c("followers"))}
                {stat(p.following, c("followingN"))}
              </View>
            </View>
            <View style={{ gap: 6 }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink }}>{p.name}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "left", writingDirection: "ltr" }}>@{p.username}</Text>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <RoleBadge role={p.role} />
                {p.ijaza ? <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: t.accentSoft }}><Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.accent }}>{c("ijazaLong")}</Text></View> : null}
              </View>
              {p.style ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{p.style}</Text> : null}
              {p.bio ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{p.bio}</Text> : null}
            </View>
            {p.mine ? (
              <OutlineButton title={c("edit")} onPress={() => router.push("/community/me" as Href)} />
            ) : p.blocked ? (
              <View style={{ gap: 10 }}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{c("youBlocked")}</Text>
                <OutlineButton title={c("unblock")} onPress={askBlock} disabled={busy} />
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row" }}><View style={{ flex: 1 }}><FollowButton followed={!!p.followed} busy={busy} name={p.name} onPress={follow} /></View></View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {[[c("block"), askBlock], [c("report"), report]].map(([label, fn]) => (
                    <Pressable key={label as string} onPress={fn as () => void} disabled={busy} accessibilityRole="button" accessibilityLabel={`${label as string}, ${p.name}`}
                      style={{ flex: 1, minHeight: 44, borderRadius: R.md, borderWidth: 1, borderColor: t.line, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.danger }}>{label as string}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
            {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.muted }}>{msg}</Text> : null}
          </View>
        )}
      </Page>
    </>
  );
}
