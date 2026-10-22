// Username filter (owner 22.10.2026): usernames are Latin a-z 0-9 . _ only (USERNAME_RE), so words of the 14 app
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

// Star profiles (owner 22.10.2026): the well-known reciters of the reciters data (src/lib/reciters, 50 entries) own a
// reserved username each; nobody else may take it or a close look-alike. Generated from the reciters data (name with
// and without article, common transliterations such as al/el, ou/u, y/i, q/k): [username, reciter slug, full-name forms
// (also blocked inside a longer name), surname forms (blocked alone or with affixes like "real", "official", "qari")].
// All forms are lower case, without separators, repeated letters reduced. The claimed star account keeps its name.
export const STARS: [string, string, string, string][] = [
  ["mahmoud.alhusary", "mahmoud-khalil-al-husary", "mahmoudalhusari mahmoudalhusary mahmoudelhusari mahmoudelhusary mahmoudhusari mahmoudhusary mahmoudkhalilalhusari mahmoudkhalilalhusary mahmoudkhalilelhusari mahmoudkhalilelhusary mahmoudkhalilhusari mahmoudkhalilhusary mahmudalhusari mahmudalhusary mahmudelhusari mahmudelhusary mahmudhusari mahmudhusary mahmudkhalilalhusari mahmudkhalilalhusary mahmudkhalilelhusari mahmudkhalilelhusary mahmudkhalilhusari mahmudkhalilhusary", "alhusari alhusary elhusari elhusary husari husary"],
  ["mohamed.alminshawi", "mohamed-siddiq-al-minshawi", "mohamadalminshawi mohamadalminshawy mohamadelminshawi mohamadelminshawy mohamadminshawi mohamadminshawy mohamadsidikalminshawi mohamadsidikalminshawy mohamadsidikelminshawi mohamadsidikelminshawy mohamadsidikminshawi mohamadsidikminshawy mohamadsidiqalminshawi mohamadsidiqalminshawy mohamadsidiqelminshawi mohamadsidiqelminshawy mohamadsidiqminshawi mohamadsidiqminshawy mohamedalminshawi mohamedalminshawy mohamedelminshawi mohamedelminshawy mohamedminshawi mohamedminshawy mohamedsidikalminshawi mohamedsidikalminshawy mohamedsidikelminshawi mohamedsidikelminshawy mohamedsidikminshawi mohamedsidikminshawy mohamedsidiqalminshawi mohamedsidiqalminshawy mohamedsidiqelminshawi mohamedsidiqelminshawy mohamedsidiqminshawi mohamedsidiqminshawy muhamadalminshawi muhamadalminshawy muhamadelminshawi muhamadelminshawy muhamadminshawi muhamadminshawy muhamadsidikalminshawi muhamadsidikalminshawy muhamadsidikelminshawi muhamadsidikelminshawy muhamadsidikminshawi muhamedalminshawi muhamedalminshawy muhamedelminshawi muhamedelminshawy muhamedminshawi muhamedminshawy", "alminshawi alminshawy elminshawi elminshawy minshawi minshawy"],
  ["abdulbasitabdulsamad", "abdul-basit-abdul-samad", "abdelbasitabdelsamad abdelbasitabdulsamad abdulbasitabdelsamad abdulbasitabdulsamad", ""],
  ["mustafa.ismail", "mustafa-ismail", "mustafaismail", ""],
  ["muhammad.rifat", "muhammad-rifat", "mohamadrifat mohamedrifat muhamadrifat muhamedrifat", ""],
  ["abdelfattah.shaashai", "abdel-fattah-al-shaashai", "abdelfatahalshashai abdelfatahalshashay abdelfatahelshashai abdelfatahelshashay abdelfatahshashai abdelfatahshashay abdulfatahalshashai abdulfatahalshashay abdulfatahelshashai abdulfatahelshashay abdulfatahshashai abdulfatahshashay", "alshashai alshashay elshashai elshashay shashai shashay"],
  ["mahmoud.albanna", "mahmoud-ali-al-banna", "mahmoudalbana mahmoudalialbana mahmoudalibana mahmoudalielbana mahmoudalyalbana mahmoudalybana mahmoudalyelbana mahmoudbana mahmoudelbana mahmudalbana mahmudalialbana mahmudalibana mahmudalielbana mahmudalyalbana mahmudalybana mahmudalyelbana mahmudbana mahmudelbana", ""],
  ["mishary.alafasy", "mishary-rashid-alafasy", "meshariafasi meshariafasy mesharialafasi mesharialafasy mesharialefasi mesharialefasy mesharielafasi mesharielafasy mesharirashidafasi mesharirashidafasy mesharirashidalafasi mesharirashidalafasy mesharirashidalefasi mesharirashidalefasy mesharirashidelafasi mesharirashidelafasy mesharyafasi mesharyafasy mesharyalafasi mesharyalafasy mesharyalefasi mesharyalefasy mesharyelafasi mesharyelafasy mesharyrashidafasi mesharyrashidafasy mesharyrashidalafasi mesharyrashidalafasy mesharyrashidalefasi mesharyrashidalefasy mesharyrashidelafasi mesharyrashidelafasy mishariafasi mishariafasy misharialafasi misharialafasy misharialefasi misharialefasy misharielafasi misharielafasy misharirashidafasi misharirashidafasy misharirashidalafasi misharirashidalafasy misharirashidalefasi misharirashidalefasy misharirashidelafasi misharirashidelafasy misharyafasi misharyafasy misharyalafasi misharyalafasy misharyalefasi misharyalefasy misharyelafasi misharyelafasy misharyrashidafasi misharyrashidafasy misharyrashidalafasi misharyrashidalafasy misharyrashidalefasi", "afasi afasy alafasi alafasy alefasi alefasy elafasi elafasy"],
  ["abdulrahman.alsudais", "abdul-rahman-al-sudais", "abdelrahmanalsudais abdelrahmanelsudais abdelrahmansudais abdulrahmanalsudais abdulrahmanelsudais abdulrahmansudais", "alsudais elsudais sudais"],
  ["saud.alshuraim", "saud-al-shuraim", "saudalshuraim saudelshuraim saudshuraim", "alshuraim elshuraim shuraim"],
  ["maher.almuaiqly", "maher-al-muaiqly", "maheralmuaikly maheralmuaiqli maheralmuaiqly maherelmuaikly maherelmuaiqli maherelmuaiqly mahermuaikly mahermuaiqli mahermuaiqly", "almuaikly almuaiqli almuaiqly elmuaikly elmuaiqli elmuaiqly muaikly muaiqli muaiqly"],
  ["yasser.aldosari", "yasser-al-dosari", "yaseraldosari yaseraldosary yaserdosari yaserdosary yasereldosari yasereldosary", ""],
  ["abdullah.aljuhany", "abdullah-awad-al-juhany", "abdelahaljuhani abdelahaljuhany abdelahawadaljuhani abdelahawadaljuhany abdelahawadeljuhani abdelahawadeljuhany abdelahawadjuhani abdelahawadjuhany abdelaheljuhani abdelaheljuhany abdelahjuhani abdelahjuhany abdulahaljuhani abdulahaljuhany abdulahawadaljuhani abdulahawadaljuhany abdulahawadeljuhani abdulahawadeljuhany abdulahawadjuhani abdulahawadjuhany abdulaheljuhani abdulaheljuhany abdulahjuhani abdulahjuhany", "aljuhani aljuhany eljuhani eljuhany juhani juhany"],
  ["bandar.baleela", "bandar-baleela", "bandarbalela bandarbalila", "balela balila"],
  ["ali.alhudhaify", "ali-al-hudhaify", "alialhudhaifi alialhudhaify alialhuzaify alielhudhaifi alielhudhaify alielhuzaify alihudhaifi alihudhaify alihuzaify alyalhudhaifi alyalhudhaify alyalhuzaify alyelhudhaifi alyelhudhaify alyelhuzaify alyhudhaifi alyhudhaify alyhuzaify", "alhudhaifi alhudhaify alhuzaify elhudhaifi elhudhaify elhuzaify hudhaifi hudhaify huzaify"],
  ["muhammad.ayyub", "muhammad-ayyub", "mohamadayub mohamedayub muhamadayub muhamedayub", ""],
  ["ali.jaber", "ali-jaber", "alijaber alyjaber", ""],
  ["abdullah.basfar", "abdullah-basfar", "abdelahbasfar abdulahbasfar", ""],
  ["saad.alghamdi", "saad-al-ghamdi", "sadalghamdi sadalghamdy sadelghamdi sadelghamdy sadghamdi sadghamdy", ""],
  ["ahmed.alajmi", "ahmed-al-ajmi", "ahmedajmi ahmedajmy ahmedalajmi ahmedalajmy ahmedelajmi ahmedelajmy", ""],
  ["abubakr.alshatri", "abu-bakr-al-shatri", "abubakralshatri abubakralshatry abubakrelshatri abubakrelshatry abubakrshatri abubakrshatry", "alshatri alshatry elshatri elshatry shatri shatry"],
  ["hani.arrifai", "hani-ar-rifai", "hanialrifai hanialrifay haniarifai haniarifay hanielrifai hanielrifay hanirifai hanirifay hanyalrifai hanyalrifay hanyarifai hanyarifay hanyelrifai hanyelrifay hanyrifai hanyrifay", ""],
  ["fares.abbad", "fares-abbad", "faresabad", ""],
  ["nasser.alqatami", "nasser-al-qatami", "naseralkatami naseralqatami naseralqatamy naserelkatami naserelqatami naserelqatamy naserkatami naserqatami naserqatamy", "alkatami alqatami alqatamy elkatami elqatami elqatamy katami qatami qatamy"],
  ["idris.abkar", "idris-abkar", "idrisabkar", "abkar"],
  ["muhammad.alluhaidan", "muhammad-al-luhaidan", "mohamadaluhaidan mohamadeluhaidan mohamadluhaidan mohamedaluhaidan mohamedeluhaidan mohamedluhaidan muhamadaluhaidan muhamadeluhaidan muhamadluhaidan muhamedaluhaidan muhamedeluhaidan muhamedluhaidan", "aluhaidan eluhaidan luhaidan"],
  ["salah.albudair", "salah-al-budair", "salahalbudair salahbudair salahelbudair", "albudair budair elbudair"],
  ["ibrahim.alakhdar", "ibrahim-al-akhdar", "ibrahimakhdar ibrahimalakhdar ibrahimelakhdar", ""],
  ["abdulbari.thubaity", "abdulbari-ath-thubaity", "abdelbarialthubaiti abdelbarialthubaity abdelbariaththubaiti abdelbariaththubaity abdelbarielthubaiti abdelbarielthubaity abdelbarithubaiti abdelbarithubaity abdulbarialthubaiti abdulbarialthubaity abdulbariaththubaiti abdulbariaththubaity abdulbarielthubaiti abdulbarielthubaity abdulbarithubaiti abdulbarithubaity abdulbaryalthubaiti abdulbaryalthubaity abdulbaryaththubaiti abdulbaryaththubaity abdulbaryelthubaiti abdulbaryelthubaity abdulbarythubaiti abdulbarythubaity", "althubaiti althubaity aththubaiti aththubaity elthubaiti elthubaity thubaiti thubaity"],
  ["salah.bukhatir", "salah-bukhatir", "salahbukhatir", "bukhatir"],
  ["khalifa.altunaiji", "khalifa-al-tunaiji", "khalifaeltunaiji khalifaeltunaijy khalifaltunaiji khalifaltunaijy khalifatunaiji khalifatunaijy", "altunaiji altunaijy eltunaiji eltunaijy tunaiji tunaijy"],
  ["abdullah.almatroud", "abdullah-al-matroud", "abdelahalmatroud abdelahalmatrud abdelahelmatroud abdelahelmatrud abdelahmatroud abdelahmatrud abdulahalmatroud abdulahalmatrud abdulahelmatroud abdulahelmatrud abdulahmatroud abdulahmatrud", "almatroud almatrud elmatroud elmatrud matroud matrud"],
  ["mohamed.altablawi", "mohamed-mahmoud-al-tablawi", "mohamadaltablawi mohamadaltablawy mohamadeltablawi mohamadeltablawy mohamadmahmoudaltablawi mohamadmahmoudaltablawy mohamadmahmoudeltablawi mohamadmahmoudeltablawy mohamadmahmoudtablawi mohamadmahmoudtablawy mohamadmahmudaltablawi mohamadmahmudaltablawy mohamadmahmudeltablawi mohamadmahmudeltablawy mohamadmahmudtablawi mohamadmahmudtablawy mohamadtablawi mohamadtablawy mohamedaltablawi mohamedaltablawy mohamedeltablawi mohamedeltablawy mohamedmahmoudaltablawi mohamedmahmoudaltablawy mohamedmahmoudeltablawi mohamedmahmoudeltablawy mohamedmahmoudtablawi mohamedmahmoudtablawy mohamedmahmudaltablawi mohamedmahmudaltablawy mohamedmahmudeltablawi mohamedmahmudeltablawy mohamedmahmudtablawi mohamedmahmudtablawy mohamedtablawi mohamedtablawy muhamadaltablawi muhamadaltablawy muhamadeltablawi muhamadeltablawy muhamadmahmoudaltablawi muhamadmahmoudaltablawy muhamadmahmoudeltablawi muhamadmahmoudeltablawy muhamadmahmoudtablawi muhamadtablawi muhamadtablawy muhamedaltablawi muhamedaltablawy muhamedeltablawi muhamedeltablawy muhamedtablawi muhamedtablawy", "altablawi altablawy eltablawi eltablawy tablawi tablawy"],
  ["ahmed.naina", "ahmed-naina", "ahmednaina", ""],
  ["muhammad.jibreel", "muhammad-jibreel", "mohamadjibrel mohamadjibril mohamedjibrel mohamedjibril muhamadjibrel muhamadjibril muhamedjibrel muhamedjibril", ""],
  ["raad.alkurdi", "raad-al-kurdi", "radalkurdi radalkurdy radelkurdi radelkurdy radkurdi radkurdy", ""],
  ["islam.sobhi", "islam-sobhi", "islamsobhi islamsobhy", ""],
  ["muhammad.assubayyil", "muhammad-as-subayyil", "mohamadalsubayil mohamadasubayil mohamadelsubayil mohamadsubayil mohamedalsubayil mohamedasubayil mohamedelsubayil mohamedsubayil muhamadalsubayil muhamadasubayil muhamadelsubayil muhamadsubayil muhamedalsubayil muhamedasubayil muhamedelsubayil muhamedsubayil", "alsubayil asubayil elsubayil subayil"],
  ["abdulmuhsin.alqasim", "abdul-muhsin-al-qasim", "abdelmuhsinalkasim abdelmuhsinalqasim abdelmuhsinelkasim abdelmuhsinelqasim abdelmuhsinkasim abdelmuhsinqasim abdulmuhsinalkasim abdulmuhsinalqasim abdulmuhsinelkasim abdulmuhsinelqasim abdulmuhsinkasim abdulmuhsinqasim", ""],
  ["abdullah.khayyat", "abdullah-khayyat", "abdelahkhayat abdulahkhayat", ""],
  ["ali.mahmoud", "ali-mahmoud", "alimahmoud alimahmud alymahmoud alymahmud", ""],
  ["taha.alfashni", "taha-al-fashni", "tahaelfashni tahaelfashny tahafashni tahafashny tahalfashni tahalfashny", "alfashni alfashny elfashni elfashny fashni fashny"],
  ["shahat.anwar", "shahat-muhammad-anwar", "shahatanwar shahatmohamadanwar shahatmohamedanwar shahatmuhamadanwar shahatmuhamedanwar", ""],
  ["abdurrashid.sufi", "abdur-rashid-sufi", "abdurashidsufi abdurashidsufy", ""],
  ["mahmoud.anwar", "mahmoud-shahat-anwar", "mahmoudanwar mahmoudshahatanwar mahmudanwar mahmudshahatanwar", ""],
  ["abulaynayn.shuaysha", "abu-al-aynayn-shuaysha", "abualaynaynshuaysha abualshuaysha abulaynaynshuaysha", "shuaysha"],
  ["khalid.aljalil", "khalid-al-jalil", "khalidaljalil khalideljalil khalidjalil", ""],
  ["alzain.ahmad", "al-zain-muhammad-ahmad", "alzainahmad alzainmohamadahmad alzainmohamedahmad alzainmuhamadahmad alzainmuhamedahmad elzainahmad elzainmohamadahmad elzainmohamedahmad elzainmuhamadahmad elzainmuhamedahmad zainahmad zainmohamadahmad zainmohamedahmad zainmuhamadahmad zainmuhamedahmad", ""],
  ["ragheb.ghalwash", "ragheb-mustafa-ghalwash", "raghebghalwash raghebmustafaghalwash", "ghalwash"],
  ["kamel.albahtimi", "kamel-yousef-al-bahtimi", "kamelalbahtimi kamelalbahtimy kamelbahtimi kamelbahtimy kamelelbahtimi kamelelbahtimy kamelyousefalbahtimi kamelyousefalbahtimy kamelyousefbahtimi kamelyousefbahtimy kamelyousefelbahtimi kamelyousefelbahtimy kamelyusefalbahtimi kamelyusefalbahtimy kamelyusefbahtimi kamelyusefbahtimy kamelyusefelbahtimi kamelyusefelbahtimy", "albahtimi albahtimy bahtimi bahtimy elbahtimi elbahtimy"],
];
const STAR_AFFIX = /^(?:real|the|oficial|ofical|qari|qary|sheikh|shaikh|shaykh|imam|quran|tv|chanel|fan|fans|page)+|(?:real|oficial|ofical|qari|qary|sheikh|shaikh|shaykh|imam|quran|tv|chanel|fan|fans|page)+$/g;
let STAR_INDEX: { full: Map<string, string>; solo: Map<string, string> } | null = null;
function starIndex() {
  if (STAR_INDEX) return STAR_INDEX;
  const full = new Map<string, string>(), solo = new Map<string, string>();
  for (const [u, , f, s] of STARS) {
    for (const x of f.split(" ").filter(Boolean)) if (!full.has(x)) full.set(x, u);
    for (const x of s.split(" ").filter(Boolean)) if (!solo.has(x)) solo.set(x, u);
  }
  return (STAR_INDEX = { full, solo });
}
/** the reserved star username a name stands for (exact, look-alike or containing the full name), otherwise null */
export function starFor(raw: string): string | null {
  if (!raw) return null;
  const { full, solo } = starIndex();
  const bare = raw.toLowerCase().replace(/[._0-9\-\s]/g, "");
  for (const v0 of new Set([...variants(raw), bare])) {
    const v = squash(v0);
    for (const w of [v, v.replace(STAR_AFFIX, "")]) {
      const hit = full.get(w) ?? solo.get(w);
      if (hit) return hit;
    }
    for (const [f, u] of full) if (f.length >= 10 && v.includes(f)) return u;
  }
  return null;
}

