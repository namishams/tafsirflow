// The Quran Talents badges as inline SVG, the same drawing as the app's BadgeMark (shared path data in
// src/lib/badgeShape.ts): an 8-point khatam with a fine arabesque ring and a check; founder gold with a double ring
// and a crown of arches, official / star reciter emerald with a gold edge, Masterclass Reciter silver, learner blue.
import { ARABESQUE, BADGE_STYLE, CHECK, CHECK_FOUNDER, CROWN, KHATAM, KHATAM_INNER } from "@/lib/badgeShape";
export { BADGE_COLORS } from "@/lib/badgeShape";
export type WebBadge = "emerald" | "gold" | "official" | "founder" | "star" | "personality";
export function BadgeIcon({ badge, size = 18, title }: { badge: WebBadge; size?: number; title?: string }) {
  const s = BADGE_STYLE[badge];
  const fine = size < 18 ? 0.9 : 0.6;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={title} style={{ flexShrink: 0 }}>
      {title ? <title>{title}</title> : null}
      {s.doubleRing ? <circle cx="12" cy="12" r="11.4" fill="none" stroke={s.doubleRing} strokeWidth="0.8" /> : null}
      {s.singleRing ? <circle cx="12" cy="12" r="11.4" fill="none" stroke={s.singleRing} strokeWidth="0.6" opacity="0.8" /> : null}
      <path d={KHATAM} fill={s.fill} stroke={s.edge} strokeWidth="1" strokeLinejoin="round" />
      {size >= 18 ? <path d={KHATAM_INNER} fill="none" stroke={s.inner} strokeWidth="0.5" /> : null}
      <path d={ARABESQUE} fill="none" stroke={s.ring} strokeWidth={fine} opacity="0.85" />
      {s.crown ? <path d={CROWN} fill={s.crown} /> : null}
      <path d={s.crown ? CHECK_FOUNDER : CHECK} fill="none" stroke={s.check} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
