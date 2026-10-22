"use client";
// The chapter grid of /islam, ordered by the one tradition setting (src/lib/identity.ts), like the app's hub: the own
// tradition's chapters on the main path, the other school's behind "Andere Rechtsschulen". The server renders every
// card in reading order (search engines see all), the browser reorders after hydration.
import { useEffect, useState, type ReactNode } from "react";
import { hubOrderOf } from "@/lib/islam/hub";
import { readTradition, type TraditionChoice } from "@/lib/learn/tradition";

export default function IslamHubGrid({ slugs, cards, other, otherLead }: { slugs: string[]; cards: ReactNode[]; other: string; otherLead: string }) {
  const [trad, setTrad] = useState<TraditionChoice | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { setTrad(readTradition()); }, []);
  const order = hubOrderOf(slugs, trad);
  const li = (i: number) => <li key={i} className="min-w-0">{cards[i]}</li>;
  return (
    <>
      <ol className="mt-8 grid grid-cols-1 gap-3 min-[340px]:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{order.main.map(li)}</ol>
      {order.other.length > 0 && (
        <div className="mt-6">
          <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="isl-card w-full p-4 text-start">
            <span className="block text-[16px] font-semibold">{other} ({order.other.length}) {open ? "−" : "+"}</span>
            <span className="mt-1 block text-[13px] text-muted">{otherLead}</span>
          </button>
          {open && <ol className="mt-4 grid grid-cols-1 gap-3 min-[340px]:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{order.other.map(li)}</ol>}
        </div>
      )}
    </>
  );
}
