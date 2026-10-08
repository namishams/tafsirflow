"use client";
import { useLocale, useTranslations } from "next-intl";
import { IconNext, IconPause, IconPlay, IconPrev } from "./Icons";
import { STATIONS, useRadio } from "./RadioProvider";
import { reciterName } from "@/lib/quran";
import { QuranOrb, QuranSeal } from "./art/QuranArt";

// jewel tones of Islamic art (emerald, lapis, garnet, Iznik turquoise, amber, aubergine, olive)
const J = { emerald: "linear-gradient(165deg,#13644b 0%,#073024 55%,#04190f 100%)", lapis: "linear-gradient(165deg,#244a86 0%,#0e2348 55%,#070f22 100%)", garnet: "linear-gradient(165deg,#7a2433 0%,#3a0d16 55%,#1a0509 100%)", turquoise: "linear-gradient(165deg,#0f6b6c 0%,#06393b 55%,#031b1c 100%)", amber: "linear-gradient(165deg,#7c5617 0%,#3b2707 55%,#1c1203 100%)", aubergine: "linear-gradient(165deg,#4d2760 0%,#25102f 55%,#110616 100%)", olive: "linear-gradient(165deg,#4f5a22 0%,#262c0d 55%,#111405 100%)" };
// station posters: calligraphy and colour per station
const POSTER: Record<string, { ar: string; bg: string }> = {
  quran: { ar: "القرآن", bg: J.emerald },
  juzamma: { ar: "عمّ", bg: J.amber },
  kahf: { ar: "الكهف", bg: J.lapis },
  yasin: { ar: "يس", bg: J.garnet },
  rahman: { ar: "الرحمن", bg: J.turquoise },
  mulk: { ar: "الملك", bg: J.aubergine },
  random: { ar: "مفاجأة", bg: J.garnet },
  quranmix: { ar: "أصوات", bg: J.turquoise },
  randommix: { ar: "تنوع", bg: J.amber },
  juzammamix: { ar: "عمّ", bg: J.aubergine },
  tabarak: { ar: "تبارك", bg: J.lapis },
  kids: { ar: "أطفال", bg: J.olive },
  night: { ar: "الليل", bg: J.lapis },
  friday: { ar: "الجمعة", bg: J.amber },
  prophets: { ar: "الأنبياء", bg: J.garnet },
  beloved: { ar: "المحبوبة", bg: J.aubergine },
  dhikr: { ar: "الحفظ", bg: J.emerald },
  waqiah: { ar: "الواقعة", bg: J.turquoise },
  baqarah: { ar: "البقرة", bg: J.amber },
  maryam: { ar: "مريم", bg: J.aubergine },
  yusuf: { ar: "يوسف", bg: J.amber },
  juzday: { ar: "جزء", bg: J.emerald },
  juz28: { ar: "قد سمع", bg: J.lapis },
  revelation: { ar: "اقرأ", bg: J.olive },
  ramadan: { ar: "رمضان", bg: J.lapis },
  comfort: { ar: "الضحى", bg: J.amber },
  fath: { ar: "الفتح", bg: J.emerald },
  hujurat: { ar: "الحجرات", bg: J.olive },
  luqman: { ar: "لقمان", bg: J.garnet },
  insan: { ar: "الإنسان", bg: J.turquoise },
  muzzammil: { ar: "المزمل", bg: J.lapis },
  hashr: { ar: "الحشر", bg: J.garnet },
  taha: { ar: "طه", bg: J.aubergine },
  sajdah: { ar: "السجدة", bg: J.turquoise },
};
const GROUPS = ["main", "mix", "theme", "surah"] as const;
const initials = (name: string) => {
  const words = name.split(/\s+/).filter(Boolean);
  if (/[\u0600-\u06FF]/.test(name)) return words.length > 1 ? `${words[0][0]}${words[words.length - 1][0]}` : words[0]?.[0] ?? ""; // Arabic names: first and last word
  return words.filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");
};

