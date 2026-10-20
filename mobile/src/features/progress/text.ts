import { useLang } from "@/i18n";
import { moduleText } from "@/i18n/app";

// The few strings the website does not have (app dialogs). Everything else comes from the website's messages through
// useWebT() and from the website's own text modules (journey.ts, mapContent.ts).
const TEXT = {
  de: {
    delete: "Löschen",
    exportFailed: "Der Export konnte gerade nicht erstellt werden.",
  },
  en: {
    delete: "Delete",
    exportFailed: "The export could not be created just now.",
  },
};
export type ProgressText = typeof TEXT.en;

export function useText(): ProgressText {
  const { lang } = useLang();
  return moduleText("progress", TEXT, lang);
}
