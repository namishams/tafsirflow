import { useId } from "react";

// The Ziina brand mark, redrawn as a small inline SVG (no external image, nothing is loaded from Ziina): a purple
// gradient square with a white eight-pointed star made of two overlapping squares. Shown next to the payment so
// visitors see who processes the payment. Decorative next to the text "Payment via Ziina" (label), else it names itself.
export default function ZiinaMark({ size = 28, label, className = "" }: { size?: number; label?: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={`shrink-0 ${className}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
      <defs>
        <linearGradient id={`zm${id}`} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9A5BFF" />
          <stop offset="1" stopColor="#5B1FD8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill={`url(#zm${id})`} />
      <g fill="#fff">
        <rect x="14" y="14" width="20" height="20" rx="3.2" />
        <rect x="14" y="14" width="20" height="20" rx="3.2" transform="rotate(45 24 24)" />
      </g>
    </svg>
  );
}
