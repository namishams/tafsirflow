import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import CountUp from "@/components/CountUp";
import { CalligraphyDraw } from "@/components/Ornaments";
import { MoreTiles } from "@/components/PosterTiles";
import MyLikes from "@/components/MyLikes";
import { pulse, recentComments, topVerses, type TopKind } from "@/lib/community";
import { getChapters, getResources, getVerseByKey, pickTranslation, type SingleVerse } from "@/lib/quran";
import { pageMeta } from "@/lib/site";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
const KINDS: TopKind[] = ["loved", "viewed", "shared", "discussed"];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "community" });
  return pageMeta(locale, "/community", `${t("title")} | Quran Masterclass`, t("lead"));
}

export default async function CommunityPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ tab?: string; range?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "community" });
  const settings = await getSettings();
  if (!settings.features.community) {
    return (
      <div>
        <section className="stage girih relative overflow-hidden text-[#eef0f3]">
          <CalligraphyDraw text={"معًا"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
          <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
            <p className="rise text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{t("kicker")}</p>
            <h1 className="rise font-display mt-3 max-w-3xl text-[42px] leading-[1.04] sm:text-6xl" style={{ animationDelay: "120ms" }}>{t("title")}</h1>
            <p className="rise mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70" style={{ animationDelay: "240ms" }}>{t("lead")}</p>
          </div>
        </section>
        <section className="mx-auto max-w-3xl px-5 py-14">
          <p className="callout rounded-lg p-6 text-center text-[16px] leading-relaxed">{t("paused")}</p>
        </section>
        <MoreTiles keys={["ranking", "stats", "radio", "secrets"]} />
      </div>
    );
  }
  const kind: TopKind = KINDS.includes(sp.tab as TopKind) ? (sp.tab as TopKind) : "loved";
  const week = sp.range !== "all" && (kind === "loved" || kind === "viewed");
  const [pl, top, heard, recent, chapters] = await Promise.all([pulse(), topVerses(kind, week), topVerses("heard", true, 8), recentComments(10), getChapters(locale).catch(() => [])]);
  let tr = 20;
  try { tr = pickTranslation(locale, (await getResources()).translations); } catch { /* default */ }
  const verses = new Map<string, SingleVerse>();
  await Promise.all(top.map(async (x) => { try { verses.set(x.key, await getVerseByKey(x.key, locale, tr)); } catch { /* skip */ } }));
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${s}`;
  const nf = (n: number) => new Intl.NumberFormat(locale, { numberingSystem: "latn" }).format(n);
  const hours = (sec: number) => Math.round((sec / 3600) * 10) / 10;
  const stats = pl ? [
    { n: pl.listenersToday, l: t("pListeners") }, { n: hours(pl.secondsToday), l: t("pHoursToday"), d: 1 }, { n: pl.viewersToday, l: t("pViewers") }, { n: pl.likes, l: t("pLikes") },
  ] : [];
  const href = (k: TopKind, all = false) => `/community?tab=${k}${all ? "&range=all" : ""}`;

  return (
    <div>
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <CalligraphyDraw text={"معًا"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <p className="rise text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("kicker")}</p>
          <h1 className="rise font-display mt-3 max-w-3xl text-[42px] leading-[1.04] sm:text-6xl" style={{ animationDelay: "120ms" }}>{t("title")}</h1>
          <p className="rise mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70" style={{ animationDelay: "240ms" }}>{t("lead")}</p>
          {stats.length > 0 && (
            <dl className="mt-9 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-4">
              {stats.map((s) => <div key={s.l} className="bg-[rgb(var(--stage))] px-4 py-4"><dt className="font-display text-3xl text-[rgb(var(--gold))]"><CountUp to={s.n} decimals={s.d ?? 0} locale={locale} /></dt><dd className="mt-1 text-xs text-white/60">{s.l}</dd></div>)}
            </dl>
          )}
          {pl && <p className="mt-4 text-sm text-white/55">{t("pWeek", { h: nf(hours(pl.secondsWeek)), likes: nf(pl.likesWeek) })}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-3xl sm:text-4xl">{t("topTitle")}</h2>
        <nav className="mt-6 flex flex-wrap gap-2 text-sm font-semibold" aria-label={t("topTitle")}>
          {KINDS.map((k) => <Link key={k} href={href(k)} scroll={false} className={`rounded-full border px-4 py-2 ${kind === k ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:text-ink"}`}>{t(`k_${k}`)}</Link>)}
          {(kind === "loved" || kind === "viewed") && (
            <span className="ms-auto inline-flex rounded-full border border-line bg-surface p-1">
              <Link href={href(kind)} scroll={false} className={`rounded-full px-3 py-1 ${week ? "bg-gold/20 text-ink" : "text-muted"}`}>{t("week")}</Link>
              <Link href={href(kind, true)} scroll={false} className={`rounded-full px-3 py-1 ${!week ? "bg-gold/20 text-ink" : "text-muted"}`}>{t("allTime")}</Link>
            </span>
          )}
        </nav>
        {top.length === 0 ? <p className="mt-8 text-muted">{t("empty")}</p> : (
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {top.map((x, i) => {
              const v = verses.get(x.key); const [s, a] = x.key.split(":");
              return (
                <li key={x.key} className="relative overflow-hidden rounded-xl border border-line bg-surface p-5 transition hover:border-gold/50">
                  <span aria-hidden className="niche !border-gold/20" />
                  <div className="relative flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gold"><span className="grid h-7 w-7 place-items-center rounded-full border border-gold/50 font-display text-sm tracking-normal">{i + 1}</span>{name(Number(s))} · {x.key}</span>
                    <span className="text-sm font-bold">{nf(x.n)} <span className="font-normal text-muted">{t(`u_${kind}`)}</span></span>
                  </div>
                  {v && <p className="font-arabic relative mt-4 text-[26px] leading-[2.1]" dir="rtl" lang="ar">{v.text_uthmani}</p>}
                  {v?.translation && <p className="relative mt-2 text-[15px] leading-relaxed text-muted">{v.translation.replace(/<[^>]+>/g, "")}</p>}
                  <Link href={`/surah/${s}?v=${a}`} className="relative mt-4 inline-flex text-sm font-semibold text-accent hover:underline">{t("listen")}</Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">{t("heardTitle")}</h2>
            {heard.length === 0 ? <p className="mt-6 text-muted">{t("empty")}</p> : (
              <ol className="mt-6 grid gap-3">
                {heard.map((h, i) => (
                  <li key={h.key}>
                    <Link href={`/surah/${h.key}`} className="group block">
                      <span className="flex items-baseline justify-between gap-3"><span className="font-semibold group-hover:text-accent">{i + 1}. {name(Number(h.key))}</span><span className="text-xs text-muted">{t("hoursN", { n: nf(hours(h.n)) })}</span></span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-gold" style={{ width: `${Math.max(4, (h.n / heard[0].n) * 100)}%` }} /></span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">{t("commentsTitle")}</h2>
            {recent.length === 0 ? <p className="mt-6 text-muted">{t("noComments")}</p> : (
              <ul className="mt-6 grid gap-3">
                {recent.map((c) => (
                  <li key={c.id} className="rounded-lg border border-line bg-bg p-4">
                    <p className="text-[13px] text-muted"><b className="text-ink">{c.author}</b>{c.country ? ` · ${c.country}` : ""} · <Link href={`/surah/${c.key.split(":")[0]}?v=${c.key.split(":")[1]}`} className="font-semibold text-accent hover:underline">{name(Number(c.key.split(":")[0]))} {c.key}</Link></p>
                    <p className="mt-1.5 line-clamp-4 whitespace-pre-wrap text-[15px] leading-relaxed">{c.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-3xl sm:text-4xl">{t("mineTitle")}</h2>
        <MyLikes />
        <div className="callout mt-10 rounded-lg p-5 text-[15px] leading-relaxed">
          {t("ranking")} <Link href="/ranking" className="font-semibold text-accent hover:underline">{t("rankingCta")}</Link>
        </div>
      </section>
      <MoreTiles keys={["ranking", "stats", "radio", "secrets"]} />
    </div>
  );
}
