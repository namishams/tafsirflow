"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { sijillText, type SwKey } from "@/lib/sijillWeb";
import { momentLine } from "@/lib/sijillMoment";
import { fill } from "@/lib/talentsWeb";
import { profileText, type PwKey } from "@/lib/profileWeb";

// Achievement "posts" on the public website profile (same structure as the app): a three-column grid of generated
// achievement cards with the MashaAllah count, and a full-screen vertical feed (scroll snap) of the same moments.
// The gold heart is the MashaAllah (reaction "like"; the older preset "MashaAllah" counts towards it); double-click on
// the card says MashaAllah with a short heart burst (skipped with reduced motion). Barakallahu fik and Allahumma barik
// stay as presets. Reacting needs a sign-in (401/403 shows a sign-in link). The server-rendered list is replaced by
// the viewer-aware one (own moments, own reactions) when the visitor is signed in.
type R = "like" | "mashallah" | "barakallah" | "barik";
export type GridMoment = {
  id: string; kind: string; ref: string; data: Record<string, unknown>; at: string; title: string | null;
  total: number; mine: R | null; own: boolean; counts: Record<R, number>;
};
const maOf = (m: GridMoment) => (m.counts.like ?? 0) + (m.counts.mashallah ?? 0);
const isMa = (r: R | null) => r === "like" || r === "mashallah";
const TONE: Record<string, string> = {
  certificate: "from-[#3a2f12] to-[#14110a]", exam: "from-[#0c4a37] to-[#06221a]", level: "from-[#13392b] to-[#071a13]", hifz: "from-[#33290f] to-[#120e06]",
  juz: "from-[#0b3a30] to-[#041814]", tree: "from-[#24381c] to-[#0d160a]", sticker: "from-[#3a2f12] to-[#14110a]", streak: "from-[#33290f] to-[#120e06]", course: "from-[#0f3f3a] to-[#061c19]",
};
const legendary = (m: GridMoment) => m.kind === "sticker" && typeof m.data?.id === "string";
function figure(m: GridMoment) {
  const d = m.data ?? {};
  if (m.kind === "certificate" || m.kind === "exam") return typeof d.pct === "number" && d.pct > 0 ? `${d.pct}%` : "";
  return ["level", "juz", "tree", "streak", "hifz"].includes(m.kind) && Number(d.n) ? String(d.n) : "";
}
const HEART = "M12 20s-7-4.3-7-10a4.2 4.2 0 0 1 7-3 4.2 4.2 0 0 1 7 3c0 5.7-7 10-7 10z";
function Heart({ on, className }: { on: boolean; className: string }) {
  return <svg aria-hidden viewBox="0 0 24 24" className={className} fill={on ? "#dcc48c" : "none"} stroke={on ? "#dcc48c" : "currentColor"} strokeWidth="1.8"><path d={HEART} /></svg>;
}

function Art({ m, locale, big }: { m: GridMoment; locale: string; big?: boolean }) {
  const sx = sijillText(locale), px = profileText(locale);
  const fig = figure(m);
  return (
    <div className={`relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${legendary(m) ? "from-[#4a3a12] to-[#120e06]" : TONE[m.kind] ?? TONE.level} ${big ? "gap-4 p-8" : "gap-1.5 p-2"}`}>
      <span aria-hidden className={`absolute border ${legendary(m) ? "border-[#dcc48c]" : "border-[rgba(214,180,108,0.45)]"} ${big ? "inset-4 rounded-xl" : "inset-1.5 rounded-[4px]"}`} />
      <span className={`font-semibold text-[rgb(214,180,108)] ${big ? "text-[14px]" : "text-[9.5px] sm:text-[11px]"}`}>{legendary(m) ? px.legendary : px[`kind_${m.kind}` as PwKey] ?? ""}</span>
      <span className={`grid aspect-square place-items-center rounded-full bg-gradient-to-br from-[#f6e7bf] via-[#d6b46c] to-[#a9802f] ${big ? "h-28 w-28" : "h-[34%]"}`}>
        <span className="grid h-[calc(100%-6px)] w-[calc(100%-6px)] place-items-center rounded-full bg-[rgb(8,38,29)] font-extrabold text-[#f3e2b6]">
          {fig ? <span className={big ? "text-4xl" : "text-[13px] sm:text-xl"}>{fig}</span> : <Heart on className={big ? "h-12 w-12" : "h-1/2 w-1/2"} />}
        </span>
      </span>
      <span className={`text-center text-[#eef0f3] ${big ? "font-display line-clamp-4 text-2xl leading-snug" : "line-clamp-2 text-[10.5px] font-semibold leading-tight sm:text-[13px]"}`}>{momentLine(m, sx as Record<SwKey, string>)}</span>
    </div>
  );
}

