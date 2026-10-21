"use client";
// mirrors mobile/src/features/shams2/Mutashabihat.tsx: /shams/mutashabihat – the similar verses: study a group side by
// side (differing words in gold), then an interleaved drill (the groups are mixed, so the learner has to discriminate,
// not just repeat) with two kinds of questions: "which wording belongs here?" and "where is this verse?". Answers feed
// the quality score and the weak spots. Verse text always from the Quran API.
import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/learn/i18n";
import { loadVerse, type VerseData } from "@/lib/learn/srs/verse";
import { gEvent } from "@/lib/learn/feed/gamify";
import { useShams2 } from "@/lib/learn/shams2/model";
import { MUT_GROUPS, MUT_REVIEW, MUT_SOURCES, distinctPositions, type MutGroup } from "@/lib/learn/shams2/mutData";
import { noteMut, noteWords } from "@/lib/learn/shams2/store";
import { useS2 } from "@/lib/learn/shams2/text";
import { useHydrated } from "@/lib/learn/store";
import { Card, GoldButton, LearnHero, LearnMain, Option, Spinner } from "@/components/learn/ui";
import { NamesProvider, Segmented, SmallBtn, SourceNote, Term, useBack, useNames, useWebT, type NameRow } from "./ui";
import { ContinueNext } from "./Continue";

type Q = { kind: "complete" | "locate"; key: string; group: MutGroup };

