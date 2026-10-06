import "@/styles/art-practice.css";

// Shared art for the practice tools and the account pages: the arch window (a mihrab of white marble and gold with
// light falling through a lattice, after the Louvre Abu Dhabi dome), the arcade band, the illuminated medallion for
// scores and avatars, numbers in a star and a gentle celebration. Pure SVG/CSS, no client code – usable everywhere.

// a pointed arch between x0 and x1: springs at ySpring, apex at yApex, standing on yBase
export function archPath(x0: number, x1: number, yBase: number, ySpring: number, yApex: number) {
  const w = x1 - x0, mid = (x0 + x1) / 2, rise = ySpring - yApex;
  const f = (n: number) => n.toFixed(1);
  return `M${f(x0)} ${f(yBase)}V${f(ySpring)}C${f(x0)} ${f(ySpring - rise * 0.55)} ${f(mid - w * 0.22)} ${f(yApex + rise * 0.18)} ${f(mid)} ${f(yApex)}C${f(mid + w * 0.22)} ${f(yApex + rise * 0.18)} ${f(x1)} ${f(ySpring - rise * 0.55)} ${f(x1)} ${f(ySpring)}V${f(yBase)}`;
}

export function starPath(cx: number, cy: number, R: number, r: number, n = 8, rot = -Math.PI / 2) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) { const a = (Math.PI / n) * i + rot, rad = i % 2 ? r : R; pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`); }
  return `M${pts.join("L")}Z`;
}

// Metallic gold, as on the calligraphy rings and medallions elsewhere on the site
function Metal({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f6e7bf" /><stop offset=".45" stopColor="#c9a65e" /><stop offset=".72" stopColor="#efe2bf" /><stop offset="1" stopColor="#8f7238" />
    </linearGradient>
  );
}

// The arch window: a gilded pointed arch with capitals, a lattice of eight-pointed stars inside, light that breathes,
// a fine rain of light, an optional hanging lamp and a word in Kufic script at its foot.
export function PracticeWindow({ word, uid = "pw", lamp = false, className = "" }: { word?: string; uid?: string; lamp?: boolean; className?: string }) {
  const outer = archPath(8, 232, 320, 128, 6), inner = archPath(20, 220, 320, 132, 22), clip = archPath(28, 212, 300, 135, 34);
  const fs = !word ? 0 : word.length <= 4 ? 62 : word.length <= 6 ? 50 : word.length <= 9 ? 40 : 32;
  return (
    <svg aria-hidden viewBox="0 0 240 320" className={`pa-window pointer-events-none select-none ${className}`}>
      <defs>
        <Metal id={`${uid}-m`} />
        <radialGradient id={`${uid}-l`} cx="50%" cy="26%" r="68%">
          <stop offset="0" stopColor="#fff4d6" stopOpacity=".7" /><stop offset=".35" stopColor="#e9cf99" stopOpacity=".28" /><stop offset="1" stopColor="#e9cf99" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${uid}-p`} width="30" height="30" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#e9cf99" strokeWidth=".7" strokeOpacity=".36">
            <path d="M8 8h14v14H8z" /><path d="M15 5.1L24.9 15 15 24.9 5.1 15z" /><path d="M0 0l5 5M30 0l-5 5M0 30l5-5M30 30l-5-5" />
          </g>
        </pattern>
        <pattern id={`${uid}-r`} width="16" height="48" patternUnits="userSpaceOnUse">
          <path d="M4 2v7M12 26v5" stroke="#fff1cc" strokeOpacity=".45" strokeWidth="1" strokeLinecap="round" />
        </pattern>
        <clipPath id={`${uid}-c`}><path d={`${clip}Z`} /></clipPath>
      </defs>
      {/* marble field and lattice */}
      <path d={`${inner}Z`} fill="rgb(255 255 255 / .035)" />
      <g clipPath={`url(#${uid}-c)`}>
        <rect className="pa-light" x="0" y="0" width="240" height="320" fill={`url(#${uid}-l)`} />
        <g className="pa-lattice"><rect x="-20" y="0" width="280" height="320" fill={`url(#${uid}-p)`} /></g>
        <g className="pa-rain"><rect x="0" y="-48" width="240" height="380" fill={`url(#${uid}-r)`} /></g>
      </g>
      {/* gilded arch with two rules and capitals */}
      <path d={outer} fill="none" stroke={`url(#${uid}-m)`} strokeWidth="2" />
      <path d={inner} fill="none" stroke="#d6b46c" strokeOpacity=".55" strokeWidth="1" />
      <path d={clip} fill="none" stroke="#d6b46c" strokeOpacity=".25" strokeWidth=".8" strokeDasharray="2 4" />
      <g fill={`url(#${uid}-m)`}><rect x="3" y="124" width="22" height="5" rx="1" /><rect x="215" y="124" width="22" height="5" rx="1" /></g>
      <path d={starPath(120, 6, 7, 3)} fill={`url(#${uid}-m)`} />
      {lamp && (
        <g className="pa-lamp">
          <path d="M120 36v38" stroke="#d6b46c" strokeOpacity=".6" strokeWidth=".8" />
          <circle cx="120" cy="92" r="22" fill="#ffe7a8" fillOpacity=".14" />
          <path d="M108 78h24l-3 6h-18zM111 84h18l-2 18c-.6 5-13.4 5-14 0z" fill="none" stroke={`url(#${uid}-m)`} strokeWidth="1.3" />
          <path d="M120 88c3.4 3.2 3.4 8 0 10.6-3.4-2.6-3.4-7.4 0-10.6z" fill="#ffe7a8" fillOpacity=".85" />
        </g>
      )}
      {word && (
        <>
          <path d="M44 300h152" stroke="#d6b46c" strokeOpacity=".45" strokeWidth=".8" />
          <path d={starPath(120, 300, 5, 2.2)} fill="#d6b46c" />
          <text x="120" y={286 - fs * 0.12} textAnchor="middle" fontSize={fs} className="font-kufi" fill={`url(#${uid}-m)`} direction="rtl">{word}</text>
        </>
      )}
    </svg>
  );
}

