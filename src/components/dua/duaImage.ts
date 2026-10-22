// Draws the dua card as a PNG in the browser (story 1080×1920, portrait 1080×1350), the same composition as the app's
// share card (mobile/src/features/duaJourney/DuaCard.tsx): emerald night, a gold niche, the names of Allah in
// calligraphy, the Quran dua by reference, the labelled personal words and the disclosure line. The disclosure and the
// footer are laid out first, at the bottom; everything else is fitted into the space above them (smaller type, then
// fewer lines with an ellipsis), so the disclosure is always complete on the image.
import { NICHE_INNER, NICHE_PATH } from "@/lib/duaJourney";

export type DuaImage = {
  kicker: string; names: string; quranAr: string | null; quranRef: string | null; label: string; personal: string; arabic: string | null;
  forWho: string | null; disclosure: string; footer: string;
  /** language of the personal words and of the disclosure: Chinese wraps by character, ar/ur/fa/ps run right to left */
  lang: string; uiLang: string;
};
export type DuaImageFormat = "story" | "post";
export const DUA_IMAGE_SIZE: Record<DuaImageFormat, [number, number]> = { story: [1080, 1920], post: [1080, 1350] };

const SANS = '"Plus Jakarta Sans Variable", "Inter Variable", "Noto Sans Arabic Variable", "Noto Sans Bengali Variable", "Noto Sans SC Variable", system-ui, sans-serif';
const AR = '"Amiri", serif';
const CALLIG = '"Aref Ruqaa", "Amiri", serif';
const GOLD = "rgb(214,180,108)";
const RTL = new Set(["ar", "ur", "fa", "ps"]);
const BY_CHAR = new Set(["zh"]);

/** lines of at most `max` px; Chinese by character, other languages by word (a word longer than a line is cut) */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, lang: string): string[] {
  const units = BY_CHAR.has(lang) ? [...text.replace(/\s+/g, " ")] : text.split(/\s+/).filter(Boolean);
  const sep = BY_CHAR.has(lang) ? "" : " ";
  const out: string[] = [];
  let line = "";
  for (const u of units) {
    const next = line ? `${line}${sep}${u}` : u;
    if (ctx.measureText(next).width > max && line) { out.push(line.trim()); line = u; } else line = next;
  }
  if (line.trim()) out.push(line.trim());
  return out;
}
/** at most n lines; the last one ends with an ellipsis when text was left out */
function clamp(ctx: CanvasRenderingContext2D, lines: string[], n: number, max: number): string[] {
  if (lines.length <= n) return lines;
  const out = lines.slice(0, n);
  let last = `${out[n - 1]} …`;
  while (ctx.measureText(last).width > max && last.length > 2) last = `${last.slice(0, -3).trimEnd()} …`;
  out[n - 1] = last;
  return out;
}
type Block = { font: (s: number) => string; size: number; lh: number; text: string; lang: string; color: string; rtl: boolean; maxLines: number; gapAfter: number; shadow?: boolean; min: number };

