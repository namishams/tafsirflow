"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { countryName, sortedCountries } from "@/lib/countries";
import { fillRw, rankingsText, type RwKey } from "@/lib/rankingsWeb";
import CountryBadge from "./CountryBadge";

// Worldwide rankings on the website: World / My country / Friends / Countries, metric switcher, the member's own rank
// pinned, weekly reset countdown and the opt-in. Data from /api/community/rankings (public lists; own rank needs a sign-in).
type Metric = "xp_week" | "xp_total" | "streak" | "verses" | "stickers" | "mashaallah";
const METRICS: Metric[] = ["xp_week", "xp_total", "streak", "verses", "stickers", "mashaallah"];
type Row = { rank: number; username: string; name: string; country: string | null; badge: string | null; level: string; avatar: string | null; score: number; streak: number; me: boolean };
type Me = { optedIn: boolean; world: boolean; counted: boolean; country: string | null; score: number; rank: number | null; countryRank: number | null; participants: number; pending: boolean };
type CRow = { rank: number; country: string; members: number; active: number; total: number; perCapita: number; me: boolean };
type Resp = { rows?: Row[]; me?: Me | null; countries?: CRow[]; mineCountry?: CRow | null; resetsAt: string; named: number; minCountryMembers: number; needCountry?: boolean; country?: string | null };
type Settings = { settings: { hasProfile: boolean; age16: boolean; optIn: boolean; world: boolean; countCountry: boolean; country: string | null } };
type Tab = "world" | "country" | "friends" | "countries";
const MEDAL = ["#e9cf99", "#d9dee4", "#d49a6a"];

export type InitialRanking = { world: Resp; countries: Resp };

