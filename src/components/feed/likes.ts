"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { statLike } from "@/lib/learn/feed/statsStore";
import { useFeed } from "./ctx";

// Likes of a verse post: the same /api/social endpoints as the verse SocialBar for a signed-in account (so a like in the
// feed is the same like as on the verse page), otherwise kept on this device ("tf:feed-likes") – the feed never
// interrupts with a sign-in screen (mobile/src/features/feed/useLike.ts). A view is counted once per verse.
type Stats = { likes: number; liked: boolean; shares?: number; signedIn?: boolean };
const viewed = new Set<string>();
const post = (action: string, body: unknown) => fetch(`/api/social/${action}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export function useVerseLike(key: string, active: boolean) {
  const feed = useFeed();
  const [s, setS] = useState<Stats | null>(null);
  const live = useRef(true);
  useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
  useEffect(() => {
    if (!active || !key) return;
    let ok = true;
    (async () => {
      try {
        if (!viewed.has(key)) { viewed.add(key); await post("view", { key }).catch(() => undefined); }
        const r = await fetch(`/api/social/stats?key=${encodeURIComponent(key)}`);
        if (r.ok && ok) setS((await r.json()) as Stats);
      } catch { /* the numbers are optional */ }
    })();
    return () => { ok = false; };
  }, [key, active]);

  const server = !!s?.signedIn;
  const local = feed.liked(key);
  const liked = server ? !!s?.liked : local;
  const count = s ? s.likes + (!server && local && !s.liked ? 1 : 0) : null;

  const toggle = useCallback(async () => {
    if (!server) { feed.toggleLike(key); return; }
    const was = !!s?.liked;
    if (!was) statLike();
    setS((v) => (v ? { ...v, liked: !was, likes: Math.max(0, v.likes + (was ? -1 : 1)) } : { likes: was ? 0 : 1, liked: !was, signedIn: true }));
    try {
      const r = await post("like", { key });
      if (r.ok && live.current) setS((await r.json()) as Stats);
      else if (live.current) setS((v) => (v ? { ...v, liked: was, likes: Math.max(0, v.likes + (was ? 1 : -1)) } : v));
    } catch { if (live.current) setS((v) => (v ? { ...v, liked: was, likes: Math.max(0, v.likes + (was ? 1 : -1)) } : v)); }
  }, [server, s?.liked, key, feed]);

  return { liked, count, toggle };
}

/** count a share of a verse (like the SocialBar) */
export const countShare = (key: string) => { void post("share", { key }).catch(() => undefined); };
