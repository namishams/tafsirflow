import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import SiteMenu from "./SiteMenu";
import Logo from "./Logo";

// Two-panel sign-in layout: brand panel (hidden on phones) + form
export default async function AuthShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("account");
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1fr_minmax(420px,520px)]">
      <aside className="hero-bg pattern relative hidden flex-col justify-between p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5"><Logo size={32} /><span className="font-display text-lg font-semibold">Quran Masterclass</span></Link>
        <div>
          <p className="font-arabic text-6xl leading-[1.5] text-[#e9cf99]" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
          <h1 className="mt-8 max-w-md font-display text-4xl font-semibold leading-[1.15]">{t("panelTitle")}</h1>
          <ul className="mt-8 grid gap-3 text-[15px] text-white/80">
            {["b1", "b2", "b3"].map((k) => (
              <li key={k} className="flex items-start gap-3"><span className="mt-2 h-px w-5 shrink-0 bg-[#e9cf99]" />{t(k)}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Quran Masterclass</p>
      </aside>
      <main className="flex flex-col px-5 py-6 sm:px-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 lg:invisible"><Logo size={28} /><span className="font-display text-base font-semibold">Quran Masterclass</span></Link>
          <div className="flex items-center gap-2"><LanguageSwitcher /><SiteMenu /></div>
        </header>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
