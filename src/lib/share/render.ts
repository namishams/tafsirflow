import { CARD_SIZE, PALETTES, type Palette, type ShareCard, type ShareFormat, type ShareIcon, type ShareOpts } from "./formats";
import type { FeedTexts } from "@/lib/feedWeb/texts";
import { WORDMARK_FILES, wordmarkSrc } from "@/components/wordmark-files";
import { arLen, clean, clip, fit, fontMetrics, isRtl, layoutPara, naturalLine, quoted, spacingOk, textPara, textWidth, toAr, wordOf, wordsOf, type Dir, type Para, type Piece } from "./canvasText";
import { drawBadge, drawIcon } from "./icons";
import { LAYOUT, RULE_H, frameSvg, groundSvg, ornamentRuleInner, rosetteInner } from "./svg";

// The exported share image (browser only): the web counterpart of the app's templates (ShareTemplates.tsx captured at
// 1080 px). The ground and the frame are built as SVG (svg.ts), turned into an <img> through a data URL and painted on
// a canvas; the text is then laid out and drawn with Canvas 2D (canvasText.ts) using the app's fit-to-box maths. Layout
// units are the app's points (card 360 wide), scaled to the output width. The fonts must be loaded by the page: Amiri
// (site-wide), Plus Jakarta Sans Variable (site-wide) and Fraunces Variable (the share sheet imports its CSS).

type Ctx = CanvasRenderingContext2D;

// ---------- fonts ----------
const AR = `Amiri, "Scheherazade New", "Noto Naskh Arabic", serif`;
// letters the Latin faces do not have fall back to the site's other faces (they are loaded for the text on demand)
const OTHER = `"Noto Sans Arabic Variable", "Vazirmatn Variable", "Noto Sans Bengali Variable", "Noto Sans SC Variable"`;
const SANS = `"Plus Jakarta Sans Variable", ${OTHER}, system-ui, sans-serif`;
const SERIF = `"Fraunces Variable", ${OTHER}, Georgia, serif`;
const fAr = (size: number, bold = false) => `${bold ? 700 : 400} ${size}px ${AR}`;
const fSerif = (size: number) => `400 ${size}px ${SERIF}`;
const fSerifItalic = (size: number) => `italic 400 ${size}px ${SERIF}`;
const fSerifBold = (size: number) => `600 ${size}px ${SERIF}`;
const fSans = (size: number, weight: 400 | 500 | 600) => `${weight} ${size}px ${SANS}`;

const URL_TEXT = "quranmasterclass.com/app";

/** texts of a card by use, so the right font files are loaded before anything is measured */
function cardTexts(card: ShareCard, texts: FeedTexts, opts: ShareOpts): { arabic: string[]; other: string[] } {
  const other: (string | undefined)[] = [URL_TEXT, texts.tpl.sharedBy, opts.sharer ? `@${opts.sharer.username}` : undefined];
  const arabic: (string | undefined)[] = [];
  switch (card.t) {
    case "verse": arabic.push(card.arabic); other.push(card.translation, card.reference); break;
    case "text": arabic.push(card.arabic); other.push(card.kicker, card.title, card.body, card.source); break;
    case "name": arabic.push(card.arabic); other.push(card.kicker, card.latin, card.meaning); break;
    case "quiz": arabic.push(card.arabic); other.push(card.kicker, card.question, ...card.options, card.explain, texts.tpl.answer); break;
    case "achievement": other.push(card.kicker, card.big, card.title, card.sub); break;
  }
  const keep = (l: (string | undefined)[]) => l.filter((s): s is string => !!s);
  return { arabic: keep(arabic), other: keep(other) };
}

