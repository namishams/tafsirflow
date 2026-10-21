import { useLocalSearchParams } from "expo-router";
import { CourseLessonScreen } from "@/features/abrahamic/courseKit";
import { HARAMAIN_COURSE } from "@/features/haramain/lessons";

export default function HaramainLesson() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CourseLessonScreen def={HARAMAIN_COURSE} id={String(id ?? "")} />;
}
