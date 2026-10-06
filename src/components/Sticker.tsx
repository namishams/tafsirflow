import type { Icon, StickerDef, Tone } from "@/lib/stickers";

// A sticker is a small tile medallion: a gilded sixteen-point rosette, an enamel disc in the tone of the stage,
// and a line drawing in the middle.
const TONES: Record<Tone, [string, string, string]> = {
  earth: ["#b9854f", "#3a2412", "#f3dcb6"],
  leaf: ["#46936a", "#0f2d20", "#d8f0d0"],
  gold: ["#d9b86e", "#4a3612", "#fff3d6"],
  night: ["#41629f", "#0b1631", "#e3eaff"],
  dawn: ["#cf7f8e", "#2c1530", "#ffe4d9"],
  sun: ["#f4c45e", "#7a3e08", "#fff6dc"],
  sea: ["#3f93a9", "#0a2a35", "#dbf5fb"],
  rose: ["#bd5a70", "#3a0f1c", "#ffdbe2"],
};

function star(cx: number, cy: number, R: number, r: number, n = 8) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i - Math.PI / 2, rad = i % 2 ? r : R;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
const rays = (n: number, r1: number, r2: number) => Array.from({ length: n }, (_, i) => {
  const a = ((Math.PI * 2) / n) * i;
  return `M${(50 + r1 * Math.cos(a)).toFixed(1)} ${(50 + r1 * Math.sin(a)).toFixed(1)}L${(50 + r2 * Math.cos(a)).toFixed(1)} ${(50 + r2 * Math.sin(a)).toFixed(1)}`;
}).join("");

const ICONS: Record<Icon, (c: string) => React.ReactNode> = {
  seed: () => <><path d="M51 34c9 7 11 18 6 26-3 5-9 7-13 5-5-3-6-10-4-18 2-6 6-10 11-13z" /><path d="M49 40c2 8 2 16 0 23" /></>,
  drop: () => <><path d="M50 32c7 9 12 16 12 23a12 12 0 0 1-24 0c0-7 5-14 12-23z" /><path d="M44 57a6 6 0 0 0 5 6" /></>,
  sprout: () => <><path d="M50 67V50" /><path d="M50 53c-9 0-14-5-14-13 8 0 14 5 14 13z" /><path d="M50 49c0-8 5-14 13-14 0 8-5 14-13 14z" /><path d="M40 67h20" /></>,
  branch: () => <><path d="M35 66C46 58 54 48 63 33" /><path d="M44 58c-6-2-9-7-8-12 6 1 9 6 8 12z" /><path d="M52 48c-1-6 2-11 8-12 0 6-3 10-8 12z" /><path d="M56 43c6 1 10 5 10 10-6 0-9-4-10-10z" /></>,
  tree: () => <><path d="M50 70V50" /><path d="M50 58l-7-6M50 55l7-6" /><circle cx="50" cy="41" r="13" /><path d="M41 70h18" /></>,
  fruit: () => <><circle cx="50" cy="55" r="13" /><path d="M45 42l1-6 4 4 4-4 1 6" /><path d="M44 55c3 4 9 4 12 0" /></>,
  lamp: () => <><path d="M50 29v6" /><path d="M42 35h16" /><path d="M41 39h18l-3 20c-1 5-11 5-12 0z" /><path d="M50 45c3 3 3 7 0 9-3-2-3-6 0-9z" /><path d="M43 66h14" /></>,
  star: () => <><rect x="39" y="39" width="22" height="22" /><rect x="39" y="39" width="22" height="22" transform="rotate(45 50 50)" /><circle cx="50" cy="50" r="4" /></>,
  crescent: () => <><path d="M57 33a17 17 0 1 0 0 34 13 13 0 1 1 0-34z" /><path d="M64 45l1.5 3.2 3.3 1.4-3.3 1.4L64 54.2l-1.5-3.2-3.3-1.4 3.3-1.4z" /></>,
  moon: () => <><circle cx="50" cy="50" r="16" /><circle cx="45" cy="45" r="3" /><circle cx="56" cy="56" r="2.2" /><circle cx="55" cy="43" r="1.4" /></>,
  dawn: () => <><path d="M31 60h38" /><path d="M38 60a12 12 0 0 1 24 0" /><path d="M50 41v-6M39 46l-3-3M61 46l3-3M33 53h-3M67 53h3" /><path d="M38 66h24" /></>,
  sun: () => <><circle cx="50" cy="50" r="10" /><path d={rays(12, 14, 20)} /></>,
  ear: () => <><path d="M38 45v10M44 39v22M50 43v14M56 35v30M62 41v18" /></>,
  book: () => <><path d="M50 40c-6-4-12-4-17-2v24c5-2 11-2 17 2 6-4 12-4 17-2V38c-5-2-11-2-17 2z" /><path d="M50 40v24" /></>,
  open: () => <><path d="M37 66V46a13 13 0 0 1 26 0v20" /><path d="M34 66h32" /><path d="M44 66V50a6 6 0 0 1 12 0v16" /></>,
  layers: () => <><path d="M33 45l17-8 17 8-17 8z" /><path d="M33 53l17 8 17-8" /><path d="M33 61l17 8 17-8" /></>,
  path: () => <><path d="M35 66c9-4 4-12 15-16s7-12 15-16" /><circle cx="35" cy="66" r="2.5" /><circle cx="65" cy="34" r="2.5" /></>,
  flame: () => <path d="M50 31c2 8 12 12 12 23a12 12 0 0 1-24 0c0-6 4-9 6-12 1 4 3 6 5 6-1-6 0-11 1-17z" />,
  letters: (c) => <text x="50" y="60" textAnchor="middle" fontSize="25" fill={c} stroke="none" className="font-arabic">أ ب</text>,
  water: () => <><path d="M50 31c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" /><path d="M35 54c4 7 9 10 15 10s11-3 15-10" /><path d="M35 54h9M56 54h9" /></>,
  compass: () => <><circle cx="50" cy="50" r="15" /><path d="M50 37l4 13-4 13-4-13z" /></>,
  sunrise: () => <><path d="M31 62h38" /><path d="M40 62a10 10 0 0 1 20 0" /><path d="M50 45v-7M41 49l-3-3M59 49l3-3" /><path d="M58 34a6 6 0 1 0 0 9 4.5 4.5 0 1 1 0-9z" /></>,
  heart: () => <path d="M50 64c-12-8-16-14-16-20a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 6-4 12-16 20z" />,
};

