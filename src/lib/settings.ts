import { pool } from "./db";

export const DEFAULTS = { anonTafsirLimit: 20, commentsAutoApprove: false } as const;
export type Settings = { anonTafsirLimit: number; commentsAutoApprove: boolean };

export async function getSettings(): Promise<Settings> {
  try {
    const r = await pool()?.query("SELECT value FROM settings WHERE key = 'app'");
    return { ...DEFAULTS, ...(r?.rows[0]?.value ?? {}) };
  } catch {
    return { ...DEFAULTS };
  }
}
