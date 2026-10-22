// Small drawings for the Blueprint mockups: faceless figures (line art, never real people), the mihrab backdrop,
// avatars with an initial, a progress ring, a waveform and a few UI icons. All decorative (aria-hidden by the frame).

const GOLD = "#d6b46c";

/** a teacher at a Quran stand, faceless: "ghutra" (Gulf headdress), "kufi" (cap) or "hijab" */
export function Figure({ kind = "ghutra", className = "", stand = true }: { kind?: "ghutra" | "kufi" | "hijab"; className?: string; stand?: boolean }) {
  const robe = kind === "hijab" ? "#123a30" : "#0f3f31";
  return (
    <svg viewBox="0 0 240 210" className={`bp-figure w-auto ${className}`} style={{ aspectRatio: "240 / 210" }} aria-hidden>
      <ellipse cx="120" cy="204" rx="104" ry="9" fill="#000" opacity=".28" />
      {/* robe (bisht / abaya) with gold trim */}
      <path d="M34 210c6-58 38-88 86-90 48 2 80 32 86 90z" fill={robe} stroke={GOLD} strokeOpacity=".45" />
      {kind === "hijab" ? (
        <>
          <path d="M120 40c-30 0-44 22-44 46 0 22 8 34 4 52 18-12 26-14 40-14s22 2 40 14c-4-18 4-30 4-52 0-24-14-46-44-46z" fill="#1d4a3d" stroke={GOLD} strokeOpacity=".55" />
          <ellipse cx="120" cy="84" rx="21" ry="26" fill="#d9bf8f" />
          <path d="M96 76c4-22 44-22 48 0" fill="none" stroke={GOLD} strokeOpacity=".6" strokeWidth="1.5" />
          <path d="M86 128c10 6 22 9 34 9s24-3 34-9" fill="none" stroke={GOLD} strokeWidth="2" strokeOpacity=".7" />
        </>
      ) : (
        <>
          <path d="M104 122l-8 88h48l-8-88z" fill="#eef0ec" />
          <path d="M104 122l-8 88M136 122l8 88" stroke={GOLD} strokeWidth="2.4" strokeOpacity=".9" />
          <rect x="110" y="100" width="20" height="24" rx="7" fill="#c8ab80" />
          {kind === "ghutra" ? (
            <>
              {/* ghutra draped behind the face, the face (no features), the fold over the forehead, the agal */}
              <path d="M89 78c0-32 62-32 62 0l10 50c-14-8-24-12-28-22h-26c-4 10-14 14-28 22z" fill="#f5f2ea" />
              <path d="M95 84c3 12 6 20 12 26M145 84c-3 12-6 20-12 26" fill="none" stroke="#d9d3c4" strokeWidth="1.5" />
              <ellipse cx="120" cy="88" rx="16.5" ry="21" fill="#d9bf8f" />
              <path d="M97 78c2-24 44-24 46 0-8-6-38-6-46 0z" fill="#f5f2ea" />
              <path d="M98 64c10-7 34-7 44 0" fill="none" stroke="#151515" strokeWidth="5" strokeLinecap="round" />
              <path d="M99 71c9-5 33-5 42 0" fill="none" stroke="#151515" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="120" cy="82" rx="22" ry="26" fill="#d9bf8f" />
              <path d="M98 70c0-18 44-18 44 0 0 4-44 4-44 0z" fill="#f5f2ea" stroke={GOLD} strokeOpacity=".5" />
            </>
          )}
        </>
      )}
      {stand ? (
        <g>
          {/* rahl: the folding Quran stand, and an open mushaf */}
          <path d="M70 210l50-44 50 44" fill="none" stroke="#8a6a3a" strokeWidth="7" strokeLinecap="round" />
          <path d="M84 210l36-32 36 32" fill="none" stroke="#a7834b" strokeWidth="4" strokeLinecap="round" />
          <path d="M72 168c16-8 32-8 48 0 16-8 32-8 48 0v-8c-16-8-32-8-48 0-16-8-32-8-48 0z" fill="#fbf7ea" stroke={GOLD} strokeWidth="1.5" />
          <path d="M80 160c10-4 22-4 32 0M80 156c10-4 22-4 32 0M128 160c10-4 22-4 32 0M128 156c10-4 22-4 32 0" stroke="#a7834b" strokeWidth="1" strokeOpacity=".6" fill="none" />
        </g>
      ) : null}
    </svg>
  );
}

