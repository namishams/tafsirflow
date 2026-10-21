"use client";
import { useEffect, useState } from "react";
import { tpText, type TpKey } from "@/lib/talentsProfileWeb";

// Edit profile on the website, like the app's ExtrasEditor (owner, 21.10.2026; 1:1): learning goals (the onboarding
// goals), a coarse city or region (never an exact location), travel mode with a destination, and for each who sees it
// (everyone, followers, only me). Same endpoint as the app: /api/community/profile-extras. Without a profile nothing.
type Audience = "everyone" | "followers" | "me";
type Extras = { goals: string[]; city: string; travel: { on: boolean; city: string }; privacy: { goals: Audience; city: Audience; travel: Audience } };
const GOALS = ["read", "understand", "juzamma", "tajweed", "reciter", "daily", "islam", "children"];

export default function ExtrasEditorWeb({ locale }: { locale: string }) {
  const t = tpText(locale);
  const [x, setX] = useState<Extras | null>(null);
  const [state, setState] = useState<"" | "busy" | "saved" | "error">("");
  useEffect(() => {
    fetch("/api/community/profile-extras", { cache: "no-store" }).then(async (r) => { if (r.ok) setX(((await r.json()) as { extras: Extras }).extras); }).catch(() => undefined);
  }, []);
  if (!x) return null;
  const set = (p: Partial<Extras>) => { setX({ ...x, ...p }); setState(""); };
  const save = async () => {
    setState("busy");
    const r = await fetch("/api/community/profile-extras", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(x) }).catch(() => null);
    if (r?.ok) { setX(((await r.json()) as { extras: Extras }).extras); setState("saved"); } else setState("error");
  };
  const audience = (k: keyof Extras["privacy"]) => (
    <div role="radiogroup" aria-label={t.visibleTo} className="flex flex-wrap items-center gap-2 text-[13px]">
      <span className="font-semibold text-muted">{t.visibleTo}</span>
      <span className="inline-flex rounded-full border border-line bg-bg p-1">
        {(["everyone", "followers", "me"] as const).map((a) => (
          <button key={a} type="button" role="radio" aria-checked={x.privacy[k] === a} onClick={() => set({ privacy: { ...x.privacy, [k]: a } })}
            className={`h-8 rounded-full px-3.5 ${x.privacy[k] === a ? "border border-line bg-surface font-bold text-ink" : "font-semibold text-muted"}`}>{t[`vis_${a}` as TpKey]}</button>
        ))}
      </span>
    </div>
  );
  const box = "grid gap-3 rounded-[10px] border border-line bg-surface p-4";
  const field = "h-12 w-full rounded-lg border border-line bg-bg px-3.5 text-[16px]";
  return (
    <section id="extras" className="mt-10 grid scroll-mt-24 gap-4">
      <div className={box}>
        <div><h2 className="text-[15.5px] font-bold">{t.goalsTitle}</h2><p className="text-[13px] text-muted">{t.goalsHint}</p></div>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => {
            const on = x.goals.includes(g);
            return (
              <button key={g} type="button" aria-pressed={on} onClick={() => set({ goals: on ? x.goals.filter((y) => y !== g) : [...x.goals, g] })}
                className={`h-9 rounded-full border px-3.5 text-[13.5px] font-semibold ${on ? "border-ink bg-ink text-bg" : "border-line"}`}>{t[`goal_${g}` as TpKey]}</button>
            );
          })}
        </div>
        {audience("goals")}
      </div>
      <div className={box}>
        <div><h2 className="text-[15.5px] font-bold">{t.cityTitle}</h2><p className="text-[13px] text-muted">{t.cityHint}</p></div>
        <input value={x.city} onChange={(e) => set({ city: e.target.value.replace(/[0-9]/g, "").slice(0, 60) })} aria-label={t.cityTitle} className={field} />
        {audience("city")}
      </div>
      <div className={box}>
        <label className="flex items-start gap-3">
          <span className="min-w-0 flex-1"><span className="block text-[15.5px] font-bold">{t.travelTitle}</span><span className="block text-[13px] text-muted">{t.travelHint}</span></span>
          <input type="checkbox" checked={x.travel.on} onChange={(e) => set({ travel: { ...x.travel, on: e.target.checked } })} className="mt-1 h-6 w-6 accent-[#066c4e]" />
        </label>
        {x.travel.on ? <input value={x.travel.city} onChange={(e) => set({ travel: { ...x.travel, city: e.target.value.replace(/[0-9]/g, "").slice(0, 60) } })} placeholder={t.destination} aria-label={t.destination} className={field} /> : null}
        {audience("travel")}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void save()} disabled={state === "busy"} className="h-12 rounded-lg bg-[#c6a65e] px-6 font-bold text-[rgb(8,38,29)] disabled:opacity-60">{t.confirm}</button>
        {state === "saved" ? <p role="status" className="text-[14px] font-semibold text-accent">{t.saved}</p> : null}
        {state === "error" ? <p role="status" className="text-[14px] text-[rgb(160,58,52)]">{t.e_generic}</p> : null}
      </div>
    </section>
  );
}
