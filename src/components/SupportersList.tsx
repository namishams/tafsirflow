import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { countSupporters, publicSupporters } from "@/lib/supporters";
import { getSettings } from "@/lib/settings";
import { ArrowNext } from "./Icons";
import { PracticeStar } from "./art/PracticeArt";

// Public supporters list (owner 22.10.2026). Pinned first: founder and operator – labelled as such, not as paying
// supporters. Below: only real Ziina payments that were confirmed by Ziina and whose payers opted in (src/lib/supporters.ts).
// No amounts unless the owner switches on tiers in the admin panel. "compact" is the small home-page section.
export default async function SupportersList({ compact = false }: { compact?: boolean }) {
  const t = await getTranslations("supporters");
  const locale = await getLocale();
  const settings = await getSettings().catch(() => null);
  const list = await publicSupporters(compact ? 12 : 300, settings?.donation.showTiers === true);
  const fmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const month = (m: string) => { const [y, mo] = m.split("-").map(Number); return y && mo ? fmt.format(new Date(Date.UTC(y, mo - 1, 1))) : ""; };
  const total = compact ? 0 : await countSupporters();
  const pinned = [{ name: "Nami Shams", role: t("founder") }, { name: "ICSL FZE, Sharjah", role: t("operator") }];
  return (
    <section className={compact ? "pa-card mx-auto max-w-4xl p-6 sm:p-8" : "mt-16"} aria-labelledby="supporters-title">
      <h2 id="supporters-title" className={`font-display ${compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"}`}>{t("title")}</h2>
      <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-muted">{t("thanks")}</p>
      <p className="mt-3 max-w-3xl text-[15px] font-semibold leading-relaxed text-ink">{t("joinInvite")}</p>
      {total > 0 && <p className="mt-2 text-sm text-muted">{t("countLine", { count: total })}</p>}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {pinned.map((p) => (
          <li key={p.name} className="flex items-center gap-3 rounded-xl border border-[rgb(var(--gold))]/40 bg-[rgb(var(--gold))]/[0.06] px-4 py-3">
            <PracticeStar size={12} />
            <span className="min-w-0"><span className="block font-bold">{p.name}</span><span className="block text-xs font-semibold uppercase tracking-[0.12em] text-gold rtl:tracking-normal">{p.role}</span></span>
          </li>
        ))}
      </ul>
      {list.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <li key={i} className="rounded-xl border border-line px-4 py-3">
              <span className="block font-semibold" dir="auto">{[s.name, s.company].filter(Boolean).join(" · ")}</span>
              <span className="mt-0.5 block text-xs text-muted">{month(s.month)}{s.times > 1 ? ` · ${t("timesBadge", { count: s.times })}` : ""}{s.tier ? ` · ${t(`tier${s.tier}`)}` : ""}</span>
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 text-sm text-muted">{t("empty")}</p>}
      {!compact && list.length > 0 && <Link href="/supporters" className="mt-5 inline-block text-sm font-bold text-accent hover:underline">{t("more")} <ArrowNext /></Link>}
      {compact && <Link href="/supporters" className="mt-5 inline-block text-sm font-bold text-accent hover:underline">{t("more")} <ArrowNext /></Link>}
    </section>
  );
}
