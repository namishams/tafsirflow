import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import VerifyHero from "../Hero";
import { verifyText } from "../texts";
import ReviewQueue from "./ReviewQueue";

// /verify/review – review queue for the highest certificates (admins and verified masters; access checked by the API)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${verifyText(locale).reviewTitle} | Quran Masterclass`, robots: { index: false, follow: false } };
}

export default async function ReviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = verifyText(locale);
  return (
    <div>
      <VerifyHero kicker={t.kicker} title={t.reviewTitle} lead={t.reviewLead} />
      <section className="mx-auto max-w-3xl px-5 py-10"><ReviewQueue t={t} locale={locale} /></section>
    </div>
  );
}
