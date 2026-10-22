// Hidaya (هداية, "guidance"), the AI tutor for sisters: a veiled ustadha in khimar and niqab (art in src/web/tutorArt.ts).
import { TutorPortrait } from "./Portrait";

export function TutorAvatarHidaya(props: { size?: number; still?: boolean; speaking?: boolean }) {
  return <TutorPortrait persona="hidaya" {...props} />;
}
