import * as Location from "expo-location";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { CITIES, type Spot } from "@/web/prayer";
import { usePlanT } from "@/features/plan/texts";
import { useO2 } from "@/features/plan/texts2";
import { GOALS_V2, type GoalV2 } from "@/features/plan/v2";

// Travel mode and the learning goals of the profile (owner, 21.10.2026). Travel mode lives on this device (it works
// without an account): on with a destination, the prayer times use the destination – a city of the prayer list when
// the name matches one (with its own time zone), otherwise the place the system geocoder finds for the name, kept only
// on this device under TRAVEL_SPOT_KEY (the time zone is the phone's, which switches on arrival) – and travel off
// brings the previous prayer place back. With a community profile the profile shows "Travelling" to the audience the
// member chose (server: travel_on / travel_city, never coordinates).
export const TRAVEL_KEY = "qmc.travel.v1";
export const TRAVEL_SPOT_KEY = "qmc.travel.spot.v1";
const CITY_KEY = "tf:city";
export type Travel = { on: boolean; city: string; place: string | null; prevCity: string | null };
const OFF: Travel = { on: false, city: "", place: null, prevCity: null };
export const readTravel = () => readJSON<Travel>(TRAVEL_KEY, OFF);
export const useTravel = () => useStored<Travel>(TRAVEL_KEY, OFF);
export const travelSpot = () => readJSON<Spot | null>(TRAVEL_SPOT_KEY, null);

const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[ʿʾ'’`\-\s.]/g, "").toLowerCase();
const deviceTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; } };

/** a prayer-list city whose name (in any language) or id matches */
export function matchCity(name: string) {
  const f = fold(name);
  if (!f) return null;
  return CITIES.find((c) => c.id === f || Object.values(c.names ?? {}).some((n) => n && fold(n) === f)) ?? null;
}
/** Makkah or Madinah (Umrah and Hajj shortcut) */
export function isHaramain(name: string) {
  const c = matchCity(name);
  if (c) return c.id === "makkah" || c.id === "madinah";
  const f = fold(name);
  return /^(makkah|makka|mecca|mekka|mekke|lamecque|lameca|medina|madinah|medine|madina)/.test(f) || /مكة|المدينة|مکه|مدینه/.test(name);
}

/** switches travel mode; resolves the destination for the prayer times. Returns the place the times now use (or null) */
export async function setTravel(on: boolean, city: string): Promise<{ place: string | null; found: boolean }> {
  const cur = readTravel();
  const curCity = readJSON<string>(CITY_KEY, "makkah");
  const name = city.trim().slice(0, 60);
  if (!on) {
    // back to the place from before the journey (only when the prayer page still shows the journey's place)
    if (cur.on && cur.place && curCity === cur.place && cur.prevCity) writeJSON(CITY_KEY, cur.prevCity, true);
    writeJSON(TRAVEL_KEY, { ...OFF, city: name }, true);
    return { place: null, found: true };
  }
  const prevCity = cur.on && cur.prevCity ? cur.prevCity : curCity;
  let place: string | null = null;
  if (name) {
    const c = matchCity(name);
    if (c) place = c.id;
    else {
      try {
        const hits = await Location.geocodeAsync(name);
        const h = hits[0];
        if (h) {
          const spot: Spot = { id: "travel", lat: Math.round(h.latitude * 100) / 100, lon: Math.round(h.longitude * 100) / 100, tz: deviceTz(), method: "MuslimWorldLeague" };
          writeJSON(TRAVEL_SPOT_KEY, spot, true);
          place = "travel";
        }
      } catch { /* no geocoder or no match: the prayer place stays */ }
    }
  }
  if (place) writeJSON(CITY_KEY, place, true);
  writeJSON(TRAVEL_KEY, { on: true, city: name, place, prevCity: place ? prevCity : cur.prevCity }, true);
  return { place, found: !name || !!place };
}

/** the city or region of the prayer-time place, rounded to the city on the device (never coordinates) */
export async function placeCityName(lang: string): Promise<string | null> {
  const id = readJSON<string>(CITY_KEY, "makkah");
  const c = CITIES.find((x) => x.id === id);
  if (c) return (c.names as Record<string, string | undefined>)?.[lang] ?? c.names?.en ?? c.id;
  const spot = id === "travel" ? travelSpot() : readJSON<Spot | null>("tf:myspot", null);
  if (!spot) return null;
  try {
    const r = (await Location.reverseGeocodeAsync({ latitude: spot.lat, longitude: spot.lon }))[0];
    return r ? (r.city || r.subregion || r.region || null) : null;
  } catch { return null; }
}

/** the onboarding goals as profile chips, in the reader's language */
export function useGoalLabels(): Record<GoalV2, string> {
  const p = usePlanT();
  const o = useO2();
  return {
    read: p.g_read, understand: p.g_understand, juzamma: p.g_juzamma, tajweed: p.g_tajweed, reciter: p.g_reciter, daily: p.g_daily,
    islam: o.g_islam, children: o.g_children,
  };
}
export { GOALS_V2 };
