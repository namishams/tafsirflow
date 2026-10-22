// COPY of the website's src/lib/usernameFilter.ts (keep both identical). Username filter (owner 22.10.2026): usernames are Latin a-z 0-9 . _ only (USERNAME_RE), so words of the 14 app
// languages appear as transliterations. Rejected: violence, swear words, sexual words, drugs, insults and mocking of
// religion, also written with digits or symbols (k1ller, 5h1t) or split by dots and underscores (k.i.l.l.e.r). Reserved
// names (team, brand, founder) are refused as "reserved". The app keeps an identical copy for instant feedback
// (mobile/src/features/talents/usernameFilter.ts); the server check here and moderate() stay authoritative.
// Pure module, no imports: safe for server routes and the website's client components.

/** names that belong to the platform, the team or the founder (compared without dots, underscores and digits) */
export const RESERVED_NAMES = [
  "admin", "administrator", "support", "help", "helpdesk", "staff", "team", "moderator", "moderation", "official", "verified", "founder",
  "quranmasterclass", "quranmaster", "masterclass", "qmc", "shamsmethod", "shamsmethode", "namishams", "nami", "shams",
  "system", "security", "contact", "info", "noreply", "owner", "root", "superuser",
];

/** forbidden stems, matched inside the normalised name (long enough not to hide inside ordinary names) */
const STEMS = [
  // violence and crime
  "killer", "murder", "moerder", "terror", "terrorist", "daesh", "bomb", "massacre", "rapist", "suicide", "shooter", "slaughter", "behead", "hitler",
  "katil", "qatil", "qaatil", "katl", "qatl", "assassin", "asesino", "pembunuh", "ubiytsa", "khuni", "khooni", "jallad",
  // sexual
  "porn", "porno", "sexy", "sexx", "xxx", "nude", "nudes", "naked", "horny", "boobs", "penis", "vagina", "pussy", "orgasm", "fetish", "onlyfans", "escort", "hooker",
  "hure", "nutte", "fotze", "ficken", "fick", "bumsen", "titten", "orospu", "fahise", "sikis", "sikik", "seks", "sharmouta", "sharmuta", "sharmoota", "qahba", "kahba", "zebi", "nayek", 
  "bhosdi", "gaand", "jende", "kos", "kus", "kir", "kooni", "jendeh", "salope", "putain", "verga", "polla", "panocha",
  "pelacur", "lonte", "jalang", "kontol", "memek", "ngentot", "pukimak", "pantat", "blyad", "blyat", "bljad", "pizda", "huy", "hui", "xuy", "yebat", "shlyukha", "khanki", "chodon", "choda", 
  "caonima", "bitch", "slut", "whore", "milf", "camgirl",
  // swear words and insults
  "fuck", "fuk", "fck", "shit", "sh1t", "bastard", "asshole", "arsehole", "motherf", "wanker", "retard", "idiot", "stupid", "moron", "dumbass",
  "scheisse", "scheiss", "arschloch", "wichser", "hurensohn", "spast", "missgeburt", "behindert", "schlampe", "penner",
  "amk", "aq", "siktir", "pic", "gavat", "yarrak", "yarak", "kahpe", "gerizekali", "salak", "aptal",
  "himar", "ibnkalb", "kuss", "kosomak", "kosom", "manyak", "manyok",
  "chutiya", "chutia", "bhenchod", "behenchod", "madarchod", "maderchod", "harami", "haramzada", "gandu", "kamina", "kutta", "kutti", "suwar",
  "koskesh", "madarjende", "kesafat", "ahmagh", "pedarsag", "ghandu",
  "merde", "connard", "connasse", "encule", "batard", "abruti", "debile", "mierda", "cabron", "pendejo", "joder", "gilipollas", "imbecil", "estupido", "maricon",
  "anjing", "bangsat", "bodoh", "tolol", "goblok", "bajingan", "keparat", "sialan", "celaka", "lahanat", 
  "mudak", "debil", "pidor", "pidar", "gandon", "durak", "kozel",
  "tamade", "wangba", "hundan", 
  "haramkhor", "shuorer", "kuttar", "bokachoda", 
  // drugs and intoxicants
  "cocaine", "kokain", "coke", "heroin", "heroine", "crystalmeth", "ganja", "hashish", "hasch", "haschisch", "charas", "opium", "ecstasy", "mdma", "lsd", "drug", "drugs", "dealer", "stoner", "marihuana", "marijuana", "kiffer", "esrar", "bonzai",
  "alcohol", "alkohol", "vodka", "whisky", "whiskey", "sharab", "khamr", "drunk", "besoffen", "casino", "gambling", "betting",
  // mocking religion and the sacred
  "fakeallah", "allahfake", "fakeprophet", "fakenabi", "fakemuslim", "kafirr", "kuffar", "infidel", "murtad", "jahannam", "shaitan", "shaytan", "satan", "satanist", "lucifer", "iblis", "devil", "antichrist", "dajjal", 
  "godisdead", "allahisdead", "nogod", "atheist", "haramlife", "haramking", "qurantrash", "islamtrash", "muslimtrash", "burnquran", "pigmuslim",
];
/** short words that only count as a whole part of the name (split at dots, underscores and digits) */
const WHOLE = ["ass", "sex", "fag", "cum", "tit", "tits", "nigga", "kus", "sik", "bok", "pic", "aq", "pig", "hoe", "kos", "kir", "zib", "bum", "suck",
  "puta", "puto", "pute", "lund", "chut", "babi", "magi", "chudi", "shabi", "jiba", "ibne", "meth", "crack", "weed", "beer", "bier", "wine", "isis", "nazi", "mord", "dick", "randi", "rundi", "loda", "lauda", "ebat", "loser", "kill", "rape", "anal", "cock", "cono", "huy", "hui", "xuy", "lsd", "zubb", "neek"];
