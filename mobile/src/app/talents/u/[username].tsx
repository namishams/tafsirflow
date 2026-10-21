import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";
import { Loading, Page, goBack } from "@/components/page";
import { Icon } from "@/components/icons";
import { useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { AccessGate, useTalentAccess } from "@/features/talents/ui";
import { ProfileScreenView, useProfileData } from "@/features/talents/ProfileScreen";

// /talents/u/[username] – a talent profile. Owner 21.10.2026: the same TikTok-style layout as the own profile in the
// Account tab (features/talents/ProfileScreen.tsx): centred avatar, @username with badge and level, the counters
// Following | Followers | MashaAllah, Follow / Follow back / Requested / Following, Message (or Connect) and the arrow
// with suggested accounts, bio, achievement highlights, icon tabs Achievements (3-column grid) · Sijill · Badges.
// Share, compare, remove connection, report and block sit in the top bar's more menu; the safety bar (guidelines,
// report, block) stays at the end of every profile. The own profile opened here shows Edit profile / Share profile.
// Earlier decisions (clips behind posting.enabled, story ring, highlights of clips, the posting path) live on in the
// shared view.
export default function TalentProfileScreen() {
  const t = useTheme();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const a = useTalentAccess();
  const { user } = useAuth();
  const { username, demo } = useLocalSearchParams<{ username: string; demo?: string }>();
  // development only: `?demo=other` shows the layout with sample counters (screenshot audits without server profiles)
  const d = useProfileData(username, { enabled: a.state === "ok", demo: __DEV__ ? demo : undefined });
  const { load } = d;
  useFocusEffect(useCallback(() => { if (a.state === "ok") void load(); }, [a.state, load]));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {a.state === "ok" ? (
        <ProfileScreenView d={d} variant="stack" title={`@${username ?? ""}`} canInteract={!!a.age?.interact} signedIn={!!user} />
      ) : (
        <View style={{ flex: 1, backgroundColor: t.dark ? t.bg : t.surface }}>
          <View style={{ paddingTop: insets.top + 3, paddingHorizontal: 6 }}>
            <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={tr("common.back")} hitSlop={6} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Icon name="chevronLeft" color={t.ink} size={26} weight={2.2} />
            </Pressable>
          </View>
          {a.state === "load" ? <Loading /> : <Page><AccessGate a={a}>{null}</AccessGate></Page>}
        </View>
      )}
    </>
  );
}
