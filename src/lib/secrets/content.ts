import { quotesTranslation, resolveDeep, translationName } from "./scripture";

// "Secrets of the Quran" (/secrets): verified counts, popular claims checked, facts with sources, what is promised to
// those who read the Quran, and places of peace. German, English and Arabic here; the other eleven languages in
// lib/pagecontent/<lang>/secrets.ts (complete; a missing field would fall back to English).
// Counts come from lib/secrets/counts.ts (computed from the full Uthmani text, method stated on the page).
// No Quran or hadith wording is typed here (BLUEPRINT §4): verses are tokens ({{q:…}}, {{t:…}}) that secretsContent()
// resolves from the Quran.com snapshots (lib/secrets/scripture.ts); the hadith quotes carry `ref` and are rendered from
// hadith-api where it has the reader's language (lib/secrets/hadith.ts), `text` being an own-words summary marked as one.
export type Verdict = "true" | "false" | "method";
/** a hadith quote: `text` is a summary in own words that says so; `ref` the hadith in fawazahmed0/hadith-api
 *  ("muslim:1874" – the API's number), whose wording the page shows where the API has the reader's language */
export type SecretHadith = { text: string; src: string; ref?: string };
export type SecretsContent = {
  kicker: string; title: string; lead: string;
  counterTitle: string; counterLead: string; method: string; times: string; spots: string; open: string; allahNote: string;
  words: { key: string; ar: string; label: string }[];
  claimsTitle: string; claimsLead: string; verdicts: Record<Verdict, string>;
  claims: { q: string; v: Verdict; a: string; key?: string }[];
  factsTitle: string; facts: { ar: string; title: string; body: string; src: string }[];
  moreTitle?: string; more?: { ar: string; title: string; body: string; src: string }[];
  readTitle: string; readLead: string; hadith: SecretHadith[];
  // the promises are whole verses, shown from Quran.com (Arabic and the reader's translation): only reference and own-words title here
  wealthTitle: string; wealthLead: string; promises: { ref: string; title: string }[]; wealthNote: string; wealthHadith: SecretHadith;
  placesTitle: string; placesLead: string; places: { ar: string; title: string; body: string; src: string; href?: string }[];
  note: string; ctaTitle: string; ctaBody: string; cta: string;
  // page navigation, verdict legend, link from a claim to its places in the counter, groups of "more", onward links
  nav: { title: string } & Record<SectionId, string>;
  verdictHelp: Record<Verdict, string>;
  showPlaces: string;
  moreGroups: string[];
  next: { shams: { title: string; body: string; cta: string }; reader: { title: string; body: string; cta: string } };
};

// Sections of the page in order (ids of the anchors on the website, the table of contents in web and app)
export const SECTIONS = ["counter", "claims", "facts", "more", "read", "wealth", "places", "next"] as const;
export type SectionId = (typeof SECTIONS)[number];

// "More secrets" in groups (indexes into `more`, the same order in every language; titles in `moreGroups`):
// surahs and their openings · repetitions, letters, words · names · revelation and preservation · prayer and the night
export const MORE_GROUPS: number[][] = [[0, 1, 6, 13, 14, 7, 10, 12, 8], [2, 3, 4, 5, 11], [15, 16, 17], [18, 19, 20, 21], [9, 22, 23, 24]];

