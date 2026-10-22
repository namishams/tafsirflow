// StickerArt (pure data) to one SVG document. Gradient ids are local to a sticker, so they are prefixed with the
// sticker id here (several stickers share one screen). Used by the server for the store catalogue; the app has the
// same renderer in mobile/src/web/stickerArt/render.ts (mirror).
import type { StickerArt } from "./kit";

export function artSvg(st: StickerArt): string {
  const p = st.id.replace(/[^a-z0-9]/gi, "_");
  const defs = st.gradients.map((g) => {
    const stops = g.stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ""}/>`).join("");
    return g.radial
      ? `<radialGradient id="${p}_${g.id}" cx="${g.cx}" cy="${g.cy}" r="${g.r}"${g.fx ? ` fx="${g.fx}" fy="${g.fy}"` : ""}>${stops}</radialGradient>`
      : `<linearGradient id="${p}_${g.id}" x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}">${stops}</linearGradient>`;
  }).join("");
  const body = st.layers.map((l) => {
    const fill = l.gradient ? `url(#${p}_${l.gradient})` : l.fill ?? "none";
    const stroke = l.stroke || l.strokeGradient ? ` stroke="${l.strokeGradient ? `url(#${p}_${l.strokeGradient})` : l.stroke}" stroke-width="${l.sw ?? 1}" stroke-linejoin="round" stroke-linecap="round"` : "";
    return `<path d="${l.d}" fill="${fill}"${stroke}${l.op != null ? ` opacity="${l.op}"` : ""}${l.evenodd ? ` fill-rule="evenodd"` : ""}/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${st.viewBox}"><defs>${defs}</defs>${body}</svg>`;
}
