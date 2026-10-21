import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import FollowRequestsWeb from "@/components/talents/FollowRequestsWeb";
import { talentsText } from "@/lib/talentsWeb";
import { tpText } from "@/lib/talentsProfileWeb";

// /talents/requests – follow requests (Confirm / Delete) and connection requests, like the app (not indexed)
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TalentRequestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tx = talentsText(locale);
  const t = tpText(locale);
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold rtl:tracking-normal"><Link href="/talents/me" className="hover:underline">{tx.network}</Link></p>
      <h1 className="font-display mt-2 text-4xl">{t.requestsTitle}</h1>
      <FollowRequestsWeb locale={locale} />
    </div>
  );
}