// Radio page: the engine lives in RadioProvider (above all pages), so playback continues when you leave this page
export default function RadioPlayer() {
  const t = useTranslations("radio");
  const ts = useTranslations("social");
  const locale = useLocale();
  const r = useRadio();
  const rn = (x: { slug?: string; folder?: string; name: string }) => reciterName(x, locale);
  const { station, playing, now, chapter, verse, upNext, history, chapters } = r;
  const nameOf = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${locale === "ar" ? "سورة" : "Surah"} ${s}`;
  const field = "h-11 w-full min-w-0 rounded-md border border-line bg-bg px-3 text-[15px]";

  return (
    <div>
      {/* On-air stage */}
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 75% 30%, rgb(var(--gold) / .14) 0, transparent 45%), radial-gradient(circle at 5% 95%, rgb(var(--accent) / .25) 0, transparent 45%)" }} />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-8 sm:pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-extrabold tracking-wider ${playing ? "bg-red-600 text-white" : "bg-white/10 text-white/60"}`}>
                {playing && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}{playing ? t("onAir") : t("off")}
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">{t("title")} · {r.stationName(station.id)}</span>
            </div>
            <h1 className="font-display mt-4 text-5xl leading-[1.02] sm:text-6xl">{chapter ? chapter.name_simple : `${now.s}`}<span className="text-white/40"> · {now.v}</span></h1>
            <p className="mt-2 text-white/60">{rn(r.reciter)}</p>
            {r.showText && verse && (
              <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <p className="font-arabic text-3xl leading-[2.1] sm:text-4xl" dir="rtl">{verse.text_uthmani}</p>
                {verse.translation && <p className="mt-3 text-[15px] leading-relaxed text-white/70">{verse.translation}</p>}
              </div>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button onClick={r.prevVerse} aria-label={t("prev")} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 hover:border-white"><IconPrev /></button>
              <button onClick={r.toggle} aria-label={playing ? t("pause") : t("play")} className="grid h-16 w-16 place-items-center rounded-full bg-[rgb(var(--gold))] text-[rgb(var(--stage))] shadow-lg hover:brightness-110">{playing ? <IconPause /> : <IconPlay />}</button>
              <button onClick={r.skipVerse} aria-label={t("nextVerse")} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 hover:border-white"><IconNext /></button>
              <button onClick={r.skipSurah} className="h-12 rounded-full border border-white/30 px-5 text-sm font-bold hover:border-white">{t("nextSurah")}</button>
              {r.castable.airplay && <button onClick={r.airplay} aria-label="AirPlay" title="AirPlay" className="grid h-12 w-12 place-items-center rounded-full border border-white/20 hover:border-white"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" /><path d="M12 15l5 6H7z" fill="currentColor" /></svg></button>}
              {r.castable.cast && <button onClick={r.cast} aria-label="Chromecast" title="Chromecast" className="grid h-12 w-12 place-items-center rounded-full border border-white/20 hover:border-white"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" /><path d="M2 12a9 9 0 0 1 8 8M2 16a5 5 0 0 1 4 4" /><circle cx="2.5" cy="19.5" r="0.8" fill="currentColor" /></svg></button>}
              <button onClick={() => r.shareRadio(`${locale === "ar" ? "إذاعة Quran Masterclass" : "Quran Masterclass Radio"} – ${r.stationName(station.id)}`)} aria-label={ts("share")} title={ts("share")} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 hover:border-white"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg></button>
              <label className="ms-auto flex items-center gap-2 text-sm text-white/60">
                <span className="sr-only sm:not-sr-only">{t("volume")}</span>
                <input type="range" min={0} max={1} step={0.05} value={r.vol} onChange={(e) => r.setVolume(Number(e.target.value))} className="w-28 accent-[rgb(var(--gold))]" aria-label={t("volume")} />
              </label>
            </div>
            {r.started && <p className="mt-5 text-sm text-white/60"><span className="font-semibold text-white">{t("upNext")}:</span> {upNext.s}. {nameOf(upNext.s)} · {upNext.v}</p>}
          </div>

          {/* reciter orb: the shamsa turns, rings pulse and the bars move while the station is on air */}
          <div className="flex justify-center">
            <div className={`radio-orb relative grid aspect-square w-full max-w-[17rem] place-items-center sm:max-w-[20rem] ${playing ? "is-on" : ""}`}>
              <span className="ring r1" /><span className="ring r2" /><span className="ring r3" />
              <QuranOrb on={playing} className="w-full">
                <span className="q-orb-txt block pb-2 text-[44px] leading-none sm:text-[54px]">{initials(rn(r.reciter))}</span>
              </QuranOrb>
              <span className="bars absolute bottom-[19%] flex h-8 items-end gap-1" aria-hidden>{Array.from({ length: 7 }, (_, i) => <i key={i} />)}</span>
            </div>
          </div>
        </div>

        {/* reciters strip */}
        <div className="relative mx-auto max-w-6xl px-4 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">{t("reciters")}</p>
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {r.reciters.map((x) => {
              const on = x.folder === r.reciter.folder;
              return (
                <li key={x.folder} className="min-w-0">
                  <button onClick={() => r.changeReciter(x.folder)} className={`flex w-full flex-col items-center gap-2 rounded-lg p-3 text-center transition ${on ? "bg-white/[0.07] shadow-[inset_0_0_0_1px_rgb(214_180_108/0.35)]" : "hover:bg-white/5"}`} aria-pressed={on}>
                    <QuranSeal on={on} className="!h-16 !w-16">{initials(rn(x))}</QuranSeal>
                    <span className={`line-clamp-2 text-xs font-semibold leading-snug ${on ? "text-white" : "text-white/70"}`}>{rn(x)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <span aria-hidden className="q-arcade opacity-60" />
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10">
        {r.banner && (
          <div role="status" className="mb-8 rounded-lg callout p-4">
            <p className="text-[13px] font-bold text-accent">{t("adhanNow")}</p>
            <p className="font-display text-2xl">{t(`p_${r.banner}`)}</p>
            {r.adhanCredit && <p className="mt-1 text-xs text-muted">{r.adhanCredit}</p>}
          </div>
        )}

        {/* stations as posters, grouped */}
        <h2 className="font-display text-3xl">{t("stations")}</h2>
        <p className="mt-2 text-[15px] text-muted">{t("stationsLead", { n: STATIONS.length })}</p>
        {GROUPS.map((g) => (
          <section key={g} className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{t(`g_${g}`)}</h3>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {STATIONS.filter((st) => st.group === g).map((st) => {
                const p = POSTER[st.id] ?? POSTER.quran, on = station.id === st.id && playing;
                return (
                  <li key={st.id} className="min-w-0">
                    <button onClick={() => r.chooseStation(st)} aria-pressed={on} className={`q-poster group flex aspect-[4/5] w-full flex-col justify-end p-4 text-start sm:p-5 ${on ? "is-on" : ""}`} style={{ background: p.bg }}>
                      <svg aria-hidden viewBox="0 0 100 110" preserveAspectRatio="none" className="q-poster-arch"><g fill="none" stroke="currentColor" strokeWidth=".8" vectorEffect="non-scaling-stroke"><path d="M4 110V48C4 24 26 9 50 2c24 7 46 22 46 46v62" /><path d="M11 110V50c0-20 19-33 39-39 20 6 39 19 39 39v60" strokeOpacity=".55" /></g></svg>
                      <span aria-hidden className={`q-poster-word ${p.ar.length > 6 ? "text-[30px] sm:text-[38px]" : p.ar.length > 3 ? "text-[38px] sm:text-[50px]" : "text-[48px] sm:text-[62px]"}`} dir="rtl">{p.ar}</span>
                      <span className="q-poster-play absolute start-4 top-4">{on ? <span className="eq eq-on" aria-hidden><i /><i /><i /><i /></span> : <IconPlay />}</span>
                      {st.mix && <span className="absolute end-4 top-5 rounded-full border border-[rgb(233_207_153/0.45)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#f3e2b6] rtl:tracking-normal">{t("mixBadge")}</span>}
                      <span className="font-display relative text-[18px] leading-tight text-white sm:text-[22px]">{r.stationName(st.id)}</span>
                      <span className="relative mt-1 line-clamp-2 text-[12.5px] leading-snug text-white/65 sm:text-sm">{t(`sd_${st.id}`)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* settings */}
          <section className="callout rounded-xl p-5 sm:p-6">
            <h2 className="q-kicker text-[rgb(var(--q-ink-gold))]">{t("settings")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm"><span className="text-muted">{t("sleep")}</span>
                <select value={r.sleepLeft ? "on" : "0"} onChange={(e) => r.setSleepLeft(e.target.value === "0" ? 0 : Number(e.target.value) * 60)} className={field}>
                  <option value="0">{r.sleepLeft ? `${Math.ceil(r.sleepLeft / 60)} ${t("min")}` : t("off")}</option>
                  {r.sleepOptions.map((m) => <option key={m} value={m}>{m} {t("min")}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm"><span className="text-muted">{t("adhan")}</span>
                <select value={r.adhanMode} onChange={(e) => r.setAdhanMode(e.target.value as typeof r.adhanMode)} className={field}>
                  <option value="off">{t("off")}</option>
                  <option value="makkah">{t("adhanMakkah")}</option>
                  <option value="dubai">{t("adhanDubai")}</option>
                  <option value="mine">{t("adhanMine")}</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm sm:col-span-2"><span className="text-muted">{t("adhanVoice")}</span>
                <span className="flex gap-2">
                  <select value={r.voice} onChange={(e) => r.setVoice(e.target.value)} className={field}>
                    <option value="random">{t("random")}</option>
                    {r.adhanFiles.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                  <button type="button" onClick={r.testAdhan} disabled={r.adhanFiles.length === 0} className="h-11 shrink-0 rounded-md border border-line px-4 text-sm font-semibold hover:border-ink disabled:opacity-40">{t("test")}</button>
                </span>
              </label>
              <label className="flex items-start gap-3 text-[15px] sm:col-span-2"><input type="checkbox" className="mt-1" checked={r.mix} onChange={(e) => r.setMix(e.target.checked)} /><span>{t("mixAll")}</span></label>
              <label className="flex items-center gap-3 text-[15px] sm:col-span-2"><input type="checkbox" checked={r.showText} onChange={(e) => r.setShowText(e.target.checked)} />{t("showText")}</label>
            </div>
            {r.adhanMode !== "off" && r.adhanFiles.length === 0 && <p className="mt-4 text-sm text-muted">{t("adhanMissing")}</p>}
            {r.adhanCredit && !r.banner && <p className="mt-3 text-xs text-muted">{r.adhanCredit}</p>}
          </section>

          {/* recently played */}
          <section className="callout rounded-xl p-5 sm:p-6">
            <h2 className="q-kicker text-[rgb(var(--q-ink-gold))]">{t("recent")}</h2>
            {history.length > 1 ? (
              <ul className="mt-3 divide-y divide-[rgb(201_166_94/0.18)] text-sm">
                {history.slice(1).map((h, i) => <li key={`${h.s}:${h.v}:${i}`} className="flex items-center gap-3 py-2.5"><span className="w-7 shrink-0 text-end text-[12px] font-semibold tabular-nums text-[rgb(var(--q-ink-gold))]">{h.s}</span><span className="min-w-0 flex-1 truncate">{nameOf(h.s)}</span><span className="tabular-nums text-muted">{h.v}</span></li>)}
              </ul>
            ) : <p className="mt-2 text-sm text-muted">{t("recentNone")}</p>}
          </section>
        </div>
      </main>
    </div>
  );
}
