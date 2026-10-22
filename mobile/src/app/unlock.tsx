import { Stack, useLocalSearchParams } from "expo-router";
import { UnlockSheet } from "@/features/cosmetics/Unlock";
import type { CourseSlug } from "@/lib/shop";
import type { ProFeature } from "@/lib/pro";

const SLUGS: CourseSlug[] = ["arabic", "islam", "prophet-stories", "halal-haram", "exams"];

// /unlock?c=<course>&f=<feature> – Pro or this course on its own (features/cosmetics/Unlock.tsx)
export default function UnlockRoute() {
  const { c, f } = useLocalSearchParams<{ c?: string; f?: string }>();
  const slug = SLUGS.find((s) => s === c) ?? "islam";
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      <UnlockSheet slug={slug} feature={(f ?? "general") as ProFeature} />
    </>
  );
}
