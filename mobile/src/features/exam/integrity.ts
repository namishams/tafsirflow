import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState, Platform } from "react-native";
import { useNavigation } from "expo-router";
import { ApiError, SITE, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getToken } from "@/lib/storage";
import { readJSON, writeJSON } from "@/lib/store";
import { useExamT } from "./texts";

// Exam integrity ("keine Schummler"), shared by every test runner through small hooks:
//   - question pool and option order drawn per attempt from a seed (server nonce, else a local random seed)
//   - time limit per question and for the whole exam; no going back (leaving the screen ends the attempt)
//   - the app going to the background during an exam voids the attempt
//   - cooldown between attempts and a maximum per week (checked here and, authoritative, on the server)
//   - recitation exams need the on-device word check above a threshold and a recording
//   - signed-in learners: the server opens the attempt, checks the timing of the result, signs it (HMAC) and issues
//     certificates only from these server-recorded results; the highest ones after a person reviewed the recording
// The rules mirror the website's src/app/api/certificates/lib.ts (the server decides).

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

// ---------- local log (this device; cooldown and weekly limit also without an account) ----------
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
  api<{ id: number; nonce: string; startedAt: string; left: number }>("/api/certificates/attempts", { body: { action: "start", exam, ref, platform: Platform.OS } });
const voidAttempt = (id: number, reason: string) => api("/api/certificates/attempts", { body: { action: "void", id, reason } }).catch(() => undefined);
const submitAttempt = (id: number, b: { score: number; total: number; wordScore: number | null; durationMs: number; flags: string[]; hasRecording: boolean }) =>
  api<Submitted>("/api/certificates/attempts", { body: { action: "submit", id, ...b } });
export const fetchMyCertificates = (lang: string) => api<{ certificates: MyCertificate[] }>(`/api/certificates/mine?locale=${encodeURIComponent(lang)}`).then((d) => d.certificates);

