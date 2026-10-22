import type { IslamDoc } from "./types";

// Chapter: Halal und Haram im Alltag (owner, 22.10.2026: "ich finde nichts zum thema halal und haram warum nicht ????").
// A practical overview: each item names its category honestly (halal, haram, makruh, umstritten), the evidence only by
// reference (Quran verses become gold chips from the app's data, hadith by collection and number, never typed text) and
// the positions of the five schools as list lines "- **<Schule>:** …". The hub's tradition setting puts the Ja'fari line
// first for a Shia learner (orderSchools in ./hub.ts). needs_review: true – nothing here is a fatwa.
// German and English written here; every other language falls back to English with a note (en_only).

const IQ = "https://islamqa.org";
const DI = "https://www.dar-alifta.org";
const SI = "https://www.sistani.org";
const AA = "https://aaoifi.com";

const DE_END = "*Überblick, keine Fatwa – fragen Sie bei Einzelfragen einen Gelehrten Ihres Vertrauens.*";
const EN_END = "*An overview, not a fatwa – for your individual questions, please ask a scholar you trust.*";

export const halalHaram: IslamDoc = {
  slug: "halal-haram",
  arabic: "الحلال والحرام",
  needs_review: true,
  en_only: true,
  de: {
    title: "Halal und Haram – ein Wegweiser für den Alltag",
    kicker: "Halal leben",
    lead: "Was ist erlaubt, was verboten, was umstritten? Dieser Wegweiser geht die Fragen durch, die im Alltag wirklich auftauchen: Essen und Trinken, Geld, Kleidung, Medien, das Miteinander und die Arbeit. Zu jedem Punkt nennen wir die Einordnung ehrlich, die Belege mit Fundstelle und die Positionen der fünf Rechtsschulen.",
    facts: [
      { n: "4", l: "Einordnungen: halal, haram, makruh, umstritten" },
      { n: "5", l: "Rechtsschulen: Hanafi, Maliki, Schafiʿi, Hanbali, Dschaʿfari" },
      { n: "2:168", l: "„Esst von dem, was auf der Erde erlaubt und gut ist“" },
      { n: "Bukhari 52", l: "Das Erlaubte ist klar, das Verbotene ist klar" },
    ],
    body: `## So lesen Sie diesen Wegweiser

Der Grundsatz der Mehrheit der Gelehrten lautet: Bei Dingen des Alltags ist alles erlaubt, bis ein Beleg es verbietet (Koran 2:29). Darum ist die Liste des Verbotenen kurz, und vieles bleibt offen. Jeder Punkt nennt:

- **Einordnung:** *halal* (erlaubt), *haram* (verboten), *makruh* (verpönt, besser zu lassen) oder *umstritten* (die Gelehrten sind sich nicht einig).
- **Belege:** Koranverse und Hadithe mit Fundstelle. Tippen Sie auf einen Vers, um ihn zu lesen.
- **Rechtsschulen:** die Positionen der Hanafi-, Maliki-, Schafiʿi-, Hanbali- und Dschaʿfari-Schule. Wenn Sie in Ihrem Profil Ihre Tradition gewählt haben, steht Ihre Schule vorn.
- **Fatwa-Stellen:** Wo Sie heutige Antworten finden: [islamqa.org](${IQ}) (Sammlung hanafitischer und anderer sunnitischer Fatwa-Seiten), [Dar al-Ifta Ägypten](${DI}), [das Büro von Ayatollah al-Sistani](${SI}) und für Finanzfragen die Standards der [AAOIFI](${AA}).

## Essen und Trinken

### Schweinefleisch

**Einordnung:** haram – darüber sind sich alle Schulen einig.

**Belege:** (Koran 2:173), (Koran 5:3), (Koran 6:145), (Koran 16:115).

- **Hanafi, Maliki, Schafiʿi, Hanbali:** verboten, ebenso alle Bestandteile des Schweins. In echter Notlage, wenn nichts anderes da ist, ist das Nötigste erlaubt (Koran 2:173).
- **Dschaʿfari:** ebenso verboten; das Schwein gilt zusätzlich als rituell unrein (*nadschis*).

${DE_END}

### Alkohol in Getränken und Speisen

**Einordnung:** berauschende Getränke sind haram; bei Alkohol als Zutat oder Rest in Speisen gehen die Ansichten auseinander.

**Belege:** (Koran 5:90–91), (Koran 2:219); „Jedes Berauschende ist Khamr, und jedes Khamr ist verboten“ (Sahih Muslim 2003); was in großer Menge berauscht, ist auch in kleiner Menge verboten (Sunan Abi Dawud 3681, Dschamiʿ at-Tirmidhi 1865).

- **Maliki, Schafiʿi, Hanbali:** jedes berauschende Getränk ist verboten, gleich in welcher Menge. Speisen, in denen Wein als Zutat erkennbar bleibt, sind zu meiden.
- **Hanafi:** Wein aus Trauben und Datteln ist in jeder Menge verboten; heutige hanafitische Gelehrte wenden die Regel auf jedes berauschende Getränk an. Ob winzige, nicht berauschende Reste in Speisen (etwa aus Aromen) schaden, beurteilen sie unterschiedlich.
- **Dschaʿfari:** jedes Berauschende ist verboten; berauschende Flüssigkeiten gelten als unrein.

**Heute:** Viele Gelehrte unterscheiden zwischen Alkohol, der bewusst als Zutat zugegeben wird (meiden), und Spuren, die beim Kochen vollständig verschwinden oder technisch unvermeidlich sind. Fragen Sie im Zweifel nach.

${DE_END}

### Gelatine

**Einordnung:** umstritten, wenn sie vom Schwein oder von nicht geschächteten Tieren stammt; Gelatine aus Fisch oder aus geschächteten Rindern ist halal.

**Belege:** die Verbote in (Koran 5:3); die Grundsatzfrage ist die *Istihala*, die vollständige Umwandlung eines Stoffes in einen anderen.

- **Hanafi und Maliki:** die vollständige Umwandlung kann einen unreinen Stoff rein machen; ob die Herstellung von Gelatine eine solche Umwandlung ist, beurteilen heutige Gelehrte unterschiedlich.
- **Schafiʿi und Hanbali:** die Umwandlung reinigt nur in wenigen Fällen (etwa Wein, der zu Essig wird); Schweinegelatine gilt daher meist als verboten.
- **Dschaʿfari:** die Umwandlung (*Istihala*) gehört zu den reinigenden Dingen; ob sie bei Gelatine vorliegt, beantworten die Büros der Gelehrten im Einzelfall.

**Praktisch:** Achten Sie auf die Angabe „Rindergelatine (halal)“ oder „Fischgelatine“, oder greifen Sie zu pflanzlichen Geliermitteln wie Agar-Agar und Pektin.

${DE_END}

### Fleisch und Schächtung (Dhabiha)

**Einordnung:** Fleisch erlaubter Tiere ist halal, wenn es nach den Regeln geschlachtet wurde; die Bedingungen unterscheiden sich je nach Schule.

**Belege:** (Koran 5:3), (Koran 6:118), (Koran 6:121); zum Essen der Leute der Schrift (Koran 5:5).

- **Hanafi:** der Name Allahs ist Pflicht; wer ihn absichtlich weglässt, macht das Fleisch verboten, wer ihn vergisst, nicht. Fleisch, das Juden und Christen nach den Regeln schlachten, ist erlaubt.
- **Maliki:** ähnlich der Hanafi-Schule: der Name Allahs ist Pflicht, Vergessen wird entschuldigt; die Schlachtung durch Leute der Schrift ist erlaubt.
- **Schafiʿi:** der Name Allahs ist eine starke Sunna, keine Bedingung; die Schlachtung durch Leute der Schrift ist erlaubt.
- **Hanbali:** der Name Allahs ist Bedingung, beim Vergessen gibt es zwei Ansichten; die Schlachtung durch Leute der Schrift ist erlaubt.
- **Dschaʿfari:** der Schlachtende muss Muslim sein, das Tier zur Qibla gerichtet, der Name Allahs gesprochen und die vier Hauptgefäße durchtrennt werden; Fleisch, das Nichtmuslime schlachten, gilt nach der verbreiteten Ansicht als nicht erlaubt.

**Betäubung:** ob eine Betäubung vor dem Schnitt erlaubt ist, wenn das Tier dadurch nicht stirbt, wird heute unterschiedlich beantwortet.

${DE_END}

### Meerestiere

**Einordnung:** Fisch ist nach allen Schulen halal; bei anderen Meerestieren unterscheiden sich die Schulen deutlich.

**Belege:** (Koran 5:96); „Sein Wasser ist rein, und seine verendeten Tiere sind erlaubt“ (Sunan Abi Dawud 83, Dschamiʿ at-Tirmidhi 69).

- **Hanafi:** erlaubt ist nur Fisch; Muscheln, Tintenfisch und Krebse sind nicht erlaubt. Bei Garnelen sind sich hanafitische Gelehrte uneins, ob sie als Fisch gelten.
- **Maliki:** grundsätzlich alles, was nur im Meer lebt, ist erlaubt.
- **Schafiʿi:** nach der bekannten Ansicht ist alles erlaubt, was nur im Wasser lebt.
- **Hanbali:** nach der gewählten Ansicht der Schule ist alles aus dem Meer erlaubt außer Frosch, Schlange und Krokodil.
- **Dschaʿfari:** erlaubt ist Fisch mit Schuppen und die Garnele; Fische ohne Schuppen, Muscheln und andere Meerestiere sind nicht erlaubt.

${DE_END}

### E-Nummern – nur der Grundsatz

**Einordnung:** die meisten Zusatzstoffe sind pflanzlich, mineralisch oder synthetisch und damit unbedenklich; fraglich sind nur Stoffe, die aus tierischen Quellen oder mit Alkohol hergestellt sein *können*.

**Grundsatz:** Eine E-Nummer sagt nichts über die Herkunft. Derselbe Stoff kann pflanzlich oder tierisch gewonnen sein. Darum gibt es keine verlässliche „Verbotsliste“; entscheidend ist die Herkunft im einzelnen Produkt. Fragen Sie beim Hersteller nach oder achten Sie auf ein Halal-Siegel. Für Zweifelsfälle gilt der Hadith über das Unklare (siehe unten).

${DE_END}

### Halal-Zertifizierung

**Einordnung:** ein Siegel ist kein religiöses Gebot, aber eine praktische Hilfe.

**Was zu wissen ist:** Es gibt kein einheitliches Siegel. Zertifizierer folgen unterschiedlichen Schulen, etwa bei der Betäubung, der maschinellen Schlachtung oder dem Fleisch der Leute der Schrift. Prüfen Sie, nach welchen Regeln ein Siegel vergeben wird und ob es zu der Schule passt, der Sie folgen. Für Anhänger der Dschaʿfari-Schule ist zu beachten, dass viele Siegel deren Bedingungen nicht ausdrücklich abdecken.

${DE_END}

## Geld und Handel

### Riba (Zinsen)

**Einordnung:** haram – Riba ist nach allen Schulen verboten.

**Belege:** (Koran 2:275–279), (Koran 3:130); der Prophet ﷺ verfluchte den, der Riba nimmt, den, der sie gibt, den Schreiber und die Zeugen (Sahih Muslim 1598).

- **Hanafi, Maliki, Schafiʿi, Hanbali:** jede vorher festgelegte Mehrleistung auf ein Darlehen ist Riba. Die Internationale Islamische Fiqh-Akademie (OIC) hat 1985 (Beschluss Nr. 10 (10/2)) Zinsen auf ein Darlehen von Anfang an und Aufschläge für das Verlängern einer fälligen Schuld als Riba eingestuft.
- **Dschaʿfari:** Riba ist ebenso verboten. Für Konten und Kredite bei Banken in nichtmuslimischen Ländern enthalten die Rechtsgutachten von Ayatollah al-Sistani eigene Regeln; lesen Sie diese auf [sistani.org](${SI}) nach.

**Heute:** Die Dar al-Ifta Ägypten bewertet Bankeinlagen als neue Form des Finanzvertrags (Investition), nicht als Darlehen, und hält die Erträge daher für erlaubt; sie nennt selbst die Gegenansicht, die das Verhältnis als Darlehen sieht und die Erträge als Riba verbietet. Diese Gegenansicht vertreten die OIC-Akademie und viele andere Fatwa-Stellen. Islamische Banken arbeiten nach den Standards der [AAOIFI](${AA}).

${DE_END}

### Darlehen

**Einordnung:** ein Darlehen ohne Mehrleistung (*Qard hasan*) ist erlaubt und lobenswert; eine vereinbarte Mehrleistung ist Riba.

**Belege:** (Koran 2:245), (Koran 2:280); Schulden schriftlich festhalten (Koran 2:282).

- **Alle fünf Schulen:** Rückzahlung genau des geliehenen Betrags; ein freiwilliges, nicht vereinbartes Mehr beim Zurückzahlen ist erlaubt.

${DE_END}

### Kauf auf Raten und auf Kredit

**Einordnung:** halal, wenn Preis und Fristen beim Kauf feststehen und keine Verzugszinsen anfallen.

**Belege:** der Prophet ﷺ kaufte Nahrung auf Zahlungsziel und hinterlegte seine Rüstung als Pfand (Sahih al-Bukhari 2068); (Koran 2:282).

- **Hanafi, Maliki, Schafiʿi, Hanbali:** ein höherer Preis beim Ratenkauf ist erlaubt, wenn er beim Abschluss feststeht; ein Aufschlag für spätere Zahlung, der danach dazukommt, ist Riba.
- **Dschaʿfari:** ebenso erlaubt, wenn der Preis beim Abschluss feststeht.

**Achtung:** Kreditkarten und „Jetzt kaufen, später zahlen“-Angebote mit Zinsen bei Verzug sind problematisch; nach vielen Gelehrten ist schon die Zustimmung zu einer Zinsklausel zu meiden.

${DE_END}

### Versicherungen

**Einordnung:** umstritten.

**Belege:** kein ausdrücklicher Text; die Frage hängt an *Gharar* (übermäßige Ungewissheit) und Riba.

- **Hanafi, Maliki, Schafiʿi, Hanbali:** die Internationale Islamische Fiqh-Akademie (OIC) hat 1985 (Beschluss Nr. 9 (9/2)) die gewerbliche Versicherung mit festen Prämien wegen *Gharar* für unzulässig erklärt und die gegenseitige, auf Spende beruhende Versicherung (*Takaful*) als Alternative genannt; die [AAOIFI](${AA}) regelt sie im Standard Nr. 26 „Islamic Insurance“ (2006). Gesetzlich vorgeschriebene Versicherungen (etwa die Kfz-Haftpflicht) halten viele Gelehrte für erlaubt.
- **Dschaʿfari:** nach den Rechtsgutachten von Ayatollah al-Sistani ist ein Versicherungsvertrag grundsätzlich gültig; Einzelheiten auf [sistani.org](${SI}).

${DE_END}

### Kryptowährungen

**Einordnung:** umstritten – die Ansichten gehen deutlich auseinander.

- Manche Gelehrte und Gremien halten Kryptowährungen für erlaubt, wenn sie als Zahlungsmittel oder Vermögenswert ohne Zinsen und Glücksspiel genutzt werden.
- Andere, darunter die Dar al-Ifta Ägypten in einem Gutachten von 2018, lehnen sie wegen der Ungewissheit und fehlenden Absicherung ab.
- Unabhängig davon sind Zinsprodukte, Hebelgeschäfte mit Zinsen und Wetten auf Kursbewegungen nach allen Ansichten zu meiden.

${DE_END}

### Glücksspiel und Lotterie

**Einordnung:** haram – nach allen Schulen.

**Belege:** (Koran 5:90–91), (Koran 2:219).

- **Alle fünf Schulen:** jedes Spiel, bei dem man Geld einsetzt und es an andere verlieren oder von ihnen gewinnen kann (*Maisir*, *Qimar*), ist verboten. Dazu gehören Lotto, Rubbellose, Sportwetten und Casino.

${DE_END}

## Kleidung und Aussehen

### Awra – was bedeckt wird

**Einordnung:** das Bedecken der Awra ist Pflicht; ihr Umfang ist bei den Schulen teilweise unterschiedlich.

**Belege:** (Koran 7:26), (Koran 24:30–31), (Koran 33:59).

- **Hanafi, Maliki, Schafiʿi, Hanbali:** beim Mann vom Nabel bis zum Knie (mit Unterschieden, ob Nabel und Knie dazugehören); bei der Frau gegenüber fremden Männern der ganze Körper außer Gesicht und Händen nach der Mehrheit, die Hanafi-Schule nimmt die Füße teilweise aus, eine Ansicht bei den Hanbaliten schließt das Gesicht ein.
- **Dschaʿfari:** beim Mann mindestens die Scham, empfohlen bis zum Knie; bei der Frau gegenüber fremden Männern der ganze Körper; Gesicht und Hände bis zum Handgelenk darf sie nach Ayatollah al-Sistani frei lassen, solange das nicht zu verbotenen Blicken führt. Im Gebet bleiben Gesicht, Hände bis zum Handgelenk und Füße bis zum Knöchel frei.

${DE_END}

### Seide und Gold für Männer

**Einordnung:** für Männer haram, für Frauen halal.

**Belege:** Seide und Gold sind den Frauen meiner Umma erlaubt und den Männern verboten (Dschamiʿ at-Tirmidhi 1720, Sunan Abi Dawud 4057).

- **Hanafi, Maliki, Schafiʿi, Hanbali:** reine Seide und Goldschmuck sind Männern verboten; schmale Seidenstreifen (bis etwa vier Finger breit) und Silber, etwa ein Ring, sind erlaubt.
- **Dschaʿfari:** Gold ist Männern verboten, auch ein Goldring; im Gebet macht Gold oder reine Seide am Mann das Gebet ungültig.

${DE_END}

### Tätowierungen

**Einordnung:** haram nach der Mehrheit; Henna und abwaschbare Farben sind erlaubt.

**Belege:** der Prophet ﷺ verfluchte die, die tätowiert, und die, die sich tätowieren lässt (Sahih al-Bukhari 5937, Sahih Muslim 2125).

- **Hanafi, Maliki, Schafiʿi, Hanbali:** dauerhafte Tätowierungen sind verboten. Wer eine Tätowierung aus der Zeit vor seiner Reue hat, muss sie nicht entfernen, wenn das schadet.
- **Dschaʿfari:** nach den Antworten des Büros von Ayatollah al-Sistani ist eine Tätowierung unter der Haut an sich erlaubt, ob dauerhaft oder nicht, solange sie nichts Falsches fördert und nichts sonst Verbotenes dabei geschieht; Gebetswaschung, Ghusl und Gebet bleiben gültig, weil die Farbe keine Schicht bildet.

${DE_END}

### Haare färben

**Einordnung:** halal; beim Färben mit Schwarz sind die Ansichten verschieden.

**Belege:** „Ändert dies, aber meidet das Schwarze“ (Sahih Muslim 2102); Juden und Christen färben nicht, so unterscheidet euch von ihnen (Sahih al-Bukhari 3462).

- **Schafiʿi:** Schwarz ist nach der bekannten Ansicht verboten, außer für Kämpfer im Krieg.
- **Hanafi, Maliki, Hanbali:** Schwarz ist nach der verbreiteten Ansicht makruh; manche erlauben es, etwa für Ehepartner.
- **Dschaʿfari:** Färben ist erlaubt, auch mit Schwarz; das Färben mit Henna ist empfohlen.

${DE_END}

### Parfum mit Alkohol

**Einordnung:** umstritten.

- **Hanafi:** viele heutige hanafitische Gelehrte halten Alkohol, der nicht aus Trauben oder Datteln gewonnen wird, für nicht unrein; Parfum mit solchem Alkohol ist danach erlaubt.
- **Maliki, Schafiʿi, Hanbali:** wer Alkohol als Khamr und damit als unrein ansieht, meidet solches Parfum; andere heutige Gelehrte unterscheiden technischen Alkohol vom Getränk und erlauben es.
- **Dschaʿfari:** nach den Antworten des Büros von Ayatollah al-Sistani sind alle Arten von Alkohol rein (aber nicht trinkbar), außer Wein und – aus Vorsicht – Bier; Parfum und Medikamente mit Alkohol dürfen benutzt werden; Einzelheiten auf [sistani.org](${SI}).

**Praktisch:** Wer sicher gehen will, nimmt alkoholfreie Öle (*ʿAttar*).

${DE_END}

## Medien und Unterhaltung

### Musik

**Einordnung:** umstritten – die Gelehrten vertreten verschiedene Ansichten, und hier steht keine einzelne als Urteil.

**Belege, die angeführt werden:** (Koran 31:6), nach Ibn Masʿud auf Gesang bezogen; der Hadith über Leute, die Musikinstrumente (*maʿazif*) für erlaubt halten werden (Sahih al-Bukhari 5590); zwei Mädchen, die am Festtag im Haus des Propheten ﷺ sangen (Sahih al-Bukhari 952).

- **Hanafi, Maliki, Schafiʿi, Hanbali:** die klassische Mehrheit verbietet Musikinstrumente außer der Rahmentrommel (*Daff*) bei Hochzeiten und Festen; Gesang ohne Instrumente mit gutem Inhalt ist erlaubt. Einzelne Gelehrte, etwa Ibn Hazm, hielten Instrumente für erlaubt.
- **Dschaʿfari:** *Ghina'* – Gesang und Musik, die zu Vergnügungs- und Sündenfeiern passen – ist verboten; andere Musik ist nach den Rechtsgutachten von Ayatollah al-Sistani erlaubt.
- **Heutige Stimmen:** die Dar al-Ifta Ägypten erlaubt Musik, die nicht zu Verbotenem verleitet und nichts Verbotenes begleitet; viele andere heutige Gelehrte bleiben bei der klassischen Mehrheitsansicht.

${DE_END}

### Bilder und Fotografie

**Einordnung:** umstritten bei Bildern von Lebewesen; Bilder von Landschaften und Dingen sind halal.

**Belege:** am strengsten bestraft werden die Bildermacher (Sahih al-Bukhari 5950); die Engel betreten kein Haus, in dem ein Hund oder Bilder sind (Sahih al-Bukhari 5949).

- **Hanafi, Maliki, Schafiʿi, Hanbali:** Statuen von Lebewesen sind verboten; bei gezeichneten Bildern sind die Ansichten verschieden. Fotografie erlauben viele heutige Gelehrte, darunter die Dar al-Ifta Ägypten, weil sie nur ein festgehaltenes Abbild ist und das Verbot nur dreidimensionale Bilder betrifft; andere erlauben sie nur bei Bedarf.
- **Dschaʿfari:** nach den Rechtsgutachten von Ayatollah al-Sistani sind Zeichnen und Fotografieren erlaubt; das Herstellen von Statuen von Lebewesen ist aus Vorsicht zu meiden.

${DE_END}

### Spiele

**Einordnung:** grundsätzlich halal; was verboten ist, ergibt sich aus dem Inhalt und den Folgen.

**Grundsatz:** Spiele sind erlaubt, solange sie keine Pflichten verdrängen (vor allem das Gebet), nichts Verbotenes zeigen oder verherrlichen und kein Glücksspiel enthalten. Der Prophet ﷺ lief mit ʿAʾischa um die Wette (Sunan Abi Dawud 2578) und ließ die Abessinier in der Moschee mit Speeren spielen (Sahih al-Bukhari 454).

${DE_END}

### Glücksspiel-Mechaniken in Spielen

**Einordnung:** umstritten bis haram, je nach Gestaltung.

**Grundsatz:** Lootboxen und ähnliche Mechaniken, bei denen man echtes Geld für einen zufälligen Gewinn ausgibt, ähneln *Maisir* (Koran 5:90). Viele heutige Gelehrte raten davon ab oder verbieten es, besonders wenn sich Gewinne zurück in Geld tauschen lassen. Kostenlose Zufallsbelohnungen ohne Geldeinsatz sind kein Glücksspiel.

${DE_END}

## Das Miteinander

### Üble Nachrede (Ghiba)

**Einordnung:** haram.

**Belege:** (Koran 49:12); der Prophet ﷺ erklärte Ghiba als das Erwähnen deines Bruders mit etwas, das er nicht mag (Sahih Muslim 2589).

- **Alle fünf Schulen:** verboten. Ausnahmen nennen die Gelehrten eng: eine Klage über Unrecht bei jemandem, der helfen kann, eine Warnung vor Schaden, eine ernsthafte Bitte um Rat.

${DE_END}

### Lügen

**Einordnung:** haram, mit eng begrenzten Ausnahmen.

**Belege:** (Koran 9:119); die Wahrhaftigkeit führt zum Guten (Sahih al-Bukhari 6094); erlaubt ist ein abweichendes Wort, um Menschen zu versöhnen, im Krieg und zwischen Eheleuten, um einander Gutes zu sagen (Sahih Muslim 2605).

- **Alle fünf Schulen:** Lügen ist verboten; die Ausnahmen werden eng verstanden und erlauben nicht, jemandem sein Recht zu nehmen.

${DE_END}

### Männer und Frauen – Begegnung und Miteinander

**Einordnung:** Begegnung im Beruf, beim Lernen und im Alltag ist erlaubt, wenn der Anstand gewahrt bleibt; das Alleinsein eines Mannes mit einer fremden Frau (*Khalwa*) ist haram.

**Belege:** den Blick senken (Koran 24:30–31); hinter einem Vorhang fragen (Koran 33:53); kein Mann ist mit einer Frau allein, außer in Begleitung eines Mahram (Sahih al-Bukhari 5233).

- **Hanafi, Maliki, Schafiʿi, Hanbali:** Khalwa ist verboten; das Miteinander soll ernst und angemessen bleiben. Beim Händeschütteln mit dem anderen Geschlecht ist die Mehrheit zurückhaltend.
- **Dschaʿfari:** ebenso; das Händeschütteln mit Nicht-Mahram ist ohne Barriere nicht erlaubt, und der Blick mit Lust ist verboten.
- **Beziehungen vor der Ehe:** eine Liebesbeziehung außerhalb der Ehe ist nach allen Schulen verboten; das Kennenlernen mit dem Ziel der Ehe in angemessenem Rahmen ist erlaubt.

${DE_END}

## Arbeit und Einkommen

### Ein halal Beruf und Einkommen

**Einordnung:** nach dem Erlaubten zu suchen ist Pflicht.

**Belege:** (Koran 2:168), (Koran 2:172); der Prophet ﷺ nannte die verbotene Speise als Grund, warum ein Bittgebet nicht erhört wird (Sahih Muslim 1015).

- **Alle fünf Schulen:** Arbeit ist halal, wenn die Tätigkeit selbst erlaubt ist und niemandem Unrecht geschieht. Einkommen aus Riba, Glücksspiel, Betrug oder dem Verkauf von Verbotenem ist haram.

**Praktisch:** In gemischten Betrieben (etwa ein Supermarkt, der auch Alkohol verkauft) beurteilen die Gelehrten danach, ob Ihre eigene Tätigkeit unmittelbar dem Verbotenen dient.

${DE_END}

### Verbotenes verkaufen

**Einordnung:** haram.

**Belege:** Allah und Sein Gesandter haben den Verkauf von Wein, Aas, Schweinen und Götzenbildern verboten (Sahih al-Bukhari 2236); wenn Allah einem Volk verbietet, etwas zu essen, verbietet Er ihm auch dessen Preis (Sunan Abi Dawud 3488).

- **Alle fünf Schulen:** Verkauf, Ausschank und Lieferung von Alkohol und Schweinefleisch sind verboten, ebenso der Handel mit Dingen, die nur für Verbotenes taugen.

${DE_END}

## Das Unklare

**Einordnung:** das Unklare zu meiden ist empfohlen und ein Zeichen der Frömmigkeit (*Waraʿ*).

**Beleg:** Das Erlaubte ist klar und das Verbotene ist klar, dazwischen liegen unklare Dinge; wer sie meidet, schützt seine Religion und seine Ehre (Sahih al-Bukhari 52, Sahih Muslim 1599). Lass, was dich zweifeln lässt, für das, was dich nicht zweifeln lässt (Dschamiʿ at-Tirmidhi 2518).

**Praktisch:** Wer zweifelt, lässt die Sache, fragt nach oder folgt der Antwort eines Gelehrten, dem er vertraut. Andere, die anders handeln, weil sie einer anderen anerkannten Ansicht folgen, werden dafür nicht getadelt.

${DE_END}

Mehr zum Lebensstil im Kapitel [Islamischer Lebensstil](/islam/daily) und zum Verdienst und Essen im Adab der Shams-Methode ([Halal leben](/shams/adab#t-halal)).`,
    faq: [
      { q: "Ist alles verboten, was nicht ausdrücklich erlaubt ist?", a: "Nein. Bei Dingen des Alltags gilt nach der Mehrheit der Gelehrten: Alles ist erlaubt, bis ein Beleg es verbietet. Bei Gottesdiensten ist es umgekehrt." },
      { q: "Was mache ich, wenn die Schulen verschiedener Meinung sind?", a: "Folgen Sie der Schule oder dem Gelehrten, dem Sie vertrauen, und bleiben Sie dabei möglichst beständig. Wer einer anderen anerkannten Ansicht folgt, wird nicht getadelt." },
      { q: "Darf ich bei Juden und Christen Fleisch essen?", a: "Nach den vier sunnitischen Schulen ja, wenn das Tier nach den Regeln geschlachtet wurde (Koran 5:5). Nach der verbreiteten Ansicht der Dschaʿfari-Schule nein." },
      { q: "Sind Garnelen halal?", a: "Nach der Maliki-, Schafiʿi-, Hanbali- und Dschaʿfari-Schule ja. In der Hanafi-Schule gehen die Ansichten auseinander, ob sie als Fisch gelten." },
      { q: "Wo finde ich eine verbindliche Antwort?", a: "Bei einem Gelehrten Ihres Vertrauens oder bei Fatwa-Stellen wie islamqa.org, der Dar al-Ifta Ägypten oder dem Büro von Ayatollah al-Sistani. Dieser Wegweiser ist ein Überblick, keine Fatwa." },
    ],
    sources: [
      "Koran 2:29, 2:168, 2:172, 2:173, 2:219, 2:245, 2:275–280, 2:282, 3:130, 5:3, 5:5, 5:90–91, 5:96, 6:118, 6:121, 6:145, 7:26, 9:119, 16:115, 24:30–31, 31:6, 33:53, 33:59, 49:12",
      "Sahih al-Bukhari 52, 454, 952, 2068, 2236, 3462, 5233, 5590, 5937, 5949, 5950, 6094",
      "Sahih Muslim 1015, 1598, 1599, 2003, 2102, 2125, 2589, 2605",
      "Sunan Abi Dawud 83, 2578, 3488, 3681, 4057; Dschamiʿ at-Tirmidhi 69, 1720, 1865, 2518",
      "Internationale Islamische Fiqh-Akademie (OIC), Beschlüsse Nr. 9 (9/2) zur Versicherung und Nr. 10 (10/2) zu Bankzinsen, Dschidda 1985",
      "AAOIFI Shariah Standards (aaoifi.com), u. a. Nr. 26 Islamische Versicherung (2006)",
      "islamqa.org · dar-alifta.org · sistani.org",
    ],
  },
  en: {
    title: "Halal and Haram – a guide for everyday life",
    kicker: "Living halal",
    lead: "What is permitted, what is forbidden, what is disputed? This guide goes through the questions that really come up in daily life: food and drink, money, clothing, media, how we treat each other and work. For each point we state the category honestly, the evidence by reference and the positions of the five schools of law.",
    facts: [
      { n: "4", l: "categories: halal, haram, makruh, disputed" },
      { n: "5", l: "schools: Hanafi, Maliki, Shafiʿi, Hanbali, Jaʿfari" },
      { n: "2:168", l: "\"Eat of what is on the earth, lawful and good\"" },
      { n: "Bukhari 52", l: "The lawful is clear and the unlawful is clear" },
    ],
    body: `## How to read this guide

The principle of most scholars is: in everyday matters everything is permitted until evidence forbids it (Quran 2:29). So the list of what is forbidden is short, and much remains open. Each point gives:

- **Category:** *halal* (permitted), *haram* (forbidden), *makruh* (disliked, better left) or *disputed* (the scholars do not agree).
- **Evidence:** Quran verses and hadith by reference. Tap a verse to read it.
- **Schools:** the positions of the Hanafi, Maliki, Shafiʿi, Hanbali and Jaʿfari schools. If you have chosen your tradition in your profile, your school comes first.
- **Fatwa bodies:** where to find current answers: [islamqa.org](${IQ}) (a collection of Hanafi and other Sunni fatwa sites), [Dar al-Ifta Egypt](${DI}), [the office of Ayatollah al-Sistani](${SI}) and, for finance, the [AAOIFI](${AA}) standards.

## Food and drink

### Pork

**Category:** haram – all schools agree.

**Evidence:** (Quran 2:173), (Quran 5:3), (Quran 6:145), (Quran 16:115).

- **Hanafi, Maliki, Shafiʿi, Hanbali:** forbidden, as is every part of the pig. In real necessity, when nothing else is available, the bare minimum is permitted (Quran 2:173).
- **Jaʿfari:** equally forbidden; the pig is also ritually impure (*najis*).

${EN_END}

### Alcohol in drinks and food

**Category:** intoxicating drinks are haram; on alcohol as an ingredient or residue in food, views differ.

**Evidence:** (Quran 5:90–91), (Quran 2:219); "Every intoxicant is khamr and every khamr is forbidden" (Sahih Muslim 2003); what intoxicates in a large amount is forbidden in a small amount (Sunan Abi Dawud 3681, Jamiʿ at-Tirmidhi 1865).

- **Maliki, Shafiʿi, Hanbali:** every intoxicating drink is forbidden in any amount. Food in which wine remains as a recognisable ingredient should be avoided.
- **Hanafi:** wine from grapes and dates is forbidden in any amount; contemporary Hanafi scholars apply the rule to every intoxicating drink. Whether tiny non-intoxicating residues in food (for example from flavourings) matter is answered differently.
- **Jaʿfari:** every intoxicant is forbidden; intoxicating liquids are impure.

**Today:** many scholars distinguish alcohol added deliberately as an ingredient (avoid) from traces that disappear completely in cooking or are technically unavoidable. Ask when in doubt.

${EN_END}

### Gelatine

**Category:** disputed when it comes from pigs or from animals not slaughtered by the rules; gelatine from fish or from properly slaughtered cattle is halal.

**Evidence:** the prohibitions in (Quran 5:3); the underlying question is *istihala*, the complete transformation of one substance into another.

- **Hanafi and Maliki:** complete transformation can make an impure substance pure; whether making gelatine is such a transformation is answered differently by contemporary scholars.
- **Shafiʿi and Hanbali:** transformation purifies only in a few cases (such as wine turning into vinegar); pork gelatine is therefore mostly considered forbidden.
- **Jaʿfari:** transformation (*istihala*) is one of the purifiers; whether it applies to gelatine is answered case by case by the scholars' offices.

**In practice:** look for "beef gelatine (halal)" or "fish gelatine", or use plant-based gelling agents such as agar-agar and pectin.

${EN_END}

### Meat and slaughter (dhabiha)

**Category:** the meat of permitted animals is halal when slaughtered by the rules; the conditions differ by school.

**Evidence:** (Quran 5:3), (Quran 6:118), (Quran 6:121); on the food of the People of the Book (Quran 5:5).

- **Hanafi:** saying Allah's name is required; omitting it deliberately makes the meat forbidden, forgetting does not. Meat slaughtered by Jews and Christians by the rules is permitted.
- **Maliki:** similar to the Hanafi school: Allah's name is required, forgetting is excused; slaughter by the People of the Book is permitted.
- **Shafiʿi:** Allah's name is a strong sunnah, not a condition; slaughter by the People of the Book is permitted.
- **Hanbali:** Allah's name is a condition, with two views on forgetting; slaughter by the People of the Book is permitted.
- **Jaʿfari:** the slaughterer must be Muslim, the animal must face the qibla, Allah's name must be said and the four main vessels must be cut; meat slaughtered by non-Muslims is not permitted according to the prevalent view.

**Stunning:** whether stunning before the cut is permitted, if the animal does not die from it, is answered differently today.

${EN_END}

### Seafood

**Category:** fish is halal in all schools; for other sea creatures the schools differ clearly.

**Evidence:** (Quran 5:96); "Its water is pure and its dead are lawful" (Sunan Abi Dawud 83, Jamiʿ at-Tirmidhi 69).

- **Hanafi:** only fish is permitted; mussels, squid and crabs are not. Hanafi scholars differ on whether prawns count as fish.
- **Maliki:** in principle everything that lives only in the sea is permitted.
- **Shafiʿi:** according to the well-known view, everything that lives only in water is permitted.
- **Hanbali:** according to the school's chosen view, everything from the sea is permitted except the frog, the snake and the crocodile.
- **Jaʿfari:** fish with scales and prawns are permitted; fish without scales, mussels and other sea creatures are not.

${EN_END}

### E-numbers – only the principle

**Category:** most additives are plant-based, mineral or synthetic and therefore unproblematic; only substances that *can* be made from animal sources or with alcohol are in question.

**Principle:** an E-number says nothing about the origin. The same substance can be plant-based or animal-derived. So there is no reliable "forbidden list"; what matters is the origin in the individual product. Ask the manufacturer or look for a halal label. For doubtful cases the hadith on unclear matters applies (see below).

${EN_END}

### Halal certification

**Category:** a label is not a religious command, but a practical help.

**What to know:** there is no single label. Certifiers follow different schools, for example on stunning, machine slaughter or the meat of the People of the Book. Check by which rules a label is awarded and whether it fits the school you follow. Followers of the Jaʿfari school should note that many labels do not explicitly cover its conditions.

${EN_END}

## Money and trade

### Riba (interest)

**Category:** haram – riba is forbidden in all schools.

**Evidence:** (Quran 2:275–279), (Quran 3:130); the Prophet ﷺ cursed the one who takes riba, the one who gives it, the scribe and the witnesses (Sahih Muslim 1598).

- **Hanafi, Maliki, Shafiʿi, Hanbali:** any pre-agreed increase on a loan is riba. In 1985 (Resolution No. 10 (10/2)) the International Islamic Fiqh Academy (OIC) classified interest on a loan from the start and any increase for extending a matured debt as riba.
- **Jaʿfari:** riba is equally forbidden. For accounts and loans at banks in non-Muslim countries, the rulings of Ayatollah al-Sistani contain specific rules; please read them on [sistani.org](${SI}).

**Today:** Dar al-Ifta Egypt treats bank deposits as a new kind of financial contract (investment), not a loan, and therefore considers the returns permissible; it names the opposing view itself, which sees the relationship as a loan and forbids the returns as riba. That opposing view is held by the OIC Academy and many other fatwa bodies. Islamic banks work by the [AAOIFI](${AA}) standards.

${EN_END}

### Loans

**Category:** a loan without increase (*qard hasan*) is permitted and praiseworthy; an agreed increase is riba.

**Evidence:** (Quran 2:245), (Quran 2:280); write debts down (Quran 2:282).

- **All five schools:** repay exactly the amount borrowed; a voluntary, unagreed extra when repaying is permitted.

${EN_END}

### Buying on credit and in instalments

**Category:** halal when price and deadlines are fixed at purchase and no late-payment interest applies.

**Evidence:** the Prophet ﷺ bought food on deferred payment and left his armour as a pledge (Sahih al-Bukhari 2068); (Quran 2:282).

- **Hanafi, Maliki, Shafiʿi, Hanbali:** a higher price for instalments is permitted if it is fixed at the contract; a surcharge for later payment added afterwards is riba.
- **Jaʿfari:** equally permitted when the price is fixed at the contract.

**Note:** credit cards and "buy now, pay later" offers with interest on late payment are problematic; according to many scholars, even agreeing to an interest clause should be avoided.

${EN_END}

### Insurance

**Category:** disputed.

**Evidence:** no explicit text; the question rests on *gharar* (excessive uncertainty) and riba.

- **Hanafi, Maliki, Shafiʿi, Hanbali:** the International Islamic Fiqh Academy (OIC) declared fixed-premium commercial insurance impermissible because of *gharar* in 1985 (Resolution No. 9 (9/2)) and named mutual insurance based on donation (*takaful*) as the alternative; the [AAOIFI](${AA}) sets its rules in Standard No. 26 "Islamic Insurance" (2006). Insurance required by law (such as third-party car insurance) is considered permissible by many scholars.
- **Jaʿfari:** according to the rulings of Ayatollah al-Sistani, an insurance contract is valid in principle; details on [sistani.org](${SI}).

${EN_END}

### Cryptocurrencies

**Category:** disputed – views differ clearly.

- Some scholars and bodies consider cryptocurrencies permissible when used as a means of payment or an asset without interest or gambling.
- Others, including Dar al-Ifta Egypt in an opinion from 2018, reject them because of the uncertainty and lack of backing.
- Regardless of that, interest products, leveraged trading with interest and bets on price movements are to be avoided according to all views.

${EN_END}

### Gambling and lottery

**Category:** haram – in all schools.

**Evidence:** (Quran 5:90–91), (Quran 2:219).

- **All five schools:** every game in which you stake money that you can lose to others or win from them (*maysir*, *qimar*) is forbidden. This includes the lottery, scratch cards, sports betting and casinos.

${EN_END}

## Clothing and appearance

### Awrah – what is covered

**Category:** covering the awrah is obligatory; its extent differs in part between the schools.

**Evidence:** (Quran 7:26), (Quran 24:30–31), (Quran 33:59).

- **Hanafi, Maliki, Shafiʿi, Hanbali:** for men from the navel to the knee (with differences on whether navel and knee are included); for women before unrelated men the whole body except face and hands according to the majority; the Hanafi school partly excepts the feet, one Hanbali view includes the face.
- **Jaʿfari:** for men at least the private parts, recommended to the knee; for women before unrelated men the whole body; according to Ayatollah al-Sistani she may leave the face and the hands up to the wrist uncovered as long as this does not lead to forbidden looks. In prayer the face, the hands up to the wrist and the feet up to the ankle may stay uncovered.

${EN_END}

### Silk and gold for men

**Category:** haram for men, halal for women.

**Evidence:** silk and gold are permitted for the women of my ummah and forbidden for its men (Jamiʿ at-Tirmidhi 1720, Sunan Abi Dawud 4057).

- **Hanafi, Maliki, Shafiʿi, Hanbali:** pure silk and gold jewellery are forbidden for men; narrow silk trims (up to about four fingers wide) and silver, such as a ring, are permitted.
- **Jaʿfari:** gold is forbidden for men, including a gold ring; in prayer, gold or pure silk on a man invalidates the prayer.

${EN_END}

### Tattoos

**Category:** haram according to the majority; henna and washable colours are permitted.

**Evidence:** the Prophet ﷺ cursed the one who tattoos and the one who has herself tattooed (Sahih al-Bukhari 5937, Sahih Muslim 2125).

- **Hanafi, Maliki, Shafiʿi, Hanbali:** permanent tattoos are forbidden. Someone with a tattoo from before their repentance need not remove it if that causes harm.
- **Jaʿfari:** according to the answers of Ayatollah al-Sistani's office, a tattoo under the skin is permissible in itself, permanent or not, as long as it does not promote falsehood and involves nothing else forbidden; wudu, ghusl and prayer remain valid because the ink forms no layer.

${EN_END}

### Dyeing hair

**Category:** halal; views differ on dyeing black.

**Evidence:** "Change this, but avoid black" (Sahih Muslim 2102); Jews and Christians do not dye, so differ from them (Sahih al-Bukhari 3462).

- **Shafiʿi:** black is forbidden according to the well-known view, except for fighters in war.
- **Hanafi, Maliki, Hanbali:** black is makruh according to the prevalent view; some permit it, for example for spouses.
- **Jaʿfari:** dyeing is permitted, including black; dyeing with henna is recommended.

${EN_END}

### Perfume with alcohol

**Category:** disputed.

- **Hanafi:** many contemporary Hanafi scholars consider alcohol not derived from grapes or dates not impure; perfume with such alcohol is then permitted.
- **Maliki, Shafiʿi, Hanbali:** those who regard alcohol as khamr and therefore impure avoid such perfume; other contemporary scholars distinguish technical alcohol from the drink and permit it.
- **Jaʿfari:** according to the answers of Ayatollah al-Sistani's office, all kinds of alcohol are pure (though not drinkable), except wine and, as a precaution, beer; perfumes and medicines containing alcohol may be used; details on [sistani.org](${SI}).

**In practice:** to be safe, use alcohol-free oils (*ʿattar*).

${EN_END}

## Media and entertainment

### Music

**Category:** disputed – the scholars hold different views, and none is given here as a single ruling.

**Evidence cited:** (Quran 31:6), referred to singing by Ibn Masʿud; the hadith about people who will consider musical instruments (*maʿazif*) permissible (Sahih al-Bukhari 5590); two girls singing on the day of Eid in the Prophet's ﷺ house (Sahih al-Bukhari 952).

- **Hanafi, Maliki, Shafiʿi, Hanbali:** the classical majority forbids musical instruments except the frame drum (*daff*) at weddings and festivities; singing without instruments with good content is permitted. Individual scholars such as Ibn Hazm considered instruments permissible.
- **Jaʿfari:** *ghina'* – singing and music suited to gatherings of amusement and sin – is forbidden; other music is permitted according to the rulings of Ayatollah al-Sistani.
- **Contemporary voices:** Dar al-Ifta Egypt permits music that does not lead to or accompany what is forbidden; many other contemporary scholars keep to the classical majority view.

${EN_END}

### Images and photography

**Category:** disputed for images of living beings; pictures of landscapes and objects are halal.

**Evidence:** the most severely punished are the image-makers (Sahih al-Bukhari 5950); angels do not enter a house with a dog or images (Sahih al-Bukhari 5949).

- **Hanafi, Maliki, Shafiʿi, Hanbali:** statues of living beings are forbidden; views on drawn images differ. Many contemporary scholars, including Dar al-Ifta Egypt, permit photography because it is merely a captured image and the prohibition applies only to three-dimensional images; others permit it only when needed.
- **Jaʿfari:** according to the rulings of Ayatollah al-Sistani, drawing and photography are permitted; making statues of living beings is to be avoided as a precaution.

${EN_END}

### Games

**Category:** halal in principle; what is forbidden follows from the content and the consequences.

**Principle:** games are permitted as long as they do not crowd out duties (above all prayer), do not show or glorify what is forbidden and contain no gambling. The Prophet ﷺ raced with ʿAʾisha (Sunan Abi Dawud 2578) and let the Abyssinians play with spears in the mosque (Sahih al-Bukhari 454).

${EN_END}

### Gambling mechanics in games

**Category:** disputed to haram, depending on the design.

**Principle:** loot boxes and similar mechanics in which you spend real money for a random prize resemble *maysir* (Quran 5:90). Many contemporary scholars advise against them or forbid them, especially when winnings can be exchanged back into money. Free random rewards without stakes are not gambling.

${EN_END}

## How we treat each other

### Backbiting (ghiba)

**Category:** haram.

**Evidence:** (Quran 49:12); the Prophet ﷺ explained ghiba as mentioning your brother with something he dislikes (Sahih Muslim 2589).

- **All five schools:** forbidden. Scholars name narrow exceptions: complaining about injustice to someone who can help, warning against harm, sincerely asking for advice.

${EN_END}

### Lying

**Category:** haram, with narrowly limited exceptions.

**Evidence:** (Quran 9:119); truthfulness leads to good (Sahih al-Bukhari 6094); a different word is permitted to reconcile people, in war and between spouses to say good things to each other (Sahih Muslim 2605).

- **All five schools:** lying is forbidden; the exceptions are understood narrowly and never allow taking someone's right.

${EN_END}

### Men and women – meeting and relations

**Category:** meeting at work, in study and in daily life is permitted when decency is kept; a man being alone with an unrelated woman (*khalwa*) is haram.

**Evidence:** lowering the gaze (Quran 24:30–31); asking from behind a screen (Quran 33:53); no man is alone with a woman except with a mahram present (Sahih al-Bukhari 5233).

- **Hanafi, Maliki, Shafiʿi, Hanbali:** khalwa is forbidden; interaction should stay serious and appropriate. On shaking hands with the other sex, the majority is reserved.
- **Jaʿfari:** likewise; shaking hands with a non-mahram without a barrier is not permitted, and looking with desire is forbidden.
- **Relationships before marriage:** a romantic relationship outside marriage is forbidden in all schools; getting to know each other with the intention of marriage in an appropriate setting is permitted.

${EN_END}

## Work and income

### A halal job and income

**Category:** seeking the permitted is a duty.

**Evidence:** (Quran 2:168), (Quran 2:172); the Prophet ﷺ named forbidden food as a reason why a supplication is not answered (Sahih Muslim 1015).

- **All five schools:** work is halal when the activity itself is permitted and no one is wronged. Income from riba, gambling, fraud or selling what is forbidden is haram.

**In practice:** in mixed businesses (such as a supermarket that also sells alcohol), scholars judge by whether your own activity directly serves what is forbidden.

${EN_END}

### Selling forbidden goods

**Category:** haram.

**Evidence:** Allah and His Messenger forbade the sale of wine, carrion, pigs and idols (Sahih al-Bukhari 2236); when Allah forbids a people to eat something, He also forbids them its price (Sunan Abi Dawud 3488).

- **All five schools:** selling, serving and delivering alcohol and pork are forbidden, as is trading in things that serve only what is forbidden.

${EN_END}

## Unclear matters

**Category:** avoiding the unclear is recommended and a sign of piety (*waraʿ*).

**Evidence:** the lawful is clear and the unlawful is clear, and between them are unclear matters; whoever avoids them protects their religion and honour (Sahih al-Bukhari 52, Sahih Muslim 1599). Leave what makes you doubt for what does not make you doubt (Jamiʿ at-Tirmidhi 2518).

**In practice:** whoever is in doubt leaves the matter, asks, or follows the answer of a scholar they trust. Others who act differently because they follow another recognised view are not blamed for it.

${EN_END}

More on lifestyle in the chapter [Islamic lifestyle](/islam/daily), and on earnings and food in the adab of the Shams Method ([Living halal](/shams/adab#t-halal)).`,
    faq: [
      { q: "Is everything forbidden that is not explicitly permitted?", a: "No. In everyday matters, according to most scholars, everything is permitted until evidence forbids it. In acts of worship it is the other way round." },
      { q: "What do I do when the schools disagree?", a: "Follow the school or the scholar you trust and try to stay consistent. Whoever follows another recognised view is not blamed." },
      { q: "May I eat meat from Jews and Christians?", a: "According to the four Sunni schools yes, if the animal was slaughtered by the rules (Quran 5:5). According to the prevalent view of the Jaʿfari school, no." },
      { q: "Are prawns halal?", a: "According to the Maliki, Shafiʿi, Hanbali and Jaʿfari schools yes. In the Hanafi school views differ on whether they count as fish." },
      { q: "Where do I find a binding answer?", a: "From a scholar you trust or from fatwa bodies such as islamqa.org, Dar al-Ifta Egypt or the office of Ayatollah al-Sistani. This guide is an overview, not a fatwa." },
    ],
    sources: [
      "Quran 2:29, 2:168, 2:172, 2:173, 2:219, 2:245, 2:275–280, 2:282, 3:130, 5:3, 5:5, 5:90–91, 5:96, 6:118, 6:121, 6:145, 7:26, 9:119, 16:115, 24:30–31, 31:6, 33:53, 33:59, 49:12",
      "Sahih al-Bukhari 52, 454, 952, 2068, 2236, 3462, 5233, 5590, 5937, 5949, 5950, 6094",
      "Sahih Muslim 1015, 1598, 1599, 2003, 2102, 2125, 2589, 2605",
      "Sunan Abi Dawud 83, 2578, 3488, 3681, 4057; Jamiʿ at-Tirmidhi 69, 1720, 1865, 2518",
      "International Islamic Fiqh Academy (OIC), Resolutions No. 9 (9/2) on insurance and No. 10 (10/2) on bank interest, Jeddah 1985",
      "AAOIFI Shariah Standards (aaoifi.com), incl. No. 26 Islamic Insurance (2006)",
      "islamqa.org · dar-alifta.org · sistani.org",
    ],
  },
};
