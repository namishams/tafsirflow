"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { errorText, fill, messengerText, systemLine } from "@/lib/messenger/text";

// The messenger on the website, the same layout and rules as the app (src/app/api/messenger/[...path]; the inbox
// follows the Instagram DM inbox, owner 22.10.2026). Encrypted in transit and at rest on the server; reported
// messages are readable by moderators; never called "end-to-end encrypted". Photos are re-encoded in the browser
// (canvas drops EXIF and location) and again on the server; voice notes use MediaRecorder (two minutes at most).
// Sending, starting chats and groups need Pro: the server checks it, the page only shows the upsell.

type Badge = string | null;
type Person = { username: string; name: string; avatar: string | null; badge?: Badge; verified?: boolean; level?: string };
type Reaction = "mashallah" | "heart" | "dua";
type ShareCard = { type: "verse" | "surah" | "course" | "carousel" | "profile" | "post"; ref: string; title: string; subtitle: string; url: string };
type Row = { id: string; kind: "direct" | "group" | "circle"; title: string; with: Person | null; photo: string | null; request: { status: string; incoming: boolean } | null;
  last: { kind: string; text: string | null; mine: boolean; name: string; gone: boolean; viewOnce?: boolean; system?: { what: string; who: string } | null } | null;
  at: string | null; unread: number; quiet?: boolean; pro?: boolean; active?: boolean; seen?: boolean };
type Msg = { id: string; kind: "text" | "image" | "voice" | "video" | "share" | "system"; mine: boolean; sender: Person | null; text: string | null; card?: ShareCard | null;
  system: { what: string; who: string } | null; deleted: boolean; removed: boolean; media: string | null; durationMs: number | null;
  reply: { id: string; name: string; kind: string; text: string | null; gone: boolean } | null; reactions: Partial<Record<Reaction, number>>; myReaction: Reaction | null; at: string;
  viewOnce?: { opened: boolean; canOpen: boolean } | null; edited?: boolean; editable?: boolean };
type Member = Person & { role: string; muted: boolean; me: boolean };
type Info = { id: string; kind: Row["kind"]; title: string; audience: string; with: Person | null; photo: string | null; me: { role: string; quiet: boolean }; members: Member[]; memberCount: number;
  request: { status: string; incoming: boolean } | null; typing: string[]; readUpTo: number | null; readers: number[] | null; invite?: boolean; canManage: boolean;
  card?: { country: string | null; level: string; mutual: number } | null; active?: boolean; canViewOnce?: boolean };
type Me = Person & { pro: boolean };
type T = ReturnType<typeof messengerText>;

