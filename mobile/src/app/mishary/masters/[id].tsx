import { useLocalSearchParams } from "expo-router";
import { MasterStudyScreen } from "@/features/mishary/StyleStudy";

// /mishary/masters/[id] – one master: phrases, pace and pauses, A/B recording, style notes
export default function MisharyMasterRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MasterStudyScreen id={String(id)} />;
}
