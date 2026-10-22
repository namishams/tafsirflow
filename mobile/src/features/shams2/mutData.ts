import { bare } from "@/features/shams/memory";
import type { VWord } from "@/features/srs/verse";
import type { Review, SourceRef } from "./sources";

// Mutashābihāt al-alfāẓ: verses whose wording is almost the same, the classic stumbling stones of every ḥāfiẓ.
// Only verse keys are listed here; the text always comes from the Quran API, and the differing words are found by
// comparing the words of the verses (no hand-typed Quran text). The topic lines are short orientation only.
// The selection follows well-known examples of the classical mutashābih literature and is marked for scholar review.

export type MutGroup = { id: string; keys: string[]; topic: { de: string; en: string; ar: string } };

export const MUT_SOURCES: SourceRef[] = ["kirmani", "sakhawi", "ibnMunadi"];
export const MUT_REVIEW: Review = { status: "draft" };

export const MUT_GROUPS: MutGroup[] = [
  { id: "baqara-48-123", keys: ["2:48", "2:123"], topic: { de: "Der Tag, an dem keine Seele für eine andere eintritt: Reihenfolge von Fürsprache und Lösegeld", en: "The Day no soul avails another: order of intercession and ransom", ar: "يوم لا تجزي نفس عن نفس: ترتيب الشفاعة والعدل" } },
  { id: "pharaoh", keys: ["2:49", "7:141", "14:6"], topic: { de: "Rettung vor dem Volk Pharaos: die Verben für das Töten der Söhne", en: "Rescue from Pharaoh's people: the verbs for killing the sons", ar: "النجاة من آل فرعون: أفعال قتل الأبناء" } },
  { id: "town", keys: ["2:58", "7:161"], topic: { de: "Die Kinder Israels und die Stadt: Eintreten, Essen, Vergebung", en: "The Children of Israel and the town: entering, eating, forgiveness", ar: "بنو إسرائيل والقرية: الدخول والأكل والمغفرة" } },
  { id: "town-change", keys: ["2:59", "7:162"], topic: { de: "Die Ungerechten vertauschten das Wort", en: "The wrongdoers changed the word", ar: "تبديل الذين ظلموا القول" } },
  { id: "believers-sabians", keys: ["2:62", "5:69", "22:17"], topic: { de: "Die Glaubenden, die Juden, die Christen und die Sabier: Reihenfolge", en: "Believers, Jews, Christians and Sabians: the order", ar: "الذين آمنوا والذين هادوا والنصارى والصابئون: الترتيب" } },
  { id: "adam-garden", keys: ["2:35", "7:19"], topic: { de: "Adam und seine Frau im Garten: „esst“", en: "Adam and his wife in the Garden: \"eat\"", ar: "آدم وزوجه في الجنة: الأمر بالأكل" } },
  { id: "knowledge-came", keys: ["2:120", "2:145"], topic: { de: "Nachdem das Wissen zu dir gekommen ist", en: "After the knowledge has come to you", ar: "بعد ما جاءك من العلم" } },
  { id: "we-believe", keys: ["2:136", "3:84"], topic: { de: "„Wir glauben an Allah und an das, was herabgesandt wurde“", en: "\"We believe in Allah and what was sent down\"", ar: "آمنا بالله وما أنزل" } },
  { id: "forbidden-food", keys: ["2:173", "5:3", "6:145", "16:115"], topic: { de: "Verbotene Speisen", en: "Forbidden foods", ar: "المحرمات من الطعام" } },
  { id: "glad-tidings", keys: ["3:126", "8:10"], topic: { de: "Die Engelshilfe als frohe Botschaft", en: "The help of the angels as glad tidings", ar: "المدد بالملائكة بشرى" } },
  { id: "provide-children", keys: ["6:151", "17:31"], topic: { de: "Tötet eure Kinder nicht: „Wir versorgen euch und sie“", en: "Do not kill your children: \"We provide for you and them\"", ar: "لا تقتلوا أولادكم: نحن نرزقكم وإياهم" } },
  { id: "creator", keys: ["6:102", "40:62"], topic: { de: "„Das ist Allah, euer Herr“: Reihenfolge der Satzteile", en: "\"That is Allah, your Lord\": order of the clauses", ar: "ذلكم الله ربكم: ترتيب الجمل" } },
  { id: "worldly-life", keys: ["6:32", "29:64"], topic: { de: "Das diesseitige Leben: Spiel und Zerstreuung", en: "The worldly life: play and amusement", ar: "الحياة الدنيا لعب ولهو" } },
  { id: "prophets-7", keys: ["7:59", "7:65", "7:73", "7:85"], topic: { de: "Nūḥ, Hūd, Ṣāliḥ, Šuʿaib in al-Aʿrāf: „Dient Allah“", en: "Nuh, Hud, Salih, Shu'ayb in al-A'raf: \"Worship Allah\"", ar: "نوح وهود وصالح وشعيب في الأعراف: اعبدوا الله" } },
  { id: "prophets-11", keys: ["11:50", "11:61", "11:84"], topic: { de: "Hūd, Ṣāliḥ, Šuʿaib in Sūrat Hūd", en: "Hud, Salih, Shu'ayb in Surat Hud", ar: "هود وصالح وشعيب في سورة هود" } },
  { id: "prophets-26", keys: ["26:109", "26:127", "26:145", "26:164", "26:180"], topic: { de: "aš-Šuʿarāʾ: „Ich verlange keinen Lohn von euch“", en: "ash-Shu'ara: \"I ask no reward of you\"", ar: "الشعراء: وما أسألكم عليه من أجر" } },
  { id: "challenge", keys: ["2:23", "10:38", "11:13"], topic: { de: "Die Herausforderung: eine Sure oder zehn Suren", en: "The challenge: one surah or ten surahs", ar: "التحدي: بسورة أو بعشر سور" } },
  { id: "saffat", keys: ["37:80", "37:110", "37:121", "37:131"], topic: { de: "aṣ-Ṣāffāt: „So vergelten Wir denen, die Gutes tun“", en: "as-Saffat: \"Thus do We reward the doers of good\"", ar: "الصافات: كذلك نجزي المحسنين" } },
  { id: "tasbih", keys: ["56:74", "69:52", "87:1"], topic: { de: "Preise den Namen deines Herrn", en: "Glorify the name of your Lord", ar: "التسبيح باسم الرب" } },
  { id: "kafirun", keys: ["109:2", "109:4"], topic: { de: "al-Kāfirūn: Gegenwart und Vergangenheit", en: "al-Kafirun: present and past", ar: "الكافرون: الحاضر والماضي" } },
  { id: "refuge", keys: ["113:1", "114:1"], topic: { de: "Die Zufluchtsuren: Herr der Morgendämmerung, Herr der Menschen", en: "The two surahs of refuge: Lord of daybreak, Lord of mankind", ar: "المعوذتان: رب الفلق ورب الناس" } },
];

