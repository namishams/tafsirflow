"use client";
// mirrors mobile/src/features/mishary/Seasons.tsx – talent seasons (/mishary/seasons, /mishary/seasons/<slug>) and the
// Hall of Fame (/mishary/hall-of-fame): monthly challenges (created by the server for every month), Ramadan and
// special seasons (admin). An entry is a private recording heard only by the jury (masters and admins), without the
// member's name. Place 1 earns the season's mythic sticker, places 2–3 the legendary one (granted by the server).
import { useState } from "react";
import { useLang } from "@/lib/learn/i18n";
import { useAuth } from "@/lib/learn/auth";
import { SURAHS } from "@/lib/learn/garden/catalog";
import { useMt, type Mt } from "@/lib/learn/mishary/texts";
import { M, type Member, type Placement, type Season, type SeasonItem } from "@/lib/learn/mishary/api";
import { Link } from "@/i18n/navigation";
import { Card, CardLink, GoldButton, LearnHero, LearnMain, OutlineButton, OutlineLink, Spinner } from "@/components/learn/ui";
import { IconLock } from "@/components/Icons";
import { Chip, ErrorText, Muted, Recorder, Section, useLoad, type Take } from "./ui";
import { Gate, MemberLine, VersePick, useErr } from "./Mentoring";
import { SafetyButton, SafetyFooter, useMentoringSafety } from "./Safety";

const MYTHIC = "text-[rgb(122,64,160)] dark:text-[rgb(190,150,225)]";
const MYTHIC_BORDER = "border-[rgb(122,64,160)] dark:border-[rgb(190,150,225)]";

export function seasonTitle(s: Season, lang: string): string {
  if (s.title) return s.title;
  if (!s.verses) return s.slug;
  const [surah, range = ""] = s.verses.split(":");
  const name = SURAHS[Number(surah) - 1] ?? surah;
  const [a, b] = range.split("-");
  const base = `${name} ${a}${b ? `–${b}` : ""}`;
  if (s.kind !== "month") return base;
  try { return `${new Date(`${s.startsOn}T12:00:00`).toLocaleDateString(lang, { month: "long", year: "numeric" })} · ${base}`; } catch { return base; }
}
function statusLine(s: Season, mt: Mt) {
  if (s.published) return mt("published");
  if (s.status === "open") return mt("openUntil", { d: s.endsOn });
  return s.status === "judging" ? mt("judging") : mt("closed");
}
const kindLabel = (k: string, mt: Mt) => (k === "ramadan" ? mt("k_ramadan") : k === "special" ? mt("k_special") : mt("k_month"));

function SeasonCard({ s }: { s: SeasonItem }) {
  const mt = useMt();
  const { lang } = useLang();
  return (
    <CardLink href={`/mishary/seasons/${s.slug}`} className="gap-1.5">
      <span className="text-[12.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{kindLabel(s.kind, mt)}</span>
      <span className="text-[18px] font-bold leading-snug">{seasonTitle(s, lang)}</span>
      <span className="text-[14px] text-muted">{statusLine(s, mt)} · {mt("entriesN", { n: s.entries })}</span>
      {s.result ? <span className={`font-semibold ${s.result.rarity === "mythic" ? MYTHIC : "text-accent"}`}>{mt("yourResult", { n: s.result.place })}</span>
        : s.mine ? <span className="font-semibold text-accent">{mt("yourEntry")}</span> : null}
    </CardLink>
  );
}

function NewSeason({ onDone }: { onDone: () => void }) {
  const mt = useMt();
  const err = useErr();
  const [f, setF] = useState({ slug: "", kind: "ramadan", title: "", verses: "", startsOn: "", endsOn: "" });
  const [msg, setMsg] = useState("");
  const input = (k: keyof typeof f, label: string) => (
    <label className="grid gap-1">
      <span className="text-[12.5px] text-muted">{label}</span>
      <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} autoCapitalize="none" spellCheck={false} dir="ltr"
        className="h-11 rounded-lg border border-line bg-surface px-3 text-[15px] outline-none focus:border-[rgb(var(--hm-gold))]" />
    </label>
  );
  return (
    <Card className="grid gap-3">
      <h3 className="text-[16px] font-bold">{mt("adminNew")}</h3>
      <div className="flex flex-wrap gap-2">{(["month", "ramadan", "special"] as const).map((k) => <Chip key={k} label={kindLabel(k, mt)} on={f.kind === k} onClick={() => setF({ ...f, kind: k })} />)}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {input("slug", mt("slug"))}{input("verses", `${mt("verse")} (67:1-5)`)}{input("startsOn", mt("startsOn"))}{input("endsOn", mt("endsOn"))}{input("title", mt("titleField"))}
      </div>
      <ErrorText text={msg} />
      <OutlineButton className="w-fit" onClick={() => void M.newSeason(f).then(() => { setMsg(""); onDone(); }).catch((e) => setMsg(err(e)))}>{mt("create")}</OutlineButton>
    </Card>
  );
}

