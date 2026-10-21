import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import AppInstall from "@/components/AppInstall";
import Logo from "@/components/Logo";
import { pageMeta } from "@/lib/site";
import AppShowcase from "@/components/AppShowcase";
import { appStoreUrl } from "@/lib/appstore";
import JsonLd from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { abs } from "@/lib/site";
import { organizationLd } from "@/lib/company";
import { mc, mobileAppLd } from "@/lib/masterclass";
import { MasterclassPillars, McHead, PricingPlans } from "@/components/masterclass/Sections";

export const dynamic = "force-dynamic"; // PLAY_STORE_URL is read from the server environment at request time

type C = { kicker: string; title: string; lead: string; buttons: { install: string; installed: string; apk: string; apkSoon: string; play: string; samsung: string };
  waysTitle: string; ways: { t: string; steps: string[] }[]; featuresTitle: string; features: [string, string][]; note: string };

const de: C = {
  kicker: "Die App", title: "Quran Masterclass auf Ihr Handy",
  lead: "Die ganze Masterclass als App: Vollbild ohne Browserleiste, eigenes Symbol auf dem Startbildschirm, gespeicherte Suren auch offline – und jedes Update der Website ist sofort in der App.",
  buttons: { install: "App installieren", installed: "Die App ist installiert", apk: "Android-App herunterladen (APK)", apkSoon: "Android-App: bald verfügbar", play: "Bei Google Play laden", samsung: "Sie nutzen Samsung Internet. Bitte installieren Sie nicht über dessen Menü – Samsung baut dabei eine eigene Hülle für ein altes Android, die Google Play Protect blockiert. Öffnen Sie die Seite stattdessen in Chrome und wählen Sie „App installieren“, oder laden Sie die Android-App oben herunter." },
  waysTitle: "So installieren Sie sie",
  ways: [
    { t: "Android (Chrome)", steps: ["quranmasterclass.com in Chrome öffnen.", "Auf „App installieren“ tippen – oder im Menü ⋮ „App installieren“ wählen.", "Das Symbol erscheint auf dem Startbildschirm."] },
    { t: "iPhone und iPad (Safari)", steps: ["quranmasterclass.com in Safari öffnen.", "Auf das Teilen-Symbol tippen.", "„Zum Home-Bildschirm“ wählen."] },
    { t: "Computer (Chrome, Edge)", steps: ["Die Seite öffnen.", "In der Adressleiste auf das Installieren-Symbol klicken.", "Die Masterclass öffnet sich als eigenes Fenster."] },
  ],
  featuresTitle: "Was die App kann",
  features: [["Offline lernen", "Suren in den Einstellungen einer Sure speichern – sie spielen auch ohne Internet."], ["Ein Fortschritt", "Mit Ihrem Konto sind App, Handy-Browser und Computer immer auf demselben Stand."], ["Schnellzugriff", "Lange auf das Symbol drücken: direkt zu Heute, Koran, Shams-Methode oder Radio."], ["Immer aktuell", "Neue Kurse und Verbesserungen kommen ohne Update aus dem Store."]],
  note: "Als Web-App von der Website installiert bleibt alles kostenlos und ohne Werbung – wie die Website. Die App aus dem App Store und von Google Play ist kostenlos und ohne Werbung; für alle, die mehr wollen, gibt es dort Quran Masterclass Pro – monatlich kündbar, im App Store bzw. bei Google Play.",
};
const en: C = {
  kicker: "The app", title: "Quran Masterclass on your phone",
  lead: "The whole Masterclass as an app: full screen without a browser bar, its own icon on the home screen, saved surahs even offline – and every update of the website is instantly in the app.",
  buttons: { install: "Install the app", installed: "The app is installed", apk: "Download the Android app (APK)", apkSoon: "Android app: coming soon", play: "Get it on Google Play", samsung: "You are using Samsung Internet. Please do not install through its menu – Samsung builds its own wrapper for an old Android version, which Google Play Protect blocks. Open the page in Chrome instead and choose “Install app”, or download the Android app above." },
  waysTitle: "How to install it",
  ways: [
    { t: "Android (Chrome)", steps: ["Open quranmasterclass.com in Chrome.", "Tap “Install app” – or choose “Install app” in the ⋮ menu.", "The icon appears on your home screen."] },
    { t: "iPhone and iPad (Safari)", steps: ["Open quranmasterclass.com in Safari.", "Tap the share icon.", "Choose “Add to Home Screen”."] },
    { t: "Computer (Chrome, Edge)", steps: ["Open the site.", "Click the install icon in the address bar.", "The Masterclass opens in its own window."] },
  ],
  featuresTitle: "What the app can do",
  features: [["Learn offline", "Save surahs in a surah’s settings – they play without internet."], ["One progress", "With your account, the app, your phone’s browser and your computer are always in sync."], ["Quick access", "Long-press the icon: straight to Today, Quran, Shams Method or Radio."], ["Always up to date", "New courses and improvements arrive without a store update."]],
  note: "Installed from the website as a web app, everything stays free and without ads – just like the website. The app from the App Store and Google Play is free and without ads; for everyone who wants more it offers Quran Masterclass Pro – monthly, cancel any time, in the App Store or on Google Play.",
};
const ar: C = {
  kicker: "التطبيق", title: "Quran Masterclass على هاتفك",
  lead: "المنصة كاملةً في تطبيق: شاشة كاملة دون شريط المتصفح، وأيقونة خاصة على الشاشة الرئيسية، وسور محفوظة تعمل دون اتصال، وكل تحديث للموقع يظهر فورًا في التطبيق.",
  buttons: { install: "ثبّت التطبيق", installed: "التطبيق مثبَّت", apk: "تنزيل تطبيق أندرويد (APK)", apkSoon: "تطبيق أندرويد: قريبًا", play: "حمّله من Google Play", samsung: "أنت تستخدم متصفح سامسونج. لا تثبّت التطبيق من قائمته، فسامسونج تبني غلافًا خاصًّا لإصدار قديم من أندرويد يحظره Google Play Protect. افتح الصفحة في كروم واختر «تثبيت التطبيق»، أو نزّل تطبيق أندرويد من الأعلى." },
  waysTitle: "طريقة التثبيت",
  ways: [
    { t: "أندرويد (كروم)", steps: ["افتح quranmasterclass.com في كروم.", "اضغط «تثبيت التطبيق» أو اختره من القائمة ⋮.", "تظهر الأيقونة على الشاشة الرئيسية."] },
    { t: "آيفون وآيباد (سفاري)", steps: ["افتح quranmasterclass.com في سفاري.", "اضغط على أيقونة المشاركة.", "اختر «إضافة إلى الشاشة الرئيسية»."] },
    { t: "الحاسوب (كروم، إيدج)", steps: ["افتح الموقع.", "اضغط على أيقونة التثبيت في شريط العنوان.", "تفتح المنصة في نافذة مستقلة."] },
  ],
  featuresTitle: "ما يقدّمه التطبيق",
  features: [["التعلّم دون اتصال", "احفظ السور من إعدادات السورة لتعمل دون إنترنت."], ["تقدّم واحد", "بحسابك يبقى التطبيق والمتصفح والحاسوب على المستوى نفسه دائمًا."], ["وصول سريع", "اضغط مطوّلًا على الأيقونة لتنتقل مباشرة إلى اليوم أو القرآن أو منهج شمس أو الإذاعة."], ["محدَّث دائمًا", "تصل الدورات الجديدة والتحسينات دون تحديث من المتجر."]],
  note: "عند تثبيته من الموقع كتطبيق ويب يبقى كل شيء مجانيًا بلا إعلانات، تمامًا كالموقع. والتطبيق من App Store وGoogle Play مجاني بلا إعلانات، وفيه لمن أراد المزيد اشتراك Quran Masterclass Pro الشهري الذي يمكن إلغاؤه في أي وقت عبر App Store أو Google Play.",
};
const content = (l: string) => (l === "de" ? de : l === "ar" ? ar : en);

