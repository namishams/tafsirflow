"use client";
// mirrors mobile/src/features/shams2/Teacher.tsx: /shams/teacher – the teacher (ustādh / shaykh) sees a student's wird,
// quality and streak, read-only. Student side: create a share code (a snapshot of this browser's progress; no e-mail,
// no account, no recordings). Teacher side: paste codes, see each student. The codes are the same as in the app, so a
// code made in the app opens here and the other way round. Copy uses the clipboard, share the Web Share API.
import { useState } from "react";
import { intlLocale } from "@/lib/learn/i18n";
import { stats } from "@/lib/learning";
import { useShams2 } from "@/lib/learn/shams2/model";
import { readLog, readSettings, saveSettings, wirdStreak } from "@/lib/learn/shams2/store";
import { addLink, addStudent, encodeSnapshot, makeSnapshot, removeLink, removeStudent, useTeacher, type Snapshot } from "@/lib/learn/shams2/teacherModel";
import { useS2 } from "@/lib/learn/shams2/text";
import { Card, GoldButton, LearnHero, LearnMain } from "@/components/learn/ui";
import { Live, ScoreDot, Segmented, SmallBtn, SourceNote, Term, scoreColor, onScore, useBack, useNames, useWebT } from "./ui";

const inputCls = "w-full rounded-md border border-line bg-surface px-3 py-2.5 text-[15px] text-ink outline-none focus:border-[rgb(var(--hm-gold))]";

