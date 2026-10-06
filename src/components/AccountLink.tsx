"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchMe, startSync, type Me } from "@/lib/sync";

export default function AccountLink() {
  const t = useTranslations("account");
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetchMe().then(async (r) => {
      if (!r.user) return;
      setMe(r.user);
      if (await startSync()) window.dispatchEvent(new Event("tf-synced"));
    });
  }, []);

  if (!me)
    return <Link href="/account" className="whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium shadow-card hover:border-accent">{t("signIn")}</Link>;
  return (
    <Link href="/account" aria-label={me.email} title={me.email} className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-bold text-white shadow-card">
      {(me.name || me.email)[0].toUpperCase()}
    </Link>
  );
}
