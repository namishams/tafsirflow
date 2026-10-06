import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import ShamsPlanner from "@/components/ShamsPlanner";
import { abs, pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shams" });
  return pageMeta(locale, "/shams", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

const STEPS = [1, 2, 3, 4, 5, 6, 7];
const PRINCIPLES = [2, 8, 1, 3, 4, 5, 6, 7];
const FAQ = [1, 2, 3, 4];

export default async function ShamsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shams");
  const ld = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t("pageTitle"),
    description: t("pageLead"),
    author: { "@type": "Person", name: "Nami Shams" },
    url: abs(`/${locale}/shams`),
    step: STEPS.map((n) => ({ "@type": "HowToStep", position: n, name: t(`s${n}`), text: t(`d${n}`) })),
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((n) => ({ "@type": "Question", name: t(`fq${n}`), acceptedAnswer: { "@type": "Answer", text: t(`fa${n}`) } })),
  };
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
      <JsonLd data={ld} />
      <JsonLd data={faqLd} />
      <p className="eyebrow">{t("pageBy")}</p>
      <h1 className="font-display mt-3 text-[40px] leading-[1.05] sm:text-6xl">{t("pageTitle")}</h1>
      <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">{t("pageLead")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/surah/1?shams=1" className="inline-flex h-12 items-center rounded-md bg-ink px-6 text-[15px] font-bold text-bg hover:opacity-90">{t("cta")}</Link>
        <Link href="/quran" className="inline-flex h-12 items-center rounded-md border border-line px-6 text-[15px] font-bold hover:border-ink">{t("cta2")}</Link>
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-bold">{t("stepsTitle")}</h2>
        <ol className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line">
          {STEPS.map((n) => (
            <li key={n} className="flex gap-4 bg-surface p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ink text-sm font-extrabold text-bg">{n}</span>
              <div>
                <h3 className="text-[17px] font-bold">{t(`s${n}`)}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{t(`d${n}`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold">{t("dayTitle")}</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{t("dayLead")}</p>
        <ol className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="bg-surface p-5">
              <p className="text-sm font-extrabold text-gold tabular-nums">{n}</p>
              <h3 className="mt-1 text-[16px] font-bold">{t(`day${n}t`)}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-muted">{t(`day${n}d`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold">{t("howTitle")}</h2>
        <p className="mt-2 text-[15px] text-muted">{t("howLead")}</p>
        <ul className="mt-4 grid gap-2 text-[15px]">{["how1", "how2", "how3"].map((k) => <li key={k} className="flex gap-3"><span className="mt-2.5 h-px w-4 shrink-0 bg-gold" />{t(k)}</li>)}</ul>
        <p className="mt-3 text-sm text-muted">{t("howNote")}</p>
        <h3 className="mt-8 text-lg font-bold">{t("planTitle")}</h3>
        <div className="mt-3"><ShamsPlanner /></div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold">{t("newTitle")}</h2>
        <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-muted">{t("newP1")}</p>
        <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-muted">{t("newP2")}</p>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold">{t("why")}</h2>
        <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {PRINCIPLES.map((n) => (
            <div key={n} className="bg-surface p-5">
              <h3 className="text-[15px] font-bold">{t(`p${n}t`)}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-muted">{t(`p${n}d`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold">{t("faqTitle")}</h2>
        <div className="mt-4 divide-y divide-line rounded-lg border border-line bg-surface">
          {FAQ.map((n) => (
            <details key={n} className="group p-5">
              <summary className="cursor-pointer list-none text-[16px] font-bold">{t(`fq${n}`)}</summary>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{t(`fa${n}`)}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-10 rounded-lg border border-line border-s-4 border-s-gold bg-surface p-4 text-sm leading-relaxed text-muted">{t("note")}</p>
    </main>
  );
}
