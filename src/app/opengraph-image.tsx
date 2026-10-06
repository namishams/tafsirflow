import { ImageResponse } from "next/og";

export const alt = "Quran Masterclass – Learn the Quran";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#074a38", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 600 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "#066c4e", border: "2px solid rgba(255,255,255,.35)" }} />
          Quran Masterclass
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 84, lineHeight: 1.05, letterSpacing: -2 }}>
          <span>Learn the Quran.</span>
          <span style={{ color: "#e9cf99" }}>Listen. Understand. Memorize.</span>
        </div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,.7)" }}>Deutsch · English · العربية · Français · Español · 中文 · Bahasa · فارسی</div>
      </div>
    ),
    size,
  );
}
