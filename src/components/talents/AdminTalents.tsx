"use client";
import { useCallback, useEffect, useState } from "react";
import { BadgeIcon, type WebBadge } from "./BadgeIcon";
import { starText } from "@/lib/starText";

// Web moderation for Quran Talents (admins only; every API call checks the role): reports, clip approval, members
// (level, official star, admin check, badge block, suspend), invitation codes, old verification requests.
const DE = {
  title: "Quran Talents · Moderation", forbidden: "Nur für Administratoren. Bitte mit dem Admin-Konto anmelden.", reports: "Meldungen", posts: "Rezitationen", members: "Mitglieder", invites: "Einladungen", verify: "Anträge", stars: "Stars",
  starClaims: "Übernahme-Anfragen", starAll: "Star-Profile", starInvite: "Einladungslink kopieren", starCopied: "Link kopiert (einmalig, 30 Tage gültig).", starClaimed: "übernommen von", starOpen: "nicht übernommen", starInvited: "über Einladung", roleSelf: "Rezitator selbst", roleTeam: "Offizielles Team",
  none: "Nichts offen.", dismiss: "Verwerfen", resolve: "Erledigt", removeMsg: "Nachricht/Kommentar entfernen", removePost: "Rezitation entfernen", suspend: "Sperren", unsuspend: "Sperre aufheben",
  approve: "Freigeben", reject: "Ablehnen", reason: "Grund", search: "Mitglied suchen", official: "Offizieller Stern", officialOn: "Stern vergeben", officialOff: "Stern entziehen",
  verifyOn: "Gold (Admin) vergeben", verifyOff: "Gold (Admin) entziehen", block: "Automatische Abzeichen sperren", create: "Einladung erstellen", uses: "Nutzungen", days: "Gültig (Tage)", note: "Notiz",
  newCode: "Neuer Code, nur jetzt sichtbar:", revoke: "Widerrufen", revoked: "widerrufen", by: "gemeldet von", total: "Meldungen insgesamt", noMedia: "Datei fehlt (MEDIA_DIR auf dem Server einrichten).", error: "Das hat nicht geklappt.",
};
const EN: typeof DE = {
  title: "Quran Talents · Moderation", forbidden: "Admins only. Please sign in with the admin account.", reports: "Reports", posts: "Recitations", members: "Members", invites: "Invitations", verify: "Requests", stars: "Stars",
  starClaims: "Takeover requests", starAll: "Star profiles", starInvite: "Copy invite link", starCopied: "Link copied (single use, valid for 30 days).", starClaimed: "taken over by", starOpen: "not taken over", starInvited: "via invitation", roleSelf: "The reciter", roleTeam: "Official team",
  none: "Nothing open.", dismiss: "Dismiss", resolve: "Resolved", removeMsg: "Remove message/comment", removePost: "Remove recitation", suspend: "Suspend", unsuspend: "Lift suspension",
  approve: "Approve", reject: "Reject", reason: "Reason", search: "Search members", official: "Official star", officialOn: "Grant star", officialOff: "Revoke star",
  verifyOn: "Grant gold (admin)", verifyOff: "Remove gold (admin)", block: "Block automatic badges", create: "Create invitation", uses: "Uses", days: "Valid (days)", note: "Note",
  newCode: "New code, visible only now:", revoke: "Revoke", revoked: "revoked", by: "reported by", total: "reports in total", noMedia: "File missing (set up MEDIA_DIR on the server).", error: "That did not work.",
};
type Tab = "reports" | "posts" | "members" | "invites" | "verify" | "stars";
const LEVELS = ["talent", "rising", "master", "sheikh"];