export default function Sticker({ def, size = 96, locked = false, pct = 0, className = "" }: { def: StickerDef; size?: number; locked?: boolean; pct?: number; className?: string }) {
  const [a, b, c] = TONES[def.tone];
  const id = `st-${def.id}`;
  return (
    <span className={`relative inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className={locked ? "opacity-30 grayscale" : "drop-shadow-[0_6px_14px_rgba(0,0,0,.25)]"}>
        <defs>
          <radialGradient id={`${id}-e`} cx="35%" cy="30%" r="85%"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient>
          <linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e7bf" /><stop offset=".45" stopColor="#c9a65e" /><stop offset=".7" stopColor="#efe2bf" /><stop offset="1" stopColor="#8f7238" /></linearGradient>
        </defs>
        <path d={star(50, 50, 49, 41)} fill={`url(#${id}-m)`} />
        <path d={star(50, 50, 46, 39)} transform="rotate(22.5 50 50)" fill={`url(#${id}-m)`} opacity=".8" />
        <circle cx="50" cy="50" r="36" fill={`url(#${id}-e)`} stroke="#5c4519" strokeOpacity=".5" strokeWidth="1" />
        <circle cx="50" cy="50" r="31.5" fill="none" stroke={c} strokeOpacity=".35" strokeWidth=".7" strokeDasharray="1 2.6" />
        <g stroke={c} fill="none" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">{ICONS[def.icon](c)}</g>
        <path d="M24 38a29 29 0 0 1 36-20" stroke="#fff" strokeOpacity=".22" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      {locked && pct > 0 && (
        <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="47" fill="none" stroke="rgb(var(--gold))" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(Math.min(1, pct) * 295).toFixed(1)} 400`} />
        </svg>
      )}
    </span>
  );
}
