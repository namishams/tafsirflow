import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { guardApi, guardPage } from "./lib/guard";

const intl = createMiddleware(routing);

// Every request that is not a file (the matcher skips /_next, /audio and anything with a dot, so robots.txt, sitemaps and
// llms.txt are always readable) first passes the traffic guard (src/lib/guard.ts); pages then go on to the language
// handling, /api/* is only guarded. Runs on the Node.js runtime: the guard checks crawler claims with reverse DNS.
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/api" || pathname.startsWith("/api/")) return (await guardApi(req)) ?? NextResponse.next();
  return (await guardPage(req)) ?? intl(req);
}

export const config = { runtime: "nodejs", matcher: ["/((?!_next|audio|.*\\..*).*)"] };
