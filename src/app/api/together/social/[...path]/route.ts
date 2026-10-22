import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import * as S from "@/lib/social";

export const dynamic = "force-dynamic";

// Together social 2 (logic in src/lib/social.ts). Every endpoint: signed in, confirmed e-mail, 16+, own profile.
// GET  hub | settings | feed | recap | khatm | khatm/:id | halaqa/:circleId | duels | duels/:id/questions | classes | classes/:id
//      network | profile/:username
// PUT  settings {feed?, duels?, suggest?, views?}
// POST profile/:username/view | profile/:username/endorse {skill: tajweed|hifz|makharij|surah, ref?, on}
// POST events {kind:'surah', ref} | feed/:id/react {on}
//      khatm {name, intention, circleId?} | khatm/join {code, consent} | khatm/:id {action: claim|release|done|leave|remove|report, juz?, username?}
//      halaqa/:circleId {action: start|cursor|hand|lower|end, surah?, ayah?, up?, username?}
//      duels {username} | duels/:id {action: answer|decline|cancel, answers?}
//      classes {name, targetKind, target} | classes/join {code, consent} | classes/:id {action: post|unpost|remove|target|newCode|delete|leave|report, ...}
type Ctx = { params: Promise<{ path: string[] }> };
const id = (s: string | undefined) => { const n = Number(s); return Number.isSafeInteger(n) && n > 0 ? n : NaN; };

async function run(req: NextRequest, ctx: Ctx, method: "GET" | "POST" | "PUT") {
  const write = method !== "GET";
  const path = (await ctx.params).path ?? [];
  const [a, b, c] = path;
  // the live halaqa polls every few seconds, so it has its own limit
  const g = await talentGate(req, write ? "soc-w" : a === "halaqa" ? "soc-live" : "soc-r", write ? 60 : a === "halaqa" ? 40 : 90,
    { minAge: MIN_POST_AGE, needProfile: true, write, windowMs: 60_000 });
  if (g.res) return g.res;
  const me = g.me.id;
  const body = write ? ((await req.json().catch(() => ({}))) as Record<string, unknown>) : {};
  try {
    let out: unknown;
    if (method === "GET") {
      if (a === "hub") out = await S.hub(me);
      else if (a === "settings") out = { settings: await S.settings(me) };
      else if (a === "feed") out = await S.feed(me);
      else if (a === "recap") out = { recap: await S.recap(me) };
      else if (a === "khatm" && !b) out = { khatms: await S.khatms(me) };
      else if (a === "khatm") out = { khatm: await S.khatmDetail(me, id(b)) };
      else if (a === "halaqa") out = { halaqa: await S.halaqa(me, id(b)) };
      else if (a === "duels" && !b) out = await S.duels(me);
      else if (a === "duels" && c === "questions") out = await S.duelQuestions(me, id(b));
      else if (a === "classes" && !b) out = await S.classes(me);
      else if (a === "classes") out = { class: await S.classDetail(me, id(b)) };
      else if (a === "network") out = await S.network(me);
      else if (a === "profile" && b) out = { profile: await S.profile(me, b) };
    } else if (method === "PUT") {
      if (a === "settings") out = { settings: await S.saveSettings(me, body) };
    } else {
      if (a === "events") out = await S.reportSurah(me, body.ref);
      else if (a === "feed" && c === "react") out = await S.react(me, id(b), body.on !== false);
      else if (a === "khatm" && !b) out = await S.createKhatm(me, body);
      else if (a === "khatm" && b === "join") out = await S.joinKhatm(me, body);
      else if (a === "khatm") out = await S.khatmAction(me, id(b), body);
      else if (a === "halaqa") out = { halaqa: await S.halaqaAction(me, id(b), body) };
      else if (a === "duels" && !b) out = await S.createDuel(me, body);
      else if (a === "duels") out = await S.duelAction(me, id(b), body);
      else if (a === "classes" && !b) out = await S.createClass(me, body);
      else if (a === "classes" && b === "join") out = await S.joinClass(me, body);
      else if (a === "classes") out = await S.classAction(me, id(b), body);
      else if (a === "profile" && b && c === "view") out = await S.recordView(me, b);
      else if (a === "profile" && b && c === "endorse") out = { profile: await S.endorse(me, b, body) };
    }
    if (out === undefined) return json({ error: "not_found" }, 404);
    return json(out, 200, NO_STORE);
  } catch (e) {
    if (e instanceof S.SocialError) return json({ error: e.code }, e.status);
    throw e;
  }
}
export const GET = (req: NextRequest, ctx: Ctx) => run(req, ctx, "GET");
export const POST = (req: NextRequest, ctx: Ctx) => run(req, ctx, "POST");
export const PUT = (req: NextRequest, ctx: Ctx) => run(req, ctx, "PUT");
