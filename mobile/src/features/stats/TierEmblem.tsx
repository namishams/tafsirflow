import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import { FONT } from "@/lib/theme";
import { DIVISION_MARK, TIER_COLORS, TIER_POINTS, ringPath, starPath, type TierId } from "./career";

// The tier emblem of the learning career (same drawing as the website's components/stats/TierEmblem.tsx): a girih star
// in the tier's metal, more points for higher tiers, on deep emerald with a gold rim, the inner rosette and the
// division mark. Geometry only, no figures, no animation.
export function TierEmblem({ tier, division, size = 96, progress, label }: { tier: TierId; division: number; size?: number; progress?: number; label?: string }) {
  const c = TIER_COLORS[tier];
  const id = `te${tier}${size}`;
  const high = tier === "master" || tier === "grandmaster";
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessible={!!label} accessibilityLabel={label} accessibilityRole={label ? "image" : undefined}>
      <Defs>
        <LinearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="0.55" stopColor={c.metal} />
          <Stop offset="1" stopColor={c.deep} />
        </LinearGradient>
        <RadialGradient id={`${id}g`} cx="0.5" cy="0.45" r="0.6">
          <Stop offset="0" stopColor="#0F5A44" />
          <Stop offset="1" stopColor="#052A1F" />
        </RadialGradient>
      </Defs>
      {progress !== undefined ? (
        <>
          <Circle cx="60" cy="60" r="56" fill="none" stroke="rgba(214,180,108,0.22)" strokeWidth="4" />
          {progress > 0 ? <Path d={ringPath(60, 60, 56, progress)} fill="none" stroke="#D6B46C" strokeWidth="4" strokeLinecap="round" /> : null}
        </>
      ) : null}
      {high ? Array.from({ length: 16 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 16;
        return <Circle key={i} cx={60 + 49 * Math.cos(a)} cy={60 + 49 * Math.sin(a)} r="1.6" fill={c.light} opacity={0.85} />;
      }) : null}
      <Path d={starPath(60, 60, TIER_POINTS[tier], 46, 36)} fill={`url(#${id}m)`} stroke={c.deep} strokeWidth="1.2" strokeLinejoin="round" />
      <Circle cx="60" cy="60" r="30" fill={`url(#${id}g)`} stroke="#D6B46C" strokeWidth="2" />
      <Path d={starPath(60, 60, 8, 25, 19, -Math.PI / 2 + Math.PI / 8)} fill="none" stroke="rgba(214,180,108,0.55)" strokeWidth="1" />
      {division ? (
        <SvgText x="60" y="66" textAnchor="middle" fill="#F4E3B4" fontFamily={FONT.display} fontSize="17">{DIVISION_MARK[division]}</SvgText>
      ) : <Path d={starPath(60, 60, 8, 11, 5)} fill="#F4E3B4" />}
    </Svg>
  );
}
