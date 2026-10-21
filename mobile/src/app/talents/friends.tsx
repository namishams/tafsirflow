import { Stack } from "expo-router";
import { View } from "react-native";
import { Page, PageHero } from "@/components/page";
import { MomentsFeed } from "@/features/sijill/Moments";
import { useST } from "@/features/sijill/text";
import { BadgeSheetHost } from "@/features/talents/badges";
import { AccessGate, SafetyBar, useTalentAccess } from "@/features/talents/ui";

// /talents/friends – achievements of the people the member follows (system-generated moments, no posts) with the
// preset encouragements. Block, privacy toggles and private accounts are respected by the server.
export default function FriendsAchievements() {
  const st = useST();
  const a = useTalentAccess();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
        <Page>
          <PageHero back topInset arcade={false} eyebrow={st("sijill")} title={st("friends")} lead={st("friendsLead")} />
          <AccessGate a={a}>
            <View style={{ padding: 16, gap: 16 }}>
              <MomentsFeed />
              <SafetyBar />
            </View>
          </AccessGate>
        </Page>
      </BadgeSheetHost>
    </>
  );
}
