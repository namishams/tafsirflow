import type { IslamDoc } from "./types";

// Chapter: special prayers and rites in the Ja'fari (Twelver Shia) school – German + English (owner, 22.10.2026).
// Rulings follow Ayatollah al-Sistani's "Islamic Laws" (sistani.org, checked 22.10.2026; ruling numbers in the text);
// where other maraji' differ, the text says so. No Quran, hadith or dua text is typed here: verses link to the reader,
// duas are named with their source. needs_review: true ("Inhalt wird von Gelehrten geprüft").
const S = "https://www.sistani.org/english/book/48";

export const prayersSpecialShia: IslamDoc = {
  slug: "prayers-special-shia",
  arabic: "صلوات خاصة",
  needs_review: true,
  de: {
    title: "Besondere Gebete und Riten – Dschaʿfari",
    kicker: "Gebet · Schiitisch",
    lead: "Freitagsgebet, Festgebete, das Gebet für Verstorbene und das Gebet der ersten Nacht im Grab, das Gebet der Zeichen, das Nachtgebet, Istichara, Gebet um Regen, Reisen, Ghusl und Tayammum – so, wie sie in der Dschaʿfari-Rechtsschule gelehrt werden. Die Regeln folgen den Islamic Laws von Ayatollah al-Sistani; wo andere Maradschiʿ abweichen, steht es dabei.",
    facts: [
      { n: "5", l: "Takbire im Totengebet (Salat al-Mayyit)" },
      { n: "10", l: "Verbeugungen im Gebet der Zeichen (2 Rakat × 5)" },
      { n: "11", l: "Rakat im Nachtgebet (8 + 2 Schafʿ + 1 Witr)" },
      { n: "≈ 44 km", l: "Reisestrecke, ab der verkürzt wird (8 Farsach)" },
    ],
    body: `## Eine anerkannte Schule des Islam

Die Dschaʿfari-Rechtsschule ist nach Imam Dschaʿfar as-Sadiq benannt. Die **Amman-Botschaft** (2004/2005), von Gelehrten aller großen Schulen unterzeichnet, nennt sie ausdrücklich unter den acht anerkannten Rechtsschulen des Islam, neben den vier sunnitischen, der zaiditischen, der ibaditischen und der zahiritischen Schule. Die Grundlagen des täglichen Gebets finden Sie im Kapitel [Wie man betet – im schiitischen Islam](/islam/prayer-shia). Dieses Kapitel ergänzt alles, was darüber hinaus zum Gebetsleben gehört.

Wichtig vorab: Im schiitischen Recht folgt jede Gläubige und jeder Gläubige einem lebenden Rechtsgelehrten (Mardschaʿ). Die Nummern in diesem Kapitel beziehen sich auf die [Islamic Laws von Ayatollah al-Sistani](${S}/). Wer einem anderen Mardschaʿ folgt, prüft die Einzelheiten in dessen Rechtsbuch (Tawdih al-Masaʾil).

## Das Freitagsgebet (Salat al-Dschumuʿa)

Nach al-Sistani ist das Freitagsgebet ein **wahlweise verpflichtendes** Gebet (al-wadschib at-tachyiri): Am Freitag kann man entweder das Freitagsgebet oder das Mittagsgebet (Dhuhr) beten; wer das Freitagsgebet betet, für den ersetzt es Dhuhr. Es hat **zwei Rakat** wie das Morgengebet und **zwei Predigten davor**, die der Imam im Stehen hält, mit einem kurzen Sitzen dazwischen. Die Pflicht zur Teilnahme besteht nur, wenn das Gebet vom unfehlbaren Imam oder seinem besonderen Vertreter angeordnet ist (Regeln 719–721, [Quelle](${S}/2210/)). Andere Maradschiʿ beurteilen den Status während der Verborgenheit des Imams anders. Der Quranvers dazu: [62:9](/surah/62?v=9).

## Die Festgebete (ʿId al-Fitr und ʿId al-Adha)

Während der Verborgenheit des Imams sind die Festgebete **empfohlen** (mustahabb) und können allein oder in Gemeinschaft gebetet werden, vom Sonnenaufgang bis zur Dhuhr-Zeit (Regeln 1495–1496). Sie haben **zwei Rakat**. In jeder Raka folgen nach der Sure zusätzliche Takbire mit einem Qunut nach jedem Takbir, dann ein weiterer Takbir vor der Verbeugung. Die meisten Maradschiʿ sprechen fünf Qunut in der ersten und vier in der zweiten Raka; al-Sistani hält vier und drei für besser und erlaubt auch eine kürzere Form (Regel 1498 mit Fußnote, [Quelle](${S}/2275/)). In Gemeinschaft folgen zwei Predigten (Regel 1500).

## Beim Tod eines Menschen

Wenn ein Muslim stirbt, sind seine Waschung (Ghusl al-Mayyit), das Leichentuch, das Totengebet und die Bestattung Pflicht ([Quelle](${S}/2185/)). Wer einen erkalteten Verstorbenen vor dessen Waschung berührt, verrichtet danach den Ghusl wegen Berührung eines Verstorbenen (Ghusl Mass al-Mayyit).

### Das Totengebet (Salat al-Mayyit) mit fünf Takbiren

Das schiitische Totengebet hat **fünf Takbire**, ohne Verbeugung und Niederwerfung (Regel 597, [Quelle](${S}/2190/)):

1. Nach dem ersten Takbir: das Glaubenszeugnis (Schahadatain).
2. Nach dem zweiten: das Segensgebet für Muhammad und die Familie Muhammads.
3. Nach dem dritten: das Bittgebet um Vergebung für die gläubigen Männer und Frauen.
4. Nach dem vierten: das Bittgebet für den Verstorbenen (für ein Kind ein eigenes Bittgebet).
5. Mit dem fünften Takbir endet das Gebet.

Die genauen Wortlaute der Bittgebete stehen in Regel 597 der Islamic Laws; lernen Sie sie dort oder bei Ihrem Lehrer. Wudu ist für das Totengebet nicht Bedingung, man soll aber die Regeln der anderen Gebete einhalten, so weit es geht (Regel 585). Es ist für jeden verstorbenen Muslim Pflicht, der sechs Jahre vollendet hat (Regeln 582–583, [Quelle](${S}/2189/)).

### Das Gebet der ersten Nacht im Grab (Salat al-Wahscha)

In der Nacht nach der Bestattung ist ein Gebet von zwei Rakat für den Verstorbenen empfohlen, am besten am Anfang der Nacht nach Isha (Regeln 627–629, [Quelle](${S}/8296/)):

- **Erste Raka:** nach der Fatiha der Thronvers [2:255–257](/surah/2?v=255).
- **Zweite Raka:** nach der Fatiha zehnmal die Sure [al-Qadr](/surah/97).
- **Nach dem Salam:** das Segensgebet für Muhammad und die Familie Muhammads und die Bitte, den Lohn dieses Gebets dem Grab des Verstorbenen zu schenken; dabei nennt man seinen Namen.

Wird die Bestattung verschoben, betet man es in der ersten Nacht nach der Bestattung.

## Das Gebet der Zeichen (Salat al-Ayat)

Bei einer Sonnen- oder Mondfinsternis, einem Erdbeben und anderen Naturereignissen, die die meisten Menschen in Furcht versetzen, ist im Dschaʿfari-Recht das Gebet der Zeichen Pflicht ([Quelle](${S}/2273/)). Es hat **zwei Rakat mit je fünf Verbeugungen**: Vor jeder Verbeugung liest man die Fatiha und eine Sure; nach der fünften Verbeugung folgen die zwei Niederwerfungen. In der kürzeren Form liest man die Fatiha einmal und teilt eine Sure auf die fünf Verbeugungen auf. Qunut ist vor der 2., 4., 6., 8. und 10. Verbeugung empfohlen (Regeln 1486–1494, [Quelle](${S}/2274/)).

## Nachtgebet und freiwillige Gebete

Die täglichen freiwilligen Gebete (Nawafil) haben zusammen **34 Rakat** (Regel 751). Das **Nachtgebet (Salat al-Lail)** hat **elf Rakat**: acht Rakat Nachtgebet in Paaren, dann zwei Rakat **Schafʿ** und eine Raka **Witr** (Regel 752, [Quelle](${S}/2215/)). Die beste Zeit ist das letzte Drittel der Nacht ([17:79](/surah/17?v=79), [73:1–6](/surah/73)).

Das **Ghufaila-Gebet** wird zwischen Maghrib und Isha gebetet: zwei Rakat, in der ersten nach der Fatiha [21:87–88](/surah/21?v=87), in der zweiten nach der Fatiha [6:59](/surah/6?v=59), danach ein Qunut mit der eigenen Bitte (Regel 762, [Quelle](${S}/2217/)).

### Ramadan: Nafila statt Tarawih

Die Dschaʿfari-Schule kennt kein Tarawih in Gemeinschaft: Freiwillige Gebete werden einzeln gebetet, mit wenigen Ausnahmen wie dem Gebet um Regen. Im Ramadan sind stattdessen zusätzliche freiwillige Gebete überliefert, insgesamt **tausend Rakat** über den Monat verteilt, die man allein betet. Ihre Aufteilung steht in den Büchern der gottesdienstlichen Handlungen wie [Mafatih al-Dschinan](https://en.wikishia.net/view/Mafatih_al-jinan) von Schaich Abbas al-Qummi. Besonders gepflegt werden die Nächte von Laylat al-Qadr am 19., 21. und 23. Ramadan.

## Istichara

Für die Istichara, das Bitten um Gottes Wahl, sind ein Gebet und ein Bittgebet überliefert; dazu ist ein Ghusl empfohlen (Regel 633). In der schiitischen Praxis verbreitet ist außerdem die Istichara mit dem Quran oder mit der Gebetskette, oft durch einen Gelehrten. Formen und Bittgebete finden Sie in Mafatih al-Dschinan und unter [Istikhara](https://en.wikishia.net/view/Istikhara). Das Bittgebet der Istichara aus der sunnitischen Überlieferung steht in unseren [Duas](/duas?cat=prayer).

## Gebet um Regen (Salat al-Istisqaʾ)

Bei Dürre ist das Gebet um Regen empfohlen. Es wird wie das Festgebet mit zwei Rakat und Predigt gebetet; ein Ghusl davor ist empfohlen (Regel 633). Die Gemeinschaft fastet oft vorher und gibt Almosen.

## Auf Reisen: Verkürzen und Zusammenlegen

- **Verkürzen (Qasr) ist Pflicht**, wenn die Reise mindestens acht Farsach beträgt, etwa **44 km**; Hin- und Rückweg dürfen zusammengezählt werden (Regel 1258, [Quelle](${S}/2264/)). Dhuhr, Asr und Isha werden dann mit zwei Rakat gebetet.
- Wer an einem Ort **zehn Tage** bleiben will, betet dort vollständig (Regel 1320); nach dreißig Tagen ohne feste Absicht ebenso.
- In **Mekka, Medina, Kufa** und am Schrein von **Imam al-Husain** darf ein Reisender wählen, ob er vollständig oder verkürzt betet (Regel 1341, [Quelle](${S}/2265/)).
- Auf Reisen entfallen die freiwilligen Gebete von Dhuhr und Asr (Regel 754).
- **Zusammenlegen (Dschamʿ)** von Dhuhr mit Asr und Maghrib mit Isha ist in der Dschaʿfari-Schule immer erlaubt, auch ohne Reise; die Reihenfolge ist Pflicht.

## Reinheit: Ghusl und Tayammum

**Pflicht-Ghusl** gibt es nach al-Sistani in sieben Fällen: nach Dschanaba, nach Menstruation (Haid), nach dem Wochenbett (Nifas), bei Istihada, nach Berührung eines Verstorbenen, die Waschung des Verstorbenen selbst und durch Gelübde oder Eid ([Quelle](${S}/2161/)). Er wird entweder **der Reihe nach** (tartibi: Kopf und Hals, dann der übrige Körper) oder **durch vollständiges Eintauchen** (irtimasi) verrichtet ([Quelle](${S}/2166/)).

**Empfohlene Ghusl** sind unter anderem der Freitags-Ghusl, der Ghusl an beiden Festen, in den Nächten 1, 17, 19, 21, 23 und 24 des Ramadan, am Tag der Mubahala, für die Istichara und für das Gebet um Regen (Regeln 633–634, [Quelle](${S}/2194/)). Mit einem empfohlenen Ghusl, der als solcher feststeht, darf man nach al-Sistani ohne Wudu beten (Regel 635).

**Tayammum** ersetzt Wudu oder Ghusl, wenn Wasser fehlt oder schadet ([4:43](/surah/4?v=43), [5:6](/surah/5?v=6)): Man schlägt mit beiden Handflächen auf reine Erde, Sand oder Stein, streicht über die Stirn vom Haaransatz bis zur Nasenspitze, dann über den Rücken der rechten und der linken Hand ([Quelle](${S}/2204/)).

## Die Niederwerfung auf Erde (Turba)

Die Stirn liegt in der Niederwerfung auf Erde oder auf dem, was aus ihr wächst und weder gegessen noch getragen wird ([Quelle](${S}/2236/)). Daher die **Turba**, eine Tafel aus reinem Ton; mehr dazu im Kapitel [Wie man betet](/islam/prayer-shia) und unter [Turba](https://en.wikishia.net/view/Turba).

## Adhan und Iqama

Die Dschaʿfari-Form des Gebetsrufs mit *Hayya ʿala chairi l-ʿamal* steht im Kapitel [Wie man betet](/islam/prayer-shia). Das Zeugnis über die Wilaya von Imam Ali ist nach al-Sistani **nicht Teil** von Adhan und Iqama; es ist gut, es nach dem Zeugnis über den Propheten ﷺ mit der Absicht der Nähe zu Allah zu sprechen (Regel 905, [Quelle](${S}/2228/)). So sehen es die großen Maradschiʿ.

## Wo die Maradschiʿ voneinander abweichen

Einige Beispiele, damit Sie wissen, wann Sie in Ihrem eigenen Rechtsbuch nachsehen sollten:

- **Freitagsgebet:** wahlweise Pflicht bei al-Sistani; andere Maradschiʿ urteilen anders.
- **Festgebet:** vier und drei Qunut bei al-Sistani, fünf und vier bei den meisten anderen.
- **Füße im Wudu:** al-Sistani verlangt als Pflichtvorsicht das Wischen bis zum Gelenk; andere lassen die Erhebung des Fußrückens genügen.
- **Monatsbeginn:** Die Maradschiʿ haben unterschiedliche Regeln zur Mondsichtung; die Daten im [Kalender](/calendar) können deshalb um einen Tag abweichen.

## Die anderen schiitischen Richtungen

Neben den Zwölfer-Schiiten gibt es die **Zaiditen**, vor allem im Jemen, deren Recht dem sunnitischen in vielem nahesteht (siehe [die zaiditische Schule](/islam/zaydi)), und die **Ismailiten** mit einer eigenen Linie von Imamen. Dieses Kapitel beschreibt die Dschaʿfari-Praxis der Zwölfer-Schia.

## Andere Rechtsschulen

Wie die sunnitischen Schulen diese Gebete verrichten, steht im Kapitel [Besondere Gebete – sunnitisch](/islam/prayers-special-sunni). Möge Allah Ihre Gebete annehmen.`,
    faq: [
      { q: "Warum hat das schiitische Totengebet fünf Takbire?", a: "So überliefern es die Imame der Ahl al-Bait; die Dschaʿfari-Schule betet es mit fünf Takbiren und je einem festen Inhalt nach den ersten vier (Islamic Laws, Regel 597). Die sunnitischen Schulen beten es mit vier." },
      { q: "Was ist die Salat al-Wahscha?", a: "Ein empfohlenes Gebet von zwei Rakat in der ersten Nacht nach der Bestattung, dessen Lohn man dem Verstorbenen schenkt: in der ersten Raka der Thronvers (2:255–257), in der zweiten zehnmal Sure al-Qadr (Regel 627)." },
      { q: "Beten Schiiten Tarawih?", a: "Nicht in Gemeinschaft. Freiwillige Gebete werden in der Dschaʿfari-Schule einzeln gebetet. Im Ramadan gibt es dafür die überlieferten tausend Rakat freiwilliger Gebete über den Monat." },
      { q: "Ist das Gebet der Zeichen Pflicht?", a: "Ja, bei Sonnen- und Mondfinsternis, Erdbeben und anderen Ereignissen, die die meisten Menschen in Furcht versetzen. Es hat zwei Rakat mit je fünf Verbeugungen." },
      { q: "Ab wann verkürze ich auf Reisen?", a: "Nach al-Sistani ab acht Farsach, etwa 44 km, Hin- und Rückweg zusammengezählt. Wer zehn Tage an einem Ort bleiben will, betet dort vollständig." },
    ],
    sources: [
      "Quran 2:255–257, 4:43, 5:6, 6:59, 17:79, 21:87–88, 62:9, 73:1–6, 97",
      "Ayatollah as-Sayyid Ali al-Husaini as-Sistani, Islamic Laws (sistani.org, Buch 48): Regeln 582–599, 627–629, 633–635, 719–721, 751–754, 762, 905, 1258, 1320, 1341, 1486–1501",
      "Schaich Abbas al-Qummi, Mafatih al-Dschinan – https://en.wikishia.net/view/Mafatih_al-jinan",
      "WikiShia: Istikhara, Turba, Salat al-Layl, Salat al-Ghufayla, Salat al-Wahsha",
      "Die Amman-Botschaft (2004) und die Erklärung von Amman (2005) – https://ammanmessage.com/",
      "Inhalt wird von Gelehrten geprüft.",
    ],
  },
  en: {
    title: "Special prayers and rites – Ja'fari",
    kicker: "Prayer · Shia",
    lead: "The Friday prayer, the Eid prayers, the prayer over the deceased and the prayer of the first night in the grave, the prayer of signs, the night prayer, istikhara, the prayer for rain, travelling, ghusl and tayammum – as they are taught in the Ja'fari school. The rulings follow Ayatollah al-Sistani's Islamic Laws; where other maraji' differ, the text says so.",
    facts: [
      { n: "5", l: "takbirs in the funeral prayer (salat al-mayyit)" },
      { n: "10", l: "bows in the prayer of signs (2 rak'at × 5)" },
      { n: "11", l: "rak'at in the night prayer (8 + 2 shaf' + 1 witr)" },
      { n: "≈ 44 km", l: "journey from which prayers are shortened (8 farsakh)" },
    ],
    body: `## A recognised school of Islam

The Ja'fari school of law is named after Imam Ja'far al-Sadiq. The **Amman Message** (2004/2005), signed by scholars of all the major schools, names it explicitly among the eight recognised schools of Islam, alongside the four Sunni schools and the Zaydi, Ibadi and Zahiri schools. The basics of the daily prayer are in the chapter [How to pray – in Shia Islam](/islam/prayer-shia). This chapter adds everything beyond it.

First, an important point: in Shia law every believer follows a living jurist (marja'). The numbers in this chapter refer to [Ayatollah al-Sistani's Islamic Laws](${S}/). If you follow another marja', check the details in his manual (Tawdih al-Masa'il).

## The Friday prayer (salat al-jumu'ah)

According to al-Sistani the Friday prayer is an **optional obligation** (al-wajib al-takhyiri): on Friday one may pray either the Friday prayer or the noon prayer (dhuhr), and the Friday prayer suffices in place of dhuhr. It has **two rak'at** like the dawn prayer and **two sermons before it**, given standing with a short sitting in between. Attendance is obligatory only when the prayer is established by the infallible Imam or his specific representative (rulings 719–721, [source](${S}/2210/)). Other maraji' assess its status during the Imam's occultation differently. The Quranic verse: [62:9](/surah/62?v=9).

## The Eid prayers

During the Imam's occultation the Eid prayers are **recommended** (mustahabb) and may be prayed alone or in congregation, from sunrise until the time of dhuhr (rulings 1495–1496). They have **two rak'at**. In each rak'ah, after the surah, additional takbirs follow with a qunut after each, then one more takbir before the bow. Most maraji' say five qunuts in the first and four in the second rak'ah; al-Sistani considers four and three better and also allows a shorter form (ruling 1498 with footnote, [source](${S}/2275/)). In congregation two sermons follow (ruling 1500).

## When someone dies

When a Muslim dies, washing the body (ghusl al-mayyit), the shroud, the funeral prayer and the burial are obligatory ([source](${S}/2185/)). Whoever touches a deceased person whose body has turned cold, before it has been washed, then performs the ghusl for touching the deceased (ghusl mass al-mayyit).

### The funeral prayer (salat al-mayyit) with five takbirs

The Shia funeral prayer has **five takbirs**, without bowing or prostration (ruling 597, [source](${S}/2190/)):

1. After the first takbir: the testimony of faith (shahadatayn).
2. After the second: blessings on Muhammad and the family of Muhammad.
3. After the third: a supplication for the forgiveness of the believing men and women.
4. After the fourth: a supplication for the deceased (with its own supplication for a child).
5. With the fifth takbir the prayer ends.

The exact wording of the supplications is in ruling 597 of Islamic Laws; learn it there or with your teacher. Wudu is not a condition of the funeral prayer, but the rules of the other prayers should be kept where possible (ruling 585). It is obligatory for every deceased Muslim who has completed six years (rulings 582–583, [source](${S}/2189/)).

### The prayer of the first night in the grave (salat al-wahshah)

On the night after the burial a prayer of two rak'at for the deceased is recommended, best at the start of the night after isha (rulings 627–629, [source](${S}/8296/)):

- **First rak'ah:** after al-Fatiha, the Verse of the Throne [2:255–257](/surah/2?v=255).
- **Second rak'ah:** after al-Fatiha, Surat [al-Qadr](/surah/97) ten times.
- **After the salam:** blessings on Muhammad and the family of Muhammad and the request that the reward of this prayer be sent to the grave of the deceased, naming him or her.

If the burial is delayed, it is prayed on the first night after the burial.

## The prayer of signs (salat al-ayat)

In a solar or lunar eclipse, an earthquake and other natural events that frighten most people, the prayer of signs is obligatory in Ja'fari law ([source](${S}/2273/)). It has **two rak'at with five bows each**: before every bow one recites al-Fatiha and a surah; after the fifth bow come the two prostrations. In the shorter form one recites al-Fatiha once and divides one surah over the five bows. Qunut is recommended before the 2nd, 4th, 6th, 8th and 10th bow (rulings 1486–1494, [source](${S}/2274/)).

## Night prayer and voluntary prayers

The daily voluntary prayers (nawafil) have **34 rak'at** in all (ruling 751). The **night prayer (salat al-layl)** has **eleven rak'at**: eight rak'at of night prayer in pairs, then two rak'at of **shaf'** and one rak'ah of **witr** (ruling 752, [source](${S}/2215/)). The best time is the last third of the night ([17:79](/surah/17?v=79), [73:1–6](/surah/73)).

The **ghufaylah prayer** is prayed between maghrib and isha: two rak'at, in the first after al-Fatiha [21:87–88](/surah/21?v=87), in the second after al-Fatiha [6:59](/surah/6?v=59), then a qunut with one's own request (ruling 762, [source](${S}/2217/)).

### Ramadan: nafilah instead of tarawih

The Ja'fari school has no tarawih in congregation: voluntary prayers are prayed individually, with few exceptions such as the prayer for rain. In Ramadan, additional voluntary prayers are transmitted instead, **a thousand rak'at** spread over the month and prayed alone. Their division is given in the books of devotions such as Shaykh Abbas al-Qummi's [Mafatih al-Jinan](https://en.wikishia.net/view/Mafatih_al-jinan). The nights of Laylat al-Qadr on the 19th, 21st and 23rd of Ramadan are kept with particular care.

## Istikhara

For istikhara, asking Allah to choose, a prayer and a supplication are transmitted, and a ghusl is recommended (ruling 633). Common in Shia practice is also istikhara with the Quran or the prayer beads, often through a scholar. Forms and supplications are in Mafatih al-Jinan and under [Istikhara](https://en.wikishia.net/view/Istikhara). The istikhara supplication of the Sunni tradition is in our [duas](/duas?cat=prayer).

## Prayer for rain (salat al-istisqa')

In drought the prayer for rain is recommended. It is prayed like the Eid prayer, with two rak'at and a sermon; a ghusl beforehand is recommended (ruling 633). The community often fasts beforehand and gives charity.

## Travelling: shortening and combining

- **Shortening (qasr) is obligatory** when the journey is at least eight farsakh, about **44 km**; the outward and return legs may be added (ruling 1258, [source](${S}/2264/)). Dhuhr, asr and isha are then prayed with two rak'at.
- Whoever intends to stay ten days in one place prays in full there (ruling 1320); likewise after thirty days without a fixed intention.
- In **Makkah, Madinah, Kufa** and at the shrine of **Imam al-Husayn** a traveller may choose between the full and the shortened prayer (ruling 1341, [source](${S}/2265/)).
- On a journey the voluntary prayers of dhuhr and asr are dropped (ruling 754).
- **Combining (jam')** dhuhr with asr and maghrib with isha is always allowed in the Ja'fari school, also without travel; the order is obligatory.

## Purity: ghusl and tayammum

According to al-Sistani there are seven **obligatory ghusls**: after janabah, after menstruation (hayd), after childbirth bleeding (nifas), for istihadah, after touching a deceased person, the washing of the deceased itself, and by vow or oath ([source](${S}/2161/)). It is performed either **in sequence** (tartibi: head and neck, then the rest of the body) or **by full immersion** (irtimasi) ([source](${S}/2166/)).

**Recommended ghusls** include the Friday ghusl, the ghusl of both Eids, of the nights 1, 17, 19, 21, 23 and 24 of Ramadan, of the day of Mubahala, for istikhara and for the prayer for rain (rulings 633–634, [source](${S}/2194/)). According to al-Sistani one may pray without wudu after a ghusl established as recommended (ruling 635).

**Tayammum** replaces wudu or ghusl when water is lacking or harmful ([4:43](/surah/4?v=43), [5:6](/surah/5?v=6)): strike pure earth, sand or stone with both palms, wipe the forehead from the hairline to the tip of the nose, then the back of the right and of the left hand ([source](${S}/2204/)).

## Prostrating on earth (turbah)

In prostration the forehead rests on earth or on what grows from it and is neither eaten nor worn ([source](${S}/2236/)). Hence the **turbah**, a tablet of pure clay; more in the chapter [How to pray](/islam/prayer-shia) and under [Turba](https://en.wikishia.net/view/Turba).

## Adhan and iqamah

The Ja'fari form of the call to prayer with *hayya 'ala khayri l-'amal* is in the chapter [How to pray](/islam/prayer-shia). According to al-Sistani the testimony to the wilayah of Imam Ali is **not part** of the adhan and iqamah; it is good to say it after the testimony about the Prophet ﷺ with the intention of nearness to Allah (ruling 905, [source](${S}/2228/)). This is the view of the major maraji'.

## Where the maraji' differ

A few examples, so you know when to check your own manual:

- **Friday prayer:** an optional obligation for al-Sistani; other maraji' judge differently.
- **Eid prayer:** four and three qunuts for al-Sistani, five and four for most others.
- **Feet in wudu:** al-Sistani requires, as an obligatory precaution, wiping up to the joint; others accept the raised part of the foot.
- **Start of the month:** the maraji' have different rules on moon sighting, so the dates in the [calendar](/calendar) may differ by a day.

## The other Shia branches

Besides the Twelver Shia there are the **Zaydis**, mainly in Yemen, whose law is close to Sunni law in many points (see [the Zaydi school](/islam/zaydi)), and the **Isma'ilis** with their own line of Imams. This chapter describes the Ja'fari practice of the Twelver Shia.

## Other schools of law

How the Sunni schools perform these prayers is in the chapter [Special prayers – Sunni](/islam/prayers-special-sunni). May Allah accept your prayers.`,
    faq: [
      { q: "Why does the Shia funeral prayer have five takbirs?", a: "That is how the Imams of the Ahl al-Bayt transmitted it; the Ja'fari school prays it with five takbirs and a fixed content after each of the first four (Islamic Laws, ruling 597). The Sunni schools pray it with four." },
      { q: "What is salat al-wahshah?", a: "A recommended prayer of two rak'at on the first night after the burial, whose reward is given to the deceased: in the first rak'ah the Verse of the Throne (2:255–257), in the second Surat al-Qadr ten times (ruling 627)." },
      { q: "Do Shia Muslims pray tarawih?", a: "Not in congregation. In the Ja'fari school voluntary prayers are prayed individually. In Ramadan there are instead the transmitted thousand rak'at of voluntary prayer over the month." },
      { q: "Is the prayer of signs obligatory?", a: "Yes, at solar and lunar eclipses, earthquakes and other events that frighten most people. It has two rak'at with five bows each." },
      { q: "From when do I shorten when travelling?", a: "According to al-Sistani from eight farsakh, about 44 km, outward and return legs added together. Whoever intends to stay ten days in one place prays in full there." },
    ],
    sources: [
      "Quran 2:255–257, 4:43, 5:6, 6:59, 17:79, 21:87–88, 62:9, 73:1–6, 97",
      "Ayatollah al-Sayyid Ali al-Husayni al-Sistani, Islamic Laws (sistani.org, book 48): rulings 582–599, 627–629, 633–635, 719–721, 751–754, 762, 905, 1258, 1320, 1341, 1486–1501",
      "Shaykh Abbas al-Qummi, Mafatih al-Jinan – https://en.wikishia.net/view/Mafatih_al-jinan",
      "WikiShia: Istikhara, Turba, Salat al-Layl, Salat al-Ghufayla, Salat al-Wahsha",
      "The Amman Message (2004) and the Amman declaration (2005) – https://ammanmessage.com/",
      "Content is being reviewed by scholars.",
    ],
  },
};
