// Masterclass sections shared by the home page, /masterclass, /app and /talents: the pillars, the four school stages,
// the Reciter Path ladder, the Talents teaser, free vs Pro, and the voices (testimonials) section.
// Server components, pure CSS/SVG (no client JS); texts from src/lib/masterclass.ts, prices from messages "premium".
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mc, PILLARS, STAGES, type Testimonial } from "@/lib/masterclass";
import { appStoreUrl } from "@/lib/appstore";
import { HomeArch, HomeCorners, HomeGlowLayer, HomeStar, StarGlyph } from "@/components/art/HomeOrnaments";
import { Seal } from "@/components/PremiumPanel";
import "@/styles/masterclass.css";

const btnS = "inline-flex h-11 items-center rounded-md border border-[rgb(var(--hm-gold))]/60 px-5 text-sm font-bold transition hover:border-[rgb(var(--hm-gold))] hover:bg-[rgb(var(--hm-gold))]/10";

/** a small heading block: gold kicker, display title, optional calligraphic word above it (not in Arabic) */
export function McHead({ locale, kicker, title, lead, word, dark = false, center = false, as: H = "h2" }: { locale: string; kicker?: string; title: string; lead?: string; word?: string; dark?: boolean; center?: boolean; as?: "h1" | "h2" }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {kicker && <p className={`hm-k flex items-center gap-2 ${center ? "justify-center" : ""} ${dark ? "text-[rgb(var(--gold))]" : "text-[rgb(var(--hm-gold-d))]"}`}><StarGlyph size={9} />{kicker}</p>}
      <H className="font-display mt-3 text-4xl leading-[1.08] sm:text-5xl">
        {word && locale !== "ar" && <span aria-hidden className={`font-callig gold-sheen mb-1 block w-fit text-[30px] leading-snug sm:text-[36px] ${center ? "mx-auto" : ""}`} dir="rtl">{word}</span>}
        {title}
      </H>
      {lead && <p className={`mt-4 text-[17px] leading-relaxed ${dark ? "text-white/70" : "text-muted"}`}>{lead}</p>}
    </div>
  );
}

