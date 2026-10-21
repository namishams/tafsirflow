import { useCallback, useEffect, useState } from "react";
import { Alert, Platform, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { Loading, Page, PageHero } from "@/components/page";
import { OutlineButton } from "@/components/brand";
import { T, type TalentCard } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { BadgeSheetHost } from "@/features/talents/badges";
import { AccessGate, ListBox, Muted, SafetyBar, SmallButton, TalentRow, useTalentAccess, useTalentErr } from "@/features/talents/ui";
import { usePT } from "@/features/talents/profileText";
export { TalentsRouteError as ErrorBoundary } from "@/features/talents/ui";

// header options once (see talents/u/[username].tsx)
const SCREEN = { headerShown: false } as const;

// /talents/list?u=<username>&kind=followers|following – with Follow / Follow back / Following on every row; the own
// followers list also has Remove
export default function FollowList() {
  const tt = useTT();
  const err = useTalentErr();
  const a = useTalentAccess();
  const { u, kind: k } = useLocalSearchParams<{ u: string; kind: string }>();
  const kind = k === "following" ? "following" : "followers";
  const [list, setList] = useState<TalentCard[] | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const pt = usePT();
  const [busy, setBusy] = useState<string | null>(null);
  // optimistic with a light haptic tap; a failed call puts the row back. Followed and requested stay apart: a pending
  // request to a private account reads "Requested" (tapping it withdraws the request), never "Following".
  const follow = async (c: TalentCard) => {
    const mark = (followed: boolean, requested: boolean) => setList((l) => l?.map((x) => (x.username === c.username ? { ...x, followed, requested } : x)) ?? null);
    const on = !c.followed && !c.requested;
    setBusy(c.username); setMsg("");
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    mark(on && !c.private, on && !!c.private);
    try { const d = await T.follow(c.username, on); mark(d.followed, !!d.requested && !d.followed); }
    catch (e) { mark(!!c.followed, !!c.requested); setMsg(err(e)); } finally { setBusy(null); }
  };
  // own followers list (Instagram / TikTok): Follow back or Following, and Remove (the member is not notified)
  const own = !!u && a.me?.profile?.username === u && kind === "followers";
  const remove = (c: TalentCard) => {
    const go = async () => {
      setBusy(c.username);
      try { await T.removeFollower(c.username); setList((l) => l?.filter((x) => x.username !== c.username) ?? null); }
      catch (e) { setMsg(err(e)); } finally { setBusy(null); }
    };
    if (Platform.OS === "web") { void go(); return; }
    Alert.alert(pt("removeTitle"), pt("removeBody", { u: c.username }), [{ text: tt("cancel"), style: "cancel" }, { text: pt("remove"), style: "destructive", onPress: () => void go() }]);
  };
  const right = (c: TalentCard) => {
    if (c.mine) return undefined;
    const label = c.followed ? tt("followingBtn") : c.requested ? tt("requested") : c.followsMe ? pt("followBack") : tt("follow");
    const main = <SmallButton title={label} tone={c.followed || c.requested ? "plain" : "gold"} disabled={busy === c.username} onPress={() => void follow(c)} label={`${label}, ${c.name}`} />;
    if (!own) return main;
    return (
      <View style={{ flexDirection: "row", gap: 6 }}>
        {main}
        <SmallButton title={pt("remove")} disabled={busy === c.username} onPress={() => remove(c)} label={`${pt("remove")}, ${c.name}`} />
      </View>
    );
  };
  const load = useCallback(async (cursor?: string) => {
    if (!u) return;
    try { const d = await T.follows(u, kind, cursor); setList((o) => (cursor ? [...(o ?? []), ...d.list] : d.list)); setNext(d.next); }
    catch (e) { setMsg(err(e)); }
  }, [u, kind]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (a.state === "ok") void load(); }, [a.state, load]);
  return (
    <>
      <Stack.Screen options={SCREEN} />
      <BadgeSheetHost>
      <Page>
        <PageHero back topInset arcade={false} eyebrow={`@${u ?? ""}`} title={kind === "followers" ? tt("followers") : tt("following")} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 16 }}>
            {/* a message (load failed, or one follow failed) sits above the list instead of replacing it */}
            {msg ? <Muted>{msg}</Muted> : null}
            {msg && !list ? null : list && !list.length ? (
              // empty (no followers yet / follows nobody yet): the way to find people
              <View style={{ alignItems: "center", gap: 6 }}>
                <Muted>{tt("empty")}</Muted>
                <SmallButton title={pt("discoverPeople")} tone="gold" onPress={() => router.push("/talents" as Href)} />
              </View>
            ) : list ? (
              <ListBox>{list.map((c, i) => <TalentRow key={c.username} c={c} first={i === 0} right={right(c)} />)}</ListBox>
            ) : <View style={{ minHeight: 160 }}><Loading /></View>}
            {next ? <OutlineButton title={tt("loadMore")} onPress={() => void load(next)} /> : null}
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
      </BadgeSheetHost>
    </>
  );
}
