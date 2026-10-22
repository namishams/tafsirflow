// No personal data goes to OpenAI: e-mail addresses, phone numbers, links, long numbers (IDs, cards) and the learner's
// own name (from the account) are replaced before a question leaves the server. The same scrubbed text is the only
// text ever stored (reports).

const EMAIL = /[\w.+-]+\s*(?:@|\(at\)|\[at\])\s*[\w-]+(?:\s*(?:\.|\(dot\)|\[dot\])\s*[\w-]+)+/gi;
const URL_RE = /\b(?:https?:\/\/|www\.)\S+/gi;
const PHONE = /(?:\+|00)?\d[\d\s().\-/]{7,}\d/g;
const IBAN = /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}\b/g;
const SELF_NAME = /\b(?:my name is|i am called|ich heiße|ich heisse|mein name ist|je m'appelle|me llamo|benim adım|меня зовут|اسمي)\s+([\p{L}'’-]+(?:\s+[\p{L}'’-]+)?)/giu;

// names that are also names of prophets, the Ahl al-Bayt, Companions or of Allah's attributes stay: a learner called
// Muhammad must still be able to ask about the Prophet Muhammad ﷺ
const SACRED = new Set(("muhammad mohammed mohamed mohammad ahmad ahmed mustafa ali fatima fatimah hasan hassan husayn hussein husain ibrahim abraham musa moses isa jesus " +
  "yusuf joseph maryam mariam maria mary aisha aysha khadija khadijah umar omar uthman osman abu bakr nuh noah adam dawud david sulayman sulaiman solomon yunus " +
  "jonah yaqub yakub jacob ismail ismael ishaq isaac harun aaron zakariya zakaria yahya ayyub job idris hud salih saleh shuayb lut ilyas elias alyasa dhulkifl " +
  "zainab zaynab abdullah abdallah abdulrahman abdurrahman rahman rahim karim latif aziz malik jafar jaafar mahdi zahra hamza abbas bilal salman").split(" "));

export function scrub(text: string, names: (string | null | undefined)[] = []): string {
  let s = text.replace(EMAIL, "[e-mail]").replace(URL_RE, "[link]").replace(IBAN, "[number]").replace(PHONE, (m) => (m.replace(/\D/g, "").length >= 8 ? "[number]" : m));
  s = s.replace(SELF_NAME, (all, n: string) => all.replace(n, "[name]"));
  for (const raw of names) {
    for (const n of String(raw ?? "").split(/\s+/)) {
      if (n.length < 3 || SACRED.has(n.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, ""))) continue;
      s = s.replace(new RegExp(`(?<![\\p{L}])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}])`, "giu"), "[name]");
    }
  }
  return s;
}
