"use client";
// mirrors mobile/src/features/teacher/Recitations.tsx – recordings sent to a teacher and their feedback (Shams 3.0) on
// the website's teacher page. Student: own recordings, withdraw (deletes the file), the teacher's feedback – marked
// words go to the weak words, the ratings to the pronunciation rubric as side "teacher", once per feedback. Teacher:
// recordings of active links, listen, tap the words that need work (word data, never typed), rate 1–5 per area
// (each optional), a short note. Report and block on both sides (App Store guideline 1.2, same queue as the app).
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSurahVerses, wordsOf } from "@/lib/learn/reciter-path/useVerse";
import { noteWords } from "@/lib/learn/shams2/store";
import { RUBRIC_FIELDS, noteRubric, readRecitations, saveRecitations, type RubricField } from "@/lib/learn/shams2/store2";
import { tpText, type TpKey } from "@/lib/talentsProfileWeb";
import { useRt, type RtKey } from "@/lib/teacherRec/text";
import { useSurahNames } from "@/lib/learn/shams2/names";

type Member = { username: string; name: string };
type Review = { id: string; marks: string[]; text: string; at: string; makharij?: number; tajweed?: number; waqf?: number; pace?: number };
type Rec = {
  id: string; kind: "blind" | "talaqqi" | "drill" | "makhraj"; surah: number | null; from: number | null; to: number | null; letter: string | null; durationMs: number;
  summary: { self?: number; quizOk?: number; quizMiss?: number; heardOk?: number; heardTotal?: number }; status: "open" | "reviewed"; at: string; expiresAt: string; hasAudio: boolean;
  student: Member | null; teacher: Member | null; review: Review | null;
};
type Item = Rec & { appliedAt?: string };
const RLABEL: Record<RubricField, RtKey> = { makharij: "r_makharij", tajweed: "r_tajweed", waqf: "r_waqf", pace: "r_pace" };
const CATS = ["spam", "harassment", "inappropriate", "impersonation", "minor_safety", "other"] as const;
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const capsule = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-4 text-[13.5px] font-semibold transition hover:border-[rgb(var(--hm-gold))]/70 disabled:opacity-45";

