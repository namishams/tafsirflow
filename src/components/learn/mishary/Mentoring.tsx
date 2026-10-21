"use client";
// mirrors mobile/src/features/mishary/Mentoring.tsx – mentoring without video (/mishary/mentoring, /mishary/mentoring/
// <id>, /mishary/mentoring/send?mentor=<username>): text and rubric review by a verified master the student is
// connected with. Recordings are 30–60 s, recorded in the browser (MediaRecorder), private on the server and deleted
// after 60 days. Calls src/app/api/mentoring/* same-origin with the session cookie; sign-in, age 16+ and the Quran
// Talents profile are checked by the server. Every member row, recording and review of someone else can be reported,
// every member blocked (./Safety.tsx), as in the app.
import { useState, type ReactNode } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/learn/auth";
import { useMt, type Mt, type MtKey } from "@/lib/learn/mishary/texts";
import { M, RUBRIC, errCode, type Member, type MentoringMe, type Review, type RubricKey, type Submission } from "@/lib/learn/mishary/api";
import { STUDY_VERSES } from "@/lib/learn/mishary/style";
import { useVerse } from "@/lib/learn/reciter-path/useVerse";
import { VerseWords } from "@/components/learn/reciter-path/Practice";
import { Card, GoldButton, GoldLink, LearnHero, LearnMain, OutlineButton, OutlineLink, Spinner } from "@/components/learn/ui";
import { DefaultAvatar } from "@/components/talents/DefaultAvatar";
import { BadgeIcon } from "@/components/talents/BadgeIcon";
import { IconCheckCircle, IconLock } from "@/components/Icons";
import { Chip, ErrorText, Muted, Recorder, Section, useLoad, type Take } from "./ui";
import { ReportLink, SafetyButton, SafetyFooter, useMentoringSafety } from "./Safety";

export function useErr() {
  const mt = useMt();
  return (e: unknown) => {
    const c = errCode(e);
    const k = `e_${c}` as MtKey;
    const msg = mt(k);
    if (msg && msg !== k && !msg.startsWith("e_")) return msg;
    if (c === "age16" || c === "age" || c === "age_required") return mt("age16");
    if (c === "profile_required") return mt("needProfile");
    return mt("error");
  };
}

/** sign-in, age 16+ and the Quran Talents profile, as the server asks for them */
export function Gate({ error, children }: { error: unknown; children: ReactNode }) {
  const mt = useMt();
  const { user, ready } = useAuth();
  if (!ready) return <Spinner label={mt("loading")} />;
  if (!user) return <Card className="grid gap-4"><Muted className="text-[15px]">{mt("signIn")}</Muted><GoldLink href="/account" className="w-fit">{mt("signInBtn")}</GoldLink></Card>;
  if (!error) return <>{children}</>;
  const c = errCode(error);
  if (c === "age16" || c === "age" || c === "age_required" || c === "profile_required") {
    return <Card className="grid gap-4"><Muted className="text-[15px]">{c === "profile_required" ? mt("needProfile") : mt("age16")}</Muted><OutlineLink href="/talents/me" className="w-fit">{mt("openTalents")}</OutlineLink></Card>;
  }
  if (c === "login" || c === "verify") return <Card className="grid gap-4"><Muted className="text-[15px]">{mt("signIn")}</Muted><GoldLink href="/account" className="w-fit">{mt("signInBtn")}</GoldLink></Card>;
  return <Card><Muted className="text-[15px]">{mt("offline")}</Muted></Card>;
}

export function MemberLine({ m, right, sub }: { m: Member | null; right?: ReactNode; sub?: string }) {
  if (!m) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[rgb(var(--hm-gold))]/60">
        {m.avatar ? <img src={m.avatar} alt="" className="h-full w-full object-cover" /> /* eslint-disable-line @next/next/no-img-element */ : <DefaultAvatar />}
      </span>
      <Link href={`/talents/${m.username}`} className="min-w-0 flex-1 hover:underline">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-semibold">{m.name || m.username}</span>
          {m.badge && <span aria-hidden className="inline-flex"><BadgeIcon badge={m.badge} size={15} /></span>}
        </span>
        <span className="block truncate text-[12.5px] text-muted"><span dir="ltr">@{m.username}</span>{sub ? ` · ${sub}` : ""}</span>
      </Link>
      {right}
    </div>
  );
}

