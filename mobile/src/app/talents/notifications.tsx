import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, useFocusEffect, type Href } from "expo-router";
import { FONT, goldButton, useTheme } from "@/lib/theme";
import { Page, PageHero, Loading } from "@/components/page";
import { useLang } from "@/i18n";
import { T, type Notification } from "@/features/talents/api";
import { useTT, type TKey } from "@/features/talents/text";
import { BadgeButton, BadgeSheetHost } from "@/features/talents/badges";
import { AccessGate, ListBox, Muted, SafetyBar, TalentAvatar, useTalentAccess, useTalentErr } from "@/features/talents/ui";
import { useMomentText } from "@/features/sijill/Moments";
import { useST, type SKey } from "@/features/sijill/text";

// /talents/notifications – new followers, follow requests, likes, comments, clip approved/rejected, connections,
// badges. Opening the screen marks everything as read.
export default function Notifications() {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const { lang } = useLang();
  const a = useTalentAccess();
  const [list, setList] = useState<Notification[] | null>(null);
  const [msg, setMsg] = useState("");
  useFocusEffect(useCallback(() => {
    if (a.state !== "ok") return;
    T.notifications(lang).then((d) => { setList(d.notifications); if (d.unread) void T.readNotifications().catch(() => undefined); }).catch((e) => { setMsg(err(e)); setList([]); });
  }, [a.state])); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useST();
  const momentText = useMomentText();
  const open = (n: Notification) => {
    if (n.kind === "moment_reaction") { router.push("/talents/sijill" as Href); return; }
    if (n.kind === "follow_request") router.push("/talents/requests" as Href);
    else if (n.kind === "connect_request" || n.kind === "connect_accepted") router.push("/talents/requests" as Href);
    else if (n.kind === "verified" || n.kind === "verification_rejected") router.push("/talents/badges" as Href);
    else if (n.postId && (n.kind === "like" || n.kind === "comment" || n.kind === "post_approved")) router.push(`/talents/player?src=post&start=${n.postId}` as Href);
    else if (n.actor) router.push(`/talents/u/${n.actor.username}` as Href);
  };
  const when = (iso: string) => new Date(iso).toLocaleDateString(lang, { day: "numeric", month: "short" });
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
        <Page>
          <PageHero back arcade={false} eyebrow={tt("network")} title={tt("notifications")} />
          <AccessGate a={a}>
            <View style={{ padding: 16, gap: 16 }}>
              {!list ? <Loading /> : !list.length ? <Muted>{msg || tt("noNotifications")}</Muted> : (
                <ListBox>
                  {list.map((n, i) => {
                    const text = n.kind === "moment_reaction" && n.moment
                      ? n.reaction === "like" || !n.reaction
                        ? st("n_moment_like", { u: n.actor?.name ?? "", m: momentText(n.moment) })
                        : st("n_moment_reaction", { u: n.actor?.name ?? "", r: st(`react_${n.reaction}` as SKey), m: momentText(n.moment) })
                      : tt(`n_${n.kind}` as TKey, { u: n.actor?.name ?? "", v: n.verseKey ?? "" });
                    return (
                      <Pressable key={n.id} onPress={() => open(n)} accessibilityRole="button" accessibilityLabel={`${text}, ${when(n.at)}`}
                        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: pressed ? t.bg : n.read ? t.surface : "rgba(201,166,94,0.08)", borderTopWidth: i ? 1 : 0, borderTopColor: t.line })}>
                        {n.actor ? <TalentAvatar name={n.actor.name} size={40} badge={n.actor.badge} /> : <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgb(8,58,44)", borderWidth: 2, borderColor: goldButton.line }} />}
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <Text style={{ flexShrink: 1, fontFamily: n.read ? FONT.regular : FONT.semibold, fontSize: 14.5, lineHeight: 20, color: t.ink }}>{text}</Text>
                            {n.actor ? <BadgeButton badge={n.actor.badge} size={13} /> : null}
                          </View>
                          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{when(n.at)}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ListBox>
              )}
              <SafetyBar />
            </View>
          </AccessGate>
        </Page>
      </BadgeSheetHost>
    </>
  );
}
