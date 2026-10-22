import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { AdabScreen } from "@/components/learn/shams2/Adab";

// /shams/adab – the pillar "Adab des Qurʾān-Trägers" of the Shams Method (mirrors mobile/src/app/shams/adab.tsx)
const META: Record<"de" | "en", { title: string; description: string }> = {
  de: { title: "Adab des Qurʾān-Trägers – Säule der Shams-Methode | Quran Masterclass", description: "Der Rezitator lebt, was er rezitiert: tägliche Sunna-Etikette – Badezimmer, rechte Hand, Essen, Schlafen, Grüßen, Reinheit, Muṣḥaf, Rezitation, Charakter, halal Verdienst – mit ehrlichem Status und Quellen." },
  en: { title: "Adab of the Qurʾān carrier – pillar of the Shams Method | Quran Masterclass", description: "The reciter lives what they recite: daily sunnah etiquette – bathroom, right hand, eating, sleeping, greeting, purity, the muṣḥaf, recitation, character, halal earnings – with honest status and sources." },
};
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = META[locale === "de" ? "de" : "en"];
  return pageMeta(locale, "/shams/adab", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdabScreen />;
}
