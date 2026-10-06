"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IconBook, IconCap, IconGrid, IconSearch, IconUser } from "./Icons";
import { isActive } from "@/lib/nav";
import { dueVerses } from "@/lib/learning";
import { fetchMe, type Me } from "@/lib/sync";

// Bottom navigation for phones and tablets. Everything else is in the menu at the top right (same menu on every page).
export default function TabBar() {
  const t = useTranslations("nav");
  const path = usePathname();
  const [due, setDue] = useState(0);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const load = () => setDue(dueVerses().length);
    load();
    window.addEventListener("tf-synced", load);
    return () => window.removeEventListener("tf-synced", load);
  }, [path]);
  useEffect(() => { fetchMe().then((r) => setMe(r.user)); }, []);

  const tabs = [
    { href: "/today", key: "today", Icon: IconGrid },
    { href: "/quran", key: "quran", Icon: IconBook },
    { href: "/academy", key: "courses", Icon: IconCap },
    { href: "/search", key: "search", Icon: IconSearch },
    { href: me ? "/profile" : "/account", key: "account", Icon: IconUser },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label={t("main")}>
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {tabs.map(({ href, key, Icon }) => {
          const on = isActive(path, href);
          return (
            <li key={key} className="min-w-0">
              <Link href={href} aria-current={on ? "page" : undefined} className={`relative flex flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[10.5px] font-semibold ${on ? "text-accent" : "text-muted"}`}>
                {on && <span className="absolute inset-x-5 top-0 h-[2px] rounded-full bg-accent" />}
                <span className="relative"><Icon />{key === "today" && due > 0 && <span className="absolute -end-1.5 -top-1 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />}</span>
                <span className="max-w-full truncate">{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
