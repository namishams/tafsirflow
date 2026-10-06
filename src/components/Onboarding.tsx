"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { readGoal, type Goal } from "@/lib/coach";
import { readSrs } from "@/lib/learning";
import { readJSON, writeJSON } from "@/lib/storage";
import { SessionStart } from "./SessionStart";

type Read = Goal["read"]; type Aim = Goal["aim"];
const MINUTES = [5, 10, 20, 30];

// Three questions on the first visit – then a personal path: reading course, placement test or the Shams session
export default function Onboarding() {
  const t = useTranslations("onboard");
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [read, setRead] = useState<Read | null>(null);
  const [aim, setAim] = useState<Aim | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  useEffect(() => {
    const g = readGoal();
    setGoal(g);
    setShow(!g && Object.keys(readSrs()).length === 0 && !readJSON<boolean>("tf:onboardSkip", false));
  }, []);
  if (!show) return null;

  const save = (minutes: number) => { const g: Goal = { read: read!, aim: aim!, minutes, at: Date.now() }; writeJSON("tf:goal", g); setGoal(g); setStep(3); };
  const opt = (on: boolean) => `w-full rounded-xl border p-4 text-start transition ${on ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/12" : "border-white/15 hover:border-white/40"}`;
  const path = goal && (goal.read === "no" ? { href: "/arabic", key: "pRead" } : goal.read === "some" ? { href: "/arabic/placement", key: "pPlace" } : goal.aim === "hifz" ? { href: "/plan", key: "pHifz" } : goal.aim === "read" ? { href: "/khatm", key: "pKhatm" } : goal.aim === "understand" ? { href: "/surah/1", key: "pUnderstand" } : null);

  return (
    <section className="stage girih relative mt-6 overflow-hidden rounded-2xl p-5 text-[#eef0f3] sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--gold))]">{t("kicker")} · {Math.min(step + 1, 3)}/3</p>
        {step < 3 && <button onClick={() => { writeJSON("tf:onboardSkip", true); setShow(false); }} className="text-[13px] text-white/55 hover:text-white">{t("skip")}</button>}
      </div>
      <div className="mt-3 flex gap-1" aria-hidden>{[0, 1, 2].map((i) => <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-[rgb(var(--gold))]" : "bg-white/15"}`} />)}</div>
      <div key={step} className="step-in mt-5">
        {step === 0 && (<>
          <h2 className="font-display text-2xl sm:text-3xl">{t("q1")}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">{(["no", "some", "fluent"] as Read[]).map((r) => <button key={r} onClick={() => { setRead(r); setStep(1); }} className={opt(read === r)}><span className="font-semibold">{t(`r_${r}`)}</span><span className="mt-1 block text-[13px] text-white/60">{t(`r_${r}D`)}</span></button>)}</div>
        </>)}
        {step === 1 && (<>
          <h2 className="font-display text-2xl sm:text-3xl">{t("q2")}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{(["juzamma", "hifz", "read", "understand"] as Aim[]).map((a) => <button key={a} onClick={() => { setAim(a); setStep(2); }} className={opt(aim === a)}><span className="font-semibold">{t(`a_${a}`)}</span><span className="mt-1 block text-[13px] text-white/60">{t(`a_${a}D`)}</span></button>)}</div>
        </>)}
        {step === 2 && (<>
          <h2 className="font-display text-2xl sm:text-3xl">{t("q3")}</h2>
          <div className="mt-4 grid grid-cols-4 gap-2">{MINUTES.map((m) => <button key={m} onClick={() => save(m)} className={`${opt(false)} text-center`}><span className="font-display block text-3xl">{m}</span><span className="text-[12px] text-white/60">{t("min")}</span></button>)}</div>
          <p className="mt-3 text-[13px] text-white/55">{t("q3D")}</p>
        </>)}
        {step === 3 && goal && (<>
          <p className="font-callig gold-sheen text-4xl leading-tight" dir="rtl">بارك الله فيك</p>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl">{t("ready")}</h2>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/75">{path ? t(path.key) : t("pSession", { min: goal.minutes })}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {path ? <Link href={path.href} className="btn-gold inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{t("go")} →</Link> : <SessionStart />}
            <button onClick={() => setShow(false)} className="text-[13px] text-white/60 hover:text-white">{t("later")}</button>
          </div>
        </>)}
      </div>
    </section>
  );
}
