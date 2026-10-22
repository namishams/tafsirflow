import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ContactForm from "@/components/ContactForm";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactForms" });
  return pageMeta(locale, "/suggestions", `${t("sug.title")} | Quran Masterclass`, t("sug.lead"));
}

export default async function SuggestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactForms");
  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-8">
      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))] rtl:tracking-normal">{t("sug.kicker")}</p>
      <h1 className="font-display mt-3 text-[36px] leading-[1.08] sm:text-5xl">{t("sug.title")}</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-muted">{t("sug.lead")}</p>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("sug.note")}</p>
      <Link href="/feedback" className="mt-3 inline-block text-sm font-bold text-accent hover:underline">{t("sug.other")}</Link>
      <ContactForm kind="suggestion" />
    </main>
  );
}
