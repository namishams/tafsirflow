// Biographies of famous Quran reciters (/reciters). German + English here, Arabic in ./ar*.ts, the other languages in
// ./i18n/<locale>.ts (see loadBioTexts in index.ts); whatever is missing falls back to English.
export type ReciterBioText = {
  short: string;        // one sentence for the overview card
  body: string;         // 300–600 words in our Markdown subset (## headings, - lists, **bold**)
  knownFor: string[];   // 2–4 short points, e.g. "Murattal recording of the whole Quran (1961)"
};
export type ReciterBio = {
  slug: string;              // url, e.g. "mahmoud-khalil-al-husary"
  name: string;              // Latin name as commonly written
  arabic: string;            // name in Arabic script
  country: string;           // English country name, e.g. "Egypt"
  born?: string;             // year only, e.g. "1917" – leave out if not certain
  died?: string;             // year only – leave out if alive or not certain
  styles: ("murattal" | "mujawwad" | "imam" | "teacher")[];
  playerSlug?: "Alafasy" | "AbdulBaset" | "Husary" | "Minshawi"; // only for these four, which can be heard in our player
  de: ReciterBioText;
  en: ReciterBioText;
};
