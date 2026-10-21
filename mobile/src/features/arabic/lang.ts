import { LANGS, type Lang } from "@/web/arabic";

// The course pages (ArabicHome.tsx, ArabicLesson.tsx, PracticeAlphabet.tsx and /arabic on the website) speak every
// site language: the app language when the course texts have it, otherwise English (website: `loc in T ? loc : "en"`).
export type PageLang = Lang;
export const pageLang = (l: string): PageLang => ((LANGS as readonly string[]).includes(l) ? (l as Lang) : "en");

// The lesson titles on the Today tab and in the learning journey follow the website's TodayDashboard.tsx
// (de, ar, otherwise en), so both show the same line there.
export type CourseLang = "de" | "en" | "ar";
export const courseLang = (l: string): CourseLang => (l === "de" ? "de" : l === "ar" ? "ar" : "en");
