import type { BpText } from "@/lib/blueprint/text";
import { fill } from "@/lib/blueprint/text";
import { verseQuote } from "@/lib/verseQuotes";
import { Avatar, Figure, Ico, MarkStar, Mihrab, Ring, Wave, WaveLine } from "./Art";
import { StatusAndroid, StatusIos } from "./Devices";

// The screens inside the Blueprint device mockups (planned Shams 4.0 features). Fixed design sizes: MacBook 764 × 478,
// display 736 × 414, iPad 568 × 398, phones 278 × 598. Quran text only from the bundled Quran data (lib/verseQuotes,
// never typed by hand); names and values are examples (the scene carries "Illustration · planned").

type M = BpText["mock"];
const GOLD = "#d6b46c";
const LANGS = ["AR", "EN", "DE", "UR", "ID", "TR", "FR", "MS"];
const COUNTRIES = ["AE", "SA", "ID", "KW", "QA", "MY", "TR", "PK"];

const Chip = ({ children, gold = false, className = "" }: { children: React.ReactNode; gold?: boolean; className?: string }) => (
  <span className={`bp-chip ${gold ? "bp-gold-bg" : "bg-white/10 text-white/80"} ${className}`}>{children}</span>
);
const Live = ({ text }: { text: string }) => (
  <span className="bp-chip bp-live gap-1.5"><span className="bp-pulse h-1.5 w-1.5 rounded-full bg-white" />{text}</span>
);

/** the progress bar of the video player: four chapters, the current one gold */
function ChapterBar({ m, at = 1, pct = 0.55 }: { m: M; at?: number; pct?: number }) {
  return (
    <div>
      <div className="flex gap-1" dir="ltr">
        {m.chapterList.map((_, i) => (
          <span key={i} className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-white/15">
            <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: i < at ? "100%" : i === at ? `${pct * 100}%` : 0, background: "linear-gradient(90deg,#c6a65e,#ecd59a)" }} />
            {i === at ? <span className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `calc(${pct * 100}% - 6px)` }} /> : null}
          </span>
        ))}
      </div>
      <div className="mt-1 flex gap-1 text-[9.5px] text-white/50">
        {m.chapterList.map((c, i) => <span key={c} className={`flex-1 truncate ${i === at ? "font-bold text-[#e9cf99]" : ""}`}>{c}</span>)}
      </div>
    </div>
  );
}

