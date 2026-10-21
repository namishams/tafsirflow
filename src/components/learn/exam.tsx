"use client";
// The visible parts of the exam rules on the website, mirrors mobile/src/features/exam/ExamUI.tsx and Certificates.tsx:
// the timer bar, the "not yet" card, the recitation part (Web Speech word check + MediaRecorder recording), the verdict
// with the verifiable certificate, "My certificates" and the link under a device certificate. Texts: module "exam".
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { intlLocale, useLang } from "@/lib/learn/i18n";
import { useAuth } from "@/lib/learn/auth";
import { fetchMyCertificates, type ExamSession, type MyCertificate } from "@/lib/learn/exam/integrity";
import { useExamT } from "@/lib/learn/exam/texts";
import { useVerse, wordsOf } from "@/lib/learn/reciter-path/useVerse";
import { useRecorder, useWordCheck } from "./media";
import { GoldButton, Note, OutlineButton, OutlineLink, Spinner } from "./ui";
import { IconClock } from "@/components/Icons";
import { StarGlyph } from "@/components/art/HomeOrnaments";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** timer for the exam and the current question, with the rules */
export function ExamBar({ session: s, showRules = true }: { session: ExamSession; showRules?: boolean }) {
  const et = useExamT();
  if (s.phase !== "running" || !s.rule) return null;
  const low = s.examLeft !== null && s.examLeft <= 60;
  return (
    <div className="grid gap-2">
      <div aria-live="polite" className={`flex items-center gap-2.5 rounded-lg border bg-surface px-3 py-2 ${low ? "border-red-600 text-red-700 dark:text-red-400" : "border-line"}`}>
        <span className={`[&>svg]:h-4 [&>svg]:w-4 ${low ? "" : "text-[rgb(var(--hm-gold))]"}`}><IconClock /></span>
        <span className="flex-1 text-[13.5px] font-semibold tabular-nums">{et("timeLeft", { t: mmss(s.examLeft ?? 0) })}</span>
        {s.questionLeft !== null && (
          <span className={`min-w-[54px] rounded-full px-2 py-0.5 text-center text-[13px] font-bold tabular-nums ${s.questionLeft <= 10 ? "bg-red-600/10 text-red-700 dark:text-red-400" : "bg-accent-soft text-accent"}`}>{et("questionTime", { s: s.questionLeft })}</span>
        )}
      </div>
      {showRules && <p className="text-[12px] leading-relaxed text-muted">{`${et("rule1")} ${et("rule2")} ${et("rule3")}`}</p>}
    </div>
  );
}

