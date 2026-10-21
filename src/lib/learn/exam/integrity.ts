// mirrors mobile/src/features/exam/integrity.ts – exam integrity ("keine Schummler") for the website, with the same
// rules, keys and server calls as the app (the server's src/app/api/certificates/lib.ts decides):
//   - question pool and option order drawn per attempt from a seed (server nonce, else a local random seed)
//   - time limit per question and for the whole exam; no going back
//   - the tab going to the background (visibilitychange: hidden) during an exam voids the attempt (app: AppState)
//   - leaving the page voids it: links inside the site ask first, closing / reloading the tab asks the browser's
//     own question (beforeunload), and unmounting the exam screen counts as leaving (app: beforeRemove)
//   - cooldown between attempts and a maximum per week (local log here, the server is authoritative)
//   - recitation exams need the word check above a threshold and a recording (MediaRecorder)
//   - signed-in learners: the server opens the attempt, signs the result and issues the certificates
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, api } from "@/lib/learn/api";
import { useAuth } from "@/lib/learn/auth";
import { readJSON, writeJSON } from "@/lib/learn/store";

export type ExamKind = "rp-level" | "juz" | "surah" | "vocab" | "weekly" | "ar-unit";
export type Rule = {
  questionSec: number; examSec: number; cooldownH: number; maxPerWeek: number; pass: number;
  recitation?: { threshold: number }; review?: boolean;
};
const AR_FINAL: Record<number, string> = { 3: "A1", 5: "A2", 8: "B1", 10: "B2", 16: "C1" };

export function ruleFor(exam: ExamKind, ref: string): Rule | null {
  const n = Number(ref);
  switch (exam) {
    case "rp-level": return n >= 1 && n <= 10 ? { questionSec: 60, examSec: 1800, cooldownH: 24, maxPerWeek: 3, pass: 0.8, recitation: n >= 6 ? { threshold: 0.85 } : undefined, review: n === 10 } : null;
    case "juz": return n >= 1 && n <= 30 ? { questionSec: 45, examSec: 900, cooldownH: 24, maxPerWeek: 3, pass: 0.8, recitation: { threshold: 0.8 }, review: true } : null;
    case "surah": return n >= 1 && n <= 114 ? { questionSec: 45, examSec: 900, cooldownH: 6, maxPerWeek: 5, pass: 0.8 } : null;
    case "vocab": return ["juzamma", "vocab", "names"].includes(ref) ? { questionSec: 30, examSec: 900, cooldownH: 1, maxPerWeek: 7, pass: 0.8 } : null;
    case "weekly": return { questionSec: 45, examSec: 900, cooldownH: 24, maxPerWeek: 2, pass: 0.8 };
    case "ar-unit": {
      if (!(n >= 1 && n <= 16)) return null;
      const final = AR_FINAL[n];
      return { questionSec: 120, examSec: 2400, cooldownH: final ? 24 : 0.5, maxPerWeek: final ? 3 : 6, pass: 0.8, recitation: final === "C1" ? { threshold: 0.85 } : undefined, review: final === "C1" };
    }
  }
  return null;
}
/** the certificate an exam leads to (null: no certificate) */
export function certCourse(exam: ExamKind, ref: string): string | null {
  if (exam === "rp-level") return `rp-level:${Number(ref)}`;
  if (exam === "juz") return `juz:${Number(ref)}`;
  if (exam === "ar-unit" && AR_FINAL[Number(ref)]) return `ar-level:${AR_FINAL[Number(ref)]}`;
  return null;
}

