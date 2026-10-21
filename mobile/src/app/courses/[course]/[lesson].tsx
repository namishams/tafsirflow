import { useLocalSearchParams } from "expo-router";
import { LessonScreen } from "@/features/courses/Screens";

// /courses/[course]/[lesson] – one lesson with verses by key, quiz and rewards
export default function CourseLessonRoute() {
  const { course, lesson } = useLocalSearchParams<{ course: string; lesson: string }>();
  return <LessonScreen courseId={String(course)} lessonId={String(lesson)} />;
}
