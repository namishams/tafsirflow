import type { FeedTexts } from "@/lib/feedWeb/texts";
import type { WebCard, WebTopic } from "@/lib/feedWeb/types";
import type { IconName } from "./icons";

// How a card kind looks in headers: its icon (mobile/src/features/feed/LibraryPost.tsx KIND_ICON, KnowledgePost.tsx ICON)
// and its label (topic label for library posts, the knowledge label for course / quiz / name / tadabbur posts).

export function cardIcon(c: WebCard): IconName {
  switch (c.kind) {
    case "verse": case "word": return "book";
    case "tafsir": return "book";
    case "hadith": return "note";
    case "dua": return "hands";
    case "lemma": return "cap";
    case "name": return "starBig";
    case "quiz": return "trophy";
    case "course": return "cap";
    case "maqasid": case "mutashabihat": return "book";
    case "date": return "calendar";
    case "surah": return "book";
    case "wiki":
      return c.topic === "holy" ? "mosque" : c.topic === "art" ? "pen" : c.topic === "scholars" ? "user" : c.topic === "prayer" ? "mosque" : c.topic === "seerah" ? "moon" : c.topic === "history" ? "clock" : "book";
    default: return "moon";
  }
}

export function topicLabel(T: FeedTexts, t: "all" | "stories" | WebTopic): string {
  const f = T.feed;
  switch (t) {
    case "all": return f.topicAll;
    case "stories": return f.topicStories;
    case "verses": return T.prophet.catVerses;
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

/** the line above the title of a post (the knowledge label, else the topic) */
export function kindLabel(T: FeedTexts, c: WebCard): string {
  switch (c.kind) {
    case "course": case "name": return T.know.course;
    case "maqasid": case "mutashabihat": return T.know.tadabbur;
    case "quiz": return T.know.exam;
    case "verse": return c.votd ? T.feed.votd : T.feed.verseLabel;
    case "word": return T.feed.wordTitle;
    case "date": return T.share.calendar;
    default: return topicLabel(T, c.topic);
  }
}

/** knowledge posts get their own card with a call to action; the rest are library posts (text card, image post) */
export const isKnowledge = (c: WebCard) => c.kind === "course" || c.kind === "name" || c.kind === "quiz" || c.kind === "maqasid" || c.kind === "mutashabihat";
