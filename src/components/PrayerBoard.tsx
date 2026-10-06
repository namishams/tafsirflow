"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CITIES, DEFAULT_SETTINGS, METHODS, PRAYERS, cityName, countdown, dayFor, fmtClock, fmtTime, hijriDate, monthOf, nightOf, qiblaOf, spotToday, type Prayer, type PrayerSettings, type Spot } from "@/lib/prayer";
import { readJSON, writeJSON } from "@/lib/storage";
import { adhanList, adhanUrl, pickAdhan, type AdhanFile } from "@/lib/adhan";
import { ArrowNext, ArrowBack } from "./Icons";

const dark = "stage text-[#eef0f3]";

// Prayer times: live countdown, day arc, qibla, night times, reminders with adhan, settings and a monthly timetable
export default function PrayerBoard() {
  const t = useTranslations("prayer");
  const locale = useLocale();
  const [now, setNow] = useState<Date | null>(null);
  const [cityId, setCityId] = useState("makkah");
  const [mine, setMine] = useState<Spot | null>(null);
  const [geoMsg, setGeoMsg] = useState("");
  const [files, setFiles] = useState<AdhanFile[]>([]);
  const [voice, setVoice] = useState("random");
  const [playing, setPlaying] = useState<AdhanFile | null>(null);
  const [st, setSt] = useState<PrayerSettings>(DEFAULT_SETTINGS);
  const [remind, setRemind] = useState(false);
  const [autoAdhan, setAutoAdhan] = useState(false);
  const [monthShift, setMonthShift] = useState(0);
  const [heading, setHeading] = useState<number | null>(null);
  const fired = useRef(new Set<string>());
  const adhanEl = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    setCityId(readJSON<string>("tf:city", "makkah"));
    setMine(readJSON<Spot | null>("tf:myspot", null));
    setSt({ ...DEFAULT_SETTINGS, ...readJSON<Partial<PrayerSettings>>("tf:prayerSettings", {}) });
    setRemind(readJSON<boolean>("tf:prayerRemind", false));
    setAutoAdhan(readJSON<boolean>("tf:prayerAutoAdhan", false));
    adhanList().then((f) => { setFiles(f); setPlaying(pickAdhan(readJSON<string>("tf:adhanVoice", "random"), f)); });
    setVoice(readJSON<string>("tf:adhanVoice", "random"));
    return () => clearInterval(id);
  }, []);

  const spots: Spot[] = useMemo(() => (mine ? [mine, ...CITIES] : CITIES), [mine]);
  const main = spots.find((s) => s.id === cityId) ?? CITIES[0];
  const label = (s: Spot) => (s.id === "mine" ? t("yourPlace") : cityName(CITIES.find((c) => c.id === s.id)!, locale));
  const saveSt = (n: PrayerSettings) => { setSt(n); writeJSON("tf:prayerSettings", n, true); };

  // reminder + adhan at prayer time (while this page is open)
  useEffect(() => {
    if (!now || (!remind && !autoAdhan)) return;
    const day = dayFor(main, now, st);
    for (const p of PRAYERS) {
      if (p === "sunrise") continue;
      const at = day.times[p].getTime(), key = `${main.id}-${p}-${day.times[p].toDateString()}`;
      if (now.getTime() >= at && now.getTime() - at < 60_000 && !fired.current.has(key)) {
        fired.current.add(key);
        if (remind && "Notification" in window && Notification.permission === "granted") new Notification(`${t(p)} · ${fmtTime(day.times[p], main.tz, locale)}`, { body: `${t("timeFor")} ${t(p)} – ${label(main)}`, icon: "/icon-192.png" });
        if (autoAdhan && adhanEl.current) { const pick = pickAdhan(voice, files); if (pick) { setPlaying(pick); adhanEl.current.src = adhanUrl(pick.id); void adhanEl.current.play().catch(() => undefined); } }
      }
    }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const toggleRemind = async () => {
    if (!remind && "Notification" in window && Notification.permission !== "granted") {
      const r = await Notification.requestPermission().catch(() => "denied");
      if (r !== "granted") { setGeoMsg(t("notifyDenied")); return; }
    }
    setRemind(!remind); writeJSON("tf:prayerRemind", !remind, true);
  };
  const startCompass = async () => {
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (D.requestPermission) { const r = await D.requestPermission().catch(() => "denied"); if (r !== "granted") return; }
    window.addEventListener("deviceorientation", (e) => {
      const ev = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
      const h = ev.webkitCompassHeading ?? (ev.alpha !== null ? 360 - ev.alpha : null);
      if (h !== null && h !== undefined) setHeading(h);
    }, true);
  };

  if (!now) return <main className="mx-auto max-w-3xl px-4 pb-16 pt-6"><h1 className="font-display text-[34px] leading-none">{t("title")}</h1></main>;
  const day = dayFor(main, now, st);
  const hijri = hijriDate(now, locale, main.tz);
  const greg = new Intl.DateTimeFormat(locale, { timeZone: main.tz, calendar: "gregory", numberingSystem: "latn", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
  const night = nightOf(main, now, st);
  const qibla = qiblaOf(main);
  const current = [...PRAYERS].reverse().find((p) => p !== "sunrise" && day.times[p].getTime() <= now.getTime()) ?? "isha";
  const today = spotToday(now, main.tz);
  const mDate = new Date(today.y, today.m + monthShift, 1);
  const month = monthOf(main, mDate.getFullYear(), mDate.getMonth(), st);
  const methodOf = st.method === "auto" ? main.method : st.method;

  return (
    <div>
      {/* Hero: place, live clock, next prayer countdown and the arc of the day */}
      <section className={`${dark} girih relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 80% 10%, rgb(var(--gold) / .14) 0, transparent 40%)" }} />
        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-8 sm:pb-16 sm:pt-12">
          <div className="flex flex-wrap items-center gap-2">
            <select value={main.id} onChange={(e) => pick(e.target.value)} aria-label={t("city")} className="h-11 rounded-md border border-white/20 bg-white/5 px-3 text-[15px] font-bold text-white">
              {spots.map((s) => <option key={s.id} value={s.id} className="text-ink">{label(s)}</option>)}
            </select>
            <button onClick={locate} className="h-11 rounded-md border border-white/30 px-4 text-sm font-bold hover:border-white">{t("useLocation")}</button>
          </div>
          {geoMsg && <p className="mt-2 text-sm text-white/60" role="status">{geoMsg}</p>}
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">{t("nextPrayer")}</p>
              <h1 className="font-display mt-2 text-6xl leading-none sm:text-7xl">{t(day.next)}</h1>
              <p className="mt-3 text-2xl font-bold tabular-nums" dir="ltr">{fmtTime(day.nextAt, main.tz, locale)} <span className="text-white/50">·</span> <span className="text-[rgb(var(--gold))]">{countdown(day.nextAt, now)}</span></p>
              <p className="mt-4 text-sm text-white/60">{greg}{hijri ? ` · ${hijri}` : ""}</p>
              <p className="mt-1 text-sm text-white/60">{t("localTime")}: <span className="tabular-nums" dir="ltr">{fmtClock(now, main.tz)}</span></p>
            </div>
            <DayArc times={day.times} now={now} tz={main.tz} locale={locale} t={t} />
          </div>
          <ul className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-6">
            {PRAYERS.map((p) => (
              <li key={p} className={`p-3 text-center sm:p-4 ${p === day.next ? "bg-[rgb(var(--gold))] text-[rgb(var(--stage))]" : p === current ? "bg-white/10" : "bg-stage"}`}>
                <p className={`text-[12px] font-semibold ${p === day.next ? "" : "text-white/60"}`}>{t(p)}{p === current && p !== day.next ? ` · ${t("now")}` : ""}</p>
                <p className="mt-1 text-xl font-bold tabular-nums" dir="ltr">{fmtTime(day.times[p], main.tz, locale)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Qibla */}
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-lg font-bold">{t("qibla")}</h2>
            <div className="mt-4 flex items-center gap-5">
              <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full border-2 border-line" style={{ transform: heading !== null ? `rotate(${-heading}deg)` : undefined }}>
                <span className="absolute top-1 text-[10px] font-bold text-muted">N</span>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: `rotate(${qibla}deg)` }} aria-hidden="true"><path d="M40 6 L48 40 L40 34 L32 40 Z" fill="rgb(var(--accent))" /><rect x="35" y="2" width="10" height="9" rx="1" fill="rgb(var(--ink))" /><circle cx="40" cy="40" r="3" fill="rgb(var(--ink))" /></svg>
              </div>
              <div><p className="font-display text-3xl tabular-nums">{Math.round(qibla)}°</p><p className="text-sm text-muted">{t("qiblaHint")}</p></div>
            </div>
            <button onClick={startCompass} className="mt-4 text-sm font-semibold text-accent hover:underline">{heading !== null ? t("compassOn") : t("compass")}</button>
          </section>

          {/* Night and sunnah times */}
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-lg font-bold">{t("sunnahTitle")}</h2>
            <dl className="mt-4 grid gap-3 text-[15px]">
              <div className="flex justify-between gap-3"><dt className="text-muted">{t("duha")}</dt><dd className="font-bold tabular-nums" dir="ltr">{fmtTime(night.duha, main.tz, locale)} – {fmtTime(new Date(day.times.dhuhr.getTime() - 10 * 60000), main.tz, locale)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">{t("midnight")}</dt><dd className="font-bold tabular-nums" dir="ltr">{fmtTime(night.midnight, main.tz, locale)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">{t("lastThird")}</dt><dd className="font-bold tabular-nums" dir="ltr">{fmtTime(night.lastThird, main.tz, locale)}</dd></div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted">{t("sunnahNote")}</p>
          </section>

          {/* Reminders and adhan */}
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-lg font-bold">{t("remindTitle")}</h2>
            <label className="mt-4 flex items-start gap-3 text-[15px]"><input type="checkbox" className="mt-1" checked={remind} onChange={toggleRemind} /><span>{t("remind")}</span></label>
            <label className="mt-3 flex items-start gap-3 text-[15px]"><input type="checkbox" className="mt-1" checked={autoAdhan} onChange={() => { setAutoAdhan(!autoAdhan); writeJSON("tf:prayerAutoAdhan", !autoAdhan, true); }} /><span>{t("autoAdhan")}</span></label>
            <label className="mt-4 grid gap-1 text-sm"><span className="font-semibold text-muted">{t("adhanVoice")}</span>
              <select value={voice} onChange={(e) => { setVoice(e.target.value); writeJSON("tf:adhanVoice", e.target.value, true); setPlaying(pickAdhan(e.target.value, files)); }} className="h-10 w-full min-w-0 rounded-md border border-line bg-bg px-2 text-sm">
                <option value="random">{t("random")}</option>
                {files.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </label>
            {playing ? (
              <div className="mt-3 grid gap-1">
                <audio ref={adhanEl} key={playing.id} src={adhanUrl(playing.id)} preload="none" controls className="w-full" aria-label={t("playAdhan")} />
                <p className="text-xs text-muted">{playing.label}{playing.credit ? ` · ${playing.credit}` : ""}{voice === "random" && files.length > 1 ? <> · <button className="font-semibold text-accent hover:underline" onClick={() => setPlaying(pickAdhan("random", files.filter((f) => f.id !== playing.id)))}>{t("another")}</button></> : null}</p>
              </div>
            ) : <p className="mt-3 text-sm text-muted">{t("adhanNone")}</p>}
            <p className="mt-3 text-xs text-muted">{t("remindNote")}</p>
          </section>
        </div>

        {/* Monthly timetable */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl">{t("monthTitle", { place: label(main) })}</h2>
            <div className="flex items-center gap-2 print:hidden">
              <button onClick={() => setMonthShift(monthShift - 1)} className="h-10 w-10 rounded-md border border-line hover:border-ink" aria-label={t("prevMonth")}><ArrowBack /></button>
              <span className="min-w-[9rem] text-center text-sm font-bold">{mDate.toLocaleDateString(locale, { calendar: "gregory", month: "long", year: "numeric" })}</span>
              <button onClick={() => setMonthShift(monthShift + 1)} className="h-10 w-10 rounded-md border border-line hover:border-ink" aria-label={t("nextMonth")}><ArrowNext /></button>
              <button onClick={() => window.print()} className="h-10 rounded-md border border-line px-3 text-sm font-semibold hover:border-ink">{t("print")}</button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-bg text-left text-xs uppercase tracking-[0.06em] text-muted"><tr><th className="p-3">{t("date")}</th>{PRAYERS.map((p) => <th key={p} className="p-3">{t(p)}</th>)}</tr></thead>
              <tbody className="divide-y divide-line bg-surface tabular-nums">
                {month.map((r) => {
                  const isToday = monthShift === 0 && r.date.getDate() === today.d;
                  return (
                    <tr key={r.date.getDate()} className={isToday ? "bg-accent-soft font-bold" : ""}>
                      <td className="p-3">{r.date.toLocaleDateString(locale, { calendar: "gregory", weekday: "short", day: "numeric" })}<span className="ms-2 text-xs font-normal text-muted">{hijriDate(new Date(r.date.getTime() + 12 * 3600000), locale, main.tz).replace(/\s*\d{4}.*$/, "")}</span></td>
                      {PRAYERS.map((p) => <td key={p} className="p-3" dir="ltr">{fmtTime(r.times[p], main.tz, locale)}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Settings */}
        <section className="mt-10 rounded-lg border border-line bg-surface p-5 sm:p-6 print:hidden">
          <h2 className="text-lg font-bold">{t("settings")}</h2>
          <p className="mt-1 text-sm text-muted">{t("settingsLead", { method: t(`m_${methodOf}`) })}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-1 text-sm"><span className="text-muted">{t("method")}</span>
              <select value={st.method} onChange={(e) => saveSt({ ...st, method: e.target.value as PrayerSettings["method"] })} className="h-10 rounded-md border border-line bg-bg px-2">
                <option value="auto">{t("auto")} ({t(`m_${main.method}`)})</option>
                {METHODS.map((m) => <option key={m} value={m}>{t(`m_${m}`)}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm"><span className="text-muted">{t("asr")}</span>
              <select value={st.madhab} onChange={(e) => saveSt({ ...st, madhab: e.target.value as PrayerSettings["madhab"] })} className="h-10 rounded-md border border-line bg-bg px-2">
                <option value="auto">{t("auto")}</option><option value="shafi">{t("shafi")}</option><option value="hanafi">{t("hanafi")}</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm"><span className="text-muted">{t("highLat")}</span>
              <select value={st.highLat} onChange={(e) => saveSt({ ...st, highLat: e.target.value as PrayerSettings["highLat"] })} className="h-10 rounded-md border border-line bg-bg px-2">
                <option value="auto">{t("auto")}</option><option value="middle">{t("hlMiddle")}</option><option value="seventh">{t("hlSeventh")}</option><option value="twilight">{t("hlTwilight")}</option>
              </select>
            </label>
          </div>
          <p className="mt-5 text-sm font-semibold">{t("adjust")}</p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {PRAYERS.map((p) => (
              <label key={p} className="grid gap-1 text-xs"><span className="text-muted">{t(p)}</span>
                <input type="number" min={-30} max={30} value={st.adjust[p] ?? 0} onChange={(e) => saveSt({ ...st, adjust: { ...st.adjust, [p]: Number(e.target.value) } })} className="h-10 rounded-md border border-line bg-bg px-2 text-sm tabular-nums" />
              </label>
            ))}
          </div>
          <button onClick={() => saveSt(DEFAULT_SETTINGS)} className="mt-4 text-sm text-muted underline">{t("reset")}</button>
        </section>

        {/* World cities */}
        <section className="mt-10 print:hidden">
          <h2 className="font-display text-3xl">{t("citiesTitle")}</h2>
          <ul className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {CITIES.map((c) => {
              const d = dayFor(c, now, { ...st, method: "auto", madhab: "auto" });
              return (
                <li key={c.id} className="bg-surface">
                  <button onClick={() => { pick(c.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full p-4 text-start hover:bg-bg ${main.id === c.id ? "bg-accent-soft" : ""}`}>
                    <div className="flex items-baseline justify-between gap-2"><span className="font-bold">{cityName(c, locale)}</span><span className="text-xs tabular-nums text-muted" dir="ltr">{fmtClock(now, c.tz).slice(0, 5)}</span></div>
                    <p className="mt-1 text-sm text-muted">{t(d.next)} · <span className="tabular-nums" dir="ltr">{fmtTime(d.nextAt, c.tz, locale)}</span></p>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-sm text-muted">{t("notice")}</p>
        </section>
      </main>
      <audio ref={playing ? undefined : adhanEl} className="hidden" />
    </div>
  );
}

// Arc of the day: the sun's path from sunrise to sunset (Dhuhr, Asr on it), Fajr and Isha below the horizon, a dot for "now"
function DayArc({ times, now, tz, locale, t }: { times: Record<Prayer, Date>; now: Date; tz: string; locale: string; t: ReturnType<typeof useTranslations> }) {
  const W = 560, base = 150, L = 90, R = W - 90, rx = (R - L) / 2, ry = 110;
  const rise = times.sunrise.getTime(), set = times.maghrib.getTime();
  const onArc = (ms: number) => { const f = Math.min(1, Math.max(0, (ms - rise) / (set - rise))); const a = Math.PI * (1 - f); return { x: L + rx + Math.cos(a) * rx, y: base - Math.sin(a) * ry }; };
  const pts: Record<Prayer, { x: number; y: number; below?: boolean }> = {
    fajr: { x: 28, y: base + 18, below: true }, sunrise: { x: L, y: base }, dhuhr: onArc(times.dhuhr.getTime()), asr: onArc(times.asr.getTime()), maghrib: { x: R, y: base }, isha: { x: W - 28, y: base + 18, below: true },
  };
  const n = now.getTime();
  const nowP = n < rise ? { x: 28 + ((L - 28) * Math.max(0, n - (rise - 3 * 3600000))) / (3 * 3600000), y: base + 18 } : n > set ? { x: R + ((W - 28 - R) * Math.min(1, (n - set) / (3 * 3600000))), y: base + 18 } : onArc(n);
  return (
    <svg viewBox={`0 0 ${W} ${base + 60}`} className="w-full" role="img" aria-label={t("arc")}>
      <path d={`M${L} ${base} A ${rx} ${ry} 0 0 1 ${R} ${base}`} fill="none" stroke="rgb(255 255 255 / .2)" strokeWidth="2" strokeDasharray="4 6" />
      <line x1="8" y1={base} x2={W - 8} y2={base} stroke="rgb(255 255 255 / .22)" />
      {PRAYERS.map((p) => {
        const q = pts[p], above = !q.below;
        return (
          <g key={p}>
            <circle cx={q.x} cy={q.y} r="5" fill="rgb(var(--gold))" />
            <text x={q.x} y={above ? q.y - 22 : q.y + 22} textAnchor="middle" fontSize="12" fontWeight="600" fill="rgb(255 255 255 / .8)">{t(p)}</text>
            <text x={q.x} y={above ? q.y - 9 : q.y + 36} textAnchor="middle" fontSize="11" fill="rgb(255 255 255 / .5)">{fmtTime(times[p], tz, locale)}</text>
          </g>
        );
      })}
      <circle cx={nowP.x} cy={nowP.y} r="16" fill="#fff" fillOpacity=".15" />
      <circle cx={nowP.x} cy={nowP.y} r="8" fill="#fff" />
    </svg>
  );
}
