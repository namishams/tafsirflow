// Numbers and dates exactly as the website prints them with Intl (de-DE / en), written out by hand so the output is
// the same on every device and Hermes build: "1.234" / "1,234", "20. Okt." / "Oct 20", "20. Oktober 2026".

/** Intl.NumberFormat(locale, { maximumFractionDigits }) for German and English */
export function formatNumber(n: number, lang: string, maxFrac = 0, minFrac = 0): string {
  if (!Number.isFinite(n)) return "–";
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
  const m = pick(MONTH_SHORT, lang)[d.getUTCMonth()];
  return lang === "de" ? `${d.getUTCDate()}. ${m}` : `${m} ${d.getUTCDate()}`;
}

/** a local date as "20. Okt." / "Oct 20" */
export function shortDate(d: Date, lang: string): string {
  const m = pick(MONTH_SHORT, lang)[d.getMonth()];
  return lang === "de" ? `${d.getDate()}. ${m}` : `${m} ${d.getDate()}`;
}

/** an ISO timestamp as "20. Oktober 2026" / "October 20, 2026" */
export function longDate(iso: string | null, lang: string): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  const m = pick(MONTH_LONG, lang)[d.getMonth()];
  return lang === "de" ? `${d.getDate()}. ${m} ${d.getFullYear()}` : `${m} ${d.getDate()}, ${d.getFullYear()}`;
}

/** weekday as one letter (Intl weekday: "narrow") */
export function narrowWeekday(d: Date, lang: string): string {
  return (lang === "de" ? "SMDMDFS" : "SMTWTFS")[d.getDay()];
}
