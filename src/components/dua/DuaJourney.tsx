"use client";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NAMES, PLAN } from "@/lib/duaGenerator";
import { SUNNAH_DUAS, type SunnahDua } from "@/lib/sunnahDuas";
import { SUNNAH_DUAS_2 } from "@/lib/sunnahDuas2";
import {
  ARABIC_SCRIPT, DIRECTIONS, DIRECTION_AR, DUA_AI_CONSENT_KEY, DUA_AI_CONSENT_VERSION, DUA_LANGS, LANTERN, LEAF_PATH, LENGTHS, MY_DUAS_KEY, MY_DUAS_MAX, NICHE_INNER, NICHE_LEN, NICHE_PATH,
  OCCASIONS, QUESTION_STEPS, REVEAL, REVEAL_TREE, WHO_J, anchorsFor, dawnOf, directionFor, isDuaLang, splitLines, topicFor,
  type Direction, type DuaLength, type Occasion, type SavedDua, type Step, type WhoJ,
} from "@/lib/duaJourney";
import { readJSON, storageVersion, subscribeStorage, writeJSON } from "@/lib/storage";
import { useConfig } from "@/lib/config";
import { journeySky } from "@/lib/learn/garden/sky";
import { JourneyStage } from "@/components/learn/garden/Landscape";
import { TreeArt } from "@/components/learn/garden/Tree";
import { GardenStyles, useReducedMotion } from "@/components/learn/garden/Scene";
import { GoldButton, OutlineButton } from "@/components/learn/ui";
import { drawDuaImage, type DuaImageFormat } from "./duaImage";

// The personal dua journey on the website (app: mobile/src/features/duaJourney, the same steps, texts and scene):
// gentle questions on the landscape that dawns with each answer, the reveal (niche, lantern, gathering light, the tree,
// leaves, the word دعاء in calligraphy, the lines one by one), then the card to keep, share as an image and save on this
// device. Free on the website: the prepared request always, the AI personal words within the existing limits
// (visitors: duaAiAnonPerDay; members with a confirmed address: 30 a day).
const ALL_SUNNAH: SunnahDua[] = [...SUNNAH_DUAS, ...SUNNAH_DUAS_2];
type QuranDua = { key: string; ar: string; tr: string };
type Result = { personal: string; arabic: string | null; ai: boolean; note?: string };
const GOLD = "rgb(214 180 108)";
const plainTr = (s: string) => s.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "");

const CSS = `
.dj-glass{background:rgba(6,30,23,.55);-webkit-backdrop-filter:blur(18px) saturate(1.4);backdrop-filter:blur(18px) saturate(1.4);border:1px solid rgba(214,180,108,.35)}
.dj-opt{border:1px solid rgba(214,180,108,.22);background:rgba(6,30,23,.62);transition:transform .15s,background .15s,border-color .15s}
.dj-opt:hover{border-color:rgba(214,180,108,.6);background:rgba(255,255,255,.06)}.dj-opt:active{transform:scale(.985)}
.dj-opt[aria-pressed=true]{border-color:${GOLD};background:rgba(214,180,108,.14)}
.dj-draw{stroke-dasharray:${NICHE_LEN};stroke-dashoffset:${NICHE_LEN};animation:dj-draw ${REVEAL.niche}ms cubic-bezier(.65,0,.35,1) forwards}
.dj-draw2{stroke-dasharray:${NICHE_LEN};stroke-dashoffset:${NICHE_LEN};animation:dj-draw ${REVEAL.niche}ms cubic-bezier(.65,0,.35,1) 300ms forwards}
@keyframes dj-draw{to{stroke-dashoffset:0}}
.dj-halo{animation:dj-halo 2.6s ease-in-out ${REVEAL.niche * 0.6}ms infinite alternate;opacity:.15;transform:scale(.7)}
@keyframes dj-halo{from{opacity:.7;transform:scale(.95)}to{opacity:1;transform:scale(1.08)}}
.dj-mote{position:absolute;left:0;top:0;border-radius:99px;background:#ffe9b0;box-shadow:0 0 8px 2px rgba(255,210,122,.8);animation:dj-mote var(--t) cubic-bezier(.55,0,1,.45) var(--d) infinite;opacity:0}
@keyframes dj-mote{0%{opacity:0;transform:translate(var(--x0),var(--y0)) scale(1)}20%{opacity:1}85%{opacity:.9}100%{opacity:0;transform:translate(var(--x1),var(--y1)) scale(.5)}}
.dj-leaf{position:absolute;left:0;top:0;animation:dj-leaf var(--t) linear var(--d) infinite;opacity:0}
@keyframes dj-leaf{0%{opacity:0;transform:translate(var(--x),-20px) rotate(0)}10%{opacity:.9}50%{transform:translate(calc(var(--x) + 22px),calc(var(--h)*.5)) rotate(150deg)}85%{opacity:.8}100%{opacity:0;transform:translate(var(--x),var(--h)) rotate(300deg)}}
.dj-word{animation:dj-word 1.1s ease-out both}@keyframes dj-word{from{opacity:0;transform:scale(.9);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
.dj-line{animation:dj-line .8s ease-out both}@keyframes dj-line{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.dj-in{animation:dj-line .45s ease-out both}
@media (prefers-reduced-motion:reduce){.dj-draw,.dj-draw2{animation:none;stroke-dashoffset:0}.dj-halo,.dj-word,.dj-line,.dj-in{animation:none;opacity:1;transform:none}.dj-mote,.dj-leaf{display:none}}
`;

