// Browser only: draws carousel slides and wisdom cards as PNGs at exactly Instagram's pixels (1080 × 1350 for 4:5,
// 1080 × 1080 for 1:1, 1080 × 1920 for stories with the top 250 px and bottom 340 px free of content). The same layout
// as the app's mobile/src/features/carousel/Slide.tsx: ground, frame, rule and rosette come from lib/share/svg.ts (the
// web port of the share templates) painted through an SVG image, the text is laid out with lib/share/canvasText.ts.
// Scripture comes resolved from the server (resolve.ts); a slide without its text shows only its reference.
import { CARD_SIZE, PALETTES, type Palette, type ShareFormat } from "@/lib/share/formats";
import { arLen, fit, fontMetrics, isRtl, naturalLine, textPara, textWidth, type Para } from "@/lib/share/canvasText";
import { frameSvg, groundSvg, ornamentRuleInner, rosetteInner, star8Path, type Lay } from "@/lib/share/svg";
import { drawIcon } from "@/lib/share/icons";
import { WORDMARK_FILES, wordmarkSrc } from "@/components/wordmark-files";
import { carouselText, fill } from "./uiText";
import type { PaletteId } from "./types";
import type { ResolvedCarousel, ResolvedWisdom, SlideScripture } from "./resolve";

type Ctx = CanvasRenderingContext2D;
const AR = `Amiri, "Scheherazade New", "Noto Naskh Arabic", serif`;
const OTHER = `"Noto Sans Arabic Variable", "Vazirmatn Variable", "Noto Sans Bengali Variable", "Noto Sans SC Variable"`;
const SANS = `"Plus Jakarta Sans Variable", ${OTHER}, system-ui, sans-serif`;
const SERIF = `"Fraunces Variable", ${OTHER}, Georgia, serif`;
const RTL_LANGS = new Set(["ar", "ur", "fa", "ps"]);
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const digits = (n: number | string, lang: string) => (lang === "ar" ? String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]) : String(n));
const URL_TEXT = "quranmasterclass.com/app";

type Fonts = { title: (s: number) => string; body: (s: number) => string; italic: (s: number) => string; rtl: boolean; lineK: number };
const fontsFor = (lang: string): Fonts => RTL_LANGS.has(lang)
  ? { title: (s) => `700 ${s}px ${AR}`, body: (s) => `400 ${s}px ${AR}`, italic: (s) => `400 ${s}px ${AR}`, rtl: true, lineK: 1.65 }
  : { title: (s) => `600 ${s}px ${SERIF}`, body: (s) => `400 ${s}px ${SANS}`, italic: (s) => `italic 400 ${s}px ${SERIF}`, rtl: false, lineK: 1.45 };
const fSans = (s: number, w: 400 | 500 | 600 = 400) => `${w} ${s}px ${SANS}`;
const fAr = (s: number, bold = false) => `${bold ? 700 : 400} ${s}px ${AR}`;

/** per format: padding, room above and below the content (story: Instagram's safe zones), frame and arch */
type Box = { padX: number; top: number; bottom: number; foot: number; frame: Lay };
const BOX: Record<ShareFormat, Box> = {
  post: { padX: 30, top: 34, bottom: 26, foot: 30, frame: { padX: 0, top: 0, bottom: 0, frame: 12, arch: 34, kicker: 0, foot: 0 } },
  square: { padX: 28, top: 26, bottom: 22, foot: 26, frame: { padX: 0, top: 0, bottom: 0, frame: 11, arch: 0, kicker: 0, foot: 0 } },
  story: { padX: 32, top: 88, bottom: 116, foot: 34, frame: { padX: 0, top: 0, bottom: 0, frame: 14, arch: 70, kicker: 0, foot: 0 } },
};

