"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CaptchaNotice } from "./CaptchaBox";
import { captchaKeys, captchaToken, renderCheckbox, warmCaptcha } from "@/lib/captchaClient";
import { COUNTRY_CODES } from "@/lib/countries";

// The contact forms (owner 22.10.2026): "suggestion" (/suggestions) and "reciter" (/reciters/apply); since 23.10.2026
// also "partner" (/partners, Blueprint Shams 4.0: partnership and investment inquiries; its texts come as props from
// src/lib/blueprint, the shared labels from "contactForms").
// The "I'm not a robot" checkbox is always shown before sending (when a v2 key exists); POST /api/contact.
const CATS = ["feature", "content", "bug", "other"] as const;
const WANTS = ["cooperation", "verify", "teach", "other"] as const;
export const PARTNER_TYPES = ["strategic", "bank", "media", "sponsor", "content", "foundation", "other"] as const;
export const PARTNER_TICKETS = ["none", "t1", "t2", "t3", "t4", "inkind"] as const;
/** countries shown first in the partner form (GCC, then the largest Muslim-majority markets) */
const PARTNER_FIRST = ["AE", "SA", "KW", "QA", "BH", "OM", "ID", "MY", "TR", "PK", "BD", "EG"];
export type PartnerTexts = {
  company: string; contact: string; email: string; country: string; countryPick: string; type: string;
  types: Record<(typeof PARTNER_TYPES)[number], string>; ticket: string; ticketHint: string;
  tickets: Record<(typeof PARTNER_TICKETS)[number], string>; message: string; messageHint: string; ack: string; sent: string;
};
type Kind = "suggestion" | "reciter" | "partner";