async function api<T>(url: string, body?: unknown, method?: string): Promise<T> {
  const r = await fetch(url, { method: method ?? (body !== undefined ? "POST" : "GET"), cache: "no-store", headers: body !== undefined ? { "Content-Type": "application/json" } : undefined, body: body !== undefined ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error((d as { error?: string }).error ?? "error"), { status: r.status });
  return d as T;
}

export default function AdminTalents({ locale, posting = true }: { locale: string; /** clip moderation only while posting is switched on */ posting?: boolean }) {
  const t = locale === "de" ? DE : EN;
  const [tab, setTab] = useState<Tab>("reports");
  const [forbidden, setForbidden] = useState(false);
  const [msg, setMsg] = useState("");
  const run = useCallback(async (fn: () => Promise<void>) => {
    setMsg("");
    try { await fn(); } catch (e) { if ((e as { status?: number }).status === 403 || (e as { status?: number }).status === 401) setForbidden(true); else setMsg(t.error); }
  }, [t.error]);
  if (forbidden) return <p className="callout mt-8 rounded-lg p-6">{t.forbidden}</p>;
  const btn = "h-9 rounded-md border border-line px-3 text-[13.5px] font-semibold hover:bg-bg disabled:opacity-50";
  return (
    <div className="mt-6">
      <div role="tablist" className="flex flex-wrap gap-2">
        {(["reports", "posts", "members", "invites", "verify", "stars"] as Tab[]).filter((k) => posting || k !== "posts").map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`h-10 rounded-full px-4 text-sm font-semibold ${tab === k ? "btn-gold" : "border border-line"}`}>{t[k]}</button>
        ))}
      </div>
      {msg ? <p role="alert" className="mt-4 text-red-700 dark:text-red-400">{msg}</p> : null}
      <div className="mt-6">
        {tab === "reports" ? <Reports t={t} run={run} btn={btn} /> : tab === "posts" ? <Posts t={t} run={run} btn={btn} /> : tab === "members" ? <Members t={t} run={run} btn={btn} /> : tab === "invites" ? <Invites t={t} run={run} btn={btn} locale={locale} /> : tab === "stars" ? <Stars t={t} run={run} btn={btn} locale={locale} /> : <Verify t={t} run={run} btn={btn} />}
      </div>
    </div>
  );
}
type P = { t: typeof DE; run: (fn: () => Promise<void>) => Promise<void>; btn: string };
const Box = ({ children }: { children: React.ReactNode }) => <div className="grid gap-2 rounded-lg border border-line bg-surface p-4">{children}</div>;

type Report = { id: string; reason: string; category: string; type: string; at: string; reported: string | null; suspended: boolean; reporter: string | null; total: number; message: { text: string | null; removed: boolean } | null; post: { id: string; verseKey: string | null; status: string; media: string | null } | null };
function Reports({ t, run, btn }: P) {
  const [list, setList] = useState<Report[] | null>(null);
  useEffect(() => { void run(async () => setList((await api<{ reports: Report[] }>("/api/community/admin/reports")).reports)); }, [run]);
  const act = (id: string, action: string) => run(async () => { await api("/api/community/admin/reports", { id, action }); setList((l) => l?.filter((r) => r.id !== id) ?? null); });
  if (!list) return <div className="h-32 animate-pulse rounded-lg bg-line/40" />;
  if (!list.length) return <p className="text-muted">{t.none}</p>;
  return <div className="grid gap-3">{list.map((r) => (
    <Box key={r.id}>
      <p className="font-bold">@{r.reported ?? "?"} · {r.type}{r.category ? ` · ${r.category}` : ""}{r.suspended ? ` · ${t.suspend}` : ""}</p>
      <p className="text-[13px] text-muted">{r.reporter ? `${t.by} @${r.reporter} · ` : ""}{r.total} {t.total} · {new Date(r.at).toLocaleString()}</p>
      {r.reason ? <p>{r.reason}</p> : null}
      {r.message ? <p className="rounded-md bg-bg p-3">{r.message.removed ? "—" : r.message.text}</p> : null}
      {r.post?.media ? <audio controls preload="none" src={r.post.media} className="w-full" /> : null}
      <div className="flex flex-wrap gap-2">
        <button className={btn} onClick={() => void act(r.id, "dismiss")}>{t.dismiss}</button>
        <button className={btn} onClick={() => void act(r.id, "resolve")}>{t.resolve}</button>
        {r.message && !r.message.removed ? <button className={btn} onClick={() => void act(r.id, "remove_message")}>{t.removeMsg}</button> : null}
        {r.post && r.post.status !== "removed" ? <button className={btn} onClick={() => void act(r.id, "remove_post")}>{t.removePost}</button> : null}
        {!r.suspended ? <button className={btn} onClick={() => void act(r.id, "suspend")}>{t.suspend}</button> : null}
      </div>
    </Box>
  ))}</div>;
}

