import type { ReactNode } from "react";
import RevealEmail from "./RevealEmail";
import { EMAIL_OR_MARKER, encodeAddress } from "@/lib/protectEmail";

/** a text with ⟦user|domain⟧ markers (or, from code, plain addresses) as nodes: every address becomes a click-to-reveal control */
export function withEmail(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0, i = 0;
  for (const m of text.matchAll(EMAIL_OR_MARKER)) {
    const [user, host] = m[1] !== undefined ? [m[1], m[2]] : [m[3].slice(0, m[3].lastIndexOf("@")), m[3].slice(m[3].lastIndexOf("@") + 1)];
    if (m.index! > last) out.push(text.slice(last, m.index));
    out.push(<RevealEmail key={`em${i++}`} d={encodeAddress(user, host)} />);
    last = m.index! + m[0].length;
  }
  if (last === 0) return [text];
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function EmailText({ text }: { text: string }) {
  return <>{withEmail(text)}</>;
}
