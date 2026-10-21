// SEO texts of the garden pages (server-safe). German, English and Arabic; other languages use English.
type M = { title: string; description: string };
type Page = "home" | "collection";
const T: Record<"en" | "de" | "ar", Record<Page, M>> = {
  en: {
    home: { title: "Your garden – a tree that grows with your Quran learning | Quran Masterclass", description: "Plant your own tree with a short ceremony and watch it grow with every verse you learn with the Shams Method. Thirteen stages over a year, a living landscape under the real sky over Makkah." },
    collection: { title: "Sticker collection – your garden | Quran Masterclass", description: "Your sticker collection from Quran Masterclass: verses, surahs, names of Allah, prophets, Hijri months and more, with series progress and the stated odds." },
  },
  de: {
    home: { title: "Ihr Garten – ein Baum, der mit Ihrem Quran-Lernen wächst | Quran Masterclass", description: "Pflanzen Sie mit einer kleinen Zeremonie Ihren eigenen Baum und sehen Sie ihn mit jedem Vers wachsen, den Sie mit der Shams-Methode lernen. Dreizehn Stufen über ein Jahr, eine lebendige Landschaft unter dem echten Himmel über Mekka." },
    collection: { title: "Sticker-Sammlung – Ihr Garten | Quran Masterclass", description: "Ihre Sticker-Sammlung aus Quran Masterclass: Verse, Suren, Namen Allahs, Propheten, Hidschri-Monate und mehr, mit Fortschritt je Serie und offen genannten Wahrscheinlichkeiten." },
  },
  ar: {
    home: { title: "حديقتك – شجرة تنمو مع تعلمك القرآن | Quran Masterclass", description: "ازرع شجرتك الخاصة في مراسم قصيرة وشاهدها تنمو مع كل آية تتعلمها بمنهج شمس. ثلاث عشرة مرحلة على مدى عام، في منظر حيّ تحت سماء مكة الحقيقية." },
    collection: { title: "مجموعة الملصقات – حديقتك | Quran Masterclass", description: "مجموعة ملصقاتك في Quran Masterclass: آيات وسور وأسماء الله الحسنى والأنبياء والأشهر الهجرية وغيرها، مع تقدم كل سلسلة والاحتمالات المعلنة." },
  },
};
export function gardenMeta(locale: string, page: Page): M {
  return T[locale === "de" || locale === "ar" ? locale : "en"][page];
}
