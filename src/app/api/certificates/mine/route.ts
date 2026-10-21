import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { json } from "@/lib/http";
import { courseName, qrRows, verifyUrl } from "../lib";

export const dynamic = "force-dynamic";

// GET – my verifiable certificates with the verify link and its QR (rows of 0/1 for the app)
export async function GET(req: NextRequest) {
  if (!pool()) return json({ certificates: [] });
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const locale = req.nextUrl.searchParams.get("locale") ?? "en";
  const r = await pool()!.query(
    `SELECT c.code, c.course, c.holder_name, c.pct, c.status, c.issued_at, c.decided_at,
            (SELECT q.recording_path IS NOT NULL FROM review_queue q WHERE q.certificate_id = c.id ORDER BY q.id DESC LIMIT 1) AS has_recording,
            (SELECT q.note FROM review_queue q WHERE q.certificate_id = c.id AND q.status = 'rejected' ORDER BY q.id DESC LIMIT 1) AS note
       FROM certificates c WHERE c.user_id = $1 ORDER BY c.issued_at DESC LIMIT 100`, [me.id]);
  return json({
    certificates: r.rows.map((c) => ({
      code: c.code, course: c.course, title: courseName(c.course, locale), holder: c.holder_name, pct: c.pct, status: c.status,
      issuedAt: c.issued_at, decidedAt: c.decided_at, hasRecording: !!c.has_recording, note: c.note ?? "", url: verifyUrl(c.code), qr: qrRows(c.code),
    })),
  }, 200, { "Cache-Control": "private, no-store" });
}
