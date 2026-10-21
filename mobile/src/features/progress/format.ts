// Numbers and dates exactly as the website prints them with Intl (de-DE / en), written out by hand so the output is
// the same on every device and Hermes build: "1.234" / "1,234", "20. Okt." / "Oct 20", "20. Oktober 2026".
// Every other language uses Intl with its own digits and month names, as the website does; English if Intl fails.
import { intlLocale } from "@/i18n";

const other = (lang: string) => lang !== "de" && lang !== "en";
function viaIntl(lang: string, f: (loc: string) => string, fallback: () => string): string {
  try { return f(intlLocale(lang)); } catch { return fallback(); }
}

/** Intl.NumberFormat(locale, { maximumFractionDigits }) for German and English */
export function formatNumber(n: number, lang: string, maxFrac = 0, minFrac = 0): string {
  if (!Number.isFinite(n)) return "–";
  if (other(lang)) return viaIntl(lang, (loc) => new Intl.NumberFormat(loc, { maximumFractionDigits: maxFrac, minimumFractionDigits: minFrac }).format(n), () => formatNumber(n, "en", maxFrac, minFrac));
  const de = lang === "de";
  const neg = n < 0;
  let s = Math.abs(n).toFixed(maxFrac);
  if (maxFrac > minFrac && s.includes(".")) {
    // drop trailing zeros down to the minimum number of fraction digits
    let [i, f] = s.split(".");
    while (f.length > minFrac && f.endsWith("0")) f = f.slice(0, -1);
    s = f.length ? `${i}.${f}` : i;
  }
  const [int, frac] = s.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, de ? "." : ",");
  return `${neg ? "-" : ""}${grouped}${frac ? (de ? "," : ".") + frac : ""}`;
}

/** a calendar year (Hijri or Gregorian) without thousands separator: "1448", never "1,448" or "1.448" */
export function formatYear(y: number, lang: string): string {
  if (!Number.isFinite(y)) return "–";
  if (other(lang)) return viaIntl(lang, (loc) => new Intl.NumberFormat(loc, { useGrouping: false, maximumFractionDigits: 0 }).format(y), () => String(Math.round(y)));
  return String(Math.round(y));
}

const MONTH_SHORT = {
  de: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
const MONTH_LONG = {
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const pick = <T,>(o: { de: T; en: T }, lang: string) => (lang === "de" ? o.de : o.en);

/** a day number (days since 1970-01-01, UTC) as "20. Okt." / "Oct 20" */
export function dayLabel(day: number, lang: string): string {
  const d = new Date(day * 86400000);
  if (other(lang)) return viaIntl(lang, (loc) => new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", timeZone: "UTC" }).format(d), () => dayLabel(day, "en"));
  const m = pick(MONTH_SHORT, lang)[d.getUTCMonth()];
  return lang === "de" ? `${d.getUTCDate()}. ${m}` : `${m} ${d.getUTCDate()}`;
}

/** a local date as "20. Okt." / "Oct 20" */
export function shortDate(d: Date, lang: string): string {
  if (other(lang)) return viaIntl(lang, (loc) => new Intl.DateTimeFormat(loc, { day: "numeric", month: "short" }).format(d), () => shortDate(d, "en"));
  const m = pick(MONTH_SHORT, lang)[d.getMonth()];
  return lang === "de" ? `${d.getDate()}. ${m}` : `${m} ${d.getDate()}`;
}

/** an ISO timestamp as "20. Oktober 2026" / "October 20, 2026" */
export function longDate(iso: string | null, lang: string): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  if (other(lang)) return viaIntl(lang, (loc) => new Intl.DateTimeFormat(loc, { day: "numeric", month: "long", year: "numeric" }).format(d), () => longDate(iso, "en"));
  const m = pick(MONTH_LONG, lang)[d.getMonth()];
  return lang === "de" ? `${d.getDate()}. ${m} ${d.getFullYear()}` : `${m} ${d.getDate()}, ${d.getFullYear()}`;
}

/** weekday as one letter (Intl weekday: "narrow") */
export function narrowWeekday(d: Date, lang: string): string {
  if (other(lang)) return viaIntl(lang, (loc) => new Intl.DateTimeFormat(loc, { weekday: "narrow" }).format(d), () => narrowWeekday(d, "en"));
  return (lang === "de" ? "SMDMDFS" : "SMTWTFS")[d.getDay()];
}
