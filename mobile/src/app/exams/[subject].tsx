import { useLocalSearchParams } from "expo-router";
import { QbankSubjectScreen } from "@/features/qbank/Screens";

// /exams/<subject> – one subject of the examination centre: stages, tiers, topics
export default function ExamSubjectRoute() {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  return <QbankSubjectScreen id={String(subject ?? "")} />;
}
