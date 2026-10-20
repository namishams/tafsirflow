import { useLocalSearchParams } from "expo-router";
import { ArabicLessonScreen } from "@/features/arabic/ArabicLesson";

// /arabic/[id] – one lesson of the Arabic course, or the placement test (/arabic/placement), like the website
export default function ArabicLessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ArabicLessonScreen id={String(id ?? "")} />;
}
