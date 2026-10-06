import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Localised 404 (German, English, Arabic; every other language falls back to English)
const T = {
  de: { code: "404", title: "Diese Seite gibt es nicht", body: "Der Link ist vielleicht veraltet oder falsch geschrieben. Hier geht es weiter:", home: "Zur Startseite", quran: "Zum Koran" },
  en: { code: "404", title: "This page does not exist", body: "The link may be outdated or mistyped. Here is where to go next:", home: "Back to the home page", quran: "Open the Quran" },
  ar: { code: "٤٠٤", title: "هذه الصفحة غير موجودة", body: "ربما كان الرابط قديمًا أو فيه خطأ في الكتابة. تفضّل بالانتقال إلى:", home: "العودة إلى الرئيسية", quran: "فتح القرآن" },
} as const;

export default async function NotFound() {
  const locale = await getLocale();
  const t = T[(locale in T ? locale : "en") as keyof typeof T];
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-7xl text-gold">{t.code}</p>
      <h1 className="font-display mt-4 text-3xl">{t.title}</h1>
      <p className="mt-3 text-muted">{t.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-gold inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{t.home}</Link>
        <Link href="/quran" className="inline-flex h-12 items-center rounded-md border border-line px-6 text-[15px] font-bold hover:border-ink">{t.quran}</Link>
      </div>
    </main>
  );
}
