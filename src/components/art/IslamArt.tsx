import "@fontsource-variable/fraunces/soft.css";
import "@fontsource-variable/fraunces/soft-italic.css";
import "@/styles/art-islam.css";

// Ornaments of the "Islam & knowledge" pages: inlaid flowers like the marble of the Sheikh Zayed Grand Mosque,
// numbered eight-pointed medallions, the lattice dome of light (Louvre Abu Dhabi) and the arcade edge of the heroes.
// Pure SVG/CSS, server-safe.

// "ﷺ" set in Amiri and gold, so the blessing reads as calligraphy on every device
export function saw(text: string, k = "s"): React.ReactNode {
  if (!text.includes("ﷺ")) return text;
  return text.split("ﷺ").flatMap((part, i) => (i ? [<span key={`${k}${i}`} className="isl-saw">ﷺ</span>, part] : [part]));
}

// points of an n-pointed star
export function starPath(cx: number, cy: number, R: number, r: number, n = 8, rot = -Math.PI / 2) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i + rot, rad = i % 2 ? r : R;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

// Eight-pointed medallion with a number (table of contents, section headings, steps)
export function IslamNum({ n, on = false, className = "" }: { n: number | string; on?: boolean; className?: string }) {
  return (
    <span className={`isl-num ${on ? "isl-num-on" : ""} ${className}`} aria-hidden>
      <svg viewBox="0 0 40 40">
        <rect className="fill" x="8.5" y="8.5" width="23" height="23" rx="1.5" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1.1" />
        <rect className="fill" x="8.5" y="8.5" width="23" height="23" rx="1.5" transform="rotate(45 20 20)" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="20" cy="20" r="10.5" fill="none" stroke="currentColor" strokeOpacity=".45" strokeWidth=".7" />
      </svg>
      <span>{n}</span>
    </span>
  );
}

// Small eight-pointed star used inside verse chips and as a list mark
export function IslamStarMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className}>
      <path d={starPath(8, 8, 7.4, 3.4)} fill="currentColor" fillOpacity=".9" />
      <circle cx="8" cy="8" r="1.6" fill="rgb(var(--isl-paper))" />
    </svg>
  );
}

// A vine with an inlaid tulip in the middle: the section break of long texts
export function IslamFloral({ className = "" }: { className?: string }) {
  const half = (
    <g>
      <path d="M115 31c-10 6-22 4-32-1-9-4-17-6-27-2-6 2-10 6-17 6" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M96 33c-1-6 2-11 8-13 1 6-2 11-8 13z" fill="rgb(var(--isl-jade))" fillOpacity=".22" stroke="currentColor" strokeWidth=".9" />
      <path d="M72 28c-5-3-6-8-4-13 5 2 7 8 4 13z" fill="rgb(var(--isl-jade))" fillOpacity=".22" stroke="currentColor" strokeWidth=".9" />
      <path d="M58 26c2 5 0 10-5 12-2-5 0-10 5-12z" fill="rgb(var(--isl-jade))" fillOpacity=".18" stroke="currentColor" strokeWidth=".9" />
      <circle cx="84" cy="21" r="2.6" fill="rgb(var(--isl-garnet))" fillOpacity=".35" stroke="currentColor" strokeWidth=".8" />
      <circle cx="38" cy="34" r="2.2" fill="rgb(var(--isl-lapis))" fillOpacity=".3" stroke="currentColor" strokeWidth=".8" />
      <path d="M30 34h-6M20 34l-2.2-2.2L15.6 34l2.2 2.2z" fill="currentColor" fillOpacity=".6" stroke="currentColor" strokeWidth=".8" />
    </g>
  );
  return (
    <svg viewBox="0 0 240 48" aria-hidden className={className}>
      {half}
      <g transform="matrix(-1 0 0 1 240 0)">{half}</g>
      {/* the tulip */}
      <path d="M120 5c7 7 8 17 0 27-8-10-7-20 0-27z" fill="rgb(var(--isl-garnet))" fillOpacity=".2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M120 32c-10-1-16-8-16-18 6 3 12 9 16 18z" fill="rgb(var(--isl-lapis))" fillOpacity=".18" stroke="currentColor" strokeWidth="1" />
      <path d="M120 32c10-1 16-8 16-18-6 3-12 9-16 18z" fill="rgb(var(--isl-lapis))" fillOpacity=".18" stroke="currentColor" strokeWidth="1" />
      <path d="M120 12v16" stroke="currentColor" strokeOpacity=".5" strokeWidth=".8" />
      <path d="M120 33.5l3 3-3 3-3-3z" fill="currentColor" />
    </svg>
  );
}

