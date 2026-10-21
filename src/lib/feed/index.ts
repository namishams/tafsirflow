import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimited } from "@/lib/http";
import raw from "./config.json";
import { editorialItems, traditionOk } from "./posts";
import { generatedForDay, dayKey } from "./generated";
import { FEED_LOCALES } from "./types";
import type { FeedConfig, FeedItem, FeedLocale, FeedTradition, Localized } from "./types";

export type FeedParams = { locale: FeedLocale; tradition: FeedTradition };
const LOCALES: readonly FeedLocale[] = FEED_LOCALES;
const TRADS: FeedTradition[] = ["all", "sunni", "shia"];

export function parseParams(req: NextRequest): FeedParams {
  const q = req.nextUrl.searchParams;
  const l = (q.get("locale") ?? "en").slice(0, 2).toLowerCase() as FeedLocale;
  const t = (q.get("tradition") ?? "all").toLowerCase() as FeedTradition;
  return { locale: LOCALES.includes(l) ? l : "en", tradition: TRADS.includes(t) ? t : "all" };
}

/** light per-IP limit; returns a 429 response or null */
export function limit(req: NextRequest, name: string) {
  return rateLimited(`feed:${name}:${clientIp(req)}`, 120, 60_000) ? NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "60" } }) : null;
}

/** JSON with ETag + CDN cache; answers 304 on If-None-Match */
export function cached(req: NextRequest, data: unknown, sMaxAge: number) {
  const body = JSON.stringify(data);
  const etag = `"${createHash("sha1").update(body).digest("base64url").slice(0, 27)}"`;
  const headers = { "Cache-Control": `public, max-age=60, s-maxage=${sMaxAge}, stale-while-revalidate=${sMaxAge * 4}`, ETag: etag, Vary: "Accept-Encoding" };
  if (req.headers.get("if-none-match") === etag) return new NextResponse(null, { status: 304, headers });
  return new NextResponse(body, { status: 200, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } });
}

const loc = (l: Localized, locale: FeedLocale) => l[locale] ?? l.en ?? "";

export function feedConfig({ locale, tradition }: FeedParams, now = new Date()): FeedConfig {
  const c = raw as typeof raw & { announcements: { tradition?: FeedTradition; startsAt: string; endsAt: string }[] };
  const t = now.getTime();
  return {
    version: c.version, updatedAt: c.updatedAt, minAppBuild: c.minAppBuild, kindWeights: c.kindWeights, enabledKinds: c.enabledKinds, flags: c.flags,
    promo: { frequencyCap: c.promo.frequencyCap, items: c.promo.items.map((p) => ({ ...p, title: loc(p.title, locale) })) },
    topicChipGroups: c.topicChipGroups.map((g) => ({ ...g, label: loc(g.label, locale) })),
    announcements: c.announcements
      .filter((a) => traditionOk(a.tradition as FeedTradition | undefined, tradition) && Date.parse(a.startsAt) <= t && Date.parse(a.endsAt) > t)
      .map(({ tradition: _t, ...a }) => ({ ...a, title: loc((a as unknown as { title: Localized }).title, locale) })) as FeedConfig["announcements"],
    ...((c as { monetize?: FeedConfig["monetize"] }).monetize ? { monetize: (c as { monetize?: FeedConfig["monetize"] }).monetize } : {}),
    ...((c as { adSlots?: FeedConfig["adSlots"] }).adSlots ? { adSlots: (c as { adSlots?: FeedConfig["adSlots"] }).adSlots } : {}),
    ...((c as { posting?: FeedConfig["posting"] }).posting ? { posting: (c as { posting?: FeedConfig["posting"] }).posting } : {}),
  };
}

export async function feedNew(p: FeedParams, since: Date | undefined, now = new Date()): Promise<FeedItem[]> {
  const editorial = await editorialItems(p.locale, p.tradition, now, since);
  const gen = generatedForDay(now, p.locale, p.tradition).filter((i) => traditionOk(i.tradition, p.tradition) && (!since || Date.parse(i.publishedAt) > since.getTime()));
  return [...editorial, ...gen].slice(0, 50);
}

// cursor = base64url("YYYY-MM-DD:offset"); the page walks back day by day, editorial first, then that day's generated items
const PAGE = 10, MAX_DAYS = 365;
export function encodeCursor(day: string, offset: number) { return Buffer.from(`${day}:${offset}`).toString("base64url"); }
export function decodeCursor(c: string | null): { day: number; offset: number } | null | "invalid" {
  if (!c) return null;
  const m = /^(\d{4}-\d{2}-\d{2}):(\d{1,4})$/.exec(Buffer.from(c.slice(0, 64), "base64url").toString());
  if (!m || Number.isNaN(Date.parse(m[1]))) return "invalid";
  return { day: Date.parse(`${m[1]}T00:00:00Z`), offset: Number(m[2]) };
}

export async function feedPage(p: FeedParams, cursor: { day: number; offset: number } | null, now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  let day = Math.min(cursor?.day ?? today, today), offset = cursor?.offset ?? 0;
  const editorial = await editorialItems(p.locale, p.tradition, now);
  const items: FeedItem[] = [];
  for (let i = 0; i < MAX_DAYS && items.length < PAGE && today - day < MAX_DAYS * 86_400_000; i++) {
    const d = new Date(day), key = dayKey(d);
    const dayItems = [
      ...editorial.filter((e) => e.publishedAt.slice(0, 10) === key),
      ...generatedForDay(d, p.locale, p.tradition).filter((g) => traditionOk(g.tradition, p.tradition)),
    ];
    const take = dayItems.slice(offset, offset + (PAGE - items.length));
    items.push(...take);
    if (offset + take.length < dayItems.length) return { items, nextCursor: encodeCursor(key, offset + take.length), day: dayKey(new Date(today)) };
    day -= 86_400_000; offset = 0;
  }
  const more = today - day < MAX_DAYS * 86_400_000;
  return { items, nextCursor: more ? encodeCursor(dayKey(new Date(day)), 0) : null, day: dayKey(new Date(today)) };
}
