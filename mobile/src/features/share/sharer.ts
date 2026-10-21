import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/storage";
import { onShare, statsNow } from "@/features/feed/statsStore";
import { weekShares } from "@/features/feed/gamify";
import { success } from "@/features/feed/haptics";

// "Verbreiter" (sharer) status: a visible level for those who pass on knowledge diligently. Status only, never a
// feature (App Store 3.2.2 / 4.5.4: no unlocks for sharing). Tiers come from the shares counted on this device;
// signed-in members with a community profile send their counts so others see the level on their profile.

/** shares needed for tier 1, 2, … (tier 3 and above: golden profile ring) */
export const SHARER_TIERS = [3, 10, 25, 50, 100, 250, 500, 1000] as const;
export const GOLD_TIER = 3;

export function sharerTier(shares: number): number {
  let t = 0;
  for (const n of SHARER_TIERS) if (shares >= n) t++;
  return t;
}
/** shares still needed for the next tier (null at the top) */
export function nextTier(shares: number): { tier: number; left: number } | null {
  const t = sharerTier(shares);
  return t >= SHARER_TIERS.length ? null : { tier: t + 1, left: SHARER_TIERS[t] - shares };
}

// ---------- tier-up celebration ----------
type Listener = (tier: number) => void;
const celebrate = new Set<Listener>();
export const onSharerTierUp = (f: Listener) => { celebrate.add(f); return () => { celebrate.delete(f); }; };

let syncTimer: ReturnType<typeof setTimeout> | null = null;
onShare((before, after) => {
  const a = sharerTier(before), b = sharerTier(after);
  if (b > a) {
    success();
    celebrate.forEach((f) => { try { f(b); } catch { /* ignore */ } });
  }
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => { void syncSharer(); }, 4000);
});

/** send this device's share counts to the community profile (only signed in; the server keeps the higher total) */
export async function syncSharer(): Promise<void> {
  try {
    if (!(await getToken())) return;
    const st = statsNow();
    await api("/api/community/shares", { method: "POST", body: { total: st.total.shares, week: weekShares(st) } });
  } catch { /* no profile, offline: try again with the next share */ }
}

/** the listener's own sharer state, updated on every share */
export function useMySharer() {
  const read = () => { const st = statsNow(); return { shares: st.total.shares, week: weekShares(st) }; };
  const [s, setS] = useState(read);
  useEffect(() => onShare(() => setS(read())), []);
  return { ...s, tier: sharerTier(s.shares), next: nextTier(s.shares) };
}

export type TopSharer = { username: string; name: string; week: number; tier: number };
export async function loadTopSharers(): Promise<TopSharer[] | null> {
  try {
    const d = await api<{ list: TopSharer[] }>("/api/community/shares");
    return d.list;
  } catch { return null; }
}