const APP_STORE_LABEL: Record<string, string> = { de: "Im App Store laden", en: "Download on the App Store", ar: "حمّله من App Store" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/app", `${c.title} | Quran Masterclass`, c.lead.slice(0, 158));
}

export default async function AppPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  const m = mc(locale);
  const ld = { "@context": "https://schema.org", "@graph": [organizationLd(abs), mobileAppLd(locale, abs, appStoreUrl(), c.lead)] };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{c.kicker}</p>
            <h1 className="font-display mt-4 text-[38px] leading-[1.06] sm:text-6xl">{c.title}</h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{c.lead}</p>
            <div className="mt-8"><AppInstall t={{ ...c.buttons, appStore: APP_STORE_LABEL[locale] ?? APP_STORE_LABEL.en }} playUrl={process.env.PLAY_STORE_URL ?? ""} appStoreUrl={appStoreUrl()} /></div>
          </div>
          <div aria-hidden className="mx-auto grid h-56 w-32 place-items-center rounded-[2rem] border-4 border-white/15 bg-[rgb(var(--stage))] shadow-2xl sm:h-72 sm:w-40">
            <Logo size={72} />
          </div>
        </div>
      </section>
      <div className="border-t border-white/10"><AppShowcase locale={locale} showMore={false} /></div>
      {/* the whole curriculum in the app, then Free vs Pro */}
      <section className="hm-warm">
        <div className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
          <McHead locale={locale} title={m.appPage.title} lead={m.appPage.lead} />
          <Link href="/masterclass" className="mt-7 inline-flex h-11 items-center rounded-md border border-[rgb(var(--hm-gold))]/60 px-5 text-sm font-bold transition hover:border-[rgb(var(--hm-gold))] hover:bg-[rgb(var(--hm-gold))]/10">{m.appPage.cta} <span aria-hidden className="ms-2 rtl:-scale-x-100">→</span></Link>
        </div>
        <div className="-mt-6"><MasterclassPillars locale={locale} /></div>
      </section>
      <PricingPlans locale={locale} />
      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="font-display text-3xl">{c.waysTitle}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {c.ways.map((w) => (
            <div key={w.t} className="rounded-xl border border-line bg-surface p-5">
              <h3 className="text-[16px] font-bold">{w.t}</h3>
              <ol className="mt-3 grid gap-2 text-[14px] leading-snug text-muted">{w.steps.map((s, i) => <li key={s} className="flex gap-2.5"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">{i + 1}</span>{s}</li>)}</ol>
            </div>
          ))}
        </div>
        <h2 className="font-display mt-14 text-3xl">{c.featuresTitle}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">{c.features.map(([t, d]) => <li key={t} className="rounded-xl border border-line bg-surface p-5"><p className="font-bold">{t}</p><p className="mt-1 text-[14px] leading-relaxed text-muted">{d}</p></li>)}</ul>
        <p className="mt-10 text-center text-sm text-muted">{c.note}</p>
      </section>
    </div>
  );
}
