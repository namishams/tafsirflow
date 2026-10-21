"use client";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

const T = {
  en: { title: "Accounts", back: "Admin area", forbidden: "Admins only. Please sign in with the admin account.", total: "Accounts in total", found: "found", search: "Search by e-mail", go: "Search",
    email: "E-mail", created: "Created", plan: "Plan", until: "Pro until", pro: "Pro active", yes: "Yes", no: "No", buys: "Purchases", last: "Last activity", actions: "Actions", lasting: "lasting",
    grant: "Grant Premium (lasting)", grantUntil: "Grant Pro until date", revoke: "Revoke", date: "Date", apply: "Apply", prev: "Previous", next: "Next", page: "Page", none: "No accounts found.", error: "That did not work.", done: "Saved.",
    confirmRevoke: "Revoke Premium/Pro for this account?", confirmGrant: "Grant lasting Premium to this account?", free: "Free", premium: "Premium" },
  de: { title: "Konten", back: "Admin-Bereich", forbidden: "Nur für Administratoren. Bitte mit dem Admin-Konto anmelden.", total: "Konten gesamt", found: "gefunden", search: "Nach E-Mail suchen", go: "Suchen",
    email: "E-Mail", created: "Erstellt", plan: "Tarif", until: "Pro bis", pro: "Pro aktiv", yes: "Ja", no: "Nein", buys: "Käufe", last: "Letzte Aktivität", actions: "Aktionen", lasting: "dauerhaft",
    grant: "Premium vergeben (dauerhaft)", grantUntil: "Pro bis Datum vergeben", revoke: "Entziehen", date: "Datum", apply: "Übernehmen", prev: "Zurück", next: "Weiter", page: "Seite", none: "Keine Konten gefunden.", error: "Das hat nicht geklappt.", done: "Gespeichert.",
    confirmRevoke: "Premium/Pro für dieses Konto entziehen?", confirmGrant: "Diesem Konto dauerhaft Premium geben?", free: "Free", premium: "Premium" },
  ar: { title: "الحسابات", back: "لوحة الإدارة", forbidden: "للمشرفين فقط. يرجى تسجيل الدخول بحساب المشرف.", total: "إجمالي الحسابات", found: "نتيجة", search: "ابحث بالبريد الإلكتروني", go: "بحث",
    email: "البريد الإلكتروني", created: "تاريخ الإنشاء", plan: "الباقة", until: "Pro حتى", pro: "Pro فعّال", yes: "نعم", no: "لا", buys: "المشتريات", last: "آخر نشاط", actions: "إجراءات", lasting: "دائم",
    grant: "منح Premium (دائم)", grantUntil: "منح Pro حتى تاريخ", revoke: "سحب", date: "التاريخ", apply: "تطبيق", prev: "السابق", next: "التالي", page: "صفحة", none: "لا توجد حسابات.", error: "لم تنجح العملية.", done: "تم الحفظ.",
    confirmRevoke: "سحب Premium/Pro من هذا الحساب؟", confirmGrant: "منح هذا الحساب Premium دائمًا؟", free: "مجاني", premium: "Premium" },
};
type Row = { id: number; email: string; created_at: string; plan: string; pro_until: string | null; pro_active: boolean; purchases: number; last_activity: string | null };
type Data = { total: number; all: number; page: number; pages: number; users: Row[] };

