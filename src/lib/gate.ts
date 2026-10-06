import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { pool } from "./db";
import { currentUser } from "./auth";
import { clientIp } from "./http";
import { getSettings } from "./settings";

export type GateResult = { blocked: boolean; limit: number; setAnon?: string; needsVerify?: boolean };

// Freemium gate: visitors without a confirmed account may open tafsir for a limited number of different verses per day
// (limit set in the admin area). Only the verse the reader actually opened counts (header x-tf-primary).
// Applies to every tafsir source, including our own.
export async function checkGate(req: NextRequest, verseKey: string): Promise<GateResult> {
  const p = pool();
  if (!p || req.headers.get("x-tf-primary") !== "1") return { blocked: false, limit: 0 };
  const me = await currentUser();
  if (me?.emailVerified) return { blocked: false, limit: 0 };
  const { anonTafsirLimit: limit } = await getSettings();
  const had = req.cookies.get("tf_anon")?.value;
  const anon = had ?? crypto.randomBytes(12).toString("hex");
  const setAnon = had ? undefined : anon;
  const subject = crypto.createHash("sha256").update(clientIp(req) + anon).digest("hex");
  const day = Math.floor(Date.now() / 86400000);
  try {
    const seen = await p.query("SELECT 1 FROM usage_verses WHERE day = $1 AND subject = $2 AND verse_key = $3", [day, subject, verseKey]);
    if (!seen.rowCount) {
      const n = Number((await p.query("SELECT count(*) AS n FROM usage_verses WHERE day = $1 AND subject = $2", [day, subject])).rows[0].n);
      if (n >= limit) return { blocked: true, limit, needsVerify: !!me, setAnon };
      await p.query("INSERT INTO usage_verses (day, subject, verse_key) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [day, subject, verseKey]);
    }
  } catch {
    return { blocked: false, limit }; // never lock readers out because of a DB hiccup
  }
  return { blocked: false, limit, setAnon };
}

export const anonCookie = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 86400 * 365 };