/** null when the username may be used; "reserved" for platform/team/founder names; "star" for a well-known reciter's
 * name (see STARS); "inappropriate" otherwise */
export function usernameProblem(raw: string): null | "reserved" | "star" | "inappropriate" {
  if (!raw) return null;
  const vs = variants(raw);
  const bare = raw.toLowerCase().replace(/[._0-9]/g, "");
  if (RESERVED_NAMES.includes(bare) || vs.some((v) => RESERVED_NAMES.includes(v))) return "reserved";
  if (vs.some((v) => v.includes("quranmasterclass") || v.includes("namishams") || v.includes("shamsmethod"))) return "reserved";
  if (starFor(raw)) return "star";
  const stems = STEMS.filter((s) => s.length >= 4);
  if (vs.some((v) => stems.some((s) => v.includes(s) || (squash(s).length >= 5 && squash(v).includes(squash(s)))))) return "inappropriate";
  const short = new Set([...WHOLE, ...STEMS.filter((s) => s.length < 4)]);
  if (parts(raw).some((p) => short.has(p)) || vs.some((v) => short.has(v))) return "inappropriate";
  if (vs.some((v) => SACRED.some((s) => v.includes(s)) && MOCK.some((m) => v.includes(m)))) return "inappropriate";
  return null;
}
