import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { NAME_BY_KEY, THEMES, findName, langOf, latinOf, letterOf, meaningOf, type BabyName, type Gender, type Theme } from "@/lib/names";
import { MONTH_LINKS, bestPool, isAllowed, rankNames, splitNames, verseFor, type FinderInput, type LetterPref, type OriginPick } from "@/lib/names/rules";
import { refundName, spendName } from "@/lib/aiCredits";
import { localeMeta } from "@/i18n/locales";

export const dynamic = "force-dynamic";

// The personal name report of the app (paid: one name credit, bought as the consumable com.quranmasterclass.app.names).
// The finder has already scored names on the device; the model only chooses from those candidates and explains in the
// family's language why each one suits them. Names, meanings and verses always come from the curated data
// (lib/names), never from the model; every returned id is checked against the candidates, NAMES and isAllowed.
// The family name is not sent to the model.

const MAX_PER_GENDER = 8;
const MAX_CANDIDATES = 40;
const ORIGIN_PICKS: OriginPick[] = ["quran", "prophet", "companion", "arabic"];
const clean = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f<>{}]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);

type Body = {
  locale?: unknown;
  form?: { father?: unknown; mother?: unknown; siblings?: unknown; gender?: unknown; hijriMonth?: unknown; themes?: unknown; origins?: unknown; maxLen?: unknown; easy?: unknown; letter?: unknown };
  candidates?: { b?: unknown; g?: unknown };
};
type Pick = { id: string; reason: string };
type ModelOut = { intro?: unknown; b?: unknown; g?: unknown };