/** cooldown or weekly limit reached */
export function ExamBlocked({ session: s }: { session: ExamSession }) {
  const et = useExamT();
  const { lang } = useLang();
  if (s.phase !== "blocked") return null;
  const date = s.nextAt ? new Date(s.nextAt).toLocaleString(intlLocale(lang), { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <Note title={et("blockedTitle")}>
      {date && <p className="text-[15px] text-ink">{et("blockedCooldown", { date })}</p>}
      <p className="mt-1">{`${et("rule1")} ${et("rule3")}`}</p>
    </Note>
  );
}

/** the recitation part: the browser's word check (Web Speech API, where available) and a recording of the attempt */
export function RecitationStep({ session: s }: { session: ExamSession }) {
  const et = useExamT();
  const plan = s.recite;
  const { verse, error } = useVerse(plan?.verse ?? null);
  const words = verse ? wordsOf(verse) : [];
  const check = useWordCheck(words.map((w) => w.text_uthmani));
  const rec = useRecorder();
  const [started, setStarted] = useState(false);
  if (s.phase !== "recite" || !plan) return null;
  const need = Math.round((s.rule?.recitation?.threshold ?? 0.8) * 100);
  const listening = check.state === "listening" || rec.state === "recording";
  const start = async () => {
    setStarted(true);
    await rec.start();
    if (check.supported) check.start();
  };
  const stop = () => { check.stop(); rec.stop(); };
  const shown = plan.mode === "memory" && !check.ok ? words.slice(0, 2) : words;
  const ended = started && !listening;
  const unavailable = !check.supported;
  return (
    <section className="hm-card relative grid gap-3 p-5">
      <h3 className="flex items-center gap-2 text-lg font-bold"><StarGlyph size={13} className="text-[rgb(var(--hm-gold))]" />{et("reciteTitle")}</h3>
      <p className="text-[13.5px] leading-relaxed text-muted">{et(plan.mode === "memory" ? "reciteLeadMemory" : "reciteLeadReading")}</p>
      <p className="text-[12.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{`${et("reciteVerse", { key: plan.verse })} · ${et("reciteNeed", { pct: need })}`}</p>
      {verse ? (
        <p lang="ar" dir="rtl" className="flex flex-wrap gap-x-2 gap-y-1">
          {shown.map((w, i) => (
            <span key={w.position} className={`font-arabic rounded-md px-1.5 text-[26px] leading-[1.9] ${check.ok ? (check.ok[i] ? "bg-accent-soft text-accent" : "bg-red-600/[0.07] text-red-700 dark:text-red-400") : ""}`}>{w.text_uthmani}</span>
          ))}
          {plan.mode === "memory" && !check.ok && <span className="font-arabic text-[26px] text-muted">…</span>}
        </p>
      ) : error ? <p className="text-sm text-muted">{et("sendError")}</p> : <Spinner />}
      {unavailable && <p className="text-[13.5px] font-semibold leading-relaxed text-muted">{et("reciteUnavailable")}</p>}
      {(check.state === "denied" || rec.state === "denied") && <p className="text-[13.5px] font-semibold leading-relaxed text-muted">{et("reciteMic")}</p>}
      {check.ok && <p aria-live="polite" className={`text-sm font-semibold ${check.score * 100 >= need ? "text-accent" : ""}`}>{et("reciteHeard", { n: check.ok.filter(Boolean).length, total: words.length })}</p>}
      {rec.url && <audio controls src={rec.url} className="w-full max-w-md" />}
      <div className="flex flex-wrap gap-2.5">
        {!ended && (
          <button type="button" onClick={() => (listening ? stop() : void start())} disabled={!verse}
            className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-white disabled:opacity-50 ${listening ? "bg-red-600" : "bg-accent"}`}>
            {listening && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />}
            {listening ? et("reciteStop") : et("reciteStart")}
          </button>
        )}
        {(ended || unavailable) && <GoldButton onClick={() => s.finishRecitation(check.ok ? check.score : null, rec.blob)}>{et("reciteSubmit")}</GoldButton>}
        {ended && <OutlineButton onClick={() => void start()}>{et("reciteStart")}</OutlineButton>}
      </div>
    </section>
  );
}

/** after the questions: recitation part, sending, the server's verdict, the certificate */
export function ExamVerdict({ session: s, certificatesHref = "/school/certificates" }: { session: ExamSession; certificatesHref?: string }) {
  const et = useExamT();
  if (s.phase === "off" || s.phase === "checking" || s.phase === "running" || s.phase === "blocked") return null;
  if (s.phase === "recite") return <RecitationStep session={s} />;
  if (s.phase === "void") {
    const why = s.voidReason === "background" ? et("voidBackground") : s.voidReason === "timeout" ? et("voidTimeout") : et("voidLeft");
    return <Note tone="red" title={et("voided")}>{why}</Note>;
  }
  if (s.phase === "submitting") return <Spinner label={et("submitting")} />;
  if (!s.signedIn) return (
    <div className="grid gap-2.5">
      <Note title={et("notVerified")}>{et("signInForCert")}</Note>
      <OutlineLink href="/account" className="w-fit">{et("signIn")}</OutlineLink>
    </div>
  );
  if (s.offline || s.submitError) return <Note tone="muted" title={et("notVerified")}>{s.offline ? et("offlineNote") : et("sendError")}</Note>;
  const r = s.submitted;
  if (!r) return null;
  const c = r.certificate;
  return (
    <div className="grid gap-2.5">
      <Note tone="accent" title={et("verified")}>{!r.result.passed && r.result.score / Math.max(1, r.result.total) >= (s.rule?.pass ?? 1) ? et("notAccepted") : null}</Note>
      {r.missingUnits?.length ? <Note title={et("getVerified")}>{et("missingUnits", { list: r.missingUnits.join(", ") })}</Note> : null}
      {c && (
        <>
          <Note title={c.status === "pending" ? et("certPending") : et("certIssued")}>{c.status === "pending" ? et("certPendingNote") : `${et("code")}: ${c.code}`}</Note>
          {c.status === "pending" && s.recordingSent !== null && <p className={`text-[13px] ${s.recordingSent ? "text-accent" : "text-red-700 dark:text-red-400"}`}>{et(s.recordingSent ? "recordingSent" : "recordingFailed")}</p>}
          <OutlineLink href={certificatesHref} className="w-fit">{et("myCerts")}</OutlineLink>
        </>
      )}
    </div>
  );
}

/** the QR of the verify link, drawn from the server's rows of 0/1 */
export function QrCode({ rows, size = 120, color = "#0e221b", bg = "#ffffff" }: { rows: string[]; size?: number; color?: string; bg?: string }) {
  const n = rows.length;
  if (!n) return null;
  const q = 2;
  let d = "";
  rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === "1") d += `M${x + q} ${y + q}h1v1h-1z`; });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n + 2 * q} ${n + 2 * q}`} role="img" aria-label="QR" shapeRendering="crispEdges">
      <rect x={0} y={0} width={n + 2 * q} height={n + 2 * q} fill={bg} />
      <path d={d} fill={color} />
    </svg>
  );
}

/** a verifiable certificate: holder, course, date, status, code and QR to /verify/<code> */
export function VerifiedCertCard({ cert }: { cert: MyCertificate }) {
  const et = useExamT();
  const { lang } = useLang();
  const date = new Date(cert.issuedAt).toLocaleDateString(intlLocale(lang), { year: "numeric", month: "long", day: "numeric" });
  const tone = cert.status === "valid" ? "text-[rgb(140,230,195)] border-[rgb(140,230,195)]" : cert.status === "pending" ? "text-[#f4ead2] border-[#f4ead2]" : "text-[rgb(245,180,180)] border-[rgb(245,180,180)]";
  return (
    <article className="stage girih relative overflow-hidden rounded-2xl border-[1.5px] border-[rgb(var(--gold))] p-6 text-center text-[#eef0f3]">
      <span aria-hidden className="illum-frame" />
      <div className="relative grid justify-items-center gap-2">
        <StarGlyph size={16} className="text-[rgb(var(--gold))]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))] rtl:tracking-normal">Quran Masterclass</p>
        <p lang="ar" className="font-arabic text-[22px] text-[rgb(var(--gold))]">شهادة</p>
        {cert.holder && <p className="font-display text-2xl">{cert.holder}</p>}
        <p className="font-display text-[19px] leading-snug text-[#f4ead2]">{cert.title}</p>
        <p className="text-[13.5px] text-white/70">{`${cert.pct} % · ${et("issued", { date })}`}</p>
        <span className={`rounded-full border px-3 py-0.5 text-[12.5px] font-bold ${tone}`}>{et(`status_${cert.status}` as "status_valid")}</span>
        <div className="mt-2 flex items-center gap-4 text-start">
          <span className="overflow-hidden rounded-md"><QrCode rows={cert.qr} size={96} /></span>
          <span className="grid gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal">{et("code")}</span>
            <Link href={`/verify/${cert.code}`} className="select-all text-base font-bold tracking-wider hover:underline">{cert.code}</Link>
            <span className="text-[11px] leading-snug text-white/55">{et("verifyAt")}</span>
          </span>
        </div>
        <p className="mt-1.5 max-w-sm text-[10.5px] leading-snug text-white/55">{et("ijazahNote")}</p>
      </div>
    </article>
  );
}

let cache: { lang: string; list: MyCertificate[] } | null = null;
export function useMyCertificates() {
  const { user, ready } = useAuth();
  const { lang } = useLang();
  const [list, setList] = useState<MyCertificate[] | null>(cache?.lang === lang ? cache.list : null);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    if (!ready) return;
    if (!user) { setList([]); return; }
    try { const l = await fetchMyCertificates(lang); cache = { lang, list: l }; setList(l); setError(false); } catch { setError(true); setList((x) => x ?? []); }
  }, [user, ready, lang]);
  useEffect(() => { void load(); }, [load]);
  return { list, error, reload: load, signedIn: !!user, ready };
}

