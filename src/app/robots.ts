import type { MetadataRoute } from "next";
import { INDEXABLE, abs } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } }; // staging / IP address: keep out of search results
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/*/admin", "/*/account"] }],
    sitemap: abs("/sitemap.xml"),
    host: abs(""),
  };
}
