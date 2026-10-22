// The days of the Shia (Twelver, Ja'fari) calendar beyond the common Islamic days: births and martyrdoms of the
// Prophet ﷺ, Fatima al-Zahra and the twelve Imams, Eid al-Mab'ath, the birth of Imam al-Mahdi and a few days of
// remembrance. Used by eventsFor() in ../hijri.ts for Shia mode and "show both" (owner, 22.10.2026: "auch den Kalender
// alles auf Shia anpassen").
// Dates: the forms most widely observed today (as in Shaykh Abbas al-Qummi's Mafatih al-Jinan and the Iranian and Iraqi
// calendars); classical references are al-Mufid's Masar al-Shi'a and al-Tusi's Misbah al-Mutahajjid. Where the sources
// differ, the text says so. All dates depend on moon sighting (±1 day).
// needs_review: true – "Inhalt wird von Gelehrten geprüft" (see SHIA_DAYS_REVIEW).
// German and English here; the other languages fall back to English (calText in ../hijri.ts), like the chapters.

export const SHIA_DAYS_REVIEW = { needs_review: true, reviewedBy: null as string | null, version: 1 };

export type ShiaDay = { id: string; m: number; d: number; mourning?: boolean; src: (keyof typeof SHIA_DAY_SOURCES)[] };
type Ev = { name: string; desc: string; note?: string };

export const SHIA_DAY_SOURCES = {
  mufid: "al-Shaykh al-Mufid, Masar al-Shi'a (classical calendar of the Shia days)",
  tusi: "al-Shaykh al-Tusi, Misbah al-Mutahajjid",
  qummi: "Shaykh Abbas al-Qummi, Mafatih al-Jinan (acts of the months)",
  ibnTawus: "Sayyid Ibn Tawus, Iqbal al-A'mal",
  wiki: "Twelver Shia holy days – https://en.wikipedia.org/wiki/Twelver_Shia_holy_days",
  mubahala: "WikiShia, Event of Mubahala – https://en.wikishia.net/view/Event_of_Mubahala",
  sistani634: "Ayatollah al-Sistani, Islamic Laws, rulings 633–634 (recommended ghusls of these days) – https://www.sistani.org/english/book/48/2194/",
} as const;

// the common days that Shia mode replaces with its own form on the same date: Isra and Mi'raj (27 Rajab) → Eid al-Mab'ath;
// mid-Sha'ban → birth of Imam al-Mahdi
export const SHIA_REPLACES = ["isra", "shaban"] as const;

export const SHIA_DAYS: ShiaDay[] = [
  // Muharram
  { id: "tasua", m: 1, d: 9, mourning: true, src: ["qummi", "wiki"] },
  { id: "sajjadDeath", m: 1, d: 25, mourning: true, src: ["tusi", "wiki"] },
  // Safar
  { id: "kazimBirth", m: 2, d: 7, src: ["qummi"] },
  { id: "prophetDeath", m: 2, d: 28, mourning: true, src: ["mufid", "wiki"] },
  { id: "ridaDeath", m: 2, d: 30, mourning: true, src: ["qummi", "wiki"] },
  // Rabi' al-Awwal
  { id: "askariDeath", m: 3, d: 8, mourning: true, src: ["mufid", "wiki"] },
  { id: "sadiqBirth", m: 3, d: 17, src: ["mufid", "wiki", "sistani634"] },
  // Rabi' al-Thani
  { id: "askariBirth", m: 4, d: 8, src: ["wiki"] },
  { id: "masumaDeath", m: 4, d: 10, mourning: true, src: ["qummi", "wiki"] },
  // Jumada al-Ula
  { id: "zaynabBirth", m: 5, d: 5, src: ["wiki"] },
  // Jumada al-Akhira
  { id: "fatimaBirth", m: 6, d: 20, src: ["ibnTawus", "wiki"] },
  // Rajab
  { id: "baqirBirth", m: 7, d: 1, src: ["mufid", "tusi"] },
  { id: "hadiDeath", m: 7, d: 3, mourning: true, src: ["wiki"] },
  { id: "jawadBirth", m: 7, d: 10, src: ["tusi", "wiki"] },
  { id: "kazimDeath", m: 7, d: 25, mourning: true, src: ["mufid", "wiki"] },
  { id: "mabath", m: 7, d: 27, src: ["mufid", "qummi", "wiki"] },
  // Sha'ban
  { id: "husaynBirth", m: 8, d: 3, src: ["tusi", "wiki"] },
  { id: "abbasBirth", m: 8, d: 4, src: ["wiki"] },
  { id: "sajjadBirth", m: 8, d: 5, src: ["wiki"] },
  { id: "mahdiBirth", m: 8, d: 15, src: ["mufid", "tusi", "wiki", "sistani634"] },
  // Ramadan
  { id: "khadijaDeath", m: 9, d: 10, mourning: true, src: ["wiki"] },
  { id: "hasanBirth", m: 9, d: 15, src: ["mufid", "wiki"] },
  { id: "aliDeath", m: 9, d: 21, mourning: true, src: ["mufid", "wiki"] },
  // Shawwal
  { id: "baqi", m: 10, d: 8, mourning: true, src: ["wiki"] },
  { id: "sadiqDeath", m: 10, d: 25, mourning: true, src: ["wiki"] },
  // Dhu al-Qa'da
  { id: "masumaBirth", m: 11, d: 1, src: ["wiki"] },
  { id: "ridaBirth", m: 11, d: 11, src: ["wiki"] },
  { id: "jawadDeath", m: 11, d: 30, mourning: true, src: ["wiki"] },
  // Dhu al-Hijja
  { id: "baqirDeath", m: 12, d: 7, mourning: true, src: ["wiki"] },
  { id: "hadiBirth", m: 12, d: 15, src: ["wiki"] },
];