/** waits until every face the card needs is loaded, so the first image is not drawn in a fallback font */
async function loadFonts(t: { arabic: string[]; other: string[] }): Promise<void> {
  if (!("fonts" in document)) return;
  const other = t.other.join(" ");
  const arabic = `${t.arabic.join(" ")} \uFD3F\uFD3E٠١٢٣٤٥٦٧٨٩`;
  const jobs: [string, string][] = [
    ["400 20px Amiri", arabic], ["700 20px Amiri", arabic],
    ['400 20px "Fraunces Variable"', other], ['italic 400 20px "Fraunces Variable"', other], ['600 20px "Fraunces Variable"', other],
    ['400 20px "Plus Jakarta Sans Variable"', other], ['500 20px "Plus Jakarta Sans Variable"', other], ['600 20px "Plus Jakarta Sans Variable"', other],
  ];
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(other)) for (const f of ["Noto Sans Arabic Variable", "Vazirmatn Variable"]) jobs.push([`400 20px "${f}"`, other], [`600 20px "${f}"`, other]);
  if (/[\u0980-\u09FF]/.test(other)) jobs.push(['400 20px "Noto Sans Bengali Variable"', other], ['600 20px "Noto Sans Bengali Variable"', other]);
  if (/[\u2E80-\u9FFF\uAC00-\uD7AF]/.test(other)) jobs.push(['400 20px "Noto Sans SC Variable"', other], ['600 20px "Noto Sans SC Variable"', other]);
  // a face that does not arrive in time is replaced by its fallback instead of blocking the image
  const loading = Promise.all(jobs.map(([font, text]) => document.fonts.load(font, text).catch(() => [])));
  await Promise.race([loading, new Promise((resolve) => window.setTimeout(resolve, 5000))]);
}

// ---------- images ----------
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}
const wordmarks = new Map<string, Promise<HTMLImageElement | null>>();
/** the gold (or deep) wordmark file; null when it cannot be loaded (the image is then made without it) */
function loadWordmark(variant: "inline" | "ar", tone: "gold" | "deep"): Promise<HTMLImageElement | null> {
  const src = wordmarkSrc(variant, tone);
  let p = wordmarks.get(src);
  if (!p) {
    p = loadImage(src).then((img): HTMLImageElement | null => img).catch(() => { wordmarks.delete(src); return null; });
    wordmarks.set(src, p);
  }
  return p;
}

// ---------- blocks ----------
/** one element of the centred content group */
type Block = {
  h: number;
  /** space above, to the block before */
  before?: number;
  /** SVG markup placed under the text (rules, rosettes); `cx` centre, `y` top, `uid` for gradient ids */
  svg?: (cx: number, y: number, uid: string) => string;
  draw?: (ctx: Ctx, cx: number, y: number) => void;
};
type Built = { kicker?: string; seed: string; blocks: Block[] };
type Env = { ctx: Ctx; p: Palette; format: ShareFormat; box: { w: number; h: number }; texts: FeedTexts };

/** the room in the middle of a card, between kicker and footer */
function contentBox(format: ShareFormat, sharer: boolean): { w: number; h: number } {
  const { w, h } = CARD_SIZE[format];
  const l = LAYOUT[format];
  return { w: w - l.padX * 2, h: h - l.top - l.bottom - l.kicker - l.foot - (sharer ? 18 : 0) - 16 };
}

const paraBlock = (para: Para, before = 0): Block => ({ h: para.h, before, draw: (c, cx, y) => para.draw(c, cx, y) });
/** the ornamental rule centred in a box `boxH` high */
const ruleBlock = (p: Palette, width: number, before = 0, boxH = RULE_H): Block => ({
  h: boxH, before,
  svg: (cx, y, uid) => `<g transform="translate(${cx - width / 2} ${y + (boxH - RULE_H) / 2})">${ornamentRuleInner(p, width, uid)}</g>`,
});
/** a gold rosette with content drawn in its middle */
const rosetteBlock = (p: Palette, size: number, before: number, content: (c: Ctx, cx: number, cy: number) => void): Block => ({
  h: size, before,
  svg: (cx, y) => `<g transform="translate(${cx - size / 2} ${y})">${rosetteInner(p, size)}</g>`,
  draw: (c, cx, y) => content(c, cx, y + size / 2),
});
/**
 * The app picks a font size from an estimate and cuts off what does not fit its lines; here the size shrinks in half-point
 * steps (down to `min`) until the text fits, so nothing ends in an ellipsis unless it must.
 */
function shrink(size: number, min: number, make: (s: number) => Para): Para {
  let s = size, para = make(s);
  while (para.truncated && s - 0.5 >= min) { s -= 0.5; para = make(s); }
  return para;
}
const piece = (t: string, font: string, color: string): Piece => ({ t, font, color });
const ls = (text: string, px: number) => (spacingOk(text) ? px : 0);
const dirOf = (text: string): Dir => (isRtl(text) ? "rtl" : "ltr");