/** sacred names that may not be combined with these words (mocking) */
const SACRED = ["allah", "rasul", "rasool", "nabi", "prophet", "muhammad", "mohammed", "quran", "koran", "islam", "muslim", "kaaba", "makkah", "mecca", "madinah", "medina"];
const MOCK = ["fake", "joke", "lol", "haha", "trash", "dumb", "stupid", "funny", "meme", "troll", "hate", "anti", "burn", "pig", "dog", "shit", "fuck", "noob", "clown", "toilet"];

const LEET: Record<string, string> = { "0": "o", "1": "i", "2": "z", "3": "e", "4": "a", "5": "s", "6": "g", "7": "t", "8": "b", "9": "g", "@": "a", "$": "s", "!": "i", "|": "l", "+": "t" };
const squash = (s: string) => s.replace(/(.)\1+/g, "$1");
const deLeet = (s: string) => s.replace(/[0-9@$!|+]/g, (c) => LEET[c] ?? c);
/** lower case, without separators, digits read as letters, repeated letters reduced (kiiiller → kiler, also kept as is) */
function variants(raw: string): string[] {
  const lower = raw.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  const joined = lower.replace(/[._\-\s]/g, "");
  const leet = deLeet(joined).replace(/[^a-z]/g, "");
  const plain = joined.replace(/[^a-z0-9]/g, "");
  const alt = deLeet(joined.replace(/1/g, "l")).replace(/[^a-z]/g, ""); // 1 read as l (k1ller, 1ove)
  return [...new Set([plain, leet, squash(leet), alt, squash(alt)])].filter(Boolean);
}
const parts = (raw: string) => raw.toLowerCase().split(/[._\-0-9\s]+/).filter(Boolean).map((p) => deLeet(p));

/** null when the username may be used; "reserved" for platform/team/founder names; "inappropriate" otherwise */
export function usernameProblem(raw: string): null | "reserved" | "inappropriate" {
  if (!raw) return null;
  const vs = variants(raw);
  const bare = raw.toLowerCase().replace(/[._0-9]/g, "");
  if (RESERVED_NAMES.includes(bare) || vs.some((v) => RESERVED_NAMES.includes(v))) return "reserved";
  if (vs.some((v) => v.includes("quranmasterclass") || v.includes("namishams") || v.includes("shamsmethod"))) return "reserved";
  const stems = STEMS.filter((s) => s.length >= 4);
  if (vs.some((v) => stems.some((s) => v.includes(s) || (squash(s).length >= 5 && squash(v).includes(squash(s)))))) return "inappropriate";
  const short = new Set([...WHOLE, ...STEMS.filter((s) => s.length < 4)]);
  if (parts(raw).some((p) => short.has(p)) || vs.some((v) => short.has(v))) return "inappropriate";
  if (vs.some((v) => SACRED.some((s) => v.includes(s)) && MOCK.some((m) => v.includes(m)))) return "inappropriate";
  return null;
}
