import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { NahjCertificateScreen } from "@/components/learn/nahj/NahjScreens";

// Nahj al-Balagha on the website: a native page like the app's screen; the text is loaded from the server.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const de = locale === "de";
  return { ...pageMeta(locale, "/nahj-studies/certificate", de ? "Nahjul-Balagha – Zertifikat | Quran Masterclass" : "Nahj al-Balagha – Certificate | Quran Masterclass", de ? "Predigten, Briefe und Aussprüche, die Imam Ali zugeschrieben werden, gesammelt von asch-Scharif ar-Radi: arabisch und übersetzt." : "Sermons, letters and sayings attributed to Imam Ali, compiled by ash-Sharif ar-Radi: Arabic and translation."), robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const p = await params;
  setRequestLocale(p.locale);
  return <NahjCertificateScreen />;
}
