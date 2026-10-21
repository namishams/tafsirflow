import { useCallback, useMemo, useState } from "react";
import * as Location from "expo-location";
import { CITIES, DEFAULT_SETTINGS, cityName, type PrayerSettings, type Spot } from "@/web/prayer";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";

// The place and settings of the prayer page, kept under the website's own keys (tf:city, tf:myspot,
// tf:prayerSettings). They stay on this device: none of them is synced, coordinates never leave the phone.
export const CITY_KEY = "tf:city";
export const SPOT_KEY = "tf:myspot";
export const SETTINGS_KEY = "tf:prayerSettings";

// Travel mode (owner, 21.10.2026; features/talents/travel.ts): a destination the city list does not have is kept as
// the spot "travel" (rounded, on this device only) and listed first while travelling
const TRAVEL_SPOT_KEY = "qmc.travel.spot.v1";
const TRAVEL_KEY = "qmc.travel.v1";

export function storedPlace() {
  const mine = readJSON<Spot | null>(SPOT_KEY, null);
  const trip = readJSON<{ on?: boolean } | null>(TRAVEL_KEY, null)?.on ? readJSON<Spot | null>(TRAVEL_SPOT_KEY, null) : null;
  const spots: Spot[] = [...(trip ? [trip] : []), ...(mine ? [mine] : []), ...CITIES];
  const id = readJSON<string>(CITY_KEY, "makkah");
  const main = spots.find((s) => s.id === id) ?? CITIES[0];
  const settings: PrayerSettings = { ...DEFAULT_SETTINGS, ...readJSON<Partial<PrayerSettings>>(SETTINGS_KEY, {}) };
  return { mine, spots, main, settings };
}

/** the place's name: a city in the reader's language, or "My location" */
export function placeLabel(s: Spot, lang: string, yourPlace: string) {
  if (s.id === "mine") return yourPlace;
  if (s.id === "travel") return readJSON<{ city?: string } | null>(TRAVEL_KEY, null)?.city || yourPlace;
  const c = CITIES.find((x) => x.id === s.id);
  return c ? cityName(c, lang) : yourPlace;
}

/** device time zone (the website reads Intl.DateTimeFormat().resolvedOptions().timeZone) */
const deviceTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; } };

export function usePrayerPlace() {
  const t = useWebT("prayer");
  const { lang } = useLang();
  const cityId = useStored<string>(CITY_KEY, "makkah");
  const mine = useStored<Spot | null>(SPOT_KEY, null);
  const trip = useStored<Spot | null>(TRAVEL_SPOT_KEY, null);
  const travelling = !!useStored<{ on?: boolean } | null>(TRAVEL_KEY, null)?.on;
  const rawSt = useStored<Partial<PrayerSettings>>(SETTINGS_KEY, {});
  const stKey = JSON.stringify(rawSt);
  const st: PrayerSettings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...rawSt }), [stKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const mineKey = mine ? `${mine.lat},${mine.lon},${mine.tz}` : "";
  const tripKey = travelling && trip ? `${trip.lat},${trip.lon},${trip.tz}` : "";
  const spots: Spot[] = useMemo(() => [...(tripKey && trip ? [trip] : []), ...(mine ? [mine] : []), ...CITIES], [mineKey, tripKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const main = spots.find((s) => s.id === cityId) ?? CITIES[0];
  const [geoMsg, setGeoMsg] = useState("");
  const label = useCallback((s: Spot) => placeLabel(s, lang, t("yourPlace")), [lang, t]);

  const pick = useCallback((id: string) => writeJSON(CITY_KEY, id, true), []);
  const saveSt = useCallback((n: PrayerSettings) => writeJSON(SETTINGS_KEY, n, true), []);

  // asked only when the person taps "Use my location"; the position is used on the device and kept only here
  const locate = useCallback(async () => {
    setGeoMsg(t("locating"));
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") { setGeoMsg(t("locationDenied")); return; }
      const pos = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<null>((r) => setTimeout(() => r(null), 12000)),
      ]) ?? await Location.getLastKnownPositionAsync();
      if (!pos) { setGeoMsg(t("locationDenied")); return; }
      const spot: Spot = { id: "mine", lat: pos.coords.latitude, lon: pos.coords.longitude, tz: deviceTz(), method: "MuslimWorldLeague" };
      writeJSON(SPOT_KEY, spot, true);
      pick("mine");
      setGeoMsg("");
    } catch {
      setGeoMsg(t("locationDenied"));
    }
  }, [pick, t]);

  return { spots, main, st, label, pick, saveSt, locate, geoMsg, setGeoMsg };
}
