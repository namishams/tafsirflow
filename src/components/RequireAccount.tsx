"use client";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AccountForm from "./AccountForm";
import { fetchMe, startSync, type Me } from "@/lib/sync";
import { writeJSON } from "@/lib/storage";

// Learning features run on the account: progress, plans and tests are stored in the account and synced to every device.
// Signed-out visitors and unconfirmed e-mail addresses see the sign-up / confirmation panel instead.
export default function RequireAccount({ children, feature }: { children: React.ReactNode; feature: string }) {
  const t = useTranslations("account");
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [available, setAvailable] = useState(true);
  const load = useCallback(() => fetchMe().then((r) => { setMe(r.user); setAvailable(r.available); if (r.user?.birthYear) writeJSON("tf:age", r.user.birthYear, true); if (r.user?.emailVerified) void startSync(); }), []);
  useEffect(() => {
    load();
    window.addEventListener("tf-auth", load);
    window.addEventListener("focus", load); // e-mail confirmed in another tab
    return () => { window.removeEventListener("tf-auth", load); window.removeEventListener("focus", load); };
  }, [load]);
  if (me === undefined) return <div className="mt-8 h-40 animate-pulse rounded-lg bg-line/40" />;
  if (!available || me?.emailVerified) return <>{children}</>; // no database (local preview): keep everything usable
  return (
    <section className="mt-8 grid gap-6 rounded-lg border border-line bg-surface p-6 sm:p-8 lg:grid-cols-2">
      <div>
        <p className="eyebrow text-gold">{t("wallEyebrow")}</p>
        <h2 className="font-display mt-2 text-3xl leading-tight">{me ? t("wallVerifyTitle") : t("wallTitle", { feature })}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{me ? t("wallVerifyBody") : t("wallBody")}</p>
        <ul className="mt-4 grid gap-2 text-[15px]">{["wall1", "wall2", "wall3", "wall4"].map((k) => <li key={k} className="flex gap-3"><span className="mt-2.5 h-px w-4 shrink-0 bg-gold" />{t(k)}</li>)}</ul>
      </div>
      <div className="border-t border-line pt-6 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0"><AccountForm defaultMode="register" bare /></div>
    </section>
  );
}
