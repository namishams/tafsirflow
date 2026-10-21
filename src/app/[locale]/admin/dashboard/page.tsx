import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";
import { loadDashboard, type Dash } from "@/lib/adminDashboard";

// /admin/dashboard – totals and trends for admins (read-only, aggregated counts only, no personal data)
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

const T = {
  en: {
    title: "Dashboard", lead: "Totals and trends, aggregated. No personal data.", forbidden: "Admins only. Please sign in with the admin account.",
    users: "Accounts", people: "Accounts in total", week: "New in 7 days", premium: "Premium (lasting)", pro: "Pro (active subscription)", signups: "Sign-ups per day, last 30 days", active: "Active learners (last 7 days)",
    community: "Community", profiles: "Profiles", follows: "Follows", connections: "Connections", messages: "Messages", moments: "Achievement moments", reactions: "Reactions", credited: "Counted encouragements",
    stages: "Study stages", levels: "XP levels", funnel: "Feed offers, last 30 days", offer: "Offer", imp: "Shown", tap: "Tapped", buy: "Bought",
    certs: "Certificates", valid: "Issued", pending: "Pending", rejected: "Rejected", revoked: "Revoked", reports: "Open reports", none: "No data yet.",
    stage: { ibtidai: "Primary", idadi: "Preparatory", thanawi: "Secondary", ali: "Higher" } as Record<string, string>,
    links: "Manage", usersLink: "Accounts and plans", talentsLink: "Talents moderation",
  },
  de: {
    title: "Dashboard", lead: "Summen und Verläufe, zusammengefasst. Keine personenbezogenen Daten.", forbidden: "Nur für Administratoren. Bitte mit dem Admin-Konto anmelden.",
    users: "Konten", people: "Konten insgesamt", week: "Neu in 7 Tagen", premium: "Premium (dauerhaft)", pro: "Pro (laufendes Abo)", signups: "Anmeldungen pro Tag, letzte 30 Tage", active: "Aktive Lernende (letzte 7 Tage)",
    community: "Community", profiles: "Profile", follows: "Folgen", connections: "Verbindungen", messages: "Nachrichten", moments: "Erfolgsmomente", reactions: "Reaktionen", credited: "Gezählte Ermutigungen",
    stages: "Lernstufen", levels: "XP-Stufen", funnel: "Feed-Angebote, letzte 30 Tage", offer: "Angebot", imp: "Gezeigt", tap: "Angetippt", buy: "Gekauft",
    certs: "Zertifikate", valid: "Ausgestellt", pending: "In Prüfung", rejected: "Abgelehnt", revoked: "Widerrufen", reports: "Offene Meldungen", none: "Noch keine Daten.",
    stage: { ibtidai: "Grundstufe", idadi: "Vorbereitungsstufe", thanawi: "Oberstufe", ali: "Höhere Stufe" } as Record<string, string>,
    links: "Verwalten", usersLink: "Konten und Tarife", talentsLink: "Talents-Moderation",
  },
  ar: {
    title: "لوحة المتابعة", lead: "إجماليات واتجاهات مجمّعة، دون بيانات شخصية.", forbidden: "للمشرفين فقط. يُرجى تسجيل الدخول بحساب المشرف.",
    users: "الحسابات", people: "إجمالي الحسابات", week: "جديد خلال 7 أيام", premium: "بريميوم (دائم)", pro: "برو (اشتراك فعّال)", signups: "التسجيلات يومياً، آخر 30 يوماً", active: "متعلمون نشطون (آخر 7 أيام)",
    community: "المجتمع", profiles: "الملفات", follows: "المتابعات", connections: "الصلات", messages: "الرسائل", moments: "لحظات الإنجاز", reactions: "التفاعلات", credited: "تشجيعات محتسبة",
    stages: "المراحل الدراسية", levels: "مستويات الخبرة", funnel: "عروض الخلاصة، آخر 30 يوماً", offer: "العرض", imp: "عُرض", tap: "نُقر", buy: "اشتُري",
    certs: "الشهادات", valid: "صادرة", pending: "قيد المراجعة", rejected: "مرفوضة", revoked: "ملغاة", reports: "بلاغات مفتوحة", none: "لا بيانات بعد.",
    stage: { ibtidai: "الابتدائية", idadi: "الإعدادية", thanawi: "الثانوية", ali: "العالية" } as Record<string, string>,
    links: "الإدارة", usersLink: "الحسابات والخطط", talentsLink: "إشراف المواهب",
  },
};
type Tx = typeof T.en;

