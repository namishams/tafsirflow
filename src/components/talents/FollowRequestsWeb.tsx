"use client";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { BadgeIcon, type WebBadge } from "./BadgeIcon";
import { Avatar } from "./TalentProfileWeb";
import { tpText } from "@/lib/talentsProfileWeb";

// /talents/requests on the website, like the app's /talents/requests (owner, 21.10.2026: 1:1): follow requests to a
// private account with Confirm and Delete side by side, received and sent connection requests (16+) and connections.
// Same endpoints as the app.
type Card = { username: string; name: string; avatar?: string | null; badge?: WebBadge | null; note?: string };
type Conns = { incoming: Card[]; outgoing: Card[]; connected: Card[] };
const soft = "bg-[rgba(6,108,78,0.08)] dark:bg-white/10";

export default function FollowRequestsWeb({ locale }: { locale: string }) {
  const t = tpText(locale);
  const [follows, setFollows] = useState<Card[] | null>(null);
  const [conns, setConns] = useState<Conns | null>(null);
  const [state, setState] = useState<"ok" | "out" | "error">("ok");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const r = await fetch("/api/community/follow-requests", { cache: "no-store" }).catch(() => null);
    if (!r) { setState("error"); return; }
    if (r.status === 401 || r.status === 403) { setState("out"); return; }
    setFollows(((await r.json().catch(() => ({}))) as { requests?: Card[] }).requests ?? []);
    const c = await fetch("/api/community/connections", { cache: "no-store" }).catch(() => null);
    if (c?.ok) setConns((await c.json()) as Conns);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const act = async (url: string, init: RequestInit) => {
    setBusy(true);
    await fetch(url, { ...init, headers: { "Content-Type": "application/json" } }).catch(() => undefined);
    await load(); setBusy(false);
  };
  if (state === "out") return <p className="mt-6 text-muted">{t.signIn} · <Link href="/account" className="font-semibold text-accent hover:underline">{t.signInBtn}</Link></p>;
  if (state === "error") return <p className="mt-6 text-muted">{t.e_generic}</p>;
  if (!follows) return <div className="mt-6 h-40 animate-pulse rounded-lg bg-line/40" />;
  const row = (c: Card, right: React.ReactNode) => (
    <li key={c.username} className="flex items-center gap-3 px-4 py-3">
      <Link href={`/talents/${c.username}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
        <Avatar src={c.avatar} size={46} badge={c.badge} />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 font-bold"><span className="truncate" dir="ltr">@{c.username}</span>{c.badge ? <BadgeIcon badge={c.badge} size={14} /> : null}</span>
          <span className="block truncate text-[13.5px] text-muted">{c.name}</span>
          {c.note ? <span className="mt-1 block text-[14px]">{c.note}</span> : null}
        </span>
      </Link>
      <span className="flex shrink-0 gap-1.5">{right}</span>
    </li>
  );
  const b = (label: string, onClick: () => void, gold = false) => (
    <button type="button" disabled={busy} onClick={onClick} className={`h-9 rounded-lg px-4 text-[14px] font-bold disabled:opacity-55 ${gold ? "bg-[#c6a65e] text-[rgb(8,38,29)]" : `${soft} text-ink`}`}>{label}</button>
  );
  const section = (title: string, items: Card[], empty: string, right: (c: Card) => React.ReactNode) => (
    <section className="mt-8">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted rtl:tracking-normal">{title}</h2>
      {items.length ? <ul className="mt-2 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">{items.map((c) => row(c, right(c)))}</ul> : <p className="mt-2 text-muted">{empty}</p>}
    </section>
  );
  return (
    <>
      {section(`${t.followRequests} (${follows.length})`, follows, t.noRequests, (c) => (
        <>
          {b(t.confirm, () => void act(`/api/community/follow-requests/${c.username}`, { method: "POST", body: JSON.stringify({ action: "accept" }) }), true)}
          {b(t.delete, () => void act(`/api/community/follow-requests/${c.username}`, { method: "POST", body: JSON.stringify({ action: "decline" }) }))}
        </>
      ))}
      {conns ? (
        <>
          {section(t.incoming, conns.incoming, t.noRequests, (c) => (
            <>
              {b(t.accept, () => void act(`/api/community/connections/${c.username}`, { method: "PATCH", body: JSON.stringify({ action: "accept" }) }), true)}
              {b(t.decline, () => void act(`/api/community/connections/${c.username}`, { method: "PATCH", body: JSON.stringify({ action: "decline" }) }))}
            </>
          ))}
          {section(t.outgoing, conns.outgoing, t.noRequests, (c) => b(t.withdraw, () => void act(`/api/community/connections/${c.username}`, { method: "DELETE" })))}
          {section(t.connectionsTitle, conns.connected, t.noConnections, () => null)}
        </>
      ) : <p className="mt-8 text-muted">{t.age16}</p>}
    </>
  );
}
