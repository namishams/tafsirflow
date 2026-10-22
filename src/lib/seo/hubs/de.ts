import type { Hub, HubId } from "../types";

// Landing hubs, Deutsch (Sie-Form). Jede Funktion, die hier genannt wird, existiert auf der Website (siehe messages/de.json und src/app/[locale]/(app)).
// Keine Verstexte, keine Hadithtexte, keine Urteile: Verse nur als Verweis (/surah/N), Rechtsfragen an eine kundige Person der eigenen Schule.
const hubs: Record<HubId, Hub> = {
  "learn-quran": {
    title: "Koran lernen: Anleitung für Anfänger | Quran Masterclass",
    description: "Koran lernen Schritt für Schritt: Buchstaben, Lesen, Tadschwid, kurze Suren und eine tägliche Routine. Für Erwachsene, Kinder und Neumuslime, kostenlos.",
    kicker: "Koran lernen",
    h1: "Koran lernen: Vom ersten Buchstaben bis zur eigenen Routine",
    intro: "Wer den Koran lernen möchte, braucht weder Talent noch Vorkenntnisse, sondern eine sinnvolle Reihenfolge und ein paar ruhige Minuten am Tag. Diese Anleitung zeigt, wie Buchstaben, Lesen, Tadschwid, kurze Suren und Wiederholung aufeinander aufbauen, ob Sie als Erwachsener neu beginnen, Ihr Kind begleiten oder gerade Muslim geworden sind.",
    answer: "Den Koran lernen Sie am besten in fester Reihenfolge: zuerst die arabischen Buchstaben und Vokalzeichen, dann flüssiges Lesen mit Hörbegleitung, danach die wichtigsten Tadschwid-Regeln, die kurzen Suren und eine tägliche Wiederholung. Quran Masterclass bietet dafür einen Lesekurs, einen Tadschwid-Kurs und alle 114 Suren mit Rezitation, Übersetzung und Tafsir. Die Website ist kostenlos, die iOS-App nutzt dasselbe Konto.",
    sections: [
      {
        h2: "Koran lesen lernen für Erwachsene: zuerst die Schrift",
        p: [
          "Das Fundament sind die 28 Buchstaben des arabischen Alphabets, ihre Formen am Wortanfang, in der Mitte und am Ende sowie die Vokalzeichen Fatha, Kasra und Damma. Für Erwachsene ist das meist weniger schwierig als befürchtet, weil viele Laute im Deutschen eine Entsprechung haben und nur einige Kehllaute wirklich neu sind.",
          "Der Lesekurs auf Quran Masterclass führt in acht Einheiten von den einzelnen Buchstaben über das Verbinden, kurze und lange Vokale, Tanwin, Sukun und Schadda bis zu den besonderen Zeichen im Koran. Danach lesen Sie echte Koranwörter und schließlich ganze Verse. Jeder Buchstabe wird mit einem deutschen Vergleichslaut erklärt, wo es einen gibt.",
          "Planen Sie für diese Phase einige Wochen mit täglicher Übung ein. Zehn Minuten jeden Tag bringen in der Regel mehr als eine lange Stunde am Wochenende.",
        ],
        links: [["/arabic/read", "Lesekurs: Arabisch lesen"], ["/arabic", "Arabisch für den Koran"], ["/guides/learn-to-read-the-quran", "Ratgeber: Koran lesen lernen"]],
      },
      {
        h2: "Hören und mitlesen: vom Buchstabieren zum flüssigen Lesen",
        p: [
          "Sobald Sie einzelne Wörter entziffern können, beginnt die wichtigste Übungsphase. Öffnen Sie eine Sure, spielen Sie einen Vers ab und folgen Sie dem Text: Jedes Wort leuchtet auf, während es rezitiert wird, sodass sich Schrift und Klang verbinden. Lautschrift und Übersetzung blenden Sie ein, solange Sie sie brauchen.",
          "Stellen Sie das Tempo langsamer, wenn Ihnen ein Rezitator zu schnell ist, und nutzen Sie die Pause zum Nachsprechen: Nach jedem Vers bleibt Ihnen so viel Zeit, wie der Vers gedauert hat, um ihn selbst laut zu lesen. Ruhige, deutliche Stimmen wie Mahmoud Khalil al-Husary oder Mohamed Siddiq al-Minshawi sind dafür gut geeignet.",
        ],
        links: [["/quran", "Alle 114 Suren"], ["/reciters", "Rezitatoren vergleichen"], ["/listen-quran", "Koran hören"]],
      },
      {
        h2: "Tadschwid von Anfang an, aber in kleinen Portionen",
        p: [
          "Tadschwid beschreibt, wie jeder Buchstabe korrekt ausgesprochen wird und wie Laute ineinander übergehen. Sie müssen nicht alle Regeln beherrschen, bevor Sie Suren lesen. Es hilft aber, früh die Aussprachestellen kennenzulernen, damit sich keine falschen Gewohnheiten festsetzen.",
          "Der Tadschwid-Kurs folgt der verbreiteten Lesart Hafs nach Asim und umfasst 14 Lektionen in drei Stufen, jeweils mit Beispielen aus dem Koran und einem kurzen Quiz. Ein guter Rhythmus ist eine neue Regel pro Woche, die Sie gleich an der Sure üben, die Sie gerade lesen.",
        ],
        links: [["/tajweed", "Tadschwid-Kurs"], ["/tajweed/makharij", "Aussprachestellen"], ["/tajweed-online", "Tadschwid online lernen"]],
      },
      {
        h2: "Mit welcher Sure fange ich an?",
        p: [
          "Die meisten beginnen mit al-Fatiha, der ersten Sure, weil sie in jedem Gebet rezitiert wird und nur sieben Verse hat. Danach bieten sich die kurzen Suren am Ende des Korans an, etwa al-Ikhlas (Sure 112), al-Falaq (Sure 113) und an-Nas (Sure 114). Sie sind kurz, oft gehört und schnell vertraut.",
          "Wer weitergehen möchte, arbeitet sich durch Juz Amma, den 30. Teil des Korans mit den Suren 78 bis 114. Die Academy ist genau so aufgebaut: erst al-Fatiha und die kürzesten Suren, dann Juz Amma in zwei Teilen, danach beliebte längere Suren und schließlich der ganze Koran, jede Lektion mit einem kurzen Test.",
        ],
        links: [["/surah/1", "Sure 1: al-Fatiha"], ["/surah/112", "Sure 112: al-Ikhlas"], ["/academy", "Academy-Lernpfad"], ["/guides/juz-amma-learning-plan", "Lernplan Juz Amma"]],
      },
      {
        h2: "Koran lernen ohne Arabischkenntnisse: die Bedeutung erschließen",
        p: [
          "Lesen und Verstehen sind zwei verschiedene Fertigkeiten. Viele Muslime rezitieren den Koran korrekt, ohne Arabisch zu sprechen, und erschließen die Bedeutung über eine Übersetzung. Wer mehr will, nutzt die Wort-für-Wort-Ansicht: Unter jedem arabischen Wort steht seine Bedeutung, sodass Sie wiederkehrende Begriffe nach und nach erkennen.",
          "Genau diese häufigen Wörter trainieren die Koran-Vokabeln mit Karteikarten und Quiz; gewusste Wörter kommen nach 1, 2, 4, 8 und 16 Tagen zurück. Für Hintergründe zu einzelnen Versen steht der Tafsir direkt neben dem Text.",
        ],
        links: [["/vocab", "Koran-Vokabeln"], ["/quran-tafsir", "Koran Tafsir"], ["/guides/learn-quranic-arabic-vocabulary", "Ratgeber: Koran-Wortschatz"]],
      },
      {
        h2: "Koran lernen für Kinder, Erwachsene und Neumuslime",
        p: [
          "Kinder lernen am besten spielerisch und in kurzen Einheiten. Der Kinder-Modus zeigt große Farben, einfache Knöpfe und Sterne als Belohnung. Setzen Sie sich trotzdem dazu: Gemeinsames Hören und Nachsprechen hilft Kindern, dranzubleiben.",
          "Erwachsene bringen Disziplin und Verständnis mit, haben aber weniger Zeit; für sie zählt eine feste Uhrzeit, etwa nach dem Morgengebet. Neumuslime beginnen sinnvollerweise mit al-Fatiha und den kurzen Suren für das Gebet und lernen das Lesen parallel. Für Frauen gibt es eine eigene Seite dazu, wie das Lernen an den Tagen der Menstruation weitergehen kann, mit den Sichtweisen der Rechtsschulen.",
        ],
        links: [["/guides/quran-for-kids", "Koran für Kinder"], ["/learn-salah", "Gebet lernen"], ["/sisters", "Für Schwestern"]],
      },
      {
        h2: "Koran lernen Tagesplan: 15 Minuten, die tragen",
        p: [
          "Ein realistischer Tagesplan für Berufstätige hat drei Teile: fünf Minuten Wiederholung des Vortags, fünf bis acht Minuten Neues und zwei Minuten bewusstes Hören zum Abschluss. Wichtiger als die genaue Aufteilung ist, dass die Einheit jeden Tag stattfindet.",
          "Mit einem kostenlosen Konto speichert Quran Masterclass Fortschritt, Lesezeichen und Notizen und zeigt auf der Seite Heute, was gerade dran ist. Website und iOS-App nutzen dasselbe Konto, sodass Sie morgens am Handy beginnen und abends am Computer weitermachen. Wer den ganzen Koran lesen möchte, verteilt ihn mit dem Khatm-Planer auf 30, 60 oder 365 Tage.",
        ],
        links: [["/today", "Heute-Ansicht"], ["/khatm", "Khatm-Planer"], ["/guides/daily-quran-routine", "Tägliche Koran-Routine"]],
      },
    ],
    stepsTitle: "Ihr erster Monat in sechs Schritten",
    steps: [
      { title: "Buchstaben lernen", body: "Gehen Sie die 28 Buchstaben und ihre Formen durch, jeden Tag einige, bis Sie sie sicher erkennen." },
      { title: "Vokalzeichen üben", body: "Lesen Sie Silben und kurze Wörter mit Fatha, Kasra und Damma, danach lange Vokale und Schadda." },
      { title: "Al-Fatiha hören und mitlesen", body: "Spielen Sie Vers für Vers ab, verlangsamen Sie das Tempo und lesen Sie laut mit." },
      { title: "Eine Tadschwid-Regel pro Woche", body: "Beginnen Sie mit den Aussprachestellen und wenden Sie jede Regel sofort auf Ihre Sure an." },
      { title: "Bedeutung nachschlagen", body: "Lesen Sie Übersetzung und Wort-für-Wort-Bedeutung, bei Interesse auch den Tafsir." },
      { title: "Feste Zeit und Wiederholung", body: "Lernen Sie täglich zur gleichen Zeit und beginnen Sie jede Einheit mit einer kurzen Wiederholung des Vortags." },
    ],
    faqTitle: "Häufige Fragen zum Koranlernen",
    faq: [
      { q: "Kann man den Koran alleine lernen?", a: "Lesen, Hören, Wortschatz und die Grundlagen des Tadschwid können Sie gut selbstständig üben. Für die Feinheiten der Aussprache ist es dennoch wertvoll, Ihre Rezitation gelegentlich von einer kundigen Lehrerin oder einem kundigen Lehrer anhören zu lassen, etwa in einer Moschee in Ihrer Nähe." },
      { q: "Wie lange dauert es, den Koran lesen zu lernen?", a: "Das hängt von Ihrer Übungszeit und Ihren Vorkenntnissen ab. Viele Erwachsene lesen nach einigen Wochen regelmäßiger Übung langsam, flüssiges Lesen braucht meist Monate. Ein verbindliches Zeitversprechen gibt es nicht." },
      { q: "Kann ich den Koran ohne Arabischkenntnisse lernen?", a: "Ja. Zum Lesen genügt die Schrift, zum Verstehen helfen Übersetzung, Lautschrift und Wort-für-Wort-Ansicht. Die Sprache selbst können Sie später schrittweise vertiefen." },
      { q: "Mit welcher Sure fange ich an?", a: "Mit al-Fatiha und den kurzen Suren am Ende des Korans, etwa Sure 112 bis 114. Sie werden im Gebet gebraucht und sind schnell vertraut." },
      { q: "Ist Quran Masterclass kostenlos?", a: "Die Website ist kostenlos, ohne Abo und ohne Werbung. Ein Konto brauchen Sie nur, wenn Sie Fortschritt, Lesezeichen und Wiederholungen speichern möchten." },
      { q: "Gibt es eine App zum Koranlernen?", a: "Ja, eine iOS-App, die dasselbe Konto wie die Website nutzt. Ihr Stand ist dadurch auf allen Geräten gleich." },
      { q: "Wer steht hinter Quran Masterclass?", a: "Betrieben wird die Plattform von ICSL FZE – Islamic Coding & Software Lab in Sharjah. Die Shams-Methode zum Auswendiglernen hat der Gründer Nami Shams entwickelt. Koran-Text, Übersetzungen und Tafsir kommen über Quran.com und werden mit Quellenangabe gezeigt." },
    ],
    linksTitle: "Weiterlesen und ausprobieren",
    links: [["/quran", "Koran lesen und hören"], ["/arabic/read", "Arabisch lesen lernen"], ["/tajweed", "Tadschwid-Kurs"], ["/academy", "Academy"], ["/shams", "Shams-Methode"], ["/guides/how-to-learn-the-quran", "Ratgeber: Koran lernen"], ["/courses", "Kurse"], ["/app", "iOS-App"]],
    cta: ["/arabic/read", "Kostenlos mit dem Lesen beginnen"],
  },

  "quran-tafsir": {
    title: "Koran Tafsir: Verse verstehen und erklären lassen",
    description: "Was ist Tafsir und wie nutzen Sie ihn? Lesen Sie den Kommentar direkt neben dem Vers, mit Übersetzung und Wort-für-Wort-Bedeutung. Kostenlos.",
    kicker: "Koran Tafsir",
    h1: "Koran Tafsir: Den Text verstehen, nicht nur lesen",
    intro: "Mit Koran Tafsir ist die Auslegung des Korans gemeint: die Erklärung dessen, was eine Übersetzung offenlässt. In welchem Zusammenhang steht ein Vers, was bedeuten seine Wörter genau, und wie haben Gelehrte ihn verstanden? Hier erfahren Sie, wie Sie Tafsir sinnvoll lesen, welche Traditionen es gibt und wie Sie ihn Sure für Sure in Ihren Alltag einbauen.",
    answer: "Tafsir ist die Auslegung des Korans: Er erklärt Zusammenhang, Wortbedeutungen, Anlass der Offenbarung und das Verständnis der Gelehrten zu jedem Vers. Bei Quran Masterclass lesen Sie den Tafsir direkt neben dem Vers, zusammen mit arabischem Text, deutscher Übersetzung, Wort-für-Wort-Bedeutung und Rezitation, für alle 114 Suren und mit Quellenangabe. Die Website ist kostenlos, die iOS-App nutzt dasselbe Konto.",
    sections: [
      {
        h2: "Was ist Tafsir?",
        p: [
          "Das arabische Wort Tafsir bedeutet Erklärung oder Offenlegung. Gemeint ist eine eigene Wissenschaft, die sich seit den ersten Generationen der Muslime entwickelt hat. Ein Tafsir-Werk geht den Koran Vers für Vers durch und erläutert, was der Text sagt, wie er sprachlich gebaut ist und wie er mit anderen Stellen zusammenhängt.",
          "Klassische Ausleger stützen sich dabei auf mehrere Quellen: andere Koranverse, die Überlieferungen vom Propheten und seinen Gefährten, in der schiitischen Tradition auch von den Imamen aus der Familie des Propheten, dazu die arabische Sprache und das Wissen über die Umstände der Offenbarung. Wie diese Quellen gewichtet werden, unterscheidet die einzelnen Werke.",
        ],
        links: [["/islam/quran", "Der Koran im Islam"], ["/guides/understanding-the-quran-tafsir", "Ratgeber: Koran mit Tafsir verstehen"]],
      },
      {
        h2: "Unterschied zwischen Übersetzung und Tafsir",
        p: [
          "Jede Übersetzung ist bereits eine Deutung, denn sie muss sich für eine Bedeutung entscheiden, wo das Arabische mehrere zulässt. Sie ist kurz und gut lesbar, kann aber Mehrdeutigkeiten, Wortspiele und Bezüge kaum abbilden. Deshalb sprechen viele Muslime lieber von einer Übertragung der Bedeutungen als von einer Übersetzung des Korans.",
          "Der Tafsir füllt diese Lücke. Er nennt die Bedeutungsmöglichkeiten eines Wortes, erklärt, auf wen sich ein Fürwort bezieht, und zeigt, warum Gelehrte einen Vers so oder anders verstanden haben. Lesen Sie beides nebeneinander: die Übersetzung für den Überblick, den Tafsir für die Tiefe.",
        ],
        links: [["/quran", "Koran mit Übersetzung"], ["/vocab", "Koran-Wortschatz"]],
      },
      {
        h2: "Koran Auslegung Vers für Vers auf Quran Masterclass",
        p: [
          "Öffnen Sie eine Sure und tippen Sie bei einem Vers auf Tafsir. Die Erklärung erscheint direkt daneben, mit Angabe der Quelle; gilt ein Kommentar für mehrere Verse zugleich, wird das angezeigt. Darüber sehen Sie arabischen Text, Lautschrift, Wort-für-Wort-Bedeutung und die deutsche Übersetzung von Bubenheim und Elyas.",
          "Die Tafsir-Texte kommen über Quran.com. Für Deutsch gibt es dort bislang keinen eigenen Tafsir, deshalb erscheinen englische Werke, darunter eine gekürzte Fassung des Tafsir von Ibn Kathir. Eigene, redaktionell freigegebene Erläuterungen sind gekennzeichnet, auch wenn sie KI-gestützt entstanden sind. Ohne Konto gilt ein tägliches Tafsir-Limit; mit einem kostenlosen Konto lesen Sie weiter.",
        ],
        links: [["/surah/1", "Sure 1 mit Tafsir"], ["/search", "Vers suchen"]],
      },
      {
        h2: "Tafsir zu einer Sure: Schritt für Schritt studieren",
        p: [
          "Wer eine ganze Sure verstehen möchte, beginnt mit dem Überblick: Wovon handelt sie, wurde sie in Mekka oder Medina offenbart, wie ist sie aufgebaut? Danach lesen Sie in kleinen Abschnitten von drei bis fünf Versen und notieren Begriffe, die mehrfach auftauchen.",
          "Gute Einstiegssuren sind al-Fatiha (Sure 1), al-Mulk (Sure 67) und Ya-Sin (Sure 36): überschaubar und oft gelesen, sodass Sie Gelerntes schnell wiedererkennen. Im Bereich der Shams-Methode finden Sie zu Suren außerdem eine Seite zum Nachdenken (Tadabbur) mit zentralem Thema, Aufbau, Lehren und Fragen zur Reflexion.",
        ],
        links: [["/surah/67", "Sure 67: al-Mulk"], ["/surah/36", "Sure 36: Ya-Sin"], ["/shams/method", "Shams-Methode 2.0"]],
      },
      {
        h2: "Klassische und moderne Tafsir-Werke",
        p: [
          "Zu den bekanntesten klassischen Werken der sunnitischen Tradition gehören die Kommentare von at-Tabari, al-Qurtubi und Ibn Kathir. At-Tabari sammelt die frühen Überlieferungen sehr umfassend, al-Qurtubi legt einen Schwerpunkt auf rechtliche Fragen, Ibn Kathir erklärt den Koran vor allem durch andere Verse und Überlieferungen.",
          "Moderne Kommentare aus dem 19. und 20. Jahrhundert stellen oft andere Fragen: Wie spricht der Text Menschen heute an, welche ethischen und gesellschaftlichen Botschaften stehen im Vordergrund? Sie ersetzen die klassischen Werke nicht, sondern ergänzen sie. Für Einsteiger lohnt es sich, einen klassischen und einen zugänglichen modernen Kommentar nebeneinander zu lesen.",
        ],
        links: [["/courses", "Kurse zu Tafsir und Hadith"]],
      },
      {
        h2: "Koran Tafsir sunnitisch und schiitisch",
        p: [
          "Auch die schiitische Tradition hat eine reiche Tafsir-Literatur. Bekannt sind etwa Madschma al-Bayan von at-Tabarsi aus dem 12. Jahrhundert und al-Mizan von Allama Tabatabai aus dem 20. Jahrhundert, der den Koran konsequent durch den Koran selbst erklärt. Schiitische Ausleger beziehen zusätzlich die Überlieferungen der Imame ein.",
          "Sunnitische und schiitische Kommentare stimmen in sehr vielen Erklärungen überein und setzen an manchen Stellen unterschiedliche Schwerpunkte, etwa bei Versen über die Familie des Propheten oder über Fragen der Führung. Die auf Quran Masterclass angezeigten Werke stammen derzeit aus dem Angebot von Quran.com. Welcher Auslegung Sie folgen, richtet sich nach Ihrer Schule; bei Rechtsfragen ersetzt kein Tafsir das Gespräch mit einer kundigen Person Ihrer Richtung.",
        ],
        links: [["/islam/madhahib", "Rechtsschulen im Überblick"], ["/nahj", "Nahdsch al-Balagha"]],
      },
    ],
    stepsTitle: "So lesen Sie Tafsir mit Gewinn",
    steps: [
      { title: "Sure auswählen", body: "Beginnen Sie mit einer kurzen oder vertrauten Sure und verschaffen Sie sich einen Überblick über ihr Thema." },
      { title: "Vers hören", body: "Hören Sie den Vers in der Rezitation, bevor Sie etwas nachlesen." },
      { title: "Übersetzung lesen", body: "Lesen Sie die deutsche Übersetzung und notieren Sie, was Ihnen unklar bleibt." },
      { title: "Schlüsselwörter ansehen", body: "Prüfen Sie in der Wort-für-Wort-Ansicht die wichtigsten Begriffe und ihre Grundbedeutung." },
      { title: "Tafsir lesen", body: "Lesen Sie die Erklärung mit Quelle und achten Sie auf Zusammenhang und Anlass." },
      { title: "Notieren und wiederhören", body: "Schreiben Sie einen Satz in Ihre Notiz am Vers und hören Sie ihn mit dem neuen Wissen noch einmal." },
    ],
    faqTitle: "Fragen zum Tafsir",
    faq: [
      { q: "Was ist Tafsir?", a: "Tafsir ist die Auslegung des Korans, also die wissenschaftliche Erklärung des Textes: Sprache, Zusammenhang, Anlass der Offenbarung und das Verständnis der Gelehrten." },
      { q: "Was ist der Unterschied zwischen Übersetzung und Tafsir?", a: "Die Übersetzung gibt den Sinn knapp in Ihrer Sprache wieder. Der Tafsir erklärt, warum ein Vers so verstanden wird, welche Bedeutungen ein Wort haben kann und in welchem Zusammenhang er steht." },
      { q: "Gibt es den Tafsir Ibn Kathir auf Deutsch?", a: "Auf Quran Masterclass erscheint eine gekürzte englische Fassung des Tafsir von Ibn Kathir, weil Quran.com bislang keinen deutschen Tafsir anbietet. Oberfläche und Koranübersetzung sind auf Deutsch." },
      { q: "Was bedeutet Asbab an-Nuzul?", a: "So heißen die Überlieferungen über den Anlass, zu dem ein Vers offenbart wurde. Sie helfen, einen Vers in seinem Zusammenhang zu verstehen. Nicht zu jedem Vers ist ein Anlass überliefert, und Gelehrte bewerten die Überlieferungen unterschiedlich." },
      { q: "Welcher Tafsir ist der richtige?", a: "Es gibt nicht den einen Tafsir. Die Werke unterscheiden sich in Methode, Zeit und Schule. Welche Auslegung Sie heranziehen, hängt von der Tradition ab, der Sie folgen; eine kundige Person Ihrer Richtung kann Ihnen Empfehlungen geben." },
      { q: "Brauche ich Arabischkenntnisse für Tafsir?", a: "Nein. Übersetzung, Wort-für-Wort-Ansicht und Tafsir sind auch ohne Arabisch nutzbar. Mit der Zeit erkennen Sie wichtige Begriffe auch im Original." },
      { q: "Ist der Tafsir kostenlos?", a: "Auf der Website ja. Ohne Konto gilt ein tägliches Limit, mit einem kostenlosen Konto lesen Sie weiter." },
      { q: "Ist ein Tafsir ein religiöses Gutachten?", a: "Nein. Ein Tafsir erklärt den Text, ersetzt aber keine Fatwa. Für persönliche religiöse Fragen wenden Sie sich an eine Gelehrte oder einen Gelehrten Ihrer Richtung." },
    ],
    linksTitle: "Weiterlesen und ausprobieren",
    links: [["/quran", "Koran lesen und hören"], ["/surah/1", "Sure 1 mit Tafsir"], ["/surah/2", "Sure 2: al-Baqara"], ["/guides/understanding-the-quran-tafsir", "Ratgeber: Tafsir verstehen"], ["/vocab", "Koran-Wortschatz"], ["/arabic", "Arabisch für den Koran"], ["/courses", "Kurse"], ["/islam/quran", "Der Koran im Islam"]],
    cta: ["/surah/1", "Tafsir zu Sure 1 öffnen"],
  },

  "tajweed-online": {
    title: "Tadschwid online lernen: Regeln und Übungen",
    description: "Tadschwid online lernen: Aussprachestellen, Nun sakina, Mim sakina, Madd und Qalqala verständlich erklärt, mit Lektionen, Quiz und Übungen. Kostenlos.",
    kicker: "Tadschwid online",
    h1: "Tadschwid online lernen: Den Koran richtig rezitieren",
    intro: "Wer Tadschwid online lernen möchte, braucht zweierlei: verständliche Erklärungen der Regeln und viel Gelegenheit, sie an echten Versen zu hören und nachzusprechen. Diese Seite gibt Ihnen einen Überblick über die wichtigsten Regeln und eine bewährte Lernreihenfolge und zeigt, wie Sie ohne festen Lehrer sinnvoll üben und wann eine persönliche Korrektur nötig ist.",
    answer: "Tadschwid ist die Lehre von der korrekten Aussprache und Rezitation des Korans: wo jeder Buchstabe gebildet wird, wie lange Vokale gedehnt werden und wie Laute ineinander übergehen. Auf Quran Masterclass lernen Sie die Regeln in 14 Lektionen nach der Lesart Hafs nach Asim, jeweils mit Koranbeispielen, Rezitation und Quiz, und üben sie danach an echten Versen. Die Website ist kostenlos, die iOS-App nutzt dasselbe Konto.",
    sections: [
      {
        h2: "Was bedeutet Tadschwid?",
        p: [
          "Das Wort Tadschwid stammt von einer arabischen Wurzel, die etwas gut oder schön machen bedeutet. Gemeint ist, jedem Buchstaben sein Recht zu geben: die richtige Aussprachestelle, die passende Stärke und die korrekte Länge. Viele arabische Laute klingen für deutsche Ohren ähnlich, etwa die beiden h-Laute oder das leichte und das schwere s, und wer sie verwechselt, kann die Bedeutung eines Wortes verändern.",
          "Wie verbindlich einzelne Regeln sind, beantworten Gelehrte unterschiedlich; dazu fragen Sie am besten eine kundige Person Ihrer Schule. Unabhängig davon lernen viele Muslime Tadschwid, weil sie den Koran so rezitieren möchten, wie er überliefert wurde.",
        ],
        links: [["/tajweed", "Tadschwid-Kurs"], ["/guides/tajweed-for-beginners", "Tadschwid für Anfänger"]],
      },
      {
        h2: "Aussprache der arabischen Buchstaben: die Makharidsch",
        p: [
          "Am Anfang stehen die Aussprachestellen, die Makharidsch. Unterschieden werden fünf Hauptbereiche: der Hohlraum von Mund und Rachen für die langen Vokale, die Kehle, die Zunge, die Lippen und der Nasenraum. In der Kehle allein entstehen sechs Buchstaben auf drei Ebenen, für deutsche Muttersprachler die größte Umstellung.",
          "Üben Sie jeden Buchstaben zuerst einzeln ohne Vokal, dann in kurzen Silben, und vergleichen Sie Ihre Aussprache mit den Hörbeispielen. Dazu gehören die Regeln für schwere und leichte Buchstaben (Tafchim und Tarqiq) und für das Lam im Artikel, das je nach folgendem Buchstaben gesprochen oder angeglichen wird.",
        ],
        links: [["/tajweed/makharij", "Lektion: Makharidsch"], ["/arabic/read", "Arabisch lesen"]],
      },
      {
        h2: "Nun sakina und Tanwin: die vier Regeln",
        p: [
          "Trifft ein Nun ohne Vokal oder ein Tanwin auf einen anderen Buchstaben, gibt es vier Möglichkeiten. Vor den sechs Kehllauten wird das Nun klar gesprochen (Izhar). Vor einigen Buchstaben verschmilzt es mit dem folgenden Laut (Idgham), teils mit Nasalklang, teils ohne. Vor dem Ba wird es zu einem Mim (Iqlab). Vor den übrigen 15 Buchstaben wird es halb verborgen mit Nasalklang gesprochen (Ichfa).",
          "Diese Regeln gehören zu den häufigsten im ganzen Koran, deshalb widmet der Kurs jeder eine eigene Lektion. Lernen Sie zuerst, die Buchstabengruppen zu erkennen, und hören Sie dann, wie geübte Rezitatoren sie umsetzen.",
        ],
        links: [["/tajweed/nun-sakinah-izhar", "Lektion: Nun sakina"]],
      },
      {
        h2: "Mim sakina, Ghunna und Qalqala",
        p: [
          "Ähnlich verhält sich das Mim ohne Vokal: Vor einem Ba wird es mit Nasalklang verborgen, vor einem weiteren Mim verschmilzt es, vor allen anderen Buchstaben wird es klar gesprochen. Nun und Mim mit Schadda tragen immer eine deutliche Nasalierung, die Ghunna, von etwa zwei Zählzeiten.",
          "Die Qalqala betrifft fünf Buchstaben: Qaf, das schwere Ta, Ba, Dschim und Dal. Tragen sie kein Vokalzeichen, entsteht ein kurzer Nachhall, ein leichtes Abprallen des Lautes. Am Versende, wo Sie anhalten, ist er stärker zu hören.",
        ],
        links: [["/tajweed/mim-sakinah", "Lektion: Mim sakina"], ["/tajweed/qalqalah", "Lektion: Qalqala"]],
      },
      {
        h2: "Madd Regeln: wie lang wird gedehnt?",
        p: [
          "Madd heißt Dehnung. Die natürliche Dehnung eines langen Vokals dauert zwei Zählzeiten. Folgt ein Hamza oder ein Sukun, wird je nach Fall länger gedehnt, bis zu sechs Zählzeiten. Entscheidend ist, ob Hamza oder Sukun im selben oder im nächsten Wort stehen und ob Sie an dieser Stelle anhalten.",
          "Zählen Sie anfangs ruhig mit, etwa durch leichtes Antippen mit dem Finger, bis Sie die Längen im Gefühl haben. Zum Abschluss des Kurses lernen Sie die Regeln des Anhaltens und Wiederanfangens (Waqf und Ibtida) und lesen al-Fatiha mit allen Regeln.",
        ],
        links: [["/tajweed/madd", "Lektion: Madd"], ["/surah/1", "Sure 1 mit Tadschwid üben"]],
      },
      {
        h2: "Tadschwid ohne Lehrer lernen: Möglichkeiten und Grenzen",
        p: [
          "Vieles können Sie selbstständig lernen: die Regeln verstehen, Buchstabengruppen erkennen, Beispiele hören und nachsprechen. Auf der Übungsseite suchen Sie die Regeln in echten Versen und prüfen sich mit einem Quiz pro Sure. In der Leseansicht können Sie sich außerdem aufnehmen und Ihre Aufnahme mit dem Rezitator vergleichen; sie bleibt dabei nur in Ihrem Browser.",
          "Feine Aussprachefehler hört man an sich selbst aber oft nicht. Traditionell wird der Koran deshalb von Mund zu Ohr weitergegeben: Eine Lehrerin oder ein Lehrer hört zu und korrigiert. Nutzen Sie die Online-Übungen für die tägliche Arbeit und lassen Sie Ihre Rezitation, wenn möglich, regelmäßig von einer kundigen Person anhören. Wer tiefer einsteigen möchte, findet im Rezitationspfad zehn Stufen bis zu ganzen Suren, mit Tests und Zertifikaten.",
        ],
        links: [["/tajweed/practice", "Tadschwid üben"], ["/reciter-path", "Rezitationspfad"], ["/reciters", "Rezitatoren hören"]],
      },
    ],
    stepsTitle: "Ihr Weg durch die Tadschwid-Regeln",
    steps: [
      { title: "Lesen sicherstellen", body: "Sie sollten Buchstaben und Vokalzeichen lesen können. Falls nicht, beginnen Sie mit dem Lesekurs." },
      { title: "Aussprachestellen lernen", body: "Üben Sie jeden Buchstaben einzeln, besonders die Kehllaute und die schweren Buchstaben." },
      { title: "Nun sakina und Tanwin", body: "Lernen Sie Izhar, Idgham, Iqlab und Ichfa nacheinander, jeweils mit Beispielen." },
      { title: "Mim sakina, Ghunna, Qalqala", body: "Fügen Sie die Regeln für das Mim, die Nasalierung und den Nachhall hinzu." },
      { title: "Dehnungen zählen", body: "Üben Sie die Madd-Längen von zwei bis sechs Zählzeiten, bis sie sich natürlich anfühlen." },
      { title: "An echten Versen üben", body: "Suchen Sie die Regeln in einer kurzen Sure, rezitieren Sie sie und lassen Sie sich, wenn möglich, korrigieren." },
    ],
    faqTitle: "Fragen zum Tadschwid",
    faq: [
      { q: "Kann ich Tadschwid online kostenlos lernen?", a: "Ja. Die 14 Lektionen, die Quizfragen und die Übungen sind auf der Website kostenlos. Ein Konto brauchen Sie nur, wenn Sie Ihren Fortschritt speichern möchten." },
      { q: "Kann man Tadschwid ohne Lehrer lernen?", a: "Die Regeln und vieles an der Aussprache lassen sich selbstständig lernen. Feine Fehler hören Lernende an sich selbst aber oft nicht, deshalb ist eine gelegentliche Korrektur durch eine kundige Person sehr wertvoll." },
      { q: "Wie lange dauert es, Tadschwid zu lernen?", a: "Die wichtigsten Regeln kennen viele nach einigen Wochen. Sie sicher und flüssig anzuwenden, ist eine Sache von Monaten und regelmäßiger Übung. Verbindliche Zeitangaben gibt es nicht." },
      { q: "Was bedeuten die Farben im Koran?", a: "In manchen Koranausgaben markieren Farben Tadschwid-Regeln wie Ghunna, Qalqala oder Dehnungen. Sie sind eine Lernhilfe; welche Farbe was bedeutet, erklärt die jeweilige Ausgabe." },
      { q: "Welche Buchstaben sind Qalqala-Buchstaben?", a: "Qaf, das schwere Ta, Ba, Dschim und Dal. Ohne Vokalzeichen bekommen sie einen kurzen Nachhall." },
      { q: "Muss ich Arabisch können, um Tadschwid zu lernen?", a: "Sie sollten die arabische Schrift lesen können. Die Sprache selbst müssen Sie nicht sprechen; die Regeln werden auf Deutsch erklärt." },
      { q: "Welche Lesart wird gelehrt?", a: "Der Kurs folgt der Lesart Hafs nach Asim, die heute weltweit am weitesten verbreitet ist." },
      { q: "Ist Tadschwid Pflicht?", a: "Darauf antworten Gelehrte je nach Schule und Regel unterschiedlich. Fragen Sie dazu eine kundige Person Ihrer Richtung. Viele lernen Tadschwid unabhängig davon, um den Koran sorgfältig und schön zu rezitieren." },
    ],
    linksTitle: "Weiterlesen und ausprobieren",
    links: [["/tajweed", "Tadschwid-Kurs"], ["/tajweed/practice", "Tadschwid üben"], ["/tajweed/makharij", "Makharidsch"], ["/tajweed/madd", "Madd"], ["/tajweed/qalqalah", "Qalqala"], ["/guides/tajweed-for-beginners", "Ratgeber für Anfänger"], ["/reciter-path", "Rezitationspfad"], ["/arabic/read", "Arabisch lesen"]],
    cta: ["/tajweed", "Mit der ersten Lektion beginnen"],
  },

  "memorize-quran": {
    title: "Koran auswendig lernen: Methode und Tagesplan",
    description: "Koran auswendig lernen mit der Shams-Methode: kleine Portionen, Wiederholung nach Plan, Juz Amma zuerst und Hilfe bei ähnlichen Versen. Kostenlos.",
    kicker: "Hifz",
    h1: "Koran auswendig lernen: Methode, Plan und Wiederholung",
    intro: "Wer den Koran auswendig lernen möchte, braucht weniger ein besonderes Gedächtnis als einen verlässlichen Rhythmus aus Hören, Sprechen und Wiederholen. Diese Seite zeigt, wie ein Hifz-Plan aufgebaut ist, warum die Wiederholung wichtiger ist als das Neue, wie die Shams-Methode einen Vers in sieben Schritten verankert und warum Juz Amma ein guter Anfang ist.",
    answer: "Den Koran lernen Sie auswendig, indem Sie täglich eine kleine Portion neuer Verse hören, laut sprechen und aus dem Gedächtnis abrufen und zugleich das bereits Gelernte nach einem festen Plan wiederholen. Die Shams-Methode von Gründer Nami Shams führt jeden Vers in sieben Schritten vom Hören bis zum Abrufen und plant die Wiederholungen nach Ihren eigenen Bewertungen. Auf der Website ist sie kostenlos, die iOS-App nutzt dasselbe Konto.",
    sections: [
      {
        h2: "Wie kann man den Koran am besten auswendig lernen?",
        p: [
          "Auswendiglernen ruht auf drei Säulen: kleine Portionen, häufiges Hören und eine Wiederholung, die nie ausfällt. Viele, die aufgeben, haben sich zu viel Neues vorgenommen und die Wiederholung vernachlässigt. Nach einigen Wochen stapelt sich vergessener Stoff, und die Motivation sinkt.",
          "Legen Sie deshalb zuerst fest, wie viel Zeit Sie täglich verlässlich aufbringen können, und leiten Sie daraus die Menge ab, nicht umgekehrt. Für viele Berufstätige sind 15 bis 25 Minuten am Tag realistisch; darin haben Wiederholung und einige neue Verse Platz. Ebenso wichtig ist die Haltung: Die Seite zum Adab beschreibt, wie Lernende mit dem Koran und im Alltag umgehen, mit Quellen.",
        ],
        links: [["/guides/how-to-memorize-the-quran", "Ratgeber: Hifz"], ["/shams/adab", "Adab des Koranlernenden"]],
      },
      {
        h2: "Die Shams-Methode: sieben Schritte pro Vers",
        p: [
          "Die Shams-Methode wurde von Nami Shams entwickelt und verbindet klassische Hifz-Praxis mit Erkenntnissen aus der Sprachlernforschung. Jeder Vers durchläuft sieben Schritte: dreimal hören, rückwärts aufbauen vom letzten Wort bis zum ganzen Vers, Wort für Wort mit Bedeutung, Übersetzung mit Eselsbrücken, Tafsir, Abrufen mit verblassenden Hinweisen und zum Schluss ein eigener Gedanke in der Notiz.",
          "Der Rückwärtsaufbau ist möglich, weil Quran Masterclass den Zeitpunkt jedes rezitierten Wortes kennt und den Vers ab jedem Wort abspielen kann. So endet jede Wiederholung auf einem Teil, den Sie schon sicher können. Die Methode ist eine Lernhilfe, keine neue Auslegung: Alle Erklärungen stammen aus klassischen Tafsir-Werken.",
        ],
        links: [["/shams", "Shams-Methode"], ["/shams/method", "Shams-Methode 2.0"], ["/guides/shams-method", "Ratgeber: So funktioniert sie"]],
      },
      {
        h2: "Wie wiederholt man auswendig gelernte Suren?",
        p: [
          "In vielen Koranschulen besteht jeder Tag aus drei Teilen: dem neuen Abschnitt (Sabaq), der Wiederholung der letzten Tage (Sabqi) und der Wiederholung von älterem Stoff (Manzil). Die Shams-Methode 2.0 übernimmt dieses System und stellt Ihren täglichen Wird aus diesen drei Teilen zusammen.",
          "Wann ein Vers wiederkommt, schätzt ein Gedächtnismodell (FSRS) aus Ihren eigenen Bewertungen: anfangs nach wenigen Tagen, später nach Wochen und Monaten. Sie sagen den Vers aus dem Gedächtnis auf, decken ihn auf und bewerten sich ehrlich mit Nochmal, Gut oder Leicht. Eine Übersicht zeigt die Festigkeit Ihres Hifz über alle 604 Seiten, damit schwache Stellen sichtbar werden.",
        ],
        links: [["/today", "Heute fällige Verse"], ["/plan", "365-Tage-Plan"]],
      },
      {
        h2: "Juz Amma auswendig lernen: der bewährte Einstieg",
        p: [
          "Die meisten beginnen mit al-Fatiha und dann mit Juz Amma, dem 30. Teil des Korans mit den Suren 78 bis 114. Die Suren sind kurz, werden häufig im Gebet rezitiert, und jede abgeschlossene Sure ist ein sichtbarer Fortschritt. Üblich ist, am Ende mit an-Nas (Sure 114) zu beginnen und sich zu den längeren Suren vorzuarbeiten.",
          "Als erste kurze Suren eignen sich al-Ikhlas, al-Falaq und an-Nas, danach etwa al-Kauthar (Sure 108) und al-Asr (Sure 103). Der Lernplan für Juz Amma im Ratgeber verteilt den ganzen Teil auf überschaubare Wochenabschnitte.",
        ],
        links: [["/surah/114", "Sure 114: an-Nas"], ["/surah/112", "Sure 112: al-Ikhlas"], ["/guides/juz-amma-learning-plan", "Lernplan Juz Amma"]],
      },
      {
        h2: "Ein Hifz-Plan, der mitwächst",
        p: [
          "Der 365-Tage-Plan bietet vier Tracks: Sanft für Einsteiger und Kinder ab einem Vers am Tag, Standard für die meisten Erwachsenen, Intensiv für alle, die schneller vorankommen wollen, und den Hafiz-Track für Vollzeit-Lernende, der auf den ganzen Koran in etwa einem Jahr angelegt ist. Die tägliche Menge beginnt klein und steigt Woche für Woche.",
          "Jeder Tag hat dieselben Aufgaben: fällige Verse wiederholen, neue Verse mit der Shams-Methode lernen, die Verse von heute und gestern zu einer Kette verbinden, einen kurzen Test in der Academy machen und abends noch einmal hören. Fallen Sie zurück, zeigt der Plan den Rückstand an; holen Sie ihn nach, bevor Sie mehr hinzunehmen.",
        ],
        links: [["/plan", "Lernplan wählen"], ["/academy", "Academy-Tests"]],
      },
      {
        h2: "Ähnliche Verse nicht verwechseln",
        p: [
          "Je mehr Sie auswendig können, desto häufiger begegnen Ihnen Verse, die fast gleich lauten und sich nur in einem Wort unterscheiden. Diese Mutaschabihat sind eine der häufigsten Fehlerquellen, auch bei Fortgeschrittenen.",
          "Der Trainer für ähnliche Verse stellt solche Stellen nebeneinander, markiert die abweichenden Wörter und übt sie im Wechsel, bis Sie sie sicher unterscheiden. Zusätzlich sammelt die Shams-Methode Verse und Wörter, bei denen Sie wiederholt stocken, und legt sie Ihnen gezielt zur Festigung vor.",
        ],
        links: [["/shams/mutashabihat", "Ähnliche Verse üben"]],
      },
      {
        h2: "Koran vergessen: was tun?",
        p: [
          "Vergessen gehört zum Auswendiglernen dazu. Reagieren Sie früh: Hören Sie die Stelle mehrmals, sprechen Sie sie mit und holen Sie sie für einige Tage in die enge Wiederholung zurück. Wer nach langer Pause neu beginnt, startet mit der Wiederholung statt mit neuem Stoff, bis die vertrauten Suren wieder sitzen.",
          "Hören im Alltag hilft zusätzlich, etwa das Koran Radio mit dem Juz-Amma-Sender auf dem Weg zur Arbeit. Und wenn möglich: Rezitieren Sie regelmäßig vor einer Lehrerin oder einem Lehrer. Über die Lehreransicht teilen Sie Ihren Fortschritt per Code, nur zum Lesen.",
        ],
        links: [["/quran-radio", "Koran Radio online"], ["/listen-quran", "Koran hören"]],
      },
    ],
    stepsTitle: "Ein Tag mit der Shams-Methode",
    steps: [
      { title: "Zuerst wiederholen", body: "Beginnen Sie mit den Versen, die heute fällig sind, und sagen Sie sie aus dem Gedächtnis auf." },
      { title: "Neuen Abschnitt hören", body: "Hören Sie die neuen Verse mehrmals und schauen Sie dabei auf den arabischen Text." },
      { title: "Rückwärts aufbauen", body: "Sprechen Sie vom letzten Wort aus mit, bis der ganze Vers sitzt." },
      { title: "Bedeutung verankern", body: "Sehen Sie sich Wörter, Übersetzung und Tafsir an und notieren Sie eine Eselsbrücke." },
      { title: "Abrufen und bewerten", body: "Rezitieren Sie ohne Text, decken Sie auf und bewerten Sie sich ehrlich." },
      { title: "Kette und Abendhören", body: "Verbinden Sie die Verse von heute mit denen von gestern und hören Sie sie abends noch einmal." },
    ],
    faqTitle: "Fragen zum Auswendiglernen",
    faq: [
      { q: "Wie lange dauert es, den Koran auswendig zu lernen?", a: "Das lässt sich nicht seriös pauschal beantworten. Es hängt von der täglichen Zeit, den Vorkenntnissen, der Wiederholung und der Begleitung ab. Der Hafiz-Track ist auf etwa ein Jahr angelegt, setzt aber Vollzeit-Lernen und am besten einen Lehrer voraus." },
      { q: "Kann ich den Koran als Erwachsener auswendig lernen?", a: "Ja. Erwachsene lernen anders als Kinder, bringen aber Verständnis und Disziplin mit. Kleine Portionen und eine verlässliche Wiederholung sind für sie besonders wichtig." },
      { q: "Kann man den Koran ohne Lehrer auswendig lernen?", a: "Vieles können Sie selbstständig üben, auch mit den Prüffunktionen der Website. Für die Aussprache und für das vollständige Hifz arbeiten viele dennoch mit einer Lehrerin oder einem Lehrer, die Fehler hören, die man selbst überhört." },
      { q: "Welche kurzen Suren eignen sich zum Auswendiglernen?", a: "Üblich sind al-Fatiha und die Suren am Ende von Juz Amma, etwa an-Nas, al-Falaq, al-Ikhlas, al-Kauthar und al-Asr." },
      { q: "Wie viele Verse sollte ich pro Tag lernen?", a: "So viele, wie Sie neben der Wiederholung sicher schaffen. Für viele sind ein bis drei neue Verse ein guter Anfang. Steigern Sie erst, wenn Ihre Wiederholungen keinen Rückstand haben." },
      { q: "Was mache ich, wenn ich Gelerntes vergesse?", a: "Das ist normal. Hören Sie die Stelle erneut, sprechen Sie sie mit und holen Sie sie für einige Tage in die enge Wiederholung zurück." },
      { q: "Kann mich die Website beim Rezitieren prüfen?", a: "Ja, mit Rezitieren und prüfen in der Leseansicht: Die Spracherkennung Ihres Browsers vergleicht Ihre Rezitation Wort für Wort mit dem Text; dabei verarbeiten Google oder Apple die Aufnahme. Geprüft werden die Wörter, nicht die Feinheiten des Tadschwid." },
      { q: "Ist die Shams-Methode kostenlos?", a: "Auf der Website ja. Die iOS-App nutzt dasselbe Konto, sodass Fortschritt und Wiederholungen auf allen Geräten gleich sind." },
    ],
    linksTitle: "Weiterlesen und ausprobieren",
    links: [["/shams", "Shams-Methode"], ["/shams/method", "Shams-Methode 2.0"], ["/plan", "365-Tage-Plan"], ["/shams/mutashabihat", "Ähnliche Verse"], ["/academy", "Academy"], ["/guides/how-to-memorize-the-quran", "Ratgeber Auswendiglernen"], ["/guides/juz-amma-learning-plan", "Juz-Amma-Plan"], ["/reciters", "Rezitatoren"], ["/app", "iOS-App"]],
    cta: ["/shams", "Mit der Shams-Methode beginnen"],
  },

  "quran-radio": {
    title: "Koran Radio online: Rezitation rund um die Uhr",
    description: "Koran Radio online: ganzer Koran, Juz Amma, Al-Kahf, Ya-Sin und Themensender, mit Text, Übersetzung und Schlaf-Timer. Kostenlos im Browser.",
    kicker: "Koran Radio",
    h1: "Koran Radio online: Rezitation am Stück hören",
    intro: "Das Koran Radio online von Quran Masterclass ist für Momente gedacht, in denen Sie nicht auswählen, sondern einfach zuhören möchten: beim Kochen, auf dem Weg zur Arbeit oder am Abend. Sie wählen einen Sender, und die Rezitation läuft ohne Unterbrechung weiter, auf Wunsch mit Text und Übersetzung auf dem Bildschirm.",
    answer: "Das Koran Radio von Quran Masterclass spielt Koran-Rezitationen ohne Unterbrechung ab, kostenlos und direkt im Browser. Sie wählen zwischen Sendern wie dem ganzen Koran von Sure 1 bis 114, Juz Amma, einzelnen Suren wie Al-Kahf oder Ya-Sin und Themensendern und stellen Rezitator, Schlaf-Timer sowie Text und Übersetzung ein. Es handelt sich um fortlaufend abgespielte Aufnahmen bekannter Rezitatoren, nicht um eine Live-Übertragung aus einer Moschee.",
    sections: [
      {
        h2: "Koran Radio live hören: wie das Radio funktioniert",
        p: [
          "Ein Sender ist eine Abfolge von Suren, die nie endet: Ist die letzte Sure erreicht, beginnt er von vorn oder wählt die nächste Sure zufällig. Sie drücken einmal auf Abspielen und müssen danach nichts mehr tun. Die gerade gespielte Sure und die zuletzt gehörten Verse sehen Sie jederzeit.",
          "Auch wenn die Anzeige von einem laufenden Sender spricht, ist das Radio keine Live-Übertragung, sondern eine fortlaufende Wiedergabe von Aufnahmen. Das hat Vorteile: Sie springen zum vorigen oder nächsten Vers, wechseln zur nächsten Sure oder öffnen die gerade gespielte Sure mit einem Tipp in der Leseansicht.",
        ],
        links: [["/radio", "Radio starten"]],
      },
      {
        h2: "Die Sender im Überblick",
        p: [
          "Die Hauptsender spielen den ganzen Koran von Sure 1 bis 114, Juz Amma mit den kurzen Suren 78 bis 114 oder Juz Tabarak, den 29. Teil. Der Sender Juz des Tages spielt jeden Tag einen anderen der 30 Teile, sodass Sie in 30 Tagen einmal den ganzen Koran hören, etwa im Ramadan.",
          "Dazu kommen Themensender: für Kinder mit den Suren, die Kinder zuerst lernen, für den Freitag mit Al-Kahf, für den Abend, mit Geschichten der Propheten oder mit Suren, die Trost spenden. Einzelne Suren wie Ya-Sin, Ar-Rahman, Al-Mulk, Al-Waqia, Maryam oder Yusuf laufen als eigene Sender in Dauerschleife.",
        ],
        links: [["/surah/18", "Sure 18: Al-Kahf"], ["/surah/36", "Sure 36: Ya-Sin"], ["/surah/55", "Sure 55: Ar-Rahman"]],
      },
      {
        h2: "Koran Radio mit Mishary Alafasy und anderen Stimmen",
        p: [
          "In den Einstellungen wählen Sie Ihren Rezitator, zum Beispiel Mishary Alafasy, Abdul Basit Abdus-Samad, Mahmoud Khalil al-Husary oder Mohamed Siddiq al-Minshawi. Wer Abwechslung mag, nutzt die Sender mit wechselnden Stimmen: Dort rezitiert für jede Sure ein anderer Rezitator.",
          "So bekommen Sie mit der Zeit ein Gefühl für unterschiedliche Stile, vom gleichmäßigen Murattal bis zum melodisch ausgestalteten Mudschawwad. Porträts der Stimmen und Hinweise zu ihren bekanntesten Aufnahmen finden Sie auf der Rezitatorenseite.",
        ],
        links: [["/reciters", "Rezitatoren"]],
      },
      {
        h2: "Koran Radio zum Einschlafen und Entspannen",
        p: [
          "Viele hören am Abend Rezitation, um zur Ruhe zu kommen. Der Sender Vor dem Schlafen spielt As-Sadschda, Al-Mulk und die drei letzten Suren des Korans, die viele traditionell am Abend lesen. Mit dem Schlaf-Timer endet die Wiedergabe nach der gewählten Zeit, sodass das Radio nicht die ganze Nacht läuft.",
          "Wählen Sie eine leise Lautstärke und eine ruhige Stimme; die Wiedergabe läuft auch bei gesperrtem Bildschirm weiter. Wer tagsüber zur Ruhe kommen möchte, findet im Sender Trost die Suren Ad-Duha, Asch-Scharh und Yusuf.",
        ],
        links: [["/surah/67", "Sure 67: Al-Mulk"], ["/surah/32", "Sure 32: As-Sadschda"]],
      },
      {
        h2: "Koran im Hintergrund hören beim Arbeiten",
        p: [
          "Das Radio ist ein guter Begleiter bei Hausarbeit, Sport oder am Schreibtisch. Für Fahrten eignen sich Sender mit kurzen Suren, weil Sie nach einer Unterbrechung schnell wieder hineinfinden. Stellen Sie den Sender vor der Fahrt ein und schauen Sie unterwegs nicht auf den Bildschirm.",
          "Wer nebenbei lernen möchte, blendet zu Hause Text und Übersetzung ein. Fällt Ihnen ein Vers besonders auf, öffnen Sie die Sure später in der Leseansicht und lesen dort Übersetzung und Tafsir nach.",
        ],
        links: [["/quran", "Sure in der Leseansicht"], ["/search", "Vers suchen"]],
      },
      {
        h2: "Radio oder gezieltes Hören: was passt wann?",
        p: [
          "Das Radio ist zum Zuhören und Zur-Ruhe-Kommen gedacht. Wer lernen oder auswendig lernen will, ist mit der Leseansicht besser bedient: Dort hören Sie Vers für Vers, wiederholen einzelne Verse, spielen einen Abschnitt in Schleife und lassen nach jedem Vers eine Pause zum Nachsprechen.",
          "Beides ergänzt sich gut. Viele hören neu gelernte Suren abends noch einmal im Radio, etwa über den Juz-Amma-Sender, und festigen sie so ohne zusätzlichen Aufwand.",
        ],
        links: [["/listen-quran", "Koran hören Vers für Vers"], ["/memorize-quran", "Koran auswendig lernen"]],
      },
      {
        h2: "Koran Radio auf dem Handy hören",
        p: [
          "Das Radio läuft im Browser auf Handy, Tablet und Computer, ohne Installation und ohne Anmeldung. Auf dem iPhone können Sie zusätzlich die iOS-App nutzen, die dasselbe Konto wie die Website verwendet; wer die Website als App auf dem Startbildschirm installiert, öffnet das Radio mit einem Tipp.",
          "Streaming verbraucht Datenvolumen. Nutzen Sie nach Möglichkeit WLAN, besonders wenn das Radio über Stunden läuft.",
        ],
        links: [["/app", "iOS-App und Installation"]],
      },
    ],
    stepsTitle: "So nutzen Sie das Koran Radio",
    steps: [
      { title: "Radio öffnen", body: "Rufen Sie die Radioseite auf, ganz ohne Anmeldung." },
      { title: "Sender wählen", body: "Entscheiden Sie sich für den ganzen Koran, Juz Amma, eine einzelne Sure oder einen Themensender." },
      { title: "Rezitator einstellen", body: "Wählen Sie eine Stimme oder lassen Sie für jede Sure eine andere spielen." },
      { title: "Text einblenden", body: "Schalten Sie bei Bedarf Text und Übersetzung ein, um mitzulesen." },
      { title: "Schlaf-Timer setzen", body: "Legen Sie am Abend fest, nach wie vielen Minuten die Wiedergabe endet." },
      { title: "Gehörtes vertiefen", body: "Öffnen Sie eine Sure, die Sie berührt hat, später in der Leseansicht mit Tafsir." },
    ],
    faqTitle: "Fragen zum Koran Radio",
    faq: [
      { q: "Ist das Koran Radio kostenlos?", a: "Ja. Das Radio ist kostenlos und läuft ohne Installation und ohne Anmeldung im Browser." },
      { q: "Ist das ein Live-Radio?", a: "Nein. Die Sender spielen fortlaufend Aufnahmen bekannter Rezitatoren ab und beginnen am Ende von vorn. Eine Live-Übertragung aus einer Moschee ist es nicht." },
      { q: "Kann ich das Koran Radio 24 Stunden laufen lassen?", a: "Ja, die Sender hören nicht auf. Für die Nacht empfiehlt sich der Schlaf-Timer." },
      { q: "Gibt es das Koran Radio mit Übersetzung?", a: "Sie hören die arabische Rezitation und können Text und deutsche Übersetzung auf dem Bildschirm einblenden. Gesprochen wird die Übersetzung nicht." },
      { q: "Welche Rezitatoren kann ich hören?", a: "Zum Beispiel Mishary Alafasy, Abdul Basit, al-Husary und al-Minshawi. In den gemischten Sendern hören Sie für jede Sure eine andere Stimme." },
      { q: "Läuft das Radio bei gesperrtem Bildschirm weiter?", a: "Ja, die Wiedergabe läuft weiter, auch wenn der Bildschirm gesperrt ist. Mit dem Schlaf-Timer bestimmen Sie, wann sie endet." },
      { q: "Läuft im Radio auch Musik?", a: "Nein. Es läuft ausschließlich Koran-Rezitation." },
    ],
    linksTitle: "Weiterhören und weiterlesen",
    links: [["/radio", "Koran Radio"], ["/listen-quran", "Koran hören"], ["/reciters", "Rezitatoren"], ["/quran", "Alle Suren"], ["/surah/18", "Sure 18"], ["/surah/67", "Sure 67"], ["/khatm", "Khatm-Planer"], ["/app", "iOS-App"]],
    cta: ["/radio", "Radio jetzt starten"],
  },

  "listen-quran": {
    title: "Koran hören: Suren und Rezitatoren online anhören",
    description: "Koran hören online: alle 114 Suren nach Rezitator anhören, Vers für Vers mit Text und Übersetzung. Kostenlos, ohne Anmeldung.",
    kicker: "Koran hören",
    h1: "Koran hören: Jede Sure, Vers für Vers, mit Text",
    intro: "Wer den Koran hören möchte, hat unterschiedliche Ziele: zur Ruhe kommen, die Aussprache lernen, eine Sure auswendig lernen oder verstehen, was rezitiert wird. Diese Seite zeigt, wie Sie online gezielt hören, welche Stimme zu welchem Zweck passt und wie aus Zuhören Schritt für Schritt Lernen wird.",
    answer: "Auf Quran Masterclass können Sie alle 114 Suren kostenlos und ohne Anmeldung anhören, Vers für Vers mit arabischem Text, Lautschrift, deutscher Übersetzung und Hervorhebung jedes Wortes. Sie wählen den Rezitator, verlangsamen das Tempo, wiederholen Verse oder Abschnitte in Schleife und setzen dort fort, wo Sie aufgehört haben. Mit einem kostenlosen Konto ist Ihr Stand auch in der iOS-App derselbe.",
    sections: [
      {
        h2: "Koran hören und mitlesen",
        p: [
          "Öffnen Sie die Surenliste und wählen Sie eine Sure nach Namen oder Nummer. Die Rezitation läuft Vers für Vers, der aktuelle Vers ist hervorgehoben, und jedes Wort leuchtet auf, während es gesprochen wird. So verbinden Sie Klang und Schrift, auch wenn Sie noch langsam lesen.",
          "Im Lernmodus hält die Wiedergabe nach jedem Vers an, bis Sie auf Weiter drücken; im durchgehenden Modus läuft die Sure ohne Pause. Lesezeichen und eigene Notizen setzen Sie direkt am Vers, und beim nächsten Besuch machen Sie dort weiter, wo Sie aufgehört haben.",
        ],
        links: [["/quran", "Alle 114 Suren"], ["/surah/1", "Sure 1 hören"]],
      },
      {
        h2: "Koran hören mit deutscher Übersetzung",
        p: [
          "Die Rezitation ist immer arabisch. Die deutsche Übersetzung von Bubenheim und Elyas steht unter jedem Vers, sodass Sie beim Hören mitlesen, was gesagt wird. Gesprochen wird die Übersetzung nicht.",
          "Wer genauer verstehen möchte, blendet die Wort-für-Wort-Ansicht ein: Unter jedem arabischen Wort steht seine Bedeutung. Die Lautschrift hilft beim Mitsprechen, solange Sie die arabische Schrift noch nicht sicher lesen, und zu jedem Vers können Sie den Tafsir öffnen.",
        ],
        links: [["/quran-tafsir", "Koran Tafsir"], ["/arabic", "Arabisch für den Koran"]],
      },
      {
        h2: "Den passenden Rezitator wählen",
        p: [
          "Rezitatoren unterscheiden sich in Tempo, Stimmfarbe und Stil. Im Murattal-Stil wird zügig und gleichmäßig rezitiert, im Mudschawwad-Stil langsamer und melodisch ausgestaltet. Für Lernende sind klare, ruhige Murattal-Aufnahmen meist am leichtesten zu verfolgen, etwa von al-Husary oder al-Minshawi; im Player stehen außerdem Mishary Alafasy und Abdul Basit zur Wahl.",
          "Auf der Rezitatorenseite finden Sie Porträts bekannter Stimmen aus verschiedenen Ländern und Epochen, mit Hinweisen, welche Aufnahmen sich zum Lernen eignen. Al-Husary etwa hat eine Lehraufnahme eingespielt, bei der Kinder seine Rezitation Abschnitt für Abschnitt nachsprechen.",
        ],
        links: [["/reciters", "Rezitatoren vergleichen"], ["/mishary", "Stilstudien der Meister"]],
      },
      {
        h2: "Koran Vers für Vers anhören und wiederholen",
        p: [
          "Zum Lernen ist das Wiederholen entscheidend. Sie können jeden Vers automatisch wiederholen lassen oder einen Abschnitt von einem bestimmten Vers bis zu einem anderen in Schleife abspielen. Mit der Pause zum Nachsprechen bleibt nach jedem Vers Zeit, ihn selbst zu sprechen; die Einstellung Verslänge gibt Ihnen genau so viel Zeit, wie der Vers dauert.",
          "Ist Ihnen ein Rezitator zu schnell, verringern Sie das Tempo. Tippen Sie auf ein einzelnes Wort, um es allein zu hören. So wird aus passivem Zuhören eine Übung für Aussprache und Gedächtnis.",
        ],
        links: [["/tajweed", "Tadschwid lernen"], ["/memorize-quran", "Koran auswendig lernen"]],
      },
      {
        h2: "Sure Yasin, Al-Kahf, Al-Baqara und Al-Mulk anhören",
        p: [
          "Manche Suren werden besonders oft gehört. Ya-Sin (Sure 36) lesen viele regelmäßig, Al-Kahf (Sure 18) traditionell am Freitag, Al-Mulk (Sure 67) am Abend. Al-Baqara (Sure 2) ist die längste Sure des Korans; wer sie vollständig hören möchte, plant dafür am besten mehrere Etappen ein.",
          "Ar-Rahman (Sure 55) ist für ihren wiederkehrenden Kehrvers bekannt, Yusuf (Sure 12) erzählt eine zusammenhängende Geschichte und eignet sich gut zum Hören am Stück. Alle diese Suren öffnen Sie direkt und hören sie mit Übersetzung.",
        ],
        links: [["/surah/36", "Sure 36: Ya-Sin"], ["/surah/18", "Sure 18: Al-Kahf"], ["/surah/2", "Sure 2: Al-Baqara"], ["/surah/67", "Sure 67: Al-Mulk"]],
      },
      {
        h2: "Koran hören zum Auswendiglernen",
        p: [
          "Hören ist der erste Schritt jedes Auswendiglernens. Bevor Sie einen Vers selbst sprechen, sollte sein Klangbild im Ohr sein. Hören Sie einen neuen Abschnitt deshalb mehrmals mit Blick auf den Text, sprechen Sie dann mit und erst danach aus dem Gedächtnis.",
          "Bleiben Sie dabei möglichst bei einem Rezitator: Wenn Melodie und Pausen gleich bleiben, prägt sich der Vers leichter ein. Die Shams-Methode baut darauf auf und spielt einen Vers sogar rückwärts aufbauend ab, vom letzten Wort bis zum ganzen Vers.",
        ],
        links: [["/shams", "Shams-Methode"]],
      },
      {
        h2: "Offline und unterwegs hören",
        p: [
          "Die Wiedergabe läuft im Browser auf Handy, Tablet und Computer. Wer die Website als App installiert, kann einzelne Suren in den Einstellungen einer Sure speichern und sie dann auch ohne Internet abspielen; die App-Seite erklärt die Installation. Die iOS-App nutzt dasselbe Konto wie die Website.",
          "Für lange Wege bietet sich das Koran Radio an, das ohne Auswahl ununterbrochen spielt. Mit dem Schlaf-Timer endet die Wiedergabe am Abend automatisch, wahlweise nach einigen Minuten oder am Ende der Sure.",
        ],
        links: [["/radio", "Koran Radio"], ["/app", "App installieren"]],
      },
    ],
    stepsTitle: "So hören Sie den Koran gezielt",
    steps: [
      { title: "Sure wählen", body: "Suchen Sie eine Sure in der Liste oder über die Suche nach Name oder Nummer." },
      { title: "Rezitator festlegen", body: "Wählen Sie eine Stimme, die Ihnen beim Mitlesen hilft." },
      { title: "Tempo anpassen", body: "Verlangsamen Sie die Wiedergabe, solange Sie noch langsam lesen." },
      { title: "Mitlesen", body: "Folgen Sie den hervorgehobenen Wörtern im arabischen Text und in der Übersetzung." },
      { title: "Wiederholen", body: "Lassen Sie schwierige Verse wiederholen oder einen Abschnitt in Schleife laufen." },
      { title: "Nachsprechen", body: "Schalten Sie die Pause zum Nachsprechen ein und sprechen Sie jeden Vers selbst." },
    ],
    faqTitle: "Fragen zum Koranhören",
    faq: [
      { q: "Kann ich den Koran kostenlos online hören?", a: "Ja. Alle 114 Suren lassen sich kostenlos und ohne Anmeldung anhören." },
      { q: "Kann ich die Rezitation als MP3 herunterladen?", a: "Einen Download einzelner MP3-Dateien bietet die Website nicht an; die Rechte an den Aufnahmen liegen bei den jeweiligen Quellen. Wer die Website als App installiert, kann Suren für die Wiedergabe ohne Internet speichern." },
      { q: "Wird die deutsche Übersetzung vorgelesen?", a: "Nein. Sie hören die arabische Rezitation und lesen die deutsche Übersetzung parallel auf dem Bildschirm." },
      { q: "Welcher Rezitator ist für Anfänger geeignet?", a: "Ein ruhiges, klares Tempo hilft. Probieren Sie zum Beispiel al-Husary oder al-Minshawi im Murattal-Stil und verlangsamen Sie bei Bedarf das Tempo." },
      { q: "Welche Sure höre ich zum Einschlafen?", a: "Viele hören am Abend Al-Mulk (Sure 67), As-Sadschda (Sure 32) oder die letzten drei Suren des Korans. Im Koran Radio gibt es dafür einen eigenen Sender mit Schlaf-Timer." },
      { q: "Kann ich den Koran beim Autofahren hören?", a: "Ja, am einfachsten über das Koran Radio, das ohne Bedienung weiterläuft. Stellen Sie es vor der Fahrt ein und lesen Sie während der Fahrt nicht mit." },
      { q: "Brauche ich ein Konto?", a: "Zum Hören nicht. Ein kostenloses Konto speichert Lesezeichen, Notizen und Ihren Stand auf allen Geräten, auch in der iOS-App." },
    ],
    linksTitle: "Weiterhören und weiterlesen",
    links: [["/quran", "Alle Suren"], ["/reciters", "Rezitatoren"], ["/radio", "Koran Radio"], ["/surah/36", "Sure 36"], ["/surah/18", "Sure 18"], ["/surah/67", "Sure 67"], ["/search", "Suche"], ["/tajweed", "Tadschwid"], ["/app", "iOS-App"]],
    cta: ["/quran", "Sure auswählen und hören"],
  },

  tawbah: {
    title: "Tauba: Reue und Umkehr im Islam, Schritt für Schritt",
    description: "Tauba im Islam: was Reue und Umkehr bedeuten, Istighfar im Alltag, zurück zum Gebet und erste Schritte. Ein ruhiger, praktischer Leitfaden ohne Vorwürfe.",
    kicker: "Tauba",
    h1: "Tauba: Der Weg zurück beginnt mit einem kleinen Schritt",
    intro: "Tauba bedeutet Umkehr: die bewusste Rückkehr zu Allah nach Fehlern, nach einer Zeit der Ferne oder einfach mit dem Wunsch, neu anzufangen. Diese Seite urteilt nicht über Ihre Vergangenheit. Sie erklärt ruhig, was Tauba im Islam bedeutet, und zeigt praktische erste Schritte, die Sie heute gehen können.",
    answer: "Tauba heißt im Islam Umkehr und Reue: sich von einem Fehler abwenden, ihn ehrlich bedauern, sich Besserung vornehmen und Allah um Vergebung bitten. Der Koran spricht an vielen Stellen von Allahs Barmherzigkeit, und nach islamischem Verständnis steht der Weg der Umkehr jedem Menschen offen. Quran Masterclass hilft mit praktischen Schritten wie Duas, Wudu, Gebet und Koranhören, kostenlos auf der Website; persönliche Fragen besprechen Sie bitte mit einer vertrauenswürdigen Gelehrten oder einem Imam.",
    sections: [
      {
        h2: "Was Tauba im Islam bedeutet",
        p: [
          "Das arabische Wort Tauba bedeutet Rückkehr. Gemeint ist eine Bewegung des Herzens: weg von dem, was falsch war, hin zu Allah. Die islamische Tradition nennt dazu meist drei innere Schritte, nämlich das Aufhören, das aufrichtige Bedauern und den festen Vorsatz, es nicht zu wiederholen. Wo andere Menschen betroffen sind, kommt das Bemühen hinzu, ihr Recht wiederherzustellen.",
          "Tauba ist keine Zeremonie und keine Beichte vor einem Menschen. Sie geschieht zwischen Ihnen und Allah, in Ihrer eigenen Sprache und zu jeder Zeit. Viele finden Hoffnung in Sure 39 (az-Zumar), die in Vers 53 dazu aufruft, nicht an der Barmherzigkeit Allahs zu verzweifeln.",
        ],
        links: [["/surah/39", "Sure 39: az-Zumar"], ["/islam/names", "Die 99 Namen Allahs"]],
      },
      {
        h2: "Istighfar: Bedeutung und Platz im Alltag",
        p: [
          "Istighfar heißt, Allah um Vergebung zu bitten. Während Tauba die grundsätzliche Umkehr beschreibt, ist Istighfar eine Übung, die viele Muslime täglich begleitet: nach dem Gebet, am Morgen und am Abend oder in einem stillen Moment unterwegs. Die Tauba ist die Entscheidung, der Istighfar hält sie lebendig.",
          "In der Dua-Sammlung finden Sie überlieferte Bitten um Vergebung mit arabischem Text, Lautschrift und deutscher Übersetzung zum Lesen und Hören. Fehlen Ihnen die Worte, hilft der Dua-Generator, Ihr Anliegen in eigene Worte zu fassen. Unter den Namen Allahs lohnt es sich, At-Tawwab, Al-Ghafur und Ar-Rahim kennenzulernen.",
        ],
        links: [["/duas", "Duas um Vergebung"], ["/dua-generator", "Dua-Generator"]],
      },
      {
        h2: "Tauba Schritte für Anfänger: die erste Woche",
        p: [
          "Große Vorsätze scheitern oft an ihrer Größe. Ein realistischer Anfang ist eine Woche mit je einem kleinen Schritt pro Tag: am ersten Tag ein ehrliches Dua in Ihren eigenen Worten, am zweiten den Wudu lernen oder auffrischen, am dritten ein einziges Gebet zur festen Zeit, am vierten wenige Verse mit Übersetzung hören.",
          "An den folgenden Tagen behalten Sie das Erreichte bei und fügen höchstens eine Sache hinzu, etwa einen kurzen Istighfar nach dem Gebet. Am Ende der Woche schauen Sie zurück: Was ist leichtgefallen, was nicht? Daraus planen Sie die nächste Woche.",
        ],
        links: [["/wudu", "Wudu üben"], ["/learn-salah", "Gebet lernen"]],
      },
      {
        h2: "Wieder anfangen zu beten nach langer Zeit",
        p: [
          "Viele, die zurückfinden möchten, haben jahrelang nicht gebetet und schämen sich, die Abläufe nicht mehr zu kennen. Das geht vielen so und ist kein Grund zu warten. Der Gebetstrainer zeigt jede Haltung mit einer Figur, dazu die arabischen Worte, die Umschrift und die Bedeutung, für die sunnitische und die schiitische Praxis.",
          "Beginnen Sie mit einem Gebet am Tag und nehmen Sie weitere hinzu, sobald es sich sicher anfühlt. Die Gebetszeiten für Ihren Ort berechnet die Website auf Ihrem Gerät. Ob und wie versäumte Gebete nachzuholen sind, beurteilen die Rechtsschulen unterschiedlich; diese Frage besprechen Sie bitte mit einer kundigen Person Ihrer Richtung.",
        ],
        links: [["/salah", "Gebetstrainer"], ["/prayer", "Gebetszeiten"]],
      },
      {
        h2: "Wenn andere Menschen betroffen sind",
        p: [
          "Manche Fehler betreffen nur das Verhältnis zu Allah, andere haben Menschen verletzt oder ihnen etwas genommen. In der islamischen Lehre gehört zur Umkehr dann auch das Bemühen, Unrecht wiedergutzumachen, soweit das möglich ist und niemandem schadet: etwas zurückgeben, um Verzeihung bitten oder auf andere Weise Ausgleich schaffen.",
          "Wie das im Einzelfall aussieht, ist oft nicht einfach, gerade wenn Beziehungen belastet sind oder eine Begegnung neue Verletzungen auslösen könnte. Hier ist ein vertrauliches Gespräch mit einer Gelehrten, einem Imam oder einer erfahrenen Seelsorgerin der richtige Weg. Diese Seite gibt dazu bewusst keine Urteile.",
        ],
        links: [["/islam/daily", "Islam im Alltag"]],
      },
      {
        h2: "Rückfälle, Scham und gute Gesellschaft",
        p: [
          "Wer umkehrt, fällt manchmal zurück. Das macht die Umkehr nicht wertlos, und die Tauba lässt sich erneuern, so oft es nötig ist. Praktisch hilft es, die Situationen zu kennen, in denen Sie schwach werden, und dafür vorab einen Ausweg zu planen: einen anderen Weg, eine andere Uhrzeit, eine Person, die Sie anrufen.",
          "Suchen Sie Menschen, die Sie ermutigen, statt zu urteilen, etwa in einer Moscheegemeinde, in einem Kurs oder im Freundeskreis. Wenn Sie zusätzlich mit Sucht, Depression oder anderen seelischen Belastungen kämpfen, ist professionelle Hilfe kein Widerspruch zur Tauba, sondern Unterstützung auf dem Weg.",
        ],
        links: [["/islam", "Islam Grundlagen"], ["/courses", "Kurse"]],
      },
      {
        h2: "Der Koran als Begleiter auf dem Rückweg",
        p: [
          "Viele finden Halt in kurzen Suren, die sie vielleicht schon aus der Kindheit kennen. Ad-Duha (Sure 93) und Asch-Scharh (Sure 94) sprechen von Trost und Erleichterung, al-Fatiha (Sure 1) begleitet jedes Gebet. Hören Sie täglich einige Verse mit Übersetzung, ohne Druck, sie sofort auswendig zu können.",
          "Im Koran Radio gibt es einen eigenen Sender mit Suren, die Mut machen. Wenn Sie wieder regelmäßig lesen möchten, beginnen Sie mit einer festen, kleinen Menge, zum Beispiel einem Abschnitt nach dem Morgen- oder Abendgebet.",
        ],
        links: [["/surah/93", "Sure 93: Ad-Duha"], ["/surah/94", "Sure 94: Asch-Scharh"], ["/radio", "Koran Radio"]],
      },
    ],
    stepsTitle: "Kleine Schritte zurück",
    steps: [
      { title: "Innehalten", body: "Nehmen Sie sich einen ruhigen Moment und wenden Sie sich im Herzen Allah zu." },
      { title: "In eigenen Worten bitten", body: "Sprechen Sie ein ehrliches Dua, in Ihrer Sprache und ohne vorbereitete Formel." },
      { title: "Wudu lernen", body: "Üben Sie die Waschung mit dem Trainer, bis die Reihenfolge sitzt." },
      { title: "Ein Gebet am Tag", body: "Beginnen Sie mit einem Gebet zur festen Zeit und erweitern Sie langsam." },
      { title: "Täglich Istighfar", body: "Bitten Sie nach dem Gebet kurz um Vergebung, mit überlieferten oder eigenen Worten." },
      { title: "Ein paar Verse hören", body: "Hören Sie jeden Tag wenige Verse mit Übersetzung." },
      { title: "Ein Gespräch suchen", body: "Besprechen Sie offene Fragen mit einer vertrauenswürdigen Gelehrten oder einem Imam." },
    ],
    faqTitle: "Fragen zur Tauba",
    faq: [
      { q: "Wie macht man Tauba?", a: "Nach verbreiteter islamischer Lehre gehören dazu: mit dem Fehler aufhören, ihn aufrichtig bereuen, sich vornehmen, ihn nicht zu wiederholen, und Allah um Vergebung bitten. Sind andere Menschen betroffen, kommt das Bemühen um Wiedergutmachung hinzu. Es gibt überlieferte Bittgebete, Sie können aber auch in eigenen Worten sprechen." },
      { q: "Was ist der Unterschied zwischen Tauba und Istighfar?", a: "Tauba ist die grundsätzliche Umkehr mit Reue und Vorsatz. Istighfar ist die Bitte um Vergebung, die viele Muslime täglich sprechen, auch unabhängig von einem bestimmten Fehler." },
      { q: "Gibt es eine Tauba-Dua auf Deutsch?", a: "Sie dürfen Allah in jeder Sprache ansprechen, also auch auf Deutsch. Überlieferte Bittgebete der Reue finden Sie in der Dua-Sammlung mit arabischem Text, Lautschrift und Übersetzung." },
      { q: "Ist es für mich zu spät?", a: "Nach islamischem Verständnis steht der Weg der Umkehr offen, und der Koran ruft ausdrücklich dazu auf, nicht an Allahs Barmherzigkeit zu verzweifeln. Wie Ihre persönliche Situation einzuordnen ist, besprechen Sie bitte mit einer Gelehrten oder einem Imam." },
      { q: "Muss ich jemandem meine Sünden erzählen?", a: "Tauba richtet sich direkt an Allah; eine Beichte vor einem Menschen ist dafür nicht vorgesehen. Ein vertrauliches Gespräch mit einer kundigen Person kann trotzdem entlasten und bei praktischen Fragen helfen." },
      { q: "Muss ich verpasste Gebete nachholen?", a: "Darüber urteilen die Rechtsschulen unterschiedlich, und die Antwort kann von Ihrer Situation abhängen. Bitte fragen Sie eine kundige Person Ihrer Richtung. Beginnen Sie unabhängig davon mit den Gebeten von heute." },
      { q: "Was, wenn ich wieder schwach werde?", a: "Dann kehren Sie erneut um. Rückfälle gehören für viele Menschen zum Weg. Planen Sie für schwierige Situationen vorab und suchen Sie sich Unterstützung." },
      { q: "Ist diese Seite ein religiöses Urteil?", a: "Nein. Sie bietet Orientierung und Lernhilfen, keine Fatwa. Für persönliche Fragen wenden Sie sich an eine Gelehrte oder einen Imam Ihres Vertrauens." },
    ],
    linksTitle: "Hilfen für den Neuanfang",
    links: [["/duas", "Duas"], ["/dua-generator", "Dua-Generator"], ["/islam/names", "99 Namen Allahs"], ["/salah", "Gebet lernen"], ["/wudu", "Wudu"], ["/prayer", "Gebetszeiten"], ["/surah/39", "Sure 39"], ["/islam", "Islam Grundlagen"], ["/quran", "Koran hören"]],
    cta: ["/duas", "Mit einem Dua beginnen"],
  },

  "learn-salah": {
    title: "Gebet lernen: Anleitung zur Salah, Schritt für Schritt",
    description: "Gebet lernen mit Anleitung: Vorbereitung, Haltungen, Rezitationen und Rakat der Salah für Anfänger und Neumuslime, sunnitisch und schiitisch. Kostenlos.",
    kicker: "Salah",
    h1: "Gebet lernen: Anleitung zur Salah für Anfänger",
    intro: "Gebet lernen gelingt am besten mit einer Anleitung, die nicht alles auf einmal verlangt: erst die Vorbereitung, dann die Haltungen, dann die gesprochenen Teile und schließlich ein vollständiges Gebet. Sie richtet sich an Anfänger, Neumuslime und alle, die nach längerer Pause neu beginnen, und berücksichtigt sunnitische und schiitische Praxis.",
    answer: "Das islamische Gebet (Salah) lernen Sie in vier Bausteinen: Vorbereitung mit Gebetszeit, Wudu und Gebetsrichtung, die Haltungen Stehen, Verbeugung, Niederwerfung und Sitzen, die gesprochenen Teile mit al-Fatiha im Mittelpunkt und schließlich das Zusammensetzen der Rakat. Der Gebetstrainer auf Quran Masterclass zeigt jede Bewegung mit arabischem Text, Umschrift und Bedeutung, wahlweise nach sunnitischer oder schiitischer Praxis, kostenlos auf der Website.",
    sections: [
      {
        h2: "Bevor Sie beginnen: Zeit, Reinheit, Richtung",
        p: [
          "Jedes Pflichtgebet hat ein Zeitfenster. Die Zeiten für Fadschr, Dhuhr, Asr, Maghrib und Ischa berechnet die Website für Ihren Standort direkt auf Ihrem Gerät, wahlweise mit der Methode Ihrer örtlichen Moschee und mit der hanafitischen Berechnung für Asr. Dort finden Sie auch die Qibla, die Gebetsrichtung zur Kaaba in Mekka, und auf dem Handy einen Live-Kompass.",
          "Vor dem Gebet steht die Reinheit: ein sauberer Körper, saubere Kleidung, ein sauberer Platz und die Gebetswaschung (Wudu). Den Wudu üben Sie mit einem eigenen Trainer in Ruhe, bevor Sie das erste Gebet sprechen.",
        ],
        links: [["/prayer", "Gebetszeiten und Qibla"], ["/learn-wudu", "Wudu Anleitung"]],
      },
      {
        h2: "Gebet Schritt für Schritt: die Haltungen",
        p: [
          "Ein Gebet besteht aus Einheiten, den Rakat. Es beginnt mit dem Takbir, dem Lobpreis der Größe Allahs, und jede Raka folgt demselben Grundmuster: stehen und rezitieren, verbeugen, wieder aufrichten, zweimal niederwerfen mit einem kurzen Sitzen dazwischen. Nach der zweiten und nach der letzten Raka sitzen Sie länger für das Glaubenszeugnis, und das Gebet endet mit dem Friedensgruß.",
          "Der Gebetstrainer zeigt jede Haltung mit einer Figur. Sie spielen den Ablauf ab oder gehen ihn Schritt für Schritt durch, so oft Sie möchten. Unterschiede wie die Haltung der Hände im Stehen, das Bittgebet Qunut in der schiitischen Praxis oder die Niederwerfung auf einer Turba zeigt der Trainer je nach gewählter Tradition.",
        ],
        links: [["/salah", "Gebetstrainer öffnen"]],
      },
      {
        h2: "Was sagt man im Gebet?",
        p: [
          "Im Mittelpunkt steht al-Fatiha, die erste Sure des Korans. Sie wird in jeder Raka rezitiert und ist deshalb das Erste, was Sie lernen sollten. In den ersten beiden Rakat folgt eine weitere kurze Sure, zum Beispiel al-Ikhlas (Sure 112), al-Kauthar (Sure 108) oder al-Asr (Sure 103).",
          "Dazu kommen kurze Lobpreisungen in der Verbeugung und in der Niederwerfung, das Glaubenszeugnis im Sitzen und der Friedensgruß am Ende. Der Trainer zeigt zu jedem Schritt die arabischen Worte, die Umschrift und die Bedeutung. Al-Fatiha lernen Sie zusätzlich Vers für Vers mit Rezitation, bis Sie sie sicher sprechen.",
        ],
        links: [["/surah/1", "Sure 1: al-Fatiha"], ["/surah/112", "Sure 112: al-Ikhlas"], ["/surah/108", "Sure 108: al-Kauthar"], ["/surah/103", "Sure 103: al-Asr"]],
      },
      {
        h2: "Wie viele Rakat haben Fadschr, Dhuhr, Asr, Maghrib und Ischa?",
        p: [
          "Die fünf Pflichtgebete haben unterschiedlich viele Rakat: Fadschr zwei, Dhuhr vier, Asr vier, Maghrib drei und Ischa vier. Bei Fadschr, Maghrib und Ischa wird in den ersten beiden Rakat laut rezitiert, bei Dhuhr und Asr leise. Darin stimmen sunnitische und schiitische Praxis überein; Einzelheiten, etwa für Frauen oder auf Reisen, regeln die Schulen jeweils eigens.",
          "Hinzu kommen freiwillige Gebete vor oder nach manchen Pflichtgebeten, deren Zahl die Schulen unterschiedlich angeben. Viele Schiiten beten Dhuhr und Asr sowie Maghrib und Ischa jeweils direkt nacheinander, sodass sich drei Gebetszeiten am Tag ergeben; auch sunnitische Schulen kennen das Zusammenlegen in bestimmten Situationen, etwa auf Reisen.",
        ],
        links: [["/islam/prayer-sunni", "Gebet nach sunnitischer Praxis"], ["/islam/prayer-shia", "Gebet nach schiitischer Praxis"]],
      },
      {
        h2: "Gebet lernen als Neumuslim",
        p: [
          "Als Neumuslim müssen Sie nicht am ersten Tag alles perfekt können. Viele lernen zuerst den Wudu und die Haltungen, sprechen die Texte anfangs mit Hilfe der Umschrift und lernen al-Fatiha parallel auswendig. Es kann helfen, gemeinsam mit anderen zu beten, etwa in einer Moschee, wo Sie dem Vorbeter folgen.",
          "Fragen Sie in Ihrer Gemeinde nach Kursen für neue Muslime oder nach einer Person, die Sie begleitet. Die Grundlagenseiten erklären außerdem, welche Rolle das Gebet im Islam spielt und wie es sich in den Tag einfügt.",
        ],
        links: [["/learn-islam", "Islam lernen"], ["/islam/daily", "Alltag als Muslim"]],
      },
      {
        h2: "Gebet lernen ohne Arabisch zu können",
        p: [
          "Die gesprochenen Teile des Gebets werden auf Arabisch rezitiert. Das schreckt viele ab, ist aber gut zu bewältigen, weil es wenige, kurze Texte sind, die sich in jedem Gebet wiederholen. Beginnen Sie mit Hören und Nachsprechen, nutzen Sie die Umschrift als Brücke und lesen Sie die Bedeutung, damit Sie wissen, was Sie sagen.",
          "Parallel lohnt sich der Lesekurs, denn die Umschrift gibt manche arabischen Laute nur ungefähr wieder. Ob Sie in der Übergangszeit Teile in einer anderen Sprache sprechen dürfen, beantworten die Schulen unterschiedlich; fragen Sie dazu eine kundige Person Ihrer Richtung.",
        ],
        links: [["/arabic/read", "Arabisch lesen lernen"], ["/duas", "Duas mit Umschrift"]],
      },
      {
        h2: "Gebet lernen für Kinder",
        p: [
          "Kinder lernen das Gebet am leichtesten, indem sie mitmachen: neben Ihnen stehen, die Bewegungen nachahmen und die kurzen Suren hören. Der Trainer mit seiner Figur und den einzelnen Schritten eignet sich gut, um gemeinsam am Bildschirm zu üben.",
          "Setzen Sie auf Freude statt auf Druck. Kurze Suren wie al-Ikhlas lernen Kinder durch Wiederholung, und im Kinder-Modus der Website gibt es große Knöpfe und Sterne als Belohnung.",
        ],
        links: [["/guides/quran-for-kids", "Koran für Kinder"]],
      },
    ],
    stepsTitle: "Gebet lernen in sechs Schritten",
    steps: [
      { title: "Gebetszeit prüfen", body: "Sehen Sie nach, wann das nächste Gebet an Ihrem Ort beginnt, und bestimmen Sie die Qibla." },
      { title: "Wudu üben", body: "Lernen Sie die Waschung in der richtigen Reihenfolge mit dem Trainer." },
      { title: "Haltungen kennenlernen", body: "Gehen Sie Stehen, Verbeugung, Niederwerfung und Sitzen Schritt für Schritt durch." },
      { title: "Al-Fatiha lernen", body: "Hören Sie die erste Sure Vers für Vers und sprechen Sie mit, bis sie sitzt." },
      { title: "Kurze Sure und Lobpreisungen", body: "Lernen Sie eine kurze Sure und die kurzen Formeln für Verbeugung und Niederwerfung." },
      { title: "Ein ganzes Gebet beten", body: "Beginnen Sie mit Fadschr, das zwei Rakat hat, und nehmen Sie die anderen Gebete nach und nach hinzu." },
    ],
    faqTitle: "Fragen zum Gebet",
    faq: [
      { q: "Wie viele Gebete gibt es am Tag?", a: "Es gibt fünf tägliche Pflichtgebete: Fadschr, Dhuhr, Asr, Maghrib und Ischa. In der schiitischen Praxis werden sie häufig zu drei Zeiten verrichtet, indem je zwei Gebete nacheinander gebetet werden." },
      { q: "Wie viele Rakat hat jedes Gebet?", a: "Fadschr zwei, Dhuhr vier, Asr vier, Maghrib drei und Ischa vier Rakat. Freiwillige Gebete kommen je nach Schule hinzu." },
      { q: "Welche Suren braucht man für das Gebet?", a: "Al-Fatiha in jeder Raka und in den ersten beiden Rakat eine weitere kurze Sure; in manchen Schulen genügen dort auch einige Verse. Für den Anfang eignen sich al-Ikhlas oder al-Kauthar." },
      { q: "Kann ich beten, bevor ich alles auswendig kann?", a: "Viele beginnen mit Hilfe der Umschrift und lernen die Texte nach und nach. Wie Sie die Übergangszeit gestalten, besprechen Sie am besten mit einer kundigen Person Ihrer Schule." },
      { q: "Muss ich vor dem Gebet Wudu machen?", a: "Reinheit ist nach allen Rechtsschulen Voraussetzung für das Gebet, und dafür ist in der Regel der Wudu nötig. Den Ablauf üben Sie mit dem Wudu-Trainer." },
      { q: "Was unterscheidet sunnitisches und schiitisches Gebet?", a: "Grundablauf und Zahl der Rakat sind gleich. Unterschiede gibt es in Details, etwa bei der Haltung der Hände, beim Bittgebet Qunut, bei der Niederwerfung auf einer Turba und beim Zusammenlegen von Gebeten. Der Trainer zeigt beide Formen." },
      { q: "Wo finde ich die Gebetsrichtung?", a: "In der Gebetszeiten-Ansicht steht die Qibla für Ihren Standort; auf dem Handy können Sie einen Live-Kompass einschalten." },
      { q: "Ist diese Anleitung ein Rechtsgutachten?", a: "Nein. Sie ist eine Lernhilfe. Lernen Sie das Gebet nach Möglichkeit zusätzlich bei einer Lehrerin oder einem Lehrer Ihrer Schule." },
    ],
    linksTitle: "Weiterlesen und üben",
    links: [["/salah", "Gebetstrainer"], ["/wudu", "Wudu-Trainer"], ["/prayer", "Gebetszeiten"], ["/islam/prayer-sunni", "Sunnitisches Gebet"], ["/islam/prayer-shia", "Schiitisches Gebet"], ["/surah/1", "Sure 1"], ["/duas", "Duas"], ["/learn-wudu", "Wudu Anleitung"]],
    cta: ["/salah", "Gebet Schritt für Schritt öffnen"],
  },

  "learn-wudu": {
    title: "Wudu Anleitung: Gebetswaschung richtig lernen",
    description: "Wudu Anleitung Schritt für Schritt: Reihenfolge der Gebetswaschung, Unterschiede der Schulen und was sie aufhebt, mit Trainer und Quiz. Kostenlos.",
    kicker: "Wudu",
    h1: "Wudu Anleitung: Die Gebetswaschung Schritt für Schritt",
    intro: "Diese Wudu-Anleitung führt Sie durch die Gebetswaschung, die Muslime vor dem Gebet vollziehen: welche Körperteile gewaschen werden, in welcher Reihenfolge, was dabei Pflicht und was empfohlen ist und wo sich sunnitische und schiitische Praxis unterscheiden. Mit dem Trainer üben Sie jeden Schritt, bis er sitzt.",
    answer: "Wudu ist die rituelle Waschung vor dem Gebet. Sie beginnt mit der Absicht und umfasst nach dem Koran (Sure 5, Vers 6) das Waschen des Gesichts und der Arme bis zu den Ellenbogen, das Bestreichen des Kopfes und die Füße bis zu den Knöcheln; weitere Schritte wie das Waschen der Hände und das Spülen von Mund und Nase kommen aus der Überlieferung hinzu. Der Wudu-Trainer auf Quran Masterclass zeigt jeden Schritt nach sunnitischer oder schiitischer Praxis, kennzeichnet Pflicht und Empfehlung und endet mit einem kurzen Quiz, kostenlos auf der Website.",
    sections: [
      {
        h2: "Was ist Wudu und wozu dient es?",
        p: [
          "Wudu, im Türkischen Abdest genannt, ist die kleine rituelle Waschung. Sie stellt die Reinheit her, die für das Gebet vorausgesetzt wird. Grundlage ist Sure 5, Vers 6, in dem die Waschung beschrieben wird; auf der Wudu-Seite können Sie den Vers anhören.",
          "Wudu ist mehr als eine Formalität. Viele erleben die wenigen Minuten am Waschbecken als Übergang: Der Alltag tritt zurück, die Gedanken sammeln sich, und Sie treten bewusster ins Gebet.",
        ],
        links: [["/wudu", "Wudu-Seite mit Trainer"], ["/surah/5", "Sure 5: al-Maida"]],
      },
      {
        h2: "Wudu Schritt für Schritt erklärt",
        p: [
          "Die übliche Reihenfolge nach sunnitischer Praxis: die Absicht im Herzen fassen, den Namen Allahs aussprechen, die Hände bis zu den Handgelenken waschen, Mund und Nase ausspülen, das Gesicht waschen, dann den rechten und den linken Arm bis einschließlich der Ellenbogen, den Kopf mit nassen Händen bestreichen, die Ohren reinigen und zum Schluss die Füße bis einschließlich der Knöchel waschen, zuerst rechts.",
          "Viele Schritte werden dreimal ausgeführt, das Bestreichen des Kopfes meist einmal. Danach wird ein kurzes Bittgebet gesprochen, das Sie in der Dua-Sammlung finden. Der Trainer zeigt jeden Schritt als Animation und kennzeichnet, ob er als Pflicht (Fard) oder als empfohlen (Sunna) gilt.",
        ],
        links: [["/wudu", "Wudu-Trainer starten"], ["/duas", "Dua nach dem Wudu"]],
      },
      {
        h2: "Wudu nach den Rechtsschulen: Unterschiede",
        p: [
          "In der dschaʿfaritischen, also schiitischen Praxis wird das Gesicht von oben nach unten und werden die Arme vom Ellenbogen zu den Fingerspitzen gewaschen. Kopf und Füße werden mit der verbliebenen Feuchtigkeit der Hände bestrichen, nicht gewaschen. Das Spülen von Mund und Nase gilt dort als empfohlen.",
          "Auch unter den sunnitischen Schulen gibt es Unterschiede, etwa wie viel vom Kopf bestrichen wird oder ob das Spülen von Mund und Nase Pflicht ist. Der Trainer zeigt die sunnitische und die schiitische Form getrennt, in der schiitischen mit den Bezeichnungen Wadschib für Pflicht und Mustahabb für empfohlen. Für Ihre eigene Praxis zählt die Schule, der Sie folgen.",
        ],
        links: [["/islam/madhahib", "Rechtsschulen"], ["/islam/prayer-shia", "Wudu und Gebet schiitisch"], ["/islam/prayer-sunni", "Wudu und Gebet sunnitisch"]],
      },
      {
        h2: "Was macht das Wudu ungültig?",
        p: [
          "Einig sind sich alle Rechtsschulen bei einigen Punkten: wenn Urin, Stuhl oder Winde den Körper verlassen, bei tiefem Schlaf und bei Bewusstlosigkeit. Danach ist für das nächste Gebet ein neuer Wudu nötig.",
          "Andere Punkte, etwa Berührungen, Blutungen oder weitere Ausscheidungen, beurteilen die Schulen unterschiedlich, und für Situationen, die eine Ganzwaschung (Ghusl) erfordern, gelten eigene Regeln. Diese Seite gibt dazu keine Einzelurteile; fragen Sie bei Unsicherheit eine Lehrerin oder einen Lehrer Ihrer Schule.",
        ],
        links: [["/learn-salah", "Gebet lernen"]],
      },
      {
        h2: "Kein Wasser? Tayammum",
        p: [
          "Wenn kein Wasser vorhanden ist oder es Ihnen schaden würde, erlaubt der Koran die Reinigung mit reiner Erde, den Tayammum; erwähnt wird er in Sure 5, Vers 6, und in Sure 4, Vers 43. Sie fassen die Absicht, schlagen mit den Handflächen auf reine Erde und streichen damit über Gesicht und Hände.",
          "Wie oft geschlagen und wie weit über die Hände gestrichen wird, beschreiben die Schulen unterschiedlich. Sobald Sie wieder Wasser verwenden können, machen Sie für das nächste Gebet wieder Wudu.",
        ],
        links: [["/surah/4", "Sure 4: an-Nisa"]],
      },
      {
        h2: "Wudu für Neumuslime, Frauen und Kinder",
        p: [
          "Für Neumuslime ist der Wudu oft die erste Handlung, die sie lernen. Gehen Sie den Ablauf zuerst im Trainer durch, sprechen Sie die Reihenfolge laut mit und üben Sie dann am Waschbecken. Nach wenigen Tagen ist der Ablauf meist vertraut, und das Quiz am Ende zeigt, ob alles sitzt.",
          "Der Trainer zeigt die Schritte wahlweise mit einer männlichen oder einer weiblichen Figur mit Kopftuch. Kinder lernen am leichtesten durch Nachmachen: Waschen Sie sich gemeinsam, zählen Sie die Durchgänge laut und lassen Sie das Kind die Reihenfolge erklären.",
        ],
        links: [["/learn-islam", "Islam lernen"], ["/guides/quran-for-kids", "Lernen mit Kindern"]],
      },
      {
        h2: "Vom Wudu zum Gebet",
        p: [
          "Nach dem Wudu folgt das Gebet. Wenn Sie es noch lernen, öffnen Sie im Anschluss den Gebetstrainer, zu dem der Wudu-Trainer direkt weiterführt. Die nächste Gebetszeit für Ihren Ort sehen Sie in der Gebetszeiten-Ansicht.",
          "Ein Wudu gilt für mehrere Gebete, solange er nicht aufgehoben wurde. Prüfen Sie vor jedem Gebet kurz, ob seitdem etwas geschehen ist, das ihn aufhebt.",
        ],
        links: [["/salah", "Gebetstrainer"], ["/prayer", "Gebetszeiten"]],
      },
    ],
    stepsTitle: "Wudu üben in sechs Schritten",
    steps: [
      { title: "Tradition wählen", body: "Öffnen Sie den Trainer und wählen Sie die sunnitische oder die schiitische Form." },
      { title: "Ablauf ansehen", body: "Spielen Sie die Animation ab und achten Sie auf Reihenfolge und Wiederholungen." },
      { title: "Pflicht und Empfehlung unterscheiden", body: "Merken Sie sich, welche Schritte als Pflicht und welche als empfohlen gekennzeichnet sind." },
      { title: "Im Kopf durchgehen", body: "Sagen Sie die Schritte ohne Hilfe der Reihe nach auf." },
      { title: "Am Waschbecken üben", body: "Führen Sie den Wudu in Ruhe aus, zuerst langsam, mit der Absicht im Herzen." },
      { title: "Quiz machen", body: "Prüfen Sie sich mit dem kurzen Quiz am Ende des Trainers." },
    ],
    faqTitle: "Fragen zum Wudu",
    faq: [
      { q: "Wie macht man Wudu richtig?", a: "Mit der Absicht, dann in fester Reihenfolge: Gesicht, Arme bis zu den Ellenbogen, Bestreichen des Kopfes und die Füße bis zu den Knöcheln, dazu je nach Schule Hände, Mund, Nase und Ohren. Der Trainer zeigt die genaue Abfolge Ihrer Tradition." },
      { q: "Was ist beim Wudu die richtige Reihenfolge?", a: "Gesicht, Arme, Kopf und Füße folgen der Reihenfolge des Verses in Sure 5. Davor kommen in der sunnitischen Praxis üblicherweise Hände, Mund und Nase. Wie streng die Reihenfolge einzuhalten ist, beurteilen die Schulen unterschiedlich." },
      { q: "Was macht das Wudu ungültig?", a: "Alle Schulen nennen das Austreten von Urin, Stuhl oder Winden, tiefen Schlaf und Bewusstlosigkeit. Weitere Punkte beurteilen sie unterschiedlich; fragen Sie dazu eine kundige Person Ihrer Schule." },
      { q: "Darf man Wudu mit Socken machen?", a: "Das Bestreichen von Ledersocken (Chuffain) kennen die sunnitischen Schulen unter bestimmten Bedingungen, die schiitische Praxis nicht. Ob und wie das für Sie gilt, besprechen Sie bitte mit einer kundigen Person Ihrer Schule." },
      { q: "Gibt es eine Dua nach dem Wudu?", a: "Ja, ein kurzes Bittgebet nach der Waschung ist überliefert. Sie finden es in der Dua-Sammlung mit arabischem Text, Umschrift und Übersetzung." },
      { q: "Was ist der Unterschied zwischen sunnitischem und schiitischem Wudu?", a: "Vor allem die Richtung beim Waschen der Arme und dass Kopf und Füße in der schiitischen Praxis mit der verbliebenen Feuchtigkeit bestrichen werden. Der Trainer zeigt beide Formen." },
      { q: "Wie lange dauert Wudu?", a: "Mit etwas Übung wenige Minuten." },
      { q: "Kostet der Trainer etwas?", a: "Nein. Der Wudu-Trainer ist kostenlos und ohne Anmeldung nutzbar." },
    ],
    linksTitle: "Weiterlesen und üben",
    links: [["/wudu", "Wudu-Trainer"], ["/salah", "Gebet lernen"], ["/prayer", "Gebetszeiten"], ["/duas", "Duas"], ["/islam/madhahib", "Rechtsschulen"], ["/islam/prayer-sunni", "Sunnitisches Gebet"], ["/islam/prayer-shia", "Schiitisches Gebet"], ["/learn-salah", "Gebet lernen Anleitung"]],
    cta: ["/wudu", "Wudu jetzt üben"],
  },

  "learn-islam": {
    title: "Islam lernen: Grundlagen für Einsteiger und Neumuslime",
    description: "Islam lernen für Anfänger: Glaube, Gebet, Ramadan, Hadsch und Alltag verständlich erklärt, sunnitisch und schiitisch. Kostenlos und ohne Druck.",
    kicker: "Islam Grundlagen",
    h1: "Islam lernen: Grundlagen verständlich erklärt",
    intro: "Islam lernen kann aus Neugier beginnen, durch Freunde und Familie oder weil Sie gerade Muslim geworden sind. Diese Seite ordnet die Grundlagen in eine sinnvolle Reihenfolge: was Muslime glauben, welche Pflichten den Alltag prägen, wie Sie Gebet und Koran kennenlernen und wo Sie auf Quran Masterclass in Ruhe weiterlesen können.",
    answer: "Der Islam ist eine monotheistische Religion, deren Grundlage der Glaube an den einen Gott (Allah) und an Muhammad als Seinen Gesandten ist; die zentrale Schrift ist der Koran. Zur Praxis gehören das tägliche Gebet, das Fasten im Ramadan, die Abgabe für Bedürftige und die Pilgerfahrt nach Mekka. Quran Masterclass erklärt diese Grundlagen auf Deutsch, neutral für sunnitische und schiitische Muslime, mit Gebets- und Wudu-Trainer, dem Koran mit Übersetzung und Kursen; die Website ist kostenlos, die iOS-App nutzt dasselbe Konto.",
    sections: [
      {
        h2: "Islam Grundlagen einfach erklärt",
        p: [
          "Das Wort Islam bedeutet Hingabe an Gott. Im Zentrum steht der Glaube an den einen Gott, der keine Teilhaber hat, und daran, dass Er Propheten gesandt hat, von Adam über Abraham, Mose und Jesus bis zu Muhammad, dem letzten Propheten. Der Koran gilt Muslimen als Wort Gottes, das Muhammad im 7. Jahrhundert offenbart wurde.",
          "Zum Glauben (Iman) gehören nach verbreiteter Darstellung der Glaube an Allah, an Seine Engel, Seine Schriften, Seine Gesandten, den Jüngsten Tag und die göttliche Bestimmung. Die Grundlagenseiten erklären diese Punkte einzeln und in ruhigem Ton.",
        ],
        links: [["/islam/islam", "Was ist Islam?"], ["/islam/iman", "Der Glaube"], ["/islam/prophet", "Der Prophet"]],
      },
      {
        h2: "Was sind die fünf Säulen des Islam?",
        p: [
          "In der sunnitischen Darstellung ruht die Praxis auf fünf Säulen: dem Glaubensbekenntnis (Schahada), dem täglichen Gebet (Salah), der Pflichtabgabe für Bedürftige (Zakat), dem Fasten im Monat Ramadan (Saum) und der Pilgerfahrt nach Mekka (Hadsch) für alle, die dazu körperlich und finanziell in der Lage sind.",
          "Die schiitische Lehre gliedert anders: Sie unterscheidet die Grundlagen des Glaubens (Usul ad-Din), nämlich Einheit Gottes, Gerechtigkeit, Prophetentum, Imamat und Auferstehung, von den Pflichten der Praxis (Furu ad-Din), zu denen ebenfalls Gebet, Fasten, Zakat und Hadsch gehören, außerdem unter anderem der Chums. Im Alltag teilen beide Richtungen die meisten Handlungen.",
        ],
        links: [["/islam/ramadan", "Ramadan"], ["/islam/hajj", "Hadsch"], ["/islam/prayer-sunni", "Gebet sunnitisch"], ["/islam/prayer-shia", "Gebet schiitisch"]],
      },
      {
        h2: "Unterschiede zwischen sunnitischem und schiitischem Islam",
        p: [
          "Die Trennung geht auf die Frage zurück, wer die Gemeinschaft nach dem Tod des Propheten führen sollte. Sunniten folgen in der Regel einer der vier großen Rechtsschulen, Schiiten der Linie der Imame aus der Familie des Propheten, beginnend mit Ali, und mehrheitlich der dschaʿfaritischen Rechtsschule.",
          "Beide teilen den Koran, den Glauben an den einen Gott und an Muhammad als letzten Propheten sowie die Grundformen von Gebet, Fasten und Pilgerfahrt. Unterschiede zeigen sich in Überlieferungen, Gelehrten und Details der Praxis. Quran Masterclass stellt beide Sichtweisen sachlich nebeneinander, ohne zu werten; für Ihre eigene Praxis zählt die Schule, der Sie folgen.",
        ],
        links: [["/islam/madhahib", "Rechtsschulen"], ["/nahj", "Nahdsch al-Balagha"]],
      },
      {
        h2: "Erste Schritte als Neumuslim",
        p: [
          "Der Eintritt in den Islam geschieht durch das Glaubensbekenntnis, die Schahada, die man aus Überzeugung ausspricht. Viele tun das in einer Moschee im Beisein anderer, was auch den Kontakt zu einer Gemeinde erleichtert. Wie Sie dabei vorgehen möchten, besprechen Sie am besten mit einer Gemeinde oder einer kundigen Person.",
          "Danach gilt: in Ihrem Tempo. Bewährt hat sich die Reihenfolge Wudu, Gebet, al-Fatiha und einige kurze Suren, dann die Gebetszeiten und ein paar Duas für den Alltag. Niemand erwartet, dass Sie in den ersten Wochen alles wissen. Fragen sind willkommen, und Unsicherheit gehört zum Anfang.",
        ],
        links: [["/learn-wudu", "Wudu Anleitung"], ["/learn-salah", "Gebet lernen"], ["/surah/1", "Sure 1: al-Fatiha"]],
      },
      {
        h2: "Islam im Alltag: Gebet, Fasten und Spenden",
        p: [
          "Der Islam prägt den Tag durch die Gebetszeiten und das Jahr durch den Ramadan und die beiden Feste, das Fest des Fastenbrechens und das Opferfest. Der islamische Kalender richtet sich nach dem Mond, deshalb wandern Ramadan und Feiertage jedes Jahr um etwa elf Tage nach vorn.",
          "Auch Essen, Geschäftsleben und der Umgang mit anderen werden von Grundsätzen begleitet, die mit den Begriffen Halal und Haram beschrieben werden. Die Grundlagenseiten erklären, was diese Begriffe bedeuten und wo die Schulen sich unterscheiden. Duas für alltägliche Situationen, vom Essen bis zum Reisen, finden Sie in der Dua-Sammlung.",
        ],
        links: [["/islam/daily", "Alltag als Muslim"], ["/islam/halal-haram", "Halal und Haram"], ["/calendar", "Islamischer Kalender"], ["/islam/eid", "Die Feste"]],
      },
      {
        h2: "Den Koran kennenlernen",
        p: [
          "Der Koran besteht aus 114 Suren. Lesen Sie ihn nicht von der ersten Seite an durch, sondern beginnen Sie mit kurzen Suren und einer guten Übersetzung. Hören Sie die Rezitation dazu, denn der Koran wurde von Anfang an vorgetragen und gehört; schon sein Name bedeutet Lesung oder Vortrag.",
          "Wenn Sie tiefer gehen möchten, öffnen Sie bei einzelnen Versen den Tafsir, die Erklärung der Gelehrten. Für einen strukturierten Einstieg in Glaubenslehre, Prophetenbiografie, Ethik und mehr gibt es zwölf Kurse mit Lektionen und Quiz.",
        ],
        links: [["/quran", "Koran mit Übersetzung"], ["/courses", "Kurse"], ["/islam/quran", "Der Koran im Islam"]],
      },
      {
        h2: "Islam lernen online auf Deutsch: wo beginnen?",
        p: [
          "Auf Quran Masterclass ist die Oberfläche vollständig auf Deutsch, insgesamt in 14 Sprachen. Ein sinnvoller Pfad: zuerst die Übersicht der Grundlagen, dann Wudu und Gebet mit den Trainern, parallel der Koran mit Übersetzung, schließlich die Kurse.",
          "Eine Website kann eine Gemeinschaft nicht ersetzen. Suchen Sie Menschen, bei denen Sie sich willkommen fühlen, und stellen Sie Ihre Fragen einer Gelehrten oder einem Imam Ihres Vertrauens. Die iOS-App begleitet Sie mit demselben Konto auch unterwegs.",
        ],
        links: [["/islam", "Islam Übersicht"], ["/app", "iOS-App"]],
      },
    ],
    stepsTitle: "Erste Schritte in den Islam",
    steps: [
      { title: "Überblick gewinnen", body: "Lesen Sie die Einführung, um Grundbegriffe wie Iman, Salah und Zakat einordnen zu können." },
      { title: "Wudu lernen", body: "Üben Sie die Gebetswaschung mit dem Trainer." },
      { title: "Das Gebet lernen", body: "Gehen Sie den Ablauf Schritt für Schritt durch und lernen Sie al-Fatiha." },
      { title: "Täglich Koran hören", body: "Hören Sie einige Verse mit deutscher Übersetzung." },
      { title: "Den Alltag entdecken", body: "Lesen Sie über Ramadan, die Feste sowie Halal und Haram." },
      { title: "Fragen sammeln und Gemeinschaft suchen", body: "Notieren Sie Fragen und besprechen Sie sie mit einer kundigen Person oder in einer Gemeinde." },
    ],
    faqTitle: "Fragen zum Islam für Einsteiger",
    faq: [
      { q: "Was sind die fünf Säulen des Islam?", a: "Glaubensbekenntnis, Gebet, Zakat, Fasten im Ramadan und Pilgerfahrt. So zählt die sunnitische Tradition; die schiitische Lehre ordnet Gebet, Fasten, Zakat und Hadsch den Pflichten der Praxis zu." },
      { q: "Wie wird man Muslim?", a: "Durch das Glaubensbekenntnis (Schahada), das aus Überzeugung gesprochen wird. Informieren Sie sich in Ruhe und sprechen Sie mit einer Gemeinde oder einer kundigen Person, wenn Sie diesen Schritt gehen möchten." },
      { q: "Was muss ein Neumuslim zuerst lernen?", a: "Bewährt haben sich Wudu, das Gebet mit al-Fatiha und einigen kurzen Suren, die Gebetszeiten und ein paar Duas. Alles Weitere folgt nach und nach." },
      { q: "Was ist der Unterschied zwischen Sunniten und Schiiten?", a: "Er geht auf die Frage der Führung nach dem Propheten zurück und zeigt sich heute in Überlieferungen, Gelehrten und Details der Praxis. Den Koran, den Glauben an den einen Gott und die Grundformen des Gebets teilen beide." },
      { q: "Muss ich Arabisch lernen?", a: "Für das Gebet lernen Sie einige kurze Texte auf Arabisch. Zum Verstehen des Korans hilft die deutsche Übersetzung; Arabisch können Sie später vertiefen." },
      { q: "Kann ich den Islam online auf Deutsch lernen?", a: "Ja. Die Grundlagenseiten, die Trainer für Wudu und Gebet, der Koran mit deutscher Übersetzung und die Kurse sind auf Deutsch verfügbar und auf der Website kostenlos." },
      { q: "Ist Quran Masterclass eine Religionsberatung?", a: "Nein. Die Seiten sind Lernhilfen und keine Fatwas. Persönliche und rechtliche Fragen klären Sie mit einer Gelehrten oder einem Imam Ihres Vertrauens." },
    ],
    linksTitle: "Weiterlesen",
    links: [["/islam", "Islam Übersicht"], ["/islam/islam", "Was ist Islam?"], ["/islam/iman", "Glaube"], ["/islam/ramadan", "Ramadan"], ["/islam/hajj", "Hadsch"], ["/salah", "Gebet lernen"], ["/wudu", "Wudu"], ["/calendar", "Islamischer Kalender"], ["/quran", "Koran lesen"]],
    cta: ["/islam", "Grundlagen lesen"],
  },
};

export default hubs;
