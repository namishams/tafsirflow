import { useLocalSearchParams } from "expo-router";
import { ExamPage } from "@/features/reciter-path/Screens";

// /reciter-path/exam/[level] – level exam and certificate
export default function ReciterPathExamRoute() {
  const { level } = useLocalSearchParams<{ level: string }>();
  return <ExamPage level={Number(level)} />;
}
