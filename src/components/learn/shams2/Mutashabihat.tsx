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
import { MUT_CANDIDATES, MUT_GROUPS, MUT_REVIEW, MUT_SOURCES, candidateGroup, distinctPositions, dueMutGroups, isCandidate, type MutGroup } from "@/lib/learn/shams2/mutData";
import { reviewText, useRv } from "@/lib/learn/shams2/review/text";
import { PromptedWords, SpeechCheck, type CheckResult } from "./recite";
import { noteMut, noteWords } from "@/lib/learn/shams2/store";
import { useS2 } from "@/lib/learn/shams2/text";
import { useHydrated } from "@/lib/learn/store";
import { Card, GoldButton, LearnHero, LearnMain, Option, Spinner } from "@/components/learn/ui";
import { NamesProvider, Segmented, SmallBtn, SourceNote, Term, useBack, useNames, useWebT, type NameRow } from "./ui";
import { ContinueNext } from "./Continue";

// Shams 3.0: a spoken mode ("continue after the shared beginning", checked by the browser's speech recognition as words
// heard, confirmed by the learner), the due groups (more confused than right, or 14 days) and automatically found pairs
// (MUT_CANDIDATES, shown separately as not reviewed).
type Q = { kind: "complete" | "locate" | "speak"; key: string; group: MutGroup };

/** an automatically found pair as a group; its topic says that it is not reviewed */
function autoGroup(a: string, b: string): MutGroup {
  return candidateGroup(a, b, { de: reviewText("de").candTopic, en: reviewText("en").candTopic, ar: reviewText("ar").candTopic });
}
/** a group by id from a link (?g=): a reviewed group or an automatic pair "auto-<a>-<b>" */
function groupById(id: string): MutGroup | null {
  const g = MUT_GROUPS.find((x) => x.id === id);
  if (g) return g;
  const m = id.match(/^auto-(\d+:\d+)-(\d+:\d+)$/);
  return m && MUT_CANDIDATES.some(([a, b]) => a === m[1] && b === m[2]) ? autoGroup(m[1], m[2]) : null;
}

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

function Screen({ initial }: { initial?: string }) {
  const { s, cl, nf } = useS2();
  const { name } = useNames();
  const hydrated = useHydrated();
  const { known, mut } = useShams2();
  const rv = useRv();
  const due = useMemo(() => (hydrated ? dueMutGroups(MUT_GROUPS, mut, known) : []), [mut, known, hydrated]);
  const [candScope, setCandScope] = useState<"mine" | "all">("mine");
  const [candN, setCandN] = useState(8);
  const candMine = useMemo(() => (hydrated ? MUT_CANDIDATES.filter(([a, b]) => known.has(a) || known.has(b)) : []), [known, hydrated]);
  const cands = candScope === "mine" && candMine.length ? candMine : MUT_CANDIDATES;
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const mine = useMemo(() => (hydrated ? MUT_GROUPS.filter((g) => g.keys.some((k) => known.has(k))) : []), [known, hydrated]);
  const groups = scope === "mine" && mine.length ? mine : MUT_GROUPS;
  const [study, setStudy] = useState<MutGroup | null>(() => (initial && initial !== "due" ? groupById(initial) : null));
  const [drill, setDrill] = useState<MutGroup[] | null>(null);
  // "?g=due": the due groups, once the learner's data is read
  const [dueOpened, setDueOpened] = useState(false);
  useEffect(() => { if (initial === "due" && hydrated && !dueOpened) { setDueOpened(true); if (due.length) setDrill(due.slice(0, 6)); } }, [initial, hydrated, due, dueOpened]);
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
            {due.length > 0 && (
              <Card className="grid gap-2.5">
                <h2 className="text-[17px] font-bold">{rv("dueTitle")}</h2>
                <p className="text-[13.5px] leading-relaxed text-muted">{rv("dueLead", { n: nf(due.length) })}</p>
                <p className="text-[13px] text-muted">{due.slice(0, 6).map((g) => g.topic[cl] || g.topic.en).join(" · ")}</p>
                <GoldButton className="w-fit" onClick={() => setDrill(due.slice(0, 6))}>{rv("dueStart")}</GoldButton>
              </Card>
            )}
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
            <Card className="grid gap-3">
              <h2 className="text-[17px] font-bold">{rv("candTitle")}</h2>
              <p className="text-[13.5px] leading-relaxed text-muted">{rv("candLead")}</p>
              {candMine.length > 0 && <Segmented value={candScope} options={[["mine", rv("candMine")], ["all", rv("candAll")]]} onChange={(x) => { setCandScope(x); setCandN(8); }} />}
              <ul className="divide-y divide-line border-y border-line">
                {cands.slice(0, candN).map(([a, b, p]) => (
                  <li key={`${a}-${b}`}>
                    <button type="button" onClick={() => setStudy(autoGroup(a, b))} className="flex w-full items-center gap-3 py-2.5 text-start">
                      <span className="flex-1 text-[14.5px] font-semibold">{`${ref(a)} · ${ref(b)}`}</span>
                      <span className="text-[12.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{rv("candSim", { p: nf(p) })}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {cands.length > candN && <SmallBtn onClick={() => setCandN(candN + 12)}>{rv("candMore")}</SmallBtn>}
              <SourceNote src={["quranApi"]} review={{ status: "draft" }} />
            </Card>
            <SourceNote src={[...MUT_SOURCES, "interleave", "quranApi"]} review={MUT_REVIEW} />
          </>
        )}
      </LearnMain>
    </>
  );
}

