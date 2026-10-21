import { useLocalSearchParams } from "expo-router";
import { ReviewScreen } from "@/features/srs/DeckScreen";

export default function ReviewRoute() {
  const { deck } = useLocalSearchParams<{ deck?: string }>();
  return <ReviewScreen deck={deck} />;
}
