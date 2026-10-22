import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WORDMARK_FILES } from "@/components/wordmark-files";
import { routing } from "@/i18n/routing";

// the share picture of every page, at /<locale>/opengraph-image (src/lib/site.ts pageMeta names it). It lived in src/app
// before: there the locale middleware redirected /opengraph-image to /<locale>/opengraph-image, a 404, and the root
// not-found page warned about the missing metadataBase
export const alt = "Quran Masterclass – Learn the Quran";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// the gold wordmark file (public/brand/wordmark-gold.svg, outlined) as a data URI, so the card needs no font for the brand
function wordmarkUri() {
  const svg = readFileSync(join(process.cwd(), "public/brand/wordmark-gold.svg"));
  const { w, h } = WORDMARK_FILES.inline;
  return { src: `data:image/svg+xml;base64,${svg.toString("base64")}`, ratio: w / h };
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
        <div style={{ fontSize: 28, color: "rgba(255,255,255,.7)" }}>{`${routing.locales.length} languages · Free · quranmasterclass.com`}</div>
      </div>
    ),
    size,
  );
}
