import { useLocalSearchParams } from "expo-router";
import { QaidaLessonScreen } from "@/features/qaida/Screens";

// /arabic/read/[lesson] – one lesson of the reading course, "review", or a surah of Juz ʿAmma (juz-<n>)
export default function QaidaLessonRoute() {
  const { lesson, r } = useLocalSearchParams<{ lesson: string; r?: string }>();
  return <QaidaLessonScreen key={`${lesson}:${r ?? ""}`} id={String(lesson ?? "")} />;
}
