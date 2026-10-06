// Supplications that appear in the Quran, grouped by theme. Only verse keys are stored; the text comes from the Quran sources.
// Duas from the Sunnah are deliberately not included until a scholar has reviewed the texts and references.
export const DUA_GROUPS: { id: string; verses: string[] }[] = [
  { id: "guidance", verses: ["1:6", "3:8", "2:128", "17:80", "18:10"] },
  { id: "knowledge", verses: ["20:114", "20:25", "20:26", "20:27", "20:28", "26:83"] },
  { id: "forgiveness", verses: ["2:286", "3:16", "3:147", "7:23", "21:87", "23:118", "28:16", "59:10"] },
  { id: "family", verses: ["25:74", "46:15", "14:40", "14:41", "17:24", "71:28", "3:38"] },
  { id: "patience", verses: ["2:250", "7:126", "21:83"] },
  { id: "protection", verses: ["23:97", "23:98", "113:1", "114:1", "11:47", "10:85"] },
  { id: "thanks", verses: ["27:19", "28:24", "2:201", "12:101", "66:8"] },
];