// Dark hero of a practice page: kicker, title, lead and actions on one side, the arch window on the other,
// the arcade along the lower edge. On phones the window stands quietly behind the text.
export function PracticeHero({ kicker, title, lead, word, uid = "ph", lamp = false, children, aside, className = "" }: {
  kicker?: React.ReactNode; title: React.ReactNode; lead?: React.ReactNode; word?: string; uid?: string; lamp?: boolean; children?: React.ReactNode; aside?: React.ReactNode; className?: string;
}) {
  return (
    <section className={`stage girih relative overflow-hidden text-[#eef0f3] ${className}`}>
      {!aside && <PracticeWindow word={word} uid={`${uid}-m`} lamp={lamp} className="absolute -end-10 top-4 h-[230px] w-auto opacity-30 md:hidden" />}
      <div className={`relative mx-auto grid max-w-6xl gap-8 px-5 pb-12 pt-10 sm:pb-16 sm:pt-14 [&>*]:min-w-0 ${aside ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start" : "md:grid-cols-[minmax(0,1fr)_auto] md:items-center"}`}>
        <div>
          {kicker && <p className="rise text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{kicker}</p>}
          <h1 className="rise font-display mt-3 max-w-3xl text-[38px] leading-[1.06] sm:text-[52px] lg:text-6xl" style={{ animationDelay: "100ms" }}>{title}</h1>
          {lead && <div className="rise mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70" style={{ animationDelay: "200ms" }}>{lead}</div>}
          {children && <div className="rise mt-7" style={{ animationDelay: "300ms" }}>{children}</div>}
        </div>
        {aside ?? <PracticeWindow word={word} uid={uid} lamp={lamp} className="rise hidden h-[300px] w-auto md:block lg:h-[340px]" />}
      </div>
      <div className="pa-arcade" />
    </section>
  );
}

// Illuminated medallion: a gilded sixteen-point rosette, a dark enamel disc and a gold ring that fills to pct.
// The centre takes any content (a score, an initial in Kufic, a number).
export function PracticeMedallion({ pct, size = 140, uid = "pm", children, className = "", turn = false }: { pct?: number; size?: number; uid?: string; children?: React.ReactNode; className?: string; turn?: boolean }) {
  const C = 2 * Math.PI * 33;
  const p = pct === undefined ? null : Math.max(0, Math.min(1, pct));
  return (
    <span className={`relative inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="absolute inset-0 drop-shadow-[0_10px_18px_rgba(0,0,0,.28)]">
        <defs>
          <Metal id={`${uid}-m`} />
          <radialGradient id={`${uid}-e`} cx="38%" cy="30%" r="80%"><stop offset="0" stopColor="#14533f" /><stop offset="1" stopColor="#06231a" /></radialGradient>
        </defs>
        <g className={turn ? "pa-turn" : undefined}>
          <path d={starPath(50, 50, 49.5, 42, 16)} fill={`url(#${uid}-m)`} />
          <path d={starPath(50, 50, 46, 40, 16, -Math.PI / 2 + Math.PI / 16)} fill={`url(#${uid}-m)`} opacity=".7" />
        </g>
        <circle cx="50" cy="50" r="38.5" fill={`url(#${uid}-e)`} stroke="#5c4519" strokeOpacity=".55" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="#f3e2b6" strokeOpacity=".16" strokeWidth="2.4" />
        {p !== null && <circle className="pa-ring-fill" cx="50" cy="50" r="33" fill="none" stroke={`url(#${uid}-m)`} strokeWidth="2.6" strokeLinecap="round" strokeDasharray={`${(p * C).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 50 50)" />}
        <circle cx="50" cy="50" r="28.5" fill="none" stroke="#f3e2b6" strokeOpacity=".3" strokeWidth=".6" strokeDasharray="1 2.4" />
        <path d="M22 40a30 30 0 0 1 30-20" stroke="#fff" strokeOpacity=".16" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <span className="relative grid place-items-center text-center text-[#f3e2b6]">{children}</span>
    </span>
  );
}

// A number inside an eight-pointed star (lesson numbers, steps)
export function PracticeStarNum({ n, size = 40, className = "", filled = false }: { n: React.ReactNode; size?: number; className?: string; filled?: boolean }) {
  return (
    <span className={`pa-star-num font-display font-extrabold ${filled ? "text-[rgb(8_38_29)]" : "text-gold"} ${className}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      <svg viewBox="0 0 40 40" aria-hidden>
        <path d={starPath(20, 20, 19.5, 15.2)} fill={filled ? "#d6b46c" : "rgb(var(--gold) / .08)"} stroke="rgb(var(--gold))" strokeOpacity={filled ? 0 : 0.7} strokeWidth="1" />
        {!filled && <circle cx="20" cy="20" r="11.5" fill="none" stroke="rgb(var(--gold))" strokeOpacity=".3" strokeWidth=".7" />}
      </svg>
      <span className="relative tabular-nums">{n}</span>
    </span>
  );
}

// Small gold eight-pointed star (bullets, separators)
export function PracticeStar({ className = "", size = 12 }: { className?: string; size?: number }) {
  return <svg aria-hidden viewBox="0 0 12 12" width={size} height={size} className={`shrink-0 text-[rgb(var(--gold))] ${className}`}><path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill="currentColor" /></svg>;
}

// Gentle celebration: a few small gold stars rise behind a result (hidden for reduced motion)
const RISE: [number, number, number][] = [[8, 0, 1], [18, .5, .8], [27, 1.1, 1.2], [36, .2, .7], [46, .8, 1], [55, 1.4, .8], [63, .3, 1.3], [72, 1, .9], [81, .6, 1.1], [90, 1.2, .8], [14, 1.7, .9], [68, 1.8, 1]];
export function PracticeCelebrate({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`pa-celebrate ${className}`}>{RISE.map(([l, d, s]) => <i key={l} style={{ left: `${l}%`, animationDelay: `${d}s`, transform: `scale(${s})` }} />)}</div>;
}

// Thin ornament row: rule, star, rule (for section heads that are not h2.font-display)
export function PracticeRule({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`flex items-center gap-2 text-[rgb(var(--gold))] ${className}`}>
      <span className="h-px flex-1 bg-gradient-to-l from-current to-transparent opacity-50" />
      <PracticeStar size={10} />
      <span className="h-px flex-1 bg-gradient-to-r from-current to-transparent opacity-50" />
    </span>
  );
}
