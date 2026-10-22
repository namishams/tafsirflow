import { useMemo } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { TutorChat } from "@/features/tutor/TutorChat";
import type { TutorContext } from "@/features/tutor/api";

// The tutor (Dalil, or Hidaya for sisters): website /assistant. Free users get a few questions a day, Pro many more
// (server limits); the consent screen comes before the first question. Entry points pass ?ctx=<json>&q=<question>.
export default function AssistantScreen() {
  const p = useLocalSearchParams<{ ctx?: string; q?: string }>();
  const context = useMemo<TutorContext | null>(() => { try { return p.ctx ? (JSON.parse(String(p.ctx)) as TutorContext) : null; } catch { return null; } }, [p.ctx]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TutorChat context={context} initial={p.q ? String(p.q).slice(0, 800) : undefined} />
    </>
  );
}
