import { useLocalSearchParams } from "expo-router";
import { LangLessonScreen } from "@/features/arabic-lang/Screens";

// /arabic/lang/[lesson] – one lesson or unit test of the language course
export default function ArabicLangLessonRoute() {
  const { lesson } = useLocalSearchParams<{ lesson: string }>();
  return <LangLessonScreen key={String(lesson ?? "")} id={String(lesson ?? "")} />;
}
