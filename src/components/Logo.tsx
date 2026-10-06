export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-accent" />
      <path d="M9 11h14M9 16h14M9 21h8" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="22.5" cy="21" r="2.2" className="fill-gold" />
    </svg>
  );
}
