// Tajweed course content (riwayah Hafs ʿan ʿĀsim, Shāṭibiyyah path).
// Pure data: the UI renders body_* as Markdown ("## " headings, "- " bullets).
// Verse keys on examples are only given where the exact word/phrase occurs in that verse.

export type Example = { ar: string; key?: string; note_en: string; note_de: string }; // key = Quran verse key like "2:2" if the example word is taken from that verse
export type Question = {
  q_en: string;
  q_de: string;
  options_en: string[];
  options_de: string[];
  answer: number;
  explain_en: string;
  explain_de: string;
};
export type Lesson = {
  id: string;
  level: 1 | 2 | 3;
  title_en: string;
  title_de: string;
  summary_en: string;
  summary_de: string;
  body_en: string;
  body_de: string;
  examples: Example[];
  quiz: Question[];
};

export const TAJWEED_LESSONS: Lesson[] = [
  // ───────────────────────────────────────────── 1
  {
    id: "intro-istiadha-basmala",
    level: 1,
    title_en: "What Tajweed Is – Isti'adha and Basmala",
    title_de: "Was ist Tajweed? – Isti'adha und Basmala",
    summary_en: "Tajweed means giving every letter its due, and every recitation begins with seeking refuge in Allah and, at the start of a surah, the basmala.",
    summary_de: "Tajweed bedeutet, jedem Buchstaben sein Recht zu geben, und jede Rezitation beginnt mit der Zuflucht bei Allah und am Anfang einer Sure mit der Basmala.",
    body_en: `## What does tajweed mean?
The Arabic word *tajwīd* comes from the root *j-w-d* and means "to make something good" or "to perfect it". In recitation it means pronouncing every letter from its correct place of articulation (*makhraj*) and with its correct qualities (*ṣifāt*), and applying the rules that govern letters when they meet each other.

The Quran was revealed with a specific way of reading and passed on from teacher to student. Tajweed is the description of that transmitted sound. In this course we follow the most widespread reading today: **Ḥafṣ ʿan ʿĀṣim**.

## Why it matters
- Some mistakes change the meaning, e.g. confusing ه and ح, or a short and a long vowel. Scholars call these *clear mistakes* (laḥn jalī).
- Other mistakes do not change the meaning but spoil the beauty of the recitation, e.g. a missing ghunnah. These are *hidden mistakes* (laḥn khafī).
- Tajweed is learned mainly by **listening and imitating**. Rules help you understand what you hear.

## Isti'adha – seeking refuge
Before reciting, we say:
- أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ

This follows the instruction in Surah an-Nahl (16:98) to seek refuge in Allah before reading the Quran.

## Basmala
- بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

It is recited at the beginning of every surah except **Surah at-Tawbah** (9). In the middle of a surah it is optional.

## Joining isti'adha, basmala and the surah
There are four permitted ways at the start of a surah:
- stop after each of the three,
- stop after the isti'adha, then join basmala and the first verse,
- join isti'adha and basmala, then stop and start the verse,
- join all three in one breath.

Between two surahs, avoid joining the end of a surah to the basmala and then stopping, because it sounds as if the basmala belonged to the previous surah.

## Practice tip
Listen to one short surah from a well-known reciter three times, then record yourself and compare. Start with the isti'adha and basmala, pronouncing each slowly and calmly.`,
    body_de: `## Was bedeutet Tajweed?
Das arabische Wort *Tadschwid* (meist „Tajweed“ geschrieben) stammt von der Wurzel *dsch-w-d* und heißt „etwas gut machen“ oder „vervollkommnen“. Beim Rezitieren bedeutet es, jeden Buchstaben an seiner richtigen Artikulationsstelle (*Machradsch*) und mit seinen richtigen Eigenschaften (*Sifat*) auszusprechen und die Regeln anzuwenden, die gelten, wenn Buchstaben aufeinandertreffen.

Der Koran wurde mit einer bestimmten Lesart offenbart und von Lehrer zu Schüler weitergegeben. Tajweed beschreibt genau diesen überlieferten Klang. In diesem Kurs folgen wir der heute verbreitetsten Lesart: **Hafs ʿan ʿĀsim**.

## Warum ist das wichtig?
- Manche Fehler verändern die Bedeutung, etwa wenn man ه und ح verwechselt oder einen kurzen Vokal lang liest. Man nennt sie *offensichtliche Fehler* (Lahn dschali).
- Andere Fehler ändern die Bedeutung nicht, nehmen der Rezitation aber ihre Schönheit, z. B. eine fehlende Ghunna. Das sind *versteckte Fehler* (Lahn chafi).
- Tajweed lernt man vor allem durch **Hören und Nachsprechen**. Die Regeln helfen dir zu verstehen, was du hörst.

## Isti'adha – Zuflucht suchen
Vor dem Rezitieren sagen wir:
- أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ

Damit folgen wir der Anweisung in Sure an-Nahl (16:98), vor dem Lesen des Korans Zuflucht bei Allah zu suchen.

## Basmala
- بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

Sie wird am Anfang jeder Sure gesprochen – außer bei **Sure at-Tauba** (9). Mitten in einer Sure ist sie freigestellt.

## Isti'adha, Basmala und Sure verbinden
Am Anfang einer Sure gibt es vier erlaubte Möglichkeiten:
- nach allen dreien jeweils anhalten,
- nach der Isti'adha anhalten, dann Basmala und ersten Vers verbinden,
- Isti'adha und Basmala verbinden, dann anhalten und den Vers beginnen,
- alles in einem Atemzug verbinden.

Zwischen zwei Suren solltest du nicht das Ende der einen Sure mit der Basmala verbinden und dann anhalten – sonst klingt es, als gehöre die Basmala zur vorherigen Sure.

## Übungstipp
Hör dir eine kurze Sure von einem bekannten Rezitator dreimal an, nimm dich dann selbst auf und vergleiche. Beginne mit Isti'adha und Basmala und sprich beides langsam und ruhig.`,
    examples: [
      {
        ar: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
        note_en: "The isti'adha, said before starting to recite. Notice the clear ع in أَعُوذُ and the heavy ط in الشَّيْطَانِ.",
        note_de: "Die Isti'adha vor Beginn der Rezitation. Achte auf das deutliche ع in أَعُوذُ und das schwere ط in الشَّيْطَانِ.",
      },
      {
        ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        key: "1:1",
        note_en: "The basmala, recited at the start of every surah except at-Tawbah. The lam in اللَّهِ is light here because it follows a kasra.",
        note_de: "Die Basmala, am Anfang jeder Sure außer at-Tauba. Das Lam in اللَّهِ ist hier leicht, weil davor ein Kasra steht.",
      },
      {
        ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        key: "1:2",
        note_en: "A simple verse to practise calm, clear articulation: distinguish the ح in الْحَمْدُ from a normal h.",
        note_de: "Ein einfacher Vers zum Üben ruhiger, klarer Aussprache: Unterscheide das ح in الْحَمْدُ von einem gewöhnlichen h.",
      },
      {
        ar: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        key: "112:1",
        note_en: "Confusing ح with ه here (أَحَدٌ) would be a clear mistake (laḥn jalī) because it changes the word.",
        note_de: "Würde man hier ح mit ه verwechseln (أَحَدٌ), wäre das ein offensichtlicher Fehler (Lahn dschali), weil sich das Wort verändert.",
      },
    ],
    quiz: [
      {
        q_en: "What does the word tajweed literally mean?",
        q_de: "Was bedeutet das Wort Tajweed wörtlich?",
        options_en: ["To memorise", "To make something good / perfect it", "To sing", "To translate"],
        options_de: ["Auswendiglernen", "Etwas gut machen / vervollkommnen", "Singen", "Übersetzen"],
        answer: 1,
        explain_en: "Tajweed comes from the root j-w-d, meaning to make something good or excellent.",
        explain_de: "Tajweed kommt von der Wurzel dsch-w-d und bedeutet, etwas gut oder vortrefflich zu machen.",
      },
      {
        q_en: "Which surah does NOT begin with the basmala?",
        q_de: "Welche Sure beginnt NICHT mit der Basmala?",
        options_en: ["Al-Fatihah", "Al-Baqarah", "At-Tawbah", "Al-Ikhlas"],
        options_de: ["Al-Fatiha", "Al-Baqara", "At-Tauba", "Al-Ichlas"],
        answer: 2,
        explain_en: "Surah at-Tawbah (9) is the only surah recited without a basmala at its beginning.",
        explain_de: "Sure at-Tauba (9) ist die einzige Sure, die ohne Basmala am Anfang rezitiert wird.",
      },
      {
        q_en: "A mistake that changes the meaning, e.g. confusing ح and ه, is called…",
        q_de: "Ein Fehler, der die Bedeutung verändert, z. B. die Verwechslung von ح und ه, heißt …",
        options_en: ["Laḥn jalī (clear mistake)", "Laḥn khafī (hidden mistake)", "Ghunnah", "Waqf"],
        options_de: ["Lahn dschali (offensichtlicher Fehler)", "Lahn chafi (versteckter Fehler)", "Ghunna", "Waqf"],
        answer: 0,
        explain_en: "Laḥn jalī is a clear mistake that affects letters or vowels and can change the meaning.",
        explain_de: "Lahn dschali ist ein offensichtlicher Fehler an Buchstaben oder Vokalen, der die Bedeutung verändern kann.",
      },
      {
        q_en: "Which reading (riwayah) does this course follow?",
        q_de: "Welcher Lesart (Riwaya) folgt dieser Kurs?",
        options_en: ["Warsh ʿan Nāfiʿ", "Ḥafṣ ʿan ʿĀṣim", "Qālūn ʿan Nāfiʿ"],
        options_de: ["Warsch ʿan Nāfiʿ", "Hafs ʿan ʿĀsim", "Qālūn ʿan Nāfiʿ"],
        answer: 1,
        explain_en: "The course follows Ḥafṣ ʿan ʿĀṣim, the most widespread reading today.",
        explain_de: "Der Kurs folgt Hafs ʿan ʿĀsim, der heute am weitesten verbreiteten Lesart.",
      },
      {
        q_en: "Between two surahs, which way of joining should be avoided?",
        q_de: "Welche Verbindung sollte man zwischen zwei Suren vermeiden?",
        options_en: [
          "Stopping after the surah, then basmala, then the next surah",
          "Joining everything in one breath",
          "Joining the end of the surah with the basmala, then stopping",
          "Stopping after the surah, then joining basmala and the next surah",
        ],
        options_de: [
          "Nach der Sure anhalten, dann Basmala, dann nächste Sure",
          "Alles in einem Atemzug verbinden",
          "Das Ende der Sure mit der Basmala verbinden und dann anhalten",
          "Nach der Sure anhalten, dann Basmala und nächste Sure verbinden",
        ],
        answer: 2,
        explain_en: "Joining the surah's end to the basmala and then stopping makes the basmala sound like part of the previous surah.",
        explain_de: "Verbindet man das Sure-Ende mit der Basmala und hält dann an, klingt die Basmala wie ein Teil der vorherigen Sure.",
      },
    ],
  },

  // ───────────────────────────────────────────── 2
  {
    id: "makharij",
    level: 1,
    title_en: "Makharij al-Huruf – The Five Articulation Areas",
    title_de: "Machaaridsch al-Huruf – die fünf Artikulationsbereiche",
    summary_en: "Every Arabic letter has a fixed point of articulation, and these points are grouped into five main areas of the mouth and throat.",
    summary_de: "Jeder arabische Buchstabe hat eine feste Artikulationsstelle, und diese Stellen lassen sich in fünf Hauptbereiche von Mund und Rachen einteilen.",
    body_en: `## What is a makhraj?
A *makhraj* (plural *makhārij*) is the place where a letter is produced. If a letter leaves its makhraj, it becomes a different letter – for example س and ص, or ك and ق. Knowing the makharij is therefore the foundation of all tajweed.

## How to find a letter's makhraj
Put a sukun on the letter and a hamza with a vowel before it: أَبْ، أَقْ، أَعْ. Where the sound stops is the makhraj.

## The five areas
- **Al-Jawf (the empty space of mouth and throat):** the three long vowel letters – ا after fatha, و sakinah after damma, ي sakinah after kasra. They have no fixed point; the sound ends when the breath ends.
- **Al-Ḥalq (the throat):** six letters in three levels:
  - deepest part: ء ه
  - middle: ع ح
  - closest to the mouth: غ خ
- **Al-Lisān (the tongue):** the largest area with 18 letters, e.g. ق and ك at the back of the tongue, ج ش ي in the middle, ض along the side, ل ن ر at the tip, ط د ت, ص س ز, and ظ ذ ث with the tongue tip touching the upper front teeth.
- **Ash-Shafatān (the lips):** ف (inner lower lip with the upper teeth), and ب م و (both lips – closed for ب and م, rounded for و).
- **Al-Khayshūm (the nasal cavity):** the place of the **ghunnah**, the nasal sound in ن and م.

## Typical mistakes
- Pronouncing ع like a hamza, or ح like a normal h.
- Pronouncing ث and ذ like s and z – the tongue tip must come out slightly between the teeth.
- Pronouncing ق like ك – ق comes from further back and is heavy.
- Rounding the lips for ف.

## Practice tip
Take one area per day. Say each letter with sukun after a hamza (أَحْ، أَعْ) in front of a mirror, and feel where the sound stops. Then compare pairs: ه/ح, ء/ع, س/ص, ت/ط, د/ض, ذ/ظ.`,
    body_de: `## Was ist ein Machradsch?
Ein *Machradsch* (Plural *Machaaridsch*) ist die Stelle, an der ein Buchstabe gebildet wird. Verlässt ein Buchstabe seine Stelle, wird er zu einem anderen Buchstaben – etwa bei س und ص oder bei ك und ق. Die Artikulationsstellen sind deshalb das Fundament des gesamten Tajweed.

## So findest du die Stelle eines Buchstabens
Setze ein Sukun auf den Buchstaben und stelle ein Hamza mit Vokal davor: أَبْ، أَقْ، أَعْ. Dort, wo der Klang endet, liegt sein Machradsch.

## Die fünf Bereiche
- **Al-Dschauf (der Hohlraum von Mund und Rachen):** die drei langen Vokalbuchstaben – ا nach Fatha, و mit Sukun nach Damma, ي mit Sukun nach Kasra. Sie haben keinen festen Punkt; der Klang endet mit dem Atem.
- **Al-Halq (der Rachen):** sechs Buchstaben auf drei Ebenen:
  - ganz tief: ء ه
  - Mitte: ع ح
  - nahe am Mund: غ خ
- **Al-Lisan (die Zunge):** der größte Bereich mit 18 Buchstaben, z. B. ق und ك am Zungengrund, ج ش ي in der Zungenmitte, ض am Zungenrand, ل ن ر an der Zungenspitze, außerdem ط د ت, ص س ز sowie ظ ذ ث, bei denen die Zungenspitze die oberen Schneidezähne berührt.
- **Asch-Schafatan (die Lippen):** ف (Innenseite der Unterlippe mit den oberen Zähnen) sowie ب م و (beide Lippen – geschlossen bei ب und م, gerundet bei و).
- **Al-Chaischum (der Nasenraum):** hier entsteht die **Ghunna**, der Nasalklang bei ن und م.

## Häufige Fehler
- ع wie ein Hamza aussprechen oder ح wie ein normales h.
- ث und ذ wie s und z sprechen – die Zungenspitze muss leicht zwischen die Zähne.
- ق wie ك sprechen – ق kommt weiter hinten und ist schwer.
- Bei ف die Lippen runden.

## Übungstipp
Nimm dir pro Tag einen Bereich vor. Sprich jeden Buchstaben mit Sukun nach einem Hamza (أَحْ، أَعْ) vor dem Spiegel und spüre, wo der Klang endet. Vergleiche dann Paare: ه/ح, ء/ع, س/ص, ت/ط, د/ض, ذ/ظ.`,
    examples: [
      {
        ar: "أَعْ – أَحْ – أَخْ",
        note_en: "Throat letters from the middle (ع ح) and the upper throat (خ). Say them after a hamza to feel the makhraj.",
        note_de: "Rachenbuchstaben aus der Mitte (ع ح) und dem oberen Rachen (خ). Sprich sie nach einem Hamza, um die Stelle zu spüren.",
      },
      {
        ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
        key: "113:1",
        note_en: "ق from the back of the tongue, ع from the middle of the throat, ف from lip and teeth, ب from both lips.",
        note_de: "ق vom hinteren Zungenteil, ع aus der Rachenmitte, ف mit Lippe und Zähnen, ب mit beiden Lippen.",
      },
      {
        ar: "مِن شَرِّ مَا خَلَقَ",
        key: "113:2",
        note_en: "ش from the middle of the tongue, خ from the upper throat, ر from the tip of the tongue.",
        note_de: "ش aus der Zungenmitte, خ aus dem oberen Rachen, ر von der Zungenspitze.",
      },
      {
        ar: "قَالُوا",
        note_en: "Contains two jawf letters: the alif after fatha and the waw sakinah after damma – both long vowels without a fixed point.",
        note_de: "Enthält zwei Dschauf-Buchstaben: das Alif nach Fatha und das Waw mit Sukun nach Damma – beides lange Vokale ohne festen Punkt.",
      },
      {
        ar: "ثُمَّ – ذَٰلِكَ – ظِلٍّ",
        note_en: "ث ذ ظ: the tip of the tongue touches the edges of the upper front teeth. ظ is the heavy one of the three.",
        note_de: "ث ذ ظ: Die Zungenspitze berührt die Kanten der oberen Schneidezähne. ظ ist der schwere der drei.",
      },
    ],
    quiz: [
      {
        q_en: "How many main articulation areas are there?",
        q_de: "Wie viele Hauptbereiche der Artikulation gibt es?",
        options_en: ["Three", "Five", "Seven", "Seventeen"],
        options_de: ["Drei", "Fünf", "Sieben", "Siebzehn"],
        answer: 1,
        explain_en: "The five areas are al-jawf, al-ḥalq, al-lisān, ash-shafatān and al-khayshūm.",
        explain_de: "Die fünf Bereiche sind Dschauf, Halq, Lisan, Schafatan und Chaischum.",
      },
      {
        q_en: "Which letters come from the deepest part of the throat?",
        q_de: "Welche Buchstaben kommen aus dem tiefsten Teil des Rachens?",
        options_en: ["غ خ", "ع ح", "ء ه", "ق ك"],
        options_de: ["غ خ", "ع ح", "ء ه", "ق ك"],
        answer: 2,
        explain_en: "Hamza and ha (ء ه) are produced in the deepest part of the throat.",
        explain_de: "Hamza und Ha (ء ه) werden im tiefsten Teil des Rachens gebildet.",
      },
      {
        q_en: "Where is the ghunnah produced?",
        q_de: "Wo entsteht die Ghunna?",
        options_en: ["In the lips", "In the nasal cavity (khayshūm)", "In the throat", "At the tip of the tongue"],
        options_de: ["In den Lippen", "Im Nasenraum (Chaischum)", "Im Rachen", "An der Zungenspitze"],
        answer: 1,
        explain_en: "The ghunnah, the nasal sound of ن and م, comes from the khayshūm.",
        explain_de: "Die Ghunna, der Nasalklang von ن und م, kommt aus dem Chaischum.",
      },
      {
        q_en: "How do you find the makhraj of a letter?",
        q_de: "Wie findet man den Machradsch eines Buchstabens?",
        options_en: [
          "Say it with sukun after a hamza with a vowel",
          "Say it with a long vowel",
          "Whisper it without voice",
          "Say it twice quickly",
        ],
        options_de: [
          "Mit Sukun nach einem Hamza mit Vokal sprechen",
          "Mit langem Vokal sprechen",
          "Tonlos flüstern",
          "Zweimal schnell sprechen",
        ],
        answer: 0,
        explain_en: "Saying e.g. أَبْ or أَقْ shows exactly where the sound stops – that is the makhraj.",
        explain_de: "Sagt man z. B. أَبْ oder أَقْ, merkt man genau, wo der Klang endet – das ist der Machradsch.",
      },
      {
        q_en: "Which letter is produced with the inner lower lip and the upper front teeth?",
        q_de: "Welcher Buchstabe wird mit der Innenseite der Unterlippe und den oberen Schneidezähnen gebildet?",
        options_en: ["ب", "و", "ف", "م"],
        options_de: ["ب", "و", "ف", "م"],
        answer: 2,
        explain_en: "ف is the only letter made with the lower lip and the upper teeth; ب م و use both lips.",
        explain_de: "ف ist der einzige Buchstabe aus Unterlippe und oberen Zähnen; ب م و nutzen beide Lippen.",
      },
    ],
  },
  // ───────────────────────────────────────────── 3
  {
    id: "tafkhim-tarqiq",
    level: 1,
    title_en: "Heavy and Light Letters – Tafkhim and Tarqiq",
    title_de: "Schwere und leichte Buchstaben – Tafchim und Tarqiq",
    summary_en: "Seven letters are always heavy, most letters are always light, and the ra and the lam in the name Allah change between heavy and light depending on their surroundings.",
    summary_de: "Sieben Buchstaben sind immer schwer, die meisten immer leicht, und das Ra sowie das Lam im Namen Allah wechseln je nach Umgebung zwischen schwer und leicht.",
    body_en: `## Two kinds of sound
- **Tafkhīm** (heaviness): the back of the tongue rises towards the palate, the mouth fills with sound and the letter sounds "full".
- **Tarqīq** (lightness): the tongue stays low and the letter sounds thin and clear.

## Letters that are always heavy
The seven letters of elevation (*isti'lāʾ*), gathered in the phrase **خُصَّ ضَغْطٍ قِظْ**:
- خ ص ض غ ط ق ظ

They are heaviest with fatha, a little less with damma and lightest – but still heavy – with kasra. The strongest group is ص ض ط ظ.

## The letter ra (ر)
**Heavy** when:
- it has fatha or damma: رَبِّ، رُسُل
- it has sukun after fatha or damma: مَرْيَم، قُرْآن
- it has sukun after a temporary kasra (e.g. a connecting hamza): ارْجِعِي
- it has sukun after kasra and is followed in the same word by a heavy letter: مِرْصَادًا

**Light** when:
- it has kasra: رِجَال
- it has sukun after an original kasra in the same word, with no heavy letter after it: فِرْعَوْن، مِرْيَة
- when stopping, it follows a ya sakinah or a kasra: خَيْرٌ → خَيْرْ

## The lam in the name Allah
- **Heavy** after fatha or damma: قَالَ اللَّهُ، هُوَ اللَّهُ
- **Light** after kasra: بِسْمِ اللَّهِ، لِلَّهِ
- At the very start of reading (اللَّهُ ...), it is heavy.
All other lams are always light.

## Typical mistakes
- Making light letters heavy by rounding the lips (e.g. a heavy ا after a light letter).
- Making heavy letters with rounded lips instead of raising the back of the tongue.
- Reading the ra of رَبِّ lightly, or the lam in بِسْمِ اللَّهِ heavily.

## Practice tip
Read pairs aloud: سَ/صَ، تَ/طَ، دَ/ضَ، ذَ/ظَ، كَ/قَ، هَ/حَ. Then read Surah al-Ikhlas and mark every lam of Allah as heavy or light before reciting.`,
    body_de: `## Zwei Klangfarben
- **Tafchim** (Schwere): Der hintere Zungenteil hebt sich zum Gaumen, der Mund füllt sich mit Klang, der Buchstabe klingt „voll“.
- **Tarqiq** (Leichtigkeit): Die Zunge bleibt unten, der Buchstabe klingt dünn und hell.

## Buchstaben, die immer schwer sind
Die sieben Buchstaben der Erhebung (*Isti'la*), zusammengefasst im Merksatz **خُصَّ ضَغْطٍ قِظْ**:
- خ ص ض غ ط ق ظ

Am schwersten klingen sie mit Fatha, etwas weniger mit Damma und am leichtesten – aber trotzdem schwer – mit Kasra. Die stärkste Gruppe ist ص ض ط ظ.

## Der Buchstabe Ra (ر)
**Schwer**, wenn
- es Fatha oder Damma trägt: رَبِّ، رُسُل
- es ein Sukun hat und davor Fatha oder Damma steht: مَرْيَم، قُرْآن
- es ein Sukun hat und davor ein nur vorübergehendes Kasra steht (z. B. beim Verbindungs-Hamza): ارْجِعِي
- es ein Sukun nach Kasra hat und im selben Wort ein schwerer Buchstabe folgt: مِرْصَادًا

**Leicht**, wenn
- es Kasra trägt: رِجَال
- es ein Sukun nach einem ursprünglichen Kasra im selben Wort hat und kein schwerer Buchstabe folgt: فِرْعَوْن، مِرْيَة
- man beim Anhalten nach einem Ya mit Sukun oder einem Kasra darauf stoppt: خَيْرٌ → خَيْرْ

## Das Lam im Namen Allah
- **Schwer** nach Fatha oder Damma: قَالَ اللَّهُ، هُوَ اللَّهُ
- **Leicht** nach Kasra: بِسْمِ اللَّهِ، لِلَّهِ
- Beginnt man direkt mit اللَّهُ, ist es schwer.
Alle anderen Lams sind immer leicht.

## Häufige Fehler
- Leichte Buchstaben durch Lippenrundung „schwer machen“ (z. B. ein dunkles ا nach einem leichten Buchstaben).
- Schwere Buchstaben mit runden Lippen statt mit gehobenem Zungengrund bilden.
- Das Ra in رَبِّ leicht oder das Lam in بِسْمِ اللَّهِ schwer lesen.

## Übungstipp
Lies Paare laut: سَ/صَ، تَ/طَ، دَ/ضَ، ذَ/ظَ، كَ/قَ، هَ/حَ. Lies dann Sure al-Ichlas und markiere vor dem Rezitieren jedes Lam von Allah als schwer oder leicht.`,
    examples: [
      {
        ar: "هُوَ اللَّهُ",
        key: "112:1",
        note_en: "The lam of Allah follows a fatha (on the waw of هُوَ), so it is heavy.",
        note_de: "Das Lam von Allah folgt auf ein Fatha (auf dem Waw von هُوَ) und ist daher schwer.",
      },
      {
        ar: "بِسْمِ اللَّهِ",
        key: "1:1",
        note_en: "The lam of Allah follows a kasra, so it is light.",
        note_de: "Das Lam von Allah folgt auf ein Kasra und ist daher leicht.",
      },
      {
        ar: "ارْجِعِي إِلَىٰ رَبِّكِ",
        key: "89:28",
        note_en: "The ra in ارْجِعِي is heavy: sukun after a temporary kasra. The ra in رَبِّكِ is heavy because it has fatha.",
        note_de: "Das Ra in ارْجِعِي ist schwer: Sukun nach einem vorübergehenden Kasra. Das Ra in رَبِّكِ ist schwer, weil es Fatha trägt.",
      },
      {
        ar: "مِرْصَادًا",
        key: "78:21",
        note_en: "Ra with sukun after kasra, but followed by the heavy letter ص in the same word – so the ra is heavy.",
        note_de: "Ra mit Sukun nach Kasra, aber im selben Wort folgt der schwere Buchstabe ص – deshalb ist das Ra schwer.",
      },
      {
        ar: "فِرْعَوْنَ",
        note_en: "Ra with sukun after an original kasra and no heavy letter after it – light.",
        note_de: "Ra mit Sukun nach ursprünglichem Kasra, ohne folgenden schweren Buchstaben – leicht.",
      },
      {
        ar: "الصِّرَاطَ",
        key: "1:6",
        note_en: "ص and ط are always heavy; the ra has fatha and is heavy too.",
        note_de: "ص und ط sind immer schwer; auch das Ra trägt Fatha und ist schwer.",
      },
    ],
    quiz: [
      {
        q_en: "Which group contains only letters that are always heavy?",
        q_de: "Welche Gruppe enthält nur Buchstaben, die immer schwer sind?",
        options_en: ["خ ص ض غ ط ق ظ", "ر ل ا", "ت ث د ذ", "ب م و"],
        options_de: ["خ ص ض غ ط ق ظ", "ر ل ا", "ت ث د ذ", "ب م و"],
        answer: 0,
        explain_en: "These are the seven letters of isti'lāʾ, collected in خُصَّ ضَغْطٍ قِظْ.",
        explain_de: "Das sind die sieben Isti'la-Buchstaben, zusammengefasst in خُصَّ ضَغْطٍ قِظْ.",
      },
      {
        q_en: "How is the lam of Allah in بِسْمِ اللَّهِ pronounced?",
        q_de: "Wie wird das Lam von Allah in بِسْمِ اللَّهِ ausgesprochen?",
        options_en: ["Heavy", "Light", "With qalqalah"],
        options_de: ["Schwer", "Leicht", "Mit Qalqala"],
        answer: 1,
        explain_en: "It follows a kasra (under the mim of بِسْمِ), so it is light.",
        explain_de: "Es folgt auf ein Kasra (unter dem Mim von بِسْمِ) und ist daher leicht.",
      },
      {
        q_en: "Why is the ra in مِرْصَادًا heavy although a kasra comes before it?",
        q_de: "Warum ist das Ra in مِرْصَادًا schwer, obwohl davor ein Kasra steht?",
        options_en: [
          "Because it is at the end of the word",
          "Because a heavy letter (ص) follows it in the same word",
          "Because it has a shaddah",
          "Because the kasra is temporary",
        ],
        options_de: [
          "Weil es am Wortende steht",
          "Weil im selben Wort ein schwerer Buchstabe (ص) folgt",
          "Weil es eine Schadda hat",
          "Weil das Kasra vorübergehend ist",
        ],
        answer: 1,
        explain_en: "A ra sakinah after kasra becomes heavy when a letter of isti'lāʾ follows it in the same word.",
        explain_de: "Ein Ra mit Sukun nach Kasra wird schwer, wenn im selben Wort ein Isti'la-Buchstabe folgt.",
      },
      {
        q_en: "How is the ra in رِجَال pronounced?",
        q_de: "Wie wird das Ra in رِجَال ausgesprochen?",
        options_en: ["Heavy", "Light", "Either way"],
        options_de: ["Schwer", "Leicht", "Beides möglich"],
        answer: 1,
        explain_en: "A ra carrying kasra is always light.",
        explain_de: "Ein Ra mit Kasra ist immer leicht.",
      },
      {
        q_en: "With which vowel are the heavy letters at their heaviest?",
        q_de: "Mit welchem Vokal sind die schweren Buchstaben am schwersten?",
        options_en: ["Kasra", "Damma", "Fatha"],
        options_de: ["Kasra", "Damma", "Fatha"],
        answer: 2,
        explain_en: "Heaviness is strongest with fatha, then damma, and weakest with kasra.",
        explain_de: "Die Schwere ist mit Fatha am stärksten, dann mit Damma, mit Kasra am schwächsten.",
      },
    ],
  },

  // ───────────────────────────────────────────── 4
  {
    id: "lam-shamsiyya-qamariyya",
    level: 1,
    title_en: "Lam Shamsiyya and Lam Qamariyya",
    title_de: "Lam Schamsiyya und Lam Qamariyya",
    summary_en: "The lam of the definite article ال is pronounced clearly before the fourteen \"moon letters\" and merged into the fourteen \"sun letters\".",
    summary_de: "Das Lam des bestimmten Artikels ال wird vor den vierzehn „Mondbuchstaben“ deutlich gesprochen und in die vierzehn „Sonnenbuchstaben“ hineingezogen.",
    body_en: `## The definite article ال
In Arabic, "the" is written ال (alif + lam). The alif is a connecting hamza: you only pronounce it (as "a") when you start with the word. The question is what happens to the **lam**.

## Lam qamariyya – the "moon" lam
Before 14 letters the lam is pronounced clearly with sukun. The name comes from الْقَمَر (the moon). The letters are gathered in the phrase **ابْغِ حَجَّكَ وَخَفْ عَقِيمَهُ**:
- ا ب غ ح ج ك و خ ف ع ق ي م ه

Sign in the mushaf: the lam has a sukun and the next letter has no shaddah, e.g. الْحَمْدُ، الْقَمَر، الْمُسْتَقِيم.

## Lam shamsiyya – the "sun" lam
Before the other 14 letters the lam is **not pronounced**; it merges into the following letter, which becomes doubled. The name comes from الشَّمْس (the sun):
- ت ث د ذ ر ز س ش ص ض ط ظ ل ن

Sign in the mushaf: the lam has no sukun and the next letter carries a shaddah, e.g. الشَّمْس، الرَّحْمَٰن، الدِّين، النَّاس.

## A simple trick
Most sun letters are made with the tip or front of the tongue – close to where the lam itself is made, which is why the lam merges into them. Moon letters come from the throat, the lips or the back of the tongue.

## Typical mistakes
- Saying "al-rahman" instead of "ar-raḥmān".
- Swallowing the lam before a moon letter: "a-hamdu" instead of "al-ḥamdu".
- Forgetting to double the sun letter, so النَّاس sounds like "anās".
- Adding a vowel to the moon lam ("ala-qamar").

## Practice tip
Go through Surah al-Fatihah and Surah an-Nas and underline every ال. Decide for each: sun or moon? Then recite and listen whether you doubled the sun letters.`,
    body_de: `## Der bestimmte Artikel ال
Im Arabischen schreibt man „der/die/das“ als ال (Alif + Lam). Das Alif ist ein Verbindungs-Hamza: Man spricht es nur (als „a“), wenn man mit dem Wort beginnt. Spannend ist, was mit dem **Lam** passiert.

## Lam Qamariyya – das „Mond-Lam“
Vor 14 Buchstaben wird das Lam deutlich mit Sukun gesprochen. Der Name kommt von الْقَمَر (der Mond). Die Buchstaben stecken im Merksatz **ابْغِ حَجَّكَ وَخَفْ عَقِيمَهُ**:
- ا ب غ ح ج ك و خ ف ع ق ي م ه

Erkennungszeichen im Mushaf: Das Lam trägt ein Sukun, der folgende Buchstabe keine Schadda, z. B. الْحَمْدُ، الْقَمَر، الْمُسْتَقِيم.

## Lam Schamsiyya – das „Sonnen-Lam“
Vor den anderen 14 Buchstaben wird das Lam **nicht gesprochen**, sondern geht im folgenden Buchstaben auf, der dadurch verdoppelt wird. Der Name kommt von الشَّمْس (die Sonne):
- ت ث د ذ ر ز س ش ص ض ط ظ ل ن

Erkennungszeichen: Das Lam hat kein Sukun, der folgende Buchstabe trägt eine Schadda, z. B. الشَّمْس، الرَّحْمَٰن، الدِّين، النَّاس.

## Eine einfache Eselsbrücke
Die meisten Sonnenbuchstaben werden mit der Zungenspitze oder dem vorderen Zungenteil gebildet – also nah an der Stelle des Lam. Deshalb verschmilzt das Lam mit ihnen. Mondbuchstaben kommen aus dem Rachen, von den Lippen oder vom hinteren Zungenteil.

## Häufige Fehler
- „al-rahman“ statt „ar-Rahman“ sagen.
- Das Lam vor einem Mondbuchstaben verschlucken: „a-hamdu“ statt „al-hamdu“.
- Den Sonnenbuchstaben nicht verdoppeln, sodass النَّاس wie „anas“ klingt.
- Dem Mond-Lam einen Vokal anhängen („ala-qamar“).

## Übungstipp
Geh Sure al-Fatiha und Sure an-Nas durch und unterstreiche jedes ال. Entscheide jeweils: Sonne oder Mond? Rezitiere dann und hör genau hin, ob du die Sonnenbuchstaben verdoppelt hast.`,
    examples: [
      {
        ar: "الْحَمْدُ لِلَّهِ",
        key: "1:2",
        note_en: "Lam qamariyya: the lam before ح is pronounced clearly – al-ḥamdu.",
        note_de: "Lam Qamariyya: Das Lam vor ح wird deutlich gesprochen – al-hamdu.",
      },
      {
        ar: "الرَّحْمَٰنِ الرَّحِيمِ",
        key: "1:3",
        note_en: "Lam shamsiyya: the lam merges into the ra, which is doubled – ar-raḥmāni r-raḥīm.",
        note_de: "Lam Schamsiyya: Das Lam verschmilzt mit dem Ra, das verdoppelt wird – ar-rahmani r-rahim.",
      },
      {
        ar: "مَالِكِ يَوْمِ الدِّينِ",
        key: "1:4",
        note_en: "Lam shamsiyya before د: the lam is silent and the dal is doubled.",
        note_de: "Lam Schamsiyya vor د: Das Lam ist stumm, das Dal wird verdoppelt.",
      },
      {
        ar: "الْمُسْتَقِيمَ",
        key: "1:6",
        note_en: "Lam qamariyya before م: the lam is pronounced with sukun.",
        note_de: "Lam Qamariyya vor م: Das Lam wird mit Sukun gesprochen.",
      },
      {
        ar: "مَلِكِ النَّاسِ",
        key: "114:2",
        note_en: "Lam shamsiyya before ن: the nun is doubled (and also carries a ghunnah because of the shaddah).",
        note_de: "Lam Schamsiyya vor ن: Das Nun wird verdoppelt (und erhält wegen der Schadda auch eine Ghunna).",
      },
    ],
    quiz: [
      {
        q_en: "In الشَّمْس, what happens to the lam?",
        q_de: "Was passiert in الشَّمْس mit dem Lam?",
        options_en: ["It is pronounced clearly", "It merges into the shin, which is doubled", "It gets a qalqalah"],
        options_de: ["Es wird deutlich gesprochen", "Es verschmilzt mit dem Schin, das verdoppelt wird", "Es bekommt eine Qalqala"],
        answer: 1,
        explain_en: "ش is a sun letter, so the lam is silent and the shin carries a shaddah.",
        explain_de: "ش ist ein Sonnenbuchstabe; das Lam ist stumm und das Schin trägt eine Schadda.",
      },
      {
        q_en: "Which of these is a moon letter?",
        q_de: "Welcher dieser Buchstaben ist ein Mondbuchstabe?",
        options_en: ["ن", "ر", "ق", "ص"],
        options_de: ["ن", "ر", "ق", "ص"],
        answer: 2,
        explain_en: "ق belongs to ابْغِ حَجَّكَ وَخَفْ عَقِيمَهُ; the others are sun letters.",
        explain_de: "ق gehört zu ابْغِ حَجَّكَ وَخَفْ عَقِيمَهُ; die anderen sind Sonnenbuchstaben.",
      },
      {
        q_en: "How can you recognise a lam shamsiyya in the mushaf?",
        q_de: "Woran erkennt man ein Lam Schamsiyya im Mushaf?",
        options_en: [
          "The lam has a sukun",
          "The lam has no sign and the next letter has a shaddah",
          "The lam has a shaddah",
          "The alif has a hamza",
        ],
        options_de: [
          "Das Lam hat ein Sukun",
          "Das Lam hat kein Zeichen und der nächste Buchstabe eine Schadda",
          "Das Lam hat eine Schadda",
          "Das Alif hat ein Hamza",
        ],
        answer: 1,
        explain_en: "A silent lam carries no sukun, and the following sun letter is marked with a shaddah.",
        explain_de: "Ein stummes Lam trägt kein Sukun, und der folgende Sonnenbuchstabe ist mit Schadda markiert.",
      },
      {
        q_en: "How many sun letters are there?",
        q_de: "Wie viele Sonnenbuchstaben gibt es?",
        options_en: ["7", "14", "15", "28"],
        options_de: ["7", "14", "15", "28"],
        answer: 1,
        explain_en: "The 28 letters split evenly: 14 sun letters and 14 moon letters.",
        explain_de: "Die 28 Buchstaben teilen sich gleichmäßig auf: 14 Sonnen- und 14 Mondbuchstaben.",
      },
      {
        q_en: "Which word contains a lam qamariyya?",
        q_de: "Welches Wort enthält ein Lam Qamariyya?",
        options_en: ["الدِّين", "النَّاس", "الْعَالَمِين", "الصِّرَاط"],
        options_de: ["الدِّين", "النَّاس", "الْعَالَمِين", "الصِّرَاط"],
        answer: 2,
        explain_en: "ع is a moon letter, so the lam in الْعَالَمِين is pronounced.",
        explain_de: "ع ist ein Mondbuchstabe, daher wird das Lam in الْعَالَمِين gesprochen.",
      },
    ],
  },

  // ───────────────────────────────────────────── 5
  {
    id: "nun-sakinah-izhar",
    level: 2,
    title_en: "Nun Sakinah and Tanwin: Izhar",
    title_de: "Nun Sakina und Tanwin: Izhar",
    summary_en: "When a nun sakinah or tanwin is followed by one of the six throat letters, the nun is pronounced clearly without extra ghunnah – this is izhar.",
    summary_de: "Folgt auf ein Nun Sakina oder Tanwin einer der sechs Rachenbuchstaben, wird das Nun deutlich und ohne verlängerte Ghunna gesprochen – das ist Izhar.",
    body_en: `## Nun sakinah and tanwin
- **Nun sakinah** is a nun without a vowel: مِنْ، عَنْ، أَنْعَمْتَ.
- **Tanwin** is the doubled vowel at the end of a noun (ـٌ ـً ـٍ). It is pronounced as a nun sakinah: عَلِيمٌ = ʿalīmun.

Because they sound the same, the same four rules apply to both, depending on the next letter: **izhar, idgham, iqlab and ikhfa'**. This lesson starts with izhar.

## What is izhar?
*Iẓhār* means "making clear". The nun is pronounced clearly from its own makhraj, and you move straight on to the next letter without lengthening the nasal sound.

## The letters of izhar
The six throat letters:
- ء ه ع ح غ خ

Izhar happens within one word (يَنْأَوْنَ، مِنْهُمْ) and across two words (مَنْ آمَنَ، عَذَابٌ أَلِيمٌ).

## Why izhar?
The throat letters are far away from the tip of the tongue where nun is made. Because of this distance there is no reason to merge or hide the nun.

## How it sounds
Touch the tip of the tongue to the gum behind the upper teeth, say a short, clean "n" and continue straight to the throat letter. The natural ghunnah that every nun has remains, but it is not stretched.

## Typical mistakes
- Stretching the ghunnah ("minnnn ḥ…") as if it were ikhfa'.
- Pausing or adding a vowel after the nun: "mina-khawf".
- With tanwin, swallowing the n completely: "ʿadhābu-alīm".
- Weak throat letters after the nun, especially ع and ح.

## Practice tip
Read slowly: مِنْ خَوْفٍ – عَذَابٌ أَلِيمٌ – مَنْ آمَنَ. Put a finger on your nose: with izhar you should feel only a short vibration, not a long hum.`,
    body_de: `## Nun Sakina und Tanwin
- **Nun Sakina** ist ein Nun ohne Vokal: مِنْ، عَنْ، أَنْعَمْتَ.
- **Tanwin** ist der doppelte Vokal am Ende eines Nomens (ـٌ ـً ـٍ). Er wird wie ein Nun Sakina gesprochen: عَلِيمٌ = ʿalimun.

Weil beide gleich klingen, gelten für beide dieselben vier Regeln – je nachdem, welcher Buchstabe folgt: **Izhar, Idgham, Iqlab und Ikhfa**. Wir beginnen mit Izhar.

## Was ist Izhar?
*Izhar* heißt „deutlich machen“. Das Nun wird klar an seiner eigenen Stelle gebildet, und man geht direkt zum nächsten Buchstaben über, ohne den Nasalklang zu verlängern.

## Die Izhar-Buchstaben
Die sechs Rachenbuchstaben:
- ء ه ع ح غ خ

Izhar gibt es innerhalb eines Wortes (يَنْأَوْنَ، مِنْهُمْ) und zwischen zwei Wörtern (مَنْ آمَنَ، عَذَابٌ أَلِيمٌ).

## Warum Izhar?
Die Rachenbuchstaben liegen weit entfernt von der Zungenspitze, an der das Nun entsteht. Wegen dieses Abstands gibt es keinen Grund, das Nun zu verschmelzen oder zu verbergen.

## Wie klingt es?
Berühre mit der Zungenspitze den Gaumen hinter den oberen Zähnen, sprich ein kurzes, sauberes „n“ und gehe direkt zum Rachenbuchstaben über. Die natürliche Grund-Ghunna jedes Nun bleibt, wird aber nicht gedehnt.

## Häufige Fehler
- Die Ghunna dehnen („minnnn h…“), als wäre es Ikhfa.
- Nach dem Nun absetzen oder einen Vokal einschieben: „mina-chauf“.
- Beim Tanwin das n ganz verschlucken: „ʿadhabu-alim“.
- Schwache Rachenbuchstaben nach dem Nun, besonders bei ع und ح.

## Übungstipp
Lies langsam: مِنْ خَوْفٍ – عَذَابٌ أَلِيمٌ – مَنْ آمَنَ. Leg einen Finger an die Nase: Bei Izhar spürst du nur ein kurzes Vibrieren, kein langes Summen.`,
    examples: [
      {
        ar: "مَنْ آمَنَ",
        key: "2:62",
        note_en: "Nun sakinah followed by hamza (آ) in the next word – izhar.",
        note_de: "Nun Sakina, gefolgt von Hamza (آ) im nächsten Wort – Izhar.",
      },
      {
        ar: "وَلَهُمْ عَذَابٌ أَلِيمٌ",
        key: "2:10",
        note_en: "Tanwin on عَذَابٌ followed by hamza – izhar: ʿadhābun alīm.",
        note_de: "Tanwin auf عَذَابٌ, gefolgt von Hamza – Izhar: ʿadhabun alim.",
      },
      {
        ar: "مِنْ خَوْفٍ",
        key: "106:4",
        note_en: "Nun sakinah followed by خ – izhar.",
        note_de: "Nun Sakina, gefolgt von خ – Izhar.",
      },
      {
        ar: "وَيَنْأَوْنَ عَنْهُ",
        key: "6:26",
        note_en: "Izhar within one word twice: ن before ء in يَنْأَوْنَ and ن before ه in عَنْهُ.",
        note_de: "Zweimal Izhar innerhalb eines Wortes: ن vor ء in يَنْأَوْنَ und ن vor ه in عَنْهُ.",
      },
      {
        ar: "كُفُوًا أَحَدٌ",
        key: "112:4",
        note_en: "Tanwin on كُفُوًا followed by hamza – izhar: kufuwan aḥad.",
        note_de: "Tanwin auf كُفُوًا, gefolgt von Hamza – Izhar: kufuwan ahad.",
      },
    ],
    quiz: [
      {
        q_en: "Which letters cause izhar after nun sakinah or tanwin?",
        q_de: "Welche Buchstaben bewirken Izhar nach Nun Sakina oder Tanwin?",
        options_en: ["ي ر م ل و ن", "The six throat letters ء ه ع ح غ خ", "Only ب", "ق ط ب ج د"],
        options_de: ["ي ر م ل و ن", "Die sechs Rachenbuchstaben ء ه ع ح غ خ", "Nur ب", "ق ط ب ج د"],
        answer: 1,
        explain_en: "Izhar applies before the six throat letters.",
        explain_de: "Izhar gilt vor den sechs Rachenbuchstaben.",
      },
      {
        q_en: "What does tanwin sound like?",
        q_de: "Wie klingt ein Tanwin?",
        options_en: ["Like a nun sakinah at the end of the word", "Like a long vowel", "Like a mim sakinah", "It is silent"],
        options_de: ["Wie ein Nun Sakina am Wortende", "Wie ein langer Vokal", "Wie ein Mim Sakina", "Es ist stumm"],
        answer: 0,
        explain_en: "Tanwin is an extra nun sakinah pronounced (not written) at the end of a noun.",
        explain_de: "Tanwin ist ein zusätzliches, gesprochenes (nicht geschriebenes) Nun Sakina am Ende eines Nomens.",
      },
      {
        q_en: "Which phrase contains izhar?",
        q_de: "Welcher Ausdruck enthält Izhar?",
        options_en: ["مِن شَرِّ", "مِنْ خَوْفٍ", "مِن بَعْدِ", "مَن يَقُولُ"],
        options_de: ["مِن شَرِّ", "مِنْ خَوْفٍ", "مِن بَعْدِ", "مَن يَقُولُ"],
        answer: 1,
        explain_en: "خ is a throat letter, so the nun in مِنْ خَوْفٍ is pronounced clearly.",
        explain_de: "خ ist ein Rachenbuchstabe, daher wird das Nun in مِنْ خَوْفٍ deutlich gesprochen.",
      },
      {
        q_en: "Why is the nun pronounced clearly before throat letters?",
        q_de: "Warum wird das Nun vor Rachenbuchstaben deutlich gesprochen?",
        options_en: [
          "Because they are far from the makhraj of nun",
          "Because they are heavy letters",
          "Because they are always at the end of a verse",
        ],
        options_de: [
          "Weil sie weit von der Artikulationsstelle des Nun entfernt sind",
          "Weil sie schwere Buchstaben sind",
          "Weil sie immer am Versende stehen",
        ],
        answer: 0,
        explain_en: "The large distance between throat and tongue tip means there is no merging or hiding.",
        explain_de: "Der große Abstand zwischen Rachen und Zungenspitze macht ein Verschmelzen oder Verbergen unnötig.",
      },
      {
        q_en: "What is a typical mistake with izhar?",
        q_de: "Was ist ein typischer Fehler beim Izhar?",
        options_en: [
          "Stretching the ghunnah for two counts",
          "Pronouncing the nun with the tongue tip",
          "Moving directly to the next letter",
        ],
        options_de: [
          "Die Ghunna auf zwei Zählzeiten dehnen",
          "Das Nun mit der Zungenspitze bilden",
          "Direkt zum nächsten Buchstaben übergehen",
        ],
        answer: 0,
        explain_en: "With izhar the nasal sound is not lengthened; stretching it would turn it into something like ikhfa'.",
        explain_de: "Bei Izhar wird der Nasalklang nicht gedehnt; sonst klänge es wie ein Ikhfa.",
      },
    ],
  },
  // ───────────────────────────────────────────── 6
  {
    id: "nun-sakinah-idgham",
    level: 2,
    title_en: "Idgham – Merging With and Without Ghunnah",
    title_de: "Idgham – Verschmelzen mit und ohne Ghunna",
    summary_en: "Before the six letters of يَرْمَلُونَ a nun sakinah or tanwin merges into the next word – with ghunnah before ي ن م و and without ghunnah before ل ر.",
    summary_de: "Vor den sechs Buchstaben von يَرْمَلُونَ verschmilzt Nun Sakina oder Tanwin mit dem nächsten Wort – mit Ghunna vor ي ن م و, ohne Ghunna vor ل ر.",
    body_en: `## What is idgham?
*Idghām* means "inserting" or "merging". The nun sakinah or tanwin is not pronounced as its own sound; it is absorbed into the following letter, which is then pronounced as if it had a shaddah.

## The letters of idgham
Six letters, gathered in the word **يَرْمَلُونَ**:
- ي ر م ل و ن

Idgham only happens **across two words**: the nun sakinah or tanwin at the end of one word, the idgham letter at the start of the next.

## 1. Idgham with ghunnah
Before the four letters of **يَنْمُو**:
- ي ن م و

The nasal sound is held for **two counts**. Before ن and م the merging is complete. Before ي and و it is incomplete: a trace of the nun remains in the form of the ghunnah while the tongue already moves to ي or و.

Examples: مَن يَقُولُ، هُدًى مِّن، مِن نِّعْمَةٍ، مِن وَالٍ

## 2. Idgham without ghunnah
Before the two letters:
- ل ر

The nun disappears completely, there is no nasal sound, and the ل or ر is doubled.

Examples: مِّن رَّبِّهِمْ، غَفُورٌ رَّحِيمٌ، يَكُن لَّهُ

## The exceptions
If nun sakinah and ي or و meet **inside one word**, there is no idgham but **izhar** – otherwise the word would become unrecognisable. In the Quran this occurs in four words:
- الدُّنْيَا، بُنْيَانٌ، قِنْوَانٌ، صِنْوَانٌ

Also, in Ḥafṣ the nun is read with izhar in يس ۚ وَالْقُرْآنِ and ن ۚ وَالْقَلَمِ.

## Typical mistakes
- Pronouncing the nun before ل or ر: "min rabbihim" instead of "mir-rabbihim".
- Forgetting the ghunnah before ي or و: "may-yaqūlu" without the nasal sound.
- Applying idgham to الدُّنْيَا ("ad-duyyā").

## Practice tip
Write يَرْمَلُونَ on a card and split it into يَنْمُو (with ghunnah) and لر (without). Read Surah al-Ikhlas and Surah az-Zalzalah and mark every idgham you find.`,
    body_de: `## Was ist Idgham?
*Idgham* bedeutet „einfügen“ oder „verschmelzen“. Das Nun Sakina oder Tanwin wird nicht als eigener Laut gesprochen, sondern geht im folgenden Buchstaben auf, der dann wie mit Schadda klingt.

## Die Idgham-Buchstaben
Sechs Buchstaben, zusammengefasst im Wort **يَرْمَلُونَ**:
- ي ر م ل و ن

Idgham gibt es nur **zwischen zwei Wörtern**: das Nun Sakina oder Tanwin am Ende des einen, der Idgham-Buchstabe am Anfang des nächsten Wortes.

## 1. Idgham mit Ghunna
Vor den vier Buchstaben von **يَنْمُو**:
- ي ن م و

Der Nasalklang wird **zwei Zählzeiten** gehalten. Vor ن und م ist die Verschmelzung vollständig. Vor ي und و ist sie unvollständig: Ein Rest des Nun bleibt als Ghunna hörbar, während die Zunge schon zum ي oder و geht.

Beispiele: مَن يَقُولُ، هُدًى مِّن، مِن نِّعْمَةٍ، مِن وَالٍ

## 2. Idgham ohne Ghunna
Vor den zwei Buchstaben:
- ل ر

Das Nun verschwindet ganz, es gibt keinen Nasalklang, und ل bzw. ر wird verdoppelt.

Beispiele: مِّن رَّبِّهِمْ، غَفُورٌ رَّحِيمٌ، يَكُن لَّهُ

## Die Ausnahmen
Treffen Nun Sakina und ي oder و **innerhalb eines Wortes** aufeinander, gibt es kein Idgham, sondern **Izhar** – sonst wäre das Wort nicht mehr zu erkennen. Im Koran betrifft das vier Wörter:
- الدُّنْيَا، بُنْيَانٌ، قِنْوَانٌ، صِنْوَانٌ

Außerdem liest man bei Hafs das Nun in يس ۚ وَالْقُرْآنِ und ن ۚ وَالْقَلَمِ mit Izhar.

## Häufige Fehler
- Das Nun vor ل oder ر aussprechen: „min rabbihim“ statt „mir-rabbihim“.
- Die Ghunna vor ي oder و vergessen: „may-yaqulu“ ohne Nasalklang.
- Idgham bei الدُّنْيَا anwenden („ad-duyya“).

## Übungstipp
Schreib يَرْمَلُونَ auf eine Karte und teile es auf in يَنْمُو (mit Ghunna) und لر (ohne). Lies Sure al-Ichlas und Sure az-Zalzala und markiere jedes Idgham, das du findest.`,
    examples: [
      {
        ar: "وَمِنَ النَّاسِ مَن يَقُولُ",
        key: "2:8",
        note_en: "Nun sakinah in مَن followed by ي – idgham with ghunnah: may-yaqūlu.",
        note_de: "Nun Sakina in مَن vor ي – Idgham mit Ghunna: may-yaqulu.",
      },
      {
        ar: "هُدًى مِّن رَّبِّهِمْ",
        key: "2:5",
        note_en: "Two rules: tanwin before م – idgham with ghunnah; nun sakinah before ر – idgham without ghunnah: hudam-mir-rabbihim.",
        note_de: "Zwei Regeln: Tanwin vor م – Idgham mit Ghunna; Nun Sakina vor ر – Idgham ohne Ghunna: hudam-mir-rabbihim.",
      },
      {
        ar: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ",
        key: "99:7",
        note_en: "مَن يَعْمَلْ and خَيْرًا يَرَهُ: nun sakinah and tanwin before ي – idgham with ghunnah.",
        note_de: "مَن يَعْمَلْ und خَيْرًا يَرَهُ: Nun Sakina bzw. Tanwin vor ي – Idgham mit Ghunna.",
      },
      {
        ar: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        key: "112:4",
        note_en: "Nun sakinah in يَكُن before ل – idgham without ghunnah: yakul-lahū.",
        note_de: "Nun Sakina in يَكُن vor ل – Idgham ohne Ghunna: yakul-lahu.",
      },
      {
        ar: "إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ",
        key: "2:173",
        note_en: "Tanwin before ر – idgham without ghunnah: ghafūrur-raḥīm.",
        note_de: "Tanwin vor ر – Idgham ohne Ghunna: ghafurur-rahim.",
      },
      {
        ar: "قِنْوَانٌ دَانِيَةٌ",
        key: "6:99",
        note_en: "Exception: nun sakinah and و in the same word – izhar, not idgham.",
        note_de: "Ausnahme: Nun Sakina und و im selben Wort – Izhar, kein Idgham.",
      },
    ],
    quiz: [
      {
        q_en: "Which letters cause idgham WITH ghunnah?",
        q_de: "Welche Buchstaben bewirken Idgham MIT Ghunna?",
        options_en: ["ل ر", "ي ن م و", "ء ه ع ح غ خ", "ب"],
        options_de: ["ل ر", "ي ن م و", "ء ه ع ح غ خ", "ب"],
        answer: 1,
        explain_en: "The four letters of يَنْمُو take idgham with ghunnah.",
        explain_de: "Die vier Buchstaben von يَنْمُو bewirken Idgham mit Ghunna.",
      },
      {
        q_en: "How is مِّن رَّبِّهِمْ recited?",
        q_de: "Wie wird مِّن رَّبِّهِمْ rezitiert?",
        options_en: ["min rabbihim (clear nun)", "mir-rabbihim (no ghunnah)", "mim-rabbihim (with ghunnah)"],
        options_de: ["min rabbihim (deutliches Nun)", "mir-rabbihim (ohne Ghunna)", "mim-rabbihim (mit Ghunna)"],
        answer: 1,
        explain_en: "Before ر the nun merges completely without ghunnah and the ra is doubled.",
        explain_de: "Vor ر verschmilzt das Nun vollständig ohne Ghunna, das Ra wird verdoppelt.",
      },
      {
        q_en: "Why is there no idgham in الدُّنْيَا?",
        q_de: "Warum gibt es in الدُّنْيَا kein Idgham?",
        options_en: [
          "Because ي is a throat letter",
          "Because nun and ya are in the same word",
          "Because it is a name",
          "Because there is a shaddah",
        ],
        options_de: [
          "Weil ي ein Rachenbuchstabe ist",
          "Weil Nun und Ya im selben Wort stehen",
          "Weil es ein Name ist",
          "Weil eine Schadda steht",
        ],
        answer: 1,
        explain_en: "Idgham of nun sakinah only occurs across two words; within one word it is izhar.",
        explain_de: "Idgham des Nun Sakina gibt es nur zwischen zwei Wörtern; innerhalb eines Wortes gilt Izhar.",
      },
      {
        q_en: "How long is the ghunnah in idgham with ghunnah?",
        q_de: "Wie lang ist die Ghunna beim Idgham mit Ghunna?",
        options_en: ["No length", "About two counts", "Six counts"],
        options_de: ["Gar nicht", "Etwa zwei Zählzeiten", "Sechs Zählzeiten"],
        answer: 1,
        explain_en: "The ghunnah is held for two counts (ḥarakatain).",
        explain_de: "Die Ghunna wird zwei Zählzeiten (Harakatain) gehalten.",
      },
      {
        q_en: "Which word is one of the four exceptions read with izhar?",
        q_de: "Welches Wort gehört zu den vier Ausnahmen mit Izhar?",
        options_en: ["مِن وَالٍ", "صِنْوَانٌ", "مَن يَقُولُ", "مِن نِّعْمَةٍ"],
        options_de: ["مِن وَالٍ", "صِنْوَانٌ", "مَن يَقُولُ", "مِن نِّعْمَةٍ"],
        answer: 1,
        explain_en: "صِنْوَانٌ has nun and waw inside one word, so it is read with izhar.",
        explain_de: "In صِنْوَانٌ stehen Nun und Waw in einem Wort, daher wird es mit Izhar gelesen.",
      },
    ],
  },

  // ───────────────────────────────────────────── 7
  {
    id: "nun-sakinah-iqlab",
    level: 2,
    title_en: "Iqlab – Turning Nun into Mim",
    title_de: "Iqlab – aus Nun wird Mim",
    summary_en: "When a nun sakinah or tanwin is followed by ب, the nun is changed into a hidden mim with ghunnah.",
    summary_de: "Folgt auf Nun Sakina oder Tanwin ein ب, wird das Nun in ein verborgenes Mim mit Ghunna umgewandelt.",
    body_en: `## What is iqlab?
*Iqlāb* means "turning over" or "changing". When a nun sakinah or tanwin is followed by the letter **ب**, the nun is changed into a **mim**, and that mim is pronounced with a light lip closure and a ghunnah of **two counts**.

## The letter of iqlab
Only one letter:
- ب

Iqlab happens both **inside a word** (أَنبِئْهُم، لَيُنبَذَنَّ) and **across two words** (مِن بَعْدِ، سَمِيعٌ بَصِيرٌ).

## How it looks in the mushaf
In most printed mushafs a small **mim (ۢ)** is written above the nun or next to the tanwin, and the nun has no sukun. This tells you: do not read n, read m.

## Why iqlab?
Nun with its clear tongue articulation and ب with closed lips are hard to pronounce one right after the other. Mim shares the lips with ب and the ghunnah with nun, so it is the perfect bridge between the two.

## How it sounds
- Bring the lips together **gently** – do not press them hard.
- Hold the nasal sound for about two counts.
- Then release into the ب.

So مِن بَعْدِ sounds like "mim-baʿdi" with a soft, humming m.

## Typical mistakes
- Reading a clear n: "min baʿdi".
- Pressing the lips too hard so the mim sounds like a hard b.
- Shortening the ghunnah or leaving it out.
- Some teachers allow a very small gap between the lips – what matters is that the n disappears and the ghunnah remains audible.

## Practice tip
Look for the small mim sign in your mushaf on one page of Surah al-Baqarah. Every time you see it, hum the m for two counts before saying the ب. Recording yourself helps you hear whether the n has really disappeared.`,
    body_de: `## Was ist Iqlab?
*Iqlab* bedeutet „umwandeln“ oder „umkehren“. Folgt auf ein Nun Sakina oder Tanwin der Buchstabe **ب**, wird das Nun in ein **Mim** umgewandelt, und dieses Mim wird mit leichtem Lippenschluss und einer Ghunna von **zwei Zählzeiten** gesprochen.

## Der Iqlab-Buchstabe
Nur ein einziger Buchstabe:
- ب

Iqlab gibt es sowohl **innerhalb eines Wortes** (أَنبِئْهُم، لَيُنبَذَنَّ) als auch **zwischen zwei Wörtern** (مِن بَعْدِ، سَمِيعٌ بَصِيرٌ).

## So erkennst du es im Mushaf
In den meisten gedruckten Mushafs steht ein kleines **Mim (ۢ)** über dem Nun bzw. neben dem Tanwin, und das Nun hat kein Sukun. Das heißt: nicht n, sondern m lesen.

## Warum Iqlab?
Das Nun mit seiner klaren Zungenartikulation und das ب mit geschlossenen Lippen lassen sich schwer direkt hintereinander sprechen. Das Mim teilt die Lippen mit dem ب und die Ghunna mit dem Nun – es ist die ideale Brücke zwischen beiden.

## Wie klingt es?
- Die Lippen **sanft** schließen – nicht fest aufeinanderpressen.
- Den Nasalklang etwa zwei Zählzeiten halten.
- Dann ins ب übergehen.

مِن بَعْدِ klingt also wie „mim-baʿdi“ mit einem weichen, summenden m.

## Häufige Fehler
- Ein deutliches n lesen: „min baʿdi“.
- Die Lippen zu fest pressen, sodass das Mim wie ein hartes b klingt.
- Die Ghunna verkürzen oder ganz weglassen.
- Manche Lehrer erlauben einen ganz kleinen Spalt zwischen den Lippen – entscheidend ist, dass das n verschwindet und die Ghunna hörbar bleibt.

## Übungstipp
Suche auf einer Seite von Sure al-Baqara das kleine Mim-Zeichen. Jedes Mal, wenn du es siehst, summst du das m zwei Zählzeiten lang, bevor du das ب sprichst. Eine Aufnahme hilft dir zu hören, ob das n wirklich verschwunden ist.`,
    examples: [
      {
        ar: "مِن بَعْدِ مِيثَاقِهِ",
        key: "2:27",
        note_en: "Nun sakinah before ب across two words – iqlab: mim-baʿdi.",
        note_de: "Nun Sakina vor ب zwischen zwei Wörtern – Iqlab: mim-baʿdi.",
      },
      {
        ar: "أَنبِئْهُم بِأَسْمَائِهِمْ",
        key: "2:33",
        note_en: "Iqlab inside one word (أَنبِئْهُم: ambiʾhum). The mim of هُم before ب is also hidden (ikhfa' shafawi).",
        note_de: "Iqlab innerhalb eines Wortes (أَنبِئْهُم: ambiʾhum). Auch das Mim von هُم vor ب wird verborgen (Ikhfa schafawi).",
      },
      {
        ar: "كَلَّا ۖ لَيُنبَذَنَّ فِي الْحُطَمَةِ",
        key: "104:4",
        note_en: "Iqlab inside the word لَيُنبَذَنَّ: layumbadhanna.",
        note_de: "Iqlab innerhalb des Wortes لَيُنبَذَنَّ: layumbadhanna.",
      },
      {
        ar: "إِنَّ اللَّهَ سَمِيعٌ بَصِيرٌ",
        key: "58:1",
        note_en: "Tanwin before ب – iqlab: samīʿum baṣīr.",
        note_de: "Tanwin vor ب – Iqlab: samiʿum basir.",
      },
    ],
    quiz: [
      {
        q_en: "Which letter causes iqlab?",
        q_de: "Welcher Buchstabe bewirkt Iqlab?",
        options_en: ["م", "ب", "ف", "و"],
        options_de: ["م", "ب", "ف", "و"],
        answer: 1,
        explain_en: "Iqlab happens only before ب.",
        explain_de: "Iqlab gibt es nur vor ب.",
      },
      {
        q_en: "Into which sound is the nun changed in iqlab?",
        q_de: "In welchen Laut wird das Nun beim Iqlab umgewandelt?",
        options_en: ["Into a lam", "Into a mim with ghunnah", "Into a ba", "It disappears without trace"],
        options_de: ["In ein Lam", "In ein Mim mit Ghunna", "In ein Ba", "Es verschwindet spurlos"],
        answer: 1,
        explain_en: "The nun becomes a mim, pronounced with a gentle lip closure and two counts of ghunnah.",
        explain_de: "Das Nun wird zu einem Mim mit sanftem Lippenschluss und zwei Zählzeiten Ghunna.",
      },
      {
        q_en: "How is iqlab usually marked in the mushaf?",
        q_de: "Wie wird Iqlab im Mushaf meist gekennzeichnet?",
        options_en: ["With a small mim", "With a shaddah", "With a small ha", "It is not marked"],
        options_de: ["Mit einem kleinen Mim", "Mit einer Schadda", "Mit einem kleinen Ha", "Gar nicht"],
        answer: 0,
        explain_en: "A small mim above the nun or beside the tanwin signals iqlab.",
        explain_de: "Ein kleines Mim über dem Nun bzw. neben dem Tanwin zeigt Iqlab an.",
      },
      {
        q_en: "Can iqlab occur inside a single word?",
        q_de: "Kann Iqlab innerhalb eines einzigen Wortes vorkommen?",
        options_en: ["No, only across two words", "Yes, e.g. أَنبِئْهُم", "Only at the end of a verse"],
        options_de: ["Nein, nur zwischen zwei Wörtern", "Ja, z. B. أَنبِئْهُم", "Nur am Versende"],
        answer: 1,
        explain_en: "Iqlab applies within a word (أَنبِئْهُم، لَيُنبَذَنَّ) and across words.",
        explain_de: "Iqlab gilt innerhalb eines Wortes (أَنبِئْهُم، لَيُنبَذَنَّ) und zwischen Wörtern.",
      },
      {
        q_en: "What is a typical mistake in iqlab?",
        q_de: "Was ist ein typischer Fehler beim Iqlab?",
        options_en: [
          "Holding the ghunnah for two counts",
          "Pressing the lips together hard",
          "Closing the lips gently",
        ],
        options_de: [
          "Die Ghunna zwei Zählzeiten halten",
          "Die Lippen fest aufeinanderpressen",
          "Die Lippen sanft schließen",
        ],
        answer: 1,
        explain_en: "Pressing too hard makes the mim sound like a hard b; the closure should be gentle.",
        explain_de: "Zu festes Pressen lässt das Mim wie ein hartes b klingen; der Schluss soll sanft sein.",
      },
    ],
  },
  // ───────────────────────────────────────────── 8
  {
    id: "nun-sakinah-ikhfa",
    level: 2,
    title_en: "Ikhfa' Haqiqi – Hiding the Nun",
    title_de: "Ikhfa haqiqi – das Verbergen des Nun",
    summary_en: "Before the remaining fifteen letters a nun sakinah or tanwin is hidden: it is pronounced between izhar and idgham, with a two-count ghunnah.",
    summary_de: "Vor den übrigen fünfzehn Buchstaben wird Nun Sakina oder Tanwin verborgen: Es klingt zwischen Izhar und Idgham, mit einer Ghunna von zwei Zählzeiten.",
    body_en: `## What is ikhfa'?
*Ikhfāʾ* means "hiding". The nun sakinah or tanwin is neither pronounced clearly (izhar) nor merged completely (idgham). Instead, the tip of the tongue does **not** press firmly on the nun's place; the sound moves into the nose, and the tongue already prepares for the next letter. This state is held as a ghunnah of **two counts**.

It is called *ikhfāʾ ḥaqīqī* ("real ikhfa'") to distinguish it from the ikhfa' of mim (lesson 9).

## The fifteen letters of ikhfa'
All letters that are not used for izhar (6), idgham (6) or iqlab (1):
- ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك

A classic memory poem uses the first letters of the words: صِفْ ذَا ثَنَا كَمْ جَادَ شَخْصٌ قَدْ سَمَا ...

Ikhfa' happens inside a word (الْإِنسَانَ، أَنتُمْ، يَنصُرُكُمْ) and across words (مِن شَرِّ، مِن جُوعٍ، عُمْيٌ فَهُمْ).

## Heavy or light ghunnah?
The ghunnah takes on the colour of the **next** letter:
- before a heavy letter (ص ض ط ظ ق) it sounds full and deep: يَنصُرُكُمْ، مِن قَبْلِ.
- before a light letter it sounds light: كُنتُمْ، مِن شَرِّ.

## How it sounds
- Move the tongue towards the next letter, but do not let it touch firmly yet.
- Keep the sound in the nose for two counts.
- Then pronounce the next letter clearly.

Tip: also watch the vowel before the nun – do not turn "an" into "ang" or "aun".

## Typical mistakes
- Pronouncing a clear n with the tongue pressed (sounds like izhar).
- Turning the nun into "ng" (especially before ك and ق).
- Shortening the ghunnah, or stretching it far beyond two counts.
- Making a heavy ghunnah before a light letter.

## Practice tip
Practise pairs: مِنْ خَوْفٍ (izhar) and مِن جُوعٍ (ikhfa') from Surah Quraysh, verse 4. Feel the difference: in the first the tongue touches firmly, in the second it hovers.`,
    body_de: `## Was ist Ikhfa?
*Ikhfa* heißt „verbergen“. Das Nun Sakina oder Tanwin wird weder deutlich gesprochen (Izhar) noch vollständig verschmolzen (Idgham). Stattdessen drückt die Zungenspitze **nicht** fest an die Stelle des Nun; der Klang wandert in die Nase, und die Zunge bereitet schon den nächsten Buchstaben vor. Dieser Zustand wird als Ghunna **zwei Zählzeiten** gehalten.

Man nennt es *Ikhfa haqiqi* („eigentliches Ikhfa“), um es vom Ikhfa des Mim (Lektion 9) zu unterscheiden.

## Die fünfzehn Ikhfa-Buchstaben
Alle Buchstaben, die nicht zu Izhar (6), Idgham (6) oder Iqlab (1) gehören:
- ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك

Ein klassisches Merkgedicht nutzt die Anfangsbuchstaben seiner Wörter: صِفْ ذَا ثَنَا كَمْ جَادَ شَخْصٌ قَدْ سَمَا ...

Ikhfa gibt es innerhalb eines Wortes (الْإِنسَانَ، أَنتُمْ، يَنصُرُكُمْ) und zwischen Wörtern (مِن شَرِّ، مِن جُوعٍ، عُمْيٌ فَهُمْ).

## Schwere oder leichte Ghunna?
Die Ghunna übernimmt die Klangfarbe des **folgenden** Buchstabens:
- vor einem schweren Buchstaben (ص ض ط ظ ق) klingt sie voll und tief: يَنصُرُكُمْ، مِن قَبْلِ.
- vor einem leichten Buchstaben klingt sie hell: كُنتُمْ، مِن شَرِّ.

## Wie klingt es?
- Die Zunge in Richtung des nächsten Buchstabens bewegen, aber noch nicht fest aufsetzen.
- Den Klang zwei Zählzeiten in der Nase halten.
- Dann den nächsten Buchstaben deutlich sprechen.

Achte auch auf den Vokal vor dem Nun – aus „an“ darf kein „ang“ oder „aun“ werden.

## Häufige Fehler
- Ein deutliches n mit fest aufgesetzter Zunge (klingt wie Izhar).
- Das Nun als „ng“ sprechen, besonders vor ك und ق.
- Die Ghunna verkürzen oder weit über zwei Zählzeiten dehnen.
- Vor einem leichten Buchstaben eine schwere Ghunna sprechen.

## Übungstipp
Übe das Paar aus Sure Quraisch, Vers 4: مِنْ خَوْفٍ (Izhar) und مِن جُوعٍ (Ikhfa). Spür den Unterschied: Beim ersten setzt die Zunge fest auf, beim zweiten schwebt sie.`,
    examples: [
      {
        ar: "مِن شَرِّ مَا خَلَقَ",
        key: "113:2",
        note_en: "Nun sakinah before ش – ikhfa' with a light ghunnah of two counts.",
        note_de: "Nun Sakina vor ش – Ikhfa mit leichter Ghunna von zwei Zählzeiten.",
      },
      {
        ar: "الَّذِي أَطْعَمَهُم مِّن جُوعٍ",
        key: "106:4",
        note_en: "Nun sakinah in مِّن before ج – ikhfa'.",
        note_de: "Nun Sakina in مِّن vor ج – Ikhfa.",
      },
      {
        ar: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",
        key: "103:2",
        note_en: "Ikhfa' inside a word: nun sakinah before س in الْإِنسَانَ.",
        note_de: "Ikhfa innerhalb eines Wortes: Nun Sakina vor س in الْإِنسَانَ.",
      },
      {
        ar: "أَنْعَمْتَ عَلَيْهِمْ",
        key: "1:7",
        note_en: "Contrast: here the nun is before ع, so it is izhar – no ikhfa'. Compare with the hidden nun before ت in كُنتُمْ.",
        note_de: "Zum Vergleich: Hier steht das Nun vor ع, also Izhar – kein Ikhfa. Vergleiche mit dem verborgenen Nun vor ت in كُنتُمْ.",
      },
      {
        ar: "يَنصُرُكُمْ",
        note_en: "Ikhfa' before the heavy letter ص – the ghunnah sounds full and deep.",
        note_de: "Ikhfa vor dem schweren Buchstaben ص – die Ghunna klingt voll und tief.",
      },
    ],
    quiz: [
      {
        q_en: "How many letters cause ikhfa' haqiqi?",
        q_de: "Wie viele Buchstaben bewirken Ikhfa haqiqi?",
        options_en: ["6", "13", "15", "1"],
        options_de: ["6", "13", "15", "1"],
        answer: 2,
        explain_en: "Of the 28 letters, 6 are for izhar, 6 for idgham and 1 for iqlab; the remaining 15 are the letters of ikhfa'.",
        explain_de: "Von den 28 Buchstaben gehören 6 zu Izhar, 6 zu Idgham und 1 zu Iqlab; die übrigen 15 sind die Ikhfa-Buchstaben.",
      },
      {
        q_en: "Which phrase contains ikhfa'?",
        q_de: "Welcher Ausdruck enthält Ikhfa?",
        options_en: ["مِنْ خَوْفٍ", "مِن جُوعٍ", "مَن يَقُولُ", "مِن بَعْدِ"],
        options_de: ["مِنْ خَوْفٍ", "مِن جُوعٍ", "مَن يَقُولُ", "مِن بَعْدِ"],
        answer: 1,
        explain_en: "ج is an ikhfa' letter. The others are izhar (خ), idgham (ي) and iqlab (ب).",
        explain_de: "ج ist ein Ikhfa-Buchstabe. Die anderen sind Izhar (خ), Idgham (ي) und Iqlab (ب).",
      },
      {
        q_en: "What decides whether the ghunnah of ikhfa' is heavy or light?",
        q_de: "Wovon hängt ab, ob die Ghunna beim Ikhfa schwer oder leicht ist?",
        options_en: ["The vowel before the nun", "The letter after the nun", "The length of the verse"],
        options_de: ["Vom Vokal vor dem Nun", "Vom Buchstaben nach dem Nun", "Von der Länge des Verses"],
        answer: 1,
        explain_en: "The ghunnah follows the following letter: heavy before letters like ص ط ق, light otherwise.",
        explain_de: "Die Ghunna richtet sich nach dem folgenden Buchstaben: schwer vor Buchstaben wie ص ط ق, sonst leicht.",
      },
      {
        q_en: "What happens to the tongue during ikhfa'?",
        q_de: "Was macht die Zunge beim Ikhfa?",
        options_en: [
          "It presses firmly on the nun's place",
          "It does not press firmly and prepares for the next letter",
          "It stays completely at the bottom of the mouth and the lips close",
        ],
        options_de: [
          "Sie drückt fest an die Stelle des Nun",
          "Sie drückt nicht fest und bereitet den nächsten Buchstaben vor",
          "Sie bleibt ganz unten und die Lippen schließen sich",
        ],
        answer: 1,
        explain_en: "In ikhfa' the tongue does not make full contact; the sound goes into the nose.",
        explain_de: "Beim Ikhfa berührt die Zunge nicht fest; der Klang geht in die Nase.",
      },
      {
        q_en: "Which of these is a common mistake in ikhfa' before ك?",
        q_de: "Welcher Fehler passiert oft beim Ikhfa vor ك?",
        options_en: ["Turning the nun into \"ng\"", "Holding the ghunnah two counts", "Pronouncing ك clearly afterwards"],
        options_de: ["Das Nun als „ng“ sprechen", "Die Ghunna zwei Zählzeiten halten", "Danach das ك deutlich sprechen"],
        answer: 0,
        explain_en: "Before ك and ق many learners produce an \"ng\" sound; the ghunnah should stay a pure nasal sound.",
        explain_de: "Vor ك und ق entsteht oft ein „ng“; die Ghunna soll ein reiner Nasalklang bleiben.",
      },
    ],
  },

  // ───────────────────────────────────────────── 9
  {
    id: "mim-sakinah",
    level: 2,
    title_en: "Mim Sakinah – Ikhfa', Idgham and Izhar Shafawi",
    title_de: "Mim Sakina – Ikhfa, Idgham und Izhar schafawi",
    summary_en: "A mim sakinah is hidden before ب, merged before م and pronounced clearly before every other letter.",
    summary_de: "Ein Mim Sakina wird vor ب verborgen, vor م verschmolzen und vor allen anderen Buchstaben deutlich gesprochen.",
    body_en: `## What is mim sakinah?
A *mīm sākinah* is a mim without a vowel, e.g. in هُمْ، عَلَيْهِمْ، أَمْ. Because mim is made with the lips, its rules are called *shafawī* ("of the lips"). There are three rules, depending on the next letter.

## 1. Ikhfa' shafawi – before ب
- Letter: ب
- The lips close gently on the mim, the ghunnah is held for **two counts**, then the ب follows.
- Example: تَرْمِيهِم بِحِجَارَةٍ، أَنبِئْهُم بِأَسْمَائِهِمْ

Many mushafs show this by leaving the mim without a sukun sign.

## 2. Idgham shafawi (idgham mithlayn saghir) – before م
- Letter: م
- The first mim merges into the second, giving one doubled mim with a **two-count ghunnah**.
- Example: آمَنَهُم مِّنْ خَوْفٍ، لَهُم مَّا

The mushaf shows this with a shaddah on the second mim.

## 3. Izhar shafawi – before all other letters
- Letters: all except ب and م (and alif, which never follows a sukun).
- The mim is pronounced clearly with a light lip closure, **without** stretching the ghunnah.
- Example: أَلَمْ تَرَ، عَلَيْهِمْ وَلَا، هُمْ فِيهَا

Be extra careful before **و** and **ف**: both are also made with the lips, so there is a temptation to hide the mim. Keep it clear.

## Mim mushaddadah
A mim with shaddah (ثُمَّ، عَمَّ) always has a full ghunnah – that is the topic of the next lesson.

## Typical mistakes
- Hiding the mim before ف or و: "hum-fīhā" with a long hum.
- Pronouncing a clear, short m before ب instead of a gentle ghunnah.
- Forgetting the ghunnah in idgham: "lahum-mā" without nasal sound.
- Moving into the next word with a hard lip pop.

## Practice tip
Read Surah al-Fil and Surah Quraysh. Mark every mim sakinah in three colours: one for ب, one for م, one for everything else. Then recite and check each colour.`,
    body_de: `## Was ist Mim Sakina?
Ein *Mim Sakina* ist ein Mim ohne Vokal, z. B. in هُمْ، عَلَيْهِمْ، أَمْ. Weil das Mim mit den Lippen gebildet wird, heißen seine Regeln *schafawi* („die Lippen betreffend“). Es gibt drei Regeln – je nach folgendem Buchstaben.

## 1. Ikhfa schafawi – vor ب
- Buchstabe: ب
- Die Lippen schließen sich sanft auf dem Mim, die Ghunna wird **zwei Zählzeiten** gehalten, dann folgt das ب.
- Beispiel: تَرْمِيهِم بِحِجَارَةٍ، أَنبِئْهُم بِأَسْمَائِهِمْ

Viele Mushafs zeigen das, indem das Mim kein Sukun-Zeichen trägt.

## 2. Idgham schafawi (Idgham mithlain saghir) – vor م
- Buchstabe: م
- Das erste Mim verschmilzt mit dem zweiten zu einem verdoppelten Mim mit einer **Ghunna von zwei Zählzeiten**.
- Beispiel: آمَنَهُم مِّنْ خَوْفٍ، لَهُم مَّا

Im Mushaf steht dann eine Schadda auf dem zweiten Mim.

## 3. Izhar schafawi – vor allen anderen Buchstaben
- Buchstaben: alle außer ب und م (und Alif, das nie auf ein Sukun folgt).
- Das Mim wird deutlich mit leichtem Lippenschluss gesprochen, **ohne** die Ghunna zu dehnen.
- Beispiel: أَلَمْ تَرَ، عَلَيْهِمْ وَلَا، هُمْ فِيهَا

Besonders aufpassen vor **و** und **ف**: Beide werden auch mit den Lippen gebildet, deshalb ist die Versuchung groß, das Mim zu verbergen. Es muss deutlich bleiben.

## Mim mit Schadda
Ein Mim mit Schadda (ثُمَّ، عَمَّ) hat immer eine volle Ghunna – darum geht es in der nächsten Lektion.

## Häufige Fehler
- Das Mim vor ف oder و verbergen: „hum-fiha“ mit langem Summen.
- Vor ب ein kurzes, hartes m statt einer sanften Ghunna sprechen.
- Beim Idgham die Ghunna vergessen: „lahum-ma“ ohne Nasalklang.
- Mit einem harten Lippen-„Plopp“ ins nächste Wort gehen.

## Übungstipp
Lies Sure al-Fil und Sure Quraisch. Markiere jedes Mim Sakina in drei Farben: eine für ب, eine für م, eine für alles andere. Rezitiere dann und prüfe jede Farbe.`,
    examples: [
      {
        ar: "تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ",
        key: "105:4",
        note_en: "Mim sakinah before ب – ikhfa' shafawi with a two-count ghunnah. (Also: tanwin before م – idgham with ghunnah; nun before س – ikhfa'.)",
        note_de: "Mim Sakina vor ب – Ikhfa schafawi mit zwei Zählzeiten Ghunna. (Außerdem: Tanwin vor م – Idgham mit Ghunna; Nun vor س – Ikhfa.)",
      },
      {
        ar: "وَآمَنَهُم مِّنْ خَوْفٍ",
        key: "106:4",
        note_en: "Mim sakinah before م – idgham shafawi: one doubled mim with ghunnah.",
        note_de: "Mim Sakina vor م – Idgham schafawi: ein verdoppeltes Mim mit Ghunna.",
      },
      {
        ar: "أَلَمْ تَرَ كَيْفَ",
        key: "105:1",
        note_en: "Mim sakinah before ت – izhar shafawi: a clear mim.",
        note_de: "Mim Sakina vor ت – Izhar schafawi: ein deutliches Mim.",
      },
      {
        ar: "هُمْ فِيهَا خَالِدُونَ",
        key: "2:39",
        note_en: "Mim sakinah before ف – izhar shafawi. Take special care not to hide the mim here.",
        note_de: "Mim Sakina vor ف – Izhar schafawi. Hier besonders darauf achten, das Mim nicht zu verbergen.",
      },
      {
        ar: "عَلَيْهِمْ وَلَا الضَّالِّينَ",
        key: "1:7",
        note_en: "Mim sakinah before و – izhar shafawi, pronounced clearly.",
        note_de: "Mim Sakina vor و – Izhar schafawi, deutlich gesprochen.",
      },
    ],
    quiz: [
      {
        q_en: "What is the rule for mim sakinah before ب?",
        q_de: "Welche Regel gilt für Mim Sakina vor ب?",
        options_en: ["Izhar shafawi", "Ikhfa' shafawi", "Idgham shafawi", "Iqlab"],
        options_de: ["Izhar schafawi", "Ikhfa schafawi", "Idgham schafawi", "Iqlab"],
        answer: 1,
        explain_en: "Before ب the mim is hidden with a two-count ghunnah: ikhfa' shafawi.",
        explain_de: "Vor ب wird das Mim mit zwei Zählzeiten Ghunna verborgen: Ikhfa schafawi.",
      },
      {
        q_en: "Which rule applies in لَهُم مَّا?",
        q_de: "Welche Regel gilt in لَهُم مَّا?",
        options_en: ["Idgham shafawi", "Izhar shafawi", "Ikhfa' haqiqi"],
        options_de: ["Idgham schafawi", "Izhar schafawi", "Ikhfa haqiqi"],
        answer: 0,
        explain_en: "Mim sakinah meets mim: they merge into one doubled mim with ghunnah.",
        explain_de: "Mim Sakina trifft auf Mim: beide verschmelzen zu einem verdoppelten Mim mit Ghunna.",
      },
      {
        q_en: "Before which two letters must you be especially careful to keep the mim clear?",
        q_de: "Vor welchen beiden Buchstaben muss man besonders darauf achten, das Mim deutlich zu sprechen?",
        options_en: ["ت and ك", "و and ف", "ع and ح", "ل and ر"],
        options_de: ["ت und ك", "و und ف", "ع und ح", "ل und ر"],
        answer: 1,
        explain_en: "و and ف are also lip letters, so learners tend to hide the mim before them – it must stay clear.",
        explain_de: "و und ف sind ebenfalls Lippenbuchstaben; man neigt dazu, das Mim davor zu verbergen – es muss deutlich bleiben.",
      },
      {
        q_en: "In أَلَمْ تَرَ, how is the mim pronounced?",
        q_de: "Wie wird das Mim in أَلَمْ تَرَ ausgesprochen?",
        options_en: ["Clearly, without extended ghunnah", "Hidden with two counts of ghunnah", "Merged into the ta"],
        options_de: ["Deutlich, ohne gedehnte Ghunna", "Verborgen mit zwei Zählzeiten Ghunna", "Mit dem Ta verschmolzen"],
        answer: 0,
        explain_en: "ت is neither ب nor م, so izhar shafawi applies.",
        explain_de: "ت ist weder ب noch م, daher gilt Izhar schafawi.",
      },
      {
        q_en: "Why are these rules called \"shafawi\"?",
        q_de: "Warum heißen diese Regeln „schafawi“?",
        options_en: ["Because they occur at the end of a verse", "Because mim is a lip letter", "Because they are optional"],
        options_de: ["Weil sie am Versende vorkommen", "Weil Mim ein Lippenbuchstabe ist", "Weil sie freiwillig sind"],
        answer: 1,
        explain_en: "Shafawi comes from shafah (lip); mim is pronounced with the lips.",
        explain_de: "Schafawi kommt von Schafa (Lippe); das Mim wird mit den Lippen gebildet.",
      },
    ],
  },
  // ───────────────────────────────────────────── 10
  {
    id: "ghunnah-mushaddad",
    level: 2,
    title_en: "Ghunnah on Nun and Mim Mushaddad",
    title_de: "Ghunna bei Nun und Mim mit Schadda",
    summary_en: "Every nun and mim with a shaddah carries a full nasal sound (ghunnah) of two counts.",
    summary_de: "Jedes Nun und Mim mit Schadda trägt einen vollen Nasalklang (Ghunna) von zwei Zählzeiten.",
    body_en: `## What is ghunnah?
*Ghunnah* is the nasal sound that comes from the *khayshūm*, the nasal cavity. Every nun and mim has a little ghunnah by nature, but in some situations it becomes long and clearly audible. You can test it: pinch your nose while saying a ghunnah – the sound stops.

## The rule
Whenever **ن** or **م** carries a **shaddah**, the ghunnah is pronounced at its fullest and held for **two counts**:
- نّ – إِنَّ، النَّاسِ، الْجَنَّةِ
- مّ – ثُمَّ، عَمَّ، أُمَّةٌ

This is called *ghunnah mushaddadah*, and teachers often name these letters *ḥarfā ghunnah* ("the two letters of ghunnah"). It applies in the middle of a verse and when stopping on such a letter, e.g. stopping on ثُمَّ.

## Levels of ghunnah
From longest to shortest:
- **Mushaddad** nun and mim (this lesson), and idgham with ghunnah – the most complete.
- **Ikhfa'** (nun and mim) – complete, two counts.
- **Izhar** – only the natural, short ghunnah.
- Nun or mim with a vowel – the shortest natural ghunnah.

## Why a shaddah means ghunnah
A shaddah means two letters: the first has a sukun and the second has a vowel. For نّ this is like a nun sakinah merged into a nun (idgham), and for مّ like a mim sakinah merged into a mim – both cases of idgham with ghunnah.

## How it sounds
- Hold the letter: the tongue (for ن) or the lips (for م) stay in position.
- Let the sound resonate in the nose for two counts.
- Then release into the vowel.

إِنَّ sounds like "in-na" with a held, humming "n".

## Typical mistakes
- Rushing through: "ina" instead of "in-na".
- Stretching the ghunnah to four counts or more.
- Making the ghunnah dark and heavy – nun and mim are light letters, so their ghunnah stays light.

## Practice tip
Recite Surah an-Nas. It contains النَّاسِ five times, plus الْخَنَّاسِ and الْجِنَّةِ. Count "one, two" in your head every time you reach a نّ.`,
    body_de: `## Was ist Ghunna?
*Ghunna* ist der Nasalklang, der im *Chaischum*, dem Nasenraum, entsteht. Jedes Nun und Mim hat von Natur aus eine kleine Ghunna, doch in manchen Fällen wird sie lang und deutlich hörbar. Teste es: Halte dir beim Sprechen einer Ghunna die Nase zu – der Klang bricht ab.

## Die Regel
Immer wenn **ن** oder **م** eine **Schadda** trägt, wird die Ghunna in voller Stärke gesprochen und **zwei Zählzeiten** gehalten:
- نّ – إِنَّ، النَّاسِ، الْجَنَّةِ
- مّ – ثُمَّ، عَمَّ، أُمَّةٌ

Man nennt das *Ghunna muschaddada*; die beiden Buchstaben heißen oft *Harfa al-Ghunna* („die zwei Ghunna-Buchstaben“). Das gilt mitten im Vers und auch, wenn man auf einem solchen Buchstaben anhält, z. B. bei ثُمَّ.

## Stufen der Ghunna
Von der längsten zur kürzesten:
- Nun und Mim **mit Schadda** (diese Lektion) sowie Idgham mit Ghunna – am vollständigsten.
- **Ikhfa** (bei Nun und Mim) – vollständig, zwei Zählzeiten.
- **Izhar** – nur die natürliche, kurze Ghunna.
- Nun oder Mim mit Vokal – die kürzeste natürliche Ghunna.

## Warum Schadda Ghunna bedeutet
Eine Schadda steht für zwei Buchstaben: Der erste hat ein Sukun, der zweite einen Vokal. Bei نّ ist das wie ein Nun Sakina, das in ein Nun verschmilzt, bei مّ wie ein Mim Sakina in ein Mim – beides Idgham mit Ghunna.

## Wie klingt es?
- Den Buchstaben halten: Die Zunge (bei ن) bzw. die Lippen (bei م) bleiben in Position.
- Den Klang zwei Zählzeiten in der Nase schwingen lassen.
- Dann in den Vokal übergehen.

إِنَّ klingt wie „in-na“ mit einem gehaltenen, summenden „n“.

## Häufige Fehler
- Darüberhuschen: „ina“ statt „in-na“.
- Die Ghunna auf vier oder mehr Zählzeiten dehnen.
- Eine dunkle, schwere Ghunna sprechen, wo der Buchstabe leicht ist – Nun und Mim selbst sind leichte Buchstaben.

## Übungstipp
Rezitiere Sure an-Nas. Darin kommt النَّاسِ fünfmal vor, dazu الْخَنَّاسِ und الْجِنَّةِ. Zähle bei jedem نّ innerlich „eins, zwei“.`,
    examples: [
      {
        ar: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
        key: "108:1",
        note_en: "Nun mushaddad in إِنَّا – full ghunnah of two counts.",
        note_de: "Nun mit Schadda in إِنَّا – volle Ghunna von zwei Zählzeiten.",
      },
      {
        ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        key: "114:1",
        note_en: "Nun mushaddad in النَّاسِ – ghunnah of two counts.",
        note_de: "Nun mit Schadda in النَّاسِ – Ghunna von zwei Zählzeiten.",
      },
      {
        ar: "مِنَ الْجِنَّةِ وَالنَّاسِ",
        key: "114:6",
        note_en: "Two mushaddad nuns: الْجِنَّةِ and النَّاسِ – both with full ghunnah.",
        note_de: "Zwei Nun mit Schadda: الْجِنَّةِ und النَّاسِ – beide mit voller Ghunna.",
      },
      {
        ar: "عَمَّ يَتَسَاءَلُونَ",
        key: "78:1",
        note_en: "Mim mushaddad in عَمَّ – the lips stay closed for two counts of ghunnah.",
        note_de: "Mim mit Schadda in عَمَّ – die Lippen bleiben für zwei Zählzeiten Ghunna geschlossen.",
      },
      {
        ar: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",
        key: "103:2",
        note_en: "Ghunnah on the nun mushaddad in إِنَّ, then ikhfa' in الْإِنسَانَ – both two counts.",
        note_de: "Ghunna auf dem Nun mit Schadda in إِنَّ, danach Ikhfa in الْإِنسَانَ – beides zwei Zählzeiten.",
      },
    ],
    quiz: [
      {
        q_en: "How long is the ghunnah on a nun or mim with shaddah?",
        q_de: "Wie lang ist die Ghunna bei Nun oder Mim mit Schadda?",
        options_en: ["One count", "Two counts", "Four counts", "Six counts"],
        options_de: ["Eine Zählzeit", "Zwei Zählzeiten", "Vier Zählzeiten", "Sechs Zählzeiten"],
        answer: 1,
        explain_en: "Ghunnah mushaddadah is held for two counts.",
        explain_de: "Die Ghunna muschaddada wird zwei Zählzeiten gehalten.",
      },
      {
        q_en: "Where is the ghunnah produced?",
        q_de: "Wo wird die Ghunna gebildet?",
        options_en: ["In the throat", "In the nasal cavity", "At the tip of the tongue"],
        options_de: ["Im Rachen", "Im Nasenraum", "An der Zungenspitze"],
        answer: 1,
        explain_en: "The ghunnah comes from the khayshūm (nasal cavity); pinching the nose cuts it off.",
        explain_de: "Die Ghunna kommt aus dem Chaischum (Nasenraum); hält man die Nase zu, bricht sie ab.",
      },
      {
        q_en: "Which word contains a ghunnah mushaddadah?",
        q_de: "Welches Wort enthält eine Ghunna muschaddada?",
        options_en: ["مِنْ", "ثُمَّ", "قُلْ", "أَحَدٌ"],
        options_de: ["مِنْ", "ثُمَّ", "قُلْ", "أَحَدٌ"],
        answer: 1,
        explain_en: "ثُمَّ has a mim with shaddah, so it carries a full ghunnah.",
        explain_de: "ثُمَّ hat ein Mim mit Schadda und trägt daher eine volle Ghunna.",
      },
      {
        q_en: "Does the ghunnah remain when you stop on ثُمَّ?",
        q_de: "Bleibt die Ghunna, wenn man auf ثُمَّ anhält?",
        options_en: ["Yes, it is still held two counts", "No, it disappears at a stop", "Only in Surah an-Nas"],
        options_de: ["Ja, sie wird weiterhin zwei Zählzeiten gehalten", "Nein, beim Anhalten entfällt sie", "Nur in Sure an-Nas"],
        answer: 0,
        explain_en: "The shaddah stays when stopping, and so does the ghunnah.",
        explain_de: "Die Schadda bleibt beim Anhalten erhalten – und damit auch die Ghunna.",
      },
      {
        q_en: "Which rule has a SHORTER ghunnah than the mushaddad nun?",
        q_de: "Bei welcher Regel ist die Ghunna KÜRZER als beim Nun mit Schadda?",
        options_en: ["Idgham with ghunnah", "Izhar", "Mim with shaddah"],
        options_de: ["Idgham mit Ghunna", "Izhar", "Mim mit Schadda"],
        answer: 1,
        explain_en: "With izhar only the natural short ghunnah of the nun remains.",
        explain_de: "Beim Izhar bleibt nur die natürliche, kurze Ghunna des Nun.",
      },
    ],
  },

  // ───────────────────────────────────────────── 11
  {
    id: "qalqalah",
    level: 2,
    title_en: "Qalqalah – The Echoing Letters",
    title_de: "Qalqala – die nachhallenden Buchstaben",
    summary_en: "The five letters ق ط ب ج د produce a slight echo or bounce when they carry a sukun, which is stronger when you stop on them.",
    summary_de: "Die fünf Buchstaben ق ط ب ج د erzeugen mit Sukun einen leichten Nachhall, der beim Anhalten auf ihnen stärker wird.",
    body_en: `## What is qalqalah?
*Qalqalah* means "shaking" or "vibration". Some letters are made with a full closure of the mouth and no flow of breath or voice. When such a letter has a sukun, it would almost disappear – so it is released with a small **bounce** that makes it audible.

## The five letters
Gathered in the phrase **قُطْبُ جَدٍّ**:
- ق ط ب ج د

Qalqalah only happens when these letters are **sakin** – either with a written sukun or because you stop on them.

## The levels
- **Qalqalah sughra (minor):** the letter has a sukun in the middle of a word or at the end of a word you do not stop on. The bounce is light. Examples: يَقْطَعُونَ، اقْرَأْ، قَدْ أَفْلَحَ.
- **Qalqalah kubra (major):** you **stop** on the letter at the end of a word or verse. The bounce is clearer. Examples: الْفَلَقِ → الْفَلَقْ، أَحَدٌ → أَحَدْ.
- Many teachers add a strongest level when you stop on a qalqalah letter with **shaddah**, e.g. الْحَقُّ or وَتَبَّ. Here the letter is held a moment, then released with a clear bounce.

## How it sounds
- Close the articulation fully (lips for ب, tongue for the others).
- Release it quickly, without adding a vowel.
- The bounce tends slightly towards the vowel before it, but it must not become a real vowel.

## Typical mistakes
- Adding a full vowel: "aḥada" or "falaqa" instead of a short bounce.
- No bounce at all, so the letter is swallowed: "al-fala".
- Applying qalqalah to letters with a vowel (e.g. the ق in قُلْ).
- Applying qalqalah to non-qalqalah letters like ك or ت.

## Practice tip
Recite Surah al-Ikhlas and Surah al-Falaq and stop at every verse end. Most verses end on a qalqalah letter (أَحَدْ، الصَّمَدْ، يُولَدْ، الْفَلَقْ، خَلَقْ، وَقَبْ، الْعُقَدْ، حَسَدْ). Listen to a reciter and copy the bounce exactly.`,
    body_de: `## Was ist Qalqala?
*Qalqala* bedeutet „Erschütterung“ oder „Vibration“. Einige Buchstaben werden mit vollständigem Verschluss gebildet, ohne dass Atem oder Stimme weiterfließen. Tragen sie ein Sukun, würden sie fast verschwinden – deshalb werden sie mit einem kleinen **Nachfedern** gelöst, das sie hörbar macht.

## Die fünf Buchstaben
Zusammengefasst im Merkwort **قُطْبُ جَدٍّ**:
- ق ط ب ج د

Qalqala gibt es nur, wenn diese Buchstaben **sakin** sind – entweder mit geschriebenem Sukun oder weil man auf ihnen anhält.

## Die Stufen
- **Qalqala sughra (klein):** Der Buchstabe hat ein Sukun mitten im Wort oder am Wortende, ohne dass man anhält. Das Nachfedern ist leicht. Beispiele: يَقْطَعُونَ، اقْرَأْ، قَدْ أَفْلَحَ.
- **Qalqala kubra (groß):** Man **hält** am Wort- oder Versende auf dem Buchstaben an. Das Nachfedern ist deutlicher. Beispiele: الْفَلَقِ → الْفَلَقْ، أَحَدٌ → أَحَدْ.
- Viele Lehrer nennen eine noch stärkere Stufe, wenn man auf einem Qalqala-Buchstaben **mit Schadda** anhält, z. B. الْحَقُّ oder وَتَبَّ. Der Buchstabe wird kurz gehalten und dann deutlich gelöst.

## Wie klingt es?
- Die Artikulationsstelle vollständig schließen (Lippen bei ب, Zunge bei den anderen).
- Schnell lösen, ohne einen Vokal anzuhängen.
- Der Nachhall neigt sich leicht zum vorherigen Vokal, darf aber kein echter Vokal werden.

## Häufige Fehler
- Einen vollen Vokal anhängen: „ahada“ oder „falaqa“ statt eines kurzen Nachfederns.
- Gar kein Nachfedern, sodass der Buchstabe verschluckt wird: „al-fala“.
- Qalqala bei Buchstaben mit Vokal anwenden (z. B. beim ق in قُلْ).
- Qalqala bei Buchstaben wie ك oder ت anwenden, die nicht dazugehören.

## Übungstipp
Rezitiere Sure al-Ichlas und Sure al-Falaq und halte an jedem Versende an. Fast alle Verse enden auf einem Qalqala-Buchstaben (أَحَدْ، الصَّمَدْ، يُولَدْ، الْفَلَقْ، خَلَقْ، وَقَبْ، الْعُقَدْ، حَسَدْ). Hör einem Rezitator zu und ahme das Nachfedern genau nach.`,
    examples: [
      {
        ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
        key: "113:1",
        note_en: "Stopping on الْفَلَقْ – qalqalah kubra on the ق.",
        note_de: "Anhalten auf الْفَلَقْ – Qalqala kubra auf dem ق.",
      },
      {
        ar: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        key: "112:3",
        note_en: "The د in يَلِدْ (continuing) – qalqalah sughra; the د in يُولَدْ (stopping) – qalqalah kubra.",
        note_de: "Das د in يَلِدْ (beim Weiterlesen) – Qalqala sughra; das د in يُولَدْ (beim Anhalten) – Qalqala kubra.",
      },
      {
        ar: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
        key: "96:1",
        note_en: "ق with sukun in اقْرَأْ – qalqalah sughra; stopping on خَلَقْ – qalqalah kubra.",
        note_de: "ق mit Sukun in اقْرَأْ – Qalqala sughra; Anhalten auf خَلَقْ – Qalqala kubra.",
      },
      {
        ar: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ",
        key: "23:1",
        note_en: "د with sukun in قَدْ – qalqalah sughra.",
        note_de: "د mit Sukun in قَدْ – Qalqala sughra.",
      },
      {
        ar: "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ",
        key: "111:1",
        note_en: "Stopping on وَتَبَّ: a ب with shaddah – the strongest qalqalah.",
        note_de: "Anhalten auf وَتَبَّ: ein ب mit Schadda – die stärkste Qalqala.",
      },
    ],
    quiz: [
      {
        q_en: "Which letters are the qalqalah letters?",
        q_de: "Welche Buchstaben sind die Qalqala-Buchstaben?",
        options_en: ["ق ط ب ج د", "ك ت ث س", "ء ه ع ح", "ي ر م ل"],
        options_de: ["ق ط ب ج د", "ك ت ث س", "ء ه ع ح", "ي ر م ل"],
        answer: 0,
        explain_en: "They are gathered in قُطْبُ جَدٍّ.",
        explain_de: "Sie sind im Merkwort قُطْبُ جَدٍّ zusammengefasst.",
      },
      {
        q_en: "When does qalqalah happen?",
        q_de: "Wann tritt Qalqala auf?",
        options_en: ["When the letter has a fatha", "When the letter is sakin", "Only at the start of a verse"],
        options_de: ["Wenn der Buchstabe ein Fatha trägt", "Wenn der Buchstabe sakin ist", "Nur am Versanfang"],
        answer: 1,
        explain_en: "Qalqalah applies only when the letter has a sukun – written or caused by stopping.",
        explain_de: "Qalqala gibt es nur, wenn der Buchstabe ein Sukun hat – geschrieben oder durch Anhalten entstanden.",
      },
      {
        q_en: "Stopping on أَحَدٌ at the end of 112:1 gives…",
        q_de: "Hält man am Ende von 112:1 auf أَحَدٌ an, entsteht …",
        options_en: ["Qalqalah sughra", "Qalqalah kubra", "No qalqalah", "A ghunnah"],
        options_de: ["Qalqala sughra", "Qalqala kubra", "Keine Qalqala", "Eine Ghunna"],
        answer: 1,
        explain_en: "Stopping on a qalqalah letter at the end of a word gives the major qalqalah.",
        explain_de: "Hält man am Wortende auf einem Qalqala-Buchstaben an, entsteht die große Qalqala.",
      },
      {
        q_en: "Which is a typical mistake with qalqalah?",
        q_de: "Was ist ein typischer Fehler bei der Qalqala?",
        options_en: [
          "Adding a full vowel after the letter",
          "Closing the makhraj completely",
          "Releasing the letter quickly",
        ],
        options_de: [
          "Einen vollen Vokal nach dem Buchstaben anhängen",
          "Die Artikulationsstelle vollständig schließen",
          "Den Buchstaben schnell lösen",
        ],
        answer: 0,
        explain_en: "The bounce must stay short; adding a vowel (\"aḥada\") changes the word.",
        explain_de: "Das Nachfedern muss kurz bleiben; ein angehängter Vokal („ahada“) verändert das Wort.",
      },
      {
        q_en: "In قُلْ, does the ق have qalqalah?",
        q_de: "Hat das ق in قُلْ eine Qalqala?",
        options_en: ["Yes, always", "No, because it carries a vowel (damma)", "Only when stopping on قُلْ"],
        options_de: ["Ja, immer", "Nein, weil es einen Vokal (Damma) trägt", "Nur beim Anhalten auf قُلْ"],
        answer: 1,
        explain_en: "Only a sakin qalqalah letter bounces; the ق in قُلْ has a damma.",
        explain_de: "Nur ein Qalqala-Buchstabe mit Sukun federt nach; das ق in قُلْ hat ein Damma.",
      },
    ],
  },
  // @@CONTINUE@@
];