export const verseLabel = (k: string, mt: Mt) => {
  const [s, r = ""] = k.split(":"); const [a, b] = r.split("-");
  return b ? mt("verses", { s, a, b }) : mt("verseOne", { s, a });
};
const date = (iso: string) => { try { return iso ? new Date(iso).toISOString().slice(0, 10) : ""; } catch { return ""; } };

function SubmissionRow({ s, who }: { s: Submission; who?: Member | null }) {
  const mt = useMt();
  return (
    <li>
      <Link href={`/mishary/mentoring/${s.id}`} className="flex min-h-[60px] items-center gap-3 py-2.5 transition hover:bg-[rgb(var(--hm-gold))]/[0.06]">
        <span aria-hidden className={`[&>svg]:h-5 [&>svg]:w-5 ${s.status === "reviewed" ? "text-accent" : "text-[rgb(var(--hm-gold))]"}`}>{s.status === "reviewed" ? <IconCheckCircle /> : <span className="block h-5 w-5 rounded-full border-2 border-current" />}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-semibold">{verseLabel(s.verseKey, mt)}{who ? <span dir="ltr"> · @{who.username}</span> : null}</span>
          <span className="block text-[12.5px] text-muted">{s.status === "reviewed" ? mt("reviewed") : mt("pending")} · {s.hasAudio ? mt("expires", { d: date(s.expiresAt) }) : mt("deletedFile")}</span>
        </span>
        <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>
      </Link>
    </li>
  );
}

