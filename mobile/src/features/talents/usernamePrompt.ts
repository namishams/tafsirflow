import { useEffect } from "react";
import { AppState } from "react-native";
import { router, usePathname, type Href } from "expo-router";
import { readJSON, writeJSON } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { T } from "./api";

// Mandatory username (owner 22.10.2026): right after sign-in or registration, and for every existing account without a
// username on each open, the full-screen /username step appears and cannot be skipped. Guests who are not signed in are
// never asked (Apple 5.1.1(v): the app works without an account). Under 13 there is no community profile, so no prompt.
// Once an account has a username it is remembered here and the server is not asked again.
const KEY = "qmc.username.has.v1";
export function markUsernamePrompted(userId?: number) {
  if (!userId) return;
  const st = readJSON<Record<string, number>>(KEY, {});
  st[String(userId)] = Date.now();
  writeJSON(KEY, st);
}
const has = (id: number) => !!readJSON<Record<string, number>>(KEY, {})[String(id)];

export function UsernamePromptBridge() {
  const { user } = useAuth();
  const path = usePathname();
  useEffect(() => {
    if (!user || has(user.id)) return;
    let live = true;
    const check = () => {
      if (!live || has(user.id)) return;
      T.me().then((d) => {
        if (d.profile) { markUsernamePrompted(user.id); return; }
        return T.age().then((a) => {
          // unknown age: the username step asks for it first; under 13: no community at all
          if (live && (a.community || !a.known) && !path.startsWith("/username")) router.push("/username" as Href);
        });
      }).catch(() => undefined);
    };
    const h = setTimeout(check, 800);
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") check(); });
    return () => { live = false; clearTimeout(h); sub.remove(); };
  }, [user?.id, path.startsWith("/username")]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
