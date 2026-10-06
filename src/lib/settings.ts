import { pool } from "./db";
import type { PointKind } from "./points";

// Everything the owner can steer from the admin dashboard. Stored as one JSON value (settings.key = 'app').
export type Features = {
  ranking: boolean; community: boolean; likes: boolean; comments: boolean;
  assistant: boolean; duaAi: boolean; sideArt: boolean; celebrations: boolean;
};
export type Limits = { assistantAnonPerDay: number; assistantPerUserPerDay: number; duaAiAnonPerDay: number; rankingDailyCap: number };
export type PointRules = Partial<Record<PointKind, { pts: number; cap?: number }>>;
export type Announcement = { on: boolean; id: string; de: string; en: string; ar: string; href: string };
export type Settings = {
  anonTafsirLimit: number; commentsAutoApprove: boolean;
  features: Features; limits: Limits; points: PointRules; announcement: Announcement;
};

const envAnon = () => { const n = Number(process.env.ASSISTANT_ANON_PER_DAY); return Number.isFinite(n) && process.env.ASSISTANT_ANON_PER_DAY !== undefined ? Math.max(0, n) : 5; };
export const defaults = (): Settings => ({
  anonTafsirLimit: 20,
  commentsAutoApprove: false,
  features: { ranking: true, community: true, likes: true, comments: true, assistant: true, duaAi: true, sideArt: true, celebrations: true },
  limits: { assistantAnonPerDay: envAnon(), assistantPerUserPerDay: 40, duaAiAnonPerDay: envAnon(), rankingDailyCap: 1500 },
  points: {},
  announcement: { on: false, id: "", de: "", en: "", ar: "", href: "" },
});
export const DEFAULTS = defaults();

const merge = (v: Partial<Settings> | undefined): Settings => {
  const d = defaults();
  if (!v) return d;
  return {
    ...d, ...v,
    features: { ...d.features, ...(v.features ?? {}) },
    limits: { ...d.limits, ...(v.limits ?? {}) },
    points: { ...(v.points ?? {}) },
    announcement: { ...d.announcement, ...(v.announcement ?? {}) },
  };
};

export async function getSettings(): Promise<Settings> {
  try {
    const r = await pool()?.query("SELECT value FROM settings WHERE key = 'app'");
    return merge(r?.rows[0]?.value);
  } catch {
    return defaults();
  }
}

// what the browser may know (no limits, nothing secret)
export const publicConfig = (s: Settings) => ({ features: s.features, points: s.points, announcement: s.announcement.on && (s.announcement.de || s.announcement.en || s.announcement.ar) ? s.announcement : null });
export type PublicConfig = ReturnType<typeof publicConfig>;

// cleans an update from the admin dashboard
const KINDS: PointKind[] = ["time", "listen", "verse", "review", "new", "session", "lesson", "quiz", "vocab", "streak", "wudu"];
const int = (v: unknown, lo: number, hi: number, fb: number) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fb; };
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export function sanitize(input: unknown, current: Settings): Settings {
  const b = (input ?? {}) as Partial<Settings>;
  const f = { ...current.features };
  for (const k of Object.keys(f) as (keyof Features)[]) if (typeof b.features?.[k] === "boolean") f[k] = b.features[k]!;
  const l = b.limits ?? {} as Partial<Limits>;
  const points: PointRules = {};
  for (const k of KINDS) {
    const p = (b.points ?? current.points)[k];
    if (p && Number.isFinite(Number(p.pts))) points[k] = { pts: int(p.pts, 0, 1000, 0), ...(p.cap !== undefined && p.cap !== null && String(p.cap) !== "" ? { cap: int(p.cap, 0, 100000, 0) } : {}) };
  }
  const a = b.announcement ?? current.announcement;
  const href = str(a.href, 200);
  return {
    anonTafsirLimit: b.anonTafsirLimit !== undefined ? int(b.anonTafsirLimit, 0, 10000, current.anonTafsirLimit) : current.anonTafsirLimit,
    commentsAutoApprove: typeof b.commentsAutoApprove === "boolean" ? b.commentsAutoApprove : current.commentsAutoApprove,
    features: f,
    limits: {
      assistantAnonPerDay: int(l.assistantAnonPerDay ?? current.limits.assistantAnonPerDay, 0, 1000, 5),
      assistantPerUserPerDay: int(l.assistantPerUserPerDay ?? current.limits.assistantPerUserPerDay, 0, 10000, 40),
      duaAiAnonPerDay: int(l.duaAiAnonPerDay ?? current.limits.duaAiAnonPerDay, 0, 1000, 5),
      rankingDailyCap: int(l.rankingDailyCap ?? current.limits.rankingDailyCap, 10, 100000, 1500),
    },
    points,
    announcement: {
      on: a.on === true, id: str(a.id, 40) || String(Date.now()),
      de: str(a.de, 300), en: str(a.en, 300), ar: str(a.ar, 300),
      href: href.startsWith("/") || href.startsWith("https://") ? href : "",
    },
  };
}
