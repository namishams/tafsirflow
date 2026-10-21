import { useLocalSearchParams } from "expo-router";
import { CourseLessonScreen } from "@/features/abrahamic/courseKit";
import { ABRAHAMIC_COURSE } from "@/features/abrahamic/lessons";

export default function AbrahamicLesson() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CourseLessonScreen def={ABRAHAMIC_COURSE} id={String(id ?? "")} />;
}
