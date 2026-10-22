// mirrors src/lib/learn/shams2/adab/data.ts of the website (identical content; keep both in step)
// The pillar "Adab des Qurʾān-Trägers" (ādāb ḥamalat al-Qurʾān) of the Shams Method – its newest form (Shams 3.0, the
// "v2" mode with the 3.0 additions): the reciter lives what they recite. Daily sunnah etiquette ("halal leben") with
// its status stated honestly and its sources by reference. Pure data, no React, no imports; the app keeps the same file
// in mobile/src/features/shams2/adab/data.ts (keep both in step).
//
// Rules of this file (owner and BLUEPRINT §4):
// - No Qurʾān or hadith text is typed here. Verses only by key (rendered from the Quran API), hadith only by collection
//   and number (rendered from hadith-api / Thaqalayn), duʿāʾs only by id of the existing sunnahDuas data.
//   Hadith `n` is the hadith-api number by which the text is fetched; `cite` is the usual number readers cite (Sahih
//   Muslim differs: 268 in the usual numbering is 616 in the API) – checked against the API's arabicnumber on 22.10.2026.
// - Never a sunnah presented as farḍ; differences between the schools named where they exist.
// - Nothing here says that recitation is invalid or forbidden for anyone who falls short.
// - Content in German (Sie-form) and English; every other language reads the English content (UI texts in ./text.ts).
// - Every text is a draft until a scholar has reviewed it (ADAB_REVIEW.needs_review).

export type L2 = { de: string; en: string };
export type AdabStatus = "fard" | "wajib" | "sunnah" | "mustahabb" | "adab" | "makruh" | "haram";

/** a classical work or a published ruling, cited by name (and link where one exists) */
export type AdabSourceId = keyof typeof ADAB_SOURCES;
export type AdabRef =
  | { k: "verse"; key: string }
  | { k: "hadith"; c: "bukhari" | "muslim" | "abudawud" | "tirmidhi" | "nasai" | "ibnmajah" | "malik"; n: number; cite: string; sunnah: string }
  | { k: "kafi"; book: string; n: number; cite: string; url: string }
  | { k: "dua"; id: string }
  | { k: "src"; id: AdabSourceId };

export type AdabTopicId = "bathroom" | "right" | "food" | "sleep" | "greeting" | "purity" | "mushaf" | "session" | "character" | "halal" | "carrier";
export type AdabItem = {
  id: string;
  topic: AdabTopicId;
  title: L2;
  /** what to do, in plain words */
  practice: L2;
  /** the status of the practice; several when the item joins a recommended act and an obligation, or schools differ */
  status: AdabStatus[];
  /** the honest detail: which part is obligatory, which recommended, where the schools differ */
  note?: L2;
  refs: AdabRef[];
  /** the Jaʿfarī position or narration, shown to readers in Shia mode (and to everyone under "Jaʿfarī") */
  jafari?: { note: L2; refs: AdabRef[] };
  /** the "Für Schwestern" section has the rulings for women on this topic */
  sisters?: boolean;
  /** a route of the app and the website this practice leads to */
  href?: string;
};
export type AdabTopic = { id: AdabTopicId; ar: string; title: L2; lead: L2 };

export const ADAB_REVIEW = { needs_review: true, reviewedBy: null as string | null, version: 1 };

export const ADAB_SOURCES = {
  tibyan: { label: "al-Nawawī, al-Tibyān fī Ādāb Ḥamalat al-Qurʾān", url: "" },
  tibyanCarrier: { label: "al-Nawawī, al-Tibyān fī Ādāb Ḥamalat al-Qurʾān – chapter on the adab of the carrier of the Qurʾān", url: "" },
  tibyanRecite: { label: "al-Nawawī, al-Tibyān fī Ādāb Ḥamalat al-Qurʾān – chapter on the adab of recitation", url: "" },
  tibyanMushaf: { label: "al-Nawawī, al-Tibyān fī Ādāb Ḥamalat al-Qurʾān – chapter on writing the Qurʾān and honouring the muṣḥaf", url: "" },
  ajurri: { label: "al-Ājurrī, Akhlāq Ḥamalat al-Qurʾān", url: "" },
  ghazali: { label: "al-Ghazālī, Iḥyāʾ ʿUlūm al-Dīn – Kitāb Ādāb Tilāwat al-Qurʾān", url: "" },
  nawawiSharh: { label: "al-Nawawī, al-Minhāj Sharḥ Ṣaḥīḥ Muslim (commentary on the hadith cited)", url: "" },
  jazari: { label: "Ibn al-Jazarī, al-Muqaddima al-Jazariyya (on the obligation of tajwīd)", url: "" },
  kafiFadl: { label: "al-Kulaynī, al-Kāfī, vol. 2, Kitāb Faḍl al-Qurʾān (via thaqalayn.net)", url: "https://thaqalayn.net" },
  muwatta15: { label: "Muwaṭṭaʾ Mālik, Book 15 (The Qurʾān), Hadith 1 – the letter to ʿAmr ibn Ḥazm", url: "https://sunnah.com/malik/15/1" },
  muftiOnline: { label: "Mufti Online (Hanafi), via islamqa.org: The reason for entering the toilet with the left foot and exiting with the right", url: "https://islamqa.org/hanafi/muftionline/112330/the-reason-for-entering-the-toilet-with-the-left-foot-and-exiting-with-the-right/" },
  sistani55: { label: "Ayatollah al-Sistani, Islamic Laws, rulings 55–56", url: "https://www.sistani.org/english/book/48/2125/" },
  sistani75: { label: "Ayatollah al-Sistani, Islamic Laws, rulings 75–76", url: "https://www.sistani.org/english/book/48/2127/" },
  sistani316: { label: "Ayatollah al-Sistani, Islamic Laws, rulings 315–318", url: "https://www.sistani.org/english/book/48/2158/" },
  sistani354: { label: "Ayatollah al-Sistani, Islamic Laws, rulings 354–355", url: "https://www.sistani.org/english/book/48/2163/" },
} as const;

