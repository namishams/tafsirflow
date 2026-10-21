import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import AdminTalents from "@/components/talents/AdminTalents";

// /admin/talents – Quran Talents moderation on the web (admins only, checked by every API call)
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quran Talents · Moderation", robots: { index: false, follow: false } };

export default async function AdminTalentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="font-display text-4xl">Quran Talents · Moderation</h1>
      <AdminTalents locale={locale} />
    </div>
  );
}
