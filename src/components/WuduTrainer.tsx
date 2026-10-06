"use client";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RULE, WUDU, WUDU_KEY, type L3, type Scene, type Tradition, type WuduDone, type WuduStep } from "@/lib/wudu";
import { readJSON, writeJSON } from "@/lib/storage";
import { award } from "@/lib/points";
import { ArrowNext, IconCheckCircle } from "./Icons";

type Lang = "de" | "en" | "ar";
const UI: Record<Lang, Record<string, string>> = {
  de: {
    sunni: "Sunnitisch", shia: "Schiitisch (Dscha'fari)", fard: "Fard · Pflicht", sunnah: "Sunna · empfohlen", wajib: "Wadschib · Pflicht", mustahabb: "Mustahabb · empfohlen",
    right: "rechts", left: "links", each: "je Seite", tapHint: "Tippe bei jedem Durchgang einmal – so behältst du den Überblick.", again: "Neu zählen", count: "Mitzählen",
    play: "Abspielen", pause: "Pause", prev: "Zurück", next: "Weiter", steps: "Alle Schritte", restart: "Von vorn", toQuiz: "Zum Quiz", quiz: "Reihenfolge-Quiz", back: "Zurück zum Trainer",
    meaning: "Bedeutung", passed: "Quiz bestanden",
    note: "Dieser Trainer zeigt den üblichen Ablauf. Einzelheiten unterscheiden sich zwischen den Rechtsschulen – lerne die Gebetswaschung zusätzlich bei einem Lehrer deiner Schule.",
    quizTitle: "In welcher Reihenfolge?", quizLead: "Die Schritte sind durcheinandergeraten. Tippe sie in der richtigen Reihenfolge an.",
    wrong: "Noch nicht – überleg kurz, was davor kommt.", hint: "Kleiner Tipp: Der leuchtende Schritt kommt als Nächstes.", good: "Richtig.",
    doneTitle: "Du kennst die Reihenfolge der Gebetswaschung.", doneText: "Jetzt bist du bereit für das Gebet.", clean: "Ganz ohne Fehler.", slips1: "Mit einem kleinen Umweg – genau so lernt man.", slipsN: "Mit {n} kleinen Umwegen – genau so lernt man.",
    practise: "Noch einmal üben", toSalah: "Weiter zum Gebetstrainer", toVerse: "Den Wudu-Vers hören (5:6)",
  },
  en: {
    sunni: "Sunni", shia: "Shia (Ja'fari)", fard: "Fard · obligatory", sunnah: "Sunnah · recommended", wajib: "Wajib · obligatory", mustahabb: "Mustahabb · recommended",
    right: "right", left: "left", each: "each side", tapHint: "Tap once for every round – it helps you keep count.", again: "Count again", count: "Count",
    play: "Play", pause: "Pause", prev: "Back", next: "Next", steps: "All steps", restart: "Start again", toQuiz: "To the quiz", quiz: "Order quiz", back: "Back to the trainer",
    meaning: "Meaning", passed: "Quiz passed",
    note: "This trainer shows the common sequence. Details differ between the schools – also learn wudu with a teacher of your school.",
    quizTitle: "In which order?", quizLead: "The steps have been mixed up. Tap them in the right order.",
    wrong: "Not yet – think for a moment about what comes before.", hint: "A small hint: the glowing step comes next.", good: "Correct.",
    doneTitle: "You know the order of wudu.", doneText: "Now you are ready for the prayer.", clean: "Without a single mistake.", slips1: "With one small detour – that is exactly how we learn.", slipsN: "With {n} small detours – that is exactly how we learn.",
    practise: "Practise again", toSalah: "On to the prayer trainer", toVerse: "Listen to the wudu verse (5:6)",
  },
  ar: {
    sunni: "أهل السنة", shia: "الشيعة (المذهب الجعفري)", fard: "فرض", sunnah: "سنّة", wajib: "واجب", mustahabb: "مستحبّ",
    right: "اليمنى", left: "اليسرى", each: "لكلٍّ منهما", tapHint: "اضغط مرّةً مع كل غسلة، ليسهل عليك العدّ.", again: "عُدّ من جديد", count: "عُدّ",
    play: "تشغيل", pause: "إيقاف", prev: "السابق", next: "التالي", steps: "كل الخطوات", restart: "من البداية", toQuiz: "إلى الاختبار", quiz: "اختبار الترتيب", back: "العودة إلى المدرّب",
    meaning: "المعنى", passed: "اجتزتَ الاختبار",
    note: "يعرض هذا المدرّب الترتيب المعتاد للوضوء، وتختلف بعض التفاصيل بين المذاهب، فتعلّم الوضوء أيضًا على يد معلّم من مذهبك.",
    quizTitle: "ما الترتيب الصحيح؟", quizLead: "اختلط ترتيب الخطوات، فاضغط عليها بترتيبها الصحيح.",
    wrong: "ليس بعد – تأمّل قليلًا: ما الذي يأتي قبلها؟", hint: "تلميح: الخطوة المضيئة هي التالية.", good: "أحسنت.",
    doneTitle: "أحسنت، عرفتَ ترتيب الوضوء.", doneText: "أنت الآن مستعدّ للصلاة.", clean: "دون أي خطأ.", slips1: "مع خطأ صغير واحد، وهكذا يكون التعلّم.", slipsN: "مع {n} أخطاء صغيرة، وهكذا يكون التعلّم.",
    practise: "تدرّب مرّةً أخرى", toSalah: "إلى مدرّب الصلاة", toVerse: "استمع إلى آية الوضوء (المائدة: 6)",
  },
};
const AR_TIMES = ["", "مرّة واحدة", "مرّتين", "ثلاث مرّات"];

