import type { SistersText } from "./types";

// "Untuk muslimah" – Indonesian translation of en.ts.
const idLang: SistersText = {
  kicker: "Untuk muslimah",
  title: "Belajar Anda berlanjut setiap hari",
  lead: "Apa yang berubah dalam membaca Al-Qur'an saat haid (ḥayḍ) dan setelah melahirkan (nifas), bagaimana Metode Shams berlanjut, serta para perempuan yang meriwayatkan dan mengajarkan Al-Qur'an. Belajar tidak pernah berhenti; menurut sebagian mazhab hanya bentuknya yang berubah.",
  reviewLine: "Konten sedang ditinjau oleh para ulama",
  notFatwa: "Ini adalah gambaran umum, bukan fatwa. Silakan bertanya kepada ulama yang Anda percayai, terutama dalam mazhab Anda sendiri.",
  sourcesTitle: "Sumber",
  schools: { hanafi: "Hanafi", maliki: "Maliki", shafii: "Syafi'i", hanbali: "Hanbali", jafari: "Ja'fari (Syiah)", majority: "Mayoritas ulama", contemporary: "Lembaga fatwa kontemporer" },
  open: "Buka",
  readVerse: "Baca dan dengarkan dalam Al-Qur'an",
  entryTitle: "Untuk muslimah",
  entryLead: "Membaca Al-Qur'an saat haid, hari mendengar dan memahami dalam Metode Shams, serta para perempuan yang menyampaikan Al-Qur'an.",
  entryCta: "Lihat",

  partRecite: {
    title: "Membaca, menghafal, dan mushaf",
    lead: "Mazhab-mazhab berbeda pendapat terutama tentang membaca dari hafalan. Mendengarkan, zikir, dan doa diperbolehkan menurut semua sumber yang disebutkan di sini.",
    blocks: [
      {
        id: "memory",
        title: "Membaca dari hafalan",
        positions: [
          { school: "hanafi", text: "Tidak diperbolehkan dengan niat membaca Al-Qur'an, bahkan kurang dari satu ayat. Diperbolehkan: ayat yang diucapkan dengan niat doa, zikir, atau perlindungan, serta membaca dengan mata tanpa melafalkan. Seorang guru perempuan boleh mengajar kata demi kata dengan jeda, karena ini tidak terhitung sebagai tilawah.", src: ["arij", "sgHanafi"] },
          { school: "maliki", text: "Selama darah masih keluar, perempuan yang haid – dan menurut Dar al-Ifta juga yang nifas – boleh membaca dari hafalan, baik ia khawatir lupa maupun tidak. Setelah darah berhenti tetapi sebelum mandi wajib, hanya jika ia khawatir lupa.", src: ["ifta12343"] },
          { school: "shafii", text: "Bahkan satu ayat pun tidak diperbolehkan. Ungkapan Al-Qur'an yang diucapkan sebagai zikir diperbolehkan.", src: ["sgShafii"] },
          { school: "hanbali", text: "Pendapat mazhab adalah larangan. Ibnu Taimiyah berpendapat membaca diperbolehkan, juga saat nifas jika ia khawatir lupa.", src: ["muftiwp18", "iqa2564"] },
          { school: "jafari", text: "Menurut Ayatullah al-Sistani, hanya empat ayat sajdah yang dilarang (32:15, 41:37, 53:62, 96:19) – ayatnya saja, bukan seluruh suratnya. Ayat-ayat lain tidak termasuk dalam larangan yang disebutkan. Untuk nifas berlaku hal yang sama sebagai kehati-hatian wajib.", src: ["sistani354", "sistani448", "sistani502"] },
          { school: "contemporary", text: "Mufti Wilayah Persekutuan Malaysia berpendapat bahwa mengulang hafalan diperbolehkan, juga di sekolah tahfiz. islamqa.info menilai pendapat yang membolehkan lebih kuat dalilnya dan dengan hati-hati menyarankan agar hanya membaca apa yang dikhawatirkan terlupa.", src: ["muftiwp18", "iqa2564"] },
        ],
      },
      {
        id: "mushaf",
        title: "Menyentuh mushaf",
        positions: [
          { school: "majority", text: "Menurut mayoritas ulama, menyentuh mushaf tanpa bersuci tidak diperbolehkan.", src: ["iqa2564"] },
          { school: "hanafi", text: "Diperbolehkan dengan kain atau sampul terpisah yang tidak melekat pada badan.", src: ["bham"] },
          { school: "maliki", text: "Perempuan yang sedang belajar atau mengajar boleh menyentuh dan membawa mushaf atau sebagiannya selama belajar atau mengajar. Dar al-Ifta umumnya menyarankan pendapat mayoritas, tetapi membolehkan mengikuti pendapat Maliki tanpa dosa dalam kebutuhan nyata – menghafal, mengajar, mengajar sebagai profesi.", src: ["ifta12343"] },
          { school: "jafari", text: "Menyentuh tulisan Al-Qur'an dilarang.", src: ["sistani354", "sistani448"] },
        ],
      },
      {
        id: "screen",
        title: "Dari layar atau aplikasi",
        positions: [
          { school: "contemporary", text: "islamqa.info: ponsel bukanlah mushaf; ia boleh disentuh tanpa bersuci. Dar al-Ifta (Mesir): menurut mayoritas, membaca dilarang apa pun medianya; melihat layar tanpa melafalkan diperbolehkan.", src: ["iqa106961", "ifta7815"] },
          { school: "hanafi", text: "Darul Iftaa Azaadville: selama teks Al-Qur'an ada di layar, layar dan ikon pada halaman itu mengambil hukum mushaf; jangan menyentuhnya secara langsung, stylus dapat digunakan. Mendengarkan diperbolehkan.", src: ["azaad"] },
        ],
      },
      {
        id: "always",
        title: "Yang selalu tetap",
        points: [
          { text: "Mendengarkan: mendengar bacaan Al-Qur'an diperbolehkan; sumber Hanafi menyebutnya sangat terpuji, juga dari rekaman. Kantor Mufti Malaysia menganjurkan mendengarkan sebagai pengganti murajaah.", src: ["azaad", "sgHanafi", "muftiwp18"] },
          { text: "Zikir dan doa diperbolehkan; mayoritas ulama mengecualikan justru keduanya dari larangan, selama tidak dimaksudkan sebagai tilawah.", src: ["iqa2564", "sgShafii"] },
          { text: "Nabi ﷺ membaca Al-Qur'an dengan kepala beliau di pangkuan ʿĀʾisyah ketika ia sedang haid. Kedekatan dengan Al-Qur'an tetap ada.", src: ["bukhari297", "muslim301"] },
        ],
      },
    ],
  },

  partShams: {
    title: "Bagaimana Metode Shams berlanjut",
    lead: "Pada hari mendengar dan memahami, hafalan (ḥifẓ) Anda tetap hidup tanpa membaca dengan suara. Streak dan taman Anda terus tumbuh.",
    steps: [
      { id: "listen", title: "Ḥifẓ dengan mendengarkan", text: "Dengarkan sabaq hari ini, sabqī, dan manzil Anda dari seorang qari ahli, ayat demi ayat dan berulang kali.", src: ["muftiwp18", "sgHanafi"] },
      { id: "eyes", title: "Ikuti dengan mata", text: "Ikuti bacaan dalam hati tanpa melafalkan. Apakah Anda menyentuh layar saat melakukannya bergantung pada mazhab Anda (lihat di atas).", src: ["sgHanafi", "ifta7815", "azaad"] },
      { id: "understand", title: "Memahami (tadabbur)", text: "Makna, tafsir, dan konteks ayat-ayat Anda: langkah \"memahami\" dalam Metode Shams." },
      { id: "words", title: "Kosakata", text: "Kata-kata dalam ayat Anda beserta akar katanya, dengan kartu hafalan." },
      { id: "tajweed", title: "Teori tajwid dan makhārij", text: "Pelajari kaidahnya, lihat diagram mulut dan uraian tempat keluarnya huruf. Apakah Anda berlatih huruf tunggal dengan suara, silakan tanyakan kepada guru Anda." },
      { id: "dua", title: "Zikir dan doa", text: "Doa dan zikir menyertai setiap hari.", src: ["iqa2564"] },
    ],
    notes: [
      { text: "Guru perempuan yang mengikuti mazhab Hanafi boleh mengajar kata demi kata dengan jeda.", src: ["arij"] },
      { text: "Yang mengikuti mazhab Maliki boleh tetap membaca selama darah masih keluar dan boleh menyentuh mushaf selama belajar atau mengajar.", src: ["ifta12343"] },
      { text: "Setelah darah berhenti: dalam mazhab Maliki membaca diperbolehkan kembali hanya setelah mandi wajib, kecuali ia khawatir lupa.", src: ["ifta12343"] },
    ],
  },

  partSajda: {
    title: "Sujud tilawah (sajdat al-tilāwa)",
    lead: "Apa yang berlaku ketika Anda mendengar atau membaca ayat sajdah.",
    positions: [
      { school: "hanafi", text: "Saat haid dan nifas tidak diperbolehkan dan tidak sah, dan tidak wajib atau diqada kemudian.", src: ["sgSajda"] },
      { school: "majority", text: "Bersuci adalah syarat; maka sujud tidak dilakukan (al-Sarakhsi, Ibnu Juzayy, al-Nawawi, al-Ruhaybani).", src: ["ifta24156"] },
      { school: "contemporary", text: "Pendapat lain menyatakan bahwa bersuci tidak disyaratkan (Ibnu Taimiyah, al-Syaukani). Dar al-Ifta lebih memilih pendapat mayoritas, tetapi tidak menganggap berdosa perempuan yang mengikuti pendapat lain.", src: ["ifta24156"] },
      { school: "jafari", text: "Menurut al-Sistani, sujud wajib ketika membaca atau mendengar salah satu dari empat ayat sajdah; wudu atau mandi wajib tidak disyaratkan untuknya. Jika didengar dari rekaman, sujud tidak menjadi wajib – ini termasuk bacaan dalam aplikasi ini.", src: ["sistani1079"] },
    ],
  },

  partWomen: {
    title: "Perempuan dan Al-Qur'an",
    lead: "Untuk langkah \"memahami\": ayat-ayat tentang perempuan, serta para perempuan yang menjaga, mengajarkan, dan membaca Al-Qur'an.",
    versesTitle: "Ayat untuk direnungkan",
    verses: [
      { ref: "33:35", topic: "Laki-laki dan perempuan beriman disebut berdampingan, dengan pahala yang sama." },
      { ref: "3:195", topic: "Tidak ada amal yang sia-sia, baik dari laki-laki maupun perempuan." },
      { ref: "4:124", topic: "Amal saleh laki-laki atau perempuan yang beriman mengantarkan ke surga." },
      { ref: "16:97", topic: "Kehidupan yang baik bagi siapa pun yang beramal saleh dan beriman, laki-laki atau perempuan." },
      { ref: "58:1", topic: "Allah mendengar perempuan yang mengadukan perihal suaminya; surat ini menyandang namanya (al-Mujādilah)." },
      { ref: "66:11", topic: "Doa istri Firaun memohon sebuah rumah di surga." },
      { ref: "66:12", topic: "Maryam, yang membenarkan kalimat-kalimat Tuhannya." },
      { ref: "3:42", topic: "Maryam dipilih dan disucikan (sampai 3:43)." },
      { ref: "28:7", topic: "Ilham kepada ibu Mūsā: jangan takut dan jangan bersedih." },
    ],
    companionsTitle: "Sahabat perempuan yang menyampaikan Al-Qur'an",
    companions: [
      { text: "Ḥafṣah binti ʿUmar menyimpan lembaran-lembaran (ṣuḥuf) hasil pengumpulan Al-Qur'an oleh Abū Bakr; ʿUtsmān menyalin mushaf-mushaf darinya lalu mengembalikannya kepadanya.", src: ["bukhari4986", "bukhari4987"] },
      { text: "Ummu Waraqah membaca Al-Qur'an; Nabi ﷺ mengizinkan baginya seorang muazin di rumahnya dan memerintahkannya mengimami penghuni rumahnya dalam salat.", src: ["abudawud591", "abudawud592"] },
      { text: "ʿĀʾisyah menjelaskan ayat-ayat dan meluruskan penafsiran, misalnya tentang 2:158 dan 4:3.", src: ["bukhari1643", "muslim3018"] },
      { text: "Ummu Salamah menggambarkan bagaimana Nabi ﷺ membaca al-Fātiḥah ayat demi ayat, berhenti setelah setiap ayat – sebuah dasar bagi tajwid dan waqaf.", src: ["abudawud4001", "tirmidhi2927"] },
    ],
    scholarsTitle: "Ulama perempuan",
    scholars: [
      { text: "Karīmah al-Marwaziyyah (wafat 1069 di Makkah) adalah otoritas dalam periwayatan Ṣaḥīḥ al-Bukhārī.", src: ["karima"] },
      { text: "Fāṭimah binti Muḥammad al-Samarqandī hafal karya fikih ayahnya; fatwa-fatwa memuat tulisan tangannya di samping tulisan ayah dan suaminya.", src: ["samarqandi"] },
      { text: "Mohammad Akram Nadwi menulis kamus para ahli hadis perempuan dalam sekitar 40 jilid berbahasa Arab; pengantarnya terbit sebagai \"Al-Muhaddithat: The Women Scholars in Islam\".", src: ["nadwi"] },
    ],
    recitersTitle: "Qariah",
    reciters: [
      { text: "Musabaqah Tilawah Al-Qur'an Internasional di Malaysia memiliki kategori tersendiri untuk qariah (qāriʾa); para pemenangnya antara lain Rogayah Sulong dan Faridah Mat Saman dari Malaysia serta Maria Ulfah dari Indonesia.", src: ["mtq", "aljazeera"] },
      { text: "Sebuah rekaman tahun 1905 dari qariah Mesir Syaikhah Mabrūkah masih ada; kini berbagai inisiatif kembali menampilkan para qariah.", src: ["aljazeera"] },
    ],
  },

  partTogether: {
    title: "Belajar bersama guru perempuan dan sesama muslimah",
    lead: "Bacaan Al-Qur'an dipelajari dengan mendengarkan dan membaca di hadapan seorang guru.",
    teacher: "Hubungkan Metode Shams Anda dengan guru pilihan Anda: ia melihat rencana Anda, dan rekaman Anda bila Anda mengirimkannya.",
    circles: "Di \"Bersama\" ada halaqah belajar khusus muslimah.",
    teacherCta: "Hubungkan guru",
    circlesCta: "Halaqah muslimah",
  },

  setup: {
    title: "Atur \"Untuk muslimah\"?",
    lead: "Area opsional yang menemani belajar Anda setiap hari.",
    points: [
      "Anda memilih mazhab Anda. Apa yang dijeda pada hari-hari Anda mengikuti mazhab tersebut.",
      "\"Hari-hari saya\" adalah sakelar sederhana: ya atau tidak. Tanpa tanggal, tanpa riwayat, tanpa kalender siklus.",
      "Semuanya hanya tersimpan di perangkat ini. Tidak ada yang disinkronkan dengan akun Anda atau dikirim ke server maupun AI; semuanya dihapus saat Anda keluar.",
      "Anda dapat mengubah atau mematikannya kapan saja.",
    ],
    agree: "Ya, atur",
    decline: "Tidak, terima kasih",
    declined: "Tentu. Kami tidak akan menanyakan apa pun lagi. Halaman \"Untuk muslimah\" tetap terbuka untuk Anda di Jelajahi.",
    madhhabTitle: "Mazhab mana yang Anda ikuti?",
    madhhabLead: "Jika Anda tidak tahu, berlaku pendapat hati-hati dari mayoritas ulama.",
    madhhabs: { hanafi: "Hanafi", maliki: "Maliki", shafii: "Syafi'i", hanbali: "Hanbali", jafari: "Ja'fari (Syiah)", unknown: "Saya tidak tahu" },
    done: "Selesai",
    later: "Anda akan menemukan semuanya di Jelajahi → Untuk muslimah.",
  },

  days: {
    title: "Hari-hari saya",
    lead: "Sebuah sakelar, hanya di perangkat ini. Selama aktif, aplikasi menjeda apa yang tidak diperkenankan mazhab Anda pada hari-hari ini dan mengaktifkan hari mendengar dan memahami. Streak dan taman Anda tetap; murajaah bergeser ke depan alih-alih menumpuk.",
    question: "Apakah Anda sedang dalam hari-hari Anda sekarang?",
    yes: "Ya",
    no: "Tidak",
    statusOn: "Aktif: hari mendengar dan memahami sedang berjalan.",
    statusOff: "Nonaktif.",
    rules: {
      hanafi: "Hanafi: membaca dari hafalan dan latihan bacaan dijeda. Mendengarkan, mengikuti dengan mata, memahami, kosakata, teori tajwid, dan doa tetap berjalan.",
      maliki: "Maliki: membaca dari hafalan tetap diperbolehkan selama darah masih keluar. Aplikasi mengingatkan Anda tentang hal ini alih-alih menjeda. Sentuh mushaf hanya selama belajar atau mengajar.",
      shafii: "Syafi'i: membaca dari hafalan dan latihan bacaan dijeda. Mendengarkan, mengikuti dengan mata, memahami, kosakata, teori tajwid, dan doa tetap berjalan.",
      hanbali: "Hanbali: membaca dari hafalan dan latihan bacaan dijeda (pendapat mazhab). Mendengarkan, mengikuti bacaan, memahami, kosakata, teori tajwid, dan doa tetap berjalan.",
      jafari: "Ja'fari: mohon lewati empat ayat sajdah (32:15, 41:37, 53:62, 96:19); aplikasi akan menandainya. Untuk keadaan junub (janābah), al-Sistani (masalah 355) menyebut membaca lebih dari tujuh ayat sebagai makruh; apakah ini berlaku untuk haid, silakan tanyakan kepada marja' Anda.",
      unknown: "Pendapat hati-hati mayoritas ulama: membaca dari hafalan dan latihan bacaan dijeda. Mendengarkan, mengikuti dengan mata, memahami, kosakata, teori tajwid, dan doa tetap berjalan.",
    },
    strictTitle: "Mode ketat",
    strictLead: "Pilihan Anda sendiri: pada hari-hari Anda semuanya dijeda kecuali mendengarkan dan doa, termasuk tafsir dan kosakata. Tidak ada mazhab besar yang mewajibkan ini; mendengarkan, tafsir, dan doa diperbolehkan.",
    offTitle: "Saya sudah suci kembali",
    offNote: "Setelah darah berhenti, mandi wajib (ghusl) diwajibkan; dalam mazhab Maliki membaca diperbolehkan kembali hanya setelahnya, kecuali ia khawatir lupa.",
    ghuslLink: "Ke panduan mandi wajib",
    privacy: "Hanya di perangkat ini. Tanpa tanggal, tanpa riwayat, tanpa pengiriman. Dihapus saat Anda keluar.",
    changeMadhhab: "Ubah mazhab",
  },

  gate: {
    pausedTitle: "Dijeda sampai hari-hari Anda selesai",
    pausedMajority: "Menurut mazhab Anda, seseorang tidak membaca dari hafalan pada hari-hari ini. Hafalan (ḥifẓ) Anda tetap hidup: dengarkan ayat-ayat yang sama hari ini dan pelajari maknanya.",
    pausedStrict: "Anda memilih mode ketat: hari ini mendengarkan dan doa tetap berjalan.",
    noteMaliki: "Menurut mazhab Maliki, Anda boleh membaca dari hafalan selama darah masih keluar.",
    noteJafari: "Mohon lewati ayat-ayat sajdah 32:15, 41:37, 53:62, dan 96:19.",
    listenInstead: "Dengarkan alih-alih membaca hari ini",
    toSection: "Untuk muslimah",
    openAnyway: "Tetap buka",
  },

  ld: {
    title: "Hari mendengar dan memahami",
    lead: "Ketika Anda tidak dapat atau tidak ingin membaca dengan suara – dalam perjalanan, suara serak, pada hari-hari Anda: wirid Anda menjadi mendengarkan, memahami, dan kosakata. Streak dan taman tetap.",
    on: "Hari mendengar dan memahami",
    onHint: "Sakelar sederhana seperti mode perjalanan, hanya di perangkat ini. Tidak ada tanggal yang disimpan.",
    activeTitle: "Hari ini: hari mendengar dan memahami",
    activeLead: "Hafalan (ḥifẓ) Anda tetap hidup tanpa membaca dengan suara.",
    done: "Selesaikan hari mendengar",
    doneMsg: "Mā syāʾ Allāh. Hari mendengar Anda terhitung untuk streak dan taman Anda.",
    off: "Membaca lagi",
    sistersLink: "Catatan untuk muslimah",
  },
};
export default idLang;
