import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { appStoreUrl } from "@/lib/appstore";
import { mc } from "@/lib/masterclass";
import { HomeStar, StarGlyph } from "@/components/art/HomeOrnaments";
import { Ink } from "@/components/Ornaments";

// Placeholder for public reciter profiles (/talents/<username>). The profiles will be filled from the Talents API
// (src/app/api/community/talents/[username]) later; until then the page says "coming soon" and is not indexed.
// Nothing is looked up here: the username is only shown back after a strict format check.
export const dynamic = "force-dynamic";

const USERNAME = /^[a-z0-9][a-z0-9_.]{1,29}$/i;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; username: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = mc(locale).talents;
  return { title: `${c.soonTitle} | ${c.kicker}`, description: c.soonBody, robots: { index: false, follow: true } };
}

export default async function TalentProfilePlaceholder({ params }: { params: Promise<{ locale: string; username: string }> }) {
  const { locale, username } = await params;
  setRequestLocale(locale);
  const name = decodeURIComponent(username);
  if (!USERNAME.test(name)) notFound();
  const c = mc(locale).talents;
  return (
    <section className="stage girih relative overflow-hidden text-[#eef0f3]">
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgb(var(--gold) / .16) 0, transparent 50%)" }} />
      <div className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center">
        <HomeStar size={64} tone="gold" />
        <p className="hm-k mt-6 flex items-center gap-2 text-[rgb(var(--gold))]"><StarGlyph size={9} />{c.kicker}</p>
        <p className="mt-3 text-[15px] font-semibold text-white/60" dir="ltr">@{name}</p>
        <h1 className="font-display mt-4 text-4xl leading-[1.1] sm:text-5xl">{c.soonTitle}</h1>
        <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-white/70">{c.soonBody}</p>
        <p aria-hidden className="font-arabic mt-6 text-[22px] text-[rgb(var(--gold))]/85" dir="rtl"><Ink>خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</Ink></p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a href={appStoreUrl()} rel="noopener" className="btn-gold inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{c.cta}</a>
          <Link href="/talents" className="inline-flex h-12 items-center rounded-md border border-[rgb(var(--gold))]/40 px-6 text-[15px] font-bold transition hover:border-[rgb(var(--gold))] hover:bg-white/[0.04]">{c.soonBack}</Link>
        </div>
      </div>
    </section>
  );
}