async function call<T>(url: string, init?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const r = await fetch(url, { cache: "no-store", ...init }).catch(() => null);
  if (!r) return { ok: false, error: "network" };
  const d = (await r.json().catch(() => ({}))) as T & { error?: string };
  return r.ok ? { ok: true, data: d } : { ok: false, error: d.error ?? `http_${r.status}` };
}
const postJson = (url: string, body: unknown) => call<{ ok: true }>(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

function cacheList(box: "mine" | "inbox", list: Rec[]) {
  const prev = new Map(readRecitations()[box].map((x) => [x.id, x as Item]));
  saveRecitations(box, list.map((x) => ({ ...x, ...(prev.get(x.id)?.appliedAt ? { appliedAt: prev.get(x.id)!.appliedAt } : {}) })));
}
/** applies the teacher's feedback once (returns true when it was applied now) */
function applyFeedback(r: Rec): boolean {
  if (!r.review || !r.surah || !r.from || !r.to) return false;
  const all = readRecitations().mine as Item[];
  if (all.find((x) => x.id === r.id)?.appliedAt === r.review.at) return false;
  const byVerse = new Map<string, number[]>();
  for (const m of r.review.marks) { const [s, v, p] = m.split(":").map(Number); const k = `${s}:${v}`; byVerse.set(k, [...(byVerse.get(k) ?? []), p]); }
  for (const [k, ps] of byVerse) noteWords(k, ps.map((position) => ({ position, ok: false })));
  const scores: Partial<Record<RubricField, number>> = {};
  for (const f of RUBRIC_FIELDS) if (typeof r.review[f] === "number") scores[f] = r.review[f];
  if (Object.keys(scores).length) for (let v = r.from; v <= Math.min(r.to, r.from + 29); v++) noteRubric(`${r.surah}:${v}`, scores, "teacher", r.teacher?.name);
  saveRecitations("mine", all.some((x) => x.id === r.id) ? all.map((x) => (x.id === r.id ? { ...x, ...r, appliedAt: r.review!.at } : x)) : [{ ...r, appliedAt: r.review.at }, ...all]);
  return true;
}

export default function Recitations({ locale }: { locale: string }) {
  const rt = useRt();
  const { name } = useSurahNames();
  const [box, setBox] = useState<"mine" | "inbox">("mine");
  const [rows, setRows] = useState<Rec[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const load = useCallback(async () => {
    const r = await call<{ recitations: Rec[] }>(`/api/teacher/recitations?box=${box}`);
    if (r.ok) { cacheList(box, r.data.recitations); setRows(r.data.recitations); } else setRows([]);
  }, [box]);
  useEffect(() => { setRows(null); setOpen(null); void load(); }, [load]);
  const title = (r: Rec) => [rt(`k_${r.kind}` as RtKey, { l: r.letter ?? "" }), r.surah ? `${name(r.surah)} ${r.from}–${r.to}` : ""].filter(Boolean).join(" · ");
  const date = (s: string) => new Date(s).toLocaleDateString(locale, { dateStyle: "medium" });
  return (
    <section className="grid gap-3">
      <h2 className="font-display text-2xl">{rt("recT")}</h2>
      <p className="text-[14px] text-muted">{rt("recLead")}</p>
      <div role="group" className="flex rounded-full border border-line bg-surface p-1">
        {(["mine", "inbox"] as const).map((k) => <button key={k} type="button" aria-pressed={box === k} onClick={() => setBox(k)} className={cx("min-h-9 flex-1 rounded-full px-3 text-[13.5px] font-semibold", box === k ? "bg-accent text-white" : "text-muted")}>{rt(k)}</button>)}
      </div>
      {note ? <p role="status" className="text-[13.5px] font-semibold text-gold">{note}</p> : null}
      {rows === null ? <div className="h-24 animate-pulse rounded-lg bg-line/40" /> : !rows.length ? <p className="text-muted">{rt(box === "mine" ? "none" : "noneInbox")}</p> : rows.map((r) => {
        const who = box === "mine" ? r.teacher : r.student;
        return (
          <div key={r.id} className={cx("rounded-2xl border bg-surface", r.status === "open" && box === "inbox" ? "border-[#c6a65e]/60" : "border-line")}>
            <button type="button" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)} className="flex w-full items-center gap-3 p-4 text-start">
              <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-full", r.status === "reviewed" ? "bg-accent-soft" : "bg-[#c6a65e]/15")}>{r.letter ? <span lang="ar" className="font-arabic text-[22px]">{r.letter}</span> : <span aria-hidden="true">{r.status === "reviewed" ? "✓" : "…"}</span>}</span>
              <span className="grid flex-1 gap-0.5"><span className="font-semibold">{title(r)}</span><span className="text-[13px] text-muted">{[who ? rt(box === "mine" ? "to" : "from", { t: who.name }) : "", rt(`st_${r.status}` as RtKey), date(r.at)].filter(Boolean).join(" · ")}</span></span>
            </button>
            {open === r.id ? <Detail id={r.id} role={box === "mine" ? "student" : "teacher"} locale={locale} onChange={() => void load()} onNote={setNote} /> : null}
          </div>
        );
      })}
    </section>
  );
}

function Detail({ id, role, locale, onChange, onNote }: { id: string; role: "student" | "teacher"; locale: string; onChange: () => void; onNote: (s: string) => void }) {
  const rt = useRt();
  const [r, setR] = useState<Rec | null>(null);
  const [applied, setApplied] = useState(false);
  const [report, setReport] = useState<"rec" | "review" | "member" | null>(null);
  const load = useCallback(async () => {
    const x = await call<{ recitation: Rec }>(`/api/teacher/recitations/${id}`);
    if (x.ok) { setR(x.data.recitation); if (role === "student") setApplied(applyFeedback(x.data.recitation)); }
  }, [id, role]);
  useEffect(() => { void load(); }, [load]);
  if (!r) return <div className="m-4 h-20 animate-pulse rounded bg-line/40" />;
  const other = role === "student" ? r.teacher : r.student;
  const tp = tpText(locale);
  const block = async () => {
    if (!other || !window.confirm(tp.confirmBlock)) return;
    const b = await call(`/api/community/block/${encodeURIComponent(other.username)}`, { method: "POST" });
    if (b.ok) { onNote(rt("blockedNote", { name: `@${other.username}` })); onChange(); }
  };
  const sum = [
    r.summary.self ? rt("sumSelf", { n: r.summary.self }) : "",
    r.summary.quizOk !== undefined || r.summary.quizMiss !== undefined ? rt("sumQuiz", { n: `${r.summary.quizOk ?? 0} / ${(r.summary.quizOk ?? 0) + (r.summary.quizMiss ?? 0)}` }) : "",
    r.summary.heardTotal ? rt("sumHeard", { n: `${r.summary.heardOk ?? 0} / ${r.summary.heardTotal}` }) : "",
  ].filter(Boolean);
  return (
    <div className="grid gap-4 border-t border-line p-4">
      {r.hasAudio ? <audio controls preload="none" src={`/api/teacher/recitations/${r.id}/audio`} className="w-full" /> : <p className="text-[13px] text-muted">{rt("deleted")}</p>}
      {r.hasAudio ? <p className="text-[12.5px] text-muted">{rt("expires", { d: new Date(r.expiresAt).toLocaleDateString(locale, { dateStyle: "medium" }) })}</p> : null}
      {sum.length ? <div className="text-[13px]"><p className="font-semibold">{rt("summaryT")}</p>{sum.map((x) => <p key={x} className="text-muted">{x}</p>)}</div> : null}
      {role === "teacher" ? <ReviewForm r={r} onSaved={() => { void load(); onChange(); }} /> : (
        <div className="grid gap-2">
          <h3 className="font-semibold">{rt("feedback")}</h3>
          {!r.review ? <p className="text-muted">{rt("noFeedback")}</p> : (
            <>
              <Ratings v={r.review} />
              <p className="text-[12.5px] text-muted">{rt("teacherRating")}</p>
              {r.surah ? <WordMarks r={r} marks={new Set(r.review.marks)} /> : null}
              {r.review.text ? <p className="whitespace-pre-line text-[15px] leading-relaxed">{r.review.text}</p> : null}
              {applied ? <p className="text-[13px] font-semibold text-accent">{rt("applied")}</p> : null}
            </>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {role === "teacher" ? <button type="button" className={cx(capsule, "text-[rgb(160,58,52)]")} onClick={() => setReport("rec")}>{rt("reportRec")}</button> : null}
        {role === "student" && r.review ? <button type="button" className={cx(capsule, "text-[rgb(160,58,52)]")} onClick={() => setReport("review")}>{rt("reportFb")}</button> : null}
        {other ? <button type="button" className={cx(capsule, "text-[rgb(160,58,52)]")} onClick={() => setReport("member")}>{tp.reportProfile}</button> : null}
        {other ? <button type="button" className={cx(capsule, "text-[rgb(160,58,52)]")} onClick={() => void block()}>{tp.block}</button> : null}
        {role === "student" ? <button type="button" className={capsule} onClick={async () => { if (window.confirm(rt("withdrawAsk")) && (await call(`/api/teacher/recitations/${r.id}`, { method: "DELETE" })).ok) onChange(); }}>{rt("withdraw")}</button> : null}
      </div>
      {report ? (
        <ReportDialog t={tp} title={report === "rec" ? rt("reportRec") : report === "review" ? rt("reportFb") : tp.reportProfile} onClose={() => setReport(null)}
          onSend={(c, reason) => (report === "member" && other ? postJson(`/api/community/report/${encodeURIComponent(other.username)}`, { category: c, reason }) : postJson(`/api/teacher/recitations/${r.id}/report`, { category: c, reason, review: report === "review" }))} />
      ) : null}
    </div>
  );
}

function Ratings({ v }: { v: Review }) {
  const rt = useRt();
  return (
    <ul className="grid gap-1.5">
      {RUBRIC_FIELDS.filter((k) => typeof v[k] === "number").map((k) => (
        <li key={k} className="flex items-center gap-3"><span className="flex-1 text-[14px]">{rt(RLABEL[k])}</span><span aria-label={`${v[k]} / 5`} className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <span key={n} className={cx("h-3.5 w-3.5 rounded-full", n <= (v[k] ?? 0) ? "bg-[#c6a65e]" : "bg-line")} />)}</span></li>
      ))}
    </ul>
  );
}

function WordMarks({ r, marks, onToggle }: { r: Rec; marks: Set<string>; onToggle?: (ref: string) => void }) {
  const rt = useRt();
  const { verses } = useSurahVerses(r.surah);
  const list = useMemo(() => (verses ?? []).filter((v) => v.verse_number >= (r.from ?? 1) && v.verse_number <= (r.to ?? 0)), [verses, r.from, r.to]);
  if (!verses) return <div className="h-16 animate-pulse rounded bg-line/40" />;
  return (
    <div className="grid gap-2">
      <p className="text-[14px] font-semibold">{onToggle ? rt("marksLead") : rt("marksT")}</p>
      {list.map((v) => (
        <p key={v.verse_key} dir="rtl" className="flex flex-wrap items-center gap-1.5">
          {wordsOf(v).map((w) => {
            const ref = `${v.verse_key}:${w.position}`, on = marks.has(ref);
            const cls = cx("rounded-xl px-2 font-arabic text-[24px] leading-[1.75]", on && "border-[1.5px] border-[rgb(160,58,52)] bg-[rgb(160,58,52)]/10");
            return onToggle ? <button key={ref} type="button" aria-pressed={on} onClick={() => onToggle(ref)} className={cls}>{w.text_uthmani}</button> : <span key={ref} className={cls}>{w.text_uthmani}</span>;
          })}
          <span className="text-[12px] font-semibold text-gold">({v.verse_number})</span>
        </p>
      ))}
      <p className="text-[12.5px] text-muted">{marks.size ? rt("marked", { n: marks.size }) : rt("noMarks")}</p>
    </div>
  );
}

function ReviewForm({ r, onSaved }: { r: Rec; onSaved: () => void }) {
  const rt = useRt();
  const [scores, setScores] = useState<Partial<Record<RubricField, number>>>(() => Object.fromEntries(RUBRIC_FIELDS.flatMap((k) => (typeof r.review?.[k] === "number" ? [[k, r.review[k]]] : []))));
  const [marks, setMarks] = useState<Set<string>>(() => new Set(r.review?.marks ?? []));
  const [text, setText] = useState(r.review?.text ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const empty = !Object.keys(scores).length && !marks.size && !text.trim();
  const send = async () => {
    setBusy(true); setMsg(null);
    const x = await postJson(`/api/teacher/recitations/${r.id}/review`, { ...scores, marks: [...marks], text: text.trim() });
    setMsg(x.ok ? { ok: true, text: rt("saved") } : { ok: false, text: rt(x.error === "text_not_allowed" ? "err_text" : "err_generic") });
    setBusy(false);
    if (x.ok) onSaved();
  };
  return (
    <div className="grid gap-3">
      <h3 className="font-semibold">{rt("yourFeedback")}</h3>
      {r.surah ? <WordMarks r={r} marks={marks} onToggle={(ref) => setMarks((m) => { const n = new Set(m); if (n.has(ref)) n.delete(ref); else n.add(ref); return n; })} /> : null}
      <p className="text-[12.5px] text-muted">{rt("ratingHint")}</p>
      {RUBRIC_FIELDS.map((k) => (
        <div key={k} className="grid gap-1.5">
          <p className="text-[14px] font-semibold">{rt(RLABEL[k])}</p>
          <div role="group" aria-label={rt(RLABEL[k])} className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-pressed={scores[k] === n} onClick={() => setScores((s) => { const x = { ...s }; if (x[k] === n) delete x[k]; else x[k] = n; return x; })} className={cx("min-h-10 rounded-full border font-bold", scores[k] === n ? "border-[#c6a65e] bg-[#c6a65e]/20" : "border-line bg-surface")}>{n}</button>)}
          </div>
        </div>
      ))}
      <label className="grid gap-1.5 text-[14px] font-semibold">{rt("note")}<textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 600))} rows={3} className="rounded-xl border border-line bg-bg p-3 font-normal" /></label>
      <button type="button" disabled={busy || empty} onClick={() => void send()} className="btn-gold min-h-12 rounded-full px-5 font-bold disabled:opacity-45">{rt("sendFeedback")}</button>
      {msg ? <p role="status" className={cx("text-[13.5px] font-semibold", msg.ok ? "text-gold" : "text-[rgb(160,58,52)]")}>{msg.text}</p> : null}
    </div>
  );
}

