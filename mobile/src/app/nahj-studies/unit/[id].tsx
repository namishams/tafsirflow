import { useLocalSearchParams } from "expo-router";
import { NahjUnitScreen } from "@/features/nahj-course/Screens";

export default function NahjUnit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NahjUnitScreen id={String(id ?? "")} />;
}
