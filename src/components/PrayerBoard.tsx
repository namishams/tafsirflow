"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CITIES, PRAYERS, cityName, countdown, dayFor, fmtClock, fmtTime, hijriDate, type Spot } from "@/lib/prayer";
import { readJSON, writeJSON } from "@/lib/storage";

const ADHAN_SRC = "/audio/adhan/makkah.mp3"; // add a rights-cleared recording on the server to switch the button on

export default function PrayerBoard() {
  const t = useTranslations("prayer");
  const locale = useLocale();
  const [now, setNow] = useState<Date | null>(null);
  const [cityId, setCityId] = useState("makkah");
  const [mine, setMine] = useState<Spot | null>(null);
  const [geoMsg, setGeoMsg] = useState("");
  const [adhan, setAdhan] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    setCityId(readJSON<string>("tf:city", "makkah"));
    setMine(readJSON<Spot | null>("tf:myspot", null));
    fetch(ADHAN_SRC, { method: "HEAD" }).then((r) => setAdhan(r.ok)).catch(() => undefined);
    return () => clearInterval(id);
  }, []);

  const spots: Spot[] = useMemo(() => (mine ? [mine, ...CITIES] : CITIES), [mine]);
  const main = spots.find((s) => s.id === cityId) ?? CITIES[0];
  const label = (s: Spot) => (s.id === "mine" ? t("yourPlace") : cityName(CITIES.find((c) => c.id === s.id)!, locale));

  const pick = (id: string) => { setCityId(id); writeJSON("tf:city", id, true); };
  const locate = () => {
    if (!navigator.geolocation) { setGeoMsg(t("locationDenied")); return; }
    setGeoMsg(t("locating"));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const spot: Spot = { id: "mine", lat: pos.coords.latitude, lon: pos.coords.longitude, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, method: "MuslimWorldLeague" };
        setMine(spot); writeJSON("tf:myspot", spot, true); pick("mine"); setGeoMsg("");
      },
      () => setGeoMsg(t("locationDenied")),
      { timeout: 10000 },
    );
  };

  if (!now) return <main className="mx-auto max-w-3xl px-4 pb-16 pt-6"><h1 className="font-display text-[34px] leading-none">{t("title")}</h1></main>;
  const day = dayFor(main, now);
  const hijri = hijriDate(now, locale, main.tz);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-6">
      <h1 className="font-display text-[34px] leading-none">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{t("lead")}</p>

      <section className="mt-6 rounded-lg border border-line bg-surface p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only">{t("city")}</span>
            <select value={main.id} onChange={(e) => pick(e.target.value)} className="h-11 rounded-md border border-line bg-bg px-3 text-[15px] font-bold">
              {spots.map((s) => <option key={s.id} value={s.id}>{label(s)}</option>)}
            </select>
          </label>
          <button onClick={locate} className="h-11 rounded-md border border-ink px-4 text-sm font-bold hover:bg-ink hover:text-bg">{t("useLocation")}</button>
        </div>
        {geoMsg && <p className="mt-2 text-sm text-muted" role="status">{geoMsg}</p>}

        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="eyebrow">{t("localTime")}</p>
            <p className="font-display text-6xl tabular-nums leading-none sm:text-7xl" dir="ltr">{fmtClock(now, main.tz)}</p>
            {hijri && <p className="mt-3 text-[15px] text-muted">{hijri}</p>}
          </div>
          <div className="rounded-md border border-line border-s-4 border-s-accent bg-bg p-4 sm:min-w-[15rem]">
            <p className="text-[13px] font-bold text-accent">{t("nextPrayer")}</p>
            <p className="font-display mt-1 text-3xl leading-none">{t(day.next)} · {fmtTime(day.nextAt, main.tz, locale)}</p>
            <p className="mt-2 text-sm tabular-nums text-muted" dir="ltr">{t("inTime", { time: countdown(day.nextAt, now) })}</p>
          </div>
        </div>

        <ul className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-6">
          {PRAYERS.map((p) => (
            <li key={p} className={`p-3 text-center ${p === day.next ? "bg-accent-soft" : "bg-surface"}`}>
              <p className="text-[13px] font-semibold text-muted">{t(p)}</p>
              <p className={`mt-1 text-lg font-bold tabular-nums ${p === day.next ? "text-accent" : ""}`} dir="ltr">{fmtTime(day.times[p], main.tz, locale)}</p>
            </li>
          ))}
        </ul>

        {adhan && (
          <div className="mt-5">
            <audio id="adhan" src={ADHAN_SRC} preload="none" controls className="w-full" aria-label={t("playAdhan")} />
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">{t("citiesTitle")}</h2>
        <ul className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((c) => {
            const d = dayFor(c, now);
            return (
              <li key={c.id} className="bg-surface">
                <button onClick={() => { pick(c.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="block w-full p-4 text-start transition hover:bg-bg">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px] font-bold">{cityName(c, locale)}</span>
                    <span className="text-lg font-bold tabular-nums" dir="ltr">{fmtClock(now, c.tz).slice(0, 5)}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">{t(d.next)} {fmtTime(d.nextAt, c.tz, locale)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">{t("notice")}</p>
    </main>
  );
}