/** positions of the words that are NOT shared with the most similar other verse of the group (LCS on bare letters) */
export function distinctPositions(words: VWord[], others: VWord[][]): number[] {
  const a = words.map((w) => bare(w.text));
  let best: Set<number> | null = null;
  for (const o of others) {
    const b = o.map((w) => bare(w.text));
    const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const shared = new Set<number>();
    for (let i = 0, j = 0; i < a.length && j < b.length;) {
      if (a[i] === b[j]) { shared.add(i); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
    }
    if (!best || shared.size > best.size) best = shared;
  }
  const out = words.map((w, i) => (best?.has(i) ? -1 : w.position)).filter((p) => p >= 0);
  return out.length ? out : words.slice(-2).map((w) => w.position);
}

// ---------- Shams 3.0: due groups and automatically found pairs ----------
export { MUT_CANDIDATES } from "./mutCandidates";
export const MUT_DUE_DAYS = 14;
type MutAnswers = Record<string, { ok: number; miss: number; last: number }>;
/** groups with a memorised verse that are due: confused more often than answered right (summed over the group), or
 *  last practised `days` or more days ago (never practised counts as due); the most confused first */
export function dueMutGroups(groups: MutGroup[], mut: MutAnswers, known: { has: (k: string) => boolean }, now = Date.now(), days = MUT_DUE_DAYS): MutGroup[] {
  const out: { g: MutGroup; worse: number; last: number }[] = [];
  for (const g of groups) {
    if (!g.keys.some((k) => known.has(k))) continue;
    let ok = 0, miss = 0, last = 0;
    for (const k of g.keys) { const m = mut[k]; if (!m) continue; ok += m.ok || 0; miss += m.miss || 0; last = Math.max(last, m.last || 0); }
    if (miss > ok || now - last >= days * 86_400_000) out.push({ g, worse: miss - ok, last });
  }
  return out.sort((a, b) => b.worse - a.worse || a.last - b.last).map((x) => x.g);
}
/** an automatically found pair as a group for study and drill (marked as not reviewed by its id prefix "auto-") */
export function candidateGroup(a: string, b: string, topic: MutGroup["topic"]): MutGroup {
  return { id: `auto-${a}-${b}`, keys: [a, b], topic };
}
export const isCandidate = (g: MutGroup) => g.id.startsWith("auto-");
