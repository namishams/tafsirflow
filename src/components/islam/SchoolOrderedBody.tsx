"use client";
// A chapter body with school positions ("- **Hanafi:** …", lib/islam/hub.ts orderSchools): the server renders the
// reading order, and on the device a Shia learner (tradition setting, device only) sees the Ja'fari line first.
import Markdown from "@/components/Markdown";
import { useTraditionChoice } from "@/components/identity/TraditionChoice";
import { orderSchools } from "@/lib/islam/hub";

export default function SchoolOrderedBody({ text }: { text: string }) {
  const trad = useTraditionChoice();
  return <Markdown text={orderSchools(text, trad)} variant="article" />;
}
