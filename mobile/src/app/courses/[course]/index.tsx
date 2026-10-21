import { useLocalSearchParams } from "expo-router";
import { CourseScreen } from "@/features/courses/Screens";

// /courses/[course] – one course: lessons, progress, sticker
export default function CourseRoute() {
  const { course } = useLocalSearchParams<{ course: string }>();
  return <CourseScreen id={String(course)} />;
}