/** the video lesson (MacBook, 764 × 478) */
export function VideoLessonScreen({ m }: { m: M }) {
  const verse = verseQuote("qpc", "73:4", 4).split(" ");
  return (
    <div className="bp-ui bp-dark absolute inset-0 flex">
      <div className="flex min-w-0 flex-1 flex-col p-3.5 pe-3">
        <div className="flex items-center gap-2 text-[11px]">
          <MarkStar size={15} /><span className="font-bold">{m.brand}</span>
          <span className="text-white/30">/</span><span className="truncate text-white/60">{m.module}</span>
          <span className="bp-chip ms-auto border border-white/15 text-white/70">{m.noAds}</span>
        </div>
        <div className="relative mt-2.5 flex-1 overflow-hidden rounded-xl ring-1 ring-white/10" style={{ background: "radial-gradient(80% 90% at 50% 10%, #175f4a 0, #0a2e24 55%, #04140f 100%)" }}>
          <Mihrab className="absolute inset-x-0 bottom-0 mx-auto h-[94%] w-[72%]" />
          <Figure kind="ghutra" className="absolute bottom-[-4px] left-1/2 h-[80%] -translate-x-1/2" />
          <div className="absolute start-3 top-3 flex gap-1.5"><Chip gold>{fill(m.lessonOf, { n: 12 })}</Chip><Chip className="bg-black/40">{m.lessonTitle}</Chip></div>
          <div className="bp-glass absolute bottom-[78px] start-3 rounded-lg px-3 py-2">
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#e9cf99]">{m.teacher}</p>
            <p className="text-[12.5px] font-bold">{m.teacherName}</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-2.5 pt-10 text-center">
            <p className="bp-verse text-[25px] text-white">{verse.map((w, i) => <span key={i} className="bp-word">{w} </span>)}<span className="text-[12px] text-[#e9cf99]">73:4</span></p>
            <div className="mt-1 flex justify-center gap-1" dir="ltr">{LANGS.slice(0, 6).map((c, i) => <span key={c} className={`bp-chip h-[17px] px-1.5 text-[9px] ${i === 2 ? "bp-gold-bg" : "bg-white/10 text-white/70"}`}>{c}</span>)}</div>
          </div>
        </div>
        <div className="mt-2.5"><ChapterBar m={m} /></div>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/80">
          <span className="grid h-8 w-8 place-items-center rounded-full bp-gold-bg">{Ico.pause(14)}</span>
          <span dir="ltr" className="tabular-nums text-white/70">04:12 / 11:30</span>
          <span className="ms-auto flex items-center gap-1">{Ico.repeat(13)}{m.repeat}</span>
          <span className="flex items-center gap-1">{m.speed} <b dir="ltr">0.75×</b></span>
          <span className="flex items-center gap-1">{Ico.cc(14)}{m.subtitles}</span>
          {Ico.full(14)}
        </div>
      </div>
      <aside className="flex w-[214px] shrink-0 flex-col border-s border-white/10 bg-black/25 p-3">
        <div className="flex items-center gap-3"><Ring value={42} size={50} /><div className="min-w-0"><p className="text-[9.5px] font-bold uppercase tracking-wider text-white/45">{m.progress}</p><p className="truncate text-[12px] font-bold">{m.module}</p></div></div>
        <div className="bp-glass mt-3 rounded-lg p-2.5">
          <p className="text-[11px] font-semibold text-[#e9cf99]">{fill(m.step, { a: 3, b: 7 })}</p>
          <div className="mt-1.5 flex gap-1">{Array.from({ length: 7 }, (_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < 2 ? "bg-[#d6b46c]" : i === 2 ? "bg-[#ecd59a]" : "bg-white/15"}`} />)}</div>
        </div>
        <ol className="mt-3 grid gap-1">
          {m.lessons.map((l, i) => (
            <li key={l} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] ${i === 1 ? "bg-white/10 ring-1 ring-[#d6b46c]/50" : ""}`}>
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9.5px] font-bold ${i === 0 ? "bg-[#1f7a5c] text-white" : i === 1 ? "bp-gold-bg" : "bg-white/10 text-white/60"}`}>{i === 0 ? Ico.check(11) : i === 1 ? Ico.play(9) : i + 1}</span>
              <span className={`min-w-0 flex-1 truncate ${i > 1 ? "text-white/60" : "font-semibold"}`}>{l}</span>
              <span className="text-[9.5px] text-white/40">{i === 0 ? m.done : i === 1 ? m.now : fill(m.minutes, { n: 8 + i * 2 })}</span>
            </li>
          ))}
        </ol>
        <span className="mt-auto flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#d6b46c]/50 text-[11.5px] font-semibold text-[#f3e2b6]">{Ico.mic(13)}{m.ask}</span>
      </aside>
    </div>
  );
}

/** the same lesson on a phone (278 × 598) */
export function PhoneLessonScreen({ m }: { m: M }) {
  return (
    <div className="bp-ui bp-dark absolute inset-0 flex flex-col">
      <StatusIos />
      <div className="flex items-center gap-2 px-4 text-[12px] text-white/70">{Ico.chevron(15)}<span className="truncate">{m.module}</span></div>
      <div className="relative mx-3 mt-2.5 h-[150px] overflow-hidden rounded-2xl ring-1 ring-white/10" style={{ background: "radial-gradient(80% 90% at 50% 10%, #175f4a 0, #0a2e24 60%, #04140f 100%)" }}>
        <Mihrab className="absolute inset-x-0 bottom-0 mx-auto h-full w-[80%]" />
        <Figure kind="kufi" className="absolute bottom-[-3px] left-1/2 h-[84%] -translate-x-1/2" />
        <span className="absolute start-2 top-2"><Chip gold>{fill(m.lessonOf, { n: 12 })}</Chip></span>
        <span className="absolute bottom-2 end-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white">{Ico.pause(13)}</span>
      </div>
      <div className="px-4 pt-3">
        <p className="text-[16px] font-extrabold leading-tight">{m.lessonTitle}</p>
        <p className="mt-0.5 text-[11px] text-white/55">{m.teacherName}</p>
        <div className="mt-3"><ChapterBar m={m} /></div>
        <div className="bp-glass mt-3 flex items-center gap-2.5 rounded-xl p-2.5">
          <Ring value={42} size={40} stroke={4} />
          <div className="min-w-0 text-[11px]"><p className="font-semibold text-[#e9cf99]">{fill(m.step, { a: 3, b: 7 })}</p><p className="truncate text-white/55">{m.noAds}</p></div>
        </div>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/45">{m.next}</p>
        <ul className="mt-1.5 grid gap-1.5">
          {m.lessons.slice(2, 5).map((l, i) => (
            <li key={l} className="flex items-center gap-2 text-[11.5px]">
              <span className="grid h-9 w-14 shrink-0 place-items-center rounded-lg bg-white/10 text-white/70">{Ico.play(11)}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{l}</span>
              <span className="text-[10px] text-white/45">{fill(m.minutes, { n: 9 + i * 3 })}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto px-4 pb-8"><span className="flex h-11 items-center justify-center rounded-full bp-gold-bg text-[13.5px] font-bold">{m.continue}</span></div>
    </div>
  );
}

/** a live halaqa: teacher, verse, learners (MacBook 764 × 478 or iPad 568 × 398) */
export function LiveClassScreen({ m, compact = false }: { m: M; compact?: boolean }) {
  const verse = verseQuote("imlaei", "67:1");
  const people = m.names.slice(0, compact ? 6 : 8);
  return (
    <div className="bp-ui bp-night absolute inset-0 flex flex-col p-3">
      <div className="flex items-center gap-2 text-[11px]">
        <Live text={m.live} />
        <span className="truncate font-bold">{m.halaqa}</span>
        <span className="ms-auto flex items-center gap-1 text-white/60">{Ico.users(13)}{fill(m.students, { n: people.length })}</span>
        <span dir="ltr" className="tabular-nums text-white/60">32:08</span>
      </div>
      <div className={`mt-2 grid min-h-0 flex-1 gap-2 ${compact ? "grid-cols-[1.35fr_1fr]" : "grid-cols-[1.5fr_1fr]"}`}>
        <div className="relative overflow-hidden rounded-xl ring-1 ring-[#d6b46c]/40" style={{ background: "radial-gradient(90% 90% at 50% 0%, #1a6650 0, #0a2e24 60%, #04140f 100%)" }}>
          <Mihrab className="absolute inset-x-0 bottom-0 mx-auto h-[92%] w-[80%]" />
          <Figure kind="ghutra" className="absolute bottom-[-4px] left-1/2 h-[78%] -translate-x-1/2" />
          <div className="absolute bottom-2 start-2 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-1 text-[10.5px] font-semibold"><span className="text-[#ecd59a]">{Ico.mic(11)}</span>{m.teacherName}</div>
          <span className="absolute end-2 top-2"><Chip className="bg-black/50">{m.teacher}</Chip></span>
        </div>
        <div className="flex min-h-0 flex-col gap-2">
          <div className="rounded-xl bg-[#fbf7ea] p-2.5 text-[#0d1f19]">
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#8a6a2c]">67:1</p>
            <p className={`bp-verse mt-0.5 ${compact ? "text-[15px]" : "text-[17px]"}`}>{verse}</p>
          </div>
          <div className="bp-glass flex items-center gap-2 rounded-xl p-2">
            <Avatar name={people[1]} size={30} on tone="gold" />
            <div className="min-w-0 flex-1 text-[11px]"><p className="text-[#e9cf99]">{m.reciting}</p><p className="truncate font-bold">{people[1]}</p></div>
            <Wave bars={12} h={18} className="text-[#ecd59a]" />
          </div>
          <div className="rounded-xl bg-white/5 p-2 text-[10.5px] text-white/70 ring-1 ring-white/10">
            <p className="font-bold text-white/85">{m.queue}</p>
            <div className="mt-1.5 flex -space-x-1.5 rtl:space-x-reverse">{people.slice(2, 6).map((n) => <Avatar key={n} name={n} size={22} />)}</div>
          </div>
        </div>
      </div>
      <div className={`mt-2 grid gap-1.5 ${compact ? "grid-cols-6" : "grid-cols-8"}`}>
        {people.map((n, i) => (
          <div key={n} className={`flex flex-col items-center gap-1 rounded-lg py-1.5 ${i === 1 ? "bg-[#d6b46c]/15 ring-1 ring-[#d6b46c]/60" : "bg-white/5"}`}>
            <Avatar name={n} size={compact ? 24 : 28} on={i === 1} />
            <span className="max-w-full truncate px-1 text-[9.5px] text-white/70">{n}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2 text-[10.5px]">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">{Ico.mic(14)}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">{Ico.cam(14)}</span>
        <span className="flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3">{Ico.hand(14)}{m.raise}</span>
        <span className="grid h-8 w-10 place-items-center rounded-full bg-[#c8383f]">{Ico.leave(15)}</span>
        {!compact ? <span className="ms-3 flex items-center gap-1 text-white/50">{Ico.shield(12)}{m.consent}</span> : null}
      </div>
    </div>
  );
}

/** the learner's turn in a live class (iPhone 278 × 598) */
export function StudentTurnScreen({ m }: { m: M }) {
  const verse = verseQuote("imlaei", "67:2", 1, 9);
  return (
    <div className="bp-ui bp-night absolute inset-0 flex flex-col">
      <StatusIos />
      <div className="flex items-center gap-2 px-4 text-[11px]"><Live text={m.live} /><span className="truncate text-white/70">{m.halaqa}</span></div>
      <div className="relative mx-3 mt-2.5 h-[118px] overflow-hidden rounded-2xl ring-1 ring-white/10" style={{ background: "radial-gradient(90% 90% at 50% 0%, #1a6650 0, #0a2e24 70%)" }}>
        <Figure kind="ghutra" stand={false} className="absolute bottom-[-6px] left-1/2 h-[96%] -translate-x-1/2" />
        <span className="absolute bottom-1.5 start-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px]">{m.teacherName}</span>
      </div>
      <div className="mx-3 mt-3 rounded-2xl p-3 text-center bp-gold-bg">
        <p className="text-[18px] font-extrabold">{m.yourTurn}</p>
        <p className="bp-verse mt-1 text-[16px] leading-[1.8]">{verse}</p>
        <div className="mt-1 flex justify-center text-[#08261d]"><Wave bars={22} h={22} /></div>
      </div>
      <div className="mx-3 mt-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#e9cf99]">{m.feedback}</p>
        <ul className="mt-2 grid gap-1.5">
          {m.rubric.map((r, i) => (
            <li key={r} className="flex items-center gap-2 text-[11px]">
              <span className="w-[62px] shrink-0 truncate text-white/75">{r}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-[#d6b46c]" style={{ width: `${[92, 78, 88, 84][i]}%` }} /></span>
              <span className="w-4 text-end font-bold tabular-nums" dir="ltr">{[5, 4, 5, 4][i]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-snug text-white/75">{m.note}</p>
      </div>
      <div className="mt-auto flex items-center justify-center gap-3 pb-8">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10">{Ico.mic(17)}</span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10">{Ico.cam(17)}</span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10">{Ico.hand(17)}</span>
        <span className="grid h-11 w-14 place-items-center rounded-full bg-[#c8383f]">{Ico.leave(18)}</span>
      </div>
    </div>
  );
}

/** the waiting room before a class (Android 278 × 598) */
export function WaitingRoomScreen({ m }: { m: M }) {
  return (
    <div className="bp-ui bp-dark absolute inset-0 flex flex-col">
      <StatusAndroid />
      <div className="px-4 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#e9cf99]">{m.brand}</p>
        <p className="text-[20px] font-extrabold">{m.waiting}</p>
      </div>
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl ring-1 ring-[#d6b46c]/40">
        <div className="relative h-[130px]" style={{ background: "radial-gradient(90% 90% at 50% 0%, #1a6650 0, #0a2e24 70%)" }}>
          <Mihrab className="absolute inset-x-0 bottom-0 mx-auto h-full w-[80%]" />
          <Figure kind="hijab" className="absolute bottom-[-3px] left-1/2 h-[86%] -translate-x-1/2" />
        </div>
        <div className="bg-black/25 p-3">
          <p className="text-[13px] font-bold">{m.sistersClass}</p>
          <p className="text-[11px] text-white/60">{m.teacherSister} · <span dir="ltr">19:30</span></p>
        </div>
      </div>
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
        <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="bp-pulse h-2 w-2 rounded-full bg-[#d6b46c]" style={{ animationDelay: `${i * 0.25}s` }} />)}</span>
        <p className="text-[12px] leading-snug text-white/80">{m.waitingText}</p>
      </div>
      <ul className="mx-4 mt-3 grid gap-2 text-[12px]">
        {[m.cam, m.mic].map((x) => <li key={x} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#1f7a5c] text-white">{Ico.check(11)}</span>{x}</li>)}
        <li className="flex items-center gap-2 text-white/60"><span className="grid h-5 w-5 place-items-center rounded-full bg-white/10">{Ico.shield(11)}</span>{m.consent}</li>
      </ul>
      <div className="mt-auto px-4 pb-9"><span className="flex h-11 items-center justify-center rounded-full border border-[#d6b46c]/60 text-[13px] font-bold text-[#f3e2b6]">{m.leave}</span></div>
    </div>
  );
}

/** weekly timetable of the live school (iPad 568 × 398), light */
export function TimetableScreen({ m, locale }: { m: M; locale: string }) {
  let days: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  try {
    const f = new Intl.DateTimeFormat(locale, { weekday: "short" });
    days = Array.from({ length: 7 }, (_, i) => f.format(new Date(Date.UTC(2024, 0, 1 + i, 12))));
  } catch { /* keep English */ }
  const times = ["07:00", "17:30", "19:30", "21:00"];
  // [day, time row, class index, tone]
  const slots: [number, number, number, "e" | "g" | "c"][] = [[0, 0, 1, "e"], [0, 2, 0, "g"], [1, 1, 5, "c"], [1, 2, 2, "e"], [2, 0, 1, "e"], [2, 3, 4, "g"], [3, 2, 6, "c"], [4, 1, 7, "e"], [4, 3, 2, "g"], [5, 1, 5, "c"], [5, 2, 3, "e"], [6, 2, 0, "g"], [3, 0, 1, "e"]];
  const tone = { e: "bg-[#0b3d2f] text-[#f3e2b6]", g: "bp-gold-bg", c: "bg-[#efe6cc] text-[#3b3016] ring-1 ring-[#d6b46c]/50" };
  return (
    <div className="bp-ui bp-paper absolute inset-0 flex flex-col p-3.5">
      <div className="flex items-center gap-2">
        <MarkStar size={16} /><p className="text-[15px] font-extrabold">{m.timetable}</p>
        <span className="ms-auto flex items-center gap-1 text-[10.5px] text-[#5a6762]">{Ico.globe(12)}<span dir="ltr">GMT+4</span></span>
      </div>
      <div className="mt-2.5 grid flex-1 grid-cols-[38px_repeat(7,1fr)] grid-rows-[20px_repeat(4,1fr)] gap-1">
        <span />
        {days.map((d, i) => <span key={i} className={`grid place-items-center rounded-md text-[10px] font-bold ${i === 3 ? "bg-[#0b3d2f] text-[#f3e2b6]" : "text-[#5a6762]"}`}>{d}</span>)}
        {times.map((t, r) => (
          <div key={t} className="contents">
            <span className="pt-1 text-[9.5px] font-semibold tabular-nums text-[#5a6762]" dir="ltr">{t}</span>
            {days.map((_, d) => {
              const s = slots.find(([x, y]) => x === d && y === r);
              return s ? (
                <span key={d} className={`relative flex flex-col justify-between overflow-hidden rounded-lg p-1.5 text-[9px] font-bold leading-tight ${tone[s[3]]}`}>
                  <span>{m.classes[s[2]]}</span>
                  {d === 3 && r === 2 ? <span className="bp-chip bp-live h-[15px] w-fit px-1.5 text-[8px]">{m.live}</span> : null}
                </span>
              ) : <span key={d} className="rounded-lg border border-dashed border-[#d9dfdb]" />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** a Quran conference on a studio display (736 × 414) */
export function ConferenceScreen({ m }: { m: M }) {
  const verse = verseQuote("uthmani", "20:114", 14);
  return (
    <div className="bp-ui bp-night absolute inset-0 flex flex-col">
      <div className="flex items-center gap-2 px-4 pt-3 text-[11.5px]">
        <Live text={m.live} /><span className="font-bold">{m.conference}</span><span className="text-white/40">·</span><span className="truncate text-white/70">{m.panel}</span>
        <span className="ms-auto flex items-center gap-1 text-white/55">{Ico.users(13)}{m.viewers}<span className="ms-1 flex -space-x-1.5 rtl:space-x-reverse">{m.names.slice(0, 5).map((n) => <Avatar key={n} name={n} size={18} />)}</span></span>
      </div>
      <div className="relative mx-4 mt-2 flex-1 overflow-hidden rounded-xl" style={{ background: "radial-gradient(70% 80% at 50% 0%, #1e6b54 0, #0a2e24 55%, #030f0b 100%)" }}>
        <div className="absolute inset-x-0 top-3 text-center">
          <p className="bp-callig text-[40px] leading-[1.5] text-[#ecd59a] [text-shadow:0_0_24px_rgb(214_180_108_/_.35)]">{verse}</p>
          <p className="text-[10px] text-white/45">20:114</p>
        </div>
        <div className="absolute inset-x-[8%] bottom-[18px] h-[34px] rounded-t-md bg-gradient-to-b from-[#6e5426] to-[#3a2c12] shadow-[0_-1px_0_#d6b46c]" />
        {[0.2, 0.5, 0.8].map((x, i) => (
          <div key={x} className="absolute bottom-[40px] w-[150px] -translate-x-1/2" style={{ left: `${x * 100}%` }}>
            <Figure kind={i === 1 ? "ghutra" : "kufi"} stand={false} className="mx-auto h-[118px]" />
            <span className="mx-auto -mt-1 block w-fit rounded bg-[#fbf7ea] px-2 py-0.5 text-[9px] font-bold text-[#0d1f19]">{m.speaker} {i + 1}</span>
          </div>
        ))}
      </div>
      <div className="mx-4 mb-3 mt-2 flex items-center gap-2 rounded-lg bg-black/45 px-3 py-2 ring-1 ring-white/10">
        <span className="flex items-center gap-1 text-[10.5px] font-bold text-[#e9cf99]">{Ico.cc(14)}{m.liveSubs}</span>
        <span className="flex flex-1 flex-col gap-1.5"><span className="bp-skel w-[78%] bg-white/30" /><span className="bp-skel w-[52%]" /></span>
        <span className="flex gap-1" dir="ltr">{LANGS.slice(0, 6).map((c, i) => <span key={c} className={`bp-chip h-[17px] px-1.5 text-[9px] ${i === 1 ? "bp-gold-bg" : "bg-white/10 text-white/70"}`}>{c}</span>)}</span>
      </div>
    </div>
  );
}

/** editing a lesson in the studio (MacBook 764 × 478) */
export function EditTimelineScreen({ m }: { m: M }) {
  const verse = verseQuote("uthmani", "96:1");
  const trackColor = ["#2c7a62", "#2c6a7a", "#5a4c8a", GOLD, "#8a6a2c"];
  return (
    <div className="bp-ui absolute inset-0 flex flex-col bg-[#0b1411]">
      <div className="flex h-8 items-center gap-2 border-b border-white/10 px-3 text-[11px]">
        <span className="flex gap-1.5" dir="ltr"><span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" /></span>
        <span className="ms-2 flex items-center gap-1.5 font-semibold text-white/80">{Ico.scissors(12)}{m.edit}</span>
        <span className="ms-auto flex h-6 items-center rounded-full bp-gold-bg px-3 text-[10.5px] font-bold">{m.export}</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_200px] gap-2 p-2">
        <div className="relative overflow-hidden rounded-md" style={{ background: "radial-gradient(80% 90% at 50% 10%, #175f4a 0, #0a2e24 60%, #04140f 100%)" }}>
          <Mihrab className="absolute inset-x-0 bottom-0 mx-auto h-[94%] w-[60%]" />
          <Figure kind="ghutra" className="absolute bottom-[-4px] left-1/2 h-[78%] -translate-x-1/2" />
          <p className="bp-verse absolute inset-x-0 bottom-1 text-center text-[20px] text-white drop-shadow">{verse}</p>
          <span className="absolute start-2 top-2"><Chip className="bg-black/50">A · 4K</Chip></span>
          <span className="absolute end-2 top-2 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px]" dir="ltr"><span className="bp-pulse h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />00:06:41:12</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-1">{["A", "B", "C"].map((c, i) => <span key={c} className={`relative h-[52px] overflow-hidden rounded ${i === 0 ? "ring-2 ring-[#d6b46c]" : "ring-1 ring-white/10"}`} style={{ background: "linear-gradient(180deg,#145442,#06231a)" }}><span className="absolute bottom-0.5 start-1 text-[9px] font-bold text-white/80">{c}</span></span>)}</div>
          <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#e9cf99]">{m.review}</p>
            <ul className="mt-1.5 grid gap-1 text-[10.5px]">
              {[m.lessonTitle, m.subtitles, m.chapters].map((x, i) => (
                <li key={x} className="flex items-center gap-1.5"><span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${i < 2 ? "bg-[#1f7a5c] text-white" : "bg-[#d6b46c]/25 text-[#e9cf99]"}`}>{i < 2 ? Ico.check(9) : Ico.clock(9)}</span><span className="min-w-0 flex-1 truncate">{x}</span><span className={`text-[9px] ${i < 2 ? "text-[#7fd3ae]" : "text-[#e9cf99]"}`}>{i < 2 ? m.approved : m.pending}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">{m.subtitles}</p>
            <div className="mt-1.5 flex flex-wrap gap-1" dir="ltr">{LANGS.map((c, i) => <span key={c} className={`bp-chip h-[17px] px-1.5 text-[9px] ${i < 5 ? "bg-[#1f7a5c]/60 text-white" : "bg-white/10 text-white/60"}`}>{c}</span>)}</div>
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/10 bg-black/30 px-2 pb-2 pt-1.5">
        <div className="mb-1 flex justify-between ps-[84px] text-[8.5px] tabular-nums text-white/35" dir="ltr">{["00:00", "02:00", "04:00", "06:00", "08:00", "10:00"].map((t) => <span key={t}>{t}</span>)}</div>
        <div className="grid gap-1">
          {m.tracks.map((tr, i) => (
            <div key={tr} className="flex items-center gap-1.5">
              <span className="w-[78px] shrink-0 truncate text-[9.5px] font-semibold text-white/60">{tr}</span>
              <div className="relative h-[18px] flex-1 overflow-hidden rounded-sm bg-white/[0.04]" dir="ltr">
                {i === 3 ? (
                  <span className="absolute inset-0 flex items-center px-1 opacity-90"><WaveLine w={560} h={16} seed={1.3} /></span>
                ) : i === 4 ? (
                  [0.02, 0.2, 0.38, 0.55, 0.72].map((x, k) => <span key={k} className="absolute inset-y-[3px] rounded-sm" style={{ left: `${x * 100}%`, width: "15%", background: trackColor[i] }} />)
                ) : (
                  [[0, 0.3], [0.32, 0.18], [0.52, 0.26], [0.8, 0.2]].filter((_, k) => (k + i) % 2 === 0 || i === 0).map(([x, w], k) => <span key={k} className="absolute inset-y-0 rounded-sm" style={{ left: `${x * 100}%`, width: `${w * 100 - 0.6}%`, background: trackColor[i], boxShadow: "inset 0 0 0 1px rgb(255 255 255 / .15)" }} />)
                )}
              </div>
            </div>
          ))}
        </div>
        <span className="absolute bottom-1 top-4 w-px bg-[#ecd59a]" style={{ left: "calc(84px + 0.62 * (100% - 92px))" }} dir="ltr" />
      </div>
    </div>
  );
}

