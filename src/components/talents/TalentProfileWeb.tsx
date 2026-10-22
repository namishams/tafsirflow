"use client";
import FounderAbout from "@/components/FounderAbout";
import { ProMark } from "./ProMark";
import { OpenInAppPill } from "@/components/apppush/OpenInApp";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { BadgeIcon, type WebBadge } from "./BadgeIcon";
import { DefaultAvatar } from "./DefaultAvatar";
import MomentGrid, { type GridMoment } from "./MomentGrid";
import ProfileTabs from "./ProfileTabs";
import SijillShowcase from "./SijillShowcase";
import { tpText, type TpKey } from "@/lib/talentsProfileWeb";
import { talentsText } from "@/lib/talentsWeb";
import { sijillText } from "@/lib/sijillWeb";
import { countryName } from "@/lib/countries";
import type { Sijill } from "@/lib/sijill";
import { maybeSignedIn } from "@/lib/sync";
import CareerStatsWeb from "@/components/stats/CareerStatsWeb";
import ProfileStripWeb from "@/components/stats/ProfileStripWeb";
import CountryBadge from "@/components/rankings/CountryBadge";
import { careerText } from "@/lib/careerWeb";
import { GIRIH_TILE, PREMIUM, archRing } from "@/lib/badgeShape";
import { STARS } from "@/lib/usernameFilter";
import { starText } from "@/lib/starText";
import { starLinksText } from "@/lib/starLinksText";

// The talent profile on the website, 1:1 with the app (owner, 21.10.2026; mobile/src/features/talents/ProfileScreen.tsx):
// TikTok structure in emerald and gold. Top bar (own: name with a chevron menu, "+" to share with the QR code, the menu
// button to the account settings; others: back, name with badge, share and more with report and block), the centred
// round avatar, @username with the badge and level, the counters Following | Followers | MashaAllah (numbers bold above
// grey labels, thin separators, the MashaAllah label with a gold heart), the buttons (own: Edit profile, Share profile,
// people; others: Follow / Follow back / Requested / Following, Message or Connect, the arrow with suggested accounts),
// the bio, the follow requests row (own private account), suggestions, achievement highlights, the completeness card
// (own), then icon tabs Achievements (3-column grid edge to edge, a heart with the MashaAllah count on every tile) ·
// Sijill · Badges. Same endpoints as the app; the server renders the public data first (indexable), a signed-in
// visitor then gets the viewer-aware profile (/api/community/talents/<username>).

type Conn = "none" | "outgoing" | "incoming" | "connected";
export type WebProfile = {
  username: string; name: string; avatar: string | null; badge: WebBadge | null; level: string; private: boolean;
  following: number; followers: number; mashaallahTotal?: number; bio: string; rewaya: string; country: string | null; maqam: string;
  officialChannel: string | null; ijazahChain?: string; progress?: { treeStage: number; certJuz: number[]; hidden?: boolean } | null;
  mine?: boolean; followed?: boolean; requested?: boolean; followsMe?: boolean; canMessage?: boolean; restricted?: boolean; blocked?: boolean; connection?: Conn;
  /** the one founder account (server flag) */
  founder?: boolean;
  /** PRO mark: an active Pro subscription (server) */
  pro?: boolean;
  followedBy?: { total: number; users: { username: string; name: string; avatar: string | null }[] } | null;
  shareUrl?: string; shareQr?: string[]; moments?: GridMoment[]; momentCount?: number;
  /** learning goals, city, travel the viewer may see (profileExtras.ts) */
  extras?: { goals?: string[]; city?: string; travel?: { on: boolean; city: string } };
};
type Card = { username: string; name: string; avatar?: string | null; badge?: WebBadge | null; followed?: boolean; followsMe?: boolean; requested?: boolean; private?: boolean };
type Tx = Record<string, string>;
const fill = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((a, [k, x]) => a.split(`{${k}}`).join(String(x)), s);

async function call<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const r = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  return { ok: r.ok, status: r.status, data: (await r.json().catch(() => ({}))) as T & { error?: string } };
}

const HL_ORDER = ["certificate", "juz", "tree", "exam", "level", "hifz", "streak", "course", "sticker"] as const;
const I = {
  plusSquare: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><path d="M12 8.2v7.6M8.2 12h7.6" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chevronDown: <path d="M5 9l7 7 7-7" />,
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  share: <><path d="M12 15V4M8 8l4-4 4 4" /><path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></>,
  userPlus: <><circle cx="9.5" cy="8.5" r="3.6" /><path d="M3 19.5c.7-3.3 3.3-5 6.5-5s5.8 1.7 6.5 5" /><path d="M18.5 7.5v6M15.5 10.5h6" /></>,
  gridTab: <><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" /></>,
  record: <><path d="M6.5 3.5h8l4 4v13h-12z" /><path d="M14.5 3.5v4h4" /><path d="M9.5 12h6M9.5 15.5h6M9.5 8.5h2.5" /></>,
  rosette: <><circle cx="12" cy="9.5" r="5.5" /><path d="M8.6 13.8 7.6 20.5l4.4-2.4 4.4 2.4-1-6.7" /><path d="M9.7 9.6l1.6 1.6 3-3.2" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  heart: <path d="M12 20s-7-4.3-7-10a4.2 4.2 0 0 1 7-3 4.2 4.2 0 0 1 7 3c0 5.7-7 10-7 10z" />,
  shield: <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2.2 2.2L15.5 10" /></>,
  star: <path d="M12 1.5l2.6 4.2 4.8-1.1-1.1 4.8 4.2 2.6-4.2 2.6 1.1 4.8-4.8-1.1L12 22.5l-2.6-4.2-4.8 1.1 1.1-4.8L1.5 12l4.2-2.6-1.1-4.8 4.8 1.1z" />,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></>,
  trophy: <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" />,
  book: <><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z" /><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></>,
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" /></>,
  flame: <path d="M12 22c4 0 7-2.8 7-7 0-3.5-2.5-6-4-8-.3 2-1 3-2 3.5C13 8 12 5 9 2c0 4-3 6-3 11 0 5 2.7 9 6 9z" />,
  cap: <><path d="M3 9l9-4 9 4-9 4-9-4z" /><path d="M7 11.5V16c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5v-4.5" /></>,
  dots: <><circle cx="5.5" cy="12" r="1.1" fill="currentColor" /><circle cx="12" cy="12" r="1.1" fill="currentColor" /><circle cx="18.5" cy="12" r="1.1" fill="currentColor" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></>,
  map: <><path d="M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z" /><path d="M9 4.5v13M15 6.5v13" /></>,
  compass: <><circle cx="12" cy="12" r="8.5" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
  chart: <><path d="M4 20h16" /><path d="M6.5 16.5V11M11 16.5V6M15.5 16.5v-4M20 16.5V8.5" /></>,
};
export type WebIconName = keyof typeof I;
export function Ico({ n, size = 24, sw = 1.7, className = "" }: { n: WebIconName; size?: number; sw?: number; className?: string }) {
  return <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>{I[n]}</svg>;
}
const HL_ICON: Record<string, WebIconName> = { certificate: "star", exam: "check", level: "trophy", hifz: "trophy", juz: "book", tree: "sun", sticker: "grid", streak: "flame", course: "cap" };
const soft = "bg-[rgba(6,108,78,0.08)] dark:bg-white/10";

