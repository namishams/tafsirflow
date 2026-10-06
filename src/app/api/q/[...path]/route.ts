import { NextRequest, NextResponse } from "next/server";
import { getContent, isAllowed } from "@/lib/upstream";
import { anonCookie, checkGate } from "@/lib/gate";

export const dynamic = "force-dynamic";

const TAFSIR = /^\/tafsirs\/\d+\/by_ayah\/(\d+:\d+)$/;

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const p = "/" + path.join("/");
  if (!isAllowed(p)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const tafsir = TAFSIR.exec(p);
  let setAnon: string | undefined;
  if (tafsir) {
    const g = await checkGate(req, tafsir[1]);
    setAnon = g.setAnon;
    if (g.blocked) {
      const res = NextResponse.json({ error: "limit", limit: g.limit, needsVerify: !!g.needsVerify }, { status: 402 });
      if (setAnon) res.cookies.set("tf_anon", setAnon, anonCookie);
      return res;
    }
  }

  try {
    const data = await getContent(p + req.nextUrl.search);
    if ((data as { __missing?: boolean }).__missing) return NextResponse.json({ error: "not found" }, { status: 404 });
    const res = NextResponse.json(data, { headers: { "Cache-Control": tafsir ? "private, max-age=3600" : "public, max-age=3600" } });
    if (setAnon) res.cookies.set("tf_anon", setAnon, anonCookie);
    return res;
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
