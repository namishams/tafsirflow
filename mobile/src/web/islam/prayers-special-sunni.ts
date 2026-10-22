import type { IslamDoc } from "./types";

// Chapter: special prayers in the four Sunni schools – German + English (owner, 22.10.2026; the counterpart of
// prayers-special-shia.ts, so both traditions have the complete set). Hadith are named by collection and book only, duas
// are rendered from our own data (/duas). needs_review: true ("Inhalt wird von Gelehrten geprüft").
export const prayersSpecialSunni: IslamDoc = {
  slug: "prayers-special-sunni",
  arabic: "صلوات خاصة",
  needs_review: true,
  de: {
    title: "Besondere Gebete – sunnitisch",
    kicker: "Gebet · Sunnitisch",
    lead: "Freitagsgebet, Festgebete, das Totengebet, das Gebet bei Sonnen- und Mondfinsternis, Istichara, Gebet um Regen, Tahaddschud, Witr und Tarawih, Gebet auf Reisen und Tayammum – wie die vier sunnitischen Rechtsschulen sie lehren, mit ihren Unterschieden.",
    facts: [
      { n: "4", l: "Takbire im Totengebet (Dschanaza)" },
      { n: "2 × 2", l: "Verbeugungen je Raka beim Finsternisgebet (Mehrheit)" },
      { n: "20 / 8", l: "Rakat Tarawih – beide Formen sind verbreitet" },
      { n: "4", l: "Rechtsschulen: Hanafi, Maliki, Schafiʿi, Hanbali" },
    ],
    body: `## Das Freitagsgebet (Dschumuʿa)

Für Männer, die ansässig und gesund sind, ist das Freitagsgebet Pflicht ([62:9](/surah/62?v=9)). Es ersetzt Dhuhr und besteht aus **zwei Predigten** und danach **zwei Rakat** in Gemeinschaft. Frauen, Reisende und Kranke dürfen teilnehmen; sonst beten sie Dhuhr. Die Grundlagen des Gebets stehen im Kapitel [Wie man betet – im sunnitischen Islam](/islam/prayer-sunni).

## Die Festgebete

Die beiden Festgebete haben **zwei Rakat** mit zusätzlichen Takbiren, gefolgt von einer Predigt; ihre Zeit beginnt kurz nach Sonnenaufgang. Nach den Hanafiten sind sie Pflicht (wadschib) mit je drei zusätzlichen Takbiren pro Raka, nach den anderen Schulen eine bekräftigte Sunna mit mehr Takbiren; die genaue Zahl unterscheidet sich zwischen den Schulen.

## Beim Tod: das Totengebet (Dschanaza) mit vier Takbiren

Waschung, Leichentuch, Totengebet und Bestattung sind eine Gemeinschaftspflicht (fard kifaya). Das Totengebet wird im Stehen gebetet, ohne Verbeugung und Niederwerfung, mit **vier Takbiren**:

1. Nach dem ersten: die Fatiha (Schafiʿiten, Hanbaliten) bzw. das Lob Allahs (Hanafiten).
2. Nach dem zweiten: das Segensgebet für den Propheten ﷺ wie im Taschahhud.
3. Nach dem dritten: das Bittgebet für den Verstorbenen. Eines der überlieferten Bittgebete (Sahih Muslim 963) finden Sie in unseren [Duas](/duas?cat=prayer).
4. Nach dem vierten: ein kurzes Bittgebet, dann der Friedensgruß.

## Gebet bei Sonnen- und Mondfinsternis (Kusuf und Chusuf)

Bei einer Finsternis ist ein Gebet von zwei Rakat eine bekräftigte Sunna. Nach der Mehrheit (Malikiten, Schafiʿiten, Hanbaliten) hat jede Raka **zwei Lesungen und zwei Verbeugungen**, wie es Sahih al-Bukhari und Sahih Muslim im Buch über die Finsternis überliefern; nach den Hanafiten betet man zwei gewöhnliche Rakat. Dazu kommen Bittgebete, Gedenken und Almosen.

## Istichara

Wer vor einer erlaubten Entscheidung steht, betet zwei freiwillige Rakat und spricht danach das Bittgebet der Istichara, das Dschabir vom Propheten ﷺ überliefert (Sahih al-Bukhari 1162). Sie finden es mit Umschrift und Bedeutung in unseren [Duas](/duas?cat=prayer).

## Gebet um Regen (Istisqaʾ)

Bei Dürre geht die Gemeinde hinaus, betet zwei Rakat und bittet um Regen, mit Predigt, Reue und Almosen (Sahih al-Bukhari, Buch über das Gebet um Regen). Nach Abu Hanifa ist das Bittgebet der Kern; die Rakat sind erlaubt.

## Nachtgebet, Witr und Tarawih

**Tahaddschud** ist das freiwillige Nachtgebet nach dem Schlaf ([17:79](/surah/17?v=79), [73:1–6](/surah/73)), in Paaren von zwei Rakat. **Witr** schließt das Nachtgebet mit einer ungeraden Zahl ab; die Hanafiten halten es für wadschib, die anderen Schulen für eine bekräftigte Sunna. **Tarawih** wird im Ramadan nach Isha in Gemeinschaft gebetet; das gemeinsame Gebet hinter einem Imam geht auf die Zeit von Umar ibn al-Chattab zurück (Sahih al-Bukhari, Buch über das Nachtgebet im Ramadan). Die Mehrheit der Schulen betet zwanzig Rakat, verbreitet sind auch acht.

## Auf Reisen: Verkürzen und Zusammenlegen

Alle vier Schulen verkürzen auf Reisen die Vier-Rakat-Gebete auf zwei (Qasr, [4:101](/surah/4?v=101)); die Mindeststrecke liegt nach der Mehrheit bei rund 80 km, Einzelheiten und die Aufenthaltsdauer unterscheiden sich. Die Schafiʿiten, Malikiten und Hanbaliten erlauben außerdem, Dhuhr mit Asr und Maghrib mit Isha zusammenzulegen (Dschamʿ); die Hanafiten nur in Arafa und Muzdalifa während des Hadsch.

## Reinheit: Ghusl und Tayammum

Ghusl ist Pflicht nach Dschanaba, Menstruation und Wochenbett; empfohlen ist er unter anderem am Freitag und an den Festtagen. **Tayammum** ([4:43](/surah/4?v=43), [5:6](/surah/5?v=6)): Nach den Hanbaliten genügt ein Schlag auf reine Erde für Gesicht und Hände, gestützt auf die Überlieferung von Ammar ibn Yasir (Sahih al-Bukhari, Buch über den Tayammum); nach den Hanafiten und Schafiʿiten zwei Schläge, einer für das Gesicht und einer für die Arme bis zu den Ellenbogen.

## Andere Rechtsschulen

Wie die Dschaʿfari-Schule diese Gebete verrichtet, mit fünf Takbiren im Totengebet, dem Gebet der Zeichen und dem Gebet der ersten Nacht im Grab, steht im Kapitel [Besondere Gebete – Dschaʿfari](/islam/prayers-special-shia). Für Ihren Alltag fragen Sie einen Gelehrten Ihrer Schule.`,
    faq: [
      { q: "Wie viele Takbire hat das sunnitische Totengebet?", a: "Vier: nach dem ersten die Fatiha oder das Lob Allahs, nach dem zweiten das Segensgebet für den Propheten ﷺ, nach dem dritten das Bittgebet für den Verstorbenen, nach dem vierten der Friedensgruß." },
      { q: "Ist Witr Pflicht?", a: "Nach den Hanafiten ist Witr wadschib, nach den Malikiten, Schafiʿiten und Hanbaliten eine bekräftigte Sunna." },
      { q: "Zwanzig oder acht Rakat Tarawih?", a: "Die Mehrheit der Schulen betet zwanzig; acht sind ebenfalls verbreitet. Beides wird in Moscheen respektvoll nebeneinander gelebt." },
      { q: "Darf ich auf Reisen Gebete zusammenlegen?", a: "Nach den Schafiʿiten, Malikiten und Hanbaliten ja (Dhuhr mit Asr, Maghrib mit Isha). Nach den Hanafiten nur in Arafa und Muzdalifa während des Hadsch." },
    ],
    sources: [
      "Quran 4:43, 4:101, 5:6, 17:79, 62:9, 73:1–6",
      "Sahih al-Bukhari: Bücher über die Finsternis, das Gebet um Regen, das Nachtgebet im Ramadan, den Tayammum; Hadith 1162 (Istichara)",
      "Sahih Muslim: Buch über die Finsternis; Hadith 963 (Bittgebet im Totengebet)",
      "Die Handbücher der vier Schulen (z. B. Maraqi al-Falah, al-Mukhtasar al-Khalil, Minhaj at-Talibin, Zad al-Mustaqni')",
      "Inhalt wird von Gelehrten geprüft.",
    ],
  },
  en: {
    title: "Special prayers – Sunni",
    kicker: "Prayer · Sunni",
    lead: "The Friday prayer, the Eid prayers, the funeral prayer, the eclipse prayer, istikhara, the prayer for rain, tahajjud, witr and tarawih, praying while travelling and tayammum – as the four Sunni schools teach them, with their differences.",
    facts: [
      { n: "4", l: "takbirs in the funeral prayer (janazah)" },
      { n: "2 × 2", l: "bows per rak'ah in the eclipse prayer (majority)" },
      { n: "20 / 8", l: "rak'at of tarawih – both are common" },
      { n: "4", l: "schools: Hanafi, Maliki, Shafi'i, Hanbali" },
    ],
    body: `## The Friday prayer (jumu'ah)

For men who are resident and healthy the Friday prayer is obligatory ([62:9](/surah/62?v=9)). It replaces dhuhr and consists of **two sermons** followed by **two rak'at** in congregation. Women, travellers and the sick may attend; otherwise they pray dhuhr. The basics of the prayer are in the chapter [How to pray – in Sunni Islam](/islam/prayer-sunni).

## The Eid prayers

The two Eid prayers have **two rak'at** with additional takbirs, followed by a sermon; their time begins shortly after sunrise. For the Hanafis they are obligatory (wajib) with three additional takbirs in each rak'ah; for the other schools a confirmed sunnah with more takbirs, the exact number differing between the schools.

## At a death: the funeral prayer (janazah) with four takbirs

Washing, shroud, funeral prayer and burial are a communal obligation (fard kifayah). The funeral prayer is prayed standing, without bowing or prostration, with **four takbirs**:

1. After the first: al-Fatiha (Shafi'is, Hanbalis) or the praise of Allah (Hanafis).
2. After the second: blessings on the Prophet ﷺ as in the tashahhud.
3. After the third: the supplication for the deceased. One of the transmitted supplications (Sahih Muslim 963) is in our [duas](/duas?cat=prayer).
4. After the fourth: a short supplication, then the salam.

## The eclipse prayer (kusuf and khusuf)

At an eclipse a prayer of two rak'at is a confirmed sunnah. According to the majority (Malikis, Shafi'is, Hanbalis) every rak'ah has **two recitations and two bows**, as Sahih al-Bukhari and Sahih Muslim transmit in their books on the eclipse; for the Hanafis one prays two ordinary rak'at. Supplication, remembrance and charity accompany it.

## Istikhara

Whoever faces a permissible decision prays two voluntary rak'at and then says the istikhara supplication that Jabir transmitted from the Prophet ﷺ (Sahih al-Bukhari 1162). You find it with transliteration and meaning in our [duas](/duas?cat=prayer).

## Prayer for rain (istisqa')

In drought the community goes out, prays two rak'at and asks for rain, with a sermon, repentance and charity (Sahih al-Bukhari, book on asking for rain). For Abu Hanifa the supplication is the core; the rak'at are permitted.

## Night prayer, witr and tarawih

**Tahajjud** is the voluntary night prayer after sleep ([17:79](/surah/17?v=79), [73:1–6](/surah/73)), in pairs of two rak'at. **Witr** closes the night prayer with an odd number; the Hanafis hold it wajib, the other schools a confirmed sunnah. **Tarawih** is prayed in congregation after isha in Ramadan; praying together behind one imam goes back to the time of Umar ibn al-Khattab (Sahih al-Bukhari, book on the night prayer in Ramadan). Most schools pray twenty rak'at; eight are also common.

## Travelling: shortening and combining

All four schools shorten the four-rak'ah prayers to two when travelling (qasr, [4:101](/surah/4?v=101)); according to the majority the minimum distance is around 80 km, and the details and length of stay differ. The Shafi'is, Malikis and Hanbalis also allow combining dhuhr with asr and maghrib with isha (jam'); the Hanafis only at Arafah and Muzdalifah during Hajj.

## Purity: ghusl and tayammum

Ghusl is obligatory after janabah, menstruation and childbirth bleeding; it is recommended among others on Fridays and the days of Eid. **Tayammum** ([4:43](/surah/4?v=43), [5:6](/surah/5?v=6)): for the Hanbalis one strike on pure earth suffices for face and hands, based on the report of Ammar ibn Yasir (Sahih al-Bukhari, book on tayammum); for the Hanafis and Shafi'is two strikes, one for the face and one for the arms up to the elbows.

## Other schools of law

How the Ja'fari school performs these prayers, with five takbirs in the funeral prayer, the prayer of signs and the prayer of the first night in the grave, is in the chapter [Special prayers – Ja'fari](/islam/prayers-special-shia). For your daily life, ask a scholar of your school.`,
    faq: [
      { q: "How many takbirs does the Sunni funeral prayer have?", a: "Four: after the first al-Fatiha or the praise of Allah, after the second blessings on the Prophet ﷺ, after the third the supplication for the deceased, after the fourth the salam." },
      { q: "Is witr obligatory?", a: "For the Hanafis witr is wajib; for the Malikis, Shafi'is and Hanbalis a confirmed sunnah." },
      { q: "Twenty or eight rak'at of tarawih?", a: "Most schools pray twenty; eight are also common. Both are lived side by side in mosques with respect." },
      { q: "May I combine prayers when travelling?", a: "For the Shafi'is, Malikis and Hanbalis yes (dhuhr with asr, maghrib with isha). For the Hanafis only at Arafah and Muzdalifah during Hajj." },
    ],
    sources: [
      "Quran 4:43, 4:101, 5:6, 17:79, 62:9, 73:1–6",
      "Sahih al-Bukhari: books on the eclipse, asking for rain, the night prayer in Ramadan, tayammum; hadith 1162 (istikhara)",
      "Sahih Muslim: book on the eclipse; hadith 963 (supplication in the funeral prayer)",
      "The manuals of the four schools (e.g. Maraqi al-Falah, Mukhtasar Khalil, Minhaj al-Talibin, Zad al-Mustaqni')",
      "Content is being reviewed by scholars.",
    ],
  },
};
