// Server-side port of the app's feed resolvers (mobile/src/features/feed/remote.ts resolveCorpus / resolveItem): turns
// feed items (corpus references from /api/feed/page?v=2 and the day-by-day posts) into plain JSON cards (WebCard) with the
// texts already loaded from their sources, so the browser never fetches Quran, hadith, tafsir or article text itself.
//   - scripture always comes from its source (Quran.com, hadith-api, Thaqalayn); an item whose text cannot be loaded is
//     dropped (never scripture without its source text); the cards carry source, source link and licence
//   - bundled content (Academy, Abrahamic, Haramain, Shams, names, exam questions) is built by ./know.ts
//   - one card per item, de-duplicated by id, order kept, at most 6 items resolved at once, a failing item never fails the page
import { FEED_LOCALES } from "@/lib/feed/types";
import type { FeedItem, FeedLocale, FeedTradition } from "@/lib/feed/types";
import { getResources } from "@/lib/quran";
import { resolveHadith, resolveVerse, translationIdFor } from "@/lib/feed/resolve";
import { EXTRA_KINDS } from "@/lib/learn/content/extra/types";
import { PUBLIC_SITE } from "@/lib/site";
import { VERSE_COUNTS } from "@/lib/counts";
import { loadFeedTexts } from "./loadTexts";
import { fill } from "./texts";
import type { FeedTexts } from "./texts";
import { DAY, memo, plain, pool, withTimeout } from "./net";
import { duaByRef, lemmaCard, prefetchWiki, surahInfo, tafsirByRef, wikiCard, wordByRef } from "./sources";
import { chapterNames, knowledgeByRef } from "./know";
import { WEB_TOPICS } from "./types";
import { resolveCarousel, resolveWisdom } from "@/lib/feed/carousels/resolve";
import type { WebCard, WebCta, WebKind, WebTopic, WebVerse } from "./types";

export type ResolveOpts = {
  /** the reader's tradition (there is no stored one on the server): lessons of the other tradition are left out */
  tradition?: FeedTradition;
  /** a page of cards must not take longer than this (ms, default 14000); cards still loading are dropped, and what they
   *  fetched stays cached for the next request */
  budgetMs?: number;
};

type Ctx = {
  locale: FeedLocale;
  texts: FeedTexts;
  tradition: FeedTradition;
  /** Quran.com translation id of the language (0 = unknown: verse cards are dropped) */
  tr: number;
  /** "Quran.com – <translation>" */
  quran: string;
  verses: Map<string, Promise<WebVerse | null>>;
  /** the page's Wikipedia articles are loaded (one batched request); wiki cards wait for it inside the page budget */
  wikiReady: Promise<void>;
};

const KEY = /^\d{1,3}:\d{1,3}$/;
const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
const quranUrl = (k: string) => `https://quran.com/${k.replace(":", "/")}`;
const validKey = (k: string) => {
  if (!KEY.test(k)) return false;
  const [s, v] = k.split(":").map(Number);
  return s >= 1 && s <= 114 && v >= 1 && v <= VERSE_COUNTS[s - 1];
};
const topicOf = (raw: string | undefined, fallback: WebTopic): WebTopic => ((WEB_TOPICS as string[]).includes(raw ?? "") ? (raw as WebTopic) : fallback);
const readerHref = (v: WebVerse) => `/surah/${v.s}?v=${v.v}`;
/** the verse of a card, loaded once per page of cards */
function verseOf(cx: Ctx, key: string): Promise<WebVerse | null> {
  let p = cx.verses.get(key);
  if (!p) {
    p = cx.tr && validKey(key) ? resolveVerse(key, cx.locale, cx.tr) : Promise.resolve(null);
    cx.verses.set(key, p);
  }
  return p;
}

