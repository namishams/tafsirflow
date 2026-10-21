import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { organizationLd } from "@/lib/company";
import { appStoreUrl } from "@/lib/appstore";
import { mc } from "@/lib/masterclass";
import { HomeCorners, HomeStar, StarGlyph } from "@/components/art/HomeOrnaments";
import { Seal } from "@/components/PremiumPanel";
import { Ink } from "@/components/Ornaments";
import { McHead } from "@/components/masterclass/Sections";
import { postingEnabled } from "@/lib/talentPosting";

// Landing page of the Quran Masterclass Talents network: verified reciter profiles, the four levels and the path to
// posting (16+, level, verification; Pro only where required, see src/lib/talentPosting.ts). The network itself lives in the app (API: src/app/api/community/*);
// public profile pages on the website come later under /talents/[username].
export const dynamic = "force-dynamic"; // APP_STORE_URL is read from the server environment at request time

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = mc(locale).talents;
  return pageMeta(locale, "/talents", c.metaTitle, c.metaDesc);
}

export default async function TalentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const all = mc(locale);
  const c = all.talents;
  const ar = locale === "ar";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      organizationLd(abs),
      { "@type": "WebPage", "@id": abs(`/${locale}/talents`), url: abs(`/${locale}/talents`), name: c.metaTitle, description: c.metaDesc, inLanguage: locale, isPartOf: { "@id": abs("/#site") }, publisher: { "@id": abs("/#org") } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Quran Masterclass", item: abs(`/${locale}`) },
        { "@type": "ListItem", position: 2, name: c.kicker, item: abs(`/${locale}/talents`) },
      ] },
    ],
  };

  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgb(var(--gold) / .15) 0, transparent 42%)" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="rise hm-k flex items-center gap-2 text-[rgb(var(--gold))]"><StarGlyph size={9} />{c.kicker}</p>
            <h1 className="rise font-display mt-5 text-[42px] leading-[1.04] sm:text-6xl" style={{ animationDelay: "120ms" }}>
              {!ar && <span aria-hidden className="font-callig gold-sheen mb-2 block w-fit text-[32px] leading-snug sm:text-[40px]" dir="rtl"><Ink>أهل القرآن</Ink></span>}
              {c.title}
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/70">{c.lead}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={appStoreUrl()} rel="noopener" className="btn-gold inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{c.cta}</a>
              <Link href="/app" className="inline-flex h-12 items-center rounded-md border border-[rgb(var(--gold))]/40 px-6 text-[15px] font-bold transition hover:border-[rgb(var(--gold))] hover:bg-white/[0.04]">{c.ctaApp}</Link>
            </div>
          </div>
          {/* an illustrative profile card (no real person): shows what a verified profile holds */}
          <figure aria-hidden className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white/[0.045] p-7 ring-1 ring-[rgb(var(--gold))]/25">
            <span className="illum-frame" />
            <div className="relative flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[rgb(var(--gold))]/15 ring-1 ring-[rgb(var(--gold))]/50"><HomeStar size={40} tone="gold" /></span>
              <div className="min-w-0 flex-1">
                <span className="block h-3 w-32 rounded-full bg-white/25" />
                <span className="mt-2 block h-2.5 w-20 rounded-full bg-white/12" />
              </div>
              <Seal size={34} />
            </div>
            <dl className="relative mt-6 grid gap-3 border-t border-[rgb(var(--gold))]/20 pt-5 text-[13px]">
              {(ar ? [["المستوى", c.levels[2][0]], ["الرواية", "حفص عن عاصم"], ["سند الإجازة", "موثَّق"]] : locale === "de" ? [["Stufe", c.levels[2][0]], ["Rewaya", "Hafs ʿan ʿAsim"], ["Idschaza-Kette", "Geprüft"]] : [["Level", c.levels[2][0]], ["Rewaya", "Hafs ʿan ʿAsim"], ["Ijazah chain", "Verified"]]).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4"><dt className="text-white/50">{k}</dt><dd className="font-semibold text-white/85">{v}</dd></div>
              ))}
            </dl>
          </figure>
        </div>
      </section>

      {/* four levels */}
      <section className="hm-warm">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <McHead locale={locale} title={c.levelsTitle} word="مراتب" />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.levels.map(([t, d], i) => (
              <li key={t} className="hm-card p-6">
                <HomeCorners />
                <HomeStar size={46} tone={i === 3 ? "gold" : "light"}>{i + 1}</HomeStar>
                <h3 className="font-display mt-4 text-2xl">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* the path to posting (only while posting is switched on, config.json) */}
      {postingEnabled() ? <section className="relative">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <McHead locale={locale} title={c.pathTitle} word="الطريق" />
          <ol className="grid gap-0">
            {c.steps.map(([t, d], i) => (
              <li key={t} className="flex gap-5 border-t border-[rgb(var(--hm-gold))]/25 py-6 first:border-t-0 first:pt-0">
                <HomeStar size={48} tone={i === c.steps.length - 1 ? "gold" : "light"} className="shrink-0">{i + 1}</HomeStar>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">{t}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section> : null}

      {/* safety */}
      <section className="hm-warm">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <McHead locale={locale} title={c.safetyTitle} />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {c.safety.map((s) => <li key={s} className="flex gap-3 text-[16px]"><StarGlyph size={11} className="mt-1.5 shrink-0 text-[rgb(var(--hm-gold))]" />{s}</li>)}
          </ul>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/masterclass#reciter-path" className="inline-flex h-11 items-center rounded-md border border-[rgb(var(--hm-gold))]/60 px-5 text-sm font-bold transition hover:border-[rgb(var(--hm-gold))] hover:bg-[rgb(var(--hm-gold))]/10">{all.pillars.path.t} <span aria-hidden className="ms-2 rtl:-scale-x-100">→</span></Link>
            <Link href="/premium" className="inline-flex h-11 items-center rounded-md border border-[rgb(var(--hm-gold))]/60 px-5 text-sm font-bold transition hover:border-[rgb(var(--hm-gold))] hover:bg-[rgb(var(--hm-gold))]/10">Quran Masterclass Pro <span aria-hidden className="ms-2 rtl:-scale-x-100">→</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
