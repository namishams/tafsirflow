// CEFR level names (A1 … C1) keep their Latin digits in Arabic-script locales: LocalDigits (src/components/LocalDigits.tsx)
// turns every digit of the page into the language's digits, except inside [data-latin-digits]. cefr() wraps each level
// name of a text in such a span; the rest of the text keeps the local digits.
const RE = /([ABC][12])/;

export function cefr(text: string): React.ReactNode {
  if (!RE.test(text)) return text;
  return text.split(RE).map((part, i) => (i % 2 ? <span key={i} data-latin-digits="">{part}</span> : part));
}
