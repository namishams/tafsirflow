"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useConfig } from "@/lib/config";
import { readJSON, writeJSON } from "@/lib/storage";

// A short notice for all visitors, written by the owner in the admin dashboard (de / en / ar; other languages see English)
export default function Announcement() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { announcement: a } = useConfig();
  const [hidden, setHidden] = useState(true);
  useEffect(() => { if (a) setHidden(readJSON<string>("tf:annClosed", "") === a.id); }, [a]);
  if (!a || hidden) return null;
  const text = (locale === "de" ? a.de : locale === "ar" ? a.ar : a.en) || a.en || a.de;
  if (!text) return null;
  const close = () => { writeJSON("tf:annClosed", a.id, true); setHidden(true); };
  const body = <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug">{text}</span>;
  return (
    <div role="status" className="relative z-50 bg-[rgb(var(--stage))] text-[#eef0f3]">
      <div className="h-px bg-gradient-to-r from-transparent via-[rgb(201_166_94)] to-transparent" />
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[rgb(201_166_94)]"><path d="M10 1.5l2.2 5.3 5.3 2.2-5.3 2.2L10 16.5l-2.2-5.3L2.5 9l5.3-2.2z" fill="currentColor" /></svg>
        {a.href ? (a.href.startsWith("/") ? <Link href={a.href} className="flex min-w-0 flex-1 hover:underline">{body}</Link> : <a href={a.href} className="flex min-w-0 flex-1 hover:underline" rel="noopener">{body}</a>) : body}
        <button onClick={close} aria-label={t("close")} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </div>
  );
}
