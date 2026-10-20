// Arabic reciter biographies (/ar/reciters): the parts are keyed by slug; a missing slug falls back to English (see bioText)
import type { ReciterBioText } from "./types";
import p1 from "./ar1";
import p2 from "./ar2";
import p3 from "./ar3";
import p4 from "./ar4";
import p5 from "./ar5";
import p6 from "./ar6";
import p7 from "./ar7";
import p8 from "./ar8";
import p9 from "./ar9";
import p10 from "./ar10";

const AR_BIOS: Record<string, ReciterBioText> = { ...p1, ...p2, ...p3, ...p4, ...p5, ...p6, ...p7, ...p8, ...p9, ...p10 };
export default AR_BIOS;
