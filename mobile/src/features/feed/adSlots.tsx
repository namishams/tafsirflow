import { memo, useEffect } from "react";
import { View } from "react-native";
import { remoteConfig } from "./remote";
import { statPromo } from "./statsStore";

// Placeholder for ad posts in the Home stream. No ad SDK is part of the app; the scheduler only reserves slots when the
// server config (feed config.json → adSlots) switches them on, so ads can be wired in later without a scheduler change.
// Defaults: off. Never for Pro, never in the first posts of a session, capped per session. Until a provider is wired
// in, a slot renders nothing visible and is only counted locally (impressions of the placeholder).
export type AdSlotsConfig = { enabled?: boolean; everyNItems?: number; firstAfter?: number; maxPerSession?: number; provider?: string };
const DEFAULTS = { enabled: false, everyNItems: 12, firstAfter: 8, maxPerSession: 3 };
export function adSlotsConfig() {
  const c = remoteConfig()?.adSlots ?? {};
  return { ...DEFAULTS, ...c, everyNItems: Math.max(6, c.everyNItems ?? DEFAULTS.everyNItems), firstAfter: Math.max(5, c.firstAfter ?? DEFAULTS.firstAfter) };
}

export class AdSlotCap {
  private last = -1e9;
  private n = 0;
  at(index: number, pro: boolean): string | null {
    const c = adSlotsConfig();
    if (!c.enabled || pro || index < c.firstAfter || this.n >= c.maxPerSession || index - this.last < c.everyNItems) return null;
    this.last = index;
    this.n++;
    return `ad:${c.provider ?? "none"}:${index}`;
  }
}

/** the slot itself: empty until an ad provider renders here */
export const AdSlot = memo(function AdSlot({ item }: { item: string; width: number }) {
  useEffect(() => { statPromo(`adslot:${item.split(":")[1]}`, "imp"); }, [item]);
  return <View style={{ height: 1 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
});
