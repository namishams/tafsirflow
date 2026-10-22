"use client";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { BadgeIcon } from "@/components/talents/BadgeIcon";
import { DefaultAvatar } from "@/components/talents/DefaultAvatar";
import CountryBadge from "@/components/rankings/CountryBadge";
import { careerText, fillCw, type CwKey } from "@/lib/careerWeb";
import { countryName, sortedCountries } from "@/lib/countries";
import { BOARD_CATS, BOARD_PERIODS, BOARD_SCOPES, type BoardCat, type BoardPeriod, type BoardScope } from "@/lib/career";
import { demoBoard } from "@/lib/careerDemo";
import type { Board, BoardRow } from "@/lib/careerStats";

// The global boards on the website (/ranking/global, app: /ranking-global): world, one country or the people one
// follows; week, month or all time; XP, memorised verses, streak or passed exams. The best three stand on a podium with
// their badge and country, then the list to 100 and the viewer's own place. Only members listed by name (opted in, 16+).
const DEV = process.env.NODE_ENV !== "production";

export default function GlobalBoardWeb({ locale }: { locale: string }) {
  const t = careerText(locale);
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const [scope, setScope] = useState<BoardScope>("world");
  const [cat, setCat] = useState<BoardCat>("xp");
  const [period, setPeriod] = useState<BoardPeriod>("week");
  const [country, setCountry] = useState("");
  const [b, setB] = useState<(Board & { needCountry?: boolean }) | null>(null);
  const [state, setState] = useState<"load" | "ok" | "login" | "error">("load");
  const countries = useMemo(() => sortedCountries(locale), [locale]);
  useEffect(() => {
    setState("load");
    if (DEV && new URLSearchParams(window.location.search).get("demo") === "stats") {
      const base = { xp: period === "all" ? 48_000 : period === "month" ? 6_000 : 1_600, verses: period === "all" ? 6_100 : 240, streak: 400, exams: period === "all" ? 60 : 8 }[cat];
      setB({ scope, cat, period, country: country || null, rows: demoBoard(base), named: 4_210, me: { rank: 128, total: 4_210, pct: 3.1, score: Math.round(base * 0.2), listed: true } });
      setState("ok");
      return;
    }
    const q = new URLSearchParams({ scope, cat, period });
    if (scope === "country" && country) q.set("country", country);
    let off = false;
    fetch(`/api/community/rankings/board?${q}`, { cache: "no-store" })
      .then(async (r) => {
        if (off) return;
        if (r.status === 401) { setState("login"); return; }
        if (!r.ok) { setState("error"); return; }
        const d = await r.json();
        setB(d); setState("ok");
        if (scope === "country" && !country && d.country) setCountry(d.country);
      })
      .catch(() => { if (!off) setState("error"); });
    return () => { off = true; };
  }, [scope, cat, period, country]);

  const unit = { xp: t.u_xp, verses: t.u_verses, streak: t.u_days, exams: t.u_exams }[cat];
  const catLabel = (c: BoardCat) => (c === "streak" && period === "all" ? t.streakBest : t[`cat_${c}` as CwKey]);
  const rows = b?.rows ?? [];
  const podium = rows.slice(0, 3);
  return (
    <div className="grid gap-5">
      <Seg label={t.scope_world} value={scope} options={BOARD_SCOPES.map((x) => [x, t[`scope_${x}` as CwKey]])} onChange={(v) => setScope(v as BoardScope)} />
      <Seg label={t.period_week} value={period} options={BOARD_PERIODS.map((x) => [x, t[`period_${x}` as CwKey]])} onChange={(v) => setPeriod(v as BoardPeriod)} />
      <Seg label={t.cat_xp} value={cat} options={BOARD_CATS.map((x) => [x, catLabel(x)])} onChange={(v) => setCat(v as BoardCat)} />
      {scope === "country" ? (
        <label className="grid gap-1 text-[14px] font-semibold">{t.pickCountry}
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-11 rounded-lg border border-line bg-surface px-3 font-normal">
            <option value="">{t.needCountry}</option>
            {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
      ) : null}

      {state === "load" ? <div className="h-64 rounded-2xl bg-line/50" aria-busy="true" />
        : state === "login" ? <p className="rounded-xl border border-line p-5 text-muted">{t.signInFollowing} <Link href="/account" className="font-semibold text-accent hover:underline">{t.joinRankings}</Link></p>
        : state === "error" ? <p className="text-muted">{t.error}</p>
        : b?.needCountry ? <p className="text-muted">{t.needCountry}</p>
        : !rows.length ? <p className="rounded-xl border border-line p-5 text-muted">{t.boardEmpty}</p>
        : (
          <>
            {/* podium: second, first, third */}
            <div className="stage girih relative grid grid-cols-3 items-end gap-2 overflow-hidden rounded-3xl px-3 pb-4 pt-8 text-white">
              {[podium[1], podium[0], podium[2]].map((r, i) => r ? <PodiumCol key={r.username} r={r} place={[2, 1, 3][i]} unit={unit} nf={nf} locale={locale} /> : <span key={i} />)}
            </div>
            {b?.me ? (
              <div className="flex items-center justify-between rounded-xl border border-[#c6a65e]/60 bg-[#c6a65e]/10 p-4">
                <span className="font-semibold">{t.yourPlace}</span>
                <span className="text-[15px] font-bold tabular-nums">{b.me.rank ? `#${nf.format(b.me.rank)}` : "–"} {b.me.pct ? <span className="ms-2 text-[13px] text-muted">{fillCw(t.topPct, { n: nf.format(b.me.pct) })}</span> : null}</span>
              </div>
            ) : null}
            <ol className="grid gap-1">
              {rows.slice(3).map((r) => <ListRow key={r.username} r={r} unit={unit} nf={nf} locale={locale} />)}
            </ol>
            <p className="text-[13px] text-muted">{fillCw(t.listedN, { n: nf.format(b?.named ?? 0) })}</p>
          </>
        )}
      <p className="rounded-xl bg-[rgb(var(--gold))]/10 p-4 text-[13.5px] leading-relaxed">{t.humility}</p>
      <p className="text-[12.5px] text-muted">{t.privacyNote}</p>
    </div>
  );
}

function Seg({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 overflow-x-auto rounded-xl bg-line/40 p-1">
      {options.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={`h-10 min-w-[84px] flex-1 whitespace-nowrap rounded-lg px-3 text-[14px] font-semibold ${value === v ? "bg-surface shadow-card" : "text-muted hover:text-ink"}`}>{l}</button>
      ))}
    </div>
  );
}