export default function AdminUsers({ locale }: { locale: string }) {
  const t = T[locale === "de" ? "de" : locale === "ar" ? "ar" : "en"];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fmt = (s: string | null) => (s ? new Date(s).toLocaleString(locale === "ar" ? "ar" : locale === "de" ? "de-DE" : "en-GB", { dateStyle: "medium", timeStyle: "short" }) : "–");
  const fmtD = (s: string | null) => (s ? new Date(s).toLocaleDateString(locale === "ar" ? "ar" : locale === "de" ? "de-DE" : "en-GB") : "–");
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Data | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [msg, setMsg] = useState("");
  const [dates, setDates] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/users/list?q=${encodeURIComponent(applied)}&page=${page}`, { cache: "no-store" });
    if (r.status === 401 || r.status === 403) return setForbidden(true);
    if (!r.ok) return setMsg(t.error);
    setData(await r.json());
  }, [applied, page, t.error]);
  useEffect(() => { load(); }, [load]);

  async function act(id: number, action: string, date?: string) {
    setMsg("");
    const r = await fetch("/api/admin/users/action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action, date }) });
    if (!r.ok) return setMsg(t.error);
    setMsg(t.done);
    load();
  }

  const btn = "rounded-full border border-line px-3 py-1 text-xs font-semibold hover:border-accent";
  const field = "rounded-lg border border-line bg-bg px-3 py-2 text-sm";
  if (forbidden) return <main dir={dir} className="mx-auto max-w-5xl px-4 py-10"><p className="rounded-2xl border border-line bg-surface p-6 shadow-card">{t.forbidden}</p></main>;
  return (
    <main dir={dir} className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">{t.title}</h1>
        <Link href="/admin" className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium hover:border-accent">← {t.back}</Link>
      </header>
      <form className="mb-4 flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(q.trim()); }}>
        <input className={`${field} w-72 max-w-full`} type="search" placeholder={t.search} aria-label={t.search} value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} />
        <button type="submit" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">{t.go}</button>
        {data && <span className="text-sm text-muted">{t.total}: <b className="text-ink">{data.all}</b>{applied ? ` · ${data.total} ${t.found}` : ""}</span>}
      </form>
      {msg ? <p role="status" className="mb-3 text-sm font-semibold text-accent">{msg}</p> : null}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
        <table className="w-full min-w-[860px] text-start text-sm">
          <thead className="text-xs text-muted"><tr>{[t.email, t.created, t.plan, t.until, t.pro, t.buys, t.last, t.actions].map((h) => <th key={h} className="px-3 py-2.5 text-start font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {data?.users.map((u) => (
              <tr key={u.id} className="border-t border-line align-top">
                <td className="px-3 py-2.5 font-medium" dir="ltr">{u.email}</td>
                <td className="px-3 py-2.5">{fmtD(u.created_at)}</td>
                <td className="px-3 py-2.5">{u.plan === "premium" ? t.premium : t.free}</td>
                <td className="px-3 py-2.5">{u.plan === "premium" ? (u.pro_until ? fmtD(u.pro_until) : t.lasting) : "–"}</td>
                <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.pro_active ? "bg-accent-soft text-accent" : "bg-line text-muted"}`}>{u.pro_active ? t.yes : t.no}</span></td>
                <td className="px-3 py-2.5">{u.purchases}</td>
                <td className="px-3 py-2.5">{fmt(u.last_activity)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button className={btn} onClick={() => confirm(t.confirmGrant) && act(u.id, "grant_premium")}>{t.grant}</button>
                    <button className={btn} onClick={() => confirm(t.confirmRevoke) && act(u.id, "revoke")}>{t.revoke}</button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input type="date" aria-label={t.date} className={`${field} !py-1 text-xs`} value={dates[u.id] ?? ""} onChange={(e) => setDates({ ...dates, [u.id]: e.target.value })} />
                    <button className={`${btn} disabled:opacity-50`} disabled={!dates[u.id]} onClick={() => act(u.id, "grant_pro_until", dates[u.id])}>{t.grantUntil}</button>
                  </div>
                </td>
              </tr>
            ))}
            {data && !data.users.length && <tr><td colSpan={8} className="px-3 py-6 text-center text-muted">{t.none}</td></tr>}
          </tbody>
        </table>
      </div>
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button className={btn} disabled={page <= 1} onClick={() => setPage(page - 1)}>{t.prev}</button>
          <span>{t.page} {data.page} / {data.pages}</span>
          <button className={btn} disabled={page >= data.pages} onClick={() => setPage(page + 1)}>{t.next}</button>
        </div>
      )}
    </main>
  );
}
