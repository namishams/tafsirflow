// Large Quran calligraphy in the side margins of wide screens, after the façade of the Museum of the Future:
// a few verses are written slowly in gold, one after another, and fade again. Purely decorative.
const LEFT = ["اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ", "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", "فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ"];
const RIGHT = ["وَقُل رَّبِّ زِدْنِي عِلْمًا", "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", "الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ"];

function Strip({ lines, side }: { lines: string[]; side: "start" | "end" }) {
  const id = `side-metal-${side}`;
  return (
    <svg viewBox="0 0 200 1500" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9a65e" /><stop offset=".35" stopColor="#f3e2b6" /><stop offset=".55" stopColor="#e6e9ec" /><stop offset=".8" stopColor="#c9a65e" /><stop offset="1" stopColor="#8f7238" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id})`} fill="none" strokeWidth="1" opacity=".55">
        <path d="M60 40V1460M140 40V1460" strokeDasharray="1 7" />
        <path d="M100 6l7 17 17 7-17 7-7 17-7-17-17-7 17-7z" /><rect x="88" y="18" width="24" height="24" transform="rotate(45 100 30)" />
        <path d="M100 1442l7 17 17 7-17 7-7 17-7-17-17-7 17-7z" /><rect x="88" y="1454" width="24" height="24" transform="rotate(45 100 1466)" />
      </g>
      {lines.map((l, i) => (
        <text key={i} x="0" y="0" transform="translate(132 750) rotate(-90)" textAnchor="middle" fontSize="124" className="font-callig" fill={`url(#${id})`} style={{ animationDelay: `${i * 24 + (side === "end" ? 3 : 0)}s` }}>{l}</text>
      ))}
    </svg>
  );
}

export default function SideCalligraphy() {
  return (
    <>
      <aside aria-hidden className="side-callig start-0"><Strip lines={LEFT} side="start" /></aside>
      <aside aria-hidden className="side-callig end-0"><Strip lines={RIGHT} side="end" /></aside>
    </>
  );
}
