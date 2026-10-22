import type { IslamDoc } from "./types";

// Chapter: the holy sites of the Shia Muslims and the ziyarah (owner, 22.10.2026: "die heiligen Shia Stätten").
// Builds on the prose in cities.ts; ziyarah texts are only named with a link, never typed. needs_review: true.
const W = "https://en.wikishia.net/view";

export const ziyarat: IslamDoc = {
  slug: "ziyarat",
  arabic: "الزيارة",
  needs_review: true,
  de: {
    title: "Die heiligen Stätten der Schia und die Ziyara",
    kicker: "Orte · Ziyara",
    lead: "Nadschaf, Kerbela, Kadhimiya, Samarra, Maschhad, Qom, al-Baqiʿ in Medina und der Schrein von Sayyida Zainab bei Damaskus: Orte, an denen die Familie des Propheten ﷺ ruht. Dieses Kapitel stellt sie vor und erklärt, wie man sie mit Würde besucht.",
    facts: [
      { n: "8", l: "große Schreinstätten in Irak, Iran, Medina und Syrien" },
      { n: "20. Safar", l: "Arbaʿin – Fußwallfahrt nach Kerbela" },
      { n: "4", l: "Imame ruhen in al-Baqiʿ" },
      { n: "1341", l: "Regel bei al-Sistani: Wahl zwischen vollem und kurzem Gebet am Schrein von Imam al-Husain" },
    ],
    body: `## Was eine Ziyara ist

Ziyara heißt Besuch: der Besuch beim Grab des Propheten ﷺ, der Imame und der Frommen, um Allah dort zu gedenken, Frieden über sie zu sprechen und Bittgebete zu sprechen. Angebetet wird allein Allah. Die Mekka- und Medina-Reise beschreibt das Kapitel [Hadsch](/islam/hajj); die Geschichte der Städte steht in [Die heiligen Städte](/islam/cities).

## Die Stätten

### Nadschaf – Imam Ali

Im Süden des Irak ruht **Imam Ali ibn Abi Talib**, der erste Imam. Nadschaf ist seit Jahrhunderten Sitz der großen Hauza; am Stadtrand liegt der Friedhof Wadi as-Salam. Nahe liegt Kufa mit seiner großen Moschee. ([Najaf](${W}/Najaf))

### Kerbela – Imam al-Husain und al-Abbas

Hier ruhen **Imam al-Husain**, getötet am 10. Muharram 61 n. H., und gegenüber sein Bruder **al-Abbas ibn Ali**. Zum Arbaʿin am 20. Safar gehen viele Pilger zu Fuß, oft von Nadschaf aus. ([Karbala](${W}/Karbala), [Arbaʿin-Fußwallfahrt](${W}/Arba%27in_Walk))

### Kadhimiya in Bagdad – Imam Musa al-Kazim und Imam Muhammad al-Dschawad

Der Doppelschrein *al-Kazimain* birgt den siebten und den neunten Imam. ([Kazimayn](${W}/Kazimayn))

### Samarra – Imam ʿAli al-Hadi und Imam al-Hasan al-ʿAskari

Im Schrein al-ʿAskari ruhen der zehnte und der elfte Imam. Hier ist auch der Ort, der mit der Verborgenheit von Imam al-Mahdi verbunden wird. ([Samarra](${W}/Samarra))

### Maschhad – Imam ar-Rida

Im Nordosten Irans ruht der achte Imam, **Ali ibn Musa ar-Rida**; die Schreinanlage gehört zu den meistbesuchten der islamischen Welt.

### Qom – Fatima al-Maʿsuma

Hier ruht **Fatima al-Maʿsuma**, die Schwester von Imam ar-Rida. Um ihren Schrein ist eine der großen Hauzas entstanden. ([Qom](${W}/Qom))

### al-Baqiʿ in Medina

Auf dem Friedhof al-Baqiʿ ruhen vier Imame: **al-Hasan al-Mudschtaba, Ali Zain al-ʿAbidin, Muhammad al-Baqir und Dschaʿfar as-Sadiq**, dazu viele Angehörige und Gefährten des Propheten ﷺ. Die Grabbauten wurden 1344 n. H. abgetragen; Pilger grüßen die Imame heute von außen und halten sich an die Regeln vor Ort. ([al-Baqiʿ](${W}/Al-Baqi%27_Cemetery))

### Sayyida Zainab bei Damaskus

Südlich von Damaskus steht der Schrein von **Sayyida Zainab**, der Tochter von Imam Ali und Fatima, die nach Kerbela für die Überlebenden sprach. Nach anderer Überlieferung liegt ihr Grab in Kairo, wo ihre Moschee ebenfalls besucht wird.

## Adab der Ziyara

Die Gelehrten haben die Umgangsformen in eigenen Büchern gesammelt, vor allem in [Kamil az-Ziyarat](${W}/Kamil_al-ziyarat) von Ibn Qulawaih und im Ziyara-Teil von [Mafatih al-Dschinan](${W}/Mafatih_al-jinan). Zu den überlieferten Empfehlungen gehören:

- vorher einen Ghusl nehmen und saubere Kleidung tragen; nach al-Sistani wird der Ghusl für den Besuch der Unfehlbaren mit der Absicht der Hoffnung (radschaʾ) verrichtet (Regel 634, [Quelle](https://www.sistani.org/english/book/48/2194/));
- ruhig und gesammelt eintreten, um Erlaubnis zum Eintritt bitten und den Frieden sprechen;
- die überlieferten Ziyara-Texte lesen, etwa [Ziyarat Amin Allah](${W}/Ziyarat_Amin_Allah), [Ziyarat ʿAschura](${W}/Ziyarat_Ashura) oder [al-Ziyara al-Dschamiʿa al-Kabira](${W}/Al-Ziyara_al-Jami%27a_al-Kabira); die Texte mit Übersetzung finden Sie bei [duas.org](https://www.duas.org/ziarat.htm);
- am Ort beten, für andere bitten und andere Pilger nicht bedrängen.

Wer nicht reisen kann, darf die Ziyara auch aus der Ferne sprechen; viele tun das an Freitagen und an den Gedenktagen im [Kalender](/calendar).

## Auf Reisen zu den Stätten

- Verkürzen ab etwa 44 km Reiseweg; wer zehn Tage bleiben will, betet vollständig (siehe [Besondere Gebete – Dschaʿfari](/islam/prayers-special-shia)).
- In **Mekka, Medina, Kufa** und am Schrein von **Imam al-Husain** darf ein Reisender nach al-Sistani wählen, ob er vollständig oder verkürzt betet (Regel 1341, [Quelle](https://www.sistani.org/english/book/48/2265/)).
- Schalten Sie in den Einstellungen den Reisemodus ein: Dann gelten die Gebetszeiten für Ihr Reiseziel.

## Respekt unter Muslimen

Sunnitische Musliminnen und Muslime besuchen viele dieser Orte ebenfalls mit Liebe zur Familie des Propheten ﷺ, und über manche Formen der Ziyara urteilen die Schulen verschieden. Dieses Kapitel beschreibt die schiitische Praxis ohne Streit und mit Respekt vor allen.`,
    faq: [
      { q: "Wer ruht in al-Baqiʿ?", a: "Vier Imame der Zwölfer-Schia – al-Hasan al-Mudschtaba, Ali Zain al-ʿAbidin, Muhammad al-Baqir und Dschaʿfar as-Sadiq – sowie viele Angehörige und Gefährten des Propheten ﷺ." },
      { q: "Muss ich am Schrein von Imam al-Husain verkürzt beten?", a: "Nach al-Sistani darf ein Reisender dort, in Mekka, Medina und Kufa wählen, ob er vollständig oder verkürzt betet (Regel 1341)." },
      { q: "Wo finde ich die Ziyara-Texte?", a: "In Mafatih al-Dschinan und Kamil az-Ziyarat; mit Übersetzung zum Beispiel auf duas.org. Wir geben die Texte nicht selbst wieder, sondern verweisen auf diese Quellen." },
    ],
    sources: [
      "Ibn Qulawaih, Kamil az-Ziyarat – https://en.wikishia.net/view/Kamil_al-ziyarat",
      "Schaich Abbas al-Qummi, Mafatih al-Dschinan – https://en.wikishia.net/view/Mafatih_al-jinan",
      "Ayatollah al-Sistani, Islamic Laws, Regeln 634 und 1341 (sistani.org)",
      "WikiShia: Najaf, Karbala, Kazimayn, Samarra, Qom, Al-Baqi' Cemetery, Arba'in Walk, Ziyarat Amin Allah, Ziyarat Ashura",
      "Twelver Shia holy days (8. Schawwal 1344, al-Baqiʿ) – https://en.wikipedia.org/wiki/Twelver_Shia_holy_days",
      "Inhalt wird von Gelehrten geprüft.",
    ],
  },
  en: {
    title: "The holy sites of the Shia and the ziyarah",
    kicker: "Places · Ziyarah",
    lead: "Najaf, Karbala, Kadhimiya, Samarra, Mashhad, Qom, al-Baqi' in Madinah and the shrine of Sayyida Zaynab near Damascus: places where the family of the Prophet ﷺ rests. This chapter introduces them and explains how to visit them with dignity.",
    facts: [
      { n: "8", l: "great shrine sites in Iraq, Iran, Madinah and Syria" },
      { n: "20 Safar", l: "Arba'een – the walk to Karbala" },
      { n: "4", l: "Imams rest in al-Baqi'" },
      { n: "1341", l: "al-Sistani's ruling: choice of full or short prayer at the shrine of Imam al-Husayn" },
    ],
    body: `## What a ziyarah is

Ziyarah means visit: visiting the grave of the Prophet ﷺ, the Imams and the righteous, to remember Allah there, send peace upon them and make supplication. Allah alone is worshipped. The journey to Makkah and Madinah is in the chapter [Hajj](/islam/hajj); the history of the cities is in [The holy cities](/islam/cities).

## The sites

### Najaf – Imam Ali

In southern Iraq rests **Imam Ali ibn Abi Talib**, the first Imam. For centuries Najaf has been the seat of the great hawzah; on the edge of the city lies the Wadi al-Salam cemetery. Nearby is Kufa with its great mosque. ([Najaf](${W}/Najaf))

### Karbala – Imam al-Husayn and al-Abbas

Here rest **Imam al-Husayn**, killed on 10 Muharram 61 AH, and opposite him his brother **al-Abbas ibn Ali**. For Arba'een on 20 Safar many pilgrims walk, often from Najaf. ([Karbala](${W}/Karbala), [Arba'een walk](${W}/Arba%27in_Walk))

### Kadhimiya in Baghdad – Imam Musa al-Kazim and Imam Muhammad al-Jawad

The double shrine *al-Kazimayn* holds the seventh and the ninth Imam. ([Kazimayn](${W}/Kazimayn))

### Samarra – Imam 'Ali al-Hadi and Imam al-Hasan al-'Askari

The al-'Askari shrine holds the tenth and eleventh Imams. It is also the place associated with the occultation of Imam al-Mahdi. ([Samarra](${W}/Samarra))

### Mashhad – Imam al-Rida

In north-eastern Iran rests the eighth Imam, **Ali ibn Musa al-Rida**; the shrine complex is among the most visited in the Islamic world.

### Qom – Fatima al-Ma'suma

Here rests **Fatima al-Ma'suma**, the sister of Imam al-Rida. Around her shrine one of the great hawzahs has grown. ([Qom](${W}/Qom))

### al-Baqi' in Madinah

In the al-Baqi' cemetery rest four Imams: **al-Hasan al-Mujtaba, Ali Zayn al-'Abidin, Muhammad al-Baqir and Ja'far al-Sadiq**, together with many relatives and companions of the Prophet ﷺ. The tomb structures were removed in 1344 AH; pilgrims today greet the Imams from outside and keep to the rules in place. ([al-Baqi'](${W}/Al-Baqi%27_Cemetery))

### Sayyida Zaynab near Damascus

South of Damascus stands the shrine of **Sayyida Zaynab**, the daughter of Imam Ali and Fatima, who spoke for the survivors after Karbala. Another tradition places her grave in Cairo, where her mosque is also visited.

## The adab of ziyarah

The scholars gathered the etiquette in books of their own, above all Ibn Qulawayh's [Kamil al-Ziyarat](${W}/Kamil_al-ziyarat) and the ziyarah part of [Mafatih al-Jinan](${W}/Mafatih_al-jinan). Among the transmitted recommendations:

- take a ghusl beforehand and wear clean clothes; according to al-Sistani the ghusl for visiting the Infallibles is done with the intention of hope (raja') (ruling 634, [source](https://www.sistani.org/english/book/48/2194/));
- enter calmly and collected, ask permission to enter and send peace;
- read the transmitted ziyarah texts, such as [Ziyarat Amin Allah](${W}/Ziyarat_Amin_Allah), [Ziyarat Ashura](${W}/Ziyarat_Ashura) or [al-Ziyara al-Jami'a al-Kabira](${W}/Al-Ziyara_al-Jami%27a_al-Kabira); the texts with translation are at [duas.org](https://www.duas.org/ziarat.htm);
- pray there, ask for others, and do not crowd other pilgrims.

Whoever cannot travel may also recite the ziyarah from afar; many do so on Fridays and on the days of remembrance in the [calendar](/calendar).

## Travelling to the sites

- Shorten from about 44 km of travel; whoever intends to stay ten days prays in full (see [Special prayers – Ja'fari](/islam/prayers-special-shia)).
- In **Makkah, Madinah, Kufa** and at the shrine of **Imam al-Husayn** a traveller may, according to al-Sistani, choose between the full and the shortened prayer (ruling 1341, [source](https://www.sistani.org/english/book/48/2265/)).
- Switch on travel mode in Settings: the prayer times then apply to your destination.

## Respect among Muslims

Sunni Muslims also visit many of these places out of love for the family of the Prophet ﷺ, and the schools judge some forms of ziyarah differently. This chapter describes the Shia practice without dispute and with respect for all.`,
    faq: [
      { q: "Who rests in al-Baqi'?", a: "Four Imams of the Twelver Shia – al-Hasan al-Mujtaba, Ali Zayn al-'Abidin, Muhammad al-Baqir and Ja'far al-Sadiq – and many relatives and companions of the Prophet ﷺ." },
      { q: "Must I shorten the prayer at the shrine of Imam al-Husayn?", a: "According to al-Sistani a traveller there, and in Makkah, Madinah and Kufa, may choose between the full and the shortened prayer (ruling 1341)." },
      { q: "Where do I find the ziyarah texts?", a: "In Mafatih al-Jinan and Kamil al-Ziyarat; with translation for example on duas.org. We do not reproduce the texts ourselves but point to these sources." },
    ],
    sources: [
      "Ibn Qulawayh, Kamil al-Ziyarat – https://en.wikishia.net/view/Kamil_al-ziyarat",
      "Shaykh Abbas al-Qummi, Mafatih al-Jinan – https://en.wikishia.net/view/Mafatih_al-jinan",
      "Ayatollah al-Sistani, Islamic Laws, rulings 634 and 1341 (sistani.org)",
      "WikiShia: Najaf, Karbala, Kazimayn, Samarra, Qom, Al-Baqi' Cemetery, Arba'in Walk, Ziyarat Amin Allah, Ziyarat Ashura",
      "Twelver Shia holy days (8 Shawwal 1344, al-Baqi') – https://en.wikipedia.org/wiki/Twelver_Shia_holy_days",
      "Content is being reviewed by scholars.",
    ],
  },
};
