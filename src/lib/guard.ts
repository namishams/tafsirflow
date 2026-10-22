// Traffic guard in front of the whole site (owner 23.10.2026), called from src/middleware.ts on the Node.js runtime.
//
//   /api/*   scraper user agents and an empty one are refused (429); per address, and per /24 or /64 block of addresses
//            (so a rented data-centre range counts together), a ceiling per minute and per hour; BLOCK_CIDRS blocks ranges
//            at once without a deploy. The apps (header x-qmc-app), our own server, payment and store webhooks pass.
//   pages    a ceiling of page views per address (prefetches and client-side navigation are not counted), 429 above it.
//
// Welcome crawlers are never shut out: a visitor whose user agent names Googlebot, Bingbot, GPTBot, OAI-SearchBot,
// ClaudeBot, PerplexityBot … is only checked when it goes over a ceiling, and passes if the operator's published
// addresses (or reverse DNS) confirm it (src/lib/crawlers.ts). A forged crawler name from anywhere else is an ordinary
// visitor. Crawlers that publish no addresses (ClaudeBot) pass by name, with a high ceiling of their own.
// GUARD_OFF=1 (server environment) switches all of it off at once.
import { BlockList, isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { claimedCrawler, isPrivateIp, isScraperUA, subnetOf } from "./botguard";
import { verifyCrawler } from "./crawlers";
import { rateLimited } from "./http";

const MIN = 60_000, HOUR = 60 * MIN;
// per address; the apps get three times as much (mobile networks put many people behind one address)
// (GUARD_API_PER_MIN and GUARD_PAGES_PER_MIN in the server environment change the per-minute ceilings without a deploy)
const num = (name: string, fallback: number) => Number(process.env[name]) || fallback;
const API = () => ({ min: num("GUARD_API_PER_MIN", 900), hour: 15_000, subnetMin: 5_000 });
const PAGES = () => ({ min: num("GUARD_PAGES_PER_MIN", 180), hour: 3_000, subnetMin: 1_500, rsc: 600 });
const CLAIMED_CRAWLER_MIN = 1_500;
// calls that come from other servers (payment and store notifications, app-link files) or are not for people at all
const API_EXEMPT = /^\/api\/(support\/webhook|iap\/|aasa$|assetlinks$)/;

let blockSrc = "", blockList: BlockList | null = null;
function blocked(ip: string): boolean {
  const src = process.env.BLOCK_CIDRS ?? "";
  if (!src) return false;
  if (src !== blockSrc) {
    blockSrc = src;
    blockList = new BlockList();
    for (const c of src.split(",").map((x) => x.trim()).filter(Boolean)) {
      const [net, bits] = c.split("/");
      const fam = isIP(net);
      if (fam) blockList.addSubnet(net, bits ? Number(bits) : fam === 4 ? 32 : 128, fam === 4 ? "ipv4" : "ipv6");
    }
  }
  const plainIp = ip.replace(/^::ffff:/i, "");
  const fam = isIP(plainIp);
  return !!fam && !!blockList?.check(plainIp, fam === 4 ? "ipv4" : "ipv6");
}

const deny = (kind: "api" | "page", why: string) =>
  kind === "api"
    ? NextResponse.json({ error: why === "rate" ? "rate" : "blocked" }, { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" } })
    : new NextResponse("Too many requests. Please slow down and try again in a minute.", { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" } });

/** true when the visitor is a welcome crawler that may pass although it went over a ceiling */
async function crawlerMayPass(ua: string, ip: string): Promise<boolean> {
  const kind = claimedCrawler(ua);
  if (!kind) return false;
  const v = await verifyCrawler(kind, ip);
  if (v === "fake") return false;
  if (v === "verified") return true;
  return !rateLimited(`g:claimed:${ip}`, CLAIMED_CRAWLER_MIN, MIN); // named but not verifiable: a high ceiling
}

/** the address the reverse proxy saw; null for calls straight to the app server (monitoring, scripts on the machine) */
function visitor(req: NextRequest): string | null {
  if (process.env.GUARD_OFF === "1") return null;
  const ip = req.headers.get("x-real-ip")?.trim();
  return ip && !isPrivateIp(ip) ? ip : null;
}

export async function guardApi(req: NextRequest): Promise<NextResponse | null> {
  const ip = visitor(req);
  if (!ip || API_EXEMPT.test(req.nextUrl.pathname)) return null;
  const ua = req.headers.get("user-agent") ?? "";
  const app = !!req.headers.get("x-qmc-app");
  if (blocked(ip)) return deny("api", "blocked");
  const crawler = claimedCrawler(ua);
  if (!app && !crawler && isScraperUA(ua)) return deny("api", "blocked");
  const k = app ? 3 : 1, lim = API();
  const over = rateLimited(`g:a:m:${ip}`, lim.min * k, MIN) || rateLimited(`g:a:h:${ip}`, lim.hour * k, HOUR) || rateLimited(`g:a:s:${subnetOf(ip)}`, lim.subnetMin * k, MIN);
  if (over) return (await crawlerMayPass(ua, ip)) ? null : deny("api", "rate");
  return null;
}

export async function guardPage(req: NextRequest): Promise<NextResponse | null> {
  if (req.method !== "GET" && req.method !== "HEAD") return null;
  const ip = visitor(req);
  if (!ip) return null;
  const h = req.headers;
  // Next.js prefetches links in view and loads pages in the background while a visitor clicks around: not page views
  if (h.get("next-router-prefetch") === "1" || /prefetch/i.test(h.get("sec-purpose") ?? "") || h.get("purpose") === "prefetch") return null;
  const ua = h.get("user-agent") ?? "";
  if (blocked(ip)) return deny("page", "blocked");
  const rsc = h.get("rsc") === "1" || req.nextUrl.searchParams.has("_rsc"), lim = PAGES();
  const over = rsc
    ? rateLimited(`g:r:m:${ip}`, lim.rsc, MIN)
    : rateLimited(`g:p:m:${ip}`, lim.min, MIN) || rateLimited(`g:p:h:${ip}`, lim.hour, HOUR) || rateLimited(`g:p:s:${subnetOf(ip)}`, lim.subnetMin, MIN);
  if (over) return (await crawlerMayPass(ua, ip)) ? null : deny("page", "rate");
  return null;
}
