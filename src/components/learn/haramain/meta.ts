// SEO texts for the /haramain pages (server-safe, no hooks). Course and guide texts come from the app's own tables.
import { UI } from "@/lib/learn/haramain/content";
import { HARAMAIN_COURSE } from "@/lib/learn/haramain/lessons";
import { G } from "@/lib/learn/haramain/guide";
import { CERT, SUFFIX, cut, lessonMeta, pk } from "@/components/learn/coursekit/meta";

export function metaFor(locale: string, page: "home" | "certificate" | "guide" | "lesson", id?: string): { title: string; description: string } | null {
  if (page === "lesson") {
    const l = HARAMAIN_COURSE.lessons.find((x) => x.id === id);
    return l ? lessonMeta(l, HARAMAIN_COURSE.title, locale) : null;
  }
  if (page === "certificate") return { title: `${pk(CERT, locale)} – ${pk(HARAMAIN_COURSE.title, locale)}${SUFFIX}`, description: cut(pk(UI.lead, locale)) };
  if (page === "guide") return { title: `${pk(G.title, locale)}${SUFFIX}`, description: cut(pk(G.lead, locale)) };
  return { title: `${pk(UI.title, locale)}${SUFFIX}`, description: cut(pk(UI.lead, locale)) };
}
