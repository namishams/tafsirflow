// mirrors the part of mobile/src/lib/auth.tsx the learning screens use: who is signed in (null = nobody). Reads the
// website's session (/api/auth/me) once per page and again after sign-in ("tf-auth") or account sync ("tf-synced").
import { useEffect, useState } from "react";
import { fetchMe, type Me } from "../sync";

let cached: Promise<Me | null> | null = null;
const load = () => (cached ??= fetchMe().then((r) => (r.user && r.user.emailVerified ? r.user : null)).catch(() => null));

export function useAuth(): { user: Me | null; ready: boolean } {
  const [user, setUser] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    const run = () => load().then((u) => { if (live) { setUser(u); setReady(true); } });
    const again = () => { cached = null; void run(); };
    void run();
    window.addEventListener("tf-auth", again);
    window.addEventListener("tf-synced", again);
    return () => { live = false; window.removeEventListener("tf-auth", again); window.removeEventListener("tf-synced", again); };
  }, []);
  return { user, ready };
}