// ---------- drawing ----------
const GOLD = "rgb(214 180 108)";
const WATER = "rgb(166 214 228)";
const DROP = "M0 -4.5C1.6 -2 3.2 0 3.2 1.8A3.2 3.2 0 0 1 -3.2 1.8C-3.2 0 -1.6 -2 0 -4.5Z";

const CSS = `
.wd-in{animation:wdIn .6s ease both}
@keyframes wdIn{from{opacity:0}to{opacity:1}}
.wd-drop{animation:wdDrop 2.4s cubic-bezier(.55,0,.85,.5) infinite}
@keyframes wdDrop{0%{transform:translateY(0);opacity:0}15%{opacity:.95}75%{opacity:.85}100%{transform:translateY(var(--fall,60px));opacity:0}}
.wd-flow{stroke-dasharray:5 9;animation:wdFlow 1.7s linear infinite}
@keyframes wdFlow{to{stroke-dashoffset:-28}}
.wd-sweep{stroke-dasharray:16 200;animation:wdSweep 3.2s ease-in-out infinite alternate}
@keyframes wdSweep{from{stroke-dashoffset:0}to{stroke-dashoffset:-84}}
.wd-once{stroke-dasharray:20 200;animation:wdOnce 2.8s ease-in-out infinite}
@keyframes wdOnce{0%{stroke-dashoffset:20;opacity:0}15%{opacity:1}85%{opacity:1}100%{stroke-dashoffset:-100;opacity:0}}
.wd-glow{animation:wdGlow 3.4s ease-in-out infinite}
@keyframes wdGlow{0%,100%{opacity:.35}50%{opacity:.9}}
.wd-ripple{transform-box:fill-box;transform-origin:center;animation:wdRipple 2.4s ease-out infinite}
@keyframes wdRipple{from{transform:scale(.4);opacity:.9}to{transform:scale(1.5);opacity:0}}
.wd-turn{transform-box:fill-box;transform-origin:center;animation:wdTurn 5s linear infinite}
@keyframes wdTurn{to{transform:rotate(360deg)}}
.wd-twinkle{transform-box:fill-box;transform-origin:center;animation:wdTwinkle 3.6s ease-in-out infinite}
@keyframes wdTwinkle{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
.wd-shake{animation:wdShake .45s ease}
@keyframes wdShake{0%,100%{transform:none}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.wd-hint{animation:wdHint 1.6s ease-in-out infinite}
@keyframes wdHint{0%,100%{box-shadow:0 0 0 0 rgb(214 180 108/.0)}50%{box-shadow:0 0 0 4px rgb(214 180 108/.35)}}
@media (prefers-reduced-motion:reduce){
.wd-in,.wd-drop,.wd-flow,.wd-sweep,.wd-once,.wd-glow,.wd-ripple,.wd-turn,.wd-twinkle,.wd-shake,.wd-hint{animation:none!important}
.wd-sweep,.wd-once{stroke-dasharray:none}
.wd-drop{transform:translateY(calc(var(--fall,60px)*.45));opacity:.8}
.wd-ripple{opacity:.5}
}`;