// ——— /mishary/seasons ———
export function SeasonsScreen() {
  const mt = useMt();
  const { user } = useAuth();
  const d = useLoad(() => (user ? M.seasons() : Promise.resolve(null)), [user]);
  return (
    <>
      <LearnHero back={{ href: "/mishary", label: mt("kicker") }} kicker={mt("kicker")} title={mt("seasonsTitle")} lead={mt("seasonsLead")} word="موسم" uid="mse">
        <OutlineLink dark href="/mishary/hall-of-fame">{mt("hofTitle")}</OutlineLink>
      </LearnHero>
      <LearnMain className="grid gap-4">
        <Gate error={d.error}>
          {!d.data ? <Spinner label={mt("loading")} /> : (
            <>
              <Muted>{mt("rewards")}</Muted>
              <div className="grid gap-4 sm:grid-cols-2">{d.data.seasons.map((s) => <SeasonCard key={s.slug} s={s} />)}</div>
              {d.data.admin && <NewSeason onDone={d.reload} />}
            </>
          )}
        </Gate>
      </LearnMain>
    </>
  );
}

/** the podium; onMember (report or block a placed member) for everyone but the viewer */
export function Podium({ list, onMember }: { list: Placement[]; onMember?: (m: Member) => void }) {
  const mt = useMt();
  return (
    <ol className="divide-y divide-line">
      {list.map((p) => (
        <li key={`${p.place}-${p.member?.username ?? ""}`} className="grid gap-2 py-3 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[14.5px] font-bold ${p.place === 1 ? MYTHIC : "text-[rgb(var(--hm-gold-d))]"}`}>{mt("place", { n: p.place })}</span>
            <span className="text-[12.5px] text-muted">{mt("score", { s: p.score.toFixed(1) })}</span>
            {p.rarity && (
              <span className={`inline-flex h-6 items-center rounded-full border px-2.5 text-[11.5px] font-bold ${p.rarity === "mythic" ? `${MYTHIC} ${MYTHIC_BORDER}` : "border-[rgb(var(--hm-gold))] text-[rgb(var(--hm-gold-d))]"}`}>
                {p.rarity === "mythic" ? mt("mythic") : mt("legendary")}
              </span>
            )}
          </div>
          {p.member && <MemberLine m={p.member} right={onMember && !p.mine ? <SafetyButton label={mt("safetyFor", { name: `@${p.member.username}` })} onClick={() => onMember(p.member!)} /> : undefined} />}
        </li>
      ))}
    </ol>
  );
}