const CATS = ["spam", "harassment", "inappropriate", "impersonation", "minor_safety", "other"] as const;
const REACTIONS: Reaction[] = ["mashallah", "heart", "dua"];
class ApiErr extends Error { constructor(public code: string) { super(code); } }
async function call<R>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<R> {
  const r = await fetch(`/api/messenger/${path}`, {
    ...init, cache: "no-store", credentials: "same-origin",
    headers: init.json !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiErr((d as { error?: string }).error ?? `http_${r.status}`);
  return d as R;
}
const codeOf = (e: unknown) => (e instanceof ApiErr ? e.code : "generic");
const cardLabel = (t: T, type: ShareCard["type"]) => t[`card_${type}` as keyof T] as string;

function ago(iso: string | null, locale: string) {
  if (!iso) return "";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const [n, unit] = s < 3600 ? [Math.max(1, Math.round(s / 60)), "minute"] : s < 86400 ? [Math.round(s / 3600), "hour"] : s < 604800 ? [Math.round(s / 86400), "day"] : [Math.round(s / 604800), "week"];
  try { return new Intl.NumberFormat(locale, { style: "unit", unit: unit as string, unitDisplay: "narrow" }).format(n as number); } catch { return String(n); }
}

function ReactionIcon({ r, size = 16 }: { r: Reaction; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (r === "heart") return <svg {...p} className="text-rose-600"><path d="M12 20s-7-4.3-7-10a4.2 4.2 0 0 1 7-3 4.2 4.2 0 0 1 7 3c0 5.7-7 10-7 10z" /></svg>;
  if (r === "dua") return <svg {...p} className="text-gold"><path d="M12 20c-4.5 0-7.5-2.5-7.5-6 0-2 1-3.5 2.5-4.5L9 8.5C9.8 7 11 6 12 4c1 2 2.2 3 3 4.5l2 1c1.5 1 2.5 2.5 2.5 4.5 0 3.5-3 6-7.5 6z" /><path d="M12 11v8" /></svg>;
  return <svg {...p} className="text-gold" fill="currentColor"><path d="M12 3l2.6 5.6 6.1.7-4.5 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.3l6.1-.7z" /></svg>;
}
const ICONS = {
  pen: "M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.8 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3.1 14H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.8 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 20.9 10H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4", back: "M15 18l-6-6 6-6",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z",
  plus: "M12 5v14M5 12h14", close: "M6 6l12 12M18 6L6 18", send: "M21.5 3 3 10.2l7.4 3.1L21.5 3zM21.5 3 15 21l-4.6-7.7",
  mic: "M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM5 11a7 7 0 0 0 14 0M12 18v3",
};
const Ico = ({ n, size = 20 }: { n: keyof typeof ICONS; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={ICONS[n]} /></svg>
);

function Avatar({ name, src, size = 56, ring = false, active = false }: { name: string; src: string | null; size?: number; ring?: boolean; active?: boolean }) {
  return (
    <span className="relative inline-flex shrink-0">
      <span className={`inline-flex rounded-full border-2 p-[2px] ${ring ? "border-[rgb(var(--gold))]" : "border-transparent"}`}>
        <span className="inline-flex items-center justify-center overflow-hidden rounded-full bg-[rgb(8,58,44)] text-white" style={{ width: size, height: size }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <span className="text-base font-semibold">{name.slice(0, 1).toUpperCase()}</span>}
        </span>
      </span>
      {active ? <span className="absolute bottom-1 end-1 h-3.5 w-3.5 rounded-full border-[2.5px] border-[rgb(var(--bg))] bg-[rgb(46,170,110)]" /> : null}
    </span>
  );
}
function Tick({ badge }: { badge?: Badge }) {
  if (!badge) return null;
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden className="shrink-0 text-gold">
      <path fill="currentColor" d="M12 2l2.4 2.1 3.1-.5.9 3 2.8 1.5-1 3 1 2.9-2.8 1.5-.9 3-3.1-.5L12 22l-2.4-2.1-3.1.5-.9-3-2.8-1.5 1-2.9-1-3 2.8-1.5.9-3 3.1.5z" />
      <path d="M8 12.2l2.6 2.6L16 9.4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GardenArt() {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden>
      <circle cx="75" cy="78" r="62" fill="rgb(var(--accent-soft))" />
      <path d="M45 128V70a30 30 0 0 1 60 0v58" fill="none" stroke="rgb(var(--gold))" strokeWidth="3" />
      <path d="M55 128V74a20 20 0 0 1 40 0v54" fill="none" stroke="rgb(var(--gold))" strokeWidth="1.5" opacity=".6" />
      <path d="M82 46a10 10 0 1 1-9-14 8 8 0 1 0 9 14z" fill="rgb(var(--gold))" />
      <path d="M75 128c0-18-2-30-12-40 10 3 14 12 14 22 1-12 6-20 16-24-8 9-10 20-10 42" fill="rgb(var(--accent))" opacity=".85" />
      <path d="M30 128h90" stroke="rgb(var(--gold))" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div role="dialog" aria-modal aria-label={title} className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[90dvh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl bg-[rgb(var(--bg))] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-[rgb(var(--ink))] shadow-2xl sm:rounded-3xl">
        <div className="mx-auto h-1 w-10 rounded-full bg-[rgb(var(--line))] sm:hidden" />
        <h2 className="text-center text-base font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/** a photo as a JPEG of at most `max` px; drawing on a canvas drops EXIF and location */
async function reencode(file: File, max = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", 0.82));
}

const field = "min-h-10 w-full rounded-xl bg-[rgb(var(--surface))] px-3 outline-none ring-1 ring-[rgb(var(--line))] focus:ring-[rgb(var(--accent))]";
const soft = (on: boolean) => `inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold ring-1 ${on ? "bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))] ring-[rgb(var(--accent))]" : "bg-[rgb(var(--surface))] ring-[rgb(var(--line))]"}`;
const btn = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-[rgb(var(--line))] hover:bg-[rgb(var(--surface))] disabled:opacity-50";
const gold = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#E8CF8A] to-[#C6A65E] px-5 text-sm font-bold text-[rgb(40,30,8)] disabled:opacity-50";
const iconBtn = "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-[rgb(var(--surface))]";

export default function MessengerWeb({ locale }: { locale: string }) {
  const t = useMemo(() => messengerText(locale), [locale]);
  const [box, setBox] = useState<"inbox" | "requests" | "unread" | "unanswered">("inbox");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [unread, setUnread] = useState({ inbox: 0, requests: 0 });
  const [state, setState] = useState<"load" | "ok" | "out">("load");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ threadId: string; title: string; snippet: string | null }[] | null>(null);
  const [compose, setCompose] = useState<"new" | "join" | "group" | null>(null);
  const [settings, setSettings] = useState(false);
  const [val, setVal] = useState("");
  const [aud, setAud] = useState("all");
  const [people, setPeople] = useState<(Person & { country?: string | null; mine?: boolean })[]>([]);
  const [needPro, setNeedPro] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<{ readReceipts: boolean; activeStatus: boolean } | null>(null);

  const loadList = useCallback(async () => {
    try {
      const d = await call<{ threads: Row[]; unread: { inbox: number; requests: number }; me: Me | null }>(`threads?box=${box === "requests" ? "requests" : "inbox"}`);
      setRows(d.threads); setUnread(d.unread); setMe(d.me); setState("ok");
    } catch (e) { const c = codeOf(e); if (c === "login" || c === "verify" || c === "profile_required" || c.startsWith("age")) setState("out"); setErr(errorText(t, c)); setRows((r) => r ?? []); }
  }, [box, t]);
  useEffect(() => { void loadList(); const h = setInterval(() => void loadList(), 15000); return () => clearInterval(h); }, [loadList]);
  useEffect(() => { if (settings) void call<{ readReceipts: boolean; activeStatus: boolean }>("prefs").then(setPrefs).catch(() => undefined); }, [settings]);
  useEffect(() => { const code = new URLSearchParams(window.location.search).get("join"); if (code) { setCompose("join"); setVal(code); } }, []);
  useEffect(() => {
    if (q.trim().length < 2) { setHits(null); return; }
    const h = setTimeout(() => { void call<{ results: { threadId: string; title: string; snippet: string | null }[] }>(`search?q=${encodeURIComponent(q.trim())}`).then((d) => setHits(d.results)).catch(() => setHits([])); }, 350);
    return () => clearTimeout(h);
  }, [q]);
  // new chat: people as you type (the server leaves out blocked and suspended members)
  useEffect(() => {
    const v = val.trim().replace(/^@/, "");
    if (compose !== "new" || v.length < 2) { setPeople([]); return; }
    const h = setTimeout(() => {
      void fetch(`/api/community/search?q=${encodeURIComponent(v)}`, { credentials: "same-origin" }).then((r) => r.json())
        .then((d: { talents?: (Person & { mine?: boolean; country?: string | null })[] }) => setPeople((d.talents ?? []).filter((p) => !p.mine).slice(0, 8))).catch(() => setPeople([]));
    }, 250);
    return () => clearTimeout(h);
  }, [compose, val]);

  const go = async (fn: () => Promise<{ id: string }>) => {
    setErr(""); setNeedPro(false);
    try { const d = await fn(); setCompose(null); setVal(""); setActive(d.id); void loadList(); }
    catch (e) { setErr(errorText(t, codeOf(e))); setNeedPro(codeOf(e) === "pro_required"); }
  };
  const submit = () => {
    const v = val.trim(); if (!v) return;
    void go(() => compose === "join" ? call<{ id: string }>("join", { method: "POST", json: { code: v } })
      : compose === "group" ? call<{ id: string }>("groups", { method: "POST", json: { name: v, audience: aud } })
      : call<{ id: string }>("threads", { method: "POST", json: { username: v.replace(/^@/, "") } }));
  };
  const setPref = (p: Partial<{ readReceipts: boolean; activeStatus: boolean }>) => { setPrefs((o) => (o ? { ...o, ...p } : o)); void call("prefs", { method: "POST", json: p }).catch(() => undefined); };
  const waiting = (c: Row) => !!c.last && !c.last.mine && c.last.kind !== "system" && !c.request?.incoming && !!c.at && Date.now() - new Date(c.at).getTime() > 86_400_000;
  const shown = rows ? (box === "unread" ? rows.filter((r) => r.unread > 0) : box === "unanswered" ? rows.filter(waiting) : rows) : null;
  const activeNow = (rows ?? []).filter((c) => c.kind === "direct" && c.active && c.with).slice(0, 12);
  const sub = (c: Row) => {
    const l = c.last; const when = ago(c.at, locale);
    if (c.request?.incoming) return fill(t.requestIncoming, c.title);
    if (!l) return c.kind === "circle" ? t.circleHint : "";
    if (l.kind === "system") return `${systemLine(t, l.system)} · ${when}`;
    if (l.mine && c.kind === "direct" && !l.gone) return `${c.seen ? t.seenShort : t.sentShort} · ${when}`;
    const who = l.mine ? `${t.you}: ` : c.kind !== "direct" && l.name ? `${l.name}: ` : "";
    const what = l.gone ? t.deleted : l.viewOnce ? (l.kind === "video" ? t.viewOnceVideo : t.viewOncePhoto) : l.kind === "image" ? t.photoMsg : l.kind === "voice" ? t.voiceMsg
      : l.kind === "video" ? t.videoMsg : l.kind === "share" ? t.sharedMsg : l.text ?? "";
    return `${who}${what} · ${when}`;
  };

  if (state === "out") return <div className="mx-auto max-w-2xl px-5 py-16 text-center"><h1 className="font-display text-3xl">{t.title}</h1><p className="mt-4 text-muted">{err || t.signIn}</p></div>;

  return (
    <div className="mx-auto grid max-w-6xl md:grid-cols-[380px_1fr] md:gap-4 md:px-4 md:py-6">
      <aside className={`${active ? "hidden md:block" : ""} min-w-0 pb-28 md:pb-0`}>
        <header className="flex items-center gap-1 px-3 pt-3">
          <h1 className="flex min-w-0 flex-1 items-center gap-1.5 px-1 text-xl font-bold"><span className="truncate">{me ? me.username : t.title}</span><Tick badge={me?.badge} /></h1>
          <button className={iconBtn} aria-label={t.settings} onClick={() => setSettings(true)}><Ico n="gear" /></button>
          <button className={iconBtn} aria-label={t.compose} onClick={() => { setCompose("new"); setVal(""); setErr(""); }}><Ico n="pen" /></button>
        </header>
        <div className="space-y-3 px-4 pt-2">
          <label className="flex h-10 items-center gap-2 rounded-xl bg-[rgb(var(--surface))] px-3 text-muted">
            <Ico n="search" size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPh} aria-label={t.searchPh} className="min-w-0 flex-1 bg-transparent text-[rgb(var(--ink))] outline-none" />
          </label>
          {!hits ? (
            <div role="tablist" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              {([["inbox", t.primary, 0], ["requests", t.requests, unread.requests], ["unread", t.unreadOnly, unread.inbox], ["unanswered", t.unanswered, 0]] as const).map(([b, label, n]) => (
                <button key={b} role="tab" aria-selected={box === b} className={soft(box === b)} onClick={() => { if ((b === "requests") !== (box === "requests")) setRows(null); setBox(b); }}>
                  {label}{n ? <span className="min-w-[18px] rounded-full bg-[rgb(214,48,60)] px-1.5 text-center text-[11px] font-bold leading-[18px] text-white">{n}</span> : null}
                </button>
              ))}
            </div>
          ) : null}
          {!hits && box === "inbox" && activeNow.length ? (
            <div aria-label={t.activeRow} className="-mx-4 flex gap-3.5 overflow-x-auto px-4">
              {activeNow.map((c) => (
                <button key={c.id} onClick={() => setActive(c.id)} className="flex w-16 shrink-0 flex-col items-center gap-1" aria-label={`${c.title}, ${t.activeNow}`}>
                  <Avatar name={c.title} src={c.with?.avatar ?? null} size={56} active />
                  <span className="w-full truncate text-center text-xs">{c.title}</span>
                </button>
              ))}
            </div>
          ) : null}
          {err && !compose ? <p role="alert" className="text-sm font-semibold text-red-500">{err}</p> : null}
          {box === "requests" && !hits ? <p className="text-sm text-muted">{t.requestsHint}</p> : null}
        </div>
        <ul className="mt-2">
          {hits ? (hits.length ? hits.map((h, i) => (
            <li key={`${h.threadId}-${i}`}><button className="w-full px-4 py-2.5 text-start hover:bg-[rgb(var(--surface))]" onClick={() => setActive(h.threadId)}>
              <span className="block font-semibold">{h.title}</span>{h.snippet ? <span className="block truncate text-sm text-muted">{h.snippet}</span> : null}</button></li>
          )) : <li className="p-4 text-center text-muted">{t.noResults}</li>)
            : shown && !shown.length ? (box === "inbox" ? (
              <li className="flex flex-col items-center gap-3 px-8 pt-6 text-center">
                <GardenArt />
                <p className="text-muted">{t.emptyLine}</p>
                <button className={gold} onClick={() => setCompose("new")}><Ico n="pen" size={16} />{t.startChat}</button>
              </li>
            ) : <li className="p-4 text-center text-muted">{box === "requests" ? t.emptyRequests : t.noResults}</li>)
            : (shown ?? []).map((c) => (
              <li key={c.id}>
                <button onClick={() => setActive(c.id)} aria-label={`${c.title}${c.unread ? `, ${c.unread}` : ""}, ${sub(c)}`}
                  className={`flex min-h-[76px] w-full items-center gap-3 px-4 py-2 text-start hover:bg-[rgb(var(--surface))] ${active === c.id ? "bg-[rgb(var(--surface))]" : ""}`}>
                  <Avatar name={c.title} src={c.kind === "direct" ? c.with?.avatar ?? null : c.photo} ring={!!c.pro} active={!!c.active} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5"><span className={`truncate ${c.unread ? "font-bold" : "font-semibold"}`}>{c.title}</span><Tick badge={c.with?.badge} /></span>
                    <span className={`block truncate text-sm ${c.unread ? "font-semibold" : "text-muted"}`}>{sub(c)}</span>
                  </span>
                  {c.unread ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[rgb(var(--gold))]" /> : null}
                </button>
              </li>
            ))}
        </ul>
      </aside>
      <section className={`${active ? "flex" : "hidden md:flex"} min-h-[100dvh] min-w-0 flex-col md:min-h-[75vh] md:rounded-3xl md:ring-1 md:ring-[rgb(var(--line))]`}>
        {active ? <ChatPane key={active} id={active} t={t} locale={locale} onBack={() => { setActive(null); void loadList(); }} />
          : <div className="m-auto flex flex-col items-center gap-3 p-8 text-center"><GardenArt /><p className="text-muted">{t.emptyLine}</p></div>}
      </section>

      {compose ? (
        <Sheet title={t.compose} onClose={() => setCompose(null)}>
          <div className="flex gap-2">
            {(["new", "group", "join"] as const).map((v) => <button key={v} className={`${soft(compose === v)} flex-1 justify-center`} onClick={() => { setCompose(v); setVal(""); setErr(""); }}>{v === "new" ? t.newChat : v === "group" ? t.newGroup : t.join}</button>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-2">
            <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} maxLength={compose === "group" ? 60 : 200} className={field}
              placeholder={compose === "join" ? t.joinPh : compose === "group" ? t.groupName : t.newChatHint} aria-label={compose === "join" ? t.joinPh : compose === "group" ? t.groupName : t.newChatHint} />
            {compose === "group" ? (
              <>
                <select value={aud} onChange={(e) => setAud(e.target.value)} aria-label={t.audience} className={field}>
                  <option value="all">{t.aud_all}</option><option value="sisters">{t.aud_sisters}</option><option value="brothers">{t.aud_brothers}</option>
                </select>
                <p className="text-xs text-muted">{t.audienceHint}</p>
              </>
            ) : null}
            {compose === "new" && people.length ? (
              <ul className="overflow-hidden rounded-xl ring-1 ring-[rgb(var(--line))]">
                {people.map((p) => (
                  <li key={p.username}><button type="button" onClick={() => void go(() => call<{ id: string }>("threads", { method: "POST", json: { username: p.username } }))}
                    className="flex w-full items-center gap-3 p-2.5 text-start hover:bg-[rgb(var(--surface))]">
                    <Avatar name={p.name} src={p.avatar} size={36} />
                    <span className="min-w-0 flex-1"><span className="flex items-center gap-1.5 font-semibold"><span className="truncate">{p.name}</span><Tick badge={p.badge ?? (p.verified ? "gold" : null)} />
                      {p.country ? <span className="rounded border border-[rgb(var(--line))] px-1 text-[10px] text-muted">{p.country}</span> : null}</span>
                      <span className="block truncate text-sm text-muted">@{p.username}</span></span>
                  </button></li>
                ))}
              </ul>
            ) : null}
            {err ? <p role="alert" className={`text-sm font-semibold ${needPro ? "" : "text-red-500"}`}>{err}</p> : null}
            {needPro ? <a href={`/${locale}/premium`} className={`${gold} w-full`}>{t.proCta}</a> : null}
            <button type="submit" className={`${btn} w-full`} disabled={!val.trim()}>{compose === "join" ? t.join : compose === "group" ? t.create : t.open}</button>
          </form>
        </Sheet>
      ) : null}
      {settings ? (
        <Sheet title={t.settings} onClose={() => setSettings(false)}>
          {prefs ? ([["readReceipts", t.readReceipts, t.readReceiptsHint], ["activeStatus", t.activeStatus, t.activeStatusHint]] as const).map(([k, title, hint]) => (
            <label key={k} className="flex items-start gap-3 text-sm">
              <span className="flex-1"><span className="block font-semibold">{title}</span><span className="block text-muted">{hint}</span></span>
              <input type="checkbox" role="switch" className="mt-1 h-5 w-5 accent-[rgb(var(--accent))]" checked={prefs[k]} onChange={(e) => setPref({ [k]: e.target.checked })} />
            </label>
          )) : null}
          <p className="text-xs leading-relaxed text-muted">{t.privacy}</p>
        </Sheet>
      ) : null}
    </div>
  );
}

function ChatPane({ id, t, locale, onBack }: { id: string; t: T; locale: string; onBack: () => void }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [more, setMore] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [reply, setReply] = useState<Msg | null>(null);
  const [editing, setEditing] = useState<Msg | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [attach, setAttach] = useState(false);
  const [report, setReport] = useState<{ messageId: string | null } | null>(null);
  const [cat, setCat] = useState<string>("other");
  const [reason, setReason] = useState("");
  const [done, setDone] = useState("");
  const [full, setFull] = useState<{ src: string; video: boolean; revoke?: boolean } | null>(null);
  const [rec, setRec] = useState<{ r: MediaRecorder; started: number } | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [addName, setAddName] = useState("");
  const [invite, setInvite] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastTyping = useRef(0);
  const lastTap = useRef<{ id: string; at: number }>({ id: "", at: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const pickKind = useRef<{ video: boolean; once: boolean }>({ video: false, once: false });
  const groupPhoto = useRef<HTMLInputElement>(null);

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
  const send = () => run(async () => {
    const body = text.trim();
    if (editing) {
      const d = await call<{ message: Msg | null }>(`messages/${editing.id}`, { method: "PATCH", json: { text: body } });
      if (d.message) setMsgs((o) => o.map((x) => (x.id === d.message!.id ? d.message! : x)));
      setEditing(null); setText(""); return;
    }
    if (!body) return;
    const d = await call<{ message: Msg | null }>(`threads/${id}/messages`, { method: "POST", json: { text: body, replyTo: reply?.id ?? null } }); setText(""); added(d.message);
  });
  const upload = (kind: "image" | "voice" | "video", blob: Blob, name: string, extra: Record<string, string> = {}) => run(async () => {
    const f = new FormData();
    f.append("kind", kind); f.append("file", blob, name);
    for (const [k, v] of Object.entries(extra)) f.append(k, v);
    if (reply) f.append("replyTo", reply.id);
    added((await call<{ message: Msg | null }>(`threads/${id}/messages`, { method: "POST", body: f })).message);
  });
  const pick = async (file: File | undefined) => {
    if (!file) return;
    const { video, once } = pickKind.current;
    const extra: Record<string, string> = once ? { viewOnce: "1" } : {};
    try {
      if (video) await upload("video", file, file.name || "video.mp4", extra);
      else await upload("image", await reencode(file), "photo.jpg", extra);
    } catch { setErr(t.e_media); }
  };
  const choose = (video: boolean, once: boolean) => {
    pickKind.current = { video, once }; setAttach(false);
    if (fileRef.current) { fileRef.current.accept = video ? "video/mp4,video/quicktime" : "image/jpeg,image/png,image/webp,image/heic"; fileRef.current.click(); }
  };
  const openOnce = (m: Msg) => run(async () => {
    const r = await fetch(`/api/messenger/messages/${m.id}/open`, { method: "POST", credentials: "same-origin" });
    if (!r.ok) throw new ApiErr(((await r.json().catch(() => ({}))) as { error?: string }).error ?? "generic");
    const blob = await r.blob();
    setMsgs((o) => o.map((x) => (x.id === m.id ? { ...x, viewOnce: { opened: true, canOpen: false } } : x)));
    setFull({ src: URL.createObjectURL(blob), video: blob.type.startsWith("video/"), revoke: true });
  });
  const closeFull = () => { if (full?.revoke) URL.revokeObjectURL(full.src); setFull(null); };
  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      const started = Date.now();
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((x) => x.stop());
        const ms = Date.now() - started;
        if ((r as MediaRecorder & { cancel?: boolean }).cancel || ms < 700) return;
        void upload("voice", new Blob(chunks, { type: r.mimeType }), "voice.webm", { durationMs: String(Math.min(ms, 120000)) });
      };
      r.start(); setRec({ r, started });
      setTimeout(() => { if (r.state === "recording") { r.stop(); setRec(null); } }, 120000);
    } catch { setErr(t.micDenied); }
  };
  const stopRec = (sendIt: boolean) => { if (!rec) return; (rec.r as MediaRecorder & { cancel?: boolean }).cancel = !sendIt; rec.r.stop(); setRec(null); };
  const react = (m: Msg, r: Reaction) => run(async () => { const next = m.myReaction === r ? null : r; setMenu(null); await call(`messages/${m.id}/react`, { method: "POST", json: { kind: next } }); await load(); });
  const unsend = (m: Msg) => {
    setMenu(null);
    if (!window.confirm(t.deleteConfirm)) return;
    void run(async () => { await call(`messages/${m.id}`, { method: "DELETE" }); setMsgs((o) => o.map((x) => (x.id === m.id ? { ...x, deleted: true, text: null, media: null, card: null, viewOnce: null } : x))); });
  };
  const hide = (m: Msg) => {
    setMenu(null);
    if (!window.confirm(t.deleteForMeConfirm)) return;
    void run(async () => { await call(`messages/${m.id}/hide`, { method: "POST", json: {} }); setMsgs((o) => o.filter((x) => x.id !== m.id)); });
  };
  const sendReport = () => run(async () => { await call(`threads/${id}/report`, { method: "POST", json: { category: cat, reason, messageId: report?.messageId ?? null } }); setReport(null); setReason(""); setDone(t.reported); });
  const block = () => info?.with && window.confirm(t.confirmBlock) && void run(async () => { const r = await fetch(`/api/community/block/${info.with!.username}`, { method: "POST" }); if (!r.ok) throw new ApiErr("generic"); onBack(); });
  const setGroupPhoto = (file: File | undefined) => {
    if (file) void run(async () => { const f = new FormData(); f.append("file", await reencode(file, 800), "group.jpg"); await call(`threads/${id}/photo`, { method: "POST", body: f }); await load(); });
  };
  const time = (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const lastMine = [...msgs].reverse().find((m) => m.mine && m.kind !== "system");
  const seen = !info || !lastMine ? "" : info.kind === "direct" ? (info.readUpTo !== null && Number(lastMine.id) <= info.readUpTo ? t.seen : t.sent)
    : ((n) => (n ? fill(t.seenBy, n) : t.sent))((info.readers ?? []).filter((r) => r >= Number(lastMine.id)).length);
  const incoming = info?.request?.incoming && info.request.status === "pending";
  const label = (m: { kind: string; text: string | null }) => m.kind === "image" ? t.photoMsg : m.kind === "voice" ? t.voiceMsg : m.kind === "video" ? t.videoMsg : m.kind === "share" ? t.sharedMsg : m.text ?? "";
  const item = "block w-full rounded-lg p-2 text-start hover:bg-[rgb(var(--surface))]";

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[rgb(var(--line))] bg-[rgb(var(--bg))] p-3">
        <button onClick={onBack} className={`${iconBtn} md:hidden`} aria-label={t.cancel}><Ico n="back" /></button>
        {info ? (
          info.kind === "direct" && info.with ? (
            <a href={`/${locale}/talents/${info.with.username}`} className="flex min-w-0 flex-1 items-center gap-3" aria-label={`${info.with.name}, @${info.with.username}. ${t.viewProfile}`}>
              <Avatar name={info.title} src={info.with.avatar} size={44} active={!!info.active} />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-bold"><span className="truncate">{info.with.name}</span><Tick badge={info.with.badge} />
                  {info.card?.country ? <span className="rounded border border-[rgb(var(--line))] px-1 text-[10px] font-semibold text-muted">{info.card.country}</span> : null}</span>
                <span className="block truncate text-xs text-muted">@{info.with.username}{info.card?.mutual ? ` · ${fill(t.mutual, info.card.mutual)}` : ""}{info.active ? ` · ${t.activeNow}` : ""}</span>
              </span>
            </a>
          ) : (
            <button className="flex min-w-0 flex-1 items-center gap-3 text-start" onClick={() => setShowInfo((v) => !v)} aria-expanded={showInfo}>
              <Avatar name={info.title} src={info.photo} size={44} />
              <span className="min-w-0"><span className="block truncate font-bold">{info.title}</span>
                <span className="block truncate text-xs text-muted">{info.kind === "circle" ? t.circleChat : fill(t.members, info.memberCount)}</span></span>
            </button>
          )
        ) : <span className="flex-1" />}
        <button className={btn} onClick={() => setReport({ messageId: null })}>{info?.kind === "direct" ? t.reportChat : t.reportGroup}</button>
        {info?.kind === "direct" ? <button className={btn} onClick={block}>{t.block}</button> : null}
      </header>
      {showInfo && info ? (
        <div className="space-y-3 border-b border-[rgb(var(--line))] p-3 text-sm">
          {info.kind === "circle" ? <p className="text-muted">{t.circleHint}</p> : null}
          {info.canManage ? (
            <>
              <input ref={groupPhoto} type="file" accept="image/jpeg,image/png,image/webp,image/heic" hidden onChange={(e) => { setGroupPhoto(e.target.files?.[0]); e.target.value = ""; }} />
              <button className={btn} onClick={() => groupPhoto.current?.click()} disabled={busy}>{t.changePhoto}</button>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void run(async () => { await call(`threads/${id}/members`, { method: "POST", json: { username: addName.trim().replace(/^@/, "") } }); setAddName(""); await load(); }); }}>
                <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder={t.addHint} aria-label={t.addMember} className={`${field} flex-1`} />
                <button className={btn} disabled={!addName.trim() || busy}>{t.add}</button>
              </form>
              <div className="flex flex-wrap items-center gap-2">
                <button className={btn} onClick={() => void run(async () => setInvite((await call<{ code: string }>(`threads/${id}/invite`, { method: "POST", json: { action: "reset" } })).code))}>{t.inviteCreate}</button>
                {info.invite || invite ? <button className={btn} onClick={() => void run(async () => { await call(`threads/${id}/invite`, { method: "POST", json: { action: "off" } }); setInvite(null); })}>{t.inviteOff}</button> : null}
                {invite ? <code className="select-all break-all text-gold">{`${window.location.origin}/${locale}/messages?join=${invite}`}</code> : null}
                <p className="w-full text-xs text-muted">{t.inviteHint}</p>
              </div>
            </>
          ) : null}
          <ul className="max-h-60 divide-y divide-[rgb(var(--line))] overflow-auto rounded-xl ring-1 ring-[rgb(var(--line))]">
            {info.members.map((m) => (
              <li key={m.username} className="flex items-center gap-2 p-2">
                <Avatar name={m.name} src={m.avatar} size={30} />
                <span className="flex-1 truncate">{m.name} <span className="text-muted">@{m.username}</span>{m.role === "admin" ? <span className="ms-2 text-xs text-gold">{t.admin}</span> : null}{m.muted ? <span className="ms-2 text-xs text-red-500">{t.mutedTag}</span> : null}</span>
                {info.canManage && !m.me ? (
                  <select aria-label={m.name} className="rounded bg-transparent text-xs ring-1 ring-[rgb(var(--line))]" value="" onChange={(e) => { const a = e.target.value; if (a) void run(async () => { await call(`threads/${id}/members`, { method: "PATCH", json: { username: m.username, action: a } }); await load(); }); }}>
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
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {more ? <button className="mx-auto block text-sm font-semibold text-gold" onClick={() => void run(async () => { const d = await call<{ messages: Msg[]; more: string | null }>(`threads/${id}?before=${more}`); setMsgs((o) => [...d.messages, ...o]); setMore(d.more); })}>{t.loadOlder}</button> : null}
        {msgs.map((m) => m.kind === "system" ? <p key={m.id} className="text-center text-xs text-muted">{systemLine(t, m.system)}</p> : (
          <div key={m.id} className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
            {info && info.kind !== "direct" && !m.mine && m.sender ? <span className="mx-2 text-xs font-semibold text-gold">{m.sender.name}</span> : null}
            <div className={`group relative max-w-[80%] rounded-2xl px-3 py-2 ${m.mine ? "bg-[rgb(8,58,44)] text-white" : "bg-[rgb(var(--surface))] ring-1 ring-[rgb(var(--line))]"}`}
              onClick={() => { const now = Date.now(); if (lastTap.current.id === m.id && now - lastTap.current.at < 320 && !m.deleted && !m.removed && m.myReaction !== "mashallah") void react(m, "mashallah"); lastTap.current = { id: m.id, at: now }; }}>
              {m.reply ? <div className="mb-1 border-s-2 border-[rgb(var(--gold))] ps-2 text-xs opacity-80"><b>{m.reply.name || t.you}</b><br />{m.reply.gone ? t.deleted : label(m.reply)}</div> : null}
              {m.deleted || m.removed ? <i className="opacity-70">{m.deleted ? t.deleted : t.removed}</i> : m.viewOnce ? (
                <button disabled={!m.viewOnce.canOpen} onClick={(e) => { e.stopPropagation(); void openOnce(m); }} className="flex items-center gap-2 text-start">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[rgb(var(--gold))] text-gold ${m.viewOnce.opened ? "border-dashed" : ""}`}><Ico n="eye" size={15} /></span>
                  <span><span className="block font-semibold">{m.kind === "video" ? t.viewOnceVideo : t.viewOncePhoto}</span><span className="block text-xs opacity-70">{m.viewOnce.opened ? t.opened : m.viewOnce.canOpen ? t.tapToView : ""}</span></span>
                </button>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {m.kind === "image" && m.media ? <img src={m.media} alt={t.photoMsg} className="max-h-72 cursor-zoom-in rounded-xl" onClick={(e) => { e.stopPropagation(); setFull({ src: m.media!, video: false }); }} /> : null}
                  {m.kind === "video" && m.media ? <video controls preload="metadata" src={m.media} className="max-h-72 rounded-xl" aria-label={t.videoMsg} /> : null}
                  {m.kind === "voice" && m.media ? <audio controls preload="none" src={m.media} aria-label={t.voiceMsg} className="max-w-60" /> : null}
                  {m.kind === "share" && m.card ? (
                    <a href={`/${locale}${m.card.url}`} className={`block rounded-xl p-2.5 ring-1 ${m.mine ? "ring-[#E2C77F]/40" : "ring-[rgb(var(--line))]"}`}>
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-gold">{cardLabel(t, m.card.type)}</span>
                      <span className="block font-semibold">{m.card.title}</span>
                      {m.card.subtitle ? <span className="line-clamp-3 block text-sm opacity-75">{m.card.subtitle}</span> : null}
                    </a>
                  ) : null}
                  {m.text ? <p className="whitespace-pre-wrap break-words">{m.text}</p> : null}
                </>
              )}
              <span className="mt-0.5 block text-end text-[11px] opacity-60">{m.edited && !m.deleted ? `${t.edited} · ` : ""}{time(m.at)}</span>
              {!m.deleted && !m.removed ? (
                <button className="absolute -top-2 end-1 hidden rounded-full bg-black/40 px-2 text-xs text-white group-hover:block focus:block" aria-label={t.react} onClick={(e) => { e.stopPropagation(); setMenu(menu === m.id ? null : m.id); }}>…</button>
              ) : null}
              {menu === m.id ? (
                <div className="absolute end-0 top-6 z-10 w-52 space-y-1 rounded-2xl bg-[rgb(var(--bg))] p-2 text-sm text-[rgb(var(--ink))] shadow-xl ring-1 ring-[rgb(var(--line))]" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-around">{REACTIONS.map((r) => <button key={r} aria-label={r === "mashallah" ? t.r_mashallah : r === "heart" ? t.r_heart : t.r_dua} aria-pressed={m.myReaction === r} className={`rounded-lg p-2 ${m.myReaction === r ? "bg-[rgb(var(--surface))]" : ""}`} onClick={() => void react(m, r)}><ReactionIcon r={r} size={22} /></button>)}</div>
                  {canSend ? <button className={item} onClick={() => { setReply(m); setEditing(null); setMenu(null); }}>{t.reply}</button> : null}
                  {m.editable ? <button className={item} onClick={() => { setEditing(m); setReply(null); setText(m.text ?? ""); setMenu(null); }}>{t.edit}</button> : null}
                  <button className={item} onClick={() => hide(m)}>{t.deleteForMe}</button>
                  {m.mine ? <button className={item} onClick={() => unsend(m)}>{t.delete}</button>
                    : <button className={item} onClick={() => { setReport({ messageId: m.id }); setMenu(null); }}>{t.reportMsg}</button>}
                </div>
              ) : null}
            </div>
            {Object.keys(m.reactions).some((k) => (m.reactions[k as Reaction] ?? 0) > 0) ? (
              <div className="mt-1 flex gap-1">{(Object.keys(m.reactions) as Reaction[]).filter((r) => (m.reactions[r] ?? 0) > 0).map((r) => (
                <button key={r} onClick={() => void react(m, r)} className={`flex items-center gap-1 rounded-full px-2 text-xs ring-1 ${m.myReaction === r ? "ring-[rgb(var(--gold))]" : "ring-[rgb(var(--line))]"}`}><ReactionIcon r={r} size={12} />{m.reactions[r]}</button>
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
        <div className="space-y-2 border-t border-[rgb(var(--line))] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="font-semibold">{fill(t.requestIncoming, info!.title)}</p>
          <p className="text-sm text-muted">{t.requestsHint}</p>
          <div className="flex gap-2">
            <button className={gold} onClick={() => void run(async () => { await call(`threads/${id}/request`, { method: "POST", json: { action: "accept" } }); await load(); })}>{t.accept}</button>
            <button className={btn} onClick={() => void run(async () => { await call(`threads/${id}/request`, { method: "POST", json: { action: "decline" } }); onBack(); })}>{t.decline}</button>
          </div>
        </div>
      ) : canSend ? (
        <div className="sticky bottom-0 bg-[rgb(var(--bg))] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {problem === "request_text_only" || (info?.request && !info.request.incoming) ? <p className="pb-2 text-xs text-muted">{t.requestWait}</p> : null}
          {reply || editing ? (
            <p className="flex items-center gap-2 pb-2 text-xs text-muted">
              <span className="flex-1 truncate">{editing ? t.editing : `${fill(t.replyingTo, reply!.mine ? t.you : reply!.sender?.name ?? "")}: ${label(reply!)}`}</span>
              <button onClick={() => { setReply(null); if (editing) { setEditing(null); setText(""); } }} aria-label={t.cancel}><Ico n="close" size={14} /></button>
            </p>
          ) : null}
          <input ref={fileRef} type="file" hidden onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
          <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="flex items-end gap-1.5 rounded-[28px] bg-[rgb(var(--surface))] p-1.5 ring-1 ring-[rgb(var(--line))]">
            {rec ? (
              <>
                <button type="button" className={iconBtn} aria-label={t.cancel} onClick={() => stopRec(false)}><Ico n="close" /></button>
                <span aria-live="polite" className="flex-1 self-center text-sm font-semibold">{t.recording}</span>
                <button type="button" className={`${iconBtn} bg-[rgb(var(--gold))] text-[rgb(40,30,8)]`} aria-label={t.stopSend} onClick={() => stopRec(true)}><Ico n="send" size={18} /></button>
              </>
            ) : (
              <>
                {problem !== "request_text_only" && !editing ? <button type="button" className={iconBtn} aria-label={`${t.photo}, ${t.video}`} onClick={() => setAttach(true)} disabled={busy}><Ico n="plus" /></button> : null}
                <textarea value={text} rows={1} maxLength={2000} placeholder={editing ? t.editing : t.write} aria-label={editing ? t.editing : t.write}
                  onChange={(e) => { setText(e.target.value); if (!editing && e.target.value && Date.now() - lastTyping.current > 3000) { lastTyping.current = Date.now(); void call(`threads/${id}/typing`, { method: "POST", json: {} }).catch(() => undefined); } }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                  className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 outline-none" />
                {text.trim() || editing ? <button type="submit" className={`${iconBtn} bg-[rgb(var(--gold))] text-[rgb(40,30,8)]`} aria-label={editing ? t.save : t.send} disabled={busy}><Ico n="send" size={18} /></button>
                  : problem !== "request_text_only" ? <button type="button" className={iconBtn} aria-label={t.voice} onClick={() => void startRec()} disabled={busy}><Ico n="mic" /></button> : null}
              </>
            )}
          </form>
        </div>
      ) : (
        <div className="space-y-2 border-t border-[rgb(var(--line))] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-sm text-muted">
          <p>{errorText(t, problem)}</p>
          {problem === "pro_required" ? <a href={`/${locale}/premium`} className={gold}>{t.proCta}</a> : null}
        </div>
      )}
      {attach ? (
        <Sheet title={`${t.photo}, ${t.video}`} onClose={() => setAttach(false)}>
          <button className={`${btn} w-full`} onClick={() => choose(false, false)}>{t.photo}</button>
          <button className={`${btn} w-full`} onClick={() => choose(true, false)}>{t.video}</button>
          {info?.canViewOnce ? (
            <>
              <button className={`${btn} w-full`} onClick={() => choose(false, true)}>{t.viewOncePhoto}</button>
              <button className={`${btn} w-full`} onClick={() => choose(true, true)}>{t.viewOnceVideo}</button>
              <p className="text-xs text-muted">{t.viewOnceHint}</p>
            </>
          ) : null}
        </Sheet>
      ) : null}
      {report ? (
        <Sheet title={report.messageId ? t.reportMsg : info?.kind === "direct" ? t.reportChat : t.reportGroup} onClose={() => setReport(null)}>
          <form onSubmit={(e) => { e.preventDefault(); void sendReport(); }} className="space-y-3">
            <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label={t.category} className={field}>{CATS.map((c) => <option key={c} value={c}>{t[`cat_${c}` as keyof T] as string}</option>)}</select>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder={t.reportReason} className={`${field} p-3`} />
            <button className={`${gold} w-full`} disabled={busy}>{t.sendReport}</button>
          </form>
        </Sheet>
      ) : null}
      {full ? (
        <div role="dialog" aria-modal className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={closeFull}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {full.video ? <video src={full.src} controls autoPlay className="max-h-full max-w-full" onClick={(e) => e.stopPropagation()} /> : <img src={full.src} alt={t.photoMsg} className="max-h-full max-w-full" />}
          <button className={`${iconBtn} absolute end-4 top-4 bg-white/15 text-white`} aria-label={t.close} onClick={closeFull}><Ico n="close" /></button>
        </div>
      ) : null}
    </>
  );
}
