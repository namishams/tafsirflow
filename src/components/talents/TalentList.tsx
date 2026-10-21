"use client";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { BadgeIcon, type WebBadge } from "./BadgeIcon";

// followers / following of a member on the website (signed in, like in the app); private lists only for followers
type Card = { username: string; name: string; badge?: WebBadge | null; level: string; avatar?: string | null };
export default function TalentList({ username, kind, l }: { username: string; kind: "followers" | "following"; l: Record<"empty" | "restricted" | "loadMore" | "signInToFollow" | "signIn" | "error", string> & { levels: Record<string, string> } }) {
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
          <li key={c.username}>
            <Link href={`/talents/${c.username}`} className="flex items-center gap-3 p-4 hover:bg-bg">
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[rgb(8,58,44)] ring-2 ring-[rgb(var(--hm-gold))]/60">
                {c.avatar ? <img src={c.avatar} alt="" className="h-full w-full object-cover" /> /* eslint-disable-line @next/next/no-img-element */ : <span aria-hidden className="font-callig text-lg text-[#e8d3a0]">{(Array.from(c.name.trim())[0] ?? "?").toUpperCase()}</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 font-semibold">{c.name}{c.badge ? <BadgeIcon badge={c.badge} size={15} /> : null}</span>
                <span className="block text-[13px] text-muted" dir="ltr">@{c.username} · {l.levels[c.level] ?? c.level}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {next ? <button type="button" onClick={() => void load(next)} className="mt-4 h-11 rounded-md border border-line px-5 font-semibold">{l.loadMore}</button> : null}
    </>
  );
}
