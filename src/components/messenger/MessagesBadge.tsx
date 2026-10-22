"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { messengerText } from "@/lib/messenger/text";

// The messages icon in the website header with a round red badge (gold rim) for unread messages and requests.
// Shown only to signed-in members aged 16+ (the unread endpoint answers 401/403 otherwise); polls every 60 seconds.
export default function MessagesBadge() {
  const t = messengerText(useLocale());
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    const load = () => fetch("/api/messenger/unread", { cache: "no-store" })
      .then(async (r) => { if (!r.ok) { if (live) setN(null); return; } const d = (await r.json()) as { inbox: number; requests: number }; if (live) setN((d.inbox ?? 0) + (d.requests ?? 0)); })
      .catch(() => undefined);
    void load();
    const h = setInterval(load, 60_000);
    const vis = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", vis);
    return () => { live = false; clearInterval(h); document.removeEventListener("visibilitychange", vis); };
  }, []);
  if (n === null) return null;
  const label = n ? `${t.title}, ${n}` : t.title;
  return (
    <Link href="/messages" aria-label={label} title={t.title} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/[0.06]">
      <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 3 3 10.2l7.4 3.1L21.5 3z" /><path d="M21.5 3 15 21l-4.6-7.7" /></svg>
      {n ? <span className="absolute -end-0.5 -top-0.5 min-w-[19px] rounded-full border-[1.5px] border-[#E2C77F] bg-[rgb(196,43,52)] px-1 text-center text-[10.5px] font-bold leading-4 text-white">{n > 99 ? "99+" : n}</span> : null}
    </Link>
  );
}
