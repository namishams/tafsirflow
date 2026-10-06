import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import TrustStrip from "./TrustStrip";
import MadeInDubai from "./MadeInDubai";

// Slim footer for all app pages: free, privately funded by Nami Shams, plus the most important links
export default async function AppFooter() {
  const t = await getTranslations("free");
  const n = await getTranslations("nav");
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 pt-8"><TrustStrip details /></div>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl leading-relaxed text-muted"><span className="font-bold text-ink">{t("title")}</span> {t("body")}</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 font-semibold text-muted">
          <Link href="/about" className="hover:text-ink">{n("about")}</Link>
          <Link href="/support" className="hover:text-ink">{n("support")}</Link>
          <Link href="/feedback" className="hover:text-ink">{n("feedback")}</Link>
          <Link href="/legal/privacy" className="hover:text-ink">{t("privacy")}</Link>
          <Link href="/legal/imprint" className="hover:text-ink">{t("imprint")}</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-6 text-xs text-muted"><MadeInDubai /></div>
    </footer>
  );
}
