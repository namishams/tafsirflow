import { Pool } from "pg";

// DATABASE_URL comes from /srv/tafsirflow/.env.db (written by scripts/server-setup.sh, loaded by ecosystem.config.cjs).
// Without it (local dev) content is cached in memory only.
const g = globalThis as unknown as { __pool?: Pool | null; __mem?: Map<string, unknown> };

export function pool(): Pool | null {
  if (g.__pool !== undefined) return g.__pool;
  g.__pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }) : null;
  return g.__pool;
}

const mem = () => (g.__mem ??= new Map<string, unknown>());

export async function cacheGet(path: string): Promise<unknown | undefined> {
  const p = pool();
  if (!p) return mem().get(path);
  try {
    const r = await p.query("SELECT payload FROM api_cache WHERE path = $1", [path]);
    return r.rows[0]?.payload;
  } catch {
    return mem().get(path); // table missing / DB down: degrade, don't fail the request
  }
}

export async function cacheSet(path: string, payload: unknown): Promise<void> {
  const p = pool();
  mem().set(path, payload);
  if (!p) return;
  try {
    await p.query(
      "INSERT INTO api_cache (path, payload) VALUES ($1, $2) ON CONFLICT (path) DO UPDATE SET payload = $2, fetched_at = now()",
      [path, JSON.stringify(payload)],
    );
  } catch {
    /* kept in memory only */
  }
}
