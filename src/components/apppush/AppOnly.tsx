"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { inIosApp } from "@/lib/premium";
import { AppStoreButton } from "@/components/AppShowcase";
import { AppQr } from "./AppQr";

// "Only in the app": quiet emerald and gold card that names what the app has and the website does not, with a QR code
// (desktop) or the App Store button (phones). The website stays free; this only invites. Hidden inside the app itself.
export type AppOnlyTopic = "stickers" | "tree" | "messenger" | "dua" | "celebrations" | "widgets" | "offline";
const KEY: Record<AppOnlyTopic, [string, string]> = {
  stickers: ["aoStickersT", "aoStickersD"], tree: ["aoTreeT", "aoTreeD"], messenger: ["aoMsgT", "aoMsgD"], dua: ["aoDuaT", "aoDuaD"],
  celebrations: ["aoCelebT", "aoCelebD"], widgets: ["aoWidgetT", "aoWidgetD"], offline: ["aoOfflineT", "aoOfflineD"],
};

export default function AppOnly({ topics, url, className = "" }: { topics: AppOnlyTopic[]; url: string; className?: string }) {
  const t = useTranslations("promo");
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(!inIosApp()); }, []);
  if (!show || !topics.length) return null;
  return (
    <section aria-labelledby="ao-title" className={`stage girih relative overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/35 text-[#eef0f3] ${className}`}>
      <div className="relative grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{t("aoKicker")}</p>
          <h2 id="ao-title" className="font-display mt-2 text-2xl leading-tight sm:text-3xl">{t("aoTitle")}</h2>
          <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-white/75">{t("aoLead")}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {topics.map((k) => (
              <li key={k} className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[rgb(var(--gold))]" />
                <span><span className="block text-[14.5px] font-bold text-[rgb(var(--gold))]">{t(KEY[k][0])}</span><span className="block text-[13.5px] leading-relaxed text-white/70">{t(KEY[k][1])}</span></span>
              </li>
            ))}
          </ul>
          <div className="mt-5 md:hidden"><AppStoreButton label={t("appStore")} /></div>
        </div>
        <div className="hidden flex-col items-center gap-2 md:flex">
          <AppQr url={url} size={132} alt={t("aoQrAlt")} />
          <p className="max-w-[140px] text-center text-[12px] text-white/65">{t("aoScan")}</p>
        </div>
      </div>
    </section>
  );
}
