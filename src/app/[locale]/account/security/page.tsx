import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import SiteFooter from "@/components/SiteFooter";
import RequireAccount from "@/components/RequireAccount";
import SecurityPanel from "@/components/auth/SecurityPanel";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// /account/security – the same screen as in the app (Account → Settings → Security): ways to sign in, passkeys,
// signed-in devices. Same shell as the learning pages ((app)/layout.tsx).
export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("security");
  return (
    <>
      <AppHeader />
      <div className="pb-[4.25rem] lg:pb-0">
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
          <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl">{t("title")}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("lead")}</p>
          <RequireAccount feature={t("title")}><div className="mt-8"><SecurityPanel heading={false} /></div></RequireAccount>
        </main>
        <SiteFooter />
      </div>
      <TabBar />
    </>
  );
}
