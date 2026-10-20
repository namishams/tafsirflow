// Voluntary support (sadaqa) via Ziina, the UAE payment provider – server side only (imported by /api/support).
// Same approach as the owner's MediFlow portal (mediflow/src/lib/portal/ziina.ts, same ICSL FZE merchant account):
// the key is read from the server environment on every call, is sent only to Ziina and is never logged or returned.
// Card details are entered at Ziina only and never reach this server.
//
// Server environment (/srv/tafsirflow/.env.app, never in git):
//   ZIINA_API_KEY   Ziina Business → Developers → API key. Without it the support page shows the payment link below.
//   SUPPORT_URL     optional personal Ziina payment link (default: the ICSL FZE link); "off" hides it.
//   ZIINA_TEST      "1" or "yes" creates test payments only (for trying the flow with a test key).
//   ZIINA_API_BASE  optional, defaults to https://api-v2.ziina.com/api

const API_BASE = () => process.env.ZIINA_API_BASE?.trim() || "https://api-v2.ziina.com/api";
const key = () => process.env.ZIINA_API_KEY?.trim() || "";

export const ziinaConfigured = () => key().length > 0;
export const ziinaTestMode = () => ["1", "yes"].includes(String(process.env.ZIINA_TEST ?? "").trim());

/** the personal Ziina payment link shown when there is no API key; empty when switched off */
export function supportLink(): string {
  const v = process.env.SUPPORT_URL?.trim();
  if (v === "off") return "";
  const link = v || "https://pay.ziina.com/icslfze";
  return link.startsWith("https://") ? link : "";
}

/** AED in fils; the epsilon avoids float errors (1.005 * 100 = 100.4999…) */
export const fils = (aed: number) => Math.round((aed + Number.EPSILON) * 100);
export const MIN_AED = 5;
export const MAX_AED = 20000;

export type ZiinaStatus = "requires_payment_instrument" | "requires_user_action" | "pending" | "completed" | "failed" | "canceled";
export type PaymentIntent = { id: string; status: ZiinaStatus; amount: number; currencyCode: string; redirectUrl: string | null };
export type ZiinaResult<T> = { ok: true; value: T } | { ok: false; reason: string };

const fail = (reason: string): ZiinaResult<never> => ({ ok: false, reason: reason.slice(0, 300) });

async function call(path: string, init: RequestInit): Promise<ZiinaResult<Record<string, unknown>>> {
  const k = key();
  if (!k) return fail("not_configured");
  try {
    const res = await fetch(`${API_BASE()}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${k}`, "content-type": "application/json" },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    const text = await res.text();
    let body: Record<string, unknown> | null = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = null; }
    // only the status and Ziina's own message – never the request (it carries the key)
    if (!res.ok) return fail(`Ziina ${res.status}: ${String(body?.message ?? body?.error ?? "").slice(0, 200)}`);
    return { ok: true, value: body ?? {} };
  } catch (e) {
    return fail(`Ziina request failed: ${(e as Error)?.name ?? "error"}`);
  }
}

const shape = (b: Record<string, unknown>): PaymentIntent => ({
  id: String(b?.id ?? ""),
  status: String(b?.status ?? "") as ZiinaStatus,
  amount: Number(b?.amount ?? 0),
  currencyCode: String(b?.currency_code ?? "AED"),
  redirectUrl: typeof b?.redirect_url === "string" ? b.redirect_url : null,
});

export async function createPaymentIntent(input: { amountAed: number; message: string; successUrl: string; cancelUrl: string; failureUrl: string }): Promise<ZiinaResult<PaymentIntent>> {
  if (!(input.amountAed >= MIN_AED && input.amountAed <= MAX_AED)) return fail("amount");
  const r = await call("/payment_intent", {
    method: "POST",
    body: JSON.stringify({
      amount: fils(input.amountAed),
      currency_code: "AED",
      message: input.message.slice(0, 200),
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      failure_url: input.failureUrl,
      test: ziinaTestMode(),
    }),
  });
  if (!r.ok) return r;
  const intent = shape(r.value);
  if (!intent.id || !intent.redirectUrl?.startsWith("https://")) return fail("Ziina returned no payment page");
  return { ok: true, value: intent };
}

/** the only truth about a payment: asked from Ziina, not taken from the browser's return address */
export async function getPaymentIntent(id: string): Promise<ZiinaResult<PaymentIntent>> {
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(id)) return fail("id");
  const r = await call(`/payment_intent/${encodeURIComponent(id)}`, { method: "GET" });
  if (!r.ok) return r;
  return { ok: true, value: shape(r.value) };
}
