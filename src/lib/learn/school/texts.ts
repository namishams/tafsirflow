// mirrors mobile/src/features/school/texts.ts (copied for the website; keep both in step)
import { useLang } from "@/lib/learn/i18n";
import { moduleText } from "@/lib/learn/i18n";
import { SCHOOL_TABLE, type T } from "./textTables";

export { schoolTextFor } from "./textTables";
export type SchoolKey = keyof T;
export function useSchoolT() {
  const { lang } = useLang();
  const d = moduleText("school", SCHOOL_TABLE, lang);
  return (k: SchoolKey, p?: Record<string, string | number>) => (p ? d[k].replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : d[k]);
}
