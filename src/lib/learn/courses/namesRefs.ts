// Website addition (no app counterpart): the pure part of ./names.ts (verse references of the 99 names, name keys, lesson ids),
// split off so server code (the web feed's resolver) can use it without importing React hooks. ./names.ts re-exports it.
import type { AllahName } from "@/lib/learn/prophet/stories";

// The Names of Allah course: the 99 names and their meanings come from the library chapter "names" in the user's
// language (the same vetted list as the website); this table only adds where a name (or the very word as an attribute
// of Allah) occurs in the Quran, by verse key. Names known only from the Sunnah have no entry.
const REFS: Record<string, string[]> = {
  rahman: ["1:3", "59:22"], rahim: ["1:3", "59:22"], malik: ["59:23", "20:114"], quddus: ["59:23", "62:1"], salam: ["59:23"], mumin: ["59:23"],
  muhaymin: ["59:23"], aziz: ["59:23", "3:6"], jabbar: ["59:23"], mutakabbir: ["59:23"], khaliq: ["59:24", "13:16"], bari: ["59:24"], musawwir: ["59:24"],
  ghaffar: ["20:82", "71:10"], qahhar: ["13:16", "38:65"], wahhab: ["3:8", "38:9"], razzaq: ["51:58"], fattah: ["34:26"], alim: ["2:32", "2:29"],
  qabid: ["2:245"], basit: ["2:245"], rafi: ["3:55"], muizz: ["3:26"], mudhill: ["3:26"], sami: ["2:127", "42:11"], basir: ["42:11", "4:58"],
  hakam: ["6:114"], latif: ["6:103", "67:14"], khabir: ["6:18", "67:14"], halim: ["2:225"], azim: ["2:255"], ghafur: ["2:173"], shakur: ["35:30", "64:17"],
  ali: ["2:255"], kabir: ["13:9", "22:62"], hafiz: ["11:57"], muqit: ["4:85"], hasib: ["4:6", "4:86"], karim: ["27:40", "82:6"], raqib: ["4:1", "5:117"],
  mujib: ["11:61"], wasi: ["2:115", "2:268"], hakim: ["2:32"], wadud: ["11:90", "85:14"], majid: ["11:73"], baith: ["22:7"], shahid: ["4:79", "5:117"],
  haqq: ["22:6", "24:25"], wakil: ["3:173", "4:81"], qawi: ["22:40", "42:19"], matin: ["51:58"], wali: ["42:9", "42:28"], hamid: ["14:8", "31:12"],
  muhsi: ["19:94"], mubdi: ["85:13"], muid: ["85:13"], muhyi: ["30:50", "41:39"], mumit: ["15:23", "57:2"], hayy: ["2:255", "3:2"], qayyum: ["2:255", "3:2"],
  wahid: ["13:16"], ahad: ["112:1"], samad: ["112:2"], qadir: ["6:65"], muqtadir: ["54:42", "54:55"], awwal: ["57:3"], akhir: ["57:3"], zahir: ["57:3"], batin: ["57:3"],
  wali2: ["13:11"], mutaali: ["13:9"], barr: ["52:28"], tawwab: ["2:37", "2:128"], muntaqim: ["32:22", "3:4"], afuw: ["4:43", "4:99"], rauf: ["2:143"],
  malikulmulk: ["3:26"], dhuljalalwalikram: ["55:27", "55:78"], muqsit: ["3:18"], jami: ["3:9"], ghani: ["35:15"], mughni: ["9:28"], nur: ["24:35"],
  hadi: ["22:54", "25:31"], badi: ["2:117", "6:101"], baqi: ["55:27"], warith: ["15:23", "21:89"],
};
/** "Al-Mu'min" -> "mumin", "Dhul-Jalali wal-Ikram" -> "dhuljalalwalikram" */
export function nameKey(latin: string): string {
  const s = latin.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[ʿʾ'’`‘]/g, "");
  return s.replace(/^(al|ar|as|ash|at|az|ad|adh|an|al)[-\s]/, "").replace(/[^a-z]/g, "")
    .replace(/^dhuljalal.*/, "dhuljalalwalikram").replace(/^malik(ul|al)mulk$/, "malikulmulk").replace(/^maalik.*mulk$/, "malikulmulk");
}
/** verse keys for the name at index i (the second "al-Wali" in the list, the Governor, has its own entry) */
export function nameRefs(names: AllahName[], i: number): string[] {
  const k = nameKey(names[i]?.latin ?? "");
  if (k === "wali" && names.findIndex((n) => nameKey(n.latin) === "wali") !== i) return REFS.wali2;
  if (k === "malik" && /mulk/i.test(names[i]?.latin ?? "")) return REFS.malikulmulk;
  return REFS[k] ?? [];
}

export const NAMES_COUNT = 99;
export const NAMES_FREE = 3;
export const nameLessonId = (i: number) => `n${String(i + 1).padStart(2, "0")}`;
