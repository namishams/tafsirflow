import { useLocalSearchParams } from "expo-router";
import { TajweedLessonPage } from "@/features/tajweed/TajweedPages";

// /tajweed/[id] – one tajweed lesson with examples and quiz
export default function TajweedLessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TajweedLessonPage id={String(id ?? "")} />;
}