type Post = { id: string; type: string; mediaUrl: string | null; hasVideo: boolean; durationMs: number | null; caption: string; verseKey: string | null; wordCheck: number | null; at: string; author: string | null; authorBadge: WebBadge | null };
function Posts({ t, run, btn }: P) {
  const [list, setList] = useState<Post[] | null>(null);
  const [reason, setReason] = useState("");
  useEffect(() => { void run(async () => setList((await api<{ posts: Post[] }>("/api/community/admin/posts")).posts)); }, [run]);
  const act = (id: string, action: string) => run(async () => { await api("/api/community/admin/posts", { id, action, reason }); setReason(""); setList((l) => l?.filter((p) => p.id !== id) ?? null); });
  if (!list) return <div className="h-32 animate-pulse rounded-lg bg-line/40" />;
  if (!list.length) return <p className="text-muted">{t.none}</p>;
  return <div className="grid gap-3">{list.map((p) => (
    <Box key={p.id}>
      <p className="flex items-center gap-1.5 font-bold">@{p.author ?? "?"}{p.authorBadge ? <BadgeIcon badge={p.authorBadge} size={15} /> : null} · {p.type} · {p.verseKey}</p>
      <p className="text-[13px] text-muted">{p.durationMs ? `${Math.round(p.durationMs / 1000)} s` : ""}{p.wordCheck !== null ? ` · ${p.wordCheck} %` : ""}</p>
      {p.caption ? <p>{p.caption}</p> : null}
      {p.mediaUrl ? (p.hasVideo ? <video controls preload="none" src={p.mediaUrl} className="max-h-96 w-full rounded-md" /> : <audio controls preload="none" src={p.mediaUrl} className="w-full" />) : <p className="text-red-700">{t.noMedia}</p>}
      <input className="h-10 rounded-md border border-line bg-surface px-3" placeholder={t.reason} value={reason} onChange={(e) => setReason(e.target.value)} />
      <div className="flex gap-2"><button className={`${btn} btn-gold`} onClick={() => void act(p.id, "approve")}>{t.approve}</button><button className={btn} onClick={() => void act(p.id, "reject")}>{t.reject}</button></div>
    </Box>
  ))}</div>;
}

type Member = { username: string; name: string; level: string; badge: WebBadge | null; suspended: boolean; official: boolean; officialChannel: string | null; adminVerified: boolean; ijazahChain: string };
function Members({ t, run, btn }: P) {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Member[]>([]);
  useEffect(() => { const h = setTimeout(() => void run(async () => setList((await api<{ members: Member[] }>(`/api/community/admin/members?q=${encodeURIComponent(q)}`)).members)), 300); return () => clearTimeout(h); }, [q, run]);
  const set = (m: Member, patch: Record<string, unknown>, local: Partial<Member>) => run(async () => { await api("/api/community/admin/members", { username: m.username, ...patch }); setList((l) => l.map((x) => (x.username === m.username ? { ...x, ...local } : x))); });
  return <div className="grid gap-3">
    <input className="h-11 rounded-md border border-line bg-surface px-3" placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} />
    {list.map((m) => (
      <Box key={m.username}>
        <p className="flex items-center gap-1.5 font-bold">{m.name}{m.badge ? <BadgeIcon badge={m.badge} size={15} /> : null} <span className="font-normal text-muted">@{m.username}</span>{m.suspended ? <span className="text-red-700"> · {t.suspend}</span> : null}</p>
        {m.officialChannel ? <p className="text-[13px] text-gold">{m.officialChannel}</p> : null}
        {m.ijazahChain ? <p className="text-[13px]">{m.ijazahChain}</p> : null}
        <div className="flex flex-wrap gap-2">{LEVELS.map((l) => <button key={l} className={`${btn} ${m.level === l ? "btn-gold" : ""}`} onClick={() => void set(m, { level: l }, { level: l })}>{l}</button>)}</div>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={() => void set(m, { official: !m.official }, { official: !m.official })}>{m.official ? t.officialOff : t.officialOn}</button>
          <button className={btn} onClick={() => void set(m, { verified: !m.adminVerified }, { adminVerified: !m.adminVerified })}>{m.adminVerified ? t.verifyOff : t.verifyOn}</button>
          <button className={btn} onClick={() => void set(m, { badgeOverride: "none" }, { badge: null })}>{t.block}</button>
          <button className={btn} onClick={() => void set(m, { suspended: !m.suspended }, { suspended: !m.suspended })}>{m.suspended ? t.unsuspend : t.suspend}</button>
        </div>
      </Box>
    ))}
  </div>;
}

