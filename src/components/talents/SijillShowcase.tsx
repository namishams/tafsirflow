import type { ReactNode } from "react";
import type { Sijill } from "@/lib/sijill";
import type { PublicMoment } from "@/lib/sijillPublic";
import { GRADE_TR, sijillText, type SwKey } from "@/lib/sijillWeb";
import { fill } from "@/lib/talentsWeb";
import { momentLine } from "@/lib/sijillMoment";
export { momentLine };
import TreeIllustration from "./TreeIllustration";
import MomentReactions from "./MomentReactions";

// The Sijill (academic record) on the public talent profile: emerald and gold panels for the sections the member
// shows, the garden tree as a static illustration, and recent achievement moments with the preset encouragements.
type Tx = Record<SwKey, string>;

function Panel({ title, checked, children, tx }: { title: string; checked?: boolean; children: ReactNode; tx: Tx }) {
  return (
    <section className="rounded-xl border border-[rgb(var(--gold))]/35 bg-[rgb(8,38,29)] p-5 text-[#eef0f3]">
      <div className="flex items-center gap-2">
        <h3 className="flex-1 text-[15px] font-bold text-[#f3e2b6]">{title}</h3>
        {checked ? <span className="text-[12px] font-semibold text-[rgb(var(--gold))]">{tx.checked}</span> : null}
      </div>
      <div className="mt-3 grid gap-2 text-[14.5px] leading-relaxed">{children}</div>
    </section>
  );
}
const Pill = ({ children }: { children: ReactNode }) => <span className="rounded-full border border-[rgb(var(--gold))]/60 bg-[rgb(var(--gold))]/10 px-3 py-1 text-[12.5px] font-semibold text-[rgb(var(--gold))]">{children}</span>;
const Muted = ({ children }: { children: ReactNode }) => <p className="text-[13px] text-white/60">{children}</p>;
const Big = ({ children }: { children: ReactNode }) => <p className="font-display text-2xl text-[#f3e2b6]">{children}</p>;

export function TreeBannerWeb({ tree, locale }: { tree: NonNullable<Sijill["tree"]>; locale: string }) {
  const tx = sijillText(locale);
  const type = tx[`tree_${tree.type}` as SwKey] ?? tree.type;
  const label = [tree.name, type, fill(tx.treeStage, { n: tree.stage }), tree.days ? fill(tx.treeAge, { n: tree.days }) : ""].filter(Boolean).join(", ");
  return (
    <figure className="relative overflow-hidden rounded-xl ring-1 ring-[rgb(var(--gold))]/40">
      <TreeIllustration type={tree.type} stage={tree.stage} label={label} />
      <figcaption className="absolute left-4 top-4 max-w-[55%] text-[#f3e2b6]">
        {tree.name ? <span className="block font-display text-xl leading-tight">{tree.name}</span> : null}
        <span className="block text-[13.5px] font-semibold">{type}</span>
        <span className="block text-[12.5px] opacity-85">{fill(tx.treeStage, { n: tree.stage })}</span>
        {tree.days ? <span className="block text-[12.5px] opacity-85">{fill(tx.treeAge, { n: tree.days })}</span> : null}
      </figcaption>
    </figure>
  );
}

