"use client";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LOCALE_META } from "@/i18n/locales";
import { fetchMe, type Me } from "@/lib/sync";
import { SUGGESTED, adhanUrl, resetAdhanCache, type AdhanFile } from "@/lib/adhan";

// Admin is for the owner: German with English fallback (kept in one place, not in the public messages)
const T = {
  de: { admin: "Admin-Bereich", overview: "Übersicht", users: "Nutzer", tafsir: "Tafsir-Editor", settings: "Einstellungen", moderation: "Moderation", forbidden: "Kein Zugriff. Melde dich mit dem Admin-Konto an.", signIn: "Zur Anmeldung", home: "Zur App",
    users_n: "Nutzer gesamt", users_w: "Neu (7 Tage)", sessions: "Aktive Sitzungen", cached: "Gespeicherte Quran.com-Inhalte", entries: "Eigene Tafsir-Einträge", drafts: "Entwürfe zur Freigabe",
    email: "E-Mail", name: "Name", role: "Rolle", plan: "Tarif", since: "Seit", makeAdmin: "Zum Admin", makeUser: "Admin entziehen", premium: "Premium", free: "Free",
    limit: "Tafsir-Limit für Besucher ohne Konto (Verse pro Tag)", limitHelp: "Wer nicht angemeldet ist, darf pro Tag so viele verschiedene Verse mit Tafsir öffnen. Danach ist ein kostenloses Konto nötig. 0 = sofort Konto nötig.", save: "Speichern", saved: "Gespeichert",
    lang: "Sprache", surah: "Sure", from: "Vers von", to: "bis", source: "Quelle", content: "Text (HTML erlaubt: <p>, <b>, <i>, <h3>)", ai: "KI-generiert (muss vor Veröffentlichung geprüft werden)", status: "Status", draft: "Entwurf", approved: "Freigegeben",
    create: "Eintrag anlegen", update: "Änderung speichern", cancel: "Abbrechen", edit: "Bearbeiten", del: "Löschen", approve: "Freigeben", unapprove: "Zurück zu Entwurf", none: "Noch keine Einträge.", confirm: "Wirklich löschen?",
    note: "Freigegebene Einträge erscheinen in der App unter „Quran Masterclass“ als eigene Tafsir-Quelle in dieser Sprache." },
  en: { admin: "Admin area", overview: "Overview", users: "Users", tafsir: "Tafsir editor", settings: "Settings", moderation: "Moderation", forbidden: "No access. Sign in with the admin account.", signIn: "Go to sign-in", home: "Back to app",
    users_n: "Total users", users_w: "New (7 days)", sessions: "Active sessions", cached: "Stored Quran.com items", entries: "Own tafsir entries", drafts: "Drafts to approve",
    email: "E-mail", name: "Name", role: "Role", plan: "Plan", since: "Since", makeAdmin: "Make admin", makeUser: "Remove admin", premium: "Premium", free: "Free",
    limit: "Tafsir limit for visitors without account (verses per day)", limitHelp: "Signed-out visitors may open tafsir for this many different verses per day, then a free account is needed. 0 = account needed at once.", save: "Save", saved: "Saved",
    lang: "Language", surah: "Surah", from: "Verse from", to: "to", source: "Source", content: "Text (HTML allowed: <p>, <b>, <i>, <h3>)", ai: "AI-generated (must be reviewed before publishing)", status: "Status", draft: "Draft", approved: "Approved",
    create: "Create entry", update: "Save changes", cancel: "Cancel", edit: "Edit", del: "Delete", approve: "Approve", unapprove: "Back to draft", none: "No entries yet.", confirm: "Really delete?",
    note: "Approved entries appear in the app as the “Quran Masterclass” tafsir source in that language." },
} as const;

type Entry = { id: number; language: string; source: string; surah: number; verse_from: number; verse_to: number; html: string; status: "draft" | "approved"; generated_by_ai: boolean };
type Row = { id: number; email: string; first_name: string | null; last_name: string | null; name: string | null; country: string | null; city: string | null; goal: string | null; marketing_opt_in: boolean; email_verified: boolean; role: string; plan: string; created_at: string; last_login_at: string | null };

