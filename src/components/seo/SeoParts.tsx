import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CalligraphyDraw, Rosette } from "@/components/Ornaments";
import { IslamArcadeLine, IslamBreak, IslamNum, IslamRain } from "@/components/art/IslamArt";
import { PosterGrid, TONES, type PosterItem } from "@/components/PosterTiles";
import { tileFor } from "@/lib/tiles";
import type { HubId, HubSection } from "@/lib/seo/types";
import { ARTICLE_AR, HUB_AR } from "@/lib/seo/related";

// Shared building blocks of the landing hubs and the long-form articles: the same emerald/gold stage, Arabic
// calligraphy that draws itself, the answer-first card, ornamented section breaks and the catalogue posters.

export function SeoHero({ kicker, h1, intro, ar, cta }: { kicker: string; h1: string; intro: string; ar: string; cta?: [string, string] }) {
  return (
    <section className="stage girih isl-arcade relative z-[1] overflow-hidden text-[#eef0f3]">
      <IslamRain fall={420} className="opacity-60" />
      <CalligraphyDraw text={ar} className="absolute -end-2 top-0 h-[140px] w-[460px] max-w-none opacity-80 sm:h-[230px] sm:w-[780px]" />
      <div className="relative mx-auto max-w-4xl px-5 pb-24 pt-14 sm:pb-28 sm:pt-20">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{kicker}</p>
        <h1 className="font-display mt-4 max-w-3xl text-[34px] leading-[1.08] sm:text-[52px]">{h1}</h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/78">{intro}</p>
        {cta && <Link href={cta[0]} className="btn-gold mt-8 inline-flex h-12 items-center rounded-full px-7 text-[15px] font-bold">{cta[1]}</Link>}
      </div>
      <IslamArcadeLine />
    </section>
  );
}

// the direct answer for readers and answer engines: first thing under the hero
export function AnswerCard({ text }: { text: string }) {
  return (
    <div className="isl-card relative mb-12 overflow-hidden p-5 sm:p-6" data-answer>
      <Rosette className="absolute end-4 top-4 text-[rgb(var(--isl-gold))] opacity-70" size={24} />
      <p className="pe-8 text-[17px] font-semibold leading-relaxed sm:text-[18px]">{text}</p>
    </div>
  );
}

export function Sections({ sections }: { sections: HubSection[] }) {
  return (
    <>
      {sections.map((s, i) => (
        <section key={s.h2} className="mb-4">
          {i > 0 && <IslamBreak />}
          <h2 className="font-display text-[26px] leading-tight sm:text-[32px]">{s.h2}</h2>
          {s.p.map((p, j) => <p key={j} className="mt-4 text-[16.5px] leading-[1.85] text-muted">{p}</p>)}
          {s.links && s.links.length > 0 && (
            <p className="mt-4 flex flex-wrap gap-2">
              {s.links.map(([href, label]) => <Link key={href} href={href} className="rounded-full border border-[rgb(var(--isl-gold-soft))]/45 px-3.5 py-1.5 text-[14px] font-semibold text-accent transition hover:border-[rgb(var(--isl-gold))] hover:bg-[rgb(var(--isl-gold-soft))]/10">{label}</Link>)}
            </p>
          )}
        </section>
      ))}
    </>
  );
}

export function Steps({ title, steps }: { title: string; steps: { title: string; body: string }[] }) {
  return (
    <section className="mt-14">
      <h2 className="font-display text-[26px] leading-tight sm:text-[32px]">{title}</h2>
      <ol className="isl-thread mt-8 flex flex-col gap-4">
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex gap-3 sm:gap-4">
            <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[rgb(var(--isl-paper))]"><IslamNum n={i + 1} className="!h-14 !w-14 !text-[17px]" /></span>
            <div className="isl-card isl-card-hover min-w-0 flex-1 p-4 sm:p-5">
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Faq({ title, faq }: { title: string; faq: { q: string; a: string }[] }) {
  return (
    <section className="mt-14">
      <h2 className="font-display text-[26px] leading-tight sm:text-[32px]">{title}</h2>
      <div className="mt-6 flex flex-col gap-3">
        {faq.map((f, i) => (
          <details key={f.q} className="isl-card group p-4 sm:p-5" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[16.5px] font-bold">
              <span>{f.q}</span>
              <span aria-hidden className="mt-0.5 text-[rgb(var(--isl-gold))] transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

// internal links as catalogue posters (Arabic watermark, tone, label and short text from the site's tile registry)
export async function LinkPosters({ title, links, badge, descs = {} }: { title: string; links: [string, string][]; badge: string; descs?: Record<string, string> }) {
  const t = await getTranslations("home2");
  const items: PosterItem[] = links.map(([href, label], i) => {
    const tile = tileFor(href);
    return { href, title: label, desc: descs[href] ?? (tile ? t(tile.desc) : ""), badge: tile ? t(`badge_${tile.badge}`) : badge, ar: ARTICLE_AR[href.slice(1)] ?? HUB_AR[href.slice(1) as HubId] ?? tile?.ar ?? "قرآن", bg: tile?.bg ?? TONES[i % TONES.length], cta: t("open") };
  });
  return <PosterGrid title={title} items={items} className="mt-14" />;
}
