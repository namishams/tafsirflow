// Long-form content of the About page (/about). German and English; other languages fall back to English.
export type AboutContent = {
  eyebrow: string; title: string; lead: string;
  facts: { n: string; l: string }[];
  story: string;
  valuesTitle: string; values: { t: string; d: string }[];
  freeTitle: string; free: string;
  dubaiEyebrow: string; dubaiTitle: string; dubaiLead: string; dubai: string;
  dubaiMoments: { t: string; d: string }[];
  thanksEyebrow: string; thanksTitle: string; thanks: string;
  honour?: { eyebrow: string; title: string; body: string; cities: { name: string; ar: string; d: string }[] };
  letterTitle: string; letter: string; signature: string; signatureRole: string;
  contactTitle: string; contact: string;
};

const de: AboutContent = {
  eyebrow: "Über uns",
  title: "In Dubai entstanden – für jeden, der den Koran lernen möchte",
  lead: "Quran Masterclass ist eine kostenlose Plattform, um den Koran zu hören, zu verstehen, auswendig zu lernen und schön zu rezitieren – in 13 Sprachen, für Kinder und Erwachsene, ganz gleich, wo sie leben. Dies ist die Geschichte dahinter.",
  facts: [{ n: "13", l: "Sprachen" }, { n: "114", l: "Suren, Vers für Vers" }, { n: "0 €", l: "Kosten für dich" }, { n: "0", l: "Werbung" }],
  story: `## Ein Gedanke, der nicht mehr losließ

Es gibt Abende in Dubai, an denen die Stadt ganz still wird. Der Verkehr auf der Sheikh Zayed Road rauscht weiter, die Türme leuchten, aber aus einer Moschee in der Nachbarschaft steigt die Rezitation des Imams auf – und für einen Moment ist alles andere unwichtig. Wer das einmal erlebt hat, versteht, warum der Koran für Muslime nicht irgendein Buch ist. Er ist das Wort Allahs. Er ist das, was man im Gebet spricht, was man Kindern beibringt und was man sich am Ende des Lebens wünscht, im Herzen zu tragen.

Und doch geht es vielen von uns gleich: Wir lieben den Koran, aber wir lernen ihn nicht so, wie wir es uns vornehmen. Wir hören eine Sure, nehmen uns vor, sie auswendig zu lernen – und nach zwei Wochen ist sie wieder weg. Wir lesen eine Übersetzung, aber die arabischen Worte bleiben fremd. Wir wünschen uns einen Lehrer, aber der nächste Kurs ist weit, teuer oder zur falschen Uhrzeit.

Gleichzeitig lernen Millionen Menschen jeden Tag eine neue Sprache – mit dem Handy, in der U-Bahn, fünf Minuten vor dem Schlafengehen. Sie bleiben dran, weil die Apps klug gebaut sind: kleine Schritte, Wiederholungen im richtigen Moment, sichtbarer Fortschritt.

Aus diesem Widerspruch ist Quran Masterclass entstanden. Wir haben die Plattform in Dubai gegründet, mit einer einfachen Frage: Was wäre, wenn Koranlernen so gut gebaut wäre wie die besten Lern-Apps der Welt – aber mit dem Respekt, der Tiefe und der Ernsthaftigkeit, die der Koran verdient?

## Warum nichts wichtiger ist

Der Prophet ﷺ sagte: „Die Besten unter euch sind die, die den Koran lernen und ihn lehren.“ (Sahih al-Bukhari) Er sagte auch, dass der Koran am Tag der Auferstehung als Fürsprecher für die kommen wird, die ihn gelesen haben (Sahih Muslim). Für einen gläubigen Menschen gibt es kaum ein Wissen, das mehr zählt.

Deshalb ist Quran Masterclass keine Unterhaltungs-App, die nebenbei ein bisschen Religion anbietet. Hier steht der Koran im Mittelpunkt – jeder einzelne Vers, mit seinem Klang, seiner Bedeutung und seiner Erklärung. Alles andere, die Pläne, die Landkarte, die Akademie, das Radio, dient nur einem Ziel: dass du mehr vom Koran in dein Herz bekommst und dass er dort bleibt.

## Was wir gebaut haben

Im Kern steht die [Shams-Methode](/shams): sieben Schritte pro Vers – hören, rückwärts aufbauen, Wort für Wort verstehen, die Erklärung lesen, aus dem Gedächtnis abrufen, eine eigene Eselsbrücke bilden, über den Vers nachdenken. Ein Gedächtnismodell merkt sich, welche Verse dir leichtfallen und welche nicht, und bringt jeden Vers genau dann zurück, wenn er zu verblassen droht. Auf deiner [Koran-Landkarte](/map) siehst du jeden Tag, was sitzt und was Pflege braucht.

Dazu kommen [Lernpläne](/plan) von gemächlich bis Hifz-Intensiv, eine [Akademie](/academy) mit Lektionen, Tests und Tageszielen, [Tajwīd-Lektionen](/tajweed), ein [Vokabeltrainer](/vocab), ein [Khatm-Planer](/khatm), [Bittgebete aus der Sunnah](/duas), [Gebetszeiten mit Adhan](/prayer) und ein [Koran-Radio](/radio), das nie aufhört zu spielen.

Was wir nicht tun: Wir erfinden keine eigene Auslegung. Koran-Text, Übersetzungen und Tafsir stammen aus anerkannten Quellen und werden immer mit ihrer Herkunft genannt. Die Shams-Methode ist eine Lernmethode – kein neuer Tafsir und kein Ersatz für einen Lehrer, der deine Rezitation hört.`,
  valuesTitle: "Was uns leitet",
  values: [
    { t: "Kostenlos für alle", d: "Der Koran gehört jedem Muslim. Niemand soll aufhören zu lernen, weil ein Abo zu teuer ist." },
    { t: "Authentische Quellen", d: "Text, Übersetzungen und Tafsir aus anerkannten Quellen – immer mit Angabe, woher sie stammen." },
    { t: "Respekt vor deinen Daten", d: "Keine Werbung, keine Analysedienste, kein Verkauf von Daten. Passwörter verschlüsselt, Verbindungen verschlüsselt, Export und Löschung jederzeit." },
    { t: "Würde im Miteinander", d: "Kommentare werden vor der Veröffentlichung geprüft. Was hier steht, soll einem Ort angemessen sein, an dem der Koran gelesen wird." },
    { t: "Für jedes Alter", d: "Vom ersten Kinder-Vers bis zum Hifz-Weg passt sich die Methode an dein Alter und dein Tempo an." },
    { t: "Ehrlichkeit", d: "Keine erfundenen Versprechen, keine aufgeblasenen Zahlen. Was noch fehlt, steht im Änderungsprotokoll – und wird gebaut." },
  ],
  freeTitle: "Kostenlos – und warum das so bleibt",
  free: `Quran Masterclass kostet dich nichts. Keine Probephase, die nach sieben Tagen endet. Keine Werbung zwischen zwei Versen. Keine Funktion, die erst nach dem Bezahlen freigeschaltet wird.

Die Plattform wird **privat getragen** – Server, Entwicklung, Audio, alles. Es ist ein Projekt, das um Allahs willen gebaut wird, in der Hoffnung, dass jeder Vers, den jemand hier lernt, eine fortlaufende gute Tat (Sadaqa Jariya) wird.

Wer helfen möchte, kann das tun: mit Feedback, mit Fehlermeldungen, mit Übersetzungen – und mit Duʿāʾ.`,
  dubaiEyebrow: "Dubai und der Koran",
  dubaiTitle: "Eine Stadt aus Glas und Stahl – mit einem Herzen, das den Koran ehrt",
  dubaiLead: "Wer an Dubai denkt, denkt an Wolkenkratzer, an Wüste und Meer, an eine Stadt, die sich jedes Jahr neu erfindet. Wer hier lebt, kennt noch eine andere Seite.",
  dubai: `Dubai ist ein Ort, an dem der Koran im Alltag zu Hause ist. In fast jedem Viertel steht eine Moschee, fünfmal am Tag ruft der Adhan über Hochhäuser, Villen und Märkte. In vielen Stadtteilen gibt es Koranzentren, in denen Kinder nach der Schule und Erwachsene nach der Arbeit sitzen, um zu lernen – nebeneinander, aus allen Ländern der Welt.

Seit **1997** richtet Dubai den **Dubai International Holy Quran Award** aus, unter der Schirmherrschaft von **Seiner Hoheit Scheich Mohammed bin Rashid Al Maktoum**. Jedes Jahr im Ramadan kommen junge Hafiz-Talente aus Dutzenden von Ländern in die Stadt, um vor einer Jury zu rezitieren. Es ist einer der bekanntesten Koranwettbewerbe der Welt – und ein Zeichen dafür, welchen Rang das Auswendiglernen des Korans in dieser Stadt hat.

In **Al Khawaneej** wurde 2019 der **Quranic Park** eröffnet, ein Park mit Pflanzen, die im Koran erwähnt werden – Datteln, Oliven, Feigen, Granatäpfel – und mit Gärten, die an Geschichten aus dem Koran erinnern. Familien gehen dort spazieren und lernen nebenbei, wo im Koran von diesen Gaben Allahs die Rede ist.

Und dann ist da der **Ramadan in Dubai**: Wenn die Stadt sich verlangsamt, wenn zur Iftar-Zeit die Straßen still werden, wenn nach dem Isha in den Moscheen das Tarawih-Gebet beginnt und die Rezitation bis spät in die Nacht dauert. Wer einmal in einer vollen Moschee in Dubai die letzten Nächte des Ramadan erlebt hat, mit Menschen aus Pakistan, Ägypten, Indonesien, Bosnien, Deutschland und den Emiraten Schulter an Schulter, der weiß: Der Koran verbindet Menschen, die sonst nichts verbindet.

Genau das ist der Geist, aus dem Quran Masterclass kommt. Eine Plattform, die in vielen Sprachen spricht, weil Dubai in vielen Sprachen spricht. Eine Plattform, die modernste Technik nutzt, weil Dubai zeigt, dass Fortschritt und Glaube kein Widerspruch sind. Und eine Plattform, die jedem offensteht, weil hier Menschen aus mehr als 200 Nationen gemeinsam leben.`,
  dubaiMoments: [
    { t: "Seit 1997", d: "Dubai International Holy Quran Award – Hafiz-Talente aus aller Welt rezitieren jedes Jahr im Ramadan in Dubai." },
    { t: "Quranic Park", d: "Seit 2019 in Al Khawaneej: Pflanzen und Gärten, die an Verse und Geschichten des Korans erinnern." },
    { t: "Koranzentren", d: "In vielen Vierteln lernen Kinder und Erwachsene gemeinsam – Menschen aus allen Ländern der Welt." },
    { t: "Ramadan-Nächte", d: "Tarawih in vollen Moscheen, Schulter an Schulter mit Menschen aus Dutzenden Nationen." },
  ],
  thanksEyebrow: "Danke, Dubai",
  thanksTitle: "Dank an die Führung von Dubai und den Vereinigten Arabischen Emiraten",
  thanks: `Quran Masterclass ist in Dubai entstanden, und wir sind von Herzen dankbar für die Möglichkeiten, die diese Stadt und dieses Land allen Menschen geben, die hier leben.

Wir danken **Seiner Hoheit Scheich Mohammed bin Rashid Al Maktoum**, Vizepräsident und Premierminister der VAE und Herrscher von Dubai. Seine Vision hat Dubai zu einem Ort gemacht, an dem Ideen wachsen können – und unter seiner Schirmherrschaft ehrt der Dubai International Holy Quran Award seit 1997 Menschen, die den Koran auswendig lernen.

Wir danken **Seiner Hoheit Scheich Hamdan bin Mohammed bin Rashid Al Maktoum**, Kronprinz von Dubai, der die Zukunft dieser Stadt mitgestaltet, und **Seiner Hoheit Scheich Mohamed bin Zayed Al Nahyan**, Präsident der Vereinigten Arabischen Emirate. Und wir gedenken in Dankbarkeit **Scheich Zayed bin Sultan Al Nahyan** – möge Allah ihm barmherzig sein –, dem Gründervater der Emirate, der Glauben, Großzügigkeit und Offenheit zum Fundament dieses Landes gemacht hat.

Ein sicheres Zuhause, Toleranz zwischen Menschen aus aller Welt, Achtung vor dem Glauben und ein Umfeld, das Innovation ermutigt – das sind die Bedingungen, unter denen ein Projekt wie dieses entstehen kann. Möge Allah sie belohnen, ihnen Gesundheit und Weisheit schenken und dieses Land und seine Menschen beschützen.`,
  honour: {
    eyebrow: "In Dankbarkeit",
    title: "Für die, die dem Koran und den heiligen Stätten dienen",
    body: `Wir danken **Seiner Hoheit Scheich Hamdan bin Mohammed bin Rashid Al Maktoum**, dem Kronprinzen von Dubai, den viele unter seinem Dichternamen **„Fazza“** kennen. Er steht für eine junge Generation, die ihre Wurzeln ehrt und mutig nach vorn schaut – genau diese Verbindung von Herkunft und Zukunft wünschen wir uns auch für das Lernen des Korans.

Wir danken **Seiner Hoheit Scheich Mohamed bin Zayed Al Nahyan**, dem Präsidenten der Vereinigten Arabischen Emirate, und grüßen **Abu Dhabi**, wo die **Scheich-Zayed-Moschee** Menschen aller Herkunft willkommen heißt und das **Abrahamic Family House** für das friedliche Miteinander steht.

Wir danken **Seiner Hoheit Scheich Dr. Sultan bin Muhammad Al Qasimi**, dem Herrscher von **Schardscha**, dessen Liebe zu Büchern, Bildung und islamischer Kultur das Emirat geprägt hat – Schardscha wurde 2014 zur Hauptstadt der islamischen Kultur ernannt.

Und wir danken dem **Hüter der beiden Heiligen Moscheen, König Salman bin Abdulaziz Al Saud**, und **Seiner Königlichen Hoheit Kronprinz Mohammed bin Salman**, dem Premierminister des Königreichs Saudi-Arabien, für den Dienst an Mekka und Medina, an der Heiligen Moschee und der Moschee des Propheten ﷺ und an den Millionen Pilgern, die jedes Jahr zum Hadsch und zur Umra kommen.

Möge Allah sie alle belohnen, sie rechtleiten und die Länder der Muslime in Frieden, Sicherheit und Wohlstand bewahren.`,
    cities: [
      { name: "Mekka", ar: "مكة المكرمة", d: "Die Kaaba, die Qibla aller Muslime – hier begann die Offenbarung." },
      { name: "Medina", ar: "المدينة المنورة", d: "Die Stadt des Propheten ﷺ und seine Moschee." },
      { name: "Al-Quds", ar: "القدس", d: "Die Al-Aqsa-Moschee, die erste Gebetsrichtung." },
    ],
  },
  letterTitle: "Ein paar Worte von uns",
  letter: `Wir wünschen uns, dass niemand mehr sagen muss: „Ich würde gern Koran lernen, aber ich weiß nicht, wie.“

Wir wünschen uns, dass ein Kind in Hamburg, eine Großmutter in Sarajevo, ein Student in Jakarta und ein Taxifahrer in Dubai dieselbe Möglichkeit haben – kostenlos, in ihrer Sprache, in ihrem Tempo. Dass sie jeden Tag ein Stück weiterkommen. Und dass sie eines Tages eine Sure im Gebet rezitieren, die sie hier gelernt haben.

Wenn dir diese Plattform hilft, dann bitten wir dich nur um eines: Mach Duʿāʾ für alle, die daran mitgewirkt haben – und erzähl jemandem davon, der auch lernen möchte.`,
  signature: "Quran Masterclass",
  signatureRole: "Dubai",
  contactTitle: "Schreib uns",
  contact: "Fragen, Ideen, Fehler im Text, Wünsche für neue Tafsir-Quellen oder Sprachen: Schreib an **info@quranmasterclass.com** oder nutze unsere [Feedback-Seite](/feedback). Was wir umsetzen, findest du im [Änderungsprotokoll](/changelog).",
};

