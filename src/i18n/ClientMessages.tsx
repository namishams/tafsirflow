import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import NS from "./client-namespaces.json";

type Messages = Record<string, unknown>;
const TABLE = NS as { core: string[]; routes: Record<string, string[]> };

// The texts the browser needs on one part of the site: the namespaces its client components read (worked out from
// the code by scripts/intl-namespaces.mjs at build time), never the whole message file. The development server sends
// everything, so a component added during development never shows a raw key before the next build. INTL_SEND_ALL=1
// (at build time, and for dynamic pages at run time) sends everything again – an emergency switch and the "before" of a
// size comparison.
export default async function ClientMessages({ route, locale, children }: { route: string; locale: string; children: ReactNode }) {
  setRequestLocale(locale);
  const all = (await getMessages()) as Messages;
  const list = TABLE.routes[route];
  let messages: Messages = all;
  if (process.env.NODE_ENV === "production" && process.env.INTL_SEND_ALL !== "1" && list && !list.includes("*") && !TABLE.core.includes("*")) {
    messages = {};
    for (const ns of [...TABLE.core, ...list]) if (all[ns] !== undefined) messages[ns] = all[ns];
  }
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
