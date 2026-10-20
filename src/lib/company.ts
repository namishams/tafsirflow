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
    founder: { "@type": "Person", name: COMPANY.founder },
    foundingLocation: COMPANY.foundedIn,
    address: { "@type": "PostalAddress", addressLocality: COMPANY.city, addressCountry: COMPANY.countryCode },
  };
}
