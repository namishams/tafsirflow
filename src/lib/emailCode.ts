import crypto from "node:crypto";
import { pool } from "./db";
import { sendMail } from "./mail";

// Sign-in with a 6-digit code by e-mail (owner, 21.10.2026): the code proves that the address is correct, so a new
// account is confirmed from the start. Only an HMAC with a random salt is stored, a code is valid for 10 minutes,
// works once and dies after 5 wrong attempts; per address at most 5 codes an hour and one every 30 seconds.
// purpose "signin" = sign in or create the account; "confirm" = a signed-in person confirms a sensitive step.

export type CodePurpose = "signin" | "confirm";
export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
export const normEmail = (v: unknown) => String(v ?? "").trim().toLowerCase();
export const CODE_TTL_MIN = 20;
export const MAX_ATTEMPTS = 5;
const PER_HOUR = 5;
export const RESEND_SECONDS = 60;

const key = () => process.env.AUTH_CODE_SECRET || process.env.CERT_SECRET || "quran-masterclass-email-code";
const hmac = (salt: string, email: string, purpose: string, code: string) =>
  crypto.createHmac("sha256", key()).update(`${salt}|${email}|${purpose}|${code}`).digest("hex");
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

function matches(stored: string, email: string, purpose: string, code: string) {
  const [salt, want] = stored.split("$");
  if (!salt || !want) return false;
  const got = Buffer.from(hmac(salt, email, purpose, code), "hex");
  const exp = Buffer.from(want, "hex");
  return got.length === exp.length && crypto.timingSafeEqual(got, exp);
}

/** creates a code and mails it. "wait" = the last code is younger than 30 s, "rate" = 5 codes in the last hour */
export async function issueCode(email: string, purpose: CodePurpose, locale: string): Promise<{ status: "ok" | "wait" | "rate"; retryAfter?: number; sent?: boolean }> {
  const p = pool()!;
  if (Math.random() < 0.05) await p.query("DELETE FROM email_codes WHERE created_at < now() - interval '1 day'").catch(() => undefined);
  const s = (await p.query(
    "SELECT count(*) FILTER (WHERE created_at > now() - interval '1 hour')::int AS hour, EXTRACT(EPOCH FROM (now() - max(created_at)))::float AS age FROM email_codes WHERE email = $1 AND purpose = $2",
    [email, purpose],
  )).rows[0] as { hour: number; age: number | null };
  if (s.age !== null && s.age < RESEND_SECONDS) return { status: "wait", retryAfter: Math.ceil(RESEND_SECONDS - s.age) };
  if (s.hour >= PER_HOUR) return { status: "rate" };
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const salt = crypto.randomBytes(12).toString("hex");
  await p.query("INSERT INTO email_codes (email, purpose, code_hash, expires_at) VALUES ($1, $2, $3, now() + $4::int * interval '1 minute')",
    [email, purpose, `${salt}$${hmac(salt, email, purpose, code)}`, CODE_TTL_MIN]);
  const m = codeMail(locale, code, purpose);
  const sent = await sendMail(email, m.subject, m.text, m.html).catch((e) => { console.error("[mail] code not sent", e); return false; });
  return { status: "ok", sent };
}

/**
 * Checks a code against every open code of this address (a code that arrives late still works). A wrong code counts
 * as an attempt on all open codes, so guessing stays at 5 tries however many codes were requested. The right code is
 * used up at once (single use, also under parallel requests).
 */
export async function checkCode(email: string, purpose: CodePurpose, code: string): Promise<{ ok: true } | { ok: false; error: "code" | "expired"; left?: number }> {
  const p = pool()!;
  const clean = code.replace(/\D/g, "");
  const open = (await p.query(
    "SELECT id, code_hash, attempts FROM email_codes WHERE email = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > now() AND attempts < $3 ORDER BY created_at DESC LIMIT 10",
    [email, purpose, MAX_ATTEMPTS],
  )).rows as { id: string; code_hash: string; attempts: number }[];
  if (!open.length) return { ok: false, error: "expired" };
  const hit = clean.length === 6 ? open.find((r) => matches(r.code_hash, email, purpose, clean)) : undefined;
  if (hit) {
    const used = await p.query("UPDATE email_codes SET used_at = now() WHERE id = $1 AND used_at IS NULL RETURNING id", [hit.id]);
    if (!used.rows.length) return { ok: false, error: "expired" };
    // the other open codes of this address are no longer needed
    await p.query("UPDATE email_codes SET used_at = now() WHERE email = $1 AND purpose = $2 AND used_at IS NULL", [email, purpose]).catch(() => undefined);
    return { ok: true };
  }
  const r = await p.query("UPDATE email_codes SET attempts = attempts + 1 WHERE email = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > now() AND attempts < $3 RETURNING attempts",
    [email, purpose, MAX_ATTEMPTS]);
  // the newest open code has the fewest attempts: it decides how many tries are left
  const fewest = r.rows.length ? Math.min(...r.rows.map((x: { attempts: number }) => x.attempts)) : MAX_ATTEMPTS;
  const left = Math.max(0, MAX_ATTEMPTS - fewest);
  return left > 0 ? { ok: false, error: "code", left } : { ok: false, error: "expired" };
}