const H = (c: Extract<AdabRef, { k: "hadith" }>["c"], n: number, cite: string, sunnah: string): AdabRef => ({ k: "hadith", c, n, cite, sunnah });
const V = (key: string): AdabRef => ({ k: "verse", key });
const D = (id: string): AdabRef => ({ k: "dua", id });
const S = (id: AdabSourceId): AdabRef => ({ k: "src", id });
const KAFI = "Al-Kafi-Volume-2-Kulayni";
const K = (n: number, cite: string, path: string): AdabRef => ({ k: "kafi", book: KAFI, n, cite, url: `https://thaqalayn.net/hadith/${path}` });

export const ADAB_TOPICS: AdabTopic[] = [
  { id: "bathroom", ar: "آداب الخلاء", title: { de: "Das Badezimmer", en: "The bathroom" }, lead: { de: "Selbst der unscheinbarste Ort des Tages hat eine Sunna: Wer den Qurʾān trägt, beginnt die Achtsamkeit hier.", en: "Even the plainest place of the day has a sunnah: whoever carries the Qurʾān begins mindfulness here." } },
  { id: "right", ar: "التيامن", title: { de: "Die rechte Hand und die rechte Seite", en: "The right hand and the right side" }, lead: { de: "Der Prophet ﷺ liebte es, mit rechts zu beginnen – eine kleine Gewohnheit, die den ganzen Tag ordnet.", en: "The Prophet ﷺ loved to begin with the right – a small habit that orders the whole day." } },
  { id: "food", ar: "آداب الطعام والشراب", title: { de: "Essen und Trinken", en: "Eating and drinking" }, lead: { de: "Mit dem Namen Allahs beginnen, mit Dank enden und Maß halten.", en: "Begin with the name of Allah, end with thanks and keep to moderation." } },
  { id: "sleep", ar: "آداب النوم", title: { de: "Schlafen", en: "Sleeping" }, lead: { de: "Der Tag des Rezitators endet mit Reinheit, Duʿāʾ und Qurʾān.", en: "The reciter's day ends with purity, duʿāʾ and Qurʾān." } },
  { id: "greeting", ar: "إفشاء السلام", title: { de: "Grüßen", en: "Greeting" }, lead: { de: "Der Friedensgruß verbindet die Herzen – den Gruß zu erwidern ist Pflicht.", en: "The greeting of peace joins hearts – returning it is a duty." } },
  { id: "purity", ar: "الطهارة والسواك", title: { de: "Reinheit und Siwāk", en: "Purity and siwāk" }, lead: { de: "Der Mund ist der Weg des Qurʾān: Reinheit gehört zur Rezitation.", en: "The mouth is the path of the Qurʾān: purity belongs to recitation." } },
  { id: "mushaf", ar: "آداب المصحف", title: { de: "Umgang mit dem Muṣḥaf", en: "Adab with the muṣḥaf" }, lead: { de: "Die Achtung vor dem geschriebenen Wort Allahs zeigt sich in den Händen.", en: "Respect for the written word of Allah shows in the hands." } },
  { id: "session", ar: "آداب التلاوة", title: { de: "Die Rezitationssitzung", en: "The recitation session" }, lead: { de: "Wuḍūʾ, Qibla, Istiʿādha, Tartīl und Khushūʿ – so sitzt man vor dem Wort Allahs.", en: "Wuḍūʾ, qibla, istiʿādha, tartīl and khushūʿ – this is how one sits before the word of Allah." } },
  { id: "character", ar: "أخلاق حامل القرآن", title: { de: "Der Charakter des Rezitators", en: "The reciter's character" }, lead: { de: "Aufrichtigkeit, Wahrhaftigkeit, Demut, eine bewahrte Zunge und ein bewahrter Blick.", en: "Sincerity, truthfulness, humility, a guarded tongue and a guarded gaze." } },
  { id: "halal", ar: "الكسب الحلال", title: { de: "Halal verdienen und essen", en: "Halal earnings and food" }, lead: { de: "Was in den Körper geht, gehört zur Rezitation, die aus ihm kommt.", en: "What goes into the body belongs to the recitation that comes out of it." } },
  { id: "carrier", ar: "ما لا يليق بحامل القرآن", title: { de: "Was zum Qurʾān-Träger nicht passt", en: "What does not befit a carrier of the Qurʾān" }, lead: { de: "al-Ājurrī und al-Nawawī nennen, wovon sich der Träger des Qurʾān fernhält.", en: "al-Ājurrī and al-Nawawī name what the carrier of the Qurʾān keeps away from." } },
];