export function Avatar({ src, size, badge }: { src: string | null | undefined; size: number; badge?: WebBadge | null }) {
  const strong = badge === "gold" || badge === "official" || badge === "founder";
  return (
    <span className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-[rgb(8,58,44)]"
      style={{ width: size, height: size, boxShadow: `inset 0 0 0 ${Math.max(2, size * (strong ? 0.06 : 0.035))}px ${strong ? "#E2C77F" : "rgb(201,166,94)"}`, padding: Math.max(2, size * (strong ? 0.06 : 0.035)) }}>
      <span className="block h-full w-full overflow-hidden rounded-full">
        {src ? <img src={src} alt="" width={size} height={size} className="h-full w-full object-cover" /> /* eslint-disable-line @next/next/no-img-element */ : <DefaultAvatar />}
      </span>
    </span>
  );
}

/** follow button text and tone: Follow / Follow back (gold), Requested / Following (soft) */
export function followLabel(t: Record<TpKey, string>, c: { followed?: boolean; requested?: boolean; followsMe?: boolean }) {
  return c.followed ? t.followingBtn : c.requested ? t.requested : c.followsMe ? t.followBack : t.follow;
}

export default function TalentProfileWeb({ locale, initial, username, own, placeText, sijillPanel, fallback, appUrl }: {
  locale: string; initial: WebProfile | null; username: string | null; own: boolean;
  /** "#123 worldwide · #4 in Germany" (public page, server) */
  placeText?: string;
  /** the Sijill tab of the public page (server rendered); otherwise the record is loaded here */
  sijillPanel?: ReactNode;
  /** own page without a community profile (create form) */
  fallback?: ReactNode;
  appUrl: string;
}) {
  const t = tpText(locale);
  const tx = talentsText(locale) as Tx;
  const sx = sijillText(locale) as Tx;
  const [p, setP] = useState<WebProfile | null>(initial);
  const [state, setState] = useState<"load" | "ok" | "none" | "error">(initial ? "ok" : "load");
  const [viewer, setViewer] = useState<"load" | "out" | "in">("load");
  const [interact, setInteract] = useState(false);
  const [level, setLevel] = useState<{ level: number; stage: string } | null>(null);
  const [record, setRecord] = useState<Sijill | null>(null);
  const [requests, setRequests] = useState(0);
  const [suggest, setSuggest] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [menu, setMenu] = useState<null | "profile" | "more">(null);
  const [sharing, setSharing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const nf = useMemo(() => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }), [locale]);
  const mode: "own" | "other" = own || p?.mine ? "own" : "other";

  const load = useCallback(async () => {
    let u = username;
    // signed-out visitors see the server-rendered profile; the member calls below would only answer 401 (console errors)
    if (!(await maybeSignedIn())) { setViewer("out"); if (own) setState(initial ? "ok" : "none"); return; }
    if (own) {
      const m = await call<{ profile: { username: string } | null; talent?: { canInteract?: boolean } }>("/api/community/me").catch(() => null);
      if (!m || !m.ok) { setViewer("out"); setState(initial ? "ok" : m && (m.status === 401 || m.status === 403) ? "none" : "error"); return; }
      setInteract(!!m.data.talent?.canInteract);
      u = m.data.profile?.username ?? null;
      if (!u) { setViewer("in"); setState("none"); return; }
    }
    if (!u) return;
    const r = await call<{ profile: WebProfile }>(`/api/community/talents/${encodeURIComponent(u)}?locale=${locale}`).catch(() => null);
    if (r && (r.status === 401 || r.status === 403)) { setViewer("out"); return; }
    if (!r || !r.ok || !r.data.profile) { if (!initial) setState("error"); setViewer("out"); return; }
    setP(r.data.profile); setState("ok"); setViewer("in");
    if (!own) call<{ age?: unknown; interact?: boolean; community?: boolean }>("/api/community/age").then((a) => setInteract(!!a.data.interact)).catch(() => undefined);
    // level and stage from the Sijill (own record or what the member shows)
    call<{ sijill: { level?: { level: number; stage: string } } | null }>(r.data.profile.mine ? `/api/community/achievements?locale=${locale}` : `/api/community/talents/${encodeURIComponent(u)}/sijill?locale=${locale}`)
      .then((s) => { if (s.data.sijill?.level) setLevel(s.data.sijill.level); if (s.data.sijill) setRecord(s.data.sijill as unknown as Sijill); }).catch(() => undefined);
    if (r.data.profile.mine && r.data.profile.private) call<{ requests: Card[] }>("/api/community/follow-requests").then((x) => setRequests(x.data.requests?.length ?? 0)).catch(() => undefined);
  }, [username, own, locale, initial]);
  useEffect(() => { void load(); }, [load]);

  if (state === "none" && fallback) return <>{fallback}</>;
  if (state === "load" || !p) return <div className="mx-auto max-w-2xl px-5 py-16"><div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-line/50" /><div className="mx-auto mt-6 h-6 w-48 animate-pulse rounded bg-line/50" /></div>;

  const run = async (fn: () => Promise<void>) => { setBusy(true); setMsg(""); try { await fn(); } catch (e) { setMsg(t[`e_${(e as Error).message}` as TpKey] ?? t.e_generic); } finally { setBusy(false); } };
  const must = async <T,>(url: string, init?: RequestInit) => { const r = await call<T>(url, init); if (!r.ok) throw new Error(r.data.error ?? "generic"); return r.data; };
  // optimistic like the app: button and counter change at once, a failed call puts both back
  const follow = () => run(async () => {
    if (viewer === "out") { window.location.href = `/${locale}/account`; return; }
    const on = !(p.followed || p.requested);
    if (!on && p.followed && !window.confirm(`${t.unfollow} @${p.username}?`)) return;
    const prev = p;
    setP({ ...p, followed: on && !p.private, requested: on && p.private, followers: Math.max(0, p.followers + (on ? (p.private ? 0 : 1) : p.followed ? -1 : 0)) });
    try {
      const d = await must<{ followed: boolean; requested?: boolean; followers: number }>(`/api/community/follow/${p.username}`, { method: on ? "POST" : "DELETE" });
      setP((x) => (x ? { ...x, followed: d.followed, requested: !!d.requested, followers: d.followers } : x));
      if (d.followed || d.requested) setSuggest(true);
    } catch (e) { setP(prev); throw e; }
  });
  const connect = () => run(async () => {
    const c = p.connection ?? "none";
    if (c === "incoming") { await must(`/api/community/connections/${p.username}`, { method: "PATCH", body: JSON.stringify({ action: "accept" }) }); setP({ ...p, connection: "connected" }); return; }
    if (c === "none") { const d = await must<{ connection: Conn }>(`/api/community/connections/${p.username}`, { method: "POST", body: JSON.stringify({ note: "" }) }); setP({ ...p, connection: d.connection }); return; }
    if (c === "connected" && !window.confirm(t.removeConnection)) return;
    await must(`/api/community/connections/${p.username}`, { method: "DELETE" }); setP({ ...p, connection: "none", canMessage: false });
  });
  const block = () => run(async () => {
    if (p.blocked) { await must(`/api/community/block/${p.username}`, { method: "DELETE" }); setP({ ...p, blocked: false }); return; }
    if (!window.confirm(t.confirmBlock)) return;
    await must(`/api/community/block/${p.username}`, { method: "POST" });
    setP({ ...p, blocked: true, followed: false, connection: "none", canMessage: false });
  });
  const url = p.shareUrl ?? `${typeof window === "undefined" ? "" : window.location.origin}/${locale}/talents/${p.username}`;
  const share = async () => {
    if (p.shareQr?.length) { setSharing(true); return; }
    try { if (navigator.share) await navigator.share({ url, title: `${p.name} (@${p.username}) · Quran Masterclass Talents` }); else { await navigator.clipboard.writeText(url); setMsg(t.copied); } } catch { /* cancelled */ }
  };

  const premium: "founder" | "star" | null = p.founder ? "founder" : p.badge === "star" ? "star" : null;
  const starReciter = STARS.find((s) => s[0] === p.username)?.[1] ?? null;
  const facts = [p.rewaya, p.country ? countryName(p.country, locale) : "", level?.stage ? sx[`stage_${level.stage}`] ?? "" : ""].filter(Boolean).join(" · ");
  const ma = p.mashaallahTotal ?? 0;
  const lists = (k: "followers" | "following") => (!p.restricted ? `/talents/${p.username}/${k}` : undefined);
  const moments = p.moments ?? [];
  const groups = HL_ORDER.map((k) => ({ k, list: moments.filter((m) => m.kind === k) })).filter((g) => g.list.length);
  const canMessage = !!p.canMessage;
  const conn = p.connection ?? "none";
  const connLabel = { none: t.connect, outgoing: t.requested, incoming: t.accept, connected: t.connected }[conn];

  const btn = (label: string, onClick: (() => void) | string, gold = false, extra = "", hint?: string) => {
    const cls = `inline-flex h-[42px] min-w-0 flex-1 basis-0 items-center justify-center rounded-lg px-4 text-[15px] font-bold transition hover:opacity-85 disabled:opacity-55 ${gold ? "bg-[#c6a65e] text-[rgb(8,38,29)]" : `${soft} text-ink`} ${extra}`;
    return typeof onClick === "string"
      ? <Link href={onClick} title={hint} aria-label={hint ? `${label}. ${hint}` : undefined} className={`${cls} max-w-[170px]`}>{label}</Link>
      : <button type="button" onClick={onClick} disabled={busy} className={`${cls} max-w-[170px]`}>{label}</button>;
  };
  const square = (n: WebIconName, label: string, onClick: () => void, on?: boolean) => (
    <button type="button" onClick={onClick} aria-label={label} title={label} aria-expanded={on} className={`grid h-[42px] w-11 shrink-0 place-items-center rounded-lg ${soft} text-ink hover:opacity-85`}>
      <span className={`transition ${on && n === "chevronDown" ? "rotate-180" : ""}`}><Ico n={n} size={n === "chevronDown" ? 18 : 20} sw={n === "chevronDown" ? 2.4 : 1.9} /></span>
    </button>
  );
  const stat = (n: number, label: string, href?: string, heart = false) => {
    const inner = (
      <>
        <span className="block text-[18px] font-bold tabular-nums text-ink">{nf.format(n)}</span>
        <span className="flex items-center justify-center gap-1 text-[13px] font-medium text-muted">{heart ? <svg aria-hidden viewBox="0 0 24 24" className="h-[11px] w-[11px]" fill="#c6a65e"><path d={"M12 20s-7-4.3-7-10a4.2 4.2 0 0 1 7-3 4.2 4.2 0 0 1 7 3c0 5.7-7 10-7 10z"} /></svg> : null}{label}</span>
      </>
    );
    return href ? <Link href={href} className="min-w-[84px] px-3 py-1 text-center hover:opacity-70">{inner}</Link> : <a href={heart ? "#achievements" : undefined} className="min-w-[84px] px-3 py-1 text-center">{inner}</a>;
  };
  const sep = <span aria-hidden className="h-3.5 w-px bg-line" />;

  // completeness (own)
  const complete: [TpKey, boolean, string][] = [
    ["complete_photo", !!p.avatar, "/talents/me/edit"], ["complete_bio", !!p.bio?.trim(), "/talents/me/edit"], ["complete_country", !!p.country, "/talents/me/edit"],
    ["complete_rewaya", !!p.rewaya?.trim(), "/talents/me/edit"], ["complete_badge", !!p.badge, "/talents/me/edit#badges"],
    ["complete_sijill", (p.momentCount ?? moments.length) > 0, "/talents/me/edit#sijill"], ["complete_follow", p.following > 0, "/talents/discover"],
  ];
  const done = complete.filter((x) => x[1]).length;
  const next = complete.find((x) => !x[1]);
  const pct = Math.round((done / complete.length) * 100);

  return (
    <div className="mx-auto max-w-2xl bg-surface pb-16 sm:my-6 sm:rounded-xl sm:border sm:border-line">
      {/* top bar */}
      <div className="sticky top-0 z-20 flex h-[52px] items-center gap-1 bg-surface/95 px-2 backdrop-blur sm:rounded-t-xl">
        {mode === "own" ? (
          <>
            <div className="relative min-w-0">
              <button type="button" onClick={() => setMenu(menu === "profile" ? null : "profile")} aria-haspopup="menu" aria-expanded={menu === "profile"} aria-label={`${p.name}, ${t.profileMenu}`}
                className="flex min-h-11 min-w-0 items-center gap-1.5 px-2 hover:opacity-70">
                {p.private ? <Ico n="lock" size={17} sw={2} /> : null}
                <span className="truncate text-[22px] font-extrabold tracking-tight text-ink">{p.name}</span>
                <Ico n="chevronDown" size={15} sw={2.6} />
              </button>
              {menu === "profile" ? (
                <Menu onClose={() => setMenu(null)} items={[
                  { label: t.editProfile, href: "/talents/me/edit" },
                  { label: t.shareProfile, onClick: () => void share() },
                  { label: t.menuLabel, href: "/account" },
                  { label: careerText(locale).menuDetails, href: "/profile/details" },
                ]} />
              ) : null}
            </div>
            <span className="flex-1" />
            <button type="button" onClick={() => void share()} aria-label={t.shareQr} title={t.shareQr} className="grid h-11 w-11 place-items-center text-ink hover:opacity-70"><Ico n="plusSquare" size={26} sw={1.8} /></button>
            <Link href="/account" aria-label={t.menuLabel} title={t.menuLabel} className="grid h-11 w-11 place-items-center text-ink hover:opacity-70"><Ico n="menu" size={26} sw={1.8} /></Link>
          </>
        ) : (
          <>
            <button type="button" onClick={() => (history.length > 1 ? history.back() : (window.location.href = `/${locale}/talents`))} aria-label={t.close} className="grid h-11 w-11 place-items-center text-ink hover:opacity-70"><Ico n="chevronLeft" size={26} sw={2.2} className="rtl:-scale-x-100" /></button>
            <span className="flex min-w-0 flex-1 items-center justify-center gap-1.5"><span className="truncate text-[17px] font-bold text-ink">{p.name}</span>{p.badge ? <BadgeIcon badge={p.badge} size={15} title={tx[`badge_${p.badge}`]} /> : null}</span>
            <button type="button" onClick={() => void share()} aria-label={t.shareProfile} title={t.shareProfile} className="grid h-11 w-11 place-items-center text-ink hover:opacity-70"><Ico n="share" size={24} sw={1.8} /></button>
            <div className="relative">
              <button type="button" onClick={() => setMenu(menu === "more" ? null : "more")} aria-haspopup="menu" aria-expanded={menu === "more"} aria-label={t.moreOptions} className="grid h-11 w-11 place-items-center text-ink hover:opacity-70"><Ico n="dots" size={24} /></button>
              {menu === "more" ? (
                <Menu end onClose={() => setMenu(null)} items={[
                  { label: t.shareProfile, onClick: () => void share() },
                  ...(conn === "connected" ? [{ label: t.removeConnection, onClick: () => void connect() }] : []),
                  ...(viewer === "in" ? [{ label: t.reportProfile, danger: true, onClick: () => setReporting(true) }, { label: p.blocked ? t.unblock : t.block, danger: !p.blocked, onClick: () => void block() }] : [{ label: t.signIn, href: "/account" }]),
                ]} />
              ) : null}
            </div>
          </>
        )}
      </div>

      {/* header; founder and claimed reciters get the premium band and ornamental ring (owner 22.10.2026) */}
      <div className={`relative isolate flex flex-col items-center px-4 text-center ${premium ? "pt-7" : "pt-3"}`}>
        {premium ? <PremiumBand kind={premium} /> : null}
        <span className="relative">
          {premium ? <PremiumRing kind={premium} size={96} /> : null}
          <Avatar src={p.avatar} size={96} badge={premium ? null : p.badge} />
          {mode === "own" ? <Link href="/talents/me/edit" aria-label={t.editProfile} className="absolute bottom-0 end-0 grid h-7 w-7 place-items-center rounded-full border-[2.5px] border-surface bg-[#c6a65e] text-[rgb(8,38,29)]"><Ico n="plus" size={15} sw={2.8} /></Link> : null}
        </span>
        <h1 className="mt-3 flex items-center justify-center gap-1.5 text-[17px] font-bold text-ink">
          <span dir="ltr">@{p.username}</span>
          {p.badge ? <a href="#badges" aria-label={`${tx[`badge_${p.badge}`]}. ${tx.badgeWhat}`}><BadgeIcon badge={p.badge} size={17} title={tx[`badge_${p.badge}`]} /></a> : null}
          {p.pro ? <ProMark size={15} /> : null}
          {p.country ? <CountryBadge code={p.country} size={17} /> : null}
          {p.private && mode === "other" ? <span className="text-muted"><Ico n="lock" size={14} /></span> : null}
        </h1>
        {p.founder ? <p className="mt-1 text-[14px] font-semibold text-gold">{tx.founderLine}</p> : null}
        {p.founder ? <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[13px] text-muted"><CountryBadge code="AE" size={16} />{tx.founderPlace}</p> : null}
        {premium === "star" ? <p className="mt-1 text-[14px] font-semibold text-[#0E7A57] dark:text-[#7fd1ad]">{starText(locale).roleLine}{p.country ? ` · ${countryName(p.country, locale)}` : ""}</p> : null}
        {premium === "star" && starReciter ? (
          <Link href={`/reciters/${starReciter}`} className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#D9B970]/70 bg-[rgba(14,122,87,0.08)] px-4 py-1.5 text-[13.5px] font-bold text-ink">
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>{starLinksText(locale).reciterProfile}
          </Link>
        ) : null}
        <p className="sr-only">{p.name}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${p.level === "master" || p.level === "sheikh" ? "border border-[#c6a65e] bg-[rgba(201,166,94,0.14)] text-gold" : "bg-accent-soft text-accent"}`}>{tx[`level_${p.level}`] ?? p.level}</span>
          {level ? <span className="text-[13px] font-semibold text-muted">{fill(sx.levelN, { n: level.level })}</span> : null}
          {mode === "other" && p.followsMe ? <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold text-muted ${soft}`}>{t.followsYou}</span> : null}
        </div>

        <div className="mt-3.5 flex items-center justify-center">
          {stat(p.following, t.following, lists("following"))}
          {sep}
          {stat(p.followers, t.followers, lists("followers"))}
          {sep}
          {stat(ma, t.statMashaAllah, undefined, true)}
        </div>

        <div className="mt-4 flex w-full items-center justify-center gap-1.5">
          {mode === "own" ? (
            <>
              {btn(t.editProfile, "/talents/me/edit")}
              {btn(t.shareProfile, () => void share())}
              {square("userPlus", t.discoverPeople, () => setSuggest((x) => !x), suggest)}
            </>
          ) : p.blocked ? btn(t.unblock, () => void block()) : (
            <>
              {btn(viewer === "out" ? t.follow : followLabel(t, p), () => void follow(), !(p.followed || p.requested))}
              {/* like the app: signed out "Sign in"; a connection writes in the app (the chat lives there); 16+ may
                  connect; otherwise no second button */}
              {viewer === "out" ? btn(t.signInBtn, "/account")
                : canMessage ? btn(t.message, appUrl, false, "", tx.messageInApp)
                : interact && viewer === "in" ? btn(connLabel, () => void connect()) : null}
              {square("chevronDown", t.suggestedAccounts, () => setSuggest((x) => !x), suggest)}
            </>
          )}
          {/* small secondary pill, only on Android phones (iOS has its own system banner) */}
          {mode === "other" ? <OpenInAppPill appUrl={appUrl} label={tx.openApp} /> : null}
        </div>
        {mode === "other" && conn === "incoming" && !p.blocked ? (
          <button type="button" onClick={() => void run(async () => { await must(`/api/community/connections/${p.username}`, { method: "PATCH", body: JSON.stringify({ action: "decline" }) }); setP({ ...p, connection: "none" }); })}
            className="mt-2 min-h-10 text-[14px] font-semibold text-muted hover:underline">{t.decline}</button>
        ) : null}
        {mode === "other" && canMessage && !p.blocked ? <p className="mt-2 max-w-sm text-[12.5px] leading-snug text-muted">{tx.messageInApp}</p> : null}
        {msg ? <p role="status" className="mt-2 text-[14px] font-semibold text-muted">{msg}</p> : null}
        {p.blocked && mode === "other" ? <p className="mt-2 text-[14px] text-muted">{t.blockedInfo}</p> : null}

        {/* career card at the top of the profile (owner 22.10.2026) */}
        {p.username && !p.restricted && !p.blocked ? <ProfileStripWeb username={p.username} locale={locale} /> : null}

        {/* bio */}
        <div className="mt-3 grid justify-items-center gap-1">
          {facts ? <p className="text-[14px] font-semibold text-ink">{facts}</p> : null}
          {p.bio ? <p className="max-w-xl whitespace-pre-line text-[14.5px] leading-relaxed text-ink">{p.bio}</p> : null}
          {p.maqam ? <p className="text-[13px] text-muted">{`${tx.maqam}: ${p.maqam}`}</p> : null}
          {p.officialChannel ? <p className="text-[13px] text-gold">{fill(tx.officialChannel, { c: p.officialChannel })}</p> : null}
          {/* founder account: "About the founder" with the book and Mishary Alafasy (owner 22.10.2026) */}
          {p.founder ? <div className="w-full max-w-xl"><FounderAbout variant="compact" /></div> : null}
          {placeText ? <Link href="/ranking" className="mt-1 inline-flex rounded-full border border-[#c6a65e] bg-[rgba(214,180,108,0.12)] px-3 py-1.5 text-[13px] font-semibold text-gold hover:opacity-85">{placeText}</Link> : null}
          {/* goals as chips, the city and the travel badge */}
          {p.extras?.city || p.extras?.travel?.on ? (
            <span className="mt-1 flex flex-wrap items-center justify-center gap-2">
              {p.extras.city ? <span className="flex items-center gap-1 text-[13px] font-semibold text-muted"><Ico n="map" size={13} />{p.extras.city}</span> : null}
              {p.extras.travel?.on ? <TravelBadgeWeb city={p.extras.travel.city} t={t} /> : null}
            </span>
          ) : null}
          {p.extras?.goals?.length ? (
            <span className="mt-1 flex max-w-xl flex-wrap justify-center gap-1.5">
              {p.extras.goals.map((g) => t[`goal_${g}` as TpKey] ? <span key={g} className="rounded-full border border-[rgb(201,166,94)] bg-[rgba(201,166,94,0.08)] px-2.5 py-1 text-[12.5px] font-semibold text-ink">{t[`goal_${g}` as TpKey]}</span> : null)}
            </span>
          ) : null}
          {p.followedBy?.users.length && mode === "other" ? (
            <Link href={`/talents/${p.username}/followers`} className="mt-1 flex items-center gap-2 text-[13px] text-muted hover:underline">
              <span className="flex">{p.followedBy.users.slice(0, 3).map((u, i) => <span key={u.username} className={`rounded-full ring-[1.5px] ring-surface ${i ? "-ms-2" : ""}`}><Avatar src={u.avatar} size={22} /></span>)}</span>
              {p.followedBy.users[1] ? (p.followedBy.total - 2 > 0 ? fill(t.followedByMore, { a: p.followedBy.users[0].name, b: p.followedBy.users[1].name, n: p.followedBy.total - 2 }) : fill(t.followedBy2, { a: p.followedBy.users[0].name, b: p.followedBy.users[1].name })) : fill(t.followedBy1, { a: p.followedBy.users[0].name })}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {mode === "own" && p.private && requests > 0 ? (
          <Link href="/talents/requests" className="mx-4 flex min-h-14 items-center gap-3 rounded-[10px] bg-accent-soft px-3 hover:opacity-85">
            <span className="grid h-[38px] w-[38px] place-items-center rounded-full bg-surface text-ink"><Ico n="userPlus" size={21} /></span>
            <span className="min-w-0 flex-1"><span className="block text-[14.5px] font-bold text-ink">{t.requestsRow}</span><span className="block text-[12.5px] text-muted">{t.requestsHint}</span></span>
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#c6a65e] px-2 text-[12.5px] font-bold text-[rgb(8,38,29)]">{requests}</span>
            <Ico n="chevronRight" size={16} className="text-muted rtl:-scale-x-100" />
          </Link>
        ) : null}
        {suggest && !p.blocked ? <Suggested exclude={p.username} t={t} signedIn={viewer === "in"} /> : null}
        {!p.restricted && !p.blocked && (groups.length >= 2 || mode === "own") ? (
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-1">
            {mode === "own" ? (
              <Link href="/talents/me/edit#sijill" className="grid w-[72px] shrink-0 justify-items-center gap-1.5 text-center hover:opacity-75">
                <span className="grid h-[66px] w-[66px] place-items-center rounded-full border-[1.5px] border-line text-ink"><Ico n="plus" size={26} sw={1.8} /></span>
                <span className="text-[12px] font-semibold text-ink">{t.newHighlight}</span>
              </Link>
            ) : null}
            {groups.map(({ k, list }) => (
              <button key={k} type="button" onClick={() => window.dispatchEvent(new CustomEvent("qm-open-moments", { detail: list.map((m) => m.id) }))}
                aria-label={`${t[`hl_${k}` as TpKey]}, ${list.length}`} className="grid w-[72px] shrink-0 justify-items-center gap-1.5 text-center hover:opacity-75">
                <span className="relative grid h-[66px] w-[66px] place-items-center rounded-full border-[1.5px] border-[rgb(201,166,94)] p-[2.5px]">
                  <span className="grid h-full w-full place-items-center rounded-full bg-[rgb(8,38,29)] text-[#dcc48c]"><Ico n={HL_ICON[k]} size={24} /></span>
                  <span className="absolute -bottom-0.5 -end-1 grid h-[22px] min-w-[22px] place-items-center rounded-full border-2 border-surface bg-[#c6a65e] px-1 text-[11px] font-bold text-[rgb(8,38,29)]">{list.length}</span>
                </span>
                <span className="line-clamp-1 text-[12px] font-semibold text-ink">{t[`hl_${k}` as TpKey]}</span>
              </button>
            ))}
          </div>
        ) : null}
        {mode === "own" && next ? (
          <Link href={next[2]} className="mx-4 grid gap-2 rounded-[10px] border border-[rgb(201,166,94)] p-3.5 hover:opacity-90">
            <span className="flex items-center gap-2"><span className="flex-1 text-[14.5px] font-bold text-ink">{fill(t.completeTitle, { n: pct })}</span><span className="text-[13px] font-bold text-gold">{done}/{complete.length}</span></span>
            <span className="block h-1.5 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-[#c6a65e]" style={{ width: `${pct}%` }} /></span>
            <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-muted"><span className="flex-1">{`${t.completeNext}: ${t[next[0]]}`}</span><Ico n="chevronRight" size={16} className="rtl:-scale-x-100" /></span>
          </Link>
        ) : null}
      </div>

      {/* tabs */}
      <div className="mt-3">
        {p.restricted ? (
          <div className="grid justify-items-center gap-2 border-t border-line px-4 py-8 text-center">
            <Ico n="lock" size={26} className="text-muted" />
            <p className="text-[16px] font-bold text-ink">{t.privateTitle}</p>
            <p className="text-[14px] text-muted">{p.requested ? t.privateText : t.followToSee}</p>
          </div>
        ) : p.blocked ? null : (
          <ProfileTabs sticky tabs={[
            { id: "achievements", label: t.tabAchievements, icon: <Ico n="gridTab" size={23} />, flush: true, panel: <MomentGrid edge username={p.username} locale={locale} initial={moments} empty={mode === "own" ? t.noMomentsMine : t.noMoments} /> },
            { id: "sijill", label: sx.tabSijill, icon: <Ico n="record" size={23} />, panel: <div className="px-4">{sijillPanel ?? (record ? <SijillShowcase s={record} moments={[]} locale={locale} /> : <p className="text-muted">{mode === "own" ? sx.notSynced ?? "" : sx.hiddenAll}</p>)}</div> },
            { id: "badges", label: t.tabBadges, icon: <Ico n="rosette" size={23} />, panel: <div className="px-4"><BadgesPanel p={p} tx={tx} own={mode === "own"} /></div> },
            // owner 22.10.2026: the progress profile (career card, places, Shams, courses, exams, milestones, boards)
            { id: "stats", label: careerText(locale).tabStats, icon: <Ico n="chart" size={23} />, flush: true, panel: <CareerStatsWeb locale={locale} username={p.username} own={mode === "own"} /> },
          ]} />
        )}
      </div>

      {/* safety */}
      <div className="mx-4 mt-8 border-t border-line pt-3 text-[12.5px] text-muted">
        <p className="flex items-center gap-2"><Ico n="shield" size={15} />{t.safetyLine}</p>
        <p className="mt-1 flex flex-wrap gap-x-4"><Link href="/talents" className="min-h-11 py-3 font-semibold text-accent hover:underline">{t.guidelines}</Link>
          {mode === "other" && viewer === "in" ? <><button type="button" onClick={() => setReporting(true)} className="min-h-11 font-semibold text-[rgb(160,58,52)] hover:underline">{t.reportProfile}</button><button type="button" onClick={() => void block()} className="min-h-11 font-semibold text-[rgb(160,58,52)] hover:underline">{p.blocked ? t.unblock : t.block}</button></> : null}
        </p>
      </div>

      {sharing ? <ShareDialog p={p} url={url} t={t} onClose={() => setSharing(false)} /> : null}
      {reporting ? <ReportDialog username={p.username} t={t} onClose={() => setReporting(false)} /> : null}
    </div>
  );
}

