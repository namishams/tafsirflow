// Hidden field for protected forms (src/lib/botguard.ts honeypotTripped): people never see or reach it, bots fill every field.
// The value travels as `website` in the JSON body; the server then answers "ok" as if it worked and does nothing.
export default function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
      <label>Website<input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} /></label>
    </div>
  );
}
