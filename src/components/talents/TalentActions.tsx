"use client";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

// Follow / message / connect on the public profile. Signed in (cookie): follow works here; messages and connections
// open the app. Signed out: a sign-in link. State comes from GET /api/community/talents/<username>.
// Own profile: "Edit profile" (/talents/me) and share. Share uses the system share sheet or copies the link.
type Labels = { share?: string; copied?: string; editProfile?: string; follow: string; followingBtn: string; requested: string; message: string; signIn: string; signInToFollow: string; messageInApp: string; getApp: string; error: string };
export default function TalentActions({ username, appUrl, url, l }: { username: string; appUrl: string; url?: string; l: Labels }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    if (!url) return;
    try {
      if (navigator.share) { await navigator.share({ url, title: `@${username} · Quran Masterclass Talents` }); return; }
      await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500);
    } catch { /* cancelled */ }
  };
  const shareBtn = url && l.share ? (
    <button type="button" onClick={() => void share()} aria-label={l.share} title={l.share}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[rgb(var(--gold))]/40 hover:bg-white/[0.04]">
      <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
    </button>
  ) : null;
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
  if (state === "mine") return (
    <div className="grid justify-items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        {l.editProfile ? <Link href="/talents/me" className="inline-flex h-11 items-center rounded-md border border-white/30 px-6 text-[15px] font-bold hover:bg-white/[0.04]">{l.editProfile}</Link> : null}
        {shareBtn}
      </div>
      {copied ? <p role="status" className="text-[13px] text-[rgb(var(--gold))]">{l.copied}</p> : null}
    </div>
  );
  return (
    <div className="grid justify-items-center gap-2 text-center">
      <div className="flex flex-wrap justify-center gap-2">
        {state === "out" ? (
          <Link href="/account" className="btn-gold inline-flex h-11 items-center rounded-md px-6 text-[15px] font-bold">{l.follow}</Link>
        ) : (
          <button type="button" onClick={toggle} disabled={busy} aria-pressed={followed}
            className={`inline-flex h-11 items-center rounded-md px-6 text-[15px] font-bold disabled:opacity-60 ${followed || requested ? "border border-white/30" : "btn-gold"}`}>
            {followed ? l.followingBtn : requested ? l.requested : l.follow}
          </button>
        )}
        <a href={appUrl} rel="noopener" className="inline-flex h-11 items-center rounded-md border border-[rgb(var(--gold))]/40 px-6 text-[15px] font-bold hover:bg-white/[0.04]">{l.message}</a>
        {shareBtn}
      </div>
      {copied ? <p role="status" className="text-[13px] text-[rgb(var(--gold))]">{l.copied}</p> : null}
      <p className="text-[13px] text-white/60">{state === "out" ? l.signInToFollow : l.messageInApp}</p>
      {msg ? <p role="status" className="text-[13px] text-[rgb(var(--gold))]">{msg}</p> : null}
    </div>
  );
}
