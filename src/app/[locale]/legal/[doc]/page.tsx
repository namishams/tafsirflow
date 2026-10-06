import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { pageMeta } from "@/lib/site";

const DOCS = ["privacy", "terms", "imprint"] as const;
type Doc = (typeof DOCS)[number];

export function generateStaticParams() {
  return DOCS.map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; doc: string }> }): Promise<Metadata> {
  const { locale, doc } = await params;
  if (!DOCS.includes(doc as Doc)) return {};
  const t = await getTranslations({ locale, namespace: "legal" });
  return pageMeta(locale, `/legal/${doc}`, `${t(`${doc as Doc}Title`)} | Quran Masterclass`, t(`${doc as Doc}Title`));
}

// Very small markdown subset: "## heading", "**bold**" and blank-line separated paragraphs
function Body({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((block, i) =>
        block.startsWith("## ") ? (
          <h2 key={i} className="mt-8 text-lg font-bold">{block.slice(3)}</h2>
        ) : (
          <p key={i} className="mt-3 leading-relaxed text-muted" dangerouslySetInnerHTML={{ __html: block.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink">$1</strong>') }} />
        ),
      )}
    </>
  );
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; doc: string }> }) {
  const { locale, doc } = await params;
  setRequestLocale(locale);
  if (!DOCS.includes(doc as Doc)) notFound();
  const t = await getTranslations("legal");
  const d = doc as Doc;
  const e = process.env;
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5"><Logo size={28} /><span className="text-[15px] font-extrabold tracking-tight">Quran Masterclass</span></Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10">
        <h1 className="font-display text-4xl leading-tight">{t(`${d}Title`)}</h1>
        {d !== "imprint" ? (
          <>
            <p className="mt-2 text-sm text-muted">{t("updated")}</p>
            <Body text={t(`${d}Body`)} />
          </>
        ) : (
          <div className="mt-6 grid gap-6">
            <section>
              <h2 className="text-lg font-bold">{t("imprintProvider")}</h2>
              <p className="mt-2 whitespace-pre-line text-muted">{e.LEGAL_NAME ? `${e.LEGAL_NAME}\n${e.LEGAL_ADDRESS ?? ""}` : t("imprintPending")}</p>
            </section>
            <section>
              <h2 className="text-lg font-bold">{t("imprintContact")}</h2>
              <p className="mt-2 text-muted">{e.LEGAL_EMAIL ?? "contact@namishams.com"}{e.LEGAL_PHONE ? ` · ${e.LEGAL_PHONE}` : ""}</p>
            </section>
          </div>
        )}
        <p className="mt-12"><Link href="/" className="text-sm font-semibold text-accent">← {t("back")}</Link></p>
      </main>
    </div>
  );
}
