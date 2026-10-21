import { ImageResponse } from "next/og";
import { WORDMARK, WORDMARK_FOIL } from "@/components/wordmark-paths";

export const alt = "Quran Masterclass – Learn the Quran";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// the gold wordmark (public/brand/wordmark-gold.svg) as a data URI, so the card needs no font for the brand
function wordmarkUri() {
  const { box, parts } = WORDMARK.inline;
  const [x, y, w, h] = box;
  const stops = WORDMARK_FOIL.light.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}"><defs><linearGradient id="f" gradientUnits="userSpaceOnUse" x1="0" y1="${y}" x2="0" y2="${y + h}">${stops}</linearGradient></defs><g fill="url(#f)">${parts.map((p) => `<path transform="translate(${p.x} ${p.y})" d="${p.d}"/>`).join("")}</g></svg>`;
  return { src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, ratio: w / h };
}

export default function OgImage() {
  const mark = wordmarkUri();
  const markH = 64;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#074a38", color: "white" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mark.src} width={Math.round(markH * mark.ratio)} height={markH} alt="Quran Masterclass" />
        <div style={{ display: "flex", flexDirection: "column", fontSize: 84, lineHeight: 1.05, letterSpacing: -2 }}>
          <span>Learn the Quran.</span>
          <span style={{ color: "#e9cf99" }}>Listen. Understand. Memorize.</span>
        </div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,.7)" }}>13 languages · Free · quranmasterclass.com</div>
      </div>
    ),
    size,
  );
}
