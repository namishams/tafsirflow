import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import Markdown from "@/components/Markdown";
import { COUNTRIES_DE, RECITER_BIOS, STYLE, bioText, reciterBio } from "@/lib/reciters";
import { abs, pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return RECITER_BIOS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const r = reciterBio(slug);
  if (!r) return {};
  return pageMeta(locale, `/reciters/${slug}`, `${r.name} – ${locale === "de" ? "Biografie" : "Biography"} | Quran Masterclass`, bioText(r, locale).short);
}

export default async function ReciterPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const r = reciterBio(slug);
  if (!r) notFound();
  const t = bioText(r, locale);
  const de = locale === "de";
  const i = RECITER_BIOS.indexOf(r);
  const prev = RECITER_BIOS[i - 1], next = RECITER_BIOS[i + 1];
  const ld = { "@context": "https://schema.org", "@type": "Person", name: r.name, alternateName: r.arabic, nationality: r.country, ...(r.born ? { birthDate: r.born } : {}), ...(r.died ? { deathDate: r.died } : {}), description: t.short, url: abs(`/${locale}/reciters/${slug}`) };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage relative overflow-hidden text-[#eef0f3]">
        <p aria-hidden className="font-arabic pointer-events-none absolute -end-4 top-2 select-none text-[110px] leading-none text-[rgb(var(--gold))] opacity-[0.08] sm:text-[170px]" dir="rtl">{r.arabic}</p>
        <div className="relative mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <Link href="/reciters" className="text-sm font-semibold text-white/60 hover:text-white">← {de ? "Alle Rezitatoren" : "All reciters"}</Link>
          <h1 className="font-display mt-6 text-[40px] leading-[1.05] sm:text-6xl">{r.name}</h1>
          <p className="font-arabic mt-2 text-3xl text-[rgb(var(--gold))]" dir="rtl">{r.arabic}</p>
          <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-white/75">{t.short}</p>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div><dt className="text-white/50">{de ? "Land" : "Country"}</dt><dd className="font-semibold">{de ? COUNTRIES_DE[r.country] ?? r.country : r.country}</dd></div>
            {(r.born || r.died) && <div><dt className="text-white/50">{de ? "Lebensdaten" : "Life"}</dt><dd className="font-semibold">{r.born ?? "?"}{r.died ? ` – ${r.died}` : ""}</dd></div>}
            <div><dt className="text-white/50">{de ? "Stil" : "Style"}</dt><dd className="font-semibold">{r.styles.map((s) => STYLE[s][de ? "de" : "en"]).join(" · ")}</dd></div>
          </dl>
          {r.playerSlug && <Link href={`/surah/1?reciter=${r.playerSlug}`} className="btn-gold mt-8 inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">▶ {de ? "Im Player anhören" : "Listen in the player"}</Link>}
        </div>
      </section>
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 lg:grid-cols-[1fr_260px] [&>*]:min-w-0">
        <article className="[&>div>h2:first-child]:mt-0"><Markdown text={t.body} /></article>
        <aside>
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{de ? "Bekannt für" : "Known for"}</p>
            <ul className="mt-3 grid gap-2 text-sm">{t.knownFor.map((k) => <li key={k} className="flex gap-2"><span className="text-gold">★</span>{k}</li>)}</ul>
          </div>
          <div className="mt-4 rounded-lg border border-line bg-surface p-5 text-sm">
            <p className="font-bold">{de ? "Selbst rezitieren lernen" : "Learn to recite yourself"}</p>
            <p className="mt-1 text-muted">{de ? "Von den ersten Buchstaben bis zur Idschaza – Schritt für Schritt." : "From the first letters to the ijazah – step by step."}</p>
            <Link href="/islam/reciter-path" className="mt-3 inline-block font-semibold text-accent hover:underline">{de ? "Der Weg zum Rezitator →" : "The path to becoming a reciter →"}</Link>
          </div>
        </aside>
      </div>
      <nav className="mx-auto grid max-w-5xl gap-3 px-5 pb-16 sm:grid-cols-2">
        {prev ? <Link href={`/reciters/${prev.slug}`} className="rounded-lg border border-line bg-surface p-4 hover:border-ink"><span className="text-xs text-muted">←</span><span className="mt-1 block font-bold">{prev.name}</span></Link> : <span />}
        {next && <Link href={`/reciters/${next.slug}`} className="rounded-lg border border-line bg-surface p-4 text-end hover:border-ink"><span className="text-xs text-muted">→</span><span className="mt-1 block font-bold">{next.name}</span></Link>}
      </nav>
    </div>
  );
}
