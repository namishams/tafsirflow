"use client";

import TutorPortrait from "./TutorPortrait";

// Hidaya (هداية, "guidance"), the AI tutor for sisters: a veiled ustadha in khimar and niqab (art in src/lib/tutorArt.ts).
export default function TutorAvatarHidaya(props: { size?: number; still?: boolean; speaking?: boolean; className?: string }) {
  return <TutorPortrait persona="hidaya" {...props} />;
}
