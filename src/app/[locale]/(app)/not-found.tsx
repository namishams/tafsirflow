import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/locales";

// Localised 404 in every site language (an unknown locale falls back to English)
type Text = { code: string; title: string; body: string; home: string; quran: string };
const T: Record<AppLocale, Text> = {
  de: { code: "404", title: "Diese Seite gibt es nicht", body: "Der Link ist vielleicht veraltet oder falsch geschrieben. Hier geht es weiter:", home: "Zur Startseite", quran: "Zum Koran" },
  en: { code: "404", title: "This page does not exist", body: "The link may be outdated or mistyped. Here is where to go next:", home: "Back to the home page", quran: "Open the Quran" },
  ar: { code: "٤٠٤", title: "هذه الصفحة غير موجودة", body: "ربما كان الرابط قديمًا أو فيه خطأ في الكتابة. تفضّل بالانتقال إلى:", home: "العودة إلى الرئيسية", quran: "فتح القرآن" },
  tr: { code: "404", title: "Böyle bir sayfa yok", body: "Bağlantı eski ya da yanlış yazılmış olabilir. Buradan devam edebilirsiniz:", home: "Ana sayfaya dön", quran: "Kur'an'ı aç" },
  ur: { code: "404", title: "یہ صفحہ موجود نہیں", body: "ممکن ہے لنک پرانا ہو یا اس کے لکھنے میں غلطی ہو۔ آگے یہاں سے جائیں:", home: "ہوم پیج پر واپس جائیں", quran: "قرآن کھولیں" },
  fa: { code: "404", title: "این صفحه وجود ندارد", body: "شاید پیوند قدیمی یا نادرست نوشته شده باشد. از اینجا ادامه دهید:", home: "بازگشت به صفحه اصلی", quran: "باز کردن قرآن" },
  ps: { code: "404", title: "دا پاڼه نشته", body: "کېدای شي لینک زوړ وي یا په لیکلو کې یې تېروتنه شوې وي. له دې ځایه مخکې ولاړ شئ:", home: "اصلي پاڼې ته بیرته ورشئ", quran: "قرآن خلاص کړئ" },
  fr: { code: "404", title: "Cette page n’existe pas", body: "Le lien est peut-être périmé ou mal saisi. Voici où aller :", home: "Retour à l’accueil", quran: "Ouvrir le Coran" },
  es: { code: "404", title: "Esta página no existe", body: "Puede que el enlace esté desactualizado o tenga un error. Desde aquí puede continuar:", home: "Volver al inicio", quran: "Abrir el Corán" },
  id: { code: "404", title: "Halaman ini tidak ada", body: "Tautan mungkin sudah usang atau salah ketik. Silakan lanjut ke:", home: "Kembali ke beranda", quran: "Buka Al-Qur'an" },
  ms: { code: "404", title: "Halaman ini tidak wujud", body: "Pautan mungkin sudah lapuk atau tersalah taip. Teruskan ke:", home: "Kembali ke laman utama", quran: "Buka Quran" },
  bn: { code: "404", title: "এই পৃষ্ঠাটি নেই", body: "লিংকটি হয়তো পুরোনো, নয়তো ভুল লেখা হয়েছে। এখান থেকে এগিয়ে যান:", home: "হোম পেজে ফিরে যান", quran: "কুরআন খুলুন" },
  ru: { code: "404", title: "Такой страницы нет", body: "Возможно, ссылка устарела или в ней опечатка. Вот куда можно перейти:", home: "На главную", quran: "Открыть Коран" },
  zh: { code: "404", title: "该页面不存在", body: "链接可能已过期或输入有误。您可以前往：", home: "返回首页", quran: "打开古兰经" },
};

export default async function NotFound() {
  const locale = await getLocale();
  const t = T[(locale in T ? locale : "en") as AppLocale];
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
