import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowNext } from "@/components/Icons";
import { BP_PATHS, operatorLine, type BpPage, type BpText } from "@/lib/blueprint/text";
import "@/styles/art-practice.css";
import "@/styles/blueprint.css";

// Page parts shared by the Blueprint pages: dark hero, section navigation, headings, status badges, the call to
// action and the legal notice that closes every page of this section (owner, 23.10.2026: mandatory).

const ORDER: BpPage[] = ["overview", "studio", "live", "academy", "partners"];

export function BpHero({ t, title, lead, note, children, actions = true }: { t: BpText; title: string; lead: string; note?: string; children?: ReactNode; actions?: boolean }) {
  return (
    <section className="stage girih bp-hero relative overflow-hidden text-[#eef0f3]">
      <span className="bp-orb left-[-10%] top-[-20%] h-[420px] w-[420px] bg-[#1d7a5c]/40" />
      <span className="bp-orb right-[-12%] top-[10%] h-[380px] w-[380px] bg-[#d6b46c]/15" />
      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-5 sm:pb-20 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="rise"><span className="bp-kicker">{t.common.kicker}</span></p>
          <h1 className="rise font-display mt-5 text-[34px] leading-[1.06] sm:text-[52px] lg:text-6xl" style={{ animationDelay: "80ms" }}>{title}</h1>
          <p className="rise mx-auto mt-5 max-w-2xl text-[16.5px] leading-relaxed text-white/75 sm:text-[18px]" style={{ animationDelay: "160ms" }}>{lead}</p>
          {note ? <p className="rise mx-auto mt-5 inline-flex max-w-xl items-center gap-2 rounded-full border border-[rgb(214_180_108)]/35 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[rgb(233_207_153)]" style={{ animationDelay: "220ms" }}>{note}</p> : null}
          {actions ? (
            <div className="rise mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "260ms" }}>
              <Link href={BP_PATHS.partners} className="btn-gold inline-flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-bold">{t.common.ctaPartner}</Link>
              <a href="#bp-start" className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-7 text-[15px] font-semibold text-white/90 transition hover:border-[rgb(214_180_108)]">{t.common.ctaRead}</a>
            </div>
          ) : null}
        </div>
        {children ? <div className="mt-12 sm:mt-14">{children}</div> : null}
      </div>
      <div className="pa-arcade" />
    </section>
  );
}

/** the section navigation (Overview · Studio · Live school · Academy · Become a partner) */
export function BpSubNav({ t, active }: { t: BpText; active: BpPage }) {
  return (
    <nav aria-label={t.nav.label} className="relative z-[2] mx-auto -mt-6 flex max-w-6xl justify-center px-4 sm:px-5">
      <div className="bp-subnav max-w-full shadow-[0_14px_30px_-20px_rgb(0_0_0_/_.5)]">
        {ORDER.map((p) => <Link key={p} href={BP_PATHS[p]} aria-current={p === active ? "page" : undefined}>{t.nav[p]}</Link>)}
      </div>
    </nav>
  );
}

export function SectionHead({ kicker, title, lead, center = false, dark = false, id }: { kicker?: string; title: string; lead?: string; center?: boolean; dark?: boolean; id?: string }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {kicker ? <p className={`text-[12px] font-semibold uppercase tracking-[0.2em] rtl:tracking-normal ${dark ? "text-[rgb(233_207_153)]" : "text-gold"}`}>{kicker}</p> : null}
      <h2 id={id} className={`font-display mt-3 text-[30px] leading-[1.1] sm:text-4xl ${center ? "text-center" : ""}`}>{title}</h2>
      {lead ? <p className={`mt-4 text-[16px] leading-relaxed ${dark ? "text-white/70" : "text-muted"}`}>{lead}</p> : null}
    </div>
  );
}

export function StatusBadge({ t, built }: { t: BpText; built: boolean }) {
  return built
    ? <span className="bp-badge bp-badge-built"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>{t.common.built}</span>
    : <span className="bp-badge bp-badge-plan"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>{t.common.planned}</span>;
}

/** gold star with a number (steps, phases) */
export function StarNum({ n, size = 44 }: { n: number | string; size?: number }) {
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size} height={size} className="absolute inset-0" aria-hidden>
        <path d="M24 2l5.4 8.6 9.9-2.3-2.3 9.9L45.6 24l-8.6 5.4 2.3 9.9-9.9-2.3L24 45.6l-5.4-8.6-9.9 2.3 2.3-9.9L2.4 24l8.6-5.4-2.3-9.9 9.9 2.3z" fill="rgb(201 166 94 / .14)" stroke="rgb(201 166 94)" strokeWidth="1.2" />
      </svg>
      <span className="relative text-[15px] font-extrabold text-gold">{n}</span>
    </span>
  );
}

/** "Next: Studio" – leads through the pages of the section */
export function NextPage({ t, active }: { t: BpText; active: BpPage }) {
  const i = ORDER.indexOf(active);
  const next = ORDER[(i + 1) % ORDER.length];
  return (
    <Link href={BP_PATHS[next]} className="pa-card pa-card-hover group mt-14 flex items-center justify-between gap-4 p-5 sm:p-6">
      <span><span className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-gold rtl:tracking-normal">{t.common.nextPage}</span><span className="mt-1 block text-[20px] font-extrabold">{t.nav[next]}</span></span>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgb(201_166_94)]/60 text-gold"><ArrowNext /></span>
    </Link>
  );
}

/** the closing call to action (dark) */
export function BpCta({ t, title, lead }: { t: BpText; title: string; lead: string }) {
  return (
    <section className="stage girih relative mt-16 overflow-hidden rounded-[14px] px-6 py-12 text-center text-[#eef0f3] sm:px-12 sm:py-16">
      <span className="bp-orb left-1/2 top-[-40%] h-[300px] w-[300px] -translate-x-1/2 bg-[#d6b46c]/20" />
      <h2 className="font-display mx-auto max-w-2xl text-[28px] leading-[1.1] sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-white/75">{lead}</p>
      <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <Link href={BP_PATHS.partners} className="btn-gold inline-flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-bold">{t.common.ctaPartner}</Link>
        <Link href="/support" className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-7 text-[15px] font-semibold text-white/90 transition hover:border-[rgb(214_180_108)]">{t.common.ctaSupport}</Link>
      </div>
    </section>
  );
}

/** the mandatory notice at the end of every Blueprint page: no public offer, no advice, no returns; operator */
export function BpLegal({ t }: { t: BpText }) {
  return (
    <aside aria-labelledby="bp-legal" className="bp-legal mt-14 pt-8">
      <div className="callout rounded-xl p-5 sm:p-7">
        <h2 id="bp-legal" className="text-[13px] font-bold uppercase tracking-[0.16em] text-gold rtl:tracking-normal">{t.common.legalTitle}</h2>
        <p className="mt-3 text-[15.5px] font-semibold leading-relaxed text-ink">{t.common.legal}</p>
        <ul className="mt-3 grid gap-1.5 text-[14px] leading-relaxed text-muted">
          <li>{t.common.shariah}</li>
          <li>{t.common.noCrypto}</li>
          <li>{t.common.bank}</li>
          <li>{t.common.mockNote}</li>
        </ul>
        <p className="mt-4 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">{operatorLine(t)}</p>
      </div>
    </aside>
  );
}
