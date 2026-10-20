"use client";
import { useEffect } from "react";
import { accountPlan, nativeApp, resetAccountPlan } from "@/lib/premium";

// Inside the iOS app: a Premium purchase is also linked to the signed-in account (then it works on the web and other
// devices too). Runs after a purchase or restore, and once per visit if the app has Premium but the account not yet.
export default function NativeBridge() {
  useEffect(() => {
    const link = async () => {
      const app = nativeApp();
      if (!app?.premium || !app.jws) return;
      const plan = await accountPlan();
      if (plan === null || plan === "premium") return; // not signed in, or already linked
      const r = await fetch("/api/iap/apple", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jws: app.jws }) }).catch(() => null);
      if (r?.ok && (await r.json().catch(() => ({}))).premium) { resetAccountPlan(); window.dispatchEvent(new Event("tf-premium")); }
    };
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ type?: string; status?: string }>).detail;
      if (d?.status === "purchased" || d?.status === "restored") void link();
    };
    window.addEventListener("qmc-app", on);
    let once = false;
    try { once = sessionStorage.getItem("tf:iapLinked") === "1"; sessionStorage.setItem("tf:iapLinked", "1"); } catch { /* private mode */ }
    if (!once) setTimeout(() => void link(), 1500);
    return () => window.removeEventListener("qmc-app", on);
  }, []);
  return null;
}
