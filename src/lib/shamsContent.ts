// Long-form content of the Shams Method page (/shams). German and English; other languages fall back to English.
export type StepDetail = { what: string; why: string; platform: string; time: string };
export type ShamsContent = {
  heroKicker: string; heroTitle: string; heroLead: string; heroBy: string;
  heroFacts?: { n: string; l: string }[];        // three honest key numbers under the hero
  stepTags?: string[];                             // the learning principle behind each of the seven steps
  principlesLead?: string;                         // intro of "Why it works"
  heritage?: { title: string; lead: string; items: { ar: string; t: string; d: string }[] }; // roots in the hifz tradition
  finalPoints?: string[];                          // three short reassurances at the final call to action
  name?: { title: string; body: string; verses: { ar: string; ref: string; meaning: string }[] };
  demoTitle: string; demoStages: string[];
  problemTitle: string; problems: { t: string; d: string }[];
  solutionTitle: string; solution: string;
  stepsTitle: string; stepsLead: string; labels: { what: string; why: string; platform: string; time: string };
  steps: StepDetail[];
  curveTitle: string; curveLead: string; curveNote: string; curveAxis: { x: string; y: string; without: string; with: string };
  spacing?: {
    title: string; lead: string;
    points: { t: string; d: string }[];
    ladderTitle: string; ladderLead: string; ladderDay: string; ladderNote: string;
    fluencyTitle: string; fluencyLead: string; fluencySteps: { min: string; d: string }[]; fluencyNote: string;
    meaningTitle: string; meaning: string;
    rule: string;
  };
  adaptTitle: string; adapt: { t: string; d: string }[];
  compareTitle: string; compareLead: string; compareCols: string[]; compareRows: { label: string; cells: string[] }[]; compareNote: string;
  teachTitle: string; teachLead: string; teachPlan: { min: string; t: string; d: string }[]; teachNote: string;
  deepTitle: string; deepLead: string;
  faq: { q: string; a: string }[];
  finalTitle: string; finalLead: string;
};

