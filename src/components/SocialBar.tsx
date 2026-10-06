"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CaptchaNotice } from "./CaptchaBox";
import { captchaToken, warmCaptcha } from "@/lib/captchaClient";
import AuthGate from "./AuthGate";
import { IconComment, IconEye, IconFlag, IconHeart, IconShare } from "./Icons";

type Stats = { views: number; shares: number; likes: number; comments: number; liked: boolean; signedIn?: boolean; verified?: boolean };
type Comment = { id: number; parentId: number | null; body: string; pending: boolean; mine: boolean; author: string; country: string | null; at: string };

const post = (action: string, body: unknown) =>
  fetch(`/api/social/${action}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

// Likes, comments (moderated), shares and views for one verse
export default function SocialBar({ verseKey, shareUrl, shareText, trackView = true }: { verseKey: string; shareUrl?: string; shareText?: string; trackView?: boolean }) {
  const t = useTranslations("social");
  const locale = useLocale();
  const n = (x: number) => new Intl.NumberFormat(locale, { notation: "compact", numberingSystem: "latn" }).format(x);
  const [s, setS] = useState<Stats>({ views: 0, shares: 0, likes: 0, comments: 0, liked: false });
  const [gate, setGate] = useState<"register" | "verify" | null>(null);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const viewed = useRef("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (trackView && viewed.current !== verseKey) { viewed.current = verseKey; await post("view", { key: verseKey }); }
        const r = await fetch(`/api/social/stats?key=${verseKey}`);
        if (r.ok && live) setS(await r.json());
      } catch { /* stats are optional */ }
    })();
    return () => { live = false; };
  }, [verseKey, trackView]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const needAuth = (status: number) => { if (status === 401) { setGate("register"); return true; } if (status === 403) { setGate("verify"); return true; } return false; };

  const like = async () => {
    const r = await post("like", { key: verseKey });
    if (needAuth(r.status)) return;
    if (r.ok) setS(await r.json());
  };
  const share = async () => {
    const url = shareUrl ?? `${location.origin}/${locale}/surah/${verseKey.split(":")[0]}?v=${verseKey.split(":")[1]}`;
    try {
      if (navigator.share) await navigator.share({ title: `Quran ${verseKey}`, text: shareText, url });
      else { await navigator.clipboard.writeText(url); flash(t("copied")); }
      const r = await post("share", { key: verseKey });
      if (r.ok) setS(await r.json());
    } catch { /* cancelled */ }
  };

  const btn = "inline-flex h-10 items-center gap-1.5 rounded-md border border-line px-3 text-[13px] font-semibold text-muted transition hover:border-ink hover:text-ink";
  return (
    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap items-center gap-2">
        <button className={`${btn} ${s.liked ? "!border-accent !text-accent" : ""}`} onClick={like} aria-pressed={s.liked} aria-label={t("like")}><IconHeart filled={s.liked} />{n(s.likes)}</button>
        <button className={btn} onClick={() => setOpen(true)} aria-label={t("comments")}><IconComment />{n(s.comments)}</button>
        <button className={btn} onClick={share} aria-label={t("share")}><IconShare />{n(s.shares)}</button>
        <span className="ms-auto inline-flex items-center gap-1.5 text-[13px] text-muted" title={t("views")}><IconEye />{n(s.views)}</span>
      </div>
      {toast && <p role="status" className="mt-2 text-xs text-muted">{toast}</p>}
      {open && <CommentsSheet verseKey={verseKey} signedIn={!!s.signedIn} onClose={() => setOpen(false)} onAuth={(st) => needAuth(st)} onCount={(c) => setS((x) => ({ ...x, comments: c }))} />}
      {gate && <AuthGate mode={gate} onClose={() => setGate(null)} />}
    </div>
  );
}

function CommentsSheet({ verseKey, onClose, onAuth, onCount }: { verseKey: string; signedIn: boolean; onClose: () => void; onAuth: (status: number) => boolean; onCount: (n: number) => void }) {
  const t = useTranslations("social");
  const tt = useTranslations("trust");
  const locale = useLocale();
  const [list, setList] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [reply, setReply] = useState<Comment | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/social/comments?key=${verseKey}`);
    if (r.ok) { const d = (await r.json()) as { comments: Comment[] }; setList(d.comments); onCount(d.comments.filter((c) => !c.pending).length); } else setList([]);
  }, [verseKey, onCount]);
  useEffect(() => { load(); warmCaptcha(); }, [load]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);

  const send = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await post("comment", { key: verseKey, body: text, parentId: reply?.id, captcha: await captchaToken("comment") });
      if (onAuth(r.status)) { onClose(); return; }
      const d = await r.json().catch(() => ({}));
      if (r.ok) { setText(""); setReply(null); setMsg({ kind: "ok", text: d.pending ? t("pendingNote") : t("posted") }); load(); }
      else if (r.status === 422) setMsg({ kind: "err", text: t(`rej_${d.reason}`) });
      else if (r.status === 429) setMsg({ kind: "err", text: t("rate") });
      else if (r.status === 403 && d.error === "banned") setMsg({ kind: "err", text: t("banned") });
      else if (r.status === 409) setMsg({ kind: "err", text: t("duplicate") });
      else if (d.error === "captcha") setMsg({ kind: "err", text: tt("captchaFailed") });
      else setMsg({ kind: "err", text: t("error") });
    } finally { setBusy(false); }
  };
  const report = async (c: Comment) => { const r = await post("report", { id: c.id }); if (onAuth(r.status)) { onClose(); return; } setMsg({ kind: "ok", text: t("reported") }); };
  const del = async (c: Comment) => { await post("delete", { id: c.id }); load(); };

  const roots = (list ?? []).filter((c) => !c.parentId);
  const Item = ({ c, child }: { c: Comment; child?: boolean }) => (
    <li className={`${child ? "ms-6 border-s border-line ps-4" : ""} py-3`}>
      <div className="flex items-center gap-2 text-[13px]">
        <span className="font-semibold">{c.author}</span>
        {c.country && <span className="text-muted">· {c.country}</span>}
        <span className="text-muted">· {new Date(c.at).toLocaleDateString(locale, { numberingSystem: "latn", day: "numeric", month: "short" })}</span>
        {c.pending && <span className="rounded-sm bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold text-accent">{t("pending")}</span>}
      </div>
      <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed">{c.body}</p>
      <div className="mt-1 flex gap-4 text-xs text-muted">
        {!child && !c.pending && <button className="hover:text-ink" onClick={() => setReply(c)}>{t("reply")}</button>}
        {c.mine ? <button className="hover:text-ink" onClick={() => del(c)}>{t("delete")}</button> : <button className="inline-flex items-center gap-1 hover:text-ink" onClick={() => report(c)}><IconFlag />{t("report")}</button>}
      </div>
    </li>
  );

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-ink/50 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true" aria-label={t("comments")} onClick={onClose}>
      <div className="flex max-h-[88dvh] w-full flex-col rounded-t-2xl bg-surface shadow-xl sm:max-w-lg sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl">{t("comments")} · {verseKey}</h2>
          <button onClick={onClose} className="text-sm text-muted hover:text-ink">{t("close")}</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          <p className="py-3 text-xs leading-relaxed text-muted">{t("rules")}</p>
          {list === null ? <p className="py-6 text-sm text-muted">…</p> : roots.length === 0 ? <p className="py-6 text-sm text-muted">{t("none")}</p> : (
            <ul className="divide-y divide-line">
              {roots.map((c) => (
                <div key={c.id}>
                  <Item c={c} />
                  {(list ?? []).filter((x) => x.parentId === c.id).map((x) => <Item key={x.id} c={x} child />)}
                </div>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-line p-4">
          {reply && <p className="mb-2 flex items-center justify-between text-xs text-muted"><span>{t("replyTo", { name: reply.author })}</span><button onClick={() => setReply(null)} className="hover:text-ink">✕</button></p>}
          <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={3} placeholder={t("placeholder")} className="w-full resize-none rounded-md border border-line bg-bg px-3 py-2 text-[15px] focus:border-ink focus:outline-none" />
          <CaptchaNotice />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-muted">{text.length}/500</span>
            <button disabled={busy || text.trim().length < 2} onClick={send} className="h-10 rounded-md bg-ink px-5 text-sm font-bold text-bg disabled:opacity-40">{t("send")}</button>
          </div>
          {msg && <p role="status" className={`mt-2 text-sm ${msg.kind === "err" ? "text-red-600" : "text-accent"}`}>{msg.text}</p>}
        </div>
      </div>
    </div>
  );
}
