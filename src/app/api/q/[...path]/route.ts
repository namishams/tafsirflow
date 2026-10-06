import { NextRequest, NextResponse } from "next/server";
import { getContent, isAllowed } from "@/lib/upstream";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const p = "/" + path.join("/");
  if (!isAllowed(p)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const q = req.nextUrl.search;
  try {
    const data = await getContent(p + q);
    if ((data as { __missing?: boolean }).__missing) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
