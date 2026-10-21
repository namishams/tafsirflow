import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { FONT, useTheme } from "@/lib/theme";
import { Page, PageHero } from "@/components/page";
import { SectionTitle } from "@/components/brand";
import { T, type ConnItem, type TalentCard } from "@/features/talents/api";
import { BadgeSheetHost } from "@/features/talents/badges";
import { useTT } from "@/features/talents/text";
import { AccessGate, ListBox, Muted, SafetyBar, SmallButton, TalentRow, useTalentAccess, useTalentErr } from "@/features/talents/ui";
import { usePT } from "@/features/talents/profileText";

// /talents/requests – follow requests to a private account (Confirm / Delete, opened from the own profile's
// "Follow requests" row), received and sent connection requests, accepted connections
export default function Requests() {
  const t = useTheme();
  const tt = useTT();
  const pt = usePT();
  const err = useTalentErr();
  const a = useTalentAccess();
  const [d, setD] = useState<{ incoming: ConnItem[]; outgoing: ConnItem[]; connected: ConnItem[] } | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [follows, setFollows] = useState<TalentCard[]>([]);
  const load = useCallback(async () => {
    try {
      setFollows((await T.followRequests()).requests);
      if (a.age?.interact) setD(await T.connections());
    } catch (e) { setMsg(err(e)); }
  }, [a.age?.interact]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (a.state === "ok") void load(); }, [a.state, load]);
  const act = async (fn: () => Promise<unknown>) => { setBusy(true); setMsg(""); try { await fn(); await load(); } catch (e) { setMsg(err(e)); } finally { setBusy(false); } };
  const section = (title: string, items: (ConnItem | (TalentCard & { note?: string }))[], empty: string, right: (c: TalentCard) => React.ReactNode) => (
    <View>
      <SectionTitle title={title} />
      {items.length ? (
        <ListBox>{items.map((c, i) => (
          <View key={c.username}>
            <TalentRow c={c} first={i === 0} right={right(c)} />
            {c.note ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: t.surface }}>{c.note}</Text> : null}
          </View>
        ))}</ListBox>
      ) : <Muted>{empty}</Muted>}
    </View>
  );
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
      <Page>
        <PageHero back topInset arcade={false} eyebrow={tt("network")} title={tt("requestsTitle")} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 22 }}>
            {/* follow requests (Instagram / TikTok): Confirm and Delete side by side */}
            {follows.length ? section(`${tt("followRequests")} (${follows.length})`, follows, "", (c) => (
              <View style={{ flexDirection: "row", gap: 6 }}>
                <SmallButton title={pt("confirm")} tone="gold" disabled={busy} label={`${pt("confirm")}, ${c.name}`} onPress={() => void act(() => T.answerFollow(c.username, "accept"))} />
                <SmallButton title={pt("delete")} disabled={busy} label={`${pt("delete")}, ${c.name}`} onPress={() => void act(() => T.answerFollow(c.username, "decline"))} />
              </View>
            )) : null}
            {!a.age?.interact ? <Muted>{tt("age16")}</Muted> : d ? (
              <>
                {section(tt("incoming"), d.incoming, tt("noRequests"), (c) => (
                  <View style={{ gap: 6 }}>
                    <SmallButton title={tt("accept")} tone="gold" disabled={busy} label={`${tt("accept")}, ${c.name}`} onPress={() => void act(() => T.answer(c.username, "accept"))} />
                    <SmallButton title={tt("decline")} disabled={busy} label={`${tt("decline")}, ${c.name}`} onPress={() => void act(() => T.answer(c.username, "decline"))} />
                  </View>
                ))}
                {section(tt("outgoing"), d.outgoing, tt("noRequests"), (c) => (
                  <SmallButton title={tt("withdraw")} disabled={busy} label={`${tt("withdraw")}, ${c.name}`} onPress={() => void act(() => T.disconnect(c.username))} />
                ))}
                {section(tt("connectionsTitle"), d.connected, tt("noConnections"), () => null)}
              </>
            ) : null}
            {msg ? <Muted>{msg}</Muted> : null}
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
      </BadgeSheetHost>
    </>
  );
}
