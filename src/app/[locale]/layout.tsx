import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { localeMeta } from "@/i18n/locales";
import { SITE } from "@/lib/site";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/noto-sans-arabic";
import "@fontsource-variable/noto-sans-bengali";
import "@fontsource-variable/nunito";
import "@fontsource-variable/vazirmatn";
import "@fontsource-variable/noto-sans-sc";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "@fontsource/aref-ruqaa/arabic-700.css";
import "@fontsource/reem-kufi/arabic-600.css";
import { RadioProvider } from "@/components/RadioProvider";
import ScrollReveal from "@/components/ScrollReveal";
import Pwa from "@/components/Pwa";
import SideCalligraphy from "@/components/SideCalligraphy";
import Rewards from "@/components/Rewards";
import StageLight from "@/components/StageLight";
import Announcement from "@/components/Announcement";
import "../globals.css";

// default title/description for pages without their own metadata (account, lessons, profile): in the visitor's language
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const metadataBase = new URL(SITE); // share images (og:image) as full https://quranmasterclass.com/... addresses
  if (!hasLocale(routing.locales, locale)) return { metadataBase, title: "Quran Masterclass" };
  const t = await getTranslations({ locale, namespace: "seo" });
  return { metadataBase, title: "Quran Masterclass", description: t("homeDesc", { n: routing.locales.length }) };
}
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#08261d" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale} dir={localeMeta(locale).dir}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('tf:kids')==='1')document.documentElement.dataset.kids='1'}catch(e){}" }} />
      </head>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}><RadioProvider><Announcement />{children}<ScrollReveal /><Pwa /><Rewards /><StageLight /></RadioProvider></NextIntlClientProvider>
        <SideCalligraphy />
      </body>
    </html>
  );
}
