"use client";
import { createContext, useContext, type ReactNode } from "react";
import { FEED_TEXTS_EN, type FeedTexts } from "./texts";

// The feed texts for the client components (provided by the page: <FeedTextsProvider texts={await loadFeedTexts(locale)}>)
const Ctx = createContext<FeedTexts>(FEED_TEXTS_EN);
export function FeedTextsProvider({ texts, children }: { texts: FeedTexts; children: ReactNode }) {
  return <Ctx.Provider value={texts}>{children}</Ctx.Provider>;
}
export const useFeedTexts = () => useContext(Ctx);
