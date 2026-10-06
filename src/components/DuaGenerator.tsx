"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FRAME, NAMES, PLAN, TOPICS, WHO, guessTopic, type Topic, type Who } from "@/lib/duaGenerator";
import { SUNNAH_DUAS, type SunnahDua } from "@/lib/sunnahDuas";
import { SUNNAH_DUAS_2 } from "@/lib/sunnahDuas2";
import { Rosette } from "./Ornaments";
import { useConfig } from "@/lib/config";
import DonateCTA from "./DonateCTA";

type QuranDua = { key: string; ar: string; tr: string };
const ALL_SUNNAH: SunnahDua[] = [...SUNNAH_DUAS, ...SUNNAH_DUAS_2];

// Builds a personal dua (praise, blessings on the Prophet ﷺ, the fitting names of Allah, the request, closing)
// and shows the authentic duas of the Quran and the Sunnah for the same concern.
export default function DuaGenerator() {
  const t = useTranslations("duagen");
  const locale = useLocale();
  const ar = locale === "ar";
  const [topic, setTopic] = useState<Topic | null>(null);
  const [text, setText] = useState("");
  const [who, setWho] = useState<Who>("me");
  const [made, setMade] = useState<{ topic: Topic; text: string; who: Who; key: number } | null>(null);
  const [quran, setQuran] = useState<QuranDua[] | null>(null);
  const cfg = useConfig();
  const aiOn = cfg.ai && cfg.features.duaAi;
  const [ai, setAi] = useState<{ state: "idle" | "busy" | "err"; text: string; err?: string }>({ state: "idle", text: "" });
  const [copied, setCopied] = useState(false);
  const result = useRef<HTMLDivElement>(null);

  const guessed = useMemo(() => (text.trim().length > 2 ? guessTopic(text) : null), [text]);
  const chosen = topic ?? guessed;

  const make = () => {
    const tp = chosen ?? "heart";
    setMade({ topic: tp, text: text.trim().slice(0, 300), who, key: Date.now() });
    setAi({ state: "idle", text: "" });
    setQuran(null);
    fetch(`/api/dua-generator?topic=${tp}&locale=${locale}`).then((r) => r.json()).then((d) => setQuran(d.quran ?? [])).catch(() => setQuran([]));
    requestAnimationFrame(() => requestAnimationFrame(() => result.current?.scrollIntoView({ behavior: "smooth", block: "start" })));
  };

  const plan = made ? PLAN[made.topic] : null;
  const names = plan ? plan.names.map((id) => NAMES[id]) : [];
  // the learner's own words come first, then the dua phrased for the concern
  const request = made ? (ai.text || [made.text ? t("ownWords", { text: made.text }) : "", t(`req_${made.topic}`)].filter(Boolean).join("\n\n")) : "";
  const sunnah = plan ? plan.sunnah.map((id) => ALL_SUNNAH.find((d) => d.id === id)).filter(Boolean) as SunnahDua[] : [];

  const refine = async () => {
    if (!made) return;
    setAi({ state: "busy", text: "" });
    const r = await fetch("/api/dua-generator", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: made.text, topic: made.topic, who: made.who, locale, names: names.map((n) => n.id) }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok && d.text) setAi({ state: "idle", text: d.text });
    else setAi({ state: "err", text: "", err: r?.status === 401 ? t("aiLogin") : r?.status === 429 ? t("aiLimit") : t("aiError") });
  };

  const plain = () => made ? [
    FRAME.praise, ar ? "" : t("praiseTr"), "", FRAME.salawat, ar ? "" : t("salawatTr"), "",
    names.map((n) => n.voc).join("، "), "", request, made.who !== "me" ? t("forWho", { who: t(`wf_${made.who}`) }) : "", "",
    FRAME.close, ar ? "" : t("closeTr"), FRAME.end, "", "quranmasterclass.com",
  ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n") : "";
  const copy = async () => { try { await navigator.clipboard.writeText(plain()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* not allowed */ } };
  const share = async () => { try { if (navigator.share) await navigator.share({ title: t("title"), text: plain() }); else await copy(); } catch { /* cancelled */ } };

  const chip = (on: boolean) => `h-10 rounded-full border px-4 text-[14px] font-semibold transition ${on ? "border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15 text-ink shadow-[0_0_0_3px_rgb(201_166_94/0.12)]" : "border-line bg-surface text-muted hover:border-ink/30 hover:text-ink"}`;

  return (
    <div>
      {/* the request */}
      <section className="rounded-2xl border border-[rgb(201_166_94)]/30 bg-surface p-5 shadow-[0_10px_30px_rgba(3,25,18,0.06)] sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("step1")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((tp) => <button key={tp} type="button" aria-pressed={chosen === tp} onClick={() => setTopic(topic === tp ? null : tp)} className={chip(chosen === tp)}>{t(`t_${tp}`)}</button>)}
        </div>
        <label className="mt-6 grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("step2")}</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={300} rows={3} placeholder={t("placeholder")} className="w-full resize-none rounded-xl border border-line bg-bg px-4 py-3 text-[16px] leading-relaxed focus:border-[rgb(201_166_94)] focus:outline-none" />
          <span className="flex justify-between text-xs text-muted"><span>{guessed && !topic ? t("guessed", { topic: t(`t_${guessed}`) }) : t("anyLanguage")}</span><span>{text.length}/300</span></span>
        </label>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("step3")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {WHO.map((w) => <button key={w} type="button" aria-pressed={who === w} onClick={() => setWho(w)} className={chip(who === w)}>{t(`w_${w}`)}</button>)}
        </div>
        <button onClick={make} className="btn-gold mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold sm:w-auto sm:px-8">
          <Rosette size={20} className="!text-[rgb(8_38_29)]" />{t("make")}
        </button>
      </section>

      {made && plan && (
        <div ref={result} key={made.key} className="scroll-mt-20">
          {/* the personal dua */}
          <section className="stage step-in relative mt-8 overflow-hidden rounded-2xl px-5 py-9 text-center text-[#eef0f3] sm:px-12">
            <span aria-hidden className="illum-frame" />
            {["start-1.5 top-1.5", "end-1.5 top-1.5", "bottom-1.5 start-1.5", "bottom-1.5 end-1.5"].map((c) => <Rosette key={c} size={26} className={`absolute ${c}`} />)}
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("yourDua")} · {t(`t_${made.topic}`)}</p>
            <div className="relative mx-auto mt-6 grid max-w-2xl gap-5">
              <Line arText={FRAME.praise} tr={ar ? "" : t("praiseTr")} />
              <Line arText={FRAME.salawat} tr={ar ? "" : t("salawatTr")} />
              <div>
                <p className="font-callig text-[34px] leading-snug text-[rgb(var(--gold))]" dir="rtl" lang="ar">{names.map((n) => n.voc).join("، ")}</p>
                {!ar && <p className="mt-1 text-sm text-white/60">{names.map((n) => t(`n_${n.id}`)).join(" · ")}</p>}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-5">
                <p className={`whitespace-pre-line text-[18px] leading-relaxed text-white/90 ${ar ? "font-arabic text-[22px]" : ""}`} dir={ar ? "rtl" : undefined}>{request}</p>
                {made.who !== "me" && <p className="mt-2 text-[15px] text-white/70">{t("forWho", { who: t(`wf_${made.who}`) })}</p>}
                {ai.text && <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-white/40">{t("aiLabel")}</p>}
              </div>
              <Line arText={FRAME.close} tr={ar ? "" : t("closeTr")} small="2:201" />
              <p className="font-arabic text-[22px] text-[rgb(var(--gold))]" dir="rtl" lang="ar">{FRAME.end}</p>
            </div>
            <div className="relative mt-8 flex flex-wrap justify-center gap-2">
              <button onClick={copy} className="h-11 rounded-full border border-white/25 px-5 text-sm font-bold hover:border-white">{copied ? t("copied") : t("copy")}</button>
              <button onClick={share} className="h-11 rounded-full border border-white/25 px-5 text-sm font-bold hover:border-white">{t("share")}</button>
              {aiOn && <button onClick={refine} disabled={ai.state === "busy"} className="btn-gold h-11 rounded-full px-5 text-sm font-bold disabled:opacity-60">{ai.state === "busy" ? t("aiBusy") : t("aiRefine")}</button>}
            </div>
            {ai.err && <p className="relative mt-3 text-sm text-white/70">{ai.err}</p>}
            <p className="relative mx-auto mt-6 max-w-xl text-xs leading-relaxed text-white/50">{t("note")}</p>
          </section>

          {/* names */}
          <section className="mt-8 grid gap-3 sm:grid-cols-3">
            {names.map((n) => (
              <div key={n.id} className="relative overflow-hidden rounded-xl border border-line bg-surface p-5 text-center">
                <span aria-hidden className="niche !border-[rgb(201_166_94)]/25" />
                <p className="font-callig relative text-4xl leading-tight text-gold" dir="rtl" lang="ar">{n.ar}</p>
                {!ar && <p className="relative mt-2 text-sm font-semibold">{t(`n_${n.id}`)}</p>}
                <p className="relative mt-1 text-[13px] leading-relaxed text-muted">{t(`nd_${n.id}`)}</p>
              </div>
            ))}
          </section>

          {/* Quran */}
          <section className="mt-10">
            <h2 className="font-display text-3xl">{t("fromQuran")}</h2>
            {quran === null ? <div className="mt-5 h-40 animate-pulse rounded-xl bg-line/40" /> : (
              <ul className="mt-5 grid gap-3">
                {quran.map((q) => { const [s, v] = q.key.split(":"); return (
                  <li key={q.key} className="rounded-xl border border-line bg-surface p-5">
                    <p className="font-arabic text-[24px] leading-[2.1]" dir="rtl" lang="ar">{q.ar}</p>
                    {q.tr && <p className="mt-2 text-[15px] leading-relaxed text-muted">{q.tr.replace(/<[^>]+>/g, "")}</p>}
                    <Link href={`/surah/${s}?v=${v}`} className="mt-3 inline-flex text-sm font-semibold text-accent hover:underline">{t("quranRef", { ref: q.key })}</Link>
                  </li>
                ); })}
              </ul>
            )}
          </section>

          {/* Sunnah */}
          {sunnah.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-3xl">{t("fromSunnah")}</h2>
              <ul className="mt-5 grid gap-3">
                {sunnah.map((d) => (
                  <li key={d.id} className="rounded-xl border border-line bg-surface p-5">
                    <p className="font-arabic text-[22px] leading-[2.1]" dir="rtl" lang="ar">{d.ar}</p>
                    {!ar && <p className="mt-2 text-[14px] italic leading-relaxed text-gold">{d.tr}</p>}
                    {!ar && <p className="mt-2 text-[15px] leading-relaxed text-muted">{locale === "de" ? d.de : d.en}</p>}
                    <p className="mt-3 text-xs font-semibold text-muted">{d.src}{d.n ? ` · ${d.n}×` : ""}</p>
                  </li>
                ))}
              </ul>
              <Link href="/duas" className="mt-4 inline-flex text-sm font-semibold text-accent hover:underline">{t("allDuas")}</Link>
            </section>
          )}
          <DonateCTA variant="slim" className="mt-10" />
        </div>
      )}
    </div>
  );
}

function Line({ arText, tr, small }: { arText: string; tr: string; small?: string }) {
  return (
    <div>
      <p className="font-arabic text-[26px] leading-[1.9] text-white" dir="rtl" lang="ar">{arText}{small && <span className="ms-2 align-middle text-xs text-white/40">({small})</span>}</p>
      {tr && <p className="mt-1 text-sm text-white/60">{tr}</p>}
    </div>
  );
}
