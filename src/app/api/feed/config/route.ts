import { NextRequest } from "next/server";
import { cached, feedConfig, limit, parseParams } from "@/lib/feed";

export const dynamic = "force-dynamic";

// GET /api/feed/config?locale=de|en&tradition=all|sunni|shia → FeedConfig
export function GET(req: NextRequest) {
  return limit(req, "config") ?? cached(req, feedConfig(parseParams(req)), 300);
}
