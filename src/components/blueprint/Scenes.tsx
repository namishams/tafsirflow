import type { BpText } from "@/lib/blueprint/text";
import { Android, Display, Fit, IPad, IPhone, MacBook, Place, Tag } from "./Devices";
import { AcademyScreen, ConferenceScreen, EditTimelineScreen, JuryScreen, KidsTabletScreen, LeaderboardScreen, LiveClassScreen, PhoneLessonScreen, ShotListScreen, StudentTurnScreen, TimetableScreen, VideoLessonScreen, WaitingRoomScreen } from "./Screens";

// Composed device scenes for the Blueprint pages. Wide clusters from the "sm" breakpoint on; phones get a pair of
// phones instead (readable at their size). Scale classes are written out in full so Tailwind generates them.

type T = BpText;
const WIDE = "[--s:0.56] md:[--s:0.68] lg:[--s:0.9] xl:[--s:1]";
const PAIR = "[--s:0.5] min-[375px]:[--s:0.53] min-[414px]:[--s:0.58]";
const MAC_ONLY = "[--s:0.37] min-[375px]:[--s:0.39] min-[414px]:[--s:0.43] sm:[--s:0.66] md:[--s:0.8] lg:[--s:0.62] xl:[--s:0.7]";
const IPAD_ONLY = "[--s:0.54] min-[375px]:[--s:0.57] min-[414px]:[--s:0.63] sm:[--s:0.95] lg:[--s:0.8] xl:[--s:0.92]";
const DISPLAY_ONLY = "[--s:0.43] min-[375px]:[--s:0.45] min-[414px]:[--s:0.5] sm:[--s:0.76] md:[--s:0.9] lg:[--s:0.74] xl:[--s:0.82]";

/** a figure with a scene and a visible caption that describes it (the scene itself is aria-hidden) */
export function SceneFigure({ caption, children, className = "", dark = true }: { caption: string; children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <figure className={className}>
      <div className="flex flex-col items-center">{children}</div>
      <figcaption className={`mx-auto mt-4 max-w-2xl px-2 text-center text-[13px] leading-snug ${dark ? "text-white/55" : "text-muted"}`}>{caption}</figcaption>
    </figure>
  );
}

function PhonePair({ t, left, right, android = true }: { t: T; left: React.ReactNode; right: React.ReactNode; android?: boolean }) {
  return (
    <Fit w={640} h={660} scale={PAIR} className="mx-auto sm:hidden">
      <Place x={0} y={0}><IPhone>{left}</IPhone></Place>
      <Place x={330} y={34}>{android ? <Android>{right}</Android> : <IPhone>{right}</IPhone>}</Place>
      <Tag text={t.common.illustration} />
    </Fit>
  );
}

/** overview hero: MacBook (video lesson), iPad (live class), iPhone (lesson), Android (competition) */
export function HeroScene({ t }: { t: T }) {
  const m = t.mock;
  return (
    <>
      <PhonePair t={t} left={<PhoneLessonScreen m={m} />} right={<LeaderboardScreen m={m} />} />
      <Fit w={1040} h={650} scale={WIDE} className="mx-auto hidden sm:block">
        <Place x={668} y={0} z={1} zoom={0.62} className="bp-float-3"><IPad><LiveClassScreen m={m} compact /></IPad></Place>
        <Place x={74} y={92} z={2} zoom={0.86}><MacBook><VideoLessonScreen m={m} /></MacBook></Place>
        <Place x={0} y={224} z={3} zoom={0.68} className="bp-float"><IPhone><PhoneLessonScreen m={m} /></IPhone></Place>
        <Place x={846} y={250} z={3} zoom={0.64} className="bp-float-2"><Android><LeaderboardScreen m={m} /></Android></Place>
        <Tag text={t.common.illustration} center />
      </Fit>
    </>
  );
}

