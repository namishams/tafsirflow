import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import AuthShell from "@/components/AuthShell";
import PasskeyHandoff from "@/components/auth/PasskeyHandoff";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// /account/passkey – opened by the app in the system sign-in sheet (ASWebAuthenticationSession / Custom Tab):
// ?h=<id> signs in with a passkey for the app, #r=<id>.<secret> adds a passkey to the signed-in app account.
// Without either it is a plain passkey sign-in for the website. Excluded from universal links (api/aasa).
export default async function PasskeyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthShell>
      <PasskeyHandoff />
    </AuthShell>
  );
}
