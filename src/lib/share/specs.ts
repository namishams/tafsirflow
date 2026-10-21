import type { FeedTexts } from "@/lib/feedWeb/texts";
import type { WebCard, WebTopic, WebVerse } from "@/lib/feedWeb/types";
import type { AllahName, Story } from "@/lib/learn/prophet/stories";
import { SITE } from "@/lib/site";
import { clip } from "./canvasText";
import type { ShareCard, ShareSpec } from "./formats";

// What a feed post shares: the link, the message, the seed of its design and the card the image is drawn from, one builder
// per post kind (web port of the app's feedShare.tsx: verseSpec, storySpec, nameSpec, hadithSpec, knowSpec, libSpec,
// quizSpec). The cards keep their text in full length; render.ts clips it per format.

/** the page language, its feed texts, and the site address for links (default: the canonical address) */
export type ShareCtx = { locale: string; texts: FeedTexts; origin?: string };

const plain = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
const site = (c: ShareCtx) => `${c.origin ?? SITE}/${c.locale}`;
const verseLink = (c: ShareCtx, v: Pick<WebVerse, "s" | "v">) => `${site(c)}/surah/${v.s}?v=${v.v}`;

/** the topic chip's label of a card (the app's topicLabel) */
function topicLabel(t: FeedTexts, topic: WebTopic): string {
  const f = t.feed;
  switch (topic) {
    case "verses": return f.verseLabel;
    case "tafsir": return f.topicTafsir;
    case "hadith": return f.hadith;
    case "duas": return f.topicDuas;
    case "prayer": return f.topicPrayer;
    case "holy": return f.topicHoly;
    case "seerah": return f.topicSeerah;
    case "quran": return f.topicQuran;
    case "names": return f.topicNames;
    case "scholars": return f.topicScholars;
    case "history": return f.topicHistory;
    case "art": return f.topicArt;
  }
}

/** a verse (text only from the Quran data); `kicker` goes in front of the surah name ("Verse of the day · Al-Baqarah · 2:255") */
export function specForVerse(c: ShareCtx, v: WebVerse, kicker?: string, onShared?: () => void): ShareSpec {
  return {
    link: verseLink(c, v),
    message: `${v.translation ? `${plain(v.translation)}\n\n` : ""}Quran ${v.key}`,
    seed: v.key,
    onShared,
    card: { t: "verse", arabic: v.arabic, translation: v.translation, reference: `${kicker ? `${kicker} · ` : ""}${v.chapter} · ${v.key}`, verseKey: v.key },
  };
}

/** a story of the prophets / Islam chapter card */
export function specForStory(c: ShareCtx, s: Story): ShareSpec {
  const body = plain(s.paragraphs.join(" ") || (s.points?.items.join(" · ") ?? ""));
  return {
    link: `${site(c)}${s.webPath}`,
    message: `${s.title}\n${s.groupTitle}`,
    seed: s.group,
    card: { t: "text", kicker: s.groupTitle, seed: s.group, arabic: s.arabic || undefined, title: s.title, body, source: s.sources[0] },
  };
}

/** a name of Allah */
export function specForName(c: ShareCtx, n: AllahName): ShareSpec {
  return {
    link: `${site(c)}/islam/names`,
    message: `${n.ar} – ${n.latin}: ${n.meaning}`,
    seed: `name:${n.latin}`,
    card: { t: "name", kicker: c.texts.share.nameOfAllah, arabic: n.ar, latin: n.latin, meaning: n.meaning },
  };
}

/** body text with its bullet points, as one run of text (the app's knowSpec) */
const bodyOf = (c: WebCard) => [plain(c.body), ...(c.bullets ?? []).map((b) => `· ${b}`)].filter(Boolean).join(" ");

/**
 * A feed card of any kind: verse → verse card; word, tafsir, course, maqasid, mutashabihat, wiki, lemma, dua, article, date,
 * surah → text card (its kind label as kicker); hadith, dua → quotation; name → name card; quiz → quiz card with its answer.
 * Null when the card has nothing to share.
 */
