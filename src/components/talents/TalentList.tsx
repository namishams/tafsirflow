"use client";
import { DefaultAvatar } from "./DefaultAvatar";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { BadgeIcon, type WebBadge } from "./BadgeIcon";
import { tpText } from "@/lib/talentsProfileWeb";
import { fill } from "@/lib/talentsWeb";

// followers / following of a member on the website (signed in, like in the app); private lists only for followers.
// Owner 21.10.2026 (app and website 1:1): Follow / Follow back / Following on every row, and Remove on the own
// followers list (the member is not notified).
type Card = { username: string; name: string; badge?: WebBadge | null; level: string; avatar?: string | null; followed?: boolean; followsMe?: boolean; mine?: boolean; requested?: boolean };
export default function TalentList({ username, kind, l, locale = "en" }: { username: string; kind: "followers" | "following"; l: Record<"empty" | "restricted" | "loadMore" | "signInToFollow" | "signIn" | "error", string> & { levels: Record<string, string> }; locale?: string }) {
  const t = tpText(locale);
  const [me, setMe] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { fetch("/api/community/me", { cache: "no-store" }).then(async (r) => { if (r.ok) setMe(((await r.json()) as { profile?: { username: string } | null }).profile?.username ?? null); }).catch(() => undefined); }, []);
  const own = me === username && kind === "followers";
  const follow = async (c: Card) => {
    setBusy(c.username);
    const r = await fetch(`/api/community/follow/${c.username}`, { method: c.followed || c.requested ? "DELETE" : "POST" }).catch(() => null);
    const d = (await r?.json().catch(() => ({}))) as { followed?: boolean; requested?: boolean } | undefined;
    if (r?.ok && d) setList((x) => x?.map((y) => (y.username === c.username ? { ...y, followed: !!d.followed, requested: !!d.requested } : y)) ?? null);
    setBusy(null);
  };
  const remove = async (c: Card) => {
    if (!window.confirm(`${t.removeTitle}\n${fill(t.removeBody, { u: c.username })}`)) return;
    setBusy(c.username);
    const r = await fetch(`/api/community/followers/${c.username}`, { method: "DELETE" }).catch(() => null);
    if (r?.ok) setList((x) => x?.filter((y) => y.username !== c.username) ?? null);
    setBusy(null);
  };
  const [list, setList] = useState<Card[] | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [state, setState] = useState<"ok" | "out" | "restricted" | "error">("ok");
  const load = useCallback(async (cursor?: string) => {
    const r = await fetch(`/api/community/talents/${username}/${kind}${cursor ? `?cursor=${cursor}` : ""}`, { cache: "no-store" }).catch(() => null);
    if (!r) { setState("error"); setList([]); return; }
    if (r.status === 401 || r.status === 403) { setState("out"); setList([]); return; }
    const d = (await r.json().catch(() => ({}))) as { list?: Card[]; next?: string | null; restricted?: boolean };
    if (!r.ok) { setState("error"); setList([]); return; }
    if (d.restricted) setState("restricted");
    setList((o) => (cursor ? [...(o ?? []), ...(d.list ?? [])] : d.list ?? []));
    setNext(d.next ?? null);
  }, [username, kind]);
  useEffect(() => { void load(); }, [load]);
  if (!list) return <div className="mt-6 h-40 animate-pulse rounded-lg bg-line/40" />;
  if (state === "out") return <p className="mt-6 text-muted">{l.signInToFollow} <Link href="/account" className="font-semibold text-accent hover:underline">{l.signIn}</Link></p>;
  if (state === "restricted") return <p className="callout mt-6 rounded-lg p-5">{l.restricted}</p>;
  if (state === "error") return <p className="mt-6 text-muted">{l.error}</p>;
  if (!list.length) return <p className="mt-6 text-muted">{l.empty}</p>;
  return (
    <>
      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {list.map((c) => (
          <li key={c.username} className="flex items-center gap-2 pe-3">
            <Link href={`/talents/${c.username}`} className="flex min-w-0 flex-1 items-center gap-3 p-4 hover:bg-bg">
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[rgb(8,58,44)] ring-2 ring-[rgb(var(--hm-gold))]/60">
                {c.avatar ? <img src={c.avatar} alt="" className="h-full w-full object-cover" /> /* eslint-disable-line @next/next/no-img-element */ : <DefaultAvatar />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 font-semibold">{c.name}{c.badge ? <BadgeIcon badge={c.badge} size={15} /> : null}</span>
                <span className="block text-[13px] text-muted" dir="ltr">@{c.username} · {l.levels[c.level] ?? c.level}</span>
              </span>
            </Link>
            {me && !c.mine && c.username !== me ? (
              <button type="button" disabled={busy === c.username} onClick={() => void follow(c)}
                className={`h-9 shrink-0 rounded-lg px-3.5 text-[13.5px] font-bold disabled:opacity-55 ${c.followed || c.requested ? "bg-[rgba(6,108,78,0.08)] dark:bg-white/10" : "bg-[#c6a65e] text-[rgb(8,38,29)]"}`}>
                {c.followed ? t.followingBtn : c.requested ? t.requested : c.followsMe ? t.followBack : t.follow}
              </button>
            ) : null}
            {own && !c.mine ? (
              <button type="button" disabled={busy === c.username} onClick={() => void remove(c)} className="h-9 shrink-0 rounded-lg bg-[rgba(6,108,78,0.08)] px-3.5 text-[13.5px] font-bold disabled:opacity-55 dark:bg-white/10">{t.remove}</button>
            ) : null}
          </li>
        ))}
      </ul>
      {next ? <button type="button" onClick={() => void load(next)} className="mt-4 h-11 rounded-md border border-line px-5 font-semibold">{l.loadMore}</button> : null}
    </>
  );
}
