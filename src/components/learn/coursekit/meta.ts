// Server-safe SEO helpers for the course pages (no hooks): pick a text in the page locale (English fallback), cut a
// description, and build the Course JSON-LD. Used by src/components/learn/{abrahamic,haramain}/meta.ts.
import type { L, Lesson } from "@/lib/learn/abrahamic/core";
import { PUBLIC_SITE, abs } from "@/lib/site";

export const SUFFIX = " | Quran Masterclass";
export const pk = (t: L | undefined, locale: string): string => (t ? ((t as Record<string, string | undefined>)[locale] ?? t.en) : "");
export function cut(text: string, max = 158): string {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const c = s.slice(0, max - 1);
  return `${c.slice(0, Math.max(c.lastIndexOf(" "), max - 30))} …`;
}
export const CERT: L = { en: "Certificate", de: "Zertifikat", ar: "الشهادة" };

export function lessonMeta(lesson: Lesson, course: L, locale: string) {
  return { title: `${pk(lesson.title, locale)} – ${pk(course, locale)}${SUFFIX}`, description: cut(pk(lesson.text, locale)) };
}

export function courseJsonLd(locale: string, path: string, name: string, description: string, lessons: Lesson[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url: abs(`/${locale}${path}`),
    inLanguage: locale,
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "Quran Masterclass", sameAs: PUBLIC_SITE },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: `${lessons.length} lessons` },
    syllabusSections: lessons.map((l) => ({ "@type": "Syllabus", name: pk(l.title, locale) })),
  };
}
