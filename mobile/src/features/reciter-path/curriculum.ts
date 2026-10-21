// Reciter Path: the structure of the course (levels, units, examples, tests). No Quran text is written here: every
// example is a verse key plus the position of the word in Quran.com's word data, and the screens render the words
// from that data (getVerses). Explanations live in content.ts, interface texts in texts.ts.

/** a word in the mushaf data: "112:1" and the 1-based word position (char_type "word", end markers not counted) */
export type WordRef = { key: string; word: number };
/** "tap every word in this verse that has <rule>"; answer = all matching word positions */
export type TapItem = { key: string; rule: RuleId; answer: number[] };

export type RuleId =
  | "makharij" | "sifat" | "harakat" | "shadda" | "sukun"
  | "izhar" | "idgham" | "idghamNoGhunnah" | "iqlab" | "ikhfa"
  | "idghamShafawi" | "ikhfaShafawi" | "izharShafawi" | "ghunnah"
  | "maddTabii" | "maddMuttasil" | "maddMunfasil" | "maddLazim" | "maddArid"
  | "qalqalah" | "lamShamsiyyah" | "lamQamariyyah" | "lamAllahHeavy" | "lamAllahLight"
  | "raHeavy" | "raLight" | "waqf";

export type Unit = {
  id: string;
  level: number;
  /** rules taught in this unit (names and short descriptions in content.ts) */
  rules: RuleId[];
  /** model examples, rendered from the word data, played with the chosen reciter */
  examples: { ref: WordRef; rule: RuleId }[];
  /** "tap the word" test items of the unit */
  tap: TapItem[];
  /** applied units: whole verses to recite (surah, from, to) */
  verses?: { surah: number; from: number; to: number }[];
};

export type Level = { n: number; units: Unit[] };

const ex = (key: string, word: number, rule: RuleId) => ({ ref: { key, word }, rule });

export const LEVELS: Level[] = [
  {
    n: 1,
    units: [
      { id: "1-1", level: 1, rules: ["makharij"], examples: [ex("112:1", 4, "makharij"), ex("113:1", 4, "makharij"), ex("114:1", 4, "makharij")], tap: [] },
      { id: "1-2", level: 1, rules: ["sifat"], examples: [ex("113:1", 4, "sifat"), ex("114:4", 3, "sifat"), ex("112:2", 2, "sifat")], tap: [] },
      { id: "1-3", level: 1, rules: ["harakat", "sukun", "shadda"], examples: [ex("112:1", 1, "sukun"), ex("1:1", 2, "shadda"), ex("114:1", 4, "shadda"), ex("1:4", 1, "harakat")], tap: [] },
    ],
  },
  {
    n: 2,
    units: [
      { id: "2-1", level: 2, rules: ["izhar"], examples: [ex("1:7", 3, "izhar"), ex("106:4", 6, "izhar"), ex("99:7", 4, "izhar"), ex("112:4", 4, "izhar")], tap: [{ key: "106:4", rule: "izhar", answer: [6] }] },
      { id: "2-2", level: 2, rules: ["idgham", "idghamNoGhunnah"], examples: [ex("99:7", 1, "idgham"), ex("99:7", 5, "idgham"), ex("104:2", 3, "idgham"), ex("104:1", 1, "idghamNoGhunnah")], tap: [{ key: "99:7", rule: "idgham", answer: [1, 5] }] },
      { id: "2-3", level: 2, rules: ["iqlab", "ikhfa"], examples: [ex("104:4", 2, "iqlab"), ex("106:4", 3, "ikhfa"), ex("105:4", 3, "ikhfa")], tap: [{ key: "104:4", rule: "iqlab", answer: [2] }, { key: "106:4", rule: "ikhfa", answer: [3] }] },
    ],
  },
  {
    n: 3,
    units: [
      { id: "3-1", level: 3, rules: ["idghamShafawi", "ikhfaShafawi", "izharShafawi"], examples: [ex("106:4", 2, "idghamShafawi"), ex("105:4", 1, "ikhfaShafawi"), ex("1:7", 4, "izharShafawi")], tap: [{ key: "106:4", rule: "idghamShafawi", answer: [2, 5] }] },
      { id: "3-2", level: 3, rules: ["ghunnah"], examples: [ex("114:1", 4, "ghunnah"), ex("108:1", 1, "ghunnah")], tap: [{ key: "114:1", rule: "ghunnah", answer: [4] }] },
    ],
  },
  {
    n: 4,
    units: [
      { id: "4-1", level: 4, rules: ["maddTabii"], examples: [ex("1:4", 1, "maddTabii")], tap: [] },
      { id: "4-2", level: 4, rules: ["maddMuttasil", "maddMunfasil"], examples: [ex("110:1", 2, "maddMuttasil"), ex("108:1", 1, "maddMunfasil")], tap: [{ key: "110:1", rule: "maddMuttasil", answer: [2] }] },
      { id: "4-3", level: 4, rules: ["maddLazim", "maddArid"], examples: [ex("1:7", 9, "maddLazim"), ex("1:1", 4, "maddArid"), ex("1:3", 2, "maddArid")], tap: [] },
    ],
  },
  {
    n: 5,
    units: [
      { id: "5-1", level: 5, rules: ["qalqalah"], examples: [ex("112:1", 4, "qalqalah"), ex("113:1", 4, "qalqalah"), ex("112:2", 2, "qalqalah")], tap: [{ key: "112:1", rule: "qalqalah", answer: [1, 4] }, { key: "113:1", rule: "qalqalah", answer: [1, 4] }] },
      { id: "5-2", level: 5, rules: ["lamShamsiyyah", "lamQamariyyah", "lamAllahHeavy", "lamAllahLight"], examples: [ex("1:3", 1, "lamShamsiyyah"), ex("1:2", 1, "lamQamariyyah"), ex("112:1", 3, "lamAllahHeavy"), ex("1:2", 2, "lamAllahLight")], tap: [{ key: "1:7", rule: "lamShamsiyyah", answer: [2, 9] }] },
      { id: "5-3", level: 5, rules: ["raHeavy", "raLight"], examples: [ex("1:2", 3, "raHeavy"), ex("1:3", 2, "raLight"), ex("113:2", 2, "raLight")], tap: [] },
    ],
  },
  {
    n: 6,
    units: [
      { id: "6-1", level: 6, rules: ["waqf"], examples: [ex("1:4", 3, "waqf"), ex("112:2", 2, "waqf"), ex("1:1", 4, "waqf")], tap: [] },
      { id: "6-2", level: 6, rules: [], examples: [], tap: [], verses: [{ surah: 112, from: 1, to: 4 }, { surah: 113, from: 1, to: 5 }, { surah: 114, from: 1, to: 6 }] },
      { id: "6-3", level: 6, rules: [], examples: [], tap: [], verses: [{ surah: 103, from: 1, to: 3 }, { surah: 108, from: 1, to: 3 }, { surah: 105, from: 1, to: 5 }] },
    ],
  },
];

export const ALL_UNITS = LEVELS.flatMap((l) => l.units);
export const unitById = (id: string) => ALL_UNITS.find((u) => u.id === id);

/** Free without Pro: level 1, units 1 and 2, and the test of unit 1 */
export const FREE_UNITS = new Set(["1-1", "1-2"]);
export const FREE_TEST = "1-1";
export const isFreeUnit = (id: string) => FREE_UNITS.has(id);

/** pass mark for unit tests and level exams */
export const PASS = 0.8;

export const verseRef = (key: string) => { const [s, v] = key.split(":").map(Number); return { surah: s, verse: v }; };
