"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Markdown from "@/components/Markdown";
import { readTradition } from "@/lib/learn/tradition";
import TutorAvatar from "./TutorAvatar";
import TutorAvatarHidaya from "./TutorAvatarHidaya";
import { readJSON, writeJSON } from "@/lib/storage";
import { BUBBLE_KEY, bubbleSetting, addMemory, appChips, coachFacts, fillNext, goalIn, memoryForServer, nextUi, removeMemory, type MemoryState } from "@/lib/tutor/next";
import { useCoachInput } from "./coach";
import { readMemory, saveMemory } from "./memory";
import { useDictation, useSpeak } from "./voice";
import {
  clearChat, giveConsent, hasConsent, readChat, readPrefs, saveAddress, saveChat, savePersona, useTutor, useTutorProgress, withdrawConsent,
  type ChatMsg, type Consent, type Persona, type TutorContext,
} from "./state";

// Dalil / Hidaya on the website – the same tutor, texts and server route as the app (mobile/src/features/tutor/*).
// The conversation stays in this browser; the consent comes before the first question; every answer shows its sources,
// Quran and hadith from their sources, a report button and the note that AI can make mistakes.

type Status = { enabled: boolean; quota: { limit: number; left: number; pro: boolean; signedIn: boolean } };
type Err = "offline" | "off" | "busy" | "limit" | "pro" | "login" | "verify" | "consent" | "age" | "rate" | "error";

// a slow, small nod while the tutor is thinking; only with prefers-reduced-motion: no-preference (app: Face.tsx)
const NOD = "@media (prefers-reduced-motion: no-preference){.tutor-nod{animation:tutor-nod 2.6s ease-in-out infinite;transform-origin:50% 85%}}@keyframes tutor-nod{0%,55%,100%{transform:translateY(0) rotate(0)}18%{transform:translateY(1.6px) rotate(1.5deg)}32%{transform:translateY(0) rotate(0)}44%{transform:translateY(1px) rotate(1deg)}}";
export function TutorFace({ persona, size = 40, speaking, still, thinking }: { persona: Persona; size?: number; speaking?: boolean; still?: boolean; thinking?: boolean }) {
  const art = persona === "hidaya" ? <TutorAvatarHidaya size={size} speaking={speaking} still={still} /> : <TutorAvatar size={size} speaking={speaking} still={still} />;
  const face = <span className="relative inline-flex" style={{ width: size, height: size }}>{art}<FaceSheen size={size} /></span>;
  if (!thinking) return face;
  return <span className="tutor-nod inline-flex"><style>{NOD}</style>{face}</span>;
}

/** the premium finish over both portraits (same geometry as the app's Face.tsx Sheen): a soft rim light from the
 *  upper left, and a gentle vignette */
