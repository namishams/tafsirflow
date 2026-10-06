import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// CSV of all users for the owner (admin only). Use marketing_opt_in = true before sending any newsletter.
export async function GET() {
  if (!(await requireAdmin())) return new Response("forbidden", { status: 403 });
  const r = await pool()!.query(
    "SELECT id, email, first_name, last_name, country, city, goal, locale, email_verified, marketing_opt_in, plan, role, created_at, last_login_at FROM users ORDER BY id",
  );
  const esc = (v: unknown) => {
    let s = v instanceof Date ? v.toISOString() : String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // neutralise spreadsheet formulas
    return `"${s.replace(/"/g, '""')}"`;
  };
  const cols = r.fields.map((f) => f.name);
  const csv = [cols.join(","), ...r.rows.map((row) => cols.map((c) => esc(row[c])).join(","))].join("\n");
  return new Response("\uFEFF" + csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