/** sources of the Shia days that were already in the calendar (texts in ../hijri.ts in every language) */
export const SHIA_KNOWN_SOURCES: Record<string, (keyof typeof SHIA_DAY_SOURCES)[]> = {
  ashuraShia: ["mufid", "wiki"],
  mawlidShia: ["mufid", "wiki", "sistani634"],
  qadr19: ["qummi", "sistani634"],
  qadr21: ["qummi", "sistani634"],
  qadr23: ["qummi", "sistani634"],
  ghadir: ["mufid", "qummi"],
  arbaeen: ["tusi", "wiki"],
  mubahala: ["mubahala", "sistani634"],
  aliBirth: ["mufid", "wiki"],
  fatimiyya: ["wiki"],
};
/** days of mourning (also the ones already in the calendar): shown in a quiet tone, never as a celebration */
export const SHIA_MOURNING = new Set<string>(["ashuraShia", "arbaeen", "fatimiyya", ...SHIA_DAYS.filter((d) => d.mourning).map((d) => d.id)]);

export const SHIA_DAY_TEXT: { de: Record<string, Ev>; en: Record<string, Ev> } = {
  de: {
    tasua: { name: "Tasuʿa (9. Muharram)", desc: "Der Tag vor ʿAschura. Er erinnert an al-Abbas ibn Ali und an die letzte Nacht von Imam al-Husain und seinen Gefährten in Kerbela." },
    sajjadDeath: { name: "Märtyrertod von Imam Zain al-ʿAbidin", desc: "Gedenken an Imam Ali ibn al-Husain as-Saddschad, den vierten Imam, der Kerbela überlebte und die Gebete der as-Sahifa as-Saddschadiyya hinterließ.", note: "Als Datum wird meist der 25. Muharram genannt (Jahr 94 oder 95 n. H.); einige nennen den 12. Muharram." },
    kazimBirth: { name: "Geburt von Imam Musa al-Kazim", desc: "Geburt des siebten Imams in al-Abwa zwischen Mekka und Medina.", note: "Über das Datum gibt es verschiedene Angaben; der 7. Safar ist eine verbreitete." },
    prophetDeath: { name: "Todestag des Propheten ﷺ und Gedenken an Imam al-Hasan", desc: "Nach schiitischer Überlieferung starb der Prophet ﷺ am 28. Safar 11 n. H. Am selben Tag gedenken viele des Todes seines Enkels Imam al-Hasan, des zweiten Imams.", note: "Sunnitische Quellen nennen meist den 12. Rabiʿ al-Awwal als Todestag des Propheten ﷺ. Für Imam al-Hasan wird auch der 7. Safar genannt." },
    ridaDeath: { name: "Märtyrertod von Imam ar-Rida", desc: "Gedenken an Imam Ali ibn Musa ar-Rida, den achten Imam, der in Tus starb und in Maschhad begraben ist.", note: "Häufig genannt wird der letzte Tag des Safar (203 n. H.); es werden auch andere Daten überliefert. In Monaten mit 29 Tagen fällt er auf den 29." },
    askariDeath: { name: "Märtyrertod von Imam al-Hasan al-ʿAskari", desc: "Gedenken an den elften Imam, der 260 n. H. in Samarra starb. Mit seinem Tod beginnt das Imamat von Imam al-Mahdi." },
    sadiqBirth: { name: "Geburt von Imam Dschaʿfar as-Sadiq", desc: "Am selben Tag wie die Geburt des Propheten ﷺ nach schiitischer Überlieferung wurde Imam Dschaʿfar as-Sadiq geboren, nach dem die Dschaʿfari-Rechtsschule benannt ist." },
    askariBirth: { name: "Geburt von Imam al-Hasan al-ʿAskari", desc: "Geburt des elften Imams in Medina (232 n. H.).", note: "Auch der 10. Rabiʿ ath-Thani wird genannt." },
    masumaDeath: { name: "Todestag von Fatima al-Maʿsuma", desc: "Gedenken an die Tochter von Imam Musa al-Kazim und Schwester von Imam ar-Rida, deren Schrein in Qom steht (201 n. H.)." },
    zaynabBirth: { name: "Geburt von Sayyida Zainab", desc: "Geburt der Tochter von Imam Ali und Fatima az-Zahra, die in Kerbela dabei war und danach in Kufa und Damaskus sprach." },
    fatimaBirth: { name: "Geburt von Fatima az-Zahra", desc: "Geburt der Tochter des Propheten ﷺ. In vielen schiitischen Ländern ist der Tag zugleich ein Tag der Mütter und Frauen.", note: "Über das Jahr gibt es verschiedene Angaben." },
    baqirBirth: { name: "Geburt von Imam Muhammad al-Baqir", desc: "Geburt des fünften Imams in Medina (57 n. H.), der als Kind in Kerbela dabei war.", note: "Auch der 3. Safar wird genannt." },
    hadiDeath: { name: "Märtyrertod von Imam ʿAli al-Hadi", desc: "Gedenken an den zehnten Imam, der 254 n. H. in Samarra starb." },
    jawadBirth: { name: "Geburt von Imam Muhammad al-Dschawad", desc: "Geburt des neunten Imams in Medina (195 n. H.), der schon als Kind Imam wurde." },
    kazimDeath: { name: "Märtyrertod von Imam Musa al-Kazim", desc: "Gedenken an den siebten Imam, der nach langer Haft 183 n. H. in Bagdad starb. Sein Schrein steht in Kadhimiya." },
    mabath: { name: "Eid al-Mabʿath", desc: "27. Radschab – nach schiitischer Überlieferung der Tag, an dem Muhammad ﷺ zum Propheten berufen wurde und die erste Offenbarung empfing.", note: "Viele Sunniten begehen an diesem Datum die Nachtreise (Isra und Miʿradsch); über beide Daten gibt es verschiedene Angaben." },
    husaynBirth: { name: "Geburt von Imam al-Husain", desc: "Geburt des dritten Imams, des Enkels des Propheten ﷺ, in Medina (4 n. H.)." },
    abbasBirth: { name: "Geburt von al-Abbas ibn Ali", desc: "Geburt des Bruders von Imam al-Husain, der in Kerbela die Fahne trug." },
    sajjadBirth: { name: "Geburt von Imam Zain al-ʿAbidin", desc: "Geburt des vierten Imams in Medina (38 n. H.).", note: "Auch der 15. Dschumada al-Ula wird genannt." },
    mahdiBirth: { name: "Mitte Schaʿban – Geburt von Imam al-Mahdi", desc: "Nach schiitischem Glauben wurde am 15. Schaʿban 255 n. H. Imam Muhammad al-Mahdi geboren, der zwölfte Imam. Die Nacht wird mit Gebet und Gedenken verbracht.", note: "Die Mitte des Schaʿban wird auch von vielen Sunniten als besondere Nacht geehrt, mit anderem Inhalt." },
    khadijaDeath: { name: "Todestag von Chadidscha", desc: "Gedenken an Chadidscha bint Chuwailid, die erste Frau des Propheten ﷺ und die erste, die an ihn glaubte." },
    hasanBirth: { name: "Geburt von Imam al-Hasan", desc: "Geburt des zweiten Imams, des älteren Enkels des Propheten ﷺ, in Medina (3 n. H.)." },
    aliDeath: { name: "Märtyrertod von Imam Ali", desc: "Imam Ali wurde am 19. Ramadan 40 n. H. beim Morgengebet in der Moschee von Kufa verwundet und starb am 21. Ramadan. Die Nächte der Verwundung und des Todes sind zugleich Nächte von Laylat al-Qadr." },
    baqi: { name: "Gedenken an al-Baqiʿ", desc: "Am 8. Schawwal 1344 n. H. (1926) wurden die Grabbauten auf dem Friedhof al-Baqiʿ in Medina abgetragen, wo vier der Imame begraben sind. Viele Schiiten gedenken an diesem Tag still." },
    sadiqDeath: { name: "Märtyrertod von Imam Dschaʿfar as-Sadiq", desc: "Gedenken an den sechsten Imam, Lehrer vieler Gelehrter, der 148 n. H. in Medina starb und in al-Baqiʿ begraben ist." },
    masumaBirth: { name: "Geburt von Fatima al-Maʿsuma", desc: "Geburt der Schwester von Imam ar-Rida (173 n. H.). In Iran ist der Tag auch ein Tag der Töchter." },
    ridaBirth: { name: "Geburt von Imam ar-Rida", desc: "Geburt des achten Imams in Medina (148 n. H.)." },
    jawadDeath: { name: "Märtyrertod von Imam al-Dschawad", desc: "Gedenken an den neunten Imam, der mit 25 Jahren 220 n. H. in Bagdad starb. In Monaten mit 29 Tagen fällt der Tag auf den 29." },
    baqirDeath: { name: "Märtyrertod von Imam al-Baqir", desc: "Gedenken an den fünften Imam, der 114 n. H. in Medina starb und in al-Baqiʿ begraben ist." },
    hadiBirth: { name: "Geburt von Imam ʿAli al-Hadi", desc: "Geburt des zehnten Imams (212 n. H.).", note: "Auch der 2. oder 5. Radschab wird genannt." },
  },
  en: {
    tasua: { name: "Tasu'a (9 Muharram)", desc: "The day before Ashura. It remembers al-Abbas ibn Ali and the last night of Imam al-Husayn and his companions at Karbala." },
    sajjadDeath: { name: "Martyrdom of Imam Zayn al-'Abidin", desc: "Remembrance of Imam Ali ibn al-Husayn al-Sajjad, the fourth Imam, who survived Karbala and left the prayers of al-Sahifa al-Sajjadiyya.", note: "The 25th of Muharram (94 or 95 AH) is most often given; some give the 12th." },
    kazimBirth: { name: "Birth of Imam Musa al-Kazim", desc: "Birth of the seventh Imam at al-Abwa between Makkah and Madinah.", note: "Sources give different dates; 7 Safar is a common one." },
    prophetDeath: { name: "Passing of the Prophet ﷺ and remembrance of Imam al-Hasan", desc: "In the Shia tradition the Prophet ﷺ passed away on 28 Safar 11 AH. On the same day many remember the passing of his grandson Imam al-Hasan, the second Imam.", note: "Sunni sources usually give 12 Rabi' al-Awwal for the Prophet's ﷺ passing. For Imam al-Hasan, 7 Safar is also given." },
    ridaDeath: { name: "Martyrdom of Imam al-Rida", desc: "Remembrance of Imam Ali ibn Musa al-Rida, the eighth Imam, who died at Tus and is buried in Mashhad.", note: "The last day of Safar (203 AH) is most often given; other dates are also reported. In a month of 29 days it falls on the 29th." },
    askariDeath: { name: "Martyrdom of Imam al-Hasan al-'Askari", desc: "Remembrance of the eleventh Imam, who died in Samarra in 260 AH. With his passing the Imamate of Imam al-Mahdi begins." },
    sadiqBirth: { name: "Birth of Imam Ja'far al-Sadiq", desc: "On the same day as the Prophet's ﷺ birth in the Shia tradition, Imam Ja'far al-Sadiq was born, after whom the Ja'fari school of law is named." },
    askariBirth: { name: "Birth of Imam al-Hasan al-'Askari", desc: "Birth of the eleventh Imam in Madinah (232 AH).", note: "10 Rabi' al-Thani is also given." },
    masumaDeath: { name: "Passing of Fatima al-Ma'suma", desc: "Remembrance of the daughter of Imam Musa al-Kazim and sister of Imam al-Rida, whose shrine stands in Qom (201 AH)." },
    zaynabBirth: { name: "Birth of Sayyida Zaynab", desc: "Birth of the daughter of Imam Ali and Fatima al-Zahra, who was present at Karbala and afterwards spoke in Kufa and Damascus." },
    fatimaBirth: { name: "Birth of Fatima al-Zahra", desc: "Birth of the daughter of the Prophet ﷺ. In many Shia countries the day is also a day of mothers and women.", note: "Sources differ on the year." },
    baqirBirth: { name: "Birth of Imam Muhammad al-Baqir", desc: "Birth of the fifth Imam in Madinah (57 AH), who was present at Karbala as a child.", note: "3 Safar is also given." },
    hadiDeath: { name: "Martyrdom of Imam 'Ali al-Hadi", desc: "Remembrance of the tenth Imam, who died in Samarra in 254 AH." },
    jawadBirth: { name: "Birth of Imam Muhammad al-Jawad", desc: "Birth of the ninth Imam in Madinah (195 AH), who became Imam as a child." },
    kazimDeath: { name: "Martyrdom of Imam Musa al-Kazim", desc: "Remembrance of the seventh Imam, who died in Baghdad in 183 AH after long imprisonment. His shrine stands in Kadhimiya." },
    mabath: { name: "Eid al-Mab'ath", desc: "27 Rajab – in the Shia tradition the day on which Muhammad ﷺ was called to prophethood and received the first revelation.", note: "Many Sunni Muslims mark the Night Journey (Isra and Mi'raj) on this date; both dates are reported differently." },
    husaynBirth: { name: "Birth of Imam al-Husayn", desc: "Birth of the third Imam, the grandson of the Prophet ﷺ, in Madinah (4 AH)." },
    abbasBirth: { name: "Birth of al-Abbas ibn Ali", desc: "Birth of the brother of Imam al-Husayn, who carried the banner at Karbala." },
    sajjadBirth: { name: "Birth of Imam Zayn al-'Abidin", desc: "Birth of the fourth Imam in Madinah (38 AH).", note: "15 Jumada al-Ula is also given." },
    mahdiBirth: { name: "Mid-Sha'ban – birth of Imam al-Mahdi", desc: "In Shia belief Imam Muhammad al-Mahdi, the twelfth Imam, was born on 15 Sha'ban 255 AH. The night is spent in prayer and remembrance.", note: "Many Sunni Muslims also honour the middle of Sha'ban as a special night, with a different meaning." },
    khadijaDeath: { name: "Passing of Khadija", desc: "Remembrance of Khadija bint Khuwaylid, the first wife of the Prophet ﷺ and the first to believe in him." },
    hasanBirth: { name: "Birth of Imam al-Hasan", desc: "Birth of the second Imam, the elder grandson of the Prophet ﷺ, in Madinah (3 AH)." },
    aliDeath: { name: "Martyrdom of Imam Ali", desc: "Imam Ali was struck during the dawn prayer in the mosque of Kufa on 19 Ramadan 40 AH and died on 21 Ramadan. The nights of the wounding and the passing are also nights of Laylat al-Qadr." },
    baqi: { name: "Remembrance of al-Baqi'", desc: "On 8 Shawwal 1344 AH (1926) the tomb structures of the al-Baqi' cemetery in Madinah, where four of the Imams are buried, were removed. Many Shia Muslims remember this day quietly." },
    sadiqDeath: { name: "Martyrdom of Imam Ja'far al-Sadiq", desc: "Remembrance of the sixth Imam, teacher of many scholars, who died in Madinah in 148 AH and is buried in al-Baqi'." },
    masumaBirth: { name: "Birth of Fatima al-Ma'suma", desc: "Birth of the sister of Imam al-Rida (173 AH). In Iran it is also a day of daughters." },
    ridaBirth: { name: "Birth of Imam al-Rida", desc: "Birth of the eighth Imam in Madinah (148 AH)." },
    jawadDeath: { name: "Martyrdom of Imam al-Jawad", desc: "Remembrance of the ninth Imam, who died in Baghdad in 220 AH at the age of 25. In a month of 29 days it falls on the 29th." },
    baqirDeath: { name: "Martyrdom of Imam al-Baqir", desc: "Remembrance of the fifth Imam, who died in Madinah in 114 AH and is buried in al-Baqi'." },
    hadiBirth: { name: "Birth of Imam 'Ali al-Hadi", desc: "Birth of the tenth Imam (212 AH).", note: "2 or 5 Rajab is also given." },
  },
};

/** the sources of one day (empty for days that are not Shia-specific) */
export const shiaDaySources = (id: string): string[] =>
  (SHIA_DAYS.find((d) => d.id === id)?.src ?? SHIA_KNOWN_SOURCES[id] ?? []).map((k) => SHIA_DAY_SOURCES[k]);
