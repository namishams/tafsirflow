import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import Markdown from "@/components/Markdown";
import { COUNTRIES_AR, COUNTRIES_DE, RECITER_BIOS, STYLE, bioText, reciterBio } from "@/lib/reciters";
import { abs, pageMeta } from "@/lib/site";
import { ArrowNext, ArrowBack } from "@/components/Icons";
import { CalligraphyDraw } from "@/components/Ornaments";
import { QuranSeal } from "@/components/art/QuranArt";

const LBL = {
  de: { all: "Alle Rezitatoren", country: "Land", life: "Lebensdaten", style: "Stil", listen: "Im Player anhören", known: "Bekannt für", learn: "Selbst rezitieren lernen", learnBody: "Von den ersten Buchstaben bis zur Idschaza – Schritt für Schritt.", path: "Der Weg zum Rezitator", bio: "Biografie" },
  en: { all: "All reciters", country: "Country", life: "Life", style: "Style", listen: "Listen in the player", known: "Known for", learn: "Learn to recite yourself", learnBody: "From the first letters to the ijazah – step by step.", path: "The path to becoming a reciter", bio: "Biography" },
  ar: { all: "جميع القرّاء", country: "البلد", life: "الحياة", style: "الأسلوب", listen: "استمع في المشغّل", known: "اشتُهر بـ", learn: "تعلّم التلاوة بنفسك", learnBody: "من الحروف الأولى حتى الإجازة – خطوةً خطوة.", path: "الطريق إلى أن تصبح قارئًا", bio: "السيرة" },
};
const langOf = (locale: string) => (locale === "de" ? "de" : locale === "ar" ? "ar" : "en");

export function generateStaticParams() {
  return RECITER_BIOS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const r = reciterBio(slug);
  if (!r) return {};
  return pageMeta(locale, `/reciters/${slug}`, `${locale === "ar" ? r.arabic : r.name} – ${LBL[langOf(locale)].bio} | Quran Masterclass`, bioText(r, locale).short);
}

export default async function ReciterPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const r = reciterBio(slug);
  if (!r) notFound();
  const t = bioText(r, locale);
  const de = locale === "de";
  const ar = locale === "ar";
  const L = LBL[langOf(locale)];
  const i = RECITER_BIOS.indexOf(r);
  const prev = RECITER_BIOS[i - 1], next = RECITER_BIOS[i + 1];
  const initials = ar ? r.arabic.split(/\s+/).filter((w) => !["أبو", "عبد", "ابن"].includes(w)).slice(0, 2).map((w) => w[0]).join("") : r.name.split(/[\s-]+/).filter((w) => /^[A-Z]/.test(w) && !["Al", "Ash", "As", "Ar", "Ad", "At", "Az", "An", "Abu"].includes(w)).slice(0, 2).map((w) => w[0]).join("");
  const ld = { "@context": "https://schema.org", "@type": "Person", name: r.name, alternateName: r.arabic, nationality: r.country, ...(r.born ? { birthDate: r.born } : {}), ...(r.died ? { deathDate: r.died } : {}), description: t.short, url: abs(`/${locale}/reciters/${slug}`) };
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
            <div><dt className="text-white/50">{L.country}</dt><dd className="font-semibold">{de ? COUNTRIES_DE[r.country] ?? r.country : ar ? COUNTRIES_AR[r.country] ?? r.country : r.country}</dd></div>
            {(r.born || r.died) && <div><dt className="text-white/50">{L.life}</dt><dd className="font-semibold">{r.born ?? "?"}{r.died ? ` – ${r.died}` : ""}</dd></div>}
            <div><dt className="text-white/50">{L.style}</dt><dd className="font-semibold">{r.styles.map((s) => STYLE[s][langOf(locale)]).join(" · ")}</dd></div>
          </dl>
          {r.playerSlug && <Link href={`/surah/1?reciter=${r.playerSlug}`} className="btn-gold mt-8 inline-flex h-12 items-center gap-2 rounded-md px-6 text-[15px] font-bold"><svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>{L.listen}</Link>}
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
        </aside>
      </div>
      <nav className="mx-auto grid max-w-5xl gap-3 px-5 pb-16 sm:grid-cols-2">
        {prev ? <Link href={`/reciters/${prev.slug}`} className="q-tile flex items-center gap-3 p-4"><span className="text-[rgb(var(--gold))]"><ArrowBack /></span><span className="min-w-0"><span className={ar ? "font-callig block truncate text-[19px] leading-[1.5]" : "block truncate font-bold"}>{ar ? prev.arabic : prev.name}</span>{!ar && <span className="font-callig block truncate text-[16px] leading-[1.5] text-[rgb(var(--q-ink-gold))]" dir="rtl" lang="ar">{prev.arabic}</span>}</span></Link> : <span />}
        {next && <Link href={`/reciters/${next.slug}`} className="q-tile flex items-center justify-end gap-3 p-4 text-end"><span className="min-w-0"><span className={ar ? "font-callig block truncate text-[19px] leading-[1.5]" : "block truncate font-bold"}>{ar ? next.arabic : next.name}</span>{!ar && <span className="font-callig block truncate text-[16px] leading-[1.5] text-[rgb(var(--q-ink-gold))]" dir="rtl" lang="ar">{next.arabic}</span>}</span><span className="text-[rgb(var(--gold))]"><ArrowNext /></span></Link>}
      </nav></div>
    </div>
  );
}
