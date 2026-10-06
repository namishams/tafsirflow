import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { localeMeta } from "@/i18n/locales";
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;500;600;700&family=Nunito:wght@600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Vazirmatn:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
