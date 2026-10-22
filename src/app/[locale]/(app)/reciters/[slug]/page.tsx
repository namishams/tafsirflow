import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import Markdown from "@/components/Markdown";
import { COUNTRIES_AR, COUNTRIES_DE, RECITER_BIOS, STYLE, bioText, loadBioTexts, reciterBio } from "@/lib/reciters";
import type { AppLocale } from "@/i18n/locales";
import { abs, pageMeta } from "@/lib/site";
import { ArrowNext, ArrowBack } from "@/components/Icons";
import { CalligraphyDraw } from "@/components/Ornaments";
import { QuranSeal } from "@/components/art/QuranArt";
import { starByReciter } from "@/lib/stars";
import { starLinksText } from "@/lib/starLinksText";
import { appStoreUrl } from "@/lib/appstore";

type Labels = { all: string; country: string; life: string; style: string; listen: string; known: string; learn: string; learnBody: string; path: string; bio: string };
const LBL: Record<AppLocale, Labels> = {
  de: { all: "Alle Rezitatoren", country: "Land", life: "Lebensdaten", style: "Stil", listen: "Im Player anhören", known: "Bekannt für", learn: "Selbst rezitieren lernen", learnBody: "Von den ersten Buchstaben bis zur Idschaza – Schritt für Schritt.", path: "Der Weg zum Rezitator", bio: "Biografie" },
  en: { all: "All reciters", country: "Country", life: "Life", style: "Style", listen: "Listen in the player", known: "Known for", learn: "Learn to recite yourself", learnBody: "From the first letters to the ijazah – step by step.", path: "The path to becoming a reciter", bio: "Biography" },
  ar: { all: "جميع القرّاء", country: "البلد", life: "الحياة", style: "الأسلوب", listen: "استمع في المشغّل", known: "اشتُهر بـ", learn: "تعلّم التلاوة بنفسك", learnBody: "من الحروف الأولى حتى الإجازة – خطوةً خطوة.", path: "الطريق إلى أن تصبح قارئًا", bio: "السيرة" },
  tr: { all: "Tüm kâriler", country: "Ülke", life: "Yaşam yılları", style: "Üslup", listen: "Oynatıcıda dinleyin", known: "Neyle tanınır", learn: "Kendiniz okumayı öğrenin", learnBody: "İlk harflerden icazete kadar – adım adım.", path: "Kâri olma yolu", bio: "Biyografi" },
  ur: { all: "تمام قرّاء", country: "ملک", life: "زندگی", style: "اسلوب", listen: "پلیئر میں سنیں", known: "وجۂ شہرت", learn: "خود تلاوت کرنا سیکھیں", learnBody: "پہلے حروف سے لے کر اجازہ تک – قدم بہ قدم۔", path: "قاری بننے کا راستہ", bio: "سوانح" },
  fa: { all: "همه قاریان", country: "کشور", life: "سال‌های زندگی", style: "سبک", listen: "شنیدن در پخش‌کننده", known: "شناخته‌شده برای", learn: "خودتان تلاوت را بیاموزید", learnBody: "از نخستین حروف تا اجازه – گام‌به‌گام.", path: "راه قاری شدن", bio: "زندگی‌نامه" },
  ps: { all: "ټول قاریان", country: "هېواد", life: "د ژوند کلونه", style: "سبک", listen: "په پلیر کې واورئ", known: "په څه مشهور دی", learn: "پخپله تلاوت زده کړئ", learnBody: "له لومړیو توریو تر اجازې پورې – ګام په ګام.", path: "د قاري کېدو لار", bio: "ژوندلیک" },
  fr: { all: "Tous les récitateurs", country: "Pays", life: "Dates de vie", style: "Style", listen: "Écouter dans le lecteur", known: "Connu pour", learn: "Apprendre à réciter soi-même", learnBody: "Des premières lettres à l'ijaza – pas à pas.", path: "Le chemin pour devenir récitateur", bio: "Biographie" },
  es: { all: "Todos los recitadores", country: "País", life: "Vida", style: "Estilo", listen: "Escuchar en el reproductor", known: "Conocido por", learn: "Aprenda a recitar usted mismo", learnBody: "De las primeras letras a la iyaza, paso a paso.", path: "El camino para ser recitador", bio: "Biografía" },
  id: { all: "Semua qari", country: "Negara", life: "Masa hidup", style: "Gaya", listen: "Dengarkan di pemutar", known: "Dikenal karena", learn: "Belajar membaca Al-Qur'an sendiri", learnBody: "Dari huruf pertama hingga ijazah – selangkah demi selangkah.", path: "Jalan menjadi seorang qari", bio: "Biografi" },
  ms: { all: "Semua qari", country: "Negara", life: "Tahun hayat", style: "Gaya", listen: "Dengar dalam pemain", known: "Terkenal kerana", learn: "Belajar membaca Quran sendiri", learnBody: "Daripada huruf pertama hingga ijazah – langkah demi langkah.", path: "Jalan menjadi seorang qari", bio: "Biografi" },
  bn: { all: "সব ক্বারী", country: "দেশ", life: "জীবনকাল", style: "ধরন", listen: "প্লেয়ারে শুনুন", known: "যে কারণে পরিচিত", learn: "নিজে তিলাওয়াত করতে শিখুন", learnBody: "প্রথম হরফ থেকে ইজাযা পর্যন্ত – ধাপে ধাপে।", path: "ক্বারী হওয়ার পথ", bio: "জীবনী" },
  ru: { all: "Все чтецы", country: "Страна", life: "Годы жизни", style: "Стиль", listen: "Слушать в плеере", known: "Чем известен", learn: "Научитесь читать Коран сами", learnBody: "От первых букв до иджазы – шаг за шагом.", path: "Путь к тому, чтобы стать чтецом", bio: "Биография" },
  zh: { all: "全部诵读家", country: "国家", life: "生卒年", style: "风格", listen: "在播放器中收听", known: "代表成就", learn: "学会自己诵读", learnBody: "从最初的字母到获得传授资格（ijazah）——循序渐进。", path: "成为诵读者之路", bio: "生平" },
};
const labelsOf = (locale: string) => LBL[(locale in LBL ? locale : "en") as AppLocale];