export default function ContactForm({ kind, partner }: { kind: Kind; partner?: PartnerTexts }) {
  const t = useTranslations("contactForms");
  const locale = useLocale();
  const rec = kind === "reciter";
  const par = kind === "partner" && partner ? partner : null;
  const [f, setF] = useState({ name: "", email: "", category: "feature", want: "cooperation", country: "", riwaya: "", ijazah: false, chain: "", message: "", website: "", company: "", ptype: "", ticket: "none" });
  const [ack, setAck] = useState(false);
  // partner form: GCC and the largest Muslim-majority markets first, then every country in the reader's language
  const countries = useMemo(() => {
    if (kind !== "partner") return [];
    let dn: Intl.DisplayNames | null = null;
    try { dn = new Intl.DisplayNames([locale], { type: "region" }); } catch { /* codes only */ }
    const named = (c: string) => ({ c, n: dn?.of(c) ?? c });
    const rest = COUNTRY_CODES.filter((c) => !PARTNER_FIRST.includes(c)).map(named).sort((a, b) => a.n.localeCompare(b.n, locale));
    return [...PARTNER_FIRST.map(named), ...rest];
  }, [kind, locale]);
  const [links, setLinks] = useState(["", "", ""]);
  const [consent, setConsent] = useState(false);
  const [v2, setV2] = useState("");
  const [needV2, setNeedV2] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    warmCaptcha();
    captchaKeys().then((k) => { if (k.v2 && k.v3) { setNeedV2(true); if (box.current) void renderCheckbox(box.current, setV2); } });
  }, []);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((o) => ({ ...o, [k]: e.target.value }));
  const linksOk = links.every((l) => !l.trim() || /^https:\/\/(www\.|m\.|music\.|on\.)?(youtube\.com|youtu\.be|soundcloud\.com)\//i.test(l.trim()));
  const emailOk = !f.email.trim() || /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(f.email.trim());
  const partnerOk = !par || (f.company.trim().length >= 2 && f.name.trim().length >= 2 && !!f.email.trim() && !!f.country && !!f.ptype && ack);
  const ready = consent && f.message.trim().length >= 5 && emailOk && linksOk && partnerOk && (!needV2 || !!v2) && (!rec || (f.name.trim().length >= 2 && !!f.email.trim()));
  const action = par ? "partner_inquiry" : rec ? "reciter_apply" : "suggestion";

  async function send() {
    setBusy(true); setErr("");
    const body = { kind, ...f, links: links.map((l) => l.trim()).filter(Boolean), consent, ack, captchaV2: v2, captcha: await captchaToken(action) };
    const r = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    setBusy(false);
    if (r?.ok) { setSent(true); return; }
    const e = r ? ((await r.json().catch(() => ({}))) as { error?: string }).error : "";
    setErr(r?.status === 429 ? t("errRate") : r?.status === 422 ? t("errRejected") : e === "captcha" ? t("errCaptcha") : e === "links" ? t("errLinks") : e === "email" ? t("errEmail") : t("errGeneric"));
    if (e === "captcha" && box.current && needV2) { setV2(""); void renderCheckbox(box.current, setV2); }
  }

  if (sent) return (
    <div role="status" className="mt-8 rounded-2xl border border-[rgb(var(--gold))]/60 bg-surface p-6">
      <p className="font-display text-2xl">{t("sentTitle")}</p>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{par ? par.sent : rec ? t("rec.sent") : t("sug.sent")}</p>
      <Link href="/" className="mt-4 inline-block text-sm font-bold text-accent hover:underline">{t("home")}</Link>
    </div>
  );

  const input = "mt-1 w-full rounded-lg border border-line bg-surface px-3 text-[16px] focus:border-accent focus:outline-none";
  const pill = (on: boolean) => `h-10 rounded-full px-4 text-sm font-semibold ${on ? "btn-gold" : "border border-line hover:border-accent"}`;
  return (
    <form className="mt-8 grid gap-5 rounded-2xl border border-line bg-surface/80 p-5 sm:p-7" onSubmit={(e) => { e.preventDefault(); if (ready && !busy) void send(); }}>
      {par ? (<>
        <label className="block text-[15px] font-semibold">{par.company}
          <input value={f.company} onChange={set("company")} maxLength={160} autoComplete="organization" required className={`${input} h-11`} /></label>
        <label className="block text-[15px] font-semibold">{par.contact}
          <input value={f.name} onChange={set("name")} maxLength={120} autoComplete="name" required className={`${input} h-11`} /></label>
        <label className="block text-[15px] font-semibold">{par.email}
          <input type="email" value={f.email} onChange={set("email")} maxLength={254} autoComplete="email" dir="ltr" required className={`${input} h-11`} /></label>
        <label className="block text-[15px] font-semibold">{par.country}
          <select value={f.country} onChange={set("country")} required className={`${input} h-11`}>
            <option value="">{par.countryPick}</option>
            {countries.slice(0, PARTNER_FIRST.length).map(({ c, n }) => <option key={c} value={c}>{n}</option>)}
            <option disabled value="-">──────────</option>
            {countries.slice(PARTNER_FIRST.length).map(({ c, n }) => <option key={c} value={c}>{n}</option>)}
          </select></label>
        <fieldset>
          <legend className="text-[15px] font-semibold">{par.type}</legend>
          <div className="mt-2 flex flex-wrap gap-2">{PARTNER_TYPES.map((w) => <button key={w} type="button" aria-pressed={f.ptype === w} onClick={() => setF((o) => ({ ...o, ptype: w }))} className={pill(f.ptype === w)}>{par.types[w]}</button>)}</div>
        </fieldset>
        <fieldset>
          <legend className="text-[15px] font-semibold">{par.ticket}</legend>
          <span className="mt-0.5 block text-[13px] text-muted">{par.ticketHint}</span>
          <div className="mt-2 flex flex-wrap gap-2">{PARTNER_TICKETS.map((w) => <button key={w} type="button" aria-pressed={f.ticket === w} onClick={() => setF((o) => ({ ...o, ticket: w }))} className={pill(f.ticket === w)}>{par.tickets[w]}</button>)}</div>
        </fieldset>
      </>) : (<>
      <label className="block text-[15px] font-semibold">{rec ? t("fullName") : t("nameOpt")}
        <input value={f.name} onChange={set("name")} maxLength={120} autoComplete="name" required={rec} className={`${input} h-11`} /></label>
      <label className="block text-[15px] font-semibold">{rec ? t("email") : t("emailOpt")}
        <input type="email" value={f.email} onChange={set("email")} maxLength={254} autoComplete="email" dir="ltr" required={rec} className={`${input} h-11`} />
        {!rec ? <span className="mt-1 block text-[13px] font-normal text-muted">{t("emailHint")}</span> : null}</label>
      </>)}

      {rec ? (<>
        <label className="block text-[15px] font-semibold">{t("rec.country")}<input value={f.country} onChange={set("country")} maxLength={80} autoComplete="country-name" className={`${input} h-11`} /></label>
        <label className="block text-[15px] font-semibold">{t("rec.riwaya")}<input value={f.riwaya} onChange={set("riwaya")} maxLength={200} placeholder={t("rec.riwayaPh")} className={`${input} h-11`} /></label>
        <fieldset>
          <legend className="text-[15px] font-semibold">{t("rec.ijazah")}</legend>
          <div className="mt-2 flex gap-2">
            <button type="button" aria-pressed={f.ijazah} onClick={() => setF((o) => ({ ...o, ijazah: true }))} className={pill(f.ijazah)}>{t("yes")}</button>
            <button type="button" aria-pressed={!f.ijazah} onClick={() => setF((o) => ({ ...o, ijazah: false }))} className={pill(!f.ijazah)}>{t("no")}</button>
          </div>
        </fieldset>
        {f.ijazah ? <label className="block text-[15px] font-semibold">{t("rec.chain")}<textarea value={f.chain} onChange={set("chain")} maxLength={500} rows={2} className={`${input} py-2`} /></label> : null}
        <fieldset className="grid gap-2">
          <legend className="text-[15px] font-semibold">{t("rec.links")}</legend>
          <span className="text-[13px] text-muted">{t("rec.linksHint")}</span>
          {links.map((l, i) => <input key={i} value={l} onChange={(e) => setLinks((o) => o.map((x, j) => (j === i ? e.target.value : x)))} inputMode="url" dir="ltr" placeholder="https://" maxLength={300} aria-label={`${t("rec.links")} ${i + 1}`} className={`${input} h-11`} />)}
          {!linksOk ? <span role="alert" className="text-[13px] text-[rgb(150,52,52)] dark:text-red-400">{t("errLinks")}</span> : null}
        </fieldset>
        <fieldset>
          <legend className="text-[15px] font-semibold">{t("rec.want")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">{WANTS.map((w) => <button key={w} type="button" aria-pressed={f.want === w} onClick={() => setF((o) => ({ ...o, want: w }))} className={pill(f.want === w)}>{t(`rec.w_${w}`)}</button>)}</div>
        </fieldset>
      </>) : par ? null : (
        <fieldset>
          <legend className="text-[15px] font-semibold">{t("sug.category")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">{CATS.map((c) => <button key={c} type="button" aria-pressed={f.category === c} onClick={() => setF((o) => ({ ...o, category: c }))} className={pill(f.category === c)}>{t(`sug.c_${c}`)}</button>)}</div>
        </fieldset>
      )}

      <label className="block text-[15px] font-semibold">{par ? par.message : t("message")}
        {par ? <span className="mt-0.5 block text-[13px] font-normal text-muted">{par.messageHint}</span> : null}
        <textarea value={f.message} onChange={set("message")} maxLength={2000} rows={6} required className={`${input} py-2`} />
        <span className="mt-1 block text-end text-[12px] font-normal text-muted">{f.message.length}/2000</span></label>
      {/* honeypot: hidden from people, bots fill it */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} /></label></div>
      {par ? (
        <label className="flex items-start gap-3 text-[14px] leading-snug">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--gold))]" />
          <span>{par.ack}</span>
        </label>
      ) : null}
      <label className="flex items-start gap-3 text-[14px] leading-snug">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--gold))]" />
        <span>{t("consent")} <Link href="/legal/privacy" className="font-semibold text-accent hover:underline">{t("privacy")}</Link></span>
      </label>
      <div ref={box} className={needV2 ? "min-h-[78px]" : "hidden"} />
      <CaptchaNotice />
      {err ? <p role="alert" className="text-[14px] text-[rgb(150,52,52)] dark:text-red-400">{err}</p> : null}
      <button type="submit" disabled={!ready || busy} className="btn-gold h-12 w-full rounded-full text-[16px] font-bold disabled:opacity-50 sm:w-fit sm:px-10">{busy ? t("sending") : t("send")}</button>
    </form>
  );
}
