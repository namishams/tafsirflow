import { TutorAvatar } from "./TutorAvatar";
import { TutorAvatarHidaya } from "./TutorAvatarHidaya";
import type { Persona } from "./prefs";

/** the tutor's face: Dalil (the sheikh) or Hidaya (the veiled ustadha), in the garden illustration style */
export function TutorFace({ persona, size = 40, still, speaking }: { persona: Persona; size?: number; still?: boolean; speaking?: boolean }) {
  return persona === "hidaya" ? <TutorAvatarHidaya size={size} still={still} speaking={speaking} /> : <TutorAvatar size={size} still={still} speaking={speaking} />;
}
