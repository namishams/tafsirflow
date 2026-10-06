"use client";
import { useEffect, useRef, useState } from "react";
import { IslamNum, saw } from "./IslamArt";

// Reading aids for long chapters: a gold progress line under the header, the table of contents with the current
// section lit (desktop sidebar), and on phones a slim bar with the current section that opens the contents.
// Headings are the <h2 id="sec-n"> elements rendered by <Markdown variant="article" /> inside #targetId.

function useReading(targetId: string, count: number) {
  const [state, setState] = useState({ cur: 0, pct: 0, inside: false });
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = document.getElementById(targetId);
      if (!el) return;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      const pct = Math.max(0, Math.min(1, (56 - r.top) / Math.max(1, r.height - vh + 56)));
      let cur = 0;
      for (let n = 1; n <= count; n++) {
        const h = document.getElementById(`sec-${n}`);
        if (h && h.getBoundingClientRect().top < 140) cur = n; else if (h) break;
      }
      setState((s) => (s.cur === cur && Math.abs(s.pct - pct) < 0.002 && s.inside === (r.top < 40 && r.bottom > vh * 0.5) ? s : { cur, pct, inside: r.top < 40 && r.bottom > vh * 0.5 }));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, [targetId, count]);
  return state;
}

export function IslamToc({ sections, targetId = "chapter", label }: { sections: string[]; targetId?: string; label: string }) {
  const { cur } = useReading(targetId, sections.length);
  return (
    <nav aria-label={label} className="isl-toc">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted rtl:tracking-normal">{label}</p>
      <ol className="mt-3 flex flex-col gap-0.5 text-[13.5px]">
        {sections.map((h, i) => (
          <li key={i}><a href={`#sec-${i + 1}`} aria-current={cur === i + 1 ? "true" : undefined}><IslamNum n={i + 1} on={cur === i + 1} /><span className="min-w-0 pt-0.5">{saw(h)}</span></a></li>
        ))}
      </ol>
    </nav>
  );
}

export default function IslamReader({ sections, targetId = "chapter", title }: { sections: string[]; targetId?: string; title: string }) {
  const { cur, pct, inside } = useReading(targetId, sections.length);
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const click = (e: MouseEvent) => { if (panel.current && !panel.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", key);
    document.addEventListener("click", click);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("click", click); };
  }, [open]);
  useEffect(() => { if (!inside) setOpen(false); }, [inside]);
  return (
    <>
      <span aria-hidden className="isl-progress" style={{ transform: `scaleX(${pct})`, opacity: pct > 0 && pct < 1 ? 1 : 0, transition: "opacity .4s" }} />
      {sections.length > 1 && (
        <div ref={panel} className={`isl-bar lg:hidden ${inside ? "on" : ""}`}>
          <div className="border-b border-[rgb(var(--isl-gold-soft))]/30 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mx-auto flex h-11 w-full max-w-6xl items-center gap-2.5 px-5 text-start text-[13.5px] font-semibold">
              <IslamNum n={Math.max(1, cur)} on />
              <span className="min-w-0 flex-1 truncate">{saw(cur ? sections[cur - 1] : title)}</span>
              <span className="shrink-0 text-[11px] tabular-nums text-muted">{Math.max(1, cur)}/{sections.length}</span>
              <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {open && (
              <div className="step-in max-h-[60vh] overflow-y-auto border-t border-line/70 px-5 pb-4 pt-2">
                <p className="mx-auto max-w-6xl py-2 text-[12px] font-bold text-muted">{title}</p>
                <ol className="isl-toc mx-auto flex max-w-6xl flex-col gap-0.5 text-[14px]">
                  {sections.map((h, i) => <li key={i}><a href={`#sec-${i + 1}`} onClick={() => setOpen(false)} aria-current={cur === i + 1 ? "true" : undefined}><IslamNum n={i + 1} on={cur === i + 1} /><span className="min-w-0 pt-0.5">{saw(h)}</span></a></li>)}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
