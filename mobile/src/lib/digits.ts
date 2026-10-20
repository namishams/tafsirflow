import { createElement, type ReactNode } from "react";

// Arabic-script languages write numbers with their own digits: Arabic ٠١٢٣٤٥٦٧٨٩, Persian, Urdu and Pashto
// ۰۱۲۳۴۵۶۷۸۹ (and Bengali, as on the website, ০১২৩৪৫৬৭৮৯). Instead of formatting every number by hand, React
// Native's Text is wrapped once at start: every string it shows gets the digits of the app language. Addresses
// (e-mail, web) keep their Latin digits.
const ARABIC = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED = "۰۱۲۳۴۵۶۷۸۹";
const BENGALI = "০১২৩৪৫৬৭৮৯";
let table: string | null = null;

/** called by the language provider whenever the app language changes */
export function setDigitLanguage(lang: string) {
  table = lang === "ar" ? ARABIC : lang === "fa" || lang === "ur" || lang === "ps" ? EXTENDED : lang === "bn" ? BENGALI : null;
}

/** "17:52" -> "١٧:٥٢" in Arabic; unchanged in Latin-script languages and for e-mail or web addresses */
export function localDigits(s: string): string {
  if (!table || !/[0-9]/.test(s) || /@|:\/\/|www\./.test(s)) return s;
  const t = table;
  const out = s.replace(/[0-9]/g, (d) => t[d.charCodeAt(0) - 48]);
  if (t === BENGALI) return out;
  // Arabic-script number signs: decimal ٫ between digits, percent ٪
  return out.replace(/([٠-٩۰-۹])\.(?=[٠-٩۰-۹])/g, "$1٫").replace(/([٠-٩۰-۹])\s?%|%\s?(?=[٠-٩۰-۹])/g, (m, d) => (d ? `${d}٪` : "٪"));
}

function convert(children: ReactNode): ReactNode {
  if (!table) return children;
  if (typeof children === "string") return localDigits(children);
  if (typeof children === "number") return localDigits(String(children));
  if (Array.isArray(children)) return children.map(convert);
  return children;
}

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
// Screens import Text from "react-native", whose index exposes it through a configurable getter; that getter is
// replaced once, before the first screen renders, so every Text in the app shows the language's digits.
export function installLocalDigits() {
  try {
    const RN = require("react-native");
    const Original = RN.Text;
    if (!Original || Original.__localDigits) return;
    const DigitText = (props: any) => createElement(Original, props, convert(props.children));
    DigitText.displayName = "Text";
    DigitText.__localDigits = true;
    Object.defineProperty(RN, "Text", { configurable: true, enumerable: true, get: () => DigitText });
  } catch {
    // the app keeps Latin digits rather than failing
  }
}
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
