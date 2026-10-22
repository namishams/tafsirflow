"use client";
import { useEffect, useMemo, useState } from "react";
import { BadgeIcon } from "@/components/talents/BadgeIcon";
import CountryBadge from "@/components/rankings/CountryBadge";
import TierEmblem from "./TierEmblem";
import { careerText, fillCw, type CwKey } from "@/lib/careerWeb";
import { countryName } from "@/lib/countries";
import { DIVISION_MARK } from "@/lib/career";
import type { CareerStats } from "@/lib/careerStats";

// The career card at the top of a profile on the website, like the app's ProfileStrip (owner 22.10.2026): tier and
// level (endless), Shams method, verified tier, flag, world and country rank, current streak, verses, and a link to the
// full statistics tab (#stats).
export default function ProfileStripWeb({ username, locale }: { username: string; locale: string }) {
  const t = careerText(locale);
  const [s, setS] = useState<CareerStats | null>(null);
  useEffect(() => {
    fetch(`/api/community/stats/${encodeURIComponent(username)}?locale=${locale}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((d) => setS(d?.stats ?? null)).catch(() => undefined);
  }, [username, locale]);
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  if (!s) return null;
  const c = s.career;
  const tierName = c ? `${t[`tier_${c.tier}` as CwKey]}${c.division ? ` ${DIVISION_MARK[c.division]}` : ""}${(c.gm ?? 0) >= 2 ? ` ${nf.format(c.gm)}` : ""}` : "";
  const method = s.sijill.level?.method;
  const vt = s.badge === "founder" ? t.tierFounder : s.badge === "gold" || s.badge === "official" ? t.tierMaster : s.badge ? t.tierLearner : "";
  const cells: [string, string][] = [
    [s.ranks?.xp?.rank ? `#${nf.format(s.ranks.xp.rank)}` : "–", t.worldwide],
    [s.ranks?.xp?.country ? `#${nf.format(s.ranks.xp.country)}` : "–", t.countryRank],
    [s.sijill.time ? nf.format(s.sijill.time.streak) : "–", t.streakNow],
    [s.sijill.memorised ? nf.format(s.sijill.memorised.verses) : "–", t.cat_verses],
  ];
  const chip = "inline-flex h-7 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 text-[12px] font-semibold text-[#eef0f3]";
  return (
    <button type="button" onClick={() => { window.location.hash = "stats"; document.getElementById("tab-stats")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} aria-label={`${t.careerCard}: ${tierName}. ${t.openStats}`}
      className="stage mx-auto mt-4 block w-full max-w-xl rounded-[20px] p-4 text-start transition hover:opacity-95">
      <span className="flex items-center gap-3">
        {c ? <TierEmblem tier={c.tier} division={c.division} size={62} progress={c.into} label={tierName} /> : null}
        <span className="min-w-0 flex-1">
          <span className="block text-[11.5px] font-semibold tracking-[0.1em] text-[rgb(214,180,108)]">{t.careerCard}</span>
          <span className="font-display block truncate text-[21px] text-[#f3e2b6]">{tierName}</span>
          {c ? <span className="block text-[12.5px] text-white/75">{fillCw(t.levelN, { n: nf.format(c.level.level) })}</span> : null}
        </span>
      </span>
      <span className="mt-3 flex flex-wrap justify-center gap-1.5">
        {method ? <span className={chip}>{t[`method_${method}` as CwKey]}</span> : null}
        {s.badge && vt ? <span className={chip}><BadgeIcon badge={s.badge} size={13} />{vt}</span> : null}
        {s.country ? <span className={chip}><CountryBadge code={s.country} size={15} />{countryName(s.country, locale)}</span> : null}
      </span>
      <span className="mt-3 grid grid-cols-4 gap-1.5">
        {cells.map(([v, l]) => <span key={l} className="rounded-lg bg-white/[0.07] py-2 text-center"><span className="block text-[15px] font-bold text-[#f3e2b6]">{v}</span><span className="block truncate text-[10.5px] text-white/60">{l}</span></span>)}
      </span>
    </button>
  );
}
