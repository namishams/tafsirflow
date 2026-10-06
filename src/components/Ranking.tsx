"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchMe } from "@/lib/sync";
import { levelOf } from "@/lib/points";

type Entry = { place: number; points: number; total: number; country: string | null; me: boolean; name: string | null };
type Data = { participants: number; list: Entry[]; me: { rank: number | null; points: number; public: boolean } | null };
type Country = { country: string; points: number; people: number };
const TABS = ["week", "month", "all", "countries"] as const;
const MEDAL = ["#e9cf99", "#d9dee4", "#d49a6a"];

export default function Ranking() {
  const t = useTranslations("rewards");
  const locale = useLocale();
  const nf = (n: number) => new Intl.NumberFormat(locale, { numberingSystem: "latn" }).format(n);
  const region = (c: string | null) => { if (!c) return ""; try { return new Intl.DisplayNames([locale], { type: "region" }).of(c.toUpperCase()) ?? c; } catch { return c; } };
  const [tab, setTab] = useState<(typeof TABS)[number]>("week");
  const [data, setData] = useState<Data | null>(null);
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [err, setErr] = useState(false);
  const [pub, setPub] = useState(false);

  useEffect(() => { fetchMe().then((r) => setSignedIn(!!r.user)).catch(() => setSignedIn(false)); }, []);
  useEffect(() => {
    setErr(false);
    if (tab === "countries") {
      fetch("/api/ranking?range=month&by=country").then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => setCountries(d.countries)).catch(() => setErr(true));
    } else {
      setData(null);
      fetch(`/api/ranking?range=${tab}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((d: Data) => { setData(d); setPub(!!d.me?.public); }).catch(() => setErr(true));
    }
  }, [tab]);

  const toggle = async () => {
    const next = !pub; setPub(next);
    const r = await fetch("/api/ranking", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ public: next }) });
    if (!r.ok) setPub(!next); else fetch(`/api/ranking?range=${tab === "countries" ? "week" : tab}`).then((x) => x.json()).then(setData).catch(() => undefined);
  };
  const who = (e: Entry) => e.name ?? (e.country ? t("learnerFrom", { c: region(e.country) }) : t("learner"));
  const top = data?.list.slice(0, 3) ?? [];

  return (
    <div>
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("rankKicker")}</p>
          <h1 className="font-display mt-3 text-[40px] leading-[1.05] sm:text-6xl">{t("rankTitle")}</h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/70">{t("rankLead")}</p>
          <figure className="mt-6 max-w-2xl border-t border-white/10 pt-4">
            <p className="font-arabic text-2xl leading-loose text-[rgb(var(--gold))]" dir="rtl" lang="ar">وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ</p>
            {locale !== "ar" && <figcaption className="mt-1 text-sm text-white/60">{t("verse83")} <span className="text-white/40">(83:26)</span></figcaption>}
          </figure>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10">
        <div className="flex flex-wrap gap-1 rounded-md border border-line bg-surface p-1 text-sm font-semibold">
          {TABS.map((x) => <button key={x} onClick={() => setTab(x)} className={`flex-1 rounded px-3 py-2 ${tab === x ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}>{t(`tab_${x}`)}</button>)}
        </div>

        {/* my place */}
        {tab !== "countries" && signedIn !== null && (
          <div className="callout mt-6 rounded-lg p-5">
            {signedIn ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{t("yourPlace")}</p>
                  <p className="font-display mt-1 text-3xl">{data?.me?.rank ? `#${nf(data.me.rank)}` : "–"} <span className="text-base font-semibold text-muted">· {t("points", { n: nf(data?.me?.points ?? 0) })}</span></p>
                  {data && <p className="mt-1 text-xs text-muted">{t("participants", { n: nf(data.participants) })}</p>}
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input type="checkbox" checked={pub} onChange={toggle} className="h-5 w-5 accent-[rgb(var(--accent))]" />
                  <span><b>{t("showName")}</b><span className="block text-xs text-muted">{t("showNameHint")}</span></span>
                </label>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-md text-[15px] leading-relaxed">{t("joinBody")}</p>
                <Link href="/account" className="inline-flex h-11 items-center rounded-md btn-gold px-5 text-sm font-bold">{t("joinCta")}</Link>
              </div>
            )}
          </div>
        )}

        {err && <p className="mt-8 text-sm text-muted">{t("rankError")}</p>}

        {tab === "countries" ? (
          countries && (countries.length === 0 ? <p className="mt-8 text-sm text-muted">{t("rankEmpty")}</p> : (
            <ol className="mt-8 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
              {countries.map((c, i) => (
                <li key={c.country} className="flex items-center gap-4 px-4 py-3">
                  <span className="w-8 text-center font-display text-xl text-muted">{i + 1}</span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-[11px] font-bold">{c.country.toUpperCase()}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{region(c.country)}</span><span className="text-xs text-muted">{t("peopleN", { n: nf(c.people) })}</span></span>
                  <span className="font-bold tabular-nums">{nf(c.points)}</span>
                </li>
              ))}
            </ol>
          ))
        ) : !data ? (!err && <div className="mt-8 h-72 animate-pulse rounded-lg bg-line/40" />) : data.list.length === 0 ? (
          <p className="mt-8 text-sm text-muted">{t("rankEmpty")}</p>
        ) : (
          <>
            {/* podium */}
            <div className="mt-10 grid grid-cols-3 items-end gap-3">
              {[1, 0, 2].map((i) => top[i] && (
                <div key={i} className={`step-in flex flex-col items-center text-center ${i === 0 ? "" : "pt-6"}`} style={{ animationDelay: `${[1, 0, 2].indexOf(i) * 120}ms` }}>
                  <Medal place={top[i].place} color={MEDAL[Math.min(2, top[i].place - 1)]} size={i === 0 ? 92 : 72} />
                  <p className={`mt-2 line-clamp-2 text-sm font-bold ${top[i].me ? "text-accent" : ""}`}>{who(top[i])}</p>
                  <p className="text-xs text-muted">{t("points", { n: nf(top[i].points) })}</p>
                  <p className="font-callig text-lg leading-none text-gold" dir="rtl" lang="ar">{levelOf(top[i].total).ar}</p>
                </div>
              ))}
            </div>
            <ol className="mt-8 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
              {data.list.slice(3).map((e) => (
                <li key={`${e.place}-${e.points}-${e.name}-${e.country}`} className={`flex items-center gap-4 px-4 py-3 ${e.me ? "bg-accent-soft" : ""}`}>
                  <span className="w-8 text-center font-display text-xl text-muted">{e.place}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{who(e)}</span><span className="font-callig text-sm text-gold" dir="rtl" lang="ar">{levelOf(e.total).ar}</span></span>
                  <span className="font-bold tabular-nums">{nf(e.points)}</span>
                </li>
              ))}
            </ol>
          </>
        )}
        <p className="mt-6 text-xs leading-relaxed text-muted">{t("rankNote")}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">{t("intention")}</p>
        <div className="mt-6"><Link href="/stats" className="text-sm font-semibold text-accent hover:underline">{t("toStats")}</Link></div>
      </section>
    </div>
  );
}

function Medal({ place, color, size }: { place: number; color: string; size: number }) {
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (Math.PI / 8) * i - Math.PI / 2, r = i % 2 ? 40 : 49; return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`; });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="drop-shadow-[0_6px_12px_rgba(0,0,0,.18)]">
      <path d={`M${pts.join("L")}Z`} fill={color} stroke="#8f7238" strokeOpacity=".5" />
      <circle cx="50" cy="50" r="33" fill="rgb(var(--stage))" />
      <circle cx="50" cy="50" r="28" fill="none" stroke={color} strokeOpacity=".5" strokeDasharray="1 2.6" />
      <text x="50" y="61" textAnchor="middle" fontSize="32" fontWeight="700" fill={color} className="font-display">{place}</text>
    </svg>
  );
}
