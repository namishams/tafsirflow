// Who is behind Quran Masterclass – one place for the imprint, footer, About page, structured data and llms.txt.
// Company: ICSL FZE (name as in the owner's MediFlow legal pages, mediflow/src/content/legal/en.json). Seat: Sharjah,
// United Arab Emirates – confirmed by the owner on 2026-10-20 (MediFlow's pages still say Dubai).
// Not on record yet (add here once the owner confirms them, never guess): licence number, free zone, street address,
// P.O. box, phone. The translated place ("Sharjah, United Arab Emirates") is messages → company.place.
export const COMPANY = {
  /** registered company that operates the platform */
  legalName: "ICSL FZE",
  /** seat of the company (owner, 2026-10-20) */
  city: "Sharjah",
  countryCode: "AE",
  /** founder of Quran Masterclass and of the Shams Method */
  founder: "Nami Shams",
  /** where Quran Masterclass was founded and is developed (not the company seat) */
  foundedIn: "Dubai",
  founderAr: "نامي شمس",
  email: "info@quranmasterclass.com",
} as const;

export const founderName = (locale: string) => (locale === "ar" ? COMPANY.founderAr : COMPANY.founder);

// The founder (owner's own statements, 22.10.2026): founder of the Shams Method and of Quran Masterclass; focus on
// Islamic research, the Islamic countries and Islamic apps; translated Nahj al-Balagha into German; favourite reciter
// Mishary Rashid Alafasy. Texts: messages → founderAbout. The book link stays exactly this clean URL (no tracking).
export const FOUNDER_BOOK = {
  name: "Nahjul Balagha",
  url: "https://www.amazon.com/dp/B0D13DKT9T",
  author: "Imam Ali ibn Abi Talib",
} as const;
/** Mishary Rashid Alafasy on the platform: star profile (reserved username), reciter biography, the player in his voice */
export const FOUNDER_RECITER = {
  star: "/talents/mishary.alafasy",
  reciter: "/reciters/mishary-rashid-alafasy",
  listen: "/surah/1?reciter=Alafasy",
  path: "/mishary",
} as const;

/** schema.org Person for the founder */
export function founderLd(abs: (p: string) => string) {
  return {
    "@type": "Person",
    "@id": abs("/#founder"),
    name: COMPANY.founder,
    jobTitle: "Founder of Quran Masterclass and of the Shams Method",
    worksFor: { "@id": abs("/#org") },
    sameAs: [FOUNDER_BOOK.url],
  };
}
/** schema.org Book for the German translation of Nahj al-Balagha */
export function founderBookLd(abs: (p: string) => string) {
  return {
    "@type": "Book",
    name: FOUNDER_BOOK.name,
    inLanguage: "de",
    url: FOUNDER_BOOK.url,
    author: { "@type": "Person", name: FOUNDER_BOOK.author },
    translator: { "@id": abs("/#founder"), "@type": "Person", name: COMPANY.founder },
  };
}

/** schema.org Organization for Quran Masterclass (pass the site's absolute-URL helper) */
export function organizationLd(abs: (p: string) => string) {
  return {
    "@type": "Organization",
    "@id": abs("/#org"),
    name: "Quran Masterclass",
    legalName: COMPANY.legalName,
    url: abs("/"),
    logo: abs("/icon-512.png"),
    email: COMPANY.email,
    founder: { "@type": "Person", "@id": abs("/#founder"), name: COMPANY.founder },
    foundingLocation: COMPANY.foundedIn,
    address: { "@type": "PostalAddress", addressLocality: COMPANY.city, addressCountry: COMPANY.countryCode },
  };
}
