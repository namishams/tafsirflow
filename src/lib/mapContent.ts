// Long-form content of the Quran map page (/map). German and English; other languages fall back to English.
export type MapContent = {
  kicker: string; title: string; lead: string; ctaStart: string; ctaToday: string;
  stats: { n: string; l: string }[];
  readTitle: string; readLead: string;
  colors: { key: "strong" | "mid" | "weak" | "none"; t: string; d: string; todo: string }[];
  howTitle: string; howBody: string;
  useTitle: string; uses: { t: string; d: string }[];
  views: { t: string; d: string }[]; viewsTitle: string;
  faqTitle: string; faq: { q: string; a: string }[];
  finalTitle: string; finalLead: string;
};

const de: MapContent = {
  kicker: "Quran Masterclass · Shams-Methode",
  title: "Die Koran-Landkarte",
  lead: "114 Suren, 30 Ajzā', 6.236 Verse – und auf einen Blick siehst du, was bei dir sitzt, was wackelt und was dir schwerfällt. Die Karte ist kein Fortschrittsbalken, der nur wächst. Sie ist ein ehrlicher Spiegel deines Gedächtnisses: Sie wird grün, wenn du wiederholst, und verblasst, wenn du einen Vers zu lange liegen lässt.",
  ctaStart: "Ersten Vers mit der Shams-Methode lernen",
  ctaToday: "Zu deinen heutigen Aufgaben",
  stats: [{ n: "114", l: "Suren als Kästchen" }, { n: "30", l: "Ajzā' als Übersicht" }, { n: "6.236", l: "Verse einzeln sichtbar" }],
  readTitle: "So liest du deine Karte",
  readLead: "Jedes Kästchen ist eine Sure. Die Farbe ist der Durchschnitt aller Verse, die du in dieser Sure schon gelernt hast. Ist eine Sure erst zum Teil gelernt, wird ihr Kästchen heller gezeichnet. Tippst du auf ein Kästchen, öffnet sich die Sure Vers für Vers.",
  colors: [
    { key: "strong", t: "Grün – sitzt", d: "Du hast diese Verse rechtzeitig wiederholt, dein Gedächtnis hält sie sicher.", todo: "Nichts tun – die Plattform holt sie zurück, kurz bevor sie verblassen würden." },
    { key: "mid", t: "Gold – wackelt", d: "Die letzte Wiederholung liegt schon eine Weile zurück. Du kannst die Verse noch, aber nicht mehr mühelos.", todo: "Heute oder morgen wiederholen. Ein Durchgang im Auswendig-Modus reicht meist." },
    { key: "weak", t: "Rot – schwierig", d: "Entweder lange nicht wiederholt oder du hast dich hier öfter vertan. Fehler im Test, in der Lektion oder beim Prüfen zählen mit.", todo: "Zuerst diese Verse: Öffne sie mit der Shams-Methode, nutze die Eselsbrücken und den Rückwärts-Aufbau." },
    { key: "none", t: "Grau – noch nicht gelernt", d: "Hier liegt noch Weg vor dir. Grau ist kein Mangel, sondern eine Einladung.", todo: "Wenn dein Plan es vorsieht: als Nächstes lernen. Kurze Suren am Ende des Korans sind ein guter Anfang." },
  ],
  howTitle: "Wie die Karte weiß, was du kannst",
  howBody: "Hinter jedem gelernten Vers steht ein kleines Gedächtnismodell. Es merkt sich, **wann** du den Vers zuletzt wiederholt hast, **in welchem Abstand** er wiederkommen soll und **wie oft** du dich bei ihm vertan hast.\n\n- **Abstand:** Nach dem ersten Lernen kommt ein Vers schon am nächsten Tag zurück, danach nach drei Tagen, einer Woche, zwei Wochen, einem Monat und länger. Jede gelungene Wiederholung verlängert den Abstand.\n- **Verblassen:** Je länger ein Vers über seinem Abstand liegt, desto weiter sinkt seine geschätzte Stärke – aus Grün wird Gold, aus Gold wird Rot. So wie im echten Gedächtnis.\n- **Leichtigkeit:** Verse, die dir leichtfallen, bekommen größere Abstände. Verse, bei denen du dich vertust, kommen öfter. Jeder Fehler senkt die Leichtigkeit und zählt zusätzlich als Malus auf der Karte.\n- **Synchron:** Mit deinem Konto ist die Karte auf allen Geräten gleich – am Handy gelernt, am Laptop gesehen.\n\nDie Karte ist eine Schätzung, kein Urteil. Ob ein Vers wirklich sitzt, zeigt dir am Ende nur das Rezitieren – am besten vor jemandem, der dich korrigieren kann.",
  useTitle: "Was du mit der Karte machst",
  uses: [
    { t: "Morgens: Rot zuerst", d: "Bevor du Neues lernst, holst du die roten Kästchen zurück. Fünf Minuten Wiederholung retten mehr als zwanzig Minuten Neulernen." },
    { t: "Vor dem Gebet", d: "Gold markierte kurze Suren sind ideal für das Gebet: Wer sie rezitiert, wiederholt sie – und die Karte wird grüner." },
    { t: "Mit dem Lehrer", d: "Zeig deinem Lehrer oder deinen Eltern die Karte. In Sekunden sehen sie, wo sie abhören sollten." },
    { t: "Für den Ramadan", d: "Wer zum Ramadan eine Juz sicher können möchte, schaltet auf die Juz-Ansicht und arbeitet sich vom Rot zum Grün." },
  ],
  viewsTitle: "Drei Ebenen, ein Bild",
  views: [
    { t: "Suren", d: "114 Kästchen – vom langen Al-Baqarah bis zum kurzen An-Nas. Die schnellste Übersicht über deinen ganzen Koran." },
    { t: "Ajzā'", d: "30 Kästchen für die 30 Teile. Ideal für Hifz-Pläne, die in Juz denken, und für die Khatm-Planung." },
    { t: "Verse", d: "Tippe auf eine Sure: Jeder Vers wird ein eigenes Kästchen. Ein Tipp öffnet ihn direkt zum Wiederholen oder Neulernen." },
  ],
  faqTitle: "Häufige Fragen zur Landkarte",
  faq: [
    { q: "Warum wird ein grünes Kästchen wieder gold, obwohl ich nichts falsch gemacht habe?", a: "Weil Gedächtnis verblasst, wenn man nicht wiederholt. Die Karte zeigt nicht, was du einmal gelernt hast, sondern was du heute wahrscheinlich noch sicher kannst. Eine Wiederholung macht es wieder grün – und der nächste Abstand wird länger." },
    { q: "Ich sehe eine Beispielkarte – ist das mein Fortschritt?", a: "Nein. Solange du nicht angemeldet bist oder noch keinen Vers gelernt hast, zeigen wir eine deutlich markierte Beispielkarte, damit du siehst, wie es aussehen wird. Sobald du deinen ersten Vers lernst, erscheint deine eigene Karte." },
    { q: "Zählt es, wenn ich nur zuhöre?", a: "Zuhören ist der erste Schritt der Shams-Methode, auf die Karte kommt ein Vers aber erst, wenn du ihn gelernt und abgerufen hast – im Shams-Coach, in einer Lektion, beim Test oder im Wiederholungsmodus." },
    { q: "Was ist, wenn ich die Sure schon vorher auswendig konnte?", a: "Öffne sie im Auswendig-Modus, rezitiere jeden Vers aus dem Gedächtnis und bewerte ihn mit „Leicht“. Er erscheint sofort auf der Karte, springt im Plan nach vorn und kommt in langen Abständen zurück, damit er sicher bleibt." },
    { q: "Sehen andere meine Karte?", a: "Nein. Deine Karte gehört dir. Sie wird mit deinem Konto verschlüsselt übertragen und nirgendwo öffentlich angezeigt." },
  ],
  finalTitle: "Jedes grüne Kästchen ist ein Stück Koran in deinem Herzen.",
  finalLead: "Fang heute mit einem einzigen Vers an. Morgen siehst du ihn auf deiner Karte – und in einem Jahr eine ganze Landschaft.",
};

