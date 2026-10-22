"use client";
// Brother/sister and age band on the website: the onboarding step of /start (StartFunnel) and the same choice in the
// profile. 1:1 with the app (mobile/src/features/identity/IdentityStep.tsx); rules in src/lib/identity.ts, texts in
// src/lib/identityText.ts. Both answers are optional.
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useStored } from "@/lib/learn/store";
import { AGE_BANDS, IDENTITY_KEY, PRAYER_POSTURES, cleanIdentity, readIdentity, readPosture, saveIdentity, savePosture, type AgeBand, type Gender, type Identity, type PrayerPosture } from "@/lib/identity";
import { SistersSetup } from "@/components/sisters/Sisters";
import { TraditionSetting, TraditionStep } from "./TraditionChoice";
import { idText, restartLabel, type IdKey } from "@/lib/identityText";
import { GoldButton } from "@/components/learn/ui";
import { Link } from "@/i18n/navigation";

const GOLD = "rgb(214,180,108)";

export function useIdT() {
  const locale = useLocale();
  return (k: IdKey) => idText(locale, k);
}
/** the stored identity; "keine Angabe" during server rendering */
export function useIdentity(): Identity {
  return cleanIdentity(useStored<unknown>(IDENTITY_KEY, null));
}

const optCls = (on: boolean) => `flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl border px-3 py-3 text-center transition disabled:cursor-default ${on ? "border-[rgb(214,180,108)] bg-[rgb(214,180,108)]/12" : "border-[rgb(214,180,108)]/25 bg-[rgba(6,30,23,0.62)] hover:border-[rgb(214,180,108)]/60 hover:bg-white/[0.06]"}`;
const chipCls = (on: boolean, dark: boolean) => dark
  ? `rounded-full border px-3.5 py-2 text-[14px] font-semibold transition ${on ? "border-transparent text-[#1a140a]" : "border-[rgb(214,180,108)]/30 bg-[rgba(6,30,23,0.62)] text-white hover:bg-white/[0.06]"}`
  : `rounded-full border px-3.5 py-1.5 text-[14px] font-semibold transition ${on ? "border-accent bg-accent text-white" : "border-line bg-surface text-ink hover:border-accent/60"}`;

/** the /start step on the dark journey stage; `onDone` gets the personal reply the funnel shows */
export function IdentityStep({ disabled, onDone }: { disabled?: boolean; onDone: (reply: string) => void }) {
  const tx = useIdT();
  const [gender, setGender] = useState<Gender | null>(() => readIdentity().gender);
  const [age, setAge] = useState<AgeBand | null>(() => readIdentity().age);
  const [page, setPage] = useState<"who" | "posture" | "tradition" | "sisters">("who");
  const [posture, setPosture] = useState<PrayerPosture | null>(() => readPosture());
  const finish = (store: boolean) => {
    if (!store) { saveIdentity({}); onDone(tx("reply")); return; }
    saveIdentity({ gender, age });
    setPage("posture");
  };
  const afterPosture = (store: boolean) => {
    if (store) savePosture(posture);
    setPage("tradition");
  };
  const afterTradition = () => { if (readIdentity().gender === "sister") setPage("sisters"); else onDone(tx("reply")); };
  const opt = (g: Gender | null, label: string) => (
    <button key={g ?? "none"} type="button" role="radio" aria-checked={gender === g} disabled={disabled} onClick={() => setGender(g)} className={optCls(gender === g)}>
      <span className={g ? "text-[16px] font-semibold text-white" : "text-[13.5px] font-semibold text-white/60"}>{label}</span>
    </button>
  );
  const chip = (key: string, label: string, on: boolean, onClick: () => void) => (
    <button key={key} type="button" aria-pressed={on} disabled={disabled} onClick={onClick} className={chipCls(on, true)} style={on ? { backgroundImage: "linear-gradient(180deg,#e9cf99,#c9a65e)" } : undefined}>{label}</button>
  );
  if (page === "tradition") return <TraditionStep disabled={disabled} onDone={afterTradition} />;
  if (page === "sisters") return <SistersSetup dark onDone={(agreed) => onDone(agreed ? tx("replySister") : tx("reply"))} />;
  if (page === "posture") return (
    <div>
      <h1 className="font-display mb-2.5 text-[28px] leading-tight sm:text-[32px]">{tx("postureTitle")}</h1>
      <p className="mb-4 text-[15px] leading-relaxed text-white/75">{tx("postureLead")}</p>
      <div role="radiogroup" className="grid gap-2">{[...PRAYER_POSTURES, null].map((p) => (
        <button key={p ?? "none"} type="button" role="radio" aria-checked={posture === p} disabled={disabled} onClick={() => setPosture(p)} className={optCls(posture === p)}>
          <span className={p ? "text-[16px] font-semibold text-white" : "text-[13.5px] font-semibold text-white/60"}>{p ? tx(p) : tx("none")}</span>
        </button>
      ))}</div>
      <p className="mt-3.5 text-[12.5px] leading-relaxed text-white/60">{tx("posturePrivacy")}</p>
      {!disabled ? (<>
        <GoldButton className="mt-[18px] w-full" onClick={() => afterPosture(true)}>{tx("next")}</GoldButton>
        <button type="button" onClick={() => afterPosture(false)} className="w-full py-3.5 text-center text-[14px] font-medium text-white/60 hover:text-white">{tx("skip")}</button>
      </>) : null}
    </div>
  );
  return (
    <div>
      <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] rtl:tracking-normal" style={{ color: GOLD }}>{tx("kicker")}</p>
      <h1 className="font-display mb-2.5 text-[28px] leading-tight sm:text-[32px]">{tx("title")}</h1>
      <p className="mb-4 text-[15px] leading-relaxed text-white/75">{tx("lead")}</p>
      <div role="radiogroup" aria-label={tx("title")} className="grid gap-2">
        <div className="flex gap-2">{opt("brother", tx("brother"))}{opt("sister", tx("sister"))}</div>
        <div className="flex">{opt(null, tx("none"))}</div>
      </div>
      <p className="mb-2.5 mt-6 text-[15px] font-semibold text-white">{tx("ageTitle")}</p>
      <div className="flex flex-wrap gap-2">
        {AGE_BANDS.map((b) => chip(b, tx(b), age === b, () => setAge(age === b ? null : b)))}
        {chip("none", tx("none"), age === null, () => setAge(null))}
      </div>
      <p className="mt-3.5 text-[12.5px] leading-relaxed text-white/60">{tx("privacy")}</p>
      {!disabled ? (
        <>
          <GoldButton className="mt-[18px] w-full" onClick={() => finish(true)}>{tx("next")}</GoldButton>
          <button type="button" onClick={() => finish(false)} className="w-full py-3.5 text-center text-[14px] font-medium text-white/60 hover:text-white">{tx("skip")}</button>
        </>
      ) : null}
    </div>
  );
}

