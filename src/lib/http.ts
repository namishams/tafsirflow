import { NextRequest, NextResponse } from "next/server";

export const json = (data: unknown, status = 200, headers?: Record<string, string>) => NextResponse.json(data, { status, headers });

// nginx sets X-Real-IP to $remote_addr, which a client cannot forge; the first X-Forwarded-For entry is whatever the
// client sent, so it is only the fallback (local development without the proxy)
export function clientIp(req: NextRequest) {
  return req.headers.get("x-real-ip")?.trim() || req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
}

export const isHttps = (req: NextRequest) => (req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "")) === "https";

// CSRF: state-changing requests must come from our own origin
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl) don't send it; cookies can't be abused cross-site without it
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

const hits = new Map<string, { n: number; reset: number }>();
let pruned = 0;
export function rateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  // expired windows are dropped once a minute (or when the map grows large), so the map cannot grow without end
  if (now - pruned > 60_000 || hits.size > 50_000) {
    pruned = now;
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  h.n += 1;
  return h.n > max;
}

// Tiny HTML sanitizer for admin-written tafsir (admin only, but never render raw scripts)
export function sanitizeHtml(html: string) {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}
