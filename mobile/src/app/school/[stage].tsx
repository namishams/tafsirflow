import { useLocalSearchParams } from "expo-router";
import { StageScreen } from "@/features/school/Screens";

// /school/<stage> – ibtidai | idadi | thanawi | ali
export default function SchoolStageRoute() {
  const { stage } = useLocalSearchParams<{ stage: string }>();
  return <StageScreen id={String(stage ?? "ibtidai")} />;
}