export const ADAB_ITEMS: AdabItem[] = [
  // ---------- bathroom ----------
  {
    id: "toilet-feet", topic: "bathroom",
    title: { de: "Mit dem linken Fuß hinein, mit dem rechten hinaus", en: "Left foot in, right foot out" },
    practice: { de: "Betreten Sie das Badezimmer mit dem linken Fuß und verlassen Sie es mit dem rechten.", en: "Enter the bathroom with the left foot and leave it with the right." },
    status: ["mustahabb"],
    note: {
      de: "Kein Hadith nennt den Fuß für das Badezimmer ausdrücklich. Die Gelehrten leiten es aus der allgemeinen Regel ab: Für Ehrenvolles beginnt man mit rechts, für das Gegenteil mit links. Deshalb ist es eine Empfehlung, keine Pflicht.",
      en: "No hadith names the foot for the bathroom explicitly. The scholars derive it from the general rule: what is honourable begins with the right, its opposite with the left. So it is a recommendation, not a duty.",
    },
    refs: [H("bukhari", 168, "Sahih al-Bukhari 168", "bukhari:168"), H("muslim", 616, "Sahih Muslim 268", "muslim:268a"), S("muftiOnline")],
    jafari: { note: { de: "Auch nach al-Sistani empfohlen (Regel 75).", en: "Also recommended according to al-Sistani (ruling 75)." }, refs: [S("sistani75")] },
  },
  {
    id: "toilet-dua", topic: "bathroom",
    title: { de: "Die Duʿāʾ beim Eintreten und Hinausgehen", en: "The duʿāʾ on entering and leaving" },
    practice: { de: "Suchen Sie vor dem Eintreten Zuflucht bei Allah mit der Duʿāʾ des Propheten ﷺ und bitten Sie beim Hinausgehen um Vergebung.", en: "Before entering, seek refuge with Allah with the duʿāʾ of the Prophet ﷺ, and ask for forgiveness on leaving." },
    status: ["sunnah"],
    refs: [D("enter-toilet"), D("leave-toilet"), H("bukhari", 142, "Sahih al-Bukhari 142", "bukhari:142"), H("abudawud", 30, "Sunan Abi Dawud 30", "abudawud:30")],
  },
  {
    id: "toilet-qibla", topic: "bathroom",
    title: { de: "Der Qibla weder zu- noch abwenden", en: "Neither facing nor turning one's back to the qibla" },
    practice: { de: "Wenden Sie beim Verrichten der Notdurft der Qibla weder das Gesicht noch den Rücken zu.", en: "When relieving yourself, neither face the qibla nor turn your back to it." },
    status: ["haram", "makruh"],
    note: {
      de: "Im freien Gelände halten es die Mehrheit der Schāfiʿiten, Mālikiten und Ḥanbaliten für verboten; in Gebäuden erlauben es die meisten von ihnen wegen des Berichts von Ibn ʿUmar. Die Ḥanafiten missbilligen es an beiden Orten.",
      en: "In open land most Shāfiʿī, Mālikī and Ḥanbalī scholars hold it forbidden; inside buildings most of them permit it because of Ibn ʿUmar's report. The Ḥanafī school disapproves of it in both.",
    },
    refs: [H("bukhari", 144, "Sahih al-Bukhari 144", "bukhari:144"), H("bukhari", 145, "Sahih al-Bukhari 145", "bukhari:145"), S("nawawiSharh")],
    jafari: { note: { de: "Nach al-Sistani aus verpflichtender Vorsicht überall zu meiden (Regeln 55–56).", en: "According to al-Sistani to be avoided everywhere, by obligatory precaution (rulings 55–56)." }, refs: [S("sistani55")] },
  },
  {
    id: "toilet-left", topic: "bathroom",
    title: { de: "Mit der linken Hand reinigen", en: "Cleaning with the left hand" },
    practice: { de: "Reinigen Sie sich nach der Notdurft mit der linken Hand, nicht mit der rechten.", en: "Clean yourself after relieving yourself with the left hand, not the right." },
    status: ["makruh"],
    note: { de: "Die Reinigung mit der rechten Hand ist nach der Mehrheit der Gelehrten missbilligt (makrūh); einige hielten sie für verboten.", en: "Cleaning with the right hand is disliked (makrūh) according to most scholars; some held it forbidden." },
    refs: [H("bukhari", 153, "Sahih al-Bukhari 153", "bukhari:153"), H("muslim", 613, "Sahih Muslim 267", "muslim:267a")],
    jafari: { note: { de: "Auch nach al-Sistani missbilligt (Regel 76).", en: "Also disapproved according to al-Sistani (ruling 76)." }, refs: [S("sistani75")] },
  },
  // ---------- right ----------
  {
    id: "right-start", topic: "right",
    title: { de: "Mit rechts beginnen", en: "Beginning with the right" },
    practice: { de: "Beginnen Sie bei Wuḍūʾ, beim Anziehen, Kämmen und allem Ehrenvollen mit der rechten Seite.", en: "Begin with the right side in wuḍūʾ, dressing, combing and everything honourable." },
    status: ["mustahabb"],
    refs: [H("bukhari", 168, "Sahih al-Bukhari 168", "bukhari:168"), H("muslim", 617, "Sahih Muslim 268", "muslim:268b")],
  },
  {
    id: "shoes", topic: "right",
    title: { de: "Schuhe: rechts an, links aus", en: "Shoes: right on first, left off first" },
    practice: { de: "Ziehen Sie zuerst den rechten Schuh an und zuerst den linken aus.", en: "Put on the right shoe first and take off the left one first." },
    status: ["mustahabb"],
    refs: [H("muslim", 5495, "Sahih Muslim 2097", "muslim:2097a")],
  },
  // ---------- food ----------
  {
    id: "food-bismillah", topic: "food",
    title: { de: "Bismillāh, die rechte Hand und das, was vor Ihnen liegt", en: "Bismillāh, the right hand and what is in front of you" },
    practice: { de: "Sprechen Sie vor dem Essen den Namen Allahs, essen und trinken Sie mit der rechten Hand und nehmen Sie von dem, was vor Ihnen liegt. Haben Sie es vergessen, holen Sie es nach.", en: "Say the name of Allah before eating, eat and drink with the right hand and take from what is in front of you. If you forgot, make it up when you remember." },
    status: ["sunnah"],
    note: { de: "Nach der Mehrheit stark empfohlen, das Essen mit der linken Hand ohne Grund missbilligt; einige Gelehrte hielten das Essen mit der rechten Hand für verpflichtend.", en: "Strongly recommended according to the majority, eating with the left hand without reason disliked; some scholars held eating with the right hand obligatory." },
    refs: [D("before-eating"), H("bukhari", 5376, "Sahih al-Bukhari 5376", "bukhari:5376"), H("muslim", 5265, "Sahih Muslim 2020", "muslim:2020a"), H("abudawud", 3767, "Sunan Abi Dawud 3767", "abudawud:3767"), S("nawawiSharh")],
  },
  {
    id: "food-hamd", topic: "food",
    title: { de: "Mit Dank enden", en: "Ending with thanks" },
    practice: { de: "Loben Sie Allah nach dem Essen mit der Duʿāʾ des Propheten ﷺ.", en: "Praise Allah after eating with the duʿāʾ of the Prophet ﷺ." },
    status: ["sunnah"],
    refs: [D("after-eating"), D("after-eating-kathiran")],
  },
  {
    id: "drink-sitting", topic: "food",
    title: { de: "Im Sitzen trinken", en: "Drinking while seated" },
    practice: { de: "Trinken Sie nach Möglichkeit im Sitzen.", en: "Drink seated where you can." },
    status: ["mustahabb"],
    note: { de: "Das Trinken im Stehen ist nicht verboten: ʿAlī trank im Stehen und berichtete, den Propheten ﷺ so gesehen zu haben. Die meisten Gelehrten sehen das Sitzen als besser an.", en: "Drinking standing is not forbidden: ʿAlī drank standing and reported seeing the Prophet ﷺ do so. Most scholars regard sitting as better." },
    refs: [H("muslim", 5274, "Sahih Muslim 2024", "muslim:2024a"), H("bukhari", 5615, "Sahih al-Bukhari 5615", "bukhari:5615")],
  },
  {
    id: "food-measure", topic: "food",
    title: { de: "Maß halten", en: "Moderation" },
    practice: { de: "Füllen Sie den Magen nicht: ein Drittel für Speise, ein Drittel für Getränk, ein Drittel für den Atem. Ein voller Magen macht die Nachtrezitation schwer.", en: "Do not fill the stomach: a third for food, a third for drink, a third for breath. A full stomach makes the night recitation heavy." },
    status: ["adab"],
    refs: [H("tirmidhi", 2380, "Jamiʿ at-Tirmidhi 2380", "tirmidhi:2380")],
  },
  {
    id: "food-nofault", topic: "food",
    title: { de: "Kein Tadel am Essen", en: "No faultfinding with food" },
    practice: { de: "Tadeln Sie kein Essen: Mögen Sie es, essen Sie es, sonst lassen Sie es still stehen.", en: "Do not criticise food: if you like it, eat it; otherwise leave it quietly." },
    status: ["adab"],
    refs: [H("bukhari", 3563, "Sahih al-Bukhari 3563", "bukhari:3563"), H("muslim", 5380, "Sahih Muslim 2064", "muslim:2064a")],
  },
  // ---------- sleep ----------
  {
    id: "sleep-wudu", topic: "sleep",
    title: { de: "Mit Wuḍūʾ auf der rechten Seite", en: "With wuḍūʾ, on the right side" },
    practice: { de: "Vollziehen Sie vor dem Schlafen die Gebetswaschung, legen Sie sich auf die rechte Seite und sprechen Sie die Duʿāʾ als letzte Worte.", en: "Perform wuḍūʾ before sleeping, lie on your right side and make the duʿāʾ your last words." },
    status: ["sunnah"],
    refs: [D("aslamtu-nafsi"), H("bukhari", 247, "Sahih al-Bukhari 247", "bukhari:247"), H("muslim", 6882, "Sahih Muslim 2710", "muslim:2710a")],
  },
  {
    id: "sleep-quran", topic: "sleep",
    title: { de: "Mit dem Qurʾān einschlafen", en: "Falling asleep with the Qurʾān" },
    practice: { de: "Rezitieren Sie vor dem Schlafen al-Ikhlāṣ, al-Falaq und al-Nās, hauchen Sie in die Hände und streichen Sie über den Körper; sprechen Sie „Bismika amūtu wa aḥyā“.", en: "Before sleeping recite al-Ikhlāṣ, al-Falaq and al-Nās, blow into your hands and pass them over your body; say “Bismika amūtu wa aḥyā”." },
    status: ["sunnah"],
    refs: [H("bukhari", 5017, "Sahih al-Bukhari 5017", "bukhari:5017"), D("bismika-amutu"), H("bukhari", 6312, "Sahih al-Bukhari 6312", "bukhari:6312")],
  },
  // ---------- greeting ----------
  {
    id: "salam", topic: "greeting",
    title: { de: "Den Salām verbreiten und erwidern", en: "Spreading and returning the salām" },
    practice: { de: "Grüßen Sie zuerst – der Gehende den Sitzenden, der Jüngere den Älteren, die kleine Gruppe die große – und erwidern Sie jeden Gruß gleich oder schöner.", en: "Greet first – the walking one greets the seated, the younger the older, the small group the large – and return every greeting equally or better." },
    status: ["sunnah", "wajib"],
    note: { de: "Mit dem Gruß zu beginnen ist Sunna; den Gruß zu erwidern ist Pflicht (4:86). In einer Gruppe genügt nach den meisten Gelehrten die Erwiderung eines Einzelnen.", en: "Beginning the greeting is sunnah; returning it is a duty (4:86). In a group, according to most scholars, one person's reply suffices." },
    refs: [V("4:86"), H("muslim", 194, "Sahih Muslim 54", "muslim:54a"), H("bukhari", 6234, "Sahih al-Bukhari 6234", "bukhari:6234")],
  },
  // ---------- purity ----------
  {
    id: "siwak", topic: "purity",
    title: { de: "Siwāk", en: "Siwāk" },
    practice: { de: "Reinigen Sie den Mund mit dem Siwāk – vor dem Gebet, beim Heimkommen und vor der Rezitation.", en: "Clean your mouth with the siwāk – before prayer, on coming home and before recitation." },
    status: ["sunnah"],
    note: { de: "Eine bestätigte Sunna, keine Pflicht: Der Prophet ﷺ sagte, er hätte sie zu jedem Gebet befohlen, wenn es seiner Gemeinschaft nicht zu schwer würde. Vor der Rezitation empfiehlt sie al-Nawawī ausdrücklich.", en: "A confirmed sunnah, not a duty: the Prophet ﷺ said he would have ordered it for every prayer were it not a burden on his community. al-Nawawī explicitly recommends it before recitation." },
    refs: [H("bukhari", 887, "Sahih al-Bukhari 887", "bukhari:887"), H("muslim", 589, "Sahih Muslim 252", "muslim:252"), H("muslim", 590, "Sahih Muslim 253", "muslim:253a"), S("tibyanRecite")],
  },
  {
    id: "wudu", topic: "purity",
    title: { de: "In Wuḍūʾ bleiben", en: "Staying in wuḍūʾ" },
    practice: { de: "Vollziehen Sie die Gebetswaschung sorgfältig und bleiben Sie, wenn es geht, auch außerhalb des Gebets in Wuḍūʾ.", en: "Perform wuḍūʾ carefully and, where you can, stay in wuḍūʾ outside prayer too." },
    status: ["fard", "mustahabb"],
    note: { de: "Für das Gebet ist Wuḍūʾ Pflicht (5:6); zu anderen Zeiten in Wuḍūʾ zu bleiben ist empfohlen.", en: "Wuḍūʾ is obligatory for prayer (5:6); staying in wuḍūʾ at other times is recommended." },
    refs: [V("5:6"), V("2:222"), H("muslim", 534, "Sahih Muslim 223", "muslim:223"), D("after-wudu")],
    href: "/wudu",
  },
  // ---------- mushaf ----------
  {
    id: "mushaf-touch", topic: "mushaf",
    title: { de: "Den Muṣḥaf nur in Reinheit berühren", en: "Touching the muṣḥaf only in purity" },
    practice: { de: "Berühren Sie den arabischen Text des Muṣḥaf nur mit Wuḍūʾ. Aus dem Gedächtnis oder vom Bildschirm zu rezitieren bleibt Ihnen auch ohne Wuḍūʾ offen.", en: "Touch the Arabic text of the muṣḥaf only with wuḍūʾ. Reciting from memory or from a screen remains open to you without wuḍūʾ as well." },
    status: ["haram"],
    note: {
      de: "Die vier sunnitischen Rechtsschulen verbieten das Berühren des Muṣḥaf ohne Wuḍūʾ, gestützt auf den Brief an ʿAmr ibn Ḥazm und die Auslegung von 56:79; eine Minderheit (etwa die Ẓāhiriten) erlaubt es. Ob ein Bildschirm als Muṣḥaf gilt, wird heute diskutiert; die Rechtsfragen für Frauen während der Menstruation finden Sie im Bereich „Für Schwestern“.",
      en: "The four Sunni schools forbid touching the muṣḥaf without wuḍūʾ, based on the letter to ʿAmr ibn Ḥazm and the reading of 56:79; a minority (such as the Ẓāhirīs) permits it. Whether a screen counts as a muṣḥaf is discussed today; the rulings for women during menstruation are in the “For sisters” section.",
    },
    refs: [V("56:77"), V("56:78"), V("56:79"), S("muwatta15")],
    jafari: { note: { de: "Nach al-Sistani ist das Berühren der Schrift des Qurʾān ohne Wuḍūʾ verboten, das Berühren einer Übersetzung nicht (Regel 316); für den Junub ist zudem das Rezitieren der vier Niederwerfungsverse verboten (Regel 354).", en: "According to al-Sistani, touching the writing of the Qurʾān without wuḍūʾ is forbidden, touching a translation is not (ruling 316); a junub may also not recite the four verses of obligatory prostration (ruling 354)." }, refs: [S("sistani316"), S("sistani354")] },
    sisters: true,
  },
  {
    id: "mushaf-honour", topic: "mushaf",
    title: { de: "Den Muṣḥaf ehren", en: "Honouring the muṣḥaf" },
    practice: { de: "Legen Sie den Muṣḥaf an einen sauberen, erhöhten Ort, legen Sie nichts auf ihn, strecken Sie die Füße nicht zu ihm und nehmen Sie ihn mit Achtung in die Hand.", en: "Keep the muṣḥaf in a clean, raised place, put nothing on top of it, do not stretch your feet towards it and take it in your hands with respect." },
    status: ["adab"],
    note: { de: "Den Muṣḥaf herabzuwürdigen ist nach allen Schulen schwer verboten; die einzelnen Gesten der Achtung sind Adab, wie al-Nawawī sie beschreibt.", en: "Degrading the muṣḥaf is gravely forbidden in every school; the individual gestures of respect are adab, as al-Nawawī describes them." },
    refs: [S("tibyanMushaf"), S("muwatta15")],
  },
  // ---------- session ----------
  {
    id: "session-state", topic: "session",
    title: { de: "Rein, ruhig, zur Qibla", en: "Pure, calm, facing the qibla" },
    practice: { de: "Rezitieren Sie nach Möglichkeit mit Wuḍūʾ, an einem sauberen Ort, zur Qibla gewandt, in ruhiger Haltung und mit gesenktem Blick.", en: "Recite, where you can, with wuḍūʾ, in a clean place, facing the qibla, in a calm posture and with lowered eyes." },
    status: ["mustahabb"],
    note: { de: "Jedes dieser Elemente ist eine Empfehlung der Gelehrten; die Rezitation ohne sie bleibt gültig und belohnt.", en: "Each of these is a recommendation of the scholars; recitation without them remains valid and rewarded." },
    refs: [S("tibyanRecite"), S("ghazali")],
  },
  {
    id: "istiadha", topic: "session",
    title: { de: "Istiʿādha vor der Rezitation", en: "Istiʿādha before recitation" },
    practice: { de: "Suchen Sie vor der Rezitation Zuflucht bei Allah vor dem verfluchten Satan, und beginnen Sie eine Sure mit der Basmala.", en: "Before reciting, seek refuge with Allah from the accursed Satan, and begin a surah with the basmala." },
    status: ["mustahabb"],
    note: { de: "Nach der Mehrheit empfohlen; eine Minderheit hielt die Istiʿādha für verpflichtend.", en: "Recommended according to the majority; a minority held the istiʿādha obligatory." },
    refs: [V("16:98"), S("tibyanRecite")],
  },
  {
    id: "tartil", topic: "session",
    title: { de: "Tartīl – bedacht und deutlich", en: "Tartīl – measured and clear" },
    practice: { de: "Rezitieren Sie langsam und deutlich, Buchstabe für Buchstabe, mit den Regeln des Tajwīd, statt zum Ende der Sure zu eilen.", en: "Recite slowly and clearly, letter by letter, with the rules of tajwīd, instead of hurrying to the end of the surah." },
    status: ["wajib", "sunnah"],
    note: { de: "Deutliche Fehler, die Wortlaut oder Sinn ändern, zu vermeiden, ist nach einhelliger Auffassung Pflicht; Ibn al-Jazarī nannte das Tajwīd verbindlich. Ob jede feine Regel Pflicht ist, wird unter Gelehrten besprochen. Das gemessene Tempo selbst ist Sunna.", en: "Avoiding clear mistakes that change the wording or the meaning is obligatory by agreement; Ibn al-Jazarī called tajwīd binding. Whether every fine rule is obligatory is discussed among scholars. The measured pace itself is sunnah." },
    refs: [V("73:4"), S("jazari"), S("tibyanRecite")],
    jafari: { note: { de: "Imam al-Ṣādiq überliefert die Erklärung ʿAlīs zu 73:4: deutlich aussprechen und die Herzen bewegen, statt zum Ende der Sure zu eilen.", en: "Imam al-Ṣādiq transmits ʿAlī's explanation of 73:4: pronounce clearly and move the hearts, instead of hurrying to the end of the surah." }, refs: [K(2067, "al-Kāfī 2, Kitāb Faḍl al-Qurʾān – Bāb tartīl al-Qurʾān, no. 1", "1/3/9/1")] },
    href: "/tajweed",
  },
  {
    id: "khushu", topic: "session",
    title: { de: "Khushūʿ und Tadabbur", en: "Khushūʿ and tadabbur" },
    practice: { de: "Halten Sie bei Versen der Barmherzigkeit inne und bitten Sie, bei Versen der Strafe suchen Sie Zuflucht. Lassen Sie den Sinn das Herz erreichen.", en: "Pause at verses of mercy and ask, at verses of punishment seek refuge. Let the meaning reach the heart." },
    status: ["mustahabb"],
    refs: [V("38:29"), H("bukhari", 5050, "Sahih al-Bukhari 5050", "bukhari:5050"), S("tibyanRecite")],
    jafari: { note: { de: "Imam al-Ṣādiq: Der Qurʾān kam mit Trauer herab, so rezitieren Sie ihn mit Trauer.", en: "Imam al-Ṣādiq: the Qurʾān came down with sadness, so recite it with sadness." }, refs: [K(2068, "al-Kāfī 2, Kitāb Faḍl al-Qurʾān – Bāb tartīl al-Qurʾān, no. 2", "1/3/9/2")] },
    href: "/shams/tadabbur",
  },
  {
    id: "voice", topic: "session",
    title: { de: "Die Stimme verschönern – für Allah", en: "Beautifying the voice – for Allah" },
    practice: { de: "Verschönern Sie den Qurʾān mit Ihrer Stimme, so gut Sie können, und nicht, um gehört oder gelobt zu werden.", en: "Beautify the Qurʾān with your voice as well as you can, and not to be heard or praised." },
    status: ["mustahabb"],
    refs: [H("bukhari", 7527, "Sahih al-Bukhari 7527", "bukhari:7527"), H("abudawud", 1468, "Sunan Abi Dawud 1468", "abudawud:1468")],
    jafari: { note: { de: "Der Prophet ﷺ: Alles hat einen Schmuck, und der Schmuck des Qurʾān ist die schöne Stimme (überliefert von Imam al-Ṣādiq).", en: "The Prophet ﷺ: everything has an ornament, and the ornament of the Qurʾān is a beautiful voice (transmitted by Imam al-Ṣādiq)." }, refs: [K(2075, "al-Kāfī 2, Kitāb Faḍl al-Qurʾān – Bāb tartīl al-Qurʾān, no. 9", "1/3/9/9")] },
  },
  // ---------- character ----------
  {
    id: "ikhlas", topic: "character",
    title: { de: "Aufrichtigkeit (Ikhlāṣ)", en: "Sincerity (ikhlāṣ)" },
    practice: { de: "Lernen und rezitieren Sie für Allah – nicht, damit man Sie einen Rezitator nennt. Prüfen Sie Ihre Absicht vor jeder Sitzung.", en: "Learn and recite for Allah – not so that people call you a reciter. Check your intention before every session." },
    status: ["fard"],
    note: { de: "Die Aufrichtigkeit ist Bedingung für den Lohn jeder Anbetung; Augendienerei (Riyāʾ) ist verboten. Sie macht die Rezitation nicht ungültig im rechtlichen Sinn, aber sie nimmt ihr den Lohn.", en: "Sincerity is the condition for the reward of every act of worship; showing off (riyāʾ) is forbidden. It does not make recitation legally invalid, but it takes away its reward." },
    refs: [H("bukhari", 1, "Sahih al-Bukhari 1", "bukhari:1"), H("muslim", 4923, "Sahih Muslim 1905", "muslim:1905a"), S("tibyanCarrier")],
    jafari: { note: { de: "Der Träger des Qurʾān soll ihn für Allah verschönern, nicht für die Menschen (al-Kāfī).", en: "The carrier of the Qurʾān should beautify it for Allah, not for people (al-Kāfī)." }, refs: [K(2034, "al-Kāfī 2, Kitāb Faḍl al-Qurʾān – Bāb faḍl ḥāmil al-Qurʾān, no. 5", "1/3/2/5")] },
  },
  {
    id: "act", topic: "character",
    title: { de: "Leben, was man rezitiert", en: "Living what one recites" },
    practice: { de: "Nehmen Sie aus jeder Sitzung eine Sache mit, die Sie heute tun oder lassen. So wird der Qurʾān zum Charakter – wie beim Propheten ﷺ.", en: "Take one thing from every session that you will do or leave today. This is how the Qurʾān becomes character – as with the Prophet ﷺ." },
    status: ["fard", "adab"],
    note: { de: "Zu tun, was der Qurʾān verpflichtet, und zu lassen, was er verbietet, ist für jeden Muslim Pflicht. Die Gelehrten sehen im gelebten Qurʾān das Kennzeichen seines Trägers: Er ist ein Argument für oder gegen ihn.", en: "Doing what the Qurʾān obliges and leaving what it forbids is a duty for every Muslim. The scholars see the lived Qurʾān as the mark of its carrier: it is an argument for or against them." },
    refs: [V("61:2"), V("61:3"), H("bukhari", 5059, "Sahih al-Bukhari 5059", "bukhari:5059"), H("muslim", 1739, "Sahih Muslim 746", "muslim:746a"), H("muslim", 534, "Sahih Muslim 223", "muslim:223"), S("ajurri")],
    jafari: { note: { de: "Imam al-Ṣādiq: Wer den Qurʾān auswendig kann und danach handelt, ist mit den edlen, frommen Engeln.", en: "Imam al-Ṣādiq: whoever has memorised the Qurʾān and acts on it is with the noble, righteous angels." }, refs: [K(2031, "al-Kāfī 2, Kitāb Faḍl al-Qurʾān – Bāb faḍl ḥāmil al-Qurʾān, no. 2", "1/3/2/2")] },
  },
  {
    id: "truth", topic: "character",
    title: { de: "Wahrhaftigkeit", en: "Truthfulness" },
    practice: { de: "Sprechen Sie die Wahrheit, auch wenn sie Ihnen schadet, und halten Sie Versprechen.", en: "Speak the truth even when it costs you, and keep your promises." },
    status: ["fard"],
    note: { de: "Wahrhaftigkeit ist Pflicht, die Lüge verboten; eng begrenzte Ausnahmen besprechen die Gelehrten gesondert.", en: "Truthfulness is a duty and lying forbidden; narrowly limited exceptions are discussed separately by the scholars." },
    refs: [H("bukhari", 6094, "Sahih al-Bukhari 6094", "bukhari:6094"), H("muslim", 6637, "Sahih Muslim 2607", "muslim:2607a")],
  },
  {
    id: "humility", topic: "character",
    title: { de: "Demut", en: "Humility" },
    practice: { de: "Sehen Sie sich wegen Ihres Hifz nicht über andere. Wer sich für Allah demütigt, den erhöht Er.", en: "Do not see yourself above others because of your hifz. Whoever humbles themselves for Allah, He raises." },
    status: ["mustahabb", "haram"],
    note: { de: "Demut ist eine gepriesene Tugend; Hochmut (Kibr) ist verboten.", en: "Humility is a praised virtue; arrogance (kibr) is forbidden." },
    refs: [H("muslim", 6592, "Sahih Muslim 2588", "muslim:2588"), H("muslim", 265, "Sahih Muslim 91", "muslim:91a"), S("tibyanCarrier")],
    jafari: { note: { de: "Der Träger des Qurʾān ist der, von dem man am meisten Demut erwartet, im Verborgenen wie öffentlich (al-Kāfī).", en: "The carrier of the Qurʾān is the one from whom most humility is expected, in private and in public (al-Kāfī)." }, refs: [K(2034, "al-Kāfī 2, Kitāb Faḍl al-Qurʾān – Bāb faḍl ḥāmil al-Qurʾān, no. 5", "1/3/2/5")] },
  },
  {
    id: "tongue", topic: "character",
    title: { de: "Die Zunge bewahren", en: "Guarding the tongue" },
    practice: { de: "Die Zunge, die den Qurʾān rezitiert, meidet üble Nachrede, Spott und leeres Gerede: Sprechen Sie Gutes oder schweigen Sie.", en: "The tongue that recites the Qurʾān avoids backbiting, mockery and idle talk: speak good or remain silent." },
    status: ["haram", "adab"],
    note: { de: "Üble Nachrede (Ghība) und Verleumdung sind verboten (49:12); das Schweigen statt leeren Geredes ist Adab.", en: "Backbiting (ghība) and slander are forbidden (49:12); silence instead of idle talk is adab." },
    refs: [V("49:12"), H("bukhari", 6018, "Sahih al-Bukhari 6018", "bukhari:6018"), H("bukhari", 6474, "Sahih al-Bukhari 6474", "bukhari:6474")],
  },
  {
    id: "gaze", topic: "character",
    title: { de: "Den Blick senken", en: "Lowering the gaze" },
    practice: { de: "Die Augen, die im Muṣḥaf lesen, senken sich vor dem, was Allah verboten hat – auf der Straße wie auf dem Bildschirm.", en: "The eyes that read the muṣḥaf lower themselves before what Allah has forbidden – in the street as on the screen." },
    status: ["wajib"],
    note: { de: "Den Blick vor Verbotenem zu senken ist für Männer und Frauen Pflicht (24:30–31).", en: "Lowering the gaze from what is forbidden is a duty for men and women (24:30–31)." },
    refs: [V("24:30"), V("24:31")],
    sisters: true,
  },
  // ---------- halal ----------
  {
    id: "halal-earn", topic: "halal",
    title: { de: "Halal verdienen, halal essen", en: "Earning halal, eating halal" },
    practice: { de: "Achten Sie darauf, dass Ihr Einkommen und Ihr Essen erlaubt sind. Der Prophet ﷺ nannte die Speise als Grund, warum eine Duʿāʾ nicht erhört wird.", en: "Make sure your income and your food are permissible. The Prophet ﷺ named food as a reason why a duʿāʾ is not answered." },
    status: ["fard"],
    note: { de: "Verbotenes zu verdienen und zu essen ist verboten; nach dem Erlaubten zu suchen ist Pflicht.", en: "Earning and eating what is forbidden is forbidden; seeking what is permissible is a duty." },
    refs: [V("2:168"), V("2:172"), V("23:51"), H("muslim", 2346, "Sahih Muslim 1015", "muslim:1015")],
  },
  {
    id: "doubtful", topic: "halal",
    title: { de: "Das Zweifelhafte meiden", en: "Avoiding the doubtful" },
    practice: { de: "Lassen Sie, worüber Sie im Zweifel sind, um Ihre Religion und Ihre Ehre zu schützen.", en: "Leave what you are in doubt about, to protect your religion and your honour." },
    status: ["mustahabb"],
    note: { de: "Das Zweifelhafte zu meiden (Waraʿ) ist eine Empfehlung der Frömmigkeit; das eindeutig Verbotene zu meiden ist Pflicht.", en: "Avoiding the doubtful (waraʿ) is a recommendation of piety; avoiding the clearly forbidden is a duty." },
    refs: [H("bukhari", 52, "Sahih al-Bukhari 52", "bukhari:52"), H("muslim", 4094, "Sahih Muslim 1599", "muslim:1599a")],
  },
  // ---------- carrier ----------
  {
    id: "carrier-conduct", topic: "carrier",
    title: { de: "Fern von Leichtfertigkeit", en: "Away from frivolity" },
    practice: { de: "Der Träger des Qurʾān meidet Spott, Streit, übermäßiges Lachen und Spiel und das Prahlen mit seinem Wissen; man erkennt ihn an seiner Nacht und seiner Ruhe.", en: "The carrier of the Qurʾān avoids mockery, quarrelling, excessive laughter and play and boasting of their knowledge; they are known by their night and their calm." },
    status: ["adab"],
    note: { de: "al-Ājurrī und al-Nawawī führen diese Eigenschaften als Adab des Trägers auf und überliefern dazu Worte der Gefährten, etwa Ibn Masʿūds. Sie sind ein Ideal, an dem man wächst – kein Urteil über andere.", en: "al-Ājurrī and al-Nawawī list these qualities as the adab of the carrier and transmit words of the Companions on it, such as Ibn Masʿūd's. They are an ideal to grow towards – not a verdict on others." },
    refs: [S("ajurri"), S("tibyanCarrier")],
    jafari: { note: { de: "Der Prophet ﷺ: O ihr Leser des Qurʾān, fürchtet Allah in der Verantwortung für Sein Buch (al-Kāfī).", en: "The Prophet ﷺ: O readers of the Qurʾān, be mindful of Allah in your responsibility for His Book (al-Kāfī)." }, refs: [K(2038, "al-Kāfī 2, Kitāb Faḍl al-Qurʾān – Bāb faḍl ḥāmil al-Qurʾān, no. 9", "1/3/2/9")] },
  },
  {
    id: "carrier-world", topic: "carrier",
    title: { de: "Den Qurʾān nicht für die Welt benutzen", en: "Not using the Qurʾān for worldly gain" },
    practice: { de: "Suchen Sie mit dem Qurʾān nicht Ansehen, Macht oder Geld. Wer unterrichtet, unterrichtet zuerst für Allah.", en: "Do not seek status, power or money with the Qurʾān. Whoever teaches, teaches first for Allah." },
    status: ["adab"],
    note: { de: "Lohn für das Lehren des Qurʾān anzunehmen erlaubt die Mehrheit der Gelehrten (Bukhārī 5737); frühe Ḥanafiten lehnten es ab, spätere erlaubten es aus Bedarf. Den Qurʾān zum Mittel für weltliche Stellung zu machen, nennt al-Nawawī unter dem, was der Träger meidet.", en: "Taking a wage for teaching the Qurʾān is permitted by most scholars (Bukhārī 5737); early Ḥanafīs rejected it, later ones permitted it out of need. Making the Qurʾān a means to worldly standing is listed by al-Nawawī among what the carrier avoids." },
    refs: [H("bukhari", 5737, "Sahih al-Bukhari 5737", "bukhari:5737"), S("tibyanCarrier")],
  },
  {
    id: "keep", topic: "carrier",
    title: { de: "Das Gelernte bewahren", en: "Keeping what was learned" },
    practice: { de: "Wiederholen Sie Ihren Hifz regelmäßig – das ist Ihr Manzil. Der Qurʾān entweicht schneller als ein angebundenes Kamel.", en: "Review your hifz regularly – that is your manzil. The Qurʾān escapes faster than a tethered camel." },
    status: ["sunnah"],
    note: { de: "Nachdrücklich geboten; wie schwer das Vergessen aus Nachlässigkeit wiegt, beurteilen die Gelehrten unterschiedlich. Wer sich müht, ist nicht getadelt.", en: "Strongly urged; scholars differ on how heavy forgetting through neglect weighs. Whoever strives is not blamed." },
    refs: [H("bukhari", 5033, "Sahih al-Bukhari 5033", "bukhari:5033"), H("muslim", 1844, "Sahih Muslim 791", "muslim:791")],
    href: "/shams/wird",
  },
];

