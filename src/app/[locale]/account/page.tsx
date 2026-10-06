import { setRequestLocale } from "next-intl/server";
import AccountForm from "@/components/AccountForm";
import AuthShell from "@/components/AuthShell";

export const dynamic = "force-dynamic";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthShell>
      <AccountForm />
    </AuthShell>
  );
}
