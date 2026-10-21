import { NextRequest } from "next/server";
import { clientIp, json, rateLimited } from "@/lib/http";
import { lookupCertificate } from "../../lookup";

export const dynamic = "force-dynamic";

// GET /api/certificates/verify/QMC-XXXX-XXXX – public: holder, course, date, status, whether the signature matches
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  if (rateLimited(`cert-verify:${clientIp(req)}`, 60, 60_000)) return json({ error: "rate" }, 429);
  const { code } = await params;
  const c = await lookupCertificate(code, req.nextUrl.searchParams.get("locale") ?? "en");
  if (c === "invalid") return json({ error: "invalid" }, 400);
  if (!c) return json({ error: "not_found" }, 404);
  return json(c, 200, { "Cache-Control": "no-store" });
}
