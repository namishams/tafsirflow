// Long-form guide articles (SEO). Bodies are Markdown with "## " / "### " headings.
// Internal links use app paths without locale prefix; the renderer adds the locale.

export type Guide = {
  slug: string;
  date: string;
  title_en: string;
  title_de: string;
  desc_en: string;
  desc_de: string;
  keywords_en: string;
  keywords_de: string;
  body_en: string;
  body_de: string;
  faq: { q_en: string; a_en: string; q_de: string; a_de: string }[];
  related: string[];
};

export const GUIDES: Guide[] = [
  // ---------------------------------------------------------------------------
  {
    slug: "how-to-learn-the-quran",
    date: "2026-10-06",
    title_en: "How to Learn the Quran: A Complete Beginner's Guide",
    title_de: "Koran lernen: Der komplette Leitfaden für Anfänger",
    desc_en: "Start learning the Quran step by step: listening, reading, meaning, tafsir and memorisation. A calm, practical beginner's guide with the Shams Method.",
    desc_de: "Koran lernen von Anfang an: zuhören, lesen, Bedeutung, Tafsir und Auswendiglernen. Ein ruhiger, praktischer Leitfaden für Anfänger mit der Shams-Methode.",
    keywords_en: "how to learn the Quran, learn Quran for beginners, learn Quran online, Quran study, Shams Method",
    keywords_de: "Koran lernen, Koran lernen für Anfänger, Koran online lernen, Koran verstehen, Shams-Methode",
    body_en: `Learning the Quran is one of the most rewarding journeys a Muslim can begin – and it is open to everyone, whatever your age, background or level of Arabic. The Prophet Muhammad ﷺ said: "The best of you are those who learn the Quran and teach it" (Bukhari). This guide shows you where to start, what to focus on first, and how to build a routine you can actually keep.

## What does "learning the Quran" mean?

People mean different things when they say they want to learn the Quran. It helps to separate the main areas, because each one needs a slightly different approach:

- **Listening (sama')** – getting to know the sound, rhythm and melody of the verses.
- **Reading (tilawa)** – reading the Arabic text correctly, at first with help and later on your own.
- **Recitation with tajweed** – pronouncing every letter and applying the rules of recitation.
- **Understanding (fahm)** – knowing what the verses mean, word by word and as a whole.
- **Tafsir** – learning how classical scholars explained the verses, their context and lessons.
- **Memorisation (hifz)** – carrying verses in your heart so you can recite them in prayer and beyond.

You do not need to master one area before touching the next. In fact, they support each other: a verse you understand is easier to memorise, and a verse you have heard many times is easier to read.

## Step 1: Clarify your intention and your goal

Before you open the first page, take a moment for your intention (niyya). You are learning the words of Allah – not to impress anyone, but to draw closer to Him and to live by what you learn.

Then set a concrete, modest goal. Some examples:

1. Understand and recite Al-Fatiha properly within one month.
2. Learn the last ten surahs of the Quran by heart this year.
3. Read one page a day with meaning and a short tafsir.

A clear goal makes it easier to choose what to practise each day.

## Step 2: Start with listening

Children learn their first language by listening long before they speak. The same principle works for the Quran. Before you try to read or recite a verse, listen to it several times while following the Arabic text with your eyes.

In Quran Masterclass you can play every verse on its own, choose between several well-known reciters and see each word highlighted as it is recited. Start with [Al-Fatiha](/surah/1): seven verses that every Muslim recites in every unit of prayer.

## Step 3: Learn to read the Arabic script

If you cannot read Arabic yet, do not let that stop you. The Arabic alphabet has 28 letters, and with daily practice most adults can read simple words within a few weeks. Transliteration (Arabic written in Latin letters) is a helpful bridge at the start, but aim to move beyond it step by step.

Our guide on [learning to read the Quran](/guides/learn-to-read-the-quran) explains the letters, vowel marks and a realistic path from transliteration to the Arabic script.

## Step 4: Understand what you recite

The Quran invites reflection: "Do they not reflect upon the Quran?" (4:82). Understanding begins with the meaning of individual words. Quran Masterclass shows a word-by-word translation under every verse, so you can see which Arabic word carries which meaning.

After the words, read the translation of the whole verse. Over time you will notice that many words appear again and again – learning these [core words and their roots](/guides/learn-quranic-arabic-vocabulary) makes every new surah easier.

## Step 5: Read the tafsir

A translation tells you what a verse says; tafsir tells you how it was understood by the Prophet ﷺ, his companions and the great scholars after them. It explains context, reasons of revelation and connections to other verses.

In the app, the tafsir of each verse appears next to the audio, always with the name of its source – for example Ibn Kathir. Read more in our guide [Understanding the Quran with tafsir](/guides/understanding-the-quran-tafsir).

## Step 6: Memorise with a method

Memorising is where many beginners give up – usually because they repeat a verse many times, feel confident, and find a week later that it has gone. Memory needs two things: **active recall** and **well-timed review**.

This is why we developed the [Shams Method](/shams). Nami Shams designed it as a fixed path of seven short steps per verse:

1. **Listen** – hear the verse three times with your eyes on the text.
2. **Build up backwards** – start with the last word, then the last two, and so on until the whole verse.
3. **Word by word** – look at each word and its meaning.
4. **Meaning** – read the translation of the whole verse.
5. **Tafsir** – read the classical explanation with its source.
6. **Fading cues** – recite with only the first letter of each word, then without any help.
7. **Reflect** – write one or two sentences about what the verse means for you.

Each verse then comes back for review after 1, 3, 7, 14, 30 and 90 days. The full [hifz guide](/guides/how-to-memorize-the-quran) explains how this fits with the traditional sabaq, sabqi and manzil.

## Step 7: Build a daily routine

Consistency matters far more than intensity. The Prophet ﷺ said that the deeds most beloved to Allah are those done regularly, even if they are small (Bukhari and Muslim). Fifteen to twenty-five minutes a day will take you further than a long session once a week.

A simple daily structure:

- **Review first** – the verses that are due today.
- **New verses** – one to three new verses for beginners.
- **Link the chain** – recite today's verses together with yesterday's.
- **Listen before sleep** – play today's verses once more in the evening.

See the full [daily Quran routine](/guides/daily-quran-routine) for timings and tips.

## Where should beginners start?

Most teachers recommend beginning with the short surahs at the end of the Quran. They are short, they are recited often in prayer, and they give you quick, motivating progress.

A common order:

1. [Al-Fatiha](/surah/1)
2. [Al-Ikhlas](/surah/112), [Al-Falaq](/surah/113) and [An-Nas](/surah/114)
3. The rest of Juz Amma, working backwards from An-Nas – see our [Juz Amma learning plan](/guides/juz-amma-learning-plan)

You can browse [all surahs](/quran) at any time and pick what speaks to you.

## Common mistakes – and how to avoid them

- **Starting too big.** Ten new verses on the first day feels great, but the review load grows quickly. Start small and stay with it.
- **Only reading, never recalling.** Re-reading feels productive, but reciting from memory is what makes verses stay.
- **Skipping the meaning.** A verse you understand is easier to remember – and more meaningful in prayer.
- **Learning alone forever.** An app is a great companion, but a qualified teacher who listens to your recitation is invaluable, especially for tajweed.

## Getting help from a teacher

No app replaces a qualified teacher. Use Quran Masterclass for daily practice, listening and understanding, and – where possible – recite to a teacher at a mosque or online who can correct your pronunciation. For questions about religious rulings, always ask a qualified scholar.

## Your first step today

Open [Al-Fatiha](/surah/1), listen to the first verse three times and then start the [Shams Method](/shams). It takes about four minutes per verse – and it is completely free.`,
    body_de: `Den Koran zu lernen gehört zu den schönsten Vorhaben, die man sich als Muslim vornehmen kann – und es steht jedem offen, egal wie alt man ist oder wie viel Arabisch man schon kann. Der Prophet Muhammad ﷺ sagte: „Die Besten unter euch sind diejenigen, die den Koran lernen und ihn lehren" (Bukhari). Dieser Leitfaden zeigt dir, wo du anfängst, worauf du dich zuerst konzentrierst und wie du eine Routine aufbaust, die du wirklich durchhältst.

## Was heißt eigentlich „Koran lernen"?

Wer sagt, er möchte den Koran lernen, meint oft ganz Unterschiedliches. Es hilft, die Bereiche auseinanderzuhalten, denn jeder braucht einen etwas anderen Zugang:

- **Zuhören (Sama')** – Klang, Rhythmus und Melodie der Verse kennenlernen.
- **Lesen (Tilawa)** – den arabischen Text richtig lesen, erst mit Hilfe, später selbstständig.
- **Rezitation mit Tajwid** – jeden Buchstaben richtig aussprechen und die Vortragsregeln anwenden.
- **Verstehen (Fahm)** – wissen, was die Verse bedeuten, Wort für Wort und im Ganzen.
- **Tafsir** – erfahren, wie die klassischen Gelehrten die Verse erklärt haben.
- **Auswendiglernen (Hifz)** – Verse im Herzen tragen, um sie im Gebet und darüber hinaus zu rezitieren.

Du musst keinen Bereich perfekt beherrschen, bevor du den nächsten anfängst. Im Gegenteil: Sie stützen sich gegenseitig. Einen Vers, den du verstehst, behältst du leichter – und einen Vers, den du oft gehört hast, liest du leichter.

## Schritt 1: Absicht und Ziel klären

Bevor du die erste Seite aufschlägst, nimm dir einen Moment für deine Absicht (Niyya). Du lernst die Worte Allahs – nicht, um andere zu beeindrucken, sondern um Ihm näherzukommen und danach zu leben.

Dann setz dir ein konkretes, bescheidenes Ziel, zum Beispiel:

1. Al-Fatiha innerhalb eines Monats verstehen und richtig rezitieren.
2. Dieses Jahr die letzten zehn Suren auswendig lernen.
3. Jeden Tag eine Seite mit Bedeutung und kurzem Tafsir lesen.

Ein klares Ziel macht es leichter, jeden Tag zu wissen, was dran ist.

## Schritt 2: Mit dem Zuhören beginnen

Kinder lernen ihre Muttersprache, indem sie lange zuhören, bevor sie selbst sprechen. Dasselbe Prinzip funktioniert beim Koran. Bevor du einen Vers liest oder rezitierst, hör ihn dir mehrmals an und folge dabei dem arabischen Text mit den Augen.

Bei Quran Masterclass kannst du jeden Vers einzeln abspielen, zwischen mehreren bekannten Rezitatoren wählen und siehst jedes Wort hervorgehoben, während es vorgetragen wird. Fang mit [Al-Fatiha](/surah/1) an: sieben Verse, die jeder Muslim in jeder Gebetseinheit spricht.

## Schritt 3: Die arabische Schrift lesen lernen

Wenn du noch kein Arabisch lesen kannst, ist das kein Hindernis. Das arabische Alphabet hat 28 Buchstaben, und mit täglicher Übung können die meisten Erwachsenen nach einigen Wochen einfache Wörter lesen. Die Umschrift (Transliteration) ist am Anfang eine gute Brücke – das Ziel sollte aber sein, Schritt für Schritt ohne sie auszukommen.

Unser Ratgeber [Koran lesen lernen](/guides/learn-to-read-the-quran) erklärt Buchstaben, Vokalzeichen und einen realistischen Weg von der Umschrift zur arabischen Schrift.

## Schritt 4: Verstehen, was du rezitierst

Der Koran lädt zum Nachdenken ein: „Denken sie denn nicht über den Koran nach?" (4:82). Verstehen beginnt bei den einzelnen Wörtern. Quran Masterclass zeigt unter jedem Vers eine Wort-für-Wort-Übersetzung, damit du siehst, welches arabische Wort welche Bedeutung trägt.

Danach liest du die Übersetzung des ganzen Verses. Mit der Zeit merkst du, dass viele Wörter immer wiederkehren. Wer diese [Grundwörter und ihre Wurzeln](/guides/learn-quranic-arabic-vocabulary) kennt, dem fällt jede neue Sure leichter.

## Schritt 5: Den Tafsir lesen

Eine Übersetzung sagt dir, was ein Vers sagt. Der Tafsir erklärt, wie ihn der Prophet ﷺ, seine Gefährten und die großen Gelehrten nach ihnen verstanden haben – mit Hintergrund, Offenbarungsanlass und Bezügen zu anderen Versen.

In der App erscheint der Tafsir zu jedem Vers direkt neben dem Audio, immer mit Angabe der Quelle, etwa Ibn Kathir. Mehr dazu in unserem Ratgeber [Den Koran mit Tafsir verstehen](/guides/understanding-the-quran-tafsir).

## Schritt 6: Mit Methode auswendig lernen

Beim Auswendiglernen geben viele Anfänger auf. Meist liegt es daran, dass man einen Vers oft wiederholt, sich sicher fühlt – und eine Woche später ist er weg. Das Gedächtnis braucht zwei Dinge: **aktives Abrufen** und **gut getaktete Wiederholung**.

Genau dafür gibt es die [Shams-Methode](/shams). Nami Shams hat sie als festen Weg aus sieben kurzen Schritten pro Vers entwickelt:

1. **Zuhören** – den Vers dreimal hören, die Augen auf dem Text.
2. **Rückwärts aufbauen** – mit dem letzten Wort beginnen, dann die letzten zwei und so weiter bis zum ganzen Vers.
3. **Wort für Wort** – jedes Wort und seine Bedeutung anschauen.
4. **Bedeutung** – die Übersetzung des ganzen Verses lesen.
5. **Tafsir** – die klassische Erklärung mit Quellenangabe lesen.
6. **Ausblenden** – nur mit dem ersten Buchstaben jedes Wortes rezitieren, dann ganz ohne Hilfe.
7. **Nachdenken** – ein, zwei Sätze notieren, was der Vers dir persönlich sagt.

Anschließend kommt jeder Vers nach 1, 3, 7, 14, 30 und 90 Tagen zur Wiederholung. Wie das mit dem klassischen Sabaq, Sabqi und Manzil zusammenpasst, erklärt der [Hifz-Ratgeber](/guides/how-to-memorize-the-quran).

## Schritt 7: Eine tägliche Routine aufbauen

Beständigkeit ist viel wichtiger als Intensität. Der Prophet ﷺ sagte, dass Allah die Taten am meisten liebt, die regelmäßig verrichtet werden, auch wenn sie klein sind (Bukhari und Muslim). Fünfzehn bis fünfundzwanzig Minuten am Tag bringen dich weiter als eine lange Einheit einmal pro Woche.

So kann dein Tag aussehen:

- **Zuerst wiederholen** – die Verse, die heute fällig sind.
- **Neue Verse** – für Anfänger ein bis drei.
- **Kette bilden** – die heutigen Verse zusammen mit denen von gestern rezitieren.
- **Vor dem Schlafen hören** – die Verse des Tages abends noch einmal abspielen.

Details und Zeitangaben findest du in der [täglichen Koran-Routine](/guides/daily-quran-routine).

## Womit sollten Anfänger beginnen?

Die meisten Lehrer empfehlen, mit den kurzen Suren am Ende des Korans zu starten. Sie sind kurz, werden oft im Gebet rezitiert und sorgen schnell für motivierende Fortschritte.

Eine bewährte Reihenfolge:

1. [Al-Fatiha](/surah/1)
2. [Al-Ikhlas](/surah/112), [Al-Falaq](/surah/113) und [An-Nas](/surah/114)
3. Der Rest von Juz Amma, rückwärts ab An-Nas – siehe unseren [Lernplan für Juz Amma](/guides/juz-amma-learning-plan)

Unter [alle Suren](/quran) kannst du jederzeit stöbern und auswählen, was dich anspricht.

## Typische Fehler – und wie du sie vermeidest

- **Zu groß anfangen.** Zehn neue Verse am ersten Tag fühlen sich toll an, aber die Wiederholungen wachsen schnell. Lieber klein anfangen und dranbleiben.
- **Nur lesen, nie abrufen.** Wiederholtes Lesen fühlt sich produktiv an – doch erst das Rezitieren aus dem Gedächtnis lässt Verse haften.
- **Die Bedeutung überspringen.** Was du verstehst, behältst du besser, und im Gebet bekommt es mehr Tiefe.
- **Für immer allein lernen.** Eine App ist ein guter Begleiter, aber ein qualifizierter Lehrer, der deine Rezitation hört, ist unersetzlich – besonders beim Tajwid.

## Unterstützung durch einen Lehrer

Keine App ersetzt einen qualifizierten Lehrer. Nutze Quran Masterclass für das tägliche Üben, Zuhören und Verstehen und rezitiere, wenn möglich, regelmäßig einem Lehrer in der Moschee oder online, der deine Aussprache korrigiert. Bei Fragen zu religiösen Urteilen wende dich bitte immer an einen qualifizierten Gelehrten.

## Dein erster Schritt – heute

Öffne [Al-Fatiha](/surah/1), hör dir den ersten Vers dreimal an und starte dann die [Shams-Methode](/shams). Das dauert etwa vier Minuten pro Vers – und ist komplett kostenlos.`,
    faq: [
      {
        q_en: "Can I learn the Quran without knowing Arabic?",
        a_en: "Yes. You can start with listening, transliteration and word-by-word meaning. Learning the Arabic letters alongside makes progress easier, and most adults can read simple words after a few weeks of daily practice.",
        q_de: "Kann ich den Koran ohne Arabischkenntnisse lernen?",
        a_de: "Ja. Du kannst mit Zuhören, Umschrift und Wort-für-Wort-Bedeutung beginnen. Wenn du parallel die arabischen Buchstaben lernst, geht es leichter – die meisten Erwachsenen lesen nach einigen Wochen täglicher Übung einfache Wörter.",
      },
      {
        q_en: "How much time should I spend each day?",
        a_en: "Fifteen to twenty-five focused minutes a day are enough for steady progress. Regular short sessions work better than long, occasional ones.",
        q_de: "Wie viel Zeit sollte ich täglich investieren?",
        a_de: "Fünfzehn bis fünfundzwanzig konzentrierte Minuten am Tag reichen für stetige Fortschritte. Regelmäßige kurze Einheiten wirken besser als lange, seltene.",
      },
      {
        q_en: "Which surah should I learn first?",
        a_en: "Most teachers start with Al-Fatiha, followed by the short surahs at the end of the Quran such as Al-Ikhlas, Al-Falaq and An-Nas.",
        q_de: "Welche Sure sollte ich zuerst lernen?",
        a_de: "Die meisten Lehrer beginnen mit Al-Fatiha und danach mit den kurzen Suren am Ende des Korans, etwa Al-Ikhlas, Al-Falaq und An-Nas.",
      },
      {
        q_en: "Is Quran Masterclass free?",
        a_en: "Yes. Listening, word-by-word meaning, tafsir with sources, the Shams Method and spaced-repetition review are free. A free account keeps your progress across devices.",
        q_de: "Ist Quran Masterclass kostenlos?",
        a_de: "Ja. Zuhören, Wort-für-Wort-Bedeutung, Tafsir mit Quellen, die Shams-Methode und die Wiederholung nach Plan sind kostenlos. Mit einem kostenlosen Konto bleibt dein Fortschritt auf allen Geräten erhalten.",
      },
    ],
    related: ["shams-method", "daily-quran-routine", "how-to-memorize-the-quran"],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "how-to-memorize-the-quran",
    date: "2026-10-06",
    title_en: "How to Memorize the Quran: A Practical Hifz Guide",
    title_de: "Koran auswendig lernen: Praktischer Hifz-Leitfaden",
    desc_en: "Memorise the Quran with sabaq, sabqi and manzil, spaced repetition and the Shams Method. Realistic daily amounts, review plans and tips that last.",
    desc_de: "Koran auswendig lernen mit Sabaq, Sabqi und Manzil, Wiederholung nach Plan und der Shams-Methode. Realistische Tagesmengen und Tipps, die tragen.",
    keywords_en: "how to memorize the Quran, hifz, Quran memorization, sabaq sabqi manzil, spaced repetition Quran",
    keywords_de: "Koran auswendig lernen, Hifz, Koran memorieren, Sabaq Sabqi Manzil, Koran wiederholen",
    body_en: `Memorising the Quran (hifz) is an honour and a lifelong companion. Allah says: "And We have certainly made the Quran easy for remembrance, so is there any who will remember?" (54:17). Whether you want to learn a few short surahs for prayer or aim for the whole Quran, the same principles apply. This guide combines the traditional hifz system with what we know about memory today.

## Start with the right expectations

Hifz is not a sprint. People who succeed are rarely the ones who learn the most on day one – they are the ones who are still learning a year later. Three points are worth keeping in mind:

- **Small daily portions win.** A few verses every day add up to whole surahs surprisingly fast.
- **Review is the real work.** Learning a verse takes minutes; keeping it takes regular revision.
- **Quality before quantity.** A verse memorised with correct pronunciation is worth more than a page memorised with mistakes.

## The traditional system: sabaq, sabqi and manzil

For centuries, hifz teachers have organised daily work in three parts. The names vary between regions, but the idea is the same.

### Sabaq – the new lesson

The sabaq is today's new portion. The student prepares it, repeats it until it is fluent and then recites it to the teacher.

### Sabqi – the recent lessons

The sabqi covers what was learned in the last days or weeks. It is recited daily so the new verses settle and connect into a continuous passage.

### Manzil – the older portions

The manzil is everything memorised earlier. It is revised in a rotation – for example one part a day – so that nothing is forgotten over time.

This structure works because it never lets learning get ahead of reviewing. Every day, old and new are practised together.

## What memory research adds

Modern learning research supports the traditional approach and adds some useful details:

- **Retrieval practice:** Recalling a verse from memory strengthens it much more than reading it again.
- **Spacing:** Reviews spread over growing intervals work better than many repetitions in one sitting.
- **Chunking:** Small units – a few words, then a verse – are easier to hold than a long passage at once.
- **Sleep:** What you go over shortly before sleep tends to be consolidated overnight.

In Quran Masterclass, every verse you learn enters a review schedule. It comes back after **1, 3, 7, 14, 30 and 90 days**. If you know it, the gap grows. If you struggle, it starts again from the beginning. Your [Today page](/today) shows exactly which verses are due.

## Learning a new verse: the Shams Method

How you learn a verse in the first place matters as much as how you review it. The [Shams Method](/shams), developed by Nami Shams, takes every verse through seven short steps – about four minutes per verse:

1. **Listen** three times while following the text. No translating yet.
2. **Build up backwards.** Hear and repeat the last word, then the last two, then the last three – until the whole verse. Each repetition ends on familiar ground, which keeps the melody natural.
3. **Word by word.** Look at each word and its meaning.
4. **Meaning.** Read the translation of the whole verse.
5. **Tafsir.** Read the classical explanation, shown with its source.
6. **Fading cues.** Recite with only the first letter of each word visible, then with nothing. Reveal the verse and rate yourself honestly.
7. **Reflect.** Write one or two sentences in your note.

The backward build-up is possible because the app knows the exact moment each word is recited. You can read more about why each step works in our [in-depth article on the Shams Method](/guides/shams-method).

## How many verses per day?

The right amount is the one you can keep up every day. A helpful guideline:

- **Beginners:** 1–3 new verses a day
- **With some practice:** 3–5 new verses
- **Intensive:** 5–10 new verses plus a longer review

Remember that reviews grow with every verse you learn. If your review time starts to crowd out new learning, pause new verses for a few days and consolidate. That is not failure – it is how hifz works.

## A sample daily session

Here is how sabaq, sabqi and manzil fit into a 20–25 minute session with the app:

1. **Manzil and due reviews (5–8 min):** Recite the verses that are due today from memory, then check yourself.
2. **Sabaq (8–12 min):** Take one to three new verses through the seven steps of the Shams Method.
3. **Sabqi (3–5 min):** Recite today's verses together with yesterday's, without looking. This links them into a chain.
4. **Evening (2 min):** Listen to today's verses once more before sleep.

For a full routine with variations, see the [daily Quran routine](/guides/daily-quran-routine).

## Which surahs to memorise first

Most students begin with [Al-Fatiha](/surah/1) and then work through Juz Amma, starting with the shortest surahs at the end: [An-Nas](/surah/114), [Al-Falaq](/surah/113), [Al-Ikhlas](/surah/112) and onwards. Our [Juz Amma learning plan](/guides/juz-amma-learning-plan) breaks the 564 verses of the 30th part into manageable phases.

Other popular choices are [Al-Mulk](/surah/67) and the last verses of [Al-Baqarah](/surah/2), which many Muslims recite regularly.

## Tips that make a difference

- **Use one reciter.** Hearing the same voice every time helps the melody stick. You can choose your reciter in the player.
- **Use one mushaf layout.** If you also learn from a printed copy, stick to the same edition so your visual memory of the page stays stable.
- **Recite in prayer.** Using newly memorised verses in your sunnah and nafl prayers is one of the best reviews there is.
- **Listen in between.** Play your current surah on the way to work or while cooking. The [Quran radio](/radio) is useful for background listening, too.
- **Mark weak spots.** Bookmark the verses you mix up and give them extra attention.
- **Be honest when rating yourself.** A review only helps if it reflects what you really know.

## Find a teacher

Memorising alone is possible, but reciting to a qualified teacher is strongly recommended. A teacher catches mistakes in pronunciation and tajweed that you cannot hear yourself and keeps you accountable. Use the app for daily practice and the teacher for correction. If you have questions about religious rulings related to recitation or prayer, please ask a qualified scholar.

## Keep your intention fresh

Some days will feel slow. On those days, remember why you started. Every verse you carry in your heart is a gift – and even a single verse reviewed today counts.`,
    body_de: `Den Koran auswendig zu lernen (Hifz) ist eine Ehre und ein Begleiter fürs ganze Leben. Allah sagt: „Und Wir haben den Koran ja zum Gedenken leicht gemacht. Gibt es denn jemanden, der bedenkt?“ (54:17). Ob du ein paar kurze Suren für das Gebet lernen möchtest oder den ganzen Koran anstrebst – es gelten dieselben Grundsätze. Dieser Leitfaden verbindet das traditionelle Hifz-System mit dem, was wir heute über das Gedächtnis wissen.

## Mit den richtigen Erwartungen starten

Hifz ist kein Sprint. Erfolgreich sind selten diejenigen, die am ersten Tag am meisten lernen, sondern diejenigen, die ein Jahr später immer noch dabei sind. Drei Punkte helfen dabei:

- **Kleine tägliche Portionen gewinnen.** Ein paar Verse am Tag werden erstaunlich schnell zu ganzen Suren.
- **Wiederholen ist die eigentliche Arbeit.** Einen Vers zu lernen dauert Minuten – ihn zu behalten braucht regelmäßige Wiederholung.
- **Qualität vor Menge.** Ein Vers mit richtiger Aussprache ist mehr wert als eine Seite voller Fehler.

## Das klassische System: Sabaq, Sabqi und Manzil

Seit Jahrhunderten gliedern Hifz-Lehrer die tägliche Arbeit in drei Teile. Die Bezeichnungen unterscheiden sich je nach Region, die Idee ist dieselbe.

### Sabaq – die neue Lektion

Der Sabaq ist die neue Portion des Tages. Der Schüler bereitet ihn vor, wiederholt ihn, bis er flüssig sitzt, und trägt ihn dann dem Lehrer vor.

### Sabqi – die letzten Lektionen

Der Sabqi umfasst, was in den letzten Tagen oder Wochen gelernt wurde. Er wird täglich rezitiert, damit sich die neuen Verse festigen und zu einem zusammenhängenden Abschnitt verbinden.

### Manzil – die älteren Abschnitte

Der Manzil ist alles, was früher auswendig gelernt wurde. Er wird reihum wiederholt, zum Beispiel ein Teil pro Tag, damit mit der Zeit nichts verloren geht.

Das System funktioniert, weil das Neue nie dem Wiederholen davonläuft. Jeden Tag werden Altes und Neues zusammen geübt.

## Was die Gedächtnisforschung ergänzt

Die moderne Lernforschung bestätigt den klassischen Ansatz und liefert ein paar hilfreiche Details:

- **Abrufen statt Nachlesen:** Einen Vers aus dem Gedächtnis aufzusagen festigt ihn viel stärker als erneutes Lesen.
- **Verteiltes Wiederholen:** Wiederholungen in wachsenden Abständen wirken besser als viele Durchgänge am Stück.
- **Kleine Einheiten (Chunking):** Ein paar Wörter, dann ein Vers – das behält man leichter als einen langen Abschnitt auf einmal.
- **Schlaf:** Was man kurz vor dem Schlafen noch einmal durchgeht, wird oft über Nacht gefestigt.

Bei Quran Masterclass kommt jeder gelernte Vers in einen Wiederholungsplan. Er erscheint nach **1, 3, 7, 14, 30 und 90 Tagen** wieder. Sitzt er, wird der Abstand größer. Hakt es, beginnt er von vorn. Auf deiner [Heute-Seite](/today) siehst du genau, welche Verse fällig sind.

## Einen neuen Vers lernen: die Shams-Methode

Wie du einen Vers zum ersten Mal lernst, ist genauso wichtig wie das spätere Wiederholen. Die [Shams-Methode](/shams), entwickelt von Nami Shams, führt jeden Vers durch sieben kurze Schritte – etwa vier Minuten pro Vers:

1. **Zuhören** – dreimal, die Augen auf dem Text. Noch nicht übersetzen.
2. **Rückwärts aufbauen** – das letzte Wort hören und nachsprechen, dann die letzten zwei, dann drei, bis zum ganzen Vers. Jede Wiederholung endet auf vertrautem Boden, so bleibt die Melodie natürlich.
3. **Wort für Wort** – jedes Wort mit seiner Bedeutung anschauen.
4. **Bedeutung** – die Übersetzung des ganzen Verses lesen.
5. **Tafsir** – die klassische Erklärung mit Quellenangabe lesen.
6. **Ausblenden** – nur mit dem ersten Buchstaben jedes Wortes rezitieren, dann ganz ohne. Den Vers aufdecken und dich ehrlich bewerten.
7. **Nachdenken** – ein, zwei Sätze in deine Notiz schreiben.

Der Rückwärtsaufbau ist möglich, weil die App den genauen Zeitpunkt jedes Wortes in der Rezitation kennt. Warum jeder Schritt wirkt, erklärt unser [ausführlicher Artikel zur Shams-Methode](/guides/shams-method).

## Wie viele Verse pro Tag?

Die richtige Menge ist die, die du jeden Tag durchhältst. Als Orientierung:

- **Anfänger:** 1–3 neue Verse am Tag
- **Mit etwas Übung:** 3–5 neue Verse
- **Intensiv:** 5–10 neue Verse plus längere Wiederholung

Denk daran: Mit jedem gelernten Vers wächst die Wiederholung. Wenn sie anfängt, das Neue zu verdrängen, setz ein paar Tage mit neuen Versen aus und festige das Gelernte. Das ist kein Scheitern – so funktioniert Hifz.

## So kann eine Lerneinheit aussehen

So passen Sabaq, Sabqi und Manzil in 20 bis 25 Minuten mit der App:

1. **Manzil und fällige Verse (5–8 Min.):** Die heute fälligen Verse aus dem Gedächtnis rezitieren und dich dann prüfen.
2. **Sabaq (8–12 Min.):** Ein bis drei neue Verse mit den sieben Schritten der Shams-Methode lernen.
3. **Sabqi (3–5 Min.):** Die heutigen Verse zusammen mit denen von gestern ohne Hinsehen rezitieren – so entsteht eine Kette.
4. **Abends (2 Min.):** Die Verse des Tages vor dem Schlafen noch einmal hören.

Eine vollständige Routine mit Varianten findest du in der [täglichen Koran-Routine](/guides/daily-quran-routine).

## Welche Suren zuerst?

Die meisten beginnen mit [Al-Fatiha](/surah/1) und arbeiten sich dann durch Juz Amma, angefangen bei den kürzesten Suren am Ende: [An-Nas](/surah/114), [Al-Falaq](/surah/113), [Al-Ikhlas](/surah/112) und weiter. Unser [Lernplan für Juz Amma](/guides/juz-amma-learning-plan) teilt die 564 Verse des 30. Teils in überschaubare Etappen.

Ebenfalls beliebt sind [Al-Mulk](/surah/67) und die letzten Verse von [Al-Baqara](/surah/2), die viele Muslime regelmäßig rezitieren.

## Tipps, die einen Unterschied machen

- **Bleib bei einem Rezitator.** Dieselbe Stimme hilft, dass sich die Melodie einprägt. Den Rezitator wählst du im Player.
- **Bleib bei einer Mushaf-Ausgabe.** Wenn du zusätzlich aus einem gedruckten Koran lernst, nimm immer dieselbe Ausgabe, damit dein Seitenbild stabil bleibt.
- **Rezitiere im Gebet.** Neu gelernte Verse in Sunna- und freiwilligen Gebeten zu sprechen, ist eine der besten Wiederholungen überhaupt.
- **Hör zwischendurch.** Spiel deine aktuelle Sure auf dem Weg zur Arbeit oder beim Kochen ab. Auch das [Koran-Radio](/radio) eignet sich zum Nebenbei-Hören.
- **Markiere Schwachstellen.** Setz Lesezeichen bei Versen, die du verwechselst, und gib ihnen extra Aufmerksamkeit.
- **Bewerte dich ehrlich.** Eine Wiederholung hilft nur, wenn sie zeigt, was du wirklich kannst.

## Such dir einen Lehrer

Allein auswendig zu lernen ist möglich, doch es wird dringend empfohlen, einem qualifizierten Lehrer vorzutragen. Ein Lehrer hört Fehler in Aussprache und Tajwid, die du selbst nicht bemerkst, und hält dich bei der Stange. Nutze die App zum täglichen Üben und den Lehrer zur Korrektur. Bei Fragen zu religiösen Urteilen rund um Rezitation und Gebet wende dich bitte an einen qualifizierten Gelehrten.

## Halte deine Absicht lebendig

Manche Tage fühlen sich zäh an. Dann erinnere dich, warum du angefangen hast. Jeder Vers, den du im Herzen trägst, ist ein Geschenk – und auch ein einziger heute wiederholter Vers zählt.`,
    faq: [
      {
        q_en: "What do sabaq, sabqi and manzil mean?",
        a_en: "Sabaq is the new lesson of the day, sabqi the recently learned portions that are recited daily, and manzil the older memorised parts that are revised in rotation.",
        q_de: "Was bedeuten Sabaq, Sabqi und Manzil?",
        a_de: "Sabaq ist die neue Lektion des Tages, Sabqi sind die kürzlich gelernten Abschnitte, die täglich rezitiert werden, und Manzil sind die älteren Teile, die reihum wiederholt werden.",
      },
      {
        q_en: "How long does it take to memorise the whole Quran?",
        a_en: "It depends on your daily amount and consistency. The Quran has 6,236 verses, so the pace you can sustain matters more than speed. Many students take several years, and that is perfectly fine.",
        q_de: "Wie lange dauert es, den ganzen Koran auswendig zu lernen?",
        a_de: "Das hängt von deiner Tagesmenge und Beständigkeit ab. Der Koran hat 6.236 Verse – entscheidend ist ein Tempo, das du halten kannst. Viele brauchen mehrere Jahre, und das ist völlig in Ordnung.",
      },
      {
        q_en: "Why does the app review verses after 1, 3, 7, 14, 30 and 90 days?",
        a_en: "Growing gaps bring a verse back around the time it would start to fade. Each successful recall makes the memory more durable, so the next review can come later.",
        q_de: "Warum wiederholt die App Verse nach 1, 3, 7, 14, 30 und 90 Tagen?",
        a_de: "Wachsende Abstände holen einen Vers ungefähr dann zurück, wenn er zu verblassen beginnt. Jedes erfolgreiche Abrufen macht die Erinnerung stabiler, sodass die nächste Wiederholung später kommen kann.",
      },
      {
        q_en: "Do I still need a teacher if I use an app?",
        a_en: "A qualified teacher is strongly recommended, especially to correct pronunciation and tajweed. The app is ideal for daily practice and review in between.",
        q_de: "Brauche ich mit einer App noch einen Lehrer?",
        a_de: "Ein qualifizierter Lehrer wird dringend empfohlen, vor allem zur Korrektur von Aussprache und Tajwid. Die App eignet sich ideal zum täglichen Üben und Wiederholen dazwischen.",
      },
    ],
    related: ["shams-method", "juz-amma-learning-plan", "daily-quran-routine"],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "shams-method",
    date: "2026-10-06",
    title_en: "The Shams Method: How It Works and Why",
    title_de: "Die Shams-Methode: So funktioniert sie und warum",
    desc_en: "The Shams Method by Nami Shams: seven steps per verse built on learning science – listening first, backchaining, chunking, retrieval, spacing and reflection.",
    desc_de: "Die Shams-Methode von Nami Shams: sieben Schritte pro Vers auf Basis der Lernforschung – erst hören, rückwärts aufbauen, abrufen, wiederholen, nachdenken.",
    keywords_en: "Shams Method, Nami Shams, Quran memorization method, backchaining Quran, spaced repetition, retrieval practice",
    keywords_de: "Shams-Methode, Nami Shams, Koran auswendig lernen Methode, Rückwärtsaufbau, Wiederholung, Abrufübung",
    body_en: `The Shams Method is a way of learning the Quran verse by verse, developed by Nami Shams in Dubai. It brings together the hifz tradition and well-established findings from language learning and memory research into one fixed path: seven short steps per verse, about four minutes each, followed by spaced review.

This article explains every step and the learning principle behind it. If you just want to try it, open [the Shams Method in the app](/shams) and start with [Al-Fatiha](/surah/1).

## What the Shams Method is – and what it is not

The Shams Method is a **learning method**, not a new interpretation of the Quran. All explanations shown in the app come from classical tafsir works and are always displayed with their source. For religious questions, please ask a qualified scholar.

None of its building blocks are new on their own. Listening before reciting, repetition and revision are as old as Quran teaching itself. What is new is how they are **combined and timed**, and that the app can guide you through them for every verse of the Quran.

## The seven steps at a glance

1. **Listen** – three times, eyes on the Arabic text.
2. **Build up backwards** – from the last word to the whole verse.
3. **Word by word** – each word with its meaning.
4. **Meaning** – the translation of the whole verse.
5. **Tafsir** – the classical explanation with its source.
6. **Fading cues** – first letters only, then nothing.
7. **Reflect** – one or two sentences in your own words.

## Step 1: Listen – input before output

### What you do

Play the verse three times while following the Arabic text. Do not translate yet. Let the sound, rhythm and melody settle.

### Why it works

Children learn their first language by hearing it for a long time before speaking. Language teachers call this "input before output". When you try to recite a verse you have never properly heard, you have nothing to compare your own voice with. Repeated listening builds a clear sound image first – and that image guides your recitation later.

## Step 2: Build up backwards – backchaining

### What you do

The app plays only the last word of the verse; you repeat it. Then the last two words, then the last three – until you are reciting the whole verse. Every round ends on the part you already know.

### Why it works

Teachers of long sentences in foreign languages often use **backward build-up**, also called backchaining. Starting from the end means every repetition finishes on familiar ground. That keeps the melody natural, prevents the common problem of a strong beginning and a shaky ending, and lets the verse hold together as one unit.

This step is only possible because Quran Masterclass knows the exact moment each word is recited. It can start playback at any word and stop at the end of the verse – something a plain audio file cannot do.

## Step 3: Word by word – chunking

### What you do

Go through the verse word by word and look at each meaning.

### Why it works

Working memory holds only a small number of items at once. Grouping information into meaningful **chunks** makes it manageable. A word with a known meaning is one chunk; a verse built from known words is far easier to hold than a string of unfamiliar sounds. Over time, recurring words become familiar – see our guide on [Quranic vocabulary and roots](/guides/learn-quranic-arabic-vocabulary).

## Step 4: Meaning – dual coding

### What you do

Read the translation of the whole verse and notice how the words you just met come together into one message.

### Why it works

Dual coding theory describes how information stored in more than one form – for example sound and meaning, or text and image – is easier to recall. In the Shams Method, the Arabic script, the recitation, the transliteration and the meaning are all linked. Several paths into memory make it more likely that one of them will bring the verse back when you need it.

## Step 5: Tafsir – depth and context

### What you do

Read the classical explanation of the verse: its context, the reason of revelation where known, and what scholars teach about it. The source is shown below the text.

### Why it works

We remember what we understand and find meaningful far better than isolated facts. Tafsir connects the verse to a story, a situation and a lesson. It also protects you from reading your own assumptions into a verse. Learn more in [Understanding the Quran with tafsir](/guides/understanding-the-quran-tafsir).

## Step 6: Fading cues – retrieval practice

### What you do

First you see only the first letter of each word and recite the verse with these cues. Then the cues disappear as well. Reveal the verse and rate yourself honestly.

### Why it works

Two well-known principles meet here. **Retrieval practice** – actively recalling something from memory – strengthens it much more than reading it again. **Fading cues** (sometimes called vanishing cues) give just enough help to recall a word yourself and then take that help away step by step. The first letter is a small nudge, not the answer, so your memory still has to do the work.

Your honest rating decides when the verse returns. That brings us to spacing.

## Spaced repetition

After step six, every verse enters a review schedule: **1, 3, 7, 14, 30 and 90 days**. If you recall it, the gap grows. If you struggle, it starts again from the first stage.

The spacing effect has been studied since the nineteenth century and is one of the most reliable findings in memory research: reviews spread over growing intervals lead to longer-lasting memory than the same number of repetitions crammed together. Your [Today page](/today) shows which verses are due.

## Step 7: Reflect – tadabbur

### What you do

Write one or two sentences in your note. Three questions help:

- What does this verse tell me about Allah?
- What does it say about me and my life?
- What will I take with me today?

### Why it works

Allah describes the Quran as "a blessed Book which We have revealed to you, that they might reflect upon its verses" (38:29). Reflection (tadabbur) is part of the purpose of recitation itself. It also helps memory: content that is connected to your own life and feelings is remembered longest.

## The daily routine

The seven steps are embedded in a simple day:

1. **Review first (about 5 min)** – the verses due today.
2. **New verses (about 4 min per verse)** – for most people three.
3. **Link the chain (about 3 min)** – today's verses together with yesterday's, without looking, like the sabaq and sabqi of classical hifz.
4. **Listen before sleep (about 2 min)** – what you go over before sleep tends to be consolidated overnight.

How much is right? Beginners: 1–3 new verses a day. With practice: 3–5. Intensive: 5–10 plus longer review. The amount you can keep up daily is the right one. See the full [daily Quran routine](/guides/daily-quran-routine).

## Who is the Shams Method for?

- **Beginners** who cannot read Arabic yet – transliteration and word meanings help from the first verse.
- **Learners who forget** what they memorised – the review schedule addresses exactly that.
- **Parents and children** – combined with kids mode, short surahs become playful.
- **Hifz students** – as a structured way to prepare the daily sabaq before reciting to a teacher.

## Try it now

Start with [Al-Fatiha](/surah/1), or [choose any surah](/quran). The method guides you through each step on screen, and it is completely free.`,
    body_de: `Die Shams-Methode ist ein Weg, den Koran Vers für Vers zu lernen, entwickelt von Nami Shams in Dubai. Sie verbindet die Hifz-Tradition mit gut belegten Erkenntnissen aus Sprachlern- und Gedächtnisforschung zu einem festen Ablauf: sieben kurze Schritte pro Vers, jeweils etwa vier Minuten, gefolgt von Wiederholungen nach Plan.

Dieser Artikel erklärt jeden Schritt und das Lernprinzip dahinter. Wenn du es direkt ausprobieren möchtest, öffne [die Shams-Methode in der App](/shams) und beginne mit [Al-Fatiha](/surah/1).

## Was die Shams-Methode ist – und was nicht

Die Shams-Methode ist eine **Lernmethode**, keine neue Auslegung des Korans. Alle Erklärungen in der App stammen aus klassischen Tafsir-Werken und werden immer mit Quelle angezeigt. Bei religiösen Fragen wende dich bitte an einen qualifizierten Gelehrten.

Keiner ihrer Bausteine ist für sich genommen neu. Zuhören vor dem Rezitieren, Wiederholung und Festigung sind so alt wie der Koranunterricht selbst. Neu ist, wie sie **kombiniert und getaktet** werden – und dass die App dich bei jedem Vers des Korans hindurchführt.

## Die sieben Schritte im Überblick

1. **Zuhören** – dreimal, die Augen auf dem arabischen Text.
2. **Rückwärts aufbauen** – vom letzten Wort bis zum ganzen Vers.
3. **Wort für Wort** – jedes Wort mit seiner Bedeutung.
4. **Bedeutung** – die Übersetzung des ganzen Verses.
5. **Tafsir** – die klassische Erklärung mit Quelle.
6. **Ausblenden** – erst nur Anfangsbuchstaben, dann gar nichts.
7. **Nachdenken** – ein, zwei Sätze in eigenen Worten.

## Schritt 1: Zuhören – erst aufnehmen, dann sprechen

### Was du tust

Spiel den Vers dreimal ab und folge dabei dem arabischen Text. Noch nicht übersetzen. Lass Klang, Rhythmus und Melodie wirken.

### Warum es wirkt

Kinder hören ihre Muttersprache lange, bevor sie selbst sprechen. In der Sprachdidaktik heißt das „Input vor Output“. Wer einen Vers rezitieren will, den er nie richtig gehört hat, hat nichts, woran er die eigene Stimme messen kann. Wiederholtes Hören baut zuerst ein klares Klangbild auf – und dieses Klangbild leitet später deine Rezitation.

## Schritt 2: Rückwärts aufbauen – Backchaining

### Was du tust

Die App spielt nur das letzte Wort des Verses, du sprichst es nach. Dann die letzten zwei Wörter, dann die letzten drei – bis du den ganzen Vers sprichst. Jede Runde endet auf dem Teil, den du schon kennst.

### Warum es wirkt

Sprachlehrer nutzen bei langen Sätzen oft den **Rückwärtsaufbau**, auch Backchaining genannt. Wer am Ende beginnt, landet bei jeder Wiederholung auf vertrautem Boden. Die Melodie bleibt natürlich, das typische Problem „starker Anfang, wackliges Ende“ entsteht gar nicht erst, und der Vers hält als Einheit zusammen.

Möglich ist dieser Schritt nur, weil Quran Masterclass den genauen Zeitpunkt jedes Wortes in der Rezitation kennt. Die App kann ab jedem beliebigen Wort abspielen und am Versende stoppen – mit einer gewöhnlichen Audiodatei geht das nicht.

## Schritt 3: Wort für Wort – Chunking

### Was du tust

Geh den Vers Wort für Wort durch und schau dir jede Bedeutung an.

### Warum es wirkt

Das Arbeitsgedächtnis kann nur wenige Einheiten gleichzeitig halten. Wer Informationen zu sinnvollen **Paketen (Chunks)** bündelt, macht sie handhabbar. Ein Wort mit bekannter Bedeutung ist ein Paket. Ein Vers aus bekannten Wörtern ist viel leichter zu behalten als eine Kette fremder Laute. Mit der Zeit werden wiederkehrende Wörter vertraut – siehe unseren Ratgeber zu [Koran-Wortschatz und Wurzeln](/guides/learn-quranic-arabic-vocabulary).

## Schritt 4: Bedeutung – doppelte Kodierung

### Was du tust

Lies die Übersetzung des ganzen Verses und achte darauf, wie sich die gerade gelernten Wörter zu einer Botschaft fügen.

### Warum es wirkt

Die Theorie der doppelten Kodierung (Dual Coding) beschreibt, dass Informationen, die in mehr als einer Form gespeichert sind – etwa Klang und Bedeutung oder Text und Bild –, leichter abrufbar sind. Bei der Shams-Methode sind arabische Schrift, Rezitation, Umschrift und Bedeutung miteinander verknüpft. Mehrere Wege ins Gedächtnis erhöhen die Chance, dass einer davon den Vers zurückholt, wenn du ihn brauchst.

## Schritt 5: Tafsir – Tiefe und Zusammenhang

### Was du tust

Lies die klassische Erklärung zum Vers: Zusammenhang, Offenbarungsanlass, soweit bekannt, und was die Gelehrten dazu lehren. Die Quelle steht unter dem Text.

### Warum es wirkt

Was wir verstehen und als bedeutsam erleben, behalten wir viel besser als lose Fakten. Der Tafsir verbindet den Vers mit einer Begebenheit, einer Situation und einer Lehre. Außerdem schützt er davor, eigene Vermutungen in einen Vers hineinzulesen. Mehr dazu in [Den Koran mit Tafsir verstehen](/guides/understanding-the-quran-tafsir).

## Schritt 6: Ausblenden – Abrufübung

### Was du tust

Zuerst siehst du nur den ersten Buchstaben jedes Wortes und rezitierst den Vers mit diesen Hinweisen. Dann verschwinden auch sie. Deck den Vers auf und bewerte dich ehrlich.

### Warum es wirkt

Hier treffen zwei bekannte Prinzipien zusammen. **Abrufübung** – etwas aktiv aus dem Gedächtnis holen – festigt es weit stärker als erneutes Lesen. **Schrittweise ausgeblendete Hinweise** geben gerade genug Hilfe, um ein Wort selbst zu finden, und nehmen diese Hilfe dann Stück für Stück weg. Der erste Buchstabe ist ein kleiner Anstoß, nicht die Lösung – dein Gedächtnis muss die Arbeit noch selbst machen.

Deine ehrliche Bewertung entscheidet, wann der Vers zurückkommt. Damit sind wir beim verteilten Wiederholen.

## Wiederholen in wachsenden Abständen

Nach Schritt sechs kommt jeder Vers in einen Wiederholungsplan: **1, 3, 7, 14, 30 und 90 Tage**. Weißt du ihn, wird der Abstand größer. Hakt es, beginnt er wieder bei der ersten Stufe.

Der sogenannte Spacing-Effekt wird seit dem 19. Jahrhundert erforscht und gehört zu den verlässlichsten Ergebnissen der Gedächtnisforschung: Wiederholungen, die über wachsende Abstände verteilt sind, führen zu dauerhafterem Behalten als dieselbe Zahl an Durchgängen am Stück. Auf deiner [Heute-Seite](/today) siehst du, welche Verse fällig sind.

## Schritt 7: Nachdenken – Tadabbur

### Was du tust

Schreib ein, zwei Sätze in deine Notiz. Drei Fragen helfen dabei:

- Was sagt mir dieser Vers über Allah?
- Was sagt er über mich und mein Leben?
- Was nehme ich heute mit?

### Warum es wirkt

Allah beschreibt den Koran als „ein gesegnetes Buch, das Wir zu dir hinabgesandt haben, damit sie über seine Verse nachsinnen“ (38:29). Das Nachdenken (Tadabbur) gehört zum eigentlichen Sinn der Rezitation. Es hilft auch dem Gedächtnis: Inhalte, die mit dem eigenen Leben und Empfinden verbunden sind, bleiben am längsten.

## Die tägliche Routine

Die sieben Schritte sind in einen einfachen Tagesablauf eingebettet:

1. **Zuerst wiederholen (ca. 5 Min.)** – die heute fälligen Verse.
2. **Neue Verse (ca. 4 Min. pro Vers)** – für die meisten drei.
3. **Kette bilden (ca. 3 Min.)** – die heutigen Verse zusammen mit denen von gestern, ohne hinzusehen, wie Sabaq und Sabqi im klassischen Hifz.
4. **Vor dem Schlafen hören (ca. 2 Min.)** – was man vor dem Einschlafen durchgeht, wird oft über Nacht gefestigt.

Wie viel ist richtig? Anfänger: 1–3 neue Verse am Tag. Mit Übung: 3–5. Intensiv: 5–10 plus längere Wiederholung. Die Menge, die du täglich durchhältst, ist die richtige. Mehr dazu in der [täglichen Koran-Routine](/guides/daily-quran-routine).

## Für wen ist die Shams-Methode gedacht?

- **Anfänger**, die noch kein Arabisch lesen – Umschrift und Wortbedeutungen helfen ab dem ersten Vers.
- **Lernende, die vergessen**, was sie auswendig gelernt haben – genau dafür ist der Wiederholungsplan da.
- **Eltern und Kinder** – zusammen mit dem Kindermodus werden kurze Suren spielerisch.
- **Hifz-Schüler** – als strukturierte Vorbereitung des täglichen Sabaq, bevor sie dem Lehrer vortragen.

## Jetzt ausprobieren

Beginne mit [Al-Fatiha](/surah/1) oder [wähle eine beliebige Sure](/quran). Die Methode führt dich Schritt für Schritt auf dem Bildschirm – und sie ist komplett kostenlos.`,
    faq: [
      {
        q_en: "Who developed the Shams Method?",
        a_en: "The Shams Method was developed by Nami Shams in Dubai as the core learning path of Quran Masterclass.",
        q_de: "Wer hat die Shams-Methode entwickelt?",
        a_de: "Die Shams-Methode wurde von Nami Shams in Dubai als zentraler Lernweg von Quran Masterclass entwickelt.",
      },
      {
        q_en: "Why build a verse up backwards?",
        a_en: "Starting from the last word means every repetition ends on a part you already know. The melody stays natural and the end of the verse becomes as secure as the beginning.",
        q_de: "Warum wird der Vers rückwärts aufgebaut?",
        a_de: "Wer beim letzten Wort beginnt, endet bei jeder Wiederholung auf einem bekannten Teil. Die Melodie bleibt natürlich, und das Versende sitzt genauso sicher wie der Anfang.",
      },
      {
        q_en: "Is the Shams Method a new tafsir?",
        a_en: "No. It is a learning method. All explanations come from classical tafsir works and are shown with their source.",
        q_de: "Ist die Shams-Methode ein neuer Tafsir?",
        a_de: "Nein. Sie ist eine Lernmethode. Alle Erklärungen stammen aus klassischen Tafsir-Werken und werden mit Quelle angezeigt.",
      },
      {
        q_en: "How long does one verse take?",
        a_en: "About four minutes for a typical verse, plus a short review on the following days according to the schedule.",
        q_de: "Wie lange dauert ein Vers?",
        a_de: "Etwa vier Minuten für einen durchschnittlichen Vers, dazu kurze Wiederholungen an den folgenden Tagen nach Plan.",
      },
    ],
    related: ["how-to-memorize-the-quran", "how-to-learn-the-quran", "daily-quran-routine"],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "learn-to-read-the-quran",
    date: "2026-10-06",
    title_en: "Learn to Read the Quran: Letters, Harakat and First Steps",
    title_de: "Koran lesen lernen: Buchstaben, Vokalzeichen, erste Schritte",
    desc_en: "Learn to read the Quran in Arabic: the 28 letters, vowel marks (harakat), sukun and shadda, and how to move from transliteration to the Arabic script.",
    desc_de: "Koran lesen lernen: die 28 arabischen Buchstaben, Vokalzeichen, Sukun und Schadda – und wie du Schritt für Schritt von der Umschrift zur Schrift kommst.",
    keywords_en: "learn to read the Quran, Arabic alphabet, harakat, read Quran for beginners, Quran transliteration",
    keywords_de: "Koran lesen lernen, arabisches Alphabet, Vokalzeichen, Koran lesen für Anfänger, Koran Umschrift",
    body_en: `Reading the Quran in its original Arabic is a goal for many Muslims who grew up with another language. The good news: Arabic script is logical and regular, and the Quran is printed with full vowel marks – so once you know the system, you can read every word. This guide walks you through the letters, the vowel signs and a realistic path from transliteration to reading on your own.

## Why learn to read the Arabic script?

Transliteration – Arabic written in Latin letters – is a helpful start. But it has limits:

- Several Arabic sounds have no exact equivalent in European languages, so transliteration can only approximate them.
- Different transliteration systems write the same word differently.
- Long and short vowels, doubled letters and pauses are hard to show clearly in Latin letters.

Reading the Arabic text connects you directly to the words as they were preserved. It also makes tajweed, memorisation and vocabulary much easier later.

## Step 1: Get to know the alphabet

Arabic has **28 letters** and is written from right to left. A few points help you get oriented:

- **Most letters connect** to the next letter and change shape slightly depending on their position (beginning, middle, end or standing alone).
- **Six letters never connect to the letter after them:** ا (alif), د (dal), ذ (dhal), ر (ra), ز (zay) and و (waw).
- **Many letters share a basic shape** and differ only by dots, for example ب (ba), ت (ta) and ث (tha). Learning them in groups saves time.

### Sounds that need attention

Some letters are new to most learners and deserve extra practice with audio:

- ع ('ayn) and ح (ha) – produced in the throat.
- خ (kha) and غ (ghayn) – soft throat sounds, similar to the German "ch" in "Bach" and a gargled "r".
- The heavy letters ص (sad), ض (dad), ط (ta) and ظ (za) – pronounced with a "full" mouth.
- ق (qaf) – further back than k.

Listening is essential here. In Quran Masterclass, you can play any verse and hear each word highlighted as it is recited, so you connect each letter with its real sound.

## Step 2: Learn the vowel marks (harakat)

Arabic letters are mainly consonants. Short vowels are shown by small marks above or below the letter:

- **Fatha** (a short line above) – "a", as in بَ (ba).
- **Kasra** (a short line below) – "i", as in بِ (bi).
- **Damma** (a small waw-like sign above) – "u", as in بُ (bu).

### Further signs you will meet on every page

- **Sukun** (a small circle above) – the letter has no vowel, as in بْ (b).
- **Shadda** (a small "w"-shaped sign) – the letter is doubled, as in رَبَّ (rabba).
- **Tanween** (double vowel marks) – adds an "n" sound at the end: ـً (an), ـٍ (in), ـٌ (un).

### Long vowels

Three letters lengthen the vowel before them:

- ا (alif) after fatha – long "aa"
- و (waw) after damma – long "uu"
- ي (ya) after kasra – long "ii"

The Quran's script also uses a small raised alif (the "dagger alif") above some letters to show a long "aa", for example in the word for "Lord of the worlds" in [Al-Fatiha](/surah/1).

## Step 3: Read syllables, then words

Once you know a group of letters and the three short vowels, start combining them:

1. Read single letters with each vowel: بَ بِ بُ.
2. Read two-letter and three-letter combinations: كَتَبَ (kataba).
3. Add sukun and shadda.
4. Read short words from the Quran.

Practise little and often. Ten minutes every day are worth more than an hour on the weekend.

## Step 4: Use transliteration as a bridge – then let it go

Transliteration is valuable at the start, especially for reciting short surahs in prayer while you are still learning the letters. The risk is that it becomes a crutch. A good approach:

1. **Phase 1:** Read the transliteration while listening and following the Arabic text with your eyes.
2. **Phase 2:** Read the Arabic first and check with the transliteration only when you are unsure.
3. **Phase 3:** Hide the transliteration completely and read from the Arabic alone.

In the player, you can switch transliteration on and off at any time. Try turning it off for verses you already know.

## Step 5: Read along with a reciter

Following a skilled reciter is one of the best ways to improve reading. Choose a slow, clear voice – many learners find Mahmoud Khalil Al-Husary helpful because of his measured pace. Reduce the playback speed if needed, and repeat each verse until you can read it at the reciter's pace.

The short surahs at the end of the Quran are ideal practice material: [Al-Ikhlas](/surah/112), [Al-Falaq](/surah/113), [An-Nas](/surah/114) and [Al-'Asr](/surah/103).

## Step 6: Get to know special signs of the mushaf

The Quran contains a few signs you will not find in everyday Arabic:

- **Pause marks** (for example a small م, ج or قلى above the line) indicate where stopping is required, allowed or preferred.
- **Small letters** show sounds that are pronounced but not written in the main script.
- **Verse end markers** with numbers separate the verses.

You do not need to learn all of them at once. Notice them, ask your teacher, and they will become familiar.

## Step 7: Move on to tajweed

Reading correctly is the foundation; tajweed adds the rules of beautiful, correct recitation, such as nasal sounds, lengthening and merging of letters. Once you can read short words confidently, read our [tajweed guide for beginners](/guides/tajweed-for-beginners).

## How long does it take?

This differs from person to person. With daily practice, many adults can recognise the letters within a few weeks and read slowly with vowel marks after a few months. Fluency comes with time and regular reading.

## Tips for steady progress

- **Learn letters in shape groups,** not in strict alphabetical order.
- **Say every sound aloud.** Silent reading does not train pronunciation.
- **Listen first, then read.** Your ear guides your tongue.
- **Ask a teacher to check you.** Some mistakes you cannot hear yourself.
- **Read a little every day,** even on busy days – one verse is enough to keep the habit.

When you are ready, combine reading with understanding and memorisation. Our [complete beginner's guide](/guides/how-to-learn-the-quran) shows how everything fits together, and the [Shams Method](/shams) gives you a step-by-step path for each verse.`,
    body_de: `Den Koran im arabischen Original zu lesen, ist für viele Muslime, die mit einer anderen Sprache aufgewachsen sind, ein Herzenswunsch. Die gute Nachricht: Die arabische Schrift ist logisch und regelmäßig, und der Koran ist vollständig mit Vokalzeichen gedruckt. Wer das System kennt, kann also jedes Wort lesen. Dieser Ratgeber führt dich durch die Buchstaben, die Vokalzeichen und einen realistischen Weg von der Umschrift zum selbstständigen Lesen.

## Warum die arabische Schrift lernen?

Die Umschrift (Transliteration) – also Arabisch in lateinischen Buchstaben – ist ein guter Einstieg. Sie hat aber Grenzen:

- Mehrere arabische Laute gibt es im Deutschen nicht, die Umschrift kann sie nur annähernd wiedergeben.
- Verschiedene Umschriftsysteme schreiben dasselbe Wort unterschiedlich.
- Lange und kurze Vokale, Verdopplungen und Pausen lassen sich mit lateinischen Buchstaben schlecht darstellen.

Wer den arabischen Text liest, ist direkt mit den Worten verbunden, so wie sie überliefert wurden. Außerdem werden Tajwid, Auswendiglernen und Wortschatz später viel leichter.

## Schritt 1: Das Alphabet kennenlernen

Arabisch hat **28 Buchstaben** und wird von rechts nach links geschrieben. Ein paar Punkte helfen bei der Orientierung:

- **Die meisten Buchstaben werden verbunden** und verändern je nach Position (Anfang, Mitte, Ende oder allein stehend) leicht ihre Form.
- **Sechs Buchstaben verbinden sich nie mit dem folgenden:** ا (Alif), د (Dal), ذ (Dhal), ر (Ra), ز (Zay) und و (Waw).
- **Viele Buchstaben haben dieselbe Grundform** und unterscheiden sich nur durch Punkte, etwa ب (Ba), ت (Ta) und ث (Tha). Wer sie in Gruppen lernt, spart Zeit.

### Laute, die Aufmerksamkeit brauchen

Einige Buchstaben sind für die meisten Lernenden neu und verdienen besondere Übung mit Audio:

- ع ('Ayn) und ح (Ha) – werden im Rachen gebildet.
- خ (Kha) – klingt wie das deutsche „ch“ in „Bach“; غ (Ghayn) – ähnlich einem weichen Rachen-R.
- Die „schweren“ Buchstaben ص (Sad), ض (Dad), ط (Ta) und ظ (Za) – mit vollem, hohlem Mundraum gesprochen.
- ق (Qaf) – weiter hinten gebildet als das k.

Hier ist Zuhören unverzichtbar. Bei Quran Masterclass kannst du jeden Vers abspielen und siehst jedes Wort hervorgehoben, während es rezitiert wird. So verbindest du jeden Buchstaben mit seinem echten Klang.

## Schritt 2: Die Vokalzeichen (Harakat) lernen

Arabische Buchstaben sind im Kern Konsonanten. Kurze Vokale werden durch kleine Zeichen über oder unter dem Buchstaben angezeigt:

- **Fatha** (kurzer Strich oben) – „a“, wie in بَ (ba).
- **Kasra** (kurzer Strich unten) – „i“, wie in بِ (bi).
- **Damma** (kleines, Waw-ähnliches Zeichen oben) – „u“, wie in بُ (bu).

### Weitere Zeichen, die dir auf jeder Seite begegnen

- **Sukun** (kleiner Kreis oben) – der Buchstabe hat keinen Vokal, wie in بْ (b).
- **Schadda** (kleines „w“-förmiges Zeichen) – der Buchstabe wird verdoppelt, wie in رَبَّ (rabba).
- **Tanwin** (doppelte Vokalzeichen) – fügt am Wortende ein „n“ an: ـً (an), ـٍ (in), ـٌ (un).

### Lange Vokale

Drei Buchstaben verlängern den Vokal davor:

- ا (Alif) nach Fatha – langes „aa“
- و (Waw) nach Damma – langes „uu“
- ي (Ya) nach Kasra – langes „ii“

Im Koran gibt es zusätzlich ein kleines, hochgestelltes Alif über manchen Buchstaben, das ebenfalls ein langes „aa“ anzeigt – zum Beispiel im Wort für „Herr der Welten“ in [Al-Fatiha](/surah/1).

## Schritt 3: Erst Silben, dann Wörter

Sobald du eine Gruppe von Buchstaben und die drei kurzen Vokale kennst, fang an zu kombinieren:

1. Einzelne Buchstaben mit jedem Vokal lesen: بَ بِ بُ.
2. Zwei- und Dreierverbindungen lesen: كَتَبَ (kataba).
3. Sukun und Schadda dazunehmen.
4. Kurze Wörter aus dem Koran lesen.

Übe wenig, aber oft. Zehn Minuten jeden Tag sind mehr wert als eine Stunde am Wochenende.

## Schritt 4: Die Umschrift als Brücke nutzen – und dann loslassen

Am Anfang ist die Umschrift wertvoll, besonders um kurze Suren im Gebet zu rezitieren, während du noch die Buchstaben lernst. Die Gefahr: Sie wird zur Krücke. Bewährt hat sich dieser Weg:

1. **Phase 1:** Die Umschrift lesen, dabei zuhören und dem arabischen Text mit den Augen folgen.
2. **Phase 2:** Zuerst das Arabische lesen und nur bei Unsicherheit in die Umschrift schauen.
3. **Phase 3:** Die Umschrift ganz ausblenden und nur noch aus dem Arabischen lesen.

Im Player kannst du die Umschrift jederzeit ein- und ausschalten. Probier es bei Versen, die du schon kennst, einfach ohne.

## Schritt 5: Mit einem Rezitator mitlesen

Einem guten Rezitator zu folgen, ist einer der besten Wege, das Lesen zu verbessern. Wähle eine langsame, klare Stimme – viele Lernende kommen mit Mahmoud Khalil Al-Husary gut zurecht, weil er sehr gemessen vorträgt. Reduziere bei Bedarf die Wiedergabegeschwindigkeit und wiederhole jeden Vers, bis du ihn im Tempo des Rezitators lesen kannst.

Die kurzen Suren am Ende des Korans sind ideales Übungsmaterial: [Al-Ikhlas](/surah/112), [Al-Falaq](/surah/113), [An-Nas](/surah/114) und [Al-'Asr](/surah/103).

## Schritt 6: Besondere Zeichen des Mushaf kennenlernen

Im Koran gibt es einige Zeichen, die im normalen Arabisch nicht vorkommen:

- **Pausenzeichen** (etwa ein kleines م, ج oder قلى über der Zeile) zeigen, wo man anhalten muss, darf oder besser anhält.
- **Kleine Buchstaben** stehen für Laute, die gesprochen, aber in der Hauptschrift nicht geschrieben werden.
- **Versendzeichen** mit Nummern trennen die Verse voneinander.

Du musst nicht alle auf einmal lernen. Achte auf sie, frag deinen Lehrer – und sie werden dir nach und nach vertraut.

## Schritt 7: Weiter zum Tajwid

Richtig lesen ist das Fundament. Tajwid ergänzt die Regeln für eine schöne und korrekte Rezitation, etwa Nasallaute, Dehnungen und das Verschmelzen von Buchstaben. Sobald du kurze Wörter sicher liest, lies unseren [Tajwid-Ratgeber für Anfänger](/guides/tajweed-for-beginners).

## Wie lange dauert das?

Das ist von Mensch zu Mensch verschieden. Mit täglicher Übung erkennen viele Erwachsene die Buchstaben nach einigen Wochen und lesen nach einigen Monaten langsam mit Vokalzeichen. Flüssiges Lesen kommt mit der Zeit und mit regelmäßigem Lesen.

## Tipps für stetige Fortschritte

- **Lerne Buchstaben in Formgruppen,** nicht streng nach Alphabet.
- **Sprich jeden Laut laut aus.** Stilles Lesen trainiert die Aussprache nicht.
- **Erst hören, dann lesen.** Dein Ohr führt deine Zunge.
- **Lass dich von einem Lehrer prüfen.** Manche Fehler hört man selbst nicht.
- **Lies jeden Tag ein bisschen,** auch an vollen Tagen – ein Vers reicht, um die Gewohnheit zu halten.

Wenn du so weit bist, verbinde das Lesen mit Verstehen und Auswendiglernen. Unser [kompletter Leitfaden für Anfänger](/guides/how-to-learn-the-quran) zeigt, wie alles zusammenpasst, und die [Shams-Methode](/shams) gibt dir einen klaren Weg für jeden Vers.`,
    faq: [
      {
        q_en: "How many letters does the Arabic alphabet have?",
        a_en: "Arabic has 28 letters. Most of them connect to the following letter and change their shape slightly depending on their position in the word.",
        q_de: "Wie viele Buchstaben hat das arabische Alphabet?",
        a_de: "Das arabische Alphabet hat 28 Buchstaben. Die meisten werden mit dem folgenden Buchstaben verbunden und verändern je nach Position im Wort leicht ihre Form.",
      },
      {
        q_en: "Is it okay to read the Quran with transliteration?",
        a_en: "Transliteration is a useful bridge for beginners, but it can only approximate some sounds. Aim to move to the Arabic script step by step and have a teacher check your pronunciation.",
        q_de: "Darf ich den Koran mit Umschrift lesen?",
        a_de: "Die Umschrift ist für Anfänger eine nützliche Brücke, gibt manche Laute aber nur annähernd wieder. Ziel sollte sein, Schritt für Schritt zur arabischen Schrift zu wechseln und die Aussprache von einem Lehrer prüfen zu lassen.",
      },
      {
        q_en: "What are harakat?",
        a_en: "Harakat are the vowel marks: fatha (a), kasra (i) and damma (u). Together with sukun, shadda and tanween they show exactly how each word is pronounced.",
        q_de: "Was sind Harakat?",
        a_de: "Harakat sind die Vokalzeichen: Fatha (a), Kasra (i) und Damma (u). Zusammen mit Sukun, Schadda und Tanwin zeigen sie genau, wie jedes Wort ausgesprochen wird.",
      },
    ],
    related: ["tajweed-for-beginners", "how-to-learn-the-quran", "learn-quranic-arabic-vocabulary"],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "tajweed-for-beginners",
    date: "2026-10-06",
    title_en: "Tajweed for Beginners: The Main Rules Explained",
    title_de: "Tajwid für Anfänger: Die wichtigsten Regeln erklärt",
    desc_en: "Tajweed for beginners: articulation points, noon sakinah and tanween, meem sakinah, qalqalah, madd and heavy letters – explained simply, with practice tips.",
    desc_de: "Tajwid für Anfänger: Artikulationsstellen, Nun Sakina und Tanwin, Mim Sakina, Qalqala, Madd und schwere Buchstaben – einfach erklärt, mit Übungstipps.",
    keywords_en: "tajweed for beginners, tajweed rules, noon sakinah, qalqalah, madd, Quran recitation rules",
    keywords_de: "Tajwid für Anfänger, Tajwid Regeln, Nun Sakina, Qalqala, Madd, Koran Rezitation Regeln",
    body_en: `Tajweed means "making beautiful" or "doing well". In Quran recitation, it is the set of rules that ensures every letter is pronounced from its correct place, with its correct qualities, and that letters interact as they were recited by the Prophet ﷺ and passed on through generations of teachers. Allah says: "and recite the Quran with measured recitation (tartil)" (73:4).

This guide gives you an overview of the main rules as they apply in the most widespread recitation, Hafs from 'Asim. It is a map, not a replacement for a teacher: tajweed is learned by listening and being corrected.

## Why tajweed matters

Scholars distinguish two kinds of mistakes:

- **Clear mistakes (lahn jali)** – for example changing a letter or a vowel. These can change the meaning and must be avoided.
- **Subtle mistakes (lahn khafi)** – for example not applying a nasal sound or a lengthening fully. These affect the beauty and precision of recitation.

How strictly each rule applies is a question for qualified scholars and teachers. For a beginner, the practical point is simple: first make sure every letter and vowel is right, then refine the rules step by step.

## 1. Articulation points (makharij)

Every Arabic letter has its own place of articulation. They are usually grouped into five areas:

- **The empty space of mouth and throat (al-jawf)** – the long vowels.
- **The throat (al-halq)** – ء ه ع ح غ خ.
- **The tongue (al-lisan)** – most letters, from the back of the tongue (ق ك) to its tip (ت د ط and others).
- **The lips (ash-shafatan)** – ف ب م و.
- **The nasal passage (al-khayshum)** – the nasal sound (ghunnah).

The best way to learn makharij is to listen closely and imitate. Play a verse slowly, focus on one letter, and repeat.

## 2. Heavy and light letters

Some letters are always pronounced "heavy" (tafkhim), with a fuller, deeper sound. They are often memorised with the phrase **خُصَّ ضَغْطٍ قِظْ**: خ ص ض غ ط ق ظ.

Two letters change depending on context:

- **ر (ra)** – generally heavy with fatha or damma, light with kasra. There are further details your teacher will explain.
- **The lam in the name Allah** – heavy after fatha or damma (as in "Allahu"), light after kasra (as in "bismillahi").

## 3. Noon sakinah and tanween

A noon without vowel (نْ) and tanween (ـً ـٍ ـٌ) follow four rules depending on the next letter.

### Izhar – clear pronunciation

Before the six throat letters ء ه ع ح غ خ, the noon is pronounced clearly, without extra nasalisation.

### Idgham – merging

Before the letters ي ر م ل و ن (often remembered as "yarmalun"), the noon merges into the next letter:

- **With ghunnah** before ي ن م و – the merge carries a nasal sound.
- **Without ghunnah** before ل ر – a complete merge.

Exception: if the noon and the following letter are in the same word, idgham does not apply.

### Iqlab – conversion

Before ب, the noon becomes a hidden meem sound with ghunnah. The mushaf often marks this with a small meem.

### Ikhfa – concealment

Before the remaining fifteen letters, the noon is "hidden": pronounced lightly with ghunnah, between clear and merged.

## 4. Meem sakinah

A meem without vowel (مْ) has three cases:

- **Ikhfa shafawi** before ب – the meem is hidden with ghunnah.
- **Idgham shafawi** before another م – the two meems merge with ghunnah.
- **Izhar shafawi** before all other letters – the meem is pronounced clearly.

## 5. Ghunnah on doubled noon and meem

Whenever noon or meem carries a shadda (نّ مّ), it is pronounced with a clear nasal sound held for about two counts. You will hear this very often, for example in the word "inna".

## 6. Qalqalah – the echo

The five letters **ق ط ب ج د** (remembered as "qutb jad") produce a slight bouncing echo when they carry a sukun. The echo is stronger when you stop on such a letter at the end of a verse – listen to the endings of [Al-Ikhlas](/surah/112) and [Al-Falaq](/surah/113).

## 7. Madd – lengthening

Madd means lengthening a vowel. The length is measured in counts (harakat).

- **Natural madd (madd tabi'i)** – a long vowel without a following hamza or sukun: two counts.
- **Connected madd (muttasil)** – a long vowel followed by hamza in the same word: typically four or five counts in Hafs.
- **Separated madd (munfasil)** – a long vowel at the end of one word, hamza at the start of the next: lengths vary by the transmission you follow; your teacher will tell you which to use.
- **Necessary madd (lazim)** – a long vowel followed by a permanent sukun or shadda: six counts.
- **Madd due to stopping ('arid lis-sukun)** – when you stop on a word whose second-to-last letter is a long vowel: two, four or six counts.

The mushaf marks most longer madds with a wavy line above the letter.

## 8. Sun and moon letters

After the definite article "al-":

- With **moon letters** (qamariyyah), the lam is pronounced: al-qamar.
- With **sun letters** (shamsiyyah), the lam is silent and the next letter is doubled: ash-shams.

## 9. Stopping and starting (waqf and ibtida)

When you stop at the end of a verse or at a pause mark, the last vowel usually becomes a sukun. Small symbols in the mushaf indicate where stopping is required, preferred, permitted or better avoided. Start again at a point that keeps the meaning intact.

## How to practise tajweed with Quran Masterclass

1. **Listen to one rule at a time.** Pick a short surah and listen only for ghunnah, or only for qalqalah.
2. **Slow down.** Reduce playback speed to hear details.
3. **Repeat a verse several times** using the repeat function.
4. **Use the backward build-up** from the [Shams Method](/shams) – hearing the verse in growing pieces makes details stand out.
5. **Recite to a teacher regularly.** A trained ear will catch what you cannot hear yourself.

Good practice material are the short surahs of Juz Amma – see our [Juz Amma learning plan](/guides/juz-amma-learning-plan). If you are still learning the letters, start with our guide on [learning to read the Quran](/guides/learn-to-read-the-quran).

## A word of encouragement

Do not let the number of rules discourage you. Nobody learns them all at once. The Prophet ﷺ said that the one who recites the Quran with difficulty, stumbling over it, will have a double reward (Bukhari and Muslim). Every effort counts.`,
    body_de: `Tajwid bedeutet wörtlich „verschönern“ oder „gut machen“. In der Koranrezitation sind damit die Regeln gemeint, die sicherstellen, dass jeder Buchstabe von seiner richtigen Stelle und mit seinen richtigen Eigenschaften gesprochen wird – und dass die Buchstaben so ineinandergreifen, wie der Prophet ﷺ rezitiert hat und wie es über Generationen von Lehrern weitergegeben wurde. Allah sagt: „und trage den Koran wohlgeordnet vor (Tartil)“ (73:4).

Dieser Ratgeber gibt dir einen Überblick über die wichtigsten Regeln, wie sie in der am weitesten verbreiteten Lesart gelten: Hafs nach 'Asim. Er ist eine Landkarte, kein Ersatz für einen Lehrer – Tajwid lernt man durch Hören und Korrigiertwerden.

## Warum Tajwid wichtig ist

Die Gelehrten unterscheiden zwei Arten von Fehlern:

- **Deutliche Fehler (Lahn Dschali)** – etwa einen Buchstaben oder Vokal vertauschen. Sie können die Bedeutung verändern und müssen vermieden werden.
- **Feine Fehler (Lahn Khafi)** – etwa einen Nasallaut oder eine Dehnung nicht vollständig umsetzen. Sie betreffen Schönheit und Genauigkeit der Rezitation.

Wie streng welche Regel gilt, beantworten qualifizierte Gelehrte und Lehrer. Für Anfänger ist der praktische Punkt einfach: Zuerst muss jeder Buchstabe und Vokal stimmen, dann verfeinerst du Schritt für Schritt die Regeln.

## 1. Artikulationsstellen (Makharidsch)

Jeder arabische Buchstabe hat seinen eigenen Bildungsort. Meist werden fünf Bereiche unterschieden:

- **Der Hohlraum von Mund und Rachen (al-Dschauf)** – die langen Vokale.
- **Der Rachen (al-Halq)** – ء ه ع ح غ خ.
- **Die Zunge (al-Lisan)** – die meisten Buchstaben, vom Zungenrücken (ق ك) bis zur Zungenspitze (ت د ط und weitere).
- **Die Lippen (asch-Schafatan)** – ف ب م و.
- **Der Nasenraum (al-Khayschum)** – der Nasallaut (Ghunna).

Am besten lernst du die Makharidsch durch genaues Hinhören und Nachahmen. Spiel einen Vers langsam ab, konzentrier dich auf einen Buchstaben und wiederhole.

## 2. Schwere und leichte Buchstaben

Einige Buchstaben werden immer „schwer“ (Tafkhim) gesprochen, mit vollerem, tieferem Klang. Man merkt sie sich oft mit dem Satz **خُصَّ ضَغْطٍ قِظْ**: خ ص ض غ ط ق ظ.

Zwei Buchstaben ändern sich je nach Zusammenhang:

- **ر (Ra)** – in der Regel schwer mit Fatha oder Damma, leicht mit Kasra. Weitere Feinheiten erklärt dir dein Lehrer.
- **Das Lam im Namen Allah** – schwer nach Fatha oder Damma (wie in „Allahu“), leicht nach Kasra (wie in „bismillahi“).

## 3. Nun Sakina und Tanwin

Ein Nun ohne Vokal (نْ) und das Tanwin (ـً ـٍ ـٌ) folgen je nach nächstem Buchstaben vier Regeln.

### Izhar – deutliches Aussprechen

Vor den sechs Rachenbuchstaben ء ه ع ح غ خ wird das Nun klar und ohne zusätzliche Nasalierung gesprochen.

### Idgham – Verschmelzen

Vor den Buchstaben ي ر م ل و ن (Merkwort „yarmalun“) verschmilzt das Nun mit dem folgenden Buchstaben:

- **Mit Ghunna** vor ي ن م و – die Verschmelzung trägt einen Nasallaut.
- **Ohne Ghunna** vor ل ر – vollständige Verschmelzung.

Ausnahme: Stehen Nun und folgender Buchstabe im selben Wort, gilt kein Idgham.

### Iqlab – Umwandeln

Vor ب wird das Nun zu einem verdeckten Mim-Laut mit Ghunna. Im Mushaf ist das oft mit einem kleinen Mim markiert.

### Ikhfa – Verbergen

Vor den übrigen fünfzehn Buchstaben wird das Nun „verborgen“: leicht und mit Ghunna gesprochen, zwischen deutlich und verschmolzen.

## 4. Mim Sakina

Ein Mim ohne Vokal (مْ) kennt drei Fälle:

- **Ikhfa Schafawi** vor ب – das Mim wird mit Ghunna verborgen.
- **Idgham Schafawi** vor einem weiteren م – beide Mims verschmelzen mit Ghunna.
- **Izhar Schafawi** vor allen anderen Buchstaben – das Mim wird deutlich gesprochen.

## 5. Ghunna bei verdoppeltem Nun und Mim

Trägt ein Nun oder Mim eine Schadda (نّ مّ), wird es mit deutlichem Nasallaut gesprochen und etwa zwei Zählzeiten gehalten. Das hörst du sehr häufig, zum Beispiel im Wort „inna“.

## 6. Qalqala – der Nachhall

Die fünf Buchstaben **ق ط ب ج د** (Merkwort „qutb dschad“) erzeugen einen leichten, federnden Nachhall, wenn sie ein Sukun tragen. Beim Anhalten am Versende ist er stärker – hör dir die Versenden von [Al-Ikhlas](/surah/112) und [Al-Falaq](/surah/113) an.

## 7. Madd – Dehnung

Madd bedeutet, einen Vokal zu dehnen. Die Länge wird in Zählzeiten (Harakat) gemessen.

- **Natürliche Dehnung (Madd Tabi'i)** – ein langer Vokal ohne folgendes Hamza oder Sukun: zwei Zählzeiten.
- **Verbundene Dehnung (Muttasil)** – langer Vokal, gefolgt von Hamza im selben Wort: bei Hafs meist vier oder fünf Zählzeiten.
- **Getrennte Dehnung (Munfasil)** – langer Vokal am Wortende, Hamza am Anfang des nächsten Wortes: Die Länge hängt vom Überlieferungsweg ab, dem du folgst; dein Lehrer sagt dir, welche du nimmst.
- **Notwendige Dehnung (Lazim)** – langer Vokal, gefolgt von festem Sukun oder Schadda: sechs Zählzeiten.
- **Dehnung beim Anhalten ('Arid lis-Sukun)** – wenn du auf einem Wort anhältst, dessen vorletzter Buchstabe ein langer Vokal ist: zwei, vier oder sechs Zählzeiten.

Die meisten längeren Dehnungen sind im Mushaf mit einer Wellenlinie über dem Buchstaben markiert.

## 8. Sonnen- und Mondbuchstaben

Nach dem Artikel „al-“ gilt:

- Bei **Mondbuchstaben** (Qamariyya) wird das Lam gesprochen: al-qamar.
- Bei **Sonnenbuchstaben** (Schamsiyya) bleibt das Lam stumm und der folgende Buchstabe wird verdoppelt: asch-schams.

## 9. Anhalten und Neubeginn (Waqf und Ibtida)

Wenn du am Versende oder an einem Pausenzeichen anhältst, wird der letzte Vokal meist zum Sukun. Kleine Symbole im Mushaf zeigen, wo das Anhalten nötig, besser, erlaubt oder eher zu vermeiden ist. Setz an einer Stelle wieder ein, die den Sinn nicht zerreißt.

## Tajwid üben mit Quran Masterclass

1. **Hör auf eine Regel nach der anderen.** Nimm eine kurze Sure und achte nur auf Ghunna oder nur auf Qalqala.
2. **Langsamer abspielen.** Mit reduzierter Geschwindigkeit hörst du Details.
3. **Wiederhole einen Vers mehrmals** mit der Wiederholungsfunktion.
4. **Nutze den Rückwärtsaufbau** der [Shams-Methode](/shams) – wer den Vers in wachsenden Stücken hört, nimmt Einzelheiten deutlicher wahr.
5. **Trag regelmäßig einem Lehrer vor.** Ein geschultes Ohr hört, was dir selbst entgeht.

Gutes Übungsmaterial sind die kurzen Suren von Juz Amma – siehe unseren [Lernplan für Juz Amma](/guides/juz-amma-learning-plan). Wenn du noch die Buchstaben lernst, beginne mit unserem Ratgeber [Koran lesen lernen](/guides/learn-to-read-the-quran).

## Ein Wort zur Ermutigung

Lass dich von der Zahl der Regeln nicht entmutigen. Niemand lernt sie alle auf einmal. Der Prophet ﷺ sagte, dass derjenige, der den Koran mühsam und stockend rezitiert, doppelten Lohn erhält (Bukhari und Muslim). Jede Mühe zählt.`,
    faq: [
      {
        q_en: "Is tajweed obligatory?",
        a_en: "Avoiding clear mistakes that change letters or meaning is required when reciting. How strictly each finer rule applies is discussed by scholars – please ask a qualified teacher or scholar for guidance.",
        q_de: "Ist Tajwid Pflicht?",
        a_de: "Deutliche Fehler, die Buchstaben oder Bedeutung verändern, sind beim Rezitieren zu vermeiden. Wie streng die feineren Regeln gelten, besprechen die Gelehrten – bitte frag einen qualifizierten Lehrer oder Gelehrten.",
      },
      {
        q_en: "Which tajweed rule should I learn first?",
        a_en: "Start with correct pronunciation of the letters and vowels, then learn noon sakinah and tanween, ghunnah and natural madd. These appear on almost every page.",
        q_de: "Welche Tajwid-Regel sollte ich zuerst lernen?",
        a_de: "Beginne mit der richtigen Aussprache der Buchstaben und Vokale, danach Nun Sakina und Tanwin, Ghunna und die natürliche Dehnung. Sie kommen auf fast jeder Seite vor.",
      },
      {
        q_en: "Can I learn tajweed from an app alone?",
        a_en: "An app helps you listen closely, slow down and repeat. Correct tajweed, however, is best learned by reciting to a qualified teacher who can correct you.",
        q_de: "Kann ich Tajwid allein mit einer App lernen?",
        a_de: "Eine App hilft beim genauen Hinhören, Verlangsamen und Wiederholen. Richtiges Tajwid lernt man aber am besten, indem man einem qualifizierten Lehrer vorträgt, der korrigiert.",
      },
    ],
    related: ["learn-to-read-the-quran", "juz-amma-learning-plan", "how-to-learn-the-quran"],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "juz-amma-learning-plan",
    date: "2026-10-06",
    title_en: "Juz Amma Learning Plan: Memorise the 30th Part",
    title_de: "Lernplan Juz Amma: Den 30. Teil auswendig lernen",
    desc_en: "A realistic plan to memorise Juz Amma: 37 surahs and 564 verses in four phases. At three verses a day you finish in about six months, with daily review.",
    desc_de: "Ein realistischer Plan für Juz Amma: 37 Suren, 564 Verse in vier Etappen. Mit drei Versen am Tag bist du in etwa sechs Monaten fertig – inklusive Wiederholung.",
    keywords_en: "Juz Amma, memorize Juz Amma, Juz 30, short surahs, Quran memorization plan",
    keywords_de: "Juz Amma, Juz Amma auswendig lernen, Juz 30, kurze Suren, Koran Lernplan",
    body_en: `Juz Amma, the thirtieth and last part of the Quran, is where most people begin their memorisation journey. It contains the short surahs many Muslims recite in their daily prayers, and its powerful verses about creation, the Day of Judgement and the mercy of Allah stay with you for life.

This plan breaks Juz Amma into four phases and shows how long each one takes at different daily amounts.

## What is Juz Amma?

The Quran is divided into thirty parts (ajza', singular juz') of roughly equal length. The thirtieth part is commonly called Juz Amma after its first word, "'Amma" – "About what…" – the opening of [Surah An-Naba'](/surah/78).

Key facts:

- **37 surahs**, from An-Naba' (78) to An-Nas (114)
- **564 verses** in total
- Mostly **Meccan surahs**: short, rhythmic verses about faith, the hereafter and the signs of Allah

## Why start with Juz Amma?

- **Short verses** – many contain only a few words, which makes them ideal for beginners.
- **Daily use** – you can recite them in your prayers straight away.
- **Quick milestones** – finishing a whole surah after a few days is very motivating.
- **Foundation for more** – the vocabulary and themes appear throughout the Quran.

## How long does it take?

The answer depends on how many new verses you learn per day. With 564 verses:

- **1 verse a day:** about 19 months
- **2 verses a day:** about 9–10 months
- **3 verses a day:** about 188 days – roughly **six months**
- **5 verses a day:** about 4 months

These figures count new learning days only. Plan in some rest days and a few days of pure review now and then. Learning speed also varies from person to person. What counts is that you stay with it.

## Learn it backwards: from An-Nas to An-Naba'

The traditional and most practical order is to start at the end of the Quran and work backwards. The shortest surahs come first, so you build confidence before the longer ones.

### Phase 1: An-Nas (114) to Al-'Adiyat (100) – 90 verses

At three verses a day: **about one month.**

This phase includes [An-Nas](/surah/114), [Al-Falaq](/surah/113), [Al-Ikhlas](/surah/112), Al-Masad, An-Nasr, Al-Kafirun, Al-Kawthar, Al-Ma'un, Quraysh, Al-Fil, Al-Humazah, [Al-'Asr](/surah/103), At-Takathur, Al-Qari'ah and Al-'Adiyat.

Many of these surahs are already familiar from prayer. Use this phase to perfect your pronunciation and get used to the daily routine.

### Phase 2: Az-Zalzalah (99) to Al-Balad (90) – 123 verses

At three verses a day: **about six weeks.**

Az-Zalzalah, Al-Bayyinah, Al-Qadr, Al-'Alaq, At-Tin, Ash-Sharh, Ad-Duha, Al-Layl, Ash-Shams and Al-Balad. Here the surahs get a little longer, and some verses look similar. Pay attention to their endings.

### Phase 3: Al-Fajr (89) to Al-Mutaffifin (83) – 175 verses

At three verses a day: **about two months.**

Al-Fajr, Al-Ghashiyah, Al-A'la, At-Tariq, Al-Buruj, Al-Inshiqaq and Al-Mutaffifin. These surahs have strong scenes of the Day of Judgement. Reading the tafsir helps you keep the order of the verses in mind.

### Phase 4: Al-Infitar (82) to An-Naba' (78) – 176 verses

At three verses a day: **about two months.**

Al-Infitar, At-Takwir, 'Abasa, An-Nazi'at and An-Naba'. These are the longest surahs of Juz Amma. By now your routine is stable, and you can rely on the habits you built in the first phases.

## The daily routine

Each day follows the same four parts of the [Shams Method](/shams):

1. **Review first (about 5 min).** Recite the verses that are due today from memory. Quran Masterclass schedules them after 1, 3, 7, 14, 30 and 90 days and shows them on your [Today page](/today).
2. **New verses (about 4 min each).** Take your three new verses through the seven steps: listen, build up backwards, word by word, meaning, tafsir, fading cues, reflect.
3. **Link the chain (about 3 min).** Recite today's verses together with yesterday's without looking.
4. **Listen before sleep (about 2 min).** Play today's verses once more in the evening.

That is about 20–25 minutes a day. Read more in our [daily Quran routine](/guides/daily-quran-routine).

## Completing a surah

When you have learned the last verse of a surah, add one extra step: recite the **whole surah** from memory in one go, then listen to it once with the reciter. Do this again on the next two days. It helps the verses connect into a flowing whole.

## Weekly check

Once a week, recite all surahs of the current phase from memory. Note any verses where you hesitate and bookmark them. Give them a little extra time in the following week.

## Common challenges

### Similar verses

Several surahs in Juz Amma contain verses that sound alike. When you notice such a pair, compare them side by side and note the difference in a few words. The reflection note in the Shams Method is a good place for this.

### Losing motivation in the longer surahs

Phases 3 and 4 take longer. Break them into weekly goals – for example "the first 20 verses of Al-Fajr this week" – and celebrate each completed surah.

### Missed days

Life happens. If you miss a day, do not try to catch up with double portions. Start again with your review and continue at your normal pace.

## Use what you learn

Recite your new surahs in your prayers, listen to them on the way to work or on the [Quran radio](/radio), and read their meaning again from time to time. Verses that are part of your daily life stay with you.

## Ready to start?

Open [An-Nas](/surah/114), listen to the first verse three times and start the Shams Method. In about six months, insha'Allah, you can carry the whole of Juz Amma in your heart. For more on hifz in general, see our [guide to memorising the Quran](/guides/how-to-memorize-the-quran).`,
    body_de: `Juz Amma, der dreißigste und letzte Teil des Korans, ist für die meisten der Einstieg ins Auswendiglernen. Er enthält die kurzen Suren, die viele Muslime täglich im Gebet sprechen – und seine eindringlichen Verse über die Schöpfung, den Tag des Gerichts und die Barmherzigkeit Allahs begleiten einen ein Leben lang.

Dieser Plan teilt Juz Amma in vier Etappen und zeigt, wie lange jede bei unterschiedlichen Tagesmengen dauert.

## Was ist Juz Amma?

Der Koran ist in dreißig etwa gleich lange Teile (Adschza', Einzahl Juz') gegliedert. Der dreißigste Teil heißt nach seinem ersten Wort „'Amma“ – „Worüber …“ – meist Juz Amma. So beginnt [Sure An-Naba'](/surah/78).

Die wichtigsten Fakten:

- **37 Suren**, von An-Naba' (78) bis An-Nas (114)
- **564 Verse** insgesamt
- Überwiegend **mekkanische Suren**: kurze, rhythmische Verse über Glauben, Jenseits und die Zeichen Allahs

## Warum mit Juz Amma beginnen?

- **Kurze Verse** – viele bestehen nur aus wenigen Wörtern, ideal für Anfänger.
- **Im Alltag nutzbar** – du kannst sie sofort im Gebet rezitieren.
- **Schnelle Erfolgserlebnisse** – nach wenigen Tagen eine ganze Sure zu können, motiviert enorm.
- **Grundlage für mehr** – Wortschatz und Themen ziehen sich durch den ganzen Koran.

## Wie lange dauert es?

Das hängt davon ab, wie viele neue Verse du pro Tag lernst. Bei 564 Versen:

- **1 Vers am Tag:** etwa 19 Monate
- **2 Verse am Tag:** etwa 9–10 Monate
- **3 Verse am Tag:** etwa 188 Tage – rund **sechs Monate**
- **5 Verse am Tag:** etwa 4 Monate

Die Zahlen zählen nur Tage mit neuem Stoff. Plane Ruhetage und ab und zu reine Wiederholungstage ein. Außerdem lernt jeder unterschiedlich schnell. Entscheidend ist, dass du dranbleibst.

## Rückwärts lernen: von An-Nas bis An-Naba'

Die klassische und praktischste Reihenfolge beginnt am Ende des Korans und geht rückwärts. Die kürzesten Suren kommen zuerst – so wächst dein Selbstvertrauen, bevor die längeren kommen.

### Etappe 1: An-Nas (114) bis Al-'Adiyat (100) – 90 Verse

Bei drei Versen am Tag: **etwa ein Monat.**

Dazu gehören [An-Nas](/surah/114), [Al-Falaq](/surah/113), [Al-Ikhlas](/surah/112), Al-Masad, An-Nasr, Al-Kafirun, Al-Kauthar, Al-Ma'un, Quraisch, Al-Fil, Al-Humaza, [Al-'Asr](/surah/103), At-Takathur, Al-Qari'a und Al-'Adiyat.

Viele dieser Suren kennst du schon aus dem Gebet. Nutze die Etappe, um deine Aussprache zu verfeinern und dich an die tägliche Routine zu gewöhnen.

### Etappe 2: Az-Zalzala (99) bis Al-Balad (90) – 123 Verse

Bei drei Versen am Tag: **etwa sechs Wochen.**

Az-Zalzala, Al-Bayyina, Al-Qadr, Al-'Alaq, At-Tin, Asch-Scharh, Ad-Duha, Al-Lail, Asch-Schams und Al-Balad. Die Suren werden etwas länger, und manche Verse ähneln sich. Achte besonders auf die Versenden.

### Etappe 3: Al-Fadschr (89) bis Al-Mutaffifin (83) – 175 Verse

Bei drei Versen am Tag: **etwa zwei Monate.**

Al-Fadschr, Al-Ghaschiya, Al-A'la, At-Tariq, Al-Burudsch, Al-Inschiqaq und Al-Mutaffifin. Diese Suren enthalten eindrückliche Bilder vom Tag des Gerichts. Der Tafsir hilft dir, die Reihenfolge der Verse im Kopf zu behalten.

### Etappe 4: Al-Infitar (82) bis An-Naba' (78) – 176 Verse

Bei drei Versen am Tag: **etwa zwei Monate.**

Al-Infitar, At-Takwir, 'Abasa, An-Nazi'at und An-Naba'. Das sind die längsten Suren von Juz Amma. Inzwischen steht deine Routine, und du kannst dich auf die Gewohnheiten aus den ersten Etappen verlassen.

## Die tägliche Routine

Jeder Tag folgt denselben vier Teilen der [Shams-Methode](/shams):

1. **Zuerst wiederholen (ca. 5 Min.).** Die heute fälligen Verse aus dem Gedächtnis rezitieren. Quran Masterclass plant sie nach 1, 3, 7, 14, 30 und 90 Tagen ein und zeigt sie auf deiner [Heute-Seite](/today).
2. **Neue Verse (ca. 4 Min. pro Vers).** Deine drei neuen Verse durch die sieben Schritte führen: zuhören, rückwärts aufbauen, Wort für Wort, Bedeutung, Tafsir, ausblenden, nachdenken.
3. **Kette bilden (ca. 3 Min.).** Die heutigen Verse zusammen mit denen von gestern ohne Hinsehen rezitieren.
4. **Vor dem Schlafen hören (ca. 2 Min.).** Die Verse des Tages abends noch einmal abspielen.

Das sind etwa 20 bis 25 Minuten am Tag. Mehr dazu in unserer [täglichen Koran-Routine](/guides/daily-quran-routine).

## Wenn eine Sure fertig ist

Hast du den letzten Vers einer Sure gelernt, kommt ein Extraschritt dazu: Rezitiere die **ganze Sure** am Stück aus dem Gedächtnis und hör sie dir danach einmal mit dem Rezitator an. Wiederhole das an den nächsten beiden Tagen. So verbinden sich die Verse zu einem fließenden Ganzen.

## Wöchentlicher Check

Einmal pro Woche rezitierst du alle Suren der aktuellen Etappe aus dem Gedächtnis. Notiere Verse, bei denen du zögerst, und setz ein Lesezeichen. Gib ihnen in der folgenden Woche etwas mehr Zeit.

## Typische Hürden

### Ähnliche Verse

In mehreren Suren von Juz Amma gibt es Verse, die ähnlich klingen. Wenn dir ein solches Paar auffällt, vergleiche beide nebeneinander und notiere den Unterschied in ein paar Worten. Die Notiz im Schritt „Nachdenken“ der Shams-Methode eignet sich gut dafür.

### Motivationstief bei den längeren Suren

Die Etappen 3 und 4 dauern länger. Teile sie in Wochenziele auf – etwa „die ersten 20 Verse von Al-Fadschr diese Woche“ – und freu dich über jede fertige Sure.

### Verpasste Tage

Das Leben kommt manchmal dazwischen. Wenn du einen Tag verpasst, versuch nicht, mit doppelten Portionen aufzuholen. Fang wieder mit der Wiederholung an und mach im gewohnten Tempo weiter.

## Nutze, was du lernst

Rezitiere deine neuen Suren im Gebet, hör sie auf dem Weg zur Arbeit oder im [Koran-Radio](/radio) und lies ihre Bedeutung ab und zu erneut. Verse, die Teil deines Alltags sind, bleiben bei dir.

## Bereit?

Öffne [An-Nas](/surah/114), hör dir den ersten Vers dreimal an und starte die Shams-Methode. In etwa sechs Monaten kannst du, so Allah will, ganz Juz Amma im Herzen tragen. Mehr zum Hifz allgemein findest du in unserem [Leitfaden zum Auswendiglernen](/guides/how-to-memorize-the-quran).`,
    faq: [
      {
        q_en: "How many verses does Juz Amma have?",
        a_en: "Juz Amma has 564 verses in 37 surahs, from An-Naba' (surah 78) to An-Nas (surah 114).",
        q_de: "Wie viele Verse hat Juz Amma?",
        a_de: "Juz Amma hat 564 Verse in 37 Suren, von An-Naba' (Sure 78) bis An-Nas (Sure 114).",
      },
      {
        q_en: "How long does it take to memorise Juz Amma?",
        a_en: "At three new verses a day, about 188 learning days – roughly six months. At one verse a day it takes around a year and a half. Choose a pace you can keep up.",
        q_de: "Wie lange dauert es, Juz Amma auswendig zu lernen?",
        a_de: "Bei drei neuen Versen am Tag etwa 188 Lerntage – rund sechs Monate. Bei einem Vers am Tag etwa anderthalb Jahre. Wähle ein Tempo, das du halten kannst.",
      },
      {
        q_en: "Should I learn Juz Amma from the beginning or the end?",
        a_en: "Most teachers recommend starting at the end with An-Nas and working backwards, because the shortest surahs come first.",
        q_de: "Lerne ich Juz Amma von vorne oder von hinten?",
        a_de: "Die meisten Lehrer empfehlen, am Ende mit An-Nas zu beginnen und rückwärts zu lernen, weil so die kürzesten Suren zuerst kommen.",
      },
    ],
    related: ["how-to-memorize-the-quran", "quran-for-kids", "daily-quran-routine"],
  },
  // @@NEXT@@
];
