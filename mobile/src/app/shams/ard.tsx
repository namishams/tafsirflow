import { useLocalSearchParams } from "expo-router";
import { ArdScreen } from "@/features/shams2/Darajat";

// /shams/ard?kind=weekly|monthly|ard – formal and surprise recitation checks
export default function Route() {
  const p = useLocalSearchParams<{ kind?: string }>();
  const kind = p.kind === "monthly" ? "monthly" : p.kind === "ard" ? "ard" : "weekly";
  return <ArdScreen key={kind} kind={kind} />;
}
