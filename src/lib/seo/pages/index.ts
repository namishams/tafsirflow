import type { PageSeo } from "../types";
import de from "./de.json"; import en from "./en.json"; import ar from "./ar.json"; import tr from "./tr.json"; import ur from "./ur.json"; import fa from "./fa.json";
import ps from "./ps.json"; import fr from "./fr.json"; import es from "./es.json"; import id from "./id.json"; import ms from "./ms.json"; import bn from "./bn.json";
import ru from "./ru.json"; import zh from "./zh.json";

const ALL: Record<string, Record<string, PageSeo>> = { de, en, ar, tr, ur, fa, ps, fr, es, id, ms, bn, ru, zh };

// localized title/description for a public route (path without locale prefix); undefined = the page keeps its own
export const pageSeo = (locale: string, path: string): PageSeo | undefined => ALL[locale]?.[path];