// ——— /mishary/mentoring ———
export function MentoringScreen() {
  const mt = useMt();
  const err = useErr();
  const { user } = useAuth();
  const me = useLoad<MentoringMe | null>(() => (user ? M.me() : Promise.resolve(null)), [user]);
  const masters = useLoad(() => (user && me.data ? M.masters().then((r) => r.masters) : Promise.resolve([])), [user, me.data]);
  const mine = useLoad(() => (user && me.data ? M.submissions("mine").then((r) => r.submissions.filter((s) => !s.season)) : Promise.resolve([])), [user, me.data]);
  const inbox = useLoad(() => (me.data?.canMentor ? M.submissions("inbox").then((r) => r.submissions) : Promise.resolve([])), [me.data]);
  const [msg, setMsg] = useState("");
  const act = async (f: () => Promise<unknown>) => { setMsg(""); try { await f(); me.reload(); } catch (e) { setMsg(err(e)); } };
  const d = me.data;
  const askable = (masters.data ?? []).filter((m) => m.link !== "accepted" && m.link !== "pending");
  const pendingStudents = d?.students.filter((s) => s.status === "pending") ?? [];
  const students = d?.students.filter((s) => s.status === "accepted") ?? [];
  // a blocked member disappears from every list (the server leaves them out)
  const safe = useMentoringSafety(() => { me.reload(); masters.reload(); mine.reload(); inbox.reload(); });
  const flag = (m: Member | null) => (m ? <SafetyButton label={mt("safetyFor", { name: `@${m.username}` })} onClick={() => safe.memberMenu(m)} /> : null);

  return (
    <>
      <LearnHero back={{ href: "/mishary", label: mt("kicker") }} kicker={mt("kicker")} title={mt("mentoringTitle")} lead={mt("mentoringLead")} word="إرشاد" uid="mn">
        <span className="text-[13.5px] font-semibold text-white/75">{mt("mentoringNote")}</span>
      </LearnHero>
      <LearnMain className="grid gap-8">
        <Gate error={me.error}>
          {!d ? <Spinner label={mt("loading")} /> : (
            <>
              <ErrorText text={msg} />
              {safe.note ? <p role="status" className="text-[13.5px] font-semibold text-accent">{safe.note}</p> : null}
              <Section title={mt("yourMentors")}>
                <Card className="grid gap-4">
                  {d.mentors.length ? d.mentors.map((l) => (
                    <div key={l.id} className="grid gap-2.5">
                      <MemberLine m={l.member} sub={l.status === "accepted" ? mt("accepted") : mt("requested")}
                        right={<span className="flex items-center gap-1"><Chip label={mt("endMentoring")} onClick={() => void act(() => M.link(l.id, "end"))} />{flag(l.member)}</span>} />
                      {l.status === "accepted" && l.member && <OutlineLink href={`/mishary/mentoring/send?mentor=${encodeURIComponent(l.member.username)}`} className="!h-10 w-fit !px-4">{mt("send")}</OutlineLink>}
                    </div>
                  )) : <Muted>{mt("none")}</Muted>}
                </Card>
              </Section>
              <Section title={mt("askMaster")}>
                <Muted>{mt("askLead")}</Muted>
                <Card className="grid gap-4">
                  {askable.length ? askable.map((m) => (
                    <MemberLine key={m.username} m={m} right={<span className="flex items-center gap-1"><Chip label={mt("ask")} onClick={() => void act(async () => { await M.ask(m.username); masters.reload(); })} />{flag(m)}</span>} />
                  )) : <Muted>{mt("noMasters")}</Muted>}
                  <OutlineLink href="/talents" className="!h-10 w-fit !px-4">{mt("openTalents")}</OutlineLink>
                </Card>
              </Section>
              <Section title={mt("yourRecordings")}>
                <Card>{(mine.data ?? []).length ? <ul className="divide-y divide-line">{mine.data!.map((s) => <SubmissionRow key={s.id} s={s} who={s.mentor} />)}</ul> : <Muted>{mine.error ? mt("offline") : mt("none")}</Muted>}</Card>
              </Section>
              {d.canMentor && (
                <>
                  <Section title={mt("requests")}>
                    <Card className="grid gap-4">
                      {pendingStudents.length ? pendingStudents.map((l) => (
                        <div key={l.id} className="grid gap-2.5">
                          <MemberLine m={l.member} sub={l.note || undefined} right={flag(l.member)} />
                          <div className="flex flex-wrap gap-2">
                            <Chip label={mt("accept")} on onClick={() => void act(() => M.link(l.id, "accept"))} />
                            <Chip label={mt("decline")} onClick={() => void act(() => M.link(l.id, "decline"))} />
                          </div>
                        </div>
                      )) : <Muted>{mt("none")}</Muted>}
                    </Card>
                  </Section>
                  <Section title={mt("yourStudents")}>
                    <Card className="grid gap-4">
                      {students.length ? students.map((l) => (
                        <MemberLine key={l.id} m={l.member} sub={l.open ? `${l.open} · ${mt("pending")}` : undefined}
                          right={<span className="flex items-center gap-1"><Chip label={mt("endMentoring")} onClick={() => void act(() => M.link(l.id, "end"))} />{flag(l.member)}</span>} />
                      )) : <Muted>{mt("none")}</Muted>}
                    </Card>
                  </Section>
                  <Section title={`${mt("toReview")} (${d.inbox})`}>
                    <Card>{(inbox.data ?? []).length ? <ul className="divide-y divide-line">{inbox.data!.map((s) => <SubmissionRow key={s.id} s={s} who={s.student} />)}</ul> : <Muted>{inbox.error ? mt("offline") : mt("none")}</Muted>}</Card>
                  </Section>
                </>
              )}
            </>
          )}
        </Gate>
        <SafetyFooter />
      </LearnMain>
      {safe.element}
    </>
  );
}

/** verse picker + verse words, shared by the mentoring and the season recording screens */
export function VersePick({ value, onChange, fixed }: { value: string; onChange?: (k: string) => void; fixed?: boolean }) {
  const mt = useMt();
  const first = value.split("-")[0];
  const { verse } = useVerse(first);
  return (
    <div className="grid gap-3">
      {!fixed && <div className="flex flex-wrap gap-2">{STUDY_VERSES.map((k) => <Chip key={k} label={<span dir="ltr">{k}</span>} on={k === value} onClick={() => onChange?.(k)} />)}</div>}
      {verse ? <VerseWords verse={verse} size={24} /> : <Spinner label={mt("loading")} />}
    </div>
  );
}

const textareaCls = "min-h-[84px] w-full rounded-lg border border-line bg-surface p-3 text-[15px] leading-relaxed outline-none focus:border-[rgb(var(--hm-gold))]";

