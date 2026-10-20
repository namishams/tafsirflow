// Everything the completeness agent built for the app, ready to place on the tabs and in the reader.
// Props are documented on each component; see mobile/docs/website-parity.md for the overview.
export { SearchView } from "./SearchView";
export { AssistantChat, AssistantSuggestions } from "./AssistantChat";
export { FeedbackBoard, reportProblem, FEEDBACK_CATS, type FeedbackCat, type FeedbackDraft } from "./FeedbackBoard";
export { SocialBar, CommentsSheet, compact as compactNumber } from "./SocialBar";
export { MyLikes } from "./MyLikes";
export { ReciteCheck } from "./ReciteCheck";
export { Onboarding, shouldOnboard, pathFor } from "./Onboarding";
export { KidsToggle } from "./KidsToggle";
export { useKids, readKids, setKids, KIDS_KEY, KIDS_PALETTE } from "./kids";
export { useSiteConfig, loadSiteConfig, type SiteConfig } from "./config";
export { Markdown } from "./Markdown";
export { NotFoundView } from "./NotFound";
export { appHref, openLink, openVerse, openWebsite } from "./links";
export { Featured, safeHijriMonth } from "./widgets/Featured";
export { Announcement } from "./widgets/Announcement";
export { TrustStrip, TrustLine } from "./widgets/TrustStrip";
export { WhyQuran } from "./widgets/WhyQuran";
export { Skyline, MadeInDubai, CountUp, Reveal } from "./widgets/Signature";
export { SiteFooter } from "./widgets/SiteFooter";
export { ProTeaser } from "./widgets/ProTeaser";
export { HomeHero, HomeCourses, HomeWhy, HomePaths, HomeMethod, HomeFeatures, HomeMapTeaser, HomePopular, HomeKidsTajweed, HomeGlossary, HomeTools, HomeFaq, HomeFinalCta } from "./widgets/Home";
export { HomeStar, StarGlyph, Rosette, HmCard, WarmSection, MarbleHero, QuranQuote, Arch, IllumFrame, QKey, useVerseText } from "./art";
