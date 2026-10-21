// mirrors the sky logic of mobile/src/features/garden/Landscape.tsx (skyAt, SKIES, moonPhase, journeySky, the sky place)
// and spotNow() of mobile/src/features/feed/Extras.tsx. Pure: prayer times from src/lib/prayer.ts (adhan), the moon
// from the synodic month. DESIGN FROZEN colours (tag garten-design-v1): only bug fixes.
import { useEffect, useState } from "react";
import { CITIES, dayFor, type Prayer, type Spot } from "@/lib/prayer";
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";

export type Moon = { x: number; y: number; phase: number; illum: number };
export type Sky = { colors: [string, string, string]; night: number; warm: number; sun: { x: number; y: number } | null; moon: Moon | null; next?: { prayer: Prayer; at: number } };
type C3 = [string, string, string];
type Key = { t: number; c: C3; night: number; warm: number };

/** what unlocks with the stage of the oldest tree */
export const UNLOCK = { flowers: 3, lanterns: 4, arcade: 5, fountains: 6, iwan: 8, archLights: 10, aura: 12 } as const;

const K = {
  night: { c: ["#020c09", "#06211a", "#0f382d"] as C3, night: 1, warm: 0 },
  astro: { c: ["#03110d", "#0a2a21", "#21423a"] as C3, night: 0.92, warm: 0.02 },
  nautical: { c: ["#072019", "#1c4337", "#566650"] as C3, night: 0.75, warm: 0.12 },
  civil: { c: ["#0e3328", "#5a6a4c", "#cfae76"] as C3, night: 0.5, warm: 0.42 },
  predawn: { c: ["#041a14", "#174235", "#4f6248"] as C3, night: 0.8, warm: 0.1 },
  sunrise: { c: ["#123f35", "#8c845a", "#f0d49c"] as C3, night: 0.3, warm: 0.6 },
  morning: { c: ["#2a6b58", "#97c2aa", "#f0ecda"] as C3, night: 0, warm: 0.15 },
  noon: { c: ["#256a56", "#9cc9b2", "#f3f1e2"] as C3, night: 0, warm: 0 },
  asr: { c: ["#2b6650", "#a9c4a0", "#f3e6c2"] as C3, night: 0, warm: 0.2 },
  golden: { c: ["#173a2e", "#b08a45", "#f3d48e"] as C3, night: 0.12, warm: 0.85 },
  sunset: { c: ["#0f2c25", "#8f5f36", "#e2ac62"] as C3, night: 0.4, warm: 1 },
  dusk: { c: ["#0b261f", "#5b4a35", "#b08050"] as C3, night: 0.58, warm: 0.55 },
  nauticalDusk: { c: ["#061914", "#24453a", "#5d6040"] as C3, night: 0.8, warm: 0.25 },
};
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const mix = (a: string, b: string, k: number) => { const x = hex(a), y = hex(b); return `#${x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("")}`; };

// ---------- where the sky is: Makkah (default) or the learner's own place ----------
export const SKY_PLACE_KEY = "qmc.garden.sky";
export type SkyPlace = "mecca" | "local";
const MECCA: Spot = CITIES.find((c) => c.id === "makkah") ?? CITIES[0];
/** the learner's prayer place (the website's prayer page stores it under the app's keys) */
export function spotNow(): Spot {
  const cityId = readJSON<string>("tf:city", "makkah");
  return cityId === "mine" ? readJSON<Spot | null>("tf:myspot", null) ?? CITIES[0] : CITIES.find((c) => c.id === cityId) ?? CITIES[0];
}
export const skySpot = (place: SkyPlace): Spot => (place === "local" ? spotNow() : MECCA);
export const useSkyPlace = (): SkyPlace => (useStored<SkyPlace>(SKY_PLACE_KEY, "mecca") === "local" ? "local" : "mecca");
export const setSkyPlace = (p: SkyPlace) => writeJSON(SKY_PLACE_KEY, p, true);