/** a stored value; the fallback until the page is mounted, so the server HTML and the first client render agree */
function useStoredWeb<T>(key: string, fallback: T): T {
  useSyncExternalStore(subscribeStorage, storageVersion, () => 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? readJSON<T>(key, fallback) : fallback;
}

export default function DuaJourney({ initialTopic }: { initialTopic?: string }) {
  const t = useTranslations("duagen");
  const uiLang = useLocale();
  const cfg = useConfig();
  const aiOn = !!(cfg.ai && cfg.features.duaAi);
  const reduce = useReducedMotion();
  const saved = useStoredWeb<SavedDua[]>(MY_DUAS_KEY, []);
  const consent = useStoredWeb<number>(DUA_AI_CONSENT_KEY, 0) >= DUA_AI_CONSENT_VERSION;

  const [step, setStep] = useState<Step>("intro");
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [who, setWho] = useState<WhoJ | null>(null);
  const [direction, setDirection] = useState<Direction | null>(directionFor(initialTopic));
  const [text, setText] = useState("");
  const [len, setLen] = useState<DuaLength | null>(null);
  const [lang, setLang] = useState(isDuaLang(uiLang) ? uiLang : "en");
  const [withAr, setWithAr] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [err, setErr] = useState("");
  const [askConsent, setAskConsent] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [quran, setQuran] = useState<QuranDua[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [imgBusy, setImgBusy] = useState<DuaImageFormat | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = box.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const topic = topicFor(direction ?? "heart", who ?? "me");
  const plan = PLAN[topic];
  const anchors = anchorsFor(topic);
  const names = plan.names.map((id) => NAMES[id]);
  const sunnah = plan.sunnah.map((id) => ALL_SUNNAH.find((d) => d.id === id)).filter(Boolean) as SunnahDua[];
  const anchorSunnah = sunnah.find((d) => d.id === anchors.sunnah) ?? null;
  const anchorQuran = quran?.find((q) => q.key === anchors.quran) ?? null;
  const needQuran = step === "ready" || step === "reveal" || step === "card";
  useEffect(() => {
    if (!needQuran) return;
    let live = true;
    setQuran(null);
    fetch(`/api/dua-generator?topic=${topic}&locale=${uiLang}`).then((r) => r.json()).then((d) => { if (live) setQuran(d.quran ?? []); }).catch(() => { if (live) setQuran([]); });
    return () => { live = false; };
  }, [topic, uiLang, needQuran]);

  const qIndex = QUESTION_STEPS.indexOf(step);
  const go = (s: Step) => { setErr(""); setStep(s); };
  const next = () => go(qIndex >= 0 && qIndex < QUESTION_STEPS.length - 1 ? QUESTION_STEPS[qIndex + 1] : "ready");
  const back = () => { go(step === "ready" ? "language" : step === "card" ? "ready" : qIndex > 0 ? QUESTION_STEPS[qIndex - 1] : "intro"); };
  const pick = <V,>(set: (v: V) => void, v: V) => () => { set(v); window.setTimeout(() => go(qIndex < QUESTION_STEPS.length - 1 ? QUESTION_STEPS[qIndex + 1] : "ready"), 240); };

  const template = useCallback(() => [text.trim() ? t("ownWords", { text: text.trim() }) : "", t(`req_${topic}`)].filter(Boolean).join(" "), [text, topic, t]);
  const free = (note?: string) => { setSavedId(null); setResult({ personal: template(), arabic: null, ai: false, note }); setWaiting(false); go("reveal"); };
  const compose = async () => {
    if (!consent) { setAskConsent(true); return; }
    setSavedId(null); setResult(null); setWaiting(true); go("reveal");
    const r = await fetch("/api/dua-generator", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ v: 2, occasion, who: who ?? "me", direction: direction ?? "heart", text: text.trim(), length: len ?? "medium", lang, arabic: withAr && !ARABIC_SCRIPT.has(lang), locale: uiLang, names: plan.names }) }).catch(() => null);
    const d = r ? ((await r.json().catch(() => ({}))) as { text?: string; arabic?: string | null }) : {};
    if (r?.ok && d.text) setResult({ personal: d.text, arabic: d.arabic ?? null, ai: true });
    else if (r?.status === 422) { setWaiting(false); setErr(t("j_refused")); setStep("situation"); return; }
    else setResult({ personal: template(), arabic: null, ai: false, note: r?.status === 401 || r?.status === 403 ? t("aiLogin") : r?.status === 429 ? t("aiLimit") : r?.status === 503 ? t("j_aiOff") : t("j_aiFailed") });
    setWaiting(false);
  };

  const view = result ? {
    kicker: `${t("j_kicker")} · ${t(`d_${direction ?? "heart"}`)}`,
    names: names.map((n) => n.voc).join("، "),
    namesTr: uiLang === "ar" ? "" : names.map((n) => t(`n_${n.id}`)).join(" · "),
    label: result.ai ? t("j_personalAi") : t("j_personal"),
    forWho: who && who !== "me" ? t("forWho", { who: t(`wf_${who}`) }) : null,
    disclosure: result.ai ? t("j_disclosure") : t("j_disclosureFree"),
  } : null;
  const save = () => {
    if (!result) return;
    const item: SavedDua = { id: `d${Date.now()}`, at: Date.now(), direction: direction ?? "heart", topic, who: who ?? "me", lang, personal: result.personal, arabic: result.arabic ?? undefined, ai: result.ai, quran: anchors.quran, sunnah: anchors.sunnah, names: plan.names };
    writeJSON(MY_DUAS_KEY, [item, ...saved].slice(0, MY_DUAS_MAX), true);
    setSavedId(item.id);
  };
  const plain = () => view && result ? [view.names, anchorQuran ? `${anchorQuran.ar}\n(${t("j_quranRef", { ref: anchorQuran.key })})` : "", result.personal, result.arabic ?? "", view.forWho ?? "", `— ${view.disclosure}`, "quranmasterclass.com"].filter(Boolean).join("\n\n") : "";
  const copy = async () => { try { await navigator.clipboard.writeText(plain()); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* not allowed */ } };
  const shareImage = async (f: DuaImageFormat) => {
    if (!view || !result) return;
    setImgBusy(f);
    try {
      const blob = await drawDuaImage({ kicker: view.kicker, names: view.names, quranAr: anchorQuran?.ar ?? null, quranRef: anchorQuran ? t("j_quranRef", { ref: anchorQuran.key }) : null, label: view.label, personal: result.personal, arabic: result.arabic, forWho: view.forWho, disclosure: view.disclosure, footer: "quranmasterclass.com", lang, uiLang }, f);
      if (!blob) return;
      const file = new File([blob], `dua-${f}.png`, { type: "image/png" });
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: t("j_kicker") });
      else { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = file.name; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 4000); }
    } catch { /* cancelled */ } finally { setImgBusy(null); }
  };
  const openSaved = (d: SavedDua) => { setDirection(d.direction); setWho(d.who); setLang(d.lang); setResult({ personal: d.personal, arabic: d.arabic ?? null, ai: d.ai }); setSavedId(d.id); go("card"); };
  const reset = () => { setOccasion(null); setWho(null); setDirection(null); setText(""); setLen(null); setWithAr(false); setResult(null); setSavedId(null); go("why"); };
  const onRevealDone = useCallback(() => setStep("card"), []);

  const progress = step === "reveal" ? (result && !waiting ? 1 : 0.02) : dawnOf(step);
  const horizon = step === "intro" ? 0.42 : step === "reveal" || step === "card" ? 0.26 : 0.32;
  const kicker = "text-[11.5px] font-semibold uppercase tracking-[0.2em]";
  const title = (s: string, lead?: string) => (
    <div className="mb-5">
      <h2 className="font-display text-[28px] leading-tight text-white sm:text-[32px]">{s}</h2>
      {lead ? <p className="mt-2 text-[15px] leading-relaxed text-white/75">{lead}</p> : null}
    </div>
  );
  const opt = (key: string, on: boolean, label: string, onClick: () => void, desc?: string, ar?: string) => (
    <button key={key} type="button" aria-pressed={on} onClick={onClick} className="dj-opt flex min-h-14 w-full items-center gap-3 rounded-[10px] px-4 py-3 text-start">
      <span className="flex-1"><span className="block text-[16px] font-semibold text-white">{label}</span>{desc ? <span className="mt-0.5 block text-[13px] text-white/60">{desc}</span> : null}</span>
      {ar ? <span lang="ar" className="font-arabic text-[19px]" style={{ color: on ? GOLD : "rgba(214,180,108,.7)" }}>{ar}</span> : null}
    </button>
  );
  const pill = (key: string, on: boolean, label: string, onClick: () => void) => (
    <button key={key} type="button" aria-pressed={on} onClick={onClick} className="dj-opt h-11 rounded-full px-4 text-[15px] font-semibold text-white">{label}</button>
  );

  return (
    <section ref={box} className="stage relative min-h-[780px] scroll-mt-16 overflow-hidden text-white sm:min-h-[840px]" aria-live="polite">
      <GardenStyles />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {size.w ? <JourneyStage width={size.w} height={size.h} progress={progress} sky={journeySky(progress)} horizon={horizon} veil={step === "reveal" ? 0.75 : 0.55} still={reduce} /> : null}
      <div className="relative mx-auto flex min-h-[780px] max-w-xl flex-col px-5 pb-12 pt-6 sm:min-h-[840px]">
        {step !== "reveal" && step !== "intro" ? (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <button type="button" onClick={back} aria-label={t("j_back")} className="dj-glass grid h-10 w-10 place-items-center rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" className="rtl:rotate-180" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <p className={kicker} style={{ color: GOLD }}>{qIndex >= 0 ? `${t("j_kicker")} · ${t("j_step", { n: qIndex + 1, total: QUESTION_STEPS.length })}` : t("j_kicker")}</p>
              <span className="w-10" />
            </div>
            {qIndex >= 0 ? <div className="mt-3 h-[3px] overflow-hidden rounded bg-white/15" role="progressbar" aria-valuemin={0} aria-valuemax={QUESTION_STEPS.length} aria-valuenow={qIndex + 1}><div className="h-full rounded transition-all duration-500" style={{ width: `${((qIndex + 1) / QUESTION_STEPS.length) * 100}%`, background: GOLD }} /></div> : null}
          </div>
        ) : null}

        <div key={step} className="dj-in flex flex-1 flex-col">
          {step === "intro" ? (
            <div className="flex flex-1 flex-col justify-end pt-40 text-center">
              <p lang="ar" className="font-callig text-[64px] leading-[1.4]" style={{ color: GOLD, textShadow: "0 0 18px rgba(255,214,130,.45)" }}>دعاء</p>
              <p className={kicker} style={{ color: GOLD }}>{t("j_kicker")}</p>
              <h2 className="font-display mt-2 text-[34px] leading-tight sm:text-[40px]">{t("j_title")}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-white/75">{t("j_lead")}</p>
              <GoldButton className="mt-7 w-full" onClick={() => go("why")}>{t("j_begin")}</GoldButton>
              <p className="mt-3 text-[12px] leading-relaxed text-white/55">{aiOn ? t("j_disclosure") : t("j_disclosureFree")}</p>
              <div className="mt-9 text-start">
                <p className={kicker} style={{ color: GOLD }}>{t("j_saved")}{saved.length ? ` · ${saved.length}` : ""}</p>
                {saved.length === 0 ? <p className="mt-2 text-[13.5px] text-white/55">{t("j_savedEmpty")}</p> : (
                  <ul className="mt-3 grid gap-2">
                    {saved.slice(0, 12).map((d) => (
                      <li key={d.id} className="dj-opt flex items-center gap-3 rounded-xl p-3.5">
                        <button type="button" onClick={() => openSaved(d)} className="flex flex-1 items-center gap-3 text-start">
                          <span lang="ar" className="font-arabic w-16 text-center text-[20px]" style={{ color: GOLD }}>{DIRECTION_AR[d.direction]}</span>
                          <span className="flex-1"><span className="block text-[14.5px] font-semibold">{t(`d_${d.direction}`)}</span><span className="line-clamp-2 text-[13px] text-white/60">{d.personal}</span></span>
                        </button>
                        <button type="button" aria-label={t("j_remove")} onClick={() => writeJSON(MY_DUAS_KEY, saved.filter((x) => x.id !== d.id), true)} className="text-white/50 hover:text-white">×</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}

          {step === "why" ? <>{title(t("q_why"), t("q_whyLead"))}<div className="grid gap-2">{OCCASIONS.map((o) => opt(o, occasion === o, t(`o_${o}`), pick(setOccasion, o)))}</div></> : null}
          {step === "who" ? <>{title(t("q_who"))}<div className="flex flex-wrap gap-2">{WHO_J.map((w) => pill(w, who === w, t(`w_${w}`), pick(setWho, w)))}</div></> : null}
          {step === "direction" ? (
            <>{title(t("q_dir"), t("q_dirLead"))}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DIRECTIONS.map((d) => (
                  <button key={d} type="button" aria-pressed={direction === d} onClick={pick(setDirection, d)} className="dj-opt flex min-h-[92px] flex-col justify-between rounded-xl p-3 text-start">
                    <span lang="ar" dir="rtl" className="font-arabic block text-end text-[22px] leading-snug" style={{ color: direction === d ? GOLD : "rgba(214,180,108,.75)" }}>{DIRECTION_AR[d]}</span>
                    <span className="text-[14.5px] font-semibold leading-snug">{t(`d_${d}`)}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
          {step === "situation" ? (
            <>{title(t("q_sit"), t("q_sitLead"))}
              {err ? <p className="mb-3 text-[14px] leading-relaxed text-[#f3d48e]">{err}</p> : null}
              <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 300))} maxLength={300} rows={5} placeholder={t("placeholder")} aria-label={t("q_sit")} className="dj-glass w-full resize-none rounded-xl p-4 text-[17px] leading-relaxed text-white placeholder:text-white/45 focus:outline-none" />
              <p className="mt-2 text-end text-xs text-white/55">{text.length}/300</p>
              <GoldButton className="mt-5 w-full" onClick={next}>{text.trim() ? t("j_next") : t("j_skip")}</GoldButton>
            </>
          ) : null}
          {step === "length" ? <>{title(t("q_len"))}<div className="grid gap-2">{LENGTHS.map((l) => opt(l, len === l, t(`l_${l}`), pick(setLen, l), t(`l_${l}D`)))}</div></> : null}
          {step === "language" ? (
            <>{title(t("q_lang"), t("q_langLead"))}
              <div className="flex flex-wrap gap-2">{DUA_LANGS.map(([c, n]) => pill(c, lang === c, n, () => setLang(c)))}</div>
              {!ARABIC_SCRIPT.has(lang) ? (
                <button type="button" role="switch" aria-checked={withAr} onClick={() => setWithAr(!withAr)} className="dj-opt mt-5 flex items-center gap-3 rounded-xl p-4 text-start">
                  <span className="flex-1"><span className="block text-[15.5px] font-semibold">{t("j_alsoAr")}</span><span className="mt-0.5 block text-[13px] text-white/60">{t("j_alsoArD")}</span></span>
                  <span className="flex h-7 w-[46px] rounded-full p-[3px] transition" style={{ background: withAr ? GOLD : "rgba(255,255,255,.18)", justifyContent: withAr ? "flex-end" : "flex-start" }}><span className="h-[22px] w-[22px] rounded-full bg-white" /></span>
                </button>
              ) : null}
              <GoldButton className="mt-6 w-full" onClick={next}>{t("j_next")}</GoldButton>
            </>
          ) : null}

          {step === "ready" ? (
            <>{title(t("j_ready"), t("j_readyLead"))}
              <div className="dj-glass grid gap-3.5 rounded-[18px] p-5">
                <p lang="ar" dir="rtl" className="font-callig text-center text-[28px] leading-snug" style={{ color: GOLD }}>{names.map((n) => n.voc).join("، ")}</p>
                <Anchor ar={anchorQuran?.ar ?? null} label={t("j_quranRef", { ref: anchors.quran })} />
                {anchorSunnah ? <Anchor ar={anchorSunnah.ar} label={anchorSunnah.src} /> : null}
                <hr className="border-[rgba(214,180,108,.25)]" />
                <p className={kicker} style={{ color: GOLD }}>{t("j_answers")}</p>
                {([
                  [t("q_why"), occasion ? t(`o_${occasion}`) : "–", "why"],
                  [t("q_who"), t(`w_${who ?? "me"}`), "who"],
                  [t("q_dir"), t(`d_${direction ?? "heart"}`), "direction"],
                  [t("q_len"), t(`l_${len ?? "medium"}`), "length"],
                  [t("q_lang"), `${DUA_LANGS.find(([c]) => c === lang)?.[1] ?? lang}${withAr && !ARABIC_SCRIPT.has(lang) ? ` · ${t("j_alsoAr")}` : ""}`, "language"],
                ] as const).map(([q, a, s]) => (
                  <button key={s} type="button" onClick={() => go(s as Step)} className="flex items-center gap-2.5 text-start">
                    <span className="flex-1 truncate text-[13.5px] text-white/60">{q}</span><span className="max-w-[55%] truncate text-[14px] font-semibold">{a}</span><span aria-hidden className="text-white/50">›</span>
                  </button>
                ))}
              </div>
              {err ? <p className="mt-4 text-[14px] text-[#f3d48e]">{err}</p> : null}
              <div className="mt-6 grid gap-3">
                {aiOn ? <GoldButton className="w-full" onClick={() => void compose()}>{t("j_compose")}</GoldButton> : <p className="text-[13.5px] text-white/60">{t("j_aiOff")}</p>}
                <OutlineButton dark className="w-full" onClick={() => free()}>{t("j_free")}</OutlineButton>
                <p className="text-center text-[12.5px] text-white/55">{t("j_freeD")}</p>
              </div>
            </>
          ) : null}

          {step === "reveal" ? <Reveal lines={result && !waiting ? result.personal : null} arabic={result?.arabic ?? null} still={reduce} phrases={[t("j_r1"), t("j_r2"), t("j_r3")]} continueLabel={t("j_next")} onDone={onRevealDone} /> : null}

          {step === "card" && view && result ? (
            <>
              {result.note ? <p className="mb-4 text-[14px] leading-relaxed text-[#f3d48e]">{result.note}</p> : null}
              <article className="dj-in relative overflow-hidden rounded-[22px] border border-[rgba(214,180,108,.4)] px-6 pb-7 pt-11 text-center" style={{ background: "linear-gradient(180deg,#06231a,#0a3a2b 55%,#041510)" }}>
                <svg aria-hidden viewBox="0 0 300 360" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-[3%] bottom-0 top-2.5 h-[calc(100%-10px)] w-[94%] opacity-55"><path d={NICHE_PATH} stroke="rgba(214,180,108,.55)" strokeWidth="1.4" fill="none" /><path d={NICHE_INNER} stroke="rgba(214,180,108,.22)" fill="none" /></svg>
                <div className="relative grid gap-3.5">
                  <p className={kicker} style={{ color: GOLD }}>{view.kicker}</p>
                  <p lang="ar" dir="rtl" className="font-callig text-[30px] leading-[1.6]" style={{ color: GOLD }}>{view.names}</p>
                  {view.namesTr ? <p className="-mt-2 text-[13px] text-white/60">{view.namesTr}</p> : null}
                  {anchorQuran ? (
                    <div className="grid gap-1">
                      <p lang="ar" dir="rtl" className="font-arabic text-[21px] leading-[1.9]">{anchorQuran.ar}</p>
                      {anchorQuran.tr && uiLang !== "ar" ? <p className="text-[13.5px] leading-relaxed text-white/75">{plainTr(anchorQuran.tr)}</p> : null}
                      <Link href={`/surah/${anchorQuran.key.split(":")[0]}?v=${anchorQuran.key.split(":")[1]}`} className="text-[11.5px] font-semibold" style={{ color: "rgba(214,180,108,.9)" }}>{t("j_quranRef", { ref: anchorQuran.key })}</Link>
                    </div>
                  ) : null}
                  <div className="grid gap-2 rounded-2xl border border-[rgba(214,180,108,.35)] bg-white/[0.05] px-5 py-4">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: GOLD }}>{view.label}</p>
                    <p className="text-[16.5px] leading-relaxed text-[#f6ead0]" lang={lang} dir={ARABIC_SCRIPT.has(lang) ? "rtl" : "ltr"}>{result.personal}</p>
                    {view.forWho ? <p className="text-[14px] text-white/75">{view.forWho}</p> : null}
                    {result.arabic ? (<><hr className="my-1 border-[rgba(214,180,108,.25)]" /><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(214,180,108,.8)]">{t("j_personalAr")}</p><p lang="ar" dir="rtl" className="font-arabic text-[19px] leading-[1.9] text-[#f3e2b6]">{result.arabic}</p></>) : null}
                  </div>
                  {anchorSunnah ? (
                    <div className="grid gap-1">
                      <p lang="ar" dir="rtl" className="font-arabic text-[20px] leading-[1.9]">{anchorSunnah.ar}</p>
                      {uiLang !== "ar" ? <p className="text-[13.5px] leading-relaxed text-white/75">{uiLang === "de" ? anchorSunnah.de : anchorSunnah.en}</p> : null}
                      <p className="text-[11.5px] font-semibold" style={{ color: "rgba(214,180,108,.85)" }}>{anchorSunnah.src}</p>
                    </div>
                  ) : null}
                  <p className="mx-auto max-w-md text-[11.5px] leading-relaxed text-white/60">{view.disclosure}</p>
                </div>
              </article>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <OutlineButton dark onClick={save} disabled={!!savedId}>{savedId ? t("j_savedOk") : t("j_save")}</OutlineButton>
                <OutlineButton dark onClick={copy}>{copied ? t("copied") : t("copy")}</OutlineButton>
                <GoldButton onClick={() => void shareImage("story")} disabled={!!imgBusy}>{t("j_share")} · 9:16</GoldButton>
                <GoldButton onClick={() => void shareImage("post")} disabled={!!imgBusy}>{t("j_share")} · 4:5</GoldButton>
              </div>
              <Authentic t={t} quran={quran} sunnah={sunnah} uiLang={uiLang} names={names} />
              <OutlineButton dark className="mt-8 w-full" onClick={reset}>{t("j_new")}</OutlineButton>
            </>
          ) : null}
        </div>
      </div>

      {askConsent ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(2,12,9,.6)] p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="dj-consent">
          <div className="dj-glass dj-in grid w-full max-w-md gap-3.5 rounded-[26px] p-6" style={{ background: "rgba(4,32,24,.88)" }}>
            <h3 id="dj-consent" className="font-display text-[22px] leading-tight">{t("j_consentTitle")}</h3>
            <p className="text-[15px] leading-relaxed text-white/80">{t("j_consent")}</p>
            <GoldButton className="w-full" onClick={() => { writeJSON(DUA_AI_CONSENT_KEY, DUA_AI_CONSENT_VERSION, true); setAskConsent(false); }}>{t("j_consentOk")}</GoldButton>
            <OutlineButton dark className="w-full" onClick={() => setAskConsent(false)}>{t("j_back")}</OutlineButton>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Anchor({ ar, label }: { ar: string | null; label: string }) {
  return (
    <div className="grid justify-items-center gap-1 text-center">
      {ar ? <p lang="ar" dir="rtl" className="font-arabic line-clamp-3 text-[19px] leading-[1.9]">{ar}</p> : <span className="h-8 w-40 animate-pulse rounded bg-white/10" />}
      <p className="text-[12px] font-semibold" style={{ color: "rgba(214,180,108,.9)" }}>{label}</p>
    </div>
  );
}

/** the reveal: niche, lantern, gathering light, the tree, leaves, the word and the lines (app: Reveal.tsx) */
function Reveal({ lines, arabic, still, phrases, continueLabel, onDone }: { lines: string | null; arabic: string | null; still: boolean; phrases: [string, string, string]; continueLabel: string; onDone: () => void }) {
  const [t0] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const done = useRef(false);
  useEffect(() => { const id = window.setInterval(() => setElapsed(Date.now() - t0), 200); return () => window.clearInterval(id); }, [t0]);
  const ready = lines !== null && (still || elapsed >= REVEAL.word);
  const parts = useMemo(() => (lines ? splitLines(lines) : []), [lines]);
  const [wordAt, setWordAt] = useState(0);
  useEffect(() => { if (ready && !wordAt) setWordAt(Date.now()); }, [ready, wordAt]);
  useEffect(() => {
    if (!ready || !wordAt || done.current) return;
    const end = wordAt + 900 + parts.length * REVEAL.line + 1600;
    const wait = Math.max(still ? 400 : 0, end - Date.now(), REVEAL.min - (Date.now() - t0)) + (still ? 0 : 1800);
    const id = window.setTimeout(() => { if (!done.current) { done.current = true; onDone(); } }, wait);
    return () => window.clearTimeout(id);
  }, [ready, wordAt, parts.length, still, t0, onDone]);
  const stage = still ? REVEAL_TREE[REVEAL_TREE.length - 1] : REVEAL_TREE[Math.min(REVEAL_TREE.length - 1, Math.max(0, Math.floor(((elapsed - REVEAL.niche) / (REVEAL.tree - REVEAL.niche)) * REVEAL_TREE.length)))];
  const phrase = phrases[Math.floor(elapsed / 2200) % 3];
  const S = 320, k = S / 300, lx = LANTERN.cx * k, ly = LANTERN.cy * k;
  return (
    <div className="flex flex-col items-center pt-6">
      <div className="relative" style={{ width: S, height: 360 * k }} aria-label={ready ? "دعاء" : phrase} role="img">
        <div className="dj-halo pointer-events-none absolute rounded-full" style={{ left: lx - S * 0.55, top: ly - S * 0.55, width: S * 1.1, height: S * 1.1, background: "radial-gradient(circle, rgba(255,230,168,.85) 0%, rgba(243,200,106,.35) 25%, rgba(243,200,106,0) 70%)" }} />
        <svg viewBox="0 0 300 360" width={S} height={360 * k} className="absolute inset-0" aria-hidden>
          <path d={NICHE_PATH} stroke={GOLD} strokeWidth="2" fill="none" strokeLinecap="round" className="dj-draw" />
          <path d={NICHE_INNER} stroke="rgba(214,180,108,.45)" fill="none" className="dj-draw2" />
          <path d={LANTERN.chain} stroke="rgba(214,180,108,.7)" strokeWidth="1.2" />
          <path d={LANTERN.cap} fill="#c9a65e" />
          <path d={LANTERN.body} fill="rgba(255,226,150,.28)" stroke="#d6b46c" strokeWidth="1.4" />
          <circle cx={LANTERN.cx} cy={LANTERN.cy} r="7" fill="#fff1c4" opacity=".95" />
          <path d={LANTERN.base} fill="#c9a65e" />
        </svg>
        <div className="pointer-events-none absolute bottom-0" style={{ left: S * 0.18, width: S * 0.64 }}><TreeArt id="dua-reveal" type="olive" stage={stage} size={S * 0.64} still={still} /></div>
        {!still ? Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + (i % 3) * 0.4, r = S * (0.5 + (i % 4) * 0.08), s = 3 + (i % 3);
          const st = { width: s, height: s, "--x0": `${lx + Math.cos(a) * r}px`, "--y0": `${ly + Math.sin(a) * r * 0.9 + S * 0.2}px`, "--x1": `${lx}px`, "--y1": `${ly}px`, "--t": `${2200 + (i % 5) * 320}ms`, "--d": `${300 + i * 230}ms` } as CSSProperties;
          return <span key={i} className="dj-mote" style={st} />;
        }) : null}
        {!still ? Array.from({ length: 6 }, (_, i) => {
          const st = { "--x": `${(((i * 47 + 13) % 80) / 100 + 0.1) * S}px`, "--h": `${S * 1.2}px`, "--t": `${6200 + (i % 3) * 1400}ms`, "--d": `${REVEAL.niche + i * 900}ms` } as CSSProperties;
          return <svg key={i} className="dj-leaf" style={st} width="20" height="10" viewBox="-1 -5 20 10" aria-hidden><path d={LEAF_PATH} fill={i % 2 ? "#d6b46c" : "#7fb48a"} opacity=".85" /></svg>;
        }) : null}
      </div>
      {ready ? (
        <>
          <p lang="ar" className="dj-word font-callig -mt-2 text-[54px] leading-[1.5]" style={{ color: GOLD, textShadow: "0 0 18px rgba(255,214,130,.6)" }}>دعاء</p>
          <div className="grid max-w-lg gap-1.5 px-2 text-center">
            {parts.map((l, i) => <p key={i} className="dj-line text-[18px] leading-relaxed text-[#f6ead0]" style={{ animationDelay: `${900 + i * REVEAL.line}ms` }}>{l}</p>)}
            {arabic ? <p lang="ar" dir="rtl" className="dj-line font-arabic mt-2 text-[22px] leading-[1.9] text-[#f3e2b6]" style={{ animationDelay: `${900 + parts.length * REVEAL.line}ms` }}>{arabic}</p> : null}
            <button type="button" onClick={() => { if (!done.current) { done.current = true; onDone(); } }} className="mx-auto mt-4 px-4 py-2 text-[14px] font-semibold" style={{ color: GOLD }}>{continueLabel}</button>
          </div>
        </>
      ) : <p key={phrase} className="dj-line mt-5 min-h-11 text-center text-[15px] text-white/75">{phrase}</p>}
    </div>
  );
}

type T = ReturnType<typeof useTranslations<"duagen">>;
function Authentic({ t, quran, sunnah, uiLang, names }: { t: T; quran: QuranDua[] | null; sunnah: SunnahDua[]; uiLang: string; names: { id: string; ar: string }[] }) {
  const ar = uiLang === "ar";
  const card = (k: string, c: ReactNode) => <li key={k} className="rounded-xl border border-[rgba(214,180,108,.22)] bg-[rgba(6,30,23,.72)] p-4">{c}</li>;
  return (
    <div className="mt-10">
      <h3 className="font-display text-[24px]">{t("j_authentic")}</h3>
      <ul className="mt-3 grid gap-2.5">
        {(quran ?? []).map((q) => card(q.key, <>
          <p lang="ar" dir="rtl" className="font-arabic text-[21px] leading-[2]">{q.ar}</p>
          {q.tr && !ar ? <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/75">{plainTr(q.tr)}</p> : null}
          <Link href={`/surah/${q.key.split(":")[0]}?v=${q.key.split(":")[1]}`} className="mt-2.5 inline-flex text-[13px] font-semibold" style={{ color: GOLD }}>{t("quranRef", { ref: q.key })}</Link>
        </>))}
        {sunnah.map((d) => card(d.id, <>
          <p lang="ar" dir="rtl" className="font-arabic text-[20px] leading-[2]">{d.ar}</p>
          {!ar ? <p className="mt-1.5 text-[13.5px] italic leading-relaxed" style={{ color: GOLD }}>{d.tr}</p> : null}
          {!ar ? <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/75">{uiLang === "de" ? d.de : d.en}</p> : null}
          <p className="mt-2.5 text-xs font-semibold text-white/55">{d.src}{d.n ? ` · ${d.n}×` : ""}</p>
        </>))}
      </ul>
      <h3 className="font-display mt-8 text-[24px]">{t("j_namesTitle")}</h3>
      <ul className="mt-3 grid gap-2.5 sm:grid-cols-3">
        {names.map((n) => card(n.id, <div className="text-center">
          <p lang="ar" dir="rtl" className="font-callig text-[32px] leading-snug" style={{ color: GOLD }}>{n.ar}</p>
          {!ar ? <p className="mt-1 text-[14px] font-semibold">{t(`n_${n.id}`)}</p> : null}
          <p className="mt-1 text-[13px] leading-relaxed text-white/60">{t(`nd_${n.id}`)}</p>
        </div>))}
      </ul>
    </div>
  );
}
