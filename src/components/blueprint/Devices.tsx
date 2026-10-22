import type { CSSProperties, ReactNode } from "react";
import "@/styles/blueprint.css";

// Device mockups for the Blueprint pages: pure CSS frames (no device artwork, no photos), fixed design sizes in px.
// A scene is drawn at its design size and scaled with --s (set per breakpoint by the caller with Tailwind arbitrary
// properties, e.g. "[--s:0.34] sm:[--s:0.6]"), so text inside a mockup never reflows. Everything is aria-hidden: the
// page describes each illustration in a visible caption.

/** a scene with a fixed design size, scaled by --s */
export function Fit({ w, h, scale, className = "", children }: { w: number; h: number; scale: string; className?: string; children: ReactNode }) {
  return (
    <div aria-hidden data-no-reveal className={`bp-fit ${scale} ${className}`} style={{ "--w": w, "--h": h } as CSSProperties}>
      <div className="bp-fit-in">{children}</div>
    </div>
  );
}

/** places a device inside a scene; the composition stays the same in RTL (it is a picture). `className` (e.g. the
 *  floating motion) goes on an inner box, so an animated transform never replaces the zoom. */
export function Place({ x, y, z = 1, zoom = 1, className = "", children }: { x: number; y: number; z?: number; zoom?: number; className?: string; children: ReactNode }) {
  return (
    <div className="absolute" style={{ left: x, top: y, zIndex: z, transform: zoom === 1 ? undefined : `scale(${zoom})`, transformOrigin: "top left" }}>
      <div className={className}>{children}</div>
    </div>
  );
}

/** "Illustration · planned" label in the corner of a scene */
export const Tag = ({ text, center = false }: { text: string; center?: boolean }) => (
  <span className={`bp-tag ${center ? "bp-tag-center" : ""}`}><svg width="10" height="10" viewBox="0 0 12 12" aria-hidden><path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill="#d6b46c" /></svg>{text}</span>
);

/** MacBook: 880 wide, screen 764 × 478 */
export const MAC_SCREEN = { w: 764, h: 478 } as const;
export function MacBook({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bp-shadow relative w-[880px] ${className}`}>
      <div className="bp-mac-lid mx-[44px]">
        <span className="bp-mac-notch" />
        <div className="bp-mac-screen" style={{ width: MAC_SCREEN.w, height: MAC_SCREEN.h }}>{children}</div>
      </div>
      <div className="bp-mac-base" style={{ marginInline: 0 }} />
    </div>
  );
}

/** studio display on a stand: 760 wide, screen 736 × 414 (16:9) */
export const DISPLAY_SCREEN = { w: 736, h: 414 } as const;
export function Display({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bp-shadow relative w-[760px] ${className}`}>
      <div className="bp-display"><div className="bp-display-screen" style={{ width: DISPLAY_SCREEN.w, height: DISPLAY_SCREEN.h }}>{children}</div></div>
      <div className="bp-display-neck" />
      <div className="bp-display-foot" />
    </div>
  );
}

/** iPad in landscape: 600 × 430, screen 568 × 398 */
export const IPAD_SCREEN = { w: 568, h: 398 } as const;
export function IPad({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bp-shadow ${className}`}>
      <div className="bp-ipad h-[430px] w-[600px]"><div className="bp-ipad-screen">{children}</div></div>
    </div>
  );
}

/** iPhone: 300 × 620, screen 278 × 598 */
export const PHONE_SCREEN = { w: 278, h: 598 } as const;
export function IPhone({ children, className = "", island = true }: { children: ReactNode; className?: string; island?: boolean }) {
  return (
    <div className={`bp-shadow ${className}`}>
      <div className="bp-iphone h-[620px] w-[300px]"><div className="bp-iphone-screen">{island ? <span className="bp-island" /> : null}{children}</div></div>
    </div>
  );
}

/** Android phone: 296 × 616, screen 278 × 598 */
export function Android({ children, className = "", lightBar = false }: { children: ReactNode; className?: string; lightBar?: boolean }) {
  return (
    <div className={`bp-shadow ${className}`}>
      <div className="bp-android h-[616px] w-[296px]"><div className="bp-android-screen"><span className="bp-punch" />{children}<span className={`bp-gesture ${lightBar ? "bp-gesture-dark" : ""}`} /></div></div>
    </div>
  );
}

/** iOS status bar (time left, signal and battery right) */
export function StatusIos({ dark = true }: { dark?: boolean }) {
  const c = dark ? "#fff" : "#0d1f19";
  return (
    <div className="relative z-20 flex h-[46px] items-center justify-between px-7 pt-1 text-[13px] font-semibold" style={{ color: c }} dir="ltr">
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" aria-hidden><g fill={c}><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></g></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden><rect x=".5" y=".5" width="21" height="11" rx="3.2" fill="none" stroke={c} strokeOpacity=".45" /><rect x="2" y="2" width="16" height="8" rx="2" fill={c} /><rect x="23" y="4" width="1.6" height="4" rx=".8" fill={c} fillOpacity=".45" /></svg>
      </span>
    </div>
  );
}

/** Android status bar */
export function StatusAndroid({ dark = true }: { dark?: boolean }) {
  const c = dark ? "#fff" : "#0d1f19";
  return (
    <div className="relative z-20 flex h-[38px] items-center justify-between px-5 text-[12px] font-medium" style={{ color: c }} dir="ltr">
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="14" height="11" viewBox="0 0 14 11" aria-hidden><path d="M7 11L0 3.2a10 10 0 0 1 14 0z" fill={c} /></svg>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M12 0v12H0z" fill={c} /></svg>
        <svg width="8" height="13" viewBox="0 0 8 13" aria-hidden><rect x="0" y="1.5" width="8" height="11.5" rx="1.5" fill={c} /><rect x="2.5" y="0" width="3" height="2" rx=".5" fill={c} /></svg>
      </span>
    </div>
  );
}
