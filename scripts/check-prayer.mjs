// Checks the prayer-time maths (src/lib/prayer.ts) without a browser:  node scripts/check-prayer.mjs
// (Node 22.18+ reads the TypeScript file directly.) It runs the same checks under several viewer time zones, because
// the page must show the same times for a place whatever time zone the visitor's device is in.
//
//  1. Reference values for Dubai and Berlin on 23.10.2026 (Aladhan API, same methods) within 3 minutes
//  2. Stepping the clock minute by minute across midnight and across the end of summer time in Berlin (25.10.2026):
//     the next prayer is always in the future, never more than 24 h away, the countdown only counts down and jumps to
//     the following prayer exactly at its time
//  3. After Isha the next prayer is the next day's Fajr
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ZONES = ["UTC", "Asia/Dubai", "Europe/Berlin", "America/Los_Angeles", "Pacific/Kiritimati"];
if (!process.env.PRAYER_CHECK_CHILD) {
  let bad = 0;
  for (const tz of ZONES) {
    const r = spawnSync(process.execPath, ["--no-warnings", fileURLToPath(import.meta.url)], { env: { ...process.env, TZ: tz, PRAYER_CHECK_CHILD: "1" }, encoding: "utf8" });
    process.stdout.write(`[viewer time zone ${tz}]\n${r.stdout}${r.stderr}`);
    if (r.status !== 0) bad++;
  }
  console.log(bad ? `FAILED in ${bad} of ${ZONES.length} time zones` : `OK in all ${ZONES.length} time zones`);
  process.exit(bad ? 1 : 0);
}

const { CITIES, PRAYERS, dayFor, fmtTime, countdown, hijriDate, spotFromPosition } = await import("../src/lib/prayer.ts");
const city = (id) => CITIES.find((c) => c.id === id);
let failed = 0;
const fail = (msg) => { failed++; console.log("  FAIL", msg); };
const hm = (d, tz) => fmtTime(d, tz, "en");
const minutes = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

// 1. reference values (Aladhan, 23.10.2026): Dubai = method 16, Berlin = Muslim World League
const REF = {
  dubai: { fajr: "05:03", sunrise: "06:21", dhuhr: "12:06", asr: "15:20", maghrib: "17:48", isha: "19:02" },
  berlin: { fajr: "05:52", sunrise: "07:46", dhuhr: "12:51", asr: "15:24", maghrib: "17:55", isha: "19:42" },
};
for (const id of Object.keys(REF)) {
  const c = city(id);
  const d = dayFor(c, new Date("2026-10-23T00:30:00Z"));
  for (const p of PRAYERS) {
    const diff = Math.abs(minutes(hm(d.times[p], c.tz)) - minutes(REF[id][p]));
    if (diff > 3) fail(`${id} ${p}: ${hm(d.times[p], c.tz)} instead of ${REF[id][p]}`);
  }
}

// 2. step through time
function walk(id, fromIso, hours) {
  const c = city(id);
  let t = new Date(fromIso).getTime(), prev = null, switches = 0;
  for (let i = 0; i < hours * 60; i++, t += 60_000) {
    const now = new Date(t);
    const d = dayFor(c, now);
    const left = d.nextAt.getTime() - t;
    if (left <= 0) fail(`${id} ${now.toISOString()}: next prayer ${d.next} is not in the future`);
    if (left > 26 * 3600_000) fail(`${id} ${now.toISOString()}: next prayer ${d.next} is ${(left / 3600_000).toFixed(1)} h away`);
    if (prev) {
      const sameTarget = prev.nextAt.getTime() === d.nextAt.getTime();
      if (!sameTarget) {
        switches++;
        // the target may only change when the old one has passed, exactly at that minute
        if (prev.nextAt.getTime() > t) fail(`${id} ${now.toISOString()}: switched from ${prev.next} before its time`);
        if (t - prev.nextAt.getTime() >= 60_000) fail(`${id} ${now.toISOString()}: switched late after ${prev.next}`);
      } else if (countdown(d.nextAt, now) > countdown(prev.nextAt, new Date(t - 60_000))) fail(`${id} ${now.toISOString()}: countdown increased`);
    }
    prev = d;
  }
  return switches;
}
// 3 days around midnight + the end of summer time in Berlin (clocks back on 25.10.2026 at 03:00)
const berlinSwitches = walk("berlin", "2026-10-23T12:00:00Z", 72);
const dubaiSwitches = walk("dubai", "2026-10-23T12:00:00Z", 72);
if (berlinSwitches !== 18 || dubaiSwitches !== 18) fail(`expected 18 prayer changes in 3 days, got Berlin ${berlinSwitches}, Dubai ${dubaiSwitches}`);

// after Isha: next day's Fajr
for (const id of ["dubai", "berlin"]) {
  const c = city(id), today = dayFor(c, new Date("2026-10-23T12:00:00Z"));
  const late = new Date(today.times.isha.getTime() + 60_000);
  const d = dayFor(c, late);
  const next = dayFor(c, new Date(late.getTime() + 8 * 3600_000));
  if (d.next !== "fajr" || d.nextAt.getTime() !== next.times.fajr.getTime()) fail(`${id}: after Isha the next prayer is not the following Fajr`);
  if (hm(d.nextAt, c.tz) === hm(today.times.fajr, c.tz) && d.nextAt.getTime() === today.times.fajr.getTime()) fail(`${id}: Fajr of the same day after Isha`);
}

// Hijri date rolls over at midnight at the place (Dubai 24.10.2026 00:00 = 23.10. 20:00 UTC)
const before = hijriDate(new Date("2026-10-23T19:59:00Z"), "en", "Asia/Dubai"), after = hijriDate(new Date("2026-10-23T20:00:00Z"), "en", "Asia/Dubai");
if (before === after || !before || !after) fail(`Hijri date does not change at midnight: ${before} / ${after}`);

// a position in Berlin takes the Muslim World League, one in Dubai the Dubai method, one in Istanbul the Hanafi Asr
if (spotFromPosition(52.4, 13.3, "Europe/Berlin").method !== "MuslimWorldLeague") fail("position Berlin: method");
if (spotFromPosition(25.1, 55.2, "Asia/Dubai").method !== "Dubai") fail("position Dubai: method");
if (!spotFromPosition(41.0, 29.0, "Europe/Istanbul").hanafi) fail("position Istanbul: Asr school");

console.log(failed ? `  ${failed} problem(s)` : "  ok");
process.exit(failed ? 1 : 0);
