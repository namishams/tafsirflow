"use client";
// mirrors mobile/src/features/teacher/SendToTeacher.tsx – "send to teacher" (Shams 3.0) on the website.
// Step 1, always: download the recording and copy a short summary – nothing reaches our server. Step 2, with an
// active teacher link: send it to that teacher with an explicit consent tick each time (and the parental tick for
// 13–15 year olds); kept at most 60 days, the student can withdraw it, both sides can report and block (/teacher).
// The summary is structured (own rating, ear training, words heard), never a pronunciation score.
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRt, type RtKey } from "@/lib/teacherRec/text";

export type WebTake = { blob: Blob; url: string; ms: number };
export type RecKind = "blind" | "talaqqi" | "drill" | "makhraj";
export type RecSummary = { self?: number; quizOk?: number; quizMiss?: number; heardOk?: number; heardTotal?: number };
export const REC_MIN_MS: Record<RecKind, number> = { makhraj: 5_000, drill: 30_000, talaqqi: 30_000, blind: 30_000 };
const REC_MAX_MS = 5 * 60_000;
type Teacher = { id: string; status: string; teacher: { name: string; username: string } | null };
const ERR: Record<string, RtKey> = { too_many_open: "err_too_many_open", not_linked: "err_not_linked", media_format: "err_media", media_missing: "err_media", media_too_large: "err_media", bad_duration: "tooShort", parental_required: "err_parental" };

function Check({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-[14px] leading-relaxed">
      <input type="checkbox" checked={on} onChange={onToggle} className="mt-1 h-5 w-5 shrink-0 accent-[#c6a65e]" />
      <span>{label}</span>
    </label>
  );
}

export function SendToTeacher({ take, kind, surah, from, to, letter, summary, shareText }: {
  take: WebTake | null; kind: RecKind; surah?: number; from?: number; to?: number; letter?: string; summary: RecSummary; shareText: string;
}) {
  const rt = useRt();
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [signedIn, setSignedIn] = useState(true);
  const [parentalNeeded, setParentalNeeded] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [parental, setParental] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch("/api/teacher/shares", { cache: "no-store" }).then(async (r) => {
      if (!alive) return;
      if (!r.ok) { setSignedIn(r.status !== 401); setTeachers([]); return; }
      const d = (await r.json()) as { teachers: Teacher[]; parentalNeeded: boolean };
      const act = d.teachers.filter((x) => x.status === "active" && x.teacher);
      setTeachers(act); setParentalNeeded(d.parentalNeeded); setPick(act[0]?.id ?? null);
    }).catch(() => { if (alive) setTeachers([]); });
    return () => { alive = false; };
  }, []);
  useEffect(() => { setConsent(false); setMsg(null); }, [take?.url]);
  const min = REC_MIN_MS[kind];
  const tooShort = !!take && take.ms < min, tooLong = !!take && take.ms > REC_MAX_MS;
  const chosen = teachers?.find((x) => x.id === pick) ?? null;
  const ext = take?.blob.type.includes("mp4") ? "m4a" : take?.blob.type.includes("ogg") ? "ogg" : "webm";
  const copy = async () => { try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* not allowed */ } };
  const send = async () => {
    if (!take || !chosen || !consent || tooShort || tooLong) return;
    setBusy(true); setMsg(null);
    const f = new FormData();
    f.append("file", take.blob, `recitation.${ext}`);
    f.append("shareId", chosen.id); f.append("kind", kind); f.append("durationMs", String(Math.round(take.ms))); f.append("summary", JSON.stringify(summary));
    if (surah && from && to) { f.append("surah", String(surah)); f.append("from", String(from)); f.append("to", String(to)); }
    if (letter) f.append("letter", letter);
    if (parentalNeeded && parental) f.append("parental", "1");
    const r = await fetch("/api/teacher/recitations", { method: "POST", body: f }).catch(() => null);
    if (r?.ok) { setMsg({ ok: true, text: rt("sent") }); setConsent(false); }
    else { const e = ((await r?.json().catch(() => ({}))) ?? {}) as { error?: string }; setMsg({ ok: false, text: rt(ERR[e.error ?? ""] ?? "err_generic", { n: Math.round(min / 1000) }) }); }
    setBusy(false);
  };
  const outline = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 text-[14px] font-semibold transition hover:border-[rgb(var(--hm-gold))]/70 disabled:opacity-45";
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2.5">
        {take ? <a href={take.url} download={`recitation.${ext}`} className={outline}>{rt("download")}</a> : <button type="button" disabled className={outline}>{rt("download")}</button>}
        <button type="button" onClick={() => void copy()} className={outline}>{copied ? rt("copied") : rt("copy")}</button>
      </div>
      <p className="text-[13px] leading-relaxed text-muted">{rt("shareNote")}</p>
      <hr className="border-line" />
      <h3 className="text-[15px] font-bold">{rt("direct")}</h3>
      {!signedIn ? (
        <><p className="text-[13px] text-muted">{rt("signIn")}</p><Link href="/teacher" className={`${outline} w-fit`}>{rt("openLink")}</Link></>
      ) : teachers === null ? <p className="text-[13px] text-muted">{rt("loading")}</p> : !teachers.length ? (
        <><p className="text-[13px] text-muted">{rt("noTeacher")}</p><Link href="/teacher" className={`${outline} w-fit`}>{rt("openLink")}</Link></>
      ) : (
        <>
          {teachers.length > 1 ? (
            <div className="flex flex-wrap gap-1.5">
              {teachers.map((x) => <button key={x.id} type="button" aria-pressed={pick === x.id} onClick={() => setPick(x.id)} className={`min-h-9 rounded-full border px-3 text-[13px] font-semibold ${pick === x.id ? "border-[#c6a65e] bg-[#c6a65e]/15" : "border-line bg-surface"}`}>{x.teacher?.name ?? "–"}</button>)}
            </div>
          ) : null}
          <p className="rounded-2xl bg-[#c6a65e]/10 p-3 text-[13px] leading-relaxed">{rt("privacy")}</p>
          {chosen ? <Check on={consent} onToggle={() => setConsent(!consent)} label={rt("consent", { t: chosen.teacher?.name ?? "" })} /> : null}
          {parentalNeeded ? <Check on={parental} onToggle={() => setParental(!parental)} label={rt("parental")} /> : null}
          {tooShort ? <p className="text-[13px] text-[rgb(160,58,52)]">{rt("tooShort", { n: Math.round(min / 1000) })}</p> : null}
          {tooLong ? <p className="text-[13px] text-[rgb(160,58,52)]">{rt("tooLong")}</p> : null}
          <button type="button" onClick={() => void send()} disabled={busy || !take || !chosen || !consent || tooShort || tooLong || (parentalNeeded && !parental)}
            className="btn-gold min-h-12 w-full rounded-full px-5 text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-45">{busy ? rt("sending") : rt("send")}</button>
        </>
      )}
      {msg ? <p role="status" className={`text-[13.5px] font-semibold ${msg.ok ? "text-gold" : "text-[rgb(160,58,52)]"}`}>{msg.text}</p> : null}
    </div>
  );
}
