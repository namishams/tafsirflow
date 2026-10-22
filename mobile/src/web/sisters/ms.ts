import type { SistersText } from "./types";

// "Untuk muslimah" – Malay translation of en.ts.
const ms: SistersText = {
  kicker: "Untuk muslimah",
  title: "Pembelajaran anda berterusan setiap hari",
  lead: "Apa yang berubah dalam bacaan al-Quran semasa haid (ḥayḍ) dan selepas bersalin (nifas), bagaimana Kaedah Shams diteruskan, serta wanita-wanita yang meriwayatkan dan mengajarkan al-Quran. Pembelajaran tidak pernah terhenti; menurut sebahagian mazhab hanya bentuknya yang berubah.",
  reviewLine: "Kandungan sedang disemak oleh para ulama",
  notFatwa: "Ini ialah gambaran keseluruhan, bukan fatwa. Sila bertanya kepada ulama yang anda percayai, terutamanya dalam mazhab anda sendiri.",
  sourcesTitle: "Sumber",
  schools: { hanafi: "Hanafi", maliki: "Maliki", shafii: "Syafi'i", hanbali: "Hanbali", jafari: "Ja'fari (Syiah)", majority: "Majoriti ulama", contemporary: "Badan fatwa semasa" },
  open: "Buka",
  readVerse: "Baca dan dengar dalam al-Quran",
  entryTitle: "Untuk muslimah",
  entryLead: "Membaca al-Quran semasa haid, hari mendengar dan memahami dalam Kaedah Shams, serta wanita-wanita yang menyampaikan al-Quran.",
  entryCta: "Lihat",

  partRecite: {
    title: "Membaca, menghafal dan mushaf",
    lead: "Mazhab-mazhab berbeza pendapat terutamanya tentang membaca secara hafalan. Mendengar, zikir dan doa dibenarkan menurut semua sumber yang dinyatakan di sini.",
    blocks: [
      {
        id: "memory",
        title: "Membaca secara hafalan",
        positions: [
          { school: "hanafi", text: "Tidak dibenarkan dengan niat membaca al-Quran, walaupun kurang daripada satu ayat. Dibenarkan: ayat yang diucapkan dengan niat doa, zikir atau perlindungan, serta membaca dengan mata tanpa melafazkan. Seorang guru wanita boleh mengajar perkataan demi perkataan dengan berhenti seketika, kerana ini tidak dikira sebagai tilawah.", src: ["arij", "sgHanafi"] },
          { school: "maliki", text: "Selagi darah masih keluar, wanita yang haid – dan menurut Dar al-Ifta juga yang nifas – boleh membaca secara hafalan, sama ada dia bimbang terlupa atau tidak. Setelah darah berhenti tetapi sebelum mandi wajib, hanya jika dia bimbang terlupa.", src: ["ifta12343"] },
          { school: "shafii", text: "Walaupun satu ayat tidak dibenarkan. Ungkapan al-Quran yang diucapkan sebagai zikir dibenarkan.", src: ["sgShafii"] },
          { school: "hanbali", text: "Pendapat mazhab ialah larangan. Ibnu Taimiyah berpendapat membaca dibenarkan, juga semasa nifas apabila dia bimbang terlupa.", src: ["muftiwp18", "iqa2564"] },
          { school: "jafari", text: "Menurut Ayatullah al-Sistani, hanya empat ayat sajdah yang dilarang (32:15, 41:37, 53:62, 96:19) – ayat itu sahaja, bukan keseluruhan surah. Ayat-ayat lain tidak termasuk dalam larangan yang disenaraikan. Bagi nifas, perkara yang sama terpakai sebagai ihtiyat wajib.", src: ["sistani354", "sistani448", "sistani502"] },
          { school: "contemporary", text: "Mufti Wilayah Persekutuan Malaysia berpendapat bahawa mengulang hafalan dibenarkan, termasuk di sekolah tahfiz. islamqa.info menilai pendapat yang membenarkan lebih kuat sandarannya dan dengan berhati-hati menasihatkan agar hanya membaca apa yang dibimbangi akan terlupa.", src: ["muftiwp18", "iqa2564"] },
        ],
      },
      {
        id: "mushaf",
        title: "Menyentuh mushaf",
        positions: [
          { school: "majority", text: "Menurut majoriti ulama, menyentuh mushaf tanpa bersuci tidak dibenarkan.", src: ["iqa2564"] },
          { school: "hanafi", text: "Dibenarkan dengan kain atau sarung berasingan yang tidak melekat pada badan.", src: ["bham"] },
          { school: "maliki", text: "Wanita yang sedang belajar atau mengajar boleh menyentuh dan membawa mushaf atau sebahagiannya semasa belajar atau mengajar. Dar al-Ifta secara umumnya menasihatkan pendapat majoriti, tetapi membenarkan mengikut pendapat Maliki tanpa dosa dalam keperluan sebenar – menghafal, mengajar, mengajar sebagai profesion.", src: ["ifta12343"] },
          { school: "jafari", text: "Menyentuh tulisan al-Quran adalah dilarang.", src: ["sistani354", "sistani448"] },
        ],
      },
      {
        id: "screen",
        title: "Daripada skrin atau aplikasi",
        positions: [
          { school: "contemporary", text: "islamqa.info: telefon bukan mushaf; ia boleh disentuh tanpa bersuci. Dar al-Ifta (Mesir): menurut majoriti, membaca dilarang walau apa pun medianya; melihat skrin tanpa melafazkan dibenarkan.", src: ["iqa106961", "ifta7815"] },
          { school: "hanafi", text: "Darul Iftaa Azaadville: selagi teks al-Quran berada di skrin, skrin dan ikon pada halaman itu mengambil hukum mushaf; jangan menyentuhnya secara langsung, stylus boleh digunakan. Mendengar dibenarkan.", src: ["azaad"] },
        ],
      },
      {
        id: "always",
        title: "Yang sentiasa kekal",
        points: [
          { text: "Mendengar: mendengar bacaan al-Quran dibenarkan; sumber Hanafi menyebutnya sangat terpuji, juga daripada rakaman. Pejabat Mufti Malaysia mencadangkan mendengar sebagai ganti ulang kaji.", src: ["azaad", "sgHanafi", "muftiwp18"] },
          { text: "Zikir dan doa dibenarkan; majoriti ulama mengecualikan tepat kedua-duanya daripada larangan, selagi ia tidak dimaksudkan sebagai tilawah.", src: ["iqa2564", "sgShafii"] },
          { text: "Nabi ﷺ membaca al-Quran dengan kepala baginda di pangkuan ʿĀʾisyah ketika beliau sedang haid. Kedekatan dengan al-Quran tetap kekal.", src: ["bukhari297", "muslim301"] },
        ],
      },
    ],
  },

  partShams: {
    title: "Bagaimana Kaedah Shams diteruskan",
    lead: "Pada hari mendengar dan memahami, hafazan (ḥifẓ) anda tetap hidup tanpa membaca dengan suara. Hari berturut-turut dan taman anda terus berkembang.",
    steps: [
      { id: "listen", title: "Ḥifẓ dengan mendengar", text: "Dengar sabaq hari ini, sabqī dan manzil anda daripada seorang qari mahir, ayat demi ayat dan beberapa kali.", src: ["muftiwp18", "sgHanafi"] },
      { id: "eyes", title: "Ikuti dengan mata", text: "Ikuti bacaan secara senyap tanpa melafazkan. Sama ada anda menyentuh skrin semasa melakukannya bergantung pada mazhab anda (lihat di atas).", src: ["sgHanafi", "ifta7815", "azaad"] },
      { id: "understand", title: "Memahami (tadabbur)", text: "Makna, tafsir dan konteks ayat-ayat anda: langkah \"memahami\" dalam Kaedah Shams." },
      { id: "words", title: "Kosa kata", text: "Perkataan dalam ayat-ayat anda dan akar katanya, dengan kad imbas." },
      { id: "tajweed", title: "Teori tajwid dan makhārij", text: "Pelajari hukum-hukumnya, lihat rajah mulut dan huraian tempat keluar huruf. Sama ada anda berlatih huruf tunggal dengan suara, sila tanyakan kepada guru anda." },
      { id: "dua", title: "Zikir dan doa", text: "Doa dan zikir mengiringi setiap hari.", src: ["iqa2564"] },
    ],
    notes: [
      { text: "Guru wanita yang mengikut mazhab Hanafi boleh mengajar perkataan demi perkataan dengan berhenti seketika.", src: ["arij"] },
      { text: "Mereka yang mengikut mazhab Maliki boleh terus membaca selagi darah masih keluar dan boleh menyentuh mushaf semasa belajar atau mengajar.", src: ["ifta12343"] },
      { text: "Selepas darah berhenti: dalam mazhab Maliki membaca dibenarkan semula hanya selepas mandi wajib, kecuali dia bimbang terlupa.", src: ["ifta12343"] },
    ],
  },

  partSajda: {
    title: "Sujud tilawah (sajdat al-tilāwa)",
    lead: "Apa yang terpakai apabila anda mendengar atau membaca ayat sajdah.",
    positions: [
      { school: "hanafi", text: "Semasa haid dan nifas tidak dibenarkan dan tidak sah, dan ia tidak wajib atau diqada kemudian.", src: ["sgSajda"] },
      { school: "majority", text: "Bersuci adalah syarat; maka sujud tidak dilakukan (al-Sarakhsi, Ibnu Juzayy, al-Nawawi, al-Ruhaybani).", src: ["ifta24156"] },
      { school: "contemporary", text: "Pendapat lain menyatakan bahawa bersuci tidak disyaratkan (Ibnu Taimiyah, al-Syaukani). Dar al-Ifta lebih memilih pendapat majoriti, tetapi tidak menganggap berdosa wanita yang mengikut pendapat lain.", src: ["ifta24156"] },
      { school: "jafari", text: "Menurut al-Sistani, sujud wajib apabila membaca atau mendengar salah satu daripada empat ayat sajdah; wuduk atau mandi wajib tidak disyaratkan untuknya. Jika didengar daripada rakaman, ia tidak menjadi wajib – ini termasuk bacaan dalam aplikasi ini.", src: ["sistani1079"] },
    ],
  },

  partWomen: {
    title: "Wanita dan al-Quran",
    lead: "Untuk langkah \"memahami\": ayat-ayat tentang wanita, serta wanita-wanita yang memelihara, mengajarkan dan membaca al-Quran.",
    versesTitle: "Ayat untuk direnungi",
    verses: [
      { ref: "33:35", topic: "Lelaki dan wanita beriman disebut bersebelahan, dengan ganjaran yang sama." },
      { ref: "3:195", topic: "Tiada amalan yang sia-sia, sama ada daripada lelaki atau wanita." },
      { ref: "4:124", topic: "Amalan baik lelaki atau wanita yang beriman membawa ke syurga." },
      { ref: "16:97", topic: "Kehidupan yang baik bagi sesiapa yang beramal soleh dan beriman, lelaki atau wanita." },
      { ref: "58:1", topic: "Allah mendengar wanita yang mengadu tentang suaminya; surah ini membawa namanya (al-Mujādilah)." },
      { ref: "66:11", topic: "Doa isteri Firaun memohon sebuah rumah di syurga." },
      { ref: "66:12", topic: "Maryam, yang membenarkan kalimah-kalimah Tuhannya." },
      { ref: "3:42", topic: "Maryam dipilih dan disucikan (hingga 3:43)." },
      { ref: "28:7", topic: "Ilham kepada ibu Mūsā: jangan takut dan jangan bersedih." },
    ],
    companionsTitle: "Sahabiah yang menyampaikan al-Quran",
    companions: [
      { text: "Ḥafṣah binti ʿUmar menyimpan lembaran-lembaran (ṣuḥuf) himpunan al-Quran Abū Bakr; ʿUthmān menyalin mushaf-mushaf daripadanya dan mengembalikannya kepada beliau.", src: ["bukhari4986", "bukhari4987"] },
      { text: "Ummu Waraqah membaca al-Quran; Nabi ﷺ membenarkan baginya seorang muazin di rumahnya dan menyuruhnya mengimamkan ahli rumahnya dalam solat.", src: ["abudawud591", "abudawud592"] },
      { text: "ʿĀʾisyah menjelaskan ayat-ayat dan membetulkan tafsiran, contohnya tentang 2:158 dan 4:3.", src: ["bukhari1643", "muslim3018"] },
      { text: "Ummu Salamah menggambarkan bagaimana Nabi ﷺ membaca al-Fātiḥah ayat demi ayat, berhenti selepas setiap ayat – satu asas bagi tajwid dan waqaf.", src: ["abudawud4001", "tirmidhi2927"] },
    ],
    scholarsTitle: "Ulama wanita",
    scholars: [
      { text: "Karīmah al-Marwaziyyah (wafat 1069 di Makkah) ialah autoriti dalam periwayatan Ṣaḥīḥ al-Bukhārī.", src: ["karima"] },
      { text: "Fāṭimah binti Muḥammad al-Samarqandī menghafal karya fiqh ayahnya; fatwa-fatwa memuatkan tulisan tangannya di samping tulisan ayah dan suaminya.", src: ["samarqandi"] },
      { text: "Mohammad Akram Nadwi menulis sebuah kamus ulama hadis wanita dalam kira-kira 40 jilid dalam bahasa Arab; mukadimahnya diterbitkan sebagai \"Al-Muhaddithat: The Women Scholars in Islam\".", src: ["nadwi"] },
    ],
    recitersTitle: "Qariah",
    reciters: [
      { text: "Majlis Tilawah al-Quran Antarabangsa di Malaysia mempunyai kategori tersendiri untuk qariah (qāriʾa); pemenangnya termasuk Rogayah Sulong dan Faridah Mat Saman dari Malaysia serta Maria Ulfah dari Indonesia.", src: ["mtq", "aljazeera"] },
      { text: "Sebuah rakaman tahun 1905 oleh qariah Mesir Syeikhah Mabrūkah masih wujud; kini pelbagai inisiatif kembali mengetengahkan para qariah.", src: ["aljazeera"] },
    ],
  },

  partTogether: {
    title: "Belajar bersama guru wanita dan sesama muslimah",
    lead: "Bacaan al-Quran dipelajari dengan mendengar dan membaca di hadapan seorang guru.",
    teacher: "Hubungkan Kaedah Shams anda dengan guru pilihan anda: dia melihat pelan anda, dan rakaman anda apabila anda menghantarnya.",
    circles: "Dalam \"Bersama\" terdapat halaqah pembelajaran khas untuk muslimah.",
    teacherCta: "Hubungkan guru",
    circlesCta: "Halaqah muslimah",
  },

  setup: {
    title: "Sediakan \"Untuk muslimah\"?",
    lead: "Ruang pilihan yang mengiringi pembelajaran anda setiap hari.",
    points: [
      "Anda memilih mazhab anda. Apa yang dijeda pada hari-hari anda mengikut mazhab tersebut.",
      "\"Hari-hari saya\" ialah suis mudah: ya atau tidak. Tiada tarikh, tiada sejarah, tiada kalendar kitaran.",
      "Semuanya kekal di peranti ini sahaja. Tiada apa-apa yang diselaraskan dengan akaun anda atau dihantar ke pelayan mahupun AI; ia dipadam apabila anda log keluar.",
      "Anda boleh mengubah atau mematikannya pada bila-bila masa.",
    ],
    agree: "Ya, sediakan",
    decline: "Tidak, terima kasih",
    declined: "Baiklah. Kami tidak akan bertanya apa-apa lagi. Halaman \"Untuk muslimah\" tetap terbuka untuk anda di Terokai.",
    madhhabTitle: "Mazhab manakah yang anda ikuti?",
    madhhabLead: "Jika anda tidak tahu, pendapat berhati-hati majoriti ulama terpakai.",
    madhhabs: { hanafi: "Hanafi", maliki: "Maliki", shafii: "Syafi'i", hanbali: "Hanbali", jafari: "Ja'fari (Syiah)", unknown: "Saya tidak tahu" },
    done: "Selesai",
    later: "Anda akan menemui semuanya di Terokai → Untuk muslimah.",
  },

  days: {
    title: "Hari-hari saya",
    lead: "Satu suis, di peranti ini sahaja. Selagi ia hidup, aplikasi menjeda apa yang tidak diperuntukkan oleh mazhab anda pada hari-hari ini dan menghidupkan hari mendengar dan memahami. Hari berturut-turut dan taman anda kekal; ulang kaji dianjakkan ke hadapan dan tidak bertimbun.",
    question: "Adakah anda sedang dalam hari-hari anda sekarang?",
    yes: "Ya",
    no: "Tidak",
    statusOn: "Hidup: hari mendengar dan memahami sedang aktif.",
    statusOff: "Mati.",
    rules: {
      hanafi: "Hanafi: membaca secara hafalan dan latihan bacaan dijeda. Mendengar, mengikuti dengan mata, memahami, kosa kata, teori tajwid dan doa kekal.",
      maliki: "Maliki: membaca secara hafalan tetap dibenarkan selagi darah masih keluar. Aplikasi mengingatkan anda tentang perkara ini dan tidak menjeda. Sentuh mushaf hanya semasa belajar atau mengajar.",
      shafii: "Syafi'i: membaca secara hafalan dan latihan bacaan dijeda. Mendengar, mengikuti dengan mata, memahami, kosa kata, teori tajwid dan doa kekal.",
      hanbali: "Hanbali: membaca secara hafalan dan latihan bacaan dijeda (pendapat mazhab). Mendengar, mengikuti bacaan, memahami, kosa kata, teori tajwid dan doa kekal.",
      jafari: "Ja'fari: sila tinggalkan empat ayat sajdah (32:15, 41:37, 53:62, 96:19); aplikasi akan menandakannya. Bagi keadaan junub (janābah), al-Sistani (masalah 355) menyebut membaca lebih daripada tujuh ayat sebagai makruh; sama ada ini terpakai untuk haid, sila tanyakan marja' anda.",
      unknown: "Pendapat berhati-hati majoriti ulama: membaca secara hafalan dan latihan bacaan dijeda. Mendengar, mengikuti dengan mata, memahami, kosa kata, teori tajwid dan doa kekal.",
    },
    strictTitle: "Mod ketat",
    strictLead: "Pilihan anda sendiri: pada hari-hari anda semuanya dijeda kecuali mendengar dan doa, termasuk tafsir dan kosa kata. Tiada mazhab utama yang mewajibkan ini; mendengar, tafsir dan doa dibenarkan.",
    offTitle: "Saya sudah suci semula",
    offNote: "Selepas darah berhenti, mandi wajib (ghusl) diwajibkan; dalam mazhab Maliki membaca dibenarkan semula hanya selepasnya, kecuali dia bimbang terlupa.",
    ghuslLink: "Ke panduan mandi wajib",
    privacy: "Di peranti ini sahaja. Tiada tarikh, tiada sejarah, tiada pemindahan. Dipadam apabila anda log keluar.",
    changeMadhhab: "Tukar mazhab",
  },

  gate: {
    pausedTitle: "Dijeda sehingga hari-hari anda selesai",
    pausedMajority: "Menurut mazhab anda, seseorang tidak membaca secara hafalan pada hari-hari ini. Hafazan (ḥifẓ) anda tetap hidup: dengar ayat-ayat yang sama hari ini dan pelajari maknanya.",
    pausedStrict: "Anda memilih mod ketat: hari ini mendengar dan doa kekal.",
    noteMaliki: "Menurut mazhab Maliki, anda boleh membaca secara hafalan selagi darah masih keluar.",
    noteJafari: "Sila tinggalkan ayat-ayat sajdah 32:15, 41:37, 53:62 dan 96:19.",
    listenInstead: "Dengar dan bukan membaca hari ini",
    toSection: "Untuk muslimah",
    openAnyway: "Buka juga",
  },

  ld: {
    title: "Hari mendengar dan memahami",
    lead: "Apabila anda tidak dapat atau tidak mahu membaca dengan suara – dalam perjalanan, suara serak, pada hari-hari anda: wirid anda menjadi mendengar, memahami dan kosa kata. Hari berturut-turut dan taman kekal.",
    on: "Hari mendengar dan memahami",
    onHint: "Suis mudah seperti mod musafir, di peranti ini sahaja. Tiada tarikh disimpan.",
    activeTitle: "Hari ini: hari mendengar dan memahami",
    activeLead: "Hafazan (ḥifẓ) anda tetap hidup tanpa membaca dengan suara.",
    done: "Selesaikan hari mendengar",
    doneMsg: "Mā syāʾ Allāh. Hari mendengar anda dikira untuk hari berturut-turut dan taman anda.",
    off: "Membaca semula",
    sistersLink: "Nota untuk muslimah",
  },
};
export default ms;
