import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { lookupCertificate } from "@/app/api/certificates/lookup";
import VerifyHero from "../Hero";
import VerifyForm from "../VerifyForm";
import { verifyText } from "../texts";

export const dynamic = "force-dynamic";

// /verify/QMC-XXXX-XXXX – the record kept on the server: holder, course, date, status. Never indexed.
export async function generateMetadata({ params }: { params: Promise<{ locale: string; code: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = verifyText(locale);
  return { title: t.seoTitle, description: t.seoDesc, robots: { index: false, follow: false } };
}

const TONE: Record<string, string> = {
  valid: "border-[rgb(58_190_146/0.55)] bg-[rgb(58_190_146/0.12)] text-[rgb(140_230_195)]",
  pending: "border-[rgb(214_180_108/0.6)] bg-[rgb(214_180_108/0.12)] text-[rgb(233_207_153)]",
  rejected: "border-[rgb(220_120_120/0.6)] bg-[rgb(220_120_120/0.12)] text-[rgb(245_180_180)]",
  revoked: "border-[rgb(220_120_120/0.6)] bg-[rgb(220_120_120/0.12)] text-[rgb(245_180_180)]",
};

export default async function VerifyCodePage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const t = verifyText(locale);
  const c = await lookupCertificate(code, locale);
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });

  if (!c || c === "invalid") {
    return (
      <div>
        <VerifyHero kicker={t.kicker} title={t.title} lead={c === "invalid" ? t.invalidCode : t.notFound}>
          <VerifyForm label={t.codeLabel} placeholder={t.codePlaceholder} button={t.check} invalid={t.invalidCode} initial={decodeURIComponent(code).slice(0, 20)} />
        </VerifyHero>
      </div>
    );
  }
  const note = c.status === "valid" ? t.validNote : c.status === "pending" ? t.pendingNote : c.status === "rejected" ? t.rejectedNote : t.revokedNote;
  const rows: [string, string, boolean?][] = [
    [t.holder, c.holder || "–"], [t.course, c.title], [t.date, fmt(c.issuedAt)], [t.result, `${c.pct} %`],
    ...(c.decidedAt ? [[t.decided, fmt(c.decidedAt)] as [string, string]] : []), [t.code, c.code, true],
  ];
  return (
    <div>
      <VerifyHero kicker={t.kicker} title={c.title}>
        <div className="rounded-2xl border border-[rgb(214_180_108/0.5)] bg-white/[0.04] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[14px] font-bold ${TONE[c.status]}`}>{t[c.status]}</span>
            <span className={`text-[13px] font-semibold ${c.signatureOk ? "text-[rgb(140_230_195)]" : "text-[rgb(245_180_180)]"}`}>{c.signatureOk ? t.sigOk : t.sigBad}</span>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-white/75">{note}</p>
          <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {rows.map(([k, v, mono]) => (
              <div key={k} className="border-t border-white/10 pt-3">
                <dt className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal">{k}</dt>
                <dd className={`mt-1 text-[17px] text-white ${mono ? "font-mono tracking-[0.08em]" : "font-display"}`} dir={mono ? "ltr" : undefined}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </VerifyHero>
      <section className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-10">
        <p className="text-sm leading-relaxed text-[rgb(var(--muted))]">{t.disclaimer}</p>
        <Link href="/verify" className="text-[15px] font-semibold text-[rgb(var(--accent))]">{t.another}</Link>
      </section>
    </div>
  );
}
