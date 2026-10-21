import { useLocalSearchParams } from "expo-router";
import { SubmissionScreen } from "@/features/mishary/Mentoring";

// /mishary/mentoring/[id] – one recording with its feedback (also season entries for the jury)
export default function MisharySubmissionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SubmissionScreen id={String(id)} />;
}
