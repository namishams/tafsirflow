import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Why learning the Quran comes first – Quran and authentic hadith, shown on the home page and the Shams page
export default async function WhyQuran({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "shams" });
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("whyTitle")}</h2>
        <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-muted">{t("whyLead")}</p>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <figure key={n} className={`bg-bg p-6 ${n === 5 ? "md:col-span-2" : ""}`}>
              <blockquote className="text-[17px] leading-relaxed">{t(`why${n}`)}</blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-gold">{t(`why${n}s`)}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-[17px] leading-relaxed">{t("whyClose")}</p>
        <Link href="/academy" className="mt-6 inline-flex h-12 items-center rounded-md bg-ink px-6 text-[15px] font-bold text-bg hover:opacity-90">{t("whyCta")}</Link>
      </div>
    </section>
  );
}