type Invite = { id: string; hint: string; note: string; level: string; maxUses: number; uses: number; expiresAt: string | null; revoked: boolean; usedBy: string[] };
function Invites({ t, run, btn, locale }: P & { locale: string }) {
  const [list, setList] = useState<Invite[] | null>(null);
  const [level, setLevel] = useState("master");
  const [uses, setUses] = useState("1");
  const [days, setDays] = useState("30");
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const load = useCallback(() => run(async () => setList((await api<{ invites: Invite[] }>("/api/community/admin/invites")).invites)), [run]);
  useEffect(() => { void load(); }, [load]);
  const create = () => run(async () => { const d = await api<{ code: string }>("/api/community/admin/invites", { level, maxUses: Number(uses) || 1, days: Number(days) || 30, note }); setCode(d.code); setNote(""); await load(); });
  return <div className="grid gap-3">
    <Box>
      <div className="flex flex-wrap gap-2">{["rising", "master", "sheikh"].map((l) => <button key={l} className={`${btn} ${level === l ? "btn-gold" : ""}`} onClick={() => setLevel(l)}>{l}</button>)}</div>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold">{t.uses}<input className="h-10 rounded-md border border-line bg-surface px-3" value={uses} onChange={(e) => setUses(e.target.value.replace(/\D/g, ""))} /></label>
        <label className="grid gap-1 text-sm font-semibold">{t.days}<input className="h-10 rounded-md border border-line bg-surface px-3" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ""))} /></label>
        <label className="grid gap-1 text-sm font-semibold">{t.note}<input className="h-10 rounded-md border border-line bg-surface px-3" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} /></label>
      </div>
      <button className={`${btn} btn-gold w-fit`} onClick={() => void create()}>{t.create}</button>
      {code ? <p className="rounded-md border border-gold p-3">{t.newCode} <strong className="select-all tracking-widest" dir="ltr">{code}</strong></p> : null}
    </Box>
    {list?.map((i) => (
      <Box key={i.id}>
        <p className="font-bold" dir="ltr">…{i.hint} · {i.level}{i.revoked ? ` · ${t.revoked}` : ""}</p>
        <p className="text-[13px] text-muted">{i.uses}/{i.maxUses}{i.expiresAt ? ` · ${new Date(i.expiresAt).toLocaleDateString(locale)}` : ""}{i.note ? ` · ${i.note}` : ""}{i.usedBy.length ? ` · ${i.usedBy.map((u) => `@${u}`).join(", ")}` : ""}</p>
        {!i.revoked ? <button className={`${btn} w-fit`} onClick={() => void run(async () => { await api(`/api/community/admin/invites?id=${i.id}`, undefined, "DELETE"); await load(); })}>{t.revoke}</button> : null}
      </Box>
    ))}
  </div>;
}

