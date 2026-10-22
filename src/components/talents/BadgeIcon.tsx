// The Quran Talents badges as inline SVG (same drawing and colours as the app's BadgeMark): founder gold check (one
// account), Masterclass Reciter grey check ("gold" stored), confirmed learner blue check ("emerald" stored), official star,
// verified star reciter (emerald disc, light emerald ring, white tick; owner 22.10.2026).
export type WebBadge = "emerald" | "gold" | "official" | "founder" | "star";
export const BADGE_COLORS = { founder: "#c6a65e", gold: "#8E959E", emerald: "#2F7FD8", star: "#0B7A55" } as const;
export function BadgeIcon({ badge, size = 18, title }: { badge: WebBadge; size?: number; title?: string }) {
  if (badge === "official") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={title}>
        {title ? <title>{title}</title> : null}
        <circle cx="12" cy="12" r="12" fill="rgb(8,58,44)" />
        <circle cx="12" cy="12" r="11" fill="none" stroke="#c6a65e" strokeWidth="1.2" />
        <path d="M12 4.2l2.2 4.7 5.1.6-3.8 3.5 1 5.1L12 15.6l-4.5 2.5 1-5.1-3.8-3.5 5.1-.6z" fill="#F3E2B6" stroke="#c6a65e" strokeWidth="0.8" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={title}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="12" fill={BADGE_COLORS[badge]} />
      {badge === "founder" ? <circle cx="12" cy="12" r="10.6" fill="none" stroke="#F3E2B6" strokeWidth="1" /> : badge === "star" ? <circle cx="12" cy="12" r="10.6" fill="none" stroke="#9FE3C7" strokeWidth="1" /> : null}
      <path d="M7 12.4l3.2 3.2L17.2 8.6" fill="none" stroke={badge === "founder" ? "rgb(8,38,29)" : "#fff"} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
