"use client";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import TutorChat from "@/components/tutor/TutorChat";
import type { TutorContext } from "@/components/tutor/state";

/** reads ?ctx=<json>&q=<question> of an entry point and opens the tutor with them */
export default function AssistantClient() {
  const sp = useSearchParams();
  const ctx = sp.get("ctx"), q = sp.get("q");
  const context = useMemo<TutorContext | null>(() => { try { return ctx ? (JSON.parse(ctx) as TutorContext) : null; } catch { return null; } }, [ctx]);
  return <TutorChat context={context} initial={q ? q.slice(0, 800) : undefined} />;
}
