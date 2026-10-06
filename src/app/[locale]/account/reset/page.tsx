import { setRequestLocale } from "next-intl/server";
import ResetForm from "@/components/ResetForm";
import AuthShell from "@/components/AuthShell";

export const dynamic = "force-dynamic";

export default async function ResetPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string }> }) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  return (
    <AuthShell>
      <ResetForm token={token ?? ""} />
    </AuthShell>
  );
}
