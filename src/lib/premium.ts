"use client";
import { useEffect, useState } from "react";
import { useConfig } from "./config";
import { fetchMe } from "./sync";
import { readJSON, writeJSON } from "./storage";

// Quran Masterclass Pro – a monthly subscription in the app (App Store / Google Play); an earlier one-time Premium stays
// valid (users.plan = 'premium'). The Quran, recitation, translations and tafsir stay free for everyone, and the website
// stays free. Pro unlocks the Shams course beyond al-Fatiha and Juz 'Amma, unlimited offline surahs and more assistant
// questions. The web asks for Pro only if the owner switches it on (admin: premium.gateWeb – keep it off).

/** al-Fatiha and Juz 'Amma (surahs 78–114) can be learned with the Shams Method by everyone */
export const freeShams = (surah: number) => surah === 1 || surah >= 78;

/** what the iOS app tells the page (ios/QuranMasterclass/WebViewController.swift) */
export type NativeApp = { platform: "ios"; version: string; premium: boolean; price: string | null; jws: string | null; buy: () => void; restore: () => void };
type Win = Window & { QMCApp?: NativeApp };
export const nativeApp = (): NativeApp | null => (typeof window !== "undefined" && (window as Win).QMCApp?.platform ? (window as Win).QMCApp! : null);
export const inIosApp = () => typeof navigator !== "undefined" && /QuranMasterclassApp\//.test(navigator.userAgent);

export function useNativeApp(): NativeApp | null {
  const [app, setApp] = useState<NativeApp | null>(null);
  useEffect(() => {
    const up = () => { const a = nativeApp(); setApp(a ? { ...a } : null); };
    up();
    window.addEventListener("qmc-app", up);
    return () => window.removeEventListener("qmc-app", up);
  }, []);
  return app;
}

// the account's plan, asked once per page view
let mePlan: Promise<string | null> | null = null;
export const accountPlan = () => (mePlan ??= fetchMe().then((r) => r.user?.plan ?? null).catch(() => null));
export const resetAccountPlan = () => { mePlan = null; };

export type PremiumState = { premium: boolean; gated: boolean; app: NativeApp | null; freeOffline: number; gateWeb: boolean };

/** checked at the moment of use (not after the first render): Premium from the app, the account (cached) or this device */
export const premiumNow = () => !!nativeApp()?.premium || readJSON<boolean>("tf:premium", false);
/** Premium is asked for inside the iOS app, and on the web only if the owner switched it on */
export const lockedNow = (gateWeb: boolean) => !premiumNow() && (inIosApp() || gateWeb);

export function usePremium(): PremiumState {
  const app = useNativeApp();
  const cfg = useConfig();
  const [account, setAccount] = useState(false);
  const [cached, setCached] = useState(false);
  const [ios, setIos] = useState(false);
  useEffect(() => {
    setIos(inIosApp());
    setCached(readJSON<boolean>("tf:premium", false));
    accountPlan().then((p) => setAccount(p === "premium"));
  }, []);
  const premium = !!app?.premium || account || cached;
  useEffect(() => { if (app?.premium || account) writeJSON("tf:premium", true, true); }, [app?.premium, account]);
  useEffect(() => { const on = () => accountPlan().then((p) => setAccount(p === "premium")); window.addEventListener("tf-premium", on); return () => window.removeEventListener("tf-premium", on); }, []);
  return { premium, gated: !premium && (ios || cfg.premium.gateWeb), app, freeOffline: cfg.premium.freeOffline, gateWeb: cfg.premium.gateWeb };
}