export const adabTopic = (id: AdabTopicId) => ADAB_TOPICS.find((t) => t.id === id)!;
export const adabItem = (id: string) => ADAB_ITEMS.find((i) => i.id === id);

/** one adab per day of the Shams plan (`day` = the plan's day number), the same item on every device that day */
export const adabOfDay = (day: number): AdabItem => ADAB_ITEMS[((Math.floor(day) % ADAB_ITEMS.length) + ADAB_ITEMS.length) % ADAB_ITEMS.length];

/** local only, never synced: { [day]: item id } of the days the learner ticked "heute umgesetzt"; no score is derived from it */
export const ADAB_DONE_KEY = "qmc.shams2.adab.v1";
export const ADAB_DONE_MAX = 60;
/** the ticks with today's set or cleared, keeping only the last ADAB_DONE_MAX days */
export function toggleAdabDone(done: Record<string, string>, day: number, id: string): Record<string, string> {
  const next = { ...done };
  if (next[day] === id) delete next[day]; else next[day] = id;
  const keep = Object.keys(next).map(Number).filter((d) => d > day - ADAB_DONE_MAX);
  return Object.fromEntries(keep.map((d) => [d, next[d]]));
}

/** app and website routes (the same paths on both) */
export const ADAB_ROUTES = { page: "/shams/adab", sisters: "/sisters", duas: "/duas", verse: (key: string) => { const [s, v] = key.split(":"); return `/surah/${s}?v=${v}`; } } as const;