const de: SecretsContent = {
  kicker: "Geprüft, nicht geraten",
  title: "Die Geheimnisse des Quran",
  lead: "Über den Quran kursieren viele Zahlen und „Wunder“ – manche stimmen, manche nicht. Hier zählen wir selbst nach, im vollständigen Uthmani-Text, und sagen offen, was belegt ist. Dazu: was dem verheißen ist, der den Quran liest, und wo das Herz am leichtesten Frieden findet.",
  counterTitle: "Wie oft steht das im Quran?",
  counterLead: "Tippen Sie auf ein Wort. Sie sehen, wie oft es vorkommt – und jede einzelne Stelle, direkt zum Nachlesen.",
  method: "Gezählt im Uthmani-Text des König-Fahd-Komplexes in Madinah (6.236 Verse, Zählung nach Hafs). Gezählt werden Wortformen mit Artikel und vorangestellten Partikeln (wa-, fa-, bi-, li-, ka-), ohne angehängte Pronomen; bei Namen auch mit dem Ruf „yā“. Andere Zählweisen können zu etwas anderen Zahlen kommen – deshalb nennen wir die Methode.",
  times: "mal", spots: "Stellen", open: "Öffnen", allahNote: "Bei „Allah“ zeigen wir nur die Zahl – die Stellen wären zu viele für eine Liste.",
  words: [
    { key: "fearNot", ar: "لَا تَخَفْ", label: "„Hab keine Angst“" },
    { key: "noFear", ar: "لَا خَوْفٌ عَلَيْهِمْ", label: "„Keine Furcht über ihnen“" },
    { key: "allah", ar: "ٱللَّه", label: "Allah" },
    { key: "rahman", ar: "ٱلرَّحْمَـٰن", label: "Der Allerbarmer" },
    { key: "yawm", ar: "يَوْم", label: "Tag" },
    { key: "shahr", ar: "شَهْر", label: "Monat" },
    { key: "dunya", ar: "ٱلدُّنْيَا", label: "Diesseits" },
    { key: "akhira", ar: "ٱلْـَٔاخِرَة", label: "Jenseits" },
    { key: "musa", ar: "مُوسَىٰ", label: "Musa" },
    { key: "ibrahim", ar: "إِبْرَٰهِيم", label: "Ibrahim" },
    { key: "nuh", ar: "نُوح", label: "Nuh" },
    { key: "yusuf", ar: "يُوسُف", label: "Yusuf" },
    { key: "isa", ar: "عِيسَىٰ", label: "Isa" },
    { key: "adam", ar: "ءَادَم", label: "Adam" },
    { key: "maryam", ar: "مَرْيَم", label: "Maryam" },
    { key: "muhammad", ar: "مُحَمَّد", label: "Muhammad ﷺ" },
    { key: "ahmad", ar: "أَحْمَد", label: "Ahmad ﷺ" },
  ],
  claimsTitle: "Verbreitete Behauptungen – nachgezählt",
  claimsLead: "Was in sozialen Medien geteilt wird, ist oft gut gemeint. Aber der Quran braucht keine erfundenen Zahlen. Wir haben jede Aussage selbst geprüft.",
  verdicts: { true: "Stimmt", false: "Stimmt so nicht", method: "Stimmt – mit dieser Zählweise" },
  claims: [
    { q: "„Hab keine Angst“ steht 365-mal im Quran – für jeden Tag des Jahres einmal.", v: "false", key: "fearNot", a: "Als direkte Aufforderung – „lā takhaf“, „lā takhāfī“, „lā takhāfū“, „lā takhāfā“ – kommt es 13-mal vor: gesprochen zu Ibrahim, zu Musa und Harun, zur Mutter von Musa, zu Lut, zu Dawud und zu den Gläubigen. Dazu kommt 13-mal die Zusage, frei von Furcht und Trauer zu sein. Zusammen 26 Stellen – weniger als behauptet, aber jede einzelne ein Trost." },
    { q: "Das Wort „Tag“ steht 365-mal im Quran.", v: "method", key: "yawm", a: "Zählt man die Einzahl „yaum“ und „yauman“ – mit Artikel und Partikeln, aber ohne angehängte Pronomen und ohne „yaumaʾidhin“ (an jenem Tag) –, sind es genau 365 Stellen. Mit anderen Zählweisen kommt man auf andere Zahlen. Bemerkenswert bleibt es." },
    { q: "Das Wort „Monat“ steht 12-mal im Quran.", v: "true", key: "shahr", a: "In der Einzahl („shahr“, „ash-shahr“, „shahran“) sind es 12 Stellen. Und der Quran selbst nennt zwölf Monate bei Allah (9:36)." },
    { q: "„Diesseits“ und „Jenseits“ stehen gleich oft – je 115-mal.", v: "method", key: "dunya", a: "Mit Artikel und Partikeln gezählt: ad-dunyā 115-mal, al-ākhira 115-mal. Nicht mitgezählt ist 3:72, wo „ākhirahu“ „sein Ende“ (des Tages) bedeutet und nicht das Jenseits." },
    { q: "Der Name „Allah“ steht 2.699-mal im Quran.", v: "true", key: "allah", a: "Mit allen Vorsilben wie wallāhi, billāhi, lillāhi gezählt sind es 2.699 Stellen (ohne „Allāhumma“). Das deckt sich mit den bekannten Zählungen." },
    { q: "Musa ist der am häufigsten genannte Prophet.", v: "true", key: "musa", a: "Musa wird 136-mal mit Namen genannt – häufiger als jeder andere Prophet. Es folgen Ibrahim (69), Nuh (43), Yusuf (27), Isa und Adam (je 25)." },
    { q: "Maryam ist die einzige Frau, die im Quran mit Namen genannt wird.", v: "true", key: "maryam", a: "Ja. Ihr Name steht 34-mal im Quran, und eine ganze Sure trägt ihren Namen: Sure 19, Maryam." },
    { q: "Der Prophet Muhammad ﷺ wird nur viermal mit Namen genannt.", v: "true", key: "muhammad", a: "Viermal als „Muhammad“ (3:144, 33:40, 47:2, 48:29) und einmal als „Ahmad“ (61:6) – an vielen anderen Stellen spricht Allah ihn an als „O Prophet“ und „O Gesandter“." },
  ],
  factsTitle: "Was wirklich erstaunt – mit Quelle",
  facts: [
    { ar: "الفاتحة", title: "Die größte Sure", body: "Der Prophet ﷺ nannte Al-Fātiḥa die größte Sure des Quran und „die sieben oft Wiederholten“ – sie wird in jeder Gebetseinheit rezitiert.", src: "Sahih al-Bukhari 4474" },
    { ar: "آية الكرسي", title: "Der größte Vers", body: "Āyat al-Kursī (2:255) ist der gewaltigste Vers im Buch Allahs – so lehrte es der Prophet ﷺ seinen Gefährten Ubayy ibn Kaʿb.", src: "Sahih Muslim 810" },
    { ar: "الإخلاص", title: "Ein Drittel des Quran", body: "Sure Al-Ikhlāṣ (112) kommt einem Drittel des Quran gleich – vier kurze Verse über die Einheit Allahs.", src: "Sahih al-Bukhari 5013" },
    { ar: "اقرأ", title: "Das erste Wort", body: "Die erste Offenbarung in der Höhle Ḥirāʾ beginnt mit „Lies!“ (96:1–5). Der Quran beginnt seine Herabsendung mit Wissen.", src: "Sahih al-Bukhari 3" },
    { ar: "البسملة", title: "114 Basmalas", body: "„Bismillāh ar-Raḥmān ar-Raḥīm“ steht am Anfang von 113 Suren – alle außer At-Tauba – und einmal mitten in einer Sure: im Brief Sulaimans an die Königin von Saba (27:30). Zusammen 114, so viele wie Suren.", src: "Quran 27:30" },
    { ar: "الدَّين", title: "Der längste Vers", body: "Der längste Vers ist der „Vers der Schuld“ (2:282): Er regelt, wie man Schulden schriftlich festhält – ein Zeichen, wie ernst der Quran Gerechtigkeit im Alltag nimmt.", src: "Quran 2:282" },
    { ar: "الكوثر", title: "Die kürzeste Sure", body: "Al-Kauthar (108) hat drei Verse und zehn Wörter. Die längste Sure, Al-Baqara, hat 286 Verse.", src: "Quran 108, 2" },
    { ar: "١١٤", title: "114 Suren, 6.236 Verse", body: "Der Quran hat 114 Suren und 6.236 Verse (Zählung nach Hafs), aufgeteilt in 30 Teile. In unserem Text sind es 77.429 Wörter – je nach Zählweise nennen andere leicht abweichende Zahlen.", src: "Uthmani-Text, König-Fahd-Komplex" },
  ],
  moreTitle: "Noch mehr Geheimnisse",
  more: [
    { ar: "التوبة", title: "Die Sure ohne Basmala", body: "At-Tauba (Sure 9) ist die einzige Sure, die nicht mit „Bismillāh ar-Raḥmān ar-Raḥīm“ beginnt. Die Gelehrten nennen dafür verschiedene Gründe – etwa, dass sie mit einer ernsten Aufkündigung beginnt.", src: "Quran 9:1" },
    { ar: "النمل", title: "Die Sure mit zwei Basmalas", body: "An-Naml (Sure 27) hat die Basmala zweimal: am Anfang und in Vers 30, im Brief Sulaimans an die Königin von Saba.", src: "Quran 27:30" },
    { ar: "المجادلة", title: "Allah in jedem Vers", body: "In Sure Al-Mudschādala (58) steht der Name „Allah“ in jedem ihrer 22 Verse – wir haben jeden einzelnen geprüft.", src: "Quran 58" },
    { ar: "الرحمن", title: "31-mal dieselbe Frage", body: "In Sure Ar-Raḥmān (55) kehrt 31-mal die Frage wieder: „{{t:55:13}}“", src: "Quran 55:13" },
    { ar: "المرسلات", title: "Zehnmal derselbe Vers", body: "Sure Al-Mursalāt (77) wiederholt zehnmal: „{{t:77:15}}“", src: "Quran 77:15" },
    { ar: "أبجد", title: "Alle 28 Buchstaben in einem Vers", body: "Nur zwei Verse enthalten jeden der 28 Buchstaben des arabischen Alphabets: 3:154 und 48:29, der Vers, der die Gefährten des Propheten ﷺ beschreibt.", src: "Quran 3:154, 48:29" },
    { ar: "الم", title: "29 Suren mit rätselhaften Buchstaben", body: "29 Suren beginnen mit einzelnen Buchstaben wie Alif-Lām-Mīm, Yā-Sīn oder Qāf. Ihre Bedeutung kennt Allah allein – viele Gelehrte sehen in ihnen einen Hinweis, dass der Quran aus genau diesen Buchstaben besteht und doch unnachahmlich ist.", src: "z. B. Quran 2:1, 36:1, 50:1" },
    { ar: "يونس", title: "Suren mit Namen von Propheten", body: "Sechs Suren tragen den Namen eines Propheten: Yūnus, Hūd, Yūsuf, Ibrāhīm, Muḥammad ﷺ und Nūḥ. Und eine Sure trägt den Namen einer Frau: Maryam.", src: "Quran 10, 11, 12, 14, 47, 71, 19" },
    { ar: "مكية", title: "86 mekkanische, 28 medinensische Suren", body: "Nach der Einteilung im Madinah-Mushaf wurden 86 Suren in Mekka offenbart und 28 in Medina. Die mekkanischen sprechen vor allem vom Glauben, die medinensischen auch vom Zusammenleben der Gemeinschaft.", src: "Madinah-Mushaf" },
    { ar: "سجدة", title: "Stellen der Niederwerfung", body: "An 15 Stellen ist im Madinah-Mushaf eine Niederwerfung beim Rezitieren markiert (Sudschūd at-Tilāwa). Die Hanafiten zählen 14 (ohne die zweite Stelle in Al-Ḥadsch, 22:77), Schafiʿiten und Hanbaliten ebenfalls 14 (ohne Ṣād, 38:24, die sie als Niederwerfung des Dankes sehen), die Malikiten nach ihrer bekanntesten Ansicht 11.", src: "z. B. Quran 7:206, 22:77, 38:24, 96:19" },
    { ar: "العصر", title: "Drei Suren mit drei Versen", body: "Al-ʿAṣr, Al-Kauthar und An-Naṣr haben je nur drei Verse. Von Imam asch-Schāfiʿī wird überliefert: Hätten die Menschen nur über Al-ʿAṣr nachgedacht, sie hätte ihnen genügt.", src: "Quran 103, 108, 110; Tafsir Ibn Kathir" },
    { ar: "فأسقيناكموه", title: "Eines der längsten Wörter", body: "„fa-asqaynākumūhu“ – „und Wir geben es euch zu trinken“ (15:22) – besteht aus elf Buchstaben und ist eines der längsten Wörter des Quran.", src: "Quran 15:22" },
    { ar: "عمّ", title: "Der letzte Teil: 37 Suren", body: "Der dreißigste Teil, Dschuz ʿAmma, enthält 37 Suren (78–114) – die Suren, die die meisten Muslime als Erstes auswendig lernen.", src: "Quran 78–114" },
    { ar: "الحمد لله", title: "Fünf Suren beginnen mit Lobpreis", body: "Fünf Suren beginnen mit „al-ḥamdu lillāh“ – „Alles Lob gebührt Allah“: Al-Fātiḥa, Al-Anʿām, Al-Kahf, Sabaʾ und Fāṭir. Jede nennt danach ihren eigenen Grund zum Loben: Al-Fātiḥa – Er ist der Herr der Welten; Al-Anʿām – Er schuf Himmel und Erde und machte Finsternis und Licht; Al-Kahf – Er sandte Seinem Diener das Buch herab; Sabaʾ – Ihm gehört, was in den Himmeln und auf der Erde ist; Fāṭir – Er ist der Erschaffer von Himmel und Erde und machte die Engel zu Gesandten.", src: "Quran 1:2, 6:1, 18:1, 34:1, 35:1" },
    { ar: "قل", title: "Fünf Suren beginnen mit „Sag!“", body: "Al-Dschinn, Al-Kāfirūn, Al-Ikhlāṣ, Al-Falaq und An-Nās beginnen mit „Qul“ – „Sag!“. Dass dieses Wort in der Rezitation stehen blieb, zeigt, wie genau der Prophet ﷺ weitergab, was ihm offenbart wurde – bis zum letzten Wort.", src: "Quran 72:1, 109:1, 112:1, 113:1, 114:1" },
    { ar: "زيد", title: "Ein einziger Gefährte mit Namen", body: "Zaid ibn Ḥāritha ist der einzige Gefährte des Propheten ﷺ, der im Quran mit Namen genannt wird – in Sure Al-Aḥzāb. Der Prophet ﷺ hatte ihn einst als Sohn angenommen und liebte ihn sehr.", src: "Quran 33:37" },
    { ar: "جبريل", title: "Engel mit Namen", body: "Nur wenige Engel nennt der Quran beim Namen: Dschibrīl und Mīkāl (2:98), Mālik, den Wächter des Feuers (43:77), sowie Hārūt und Mārūt in Babylon (2:102). Andere Namen kennen wir aus den Hadithen, etwa Isrāfīl.", src: "Quran 2:98, 2:102, 43:77; Sahih Muslim 770" },
    { ar: "بكة", title: "Makka, Bakka, Yathrib", body: "Der Name „Makka“ steht nur einmal im Quran (48:24), ebenso „Bakka“ (3:96) – nach den Gelehrten ein anderer Name für Makka oder für den Ort der Kaaba. Medina wird einmal mit ihrem alten Namen „Yathrib“ genannt (33:13), sonst „al-Madīna“, die Stadt.", src: "Quran 48:24, 3:96, 33:13" },
    { ar: "{{q:5:3:41-42}}", title: "Der Tag der Vollendung", body: "Der Vers von der Vollendung der Religion (5:3) wurde am Tag von ʿArafa herabgesandt, an einem Freitag. Das bestätigte ʿUmar ibn al-Khaṭṭāb, als ein jüdischer Mann ihm sinngemäß sagte, sein Volk hätte einen solchen Tag zum Fest gemacht.", src: "Sahih al-Bukhari 45, Sahih Muslim 3017" },
    { ar: "النصر", title: "Die letzte vollständige Sure", body: "Nach Ibn ʿAbbās war An-Naṣr (110) die letzte Sure, die vollständig auf einmal herabgesandt wurde. Ibn ʿAbbās und ʿUmar verstanden sie als Hinweis, dass sich die Lebenszeit des Propheten ﷺ dem Ende näherte.", src: "Sahih Muslim 3024, Sahih al-Bukhari 4970" },
    { ar: "رمضان", title: "Im Ramadan herabgesandt", body: "Der Quran wurde im Monat Ramadan herabgesandt (2:185), in der Nacht der Bestimmung (97:1). Zu den Menschen kam er Stück für Stück, über rund 23 Jahre: „{{t:17:106}}“ (17:106).", src: "Quran 2:185, 97:1, 17:106" },
    { ar: "المصحف", title: "Gesammelt und bewahrt", body: "Nach der Schlacht von Yamāma, in der viele Quran-Kenner fielen, ließ Abū Bakr den Quran von Zaid ibn Thābit auf Blättern zusammentragen. ʿUthmān ließ davon später Abschriften in die Provinzen senden. „{{t:15:9}}“ (15:9).", src: "Sahih al-Bukhari 4986, 4987; Quran 15:9" },
    { ar: "الملك", title: "Dreißig Verse als Fürsprecher", body: "Sinngemäß überliefert: Sure Al-Mulk (67) mit ihren dreißig Versen trat für einen Mann ein, bis ihm vergeben wurde. Viele lesen sie deshalb vor dem Schlafen.", src: "at-Tirmidhi 2891 (hasan), Abu Dawud 1400" },
    { ar: "الكهف", title: "Zehn Verse als Schutz", body: "Sinngemäß: Die ersten zehn Verse von Sure Al-Kahf auswendig zu kennen, schützt vor dem Daddschāl. Viele lesen die ganze Sure freitags. Der Hadith dazu steht nicht bei al-Bukhari oder Muslim, sondern bei al-Ḥākim und al-Baihaqī; viele Gelehrte stufen ihn als gut (ḥasan) oder authentisch ein.", src: "Sahih Muslim 809; al-Hakim, al-Baihaqi" },
    { ar: "خواتيم البقرة", title: "Zwei Verse für die Nacht", body: "Sinngemäß: Die beiden letzten Verse von Sure Al-Baqara genügen dem, der sie nachts liest. Und vor dem Schlafen hauchte der Prophet ﷺ in seine Hände, las Al-Ikhlāṣ, Al-Falaq und An-Nās und strich damit über seinen Körper – dreimal.", src: "Sahih al-Bukhari 5009, 5017; Sahih Muslim 807" },
  ],
  readTitle: "Wer den Quran liest – was ihm verheißen ist",
  readLead: "Der Quran ist kein Buch, das man einmal liest und weglegt. Diese Worte des Propheten ﷺ sind authentisch überliefert:",
  hadith: [
    { text: "Sinngemäß: Für jeden Buchstaben aus dem Buch Allahs, den man liest, gibt es eine gute Tat, die zehnfach zählt – und Alif-Lām-Mīm sind dabei nicht ein Buchstabe, sondern drei.", src: "at-Tirmidhi 2910", ref: "tirmidhi:2910" },
    { text: "Sinngemäß: Der Quran wird am Tag der Auferstehung kommen und für die eintreten, die ihn gelesen haben.", src: "Sahih Muslim 804", ref: "muslim:1874" },
    { text: "Sinngemäß: Zu den Besten gehört, wer den Quran lernt und ihn andere lehrt.", src: "Sahih al-Bukhari 5027", ref: "bukhari:5027" },
    { text: "Sinngemäß: Wer den Quran gut beherrscht, ist bei den edlen Engeln; wer beim Lesen stockt, weil es ihm schwerfällt, erhält doppelten Lohn.", src: "Sahih al-Bukhari 4937, Sahih Muslim 798", ref: "muslim:1862" },
    { text: "Sinngemäß: Wer mit dem Quran gelebt hat, wird aufgefordert zu lesen und dabei aufzusteigen – sein Rang liegt dort, wo sein Lesen endet.", src: "Abu Dawud 1464, at-Tirmidhi 2914", ref: "abudawud:1464" },
  ],
  wealthTitle: "Segen, Versorgung, Wohlstand",
  wealthLead: "Der Quran verspricht keine Formel für schnelles Geld. Er verspricht etwas Größeres: Barakah – Segen, der in wenig viel sein lässt –, ein gutes Leben und Versorgung von dort, wo man sie nicht erwartet. Das sind seine eigenen Worte:",
  promises: [
    { ref: "71:10-12", title: "Um Vergebung bitten" },
    { ref: "14:7", title: "Dankbarkeit" },
    { ref: "65:2-3", title: "Gottesfurcht und Vertrauen" },
    { ref: "7:96", title: "Segen für ganze Städte" },
    { ref: "16:97", title: "Ein gutes Leben" },
    { ref: "35:29-30", title: "Ein Handel, der nicht verliert" },
    { ref: "13:28", title: "Ruhe für das Herz" },
    { ref: "17:82", title: "Heilung" },
  ],
  wealthNote: "Wer viel Quran liest, wird also nicht „automatisch“ reich – aber er wird reich an dem, was bleibt: Ruhe, Dankbarkeit, Vertrauen und Lohn, der nicht aufhört. Und wer seine Arbeit ehrlich tut, Dank sagt und um Vergebung bittet, darf auf Allahs Versorgung hoffen.",
  wealthHadith: { text: "Sinngemäß: Wahrer Reichtum liegt nicht in viel Besitz, sondern in einer genügsamen Seele.", src: "Sahih al-Bukhari 6446, Sahih Muslim 1051", ref: "bukhari:6446" },
  placesTitle: "Orte, an denen das Herz Frieden findet",
  placesLead: "Frieden mit Allah kann man überall finden – Er ist nahe. Aber es gibt Orte und Zeiten, die Er besonders gesegnet hat.",
  places: [
    { ar: "المسجد الحرام", title: "Al-Masdschid al-Harām, Mekka", body: "Das Haus Allahs, die Kaaba, die Richtung jedes Gebets. Sinngemäß überliefert: Ein Gebet dort wiegt mehr als hunderttausend Gebete anderswo.", src: "Ibn Madscha 1406 (von Gelehrten als authentisch eingestuft)" },
    { ar: "المسجد النبوي", title: "Die Moschee des Propheten, Medina", body: "Sinngemäß überliefert: Ein Gebet dort ist besser als tausend anderswo – außer in der Heiligen Moschee –, und der Platz zwischen seinem Haus und seiner Kanzel ist ein Garten des Paradieses.", src: "Sahih al-Bukhari 1190, 1196; Sahih Muslim 1394" },
    { ar: "المسجد الأقصى", title: "Al-Masdschid al-Aqsā, Jerusalem", body: "Die erste Gebetsrichtung, deren Umgebung Allah gesegnet hat (17:1) – eine der drei Moscheen, zu denen man eigens reist.", src: "Sahih al-Bukhari 1189, Sahih Muslim 1397" },
    { ar: "بيوت الله", title: "Jede Moschee", body: "Sinngemäß überliefert: Die Moscheen sind Allah die liebsten Orte. Wo Menschen sich dort treffen, um den Quran zu lesen und gemeinsam zu lernen, kommt Ruhe (Sakīna) auf sie herab, Barmherzigkeit hüllt sie ein und Engel sind um sie.", src: "Sahih Muslim 671, 2699" },
    { ar: "بيتك", title: "Ihr Zuhause", body: "Sinngemäß überliefert: Ein Zuhause soll nicht still bleiben wie ein Friedhof, und aus dem Haus, in dem Sure Al-Baqara gelesen wird, weicht der Satan. Ein fester Platz für Ihr tägliches Lesen macht Ihr Zuhause zu einem Ort des Friedens.", src: "Sahih Muslim 780" },
    { ar: "الثلث الأخير", title: "Das letzte Drittel der Nacht", body: "Ein Ort in der Zeit: Im letzten Drittel jeder Nacht ruft Allah sinngemäß dazu auf, Ihn anzurufen und zu bitten – Er antwortet und gibt.", src: "Sahih al-Bukhari 1145, Sahih Muslim 758" },
    { ar: "آيات الكون", title: "In der Schöpfung", body: "„{{t:3:190}}“ – die Allah gedenken, im Stehen, Sitzen und Liegen (3:190–191).", src: "Quran 3:190–191" },
    { ar: "جامع الشيخ زايد", title: "In den Emiraten", body: "Die Scheich-Zayed-Moschee in Abu Dhabi, die Jumeirah-Moschee in Dubai und die großen Moscheen in Sharjah heißen Besucher willkommen – Orte der Stille mitten im Leben.", src: "", href: "/islam/mosques" },
  ],
  note: "Die Hadithe sind mit Sammlung und Nummer angegeben. Wo es eine Ausgabe in Ihrer Sprache gibt, steht ihr Wortlaut aus der Quelle (fawazahmed0/hadith-api), sonst eine als solche gekennzeichnete Zusammenfassung mit eigenen Worten. Zitierte Verse stammen aus dem Quran-Text und der Übersetzung, die bei der Quelle genannt ist (Quran.com); den ganzen Vers lesen Sie mit einem Tipp auf die Stellenangabe. Bei Fragen zu Urteilen wenden Sie sich an einen Gelehrten.",
  ctaTitle: "Lassen Sie es nicht beim Staunen",
  ctaBody: "Jeder Buchstabe zählt zehnfach. Beginnen Sie heute mit einem Vers – die Shams-Methode führt Sie Schritt für Schritt.",
  cta: "Ersten Vers lernen",
  nav: { title: "Auf dieser Seite", counter: "Wortzähler", claims: "Behauptungen geprüft", facts: "Mit Quelle", more: "Mehr Geheimnisse", read: "Lohn des Lesens", wealth: "Segen und Versorgung", places: "Orte des Friedens", next: "Weiter lernen" },
  verdictHelp: { true: "Unsere eigene Zählung im vollständigen Text bestätigt es.", false: "Unsere Zählung bestätigt es nicht – die tatsächliche Zahl steht in der Antwort.", method: "Stimmt nur mit der angegebenen Zählweise; andere Zählweisen kommen auf andere Zahlen." },
  showPlaces: "Alle Stellen im Zähler zeigen",
  moreGroups: ["Suren und ihre Anfänge", "Wiederholungen, Buchstaben, Wörter", "Namen im Quran", "Offenbarung und Bewahrung", "Für Gebet, Freitag und Nacht"],
  next: {
    shams: { title: "Die Shams-Methode", body: "Sieben Schritte pro Vers von Nami Shams – hören, rückwärts aufbauen, Merkhilfen, abrufen. So bleibt, was Sie erstaunt hat, im Herzen.", cta: "Methode entdecken" },
    reader: { title: "Den Quran lesen", body: "Alle 114 Suren: Vers für Vers anhören, Übersetzung und Tafsir lesen. Jede Stellenangabe auf dieser Seite öffnet sich dort.", cta: "Quran öffnen" },
  },
};

