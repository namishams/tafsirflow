"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

// Mandatory username on the website (owner 22.10.2026, like the app): a signed-in account 13+ without a username is sent
// to /username on every page until it has one. Guests are never asked (the site works without an account). The answer
// "has a username" is remembered for the session, so the server is asked once.
export default function UsernameGuard() {
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (path.startsWith("/username") || path.startsWith("/account/reset")) return;
    try { if (sessionStorage.getItem("qm-has-username") === "1") return; } catch { /* private mode */ }
    let live = true;
    fetch("/api/community/me", { cache: "no-store" }).then(async (r) => {
      if (!r.ok || !live) return; // signed out, unconfirmed, under 13: nothing to do
      const d = (await r.json()) as { profile?: { username?: string } | null };
      if (d.profile?.username) { try { sessionStorage.setItem("qm-has-username", "1"); } catch { /* ignore */ } return; }
      const a = await fetch("/api/community/age", { cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).catch(() => null) as { community?: boolean; known?: boolean } | null;
      if (live && a && (a.community || !a.known)) router.replace("/username");
    }).catch(() => undefined);
    return () => { live = false; };
  }, [path, router]);
  return null;
}
