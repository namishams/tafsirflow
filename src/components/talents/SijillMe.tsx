"use client";
import { useCallback, useEffect, useState } from "react";
import { sijillText, type SwKey } from "@/lib/sijillWeb";
import { momentLine } from "@/lib/sijillMoment";
import MomentReactions from "./MomentReactions";

// /talents/me on the website: what others see of the own Sijill (every section starts hidden; the record itself is
// updated by the app), the leaderboard opt-in, and the achievements of the people the member follows with the preset
// encouragements. Same API as the app.
const SECTIONS = ["level", "badges", "hifz", "tree", "stickers", "certificates", "exams", "memorised", "time", "activity", "courses", "sharer"] as const;
type Section = (typeof SECTIONS)[number];
type Mine = { updatedAt: string | null; privacy?: Record<Section, boolean>; leaderboard?: boolean };
type Moment = { id: string; kind: string; data: unknown; title: string | null; at: string; own: boolean; mine: "like" | "mashallah" | "barakallah" | "barik" | null; counts: Record<"like" | "mashallah" | "barakallah" | "barik", number>; author: { username: string; name: string } };

export default function SijillMe({ locale }: { locale: string }) {
  const tx = sijillText(locale);
  const [mine, setMine] = useState<Mine | null>(null);
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const [more, setMore] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetch(`/api/community/achievements?locale=${locale}`, { cache: "no-store" }).then(async (r) => { if (r.ok) setMine(((await r.json()) as { sijill: Mine }).sijill); }).catch(() => undefined);
  }, [locale]);
  const loadMoments = useCallback(async (before?: string) => {
    const r = await fetch(`/api/community/moments?locale=${locale}${before ? `&before=${before}` : ""}`, { cache: "no-store" }).catch(() => null);
    if (!r?.ok) { setMoments((m) => m ?? []); return; }
    const d = (await r.json()) as { moments: Moment[]; more: string | null };
    setMoments((m) => (before ? [...(m ?? []), ...d.moments] : d.moments)); setMore(d.more);
  }, [locale]);
  useEffect(() => { void loadMoments(); }, [loadMoments]);
  const save = async (body: { privacy?: Partial<Record<Section, boolean>>; leaderboard?: boolean }) => {
    setMsg("");
    const r = await fetch(`/api/community/achievements?locale=${locale}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    if (!r?.ok) { setMsg(tx.error); return; }
    setMine(((await r.json()) as { sijill: Mine }).sijill);
  };
  if (!mine) return null;
  const labels = { like: tx.react_like, mashallah: tx.react_mashallah, barakallah: tx.react_barakallah, barik: tx.react_barik, remove: tx.removeReaction, signIn: tx.reactSignIn, error: tx.error };
  return (
    <div className="mt-10 grid gap-10">
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">{tx.sijill} · {tx.privacyTitle}</h2>
        <p className="text-[15px] text-muted">{tx.privacyLead}</p>
        <p className="text-[13px] text-muted">{mine.updatedAt ? fill(tx.updated, { d: new Date(mine.updatedAt).toLocaleDateString(locale) }) : tx.notSynced}</p>
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {SECTIONS.map((k) => (
            <li key={k} className="flex items-center gap-3 p-3">
              <label className="flex flex-1 cursor-pointer items-center gap-3">
                <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--hm-gold))]" checked={!!mine.privacy?.[k]} onChange={(e) => void save({ privacy: { [k]: e.target.checked } })} />
                <span><span className="block font-semibold">{tx[`sec_${k}` as SwKey]}</span>{k === "certificates" ? <span className="block text-[13px] text-muted">{tx.certNote}</span> : null}</span>
              </label>
            </li>
          ))}
        </ul>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface p-3">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-[rgb(var(--hm-gold))]" checked={!!mine.leaderboard} onChange={(e) => void save({ leaderboard: e.target.checked })} />
          <span><span className="block font-semibold">{tx.leaderboardOptIn}</span><span className="block text-[13px] text-muted">{tx.leaderboardHint}</span></span>
        </label>
        {msg ? <p role="alert" className="text-[14px] text-muted">{msg}</p> : null}
      </section>
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">{tx.friends}</h2>
        <p className="text-[15px] text-muted">{tx.friendsLead}</p>
        {!moments ? null : !moments.length ? <p className="text-muted">{tx.friendsEmpty}</p> : moments.map((m) => (
          <article key={m.id} className="rounded-lg border border-line bg-surface p-4">
            <p className="text-[13px] font-bold">{m.own ? tx.yourMoment : m.author.name}</p>
            <p className="font-semibold">{momentLine(m, tx)}</p>
            <p className="mb-3 text-[12.5px] text-muted">{new Date(m.at).toLocaleDateString(locale)}</p>
            <MomentReactions id={m.id} counts={m.counts} mine={m.mine} own={m.own} l={labels} />
          </article>
        ))}
        {more ? <button type="button" onClick={() => void loadMoments(more)} className="h-11 rounded-md border border-line px-5 text-sm font-bold">{tx.loadMore}</button> : null}
      </section>
    </div>
  );
}
const fill = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((a, [k, x]) => a.split(`{${k}}`).join(String(x)), s);