const en: SecretsContent = {
  kicker: "Checked, not guessed",
  title: "The Secrets of the Quran",
  lead: "Many numbers and “miracles” about the Quran are shared – some are true, some are not. Here we count for ourselves, in the complete Uthmani text, and say openly what is established. Plus: what is promised to those who read the Quran, and where the heart most easily finds peace.",
  counterTitle: "How often does it appear in the Quran?",
  counterLead: "Tap a word. You see how often it occurs – and every single place, ready to read.",
  method: "Counted in the Uthmani text of the King Fahd Complex in Madinah (6,236 verses, Hafs count). Word forms are counted with the article and prefixed particles (wa-, fa-, bi-, li-, ka-), without attached pronouns; names also with the vocative “yā”. Other ways of counting can give slightly different numbers – that is why we state the method.",
  times: "times", spots: "places", open: "Open", allahNote: "For “Allah” we only show the number – the places would be too many for a list.",
  words: [
    { key: "fearNot", ar: "لَا تَخَفْ", label: "“Do not fear”" },
    { key: "noFear", ar: "لَا خَوْفٌ عَلَيْهِمْ", label: "“No fear upon them”" },
    { key: "allah", ar: "ٱللَّه", label: "Allah" },
    { key: "rahman", ar: "ٱلرَّحْمَـٰن", label: "The Most Merciful" },
    { key: "yawm", ar: "يَوْم", label: "Day" },
    { key: "shahr", ar: "شَهْر", label: "Month" },
    { key: "dunya", ar: "ٱلدُّنْيَا", label: "This world" },
    { key: "akhira", ar: "ٱلْـَٔاخِرَة", label: "The Hereafter" },
    { key: "musa", ar: "مُوسَىٰ", label: "Musa" },
    { key: "ibrahim", ar: "إِبْرَٰهِيم", label: "Ibrahim" },
    { key: "nuh", ar: "نُوح", label: "Nuh" },
    { key: "yusuf", ar: "يُوسُف", label: "Yusuf" },
    { key: "isa", ar: "عِيسَىٰ", label: "Isa" },
    { key: "adam", ar: "ءَادَم", label: "Adam" },
    { key: "maryam", ar: "مَرْيَم", label: "Maryam" },
    { key: "muhammad", ar: "مُحَمَّد", label: "Muhammad ﷺ" },
    { key: "ahmad", ar: "أَحْمَد", label: "Ahmad ﷺ" },
  ],
  claimsTitle: "Popular claims – counted again",
  claimsLead: "What is shared on social media is often well meant. But the Quran needs no invented numbers. We checked every statement ourselves.",
  verdicts: { true: "True", false: "Not quite", method: "True – with this way of counting" },
  claims: [
    { q: "“Do not fear” appears 365 times in the Quran – once for every day of the year.", v: "false", key: "fearNot", a: "As a direct command – “lā takhaf”, “lā takhāfī”, “lā takhāfū”, “lā takhāfā” – it occurs 13 times: said to Ibrahim, to Musa and Harun, to the mother of Musa, to Lut, to Dawud and to the believers. In addition, 13 times comes the promise of being free from fear and grief. 26 places together – fewer than claimed, but every one of them a comfort." },
    { q: "The word “day” appears 365 times in the Quran.", v: "method", key: "yawm", a: "Counting the singular “yawm” and “yawman” – with article and particles, but without attached pronouns and without “yawma’idhin” (on that day) – gives exactly 365 places. Other ways of counting give other numbers. It remains remarkable." },
    { q: "The word “month” appears 12 times in the Quran.", v: "true", key: "shahr", a: "In the singular (“shahr”, “ash-shahr”, “shahran”) there are 12 places. And the Quran itself names twelve months with Allah (9:36)." },
    { q: "“This world” and “the Hereafter” appear equally often – 115 times each.", v: "method", key: "dunya", a: "Counted with article and particles: ad-dunyā 115 times, al-ākhira 115 times. Not counted is 3:72, where “ākhirahu” means “its end” (of the day), not the Hereafter." },
    { q: "The name “Allah” appears 2,699 times in the Quran.", v: "true", key: "allah", a: "Counted with all prefixes such as wallāhi, billāhi, lillāhi, there are 2,699 places (without “Allāhumma”). This matches the well-known counts." },
    { q: "Musa is the most mentioned prophet.", v: "true", key: "musa", a: "Musa is named 136 times – more than any other prophet. Then come Ibrahim (69), Nuh (43), Yusuf (27), Isa and Adam (25 each)." },
    { q: "Maryam is the only woman mentioned by name in the Quran.", v: "true", key: "maryam", a: "Yes. Her name appears 34 times, and a whole surah bears her name: surah 19, Maryam." },
    { q: "The Prophet Muhammad ﷺ is mentioned by name only four times.", v: "true", key: "muhammad", a: "Four times as “Muhammad” (3:144, 33:40, 47:2, 48:29) and once as “Ahmad” (61:6) – in many other places Allah addresses him as “O Prophet” and “O Messenger”." },
  ],
  factsTitle: "What truly amazes – with sources",
  facts: [
    { ar: "الفاتحة", title: "The greatest surah", body: "The Prophet ﷺ called Al-Fātiḥa the greatest surah of the Quran and “the seven oft-repeated” – it is recited in every unit of prayer.", src: "Sahih al-Bukhari 4474" },
    { ar: "آية الكرسي", title: "The greatest verse", body: "Āyat al-Kursī (2:255) is the greatest verse in the Book of Allah – so the Prophet ﷺ taught his companion Ubayy ibn Ka‘b.", src: "Sahih Muslim 810" },
    { ar: "الإخلاص", title: "A third of the Quran", body: "Surah Al-Ikhlāṣ (112) equals a third of the Quran – four short verses on the oneness of Allah.", src: "Sahih al-Bukhari 5013" },
    { ar: "اقرأ", title: "The first word", body: "The first revelation in the cave of Ḥirā’ begins with “Read!” (96:1–5). The Quran begins its descent with knowledge.", src: "Sahih al-Bukhari 3" },
    { ar: "البسملة", title: "114 basmalas", body: "“Bismillāh ar-Raḥmān ar-Raḥīm” stands at the beginning of 113 surahs – all except At-Tawbah – and once inside a surah: in Sulayman’s letter to the Queen of Sheba (27:30). 114 together, as many as there are surahs.", src: "Quran 27:30" },
    { ar: "الدَّين", title: "The longest verse", body: "The longest verse is the “verse of debt” (2:282): it sets out how to record debts in writing – a sign of how seriously the Quran takes justice in daily life.", src: "Quran 2:282" },
    { ar: "الكوثر", title: "The shortest surah", body: "Al-Kawthar (108) has three verses and ten words. The longest surah, Al-Baqarah, has 286 verses.", src: "Quran 108, 2" },
    { ar: "١١٤", title: "114 surahs, 6,236 verses", body: "The Quran has 114 surahs and 6,236 verses (Hafs count), divided into 30 parts. Our text has 77,429 words – depending on the way of counting, others give slightly different numbers.", src: "Uthmani text, King Fahd Complex" },
  ],
  moreTitle: "More secrets",
  more: [
    { ar: "التوبة", title: "The surah without a basmala", body: "At-Tawbah (surah 9) is the only surah that does not begin with “Bismillāh ar-Raḥmān ar-Raḥīm”. Scholars give various reasons – for example that it opens with a solemn declaration of disassociation.", src: "Quran 9:1" },
    { ar: "النمل", title: "The surah with two basmalas", body: "An-Naml (surah 27) has the basmala twice: at its beginning and in verse 30, in Sulayman’s letter to the Queen of Sheba.", src: "Quran 27:30" },
    { ar: "المجادلة", title: "Allah in every verse", body: "In surah Al-Mujādilah (58) the name “Allah” appears in every one of its 22 verses – we checked each one.", src: "Quran 58" },
    { ar: "الرحمن", title: "The same question 31 times", body: "In surah Ar-Raḥmān (55) one question returns 31 times: “{{t:55:13}}”", src: "Quran 55:13" },
    { ar: "المرسلات", title: "Ten times the same verse", body: "Surah Al-Mursalāt (77) repeats ten times: “{{t:77:15}}”", src: "Quran 77:15" },
    { ar: "أبجد", title: "All 28 letters in one verse", body: "Only two verses contain every one of the 28 letters of the Arabic alphabet: 3:154 and 48:29, the verse that describes the companions of the Prophet ﷺ.", src: "Quran 3:154, 48:29" },
    { ar: "الم", title: "29 surahs with mysterious letters", body: "29 surahs begin with single letters such as Alif-Lām-Mīm, Yā-Sīn or Qāf. Their meaning is known to Allah alone – many scholars see in them a sign that the Quran is made of exactly these letters and yet cannot be imitated.", src: "e.g. Quran 2:1, 36:1, 50:1" },
    { ar: "يونس", title: "Surahs named after prophets", body: "Six surahs bear the name of a prophet: Yūnus, Hūd, Yūsuf, Ibrāhīm, Muḥammad ﷺ and Nūḥ. And one surah bears the name of a woman: Maryam.", src: "Quran 10, 11, 12, 14, 47, 71, 19" },
    { ar: "مكية", title: "86 Makkan, 28 Madinan surahs", body: "According to the classification in the Madinah mushaf, 86 surahs were revealed in Makkah and 28 in Madinah. The Makkan surahs speak above all of faith, the Madinan ones also of life together as a community.", src: "Madinah mushaf" },
    { ar: "سجدة", title: "Places of prostration", body: "In 15 places the Madinah mushaf marks a prostration during recitation (sujūd at-tilāwah). The Hanafis count 14 (without the second in Al-Ḥajj, 22:77), the Shafiʿis and Hanbalis also 14 (without Ṣād, 38:24, which they see as a prostration of gratitude), and the Malikis, in their best-known view, 11.", src: "e.g. Quran 7:206, 22:77, 38:24, 96:19" },
    { ar: "العصر", title: "Three surahs with three verses", body: "Al-ʿAṣr, Al-Kawthar and An-Naṣr each have only three verses. Imam ash-Shāfiʿī is reported to have said: had people reflected only on Al-ʿAṣr, it would have sufficed them.", src: "Quran 103, 108, 110; Tafsir Ibn Kathir" },
    { ar: "فأسقيناكموه", title: "One of the longest words", body: "“fa-asqaynākumūhu” – “and We gave it to you to drink” (15:22) – has eleven letters and is one of the longest words in the Quran.", src: "Quran 15:22" },
    { ar: "عمّ", title: "The last part: 37 surahs", body: "The thirtieth part, Juz ʿAmma, contains 37 surahs (78–114) – the surahs most Muslims learn by heart first.", src: "Quran 78–114" },
    { ar: "الحمد لله", title: "Five surahs begin with praise", body: "Five surahs begin with “al-ḥamdu lillāh” – “All praise is due to Allah”: Al-Fātiḥa, Al-Anʿām, Al-Kahf, Sabaʾ and Fāṭir. Each then gives its own reason for praise: Al-Fātiḥa – He is Lord of the worlds; Al-Anʿām – He created the heavens and the earth and made darkness and light; Al-Kahf – He sent down the Book to His servant; Sabaʾ – to Him belongs all that is in the heavens and the earth; Fāṭir – He originated the heavens and the earth and made the angels messengers.", src: "Quran 1:2, 6:1, 18:1, 34:1, 35:1" },
    { ar: "قل", title: "Five surahs begin with “Say!”", body: "Al-Jinn, Al-Kāfirūn, Al-Ikhlāṣ, Al-Falaq and An-Nās begin with “Qul” – “Say!”. That this word remained in the recitation shows how precisely the Prophet ﷺ passed on what was revealed to him – down to the last word.", src: "Quran 72:1, 109:1, 112:1, 113:1, 114:1" },
    { ar: "زيد", title: "Only one companion by name", body: "Zayd ibn Ḥāritha is the only companion of the Prophet ﷺ mentioned by name in the Quran – in Surah Al-Aḥzāb. The Prophet ﷺ had once taken him as a son and loved him dearly.", src: "Quran 33:37" },
    { ar: "جبريل", title: "Angels by name", body: "The Quran names only a few angels: Jibrīl and Mīkāl (2:98), Mālik, the keeper of the Fire (43:77), and Hārūt and Mārūt in Babylon (2:102). Other names we know from the hadith, such as Isrāfīl.", src: "Quran 2:98, 2:102, 43:77; Sahih Muslim 770" },
    { ar: "بكة", title: "Makkah, Bakkah, Yathrib", body: "The name “Makkah” appears only once in the Quran (48:24), and so does “Bakkah” (3:96) – according to scholars another name for Makkah or for the site of the Kaaba. Madinah is called once by its old name “Yathrib” (33:13), and otherwise “al-Madīnah”, the City.", src: "Quran 48:24, 3:96, 33:13" },
    { ar: "{{q:5:3:41-42}}", title: "The day of completion", body: "The verse on the perfection of the religion (5:3) was revealed on the day of ʿArafah, on a Friday. ʿUmar ibn al-Khaṭṭāb confirmed this when a Jewish man told him, in essence, that his people would have made such a day a festival.", src: "Sahih al-Bukhari 45, Sahih Muslim 3017" },
    { ar: "النصر", title: "The last complete surah", body: "According to Ibn ʿAbbās, An-Naṣr (110) was the last surah revealed complete, all at once. Ibn ʿAbbās and ʿUmar understood it as a sign that the Prophet’s ﷺ life was drawing to its close.", src: "Sahih Muslim 3024, Sahih al-Bukhari 4970" },
    { ar: "رمضان", title: "Sent down in Ramadan", body: "The Quran was sent down in the month of Ramadan (2:185), on the Night of Decree (97:1). It reached people piece by piece, over some 23 years: “{{t:17:106}}” (17:106).", src: "Quran 2:185, 97:1, 17:106" },
    { ar: "المصحف", title: "Gathered and preserved", body: "After the battle of Yamāmah, in which many who knew the Quran by heart were killed, Abū Bakr had Zayd ibn Thābit gather the Quran on sheets. ʿUthmān later had copies of it sent to the provinces. “{{t:15:9}}” (15:9).", src: "Sahih al-Bukhari 4986, 4987; Quran 15:9" },
    { ar: "الملك", title: "Thirty verses that intercede", body: "In essence, as reported: Surah Al-Mulk (67), with its thirty verses, pleaded for a man until he was forgiven. That is why many recite it before sleeping.", src: "at-Tirmidhi 2891 (hasan), Abu Dawud 1400" },
    { ar: "الكهف", title: "Ten verses of protection", body: "In essence: knowing the first ten verses of Surah Al-Kahf by heart protects from the Dajjāl. Many read the whole surah on Fridays. The hadith on that is not in al-Bukhari or Muslim but in al-Ḥākim and al-Bayhaqī; many scholars grade it good (ḥasan) or authentic.", src: "Sahih Muslim 809; al-Hakim, al-Bayhaqi" },
    { ar: "خواتيم البقرة", title: "Two verses for the night", body: "In essence: the last two verses of Surah Al-Baqarah suffice whoever recites them at night. And before sleeping, the Prophet ﷺ would blow into his cupped hands, recite Al-Ikhlāṣ, Al-Falaq and An-Nās and wipe over his body with them – three times.", src: "Sahih al-Bukhari 5009, 5017; Sahih Muslim 807" },
  ],
  readTitle: "Whoever reads the Quran – what is promised",
  readLead: "The Quran is not a book to read once and put away. These words of the Prophet ﷺ are authentically reported:",
  hadith: [
    { text: "In essence: every letter one reads from the Book of Allah brings a good deed worth ten – and Alif-Lām-Mīm is not one letter but three.", src: "at-Tirmidhi 2910", ref: "tirmidhi:2910" },
    { text: "In essence: the Quran will come on the Day of Resurrection to intercede for those who read it.", src: "Sahih Muslim 804", ref: "muslim:1874" },
    { text: "In essence: among the best of people are those who learn the Quran and teach it to others.", src: "Sahih al-Bukhari 5027", ref: "bukhari:5027" },
    { text: "In essence: whoever is skilled in the Quran is with the noble angels, and whoever stumbles while reading because it is hard for him receives a double reward.", src: "Sahih al-Bukhari 4937, Sahih Muslim 798", ref: "muslim:1862" },
    { text: "In essence: whoever lived with the Quran will be told to read and rise – his rank is where his reading ends.", src: "Abu Dawud 1464, at-Tirmidhi 2914", ref: "abudawud:1464" },
  ],
  wealthTitle: "Blessing, provision, prosperity",
  wealthLead: "The Quran promises no formula for quick money. It promises something greater: barakah – blessing that makes little go far –, a good life and provision from where one does not expect it. These are its own words:",
  promises: [
    { ref: "71:10-12", title: "Asking forgiveness" },
    { ref: "14:7", title: "Gratitude" },
    { ref: "65:2-3", title: "God-consciousness and trust" },
    { ref: "7:96", title: "Blessing for whole towns" },
    { ref: "16:97", title: "A good life" },
    { ref: "35:29-30", title: "A trade that never fails" },
    { ref: "13:28", title: "Rest for the heart" },
    { ref: "17:82", title: "Healing" },
  ],
  wealthNote: "Reading a lot of Quran does not make anyone rich “automatically” – but it makes you rich in what lasts: calm, gratitude, trust and a reward that never ends. And whoever works honestly, gives thanks and asks forgiveness may hope for Allah’s provision.",
  wealthHadith: { text: "In essence: true wealth is not having many possessions but a soul that is content.", src: "Sahih al-Bukhari 6446, Sahih Muslim 1051", ref: "bukhari:6446" },
  placesTitle: "Places where the heart finds peace",
  placesLead: "Peace with Allah can be found anywhere – He is near. But there are places and times He has especially blessed.",
  places: [
    { ar: "المسجد الحرام", title: "Al-Masjid al-Haram, Makkah", body: "The House of Allah, the Kaaba, the direction of every prayer. In essence, as reported: a prayer there outweighs a hundred thousand prayers elsewhere.", src: "Ibn Majah 1406 (graded authentic by scholars)" },
    { ar: "المسجد النبوي", title: "The Prophet’s Mosque, Madinah", body: "In essence, as reported: a prayer there is better than a thousand elsewhere – except in the Sacred Mosque –, and the space between his house and his pulpit is a garden of Paradise.", src: "Sahih al-Bukhari 1190, 1196; Sahih Muslim 1394" },
    { ar: "المسجد الأقصى", title: "Al-Masjid al-Aqsa, Jerusalem", body: "The first qibla, whose surroundings Allah has blessed (17:1) – one of the three mosques to which one sets out especially.", src: "Sahih al-Bukhari 1189, Sahih Muslim 1397" },
    { ar: "بيوت الله", title: "Every mosque", body: "In essence, as reported: the mosques are the places Allah loves most. Where people meet there to read the Quran and study it together, tranquillity (sakīnah) descends upon them, mercy covers them and angels surround them.", src: "Sahih Muslim 671, 2699" },
    { ar: "بيتك", title: "Your home", body: "In essence, as reported: a home should not stay silent like a graveyard, and Satan withdraws from the house in which Surah Al-Baqarah is recited. A fixed place for your daily reading makes your home a place of peace.", src: "Sahih Muslim 780" },
    { ar: "الثلث الأخير", title: "The last third of the night", body: "A place in time: in the last third of every night Allah calls, in essence, on people to call upon Him and ask Him – He answers and gives.", src: "Sahih al-Bukhari 1145, Sahih Muslim 758" },
    { ar: "آيات الكون", title: "In creation", body: "“{{t:3:190}}” – who remember Allah standing, sitting and lying on their sides (3:190–191).", src: "Quran 3:190–191" },
    { ar: "جامع الشيخ زايد", title: "In the Emirates", body: "The Sheikh Zayed Grand Mosque in Abu Dhabi, the Jumeirah Mosque in Dubai and the great mosques of Sharjah welcome visitors – places of stillness in the middle of life.", src: "", href: "/islam/mosques" },
  ],
  note: "Hadith are given with collection and number. Where an edition exists in your language, its wording is shown from the source (fawazahmed0/hadith-api); otherwise a summary in our own words, marked as such. Quoted verses come from the Quran text and the translation named in the source line (Quran.com); tap a reference to read the whole verse. For questions about rulings, please ask a scholar.",
  ctaTitle: "Don’t stop at amazement",
  ctaBody: "Every letter counts tenfold. Start today with one verse – the Shams Method guides you step by step.",
  cta: "Learn your first verse",
  nav: { title: "On this page", counter: "Word counter", claims: "Claims checked", facts: "With sources", more: "More secrets", read: "Reward of reading", wealth: "Blessing and provision", places: "Places of peace", next: "Keep learning" },
  verdictHelp: { true: "Our own count in the complete text confirms it.", false: "Our count does not confirm it – the actual number is in the answer.", method: "True only with the counting method stated; other methods arrive at other numbers." },
  showPlaces: "Show every place in the counter",
  moreGroups: ["Surahs and their openings", "Repetitions, letters, words", "Names in the Quran", "Revelation and preservation", "For prayer, Friday and the night"],
  next: {
    shams: { title: "The Shams Method", body: "Seven steps per verse by Nami Shams – listen, build up backwards, memory hooks, recall. So what amazed you stays in your heart.", cta: "Discover the method" },
    reader: { title: "Read the Quran", body: "All 114 surahs: listen verse by verse, read translation and tafsir. Every reference on this page opens there.", cta: "Open the Quran" },
  },
};