const de: ShamsContent = {
  heroKicker: "Quran Masterclass · Lernmethode",
  heroTitle: "Die Shams-Methode",
  heroLead: "Ein Weg, den Koran so zu lernen, dass er bleibt: Jeder Vers wird gehört, gesprochen, verstanden, erklärt, aus dem Gedächtnis abgerufen und mit deinem Leben verbunden – in sieben Schritten und etwa vier Minuten. Was die Sprachlern- und Gedächtnisforschung über das Behalten weiß, verbunden mit der Art, wie Koranlehrer seit Jahrhunderten unterrichten.",
  heroBy: "Entwickelt von Nami Shams in Dubai",
  heroFacts: [
    { n: "7", l: "Schritte für jeden Vers" },
    { n: "≈ 4", l: "Minuten für einen neuen Vers" },
    { n: "6", l: "geplante Wiederholungen in drei Monaten" },
  ],
  stepTags: ["Input vor Output", "Backchaining", "Chunking", "Duale Kodierung · Eselsbrücken", "Elaboration", "Abrufübung · verblassende Hinweise", "Tadabbur"],
  principlesLead: "Die Shams-Methode erfindet das Lernen nicht neu. Sie ordnet bekannte, gut untersuchte Prinzipien der Lern- und Gedächtnisforschung so an, dass jeder Vers sie der Reihe nach durchläuft – vom ersten Hören bis zur Wiederholung Monate später.",
  heritage: {
    title: "Verwurzelt in der Tradition der Hifz-Schulen",
    lead: "Keiner der sieben Schritte ist eine Laune. Jeder hat eine Wurzel in der Art, wie Muslime den Koran seit Jahrhunderten weitergeben – die Shams-Methode bringt sie in eine feste Reihenfolge und auf dein Telefon.",
    items: [
      { ar: "تَلَقِّي", t: "Talaqqi – zuerst hören", d: "Der Koran wird von Mund zu Ohr weitergegeben: Der Schüler hört den Vers vom Lehrer, bevor er ihn selbst spricht. Darum beginnt bei uns jeder Vers mit dreimaligem Hören – und darum empfehlen wir, zusätzlich bei einem Lehrer vorzutragen." },
      { ar: "لَوْح", t: "Lauh – die Schreibtafel", d: "In vielen Koranschulen Westafrikas und des Maghreb schreiben Schüler ihren Abschnitt bis heute auf eine Holztafel, lernen ihn auswendig und waschen die Tafel dann ab. Der Text verschwindet, das Gedächtnis bleibt – derselbe Gedanke steckt in den verblassenden Hinweisen von Schritt 6." },
      { ar: "سَبَق · سَبْقِي · مَنْزِل", t: "Sabaq, Sabqi, Manzil", d: "Viele Hifz-Schulen teilen jeden Tag in drei Teile: die neue Lektion (Sabaq), die Verse der letzten Tage (Sabqi) und die Wiederholung des älteren Bestands (Manzil). Das Gedächtnismodell der Shams-Methode plant dieselben drei Ebenen – und passt die Abstände an dich an." },
      { ar: "عَشْرُ آيَات", t: "Zehn Verse – mit Wissen und Handeln", d: "Von Gefährten wie Ibn Mas'ud wird berichtet, dass sie vom Propheten ﷺ zehn Verse lernten und erst weitergingen, wenn sie wussten, was darin an Wissen und Handeln steckt (überliefert bei at-Tabari). Deshalb gehören Bedeutung, Tafsir und Nachdenken zu jedem Vers." },
    ],
  },
  finalPoints: ["Nichts vorbereiten – die Plattform führt dich durch jeden Schritt.", "Lautschrift und Bedeutung stehen unter jedem Wort.", "Danach plant das Gedächtnismodell deine Wiederholungen."],
  name: {
    title: "Warum „Shams“?",
    body: "„Shams“ – شمس – ist das arabische Wort für die Sonne. Es ist zugleich der Familienname von Nami Shams, der die Methode entwickelt hat. Und es beschreibt, wie Lernen hier gemeint ist: Die Sonne geht jeden Morgen auf, nicht einmal im Jahr mit voller Kraft. Sie ist pünktlich, geduldig und beständig – und gerade deshalb lässt sie alles wachsen. So soll auch der Koran in dein Leben kommen: ein wenig Licht jeden Tag, zur richtigen Zeit, bis aus vielen Tagen ein ganzes Leben mit dem Wort Allahs wird. Der Koran selbst schwört bei der Sonne und nennt sie ein Licht, das Allah gemacht hat – eine Erinnerung daran, dass alles Licht von Ihm kommt, auch das Licht des Wissens.",
    verses: [
      { ar: "وَالشَّمْسِ وَضُحَاهَا", ref: "91:1", meaning: "Bei der Sonne und ihrer Morgenhelle." },
      { ar: "هُوَ الَّذِي جَعَلَ الشَّمْسَ ضِيَاءً وَالْقَمَرَ نُورًا", ref: "10:5", meaning: "Er ist es, der die Sonne zu einer Leuchte und den Mond zu einem Licht gemacht hat." },
    ],
  },
  demoTitle: "Ein Vers, vier Stufen",
  demoStages: ["Ganzer Vers", "Rückwärts aufbauen", "Nur Anfangsbuchstaben", "Aus dem Gedächtnis"],
  problemTitle: "Warum so viele das Koranlernen wieder aufgeben",
  problems: [
    { t: "Gelernt – und nach einer Woche vergessen", d: "Ohne geplante Wiederholung verblasst ein Vers schnell. Wer nur neue Verse lernt, verliert die alten." },
    { t: "Klang ohne Bedeutung", d: "Viele können Verse rezitieren, wissen aber nicht, was sie sagen. Was man nicht versteht, hält schlechter im Gedächtnis und berührt weniger das Herz." },
    { t: "Kein System, kein Tagesziel", d: "Heute eine Sure, nächste Woche nichts. Ohne festen Ablauf fehlt der Fortschritt – und mit ihm die Motivation." },
  ],
  solutionTitle: "Die Lösung in einem Satz",
  solution: "Die Shams-Methode gibt jedem Vers denselben festen Weg – Klang vor Bedeutung, Bedeutung vor Gedächtnis, Gedächtnis vor Nachdenken – und ein Gedächtnismodell sorgt dafür, dass jeder gelernte Vers genau dann zurückkommt, wenn er zu verblassen droht.",
  stepsTitle: "Die sieben Schritte im Detail",
  stepsLead: "Jeder Schritt hat eine klare Aufgabe. Zusammen dauern sie etwa vier Minuten pro Vers. Die Plattform führt dich durch jeden einzelnen – du musst nichts vorbereiten.",
  labels: { what: "Was du tust", why: "Warum es wirkt", platform: "Was die Plattform für dich tut", time: "Dauer" },
  steps: [
    { what: "Du hörst den Vers dreimal hintereinander und folgst dabei dem arabischen Text. Noch keine Übersetzung, kein Nachsprechen – nur hören und schauen.", why: "Wer eine Sprache lernt, hört sie zuerst. Wiederholtes Hören baut ein inneres Klangbild auf: Rhythmus, Pausen und Melodie sind schon vertraut, bevor du selbst sprichst. Das senkt die Fehler beim ersten Rezitieren deutlich.", platform: "Die Wiedergabe wiederholt den Vers automatisch, das gerade rezitierte Wort wird farbig markiert. Kinder und Senioren hören ihn fünf- bzw. viermal, in ruhigerem Tempo.", time: "ca. 45 Sekunden" },
    { what: "Der Vers wird von hinten aufgebaut: erst nur das letzte Wort, dann die letzten zwei, dann die letzten drei – bis zum ganzen Vers. Du sprichst jedes Mal mit.", why: "Diese Technik heißt Backchaining und wird im Sprachunterricht für lange Sätze genutzt. Weil jede Wiederholung mit dem Teil endet, den du schon am besten kannst, bleibt die Melodie natürlich und du stockst nicht am Ende. Der Vers wächst als Einheit zusammen statt als Kette einzelner Wörter.", platform: "Das geht nur, weil die Plattform weiß, wann genau jedes Wort rezitiert wird. Sie spielt den Vers ab jedem beliebigen Wort bis zum Ende und graut die noch nicht geübten Wörter aus.", time: "ca. 60 Sekunden" },
    { what: "Du gehst den Vers Wort für Wort durch: arabisches Wort, Lautschrift, Bedeutung.", why: "Das Gedächtnis speichert kleine, sinnvolle Einheiten leichter als lange Ketten (Chunking). Wenn jedes Wort eine Bedeutung hat, wird aus Lauten Sprache.", platform: "Bedeutung und Lautschrift erscheinen direkt unter jedem Wort. Häufige Wörter kannst du später im Vokabeltrainer festigen.", time: "ca. 30 Sekunden" },
    { what: "Du liest die Übersetzung des ganzen Verses und nutzt die Eselsbrücken: das Ankerwort, den Reim am Versende, die Brücke zum nächsten Vers – und schreibst bei Bedarf deine eigene Merkhilfe.", why: "Bedeutung ist der stärkste Gedächtnisanker. Dazu kommen Hinweise, die im Text selbst liegen: Viele Verse einer Sure enden auf denselben Laut, und die meisten Fehler passieren beim Übergang von einem Vers zum nächsten.", platform: "Ankerwort, Reim und Übergang werden für jeden Vers automatisch ermittelt. Deine eigenen Eselsbrücken werden in deinem Konto gespeichert.", time: "ca. 40 Sekunden" },
    { what: "Du liest die klassische Erklärung: Zusammenhang, Anlass der Offenbarung und was die Gelehrten dazu lehren.", why: "Wer weiß, warum ein Vers offenbart wurde und worauf er antwortet, versteht ihn tiefer – und erinnert sich an ihn wie an eine Geschichte, nicht wie an eine Wortliste.", platform: "Tafsir aus anerkannten Werken, immer mit Quellenangabe. Die Shams-Methode erfindet keine eigene Auslegung.", time: "ca. 45 Sekunden" },
    { what: "Die Wörter verschwinden in Stufen: Zuerst siehst du nur noch den Anfangsbuchstaben jedes Wortes, dann gar nichts mehr. Du rezitierst aus dem Gedächtnis, deckst auf und bewertest dich ehrlich.", why: "Aktives Abrufen festigt Wissen weit stärker als erneutes Lesen. Die Hinweise werden bewusst schrittweise weggenommen – gerade genug Hilfe, damit du selbst darauf kommst.", platform: "Deine Bewertung fließt direkt in dein persönliches Gedächtnismodell: Der Vers kommt zum richtigen Zeitpunkt zur Wiederholung zurück.", time: "ca. 40 Sekunden" },
    { what: "Du schreibst ein bis zwei Sätze: Was sagt mir dieser Vers über Allah? Über mich? Was nehme ich mir heute vor?", why: "Allah sagt: „Ein gesegnetes Buch, das Wir zu dir hinabgesandt haben, damit sie über seine Verse nachdenken“ (38:29). Nachdenken (Tadabbur) verbindet den Vers mit deinem Leben – und was persönlich bedeutsam ist, bleibt am längsten.", platform: "Deine Notizen werden im Konto gespeichert und sind bei jeder Wiederholung wieder sichtbar.", time: "ca. 30 Sekunden" },
  ],
  curveTitle: "Warum Wiederholung zum richtigen Zeitpunkt alles entscheidet",
  curveLead: "Ohne Wiederholung sinkt das Erinnern schnell. Jede Wiederholung zum richtigen Zeitpunkt flacht die Kurve ab – der Abstand bis zur nächsten Wiederholung wird größer. Die Shams-Methode wiederholt jeden Vers nach etwa 1, 3, 7, 14, 30 und 90 Tagen – und passt diese Abstände an dich an.",
  curveNote: "Schematische Darstellung des Prinzips, keine Messdaten.",
  curveAxis: { x: "Tage", y: "Erinnern", without: "ohne Wiederholung", with: "mit Wiederholung" },
  spacing: {
    title: "Vertiefung: Wie Wiederholung wirklich wirkt",
    lead: "Die Kurve oben ist kein Trick, sondern eine der am besten belegten Beobachtungen der Gedächtnisforschung: Was wir lernen, verblasst nach einer vorhersagbaren Kurve – und jede Wiederholung im richtigen Moment macht die nächste Kurve flacher. Daraus folgen vier Dinge, die jeder Koranschüler kennen sollte.",
    points: [
      { t: "Am Stück wiederholen fühlt sich gut an – und hält am kürzesten", d: "Wer einen Vers an einem Abend fünfzigmal hintereinander rezitiert, kann ihn in dieser Stunde perfekt. Am nächsten Morgen ist ein großer Teil weg. Der Grund: Wiederholungen direkt hintereinander treffen auf eine Erinnerung, die noch ganz frisch ist. Das Gehirn muss sich nicht anstrengen, also speichert es nichts Neues. Forscher nennen das massiertes Lernen. Es erzeugt ein Gefühl von Sicherheit, aber wenig dauerhafte Spur." },
      { t: "Die richtige Mühe: kurz bevor es weg ist", d: "Die stärkste Erinnerung entsteht, wenn du einen Vers abrufen musst, der schon fast verblasst ist – und es gerade noch schaffst. Diese kleine Anstrengung ist das Signal an dein Gehirn: „Das ist wichtig, bewahr es länger.“ Deshalb kommt bei uns jeder Vers nach etwa einem Tag zurück, dann nach drei, sieben, vierzehn, dreißig und neunzig Tagen. Jedes Mal, wenn du ihn schaffst, wird der Abstand länger; wenn du ihn verfehlst, wird er kürzer." },
      { t: "Wo Dauer-Wiederholung trotzdem hingehört", d: "Nonstop-Wiederholung ist nicht nutzlos – sie hat nur eine andere Aufgabe: das erste Einprägen. In den ersten Minuten mit einem neuen Vers brauchst du Dichte: dreimal hören, rückwärts aufbauen, mit Hinweisen rezitieren. Genau das tut die Shams-Methode in den Schritten 1 bis 6. Und die Hifz-Schulen wissen seit Jahrhunderten, dass auf dieses dichte Einprägen eine tägliche Durchsicht des Alten folgen muss – Sabaq, Sabqi, Manzil: das Neue von heute, das Neue der letzten Tage, und ein Teil des Alten. Die Methode verbindet beides: dicht am Anfang, dann gestreckt." },
      { t: "Verstehen, was gemeint ist, ist der stärkste Kleber", d: "Ein Vers, den du nur als Klangkette kennst, hat nur einen Weg in dein Gedächtnis. Ein Vers, dessen Wörter du kennst, dessen Zusammenhang du gelesen hast und über den du einen Satz nachgedacht hast, hat vier Wege – und wenn einer abreißt, tragen die anderen. Deshalb stehen Wort-für-Wort, Tafsir und Nachdenken mitten in der Methode und nicht als Zugabe am Ende. Wer versteht, vergisst langsamer, und wer vergisst, findet den Vers über die Bedeutung wieder." },
    ],
    ladderTitle: "Die Wiederholungsleiter",
    ladderLead: "So wandert ein Vers, den du heute lernst, durch die kommenden Monate – wenn du ihn jedes Mal schaffst.",
    ladderDay: "Tag",
    ladderNote: "Sechs Wiederholungen in drei Monaten reichen, damit ein Vers sitzt – wenn sie zum richtigen Zeitpunkt kommen. Fünfzig Wiederholungen an einem Abend reichen nicht.",
    fluencyTitle: "4 · 3 · 2 – flüssig werden",
    fluencyLead: "Eine Technik aus dem Sprachunterricht, die sich für das Rezitieren eignet, sobald ein Abschnitt grundsätzlich sitzt: Rezitiere denselben Abschnitt dreimal hintereinander – und gib dir jedes Mal weniger Zeit.",
    fluencySteps: [
      { min: "4 Minuten", d: "Langsam, mit Mushaf oder Hinweisen, alles korrekt – Tadschwid vor Tempo." },
      { min: "3 Minuten", d: "Denselben Abschnitt ohne Hilfe, Fehler kurz markieren, nicht stoppen." },
      { min: "2 Minuten", d: "Noch einmal, im Tempo eines Rezitators. Jetzt trägt die Melodie den Text." },
    ],
    fluencyNote: "Die kürzer werdende Zeit zwingt dich, nicht mehr Wort für Wort zu denken, sondern in Sinnabschnitten – so, wie Rezitatoren es tun. Benutze dafür die Wiedergabe-Geschwindigkeit im Player: 0,75× beim ersten, 1× beim zweiten, 1,25× beim dritten Durchgang.",
    meaningTitle: "Was „verstehen“ hier heißt",
    meaning: "Nicht Gelehrter werden – sondern beim Rezitieren wissen, wovon der Vers spricht. Drei Fragen reichen: Wer spricht hier zu wem? Was wird versprochen, befohlen oder erzählt? Was ändert das heute an meinem Tag? Wenn du diese drei Fragen in einem Satz beantworten kannst, hast du den Vers verstanden – und du wirst ihn nicht mehr mit einem anderen verwechseln, der ähnlich klingt.",
    rule: "Merksatz: Dicht lernen, gestreckt wiederholen, mit Bedeutung verankern.",
  },
  adaptTitle: "Eine Methode, die dich kennenlernt",
  adapt: [
    { t: "Persönlicher Gedächtnisfaktor", d: "Jeder Vers bekommt seinen eigenen Faktor. Fällt er dir schwer, kommt er früher zurück; fällt er dir leicht, später. Keine zwei Lernenden haben denselben Plan." },
    { t: "Fehler zählen", d: "Jeder Fehler in einem Academy-Test holt den Vers am nächsten Tag zurück. Deine schwächsten Verse werden dir zuerst gezeigt." },
    { t: "Angepasst an dein Alter", d: "Kinder und Senioren bekommen ruhigeres Tempo, mehr Wiederholungen und mehr Zeit in Tests. Der empfohlene Plan richtet sich nach deinem Alter." },
    { t: "Wachsende Tagesmenge", d: "Dein 365-Tage-Plan beginnt klein und legt jede Woche etwas drauf – vom sanften Einstieg bis zum Hafiz-Track mit dem ganzen Koran in etwa einem Jahr." },
  ],
  compareTitle: "Wie sich die Shams-Methode unterscheidet",
  compareLead: "Kein Weg ist der einzig richtige. Der Vergleich zeigt, was jeder Ansatz abdeckt – und warum wir empfehlen, die Shams-Methode mit einem Lehrer zu verbinden.",
  compareCols: ["Nur hören", "Nur Übersetzung lesen", "Lehrer (Talaqqi)", "Shams-Methode"],
  compareRows: [
    { label: "Richtige Aussprache", cells: ["teilweise", "nein", "ja", "ja, mit Wort-Markierung"] },
    { label: "Bedeutung verstehen", cells: ["nein", "ja", "je nach Lehrer", "ja, Wort für Wort und Tafsir"] },
    { label: "Geplante Wiederholung", cells: ["nein", "nein", "je nach Lehrer", "ja, persönlich angepasst"] },
    { label: "Jeden Tag, überall", cells: ["ja", "ja", "nein", "ja"] },
    { label: "Korrektur durch einen Menschen", cells: ["nein", "nein", "ja", "nein – deshalb mit Lehrer kombinieren"] },
  ],
  compareNote: "Der Koran wurde seit jeher von Mund zu Ohr weitergegeben (Talaqqi). Die Shams-Methode ersetzt keinen Lehrer – sie sorgt dafür, dass du jeden Tag übst und vorbereitet zum Lehrer kommst.",
  teachTitle: "Für Lehrer, Moscheen und Schulen",
  teachLead: "Die Shams-Methode funktioniert auch im Unterricht. Ein Vorschlag für eine 45-minütige Stunde mit einer Gruppe:",
  teachPlan: [
    { min: "5 Min.", t: "Wiederholung", d: "Die Gruppe rezitiert die Verse der letzten Stunde gemeinsam, dann einzelne Schüler." },
    { min: "5 Min.", t: "Hören", d: "Der neue Abschnitt wird dreimal vorgespielt oder vom Lehrer vorgetragen, alle folgen im Text." },
    { min: "10 Min.", t: "Rückwärts aufbauen im Chor", d: "Lehrer und Klasse bauen jeden Vers vom letzten Wort her auf – erst gemeinsam, dann in kleinen Gruppen." },
    { min: "10 Min.", t: "Bedeutung und Tafsir", d: "Wichtige Wörter, die Übersetzung und eine kurze Erklärung des Zusammenhangs." },
    { min: "10 Min.", t: "Abrufen in Paaren", d: "Ein Schüler rezitiert mit Anfangsbuchstaben, dann ohne Hilfe; der Partner prüft im Text." },
    { min: "5 Min.", t: "Nachdenken", d: "Jeder nennt einen Gedanken zum Vers. Hausaufgabe: täglich in der Academy wiederholen." },
  ],
  teachNote: "Schulen und Moscheen können die Plattform kostenlos nutzen. Schreib uns an info@quranmasterclass.com, wenn du die Methode in deiner Gruppe einsetzen möchtest.",
  deepTitle: "Die Methode ausführlich erklärt",
  deepLead: "Der vollständige Hintergrund: woher jeder Schritt kommt, wie er wirkt und wie du ihn in deinen Alltag bringst.",
  faq: [
    { q: "Was ist die Shams-Methode?", a: "Eine Lernmethode in sieben Schritten pro Vers, entwickelt von Nami Shams: hören, rückwärts aufbauen, Wort für Wort, Bedeutung und Eselsbrücken, Tafsir, verblassende Hinweise und Nachdenken – mit einem Gedächtnismodell, das die Wiederholungen plant. Sie ist kostenlos bei Quran Masterclass." },
    { q: "Was ist daran neu?", a: "Die einzelnen Bausteine stammen aus der Sprachlern- und Gedächtnisforschung und der Hifz-Tradition. Neu ist ihre feste Reihenfolge pro Vers und die Umsetzung mit exakten Wortzeiten: der Rückwärts-Aufbau ab jedem Wort und das stufenweise Ausblenden bis zu den Anfangsbuchstaben – kombiniert mit einem persönlichen Wiederholungsplan." },
    { q: "Wie viele Verse sollte ich pro Tag lernen?", a: "Einsteiger ein bis drei neue Verse am Tag plus die fällige Wiederholung, mit Übung drei bis fünf. Im 365-Tage-Plan wächst die Menge Woche für Woche. Die richtige Menge ist die, die du jeden Tag durchhältst." },
    { q: "Muss ich Arabisch können?", a: "Nein. Lautschrift und Wort-für-Wort-Bedeutung helfen dir ab dem ersten Vers. Mit der Zeit erkennst du Buchstaben und Wörter von selbst – der Vokabeltrainer beschleunigt das." },
    { q: "Ist die Shams-Methode für Kinder geeignet?", a: "Ja. Für Kinder wird das Tempo ruhiger, der Vers öfter gehört und in Tests gibt es mehr Zeit. Der Kinder-Modus zeigt große Schrift und Belohnungen. Am besten lernen Kinder gemeinsam mit einem Elternteil." },
    { q: "Ersetzt die Methode einen Lehrer?", a: "Nein. Für die richtige Aussprache ist das Vortragen bei einem qualifizierten Lehrer sehr empfehlenswert. Die Shams-Methode sorgt dafür, dass du täglich übst und gut vorbereitet bist." },
    { q: "Ist die Shams-Methode ein neuer Tafsir?", a: "Nein. Sie ist eine Lernmethode. Alle Erklärungen stammen aus klassischen Tafsir-Werken und werden mit Quelle angezeigt. Bei religiösen Fragen wende dich an einen qualifizierten Gelehrten." },
    { q: "Was kostet die Shams-Methode?", a: "Nichts. Quran Masterclass ist kostenlos. Du brauchst nur ein Konto, damit dein Fortschritt auf allen Geräten gespeichert wird." },
  ],
  finalTitle: "Dein erster Vers dauert vier Minuten",
  finalLead: "Beginne mit Al-Fatiha. Die Plattform führt dich durch jeden Schritt.",
};

