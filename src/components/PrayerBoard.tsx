"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CITIES, DEFAULT_SETTINGS, METHODS, PRAYERS, cityName, countdown, dayFor, fmtClock, fmtTime, hijriDate, monthOf, nightOf, qiblaOf, spotToday, type Prayer, type PrayerSettings, type Spot } from "@/lib/prayer";
import { readJSON, writeJSON } from "@/lib/storage";
import { adhanList, adhanUrl, pickAdhan, type AdhanFile } from "@/lib/adhan";
import { ArrowNext, ArrowBack } from "./Icons";
import { PracticeWindow, starPath } from "./art/PracticeArt";

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

  if (!now) return (
    <section className="stage girih relative min-h-[560px] overflow-hidden text-[#eef0f3]">
      <div className="relative mx-auto max-w-6xl px-5 pt-10"><h1 className="font-display text-[34px] leading-none">{t("title")}</h1></div>
    </section>
  );
  const day = dayFor(main, now, st);
  const hijri = hijriDate(now, locale, main.tz);
  let hijriAr = "";
  try { hijriAr = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-arab", { timeZone: main.tz, day: "numeric", month: "long", year: "numeric" }).format(now); } catch { /* calendar not supported */ }
  const greg = new Intl.DateTimeFormat(locale, { timeZone: main.tz, calendar: "gregory", numberingSystem: "latn", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
  const night = nightOf(main, now, st);
  const qibla = qiblaOf(main);
  const current = [...PRAYERS].reverse().find((p) => p !== "sunrise" && day.times[p].getTime() <= now.getTime()) ?? "isha";
  const today = spotToday(now, main.tz);
  const mDate = new Date(today.y, today.m + monthShift, 1);
  const month = monthOf(main, mDate.getFullYear(), mDate.getMonth(), st);
  const methodOf = st.method === "auto" ? main.method : st.method;
  // the countdown ring runs from the last prayer time to the next one
  const past = PRAYERS.map((p) => day.times[p].getTime()).filter((x) => x <= now.getTime());
  const prevAt = past.length ? Math.max(...past) : day.times.isha.getTime() - 86400000;
  const frac = Math.min(1, Math.max(0, (now.getTime() - prevAt) / Math.max(1, day.nextAt.getTime() - prevAt)));
  const ar = locale === "ar";
  const card = "pa-card p-5 sm:p-6";

  return (
    <div>
      {/* Hero: place, the next prayer in an arch with its countdown ring, the sun's path across the day */}
      <section className={`${dark} girih relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 22% 30%, rgb(var(--gold) / .13) 0, transparent 42%)" }} />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-5 sm:pb-14 sm:pt-10">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <select value={main.id} onChange={(e) => pick(e.target.value)} aria-label={t("city")} className="h-11 max-w-full rounded-full border border-[rgb(214_180_108)]/40 bg-white/5 px-4 text-[15px] font-bold text-white">
                {spots.map((s) => <option key={s.id} value={s.id} className="text-ink">{label(s)}</option>)}
              </select>
              <button onClick={locate} className="pa-chip pa-chip-dark h-11">{t("useLocation")}</button>
            </div>
            {hijriAr && <p className="font-kufi text-[22px] leading-none text-[rgb(var(--gold))] sm:text-[26px]" dir="rtl" lang="ar">{hijriAr}</p>}
          </div>
          {geoMsg && <p className="mt-2 text-sm text-white/60" role="status">{geoMsg}</p>}

          <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-center lg:gap-12">
            <NextArch prayer={day.next} at={fmtTime(day.nextAt, main.tz, locale)} left={countdown(day.nextAt, now)} frac={frac} label={t("nextPrayer")} name={t(day.next)} ar={ar} />
            <div className="min-w-0">
              <p className="font-display text-[22px] leading-tight sm:text-3xl">{greg}</p>
              {hijri && !ar && <p className="mt-1 text-[15px] text-white/60">{hijri}</p>}
              <p className="mt-4 inline-flex items-baseline gap-3 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm text-white/65">{t("localTime")} <span className="font-display text-xl tabular-nums text-white" dir="ltr">{fmtClock(now, main.tz)}</span></p>
              <div className="mt-6"><DayArc times={day.times} now={now} tz={main.tz} locale={locale} t={t} /></div>
            </div>
          </div>

          <ul className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:grid-cols-6 sm:gap-3">
            {PRAYERS.map((p) => {
              const isNext = p === day.next, isNow = p === current && !isNext;
              return (
                <li key={p} className={`pa-arch-soft relative overflow-hidden border px-2 pb-3 pt-5 text-center transition ${isNext ? "border-transparent bg-gradient-to-b from-[#ecd7a2] to-[#c6a65e] text-[rgb(8_38_29)] shadow-[0_14px_30px_-16px_rgba(214,180,108,.8)]" : isNow ? "border-[rgb(214_180_108)]/60 bg-white/[0.07]" : "border-white/10 bg-white/[0.035]"}`}>
                  {!ar && <p className={`font-callig text-[17px] leading-none ${isNext ? "text-[rgb(8_38_29)]/70" : "text-[rgb(var(--gold))]/80"}`} dir="rtl" lang="ar">{AR_NAME[p]}</p>}
                  <p className={`mt-1.5 truncate text-[12px] font-semibold ${isNext ? "" : "text-white/65"}`}>{t(p)}{isNow ? ` · ${t("now")}` : ""}</p>
                  <p className="mt-0.5 font-display text-[22px] tabular-nums leading-tight sm:text-2xl" dir="ltr">{fmtTime(day.times[p], main.tz, locale)}</p>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="pa-arcade" />
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-5">
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Qibla */}
          <section className={card}>
            <h2 className="text-lg font-bold">{t("qibla")}</h2>
            <div className="mt-4 flex items-center gap-5">
              <Compass qibla={qibla} heading={heading} />
              <div className="min-w-0"><p className="font-display text-4xl tabular-nums text-gold">{Math.round(qibla)}°</p><p className="mt-1 text-sm leading-snug text-muted">{t("qiblaHint")}</p></div>
            </div>
            <button onClick={startCompass} className="mt-4 text-sm font-semibold text-accent hover:underline">{heading !== null ? t("compassOn") : t("compass")}</button>
          </section>

          {/* Night and sunnah times */}
          <section className={card}>
            <h2 className="flex items-center gap-2 text-lg font-bold"><svg viewBox="0 0 24 24" className="h-5 w-5 text-gold" aria-hidden><path d="M15.5 3.5a8.5 8.5 0 1 0 5 15 7 7 0 1 1-5-15z" fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1.4" /></svg>{t("sunnahTitle")}</h2>
            <dl className="mt-4 grid gap-3 text-[15px]">
              {[[t("duha"), `${fmtTime(night.duha, main.tz, locale)} – ${fmtTime(new Date(day.times.dhuhr.getTime() - 10 * 60000), main.tz, locale)}`], [t("midnight"), fmtTime(night.midnight, main.tz, locale)], [t("lastThird"), fmtTime(night.lastThird, main.tz, locale)]].map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-2"><dt className="text-muted">{k}</dt><span aria-hidden className="mb-1 min-w-4 flex-1 border-b border-dotted border-[rgb(var(--gold))]/40" /><dd className="font-bold tabular-nums" dir="ltr">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-muted">{t("sunnahNote")}</p>
          </section>

          {/* Reminders and adhan */}
          <section className={card}>
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
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl">{t("monthTitle", { place: label(main) })}</h2>
            <div className="flex items-center gap-2 print:hidden">
              <button onClick={() => setMonthShift(monthShift - 1)} className="grid h-10 w-10 place-items-center rounded-full border border-line hover:border-[rgb(var(--gold))]" aria-label={t("prevMonth")}><ArrowBack /></button>
              <span className="min-w-[9rem] text-center text-sm font-bold">{mDate.toLocaleDateString(locale, { calendar: "gregory", month: "long", year: "numeric" })}</span>
              <button onClick={() => setMonthShift(monthShift + 1)} className="grid h-10 w-10 place-items-center rounded-full border border-line hover:border-[rgb(var(--gold))]" aria-label={t("nextMonth")}><ArrowNext /></button>
              <button onClick={() => window.print()} className="pa-chip h-10">{t("print")}</button>
            </div>
          </div>
          <div className="pa-card pa-plain mt-5 overflow-x-auto">
            <table className="relative w-full min-w-[620px] text-sm">
              <thead className="text-start text-xs uppercase tracking-[0.06em] text-muted rtl:tracking-normal"><tr className="border-b border-[rgb(var(--gold))]/30"><th className="p-3 text-start">{t("date")}</th>{PRAYERS.map((p) => <th key={p} className="p-3 text-start">{t(p)}</th>)}</tr></thead>
              <tbody className="divide-y divide-line tabular-nums">
                {month.map((r) => {
                  const isToday = monthShift === 0 && r.date.getDate() === today.d;
                  const fri = r.date.getDay() === 5;
                  return (
                    <tr key={r.date.getDate()} className={isToday ? "bg-[rgb(201_166_94)]/15 font-bold" : fri ? "bg-[rgb(var(--gold))]/[0.04]" : ""}>
                      <td className="p-3"><span className="inline-flex items-center gap-1.5">{isToday && <svg viewBox="0 0 12 12" className="h-3 w-3 text-gold" aria-hidden><path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill="currentColor" /></svg>}{r.date.toLocaleDateString(locale, { calendar: "gregory", weekday: "short", day: "numeric" })}</span><span className="ms-2 text-xs font-normal text-muted">{hijriDate(new Date(r.date.getTime() + 12 * 3600000), locale, main.tz).replace(/\s*\d{4}.*$/, "")}</span></td>
                      {PRAYERS.map((p) => <td key={p} className="p-3" dir="ltr">{fmtTime(r.times[p], main.tz, locale)}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Settings */}
        <section className={`${card} mt-12 print:hidden`}>
          <h2 className="text-lg font-bold">{t("settings")}</h2>
          <p className="mt-1 text-sm text-muted">{t("settingsLead", { method: t(`m_${methodOf}`) })}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="grid min-w-0 gap-1 text-sm"><span className="text-muted">{t("method")}</span>
              <select value={st.method} onChange={(e) => saveSt({ ...st, method: e.target.value as PrayerSettings["method"] })} className="h-10 min-w-0 rounded-md border border-line bg-bg px-2">
                <option value="auto">{t("auto")} ({t(`m_${main.method}`)})</option>
                {METHODS.map((m) => <option key={m} value={m}>{t(`m_${m}`)}</option>)}
              </select>
            </label>
            <label className="grid min-w-0 gap-1 text-sm"><span className="text-muted">{t("asr")}</span>
              <select value={st.madhab} onChange={(e) => saveSt({ ...st, madhab: e.target.value as PrayerSettings["madhab"] })} className="h-10 min-w-0 rounded-md border border-line bg-bg px-2">
                <option value="auto">{t("auto")}</option><option value="shafi">{t("shafi")}</option><option value="hanafi">{t("hanafi")}</option>
              </select>
            </label>
            <label className="grid min-w-0 gap-1 text-sm"><span className="text-muted">{t("highLat")}</span>
              <select value={st.highLat} onChange={(e) => saveSt({ ...st, highLat: e.target.value as PrayerSettings["highLat"] })} className="h-10 min-w-0 rounded-md border border-line bg-bg px-2">
                <option value="auto">{t("auto")}</option><option value="middle">{t("hlMiddle")}</option><option value="seventh">{t("hlSeventh")}</option><option value="twilight">{t("hlTwilight")}</option>
              </select>
            </label>
          </div>
          <p className="mt-5 text-sm font-semibold">{t("adjust")}</p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {PRAYERS.map((p) => (
              <label key={p} className="grid min-w-0 gap-1 text-xs"><span className="truncate text-muted">{t(p)}</span>
                <input type="number" min={-30} max={30} value={st.adjust[p] ?? 0} onChange={(e) => saveSt({ ...st, adjust: { ...st.adjust, [p]: Number(e.target.value) } })} className="h-10 min-w-0 rounded-md border border-line bg-bg px-2 text-sm tabular-nums" />
              </label>
            ))}
          </div>
          <button onClick={() => saveSt(DEFAULT_SETTINGS)} className="mt-4 text-sm text-muted underline">{t("reset")}</button>
        </section>

        {/* World cities */}
        <section className="mt-12 print:hidden">
          <h2 className="font-display text-3xl">{t("citiesTitle")}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CITIES.map((c) => {
              const d = dayFor(c, now, { ...st, method: "auto", madhab: "auto" });
              const on = main.id === c.id;
              return (
                <li key={c.id}>
                  <button onClick={() => { pick(c.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`pa-card pa-plain pa-card-hover flex w-full items-center gap-3 p-4 text-start ${on ? "!border-[rgb(201_166_94)] shadow-[0_0_0_3px_rgb(201_166_94/0.14)]" : ""}`}>
                    <svg viewBox="0 0 28 36" className={`h-9 w-7 shrink-0 ${on ? "text-gold" : "text-[rgb(var(--gold))]/55"}`} aria-hidden><path d="M3 35V15C3 8 8 4 14 1.5 20 4 25 8 25 15v20" fill="currentColor" fillOpacity={on ? ".18" : ".06"} stroke="currentColor" strokeWidth="1.3" /><path d="M14 13l1.3 2.8 2.8 1.3-2.8 1.3L14 21.2l-1.3-2.8-2.8-1.3 2.8-1.3z" fill="currentColor" /></svg>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2"><span className="truncate font-bold">{cityName(c, locale)}</span><span className="shrink-0 text-xs tabular-nums text-muted" dir="ltr">{fmtClock(now, c.tz).slice(0, 5)}</span></span>
                      <span className="mt-0.5 block text-sm text-muted">{t(d.next)} · <span className="tabular-nums" dir="ltr">{fmtTime(d.nextAt, c.tz, locale)}</span></span>
                    </span>
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

const AR_NAME: Record<Prayer, string> = { fajr: "الفجر", sunrise: "الشروق", dhuhr: "الظهر", asr: "العصر", maghrib: "المغرب", isha: "العشاء" };

// The next prayer stands in a mihrab arch; a gold ring around it fills from the last prayer time to the next one
function NextArch({ prayer, at, left, frac, label, name, ar }: { prayer: Prayer; at: string; left: string; frac: number; label: string; name: string; ar: boolean }) {
  const r = 78, C = 2 * Math.PI * r, a = frac * Math.PI * 2 - Math.PI / 2;
  const tip = { x: 120 + r * Math.cos(a), y: 196 + r * Math.sin(a) };
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[340px]">
      <PracticeWindow uid="pb-next" lamp className="absolute inset-0 h-full w-full" />
      <svg viewBox="0 0 240 320" aria-hidden className="absolute inset-0 h-full w-full">
        <defs><linearGradient id="pb-ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e7bf" /><stop offset=".5" stopColor="#c9a65e" /><stop offset="1" stopColor="#efe2bf" /></linearGradient></defs>
        <circle cx="120" cy="196" r="88" fill="rgb(5 28 21 / .55)" />
        <circle cx="120" cy="196" r={r} fill="none" stroke="rgb(255 255 255 / .1)" strokeWidth="3" />
        {Array.from({ length: 24 }, (_, i) => { const b = (Math.PI / 12) * i; return <path key={i} d={`M${(120 + 84 * Math.cos(b)).toFixed(1)} ${(196 + 84 * Math.sin(b)).toFixed(1)}L${(120 + (i % 2 ? 86 : 88) * Math.cos(b)).toFixed(1)} ${(196 + (i % 2 ? 86 : 88) * Math.sin(b)).toFixed(1)}`} stroke="#d6b46c" strokeOpacity=".5" strokeWidth=".8" />; })}
        <circle cx="120" cy="196" r={r} fill="none" stroke="url(#pb-ring)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${(frac * C).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 120 196)" className="transition-[stroke-dasharray] duration-1000" />
        <circle className="pa-pulse-dot" cx={tip.x} cy={tip.y} r="5" fill="#f3e2b6" />
        <circle cx={tip.x} cy={tip.y} r="3.4" fill="#fff8e6" />
      </svg>
      <div className="absolute start-1/2 top-[61.25%] grid w-[60%] -translate-y-1/2 justify-items-center text-center ltr:-translate-x-1/2 rtl:translate-x-1/2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))] rtl:text-[12px] rtl:tracking-normal sm:text-[11px]">{label}</p>
        {!ar && <p className="font-callig mt-1 text-[22px] leading-none text-[rgb(var(--gold))] sm:text-[26px]" dir="rtl" lang="ar">{AR_NAME[prayer]}</p>}
        <h1 className={`font-display mt-1 max-w-full leading-none ${name.length > 9 ? "text-[22px] sm:text-[26px]" : "text-[34px] sm:text-[40px]"}`}>{name}</h1>
        <p className="mt-2 font-display text-[22px] tabular-nums leading-none text-[#f3e2b6] sm:text-[26px]" dir="ltr">{left}</p>
        <p className="mt-1.5 text-[13px] tabular-nums text-white/60" dir="ltr">{at}</p>
      </div>
    </div>
  );
}

// Compass: a gilded sixteen-point rose turns with the device; the needle points to the Kaaba
function Compass({ qibla, heading }: { qibla: number; heading: number | null }) {
  return (
    <div className="relative grid h-32 w-32 shrink-0 place-items-center" style={{ transform: heading !== null ? `rotate(${-heading}deg)` : undefined }}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d={starPath(60, 60, 58, 50, 16)} fill="rgb(var(--gold) / .08)" stroke="rgb(var(--gold))" strokeOpacity=".55" strokeWidth=".8" />
        <circle cx="60" cy="60" r="44" fill="rgb(var(--surface))" stroke="rgb(var(--gold))" strokeOpacity=".45" />
        <circle cx="60" cy="60" r="38" fill="none" stroke="rgb(var(--gold))" strokeOpacity=".3" strokeDasharray="1 3" />
        {Array.from({ length: 8 }, (_, i) => { const b = (Math.PI / 4) * i; return <path key={i} d={`M${(60 + 44 * Math.sin(b)).toFixed(1)} ${(60 - 44 * Math.cos(b)).toFixed(1)}L${(60 + 40 * Math.sin(b)).toFixed(1)} ${(60 - 40 * Math.cos(b)).toFixed(1)}`} stroke="rgb(var(--gold))" strokeWidth={i % 2 ? 0.8 : 1.4} />; })}
        <text x="60" y="27" textAnchor="middle" fontSize="9" fontWeight="700" fill="rgb(var(--muted))">N</text>
      </svg>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" style={{ transform: `rotate(${qibla}deg)` }} aria-hidden>
        <path d="M60 24L66 60 60 55 54 60Z" fill="#c9a65e" />
        <path d="M60 96L66 60 60 65 54 60Z" fill="rgb(var(--muted))" fillOpacity=".35" />
        <g transform="translate(52 10)"><rect width="16" height="15" rx="1.5" fill="#111" /><rect y="4" width="16" height="2.2" fill="#d6b46c" /></g>
        <circle cx="60" cy="60" r="4" fill="rgb(var(--surface))" stroke="#c9a65e" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Arc of the day: the sun's path from sunrise to sunset (Dhuhr and Asr on it), Fajr and Isha below the horizon.
// The part of the path already travelled is gilded; the sun (or the crescent at night) marks "now".
function DayArc({ times, now, tz, locale, t }: { times: Record<Prayer, Date>; now: Date; tz: string; locale: string; t: ReturnType<typeof useTranslations> }) {
  const W = 560, base = 150, L = 90, R = W - 90, rx = (R - L) / 2, ry = 110;
  const rise = times.sunrise.getTime(), set = times.maghrib.getTime();
  const onArc = (ms: number) => { const f = Math.min(1, Math.max(0, (ms - rise) / (set - rise))); const a = Math.PI * (1 - f); return { x: L + rx + Math.cos(a) * rx, y: base - Math.sin(a) * ry }; };
  const pts: Record<Prayer, { x: number; y: number; below?: boolean }> = {
    fajr: { x: 28, y: base + 18, below: true }, sunrise: { x: L, y: base }, dhuhr: onArc(times.dhuhr.getTime()), asr: onArc(times.asr.getTime()), maghrib: { x: R, y: base }, isha: { x: W - 28, y: base + 18, below: true },
  };
  const n = now.getTime();
  const isDay = n >= rise && n <= set;
  const nowP = n < rise ? { x: 28 + ((L - 28) * Math.max(0, n - (rise - 3 * 3600000))) / (3 * 3600000), y: base + 18 } : n > set ? { x: R + ((W - 28 - R) * Math.min(1, (n - set) / (3 * 3600000))), y: base + 18 } : onArc(n);
  const travelled = n <= rise ? "" : `M${L} ${base} A ${rx} ${ry} 0 0 1 ${(n >= set ? R : nowP.x).toFixed(1)} ${(n >= set ? base : nowP.y).toFixed(1)}`;
  return (
    <svg viewBox={`0 0 ${W} ${base + 60}`} className="w-full" role="img" aria-label={t("arc")}>
      <defs>
        <linearGradient id="pb-horizon" x1="0" x2="1"><stop offset="0" stopColor="#d6b46c" stopOpacity="0" /><stop offset=".5" stopColor="#d6b46c" stopOpacity=".8" /><stop offset="1" stopColor="#d6b46c" stopOpacity="0" /></linearGradient>
        <radialGradient id="pb-sky" cx="50%" cy="100%" r="70%"><stop offset="0" stopColor="#e9cf99" stopOpacity=".16" /><stop offset="1" stopColor="#e9cf99" stopOpacity="0" /></radialGradient>
        <linearGradient id="pb-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1631" stopOpacity=".45" /><stop offset="1" stopColor="#0b1631" stopOpacity="0" /></linearGradient>
      </defs>
      <path d={`M${L} ${base} A ${rx} ${ry} 0 0 1 ${R} ${base} Z`} fill="url(#pb-sky)" />
      <rect x="8" y={base} width={W - 16} height="56" fill="url(#pb-night)" />
      <path d={`M${L} ${base} A ${rx} ${ry} 0 0 1 ${R} ${base}`} fill="none" stroke="rgb(255 255 255 / .22)" strokeWidth="1.5" strokeDasharray="3 6" />
      {travelled && <path d={travelled} fill="none" stroke="#d6b46c" strokeWidth="2.4" strokeLinecap="round" />}
      <line x1="8" y1={base} x2={W - 8} y2={base} stroke="url(#pb-horizon)" />
      {PRAYERS.map((p) => {
        const q = pts[p], above = !q.below;
        return (
          <g key={p}>
            <path d={starPath(q.x, q.y, 6.5, 2.8)} fill="#d6b46c" />
            <text x={q.x} y={above ? q.y - 24 : q.y + 24} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="rgb(255 255 255 / .82)">{t(p)}</text>
            <text x={q.x} y={above ? q.y - 10 : q.y + 38} textAnchor="middle" fontSize="11.5" fill="rgb(255 255 255 / .5)">{fmtTime(times[p], tz, locale)}</text>
          </g>
        );
      })}
      {isDay ? (
        <g>
          <circle className="pa-sun-glow" cx={nowP.x} cy={nowP.y} r="24" fill="#ffe7a8" fillOpacity=".35" />
          <path d={starPath(nowP.x, nowP.y, 14, 9, 12)} fill="#f3d58e" />
          <circle cx={nowP.x} cy={nowP.y} r="8" fill="#fff4d6" />
        </g>
      ) : (
        <g>
          <circle className="pa-sun-glow" cx={nowP.x} cy={nowP.y} r="18" fill="#e3eaff" fillOpacity=".18" />
          <path d={`M${nowP.x + 4} ${nowP.y - 11}a11 11 0 1 0 0 22 8.5 8.5 0 1 1 0-22z`} fill="#f3e2b6" />
        </g>
      )}
    </svg>
  );
}