export function specForCard(c: ShareCtx, card: WebCard): ShareSpec | null {
  const T = c.texts;
  if (card.kind === "verse" && card.verse) return specForVerse(c, card.verse, card.votd ? T.share.verseOfDay : undefined);
  if (!card.title && !card.body && !card.verse) return null;

  const link = card.href ? `${site(c)}${card.href}` : card.verse ? verseLink(c, card.verse) : site(c);
  const arabic = card.arabic ?? card.verse?.arabic;
  const verseSource = card.verse ? `Quran ${card.verse.key}` : undefined;
  const label = card.eyebrow || topicLabel(T, card.topic);
  const messageOf = (source?: string) => [card.title, card.body && clip(plain(card.body), 300), source && `— ${source}`].filter(Boolean).join("\n");
  const text = (kicker: string, over: Partial<Extract<ShareCard, { t: "text" }>> & { source?: string } = {}): ShareSpec => ({
    link, message: messageOf(over.source ?? card.source), seed: card.id,
    card: { t: "text", kicker, seed: `kn:${card.kind}`, arabic, title: card.title, body: bodyOf(card), source: card.source, ...over },
  });

  switch (card.kind) {
    case "quiz": {
      const q = card.quiz;
      if (!q) return text(T.know.exam);
      return {
        link, seed: card.id,
        message: `${card.title}\n${q.options.map((o) => `· ${o}`).join("\n")}\n\n${T.tpl.answer}: ${q.options[q.answer] ?? ""}`,
        card: { t: "quiz", kicker: `${T.tpl.quiz} · ${T.know.exam}`, question: card.title, arabic: card.arabic, options: q.options, answer: q.answer, explain: q.explain },
      };
    }
    case "name": {
      if (!card.arabic) return text(T.share.nameOfAllah);
      return {
        link: `${site(c)}/islam/names`, seed: `name:${card.title}`,
        message: `${card.arabic} – ${card.title}: ${clip(plain(card.body), 160)}`,
        card: { t: "name", kicker: T.share.nameOfAllah, arabic: card.arabic, latin: card.title, meaning: clip(plain(card.body), 160) },
      };
    }
    case "hadith": {
      const ref = [card.title && card.title !== label ? card.title : "", card.source].filter(Boolean).join(" · ");
      return {
        link, seed: card.id,
        message: `${card.body ? `${clip(plain(card.body), 400)}\n` : ""}— ${ref || card.source}`,
        card: { t: "text", kicker: label || T.share.hadith, seed: "hadith", arabic, body: bodyOf(card), source: ref || undefined, quote: true },
      };
    }
    case "dua":
      // the dua is a quotation; its title is the source line (the app's libSpec)
      return text(T.share.dua, { title: undefined, source: card.title, quote: true });
    case "word": {
      const w = card.word;
      if (!w) return text(T.feed.wordTitle);
      return {
        link, seed: card.id,
        message: `${w.ar} – ${w.tr}: ${w.tl}`,
        card: { t: "text", kicker: T.feed.wordTitle, seed: "kn:word", arabic: w.ar, title: w.tr, body: w.tl, source: card.verse ? `${card.verse.chapter} · ${card.verse.key}` : card.source },
      };
    }
    case "tafsir": return text(T.tpl.tafsir);
    case "course": return text(T.know.course, { source: verseSource ?? card.eyebrow ?? card.source });
    case "maqasid": return text(T.know.tadabbur, { source: verseSource ?? card.eyebrow ?? card.source });
    case "lemma": return text(card.eyebrow || T.know.arabicWord);
    case "date": return text(T.share.calendar, { arabic: undefined });
    case "surah": return text(T.feed.surah);
    case "wiki":
    case "mutashabihat":
    case "article":
    default:
      return text(label);
  }
}
