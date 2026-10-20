// The Arabic course speaks German, Arabic and English on the website (ArabicHome.tsx: de, ar, otherwise en); the app
// follows the same rule so both show the same course text.
export type CourseLang = "de" | "en" | "ar";
export const courseLang = (l: string): CourseLang => (l === "de" ? "de" : l === "ar" ? "ar" : "en");
