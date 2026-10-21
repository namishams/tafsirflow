"use client";
import { useState } from "react";

// The preset encouragements under an achievement moment on the website: a gold heart, MashaAllah, Barakallahu fik and
// Allahumma barik. No free text. Signed out (401/403): a short sign-in hint. Tapping the chosen one again removes it.
const REACTIONS = ["like", "mashallah", "barakallah", "barik"] as const;
type R = (typeof REACTIONS)[number];
type Labels = Record<R, string> & { remove: string; signIn: string; error: string };

export default function MomentReactions({ id, counts, mine, own, l }: { id: string; counts: Record<R, number>; mine: R | null; own: boolean; l: Labels }) {
  const [state, setState] = useState({ counts, mine });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const react = async (r: R) => {
    if (own || busy) return;
    setBusy(true); setMsg("");
    try {
      const next = state.mine === r ? null : r;
      const res = await fetch(`/api/community/moments/${id}/react`, next ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reaction: next }) } : { method: "DELETE" });
      if (res.status === 401 || res.status === 403) { setMsg(l.signIn); return; }
      const d = (await res.json().catch(() => ({}))) as { mine?: R | null; counts?: Record<R, number> };
      if (!res.ok || !d.counts) throw new Error("error");
      setState({ counts: d.counts, mine: d.mine ?? null });
    } catch { setMsg(l.error); } finally { setBusy(false); }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((r) => {
          const on = state.mine === r, n = state.counts[r] ?? 0;
          return (
            <button key={r} type="button" onClick={() => void react(r)} disabled={own || busy} aria-pressed={on} aria-label={`${on ? l.remove : l[r]}${n ? `, ${n}` : ""}`}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition ${on ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/15" : "border-line hover:border-[rgb(var(--hm-gold))]/60"} disabled:cursor-default`}>
              {r === "like"
                ? <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill={on || n ? "rgb(198,166,94)" : "none"} stroke="rgb(198,166,94)" strokeWidth="2"><path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c2 0 3.4 1.1 4.2 2.4C11.8 6.1 13.2 5 15.2 5c3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21z" /></svg>
                : <span>{l[r]}</span>}
              {n ? <span className="font-bold">{n}</span> : null}
            </button>
          );
        })}
      </div>
      {msg ? <p role="status" className="mt-2 text-[13px] text-muted">{msg}</p> : null}
    </div>
  );
}
