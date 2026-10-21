import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import AdminUsers from "@/components/AdminUsers";

// /admin/users – accounts and plans (admins only, checked by every API call)
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Accounts", robots: { index: false, follow: false } };

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminUsers locale={locale} />;
}