// ——— /mishary/mentoring/send?mentor= ———
export function SendScreen({ mentor }: { mentor: string }) {
  const mt = useMt();
  const err = useErr();
  const router = useRouter();
  const [key, setKey] = useState(STUDY_VERSES[0]);
  const [take, setTake] = useState<Take | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const send = async () => {
    if (!take || !mentor) return;
    setBusy(true); setMsg("");
    try { const r = await M.send({ verseKey: key, durationMs: take.durMs, note: note.trim(), mentor }, take); router.replace(`/mishary/mentoring/${r.id}`); }
    catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <>
      <LearnHero back={{ href: "/mishary/mentoring", label: mt("mentoringTitle") }} kicker={mt("mentoringTitle")} title={mt("sendTo", { name: mentor ? `@${mentor}` : "" })} lead={mt("record3060")} word="إرشاد" uid="mns" />
      <LearnMain className="grid gap-5">
        <Gate error={null}>
          <Card className="grid gap-4">
            <VersePick value={key} onChange={(k) => { setKey(k); setTake(null); }} />
            <Muted>{mt("autoStop", { s: 60 })}</Muted>
            <Recorder key={key} maxSec={60} minSec={30} onTake={setTake} />
          </Card>
          <Card className="grid gap-2">
            <label htmlFor="mishary-note" className="text-[13.5px] font-semibold text-muted">{mt("noteLabel")}</label>
            <textarea id="mishary-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder={mt("commentHint")} className={textareaCls} />
          </Card>
          <p className="flex items-start gap-2 text-[14px] leading-relaxed text-muted"><span aria-hidden className="mt-0.5 text-accent [&>svg]:h-4 [&>svg]:w-4"><IconLock /></span>{mt("privateRec")}</p>
          <ErrorText text={msg} />
          <GoldButton onClick={() => void send()} disabled={!take || busy || !mentor} className="w-fit">{busy ? mt("loading") : mt("sendBtn")}</GoldButton>
        </Gate>
      </LearnMain>
    </>
  );
}

/** plays a private recording (same-origin, the session cookie signs the request in) */
export function ServerAudio({ path }: { path: string }) {
  const mt = useMt();
  return <audio controls preload="none" src={path} aria-label={mt("play")} className="w-full" />;
}

const RLABEL: Record<RubricKey, MtKey> = { makharij: "r_makharij", tajweed: "r_tajweed", waqf: "r_waqf", pace: "r_pace", maqam: "r_maqam" };

