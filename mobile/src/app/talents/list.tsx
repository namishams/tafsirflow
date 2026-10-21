import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { OutlineButton } from "@/components/brand";
import { T, type TalentCard } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { BadgeSheetHost } from "@/features/talents/badges";
import { AccessGate, ListBox, Muted, SafetyBar, SmallButton, TalentRow, useTalentAccess, useTalentErr } from "@/features/talents/ui";
import { usePT } from "@/features/talents/profileText";

// /talents/list?u=<username>&kind=followers|following – with Follow / Follow back / Following on every row
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
  const follow = async (c: TalentCard) => {
    setBusy(c.username);
    try { const d = await T.follow(c.username, !c.followed); setList((l) => l?.map((x) => (x.username === c.username ? { ...x, followed: d.followed || !!d.requested } : x)) ?? null); }
    catch (e) { setMsg(err(e)); } finally { setBusy(null); }
  };
  const right = (c: TalentCard) => {
    if (c.mine) return undefined;
    const label = c.followed ? tt("followingBtn") : c.followsMe ? pt("followBack") : tt("follow");
    return <SmallButton title={label} tone={c.followed ? "plain" : "gold"} disabled={busy === c.username} onPress={() => void follow(c)} label={`${label}, ${c.name}`} />;
  };
  const load = useCallback(async (cursor?: string) => {
    if (!u) return;
    try { const d = await T.follows(u, kind, cursor); setList((o) => (cursor ? [...(o ?? []), ...d.list] : d.list)); setNext(d.next); }
    catch (e) { setMsg(err(e)); }
  }, [u, kind]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (a.state === "ok") void load(); }, [a.state, load]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
      <Page>
        <PageHero back topInset arcade={false} eyebrow={`@${u ?? ""}`} title={kind === "followers" ? tt("followers") : tt("following")} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 16 }}>
            {msg ? <Muted>{msg}</Muted> : list && !list.length ? <Muted>{tt("empty")}</Muted> : list ? (
              <ListBox>{list.map((c, i) => <TalentRow key={c.username} c={c} first={i === 0} right={right(c)} />)}</ListBox>
            ) : null}
            {next ? <OutlineButton title={tt("loadMore")} onPress={() => void load(next)} /> : null}
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
      </BadgeSheetHost>
    </>
  );
}