export async function uploadRecording(attemptId: number, uri: string): Promise<boolean> {
  try {
    const token = await getToken();
    const ext = (uri.split(".").pop() ?? "wav").toLowerCase();
    const type = ext === "caf" ? "audio/x-caf" : ext === "m4a" ? "audio/mp4" : ext === "webm" ? "audio/webm" : "audio/wav";
    const form = new FormData();
    form.append("attempt", String(attemptId));
    // React Native's FormData takes a file descriptor object; the browser build passes a Blob
    if (Platform.OS === "web") form.append("file", await (await fetch(uri)).blob(), `exam.${ext}`);
    else form.append("file", { uri, name: `exam.${ext}`, type } as unknown as Blob);
    const res = await fetch(`${SITE}/api/certificates/recording`, { method: "POST", headers: { Accept: "application/json", "x-qmc-app": Platform.OS, ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: form });
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
  /** pending score while the recitation part runs, and the server's answer after submitting */
  pending: { score: number; total: number } | null;
  submitted: Submitted | null; submitError: string | null; recordingSent: boolean | null;
  recite: RecitePlan | null;
  finish: (score: number, total: number) => void;
  finishRecitation: (wordScore: number | null, recordingUri: string | null) => void;
  abandon: (reason: string) => void;
};
type Opts = {
  /** the exam runs (e.g. after "Start"); default true */
  active?: boolean;
  questionIndex?: number;
  /** the question timer runs only while a question waits for an answer */
  questionOpen?: boolean;
  onQuestionTimeout?: () => void;
  /** default: the attempt is void when the time is up */
  onExpire?: () => void;
  /** verses for the recitation part (rules with `recitation`) */
  recite?: (rand: () => number) => RecitePlan;
};

export function useExamSession(exam: ExamKind | null, ref: string, opts: Opts = {}): ExamSession {
  const { user } = useAuth();
  const navigation = useNavigation();
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

  const markLocal = useCallback((patch: Partial<LogEntry>) => {
    const at = ids.current.at;
    logWrite((l) => ({ attempts: l.attempts.map((a) => (a.at === at && a.exam === exam && a.ref === ref ? { ...a, ...patch } : a)) }));
  }, [exam, ref]);

  const doVoid = useCallback((reason: string) => {
    if (!["running", "recite"].includes(phaseRef.current)) return;
    setVoidReason(reason); setPhase("void");
    flags.current.add(reason);
    markLocal({ status: "void", flags: [...flags.current] });
    if (ids.current.serverId) void voidAttempt(ids.current.serverId, reason);
  }, [markLocal]);

  // start: local gate, then the server (signed in), else a local attempt without certificate
  useEffect(() => {
    if (!rule || !exam || !active || phaseRef.current !== "checking") return;
    let live = true;
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
            // cooldown or weekly limit on the server (also attempts from other devices): ask when it opens again
            const g2 = await api<{ nextAt: string | null; left: number }>(`/api/certificates/attempts?exam=${exam}&ref=${encodeURIComponent(ref)}`).catch(() => null);
            if (!live) return;
            setGate({ canStart: false, nextAt: g2?.nextAt ? Date.parse(g2.nextAt) : Date.now() + 3600_000, left: g2?.left ?? 0 }); setPhase("blocked"); return;
          }
          setOffline(true); flags.current.add("offline");
        }
      }
      if (!live) return;
      const at = Date.now();
      logWrite((l) => ({ attempts: [{ exam, ref, at, status: "running", serverId: sid ?? undefined }, ...l.attempts] }));
      setNonce(seed); setServerId(sid); setStartedAt(at); setQStart(at); setNow(at);
      setPhase("running");
    })();
    return () => { live = false; };
  }, [rule, exam, ref, active, phase, user]);

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

  // the app in the background during an exam voids the attempt
  useEffect(() => {
    if (phase !== "running" && phase !== "recite") return;
    const sub = AppState.addEventListener("change", (s) => { if (s === "background") doVoid("background"); });
    return () => sub.remove();
  }, [phase, doVoid]);

  // no going back: leaving the screen during the exam ends the attempt (after a confirmation)
  const et = useExamT();
  const texts = useRef({ title: "", body: "", stay: "", leave: "" });
  texts.current = { title: et("leaveTitle"), body: et("leaveBody"), stay: et("stay"), leave: et("leave") };
  useEffect(() => {
    if (phase !== "running" && phase !== "recite") return;
    type BeforeRemove = { preventDefault: () => void; data: { action: unknown } };
    const nav = navigation as unknown as { addListener: (ev: "beforeRemove", cb: (e: BeforeRemove) => void) => () => void; dispatch: (a: unknown) => void };
    const unsub = nav.addListener("beforeRemove", (e) => {
      if (!["running", "recite"].includes(phaseRef.current)) return;
      e.preventDefault();
      const tx = texts.current;
      const leave = () => { doVoid("left"); nav.dispatch(e.data.action); };
      if (Platform.OS === "web") { leave(); return; }
      Alert.alert(tx.title, tx.body, [{ text: tx.stay, style: "cancel" }, { text: tx.leave, style: "destructive", onPress: leave }]);
    });
    return unsub;
  }, [phase, navigation, doVoid]);
  // leaving without the navigation event (unmount) also counts
  useEffect(() => () => { if (["running", "recite"].includes(phaseRef.current)) { flags.current.add("left"); if (ids.current.serverId) void voidAttempt(ids.current.serverId, "left"); markLocal({ status: "void", flags: [...flags.current] }); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = useCallback(async (score: number, total: number, wordScore: number | null, recordingUri: string | null) => {
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
      const r = await submitAttempt(sid, { score, total, wordScore, durationMs, flags: [...flags.current], hasRecording: !!recordingUri });
      setSubmitted(r);
      markLocal({ status: "submitted", pct, passed: r.result.passed, flags: r.result.flags, sig: r.result.sig, cert: r.certificate ? { code: r.certificate.code, status: r.certificate.status } : null });
      if (r.certificate?.needsRecording && recordingUri) setRecordingSent(await uploadRecording(sid, recordingUri));
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
  const finishRecitation = useCallback((wordScore: number | null, uri: string | null) => {
    if (phaseRef.current !== "recite" || !pending) return;
    void submit(pending.score, pending.total, wordScore, uri);
  }, [pending, submit]);

  return {
    phase, exam, ref, rule, ready: phase === "off" || phase === "running", nonce, rand, examLeft, questionLeft,
    nextAt: gate.nextAt, left: gate.left, signedIn: !!user, offline, voidReason, pending, submitted, submitError, recordingSent, recite,
    finish, finishRecitation, abandon: doVoid,
  };
}
