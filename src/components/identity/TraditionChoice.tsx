"use client";
// The tradition on the website: "Sunnitisch" | "Schiitisch (Dschaʿfari / Zwölfer)" | "Beides zeigen". A page of the
// /start identity step and a row in the profile, 1:1 with the app (onboarding question in features/plan/Funnel.tsx,
// TraditionSetting in Account). Rules in src/lib/identity.ts (device only, GDPR Art. 9), texts in src/lib/identityText.ts.
import { useState } from "react";
import { useLocale } from "next-intl";
import { useStored } from "@/lib/learn/store";
import { TRADITIONS, TRADITION_KEY, readTraditionChoice, saveTraditionChoice, type TraditionChoice } from "@/lib/identity";
import { idText, type IdKey } from "@/lib/identityText";
import { GoldButton } from "@/components/learn/ui";

const LABEL: Record<TraditionChoice, IdKey> = { sunni: "tradSunni", shia: "tradShia", both: "tradBoth" };

/** the stored tradition, re-rendering when it changes; null = never chosen (and during server rendering) */
export function useTraditionChoice(): TraditionChoice | null {
  const o = useStored<{ tradition?: unknown } | null>(TRADITION_KEY, null);
  const t = o?.tradition;
  return t === "sunni" || t === "shia" ? t : t === "unsure" ? "both" : null;
}

const optCls = (on: boolean) => `flex min-h-14 w-full items-center justify-center rounded-xl border px-3 py-3 text-center text-[16px] font-semibold text-white transition disabled:cursor-default ${on ? "border-[rgb(214,180,108)] bg-[rgb(214,180,108)]/12" : "border-[rgb(214,180,108)]/25 bg-[rgba(6,30,23,0.62)] hover:border-[rgb(214,180,108)]/60 hover:bg-white/[0.06]"}`;

/** the onboarding page on the dark journey stage; `onDone` after choosing or skipping */
export function TraditionStep({ disabled, onDone }: { disabled?: boolean; onDone: () => void }) {
  const locale = useLocale();
  const tx = (k: IdKey) => idText(locale, k);
  const [trad, setTrad] = useState<TraditionChoice | null>(() => readTraditionChoice());
  return (
    <div>
      <h1 className="font-display mb-2.5 text-[28px] leading-tight sm:text-[32px]">{tx("tradTitle")}</h1>
      <p className="mb-4 text-[15px] leading-relaxed text-white/75">{tx("tradLead")}</p>
      <div role="radiogroup" aria-label={tx("tradTitle")} className="grid gap-2">
        {TRADITIONS.map((x) => (
          <button key={x} type="button" role="radio" aria-checked={trad === x} disabled={disabled} onClick={() => setTrad(x)} className={optCls(trad === x)}>{tx(LABEL[x])}</button>
        ))}
      </div>
      <p className="mt-3.5 text-[12.5px] leading-relaxed text-white/60">{tx("tradPrivacy")}</p>
      {!disabled ? (
        <>
          <GoldButton className="mt-[18px] w-full" onClick={() => { if (trad) saveTraditionChoice(trad); onDone(); }}>{tx("next")}</GoldButton>
          <button type="button" onClick={onDone} className="w-full py-3.5 text-center text-[14px] font-medium text-white/60 hover:text-white">{tx("skip")}</button>
        </>
      ) : null}
    </div>
  );
}

/** the row in the profile (light surface); saves at once */
export function TraditionSetting() {
  const locale = useLocale();
  const tx = (k: IdKey) => idText(locale, k);
  const trad = useTraditionChoice();
  return (
    <div className="grid gap-2">
      <p className="text-[13px] font-semibold text-muted">{tx("tradTitle")}</p>
      <div className="flex flex-wrap gap-1.5">
        {TRADITIONS.map((x) => (
          <button key={x} type="button" aria-pressed={trad === x} onClick={() => saveTraditionChoice(x)}
            className={`rounded-full border px-3.5 py-1.5 text-[14px] font-semibold transition ${trad === x ? "border-accent bg-accent text-white" : "border-line bg-surface text-ink hover:border-accent/60"}`}>{tx(LABEL[x])}</button>
        ))}
      </div>
      <p className="text-[12px] leading-relaxed text-muted">{tx("tradLead")} {tx("tradPrivacy")}</p>
    </div>
  );
}
