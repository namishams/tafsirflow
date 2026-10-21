import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import VerifyHero from "./Hero";
import VerifyForm from "./VerifyForm";
import { verifyText } from "./texts";

// /verify – enter the code printed on a certificate (the QR on the certificate opens /verify/<code> directly)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = verifyText(locale);
  return pageMeta(locale, "/verify", t.seoTitle, t.seoDesc);
}

export default async function VerifyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = verifyText(locale);
  return (
    <div>
      <VerifyHero kicker={t.kicker} title={t.title} lead={t.lead}>
        <VerifyForm label={t.codeLabel} placeholder={t.codePlaceholder} button={t.check} invalid={t.invalidCode} />
      </VerifyHero>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-sm leading-relaxed text-[rgb(var(--muted))]">{t.disclaimer}</p>
      </section>
    </div>
  );
}
