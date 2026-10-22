import { Stack, useLocalSearchParams } from "expo-router";
import DuaJourney from "@/features/duaJourney/Journey";
import { STEPS, type Step } from "@/web/duaJourney";

// /dua-generator – the personal dua journey (website: app/[locale]/(app)/dua-generator): gentle questions, a revealed
// dua rooted in the duas of the Quran and the Sunnah, a card to keep and share. The feed opens it with the topic of the
// dua post it came from (?topic=worry); ?demo=1 (development builds only) shows the reveal without a server call.
export default function DuaGeneratorScreen() {
  const { topic, demo, step, gift } = useLocalSearchParams<{ topic?: string; demo?: string; step?: string; gift?: string }>();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <DuaJourney key={`${topic ?? ""}-${step ?? ""}-${gift ?? ""}`} gift={gift} initialTopic={topic} demo={__DEV__ && demo === "1"} demoStep={__DEV__ && demo === "1" && (STEPS as readonly string[]).includes(step ?? "") ? (step as Step) : undefined} />
    </>
  );
}
