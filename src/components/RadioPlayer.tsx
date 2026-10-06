"use client";
import { useTranslations } from "next-intl";
import { IconNext, IconPause, IconPlay, IconPrev } from "./Icons";
import { STATIONS, useRadio } from "./RadioProvider";

const Eq = ({ on }: { on: boolean }) => (
  <span className={`eq ${on ? "eq-on" : ""}`} aria-hidden><i /><i /><i /><i /></span>
);

// Radio page: the engine lives in RadioProvider (above all pages), so playback continues when you leave this page
export default function RadioPlayer() {
  const t = useTranslations("radio");
  const r = useRadio();
  const { station, playing, now, chapter, verse, upNext, history, chapters } = r;
  const nameOf = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `Surah ${s}`;

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-[34px] leading-none">{t("title")}</h1>
        <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-extrabold tracking-wider ${playing ? "bg-red-600 text-white" : "bg-line text-muted"}`}>
          {playing && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}{playing ? t("onAir") : t("off")}
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{t("lead")}</p>

      {r.banner && (
        <div role="status" className="mt-6 rounded-lg border border-line border-s-4 border-s-accent bg-surface p-4">
          <p className="text-[13px] font-bold text-accent">{t("adhanNow")}</p>
          <p className="font-display text-2xl">{t(`p_${r.banner}`)}</p>
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 bg-ink px-5 py-3 text-bg">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-bg/15 text-[10px] font-extrabold tracking-wider">FM</span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">{t("station")}</p>
              <p className="text-[15px] font-bold leading-tight">{r.stationName(station.id)}</p>
            </div>
          </div>
          <Eq on={playing} />
        </div>
        <div className="p-5 sm:p-7">
          <p className="eyebrow">{t("nowPlaying")}</p>
          <h2 className="font-display mt-2 text-3xl leading-tight sm:text-4xl">{chapter ? `${chapter.id}. ${chapter.name_simple}` : `${now.s}`} <span className="text-muted">· {now.v}</span></h2>
          <p className="mt-1 text-sm text-muted">{r.reciter.name}</p>
          {r.showText && verse && (
            <div className="mt-6 border-t border-line pt-5">
              <p className="font-arabic text-3xl leading-[2.1] sm:text-4xl" dir="rtl">{verse.text_uthmani}</p>
              {verse.translation && <p className="mt-3 text-[15px] leading-relaxed text-muted">{verse.translation}</p>}
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={r.prevVerse} aria-label={t("prev")} className="grid h-11 w-11 place-items-center rounded-full border border-line hover:border-ink"><IconPrev /></button>
            <button onClick={r.toggle} aria-label={playing ? t("pause") : t("play")} className="grid h-14 w-14 place-items-center rounded-full bg-accent text-white hover:brightness-110">{playing ? <IconPause /> : <IconPlay />}</button>
            <button onClick={r.skipVerse} aria-label={t("nextVerse")} className="grid h-11 w-11 place-items-center rounded-full border border-line hover:border-ink"><IconNext /></button>
            <button onClick={r.skipSurah} className="h-11 rounded-md border border-ink px-4 text-sm font-bold hover:bg-ink hover:text-bg">{t("nextSurah")}</button>
            <label className="ms-auto flex items-center gap-2 text-sm text-muted">
              <span>{t("volume")}</span>
              <input type="range" min={0} max={1} step={0.05} value={r.vol} onChange={(e) => r.setVolume(Number(e.target.value))} className="w-28 accent-[rgb(var(--accent))]" aria-label={t("volume")} />
            </label>
          </div>
          {r.started && <p className="mt-5 border-t border-line pt-4 text-sm text-muted"><span className="font-semibold text-ink">{t("upNext")}:</span> {upNext.s}. {nameOf(upNext.s)} · {upNext.v}</p>}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">{t("stations")}</h2>
        <ul className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {STATIONS.map((st, i) => {
            const on = station.id === st.id && playing;
            return (
              <li key={st.id} className="bg-surface">
                <button onClick={() => r.chooseStation(st)} className={`flex w-full items-center gap-4 p-4 text-start transition hover:bg-bg ${station.id === st.id && r.started ? "bg-bg" : ""}`}>
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-md text-sm font-extrabold ${on ? "bg-accent text-white" : "bg-ink text-bg"}`}>{on ? <Eq on /> : String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-bold">{r.stationName(st.id)}</span><span className="block text-sm text-muted">{t(`sd_${st.id}`)}</span></span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">{on ? <IconPause /> : <IconPlay />}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 grid gap-4 rounded-lg border border-line bg-surface p-5 text-sm sm:grid-cols-2 lg:grid-cols-5">
        <label className="grid gap-1"><span className="text-muted">{t("reciter")}</span>
          <select value={r.reciter.folder} onChange={(e) => r.changeReciter(e.target.value)} className="h-10 rounded-md border border-line bg-bg px-2">
            {r.reciters.map((x) => <option key={x.folder} value={x.folder}>{x.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1"><span className="text-muted">{t("sleep")}</span>
          <select value={r.sleepLeft ? "on" : "0"} onChange={(e) => r.setSleepLeft(e.target.value === "0" ? 0 : Number(e.target.value) * 60)} className="h-10 rounded-md border border-line bg-bg px-2">
            <option value="0">{r.sleepLeft ? `${Math.ceil(r.sleepLeft / 60)} ${t("min")}` : t("off")}</option>
            {r.sleepOptions.map((m) => <option key={m} value={m}>{m} {t("min")}</option>)}
          </select>
        </label>
        <label className="grid gap-1"><span className="text-muted">{t("adhan")}</span>
          <select value={r.adhanMode} onChange={(e) => r.setAdhanMode(e.target.value as typeof r.adhanMode)} className="h-10 rounded-md border border-line bg-bg px-2">
            <option value="off">{t("off")}</option>
            <option value="makkah">{t("adhanMakkah")}</option>
            <option value="dubai">{t("adhanDubai")}</option>
            <option value="mine">{t("adhanMine")}</option>
          </select>
        </label>
        <label className="grid gap-1"><span className="text-muted">{t("adhanVoice")}</span>
          <span className="flex gap-2">
            <select value={r.voice} onChange={(e) => r.setVoice(e.target.value)} className="h-10 min-w-0 flex-1 rounded-md border border-line bg-bg px-2">
              <option value="random">{t("random")}</option>
              {r.adhanFiles.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
            <button type="button" onClick={r.testAdhan} disabled={r.adhanFiles.length === 0} className="h-10 shrink-0 rounded-md border border-line px-3 text-sm font-semibold hover:border-ink disabled:opacity-40">▶</button>
          </span>
        </label>
        <label className="flex items-center gap-2 self-end pb-2"><input type="checkbox" checked={r.showText} onChange={(e) => r.setShowText(e.target.checked)} /> {t("showText")}</label>
      </section>

      {history.length > 1 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">{t("recent")}</h2>
          <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface text-sm">
            {history.slice(1).map((h, i) => <li key={`${h.s}:${h.v}:${i}`} className="flex justify-between px-4 py-2.5"><span>{h.s}. {nameOf(h.s)}</span><span className="text-muted">{h.v}</span></li>)}
          </ul>
        </section>
      )}

      {r.adhanMode !== "off" && r.adhanFiles.length === 0 && <p className="mt-6 text-sm text-muted">{t("adhanMissing")}</p>}
      {r.adhanCredit && <p className="mt-4 text-xs text-muted">{r.adhanCredit}</p>}
    </main>
  );
}
