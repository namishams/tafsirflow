"use client";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { readJSON, writeJSON } from "@/lib/learn/store";
import { APP_LINK, CARD_SIZE, PALETTES, PALETTE_IDS, paletteFor, type PaletteId, type ShareFormat, type ShareOpts, type ShareSpec, type Sharer } from "@/lib/share/formats";
import { previewShareImage, renderShareImage } from "@/lib/share/render";

// The web version of the app's share sheet (mobile/src/features/feed/share.tsx): the image exactly as it will be shared,
// the format (story 9:16, portrait 4:5, square 1:1), the five designs, an optional "shared by @username", one gold
// "Share as story" button, link targets, copy link, save image and the system share sheet. The image is drawn in the
// browser (lib/share/render.ts): a 540 px preview while the settings change, the 1080 px PNG when it is shared.

const SHOW_NAME_KEY = "qmc.share.show-name";
const FORMATS: { id: ShareFormat; glyph: [number, number]; name: string }[] = [
  { id: "story", glyph: [9, 16], name: "story" },
  { id: "post", glyph: [12, 15], name: "portrait" },
  { id: "square", glyph: [14, 14], name: "square" },
];
const GOLD = "rgb(214 180 108)";
const GOLD_SOFT = "rgb(214 180 108 / 0.35)";
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(214_180_108)]";

// ---------- the signed-in member (for "shared by") ----------
let sharerCache: Sharer | null | undefined;
/** the visitor's Quran Talents username and badge (read-only; null without a profile, cached for the page) */
async function loadSharer(): Promise<Sharer | null> {
  if (sharerCache !== undefined) return sharerCache;
  try {
    const r = await fetch("/api/community/me", { cache: "no-store", credentials: "same-origin" });
    if (r.status === 401 || r.status === 403) return (sharerCache = null);
    if (!r.ok) return null;
    const j = (await r.json()) as { profile?: { username?: string; badge?: string | null } | null };
    sharerCache = j.profile?.username ? { username: j.profile.username, badge: j.profile.badge ?? null } : null;
  } catch { return null; }
  return sharerCache;
}

// ---------- helpers ----------
/** a short, descriptive file name part from the post's seed ("2:255" → "2-255", "name:Ar-Rahman" → "name-ar-rahman") */
function slugOf(seed: string): string {
  const v = seed.match(/^(\d+):(\d+)$/);
  if (v) return `${v[1]}-${v[2]}`;
  return seed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "share";
}
function canShareFiles(file: File): boolean {
  try { return typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }); } catch { return false; }
}
const canShareText = () => typeof navigator.share === "function";

function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function copyText(text: string): Promise<void> {
  try { await navigator.clipboard.writeText(text); return; } catch { /* no clipboard permission: the fallback below */ }
  const before = document.activeElement as HTMLElement | null;
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:0;opacity:0;pointer-events:none";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  ta.remove();
  before?.focus?.();
  if (!ok) throw new Error("copy");
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [role="tab"], [role="switch"], [tabindex]:not([tabindex="-1"])';
const focusables = (root: HTMLElement | null): HTMLElement[] => (root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement) : []);

// ---------- icons (the app's outline set) ----------
function Ico({ d, size = 22, children }: { d?: string; size?: number; children?: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {d ? <path d={d} /> : children}
    </svg>
  );
}
const ICON = {
  send: <Ico><path d="M21.5 3 3 10.2l7.4 3.1L21.5 3z" /><path d="M21.5 3 15 21l-4.6-7.7" /></Ico>,
  copy: <Ico><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Ico>,
  download: <Ico><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" /><path d="M5 19.5h14" /></Ico>,
  more: <Ico><path d="M12 15V4M8 8l4-4 4 4" /><path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></Ico>,
  mail: <Ico><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7.5 8 6 8-6" /></Ico>,
  close: <Ico size={20} d="M6 6l12 12M18 6 6 18" />,
};

function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" className="animate-spin motion-reduce:animate-none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}

type Busy = "primary" | "copy" | "save" | "more";