function Study({ g, onBack, onDrill, refOf }: { g: MutGroup; onBack: () => void; onDrill: () => void; refOf: (k: string) => string }) {
  const { s, cl } = useS2();
  const rv = useRv();
  const w = useWebT();
  const groups = useMemo(() => [g], [g]);
  const { data, ready, failed, distinct } = useGroupData(groups);
  return (
    <div className="grid gap-4">
      <SmallBtn onClick={onBack}><span aria-hidden className="rtl:-scale-x-100">←</span>{s("back")}</SmallBtn>
      {/* an automatic pair carries its topic only in de/en/ar: the title comes from the texts in every language */}
      <h2 className="font-display text-[24px]">{isCandidate(g) ? rv("candTopic") : g.topic[cl] || g.topic.en}</h2>
      {failed ? <p className="text-muted">{s("loadFailed")}</p> : !ready ? <Spinner label={w.loading} /> : g.keys.map((k) => (
        <Card key={k} className="grid gap-2">
          <p className="text-[13.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{refOf(k)}</p>
          <ArWords d={data[k]} mark={distinct[k]} />
          {data[k].translation && <p className="text-[13.5px] leading-relaxed text-muted">{data[k].translation}</p>}
        </Card>
      ))}
      <p className="text-[13px] text-muted">{s("goldDiff")}</p>
      <GoldButton className="w-fit" onClick={onDrill}>{s("drillGroup")}</GoldButton>
      <SourceNote src={isCandidate(g) ? ["quranApi"] : [...MUT_SOURCES, "quranApi"]} review={isCandidate(g) ? { status: "draft" } : MUT_REVIEW} />
    </div>
  );
}