/** a typed name with what the data knows about it (only for the prompt) */
function describeTyped(typed: string, l: ReturnType<typeof langOf>) {
  const k = findName(typed);
  return k ? `${typed} (Arabic ${k.ar}, meaning "${k.en}"${l !== "en" ? ` / "${meaningOf(k, l)}"` : ""}, first letter ${letterOf(k, "en")})` : typed;
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (!req.headers.get("x-qmc-app")) return json({ error: "app" }, 403);
  const key = process.env.OPENAI_API_KEY;
  if (!key) return json({ error: "off" }, 503);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  if (rateLimited(`names-report:day:${me.id}`, 20, 24 * 60 * 60_000)) return json({ error: "limit" }, 429);
  if (rateLimited(`names-report:min:${clientIp(req)}`, 6, 60_000)) return json({ error: "rate" }, 429);

  const b = (await req.json().catch(() => ({}))) as Body;
  const locale = /^[a-z]{2}$/.test(String(b.locale)) ? String(b.locale) : "en";
  const l = langOf(locale);
  const f = b.form ?? {};
  const gender = f.gender === "b" || f.gender === "g" ? f.gender : "both";
  const genders: Gender[] = gender === "both" ? ["b", "g"] : [gender];
  const month = Number.isInteger(f.hijriMonth) && Number(f.hijriMonth) >= 1 && Number(f.hijriMonth) <= 12 ? Number(f.hijriMonth) : null;
  const input: FinderInput = {
    father: clean(f.father, 40), mother: clean(f.mother, 40), family: "", siblings: clean(f.siblings, 160),
    themes: (Array.isArray(f.themes) ? f.themes : []).filter((x): x is Theme => THEMES.includes(x as Theme)),
    origins: (Array.isArray(f.origins) ? f.origins : []).filter((x): x is OriginPick => ORIGIN_PICKS.includes(x as OriginPick)),
    maxLen: Number.isInteger(f.maxLen) && Number(f.maxLen) > 0 && Number(f.maxLen) <= 20 ? Number(f.maxLen) : 0,
    easy: f.easy === true,
    letter: (["any", "same", "diff"] as LetterPref[]).includes(f.letter as LetterPref) ? (f.letter as LetterPref) : "any",
    hijriMonth: month,
  };

  // candidates: what the finder scored, checked against the data and the family's own names; topped up from the
  // server's own ranking when the app sent too few
  const cands: Partial<Record<Gender, BabyName[]>> = {};
  for (const g of genders) {
    const ranked = rankNames(g, input, l);
    const okKeys = new Set(ranked.map((s) => s.n.key)); // allowed, right gender, not a parent's or sibling's name
    const sent = (Array.isArray(b.candidates?.[g]) ? (b.candidates![g] as unknown[]) : []).map(String).slice(0, MAX_CANDIDATES);
    const list: BabyName[] = [];
    for (const k of sent) {
      const n = NAME_BY_KEY.get(k);
      if (n && n.g === g && isAllowed(n) && okKeys.has(k) && !list.includes(n)) list.push(n);
    }
    if (list.length < MAX_PER_GENDER) {
      const extra = bestPool(ranked).length >= 12 ? bestPool(ranked) : ranked.slice(0, 16);
      for (const s of extra) { if (list.length >= MAX_PER_GENDER + 4) break; if (!list.includes(s.n)) list.push(s.n); }
    }
    cands[g] = list;
  }
  if (!genders.some((g) => cands[g]?.length)) return json({ error: "empty" }, 400);

  if (!(await spendName(me.id))) return json({ error: "credits" }, 402);

  const language = `${localeMeta(locale).resourceLang} (language code "${locale}"${locale === "fa" ? ", Dari Persian as spoken in Afghanistan" : ""})`;
  const link = month ? MONTH_LINKS[month] : undefined;
  const sibs = splitNames(input.siblings);
  const family = [
    input.father ? `Father: ${describeTyped(input.father, l)}` : "Father: not given",
    input.mother ? `Mother: ${describeTyped(input.mother, l)}` : "Mother: not given",
    sibs.length ? `Siblings: ${sibs.map((s) => describeTyped(s, l)).join("; ")}` : "Siblings: none given",
    input.letter !== "any" && sibs.length ? `First letter wish compared to the siblings: ${input.letter === "same" ? "the same letter" : "a different letter"}` : "",
    input.themes.length ? `The name should express: ${input.themes.join(", ")}` : "",
    input.origins.length ? `Preferred origins: ${input.origins.join(", ")}` : "",
    link ? `Birth in Hijri month ${month}. Fact about this month (you may use only this): ${link.note.en} Names linked to this month: ${link.ids.join(", ")}.` : "Hijri birth month: not given",
  ].filter(Boolean).join("\n");
  const listFor = (g: Gender) => (cands[g] ?? []).map((n) => `- id "${n.key}": ${n.ar} (${n.tr.join(" / ")}), meaning "${n.en}", origins ${n.o.join(", ")}, themes ${n.t.join(", ")}${link?.ids.includes(n.id) ? ", linked to the birth month" : ""}`).join("\n");

  const system = `You help Muslim parents choose a name for their child. Write entirely in ${language}.
You receive the family's details and lists of candidate names that were already checked. Choose up to ${MAX_PER_GENDER} names for each list, best first, ONLY by their exact id from that list, and give each one a personal reason of 1 to 2 short sentences: harmony with the parents' names (sound, first letters, meaning), the link to the Hijri birth month when the family's details state one, how it sits next to the siblings' names, and the wishes they chose.
Strict rules: Never invent names, ids, meanings, origins or facts; use only the meanings and facts given. Never quote, paraphrase or invent Quran verses or hadith, never attribute words to the Prophet ﷺ, a companion or a scholar, never claim virtues, rewards or rulings. Never promise or predict anything about the child's character, fate, health or future. Respectful, warm and modest tone. No emojis, no headings, no Markdown. Do not mention artificial intelligence.
Answer only with JSON: {"intro": "one or two sentences for the family", ${genders.map((g) => `"${g}": [{"id": "...", "reason": "..."}]`).join(", ")}}.`;
  const user = `${family}\n\n${genders.map((g) => `Candidates for a ${g === "b" ? "boy" : "girl"} (list "${g}"):\n${listFor(g)}`).join("\n\n")}`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.5, max_tokens: 1800, user: `qm-${me.id}`,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
      signal: AbortSignal.timeout(45000),
    });
    const d = (await r.json().catch(() => ({}))) as { choices?: { message?: { content?: string } }[] };
    let out: ModelOut = {};
    try { out = JSON.parse(d.choices?.[0]?.message?.content ?? "{}") as ModelOut; } catch { out = {}; }

    const result: Partial<Record<Gender, ReturnType<typeof entry>[]>> = {};
    for (const g of genders) {
      const allowed = new Map((cands[g] ?? []).map((n) => [n.key, n]));
      const seen = new Set<string>();
      const picks = (Array.isArray(out[g]) ? (out[g] as Pick[]) : []).flatMap((p) => {
        const id = typeof p?.id === "string" ? p.id.trim() : "";
        const n = allowed.get(id);
        const reason = clean(p?.reason, 420);
        if (!n || seen.has(id) || !reason || !NAME_BY_KEY.has(id) || !isAllowed(n)) return [];
        seen.add(id);
        return [entry(n, reason, l, month)];
      }).slice(0, MAX_PER_GENDER);
      result[g] = picks;
    }
    if (!r.ok || !genders.some((g) => result[g]?.length)) { await refundName(me.id); return json({ error: "ai" }, 502); }
    return json({ intro: clean(out.intro, 400), month, monthNote: link ? link.note[l] : null, ...result });
  } catch {
    await refundName(me.id);
    return json({ error: "ai" }, 502);
  }
}

// one name of the report: everything except the reason comes from the data
function entry(n: BabyName, reason: string, l: ReturnType<typeof langOf>, month: number | null) {
  const v = verseFor(n);
  return {
    key: n.key, id: n.id, g: n.g, ar: n.ar, tr: n.tr, latin: latinOf(n), meaning: meaningOf(n, l), origins: n.o,
    verse: { key: v.key, kind: v.kind, theme: v.theme ?? null },
    month: !!(month && MONTH_LINKS[month]?.ids.includes(n.id)),
    reason,
  };
}
