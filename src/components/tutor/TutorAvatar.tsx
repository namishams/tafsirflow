"use client";

import TutorPortrait from "./TutorPortrait";

// Dalil, the AI tutor: a dignified Dubai sheikh (art in src/lib/tutorArt.ts, shared with the app).
export default function TutorAvatar(props: { size?: number; still?: boolean; speaking?: boolean; className?: string }) {
  return <TutorPortrait persona="dalil" {...props} />;
}
