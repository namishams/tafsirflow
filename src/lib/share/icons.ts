import type { ShareIcon } from "./formats";

// The few line icons and the member badge that the exported share image draws with Canvas 2D (browser only). The path data
// is the app's outline icon set (mobile/src/components/icons.tsx, 24 × 24 viewBox), joined into one path per icon.

type IconDef = { d: string; stroke: number; fill?: boolean };
const LN = 1.7, SM = 1.8;
const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const ICONS: Record<ShareIcon | "check", IconDef> = {
  book: { d: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z", stroke: LN },
  note: { d: "M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4", stroke: SM },
  hands: { d: "M12 20c-4.5 0-7.5-2.5-7.5-6 0-2 1-3.5 2.5-4.5L9 8.5C9.8 7 11 6 12 4c1 2 2.2 3 3 4.5l2 1c1.5 1 2.5 2.5 2.5 4.5 0 3.5-3 6-7.5 6zM12 11v8", stroke: LN },
  starBig: { d: "M12 1.5l2.6 4.2 4.8-1.1-1.1 4.8 4.2 2.6-4.2 2.6 1.1 4.8-4.8-1.1L12 22.5l-2.6-4.2-4.8 1.1 1.1-4.8L1.5 12l4.2-2.6-1.1-4.8 4.8 1.1z", stroke: 0, fill: true },
  cap: { d: "M3 9l9-4 9 4-9 4-9-4zM7 11.5V16c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5v-4.5", stroke: LN },
  moon: { d: "M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z", stroke: LN },
  trophy: { d: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5", stroke: LN },
  mosque: { d: "M4 20.5h16M6 20.5v-7h12v7M8 13.5c0-3 1.8-4.6 4-6 2.2 1.4 4 3 4 6M12 7.5V4.5M10.5 20.5v-3a1.5 1.5 0 0 1 3 0v3", stroke: LN },
  pen: { d: "M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z", stroke: SM },
  compass: { d: `${circle(12, 12, 8.5)}M15.5 8.5l-2 5-5 2 2-5z`, stroke: LN },
  clock: { d: `${circle(12, 12, 8.5)}M12 7.5V12l3 2`, stroke: LN },
  calendar: { d: "M6 5.5H18A2 2 0 0 1 20 7.5V18A2 2 0 0 1 18 20H6A2 2 0 0 1 4 18V7.5A2 2 0 0 1 6 5.5ZM4 10h16M8.5 3.5v4M15.5 3.5v4", stroke: LN },
  heart: { d: "M12 20s-7-4.3-7-10a4.2 4.2 0 0 1 7-3 4.2 4.2 0 0 1 7 3c0 5.7-7 10-7 10z", stroke: SM },
  check: { d: "M5 12.5l4.5 4.5L19 7.5", stroke: LN },
};

const cache = new Map<string, Path2D>();
const pathOf = (d: string) => { let p = cache.get(d); if (!p) { p = new Path2D(d); cache.set(d, p); } return p; };

/** an outline icon centred on (cx, cy), `size` points wide, in one colour */
export function drawIcon(ctx: CanvasRenderingContext2D, name: ShareIcon | "check", cx: number, cy: number, size: number, color: string): void {
  const def = ICONS[name];
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 24, size / 24);
  if (def.fill) { ctx.fillStyle = color; ctx.fill(pathOf(def.d)); }
  else { ctx.strokeStyle = color; ctx.lineWidth = def.stroke; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(pathOf(def.d)); }
  ctx.restore();
}

const BADGE_GOLD = "#c6a65e";
const STAR = "M12 4.2l2.2 4.7 5.1.6-3.8 3.5 1 5.1L12 15.6l-4.5 2.5 1-5.1-3.8-3.5 5.1-.6z";
/** the member badge of the Quran Talents (emerald check, gold check, official star) centred on (cx, cy), `size` points wide; unknown values draw nothing */
export function drawBadge(ctx: CanvasRenderingContext2D, badge: string | null, cx: number, cy: number, size: number): void {
  if (badge !== "emerald" && badge !== "gold" && badge !== "official") return;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 24, size / 24);
  const disc = (r: number) => { ctx.beginPath(); ctx.arc(12, 12, r, 0, Math.PI * 2); };
  if (badge === "official") {
    disc(12); ctx.fillStyle = "rgb(8,58,44)"; ctx.fill();
    disc(11); ctx.strokeStyle = BADGE_GOLD; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = "#F3E2B6"; ctx.strokeStyle = BADGE_GOLD; ctx.lineWidth = 0.8; ctx.lineJoin = "round";
    ctx.fill(pathOf(STAR)); ctx.stroke(pathOf(STAR));
  } else {
    disc(12); ctx.fillStyle = badge === "gold" ? BADGE_GOLD : "#0F8A63"; ctx.fill();
    ctx.strokeStyle = badge === "gold" ? "rgb(8,38,29)" : "#FFFFFF"; ctx.lineWidth = 2.6; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke(pathOf("M7 12.4l3.2 3.2L17.2 8.6"));
  }
  ctx.restore();
}
