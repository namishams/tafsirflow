import { NextRequest } from "next/server";
import { clientIp, json, rateLimited } from "@/lib/http";
import { communityOverview } from "@/lib/community";

export const dynamic = "force-dynamic";

// GET /api/social/community?tab=loved|viewed|shared|discussed&range=all – read-only, public: exactly the figures the
// website's /community page shows (same function), for the app. Only what the page shows publicly: no user ids, no
// e-mail, no dates; comment authors as on the page (first name and initial). Verse texts and surah names come from the
// app's own Quran data. "on": false when the owner has paused the community (admin switch).
export async function GET(req: NextRequest) {
  if (rateLimited(`community:${clientIp(req)}`, 60, 60_000)) return json({ error: "rate" }, 429);
  const sp = req.nextUrl.searchParams;
  const o = await communityOverview(sp.get("tab"), sp.get("range"));
  const pl = o.pulse;
  return json(
    {
      on: o.on,
      kind: o.kind,
      range: o.week ? "week" : "all",
      pulse: pl ? { listenersToday: pl.listenersToday, secondsToday: pl.secondsToday, viewersToday: pl.viewersToday, likes: pl.likes, secondsWeek: pl.secondsWeek, likesWeek: pl.likesWeek } : null,
      top: o.top.map((x) => ({ key: x.key, n: x.n })),
      // most heard surahs this week: key = surah number, n = seconds listened
      heard: o.heard.map((x) => ({ surah: Number(x.key), seconds: x.n })),
      comments: o.recent.map((c) => ({ id: c.id, key: c.key, body: c.body, author: c.author, country: c.country })),
    },
    200,
    { "Cache-Control": "public, max-age=60" },
  );
}
