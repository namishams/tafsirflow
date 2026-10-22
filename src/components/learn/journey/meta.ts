// SEO texts of the Riḥlat al-ʿIlm pages (server-safe), mirrors the titles of mobile/src/features/journey/texts.ts.
// German, English and Arabic; other languages use English. /journey is indexable; today, stats and year are personal.
// Further languages: meta.i18n.json next to this file (see ../seoI18n.ts), English for every key they lack.
import I18N from "./meta.i18n.json";
import { seoOver } from "@/components/learn/seoI18n";
type M = { title: string; description: string };
export type JourneyPage = "home" | "today" | "stats" | "year";
const T: Record<"en" | "de" | "ar", Record<JourneyPage, M>> = {
  en: {
    home: { title: "Riḥlat al-ʿIlm – the long path of learning | Quran Masterclass", description: "Hifz, tajweed, Arabic, tafsir and hadith as one path of Marāḥil: a map without a last station, app ranks, seals to collect and daily plans that never run out. Free on the website." },
    today: { title: "Today's plans – Riḥlat al-ʿIlm | Quran Masterclass", description: "Endless daily plans: a Quran khatm, hifz review, tafsir verse by verse, hadith through whole collections, every Quranic lemma and the similar verses." },
    stats: { title: "Statistics – Riḥlat al-ʿIlm | Quran Masterclass", description: "Totals that keep counting, personal records that can always be beaten and goals that open the next one." },
    year: { title: "Year in review – Riḥlat al-ʿIlm | Quran Masterclass", description: "Your learning in one Hijri year: learning days, points, records, completed cycles, seals and certificates." },
  },
  de: {
    home: { title: "Riḥlat al-ʿIlm – der lange Weg des Lernens | Quran Masterclass", description: "Hifz, Tadschwid, Arabisch, Tafsir und Hadith als ein Weg aus Marāḥil: eine Karte ohne letzte Station, App-Ränge, Siegel zum Sammeln und tägliche Pläne, die nie ausgehen. Kostenlos auf der Website." },
    today: { title: "Pläne für heute – Riḥlat al-ʿIlm | Quran Masterclass", description: "Endlose Tagespläne: eine Khatm des Quran, Hifz-Wiederholung, Tafsir Vers für Vers, Hadith durch ganze Sammlungen, jedes Lemma des Quran und die ähnlichen Verse." },
    stats: { title: "Statistik – Riḥlat al-ʿIlm | Quran Masterclass", description: "Summen, die weiterzählen, persönliche Rekorde, die sich immer überbieten lassen, und Ziele, die das nächste öffnen." },
    year: { title: "Jahresrückblick – Riḥlat al-ʿIlm | Quran Masterclass", description: "Ihr Lernen in einem Hidschra-Jahr: Lerntage, Punkte, Rekorde, abgeschlossene Runden, Siegel und Zertifikate." },
  },
  ar: {
    home: { title: "رحلة العلم – طريق التعلّم الطويل | Quran Masterclass", description: "الحفظ والتجويد والعربية والتفسير والحديث طريقٌ واحد من المراحل: خريطة بلا محطة أخيرة، ورتب في التطبيق، وأختام تُجمع، وخطط يومية لا تنتهي. مجانًا على الموقع." },
    today: { title: "خطط اليوم – رحلة العلم | Quran Masterclass", description: "خطط يومية لا تنتهي: ختمة القرآن، ومراجعة الحفظ، والتفسير آيةً آية، والحديث عبر مجموعات كاملة، وكل لِمّة قرآنية، والمتشابهات." },
    stats: { title: "الإحصاءات – رحلة العلم | Quran Masterclass", description: "مجاميع تستمر في العدّ، وأرقام شخصية يمكن تجاوزها دائمًا، وأهداف يفتح كلٌّ منها ما بعده." },
    year: { title: "حصاد العام – رحلة العلم | Quran Masterclass", description: "تعلّمكم في عام هجري واحد: أيام التعلّم والنقاط والأرقام والدورات المكتملة والأختام والشهادات." },
  },
};
export function journeyMeta(locale: string, page: JourneyPage): M {
  if (locale !== "de" && locale !== "ar") { const x = seoOver(T.en, I18N, locale); if (x) return x[page]; }
  return T[locale === "de" || locale === "ar" ? locale : "en"][page];
}
export const JOURNEY_PATH: Record<JourneyPage, string> = { home: "/journey", today: "/journey/today", stats: "/journey/stats", year: "/journey/year" };
