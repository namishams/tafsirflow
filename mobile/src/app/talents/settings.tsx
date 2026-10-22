import { useEffect, useState } from "react";
import { SafetyContact } from "@/components/SafetyContact";
import { Switch, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { FONT, useTheme } from "@/lib/theme";
import { Page, PageHero, LinkRow, Loading, RowGroup } from "@/components/page";
import { Segmented } from "@/components/brand";
import { api } from "@/lib/api";
import { T } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { AccessGate, Muted, SafetyBar, useTalentAccess, useTalentErr } from "@/features/talents/ui";

// /talents/settings – privacy (private account, who may message), blocked members, badges, guidelines and the way
// to delete the account (Account tab; deleting the account removes all community data and files).
type Me = { username: string; name: string; bio: string; role: string; style: string; ijaza: boolean; public: boolean; private: boolean; messagePolicy: "connections" | "nobody"; country: string | null };
export default function TalentSettings() {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const a = useTalentAccess();
  const [me, setMe] = useState<Me | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { if (a.state === "ok") T.me().then((d) => setMe((d.profile as unknown as Me) ?? null)).catch((e) => setMsg(err(e))); }, [a.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = async (patch: Partial<Me>) => {
    if (!me) return;
    const next = { ...me, ...patch };
    setMe(next); setMsg("");
    try {
      await api("/api/community/me", { method: "PUT", body: { username: next.username, name: next.name, bio: next.bio, role: next.role, style: next.style, ijaza: next.ijaza, public: next.public, country: next.country, private: next.private, messagePolicy: next.messagePolicy } });
    } catch (e) { setMsg(err(e)); setMe(me); }
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset arcade={false} eyebrow={tt("network")} title={tt("settings")} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 18 }}>
            {!me ? (msg ? <Muted>{msg}</Muted> : a.me && !a.me.profile ? <Muted>{tt("needProfile")}</Muted> : <Loading />) : (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{tt("privateAccount")}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{tt("privateAccountHint")}</Text>
                  </View>
                  <Switch value={me.private} onValueChange={(v) => void save({ private: v })} trackColor={{ true: t.accent }} accessibilityLabel={tt("privateAccount")} />
                </View>
                <View style={{ gap: 8 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{tt("whoMessages")}</Text>
                  <Segmented<"connections" | "nobody"> value={me.messagePolicy} onChange={(v) => void save({ messagePolicy: v })} options={[["connections", tt("msgConnections")], ["nobody", tt("msgNobody")]]} />
                </View>
                {msg ? <Muted>{msg}</Muted> : null}
              </>
            )}
            <RowGroup>
              <LinkRow first icon="user" title={tt("editProfile")} onPress={() => router.push("/community/me" as Href)} />
              <LinkRow icon="checkCircle" title={tt("badgeMine")} onPress={() => router.push("/talents/badges" as Href)} />
              <LinkRow icon="list" title={tt("followRequests")} onPress={() => router.push("/talents/requests" as Href)} />
              <LinkRow icon="shield" title={tt("blockedTitle")} onPress={() => router.push("/talents/blocked" as Href)} />
              <LinkRow icon="flag" title={tt("guidelines")} onPress={() => router.push("/talents/guidelines" as Href)} />
            </RowGroup>
            <SafetyContact />
            <RowGroup>
              <LinkRow first icon="logout" title={tt("deleteAccount")} subtitle={tt("deleteAccountHint")} onPress={() => router.push("/account/settings" as Href)} />
            </RowGroup>
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
    </>
  );
}
