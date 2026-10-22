"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IconBook, IconUser } from "./Icons";
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

  // the same five tabs, icons and order as the app (mobile/src/components/TabBar.tsx): Feed, Quran, Shams, Discover, Profile
  const tabs = [
    { href: "/feed", key: "community", Icon: IconReels },
    { href: "/quran", key: "quran", Icon: IconBook },
    { href: "/shams", key: "shams", Icon: IconSun },
    { href: "/explore", key: "explore", Icon: IconCompass },
    { href: me ? "/profile" : "/account", key: "account", Icon: IconUser },
  ] as const;

  return (
    <nav className="tab-glass fixed inset-x-0 z-50 flex justify-center px-[18px] lg:hidden" style={{ bottom: "max(calc(env(safe-area-inset-bottom) - 6px), 12px)" }} aria-label={t("main")}>
      <ul className="flex h-[62px] w-full max-w-[460px] items-center rounded-full border border-[rgba(150,116,52,0.3)] bg-[rgba(255,255,255,0.62)] px-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)] backdrop-blur-xl backdrop-saturate-150 dark:bg-[rgba(13,33,26,0.62)]">
        {tabs.map(({ href, key, Icon }) => {
          const on = isActive(path, href) || (href === "/explore" && isActive(path, "/search"));
          return (
            <li key={href} className="flex-1">
              <Link href={href} aria-label={t(key)} aria-current={on ? "page" : undefined} className={`relative flex h-[62px] items-center justify-center ${on ? "text-accent" : "text-ink/70"}`}>
                {on && <span aria-hidden className="absolute h-11 w-14 rounded-full bg-[rgba(6,108,78,0.10)] backdrop-blur dark:bg-[rgba(58,190,146,0.16)]" />}
                <span className="relative [&_svg]:h-[25px] [&_svg]:w-[25px]"><Icon />{href === "/feed" && due > 0 && <span className="absolute -end-1.5 -top-1 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const ln = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const IconReels = () => (<svg {...ln}><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><path d="M3.5 8.5h17M8.5 3.5l2.6 5M14 3.5l2.6 5" /><path d="M10.2 11.6v5.2l4.9-2.6z" /></svg>);
const IconSun = () => (<svg {...ln}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></svg>);
const IconCompass = () => (<svg {...ln}><circle cx="12" cy="12" r="8.5" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>);
