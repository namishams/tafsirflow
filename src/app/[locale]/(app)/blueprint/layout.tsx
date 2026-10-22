import type { ReactNode } from "react";
import ClientMessages from "@/i18n/ClientMessages";

// only the texts this part of the site reads in the browser (src/i18n/ClientMessages.tsx, scripts/intl-namespaces.mjs);
// the Blueprint texts themselves are rendered on the server (src/lib/blueprint)
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ClientMessages route="blueprint" locale={locale}>{children}</ClientMessages>;
}
