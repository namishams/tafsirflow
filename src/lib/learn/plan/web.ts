// The app's hrefs of the 30-day plan (plan.ts STEPS, v2.ts COURSES) on the website. Mirrors planStepHref() of
// mobile/src/features/shams2/mode.ts (the Shams steps open today's wird in Shams Method 2.0) and maps the app routes
// that the website names differently: a Shams lesson is the reader with the Shams method switched on, the reader's
// practice mode is ?m=1, and prayer times are set up on /prayer.
import type { ShamsMode } from "@/lib/learn/shams2/mode";

export function planWebHref(id: string, href: string, mode: ShamsMode): string {
  if (mode === "v2" && (id === "shams" || id === "shamsShort" || id === "shamsLong")) return "/shams/wird";
  const shams = href.match(/^\/shams\/(\d+)$/);
  if (shams) return `/surah/${shams[1]}?shams=1`;
  const quran = href.match(/^\/quran\/(\d+)(?:\?m=(\w+))?$/);
  if (quran) return quran[2] === "practice" ? `/surah/${quran[1]}?m=1` : `/surah/${quran[1]}`;
  if (href === "/prayer-setup") return "/prayer";
  return href;
}