function Body() {
  const { s, nf, lang } = useS2();
  const w = useWebT();
  const m = useShams2();
  const st = useTeacher();
  const [tab, setTab] = useState<"student" | "teacher">("student");
  const [nameIn, setNameIn] = useState(() => readSettings().name ?? "");
  const [teacherIn, setTeacherIn] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [paste, setPaste] = useState("");
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const create = () => {
    saveSettings({ name: nameIn.trim().slice(0, 40) });
    const snap = makeSnapshot({ name: nameIn || s("student"), streak: stats().streak, wirdStreak: wirdStreak(readLog(), m.day), wird: m.wird, surahs: m.q.surahs, juz: m.q.juz, overall: m.q.overall, log: readLog(), day: m.day });
    setCode(encodeSnapshot(snap)); setCopied(false);
    addLink(teacherIn);
  };
  const copy = () => { if (code) void navigator.clipboard?.writeText(code).then(() => setCopied(true)).catch(() => undefined); };
  const fromClipboard = () => { void navigator.clipboard?.readText().then((x) => { setPaste(x); setErr(""); }).catch(() => undefined); };
  const add = () => { if (addStudent(paste)) { setPaste(""); setOpen(0); } else setErr(s("badCode")); };
  const date = (ms: number) => new Date(ms).toLocaleDateString(intlLocale(lang));
  return (
    <div className="grid gap-4">
      <Segmented value={tab} options={[["student", s("iAmStudent")], ["teacher", s("iAmTeacher")]]} onChange={setTab} />
      {tab === "student" ? (
        <>
          <Card className="grid gap-3">
            <label className="grid gap-1.5 text-[14px] font-semibold">{s("shownName")}
              <input value={nameIn} onChange={(e) => setNameIn(e.target.value)} placeholder={s("student")} maxLength={40} className={inputCls} autoComplete="off" />
            </label>
            <label className="grid gap-1.5 text-[14px] font-semibold">{s("teacherName")}
              <input value={teacherIn} onChange={(e) => setTeacherIn(e.target.value)} placeholder={s("optional")} maxLength={40} className={inputCls} autoComplete="off" />
            </label>
            <p className="text-[13px] leading-relaxed text-muted">{s("codePrivacy")}</p>
            <GoldButton className="w-fit" onClick={create}>{s("createCode")}</GoldButton>
            {code && (
              <div className="grid gap-2">
                <textarea readOnly value={code} rows={3} aria-label={s("createCode")} onFocus={(e) => e.currentTarget.select()} className={`${inputCls} font-mono text-[11.5px] text-muted`} />
                <div className="flex flex-wrap gap-2">
                  <SmallBtn onClick={copy}>{copied ? w.copied : s("copy")}</SmallBtn>
                  {canShare && <SmallBtn onClick={() => void navigator.share({ text: code }).catch(() => undefined)}>{s("share")}</SmallBtn>}
                </div>
              </div>
            )}
          </Card>
          {st.links.length > 0 && <h2 className="text-[17px] font-bold">{s("linkedTeachers")}</h2>}
          <ul className="grid gap-2">
            {st.links.map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
                <span className="min-w-0 flex-1 text-[14.5px]">{`${l.teacher ?? s("teacher")} · ${date(l.createdAt)}`}</span>
                <SmallBtn onClick={() => removeLink(l.id)}>{s("remove")}</SmallBtn>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <Card className="grid gap-3">
            <label className="grid gap-1.5 text-[14px] font-semibold">{s("pasteCode")}
              <textarea value={paste} onChange={(e) => { setPaste(e.target.value); setErr(""); }} placeholder="QMC2.…" rows={3} autoCapitalize="none" autoCorrect="off" spellCheck={false} className={`${inputCls} font-mono text-[12.5px]`} />
            </label>
            {err && <p role="alert" className="text-[13.5px] text-red-700 dark:text-red-400">{err}</p>}
            <div className="flex flex-wrap gap-2">
              <SmallBtn onClick={fromClipboard}>{s("pasteFromClipboard")}</SmallBtn>
              <GoldButton onClick={add} disabled={!paste.trim()}>{s("addStudent")}</GoldButton>
            </div>
          </Card>
          {!st.students.length && <p className="text-[14.5px] text-muted">{s("noStudents")}</p>}
          <ul className="grid gap-2.5">
            {st.students.map((x, i) => (
              <li key={`${x.snap.name}-${x.added}`} className="grid gap-2">
                <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}
                  className={`flex items-center gap-3 rounded-lg border bg-surface p-3 text-start ${open === i ? "border-[rgb(var(--hm-gold))]/60" : "border-line"}`}>
                  <ScoreDot score={x.snap.overall} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold">{x.snap.name || s("student")}</span>
                    <span className="block text-[13px] text-muted">{s("snapLine", { n: nf(x.snap.memorised), d: nf(x.snap.wirdStreak), date: date(x.snap.at) })}</span>
                  </span>
                </button>
                {open === i && <StudentView snap={x.snap} onRemove={() => { removeStudent(i); setOpen(null); }} />}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function StudentView({ snap, onRemove }: { snap: Snapshot; onRemove: () => void }) {
  const { s, nf, lang } = useS2();
  const { name } = useNames();
  const stat = (v: string, l: string) => (
    <div className="grid flex-1 justify-items-center rounded-lg border border-line p-2.5 text-center"><span className="font-display text-[20px]">{v}</span><span className="text-[11.5px] text-muted">{l}</span></div>
  );
  return (
    <Card className="grid gap-3">
      <p className="text-[12.5px] text-muted">{s("readOnly")}</p>
      <div className="flex gap-2">
        {stat(nf(snap.memorised), s("versesShort"))}
        {stat(snap.overall === null ? "–" : nf(snap.overall), s("overall"))}
        {stat(nf(snap.wirdStreak), s("streak"))}
      </div>
      <p className="text-[14px] font-semibold">{s("todayPlan")}</p>
      <p className="whitespace-pre-line text-[14px] leading-relaxed">
        {`${s("sabaqShort")}: ${snap.plan.sabaq.length ? snap.plan.sabaq.map(([a, b, c]) => `${name(a)} ${nf(b)}–${nf(c)}`).join(", ") : "–"}\n${s("sabqiShort")}: ${nf(snap.plan.sabqi)} · ${s("manzilShort")}: ${nf(snap.plan.manzil)} · ${s("minN", { n: nf(snap.plan.minutes) })}\n${s("manzilCycle")}: ${nf(snap.plan.cycle[0])}/${nf(snap.plan.cycle[1])}`}
      </p>
      <p className="text-[14px] font-semibold">{s("last28")}</p>
      <ol className="flex flex-wrap gap-1">
        {snap.log.map(([d, b]) => (
          <li key={d} title={new Date(d * 86400000).toLocaleDateString(intlLocale(lang))} className="h-4 w-4 rounded" style={{ background: b === 7 ? "rgb(var(--hm-gold))" : b ? "rgb(var(--accent))" : "rgb(var(--line))", opacity: b && b !== 7 ? 0.4 + ((b & 1) + ((b >> 1) & 1) + ((b >> 2) & 1)) * 0.2 : 1 }} />
        ))}
      </ol>
      <p className="text-[14px] font-semibold">{s("bySurah")}</p>
      <ul className="grid gap-1.5">
        {snap.surahs.map(([id, known, total, score]) => (
          <li key={id} className="flex items-center gap-2.5 text-[14px]">
            <span className="min-w-0 flex-1 truncate">{`${nf(id)}. ${name(id)}`}</span>
            <span className="text-[12.5px] tabular-nums text-muted">{`${nf(known)}/${nf(total)}`}</span>
            <span className="grid h-5 w-9 place-items-center rounded text-[11px] font-semibold" style={{ background: scoreColor(score), color: onScore(score) ?? "rgb(var(--ink))" }}>{nf(score)}</span>
          </li>
        ))}
      </ul>
      <SmallBtn onClick={onRemove}>{s("remove")}</SmallBtn>
    </Card>
  );
}

export function TeacherScreen() {
  const { s } = useS2();
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={s("teacherTitle")} lead={s("teacherLead")} word="الشيخ" uid="s2r" />
      <LearnMain className="grid gap-5">
        <Live><Body /></Live>
        <Term id="ard" />
        <SourceNote src={["app"]} />
      </LearnMain>
    </>
  );
}