/** "Quran.com – Dr. Mustafa Khattab, The Clear Quran": the source line of a verse (no translation in Arabic) */
async function quranSource(locale: string, tr: number): Promise<string> {
  if (locale === "ar" || !tr) return "Quran.com";
  const name = await memo<string>(`trname:${tr}`, DAY, async () => {
    const t = (await withTimeout(getResources())).translations.find((x) => x.id === tr);
    return t ? (t.name || t.author_name || "").trim() || null : null;
  }, 60_000);
  return name ? `Quran.com – ${name}` : "Quran.com";
}

/** "quranmasterclass://courses/x" or "/courses/x" -> "/courses/x" (a website path); anything else: undefined */
const pathOfDeeplink = (u?: string) => {
  const m = u ? /^quranmasterclass:\/\/(.*)$/.exec(u) ?? /^(\/.*)$/.exec(u) : null;
  const p = m ? `/${m[1].replace(/^\/+/, "")}` : "";
  return /^\/[A-Za-z0-9/_?=&.#-]*$/.test(p) && p !== "/" ? p : undefined;
};

function card(item: FeedItem, kind: WebKind, topic: WebTopic, c: Omit<WebCard, "id" | "kind" | "topic" | "publishedAt">): WebCard {
  return { id: item.id, kind, topic, publishedAt: item.publishedAt, ...c };
}

// ---------- corpus items ----------
async function corpusCard(i: FeedItem, cx: Ctx): Promise<WebCard | null> {
  const ref = i.ref ?? {};
  const { locale, texts } = cx;
  switch (i.postKind) {
    case "verse": {
      const k = i.verseKey ?? str(ref.k);
      const v = await verseOf(cx, k);
      if (!v) return null;
      return card(i, "verse", "verses", { title: `${v.chapter} ${k}`, body: "", verse: v, source: cx.quran, sourceUrl: quranUrl(k), lang: locale, href: readerHref(v), cta: "reader" });
    }
    case "word": {
      const k = str(ref.k), pos = Number(ref.w);
      const [w, v] = await Promise.all([wordByRef(k, pos, locale), verseOf(cx, k)]);
      if (!w || !v) return null;
      const { word } = w;
      return card(i, "word", topicOf(i.topic, "tafsir"), {
        title: word.tl ? `${word.tl} – ${word.tr}` : word.tr, eyebrow: texts.feed.wordTitle, body: w.total ? fill(texts.feed.wordOf, { n: pos, total: w.total }) : "",
        arabic: word.ar, word: { pos: word.pos, ar: word.ar, tr: word.tr, tl: word.tl }, verse: v, words: [word.pos],
        source: "Quran.com word-by-word", sourceUrl: quranUrl(k), lang: w.lang, href: readerHref(v), cta: "reader",
      });
    }
    case "tafsir": {
      const t = await tafsirByRef(Number(ref.t), str(ref.k));
      if (!t) return null;
      const v = await verseOf(cx, t.firstKey);
      return card(i, "tafsir", topicOf(i.topic, "tafsir"), {
        title: t.title, body: t.body, verse: v ?? undefined, source: t.source, sourceUrl: t.sourceUrl, lang: t.lang,
        ...(v ? { href: readerHref(v), cta: "reader" as WebCta } : {}),
      });
    }
    case "lemma": {
      const l = lemmaCard(ref, locale);
      if (!l) return null;
      const v = await verseOf(cx, l.key);
      return card(i, "lemma", topicOf(i.topic, "tafsir"), {
        title: l.title, body: l.body, arabic: l.arabic, verse: v ?? undefined, source: l.source, sourceUrl: l.sourceUrl, lang: l.lang,
        ...(v ? { href: readerHref(v), cta: "reader" as WebCta } : {}),
      });
    }
    case "hadith": {
      const c = str(ref.c), n = Number(ref.n);
      const h = Number.isInteger(n) ? await resolveHadith(`${c}:${n}`, locale) : null;
      if (!h) return null;
      const g = h.grades?.[0];
      const body = h.text ? `${h.text}${g ? `\n\nGrade: ${g.grade} (${g.by})` : ""}` : h.arabic ?? "";
      return card(i, "hadith", "hadith", {
        // the usual number (Sahih Muslim 804): none when the source gives none, never the API's own count
        title: h.number ? `${h.name ?? c} ${h.number}` : h.name ?? c, body, arabic: h.text ? h.arabic : undefined,
        source: `${h.name ?? c} – hadith-api (fawazahmed0)`, sourceUrl: h.url ?? "https://sunnah.com", lang: h.textLang,
      });
    }
    case "shia-hadith": {
      const b = str(ref.b), n = Number(ref.n);
      const h = b && Number.isInteger(n) ? await resolveHadith(`thaqalayn:${b}:${n}`, locale) : null;
      if (!h) return null;
      const g = h.grades?.[0];
      return card(i, "hadith", "hadith", {
        title: `${h.name ?? b}, ${h.number ?? n}`, body: [h.chapter ? `${h.chapter}\n` : "", h.text, h.text && g ? `\n\n${g.by}: ${g.grade}` : ""].join("").trim(),
        arabic: h.arabic, source: h.reference, sourceUrl: h.url ?? "https://thaqalayn.net", lang: h.textLang,
      });
    }
    case "dua": {
      const d = await duaByRef(ref, locale);
      if (!d) return null;
      return card(i, "dua", topicOf(i.topic, "duas"), { title: d.title, body: d.body, arabic: d.arabic, source: d.source, sourceUrl: d.sourceUrl, lang: d.lang });
    }
    case "wiki": {
      const kind = str(ref.x), title = str(ref.t);
      if (!(EXTRA_KINDS as readonly string[]).includes(kind) || !title) return null;
      await cx.wikiReady;
      const w = await wikiCard(title, locale);
      if (!w) return null;
      return card(i, "wiki", topicOf(i.topic, "history"), {
        title: w.title, body: w.body, source: w.source, sourceUrl: w.sourceUrl, license: w.license, licenseUrl: w.licenseUrl, lang: w.lang,
        ...(w.image ? { image: { url: w.image.url, credit: w.image.credit, licenseUrl: w.image.licenseUrl } } : {}),
      });
    }
    case "carousel": case "wisdom": {
      // the editors' own words (src/lib/feed/carousels) with every slide's scripture from its source; a post whose
      // scripture cannot be loaded is left out (never a slide without its source text)
      if (i.carousel) {
        const c = await resolveCarousel(i.carousel, locale);
        return c ? card(i, "carousel", topicOf(c.topic, "tafsir"), { title: c.cover.title, body: c.cover.sub ?? "", source: c.sources[0]?.label ?? "Quran Masterclass", sourceUrl: c.sources[0]?.url ?? `${PUBLIC_SITE}/${locale}/carousels/${c.id}`, lang: c.lang, review: c.review || undefined, href: `/carousels/${c.id}`, carousel: c }) : null;
      }
      if (i.wisdom) {
        const w = await resolveWisdom(i.wisdom, locale);
        return w ? card(i, "wisdom", topicOf(i.topic, "duas"), { title: w.themeLabel, body: w.text ?? w.scripture?.text ?? "", source: w.scripture?.ref ?? w.source.label, sourceUrl: w.scripture?.url ?? w.source.url ?? PUBLIC_SITE, lang: w.lang, review: w.review || undefined, wisdom: w }) : null;
      }
      return null;
    }
    case "name": case "quiz": case "course": case "maqasid": case "mutashabihat": {
      const kind = i.postKind;
      const k = await knowledgeByRef(kind, ref, locale, texts.know, cx.tradition);
      if (!k) return null;
      const verse = k.verse ? await verseOf(cx, k.verse) : null;
      // a question that is tied to a verse (or a highlighted word of it) cannot be asked without the verse
      if (kind === "quiz" && k.verse && !verse) return null;
      let group: WebVerse[] | undefined;
      if (k.group) {
        group = (await Promise.all(k.group.map((key) => verseOf(cx, key)))).filter((v): v is WebVerse => !!v);
        if (group.length < 2) return null;
      }
      const web: WebKind = kind;
      const fallback: WebTopic = { name: "names", quiz: "quran", course: "seerah", maqasid: "tafsir", mutashabihat: "quran" }[kind] as WebTopic;
      return card(i, web, kind === "name" ? "names" : topicOf(i.topic, fallback), {
        title: k.title, body: k.body, eyebrow: k.eyebrow, arabic: k.arabic, bullets: k.bullets?.length ? k.bullets : undefined, note: k.note, madhhab: k.madhhab, review: k.review || undefined,
        verse: verse ?? undefined, words: verse ? k.words : undefined, group, quiz: k.quiz, source: k.source,
        sourceUrl: k.sourceUrl || `${PUBLIC_SITE}/${locale}${k.href ?? ""}`, lang: k.lang, href: k.href, cta: k.cta,
      });
    }
    default: {
      // a corpus kind of a newer server: what carries a verse key or hadith id still works, the rest is left out
      if (i.verseKey) return dayCard({ ...i, kind: "editorial", postKind: "verse" }, cx);
      if (i.hadithId) return dayCard({ ...i, kind: "editorial", postKind: "hadith" }, cx);
      return null;
    }
  }
}

// ---------- day-by-day items (editorial posts, verse / hadith of the day, date, surah) ----------
async function dayCard(i: FeedItem, cx: Ctx): Promise<WebCard | null> {
  const { locale, texts } = cx;
  const textLang = locale === "de" ? "de" : "en"; // the editors write German and English
  if (i.kind === "verse-of-day" || (i.verseKey && i.kind !== "featured-surah")) {
    const k = i.verseKey ?? "";
    const v = await verseOf(cx, k);
    if (!v) return null;
    const votd = i.kind === "verse-of-day";
    return card(i, "verse", "verses", {
      title: votd ? texts.share.verseOfDay || i.title : plain(i.title), eyebrow: votd ? `${v.chapter} ${k}` : undefined, body: votd ? "" : plain(i.body), verse: v,
      source: cx.quran, sourceUrl: i.sourceUrl || quranUrl(k), lang: votd ? locale : textLang, votd: votd || undefined, href: readerHref(v), cta: "reader",
    });
  }
  if (i.kind === "hadith-of-day" || i.hadithId) {
    const h = await resolveHadith(i.hadithId ?? "", locale);
    if (!h) return null;
    const day = i.kind === "hadith-of-day";
    return card(i, "hadith", "hadith", {
      title: day ? texts.share.hadithOfDay || i.title : plain(i.title), eyebrow: day ? h.reference : undefined,
      body: day ? h.text || h.arabic || "" : [h.text, plain(i.body)].filter(Boolean).join("\n\n"), arabic: h.text ? h.arabic : undefined,
      source: h.reference || i.source, sourceUrl: h.url || i.sourceUrl, lang: h.textLang,
    });
  }
  if (i.kind === "islamic-date" && i.hijri) {
    const { calText } = await import("@/lib/hijri");
    const ev = i.hijri.event ? calText(locale).ev(i.hijri.event)?.name : undefined;
    const days = i.hijri.daysToEvent;
    const body = ev && days !== undefined ? (days <= 0 ? fill(texts.feed.calendarToday, { name: ev }) : fill(texts.feed.calendarNext, { name: ev, n: days })) : textLang === locale ? i.body : "";
    return card(i, "date", "history", {
      title: `${i.hijri.d} ${i.hijri.monthName} ${i.hijri.y}`, eyebrow: texts.feed.calendarTitle, body,
      hijri: { d: i.hijri.d, y: i.hijri.y, monthName: i.hijri.monthName, event: ev, daysToEvent: days },
      source: "Quran Masterclass", sourceUrl: `${PUBLIC_SITE}/${locale}/calendar`, lang: locale, href: "/calendar",
    });
  }
  if (i.kind === "featured-surah" && i.surah) {
    const [info, names] = await Promise.all([surahInfo(i.surah, locale), chapterNames(locale)]);
    const name = names?.get(i.surah);
    if (!name) return null;
    return card(i, "surah", "quran", {
      title: `${texts.feed.surah} ${name}`, eyebrow: locale === "de" || locale === "en" ? i.title : undefined, body: info?.text ?? (textLang === locale ? i.body : ""),
      surah: i.surah, source: info ? `Quran.com${info.src ? ` – ${info.src}` : ""}` : "Quran.com", sourceUrl: info ? `https://quran.com/surah/${i.surah}/info` : i.sourceUrl,
      lang: info?.lang ?? locale, href: `/surah/${i.surah}`, cta: "reader",
    });
  }
  // editorial article / announcement
  if (i.kind === "editorial" || i.kind === "announcement") {
    const href = pathOfDeeplink(i.deeplink);
    return card(i, "article", "history", {
      title: plain(i.title), body: plain(i.body), arabic: i.arabic, source: i.source, sourceUrl: i.sourceUrl, lang: textLang,
      ...(i.image && /^\/[A-Za-z0-9/_.-]+$/.test(i.image) ? { image: { url: i.image } } : {}), ...(href ? { href, cta: "read" as WebCta } : {}),
    });
  }
  return null;
}

/** one item as a card; null when it cannot be resolved. Never throws. */
async function oneCard(i: FeedItem, cx: Ctx): Promise<WebCard | null> {
  try {
    const c = i.kind === "corpus" ? await corpusCard(i, cx) : await dayCard(i, cx);
    return c && c.title !== undefined && c.source ? c : null;
  } catch {
    return null;
  }
}

const normalizeLocale = (l: string): FeedLocale => {
  const x = (l || "en").slice(0, 2).toLowerCase();
  return (FEED_LOCALES as readonly string[]).includes(x) ? (x as FeedLocale) : "en";
};

/**
 * The cards for a list of feed items (one per item, items that cannot be resolved are dropped, ids de-duplicated, order
 * kept). Tafsir passages and Wikipedia articles that several items share appear once. Partial failures never fail the
 * list; the result can be shorter than the input.
 */
export async function resolveCards(items: FeedItem[], locale: string, opts: ResolveOpts = {}): Promise<WebCard[]> {
  const started = Date.now();
  const loc = normalizeLocale(locale);
  const seen = new Set<string>();
  const list = items.filter((i) => i && typeof i.id === "string" && !seen.has(i.id) && !!seen.add(i.id));
  if (!list.length) return [];
  const [texts, tr] = await Promise.all([loadFeedTexts(loc), translationIdFor(loc)]);
  // Wikipedia: one batched request for all articles of the page, then every card reads the cache
  const titles = list.filter((i) => i.kind === "corpus" && i.postKind === "wiki" && (EXTRA_KINDS as readonly string[]).includes(str(i.ref?.x)) && str(i.ref?.t)).map((i) => str(i.ref?.t));
  const wikiReady = titles.length ? prefetchWiki(titles, loc).catch(() => undefined) : Promise.resolve();
  const cx: Ctx = { locale: loc, texts, tradition: opts.tradition ?? "all", tr, quran: await quranSource(loc, tr), verses: new Map(), wikiReady };

  let timer: ReturnType<typeof setTimeout> | undefined;
  // the budget counts from the start of the call (the set-up above is part of it)
  const left = Math.max(0, (opts.budgetMs ?? 14_000) - (Date.now() - started));
  const deadline = new Promise<"late">((r) => { timer = setTimeout(() => r("late"), left); });
  const results: (WebCard | null)[] = new Array(list.length).fill(null);
  const work = pool(list, 6, async (item, idx) => { const c = await oneCard(item, cx); results[idx] = c; return c; });
  await Promise.race([work, deadline]);
  clearTimeout(timer);

  // a tafsir passage or an article that two items share is one card
  const urls = new Set<string>();
  return results.filter((c): c is WebCard => {
    if (!c) return false;
    if (c.kind === "tafsir" || c.kind === "wiki") { if (urls.has(c.sourceUrl)) return false; urls.add(c.sourceUrl); }
    return true;
  });
}