// A corner of floral inlay for framed panels (place four with .isl-corner tl/tr/bl/br)
export function IslamCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={`isl-corner ${pos}`}>
      <path d="M4 60V18C4 10 10 4 18 4h42" fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="1" />
      <path d="M9 60V20c0-6 5-11 11-11h40" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="1" />
      <path d="M14 30c0-9 7-16 16-16" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M22 18c-1 5-5 8-10 8 1-5 5-8 10-8z" fill="rgb(var(--isl-jade))" fillOpacity=".22" stroke="currentColor" strokeWidth=".8" />
      <path d="M36 14c-3 4-8 5-12 3 3-4 8-5 12-3z" fill="rgb(var(--isl-jade))" fillOpacity=".22" stroke="currentColor" strokeWidth=".8" />
      <path d="M14 38c-4-3-5-8-3-12 4 3 5 8 3 12z" fill="rgb(var(--isl-jade))" fillOpacity=".18" stroke="currentColor" strokeWidth=".8" />
      <path d={starPath(14, 14, 6.5, 3)} fill="rgb(var(--isl-garnet))" fillOpacity=".3" stroke="currentColor" strokeWidth=".8" />
      <circle cx="14" cy="14" r="1.4" fill="currentColor" />
      <circle cx="44" cy="12" r="1.6" fill="rgb(var(--isl-lapis))" fillOpacity=".5" />
      <circle cx="12" cy="44" r="1.6" fill="rgb(var(--isl-lapis))" fillOpacity=".5" />
    </svg>
  );
}
export function IslamCorners() {
  return <>{(["tl", "tr", "bl", "br"] as const).map((p) => <IslamCorner key={p} pos={p} />)}</>;
}

// The lattice dome of light: layered stars turning against each other, light falling through
export function IslamDome({ className = "", id = "dome" }: { className?: string; id?: string }) {
  return (
    <svg viewBox="0 0 400 400" aria-hidden className={`isl-dome ${className}`}>
      <defs>
        <pattern id={`${id}-a`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d={starPath(20, 20, 17, 8)} fill="none" stroke="currentColor" strokeWidth=".7" />
          <path d="M0 0l8 8M40 0l-8 8M0 40l8-8M40 40l-8-8" stroke="currentColor" strokeWidth=".6" />
        </pattern>
        <pattern id={`${id}-b`} width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(22.5)">
          <rect x="14" y="14" width="36" height="36" fill="none" stroke="currentColor" strokeWidth=".8" />
          <rect x="14" y="14" width="36" height="36" transform="rotate(45 32 32)" fill="none" stroke="currentColor" strokeWidth=".8" />
        </pattern>
        <radialGradient id={`${id}-m`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset=".55" stopColor="#fff" stopOpacity=".45" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-k`}><circle cx="200" cy="200" r="200" fill={`url(#${id}-m)`} /></mask>
        <radialGradient id={`${id}-sun`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgb(255 236 190)" stopOpacity=".35" /><stop offset=".5" stopColor="rgb(233 207 153)" stopOpacity=".08" /><stop offset="1" stopColor="rgb(233 207 153)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="200" fill={`url(#${id}-sun)`} />
      <g mask={`url(#${id}-k)`} opacity=".42">
        <g className="l1"><rect x="-60" y="-60" width="520" height="520" fill={`url(#${id}-a)`} /></g>
        <g className="l2" opacity=".8"><rect x="-60" y="-60" width="520" height="520" fill={`url(#${id}-b)`} /></g>
      </g>
      <circle cx="200" cy="200" r="196" fill="none" stroke="currentColor" strokeOpacity=".22" />
      <circle cx="200" cy="200" r="186" fill="none" stroke="currentColor" strokeOpacity=".12" strokeDasharray="2 6" />
    </svg>
  );
}

// Light flecks falling slowly through the lattice (positions are fixed so server and client agree)
const RAIN = [[8, 0, 9], [17, 3.2, 12], [26, 6.1, 10], [34, 1.4, 13], [43, 8.3, 11], [51, 4.4, 9.5], [59, 2.2, 12.5], [66, 7.1, 10.5], [74, 0.8, 13.5], [82, 5.6, 11], [90, 3.9, 9], [95, 9.4, 12]];
export function IslamRain({ className = "", fall = 420 }: { className?: string; fall?: number }) {
  return (
    <div aria-hidden className={`isl-rain ${className}`} style={{ ["--fall" as string]: `${fall}px` }}>
      {RAIN.map(([x, d, t], i) => <i key={i} style={{ left: `${x}%`, animationDelay: `${d}s`, animationDuration: `${t}s`, width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px` }} />)}
    </div>
  );
}

// Gold line along the arches at the bottom of a hero that carries .isl-arcade
export function IslamArcadeLine() {
  return <span aria-hidden className="isl-arcade-line" />;
}

// Section break between long passages
export function IslamBreak({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`isl-break ${className}`}><IslamFloral /></div>;
}

// The Sheikh Zayed Grand Mosque in one gold line: arcade, three domes, four minarets
export function IslamMosque({ className = "" }: { className?: string }) {
  const minaret = (x: number) => `M${x} 120V40h7v80M${x - 2.5} 40h12M${x + 1} 40v-9h5v9M${x + 3.5} 31v-8`;
  return (
    <svg viewBox="0 0 240 128" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={minaret(14)} /><path d={minaret(52)} /><path d={minaret(180)} /><path d={minaret(218)} />
      <path d="M66 120V86h108v34" />
      <path d="M92 86a28 33 0 0 1 56 0M120 53v-8M117.5 45h5" />
      <path d="M70 87a12 14 0 0 1 24 0M146 87a12 14 0 0 1 24 0" />
      <path d="M74 120v-14a6 6 0 0 1 12 0v14M92 120v-14a6 6 0 0 1 12 0v14M112 120v-17a8 8 0 0 1 16 0v17M136 120v-14a6 6 0 0 1 12 0v14M154 120v-14a6 6 0 0 1 12 0v14" />
      <path d="M0 120h240" strokeOpacity=".6" /><path d="M40 125h46M150 125h52" strokeOpacity=".35" />
    </svg>
  );
}
