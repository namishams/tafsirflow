// Ornaments for the Home, Quran index, Today and Academy screens (styles in src/styles/art-home.css).
// Eight-pointed star medallions, mihrab arches, the turning lattice dome with its rain of light, gold progress rings
// and quoted verses. Pure SVG/CSS, server-safe (no hooks), every piece is decorative (aria-hidden) unless it holds text.
import "@/styles/art-home.css";

// Outline of the khatam (two overlapping squares) as one path: 8 outer points, 8 inner corners
export function khatam(cx: number, cy: number, R: number) {
  const r = R * 0.7654;
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (Math.PI / 8) * i - Math.PI / 2, rad = i % 2 ? r : R; return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`; });
  return `M${pts.join("L")}Z`;
}

type StarTone = "light" | "dark" | "gold" | "emerald";
// A number (or a small sign) inside an eight-pointed star medallion
export function HomeStar({ children, size = 40, tone = "light", className = "", label }: { children?: React.ReactNode; size?: number; tone?: StarTone; className?: string; label?: string }) {
  return (
    <span className={`hm-star ${tone === "light" ? "" : `is-${tone}`} ${className}`} style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.32)) }} aria-label={label}>
      <svg viewBox="0 0 40 40" aria-hidden>
        <path className="o" d={khatam(20, 20, 19)} />
        <path className="i" d={khatam(20, 20, 15.6)} />
        <circle className="c" cx="20" cy="20" r="10.5" />
      </svg>
      {children !== undefined && <span className="hm-star-n">{children}</span>}
    </span>
  );
}

// Small star used as a finial, bullet or separator
export function StarGlyph({ size = 12, className = "" }: { size?: number; className?: string }) {
  return <svg aria-hidden viewBox="0 0 24 24" width={size} height={size} className={className}><path d={khatam(12, 12, 11.5)} fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1.2" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>;
}

// A pointed arch (mihrab) over a framed body. The cap scales with the width (ratio = cap height / width), so the arch keeps
// its shape on every screen; `lift` pulls the first content up into the arch (fraction of the width).
export function HomeArch({ children, ratio = 0.3, lift = 0, dark = false, className = "", bodyClass = "", fin = true }: { children: React.ReactNode; ratio?: number; lift?: number; dark?: boolean; className?: string; bodyClass?: string; fin?: boolean }) {
  const H = Math.round(400 * ratio), y = (f: number) => (H * f).toFixed(1);
  const outer = `M0 ${H}L0 ${y(0.72)}C0 ${y(0.36)} 104 ${y(0.17)} 200 0C296 ${y(0.17)} 400 ${y(0.36)} 400 ${y(0.72)}L400 ${H}`;
  const inner = `M10 ${H + 1}L10 ${y(0.74)}C10 ${y(0.42)} 110 ${y(0.25)} 200 ${y(0.1)}C290 ${y(0.25)} 390 ${y(0.42)} 390 ${y(0.74)}L390 ${H + 1}`;
  return (
    <div className={`hm-arch ${dark ? "is-dark" : ""} ${className}`} style={{ ["--cap" as string]: `${(ratio * 100).toFixed(2)}%` }}>
      <svg className="hm-arch-cap" viewBox={`0 0 400 ${H}`} aria-hidden>
        <path className="f" d={`${outer}V${H + 0.5}H0Z`} />
        <path className="l" d={outer} vectorEffect="non-scaling-stroke" />
        <path className="l2" d={inner} vectorEffect="non-scaling-stroke" />
      </svg>
      {fin && <span className="hm-arch-fin" aria-hidden><StarGlyph size={22} /></span>}
      <div className={`hm-arch-body ${bodyClass}`}>{lift ? <div style={{ marginTop: `-${(lift * 100).toFixed(2)}%` }} className="relative h-full">{children}</div> : children}</div>
    </div>
  );
}

// The lattice dome of light: two layers of eight-fold stars inside a circle, turning slowly against each other
export function HomeDome({ id, className = "" }: { id: string; className?: string }) {
  const layer = (pid: string, size: number, rot: number, op: number, cls: string) => (
    <svg viewBox="0 0 400 400" className={cls} aria-hidden>
      <defs>
        <pattern id={pid} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform={`rotate(${rot} 200 200)`}>
          <g fill="none" stroke="#e9cf99" strokeWidth=".9" strokeOpacity={op}>
            <path d={khatam(size / 2, size / 2, size * 0.36)} />
            <path d={`M0 0L${size * 0.2} ${size * 0.2}M${size} 0L${size * 0.8} ${size * 0.2}M0 ${size}L${size * 0.2} ${size * 0.8}M${size} ${size}L${size * 0.8} ${size * 0.8}`} />
            <circle cx={size / 2} cy={size / 2} r={size * 0.1} />
          </g>
        </pattern>
      </defs>
      <circle cx="200" cy="200" r="196" fill={`url(#${pid})`} />
    </svg>
  );
  return (
    <div aria-hidden className={`hm-dome ${className}`} style={{ WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 0%, rgb(0 0 0 / .55) 45%, transparent 72%)", maskImage: "radial-gradient(circle at 50% 50%, #000 0%, rgb(0 0 0 / .55) 45%, transparent 72%)" }}>
      {layer(`${id}-a`, 34, 0, 0.5, "d1")}
      {layer(`${id}-b`, 58, 22.5, 0.42, "d2")}
      <svg viewBox="0 0 400 400" aria-hidden><g fill="none" stroke="#e9cf99"><circle cx="200" cy="200" r="197" strokeOpacity=".35" /><circle cx="200" cy="200" r="186" strokeOpacity=".18" strokeDasharray="2 6" /></g></svg>
    </div>
  );
}

export const HomeRain = ({ className = "" }: { className?: string }) => <span aria-hidden className={`hm-rain ${className}`} />;
export const HomeFrieze = ({ className = "" }: { className?: string }) => <div aria-hidden className={`hm-frieze ${className}`} />;
export const HomeCorners = () => <span aria-hidden className="hm-corners" />;
export const HomeGlowLayer = () => <span aria-hidden className="hm-glow-l" />;

// A quoted verse of the Quran (exact Uthmani text) with its reference, in ornate brackets
export function HomeVerse({ text, cite, className = "" }: { text: string; cite: string; className?: string }) {
  return (
    <p className={`hm-verse ${className}`} dir="rtl" lang="ar">
      <span>{"﴿"}&nbsp;{text}&nbsp;{"﴾"}</span> <span className="ref" dir="ltr">{cite}</span>
    </p>
  );
}

// Gold progress ring with a ring of small stars around it (value 0..1)
export function HomeRing({ value, size = 96, id, dark = true, stroke = 6, children, className = "" }: { value: number; size?: number; id: string; dark?: boolean; stroke?: number; children?: React.ReactNode; className?: string }) {
  const r = 40, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3e2b6" /><stop offset=".5" stopColor="#c9a65e" /><stop offset="1" stopColor="#e9cf99" /></linearGradient></defs>
        <g fill={dark ? "#e9cf99" : "#c9a65e"} fillOpacity={dark ? ".35" : ".45"}>
          {Array.from({ length: 16 }, (_, i) => { const a = (Math.PI / 8) * i; return <path key={i} d={khatam(50 + 48 * Math.sin(a), 50 - 48 * Math.cos(a), i % 2 ? 1.4 : 2.2)} />; })}
        </g>
        <circle cx="50" cy="50" r={r} fill="none" stroke={dark ? "rgba(255,255,255,.13)" : "rgb(201 166 94 / .18)"} strokeWidth={stroke} />
        <circle cx="50" cy="50" r={r - stroke / 2 - 3} fill="none" stroke={dark ? "#e9cf99" : "#c9a65e"} strokeOpacity=".3" strokeWidth=".6" strokeDasharray="1 2.4" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(v * c).toFixed(1)} ${c.toFixed(1)}`} transform="rotate(-90 50 50)" className="hm-ring-p" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

// Tiny line icons for where a surah was revealed: the Kaaba (Makkah) and the green dome (Madinah)
export const IconKaaba = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"><path d="M3 5.5L8 3.5l5 2v6.5l-5 2-5-2z" /><path d="M3 5.5l5 2 5-2M8 7.5v6.5" /><path d="M3 7.6l5 2 5-2" strokeWidth="1.6" /></svg>
);
export const IconDome = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13.5h10M4 13.5V10h8v3.5" /><path d="M4.5 10C4.5 7 6 5.6 8 5.2c2 .4 3.5 1.8 3.5 4.8" /><path d="M8 5.2V3.4M8 1.6a1 1 0 1 0 .9 1.4" /></svg>
);
