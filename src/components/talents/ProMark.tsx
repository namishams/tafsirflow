// PRO mark (owner 22.10.2026): a small, elegant gold capsule next to the name of every Pro subscriber, set from the
// server's Pro entitlement (community_profiles.pro_until) and gone when Pro ends. Same drawing as the app's ProMark.
export function ProMark({ size = 14 }: { size?: number }) {
  const h = Math.round(size * 1.05);
  return (
    <span aria-label="Pro" title="Pro" className="inline-flex shrink-0 items-center rounded-full font-extrabold leading-none"
      style={{ height: h, padding: `0 ${Math.round(h * 0.42)}px`, fontSize: Math.round(h * 0.6), letterSpacing: "0.08em", color: "rgb(8,38,29)", background: "linear-gradient(135deg, #F3E2B6 0%, #D9B970 45%, #B8924A 100%)", boxShadow: "inset 0 0 0 0.75px rgba(120,90,30,0.55)" }}>
      PRO
    </span>
  );
}
