import { Linking, Platform } from "react-native";
import * as StoreReview from "expo-store-review";
import Constants from "expo-constants";
import { readJSON, writeJSON } from "@/lib/store";

// App Store rating. Only the system prompt (StoreReview.requestReview): no own stars or "do you like the app?" before
// it, no reward for a rating (Apple guideline 5.6.1). It is asked at most after a positive moment (finished Shams
// session, a passed course lesson, a garden stage-up), from the 5th active day, at most every 120 days and never twice
// in one app version. Everything is stored on this device only (key qmc.review.v1).
export const APP_ID = "6824934843"; // ascAppId in eas.json, APP_STORE_ID in the website's src/lib/appstore.ts
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_ID}`;
const KEY = "qmc.review.v1";
const MIN_ACTIVE_DAYS = 5, MIN_GAP_DAYS = 120, DAY = 86_400_000;
type State = { days: number[]; lastAsked?: number; versions: string[] };
const read = (): State => ({ days: [], versions: [], ...readJSON<Partial<State>>(KEY, {}) });
const dayNo = (now = Date.now()) => Math.floor(now / DAY);
const version = () => Constants.expoConfig?.version ?? "0";

/** counts today as an active day (called when the app opens) */
export function noteActiveDay() {
  const s = read(), d = dayNo();
  if (s.days.includes(d)) return;
  writeJSON(KEY, { ...s, days: [...s.days, d].slice(-60) }, true);
}

export function mayAskForReview(now = Date.now()): boolean {
  if (Platform.OS !== "ios") return false;
  const s = read();
  if (s.days.length < MIN_ACTIVE_DAYS) return false;
  if (s.versions.includes(version())) return false;
  if (s.lastAsked && now - s.lastAsked < MIN_GAP_DAYS * DAY) return false;
  return true;
}

let pending = false;
/** call at a positive moment; asks later (after the celebration) and only if the rules allow it */
export function askForReviewAfterSuccess(delayMs = 2500) {
  if (pending || !mayAskForReview()) return;
  pending = true;
  setTimeout(async () => {
    pending = false;
    try {
      if (!mayAskForReview() || !(await StoreReview.hasAction())) return;
      const s = read();
      writeJSON(KEY, { ...s, lastAsked: Date.now(), versions: [...s.versions, version()].slice(-20) }, true);
      await StoreReview.requestReview();
    } catch { /* the system decides; nothing to show */ }
  }, delayMs);
}

/** the row "Rate the app": the App Store's write-review page */
export async function rateApp() {
  try { await Linking.openURL(`itms-apps://apps.apple.com/app/id${APP_ID}?action=write-review`); }
  catch { await Linking.openURL(`${APP_STORE_URL}?action=write-review`).catch(() => undefined); }
}
