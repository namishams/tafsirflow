// Topic matches for the website search (/search): before the verse hits, a query that names a topic of a guide (for
// example "halal", "Zinsen", "gelatine") shows that guide first. Local only, nothing is sent anywhere.
export type TopicHit = { href: string; ar: string; title: { de: string; en: string }; lead: { de: string; en: string } };

const TOPICS: (TopicHit & { words: string[] })[] = [
  {
    href: "/islam/halal-haram", ar: "الحلال والحرام",
    title: { de: "Halal und Haram – ein Wegweiser für den Alltag", en: "Halal and Haram – a guide for everyday life" },
    lead: { de: "Essen, Geld, Kleidung, Medien, Miteinander und Arbeit – mit Belegen und den fünf Rechtsschulen.", en: "Food, money, clothing, media, relations and work – with evidence and the five schools of law." },
    words: ["halal", "haram", "helal", "erlaubt", "verboten", "permitted", "forbidden", "makruh", "zins", "riba", "interest", "kredit", "credit", "darlehen", "loan", "versicherung", "insurance", "takaful", "krypto", "crypto", "bitcoin", "lotto", "lotterie", "lottery", "glücksspiel", "gambling", "wette", "schwein", "pork", "alkohol", "alcohol", "gelatine", "gelatin", "zabiha", "dhabiha", "schächt", "schlacht", "slaughter", "meeresfrücht", "seafood", "garnele", "shrimp", "prawn", "e-nummer", "e-number", "e-numbers", "awra", "awrah", "seide", "silk", "tattoo", "tätowier", "haare färben", "hair dye", "parfum", "perfume", "musik", "music", "foto", "photo", "bilder", "images", "ghiba", "backbiting", "lüge", "lying", "khalwa", "حلال", "حرام", "ربا"],
  },
];

export function searchTopics(q: string): TopicHit[] {
  const s = q.trim().toLowerCase();
  if (s.length < 3) return [];
  return TOPICS.filter((t) => t.words.some((w) => s.includes(w) || (w.length > 4 && w.startsWith(s)))).map(({ words: _w, ...t }) => t);
}
