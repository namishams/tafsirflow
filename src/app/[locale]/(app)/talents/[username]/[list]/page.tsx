import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import TalentList from "@/components/talents/TalentList";
import { fill, talentsText } from "@/lib/talentsWeb";

// /talents/<username>/followers | /following (signed in, like in the app; not indexed)
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default async function TalentListPage({ params }: { params: Promise<{ locale: string; username: string; list: string }> }) {
  const { locale, username, list } = await params;
  setRequestLocale(locale);
  if ((list !== "followers" && list !== "following") || !/^[a-z0-9_.]{3,20}$/.test(username)) notFound();
  const tx = talentsText(locale);
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold rtl:tracking-normal"><Link href={`/talents/${username}`} className="hover:underline">@{username}</Link></p>
      <h1 className="font-display mt-2 text-4xl">{fill(list === "followers" ? tx.listTitleFollowers : tx.listTitleFollowing, { u: username })}</h1>
      <TalentList username={username} kind={list} l={{ empty: tx.empty, restricted: tx.restricted, loadMore: tx.loadMore, signInToFollow: tx.signInToFollow, signIn: tx.signIn, error: tx.error,
        levels: { talent: tx.level_talent, rising: tx.level_rising, master: tx.level_master, sheikh: tx.level_sheikh } }} />
    </div>
  );
}