function ReportDialog({ t, title, onClose, onSend }: { t: Record<TpKey, string>; title: string; onClose: () => void; onSend: (c: string, reason: string) => Promise<{ ok: boolean }> }) {
  const [cat, setCat] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"" | "busy" | "done" | "error">("");
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [onClose]);
  const send = async () => { if (!cat) return; setState("busy"); const r = await onSend(cat, reason.trim()); setState(r.ok ? "done" : "error"); };
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 grid place-items-end bg-black/45 sm:place-items-center" onClick={onClose}>
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5 text-ink sm:max-w-md sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center"><h2 className="flex-1 truncate text-xl font-extrabold">{title}</h2><button type="button" onClick={onClose} aria-label={t.close} className="grid h-11 w-11 place-items-center text-[22px] text-muted">×</button></div>
        {state === "done" ? (
          <><p role="status" className="text-[15.5px] leading-relaxed">{t.reported}</p><button type="button" onClick={onClose} className="btn-gold mt-4 h-12 w-full rounded-full font-bold">{t.close}</button></>
        ) : (
          <div className="grid gap-3">
            <p className="font-semibold">{t.reportTitle}</p>
            <div role="radiogroup" className="divide-y divide-line overflow-hidden rounded-[10px] border border-line">
              {CATS.map((c) => <label key={c} className="flex min-h-[50px] cursor-pointer items-center gap-3 px-3.5"><input type="radio" name="teacher-rec-report" checked={cat === c} onChange={() => setCat(c)} className="h-5 w-5 accent-[#c6a65e]" /><span className="text-[15px]">{t[`cat_${c}` as TpKey]}</span></label>)}
            </div>
            <label className="grid gap-1.5 text-[14px] font-semibold">{t.reportDetails}<textarea value={reason} onChange={(e) => setReason(e.target.value.slice(0, 300))} rows={3} className="rounded-lg border border-line bg-bg p-3 font-normal" /></label>
            {state === "error" ? <p role="status" className="text-[14px] text-[rgb(160,58,52)]">{t.e_generic}</p> : null}
            <button type="button" onClick={() => void send()} disabled={!cat || state === "busy"} className="btn-gold h-12 rounded-full font-bold disabled:opacity-55">{t.sendReport}</button>
          </div>
        )}
      </div>
    </div>
  );
}

