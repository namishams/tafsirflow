import { useLang } from "@/i18n";
import { fillUi, tutorUi, type TutorUi } from "./ui";
import { personaOf, useAddress, useTutorPrefs, TUTOR_NAMES, type Persona } from "./prefs";

/** the current tutor (Dalil, or Hidaya for a sister who keeps her), its name and the texts with {name} filled */
export function useTutor(): { persona: Persona; name: string; ui: TutorUi; f: (s: string, v?: Record<string, string | number>) => string; address: "brother" | "sister" | null } {
  const { lang } = useLang();
  const prefs = useTutorPrefs();
  const address = useAddress();
  const persona = personaOf(prefs.persona, address);
  const name = TUTOR_NAMES[persona].name;
  const ui = tutorUi(lang);
  return { persona, name, ui, address, f: (s, v = {}) => fillUi(s, { name, ...v }) };
}