/** the same choice in the profile (light surface); saves at once */
export function IdentitySetting() {
  const tx = useIdT();
  const id = useIdentity();
  const [posture, setPostureS] = useState<PrayerPosture | null>(null);
  useEffect(() => { setPostureS(readPosture()); }, []);
  const restart = useRestartLabel();
  const chip = (key: string, label: string, on: boolean, onClick: () => void) => (
    <button key={key} type="button" aria-pressed={on} onClick={onClick} className={chipCls(on, false)}>{label}</button>
  );
  return (
    <section className="hm-card relative grid gap-3 p-5" aria-labelledby="identity-title">
      <div>
        <h2 id="identity-title" className="text-[16px] font-bold text-ink">{tx("settingsTitle")}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{tx("settingsLead")}</p>
      </div>
      <div className="grid gap-2">
        <p className="text-[13px] font-semibold text-muted">{tx("title")}</p>
        <div className="flex flex-wrap gap-1.5">
          {(["brother", "sister"] as const).map((g) => chip(g, tx(g), id.gender === g, () => saveIdentity({ gender: g })))}
          {chip("none", tx("none"), id.gender === null, () => saveIdentity({ gender: null }))}
        </div>
      </div>
      <div className="grid gap-2">
        <p className="text-[13px] font-semibold text-muted">{tx("ageTitle")}</p>
        <div className="flex flex-wrap gap-1.5">
          {AGE_BANDS.map((b) => chip(b, tx(b), id.age === b, () => saveIdentity({ age: b })))}
          {chip("none", tx("none"), id.age === null, () => saveIdentity({ age: null }))}
        </div>
      </div>
      <p className="text-[12px] leading-relaxed text-muted">{tx("privacy")}</p>
      <div className="grid gap-2">
        <p className="text-[13px] font-semibold text-muted">{tx("postureTitle")}</p>
        <div className="flex flex-wrap gap-1.5">
          {PRAYER_POSTURES.map((p) => chip(p, tx(p), posture === p, () => { savePosture(p); setPostureS(p); }))}
          {chip("none", tx("none"), posture === null, () => { savePosture(null); setPostureS(null); })}
        </div>
        <p className="text-[12px] leading-relaxed text-muted">{tx("posturePrivacy")}</p>
      </div>
      <TraditionSetting />
      <Link href="/start?personalise=1" className="text-[13.5px] font-semibold text-accent hover:underline">{restart}</Link>
    </section>
  );
}

function useRestartLabel() { return restartLabel(useLocale()); }
