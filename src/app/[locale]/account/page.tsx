import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AccountForm from "@/components/AccountForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-4">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5"><Logo size={30} /><span className="font-display text-lg font-semibold">TafsirFlow</span></Link>
        <LanguageSwitcher />
      </header>
      <h1 className="mb-4 font-display text-3xl font-semibold">{t("title")}</h1>
      <AccountForm />
      <p className="mt-6 text-center"><Link href="/" className="text-sm font-medium text-accent">← {t("home")}</Link></p>
    </main>
  );
}
