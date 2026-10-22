import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useAuth } from "@/lib/auth";
import { M } from "./api";

// Unread messages for the badge on the profile tab: asked every 60 seconds and when the app comes to the front,
// only while signed in. Any failure (signed out, under 16, offline) counts as 0 and never shows an error.
export function useMessengerUnread(): number {
  const { user } = useAuth();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!user) { setN(0); return; }
    let live = true;
    const load = () => M.unread().then((d) => { if (live) setN((d.inbox ?? 0) + (d.requests ?? 0)); }).catch(() => { if (live) setN(0); });
    void load();
    const h = setInterval(load, 60_000);
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") void load(); });
    return () => { live = false; clearInterval(h); sub.remove(); };
  }, [user]);
  return n;
}