/** pointed mihrab arch with a lantern, drawn in gold lines (studio backdrop) */
export function Mihrab({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 260" className={className} aria-hidden preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="bp-mh" cx="50%" cy="40%" r="60%"><stop offset="0" stopColor={GOLD} stopOpacity=".22" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
      </defs>
      <path d="M40 260V120C40 66 96 30 150 8c54 22 110 58 110 112v140z" fill="url(#bp-mh)" stroke={GOLD} strokeOpacity=".55" />
      <path d="M62 260V126C62 82 108 52 150 34c42 18 88 48 88 92v134z" fill="none" stroke={GOLD} strokeOpacity=".3" />
      <path d="M150 34v26" stroke={GOLD} strokeOpacity=".5" />
      <path d="M140 60h20l-4 18h-12z" fill={GOLD} fillOpacity=".55" />
      <circle cx="150" cy="84" r="9" fill={GOLD} fillOpacity=".35" />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${74 + i * 30} 236l6 -12 6 12 -6 12z`} fill="none" stroke={GOLD} strokeOpacity=".22" />)}
    </svg>
  );
}

/** a round avatar with the first letter of a name */
export function Avatar({ name, size = 34, on = false, tone = "dark" }: { name: string; size?: number; on?: boolean; tone?: "dark" | "light" | "gold" }) {
  const bg = tone === "gold" ? "linear-gradient(180deg,#dcc48c,#c6a65e)" : tone === "light" ? "#e8efe9" : "linear-gradient(180deg,#145442,#0b3328)";
  const fg = tone === "gold" ? "#08261d" : tone === "light" ? "#0d4a39" : "#f3e2b6";
  return (
    <span className={`relative grid shrink-0 place-items-center rounded-full font-bold ${on ? "bp-ring-glow" : ""}`} style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.42, boxShadow: on ? `0 0 0 2px ${GOLD}` : "inset 0 0 0 1px rgb(214 180 108 / .35)" }}>
      {Array.from(name)[0]}
    </span>
  );
}

/** progress ring with the value in the middle */
export function Ring({ value, size = 56, stroke = 5, track = "rgb(255 255 255 / .12)", color = GOLD, label }: { value: number; size?: number; stroke?: number; track?: string; color?: string; label?: string }) {
  const r = (size - stroke) / 2, len = 2 * Math.PI * r;
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - value / 100)} />
      </svg>
      <span className="text-[13px] font-extrabold tabular-nums" dir="ltr">{label ?? `${value}%`}</span>
    </span>
  );
}

/** an animated waveform (bars), heights in px */
export function Wave({ bars = 24, h = 28, className = "" }: { bars?: number; h?: number; className?: string }) {
  return (
    <span className={`bp-wave ${className}`} style={{ height: h }}>
      {Array.from({ length: bars }, (_, i) => <i key={i} style={{ height: Math.round(h * (0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + 0.6)))) }} />)}
    </span>
  );
}

/** a static waveform drawn as an SVG path (timeline audio track) */
export function WaveLine({ w = 400, h = 24, color = GOLD, seed = 1 }: { w?: number; h?: number; color?: string; seed?: number }) {
  const n = Math.floor(w / 4);
  const d = Array.from({ length: n }, (_, i) => { const a = Math.abs(Math.sin(i * 0.9 * seed + seed) * Math.cos(i * 0.31)) * (h / 2 - 1) + 1; return `M${i * 4 + 2} ${h / 2 - a}V${h / 2 + a}`; }).join("");
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden><path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>;
}

const I = ({ d, size = 16, sw = 1.8, fill = "none", className = "" }: { d: string; size?: number; sw?: number; fill?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden><path d={d} /></svg>
);
export const Ico = {
  play: (s = 16) => <I size={s} fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />,
  pause: (s = 16) => <I size={s} fill="currentColor" d="M6 5h4.2v14H6zM13.8 5H18v14h-4.2z" />,
  mic: (s = 16) => <I size={s} d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />,
  cam: (s = 16) => <I size={s} d="M3 7.5A1.5 1.5 0 0 1 4.5 6h10A1.5 1.5 0 0 1 16 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 3 16.5zM16 10.5l5-3v9l-5-3" />,
  hand: (s = 16) => <I size={s} d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6.5 7-3 0-4.5-1.5-6-4l-2-3.5a1.5 1.5 0 0 1 2.5-1.6L8 13" />,
  leave: (s = 16) => <I size={s} d="M3 14c5-5 13-5 18 0l-2.5 2.5-3-1.5v-2.5a9 9 0 0 0-5 0V15l-3 1.5z" />,
  cc: (s = 16) => <I size={s} d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5zM10.5 10a2.5 2.5 0 1 0 0 4M17 10a2.5 2.5 0 1 0 0 4" />,
  full: (s = 16) => <I size={s} d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  check: (s = 14) => <I size={s} sw={2.6} d="M5 12.5l4.5 4.5L19 7.5" />,
  chevron: (s = 14) => <I size={s} sw={2.2} d="M15 5l-7 7 7 7" className="rtl:-scale-x-100" />,
  star: (s = 14) => <I size={s} fill="currentColor" d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />,
  lock: (s = 14) => <I size={s} d="M5 10.5h14v9.5H5zM8 10.5V8a4 4 0 0 1 8 0v2.5" />,
  clock: (s = 14) => <I size={s} d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 7.5V12l3 2" />,
  repeat: (s = 14) => <I size={s} d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4" />,
  users: (s = 14) => <I size={s} d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.8c2 .6 3.2 2.4 3.5 5.2" />,
  shield: (s = 14) => <I size={s} d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2.2 2.2L15.5 10" />,
  scissors: (s = 14) => <I size={s} d="M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.2 7.8L20 19M8.2 16.2L20 5" />,
  globe: (s = 14) => <I size={s} d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />,
};

/** a small eight-pointed star (the brand mark inside mockups) */
export const MarkStar = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path d="M12 1.5l2.6 4.2 4.8-1.1-1.1 4.8 4.2 2.6-4.2 2.6 1.1 4.8-4.8-1.1L12 22.5l-2.6-4.2-4.8 1.1 1.1-4.8L1.5 12l4.2-2.6-1.1-4.8 4.8 1.1z" fill="url(#bp-star)" /><defs><linearGradient id="bp-star" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ecd59a" /><stop offset="1" stopColor="#b8924a" /></linearGradient></defs></svg>
);
