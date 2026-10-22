import { DIVISION_MARK, TIER_COLORS, TIER_POINTS, starPath, type Career } from "@/lib/career";

// The shareable career card on the website, drawn on a canvas at 1080 × 1350 (portrait 4:5) or 1080 × 1920 (story
// 9:16): deep emerald with a quiet girih pattern, a gold frame, the tier emblem inside its progress ring, the big
// numbers and the profile link. Same content as the app's card (mobile/src/features/stats/CareerCard.tsx).
export type CardFormat = "post" | "story";
export const CARD_PX: Record<CardFormat, [number, number]> = { post: [1080, 1350], story: [1080, 1920] };
export type CardData = {
  name: string; username: string; avatar: string | null; verified: boolean; verifiedLabel: string;
  tierLabel: string; career: Career; pointsLabel: string; title: string;
  stats: { value: string; label: string }[];
  place: string; since: string; url: string;
};

const GOLD = "#D6B46C", CREAM = "#F4E3B4";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number, size: number, weight: number, font: string) {
  let s = size;
  ctx.font = `${weight} ${s}px ${font}`;
  while (s > 18 && ctx.measureText(text).width > max) { s -= 2; ctx.font = `${weight} ${s}px ${font}`; }
  return s;
}

export async function drawCareerCard(canvas: HTMLCanvasElement, d: CardData, format: CardFormat): Promise<void> {
  const [W, H] = CARD_PX[format];
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const font = getComputedStyle(document.body).fontFamily || "sans-serif";
  const story = format === "story";
  // ground
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#0E4A38"); g.addColorStop(0.55, "#072C21"); g.addColorStop(1, "#03140E");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // girih pattern
  ctx.save();
  ctx.strokeStyle = "rgba(214,180,108,0.07)"; ctx.lineWidth = 2;
  const cell = 135;
  for (let y = -cell / 2; y < H + cell; y += cell) for (let x = 0; x < W + cell; x += cell) {
    ctx.stroke(new Path2D(starPath(x + ((Math.round(y / cell) % 2) * cell) / 2, y, 8, 52, 30)));
  }
  ctx.restore();
  // frame
  ctx.strokeStyle = "rgba(214,180,108,0.75)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(40, 40, W - 80, H - 80, 36); ctx.stroke();
  ctx.strokeStyle = "rgba(214,180,108,0.3)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(56, 56, W - 112, H - 112, 28); ctx.stroke();

  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  let y = story ? 190 : 140;
  ctx.fillStyle = GOLD; ctx.font = `700 46px ${font}`; ctx.fillText("Quran Masterclass", W / 2, y);
  y += 50;
  ctx.fillStyle = "rgba(244,227,180,0.75)"; ctx.font = `600 30px ${font}`; ctx.fillText(d.title, W / 2, y);

  // avatar + name
  y += story ? 90 : 50;
  const av = story ? 150 : 116;
  ctx.save();
  ctx.beginPath(); ctx.arc(W / 2, y + av / 2, av / 2, 0, Math.PI * 2); ctx.closePath();
  ctx.fillStyle = "#0B3D2E"; ctx.fill(); ctx.clip();
  const img = d.avatar ? await loadImage(d.avatar) : null;
  if (img) ctx.drawImage(img, W / 2 - av / 2, y, av, av);
  else { ctx.fillStyle = GOLD; ctx.font = `700 ${Math.round(av * 0.42)}px ${font}`; ctx.textBaseline = "middle"; ctx.fillText((d.name.trim()[0] ?? "Q").toUpperCase(), W / 2, y + av / 2 + 2); ctx.textBaseline = "alphabetic"; }
  ctx.restore();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(W / 2, y + av / 2, av / 2 + 3, 0, Math.PI * 2); ctx.stroke();
  y += av + 64;
  ctx.fillStyle = "#FFFFFF";
  fit(ctx, d.name, W - 260, 56, 800, font); ctx.fillText(d.name, W / 2, y);
  y += 46;
  ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = `600 32px ${font}`;
  ctx.fillText(`@${d.username}${d.verified ? `  ·  ${d.verifiedLabel}` : ""}`, W / 2, y);

  // emblem in its ring
  y += story ? 90 : 46;
  const E = story ? 330 : 270, cx = W / 2, cy = y + E / 2;
  const c = TIER_COLORS[d.career.tier];
  ctx.lineWidth = 12; ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(214,180,108,0.2)"; ctx.beginPath(); ctx.arc(cx, cy, E / 2, 0, Math.PI * 2); ctx.stroke();
  if (d.career.into > 0) { ctx.strokeStyle = GOLD; ctx.beginPath(); ctx.arc(cx, cy, E / 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(0.9999, d.career.into)); ctx.stroke(); }
  const k = (E * 0.84) / 120;
  ctx.save(); ctx.translate(cx - 60 * k, cy - 60 * k); ctx.scale(k, k);
  const mg = ctx.createLinearGradient(0, 0, 120, 120); mg.addColorStop(0, c.light); mg.addColorStop(0.55, c.metal); mg.addColorStop(1, c.deep);
  ctx.fillStyle = mg; ctx.strokeStyle = c.deep; ctx.lineWidth = 1.2;
  const star = new Path2D(starPath(60, 60, TIER_POINTS[d.career.tier], 46, 36)); ctx.fill(star); ctx.stroke(star);
  ctx.fillStyle = "#06372A"; ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(60, 60, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(214,180,108,0.55)"; ctx.lineWidth = 1; ctx.stroke(new Path2D(starPath(60, 60, 8, 25, 19, -Math.PI / 2 + Math.PI / 8)));
  ctx.fillStyle = CREAM;
  if (d.career.division) { ctx.font = `800 17px ${font}`; ctx.textBaseline = "middle"; ctx.fillText(DIVISION_MARK[d.career.division], 60, 61); ctx.textBaseline = "alphabetic"; }
  else ctx.fill(new Path2D(starPath(60, 60, 8, 11, 5)));
  ctx.restore();
  y += E + 78;
  ctx.fillStyle = CREAM; fit(ctx, d.tierLabel, W - 200, 60, 800, font); ctx.fillText(d.tierLabel, W / 2, y);
  y += 46;
  ctx.fillStyle = "rgba(244,227,180,0.7)"; ctx.font = `600 30px ${font}`; ctx.fillText(d.pointsLabel, W / 2, y);

  // big numbers
  y += story ? 90 : 56;
  const cols = 2, cw = (W - 200) / cols, rh = story ? 170 : 132;
  d.stats.slice(0, 4).forEach((st, i) => {
    const x = 100 + (i % cols) * cw + cw / 2, yy = y + Math.floor(i / cols) * rh;
    ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.beginPath(); ctx.roundRect(x - cw / 2 + 12, yy, cw - 24, rh - 22, 22); ctx.fill();
    ctx.fillStyle = "#FFFFFF"; fit(ctx, st.value, cw - 60, story ? 60 : 50, 800, font); ctx.fillText(st.value, x, yy + (story ? 76 : 62));
    ctx.fillStyle = "rgba(255,255,255,0.62)"; fit(ctx, st.label, cw - 60, 26, 600, font); ctx.fillText(st.label, x, yy + (story ? 118 : 94));
  });
  y += rh * 2 + (story ? 40 : 14);
  ctx.fillStyle = "rgba(255,255,255,0.8)"; fit(ctx, d.place, W - 200, 30, 600, font); ctx.fillText(d.place, W / 2, y);
  if (d.since) { y += 42; ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = `500 26px ${font}`; ctx.fillText(d.since, W / 2, y); }
  ctx.fillStyle = GOLD; ctx.font = `600 26px ${font}`; ctx.fillText(d.url, W / 2, H - 92);
}
