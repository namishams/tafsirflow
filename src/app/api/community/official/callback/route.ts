import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { badgeRules, namesMatch, officialRedirectUri as redirectUri } from "@/lib/talentBadges";

export const dynamic = "force-dynamic";

// Google sends the member back here. The code is exchanged once, the member's own channels are read
// (channels?part=snippet,statistics&mine=true), the token is thrown away. The official star is granted when one channel
// has at least officialMinSubscribers (visible count) and its title or handle matches the profile name or username.
// Result back to the app (quranmasterclass://talents/badges?official=…) or the website.
type Result = "ok" | "low" | "name" | "none" | "error" | "expired" | "denied";
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ticket = sp.get("state") ?? "";
  const p = pool();
  if (!p || !/^[A-Za-z0-9_-]{20,64}$/.test(ticket)) return new NextResponse("Not available", { status: 400 });
  const hash = crypto.createHash("sha256").update(ticket).digest("hex");
  const t = (await p.query(
    "UPDATE community_oauth_tickets SET used_at = now() WHERE ticket_hash = $1 AND used_at IS NULL AND expires_at > now() RETURNING user_id, target, locale",
    [hash],
  )).rows[0];
  const back = (r: Result) => {
    const url = t?.target === "web" ? `/${t.locale}/talents/me?official=${r}` : `quranmasterclass://talents/badges?official=${r}`;
    return t?.target === "web" ? NextResponse.redirect(new URL(url, req.nextUrl.origin), 302) : NextResponse.redirect(url, 302);
  };
  if (!t) return new NextResponse("This link has expired. Please start again in the app.", { status: 400 });
  if (sp.get("error") || !sp.get("code")) return back("denied");
  try {
    const tok = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: sp.get("code")!, client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "", client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
        redirect_uri: redirectUri(), grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const tj = (await tok.json().catch(() => ({}))) as { access_token?: string };
    if (!tj.access_token) return back("error");
    const ch = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true&maxResults=50", {
      headers: { Authorization: `Bearer ${tj.access_token}` }, signal: AbortSignal.timeout(10_000),
    });
    // revoke the token right away: nothing else is read later
    void fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(tj.access_token)}`, { method: "POST" }).catch(() => undefined);
    const cj = (await ch.json().catch(() => ({}))) as { items?: { id: string; snippet?: { title?: string; customUrl?: string }; statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean } }[] };
    const items = cj.items ?? [];
    if (!items.length) return back("none");
    const prof = (await p.query("SELECT username, display_name FROM community_profiles WHERE user_id = $1", [t.user_id])).rows[0];
    if (!prof) return back("error");
    const min = badgeRules().officialMinSubscribers;
    const subs = (c: (typeof items)[number]) => (c.statistics?.hiddenSubscriberCount ? 0 : Number(c.statistics?.subscriberCount ?? 0));
    const big = items.filter((c) => subs(c) >= min);
    if (!big.length) return back("low");
    const hit = big.find((c) => namesMatch([prof.display_name, prof.username], [c.snippet?.title ?? "", c.snippet?.customUrl ?? ""]));
    if (!hit) return back("name");
    await p.query(
      `UPDATE community_profiles SET official = true, official_source = 'youtube', official_channel = $2, official_channel_id = $3, official_subscribers = $4, official_at = now()
        WHERE user_id = $1`,
      [t.user_id, hit.snippet?.title ?? "", hit.id, subs(hit)],
    );
    await p.query("INSERT INTO community_admin_actions (admin_id, action, target_user_id, detail) VALUES (NULL, 'official_youtube', $1, $2)", [t.user_id, JSON.stringify({ channel: hit.id, subscribers: subs(hit) })]);
    return back("ok");
  } catch {
    return back("error");
  }
}