// ---------- verse ----------
function buildVerse(env: Env, c: Extract<ShareCard, { t: "verse" }>): Built {
  const { ctx, p, format, box } = env;
  const n = (c.verseKey ?? c.reference.match(/\d+:(\d+)/)?.[0] ?? "").split(":")[1];
  const ar = c.arabic.replace(/[\s\u0660-\u0669\u06F0-\u06F9]+$/, "").trim();
  const tr = clean(c.translation);
  const refH = 26, ruleH = 26;
  const hAr = (box.h - refH - (tr ? ruleH : 0)) * (tr ? (arLen(ar) > tr.length * 0.8 ? 0.6 : 0.5) : 1);
  const hTr = box.h - refH - ruleH - hAr;
  const max = format === "story" ? 46 : format === "post" ? 36 : 30;
  const sAr = fit(arLen(ar) + 4, box.w, hAr, 0.5, 1.85, 13, max);
  const sTr = tr ? fit(tr.length, box.w, hTr, 0.46, 1.45, 10.5, format === "story" ? 21 : 18) : 0;

  const arPara = shrink(sAr, 13, (z) => {
    const words = wordsOf(ar, fAr(z), p.arabic);
    // the end-of-verse number in Arabic digits inside ornate brackets, smaller and in the accent colour
    if (n) words.push(wordOf([piece(`\uFD3F${toAr(n)}\uFD3E`, fAr(z * 0.78), p.accent)], true));
    return layoutPara(ctx, { words, dir: "rtl", lineH: z * 1.85, maxLines: Math.max(2, Math.floor(hAr / (z * 1.85))), maxW: box.w, base: piece("", fAr(z), p.arabic) });
  });
  const blocks: Block[] = [paraBlock(arPara)];
  if (tr) {
    blocks.push(ruleBlock(p, 72, 0, ruleH));
    blocks.push(paraBlock(shrink(sTr, 10.5, (z) => {
      const font = fSerifItalic(z);
      const q = quoted(wordsOf(tr, font, p.soft), piece("“", fSerif(z), p.accent), piece("”", fSerif(z), p.accent));
      return layoutPara(ctx, { words: q, dir: dirOf(tr), lineH: z * 1.45, maxLines: Math.max(2, Math.floor(hTr / (z * 1.45))), maxW: box.w, base: piece("", font, p.soft) });
    })));
  }
  return { kicker: c.reference, seed: c.verseKey ?? c.reference, blocks };
}

// ---------- text: hadith, tafsir, insight, dua, story ----------
// the same clip lengths as the app's post builders (feedShare.tsx), per format
const CLIP_BODY: Record<ShareFormat, number> = { story: 560, post: 360, square: 220 };
const CLIP_QUOTE: Record<ShareFormat, number> = { story: 620, post: 420, square: 260 };
const CLIP_ARABIC: Record<ShareFormat, number> = { story: 520, post: 520, square: 260 };

