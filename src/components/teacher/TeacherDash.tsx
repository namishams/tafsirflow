"use client";
import { useCallback, useEffect, useState } from "react";
import { fillT, teacherText, type TcKey } from "@/lib/teacherWeb";

// Teacher dashboard on the website: invitations, all students with their aggregates (those who have not practised
// for a while come first), detail with the plan, the last 28 days and the quality per surah, preset encouragement and
// a suggested portion. Same API as the app (/api/teacher/*). The student side only manages and ends the link.
type Member = { username: string; name: string };
type Digest = { memorised: number; grade: number; activeDays: number; idle: number | null; weak: number; itqan: { surahs: number; juz: number }; syncedAt: string | null };
type Row = { id: string; status: "pending" | "active"; member: Member | null; open: number; digest: Digest | null };
type Sug = { id: string; kind: "nudge" | "assign"; preset: string | null; surah: number | null; from: number | null; to: number | null; status: string };
type Snap = { memorised: number; overall: number | null; plan: { sabaq: [number, number, number][]; sabqi: number; manzil: number; minutes: number }; surahs: [number, number, number, number][]; log: [number, number][] };
type Detail = { id: string; snapshot: Snap | null; syncedAt: string | null; suggestions: Sug[] };
type Mine = { id: string; status: "pending" | "active"; syncedAt: string | null; teacher: Member | null };
const PRESETS = ["keep_going", "well_done", "gentle_reminder", "take_your_time"] as const;

export default function TeacherDash({ locale }: { locale: string }) {
  const tx = teacherText(locale);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mine, setMine] = useState<Mine[]>([]);
  const [auth, setAuth] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    const r = await fetch("/api/teacher/students", { cache: "no-store" }).catch(() => null);
    if (!r) { setRows([]); return; }
    if (r.status === 401 || r.status === 403) { setAuth(r.status === 403 ? true : false); setRows([]); }
    else if (r.ok) setRows(((await r.json()) as { students: Row[] }).students);
    const s = await fetch("/api/teacher/shares", { cache: "no-store" }).catch(() => null);
    if (s?.ok) setMine(((await s.json()) as { teachers: Mine[] }).teachers);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const call = async (url: string, method: string, body?: unknown) => {
    setMsg("");
    const r = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined }).catch(() => null);
    if (!r?.ok) { const e = ((await r?.json().catch(() => ({}))) as { error?: string }) ?? {}; setMsg(e.error === "too_soon" ? tx.errSoon : e.error === "bad_range" ? tx.errRange : tx.err); return false; }
    return true;
  };
  if (rows === null) return <div className="mt-8 h-40 animate-pulse rounded-lg bg-line/40" />;
  if (!auth) return <p className="mt-8 text-muted">{tx.signIn}</p>;
  const needs = (r: Row) => !r.digest || r.digest.idle === null || r.digest.idle >= 3;
  const pending = rows.filter((r) => r.status === "pending");
  const active = rows.filter((r) => r.status === "active").sort((a, b) => Number(needs(b)) - Number(needs(a)));
  return (
    <div className="mt-8 grid gap-8">
      {msg ? <p role="alert" className="text-[14px] text-muted">{msg}</p> : null}
      {pending.length ? (
        <section className="grid gap-3">
          <h2 className="font-display text-2xl">{tx.invites}</h2>
          {pending.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-3">
              <span className="flex-1 font-semibold">{r.member?.name ?? "–"}</span>
              <button className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink" onClick={async () => { if (await call(`/api/teacher/shares/${r.id}`, "PATCH", { action: "accept" })) void load(); }}>{tx.accept}</button>
              <button className="rounded-full border border-line px-4 py-2 text-sm" onClick={async () => { if (await call(`/api/teacher/shares/${r.id}`, "PATCH", { action: "decline" })) void load(); }}>{tx.decline}</button>
            </div>
          ))}
        </section>
      ) : null}
      <section className="grid gap-3">
        {!active.length ? <p className="text-muted">{tx.none}</p> : null}
        {active.map((r) => {
          const d = r.digest;
          return (
            <div key={r.id} className={`rounded-lg border bg-surface ${needs(r) ? "border-gold/60" : "border-line"}`}>
              <button className="flex w-full flex-col items-start gap-1 p-4 text-start" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)}>
                <span className="font-semibold">{r.member?.name ?? "–"}</span>
                <span className="text-[13px] text-muted">
                  {d ? [fillT(tx.mem, { n: d.memorised }), fillT(tx.grade, { n: d.grade }), fillT(tx.active28, { n: d.activeDays }), fillT(tx.weak, { n: d.weak }), fillT(tx.itqan, { n: d.itqan.surahs })].join(" · ") : tx.never}
                </span>
                {needs(r) ? <span className="text-[13px] font-semibold text-gold">{d && d.idle !== null ? `${tx.attention} · ${fillT(tx.idle, { n: d.idle })}` : tx.attention}</span> : null}
              </button>
              {open === r.id ? <StudentDetail id={r.id} tx={tx} call={call} onEnded={() => { setOpen(null); void load(); }} /> : null}
            </div>
          );
        })}
      </section>
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">{tx.student}</h2>
        <p className="text-[14px] text-muted">{tx.studentLead}</p>
        <h3 className="font-semibold">{tx.myTeachers}</h3>
        {!mine.length ? <p className="text-muted">{tx.noTeachers}</p> : null}
        {mine.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-3">
            <span className="flex-1"><span className="block font-semibold">{m.teacher?.name ?? "–"}</span><span className="block text-[13px] text-muted">{m.status === "pending" ? tx.waiting : `${tx.sharing} · ${m.syncedAt ? fillT(tx.updated, { d: new Date(m.syncedAt).toLocaleString(locale) }) : tx.never}`}</span></span>
            <button className="rounded-full border border-line px-4 py-2 text-sm" onClick={async () => { if (window.confirm(tx.stopAsk) && (await call(`/api/teacher/shares/${m.id}`, "DELETE"))) void load(); }}>{tx.stop}</button>
          </div>
        ))}
      </section>
    </div>
  );
}

