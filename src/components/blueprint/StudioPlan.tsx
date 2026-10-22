// Floor plan of the planned Shams Studio (illustration, not to scale): recording hall with three cameras, three lights,
// microphone, teacher at the Quran stand, student opposite, mihrab-shaped backdrop and acoustic panels; control room,
// editing suite, wudu and prayer area. Numbers 1–14 match the legend on /blueprint/studio (texts: studio.legend).
const G = "#d6b46c";
const L = "#e9cf99";

function Num({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="13" fill="#04140f" stroke={G} strokeWidth="1.5" />
      <text x={x} y={y + 4.5} textAnchor="middle" fontSize="13" fontWeight="800" fill={L} fontFamily="Plus Jakarta Sans Variable, system-ui, sans-serif">{n}</text>
    </g>
  );
}

/** a camera seen from above with its field of view towards (tx, ty) */
function Camera({ x, y, tx, ty, spread = 0.38, len = 1, rec = false }: { x: number; y: number; tx: number; ty: number; spread?: number; len?: number; rec?: boolean }) {
  const a = Math.atan2(ty - y, tx - x), d = Math.hypot(tx - x, ty - y) * len;
  const p1 = [x + Math.cos(a - spread) * d, y + Math.sin(a - spread) * d], p2 = [x + Math.cos(a + spread) * d, y + Math.sin(a + spread) * d];
  const deg = (a * 180) / Math.PI;
  return (
    <g>
      <path className="bp-cone" d={`M${x} ${y}L${p1[0]} ${p1[1]}A${d} ${d} 0 0 1 ${p2[0]} ${p2[1]}z`} fill={G} fillOpacity=".13" stroke={G} strokeOpacity=".35" strokeDasharray="4 5" />
      <g transform={`translate(${x} ${y}) rotate(${deg})`}>
        <rect x="-16" y="-10" width="24" height="20" rx="3" fill="#0d1f19" stroke={L} strokeWidth="1.5" />
        <path d="M8 -6l10 -5v22l-10 -5z" fill={L} />
      </g>
      {rec ? <circle className="bp-pulse" cx={x - 4} cy={y - 18} r="4" fill="#e5484d" /> : null}
    </g>
  );
}

/** a softbox light seen from above, aimed at (tx, ty) */
function Light({ x, y, tx, ty }: { x: number; y: number; tx: number; ty: number }) {
  const deg = (Math.atan2(ty - y, tx - x) * 180) / Math.PI;
  return (
    <g transform={`translate(${x} ${y}) rotate(${deg})`}>
      <path d="M0 0L90 -34v68z" fill="url(#bp-beam)" />
      <rect x="-12" y="-20" width="16" height="40" rx="3" fill="#fbf7ea" stroke={G} strokeWidth="1.5" />
      <path d="M-12 -20l-10 10v20l10 10" fill="none" stroke={G} strokeWidth="1.5" />
    </g>
  );
}

