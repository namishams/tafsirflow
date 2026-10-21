import { readJSON, writeJSON, removeKey } from "@/lib/store";
import type { User } from "@/lib/auth";
import { readName } from "@/features/plan/v2";
import { buildSummary } from "@/features/sijill/summary";
import type { Moment, Sijill, Summary } from "@/features/sijill/api";
import { readPending } from "./pendingProfile";
import type { TalentProfile } from "./api";

// The own profile without the network (owner, 21.10.2026: "never a blank screen"): signed out, without a community
// profile or offline, the Account tab shows the same TikTok-style profile from the data on this device. The
// achievement tiles mirror the moments the server would generate (src/lib/sijill.ts momentsFromChange), built from
// the current Sijill summary instead of from changes; nothing here is sent anywhere. The last profile loaded from the
// server is kept under OWN_CACHE_KEY so the tab also works offline (removed when the account signs out).

export const OWN_CACHE_KEY = "qmc.talents.ownProfile.v1";
export type OwnCache = { userId: number; p: TalentProfile; moments: Moment[]; sijill: Sijill | null; at: number };
export const readOwnCache = (userId: number | null | undefined): OwnCache | null => {
  if (!userId) return null;
  const c = readJSON<OwnCache | null>(OWN_CACHE_KEY, null);
  return c && c.userId === userId && c.p ? c : null;
};
export const writeOwnCache = (c: Omit<OwnCache, "at">) => writeJSON(OWN_CACHE_KEY, { ...c, at: Date.now() }, true);
export const clearOwnCache = () => removeKey(OWN_CACHE_KEY);

const STREAKS = [7, 30, 100, 365, 1000];
const safe = <T,>(f: () => T, d: T): T => { try { return f(); } catch { return d; } };

/** achievement tiles from the summary (newest kinds first, like the server's moment list) */
export function localMoments(s: Summary, author: Moment["author"]): Moment[] {
  const out: Pick<Moment, "kind" | "ref" | "data">[] = [];
  if (s.level.level > 1) out.push({ kind: "level", ref: `L${s.level.level}`, data: { n: s.level.level } });
  if (s.hifz.grade > 1) out.push({ kind: "hifz", ref: `G${s.hifz.grade}`, data: { n: s.hifz.grade } });
  s.memorised.juz.forEach((pct, i) => { if (pct >= 100) out.push({ kind: "juz", ref: `J${i + 1}`, data: { n: i + 1 } }); });
  if (s.tree.type && s.tree.stage >= 2) out.push({ kind: "tree", ref: `${s.tree.type}:${s.tree.stage}`, data: { type: s.tree.type, n: s.tree.stage } });
  for (const id of s.stickers.legendary) out.push({ kind: "sticker", ref: id.slice(0, 40), data: { id } });
  for (const se of s.stickers.series) out.push({ kind: "sticker", ref: `S:${se}`, data: { series: se } });
  const best = Math.max(s.time.best, s.time.streak);
  const hit = STREAKS.filter((m) => best >= m).pop();
  if (hit) out.push({ kind: "streak", ref: `D${hit}`, data: { n: hit } });
  for (const id of s.courses.ids) out.push({ kind: "course", ref: `C:${id}`.slice(0, 40), data: { id } });
  for (const l of s.courses.arLevels) out.push({ kind: "course", ref: `A:${l}`, data: { arabic: l } });
  return out.map((m) => ({
    ...m, id: `local:${m.kind}:${m.ref}`, at: "", title: null, total: 0, mine: null, own: true,
    counts: { like: 0, mashallah: 0, barakallah: 0, barik: 0 }, author,
  }));
}

/** the Sijill record of this device (all sections, nothing hidden: only the owner sees it) */
export function localSijill(s: Summary, moments: number): Sijill {
  return {
    updatedAt: null,
    level: { xp: s.level.xp, level: s.level.level, talentLevel: "talent", stage: s.rank.stage, rank: s.rank.rank, overall: s.rank.overall },
    hifz: s.hifz,
    ...(s.tree.type ? { tree: s.tree } : {}),
    stickers: s.stickers,
    memorised: s.memorised,
    time: s.time,
    activity: { xp: s.level.xp, level: s.level.level, week: s.week.xp, active: s.week.active },
    courses: s.courses,
    reactions: 0,
    moments,
  };
}

/** a profile object for the shared layout, filled from the onboarding (name, @username, photo) and the account */
export function localProfileData(user: User | null, pro: boolean, sharerTier: number, fallbackName: string): { p: TalentProfile; moments: Moment[]; sijill: Sijill } {
  const pending = readPending();
  const name = (user?.name?.trim() || pending?.name?.trim() || readName() || fallbackName).slice(0, 60);
  const username = pending?.username ?? "";
  const s = safe(() => buildSummary(pro), null);
  const moments = s ? localMoments(s, { username, name, badge: null, avatar: null }) : [];
  const sijill: Sijill = s ? localSijill(s, moments.length) : { updatedAt: null, reactions: 0, moments: 0 };
  const p: TalentProfile = {
    username, name, country: null, role: "learner", rewaya: "", level: "talent", verified: false, badge: null, sharerTier, followers: 0,
    avatar: pending?.photo ?? null, bio: "", style: "", ijaza: false, public: false, following: 0, shares: 0, maqam: "", ijazahChain: "",
    progress: s ? { treeStage: s.tree.stage, treeType: s.tree.type, certJuz: s.memorised.juz.map((x, i) => (x >= 100 ? i + 1 : 0)).filter(Boolean) } : null,
    mine: true, blocked: false, connection: "none", canMessage: false, followed: false, requested: false, restricted: false, private: false,
    messagePolicy: "connections", officialChannel: null, posts: 0, likes: 0, liveStory: false, postingEnabled: false,
    mashaallahTotal: 0, momentCount: moments.length, moments, momentsMore: null, followedBy: null, followsMe: false,
  };
  return { p, moments, sijill };
}

/** development only (`?demo=own|other` on the Account tab, like `?auditY`): sample counters on the device's own
 * achievements, so screenshot audits can show the signed-in layouts without a community profile on the server */
export function demoProfileData(kind: "own" | "other", base: { p: TalentProfile; moments: Moment[]; sijill: Sijill }) {
  const counts = [12, 48, 7, 103, 21, 5, 64, 9, 33];
  const moments = base.moments.map((m, i) => ({ ...m, own: kind === "own", at: new Date(Date.now() - i * 86400000 * 3).toISOString(), counts: { ...m.counts, like: counts[i % counts.length] }, author: { ...m.author, username: "nami.shams", name: "Nami Shams", badge: "emerald" as const } }));
  const total = moments.reduce((a, m) => a + (m.counts.like ?? 0), 0);
  const p: TalentProfile = {
    ...base.p, username: "nami.shams", name: "Nami Shams", badge: "emerald", following: 128, followers: 342, mashaallahTotal: total, momentCount: moments.length, moments,
    rewaya: "Hafs ʿan ʿAsim", country: "DE", bio: "Hifz student, Juz ʿAmma. Learning tajweed step by step.", public: true,
    mine: kind === "own", private: kind === "own", followsMe: kind === "other", followed: false, canMessage: false,
    followedBy: kind === "other" ? { total: 5, users: [{ username: "amina", name: "Amina", avatar: null }, { username: "yusuf", name: "Yusuf", avatar: null }] } : null,
    extras: { goals: ["juzamma", "tajweed", "understand"], city: "Hamburg", travel: kind === "other" ? { on: true, city: "Makkah" } : undefined },
  };
  return { p, moments, sijill: base.sijill };
}
