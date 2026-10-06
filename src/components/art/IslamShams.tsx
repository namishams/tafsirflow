import { starPath } from "./IslamArt";

// The sun of the Shams Method: rays drawn like a girih star around a sixteen-point rosette, the word شمس in the middle.
// Outer rays and inner rosette turn slowly against each other (still under reduced motion).
export function IslamSun({ className = "", word = "شمس", id = "sun" }: { className?: string; word?: string; id?: string }) {
  const rays = Array.from({ length: 48 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 48, r1 = 124, r2 = i % 2 ? 160 : 181;
    return `M${(200 + r1 * Math.cos(a)).toFixed(1)} ${(200 + r1 * Math.sin(a)).toFixed(1)}L${(200 + r2 * Math.cos(a)).toFixed(1)} ${(200 + r2 * Math.sin(a)).toFixed(1)}`;
  }).join("");
  return (
    <svg viewBox="0 0 400 400" aria-hidden className={`pointer-events-none select-none overflow-visible ${className}`}>
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgb(255 228 160)" stopOpacity=".55" /><stop offset=".45" stopColor="rgb(233 190 110)" stopOpacity=".16" /><stop offset="1" stopColor="rgb(233 190 110)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e7bf" /><stop offset=".45" stopColor="#d6b46c" /><stop offset=".72" stopColor="#f3e2b6" /><stop offset="1" stopColor="#b8924a" />
        </linearGradient>
      </defs>
      <circle className="isl-sun-pulse" cx="200" cy="200" r="200" fill={`url(#${id}-glow)`} />
      <g className="isl-sun">
        <path d={starPath(200, 200, 194, 168, 24)} fill="rgb(233 207 153)" fillOpacity=".05" stroke={`url(#${id}-metal)`} strokeOpacity=".55" strokeWidth="1" />
        <path d={rays} stroke={`url(#${id}-metal)`} strokeOpacity=".7" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="200" cy="200" r="146" fill="none" stroke={`url(#${id}-metal)`} strokeOpacity=".55" />
      </g>
      <g className="isl-sun" style={{ animationDirection: "reverse", animationDuration: "240s" }}>
        <circle cx="200" cy="200" r="136" fill="none" stroke="rgb(233 207 153)" strokeOpacity=".35" strokeDasharray="1.5 5" />
        <path d={starPath(200, 200, 122, 98, 16)} fill="rgb(233 207 153)" fillOpacity=".07" stroke={`url(#${id}-metal)`} strokeWidth="1.1" />
        <rect x="128" y="128" width="144" height="144" fill="none" stroke="rgb(233 207 153)" strokeOpacity=".4" />
        <rect x="128" y="128" width="144" height="144" transform="rotate(45 200 200)" fill="none" stroke="rgb(233 207 153)" strokeOpacity=".4" />
      </g>
      <circle cx="200" cy="200" r="84" fill="rgb(5 28 21)" fillOpacity=".72" stroke={`url(#${id}-metal)`} strokeWidth="1.4" />
      <circle cx="200" cy="200" r="76" fill="none" stroke="rgb(233 207 153)" strokeOpacity=".35" strokeDasharray="2 4" />
      <text x="200" y="226" textAnchor="middle" fontSize="70" className="font-callig" fill={`url(#${id}-metal)`}>{word}</text>
    </svg>
  );
}

// Tiny animated pictures for the seven steps (48×48, drawn in currentColor)
export function IslamStepIcon({ n, className = "" }: { n: number; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const block = (x: number, cls = "") => <rect key={x} className={cls} x={x} y="20" width="10" height="8" rx="2" fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1.2" />;
  let body: React.ReactNode = null;
  if (n === 1) body = (
    <g {...common} className="isl-ic-wave">
      <path d="M8 20h5l6-5v18l-6-5H8z" fill="currentColor" fillOpacity=".18" />
      <path d="M24 19a7 7 0 0 1 0 10" /><path d="M28 15a13 13 0 0 1 0 18" /><path d="M32 11a19 19 0 0 1 0 26" />
    </g>
  );
  else if (n === 2) body = (
    <g className="isl-ic-build">
      {block(5, "b1")}{block(19, "b2")}{block(33, "b3")}
      <path d="M7 35h33m-4-3 4 3-4 3" {...common} strokeWidth={1.3} strokeOpacity=".7" />
    </g>
  );
  else if (n === 3) body = (
    <g className="isl-ic-words">
      {block(5)}{block(19)}{block(33)}
      <rect className="under" x="33" y="32" width="10" height="2.4" rx="1.2" fill="currentColor" />
    </g>
  );
  else if (n === 4) body = (
    <g {...common} className="isl-ic-lamp">
      <path d="M24 6v4M18 10h12" /><path d="M16 14h16l-2.5 17c-.8 4-10.2 4-11 0z" fill="currentColor" fillOpacity=".12" />
      <path className="flame" d="M24 18c2.6 3.4 2.8 6.6 0 9-2.8-2.4-2.6-5.6 0-9z" fill="currentColor" fillOpacity=".55" />
      <path d="M20 40h8" />
    </g>
  );
  else if (n === 5) body = (
    <g {...common} className="isl-ic-book">
      <path d="M24 15c-5-3-11-3-16-1v21c5-2 11-2 16 1 5-3 11-3 16-1V14c-5-2-11-2-16 1z" fill="currentColor" fillOpacity=".1" />
      <path d="M24 15v21" />
      <path className="ln l1" pathLength={1} d="M28 20h8" /><path className="ln l2" pathLength={1} d="M28 24h8" /><path className="ln l3" pathLength={1} d="M28 28h6" />
      <path d="M12 20h7M12 24h7M12 28h5" strokeOpacity=".45" />
    </g>
  );
  else if (n === 6) body = (
    <g className="isl-ic-fade">
      {[5, 19, 33].map((x) => <rect key={`o${x}`} x={x} y="20" width="10" height="8" rx="2" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1" strokeDasharray="2 2" />)}
      {block(5, "f3")}{block(19, "f2")}{block(33, "f1")}
    </g>
  );
  else body = (
    <g {...common} className="isl-ic-heart">
      <path className="heart" pathLength={1} d="M24 37c-8-5-12-9-12-14a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 5-4 9-12 14z" fill="currentColor" fillOpacity=".12" />
      <path className="spark" d="M36 8l1.2 2.8L40 12l-2.8 1.2L36 16l-1.2-2.8L32 12l2.8-1.2z" fill="currentColor" stroke="none" />
    </g>
  );
  return <svg viewBox="0 0 48 48" aria-hidden className={className}>{body}</svg>;
}

// Arabic word for each step (shown as calligraphy beside the step)
export const STEP_AR = ["اِسْتِمَاع", "بِنَاء", "كَلِمَة كَلِمَة", "مَعْنَى", "تَفْسِير", "اِسْتِذْكَار", "تَدَبُّر"];
