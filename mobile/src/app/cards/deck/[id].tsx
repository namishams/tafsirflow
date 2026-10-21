import { useLocalSearchParams } from "expo-router";
import { DeckScreen } from "@/features/srs/DeckScreen";

export default function DeckRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DeckScreen id={String(id)} />;
}