function Drop({ x, y, fall = 60, delay = 0, s = 1 }: { x: number; y: number; fall?: number; delay?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path className="wd-drop" d={DROP} fill={WATER} style={{ "--fall": `${fall / s}px`, animationDelay: `-${delay}s` } as CSSProperties} />
    </g>
  );
}
function Route({ d, kind, w = 2.6, delay = 0 }: { d: string; kind: "sweep" | "once"; w?: number; delay?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={WATER} strokeOpacity=".4" strokeWidth="1.1" strokeDasharray="1 4" strokeLinecap="round" />
      <path d={d} {...water(w)} pathLength={100} className={kind === "sweep" ? "wd-sweep" : "wd-once"} style={delay ? { animationDelay: `-${delay}s` } : undefined} />
    </>
  );
}
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const faint = { ...line, strokeOpacity: 0.35, strokeWidth: 1.1 } as const;
const gold = (o = 1, w = 1.8) => ({ fill: "none", stroke: GOLD, strokeOpacity: o, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" }) as const;
const water = (w = 2) => ({ fill: "none", stroke: WATER, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" }) as const;

// profile bust, facing the qibla side like the prayer trainer's figure
const HEAD = "M86 150C74 136 66 118 66 98C66 64 90 42 120 42C146 42 160 58 160 78C160 86 158 92 157 96C160 100 162 103 164 106L172 120C173 123 170 125 165 124L160 125C161 128 162 130 161 132C159 133 158 133 157 134C159 135 161 137 160 140C159 142 156 143 156 145C158 150 158 156 152 159C146 162 138 162 132 162C130 166 130 172 130 180";
const HAIR = "M158 66C146 68 132 76 125 86C121 92 118 96 116 100L104 126C98 136 92 144 86 150C74 136 66 118 66 98C66 64 90 42 120 42C146 42 160 58 160 78Z";
const FACE = "M158 66C159 70 160 74 160 78C160 86 158 92 157 96C160 100 162 103 164 106L172 120C173 123 170 125 165 124L160 125C161 128 162 130 161 132C159 133 158 133 157 134C159 135 161 137 160 140C159 142 156 143 156 145C158 150 158 156 152 159C146 160 138 158 130 154C118 148 110 138 106 124L116 100C118 96 121 92 125 86C132 76 146 68 158 66Z";
const EAR = "M110 92C104 86 95 90 95 100C95 110 97 118 101 123C104 127 109 126 109 121";
const LIPS = "M160 125C161 128 162 130 161 132C159 133 158 133 157 134C159 135 161 137 160 140";
const NOSE = "M157 96C160 100 162 103 164 106L172 120C173 123 170 125 165 124L160 125";

function Bust({ hl, tradition }: { hl: Scene; tradition: Tradition }) {
  return (
    <g>
      <defs><clipPath id="wd-face"><path d={FACE} /></clipPath></defs>
      {/* hair and garment, very light */}
      <path d={HAIR} fill="currentColor" fillOpacity={hl === "head" ? 0 : 0.06} />
      {hl === "head" && (tradition === "sunni"
        ? <path d={HAIR} fill={GOLD} fillOpacity=".16" className="wd-glow" />
        : <path d="M128 45C142 48 152 56 157 66" {...gold(0.3, 10)} />)}
      {hl === "face" && <path d={FACE} fill={GOLD} fillOpacity=".15" stroke={GOLD} strokeOpacity=".5" strokeWidth="1" />}
      {hl === "ears" && <circle cx="103" cy="106" r="17" fill={GOLD} fillOpacity=".14" className="wd-glow" />}
      {hl === "heart" && (
        <g>
          <circle cx="146" cy="212" r="22" fill={GOLD} fillOpacity=".14" className="wd-glow" />
          <path d="M146 202l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={GOLD} fillOpacity=".85" />
        </g>
      )}
      <path d={HEAD} {...line} />
      <path d="M86 150C88 160 90 170 90 182" {...line} />
      <path d="M130 180C146 186 168 196 180 214C186 224 188 232 189 240M90 182C74 190 58 200 50 214C46 222 44 232 43 240" {...line} />
      <path d="M92 186C104 196 120 196 131 186" {...faint} />
      <path d="M158 66C146 68 132 76 125 86C121 92 118 96 116 100" {...faint} />
      <path d="M106 124C110 138 118 148 130 154C138 158 146 160 152 159" {...faint} />
      <path d="M141 99C144 97 148 97 151 99" {...line} strokeWidth="1.3" />
      <path d="M139 91C144 88 149 88 154 90" {...faint} />
      <path d="M163 121C164 119 166 119 167 121" {...faint} />
      <path d={EAR} {...(hl === "ears" ? gold(1, 2) : line)} />
      <path d="M106 97C101 98 100 105 103 110" {...faint} />
      {hl === "mouth" && (
        <g>
          <path d={LIPS} {...gold(1, 2.2)} />
          <circle cx="165" cy="133" r="9" fill="none" stroke={WATER} strokeWidth="1.4" className="wd-ripple" />
          <circle cx="165" cy="133" r="13" fill="none" stroke={WATER} strokeWidth="1.2" strokeDasharray="3 5" className="wd-turn" />
        </g>
      )}
      {hl === "nose" && (
        <g>
          <path d={NOSE} {...gold(1, 2.2)} />
          <Route d="M172 140C169 133 166 127 164 122C162 117 160 113 159 108" kind="sweep" w={2.4} />
        </g>
      )}
      {hl === "face" && (
        <g clipPath="url(#wd-face)">
          <path d="M152 70C155 100 153 128 150 152M140 78C142 106 142 132 141 154M128 90C130 112 131 132 132 150M117 104C119 120 121 134 124 146" {...water(1.8)} className="wd-flow" />
        </g>
      )}
      {hl === "face" && <><Drop x={150} y={164} fall={36} /><Drop x={142} y={166} fall={32} delay={1.2} s={0.8} /></>}
      {hl === "head" && (tradition === "sunni"
        ? <Route d="M154 63C142 49 122 45 104 50C86 56 72 74 70 96C70 112 76 126 84 138" kind="sweep" w={3} />
        : <Route d="M128 45C142 48 152 56 157 66" kind="once" w={3} />)}
      {hl === "ears" && (
        <g>
          <Route d="M107 97C102 99 101 106 104 111" kind="sweep" w={2.4} />
          <Route d="M92 92C89 102 90 114 96 124" kind="sweep" w={2.4} delay={1.6} />
        </g>
      )}
    </g>
  );
}

// open right hand, palm towards us; the left one is the mirror image
const HAND = "M-17 0C-18 -14 -21 -26 -22 -40L-22 -62C-22 -69 -13 -69 -13 -62L-13 -52L-12 -76C-12 -84 -2 -84 -2 -76L-2 -54L-1 -80C-1 -88 9 -88 9 -80L9 -54L10 -75C10 -82 19 -82 19 -75L19 -44C22 -42 27 -46 31 -52C34 -57 41 -56 40 -50C38 -40 30 -26 22 -14C19 -9 18 -4 18 0";
function Hand({ x, mirror }: { x: number; mirror?: boolean }) {
  return (
    <g transform={`translate(${x} 204)${mirror ? " scale(-1 1)" : ""}`}>
      <path d={`${HAND}Z`} fill={GOLD} fillOpacity=".13" />
      <path d={HAND} {...line} />
      <path d="M-15 -28C-6 -34 6 -36 15 -30M18 -20C11 -26 9 -36 13 -44" {...faint} />
      <path d="M-20 -7L20 -7" {...gold(0.9, 1.3)} strokeDasharray="2 3" />
      <path d="M-7 -66C-7 -48 -5 -30 -3 -12M4 -70C4 -50 5 -30 6 -12M14 -62C14 -46 13 -30 12 -16" {...water(1.6)} className="wd-flow" />
    </g>
  );
}

const ARM = "M0 96C30 93 62 93 84 98C112 103 152 106 180 104C192 102 204 99 214 100C224 101 231 104 236 108C238 111 235 114 230 114C220 114 210 115 202 117C194 119 186 120 179 120C152 123 116 127 94 129C88 134 80 137 72 134C48 136 24 137 0 137";
function Arm({ tradition, left }: { tradition: Tradition; left?: boolean }) {
  return (
    <g transform={left ? "translate(240 0) scale(-1 1)" : undefined}>
      <defs><clipPath id={left ? "wd-arm-l" : "wd-arm"}><path d={`${ARM}Z`} /></clipPath></defs>
      <g transform="translate(0 6)">
        <rect x="64" y="80" width="180" height="70" fill={GOLD} fillOpacity=".15" clipPath={`url(#${left ? "wd-arm-l" : "wd-arm"})`} />
        <path d={ARM} {...line} />
        <path d="M214 105C222 106 229 107 235 109M184 114C194 113 204 113 214 112" {...faint} />
        <path d="M64 84V148" {...gold(0.85, 1.3)} strokeDasharray="2 3" />
        <circle cx="74" cy="134" r="3" fill={GOLD} />
        {tradition === "shia" ? (
          <>
            <path d="M80 112C120 114 160 113 200 109C214 107 226 108 232 110M84 121C124 121 160 119 196 115" {...water(1.8)} className="wd-flow" />
            <Drop x={233} y={120} fall={72} /><Drop x={226} y={120} fall={66} delay={1.3} s={0.8} />
          </>
        ) : (
          <>
            <Drop x={100} y={44} fall={50} /><Drop x={132} y={40} fall={58} delay={0.8} /><Drop x={164} y={46} fall={50} delay={1.5} /><Drop x={202} y={42} fall={50} delay={0.4} s={0.85} />
            <Drop x={118} y={134} fall={60} delay={1.1} s={0.8} /><Drop x={176} y={128} fall={64} delay={0.2} s={0.8} />
            <path d="M84 112C120 116 160 116 200 110" {...water(1.6)} strokeOpacity=".7" className="wd-flow" />
          </>
        )}
      </g>
    </g>
  );
}

const FOOT = "M90 30C86 74 88 116 96 146C99 158 96 170 90 184C84 198 86 214 102 214L198 214C212 214 220 210 220 204C220 198 213 194 203 192C179 188 152 176 136 160C129 152 127 140 127 124C127 92 129 60 130 30";
const INSTEP = "M212 196C188 190 158 178 136 162";
function Foot({ tradition }: { tradition: Tradition }) {
  return (
    <g>
      <defs><clipPath id="wd-foot"><path d={`${FOOT}Z`} /></clipPath></defs>
      {tradition === "sunni" ? (
        <>
          <rect x="60" y="148" width="180" height="70" fill={GOLD} fillOpacity=".15" clipPath="url(#wd-foot)" />
          <path d="M84 148H140" {...gold(0.85, 1.3)} strokeDasharray="2 3" />
        </>
      ) : (
        <path d={INSTEP} {...gold(0.3, 10)} />
      )}
      <path d={FOOT} {...line} />
      <path d="M60 221H232" {...faint} />
      <circle cx="114" cy="164" r="5" {...faint} />
      <path d="M204 193C208 199 209 207 206 214M212 196C215 197 217 199 217 202" {...faint} />
      {tradition === "sunni" ? (
        <>
          <Drop x={152} y={100} fall={66} /><Drop x={176} y={104} fall={74} delay={0.9} /><Drop x={198} y={100} fall={84} delay={1.6} s={0.85} /><Drop x={118} y={92} fall={52} delay={0.5} s={0.85} />
          <circle cx="208" cy="206" r="6" fill="none" stroke={WATER} strokeWidth="1.2" className="wd-ripple" />
        </>
      ) : (
        <Route d={INSTEP} kind="once" w={3} />
      )}
    </g>
  );
}

// ewer: pours for the bismillah, rests at the end
function Vessel({ pouring }: { pouring: boolean }) {
  return (
    <g>
      {!pouring && <circle cx="120" cy="140" r="64" fill={GOLD} fillOpacity=".08" className="wd-glow" />}
      <path d="M106 72C108 60 132 60 134 72M102 72H138" {...line} />
      <circle cx="120" cy="57" r="3.2" {...line} />
      <path d="M108 72C108 84 106 92 100 99C80 113 74 146 86 168C94 182 146 182 154 168C166 146 160 113 140 99C134 92 132 84 132 72" {...line} />
      <path d="M100 180L96 194H144L140 180" {...line} />
      <path d="M157 132C172 126 180 110 186 90M155 152C175 146 186 122 195 92M186 90C188 86 193 87 195 92" {...line} />
      <path d="M107 80C88 72 64 82 64 104C64 117 71 125 80 129M107 86C92 81 72 88 72 104C72 113 76 118 81 121" {...line} />
      <path d="M86 134C104 142 136 142 154 134" {...gold(0.9, 1.4)} />
      <path d="M120 146l5 5-5 5-5-5z" fill={GOLD} />
      <path d="M94 120C110 126 130 126 146 120" {...gold(0.5, 1)} strokeDasharray="1 4" />
      {pouring ? (
        <>
          <path d="M166 214C170 224 214 224 218 214M162 214H222" {...line} />
          <ellipse cx="192" cy="214" rx="12" ry="3" fill="none" stroke={WATER} strokeWidth="1.2" className="wd-ripple" />
          <Drop x={194} y={100} fall={110} /><Drop x={194} y={100} fall={110} delay={0.8} /><Drop x={194} y={100} fall={110} delay={1.6} />
        </>
      ) : (
        <g fill={GOLD}>
          {[[62, 70, 0], [182, 58, 1.2], [56, 168, 2.1], [190, 176, 0.6], [150, 40, 2.8]].map(([x, y, d]) => (
            <path key={`${x}-${y}`} d={`M${x} ${y - 6}l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z`} className="wd-twinkle" style={{ animationDelay: `-${d}s` }} />
          ))}
        </g>
      )}
    </g>
  );
}

function Stage({ scene, tradition, label }: { scene: Scene; tradition: Tradition; label: string }) {
  const bust = scene === "heart" || scene === "mouth" || scene === "nose" || scene === "face" || scene === "head" || scene === "ears";
  return (
    <svg viewBox="0 0 240 240" className="h-full w-full" role="img" aria-label={label}>
      {/* mihrab outline behind every scene */}
      <path d="M26 238V110C26 62 70 34 120 18C170 34 214 62 214 110V238" fill="none" stroke={GOLD} strokeOpacity=".16" strokeWidth="1" />
      <path d="M120 10l3 5-3 5-3-5z" fill={GOLD} fillOpacity=".4" />
      <g key={`${scene}-${tradition}`} className="wd-in">
        {bust && <Bust hl={scene} tradition={tradition} />}
        {scene === "hands" && (
          <g>
            <Hand x={152} /><Hand x={88} mirror />
            <Drop x={72} y={46} fall={58} /><Drop x={90} y={40} fall={60} delay={1.1} s={0.85} /><Drop x={150} y={42} fall={62} delay={0.5} /><Drop x={168} y={48} fall={56} delay={1.7} s={0.85} />
          </g>
        )}
        {(scene === "arm" || scene === "armL") && <Arm tradition={tradition} left={scene === "armL"} />}
        {scene === "feet" && <Foot tradition={tradition} />}
        {(scene === "vessel" || scene === "end") && <Vessel pouring={scene === "vessel"} />}
      </g>
    </svg>
  );
}

// ---------- tap counter: a ring of segments, one per round ----------
function arc(r: number, a0: number, a1: number) {
  const p = (a: number) => [32 + r * Math.cos(a), 32 + r * Math.sin(a)].map((v) => v.toFixed(2)).join(" ");
  return `M${p(a0)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}`;
}
function Counter({ times, sides, u, lang }: { times: number; sides?: boolean; u: Record<string, string>; lang: Lang }) {
  const total = times * (sides ? 2 : 1);
  const [n, setN] = useState(0);
  const done = n >= total;
  const onLeft = sides && n >= times;
  const inSide = done ? times : n - (onLeft ? times : 0);
  const gap = total > 1 ? 0.22 : 0;
  const seg = (Math.PI * 2) / total;
  const label = lang === "ar" ? `${AR_TIMES[times] ?? times}${sides ? ` ${u.each}` : ""}` : `${times}×${sides ? ` ${u.each}` : ""}`;
  return (
    <div className="mt-5 flex items-center gap-4">
      <button
        type="button" onClick={() => setN(done ? 0 : n + 1)} aria-label={`${done ? u.again : u.count}: ${n} / ${total}`}
        className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full transition active:scale-95"
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full" aria-hidden>
          {total === 1
            ? <circle cx="32" cy="32" r="28" fill="none" strokeWidth="3" stroke={n >= 1 ? GOLD : "rgb(255 255 255 / .18)"} />
            : Array.from({ length: total }, (_, k) => {
                const a0 = -Math.PI / 2 + k * seg + gap / 2;
                return <path key={k} d={arc(28, a0, a0 + seg - gap)} fill="none" strokeWidth="3" strokeLinecap="round" stroke={k < n ? GOLD : "rgb(255 255 255 / .18)"} />;
              })}
        </svg>
        {done ? <span className="pop text-[rgb(var(--gold))]"><IconCheckCircle className="h-7 w-7" /></span> : (
          <span className="leading-none">
            <span key={n} className="pop block text-xl font-bold tabular-nums">{inSide}</span>
            {sides && <span className="block text-[10px] font-semibold text-white/60">{onLeft ? u.left : u.right}</span>}
          </span>
        )}
      </button>
      <div className="min-w-0">
        <p className="font-display text-2xl leading-none text-[rgb(var(--gold))]">{label}</p>
        <p className="mt-1.5 text-[13px] leading-snug text-white/60">{done ? u.again : u.tapHint}</p>
      </div>
    </div>
  );
}

// Arabic counts need dual and plural forms
function slips(n: number, lang: Lang, u: Record<string, string>) {
  if (n === 0) return u.clean;
  if (n === 1) return u.slips1;
  if (lang === "ar") return n === 2 ? "مع خطأين صغيرين، وهكذا يكون التعلّم." : n <= 10 ? u.slipsN.replace("{n}", String(n)) : `مع ${n} خطأً صغيرًا، وهكذا يكون التعلّم.`;
  return u.slipsN.replace("{n}", String(n));
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let k = b.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [b[k], b[j]] = [b[j], b[k]]; }
  return b;
}

export default function WuduTrainer() {
  const locale = useLocale();
  const lang: Lang = locale === "de" ? "de" : locale === "ar" ? "ar" : "en";
  const u = UI[lang];
  const tx = (v?: L3) => (v ? v[lang] : "");
  const [tradition, setTradition] = useState<Tradition>("sunni");
  const steps = WUDU[tradition];
  const order = useMemo(() => steps.filter((s) => s.quiz), [steps]);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [list, setList] = useState(false);
  const [mode, setMode] = useState<"learn" | "quiz" | "done">("learn");
  const [pool, setPool] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [miss, setMiss] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState<{ id: string; t: number } | null>(null);
  const [passed, setPassed] = useState<WuduDone | null>(null);
  const step: WuduStep = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;

  useEffect(() => { const r = readJSON<WuduDone | null>(WUDU_KEY, null); if (r?.done) setPassed(r); }, []);
  useEffect(() => {
    if (!auto || mode !== "learn") return;
    if (last) { setAuto(false); return; }
    const len = step.text[lang].length + (step.duas?.reduce((n, d) => n + d.ar.length, 0) ?? 0);
    const id = setTimeout(() => setI((n) => n + 1), Math.min(13000, 4500 + len * 32));
    return () => clearTimeout(id);
  }, [auto, i, last, step, lang, mode]);

  const startQuiz = (t: Tradition = tradition) => {
    const ids = WUDU[t].filter((s) => s.quiz).map((s) => s.id);
    let mixed = shuffle(ids);
    while (mixed.join() === ids.join()) mixed = shuffle(ids);
    setPool(mixed); setPicked([]); setMiss(0); setStreak(0); setWrong(null); setAuto(false); setMode("quiz");
  };
  const chooseTradition = (t: Tradition) => {
    if (t === tradition) return;
    setTradition(t); setI(0); setAuto(false);
    if (mode !== "learn") startQuiz(t);
  };
  const pick = (id: string) => {
    if (mode !== "quiz" || picked.includes(id)) return;
    if (id === order[picked.length].id) {
      const next = [...picked, id];
      setPicked(next); setStreak(0); setWrong(null);
      if (next.length === order.length) {
        const rec: WuduDone = { done: true, at: Date.now(), tradition };
        writeJSON(WUDU_KEY, rec); // writeJSON never throws (storage may be blocked)
        award("wudu");
        setPassed(rec);
        setTimeout(() => setMode("done"), 650);
      }
    } else {
      setMiss((m) => m + 1); setStreak((s) => s + 1); setWrong({ id, t: Date.now() });
    }
  };
  const goStep = (k: number) => { setAuto(false); setMode("learn"); setI(k); };
  const kindLabel = (s: WuduStep) => (tradition === "sunni" ? u[s.kind] : u[s.kind === "fard" ? "wajib" : "mustahabb"]);
  const byId = (id: string) => steps.find((s) => s.id === id)!;
  const chip = (on: boolean) => `h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${on ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))] text-[rgb(var(--stage))]" : "border-white/20 text-white/80 hover:border-white/50"}`;
  const ghost = "h-12 rounded-md border border-white/20 px-4 text-sm font-bold transition hover:border-white/45 disabled:opacity-30";

  return (
    <div className="stage overflow-hidden rounded-2xl text-[#eef0f3]">
      <style>{CSS}</style>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" role="tablist">
          {(["sunni", "shia"] as const).map((t) => <button key={t} role="tab" aria-selected={tradition === t} onClick={() => chooseTradition(t)} className={chip(tradition === t)}>{u[t]}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {passed && <span className="inline-flex h-10 items-center gap-1.5 px-1 text-sm font-semibold text-[rgb(var(--gold))]"><IconCheckCircle className="h-5 w-5" />{u.passed}</span>}
          <button onClick={() => (mode === "learn" ? startQuiz() : goStep(i))} className={chip(false)}>{mode === "learn" ? u.quiz : u.back}</button>
        </div>
      </div>

      {mode === "learn" && (
        <div className="grid gap-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative border-b border-white/10 p-4 md:border-b-0 md:border-e">
            <div className="mx-auto aspect-square max-w-[360px] text-white"><Stage scene={step.scene} tradition={tradition} label={tx(step.title)} /></div>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5" aria-hidden>
              {steps.map((s, k) => <span key={s.id} className={`h-1.5 w-5 rounded-full transition ${k < i ? "bg-[rgb(var(--gold))]" : k === i ? "bg-white" : "bg-white/15"}`} />)}
            </div>
          </div>

          <div className="flex min-h-[420px] flex-col p-5 sm:p-7">
            <div key={`${tradition}-${i}`} className="step-in">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal">{i + 1} / {steps.length}</p>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${step.kind === "fard" ? "border-[rgb(var(--gold))]/70 text-[rgb(var(--gold))]" : "border-white/25 text-white/70"}`}>{kindLabel(step)}</span>
              </div>
              <h3 className="font-display mt-2 text-3xl leading-tight">{tx(step.title)}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-white/85">{tx(step.text)}</p>
              {step.times && <Counter key={`${tradition}-${step.id}`} times={step.times} sides={step.sides} u={u} lang={lang} />}
              {step.duas?.map((d) => (
                <div key={d.ar} className="mt-5 border-t border-white/10 pt-4">
                  <p className="font-arabic text-[26px] leading-[2] sm:text-[30px]" dir="rtl" lang="ar">{d.ar}</p>
                  {lang !== "ar" && <p className="mt-2 text-[15px] italic leading-relaxed text-[rgb(var(--gold))]">{d.tr}</p>}
                  {lang !== "ar" && <p className="mt-2 text-[15px] leading-relaxed text-white/80"><span className="font-semibold text-white">{u.meaning}: </span>{d.meaning[lang]}</p>}
                  {d.src && <p className="mt-1.5 text-xs font-semibold text-white/50">{tx(d.src)}</p>}
                </div>
              ))}
              {step.note && <p className="mt-4 rounded-lg bg-white/[0.06] p-3 text-sm leading-relaxed text-white/75">{tx(step.note)}</p>}
            </div>
            <div className="mt-auto pt-6">
              <div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[rgb(var(--gold))] transition-all" style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div>
              <div className="mt-4 flex items-center gap-2">
                <button onClick={() => { setAuto(false); setI((n) => Math.max(0, n - 1)); }} disabled={i === 0} className={ghost}>{u.prev}</button>
                <button onClick={() => (last ? startQuiz() : setAuto((a) => !a))} className="btn-gold h-12 flex-1 rounded-md px-3 text-sm font-bold">{last ? u.toQuiz : auto ? u.pause : u.play}</button>
                <button onClick={() => { setAuto(false); setI((n) => Math.min(steps.length - 1, n + 1)); }} disabled={last} className={ghost}>{u.next}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "quiz" && (
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal">{u.quiz} · {picked.length} / {order.length}</p>
          <h3 className="font-display mt-2 text-3xl leading-tight">{u.quizTitle}</h3>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/75">{u.quizLead}</p>
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {pool.map((id) => {
              const s = byId(id);
              const at = picked.indexOf(id);
              const isWrong = wrong?.id === id;
              const isHint = streak >= 2 && order[picked.length]?.id === id;
              return (
                <li key={`${id}-${isWrong ? wrong!.t : 0}`} className={isWrong ? "wd-shake" : undefined}>
                  <button
                    onClick={() => pick(id)} disabled={at >= 0}
                    className={`flex min-h-[56px] w-full items-center gap-2.5 rounded-md border px-3 py-2 text-start text-[14.5px] font-semibold leading-snug transition ${at >= 0 ? "border-[rgb(var(--gold))]/60 bg-[rgb(var(--gold))]/15 text-white" : isHint ? "wd-hint border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/[0.07]" : isWrong ? "border-amber-200/50 bg-white/[0.04]" : "border-white/15 bg-white/[0.04] hover:border-white/40"}`}
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums ${at >= 0 ? "bg-[rgb(var(--gold))] text-[rgb(var(--stage))]" : "border border-white/20 text-white/40"}`}>{at >= 0 ? at + 1 : "·"}</span>
                    <span className="min-w-0">{tx(s.title)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 min-h-[1.5rem] text-sm text-white/70" aria-live="polite">
            {wrong ? (streak >= 2 ? u.hint : u.wrong) : picked.length > 0 ? u.good : ""}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/50">{tx(RULE[tradition])}</p>
        </div>
      )}

      {mode === "done" && (
        <div className="rise relative px-5 py-12 text-center sm:py-16">
          <p className="font-callig star-burst mx-auto inline-block text-[52px] leading-tight text-[rgb(var(--gold))] sm:text-[64px]" dir="rtl" lang="ar">ما شاء الله</p>
          <h3 className="font-display mx-auto mt-4 max-w-xl text-2xl leading-tight sm:text-3xl">{u.doneTitle}</h3>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/75">{u.doneText} {slips(miss, lang, u)}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Link href="/salah" className="btn-gold inline-flex h-12 items-center rounded-md px-5 text-sm font-bold">{u.toSalah} <span className="ms-1.5"><ArrowNext /></span></Link>
            <Link href="/surah/5?v=6" className="inline-flex h-12 items-center rounded-md border border-white/25 px-5 text-sm font-bold hover:border-white/50">{u.toVerse}</Link>
            <button onClick={() => startQuiz()} className={ghost}>{u.practise}</button>
          </div>
        </div>
      )}

      <div className="border-t border-white/10 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-4">
          <button onClick={() => setList((v) => !v)} aria-expanded={list} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
            <svg viewBox="0 0 12 12" className={`h-3 w-3 transition rtl:-scale-x-100 ${list ? "rotate-90 rtl:-rotate-90" : ""}`} aria-hidden><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {u.steps}
          </button>
          {(i > 0 || mode !== "learn") && <button onClick={() => goStep(0)} className="inline-flex min-h-10 items-center text-sm font-semibold text-white/60 hover:text-white">{u.restart}</button>}
        </div>
        {list && (
          <ol className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {steps.map((s, k) => (
              <li key={s.id}>
                <button onClick={() => goStep(k)} className={`flex min-h-10 w-full items-center gap-2 rounded px-2 py-1.5 text-start ${mode === "learn" && k === i ? "bg-white/15 font-bold" : "text-white/75 hover:bg-white/5"}`}>
                  <span className="min-w-0 flex-1">{k + 1}. {tx(s.title)}</span>
                  <span className={`shrink-0 text-[11px] ${s.kind === "fard" ? "text-[rgb(var(--gold))]" : "text-white/40"}`}>{kindLabel(s).split(" · ")[0]}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-3 text-xs leading-relaxed text-white/60">{tx(RULE[tradition])}</p>
        <p className="mt-2 text-xs leading-relaxed text-white/50">{u.note}</p>
      </div>
    </div>
  );
}
