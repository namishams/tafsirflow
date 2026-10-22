import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { checkCaptchaStrict } from "@/lib/captcha";
import { moderate } from "@/lib/moderation";
import { sendMail } from "@/lib/mail";
import { COUNTRY_CODES, countryName } from "@/lib/countries";
import { emailRateLimited, isDisposableEmail } from "@/lib/botguard";

export const dynamic = "force-dynamic";

// Contact forms (owner 22.10.2026): /suggestions ("suggestion") and /reciters/apply ("reciter"); since 23.10.2026
// /partners ("partner": partnership and investment inquiries for Blueprint Shams 4.0, subject "[Partner]"). The message goes by
// e-mail to info@ (reply-to the sender when given) and is kept in contact_messages as a backup; nothing goes to third
// parties. Protection: same origin, honeypot, reCAPTCHA v2 checkbox + v3 score, per-IP limit, word filter.
const TO = process.env.CONTACT_TO ?? "info@quranmasterclass.com";
const SUGGEST_CATS = ["feature", "content", "bug", "other"];
const WANTS = ["cooperation", "verify", "teach", "other"];
const PARTNER_TYPES = ["strategic", "bank", "media", "sponsor", "content", "foundation", "other"];
const TICKETS: Record<string, string> = { none: "nicht angegeben", t1: "bis USD 50.000", t2: "USD 50.000 – 250.000", t3: "USD 250.000 – 1 Mio.", t4: "über USD 1 Mio.", inkind: "Sachleistung (Studio, Medien, Sendezeit, Know-how)" };
const PARTNER_LABEL: Record<string, string> = { strategic: "Strategisches Unternehmen", bank: "Islamische Bank / Investor", media: "Medienpartner", sponsor: "Sponsor einer Reihe", content: "Rezitator / Lehrkraft", foundation: "Stiftung / Institution", other: "Sonstiges" };
const EMAIL = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[a-z]{2,}$/i;
const LINK_HOSTS = /^(www\.|m\.|music\.)?(youtube\.com|youtu\.be|soundcloud\.com|on\.soundcloud\.com)$/i;

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max);
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ");

