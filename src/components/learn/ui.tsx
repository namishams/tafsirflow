// Shared building blocks of the learning sections ported from the app (courses, Madrasa, cards, Reciter Path, Arabic),
// in the website's emerald-and-gold design: the dark practice hero with the arch window, gilded cards (hm-card),
// gold and outline buttons, progress bars (hm-bar), list rows, answer options (hm-opt), notes and callouts.
// Server-safe: no hooks, so server pages and client screens can both use them. Mirrors mobile/src/features/coursekit/ui.tsx
// and mobile/src/components/{brand,page}.tsx in purpose, not in code.
import { Link } from "@/i18n/navigation";
import { ArrowBack } from "@/components/Icons";
import { PracticeWindow } from "@/components/art/PracticeArt";
import { HomeCorners, StarGlyph } from "@/components/art/HomeOrnaments";

type Children = { children?: React.ReactNode };
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** dark stage hero: back link, kicker, title, lead, actions; the arch window with an Arabic word stands behind */
export function LearnHero({ kicker, title, lead, word, back, children, uid = "lh", aside, wide = false }: {
  kicker?: React.ReactNode; title: React.ReactNode; lead?: React.ReactNode; word?: string; back?: { href: string; label: string };
  children?: React.ReactNode; uid?: string; aside?: React.ReactNode; wide?: boolean;
}) {
  return (
    <section className="stage girih relative overflow-hidden text-[#eef0f3]">
      <PracticeWindow uid={`${uid}-w`} word={word} className="absolute -end-10 top-4 h-[220px] w-auto opacity-25 md:-end-2 md:h-[280px] md:opacity-50" />
      <div className={cx("relative mx-auto px-5 pb-12 sm:pb-16", wide ? "max-w-6xl" : "max-w-4xl", back ? "pt-6" : "pt-10 sm:pt-14")}>
        {back && <Link href={back.href} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white"><ArrowBack /> {back.label}</Link>}
        <div className={cx(!!aside && "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end")}>
          <div className="min-w-0">
            {kicker && <p className={cx("rise text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal", back ? "mt-4" : "")}>{kicker}</p>}
            <h1 className="rise font-display mt-3 max-w-3xl text-[36px] leading-[1.06] sm:text-[48px]" style={{ animationDelay: "100ms" }}>{title}</h1>
            {lead && <div className="rise mt-4 max-w-2xl text-[17px] leading-relaxed text-white/70" style={{ animationDelay: "200ms" }}>{lead}</div>}
            {children && <div className="rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: "300ms" }}>{children}</div>}
          </div>
          {aside && <div className="min-w-0">{aside}</div>}
        </div>
      </div>
      <div className="pa-arcade" />
    </section>
  );
}

/** the page body under a hero */
export function LearnMain({ children, wide = false, className = "" }: Children & { wide?: boolean; className?: string }) {
  return <main className={cx("mx-auto px-4 pb-24 pt-8 sm:px-5", wide ? "max-w-6xl" : "max-w-4xl", className)}>{children}</main>;
}

/** gilded card with corner ornaments */
export function Card({ children, className = "", lift = false, id }: Children & { className?: string; lift?: boolean; id?: string }) {
  return <div id={id} className={cx("hm-card relative p-5 sm:p-6", lift && "hm-lift", className)}><HomeCorners />{children}</div>;
}

/** a card that is a link */
export function CardLink({ href, children, className = "" }: Children & { href: string; className?: string }) {
  return <Link href={href} className={cx("hm-card hm-lift group relative flex flex-col p-5 sm:p-6", className)}><HomeCorners />{children}</Link>;
}

export function SectionTitle({ title, lead, className = "", id }: { title: React.ReactNode; lead?: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={cx("scroll-mt-20", className)}>
      <h2 className="font-display flex items-center gap-2.5 text-2xl sm:text-[28px]"><StarGlyph size={15} className="shrink-0 text-[rgb(var(--hm-gold))]" />{title}</h2>
      {lead && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{lead}</p>}
    </div>
  );
}

export function Kicker({ children, className = "" }: Children & { className?: string }) {
  return <p className={cx("hm-k text-[rgb(var(--hm-gold-d))]", className)}>{children}</p>;
}

const goldCls = "btn-gold inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-40";
const outlineCls = (dark: boolean) => cx("inline-flex h-12 items-center justify-center gap-2 rounded-md border px-6 text-[15px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40",
  dark ? "border-[rgb(var(--gold))]/40 text-white hover:border-[rgb(var(--gold))] hover:bg-white/[0.04]" : "border-[rgb(var(--hm-gold))]/60 hover:border-[rgb(var(--hm-gold))] hover:bg-[rgb(var(--hm-gold))]/10");

export function GoldLink({ href, children, className = "" }: Children & { href: string; className?: string }) {
  return <Link href={href} className={cx(goldCls, className)}>{children}</Link>;
}
export function OutlineLink({ href, children, dark = false, className = "" }: Children & { href: string; dark?: boolean; className?: string }) {
  return <Link href={href} className={cx(outlineCls(dark), className)}>{children}</Link>;
}
type BtnProps = Children & { onClick?: () => void; disabled?: boolean; className?: string; type?: "button" | "submit"; label?: string };
export function GoldButton({ children, onClick, disabled, className = "", type = "button", label }: BtnProps) {
  return <button type={type} onClick={onClick} disabled={disabled} aria-label={label} className={cx(goldCls, className)}>{children}</button>;
}
export function OutlineButton({ children, onClick, disabled, className = "", type = "button", dark = false, label }: BtnProps & { dark?: boolean }) {
  return <button type={type} onClick={onClick} disabled={disabled} aria-label={label} className={cx(outlineCls(dark), className)}>{children}</button>;
}
/** a quiet text button (accent colour) */
export function TextButton({ children, onClick, className = "" }: BtnProps) {
  return <button type="button" onClick={onClick} className={cx("inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-accent hover:underline", className)}>{children}</button>;
}

/** progress bar 0..1 */
export function Bar({ value, gold = false, className = "", label }: { value: number; gold?: boolean; className?: string; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value || 0)) * 100);
  return <span role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label} className={cx("hm-bar", gold && "is-gold", className)}><i style={{ width: `${pct}%` }} /></span>;
}

