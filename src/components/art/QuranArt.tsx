import "@/styles/art-quran.css";
import type { Place } from "./QuranMeta";

// Shared ornaments of the Quran browsing pages: the eight-pointed star medallion with a gold progress ring, the small
// Kaaba / Green Dome marks for the place of revelation, and the shamsa (illuminated sun medallion of a mushaf frontispiece).

const pt = (r: number, deg: number, cx = 0, cy = 0) => { const a = (deg * Math.PI) / 180; return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`; };
// khatam: union of two squares (16 vertices)
const octagram = (a: number, cx: number, cy: number) => `M${Array.from({ length: 16 }, (_, i) => pt(i % 2 ? a / Math.cos(Math.PI / 8) : a * Math.SQRT2, i * 22.5 - 90, cx, cy)).join("L")}Z`;

const STAR = octagram(11.6, 26, 26);

// Surah number inside an eight-pointed star; the ring around it fills with gold as verses are learned
export function QuranStar({ n, pct = 0, here = false, className = "" }: { n: number | string; pct?: number; here?: boolean; className?: string }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <span className={`q-star relative grid shrink-0 place-items-center ${p >= 100 ? "is-full" : ""} ${here ? "is-here" : ""} ${className}`}>
      <svg aria-hidden viewBox="0 0 52 52" className="absolute inset-0 h-full w-full overflow-visible">
        <circle cx="26" cy="26" r="24.5" className="q-star-track" />
        {p > 0 && <circle cx="26" cy="26" r="24.5" pathLength={100} strokeDasharray={`${Math.max(p, 3)} 100`} transform="rotate(-90 26 26)" className="q-star-ring" />}
        <g className="q-star-shape"><path d={STAR} /><circle cx="26" cy="26" r="9.6" className="q-star-inner" /></g>
      </svg>
      <span className={`q-star-num relative tabular-nums ${String(n).length > 2 ? "is-long" : ""}`}>{n}</span>
    </span>
  );
}

// Kaaba for Makkah, the Green Dome with its minaret for Madinah
export function QuranPlaceIcon({ place, className = "" }: { place: Place; className?: string }) {
  return place === "makki" ? (
    <svg aria-hidden viewBox="0 0 16 16" className={`h-3.5 w-3.5 shrink-0 ${className}`}>
      <path d="M2 5.4 8 3l6 2.4L8 7.8z" fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth=".9" strokeLinejoin="round" />
      <path d="M2 5.4v7.2L8 15V7.8zM14 5.4v7.2L8 15V7.8z" fill="currentColor" fillOpacity=".75" stroke="currentColor" strokeWidth=".9" strokeLinejoin="round" />
      <path d="M2 7.6l6 2.4 6-2.4" fill="none" stroke="rgb(var(--gold))" strokeWidth="1.1" />
    </svg>
  ) : (
    <svg aria-hidden viewBox="0 0 16 16" className={`h-3.5 w-3.5 shrink-0 ${className}`}>
      <path d="M2.6 11.2c0-3.3 2.2-5.4 4.4-6.2 2.2.8 4.4 2.9 4.4 6.2z" fill="currentColor" fillOpacity=".75" stroke="currentColor" strokeWidth=".9" strokeLinejoin="round" />
      <path d="M7 5V2.4M7 2.4c.7 0 1-.4 1-.9" fill="none" stroke="rgb(var(--gold))" strokeWidth="1" strokeLinecap="round" />
      <path d="M2 11.2h10v3.6H2z" fill="currentColor" fillOpacity=".3" stroke="currentColor" strokeWidth=".9" />
      <path d="M13 14.8V4.8l.9-2.6.9 2.6v10z" fill="currentColor" fillOpacity=".5" stroke="currentColor" strokeWidth=".8" strokeLinejoin="round" />
    </svg>
  );
}

// rays, scalloped band and star of the shamsa, computed once
const RAYS = Array.from({ length: 72 }, (_, i) => { const d = i * 5; const long = i % 2 === 0; return `M${pt(172, d, 200, 200)}L${pt(long ? 194 : 183, d, 200, 200)}`; }).join("");
const DOTS = Array.from({ length: 24 }, (_, i) => pt(199, i * 15 + 2.5, 200, 200).split(",").map(Number));
const LOBES = (() => {
  const n = 16, span = 360 / n; let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = i * span - 90, a1 = a0 + span, m = a0 + span / 2;
    d += `${i ? "L" : "M"}${pt(110, a0, 200, 200)}Q${pt(124, a0 + span * 0.12, 200, 200)} ${pt(130, m, 200, 200)}Q${pt(124, a1 - span * 0.12, 200, 200)} ${pt(110, a1, 200, 200)}`;
  }
  return d + "Z";
})();
const BIG_STAR = octagram(70, 200, 200);

// Illuminated sun medallion: rays that turn slowly, a ring of verses, a scalloped gold band and a dark centre
// in which "al-Qur'an al-Karim" is written in gold
export function QuranShamsa({ ring, lines = ["القرآن", "الكريم"], className = "" }: { ring: string; lines?: [string, string]; className?: string }) {
  return (
    <div aria-hidden className={`q-shamsa relative select-none ${className}`}>
      <span className="q-shamsa-glow" />
      <svg viewBox="0 0 400 400" className="relative block h-full w-full overflow-visible">
        <defs>
          <radialGradient id="qs-disc" cx="50%" cy="38%" r="70%">
            <stop offset="0" stopColor="#135640" /><stop offset=".6" stopColor="#0a3427" /><stop offset="1" stopColor="#05211a" />
          </radialGradient>
          <linearGradient id="qs-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6e7bf" /><stop offset=".42" stopColor="#d9b56c" /><stop offset=".7" stopColor="#f3e2b6" /><stop offset="1" stopColor="#b98f45" />
          </linearGradient>
          <pattern id="qs-girih" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M7 7h14v14H7zM14 2.5L25.5 14 14 25.5 2.5 14z" fill="none" stroke="#e9cf99" strokeOpacity=".12" strokeWidth=".8" /></pattern>
          <path id="qs-ring" d="M200,200 m-144,0 a144,144 0 1,1 288,0 a144,144 0 1,1 -288,0" />
        </defs>
        <g className="q-shamsa-rays">
          <path d={RAYS} className="q-shamsa-line" strokeWidth="1" />
          {DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.7" className="q-shamsa-dot" />)}
        </g>
        <circle cx="200" cy="200" r="168" className="q-shamsa-line" strokeWidth="1.3" />
        <circle cx="200" cy="200" r="163" className="q-shamsa-line" strokeWidth=".6" strokeDasharray="1.5 4" />
        <g className="q-shamsa-verse">
          <text className="font-arabic q-shamsa-text" fontSize="19" direction="ltr"><textPath href="#qs-ring" startOffset="0">{ring}</textPath></text>
        </g>
        <circle cx="200" cy="200" r="134" className="q-shamsa-line" strokeWidth="1" />
        <path d={LOBES} className="q-shamsa-lobes" />
        <circle cx="200" cy="200" r="106" fill="url(#qs-disc)" stroke="url(#qs-gold)" strokeWidth="2" />
        <circle cx="200" cy="200" r="106" fill="url(#qs-girih)" />
        <circle cx="200" cy="200" r="99" fill="none" stroke="#e9cf99" strokeOpacity=".45" strokeWidth=".8" strokeDasharray="1 3" />
        <path d={BIG_STAR} fill="none" stroke="#e9cf99" strokeOpacity=".2" strokeWidth="1" className="q-shamsa-star" />
        <g className="q-shamsa-callig">
          <text x="200" y="207" textAnchor="middle" fontSize="60" className="font-callig" fill="url(#qs-gold)" stroke="#f3e2b6">{lines[0]}</text>
          <text x="200" y="256" textAnchor="middle" fontSize="36" className="font-callig" fill="url(#qs-gold)" stroke="#f3e2b6">{lines[1]}</text>
        </g>
        <path d="M200 116l3 7.2 7.2 3-7.2 3-3 7.2-3-7.2-7.2-3 7.2-3z" fill="url(#qs-gold)" opacity=".85" />
      </svg>
    </div>
  );
}

// Segmented control in gold and emerald
export function QuranSegmented<T extends string>({ value, options, onChange, label, className = "" }: { value: T; options: { id: T; label: React.ReactNode }[]; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div role="group" aria-label={label} className={`q-seg ${className}`}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

// Floral inlay after the pietra dura of the Grand Mosque: a vine with a rosette flower, a tulip and leaves
const LEAF = "M0 0C7-9 21-10 30-2C21 4 8 5 0 0Z";
export function QuranInlay({ className = "" }: { className?: string }) {
  const leaves: [number, number, number][] = [[34, 160, -40], [58, 118, -70], [66, 92, 200], [96, 34, -10], [108, 152, -20], [134, 124, -55], [20, 182, -15]];
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={`q-inlay ${className}`}>
      <g fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 198C52 176 78 128 70 76C66 46 88 22 118 16" fill="none" />
        <path d="M30 186C82 182 124 160 150 112" fill="none" />
        {leaves.map(([x, y, r], i) => <path key={i} d={LEAF} transform={`translate(${x} ${y}) rotate(${r})`} />)}
        <g transform="translate(70 76)">
          {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="0" cy="-11" rx="5.2" ry="10" transform={`rotate(${i * 45})`} />)}
          <circle r="5.5" fillOpacity=".25" />
        </g>
        <path d="M118 30c-11-6-12-19-6-27 3 5 6 7 6 11 0-4 3-6 6-11 6 8 5 21-6 27z" transform="translate(4 -6)" fillOpacity=".16" />
        <g transform="translate(150 112)">
          {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx="0" cy="-6.5" rx="3.2" ry="6" transform={`rotate(${i * 60})`} />)}
          <circle r="3" fillOpacity=".3" />
        </g>
        <circle cx="34" cy="128" r="2.2" fillOpacity=".4" /><circle cx="112" cy="70" r="2.2" fillOpacity=".4" /><circle cx="160" cy="150" r="2.2" fillOpacity=".4" />
      </g>
    </svg>
  );
}

const SEAL = octagram(17.5, 30, 30);
// Emerald seal in the shape of an eight-pointed star with a gold rim – for reciters' initials
export function QuranSeal({ children, className = "", on = false }: { children: React.ReactNode; className?: string; on?: boolean }) {
  return (
    <span className={`q-seal relative grid shrink-0 place-items-center ${on ? "is-on" : ""} ${className}`}>
      <svg aria-hidden viewBox="0 0 60 60" className="absolute inset-0 h-full w-full overflow-visible">
        <circle cx="30" cy="30" r="28.5" className="q-seal-halo" />
        <g className="q-seal-shape"><path d={SEAL} /></g>
        <circle cx="30" cy="30" r="15.5" className="q-seal-inner" />
      </svg>
      <span className="q-seal-txt relative">{children}</span>
    </span>
  );
}

// Radio orb: the shamsa's rays and scalloped band around an emerald disc; it turns while the station is on air
export function QuranOrb({ on = false, children, className = "" }: { on?: boolean; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`q-orb relative grid aspect-square place-items-center ${on ? "is-on" : ""} ${className}`}>
      <svg aria-hidden viewBox="0 0 400 400" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <radialGradient id="qo-disc" cx="50%" cy="35%" r="72%"><stop offset="0" stopColor="#16614a" /><stop offset=".6" stopColor="#0a3427" /><stop offset="1" stopColor="#04190f" /></radialGradient>
          <linearGradient id="qo-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e7bf" /><stop offset=".45" stopColor="#d9b56c" /><stop offset=".7" stopColor="#f3e2b6" /><stop offset="1" stopColor="#b98f45" /></linearGradient>
        </defs>
        <g className="q-orb-rays"><path d={RAYS} className="q-shamsa-line" strokeWidth="1.2" />{DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" className="q-shamsa-dot" />)}</g>
        <circle cx="200" cy="200" r="160" className="q-shamsa-line" strokeWidth="1" strokeDasharray="1.5 5" />
        <g className="q-orb-lobes"><path d={LOBES} className="q-shamsa-lobes" /></g>
        <circle cx="200" cy="200" r="106" fill="url(#qo-disc)" stroke="url(#qo-gold)" strokeWidth="2.5" />
        <circle cx="200" cy="200" r="98" fill="none" stroke="#e9cf99" strokeOpacity=".4" strokeWidth=".9" strokeDasharray="1 3.5" />
        <path d={BIG_STAR} fill="none" stroke="#e9cf99" strokeOpacity=".22" strokeWidth="1.2" className="q-orb-star" />
      </svg>
      <span className="relative">{children}</span>
    </div>
  );
}