export default function WorldRanking({ initial }: { initial: InitialRanking }) {
  const locale = useLocale();
  const l = rankingsText(locale);
  const tx = (k: RwKey, v: Record<string, string | number> = {}) => fillRw(l[k], v);
  const nf = useMemo(() => new Intl.NumberFormat(locale, { numberingSystem: "latn" }), [locale]);
  const [tab, setTab] = useState<Tab>("world");
  const [metric, setMetric] = useState<Metric>("xp_week");
  const [period, setPeriod] = useState<"week" | "all">("week");
  const [mode, setMode] = useState<"total" | "per_capita">("total");
  const [cm, setCm] = useState<"xp" | "stickers" | "verses">("xp");
  const [country, setCountry] = useState("");
  const [data, setData] = useState<Resp | null>(initial.world);
  const [err, setErr] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [set, setSet] = useState<Settings["settings"] | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(i); }, []);

  const loadSettings = useCallback(async () => {
    const r = await fetch("/api/community/rankings/settings", { cache: "no-store" }).catch(() => null);
    if (!r || r.status === 401) { setSignedIn(false); setSet(null); return; }
    if (!r.ok) { setSignedIn(true); setSet(null); return; } // signed in, but no profile or age yet
    setSignedIn(true);
    setSet(((await r.json()) as Settings).settings);
  }, []);
  useEffect(() => { void loadSettings(); }, [loadSettings]);

  const load = useCallback(async () => {
    setErr(false);
    const q = new URLSearchParams({ scope: tab });
    if (tab === "countries") { q.set("period", period); q.set("cm", cm); q.set("mode", mode); } else q.set("metric", metric);
    if (tab === "country" && country) q.set("country", country);
    const r = await fetch(`/api/community/rankings?${q}`, { cache: "no-store" }).catch(() => null);
    if (!r) { setErr(true); return; }
    if (r.status === 401) { setData({ resetsAt: initial.world.resetsAt, named: 0, minCountryMembers: initial.world.minCountryMembers, rows: [] }); return; }
    if (!r.ok) { setErr(true); return; }
    setData((await r.json()) as Resp);
  }, [tab, metric, period, mode, cm, country, initial.world.resetsAt, initial.world.minCountryMembers]);
  useEffect(() => {
    if (tab === "world" && metric === "xp_week" && signedIn === false) { setData(initial.world); return; }
    if (tab === "countries" && period === "week" && mode === "total" && cm === "xp" && signedIn === false) { setData(initial.countries); return; }
    if (signedIn === null) return;
    setData(null); void load();
  }, [tab, metric, period, mode, cm, country, signedIn, load, initial]);
  useEffect(() => { if (tab === "country" && !country && set?.country) setCountry(set.country); }, [tab, set, country]);

  const save = async (body: { optIn?: boolean; countCountry?: boolean }) => {
    setBusy(true);
    const r = await fetch("/api/community/rankings/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    setBusy(false);
    if (r?.ok) { setSet(((await r.json()) as Settings).settings); setData(null); void load(); }
  };

  const left = Math.max(0, new Date(data?.resetsAt ?? initial.world.resetsAt).getTime() - now);
  const d = Math.floor(left / 86_400_000), h = Math.floor((left % 86_400_000) / 3_600_000), m = Math.floor((left % 3_600_000) / 60_000);
  const countdown = d > 0 ? `${d}${locale === "ar" ? " ي" : "d"} ${h}${locale === "ar" ? " س" : "h"}` : `${h}${locale === "ar" ? " س" : "h"} ${m}${locale === "ar" ? " د" : "m"}`;
  const unit = (mt: Metric) => tx(mt === "xp_week" || mt === "xp_total" ? "unit_xp" : mt === "streak" ? "unit_days" : mt === "verses" ? "unit_verses" : mt === "stickers" ? "unit_stickers" : "unit_mashaallah");
  const rows = data?.rows ?? [];
  const top = tab === "countries" ? [] : rows.slice(0, 3);
  const me = data?.me;
  const countries = useMemo(() => sortedCountries(locale), [locale]);

  const who = (r: Row) => (
    <span className="min-w-0 flex-1">
      <Link href={`/talents/${r.username}`} className="block truncate font-semibold hover:underline">{r.name}</Link>
      <span className="block truncate text-xs text-muted" dir="ltr">@{r.username}</span>
    </span>
  );
  const avatar = (r: Row, size: number) => (
    <span style={{ width: size, height: size }} className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-[rgb(8,58,44)] ring-2 ${r.badge === "gold" || r.badge === "official" ? "ring-[#E2C77F]" : "ring-[rgb(var(--gold))]/60"}`}>
      {r.avatar
        ? <img src={r.avatar} alt="" width={size} height={size} className="h-full w-full object-cover" /> // eslint-disable-line @next/next/no-img-element
        : <span aria-hidden className="font-callig text-[#e8d3a0]" style={{ fontSize: size * 0.4 }}>{Array.from(r.name.trim())[0]?.toUpperCase() ?? "?"}</span>}
    </span>
  );

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-1 rounded-md border border-line bg-surface p-1 text-sm font-semibold">
        {(["world", "country", "friends", "countries"] as Tab[]).map((x) => (
          <button key={x} role="tab" aria-selected={tab === x} onClick={() => setTab(x)} className={`flex-1 rounded px-3 py-2 ${tab === x ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}>{tx(`tab_${x}` as RwKey)}</button>
        ))}
      </div>

      {tab !== "countries" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {METRICS.map((x) => (
            <button key={x} onClick={() => setMetric(x)} aria-pressed={metric === x} className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${metric === x ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/15 text-ink" : "border-line text-muted hover:text-ink"}`}>{tx(`metric_${x}` as RwKey)}</button>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-[15px] leading-relaxed text-muted">{tx("countriesLead", { n: data?.minCountryMembers ?? initial.countries.minCountryMembers })}</p>
          <div className="flex flex-wrap gap-2">
            {(["xp", "stickers", "verses"] as const).map((x) => <button key={x} onClick={() => setCm(x)} aria-pressed={cm === x} className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${cm === x ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/15 text-ink" : "border-line text-muted hover:text-ink"}`}>{tx(`cm_${x}` as RwKey)}</button>)}
            <span className="mx-1 w-px bg-line" />
            {(["week", "all"] as const).map((x) => <button key={x} onClick={() => setPeriod(x)} aria-pressed={period === x} className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${period === x ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/15 text-ink" : "border-line text-muted hover:text-ink"}`}>{tx(`period_${x}` as RwKey)}</button>)}
            <span className="mx-1 w-px bg-line" />
            {(["total", "per_capita"] as const).map((x) => <button key={x} onClick={() => setMode(x)} aria-pressed={mode === x} className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${mode === x ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/15 text-ink" : "border-line text-muted hover:text-ink"}`}>{tx(`mode_${x}` as RwKey)}</button>)}
          </div>
        </div>
      )}

      {tab === "country" && (
        <label className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">{tx("pickCountry")}</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-10 rounded-md border border-line bg-surface px-3">
            <option value="">{tx("pickCountryHint")}</option>
            {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
      )}

      {/* pinned: the member's own place, or the invitation */}
      <div className="callout mt-5 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{tx("yourRank")}</p>
            {signedIn === false ? <p className="mt-1 text-[15px]">{tx("signIn")}</p> : set?.world ? (
              <p className="font-display mt-1 text-3xl">
                {me?.rank ? `#${nf.format(me.rank)}` : "–"}
                {me?.rank && tab === "world" && me.countryRank && me.country ? <span className="ms-3 text-base font-semibold text-muted">{tx("yourRankCountry", { n: nf.format(me.countryRank), c: countryName(me.country, locale) })}</span> : null}
              </p>
            ) : <p className="mt-1 text-[15px]">{tx("notRanked")}</p>}
            {me?.pending && <p className="mt-1 text-xs text-muted">{tx("pending")}</p>}
            {set?.world && tab === "country" && data?.needCountry && <p className="mt-1 text-xs text-muted">{tx("needCountry")}</p>}
            <p className="mt-1 text-xs text-muted">{tx("resetsIn", { t: countdown })}{data?.named ? ` · ${tx("participantsN", { n: nf.format(data.named) })}` : ""}</p>
          </div>
          {signedIn === false ? (
            <Link href="/account" className="inline-flex h-11 items-center rounded-md btn-gold px-5 text-sm font-bold">{tx("signInBtn")}</Link>
          ) : set ? (
            <div className="max-w-md text-sm">
              {!set.world ? (
                <>
                  <p className="font-semibold">{tx("optInTitle")}</p>
                  <p className="mt-1 text-muted">{set.age16 ? tx("optInBody") : tx("age16")}</p>
                  {!set.hasProfile ? <p className="mt-2 text-muted">{tx("needProfile")}</p> : (
                    <button disabled={busy} onClick={() => void save({ optIn: true })} className="mt-3 inline-flex h-11 items-center rounded-md btn-gold px-5 font-bold disabled:opacity-60">{tx("optInBtn")}</button>
                  )}
                </>
              ) : (
                <button disabled={busy} onClick={() => void save({ optIn: false })} className="inline-flex h-10 items-center rounded-md border border-line px-4 font-semibold hover:bg-bg disabled:opacity-60">{tx("optOutBtn")}</button>
              )}
              <label className="mt-3 flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={set.countCountry} disabled={busy || !set.hasProfile} onChange={(e) => void save({ countCountry: e.target.checked })} className="mt-0.5 h-5 w-5 accent-[rgb(var(--accent))]" />
                <span><b>{tx("count")}</b><span className="block text-xs text-muted">{tx("countHint")}</span></span>
              </label>
            </div>
          ) : null}
        </div>
      </div>

      {err && <p className="mt-8 text-sm text-muted">{tx("error")}</p>}
      {!data && !err && <div className="mt-8 h-72 animate-pulse rounded-lg bg-line/40" />}
      {tab === "friends" && signedIn === false && <p className="mt-8 text-sm text-muted">{tx("signInFriends")}</p>}

      {/* countries */}
      {tab === "countries" && data?.countries && (
        data.countries.length === 0 ? <p className="mt-8 text-sm text-muted">{tx("empty")}</p> : (
          <ol className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {data.countries.map((c) => (
              <li key={c.country} className={`flex items-center gap-4 px-4 py-3 ${c.me ? "bg-accent-soft" : ""}`}>
                <span className="w-8 text-center font-display text-xl" style={{ color: c.rank <= 3 ? MEDAL[c.rank - 1] : undefined }}>{c.rank}</span>
                <CountryBadge code={c.country} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{countryName(c.country, locale)}</span>
                  <span className="text-xs text-muted">{tx("membersN", { n: nf.format(c.members) })} · {tx("activeN", { n: nf.format(c.active) })}</span>
                </span>
                <span className="text-end">
                  <span className="block font-bold tabular-nums">{mode === "total" ? nf.format(c.total) : nf.format(c.perCapita)}</span>
                  <span className="block text-xs text-muted">{mode === "total" ? tx(`cm_${cm}` as RwKey) : tx("perActive", { n: "" }).trim()}</span>
                </span>
              </li>
            ))}
          </ol>
        )
      )}
      {tab === "countries" && data?.mineCountry && !data.countries?.some((c) => c.me) && (
        <p className="mt-3 text-sm text-muted">{countryName(data.mineCountry.country, locale)}: #{nf.format(data.mineCountry.rank)}</p>
      )}

      {/* members */}
      {tab !== "countries" && data?.rows && !(tab === "friends" && signedIn === false) && (
        rows.length === 0 ? <p className="mt-8 text-sm text-muted">{tab === "friends" ? tx("friendsEmpty") : tx("empty")}</p> : (
          <>
            <div className="mt-10 grid grid-cols-3 items-end gap-3">
              {[1, 0, 2].map((i) => top[i] && (
                <div key={top[i].username} className={`flex flex-col items-center text-center ${i === 0 ? "" : "pt-6"}`}>
                  <span className="relative">
                    {avatar(top[i], i === 0 ? 88 : 68)}
                    <span className="absolute -bottom-2 start-1/2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full text-[13px] font-bold text-[#0b3d2e] rtl:translate-x-1/2" style={{ background: MEDAL[Math.min(2, top[i].rank - 1)] }}>{top[i].rank}</span>
                  </span>
                  <Link href={`/talents/${top[i].username}`} className={`mt-4 line-clamp-2 text-sm font-bold hover:underline ${top[i].me ? "text-accent" : ""}`}>{top[i].name}</Link>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-muted">{top[i].country && <CountryBadge code={top[i].country} size={18} />}{nf.format(top[i].score)} {unit(metric)}</span>
                </div>
              ))}
            </div>
            <ol className="mt-8 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
              {rows.slice(3).map((r) => (
                <li key={r.username} className={`flex items-center gap-4 px-4 py-3 ${r.me ? "bg-accent-soft" : ""}`}>
                  <span className="w-8 text-center font-display text-xl text-muted">{r.rank}</span>
                  {avatar(r, 40)}
                  {who(r)}
                  {r.country && <CountryBadge code={r.country} size={30} />}
                  <span className="text-end font-bold tabular-nums">{nf.format(r.score)}<span className="block text-xs font-normal text-muted">{unit(metric)}</span></span>
                </li>
              ))}
            </ol>
          </>
        )
      )}
      <p className="mt-6 text-xs leading-relaxed text-muted"><b>{tx("privacy")}.</b> {tx("privacyNote")}</p>
      <div className="mt-4"><Link href="/ranking/points" className="text-sm font-semibold text-accent hover:underline">{tx("pointsLink")}</Link></div>
    </div>
  );
}