// After a correct code for an address without an account: the welcome form (name, country, year of birth, terms)
// creates the account with this ticket (30 minutes, single use). The code is used up already.
export async function issueTicket(email: string): Promise<string> {
  const t = crypto.randomBytes(32).toString("base64url");
  const p = pool()!;
  await p.query("DELETE FROM signup_tickets WHERE expires_at < now()").catch(() => undefined);
  await p.query("INSERT INTO signup_tickets (token_hash, email, expires_at) VALUES ($1, $2, now() + interval '30 minutes')", [sha(t), email]);
  return t;
}
export async function peekTicket(ticket: string): Promise<string | null> {
  const r = await pool()!.query("SELECT email FROM signup_tickets WHERE token_hash = $1 AND expires_at > now()", [sha(String(ticket))]);
  return r.rows[0]?.email ?? null;
}
export async function dropTicket(ticket: string) {
  await pool()!.query("DELETE FROM signup_tickets WHERE token_hash = $1", [sha(String(ticket))]).catch(() => undefined);
}

// ---------- the e-mail (emerald and gold, like the app; plain text alongside) ----------

type MailText = { subject: string; heading: string; intro: string; valid: string; ignore: string; never: string; footer: string };
const MAIL: Record<"en" | "de" | "ar", Record<CodePurpose, MailText>> = {
  en: {
    signin: {
      subject: "{code} is your Quran Masterclass code", heading: "Your sign-in code",
      intro: "Enter this code to sign in to Quran Masterclass or to create your account:",
      valid: "The code is valid for 10 minutes and can be used once.",
      ignore: "If you did not request this code, you can ignore this e-mail. Nobody can sign in without the code.",
      never: "Quran Masterclass will never ask you for this code by phone, chat or e-mail.",
      footer: "You receive this e-mail because this address was entered on quranmasterclass.com or in the Quran Masterclass app.",
    },
    confirm: {
      subject: "{code} is your confirmation code", heading: "Confirm that it is you",
      intro: "Enter this code in Quran Masterclass to confirm this step in your account:",
      valid: "The code is valid for 10 minutes and can be used once.",
      ignore: "If you did not start this, you can ignore this e-mail and your account stays unchanged.",
      never: "Quran Masterclass will never ask you for this code by phone, chat or e-mail.",
      footer: "You receive this e-mail because this step was started in your Quran Masterclass account.",
    },
  },
  de: {
    signin: {
      subject: "{code} ist Ihr Code für Quran Masterclass", heading: "Ihr Anmeldecode",
      intro: "Geben Sie diesen Code ein, um sich bei Quran Masterclass anzumelden oder Ihr Konto zu erstellen:",
      valid: "Der Code gilt 10 Minuten und nur ein einziges Mal.",
      ignore: "Wenn Sie keinen Code angefordert haben, können Sie diese E-Mail ignorieren. Ohne den Code kann sich niemand anmelden.",
      never: "Quran Masterclass fragt Sie nie per Telefon, Chat oder E-Mail nach diesem Code.",
      footer: "Sie erhalten diese E-Mail, weil diese Adresse auf quranmasterclass.com oder in der App Quran Masterclass eingegeben wurde.",
    },
    confirm: {
      subject: "{code} ist Ihr Bestätigungscode", heading: "Bestätigen Sie, dass Sie es sind",
      intro: "Geben Sie diesen Code in Quran Masterclass ein, um diesen Schritt in Ihrem Konto zu bestätigen:",
      valid: "Der Code gilt 10 Minuten und nur ein einziges Mal.",
      ignore: "Wenn Sie das nicht ausgelöst haben, können Sie diese E-Mail ignorieren. Ihr Konto bleibt unverändert.",
      never: "Quran Masterclass fragt Sie nie per Telefon, Chat oder E-Mail nach diesem Code.",
      footer: "Sie erhalten diese E-Mail, weil dieser Schritt in Ihrem Konto bei Quran Masterclass gestartet wurde.",
    },
  },
  ar: {
    signin: {
      subject: "{code} هو رمز Quran Masterclass الخاص بك", heading: "رمز تسجيل الدخول",
      intro: "أدخل هذا الرمز لتسجيل الدخول إلى Quran Masterclass أو لإنشاء حسابك:",
      valid: "الرمز صالح لمدة 10 دقائق ويمكن استخدامه مرة واحدة فقط.",
      ignore: "إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة. لا يمكن لأحد تسجيل الدخول بدون الرمز.",
      never: "لن تطلب منك Quran Masterclass هذا الرمز أبدًا عبر الهاتف أو المحادثة أو البريد الإلكتروني.",
      footer: "تصلك هذه الرسالة لأن هذا العنوان أُدخل على quranmasterclass.com أو في تطبيق Quran Masterclass.",
    },
    confirm: {
      subject: "{code} هو رمز التأكيد الخاص بك", heading: "أكّد أنك صاحب الحساب",
      intro: "أدخل هذا الرمز في Quran Masterclass لتأكيد هذه الخطوة في حسابك:",
      valid: "الرمز صالح لمدة 10 دقائق ويمكن استخدامه مرة واحدة فقط.",
      ignore: "إذا لم تبدأ هذه الخطوة، يمكنك تجاهل هذه الرسالة ويبقى حسابك دون تغيير.",
      never: "لن تطلب منك Quran Masterclass هذا الرمز أبدًا عبر الهاتف أو المحادثة أو البريد الإلكتروني.",
      footer: "تصلك هذه الرسالة لأن هذه الخطوة بدأت في حسابك على Quran Masterclass.",
    },
  },
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** subject, plain text and HTML of the code e-mail in the person's language (English for languages without a text) */
export function codeMail(locale: string, code: string, purpose: CodePurpose) {
  const lang = (locale === "de" || locale === "ar" ? locale : "en") as "en" | "de" | "ar";
  const m = MAIL[lang][purpose];
  const rtl = lang === "ar";
  const subject = m.subject.replace("{code}", code);
  const site = (process.env.SITE_URL ?? "https://quranmasterclass.com").replace(/\/$/, "");
  const text = `${m.heading}\n\n${m.intro}\n\n${code}\n\n${m.valid}\n${m.ignore}\n${m.never}\n\nQuran Masterclass · ${site.replace(/^https?:\/\//, "")}\n${m.footer}`;
  const font = rtl ? "'Segoe UI', Tahoma, Arial, sans-serif" : "'Plus Jakarta Sans', 'Segoe UI', Helvetica, Arial, sans-serif";
  const align = rtl ? "right" : "left";
  const html = `<!doctype html>
<html lang="${lang}" dir="${rtl ? "rtl" : "ltr"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f7f6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(m.intro)} ${code}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f7f6;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;border-radius:14px;overflow:hidden;border:1px solid #e2e7e4;background:#ffffff;">
<tr><td style="background:#08261d;padding:26px 32px 22px;border-bottom:3px solid #c6a65e;text-align:${align};">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.3px;color:#e9cf99;" dir="ltr">Quran Masterclass</div>
</td></tr>
<tr><td style="padding:32px 32px 8px;text-align:${align};font-family:${font};color:#0d1f19;">
<h1 style="margin:0 0 12px;font-family:${rtl ? font : "Georgia,'Times New Roman',serif"};font-size:24px;line-height:1.3;font-weight:600;color:#08261d;">${esc(m.heading)}</h1>
<p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#33443e;">${esc(m.intro)}</p>
</td></tr>
<tr><td align="center" style="padding:0 32px;">
<div dir="ltr" style="display:inline-block;padding:16px 26px;border:1px solid #c6a65e;border-radius:12px;background:#fbf7ec;font-family:'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:34px;line-height:1;letter-spacing:10px;font-weight:700;color:#08261d;">${code}</div>
</td></tr>
<tr><td style="padding:22px 32px 8px;text-align:${align};font-family:${font};">
<p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#066c4e;font-weight:600;">${esc(m.valid)}</p>
<p style="margin:0 0 10px;font-size:13.5px;line-height:1.6;color:#5a6762;">${esc(m.ignore)}</p>
<p style="margin:0 0 24px;font-size:13.5px;line-height:1.6;color:#5a6762;">${esc(m.never)}</p>
</td></tr>
<tr><td style="padding:18px 32px 24px;border-top:1px solid #e2e7e4;text-align:${align};font-family:${font};">
<p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#8a948f;">${esc(m.footer)}</p>
<p style="margin:0;font-size:12px;line-height:1.6;color:#966f34;" dir="ltr"><a href="${esc(site)}" style="color:#966f34;text-decoration:none;">${esc(site.replace(/^https?:\/\//, ""))}</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  return { subject, text, html };
}