export function TravelBadgeWeb({ city, t }: { city?: string; t: Record<TpKey, string> }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[rgb(201,166,94)] bg-[rgba(201,166,94,0.14)] px-2.5 py-0.5 text-[12px] font-semibold text-gold">
      <Ico n="compass" size={12} /><span className="truncate">{city ? fill(t.travellingTo, { c: city }) : t.travelling}</span>
    </span>
  );
}

function Menu({ items, onClose, end }: { items: { label: string; href?: string; onClick?: () => void; danger?: boolean }[]; onClose: () => void; end?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const out = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", out); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", out); document.removeEventListener("keydown", key); };
  }, [onClose]);
  return (
    <div ref={ref} role="menu" className={`absolute top-12 z-30 min-w-[220px] overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-xl ${end ? "end-0" : "start-0"}`}>
      {items.map((it) => it.href ? (
        <Link key={it.label} role="menuitem" href={it.href} onClick={onClose} className="block px-4 py-3 text-[15px] font-semibold text-ink hover:bg-bg">{it.label}</Link>
      ) : (
        <button key={it.label} role="menuitem" type="button" onClick={() => { onClose(); it.onClick?.(); }} className={`block w-full px-4 py-3 text-start text-[15px] font-semibold hover:bg-bg ${it.danger ? "text-[rgb(160,58,52)]" : "text-ink"}`}>{it.label}</button>
      ))}
    </div>
  );
}

