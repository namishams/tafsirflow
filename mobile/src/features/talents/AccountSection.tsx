import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { FONT, useTheme } from "@/lib/theme";
import { LinkRow, RowGroup } from "@/components/page";
import { useAuth } from "@/lib/auth";
import { T } from "./api";
import { useTT } from "./text";

// Account tab: my talent profile, discover, notifications, messages, requests, badges, privacy settings, redeem an
// invitation, guidelines and – for admins only – moderation. Nothing here without a signed-in account.
export function TalentsAccount() {
  const t = useTheme();
  const tt = useTT();
  const { user } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    if (!user) { setUsername(null); return; }
    T.me().then((d) => setUsername(d.profile?.username ?? null)).catch(() => setUsername(null));
  }, [user]);
  if (!user) return null;
  const go = (href: string) => router.push(href as Href);
  return (
    <View style={{ gap: 10, marginBottom: 16 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: t.muted }}>{tt("sectionTitle")}</Text>
      <RowGroup>
        <LinkRow first icon="user" title={username ? tt("myTalentProfile") : tt("createProfile")} subtitle={username ? `@${username}` : undefined}
          onPress={() => go(username ? `/talents/u/${username}` : "/community/me")} />
        <LinkRow icon="search" title={tt("discoverTitle")} onPress={() => go("/talents")} />
        <LinkRow icon="heart" title={tt("notifications")} onPress={() => go("/talents/notifications")} />
        <LinkRow icon="comment" title={tt("messages")} onPress={() => go("/talents/messages")} />
        <LinkRow icon="list" title={tt("requestsTitle")} onPress={() => go("/talents/requests")} />
        <LinkRow icon="checkCircle" title={tt("badgeMine")} onPress={() => go("/talents/badges")} />
        <LinkRow icon="settings" title={tt("settings")} onPress={() => go("/talents/settings")} />
        <LinkRow icon="starBig" title={tt("inviteTitle")} onPress={() => go("/talents/invite")} />
        <LinkRow icon="shield" title={tt("guidelines")} onPress={() => go("/talents/guidelines")} />
        {user.role === "admin" ? <LinkRow icon="flag" title={tt("adminLink")} onPress={() => go("/talents/admin")} /> : null}
      </RowGroup>
    </View>
  );
}
