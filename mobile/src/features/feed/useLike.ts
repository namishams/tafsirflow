import { statLike } from "./statsStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { useSiteConfig } from "@/features/extra/config";

// Likes in the feed: the same /api/social endpoints as the verse SocialBar (features/extra/SocialBar.tsx) for a
// signed-in account, so a like in the feed is the same like as on the website. Without an account (or when the owner
// switched likes off) the heart is kept on this device only ("tf:feed-likes"), so the feed never interrupts with a
// sign-in screen. A view is counted once per verse when its page becomes visible.
type Stats = { likes: number; liked: boolean; shares: number };
const LOCAL = "tf:feed-likes";
const viewed = new Set<string>();

export function useVerseLike(key: string, active: boolean) {
  const { user } = useAuth();
  const { features } = useSiteConfig();
  const server = !!user && features.likes;
  const local = useStored<string[]>(LOCAL, []);
  const [s, setS] = useState<Stats | null>(null);
  const live = useRef(true);
  useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);

  useEffect(() => {
    if (!active) return;
    let ok = true;
    (async () => {
      try {
        if (!viewed.has(key)) { viewed.add(key); await api("/api/social/view", { body: { key } }).catch(() => undefined); }
        const d = await api<Stats>(`/api/social/stats?key=${key}`);
        if (ok) setS(d);
      } catch { /* the numbers are optional */ }
    })();
    return () => { ok = false; };
  }, [key, active, user?.id]);

  const liked = server ? !!s?.liked : local.includes(key);
  const count = s ? s.likes + (!server && local.includes(key) && !s.liked ? 1 : 0) : null;

  const toggle = useCallback(async () => {
    if (!liked) statLike();
    if (!server) {
      const cur = readJSON<string[]>(LOCAL, []);
      writeJSON(LOCAL, cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]);
      return;
    }
    const was = !!s?.liked;
    setS((v) => (v ? { ...v, liked: !was, likes: Math.max(0, v.likes + (was ? -1 : 1)) } : { likes: was ? 0 : 1, liked: !was, shares: 0 }));
    try { const d = await api<Stats>("/api/social/like", { body: { key } }); if (live.current) setS(d); }
    catch { if (live.current) setS((v) => (v ? { ...v, liked: was, likes: Math.max(0, v.likes + (was ? 1 : -1)) } : v)); }
  }, [server, s?.liked, key, liked]);

  return { liked, count, toggle };
}

/** count a share of a verse (like the SocialBar) */
export const countShare = (key: string) => { void api("/api/social/share", { body: { key } }).catch(() => undefined); };
