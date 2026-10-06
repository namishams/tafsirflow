"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// The verses you have liked, newest first
export default function MyLikes() {
  const t = useTranslations("community");
  const [list, setList] = useState<{ key: string }[] | null | "login">(null);
  useEffect(() => {
    fetch("/api/social/mine").then(async (r) => { const d = r.ok ? await r.json() : { likes: [] }; setList(d.login ? "login" : d.likes); }).catch(() => setList([]));
  }, []);
  if (list === null) return <div className="mt-6 h-16 animate-pulse rounded-lg bg-line/40" />;
  if (list === "login") return <p className="mt-6 text-muted">{t("mineLogin")} <Link href="/account" className="font-semibold text-accent hover:underline">{t("mineLoginCta")}</Link></p>;
  if (list.length === 0) return <p className="mt-6 text-muted">{t("mineEmpty")}</p>;
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {list.map((x) => { const [s, v] = x.key.split(":"); return <li key={x.key}><Link href={`/surah/${s}?v=${v}`} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-semibold transition hover:border-[#c9405a]/50 hover:text-[#c9405a]"><svg viewBox="0 0 24 24" width="14" height="14" fill="#c9405a" aria-hidden><path d="M12 20s-7-4.3-7-10a4.2 4.2 0 0 1 7-3 4.2 4.2 0 0 1 7 3c0 5.7-7 10-7 10z" /></svg>{x.key}</Link></li>; })}
    </ul>
  );
}