/** a list of rows in one gilded frame */
export function RowList({ children, className = "" }: Children & { className?: string }) {
  return <ul className={cx("hm-card relative divide-y divide-line overflow-hidden !p-0", className)}>{children}</ul>;
}
/** one row: optional leading element, title, sub line, trailing element; a link or a static row */
export function Row({ href, onClick, lead, title, sub, trail, locked, done, children }: {
  href?: string; onClick?: () => void; lead?: React.ReactNode; title: React.ReactNode; sub?: React.ReactNode; trail?: React.ReactNode; locked?: boolean; done?: boolean; children?: React.ReactNode;
}) {
  const inner = (
    <>
      {lead && <span className="shrink-0">{lead}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] font-semibold leading-snug">{title}</span>
        {sub && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{sub}</span>}
        {children}
      </span>
      {trail ?? (done ? <span aria-hidden className="text-accent">✓</span> : locked ? <span aria-hidden className="text-[rgb(var(--hm-gold))]">○</span> : (href || onClick) ? <span aria-hidden className="text-muted rtl:-scale-x-100">›</span> : null)}
    </>
  );
  const cls = cx("flex min-h-[64px] w-full items-center gap-4 px-4 py-3 text-start sm:px-5", (href || onClick) && "transition hover:bg-[rgb(var(--hm-gold))]/[0.06]", locked && "opacity-60");
  return (
    <li>
      {href && !locked ? <Link href={href} className={cls}>{inner}</Link>
        : onClick && !locked ? <button type="button" onClick={onClick} className={cls}>{inner}</button>
        : <div className={cls} aria-disabled={locked || undefined}>{inner}</div>}
    </li>
  );
}

/** gold hairline callout */
export function Callout({ children, className = "", title }: Children & { className?: string; title?: React.ReactNode }) {
  return <div className={cx("callout rounded-lg p-5 text-[15px] leading-relaxed", className)}>{title && <p className="mb-1 font-bold">{title}</p>}{children}</div>;
}