/** "My certificates": the verifiable certificates kept on the server (code, QR, status) */
export function MyCertificates() {
  const et = useExamT();
  const { list, error, signedIn, ready } = useMyCertificates();
  const [copied, setCopied] = useState<string | null>(null);
  if (!ready) return <Spinner label={et("loading")} />;
  if (!signedIn) return (
    <div className="grid gap-3">
      <p className="text-[15px] leading-relaxed">{et("signInForCert")}</p>
      <OutlineLink href="/account" className="w-fit">{et("signIn")}</OutlineLink>
    </div>
  );
  if (list === null) return <Spinner label={et("loading")} />;
  if (!list.length) return <p className="text-[15px] text-muted">{error ? et("sendError") : et("noCerts")}</p>;
  const share = async (c: MyCertificate) => {
    const text = `${c.title} · ${c.code} · ${c.url}`;
    try {
      if (navigator.share) await navigator.share({ title: c.title, text, url: c.url });
      else { await navigator.clipboard.writeText(text); setCopied(c.code); }
    } catch { /* closed */ }
  };
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {list.map((c) => (
        <div key={c.code} className="grid content-start gap-2.5">
          <VerifiedCertCard cert={c} />
          {c.note && c.status === "rejected" && <p className="text-[13.5px] text-muted">{et("reviewNote", { note: c.note })}</p>}
          {c.status === "valid" && <OutlineButton onClick={() => void share(c)} className="w-fit">{copied === c.code ? "✓" : et("share")}</OutlineButton>}
        </div>
      ))}
    </div>
  );
}

/** under a certificate earned on this device: the verifiable one for the course, or how to get it */
export function VerifiedCertLink({ course, certificatesHref = "/school/certificates" }: { course: string; certificatesHref?: string }) {
  const et = useExamT();
  const { list, signedIn } = useMyCertificates();
  const c = list?.find((x) => x.course === course);
  return (
    <Link href={signedIn ? certificatesHref : "/account"} className={`flex items-center gap-3 rounded-lg border bg-surface p-3 transition hover:bg-[rgb(var(--hm-gold))]/[0.05] ${c?.status === "valid" ? "border-accent" : "border-line"}`}>
      <StarGlyph size={14} className={c?.status === "valid" ? "text-accent" : "text-[rgb(var(--hm-gold))]"} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{c ? `${et(`status_${c.status}` as "status_valid")} · ${c.code}` : et("deviceOnly")}</span>
        {!c && <span className="block text-[12.5px] leading-snug text-muted">{signedIn ? et("getVerified") : et("signInForCert")}</span>}
      </span>
      <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>
    </Link>
  );
}