export default function StudioPlan({ className = "" }: { className?: string }) {
  const teacher = { x: 190, y: 318 };
  return (
    <svg viewBox="0 0 1000 620" className={className} role="img" aria-hidden>
      <defs>
        <linearGradient id="bp-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff6dc" stopOpacity=".42" /><stop offset="1" stopColor="#fff6dc" stopOpacity="0" /></linearGradient>
        <pattern id="bp-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v8" stroke={G} strokeOpacity=".55" strokeWidth="2" /></pattern>
        <pattern id="bp-tile" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="none" stroke={G} strokeOpacity=".18" /></pattern>
      </defs>
      {/* building */}
      <rect x="20" y="20" width="960" height="580" rx="6" fill="#06231a" />
      <rect x="20" y="20" width="620" height="580" fill="url(#bp-tile)" opacity=".7" />
      {/* acoustic panels (11) */}
      <rect x="120" y="26" width="440" height="14" fill="url(#bp-hatch)" />
      <rect x="120" y="580" width="440" height="14" fill="url(#bp-hatch)" />
      <rect x="616" y="300" width="14" height="250" fill="url(#bp-hatch)" />
      {/* walls */}
      <g fill="none" stroke={L} strokeWidth="5" strokeLinejoin="round">
        <path d="M20 20h960v580H20z" />
        <path d="M640 20v60M640 250v290M640 300h340M640 470h150M850 470h130" />
      </g>
      {/* window between hall and control room */}
      <path d="M640 86v158" stroke="#9fd6ff" strokeOpacity=".7" strokeWidth="3" strokeDasharray="10 6" />
      {/* doors */}
      <g fill="none" stroke={L} strokeOpacity=".6" strokeWidth="1.5">
        <path d="M640 540a50 50 0 0 1 -50 50" /><path d="M790 470a52 52 0 0 0 52 -52" /><path d="M420 600a56 56 0 0 1 56 -56" />
      </g>
      <path d="M418 600h60" stroke="#06231a" strokeWidth="7" />

      {/* mihrab-shaped backdrop (10) */}
      <path d="M78 190c-40 40-40 216 0 256" fill="none" stroke={G} strokeWidth="9" strokeLinecap="round" />
      <path d="M62 236c-16 30-16 134 0 164" fill="none" stroke={G} strokeOpacity=".45" strokeWidth="3" />
      {/* platform rug */}
      <rect x="110" y="250" width="270" height="140" rx="10" fill="#0f3f31" stroke={G} strokeOpacity=".45" />

      {/* lights (4 key, 5 fill, 6 back) */}
      <Light x={330} y={190} tx={teacher.x} ty={teacher.y} />
      <Light x={330} y={470} tx={teacher.x} ty={teacher.y} />
      <Light x={112} y={170} tx={teacher.x} ty={teacher.y} />

      {/* cameras (1 wide, 2 close-up, 3 overhead) */}
      <Camera x={560} y={318} tx={teacher.x} ty={teacher.y} spread={0.32} len={0.92} rec />
      <Camera x={350} y={120} tx={teacher.x} ty={teacher.y - 6} spread={0.18} len={0.9} />
      <g>
        <circle cx="246" cy="318" r="30" fill="none" stroke={L} strokeDasharray="5 5" />
        <path d="M246 296v44M224 318h44" stroke={L} strokeOpacity=".7" />
      </g>

      {/* teacher at the Quran stand (8) */}
      <ellipse cx={teacher.x} cy={teacher.y} rx="30" ry="36" fill="#145442" stroke={G} strokeWidth="1.5" />
      <circle cx={teacher.x} cy={teacher.y} r="15" fill="#fbf7ea" />
      <path d="M232 306h28v24h-28z" fill="#a7834b" />
      <path d="M234 308h12v20h-12zM248 308h11v20h-11z" fill="#fbf7ea" />
      {/* microphone boom (7) */}
      <path d="M190 210l40 82" stroke={L} strokeWidth="3" strokeLinecap="round" />
      <circle cx="190" cy="210" r="7" fill="#0d1f19" stroke={L} strokeWidth="2" />
      <rect x="224" y="284" width="14" height="22" rx="7" fill={L} transform="rotate(-25 231 295)" />
      {/* student opposite (9) */}
      <ellipse cx="330" cy="318" rx="24" ry="30" fill="#1d4a3d" stroke={G} strokeOpacity=".8" />
      <circle cx="330" cy="318" r="12" fill="#fbf7ea" />

      {/* control room (12) */}
      <path d="M700 200c60-50 160-50 220 0" fill="none" stroke={G} strokeWidth="18" strokeLinecap="round" opacity=".55" />
      {[730, 790, 850].map((x, i) => <rect key={x} x={x} y={i === 1 ? 128 : 142} width="52" height="8" rx="2" fill="#9fd6ff" opacity=".8" transform={`rotate(${[-14, 0, 14][i]} ${x + 26} 146)`} />)}
      <circle cx="810" cy="232" r="14" fill="#1d4a3d" stroke={G} />
      {/* editing suite (13) */}
      {[690, 830].map((x) => <g key={x}><rect x={x} y="340" width="110" height="40" rx="6" fill="#0f3f31" stroke={G} strokeOpacity=".6" /><rect x={x + 20} y="346" width="70" height="7" rx="2" fill="#9fd6ff" opacity=".8" /><circle cx={x + 55} cy="410" r="13" fill="#1d4a3d" stroke={G} /></g>)}
      {/* wudu and prayer area (14) */}
      {[670, 710, 750].map((x) => <rect key={x} x={x} y="500" width="26" height="20" rx="8" fill="#9fd6ff" fillOpacity=".25" stroke="#9fd6ff" strokeOpacity=".6" />)}
      {[870, 920].map((x) => <rect key={x} x={x} y="496" width="36" height="78" rx="4" fill="#5e1f2a" fillOpacity=".55" stroke={G} strokeOpacity=".6" />)}

      {/* numbers */}
      <Num n={1} x={600} y={286} /><Num n={2} x={386} y={96} /><Num n={3} x={286} y={278} />
      <Num n={4} x={362} y={168} /><Num n={5} x={362} y={500} /><Num n={6} x={96} y={140} />
      <Num n={7} x={168} y={196} /><Num n={8} x={150} y={372} /><Num n={9} x={366} y={350} />
      <Num n={10} x={40} y={318} /><Num n={11} x={580} y={50} /><Num n={12} x={950} y={60} />
      <Num n={13} x={950} y={330} /><Num n={14} x={950} y={576} />
    </svg>
  );
}
