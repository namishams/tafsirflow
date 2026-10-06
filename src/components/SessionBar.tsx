"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { endSession, readSession, type Session } from "@/lib/session";
import * as vp from "@/lib/versePlayback";

// Thin bar on top of the surah page during today's session: where you are, what kind of step, and a way out
export default function SessionBar() {
  const t = useTranslations("session");
  const router = useRouter();
  const [s, setS] = useState<Session | null>(null);
  useEffect(() => { setS(readSession()); }, []);
  if (!s) return null;
  const cur = s.items[s.i];
  const pct = (s.i / Math.max(1, s.items.length)) * 100;
  return (
    <div className="sticky top-14 z-30 -mx-4 mb-4 border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur" data-no-reveal>
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="min-w-0 truncate"><span className="font-semibold text-gold">{t("title")}</span> · {t("of", { n: s.i + 1, total: s.items.length })} · {cur ? t(`k_${cur.kind}`) : ""}</span>
        <button onClick={() => { vp.stop(); endSession(); router.push("/today?session=done"); }} className="shrink-0 font-semibold text-muted hover:text-ink">{t("end")}</button>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-r from-accent to-[rgb(var(--gold))] transition-all duration-700" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
