"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { errorText, fill, messengerText, systemLine } from "@/lib/messenger/text";

// The messenger on the website (same API and rules as the app: src/app/api/messenger/[...path]). Encrypted in transit
// and at rest on the server, reported messages are readable by moderators; never called "end-to-end encrypted".
// Photos are re-encoded in the browser (canvas, which drops EXIF and location) and again on the server; voice notes
// are recorded with MediaRecorder (at most two minutes) and converted on the server.

type Person = { username: string; name: string; avatar: string | null };
type Reaction = "mashallah" | "heart" | "dua";
type Row = { id: string; kind: "direct" | "group" | "circle"; title: string; with: Person | null; photo: string | null; request: { status: string; incoming: boolean } | null;
  last: { kind: string; text: string | null; mine: boolean; name: string; gone: boolean; system?: { what: string; who: string } | null } | null; at: string | null; unread: number };
type Msg = { id: string; kind: "text" | "image" | "voice" | "system"; mine: boolean; sender: Person | null; text: string | null; system: { what: string; who: string } | null;
  deleted: boolean; removed: boolean; media: string | null; durationMs: number | null; reply: { id: string; name: string; kind: string; text: string | null; gone: boolean } | null;
  reactions: Partial<Record<Reaction, number>>; myReaction: Reaction | null; at: string };
type Member = Person & { role: string; muted: boolean; me: boolean };
type Info = { id: string; kind: Row["kind"]; title: string; audience: string; with: Person | null; photo: string | null; me: { role: string; quiet: boolean }; members: Member[]; memberCount: number;
  request: { status: string; incoming: boolean } | null; typing: string[]; readUpTo: number | null; readers: number[] | null; invite?: boolean; canManage: boolean };

const CATS = ["spam", "harassment", "inappropriate", "impersonation", "minor_safety", "other"];
const REACTIONS: Reaction[] = ["mashallah", "heart", "dua"];
class ApiErr extends Error { constructor(public code: string) { super(code); } }
async function call<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const r = await fetch(`/api/messenger/${path}`, {
    ...init, cache: "no-store", credentials: "same-origin",
    headers: init.json !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiErr((d as { error?: string }).error ?? `http_${r.status}`);
  return d as T;
}
const codeOf = (e: unknown) => (e instanceof ApiErr ? e.code : "generic");

function ReactionIcon({ r, size = 16 }: { r: Reaction; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (r === "heart") return <svg {...p} className="text-rose-600"><path d="M12 20s-7-4.3-7-10a4.2 4.2 0 0 1 7-3 4.2 4.2 0 0 1 7 3c0 5.7-7 10-7 10z" /></svg>;
  if (r === "dua") return <svg {...p} className="text-gold"><path d="M12 20c-4.5 0-7.5-2.5-7.5-6 0-2 1-3.5 2.5-4.5L9 8.5C9.8 7 11 6 12 4c1 2 2.2 3 3 4.5l2 1c1.5 1 2.5 2.5 2.5 4.5 0 3.5-3 6-7.5 6z" /><path d="M12 11v8" /></svg>;
  return <svg {...p} className="text-gold" fill="currentColor"><path d="M12 3l2.6 5.6 6.1.7-4.5 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.3l6.1-.7z" /></svg>;
}

function Avatar({ name, src, size = 44 }: { name: string; src: string | null; size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgb(var(--gold))]/50 bg-[rgb(8,58,44)] text-white" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-semibold">{name.slice(0, 1).toUpperCase()}</span>}
    </span>
  );
}

/** a photo as a JPEG of at most 1600 px; drawing on a canvas drops EXIF and location */
async function reencode(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", 0.82));
}