// Style labels: German, English and Arabic come from STYLE (lib/reciters); the technical terms stay as they are in Latin script
type StyleKey = "murattal" | "mujawwad" | "imam" | "teacher";
const STYLE_OTHER: Partial<Record<AppLocale, Record<StyleKey, string>>> = {
  tr: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "İmam", teacher: "Öğretmen" },
  ur: { murattal: STYLE.murattal.ar, mujawwad: STYLE.mujawwad.ar, imam: "امام", teacher: "استاد" },
  fa: { murattal: STYLE.murattal.ar, mujawwad: STYLE.mujawwad.ar, imam: "امام", teacher: "استاد" },
  ps: { murattal: STYLE.murattal.ar, mujawwad: STYLE.mujawwad.ar, imam: "امام", teacher: "ښوونکی" },
  fr: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "Imam", teacher: "Enseignant" },
  es: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "Imán", teacher: "Maestro" },
  id: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "Imam", teacher: "Guru" },
  ms: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "Imam", teacher: "Guru" },
  bn: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "ইমাম", teacher: "শিক্ষক" },
  ru: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "Имам", teacher: "Учитель" },
  zh: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "伊玛目", teacher: "教师" },
};
const styleName = (s: StyleKey, locale: string) => STYLE_OTHER[locale as AppLocale]?.[s] ?? STYLE[s][locale === "de" ? "de" : locale === "ar" ? "ar" : "en"];

// Country names (the data holds English names): German and Arabic from the tables of lib/reciters, every other language from Intl.DisplayNames
const REGION: Record<string, string> = { Egypt: "EG", "Saudi Arabia": "SA", Kuwait: "KW", "United Arab Emirates": "AE", Yemen: "YE", Sudan: "SD", Somalia: "SO", Iraq: "IQ", Libya: "LY", Morocco: "MA", Qatar: "QA", Bahrain: "BH", Oman: "OM", Jordan: "JO", Syria: "SY", Pakistan: "PK", Indonesia: "ID", Algeria: "DZ", Tunisia: "TN", Palestine: "PS", Lebanon: "LB", Turkey: "TR", Malaysia: "MY", India: "IN", Bangladesh: "BD", Iran: "IR", Afghanistan: "AF", Nigeria: "NG" };
function countryName(country: string, locale: string) {
  if (locale === "en") return country;
  if (locale === "de") return COUNTRIES_DE[country] ?? country;
  if (locale === "ar") return COUNTRIES_AR[country] ?? country;
  const code = REGION[country];
  if (!code) return country;
  try { return new Intl.DisplayNames(locale, { type: "region" }).of(code) ?? country; } catch { return country; }
}