// ---------- the moon ----------
const SYNODIC = 29.530588853, NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
/** the moon's phase now: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter */
export function moonPhase(now = new Date()): number { const d = (now.getTime() - NEW_MOON) / 86400000; return (((d % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC; }
function moonAt(ms: number, noon: number): Moon | null {
  const phase = moonPhase(new Date(ms)), illum = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  if (illum < 0.015) return null;
  let h = ((ms - (noon + phase * 86400000)) / 3600000) % 24;
  if (h > 12) h -= 24;
  if (h < -12) h += 24;
  if (Math.abs(h) > 6.2) return null;
  const k = h / 6.2;
  return { x: 0.5 + k * 0.42, y: 0.66 - Math.cos(k * Math.PI / 2) * 0.5, phase, illum };
}

export function skyAt(now = new Date(), spot: Spot = MECCA): Sky {
  let times: Record<string, number>, next: Sky["next"];
  try {
    const d = dayFor(spot, now);
    times = Object.fromEntries(Object.entries(d.times).map(([k, v]) => [k, (v as Date).getTime()]));
    next = { prayer: d.next, at: d.nextAt.getTime() };
  } catch {
    const base = new Date(now); base.setHours(0, 0, 0, 0); const h = (n: number) => base.getTime() + n * 3600000;
    times = { fajr: h(5), sunrise: h(6.5), dhuhr: h(12.5), asr: h(15.5), maghrib: h(19), isha: h(20.5) };
  }
  const M = 60000, sr = times.sunrise, ss = times.maghrib;
  const keys: Key[] = [
    { t: times.fajr - 25 * M, ...K.night }, { t: times.fajr, ...K.astro },
    { t: Math.max(times.fajr + 5 * M, sr - 48 * M), ...K.nautical }, { t: Math.max(times.fajr + 10 * M, sr - 24 * M), ...K.civil },
    { t: sr, ...K.sunrise }, { t: sr + 60 * M, ...K.morning }, { t: times.dhuhr, ...K.noon }, { t: times.asr, ...K.asr },
    { t: ss - 45 * M, ...K.golden }, { t: ss, ...K.sunset },
    { t: Math.min(times.isha - 10 * M, ss + 24 * M), ...K.dusk }, { t: Math.min(times.isha - 5 * M, ss + 48 * M), ...K.nauticalDusk }, { t: times.isha, ...K.night },
  ].sort((x, y) => x.t - y.t);
  const ms = now.getTime();
  let c = K.night.c, night = 1, warm = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (ms >= a.t && ms < b.t) {
      const k = (ms - a.t) / Math.max(1, b.t - a.t);
      c = [mix(a.c[0], b.c[0], k), mix(a.c[1], b.c[1], k), mix(a.c[2], b.c[2], k)];
      night = a.night + (b.night - a.night) * k; warm = a.warm + (b.warm - a.warm) * k;
      break;
    }
  }
  const dayK = (ms - sr) / Math.max(1, ss - sr);
  const sun = dayK > -0.04 && dayK < 1.04 ? { x: 0.1 + dayK * 0.8, y: 0.62 - Math.sin(Math.max(0, Math.min(1, dayK)) * Math.PI) * 0.5 } : null;
  return { colors: c, night, warm, sun, moon: moonAt(ms, times.dhuhr), next };
}
const fixedMoon = (x: number, y: number): Moon | null => { const phase = moonPhase(), illum = (1 - Math.cos(phase * Math.PI * 2)) / 2; return illum < 0.015 ? null : { x, y, phase, illum }; };
/** a few fixed skies (the moon in today's real phase) */
export const SKIES: Record<"night" | "predawn" | "dawn" | "day" | "golden", Sky> = {
  night: { colors: K.night.c, night: 1, warm: 0, sun: null, moon: fixedMoon(0.64, 0.3) },
  predawn: { colors: K.predawn.c, night: 0.8, warm: 0.1, sun: null, moon: fixedMoon(0.78, 0.4) },
  dawn: { colors: K.sunrise.c, night: 0.3, warm: 0.6, sun: { x: 0.24, y: 0.6 }, moon: null },
  day: { colors: K.morning.c, night: 0, warm: 0.15, sun: { x: 0.72, y: 0.16 }, moon: null },
  golden: { colors: K.golden.c, night: 0.12, warm: 0.85, sun: { x: 0.8, y: 0.48 }, moon: null },
};
/** the sky now over the chosen place, refreshed every minute (null until mounted: the server has no clock of the viewer) */
export function useSky(place: SkyPlace = "mecca"): Sky | null {
  const [s, setS] = useState<Sky | null>(null);
  useEffect(() => { setS(skyAt(new Date(), skySpot(place))); const id = setInterval(() => setS(skyAt(new Date(), skySpot(place))), 60000); return () => clearInterval(id); }, [place]);
  return s;
}
/** readable ink on top of a sky */
export const inkFor = (_s: Sky) => "#f6ead0";
/** the stage a garden shows (the oldest tree carries the landscape) */
export const gardenLevel = (stages: number[]) => (stages.length ? Math.max(...stages) : 0);

/** a sky between night and sunrise for a progress 0 … 1 (the planting ceremony dawns as it goes) */
export function journeySky(p: number): Sky {
  const a = p < 0.5 ? SKIES.night : SKIES.predawn, b = p < 0.5 ? SKIES.predawn : SKIES.dawn, k = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
  return {
    colors: [mix(a.colors[0], b.colors[0], k), mix(a.colors[1], b.colors[1], k), mix(a.colors[2], b.colors[2], k)],
    night: a.night + (b.night - a.night) * k, warm: a.warm + (b.warm - a.warm) * k,
    sun: p > 0.7 ? { x: 0.26, y: 0.95 - (p - 0.7) * 1.2 } : null, moon: p < 0.6 ? fixedMoon(0.8, 0.3) : null,
  };
}