const en: MapContent = {
  kicker: "Quran Masterclass · Shams Method",
  title: "The Quran map",
  lead: "114 surahs, 30 ajza', 6,236 verses – and at a glance you see what sits firmly, what is wobbling and what is hard for you. The map is not a progress bar that only grows. It is an honest mirror of your memory: it turns green when you review and fades when you leave a verse alone for too long.",
  ctaStart: "Learn your first verse with the Shams Method",
  ctaToday: "Go to today's tasks",
  stats: [{ n: "114", l: "surahs as boxes" }, { n: "30", l: "ajza' at a glance" }, { n: "6,236", l: "verses, each visible" }],
  readTitle: "How to read your map",
  readLead: "Every box is a surah. Its colour is the average of all verses you have already learned in that surah. If a surah is only partly learned, its box is drawn lighter. Tap a box and the surah opens verse by verse.",
  colors: [
    { key: "strong", t: "Green – firm", d: "You reviewed these verses in time, your memory holds them securely.", todo: "Nothing to do – the platform brings them back just before they would fade." },
    { key: "mid", t: "Gold – wobbling", d: "Your last review was a while ago. You still know the verses, but no longer effortlessly.", todo: "Review today or tomorrow. One pass in memorise mode is usually enough." },
    { key: "weak", t: "Red – difficult", d: "Either not reviewed for a long time or you often slipped here. Mistakes in tests, lessons and reviews all count.", todo: "These first: open them with the Shams Method, use the memory hooks and the backward build-up." },
    { key: "none", t: "Grey – not learned yet", d: "There is still a journey ahead. Grey is not a failing, it is an invitation.", todo: "If your plan says so: learn next. The short surahs at the end of the Quran are a good start." },
  ],
  howTitle: "How the map knows what you know",
  howBody: "Behind every learned verse sits a small memory model. It remembers **when** you last reviewed the verse, **at what interval** it should come back and **how often** you slipped on it.\n\n- **Interval:** after first learning, a verse returns the next day, then after three days, a week, two weeks, a month and longer. Every successful review stretches the interval.\n- **Fading:** the further a verse is past its interval, the lower its estimated strength – green turns gold, gold turns red. Just like real memory.\n- **Ease:** verses that come easily get longer intervals. Verses you slip on come back more often. Every mistake lowers the ease and also counts as a penalty on the map.\n- **In sync:** with your account the map is the same on every device – learned on your phone, seen on your laptop.\n\nThe map is an estimate, not a verdict. Whether a verse truly sits is shown in the end only by reciting it – ideally to someone who can correct you.",
  useTitle: "What you do with the map",
  uses: [
    { t: "Mornings: red first", d: "Before you learn anything new, bring back the red boxes. Five minutes of review save more than twenty minutes of relearning." },
    { t: "Before prayer", d: "Short surahs marked gold are perfect for salah: reciting them is reviewing them – and the map turns greener." },
    { t: "With your teacher", d: "Show your teacher or parents the map. In seconds they see where to listen to you." },
    { t: "For Ramadan", d: "Want to know a juz securely by Ramadan? Switch to the juz view and work from red to green." },
  ],
  viewsTitle: "Three levels, one picture",
  views: [
    { t: "Surahs", d: "114 boxes – from long Al-Baqarah to short An-Nas. The fastest overview of your whole Quran." },
    { t: "Ajza'", d: "30 boxes for the 30 parts. Ideal for hifz plans that think in juz, and for khatm planning." },
    { t: "Verses", d: "Tap a surah: every verse becomes its own box. One tap opens it for review or for new learning." },
  ],
  faqTitle: "Questions about the map",
  faq: [
    { q: "Why does a green box turn gold although I did nothing wrong?", a: "Because memory fades without review. The map does not show what you once learned, but what you probably still know securely today. One review makes it green again – and the next interval gets longer." },
    { q: "I see an example map – is that my progress?", a: "No. As long as you are not signed in or have not learned a verse yet, we show a clearly marked example so you can see what it will look like. As soon as you learn your first verse, your own map appears." },
    { q: "Does listening count?", a: "Listening is the first step of the Shams Method, but a verse appears on the map only once you have learned and recalled it – in the Shams coach, a lesson, a test or review mode." },
    { q: "What if I already knew the surah by heart?", a: "Open it in memorise mode, recite each verse from memory and rate it “Easy”. It appears on the map immediately, jumps ahead in the schedule and comes back at long intervals so it stays secure." },
    { q: "Can others see my map?", a: "No. Your map belongs to you. It is transferred encrypted with your account and never shown publicly." },
  ],
  finalTitle: "Every green box is a piece of the Quran in your heart.",
  finalLead: "Start today with a single verse. Tomorrow you will see it on your map – and in a year a whole landscape.",
};

// other languages: src/lib/pagecontent/<locale>/map.ts (default export MapContent); missing ones fall back to English
const OTHER = ["ar", "bn", "es", "fa", "fr", "id", "ms", "ps", "ru", "tr", "ur", "zh"];
export async function mapContent(locale: string): Promise<MapContent> {
  if (locale === "de") return de;
  if (!OTHER.includes(locale)) return en;
  try { return (await import(`./pagecontent/${locale}/map`)).default as MapContent; } catch { return en; }
}
