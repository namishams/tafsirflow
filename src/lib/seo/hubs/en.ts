import type { Hub, HubId } from "../types";

const hubs: Record<HubId, Hub> = {
  "learn-quran": {
    title: "How to Learn the Quran Online – Free Step-by-Step Path",
    description: "Learn the Quran online for free: start with the letters, add tajweed, then meaning and memorization. A clear path for beginners and adults.",
    kicker: "Learn the Quran",
    h1: "How to learn the Quran online, step by step",
    intro: "If you want to learn the Quran online, the hardest part is usually not talent but knowing what comes first. This page gives you an order that works for most beginners, and every step can be done on Quran Masterclass for free.",
    answer: "To learn the Quran online, start by reading the Arabic letters and short vowels, then practice reading with audio, add basic tajweed, and only then move on to meaning and memorization. Short daily sessions of 15 to 30 minutes work better than rare long ones. On Quran Masterclass all of this is free and you can follow it on the website or in the iOS app with the same account.",
    sections: [
      {
        h2: "Start with reading, not with memorizing",
        p: [
          "Many people try to memorize before they can read comfortably, and then feel stuck. Spend your first weeks on the Arabic letters, the short vowels and how letters connect inside a word. The reading path on our site is built for adults who start late as well as for children.",
          "Once you can sound out a line without stopping at every word, move to listening and reading along. This is where most of the progress happens."
        ],
        links: [["/arabic/read", "Practice reading Arabic"], ["/arabic", "Arabic for the Quran"]]
      },
      {
        h2: "Listen to a verse, then read it yourself",
        p: [
          "Open any surah, play one verse with a reciter you like, repeat it, and then say it yourself. You see the Arabic, the transliteration and the translation together, and each word lights up while it is recited. Beginners often start with the last short surahs because they are short and familiar.",
          "You can change the reciter and the speed. A slower reciter is usually easier when you are learning the sounds."
        ],
        links: [["/quran", "All 114 surahs"], ["/surah/1", "Surah 1"], ["/reciters", "Choose a reciter"]]
      },
      {
        h2: "Add tajweed in small pieces",
        p: [
          "Tajweed is the set of rules for pronouncing the letters correctly. You do not need to master it before you begin, but learning one small rule at a time keeps bad habits from setting in. Start with where letters are pronounced, then move to the longer sounds and the rules for the noon with no vowel."
        ],
        links: [["/tajweed", "Tajweed lessons"], ["/tajweed/practice", "Tajweed practice"]]
      },
      {
        h2: "Understand and remember what you read",
        p: [
          "When reading feels comfortable, bring in the meaning. Word-by-word meanings and classical tafsir sit next to the verse, so you do not have to leave the page. For memorizing, the Shams Method breaks a verse into small steps and reminds you when to review.",
          "A simple plan beats an ambitious one. Choose a fixed time, a small portion and keep it for a month before you adjust."
        ],
        links: [["/shams", "Shams Method"], ["/quran-tafsir", "Understand with tafsir"], ["/memorize-quran", "Memorize the Quran"]]
      }
    ],
    stepsTitle: "Your first month in five steps",
    steps: [
      { title: "Learn letters and vowels", body: "Go through the Arabic letters and short vowels until you can read a short word without help." },
      { title: "Read with audio", body: "Pick one short surah, listen to a verse, then read it aloud while following the text." },
      { title: "Add one tajweed rule a week", body: "Take a single lesson, practice it on the surah you already know, then move on." },
      { title: "Look at the meaning", body: "Read the translation and the word-by-word meaning of the verses you practiced." },
      { title: "Fix a daily slot", body: "Choose a time you can keep, even if it is only fifteen minutes, and mark your progress." }
    ],
    faqTitle: "Questions about learning the Quran",
    faq: [
      { q: "Can I learn the Quran online without a teacher?", a: "You can learn a great deal on your own: reading, listening, basic tajweed, meaning and memorization. A teacher is still valuable for correcting your pronunciation, so many learners combine self-study with occasional live feedback." },
      { q: "How long does it take to learn to read the Quran?", a: "It depends on your starting point and how often you practice. Many adults can read slowly after a few weeks of regular practice, and fluent reading usually takes months. Steady short sessions help more than occasional long ones." },
      { q: "Do I need to know Arabic first?", a: "No. You can begin with the letters and sounds and learn the language gradually. Transliteration and translation are shown next to the Arabic to help you at the start." },
      { q: "Is Quran Masterclass really free?", a: "Yes. The website has no fees, no subscription and no ads. The iOS app uses the same account." },
      { q: "Should I learn tajweed before memorizing?", a: "It helps to learn the basics first, because memorizing a mistake is harder to fix later. You can do both in parallel by practicing one rule on the verses you are already learning." },
      { q: "Can children use it too?", a: "Yes, there is a simpler kids mode with large buttons. Parents should still sit with young children and guide them." }
    ],
    linksTitle: "Where to go next",
    links: [["/guides/how-to-learn-the-quran", "Guide: how to learn the Quran"], ["/guides/learn-to-read-the-quran", "Guide: learn to read the Quran"], ["/courses", "Courses"], ["/academy", "Academy"], ["/tajweed", "Tajweed"], ["/guides/daily-quran-routine", "Daily Quran routine"], ["/how", "How it works"], ["/app", "iOS app"]],
    cta: ["/quran", "Open the Quran"]
  },

  "quran-tafsir": {
    title: "Quran Tafsir Online – Understand Each Verse Step by Step",
    description: "Read tafsir beside every verse with word meanings and translation. Learn how to approach tafsir, what to read first and how to avoid common pitfalls.",
    kicker: "Quran tafsir",
    h1: "Quran tafsir online: understand what you recite",
    intro: "Quran tafsir is the explanation of the Quran: what a verse refers to, what its words mean and how scholars have understood it. Reading it next to the verse turns recitation into understanding.",
    answer: "Tafsir means explanation of the Quran. A translation gives the meaning in another language, while tafsir adds context, the background of revelation, the grammar and the views of scholars. On Quran Masterclass you can open tafsir right next to each verse, together with word-by-word meaning and translation.",
    sections: [
      {
        h2: "Translation and tafsir are not the same",
        p: [
          "A translation tries to carry the meaning of the Arabic into another language, but Arabic words often hold more than one shade. Tafsir tells you why a word was chosen, what the situation was and how earlier scholars read the verse.",
          "That is why it helps to read both. Start with the translation for the general sense, then open the tafsir for the verses that raise questions."
        ],
        links: [["/quran", "Read the Quran with translation"]]
      },
      {
        h2: "Start small and read in context",
        p: [
          "Pick a short surah you already know and read its tafsir slowly, one verse at a time. Notice the surrounding verses, because meaning is often clearer when you see what comes before and after.",
          "Word-by-word meaning is a good bridge. After a few weeks you will begin to recognise frequent words and follow more of the Arabic yourself."
        ],
        links: [["/surah/1", "Surah 1"], ["/vocab", "Quranic vocabulary"], ["/guides/understanding-the-quran-tafsir", "Guide to understanding tafsir"]]
      },
      {
        h2: "Different schools, one site",
        p: [
          "Muslims have written tafsir from many traditions. Our site offers both Sunni and Shia material and does not rank them. Read according to the school you follow, and use the source shown under each text to see where it comes from."
        ]
      },
      {
        h2: "From understanding to reflection",
        p: [
          "Understanding a verse is the first step, reflecting on it is the next. The Shams Method ends each verse with a short reflection, asking what it says about Allah, about you and what you will take with you today. This keeps tafsir from staying purely academic."
        ],
        links: [["/shams", "Shams Method"], ["/shams/adab", "Etiquette of the Quran"]]
      }
    ],
    stepsTitle: "How to read tafsir in five steps",
    steps: [
      { title: "Read the verse in Arabic", body: "Listen to it once and read along before looking at any explanation." },
      { title: "Read the translation", body: "Get the general sense and note anything that is unclear." },
      { title: "Check the word meanings", body: "See how the individual words are built and how often you meet them elsewhere." },
      { title: "Open the tafsir", body: "Read context, background and the scholar's explanation. The source is shown." },
      { title: "Write one sentence", body: "Note what the verse means for you today, then return to it later." }
    ],
    faqTitle: "Questions about tafsir",
    faq: [
      { q: "What is the difference between tafsir and translation?", a: "A translation renders the meaning in another language. Tafsir explains the verse: context, vocabulary, grammar and scholarly interpretations." },
      { q: "Which tafsir should a beginner read?", a: "Choose one that is written clearly and keeps to the point, and read a few verses at a time. The tafsir offered on our site shows its source, so you can look up the full work later." },
      { q: "Is tafsir available in my language?", a: "The interface is available in 14 languages. The availability of tafsir texts depends on the source, so some texts may appear only in certain languages." },
      { q: "Can I understand the Quran without knowing Arabic?", a: "You can understand a lot through translation and tafsir, and learning the language over time deepens it. Word-by-word meaning helps you bridge the two." },
      { q: "Does the site follow one school?", a: "No. Both Sunni and Shia content are offered. For legal questions, ask a scholar of the school you follow." },
      { q: "Is tafsir a replacement for studying with a scholar?", a: "No. Online reading is a good start and a good companion, but a qualified teacher can answer your questions and guide you further." }
    ],
    linksTitle: "Related pages",
    links: [["/quran", "All surahs"], ["/surah/2", "Surah 2"], ["/vocab", "Quranic vocabulary"], ["/guides/understanding-the-quran-tafsir", "Guide: understanding tafsir"], ["/shams", "Shams Method"], ["/arabic", "Arabic for the Quran"], ["/nahj", "Nahj al-Balagha"], ["/islam/quran", "About the Quran"]],
    cta: ["/quran", "Read a surah with tafsir"]
  },

  "tajweed-online": {
    title: "Learn Tajweed Online – Rules, Lessons and Practice",
    description: "Learn tajweed online with short lessons and practice: makharij, qalqalah, madd and noon sakinah. Where to start and how to improve without a teacher.",
    kicker: "Tajweed online",
    h1: "Learn tajweed online, one rule at a time",
    intro: "Tajweed is how you give every letter of the Quran its right sound. You can learn tajweed online with short lessons and practice, as long as you move in small steps and keep listening to good recitation.",
    answer: "Tajweed is the set of rules for reciting the Quran with correct pronunciation: where each letter comes from, which sounds are held, and how certain letters change each other. A good online order is letter origins first, then qalqalah, the long sounds (madd) and the rules of the noon with no vowel. Quran Masterclass offers lessons and practice for these topics for free.",
    sections: [
      {
        h2: "What tajweed covers",
        p: [
          "Tajweed has two sides. One is the correct sound of single letters, called makharij and sifat. The other is how sounds behave together, such as holding a vowel longer or blending a noon into the next letter.",
          "You do not need all of it at once. A reader who knows the main rules already recites far more accurately."
        ],
        links: [["/tajweed/makharij", "Makharij"], ["/tajweed/madd", "Madd"]]
      },
      {
        h2: "A sensible order to learn",
        p: [
          "Begin with makharij so you can tell similar letters apart. Then learn qalqalah, which is short and easy to hear, followed by the types of madd. After that, take the rules for noon sakinah and tanween and for meem sakinah.",
          "Each lesson works best when you immediately practice it on a surah you know."
        ],
        links: [["/tajweed/qalqalah", "Qalqalah"], ["/tajweed/nun-sakinah-izhar", "Noon sakinah"], ["/tajweed/mim-sakinah", "Meem sakinah"]]
      },
      {
        h2: "How to practice without a teacher",
        p: [
          "Listen to a verse several times with a clear reciter, then record yourself and compare. Slow reciters are useful here, because you can hear each sound. The practice section lets you apply the rules to real verses.",
          "A teacher can still catch things you cannot hear yourself, so if you can, ask someone to listen to you now and then."
        ],
        links: [["/tajweed/practice", "Tajweed practice"], ["/reciters", "Reciters"]]
      }
    ],
    stepsTitle: "Learning plan for the first weeks",
    steps: [
      { title: "Week 1: letter origins", body: "Learn where the main letters come from and practice similar pairs." },
      { title: "Week 2: qalqalah", body: "Find the five letters and practice the echoing sound on short verses." },
      { title: "Week 3: madd", body: "Learn the natural long sound first, then the other types." },
      { title: "Week 4: noon sakinah", body: "Learn the four ways of treating the silent noon and tanween." },
      { title: "Week 5: meem sakinah", body: "Finish with the rules for the silent meem and then revise everything on one surah." }
    ],
    faqTitle: "Questions about tajweed",
    faq: [
      { q: "Can I learn tajweed online without a teacher?", a: "You can learn the rules and practice a lot on your own. For fine details of pronunciation a teacher who hears you is hard to replace, so treat online lessons as a strong foundation." },
      { q: "How long does it take to learn tajweed?", a: "The main rules can be learned in a few weeks, but applying them smoothly takes months of reading. Progress comes from repeating them on real verses." },
      { q: "Do I need to read Arabic fluently first?", a: "You should be able to read the letters and short words. If you cannot yet, begin with the Arabic reading path and add tajweed as you go." },
      { q: "Is tajweed required?", a: "Scholars discuss the degree to which it is required. Ask a scholar of the school you follow; here we simply help you learn the rules." },
      { q: "What is the best way to hear the rules?", a: "Listen to a clear, slow reciter and follow the text. Hearing the rule in real verses fixes it better than reading about it." },
      { q: "Is tajweed for kids too?", a: "Yes, but keep it playful and short. Children learn through listening and repeating." }
    ],
    linksTitle: "More on tajweed",
    links: [["/tajweed", "Tajweed lessons"], ["/tajweed/practice", "Tajweed practice"], ["/tajweed/makharij", "Makharij"], ["/tajweed/qalqalah", "Qalqalah"], ["/tajweed/madd", "Madd"], ["/guides/tajweed-for-beginners", "Guide: tajweed for beginners"], ["/arabic/read", "Arabic reading practice"], ["/courses", "Courses"]],
    cta: ["/tajweed", "Start the first lesson"]
  },

  "memorize-quran": {
    title: "Memorize the Quran (Hifz) – Method and Daily Review",
    description: "How to memorize the Quran step by step: small portions, the Shams Method, a daily review plan and how to keep what you learn. Free hifz tools.",
    kicker: "Hifz",
    h1: "Memorize the Quran with a plan you can keep",
    intro: "To memorize the Quran, you need two things: a way to learn new verses and a way to keep the old ones. Most people give up not because memorizing is hard, but because review gets ignored.",
    answer: "To memorize the Quran, learn a small portion each day, repeat it by listening and reciting, understand its meaning, and review earlier portions on a schedule. The Shams Method on Quran Masterclass walks you through each verse in steps and uses spaced repetition to tell you what is due for review today. It is free on the website and in the iOS app.",
    sections: [
      {
        h2: "The Shams Method in short",
        p: [
          "Each verse goes through seven steps: listen, build the verse up from its end, look at each word, work with the meaning and memory hooks, read the tafsir, recite with fading cues and finally reflect. Building from the end means the last words are the most familiar and the verse holds together naturally.",
          "The method was developed by Nami Shams and is built into the site, so you do not need to keep track of the steps yourself."
        ],
        links: [["/shams/method", "How the method works"], ["/shams", "Start the Shams Method"]]
      },
      {
        h2: "Review matters more than new verses",
        p: [
          "A verse learned today is partly forgotten in a week without review. Spaced repetition brings verses back at growing intervals, so each review is short. Open the daily list, recite from memory, reveal the text and rate yourself honestly.",
          "If your review list grows too long, pause new memorizing until it is back under control."
        ],
        links: [["/plan", "Your plan"], ["/today", "Today"]]
      },
      {
        h2: "Choose where to begin",
        p: [
          "Many learners begin with the short surahs at the end of the Quran, since they are short, often already familiar and good for building the habit. Others start with a surah they love. Both are fine, and you can change later.",
          "Listening to the same reciter every time helps your ear, so choose one and stay with them for a while."
        ],
        links: [["/guides/juz-amma-learning-plan", "Juz Amma plan"], ["/shams/mutashabihat", "Similar verses"], ["/reciters", "Reciters"]]
      },
      {
        h2: "Understand what you memorize",
        p: [
          "Verses with meaning stick longer. Spend a minute on the word meanings and the tafsir before you repeat a verse, and connect it to something in your life. This is also a good habit for the way you treat the Quran in general."
        ],
        links: [["/shams/adab", "Etiquette"], ["/quran-tafsir", "Tafsir"]]
      }
    ],
    stepsTitle: "Your daily hifz routine",
    steps: [
      { title: "Review first", body: "Open today's review list and recite what is due from memory." },
      { title: "Choose a small portion", body: "Take one to three short verses, or what you can hold in about twenty minutes." },
      { title: "Go through the steps", body: "Listen, build from the end, learn the words, read the meaning and the tafsir." },
      { title: "Recite with fading cues", body: "Recite first with first-letter cues, then without." },
      { title: "Rate and reflect", body: "Rate yourself honestly and write one sentence of reflection." }
    ],
    faqTitle: "Questions about memorizing",
    faq: [
      { q: "How long does it take to memorize the Quran?", a: "It varies widely with time, age, background and consistency. Instead of aiming for a date, focus on a daily portion and a steady review." },
      { q: "Can adults memorize the Quran?", a: "Yes. Adults often have less time but more understanding and discipline. Smaller daily portions and regular review work well." },
      { q: "How much should I memorize each day?", a: "Start small, for example one to three short verses, and increase only if review stays comfortable." },
      { q: "How do I stop forgetting what I memorized?", a: "Review on a schedule and recite from memory, not from the text. Use the daily review list, and revisit older surahs in your prayers." },
      { q: "Do I need a teacher for hifz?", a: "A teacher who hears your recitation is very valuable. Online tools support daily practice and review but do not replace a teacher's correction." },
      { q: "Is there a cost?", a: "No. The website is free and the iOS app uses the same account." }
    ],
    linksTitle: "Tools and guides",
    links: [["/shams", "Shams Method"], ["/shams/method", "Method explained"], ["/plan", "Review plan"], ["/khatm", "Khatm planner"], ["/guides/how-to-memorize-the-quran", "Guide: how to memorize the Quran"], ["/guides/juz-amma-learning-plan", "Juz Amma plan"], ["/tajweed", "Tajweed"], ["/app", "iOS app"], ["/surah/112", "Surah 112"]],
    cta: ["/shams", "Start the Shams Method"]
  },

  "quran-radio": {
    title: "Quran Radio Online – Continuous Recitation to Listen",
    description: "Listen to Quran radio online: continuous recitation by different reciters. How to use it for background listening, study and calm. Free, no ads.",
    kicker: "Quran radio",
    h1: "Quran radio online: recitation that keeps playing",
    intro: "Quran radio is a stream of recitation that plays continuously, so you do not need to choose a surah each time. It suits moments when you want the Quran in the background: at your desk, in the kitchen, or while you wind down.",
    answer: "Quran radio plays Quran recitation without interruption, so you can simply press play and listen. On Quran Masterclass you can open the radio on the website or in the iOS app and choose among available reciters; it is free and has no ads. If you want to follow a specific surah or learn, use the surah pages instead.",
    sections: [
      {
        h2: "When radio is the right choice",
        p: [
          "Radio is best for listening without effort: while commuting, doing chores or working. It fills a room with recitation and gives your day a calm rhythm.",
          "If you want to understand or memorize, a radio stream is less useful because you cannot choose the verse. Then it is better to open a surah and play it verse by verse."
        ],
        links: [["/radio", "Open the radio"], ["/quran", "Open a surah instead"]]
      },
      {
        h2: "Choosing a reciter",
        p: [
          "Reciters differ in speed, voice and style. Some are slow and clear, others are more melodic. Try a few and keep the one that you find easiest to listen to for a long time.",
          "Learners usually prefer slower recitation because every sound is easy to hear."
        ],
        links: [["/reciters", "Browse reciters"], ["/mishary", "Mishary"]]
      },
      {
        h2: "Radio and learning together",
        p: [
          "Even background listening helps your ear. When a verse catches your attention, look it up and open its page to read the translation and tafsir. Over time, familiar passages become easier to read and to memorize."
        ],
        links: [["/search", "Search the Quran"], ["/memorize-quran", "Memorize the Quran"]]
      }
    ],
    stepsTitle: "Using Quran radio",
    steps: [
      { title: "Open the radio", body: "Go to the radio page on the website or in the app." },
      { title: "Choose a reciter", body: "Pick a voice and speed that you find calm." },
      { title: "Press play", body: "Keep it in the background or in the foreground, as suits you." },
      { title: "Look up verses you liked", body: "Use search to find a verse and open its page." },
      { title: "Return to a surah to learn", body: "Switch to verse-by-verse mode when you want to study." }
    ],
    faqTitle: "Questions about Quran radio",
    faq: [
      { q: "Is the Quran radio free?", a: "Yes, with no ads and no subscription." },
      { q: "Can I listen on my phone?", a: "Yes, in the browser and in the iOS app." },
      { q: "Is the radio live?", a: "It is a continuous stream of recitation. Check the radio page for the details of each station." },
      { q: "Can I choose the surah?", a: "A radio plays what the stream plays. To pick a surah, use the Quran pages and play it with the reciter of your choice." },
      { q: "Can I use it for learning?", a: "It helps your ear, but for learning use the verse-by-verse mode with text and meaning." },
      { q: "Is it okay to listen without understanding?", a: "Listening is a good habit by itself, and many people pair it with reading the meaning at another time." }
    ],
    linksTitle: "Keep listening",
    links: [["/radio", "Quran radio"], ["/listen-quran", "Listen to the Quran"], ["/reciters", "Reciters"], ["/quran", "All surahs"], ["/surah/36", "Surah 36"], ["/duas", "Duas"], ["/app", "iOS app"]],
    cta: ["/radio", "Play the radio"]
  },

  "listen-quran": {
    title: "Listen to the Quran Online – Surah Audio by Reciter",
    description: "Listen to the Quran online by surah or verse by verse, pick a reciter and follow with translation. Tips for listening to learn, not only to hear.",
    kicker: "Quran audio",
    h1: "Listen to the Quran online, surah by surah or verse by verse",
    intro: "You can listen to the Quran online in two ways: a whole surah in one go, or a single verse at a time. Which one is better depends on whether you want to relax, learn the sounds or memorize.",
    answer: "On Quran Masterclass you can listen to all 114 surahs online, choose a reciter and play each verse separately, repeat it or loop a passage. The text, transliteration and translation stay beside the audio, so you can follow along. Listening is free on the website and in the iOS app.",
    sections: [
      {
        h2: "Whole surah or one verse?",
        p: [
          "A whole surah is good for listening with calm and for hearing the flow. A single verse on repeat is better for learning, because you can hear every sound and say it back.",
          "You can switch between the two on the same page."
        ],
        links: [["/quran", "All surahs"], ["/surah/18", "Surah 18"]]
      },
      {
        h2: "Find the reciter that suits you",
        p: [
          "Different reciters make the same text sound different. For learning, a clear, slower voice helps. For relaxing, many people prefer a melodic style. Try several, then stay with one for a while to train your ear."
        ],
        links: [["/reciters", "All reciters"], ["/reciter-path", "Reciter path"]]
      },
      {
        h2: "Listen with the text in front of you",
        p: [
          "Listening while reading ties the sound to the written word. Each word lights up while it is recited, and you can open the meaning beside it. Even if you do not know Arabic, this slowly builds recognition.",
          "To use audio for memorizing, follow the steps of the Shams Method."
        ],
        links: [["/shams", "Shams Method"], ["/quran-tafsir", "Tafsir"]]
      }
    ],
    stepsTitle: "How to listen well",
    steps: [
      { title: "Choose a surah", body: "Start with one you want to know better." },
      { title: "Choose a reciter", body: "Keep to one voice for a few days." },
      { title: "Listen once without stopping", body: "Get the shape of the surah." },
      { title: "Go verse by verse", body: "Repeat each verse, slow it down if needed, and read along." },
      { title: "Read the meaning", body: "Finish by reading the translation of what you heard." }
    ],
    faqTitle: "Questions about listening",
    faq: [
      { q: "Can I download the audio?", a: "The site streams the recitations. Check the player on each page for the options available." },
      { q: "Which reciter is best for beginners?", a: "A slow, clear reciter. Try the options on the reciters page and see which one you can follow most easily." },
      { q: "Can I listen with translation?", a: "Yes, the translation and transliteration are shown with each verse." },
      { q: "Does the audio work in the app?", a: "Yes, the iOS app uses the same account and offers the same recitations." },
      { q: "Is it free?", a: "Yes. No fees and no ads." },
      { q: "Can I loop a verse?", a: "Yes, you can repeat a verse or loop a passage for learning." }
    ],
    linksTitle: "More to explore",
    links: [["/quran", "Quran"], ["/reciters", "Reciters"], ["/radio", "Quran radio"], ["/surah/1", "Surah 1"], ["/surah/67", "Surah 67"], ["/shams", "Shams Method"], ["/duas", "Duas"], ["/app", "iOS app"]],
    cta: ["/quran", "Choose a surah"]
  },

  tawbah: {
    title: "Tawbah – How to Return to Allah, Gently and Step by Step",
    description: "A warm, practical guide to tawbah: coming back to prayer, wudu, duas and learning, at your own pace. No judgment and no rulings, just next steps.",
    kicker: "Tawbah",
    h1: "Tawbah: coming back, one small step at a time",
    intro: "Tawbah means turning back to Allah. If you have been away from prayer or the Quran, or if something weighs on you, you can begin again today, with a very small step.",
    answer: "Tawbah is the act of returning to Allah. In practice it often begins with something simple: a sincere intention to turn back, making wudu, praying even a little, and asking in dua. This page offers practical next steps and links to the tools on our site; it does not give rulings, and for questions of your own situation you can speak to a scholar of the school you follow.",
    sections: [
      {
        h2: "You can begin where you are",
        p: [
          "You do not need to be perfect to return, and you do not need to fix everything at once. Many people wait for the right moment, but the right moment is often the one in which you feel the wish to change. Start with a small, honest step you can keep.",
          "We do not know your story, and this site does not judge it. We only offer practical help."
        ]
      },
      {
        h2: "Return to prayer gently",
        p: [
          "If you have stopped praying, you can learn or refresh the prayer step by step. Begin with one prayer a day if that is what you can manage, and add gradually. Prayer times and the qibla direction are available for your location.",
          "If you need to relearn how to make wudu, there is a step-by-step trainer."
        ],
        links: [["/salah", "Learn salah"], ["/wudu", "Wudu trainer"], ["/prayer", "Prayer times"]]
      },
      {
        h2: "Make dua in your own words",
        p: [
          "Asking Allah does not need perfect Arabic. You can use the written duas, including those for forgiveness, or speak from your heart in your own language. The dua generator helps you put together a personal dua when you are not sure where to start."
        ],
        links: [["/duas", "Duas"], ["/dua-generator", "Dua generator"], ["/names", "99 Names of Allah"]]
      },
      {
        h2: "Reconnect with the Quran",
        p: [
          "Listening is a soft way back. Play a short surah, read the translation, and notice how you feel. When you are ready, join a gentle routine of a few minutes a day.",
          "Some people find it helps to have company, such as a friend or a family member who learns with them."
        ],
        links: [["/listen-quran", "Listen to the Quran"], ["/guides/daily-quran-routine", "Daily routine"], ["/learn-quran", "Learn the Quran"]]
      }
    ],
    stepsTitle: "Five small steps",
    steps: [
      { title: "Make the intention", body: "Say to yourself, and to Allah, that you want to return." },
      { title: "Make wudu", body: "Take a moment, make wudu, and sit quietly." },
      { title: "Pray what you can", body: "Pray even a short prayer, and increase over time." },
      { title: "Ask in dua", body: "Use a written dua or your own words." },
      { title: "Choose one habit", body: "Pick one small habit, like five minutes of listening, and keep it for a week." }
    ],
    faqTitle: "Questions people ask",
    faq: [
      { q: "Where do I start if I have been away for a long time?", a: "Start with the smallest step you can do today: a sincere intention, wudu and a short prayer. You can build slowly from there." },
      { q: "Do I need to be perfect before I come back?", a: "No. Coming back is the beginning, not the end. Learn at your own pace." },
      { q: "I forgot how to pray. What can I do?", a: "Use the guided salah lessons and the wudu trainer to relearn step by step. Nobody is watching your progress but you." },
      { q: "Is there a special dua for forgiveness?", a: "Yes, you can find duas for forgiveness on our duas page and use your own words as well." },
      { q: "Can this page tell me what is allowed or not in my situation?", a: "No. We do not give rulings. For your own case, speak to a scholar or teacher of the school you follow." },
      { q: "I feel ashamed. Is there something gentle I can do?", a: "Start with listening to the Quran and short duas. Speak with someone you trust if you can." }
    ],
    linksTitle: "Helpful pages",
    links: [["/salah", "Learn salah"], ["/wudu", "Wudu trainer"], ["/duas", "Duas"], ["/dua-generator", "Dua generator"], ["/prayer", "Prayer times"], ["/names", "99 Names of Allah"], ["/listen-quran", "Listen to the Quran"], ["/islam", "About Islam"], ["/guides/daily-quran-routine", "Daily Quran routine"]],
    cta: ["/duas", "Open the duas"]
  },

  "learn-salah": {
    title: "How to Pray Salah for Beginners – Learn Step by Step",
    description: "Learn salah as a beginner: what to prepare, the order of the prayer, what to recite and how to build a habit. Free lessons and prayer times.",
    kicker: "Salah",
    h1: "Learn salah as a beginner: from first prayer to a habit",
    intro: "If you want to learn salah, you do not have to know everything before you start. This page shows an order that makes the prayer manageable, and it links to the lessons, the wudu trainer and prayer times on our site.",
    answer: "To learn salah as a beginner, first learn how to make wudu and where the qibla is, then learn the movements of one prayer, and add the recitations one by one, starting with the opening surah. Prayer times for your location tell you when each prayer begins. Details differ between schools, so follow the one you belong to; our guides cover both Sunni and Shia ways.",
    sections: [
      {
        h2: "What you need before you pray",
        p: [
          "Prepare three things: wudu, a clean place and the direction of the qibla. Prayer times depend on your location, so check them each day.",
          "Do not worry about perfect Arabic at the beginning. Learn the meaning of what you say in a language you know, and the Arabic grows with time."
        ],
        links: [["/wudu", "Wudu trainer"], ["/prayer", "Prayer times and qibla"]]
      },
      {
        h2: "Learn one prayer first",
        p: [
          "Many people start with the two-unit prayer, because it contains all the movements. Once that feels natural, the longer prayers only repeat the same pattern.",
          "The lesson on our site guides you through standing, bowing, prostrating and sitting, with the words for each."
        ],
        links: [["/salah", "Salah lessons"], ["/islam/prayer-sunni", "Prayer (Sunni)"], ["/islam/prayer-shia", "Prayer (Shia)"]]
      },
      {
        h2: "Learn the words slowly",
        p: [
          "Start with the opening surah, since it is recited in every unit, and a short surah. Listen to the recitation, repeat, and read the meaning, so the words are not just sounds. You can add the other phrases one at a time."
        ],
        links: [["/surah/1", "Surah 1"], ["/surah/112", "Surah 112"], ["/listen-quran", "Listen"]]
      },
      {
        h2: "Make it a habit",
        p: [
          "Habits come from small repeatable actions. Attach your prayer to something in your day, like a meal, and use the reminder of prayer times. If you miss a prayer, return at the next one without despair."
        ],
        links: [["/learn-wudu", "Learn wudu"], ["/tawbah", "Returning gently"]]
      }
    ],
    stepsTitle: "Your first week of salah",
    steps: [
      { title: "Day 1: wudu", body: "Practice the order of wudu until you can do it without help." },
      { title: "Day 2: qibla and times", body: "Check today's prayer times and find the direction." },
      { title: "Day 3: movements", body: "Walk through one prayer without words, only the positions." },
      { title: "Day 4: the opening surah", body: "Listen, repeat and read the meaning of the first surah." },
      { title: "Day 5 to 7: pray together", body: "Combine the parts in one prayer each day, then add others." }
    ],
    faqTitle: "Questions about learning salah",
    faq: [
      { q: "Can I learn to pray online?", a: "Yes, you can learn the steps and the words online. Ask someone to watch you once, if you can, to confirm your positions." },
      { q: "Do I need to know Arabic to pray?", a: "The recitation is in Arabic, which you learn gradually. Scholars of each school address what to do while you are still learning; ask one you trust." },
      { q: "Are there differences between Sunni and Shia prayer?", a: "Yes, there are some differences in details. We offer both descriptions and you can follow the one of your school." },
      { q: "How many prayers are there each day?", a: "Five. Prayer times for your location are shown on the prayer page." },
      { q: "I missed prayers. What should I do?", a: "Begin again with the next prayer. For questions about making up missed prayers, ask a scholar of your school." },
      { q: "Can children learn with this?", a: "Yes, with a parent or teacher beside them, using short steps." }
    ],
    linksTitle: "Related pages",
    links: [["/salah", "Salah"], ["/wudu", "Wudu"], ["/prayer", "Prayer times"], ["/duas", "Duas"], ["/islam/prayer-sunni", "Prayer (Sunni)"], ["/islam/prayer-shia", "Prayer (Shia)"], ["/learn-islam", "Learn about Islam"], ["/surah/1", "Surah 1"]],
    cta: ["/salah", "Start learning salah"]
  },

  "learn-wudu": {
    title: "How to Make Wudu Step by Step – Guide for Beginners",
    description: "Learn how to make wudu in the right order, with common mistakes to watch for and a practice trainer. Written for beginners and new Muslims.",
    kicker: "Wudu",
    h1: "How to make wudu, step by step",
    intro: "Wudu is the washing you do before prayer and other acts of worship. Learning the order once, with a bit of practice, makes it easy to do anywhere.",
    answer: "Wudu is a ritual washing of certain parts of the body done before prayer. The usual sequence begins with the intention, then washing the hands, rinsing the mouth and nose, washing the face and arms, wiping the head and washing the feet, though details vary between schools. Our trainer shows each step in order so you can practice until it feels natural.",
    sections: [
      {
        h2: "The general order",
        p: [
          "Most descriptions follow the same pattern: begin with the intention and the name of Allah, wash your hands, rinse your mouth and nose, wash your face, wash your arms, wipe your head and finally take care of your feet.",
          "Schools differ in some details, such as how the feet are treated or how many times each part is washed. Follow the school you belong to; our pages describe the views without ranking them."
        ],
        links: [["/wudu", "Wudu trainer"], ["/islam/prayer-sunni", "Sunni description"], ["/islam/prayer-shia", "Shia description"]]
      },
      {
        h2: "Mistakes that beginners often make",
        p: [
          "Common issues are rushing, forgetting a part, wasting water and being unsure whether wudu is still valid. Going slowly through the order in the trainer for a few days fixes most of these.",
          "If you are unsure about a specific case, such as bandages or a medical condition, ask a scholar rather than a website."
        ]
      },
      {
        h2: "After wudu: what next",
        p: [
          "Wudu is usually followed by prayer. You can learn the prayer with our lessons and check the times for your city. Many people also say a short dua after wudu; you can find duas on our duas page."
        ],
        links: [["/salah", "Learn salah"], ["/prayer", "Prayer times"], ["/duas", "Duas"]]
      }
    ],
    stepsTitle: "Practice plan",
    steps: [
      { title: "Read the order once", body: "Go through the trainer from beginning to end without hurrying." },
      { title: "Practice with the screen", body: "Follow along with the trainer as you perform the steps." },
      { title: "Practice without the screen", body: "Try the whole sequence from memory and check yourself." },
      { title: "Note your doubts", body: "Write down anything unclear and ask a teacher of your school." },
      { title: "Link it to prayer", body: "Make wudu before your next prayer." }
    ],
    faqTitle: "Questions about wudu",
    faq: [
      { q: "Is the order of wudu fixed?", a: "Most descriptions follow the same order, but schools differ in details. Follow the school you belong to." },
      { q: "What breaks wudu?", a: "Scholars list several things that nullify it, and the lists differ between schools. Please consult a scholar of your school for the exact list." },
      { q: "Do Sunni and Shia make wudu in the same way?", a: "There are differences, for example regarding the feet. We describe both and recommend following your own school." },
      { q: "Can children learn wudu?", a: "Yes, they can learn it by following the steps with a parent." },
      { q: "Do I need to say anything?", a: "Many people begin with the name of Allah and say a dua afterwards. See the duas page." },
      { q: "Is wudu needed to read the Quran on a phone?", a: "Opinions of scholars vary on this; ask a scholar of your school." }
    ],
    linksTitle: "Related pages",
    links: [["/wudu", "Wudu trainer"], ["/salah", "Salah"], ["/prayer", "Prayer times"], ["/duas", "Duas"], ["/learn-salah", "Learn salah"], ["/islam/prayer-sunni", "Prayer (Sunni)"], ["/islam/prayer-shia", "Prayer (Shia)"], ["/learn-islam", "Learn about Islam"]],
    cta: ["/wudu", "Open the wudu trainer"]
  },

  "learn-islam": {
    title: "Learn About Islam for Beginners – Where to Start",
    description: "New to Islam or just curious? A calm starting guide to beliefs, the Quran, prayer and daily life, with Sunni and Shia views, at your own pace.",
    kicker: "Learn about Islam",
    h1: "Learn about Islam: a calm place to start",
    intro: "If you want to learn about Islam, whether you are curious, newly Muslim or returning, it helps to go in small steps. This page suggests an order and links to short, neutral introductions on our site.",
    answer: "Islam is a monotheistic faith whose followers, Muslims, believe in one God and in the Quran as His revelation. A beginner can start with the basics of belief, the pillars of practice, the Quran and the life of the Prophet, then learn prayer and daily habits. Muslims belong to different schools; our site presents Sunni and Shia content side by side and does not rank them.",
    sections: [
      {
        h2: "Begin with the basics",
        p: [
          "Start with who Muslims believe Allah is, what the Quran is and who the Prophet was. These pages are short and written for beginners.",
          "Take your time. Nothing here has to be learned in a hurry."
        ],
        links: [["/islam/islam", "What is Islam"], ["/islam/quran", "The Quran"], ["/islam/prophet", "The Prophet"], ["/islam/iman", "Faith"]]
      },
      {
        h2: "Prayer and daily practice",
        p: [
          "Practice gives shape to belief. Prayer, fasting in Ramadan, Hajj and daily habits are explained in simple steps. For prayer there are separate introductions for Sunni and Shia practice.",
          "If you are ready to try, the wudu and salah lessons guide you through your first prayer."
        ],
        links: [["/islam/prayer-sunni", "Prayer (Sunni)"], ["/islam/prayer-shia", "Prayer (Shia)"], ["/islam/ramadan", "Ramadan"], ["/islam/hajj", "Hajj"], ["/islam/daily", "Daily life"]]
      },
      {
        h2: "Schools and differences",
        p: [
          "Muslims follow different schools of law and thought. A beginner does not need to choose right away. Read about the main schools, learn from teachers you trust and ask questions."
        ],
        links: [["/islam/madhahib", "Schools of Islam"], ["/islam/halal-haram", "Halal and haram"]]
      },
      {
        h2: "Learn the Quran at your own pace",
        p: [
          "When you feel ready, begin reading and listening to the Quran with translation. You can learn to read Arabic if you want to, but you can also start with listening and meaning."
        ],
        links: [["/learn-quran", "Learn the Quran"], ["/quran", "Read the Quran"], ["/arabic", "Arabic reading"]]
      }
    ],
    stepsTitle: "A gentle path",
    steps: [
      { title: "Read the introduction", body: "Start with what Islam is and what Muslims believe." },
      { title: "Meet the Quran", body: "Listen to a short surah and read the translation." },
      { title: "Learn about the Prophet", body: "Read a short introduction to his life." },
      { title: "Learn wudu and prayer", body: "Use the lessons when you feel ready." },
      { title: "Find people and teachers", body: "Look for a mosque, a teacher or a community that welcomes questions." }
    ],
    faqTitle: "Questions from beginners",
    faq: [
      { q: "Where should I start?", a: "With the short introductions: what Islam is, the Quran and the Prophet. Then add prayer and daily practice slowly." },
      { q: "I am new to Islam. What should I learn first?", a: "Many new Muslims begin with the declaration of faith, wudu and prayer, and a few short surahs. Take it step by step and find a teacher or community if you can." },
      { q: "What is the difference between Sunni and Shia?", a: "They are two main branches with historical and legal differences. Our pages present both neutrally." },
      { q: "Do I need to learn Arabic?", a: "You can start in your own language. Learning to read Arabic comes over time." },
      { q: "Is this site a substitute for a scholar?", a: "No. It is an introduction. For rulings and personal questions please ask a qualified scholar." },
      { q: "Is it free?", a: "Yes, there are no fees and no ads." }
    ],
    linksTitle: "Where to go next",
    links: [["/islam", "Islam overview"], ["/islam/islam", "What is Islam"], ["/islam/quran", "The Quran"], ["/islam/prayer-sunni", "Prayer (Sunni)"], ["/islam/prayer-shia", "Prayer (Shia)"], ["/learn-salah", "Learn salah"], ["/learn-wudu", "Learn wudu"], ["/duas", "Duas"], ["/names", "99 Names of Allah"]],
    cta: ["/islam", "Start with the basics"]
  }
};

export default hubs;