const ar: SecretsContent = {
  kicker: "عدٌّ موثَّق لا تخمين",
  title: "أسرار القرآن",
  lead: "تنتشر عن القرآن أرقامٌ و«معجزات» كثيرة، بعضها صحيح وبعضها لا يصح. هنا نعدّ بأنفسنا في النص العثماني الكامل، ونبيّن بصراحة ما ثبت. ومعها: ما وُعد به قارئ القرآن، وأين يجد القلب السكينة أيسر ما تكون.",
  counterTitle: "كم مرة وردت في القرآن؟",
  counterLead: "اضغط على كلمة لترى عدد مرات ورودها، وكل موضع منها لتقرأه مباشرة.",
  method: "العدّ في النص العثماني لمجمع الملك فهد بالمدينة المنورة (6236 آية بعدّ حفص). تُعدّ صيغ الكلمة مع «أل» والحروف السابقة (و، ف، ب، ل، ك) دون الضمائر المتصلة، وفي الأعلام مع حرف النداء «يا» أيضًا. قد تختلف الأعداد قليلًا باختلاف طريقة العدّ، ولذلك نذكر الطريقة.",
  times: "مرة", spots: "موضعًا", open: "افتح", allahNote: "في لفظ الجلالة نذكر العدد فقط، لكثرة المواضع.",
  words: [
    { key: "fearNot", ar: "لَا تَخَفْ", label: "«لا تخف»" },
    { key: "noFear", ar: "لَا خَوْفٌ عَلَيْهِمْ", label: "«لا خوف عليهم»" },
    { key: "allah", ar: "ٱللَّه", label: "لفظ الجلالة" },
    { key: "rahman", ar: "ٱلرَّحْمَـٰن", label: "الرحمن" },
    { key: "yawm", ar: "يَوْم", label: "يوم" },
    { key: "shahr", ar: "شَهْر", label: "شهر" },
    { key: "dunya", ar: "ٱلدُّنْيَا", label: "الدنيا" },
    { key: "akhira", ar: "ٱلْـَٔاخِرَة", label: "الآخرة" },
    { key: "musa", ar: "مُوسَىٰ", label: "موسى" },
    { key: "ibrahim", ar: "إِبْرَٰهِيم", label: "إبراهيم" },
    { key: "nuh", ar: "نُوح", label: "نوح" },
    { key: "yusuf", ar: "يُوسُف", label: "يوسف" },
    { key: "isa", ar: "عِيسَىٰ", label: "عيسى" },
    { key: "adam", ar: "ءَادَم", label: "آدم" },
    { key: "maryam", ar: "مَرْيَم", label: "مريم" },
    { key: "muhammad", ar: "مُحَمَّد", label: "محمد ﷺ" },
    { key: "ahmad", ar: "أَحْمَد", label: "أحمد ﷺ" },
  ],
  claimsTitle: "أقوال منتشرة، أعدنا عدّها",
  claimsLead: "كثيرٌ مما يُتداول في وسائل التواصل حسن النية، لكن القرآن لا يحتاج إلى أرقام مخترعة. لقد تحققنا من كل قول بأنفسنا.",
  verdicts: { true: "صحيح", false: "لا يصح بهذه الصيغة", method: "صحيح بهذه الطريقة في العدّ" },
  claims: [
    { q: "«لا تخف» وردت 365 مرة في القرآن، مرةً لكل يوم من أيام السنة.", v: "false", key: "fearNot", a: "وردت بصيغة النهي المباشر «لا تخف، لا تخافي، لا تخافوا، لا تخافا» 13 مرة: خطابًا لإبراهيم، ولموسى وهارون، ولأم موسى، وللوط، ولداود، وللمؤمنين. ووردت بشارة «{{q:10:62:5-10}}» 13 مرة أخرى. فالمجموع 26 موضعًا، أقل مما يقال، وفي كل موضع منها طمأنينة." },
    { q: "كلمة «يوم» وردت 365 مرة في القرآن.", v: "method", key: "yawm", a: "إذا عُدّ المفرد «يوم» و«يومًا» مع «أل» والحروف السابقة، دون الضمائر المتصلة ودون «يومئذ»، كان العدد 365 موضعًا تمامًا. وبطرق عدٍّ أخرى تختلف الأعداد، ويبقى الأمر لافتًا." },
    { q: "كلمة «شهر» وردت 12 مرة في القرآن.", v: "true", key: "shahr", a: "بصيغة المفرد «شهر، الشهر، شهرًا» وردت 12 مرة. والقرآن نفسه يقول: ﴿{{q:9:36:1-8}}﴾ (التوبة: 36)." },
    { q: "«الدنيا» و«الآخرة» وردتا بعدد متساوٍ، 115 مرة لكلٍّ منهما.", v: "method", key: "dunya", a: "بالعدّ مع «أل» والحروف السابقة: الدنيا 115 مرة، والآخرة 115 مرة. ولا يُعدّ موضع آل عمران 72 لأن «آخِرَه» فيه بمعنى آخر النهار لا الدار الآخرة." },
    { q: "لفظ الجلالة «الله» ورد 2699 مرة.", v: "true", key: "allah", a: "مع كل السوابق مثل «والله، بالله، لله» يبلغ العدد 2699 موضعًا دون «اللهم»، وهو موافق للإحصاءات المعروفة." },
    { q: "موسى عليه السلام أكثر الأنبياء ذكرًا في القرآن.", v: "true", key: "musa", a: "ذُكر موسى باسمه 136 مرة، أكثر من أي نبي آخر، ثم إبراهيم (69)، ثم نوح (43)، ثم يوسف (27)، ثم عيسى وآدم (25 لكلٍّ منهما)." },
    { q: "مريم عليها السلام هي المرأة الوحيدة المذكورة باسمها في القرآن.", v: "true", key: "maryam", a: "نعم، ورد اسمها 34 مرة، وسُمّيت باسمها سورة كاملة: سورة مريم (19)." },
    { q: "ذُكر النبي محمد ﷺ باسمه أربع مرات فقط.", v: "true", key: "muhammad", a: "أربع مرات باسم «محمد» (آل عمران 144، الأحزاب 40، محمد 2، الفتح 29)، ومرة باسم «أحمد» (الصف 6)، ويخاطبه الله في مواضع كثيرة بـ«يا أيها النبي» و«يا أيها الرسول»." },
  ],
  factsTitle: "ما يدعو إلى التأمل حقًّا، مع المصدر",
  facts: [
    { ar: "الفاتحة", title: "أعظم سورة", body: "سمّى النبي ﷺ الفاتحة أعظم سورة في القرآن، وهي السبع المثاني، تُقرأ في كل ركعة.", src: "صحيح البخاري 4474" },
    { ar: "آية الكرسي", title: "أعظم آية", body: "آية الكرسي (البقرة: 255) أعظم آية في كتاب الله، كما علّم النبي ﷺ أُبيَّ بن كعب.", src: "صحيح مسلم 810" },
    { ar: "الإخلاص", title: "ثلث القرآن", body: "سورة الإخلاص (112) تعدل ثلث القرآن، أربع آيات قصيرة في توحيد الله.", src: "صحيح البخاري 5013" },
    { ar: "اقرأ", title: "الكلمة الأولى", body: "بدأ الوحي في غار حراء بقوله تعالى: ﴿اقْرَأْ﴾ (العلق: 1–5)، فكان أول ما نزل دعوة إلى العلم.", src: "صحيح البخاري 3" },
    { ar: "البسملة", title: "114 بسملة", body: "«بسم الله الرحمن الرحيم» في أول 113 سورة، كلها إلا التوبة، ومرة في أثناء سورة: في كتاب سليمان إلى ملكة سبأ (النمل: 30). فالمجموع 114، بعدد السور.", src: "النمل: 30" },
    { ar: "الدَّين", title: "أطول آية", body: "أطول آية في القرآن آية الدَّين (البقرة: 282)، تنظّم توثيق الديون كتابةً، دليلًا على عناية القرآن بالعدل في المعاملات اليومية.", src: "البقرة: 282" },
    { ar: "الكوثر", title: "أقصر سورة", body: "سورة الكوثر (108) ثلاث آيات وعشر كلمات، وأطول السور البقرة بمئتين وست وثمانين آية.", src: "الكوثر، البقرة" },
    { ar: "١١٤", title: "114 سورة و6236 آية", body: "في القرآن 114 سورة و6236 آية بعدّ حفص، مقسّمة إلى ثلاثين جزءًا. وفي النص الذي عددنا فيه 77429 كلمة، وقد تختلف الأعداد قليلًا باختلاف طريقة العدّ.", src: "النص العثماني، مجمع الملك فهد" },
  ],
  moreTitle: "مزيد من الأسرار",
  more: [
    { ar: "التوبة", title: "السورة التي لا تبدأ بالبسملة", body: "سورة التوبة (9) هي السورة الوحيدة التي لم تُفتتح بـ«بسم الله الرحمن الرحيم»، وذكر العلماء لذلك أسبابًا، منها أنها افتُتحت بإعلان البراءة.", src: "التوبة: 1" },
    { ar: "النمل", title: "سورة فيها بسملتان", body: "في سورة النمل (27) بسملتان: في أولها، وفي الآية 30 في كتاب سليمان إلى ملكة سبأ.", src: "النمل: 30" },
    { ar: "المجادلة", title: "لفظ الجلالة في كل آية", body: "في سورة المجادلة (58) ورد لفظ الجلالة «الله» في كل آية من آياتها الاثنتين والعشرين، وقد تحققنا من كل آية.", src: "سورة المجادلة" },
    { ar: "الرحمن", title: "السؤال نفسه 31 مرة", body: "في سورة الرحمن (55) يتكرر قوله تعالى: ﴿{{q:55:13}}﴾ إحدى وثلاثين مرة.", src: "الرحمن: 13" },
    { ar: "المرسلات", title: "عشر مرات: ﴿{{q:77:15:1-2}}﴾", body: "تكرر في سورة المرسلات (77) قوله تعالى: ﴿{{q:77:15}}﴾ عشر مرات.", src: "المرسلات: 15" },
    { ar: "أبجد", title: "الحروف الثمانية والعشرون في آية واحدة", body: "آيتان فقط جمعت كل منهما حروف الهجاء الثمانية والعشرين: آل عمران 154، والفتح 29 التي تصف أصحاب النبي ﷺ.", src: "آل عمران: 154، الفتح: 29" },
    { ar: "الم", title: "29 سورة تبدأ بالحروف المقطعة", body: "تبدأ 29 سورة بحروف مقطعة مثل ﴿الم﴾ و﴿يس﴾ و﴿ق﴾، والله أعلم بمراده بها، ويرى كثير من العلماء فيها إشارة إلى أن القرآن مؤلَّف من هذه الحروف نفسها ومع ذلك لا يُستطاع الإتيان بمثله.", src: "مثل البقرة: 1، يس: 1، ق: 1" },
    { ar: "يونس", title: "سور بأسماء الأنبياء", body: "ست سور تحمل أسماء أنبياء: يونس، وهود، ويوسف، وإبراهيم، ومحمد ﷺ، ونوح. وسورة واحدة تحمل اسم امرأة: مريم.", src: "السور 10، 11، 12، 14، 47، 71، 19" },
    { ar: "مكية", title: "86 سورة مكية و28 مدنية", body: "بحسب تصنيف مصحف المدينة نزلت 86 سورة في مكة و28 في المدينة؛ تتحدث المكية في الغالب عن العقيدة، والمدنية أيضًا عن تنظيم حياة المجتمع.", src: "مصحف المدينة النبوية" },
    { ar: "سجدة", title: "مواضع السجود", body: "في مصحف المدينة 15 موضعًا لسجود التلاوة. ويعدّها الحنفية أربعة عشر (دون السجدة الثانية في الحج: 77)، والشافعية والحنابلة أربعة عشر كذلك (دون سجدة ص: 24، ويرونها سجدة شكر)، والمالكية في المشهور عندهم إحدى عشرة.", src: "مثل الأعراف: 206، الحج: 77، ص: 24، العلق: 19" },
    { ar: "العصر", title: "ثلاث سور في كل منها ثلاث آيات", body: "سور العصر والكوثر والنصر في كل منها ثلاث آيات فقط، ويُروى عن الإمام الشافعي: لو تدبّر الناس سورة العصر لكفتهم.", src: "السور 103، 108، 110؛ تفسير ابن كثير" },
    { ar: "فأسقيناكموه", title: "من أطول كلمات القرآن", body: "كلمة ﴿فَأَسْقَيْنَاكُمُوهُ﴾ (الحجر: 22) من أحد عشر حرفًا، وهي من أطول كلمات القرآن.", src: "الحجر: 22" },
    { ar: "عمّ", title: "الجزء الأخير: 37 سورة", body: "يضم الجزء الثلاثون، جزء عمّ، 37 سورة (78–114)، وهي السور التي يحفظها أكثر المسلمين أولًا.", src: "السور 78–114" },
    { ar: "الحمد لله", title: "خمس سور تبدأ بالحمد", body: "خمس سور تُفتتح بـ﴿{{q:1:2:1-2}}﴾: الفاتحة، والأنعام، والكهف، وسبأ، وفاطر. ويذكر كلٌّ منها بعد ذلك سببًا للحمد: الفاتحة ربوبيته للعالمين، والأنعام {{q:6:1:4-9}}، والكهف إنزال الكتاب على عبده، وسبأ أنّ {{q:34:1:4-10}}، وفاطر فطر السماوات والأرض وجعل الملائكة رسلًا.", src: "الفاتحة: 2، الأنعام: 1، الكهف: 1، سبأ: 1، فاطر: 1" },
    { ar: "قل", title: "خمس سور تبدأ بـ﴿قُلْ﴾", body: "سور الجن والكافرون والإخلاص والفلق والناس تبدأ بقوله تعالى: ﴿قُلْ﴾. وفي بقاء هذه الكلمة في التلاوة شاهد على أمانة النبي ﷺ في تبليغ ما أُوحي إليه كما أُوحي، حتى آخر كلمة.", src: "الجن: 1، الكافرون: 1، الإخلاص: 1، الفلق: 1، الناس: 1" },
    { ar: "زيد", title: "صحابي واحد ذُكر باسمه", body: "زيد بن حارثة هو الصحابي الوحيد الذي ورد اسمه صريحًا في القرآن، في سورة الأحزاب. وكان النبي ﷺ قد تبنّاه قبل إبطال التبنّي، وكان يحبه حبًّا شديدًا.", src: "الأحزاب: 37" },
    { ar: "جبريل", title: "ملائكة ذُكروا بأسمائهم", body: "قليل من الملائكة سمّاهم القرآن: جبريل وميكال (البقرة: 98)، ومالك خازن النار (الزخرف: 77)، وهاروت وماروت ببابل (البقرة: 102). وعرفنا من السنة أسماء آخرين، كإسرافيل.", src: "البقرة: 98، 102؛ الزخرف: 77؛ صحيح مسلم 770" },
    { ar: "بكة", title: "مكة وبكة ويثرب", body: "لم يرد اسم «مكة» في القرآن إلا مرة واحدة (الفتح: 24)، وكذلك «بكّة» (آل عمران: 96)، وهي مكة أو موضع البيت منها على أقوال العلماء. وذُكرت المدينة مرة باسمها القديم «يثرب» (الأحزاب: 13)، وفي غيرها باسم «المدينة».", src: "الفتح: 24، آل عمران: 96، الأحزاب: 13" },
    { ar: "{{q:5:3:41-42}}", title: "يوم الإكمال", body: "نزل قوله تعالى: ﴿{{q:5:3:40-43}}﴾ (المائدة: 3) يوم عرفة، وكان يوم جمعة. أخبر بذلك عمر بن الخطاب حين ذكر له رجل من اليهود أن قومه كانوا سيتخذون مثل ذلك اليوم عيدًا.", src: "صحيح البخاري 45، صحيح مسلم 3017" },
    { ar: "النصر", title: "آخر سورة نزلت جميعًا", body: "قال ابن عباس إن سورة النصر (110) آخر سورة نزلت جميعًا. وفهم منها ابن عباس وعمر رضي الله عنهما أنها إشارة إلى قرب أجل النبي ﷺ.", src: "صحيح مسلم 3024، صحيح البخاري 4970" },
    { ar: "رمضان", title: "أُنزل في رمضان", body: "أُنزل القرآن في شهر رمضان (البقرة: 185)، في ليلة القدر (القدر: 1)، ثم نزل على الناس مفرَّقًا نحو ثلاث وعشرين سنة: ﴿{{q:17:106:3-7}}﴾ (الإسراء: 106).", src: "البقرة: 185، القدر: 1، الإسراء: 106" },
    { ar: "المصحف", title: "جُمع وحُفظ", body: "بعد معركة اليمامة التي استُشهد فيها كثير من القرّاء، أمر أبو بكر زيدَ بن ثابت بجمع القرآن في صحف، ثم نسخ عثمان منها المصاحف وأرسلها إلى الأمصار. ﴿{{q:15:9}}﴾ (الحجر: 9).", src: "صحيح البخاري 4986، 4987؛ الحجر: 9" },
    { ar: "الملك", title: "ثلاثون آية تشفع", body: "خلاصة المعنى مما رُوي: أن سورة الملك (67)، وهي ثلاثون آية، كانت شفيعةً لرجل نال بها المغفرة. ولذلك يقرؤها كثيرون قبل النوم.", src: "سنن الترمذي 2891 (حسن)، سنن أبي داود 1400" },
    { ar: "الكهف", title: "عشر آيات عاصمة", body: "خلاصة المعنى: أن حفظ الآيات العشر الأولى من سورة الكهف عصمةٌ من فتنة الدجال. ويقرأ كثيرون السورة كاملة يوم الجمعة؛ وحديث ذلك ليس في الصحيحين، بل رواه الحاكم والبيهقي، وحسّنه أو صحّحه كثير من العلماء.", src: "صحيح مسلم 809؛ الحاكم، البيهقي" },
    { ar: "خواتيم البقرة", title: "آيتان لليل", body: "خلاصة المعنى: أن الآيتين الأخيرتين من سورة البقرة تكفيان من قرأهما في ليلته. ومن هديه ﷺ قبل النوم أن يقرأ الإخلاص والفلق والناس في كفّيه ثم يمرّ بهما على جسده، ثلاث مرات.", src: "صحيح البخاري 5009، 5017؛ صحيح مسلم 807" },
  ],
  readTitle: "ما وُعد به قارئ القرآن",
  readLead: "القرآن ليس كتابًا يُقرأ مرة ثم يُترك. وهذه أحاديث صحيحة عن النبي ﷺ:",
  hadith: [
    { text: "خلاصة المعنى: أن لقارئ القرآن بكل حرف يقرؤه حسنةً تُضاعف عشرًا، وأن «الم» ثلاثة أحرف لا حرف واحد.", src: "سنن الترمذي 2910", ref: "tirmidhi:2910" },
    { text: "خلاصة المعنى: أن القرآن يشفع يوم القيامة لمن صحبه بالقراءة.", src: "صحيح مسلم 804", ref: "muslim:1874" },
    { text: "خلاصة المعنى: أن أفضل الناس منزلةً من جمع بين تعلّم القرآن وتعليمه.", src: "صحيح البخاري 5027", ref: "bukhari:5027" },
    { text: "خلاصة المعنى: أن المتقن لقراءة القرآن مع الملائكة الكرام، ومن يشقّ عليه ويتعثّر فيها فله أجر مضاعف.", src: "صحيح البخاري 4937، صحيح مسلم 798", ref: "muslim:1862" },
    { text: "خلاصة المعنى: أن صاحب القرآن يُدعى إلى القراءة والارتقاء، ومنزلته حيث تنتهي قراءته.", src: "سنن أبي داود 1464، سنن الترمذي 2914", ref: "abudawud:1464" },
  ],
  wealthTitle: "البركة والرزق والسعة",
  wealthLead: "القرآن لا يعِد بوصفة للمال السريع، بل يعِد بما هو أعظم: البركة التي تجعل القليل كثيرًا، والحياة الطيبة، والرزق من حيث لا يُحتسب. وهذه كلماته:",
  promises: [
    { ref: "71:10-12", title: "الاستغفار" },
    { ref: "14:7", title: "الشكر" },
    { ref: "65:2-3", title: "التقوى والتوكل" },
    { ref: "7:96", title: "بركات للقرى" },
    { ref: "16:97", title: "الحياة الطيبة" },
    { ref: "35:29-30", title: "تجارة لن تبور" },
    { ref: "13:28", title: "طمأنينة القلب" },
    { ref: "17:82", title: "الشفاء" },
  ],
  wealthNote: "فمن أكثر من قراءة القرآن لا يصير غنيًّا «تلقائيًّا»، لكنه يغتني بما يبقى: السكينة والشكر والتوكل وأجرٌ لا ينقطع. ومن عمل بصدق وشكر واستغفر فليرجُ رزق الله.",
  wealthHadith: { text: "خلاصة المعنى: أن الغنى الحقيقي ليس بكثرة المال، بل بقناعة النفس.", src: "صحيح البخاري 6446، صحيح مسلم 1051", ref: "bukhari:6446" },
  placesTitle: "أماكن يجد فيها القلب السكينة",
  placesLead: "السكينة مع الله ممكنة في كل مكان، فهو قريب. لكن ثمة أماكن وأوقاتًا خصّها الله بالبركة.",
  places: [
    { ar: "المسجد الحرام", title: "المسجد الحرام، مكة المكرمة", body: "بيت الله والكعبة، قبلة كل مصلٍّ. وخلاصة ما ورد: أن ثواب الصلاة فيه يزيد على ثواب مئة ألف صلاة في غيره.", src: "سنن ابن ماجه 1406 (صحّحه أهل العلم)" },
    { ar: "المسجد النبوي", title: "المسجد النبوي، المدينة المنورة", body: "خلاصة ما ورد: أن الصلاة فيه تفضُل ألف صلاة في غيره عدا المسجد الحرام، وأن ما بين بيته ﷺ ومنبره بقعةٌ من الجنة.", src: "صحيح البخاري 1190، 1196؛ صحيح مسلم 1394" },
    { ar: "المسجد الأقصى", title: "المسجد الأقصى، القدس", body: "القبلة الأولى، الذي بارك الله حوله (الإسراء: 1)، وأحد المساجد الثلاثة التي تُشدّ إليها الرحال.", src: "صحيح البخاري 1189، صحيح مسلم 1397" },
    { ar: "بيوت الله", title: "كل مسجد", body: "خلاصة ما ورد: أن المساجد أحبّ البقاع إلى الله، وأن الذين يجتمعون فيها لقراءة القرآن ومدارسته ينالون السكينة والرحمة، وتكون الملائكة من حولهم.", src: "صحيح مسلم 671، 2699" },
    { ar: "بيتك", title: "بيتك", body: "خلاصة ما ورد: ألّا تُترك البيوت خالية من الصلاة والقراءة كأنها مقابر، وأن قراءة سورة البقرة في البيت تطرد الشيطان منه. ومكان ثابت لوِردك اليومي يجعل بيتك موضع سكينة.", src: "صحيح مسلم 780" },
    { ar: "الثلث الأخير", title: "الثلث الأخير من الليل", body: "مكانٌ في الزمن: في الثلث الأخير من كل ليلة ينادي الله عباده، وخلاصة ندائه أنه يجيب من دعاه ويعطي من سأله.", src: "صحيح البخاري 1145، صحيح مسلم 758" },
    { ar: "آيات الكون", title: "في الخلق", body: "﴿{{q:3:190}}﴾، {{q:3:191:1-7}} (آل عمران: 190–191).", src: "آل عمران: 190–191" },
    { ar: "جامع الشيخ زايد", title: "في الإمارات", body: "جامع الشيخ زايد الكبير في أبوظبي، ومسجد جميرا في دبي، والمساجد الكبرى في الشارقة، ترحّب بالزوار، وهي واحات سكينة في قلب الحياة.", src: "", href: "/islam/mosques" },
  ],
  note: "الأحاديث مذكورة بالكتاب والرقم، ويُعرض نصها من المصدر (fawazahmed0/hadith-api)، فإن تعذّر تحميله ذكرنا خلاصة معناه بكلماتنا مع التنبيه على ذلك. والآيات المقتبسة منقولة من نص المصحف كما في Quran.com؛ اضغط على رقم الآية لقراءتها كاملة. وللأحكام الشرعية ارجع إلى أهل العلم.",
  ctaTitle: "لا تقف عند الإعجاب",
  ctaBody: "كل حرف بعشر حسنات. ابدأ اليوم بآية واحدة، ومنهج شمس يرافقك خطوة بخطوة.",
  cta: "احفظ أول آية",
  nav: { title: "في هذه الصفحة", counter: "عدّاد الكلمات", claims: "ادعاءات مُراجَعة", facts: "حقائق بمصادرها", more: "أسرار أخرى", read: "فضل التلاوة", wealth: "البركة والرزق", places: "أماكن السكينة", next: "تابع التعلّم" },
  verdictHelp: { true: "عدُّنا في النص الكامل يؤكده.", false: "عدُّنا لا يؤكده، والعدد الصحيح مذكور في الجواب.", method: "صحيح بطريقة العدّ المذكورة فقط، وطرق العدّ الأخرى تصل إلى أعداد أخرى." },
  showPlaces: "اعرض كل المواضع في العدّاد",
  moreGroups: ["السور وفواتحها", "تكرار وحروف وكلمات", "أسماء في القرآن", "النزول والحفظ", "للصلاة والجمعة والليل"],
  next: {
    shams: { title: "منهج شمس", body: "سبع خطوات لكل آية من نامي شمس: استماع، وبناء من الآخر، ومعينات للحفظ، واسترجاع؛ ليبقى ما أدهشك في قلبك.", cta: "تعرّف على المنهج" },
    reader: { title: "اقرأ القرآن", body: "السور الـ114 كلها: استمع آية آية، واقرأ التفسير. وكل إحالة في هذه الصفحة تُفتح هناك.", cta: "افتح المصحف" },
  },
};

