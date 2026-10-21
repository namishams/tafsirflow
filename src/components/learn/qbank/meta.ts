// SEO texts of the examination centre's pages (server-safe), from the centre's own texts in all fourteen languages
// (src/lib/learn/qbank/text.ts). The personal pages (session, mock exam, statistics, bookmarks) are noindex.
import { BANK_COUNT } from "@/lib/learn/qbank/bankVersion";
import { subjectMeta } from "@/lib/learn/qbank/bank";
import { qbankTextFor } from "@/lib/learn/qbank/textTables";

export type QbankPage = "home" | "subject" | "session" | "mock" | "stats" | "bookmarks";
const SUFFIX = " | Quran Masterclass";

export function qbankMeta(locale: string, page: QbankPage, subject?: string): { title: string; description: string } {
  const qt = qbankTextFor(locale);
  const lead = qt("entryLead", { n: BANK_COUNT });
  switch (page) {
    case "subject": {
      const m = subject ? subjectMeta(subject) : undefined;
      const name = m ? qt(`s_${m.id}`) : qt("subjects");
      return { title: `${name} – ${qt("title")}${SUFFIX}`, description: `${qt("title")} (${qt("titleTr")}): ${name}. ${qt("lead")}` };
    }
    case "session": return { title: `${qt("m_practice")} – ${qt("title")}${SUFFIX}`, description: lead };
    case "mock": return { title: `${qt("mockTitle")} – ${qt("title")}${SUFFIX}`, description: lead };
    case "stats": return { title: `${qt("statsTitle")} – ${qt("title")}${SUFFIX}`, description: lead };
    case "bookmarks": return { title: `${qt("m_bookmarks")} – ${qt("title")}${SUFFIX}`, description: lead };
    default: return { title: `${qt("title")} – ${qt("titleTr")}${SUFFIX}`, description: `${qt("lead")} ${lead}` };
  }
}
