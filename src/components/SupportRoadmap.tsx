import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { bpText } from "@/lib/blueprint/text";

// "The future of Quran Masterclass": plans only (no dates, no promises). Shown on /support to explain what voluntary
// project support helps to build. Self-contained; texts in messages → supporters.road*.
const ICONS = [
  <path key="a" d="M12 3v2m0 14v2M3 12h2m14 0h2m-3.5-6.5L16 7M8 17l-1.5 1.5M17.5 17.5L16 16M8 8L6.5 6.5M12 8a4 4 0 100 8 4 4 0 000-8z" />,
  <path key="b" d="M5 12h14m-5-6l6 6-6 6" />,
  <path key="c" d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" />,
];
export default async function SupportRoadmap() {
  const t = await getTranslations("supporters");
  const bp = await bpText(await getLocale());
  const cols = [["roadNowT", "roadNow"], ["roadNextT", "roadNext"], ["roadVisT", "roadVis"]] as const;
  return (
    <section className="mt-16" aria-labelledby="road-title">
      <h2 id="road-title" className="font-display text-3xl sm:text-4xl">{t("roadTitle")}</h2>
      <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-muted">{t("roadLead")}</p>
      <ol className="mt-6 grid gap-4 sm:grid-cols-3">
        {cols.map(([h, b], i) => (
          <li key={h} className="rounded-2xl border border-[rgb(201_166_94)]/40 bg-surface p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(201_166_94)]/15 text-[rgb(138_106_44)] dark:text-[#e9cf99]">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{ICONS[i]}</svg>
            </span>
            <h3 className="mt-3 text-lg font-bold">{t(h)}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{t(b)}</p>
          </li>
        ))}
      </ol>
      <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-ink/85">{t("roadFund")}</p>
      {/* the full plan for partners and investors (Blueprint Shams 4.0) */}
      <Link href="/blueprint" className="mt-4 inline-flex items-center gap-2 text-[15px] font-bold text-accent hover:underline">{bp.nav.supportLink} <span aria-hidden className="inline-block rtl:-scale-x-100">→</span></Link>
    </section>
  );
}