export async function secretsContent(locale: string): Promise<SecretsContent> {
  if (locale === "de") return resolved("de", de);
  if (locale === "ar") return resolved("ar", ar);
  if (locale === "en") return resolved("en", en);
  let raw: SecretsContent;
  try { raw = { ...en, ...((await import(`../pagecontent/${locale}/secrets`)).default as SecretsContent) }; } catch { return resolved("en", en); }
  return resolved(locale, raw);
}

// the texts of a language with their verse tokens resolved (lib/secrets/scripture.ts), once per language; an item that
// quotes a verse in translation names the translation after its source ("Quran 15:9 · Frank Bubenheim and Nadeem")
const done = new Map<string, SecretsContent>();
function resolved(locale: string, raw: SecretsContent): SecretsContent {
  const hit = done.get(locale);
  if (hit) return hit;
  const name = translationName(locale);
  const named = <T extends { title: string; body: string; src: string }>(items: T[]): T[] =>
    items.map((x) => (quotesTranslation(x.title) || quotesTranslation(x.body)) && name ? { ...x, src: x.src ? `${x.src} · ${name}` : name } : x);
  const c = resolveDeep({ ...raw, facts: named(raw.facts), more: raw.more ? named(raw.more) : raw.more, places: named(raw.places) }, locale);
  done.set(locale, c);
  return c;
}
