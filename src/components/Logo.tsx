// Mark: an open mushaf on a rehal (Quran stand) under a star – the same artwork as the favicon and app icon
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <rect width="64" height="64" rx="14" className="fill-accent" />
      <path d="M17 41 L47 57 M47 41 L17 57" stroke="#e9cf99" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M32 21.5 C 26 17.5, 17.5 16.8, 11 18.6 V 43.4 C 17.5 41.8, 26 42.6, 32 46.4 Z" fill="#fff" />
      <path d="M32 21.5 C 38 17.5, 46.5 16.8, 53 18.6 V 43.4 C 46.5 41.8, 38 42.6, 32 46.4 Z" fill="#fff" />
      <path d="M32 21.5 V 46.4" className="stroke-accent" strokeWidth="1.6" />
      <path d="M16 25.2 C 20 24.2, 24.5 24.4, 28 25.8 M16 30 C 20 29, 24.5 29.2, 28 30.6 M16 34.8 C 20 33.8, 24.5 34, 28 35.4 M36 25.8 C 39.5 24.4, 44 24.2, 48 25.2 M36 30.6 C 39.5 29.2, 44 29, 48 30 M36 35.4 C 39.5 34, 44 33.8, 48 34.8" className="stroke-accent" strokeOpacity=".35" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M32 6.5 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6z" fill="#e9cf99" />
    </svg>
  );
}
