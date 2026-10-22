import { Profiler, useEffect, type ReactNode } from "react";
import { Linking } from "react-native";
import { usePathname } from "expo-router";

// Performance probe (development, or a build bundled with EXPO_PUBLIC_PERF=1): logs how long a screen takes from the
// link that opens it to its first painted frame, and every React commit above 50 ms with its duration. Read the lines
// "[perf]" in the Metro log or with `xcrun simctl spawn <device> log stream --predicate 'eventMessage CONTAINS "[perf]"'`.
// Nothing is rendered or measured in a normal release build.
export const PERF = __DEV__ || process.env.EXPO_PUBLIC_PERF === "1";

// the lines also go to a local collector when one listens (scratch script on the Mac; silently ignored otherwise)
function log(line: string) {
  console.log(line);
  fetch("http://localhost:8799/perf", { method: "POST", body: line }).catch(() => undefined);
}

let linkAt = 0;
let linkUrl = "";
if (PERF) {
  Linking.addEventListener("url", ({ url }) => { linkAt = performance.now(); linkUrl = url; });
}

function NavTimer() {
  const path = usePathname();
  useEffect(() => {
    if (!linkAt) return;
    const t0 = linkAt;
    const url = linkUrl;
    linkAt = 0;
    const committed = performance.now();
    // two frames after the commit: the new screen has been laid out and drawn
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const painted = performance.now();
      log(`[perf] nav ${path} commit=${Math.round(committed - t0)}ms paint=${Math.round(painted - t0)}ms (${url})`);
    }));
  }, [path]);
  return null;
}

export function PerfProbe({ children }: { children: ReactNode }) {
  if (!PERF) return <>{children}</>;
  return (
    <Profiler id="app" onRender={(_id, phase, actual) => { if (actual > 50) log(`[perf] commit ${phase} ${Math.round(actual)}ms`); }}>
      <NavTimer />
      {children}
    </Profiler>
  );
}
