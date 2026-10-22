// Dalil, the AI tutor: a dignified Dubai sheikh (art in src/web/tutorArt.ts, shared with the website).
import { TutorPortrait } from "./Portrait";

export function TutorAvatar(props: { size?: number; still?: boolean; speaking?: boolean }) {
  return <TutorPortrait persona="dalil" {...props} />;
}
