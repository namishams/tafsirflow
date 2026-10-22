import type { SistersText } from "./types";

// "For sisters" – English (polite, respectful address). Every statement carries a source (sources.ts); verses only by
// reference, hadith only by collection and number. Draft: needs_review (sources.ts SISTERS_REVIEW).
const en: SistersText = {
  kicker: "For sisters",
  title: "Your learning continues on every day",
  lead: "What changes for recitation during menstruation (ḥayḍ) and after childbirth (nifās), how the Shams Method continues, and the women who transmitted and taught the Quran. Learning never stops; for some schools only its form changes.",
  reviewLine: "Content is being reviewed by scholars",
  notFatwa: "This is an overview, not a fatwa. Please ask a scholar you trust, especially in your own school of law.",
  sourcesTitle: "Sources",
  schools: { hanafi: "Hanafi", maliki: "Maliki", shafii: "Shafi'i", hanbali: "Hanbali", jafari: "Ja'fari (Shia)", majority: "Majority of scholars", contemporary: "Contemporary fatwa bodies" },
  open: "Open",
  readVerse: "Read and listen in the Quran",
  entryTitle: "For sisters",
  entryLead: "Reciting during menstruation, listening and understanding days in the Shams Method, and the women who passed on the Quran.",
  entryCta: "View",

  partRecite: {
    title: "Reciting, memorising and the muṣḥaf",
    lead: "The schools differ above all on reciting from memory. Listening, dhikr and supplication are allowed according to every source given here.",
    blocks: [
      {
        id: "memory",
        title: "Reciting from memory",
        positions: [
          { school: "hanafi", text: "Not allowed with the intention of recitation, not even less than a verse. Allowed: verses said with the intention of supplication, remembrance or protection, and reading with the eyes without pronouncing. A female teacher may teach word by word with pauses, as this does not count as recitation.", src: ["arij", "sgHanafi"] },
          { school: "maliki", text: "While the bleeding continues, a woman in ḥayḍ – and according to Dar al-Ifta also in nifās – may recite from memory, whether or not she fears forgetting. Once the bleeding has stopped but before the ritual bath, only if she fears forgetting.", src: ["ifta12343"] },
          { school: "shafii", text: "Even one verse is not allowed. Phrases of the Quran said as remembrance are allowed.", src: ["sgShafii"] },
          { school: "hanbali", text: "The position of the school is prohibition. Ibn Taymiyya held reciting to be allowed, also in nifās when she fears forgetting.", src: ["muftiwp18", "iqa2564"] },
          { school: "jafari", text: "According to Ayatollah al-Sistani only the four verses of prostration are forbidden (32:15, 41:37, 53:62, 96:19) – the verse itself, not the whole surah. Other verses are not among the listed prohibitions. For nifās the same applies as an obligatory precaution.", src: ["sistani354", "sistani448", "sistani502"] },
          { school: "contemporary", text: "The Mufti of the Federal Territories of Malaysia holds that reviewing one's memorisation is allowed, also in hifz schools. islamqa.info considers the permissive view better supported and cautiously advises reciting only what one fears forgetting.", src: ["muftiwp18", "iqa2564"] },
        ],
      },
      {
        id: "mushaf",
        title: "Touching the muṣḥaf",
        positions: [
          { school: "majority", text: "According to the majority, touching the muṣḥaf without purity is not allowed.", src: ["iqa2564"] },
          { school: "hanafi", text: "Allowed with a separate cloth or cover that is not attached to the body.", src: ["bham"] },
          { school: "maliki", text: "A woman who is learning or teaching may touch and carry the muṣḥaf or part of it while learning or teaching. Dar al-Ifta generally advises the majority view, but allows following the Maliki view without sin in real need – memorising, teaching, teaching as a profession.", src: ["ifta12343"] },
          { school: "jafari", text: "Touching the writing of the Quran is forbidden.", src: ["sistani354", "sistani448"] },
        ],
      },
      {
        id: "screen",
        title: "From a screen or an app",
        positions: [
          { school: "contemporary", text: "islamqa.info: a phone is not a muṣḥaf; it may be touched without purity. Dar al-Ifta (Egypt): for the majority, reciting is forbidden whatever the means; looking at the screen without pronouncing is allowed.", src: ["iqa106961", "ifta7815"] },
          { school: "hanafi", text: "Darul Iftaa Azaadville: while Quran text is on the screen, the screen and the icons of that page take the ruling of the muṣḥaf; do not touch them directly, a stylus is possible. Listening is allowed.", src: ["azaad"] },
        ],
      },
      {
        id: "always",
        title: "What always remains",
        points: [
          { text: "Listening: hearing recitation is allowed; the Hanafi source calls it highly praiseworthy, also from recordings. The Mufti's office of Malaysia recommends listening in place of revision.", src: ["azaad", "sgHanafi", "muftiwp18"] },
          { text: "Dhikr and supplication are allowed; the majority exempts exactly these from the prohibition, as long as they are not meant as recitation.", src: ["iqa2564", "sgShafii"] },
          { text: "The Prophet ﷺ recited the Quran with his head in ʿĀʾisha's lap while she was menstruating. Closeness to the Quran remains.", src: ["bukhari297", "muslim301"] },
        ],
      },
    ],
  },

  partShams: {
    title: "How the Shams Method continues",
    lead: "On listening and understanding days your ḥifẓ stays alive without reciting aloud. Your streak and your garden keep growing.",
    steps: [
      { id: "listen", title: "Ḥifẓ by listening", text: "Listen to today's sabaq, your sabqī and your manzil from a master reciter, verse by verse and several times.", src: ["muftiwp18", "sgHanafi"] },
      { id: "eyes", title: "Follow with your eyes", text: "Read along silently without pronouncing. Whether you touch the screen while doing so depends on your school (see above).", src: ["sgHanafi", "ifta7815", "azaad"] },
      { id: "understand", title: "Understanding (tadabbur)", text: "Meaning, tafsir and context of your verses: the \"understand\" step of the Shams Method." },
      { id: "words", title: "Vocabulary", text: "The words of your verses and their roots, with flashcards." },
      { id: "tajweed", title: "Tajwīd theory and makhārij", text: "Learn the rules, look at the mouth diagrams and descriptions of the points of articulation. Whether you practise single letters aloud, please clarify with your teacher." },
      { id: "dua", title: "Dhikr and supplication", text: "Supplication and remembrance accompany every day.", src: ["iqa2564"] },
    ],
    notes: [
      { text: "Female teachers following the Hanafi school may teach word by word with pauses.", src: ["arij"] },
      { text: "Those following the Maliki school may keep reciting while the bleeding continues and may touch the muṣḥaf while learning or teaching.", src: ["ifta12343"] },
      { text: "After the bleeding ends: in the Maliki school reciting is allowed again only after the ritual bath, unless she fears forgetting.", src: ["ifta12343"] },
    ],
  },

  partSajda: {
    title: "Prostration of recitation (sajdat al-tilāwa)",
    lead: "What applies when you hear or read a verse of prostration.",
    positions: [
      { school: "hanafi", text: "In ḥayḍ and nifās neither permitted nor valid, and it is not owed or made up later.", src: ["sgSajda"] },
      { school: "majority", text: "Purity is a condition; so the prostration is not performed (al-Sarakhsi, Ibn Juzayy, al-Nawawi, al-Ruhaybani).", src: ["ifta24156"] },
      { school: "contemporary", text: "Another view holds that purity is not required (Ibn Taymiyya, al-Shawkani). Dar al-Ifta prefers the majority but sees no sin in a woman who follows the other view.", src: ["ifta24156"] },
      { school: "jafari", text: "According to al-Sistani, prostration is obligatory on reciting or hearing one of the four verses of prostration; wuḍūʾ or ghusl is not required for it. Heard from a recording, it does not become obligatory – this includes the recitations in this app.", src: ["sistani1079"] },
    ],
  },

  partWomen: {
    title: "Women and the Quran",
    lead: "For the \"understand\" step: verses about women, and the women who preserved, taught and recited the Quran.",
    versesTitle: "Verses to reflect on",
    verses: [
      { ref: "33:35", topic: "Believing men and women are named side by side, with the same reward." },
      { ref: "3:195", topic: "No deed is lost, whether of a man or a woman." },
      { ref: "4:124", topic: "Good deeds of a man or a woman with faith lead to Paradise." },
      { ref: "16:97", topic: "A good life for whoever does good and believes, man or woman." },
      { ref: "58:1", topic: "Allah heard the woman who pleaded about her husband; the surah bears her name (al-Mujādila)." },
      { ref: "66:11", topic: "The supplication of Pharaoh's wife for a house in Paradise." },
      { ref: "66:12", topic: "Maryam, who believed in the words of her Lord." },
      { ref: "3:42", topic: "Maryam is chosen and purified (to 3:43)." },
      { ref: "28:7", topic: "The inspiration to the mother of Mūsā: do not fear and do not grieve." },
    ],
    companionsTitle: "Female companions who passed on the Quran",
    companions: [
      { text: "Ḥafṣa bint ʿUmar kept the sheets (ṣuḥuf) of Abū Bakr's compilation of the Quran; ʿUthmān had the copies made from them and returned them to her.", src: ["bukhari4986", "bukhari4987"] },
      { text: "Umm Waraqa read the Quran; the Prophet ﷺ allowed her a caller to prayer in her house and told her to lead the people of her house in prayer.", src: ["abudawud591", "abudawud592"] },
      { text: "ʿĀʾisha explained verses and corrected interpretations, for example of 2:158 and 4:3.", src: ["bukhari1643", "muslim3018"] },
      { text: "Umm Salama described how the Prophet ﷺ recited al-Fātiḥa verse by verse, pausing after each verse – a foundation for tajwīd and stopping (waqf).", src: ["abudawud4001", "tirmidhi2927"] },
    ],
    scholarsTitle: "Women scholars",
    scholars: [
      { text: "Karīma al-Marwaziyya (d. 1069 in Mecca) was an authority for the transmission of Ṣaḥīḥ al-Bukhārī.", src: ["karima"] },
      { text: "Fāṭima bint Muḥammad al-Samarqandī knew her father's work of fiqh by heart; fatwas bore her handwriting alongside her father's and her husband's.", src: ["samarqandi"] },
      { text: "Mohammad Akram Nadwi wrote a dictionary of women hadith scholars in about 40 volumes in Arabic; its introduction appeared as \"Al-Muhaddithat: The Women Scholars in Islam\".", src: ["nadwi"] },
    ],
    recitersTitle: "Women reciters",
    reciters: [
      { text: "The International Quran Recital Competition in Malaysia has its own category for women reciters (qāriʾa); its winners include Rogayah Sulong and Faridah Mat Saman of Malaysia and Maria Ulfah of Indonesia.", src: ["mtq", "aljazeera"] },
      { text: "A 1905 recording of the Egyptian reciter Shaykha Mabrūka survives; today initiatives are making women reciters visible again.", src: ["aljazeera"] },
    ],
  },

  partTogether: {
    title: "Learning with a female teacher and with sisters",
    lead: "Recitation is learned by listening and reciting to a teacher.",
    teacher: "Connect your Shams Method with a teacher of your choice: she sees your plan, and your recordings when you send them.",
    circles: "In \"Together\" there are study circles for sisters only.",
    teacherCta: "Connect a teacher",
    circlesCta: "Sisters' circles",
  },

  setup: {
    title: "Set up \"For sisters\"?",
    lead: "An optional area that accompanies your learning on every day.",
    points: [
      "You choose your school of law. What pauses on your days follows it.",
      "\"My days\" is a simple switch: yes or no. No date, no history, no cycle calendar.",
      "Everything stays on this device only. Nothing is synced with your account or sent to a server or an AI; it is deleted when you sign out.",
      "You can change or switch it off at any time.",
    ],
    agree: "Yes, set it up",
    decline: "No, thank you",
    declined: "Of course. We will not ask anything further. The \"For sisters\" page stays open to you in Discover.",
    madhhabTitle: "Which school of law do you follow?",
    madhhabLead: "If you do not know, the cautious view of the majority applies.",
    madhhabs: { hanafi: "Hanafi", maliki: "Maliki", shafii: "Shafi'i", hanbali: "Hanbali", jafari: "Ja'fari (Shia)", unknown: "I don't know" },
    done: "Done",
    later: "You will find everything in Discover → For sisters.",
  },

  days: {
    title: "My days",
    lead: "A switch, on this device only. While it is on, the app pauses what your school does not foresee on these days and turns on the listening and understanding days. Your streak and garden remain; reviews move forward instead of piling up.",
    question: "Are you on your days right now?",
    yes: "Yes",
    no: "No",
    statusOn: "On: listening and understanding days are active.",
    statusOff: "Off.",
    rules: {
      hanafi: "Hanafi: reciting from memory and recitation exercises pause. Listening, reading along with the eyes, understanding, vocabulary, tajwīd theory and supplication remain.",
      maliki: "Maliki: reciting from memory remains allowed while the bleeding continues. The app reminds you of this instead of pausing. Touch the muṣḥaf only while learning or teaching.",
      shafii: "Shafi'i: reciting from memory and recitation exercises pause. Listening, reading along with the eyes, understanding, vocabulary, tajwīd theory and supplication remain.",
      hanbali: "Hanbali: reciting from memory and recitation exercises pause (the position of the school). Listening, reading along, understanding, vocabulary, tajwīd theory and supplication remain.",
      jafari: "Ja'fari: please leave out the four verses of prostration (32:15, 41:37, 53:62, 96:19); the app points them out. For the state of janāba, al-Sistani (ruling 355) names reciting more than seven verses as disliked (makrūh); whether this applies to ḥayḍ, please ask your marjaʿ.",
      unknown: "Cautious view of the majority: reciting from memory and recitation exercises pause. Listening, reading along with the eyes, understanding, vocabulary, tajwīd theory and supplication remain.",
    },
    strictTitle: "Strict mode",
    strictLead: "Your own choice: on your days everything pauses except listening and supplication, including tafsir and vocabulary. None of the major schools requires this; listening, tafsir and supplication are allowed.",
    offTitle: "I am pure again",
    offNote: "After the bleeding ends, the ritual bath (ghusl) is required; in the Maliki school reciting is allowed again only after it, unless she fears forgetting.",
    ghuslLink: "To the washing guide",
    privacy: "On this device only. No date, no history, no transfer. Deleted when you sign out.",
    changeMadhhab: "Change school of law",
  },

  gate: {
    pausedTitle: "Paused until your days are over",
    pausedMajority: "According to your school, one does not recite from memory on these days. Your ḥifẓ stays alive: listen to the same verses today and learn their meaning.",
    pausedStrict: "You chose strict mode: today listening and supplication remain.",
    noteMaliki: "According to the Maliki school you may recite from memory while the bleeding continues.",
    noteJafari: "Please leave out the verses of prostration 32:15, 41:37, 53:62 and 96:19.",
    listenInstead: "Listen instead of reciting today",
    toSection: "For sisters",
    openAnyway: "Open anyway",
  },

  ld: {
    title: "Listening and understanding days",
    lead: "When you cannot or do not want to recite aloud – travelling, hoarse, on your days: your wird becomes listening, understanding and vocabulary. Streak and garden remain.",
    on: "Listening and understanding days",
    onHint: "A simple switch like the travel mode, on this device only. No date is stored.",
    activeTitle: "Today: a listening and understanding day",
    activeLead: "Your ḥifẓ stays alive without reciting aloud.",
    done: "Complete listening day",
    doneMsg: "Mā shāʾ Allāh. Your listening day counts for your streak and your garden.",
    off: "Recite again",
    sistersLink: "Notes for sisters",
  },
};
export default en;
