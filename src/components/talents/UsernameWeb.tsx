"use client";
import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { usernameProblem } from "@/lib/usernameFilter";
import { usernameText } from "@/lib/usernameWeb";

// /username on the website, like the app's /username (owner 22.10.2026): choose the unique @username before the profile
// and the social features. Instant check with the shared word filter, then the server check (taken, reserved), then
// PUT /api/community/me creates the profile with the accepted guidelines.
type St = "idle" | "checking" | "ok" | "format" | "reserved" | "taken" | "inappropriate";
const MSG: Record<string, Record<Exclude<St, "idle" | "checking" | "ok">, string>> = {
  de: { format: "3 bis 20 Zeichen: a–z, 0–9, Punkt und Unterstrich.", reserved: "Dieser Benutzername ist reserviert.", taken: "Dieser Benutzername ist schon vergeben.", inappropriate: "Bitte wählen Sie einen anderen Benutzernamen." },
  en: { format: "3 to 20 characters: a–z, 0–9, dot and underscore.", reserved: "This username is reserved.", taken: "This username is already taken.", inappropriate: "Please choose a different username." },
};
export default function UsernameWeb({ locale }: { locale: string }) {
  const u = usernameText(locale);
  const m = MSG[locale] ?? MSG.en;
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [ok, setOk] = useState(false);
  const [st, setSt] = useState<St>("idle");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const v = username.trim();
    if (!v) { setSt("idle"); return; }
    if (!/^[a-z0-9_.]{3,20}$/.test(v)) { setSt("format"); return; }
    const bad = usernameProblem(v);
    if (bad) { setSt(bad); return; }
    setSt("checking");
    let live = true;
    const h = setTimeout(() => {
      fetch(`/api/community/username?u=${encodeURIComponent(v)}`, { cache: "no-store" }).then((r) => r.json()).then((d: { ok?: boolean; reason?: St }) => { if (live) setSt(d.ok ? "ok" : d.reason ?? "taken"); }).catch(() => live && setSt("idle"));
    }, 400);
    return () => { live = false; clearTimeout(h); };
  }, [username]);
  const save = async () => {
    setBusy(true); setMsg("");
    const r = await fetch("/api/community/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, name: name.trim() || username, role: "learner", bio: "", guidelines: true }) }).catch(() => null);
    setBusy(false);
    if (r?.ok) { try { sessionStorage.setItem("qm-has-username", "1"); } catch { /* ignore */ } router.replace("/talents/me"); return; }
    const d = r ? ((await r.json().catch(() => ({}))) as { error?: string }) : {};
    setMsg(d.error === "username_taken" ? m.taken : d.error === "username_reserved" ? m.reserved : d.error === "username_inappropriate" ? m.inappropriate : d.error === "login" ? u.needed : m.format);
  };
  const hint = st === "idle" || st === "checking" || st === "ok" ? "" : m[st];
  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <h1 className="font-display text-4xl">{u.title}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">{u.lead}</p>
      <label className="mt-8 block"><span className="font-semibold">{u.label}</span>
        <span className="mt-1 flex items-center rounded-lg border border-line bg-surface px-3"><span className="text-muted" dir="ltr">@</span>
          <input value={username} autoCapitalize="none" autoCorrect="off" spellCheck={false} dir="ltr" onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 20))} className="h-11 w-full bg-transparent px-1 text-[16px] outline-none" />
        </span>
      </label>
      {hint ? <p role="status" className="mt-2 text-[13px] text-[rgb(150,52,52)]">{hint}</p> : st === "ok" ? <p role="status" className="mt-2 text-[13px] text-accent">@{username}</p> : null}
      <label className="mt-5 block"><span className="font-semibold">{u.name}</span><input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-line bg-surface px-3 text-[16px]" /></label>
      <label className="mt-5 flex items-start gap-3"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 h-5 w-5 accent-[#066c4e]" /><span className="text-[14.5px]">{u.guidelines}</span></label>
      {msg ? <p role="alert" className="mt-4 text-muted">{msg} {msg === u.needed ? <Link href="/account" className="font-semibold text-accent">→</Link> : null}</p> : null}
      <button type="button" disabled={busy || !ok || st !== "ok"} onClick={() => void save()} className="mt-6 h-12 w-full rounded-full bg-[#c6a65e] text-[16px] font-bold text-[rgb(8,38,29)] disabled:opacity-50">{u.save}</button>
    </div>
  );
}
