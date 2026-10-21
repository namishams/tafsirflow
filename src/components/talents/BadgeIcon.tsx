// The three Quran Talents badges as inline SVG (same drawing as the app): emerald check, gold check, official star.
export type WebBadge = "emerald" | "gold" | "official";
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
      <circle cx="12" cy="12" r="12" fill={badge === "gold" ? "#c6a65e" : "#0F8A63"} />
      <path d="M7 12.4l3.2 3.2L17.2 8.6" fill="none" stroke={badge === "gold" ? "rgb(8,38,29)" : "#fff"} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
