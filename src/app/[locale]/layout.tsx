import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { localeMeta } from "@/i18n/locales";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/nunito";
import "@fontsource-variable/vazirmatn";
import "@fontsource-variable/noto-sans-sc";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "../globals.css";

export const metadata: Metadata = { title: "TafsirFlow", description: "Quran verse by verse with tafsir" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b7a5a" };

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
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
