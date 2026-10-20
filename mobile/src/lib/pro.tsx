import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { router, type Href } from "expo-router";
import { useAuth } from "./auth";
import { useStored, writeJSON } from "./store";

// Free and Pro in the app (the website stays free for everyone; progress syncs through the account).
// Pro = "Quran Masterclass Pro", an auto-renewable monthly subscription (4,99 €) through the App Store / Google Play.
// Everything that decides what is free lives in this file.
export const PRO_PRODUCT = "com.quranmasterclass.app.pro.monthly";

export type ProFeature =
  | "shams" | "reciters" | "radio" | "arabic" | "tajweed" | "academy" | "offline" | "vocab" | "stats" | "general";

export const FREE = {
  /** Shams Method course: al-Fatiha and Juz 'Amma (78–114) for everyone */
  shamsSurah: (surah: number) => surah === 1 || surah >= 78,
  /** Quran.com recitation ids that everyone can choose (Alafasy, Husary) */
  reciterIds: [7, 6] as number[],
  /** radio stations (by position in the station list) that everyone can play */
  radioStations: 2,
  /** Arabic reading course: the first unit */
  arabicLessons: 6,
  /** tajweed course: the first lessons */
  tajweedLessons: 3,
  /** vocabulary trainer: words per day */
  vocabPerDay: 10,
};

type Entitlement = { until: number; source: "apple" | "google"; tx?: string } | null;
const LOCAL_KEY = "qmc.pro"; // entitlement confirmed by the store on this device, until the server knows it

type Ctx = { pro: boolean; until: number | null; setLocal: (e: Entitlement) => void };
const ProContext = createContext<Ctx>({ pro: false, until: null, setLocal: () => undefined });

export function ProProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const local = useStored<Entitlement>(LOCAL_KEY, null);
  const setLocal = useCallback((e: Entitlement) => writeJSON(LOCAL_KEY, e, true), []);
  const now = Date.now();
  const localOk = !!local && local.until > now;
  const serverOk = user?.plan === "premium";
  const value = useMemo<Ctx>(() => ({ pro: serverOk || localOk, until: localOk ? local!.until : null, setLocal }), [serverOk, localOk, local, setLocal]);
  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}

export const usePro = () => useContext(ProContext);

/** open the Pro sheet; `feature` tells the sheet what the person tried to open */
export function openPro(feature: ProFeature = "general") {
  router.push(`/pro?f=${feature}` as Href);
}

/** true if allowed; otherwise opens the Pro sheet and returns false */
export function useRequirePro() {
  const { pro } = usePro();
  return useCallback((feature: ProFeature) => { if (pro) return true; openPro(feature); return false; }, [pro]);
}
