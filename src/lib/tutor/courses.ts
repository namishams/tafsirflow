import type { Course } from "../learn/courses/types";
import { SEERAH } from "../learn/courses/content/seerah";
import { PROPHETS } from "../learn/courses/content/prophets";
import { ULUM } from "../learn/courses/content/ulum";
import { HADITH_SCI } from "../learn/courses/content/hadithSci";
import { AQIDAH } from "../learn/courses/content/aqidah";
import { FIQH } from "../learn/courses/content/fiqh";
import { AKHLAQ } from "../learn/courses/content/akhlaq";
import { ADHKAR } from "../learn/courses/content/adhkar";
import { RAMADAN } from "../learn/courses/content/ramadan";
import { HAJJ } from "../learn/courses/content/hajj";
import { TAJWEED_DEEP } from "../learn/courses/content/tajweedDeep";

// The academy courses for server code (the tutor's library and the onboarding path). courses/index.ts also holds the
// 99-names course, whose lessons come from a React hook (names.ts) – server code must not import it. The names are in
// the library chapter "names" (corpus.ts). Same order as COURSES in courses/index.ts.
export const SERVER_COURSES: Course[] = [SEERAH, PROPHETS, ULUM, HADITH_SCI, AQIDAH, FIQH, AKHLAQ, ADHKAR, RAMADAN, HAJJ, TAJWEED_DEEP];
