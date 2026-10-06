"use client";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import AuthGate from "./AuthGate";
import { CaptchaNotice } from "./CaptchaBox";
import { captchaToken } from "@/lib/captchaClient";

type Post = { id: number; category: string; title: string; body: string; status: string; approved: boolean; created_at: string; author: string; country: string | null; votes: number; voted: boolean; mine: boolean };
const CATS = ["feature", "tafsir", "translation", "reciter", "bug", "content"] as const;
const STATUS_CLS: Record<string, string> = { review: "bg-line text-muted", planned: "bg-gold/15 text-gold", progress: "bg-accent-soft text-accent", done: "bg-accent text-white", declined: "bg-bg text-muted line-through" };

// Feedback board: requests (features, tafsir, translations, reciters, bugs) with votes and status
export default function FeedbackBoard() {
  const t = useTranslations("feedback");
  const tt = useTranslations("trust");
  const locale = useLocale();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [cat, setCat] = useState<string>("");
  const [sort, setSort] = useState<"top" | "new">("top");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "feature", title: "", body: "" });
  const [msg, setMsg] = useState("");
  const [gate, setGate] = useState<"register" | "verify" | null>(null);

  const load = useCallback(() => fetch(`/api/feedback?sort=${sort}${cat ? `&cat=${cat}` : ""}`, { cache: "no-store" }).then((r) => r.json()).then((d) => setPosts(d.posts ?? [])).catch(() => setPosts([])), [cat, sort]);
  useEffect(() => { load(); }, [load]);
  const post = (body: unknown) => fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const auth = (s: number) => (s === 401 ? (setGate("register"), true) : s === 403 ? (setGate("verify"), true) : false);
  const vote = async (id: number) => { const r = await post({ action: "vote", id }); if (!auth(r.status)) load(); };
  const submit = async () => {
    const r = await post({ ...form, captcha: await captchaToken("feedback") });
    if (auth(r.status)) return;
    if (r.ok) { setMsg(t("thanks")); setForm({ category: form.category, title: "", body: "" }); setOpen(false); load(); }
    else setMsg(r.status === 422 ? t("rejected") : r.status === 429 ? t("rate") : (await r.json().catch(() => ({}))).error === "captcha" ? tt("captchaFailed") : t("invalid"));
  };
  const chip = (on: boolean) => `h-9 shrink-0 rounded-md border px-3 text-sm font-semibold ${on ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-ink"}`;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <button className={chip(cat === "")} onClick={() => setCat("")}>{t("all")}</button>
          {CATS.map((c) => <button key={c} className={chip(cat === c)} onClick={() => setCat(c)}>{t(`c_${c}`)}</button>)}
        </div>
        <div className="flex items-center gap-2">
          <select value={sort} onChange={(e) => setSort(e.target.value as "top" | "new")} className="h-10 rounded-md border border-line bg-surface px-2 text-sm" aria-label={t("sort")}>
            <option value="top">{t("top")}</option><option value="new">{t("newest")}</option>
          </select>
          <button onClick={() => setOpen((o) => !o)} className="h-10 rounded-md bg-accent px-4 text-sm font-bold text-white">{t("new")}</button>
        </div>
      </div>
      {msg && <p role="status" className="mt-3 rounded-md bg-accent-soft p-3 text-sm">{msg}</p>}
      {open && (
        <div className="mt-4 grid gap-3 rounded-lg border border-line bg-surface p-5">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-11 rounded-md border border-line bg-bg px-3 text-[15px]">
            {CATS.map((c) => <option key={c} value={c}>{t(`c_${c}`)}</option>)}
          </select>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} placeholder={t("titlePh")} className="h-11 rounded-md border border-line bg-bg px-3 text-[15px]" />
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} maxLength={1500} rows={4} placeholder={t("bodyPh")} className="rounded-md border border-line bg-bg p-3 text-[15px]" />
          <CaptchaNotice />
          <div className="flex items-center justify-between gap-3"><p className="text-xs text-muted">{t("reviewNote")}</p><button disabled={form.title.trim().length < 6} onClick={submit} className="h-11 rounded-md bg-ink px-5 text-sm font-bold text-bg disabled:opacity-40">{t("send")}</button></div>
        </div>
      )}
      {posts === null ? <div className="mt-6 h-40 animate-pulse rounded-lg bg-line/40" /> : posts.length === 0 ? <p className="mt-8 text-muted">{t("empty")}</p> : (
        <ul className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line">
          {posts.map((p) => (
            <li key={p.id} className="flex gap-4 bg-surface p-5">
              <button onClick={() => vote(p.id)} disabled={!p.approved} aria-pressed={p.voted} aria-label={t("vote")} className={`flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-md border text-sm font-bold tabular-nums ${p.voted ? "border-accent bg-accent-soft text-accent" : "border-line hover:border-ink"}`}>
                <span aria-hidden>▲</span>{p.votes}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold uppercase tracking-[0.1em] text-gold">{t(`c_${p.category}`)}</span>
                  <span className={`rounded-sm px-1.5 py-0.5 font-semibold ${STATUS_CLS[p.status]}`}>{t(`s_${p.status}`)}</span>
                  {!p.approved && <span className="rounded-sm bg-bg px-1.5 py-0.5 text-muted">{t("pending")}</span>}
                </div>
                <h3 className="mt-1 text-[16px] font-bold leading-snug">{p.title}</h3>
                {p.body && <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-muted">{p.body}</p>}
                <p className="mt-2 text-xs text-muted">{p.author}{p.country ? ` · ${p.country}` : ""} · {new Date(p.created_at).toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {gate && <AuthGate mode={gate} onClose={() => setGate(null)} />}
    </div>
  );
}