// ---------- seeded randomness ----------
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
/** a small deterministic generator (mulberry32) seeded from the attempt */
export function rng(seed: string): () => number {
  let a = hash(seed);
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function shuffleWith<T>(arr: readonly T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** options in a new order, the answer index moved with them */
export function shuffleOptions<Q extends { options: string[]; answer: number }>(q: Q, rand: () => number): Q {
  const order = shuffleWith(q.options.map((_, i) => i), rand);
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}
const localSeed = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

// ---------- local log (this browser; cooldown and weekly limit also without an account) ----------
const LOG_KEY = "qmc.exam.log.v1";
export type LogEntry = {
  exam: ExamKind; ref: string; at: number; status: "running" | "submitted" | "void"; pct?: number; passed?: boolean;
  flags?: string[]; serverId?: number; sig?: string; cert?: { code: string; status: string } | null;
};
type Log = { attempts: LogEntry[] };
export const readExamLog = (): Log => readJSON<Log>(LOG_KEY, { attempts: [] });
function logWrite(fn: (l: Log) => Log) { const l = fn(readExamLog()); writeJSON(LOG_KEY, { attempts: l.attempts.slice(0, 300) }, true); }

export type GateInfo = { canStart: boolean; nextAt: number | null; left: number };
export function localGate(exam: ExamKind, ref: string): GateInfo {
  const rule = ruleFor(exam, ref);
  if (!rule) return { canStart: true, nextAt: null, left: 99 };
  const mine = readExamLog().attempts.filter((a) => a.exam === exam && a.ref === ref);
  const now = Date.now();
  const week = mine.filter((a) => a.at > now - 7 * 86400_000);
  const last = mine.reduce((m, a) => Math.max(m, a.at), 0);
  const cool = last ? last + rule.cooldownH * 3600_000 : 0;
  const weekFree = week.length >= rule.maxPerWeek ? Math.min(...week.map((a) => a.at)) + 7 * 86400_000 : 0;
  const next = Math.max(cool, weekFree);
  return { canStart: next <= now, nextAt: next > now ? next : null, left: Math.max(0, rule.maxPerWeek - week.length) };
}

// ---------- server ----------
export type Submitted = {
  result: { id: number; passed: boolean; score: number; total: number; wordScore: number | null; flags: string[]; sig: string; at: string };
  certificate: { code: string; status: "valid" | "pending" | "rejected" | "revoked"; course: string; url: string; needsRecording: boolean } | null;
  missingUnits?: number[];
};
export type MyCertificate = {
  code: string; course: string; title: string; holder: string; pct: number; status: "valid" | "pending" | "rejected" | "revoked";
  issuedAt: string; decidedAt: string | null; hasRecording: boolean; note: string; url: string; qr: string[];
};
const startAttempt = (exam: ExamKind, ref: string) =>
  api<{ id: number; nonce: string; startedAt: string; left: number }>("/api/certificates/attempts", { body: { action: "start", exam, ref, platform: "web" } });
const voidAttempt = (id: number, reason: string) => api("/api/certificates/attempts", { body: { action: "void", id, reason } }).catch(() => undefined);
/** leaving the page: the request has to survive the unload (keepalive; the session cookie goes along) */
function voidOnUnload(id: number, reason: string) {
  try {
    void fetch("/api/certificates/attempts", { method: "POST", keepalive: true, credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "void", id, reason }) });
  } catch { /* the server voids running attempts after two hours */ }
}
const submitAttempt = (id: number, b: { score: number; total: number; wordScore: number | null; durationMs: number; flags: string[]; hasRecording: boolean }) =>
  api<Submitted>("/api/certificates/attempts", { body: { action: "submit", id, ...b } });
export const fetchMyCertificates = (lang: string) => api<{ certificates: MyCertificate[] }>(`/api/certificates/mine?locale=${encodeURIComponent(lang)}`).then((d) => d.certificates);

/** the recording of the recitation part (a Blob from MediaRecorder) */
export async function uploadRecording(attemptId: number, blob: Blob): Promise<boolean> {
  try {
    const type = (blob.type || "audio/webm").split(";")[0];
    const ext = type === "audio/mp4" ? "m4a" : type === "audio/ogg" ? "ogg" : type === "audio/wav" ? "wav" : "webm";
    const form = new FormData();
    form.append("attempt", String(attemptId));
    form.append("file", new Blob([blob], { type }), `exam.${ext}`);
    const res = await fetch("/api/certificates/recording", { method: "POST", credentials: "same-origin", headers: { Accept: "application/json" }, body: form });
    return res.ok;
  } catch { return false; }
}

// ---------- the session hook used by the runners ----------
export type ExamPhase = "off" | "checking" | "blocked" | "running" | "recite" | "submitting" | "finished" | "void";
export type RecitePlan = { verse: string; mode: "reading" | "memory" };
export type ExamSession = {
  phase: ExamPhase; exam: ExamKind | null; ref: string; rule: Rule | null;
  /** questions may be shown (running, or no exam rules for this test) */
  ready: boolean;
  nonce: string; rand: () => number;
  /** seconds left for the exam and for the current question (null without a limit) */
  examLeft: number | null; questionLeft: number | null;
  nextAt: number | null; left: number; signedIn: boolean; offline: boolean;
  voidReason: string | null;
  pending: { score: number; total: number } | null;
  submitted: Submitted | null; submitError: string | null; recordingSent: boolean | null;
  recite: RecitePlan | null;
  finish: (score: number, total: number) => void;
  /** wordScore 0..1 (null: no word check possible), the recording as a Blob (null: none) */
  finishRecitation: (wordScore: number | null, recording: Blob | null) => void;
  abandon: (reason: string) => void;
};
type Opts = {
  active?: boolean;
  questionIndex?: number;
  questionOpen?: boolean;
  onQuestionTimeout?: () => void;
  onExpire?: () => void;
  recite?: (rand: () => number) => RecitePlan;
  /** the confirmation shown before a link inside the site leaves a running exam */
  leaveText?: string;
};

