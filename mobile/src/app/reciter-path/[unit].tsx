import { useLocalSearchParams } from "expo-router";
import { UnitPage } from "@/features/reciter-path/Screens";

// /reciter-path/[unit] – one unit: explanation, examples, practice, self-check, test
export default function ReciterPathUnitRoute() {
  const { unit } = useLocalSearchParams<{ unit: string }>();
  return <UnitPage id={String(unit)} />;
}
