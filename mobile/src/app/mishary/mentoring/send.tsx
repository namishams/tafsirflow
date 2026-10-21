import { useLocalSearchParams } from "expo-router";
import { SendScreen } from "@/features/mishary/Mentoring";

// /mishary/mentoring/send?mentor=<username> – record 30–60 s and send it for review
export default function MisharySendRoute() {
  const { mentor } = useLocalSearchParams<{ mentor: string }>();
  return <SendScreen mentor={String(mentor ?? "")} />;
}