// ---------- loading ----------
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error("image")); img.src = src; });
}
const marks = new Map<string, Promise<HTMLImageElement | null>>();
function wordmark(lang: string, tone: "gold" | "deep") {
  const src = wordmarkSrc(lang === "ar" ? "ar" : "inline", tone);
  let p = marks.get(src);
  if (!p) { p = loadImage(src).catch(() => null); marks.set(src, p); }
  return p;
}
async function loadFonts(texts: string[], arabic: string[]) {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const other = texts.join(" "), ar = `${arabic.join(" ")} ﴿﴾${AR_DIGITS}`;
  const jobs: [string, string][] = [["400 20px Amiri", ar], ["700 20px Amiri", ar], ['400 20px "Fraunces Variable"', other], ['italic 400 20px "Fraunces Variable"', other], ['600 20px "Fraunces Variable"', other],
    ['400 20px "Plus Jakarta Sans Variable"', other], ['500 20px "Plus Jakarta Sans Variable"', other], ['600 20px "Plus Jakarta Sans Variable"', other]];
  if (/[؀-ۿ]/.test(other)) jobs.push(["400 20px Amiri", other], ["700 20px Amiri", other], ['400 20px "Noto Sans Arabic Variable"', other]);
  if (/[ঀ-৿]/.test(other)) jobs.push(['400 20px "Noto Sans Bengali Variable"', other], ['600 20px "Noto Sans Bengali Variable"', other]);
  if (/[⺀-鿿]/.test(other)) jobs.push(['400 20px "Noto Sans SC Variable"', other], ['600 20px "Noto Sans SC Variable"', other]);
  await Promise.all(jobs.map(([f, t]) => document.fonts.load(f, t).catch(() => [])));
}