export default function MessengerWeb({ locale }: { locale: string }) {
  const t = useMemo(() => messengerText(locale), [locale]);
  const [box, setBox] = useState<"inbox" | "requests">("inbox");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [unread, setUnread] = useState({ inbox: 0, requests: 0 });
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [state, setState] = useState<"load" | "ok" | "out">("load");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ threadId: string; title: string; snippet: string | null }[] | null>(null);
  const [panel, setPanel] = useState<"new" | "join" | "group" | null>(null);
  const [field, setField] = useState("");
  const [aud, setAud] = useState("all");
  const [active, setActive] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<boolean | null>(null);

  const loadList = useCallback(async () => {
    try { const d = await call<{ threads: Row[]; unread: typeof unread }>(`threads?box=${box}`); setRows(d.threads); setUnread(d.unread); setState("ok"); }
    catch (e) { const c = codeOf(e); if (c === "login" || c === "verify" || c === "profile_required" || c.startsWith("age")) setState("out"); setErr(errorText(t, c)); setRows((r) => r ?? []); }
  }, [box, t]);
  useEffect(() => { void loadList(); const h = setInterval(() => void loadList(), 15000); return () => clearInterval(h); }, [loadList]);
  useEffect(() => { void call<{ readReceipts: boolean }>("prefs").then((p) => setReceipts(p.readReceipts)).catch(() => undefined); }, []);
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("join");
    if (code) { setPanel("join"); setField(code); }
  }, []);
  useEffect(() => {
    if (q.trim().length < 2) { setHits(null); return; }
    const h = setTimeout(() => { void call<{ results: { threadId: string; title: string; snippet: string | null }[] }>(`search?q=${encodeURIComponent(q.trim())}`).then((d) => setHits(d.results)).catch(() => setHits([])); }, 350);
    return () => clearTimeout(h);
  }, [q]);

  const submit = async () => {
    setErr("");
    try {
      const v = field.trim();
      const d = panel === "join" ? await call<{ id: string }>("join", { method: "POST", json: { code: v } })
        : panel === "group" ? await call<{ id: string }>("groups", { method: "POST", json: { name: v, audience: aud } })
        : await call<{ id: string }>("threads", { method: "POST", json: { username: v.replace(/^@/, "") } });
      setPanel(null); setField(""); setActive(d.id); void loadList();
    } catch (e) { setErr(errorText(t, codeOf(e))); }
  };
  const preview = (c: Row) => {
    const l = c.last;
    if (!l) return c.kind === "circle" ? t.circleHint : "";
    if (l.kind === "system") return systemLine(t, l.system);
    const who = l.mine ? `${t.you}: ` : c.kind !== "direct" && l.name ? `${l.name}: ` : "";
    if (l.gone) return `${who}${t.deleted}`;
    if (l.kind === "image") return `${who}${t.photoMsg}${l.text ? ` · ${l.text}` : ""}`;
    if (l.kind === "voice") return `${who}${t.voiceMsg}`;
    return `${who}${l.text ?? ""}`;
  };
  const shown = rows && onlyUnread && box === "inbox" ? rows.filter((r) => r.unread > 0) : rows;

  if (state === "out") return <div className="mx-auto max-w-2xl px-5 py-16 text-center"><h1 className="font-display text-3xl">{t.title}</h1><p className="mt-4 text-muted">{err || t.signIn}</p></div>;

  const btn = "inline-flex min-h-10 items-center justify-center rounded-full border border-[rgb(var(--gold))]/40 bg-white/[0.04] px-4 text-sm font-semibold backdrop-blur hover:bg-white/[0.08]";
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-[360px_1fr]">
      <aside className={`${active ? "hidden md:block" : ""} space-y-3`}>
        <h1 className="font-display text-3xl">{t.title}</h1>
        <div role="tablist" className="flex rounded-full border border-[rgb(var(--gold))]/30 p-1">
          {(["inbox", "requests"] as const).map((b) => (
            <button key={b} role="tab" aria-selected={box === b} onClick={() => { setBox(b); setRows(null); }}
              className={`min-h-9 flex-1 rounded-full text-sm font-semibold ${box === b ? "bg-[rgb(var(--gold))] text-[rgb(8,38,29)]" : ""}`}>
              {b === "inbox" ? t.inbox : t.requests}{(b === "inbox" ? unread.inbox : unread.requests) ? ` (${b === "inbox" ? unread.inbox : unread.requests})` : ""}
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPh} aria-label={t.searchPh} className="min-h-11 w-full rounded-full border border-white/15 bg-transparent px-4" />
        {box === "inbox" && !hits ? (
          <div className="flex flex-wrap gap-2">
            <button className={`${btn} ${onlyUnread ? "bg-[rgb(var(--gold))]/20" : ""}`} aria-pressed={onlyUnread} onClick={() => setOnlyUnread((v) => !v)}>{t.unreadOnly}</button>
            <button className={btn} onClick={() => { setPanel(panel === "new" ? null : "new"); setField(""); }}>{t.newChat}</button>
            <button className={btn} onClick={() => { setPanel(panel === "group" ? null : "group"); setField(""); }}>{t.newGroup}</button>
            <button className={btn} onClick={() => { setPanel(panel === "join" ? null : "join"); setField(""); }}>{t.join}</button>
          </div>
        ) : null}
        {panel ? (
          <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
            <input autoFocus value={field} onChange={(e) => setField(e.target.value)} maxLength={panel === "group" ? 60 : 200}
              placeholder={panel === "join" ? t.joinPh : panel === "group" ? t.groupName : t.newChatHint} aria-label={panel === "join" ? t.joinPh : panel === "group" ? t.groupName : t.newChatHint}
              className="min-h-11 w-full rounded-xl border border-white/15 bg-transparent px-3" />
            {panel === "group" ? (
              <>
                <select value={aud} onChange={(e) => setAud(e.target.value)} aria-label={t.audience} className="min-h-11 w-full rounded-xl border border-white/15 bg-transparent px-3">
                  <option value="all">{t.aud_all}</option><option value="sisters">{t.aud_sisters}</option><option value="brothers">{t.aud_brothers}</option>
                </select>
                <p className="text-xs text-muted">{t.audienceHint}</p>
              </>
            ) : null}
            <button type="submit" className={`${btn} w-full`} disabled={!field.trim()}>{panel === "join" ? t.join : panel === "group" ? t.create : t.open}</button>
          </form>
        ) : null}
        {err ? <p role="alert" className="text-sm font-semibold text-red-500">{err}</p> : null}
        {box === "requests" ? <p className="text-sm text-muted">{t.requestsHint}</p> : null}
        <ul className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
          {hits ? (hits.length ? hits.map((h, i) => (
            <li key={`${h.threadId}-${i}`}><button className="w-full p-3 text-start hover:bg-white/[0.04]" onClick={() => setActive(h.threadId)}>
              <span className="block font-semibold">{h.title}</span>{h.snippet ? <span className="block truncate text-sm text-muted">{h.snippet}</span> : null}</button></li>
          )) : <li className="p-4 text-center text-muted">{t.noResults}</li>)
            : shown && !shown.length ? <li className="p-4 text-center text-muted">{box === "requests" ? t.emptyRequests : onlyUnread ? t.noResults : t.empty}</li>
            : (shown ?? []).map((c) => (
              <li key={c.id}>
                <button onClick={() => setActive(c.id)} className={`flex w-full items-center gap-3 p-3 text-start hover:bg-white/[0.04] ${active === c.id ? "bg-white/[0.06]" : ""}`}>
                  <Avatar name={c.title} src={c.kind === "direct" ? c.with?.avatar ?? null : c.photo} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate ${c.unread ? "font-bold" : "font-semibold"}`}>{c.title}{c.kind === "circle" ? <span className="ms-2 text-xs text-gold">{t.circleChat}</span> : null}</span>
                    <span className={`block truncate text-sm ${c.unread ? "" : "text-muted"}`}>{c.request?.incoming ? fill(t.requestIncoming, c.title) : preview(c)}</span>
                  </span>
                  {c.unread ? <span className="min-w-5 rounded-full bg-[rgb(var(--gold))] px-1.5 text-center text-xs font-bold text-[rgb(8,38,29)]">{c.unread}</span> : null}
                </button>
              </li>
            ))}
        </ul>
        {receipts !== null ? (
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1" checked={receipts} onChange={(e) => { const v = e.target.checked; setReceipts(v); void call("prefs", { method: "POST", json: { readReceipts: v } }).catch(() => setReceipts(!v)); }} />
            <span><span className="font-semibold">{t.readReceipts}</span><span className="block text-muted">{t.readReceiptsHint}</span></span>
          </label>
        ) : null}
        <p className="text-xs leading-relaxed text-muted">{t.privacy}</p>
      </aside>
      <section className={`${active ? "" : "hidden md:flex"} min-h-[70vh] flex-col rounded-3xl border border-white/10 bg-white/[0.03]`} style={{ display: active ? "flex" : undefined }}>
        {active ? <ChatPane key={active} id={active} t={t} locale={locale} onBack={() => { setActive(null); void loadList(); }} /> : <p className="m-auto p-8 text-muted">{t.empty}</p>}
      </section>
    </div>
  );
}

function ChatPane({ id, t, locale, onBack }: { id: string; t: ReturnType<typeof messengerText>; locale: string; onBack: () => void }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [more, setMore] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [reply, setReply] = useState<Msg | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [report, setReport] = useState<{ messageId: string | null } | null>(null);
  const [cat, setCat] = useState("other");
  const [reason, setReason] = useState("");
  const [done, setDone] = useState("");
  const [full, setFull] = useState<string | null>(null);
  const [rec, setRec] = useState<{ r: MediaRecorder; started: number } | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [addName, setAddName] = useState("");
  const [invite, setInvite] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastTyping = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const d = await call<{ thread: Info; messages: Msg[]; more: string | null; canSend: boolean; sendProblem: string | null }>(`threads/${id}`);
      setInfo(d.thread); setCanSend(d.canSend); setProblem(d.sendProblem);
      setMsgs((old) => { const first = d.messages[0]?.id; const keep = first ? old.filter((m) => Number(m.id) < Number(first)) : []; return [...keep, ...d.messages]; });
      setMore((m) => m ?? d.more);
    } catch (e) { setErr(errorText(t, codeOf(e))); }
  }, [id, t]);
  useEffect(() => { void load(); const h = setInterval(() => void load(), 4000); return () => clearInterval(h); }, [load]);
  const count = msgs.length;
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [count]);

  const run = async (fn: () => Promise<unknown>) => { setBusy(true); setErr(""); try { await fn(); } catch (e) { setErr(errorText(t, codeOf(e))); } finally { setBusy(false); } };
  const added = (m: Msg | null) => { if (m) setMsgs((o) => [...o.filter((x) => x.id !== m.id), m]); setReply(null); };
  const send = () => run(async () => { const body = text.trim(); if (!body) return; const d = await call<{ message: Msg | null }>(`threads/${id}/messages`, { method: "POST", json: { text: body, replyTo: reply?.id ?? null } }); setText(""); added(d.message); });
  const upload = (kind: "image" | "voice", blob: Blob, name: string, durationMs?: number) => run(async () => {
    const f = new FormData();
    f.append("kind", kind); f.append("file", blob, name);
    if (durationMs) f.append("durationMs", String(Math.round(durationMs)));
    if (reply) f.append("replyTo", reply.id);
    added((await call<{ message: Msg | null }>(`threads/${id}/messages`, { method: "POST", body: f })).message);
  });
  const pick = async (file: File | undefined) => { if (!file) return; try { await upload("image", await reencode(file), "photo.jpg"); } catch { setErr(t.e_media); } };
  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      const started = Date.now();
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => { stream.getTracks().forEach((x) => x.stop()); const ms = Date.now() - started; if ((r as MediaRecorder & { cancel?: boolean }).cancel || ms < 700) return; void upload("voice", new Blob(chunks, { type: r.mimeType }), "voice.webm", Math.min(ms, 120000)); };
      r.start(); setRec({ r, started });
      setTimeout(() => { if (r.state === "recording") { r.stop(); setRec(null); } }, 120000);
    } catch { setErr(t.micDenied); }
  };
  const stopRec = (sendIt: boolean) => { if (!rec) return; (rec.r as MediaRecorder & { cancel?: boolean }).cancel = !sendIt; rec.r.stop(); setRec(null); };
  const react = (m: Msg, r: Reaction) => run(async () => {
    const next = m.myReaction === r ? null : r; setMenu(null);
    await call(`messages/${m.id}/react`, { method: "POST", json: { kind: next } }); await load();
  });
  const unsend = (m: Msg) => { setMenu(null); if (!window.confirm(t.deleteConfirm)) return; void run(async () => { await call(`messages/${m.id}`, { method: "DELETE" }); setMsgs((o) => o.map((x) => (x.id === m.id ? { ...x, deleted: true, text: null, media: null } : x))); }); };
  const sendReport = () => run(async () => { await call(`threads/${id}/report`, { method: "POST", json: { category: cat, reason, messageId: report?.messageId ?? null } }); setReport(null); setReason(""); setDone(t.reported); });
  const block = () => info?.with && window.confirm(t.confirmBlock) && void run(async () => { const r = await fetch(`/api/community/block/${info.with!.username}`, { method: "POST" }); if (!r.ok) throw new ApiErr("generic"); onBack(); });
  const time = (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const lastMine = [...msgs].reverse().find((m) => m.mine && m.kind !== "system");
  const seen = !info || !lastMine ? "" : info.kind === "direct" ? (info.readUpTo !== null && Number(lastMine.id) <= info.readUpTo ? t.seen : t.sent)
    : ((n) => (n ? fill(t.seenBy, n) : t.sent))((info.readers ?? []).filter((r) => r >= Number(lastMine.id)).length);
  const incoming = info?.request?.incoming && info.request.status === "pending";
  const btn = "inline-flex min-h-10 items-center justify-center rounded-full border border-[rgb(var(--gold))]/40 px-4 text-sm font-semibold hover:bg-white/[0.06] disabled:opacity-50";
  const lastTap = useRef<{ id: string; at: number }>({ id: "", at: 0 });

  return (
    <>
      <header className="flex items-center gap-3 border-b border-white/10 p-3">
        <button onClick={onBack} className="md:hidden" aria-label={t.cancel}>&larr;</button>
        {info ? <Avatar name={info.title} src={info.kind === "direct" ? info.with?.avatar ?? null : info.photo} size={40} /> : null}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{info?.title}</p>
          <p className="truncate text-xs text-muted">{info?.kind === "direct" && info.with ? `@${info.with.username}` : info?.kind === "circle" ? t.circleChat : info ? fill(t.members, info.memberCount) : ""}</p>
        </div>
        {info && info.kind !== "direct" ? <button className={btn} onClick={() => setShowInfo((v) => !v)}>{t.groupInfo}</button> : null}
        <button className={btn} onClick={() => setReport({ messageId: null })}>{info?.kind === "direct" ? t.reportChat : t.reportGroup}</button>
        {info?.kind === "direct" ? <button className={btn} onClick={block}>{t.block}</button> : null}
      </header>
      {showInfo && info ? (
        <div className="space-y-3 border-b border-white/10 p-3 text-sm">
          {info.kind === "circle" ? <p className="text-muted">{t.circleHint}</p> : null}
          {info.canManage ? (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void run(async () => { await call(`threads/${id}/members`, { method: "POST", json: { username: addName.trim().replace(/^@/, "") } }); setAddName(""); await load(); }); }}>
              <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder={t.addHint} aria-label={t.addMember} className="min-h-10 flex-1 rounded-xl border border-white/15 bg-transparent px-3" />
              <button className={btn} disabled={!addName.trim() || busy}>{t.add}</button>
            </form>
          ) : null}
          {info.canManage ? (
            <div className="flex flex-wrap items-center gap-2">
              <button className={btn} onClick={() => void run(async () => setInvite((await call<{ code: string }>(`threads/${id}/invite`, { method: "POST", json: { action: "reset" } })).code))}>{t.inviteCreate}</button>
              {info.invite || invite ? <button className={btn} onClick={() => void run(async () => { await call(`threads/${id}/invite`, { method: "POST", json: { action: "off" } }); setInvite(null); })}>{t.inviteOff}</button> : null}
              {invite ? <code className="select-all break-all text-gold">{`${window.location.origin}/${locale}/messages?join=${invite}`}</code> : null}
              <p className="w-full text-xs text-muted">{t.inviteHint}</p>
            </div>
          ) : null}
          <ul className="max-h-60 divide-y divide-white/10 overflow-auto rounded-xl border border-white/10">
            {info.members.map((m) => (
              <li key={m.username} className="flex items-center gap-2 p-2">
                <Avatar name={m.name} src={m.avatar} size={30} />
                <span className="flex-1 truncate">{m.name} <span className="text-muted">@{m.username}</span>{m.role === "admin" ? <span className="ms-2 text-xs text-gold">{t.admin}</span> : null}{m.muted ? <span className="ms-2 text-xs text-red-500">{t.mutedTag}</span> : null}</span>
                {info.canManage && !m.me ? (
                  <select aria-label={m.name} className="rounded border border-white/15 bg-transparent text-xs" value="" onChange={(e) => { const a = e.target.value; if (a) void run(async () => { await call(`threads/${id}/members`, { method: "PATCH", json: { username: m.username, action: a } }); await load(); }); }}>
                    <option value="">…</option><option value="remove">{t.remove}</option><option value={m.muted ? "unmute" : "mute"}>{m.muted ? t.unmuteMember : t.muteMember}</option>
                    <option value={m.role === "admin" ? "member" : "admin"}>{m.role === "admin" ? t.removeAdmin : t.makeAdmin}</option>
                  </select>
                ) : null}
              </li>
            ))}
          </ul>
          <label className="flex items-center gap-2"><input type="checkbox" checked={info.me.quiet} onChange={(e) => void run(async () => { await call(`threads/${id}`, { method: "PATCH", json: { quiet: e.target.checked } }); await load(); })} />{t.quiet}</label>
          {info.kind === "group" ? <button className={btn} onClick={() => window.confirm(t.leaveConfirm) && void run(async () => { await call(`threads/${id}/leave`, { method: "POST", json: {} }); onBack(); })}>{t.leave}</button> : null}
        </div>
      ) : null}
      <div className="flex-1 space-y-2 overflow-y-auto p-4" style={{ maxHeight: "60vh" }}>
        {more ? <button className="mx-auto block text-sm font-semibold text-gold" onClick={() => void run(async () => { const d = await call<{ messages: Msg[]; more: string | null }>(`threads/${id}?before=${more}`); setMsgs((o) => [...d.messages, ...o]); setMore(d.more); })}>{t.loadOlder}</button> : null}
        {msgs.map((m) => m.kind === "system" ? <p key={m.id} className="text-center text-xs text-muted">{systemLine(t, m.system)}</p> : (
          <div key={m.id} className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
            {info && info.kind !== "direct" && !m.mine && m.sender ? <span className="mx-2 text-xs font-semibold text-gold">{m.sender.name}</span> : null}
            <div className={`group relative max-w-[80%] rounded-2xl px-3 py-2 ${m.mine ? "bg-[rgb(8,58,44)] text-white" : "border border-white/10 bg-white/[0.05]"}`}
              onClick={() => { const now = Date.now(); if (lastTap.current.id === m.id && now - lastTap.current.at < 320 && !m.deleted && !m.removed && m.myReaction !== "mashallah") void react(m, "mashallah"); lastTap.current = { id: m.id, at: now }; }}>
              {m.reply ? <div className="mb-1 border-s-2 border-[rgb(var(--gold))] ps-2 text-xs opacity-80"><b>{m.reply.name || t.you}</b><br />{m.reply.gone ? t.deleted : m.reply.kind === "image" ? t.photoMsg : m.reply.kind === "voice" ? t.voiceMsg : m.reply.text}</div> : null}
              {m.deleted || m.removed ? <i className="opacity-70">{m.deleted ? t.deleted : t.removed}</i> : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {m.kind === "image" && m.media ? <img src={m.media} alt={t.photoMsg} className="max-h-72 cursor-zoom-in rounded-xl" onClick={(e) => { e.stopPropagation(); setFull(m.media); }} /> : null}
                  {m.kind === "voice" && m.media ? <audio controls preload="none" src={m.media} aria-label={t.voiceMsg} className="max-w-60" /> : null}
                  {m.text ? <p className="whitespace-pre-wrap break-words">{m.text}</p> : null}
                </>
              )}
              <span className="mt-0.5 block text-end text-[11px] opacity-60">{time(m.at)}</span>
              {!m.deleted && !m.removed ? (
                <button className="absolute -top-2 end-1 hidden rounded-full bg-black/40 px-2 text-xs group-hover:block focus:block" aria-label={t.react} onClick={(e) => { e.stopPropagation(); setMenu(menu === m.id ? null : m.id); }}>…</button>
              ) : null}
              {menu === m.id ? (
                <div className="absolute end-0 top-6 z-10 w-52 space-y-1 rounded-2xl border border-white/15 bg-[rgb(var(--surface,13_33_26))] p-2 text-sm text-[rgb(var(--ink,236_238_242))] shadow-xl backdrop-blur" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-around">{REACTIONS.map((r) => <button key={r} aria-label={r === "mashallah" ? t.r_mashallah : r === "heart" ? t.r_heart : t.r_dua} aria-pressed={m.myReaction === r} className={`rounded-lg p-2 ${m.myReaction === r ? "bg-white/10" : ""}`} onClick={() => void react(m, r)}><ReactionIcon r={r} size={22} /></button>)}</div>
                  {canSend ? <button className="block w-full rounded-lg p-2 text-start hover:bg-white/10" onClick={() => { setReply(m); setMenu(null); }}>{t.reply}</button> : null}
                  {m.mine ? <button className="block w-full rounded-lg p-2 text-start hover:bg-white/10" onClick={() => unsend(m)}>{t.delete}</button>
                    : <button className="block w-full rounded-lg p-2 text-start hover:bg-white/10" onClick={() => { setReport({ messageId: m.id }); setMenu(null); }}>{t.reportMsg}</button>}
                </div>
              ) : null}
            </div>
            {Object.keys(m.reactions).some((k) => (m.reactions[k as Reaction] ?? 0) > 0) ? (
              <div className="mt-1 flex gap-1">{(Object.keys(m.reactions) as Reaction[]).filter((r) => (m.reactions[r] ?? 0) > 0).map((r) => (
                <button key={r} onClick={() => void react(m, r)} className={`flex items-center gap-1 rounded-full border px-2 text-xs ${m.myReaction === r ? "border-[rgb(var(--gold))]" : "border-white/15"}`}><ReactionIcon r={r} size={12} />{m.reactions[r]}</button>
              ))}</div>
            ) : null}
            {lastMine && m.id === lastMine.id && seen ? <span className="text-[11px] text-muted">{seen}</span> : null}
          </div>
        ))}
        {info?.typing.length ? <p aria-live="polite" className="text-sm italic text-muted">{info.typing.length > 1 ? t.typingMany : fill(t.typing, info.typing[0])}</p> : null}
        <div ref={endRef} />
      </div>
      {err ? <p role="alert" className="px-4 text-sm font-semibold text-red-500">{err}</p> : null}
      {done ? <p role="status" className="px-4 text-sm text-gold">{done}</p> : null}
      {incoming ? (
        <div className="space-y-2 border-t border-white/10 p-4">
          <p className="font-semibold">{fill(t.requestIncoming, info!.title)}</p>
          <p className="text-sm text-muted">{t.requestsHint}</p>
          <div className="flex gap-2">
            <button className={`${btn} bg-[rgb(var(--gold))] text-[rgb(8,38,29)]`} onClick={() => void run(async () => { await call(`threads/${id}/request`, { method: "POST", json: { action: "accept" } }); await load(); })}>{t.accept}</button>
            <button className={btn} onClick={() => void run(async () => { await call(`threads/${id}/request`, { method: "POST", json: { action: "decline" } }); onBack(); })}>{t.decline}</button>
          </div>
        </div>
      ) : canSend ? (
        <div className="border-t border-white/10 p-3">
          {problem === "request_text_only" || (info?.request && !info.request.incoming) ? <p className="pb-2 text-xs text-muted">{t.requestWait}</p> : null}
          {reply ? <p className="flex items-center gap-2 pb-2 text-xs text-muted"><span className="flex-1 truncate">{fill(t.replyingTo, reply.mine ? t.you : reply.sender?.name ?? "")}: {reply.kind === "image" ? t.photoMsg : reply.kind === "voice" ? t.voiceMsg : reply.text}</span><button onClick={() => setReply(null)} aria-label={t.cancel}>&times;</button></p> : null}
          <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="flex items-end gap-2 rounded-[28px] border border-white/15 bg-white/[0.06] p-1.5 backdrop-blur">
            {rec ? (
              <>
                <button type="button" className={btn} onClick={() => stopRec(false)}>{t.cancel}</button>
                <span aria-live="polite" className="flex-1 self-center text-sm font-semibold">{t.recording}</span>
                <button type="button" className={btn} onClick={() => stopRec(true)}>{t.stopSend}</button>
              </>
            ) : (
              <>
                {problem !== "request_text_only" ? <>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" hidden onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
                  <button type="button" className={btn} aria-label={t.photo} onClick={() => fileRef.current?.click()} disabled={busy}>{t.photoMsg}</button>
                </> : null}
                <textarea value={text} rows={1} maxLength={2000} placeholder={t.write} aria-label={t.write}
                  onChange={(e) => { setText(e.target.value); if (e.target.value && Date.now() - lastTyping.current > 3000) { lastTyping.current = Date.now(); void call(`threads/${id}/typing`, { method: "POST", json: {} }).catch(() => undefined); } }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                  className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 outline-none" />
                {text.trim() ? <button type="submit" className={`${btn} bg-[rgb(var(--gold))] text-[rgb(8,38,29)]`} disabled={busy}>{t.send}</button>
                  : problem !== "request_text_only" ? <button type="button" className={btn} aria-label={t.voice} onClick={() => void startRec()} disabled={busy}>{t.voiceMsg}</button> : null}
              </>
            )}
          </form>
        </div>
      ) : <p className="border-t border-white/10 p-4 text-sm text-muted">{errorText(t, problem)}</p>}
      {report ? (
        <div role="dialog" aria-modal className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setReport(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); void sendReport(); }} className="w-full max-w-md space-y-3 rounded-3xl border border-white/15 bg-[rgb(13,33,26)] p-5 text-white">
            <h2 className="text-lg font-semibold">{report.messageId ? t.reportMsg : info?.kind === "direct" ? t.reportChat : t.reportGroup}</h2>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="min-h-11 w-full rounded-xl border border-white/15 bg-transparent px-3">{CATS.map((c) => <option key={c} value={c} className="text-black">{c}</option>)}</select>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder={t.reportReason} className="w-full rounded-xl border border-white/15 bg-transparent p-3" />
            <button className={`${btn} w-full`} disabled={busy}>{t.sendReport}</button>
          </form>
        </div>
      ) : null}
      {full ? (
        <div role="dialog" aria-modal className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setFull(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={full} alt={t.photoMsg} className="max-h-full max-w-full" />
        </div>
      ) : null}
    </>
  );
}
