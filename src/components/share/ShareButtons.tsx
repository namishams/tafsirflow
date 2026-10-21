"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState, type ReactElement } from "react";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import type { ShareSpec } from "@/lib/share/formats";

// The share buttons of a post (web port of PostShareButtons in the app's feedShare.tsx): a gold "Story" pill for one-tap
// sharing and the paper plane for the full sheet. The sheet is loaded only when it is opened (the canvas code and the
// Fraunces font stay out of the first bundle).

const ShareSheet = dynamic(() => import("./ShareSheet"), { ssr: false });
/** starts loading the sheet (on hover or focus of a share button), so it opens without a delay */
const warm = () => { void import("./ShareSheet"); };

/** a 9:16 frame with a plus: the story mark of the pill */
function StoryGlyph({ height = 15 }: { height?: number }) {
  return (
    <span aria-hidden="true" className="relative inline-block rounded-[2.5px] border-[1.5px] border-current" style={{ width: height * 0.66, height }}>
      <span className="absolute left-1/2 top-1/2 block h-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-current" style={{ width: height * 0.34 }} />
      <span className="absolute left-1/2 top-1/2 block w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-current" style={{ height: height * 0.34 }} />
    </span>
  );
}

/**
 * The gold "Story" pill: one tap shares the story image. `onDark` for cards on the dark stage (gold and cream instead of
 * the page's gold and ink).
 */
export function StoryPill({ onClick, busy, onDark }: { onClick: () => void; busy?: boolean; onDark?: boolean }) {
  const T = useFeedTexts();
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={warm}
      onFocus={warm}
      aria-label={T.tpl.shareStory}
      aria-busy={busy || undefined}
      className={`relative inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold transition hover:opacity-80 active:opacity-70 motion-reduce:transition-none before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        onDark
          ? "border-[rgb(214_180_108)] bg-[rgb(214_180_108/0.14)] text-[#f3e2b6] focus-visible:outline-[rgb(214_180_108)]"
          : "border-gold bg-gold/10 text-ink focus-visible:outline-gold"
      }`}
    >
      <span className={onDark ? "text-[rgb(214_180_108)]" : "text-gold"}>
        {busy ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="animate-spin motion-reduce:animate-none" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" opacity="0.25" />
            <path d="M21 12a9 9 0 0 0-9-9" />
          </svg>
        ) : <StoryGlyph />}
      </span>
      {T.tpl.story}
    </button>
  );
}

/** the paper plane: opens the full share sheet (all formats and designs) */
export function ShareIconButton({ onClick, label, onDark }: { onClick: () => void; label?: string; onDark?: boolean }) {
  const T = useFeedTexts();
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={warm}
      onFocus={warm}
      aria-label={label ?? T.share.share}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition hover:opacity-70 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${onDark ? "text-white focus-visible:outline-[rgb(214_180_108)]" : "text-ink focus-visible:outline-gold"}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M21.5 3 3 10.2l7.4 3.1L21.5 3z" />
        <path d="M21.5 3 15 21l-4.6-7.7" />
      </svg>
    </button>
  );
}

/**
 * `const sh = useShareSheet();` then `sh.open(spec)` (the full sheet) or `sh.open(spec, true)` (one tap: the story image goes
 * to the system share sheet as soon as it opens), and render `{sh.element}` once. The sheet is only mounted while open.
 */
export function useShareSheet(): { open: (spec: ShareSpec, quick?: boolean) => void; element: ReactElement | null } {
  const [state, setState] = useState<{ spec: ShareSpec; quick: boolean; n: number } | null>(null);
  const opened = useRef(0);
  const open = useCallback((spec: ShareSpec, quick = false) => setState({ spec, quick, n: ++opened.current }), []);
  const close = useCallback(() => setState(null), []);
  const element = useMemo(() => (state ? <ShareSheet key={state.n} spec={state.spec} quick={state.quick} onClose={close} /> : null), [state, close]);
  return useMemo(() => ({ open, element }), [open, element]);
}
