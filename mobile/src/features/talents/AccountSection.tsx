import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router, useFocusEffect, type Href } from "expo-router";
import { FONT, goldButton, useTheme } from "@/lib/theme";
import { LinkRow, RowGroup } from "@/components/page";
import { useAuth } from "@/lib/auth";
import { T } from "./api";
import { syncPendingProfile } from "./pendingProfile";
import { useTT } from "./text";
import { usePro } from "@/lib/pro";
import { syncSijill } from "@/features/sijill/summary";
import { useST } from "@/features/sijill/text";
import { useMyRanking } from "@/features/rankings/api";
import { useRT } from "@/features/rankings/text";
import { useTT as useTeacherT } from "@/features/teacher/text";
import { NO_UNREAD, loadUnread, type Unread } from "./unread";

// Account tab: my talent profile, discover, notifications, messages, requests, badges, privacy settings, redeem an
// invitation, guidelines and – for admins only – moderation. Nothing here without a signed-in account.
// 22.10.2026: notifications, messages and requests moved to the top of the settings (TalentsInbox, with counts), and
// the live link with a teacher (/teacher, built on Talents connections) is listed here.
export function TalentsAccount() {
  const t = useTheme();
  const tt = useTT();
  const { user } = useAuth();
  const st = useST();
  const { pro } = usePro();
  const rt = useRT();
  const lt = useTeacherT();
  const mine = useMyRanking();
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    if (!user) { setUsername(null); return; }
    // Sijill: keep the record (and the achievement moments of followers) current; throttled inside syncSijill
    syncPendingProfile().then(() => T.me()).then((d) => { setUsername(d.profile?.username ?? null); if (d.profile) void syncSijill(pro); }).catch(() => setUsername(null));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!user) return null;
  const go = (href: string) => router.push(href as Href);
  return (
    <View style={{ gap: 10, marginBottom: 16 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: t.muted }}>{tt("sectionTitle")}</Text>
      <RowGroup>
        <LinkRow first icon="user" title={username ? tt("myTalentProfile") : tt("createProfile")} subtitle={username ? `@${username}` : undefined}
          onPress={() => go(username ? `/talents/u/${username}` : "/community/me")} />
        {username ? <LinkRow icon="trophy" title={st("title")} subtitle={st("privacyBtn")} onPress={() => go("/talents/sijill")} /> : null}
        {username ? <LinkRow icon="trophy" title={rt("title")} subtitle={mine?.week?.rank ? rt("rankWorld", { n: mine.week.rank }) : rt("eyebrow")} onPress={() => go("/ranking")} /> : null}
        {username ? <LinkRow icon="starBig" title={st("friends")} onPress={() => go("/talents/friends")} /> : null}
        {username ? <LinkRow icon="cap" title={lt("openLive")} subtitle={lt("openLiveSub")} onPress={() => go("/teacher")} /> : null}
        <LinkRow icon="search" title={tt("discoverTitle")} onPress={() => go("/talents")} />
        <LinkRow icon="checkCircle" title={tt("badgeMine")} onPress={() => go("/talents/badges")} />
        <LinkRow icon="settings" title={tt("settings")} onPress={() => go("/talents/settings")} />
        <LinkRow icon="starBig" title={tt("inviteTitle")} onPress={() => go("/talents/invite")} />
        <LinkRow icon="shield" title={tt("guidelines")} onPress={() => go("/talents/guidelines")} />
        {user.role === "admin" ? <LinkRow icon="flag" title={tt("adminLink")} onPress={() => go("/talents/admin")} /> : null}
      </RowGroup>
    </View>
  );
}

/** the top of the settings (opened from the profile's menu button): Notifications, Messages and Requests with their
 * unread counts, reloaded whenever the settings come into view. Signed out: nothing. */
export function TalentsInbox() {
  const tt = useTT();
  const { user } = useAuth();
  const [u, setU] = useState<Unread>(NO_UNREAD);
  const [interact, setInteract] = useState<boolean | null>(null);
  useFocusEffect(useCallback(() => {
    if (!user) { setU(NO_UNREAD); return; }
    let live = true;
    T.me()
      .then((d) => { if (live) setInteract(!!d.talent?.canInteract); return loadUnread({ interact: !!d.talent?.canInteract, privateAccount: !!d.profile?.private }); })
      .then((x) => { if (live) setU(x); })
      .catch(() => undefined);
    return () => { live = false; };
  }, [user]));
  if (!user) return null;
  const go = (href: string) => router.push(href as Href);
  const requests = u.connections + u.follows;
  return (
    <RowGroup>
      <LinkRow first icon="heart" title={tt("notifications")} subtitle={u.notes ? tt("unread", { n: u.notes }) : undefined} right={<Count n={u.notes} />} onPress={() => go("/talents/notifications")} />
      <LinkRow icon="comment" title={tt("messages")} subtitle={u.messages ? tt("unread", { n: u.messages }) : interact === false ? tt("age16") : undefined} right={<Count n={u.messages} />} onPress={() => go("/talents/messages")} />
      <LinkRow icon="list" title={tt("requestsTitle")} subtitle={requests ? `${tt("incoming")}: ${requests}` : undefined} right={<Count n={requests} />} onPress={() => go("/talents/requests")} />
    </RowGroup>
  );
}

/** a gold count pill (nothing at 0) */
function Count({ n }: { n: number }) {
  if (!n) return null;
  return (
    <View style={{ minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: goldButton.to, alignItems: "center", justifyContent: "center" }}>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 12, color: goldButton.text }}>{n > 99 ? "99+" : n}</Text>
    </View>
  );
}
