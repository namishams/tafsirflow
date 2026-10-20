import { View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { TextLink } from "@/components/brand";
import { Page, PageHero } from "@/components/page";
import { FEEDBACK_CATS, FeedbackBoard, type FeedbackCat } from "@/features/extra/FeedbackBoard";
import { useWebT } from "@/i18n/web";

// Website /feedback. reportProblem() opens it with ?new=1&cat=bug&title=…&body=… already filled in.
export default function FeedbackScreen() {
  const w = useWebT("feedback");
  const p = useLocalSearchParams<{ new?: string; cat?: string; title?: string; body?: string }>();
  const cat = FEEDBACK_CATS.includes(p.cat as FeedbackCat) ? (p.cat as FeedbackCat) : undefined;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset title={w("title")} lead={w("lead")}>
          <TextLink title={w("changelogLink")} onStage onPress={() => router.push("/changelog" as Href)} />
        </PageHero>
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          <FeedbackBoard initial={{ open: p.new === "1", cat, title: typeof p.title === "string" ? p.title : undefined, body: typeof p.body === "string" ? p.body : undefined }} />
        </View>
      </Page>
    </>
  );
}
