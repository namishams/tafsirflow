// Badge drawing shared by app and website (owner 22.10.2026): every verified mark is an 8-point Islamic star (khatam,
// Rub el Hizb style) with a fine arabesque ring and a check inside, drawn on a 24 x 24 grid so it stays crisp at 14–28 px.
// Pure data, no imports; the app keeps an identical copy (mobile/src/features/talents/badgeShape.ts).
// Tiers: founder gold with a double gold ring and a small crown of arches; official / star reciter emerald with a gold
// edge; Masterclass Reciter ("gold" stored) silver; confirmed learner ("emerald" stored) blue; "personality" (assigned by
// an admin after the person proved who they are) a gold khatam with a single ring and no crown, so the founder stays unique.
export type BadgeTier = "emerald" | "gold" | "official" | "founder" | "star" | "personality";

/** the khatam: two squares turned by 45 degrees, outline of their union (outer radius 10.6) */
export const KHATAM = "M12 1.4 L15.1 4.5 L19.5 4.5 L19.5 8.9 L22.6 12 L19.5 15.1 L19.5 19.5 L15.1 19.5 L12 22.6 L8.9 19.5 L4.5 19.5 L4.5 15.1 L1.4 12 L4.5 8.9 L4.5 4.5 L8.9 4.5Z";
/** the inner khatam line (one square of the star, a little smaller), drawn faintly for depth */
export const KHATAM_INNER = "M12 3.6 L20.4 12 L12 20.4 L3.6 12Z M6.1 6.1 H17.9 V17.9 H6.1Z";
/** fine arabesque ring: twelve small lobes around the centre */
export const ARABESQUE = "M12 5.7A1.63 1.63 0 0 1 15.15 6.54A1.63 1.63 0 0 1 17.46 8.85A1.63 1.63 0 0 1 18.3 12A1.63 1.63 0 0 1 17.46 15.15A1.63 1.63 0 0 1 15.15 17.46A1.63 1.63 0 0 1 12 18.3A1.63 1.63 0 0 1 8.85 17.46A1.63 1.63 0 0 1 6.54 15.15A1.63 1.63 0 0 1 5.7 12A1.63 1.63 0 0 1 6.54 8.85A1.63 1.63 0 0 1 8.85 6.54A1.63 1.63 0 0 1 12 5.7Z";
export const CHECK = "M8.6 12.3l2.3 2.3 4.6-4.9";
/** the founder's check sits a little lower under the crown */
export const CHECK_FOUNDER = "M8.8 13.1l2.2 2.2 4.4-4.6";
/** small crown of three arches (founder) */
export const CROWN = "M9.3 8.4 Q9.9 6.1 10.5 8.4 Q12 5.2 13.5 8.4 Q14.1 6.1 14.7 8.4 Z";

export type BadgeStyle = { fill: string; edge: string; inner: string; ring: string; check: string; doubleRing?: string; crown?: string; singleRing?: string };
export const BADGE_STYLE: Record<BadgeTier, BadgeStyle> = {
  founder: { fill: "#C6A65E", edge: "#F3E2B6", inner: "rgba(255,255,255,0.28)", ring: "#FBF1D3", check: "rgb(8,38,29)", doubleRing: "#C6A65E", crown: "rgb(8,38,29)" },
  official: { fill: "#0B6B4C", edge: "#D9B970", inner: "rgba(243,226,182,0.30)", ring: "#E9D9A6", check: "#FFFFFF" },
  star: { fill: "#0B6B4C", edge: "#D9B970", inner: "rgba(243,226,182,0.30)", ring: "#E9D9A6", check: "#FFFFFF" },
  personality: { fill: "#C9A44E", edge: "#8A6A22", inner: "rgba(255,255,255,0.30)", ring: "#FBF1D3", check: "#FFFFFF", singleRing: "#C9A44E" },
  gold: { fill: "#8E959E", edge: "#E3E6EA", inner: "rgba(255,255,255,0.28)", ring: "#F1F3F5", check: "#FFFFFF" },
  emerald: { fill: "#2F7FD8", edge: "#B9D6F6", inner: "rgba(255,255,255,0.26)", ring: "#E3EEFB", check: "#FFFFFF" },
};
/** main colour per tier, for rings and accents next to the badge */
export const BADGE_COLORS = { founder: "#C6A65E", gold: "#8E959E", emerald: "#2F7FD8", star: "#0B6B4C", official: "#0B6B4C", personality: "#C9A44E" } as const;

// ---------- premium profile header (founder and claimed reciters) ----------
/** arches around a ring on a 120 x 120 grid (founder: twelve small arches on the outer gold ring) */
export function archRing(n = 12, r = 56, h = 4.2, spread = 0.16): string {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const p = (ang: number, rad: number) => `${(60 + rad * Math.cos(ang)).toFixed(2)} ${(60 + rad * Math.sin(ang)).toFixed(2)}`;
    d += `M${p(a - spread, r)} Q${p(a, r + h * 2)} ${p(a + spread, r)} `;
  }
  return d.trim();
}
export const PREMIUM = {
  founder: { band: ["#0A4D37", "#5E6B3A", "#C6A65E"], outer: "#C6A65E", inner: "#F3E2B6", arches: true },
  star: { band: ["#0A4D37", "#0E6B4D", "#B8995A"], outer: "#0E7A57", inner: "#D9B970", arches: false },
} as const;
/** a quiet girih tile (8-point stars) for the band, 40 x 40, stroke only */
export const GIRIH_TILE = "M20 4 L24 16 L36 20 L24 24 L20 36 L16 24 L4 20 L16 16Z M8 8 L32 32 M32 8 L8 32 M0 20 H4 M36 20 H40 M20 0 V4 M20 36 V40";
