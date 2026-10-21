// The default profile picture when a member has no photo (and for members under 16, whose photos are never shown):
// a neutral head-and-shoulders silhouette like Instagram, in soft sage on emerald-tinted grey to fit the gold rim.
// Pure SVG, usable in server and client components. Same drawing as the app (mobile/src/features/talents/ui.tsx).
export function DefaultAvatar({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className} preserveAspectRatio="xMidYMid slice">
      <rect width="100" height="100" fill="#DCE5E0" />
      <circle cx="50" cy="39" r="17" fill="#F8F6EF" />
      <path d="M17 100c0-20 14.8-33 33-33s33 13 33 33z" fill="#F8F6EF" />
    </svg>
  );
}