function buildText(env: Env, c: Extract<ShareCard, { t: "text" }>): Built {
  const { ctx, p, format, box } = env;
  const ar = c.arabic ? clip(clean(c.arabic), CLIP_ARABIC[format]) : "";
  const b = c.body ? clip(clean(c.body), (c.quote ? CLIP_QUOTE : CLIP_BODY)[format]) : "";
  const iconH = c.icon ? 46 : 0;
  const titleS = c.title ? (format === "square" ? 19 : format === "post" ? 21 : 24) : 0;
  const titleH = c.title ? titleS * 1.3 * Math.min(3, Math.ceil((c.title.length * titleS * 0.52) / box.w)) + 10 : 0;
  const srcH = c.source ? 30 : 0;
  const rest = box.h - iconH - titleH - srcH - (ar && b ? 22 : 0);
  const hAr = ar ? rest * (b ? (arLen(ar) > b.length * 0.6 ? 0.5 : 0.38) : 1) : 0;
  const hB = rest - hAr;
  const sAr = ar ? fit(arLen(ar), box.w, hAr, 0.5, 1.85, 12.5, b ? (format === "story" ? 30 : 26) : (format === "story" ? 40 : 34)) : 0;
  const sB = b ? fit(b.length, box.w, hB, c.quote ? 0.46 : 0.5, 1.5, 10.5, format === "story" ? 20 : 17.5) : 0;

  const gap = 10;
  const blocks: Block[] = [];
  const add = (blk: Block) => blocks.push({ ...blk, before: blocks.length ? (blk.before ?? 0) + gap : 0 });
  if (c.icon) add(rosetteBlock(p, 40, 0, (g, cx, cy) => drawIcon(g, c.icon as ShareIcon, cx, cy, 17, p.line)));
  if (ar) add(paraBlock(shrink(sAr, 12.5, (z) => layoutPara(ctx, { words: wordsOf(ar, fAr(z), p.arabic), dir: "rtl", lineH: z * 1.85, maxLines: Math.max(2, Math.floor(hAr / (z * 1.85))), maxW: box.w, base: piece("", fAr(z), p.arabic) }))));
  if (ar && b) add(ruleBlock(p, 64));
  if (c.title) {
    const font = fSerifBold(titleS);
    add(paraBlock(textPara(ctx, c.title, font, p.ink, { lineH: titleS * 1.28, maxLines: 3, maxW: box.w, ls: ls(c.title, -0.2) })));
  }
  if (b) {
    add(paraBlock(shrink(sB, 10.5, (z) => {
      const font = c.quote ? fSerifItalic(z) : fSans(z, 400);
      let words = wordsOf(b, font, p.soft);
      if (c.quote) words = quoted(words, piece("“", fSerif(z), p.accent), piece("”", fSerif(z), p.accent));
      return layoutPara(ctx, { words, dir: dirOf(b), lineH: z * 1.5, maxLines: Math.max(2, Math.floor(hB / (z * 1.5))), maxW: box.w, base: piece("", font, p.soft) });
    })));
  }
  if (c.source) {
    const font = fSans(11, 600);
    add(paraBlock(textPara(ctx, c.source, font, p.accent, { lineH: naturalLine(ctx, font), maxLines: 2, maxW: box.w, ls: ls(c.source, 0.6) }), 2));
  }
  return { kicker: c.kicker, seed: c.seed ?? c.kicker, blocks };
}

// ---------- names of Allah ----------
function buildName(env: Env, c: Extract<ShareCard, { t: "name" }>): Built {
  const { ctx, p, format, box } = env;
  const size = format === "story" ? 230 : format === "post" ? 186 : 150;
  const sAr = Math.min(size * 0.3, (size * 0.62 * 2.2) / Math.max(3, arLen(c.arabic)));
  const gap = format === "square" ? 8 : 14;
  const arPara = layoutPara(ctx, { words: wordsOf(c.arabic, fAr(sAr, true), p.arabic), dir: "rtl", lineH: sAr * 1.7, maxLines: 1, maxW: size, base: piece("", fAr(sAr, true), p.arabic) });
  const latinFont = fSerifBold(format === "square" ? 22 : 27);
  const meaningFont = fSerifItalic(format === "square" ? 14.5 : 17);
  return {
    kicker: c.kicker, seed: `name:${c.latin}`,
    blocks: [
      rosetteBlock(p, size, 0, (g, cx, cy) => arPara.draw(g, cx, cy - arPara.h / 2)),
      paraBlock(textPara(ctx, c.latin, latinFont, p.ink, { lineH: naturalLine(ctx, latinFont), maxLines: 1, maxW: box.w, ls: ls(c.latin, -0.3) }), gap),
      paraBlock(textPara(ctx, c.meaning, meaningFont, p.soft, { lineH: format === "square" ? 20 : 24, maxLines: format === "square" ? 2 : 4, maxW: box.w }), gap),
    ],
  };
}

// ---------- quiz with its answer ----------
/** a rounded rectangle path (also where Context2D.roundRect is missing) */
function pillPath(c: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  const k = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + k, y);
  c.arcTo(x + w, y, x + w, y + h, k);
  c.arcTo(x + w, y + h, x, y + h, k);
  c.arcTo(x, y + h, x, y, k);
  c.arcTo(x, y, x + w, y, k);
  c.closePath();
}

