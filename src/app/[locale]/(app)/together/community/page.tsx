import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import TogetherWeb from "@/components/together/TogetherWeb";
import { sijillText } from "@/lib/sijillWeb";
import { togetherText } from "@/lib/togetherWeb";

// /together/community – community goals per country and worldwide, best learners (opt-in).
// Signed in, 16+ with a talent profile; not indexed. Same endpoints and texts as the app (mobile/src/app/together).
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TogetherWeb view="community" t={togetherText(locale)} sx={sijillText(locale)} locale={locale} />;
}