// only the word filter decides here: links, addresses and length are fine in a private message to us
async function bad(text: string) {
  const stripped = text.replace(/https?:\/\/\S+|www\.\S+|[\w.+-]+@[\w-]+\.[\w.]+|\+?\d[\d\s().-]{7,}/g, " ");
  for (let i = 0; i < stripped.length; i += 450) {
    const part = stripped.slice(i, i + 450).trim();
    if (part.length < 2) continue;
    const v = await moderate(part);
    if (!v.ok && (v.reason === "word" || v.reason === "repeat")) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const ip = clientIp(req);
  // honeypot: bots fill every field; answer as if it worked
  if (clean(b.website, 200)) return json({ ok: true }, 201);
  const kind = b.kind === "reciter" ? "reciter" : b.kind === "suggestion" ? "suggestion" : b.kind === "partner" ? "partner" : null;
  if (!kind) return json({ error: "invalid" }, 400);
  if (rateLimited(`contact:${ip}`, 5, 60 * 60_000)) return json({ error: "rate" }, 429);
  if (b.consent !== true) return json({ error: "consent" }, 400);

  const name = oneLine(clean(b.name, 120)), email = oneLine(clean(b.email, 254)), message = clean(b.message, 2000);
  if (email && !EMAIL.test(email)) return json({ error: "email" }, 400);
  // throw-away addresses and one address sending again and again (3 an hour), one visitor sending all day (15 a day)
  if (email && isDisposableEmail(email)) return json({ error: "email" }, 400);
  if ((email && emailRateLimited("contact", email, 3, 60 * 60_000)) || rateLimited(`contact-d:${ip}`, 15, 24 * 60 * 60_000)) return json({ error: "rate" }, 429);
  if (message.length < 5) return json({ error: "invalid" }, 400);

  let category = "", extra: Record<string, unknown> = {};
  if (kind === "suggestion") {
    category = String(b.category);
    if (!SUGGEST_CATS.includes(category)) return json({ error: "invalid" }, 400);
  } else if (kind === "partner") {
    // company, contact person, e-mail, country, type and the acknowledgement (no public offer, no advice) are required
    const company = oneLine(clean(b.company, 160)), country = String(b.country ?? "").toUpperCase(), ticket = String(b.ticket ?? "none");
    category = String(b.ptype);
    if (company.length < 2 || name.length < 2 || !email || !COUNTRY_CODES.includes(country) || !PARTNER_TYPES.includes(category) || !Object.hasOwn(TICKETS, ticket)) return json({ error: "invalid" }, 400);
    if (b.ack !== true) return json({ error: "consent" }, 400);
    extra = { company, country, ticket };
  } else {
    if (name.length < 2 || !email) return json({ error: "invalid" }, 400);
    category = String(b.want);
    if (!WANTS.includes(category)) return json({ error: "invalid" }, 400);
    const links = (Array.isArray(b.links) ? b.links : []).map((l) => clean(l, 300)).filter(Boolean).slice(0, 3);
    for (const l of links) {
      let u: URL;
      try { u = new URL(l); } catch { return json({ error: "links" }, 400); }
      if (u.protocol !== "https:" || !LINK_HOSTS.test(u.hostname)) return json({ error: "links" }, 400);
    }
    extra = {
      country: oneLine(clean(b.country, 80)), riwaya: oneLine(clean(b.riwaya, 200)),
      ijazah: b.ijazah === true, chain: clean(b.chain, 500), links,
    };
  }

  if (!(await checkCaptchaStrict(b, kind === "reciter" ? "reciter_apply" : kind === "partner" ? "partner_inquiry" : "suggestion", ip))) return json({ error: "captcha" }, 400);
  if (await bad([name, message, String(extra.chain ?? ""), String(extra.company ?? "")].join("\n"))) return json({ error: "rejected" }, 422);

  const p = pool();
  let id: number | null = null;
  if (p) {
    const r = await p.query("INSERT INTO contact_messages (kind, name, email, category, message, extra) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [kind, name || null, email || null, category, message, JSON.stringify(extra)]).catch((e) => { console.error("contact insert", e); return null; });
    id = r ? Number(r.rows[0].id) : null;
  }

  const lines = kind === "partner"
    ? [`Firma/Organisation: ${extra.company}`, `Ansprechperson: ${name}`, `E-Mail: ${email}`, `Land: ${countryName(String(extra.country), "de")} (${extra.country})`, `Art: ${PARTNER_LABEL[category] ?? category}`, `Größenordnung (unverbindlich): ${TICKETS[String(extra.ticket)]}`, "Hinweis bestätigt: kein öffentliches Angebot, keine Anlageberatung, keine Renditezusagen"]
    : kind === "reciter"
    ? [`Name: ${name}`, `E-Mail: ${email}`, `Land: ${extra.country || "-"}`, `Riwaya: ${extra.riwaya || "-"}`, `Ijazah: ${extra.ijazah ? "ja" : "nein"}`, `Kette/Lehrer: ${extra.chain || "-"}`, `Anliegen: ${category}`, `Links:\n${(extra.links as string[]).join("\n") || "-"}`]
    : [`Name: ${name || "-"}`, `E-Mail: ${email || "-"}`, `Kategorie: ${category}`];
  const subject = kind === "partner" ? `[Partner] ${PARTNER_LABEL[category] ?? category}: ${extra.company}` : kind === "reciter" ? `[Rezitator] ${category}: ${name}` : `[Vorschlag] ${category}${name ? `: ${name}` : ""}`;
  const text = `${lines.join("\n")}\n\nNachricht:\n${message}\n\n${id ? `#${id} ` : ""}${new Date().toISOString()}`;
  let mailed = false;
  try { mailed = await sendMail(TO, subject.slice(0, 180), text, undefined, email || undefined); } catch (e) { console.error("contact mail", e); }
  if (p && id && mailed) await p.query("UPDATE contact_messages SET mailed = true WHERE id = $1", [id]).catch(() => undefined);
  if (!mailed && !id) return json({ error: "unavailable" }, 503);
  return json({ ok: true }, 201);
}
