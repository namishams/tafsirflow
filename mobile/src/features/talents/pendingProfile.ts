import { readJSON, writeJSON } from "@/lib/store";
import { getToken } from "@/lib/storage";
import { api, ApiError } from "@/lib/api";
import { T } from "./api";
import { uploadAvatarFile } from "./avatar";

// Profile set up in the onboarding (display name, @username, optional photo). Without an account it waits on the
// device under PENDING_KEY and is created after sign-in, once the age is confirmed (community from 13): the
// Talents gate, the account tab and the onboarding call syncPendingProfile(). An existing profile is never
// overwritten; only a missing photo is added. Username taken in the meantime: one try with a short number, otherwise
// the member picks another one in Edit profile.
export const PENDING_KEY = "qmc.talents.pendingProfile";
export type PendingProfile = { name: string; username: string; photo: string | null; at: number };
export const readPending = () => readJSON<PendingProfile | null>(PENDING_KEY, null);
export const savePending = (p: Omit<PendingProfile, "at">) => writeJSON(PENDING_KEY, { ...p, at: Date.now() });
export const clearPending = () => writeJSON(PENDING_KEY, undefined);

let running: Promise<"created" | "photo" | "waiting" | "none"> | null = null;
/** create the pending profile when possible; resolves what happened (never throws) */
export function syncPendingProfile() {
  running ??= run().catch(() => "waiting" as const).finally(() => { running = null; });
  return running;
}
async function run(): Promise<"created" | "photo" | "waiting" | "none"> {
  const p = readPending();
  if (!p) return "none";
  if (!(await getToken())) return "waiting";
  const age = await T.age();
  if (!age.known || !age.community) return "waiting";
  const me = await T.me();
  if (me.profile) {
    // already has a profile: keep it, only add the photo when there is none yet
    let out: "photo" | "none" = "none";
    if (p.photo && !(me.profile as { avatar?: string | null }).avatar) { await uploadAvatarFile(p.photo).catch(() => undefined); out = "photo"; }
    clearPending();
    return out;
  }
  const body = (username: string) => ({ username, name: p.name.trim() || username, bio: "", role: "learner", style: "", ijaza: false, public: true });
  try { await api("/api/community/me", { method: "PUT", body: body(p.username) }); }
  catch (e) {
    if (!(e instanceof ApiError) || e.code !== "username_taken") return "waiting";
    try { await api("/api/community/me", { method: "PUT", body: body(`${p.username.slice(0, 17)}${Math.floor(10 + Math.random() * 89)}`) }); } catch { return "waiting"; }
  }
  if (p.photo) await uploadAvatarFile(p.photo).catch(() => undefined);
  clearPending();
  return "created";
}
