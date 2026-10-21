import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

const TREES = ["palm", "olive", "fig", "pomegranate", "sidr"];

// POST { show, treeStage, treeType, certJuz }: the member chooses to show the garden tree stage and the juz
// certificates (counted in the app) on the talent profile. show: false hides them again. Status only.
export async function POST(req: NextRequest) {
  const g = await talentGate(req, "progress", 20, { windowMs: 10 * 60_000, write: true, needProfile: true });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const show = b.show === true;
  const stage = typeof b.treeStage === "number" && Number.isFinite(b.treeStage) ? Math.max(0, Math.min(12, Math.floor(b.treeStage))) : 0;
  const tree = typeof b.treeType === "string" && TREES.includes(b.treeType) ? b.treeType : "";
  const certs = Array.isArray(b.certJuz) ? [...new Set(b.certJuz.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= 30))].sort((a, z) => a - z) : [];
  await pool()!.query(
    "UPDATE community_profiles SET show_progress = $2, tree_stage = $3, tree_type = $4, cert_juz = $5 WHERE user_id = $1",
    [g.me.id, show, show ? stage : 0, show ? tree : "", show ? certs : []],
  );
  return json({ ok: true, show }, 200, NO_STORE);
}
