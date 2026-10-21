import { pool } from "@/lib/db";
import { certMsg, courseName, hmacOk, normCode } from "./lib";

export type PublicCertificate = { code: string; holder: string; course: string; title: string; pct: number; status: "valid" | "pending" | "rejected" | "revoked"; issuedAt: string; decidedAt: string | null; signatureOk: boolean };

/** a certificate as shown on /verify/<code> (also used by the page directly); "invalid" for a malformed code */
export async function lookupCertificate(raw: string, locale: string): Promise<PublicCertificate | null | "invalid"> {
  const code = normCode(decodeURIComponent(raw ?? ""));
  if (!code) return "invalid";
  if (!pool()) return null;
  try {
    const r = await pool()!.query("SELECT code, user_id, course, holder_name, pct, status, issued_at, decided_at, sig FROM certificates WHERE code = $1", [code]);
    const c = r.rows[0];
    if (!c) return null;
    const issuedAt = new Date(c.issued_at).toISOString();
    const signatureOk = hmacOk(certMsg({ code: c.code, userId: Number(c.user_id), course: c.course, holder: c.holder_name, pct: c.pct, issuedAt }), c.sig);
    return { code: c.code, holder: c.holder_name, course: c.course, title: courseName(c.course, locale), pct: c.pct, status: signatureOk ? c.status : "revoked", issuedAt, decidedAt: c.decided_at ? new Date(c.decided_at).toISOString() : null, signatureOk };
  } catch {
    return null;
  }
}
