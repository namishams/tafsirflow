import { useLang } from "@/i18n";
import { moduleText } from "@/i18n/app";

// Texts of the choice between the two Shams methods (module "shamsMode"): the chooser cards on the Shams page and the
// Masterclass tab, the line on the plan screen, the "your method" bar and the labels of the "Continue" links.
// German (Sie-form) and English here; the other twelve languages in src/i18n/app/<lang>.json under "shamsMode"
// (missing keys fall back to English). The website mirrors this file in src/lib/learn/shams2/modeText.ts.
const en = {
  chooserTitle: "Choose your way of learning",
  chooserLead: "Both keep their own progress. You can switch at any time without losing anything.",
  classicTitle: "Shams Method – classic",
  classicLead: "Listen, understand, repeat, recite – surah by surah.",
  classicFor: "Seven steps per verse and a clear next step each day. The simple way in.",
  v2Title: "Shams Method 2.0",
  v2Lead: "The madrasa system: sabaq, sabqī and manzil, darajāt, tadabbur and ʿarḍ tests.",
  v2For: "A daily wird planned from what you know, for steady and lasting memorisation.",
  yourMethod: "Your method",
  suggested: "Suggested for you",
  choose: "Choose",
  open: "Open",
  change: "Change",
  methodIs: "Your method: {name}",
  planNote: "Your Shams method: {name}. You can switch at any time on the Shams page.",
  whyClassic: "Suggested because you are starting out.",
  whyV2: "Suggested because you already read Arabic.",
  continueWird: "Continue with today's wird",
  todayStep: "Today's step",
  classicNext: "Continue with {surah}, verse {v}",
  classicStart: "Start your first session",
};
type T = typeof en;

const de: T = {
  chooserTitle: "Wählen Sie Ihre Art zu lernen",
  chooserLead: "Beide führen ihren eigenen Fortschritt. Sie können jederzeit wechseln, ohne etwas zu verlieren.",
  classicTitle: "Shams-Methode – klassisch",
  classicLead: "Hören, verstehen, wiederholen, rezitieren – Sure für Sure.",
  classicFor: "Sieben Schritte pro Vers und jeden Tag ein klarer nächster Schritt. Der einfache Einstieg.",
  v2Title: "Shams-Methode 2.0",
  v2Lead: "Das System der Madrasa: Sabaq, Sabqī und Manzil, Grade, Tadabbur und ʿArḍ-Prüfungen.",
  v2For: "Ein täglicher Wird, geplant aus dem, was Sie können – für stetiges, dauerhaftes Auswendiglernen.",
  yourMethod: "Ihre Methode",
  suggested: "Für Sie empfohlen",
  choose: "Wählen",
  open: "Öffnen",
  change: "Ändern",
  methodIs: "Ihre Methode: {name}",
  planNote: "Ihre Shams-Methode: {name}. Sie können auf der Shams-Seite jederzeit wechseln.",
  whyClassic: "Empfohlen, weil Sie am Anfang stehen.",
  whyV2: "Empfohlen, weil Sie bereits Arabisch lesen.",
  continueWird: "Mit dem Wird von heute fortfahren",
  todayStep: "Heutiger Schritt",
  classicNext: "Weiter mit {surah}, Vers {v}",
  classicStart: "Ersten Durchgang beginnen",
};

export type ModeKey = keyof T;
export const MODE_TEXT = { en, de };
export type ModeT = (k: ModeKey, p?: Record<string, string | number>) => string;

/** the texts of the method choice in the app's language */
export function useModeT(): ModeT {
  const { lang } = useLang();
  const d = moduleText("shamsMode", { en, de }, lang);
  return (k, p) => {
    const v = d[k] ?? en[k];
    return p ? v.replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : v;
  };
}
