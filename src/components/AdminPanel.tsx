"use client";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LOCALE_META } from "@/i18n/locales";
import { fetchMe, type Me } from "@/lib/sync";

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
  const [tab, setTab] = useState<"overview" | "users" | "tafsir" | "moderation" | "feedback" | "settings">("overview");

  useEffect(() => { fetchMe().then((r) => setMe(r.user)); }, []);

  if (me === undefined) return null;
  if (!me || me.role !== "admin")
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <p className="mb-4">{t.forbidden}</p>
        <Link href="/account" className={btnP}>{t.signIn}</Link>
      </main>
    );

  const tabs = [["overview", t.overview], ["users", t.users], ["tafsir", t.tafsir], ["moderation", t.moderation], ["feedback", locale === "de" ? "Wünsche" : "Requests"], ["settings", t.settings]] as const;
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
      {tab === "users" && <Users t={t} meId={me.id} />}
      {tab === "tafsir" && <TafsirEditor t={t} />}
      {tab === "moderation" && <Moderation de={locale === "de"} />}
      {tab === "feedback" && <FeedbackAdmin />}
      {tab === "settings" && <SettingsTab t={t} />}
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

function SettingsTab({ t }: { t: TT }) {
  const [limit, setLimit] = useState(20);
  const [auto, setAuto] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => { api<{ anonTafsirLimit: number; commentsAutoApprove: boolean }>("/api/admin/settings").then((s) => { setLimit(s.anonTafsirLimit); setAuto(!!s.commentsAutoApprove); }).catch(() => undefined); }, []);
  const save = async () => { await api("/api/admin/settings", "PUT", { anonTafsirLimit: limit, commentsAutoApprove: auto }); setMsg(t.saved); setTimeout(() => setMsg(""), 2000); };
  return (
    <div className={`${card} max-w-lg`}>
      <label className="mb-1 block font-medium">{t.limit}</label>
      <p className="mb-3 text-sm text-muted">{t.limitHelp}</p>
      <div className="flex items-center gap-3">
        <input type="number" min={0} max={10000} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className={field + " !w-28"} />
        <button className={btnP} onClick={save}>{t.save}</button>
        {msg && <span className="text-sm text-accent">{msg}</span>}
      </div>
      <label className="mt-6 flex items-start gap-3 border-t border-line pt-5 text-sm">
        <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="mt-1" />
        <span><b>{t.moderation}: auto-approve</b><br /><span className="text-muted">Off (recommended): every comment waits for your approval. On: comments that pass the word filter go live at once (soft-flagged ones still wait).</span></span>
      </label>
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