/** studio: editing on a MacBook, the recording plan on an iPad */
export function StudioScene({ t }: { t: T }) {
  const m = t.mock;
  return (
    <>
      <Fit w={880} h={540} scale={MAC_ONLY} className="mx-auto sm:hidden"><MacBook><EditTimelineScreen m={m} /></MacBook><Tag text={t.common.illustration} /></Fit>
      <Fit w={600} h={430} scale={IPAD_ONLY} className="mx-auto mt-8 sm:hidden"><IPad><ShotListScreen m={m} /></IPad></Fit>
      <Fit w={1040} h={600} scale={WIDE} className="mx-auto hidden sm:block">
        <Place x={0} y={0} z={1} zoom={0.92}><MacBook><EditTimelineScreen m={m} /></MacBook></Place>
        <Place x={640} y={290} z={2} zoom={0.66} className="bp-float"><IPad><ShotListScreen m={m} /></IPad></Place>
        <Tag text={t.common.illustration} />
      </Fit>
    </>
  );
}

/** live school: the class on a MacBook, the learner's turn on an iPhone, the waiting room on Android */
export function LiveScene({ t }: { t: T }) {
  const m = t.mock;
  return (
    <>
      <PhonePair t={t} left={<StudentTurnScreen m={m} />} right={<WaitingRoomScreen m={m} />} />
      <Fit w={880} h={540} scale={MAC_ONLY} className="mx-auto mt-8 sm:hidden"><MacBook><LiveClassScreen m={m} /></MacBook></Fit>
      <Fit w={1040} h={640} scale={WIDE} className="mx-auto hidden sm:block">
        <Place x={116} y={0} z={1} zoom={0.92}><MacBook><LiveClassScreen m={m} /></MacBook></Place>
        <Place x={0} y={210} z={2} zoom={0.66} className="bp-float"><IPhone><StudentTurnScreen m={m} /></IPhone></Place>
        <Place x={852} y={224} z={2} zoom={0.62} className="bp-float-2"><Android><WaitingRoomScreen m={m} /></Android></Place>
        <Tag text={t.common.illustration} />
      </Fit>
    </>
  );
}

/** the weekly timetable on an iPad */
export function TimetableScene({ t, locale }: { t: T; locale: string }) {
  return <Fit w={600} h={440} scale={IPAD_ONLY} className="mx-auto"><IPad><TimetableScreen m={t.mock} locale={locale} /></IPad><Tag text={t.common.illustration} /></Fit>;
}

/** a conference on a studio display */
export function ConferenceScene({ t }: { t: T }) {
  return <Fit w={760} h={520} scale={DISPLAY_ONLY} className="mx-auto"><Display><ConferenceScreen m={t.mock} /></Display><Tag text={t.common.illustration} /></Fit>;
}

/** academy: the blind jury on a MacBook, the ranking on an iPhone, the academy path on Android */
export function AcademyScene({ t }: { t: T }) {
  const m = t.mock;
  return (
    <>
      <PhonePair t={t} left={<LeaderboardScreen m={m} />} right={<AcademyScreen m={m} />} />
      <Fit w={880} h={540} scale={MAC_ONLY} className="mx-auto mt-8 sm:hidden"><MacBook><JuryScreen m={m} /></MacBook></Fit>
      <Fit w={1040} h={640} scale={WIDE} className="mx-auto hidden sm:block">
        <Place x={116} y={0} z={1} zoom={0.92}><MacBook><JuryScreen m={m} /></MacBook></Place>
        <Place x={0} y={210} z={2} zoom={0.66} className="bp-float"><IPhone><LeaderboardScreen m={m} /></IPhone></Place>
        <Place x={852} y={224} z={2} zoom={0.62} className="bp-float-2"><Android><AcademyScreen m={m} /></Android></Place>
        <Tag text={t.common.illustration} />
      </Fit>
    </>
  );
}

/** children learning on an iPad */
export function KidsScene({ t }: { t: T }) {
  return <Fit w={600} h={440} scale={IPAD_ONLY} className="mx-auto"><IPad><KidsTabletScreen m={t.mock} /></IPad><Tag text={t.common.illustration} /></Fit>;
}