export function generateStaticParams() {
  return RECITER_BIOS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const r = reciterBio(slug);
  if (!r) return {};
  return pageMeta(locale, `/reciters/${slug}`, `${locale === "ar" ? r.arabic : r.name} – ${labelsOf(locale).bio} | Quran Masterclass`, bioText(r, locale, await loadBioTexts(locale)).short);
}

export default async function ReciterPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const r = reciterBio(slug);
  if (!r) notFound();
  const t = bioText(r, locale, await loadBioTexts(locale));
  const ar = locale === "ar";
  const L = labelsOf(locale);
  const i = RECITER_BIOS.indexOf(r);
  const prev = RECITER_BIOS[i - 1], next = RECITER_BIOS[i + 1];
  const initials = ar ? r.arabic.split(/\s+/).filter((w) => !["أبو", "عبد", "ابن"].includes(w)).slice(0, 2).map((w) => w[0]).join("") : r.name.split(/[\s-]+/).filter((w) => /^[A-Z]/.test(w) && !["Al", "Ash", "As", "Ar", "Ad", "At", "Az", "An", "Abu"].includes(w)).slice(0, 2).map((w) => w[0]).join("");
  const star = starByReciter(slug);
  const sl = starLinksText(locale);
  const app = appStoreUrl();
  // surahs often listened to, linked into the player with this reciter where he is in the player
  const surahs: [number, string][] = [[1, "Al-Fatiha"], [18, "Al-Kahf"], [36, "Ya-Sin"], [55, "Ar-Rahman"], [67, "Al-Mulk"]];
  const ld = [
    { "@context": "https://schema.org", "@type": "Person", name: r.name, alternateName: r.arabic, nationality: r.country, ...(r.born ? { birthDate: r.born } : {}), ...(r.died ? { deathDate: r.died } : {}), description: t.short, url: abs(`/${locale}/reciters/${slug}`), knowsAbout: "Quran recitation" },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Quran Masterclass", item: abs(`/${locale}`) },
      { "@type": "ListItem", position: 2, name: L.all, item: abs(`/${locale}/reciters`) },
      { "@type": "ListItem", position: 3, name: ar ? r.arabic : r.name, item: abs(`/${locale}/reciters/${slug}`) },
    ] },
  ];
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <CalligraphyDraw text={r.arabic} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <Link href="/reciters" className="text-sm font-semibold text-white/60 hover:text-white"><ArrowBack /> {L.all}</Link>
          {ar ? <h1 className="font-arabic mt-6 text-[44px] leading-[1.3] sm:text-6xl" dir="rtl">{r.arabic}</h1> : <>
          <h1 className="font-display mt-6 text-[40px] leading-[1.05] sm:text-6xl">{r.name}</h1>
          <p className="font-arabic mt-2 text-3xl text-[rgb(var(--gold))]" dir="rtl">{r.arabic}</p></>}
          <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-white/75">{t.short}</p>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div><dt className="text-white/50">{L.country}</dt><dd className="font-semibold">{countryName(r.country, locale)}</dd></div>
            {(r.born || r.died) && <div><dt className="text-white/50">{L.life}</dt><dd className="font-semibold">{r.born ?? "?"}{r.died ? ` – ${r.died}` : ""}</dd></div>}
            <div><dt className="text-white/50">{L.style}</dt><dd className="font-semibold">{r.styles.map((s) => styleName(s, locale)).join(" · ")}</dd></div>
          </dl>
          {r.playerSlug && <Link href={`/surah/1?reciter=${r.playerSlug}`} className="btn-gold mt-8 inline-flex h-12 items-center gap-2 rounded-md px-6 text-[15px] font-bold"><svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>{L.listen}</Link>}
          {star ? <Link href={`/talents/${star.username}`} className={`${r.playerSlug ? "ms-3 " : ""}mt-8 inline-flex h-12 items-center gap-2 rounded-md border border-white/30 px-5 text-[15px] font-semibold hover:bg-white/10`}>@{star.username} · {sl.starProfile}</Link> : null}
        </div>
        <span aria-hidden className="q-arcade opacity-70" />
      </section>
      <div className="q-page"><div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 lg:grid-cols-[1fr_260px] [&>*]:min-w-0">
        <article className="[&>div>h2:first-child]:mt-0"><Markdown text={t.body} /></article>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="callout overflow-hidden rounded-xl p-5">
            <div className="flex items-center gap-3">
              <QuranSeal className="!h-12 !w-12">{initials}</QuranSeal>
              <p className="q-kicker text-[rgb(var(--q-ink-gold))]">{L.known}</p>
            </div>
            <ul className="q-known mt-4 grid gap-2.5 text-sm leading-relaxed">{t.knownFor.map((k) => <li key={k}>{k}</li>)}</ul>
          </div>
          <Link href="/islam/reciter-path" className="q-tile mt-4 block p-5 text-sm">
            <p className="font-bold">{L.learn}</p>
            <p className="mt-1 text-muted">{L.learnBody}</p>
            <p className="mt-3 font-semibold text-accent">{L.path} <ArrowNext /></p>
          </Link>
          {/* the same app block for every reciter (owner 22.10.2026) */}
          <div className="q-tile mt-4 p-5 text-sm">
            <p className="font-bold">{sl.inApp}</p>
            <p className="mt-1 leading-relaxed text-muted">{sl.inAppText}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={app} {...(app.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="btn-gold inline-flex h-10 items-center rounded-full px-4 text-[13.5px] font-bold">{sl.getApp}</a>
              {star ? <Link href={`/talents/${star.username}`} className="inline-flex h-10 items-center rounded-full border border-line px-4 text-[13.5px] font-semibold hover:bg-bg">{sl.starProfile}</Link> : null}
            </div>
          </div>
          <div className="q-tile mt-4 p-5 text-sm">
            <ul className="grid gap-1.5">
              {surahs.map(([n, name]) => <li key={n}><Link href={r.playerSlug ? `/surah/${n}?reciter=${r.playerSlug}` : `/surah/${n}`} className="font-semibold text-accent hover:underline">{`${n}. ${name}`}</Link></li>)}
              <li className="mt-1 border-t border-line pt-2"><Link href="/shams/method" className="font-semibold text-accent hover:underline">{sl.shams} <ArrowNext /></Link></li>
            </ul>
          </div>
        </aside>
      </div>
      <nav className="mx-auto grid max-w-5xl gap-3 px-5 pb-16 sm:grid-cols-2">
        {prev ? <Link href={`/reciters/${prev.slug}`} className="q-tile flex items-center gap-3 p-4"><span className="text-[rgb(var(--gold))]"><ArrowBack /></span><span className="min-w-0"><span className={ar ? "font-callig block truncate text-[19px] leading-[1.5]" : "block truncate font-bold"}>{ar ? prev.arabic : prev.name}</span>{!ar && <span className="font-callig block truncate text-[16px] leading-[1.5] text-[rgb(var(--q-ink-gold))]" dir="rtl" lang="ar">{prev.arabic}</span>}</span></Link> : <span />}
        {next && <Link href={`/reciters/${next.slug}`} className="q-tile flex items-center justify-end gap-3 p-4 text-end"><span className="min-w-0"><span className={ar ? "font-callig block truncate text-[19px] leading-[1.5]" : "block truncate font-bold"}>{ar ? next.arabic : next.name}</span>{!ar && <span className="font-callig block truncate text-[16px] leading-[1.5] text-[rgb(var(--q-ink-gold))]" dir="rtl" lang="ar">{next.arabic}</span>}</span><span className="text-[rgb(var(--gold))]"><ArrowNext /></span></Link>}
      </nav></div>
    </div>
  );
}
