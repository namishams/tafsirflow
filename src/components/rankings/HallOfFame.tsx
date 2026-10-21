import { countryName } from "@/lib/countries";
import { fillRw, rankingsText, type RwKey } from "@/lib/rankingsWeb";
import type { Hall } from "@/lib/rankings";
import { Link } from "@/i18n/navigation";
import CountryBadge from "./CountryBadge";

// Hall of fame: for every closed year the top three members per metric and the best countries (server-rendered, so it can be indexed)
const CATS: { key: string; label: RwKey; unit: RwKey }[] = [
  { key: "xp_season", label: "hallXp", unit: "unit_xp" },
  { key: "streak", label: "hallStreak", unit: "unit_days" },
  { key: "verses", label: "hallVerses", unit: "unit_verses" },
  { key: "stickers", label: "hallStickers", unit: "unit_stickers" },
  { key: "mashaallah", label: "hallMashaallah", unit: "unit_mashaallah" },
];

export default function HallOfFame({ hall, locale }: { hall: Hall[]; locale: string }) {
  const l = rankingsText(locale);
  const nf = new Intl.NumberFormat(locale, { numberingSystem: "latn" });
  return (
    <section className="mt-14" aria-labelledby="hall">
      <h2 id="hall" className="font-display text-3xl">{l.hallTitle}</h2>
      <p className="mt-2 text-muted">{l.hallLead}</p>
      {hall.length === 0 ? <p className="callout mt-6 rounded-lg p-5 text-[15px]">{l.hallEmpty}</p> : hall.map((h) => (
        <div key={h.season.key} className="mt-8">
          <h3 className="text-lg font-bold text-gold">{fillRw(l.yearN, { n: h.season.key })}</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {CATS.map((c) => (h.members[c.key]?.length ?? 0) > 0 && (
              <div key={c.key} className="rounded-lg border border-line bg-surface p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{l[c.label]}</p>
                <ol className="mt-2 space-y-1.5">
                  {h.members[c.key].map((r, i) => (
                    <li key={r.username} className="flex items-center gap-3 text-sm">
                      <span className="w-5 font-display text-lg" style={{ color: ["#c6a65e", "#8c96a1", "#b9784a"][i] }}>{r.rank}</span>
                      <Link href={`/talents/${r.username}`} className="min-w-0 flex-1 truncate font-semibold hover:underline">{r.name}</Link>
                      {r.country && <CountryBadge code={r.country} size={22} />}
                      <span className="tabular-nums text-muted">{nf.format(r.score)} {l[c.unit]}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
            {([["total", h.countries.total, "hallCountry"], ["per", h.countries.perCapita, "hallPerCapita"]] as const).map(([k, list, label]) => list.length > 0 && (
              <div key={k} className="rounded-lg border border-line bg-surface p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{l[label]}</p>
                <ol className="mt-2 space-y-1.5">
                  {list.map((c, i) => (
                    <li key={c.country} className="flex items-center gap-3 text-sm">
                      <span className="w-5 font-display text-lg" style={{ color: ["#c6a65e", "#8c96a1", "#b9784a"][i] }}>{c.rank}</span>
                      <CountryBadge code={c.country} size={26} />
                      <span className="min-w-0 flex-1 truncate font-semibold">{countryName(c.country, locale)}</span>
                      <span className="tabular-nums text-muted">{nf.format(c.score)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