const en: ShamsContent = {
  heroKicker: "Quran Masterclass · learning method",
  heroTitle: "The Shams Method",
  heroLead: "A way to learn the Quran so that it stays: every verse is heard, spoken, understood, explained, recalled from memory and connected to your life – in seven steps and about four minutes. What language-learning and memory research knows about remembering, joined with the way Quran teachers have taught for centuries.",
  heroBy: "Developed by Nami Shams in Dubai",
  heroFacts: [
    { n: "7", l: "steps for every verse" },
    { n: "≈ 4", l: "minutes for a new verse" },
    { n: "6", l: "planned reviews in three months" },
  ],
  stepTags: ["Input before output", "Backchaining", "Chunking", "Dual coding · mnemonics", "Elaboration", "Retrieval practice · fading cues", "Tadabbur"],
  principlesLead: "The Shams Method does not reinvent learning. It arranges well-known, well-studied principles of learning and memory research so that every verse passes through them in order – from the first listening to the review months later.",
  heritage: {
    title: "Rooted in the tradition of the hifz schools",
    lead: "None of the seven steps is a whim. Each has a root in the way Muslims have passed on the Quran for centuries – the Shams Method puts them into a fixed order and onto your phone.",
    items: [
      { ar: "تَلَقِّي", t: "Talaqqi – listening first", d: "The Quran is passed on from mouth to ear: the student hears the verse from the teacher before speaking it. That is why every verse here begins with listening three times – and why we recommend reciting to a teacher as well." },
      { ar: "لَوْح", t: "Lawh – the writing tablet", d: "In many Quran schools of West Africa and the Maghreb, students still write their passage on a wooden tablet, learn it by heart and then wash the tablet clean. The text disappears, the memory stays – the same idea lives in the fading cues of step 6." },
      { ar: "سَبَق · سَبْقِي · مَنْزِل", t: "Sabaq, sabqi, manzil", d: "Many hifz schools divide each day into three parts: the new lesson (sabaq), the verses of the last few days (sabqi) and the review of older portions (manzil). The memory model of the Shams Method plans the same three levels – and adapts the gaps to you." },
      { ar: "عَشْرُ آيَات", t: "Ten verses – with knowledge and action", d: "It is reported of Companions such as Ibn Mas'ud that they learned ten verses from the Prophet ﷺ and only moved on once they knew the knowledge and the action contained in them (narrated by at-Tabari). That is why meaning, tafsir and reflection belong to every verse." },
    ],
  },
  finalPoints: ["Nothing to prepare – the platform guides you through every step.", "Transliteration and meaning appear under every word.", "Afterwards the memory model plans your reviews."],
  name: {
    title: "Why “Shams”?",
    body: "“Shams” – شمس – is the Arabic word for the sun. It is also the family name of Nami Shams, who developed the method. And it describes how learning is meant here: the sun rises every morning, not once a year with full force. It is punctual, patient and steady – and that is exactly why it makes everything grow. This is how the Quran should enter your life: a little light every day, at the right time, until many days become a whole life with the word of Allah. The Quran itself swears by the sun and calls it a light that Allah has made – a reminder that all light comes from Him, the light of knowledge too.",
    verses: [
      { ar: "وَالشَّمْسِ وَضُحَاهَا", ref: "91:1", meaning: "By the sun and its morning brightness." },
      { ar: "هُوَ الَّذِي جَعَلَ الشَّمْسَ ضِيَاءً وَالْقَمَرَ نُورًا", ref: "10:5", meaning: "It is He who made the sun a shining radiance and the moon a light." },
    ],
  },
  demoTitle: "One verse, four stages",
  demoStages: ["Whole verse", "Build up backwards", "First letters only", "From memory"],
  problemTitle: "Why so many people give up learning the Quran",
  problems: [
    { t: "Learned – and forgotten a week later", d: "Without planned review a verse fades quickly. Whoever only learns new verses loses the old ones." },
    { t: "Sound without meaning", d: "Many can recite verses but don't know what they say. What you don't understand is harder to remember and touches the heart less." },
    { t: "No system, no daily goal", d: "One surah today, nothing next week. Without a fixed routine there is no progress – and with it goes the motivation." },
  ],
  solutionTitle: "The solution in one sentence",
  solution: "The Shams Method gives every verse the same fixed path – sound before meaning, meaning before memory, memory before reflection – and a memory model brings every learned verse back exactly when it is about to fade.",
  stepsTitle: "The seven steps in detail",
  stepsLead: "Every step has one clear task. Together they take about four minutes per verse. The platform guides you through each of them – you don't need to prepare anything.",
  labels: { what: "What you do", why: "Why it works", platform: "What the platform does for you", time: "Time" },
  steps: [
    { what: "You listen to the verse three times in a row and follow the Arabic text. No translation, no speaking yet – just listening and looking.", why: "Whoever learns a language hears it first. Repeated listening builds an inner sound image: rhythm, pauses and melody are already familiar before you speak yourself. That clearly reduces mistakes when you first recite.", platform: "Playback repeats the verse automatically and highlights the word being recited. Children and seniors hear it five or four times, at a calmer pace.", time: "about 45 seconds" },
    { what: "The verse is built up from the end: first only the last word, then the last two, then the last three – up to the whole verse. You speak along each time.", why: "This technique is called backchaining and is used in language teaching for long sentences. Because every repetition ends on the part you know best, the melody stays natural and you don't stumble at the end. The verse grows together as one unit instead of a chain of single words.", platform: "This is only possible because the platform knows exactly when each word is recited. It plays the verse from any word to the end and greys out the words not practised yet.", time: "about 60 seconds" },
    { what: "You go through the verse word by word: Arabic word, transliteration, meaning.", why: "Memory stores small, meaningful units more easily than long chains (chunking). When every word has a meaning, sounds become language.", platform: "Meaning and transliteration appear right under each word. You can strengthen common words later in the vocabulary trainer.", time: "about 30 seconds" },
    { what: "You read the translation of the whole verse and use the memory hooks: the anchor word, the rhyme at the end of the verse, the bridge to the next verse – and write your own mnemonic if you like.", why: "Meaning is the strongest memory anchor. On top come cues hidden in the text itself: many verses of a surah end on the same sound, and most mistakes happen at the transition from one verse to the next.", platform: "Anchor word, rhyme and transition are found automatically for every verse. Your own mnemonics are saved in your account.", time: "about 40 seconds" },
    { what: "You read the classical explanation: context, occasion of revelation and what the scholars teach about it.", why: "Whoever knows why a verse was revealed and what it answers understands it more deeply – and remembers it like a story, not like a list of words.", platform: "Tafsir from recognised works, always with its source. The Shams Method does not create its own interpretation.", time: "about 45 seconds" },
    { what: "The words disappear in stages: first you only see the first letter of each word, then nothing at all. You recite from memory, reveal and rate yourself honestly.", why: "Active recall strengthens knowledge far more than reading again. The cues are taken away step by step on purpose – just enough help for you to find the word yourself.", platform: "Your rating goes straight into your personal memory model: the verse comes back for review at the right time.", time: "about 40 seconds" },
    { what: "You write one or two sentences: What does this verse tell me about Allah? About me? What will I take with me today?", why: "Allah says: “A blessed Book which We have revealed to you, so that they may reflect upon its verses” (38:29). Reflection (tadabbur) connects the verse to your life – and what is personally meaningful stays the longest.", platform: "Your notes are saved in your account and shown again at every review.", time: "about 30 seconds" },
  ],
  curveTitle: "Why reviewing at the right time decides everything",
  curveLead: "Without review, remembering drops quickly. Every review at the right moment flattens the curve – and the gap until the next review grows. The Shams Method reviews every verse after about 1, 3, 7, 14, 30 and 90 days – and adapts these gaps to you.",
  curveNote: "Schematic illustration of the principle, not measured data.",
  curveAxis: { x: "days", y: "remembering", without: "without review", with: "with review" },
  spacing: {
    title: "Going deeper: how repetition really works",
    lead: "The curve above is not a trick but one of the best-documented findings of memory research: what we learn fades along a predictable curve – and every review at the right moment makes the next curve flatter. Four things follow from this that every Quran student should know.",
    points: [
      { t: "Repeating non-stop feels good – and lasts the shortest", d: "Recite a verse fifty times in a row one evening and you will know it perfectly that hour. By next morning much of it is gone. The reason: repetitions right after each other meet a memory that is still completely fresh. The brain does not have to work, so it stores nothing new. Researchers call this massed practice. It creates a feeling of certainty but little lasting trace." },
      { t: "The right effort: just before it is gone", d: "The strongest memory is formed when you have to recall a verse that has almost faded – and you just manage it. That small effort is the signal to your brain: “This matters, keep it longer.” That is why every verse here comes back after about a day, then after three, seven, fourteen, thirty and ninety days. Each time you succeed the gap grows; each time you miss, it shrinks." },
      { t: "Where non-stop repetition still belongs", d: "Non-stop repetition is not useless – it simply has a different job: the first encoding. In the first minutes with a new verse you need density: listen three times, build it backwards, recite with cues. That is exactly what the Shams Method does in steps 1 to 6. And hifz schools have known for centuries that this dense encoding must be followed by a daily review of the old – sabaq, sabqi, manzil: today's new, the new of recent days, and a portion of the old. The method joins both: dense at the start, then stretched." },
      { t: "Understanding what is meant is the strongest glue", d: "A verse you know only as a chain of sounds has one path into your memory. A verse whose words you know, whose context you have read and about which you have thought for one sentence has four paths – and if one breaks, the others hold. That is why word-by-word, tafsir and reflection sit in the middle of the method, not as an extra at the end. Whoever understands forgets more slowly, and whoever forgets finds the verse again through its meaning." },
    ],
    ladderTitle: "The review ladder",
    ladderLead: "This is how a verse you learn today travels through the coming months – if you succeed each time.",
    ladderDay: "day",
    ladderNote: "Six reviews in three months are enough for a verse to sit firmly – if they come at the right time. Fifty repetitions in one evening are not.",
    fluencyTitle: "4 · 3 · 2 – becoming fluent",
    fluencyLead: "A technique from language teaching that suits recitation once a passage basically sits: recite the same passage three times in a row – and give yourself less time each round.",
    fluencySteps: [
      { min: "4 minutes", d: "Slowly, with the mushaf or cues, everything correct – tajweed before tempo." },
      { min: "3 minutes", d: "The same passage without help, mark mistakes briefly, do not stop." },
      { min: "2 minutes", d: "Once more, at a reciter's pace. Now the melody carries the text." },
    ],
    fluencyNote: "The shrinking time forces you to stop thinking word by word and to think in units of meaning – the way reciters do. Use the playback speed in the player: 0.75× for the first round, 1× for the second, 1.25× for the third.",
    meaningTitle: "What “understanding” means here",
    meaning: "Not becoming a scholar – but knowing, while you recite, what the verse is about. Three questions are enough: Who is speaking to whom? What is promised, commanded or told? What does it change about my day today? If you can answer these three in one sentence, you have understood the verse – and you will no longer confuse it with another that sounds similar.",
    rule: "Rule of thumb: learn densely, review spaced out, anchor with meaning.",
  },
  adaptTitle: "A method that gets to know you",
  adapt: [
    { t: "Personal memory factor", d: "Every verse gets its own factor. If it is hard for you, it comes back sooner; if it is easy, later. No two learners have the same plan." },
    { t: "Mistakes count", d: "Every mistake in an Academy test brings the verse back the next day. Your weakest verses are shown to you first." },
    { t: "Adapted to your age", d: "Children and seniors get a calmer pace, more repetitions and more time in tests. The recommended plan follows your age." },
    { t: "Growing daily amount", d: "Your 365-day plan starts small and adds a little every week – from a gentle start to the hafiz track with the whole Quran in about one year." },
  ],
  compareTitle: "How the Shams Method is different",
  compareLead: "No path is the only right one. The comparison shows what each approach covers – and why we recommend combining the Shams Method with a teacher.",
  compareCols: ["Listening only", "Reading a translation", "Teacher (talaqqi)", "Shams Method"],
  compareRows: [
    { label: "Correct pronunciation", cells: ["partly", "no", "yes", "yes, with word highlighting"] },
    { label: "Understanding the meaning", cells: ["no", "yes", "depends on the teacher", "yes, word by word and tafsir"] },
    { label: "Planned review", cells: ["no", "no", "depends on the teacher", "yes, personally adapted"] },
    { label: "Every day, anywhere", cells: ["yes", "yes", "no", "yes"] },
    { label: "Correction by a person", cells: ["no", "no", "yes", "no – so combine it with a teacher"] },
  ],
  compareNote: "The Quran has always been passed on from mouth to ear (talaqqi). The Shams Method does not replace a teacher – it makes sure you practise every day and come to your teacher well prepared.",
  teachTitle: "For teachers, mosques and schools",
  teachLead: "The Shams Method also works in class. A suggestion for a 45-minute lesson with a group:",
  teachPlan: [
    { min: "5 min", t: "Review", d: "The group recites the verses of the last lesson together, then individual students." },
    { min: "5 min", t: "Listen", d: "The new passage is played three times or recited by the teacher; everyone follows in the text." },
    { min: "10 min", t: "Backward build-up in chorus", d: "Teacher and class build each verse up from the last word – first together, then in small groups." },
    { min: "10 min", t: "Meaning and tafsir", d: "Key words, the translation and a short explanation of the context." },
    { min: "10 min", t: "Recall in pairs", d: "One student recites with first letters, then without help; the partner checks in the text." },
    { min: "5 min", t: "Reflection", d: "Everyone shares one thought about the verse. Homework: review daily in the Academy." },
  ],
  teachNote: "Schools and mosques can use the platform for free. Write to info@quranmasterclass.com if you would like to use the method with your group.",
  deepTitle: "The method explained in depth",
  deepLead: "The full background: where each step comes from, how it works and how to bring it into your daily life.",
  faq: [
    { q: "What is the Shams Method?", a: "A learning method with seven steps per verse, developed by Nami Shams: listen, build up backwards, word by word, meaning and memory hooks, tafsir, fading cues and reflection – with a memory model that plans the reviews. It is free at Quran Masterclass." },
    { q: "What is new about it?", a: "The individual building blocks come from language-learning and memory research and from the hifz tradition. New is their fixed order per verse and the implementation with exact word timings: building up backwards from any word and fading the text in stages down to the first letters – combined with a personal review plan." },
    { q: "How many verses should I learn per day?", a: "Beginners one to three new verses a day plus the review that is due, with practice three to five. In the 365-day plan the amount grows week by week. The right amount is the one you can keep up every day." },
    { q: "Do I need to know Arabic?", a: "No. Transliteration and word-by-word meaning help you from the first verse. Over time you recognise letters and words on your own – the vocabulary trainer speeds this up." },
    { q: "Is the Shams Method suitable for children?", a: "Yes. For children the pace is calmer, the verse is heard more often and tests give more time. Kids mode shows large text and rewards. Children learn best together with a parent." },
    { q: "Does the method replace a teacher?", a: "No. For correct pronunciation, reciting to a qualified teacher is strongly recommended. The Shams Method makes sure you practise every day and arrive well prepared." },
    { q: "Is the Shams Method a new tafsir?", a: "No. It is a learning method. All explanations come from classical tafsir works and are shown with their source. For religious questions, please ask a qualified scholar." },
    { q: "What does the Shams Method cost?", a: "Nothing. Quran Masterclass is free. You only need an account so that your progress is saved on all your devices." },
  ],
  finalTitle: "Your first verse takes four minutes",
  finalLead: "Start with Al-Fatihah. The platform guides you through every step.",
};

import ar from "./pagecontent/ar/shams";
export const shamsContent = (locale: string): ShamsContent => (locale === "de" ? de : locale === "ar" ? ar : en);