/** the nine pillars of the Masterclass, as a calm 3×3 grid of illuminated cards */
export function MasterclassPillars({ locale }: { locale: string }) {
  const c = mc(locale);
  return (
    <section id="pillars" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <McHead locale={locale} kicker={c.pillarsKicker} title={c.pillarsTitle} lead={c.pillarsLead} word="ركائز" />
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {PILLARS.map(({ k, ar, href }, i) => (
            <li key={k} className="min-w-0">
              <Link href={href} className="hm-card hm-lift hm-glow group flex h-full flex-col overflow-hidden p-6">
                <HomeGlowLayer />
                <span aria-hidden className="font-callig pointer-events-none absolute -bottom-3 -end-1 text-[64px] leading-none text-[rgb(var(--hm-gold))]/[0.13] transition duration-700 group-hover:text-[rgb(var(--hm-gold))]/25" dir="rtl">{ar}</span>
                <span className="relative flex items-center gap-3">
                  <HomeStar size={40} className="hm-turn">{String(i + 1).padStart(2, "0")}</HomeStar>
                  <span className="text-lg font-bold leading-tight">{c.pillars[k].t}</span>
                </span>
                <span className="relative mt-3 block flex-1 text-[15px] leading-relaxed text-muted">{c.pillars[k].d}</span>
                <span className="hm-k relative mt-5 inline-flex items-center gap-1.5 text-accent">{c.open} <span aria-hidden className="inline-block transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** the four school stages, Ibtidāʾī → ʿĀlī, as mihrab arches joined by a gold hairline */
export function SchoolStages({ locale, detailed = false }: { locale: string; detailed?: boolean }) {
  const c = mc(locale);
  const ar = locale === "ar";
  return (
    <section id="school" className="hm-warm scroll-mt-20 overflow-hidden">
      <span aria-hidden className="hm-wm font-callig -end-4 bottom-0 text-[120px] sm:text-[200px]">مدرسة</span>
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <McHead locale={locale} kicker={c.schoolKicker} title={c.schoolTitle} lead={c.schoolLead} />
        <ol className="mc-stages relative mt-14 grid gap-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {STAGES.map(({ k, ar: word }, i) => {
            const s = c.stages[k];
            return (
              <li key={k} className="relative min-w-0">
                <HomeArch ratio={0.42} lift={0.2} className="hm-arch-shadow h-full" bodyClass="h-full px-5 pb-7">
                  <div className="flex h-full flex-col text-center">
                    <HomeStar size={46} tone="gold" className="mx-auto" label={`${c.stageWord} ${i + 1}`}>{i + 1}</HomeStar>
                    {!ar && <p aria-hidden className="font-callig mt-2 text-[30px] leading-none text-[rgb(var(--hm-gold-d))]" dir="rtl">{word}</p>}
                    <h3 className="font-display mt-3 text-[24px] leading-tight">{s.name}</h3>
                    <p className="hm-k mt-1 text-[rgb(var(--hm-gold-d))]">{s.t}</p>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.d}</p>
                    {detailed && (
                      <ul className="mt-5 grid gap-2 border-t border-[rgb(var(--hm-gold))]/25 pt-4 text-start text-[14px] leading-snug">
                        {s.items.map((it) => <li key={it} className="flex gap-2.5"><StarGlyph size={9} className="mt-[5px] shrink-0 text-[rgb(var(--hm-gold))]" />{it}</li>)}
                      </ul>
                    )}
                  </div>
                </HomeArch>
              </li>
            );
          })}
        </ol>
        {!detailed && <Link href="/masterclass#school" className={`${btnS} mt-12 w-fit`}>{mc(locale).page.title} <span aria-hidden className="ms-2 rtl:-scale-x-100">→</span></Link>}
      </div>
    </section>
  );
}

/** the ten levels of the Reciter Path, ending in the Masterclass recital (on the dark stage) */
export function ReciterLadder({ locale }: { locale: string }) {
  const c = mc(locale);
  return (
    <section id="reciter-path" className="stage girih relative scroll-mt-20 overflow-hidden text-[#eef0f3]">
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <McHead locale={locale} kicker={c.pathKicker} title={c.pathTitle} lead={c.pathLead} word="طريق القارئ" dark />
          <div className="relative mt-8 overflow-hidden rounded-2xl bg-white/[0.045] p-6 ring-1 ring-[rgb(var(--gold))]/25">
            <span className="illum-frame" />
            <p className="relative flex items-center gap-3 font-bold"><Seal size={26} />{c.recitalT}</p>
            <p className="relative mt-3 text-[15px] leading-relaxed text-white/70">{c.recitalD}</p>
            <p className="relative mt-4 border-t border-[rgb(var(--gold))]/20 pt-4 text-[13px] leading-relaxed text-white/55">{c.certD}</p>
          </div>
        </div>
        <ol className="mc-ladder relative grid gap-0">
          {c.levels.map((l, i) => {
            const last = i === c.levels.length - 1;
            return (
              <li key={l} className={`relative flex items-center gap-4 py-3.5 ${last ? "mc-ladder-top" : ""}`}>
                <HomeStar size={44} tone={last ? "gold" : "dark"} className="relative z-[1] shrink-0" label={`${c.levelWord} ${i + 1}`}>{i + 1}</HomeStar>
                <span className={`min-w-0 text-[16px] leading-snug ${last ? "font-bold text-[rgb(var(--gold))]" : "text-white/85"}`}>{l}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** the Talents community in short, linking to /talents */
export function TalentsTeaser({ locale }: { locale: string }) {
  const c = mc(locale).talents;
  return (
    <section className="hm-warm overflow-hidden">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[1fr_1fr]">
        <div>
          <McHead locale={locale} kicker={c.kicker} title={c.title} lead={c.lead} word="مواهب" />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/talents" className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-[15px] font-bold text-white transition hover:brightness-110">{c.kicker}</Link>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {c.levels.map(([t, d], i) => (
            <li key={t} className="hm-card p-5">
              <HomeCorners />
              <p className="flex items-center gap-2.5 font-bold"><HomeStar size={30} tone={i === 3 ? "gold" : "light"}>{i + 1}</HomeStar>{t}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Free vs Pro – texts and the price from messages "premium" (never written here) */
export async function PricingPlans({ locale, id = "pricing" }: { locale: string; id?: string }) {
  const c = mc(locale).pricing;
  const t = await getTranslations({ locale, namespace: "premium" });
  const free = [1, 2, 3, 4, 5].map((i) => t(`free${i}`));
  const pro = [1, 2, 3, 4, 5, 6, 7].map((i) => t(`f${i}Title`));
  return (
    <section id={id} className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <McHead locale={locale} kicker={c.kicker} title={c.title} lead={c.lead} center />
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-2">
          <div className="hm-card flex flex-col p-6 sm:p-8">
            <HomeCorners />
            <p className="hm-k text-[rgb(var(--hm-gold-d))]">{c.freeNote}</p>
            <h3 className="font-display mt-2 text-3xl">{c.freeT}</h3>
            <p className="mt-1 text-[15px] text-muted">{t("freeTitle")}</p>
            <ul className="mt-6 grid flex-1 gap-3 text-[15px]">
              {free.map((f) => <li key={f} className="flex gap-3"><StarGlyph size={11} className="mt-1 shrink-0 text-[rgb(var(--hm-gold))]" />{f}</li>)}
            </ul>
          </div>
          <div className="stage girih relative flex flex-col overflow-hidden rounded-xl p-6 text-[#eef0f3] ring-1 ring-[rgb(var(--gold))]/35 sm:p-8">
            <span className="illum-frame" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="hm-k text-[rgb(var(--gold))]">{c.proNote}</p>
                <h3 className="font-display mt-2 text-3xl">{c.proT}</h3>
              </div>
              <Seal size={44} />
            </div>
            <p className="relative mt-3 text-[15px] font-semibold text-[rgb(var(--gold))]">{t("price")}</p>
            <ul className="relative mt-6 grid flex-1 gap-3 text-[15px] text-white/85">
              {pro.map((f) => <li key={f} className="flex gap-3"><StarGlyph size={11} className="mt-1 shrink-0 text-[rgb(var(--gold))]" />{f}</li>)}
            </ul>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <a href={appStoreUrl()} className="btn-gold inline-flex h-11 items-center rounded-md px-5 text-sm font-bold" rel="noopener">{c.ctaApp}</a>
              <Link href="/premium" className="inline-flex h-11 items-center rounded-md border border-[rgb(var(--gold))]/45 px-5 text-sm font-bold transition hover:border-[rgb(var(--gold))] hover:bg-white/[0.04]">{c.cta}</Link>
            </div>
            <p className="relative mt-5 text-[12px] leading-relaxed text-white/50">{t("terms")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Voices of learners. Shows real, approved testimonials only; with none it renders a quiet invitation
 * (or nothing with `hideEmpty`). Never fill it with invented quotes.
 */
export function Voices({ locale, items, hideEmpty = false }: { locale: string; items: Testimonial[]; hideEmpty?: boolean }) {
  const c = mc(locale).voices;
  if (!items.length && hideEmpty) return null;
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <McHead locale={locale} kicker={c.kicker} title={c.title} center />
        {items.length ? (
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((v) => (
              <li key={v.name + v.quote.slice(0, 16)} className="hm-card flex flex-col p-6">
                <HomeCorners />
                <blockquote className="flex-1 text-[16px] leading-relaxed">“{v.quote}”</blockquote>
                <p className="mt-5 border-t border-[rgb(var(--hm-gold))]/25 pt-4 text-[14px] font-bold">{v.name}{v.place && <span className="font-normal text-muted"> · {v.place}</span>}</p>
                {v.role && <p className="text-[13px] text-muted">{v.role}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto mt-8 max-w-xl text-center">
            <div aria-hidden className="mc-rule mx-auto"><StarGlyph size={12} /></div>
            <p className="mt-5 text-[16px] leading-relaxed text-muted">{c.empty}</p>
            <Link href="/feedback" className={`${btnS} mx-auto mt-6 w-fit`}>{c.cta}</Link>
          </div>
        )}
      </div>
    </section>
  );
}
