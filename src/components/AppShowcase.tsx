import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { appStoreLink } from "@/lib/appstore";

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

// App Store badge in the store's own wording, drawn in text only (no Apple artwork). While the app is not yet in the
// store (APP_STORE_URL in src/lib/appstore.ts is null) it is a quiet, non-clickable "coming soon" badge.
export function AppStoreButton({ label, soon, top, className = "" }: { label: string; soon?: string; top?: string; className?: string }) {
  const href = appStoreLink();
  const box = `inline-flex min-h-12 items-center rounded-xl px-5 py-1.5 ring-1 ${className}`;
  if (!href) return <span aria-disabled="true" className={`${box} cursor-default bg-white/[0.06] text-white/75 ring-white/20`}><span className="text-[14px] font-semibold leading-tight">{soon ?? label}</span></span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={top ? `${top} App Store` : label}
      className={`${box} bg-black text-white ring-white/25 transition hover:bg-neutral-900`}>
      {top ? <span className="grid text-start leading-tight"><span className="text-[11px] font-medium opacity-85">{top}</span><span className="text-[19px] font-semibold tracking-tight">App Store</span></span>
        : <span className="text-[15px] font-semibold">{label}</span>}
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
