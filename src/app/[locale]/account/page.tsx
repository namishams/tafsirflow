import { setRequestLocale } from "next-intl/server";
import AccountForm from "@/components/AccountForm";
import AuthShell from "@/components/AuthShell";
import AccountDashboard from "@/components/account/AccountDashboard";
import RefreshOnAuth from "@/components/account/RefreshOnAuth";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Signed in: the member dashboard, rendered on the server with the account's name so nothing is blank while the cards
// load. Signed out: the sign-in form. ?demo=1 shows the dashboard with sample data, only outside production.
export default async function AccountPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const qs = await searchParams;
  const demo = process.env.NODE_ENV !== "production" && qs.demo === "1";
  const me = demo ? null : await currentUser();
  if (demo) return <AccountDashboard demo user={{ name: "Amina Karimi", email: "amina@example.com", emailVerified: true, role: "user", plan: "premium" }} />;
  if (me) return <AccountDashboard user={{ name: me.name, email: me.email, emailVerified: me.emailVerified, role: me.role, plan: me.plan }} verifiedNow={!!qs.verified} />;
  return (
    <AuthShell>
      <RefreshOnAuth />
      <AccountForm />
    </AuthShell>
  );
}
