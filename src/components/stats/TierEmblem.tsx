import { DIVISION_MARK, TIER_COLORS, TIER_POINTS, ringPath, starPath, type TierId } from "@/lib/career";

// The tier emblem of the learning career: a girih star (more points for higher tiers) in the tier's metal on deep
// emerald, a gold rim, an inner rosette of interlaced squares and the division mark (I–III) in the middle. Geometry
// only, no figures, no animation (BLUEPRINT §2). The same drawing exists in the app (features/stats/TierEmblem.tsx).
export default function TierEmblem({ tier, division, size = 96, progress, label }: { tier: TierId; division: number; size?: number; progress?: number; label?: string }) {
  const c = TIER_COLORS[tier];
  const id = `te-${tier}-${size}`;
  const pts = TIER_POINTS[tier];
  const high = tier === "master" || tier === "grandmaster";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className="shrink-0">
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.light} />
          <stop offset="0.55" stopColor={c.metal} />
          <stop offset="1" stopColor={c.deep} />
        </linearGradient>
        <radialGradient id={`${id}-g`} cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#0F5A44" />
          <stop offset="1" stopColor="#052A1F" />
        </radialGradient>
      </defs>
      {progress !== undefined ? (
        <>
          <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(214,180,108,0.22)" strokeWidth="4" />
          {progress > 0 ? <path d={ringPath(60, 60, 56, progress)} fill="none" stroke="#D6B46C" strokeWidth="4" strokeLinecap="round" /> : null}
        </>
      ) : null}
      {high ? Array.from({ length: 16 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 16;
        return <circle key={i} cx={60 + 49 * Math.cos(a)} cy={60 + 49 * Math.sin(a)} r="1.6" fill={c.light} opacity="0.85" />;
      }) : null}
      <path d={starPath(60, 60, pts, 46, 36)} fill={`url(#${id}-m)`} stroke={c.deep} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="60" cy="60" r="30" fill={`url(#${id}-g)`} stroke="#D6B46C" strokeWidth="2" />
      <path d={starPath(60, 60, 8, 25, 19, -Math.PI / 2 + Math.PI / 8)} fill="none" stroke="rgba(214,180,108,0.55)" strokeWidth="1" />
      {division ? (
        <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fill="#F4E3B4" fontFamily="inherit" fontWeight="800" fontSize="17" letterSpacing="0.5">{DIVISION_MARK[division]}</text>
      ) : <path d={starPath(60, 60, 8, 11, 5)} fill="#F4E3B4" />}
    </svg>
  );
}
