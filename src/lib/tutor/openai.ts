import { MODERATION_MODEL, TUTOR_LIMITS, tutorModel } from "./config";

// The two OpenAI calls of the tutor. Injected into the pipeline, so tests can run without a key (pipeline.spec).

export type ChatCall = (o: { system: string; messages: { role: "user" | "assistant"; content: string }[]; schema: { name: string; strict: boolean; schema: unknown }; maxTokens: number }) =>
  Promise<{ json: unknown; tokensIn: number; tokensOut: number }>;
export type ModerationCall = (text: string) => Promise<{ flagged: boolean; selfHarm: boolean } | null>;

export class QuotaError extends Error {}

export function openAiChat(key: string): ChatCall {
  return async ({ system, messages, schema, maxTokens }) => {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: tutorModel(),
        // gpt-5.x accept temperature only without reasoning; the tutor needs none (answers come from the passages)
        reasoning_effort: "none",
        temperature: TUTOR_LIMITS.temperature,
        max_completion_tokens: maxTokens,
        response_format: { type: "json_schema", json_schema: schema },
        messages: [{ role: "system", content: system }, ...messages],
      }),
      signal: AbortSignal.timeout(40_000),
    });
    const d = (await r.json().catch(() => ({}))) as { choices?: { message?: { content?: string; refusal?: string | null } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number }; error?: { message?: string; code?: string } };
    if (r.status === 429 || d.error?.code === "insufficient_quota") throw new QuotaError(d.error?.message ?? "quota");
    if (!r.ok) throw new Error(`openai ${r.status}: ${d.error?.message ?? ""}`);
    const msg = d.choices?.[0]?.message;
    let json: unknown = null;
    try { json = msg?.content ? JSON.parse(msg.content) : null; } catch { json = null; }
    return { json, tokensIn: d.usage?.prompt_tokens ?? 0, tokensOut: d.usage?.completion_tokens ?? 0 };
  };
}

export function openAiModeration(key: string): ModerationCall {
  return async (text) => {
    try {
      const r = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({ model: MODERATION_MODEL, input: text.slice(0, 4000) }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!r.ok) return null;
      const d = (await r.json()) as { results?: { flagged?: boolean; categories?: Record<string, boolean> }[] };
      const res = d.results?.[0];
      if (!res) return null;
      const c = res.categories ?? {};
      return { flagged: !!res.flagged, selfHarm: !!(c["self-harm"] || c["self-harm/intent"] || c["self-harm/instructions"]) };
    } catch {
      return null;
    }
  };
}