const en: AboutContent = {
  eyebrow: "About us",
  title: "Made in Dubai – for everyone who wants to learn the Quran",
  lead: "Quran Masterclass is a free platform to listen to, understand, memorise and beautifully recite the Quran – in 13 languages, for children and adults, wherever they live. This is the story behind it.",
  facts: [{ n: "13", l: "languages" }, { n: "114", l: "surahs, verse by verse" }, { n: "$0", l: "cost to you" }, { n: "0", l: "ads" }],
  story: `## A thought that would not let go

There are evenings in Dubai when the city goes quiet. The traffic on Sheikh Zayed Road keeps rushing, the towers glow, but from a mosque in the neighbourhood the imam's recitation rises – and for a moment nothing else matters. Anyone who has felt that understands why the Quran is not just any book for Muslims. It is the word of Allah. It is what we speak in prayer, what we teach our children, and what we hope to carry in our hearts at the end of our lives.

And yet so many of us share the same story: we love the Quran, but we don't learn it the way we intend to. We listen to a surah, decide to memorise it – and two weeks later it is gone. We read a translation, but the Arabic words stay foreign. We wish for a teacher, but the nearest class is far away, expensive or at the wrong time.

Meanwhile, millions of people learn a new language every day – on their phones, on the metro, five minutes before sleep. They keep going because the apps are cleverly built: small steps, reviews at the right moment, visible progress.

Quran Masterclass was born from that contrast. We founded the platform in Dubai with one simple question: what if learning the Quran were built as well as the best learning apps in the world – but with the respect, the depth and the seriousness the Quran deserves?

## Why nothing matters more

The Prophet ﷺ said: "The best of you are those who learn the Quran and teach it." (Sahih al-Bukhari) He also said that on the Day of Resurrection the Quran will come as an intercessor for those who read it (Sahih Muslim). For a believer there is hardly any knowledge that counts for more.

That is why Quran Masterclass is not an entertainment app that offers a bit of religion on the side. Here the Quran is at the centre – every single verse, with its sound, its meaning and its explanation. Everything else, the plans, the map, the academy, the radio, serves one goal: that more of the Quran enters your heart and stays there.

## What we have built

At the core is the [Shams Method](/shams): seven steps per verse – listen, build it backwards, understand it word by word, read the explanation, recall it from memory, make your own memory hook, reflect. A memory model learns which verses come easily to you and which don't, and brings each verse back exactly when it is about to fade. On your [Quran map](/map) you see every day what sits firmly and what needs care.

Around it: [learning plans](/plan) from gentle to hifz-intensive, an [academy](/academy) with lessons, tests and daily goals, [tajweed lessons](/tajweed), a [vocabulary trainer](/vocab), a [khatm planner](/khatm), [supplications from the Sunnah](/duas), [prayer times with adhan](/prayer) and a [Quran radio](/radio) that never stops playing.

What we don't do: we don't invent our own interpretation. Quran text, translations and tafsir come from recognised sources and always name where they come from. The Shams Method is a learning method – not a new tafsir and not a replacement for a teacher who listens to your recitation.`,
  valuesTitle: "What guides us",
  values: [
    { t: "Free for everyone", d: "The Quran belongs to every Muslim. No one should stop learning because a subscription is too expensive." },
    { t: "Authentic sources", d: "Text, translations and tafsir from recognised sources – always showing where they come from." },
    { t: "Respect for your data", d: "No ads, no analytics services, no selling of data. Passwords hashed, connections encrypted, export and deletion any time." },
    { t: "Dignity together", d: "Comments are reviewed before they appear. What is written here should befit a place where the Quran is read." },
    { t: "For every age", d: "From a child's first verse to the hifz track, the method adapts to your age and your pace." },
    { t: "Honesty", d: "No invented promises, no inflated numbers. What is still missing is in the changelog – and being built." },
  ],
  freeTitle: "Free – and why it stays that way",
  free: `Quran Masterclass costs you nothing. No trial that ends after seven days. No ads between two verses. No feature that unlocks only after payment.

The platform is **privately funded** – servers, development, audio, everything. It is built for the sake of Allah, in the hope that every verse someone learns here becomes an ongoing good deed (sadaqa jariya).

If you would like to help, you can: with feedback, bug reports, translations – and with du'a.`,
  dubaiEyebrow: "Dubai and the Quran",
  dubaiTitle: "A city of glass and steel – with a heart that honours the Quran",
  dubaiLead: "When people think of Dubai, they think of skyscrapers, desert and sea, a city that reinvents itself every year. Those who live here know another side.",
  dubai: `Dubai is a place where the Quran is at home in everyday life. Almost every neighbourhood has a mosque; five times a day the adhan rises over towers, villas and markets. In many districts there are Quran centres where children sit after school and adults after work to learn – side by side, from every country in the world.

Since **1997** Dubai has hosted the **Dubai International Holy Quran Award**, under the patronage of **His Highness Sheikh Mohammed bin Rashid Al Maktoum**. Every Ramadan, young huffaz from dozens of countries come to the city to recite before a jury. It is one of the best-known Quran competitions in the world – and a sign of the rank that memorising the Quran holds in this city.

In **Al Khawaneej** the **Quranic Park** opened in 2019, a park with plants mentioned in the Quran – dates, olives, figs, pomegranates – and gardens recalling stories from the Quran. Families stroll there and learn, almost in passing, where the Quran speaks of these gifts of Allah.

And then there is **Ramadan in Dubai**: when the city slows down, when the streets fall silent at iftar, when after isha the taraweeh prayer begins in the mosques and the recitation goes on late into the night. Anyone who has stood in a full Dubai mosque in the last nights of Ramadan, shoulder to shoulder with people from Pakistan, Egypt, Indonesia, Bosnia, Germany and the Emirates, knows: the Quran unites people who share nothing else.

That is the spirit Quran Masterclass comes from. A platform that speaks many languages because Dubai speaks many languages. A platform that uses modern technology because Dubai shows that progress and faith are not opposites. And a platform open to everyone, because people from more than 200 nations live here together.`,
  dubaiMoments: [
    { t: "Since 1997", d: "Dubai International Holy Quran Award – young huffaz from around the world recite in Dubai every Ramadan." },
    { t: "Quranic Park", d: "Since 2019 in Al Khawaneej: plants and gardens recalling verses and stories of the Quran." },
    { t: "Quran centres", d: "In many neighbourhoods children and adults learn together – people from every country in the world." },
    { t: "Ramadan nights", d: "Taraweeh in full mosques, shoulder to shoulder with people from dozens of nations." },
  ],
  thanksEyebrow: "Thank you, Dubai",
  thanksTitle: "Gratitude to the leadership of Dubai and the United Arab Emirates",
  thanks: `Quran Masterclass was built in Dubai, and we are deeply grateful for the opportunities this city and this country give to everyone who lives here.

We thank **His Highness Sheikh Mohammed bin Rashid Al Maktoum**, Vice President and Prime Minister of the UAE and Ruler of Dubai. His vision made Dubai a place where ideas can grow – and under his patronage the Dubai International Holy Quran Award has honoured those who memorise the Quran since 1997.

We thank **His Highness Sheikh Hamdan bin Mohammed bin Rashid Al Maktoum**, Crown Prince of Dubai, who helps shape the future of this city, and **His Highness Sheikh Mohamed bin Zayed Al Nahyan**, President of the United Arab Emirates. And we remember with gratitude **Sheikh Zayed bin Sultan Al Nahyan** – may Allah have mercy on him – the founding father of the Emirates, who made faith, generosity and openness the foundation of this country.

A safe home, tolerance between people from all over the world, respect for faith and an environment that encourages innovation – these are the conditions in which a project like this can be born. May Allah reward them, grant them health and wisdom, and protect this country and its people.`,
  honour: {
    eyebrow: "In gratitude",
    title: "For those who serve the Quran and the holy places",
    body: `We thank **His Highness Sheikh Hamdan bin Mohammed bin Rashid Al Maktoum**, Crown Prince of Dubai, whom many know by his poet's name **“Fazza”**. He stands for a young generation that honours its roots and looks boldly ahead – the very bond of heritage and future we wish for learning the Quran.

We thank **His Highness Sheikh Mohamed bin Zayed Al Nahyan**, President of the United Arab Emirates, and greet **Abu Dhabi**, where the **Sheikh Zayed Grand Mosque** welcomes people of every background and the **Abrahamic Family House** stands for living together in peace.

We thank **His Highness Sheikh Dr. Sultan bin Muhammad Al Qasimi**, Ruler of **Sharjah**, whose love of books, education and Islamic culture has shaped the emirate – Sharjah was named Capital of Islamic Culture in 2014.

And we thank the **Custodian of the Two Holy Mosques, King Salman bin Abdulaziz Al Saud**, and **His Royal Highness Crown Prince Mohammed bin Salman**, Prime Minister of the Kingdom of Saudi Arabia, for their service to Makkah and Madinah, to the Sacred Mosque and the Mosque of the Prophet ﷺ, and to the millions of pilgrims who come for Hajj and Umrah every year.

May Allah reward them all, guide them and keep the lands of the Muslims in peace, security and prosperity.`,
    cities: [
      { name: "Makkah", ar: "مكة المكرمة", d: "The Kaaba, the qibla of all Muslims – where revelation began." },
      { name: "Madinah", ar: "المدينة المنورة", d: "The city of the Prophet ﷺ and his mosque." },
      { name: "Al-Quds", ar: "القدس", d: "Al-Aqsa Mosque, the first qibla." },
    ],
  },
  letterTitle: "A few words from us",
  letter: `We wish that no one would ever again have to say: "I would love to learn the Quran, but I don't know how."

We wish that a child in Hamburg, a grandmother in Sarajevo, a student in Jakarta and a taxi driver in Dubai all had the same chance – free, in their language, at their pace. That they move a little further every day. And that one day they recite a surah in prayer that they learned here.

If this platform helps you, we ask only one thing: make du'a for everyone who contributed to it – and tell someone else who wants to learn.`,
  signature: "Quran Masterclass",
  signatureRole: "Dubai",
  contactTitle: "Write to us",
  contact: "Questions, ideas, a mistake in the text, wishes for new tafsir sources or languages: write to **info@quranmasterclass.com** or use our [feedback page](/feedback). What we build is listed in the [changelog](/changelog).",
};

// other languages: src/lib/pagecontent/<locale>/about.ts (default export AboutContent); missing ones fall back to English
const OTHER = ["ar", "bn", "es", "fa", "fr", "id", "ms", "ps", "ru", "tr", "ur", "zh"];
export async function aboutContent(locale: string): Promise<AboutContent> {
  if (locale === "de") return de;
  if (!OTHER.includes(locale)) return en;
  try { return (await import(`./pagecontent/${locale}/about`)).default as AboutContent; } catch { return en; }
}