export async function drawDuaImage(d: DuaImage, format: DuaImageFormat): Promise<Blob | null> {
  const [W, H] = DUA_IMAGE_SIZE[format];
  const story = format === "story";
  try { await Promise.all([`700 64px ${CALLIG}`, `400 40px ${AR}`, `400 40px ${SANS}`, `600 30px ${SANS}`].map((f) => document.fonts.load(f))); } catch { /* system fonts */ }
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#06231a"); g.addColorStop(0.55, "#0a3a2b"); g.addColorStop(1, "#041510");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const halo = ctx.createRadialGradient(540, story ? 330 : 230, 10, 540, story ? 330 : 230, 520);
  halo.addColorStop(0, "rgba(255,226,150,0.28)"); halo.addColorStop(1, "rgba(255,226,150,0)");
  ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W * 0.03, 40);
  ctx.scale((W * 0.94) / 300, (H - 40) / 360);
  ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(214,180,108,0.5)"; ctx.stroke(new Path2D(NICHE_PATH));
  ctx.lineWidth = 0.8; ctx.strokeStyle = "rgba(214,180,108,0.2)"; ctx.stroke(new Path2D(NICHE_INNER));
  ctx.restore();
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";

  // 1. the bottom first: footer and the full disclosure (never shortened)
  const uiRtl = RTL.has(d.uiLang);
  ctx.direction = uiRtl ? "rtl" : "ltr";
  ctx.fillStyle = GOLD; ctx.font = `600 28px ${SANS}`; ctx.fillText(d.footer, 540, H - 50);
  ctx.font = `400 24px ${SANS}`;
  const dl = wrap(ctx, d.disclosure, 900, d.uiLang);
  const discTop = H - 90 - dl.length * 34;
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  dl.forEach((l, i) => ctx.fillText(l, 540, discTop + i * 34));
  const limit = discTop - 60; // everything else ends above this line

  // 2. the content above, fitted: shrink the type step by step, then clamp the personal words
  const top = story ? 300 : 170;
  const prw = RTL.has(d.lang);
  const blocks = (k: number): Block[] => [
    { font: (s) => `600 ${s}px ${SANS}`, size: 30, lh: 40, text: d.kicker.toUpperCase(), lang: d.uiLang, color: GOLD, rtl: uiRtl, maxLines: 2, gapAfter: 60 * k, min: 30 },
    { font: (s) => `700 ${s}px ${CALLIG}`, size: (story ? 84 : 72) * k, lh: (story ? 120 : 100) * k, text: d.names, lang: "ar", color: GOLD, rtl: true, maxLines: 2, gapAfter: 30 * k, shadow: true, min: 50 },
    ...(d.quranAr ? [
      { font: (s: number) => `400 ${s}px ${AR}`, size: (story ? 54 : 46) * k, lh: (story ? 100 : 86) * k, text: d.quranAr, lang: "ar", color: "#ffffff", rtl: true, maxLines: story ? 4 : 3, gapAfter: 10, min: 34 },
      { font: (s: number) => `600 ${s}px ${SANS}`, size: 30, lh: 40, text: d.quranRef ?? "", lang: d.uiLang, color: GOLD, rtl: uiRtl, maxLines: 1, gapAfter: 50 * k, min: 30 },
    ] : []),
  ];
  const personalFont = (s: number) => `400 ${s}px ${SANS}`;
  type Layout = { bs: Block[]; lines: string[][]; pLines: string[]; pSize: number; pLh: number; arLines: string[]; height: number };
  const measure = (k: number): { layout: Layout; fits: boolean } => {
    const bs = blocks(k);
    const lines = bs.map((b) => { ctx.font = b.font(Math.max(b.min, b.size)); return clamp(ctx, wrap(ctx, b.text, 880, b.lang), b.maxLines, 880); });
    const pSize = Math.max(28, (story ? 44 : 38) * k), pLh = pSize * 1.5;
    ctx.font = `400 ${Math.max(28, 40 * k)}px ${AR}`;
    const arLines = d.arabic && story ? clamp(ctx, wrap(ctx, d.arabic, 820, "ar"), 3, 820) : [];
    ctx.font = personalFont(pSize);
    const pAll = wrap(ctx, d.personal, 820, d.lang);
    const head = bs.reduce((h, b, i) => h + lines[i].length * Math.max(b.min, b.lh) + b.gapAfter, 0);
    const panelFixed = 90 + (d.forWho ? 60 : 0) + (arLines.length ? 20 + arLines.length * 70 * Math.max(k, 0.7) : 0);
    const room = Math.max(1, Math.floor((limit - top - head - panelFixed) / pLh));
    const pLines = clamp(ctx, pAll, room, 820);
    return { layout: { bs, lines, pLines, pSize, pLh, arLines, height: head + panelFixed + pLines.length * pLh }, fits: room >= pAll.length };
  };
  // the largest type at which everything fits; at the smallest size the personal words end with an ellipsis
  let k = 1, m = measure(k);
  while (!m.fits && k > 0.6) { k = Math.round((k - 0.05) * 100) / 100; m = measure(k); }
  const layout: Layout | null = m.layout;
  if (!layout) return null;
  let y = top;
  layout.bs.forEach((b, i) => {
    ctx.font = b.font(Math.max(b.min, b.size)); ctx.fillStyle = b.color; ctx.direction = b.rtl ? "rtl" : "ltr";
    if (b.shadow) { ctx.shadowColor = "rgba(255,214,130,0.5)"; ctx.shadowBlur = 30; }
    for (const l of layout!.lines[i]) { ctx.fillText(l, 540, y); y += Math.max(b.min, b.lh); }
    ctx.shadowBlur = 0;
    y += b.gapAfter;
  });
  // the personal words in a framed panel, labelled
  const ph = layout.height - (y - top);
  ctx.direction = uiRtl ? "rtl" : "ltr";
  ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.strokeStyle = "rgba(214,180,108,0.4)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(80, y, 920, ph, 36); ctx.fill(); ctx.stroke();
  ctx.fillStyle = GOLD; ctx.font = `600 24px ${SANS}`; ctx.fillText(d.label.toUpperCase(), 540, y + 56);
  ctx.fillStyle = "#f6ead0"; ctx.font = personalFont(layout.pSize); ctx.direction = prw ? "rtl" : "ltr";
  let py = y + 56 + layout.pLh;
  for (const l of layout.pLines) { ctx.fillText(l, 540, py); py += layout.pLh; }
  if (d.forWho) { ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.font = `400 32px ${SANS}`; ctx.fillText(d.forWho, 540, py); py += 60; }
  if (layout.arLines.length) {
    ctx.direction = "rtl"; ctx.fillStyle = "#f3e2b6"; ctx.font = `400 ${Math.max(28, 40 * k)}px ${AR}`;
    py += 20;
    for (const l of layout.arLines) { ctx.fillText(l, 540, py); py += 70 * Math.max(k, 0.7); }
  }
  return new Promise((res) => c.toBlob((b) => res(b), "image/png"));
}
