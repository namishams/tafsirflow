import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { AppState, Platform } from "react-native";
import { router, type Href } from "expo-router";
import { useAuth } from "./auth";
import { useStored, writeJSON } from "./store";

// Free and Pro in the app (the website stays free for everyone; progress syncs through the account).
// Pro = "Quran Masterclass Pro", an auto-renewable monthly subscription (US$9.99) through the App Store / Google Play.
// Everything that decides what is free lives in this file.
export const PRO_PRODUCT = "com.quranmasterclass.app.pro.monthly";

export type ProFeature =
  | "shams" | "reciters" | "radio" /* legacy: radio is free */ | "arabic" | "tajweed" | "academy" | "offline" | "vocab" | "stats" | "general";

export const FREE = {
  /** Shams Method course: al-Fatiha and Juz 'Amma (78–114) for everyone */
  shamsSurah: (surah: number) => surah === 1 || surah >= 78,
  /** Quran.com recitation ids that everyone can choose (Alafasy, Husary) */
  reciterIds: [7, 6] as number[],
  /** Arabic reading course: the whole first unit (8 lessons incl. its unit test) */
  arabicLessons: 8,
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
  // store transactions that are not finished yet (Pro, dua credits) are confirmed by the server and finished: at
  // start, after signing in (they are bound to the account) and whenever the app comes back to the foreground
  const uid = user?.id;
  useEffect(() => {
    if (Platform.OS === "web") return;
    let live = true;
    const run = () => { void import("./iap").then((m) => { if (!live) return; void m.observePurchases(); void m.settlePending(); }).catch(() => undefined); };
    run();
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") run(); });
    return () => { live = false; sub.remove(); };
  }, [uid]);
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