function buildQuiz(env: Env, c: Extract<ShareCard, { t: "quiz" }>): Built {
  const { ctx, p, format, box, texts } = env;
  const small = format === "square";
  const gap = small ? 7 : 11;
  const opt = c.options.slice(0, 4);
  const qS = (small ? 17 : format === "post" ? 19 : 22) * (c.question.length > 110 ? 0.82 : c.question.length > 70 ? 0.9 : 1);
  const oS = small ? 12.5 : 14;
  const sAr = c.arabic ? (small ? 30 : format === "post" ? 36 : 44) : 0;
  const blocks: Block[] = [];
  const add = (blk: Block) => blocks.push({ ...blk, before: blocks.length ? (blk.before ?? 0) + gap : 0 });

  if (c.arabic) add(paraBlock(layoutPara(ctx, { words: wordsOf(c.arabic, fAr(sAr), p.arabic), dir: "rtl", lineH: sAr * 1.7, maxLines: 1, maxW: box.w, base: piece("", fAr(sAr), p.arabic) })));
  add(paraBlock(textPara(ctx, c.question, fSerifBold(qS), p.ink, { lineH: qS * 1.28, maxLines: small ? 3 : 4, maxW: box.w })));

  // the options as pills over the whole width; the correct one has a gold ring, a tint and a check
  const pillGap = small ? 5 : 7, minH = small ? 30 : 38, padX = 14, inner = 7, iconS = small ? 13 : 15;
  const lh = naturalLine(ctx, fSans(oS, 400)); // a Text without lineHeight
  const pills = opt.map((o, i) => {
    const ok = i === c.answer;
    const font = fSans(oS, ok ? 600 : 400);
    const maxW = box.w - padX * 2 - (ok ? iconS + inner : 0);
    const para = textPara(ctx, o, font, ok ? p.ink : p.muted, { lineH: lh, maxLines: small ? 1 : 2, maxW });
    return { ok, para, h: Math.max(minH, para.h) };
  });
  const listH = pills.reduce((s, q) => s + q.h, 0) + pillGap * Math.max(0, pills.length - 1);
  add({
    h: listH, before: 2,
    draw: (g, cx, y0) => {
      let y = y0;
      for (const q of pills) {
        const x = cx - box.w / 2;
        const bw = q.ok ? 1.2 : 0.8;
        pillPath(g, x, y, box.w, q.h, 999);
        g.fillStyle = q.ok ? (p.dark ? "rgba(214,180,108,0.2)" : "rgba(160,123,54,0.14)") : "rgba(0,0,0,0)";
        g.fill();
        pillPath(g, x + bw / 2, y + bw / 2, box.w - bw, q.h - bw, 999);
        g.strokeStyle = q.ok ? p.line : p.dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)";
        g.lineWidth = bw;
        g.stroke();
        // the row [check][text], centred in the pill
        const row = (q.ok ? iconS + inner : 0) + q.para.w;
        let rx = cx - row / 2;
        if (q.ok) { drawIcon(g, "check", rx + iconS / 2, y + q.h / 2, iconS, p.line); rx += iconS + inner; }
        q.para.draw(g, rx + q.para.w / 2, y + (q.h - q.para.h) / 2);
        y += q.h + pillGap;
      }
    },
  });

  if (c.explain) {
    const eS = small ? 11.5 : 13;
    const font = fSerifItalic(eS);
    const ex = wordsOf(clean(c.explain), font, p.soft);
    if (ex.length) ex[0].space = true;
    const prefix = `${texts.tpl.answer}:`;
    const words = [wordOf([piece(prefix, fSans(eS, 600), p.accent)], false), ...ex];
    add(paraBlock(layoutPara(ctx, { words, dir: dirOf(`${prefix} ${c.explain}`), lineH: small ? 16 : 19, maxLines: small ? 2 : format === "post" ? 3 : 5, maxW: box.w, base: piece("", font, p.soft) }), 2));
  }
  return { kicker: c.kicker, seed: `quiz:${c.question}`, blocks };
}