function useGroupData(groups: MutGroup[]) {
  const { lang } = useLang();
  const keys = useMemo(() => [...new Set(groups.flatMap((g) => g.keys))], [groups]);
  const [data, setData] = useState<Record<string, VerseData>>({});
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setFailed(false);
    Promise.all(keys.map((k) => loadVerse(k, lang).then((d) => [k, d] as const)))
      .then((all) => { if (alive) setData(Object.fromEntries(all)); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [keys, lang]);
  const ready = keys.every((k) => data[k]);
  const distinct = useMemo(() => {
    const out: Record<string, number[]> = {};
    if (!ready) return out;
    for (const g of groups) for (const k of g.keys) out[k] = distinctPositions(data[k].words, g.keys.filter((x) => x !== k).map((x) => data[x].words));
    return out;
  }, [ready, data, groups]);
  return { data, ready, failed, distinct };
}

function ArWords({ d, mark, mask }: { d: VerseData; mark?: number[]; mask?: number[] }) {
  return (
    <p lang="ar" dir="rtl" className="flex flex-wrap gap-1">
      {d.words.map((w) => {
        const hide = mask?.includes(w.position), m = mark?.includes(w.position);
        return (
          <span key={w.position} className={`font-arabic rounded px-1 text-[23px] leading-[1.85] ${hide || m ? "text-[rgb(var(--hm-gold-d))]" : ""} ${m ? "bg-[rgb(var(--hm-gold))]/[0.16]" : ""}`}>
            {hide ? "…" : w.text}
          </span>
        );
      })}
    </p>
  );
}

const shuffle = <T,>(xs: T[], seed: number) => { const a = [...xs]; let s = seed || 1; for (let i = a.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
/** interleave: no two questions of the same group in a row where it can be avoided */
function interleave(qs: Q[]): Q[] {
  const out: Q[] = [];
  const rest = [...qs];
  while (rest.length) { const i = rest.findIndex((q) => q.group.id !== out.at(-1)?.group.id); out.push(rest.splice(i < 0 ? 0 : i, 1)[0]); }
  return out;
}

function Screen() {
  const { s, cl, nf } = useS2();
  const { name } = useNames();
  const hydrated = useHydrated();
  const { known } = useShams2();
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const mine = useMemo(() => (hydrated ? MUT_GROUPS.filter((g) => g.keys.some((k) => known.has(k))) : []), [known, hydrated]);
  const groups = scope === "mine" && mine.length ? mine : MUT_GROUPS;
  const [study, setStudy] = useState<MutGroup | null>(null);
  const [drill, setDrill] = useState<MutGroup[] | null>(null);
  const ref = (k: string) => { const [a, b] = k.split(":"); return `${name(Number(a))} ${nf(Number(b))}`; };
  useEffect(() => { if (study || drill) window.scrollTo({ top: 0 }); }, [study, drill]);
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={s("mutTitle")} lead={s("mutLead")} word="متشابهات" uid="s2m" />
      <LearnMain className="grid gap-5">
        {drill ? <Drill groups={drill} onClose={() => setDrill(null)} refOf={ref} /> : study ? <Study g={study} onBack={() => setStudy(null)} onDrill={() => setDrill([study])} refOf={ref} /> : (
          <>
            <Term id="mutashabihat" />
            {mine.length ? <Segmented value={scope} options={[["mine", s("inMyHifz")], ["all", s("allGroups")]]} onChange={setScope} /> : hydrated ? <p className="text-[14px] text-muted">{s("mutNoneYet")}</p> : null}
            <GoldButton className="w-fit" onClick={() => setDrill(shuffle(groups, Date.now() % 9973).slice(0, 6))}>{s("startDrill")}</GoldButton>
            <ul className="grid gap-2.5">
              {groups.map((g) => (
                <li key={g.id}>
                  <button type="button" onClick={() => setStudy(g)} className="hm-card hm-lift relative grid w-full gap-1 p-4 text-start">
                    <span className="text-[15.5px] font-semibold">{g.topic[cl] || g.topic.en}</span>
                    <span className="text-[13px] text-muted">{g.keys.map(ref).join(" · ")}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-[13px] leading-relaxed text-muted">{s("mutNote")}</p>
            <SourceNote src={[...MUT_SOURCES, "interleave", "quranApi"]} review={MUT_REVIEW} />
          </>
        )}
      </LearnMain>
    </>
  );
}

function Study({ g, onBack, onDrill, refOf }: { g: MutGroup; onBack: () => void; onDrill: () => void; refOf: (k: string) => string }) {
  const { s, cl } = useS2();
  const w = useWebT();
  const groups = useMemo(() => [g], [g]);
  const { data, ready, failed, distinct } = useGroupData(groups);
  return (
    <div className="grid gap-4">
      <SmallBtn onClick={onBack}><span aria-hidden className="rtl:-scale-x-100">←</span>{s("back")}</SmallBtn>
      <h2 className="font-display text-[24px]">{g.topic[cl] || g.topic.en}</h2>
      {failed ? <p className="text-muted">{s("loadFailed")}</p> : !ready ? <Spinner label={w.loading} /> : g.keys.map((k) => (
        <Card key={k} className="grid gap-2">
          <p className="text-[13.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{refOf(k)}</p>
          <ArWords d={data[k]} mark={distinct[k]} />
          {data[k].translation && <p className="text-[13.5px] leading-relaxed text-muted">{data[k].translation}</p>}
        </Card>
      ))}
      <p className="text-[13px] text-muted">{s("goldDiff")}</p>
      <GoldButton className="w-fit" onClick={onDrill}>{s("drillGroup")}</GoldButton>
      <SourceNote src={[...MUT_SOURCES, "quranApi"]} review={MUT_REVIEW} />
    </div>
  );
}

function Drill({ groups, onClose, refOf }: { groups: MutGroup[]; onClose: () => void; refOf: (k: string) => string }) {
  const { s, nf } = useS2();
  const w = useWebT();
  const { data, ready, failed, distinct } = useGroupData(groups);
  const qs = useMemo(() => interleave(shuffle(groups.flatMap((g) => g.keys.flatMap((key) => [{ kind: "complete" as const, key, group: g }, { kind: "locate" as const, key, group: g }])), groups.length * 7 + 3)), [groups]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  if (failed) return <p className="text-muted">{s("loadFailed")}</p>;
  if (!ready) return <Spinner label={w.loading} />;
  if (i >= qs.length) {
    return (
      <Card className="grid gap-3">
        <p className="font-display text-[24px]" role="status">{s("drillDone", { n: nf(right), total: nf(qs.length) })}</p>
        <div className="flex flex-wrap gap-2">
          <GoldButton onClick={() => { setI(0); setRight(0); setPicked(null); }}>{s("again")}</GoldButton>
          <SmallBtn onClick={onClose}>{s("back")}</SmallBtn>
        </div>
        <ContinueNext />
      </Card>
    );
  }
  const q = qs[i];
  const seg = (k: string) => distinct[k].map((p) => data[k].words.find((x) => x.position === p)?.text ?? "").join(" ");
  const options = q.kind === "complete" ? [...new Map(q.group.keys.map((k) => [seg(k), k])).entries()].map(([label, k]) => ({ id: k, label })) : q.group.keys.map((k) => ({ id: k, label: refOf(k) }));
  const isRight = (id: string) => (q.kind === "complete" ? seg(id) === seg(q.key) : id === q.key);
  const answer = (id: string) => {
    if (picked) return;
    setPicked(id);
    const ok = isRight(id);
    if (ok) setRight(right + 1);
    noteMut(q.key, ok);
    if (!ok) noteWords(q.key, distinct[q.key].map((p) => ({ position: p, ok: false })));
    gEvent({ t: "quiz", right: ok });
  };
  return (
    <div className="grid gap-3">
      <p className="text-[13px] font-semibold text-muted">{`${nf(i + 1)} / ${nf(qs.length)}`}</p>
      <Card className="grid gap-2">
        <p className="text-[16px] font-bold">{q.kind === "complete" ? s("qComplete", { ref: refOf(q.key) }) : s("qLocate")}</p>
        <ArWords d={data[q.key]} mask={q.kind === "complete" && !picked ? distinct[q.key] : undefined} mark={picked ? distinct[q.key] : undefined} />
      </Card>
      <div className="grid gap-2">
        {options.map((o) => {
          const ok = isRight(o.id), chosen = picked === o.id;
          return (
            <Option key={o.id} onClick={() => answer(o.id)} disabled={!!picked} state={!picked ? "idle" : ok ? "right" : chosen ? "wrong" : "dim"} dir={q.kind === "complete" ? "rtl" : undefined}>
              {q.kind === "complete" ? <span lang="ar" className="font-arabic text-[22px] leading-[1.8]">{o.label}</span> : o.label}
            </Option>
          );
        })}
      </div>
      {picked && (
        <>
          <p className={`text-[14.5px] font-semibold ${isRight(picked) ? "text-accent" : "text-[rgb(var(--hm-gold-d))]"}`} role="status">{isRight(picked) ? s("right") : s("wrongRef", { ref: refOf(q.key) })}</p>
          <GoldButton className="w-fit" onClick={() => { setPicked(null); setI(i + 1); }}>{s("next")}</GoldButton>
        </>
      )}
    </div>
  );
}

export function MutashabihatScreen({ names }: { names?: NameRow[] }) {
  return <NamesProvider names={names ?? null}><Screen /></NamesProvider>;
}