function Drill({ groups, onClose, refOf }: { groups: MutGroup[]; onClose: () => void; refOf: (k: string) => string }) {
  const { s, nf } = useS2();
  const w = useWebT();
  const rv = useRv();
  const { data, ready, failed, distinct } = useGroupData(groups);
  const [mode, setMode] = useState<"tap" | "speak">("tap");
  // a verse with no word of its own (all its words are in a similar verse of the group) gets no "complete" and no
  // spoken question: nothing could be asked or marked; "where is this verse?" still works
  const qs = useMemo(() => {
    const own = (key: string) => (distinct[key]?.length ?? 0) > 0;
    return interleave(shuffle(groups.flatMap((g) => g.keys.flatMap<Q>((key) => (mode === "speak" ? (own(key) ? [{ kind: "speak" as const, key, group: g }] : []) : [...(own(key) ? [{ kind: "complete" as const, key, group: g }] : []), { kind: "locate" as const, key, group: g }]))), groups.length * 7 + 3));
  }, [groups, mode, distinct]);
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
  const toggle = <Segmented value={mode} options={[["tap", rv("modeTap")], ["speak", rv("modeSpeak")]]} onChange={(x) => { setMode(x); setI(0); setRight(0); setPicked(null); }} />;
  if (q.kind === "speak") {
    return (
      <div className="grid gap-3">
        {toggle}
        <p className="text-[13px] font-semibold text-muted">{`${nf(i + 1)} / ${nf(qs.length)}`}</p>
        <Spoken key={`${i}:${q.key}`} d={data[q.key]} distinct={distinct[q.key]} refText={refOf(q.key)} onDone={(ok) => { if (ok) setRight(right + 1); setI(i + 1); }} />
      </div>
    );
  }
  const seg = (k: string) => distinct[k].map((p) => data[k].words.find((x) => x.position === p)?.text ?? "").join(" ");
  const options = q.kind === "complete" ? [...new Map(q.group.keys.filter((k) => distinct[k]?.length).map((k) => [seg(k), k])).entries()].map(([label, k]) => ({ id: k, label })) : q.group.keys.map((k) => ({ id: k, label: refOf(k) }));
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
      {toggle}
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

/** spoken question: the shared beginning is shown, the learner recites the rest; the word check only says which of the
 *  differing words were heard, the learner confirms the answer (never a pronunciation score) */
function Spoken({ d, distinct, refText, onDone }: { d: VerseData; distinct: number[]; refText: string; onDone: (ok: boolean) => void }) {
  const { s, nf } = useS2();
  const rv = useRv();
  const first = Math.min(...distinct);
  const cue = useMemo(() => d.words.filter((w) => w.position < first).map((w) => ({ position: w.position, text: w.text })), [d, first]);
  const rest = useMemo(() => d.words.filter((w) => w.position >= first).map((w) => ({ position: w.position, text: w.text })), [d, first]);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [shown, setShown] = useState(false);
  const heard = check ? rest.filter((w, j) => distinct.includes(w.position) && check.ok[j]).length : 0;
  const answer = (ok: boolean) => {
    noteMut(d.key, ok);
    noteWords(d.key, distinct.map((p) => ({ position: p, ok })));
    gEvent({ t: "quiz", right: ok });
    onDone(ok);
  };
  return (
    <Card className="grid gap-3">
      <p className="text-[16px] font-bold">{cue.length ? rv("qSpeak", { ref: refText }) : rv("qSpeakNoCue", { ref: refText })}</p>
      {cue.length > 0 && <PromptedWords words={cue} prompt="full" size={23} />}
      <SpeechCheck words={rest} pass={0.8} onResult={setCheck} compact />
      {check && <p className={`text-[13.5px] font-semibold ${heard === distinct.length ? "text-accent" : "text-[rgb(var(--hm-gold-d))]"}`} role="status">{rv("spokenHeard", { n: nf(heard), total: nf(distinct.length) })}</p>}
      {shown || check ? <ArWords d={d} mark={distinct} /> : <SmallBtn onClick={() => setShown(true)}>{rv("showVerse")}</SmallBtn>}
      {(shown || check) && (
        <>
          <p className="text-[14px] font-semibold">{rv("spokenRate")}</p>
          <div className="flex flex-wrap gap-2">
            <SmallBtn onClick={() => answer(false)}>{rv("confused")}</SmallBtn>
            <SmallBtn primary onClick={() => answer(true)}>{rv("rightWording")}</SmallBtn>
          </div>
        </>
      )}
      <p className="text-[12px] text-muted">{s("goldDiff")}</p>
    </Card>
  );
}

export function MutashabihatScreen({ names, initial }: { names?: NameRow[]; initial?: string }) {
  return <NamesProvider names={names ?? null}><Screen initial={initial} /></NamesProvider>;
}
