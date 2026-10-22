import { useMemo } from "react";
import { useLang } from "@/i18n";
import { useStored } from "@/lib/store";
import { sistersText } from "@/web/sisters";
import { LISTEN_KEY, SISTERS_KEY, gateFor, listenDaysOn, readSisters, type GateKind, type SistersState } from "@/web/sisters/state";

// Hooks of "Für Schwestern" (rules and texts in the website's src/lib/sisters, mirrored as src/web/sisters).

/** the section's texts in the app's language */
export function useSis() {
  const { lang } = useLang();
  return useMemo(() => sistersText(lang), [lang]);
}
/** the device-only state (consent, madhhab, "Meine Tage", strict), re-rendering on change */
export function useSisters(): SistersState {
  const raw = useStored<unknown>(SISTERS_KEY, null);
  return useMemo(() => readSisters(), [raw]); // eslint-disable-line react-hooks/exhaustive-deps
}
/** is today a listening and understanding day (own switch or "Meine Tage")? */
export function useListenDays(): boolean {
  const s = useSisters();
  const raw = useStored<unknown>(LISTEN_KEY, null);
  return useMemo(() => listenDaysOn(s), [s, raw]); // eslint-disable-line react-hooks/exhaustive-deps
}
/** the gate of a kind of activity right now */
export function useGate(kind: GateKind) {
  const s = useSisters();
  return useMemo(() => gateFor(kind, s), [kind, s]);
}