function FaceSheen({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden className="pointer-events-none absolute inset-0">
      <defs>
        <radialGradient id="tutor-sheen-v" cx="50%" cy="45%" r="55%"><stop offset="0.72" stopColor="#04201a" stopOpacity="0" /><stop offset="1" stopColor="#04201a" stopOpacity="0.28" /></radialGradient>
        <linearGradient id="tutor-sheen-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff6dc" stopOpacity="0.55" /><stop offset="0.45" stopColor="#fff6dc" stopOpacity="0" /></linearGradient>
      </defs>
      <circle cx="100" cy="100" r="94" fill="url(#tutor-sheen-v)" />
      <path d="M22 100A78 78 0 0 1 100 22" fill="none" stroke="url(#tutor-sheen-rim)" strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
}

const glass = "border border-[rgb(var(--gold)/0.35)] bg-[rgb(var(--surface)/0.72)] backdrop-blur-xl shadow-[0_8px_30px_rgba(6,40,30,0.08)]";
const pill = "inline-flex items-center gap-2 rounded-full border border-line bg-[rgb(var(--surface)/0.7)] px-4 py-2 text-sm font-semibold backdrop-blur-md transition hover:border-[rgb(var(--gold))] active:scale-[0.98]";

export default function TutorChat({ context, initial }: { context?: TutorContext | null; initial?: string }) {
  const locale = useLocale();
  const { ui, f, persona, name, address, prefs } = useTutor();
  const progress = useTutorProgress();
  const [mounted, setMounted] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [net, setNet] = useState<"loading" | "ok" | "offline">("loading");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<Err | null>(null);
  const [settings, setSettings] = useState(false);
  const asked = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  const consented = mounted && hasConsent(prefs);
  const nx = nextUi(locale);
  const coach = useCoachInput();
  const [memory, setMemory] = useState<MemoryState | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [typing, setTyping] = useState(0);
  const dictation = useDictation(locale, (t) => setText(t));
  const updateMemory = (m: MemoryState) => { saveMemory(m); setMemory(m); };

  useEffect(() => { setMounted(true); setMsgs(readChat()); setMemory(readMemory()); }, []);
  // a calm typing state: the answer is checked against its sources before it is shown, so it cannot stream
  useEffect(() => {
    if (!busy) { setTyping(0); return; }
    const id = setInterval(() => setTyping((n) => Math.min(n + 1, 2)), 2600);
    return () => clearInterval(id);
  }, [busy]);
  const thinkingText = fillNext(nx.typing[typing], { name });
  const check = useCallback(() => {
    setNet("loading");
    fetch("/api/assistant").then((r) => r.json()).then((s: Status) => { setStatus(s); setNet("ok"); }).catch(() => setNet("offline"));
  }, []);
  useEffect(check, [check]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);

  const send = useCallback(async (q: string, ctx: TutorContext | null = null) => {
    const question = q.trim();
    const p = readPrefs();
    if (!question || busy || !p.consent || !hasConsent(p)) return;
    const before = readChat();
    const next: ChatMsg[] = [...before, { role: "user", content: question, at: Date.now() }];
    setMsgs(next); saveChat(next); setText(""); setBusy(true); setErr(null);
    if (dictation.listening) dictation.stop();
    const g = goalIn(question);
    const mem = readMemory();
    setGoal(g && !mem.items.some((x) => x.text.toLowerCase() === g.toLowerCase()) ? g : null);
    const t = readTradition();
    try {
      const r = await fetch("/api/assistant", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          v: 2, question, locale, context: ctx, address, persona, tradition: t === "sunni" || t === "shia" ? t : "all",
          consent: { v: p.consent.v, age: p.consent.age }, progress: { ...(progress ?? {}), ...(coach ? coachFacts(coach) : {}) },
          memory: memoryForServer(mem),
          history: before.filter((m) => !m.local).slice(-6).map((m) => ({ role: m.role, content: m.content.slice(0, 600) })),
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        const c = String(d.error ?? "");
        setErr(r.status === 402 || c === "pro" ? "pro" : r.status === 428 ? "consent" : c === "age" ? "age" : c === "verify" ? "verify" : r.status === 401 || c === "login" ? "login" : c === "limit" ? "limit" : c === "rate" ? "rate" : c === "off" ? "off" : r.status === 503 ? "busy" : "error");
        return;
      }
      const all: ChatMsg[] = [...next, { role: "assistant", content: d.answer, at: Date.now(), id: d.id, status: d.status, notice: d.notice, sources: d.sources, related: d.related, followups: d.followups, scripture: d.scripture, persona }];
      setMsgs(all); saveChat(all);
      setStatus((s) => (s ? { ...s, quota: { ...s.quota, ...d.quota } } : s));
    } catch { setErr("offline"); } finally { setBusy(false); }
  }, [busy, locale, address, persona, progress, coach, dictation]);

  useEffect(() => {
    if (asked.current || !initial || net !== "ok" || !status?.enabled || !consented) return;
    asked.current = true;
    void send(initial, context ?? null);
  }, [initial, context, net, status, consented, send]);

  const errorText = err === "pro" || err === "login" ? (status?.quota.signedIn ? ui.limitFree : ui.login) : err === "limit" ? ui.limitPro : err === "verify" ? ui.verify
    : err === "busy" || err === "rate" ? ui.busy : err === "off" ? ui.off : err === "offline" ? ui.offline : err === "consent" ? ui.consentNeeded : err === "age" ? ui.age : err ? ui.err : "";
  const lastQ = (i: number) => { for (let j = i - 1; j >= 0; j--) if (msgs[j].role === "user") return msgs[j].content; return undefined; };
  const left = status?.quota.left;

  return (
    <div className="flex min-h-[70dvh] flex-col overflow-hidden rounded-[28px] border border-line bg-[rgb(var(--bg))]">
      <header className={`sticky top-0 z-10 flex items-center gap-3 px-4 py-3 ${glass} rounded-none border-x-0 border-t-0`}>
        <TutorFace persona={persona} size={44} speaking={busy} thinking={busy} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-lg font-semibold">{name}<span className="rounded-full border border-[rgb(var(--gold)/0.7)] px-2 text-[10.5px] font-bold tracking-wider text-[rgb(var(--gold))]">{ui.ai}</span></p>
          <p className="truncate text-[12.5px] text-muted">{busy ? thinkingText : context?.title ?? f(ui.title)}</p>
        </div>
        <button type="button" onClick={() => setSettings((v) => !v)} aria-expanded={settings} className={pill}>{ui.tutor}</button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        {settings && mounted ? (
          <section className={`rounded-3xl p-5 ${glass}`}>
            <p className="font-semibold">{f(ui.address)}</p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup">
              {(["brother", "sister", null] as const).map((g) => (
                <button key={String(g)} type="button" role="radio" aria-checked={address === g} onClick={() => saveAddress(g)}
                  className={`${pill} ${address === g ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold)/0.12)]" : ""}`}>{g === "brother" ? ui.brother : g === "sister" ? ui.sister : ui.none}</button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">{ui.addressNote}</p>
            {address === "sister" ? (
              <>
                <p className="mt-4 font-semibold">{ui.tutor}</p>
                <div className="mt-2 grid grid-cols-2 gap-3" role="radiogroup">
                  {(["hidaya", "dalil"] as Persona[]).map((p) => (
                    <button key={p} type="button" role="radio" aria-checked={persona === p} onClick={() => savePersona(p)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-3 ${persona === p ? "border-2 border-[rgb(var(--gold))] bg-[rgb(var(--gold)/0.08)]" : "border-line"}`}>
                      <TutorFace persona={p} size={64} still={persona !== p} /><span className="font-semibold">{p === "hidaya" ? "Hidaya" : "Dalil"}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">{ui.sisterOnly}</p>
              </>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {msgs.length ? <button type="button" className={pill} onClick={() => { if (confirm(ui.clearAsk)) { clearChat(); setMsgs([]); setErr(null); } }}>{ui.clear}</button> : null}
              {hasConsent(prefs) ? <button type="button" className={pill} onClick={() => { if (confirm(ui.withdraw)) { withdrawConsent(); clearChat(); setMsgs([]); } }}>{ui.withdraw}</button> : null}
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-3 text-[14px]">
              <input type="checkbox" defaultChecked={readJSON<{ hidden?: boolean }>(BUBBLE_KEY, {}).hidden !== true} onChange={(e) => writeJSON(BUBBLE_KEY, { hidden: !e.target.checked }, true)} className="h-5 w-5 accent-[rgb(var(--gold))]" />
              {bubbleSetting(locale)}
            </label>
            {memory ? <MemoryPanel m={memory} onChange={updateMemory} /> : null}
          </section>
        ) : null}

        {mounted && !consented ? <ConsentBox onDone={() => setErr(null)} /> : null}

        {consented && msgs.length === 0 ? (
          <>
            <div className="flex flex-col items-center gap-3 pt-2 text-center">
              <TutorFace persona={persona} size={132} />
              <p className="max-w-md text-[15px] leading-relaxed text-muted">{f(ui.lead)}</p>
            </div>
            <section className={`rounded-3xl p-5 ${glass}`}>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))]">{ui.todayTitle}</p>
              <TodayLines />
              <button type="button" className={`${pill} mt-3`} onClick={() => void send(ui.todayAsk, { kind: "progress", title: ui.todayTitle })}>{ui.todayAsk}</button>
            </section>
            <div className="flex flex-wrap gap-2">{ui.sugg.map((s) => <button key={s} type="button" className={pill} onClick={() => void send(s, context ?? null)}>{s}</button>)}</div>
          </>
        ) : null}

        {msgs.map((m, i) => m.role === "user" ? (
          <div key={i} className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-se-md bg-accent px-4 py-3 text-[15px] text-white">{m.content}</div></div>
        ) : (
          <div key={i} className="flex gap-3">
            <div className="shrink-0"><TutorFace persona={m.persona ?? persona} size={34} still /></div>
            <AnswerView m={m} id={`${i}`} question={lastQ(i)} onFollow={(q) => void send(q, null)} />
          </div>
        ))}
        {busy ? <p role="status" aria-live="polite" className="flex items-center gap-3 ps-12 text-sm text-muted"><TutorFace persona={persona} size={28} speaking thinking />{thinkingText}</p> : null}
        {goal && !busy && memory ? (
          <div className="ms-12 flex flex-wrap items-center gap-2 rounded-2xl border border-[rgb(var(--gold)/0.45)] p-3 text-sm">
            <span>{fillNext(nx.memSuggest, { name })} <em className="not-italic font-semibold">{goal}</em></span>
            <button type="button" className={pill} onClick={() => { updateMemory(addMemory(readMemory(), goal)); setGoal(null); }}>{nx.memSave}</button>
            <button type="button" className="text-muted hover:text-ink" onClick={() => setGoal(null)}>{ui.later}</button>
          </div>
        ) : null}
        {err ? (
          <div role="alert" className="ms-12 rounded-2xl border border-[rgb(var(--gold)/0.45)] bg-[rgb(var(--gold)/0.06)] p-4 text-sm">
            <p>{f(errorText)}</p>
            {(err === "login" || err === "pro") && !status?.quota.signedIn ? <Link href="/account" className="btn-gold mt-3 inline-flex h-10 items-center rounded-full px-4 text-[13px] font-bold">{ui.signIn}</Link> : null}
            {err === "offline" || err === "busy" || err === "error" ? <button type="button" className={`${pill} mt-3`} onClick={() => { setErr(null); check(); }}>{ui.retry}</button> : null}
          </div>
        ) : null}
        {net === "offline" && !err ? <p className="text-sm text-muted">{f(ui.offline)}</p> : null}
        {net === "ok" && status && !status.enabled ? <p className="text-sm text-muted">{f(ui.off)}</p> : null}
        <div ref={end} />
      </div>

      {consented ? (
        <form onSubmit={(e) => { e.preventDefault(); void send(text, context ?? null); }} className="p-3 sm:p-4">
          <div className={`flex items-end gap-2 rounded-[26px] p-1.5 ${glass}`}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(text, context ?? null); } }}
              maxLength={800} rows={1} placeholder={dictation.listening ? nx.listening : ui.ph} aria-label={ui.ph} className="min-h-[44px] min-w-0 flex-1 resize-none bg-transparent px-3 py-2.5 text-[16px] outline-none" />
            {dictation.can ? (
              <button type="button" onClick={() => (dictation.listening ? dictation.stop() : dictation.start())} aria-pressed={dictation.listening} aria-label={dictation.listening ? nx.stop : nx.speakAsk} title={nx.voiceNote}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${dictation.listening ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold)/0.18)]" : "border-line"}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
              </button>
            ) : null}
            <button disabled={busy || text.trim().length < 2 || net !== "ok" || !status?.enabled} aria-label={ui.send} className="btn-gold grid h-11 w-11 shrink-0 place-items-center rounded-full font-bold disabled:opacity-40">→</button>
          </div>
          <p className="mt-2 text-[11.5px] leading-snug text-muted">
            {typeof left === "number" ? <span className="font-semibold text-[rgb(var(--gold))]">{left === 1 ? ui.leftOne : f(ui.left, { n: left })} · </span> : null}
            {f(ui.note)}
          </p>
        </form>
      ) : null}
    </div>
  );

  function TodayLines() {
    const p = progress;
    const lines: string[] = [];
    if (p?.milestone) lines.push(`${ui.mashaAllah} ${p.milestone}`);
    if (p?.streak) lines.push(p.streak === 1 ? ui.streakOne : f(ui.streak, { n: p.streak }));
    if (p?.versesMemorised) lines.push(f(ui.verses, { n: p.versesMemorised }));
    if (p?.weakestDim && typeof p.weakestPct === "number") lines.push(f(ui.weakest, { dim: ui.dims[p.weakestDim], n: p.weakestPct }));
    if ((p?.todayNew ?? 0) + (p?.todayReview ?? 0) > 0) lines.push(f(ui.today, { a: p?.todayNew ?? 0, b: p?.todayReview ?? 0 }));
    return <div className="mt-2 space-y-0.5 text-[15px] leading-relaxed">{lines.length ? lines.map((l) => <p key={l}>{l}</p>) : <p>{f(ui.noData)}</p>}</div>;
  }

}

/** what the tutor remembers: only items the learner added or confirmed; on this device, synced only when allowed */
function MemoryPanel({ m, onChange }: { m: MemoryState; onChange: (m: MemoryState) => void }) {
  const locale = useLocale();
  const nx = nextUi(locale);
  const { name } = useTutor();
  const [draft, setDraft] = useState("");
  const toggle = (label: string, on: boolean, set: (v: boolean) => void) => (
    <label className="flex cursor-pointer items-center gap-3 text-[14px]"><input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="h-5 w-5 accent-[rgb(var(--gold))]" />{label}</label>
  );
  return (
    <div className="mt-5 border-t border-line pt-4">
      <p className="font-semibold">{fillNext(nx.memTitle, { name })}</p>
      <p className="mt-1 text-xs text-muted">{nx.memLead}</p>
      {m.items.length ? (
        <ul className="mt-3 grid gap-2">{m.items.map((x) => (
          <li key={x.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-3 py-2 text-[14px]">
            <span className="min-w-0 break-words">{x.text}</span>
            <button type="button" onClick={() => onChange(removeMemory(m, x.id))} className="shrink-0 text-[12.5px] text-muted hover:text-ink">{nx.memDelete}</button>
          </li>
        ))}</ul>
      ) : <p className="mt-3 text-sm text-muted">{nx.memEmpty}</p>}
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const n = addMemory(m, draft); if (n !== m) { onChange(n); setDraft(""); } }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={120} placeholder={nx.memPh} aria-label={nx.memPh} className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2 text-[15px] outline-none focus:border-[rgb(var(--gold))]" />
        <button type="submit" disabled={draft.trim().length < 3} className={`${pill} disabled:opacity-40`}>{nx.memAdd}</button>
      </form>
      <div className="mt-3 grid gap-2">
        {toggle(nx.memUse, m.use, (v) => onChange({ ...m, use: v }))}
        {toggle(nx.memSync, m.sync, (v) => onChange({ ...m, sync: v }))}
      </div>
      {m.items.length ? <button type="button" className={`${pill} mt-3`} onClick={() => onChange({ ...m, items: [] })}>{nx.memDeleteAll}</button> : null}
    </div>
  );
}

function ConsentBox({ onDone }: { onDone: () => void }) {
  const { ui, f, persona } = useTutor();
  const [age, setAge] = useState<Consent["age"] | null>(null);
  return (
    <section className={`rounded-3xl p-5 ${glass}`} aria-labelledby="tutor-consent">
      <div className="mb-3 flex items-center gap-3"><TutorFace persona={persona} size={52} /><h2 id="tutor-consent" className="text-lg font-semibold">{f(ui.consentTitle)}</h2></div>
      <ul className="space-y-2 text-[14px] leading-relaxed">{ui.consentPoints.map((p) => <li key={p} className="flex gap-2"><span className="text-[rgb(var(--gold))]">✦</span><span>{f(p)}</span></li>)}</ul>
      <Link href="/legal/privacy" className="mt-3 inline-block text-sm font-semibold text-accent">{ui.privacy}</Link>
      <fieldset className="mt-4">
        <legend className="text-xs font-semibold uppercase tracking-wider text-muted">{ui.consentAge}</legend>
        {(["13plus", "parent"] as const).map((a) => (
          <label key={a} className="mt-2 flex cursor-pointer items-center gap-3 text-[14.5px]">
            <input type="radio" name="tutor-age" checked={age === a} onChange={() => setAge(a)} className="h-5 w-5 accent-[rgb(var(--gold))]" />{a === "13plus" ? ui.age13 : ui.ageParent}
          </label>
        ))}
      </fieldset>
      <button type="button" disabled={!age} onClick={() => { if (age) { giveConsent(age); onDone(); } }} className="btn-gold mt-5 h-11 w-full rounded-full text-sm font-bold disabled:opacity-40">{ui.agree}</button>
    </section>
  );
}

function AnswerView({ m, id, question, onFollow }: { m: ChatMsg; id: string; question?: string; onFollow: (q: string) => void }) {
  const locale = useLocale();
  const { ui } = useTutor();
  const nx = nextUi(locale);
  const voice = useSpeak(locale);
  const [copied, setCopied] = useState(false);
  const [report, setReport] = useState(false);
  const cites = m.sources?.length ? m.sources : m.related ?? [];
  const chips = appChips(cites, nx);
  const reading = voice.speaking === id;
  return (
    <div className="min-w-0 max-w-[88%] flex-1 space-y-3">
      <div className="rounded-3xl rounded-ss-md border border-line bg-surface px-4 py-1 [&>div>p:first-child]:mt-2">
        <Markdown text={m.content} />
        {m.notice ? <p className="mb-3 text-[13px] font-medium text-[rgb(var(--gold))]">{m.notice}</p> : null}
      </div>
      {m.scripture?.verses.map((v) => (
        <Link key={v.key} href={`/surah/${v.key.split(":")[0]}?v=${v.key.split(":")[1]}`} className={`block rounded-3xl p-4 ${glass}`}>
          <p dir="rtl" lang="ar" className="font-arabic text-[22px] leading-[2]">{v.arabic}</p>
          {v.translation ? <p className="mt-1 text-[14px] leading-relaxed">{v.translation}</p> : null}
          <p className="mt-2 text-xs font-semibold text-[rgb(var(--gold))]">{ui.quran} {v.key} · {v.chapter} · {nx.playVerse}</p>
        </Link>
      ))}
      {m.scripture?.hadith.map((h) => (
        <a key={h.id} href={h.url} target="_blank" rel="noreferrer" className={`block rounded-3xl p-4 ${glass}`}>
          {h.arabic ? <p dir="rtl" lang="ar" className="line-clamp-6 font-arabic text-[18px] leading-[1.9]">{h.arabic}</p> : null}
          {h.text ? <p className="mt-1 line-clamp-[8] text-[14px] leading-relaxed">{h.text}</p> : null}
          <p className="mt-2 text-xs font-semibold text-[rgb(var(--gold))]">{ui.hadith} · {h.reference}{h.grades?.[0] ? ` · ${h.grades[0].grade} (${h.grades[0].by})` : ""}</p>
        </a>
      ))}
      {cites.length ? (
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-muted">{m.sources?.length ? ui.sources : ui.related}</p>
          <ol className="mt-1 space-y-1">{cites.map((c) => <li key={`${c.n}${c.link}`} className="flex gap-2 text-[13.5px]"><span className="font-semibold text-[rgb(var(--gold))]">{c.n}</span><Link href={c.link} className="font-medium text-accent hover:underline">{c.title}</Link></li>)}</ol>
        </div>
      ) : null}
      {m.followups?.length || chips.length ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => <Link key={c.href} href={c.href} className={`${pill} border-[rgb(var(--gold)/0.6)]`}>{c.label}</Link>)}
          {m.followups?.map((q) => <button key={q} type="button" className={pill} onClick={() => onFollow(q)}>{q}</button>)}
        </div>
      ) : null}
      {!m.local ? (
        <div className="flex gap-4 text-[12.5px] text-muted">
          {voice.can && m.content ? <button type="button" onClick={() => voice.speak(id, m.content)} aria-pressed={reading} title={nx.voiceNote} className="hover:text-ink">{reading ? nx.stop : `${nx.listen} (${ui.ai})`}</button> : null}
          <button type="button" onClick={() => { void navigator.clipboard?.writeText(m.content); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="hover:text-ink">{copied ? ui.copied : ui.copy}</button>
          {m.id ? <button type="button" onClick={() => setReport((v) => !v)} className="hover:text-ink" aria-expanded={report}>⚑ {ui.report}</button> : null}
        </div>
      ) : null}
      {report && m.id ? <ReportBox m={m} question={question} locale={locale} onClose={() => setReport(false)} /> : null}
    </div>
  );
}

function ReportBox({ m, question, locale, onClose }: { m: ChatMsg; question?: string; locale: string; onClose: () => void }) {
  const { ui } = useTutor();
  const [reason, setReason] = useState<keyof typeof ui.reasons | null>(null);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "err">("idle");
  const send = async () => {
    if (!reason) return;
    setState("busy");
    const r = await fetch("/api/assistant/report", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: m.id, reason, note: note.trim() || undefined, question, answer: m.content, sources: (m.sources ?? []).map((s) => s.link), locale }) }).catch(() => null);
    if (r?.ok) { setState("done"); setTimeout(onClose, 1500); } else setState("err");
  };
  return (
    <div className={`rounded-3xl p-4 ${glass}`} role="dialog" aria-label={ui.reportTitle}>
      <p className="font-semibold">{ui.reportTitle}</p>
      {state === "done" ? <p className="mt-2 text-sm">{ui.reportThanks}</p> : (
        <>
          <div className="mt-2 flex flex-wrap gap-2">{(Object.keys(ui.reasons) as (keyof typeof ui.reasons)[]).map((k) => (
            <button key={k} type="button" onClick={() => setReason(k)} aria-pressed={reason === k} className={`${pill} ${reason === k ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold)/0.12)]" : ""}`}>{ui.reasons[k]}</button>
          ))}</div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} placeholder={ui.reportNote} className="mt-3 w-full rounded-2xl border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-[rgb(var(--gold))]" />
          {state === "err" ? <p className="text-sm text-red-600">{ui.err}</p> : null}
          <button type="button" disabled={!reason || state === "busy"} onClick={() => void send()} className="btn-gold mt-2 h-10 rounded-full px-5 text-sm font-bold disabled:opacity-40">{ui.reportSend}</button>
        </>
      )}
    </div>
  );
}
