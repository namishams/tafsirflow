import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageMeta } from "@/lib/site";
import { COMPANY, founderName } from "@/lib/company";
import { ArrowBack } from "@/components/Icons";
import { messengerText } from "@/lib/messenger/text";
import EmailText, { withEmail } from "@/components/EmailText";

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

// Very small markdown subset: "## heading", "**bold**" and blank-line separated paragraphs.
// A heading line may be followed directly by its first paragraph ("## 1. Title\nText …"): only the first line is the heading.
// (no raw HTML: **bold** becomes <strong>, and the e-mail markers in the texts become click-to-reveal controls)
const para = (text: string, key: string) => (
  <p key={key} className="mt-3 leading-relaxed text-muted">
    {text.split(/\*\*(.+?)\*\*/).map((piece, i) => (i % 2 ? <strong key={i} className="text-ink">{withEmail(piece)}</strong> : <Fragment key={i}>{withEmail(piece)}</Fragment>))}
  </p>
);
function Body({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").flatMap((block, i) => {
        if (!block.startsWith("## ")) return [para(block, `p${i}`)];
        const [head, ...rest] = block.split("\n");
        const body = rest.join("\n").trim();
        return [<h2 key={`h${i}`} className="mt-8 text-lg font-bold">{head.slice(3)}</h2>, ...(body ? [para(body, `p${i}`)] : [])];
      })}
    </>
  );
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; doc: string }> }) {
  const { locale, doc } = await params;
  setRequestLocale(locale);
  if (!DOCS.includes(doc as Doc)) notFound();
  const t = await getTranslations("legal");
  const tc = await getTranslations("company");
  const d = doc as Doc;
  return (
    <div>
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10">
        <h1 className="font-display text-4xl leading-tight">{t(`${d}Title`)}</h1>
        {d !== "imprint" ? (
          <>
            <p className="mt-2 text-sm text-muted">{t("updated")}</p>
            <Body text={t(`${d}Body`)} />
            {/* the messenger's privacy note lives here (owner 22.10.2026), not in the inbox */}
            {/* Google Analytics / Tag Manager with consent (src/components/analytics/Analytics.tsx) */}
            {d === "privacy" ? <section id="analytics"><Body text={t("analyticsBody")} /></section> : null}
            {d === "privacy" ? (() => { const m = messengerText(locale); return (
              <section id="messenger"><h2 className="mt-8 text-lg font-bold">{m.title}</h2>{para(m.privacy, "m1")}{para(m.viewOnceHint, "m2")}</section>
            ); })() : null}
          </>
        ) : (
          <div className="mt-6 grid gap-6">
            {/* company details: src/lib/company.ts (only what is on record; licence number and street address still missing) */}
            <section>
              <h2 className="text-lg font-bold">{t("imprintProvider")}</h2>
              <p className="mt-2 whitespace-pre-line text-muted"><span dir="ltr">{COMPANY.legalName}</span>{`\n${tc("place")}`}</p>
              <p className="mt-1 text-muted">{tc("brandLabel")}: <span dir="ltr">{COMPANY.brand}</span></p>
            </section>
            <section>
              <h2 className="text-lg font-bold">{tc("founder")}</h2>
              <p className="mt-2 text-muted">{founderName(locale)}</p>
            </section>
            <section>
              <h2 className="text-lg font-bold">{t("imprintContact")}</h2>
              <p className="mt-2 text-muted"><EmailText text={COMPANY.email} /></p>
            </section>
          </div>
        )}
        <p className="mt-12"><Link href="/" className="text-sm font-semibold text-accent"><ArrowBack /> {t("back")}</Link></p>
      </main>
    </div>
  );
}