function StudentDetail({ id, tx, call, onEnded }: { id: string; tx: Record<TcKey, string>; call: (u: string, m: string, b?: unknown) => Promise<boolean>; onEnded: () => void }) {
  const [d, setD] = useState<Detail | null>(null);
  const [surah, setSurah] = useState(""), [from, setFrom] = useState(""), [to, setTo] = useState("");
  const [ok, setOk] = useState(false);
  const load = useCallback(async () => {
    const r = await fetch(`/api/teacher/students/${id}`, { cache: "no-store" }).catch(() => null);
    if (r?.ok) setD((await r.json()) as Detail);
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  if (!d) return <div className="m-4 h-24 animate-pulse rounded bg-line/40" />;
  const s = d.snapshot;
  const num = (v: string) => Number(v.replace(/\D/g, ""));
  const send = async (url: string, body: unknown) => { setOk(false); if (await call(url, "POST", body)) { setOk(true); void load(); return true; } return false; };
  const field = "w-28 rounded-lg border border-line bg-surface px-3 py-2";
  return (
    <div className="grid gap-5 border-t border-line p-4">
      {s ? (
        <>
          <div>
            <h3 className="font-semibold">{tx.plan}</h3>
            <p className="mt-1 text-[14px] text-muted">
              {`${tx.sabaq}: ${s.plan.sabaq.length ? s.plan.sabaq.map(([a, b, c]) => `${fillT(tx.surahN, { n: a })} ${b}–${c}`).join(", ") : "–"} · ${tx.sabqi}: ${s.plan.sabqi} · ${tx.manzil}: ${s.plan.manzil} · ${fillT(tx.minutes, { n: s.plan.minutes })}`}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">{tx.last28}</h3>
            <div className="mt-2 flex flex-wrap gap-1" aria-hidden="true">
              {s.log.map(([day, b]) => <span key={day} className={`h-4 w-4 rounded ${b === 7 ? "bg-gold" : b ? "bg-gold/40" : "bg-line"}`} />)}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">{tx.bySurah}</h3>
            <ul className="mt-2 grid gap-1 text-[14px]">
              {s.surahs.map(([sid, known, total, score]) => (
                <li key={sid} className="flex items-center gap-3"><span className="flex-1">{fillT(tx.surahN, { n: sid })}</span><span className="text-muted">{known}/{total}</span><span className="w-10 rounded bg-gold/20 px-1 text-center font-semibold">{score}</span></li>
              ))}
            </ul>
          </div>
        </>
      ) : <p className="text-muted">{tx.never}</p>}
      <div className="grid gap-2">
        <h3 className="font-semibold">{tx.encourage}</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => <button key={p} className="rounded-full border border-line px-3 py-2 text-start text-sm hover:border-gold" onClick={() => void send("/api/teacher/suggestions", { shareId: id, kind: "nudge", preset: p })}>{tx[`nudge_${p}` as TcKey]}</button>)}
        </div>
      </div>
      <div className="grid gap-2">
        <h3 className="font-semibold">{tx.suggest}</h3>
        <div className="flex flex-wrap gap-2">
          <input inputMode="numeric" className={field} placeholder={tx.surahNo} aria-label={tx.surahNo} value={surah} onChange={(e) => setSurah(e.target.value)} />
          <input inputMode="numeric" className={field} placeholder={tx.fromV} aria-label={tx.fromV} value={from} onChange={(e) => setFrom(e.target.value)} />
          <input inputMode="numeric" className={field} placeholder={tx.toV} aria-label={tx.toV} value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50" disabled={!num(surah) || !num(from) || !num(to)} onClick={async () => { if (await send("/api/teacher/suggestions", { shareId: id, kind: "assign", surah: num(surah), from: num(from), to: num(to) })) { setSurah(""); setFrom(""); setTo(""); } }}>{tx.send}</button>
        </div>
        {ok ? <p role="status" className="text-[13px] font-semibold text-gold">{tx.sent}</p> : null}
      </div>
      {d.suggestions.length ? (
        <ul className="grid gap-2 text-[14px]">
          {d.suggestions.map((x) => (
            <li key={x.id} className="flex items-center gap-3 rounded-lg border border-line p-2">
              <span className="flex-1">{x.kind === "nudge" && x.preset ? tx[`nudge_${x.preset}` as TcKey] : `${fillT(tx.surahN, { n: x.surah ?? 0 })} ${x.from}–${x.to}`} · {tx[`st_${x.status}` as TcKey]}</span>
              {x.status === "open" ? <button className="text-sm underline" onClick={async () => { if (await call(`/api/teacher/suggestions/${x.id}`, "DELETE")) void load(); }}>{tx.withdraw}</button> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <div><button className="text-sm text-muted underline" onClick={async () => { if (window.confirm(tx.stopAsk) && (await call(`/api/teacher/shares/${id}`, "DELETE"))) onEnded(); }}>{tx.stopLink}</button></div>
    </div>
  );
}