type Application = { id: string; realName: string; country: string | null; rewaya: string; teacher: string; ijazahInfo: string; at: string; sample: string | null; username: string; reciterLevel: number };
function Verify({ t, run, btn }: P) {
  const [list, setList] = useState<Application[] | null>(null);
  const [reason, setReason] = useState("");
  useEffect(() => { void run(async () => setList((await api<{ applications: Application[] }>("/api/community/admin/verifications")).applications)); }, [run]);
  const act = (id: string, action: string) => run(async () => { await api("/api/community/admin/verifications", { id, action, reason }); setReason(""); setList((l) => l?.filter((x) => x.id !== id) ?? null); });
  if (!list) return <div className="h-32 animate-pulse rounded-lg bg-line/40" />;
  if (!list.length) return <p className="text-muted">{t.none}</p>;
  return <div className="grid gap-3">{list.map((v) => (
    <Box key={v.id}>
      <p className="font-bold">@{v.username} · {v.realName}</p>
      <p className="text-[13px] text-muted">{[v.country, v.rewaya, `RP ${v.reciterLevel}`].filter(Boolean).join(" · ")}</p>
      {v.teacher ? <p>{v.teacher}</p> : null}
      {v.ijazahInfo ? <p>{v.ijazahInfo}</p> : null}
      {v.sample ? <audio controls preload="none" src={v.sample} className="w-full" /> : null}
      <input className="h-10 rounded-md border border-line bg-surface px-3" placeholder={t.reason} value={reason} onChange={(e) => setReason(e.target.value)} />
      <div className="flex gap-2"><button className={`${btn} btn-gold`} onClick={() => void act(v.id, "approve")}>{t.approve}</button><button className={btn} onClick={() => void act(v.id, "reject")}>{t.reject}</button></div>
    </Box>
  ))}</div>;
}

