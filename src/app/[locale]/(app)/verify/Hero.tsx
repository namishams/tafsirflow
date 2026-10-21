import type { ReactNode } from "react";

/** the dark green stage with gold, as on the other pages of the site */
export default function VerifyHero({ kicker, title, lead, children }: { kicker: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="stage girih relative z-[1] overflow-hidden text-[#eef0f3]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.1]" style={{ backgroundImage: "radial-gradient(circle at 80% 0%, rgb(var(--gold)) 0, transparent 45%)" }} />
      <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-14 sm:pb-20 sm:pt-20">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{kicker}</p>
        <h1 className="font-display mt-4 text-[38px] leading-[1.06] sm:text-6xl">{title}</h1>
        {lead ? <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{lead}</p> : null}
        {children ? <div className="mt-9">{children}</div> : null}
      </div>
    </section>
  );
}