function Card({ label, value, hint }: { label: string; value: string; hint?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-[13px] text-muted">{label}</div>
      <div className={`mt-1 font-display text-3xl tabular-nums ${hint ? "text-gold" : "text-accent"}`}>{value}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-10"><h2 className="font-display text-2xl">{title}</h2><div className="mt-4">{children}</div></section>;
}
function Bars({ rows, label, empty }: { rows: { id: string; n: number }[]; label: (id: string) => string; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (!rows.length) return <p className="text-muted">{empty}</p>;
  return (
    <ul className="grid gap-2">
      {rows.map((r) => (
        <li key={r.id} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-sm">
          <span className="truncate">{label(r.id)}</span>
          <span className="h-3 overflow-hidden rounded-full bg-accent-soft"><span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(2, (100 * r.n) / max)}%` }} /></span>
          <span className="tabular-nums text-end">{r.n}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t: Tx = (T as Record<string, Tx>)[locale] ?? T.en;
  const admin = await requireAdmin();
  if (!admin) return <div className="mx-auto max-w-4xl px-5 py-10"><h1 className="font-display text-4xl">{t.title}</h1><p className="callout mt-8 rounded-lg p-6">{t.forbidden}</p></div>;
  const d: Dash = await loadDashboard();
  const f = new Intl.NumberFormat(locale);
  const n = (v: number) => f.format(v);
  const maxDay = Math.max(1, ...d.signups.map((s) => s.n));
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-display text-4xl">{t.title}</h1>
      <p className="mt-2 text-muted">{t.lead}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/${locale}/admin/users`} className="btn-gold inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold">{t.usersLink}</Link>
        <Link href={`/${locale}/admin/talents`} className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm font-semibold hover:bg-bg">{t.talentsLink}</Link>
      </div>

      <Section title={t.users}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card label={t.people} value={n(d.accounts.total)} />
          <Card label={t.week} value={n(d.accounts.week)} />
          <Card label={t.premium} value={n(d.accounts.premium)} hint />
          <Card label={t.pro} value={n(d.accounts.pro)} hint />
          <Card label={t.active} value={n(d.active7)} />
          <Card label={t.reports} value={n(d.reportsOpen)} hint={d.reportsOpen > 0} />
        </div>
        <h3 className="mt-6 text-sm font-semibold text-muted">{t.signups}</h3>
        <div role="img" aria-label={t.signups} className="mt-2 flex h-32 items-end gap-[3px] rounded-xl border border-line bg-surface p-3" dir="ltr">
          {d.signups.map((s) => (
            <div key={s.day} title={`${s.day}: ${s.n}`} className="flex-1 rounded-t bg-accent/80" style={{ height: `${Math.max(2, (100 * s.n) / maxDay)}%` }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted" dir="ltr"><span>{d.signups[0]?.day}</span><span>{d.signups[d.signups.length - 1]?.day}</span></div>
      </Section>

      <Section title={t.community}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card label={t.profiles} value={n(d.community.profiles)} />
          <Card label={t.follows} value={n(d.community.follows)} />
          <Card label={t.connections} value={n(d.community.connections)} />
          <Card label={t.messages} value={n(d.community.messages)} />
          <Card label={t.moments} value={n(d.community.moments)} hint />
          <Card label={t.reactions} value={n(d.community.reactions)} hint />
          <Card label={t.credited} value={n(d.community.credited)} hint />
        </div>
      </Section>

      <div className="grid gap-x-10 md:grid-cols-2">
        <Section title={t.stages}><Bars rows={d.stages} label={(id) => t.stage[id] ?? id} empty={t.none} /></Section>
        <Section title={t.levels}><Bars rows={["1-4", "5-9", "10-24", "25-49", "50+"].map((id) => ({ id, n: d.levels.find((x) => x.id === id)?.n ?? 0 }))} label={(id) => id} empty={t.none} /></Section>
      </div>

      <Section title={t.funnel}>
        {d.funnel.length ? (
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full text-sm">
              <thead><tr className="text-muted"><th className="p-3 text-start font-medium">{t.offer}</th><th className="p-3 text-end font-medium">{t.imp}</th><th className="p-3 text-end font-medium">{t.tap}</th><th className="p-3 text-end font-medium">{t.buy}</th></tr></thead>
              <tbody>{d.funnel.map((o) => (
                <tr key={o.offer} className="border-t border-line"><td className="p-3">{o.offer}</td><td className="p-3 text-end tabular-nums">{n(o.imp)}</td><td className="p-3 text-end tabular-nums">{n(o.tap)}</td><td className="p-3 text-end tabular-nums text-gold">{n(o.buy)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p className="text-muted">{t.none}</p>}
      </Section>

      <Section title={t.certs}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card label={t.valid} value={n(d.certificates.valid)} hint />
          <Card label={t.pending} value={n(d.certificates.pending)} />
          <Card label={t.rejected} value={n(d.certificates.rejected)} />
          <Card label={t.revoked} value={n(d.certificates.revoked)} />
        </div>
      </Section>
    </div>
  );
}
