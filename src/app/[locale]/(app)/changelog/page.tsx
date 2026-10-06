import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CHANGELOG } from "@/lib/changelog";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feedback" });
  return pageMeta(locale, "/changelog", `${t("changelog")} | Quran Masterclass`, t("changelogLead"));
}

export default async function ChangelogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("feedback");
  const de = locale === "de";
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl">{t("changelog")}</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-muted">{t("changelogLead")}</p>
      <ol className="relative mt-10 border-s border-line ps-6">
        {CHANGELOG.map((r) => (
          <li key={r.date} className="mb-12">
            <span className="absolute -start-[5px] mt-2 h-2.5 w-2.5 rounded-full bg-accent" />
            <p className="text-sm font-semibold text-gold">{new Date(r.date).toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", day: "numeric", month: "long", year: "numeric" })}</p>
            <h2 className="font-display mt-1 text-2xl leading-tight">{de ? r.title_de : r.title_en}</h2>
            <ul className="mt-3 grid gap-2 text-[15px] leading-relaxed text-muted">{(de ? r.items_de : r.items_en).map((x, i) => <li key={i} className="flex gap-3"><span className="mt-2.5 h-px w-3 shrink-0 bg-gold" />{x}</li>)}</ul>
          </li>
        ))}
      </ol>
      <Link href="/feedback" className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-bold text-bg">{t("wish")}</Link>
    </main>
  );
}