export default function ShareSheet({ spec, quick, onClose }: { spec: ShareSpec; quick?: boolean; onClose: () => void }) {
  const T = useFeedTexts();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const [shown, setShown] = useState(false);
  const [format, setFormat] = useState<ShareFormat>("story");
  const [palette, setPalette] = useState<PaletteId>(() => paletteFor(spec.seed || spec.link));
  const [me, setMe] = useState<Sharer | null>(sharerCache ?? null);
  const [showName, setShowName] = useState(() => readJSON<boolean>(SHOW_NAME_KEY, false));
  const [preview, setPreview] = useState<{ url: string; format: ShareFormat } | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<Busy | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [dy, setDy] = useState(0);
  const drag = useRef<number | null>(null);
  const previewUrl = useRef<string | null>(null);
  const finalImage = useRef<{ key: string; promise: Promise<Blob> } | null>(null);
  const quickDone = useRef(false);

  useEffect(() => { closeRef.current = onClose; });

  // the visitor's Talents username (only offered with a profile)
  useEffect(() => {
    let live = true;
    void loadSharer().then((s) => { if (live) setMe(s); });
    return () => { live = false; };
  }, []);

  // modal behaviour: slide in, move focus in and trap it, Esc closes, the page behind does not scroll, focus returns on close
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => { setShown(true); panel.current?.focus({ preventScroll: true }); });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== "Tab") return;
      const nodes = focusables(panel.current);
      if (!nodes.length) { e.preventDefault(); return; }
      const first = nodes[0], last = nodes[nodes.length - 1], active = document.activeElement;
      const inside = !!panel.current && panel.current.contains(active) && active !== panel.current;
      if (e.shiftKey && (!inside || active === first)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (!inside || active === last)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
      if (before && document.contains(before)) before.focus({ preventScroll: true });
    };
  }, []);

  const message = useMemo(() => (spec.message.includes(APP_LINK) ? spec.message : `${spec.message}\n\n${T.feed.brand} · ${T.share.getApp}: ${APP_LINK}`), [spec.message, T]);
  const opts = useMemo<ShareOpts>(() => ({ palette, sharer: showName && me ? me : null }), [palette, showName, me]);
  const key = `${format}|${palette}|${opts.sharer?.username ?? ""}|${opts.sharer?.badge ?? ""}`;
  const fileName = `quran-masterclass-${slugOf(spec.seed || spec.link)}-${FORMATS.find((f) => f.id === format)?.name ?? "story"}.png`;
  const ready = !!preview && preview.format === format;

  // the preview: drawn small while the settings change (the last one wins), the old image stays until the new one is there
  useEffect(() => {
    let live = true;
    const timer = window.setTimeout(() => {
      previewShareImage(spec.card, format, opts, T).then((blob) => {
        if (!live) return;
        const url = URL.createObjectURL(blob);
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
        previewUrl.current = url;
        setPreview({ url, format });
        setFailed(false);
      }).catch(() => { if (live) setFailed(true); });
    }, 40);
    return () => { live = false; window.clearTimeout(timer); };
  }, [spec.card, format, opts, T]);
  useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);

  // the image that is shared: 1080 px, drawn once per setting (and ahead of the tap, so the share sheet opens inside the tap)
  const getFinal = useCallback((): Promise<Blob> => {
    if (finalImage.current?.key === key) return finalImage.current.promise;
    const promise = renderShareImage(spec.card, format, opts, T);
    finalImage.current = { key, promise };
    promise.catch(() => { if (finalImage.current?.promise === promise) finalImage.current = null; });
    return promise;
  }, [key, spec.card, format, opts, T]);
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => { getFinal().catch(() => undefined); }, 250);
    return () => window.clearTimeout(timer);
  }, [ready, getFinal]);

  const run = useCallback(async (id: Busy, auto = false) => {
    if (busy) return;
    setErr(""); setNote(""); setBusy(id);
    try {
      if (id === "copy") {
        await copyText(spec.link);
        setNote(T.feed.copied);
      } else if (id === "more") {
        await navigator.share({ title: T.feed.shareTitle, text: message, url: spec.link });
      } else {
        const blob = await getFinal();
        const file = new File([blob], fileName, { type: "image/png" });
        if (id === "primary" && canShareFiles(file)) await navigator.share({ files: [file], title: T.feed.shareTitle, text: message, url: spec.link });
        else { download(blob, fileName); setNote(T.feed.saved); }
      }
      spec.onShared?.();
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      // the person closed the share sheet; or the browser wants a fresh tap (the one-tap path simply leaves the sheet open)
      if (name === "AbortError" || (auto && name === "NotAllowedError")) return;
      setErr(T.feed.shareFailed);
    } finally {
      setBusy(null);
    }
  }, [busy, spec, T, message, getFinal, fileName]);

  // one tap on a post: the story image goes to the system share sheet as soon as the sheet opens (only where the browser has one for files)
  const runRef = useRef(run);
  useEffect(() => { runRef.current = run; });
  useEffect(() => {
    if (!quick || quickDone.current) return;
    quickDone.current = true;
    if (canShareFiles(new File([""], "share.png", { type: "image/png" }))) void runRef.current("primary", true);
  }, [quick]);

  // drag the top bar down to close (phones)
  const onDragMove = (y: number) => { if (drag.current !== null) setDy(Math.max(0, y - drag.current)); };
  const onDragEnd = () => { const d = dy; drag.current = null; if (d > 110) closeRef.current(); else setDy(0); };

  const onTabKey = (e: ReactKeyboardEvent, i: number) => {
    const rtl = document.documentElement.dir === "rtl";
    const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    if (!step) return;
    e.preventDefault();
    const next = FORMATS[(i + step + FORMATS.length) % FORMATS.length];
    setFormat(next.id);
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>(`[data-format="${next.id}"]`)?.focus());
  };

  const tplName: Record<PaletteId, string> = { night: T.tpl.night, emerald: T.tpl.emerald, dawn: T.tpl.dawn, parchment: T.tpl.parchment, marble: T.tpl.marble };
  const formatName: Record<string, string> = { story: T.tpl.story, portrait: T.tpl.portrait, square: T.tpl.square };
  if (typeof document === "undefined") return null;
  const size = CARD_SIZE[format];
  const enc = encodeURIComponent;
  const full = `${message}\n${spec.link}`;
  const xText = message.length > 200 ? `${message.slice(0, 200)} …` : message;
  const targets: { id: string; label: string; href: string; mono?: string; icon?: ReactNode; newTab: boolean }[] = [
    { id: "whatsapp", label: T.feed.whatsapp, href: `https://wa.me/?text=${enc(full)}`, mono: "WA", newTab: true },
    { id: "telegram", label: "Telegram", href: `https://t.me/share/url?url=${enc(spec.link)}&text=${enc(message)}`, mono: "TG", newTab: true },
    { id: "x", label: "X", href: `https://twitter.com/intent/tweet?text=${enc(xText)}&url=${enc(spec.link)}`, mono: "X", newTab: true },
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(spec.link)}`, mono: "f", newTab: true },
    { id: "mail", label: T.feed.mail, href: `mailto:?subject=${enc(message.split("\n")[0].slice(0, 120))}&body=${enc(full)}`, icon: ICON.mail, newTab: false },
  ];
  const actions: { id: Busy; label: string; icon: ReactNode }[] = [
    { id: "copy", label: T.feed.copyLink, icon: ICON.copy },
    { id: "save", label: T.feed.saveImage, icon: ICON.download },
    ...(canShareText() ? [{ id: "more" as const, label: T.feed.more, icon: ICON.more }] : []),
  ];
  const status = failed ? "" : (busy && busy !== "copy") || !ready ? T.feed.preparing : note;

  const seal = "relative flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[rgb(214_180_108)] bg-white/[0.06] text-[#f3e2b6] before:pointer-events-none before:absolute before:inset-[3px] before:rounded-full before:border before:border-[rgb(214_180_108/0.35)] before:content-['']";

  return createPortal(
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/55" onClick={() => closeRef.current()} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={T.feed.shareTitle}
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 outline-none transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none sm:bottom-auto sm:top-1/2 sm:mx-auto sm:w-[460px] sm:max-w-[calc(100%-2rem)] sm:!-translate-y-1/2 ${shown ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
      >
        <div
          className="stage max-h-[94dvh] overflow-y-auto overscroll-contain rounded-t-[22px] border-t border-[rgb(214_180_108/0.35)] pb-[max(1rem,env(safe-area-inset-bottom))] text-white sm:rounded-[22px] sm:border sm:shadow-2xl"
          style={{ transform: dy ? `translateY(${dy}px)` : undefined, transition: dy ? "none" : undefined }}
        >
          {/* the drag bar (phones) with the close button */}
          <div className="relative flex items-center justify-center px-4 pb-1 pt-2.5">
            <div
              className="flex h-6 w-24 touch-none items-center justify-center sm:hidden"
              onPointerDown={(e) => { drag.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); }}
              onPointerMove={(e) => onDragMove(e.clientY)}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
              aria-hidden="true"
            >
              <span className="h-1 w-10 rounded-full bg-white/30" />
            </div>
            <button type="button" onClick={() => closeRef.current()} aria-label={T.feed.close} className={`absolute end-2 top-0.5 flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition hover:text-white ${FOCUS}`}>{ICON.close}</button>
          </div>

          {/* the image as it will be shared */}
          <div className="flex justify-center px-6 pt-1">
            <div
              className="relative overflow-hidden rounded-[14px] border bg-white/[0.04] shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
              style={{ borderColor: GOLD_SOFT, aspectRatio: `${size.w} / ${size.h}`, width: `min(100%, calc(clamp(200px, 36dvh, 380px) * ${size.w / size.h}))` }}
              aria-busy={!ready}
            >
              {ready && preview ? (
                // eslint-disable-next-line @next/next/no-img-element -- a blob URL of the image just drawn
                <img src={preview.url} alt={format === "story" ? T.feed.storyPreview : T.feed.previewLabel} width={size.w} height={size.h} className={`absolute inset-0 h-full w-full transition-opacity motion-reduce:transition-none ${busy === "primary" ? "opacity-60" : "opacity-100"}`} draggable={false} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[rgb(214_180_108)]">{failed ? <span role="alert" className="px-4 text-center text-[13px] text-[rgb(232_176_164)]">{T.feed.shareFailed}</span> : <Spinner size={26} />}</div>
              )}
            </div>
          </div>

          {/* the format */}
          <div role="tablist" aria-label={T.feed.shareTitle} className="mx-auto mt-3.5 flex w-fit max-w-full gap-1.5 rounded-full bg-white/[0.07] p-[3px]">
            {FORMATS.map((f, i) => {
              const on = f.id === format;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  data-format={f.id}
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setFormat(f.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`flex h-11 items-center gap-[7px] rounded-full border px-3.5 text-[13px] transition motion-reduce:transition-none ${FOCUS} ${on ? "border-[rgb(214_180_108)] bg-[rgb(214_180_108/0.18)] font-semibold text-[#f3e2b6]" : "border-transparent font-medium text-white/75"}`}
                >
                  <span aria-hidden="true" className="block rounded-[2px] border-[1.4px]" style={{ width: f.glyph[0], height: f.glyph[1], borderColor: on ? GOLD : "rgba(255,255,255,0.6)" }} />
                  {formatName[f.name]}
                </button>
              );
            })}
          </div>

          {/* the design */}
          <div role="group" aria-label={T.tpl.design} className="mt-3.5 flex justify-center gap-1.5 px-2">
            {PALETTE_IDS.map((id) => {
              const on = id === palette;
              const sw = PALETTES[id];
              return (
                <button key={id} type="button" aria-pressed={on} aria-label={`${T.tpl.design}: ${tplName[id]}`} onClick={() => setPalette(id)} className={`flex min-h-[44px] min-w-[52px] flex-col items-center gap-1 rounded-xl px-1 py-0.5 ${FOCUS}`}>
                  <span className="block h-[34px] w-[34px] rounded-full border-[1.5px] p-0.5" style={{ borderColor: on ? GOLD : "transparent" }}>
                    <span className="block h-full w-full rounded-full border" style={{ background: `linear-gradient(135deg, ${sw.swatch[0]}, ${sw.swatch[1]})`, borderColor: sw.line }} />
                  </span>
                  <span className={`text-[10.5px] ${on ? "font-semibold text-[#f3e2b6]" : "text-white/60"}`}>{tplName[id]}</span>
                </button>
              );
            })}
          </div>

          {/* "shared by @username" (only with a Talents profile, off until switched on) */}
          {me ? (
            <div className="mx-5 mt-3 flex items-center gap-2.5">
              <span id="share-name" className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-white/75">{T.tpl.showName} <span className="font-semibold text-[#f3e2b6]">@{me.username}</span></span>
              <button
                type="button"
                role="switch"
                aria-checked={showName}
                aria-labelledby="share-name"
                onClick={() => { const v = !showName; setShowName(v); writeJSON(SHOW_NAME_KEY, v, true); }}
                className={`flex h-11 w-14 shrink-0 items-center justify-center rounded-full ${FOCUS}`}
              >
                <span className={`relative block h-[26px] w-[46px] rounded-full transition-colors motion-reduce:transition-none ${showName ? "bg-[rgb(214_180_108)]" : "bg-white/20"}`}>
                  <span className={`absolute top-[3px] block h-5 w-5 rounded-full bg-white shadow transition-[inset-inline-start] motion-reduce:transition-none ${showName ? "start-[23px]" : "start-[3px]"}`} />
                </span>
              </button>
            </div>
          ) : null}

          {/* the one gold action */}
          <div className="px-4 pt-4">
            <button
              type="button"
              onClick={() => void run("primary")}
              aria-busy={busy === "primary"}
              className={`btn-gold flex h-[50px] w-full items-center justify-center gap-[9px] rounded-full text-[15.5px] font-semibold ${FOCUS}`}
            >
              {busy === "primary" ? <Spinner /> : ICON.send}
              {format === "story" ? T.tpl.shareStory : T.tpl.shareNow}
            </button>
          </div>

          {/* link targets */}
          <ul className="mt-4 flex gap-3.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {targets.map((t) => (
              <li key={t.id} className="shrink-0">
                <a
                  href={t.href}
                  {...(t.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => spec.onShared?.()}
                  className={`flex min-h-[44px] w-[68px] flex-col items-center gap-1.5 rounded-xl transition hover:opacity-80 ${FOCUS}`}
                >
                  <span className={seal}>
                    {t.icon ?? <span className={`font-semibold tracking-[0.03em] ${t.mono === "f" ? "text-[24px]" : "text-[16px]"}`}>{t.mono}</span>}
                  </span>
                  <span className="text-center text-[11.5px] leading-[14px] text-white">{t.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-3.5 h-px bg-white/10" />
          <ul className="flex gap-3.5 overflow-x-auto px-4 pt-3.5 [scrollbar-width:none]">
            {actions.map((a) => (
              <li key={a.id} className="shrink-0">
                <button type="button" onClick={() => void run(a.id)} aria-busy={busy === a.id} className={`flex min-h-[44px] w-[68px] flex-col items-center gap-1.5 rounded-xl transition hover:opacity-80 ${FOCUS}`}>
                  <span className="flex h-[54px] w-[54px] items-center justify-center rounded-full border bg-white/[0.08] text-[rgb(214_180_108)]" style={{ borderColor: GOLD_SOFT }}>
                    {busy === a.id ? <Spinner /> : a.icon}
                  </span>
                  <span className="text-center text-[11.5px] leading-[14px] text-white">{a.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="px-4">
            <p role="status" aria-live="polite" className={`mt-2.5 min-h-[18px] text-[13px] ${busy || !ready ? "text-white/60" : "font-semibold text-[rgb(214_180_108)]"}`}>{status}</p>
            {err ? <p role="alert" className="mt-1 text-[13px] text-[rgb(232_176_164)]">{err}</p> : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
