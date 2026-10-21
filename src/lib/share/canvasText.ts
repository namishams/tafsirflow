// Text layout for the canvas renderer (browser only). The app lets React Native lay text out (numberOfLines, nested
// styled Text); on the canvas we do it ourselves: split text into words (CJK per character), measure with measureText,
// break lines greedily, cut off with an ellipsis after `maxLines`, and draw each line as one or a few styled runs
// (so Arabic keeps its shaping and bidi order). Also the app's font-fitting maths (fit, arLen).

export type Dir = "ltr" | "rtl";
/** a piece of text in one font and colour */
export type Piece = { t: string; font: string; color: string };
/** a word: its pieces are glued together (a quote mark belongs to its word); `space` = whitespace before it; `w` = measured width */
export type Word = { pieces: Piece[]; space: boolean; w: number };
type Line = { words: Word[]; w: number };

// ---------- the app's helpers ----------
/** a font size that lets `len` characters fill the box (width × height), within min…max */
export function fit(len: number, boxW: number, boxH: number, charW: number, lineH: number, min: number, max: number): number {
  if (len <= 0 || boxH <= 0) return max;
  const s = Math.sqrt((boxW * boxH) / (len * charW * lineH));
  return Math.max(min, Math.min(max, Math.floor(s * 2) / 2));
}
/** visible Arabic letters (marks have no width of their own) */
export const arLen = (s: string): number => s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\s]/g, "").length + (s.match(/\s/g)?.length ?? 0) * 0.6;
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export const toAr = (n: number | string): string => String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
export const clean = (s: string): string => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
/** cut at a word boundary after `n` characters and add " …" */
export const clip = (s: string, n: number): string => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(" ", n) > 0 ? s.lastIndexOf(" ", n) : n)} …`);

// ---------- scripts ----------
const LETTER = /\p{L}/u;
const RTL_CHAR = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
/** the base direction of a paragraph: that of its first letter */
export function isRtl(text: string): boolean {
  for (const ch of text) if (LETTER.test(ch)) return RTL_CHAR.test(ch);
  return false;
}
/** scripts whose letters join or stack: no letter spacing */
export const spacingOk = (text: string): boolean => !/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF\u0900-\u0DFF\u3000-\u9FFF\uAC00-\uD7AF]/.test(text);

const CJK = /[\u2E80-\u9FFF\uA000-\uA4CF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/;
const CLOSING = /[\u3001\u3002\uFF0C\uFF0E\uFF01\uFF1F\uFF1A\uFF1B\uFF09\u300D\u300F\u3011]/;
/** words of a text: split at whitespace; every CJK character is a word of its own (closing punctuation sticks to the character before) */
function tokenize(text: string): { text: string; space: boolean }[] {
  const out: { text: string; space: boolean }[] = [];
  let space = false;
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) { space = true; continue; }
    let buf = "";
    const flush = () => { if (buf) { out.push({ text: buf, space }); space = false; buf = ""; } };
    for (const ch of part) {
      if (!CJK.test(ch)) { buf += ch; continue; }
      if (CLOSING.test(ch) && !buf && !space && out.length) { out[out.length - 1].text += ch; continue; }
      flush();
      out.push({ text: ch, space });
      space = false;
    }
    flush();
  }
  return out;
}

export const wordOf = (pieces: Piece[], space: boolean): Word => ({ pieces, space, w: 0 });
/** the words of a text in one font and colour */
export const wordsOf = (text: string, font: string, color: string): Word[] => tokenize(text).map((tk) => wordOf([{ t: tk.text, font, color }], tk.space));
/** a quotation: the opening mark glued to the first word, the closing mark to the last (own fonts and colours) */
export function quoted(words: Word[], open: Piece, close: Piece): Word[] {
  if (!words.length) return words;
  const out = words.map((w) => ({ ...w, pieces: [...w.pieces] }));
  out[0].pieces.unshift(open);
  out[out.length - 1].pieces.push(close);
  return out;
}

// ---------- measuring ----------
type SpacingCtx = CanvasRenderingContext2D & { letterSpacing?: string };
/** letter spacing in px where the browser supports it (Chrome, Firefox, newer Safari); otherwise ignored */
export function setSpacing(ctx: CanvasRenderingContext2D, px: number): void {
  if ("letterSpacing" in ctx) (ctx as SpacingCtx).letterSpacing = `${px}px`;
}
const widthOf = (ctx: CanvasRenderingContext2D, font: string, text: string): number => { ctx.font = font; return ctx.measureText(text).width; };

const metricCache = new Map<string, { asc: number; desc: number }>();
/** ascent and descent of a font (the text line box before the line height is applied) */
export function fontMetrics(ctx: CanvasRenderingContext2D, font: string): { asc: number; desc: number } {
  const hit = metricCache.get(font);
  if (hit) return hit;
  ctx.font = font;
  const m = ctx.measureText("Hg");
  const size = Number(font.match(/([\d.]+)px/)?.[1] ?? 16);
  const v = { asc: m.fontBoundingBoxAscent ?? size * 0.85, desc: m.fontBoundingBoxDescent ?? size * 0.25 };
  metricCache.set(font, v);
  return v;
}
/** the natural line height of a font (what a Text without lineHeight gets) */
export function naturalLine(ctx: CanvasRenderingContext2D, font: string): number {
  const m = fontMetrics(ctx, font);
  return m.asc + m.desc;
}

// ---------- paragraphs ----------
export type ParaSpec = {
  words: Word[];
  dir: Dir;
  lineH: number;
  maxLines: number;
  maxW: number;
  /** font and colour of the spaces and of the ellipsis; its metrics place the baseline */
  base: Piece;
  /** letter spacing in px */
  ls?: number;
};
export type Para = { h: number; /** width of the widest line */ w: number; lines: number; /** the text needed more than `maxLines` lines and ends in an ellipsis */ truncated: boolean; draw: (ctx: CanvasRenderingContext2D, cx: number, top: number) => void };

function measureWord(ctx: CanvasRenderingContext2D, w: Word): number {
  w.w = w.pieces.reduce((sum, p) => sum + widthOf(ctx, p.font, p.t), 0);
  return w.w;
}

/** a word that is wider than the line is cut into pieces that fit (left-to-right scripts only) */
function splitLong(ctx: CanvasRenderingContext2D, wd: Word, maxW: number, dir: Dir): Word[] {
  if (dir === "rtl" || wd.w <= maxW || wd.pieces.length !== 1) return [wd];
  const pc = wd.pieces[0];
  const out: Word[] = [];
  let cur = "";
  const push = (t: string) => { const nw = wordOf([{ ...pc, t }], out.length === 0 ? wd.space : false); measureWord(ctx, nw); out.push(nw); };
  for (const ch of Array.from(pc.t)) {
    if (cur && widthOf(ctx, pc.font, cur + ch) > maxW) { push(cur); cur = ch; } else cur += ch;
  }
  if (cur) push(cur);
  return out;
}

function breakLines(ctx: CanvasRenderingContext2D, words: Word[], maxW: number, spaceW: number, dir: Dir): Line[] {
  const lines: Line[] = [];
  let cur: Line = { words: [], w: 0 };
  for (const raw of words) {
    for (const wd of splitLong(ctx, raw, maxW, dir)) {
      const add = cur.words.length ? (wd.space ? spaceW : 0) + wd.w : wd.w;
      if (cur.words.length && cur.w + add > maxW + 0.01) { lines.push(cur); cur = { words: [], w: 0 }; }
      cur.w += cur.words.length ? (wd.space ? spaceW : 0) + wd.w : wd.w;
      cur.words.push(wd);
    }
  }
  if (cur.words.length) lines.push(cur);
  return lines;
}

/** keep `max` lines; the last one loses words until "…" fits behind it */
function clamp(ctx: CanvasRenderingContext2D, lines: Line[], max: number, maxW: number, spaceW: number, base: Piece): Line[] {
  if (lines.length <= max) return lines;
  const out = lines.slice(0, max);
  const last = { words: [...out[max - 1].words], w: out[max - 1].w };
  const ell = wordOf([{ t: "…", font: base.font, color: base.color }], false);
  measureWord(ctx, ell);
  while (last.words.length > 1 && last.w + ell.w > maxW) {
    const gone = last.words.pop();
    if (gone) last.w -= (gone.space ? spaceW : 0) + gone.w;
  }
  last.words.push(ell);
  last.w += ell.w;
  out[max - 1] = last;
  return out;
}

type Run = Piece & { w: number };
/** the styled runs of a line: neighbouring pieces of one style are drawn as one string (shaping, kerning, bidi) */
function runsOf(ctx: CanvasRenderingContext2D, line: Line): Run[] {
  const runs: Run[] = [];
  line.words.forEach((wd, i) => {
    wd.pieces.forEach((pc, j) => {
      if (i > 0 && j === 0 && wd.space && runs.length) runs[runs.length - 1].t += " ";
      const last = runs[runs.length - 1];
      if (last && last.font === pc.font && last.color === pc.color) last.t += pc.t;
      else runs.push({ ...pc, w: 0 });
    });
  });
  for (const r of runs) r.w = widthOf(ctx, r.font, r.t);
  return runs;
}

/** a line centred on cx, its baseline at `baseline` */
function drawLine(ctx: CanvasRenderingContext2D, line: Line, cx: number, baseline: number, dir: Dir): void {
  const runs = runsOf(ctx, line);
  ctx.textBaseline = "alphabetic";
  ctx.direction = dir;
  if (runs.length === 1) {
    ctx.font = runs[0].font;
    ctx.fillStyle = runs[0].color;
    ctx.textAlign = "center";
    ctx.fillText(runs[0].t.trim(), cx, baseline);
    return;
  }
  const total = runs.reduce((s, r) => s + r.w, 0);
  let x = dir === "ltr" ? cx - total / 2 : cx + total / 2;
  ctx.textAlign = dir === "ltr" ? "left" : "right";
  for (const r of runs) {
    ctx.font = r.font;
    ctx.fillStyle = r.color;
    ctx.fillText(r.t, x, baseline);
    x += dir === "ltr" ? r.w : -r.w;
  }
}

/** measure and break a paragraph; `draw` paints it centred on cx with its top at `top` (line box model: half-leading above and below) */
export function layoutPara(ctx: CanvasRenderingContext2D, spec: ParaSpec): Para {
  const { dir, lineH, base, ls = 0 } = spec;
  setSpacing(ctx, ls);
  ctx.direction = dir;
  const words = spec.words.map((w) => ({ ...w }));
  for (const w of words) measureWord(ctx, w);
  const spaceW = widthOf(ctx, base.font, " ");
  const all = breakLines(ctx, words, spec.maxW, spaceW, dir);
  const lines = clamp(ctx, all, spec.maxLines, spec.maxW, spaceW, base);
  setSpacing(ctx, 0);
  return {
    h: lines.length * lineH,
    w: lines.reduce((m, ln) => Math.max(m, ln.w), 0),
    lines: lines.length,
    truncated: all.length > spec.maxLines,
    draw(c, cx, top) {
      const m = fontMetrics(c, base.font);
      const off = (lineH - (m.asc + m.desc)) / 2 + m.asc;
      setSpacing(c, ls);
      lines.forEach((ln, i) => drawLine(c, ln, cx, top + i * lineH + off, dir));
      setSpacing(c, 0);
    },
  };
}

/** a single-style paragraph from plain text */
export function textPara(ctx: CanvasRenderingContext2D, text: string, font: string, color: string, o: { lineH: number; maxLines: number; maxW: number; dir?: Dir; ls?: number }): Para {
  return layoutPara(ctx, { words: wordsOf(text, font, color), dir: o.dir ?? (isRtl(text) ? "rtl" : "ltr"), lineH: o.lineH, maxLines: o.maxLines, maxW: o.maxW, base: { t: "", font, color }, ls: o.ls });
}

/** the width of a string in a font (for rows built by hand) */
export function textWidth(ctx: CanvasRenderingContext2D, font: string, text: string): number {
  return widthOf(ctx, font, text);
}
