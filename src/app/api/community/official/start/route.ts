import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { officialRedirectUri as redirectUri } from "@/lib/talentBadges";

export const dynamic = "force-dynamic";

// opens Google's consent screen (scope youtube.readonly, nothing is posted, the token is not stored)
export async function GET(req: NextRequest) {
  const ticket = req.nextUrl.searchParams.get("ticket") ?? "";
  const id = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!id || !pool() || !/^[A-Za-z0-9_-]{20,64}$/.test(ticket)) return new NextResponse("Not available", { status: 400 });
  const hash = crypto.createHash("sha256").update(ticket).digest("hex");
  const t = await pool()!.query("SELECT 1 FROM community_oauth_tickets WHERE ticket_hash = $1 AND used_at IS NULL AND expires_at > now()", [hash]);
  if (!t.rows[0]) return new NextResponse("This link has expired. Please start again in the app.", { status: 400 });
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.searchParams.set("client_id", id);
  u.searchParams.set("redirect_uri", redirectUri());
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "https://www.googleapis.com/auth/youtube.readonly");
  u.searchParams.set("access_type", "online");
  u.searchParams.set("include_granted_scopes", "false");
  u.searchParams.set("prompt", "select_account consent");
  u.searchParams.set("state", ticket);
  return NextResponse.redirect(u.toString(), 302);
}
