"use client";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import { useCallback, useEffect, useRef, useState } from "react";
import SupportNudge from "@/components/SupportNudge";
import { ShareArt } from "@/components/share/ShareArt";
import { CARD_SIZE, PALETTES, PALETTE_IDS, type PaletteId } from "@/lib/share/formats";
import { renderSlide, renderWisdom } from "@/lib/feed/carousels/render";
import { zipStore } from "@/lib/feed/carousels/zip";
import { carouselText, fill, webText } from "@/lib/feed/carousels/uiText";
import type { ResolvedCarousel, ResolvedWisdom } from "@/lib/feed/carousels/resolve";

// A carousel on the website, as in the app: the slides (drawn in the browser by lib/feed/carousels/render.ts at
// Instagram's exact pixels) swiped horizontally with dots and arrows, and the actions: share all slides together
// (Web Share with files, e.g. to Instagram on a phone), download all as a ZIP, download one slide, share one slide as
// a story (9:16). Format 4:5 or 1:1 and the five designs can be chosen. The text version is rendered by the page.

const GOLD = "rgb(214 180 108)";
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "carousel";
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function canShare(files: File[]) {
  try { return typeof navigator.canShare === "function" && navigator.canShare({ files }); } catch { return false; }
}

type Format = "post" | "square";
export default function CarouselViewer({ c, compact, initialFormat = "post" }: { c: ResolvedCarousel; compact?: boolean; initialFormat?: Format }) {
  const tx = carouselText(c.lang);
  const wt = webText(c.lang);
  const total = c.slides.length + 2;
  const [format, setFormat] = useState<Format>(initialFormat);
  const [palette, setPalette] = useState<PaletteId>(c.palette);
  const [imgs, setImgs] = useState<(string | null)[]>(() => Array(total).fill(null));
  const [at, setAt] = useState(0);
  const [busy, setBusy] = useState<"" | "all" | "zip" | "one" | "story">("");
  const [msg, setMsg] = useState("");
  const [options, setOptions] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const blobs = useRef<(Blob | null)[]>([]);
  const rtl = ["ar", "ur", "fa", "ps"].includes(c.lang);

  // draw the slides: the visible one first, then the rest in order (one canvas at a time)
  useEffect(() => {
    let live = true;
    const urls: string[] = [];
    blobs.current = Array(total).fill(null);
    setImgs(Array(total).fill(null));
    const order = [at, ...Array.from({ length: total }, (_, i) => i).filter((i) => i !== at)];
    void (async () => {
      for (const i of order) {
        if (!live) return;
        try {
          const b = await renderSlide(c, i, format, palette);
          if (!live) return;
          blobs.current[i] = b;
          const u = URL.createObjectURL(b);
          urls.push(u);
          setImgs((prev) => { const n = [...prev]; n[i] = u; return n; });
        } catch (e) { console.warn("carousel: slide", i, e); /* the placeholder stays */ }
      }
    })();
    return () => { live = false; urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [c, format, palette, total]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const k = Math.max(0, Math.min(total - 1, i));
    el.scrollTo({ left: (rtl ? -1 : 1) * k * el.clientWidth, behavior: "smooth" });
  }, [total, rtl]);
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(Math.abs(el.scrollLeft) / Math.max(1, el.clientWidth));
    if (i !== at) setAt(i);
  };

  const all = async (): Promise<Blob[]> => {
    const out: Blob[] = [];
    for (let i = 0; i < total; i++) out.push(blobs.current[i] ?? (await renderSlide(c, i, format, palette)));
    return out;
  };
  const name = (i: number) => `${slug(c.id)}-${String(i + 1).padStart(2, "0")}-${format === "post" ? "1080x1350" : "1080x1080"}.png`;
  const run = async (what: "all" | "zip" | "one" | "story") => {
    if (busy) return;
    setBusy(what); setMsg("");
    try {
      if (what === "story") {
        const b = await renderSlide(c, at, "story", palette);
        const f = new File([b], `${slug(c.id)}-${at + 1}-story-1080x1920.png`, { type: "image/png" });
        if (canShare([f])) await navigator.share({ files: [f], title: c.cover.title }).catch(() => undefined);
        else download(b, f.name);
      } else if (what === "one") {
        download(blobs.current[at] ?? (await renderSlide(c, at, format, palette)), name(at));
      } else {
        const list = await all();
        const files = list.map((b, i) => new File([b], name(i), { type: "image/png" }));
        if (what === "all" && canShare(files)) {
          await navigator.share({ files, title: c.cover.title, text: `${c.cover.title}\nquranmasterclass.com/app` }).catch(() => undefined);
        } else {
          const data = await Promise.all(list.map(async (b) => new Uint8Array(await b.arrayBuffer())));
          download(zipStore(data.map((d, i) => ({ name: name(i), data: d }))), `${slug(c.id)}.zip`);
        }
      }
    } catch {
      setMsg(tx.failed);
    } finally { setBusy(""); }
  };

  const size = CARD_SIZE[format];
  const btn = "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13.5px] font-semibold transition hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10";
  return (
    <div className="w-full" dir={rtl ? "rtl" : "ltr"} lang={c.lang}>
      <div className="relative overflow-hidden rounded-2xl" style={{ backgroundColor: PALETTES[palette].bg[1] }}>
        <div ref={track} onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region" aria-roledescription="carousel" aria-label={c.cover.title} tabIndex={0}
          onKeyDown={(e) => { if (e.key === "ArrowRight") go(at + (rtl ? -1 : 1)); if (e.key === "ArrowLeft") go(at + (rtl ? 1 : -1)); }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className="relative w-full shrink-0 snap-center" style={{ aspectRatio: `${size.w} / ${size.h}` }} role="group" aria-roledescription="slide" aria-label={fill(tx.slideOf, { n: i + 1, total })}>
              {imgs[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgs[i]!} alt={i === 0 ? c.cover.title : i > c.slides.length ? tx.sources : (c.slides[i - 1].title ?? c.cover.title)} className="absolute inset-0 h-full w-full" draggable={false} />
              ) : (
                <div className="absolute inset-0">
                  <ShareArt palette={palette} seed={`cr:${c.id}:${i}`} w={size.w} h={size.h} layout={format} className="absolute inset-0 h-full" />
                  {i === 0 ? <p className="absolute inset-x-8 top-1/2 -translate-y-1/2 text-center text-2xl font-semibold" style={{ fontFamily: "'Fraunces Variable', serif", color: PALETTES[palette].ink }}>{c.cover.title}</p> : null}
                </div>
              )}
            </div>
          ))}
        </div>
        {at > 0 ? (
          <button type="button" onClick={() => go(at - 1)} aria-label={wt.prev} className="absolute start-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60">
            <span aria-hidden className={rtl ? "rotate-180" : ""}>‹</span>
          </button>
        ) : null}
        {at < total - 1 ? (
          <button type="button" onClick={() => go(at + 1)} aria-label={wt.next} className="absolute end-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60">
            <span aria-hidden className={rtl ? "rotate-180" : ""}>›</span>
          </button>
        ) : null}
        <span className="absolute end-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-white">{at + 1}/{total}</span>
      </div>
      <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => <span key={i} className="rounded-full transition-all" style={{ width: i === at ? 7 : 5.5, height: i === at ? 7 : 5.5, background: i === at ? GOLD : "rgb(127 127 127 / .45)" }} />)}
      </div>

      {at === total - 1 && total > 1 ? <SupportNudge className="mt-4" /> : null}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => void run("all")} disabled={!!busy} className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14.5px] font-bold text-[rgb(8,38,29)] transition hover:brightness-105 disabled:opacity-60" style={{ background: "linear-gradient(180deg,#dcc48c,#c6a65e)" }}>
          {busy === "all" ? "…" : tx.shareAll}
        </button>
        <button type="button" onClick={() => void run("story")} disabled={!!busy} className={btn} style={{ borderColor: GOLD }}>{busy === "story" ? "…" : tx.shareSlideStory}</button>
        {!compact ? <button type="button" onClick={() => void run("zip")} disabled={!!busy} className={btn}>{busy === "zip" ? "…" : wt.downloadAll}</button> : null}
        <button type="button" onClick={() => void run("one")} disabled={!!busy} className={btn}>{busy === "one" ? "…" : wt.downloadSlide}</button>
        <button type="button" onClick={() => setOptions((o) => !o)} aria-expanded={options} className={btn}>{wt.design}</button>
      </div>
      {options ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <div role="radiogroup" aria-label={tx.format} className="flex gap-1 rounded-full bg-black/5 p-1 dark:bg-white/10">
            {(["post", "square"] as const).map((f) => (
              <button key={f} type="button" role="radio" aria-checked={format === f} onClick={() => setFormat(f)}
                className={`h-8 rounded-full px-3 text-[13px] font-semibold ${format === f ? "bg-white text-black shadow dark:bg-white/90" : ""}`}>{f === "post" ? tx.portrait : tx.square}</button>
            ))}
          </div>
          <div role="radiogroup" aria-label={wt.design} className="flex gap-2">
            {PALETTE_IDS.map((id) => (
              <button key={id} type="button" role="radio" aria-checked={palette === id} aria-label={id} onClick={() => setPalette(id)}
                className="h-8 w-8 rounded-full p-0.5" style={{ border: `1.5px solid ${palette === id ? GOLD : "transparent"}` }}>
                <span className="block h-full w-full rounded-full" style={{ background: `linear-gradient(135deg, ${PALETTES[id].swatch[0]}, ${PALETTES[id].swatch[1]})`, border: `1px solid ${PALETTES[id].line}` }} />
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <p className="mt-2 text-center text-[12px] text-muted" aria-live="polite">{msg || tx.shareAllHint}</p>
    </div>
  );
}

/** a wisdom post on the website: the image (4:5) and its actions */
export function WisdomViewer({ w }: { w: ResolvedWisdom }) {
  const tx = carouselText(w.lang);
  const wt = webText(w.lang);
  const [img, setImg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true, url = "";
    void renderWisdom(w, "post").then((b) => { if (live) { url = URL.createObjectURL(b); setImg(url); } }).catch(() => undefined);
    return () => { live = false; if (url) URL.revokeObjectURL(url); };
  }, [w]);
  const share = async (format: "post" | "story") => {
    if (busy) return;
    setBusy(true);
    try {
      const b = await renderWisdom(w, format);
      const f = new File([b], `${slug(w.id)}-${format === "story" ? "story-1080x1920" : "1080x1350"}.png`, { type: "image/png" });
      if (canShare([f])) await navigator.share({ files: [f] }).catch(() => undefined); else download(b, f.name);
    } finally { setBusy(false); }
  };
  const size = CARD_SIZE.post;
  return (
    <div className="w-full" lang={w.lang}>
      <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: `${size.w} / ${size.h}`, backgroundColor: PALETTES[w.palette].bg[1] }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={[w.themeLabel, w.text ?? w.scripture?.text ?? "", w.scripture?.ref ?? w.source.label].filter(Boolean).join(". ")} className="absolute inset-0 h-full w-full" />
        ) : <ShareArt palette={w.palette} seed={`ws:${w.id}`} w={size.w} h={size.h} layout="post" className="absolute inset-0 h-full" />}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button type="button" disabled={busy} onClick={() => void share("story")} className="inline-flex h-10 items-center rounded-full px-4 text-[13.5px] font-bold text-[rgb(8,38,29)]" style={{ background: "linear-gradient(180deg,#dcc48c,#c6a65e)" }}>{tx.shareSlideStory}</button>
        <button type="button" disabled={busy} onClick={() => void share("post")} className="inline-flex h-10 items-center rounded-full border px-4 text-[13.5px] font-semibold">{wt.downloadSlide}</button>
      </div>
    </div>
  );
}
