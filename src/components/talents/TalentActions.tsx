"use client";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

// Follow / message / connect on the public profile. Signed in (cookie): follow works here; messages and connections
// open the app. Signed out: a sign-in link. State comes from GET /api/community/talents/<username>.
type Labels = { follow: string; followingBtn: string; requested: string; message: string; signIn: string; signInToFollow: string; messageInApp: string; getApp: string; error: string };
export default function TalentActions({ username, appUrl, l }: { username: string; appUrl: string; l: Labels }) {
  const [state, setState] = useState<"load" | "out" | "in" | "mine">("load");
  const [followed, setFollowed] = useState(false);
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetch(`/api/community/talents/${username}`, { cache: "no-store" }).then(async (r) => {
      if (r.status === 401 || r.status === 403) { setState("out"); return; }
      const d = (await r.json()) as { profile?: { mine: boolean; followed: boolean; requested: boolean } };
      if (!d.profile) { setState("out"); return; }
      setFollowed(d.profile.followed); setRequested(d.profile.requested); setState(d.profile.mine ? "mine" : "in");
    }).catch(() => setState("out"));
  }, [username]);
  const toggle = async () => {
    setBusy(true); setMsg("");
    try {
      const on = !(followed || requested);
      const r = await fetch(`/api/community/follow/${username}`, { method: on ? "POST" : "DELETE" });
      const d = (await r.json().catch(() => ({}))) as { followed?: boolean; requested?: boolean; error?: string };
      if (!r.ok) throw new Error(d.error ?? "error");
      setFollowed(!!d.followed); setRequested(!!d.requested);
    } catch { setMsg(l.error); } finally { setBusy(false); }
  };
  if (state === "load") return <div className="h-11 w-60 animate-pulse rounded-md bg-white/10" />;
  if (state === "mine") return null;
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {state === "out" ? (
          <Link href="/account" className="btn-gold inline-flex h-11 items-center rounded-md px-6 text-[15px] font-bold">{l.follow}</Link>
        ) : (
          <button type="button" onClick={toggle} disabled={busy} aria-pressed={followed}
            className={`inline-flex h-11 items-center rounded-md px-6 text-[15px] font-bold disabled:opacity-60 ${followed || requested ? "border border-white/30" : "btn-gold"}`}>
            {followed ? l.followingBtn : requested ? l.requested : l.follow}
          </button>
        )}
        <a href={appUrl} rel="noopener" className="inline-flex h-11 items-center rounded-md border border-[rgb(var(--gold))]/40 px-6 text-[15px] font-bold hover:bg-white/[0.04]">{l.message}</a>
      </div>
      <p className="text-[13px] text-white/60">{state === "out" ? l.signInToFollow : l.messageInApp}</p>
      {msg ? <p role="status" className="text-[13px] text-[rgb(var(--gold))]">{msg}</p> : null}
    </div>
  );
}
