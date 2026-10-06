"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchMe, startSync, type Me } from "@/lib/sync";
import { writeJSON } from "@/lib/storage";

export default function AccountLink() {
  const t = useTranslations("account");
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetchMe().then(async (r) => {
      if (!r.user) return;
      setMe(r.user);
      if (r.user.birthYear) writeJSON("tf:age", r.user.birthYear, true);
      if (await startSync()) window.dispatchEvent(new Event("tf-synced"));
    });
  }, []);

  if (!me)
    return (
      <Link href="/account" aria-label={t("signIn")} className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-line bg-surface text-sm font-medium shadow-card hover:border-accent max-sm:h-9 max-sm:w-9 sm:px-3 sm:py-1.5">
        <svg className="sm:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        <span className="hidden sm:inline">{t("signIn")}</span>
      </Link>
    );
  return (
    <Link href="/profile" aria-label={me.email} title={me.email} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-white shadow-card">
      {(me.name || me.email)[0].toUpperCase()}
    </Link>
  );
}