// Star profiles (owner 22.10.2026): takeover requests with one-click approve / reject, and per star a personal invite
// link (signed, 30 days) to send with the owner's message.
type StarClaim = { id: string; star: string; starName: string; role: "self" | "team"; channel: string; message: string; invited: boolean; at: string; username: string | null; name: string | null };
type StarRow = { username: string; name: string; country: string | null; claimedBy: string | null };
type StarAssignment = { id: string; star: string | null; badge?: string; via: string; at: string; undoneAt: string | null; previous: string | null; username: string | null };
function Stars({ t, run, btn, locale }: P & { locale: string }) {
  const [claims, setClaims] = useState<StarClaim[] | null>(null);
  const [stars, setStars] = useState<StarRow[]>([]);
  const [reason, setReason] = useState("");
  const [copied, setCopied] = useState("");
  const [log, setLog] = useState<StarAssignment[]>([]);
  const [email, setEmail] = useState<Record<string, string>>({});
  const sx = starText(locale);
  const load = useCallback(() => run(async () => { const d = await api<{ claims: StarClaim[]; stars: StarRow[]; assignments: StarAssignment[] }>("/api/community/admin/stars"); setClaims(d.claims); setStars(d.stars); setLog(d.assignments); }), [run]);
  const [pick, setPick] = useState<"star" | "personality">("star");
  const assign = (u: string) => run(async () => { await api("/api/community/admin/stars", { assign: u, email: email[u] ?? "", badge: pick }); setEmail((e) => ({ ...e, [u]: "" })); await load(); });
  const undo = (id: string) => run(async () => { await api("/api/community/admin/stars", { undo: id }); await load(); });
  useEffect(() => { void load(); }, [load]);
  const act = (id: string, action: string) => run(async () => { await api("/api/community/admin/stars", { id, action, reason }); setReason(""); await load(); });
  const invite = (username: string) => run(async () => {
    const d = await api<{ link: string }>("/api/community/admin/stars", { invite: username, locale });
    await navigator.clipboard.writeText(d.link).catch(() => window.prompt("", d.link));
    setCopied(username);
  });
  if (!claims) return <div className="h-32 animate-pulse rounded-lg bg-line/40" />;
  return <div className="grid gap-6">
    <section className="grid gap-3">
      <h2 className="text-lg font-bold">{t.starClaims}</h2>
      {!claims.length ? <p className="text-muted">{t.none}</p> : claims.map((c) => (
        <Box key={c.id}>
          <p className="font-bold">{c.starName} · @{c.star}</p>
          <p className="text-[13px] text-muted">@{c.username ?? "?"} · {c.role === "self" ? t.roleSelf : t.roleTeam}{c.invited ? ` · ${t.starInvited}` : ""} · {new Date(c.at).toLocaleDateString(locale)}</p>
          <a href={c.channel} target="_blank" rel="noopener noreferrer nofollow" className="break-all font-semibold text-accent hover:underline" dir="ltr">{c.channel}</a>
          {c.message ? <p className="whitespace-pre-line">{c.message}</p> : null}
          <input className="h-10 rounded-md border border-line bg-surface px-3" placeholder={t.reason} value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex gap-2"><button className={`${btn} btn-gold`} onClick={() => void act(c.id, "approve")}>{t.approve}</button><button className={btn} onClick={() => void act(c.id, "reject")}>{t.reject}</button></div>
        </Box>
      ))}
    </section>
    <section className="grid gap-2">
      <h2 className="text-lg font-bold">{sx.adminLog}</h2>
      {!log.length ? <p className="text-muted">{t.none}</p> : log.map((a) => (
        <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-[14px]">
          <span dir="ltr">{a.star ? `@${a.star}` : (a.badge === "personality" ? sx.adminBadgePerson : sx.adminBadgeStar)} → @{a.username ?? "?"} · {a.via} · {new Date(a.at).toLocaleString(locale)}{a.undoneAt ? ` · ${sx.adminUndone}` : ""}</span>
          {!a.undoneAt ? <button className={btn} onClick={() => void undo(a.id)}>{sx.adminUndo}</button> : null}
        </div>
      ))}
    </section>
    <section className="grid gap-2">
      <h2 className="text-lg font-bold">{sx.adminAssign}</h2>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {(["star", "personality"] as const).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={pick === k} onClick={() => setPick(k)} className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ${pick === k ? "btn-gold" : "border border-line"}`}><BadgeIcon badge={k} size={16} />{k === "star" ? sx.adminBadgeStar : sx.adminBadgePerson}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-[13px]">
        <span className="font-semibold">{sx.adminNoName}</span>
        <input type="email" className="h-9 w-56 rounded-md border border-line bg-surface px-2" placeholder={sx.adminEmail} value={email[""] ?? ""} onChange={(e) => setEmail((m) => ({ ...m, "": e.target.value }))} />
        <button className={`${btn} btn-gold`} disabled={!(email[""] ?? "").includes("@")} onClick={() => void assign("")}>{sx.adminAssign}</button>
      </div>
      <h2 className="mt-4 text-lg font-bold">{t.starAll}</h2>
      {stars.map((s) => (
        <div key={s.username} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-3">
          <div className="flex items-center gap-2"><a href={`/${locale}/talents/${s.username}`} className="font-semibold hover:underline">{s.name}</a><span className="text-[13px] text-muted" dir="ltr">@{s.username}</span>{s.claimedBy ? <BadgeIcon badge="star" size={16} /> : null}</div>
          <div className="flex items-center gap-2 text-[13px] text-muted">
            {s.claimedBy ? <span>{t.starClaimed} @{s.claimedBy}</span> : <>
              <span>{copied === s.username ? t.starCopied : t.starOpen}</span>
              <button className={btn} onClick={() => void invite(s.username)}>{t.starInvite}</button>
              <input type="email" className="h-9 w-48 rounded-md border border-line bg-surface px-2" placeholder={sx.adminEmail} value={email[s.username] ?? ""} onChange={(e) => setEmail((m) => ({ ...m, [s.username]: e.target.value }))} />
              <button className={`${btn} btn-gold`} disabled={!(email[s.username] ?? "").includes("@")} onClick={() => void assign(s.username)}>{sx.adminAssign}</button>
            </>}
          </div>
        </div>
      ))}
    </section>
  </div>;
}