// ---------- achievement ----------
function buildAchievement(env: Env, c: Extract<ShareCard, { t: "achievement" }>): Built {
  const { ctx, p, format, box } = env;
  const size = format === "story" ? 220 : format === "post" ? 172 : 136;
  const bigS = c.big ? Math.min(size * 0.3, (size * 0.6) / Math.max(1, c.big.length * 0.55)) : 0;
  const gap = format === "square" ? 8 : 14;
  const bigFont = fSerifBold(bigS);
  const bigPara = c.big ? textPara(ctx, c.big, bigFont, p.ink, { lineH: naturalLine(ctx, bigFont), maxLines: 1, maxW: size, ls: ls(c.big, -0.5) }) : null;
  const blocks: Block[] = [
    rosetteBlock(p, size, 0, (g, cx, cy) => {
      if (bigPara) bigPara.draw(g, cx, cy - bigPara.h / 2);
      else drawIcon(g, c.icon ?? "trophy", cx, cy, size * 0.28, p.line);
    }),
  ];
  if (c.title) blocks.push(paraBlock(textPara(ctx, c.title, fSerifBold(format === "square" ? 19 : 24), p.ink, { lineH: format === "square" ? 25 : 31, maxLines: 3, maxW: box.w, ls: ls(c.title, -0.2) }), gap));
  if (c.sub) blocks.push(paraBlock(textPara(ctx, c.sub, fSerifItalic(format === "square" ? 13.5 : 15.5), p.soft, { lineH: format === "square" ? 19 : 22, maxLines: format === "square" ? 2 : 4, maxW: box.w }), gap));
  return { kicker: c.kicker, seed: c.seed ?? `ach:${c.kicker}`, blocks };
}

function buildCard(env: Env, card: ShareCard): Built {
  switch (card.t) {
    case "verse": return buildVerse(env, card);
    case "text": return buildText(env, card);
    case "name": return buildName(env, card);
    case "quiz": return buildQuiz(env, card);
    case "achievement": return buildAchievement(env, card);
  }
}

