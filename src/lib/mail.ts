import nodemailer from "nodemailer";

// SMTP settings come from the environment (never from code): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM.
// Without them no mail is sent; the link is printed to the server log so the owner can still test.
// Whether real e-mail can be sent. Without SMTP the app cannot ask people to confirm an address (they would be locked out).
export const mailConfigured = () => !!process.env.SMTP_HOST;

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.warn(`[mail] SMTP not configured – would send to ${to}: ${subject}\n${text}`);
    return false;
  }
  const t = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    tls: { rejectUnauthorized: process.env.SMTP_INSECURE_TLS !== "1" },
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await t.sendMail({ from: process.env.MAIL_FROM ?? process.env.SMTP_USER, to, subject, text });
  return true;
}
