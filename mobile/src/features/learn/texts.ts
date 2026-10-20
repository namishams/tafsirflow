import { useLang } from "@/i18n";

const T = {
  de: {
    continue: "Weiterlernen", continueAt: "{surah} · ab Vers {verse}", start: "Mit al-Fātiḥa beginnen", about: "Über die Methode",
    pathTitle: "Dein Kursweg", pathLead: "So lernen die meisten: zuerst al-Fātiḥa, dann Juz ʿAmma vom Ende her, danach die Suren, die man gern auswendig kann.",
    freeTitle: "Kostenlos", freeLead: "al-Fātiḥa und Juz ʿAmma – 38 Suren mit der ganzen Shams-Methode.",
    proTitle: "Mit Pro", proLead: "Jede Sure des Koran mit der Shams-Methode, dazu alle Rezitatoren und Kurse.",
    allSurahs: "Alle 114 Suren", allSurahsSub: "Wähle jede Sure im Koran-Tab und starte die Shams-Methode.",
    verses: "{done} von {total} Versen", notStarted: "Noch nicht begonnen", complete: "Abgeschlossen",
    toolsTitle: "Kurse und Werkzeuge", academy: "Academy-Tests", academySub: "Kurze Tests auf Zeit zu jeder Lektion",
    proCardTitle: "Die ganze Masterclass", proCardLead: "Lerne den Tafsir jeder Sure mit der Shams-Methode – mit allen Rezitatoren, Radio, Arabisch und Tadschwid komplett.",
    showMore: "Alle anzeigen", showLess: "Weniger anzeigen",
  },
  en: {
    continue: "Continue learning", continueAt: "{surah} · from verse {verse}", start: "Begin with al-Fātiḥa", about: "About the method",
    pathTitle: "Your course path", pathLead: "How most people learn: al-Fātiḥa first, then Juz ʿAmma from the end, then the surahs people love to know by heart.",
    freeTitle: "Free", freeLead: "al-Fātiḥa and Juz ʿAmma – 38 surahs with the complete Shams Method.",
    proTitle: "With Pro", proLead: "Every surah of the Quran with the Shams Method, plus all reciters and courses.",
    allSurahs: "All 114 surahs", allSurahsSub: "Choose any surah in the Quran tab and start the Shams Method.",
    verses: "{done} of {total} verses", notStarted: "Not started yet", complete: "Completed",
    toolsTitle: "Courses and tools", academy: "Academy tests", academySub: "Short timed tests for every lesson",
    proCardTitle: "The whole Masterclass", proCardLead: "Learn the tafsir of every surah with the Shams Method – with all reciters, radio, and the complete Arabic and Tajweed courses.",
    showMore: "Show all", showLess: "Show less",
  },
};

export function useLearnT() {
  const { lang } = useLang();
  const d = T[lang] ?? T.en;
  return (k: keyof typeof T.en, p?: Record<string, string | number>) => (p ? d[k].replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : d[k]);
}
