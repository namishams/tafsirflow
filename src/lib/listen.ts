import { readJSON, writeJSON } from "./storage";
import { award, dayNow } from "./points";

// Listening statistics of the verse player: seconds and verses per day, surah, reciter and hour. Synced as "tf:listen".
export type ListenDay = { s: number; v: number; su: Record<string, [number, number]>; r: Record<string, number>; h: number[] };
export type Listen = Record<string, ListenDay>;
const KEY = "tf:listen";
export const readListen = () => readJSON<Listen>(KEY, {});
const blank = (): ListenDay => ({ s: 0, v: 0, su: {}, r: {}, h: Array(24).fill(0) });

type Pending = { s: number; v: number; su: Record<string, [number, number]>; r: Record<string, number>; h: Record<number, number> };
let pend: Pending = { s: 0, v: 0, su: {}, r: {}, h: {} };
let server: Record<string, { sec: number; v: number }> = {}; // "surah|reciter" -> delta not yet sent
let carry = 0; // seconds not yet turned into points
let timer: ReturnType<typeof setInterval> | null = null;
let lastWrite = 0;

function ensureTimer() {
  if (timer || typeof window === "undefined") return;
  timer = setInterval(() => { flush(); if (Date.now() - lastWrite > 60_000) send(); }, 15_000);
  window.addEventListener("pagehide", () => { flush(); send(true); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") { flush(); send(true); } });
}

// called with the wall-clock seconds the recitation actually played (seeks and stalls excluded)
export function trackListen(seconds: number, surah: number, reciter: string) {
  if (!(seconds > 0) || seconds > 5 || !surah) return;
  ensureTimer();
  pend.s += seconds;
  const su = (pend.su[surah] ??= [0, 0]); su[0] += seconds;
  pend.r[reciter] = (pend.r[reciter] ?? 0) + seconds;
  const h = new Date().getHours(); pend.h[h] = (pend.h[h] ?? 0) + seconds;
  const k = `${surah}|${reciter}`; (server[k] ??= { sec: 0, v: 0 }).sec += seconds;
  carry += seconds;
  if (carry >= 60) { const m = Math.floor(carry / 60); carry -= m * 60; award("listen", m); }
}

export function trackVerseDone(surah: number, reciter: string) {
  if (!surah) return;
  ensureTimer();
  pend.v += 1;
  (pend.su[surah] ??= [0, 0])[1] += 1;
  const k = `${surah}|${reciter}`; (server[k] ??= { sec: 0, v: 0 }).v += 1;
  award("verse");
}

export function flush() {
  if (!pend.s && !pend.v) return;
  const all = readListen();
  const t = String(dayNow());
  const d = (all[t] ??= blank());
  d.s = Math.round((d.s + pend.s) * 10) / 10;
  d.v += pend.v;
  for (const [s, [sec, v]] of Object.entries(pend.su)) { const x = (d.su[s] ??= [0, 0]); x[0] = Math.round((x[0] + sec) * 10) / 10; x[1] += v; }
  for (const [r, sec] of Object.entries(pend.r)) d.r[r] = Math.round(((d.r[r] ?? 0) + sec) * 10) / 10;
  for (const [h, sec] of Object.entries(pend.h)) d.h[Number(h)] = Math.round(((d.h[Number(h)] ?? 0) + sec) * 10) / 10;
  pend = { s: 0, v: 0, su: {}, r: {}, h: {} };
  compact(all);
  // quiet write; the account sync picks it up with the next regular write
  writeJSON(KEY, all, true);
  window.dispatchEvent(new Event("tf-listen"));
}

// after 180 days a day keeps only its totals; the details move into one archive entry ("a") so the record stays small
function compact(all: Listen) {
  const old = dayNow() - 180;
  for (const [k, d] of Object.entries(all)) {
    if (k === "a" || Number(k) >= old || (!Object.keys(d.su).length && !d.h.length)) continue;
    const a = (all.a ??= blank());
    a.s += d.s; a.v += d.v;
    for (const [s, [sec, v]] of Object.entries(d.su)) { const x = (a.su[s] ??= [0, 0]); x[0] += sec; x[1] += v; }
    for (const [r, sec] of Object.entries(d.r)) a.r[r] = (a.r[r] ?? 0) + sec;
    d.h.forEach((sec, i) => { a.h[i] = (a.h[i] ?? 0) + sec; });
    all[k] = { s: d.s, v: d.v, su: {}, r: {}, h: [] };
  }
}

// anonymous totals for the community statistics (no user id, only surah, reciter, seconds, verses)
function send(beacon = false) {
  const items = Object.entries(server).filter(([, x]) => x.sec >= 1 || x.v > 0).map(([k, x]) => { const [s, r] = k.split("|"); return { s: Number(s), r, sec: Math.round(x.sec), v: x.v }; });
  if (!items.length) return;
  server = {};
  lastWrite = Date.now();
  const body = JSON.stringify({ items });
  try {
    if (beacon && navigator.sendBeacon) navigator.sendBeacon("/api/listen", new Blob([body], { type: "application/json" }));
    else void fetch("/api/listen", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => undefined);
  } catch { /* statistics are optional */ }
}

// merge for the account sync: per day the device with more listening wins
export function mergeListen(a?: Listen, b?: Listen): Listen {
  const o: Listen = { ...(b ?? {}) };
  for (const [k, v] of Object.entries(a ?? {})) if (!o[k] || v.s >= o[k].s) o[k] = v;
  return o;
}

// ---------- summaries ----------
export type ListenSummary = { seconds: number; verses: number; days: number; bySurah: { surah: number; seconds: number; verses: number }[]; byReciter: { reciter: string; seconds: number }[]; byHour: number[]; series: { day: number; seconds: number; verses: number }[] };
// withArchive: also count the details of days older than 180 days (for all-time figures)
export function summarize(all: Listen, from: number, to = dayNow(), withArchive = false): ListenSummary {
  const su: Record<string, [number, number]> = {}, re: Record<string, number> = {}, hr = Array(24).fill(0);
  let seconds = 0, verses = 0, days = 0;
  const series: ListenSummary["series"] = [];
  const arc = withArchive ? all.a : undefined;
  if (arc) {
    for (const [s, [sec, v]] of Object.entries(arc.su)) su[s] = [sec, v];
    for (const [r, sec] of Object.entries(arc.r)) re[r] = sec;
    arc.h.forEach((sec, i) => { hr[i] += sec; });
  }
  for (let d = from; d <= to; d++) {
    const x = all[String(d)];
    series.push({ day: d, seconds: x?.s ?? 0, verses: x?.v ?? 0 });
    if (!x) continue;
    seconds += x.s; verses += x.v; if (x.s > 30 || x.v > 0) days++;
    for (const [s, [sec, v]] of Object.entries(x.su)) { const y = (su[s] ??= [0, 0]); y[0] += sec; y[1] += v; }
    for (const [r, sec] of Object.entries(x.r)) re[r] = (re[r] ?? 0) + sec;
    x.h?.forEach((sec, i) => { hr[i] += sec; });
  }
  return {
    seconds, verses, days, byHour: hr, series,
    bySurah: Object.entries(su).map(([s, [sec, v]]) => ({ surah: Number(s), seconds: sec, verses: v })).sort((a, b) => b.seconds - a.seconds),
    byReciter: Object.entries(re).map(([reciter, sec]) => ({ reciter, seconds: sec })).sort((a, b) => b.seconds - a.seconds),
  };
}
export const firstListenDay = (all: Listen) => Math.min(dayNow(), ...Object.keys(all).filter((k) => k !== "a").map(Number));
