import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { OutlineButton } from "@/components/brand";
import { T, type TalentCard } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { BadgeSheetHost } from "@/features/talents/badges";
import { AccessGate, ListBox, Muted, SafetyBar, TalentRow, useTalentAccess, useTalentErr } from "@/features/talents/ui";

// /talents/list?u=<username>&kind=followers|following
export default function FollowList() {
  const tt = useTT();
  const err = useTalentErr();
  const a = useTalentAccess();
  const { u, kind: k } = useLocalSearchParams<{ u: string; kind: string }>();
  const kind = k === "following" ? "following" : "followers";
  const [list, setList] = useState<TalentCard[] | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
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
        <PageHero back arcade={false} eyebrow={`@${u ?? ""}`} title={kind === "followers" ? tt("followers") : tt("following")} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 16 }}>
            {msg ? <Muted>{msg}</Muted> : list && !list.length ? <Muted>{tt("empty")}</Muted> : list ? (
              <ListBox>{list.map((c, i) => <TalentRow key={c.username} c={c} first={i === 0} />)}</ListBox>
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