/** short status note with a coloured mark */
export function Note({ tone = "gold", title, children, className = "" }: Children & { tone?: "gold" | "accent" | "red" | "muted"; title: React.ReactNode; className?: string }) {
  const dot = tone === "accent" ? "bg-accent" : tone === "red" ? "bg-red-600" : tone === "muted" ? "bg-muted" : "bg-[rgb(var(--hm-gold))]";
  return (
    <div className={cx("flex gap-3 rounded-lg border border-line bg-surface p-4", className)} role="status">
      <span aria-hidden className={cx("mt-2 h-2 w-2 shrink-0 rotate-45 rounded-[2px]", dot)} />
      <div className="min-w-0">
        <p className="text-[14.5px] font-semibold">{title}</p>
        {children && <div className="mt-1 text-[13.5px] leading-relaxed text-muted">{children}</div>}
      </div>
    </div>
  );
}

/** small rounded label */
export function Pill({ children, tone = "line", className = "" }: Children & { tone?: "line" | "gold" | "accent"; className?: string }) {
  const t = tone === "gold" ? "border-[rgb(var(--hm-gold))]/50 text-[rgb(var(--hm-gold-d))]" : tone === "accent" ? "border-accent/40 bg-accent-soft text-accent" : "border-line text-muted";
  return <span className={cx("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold", t, className)}>{children}</span>;
}

/** one answer of a quiz: neutral, chosen, right, wrong */
export function Option({ state = "idle", onClick, disabled, children, dir, className = "" }: Children & {
  state?: "idle" | "chosen" | "right" | "wrong" | "dim"; onClick?: () => void; disabled?: boolean; dir?: "rtl" | "ltr" | "auto"; className?: string;
}) {
  const s = state === "right" ? "border-accent bg-accent-soft text-accent pa-right"
    : state === "wrong" ? "border-red-600/60 bg-red-600/[0.06] text-red-700 dark:text-red-400 pa-shake"
    : state === "chosen" ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/10"
    : state === "dim" ? "border-line opacity-55"
    : "border-line hover:border-[rgb(var(--hm-gold))]/70 hover:bg-[rgb(var(--hm-gold))]/[0.05]";
  return (
    <button type="button" onClick={onClick} disabled={disabled} dir={dir} aria-pressed={state === "chosen" || undefined}
      className={cx("hm-opt w-full border bg-surface px-4 pb-3.5 pt-4 text-start text-[15.5px] font-semibold leading-snug transition duration-200 disabled:cursor-default", s, className)}>
      {children}
    </button>
  );
}

/** Arabic text in the Quran face */
export function Ar({ children, className = "", size = "text-[26px]" }: Children & { className?: string; size?: string }) {
  return <span lang="ar" dir="rtl" className={cx("font-arabic leading-[1.9]", size, className)}>{children}</span>;
}

export function Spinner({ label, className = "" }: { label?: string; className?: string }) {
  return <span role="status" className={cx("inline-flex items-center gap-2 text-sm text-muted", className)}><span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-[rgb(var(--hm-gold))]/30 border-t-[rgb(var(--hm-gold))]" />{label}</span>;
}

/** a grid of stat tiles (number + label) */
export function Stats({ items, className = "" }: { items: { n: React.ReactNode; l: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cx("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {items.map((x, i) => (
        <div key={i} className="hm-card relative p-4"><HomeCorners /><dd className="font-display text-[26px] leading-none tabular-nums text-[rgb(var(--hm-gold-d))]">{x.n}</dd><dt className="mt-2 text-[12.5px] leading-snug text-muted">{x.l}</dt></div>
      ))}
    </dl>
  );
}

/** a hero-side stat panel on the dark stage */
export function StageStats({ items }: { items: { n: React.ReactNode; l: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-3 gap-2">
      {items.map((x, i) => (
        <div key={i} className="rounded-lg border border-[rgb(var(--gold))]/25 bg-white/[0.04] p-3">
          <dd className="font-display text-[24px] leading-none text-[rgb(var(--gold))]">{x.n}</dd>
          <dt className="mt-1.5 text-[11.5px] leading-snug text-white/60">{x.l}</dt>
        </div>
      ))}
    </dl>
  );
}
