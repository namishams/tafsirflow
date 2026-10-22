"use client";
import { useEffect, useState } from "react";

// QR code of a link, drawn in the browser (nothing is sent anywhere); emerald on light, as the rest of the site.
export function AppQr({ url, size = 120, alt }: { url: string; size?: number; alt: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let live = true;
    import("qrcode").then((m) => m.default.toDataURL(url, { margin: 1, width: size * 2, color: { dark: "#08261d", light: "#fbf7ea" }, errorCorrectionLevel: "M" }))
      .then((d) => { if (live) setSrc(d); }).catch(() => {});
    return () => { live = false; };
  }, [url, size]);
  if (!src) return <div style={{ width: size, height: size }} className="rounded-lg bg-white/10" aria-hidden />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} width={size} height={size} alt={alt} className="rounded-lg border border-[rgb(var(--gold))]/40" />;
}