export default function SijillShowcase({ s, moments, locale }: { s: Sijill; moments: PublicMoment[]; locale: string }) {
  const tx = sijillText(locale);
  const nf = new Intl.NumberFormat(locale);
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const any = !!(s.level || s.hifz || s.tree || s.stickers || s.certificates || s.exams || s.memorised || s.time || s.activity || s.courses || s.sharer);
  const days = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2024, 0, 1 + i)).toLocaleDateString(locale, { weekday: "narrow", timeZone: "UTC" }));
  const reactionLabels = { like: tx.react_like, mashallah: tx.react_mashallah, barakallah: tx.react_barakallah, barik: tx.react_barik, remove: tx.removeReaction, signIn: tx.reactSignIn, error: tx.error };
  return (
    <div className="grid gap-4">
      {!any ? <p className="text-muted">{tx.hiddenAll}</p> : null}
      {s.level ? (
        <section className="flex flex-wrap items-center gap-4 rounded-xl border-2 border-[rgb(var(--gold))]/70 bg-[rgb(5,28,21)] p-5 text-[#eef0f3]">
          <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-[#c6a65e] bg-[rgb(var(--gold))]/10 font-display text-2xl text-[#f3e2b6]">{s.level.level}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--gold))] rtl:tracking-normal">{tx.sijill} · {tx.title}</p>
            <p className="font-display text-xl text-[#f3e2b6]">{tx[`stage_${s.level.stage}` as SwKey]}</p>
            <p className="text-[13.5px] text-white/75">{tx[`rank_${s.level.rank}` as SwKey]}{s.level.overall !== null ? ` · ${fill(tx.overall, { n: s.level.overall })}` : ""}</p>
          </div>
          <div className="flex flex-wrap gap-2"><Pill>{fill(tx.xpN, { n: nf.format(s.level.xp) })}</Pill>{s.reactions ? <Pill>{fill(tx.encouragements, { n: nf.format(s.reactions) })}</Pill> : null}</div>
        </section>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {s.hifz ? (
          <Panel title={tx.sec_hifz} tx={tx}>
            <p className="font-display text-xl text-[#f3e2b6]">{GRADE_TR[s.hifz.grade - 1]} · {fill(tx.hifzGrade, { n: s.hifz.grade })}</p>
            <Muted>{fill(tx.hifzVerses, { n: nf.format(s.hifz.verses) })} · {fill(tx.hifzTests, { n: nf.format(s.hifz.tests) })}</Muted>
          </Panel>
        ) : null}
        {s.time ? (
          <Panel title={tx.sec_time} tx={tx}>
            <Big>{fill(tx.timeTotal, { n: nf.format(Math.round(s.time.totalMin / 60)) })}</Big>
            <Muted>{[fill(tx.timeWeek, { n: nf.format(s.time.weekMin) }), fill(tx.streak, { n: s.time.streak }), fill(tx.bestStreak, { n: s.time.best })].join(" · ")}</Muted>
          </Panel>
        ) : null}
      </div>
      {s.memorised ? (
        <Panel title={tx.sec_memorised} tx={tx}>
          <Big>{fill(tx.memVerses, { n: nf.format(s.memorised.verses) })}</Big>
          <Muted>{fill(tx.memJuzDone, { n: s.memorised.juz.filter((p) => p >= 100).length })}{s.memorised.current ? ` · ${fill(tx.currentSurah, { s: String(s.memorised.current) })}` : ""}</Muted>
          <p className="text-[12px] font-semibold text-white/60">{tx.byJuz}</p>
          <ol className="grid grid-cols-6 gap-1 sm:grid-cols-10">
            {s.memorised.juz.map((p, i) => (
              <li key={i} title={`${i + 1}: ${p} %`} className={`grid aspect-[1.4] place-items-center rounded text-[11px] font-bold ${p >= 100 ? "bg-[#c6a65e] text-[rgb(8,38,29)]" : "text-[#f3e2b6]"}`}
                style={p >= 100 ? undefined : { background: p > 0 ? `rgba(214,180,108,${0.12 + (p / 100) * 0.6})` : "rgba(255,255,255,0.05)" }}>{i + 1}</li>
            ))}
          </ol>
          <p className="text-[12px] font-semibold text-white/60">{tx.bySurah}</p>
          <div className="flex flex-wrap gap-[2px]" aria-hidden>
            {s.memorised.surahs.map((p, i) => <span key={i} className="h-[11px] w-[11px] rounded-[2px]" style={{ background: p >= 100 ? "#c6a65e" : p > 0 ? `rgba(214,180,108,${0.15 + (p / 100) * 0.6})` : "rgba(255,255,255,0.06)" }} />)}
          </div>
          <Muted>{tx.heatHint}</Muted>
        </Panel>
      ) : null}
      {s.certificates ? (
        <Panel title={tx.sec_certificates} checked={s.certificates.length > 0} tx={tx}>
          {s.certificates.length ? <ul className="grid gap-2">{s.certificates.map((c) => (
            <li key={c.url} className="flex items-center gap-3">
              <span className="min-w-0 flex-1"><span className="block font-semibold">{c.title}</span><span className="block text-[13px] text-white/60">{c.pct} % · {date(c.at)}</span></span>
              <a href={c.url} className="rounded-full border border-[rgb(var(--gold))]/70 px-3 py-1 text-[13px] font-semibold text-[rgb(var(--gold))] hover:bg-[rgb(var(--gold))]/10">{tx.verify}</a>
            </li>
          ))}</ul> : <Muted>{tx.noCertificates}</Muted>}
        </Panel>
      ) : null}
      {s.exams ? (
        <Panel title={tx.sec_exams} checked={s.exams.length > 0} tx={tx}>
          {s.exams.length ? <div className="flex flex-wrap gap-2">{s.exams.map((e) => <Pill key={`${e.exam}:${e.ref}`}>{fill(tx[`exam_${e.exam}` as SwKey] ?? e.exam, { n: e.ref })} · {e.pct} %</Pill>)}</div> : <Muted>{tx.noExams}</Muted>}
        </Panel>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {s.activity ? (
          <Panel title={tx.sec_activity} tx={tx}>
            <p className="font-semibold">{fill(tx.levelN, { n: s.activity.level })} · {fill(tx.xpN, { n: nf.format(s.activity.xp) })}</p>
            <div className="flex h-24 items-end gap-2" aria-hidden>
              {s.activity.week.map((n, i) => { const max = Math.max(1, ...s.activity!.week); return (
                <span key={i} className="flex flex-1 flex-col items-center gap-1"><span className="w-full rounded" style={{ height: Math.max(3, Math.round((n / max) * 64)), background: n ? "#c6a65e" : "rgba(255,255,255,0.08)" }} /><span className="text-[11px] text-white/60">{days[i]}</span></span>
              ); })}
            </div>
            <Muted>{fill(tx.weekActive, { n: s.activity.active })}</Muted>
          </Panel>
        ) : null}
        {s.stickers ? (
          <Panel title={tx.sec_stickers} tx={tx}>
            <Big>{fill(tx.stickersTotal, { n: nf.format(s.stickers.total), m: nf.format(s.stickers.catalog) })}</Big>
            <Muted>{[s.stickers.legendaryN && fill(tx.legendaryN, { n: s.stickers.legendaryN }), s.stickers.epic && fill(tx.epicN, { n: s.stickers.epic }), s.stickers.rare && fill(tx.rareN, { n: s.stickers.rare }), s.stickers.series.length && fill(tx.seriesDoneN, { n: s.stickers.series.length })].filter(Boolean).join(" · ")}</Muted>
          </Panel>
        ) : null}
        {s.courses ? (
          <Panel title={tx.sec_courses} tx={tx}>
            <Big>{fill(tx.coursesDone, { n: s.courses.done })}</Big>
            {s.courses.arLevels.length ? <div className="flex flex-wrap gap-2">{s.courses.arLevels.map((l) => <Pill key={l}>{fill(tx.arabicLevel, { l })}</Pill>)}</div> : null}
            <Muted>{[s.courses.qaida && fill(tx.qaidaN, { n: s.courses.qaida }), s.courses.arabic && fill(tx.arabicN, { n: s.courses.arabic }), s.courses.rp && fill(tx.rpN, { n: s.courses.rp })].filter(Boolean).join(" · ")}</Muted>
          </Panel>
        ) : null}
        {s.sharer ? (
          <Panel title={tx.sec_sharer} tx={tx}>
            <p className="font-semibold">{fill(tx.sharerTier, { n: s.sharer.tier })}</p>
            <Muted>{fill(tx.sharesN, { n: nf.format(s.sharer.shares) })}</Muted>
          </Panel>
        ) : null}
      </div>
      {moments.length ? (
        <section className="mt-4 grid gap-3">
          <h3 className="font-display text-xl">{tx.tabMoments}</h3>
          {moments.map((m) => (
            <article key={m.id} className="rounded-lg border border-line bg-surface p-4">
              <p className="font-semibold">{momentLine(m, tx)}</p>
              <p className="mb-3 text-[12.5px] text-muted">{date(m.at)}</p>
              <MomentReactions id={m.id} counts={m.counts} mine={null} own={false} l={reactionLabels} />
            </article>
          ))}
        </section>
      ) : null}
      {any ? <p className="text-[13px] text-muted">{tx.publicNote}</p> : null}
    </div>
  );
}
