"use client";

import { useCallback, useEffect, useState } from "react";
import Segmented from "@/components/ui/Segmented";
import type { VerifyT } from "../texts";

type Item = {
  id: number; status: string; note: string; createdAt: string; reviewedAt: string | null; hasRecording: boolean; recordingDeleted: boolean;
  code: string; title: string; holder: string; pct: number; own: boolean; score: number | null; total: number | null; wordScore: number | null; durationMs: number | null; flags: string[]; platform: string;
};

export default function ReviewQueue({ t, locale }: { t: VerifyT; locale: string }) {
  const [tab, setTab] = useState<"open" | "done">("open");
  const [items, setItems] = useState<Item[] | null>(null);
  const [state, setState] = useState<"ok" | "login" | "forbidden">("ok");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setItems(null);
    const r = await fetch(`/api/certificates/review?status=${tab}&locale=${locale}`, { cache: "no-store" });
    if (r.status === 401 || r.status === 403) { setState(r.status === 401 ? "login" : "forbidden"); setItems([]); return; }
    const d = (await r.json().catch(() => ({ items: [] }))) as { items?: Item[] };
    setState("ok"); setItems(d.items ?? []);
  }, [tab, locale]);
  useEffect(() => { void load(); }, [load]);

  const decide = async (id: number, decision: "approve" | "reject") => {
    setBusy(id); setErr("");
    const r = await fetch("/api/certificates/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, decision, note: notes[id] ?? "" }) }).catch(() => null);
    setBusy(null);
    if (!r?.ok) { setErr(t.error); return; }
    void load();
  };

  if (state !== "ok") return <p className="text-[15px] text-[rgb(var(--muted))]">{state === "login" ? t.signIn : t.noAccess}</p>;
  return (
    <div className="flex flex-col gap-5">
      <Segmented tabs label={`${t.open} / ${t.done}`} value={tab} onChange={setTab}
        options={(["open", "done"] as const).map((k) => ({ id: k, label: t[k] }))} />
      {err ? <p role="alert" className="text-sm text-[rgb(190_84_104)]">{err}</p> : null}
      {items === null ? <p className="text-[rgb(var(--muted))]">…</p> : items.length === 0 ? <p className="text-[rgb(var(--muted))]">{t.empty}</p> : items.map((x) => (
        <article key={x.id} className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl">{x.title}</h2>
            <span className="font-mono text-[13px] text-[rgb(var(--muted))]" dir="ltr">{x.code}</span>
          </div>
          <p className="mt-1 text-[15px]">{x.holder || "–"}{x.own ? ` · ${t.own}` : ""}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div><dt className="text-[rgb(var(--muted))]">{t.score}</dt><dd className="font-semibold">{x.score ?? "–"} / {x.total ?? "–"} ({x.pct} %)</dd></div>
            <div><dt className="text-[rgb(var(--muted))]">{t.wordScore}</dt><dd className="font-semibold">{x.wordScore == null ? "–" : `${Math.round(x.wordScore * 100)} %`}</dd></div>
            <div><dt className="text-[rgb(var(--muted))]">{t.duration}</dt><dd className="font-semibold">{x.durationMs ? `${Math.round(x.durationMs / 60000)} min` : "–"}</dd></div>
            <div><dt className="text-[rgb(var(--muted))]">{t.flags}</dt><dd className="font-semibold">{x.flags.length ? x.flags.join(", ") : "–"}</dd></div>
          </dl>
          <div className="mt-4">
            {x.hasRecording ? <audio controls preload="none" src={`/api/certificates/review/audio?id=${x.id}`} className="w-full" /> : <p className="text-sm text-[rgb(var(--muted))]">{x.recordingDeleted ? t.recordingDeleted : t.noRecording}</p>}
          </div>
          {x.status === "open" ? (
            <div className="mt-4 flex flex-col gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-[rgb(var(--muted))]">{t.note}</span>
                <textarea value={notes[x.id] ?? ""} maxLength={500} rows={2} onChange={(e) => setNotes({ ...notes, [x.id]: e.target.value })}
                  className="w-full rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--bg))] p-3 text-[15px]" />
              </label>
              <div className="flex flex-wrap gap-2">
                <button disabled={busy === x.id || x.own || !x.hasRecording} onClick={() => void decide(x.id, "approve")} className="btn-gold h-11 rounded-full px-6 text-sm font-bold disabled:opacity-50">{t.approve}</button>
                <button disabled={busy === x.id || x.own || (notes[x.id] ?? "").trim().length < 3} onClick={() => void decide(x.id, "reject")} className="h-11 rounded-full border border-[rgb(var(--line))] px-6 text-sm font-semibold disabled:opacity-50">{t.reject}</button>
              </div>
            </div>
          ) : <p className="mt-3 text-sm font-semibold">{x.status === "approved" ? t.approved : t.declined}{x.note ? ` · ${x.note}` : ""}</p>}
        </article>
      ))}
    </div>
  );
}