export function useExamSession(exam: ExamKind | null, ref: string, opts: Opts = {}): ExamSession {
  const { user, ready: authReady } = useAuth();
  const rule = useMemo(() => (exam ? ruleFor(exam, ref) : null), [exam, ref]);
  const active = opts.active ?? true;
  const o = useRef(opts); o.current = opts;
  const [phase, setPhase] = useState<ExamPhase>(rule ? "checking" : "off");
  const [nonce, setNonce] = useState(localSeed);
  const [serverId, setServerId] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [qStart, setQStart] = useState(Date.now());
  const [gate, setGate] = useState<GateInfo>({ canStart: true, nextAt: null, left: 99 });
  const [offline, setOffline] = useState(false);
  const [voidReason, setVoidReason] = useState<string | null>(null);
  const [pending, setPending] = useState<{ score: number; total: number } | null>(null);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recordingSent, setRecordingSent] = useState<boolean | null>(null);
  const [recite, setRecite] = useState<RecitePlan | null>(null);
  const flags = useRef(new Set<string>());
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const ids = useRef({ serverId: null as number | null, at: 0 }); ids.current = { serverId, at: startedAt };
  const rand = useMemo(() => rng(nonce), [nonce]);
  const randRef = useRef(rand); randRef.current = rand;
  const live = () => ["running", "recite"].includes(phaseRef.current);

  const markLocal = useCallback((patch: Partial<LogEntry>) => {
    const at = ids.current.at;
    logWrite((l) => ({ attempts: l.attempts.map((a) => (a.at === at && a.exam === exam && a.ref === ref ? { ...a, ...patch } : a)) }));
  }, [exam, ref]);

  const doVoid = useCallback((reason: string) => {
    if (!["running", "recite"].includes(phaseRef.current)) return;
    setVoidReason(reason); setPhase("void"); phaseRef.current = "void";
    flags.current.add(reason);
    markLocal({ status: "void", flags: [...flags.current] });
    if (ids.current.serverId) void voidAttempt(ids.current.serverId, reason);
  }, [markLocal]);

  // start: local gate, then the server (signed in), else a local attempt without certificate
  useEffect(() => {
    if (!rule || !exam || !active || !authReady || phaseRef.current !== "checking") return;
    let alive = true;
    (async () => {
      const g = localGate(exam, ref);
      setGate(g);
      if (!g.canStart) { setPhase("blocked"); return; }
      let seed = localSeed(), sid: number | null = null;
      if (user) {
        try {
          const r = await startAttempt(exam, ref);
          seed = r.nonce; sid = r.id; setGate({ ...g, left: r.left });
        } catch (e) {
          if (e instanceof ApiError && e.status === 429) {
            const g2 = await api<{ nextAt: string | null; left: number }>(`/api/certificates/attempts?exam=${exam}&ref=${encodeURIComponent(ref)}`).catch(() => null);
            if (!alive) return;
            setGate({ canStart: false, nextAt: g2?.nextAt ? Date.parse(g2.nextAt) : Date.now() + 3600_000, left: g2?.left ?? 0 }); setPhase("blocked"); return;
          }
          setOffline(true); flags.current.add("offline");
        }
      }
      if (!alive) return;
      const at = Date.now();
      logWrite((l) => ({ attempts: [{ exam, ref, at, status: "running", serverId: sid ?? undefined }, ...l.attempts] }));
      setNonce(seed); setServerId(sid); setStartedAt(at); setQStart(at); setNow(at);
      setPhase("running");
    })();
    return () => { alive = false; };
  }, [rule, exam, ref, active, phase, user, authReady]);

  // "try again" after a finished or void attempt: a new attempt with a new seed
  const wasActive = useRef(active);
  useEffect(() => {
    if (active && !wasActive.current && ["finished", "void"].includes(phaseRef.current)) {
      flags.current = new Set(); setSubmitted(null); setSubmitError(null); setRecordingSent(null); setPending(null); setRecite(null); setVoidReason(null); setOffline(false); setServerId(null);
      setPhase("checking");
    }
    wasActive.current = active;
  }, [active]);

  // timers
  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => { setQStart(Date.now()); }, [opts.questionIndex]);
  const examLeft = rule && phase === "running" ? Math.max(0, Math.ceil((startedAt + rule.examSec * 1000 - now) / 1000)) : null;
  const qOpen = opts.questionOpen ?? false;
  const questionLeft = rule && phase === "running" && qOpen && o.current.onQuestionTimeout ? Math.max(0, Math.ceil((qStart + rule.questionSec * 1000 - now) / 1000)) : null;
  useEffect(() => {
    if (examLeft === 0) { flags.current.add("timeout"); if (o.current.onExpire) o.current.onExpire(); else doVoid("timeout"); }
  }, [examLeft === 0]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (questionLeft === 0) { flags.current.add("q_timeout"); setQStart(Date.now() + 3600_000); o.current.onQuestionTimeout?.(); }
  }, [questionLeft === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // the tab in the background during an exam voids the attempt (the app: AppState "background")
  useEffect(() => {
    if (phase !== "running" && phase !== "recite") return;
    const onVis = () => { if (document.visibilityState === "hidden") doVoid("background"); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [phase, doVoid]);

  // no going back: closing or reloading the tab asks first; when it happens, the attempt is void
  useEffect(() => {
    if (phase !== "running" && phase !== "recite") return;
    const before = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    const hide = () => {
      if (!live()) return;
      flags.current.add("left");
      markLocal({ status: "void", flags: [...flags.current] });
      if (ids.current.serverId) voidOnUnload(ids.current.serverId, "left");
    };
    // links inside the site: a confirmation, then the attempt ends
    const click = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || !live() || a.target === "_blank" || e.defaultPrevented) return;
      if (!window.confirm(o.current.leaveText ?? "")) { e.preventDefault(); e.stopPropagation(); return; }
      doVoid("left");
    };
    window.addEventListener("beforeunload", before);
    window.addEventListener("pagehide", hide);
    document.addEventListener("click", click, true);
    return () => { window.removeEventListener("beforeunload", before); window.removeEventListener("pagehide", hide); document.removeEventListener("click", click, true); };
  }, [phase, doVoid, markLocal]); // eslint-disable-line react-hooks/exhaustive-deps
  // leaving the screen without a link (browser back, unmount) also counts
  useEffect(() => () => { if (["running", "recite"].includes(phaseRef.current)) { flags.current.add("left"); if (ids.current.serverId) void voidAttempt(ids.current.serverId, "left"); markLocal({ status: "void", flags: [...flags.current] }); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = useCallback(async (score: number, total: number, wordScore: number | null, recording: Blob | null) => {
    const pct = total ? Math.round((score / total) * 100) : 0;
    const durationMs = Date.now() - ids.current.at;
    const sid = ids.current.serverId;
    if (!sid) {
      markLocal({ status: "submitted", pct, passed: !!rule && score / Math.max(1, total) >= rule.pass, flags: [...flags.current] });
      setPhase("finished");
      return;
    }
    setPhase("submitting");
    try {
      const r = await submitAttempt(sid, { score, total, wordScore, durationMs, flags: [...flags.current], hasRecording: !!recording });
      setSubmitted(r);
      markLocal({ status: "submitted", pct, passed: r.result.passed, flags: r.result.flags, sig: r.result.sig, cert: r.certificate ? { code: r.certificate.code, status: r.certificate.status } : null });
      if (r.certificate?.needsRecording && recording) setRecordingSent(await uploadRecording(sid, recording));
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.code : "network");
      markLocal({ status: "submitted", pct, flags: [...flags.current, "unsent"] });
    }
    setPhase("finished");
  }, [markLocal, rule]);

  const finish = useCallback((score: number, total: number) => {
    if (phaseRef.current !== "running") return;
    if (rule?.recitation && o.current.recite && rule && total && score / total >= rule.pass) {
      setPending({ score, total }); setRecite(o.current.recite(randRef.current)); setPhase("recite");
      return;
    }
    void submit(score, total, null, null);
  }, [rule, submit]);
  const finishRecitation = useCallback((wordScore: number | null, recording: Blob | null) => {
    if (phaseRef.current !== "recite" || !pending) return;
    void submit(pending.score, pending.total, wordScore, recording);
  }, [pending, submit]);

  return {
    phase, exam, ref, rule, ready: phase === "off" || phase === "running", nonce, rand, examLeft, questionLeft,
    nextAt: gate.nextAt, left: gate.left, signedIn: !!user, offline, voidReason, pending, submitted, submitError, recordingSent, recite,
    finish, finishRecitation, abandon: doVoid,
  };
}
