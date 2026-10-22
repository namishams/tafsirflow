"use client";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { starText } from "@/lib/starText";

// "Is this you? Take over the profile" (owner 22.10.2026): signed-in members with a Quran Talents profile send the role,
// a link to an official channel and a message; an admin approves with one click. A personal invite link
// (?invite=<signed token>, 30 days) opens the form directly and marks the request as invited.
type Err = "" | "signin" | "needProfile" | "badChannel" | "error";
export default function StarClaimWeb({ locale, username, died }: { locale: string; username: string; died: boolean }) {
  const s = starText(locale);
  const tc = useTranslations("contactForms");
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState("");
  const [invited, setInvited] = useState(false);
  const [role, setRole] = useState<"self" | "team">(died ? "team" : "self");
  const [channel, setChannel] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<Err>("");
  const [taken, setTaken] = useState(false);
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("invite") ?? "";
    setInvite(t);
    fetch(`/api/community/stars/${username}${t ? `?invite=${encodeURIComponent(t)}` : ""}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { invited?: boolean; pending?: boolean }) => { if (d.invited) setInvited(true); else if (t) setInvalid(true); if (d.pending) setSent(true); })
      .catch(() => undefined);
  }, [username]);
  const send = async () => {
    setBusy(true); setErr("");
    const r = await fetch(`/api/community/stars/${username}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role, channel: channel.trim(), message, invite: invite || undefined }) }).catch(() => null);
    setBusy(false);
    if (r?.ok) { setSent(true); return; }
    const d = r ? ((await r.json().catch(() => ({}))) as { error?: string }) : {};
    setErr(d.error === "login" || d.error === "verify" ? "signin" : d.error === "profile_needed" ? "needProfile" : d.error === "channel" ? "badChannel" : "error");
  };
  // personal invite link (pre-approved): one gold button, the name and badge move at once
  const accept = async () => {
    setBusy(true); setErr("");
    const r = await fetch(`/api/community/stars/${username}/accept`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invite }) }).catch(() => null);
    setBusy(false);
    if (r?.ok) { setTaken(true); window.location.reload(); return; }
    const d = r ? ((await r.json().catch(() => ({}))) as { error?: string }) : {};
    if (d.error === "invite_invalid") { setInvited(false); setInvalid(true); return; }
    setErr(d.error === "login" || d.error === "verify" ? "signin" : "error");
  };
  if (taken) return <p role="status" className="rounded-2xl border border-line bg-surface p-5 text-[15px]">{s.acceptDone}</p>;
  if (invited) return (
    <section className="grid gap-3 rounded-2xl border border-[#D9B970]/70 bg-surface/80 p-5 backdrop-blur-md">
      <p className="w-fit rounded-full bg-[rgb(var(--gold))]/15 px-3 py-1 text-[13px] font-semibold">{s.invited}</p>
      {err === "signin" ? <p role="alert" className="text-[14px]">{s.acceptSignin} <Link href="/account" className="font-semibold text-accent">→</Link></p> : err ? <p role="alert" className="text-[14px] text-[rgb(150,52,52)]">{s.error}</p> : null}
      <button type="button" disabled={busy} onClick={() => void accept()} className="btn-gold h-12 w-full rounded-full text-[16px] font-bold disabled:opacity-50">{s.accept}</button>
    </section>
  );
  if (sent) return <p role="status" className="rounded-2xl border border-line bg-surface p-5 text-[15px]">{s.sent}</p>;
  if (!open) return <>{invalid ? <p role="status" className="text-[14px] text-muted">{s.inviteInvalid}</p> : null}<button type="button" onClick={() => setOpen(true)} className="h-12 w-fit rounded-full border border-[rgb(var(--gold))]/70 px-6 text-[15px] font-bold text-accent hover:bg-bg">{s.claim}</button></>;
  const input = "mt-1 w-full rounded-lg border border-line bg-surface px-3 text-[16px]";
  return (
    <section className="grid gap-4 rounded-2xl border border-line bg-surface/80 p-5 backdrop-blur-md">
      <h2 className="font-display text-2xl">{s.formTitle}</h2>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {(died ? (["team"] as const) : (["self", "team"] as const)).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={role === k} onClick={() => setRole(k)} className={`h-10 rounded-full px-4 text-sm font-semibold ${role === k ? "btn-gold" : "border border-line"}`}>{k === "self" ? s.roleSelf : s.roleTeam}</button>
        ))}
      </div>
      <label className="block font-semibold">{s.channel}<input value={channel} onChange={(e) => setChannel(e.target.value)} inputMode="url" dir="ltr" placeholder="https://" className={`${input} h-11`} /></label>
      <label className="block font-semibold">{s.message}<textarea value={message} maxLength={1000} onChange={(e) => setMessage(e.target.value)} rows={4} className={`${input} py-2`} /></label>
      {err ? (
        <p role="alert" className="text-[14px] text-[rgb(150,52,52)] dark:text-red-400">
          {s[err]}{" "}
          {err === "signin" ? <Link href="/account" className="font-semibold text-accent">→</Link> : err === "needProfile" ? <Link href="/username" className="font-semibold text-accent">→</Link> : null}
        </p>
      ) : null}
      <button type="button" disabled={busy || !channel.trim()} onClick={() => void send()} className="btn-gold h-12 w-full rounded-full text-[16px] font-bold disabled:opacity-50">{s.send}</button>
      <Link href="/reciters/apply" className="text-[14px] font-semibold text-accent hover:underline">{tc("rec.claimHint")}</Link>
    </section>
  );
}