async function api<T>(url: string, method = "GET", body?: unknown): Promise<T> {
  const r = await fetch(url, { method, headers: body ? { "content-type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

const card = "rounded-2xl border border-line bg-surface p-5 shadow-card";
const field = "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm";
const btn = "rounded-full border border-line px-3.5 py-1.5 text-sm font-medium hover:border-accent";
const btnP = "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white";

export default function AdminPanel() {
  const locale = useLocale();
  const t = T[locale === "de" ? "de" : "en"];
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [tab, setTab] = useState<"overview" | "insights" | "control" | "ranking" | "users" | "tafsir" | "moderation" | "feedback" | "adhan">("overview");

  useEffect(() => { fetchMe().then((r) => setMe(r.user)); }, []);

  if (me === undefined) return null;
  if (!me || me.role !== "admin")
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <p className="mb-4">{t.forbidden}</p>
        <Link href="/account" className={btnP}>{t.signIn}</Link>
      </main>
    );

  const de = locale === "de";
  const tabs = [["overview", t.overview], ["insights", de ? "Statistik" : "Insights"], ["control", de ? "Steuerung" : "Controls"], ["ranking", "Ranking"], ["users", t.users], ["tafsir", t.tafsir], ["moderation", t.moderation], ["feedback", locale === "de" ? "Wünsche" : "Requests"], ["adhan", "Adhan"]] as const;
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{t.admin}</h1>
        <Link href="/" className={btn}>← {t.home}</Link>
      </header>
      <nav className="mb-6 inline-flex flex-wrap gap-1 rounded-xl bg-surface p-1 shadow-card">
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === k ? "bg-accent text-white" : "text-muted hover:text-ink"}`}>{label}</button>
        ))}
      </nav>
      {tab === "overview" && <Overview t={t} />}
      {tab === "insights" && <Insights de={de} />}
      {tab === "control" && <Control de={de} />}
      {tab === "ranking" && <RankingAdmin de={de} />}
      {tab === "users" && <Users t={t} meId={me.id} />}
      {tab === "tafsir" && <TafsirEditor t={t} />}
      {tab === "moderation" && <Moderation de={locale === "de"} />}
      {tab === "feedback" && <FeedbackAdmin />}
      {tab === "adhan" && <AdhanAdmin />}
    </main>
  );
}

type TT = (typeof T)["de"] | (typeof T)["en"];

function Overview({ t }: { t: TT }) {
  const [s, setS] = useState<Record<string, number> | null>(null);
  useEffect(() => { api<Record<string, number>>("/api/admin/stats").then(setS).catch(() => undefined); }, []);
  const items: [string, string][] = [["users", t.users_n], ["usersWeek", t.users_w], ["sessions", t.sessions], ["cached", t.cached], ["entries", t.entries], ["drafts", t.drafts]];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map(([k, label]) => (
        <div key={k} className={card}>
          <p className="font-display text-4xl font-semibold text-accent">{s ? s[k] : "–"}</p>
          <p className="mt-1 text-sm text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}

function Users({ t, meId }: { t: TT; meId: number }) {
  const [rows, setRows] = useState<Row[]>([]);
  const load = useCallback(() => api<{ users: Row[] }>("/api/admin/users").then((d) => setRows(d.users)).catch(() => undefined), []);
  useEffect(() => { load(); }, [load]);
  const patch = async (id: number, b: object) => { await api("/api/admin/users", "PATCH", { id, ...b }); load(); };
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{rows.length} {t.users}</p>
        <a href="/api/admin/users/export" className={btn}>CSV ↓</a>
      </div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full whitespace-nowrap text-sm">
          <thead className="text-muted">
            <tr>{[t.name, t.email, "Land", "Ort", "Ziel", "✓", "Mail", t.plan, t.since, ""].map((h, i) => <th key={i} className="p-2 text-start font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="p-2">{[u.first_name, u.last_name].filter(Boolean).join(" ") || u.name || "–"}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.country ?? "–"}</td>
                <td className="p-2">{u.city ?? "–"}</td>
                <td className="p-2">{u.goal ?? "–"}</td>
                <td className="p-2" title="E-Mail bestätigt">{u.email_verified ? "✓" : "–"}</td>
                <td className="p-2" title="Marketing-Einwilligung">{u.marketing_opt_in ? "ja" : "nein"}</td>
                <td className="p-2">
                  <select value={u.plan} onChange={(e) => patch(u.id, { plan: e.target.value })} className={field + " !w-auto"}>
                    <option value="free">{t.free}</option><option value="premium">{t.premium}</option>
                  </select>
                </td>
                <td className="p-2 text-muted">{new Date(u.created_at).toLocaleDateString(undefined)}</td>
                <td className="p-2 text-end">{u.id !== meId && <button className={btn} onClick={() => patch(u.id, { role: u.role === "admin" ? "user" : "admin" })}>{u.role === "admin" ? t.makeUser : t.makeAdmin}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type Cm = { id: number; verse_key: string; body: string; status: string; flagged: string | null; reject_reason: string | null; created_at: string; user_id: number; email: string; first_name: string | null; last_name: string | null; country: string | null; comment_banned: boolean; comment_strikes: number; reports: number };

function Moderation({ de }: { de: boolean }) {
  const L = de
    ? { pending: "Zu prüfen", reported: "Gemeldet", rejected: "Abgelehnt", approved: "Veröffentlicht", ok: "Freigeben", no: "Ablehnen", del: "Löschen", ban: "Sperren", unban: "Entsperren", dismiss: "Meldung verwerfen", empty: "Nichts zu tun.", words: "Wortfilter (eigene Ergänzungen)", hard: "Sofort blockieren (ein Wort/eine Phrase pro Zeile)", soft: "Markieren, aber zur Prüfung zulassen", save: "Wortlisten speichern", saved: "Gespeichert", flag: "Markiert", strikes: "Verstöße", note: "Eingebaut sind bereits Beleidigungen, Obszönes, Verspottung von Allah/Propheten/Koran, Hass/Takfir, Links, Telefon/E-Mail und Werbung in mehreren Sprachen." }
    : { pending: "To review", reported: "Reported", rejected: "Rejected", approved: "Published", ok: "Approve", no: "Reject", del: "Delete", ban: "Ban", unban: "Unban", dismiss: "Dismiss report", empty: "Nothing to do.", words: "Word filter (your additions)", hard: "Block at once (one word/phrase per line)", soft: "Flag but allow into review", save: "Save word lists", saved: "Saved", flag: "Flagged", strikes: "Strikes", note: "Built in: insults, obscenity, mockery of Allah/Prophets/Quran, hate/takfir, links, phone/e-mail and advertising in many languages." };
  const [view, setView] = useState<"pending" | "reported" | "rejected" | "approved">("pending");
  const [list, setList] = useState<Cm[]>([]);
  const [counts, setCounts] = useState({ pending: 0, reported: 0 });
  const [block, setBlock] = useState("");
  const [soft, setSoft] = useState("");
  const [msg, setMsg] = useState("");
  const load = useCallback(() => api<{ comments: Cm[]; counts: { pending: number; reported: number }; words: { block: string[]; soft: string[] } }>(`/api/admin/comments?view=${view}`).then((d) => { setList(d.comments); setCounts(d.counts); setBlock(d.words.block.join("\n")); setSoft(d.words.soft.join("\n")); }).catch(() => undefined), [view]);
  useEffect(() => { load(); }, [load]);
  const op = async (body: Record<string, unknown>) => { await api("/api/admin/comments", "POST", body); load(); };
  const lines = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        {(["pending", "reported", "rejected", "approved"] as const).map((k) => (
          <button key={k} onClick={() => setView(k)} className={`rounded-lg px-4 py-2 text-sm font-medium ${view === k ? "bg-ink text-bg" : "border border-line text-muted hover:text-ink"}`}>{L[k]}{k === "pending" ? ` (${counts.pending})` : k === "reported" ? ` (${counts.reported})` : ""}</button>
        ))}
      </div>
      {list.length === 0 ? <p className="text-sm text-muted">{L.empty}</p> : (
        <ul className="grid gap-3">
          {list.map((c) => (
            <li key={c.id} className={card}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <b className="text-ink">{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.email}</b><span>{c.email}</span><span>{c.country}</span><span>Quran {c.verse_key}</span>
                <span>{new Date(c.created_at).toLocaleString()}</span>
                {c.reports > 0 && <span className="font-semibold text-red-600">⚑ {c.reports}</span>}
                {c.flagged && <span className="font-semibold text-gold">{L.flag}: {c.flagged}</span>}
                {c.reject_reason && <span>{c.reject_reason}</span>}
                {c.comment_strikes > 0 && <span>{L.strikes}: {c.comment_strikes}</span>}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[15px]">{c.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.status !== "approved" && <button className={btnP} onClick={() => op({ op: "approve", id: c.id })}>{L.ok}</button>}
                {c.status !== "rejected" && <button className={btn} onClick={() => op({ op: "reject", id: c.id })}>{L.no}</button>}
                {c.reports > 0 && <button className={btn} onClick={() => op({ op: "dismiss", id: c.id })}>{L.dismiss}</button>}
                <button className={btn} onClick={() => op({ op: "delete", id: c.id })}>{L.del}</button>
                {c.comment_banned ? <button className={btn} onClick={() => op({ op: "unban", userId: c.user_id })}>{L.unban}</button> : <button className={btn} onClick={() => op({ op: "ban", userId: c.user_id })}>{L.ban}</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className={`${card} max-w-2xl`}>
        <h3 className="font-semibold">{L.words}</h3>
        <p className="mb-3 mt-1 text-sm text-muted">{L.note}</p>
        <label className="text-sm font-medium">{L.hard}</label>
        <textarea rows={4} value={block} onChange={(e) => setBlock(e.target.value)} className={field + " mb-3 mt-1"} />
        <label className="text-sm font-medium">{L.soft}</label>
        <textarea rows={4} value={soft} onChange={(e) => setSoft(e.target.value)} className={field + " mt-1"} />
        <div className="mt-3 flex items-center gap-3">
          <button className={btnP} onClick={async () => { await api("/api/admin/comments", "POST", { op: "words", block: lines(block), soft: lines(soft) }); setMsg(L.saved); setTimeout(() => setMsg(""), 2000); }}>{L.save}</button>
          {msg && <span className="text-sm text-accent">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

const blank = (lang: string): Partial<Entry> => ({ language: lang, source: "Quran Masterclass", surah: 1, verse_from: 1, verse_to: 1, html: "", status: "draft", generated_by_ai: false });

function TafsirEditor({ t }: { t: TT }) {
  const locale = useLocale();
  const [filter, setFilter] = useState("de");
  const [list, setList] = useState<Entry[]>([]);
  const [form, setForm] = useState<Partial<Entry> | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => api<{ entries: Entry[] }>(`/api/admin/entries?lang=${filter}`).then((d) => setList(d.entries)).catch(() => undefined), [filter]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form) return;
    setErr("");
    try {
      await api("/api/admin/entries", form.id ? "PUT" : "POST", form);
      setForm(null);
      load();
    } catch { setErr("Error – check surah, verses and text."); }
  };
  const setStatus = async (e: Entry, status: "draft" | "approved") => { await api("/api/admin/entries", "PUT", { ...e, status }); load(); };
  const remove = async (id: number) => { if (confirm(t.confirm)) { await api(`/api/admin/entries?id=${id}`, "DELETE"); load(); } };
  const up = (patch: Partial<Entry>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">{t.note}</p>
      <div className="flex flex-wrap items-center gap-3">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={field + " !w-auto"}>
          {Object.entries(LOCALE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className={btnP} onClick={() => setForm(blank(filter))}>+ {t.create}</button>
      </div>

      {form && (
        <div className={`${card} grid gap-3`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="grid gap-1 text-sm">{t.lang}
              <select className={field} value={form.language} onChange={(e) => up({ language: e.target.value })}>{Object.entries(LOCALE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            </label>
            <label className="grid gap-1 text-sm">{t.surah}<input type="number" min={1} max={114} className={field} value={form.surah} onChange={(e) => up({ surah: Number(e.target.value) })} /></label>
            <label className="grid gap-1 text-sm">{t.from}<input type="number" min={1} className={field} value={form.verse_from} onChange={(e) => up({ verse_from: Number(e.target.value), verse_to: Math.max(Number(e.target.value), form.verse_to ?? 0) })} /></label>
            <label className="grid gap-1 text-sm">{t.to}<input type="number" min={1} className={field} value={form.verse_to} onChange={(e) => up({ verse_to: Number(e.target.value) })} /></label>
          </div>
          <label className="grid gap-1 text-sm">{t.source}<input className={field} value={form.source} onChange={(e) => up({ source: e.target.value })} /></label>
          <label className="grid gap-1 text-sm">{t.content}<textarea rows={9} className={field + " font-mono"} value={form.html} onChange={(e) => up({ html: e.target.value })} dir={LOCALE_META[(form.language ?? locale) as keyof typeof LOCALE_META]?.dir} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.generated_by_ai} onChange={(e) => up({ generated_by_ai: e.target.checked })} /> {t.ai}</label>
          <label className="grid w-fit gap-1 text-sm">{t.status}
            <select className={field} value={form.status} onChange={(e) => up({ status: e.target.value as Entry["status"] })}><option value="draft">{t.draft}</option><option value="approved">{t.approved}</option></select>
          </label>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2"><button className={btnP} onClick={save}>{form.id ? t.update : t.create}</button><button className={btn} onClick={() => setForm(null)}>{t.cancel}</button></div>
        </div>
      )}

      {list.length === 0 && <p className="text-muted">{t.none}</p>}
      <ul className="grid gap-2">
        {list.map((e) => (
          <li key={e.id} className={`${card} flex flex-wrap items-center justify-between gap-3 !p-4`}>
            <div className="min-w-0">
              <p className="font-medium">{e.surah}:{e.verse_from}{e.verse_to !== e.verse_from ? `–${e.verse_to}` : ""} <span className={`ms-2 rounded-full px-2 py-0.5 text-xs ${e.status === "approved" ? "bg-accent-soft text-accent" : "bg-line text-muted"}`}>{e.status === "approved" ? t.approved : t.draft}</span>{e.generated_by_ai && <span className="ms-2 text-xs text-gold">AI</span>}</p>
              <p className="truncate text-sm text-muted">{e.html.replace(/<[^>]+>/g, " ").slice(0, 120)}</p>
            </div>
            <div className="flex gap-2">
              <button className={btn} onClick={() => setStatus(e, e.status === "approved" ? "draft" : "approved")}>{e.status === "approved" ? t.unapprove : t.approve}</button>
              <button className={btn} onClick={() => setForm(e)}>{t.edit}</button>
              <button className={btn} onClick={() => remove(e.id)}>{t.del}</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Fb = { id: number; category: string; title: string; body: string; status: string; approved: boolean; email: string; votes: number; flagged: string | null; created_at: string };
function FeedbackAdmin() {
  const [list, setList] = useState<Fb[]>([]);
  const load = useCallback(() => api<{ posts: Fb[] }>("/api/admin/feedback").then((d) => setList(d.posts)).catch(() => undefined), []);
  useEffect(() => { load(); }, [load]);
  const op = async (body: Record<string, unknown>) => { await api("/api/admin/feedback", "POST", body); load(); };
  return (
    <ul className="grid gap-3">
      {list.length === 0 && <li className="text-sm text-muted">–</li>}
      {list.map((p) => (
        <li key={p.id} className={card}>
          <div className="flex flex-wrap gap-3 text-xs text-muted"><b className="text-ink">{p.category}</b><span>{p.email}</span><span>▲ {p.votes}</span><span>{new Date(p.created_at).toLocaleString()}</span>{p.flagged && <span className="font-semibold text-gold">⚑ {p.flagged}</span>}{!p.approved && <span className="font-semibold text-red-600">nicht freigegeben</span>}</div>
          <p className="mt-2 font-semibold">{p.title}</p>
          {p.body && <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{p.body}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button className={p.approved ? btn : btnP} onClick={() => op({ id: p.id, approved: !p.approved })}>{p.approved ? "Verbergen" : "Freigeben"}</button>
            <select value={p.status} onChange={(e) => op({ id: p.id, status: e.target.value })} className={field + " !w-40"}>
              {["review", "planned", "progress", "done", "declined"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className={btn} onClick={() => op({ id: p.id, delete: true })}>Löschen</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

const VOICE_NAMES: Record<string, string> = { makkah: "Mekka (Masjid al-Haram)", madinah: "Medina (Masjid an-Nabawi)", dubai: "Dubai", tehran: "Teheran", aqsa: "Al-Aqsa (Jerusalem)" };
function AdhanAdmin() {
  const [files, setFiles] = useState<AdhanFile[]>([]);
  const [form, setForm] = useState({ id: "", label: "", credit: "" });
  const [msg, setMsg] = useState("");
  const load = useCallback(() => fetch("/api/adhan", { cache: "no-store" }).then((r) => r.json()).then((d) => setFiles(d.files ?? [])).catch(() => undefined), []);
  useEffect(() => { load(); }, [load]);
  const send = async (id: string, label: string, credit: string, file: File | null) => {
    const fd = new FormData(); fd.set("id", id); fd.set("label", label); fd.set("credit", credit); if (file) fd.set("file", file);
    setMsg("…");
    const r = await fetch("/api/admin/adhan", { method: "POST", body: fd });
    const e = r.ok ? "" : ((await r.json().catch(() => ({}))) as { error?: string }).error;
    setMsg(r.ok ? "Gespeichert" : e === "format" ? "Nur MP3-Dateien" : e === "size" ? "Maximal 15 MB" : e === "id" ? "Kennung: nur a–z, 0–9 und -" : "Fehler");
    resetAdhanCache(); load();
  };
  const remove = async (id: string) => { await fetch(`/api/admin/adhan?id=${id}`, { method: "DELETE" }); resetAdhanCache(); load(); };
  return (
    <div className="grid gap-4">
      <p className="max-w-2xl text-sm text-muted">Adhan-Aufnahmen als MP3 (max. 15 MB). Im Radio und bei den Gebetszeiten spielt standardmäßig zufällig eine davon; Nutzer können auch eine feste Stimme wählen. Nutze nur Aufnahmen, für die du die Rechte oder eine Erlaubnis hast, und trage die Quelle ein – sie wird angezeigt.</p>
      <div className={card}>
        <b>Neue Aufnahme</b>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input list="adhan-ids" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase(), label: form.label || VOICE_NAMES[e.target.value] || "" })} placeholder="Kennung, z. B. dubai-2" className={field} />
          <datalist id="adhan-ids">{SUGGESTED.map((x) => <option key={x} value={x} />)}</datalist>
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Anzeigename, z. B. Dubai – Muezzin …" className={field} />
          <input value={form.credit} onChange={(e) => setForm({ ...form, credit: e.target.value })} placeholder="Quelle / Erlaubnis" className={field} />
        </div>
        <label className={btnP + " mt-3 inline-block cursor-pointer"}>MP3 auswählen und hochladen<input type="file" accept="audio/mpeg,.mp3" className="hidden" onChange={(e) => { if (form.id) send(form.id, form.label, form.credit, e.target.files?.[0] ?? null); else setMsg("Bitte zuerst eine Kennung eingeben"); }} /></label>
        {msg && <span className="ms-3 text-sm text-accent">{msg}</span>}
      </div>
      {files.length === 0 ? <p className="text-sm text-muted">Noch keine Aufnahmen.</p> : files.map((f) => (
        <div key={f.id} className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2"><b>{f.label}</b><span className="text-xs text-muted">{f.id}</span></div>
          <audio src={adhanUrl(f.id)} controls preload="none" className="mt-3 w-full" />
          {f.credit && <p className="mt-2 text-xs text-muted">{f.credit}</p>}
          <div className="mt-3 flex gap-2"><button className={btn} onClick={() => setForm({ id: f.id, label: f.label, credit: f.credit })}>Bearbeiten</button><button className={btn} onClick={() => remove(f.id)}>Löschen</button></div>
        </div>
      ))}
    </div>
  );
}

// ---------- Insights: what happens on the site ----------
type Ins = { series: { day: number; listenSec: number; versesHeard: number; listeners: number; views: number; readers: number; learners: number; points: number; signups: number }[]; topSurahs: { surah: number; sec: number; verses: number }[]; topReciters: { reciter: string; sec: number }[]; totals: Record<string, number> };
function Insights({ de }: { de: boolean }) {
  const [d, setD] = useState<Ins | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { api<Ins>("/api/admin/insights").then(setD).catch(() => setErr(true)); }, []);
  if (err) return <p className="text-sm text-red-600">{de ? "Statistik nicht verfügbar." : "Insights unavailable."}</p>;
  if (!d) return <div className="h-64 animate-pulse rounded-2xl bg-line/40" />;
  const h = (sec: number) => Math.round((sec / 3600) * 10) / 10;
  const sum = (k: keyof Ins["series"][number]) => d.series.reduce((a, x) => a + Number(x[k]), 0);
  const T = d.totals;
  const kpi: [string, string | number][] = [
    [de ? "Stunden gehört (30 T.)" : "Hours listened (30 d)", h(sum("listenSec"))], [de ? "Stunden gehört (gesamt)" : "Hours listened (all)", h(T.listen_all ?? 0)],
    [de ? "Hörer (30 T., Tagessumme)" : "Listeners (30 d, daily sum)", sum("listeners")], [de ? "Verse gehört (30 T.)" : "Verses heard (30 d)", sum("versesHeard")],
    [de ? "Vers-Aufrufe (30 T.)" : "Verse views (30 d)", sum("views")], [de ? "Lernende mit Punkten (30 T., Tagessumme)" : "Learners with points (30 d, daily sum)", sum("learners")],
    [de ? "Neue Konten (30 T.)" : "New accounts (30 d)", sum("signups")], [de ? "Konten gesamt / bestätigt" : "Accounts total / verified", `${T.users ?? 0} / ${T.verified ?? 0}`],
    [de ? "Herzen / Kommentare" : "Hearts / comments", `${T.likes ?? 0} / ${T.comments ?? 0}`], [de ? "Kommentare zu prüfen" : "Comments to review", T.pending ?? 0],
    [de ? "Teilen gesamt" : "Shares total", T.shares ?? 0], [de ? "Im Ranking (je gepunktet)" : "In ranking (ever scored)", T.rankers ?? 0],
  ];
  const Chart = ({ k, label, fmt = (n: number) => String(n) }: { k: keyof Ins["series"][number]; label: string; fmt?: (n: number) => string }) => {
    const max = Math.max(1, ...d.series.map((x) => Number(x[k])));
    return (
      <div className={card}>
        <p className="text-sm font-semibold">{label}</p>
        <div className="mt-3 flex h-28 items-end gap-[3px]">
          {d.series.map((x) => <div key={x.day} title={`${new Date(x.day * 86400000).toLocaleDateString()} · ${fmt(Number(x[k]))}`} className="min-w-0 flex-1 rounded-t-[2px] bg-accent/70" style={{ height: `${Math.max(2, (Number(x[k]) / max) * 100)}%`, opacity: Number(x[k]) ? 1 : 0.25 }} />)}
        </div>
        <p className="mt-1 text-xs text-muted">{de ? "letzte 30 Tage" : "last 30 days"} · max {fmt(max)}</p>
      </div>
    );
  };
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {kpi.map(([l, n]) => <div key={l} className={card}><p className="text-2xl font-bold">{n}</p><p className="mt-1 text-xs text-muted">{l}</p></div>)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Chart k="listenSec" label={de ? "Hörzeit pro Tag" : "Listening per day"} fmt={(n) => `${h(n)} h`} />
        <Chart k="listeners" label={de ? "Hörer pro Tag" : "Listeners per day"} />
        <Chart k="views" label={de ? "Vers-Aufrufe pro Tag" : "Verse views per day"} />
        <Chart k="learners" label={de ? "Lernende mit Punkten pro Tag" : "Learners with points per day"} />
        <Chart k="points" label={de ? "Punkte pro Tag" : "Points per day"} />
        <Chart k="signups" label={de ? "Neue Konten pro Tag" : "New accounts per day"} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className={card}>
          <p className="text-sm font-semibold">{de ? "Meistgehörte Suren (30 Tage)" : "Most heard surahs (30 days)"}</p>
          <ol className="mt-3 grid gap-1.5 text-sm">{d.topSurahs.map((x) => <li key={x.surah} className="flex justify-between gap-3"><span>{de ? "Sure" : "Surah"} {x.surah}</span><span className="text-muted">{h(x.sec)} h · {x.verses} {de ? "Verse" : "verses"}</span></li>)}</ol>
        </div>
        <div className={card}>
          <p className="text-sm font-semibold">{de ? "Rezitatoren (30 Tage)" : "Reciters (30 days)"}</p>
          <ol className="mt-3 grid gap-1.5 text-sm">{d.topReciters.map((x) => <li key={x.reciter} className="flex justify-between gap-3"><span>{x.reciter}</span><span className="text-muted">{h(x.sec)} h</span></li>)}</ol>
        </div>
      </div>
    </div>
  );
}

// ---------- Controls: switches, limits, point rules, announcement ----------
type Feat = { ranking: boolean; community: boolean; likes: boolean; comments: boolean; assistant: boolean; duaAi: boolean; sideArt: boolean; celebrations: boolean; donateCta: boolean };
type Cfg = { anonTafsirLimit: number; commentsAutoApprove: boolean; features: Feat; limits: { assistantAnonPerDay: number; assistantPerUserPerDay: number; duaAiAnonPerDay: number; rankingDailyCap: number }; points: Record<string, { pts: number; cap?: number }>; announcement: { on: boolean; id: string; de: string; en: string; ar: string; href: string }; donation: { on: boolean; goal: number; raised: number; currency: string; label: string } };
const POINT_DEFAULTS: Record<string, { pts: number; cap?: number }> = { time: { pts: 1, cap: 120 }, listen: { pts: 2, cap: 400 }, verse: { pts: 1, cap: 300 }, review: { pts: 5 }, new: { pts: 10 }, session: { pts: 30 }, lesson: { pts: 20 }, quiz: { pts: 10 }, vocab: { pts: 2, cap: 200 }, wudu: { pts: 25, cap: 25 } };
function Control({ de }: { de: boolean }) {
  const [c, setC] = useState<Cfg | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { api<Cfg>("/api/admin/settings").then(setC).catch(() => undefined); }, []);
  if (!c) return <div className="h-64 animate-pulse rounded-2xl bg-line/40" />;
  const save = async (patch: Partial<Cfg>) => { const n = await api<Cfg>("/api/admin/settings", "PUT", patch); setC(n); setMsg(de ? "Gespeichert – gilt sofort (Browser holen es beim nächsten Seitenaufruf)." : "Saved – applies at once (browsers pick it up on their next page view)."); setTimeout(() => setMsg(""), 3500); };
  const F: [keyof Feat, string, string][] = de ? [
    ["ranking", "Ranking", "Globales Ranking (Woche, Monat, gesamt, Länder)."], ["community", "Gemeinschafts-Seite", "Beliebte Verse, neueste Gedanken, Puls."],
    ["likes", "Herzen für Verse", "Like-Knopf unter Versen."], ["comments", "Kommentare", "Kommentieren unter Versen (Moderation bleibt aktiv)."],
    ["assistant", "Assistent", "Quran- und Islam-Assistent (braucht den OpenAI-Schlüssel)."], ["duaAi", "Dua-Formulierungshilfe", "„In schönere Worte fassen“ im Dua-Generator."],
    ["sideArt", "Seiten-Kalligrafie", "Goldene Quran-Kalligrafie links und rechts auf großen Bildschirmen."], ["celebrations", "Punkte- und Sticker-Feiern", "„+n Punkte“, neue Level und Sticker als Einblendung."], ["donateCta", "Spenden-Einladungen", "Die ruhigen Einladungen zur freiwilligen Unterstützung (Laterne) auf den Seiten."],
  ] : [
    ["ranking", "Ranking", "Global ranking (week, month, all time, countries)."], ["community", "Community page", "Loved verses, reflections, pulse."],
    ["likes", "Hearts for verses", "Like button under verses."], ["comments", "Comments", "Comments under verses (moderation stays on)."],
    ["assistant", "Assistant", "Quran and Islam assistant (needs the OpenAI key)."], ["duaAi", "Dua phrasing help", "“Phrase it more beautifully” in the dua generator."],
    ["sideArt", "Side calligraphy", "Gold Quran calligraphy left and right on wide screens."], ["celebrations", "Point and sticker celebrations", "“+n points”, new levels and stickers as overlays."], ["donateCta", "Donation invitations", "The quiet invitations to voluntary support (lantern) on the pages."],
  ];
  const lim: [keyof Cfg["limits"], string][] = [
    ["assistantAnonPerDay", de ? "Assistent: Fragen pro Tag ohne Konto" : "Assistant: questions per day without account"],
    ["assistantPerUserPerDay", de ? "Assistent: Fragen pro Tag mit Konto" : "Assistant: questions per day with account"],
    ["duaAiAnonPerDay", de ? "Dua-Hilfe: pro Tag ohne Konto" : "Dua help: per day without account"],
    ["rankingDailyCap", de ? "Ranking: höchstens Punkte pro Tag und Person" : "Ranking: max points per day and person"],
  ];
  const P = de
    ? { time: "Aktive Minute auf der Seite", listen: "Minute Rezitation", verse: "Vers bis zum Ende gehört", review: "Vers geübt", new: "Neuer Vers gelernt", session: "Tagessitzung", lesson: "Lektion bestanden", quiz: "Tadschwid-Quiz", vocab: "Vokabel geübt", wudu: "Wudu-Trainer" }
    : { time: "Active minute on the site", listen: "Minute of recitation", verse: "Verse heard to the end", review: "Verse practised", new: "New verse learned", session: "Daily session", lesson: "Lesson passed", quiz: "Tajweed quiz", vocab: "Word practised", wudu: "Wudu trainer" };
  const pt = (k: string) => c.points[k] ?? POINT_DEFAULTS[k];
  const setPt = (k: string, v: { pts: number; cap?: number }) => setC({ ...c, points: { ...c.points, [k]: v } });
  const A = c.announcement;
  const D = c.donation;
  return (
    <div className="grid gap-6">
      {msg && <p className="rounded-lg bg-accent-soft px-4 py-2 text-sm font-semibold text-accent">{msg}</p>}
      <section className={card}>
        <h3 className="text-lg font-bold">{de ? "Funktionen" : "Features"}</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {F.map(([k, l, h]) => (
            <li key={k}><label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 hover:border-accent/50">
              <input type="checkbox" className="mt-0.5" checked={c.features[k]} onChange={(e) => save({ features: { ...c.features, [k]: e.target.checked } })} />
              <span><b className="text-sm">{l}</b><span className="block text-xs text-muted">{h}</span></span>
            </label></li>
          ))}
        </ul>
      </section>
      <section className={card}>
        <h3 className="text-lg font-bold">{de ? "Limits" : "Limits"}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm"><span>{de ? "Tafsir: Verse pro Tag ohne Konto" : "Tafsir: verses per day without account"}</span><input type="number" min={0} className={field} value={c.anonTafsirLimit} onChange={(e) => setC({ ...c, anonTafsirLimit: Number(e.target.value) })} /></label>
          {lim.map(([k, l]) => <label key={k} className="grid gap-1 text-sm"><span>{l}</span><input type="number" min={0} className={field} value={c.limits[k]} onChange={(e) => setC({ ...c, limits: { ...c.limits, [k]: Number(e.target.value) } })} /></label>)}
          <label className="flex items-start gap-3 text-sm sm:col-span-2"><input type="checkbox" className="mt-0.5" checked={c.commentsAutoApprove} onChange={(e) => setC({ ...c, commentsAutoApprove: e.target.checked })} /><span><b>{de ? "Kommentare automatisch freigeben" : "Auto-approve comments"}</b><span className="block text-xs text-muted">{de ? "Aus (empfohlen): jeder Kommentar wartet auf deine Freigabe." : "Off (recommended): every comment waits for your approval."}</span></span></label>
        </div>
        <button className={`${btnP} mt-4`} onClick={() => save({ anonTafsirLimit: c.anonTafsirLimit, limits: c.limits, commentsAutoApprove: c.commentsAutoApprove })}>{de ? "Limits speichern" : "Save limits"}</button>
      </section>
      <section className={card}>
        <h3 className="text-lg font-bold">{de ? "Punkte-Regeln" : "Point rules"}</h3>
        <p className="mt-1 text-xs text-muted">{de ? "Punkte pro Einheit und Höchstpunkte pro Tag (leer = ohne Grenze). Änderungen gelten für neue Punkte." : "Points per unit and maximum per day (empty = no limit). Changes apply to new points."}</p>
        <div className="mt-3 grid gap-2">
          {Object.keys(POINT_DEFAULTS).map((k) => (
            <div key={k} className="grid grid-cols-[1fr_5rem_6rem] items-center gap-2 text-sm">
              <span>{P[k as keyof typeof P]}</span>
              <input type="number" min={0} aria-label="points" className={field} value={pt(k).pts} onChange={(e) => setPt(k, { ...pt(k), pts: Number(e.target.value) })} />
              <input type="number" min={0} aria-label="cap" placeholder="∞" className={field} value={pt(k).cap ?? ""} onChange={(e) => setPt(k, { pts: pt(k).pts, ...(e.target.value === "" ? {} : { cap: Number(e.target.value) }) })} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={btnP} onClick={() => save({ points: c.points })}>{de ? "Regeln speichern" : "Save rules"}</button>
          <button className={btn} onClick={() => save({ points: {} })}>{de ? "Standard wiederherstellen" : "Restore defaults"}</button>
        </div>
      </section>
      <section className={card}>
        <h3 className="text-lg font-bold">{de ? "Ankündigung für alle Besucher" : "Announcement for all visitors"}</h3>
        <p className="mt-1 text-xs text-muted">{de ? "Eine schmale Leiste ganz oben auf jeder Seite. Andere Sprachen sehen den englischen Text." : "A slim bar at the top of every page. Other languages see the English text."}</p>
        <div className="mt-3 grid gap-2">
          <input className={field} placeholder="Deutsch" value={A.de} onChange={(e) => setC({ ...c, announcement: { ...A, de: e.target.value } })} />
          <input className={field} placeholder="English" value={A.en} onChange={(e) => setC({ ...c, announcement: { ...A, en: e.target.value } })} />
          <input className={field} dir="rtl" placeholder="العربية" value={A.ar} onChange={(e) => setC({ ...c, announcement: { ...A, ar: e.target.value } })} />
          <input className={field} placeholder={de ? "Link (optional), z. B. /dua-generator" : "Link (optional), e.g. /dua-generator"} value={A.href} onChange={(e) => setC({ ...c, announcement: { ...A, href: e.target.value } })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={A.on} onChange={(e) => setC({ ...c, announcement: { ...A, on: e.target.checked } })} />{de ? "Anzeigen" : "Show"}</label>
        </div>
        <button className={`${btnP} mt-4`} onClick={() => save({ announcement: { ...A, id: String(Date.now()) } })}>{de ? "Ankündigung speichern" : "Save announcement"}</button>
      </section>
      <section className={card}>
        <h3 className="text-lg font-bold">{de ? "Spenden-Laterne (Monatsziel)" : "Donation lantern (monthly goal)"}</h3>
        <p className="mt-1 text-xs text-muted">{de ? "Optional: Wenn du ein Monatsziel und den bisher erhaltenen Betrag einträgst, füllt sich die goldene Laterne in den Spenden-Einladungen sichtbar. Nur echte Zahlen eintragen. Ausgeschaltet: die Laterne leuchtet ohne Zahlen." : "Optional: enter a monthly goal and the amount received so far and the gold lantern in the donation invitations fills visibly. Real numbers only. Off: the lantern glows without numbers."}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm"><span>{de ? "Monatsziel" : "Monthly goal"}</span><input type="number" min={0} className={field} value={D.goal} onChange={(e) => setC({ ...c, donation: { ...D, goal: Number(e.target.value) } })} /></label>
          <label className="grid gap-1 text-sm"><span>{de ? "Bisher erhalten" : "Received so far"}</span><input type="number" min={0} className={field} value={D.raised} onChange={(e) => setC({ ...c, donation: { ...D, raised: Number(e.target.value) } })} /></label>
          <label className="grid gap-1 text-sm"><span>{de ? "Währung" : "Currency"}</span><input className={field} value={D.currency} onChange={(e) => setC({ ...c, donation: { ...D, currency: e.target.value } })} /></label>
          <label className="grid gap-1 text-sm"><span>{de ? "Hinweis (optional), z. B. „Serverkosten Oktober“" : "Note (optional), e.g. “Server costs October”"}</span><input className={field} value={D.label} onChange={(e) => setC({ ...c, donation: { ...D, label: e.target.value } })} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={D.on} onChange={(e) => setC({ ...c, donation: { ...D, on: e.target.checked } })} />{de ? "Füllstand anzeigen" : "Show the meter"}</label>
        </div>
        <button className={`${btnP} mt-4`} onClick={() => save({ donation: D })}>{de ? "Speichern" : "Save"}</button>
      </section>
    </div>
  );
}

// ---------- Ranking: see everyone, hide someone ----------
type RRow = { id: number; email: string; name: string; country: string | null; public: boolean; hidden: boolean; points: number; days: number; last: number };
function RankingAdmin({ de }: { de: boolean }) {
  const [range, setRange] = useState<"week" | "month" | "all">("week");
  const [list, setList] = useState<RRow[] | null>(null);
  const load = useCallback(() => api<{ list: RRow[] }>(`/api/admin/ranking?range=${range}`).then((d) => setList(d.list)).catch(() => setList([])), [range]);
  useEffect(() => { load(); }, [load]);
  const toggle = async (r: RRow) => { await api("/api/admin/ranking", "POST", { id: r.id, hidden: !r.hidden }); load(); };
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {(["week", "month", "all"] as const).map((k) => <button key={k} onClick={() => setRange(k)} className={`rounded-lg px-4 py-2 text-sm font-medium ${range === k ? "bg-ink text-bg" : "border border-line text-muted hover:text-ink"}`}>{de ? { week: "Woche", month: "Monat", all: "Gesamt" }[k] : { week: "Week", month: "Month", all: "All time" }[k]}</button>)}
        <Link href="/ranking" className={btn}>{de ? "Öffentliches Ranking ansehen" : "View public ranking"}</Link>
      </div>
      <p className="text-xs text-muted">{de ? "Ausgeblendete Personen erscheinen nicht im öffentlichen Ranking; ihre Punkte bleiben erhalten. Namen sind öffentlich nur sichtbar, wenn die Person es erlaubt hat." : "Hidden members do not appear in the public ranking; their points are kept. Names are public only if the member allowed it."}</p>
      {list === null ? <div className="h-40 animate-pulse rounded-2xl bg-line/40" /> : list.length === 0 ? <p className="text-sm text-muted">{de ? "Noch keine Punkte." : "No points yet."}</p> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full whitespace-nowrap text-sm">
            <thead className="text-left text-xs text-muted"><tr><th className="p-3">#</th><th className="p-3">{de ? "Person" : "Member"}</th><th className="p-3">{de ? "Land" : "Country"}</th><th className="p-3">{de ? "Punkte" : "Points"}</th><th className="p-3">{de ? "Tage" : "Days"}</th><th className="p-3">{de ? "Name öffentlich" : "Name public"}</th><th className="p-3" /></tr></thead>
            <tbody>{list.map((r, i) => (
              <tr key={r.id} className={`border-t border-line ${r.hidden ? "opacity-50" : ""}`}>
                <td className="p-3">{i + 1}</td><td className="p-3"><b>{r.name || "–"}</b><span className="block text-xs text-muted">{r.email}</span></td><td className="p-3">{r.country ?? ""}</td>
                <td className="p-3 font-semibold tabular-nums">{r.points}</td><td className="p-3">{r.days}</td><td className="p-3">{r.public ? (de ? "ja" : "yes") : (de ? "nein" : "no")}</td>
                <td className="p-3"><button className={btn} onClick={() => toggle(r)}>{r.hidden ? (de ? "Wieder zeigen" : "Show again") : (de ? "Ausblenden" : "Hide")}</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