/** a review; onReport / onMember when someone else wrote it (report the text, report or block the reviewer) */
function ReviewView({ r, onReport, onMember }: { r: Review; onReport?: () => void; onMember?: (m: Member) => void }) {
  const mt = useMt();
  return (
    <Card className="grid gap-3">
      {r.reviewer ? <MemberLine m={r.reviewer} right={onMember ? <SafetyButton label={mt("safetyFor", { name: `@${r.reviewer.username}` })} onClick={() => onMember(r.reviewer!)} /> : undefined} />
        : <p className="font-semibold text-[rgb(var(--hm-gold-d))]">{mt("jury")}</p>}
      <dl className="grid gap-2">
        {RUBRIC.map((k) => (
          <div key={k} className="flex items-center gap-3">
            <dt className="flex-1 text-[14px]">{mt(RLABEL[k])}</dt>
            <dd className="flex gap-1" aria-label={`${r.rubric[k]} / 5`}>{[1, 2, 3, 4, 5].map((n) => <span key={n} aria-hidden className={`h-3.5 w-3.5 rounded-full ${n <= r.rubric[k] ? "bg-[rgb(var(--hm-gold))]" : "bg-line"}`} />)}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[14.5px] font-bold">{mt("total", { n: r.total })}</p>
      {r.text && <p className="whitespace-pre-line text-[15px] leading-relaxed">{r.text}</p>}
      {onReport ? <ReportLink label={mt("reportReview")} onClick={onReport} /> : null}
    </Card>
  );
}

function RubricForm({ id, needText, onDone }: { id: string; needText: boolean; onDone: () => void }) {
  const mt = useMt();
  const err = useErr();
  const [v, setV] = useState<Record<RubricKey, number>>({ makharij: 3, tajweed: 3, waqf: 3, pace: 3, maqam: 3 });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const submit = async () => {
    if (needText && !text.trim()) { setMsg(mt("e_text_required")); return; }
    setBusy(true); setMsg("");
    try { await M.review(id, v, text.trim()); onDone(); } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <Card className="grid gap-4">
      <Muted className="text-[12.5px]">{mt("scaleHint")}</Muted>
      {RUBRIC.map((k) => (
        <fieldset key={k} className="grid gap-1.5">
          <legend className="mb-1.5 text-[14px] font-semibold">{mt(RLABEL[k])}</legend>
          <div className="flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map((n) => <Chip key={n} label={String(n)} on={v[k] === n} onClick={() => setV({ ...v, [k]: n })} className="w-11 justify-center" />)}</div>
        </fieldset>
      ))}
      <label htmlFor={`mishary-review-${id}`} className="text-[14px] font-semibold">{mt("comment")}</label>
      <textarea id={`mishary-review-${id}`} value={text} onChange={(e) => setText(e.target.value)} maxLength={600} placeholder={mt("commentHint")} className={textareaCls} />
      <ErrorText text={msg} />
      <GoldButton onClick={() => void submit()} disabled={busy} className="w-fit">{mt("sendFeedback")}</GoldButton>
    </Card>
  );
}

// ——— /mishary/mentoring/[id] (also season entries for the jury) ———
export function SubmissionScreen({ id }: { id: string }) {
  const mt = useMt();
  const err = useErr();
  const router = useRouter();
  const { user } = useAuth();
  const d = useLoad(() => (user ? M.submission(id) : Promise.resolve(null)), [id, user]);
  const [msg, setMsg] = useState("");
  const s = d.data?.submission;
  // after a block the submission is gone for both sides (the server answers 404), so the page goes back to the list
  const safe = useMentoringSafety(() => router.push(s?.season ? `/mishary/seasons/${s.season}` : "/mishary/mentoring"));
  const role = d.data?.role;
  const flag = (m: Member | null) => (m ? <SafetyButton label={mt("safetyFor", { name: `@${m.username}` })} onClick={() => safe.memberMenu(m)} /> : null);
  // the student reports any review; the master every review but the own (s.mentor is the master); a juror sees only the own
  const canReportReview = (r: Review) => role === "student" || (role === "master" && (!r.reviewer || r.reviewer.username !== s?.mentor?.username));
  return (
    <>
      <LearnHero back={{ href: "/mishary/mentoring", label: mt("mentoringTitle") }} kicker={d.data?.role === "jury" ? mt("jury") : mt("mentoringTitle")} title={s ? verseLabel(s.verseKey, mt) : mt("mentoringTitle")} word="إرشاد" uid="mnd" />
      <LearnMain className="grid gap-6">
        <Gate error={d.error}>
          {!s ? <Spinner label={mt("loading")} /> : (
            <>
              {d.data!.role === "master" && <MemberLine m={s.student} right={flag(s.student)} />}
              {d.data!.role === "student" && s.mentor && <MemberLine m={s.mentor} sub={mt("accepted")} right={flag(s.mentor)} />}
              <Card className="grid gap-3">
                <VersePick value={s.verseKey} fixed />
                {s.hasAudio ? <ServerAudio path={M.audioPath(s.id)} /> : <Muted>{mt("deletedFile")}</Muted>}
                {s.note && <p className="whitespace-pre-line text-[15px] leading-relaxed">{s.note}</p>}
                {s.hasAudio && <Muted className="text-[12.5px]">{mt("expires", { d: date(s.expiresAt) })}</Muted>}
                {role !== "student" ? <ReportLink label={mt("reportRecording")} onClick={() => safe.reportSubmission(s.id)} /> : null}
              </Card>
              <Section title={mt("feedback")}>
                {d.data!.reviews.length ? d.data!.reviews.map((r) => (
                  <ReviewView key={r.id} r={r} onReport={canReportReview(r) ? () => safe.reportReview(s.id, r.id) : undefined}
                    onMember={canReportReview(r) && r.reviewer ? safe.memberMenu : undefined} />
                )) : <Muted>{mt("pending")}</Muted>}
                {d.data!.canReview && <RubricForm id={s.id} needText={d.data!.role === "master"} onDone={d.reload} />}
              </Section>
              <ErrorText text={msg} />
              {safe.note ? <p role="status" className="text-[13.5px] font-semibold text-accent">{safe.note}</p> : null}
              {d.data!.role === "student" && s.status === "pending" && (
                <OutlineButton className="w-fit" onClick={() => void M.withdraw(s.id).then(() => router.push(s.season ? `/mishary/seasons/${s.season}` : "/mishary/mentoring")).catch((e) => setMsg(err(e)))}>
                  {s.season ? mt("withdrawEntry") : mt("withdraw")}
                </OutlineButton>
              )}
            </>
          )}
        </Gate>
        <SafetyFooter />
      </LearnMain>
      {safe.element}
    </>
  );
}