// ---------- blocks: the content group, centred between the top and the brand line ----------
type Block = { h: number; before?: number; svg?: (cx: number, y: number, uid: string) => string; draw?: (c: Ctx, cx: number, y: number) => void; /** the place of the wordmark (final slide) */ mark?: boolean };
const para = (p: Para, before = 0): Block => ({ h: p.h, before, draw: (c, cx, y) => p.draw(c, cx, y) });
const rule = (p: Palette, width: number, before = 0): Block => ({ h: 12, before, svg: (cx, y, uid) => `<g transform="translate(${cx - width / 2} ${y})">${ornamentRuleInner(p, width, uid)}</g>` });
const rosette = (p: Palette, size: number, before: number, inner: (c: Ctx, cx: number, cy: number) => void): Block => ({
  h: size, before, svg: (cx, y) => `<g transform="translate(${cx - size / 2} ${y})">${rosetteInner(p, size)}</g>`, draw: (c, cx, y) => inner(c, cx, y + size / 2),
});
const clean = (s?: string) => (s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

type Env = { ctx: Ctx; p: Palette; f: Fonts; format: ShareFormat; lang: string; boxW: number };

function scriptureBlocks(env: Env, sc: SlideScripture, h: number, quote: boolean, before: number): Block[] {
  const { ctx, p, lang, boxW } = env;
  const ar = clean(sc.arabic), tr = lang === "ar" ? "" : clean(sc.text);
  const room = h - 18 - (ar && tr ? 14 : 0);
  const share = !tr ? 1 : !ar ? 0 : arLen(ar) > 360 ? 0.32 : arLen(ar) > tr.length * 0.7 ? 0.55 : 0.45;
  const hAr = room * share, hTr = room - hAr;
  const sAr = ar ? fit(arLen(ar) + 4, boxW, hAr, 0.5, 1.8, 11.5, tr ? (h > 300 ? 30 : 26) : 34) : 0;
  const sTr = tr ? fit(tr.length, boxW, hTr, 0.47, 1.45, 9.5, h > 300 ? 17 : 15.5) : 0;
  const out: Block[] = [];
  if (ar) out.push(para(textPara(ctx, ar, fAr(sAr), p.arabic, { lineH: sAr * 1.8, maxLines: Math.max(1, Math.floor(hAr / (sAr * 1.8))), maxW: boxW, dir: "rtl" }), before));
  if (ar && tr) out.push(rule(p, 56, 4));
  if (tr) {
    const font = RTL_LANGS.has(lang) ? fAr(sTr) : `italic 400 ${sTr}px ${SERIF}`;
    out.push(para(textPara(ctx, quote ? `“${tr}”` : tr, font, p.soft, { lineH: sTr * 1.45, maxLines: Math.max(1, Math.floor(hTr / (sTr * 1.45))), maxW: boxW, dir: RTL_LANGS.has(lang) ? "rtl" : "ltr" }), ar ? 4 : before));
  }
  const ref = `${sc.ref}${sc.repeat && sc.repeat > 1 ? ` · ${fill(carouselText(lang).times, { n: digits(sc.repeat, lang) })}` : ""}`;
  out.push(para(textPara(ctx, ref, fSans(10, 600), p.accent, { lineH: 15, maxLines: 1, maxW: boxW, dir: isRtl(ref) ? "rtl" : "ltr", ls: 0.6 }), 6));
  return out;
}

function placeholderBlocks(env: Env, label: string): Block[] {
  const { ctx, p, boxW, lang } = env;
  return [
    rosette(p, 58, 0, (c, cx, cy) => drawIcon(c, "book", cx, cy, 20, p.line)),
    para(textPara(ctx, label, fSans(12, 600), p.accent, { lineH: 17, maxLines: 2, maxW: boxW }), 8),
    para(textPara(ctx, carouselText(lang).offline, fSans(11), p.muted, { lineH: 15, maxLines: 2, maxW: boxW }), 4),
  ];
}

function numberStar(env: Env, n: number, size: number): Block {
  const { p, lang } = env;
  return {
    h: size, svg: (cx, y) => `<path d="${star8Path(cx, y + size / 2, size * 0.49, 0.78)}" fill="${p.dark ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.55)"}" stroke="${p.line}" stroke-width="0.9"/>`,
    draw: (c, cx, y) => { const t = textPara(c, digits(n, lang), fSans(size * 0.4, 600), p.ink, { lineH: size, maxLines: 1, maxW: size }); t.draw(c, cx, y); },
  };
}

/** plain line breaking for left / right aligned rows (spaces; scripts without spaces break between characters) */
function wrap(ctx: Ctx, text: string, font: string, maxW: number): string[] {
  ctx.font = font;
  const spaced = /\s/.test(text.trim()) || !/[\u2E80-\u9FFF]/.test(text);
  const tokens = spaced ? text.split(/\s+/) : Array.from(text);
  const lines: string[] = [];
  let cur = "";
  for (const t of tokens) {
    const next = cur ? (spaced ? `${cur} ${t}` : cur + t) : t;
    if (cur && ctx.measureText(next).width > maxW) { lines.push(cur); cur = t; } else cur = next;
  }
  if (cur) lines.push(cur);
  if (lines.length > 2) { lines.length = 2; lines[1] = `${lines[1].replace(/\s*\S+$/, "")} …`; }
  return lines;
}

/** the blocks of slide `index` (0 cover, 1…n content, n+1 final) */
function slideBlocks(env: Env, c: ResolvedCarousel, index: number, room: number): { blocks: Block[]; brand: "small" | "big" | "none"; n?: number; total?: number } {
  const { ctx, p, f, format, lang, boxW } = env;
  const tx = carouselText(lang);
  const small = format === "square";
  const total = c.slides.length + 2;
  const dir = f.rtl ? "rtl" : "ltr";
  if (index <= 0) {
    const blocks: Block[] = [];
    blocks.push(para(textPara(ctx, c.cover.kicker, fSans(11, 600), p.accent, { lineH: 16, maxLines: 1, maxW: boxW, ls: isRtl(c.cover.kicker) ? 0 : 1.6 })));
    blocks.push(rule(p, 110, 6));
    if (c.cover.arabic) {
      const rs = format === "story" ? 150 : small ? 92 : 118;
      const s = Math.min(rs * 0.3, (rs * 0.64 * 2.1) / Math.max(2.5, arLen(c.cover.arabic)));
      blocks.push(rosette(p, rs, small ? 8 : 12, (cc, cx, cy) => { const t = textPara(cc, c.cover.arabic!, fAr(s, true), p.arabic, { lineH: s * 1.75, maxLines: 1, maxW: rs * 0.7, dir: "rtl" }); t.draw(cc, cx, cy - t.h / 2); }));
    }
    const tS = fit(c.cover.title.length, boxW, small ? 96 : format === "story" ? 170 : 130, f.rtl ? 0.5 : 0.52, 1.18, 21, format === "story" ? 40 : small ? 30 : 34);
    blocks.push(para(textPara(ctx, c.cover.title, f.title(tS), p.ink, { lineH: tS * (f.rtl ? 1.55 : 1.16), maxLines: 4, maxW: boxW, dir, ls: f.rtl ? 0 : -0.4 }), small ? 8 : 12));
    if (c.cover.sub) blocks.push(para(textPara(ctx, c.cover.sub, f.italic(small ? 13.5 : 15), p.soft, { lineH: small ? 19 : f.rtl ? 26 : 21, maxLines: small ? 2 : 3, maxW: boxW, dir }), small ? 8 : 12));
    // the swipe pill
    const label = `${tx.swipe}  ${digits(total, lang)}  ${f.rtl ? "‹" : "›"}`;
    const lw = textWidth(ctx, fSans(11.5, 600), label) + 28;
    blocks.push({
      h: 28, before: small ? 10 : 16,
      svg: (cx, y) => `<rect x="${cx - lw / 2}" y="${y}" width="${lw}" height="28" rx="14" fill="none" stroke="${p.line}" stroke-width="1"/>`,
      draw: (cc, cx, y) => { const t = textPara(cc, label, fSans(11.5, 600), p.ink, { lineH: 28, maxLines: 1, maxW: lw, dir }); t.draw(cc, cx, y); },
    });
    return { blocks, brand: "big" };
  }
  if (index > c.slides.length) {
    const blocks: Block[] = [rosette(p, small ? 50 : 62, 0, (cc, cx, cy) => drawIcon(cc, "book", cx, cy, small ? 17 : 21, p.line))];
    blocks.push(para(textPara(ctx, tx.saveShare, f.title(small ? 19 : 23), p.ink, { lineH: (small ? 19 : 23) * 1.3, maxLines: 2, maxW: boxW, dir }), 10));
    blocks.push(para(textPara(ctx, c.cover.title, f.italic(small ? 12.5 : 14), p.soft, { lineH: small ? 17 : 20, maxLines: 2, maxW: boxW, dir }), 6));
    const max = small ? 5 : format === "story" ? 9 : 7;
    const shown = c.sources.slice(0, max);
    if (shown.length) {
      const lines = [tx.sources, ...shown.map((s) => s.label), ...(c.sources.length > max ? [`+${digits(c.sources.length - max, lang)} ${tx.more}`] : [])];
      const ps = lines.map((l, i) => textPara(ctx, l, i ? fSans(small ? 9.5 : 10.5) : fSans(10, 600), i ? p.soft : p.accent, { lineH: small ? 13 : 15, maxLines: 1, maxW: boxW - 8, dir: isRtl(l) ? "rtl" : "ltr" }));
      const h = ps.reduce((a, x) => a + x.h, 0) + 18;
      blocks.push({
        h, before: 10,
        svg: (cx, y) => `<line x1="${cx - boxW / 2}" y1="${y}" x2="${cx + boxW / 2}" y2="${y}" stroke="${p.line}" stroke-width="0.5"/><line x1="${cx - boxW / 2}" y1="${y + h}" x2="${cx + boxW / 2}" y2="${y + h}" stroke="${p.line}" stroke-width="0.5"/>`,
        draw: (cc, cx, y) => { let yy = y + 9; for (const x of ps) { x.draw(cc, cx, yy); yy += x.h; } },
      });
    }
    blocks.push({ h: format === "story" ? 28 : small ? 20 : 24, before: small ? 10 : 16, mark: true }); // the wordmark goes here (drawn by the caller)
    blocks.push(para(textPara(ctx, URL_TEXT, fSans(11, 600), p.ink, { lineH: 16, maxLines: 1, maxW: boxW, dir: "ltr", ls: 1.2 }), 5));
    blocks.push(para(textPara(ctx, tx.cta, fSans(10.5), p.muted, { lineH: 15, maxLines: 1, maxW: boxW, dir }), 3));
    return { blocks, brand: "none" };
  }
  const s = c.slides[index - 1];
  const titleS = small ? 17 : format === "story" ? 22 : 19;
  const isRef = s.t !== "text";
  const blocks: Block[] = [numberStar(env, s.n, small ? 26 : 30)];
  const title = clean(s.title);
  if (title) blocks.push(para(textPara(ctx, title, f.title(isRef ? titleS - 2 : titleS), p.ink, { lineH: (isRef ? titleS - 2 : titleS) * (f.rtl ? 1.55 : 1.22), maxLines: 3, maxW: boxW, dir, ls: f.rtl ? 0 : -0.2 }), small ? 5 : 8));
  const used = blocks.reduce((a, b) => a + b.h + (b.before ?? 0), 0) + 8;
  const body = clean(s.body);
  if (isRef) {
    const texts = c.texts[s.n];
    const noteH = body ? (small ? 40 : 56) : 0;
    const blockH = room - used - noteH;
    if (!texts?.length) {
      const label = s.t === "verse" || s.t === "pair" ? `${tx.quran} ${s.keys ? s.keys.join(" · ") : `${s.key}${s.to ? `–${s.to}` : ""}`}` : s.t === "hadith" ? `${tx.hadith} · ${s.c} ${s.num}` : `${tx.dua} · Hisnul Muslim ${s.h}`;
      blocks.push(...placeholderBlocks(env, label).map((b, i) => (i ? b : { ...b, before: 10 })));
    } else if (s.t === "pair") {
      for (const [i, sc] of texts.entries()) blocks.push(...scriptureBlocks({ ...env, boxW: boxW - 20 }, sc, (blockH - 12) / 2 - 18, false, i ? 14 : 10));
    } else blocks.push(...scriptureBlocks(env, texts[0], blockH, s.t !== "verse", 10));
    if (body) {
      const t = textPara(ctx, body, f.body(small ? 11.5 : 12.5), p.ink, { lineH: (small ? 11.5 : 12.5) * (f.rtl ? 1.7 : 1.45), maxLines: small ? 2 : 3, maxW: boxW, dir });
      blocks.push({ h: t.h + 10, before: 8, svg: (cx, y) => `<line x1="${cx - boxW / 2}" y1="${y}" x2="${cx + boxW / 2}" y2="${y}" stroke="${p.line}" stroke-width="0.5"/>`, draw: (cc, cx, y) => t.draw(cc, cx, y + 9) });
    }
  } else {
    const ar = clean(s.arabic);
    if (ar) { const sz = small ? 28 : format === "story" ? 40 : 34; blocks.push(para(textPara(ctx, ar, fAr(sz, true), p.arabic, { lineH: sz * 1.8, maxLines: 1, maxW: boxW, dir: "rtl" }), 6)); }
    blocks.push(rule(p, 64, small ? 7 : 11));
    const list = s.list ?? [];
    const rowS = small ? 12 : format === "story" ? 15 : 13.5;
    const rowLh = rowS * (f.rtl ? 1.65 : 1.38);
    const rows = list.map((it) => wrap(ctx, it, f.body(rowS), boxW - 32).slice(0, 2));
    const gap = small ? 5 : 8;
    const rowH = (r: string[]) => Math.max(r.length * rowLh, 22);
    const listH = rows.reduce((a, r) => a + rowH(r) + gap, 0) - (rows.length ? gap : 0);
    if (body) {
      const bodyRoom = Math.max(40, room - used - (ar ? 60 : 0) - listH - 24);
      const bs = fit(body.length, boxW, bodyRoom, 0.5, f.rtl ? 1.7 : 1.5, 11.5, format === "story" ? 18.5 : 16.5);
      blocks.push(para(textPara(ctx, body, f.body(bs), p.soft, { lineH: bs * (f.rtl ? 1.7 : 1.5), maxLines: Math.max(2, Math.floor(bodyRoom / (bs * (f.rtl ? 1.7 : 1.5)))), maxW: boxW, dir }), small ? 7 : 11));
    }
    if (rows.length) {
      const xNum = (cx: number) => (f.rtl ? cx + boxW / 2 - 11 : cx - boxW / 2 + 11);
      blocks.push({
        h: listH, before: small ? 7 : 11,
        svg: (cx, y) => { let yy = y, out = ""; for (const r of rows) { const rh = rowH(r); out += `<circle cx="${xNum(cx)}" cy="${yy + rh / 2}" r="10.5" fill="none" stroke="${p.line}" stroke-width="1"/>`; yy += rh + gap; } return out; },
        draw: (cc, cx, y) => {
          let yy = y;
          rows.forEach((r, i) => {
            const rh = rowH(r);
            textPara(cc, digits(i + 1, lang), fSans(small ? 9.5 : 10.5, 600), p.accent, { lineH: 21, maxLines: 1, maxW: 21 }).draw(cc, xNum(cx), yy + rh / 2 - 10.5);
            const font = f.body(rowS), m = fontMetrics(cc, font);
            cc.font = font; cc.fillStyle = p.ink; cc.textBaseline = "alphabetic"; cc.direction = f.rtl ? "rtl" : "ltr"; cc.textAlign = f.rtl ? "right" : "left";
            const x = f.rtl ? cx + boxW / 2 - 32 : cx - boxW / 2 + 32;
            const top = yy + (rh - r.length * rowLh) / 2;
            r.forEach((ln, k) => cc.fillText(ln, x, top + k * rowLh + (rowLh - (m.asc + m.desc)) / 2 + m.asc));
            yy += rh + gap;
          });
        },
      });
    }
  }
  return { blocks, brand: "small", n: s.n, total: c.slides.length };
}

function wisdomBlocks(env: Env, w: ResolvedWisdom, room: number): Block[] {
  const { ctx, p, f, format, lang, boxW } = env;
  const tx = carouselText(lang);
  const kicker = w.kind === "reflection" ? `${tx.reflection} · ${w.themeLabel}` : w.themeLabel;
  const blocks: Block[] = [para(textPara(ctx, kicker, fSans(11, 600), p.accent, { lineH: 16, maxLines: 1, maxW: boxW, ls: isRtl(kicker) ? 0 : 1.6 })), rule(p, 104, 6)];
  const inner = room - 60;
  if (w.scripture) blocks.push(...scriptureBlocks(env, w.scripture, inner, !!w.c, 12));
  else if (w.key || w.c) blocks.push(...placeholderBlocks(env, w.source.label));
  else {
    const text = clean(w.text), ar = clean(w.arabic);
    const hAr = ar ? inner * 0.42 : 0;
    if (ar) { const sAr = fit(arLen(ar), boxW, hAr, 0.5, 1.8, 13, format === "story" ? 30 : 26); blocks.push(para(textPara(ctx, ar, fAr(sAr), p.arabic, { lineH: sAr * 1.8, maxLines: Math.max(2, Math.floor(hAr / (sAr * 1.8))), maxW: boxW, dir: "rtl" }), 12), rule(p, 56, 6)); }
    const sT = fit(text.length, boxW, inner - hAr - (w.by ? 40 : 10), f.rtl ? 0.5 : 0.48, f.rtl ? 1.7 : 1.38, 13, format === "story" ? 28 : format === "post" ? 24 : 21);
    const font = w.kind === "reflection" ? f.title(sT) : f.italic(sT);
    blocks.push(para(textPara(ctx, w.kind === "reflection" ? text : `“${text}”`, font, p.ink, { lineH: sT * (f.rtl ? 1.7 : 1.38), maxLines: 9, maxW: boxW, dir: f.rtl ? "rtl" : "ltr" }), 12));
    const by = [w.by, w.work].filter(Boolean).join(" · ");
    if (by) blocks.push(para(textPara(ctx, by, fSans(10.5, 600), p.accent, { lineH: 15, maxLines: 2, maxW: boxW, dir: isRtl(by) ? "rtl" : "ltr" }), 10));
  }
  return blocks;
}

async function draw(format: ShareFormat, palette: PaletteId, seed: string, lang: string, texts: string[], arabic: string[], build: (env: Env, room: number) => { blocks: Block[]; brand: "small" | "big" | "none"; n?: number; total?: number }): Promise<HTMLCanvasElement> {
  const { w: W, h: H, px } = CARD_SIZE[format];
  const p = PALETTES[palette];
  const bx = BOX[format];
  const [mark] = await Promise.all([wordmark(lang, p.wordmark), loadFonts(texts, arabic)]);
  const canvas = document.createElement("canvas");
  canvas.width = px[0];
  canvas.height = px[1];
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.scale(px[0] / W, px[1] / H);
  ctx.imageSmoothingQuality = "high";
  const env: Env = { ctx, p, f: fontsFor(lang), format, lang, boxW: W - bx.padX * 2 };
  const room = H - bx.top - bx.bottom - bx.foot - 8;
  const built = build(env, room);
  const cx = W / 2;
  const footH = built.brand === "none" ? 0 : built.brand === "big" ? bx.foot + 18 : bx.foot;
  const areaTop = bx.top, areaBottom = H - bx.bottom - footH;
  const mid = (areaTop + areaBottom) / 2;
  const total = built.blocks.reduce((s, b, i) => s + b.h + (i ? b.before ?? 0 : 0), 0);
  const squeeze = total > areaBottom - areaTop ? Math.max(0.6, (areaBottom - areaTop) / total) : 1;
  let y = mid - total / 2;
  const placed = built.blocks.map((b, i) => { if (i) y += b.before ?? 0; const top = y; y += b.h; return { b, top }; });
  let uids = 0;
  const art = placed.filter(({ b }) => b.svg).map(({ b, top }) => b.svg!(cx, top, `cr${uids++}`)).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px[0]}" height="${px[1]}" viewBox="0 0 ${W} ${H}">${groundSvg(p, W, H, seed, "crg")}${frameSvg(p, W, H, bx.frame, "crf")}`
    + `<g transform="translate(${cx} ${mid}) scale(${squeeze}) translate(${-cx} ${-mid})">${art}</g></svg>`;
  ctx.drawImage(await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`), 0, 0, W, H);
  ctx.save();
  ctx.translate(cx, mid); ctx.scale(squeeze, squeeze); ctx.translate(-cx, -mid);
  for (const { b, top } of placed) b.draw?.(ctx, cx, top);
  // the final slide keeps a place for the wordmark: the block of the wordmark's height before the link
  if (built.brand === "none" && mark) {
    const at = placed.find(({ b }) => b.mark);
    if (at) { const file = WORDMARK_FILES[lang === "ar" ? "ar" : "inline"]; const wh = at.b.h * (lang === "ar" ? 1.3 : 1); const ww = (wh * file.w) / file.h; ctx.drawImage(mark, cx - ww / 2, at.top, ww, wh); }
  }
  ctx.restore();
  // slide number top right (top left in RTL) and the brand line
  if (built.n !== undefined && built.total) {
    const label = `${digits(built.n, lang)}/${digits(built.total, lang)}`;
    const m = fontMetrics(ctx, fSans(10, 600));
    ctx.font = fSans(10, 600); ctx.fillStyle = p.accent; ctx.textBaseline = "alphabetic"; ctx.direction = "ltr";
    ctx.textAlign = env.f.rtl ? "left" : "right";
    const ty = (format === "story" ? bx.top - 30 : bx.frame.frame + 12) + m.asc;
    ctx.fillText(label, env.f.rtl ? bx.frame.frame + 14 : W - bx.frame.frame - 14, ty);
  }
  if (built.brand !== "none" && mark) {
    const file = WORDMARK_FILES[lang === "ar" ? "ar" : "inline"];
    const big = built.brand === "big";
    const wh = (big ? (format === "story" ? 24 : 20) : format === "story" ? 15 : 13) * (lang === "ar" ? 1.3 : 1);
    const ww = (wh * file.w) / file.h;
    const bottom = H - bx.bottom;
    if (big) {
      const url = textPara(ctx, URL_TEXT, fSans(9.5, 500), p.muted, { lineH: naturalLine(ctx, fSans(9.5, 500)), maxLines: 1, maxW: W, dir: "ltr", ls: 1.3 });
      url.draw(ctx, cx, bottom - url.h);
      ctx.drawImage(mark, cx - ww / 2, bottom - url.h - 3 - wh, ww, wh);
    } else ctx.drawImage(mark, cx - ww / 2, bottom - wh, ww, wh);
  }
  return canvas;
}

const toBlob = (c: HTMLCanvasElement) => new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("png"))), "image/png"));

function carouselStrings(c: ResolvedCarousel): { texts: string[]; arabic: string[] } {
  const texts = [c.cover.kicker, c.cover.title, c.cover.sub ?? "", ...c.slides.flatMap((s) => [s.title ?? "", s.body ?? "", ...(s.list ?? [])]), ...c.sources.map((s) => s.label), URL_TEXT];
  const arabic = [c.cover.arabic ?? "", ...c.slides.map((s) => s.arabic ?? ""), ...Object.values(c.texts).flat().map((t) => `${t.arabic ?? ""} ${t.text ?? ""}`)];
  return { texts, arabic };
}

/** one slide (0 cover, 1…n content, n+1 final) as a PNG at the format's exact pixels */
export async function renderSlide(c: ResolvedCarousel, index: number, format: ShareFormat, palette: PaletteId = c.palette): Promise<Blob> {
  const s = carouselStrings(c);
  return toBlob(await draw(format, palette, `cr:${c.id}:${index}`, c.lang, s.texts, s.arabic, (env, room) => slideBlocks(env, c, index, room)));
}
export async function renderWisdom(w: ResolvedWisdom, format: ShareFormat, palette: PaletteId = w.palette): Promise<Blob> {
  const texts = [w.themeLabel, w.text ?? "", w.by ?? "", w.work ?? "", w.scripture?.text ?? "", w.scripture?.ref ?? "", w.source.label, URL_TEXT];
  return toBlob(await draw(format, palette, `ws:${w.id}`, w.lang, texts, [w.arabic ?? "", w.scripture?.arabic ?? ""], (env, room) => ({ blocks: wisdomBlocks(env, w, room), brand: "big" })));
}