function Suggested({ exclude, t, signedIn }: { exclude: string; t: Record<TpKey, string>; signedIn: boolean }) {
  const [list, setList] = useState<Card[] | null>(null);
  useEffect(() => {
    if (!signedIn) { setList([]); return; }
    call<{ talents: Card[] }>("/api/community/suggested").then((d) => setList((d.data.talents ?? []).filter((x) => x.username !== exclude))).catch(() => setList([]));
  }, [exclude, signedIn]);
  // optimistic, back on failure; followed and requested stay apart (a pending request to a private account reads
  // "Requested" and is withdrawn with a second click), like the app
  const follow = async (c: Card) => {
    const mark = (followed: boolean, requested: boolean) => setList((l) => l?.map((x) => (x.username === c.username ? { ...x, followed, requested } : x)) ?? null);
    const on = !c.followed && !c.requested;
    mark(on && !c.private, on && !!c.private);
    const r = await call<{ followed: boolean; requested?: boolean }>(`/api/community/follow/${c.username}`, { method: on ? "POST" : "DELETE" }).catch(() => null);
    if (r?.ok) mark(r.data.followed, !!r.data.requested && !r.data.followed); else mark(!!c.followed, !!c.requested);
  };
  return (
    <div className="grid gap-2">
      <div className="flex items-center px-4"><h2 className="flex-1 text-[15px] font-bold text-ink">{t.suggestedAccounts}</h2><Link href="/talents/discover" className="min-h-9 py-2 text-[14px] font-bold text-gold hover:underline">{t.seeAll}</Link></div>
      {list && !list.length ? (
        <Link href="/talents/discover" className="mx-4 flex min-h-12 items-center gap-2.5 text-[14px] font-semibold text-ink hover:underline"><Ico n="search" size={18} className="text-muted" /><span className="flex-1">{t.discoverTitle}</span><Ico n="chevronRight" size={16} className="text-muted rtl:-scale-x-100" /></Link>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto px-4 pb-1">
          {(list ?? []).map((c) => (
            <div key={c.username} className="grid w-[148px] shrink-0 justify-items-center gap-1.5 rounded-[10px] border border-line bg-surface p-3 text-center">
              <Link href={`/talents/${c.username}`} className="grid justify-items-center gap-1">
                <Avatar src={c.avatar} size={64} badge={c.badge} />
                <span className="flex max-w-[124px] items-center gap-1"><span className="truncate text-[13.5px] font-bold text-ink">{c.name}</span>{c.badge ? <BadgeIcon badge={c.badge} size={13} /> : null}</span>
                <span className="max-w-[124px] truncate text-[12px] text-muted" dir="ltr">@{c.username}</span>
              </Link>
              <button type="button" onClick={() => void follow(c)} aria-pressed={!!(c.followed || c.requested)} className={`h-[34px] w-full rounded-lg text-[13px] font-bold ${c.followed || c.requested ? `${soft} text-ink` : "bg-[#c6a65e] text-[rgb(8,38,29)]"}`}>{followLabel(t, c)}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BadgesPanel({ p, tx, own }: { p: WebProfile; tx: Tx; own: boolean }) {
  return (
    <div className="grid gap-4">
      {p.progress?.certJuz.length ? (
        <div><h3 className="font-bold">{tx.certificates}</h3><ul className="mt-2 flex flex-wrap gap-2">{p.progress.certJuz.map((j) => <li key={j} className="rounded-full border border-[#c6a65e]/50 px-3 py-1 text-[13px] font-semibold">{fill(tx.juzN, { n: j })}</li>)}</ul></div>
      ) : null}
      {p.progress && p.progress.treeStage > 0 ? <p className="text-[15px]">{fill(tx.treeStage, { n: p.progress.treeStage })}</p> : null}
      {p.ijazahChain ? <div><h3 className="font-bold">{tx.ijazahChain}</h3><p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed">{p.ijazahChain}</p><p className="mt-1 text-[13px] text-muted">{tx.unverifiedChain}</p></div> : null}
      <details className="rounded-lg border border-line bg-surface p-5" open={!!p.badge}>
        <summary className="cursor-pointer font-bold">{tx.badgeWhat}</summary>
        <ul className="mt-4 grid gap-4">
          {([...(p.badge === "founder" ? ["founder"] as const : []), "official", "gold", "emerald"] as const).map((b) => (
            <li key={b} className={`flex gap-3 rounded-md p-3 ${p.badge === b ? "bg-[#c6a65e]/10 ring-1 ring-[#c6a65e]/50" : ""}`}>
              <BadgeIcon badge={b} size={26} />
              <div><p className="font-semibold">{tx[`badge_${b}`]}</p><p className="text-[14px] leading-relaxed text-muted">{tx[`badge_${b}_text`]}</p></div>
            </li>
          ))}
        </ul>
      </details>
      {own ? <Link href="/talents/me/edit#badges" className={`inline-flex h-11 items-center justify-center rounded-lg ${soft} px-5 font-bold`}>{tx.badgesTitle}</Link> : null}
    </div>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 grid place-items-end bg-black/45 sm:place-items-center" onClick={onClose}>
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5 sm:max-w-md sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center"><h2 className="flex-1 text-xl font-extrabold text-ink">{title}</h2><button ref={ref} type="button" onClick={onClose} aria-label="×" className="grid h-11 w-11 place-items-center text-muted"><Ico n="close" size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}

function ShareDialog({ p, url, t, onClose }: { p: WebProfile; url: string; t: Record<TpKey, string>; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const rows = p.shareQr ?? [];
  const n = rows.length;
  return (
    <Dialog title={t.shareTitle} onClose={onClose}>
      <div className="grid justify-items-center gap-2.5 rounded-[20px] border border-[#c9a65e] bg-[rgb(8,38,29)] p-6 text-center">
        <p className="text-xl font-extrabold text-[rgb(214,180,108)]">Quran Masterclass</p>
        <p className="-mt-2 text-[13px] font-semibold text-[#f3e2b6]">Talents</p>
        <Avatar src={p.avatar} size={72} badge={p.badge} />
        <p className="flex items-center gap-1.5 text-[19px] font-extrabold text-[#eef0f3]">{p.name}{p.badge ? <BadgeIcon badge={p.badge} size={18} /> : null}</p>
        <p className="text-[14.5px] font-semibold text-white/75" dir="ltr">@{p.username}</p>
        {n ? (
          <div className="mt-2 rounded-[14px] border-2 border-[#dcc48c] bg-white p-2.5" role="img" aria-label={`${t.qrCode}: ${url}`}>
            <svg width="196" height="196" viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges">{rows.flatMap((r, y) => [...r].map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="rgb(8,38,29)" /> : null)))}</svg>
          </div>
        ) : null}
        <p className="text-[12.5px] text-white/60">{t.scanHint}</p>
      </div>
      <div className="mt-4 grid gap-2">
        <button type="button" onClick={() => void (navigator.share ? navigator.share({ url, title: `${p.name} (@${p.username})` }).catch(() => undefined) : navigator.clipboard.writeText(url).then(() => setCopied(true)))} className="h-12 rounded-lg bg-[#c6a65e] font-bold text-[rgb(8,38,29)]">{t.shareProfile}</button>
        <button type="button" onClick={() => void navigator.clipboard.writeText(url).then(() => setCopied(true)).catch(() => undefined)} className="h-12 rounded-lg border border-line font-bold">{copied ? t.copied : t.copyLink}</button>
        <p className="break-all text-center text-[12.5px] text-muted" dir="ltr">{url}</p>
      </div>
    </Dialog>
  );
}

const CATS = ["spam", "harassment", "inappropriate", "impersonation", "minor_safety", "other"] as const;
function ReportDialog({ username, t, onClose }: { username: string; t: Record<TpKey, string>; onClose: () => void }) {
  const [cat, setCat] = useState<(typeof CATS)[number] | null>(null);
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"" | "busy" | "done" | "error">("");
  const send = async () => {
    if (!cat) return;
    setState("busy");
    const r = await call(`/api/community/report/${username}`, { method: "POST", body: JSON.stringify({ category: cat, reason: reason.trim() }) }).catch(() => null);
    setState(r?.ok ? "done" : "error");
  };
  return (
    <Dialog title={t.reportProfile} onClose={onClose}>
      {state === "done" ? (
        <><p role="status" className="text-[15.5px] leading-relaxed">{t.reported}</p><button type="button" onClick={onClose} className="mt-4 h-12 w-full rounded-lg bg-[#c6a65e] font-bold text-[rgb(8,38,29)]">{t.close}</button></>
      ) : (
        <div className="grid gap-3">
          <p className="font-semibold">{t.reportTitle}</p>
          <div role="radiogroup" className="divide-y divide-line overflow-hidden rounded-[10px] border border-line">
            {CATS.map((c) => (
              <label key={c} className="flex min-h-[50px] cursor-pointer items-center gap-3 px-3.5">
                <input type="radio" name="cat" checked={cat === c} onChange={() => setCat(c)} className="h-5 w-5 accent-[#c6a65e]" />
                <span className="text-[15px]">{t[`cat_${c}` as TpKey]}</span>
              </label>
            ))}
          </div>
          <label className="grid gap-1.5 text-[14px] font-semibold">{t.reportDetails}<textarea value={reason} onChange={(e) => setReason(e.target.value.slice(0, 300))} rows={3} className="rounded-lg border border-line bg-bg p-3 font-normal" /></label>
          {state === "error" ? <p role="status" className="text-[14px] text-[rgb(160,58,52)]">{t.e_generic}</p> : null}
          <button type="button" onClick={() => void send()} disabled={!cat || state === "busy"} className="h-12 rounded-lg bg-[#c6a65e] font-bold text-[rgb(8,38,29)] disabled:opacity-55">{t.sendReport}</button>
        </div>
      )}
    </Dialog>
  );
}

/** emerald-to-gold band with a quiet girih pattern behind the avatar (founder and claimed reciters) */
function PremiumBand({ kind }: { kind: "founder" | "star" }) {
  const c = PREMIUM[kind].band;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[92px] overflow-hidden" style={{ background: `linear-gradient(115deg, ${c[0]} 0%, ${c[1]} 55%, ${c[2]} 100%)`, maskImage: "linear-gradient(to bottom, #000 55%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent)" }}>
      <svg className="h-full w-full opacity-[0.16]"><defs><pattern id={`girih-${kind}`} width="40" height="40" patternUnits="userSpaceOnUse"><path d={GIRIH_TILE} fill="none" stroke="#F3E2B6" strokeWidth="0.8" /></pattern></defs><rect width="100%" height="100%" fill={`url(#girih-${kind})`} /></svg>
    </span>
  );
}
/** ornamental ring: founder double gold ring with small arches, reciters emerald and gold */
function PremiumRing({ kind, size }: { kind: "founder" | "star"; size: number }) {
  const k = PREMIUM[kind];
  const s = size * 1.25;
  return (
    <svg aria-hidden viewBox="0 0 120 120" width={s} height={s} className="pointer-events-none absolute" style={{ left: (size - s) / 2, top: (size - s) / 2 }}>
      <circle cx="60" cy="60" r="55.5" fill="none" stroke={k.outer} strokeWidth="2.4" />
      <circle cx="60" cy="60" r="51.5" fill="none" stroke={k.inner} strokeWidth="1.4" />
      {k.arches ? <path d={archRing(12, 55.5, 2.6, 0.17)} fill="none" stroke={k.outer} strokeWidth="1.6" strokeLinecap="round" /> : <path d={archRing(16, 55.5, 1.4, 0.08)} fill="none" stroke={k.inner} strokeWidth="1.2" strokeLinecap="round" />}
    </svg>
  );
}
