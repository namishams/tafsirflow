import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { langMeta } from "@/components/learn/arabic-lang/meta";
import { LangCertificateScreen } from "@/components/learn/arabic-lang/Screens";

// /arabic/lang/certificate – the certificates A1–C1 of the language course on this device (not official CEFR
// certificates), each with the verifiable certificate of its level
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = langMeta(locale, "certificate");
  return { ...pageMeta(locale, "/arabic/lang/certificate", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LangCertificateScreen />;
}