export default function MomentGrid({ username, locale, initial }: { username: string; locale: string; initial: GridMoment[] }) {
  const px = profileText(locale);
  const [list, setList] = useState<GridMoment[]>(initial);
  const [open, setOpen] = useState<number | null>(null);
  const nf = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  useEffect(() => {
    // signed in: the viewer-aware list (own moments, own reactions)
    fetch(`/api/community/moments?scope=user&u=${encodeURIComponent(username)}&locale=${locale}`, { cache: "no-store" })
      .then(async (r) => { if (r.ok) { const d = (await r.json()) as { moments?: GridMoment[] }; if (d.moments) setList(d.moments); } })
      .catch(() => undefined);
  }, [username, locale]);
  const change = useCallback((m: GridMoment) => {
    const old = list.find((x) => x.id === m.id);
    // the MashaAllah counter in the profile header follows (MashaAllahStat)
    if (old) window.dispatchEvent(new CustomEvent("qm-mashaallah", { detail: maOf(m) - maOf(old) }));
    setList((l) => l.map((x) => (x.id === m.id ? m : x)));
  }, [list]);
  const close = useCallback(() => setOpen(null), []);
  if (!list.length) return <p className="py-8 text-center text-muted">{px.noMoments}</p>;
  return (
    <>
      <ul className="grid grid-cols-3 gap-0.5 sm:gap-1.5">
        {list.map((m, i) => {
          const n = maOf(m);
          return (
            <li key={m.id}>
              <button type="button" onClick={() => setOpen(i)} aria-label={`${momentLine(m, sijillText(locale))}, ${fill(px.maCount, { n })}`}
                className="relative block aspect-[4/5] w-full overflow-hidden rounded-[3px] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgb(var(--hm-gold))] sm:rounded-md">
                <Art m={m} locale={locale} />
                <span className="absolute bottom-1.5 start-2 flex items-center gap-1 text-[12px] font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,.6)]">
                  <Heart on={n > 0 || isMa(m.mine)} className="h-3.5 w-3.5" />{nf.format(n)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {open !== null ? <Feed list={list} start={open} locale={locale} onClose={close} onChange={change} /> : null}
    </>
  );
}

function Feed({ list, start, locale, onClose, onChange }: { list: GridMoment[]; start: number; locale: string; onClose: () => void; onChange: (m: GridMoment) => void }) {
  const px = profileText(locale);
  const box = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.children[start]?.scrollIntoView({ block: "start" });
    closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    const ov = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = ov; prev?.focus(); };
  }, [start, onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={px.tabAchievements} className="fixed inset-0 z-50 bg-[rgb(5,28,21)] text-white">
      <style>{"@keyframes qmburst{0%{opacity:0;transform:scale(.3)}25%{opacity:1;transform:scale(1.15)}70%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.35)}}"}</style>
      <div ref={box} className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain">
        {list.map((m, i) => <FeedItem key={m.id} m={m} locale={locale} label={fill(px.momentOf, { n: i + 1, m: list.length })} onChange={onChange} />)}
      </div>
      <button ref={closeBtn} type="button" onClick={onClose} aria-label={px.close}
        className="absolute start-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-black/35 text-2xl leading-none hover:bg-black/50">×</button>
    </div>
  );
}

function FeedItem({ m, locale, label, onChange }: { m: GridMoment; locale: string; label: string; onChange: (m: GridMoment) => void }) {
  const px = profileText(locale), sx = sijillText(locale);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<"" | "signIn" | "error">("");
  const [burst, setBurst] = useState(0);
  const nf = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const react = async (r: R | null) => {
    if (m.own || busy) return;
    setBusy(true); setMsg("");
    try {
      const res = await fetch(`/api/community/moments/${m.id}/react`, r ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reaction: r }) } : { method: "DELETE" });
      if (res.status === 401 || res.status === 403) { setMsg("signIn"); return; }
      const d = (await res.json().catch(() => ({}))) as { mine?: R | null; counts?: Record<R, number>; total?: number };
      if (!res.ok || !d.counts) throw new Error("error");
      onChange({ ...m, mine: d.mine ?? null, counts: d.counts, total: d.total ?? m.total });
    } catch { setMsg("error"); } finally { setBusy(false); }
  };
  const sayMa = (dbl: boolean) => {
    if (m.own) return;
    if (isMa(m.mine)) { if (dbl) setBurst((b) => b + 1); else void react(null); return; }
    setBurst((b) => b + 1);
    void react("like");
  };
  const on = isMa(m.mine), n = maOf(m);
  return (
    <section aria-label={label} className="relative flex h-[100dvh] snap-start items-center justify-center px-6 pb-28 pt-16">
      <div onDoubleClick={() => sayMa(true)} className="relative aspect-[4/5] w-full select-none overflow-hidden rounded-xl border border-[rgb(201,166,94)]" style={{ maxWidth: "min(420px, 56dvh)" }}>
        <Art m={m} locale={locale} big />
        {burst ? (
          <span key={burst} aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center motion-reduce:hidden">
            <span className="block opacity-0 [animation:qmburst_700ms_ease-out_forwards]"><Heart on className="h-32 w-32" /></span>
          </span>
        ) : null}
      </div>
      <p className="sr-only">{m.own ? px.ownHint : px.doubleTap}</p>
      <div className="absolute bottom-6 end-28 start-5 text-[13px] text-white/70">
        <time dateTime={m.at}>{new Date(m.at).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}</time>
        {m.own ? <p className="mt-1 text-[#f3e2b6]">{px.ownHint}</p> : <p className="mt-1 hidden sm:block">{px.doubleTap}</p>}
        {msg === "signIn" ? <p role="status" className="mt-1 font-semibold text-[#f3e2b6]">{px.signInToReact} <Link href="/account" className="underline">{px.signIn}</Link></p> : null}
        {msg === "error" ? <p role="status" className="mt-1 font-semibold text-[#f3e2b6]">{px.error}</p> : null}
      </div>
      <div className="absolute bottom-6 end-3 flex flex-col items-center gap-3">
        <button type="button" onClick={() => sayMa(false)} disabled={m.own || busy} aria-pressed={on} aria-label={`${on ? px.takeBack : px.sayMashaAllah}, ${fill(px.maCount, { n })}`}
          className="flex min-w-16 flex-col items-center gap-0.5 disabled:cursor-default">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-black/30"><Heart on={on} className="h-8 w-8" /></span>
          <span className="text-[14px] font-bold">{nf.format(n)}</span>
          <span className="text-[11px] font-semibold text-[rgb(214,180,108)]">{px.mashaallah}</span>
        </button>
        {(["barakallah", "barik"] as const).map((r) => {
          const sel = m.mine === r, c = m.counts[r] ?? 0;
          return (
            <button key={r} type="button" onClick={() => void react(sel ? null : r)} disabled={m.own || busy} aria-pressed={sel}
              className={`max-w-28 rounded-full border px-3 py-2 text-center text-[11.5px] font-semibold ${sel ? "border-[#dcc48c] bg-[rgba(214,180,108,0.25)]" : "border-white/35 bg-black/25"} disabled:cursor-default`}>
              {sx[`react_${r}` as SwKey]}{c ? ` · ${nf.format(c)}` : ""}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** the MashaAllah counter in the profile header; follows reactions given in the grid feed */
export function MashaAllahStat({ initial, locale, label }: { initial: number; locale: string; label: string }) {
  const [n, setN] = useState(initial);
  useEffect(() => {
    const on = (e: Event) => setN((x) => Math.max(0, x + Number((e as CustomEvent<number>).detail || 0)));
    window.addEventListener("qm-mashaallah", on);
    return () => window.removeEventListener("qm-mashaallah", on);
  }, []);
  return (
    <a href="#achievements" className="min-w-[84px] text-center hover:opacity-80">
      <span className="block text-2xl font-extrabold text-white">{new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n)}</span>
      <span className="block text-[13px] text-white/60">{label}</span>
    </a>
  );
}
