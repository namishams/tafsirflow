// A static illustration of a member's garden tree for the website (the app draws the real tree with its garden
// components). Server-rendered SVG: night-emerald sky, a gold-tiled ground and a tree whose size follows the stage
// (0 seed … 12 ancient tree); the palm has fronds, the other trees a layered crown in their own colours.
const COLORS: Record<string, { leaf: [string, string, string]; trunk: string; fruit: string }> = {
  palm: { leaf: ["#1f5a32", "#2f7a42", "#7fb85a"], trunk: "#8a6a44", fruit: "#c98a2a" },
  olive: { leaf: ["#3d5a3a", "#5f7f52", "#a9c08a"], trunk: "#7a6a58", fruit: "#3d3b2a" },
  fig: { leaf: ["#1d5c3c", "#2f8456", "#7fc48a"], trunk: "#9a907c", fruit: "#7a3a62" },
  pomegranate: { leaf: ["#1a5a35", "#2e8048", "#86c06c"], trunk: "#7a5640", fruit: "#c8323a" },
  sidr: { leaf: ["#3a6a2c", "#6a9a3e", "#c3d983"], trunk: "#8a6c46", fruit: "#e0b23a" },
};

export default function TreeIllustration({ type, stage, label, width = 300, height = 200 }: { type: string; stage: number; label: string; width?: number; height?: number }) {
  const c = COLORS[type] ?? COLORS.olive;
  const s = Math.max(0, Math.min(12, stage));
  const ground = 170;
  const k = Math.max(0, s - 2) / 10;
  const trunkH = s < 3 ? 10 + s * 10 : 40 + k * (type === "palm" ? 100 : 70);
  const trunkW = s < 3 ? 3 : 5 + k * (type === "palm" ? 6 : 12);
  const top = ground - trunkH;
  const crown = s < 3 ? 6 + s * 5 : 22 + k * (type === "palm" ? 30 : 50);
  const cx = 210;
  const fronds = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI * (0.1 + (0.8 * i) / 8);
    const x2 = cx + Math.cos(a) * crown * 1.6 * (i % 2 ? 0.9 : 1), y2 = top + 4 + Math.sin(a) * crown * 0.5 - crown * 0.15;
    return `M${cx} ${top} Q${(cx + x2) / 2} ${top - crown * 0.55} ${x2} ${y2}`;
  });
  const fruits = s >= 5 ? Array.from({ length: Math.min(9, s - 3) }, (_, i) => ({ x: cx + Math.cos(i * 2.4) * crown * 0.6, y: top - crown * 0.25 + Math.sin(i * 2.4) * crown * 0.45 })) : [];
  return (
    <svg viewBox="0 0 300 200" width={width} height={height} role="img" aria-label={label} className="block h-auto w-full">
      <defs>
        <linearGradient id="sj-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#061d17" /><stop offset="0.7" stopColor="#0d3a2c" /><stop offset="1" stopColor="#174a38" /></linearGradient>
        <radialGradient id="sj-crown" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor={c.leaf[2]} /><stop offset="0.55" stopColor={c.leaf[1]} /><stop offset="1" stopColor={c.leaf[0]} /></radialGradient>
      </defs>
      <rect width="300" height="200" fill="url(#sj-sky)" />
      {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={(i * 113) % 300} cy={(i * 37) % 110} r={i % 6 ? 0.7 : 1.3} fill="#f3e2b6" opacity={0.35 + (i % 3) * 0.15} />)}
      <path d="M262 22 a14 14 0 1 0 0 26 a11 11 0 1 1 0 -26 Z" fill="#f3e2b6" opacity="0.9" />
      {/* arcade on the horizon */}
      <g fill="#0a2e23" opacity="0.9">
        <rect x="0" y="138" width="300" height="32" />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${i * 40 + 6} 170 v-20 a14 14 0 0 1 28 0 v20 Z`} fill="#123f30" />)}
      </g>
      <rect x="0" y={ground} width="300" height={200 - ground} fill="#0b2a20" />
      {Array.from({ length: 15 }, (_, i) => <rect key={i} x={i * 20 + 4} y={ground + 8} width="12" height="12" transform={`rotate(45 ${i * 20 + 10} ${ground + 14})`} fill="none" stroke="#d6b46c" strokeOpacity="0.45" strokeWidth="1" />)}
      <line x1="0" y1={ground} x2="300" y2={ground} stroke="#d6b46c" strokeOpacity="0.6" />
      {/* tree */}
      <path d={`M${cx - trunkW / 2} ${ground} C${cx - trunkW / 2} ${ground - trunkH * 0.4} ${cx - trunkW * 0.2} ${top + 6} ${cx} ${top} C${cx + trunkW * 0.2} ${top + 6} ${cx + trunkW / 2} ${ground - trunkH * 0.4} ${cx + trunkW / 2} ${ground} Z`} fill={c.trunk} />
      {s === 0 ? <ellipse cx={cx} cy={ground - 3} rx="6" ry="4" fill="#8a6a44" /> : type === "palm" ? (
        <g fill="none" stroke={c.leaf[1]} strokeWidth={Math.max(2, crown / 9)} strokeLinecap="round">{fronds.map((d, i) => <path key={i} d={d} stroke={i % 2 ? c.leaf[2] : c.leaf[1]} />)}</g>
      ) : (
        <g>
          <circle cx={cx - crown * 0.45} cy={top - crown * 0.05} r={crown * 0.62} fill={c.leaf[0]} />
          <circle cx={cx + crown * 0.45} cy={top - crown * 0.1} r={crown * 0.6} fill={c.leaf[0]} />
          <circle cx={cx} cy={top - crown * 0.45} r={crown * 0.75} fill="url(#sj-crown)" />
        </g>
      )}
      {fruits.map((f, i) => <circle key={i} cx={f.x} cy={f.y} r={2.6 + k * 1.5} fill={c.fruit} />)}
    </svg>
  );
}
