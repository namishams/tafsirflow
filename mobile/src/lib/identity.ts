import { useMemo } from "react";
import { useStored } from "@/lib/store";
import { IDENTITY_KEY, cleanIdentity, type Identity } from "@/web/identity";

// Brother/sister and age band: the one shared identity module (the rules live in the website's src/lib/identity.ts,
// mirrored as src/web/identity.ts by scripts/sync-web.mjs). Everyone reads it from here: the onboarding step, the
// profile settings, the AI tutor's form of address, Together's circles, the "Für Schwestern" entry.
export { AGE_BANDS, IDENTITY_KEY, addressOf, bandAtLeast, bandMin, cleanIdentity, groupOfBand, mergeIdentity, readIdentity, saveIdentity } from "@/web/identity";
// the tradition (device only, GDPR Art. 9): the rules; mobile/src/lib/tradition.ts adds the prayer-time method and the hooks
export { TRADITIONS, TRADITION_KEY, readTraditionChoice, saveTraditionChoice, trainerOf } from "@/web/identity";
export type { TraditionChoice } from "@/web/identity";
// prayer posture (device only, GDPR Art. 9)
export { PRAYER_POSTURES, POSTURE_KEY, readPosture, savePosture } from "@/web/identity";
export type { AgeBand, Gender, Identity, PrayerPosture } from "@/web/identity";

/** the identity, re-rendering when it changes (onboarding, settings, sync) */
export function useIdentity(): Identity {
  const raw = useStored<unknown>(IDENTITY_KEY, null);
  return useMemo(() => cleanIdentity(raw), [raw]);
}