function Av({ r, size }: { r: BoardRow; size: number }) {
  return (
    <span className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-[rgb(8,58,44)]" style={{ width: size, height: size }}>
      {r.avatar ? <img src={r.avatar} alt="" width={size} height={size} className="h-full w-full object-cover" /> /* eslint-disable-line @next/next/no-img-element */ : <DefaultAvatar />}
    </span>
  );
}

function PodiumCol({ r, place, unit, nf, locale }: { r: BoardRow; place: number; unit: string; nf: Intl.NumberFormat; locale: string }) {
  const first = place === 1;
  return (
    <Link href={`/talents/${r.username}`} className="relative grid justify-items-center gap-1.5 text-center hover:opacity-90">
      <span className={`rounded-full p-[3px] ${first ? "ring-[3px] ring-[#E2C77F]" : "ring-2 ring-[#c6a65e]/60"}`}><Av r={r} size={first ? 76 : 58} /></span>
      <span className="flex max-w-full items-center gap-1 truncate text-[14px] font-bold">{r.name}{r.badge ? <BadgeIcon badge={r.badge} size={14} /> : null}</span>
      <span className="flex items-center gap-1 text-[12px] text-white/70">{r.country ? <CountryBadge code={r.country} size={18} /> : null}{r.country ? countryName(r.country, locale) : ""}</span>
      <span className="text-[13px] font-bold tabular-nums text-[#F4E3B4]">{nf.format(r.score)} {unit}</span>
      <span className={`mt-1 grid w-full place-items-center rounded-t-xl font-display text-[26px] font-extrabold ${first ? "h-20 bg-[#c6a65e] text-[rgb(8,38,29)]" : place === 2 ? "h-14 bg-white/15" : "h-10 bg-white/10"}`}>{place}</span>
    </Link>
  );
}

function ListRow({ r, unit, nf, locale }: { r: BoardRow; unit: string; nf: Intl.NumberFormat; locale: string }) {
  return (
    <li>
      <Link href={`/talents/${r.username}`} className={`flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent-soft/40 ${r.me ? "bg-[#c6a65e]/10 ring-1 ring-[#c6a65e]/50" : ""}`}>
        <span className="w-9 text-center text-[14px] font-bold tabular-nums text-muted">{r.rank}</span>
        <Av r={r} size={40} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 truncate text-[15px] font-semibold">{r.name}{r.badge ? <BadgeIcon badge={r.badge} size={15} /> : null}</span>
          <span className="block truncate text-[12.5px] text-muted" dir="ltr">@{r.username}</span>
        </span>
        {r.country ? <span className="hidden items-center gap-1.5 text-[12.5px] text-muted sm:flex"><CountryBadge code={r.country} size={22} />{countryName(r.country, locale)}</span> : null}
        {r.country ? <span className="sm:hidden"><CountryBadge code={r.country} size={22} /></span> : null}
        <span className="shrink-0 text-[14px] font-bold tabular-nums">{nf.format(r.score)} <span className="font-medium text-muted">{unit}</span></span>
      </Link>
    </li>
  );
}
