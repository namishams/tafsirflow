import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { countSupporters, publicSupporters } from "@/lib/supporters";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/site";
import { ArrowNext, ArrowBack } from "@/components/Icons";
import { PracticeStar } from "@/components/art/PracticeArt";

// Public supporters page (owner 22.10.2026). Fully automatic: a row appears once Ziina itself confirmed the payment
// (return check ?pi= or signed webhook, src/lib/supporters.ts) and the payer chose "Name" or "Name + Firma" at checkout.
// Default is not listed. No amounts; admins hide entries in the admin panel. Voluntary project support, no rewards.
export const revalidate = 300;
const PER = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "supporters" });
  return pageMeta(locale, "/supporters", `${t("pageTitle")} | Quran Masterclass`, t("seoDesc"));
}

export default async function SupportersPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("supporters");
  const lc = await getLocale();
  const total = await countSupporters();
  const pages = Math.max(1, Math.ceil(total / PER));
  const page = Math.min(pages, Math.max(1, Number.parseInt((await searchParams).page || "1", 10) || 1));
  const settings = await getSettings().catch(() => null);
  const list = await publicSupporters(PER, settings?.donation.showTiers === true, (page - 1) * PER);
  const fmt = new Intl.DateTimeFormat(lc, { month: "long", year: "numeric", timeZone: "UTC" });
  const month = (m: string) => { const [y, mo] = m.split("-").map(Number); return y && mo ? fmt.format(new Date(Date.UTC(y, mo - 1, 1))) : ""; };
  const nf = new Intl.NumberFormat(lc);
  return (
    <div className="pb-28 md:pb-16">
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% 18%, rgb(240 200 106 / .18) 0, transparent 42%)" }} />
        <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--gold))] rtl:tracking-normal">{t("eyebrow")}</p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl">{t("pageTitle")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-white/75">{t("thanks")}</p>
          <p className="mt-8 font-display text-5xl text-[rgb(var(--gold))] sm:text-6xl">{nf.format(total)}</p>
          <p className="mt-1 text-sm font-semibold text-white/70">{t("count", { n: total })}</p>
          <Link href="/support" className="btn-gold mt-8 inline-flex h-12 items-center justify-center gap-1.5 rounded-full px-7 text-[15px] font-bold max-sm:w-full">{t("cta")} <ArrowNext /></Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-10">
        {page === 1 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {[{ name: "Nami Shams", role: t("founder") }, { name: "ICSL FZE, Sharjah", role: t("operator") }].map((p) => (
              <li key={p.name} className="flex items-center gap-3 rounded-xl border border-[rgb(var(--gold))]/40 bg-[rgb(var(--gold))]/[0.06] px-4 py-3">
                <PracticeStar size={12} />
                <span className="min-w-0"><span className="block font-bold">{p.name}</span><span className="block text-xs font-semibold uppercase tracking-[0.12em] text-gold rtl:tracking-normal">{p.role}</span></span>
              </li>
            ))}
          </ul>
        )}
        {list.length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s, i) => (
              <li key={`${page}-${i}`} className="pa-card flex items-start gap-3 px-4 py-4">
                <span aria-hidden className="mt-1 h-2 w-2 shrink-0 rotate-45 bg-[rgb(var(--gold))]" />
                <span className="min-w-0">
                  <span className="block break-words font-semibold" dir="auto">{[s.name, s.company].filter(Boolean).join(" · ")}</span>
                  <span className="mt-0.5 block text-xs text-muted">{month(s.month)}{s.tier ? ` · ${t(`tier${s.tier}`)}` : ""}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-6 text-center text-sm text-muted">{t("empty")}</p>}

        {pages > 1 && (
          <nav aria-label={t("pagination")} className="mt-8 flex items-center justify-center gap-3 text-sm font-semibold">
            {page > 1 ? <Link href={`/supporters?page=${page - 1}`} className="inline-flex h-10 items-center gap-1 rounded-full border border-line px-4 hover:border-[rgb(var(--gold))]"><ArrowBack /> {t("prev")}</Link> : <span className="w-[88px]" />}
            <span className="text-muted">{t("pageOf", { page, pages })}</span>
            {page < pages ? <Link href={`/supporters?page=${page + 1}`} className="inline-flex h-10 items-center gap-1 rounded-full border border-line px-4 hover:border-[rgb(var(--gold))]">{t("next")} <ArrowNext /></Link> : <span className="w-[88px]" />}
          </nav>
        )}
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted">{t("pageNote")}</p>
      </section>
    </div>
  );
}
