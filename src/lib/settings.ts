import { pool } from "./db";

export const DEFAULTS = { anonTafsirLimit: 20 } as const;
export type Settings = { anonTafsirLimit: number };

export async function getSettings(): Promise<Settings> {
  try {
    const r = await pool()?.query("SELECT value FROM settings WHERE key = 'app'");
    return { ...DEFAULTS, ...(r?.rows[0]?.value ?? {}) };
  } catch {
    return { ...DEFAULTS };
  }
}
