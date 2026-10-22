import type { SistersText } from "./types";

// "Für Schwestern" – Deutsch (Sie-Form). Jede Aussage mit Quelle (sources.ts); Verse nur als Verweis, Hadithe nur mit
// Sammlung und Nummer. Entwurf: needs_review (sources.ts SISTERS_REVIEW), bis Gelehrte den Text geprüft haben.
const de: SistersText = {
  kicker: "Für Schwestern",
  title: "Ihr Lernen geht an allen Tagen weiter",
  lead: "Was sich an den Tagen der Menstruation (Ḥayḍ) und nach der Geburt (Nifās) beim Rezitieren ändert, wie die Shams-Methode weitergeht und welche Frauen den Koran überliefert und gelehrt haben. Lernen hört nie auf; für manche Schulen ändert sich nur die Form.",
  reviewLine: "Inhalt wird von Gelehrten geprüft",
  notFatwa: "Dies ist ein Überblick, keine Fatwa. Fragen Sie eine Gelehrte oder einen Gelehrten Ihres Vertrauens, besonders in Ihrer eigenen Rechtsschule.",
  sourcesTitle: "Quellen",
  schools: { hanafi: "Hanafitisch", maliki: "Malikitisch", shafii: "Schafiitisch", hanbali: "Hanbalitisch", jafari: "Dschaʿfaritisch (Schia)", majority: "Mehrheit der Gelehrten", contemporary: "Heutige Fatwa-Stellen" },
  open: "Öffnen",
  readVerse: "Im Koran lesen und hören",
  entryTitle: "Für Schwestern",
  entryLead: "Rezitieren an den Tagen der Menstruation, Hör- und Verstehenstage in der Shams-Methode und die Frauen, die den Koran weitergegeben haben.",
  entryCta: "Ansehen",

  partRecite: {
    title: "Rezitieren, Auswendiglernen und der Muṣḥaf",
    lead: "Die Schulen unterscheiden sich vor allem beim Rezitieren aus dem Gedächtnis. Zuhören, Dhikr und Bittgebete sind nach allen hier genannten Quellen erlaubt.",
    blocks: [
      {
        id: "memory",
        title: "Aus dem Gedächtnis rezitieren",
        positions: [
          { school: "hanafi", text: "Nicht erlaubt mit der Absicht der Rezitation, auch nicht weniger als ein Vers. Erlaubt sind Verse mit der Absicht von Bittgebet, Gedenken oder Schutz, und das Lesen mit den Augen, ohne auszusprechen. Eine Lehrerin darf Wort für Wort mit Pausen unterrichten, denn das gilt nicht als Rezitation.", src: ["arij", "sgHanafi"] },
          { school: "maliki", text: "Solange die Blutung anhält, darf eine Frau in Ḥayḍ – nach Dar al-Ifta auch in Nifās – aus dem Gedächtnis rezitieren, ob sie das Vergessen fürchtet oder nicht. Hat die Blutung aufgehört, aber die Ganzwaschung noch nicht stattgefunden, nur dann, wenn sie das Vergessen fürchtet.", src: ["ifta12343"] },
          { school: "shafii", text: "Schon ein Vers ist nicht erlaubt. Erlaubt sind Formeln aus dem Koran, die als Gedenken gesprochen werden.", src: ["sgShafii"] },
          { school: "hanbali", text: "Die Lehrmeinung der Schule ist das Verbot. Ibn Taymiyya hielt das Rezitieren für erlaubt, auch in Nifās, wenn sie das Vergessen fürchtet.", src: ["muftiwp18", "iqa2564"] },
          { school: "jafari", text: "Nach Ayatollah al-Sistani sind nur die vier Niederwerfungsverse verboten (32:15, 41:37, 53:62, 96:19), der Vers selbst, nicht die ganze Sure. Andere Verse gehören nicht zu den aufgezählten Verboten. Für Nifās gilt dasselbe als verpflichtende Vorsicht.", src: ["sistani354", "sistani448", "sistani502"] },
          { school: "contemporary", text: "Das Muftiamt der Bundesterritorien Malaysias hält das Wiederholen des Auswendiggelernten für erlaubt, auch an Hifz-Schulen. islamqa.info hält die erlaubende Ansicht für stärker belegt und rät vorsichtig, nur das zu rezitieren, was man zu vergessen fürchtet.", src: ["muftiwp18", "iqa2564"] },
        ],
      },
      {
        id: "mushaf",
        title: "Den Muṣḥaf berühren",
        positions: [
          { school: "majority", text: "Den Muṣḥaf ohne Reinheit zu berühren ist nach der Mehrheit nicht erlaubt.", src: ["iqa2564"] },
          { school: "hanafi", text: "Erlaubt mit einem getrennten Tuch oder einer Hülle, die nicht am Körper befestigt ist.", src: ["bham"] },
          { school: "maliki", text: "Eine Frau, die lernt oder lehrt, darf den Muṣḥaf oder einen Teil davon während des Lernens oder Lehrens berühren und tragen. Dar al-Ifta empfiehlt allgemein die Mehrheitsmeinung, erlaubt aber bei echter Not – Auswendiglernen, Unterrichten, Lehrberuf – der malikitischen Ansicht ohne Sünde zu folgen.", src: ["ifta12343"] },
          { school: "jafari", text: "Die Schrift des Korans zu berühren ist verboten.", src: ["sistani354", "sistani448"] },
        ],
      },
      {
        id: "screen",
        title: "Vom Bildschirm oder aus der App",
        positions: [
          { school: "contemporary", text: "islamqa.info: Ein Telefon ist kein Muṣḥaf; es darf ohne Reinheit berührt werden. Dar al-Ifta (Ägypten): Für die Mehrheit ist das Rezitieren verboten, gleich über welches Mittel; den Bildschirm anzusehen, ohne auszusprechen, ist erlaubt.", src: ["iqa106961", "ifta7815"] },
          { school: "hanafi", text: "Darul Iftaa Azaadville: Solange Korantext auf dem Bildschirm steht, gelten Bildschirm und Symbole dieser Seite wie der Muṣḥaf; nicht direkt berühren, ein Eingabestift ist möglich. Zuhören ist erlaubt.", src: ["azaad"] },
        ],
      },
      {
        id: "always",
        title: "Was immer bleibt",
        points: [
          { text: "Zuhören: Rezitationen zu hören ist erlaubt; die Hanafi-Quelle nennt es sehr lobenswert, auch von Aufnahmen. Das Muftiamt Malaysias empfiehlt das Hören als Ersatz für die Wiederholung.", src: ["azaad", "sgHanafi", "muftiwp18"] },
          { text: "Dhikr und Bittgebete sind erlaubt; die Mehrheit nimmt nur sie vom Verbot aus, sofern sie nicht als Rezitation gemeint sind.", src: ["iqa2564", "sgShafii"] },
          { text: "Der Prophet ﷺ rezitierte den Koran, während sein Kopf im Schoß von ʿĀʾischa lag, als sie ihre Tage hatte. Die Nähe zum Koran bleibt.", src: ["bukhari297", "muslim301"] },
        ],
      },
    ],
  },

  partShams: {
    title: "Wie die Shams-Methode weitergeht",
    lead: "An Hör- und Verstehenstagen bleibt Ihr Ḥifẓ lebendig, ohne laut zu rezitieren. Ihre Serie und Ihr Garten wachsen weiter.",
    steps: [
      { id: "listen", title: "Ḥifẓ durch Hören", text: "Hören Sie Ihren heutigen Sabaq, Ihr Sabqī und Ihren Manzil von einem Meisterrezitator, Vers für Vers und mehrmals.", src: ["muftiwp18", "sgHanafi"] },
      { id: "eyes", title: "Mit den Augen mitlesen", text: "Lesen Sie still mit, ohne auszusprechen. Ob Sie den Bildschirm dabei berühren, richtet sich nach Ihrer Schule (siehe oben).", src: ["sgHanafi", "ifta7815", "azaad"] },
      { id: "understand", title: "Verstehen (Tadabbur)", text: "Bedeutung, Tafsir und Zusammenhang Ihrer Verse: der Schritt „Verstehen“ der Shams-Methode." },
      { id: "words", title: "Wortschatz", text: "Die Wörter Ihrer Verse und ihre Wurzeln, mit Karteikarten." },
      { id: "tajweed", title: "Tajwīd-Theorie und Makhārij", text: "Regeln lernen, Mundbilder und Beschreibungen der Artikulationsstellen ansehen. Ob Sie einzelne Buchstaben laut üben, klären Sie bitte mit Ihrer Lehrerin." },
      { id: "dua", title: "Dhikr und Bittgebete", text: "Bittgebete und Gedenken begleiten jeden Tag.", src: ["iqa2564"] },
    ],
    notes: [
      { text: "Lehrerinnen nach hanafitischer Schule dürfen Wort für Wort mit Pausen unterrichten.", src: ["arij"] },
      { text: "Wer der malikitischen Schule folgt, darf während der Blutung weiter rezitieren und beim Lernen oder Lehren den Muṣḥaf berühren.", src: ["ifta12343"] },
      { text: "Nach dem Ende der Blutung: Nach malikitischer Schule ist das Rezitieren erst nach der Ganzwaschung wieder erlaubt, außer bei Furcht vor dem Vergessen.", src: ["ifta12343"] },
    ],
  },

  partSajda: {
    title: "Die Niederwerfung beim Rezitieren (Sajdat at-Tilāwa)",
    lead: "Was gilt, wenn Sie einen Niederwerfungsvers hören oder lesen.",
    positions: [
      { school: "hanafi", text: "In Ḥayḍ und Nifās weder erlaubt noch gültig, und sie wird auch nicht geschuldet oder nachgeholt.", src: ["sgSajda"] },
      { school: "majority", text: "Reinheit ist Bedingung; deshalb wird die Niederwerfung nicht ausgeführt (al-Sarachsi, Ibn Dschuzayy, an-Nawawi, ar-Ruhaybani).", src: ["ifta24156"] },
      { school: "contemporary", text: "Nach einer anderen Ansicht ist Reinheit nicht nötig (Ibn Taymiyya, asch-Schawkani). Dar al-Ifta zieht die Mehrheit vor, sieht aber keine Sünde bei einer Frau, die der anderen Ansicht folgt.", src: ["ifta24156"] },
      { school: "jafari", text: "Nach al-Sistani ist die Niederwerfung beim Rezitieren oder Hören eines der vier Niederwerfungsverse Pflicht; Waschung oder Ganzwaschung sind dafür nicht nötig. Von einer Aufnahme gehört, wird sie nicht Pflicht – das gilt auch für die Rezitationen in dieser App.", src: ["sistani1079"] },
    ],
  },

  partWomen: {
    title: "Frauen und der Koran",
    lead: "Für den Schritt „Verstehen“: Verse über Frauen und die Frauen, die den Koran bewahrt, gelehrt und rezitiert haben.",
    versesTitle: "Verse zum Nachdenken",
    verses: [
      { ref: "33:35", topic: "Gläubige Männer und Frauen werden nebeneinander genannt, mit demselben Lohn." },
      { ref: "3:195", topic: "Keine Tat geht verloren, ob von einem Mann oder einer Frau." },
      { ref: "4:124", topic: "Gute Taten von Mann oder Frau im Glauben führen ins Paradies." },
      { ref: "16:97", topic: "Ein gutes Leben für jeden, Mann oder Frau, der Gutes tut und glaubt." },
      { ref: "58:1", topic: "Allah hörte die Frau, die über ihren Mann klagte; die Sure trägt ihren Namen (al-Mudschādila)." },
      { ref: "66:11", topic: "Das Bittgebet der Frau Pharaos um ein Haus im Paradies." },
      { ref: "66:12", topic: "Maryam, die den Worten ihres Herrn glaubte." },
      { ref: "3:42", topic: "Maryam ist auserwählt und gereinigt (bis 3:43)." },
      { ref: "28:7", topic: "Die Eingebung an die Mutter Mūsās: Fürchte dich nicht und sei nicht traurig." },
    ],
    companionsTitle: "Gefährtinnen, die den Koran weitergaben",
    companions: [
      { text: "Ḥafṣa bint ʿUmar bewahrte die Blätter (Ṣuḥuf) der Koran-Sammlung von Abū Bakr; ʿUthmān ließ von ihnen die Abschriften machen und gab sie ihr zurück.", src: ["bukhari4986", "bukhari4987"] },
      { text: "Umm Waraqa las den Koran; der Prophet ﷺ erlaubte ihr einen Gebetsrufer in ihrem Haus und trug ihr auf, die Leute ihres Hauses im Gebet zu leiten.", src: ["abudawud591", "abudawud592"] },
      { text: "ʿĀʾischa erklärte Verse und berichtigte Deutungen, etwa zu 2:158 und 4:3.", src: ["bukhari1643", "muslim3018"] },
      { text: "Umm Salama beschrieb, wie der Prophet ﷺ al-Fātiḥa Vers für Vers rezitierte und nach jedem Vers innehielt – ein Grundstein für Tajwīd und das Pausieren (Waqf).", src: ["abudawud4001", "tirmidhi2927"] },
    ],
    scholarsTitle: "Gelehrte Frauen",
    scholars: [
      { text: "Karīma al-Marwaziyya (gest. 1069 in Mekka) war eine Autorität für die Überlieferung des Ṣaḥīḥ al-Bukhārī.", src: ["karima"] },
      { text: "Fāṭima bint Muḥammad as-Samarqandī kannte das Fiqh-Werk ihres Vaters auswendig; Fatwas trugen ihre Handschrift neben der ihres Vaters und ihres Mannes.", src: ["samarqandi"] },
      { text: "Mohammad Akram Nadwi hat ein Lexikon der Hadith-Gelehrten Frauen in rund 40 Bänden auf Arabisch verfasst; seine Einführung erschien als „Al-Muhaddithat: The Women Scholars in Islam“.", src: ["nadwi"] },
    ],
    recitersTitle: "Rezitatorinnen",
    reciters: [
      { text: "Beim Internationalen Koranrezitationswettbewerb in Malaysia gibt es eine eigene Wertung für Rezitatorinnen (Qāriʾa); zu den Siegerinnen zählen Rogayah Sulong und Faridah Mat Saman aus Malaysia und Maria Ulfah aus Indonesien.", src: ["mtq", "aljazeera"] },
      { text: "Eine Aufnahme der ägyptischen Rezitatorin Schaykha Mabrūka von 1905 ist erhalten; heute machen Initiativen Rezitatorinnen wieder sichtbar.", src: ["aljazeera"] },
    ],
  },

  partTogether: {
    title: "Mit einer Lehrerin und mit Schwestern lernen",
    lead: "Rezitation lernt man durch Hören und Vortragen bei einer Lehrperson.",
    teacher: "Verbinden Sie Ihre Shams-Methode mit einer Lehrerin Ihrer Wahl: Sie sieht Ihren Plan und Ihre Aufnahmen, wenn Sie sie senden.",
    circles: "In „Gemeinsam“ gibt es Lernrunden nur für Schwestern.",
    teacherCta: "Lehrerin verbinden",
    circlesCta: "Schwesternrunden",
  },

  setup: {
    title: "Für Schwestern einrichten?",
    lead: "Ein freiwilliger Bereich, der Ihr Lernen an allen Tagen begleitet.",
    points: [
      "Sie wählen Ihre Rechtsschule. Danach richtet sich, was an Ihren Tagen pausiert.",
      "„Meine Tage“ ist ein einfacher Schalter: ja oder nein. Kein Datum, kein Verlauf, kein Zykluskalender.",
      "Alles bleibt nur auf diesem Gerät. Nichts wird mit Ihrem Konto abgeglichen, an einen Server oder eine KI gesendet; beim Abmelden wird es gelöscht.",
      "Sie können es jederzeit ändern oder ausschalten.",
    ],
    agree: "Ja, einrichten",
    decline: "Nein, danke",
    declined: "In Ordnung. Wir fragen nichts weiter. Die Seite „Für Schwestern“ bleibt unter Entdecken für Sie offen.",
    madhhabTitle: "Welcher Rechtsschule folgen Sie?",
    madhhabLead: "Wenn Sie es nicht wissen, gilt die vorsichtige Ansicht der Mehrheit.",
    madhhabs: { hanafi: "Hanafitisch", maliki: "Malikitisch", shafii: "Schafiitisch", hanbali: "Hanbalitisch", jafari: "Dschaʿfaritisch (Schia)", unknown: "Ich weiß es nicht" },
    done: "Fertig",
    later: "Sie finden alles unter Entdecken → Für Schwestern.",
  },

  days: {
    title: "Meine Tage",
    lead: "Ein Schalter, nur auf diesem Gerät. Solange er an ist, pausiert die App das, was Ihre Schule an diesen Tagen nicht vorsieht, und schaltet die Hör- und Verstehenstage ein. Ihre Serie und Ihr Garten bleiben, Wiederholungen verschieben sich, statt sich zu stauen.",
    question: "Haben Sie gerade Ihre Tage?",
    yes: "Ja",
    no: "Nein",
    statusOn: "An: Hör- und Verstehenstage sind aktiv.",
    statusOff: "Aus.",
    rules: {
      hanafi: "Hanafitisch: Rezitieren aus dem Gedächtnis und Rezitationsübungen pausieren. Zuhören, Mitlesen mit den Augen, Verstehen, Wortschatz, Tajwīd-Theorie und Bittgebete bleiben.",
      maliki: "Malikitisch: Rezitieren aus dem Gedächtnis bleibt erlaubt, solange die Blutung anhält. Die App erinnert Sie daran, statt zu pausieren. Den Muṣḥaf berühren nur beim Lernen oder Lehren.",
      shafii: "Schafiitisch: Rezitieren aus dem Gedächtnis und Rezitationsübungen pausieren. Zuhören, Mitlesen mit den Augen, Verstehen, Wortschatz, Tajwīd-Theorie und Bittgebete bleiben.",
      hanbali: "Hanbalitisch: Rezitieren aus dem Gedächtnis und Rezitationsübungen pausieren (Lehrmeinung der Schule). Zuhören, Mitlesen, Verstehen, Wortschatz, Tajwīd-Theorie und Bittgebete bleiben.",
      jafari: "Dschaʿfaritisch: Die vier Niederwerfungsverse (32:15, 41:37, 53:62, 96:19) bitte auslassen; die App weist darauf hin. Für den Zustand der Janāba nennt al-Sistani (Regel 355) das Rezitieren von mehr als sieben Versen als verpönt (makrūh); ob das für Ḥayḍ gilt, fragen Sie bitte Ihre Instanz der Nachahmung.",
      unknown: "Vorsichtige Ansicht der Mehrheit: Rezitieren aus dem Gedächtnis und Rezitationsübungen pausieren. Zuhören, Mitlesen mit den Augen, Verstehen, Wortschatz, Tajwīd-Theorie und Bittgebete bleiben.",
    },
    strictTitle: "Strenger Modus",
    strictLead: "Ihre eigene Wahl: An Ihren Tagen pausiert alles außer Zuhören und Bittgebeten, auch Tafsir und Wortschatz. Keine der großen Schulen verlangt das; Zuhören, Tafsir und Bittgebete sind erlaubt.",
    offTitle: "Ich bin wieder rein",
    offNote: "Nach dem Ende der Blutung ist die Ganzwaschung (Ghusl) nötig; nach malikitischer Schule ist das Rezitieren erst danach wieder erlaubt, außer bei Furcht vor dem Vergessen.",
    ghuslLink: "Zur Anleitung der Waschung",
    privacy: "Nur auf diesem Gerät. Kein Datum, kein Verlauf, keine Übertragung. Beim Abmelden gelöscht.",
    changeMadhhab: "Rechtsschule ändern",
  },

  gate: {
    pausedTitle: "Pausiert, bis Ihre Tage vorbei sind",
    pausedMajority: "Nach Ihrer Schule wird an diesen Tagen nicht aus dem Gedächtnis rezitiert. Ihr Ḥifẓ bleibt lebendig: Hören Sie heute dieselben Verse und lernen Sie ihre Bedeutung.",
    pausedStrict: "Sie haben den strengen Modus gewählt: Heute bleiben Zuhören und Bittgebete.",
    noteMaliki: "Nach malikitischer Schule dürfen Sie während der Blutung aus dem Gedächtnis rezitieren.",
    noteJafari: "Bitte lassen Sie die Niederwerfungsverse 32:15, 41:37, 53:62 und 96:19 aus.",
    listenInstead: "Heute hören statt rezitieren",
    toSection: "Für Schwestern",
    openAnyway: "Trotzdem öffnen",
  },

  ld: {
    title: "Hör- und Verstehenstage",
    lead: "Wenn Sie gerade nicht laut rezitieren können oder möchten – auf Reisen, bei Heiserkeit, an Ihren Tagen: Ihr Wird wird zu Hören, Verstehen und Wortschatz. Serie und Garten bleiben.",
    on: "Hör- und Verstehenstage",
    onHint: "Ein einfacher Schalter wie der Reisemodus, nur auf diesem Gerät. Kein Datum wird gespeichert.",
    activeTitle: "Heute: Hör- und Verstehenstag",
    activeLead: "Ihr Ḥifẓ bleibt lebendig, ohne laut zu rezitieren.",
    done: "Hörtag abschließen",
    doneMsg: "Mā schāʾ Allāh. Ihr Hörtag zählt für Ihre Serie und Ihren Garten.",
    off: "Wieder rezitieren",
    sistersLink: "Hinweise für Schwestern",
  },
};
export default de;
