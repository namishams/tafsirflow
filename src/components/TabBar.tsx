"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IconBook, IconClock, IconHands, IconRadio, IconCap, IconClose, IconGrid, IconKid, IconLogout, IconMenu, IconRepeat, IconSearch, IconShield, IconUser } from "./Icons";
import { dueVerses } from "@/lib/learning";
import { fetchMe, stopSync, type Me } from "@/lib/sync";

const TABS = [
  { href: "/today", key: "today", Icon: IconGrid },
  { href: "/quran", key: "quran", Icon: IconBook },
  { href: "/search", key: "search", Icon: IconSearch },
] as const;

const LEARN = [
  { href: "/academy", key: "courses" },
  { href: "/shams", key: "shams" },
  { href: "/tajweed", key: "tajweed" },
  { href: "/vocab", key: "vocab" },
  { href: "/khatm", key: "khatm" },
  { href: "/guides", key: "guides" },
] as const;

// Bottom navigation for phones and tablets, plus the "More" sheet (same pattern as the Courier Portal)
export default function TabBar() {
  const t = useTranslations("nav");
  const path = usePathname();
  const [more, setMore] = useState(false);
  const [due, setDue] = useState(0);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const load = () => setDue(dueVerses().length);
    load();
    fetchMe().then((r) => setMe(r.user));
    window.addEventListener("tf-synced", load);
    return () => window.removeEventListener("tf-synced", load);
  }, [path]);

  useEffect(() => { setMore(false); }, [path]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    stopSync();
    setMe(null);
    setMore(false);
  };

  const cell = "flex min-h-[3.25rem] items-center gap-3 rounded-md border border-line bg-surface px-3.5 py-3 text-[15px] font-semibold";
  const reviewHref = (() => {
    const first = dueVerses()[0];
    return first ? `/surah/${first.split(":")[0]}?v=${first.split(":")[1]}&m=2&r=1` : "/today";
  })();

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Main">
        <ul className="mx-auto grid max-w-xl grid-cols-4">
          {TABS.map(({ href, key, Icon }) => {
            const on = path === href || path.startsWith(`${href}/`) || (href === "/quran" && path.startsWith("/surah"));
            return (
              <li key={href}>
                <Link href={href} aria-current={on ? "page" : undefined} className={`relative flex flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[11px] font-semibold ${on ? "text-accent" : "text-muted"}`}>
                  {on && <span className="absolute inset-x-4 top-0 h-0.5 bg-accent" />}
                  <span className="relative"><Icon />{key === "today" && due > 0 && <span className="absolute -end-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-surface" />}</span>
                  {t(key)}
                </Link>
              </li>
            );
          })}
          <li>
            <button onClick={() => setMore(true)} className="flex w-full flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[11px] font-semibold text-muted" aria-haspopup="dialog">
              <IconMenu />{t("more")}
            </button>
          </li>
        </ul>
      </nav>

      {more && (
        <div className="fixed inset-0 z-[55] lg:hidden" role="dialog" aria-modal="true" aria-label={t("more")}>
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMore(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-lg bg-bg pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3.5">
              <p className="text-[17px] font-extrabold tracking-tight">{t("menuTitle")}</p>
              <button onClick={() => setMore(false)} aria-label={t("close")} className="grid h-9 w-9 place-items-center rounded-md hover:bg-bg"><IconClose /></button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 p-3.5">
              <Link href={reviewHref} className={cell}><IconRepeat /><span className="flex-1">{t("review")}</span>{due > 0 && <span className="rounded bg-accent px-1.5 py-0.5 text-xs text-white">{due}</span>}</Link>
              <Link href="/duas" className={cell}><IconHands /><span>{t("duas")}</span></Link>
              <Link href="/radio" className={cell}><IconRadio /><span>{t("radio")}</span></Link>
              <Link href="/prayer" className={cell}><IconClock /><span>{t("prayer")}</span></Link>
              <Link href="/account" className={cell}><IconUser /><span>{t("account")}</span></Link>
              <button onClick={() => { document.querySelector<HTMLButtonElement>("button[aria-pressed]")?.click(); setMore(false); }} className={cell}><IconKid /><span>{t("kids")}</span></button>
              {me?.role === "admin" && <Link href="/admin" className={cell}><IconShield /><span>{t("admin")}</span></Link>}
              {LEARN.map((l) => <Link key={l.href} href={l.href} className={cell}><IconCap /><span>{t(l.key)}</span></Link>)}
            </div>
            {me && (
              <div className="mx-3.5 mb-3.5 rounded-md border border-line bg-surface p-3.5">
                <p className="text-sm font-bold">{me.name || me.email}</p>
                <p className="text-sm text-muted">{me.email}</p>
                <button onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-line py-3 text-sm font-semibold hover:border-ink"><IconLogout />{t("signOut")}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
