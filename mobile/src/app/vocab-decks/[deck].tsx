import { useLocalSearchParams } from "expo-router";
import { VocabDeckScreen } from "@/features/courses/Vocab";

// /vocab-decks/[deck] – cards and quiz of one deck
export default function Route() {
  const { deck } = useLocalSearchParams<{ deck: string }>();
  return <VocabDeckScreen id={String(deck)} />;
}
