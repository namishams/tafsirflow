import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { PUBLIC_SITE, SITE, isPublicHost } from "@/lib/site";

export const dynamic = "force-dynamic"; // decided per request: open on the domain, closed on the bare IP

export default async function robots(): Promise<MetadataRoute.Robots> {
  const publicHost = isPublicHost((await headers()).get("host"));
  // the bare server IP and test hosts stay out of search results (the domain has the same pages)
  if (!publicHost && process.env.ALLOW_INDEXING !== "1") return { rules: { userAgent: "*", disallow: "/" } };
  const base = publicHost ? PUBLIC_SITE : SITE;
  // AI search and answer engines are welcome explicitly (the site wants to be found and cited); a named group replaces
  // the "*" group for that crawler, so the private paths are repeated
  const disallow = ["/api/", "/*/admin", "/*/account"];
  const ai = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Claude-User", "Claude-SearchBot", "Google-Extended", "Applebot-Extended", "CCBot"];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow }, ...ai.map((userAgent) => ({ userAgent, allow: "/", disallow }))],
    sitemap: `${base}/sitemap.xml`,
  };
}
