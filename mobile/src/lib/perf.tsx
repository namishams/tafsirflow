import { Profiler, useEffect, type ReactNode } from "react";
import { Linking, Platform, Settings } from "react-native";
import { usePathname } from "expo-router";

// Performance probe (development, or a build bundled with EXPO_PUBLIC_PERF=1): logs how long a screen takes from the
// link that opens it to its first painted frame, and every React commit above 50 ms with its duration. Read the lines
// "[perf]" in the Metro log or with `xcrun simctl spawn <device> log stream --predicate 'eventMessage CONTAINS "[perf]"'`.
// Nothing is rendered or measured in a normal release build.
export const PERF = __DEV__ || process.env.EXPO_PUBLIC_PERF === "1";
/** a measurement build started with `xcrun simctl launch <device> com.quranmasterclass.app -perfBaseline 1` switches
 *  the speed-ups off (screen freezing, progressive pages), for before/after numbers from one binary */
export const perfBaseline: boolean = PERF && Platform.OS === "ios" && (() => { try { return !!Settings.get("perfBaseline"); } catch { return false; } })();

// the lines also go to a local collector when one listens (scratch script on the Mac; silently ignored otherwise)
// the simulator's name, so lines from several simulators on one Metro can be told apart
let device = "";
try { device = (require("expo-constants") as { default: { deviceName?: string } }).default.deviceName ?? ""; } catch { device = ""; } // eslint-disable-line @typescript-eslint/no-require-imports
export function perfLog(line: string) {
  if (!PERF) return;
  console.log(line);
  fetch("http://localhost:8799/perf", { method: "POST", body: `${line} {${device}}` }).catch(() => undefined);
}

// kept on globalThis so a fast refresh of this file does not split the listener and the timer
const g = globalThis as unknown as { __perfLink?: { at: number; url: string; sub?: boolean } };
const link = (g.__perfLink ??= { at: 0, url: "" });
if (PERF && !link.sub) {
  link.sub = true;
  Linking.addEventListener("url", ({ url }) => { link.at = performance.now(); link.url = url; });
}

function NavTimer() {
  const path = usePathname();
  useEffect(() => {
    if (!link.at) return;
    const t0 = link.at;
    const url = link.url;
    link.at = 0;
    const committed = performance.now();
    // two frames after the commit: the new screen has been laid out and drawn
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const painted = performance.now();
      perfLog(`[perf] nav ${path} commit=${Math.round(committed - t0)}ms paint=${Math.round(painted - t0)}ms (${url})`);
    }));
  }, [path]);
  return null;
}

export function PerfProbe({ children }: { children: ReactNode }) {
  if (!PERF) return <>{children}</>;
  return (
    <Profiler id="app" onRender={(_id, phase, actual) => { if (actual > 50) perfLog(`[perf] commit ${phase} ${Math.round(actual)}ms`); }}>
      <NavTimer />
      {children}
    </Profiler>
  );
}
