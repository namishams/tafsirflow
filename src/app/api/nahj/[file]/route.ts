import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { fromApp } from "@/lib/appRequest";
import { clientIp, json, rateLimited } from "@/lib/http";
import { isNahjFile, nahjPreview, readNahj } from "@/lib/nahjContent";

export const dynamic = "force-dynamic";

// GET /api/nahj/<ar|de|en|study-de|study-en|study-course> – the Nahj al-Balagha content from the server's content folder
// (src/lib/nahjContent.ts; never in git). The website is free and gets every file in full. The app (header x-qmc-app)
// gets the full files with Pro, otherwise a preview (the first course unit and a few passages of each kind).
// 404 { error: "unavailable" } while the file is not on the server; the screens then show "not available".
export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!isNahjFile(file)) return json({ error: "not_found" }, 404);
  // (a reader page loads up to four files; classes and mosques share one address, so the limit is generous – the browser also keeps the files for an hour)
  if (rateLimited(`nahj:${clientIp(req)}`, 600, 60 * 60_000)) return json({ error: "rate" }, 429);
  const full = await readNahj(file);
  if (full === null) return json({ error: "unavailable" }, 404);
  if (fromApp(req)) {
    const me = await currentUser();
    if (me?.plan !== "premium") return json(await nahjPreview(file, full), 200, { "Cache-Control": "private, no-store" });
    return json(full, 200, { "Cache-Control": "private, no-store" });
  }
  return json(full, 200, { "Cache-Control": "public, max-age=3600" });
}
