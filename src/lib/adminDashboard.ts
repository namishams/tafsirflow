import { pool } from "./db";

// Aggregated, read-only numbers for /[locale]/admin/dashboard. Counts only: no e-mail addresses, names or user ids leave
// this file. Every block is read on its own, so a table that does not exist yet leaves just that block empty.
export type Dash = {
  accounts: { total: number; week: number; premium: number; pro: number };
  signups: { day: string; n: number }[];
  active7: number;
  community: { profiles: number; follows: number; connections: number; messages: number; moments: number; reactions: number; credited: number };
  stages: { id: string; n: number }[];
  levels: { id: string; n: number }[];
  funnel: { offer: string; imp: number; tap: number; buy: number }[];
  certificates: { valid: number; pending: number; rejected: number; revoked: number };
  reportsOpen: number;
};
const num = (v: unknown) => Number(v ?? 0);
async function part<T>(fallback: T, fn: () => Promise<T>): Promise<T> { try { return await fn(); } catch { return fallback; } }
const row = async (sql: string) => (await pool()!.query(sql)).rows[0] ?? {};

export async function loadDashboard(): Promise<Dash> {
  const p = pool()!;
  const [accounts, signups, active7, community, stages, levels, funnel, certificates, reportsOpen] = await Promise.all([
    part({ total: 0, week: 0, premium: 0, pro: 0 }, async () => {
      const r = await row(`SELECT count(*)::int AS total,
        count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS week,
        count(*) FILTER (WHERE plan = 'premium' AND pro_until IS NULL)::int AS premium,
        count(*) FILTER (WHERE plan = 'premium' AND pro_until > now())::int AS pro FROM users`);
      return { total: num(r.total), week: num(r.week), premium: num(r.premium), pro: num(r.pro) };
    }),
    part([] as Dash["signups"], async () => {
      const r = await p.query(`SELECT to_char(d::date, 'YYYY-MM-DD') AS day, count(u.id)::int AS n
        FROM generate_series((now() AT TIME ZONE 'UTC')::date - 29, (now() AT TIME ZONE 'UTC')::date, interval '1 day') d
        LEFT JOIN users u ON (u.created_at AT TIME ZONE 'UTC')::date = d::date GROUP BY d ORDER BY d`);
      return r.rows.map((x) => ({ day: String(x.day), n: num(x.n) }));
    }),
    part(0, async () => num((await row("SELECT count(*)::int AS n FROM community_profiles WHERE achievements_updated_at > now() - interval '7 days'")).n)),
    part({ profiles: 0, follows: 0, connections: 0, messages: 0, moments: 0, reactions: 0, credited: 0 }, async () => {
      const one = async (sql: string) => part(0, async () => num((await row(sql)).n));
      const [profiles, follows, connections, messages, moments, reactions, credited] = await Promise.all([
        one("SELECT count(*)::int AS n FROM community_profiles"),
        one("SELECT count(*)::int AS n FROM community_follows"),
        one("SELECT count(*)::int AS n FROM community_connections WHERE status = 'accepted'"),
        one("SELECT count(*)::int AS n FROM community_messages WHERE removed_at IS NULL"),
        one("SELECT count(*)::int AS n FROM community_moments"),
        one("SELECT count(*)::int AS n FROM community_moment_reactions"),
        one("SELECT count(*)::int AS n FROM community_reaction_credits"),
      ]);
      return { profiles, follows, connections, messages, moments, reactions, credited };
    }),
    part([] as Dash["stages"], async () => (await p.query("SELECT study_stage AS id, count(*)::int AS n FROM community_profiles WHERE study_stage <> '' GROUP BY 1 ORDER BY 2 DESC")).rows.map((x) => ({ id: String(x.id), n: num(x.n) }))),
    part([] as Dash["levels"], async () => (await p.query(
      `SELECT b AS id, count(*)::int AS n FROM (
         SELECT CASE WHEN l < 5 THEN '1-4' WHEN l < 10 THEN '5-9' WHEN l < 25 THEN '10-24' WHEN l < 50 THEN '25-49' ELSE '50+' END AS b
           FROM (SELECT (achievements->'level'->>'level')::int AS l FROM community_profiles WHERE achievements ? 'level') x) y GROUP BY b`)).rows.map((x) => ({ id: String(x.id), n: num(x.n) }))),
    part([] as Dash["funnel"], async () => (await p.query(
      `SELECT offer, sum(imp)::bigint AS imp, sum(tap)::bigint AS tap, sum(buy)::bigint AS buy FROM feed_offer_stats WHERE day > current_date - 30 GROUP BY offer ORDER BY sum(imp) DESC LIMIT 12`)).rows
      .map((x) => ({ offer: String(x.offer), imp: num(x.imp), tap: num(x.tap), buy: num(x.buy) }))),
    part({ valid: 0, pending: 0, rejected: 0, revoked: 0 }, async () => {
      const r = await row(`SELECT count(*) FILTER (WHERE status = 'valid')::int AS valid, count(*) FILTER (WHERE status = 'pending')::int AS pending,
        count(*) FILTER (WHERE status = 'rejected')::int AS rejected, count(*) FILTER (WHERE status = 'revoked')::int AS revoked FROM certificates`);
      return { valid: num(r.valid), pending: num(r.pending), rejected: num(r.rejected), revoked: num(r.revoked) };
    }),
    part(0, async () => num((await row("SELECT count(*)::int AS n FROM community_reports WHERE status = 'open'")).n)),
  ]);
  return { accounts, signups, active7, community, stages, levels, funnel, certificates, reportsOpen };
}
