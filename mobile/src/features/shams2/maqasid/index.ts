import type { Maqasid, Section } from "./types";
import { M_AMMA1 } from "./m-amma1";
import { M_AMMA2 } from "./m-amma2";
import { M_BAQARA } from "./m-baqara";
import { M_LOVED } from "./m-loved";
import { M_CARDS1 } from "./m-cards1";
import { M_CARDS2 } from "./m-cards2";

export type { Maqasid, Section, L, LL } from "./types";

const ALL = new Map<number, Maqasid>();
for (const m of [...M_AMMA1, ...M_AMMA2, ...M_BAQARA, ...M_LOVED, ...M_CARDS1, ...M_CARDS2]) ALL.set(m.s, m);

export const maqasidOf = (s: number): Maqasid | null => ALL.get(s) ?? null;
export const hasMaqasid = (s: number) => ALL.has(s);
/** the section that holds a verse */
export const sectionOf = (s: number, v: number): Section | null => ALL.get(s)?.sections.find((x) => v >= x.from && v <= x.to) ?? null;
/** surahs whose sections carry lessons (detailed tadabbur) */
export const isDetailed = (s: number) => !!ALL.get(s)?.sections.some((x) => x.lessons);
