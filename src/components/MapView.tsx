"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import MemoryMap from "./MemoryMap";
import { MapInsights } from "./ProgressPanel";
import { fetchMe } from "@/lib/sync";
import { readSrs } from "@/lib/learning";

// Your own map when you are signed in and have learned something – otherwise a clearly marked example
export default function MapView() {
  const t = useTranslations("map");
  const [mode, setMode] = useState<"loading" | "mine" | "demo">("loading");
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    fetchMe().then((r) => {
      setSignedIn(!!r.user);
      setMode(Object.keys(readSrs()).length > 0 ? "mine" : "demo");
    });
  }, []);
  if (mode === "loading") return <div className="h-72 animate-pulse rounded-lg bg-white/5" />;
  return (
    <div>
      {mode === "demo" && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[rgb(var(--gold))]/40 bg-[rgb(var(--gold))]/10 px-4 py-3 text-sm">
          <span><b className="text-[rgb(var(--gold))]">{t("demoTitle")}</b> <span className="text-white/75">{signedIn ? t("demoSignedIn") : t("demoBody")}</span></span>
          <Link href={signedIn ? "/surah/1?shams=1" : "/account"} className="rounded-md bg-[rgb(var(--gold))] px-4 py-2 font-bold text-[rgb(var(--stage))]">{signedIn ? t("demoStart") : t("demoCta")}</Link>
        </div>
      )}
      <MemoryMap demo={mode === "demo"} dark />
      {mode === "mine" && <MapInsights />}
    </div>
  );
}
