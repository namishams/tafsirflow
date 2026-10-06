// Ornaments in the manner of a printed mushaf: gold divider with an eight-pointed star, the framed surah title
// (cartouche) and Arabic lettering that appears as if written with ink. Pure SVG/CSS, no images.

// Thin gold rule with a khatam star in the middle
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-3 text-[rgb(var(--gold))] ${className}`}>
      <span className="h-px w-16 bg-gradient-to-l from-current to-transparent opacity-60 sm:w-28" />
      <svg viewBox="0 0 24 24" className="h-2 w-2 opacity-70"><path d="M12 2l10 10-10 10L2 12z" fill="currentColor" /></svg>
      <svg viewBox="0 0 40 40" className="h-6 w-6"><g fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M9 9h22v22H9z" /><path d="M20 4.5L35.5 20 20 35.5 4.5 20z" /></g><circle cx="20" cy="20" r="3.2" fill="currentColor" /></svg>
      <svg viewBox="0 0 24 24" className="h-2 w-2 opacity-70"><path d="M12 2l10 10-10 10L2 12z" fill="currentColor" /></svg>
      <span className="h-px w-16 bg-gradient-to-r from-current to-transparent opacity-60 sm:w-28" />
    </div>
  );
}

// The surah title in a gold frame with pointed ends, like the surah headings of the Madinah mushaf
export function SurahBanner({ arabic, className = "" }: { arabic: string; className?: string }) {
  return (
    <div className={`relative mx-auto w-full max-w-xl text-[rgb(var(--gold))] ${className}`}>
      <svg viewBox="0 0 600 96" className="block h-auto w-full" aria-hidden preserveAspectRatio="none">
        <defs>
          <pattern id="sb-girih" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M6 6h12v12H6zM12 2.5l9.5 9.5L12 21.5 2.5 12z" fill="none" stroke="currentColor" strokeOpacity=".22" strokeWidth=".8" /></pattern>
        </defs>
        <path d="M40 6H560L594 48 560 90H40L6 48Z" fill="url(#sb-girih)" />
        <path d="M40 6H560L594 48 560 90H40L6 48Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M46 13H554L582 48 554 83H46L18 48Z" fill="rgb(var(--surface))" fillOpacity=".92" stroke="currentColor" strokeWidth="1" />
        <g fill="currentColor"><path d="M6 48l-5-5 5-5 5 5zM594 48l-5-5 5-5 5 5z" transform="translate(0 5)" /></g>
      </svg>
      <p className="font-callig absolute inset-0 grid place-items-center pb-1 text-[26px] leading-none text-ink sm:text-[34px]" dir="rtl">{arabic}</p>
    </div>
  );
}

// Arabic lettering revealed from right to left, as if written with ink (respects reduced motion)
export function Ink({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <span className={`ink inline-block ${className}`} style={{ animationDelay: `${delay}ms` }} dir="rtl">{children}</span>;
}

// Large Arabic word that writes itself (outline first, then a soft fill) – for page heroes
export function CalligraphyDraw({ text, className = "", font = "font-callig" }: { text: string; className?: string; font?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1000 320" preserveAspectRatio="xMaxYMid meet" overflow="visible" className={`callig-draw pointer-events-none select-none ${className}`}>
      <text x="985" y="240" textAnchor="end" fontSize="230" className={font}>{text}</text>
    </svg>
  );
}

// Verses around a slowly turning ring with a metallic gold-to-silver gradient, after the Museum of the Future
export function CalligraphyRing({ text, className = "" }: { text: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 400 400" className={`pointer-events-none select-none ${className}`}>
      <defs>
        <linearGradient id="ring-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e2b6" /><stop offset=".45" stopColor="#c9a65e" /><stop offset=".7" stopColor="#e9edf0" /><stop offset="1" stopColor="#b8924a" />
        </linearGradient>
        <path id="ring-path" d="M200,200 m-150,0 a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0" />
      </defs>
      <circle cx="200" cy="200" r="172" fill="none" stroke="url(#ring-metal)" strokeOpacity=".35" strokeWidth="1" />
      <circle cx="200" cy="200" r="128" fill="none" stroke="url(#ring-metal)" strokeOpacity=".25" strokeWidth="1" strokeDasharray="2 6" />
      <g className="callig-ring">
        <text fill="url(#ring-metal)" fontSize="23" className="font-arabic"><textPath href="#ring-path" startOffset="2%">{text}</textPath></text>
      </g>
      <g fill="none" stroke="url(#ring-metal)" strokeOpacity=".5" strokeWidth="1"><path d="M200 168l9 23 23 9-23 9-9 23-9-23-23-9 23-9z" /><rect x="180" y="180" width="40" height="40" transform="rotate(45 200 200)" /></g>
    </svg>
  );
}
