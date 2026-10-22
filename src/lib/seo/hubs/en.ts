import type { Hub, HubId } from "../types";

const hubs: Record<HubId, Hub> = {
  "learn-quran": {
    title: "How to Learn the Quran Online – Free Step-by-Step Path",
    description: "Learn the Quran online for free: start with the letters, add tajweed, then meaning and memorization. A clear path for beginners and adults.",
    kicker: "Learn the Quran",
    h1: "How to learn the Quran online, step by step",
    intro: "If you are wondering how to learn the Quran, the answer is mostly a question of order: letters first, then reading, then tajweed, then the short surahs, all held together by a small daily routine. This guide walks you through each stage for adults, children and new Muslims, and every step can be done for free on the Quran Masterclass website.",
    answer: "To learn the Quran, start with the Arabic letters and vowel signs, read short words aloud, then read verses along with a reciter, add the basic tajweed rules and memorize the short surahs, ideally in a daily session of about 15 to 25 minutes. Quran Masterclass offers every one of these steps for free on its website: a reading course, tajweed lessons, all 114 surahs with audio, translation and tafsir, and the Shams Method for memorizing. The iOS app uses the same account.",
    sections: [
      {
        h2: "Where to start learning the Quran",
        p: [
          "Most beginners do not get stuck for lack of talent but because they start in the wrong place, for example memorizing from transliteration before they can read. A more reliable order is the script, then reading aloud, correct pronunciation, short surahs with their meaning, and memorization on top.",
          "If you can already read slowly, take the placement test in the reading course and skip what you know; if not, simply begin with the first lesson, which assumes nothing and suits adults who start late as well as children."
        ],
        links: [["/arabic", "Arabic reading course"], ["/how", "How Quran Masterclass works"]]
      },
      {
        h2: "How to learn to read the Quran in Arabic",
        p: [
          "The Quranic script has 28 letters, most of which change shape depending on where they stand in a word, plus the vowel signs, the sukun, the shadda and the signs for lengthening. The reading course teaches them in lessons of about five minutes: learning cards first, then varied exercises, and whatever you get wrong comes back at the end of the lesson until it sticks.",
          "Say every sound out loud. The throat letters and the heavy letters are best learned by ear: play a verse, listen, repeat. By the sixth unit you read real words from Al-Fatihah, Al-Ikhlas, Al-Falaq and An-Nas, and the step-by-step reading path leads on to whole verses."
        ],
        links: [["/arabic/read", "Reading course step by step"], ["/guides/learn-to-read-the-quran", "Guide: learn to read the Quran"]]
      },
      {
        h2: "How to learn the Quran with tajweed from the start",
        p: [
          "Tajweed is the set of rules for pronouncing the Quran correctly. You do not need to master it before you begin reading, but it pays to bring it in early, because a sound practised wrongly for months is hard to unlearn. Once you know the letters, learn where each one is pronounced, the makharij, and then add one rule a week.",
          "Every lesson explains a rule with examples and a short quiz, and the practice section asks you to find the rule in real verses. Apply each new rule straight away to a surah you can already read, so that it becomes part of your recitation rather than a fact you merely know."
        ],
        links: [["/tajweed", "Tajweed lessons"], ["/tajweed/makharij", "Makharij: where letters come from"], ["/tajweed-online", "Learn tajweed online"]]
      },
      {
        h2: "Short surahs first: listen, read, repeat",
        p: [
          "When reading starts to flow, move to the short surahs at the end of the Quran, known as Juz Amma (surahs 78 to 114). They are short, they are recited in prayer, and many people already know a few of them by ear. A good first set is Al-Fatihah, Al-Ikhlas, Al-Falaq and An-Nas.",
          "Every surah page shows the Arabic text, transliteration, translation and word-by-word meaning, and each word is highlighted while it is recited. Choose a reciter and a speed, repeat a verse or loop a passage, and use the Learn mode, which pauses after each verse so you can read it back yourself."
        ],
        links: [["/surah/1", "Al-Fatihah"], ["/surah/112", "Al-Ikhlas"], ["/quran", "All 114 surahs"], ["/guides/juz-amma-learning-plan", "Juz Amma learning plan"]]
      },
      {
        h2: "How to learn the Quran with understanding",
        p: [
          "Reading without understanding is a legitimate start, but meaning is what keeps most learners going. Use the translation for the general sense of a verse, the word-by-word meaning to see what each word contributes, and the tafsir for context and explanation. Every tafsir text names its source.",
          "Over time, vocabulary makes the biggest difference: many words recur throughout the Quran, so each one you learn helps you recognise more verses. The vocabulary trainer brings the most common ones back as flashcards after one, two, four, eight and sixteen days."
        ],
        links: [["/quran-tafsir", "Understanding with tafsir"], ["/vocab", "Quranic vocabulary"], ["/guides/learn-quranic-arabic-vocabulary", "Guide: Quranic vocabulary"]]
      },
      {
        h2: "Learning as an adult, with children or as a new Muslim",
        p: [
          "Adults often feel embarrassed to start with the alphabet. There is no need: people learn to read the Quran at every age, and short daily lessons suit a busy life better than a long session once a week. Record yourself now and then to hear progress that is hard to notice day by day.",
          "Children learn best by listening and imitating. Switch on the kids mode, with its large text and star rewards, sit with your child for five or ten minutes and let them hear the same short surah many times. New Muslims can begin with listening and meaning, learn Al-Fatihah early because it is recited in every prayer, and take up the Arabic script at their own pace."
        ],
        links: [["/guides/quran-for-kids", "Quran for kids"], ["/learn-islam", "Islam for beginners"], ["/learn-salah", "Learn salah"]]
      },
      {
        h2: "Learning at home without a teacher",
        p: [
          "At home the main risk is not difficulty but irregularity. Fix a time, for example straight after one of the prayers, a quiet place and a small amount. The Today page shows what is due for review and how many days in a row you have practised.",
          "You can get a long way on your own, but a teacher hears mistakes you cannot hear yourself. Compare your own recording with the reciter in the player, and whenever you can, ask someone at your mosque or a qualified teacher to listen to you. If you prefer a fixed structure, the Madrasa school arranges the learning in stages."
        ],
        links: [["/today", "Today"], ["/guides/daily-quran-routine", "Daily Quran routine"], ["/school", "Madrasa school"]]
      }
    ],
    stepsTitle: "Your first month in six steps",
    steps: [
      { title: "Learn the letters and vowel signs", body: "Take one short lesson a day in the reading course until you can sound out a short word without help." },
      { title: "Read short words aloud", body: "Say every sound out loud and listen to a reciter for the letters you find difficult." },
      { title: "Read along with a reciter", body: "Open Al-Fatihah, play one verse in Learn mode and read it back yourself before you continue." },
      { title: "Add one tajweed rule a week", body: "Start with the makharij and practise each new rule on a surah you can already read." },
      { title: "Learn the short surahs with their meaning", body: "Work through Juz Amma with the translation and the word-by-word meaning beside the text." },
      { title: "Keep a fixed daily slot", body: "Fifteen to twenty-five minutes at the same time each day, and a look at the Today page for what is due." }
    ],
    faqTitle: "Questions about learning the Quran",
    faq: [
      { q: "How long does it take to learn to read the Quran?", a: "It depends on your starting point and how regularly you practise. With short daily lessons, slow reading is often possible within a few weeks, while fluent reading usually takes months." },
      { q: "Can I learn the Quran at home without a teacher?", a: "Yes, a great deal: reading, listening, understanding and memorizing. A teacher is still valuable for correcting pronunciation, so many learners combine self-study with occasional feedback from someone who knows tajweed." },
      { q: "What should I learn first, the Quran or Arabic?", a: "Learn to read the Arabic script first, because that is what reading the Quran requires; you do not need to speak Arabic. Quranic vocabulary can grow alongside your reading, and a full Arabic language course is there if you want to go further." },
      { q: "Can I learn the Quran in a month?", a: "In a month you can learn the letters and vowel signs, begin to read slowly and learn a few short surahs. Fluent reading, tajweed and memorizing more take longer, so treat the first month as a strong foundation rather than a finish line." },
      { q: "Can I learn the Quran just by listening?", a: "Listening trains your ear, and many people memorize short surahs this way. Learning to read as well lets you check yourself against the text, continue on your own and avoid mishearing words, so listening and reading work best together." },
      { q: "Is Quran Masterclass free?", a: "The website is free: no fees, no subscription and no ads. The iOS app uses the same account and offers an optional Pro subscription for extra features." },
      { q: "Who is behind Quran Masterclass?", a: "Quran Masterclass was founded by Nami Shams, who also developed the Shams Method for memorizing and understanding the Quran. It is operated by ICSL FZE – Islamic Coding & Software Lab in Sharjah, United Arab Emirates, and the website is privately funded." }
    ],
    linksTitle: "Where to go next",
    links: [["/guides/how-to-learn-the-quran", "Guide: how to learn the Quran"], ["/arabic", "Arabic reading course"], ["/tajweed", "Tajweed lessons"], ["/shams", "Shams Method"], ["/academy", "Academy"], ["/courses", "Courses"], ["/guides/daily-quran-routine", "Daily Quran routine"], ["/app", "iOS app"]],
    cta: ["/arabic", "Start with the first letter"]
  },

  "quran-tafsir": {
    title: "Quran Tafsir Online – Understand Each Verse Step by Step",
    description: "Read tafsir beside every verse with word meanings and translation. Learn how to approach tafsir, what to read first and how to avoid common pitfalls.",
    kicker: "Quran tafsir",
    h1: "Quran tafsir online: understand what you recite",
    intro: "Quran tafsir is the explanation of the Quran: what a verse refers to, what its words mean, in which situation it was revealed and how scholars have understood it. Reading tafsir next to the verse turns recitation into understanding, and this guide shows you how to start without getting lost.",
    answer: "Tafsir is the scholarly explanation of the Quran: it covers the meaning of words, the circumstances of revelation, grammar and the interpretations of scholars, while a translation only carries the meaning into another language. On Quran Masterclass you can open tafsir next to every verse of all 114 surahs, together with the translation and word-by-word meaning, and each text names its source and author. Reading is free on the website, and the iOS app uses the same account.",
    sections: [
      {
        h2: "What is tafsir of the Quran?",
        p: [
          "The word tafsir comes from an Arabic root meaning to explain or to uncover. A work of tafsir asks what a word means in this place, which situation a verse addresses, how it relates to other verses and what the Prophet, his companions and later scholars said about it.",
          "Tafsir is different from tadabbur, the personal reflection on what a verse means for your own life. Reflection is encouraged for every reader, but it builds on a sound understanding of the text rather than replacing it."
        ],
        links: [["/guides/understanding-the-quran-tafsir", "Guide: understanding tafsir"], ["/islam/quran", "About the Quran"]]
      },
      {
        h2: "The difference between translation and tafsir",
        p: [
          "Every translation is already an interpretation. An Arabic word can hold several shades of meaning, and the translator has to choose one. Tafsir shows you the choices behind that: why a word was understood in a certain way, which other readings exist and what grammar or context supports them.",
          "In practice, read the translation first to get the overall sense of a passage, then open the tafsir for the verses that raise a question. Reading tafsir for every verse of a long surah in one sitting tends to blur everything together; a few verses read carefully stay with you longer."
        ],
        links: [["/quran", "Read with translation"]]
      },
      {
        h2: "How to study tafsir for beginners, surah by surah",
        p: [
          "Begin with a short surah you already know, such as Al-Fatihah or one of the surahs of Juz Amma. Read it once in translation to see its overall theme, then go through it verse by verse with the tafsir open beside the text. Al-Mulk (67) is a good next step.",
          "Keep a small record as you go. The player lets you write your own note on each verse, and one sentence is enough: what the verse says, and what you take from it. After a few short surahs, choose a longer one with a clear narrative, such as Yusuf (12) or Al-Kahf (18), and read it over several days."
        ],
        links: [["/surah/1", "Al-Fatihah"], ["/surah/67", "Al-Mulk"], ["/surah/12", "Yusuf"], ["/surah/18", "Al-Kahf"]]
      },
      {
        h2: "Asbab al-nuzul and Makki and Madani verses",
        p: [
          "Asbab al-nuzul are the reported occasions of revelation: an event or a question to which a verse responded. Not every verse has one, and the reports differ in how reliable they are, which is one of the things tafsir works discuss. Scholars also stress that the meaning of a verse is not limited to the event that occasioned it.",
          "Makki and Madani describe whether a passage was revealed before or after the Prophet's migration to Madinah. Makki passages often focus on faith, the hereafter and the stories of earlier prophets; Madani passages also address community life and law. The course introducing tafsir and its sciences explains both."
        ],
        links: [["/courses", "Course: introduction to tafsir"]]
      },
      {
        h2: "Classical and modern tafsir, Sunni and Shia traditions",
        p: [
          "In the Sunni tradition, well-known classical works include al-Tabari, who gathers the early reports; al-Qurtubi, with a strong focus on legal questions; al-Razi, known for theological discussion; Ibn Kathir, who explains the Quran by the Quran, hadith and the early generations; and the concise Tafsir al-Jalalayn. In the Shia tradition, important works include al-Tusi's al-Tibyan, al-Tabarsi's Majma' al-Bayan and, in the twentieth century, Tabataba'i's al-Mizan, which also explains the Quran through the Quran.",
          "Modern tafsir often uses plainer language, arranges the explanation by theme and addresses the questions of its own time; Ma'arif al-Qur'an by Mufti Muhammad Shafi, available in English, is one example. Quran Masterclass does not rank traditions. The texts next to the verses come from published works and always show their source, so you can read according to the school you follow and ask its teachers which works they recommend."
        ],
        links: [["/islam/madhahib", "Schools of thought in Islam"], ["/nahj", "Nahj al-Balagha"]]
      },
      {
        h2: "How to read tafsir correctly: common mistakes",
        p: [
          "The most common mistake is taking a single verse out of its context. Read the verses before and after, check whether the tafsir mentions an occasion of revelation, and use the search to find other verses on the same subject. A second mistake is treating one scholar's opinion as the only possible reading; where scholars differ, good tafsir works say so.",
          "Tafsir is also not a fatwa. If a verse raises a practical question about your own life, take it to a scholar of the school you follow rather than drawing a ruling from a commentary on your own. And if a text on our site was prepared with AI assistance, it is labelled as such and marked for review by scholars."
        ],
        links: [["/search", "Search the Quran"]]
      },
      {
        h2: "How to understand the Quran without Arabic",
        p: [
          "Translation, word-by-word meaning and tafsir together give you a solid understanding even without Arabic. Two small steps deepen it over time: learning to read the script, so you can follow the recitation with your eyes, and learning the most frequent Quranic words, so you begin to recognise them yourself.",
          "Then add reflection. The last step of the Shams Method asks three simple questions about each verse: what it tells you about Allah, what it says about you and your life, and what you will take with you today. This keeps tafsir from remaining purely academic and makes study part of your day."
        ],
        links: [["/vocab", "Quranic vocabulary"], ["/arabic", "Learn to read Arabic"], ["/shams", "Shams Method"]]
      }
    ],
    stepsTitle: "How to read tafsir in six steps",
    steps: [
      { title: "Choose one surah", body: "Begin with a short surah you know and read it once in translation to see its theme." },
      { title: "Listen to the verse in Arabic", body: "Play the verse and follow the Arabic text." },
      { title: "Read the translation and word meanings", body: "Note any word or phrase that raises a question for you." },
      { title: "Open the tafsir", body: "Read the context, the background and the explanation, and check the source shown below the text." },
      { title: "Compare a second source", body: "For the verses that matter to you, switch to another tafsir to see more than one reading." },
      { title: "Write one sentence", body: "Add a short note to the verse and come back to it the next day." }
    ],
    faqTitle: "Questions about tafsir",
    faq: [
      { q: "What is the difference between tafsir and translation?", a: "A translation renders the meaning in another language and has to choose one reading. Tafsir explains the verse: its words, its context and occasion of revelation, its grammar and the interpretations of scholars." },
      { q: "Which tafsir is best for beginners?", a: "Many beginners start with a concise or abridged work and read a few verses at a time; the abridged English Ibn Kathir is a common choice. Ask a teacher of the school you follow which works suit your level, and compare the tafsirs offered in the player." },
      { q: "Can I read tafsir online in English for free?", a: "Yes. On the website you can open English tafsir next to every verse. Without an account, tafsir opens for a limited number of verses per day; a free account with a confirmed email address removes that limit and also keeps your notes and bookmarks." },
      { q: "What is Tafsir Ibn Kathir?", a: "It is the commentary of Isma'il ibn Kathir, a scholar of Damascus who died in 774 AH (1373 CE), and one of the most widely read Sunni tafsirs. It explains verses first with other verses, then with hadith and the statements of the early generations. Quran Masterclass shows an abridged English version with its source." },
      { q: "Is there Sunni and Shia tafsir?", a: "Yes. Both traditions have a long history of tafsir, and our site presents Sunni and Shia content without ranking it. The texts next to the verses always name their source and author, so you can read according to the school you follow." },
      { q: "Is tafsir available in my language?", a: "The site itself is available in 14 languages. Tafsir texts depend on what the sources offer: where no tafsir exists in your language yet, English sources are shown instead, and the player tells you so." },
      { q: "Does reading tafsir replace studying with a scholar?", a: "No. Reading online is a good start and a good companion, but a qualified teacher can answer your questions, correct misunderstandings and guide you further." }
    ],
    linksTitle: "Related pages",
    links: [["/quran", "All 114 surahs"], ["/surah/2", "Al-Baqarah"], ["/guides/understanding-the-quran-tafsir", "Guide: understanding tafsir"], ["/courses", "Courses"], ["/vocab", "Quranic vocabulary"], ["/shams", "Shams Method"], ["/arabic", "Arabic for the Quran"], ["/nahj", "Nahj al-Balagha"], ["/islam/quran", "About the Quran"]],
    cta: ["/quran", "Read a surah with tafsir"]
  },

  "tajweed-online": {
    title: "Learn Tajweed Online – Rules, Lessons and Practice",
    description: "Learn tajweed online with short lessons and practice: makharij, qalqalah, madd and noon sakinah. Where to start and how to improve without a teacher.",
    kicker: "Tajweed online",
    h1: "Learn tajweed online, one rule at a time",
    intro: "You can learn tajweed online in a clear order: first where each letter is pronounced, then the rules that change sounds, one at a time and always tested on real verses. This guide gives you that order, explains the main rules in plain words and links to the free lessons and practice on Quran Masterclass.",
    answer: "Tajweed is the set of rules for reciting the Quran with correct pronunciation: where each letter is articulated (makharij), the qualities of the letters, and how sounds change next to each other, as in the rules of noon sakinah, madd and qalqalah. A sensible online order is makharij first, then heavy and light letters, noon and meem sakinah, qalqalah and madd, and finally stopping and starting. Quran Masterclass offers these lessons with examples, quizzes and practice on real verses, free on the website; the iOS app uses the same account.",
    sections: [
      {
        h2: "Tajweed rules explained simply",
        p: [
          "Tajweed has two sides. The first is the sound of each letter on its own: where it is produced, its makhraj, and its qualities, the sifat, such as whether it is heavy or light. The second is what happens between letters: a noon that merges into the next letter, a vowel that is held longer, a consonant that echoes. Rules for where to stop and where to start again complete the picture.",
          "Tajweed is not the same as melody. Reciting in a particular melodic mode, called a maqam, is a separate art; tajweed is about pronouncing the text as it has been transmitted."
        ],
        links: [["/tajweed", "All tajweed lessons"], ["/guides/tajweed-for-beginners", "Guide: tajweed for beginners"]]
      },
      {
        h2: "Makharij: where each letter comes from",
        p: [
          "The first lesson most teachers give is the makharij, the points of articulation. They are grouped into five areas: the open space of the mouth and throat, the throat itself, the tongue, the lips and the nasal passage. Many beginners' mistakes come from letters that do not exist in their own language, for example the two kinds of h, the hamza and the ayn, or the light s and the heavy sad.",
          "Learn these pairs by ear. Play a verse slowly, listen for the letter, say it yourself and listen again. The lesson on makharij shows each group with examples, and the reading course points out the throat letters and the heavy letters from the very start."
        ],
        links: [["/tajweed/makharij", "Makharij lesson"], ["/arabic", "Arabic reading course"]]
      },
      {
        h2: "Noon sakinah, tanween and meem sakinah",
        p: [
          "A noon without a vowel, and the tanween at the end of many words, are treated in four ways depending on the letter that follows: izhar, a clear pronunciation; idgham, merging into the next letter with or without a nasal sound; iqlab, turning the noon into a meem before the letter ba; and ikhfa, a hidden noon with a light nasal sound. These rules occur constantly, so they are worth learning early.",
          "The meem without a vowel has three rules of its own: it is hidden before ba, it merges into a following meem, and it is pronounced clearly before all other letters. A doubled noon or meem always carries a nasal sound, the ghunnah, held for about two counts."
        ],
        links: [["/tajweed/nun-sakinah-izhar", "Noon sakinah: izhar"], ["/tajweed/mim-sakinah", "Meem sakinah"]]
      },
      {
        h2: "Qalqalah and madd: echo and length",
        p: [
          "Qalqalah is a slight echo on five letters, qaf, the heavy ta, ba, jim and dal, when they carry no vowel. It is easy to hear, and stronger when you stop on such a letter at the end of a verse, which makes it a good early rule for building confidence.",
          "Madd means lengthening. The natural madd holds a long a, u or i for two counts. The secondary kinds are longer and are caused by a hamza or a sukun after the long vowel; the in-depth course treats them one by one, including the forms called lazim, 'arid, lin and silah."
        ],
        links: [["/tajweed/qalqalah", "Qalqalah lesson"], ["/tajweed/madd", "Madd lesson"]]
      },
      {
        h2: "How to learn tajweed without a teacher",
        p: [
          "Online, the most effective cycle is listen, repeat, compare. Choose a reciter with a clear, measured style, lower the speed, repeat a single verse several times, then record yourself in the player and play your recording next to the reciter's. Differences you never notice while reciting become obvious when you listen back.",
          "The practice section helps you apply what you have learned: it asks you to find a rule in real verses and offers a quiz for each surah. Even so, a teacher hears what you cannot, so arrange for someone who knows tajweed to listen to you from time to time, whether at your mosque or online."
        ],
        links: [["/tajweed/practice", "Tajweed practice"], ["/reciters", "Reciters"]]
      },
      {
        h2: "Tajweed lessons for adults and new Muslims",
        p: [
          "Adults bring the sounds of their first language with them, and the tongue needs time to adapt. Short lessons, each with examples and a quiz, suit a busy day, and it helps to practise each rule for a week on a surah you already read before moving on. The first lesson covers seeking refuge and the basmala; the last brings everything together on Al-Fatihah.",
          "If you are new to Islam or have only just learned to read, start tajweed once you can read short words without help. Al-Fatihah is the natural first goal, because it is recited in every unit of the prayer, and reciting it well is something you will use every day."
        ],
        links: [["/arabic/read", "Reading course"], ["/surah/1", "Al-Fatihah"], ["/learn-salah", "Learn salah"]]
      },
      {
        h2: "Going further: tajweed in depth and the Reciter Path",
        p: [
          "Once the main rules sit, the in-depth tajweed course goes into the details: the qualities of the letters, the rules of ra, the lam in the name Allah, the two kinds of hamza at the start of a word, madd in detail, the places of a brief pause (sakt) in the Hafs reading, the stopping signs of the mushaf and the common mistakes known as lahn jali and lahn khafi.",
          "The Reciter Path leads further still, in ten levels from the makharij to the maqamat and the qira'at, with model recitations, your own recordings and tests. Its certificates confirm completed levels; they are not an ijazah, which only a qualified teacher can grant."
        ],
        links: [["/courses", "Tajweed in depth"], ["/reciter-path", "Reciter Path"]]
      }
    ],
    stepsTitle: "A six-week plan for tajweed",
    steps: [
      { title: "Week 1: makharij", body: "Learn the five areas of articulation and practise the letter pairs you tend to confuse." },
      { title: "Week 2: heavy and light letters", body: "Learn which letters are always heavy, and the sun and moon letters after the definite article." },
      { title: "Week 3: noon sakinah and tanween", body: "Learn izhar, idgham, iqlab and ikhfa, one per session, on verses you know." },
      { title: "Week 4: meem sakinah and ghunnah", body: "Add the three rules of the silent meem and the nasal sound on a doubled noon and meem." },
      { title: "Week 5: qalqalah and madd", body: "Practise the echoing letters and the natural lengthening, then the longer kinds." },
      { title: "Week 6: stopping and Al-Fatihah", body: "Learn where to stop and start again, then recite Al-Fatihah applying everything." }
    ],
    faqTitle: "Questions about tajweed",
    faq: [
      { q: "Can I learn tajweed online for free as a beginner?", a: "Yes. The tajweed lessons and the practice section are free on the website. You should be able to read the Arabic letters and short words first; if you cannot yet, start with the reading course and add tajweed as you go." },
      { q: "How long does it take to learn tajweed?", a: "The main rules can be learned in a few weeks, for example one rule a week. Applying them smoothly takes months of regular reading, because rules only become habits through repetition on real verses." },
      { q: "How can I check my tajweed?", a: "Record yourself and compare the recording with a reciter, use the quizzes and the find-the-rule practice, and ask a teacher to listen now and then. The speech recognition in the player checks whether you recited the right words; it does not judge tajweed." },
      { q: "Is online tajweed learning effective?", a: "For learning the rules and training your ear it works well, because you can repeat a verse as often as you need. Fine details of pronunciation are best corrected by a teacher who hears you, so online study and occasional live feedback complement each other." },
      { q: "Is tajweed obligatory?", a: "Scholars discuss which aspects of tajweed are required and which are recommended, and they take a learner's ability into account. For an answer that applies to you, ask a scholar of the school you follow; learning the main rules is worthwhile in any case." },
      { q: "Is tajweed the same as reciting with a melody?", a: "No. Tajweed concerns correct pronunciation, while the melodic modes, the maqamat, are a separate art. A simple recitation without any melody can have perfect tajweed." },
      { q: "Can children learn tajweed online?", a: "Yes, as long as it stays short and playful. Children pick up correct sounds mostly by listening and repeating, so let them hear a clear reciter often." }
    ],
    linksTitle: "More on tajweed",
    links: [["/tajweed", "Tajweed lessons"], ["/tajweed/practice", "Tajweed practice"], ["/tajweed/makharij", "Makharij"], ["/tajweed/qalqalah", "Qalqalah"], ["/tajweed/madd", "Madd"], ["/guides/tajweed-for-beginners", "Guide: tajweed for beginners"], ["/arabic/read", "Arabic reading course"], ["/reciter-path", "Reciter Path"]],
    cta: ["/tajweed", "Start the first lesson"]
  },

  "memorize-quran": {
    title: "Memorize the Quran (Hifz) – Method and Daily Review",
    description: "How to memorize the Quran step by step: small portions, the Shams Method, a daily review plan and how to keep what you learn. Free hifz tools.",
    kicker: "Hifz",
    h1: "Memorize the Quran with a plan you can keep",
    intro: "To memorize the Quran you need two things: a reliable way to learn new verses and a reliable way to keep the ones you have learned. Most people who give up do so not because memorizing is too hard, but because review was left to chance, and this guide shows a plan that takes care of both.",
    answer: "To memorize the Quran, learn a small portion each day (for beginners often one to three verses), repeat it by listening and reciting from memory, understand its meaning and review earlier verses on a fixed schedule. On Quran Masterclass the Shams Method, developed by founder Nami Shams, takes each verse through seven steps and brings it back for review after 1, 3, 7, 14, 30 and 90 days, adapted to your own memory. It is free on the website, and the iOS app uses the same account.",
    sections: [
      {
        h2: "How to memorize the Quran step by step with the Shams Method",
        p: [
          "The Shams Method takes every verse through seven steps. You listen to it three times with your eyes on the text; you build it up backwards, from the last word, then the last two words, until the whole verse; you look at each word and its meaning; you read the translation and use memory hooks taken from the text itself; you read the tafsir; you recite with only the first letter of each word as a cue, then without help; and you end with a short reflection.",
          "Building backwards means you always finish on the part you know best, so the verse holds together and its melody stays natural. The memory hooks are the anchor word of the verse, the rhyme at its end and the bridge from its last word to the first word of the next verse, which links verses into a chain. The method is a way of learning, not a new interpretation: the explanations come from classical tafsir."
        ],
        links: [["/shams/method", "The seven steps"], ["/guides/shams-method", "Guide: the Shams Method"]]
      },
      {
        h2: "How many verses to memorize a day",
        p: [
          "For beginners, one to three new verses a day is a good start; with some practice, three to five. Long verses count as more than one. Add the review that is due, and a typical session takes about fifteen to twenty-five minutes. If that feels easy after a few weeks, increase slowly; if review starts to pile up, reduce.",
          "The 365-day plans do this for you. There are four tracks: Gentle, for beginners and children; Standard, for most learners; Intensive, for ambitious learners; and the Hafiz track for full-time hifz, which aims at the whole Quran in about a year. The daily amount starts small and grows week by week, and if verses from earlier days are still open, the plan asks you to catch up before adding more."
        ],
        links: [["/plan", "365-day plans"]]
      },
      {
        h2: "How to revise memorized Quran and stop forgetting",
        p: [
          "Forgetting is normal; what prevents it is review at the right moment. Each verse you learn comes back at growing intervals, and a personal memory model adjusts them: a verse's memory factor falls after mistakes and rises when it is easy, and the weakest verses are reviewed first. The Today page shows what is due.",
          "Always recite from memory before you look. Cover half or all of the words, recite, reveal and rate yourself honestly; you can also let your browser's speech recognition listen and mark the words it recognised. If the review list grows too long, pause new verses for a few days, and recite what you have memorized in your prayers, which is a natural review in itself."
        ],
        links: [["/today", "Today's review"], ["/shams", "Start the Shams Method"]]
      },
      {
        h2: "How to memorize Juz Amma first",
        p: [
          "Most learners begin with Juz Amma, the last of the thirty parts of the Quran (surahs 78 to 114). The surahs are short, many are already familiar from prayer, and finishing a whole surah early builds confidence. A common order is to start at An-Nas (114) and work backwards towards An-Naba (78), so that each new surah is only slightly longer than the last.",
          "After Juz Amma, many continue with Juz Tabarak, the twenty-ninth part, which opens with Al-Mulk, or with a surah they love. Both are good choices, as long as review continues for everything you have already learned."
        ],
        links: [["/guides/juz-amma-learning-plan", "Juz Amma learning plan"], ["/surah/114", "An-Nas"], ["/surah/78", "An-Naba"], ["/surah/67", "Al-Mulk"]]
      },
      {
        h2: "How to memorize the Quran as an adult with a busy schedule",
        p: [
          "Adults usually have less free time than children but more understanding and discipline. Tie your session to a fixed point in the day, for example after the dawn prayer or before work, and keep it short enough that you can do it even on a bad day. Some learners split it: new verses in the morning, review in the evening.",
          "Use time you already have. Listening to today's verses on the way to work, each verse repeated, makes the next session easier, and listening to them once more before you sleep is part of the daily plan. On days when nothing works, do the minimum and review only; keeping the chain of days unbroken matters more than the amount."
        ],
        links: [["/guides/daily-quran-routine", "Daily Quran routine"], ["/listen-quran", "Listening for memorization"]]
      },
      {
        h2: "Long surahs, similar verses and Al-Baqarah",
        p: [
          "Long surahs such as Al-Baqarah, with its 286 verses, become manageable when you divide them into passages by theme and learn one passage at a time. After each new passage, recite it together with the one before, and review older passages more often than you think necessary. The chain step of the daily plan, reciting today's verses with yesterday's, does exactly that.",
          "Advanced learners meet a particular difficulty: mutashabihat, verses that are almost identical but appear in different places with a small difference. Note the word that differs and where each version occurs; the page on similar verses collects such pairs so you can practise telling them apart."
        ],
        links: [["/surah/2", "Al-Baqarah"], ["/shams/mutashabihat", "Similar verses"]]
      },
      {
        h2: "How to memorize the Quran with understanding",
        p: [
          "Verses with meaning stick longer than sounds alone. Spend a minute on the word meanings and the tafsir before you repeat a verse, and ask what it says about Allah and about you. Approach the Quran with respect while you learn it: a calm place, a clear intention and patience with yourself.",
          "A teacher who listens to your recitation remains invaluable for hifz, because reciting to someone reveals mistakes you have quietly memorized. Online tools organise your daily practice and review; they do not replace that correction. If you can, recite regularly to a teacher or a knowledgeable friend."
        ],
        links: [["/shams/adab", "Adab of the Quran"], ["/quran-tafsir", "Tafsir next to each verse"], ["/tajweed", "Tajweed basics"]]
      }
    ],
    stepsTitle: "Your daily hifz session",
    steps: [
      { title: "Review what is due", body: "Open Today and recite each due verse from memory before you reveal it." },
      { title: "Repair weak verses", body: "Give a short extra round to verses that are slipping: listen, build up, recall." },
      { title: "Learn the new portion", body: "Take today's new verses through the seven steps of the Shams Method." },
      { title: "Chain today with yesterday", body: "Recite today's verses together with yesterday's, without looking." },
      { title: "Test yourself", body: "Check the passage with a cover mode, the speech check or a test in the Academy." },
      { title: "Listen before you sleep", body: "Play today's verses once more in the evening." }
    ],
    faqTitle: "Questions about memorizing the Quran",
    faq: [
      { q: "How do I start hifz?", a: "Choose a short surah, often An-Nas or Al-Fatihah, learn one to three verses with the Shams Method and review them the next day. When that has worked for a week, pick a plan with a daily amount you can keep." },
      { q: "How long does it take to memorize the Quran?", a: "It varies widely with time, age, background and consistency. The Hafiz track is designed for the whole Quran in about a year of full-time study; learners who study alongside work or school usually need considerably longer, and that is perfectly fine." },
      { q: "Can adults memorize the Quran?", a: "Yes. Adults often have less time but more understanding and discipline. Smaller daily portions, steady review and verses learned with their meaning work well at any age." },
      { q: "How do I memorize the Quran fast without forgetting?", a: "Speed comes from consistency, not from large portions. Learn a little every day and never skip review: verses learned quickly but not reviewed are the first to fade." },
      { q: "What is the best time to memorize the Quran?", a: "Many learners prefer the early morning, after the dawn prayer, when the mind is fresh. The best time, however, is the one you can keep every day; regularity matters more than the hour." },
      { q: "Is memorizing on Quran Masterclass free?", a: "On the website the Shams Method is free for all 114 surahs, with no subscription and no ads. The iOS app uses the same account and offers an optional Pro subscription for extra features." }
    ],
    linksTitle: "Tools and guides",
    links: [["/shams", "Shams Method"], ["/shams/method", "The method explained"], ["/plan", "365-day plans"], ["/today", "Today"], ["/guides/how-to-memorize-the-quran", "Guide: how to memorize the Quran"], ["/guides/juz-amma-learning-plan", "Juz Amma plan"], ["/shams/mutashabihat", "Similar verses"], ["/academy", "Academy tests"], ["/app", "iOS app"]],
    cta: ["/shams", "Start the Shams Method"]
  },

  "quran-radio": {
    title: "Quran Radio Online – Continuous Recitation to Listen",
    description: "Listen to Quran radio online: continuous recitation by different reciters. How to use it for background listening, study and calm. Free, no ads.",
    kicker: "Quran radio",
    h1: "Quran radio online: recitation that keeps playing",
    intro: "Quran radio online gives you recitation that simply keeps playing: press play once and the Quran continues, surah after surah, without you choosing anything. On Quran Masterclass the radio has many stations, from the complete Quran to Juz Amma and single surahs, and this page explains how to make the most of them.",
    answer: "Quran radio is continuous Quran recitation: a station keeps playing surah after surah, so all you do is press play. On the Quran Masterclass website the radio is free and without ads, and the iOS app with the same account has it too, with stations such as the complete Quran, Juz Amma, Before sleep, For children and the Quran in many voices, plus a sleep timer and the Arabic text with translation on screen. To study or memorize a particular passage, open its surah page and play it verse by verse instead.",
    sections: [
      {
        h2: "What the Quran radio stations play",
        p: [
          "The main stations are the complete Quran, which plays from surah 1 to 114 and then starts again; Juz Amma, the short surahs 78 to 114; and Surprise me, which picks a random surah after every surah. Theme stations gather surahs that belong together: Before sleep, Friday, Stories of the prophets, Comfort, Protection, Ramadan and For children, among others.",
          "There are also stations for single surahs that people love to hear again and again, such as Ya-Sin, Ar-Rahman, Al-Mulk, Al-Waqi'ah, Maryam and Yusuf. Juz of the day plays a different one of the thirty parts each day, so you hear the whole Quran once in thirty days."
        ],
        links: [["/radio", "Open the radio"], ["/surah/36", "Ya-Sin"], ["/surah/55", "Ar-Rahman"]]
      },
      {
        h2: "Quran radio with different reciters",
        p: [
          "Each station plays with the reciter you choose, so you can stay with one familiar voice for hours. If you would rather hear variety, the stations in many voices play every surah with another reciter: the Quran in many voices, Juz Amma in many voices and Surprise in many voices. A switch lets you mix voices on any station.",
          "This is a pleasant way to discover reciters. When a voice moves you, look up the reciter's profile to learn about their life and style, and then use that voice for verse-by-verse learning as well."
        ],
        links: [["/reciters", "Reciter profiles"], ["/listen-quran", "Listen by reciter and surah"]]
      },
      {
        h2: "Quran radio for background listening and study",
        p: [
          "Radio works best when you want the Quran around you without effort: at your desk, in the kitchen, on the way to work. The Arabic text and the translation of the verse being recited can be shown on screen, a list shows the verses you heard recently, and a small player keeps the station going while you move to other pages of the site.",
          "When a verse catches your attention, open its surah directly from the radio to read the translation and tafsir. For focused study, though, the surah page is the better tool: there you can repeat a verse, slow it down and pause after each verse to recite it yourself."
        ],
        links: [["/quran", "Open a surah"], ["/search", "Search the Quran"]]
      },
      {
        h2: "Quran radio for sleep and calm",
        p: [
          "Many people like to fall asleep to recitation. The Before sleep station plays As-Sajdah, Al-Mulk and the three Quls, and the sleep timer stops the radio after 15, 30 or 60 minutes or at the end of the current surah, so it does not play all night.",
          "The Comfort station brings together Ad-Duha, Ash-Sharh and Yusuf, surahs many people turn to in difficult times. Even as background, recitation deserves a little respect: when you can, give it your full attention for a few minutes instead of letting it run unheard."
        ],
        links: [["/surah/67", "Al-Mulk"], ["/surah/93", "Ad-Duha"]]
      },
      {
        h2: "Quran radio for kids and families",
        p: [
          "The For children station plays the surahs children usually learn first. Played at breakfast or in the car, it makes the short surahs familiar long before a child starts to memorize them, and familiar surahs are easier to learn later.",
          "For the whole family, the Friday station plays Al-Kahf, Al-Jumu'ah and the surahs of the Friday prayer, and in the month of fasting the Ramadan station plays the passage on fasting in Al-Baqarah, Al-Qadr and Ad-Dukhan. If your family wants to read the whole Quran together, the khatm planner divides it into daily portions."
        ],
        links: [["/guides/quran-for-kids", "Quran for kids"], ["/khatm", "Khatm planner"], ["/surah/18", "Al-Kahf"]]
      },
      {
        h2: "Quran radio on the website and in the app",
        p: [
          "The radio runs in any modern browser, including Safari on an iPhone, without installing anything. The Quran Masterclass iOS app uses the same account and has the radio as well.",
          "On the website there is no sign-up requirement, no subscription and no advertising between surahs. If you want to support the project voluntarily you can, but it unlocks nothing: the radio stays the same for everyone."
        ],
        links: [["/app", "iOS app"]]
      },
      {
        h2: "From listening to learning",
        p: [
          "Radio and the surah player complement each other. The radio chooses what comes next and keeps going; the surah player lets you choose a verse, repeat it, loop a passage and slow it down. Use the radio to make passages familiar and the surah pages to learn them actively.",
          "Once a surah feels familiar from listening, it is a good candidate to memorize. Take it through the seven steps of the Shams Method and you will notice how much of the work your ear has already done."
        ],
        links: [["/memorize-quran", "Memorize the Quran"], ["/shams", "Shams Method"]]
      }
    ],
    stepsTitle: "Using Quran radio in six steps",
    steps: [
      { title: "Open the radio", body: "Go to the radio page on the website or in the iOS app." },
      { title: "Pick a station", body: "Choose the complete Quran, Juz Amma, a theme or a single surah." },
      { title: "Choose a reciter or many voices", body: "Stay with one voice, or let every surah be recited by someone else." },
      { title: "Show the text and translation", body: "Follow the verse being recited on screen whenever you want to pay attention." },
      { title: "Set a sleep timer", body: "Let the radio stop after a set time or at the end of the surah." },
      { title: "Open the surah to learn", body: "When a passage stays with you, open its page and go through it verse by verse." }
    ],
    faqTitle: "Questions about Quran radio",
    faq: [
      { q: "Is the Quran radio live or recorded?", a: "The stations play recorded recitations by well-known reciters, verse after verse and surah after surah, without a break. It is not a live broadcast from a mosque, which is why you can choose the reciter and see the text of every verse." },
      { q: "Is the Quran radio free and without ads?", a: "Yes. On the website there is no fee, no subscription and no advertising. The iOS app uses the same account." },
      { q: "How do I listen to Quran radio on my iPhone?", a: "Open the radio page in Safari, or use the Quran Masterclass iOS app, which uses the same account as the website." },
      { q: "Can I choose the reciter?", a: "Yes. Pick a reciter for any station, or choose one of the stations in many voices, where each surah is recited by someone else." },
      { q: "Is there a Quran radio for children?", a: "Yes, the For children station plays the surahs children usually learn first. It works well at home or in the car." },
      { q: "Can I fall asleep to the Quran radio?", a: "Yes. Choose the Before sleep station and set the sleep timer to 15, 30 or 60 minutes or to the end of the current surah." },
      { q: "What is the difference between Quran radio and surah audio?", a: "The radio plays continuously and chooses what comes next. Surah audio lets you pick a surah and a verse, repeat, loop and slow down, which is better for studying and memorizing." }
    ],
    linksTitle: "Keep listening",
    links: [["/radio", "Quran radio"], ["/listen-quran", "Listen to the Quran"], ["/reciters", "Reciters"], ["/quran", "All surahs"], ["/surah/36", "Ya-Sin"], ["/surah/18", "Al-Kahf"], ["/khatm", "Khatm planner"], ["/app", "iOS app"]],
    cta: ["/radio", "Play the radio"]
  },

  "listen-quran": {
    title: "Listen to the Quran Online – Surah Audio by Reciter",
    description: "Listen to the Quran online by surah or verse by verse, pick a reciter and follow with translation. Tips for listening to learn, not only to hear.",
    kicker: "Quran audio",
    h1: "Listen to the Quran online, surah by surah or verse by verse",
    intro: "When you listen to the Quran online, there are two ways to do it: let a whole surah play, or take one verse at a time and repeat it. Which is better depends on what you want right now, to rest, to learn the sounds or to memorize, and this guide shows how to use both on Quran Masterclass.",
    answer: "On Quran Masterclass you can listen to all 114 surahs online for free, choose a reciter and the speed, and play a whole surah or one verse at a time, with repeat, loop and a pause after each verse to recite it yourself. The Arabic text, transliteration, translation and word-by-word meaning stay beside the audio, and each word is highlighted as it is recited. The same account works on the website and in the iOS app.",
    sections: [
      {
        h2: "Listen to the Quran by surah or verse by verse",
        p: [
          "The player has two modes. Continuous plays the surah from beginning to end, which is right for hearing its flow or for listening while you rest. Learn pauses after every verse until you press Continue, so you can read the verse back, look up a word or simply let it settle.",
          "You can jump to any verse, switch between a list of verses and a reading view by page, and find your place by juz or hizb. Bookmarks keep the verses you want to return to."
        ],
        links: [["/quran", "All 114 surahs"], ["/surah/18", "Al-Kahf"]]
      },
      {
        h2: "Listen to the Quran verse by verse with translation",
        p: [
          "While a verse is recited, each word lights up in the Arabic text, so your eyes follow your ears. Below it you see the transliteration in Latin letters, the translation and, if you open it, the meaning of every single word. The size of the Arabic text can be adjusted.",
          "Even if you cannot read Arabic yet, linking sound and script in this way builds recognition day by day. The recitation itself is always in Arabic; the translation appears on screen next to it."
        ],
        links: [["/arabic", "Learn to read Arabic"], ["/quran-tafsir", "Tafsir next to the verse"]]
      },
      {
        h2: "Best reciters for beginners",
        p: [
          "For learning, a measured style of recitation, called murattal, is the easiest to follow, because every letter and every pause can be heard. Among the reciters in the player, Mahmoud Khalil al-Husary and Muhammad Siddiq al-Minshawi are popular with learners for this reason, while Mishary Alafasy and Abdul Basit Abdus Samad are loved for their clear and expressive voices.",
          "Whichever voice you choose, you can lower the speed until every sound is clear, then return to normal speed. Once you have found a reciter you can follow, stay with them for a few weeks: your ear gets used to their pace and pauses, which helps both reading and memorizing."
        ],
        links: [["/reciters", "Reciter profiles"], ["/mishary", "Style studies of the great reciters"]]
      },
      {
        h2: "Listen to the Quran for memorization",
        p: [
          "Three settings make listening useful for memorizing. Repeat plays each verse more than once. Loop plays a passage from one verse to another, again and again, which is how you link verses into a chain. And the pause to repeat leaves time after each verse to recite it yourself; set to verse length, it gives you exactly as long as the verse takes.",
          "Listening makes a verse familiar, but recall is what fixes it. After listening, cover the words, recite from memory and check yourself, or take the verse through the steps of the Shams Method, which begins with listening three times."
        ],
        links: [["/shams", "Shams Method"], ["/memorize-quran", "Memorize the Quran"]]
      },
      {
        h2: "Short surahs to listen to first",
        p: [
          "If you do not know where to start, begin with Al-Fatihah and the short surahs of Juz Amma, especially Al-Ikhlas (112), Al-Falaq (113) and An-Nas (114), which are often recited in prayer. From there, many people move on to surahs they like to hear at particular times, such as Al-Mulk (67) in the evening or Al-Kahf (18) on Fridays, or to Ar-Rahman (55) with its recurring refrain.",
          "Children learn short surahs mainly by hearing them many times. Play the same surah for a week, let them join in when they are ready, and switch on the kids mode with its larger text when they start to follow along."
        ],
        links: [["/surah/112", "Al-Ikhlas"], ["/surah/67", "Al-Mulk"], ["/surah/55", "Ar-Rahman"], ["/guides/quran-for-kids", "Quran for kids"]]
      },
      {
        h2: "Quran audio on iPhone and offline",
        p: [
          "You can listen in any browser, including Safari on an iPhone, or in the Quran Masterclass iOS app with the same account, so your bookmarks and progress follow you. The recitations are streamed rather than offered as MP3 files to download.",
          "For listening without a connection, the player can save a surah on your device. In the evening, the sleep timer stops playback after a set time or at the end of the surah."
        ],
        links: [["/app", "iOS app"], ["/radio", "Quran radio"]]
      },
      {
        h2: "How to listen to the Quran effectively",
        p: [
          "Listening attentively is different from hearing the Quran in the background. Choose a quiet moment, read the translation of the passage before or after, and listen to the same surah over several days rather than a different one each time. Familiarity deepens with every repetition.",
          "A balance works for most people: the radio for background listening during the day, the surah player for a few focused minutes, and now and then a passage read slowly with its tafsir."
        ],
        links: [["/shams/adab", "Adab of the Quran"], ["/quran-radio", "Quran radio guide"], ["/guides/daily-quran-routine", "Daily Quran routine"]]
      }
    ],
    stepsTitle: "How to listen well in six steps",
    steps: [
      { title: "Choose a surah", body: "Start with one you want to know better, or with a short surah from Juz Amma." },
      { title: "Choose a reciter and a speed", body: "Pick a clear voice and slow it down if the sounds are new to you." },
      { title: "Listen once without stopping", body: "Play the surah in Continuous mode to get a sense of its shape." },
      { title: "Switch to Learn mode", body: "Go verse by verse, reading each verse back after you hear it." },
      { title: "Repeat with a pause", body: "Turn on repeat and the pause after each verse, and recite it yourself." },
      { title: "Read the meaning", body: "Finish by reading the translation of what you heard." }
    ],
    faqTitle: "Questions about listening to the Quran",
    faq: [
      { q: "Can I listen to the Quran online for free?", a: "Yes. All 114 surahs can be played on the website without fees, subscription or ads, and you do not need an account to listen." },
      { q: "Can I download the Quran as MP3?", a: "The site streams the recitations and does not offer MP3 downloads. Instead, the player can save a surah on your device for offline listening." },
      { q: "Which reciter is best for beginners?", a: "A clear reciter in the measured murattal style whom you can follow without effort. Try a few in the player and stay with the one that suits you for a few weeks." },
      { q: "Can I listen to the Quran with English translation?", a: "The recitation is in Arabic, and the English translation appears next to each verse on screen, together with the transliteration and the word-by-word meaning." },
      { q: "Can I put a verse on repeat?", a: "Yes. You can repeat each verse, loop a passage between two verses and add a pause after each verse to recite it yourself." },
      { q: "Does listening to the Quran help with memorization?", a: "It makes verses familiar and trains your pronunciation, which is a great help. To memorize, combine it with reciting from memory and regular review." },
      { q: "Can I listen on my iPhone?", a: "Yes, in Safari or in the Quran Masterclass iOS app, which uses the same account as the website." }
    ],
    linksTitle: "More to explore",
    links: [["/quran", "Quran"], ["/reciters", "Reciters"], ["/radio", "Quran radio"], ["/surah/1", "Al-Fatihah"], ["/surah/36", "Ya-Sin"], ["/shams", "Shams Method"], ["/memorize-quran", "Memorize the Quran"], ["/app", "iOS app"]],
    cta: ["/quran", "Choose a surah"]
  },

  tawbah: {
    title: "Tawbah – How to Return to Allah, Gently and Step by Step",
    description: "A warm, practical guide to tawbah: coming back to prayer, wudu, duas and learning, at your own pace. No judgment and no rulings, just next steps.",
    kicker: "Tawbah",
    h1: "Tawbah: coming back, one small step at a time",
    intro: "Tawbah means turning back to Allah, and in Islamic teaching that way back stays open to everyone who turns sincerely. If you have been away from prayer or the Quran, or something weighs on your heart, this page offers gentle and practical first steps, without shaming and without rulings.",
    answer: "Tawbah is the Arabic word for repentance, literally turning back to Allah. Scholars commonly describe it as sincere regret, leaving the wrong, the resolve not to return to it and, where other people were wronged, making amends, all joined with hope in Allah's mercy rather than despair. Quran Masterclass gives no rulings, but it offers free, practical help for the way back, from duas for forgiveness and the wudu and prayer trainers to gentle ways of returning to the Quran; for personal questions, please speak to a trustworthy scholar or imam.",
    sections: [
      {
        h2: "What tawbah and istighfar mean",
        p: [
          "Istighfar means asking Allah for forgiveness, and it can be as simple as a sentence said from the heart, in any language, at any time. Tawbah is the wider turning: of the heart, of the intention and, step by step, of the way you live. Istighfar is often where tawbah begins, and it remains part of a Muslim's day long after.",
          "Among the Names of Allah are al-Ghafur, the Forgiving, at-Tawwab, the One who keeps accepting repentance, and ar-Rahim, the Merciful. Learning what these names mean changes how you ask. The duas page also has supplications for forgiveness with Arabic, transliteration, translation and source, so you can learn them one at a time."
        ],
        links: [["/duas", "Duas for forgiveness"], ["/islam/names", "99 Names of Allah"]]
      },
      {
        h2: "How to return to Allah after a long time",
        p: [
          "Distance usually grows slowly, through many small days, and the way back can be just as gradual. You do not need to feel ready first; very often the feeling follows the first steps rather than coming before them. Choose one thing you can do today and repeat tomorrow, and let that be your beginning. Nothing has to be announced or explained to anyone.",
          "If heavy feelings such as shame, anxiety or sadness make every step hard, speak to someone you trust. Professional help is a wise and fully legitimate step, and if you are in crisis, please contact a doctor or the emergency services where you live."
        ],
        links: [["/listen-quran", "Listen to the Quran"], ["/guides/daily-quran-routine", "A small daily routine"]]
      },
      {
        h2: "How to start praying again after years",
        p: [
          "If you have forgotten how to pray, or were never properly taught, the prayer trainer shows every posture with an animated figure, together with the Arabic words, the transliteration and the meaning. Choose your tradition, Sunni or Shia, and go through the prayer step by step as often as you like; nobody sees your progress but you.",
          "The wudu trainer does the same for the ablution and ends with a short quiz, and the prayer times page shows when each prayer begins where you live and the direction of the qibla. Questions about prayers missed in the past are answered differently by the schools, so ask a scholar of yours, and do not let that question delay today's prayer."
        ],
        links: [["/salah", "Prayer trainer"], ["/wudu", "Wudu trainer"], ["/prayer", "Prayer times and qibla"], ["/learn-salah", "Learn salah step by step"]]
      },
      {
        h2: "How to get back to the Quran",
        p: [
          "Listening is often the gentlest way back. The radio has a Comfort station with Ad-Duha, Ash-Sharh and Yusuf, surahs many people turn to in hard times, and you can follow the text and translation on screen. A few minutes are enough to begin.",
          "Some people find it meaningful to read passages about repentance and mercy, for example in Surah Az-Zumar (39) and Surah Al-Furqan (25), or Surah At-Tawbah (9), which carries the name of repentance. Read them slowly with translation and tafsir. If you cannot read Arabic yet, the reading course starts from the first letter, and learning to read is itself a way of coming back."
        ],
        links: [["/surah/39", "Surah Az-Zumar"], ["/surah/93", "Surah Ad-Duha"], ["/radio", "Quran radio"], ["/arabic", "Learn to read Arabic"]]
      },
      {
        h2: "How to stay consistent after tawbah",
        p: [
          "Many people begin with great energy and fade after a few weeks. A small, fixed plan protects against that: one prayer that you keep at its time, five minutes of the Quran, and a dua for forgiveness in the morning or evening. The Today page counts the days you practise in a row, which helps on the days when motivation is low.",
          "Think about when and where the old habit usually happened, and change something there: the place, the time, the company or the app on your phone, and put something good in its place. If you slip, turn back again. Tawbah is not a single exam that you pass or fail; Muslims are taught that it can be renewed as often as needed."
        ],
        links: [["/today", "Today and your streak"], ["/dua-generator", "Write a personal dua"]]
      },
      {
        h2: "Questions for a scholar, not a website",
        p: [
          "Some questions depend on your exact situation: prayers or fasts missed over years, debts or rights owed to other people, or what to do about a particular matter. These belong with a trustworthy scholar or imam of the school you follow, asked in private. Look for someone known for knowledge, discretion and kindness.",
          "This page and this site give no rulings. They offer general teaching and practical tools, for Sunni and Shia readers alike, and leave personal guidance to the people qualified to give it."
        ],
        links: [["/islam", "Understanding Islam"], ["/islam/madhahib", "Schools of law"]]
      }
    ],
    stepsTitle: "Six small steps for this week",
    steps: [
      { title: "Make a sincere intention", body: "In your own words, tell Allah that you want to come back." },
      { title: "Ask for forgiveness", body: "Use your own words or a dua for forgiveness, and learn one by heart this week." },
      { title: "Make wudu and pray one prayer", body: "Choose the prayer you can keep most easily and pray it at its time." },
      { title: "Listen to a short surah", body: "Play a surah such as Ad-Duha and read its translation." },
      { title: "Do one good deed", body: "Give something in charity, call a relative or put right something you owe." },
      { title: "Keep one habit for seven days", body: "Pick the smallest step from this list and repeat it every day this week." }
    ],
    faqTitle: "Questions people ask about tawbah",
    faq: [
      { q: "How do I make tawbah?", a: "Turn to Allah sincerely, regret what happened, stop it and resolve not to return to it, and where you wronged someone, put it right as far as you can. No special words or ceremony are required; you can ask for forgiveness in your own language and also learn the established duas." },
      { q: "How do I repent to Allah sincerely?", a: "Sincerity often grows through action. Begin even if your heart feels hard, ask Allah to make your repentance sincere, and let small deeds follow your words." },
      { q: "I want to return to Allah. Where do I start?", a: "With the smallest step you can take today: an intention, a dua, wudu and one prayer, or a few minutes of listening to the Quran. Build from there at your own pace." },
      { q: "What if I fall back into the same mistake?", a: "Turn back again, and look at what led you there so you can change it. Islamic teaching encourages renewing tawbah rather than giving up, and many people need several attempts before a change holds." },
      { q: "How can I feel close to Allah again?", a: "Closeness usually returns through small, regular acts: prayer at its time, dua in your own words, remembrance and a little Quran each day. Feelings rise and fall; keep the practice even when the feeling is quiet." },
      { q: "Does Allah forgive everything?", a: "Islamic teaching places great emphasis on Allah's mercy and warns against despairing of it. Where the rights of other people are involved, making amends is part of the matter. For your own situation, please ask a trustworthy scholar or imam." },
      { q: "Can this site tell me what applies in my situation?", a: "No. We do not give rulings. For your own case, speak in private to a scholar or imam of the school you follow; if you are in crisis, contact a doctor or the emergency services." }
    ],
    linksTitle: "Helpful pages",
    links: [["/duas", "Duas"], ["/dua-generator", "Dua generator"], ["/salah", "Prayer trainer"], ["/wudu", "Wudu trainer"], ["/prayer", "Prayer times"], ["/islam/names", "99 Names of Allah"], ["/listen-quran", "Listen to the Quran"], ["/learn-salah", "Learn salah"], ["/guides/daily-quran-routine", "Daily Quran routine"]],
    cta: ["/duas", "Open the duas"]
  },

  "learn-salah": {
    title: "Learn Salah for Beginners – How to Pray Step by Step",
    description: "Learn salah as a beginner: what to prepare, the order of the prayer, what to recite and how to build a habit. Free prayer trainer and prayer times.",
    kicker: "Salah",
    h1: "Learn salah for beginners: from your first prayer to a daily habit",
    intro: "This is a calm course to learn salah for beginners: for new Muslims, for adults who were never taught and for anyone returning after a long break. You do not need to know everything before you start; it is enough to learn in the right order, and every step links to a free tool on the Quran Masterclass website.",
    answer: "To learn salah as a beginner, first learn wudu and how to find the prayer times and the qibla, then practise the movements of one prayer and add the recitations one at a time, starting with Al-Fatihah. Quran Masterclass has a free prayer trainer in which an animated figure shows every posture with the Arabic words, the transliteration and the meaning, for Sunni and for Shia (Ja'fari) practice. Details differ between the schools, so follow the one you belong to.",
    sections: [
      {
        h2: "What do I need before praying?",
        p: [
          "Before the prayer come purity, a clean place and clothing, the right time and the direction of the qibla. Purity means wudu and, in certain situations, the full ritual bath (ghusl); the chapters on prayer explain when each is needed according to the schools, and how the body is covered in prayer.",
          "Prayer times depend on where you are. The prayer times page calculates them on your device for your location, lets you choose the method your local mosque uses, including the later Asr time of the Hanafi school, and shows the qibla direction, with a live compass on a phone. Compare with your mosque, especially around sunrise."
        ],
        links: [["/wudu", "Wudu trainer"], ["/prayer", "Prayer times and qibla"], ["/learn-wudu", "How to make wudu"]]
      },
      {
        h2: "How to pray salah step by step",
        p: [
          "The prayer begins with the intention and the opening takbir. It is made up of units called rak'ahs, and every unit follows the same pattern: standing and reciting, bowing (ruku'), standing up again, and two prostrations (sujud) with a short sitting between them. After the second unit and at the end you sit for the tashahhud, and the prayer closes with the greeting of peace.",
          "There are five daily prayers: Fajr with two units, Dhuhr with four, Asr with four, Maghrib with three and Isha with four. This is the same for Sunni and Shia Muslims. In the prayer trainer you choose the prayer and your tradition, then play the whole sequence or go through it step by step."
        ],
        links: [["/salah", "Prayer trainer"], ["/islam/prayer-sunni", "How to pray (Sunni)"], ["/islam/prayer-shia", "How to pray (Shia, Ja'fari)"]]
      },
      {
        h2: "What to recite in salah",
        p: [
          "Al-Fatihah is recited in every unit. In the first two units a further surah is usually recited after it; how this is classified differs between the schools. Each position has its own short phrases of glorification, and the sitting has the tashahhud. In the trainer every phrase appears with the Arabic, the transliteration and the meaning.",
          "Learn in this order: the opening takbir, Al-Fatihah, one short surah such as Al-Ikhlas or Al-Kawthar, the phrases for bowing and prostration, and finally the tashahhud. Learn what each phrase means, so that the words carry meaning for you from the start."
        ],
        links: [["/surah/1", "Al-Fatihah"], ["/surah/112", "Al-Ikhlas"], ["/surah/108", "Al-Kawthar"]]
      },
      {
        h2: "How to learn Surah Al-Fatiha for salah",
        p: [
          "Al-Fatihah has seven verses, and learning one or two a day is realistic for most beginners. Listen to each verse three times, build it up from its last word, look at the meaning of each word and then recite it with only the first letters as cues: these are the steps of the Shams Method, free on the website.",
          "Because you will recite it several times a day, it is worth getting the pronunciation right early. The last lesson of the tajweed course applies all the rules to Al-Fatihah, and if you can, ask someone who recites well to listen to you once."
        ],
        links: [["/shams", "Shams Method"], ["/tajweed", "Tajweed lessons"]]
      },
      {
        h2: "How to pray as a new Muslim",
        p: [
          "Learning the prayer takes most people some weeks, and nobody expects a new Muslim to know everything on the first day. The schools explain what a learner does in the meantime, for example while the recitations are not yet memorized. Ask a teacher of your school or the imam of a local mosque; most are glad to help someone who is learning.",
          "The chapters on prayer describe the Sunni and the Shia way in detail, step by step and with transliteration. Quran Masterclass does not choose a school for you; it shows both so that you can follow the one you belong to."
        ],
        links: [["/learn-islam", "Islam for beginners"], ["/islam/madhahib", "The schools of law"]]
      },
      {
        h2: "How to build a prayer habit",
        p: [
          "Habits form around fixed points. Link each prayer to something you already do, such as a meal or the end of the working day, and pray soon after the time begins rather than leaving it for later. On the prayer times page you can turn on a notification for every prayer time; it works while the page is open in your browser.",
          "For Fajr, prepare the evening before: check the time in the monthly timetable, set an alarm away from your bed and lay out your prayer place. If you are building up gradually, start with the prayers you can keep and add the others one by one. If you miss a prayer, return at the next one; questions about making up prayers belong with a scholar of your school."
        ],
        links: [["/tawbah", "Coming back gently"], ["/guides/daily-quran-routine", "Daily routine"]]
      }
    ],
    stepsTitle: "Your first week of salah",
    steps: [
      { title: "Day 1: learn wudu", body: "Go through the wudu trainer until you can follow the order without help." },
      { title: "Day 2: times and qibla", body: "Check today's prayer times for your location and find the qibla direction." },
      { title: "Day 3: the movements", body: "Walk through one prayer in the trainer, positions only, without the words." },
      { title: "Day 4: Al-Fatihah", body: "Listen, repeat and learn the meaning of the opening surah." },
      { title: "Day 5: a short surah and the phrases", body: "Add Al-Ikhlas and the phrases for bowing and prostration." },
      { title: "Day 6: one complete prayer", body: "Put the parts together and pray one prayer at its time." },
      { title: "Day 7: add the next prayer", body: "Keep yesterday's prayer and add another; continue at your own pace." }
    ],
    faqTitle: "Questions about learning salah",
    faq: [
      { q: "How do I start praying five times a day?", a: "Many people build up gradually: they learn one prayer well, keep it at its time and add the others one by one. Use the prayer times page so you know when each prayer begins, and ask a scholar of your school for advice suited to your situation." },
      { q: "Can I learn to pray at home online?", a: "Yes. The prayer trainer shows each step with the words and their meaning, and you can repeat it as often as you like. If possible, ask someone who prays to watch you once and check your positions." },
      { q: "How do I pray if I do not know Arabic?", a: "The recitations of the prayer are in Arabic and are learned gradually, with the transliteration and the meaning as help. Each school explains what a learner does until then, so ask a teacher you trust." },
      { q: "What are the differences between Sunni and Shia prayer?", a: "The five prayers, the number of units and the qibla are the same. There are differences in details, for example in the position of the hands while standing, some of the phrases and the combining of certain prayers. The trainer and the chapters on prayer show both ways." },
      { q: "How many rak'ahs does each prayer have?", a: "Fajr has two, Dhuhr four, Asr four, Maghrib three and Isha four." },
      { q: "I missed many prayers. What should I do?", a: "Begin with the next prayer. How to deal with prayers missed in the past is answered differently by the schools, so please ask a scholar of yours." },
      { q: "Can women and children use the prayer trainer?", a: "Yes. Children learn well by following the figure beside a parent. Questions specific to women's prayer are covered in the chapters of each school, and a teacher of your school can answer the rest." }
    ],
    linksTitle: "Related pages",
    links: [["/salah", "Prayer trainer"], ["/wudu", "Wudu trainer"], ["/prayer", "Prayer times"], ["/islam/prayer-sunni", "Prayer (Sunni)"], ["/islam/prayer-shia", "Prayer (Shia)"], ["/surah/1", "Al-Fatihah"], ["/duas", "Duas"], ["/learn-wudu", "Learn wudu"]],
    cta: ["/salah", "Open the prayer trainer"]
  },

  "learn-wudu": {
    title: "How to Make Wudu Step by Step – Guide for Beginners",
    description: "Learn how to make wudu in the right order, with common mistakes to watch for and a practice trainer. Written for beginners and new Muslims.",
    kicker: "Wudu",
    h1: "How to make wudu, step by step",
    intro: "Knowing how to make wudu is one of the first things a new Muslim learns and one of the things returning Muslims most often want to refresh. Wudu is the ritual washing before prayer; once you have learned the order and practised it a few times, you can do it calmly anywhere.",
    answer: "Wudu is the ritual washing Muslims perform before prayer: after the intention, the face and the arms up to the elbows are washed, the head is wiped and the feet are washed or wiped, the parts named in Surah Al-Ma'idah (5:6), while the hands, mouth and nose are usually washed first. Details, such as how often each part is washed and how the feet are treated, differ between the schools. Quran Masterclass has a free wudu trainer for Sunni and Shia practice that shows each step, marks what is obligatory and what is recommended, and ends with a short quiz.",
    sections: [
      {
        h2: "What is the order of wudu?",
        p: [
          "In the Sunni descriptions the usual order is: the intention, the name of Allah, washing the hands, rinsing the mouth and the nose, washing the face, washing the right arm and then the left up to and including the elbows, wiping the head and the ears, and washing the right foot and then the left up to the ankles. Washing each part once is valid and three times is sunnah; in the Shafi'i and Hanbali schools keeping the order is obligatory.",
          "In the Ja'fari school, after the intention the face is washed from the hairline down to the chin, then the right arm and the left arm from the elbow down to the fingertips; the front of the head is wiped with the moisture remaining on the hand, and then the tops of the feet. Keeping the order and continuing without a long break are obligatory. The trainer lets you choose your tradition and marks each step accordingly."
        ],
        links: [["/wudu", "Wudu trainer"], ["/surah/5", "Surah Al-Ma'idah"]]
      },
      {
        h2: "How to learn wudu with practice",
        p: [
          "Read through the steps once without hurrying, then follow the trainer at the sink while you perform them. After a few days, try the whole sequence from memory and check yourself with the quiz on the order at the end of the trainer. With regular practice the order soon begins to feel natural.",
          "A simple memory aid: wudu starts where you take the water, with the hands, mouth and nose, continues with the four parts named in Surah Al-Ma'idah, face, arms, head and feet, and ends with a short dua. Many people find it helpful to learn wudu together with the first prayer, so both habits form at once."
        ],
        links: [["/wudu", "Practise with the trainer"], ["/learn-salah", "Learn salah"]]
      },
      {
        h2: "Common mistakes in wudu",
        p: [
          "The most frequent mistakes are leaving small areas dry, especially the heels, the elbows and between the fingers and toes; rushing so that a part is skipped; using far more water than needed; and mixing up the order. Going slowly through the trainer for a few days fixes most of these.",
          "Many beginners also worry whether their wudu is still valid or whether they washed a part properly. Teachers of every school have practical guidance for such doubts, so ask one rather than repeating your wudu again and again. For special situations, such as bandages, plasters or a medical condition, ask a scholar of your school as well."
        ],
        links: [["/islam/prayer-sunni", "Wudu in detail (Sunni)"], ["/islam/prayer-shia", "Wudu in detail (Shia)"]]
      },
      {
        h2: "What breaks wudu and how long it lasts",
        p: [
          "Wudu stays valid until something breaks it. All the schools agree on these: when urine, stool or wind leaves the body, deep sleep, and loss of consciousness. Other points, such as touching, bleeding or other discharges, are judged differently by the schools, so ask a teacher of yours about them.",
          "Wudu is therefore not tied to a fixed length of time; what matters is whether something has broken it. Special cases, for example a continuous medical condition, are treated differently by the schools."
        ],
        links: [["/islam/madhahib", "The schools of law"]]
      },
      {
        h2: "Wudu when there is no water, and wiping over socks",
        p: [
          "If you cannot find water, or using it would harm you, purification with clean earth, called tayammum, takes its place; it is mentioned in Surah Al-Ma'idah (5:6) and Surah An-Nisa (4:43). You make the intention, strike clean earth with your palms and wipe your face and hands. How many times you strike and how far the hands are wiped is described differently by the schools, and once you can use water again, you make wudu for the next prayer.",
          "Wiping over leather socks (khuffs) instead of washing the feet is accepted in the Sunni schools under conditions that differ between them, and they disagree about ordinary socks. The Ja'fari school does not include wiping over socks in normal wudu. Before relying on it, ask a teacher of your school."
        ],
        links: [["/surah/4", "Surah An-Nisa"]]
      },
      {
        h2: "Wudu for women, children and new Muslims",
        p: [
          "The steps of wudu are the same for women and men. Practical questions, for example about nail polish, make-up or a headscarf, are discussed by scholars, and a teacher of your school can answer them; the section for sisters gathers learning paths for women. Children learn wudu best by doing it beside a parent, and the trainer's figure and quiz turn the order into a small game.",
          "If you are new to Islam, learn wudu before your first prayer and practise it at home before you go to a mosque. The chapters on prayer also explain when the full ritual bath (ghusl) is needed instead."
        ],
        links: [["/sisters", "For sisters"], ["/learn-islam", "Islam for beginners"]]
      },
      {
        h2: "What to say before and after wudu",
        p: [
          "Many begin wudu with the name of Allah; in the Hanbali school this is obligatory if you remember it, in the other Sunni schools it is recommended. After wudu, the Sunni tradition teaches the testimony of faith followed by a short dua, and the trainer shows both with Arabic, transliteration and translation.",
          "In the Ja'fari tradition, too, duas are recommended during and after wudu; learn their wording with a teacher of your school. After wudu comes the prayer, so the next natural step is the prayer trainer."
        ],
        links: [["/duas", "Duas"], ["/salah", "Prayer trainer"]]
      }
    ],
    stepsTitle: "Practice plan for wudu",
    steps: [
      { title: "Read the steps once", body: "Go through the trainer from beginning to end without hurrying." },
      { title: "Choose your tradition", body: "Select Sunni or Shia in the trainer so that each step is marked for your school." },
      { title: "Practise along at the sink", body: "Follow the trainer step by step while you make wudu." },
      { title: "Take the quiz", body: "Check that you know the order without looking." },
      { title: "Make wudu from memory", body: "Do the whole sequence without the screen and note anything you are unsure of." },
      { title: "Pray with your wudu", body: "Make wudu before your next prayer and ask a teacher about any doubts." }
    ],
    faqTitle: "Questions about wudu",
    faq: [
      { q: "What is the order of wudu?", a: "After the intention: the face, the arms up to the elbows, the wiping of the head, and the feet, the parts named in Surah Al-Ma'idah, usually preceded by washing the hands, mouth and nose. Details differ between the schools, and the trainer shows the order for each." },
      { q: "What breaks wudu?", a: "All schools agree that urine, stool or wind leaving the body, deep sleep and loss of consciousness break it. Other points are judged differently, so ask a teacher of your school." },
      { q: "How long does wudu last?", a: "Until something breaks it; it is not tied to a fixed length of time. Special cases, such as an ongoing medical condition, are treated differently by the schools." },
      { q: "Do Sunni and Shia make wudu differently?", a: "Yes, in some details: in the Ja'fari school, for example, the arms are washed from the elbow downwards and the feet are wiped rather than washed. The trainer describes both ways without ranking them." },
      { q: "Can I make wudu with socks on?", a: "The schools differ on wiping over socks and leather socks, and on the conditions for it. Ask a teacher of your school before relying on it." },
      { q: "What if there is no water?", a: "Tayammum with clean earth takes the place of wudu when there is no water or using it would harm you. As soon as you can use water again, you make wudu." },
      { q: "Do I need wudu to touch the Quran?", a: "Scholars discuss this in detail, especially for touching a printed copy, for phones and for translations, and the schools differ. Ask a teacher of your school; listening to the Quran does not involve touching the text at all." },
      { q: "Is wudu different for women?", a: "No, the steps are the same. A teacher of your school can answer practical questions, for example about nail polish or make-up." }
    ],
    linksTitle: "Related pages",
    links: [["/wudu", "Wudu trainer"], ["/salah", "Prayer trainer"], ["/prayer", "Prayer times"], ["/learn-salah", "Learn salah"], ["/islam/prayer-sunni", "Prayer and wudu (Sunni)"], ["/islam/prayer-shia", "Prayer and wudu (Shia)"], ["/duas", "Duas"], ["/learn-islam", "Learn about Islam"]],
    cta: ["/wudu", "Open the wudu trainer"]
  },

  "learn-islam": {
    title: "Learn About Islam for Beginners – Where to Start",
    description: "New to Islam or just curious? A calm starting guide to beliefs, the Quran, prayer and daily life, with Sunni and Shia views, at your own pace.",
    kicker: "Learn about Islam",
    h1: "Learn about Islam: a calm place to start",
    intro: "If you want to learn about Islam, whether you are curious, newly Muslim or returning after years, the best approach is to go in small steps and in a sensible order. This page suggests that order and points you to short, neutral chapters and courses on Quran Masterclass, all of them free on the website.",
    answer: "Islam is a monotheistic faith: Muslims believe in one God, Allah, in the prophets from Adam to Muhammad, and in the Quran as God's revelation. A beginner can start with the basics of belief and the pillars of practice, then get to know the Quran and the life of the Prophet, and learn wudu and prayer when ready. Quran Masterclass explains these topics in free chapters and courses and presents Sunni and Shia teaching side by side without ranking them.",
    sections: [
      {
        h2: "What do Muslims believe, in simple words?",
        p: [
          "At the centre of Islam is tawhid, the oneness of God: Allah is one, without partner, and nothing is like Him. From this follow the articles of faith commonly listed as six: belief in Allah, in His angels, in His revealed books, in His prophets and messengers, in the Last Day and in divine decree. The chapter on faith explains each of them in plain language.",
          "Shia teaching often summarises the foundations of belief as the roots of religion (usul al-din): the oneness of God, divine justice, prophethood, the Imamate and the Day of Resurrection. The content overlaps widely, while the arrangement and some emphases differ. The site presents both without ranking them."
        ],
        links: [["/islam/iman", "The six pillars of faith"], ["/islam/islam", "What is Islam?"]]
      },
      {
        h2: "What are the five pillars of Islam?",
        p: [
          "The five pillars are the testimony of faith (shahada), the five daily prayers (salah), the obligatory alms (zakat), fasting in the month of Ramadan (sawm) and the pilgrimage to Makkah (hajj) for those who are able. They give the faith its daily, yearly and lifelong shape.",
          "In Shia teaching the same acts of worship appear among the branches of religion (furu' al-din), together with others such as khums. The structure differs; the practice is largely shared. The chapters on Ramadan and Hajj explain fasting and pilgrimage step by step, and the prayer has its own beginner's guide."
        ],
        links: [["/islam/ramadan", "Ramadan and fasting"], ["/islam/hajj", "Hajj and Umrah"], ["/learn-salah", "Learn salah"]]
      },
      {
        h2: "Who is the Prophet Muhammad?",
        p: [
          "In Islamic belief, Muhammad is the final messenger of Allah, through whom the Quran was revealed. He was born in Makkah, received the first revelation there, endured years of persecution, migrated to Madinah, returned to Makkah and died in Madinah. Muslims follow his example, the Sunnah, in worship and in character.",
          "Muslims also honour the earlier prophets, among them Adam, Nuh, Ibrahim, Musa and Isa. The chapter on the Prophet gives an overview of his life, and the Academy courses go further with a full seerah and a course on the prophets."
        ],
        links: [["/islam/prophet", "The Prophet Muhammad"], ["/courses", "Seerah and other courses"]]
      },
      {
        h2: "How to read the Quran as a new Muslim",
        p: [
          "The Quran has 114 surahs of very different lengths. Rather than starting at the beginning and reading straight through, many new Muslims begin with Al-Fatihah, which is recited in every prayer, and with the short surahs at the end, listening to the recitation and reading the translation alongside.",
          "When you are ready, learn to read the Arabic script in short lessons; translation and tafsir sit next to every verse, and the site is available in 14 languages. There is no hurry: understanding a few verses well is worth more than reading many without attention."
        ],
        links: [["/islam/quran", "The Quran"], ["/surah/1", "Al-Fatihah"], ["/learn-quran", "Learn the Quran"]]
      },
      {
        h2: "First steps after becoming Muslim",
        p: [
          "Many new Muslims first learn the meaning of the testimony of faith, then wudu and the prayer, and a few short surahs. Look for a mosque or a teacher where questions are welcome; learning alongside other people makes a great difference, especially at the beginning.",
          "Do not try to change everything at once. The chapter on daily life walks through an ordinary day, from food and family to work and travel, and the guide to halal and haram goes through everyday questions, stating for each point its category, the evidence by reference and the positions of the schools of law."
        ],
        links: [["/islam/daily", "Islam in daily life"], ["/islam/halal-haram", "Halal and haram"], ["/learn-wudu", "Learn wudu"]]
      },
      {
        h2: "The difference between Sunni and Shia, explained",
        p: [
          "Sunni and Shia Muslims share the Quran, the five daily prayers towards the same qibla, the fast of Ramadan and the pilgrimage. Their division goes back to the question of who should lead the community after the Prophet, and over the centuries each developed its own schools of law, scholarship and traditions.",
          "Among Sunni Muslims the Hanafi, Maliki, Shafi'i and Hanbali schools are the best known; most Shia Muslims follow the Ja'fari school, and the Ibadi school is a further tradition, found mainly in Oman. The chapter on the schools of law explains how they came about and why they differ in details. A beginner does not need to settle every question at once; learn from teachers you trust and keep asking."
        ],
        links: [["/islam/madhahib", "The schools of law"], ["/islam/prayer-shia", "Prayer in the Ja'fari school"]]
      },
      {
        h2: "How to learn Islam without feeling overwhelmed",
        p: [
          "Take one topic a week: read a chapter, then put one small thing into practice. Keep a notebook of questions to take to a teacher; it is normal for some questions to take longer to answer than others.",
          "Learning with family works well in small doses: read a short chapter together, listen to one surah, or learn one of the 99 Names of Allah each day with its meaning. The Islamic calendar shows the dates of Ramadan, the two Eids and other important days, and the chapter on the Islamic year explains what they mean."
        ],
        links: [["/islam/names", "99 Names of Allah"], ["/calendar", "Islamic calendar"], ["/islam/eid", "The important days"]]
      }
    ],
    stepsTitle: "A gentle path for your first weeks",
    steps: [
      { title: "Read what Islam is", body: "Start with the short introduction to what Muslims believe and how they live." },
      { title: "Learn the articles of faith", body: "Read the chapter on iman and note down your questions." },
      { title: "Meet the Quran", body: "Listen to Al-Fatihah and a short surah and read the translation." },
      { title: "Get to know the Prophet", body: "Read the overview of his life, then continue with the seerah course." },
      { title: "Learn wudu and the prayer", body: "Use the trainers when you feel ready, one step at a time." },
      { title: "Find a teacher and a community", body: "Visit a mosque or a study circle where questions are welcome." }
    ],
    faqTitle: "Questions from beginners",
    faq: [
      { q: "I am new to Islam. Where do I start?", a: "With the short introductions to what Islam is, the articles of faith, the Quran and the Prophet. Then add wudu, the prayer and a few short surahs at your own pace, ideally with a teacher or a community nearby." },
      { q: "What are the basics of Islam?", a: "Belief in one God, His angels, His books, His prophets, the Last Day and divine decree, and the practice summed up in the pillars: testimony of faith, prayer, alms, fasting and pilgrimage. Everything else builds on these." },
      { q: "How do I become Muslim?", a: "Becoming Muslim centres on the testimony of faith, said sincerely and with an understanding of its meaning. Many people say it at a mosque in the presence of others, which also connects them with a community; an imam can guide you." },
      { q: "Can I learn about Islam online for free?", a: "Yes. All chapters, courses and tools on Quran Masterclass are free on the website, without ads, and the iOS app uses the same account." },
      { q: "Do I need to learn Arabic?", a: "Not to begin with. You can learn about Islam in your own language; the recitations of the prayer are learned gradually, and reading the Quran in Arabic can come with time." },
      { q: "What is the difference between Sunni and Shia?", a: "They are the two main branches of Islam. They share the Quran and the core practices, and their differences are rooted in early history and in law and theology. Our pages present both neutrally." },
      { q: "Is this site a substitute for a scholar or a mosque?", a: "No. It is an introduction and a companion for learning. For rulings and personal questions, please ask a qualified scholar, and look for a community where you can learn with others." }
    ],
    linksTitle: "Where to go next",
    links: [["/islam", "Islam overview"], ["/islam/islam", "What is Islam?"], ["/islam/iman", "Articles of faith"], ["/islam/quran", "The Quran"], ["/islam/prophet", "The Prophet"], ["/learn-salah", "Learn salah"], ["/learn-wudu", "Learn wudu"], ["/islam/madhahib", "Schools of law"], ["/islam/names", "99 Names of Allah"]],
    cta: ["/islam", "Start with the basics"]
  }
};

export default hubs;
