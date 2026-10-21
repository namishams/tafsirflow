import { useLocalSearchParams } from "expo-router";
import { NahjLessonScreen } from "@/features/nahj-course/Screens";

export default function NahjLesson() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NahjLessonScreen id={String(id ?? "")} />;
}