/** the recording plan of the studio (iPad 568 × 398), light */
export function ShotListScreen({ m }: { m: M }) {
  const st = [m.recorded, m.recorded, m.today, m.planned];
  return (
    <div className="bp-ui bp-paper absolute inset-0 flex flex-col p-4">
      <div className="flex items-center gap-2"><MarkStar size={16} /><p className="text-[16px] font-extrabold">{m.plan}</p><span className="ms-auto text-[11px] text-[#5a6762]">{m.module}</span></div>
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-[1.3fr_1fr] gap-3">
        <ul className="grid content-start gap-2">
          {m.shots.map((s, i) => (
            <li key={s} className={`flex items-center gap-2.5 rounded-xl bg-white p-2.5 text-[12px] ring-1 ${i === 2 ? "ring-[#c6a65e]" : "ring-[#e2e7e4]"}`}>
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold ${i < 2 ? "bg-[#0b3d2f] text-[#f3e2b6]" : i === 2 ? "bp-gold-bg" : "bg-[#eef1ef] text-[#5a6762]"}`}>{i < 2 ? Ico.check(12) : i + 1}</span>
              <span className="min-w-0 flex-1"><span className="block truncate font-bold">{s}</span><span className="text-[10.5px] text-[#5a6762]">{["A · B", "B", "C", "A"][i]}</span></span>
              <span className={`bp-chip ${i < 2 ? "bg-[#e3f2ec] text-[#0f6b4e]" : i === 2 ? "bg-[#f6ecd2] text-[#7a5a1c]" : "bg-[#eef1ef] text-[#5a6762]"}`}>{st[i]}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <div className="relative flex-1 overflow-hidden rounded-xl bg-[#0a2e24] bp-plan-grid">
            <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full" aria-hidden>
              <rect x="10" y="10" width="180" height="130" fill="none" stroke={GOLD} strokeOpacity=".6" />
              <path d="M100 30l-40 70h80z" fill={GOLD} fillOpacity=".12" />
              <circle cx="100" cy="40" r="9" fill="#fbf7ea" /><rect x="88" y="52" width="24" height="10" rx="2" fill="#a7834b" />
              <circle cx="100" cy="112" r="6" fill={GOLD} /><circle cx="40" cy="70" r="5" fill="#e9cf99" /><circle cx="160" cy="70" r="5" fill="#e9cf99" />
              <circle cx="100" cy="122" r="3" fill="#fff" />
            </svg>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[9.5px] font-semibold">
            {Array.from({ length: 7 }, (_, i) => <span key={i} className={`rounded-md py-1.5 ${i === 2 ? "bp-gold-bg" : i < 2 ? "bg-[#0b3d2f] text-[#f3e2b6]" : "bg-white ring-1 ring-[#e2e7e4]"}`}>{12 + i}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/** competition ranking (iPhone 278 × 598) */
export function LeaderboardScreen({ m }: { m: M }) {
  const verse = verseQuote("imlaei", "83:26", 3);
  const rows = m.names.map((n, i) => ({ n, c: COUNTRIES[i], s: [98.6, 97.9, 97.4, 96.8, 96.1, 95.7, 95.2, 94.8][i] }));
  return (
    <div className="bp-ui bp-night absolute inset-0 flex flex-col">
      <StatusIos />
      <div className="px-4 text-center">
        <p className="bp-callig text-[17px] leading-[1.6] text-[#e9cf99]">{verse}</p>
        <p className="text-[9px] text-white/40">83:26</p>
        <p className="mt-1 text-[17px] font-extrabold">{m.board}</p>
        <p className="text-[11px] text-white/60">{m.comp} · {m.youth}</p>
      </div>
      <div className="mx-4 mt-2.5 flex rounded-full bg-white/10 p-0.5 text-[11px] font-semibold">
        <span className="flex-1 rounded-full py-1.5 text-center bp-gold-bg">{m.world}</span><span className="flex-1 py-1.5 text-center text-white/70">{m.country}</span>
      </div>
      <div className="mx-4 mt-3 grid grid-cols-3 items-end gap-2 text-center">
        {[1, 0, 2].map((k) => (
          <div key={k} className="flex flex-col items-center">
            <Avatar name={rows[k].n} size={k === 0 ? 44 : 36} tone={k === 0 ? "gold" : "dark"} on={k === 0} />
            <span className="mt-1 max-w-full truncate text-[10.5px] font-bold">{rows[k].n}</span>
            <span className="text-[9px] text-white/50" dir="ltr">{rows[k].c} · {rows[k].s}</span>
            <span className={`mt-1 w-full rounded-t-lg ${k === 0 ? "h-[52px] bp-gold-bg" : k === 1 ? "h-[38px] bg-[#e9cf99]/40" : "h-[28px] bg-[#e9cf99]/25"} grid place-items-center text-[14px] font-extrabold`}>{k + 1}</span>
          </div>
        ))}
      </div>
      <ul className="mx-3 mt-2 grid gap-1">
        {rows.slice(3, 7).map((r, i) => (
          <li key={r.n} className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[11.5px] ${i === 2 ? "bg-[#d6b46c]/15 ring-1 ring-[#d6b46c]/50" : "bg-white/5"}`}>
            <span className="w-4 text-center font-bold text-white/60 tabular-nums">{i + 4}</span>
            <Avatar name={r.n} size={24} />
            <span className="min-w-0 flex-1 truncate font-semibold">{i === 2 ? `${r.n} · ${m.you}` : r.n}</span>
            <span className="text-[9.5px] text-white/45" dir="ltr">{r.c}</span>
            <span className="w-9 text-end font-bold tabular-nums" dir="ltr">{r.s}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex justify-center pb-8"><span className="bp-chip border border-[#d6b46c]/50 text-[#e9cf99]">{Ico.shield(11)}{m.blind}</span></div>
    </div>
  );
}

/** blind jury (MacBook 764 × 478) */
export function JuryScreen({ m }: { m: M }) {
  const verse = verseQuote("imlaei", "113:1");
  return (
    <div className="bp-ui bp-dark absolute inset-0 flex">
      <aside className="flex w-[190px] shrink-0 flex-col border-e border-white/10 bg-black/25 p-3">
        <div className="flex items-center gap-2"><MarkStar size={15} /><p className="text-[12px] font-bold">{m.jury}</p></div>
        <ul className="mt-3 grid gap-1">
          {[3, 7, 12, 18, 21, 26].map((n, i) => (
            <li key={n} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] ${i === 1 ? "bg-white/10 ring-1 ring-[#d6b46c]/50" : ""}`}>
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-bold ${i === 0 ? "bg-[#1f7a5c] text-white" : i === 1 ? "bp-gold-bg" : "bg-white/10 text-white/60"}`}>{i === 0 ? Ico.check(10) : i === 1 ? Ico.play(8) : ""}</span>
              <span className="flex-1 truncate">{fill(m.participant, { n: String(n).padStart(2, "0") })}</span>
            </li>
          ))}
        </ul>
        <span className="mt-auto flex items-center gap-1.5 text-[10.5px] text-white/55">{Ico.shield(12)}{m.blind}</span>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-center gap-2"><p className="text-[18px] font-extrabold">{fill(m.participant, { n: "07" })}</p><Chip>{m.comp}</Chip><Chip>{m.youth}</Chip></div>
        <div className="mt-3 rounded-xl bg-[#fbf7ea] p-3 text-center text-[#0d1f19]">
          <p className="bp-verse text-[26px]">{verse}</p>
          <p className="text-[10px] text-[#8a6a2c]">113:1</p>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
          <span className="grid h-9 w-9 place-items-center rounded-full bp-gold-bg">{Ico.pause(14)}</span>
          <span className="flex-1 text-[#ecd59a]"><WaveLine w={400} h={30} seed={2.1} /></span>
          <span className="text-[11px] tabular-nums text-white/60" dir="ltr">01:24</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
          {m.rubric.map((r, i) => (
            <div key={r}>
              <div className="flex items-center justify-between text-[11.5px]"><span className="font-semibold">{r}</span><span className="font-bold tabular-nums text-[#e9cf99]" dir="ltr">{[9, 8, 9, 8][i]} / 10</span></div>
              <span className="relative mt-1.5 block h-1.5 rounded-full bg-white/10" dir="ltr"><span className="absolute inset-y-0 left-0 rounded-full bg-[#d6b46c]" style={{ width: `${[90, 80, 90, 80][i]}%` }} /><span className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `calc(${[90, 80, 90, 80][i]}% - 7px)` }} /></span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-3 pt-3">
          <span className="text-[11px] text-white/60">{m.average}</span><span className="text-[22px] font-extrabold tabular-nums" dir="ltr">8.5</span>
          <span className="ms-auto flex h-10 items-center rounded-full bp-gold-bg px-5 text-[12.5px] font-bold">{m.submit}</span>
        </div>
      </div>
    </div>
  );
}

/** children learning on a tablet (iPad 568 × 398), warm cream */
export function KidsTabletScreen({ m }: { m: M }) {
  const verse = verseQuote("uthmani", "112:1");
  const letters = ["ا", "ب", "ت", "ث", "ج"];
  return (
    <div className="bp-ui bp-cream absolute inset-0 flex flex-col p-4">
      <div className="flex items-center gap-2">
        <MarkStar size={18} /><p className="text-[17px] font-extrabold">{m.kids}</p>
        <span className="ms-auto flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#8a6a2c] ring-1 ring-[#e8dcb8]">{Array.from({ length: 4 }, (_, i) => <span key={i} className={i < 3 ? "text-[#c6a65e]" : "text-[#e8dcb8]"}>{Ico.star(12)}</span>)}</span>
      </div>
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-[1.15fr_1fr] gap-3">
        <div className="flex flex-col gap-3">
          <div className="relative h-[150px] overflow-hidden rounded-2xl" style={{ background: "radial-gradient(90% 90% at 50% 0%, #1a6650 0, #0a2e24 75%)" }}>
            <Mihrab className="absolute inset-x-0 bottom-0 mx-auto h-full w-[70%]" />
            <Figure kind="hijab" className="absolute bottom-[-3px] left-1/2 h-[88%] -translate-x-1/2" />
            <span className="absolute bottom-2 end-2 grid h-9 w-9 place-items-center rounded-full bp-gold-bg">{Ico.play(14)}</span>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#8a6a2c]">{m.letters}</p>
            <div className="mt-1.5 flex gap-2" dir="rtl">
              {letters.map((l, i) => <span key={l} className={`grid h-[52px] flex-1 place-items-center rounded-2xl font-arabic text-[30px] ${i === 1 ? "bp-gold-bg bp-ring-glow" : "bg-white text-[#0b3d2f] ring-1 ring-[#e8dcb8]"}`}>{l}</span>)}
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl bg-white p-3 ring-1 ring-[#e8dcb8]">
          <p className="text-[12px] font-bold text-[#0b3d2f]">{m.surahKids}</p>
          <p className="bp-verse mt-2 text-center text-[30px] text-[#0b3d2f]">{verse}</p>
          <p className="text-center text-[10px] text-[#8a6a2c]">112:1</p>
          <div className="mt-auto grid grid-cols-2 gap-2 text-[12px] font-bold">
            <span className="flex h-10 items-center justify-center gap-1 rounded-full bg-[#0b3d2f] text-[#f3e2b6]">{Ico.play(12)}{m.listen}</span>
            <span className="flex h-10 items-center justify-center gap-1 rounded-full bp-gold-bg">{Ico.repeat(12)}{m.again}</span>
          </div>
          <span className="mt-2 flex items-center justify-center gap-1 text-[10.5px] text-[#5a6762]">{Ico.users(12)}{m.parents}</span>
        </div>
      </div>
    </div>
  );
}

/** the reciter academy path (Android 278 × 598) */
export function AcademyScreen({ m }: { m: M }) {
  const steps = [m.audition, m.mentor, m.studio, m.master, m.certificate];
  return (
    <div className="bp-ui bp-dark absolute inset-0 flex flex-col">
      <StatusAndroid />
      <div className="px-4 pt-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#e9cf99]">{m.brand}</p>
        <p className="text-[19px] font-extrabold">{m.academy}</p>
      </div>
      <div className="bp-glass mx-4 mt-3 flex items-center gap-3 rounded-2xl p-3">
        <Ring value={70} size={56} label="7/10" />
        <div className="min-w-0"><p className="text-[15px] font-extrabold">{fill(m.level, { n: 7 })}</p><div className="mt-1.5 flex gap-1">{Array.from({ length: 10 }, (_, i) => <span key={i} className={`h-1.5 w-3 rounded-full ${i < 7 ? "bg-[#d6b46c]" : "bg-white/15"}`} />)}</div></div>
      </div>
      <ol className="relative mx-4 mt-4 grid gap-2.5">
        <span className="absolute bottom-3 top-3 w-px bg-[#d6b46c]/40" style={{ insetInlineStart: 13 }} />
        {steps.map((s, i) => (
          <li key={s} className="relative flex items-center gap-3">
            <span className={`z-[1] grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${i === 0 ? "bg-[#1f7a5c] text-white" : i === 1 ? "bp-gold-bg bp-ring-glow" : "bg-[#0b3328] text-white/50 ring-1 ring-white/15"}`}>{i === 0 ? Ico.check(12) : i > 2 ? Ico.lock(11) : i + 1}</span>
            <span className={`flex-1 rounded-xl px-3 py-2 text-[12px] ${i === 1 ? "bg-white/10 font-bold ring-1 ring-[#d6b46c]/50" : "bg-white/5 text-white/75"}`}>{s}{i === 1 ? <span className="mt-0.5 block text-[10px] font-normal text-[#e9cf99]">{m.today} · <span dir="ltr">20:00</span></span> : null}</span>
          </li>
        ))}
      </ol>
      <div className="mt-auto px-4 pb-9"><span className="flex h-11 items-center justify-center rounded-full bp-gold-bg text-[13px] font-bold">{m.open}</span></div>
    </div>
  );
}
