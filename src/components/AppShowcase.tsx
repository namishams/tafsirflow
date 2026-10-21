import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { appStoreUrl } from "@/lib/appstore";

type C = { kicker: string; title: string; lead: string; cta: string; more: string; alt: string[]; features: [string, string][] };

const en: C = {
  kicker: "Quran Masterclass for iPhone and iPad",
  title: "The Masterclass in your pocket",
  lead: "Free to download, same account as the website. Your progress follows you between phone, tablet and computer.",
  cta: "Download on the App Store", more: "More about the app",
  alt: ["The Shams Method in the app", "Surah overview in the app", "Today screen in the app"],
  features: [
    ["Shams Method", "Every verse in short steps: heard, spoken, understood, recalled and connected to your life."],
    ["Word by word", "Tap any word for its meaning and transliteration while the recitation follows along."],
    ["Focus mode", "One verse at a time, nothing else on screen – for memorizing without distraction."],
    ["Verse feed", "Swipe through verses like reels, each with recitation and translation."],
    ["Quran radio", "Continuous recitation from well-known reciters, also in the background."],
    ["Hadith", "Selected hadith with source, to read alongside the Quran."],
    ["Holiday countdown", "Ramadan, Eid and the other Islamic days counted down by the Hijri calendar."],
  ],
};
const de: C = {
  kicker: "Quran Masterclass für iPhone und iPad",
  title: "Die Masterclass in Ihrer Tasche",
  lead: "Kostenlos laden, dasselbe Konto wie auf der Website. Ihr Fortschritt ist auf Handy, Tablet und Computer immer gleich.",
  cta: "Im App Store laden", more: "Mehr zur App",
  alt: ["Die Shams-Methode in der App", "Surenübersicht in der App", "Heute-Ansicht in der App"],
  features: [
    ["Shams-Methode", "Jeder Vers in kurzen Schritten: gehört, gesprochen, verstanden, abgerufen und mit Ihrem Leben verbunden."],
    ["Wort für Wort", "Tippen Sie auf ein Wort für Bedeutung und Umschrift, während die Rezitation mitläuft."],
    ["Fokusmodus", "Ein Vers, sonst nichts auf dem Bildschirm – zum Auswendiglernen ohne Ablenkung."],
    ["Vers-Feed", "Wischen Sie durch Verse wie durch Reels, jeweils mit Rezitation und Übersetzung."],
    ["Koran-Radio", "Durchgehende Rezitation bekannter Rezitatoren, auch im Hintergrund."],
    ["Hadith", "Ausgewählte Hadithe mit Quelle, zum Lesen neben dem Koran."],
    ["Countdown zu Feiertagen", "Ramadan, Eid und die anderen islamischen Tage nach dem Hidschra-Kalender."],
  ],
};
const ar: C = {
  kicker: "Quran Masterclass لآيفون وآيباد",
  title: "المنصة في جيبك",
  lead: "تنزيل مجاني بالحساب نفسه الذي تستخدمه في الموقع، ويبقى تقدّمك واحدًا على الهاتف والجهاز اللوحي والحاسوب.",
  cta: "حمّله من App Store", more: "المزيد عن التطبيق",
  alt: ["منهج شمس في التطبيق", "فهرس السور في التطبيق", "شاشة اليوم في التطبيق"],
  features: [
    ["منهج شمس", "كل آية بخطوات قصيرة: سماعًا ونطقًا وفهمًا واستحضارًا وربطًا بحياتك."],
    ["كلمة بكلمة", "اضغط على أي كلمة لترى معناها ونطقها مع متابعة التلاوة."],
    ["وضع التركيز", "آية واحدة على الشاشة دون شيء آخر، للحفظ بلا تشتيت."],
    ["تصفّح الآيات", "مرّر بين الآيات كمقاطع قصيرة، لكلٍّ منها تلاوة وترجمة."],
    ["إذاعة القرآن", "تلاوة متواصلة لقرّاء معروفين، حتى في الخلفية."],
    ["الحديث", "أحاديث مختارة مع مصدرها، تُقرأ إلى جانب القرآن."],
    ["العدّ التنازلي للمناسبات", "رمضان والعيد وسائر المناسبات الإسلامية بحسب التقويم الهجري."],
  ],
};
export const appShowcaseContent = (l: string) => (l === "de" ? de : l === "ar" ? ar : en);

// Real simulator screenshots of the iOS app (6.9" set uploaded to App Store Connect, scaled down)
const SHOTS = ["/app-screens/iphone-1.jpg", "/app-screens/iphone-2.jpg", "/app-screens/iphone-3.jpg"];

export function AppStoreButton({ label, className = "" }: { label: string; className?: string }) {
  return (
    <a href={appStoreUrl()} target="_blank" rel="noopener noreferrer"
      className={`inline-flex h-12 items-center gap-2.5 rounded-xl bg-black px-5 text-white ring-1 ring-white/25 transition hover:bg-neutral-900 ${className}`}>
      <svg aria-hidden viewBox="0 0 384 512" className="h-5 w-5 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
      <span className="text-[15px] font-semibold">{label}</span>
    </a>
  );
}

// App section: on the home page (with a link to /app) and on /app itself
export default function AppShowcase({ locale, showMore = true }: { locale: string; showMore?: boolean }) {
  const c = appShowcaseContent(locale);
  return (
    <section className="stage girih relative overflow-hidden text-[#eef0f3]">
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{c.kicker}</p>
          <h2 className="font-display mt-4 text-[34px] leading-[1.08] sm:text-5xl">{c.title}</h2>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">{c.lead}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {c.features.map(([t, d]) => (
              <li key={t} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[15px] font-bold text-[rgb(var(--gold))]">{t}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-white/70">{d}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <AppStoreButton label={c.cta} />
            {showMore && <Link href="/app" className="text-[15px] font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline">{c.more}</Link>}
          </div>
        </div>
        <div className="flex justify-center gap-3 sm:gap-5">
          {SHOTS.map((src, i) => (
            <Image key={src} src={src} alt={c.alt[i]} width={552} height={1200} sizes="(min-width: 1024px) 200px, 30vw"
              className={`w-[30%] max-w-[210px] rounded-[1.6rem] border-4 border-white/10 shadow-2xl ${i === 1 ? "" : "translate-y-8"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
