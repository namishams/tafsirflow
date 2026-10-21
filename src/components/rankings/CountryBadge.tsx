// A country as a badge with its two-letter code on a calm emerald or gold disc (no emoji flags, same on every device)
const TONES: [string, string][] = [["#0b3d2e", "#e9cf99"], ["#10382c", "#d6b46c"], ["#1d6b52", "#f6ecd0"], ["#3d2a0b", "#e9cf99"], ["#1f473b", "#d9c28a"], ["#473614", "#f1e2b4"]];
export const toneOf = (code: string) => TONES[(code.charCodeAt(0) * 31 + code.charCodeAt(1)) % TONES.length];

export default function CountryBadge({ code, size = 36 }: { code: string | null; size?: number }) {
  const c = (code ?? "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return <span aria-hidden style={{ width: size, height: size }} className="inline-block shrink-0 rounded-full border border-line" />;
  const [bg, fg] = toneOf(c);
  return (
    <span aria-hidden className="inline-grid shrink-0 place-items-center rounded-full font-bold tracking-wide ring-1 ring-[rgb(var(--gold))]/60"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.34) }}>{c}</span>
  );
}