// ---------- the canvas ----------
async function drawCard(card: ShareCard, format: ShareFormat, opts: ShareOpts, texts: FeedTexts, outWidth: number): Promise<HTMLCanvasElement> {
  const { w: W, h: H } = CARD_SIZE[format];
  const l = LAYOUT[format];
  const p = PALETTES[opts.palette];
  const arabicBrand = document.documentElement.lang.toLowerCase().startsWith("ar");
  const variant = arabicBrand ? "ar" : "inline";
  const [wordmark] = await Promise.all([loadWordmark(variant, p.wordmark), loadFonts(cardTexts(card, texts, opts))]);

  const pxW = Math.round(outWidth), pxH = Math.round((outWidth * H) / W);
  const canvas = document.createElement("canvas");
  canvas.width = pxW;
  canvas.height = pxH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.scale(pxW / W, pxH / H);
  ctx.imageSmoothingQuality = "high";

  const env: Env = { ctx, p, format, box: contentBox(format, !!opts.sharer), texts };
  const built = buildCard(env, card);
  const cx = W / 2;
  const decor: string[] = [];
  let uids = 0;
  const uid = () => `qr${uids++}`;

  // header: the kicker and the ornamental rule below it
  const kFont = fSans(format === "story" ? 12 : 11, 600);
  const kicker = built.kicker ? textPara(ctx, built.kicker, kFont, p.accent, { lineH: naturalLine(ctx, kFont), maxLines: 1, maxW: W - l.padX * 2, ls: ls(built.kicker, 1.8) }) : null;
  const ruleW = format === "story" ? 132 : 112;
  decor.push(`<g transform="translate(${cx - ruleW / 2} ${l.top + (kicker ? kicker.h + 6 : 0)})">${ornamentRuleInner(p, ruleW, uid())}</g>`);

  // footer, stacked from the bottom: the app link, the wordmark, "shared by"
  const urlFont = fSans(9.5, 500);
  const url = textPara(ctx, URL_TEXT, urlFont, p.muted, { lineH: naturalLine(ctx, urlFont), maxLines: 1, maxW: W - l.padX * 2, dir: "ltr", ls: 1.3 });
  const file = WORDMARK_FILES[variant];
  const wmH = arabicBrand ? Math.round((format === "story" ? 25 : 21) * 1.3) : format === "story" ? 25 : 21; // the calligraphy needs a little more height
  const wmW = (wmH * file.w) / file.h;
  const sharer = opts.sharer;
  const nameFont = fSans(11, 600), byFont = fSans(10.5, 400);
  const badgeS = 12;
  const rowH = sharer ? Math.max(naturalLine(ctx, nameFont), sharer.badge ? badgeS : 0) : 0;
  const footH = Math.max(l.foot, url.h + 5 + wmH + (sharer ? rowH + 7 : 0));
  const footTop = H - l.bottom - footH;
  const urlTop = H - l.bottom - url.h;
  const wmTop = urlTop - 5 - wmH;
  const rowTop = wmTop - 7 - rowH;

  // content: centred between the kicker block and the footer; a group that is taller than the room (a quiz with Arabic on
  // the square format) is scaled down about its centre instead of running into the kicker and the footer
  const areaTop = l.top + l.kicker + 8;
  const areaBottom = footTop - 10 - 8;
  const mid = (areaTop + areaBottom) / 2;
  const total = built.blocks.reduce((s, b, i) => s + b.h + (i ? b.before ?? 0 : 0), 0);
  const squeeze = total > areaBottom - areaTop ? Math.max(0.6, (areaBottom - areaTop) / total) : 1;
  let y = mid - total / 2;
  const placed = built.blocks.map((b, i) => { if (i) y += b.before ?? 0; const top = y; y += b.h; return { b, top }; });
  const scaleAbout = `translate(${cx} ${mid}) scale(${squeeze}) translate(${-cx} ${-mid})`;
  const content = placed.filter(({ b }) => b.svg).map(({ b, top }) => (b.svg as NonNullable<Block["svg"]>)(cx, top, uid())).join("");
  decor.push(`<g transform="${scaleAbout}">${content}</g>`);

  // the ground, frame and decorations as one SVG image
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="0 0 ${W} ${H}">`
    + `${groundSvg(p, W, H, built.seed, "qsg")}${frameSvg(p, W, H, l, "qsf")}${decor.join("")}</svg>`;
  const art = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  ctx.drawImage(art, 0, 0, W, H);

  // text on top
  kicker?.draw(ctx, cx, l.top);
  ctx.save();
  ctx.translate(cx, mid);
  ctx.scale(squeeze, squeeze);
  ctx.translate(-cx, -mid);
  for (const { b, top } of placed) b.draw?.(ctx, cx, top);
  ctx.restore();
  url.draw(ctx, cx, urlTop);
  if (wordmark) ctx.drawImage(wordmark, cx - wmW / 2, wmTop, wmW, wmH);
  if (sharer) {
    const by = texts.tpl.sharedBy, name = `@${sharer.username}`;
    const w1 = textWidth(ctx, byFont, by), w2 = textWidth(ctx, nameFont, name);
    const total2 = w1 + 5 + w2 + (sharer.badge ? 5 + badgeS : 0);
    let x = cx - total2 / 2;
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.textBaseline = "alphabetic";
    for (const [font, color, text, width] of [[byFont, p.muted, by, w1], [nameFont, p.ink, name, w2]] as const) {
      const m = fontMetrics(ctx, font);
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.fillText(text, x, rowTop + (rowH - (m.asc + m.desc)) / 2 + m.asc);
      x += width + 5;
    }
    if (sharer.badge) drawBadge(ctx, sharer.badge, x + badgeS / 2, rowTop + rowH / 2, badgeS);
  }
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("png"))), "image/png"));
}

/**
 * Draws a share card as a PNG. `outWidth` is the width in pixels (default and final export: the format's 1080 px; the share
 * sheet's preview uses {@link PREVIEW_WIDTH}); the layout is the same at every size.
 */
export async function renderShareImage(card: ShareCard, format: ShareFormat, opts: ShareOpts, texts: FeedTexts, outWidth: number = CARD_SIZE[format].px[0]): Promise<Blob> {
  return toBlob(await drawCard(card, format, opts, texts, outWidth));
}

/** the width of the preview image in the share sheet */
export const PREVIEW_WIDTH = 540;
/** the preview of a share card: the same image at half the size, quick to draw */
export const previewShareImage = (card: ShareCard, format: ShareFormat, opts: ShareOpts, texts: FeedTexts): Promise<Blob> => renderShareImage(card, format, opts, texts, PREVIEW_WIDTH);