// ——— /mishary/seasons/[slug] ———
export function SeasonScreen({ slug }: { slug: string }) {
  const mt = useMt();
  const err = useErr();
  const { lang } = useLang();
  const { user } = useAuth();
  const list = useLoad(() => (user ? M.seasons() : Promise.resolve(null)), [slug, user]);
  const d = useLoad(() => (user ? M.season(slug) : Promise.resolve(null)), [slug, user]);
  const jury = useLoad(() => (list.data?.judge ? M.submissions("jury", slug).then((r) => r.submissions) : Promise.resolve([])), [list.data, slug]);
  const [take, setTake] = useState<Take | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const item = list.data?.seasons.find((s) => s.slug === slug);
  const s = d.data?.season;
  const enter = async () => {
    if (!take || !s) return;
    setBusy(true); setMsg("");
    try { await M.send({ verseKey: s.verses, durationMs: take.durMs, season: s.slug }, take); setTake(null); list.reload(); d.reload(); }
    catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  const admin = (a: "judging" | "publish") => void M.seasonAction(slug, a).then(() => { d.reload(); list.reload(); }).catch((e) => setMsg(err(e)));
  const open = s?.status === "open" && s.endsOn >= new Date().toISOString().slice(0, 10);
  // jurors report an entry (anonymous: the member stays hidden), everyone can report or block a placed member
  const safe = useMentoringSafety(() => { d.reload(); jury.reload(); });
  return (
    <>
      <LearnHero back={{ href: "/mishary/seasons", label: mt("seasonsTitle") }} kicker={s ? kindLabel(s.kind, mt) : mt("seasonsTitle")} title={s ? seasonTitle(s, lang) : mt("seasonsTitle")}
        lead={s ? `${statusLine(s, mt)} · ${mt("entriesN", { n: d.data!.entries })}` : undefined} word="موسم" uid="msd" />
      <LearnMain className="grid gap-8">
        <Gate error={d.error ?? list.error}>
          {!s ? <Spinner label={mt("loading")} /> : (
            <>
              <Muted>{mt("rewards")}</Muted>
              {item?.mine ? (
                <Section title={mt("yourEntry")}>
                  <Card className="grid gap-3">
                    <p className="font-semibold text-accent">{item.mine.status === "reviewed" ? mt("reviewed") : mt("pending")}</p>
                    <OutlineLink href={`/mishary/mentoring/${item.mine.id}`} className="!h-10 w-fit !px-4">{mt("open")}</OutlineLink>
                  </Card>
                </Section>
              ) : open ? (
                <Section title={mt("enter")}>
                  <Card className="grid gap-4">
                    <VersePick value={s.verses} fixed />
                    <Muted>{mt("recordSeason", { v: s.verses, s: s.maxSeconds })}</Muted>
                    <Recorder maxSec={s.maxSeconds} minSec={10} onTake={setTake} />
                    <p className="flex items-start gap-2 text-[14px] leading-relaxed text-muted"><span aria-hidden className="mt-0.5 text-accent [&>svg]:h-4 [&>svg]:w-4"><IconLock /></span>{mt("entryPrivate")}</p>
                    <GoldButton onClick={() => void enter()} disabled={!take || busy} className="w-fit">{busy ? mt("loading") : mt("sendBtn")}</GoldButton>
                  </Card>
                </Section>
              ) : null}
              <ErrorText text={msg} />
              <Section title={mt("hofTitle")}>
                <Card>{d.data!.results.length ? <Podium list={d.data!.results} onMember={safe.memberMenu} /> : <Muted>{mt("noResults")}</Muted>}</Card>
              </Section>
              {list.data?.judge && !s.published && (
                <Section title={`${mt("toJudge")} (${jury.data?.length ?? 0})`}>
                  <Card>
                    {(jury.data ?? []).length ? (
                      <ul className="divide-y divide-line">
                        {jury.data!.map((x) => (
                          <li key={x.id} className="flex items-center gap-1">
                            <Link href={`/mishary/mentoring/${x.id}`} className="flex min-h-[52px] min-w-0 flex-1 items-center gap-3 py-2.5 transition hover:bg-[rgb(var(--hm-gold))]/[0.06]">
                              <span className="min-w-0 flex-1 text-[14.5px] font-semibold">{mt("entry", { n: x.id })} · {Math.round(x.durationMs / 1000)} s</span>
                              <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>
                            </Link>
                            <SafetyButton label={mt("reportRecording")} onClick={() => safe.reportSubmission(x.id)} />
                          </li>
                        ))}
                      </ul>
                    ) : <Muted>{mt("none")}</Muted>}
                  </Card>
                </Section>
              )}
              {list.data?.admin && !s.published && (
                <div className="flex flex-wrap gap-3">
                  {s.status === "open" && <OutlineButton onClick={() => admin("judging")}>{mt("adminJudging")}</OutlineButton>}
                  <OutlineButton onClick={() => admin("publish")}>{mt("adminPublish")}</OutlineButton>
                </div>
              )}
            </>
          )}
        </Gate>
        {safe.note ? <p role="status" className="text-[13.5px] font-semibold text-accent">{safe.note}</p> : null}
        <SafetyFooter />
      </LearnMain>
      {safe.element}
    </>
  );
}

// ——— /mishary/hall-of-fame ———
export function HallOfFameScreen() {
  const mt = useMt();
  const { lang } = useLang();
  const { user } = useAuth();
  const d = useLoad(() => (user ? M.hallOfFame() : Promise.resolve(null)), [user]);
  const safe = useMentoringSafety(() => d.reload());
  return (
    <>
      <LearnHero back={{ href: "/mishary/seasons", label: mt("seasonsTitle") }} kicker={mt("seasonsTitle")} title={mt("hofTitle")} lead={mt("hofLead")} word="لوحة الشرف" uid="mhf" />
      <LearnMain className="grid gap-8">
        <Gate error={d.error}>
          {!d.data ? <Spinner label={mt("loading")} /> : d.data.seasons.length ? d.data.seasons.map((x) => (
            <Section key={x.season.slug} title={seasonTitle(x.season, lang)}>
              <Card><Podium list={x.podium} onMember={safe.memberMenu} /></Card>
            </Section>
          )) : <Muted>{mt("noResults")}</Muted>}
        </Gate>
        {safe.note ? <p role="status" className="text-[13.5px] font-semibold text-accent">{safe.note}</p> : null}
        <SafetyFooter />
      </LearnMain>
      {safe.element}
    </>
  );
}
