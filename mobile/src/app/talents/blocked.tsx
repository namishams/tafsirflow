import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { T, type TalentCard } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { BadgeSheetHost } from "@/features/talents/badges";
import { AccessGate, ListBox, Muted, SafetyBar, SmallButton, TalentRow, useTalentAccess, useTalentErr } from "@/features/talents/ui";

// /talents/blocked – the members I blocked, with "unblock"
export default function Blocked() {
  const tt = useTT();
  const err = useTalentErr();
  const a = useTalentAccess();
  const [list, setList] = useState<TalentCard[] | null>(null);
  const [msg, setMsg] = useState("");
  const load = useCallback(() => { T.blocks().then((d) => setList(d.blocked)).catch((e) => { setMsg(err(e)); setList([]); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (a.state === "ok") load(); }, [a.state, load]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
        <Page>
          <PageHero back arcade={false} eyebrow={tt("network")} title={tt("blockedTitle")} />
          <AccessGate a={a}>
            <View style={{ padding: 16, gap: 16 }}>
              {!list ? <Loading /> : !list.length ? <Muted>{msg || tt("noBlocked")}</Muted> : (
                <ListBox>{list.map((c, i) => (
                  <TalentRow key={c.username} c={c} first={i === 0} right={<SmallButton title={tt("unblock")} label={`${tt("unblock")}, ${c.name}`} onPress={() => void T.block(c.username, false).then(load).catch((e) => setMsg(err(e)))} />} />
                ))}</ListBox>
              )}
              {msg && list?.length ? <Muted>{msg}</Muted> : null}
              <SafetyBar />
            </View>
          </AccessGate>
        </Page>
      </BadgeSheetHost>
    </>
  );
}
