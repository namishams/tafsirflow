import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { appStoreUrl } from "@/lib/appstore";
import { getVerseByKey } from "@/lib/quran";
import { countryName as countryNameOf } from "@/lib/countries";
import { publicProfile } from "@/lib/talentsPublic";
import { fill, talentsText, type TwKey } from "@/lib/talentsWeb";
import { BadgeIcon } from "@/components/talents/BadgeIcon";
import TalentActions from "@/components/talents/TalentActions";
import ClipCard from "@/components/talents/ClipCard";
import SijillShowcase, { TreeBannerWeb } from "@/components/talents/SijillShowcase";
import { publicSijill } from "@/lib/sijillPublic";
import { sijillText } from "@/lib/sijillWeb";
import { fillRw, rankingsText } from "@/lib/rankingsWeb";
import { rankOf } from "@/lib/rankings";

// Public talent profile on the website (same structure as the app profile): avatar, badge, level, stats, bio, follow /
// message, highlights, recitations, achievements. Only public members aged 16+; badged profiles are indexed.
// Owner decision 21.10.2026: with posting switched off the profile shows the Sijill (academic record): the garden tree,
// the sections the member shows, and achievement moments with preset encouragements; clips stay hidden.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; username: string }> }): Promise<Metadata> {
  const { locale, username } = await params;
  const p = await publicProfile(username.toLowerCase());
  const tx = talentsText(locale);
  if (!p) return { title: "Quran Masterclass Talents", robots: { index: false, follow: false } };
  const meta = pageMeta(locale, `/talents/${p.username}`, `${p.name} (@${p.username}) | Quran Masterclass Talents`, fill(tx.metaDesc, { u: p.name }));
  return p.badge && !p.private ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function TalentPage({ params }: { params: Promise<{ locale: string; username: string }> }) {
  const { locale, username } = await params;
  setRequestLocale(locale);
  const p = await publicProfile(username.toLowerCase());
  if (!p) notFound();
  const tx = talentsText(locale);
  const sx = sijillText(locale);
  const sj = p.private ? null : await publicSijill(p.username, locale);
  const nf = new Intl.NumberFormat(locale, { notation: "compact" });
  // verse text from Quran.com (never typed by hand), first verse of each clip
  const texts = await Promise.all(p.clips.slice(0, 24).map((c) => {
    const first = c.verseKey?.split("-")[0] ?? "";
    return /^\d+:\d+$/.test(first) ? getVerseByKey(first, locale, 20).then((v) => v.text_uthmani + (c.verseKey?.includes("-") ? " …" : "")).catch(() => "") : Promise.resolve("");
  }));
  // worldwide place (only members who joined the rankings by name): "#123 worldwide · #4 in Germany"
  const rl = rankingsText(locale);
  const place = p.private ? null : await rankOf(p.username).catch(() => null);
  const placeText = place?.world ? [fillRw(rl.profileRank, { n: place.world }), place.country && place.countryCode ? fillRw(rl.profileRankCountry, { n: place.country, c: countryNameOf(place.countryCode, locale) }) : ""].filter(Boolean).join(" · ") : "";
  const badgeLabel = p.badge ? tx[`badge_${p.badge}` as TwKey] : "";
  const facts = [p.rewaya && `${tx.rewaya}: ${p.rewaya}`, p.maqam && `${tx.maqam}: ${p.maqam}`, p.country && countryNameOf(p.country, locale)].filter(Boolean) as string[];
  const ld = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": abs(`/${locale}/talents/${p.username}`),
    url: abs(`/${locale}/talents/${p.username}`),
    inLanguage: locale,
    mainEntity: {
      "@type": "Person", name: p.name, alternateName: `@${p.username}`, description: p.bio || undefined, image: p.avatar ? abs(p.avatar) : undefined,
      interactionStatistic: [
        { "@type": "InteractionCounter", interactionType: "https://schema.org/FollowAction", userInteractionCount: p.followers },
        { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: p.likes },
      ],
    },
    isPartOf: { "@id": abs("/#site") },
  };
  const stat = (n: number, label: string, href?: string) => {
    const inner = <><span className="block text-xl font-bold text-white">{nf.format(n)}</span><span className="block text-[12.5px] text-white/60">{label}</span></>;
    return href && !p.private ? <Link href={href} className="min-w-[72px] text-center hover:opacity-80">{inner}</Link> : <span className="min-w-[72px] text-center">{inner}</span>;
  };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto max-w-4xl px-5 pb-12 pt-10 sm:pt-14">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal"><Link href="/talents" className="hover:underline">{tx.network}</Link></p>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <span className={`grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full bg-[rgb(8,58,44)] ${p.badge === "gold" || p.badge === "official" ? "ring-4 ring-[#E2C77F]" : "ring-2 ring-[rgb(var(--gold))]/70"}`}>
              {p.avatar
                ? <img src={p.avatar} alt="" width={112} height={112} className="h-full w-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                : <span aria-hidden className="font-callig text-4xl text-[#e8d3a0]">{(p.name.trim().split(/\s+/).slice(0, 2).map((w) => Array.from(w)[0] ?? "").join("") || "?").toUpperCase()}</span>}
            </span>
            <div className="flex flex-1 flex-wrap justify-start gap-4 sm:gap-8">
              {p.posting ? stat(p.posts, tx.posts) : stat(sj?.sijill.moments ?? 0, sx.tabMoments)}
              {stat(p.followers, tx.followers, `/talents/${p.username}/followers`)}
              {stat(p.following, tx.following, `/talents/${p.username}/following`)}
              {p.posting ? stat(p.likes, tx.likes) : stat(sj?.sijill.reactions ?? 0, sx.statEncouragements)}
            </div>
          </div>
          <h1 className="font-display mt-6 flex flex-wrap items-center gap-2 text-4xl leading-tight sm:text-5xl">
            {p.name}
            {p.badge ? <a href="#badges" className="inline-flex" aria-label={`${badgeLabel}. ${tx.badgeWhat}`}><BadgeIcon badge={p.badge} size={28} title={badgeLabel} /></a> : null}
          </h1>
          <p className="mt-1 text-white/60" dir="ltr">@{p.username}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
            <span className="rounded-full border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-3 py-1 font-semibold text-[rgb(var(--gold))]">{tx[`level_${p.level}` as TwKey] ?? p.level}</span>
            {p.private ? <span className="rounded-full border border-white/20 px-3 py-1 text-white/70">{tx.private}</span> : null}
          </div>
          {facts.length ? <p className="mt-4 text-[15px] font-semibold text-white/85">{facts.join(" · ")}</p> : null}
          {placeText ? <p className="mt-3"><Link href="/ranking" title={rl.profileLink} className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--gold))]/60 bg-[rgb(var(--gold))]/10 px-3.5 py-1.5 text-[13.5px] font-semibold text-[#e8d3a0] hover:bg-[rgb(var(--gold))]/20">{placeText}</Link></p> : null}
          {p.officialChannel ? <p className="mt-1 text-[14px] text-[rgb(var(--gold))]">{fill(tx.officialChannel, { c: p.officialChannel })}</p> : null}
          {p.bio ? <p className="mt-3 max-w-2xl whitespace-pre-line text-[16px] leading-relaxed text-white/75">{p.bio}</p> : null}
          <div className="mt-7">
            <TalentActions username={p.username} appUrl={appStoreUrl()} l={{ follow: tx.follow, followingBtn: tx.followingBtn, requested: tx.requested, message: tx.message, signIn: tx.signIn, signInToFollow: tx.signInToFollow, messageInApp: tx.messageInApp, getApp: tx.getApp, error: tx.error }} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 py-10">
        {p.private ? (
          <p className="callout rounded-lg p-6 text-center text-[16px]">{tx.privateText}</p>
        ) : !p.posting ? (
          <section aria-labelledby="sijill" className="grid gap-5">
            {sj?.sijill.tree ? <TreeBannerWeb tree={sj.sijill.tree} locale={locale} /> : null}
            <h2 id="sijill" className="font-display text-2xl">{sx.sijill} · {sx.title}</h2>
            {sj ? <SijillShowcase s={sj.sijill} moments={sj.moments} locale={locale} /> : <p className="text-muted">{sx.hiddenAll}</p>}
          </section>
        ) : (
          <>
            {p.highlights.length ? (
              <section aria-label={tx.highlights} className="mb-8 flex gap-5 overflow-x-auto pb-2">
                {p.highlights.map((h) => (
                  <a key={h.id} href={appStoreUrl()} rel="noopener" className="grid w-20 shrink-0 justify-items-center gap-1.5 text-center">
                    <span className="stage grid h-16 w-16 place-items-center rounded-full ring-2 ring-[rgb(var(--gold))]/70 text-[rgb(var(--gold))]">{h.count}</span>
                    <span className="line-clamp-1 text-[12.5px] font-semibold">{h.title}</span>
                  </a>
                ))}
              </section>
            ) : null}
            <h2 className="font-display text-2xl">{tx.tabPosts}</h2>
            {p.clips.length ? (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {p.clips.slice(0, 24).map((c, i) => (
                  <ClipCard key={c.id} id={c.id} verseKey={c.verseKey} arabic={texts[i] ?? ""} likes={c.likes} l={{ listen: tx.listen, pause: tx.pause, listenSignIn: tx.listenSignIn, likes: tx.likes }} />
                ))}
              </div>
            ) : <p className="mt-4 text-muted">{tx.noPosts}</p>}
          </>
        )}

        <section id="badges" className="mt-12 grid gap-4">
          <h2 className="font-display text-2xl">{tx.tabAwards}</h2>
          {p.progress?.certJuz.length ? (
            <div><h3 className="font-bold">{tx.certificates}</h3><ul className="mt-2 flex flex-wrap gap-2">{p.progress.certJuz.map((j) => <li key={j} className="rounded-full border border-[rgb(var(--hm-gold))]/50 px-3 py-1 text-[13px] font-semibold">{fill(tx.juzN, { n: j })}</li>)}</ul></div>
          ) : null}
          {p.progress && p.progress.treeStage > 0 ? <p className="text-[15px]">{fill(tx.treeStage, { n: p.progress.treeStage })}</p> : null}
          {p.ijazahChain ? <div><h3 className="font-bold">{tx.ijazahChain}</h3><p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed">{p.ijazahChain}</p><p className="mt-1 text-[13px] text-muted">{tx.unverifiedChain}</p></div> : null}
          <details className="rounded-lg border border-line bg-surface p-5" open={!!p.badge}>
            <summary className="cursor-pointer font-bold">{tx.badgeWhat}</summary>
            <ul className="mt-4 grid gap-4">
              {(["emerald", "gold", "official"] as const).map((b) => (
                <li key={b} className={`flex gap-3 rounded-md p-3 ${p.badge === b ? "bg-[rgb(var(--hm-gold))]/10 ring-1 ring-[rgb(var(--hm-gold))]/50" : ""}`}>
                  <BadgeIcon badge={b} size={26} />
                  <div><p className="font-semibold">{tx[`badge_${b}` as TwKey]}</p><p className="text-[14px] leading-relaxed text-muted">{tx[`badge_${b}_text` as TwKey]}</p></div>
                </li>
              ))}
            </ul>
          </details>
          <p className="text-[13px] text-muted"><Link href="/talents" className="font-semibold text-accent hover:underline">{tx.guidelines}</Link> · {tx.reportInApp}</p>
        </section>
      </div>
    </div>
  );
}
