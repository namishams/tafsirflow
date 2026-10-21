// SEO texts for the /abrahamic pages (server-safe, no hooks). Course texts come from the app's own tables.
import { UI } from "@/lib/learn/abrahamic/content";
import { ABRAHAMIC_COURSE } from "@/lib/learn/abrahamic/lessons";
import { CERT, SUFFIX, cut, lessonMeta, pk } from "@/components/learn/coursekit/meta";

export function metaFor(locale: string, page: "home" | "certificate" | "lesson", id?: string): { title: string; description: string } | null {
  if (page === "lesson") {
    const l = ABRAHAMIC_COURSE.lessons.find((x) => x.id === id);
    return l ? lessonMeta(l, ABRAHAMIC_COURSE.title, locale) : null;
  }
  if (page === "certificate") return { title: `${pk(CERT, locale)} – ${pk(ABRAHAMIC_COURSE.title, locale)}${SUFFIX}`, description: cut(pk(UI.lead, locale)) };
  return { title: `${pk(UI.title, locale)}${SUFFIX}`, description: cut(pk(UI.lead, locale)) };
}
