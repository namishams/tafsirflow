import type { Hub, HubId } from "../types";

const hubs: Record<HubId, Hub> = {
  "learn-quran": {
    title: "Belajar Quran dari Asas: Panduan Dewasa dan Pemula",
    description: "Belajar Quran dari kosong: huruf hijaiyah, membaca, tajwid, surah pendek dan rutin harian. Panduan percuma untuk dewasa, kanak-kanak dan mualaf.",
    kicker: "Panduan untuk pemula",
    h1: "Belajar Quran dari asas, mengikut rentak anda",
    intro: "Belajar Quran boleh dimulakan pada usia berapa pun, walaupun anda belum mengenal satu huruf Arab. Panduan ini menyusun perjalanan itu dalam urutan yang jelas: huruf hijaiyah, membaca, tajwid, surah pendek, kemudian rutin harian yang boleh dikekalkan. Semua alat yang disebut di sini percuma di laman web Quran Masterclass.",
    answer: "Belajar Quran lazimnya melalui lima peringkat: mengenal huruf dan baris Arab, membaca perkataan dan ayat, mempelajari tajwid, membaca serta menghafaz surah pendek, dan mengekalkan rutin harian yang singkat. Orang dewasa, kanak-kanak dan mualaf boleh bermula dari kosong. Quran Masterclass menyediakan kursus membaca, pelajaran tajwid dan 114 surah dengan audio ayat demi ayat serta terjemahan dalam 14 bahasa, percuma di laman web dan dengan akaun yang sama dalam aplikasi iOS.",
    sections: [
      {
        h2: "Dari mana nak mula belajar Quran",
        p: [
          "Langkah pertama ialah menilai kedudukan anda dengan jujur. Ada yang belum mengenal huruf Arab langsung, ada yang boleh membaca tetapi tersekat-sekat dan kerap tersilap, dan ada yang lancar membaca tetapi belum memahami maknanya. Setiap kumpulan memerlukan titik permulaan yang berbeza.",
          "Jika huruf masih asing, mulakan dengan kursus membaca. Jika anda sudah boleh membaca, tumpukan perhatian pada tajwid dan banyak mendengar qari. Jika bacaan sudah lancar, tambah terjemahan, tafsir dan kosa kata. Tiada peringkat yang memalukan; yang penting ialah bermula di tempat yang betul supaya kemajuan dapat dirasai.",
        ],
        links: [["/arabic/read", "Kursus membaca Arab"], ["/how", "Cara Quran Masterclass berfungsi"]],
      },
      {
        h2: "Apa yang perlu dipelajari sebelum membaca Quran",
        p: [
          "Asasnya ialah huruf hijaiyah dan baris. Huruf Arab berubah bentuk mengikut kedudukannya di awal, tengah atau hujung perkataan, dan bunyinya ditentukan oleh baris seperti fathah, kasrah, dhammah, sukun, syaddah dan tanwin. Selepas itu barulah anda mengenal huruf mad yang memanjangkan bunyi.",
          "Kursus membaca di Quran Masterclass mengikut susunan Qaidah yang digunakan di sekolah-sekolah Quran, dalam dua puluh peringkat: daripada huruf tunggal kepada suku kata, perkataan dan akhirnya ayat. Latihannya menggunakan perkataan sebenar daripada Quran, rakaman sebutan, latihan kelajuan dan semakan bacaan dalam pelayar. Mereka yang pernah belajar dengan buku Iqra' akan mendapati logiknya serupa.",
        ],
        links: [["/arabic/read", "Kursus membaca"], ["/arabic", "Bahasa Arab untuk Quran"]],
      },
      {
        h2: "Belajar baca Quran tanpa rumi",
        p: [
          "Transliterasi rumi membantu pada minggu-minggu pertama, tetapi ia mudah menjadi tongkat yang sukar dilepaskan. Beberapa bunyi seperti ain, ha besar, qaf dan dhad tidak mempunyai padanan tepat dalam huruf rumi, jadi bacaan yang bergantung pada rumi sering tersasar.",
          "Gunakan transliterasi sebagai bantuan sementara, kemudian kurangkan sedikit demi sedikit. Dalam pembaca Quran, anda boleh memaparkan atau menyembunyikan transliterasi, mengetik satu perkataan untuk mendengarnya sahaja, dan mengulang ayat bersama qari sehingga mata anda membaca terus daripada tulisan Arab.",
        ],
        links: [["/quran", "Baca dan dengar Quran"], ["/reciters", "Pilih qari"]],
      },
      {
        h2: "Tajwid sedikit demi sedikit",
        p: [
          "Tajwid ialah peraturan sebutan yang menjaga bacaan daripada tersilap. Mulakan dengan makhraj huruf, kemudian hukum yang muncul pada hampir setiap halaman seperti nun sakinah, tanwin dan mim sakinah. Qalqalah dan mad boleh menyusul selepas itu.",
          "Ambil satu hukum sahaja dalam satu tempoh, latih pada beberapa contoh, dan dengar bagaimana qari membacanya. Setiap pelajaran tajwid di sini mengikut riwayat Hafs dari Asim dan disertakan contoh ayat serta kuiz pendek.",
        ],
        links: [["/tajweed", "Pelajaran tajwid"], ["/tajweed/makharij", "Makhraj huruf"], ["/tajweed-online", "Panduan tajwid online"]],
      },
      {
        h2: "Surah pendek dan Juzuk Amma sebagai bahan latihan",
        p: [
          "Setelah boleh membaca, berlatihlah pada surah pendek. Surah al-Fatihah dibaca dalam setiap rakaat solat, dan surah-surah pendek dalam Juzuk Amma, iaitu surah 78 hingga 114, sering dibaca dalam solat. Membaca dan menghafaznya memberi manfaat berganda: bacaan bertambah lancar dan solat lebih dihayati.",
          "Akademi Quran Masterclass menyusun laluan melalui semua 114 surah, bermula dengan al-Fatihah dan surah-surah paling pendek. Setiap pelajaran dipelajari dengan Kaedah Shams dan diakhiri dengan ujian bermasa; anda lulus dengan markah 70 peratus atau lebih.",
        ],
        links: [["/surah/1", "Surah al-Fatihah"], ["/academy", "Akademi"], ["/guides/juz-amma-learning-plan", "Pelan Juzuk Amma"]],
      },
      {
        h2: "Rutin belajar Quran 15 minit sehari",
        p: [
          "Sesi pendek yang tetap lebih berkesan daripada sesi panjang yang jarang-jarang. Satu contoh susunan 15 minit: tiga minit mengulang huruf atau ayat semalam, tujuh minit untuk bahan baharu, dan lima minit mendengar bacaan sambil membaca terjemahan.",
          "Kaitkan rutin ini dengan waktu yang sudah tetap dalam hari anda, misalnya selepas Subuh atau sebelum tidur. Halaman Hari ini menunjukkan ayat yang perlu diulang kaji dan tempat anda berhenti, manakala Pelan 365 hari sesuai apabila anda mula menghafaz secara teratur.",
        ],
        links: [["/today", "Halaman Hari ini"], ["/plan", "Pelan 365 hari"], ["/guides/daily-quran-routine", "Panduan rutin harian"]],
      },
      {
        h2: "Belajar Quran untuk dewasa, kanak-kanak dan mualaf",
        p: [
          "Orang dewasa biasanya cepat memahami peraturan tetapi memerlukan masa untuk membiasakan lidah. Belajar secara peribadi di rumah mengikut rentak sendiri membantu mereka yang segan untuk bermula di kelas. Kanak-kanak pula paling banyak belajar melalui telinga: sesi pendek, banyak mendengar dan pujian untuk setiap kemajuan kecil.",
          "Bagi mualaf, al-Fatihah dan beberapa surah pendek untuk solat ialah keutamaan, seiring dengan asas Islam. Pada setiap peringkat, guru yang mendengar bacaan anda secara berdepan tetap sangat bernilai, kerana tradisi talaqqi membetulkan perkara yang tidak dapat dikesan oleh aplikasi.",
        ],
        links: [["/guides/quran-for-kids", "Quran untuk kanak-kanak"], ["/learn-islam", "Belajar tentang Islam"]],
      },
    ],
    stepsTitle: "Langkah belajar Quran dari asas",
    steps: [
      { title: "Tentukan titik permulaan", body: "Nilai sama ada anda perlu bermula dengan huruf, dengan tajwid atau dengan makna, lalu pilih bahagian yang sepadan." },
      { title: "Kuasai huruf dan baris", body: "Ikuti kursus membaca peringkat demi peringkat selama 10 hingga 15 minit sehari sehingga anda boleh membaca perkataan tanpa rumi." },
      { title: "Baca bersama audio", body: "Buka satu surah pendek, dengar setiap ayat beberapa kali, kemudian baca bersama qari dan akhirnya sendiri." },
      { title: "Tambah satu hukum tajwid", body: "Pelajari satu hukum, jawab kuiznya dan cari hukum itu dalam ayat yang sedang anda baca." },
      { title: "Hafaz al-Fatihah dan surah pendek", body: "Gunakan Kaedah Shams untuk menghafaz surah yang anda baca dalam solat." },
      { title: "Kekalkan rutin dan cari guru", body: "Jaga sesi harian yang pendek dan, apabila berpeluang, perdengarkan bacaan anda kepada guru." },
    ],
    faqTitle: "Soalan lazim tentang belajar Quran",
    faq: [
      { q: "Macam mana nak belajar Quran dari kosong?", a: "Mulakan dengan huruf hijaiyah dan baris melalui kursus membaca, kemudian baca surah pendek bersama audio. Apabila bacaan mula lancar, tambah tajwid dan makna secara beransur-ansur." },
      { q: "Belajar Quran sendiri tanpa guru, boleh ke?", a: "Anda boleh membina asas yang kukuh sendiri dengan kursus, audio dan latihan. Namun sebutan lebih mudah diperbetulkan oleh guru yang mendengar bacaan anda, jadi gabungkan belajar sendiri dengan sesi bersama guru apabila boleh." },
      { q: "Berapa lama untuk pandai membaca Quran?", a: "Tiada tempoh yang sama bagi semua orang. Ia bergantung pada masa latihan, latar belakang dan konsistensi. Ukur kemajuan anda dengan peringkat kursus yang telah selesai, bukan dengan tarikh akhir." },
      { q: "Bolehkah belajar Quran menggunakan aplikasi saja?", a: "Aplikasi dan laman web sangat membantu untuk huruf, mendengar, mengulang dan menghafaz. Untuk membetulkan sebutan secara halus, guru tetap diperlukan. Laman web Quran Masterclass dan aplikasi iOS menggunakan akaun yang sama, jadi anda boleh berpindah antara keduanya." },
      { q: "Nak belajar mengaji tapi malu sudah dewasa, bagaimana?", a: "Ramai orang dewasa bermula lewat, dan itu perkara biasa. Anda boleh belajar secara peribadi di rumah mengikut rentak sendiri, kemudian menyertai kelas atau guru apabila sudah lebih yakin." },
      { q: "Adakah Quran Masterclass percuma?", a: "Ya. Laman web ini percuma, tanpa yuran dan tanpa iklan, dan dibiayai secara persendirian oleh pengasasnya, Nami Shams. Quran Masterclass dikendalikan oleh ICSL FZE – Islamic Coding & Software Lab, Sharjah." },
      { q: "Bagaimana belajar mengaji bersama anak di rumah?", a: "Duduk bersama untuk sesi pendek, dengar satu surah pendek beberapa kali dan biarkan anak meniru qari. Stesen radio Untuk kanak-kanak dan panduan Quran untuk kanak-kanak menyediakan bahan yang sesuai." },
    ],
    linksTitle: "Terus belajar",
    links: [["/arabic/read", "Kursus membaca Arab"], ["/quran", "Baca dan dengar Quran"], ["/tajweed", "Pelajaran tajwid"], ["/academy", "Akademi Quran"], ["/guides/how-to-learn-the-quran", "Panduan: cara belajar Quran"], ["/guides/learn-to-read-the-quran", "Panduan: belajar membaca Quran"], ["/guides/quran-for-kids", "Panduan: Quran untuk kanak-kanak"], ["/app", "Aplikasi iOS"]],
    cta: ["/arabic/read", "Mulakan kursus membaca"],
  },
  "quran-tafsir": {
    title: "Tafsir Quran Dalam Talian Ayat Demi Ayat",
    description: "Fahami makna Quran dengan tafsir dan terjemahan ayat demi ayat: beza terjemahan dan tafsir, cara belajar surah demi surah, tradisi Sunni dan Syiah.",
    kicker: "Memahami Quran",
    h1: "Tafsir Quran: memahami makna ayat demi ayat",
    intro: "Tafsir Quran ialah ilmu yang menjelaskan maksud ayat, konteks penurunannya dan hubungannya dengan ayat-ayat lain. Panduan ini menerangkan beza tafsir dengan terjemahan, cara belajar surah demi surah dan tradisi tafsir yang utama, serta cara membaca teks, terjemahan dan tafsir sambil mendengar bacaan di Quran Masterclass.",
    answer: "Tafsir Quran ialah penjelasan ulama tentang makna, konteks dan pengajaran ayat-ayat Quran, manakala terjemahan hanya memindahkan makna ke bahasa lain. Cara yang praktikal untuk bermula ialah membaca satu surah ayat demi ayat: teks Arab, terjemahan, kemudian tafsir daripada sumber yang dinyatakan namanya. Quran Masterclass memaparkan ketiga-tiganya bagi 114 surah bersama audio, percuma di laman web dan dengan akaun yang sama dalam aplikasi iOS.",
    sections: [
      {
        h2: "Apakah beza terjemahan dan tafsir Quran",
        p: [
          "Terjemahan memilih satu makna dalam bahasa sasaran. Satu perkataan Arab boleh membawa beberapa makna, jadi penterjemah terpaksa memilih, dan pilihan itu sendiri sudah sejenis tafsiran ringkas. Tafsir pula menerangkan mengapa sesuatu makna dipilih, latar peristiwa, kaitan dengan ayat lain dan pengajaran yang diambil oleh ulama.",
          "Di Malaysia, ramai mengenali terjemahan berserta huraian ringkas seperti Tafsir Pimpinan ar-Rahman, dan tafsir penuh seperti Tafsir al-Azhar karya Hamka. Kedua-dua jenis bahan ini saling melengkapi: terjemahan untuk bacaan harian, tafsir untuk kefahaman yang lebih mendalam.",
        ],
        links: [["/quran", "Quran dengan terjemahan"], ["/guides/understanding-the-quran-tafsir", "Panduan memahami tafsir"]],
      },
      {
        h2: "Cara membaca tafsir Quran dengan betul",
        p: [
          "Baca ayat dahulu dalam bahasa Arab dan terjemahan, barulah tafsirnya. Perhatikan nama sumber dan pengarangnya, kerana setiap tafsir mempunyai pendekatan sendiri. Bezakan antara penjelasan yang bersandarkan riwayat dengan pendapat peribadi pengarang.",
          "Jangan memetik satu ayat terpisah daripada ayat sebelum dan selepasnya; banyak salah faham timbul daripada bacaan yang terputus konteks. Jika dua tafsir memberi huraian berbeza, itu perkara biasa dalam tradisi ilmu. Soalan hukum yang menyentuh kehidupan anda hendaklah dibawa kepada guru atau ulama mazhab yang anda ikuti.",
        ],
        links: [["/surah/1", "Mulakan dengan al-Fatihah"]],
      },
      {
        h2: "Belajar tafsir surah demi surah",
        p: [
          "Urutan yang mesra pemula ialah al-Fatihah dahulu kerana ia dibaca dalam setiap solat, kemudian surah pendek seperti al-Asr dan al-Ikhlas, diikuti surah yang bercerita seperti Yusuf dan al-Kahf. Surah panjang seperti al-Baqarah lebih mudah didekati setelah anda biasa dengan gaya bahasa Quran.",
          "Bagi setiap surah, catat tema utamanya, beberapa perkataan kunci dan satu soalan yang mahu anda tanyakan. Dalam pembaca Quran, setiap ayat mempunyai ruang nota peribadi, jadi renungan anda tersimpan bersama ayatnya.",
        ],
        links: [["/surah/103", "Surah al-Asr"], ["/surah/12", "Surah Yusuf"], ["/surah/18", "Surah al-Kahf"]],
      },
      {
        h2: "Tafsir klasik dan pendekatan moden",
        p: [
          "Tradisi klasik membezakan tafsir berasaskan riwayat, iaitu menjelaskan Quran dengan Quran, hadis dan kata-kata generasi awal, dengan tafsir berasaskan ijtihad yang menggunakan bahasa, usul dan penalaran mengikut kaedah ilmu. Karya seperti tafsir al-Tabari, Ibn Kathir dan al-Qurtubi antara rujukan besar dalam tradisi Sunni.",
          "Pendekatan moden pula sering menyusun tafsir mengikut tema, seperti keluarga, keadilan atau alam, dan menggunakan bahasa semasa untuk pembaca awam. Kedua-dua pendekatan memerlukan ilmu yang mendalam untuk ditulis, tetapi sebagai pembaca anda cukup memilih sumber yang diiktiraf dan membacanya dengan tenang.",
        ],
        links: [["/islam/quran", "Tentang Quran"]],
      },
      {
        h2: "Tafsir Quran Sunni dan Syiah",
        p: [
          "Kedua-dua tradisi mempunyai khazanah tafsir yang panjang. Selain karya Sunni yang disebut tadi, tradisi Syiah mempunyai rujukan seperti al-Tibyan oleh al-Tusi, Majma' al-Bayan oleh al-Tabarsi dan al-Mizan oleh al-Tabataba'i. Banyak perkara dikongsi bersama, termasuk kajian bahasa, konteks penurunan dan pengajaran akhlak.",
          "Perbezaan muncul pada sebahagian ayat yang berkait dengan kepimpinan umat dan hukum fiqh. Quran Masterclass melayani pembaca Sunni dan Syiah secara neutral, jadi bacalah tafsir mengikut mazhab yang anda ikuti dan rujuk ulama mazhab itu untuk persoalan yang khusus.",
        ],
        links: [["/islam/madhahib", "Mazhab dalam Islam"]],
      },
      {
        h2: "Tafsir dan terjemahan di Quran Masterclass",
        p: [
          "Dalam pembaca Quran Masterclass, setiap ayat boleh dimainkan dengan audio, dipaparkan bersama terjemahan bahasa Melayu, transliterasi dan paparan perkataan demi perkataan, lalu dibuka tafsirnya dengan satu ketikan. Nama sumber tafsir sentiasa dipaparkan. Jika belum ada tafsir dalam bahasa anda, sumber berbahasa Inggeris ditunjukkan sebagai ganti.",
          "Sebahagian huraian ditulis dengan bantuan AI; ia ditanda dengan jelas, diluluskan oleh editor dan ditandakan untuk semakan ulama. Dalam Kaedah Shams, tafsir ialah langkah kelima bagi setiap ayat, selepas mendengar, membina ayat dari hujung, perkataan demi perkataan dan makna.",
        ],
        links: [["/quran", "Buka pembaca Quran"], ["/shams/method", "Langkah Kaedah Shams"]],
      },
      {
        h2: "Cara faham maksud ayat tanpa bahasa Arab",
        p: [
          "Anda tidak perlu menguasai bahasa Arab untuk mula memahami Quran. Sebilangan perkataan berulang sangat kerap, seperti nama-nama Allah, kata ganti dan kata kerja asas, jadi mempelajarinya memberi kesan besar kepada kefahaman.",
          "Kosa kata Quran di laman ini disusun sebagai kad imbas dan kuiz. Perkataan yang anda kenal naik ke kotak seterusnya dan kembali selepas 1, 2, 4, 8 dan 16 hari, manakala perkataan yang terlupa kembali ke kotak pertama.",
        ],
        links: [["/vocab", "Kosa kata Quran"], ["/guides/learn-quranic-arabic-vocabulary", "Panduan kosa kata"], ["/arabic", "Belajar bahasa Arab"]],
      },
    ],
    stepsTitle: "Cara belajar tafsir ayat demi ayat",
    steps: [
      { title: "Pilih satu surah pendek", body: "Mulakan dengan surah yang sudah biasa anda dengar, seperti al-Fatihah atau surah dalam Juzuk Amma." },
      { title: "Dengar dan lihat teks Arab", body: "Mainkan satu ayat dan ikuti tulisan Arabnya sebelum membaca maknanya." },
      { title: "Baca terjemahan", body: "Fahami maksud umum ayat, kemudian lihat perkataan demi perkataan untuk istilah yang penting." },
      { title: "Buka tafsir dan semak sumbernya", body: "Baca huraian, perhatikan nama sumber, dan bandingkan dengan ayat sebelum serta selepasnya." },
      { title: "Catat satu pengajaran", body: "Tulis satu atau dua baris dalam nota ayat tentang apa yang anda fahami." },
      { title: "Bawa soalan kepada guru", body: "Simpan soalan yang belum terjawab dan tanyakan kepada guru atau ulama yang anda percayai." },
    ],
    faqTitle: "Soalan lazim tentang tafsir Quran",
    faq: [
      { q: "Cukupkah membaca terjemahan Quran sahaja?", a: "Terjemahan memberi gambaran umum yang berguna untuk bacaan harian. Namun sebahagian ayat hanya jelas apabila konteks dan huraiannya diketahui, jadi tafsir membantu mengelakkan salah faham." },
      { q: "Adakah tafsir dalam bahasa Melayu tersedia di sini?", a: "Terjemahan bahasa Melayu tersedia untuk setiap ayat. Bagi tafsir, laman ini memaparkan sumber dalam bahasa anda apabila ada; jika belum ada, sumber berbahasa Inggeris dipaparkan bersama nama sumbernya." },
      { q: "Apakah sebab turun ayat (asbabun nuzul)?", a: "Ia ialah peristiwa atau soalan yang menjadi latar penurunan sesetengah ayat. Tidak semua ayat mempunyai sebab turun yang khusus, tetapi apabila ada, mengetahuinya membantu memahami maksud asal ayat tersebut." },
      { q: "Kenapa tafsir ulama berbeza-beza?", a: "Ulama menggunakan riwayat, kaedah bahasa dan usul yang berbeza, dan sesetengah perkataan Arab membawa lebih daripada satu makna. Perbezaan ini sebahagian daripada tradisi ilmu dan tidak semestinya bercanggah." },
      { q: "Tafsir mana yang sesuai untuk pemula?", a: "Pilih tafsir ringkas daripada sumber yang diiktiraf dalam tradisi anda, kemudian beralih kepada tafsir yang lebih panjang. Guru atau imam setempat boleh mencadangkan karya yang sesuai dengan mazhab anda." },
      { q: "Bolehkah saya membaca tafsir dan mendengar bacaan serentak?", a: "Boleh. Mainkan audio surah dan buka tafsir pada ayat yang sedang dibaca. Dalam mod Belajar, bacaan berhenti selepas setiap ayat supaya anda sempat membaca huraiannya." },
      { q: "Perlukah akaun untuk membaca tafsir?", a: "Tafsir boleh dibaca tanpa akaun sehingga had harian. Selepas itu, akaun percuma membolehkan anda terus membaca, dan akaun yang sama digunakan dalam aplikasi iOS." },
      { q: "Adakah tafsir di laman ini boleh dijadikan fatwa?", a: "Tidak. Kandungan di sini bertujuan pembelajaran. Untuk persoalan hukum, rujuk ulama atau guru yang anda percayai mengikut mazhab yang anda ikuti." },
    ],
    linksTitle: "Pautan berkaitan",
    links: [["/quran", "Baca Quran dengan tafsir"], ["/guides/understanding-the-quran-tafsir", "Panduan tafsir"], ["/vocab", "Kosa kata Quran"], ["/shams/method", "Kaedah Shams"], ["/surah/1", "Surah al-Fatihah"], ["/surah/36", "Surah Yasin"], ["/islam/quran", "Tentang Quran"], ["/listen-quran", "Dengar Quran"]],
    cta: ["/quran", "Baca dengan tafsir"],
  },
  "tajweed-online": {
    title: "Belajar Tajwid Online Percuma: Hukum dan Latihan",
    description: "Belajar tajwid online dari asas: makhraj, nun sakinah dan tanwin, mim sakinah, qalqalah, mad dan waqaf, dengan contoh ayat dan kuiz. Percuma.",
    kicker: "Tajwid",
    h1: "Belajar tajwid online, hukum demi hukum",
    intro: "Belajar tajwid online membolehkan anda mengambil satu hukum pada satu masa, mendengar contohnya daripada qari dan menguji diri dengan kuiz pendek. Panduan ini memberi gambaran hukum-hukum yang paling penting, urutan yang munasabah untuk pemula dan cara membetulkan bacaan sendiri tanpa tergesa-gesa.",
    answer: "Tajwid ialah ilmu menyebut huruf-huruf Quran dari makhraj yang betul, dengan sifat dan hukum bacaan yang tepat. Urutan yang mudah untuk pemula ialah makhraj huruf, nun sakinah dan tanwin, mim sakinah, qalqalah, mad, kemudian tanda waqaf. Kursus tajwid Quran Masterclass mengikut riwayat Hafs dari Asim, dengan contoh ayat, audio dan kuiz dalam setiap pelajaran, percuma di laman web dan dengan akaun yang sama dalam aplikasi iOS.",
    sections: [
      {
        h2: "Kenapa tajwid penting semasa membaca Quran",
        p: [
          "Sebahagian huruf Arab berbunyi hampir sama, seperti sin dan sod, atau ha kecil dan ha besar. Menukar satu huruf dengan huruf lain boleh mengubah perkataan dan maknanya. Tajwid menjaga bacaan daripada kesilapan seperti ini dan memelihara cara Quran dibaca sejak generasi awal, yang diwarisi daripada guru kepada murid.",
          "Ulama tajwid membezakan kesilapan yang jelas, yang mengubah huruf atau baris, dengan kesilapan halus yang berkait dengan kesempurnaan sebutan. Pemula sebaiknya menumpukan perhatian pada kesilapan yang jelas dahulu, kemudian memperhalusi bacaan secara beransur-ansur.",
        ],
        links: [["/tajweed", "Semua pelajaran tajwid"]],
      },
      {
        h2: "Makhraj huruf dan cara sebutan",
        p: [
          "Makhraj ialah tempat keluarnya huruf. Secara umum ulama menyebut lima kawasan utama: rongga mulut dan tekak, kerongkong, lidah, dua bibir dan rongga hidung. Setiap huruf mempunyai tempat dan sifatnya sendiri, misalnya tebal atau nipis, berdesir atau tidak.",
          "Latih huruf yang hampir serupa secara berpasangan: hamzah dan ain, kaf dan qaf, ta dan tho, serta zai, zal dan zho. Rakam suara anda, bandingkan dengan bacaan qari, dan ulang sehingga perbezaannya jelas. Pelajaran tentang tafkhim dan tarqiq, iaitu bunyi tebal dan nipis, menyusul selepas makhraj.",
        ],
        links: [["/tajweed/makharij", "Makhraj huruf"]],
      },
      {
        h2: "Hukum nun sakinah dan tanwin",
        p: [
          "Nun mati dan tanwin mempunyai empat hukum bergantung pada huruf selepasnya. Izhar bermaksud dibaca dengan jelas apabila bertemu huruf kerongkong. Idgham bermaksud dimasukkan ke dalam huruf selepasnya, sama ada dengan dengung atau tanpa dengung. Iqlab menukar bunyi nun kepada mim apabila bertemu huruf ba.",
          "Ikhfa pula bermaksud disembunyikan dengan dengung, dan berlaku pada baki huruf yang lain. Oleh sebab hukum-hukum ini muncul pada hampir setiap halaman, menguasainya terus memperbaiki mutu bacaan. Kursus di sini mengajar setiap hukum dalam pelajaran tersendiri dengan contoh daripada Quran.",
        ],
        links: [["/tajweed/nun-sakinah-izhar", "Nun sakinah: izhar"]],
      },
      {
        h2: "Hukum mim sakinah dan dengung",
        p: [
          "Mim mati mempunyai tiga hukum: ikhfa syafawi apabila bertemu ba, idgham mithlain apabila bertemu mim, dan izhar syafawi apabila bertemu huruf-huruf lain. Nun dan mim yang bersyaddah pula dibaca dengan dengung yang sempurna.",
          "Dengar bagaimana qari menahan dengung pada tempat-tempat ini, kemudian tiru dengan perlahan. Kesilapan yang biasa ialah dengung yang terlalu pendek, atau dengung yang muncul di tempat yang sepatutnya dibaca dengan jelas.",
        ],
        links: [["/tajweed/mim-sakinah", "Mim sakinah"]],
      },
      {
        h2: "Qalqalah, mad dan tanda waqaf",
        p: [
          "Qalqalah ialah pantulan bunyi pada lima huruf, iaitu qaf, tho, ba, jim dan dal, apabila huruf itu mati. Pantulannya lebih jelas apabila anda berhenti pada huruf tersebut di hujung ayat. Mad pula ialah pemanjangan bunyi: mad asli dibaca dua harakat, manakala jenis mad yang lain lebih panjang kerana bertemu hamzah atau sukun.",
          "Tanda waqaf dalam mushaf menunjukkan tempat yang sebaiknya berhenti, boleh berhenti atau sebaiknya disambung. Pelajaran tentang waqaf dan ibtida menerangkan cara berhenti dan memulakan semula bacaan tanpa merosakkan makna.",
        ],
        links: [["/tajweed/qalqalah", "Qalqalah"], ["/tajweed/madd", "Mad"]],
      },
      {
        h2: "Bagaimana belajar tajwid tanpa guru",
        p: [
          "Belajar dalam talian sesuai untuk memahami hukum dan melatih telinga. Gunakan pemain Quran untuk memperlahankan bacaan, mengulang setiap ayat dan berhenti selepas setiap ayat dalam mod Belajar, supaya anda sempat meniru qari. Pilih qari yang membaca dengan perlahan dan jelas sebagai rujukan tetap.",
          "Kuiz dapat menguji sama ada anda mengenal hukum dalam ayat, tetapi tidak dapat mendengar sebutan anda. Kerana itu, tradisi talaqqi dan musyafahah, iaitu membaca di hadapan guru, kekal penting. Gabungkan latihan dalam talian dengan sesi bersama guru apabila berpeluang.",
        ],
        links: [["/tajweed/practice", "Latihan tajwid"], ["/reciters", "Pilih qari"]],
      },
      {
        h2: "Tajwid untuk anak-anak dan dewasa",
        p: [
          "Kanak-kanak meniru bunyi dengan sangat baik, jadi mulakan dengan telinga dan perkenalkan istilah kemudian. Orang dewasa pula cepat memahami peraturan, tetapi tabiat sebutan lama memerlukan masa untuk berubah. Kedua-duanya mendapat manfaat daripada sesi pendek yang kerap.",
          "Pelajaran terakhir kursus menggabungkan semua hukum dalam surah al-Fatihah. Oleh sebab al-Fatihah dibaca dalam setiap rakaat, ia tempat terbaik untuk mula menggunakan tajwid dalam kehidupan harian.",
        ],
        links: [["/guides/tajweed-for-beginners", "Panduan tajwid pemula"], ["/surah/1", "Surah al-Fatihah"]],
      },
    ],
    stepsTitle: "Urutan belajar tajwid untuk pemula",
    steps: [
      { title: "Pilih qari rujukan", body: "Pilih seorang qari yang membaca perlahan dan jelas, dan jadikan bacaannya contoh sepanjang belajar." },
      { title: "Betulkan makhraj", body: "Latih huruf yang hampir serupa secara berpasangan dan bandingkan rakaman anda dengan bacaan qari." },
      { title: "Kuasai nun dan mim sakinah", body: "Pelajari empat hukum nun sakinah dan tanwin, kemudian tiga hukum mim sakinah." },
      { title: "Tambah qalqalah dan mad", body: "Latih pantulan bunyi dan panjang bacaan pada contoh ayat." },
      { title: "Uji diri dengan kuiz", body: "Jawab kuiz selepas setiap pelajaran dan ulang bahagian yang masih lemah pada hari yang lain." },
      { title: "Gunakan dalam solat", body: "Terapkan hukum yang dipelajari pada al-Fatihah dan surah yang anda baca setiap hari." },
    ],
    faqTitle: "Soalan lazim tentang tajwid online",
    faq: [
      { q: "Apakah hukum-hukum tajwid yang paling penting untuk pemula?", a: "Makhraj huruf, hukum nun sakinah dan tanwin, hukum mim sakinah, qalqalah dan mad asli. Hukum-hukum inilah yang paling kerap muncul dan paling banyak mempengaruhi ketepatan bacaan." },
      { q: "Berapa lama untuk menguasai tajwid?", a: "Ia berbeza bagi setiap orang. Memahami hukum boleh dicapai lebih cepat, tetapi membiasakan lidah memerlukan latihan yang berterusan. Tiada tempoh tetap yang boleh dijanjikan." },
      { q: "Adakah boleh belajar tajwid melalui aplikasi?", a: "Ya, untuk teori, contoh audio dan kuiz. Untuk memastikan sebutan anda betul, perdengarkan bacaan kepada guru dari semasa ke semasa." },
      { q: "Tajwid di sini mengikut riwayat apa?", a: "Riwayat Hafs dari Asim, iaitu riwayat yang digunakan dalam mushaf di Malaysia dan di kebanyakan negara Islam." },
      { q: "Bagaimana membetulkan kesalahan tajwid sendiri?", a: "Rakam bacaan anda, dengar semula bersama bacaan qari pada ayat yang sama dan tandakan perbezaannya. Tumpukan pada satu kesilapan dalam satu minggu, bukan semuanya serentak." },
      { q: "Perlukah saya menghafal istilah tajwid?", a: "Istilah membantu ketika belajar dan berbincang dengan guru, tetapi matlamatnya ialah sebutan yang betul. Ramai kanak-kanak membaca dengan betul sebelum mengetahui nama hukumnya." },
      { q: "Adakah kelas tajwid online ini percuma?", a: "Ya. Pelajaran, contoh audio, kuiz dan latihan tajwid percuma di laman web. Akaun berguna untuk menyimpan kemajuan anda." },
    ],
    linksTitle: "Teruskan belajar",
    links: [["/tajweed", "Pelajaran tajwid"], ["/tajweed/practice", "Latihan tajwid"], ["/tajweed/makharij", "Makhraj"], ["/tajweed/nun-sakinah-izhar", "Nun sakinah"], ["/tajweed/madd", "Mad"], ["/guides/tajweed-for-beginners", "Panduan tajwid pemula"], ["/reciters", "Qari"], ["/learn-quran", "Belajar Quran"]],
    cta: ["/tajweed", "Mulakan pelajaran tajwid"],
  },
  "memorize-quran": {
    title: "Hafaz Quran: Kaedah dan Pelan Ulang Kaji Harian",
    description: "Hafaz Quran dengan Kaedah Shams: dengar, bina dari hujung ayat, ulang kaji berjadual dan pelan 365 hari. Percuma, sesuai untuk dewasa dan pemula.",
    kicker: "Hafazan",
    h1: "Hafaz Quran dengan kaedah yang boleh diikuti setiap hari",
    intro: "Hafaz Quran ialah perjalanan panjang yang lebih bergantung pada ulangan yang teratur daripada bakat semula jadi. Panduan ini menunjukkan cara menyusun pelan hafazan, bermula dengan Juzuk Amma, menghafaz setiap ayat dengan Kaedah Shams dan menjaga hafalan supaya tidak hilang.",
    answer: "Untuk menghafaz Quran, hafaz bahagian kecil setiap hari, ulang kaji hafalan lama sebelum menambah yang baharu, dan mulakan dengan surah pendek seperti Juzuk Amma. Kaedah Shams oleh Nami Shams membimbing setiap ayat dalam tujuh langkah: dengar, bina dari hujung, perkataan demi perkataan, makna, tafsir, petunjuk yang kian pudar dan renungan. Quran Masterclass menyediakannya bersama jadual ulang kaji dan pelan 365 hari, percuma di laman web dan dengan akaun yang sama dalam aplikasi iOS.",
    sections: [
      {
        h2: "Berapa ayat patut dihafaz sehari",
        p: [
          "Setiap ayat baharu menambah beban ulang kaji esok dan lusa. Oleh itu, jumlah yang sesuai ialah jumlah yang masih dapat anda ulang dengan tenang pada hari berikutnya, bukan jumlah paling banyak yang mampu dihafaz hari ini.",
          "Pelan 365 hari menawarkan empat landasan: Santai untuk pemula dan kanak-kanak, bermula dengan satu ayat sehari; Standard untuk kebanyakan orang dewasa yang bekerja dan berkeluarga; Intensif bagi yang mahu maju lebih cepat; dan Laluan hafiz untuk pelajar hifz sepenuh masa. Bahagian harian bermula kecil dan bertambah sedikit demi sedikit setiap minggu.",
        ],
        links: [["/plan", "Pelan 365 hari"]],
      },
      {
        h2: "Hafaz Juzuk Amma langkah demi langkah",
        p: [
          "Juzuk Amma, iaitu surah 78 hingga 114, ialah titik mula yang lazim kerana surahnya pendek, kerap dibaca dalam solat dan sering didengar. Ramai guru memulakan dari surah an-Nas dan bergerak ke belakang hingga an-Naba', supaya setiap surah baharu hanya sedikit lebih panjang daripada yang sebelumnya.",
          "Laluan Akademi mengikut logik yang sama: asas dengan al-Fatihah dan surah-surah paling pendek, kemudian Juzuk Amma dalam dua bahagian, surah-surah kesayangan, dan akhirnya seluruh Quran. Setiap pelajaran diakhiri dengan ujian bermasa yang menunjukkan sama ada ayat itu benar-benar melekat.",
        ],
        links: [["/guides/juz-amma-learning-plan", "Pelan Juzuk Amma"], ["/academy", "Akademi"], ["/surah/114", "Surah an-Nas"]],
      },
      {
        h2: "Kaedah Shams untuk hafazan",
        p: [
          "Kaedah Shams dibangunkan oleh Nami Shams dan membahagikan setiap ayat kepada tujuh langkah: dengar tiga kali sambil memandang teks, bina dari hujung, perkataan demi perkataan, makna dan pengait ingatan, tafsir, petunjuk yang kian pudar, dan renungan. Setiap langkah mengambil masa yang singkat.",
          "Langkah bina dari hujung bermula dengan perkataan terakhir, kemudian dua perkataan terakhir, dan seterusnya hingga seluruh ayat. Dengan cara ini setiap ulangan berakhir pada bahagian yang sudah dikenali, dan bahagian akhir ayat, yang biasanya paling lemah, menjadi paling kukuh. Dalam langkah petunjuk yang kian pudar, anda hanya melihat huruf pertama setiap perkataan sebelum petunjuk itu turut hilang.",
        ],
        links: [["/shams", "Kaedah Shams"], ["/shams/method", "Penerangan tujuh langkah"]],
      },
      {
        h2: "Cara mengulang kaji hafazan setiap hari",
        p: [
          "Dalam banyak halaqah tahfiz, hafalan dibahagikan kepada tiga lapisan: hafalan baharu, murajaah dekat untuk hafalan beberapa hari lepas, dan murajaah jauh untuk hafalan lama yang diulang secara bergilir. Prinsip yang sama digunakan di sini: ulang kaji dahulu, barulah ayat baharu.",
          "Setiap kali anda menilai diri selepas membaca dari hafalan, model ingatan (FSRS) menganggarkan bila ayat itu mungkin mula dilupakan lalu menjadualkannya semula, mula-mula selepas beberapa hari, kemudian minggu dan bulan. Halaman Hari ini menyenaraikan ayat yang perlu diulang. Pelan harian menambah dua tugas lagi: merantai ayat hari ini dengan ayat semalam tanpa melihat, dan mendengar ayat hari ini sekali lagi sebelum tidur.",
        ],
        links: [["/today", "Ulang kaji hari ini"]],
      },
      {
        h2: "Cara elak lupa hafazan Quran",
        p: [
          "Hafalan biasanya goyah di tiga tempat: peralihan antara ayat, ayat-ayat yang hampir serupa, dan surah yang lama tidak diulang. Untuk peralihan, sentiasa baca hujung ayat sebelumnya bersama awal ayat seterusnya. Untuk ayat yang serupa, senarai mutasyabihat membantu anda membandingkan perbezaannya secara langsung.",
          "Dalam pembaca Quran, anda boleh menyembunyikan perkataan secara berperingkat: ringan, separuh, semua, rawak, atau ujian perkataan demi perkataan. Membaca surah yang telah dihafaz dalam solat sunat juga cara yang lazim untuk menguji hafalan dalam keadaan sebenar.",
        ],
        links: [["/shams/mutashabihat", "Ayat mutasyabihat"], ["/quran", "Pembaca Quran"]],
      },
      {
        h2: "Hafaz Quran sambil bekerja",
        p: [
          "Bagi yang sibuk, pecahkan masa kepada beberapa sesi kecil yang dikaitkan dengan waktu solat: sepuluh minit selepas Subuh untuk ayat baharu, mendengar dalam perjalanan, dan ulang kaji ringkas selepas Isyak. Sepuluh minit yang dijaga setiap hari lebih bermakna daripada satu jam yang hanya berlaku sekali-sekala.",
          "Gunakan pilihan Jeda untuk mengulang dalam pemain: selepas setiap ayat ada ruang senyap sepanjang ayat itu supaya anda dapat membacanya sendiri. Ini sesuai ketika berjalan kaki atau melakukan kerja ringan, tetapi elakkan menatap skrin semasa memandu.",
        ],
        links: [["/listen-quran", "Dengar Quran untuk menghafaz"], ["/guides/how-to-memorize-the-quran", "Panduan menghafaz"]],
      },
      {
        h2: "Adab menghafaz Quran dan peranan guru",
        p: [
          "Hafazan ialah ibadah, bukan sekadar latihan ingatan. Niat yang ikhlas, bersuci, menghormati mushaf dan bersabar terhadap diri sendiri ialah sebahagian daripada adab yang diajar turun-temurun. Halaman adab pembawa Quran menghimpunkan adab-adab ini secara ringkas.",
          "Alat dalam talian membantu anda berlatih dan mengulang kaji, tetapi tasmik di hadapan guru tetap amalan yang tidak dapat digantikan. Guru mendengar kesilapan yang tidak anda sedari dan membimbing anda mengikut kemampuan.",
        ],
        links: [["/shams/adab", "Adab menghafaz"]],
      },
    ],
    stepsTitle: "Langkah menghafaz setiap hari",
    steps: [
      { title: "Pilih landasan dan waktu tetap", body: "Pilih landasan pelan yang sesuai dan tetapkan satu waktu harian, misalnya selepas Subuh." },
      { title: "Ulang kaji dahulu", body: "Mulakan setiap sesi dengan ayat yang dijadualkan untuk diulang pada hari itu." },
      { title: "Dengar ayat baharu", body: "Dengar tiga kali sambil memandang teks Arab tanpa menterjemah dahulu." },
      { title: "Bina dari hujung", body: "Hafaz perkataan terakhir dahulu, kemudian tambah ke arah awal ayat." },
      { title: "Uji dengan petunjuk yang kian pudar", body: "Baca dengan huruf pertama sahaja, kemudian tanpa petunjuk, lalu nilai diri dengan jujur." },
      { title: "Rantai dengan ayat semalam", body: "Baca ayat hari ini bersama ayat semalam tanpa melihat supaya ia menjadi satu petikan." },
      { title: "Dengar sebelum tidur", body: "Dengar ayat hari ini sekali lagi sebelum tidur untuk menutup hari." },
    ],
    faqTitle: "Soalan lazim tentang hafazan",
    faq: [
      { q: "Bolehkah orang dewasa menghafaz Quran?", a: "Boleh. Orang dewasa mungkin mempunyai masa yang terhad, tetapi kefahaman dan disiplin membantu. Mulakan dengan landasan yang kecil dan jaga ulang kaji harian." },
      { q: "Bagaimana cara hafaz Quran dengan mudah dan cepat?", a: "Kemudahan datang daripada kaedah yang jelas dan bahagian yang kecil, bukan daripada tergesa-gesa. Dengar dahulu, bina dari hujung ayat, uji diri dan ulang kaji mengikut jadual. Kelajuan biasanya meningkat apabila asas kukuh, tetapi tiada tempoh yang boleh dijanjikan." },
      { q: "Perlukah faham makna sebelum menghafaz?", a: "Tidak wajib, tetapi memahami makna memudahkan ingatan dan menjadikan hafazan lebih bermakna. Kaedah Shams memasukkan makna dan tafsir sebagai sebahagian daripada langkahnya." },
      { q: "Apakah ayat mutasyabihat?", a: "Ayat yang hampir serupa tetapi berbeza pada satu atau dua perkataan. Senarai mutasyabihat menunjukkan pasangan-pasangan ini supaya anda dapat membezakannya dengan sengaja." },
      { q: "Bagaimana jika saya terlepas beberapa hari?", a: "Jangan menambah ayat baharu dahulu. Selesaikan ulang kaji yang tertunggak, kerana pelan menunjukkan ayat yang belum selesai, kemudian sambung semula pada kadar biasa." },
      { q: "Adakah aplikasi untuk menghafaz Quran boleh menggantikan guru?", a: "Tidak. Ia membantu latihan, jadual dan ujian diri. Tasmik bersama guru tetap penting untuk ketepatan bacaan." },
      { q: "Bagaimana anak-anak boleh menghafaz surah pendek?", a: "Gunakan landasan Santai, dengar surah bersama berulang kali, dan biarkan anak meniru qari sebelum melihat teks. Stesen radio Untuk kanak-kanak memainkan surah-surah yang biasanya dipelajari dahulu." },
    ],
    linksTitle: "Alat untuk menghafaz",
    links: [["/shams", "Kaedah Shams"], ["/shams/method", "Cara kaedah berfungsi"], ["/plan", "Pelan 365 hari"], ["/academy", "Akademi"], ["/shams/mutashabihat", "Mutasyabihat"], ["/guides/how-to-memorize-the-quran", "Panduan menghafaz"], ["/guides/shams-method", "Panduan Kaedah Shams"], ["/today", "Ulang kaji hari ini"]],
    cta: ["/shams", "Mulakan Kaedah Shams"],
  },
  "quran-radio": {
    title: "Radio Quran Online 24 Jam dengan Pemasa Tidur",
    description: "Radio Quran online tanpa henti: Quran lengkap, Juzuk Amma, surah pilihan dan stesen bertema. Pilih qari, paparkan teks dan terjemahan, pemasa tidur.",
    kicker: "Radio",
    h1: "Radio Quran online untuk didengar sepanjang hari",
    intro: "Radio Quran online di Quran Masterclass memainkan bacaan tanpa henti, sama ada Quran lengkap dari surah pertama hingga terakhir, Juzuk Amma atau satu surah yang diulang-ulang. Panduan ini menerangkan stesen yang ada, cara memilih qari, memaparkan teks dan terjemahan, menetapkan pemasa tidur dan menggunakan radio untuk belajar.",
    answer: "Radio Quran online ialah bacaan Quran yang dimainkan secara berterusan tanpa anda perlu memilih surah satu demi satu. Di Quran Masterclass anda memilih stesen seperti Quran lengkap, Juzuk Amma, Juzuk hari ini atau satu surah tertentu, menukar qari, memaparkan teks Arab dengan terjemahan dan menetapkan pemasa tidur; bacaan terus dimainkan walaupun skrin dikunci. Radio ini percuma di laman web dan kekal percuma dalam aplikasi iOS.",
    sections: [
      {
        h2: "Stesen radio Quran yang tersedia",
        p: [
          "Stesen utama termasuk Quran lengkap, yang memainkan surah 1 hingga 114 lalu bermula semula, serta Juzuk Amma, Juzuk Tabarak dan Juzuk Qad Sami'a. Stesen Juzuk hari ini memainkan juzuk yang berbeza setiap hari, jadi anda mendengar seluruh Quran dalam 30 hari.",
          "Selain itu, terdapat stesen satu surah seperti al-Kahf, Ya-Sin, ar-Rahman, al-Mulk, al-Waqi'ah, Maryam dan Yusuf, yang memainkan surah itu berulang kali. Tiada stesen yang berhenti: apabila sampai ke penghujung, ia bermula semula atau memilih surah seterusnya.",
        ],
        links: [["/radio", "Buka radio"]],
      },
      {
        h2: "Stesen bertema untuk hari Jumaat, Ramadan dan kisah nabi",
        p: [
          "Stesen Jumaat memainkan al-Kahf, al-Jumu'ah dan surah-surah yang dibaca dalam solat Jumaat, manakala stesen Ramadan menghimpunkan al-Baqarah dengan ayat-ayat tentang puasa, al-Qadr dan ad-Dukhan. Stesen Kisah para nabi pula memainkan Yusuf, Maryam, Ta-Ha, al-Anbiya, al-Qasas dan Nuh.",
          "Bagi yang ingin mendekati sejarah penurunan, stesen Wahyu-wahyu pertama memainkan surah-surah awal mengikut tertib penurunan yang tradisional. Stesen Perlindungan memainkan al-Fatihah, al-Baqarah dan tiga Qul, dan stesen Penghibur hati memainkan ad-Duha, asy-Syarh dan Yusuf. Pilih stesen mengikut suasana hari anda, kemudian hidupkan terjemahan untuk mengikuti kisahnya.",
        ],
        links: [["/surah/18", "Surah al-Kahf"], ["/surah/12", "Surah Yusuf"]],
      },
      {
        h2: "Radio Quran pilihan qari",
        p: [
          "Setiap stesen boleh dimainkan dengan qari yang anda pilih. Jika anda mahu mengenal lebih banyak suara, hidupkan pilihan campur suara supaya setiap surah dibacakan oleh qari yang berlainan, atau pilih stesen Quran dalam pelbagai suara.",
          "Bacaan murattal mempunyai rentak sederhana yang mudah diikuti dan dihafaz, manakala bacaan mujawwad lebih perlahan dan berlagu. Halaman qari membolehkan anda mendengar dan membandingkan gaya bacaan sebelum memilih suara kegemaran.",
        ],
        links: [["/reciters", "Senarai qari"]],
      },
      {
        h2: "Radio Quran dengan teks dan terjemahan",
        p: [
          "Hidupkan pilihan Tunjuk teks dan terjemahan untuk melihat ayat yang sedang dibaca dalam tulisan Arab bersama terjemahan bahasa Melayu. Anda boleh melompat ke ayat sebelumnya atau seterusnya, atau terus ke surah seterusnya.",
          "Senarai Baru dimainkan menyimpan ayat-ayat yang telah anda dengar. Jika satu ayat menarik perhatian, buka surahnya dalam pembaca Quran untuk membaca tafsir, mengulang ayat itu atau menulis nota.",
        ],
        links: [["/quran", "Buka pembaca Quran"]],
      },
      {
        h2: "Dengar Quran sebelum tidur dengan pemasa tidur",
        p: [
          "Pemasa tidur menghentikan bacaan secara automatik selepas bilangan minit yang anda pilih, jadi radio tidak terus berjalan sepanjang malam. Stesen Sebelum tidur memainkan as-Sajdah, al-Mulk dan tiga Qul, iaitu surah-surah yang lazim dibaca pada waktu malam.",
          "Bagi keluarga, stesen Untuk kanak-kanak memainkan surah-surah yang biasanya dipelajari dahulu. Ibu bapa boleh menetapkan pemasa supaya bacaan berhenti selepas anak terlelap.",
        ],
        links: [["/surah/67", "Surah al-Mulk"], ["/surah/32", "Surah as-Sajdah"]],
      },
      {
        h2: "Dengar Quran di latar belakang semasa bekerja",
        p: [
          "Radio terus dimainkan apabila skrin dikunci, jadi ia boleh menemani anda di rumah, di dapur atau di meja kerja. Kawalan kelantangan dan butang jeda sentiasa mudah dicapai.",
          "Ramai memilih untuk mendengar dengan penuh perhatian pada waktu tertentu, dan membiarkan radio sebagai teman pada waktu yang lain. Apabila anda mahu memberi tumpuan penuh, duduklah sebentar dengan teks dan terjemahan dipaparkan.",
          "Jika anda berkongsi ruang dengan keluarga atau rakan sekerja, perlahankan kelantangan dan pilih stesen yang sesuai dengan suasana, misalnya Juzuk Amma yang surahnya pendek dan dikenali ramai.",
        ],
        links: [["/app", "Aplikasi iOS"]],
      },
      {
        h2: "Radio Quran untuk belajar mendengar bacaan",
        p: [
          "Mendengar Juzuk Amma berulang kali sebelum mula menghafaz menjadikan bunyi dan rentak surahnya biasa di telinga. Stesen Juzuk hari ini pula boleh menjadi khatam pendengaran dalam 30 hari, seiring dengan khatam bacaan jika anda menggunakan perancang khatam.",
          "Namun radio sengaja dibuat untuk didengar, bukan untuk latihan aktif. Apabila anda mahu mengulang satu ayat, memperlahankan bacaan atau menguji hafalan, beralihlah ke pembaca Quran atau Kaedah Shams.",
        ],
        links: [["/listen-quran", "Dengar Quran ayat demi ayat"], ["/khatm", "Perancang khatam"], ["/memorize-quran", "Hafaz Quran"]],
      },
    ],
    stepsTitle: "Cara menggunakan radio Quran",
    steps: [
      { title: "Buka radio", body: "Pergi ke halaman Radio; tiada fail yang perlu dimuat turun untuk mula mendengar." },
      { title: "Pilih stesen", body: "Pilih stesen utama, stesen bertema atau satu surah." },
      { title: "Pilih qari", body: "Tukar qari atau hidupkan campur suara untuk mendengar qari berlainan bagi setiap surah." },
      { title: "Paparkan teks", body: "Hidupkan teks dan terjemahan jika anda mahu mengikuti maknanya." },
      { title: "Tetapkan pemasa tidur", body: "Pilih bilangan minit supaya bacaan berhenti dengan sendiri." },
      { title: "Biarkan dimainkan", body: "Kunci skrin dan teruskan aktiviti anda; bacaan terus berjalan." },
    ],
    faqTitle: "Soalan lazim tentang radio Quran",
    faq: [
      { q: "Adakah radio Quran online ini percuma?", a: "Ya. Radio percuma di laman web dan kekal percuma dalam aplikasi iOS. Laman web tidak memaparkan iklan." },
      { q: "Adakah radio Quran ini berjalan 24 jam?", a: "Stesen berjalan tanpa henti selagi anda membiarkannya dimainkan: apabila sampai ke penghujung, ia bermula semula atau memilih surah seterusnya. Gunakan pemasa tidur jika anda mahu ia berhenti." },
      { q: "Bolehkah radio dimainkan semasa skrin dikunci?", a: "Ya, radio direka untuk terus dimainkan di latar belakang." },
      { q: "Perlukah saya memuat turun aplikasi?", a: "Tidak. Radio berfungsi terus dalam pelayar. Aplikasi iOS ialah pilihan tambahan dengan akaun yang sama." },
      { q: "Apakah beza radio dengan mendengar surah dalam pembaca?", a: "Radio memilih bacaan untuk anda dan terus bersambung. Pembaca Quran memberi kawalan penuh: ulang ayat, gelung beberapa ayat, kelajuan dan mod Belajar." },
      { q: "Bolehkah saya mendengar surah al-Kahf pada hari Jumaat?", a: "Boleh. Pilih stesen Surah al-Kahf untuk mendengar surah itu berulang kali, atau stesen Jumaat yang turut memainkan al-Jumu'ah dan surah-surah solat Jumaat." },
      { q: "Bolehkah kanak-kanak mendengar radio ini?", a: "Boleh. Stesen Untuk kanak-kanak memainkan surah pendek yang biasa dipelajari dahulu, dan pemasa tidur memudahkan ibu bapa pada waktu malam." },
      { q: "Adakah mendengar radio menggantikan belajar membaca?", a: "Tidak. Mendengar membantu sebutan dan hafalan, tetapi kemahiran membaca tulisan Arab tetap perlu dipelajari." },
    ],
    linksTitle: "Dengar dan belajar",
    links: [["/radio", "Radio Quran"], ["/reciters", "Qari"], ["/listen-quran", "Dengar Quran"], ["/quran", "Baca Quran"], ["/surah/18", "Surah al-Kahf"], ["/surah/67", "Surah al-Mulk"], ["/khatm", "Perancang khatam"], ["/app", "Aplikasi iOS"]],
    cta: ["/radio", "Buka radio Quran"],
  },
  "listen-quran": {
    title: "Dengar Quran Online: Audio Ayat Demi Ayat",
    description: "Dengar Quran online mengikut surah dan qari, ayat demi ayat dengan teks Arab dan terjemahan. Ulang ayat, ubah kelajuan dan dengar untuk menghafaz.",
    kicker: "Audio",
    h1: "Dengar Quran online, surah demi surah",
    intro: "Dengar Quran online dengan cara yang membantu anda belajar: setiap ayat dimainkan bersama teks Arab dan terjemahannya, dan anda boleh mengulang, memperlahankan atau berhenti selepas setiap ayat. Panduan ini menerangkan cara memilih qari, mendengar ayat demi ayat, mendengar untuk menghafaz dan mendengar tanpa sambungan internet.",
    answer: "Anda boleh mendengar Quran online di Quran Masterclass dengan membuka mana-mana daripada 114 surah, memilih qari dan memainkan bacaan ayat demi ayat bersama teks Arab, transliterasi dan terjemahan. Pemain membolehkan anda mengulang setiap ayat, menggelung beberapa ayat, menukar kelajuan dan memberi jeda untuk anda membaca sendiri. Semuanya percuma di laman web tanpa perlu memuat turun fail; aplikasi iOS menggunakan akaun yang sama.",
    sections: [
      {
        h2: "Dengar surah ayat demi ayat sambil membaca",
        p: [
          "Pemain mempunyai dua mod. Mod Berterusan memainkan surah dari awal hingga akhir. Mod Belajar berhenti selepas setiap ayat dan menunggu anda menekan Teruskan, supaya anda sempat membaca semula atau merenung maksudnya.",
          "Anda boleh memaparkan terjemahan, transliterasi dan paparan perkataan demi perkataan, atau mengetik satu perkataan untuk mendengarnya sahaja. Ayat juga boleh dilihat mengikut halaman, juzuk atau hizb jika anda biasa membaca mengikut mushaf.",
        ],
        links: [["/quran", "Senarai 114 surah"], ["/search", "Cari ayat"]],
      },
      {
        h2: "Dengar surah Yasin, al-Mulk dan surah pilihan",
        p: [
          "Ramai yang mencari surah tertentu untuk didengar pada waktu tertentu, seperti Yasin, al-Kahf pada hari Jumaat atau al-Mulk pada waktu malam. Setiap surah mempunyai halamannya sendiri, jadi anda boleh terus membukanya, memilih qari dan meletakkan penanda pada ayat tempat anda berhenti.",
          "Untuk al-Mulk sebelum tidur, gunakan pemasa tidur dengan pilihan Penghujung surah supaya bacaan tamat dengan sendirinya. Jika anda mendengar surah yang sama setiap hari, bacalah terjemahannya sekali-sekala supaya maknanya turut menjadi biasa di samping bunyinya.",
        ],
        links: [["/surah/36", "Surah Yasin"], ["/surah/67", "Surah al-Mulk"], ["/surah/18", "Surah al-Kahf"]],
      },
      {
        h2: "Memilih qari: bacaan perlahan dan jelas",
        p: [
          "Setiap qari mempunyai rentak dan lagu sendiri. Untuk belajar, pilih bacaan murattal yang sederhana lajunya dan jelas sebutannya. Bacaan mujawwad yang lebih panjang dan berlagu sedap didengar, tetapi lebih sukar diikuti oleh pemula.",
          "Jika anda sedang menghafaz, kekalkan seorang qari untuk tempoh yang lama, kerana lagu bacaan menjadi sebahagian daripada ingatan. Halaman qari membolehkan anda mencuba beberapa suara sebelum membuat pilihan.",
          "Satu latihan telinga yang berguna ialah mendengar surah pendek yang sama oleh tiga qari berturut-turut. Perbezaan rentak, panjang dengung dan tempat berhenti akan cepat kedengaran, dan memberi perhatian kepada perbezaan ini turut melatih telinga anda untuk tajwid.",
        ],
        links: [["/reciters", "Senarai qari"]],
      },
      {
        h2: "Dengar Quran untuk menghafaz",
        p: [
          "Gunakan pilihan Ulang setiap ayat untuk mendengar satu ayat beberapa kali, atau Gelung ayat untuk mengulang satu petikan dari ayat tertentu hingga ayat tertentu. Turunkan kelajuan apabila sesuatu bahagian sukar disebut.",
          "Pilihan Jeda untuk mengulang memberi ruang senyap selepas setiap ayat; dengan tetapan Panjang ayat, anda mendapat masa yang sama panjang dengan bacaan qari untuk membacanya sendiri. Apabila sudah biasa, sembunyikan perkataan secara berperingkat dan uji hafalan anda.",
        ],
        links: [["/memorize-quran", "Hafaz Quran"], ["/shams", "Kaedah Shams"]],
      },
      {
        h2: "Dengar al-Quran untuk ketenangan dan renungan",
        p: [
          "Ada masanya anda hanya mahu mendengar. Pilih surah yang anda sukai, hidupkan terjemahan, dan biarkan bacaan berjalan dalam mod Berterusan. Surah seperti ar-Rahman, Yusuf, ad-Duha dan al-Insyirah sering dipilih untuk didengar dengan tenang.",
          "Jika satu ayat menyentuh hati, hentikan bacaan dan tulis satu baris dalam nota ayat tersebut. Renungan kecil seperti ini menjadikan pendengaran lebih daripada sekadar bunyi latar.",
        ],
        links: [["/surah/55", "Surah ar-Rahman"], ["/surah/93", "Surah ad-Duha"]],
      },
      {
        h2: "Dengar surah pendek untuk anak",
        p: [
          "Kanak-kanak belajar melalui ulangan. Mainkan satu surah pendek beberapa kali sehari, perlahankan sedikit kelajuannya, dan ajak anak membaca bersama pada bahagian yang sudah mereka ingat.",
          "Untuk mendengar tanpa memilih surah, stesen radio Untuk kanak-kanak memainkan surah-surah yang biasanya dipelajari dahulu. Panduan Quran untuk kanak-kanak memberi idea untuk menjadikannya rutin keluarga.",
        ],
        links: [["/guides/quran-for-kids", "Quran untuk kanak-kanak"]],
      },
      {
        h2: "Dengar Quran lengkap 30 juzuk dan tanpa internet",
        p: [
          "Jika anda mahu mendengar seluruh Quran, gunakan stesen Quran lengkap atau Juzuk hari ini di radio, atau buka surah satu demi satu dalam pembaca. Halaman Hari ini menunjukkan surah dan ayat tempat anda berhenti, jadi anda boleh menyambung tepat dari situ.",
          "Pembaca juga mempunyai pilihan Simpan surah untuk luar talian, supaya surah tertentu boleh didengar tanpa sambungan internet dalam pelayar yang sama. Dengan aplikasi iOS dan akaun yang sama, anda boleh meneruskan pembelajaran di telefon.",
        ],
        links: [["/radio", "Radio Quran"], ["/app", "Aplikasi iOS"]],
      },
    ],
    stepsTitle: "Cara mendengar ayat demi ayat",
    steps: [
      { title: "Pilih surah", body: "Buka senarai 114 surah dan pilih surah yang mahu didengar." },
      { title: "Pilih qari", body: "Pilih bacaan yang jelas, dan kekalkannya jika anda sedang menghafaz." },
      { title: "Pilih mod", body: "Gunakan mod Belajar untuk berhenti selepas setiap ayat, atau mod Berterusan untuk mendengar tanpa henti." },
      { title: "Hidupkan bantuan teks", body: "Paparkan terjemahan, transliterasi atau perkataan demi perkataan mengikut keperluan." },
      { title: "Ulang bahagian yang sukar", body: "Ulang satu ayat, gelung beberapa ayat atau perlahankan kelajuan." },
      { title: "Simpan untuk luar talian", body: "Simpan surah yang kerap didengar supaya ia boleh dimainkan tanpa internet." },
    ],
    faqTitle: "Soalan lazim tentang mendengar Quran",
    faq: [
      { q: "Perlukah saya memuat turun mp3 Quran?", a: "Tidak. Audio dimainkan terus di laman web. Jika anda mahu mendengar tanpa internet, gunakan pilihan simpan surah untuk luar talian dalam pembaca." },
      { q: "Adakah semua 114 surah ada audio ayat demi ayat?", a: "Ya, setiap surah boleh didengar ayat demi ayat bersama teksnya." },
      { q: "Qari mana yang sesuai untuk pemula?", a: "Pilih bacaan murattal yang jelas dan tidak terlalu laju. Cuba beberapa qari, kemudian kekalkan seorang yang paling mudah anda ikuti." },
      { q: "Bolehkah saya dengar Quran dengan terjemahan Melayu?", a: "Terjemahan bahasa Melayu dipaparkan pada skrin bersama setiap ayat. Audionya ialah bacaan Quran dalam bahasa Arab oleh qari." },
      { q: "Bolehkah saya memperlahankan bacaan?", a: "Boleh. Tetapan kelajuan dalam pemain membolehkan anda memperlahankan atau mempercepatkan bacaan." },
      { q: "Bagaimana belajar dengan hanya mendengar?", a: "Mendengar membina gambaran bunyi ayat dalam ingatan dan membantu sebutan. Untuk membaca dengan betul, gabungkan pendengaran dengan kursus membaca dan tajwid." },
      { q: "Bagaimana saya menyambung dari ayat tempat saya berhenti?", a: "Halaman Hari ini memaparkan surah dan ayat terakhir anda, jadi anda boleh menyambung dengan satu ketikan. Penanda halaman juga membantu jika anda mendengar beberapa surah secara bergilir." },
      { q: "Adakah ia percuma dan tanpa iklan?", a: "Ya, laman web ini percuma dan tidak memaparkan iklan." },
    ],
    linksTitle: "Pautan berkaitan",
    links: [["/quran", "Semua surah"], ["/reciters", "Qari"], ["/radio", "Radio Quran"], ["/surah/36", "Surah Yasin"], ["/surah/67", "Surah al-Mulk"], ["/memorize-quran", "Hafaz Quran"], ["/tajweed", "Tajwid"], ["/learn-quran", "Belajar Quran"]],
    cta: ["/quran", "Pilih surah"],
  },
  tawbah: {
    title: "Cara Bertaubat dan Kembali kepada Allah",
    description: "Panduan tenang untuk kembali kepada Allah: mula semula dengan solat, wuduk, doa dan belajar. Tanpa menghakimi, langkah kecil yang praktikal.",
    kicker: "Kembali dengan tenang",
    h1: "Cara bertaubat: mulakan semula dengan langkah kecil",
    intro: "Cara bertaubat yang paling jujur bermula dengan satu keputusan kecil hari ini, bukan dengan menunggu diri menjadi sempurna. Halaman ini tidak menghakimi dan tidak memberi fatwa; ia menyusun langkah praktikal untuk kembali kepada Allah, belajar semula solat dan wuduk, dan mencari sokongan yang boleh dipercayai.",
    answer: "Taubat bermaksud kembali kepada Allah: menyesali kesalahan, berhenti daripadanya, berazam untuk tidak mengulanginya dan memohon ampun kepada-Nya. Secara praktikal, ramai bermula dengan istighfar dan doa dalam bahasa sendiri, kembali menunaikan solat walaupun satu waktu dahulu, belajar semula wuduk dan membaca sedikit Quran setiap hari. Quran Masterclass menyediakan latihan wuduk dan solat, doa dan bacaan Quran secara percuma di laman web; untuk soalan peribadi dan syarat yang terperinci, rujuklah ulama atau imam yang anda percayai mengikut mazhab anda.",
    sections: [
      {
        h2: "Maksud taubat dan istighfar",
        p: [
          "Perkataan taubat berasal daripada makna kembali. Istighfar pula ialah memohon keampunan, sama ada dengan lafaz yang diajar atau dengan bahasa sendiri. Kedua-duanya berkait rapat: istighfar ialah ucapan, manakala taubat ialah perubahan arah hidup yang menyertainya.",
          "Ulama lazimnya menyebut penyesalan, berhenti daripada kesalahan dan azam untuk tidak kembali kepadanya sebagai teras taubat, serta menambah pemulihan hak apabila kesalahan melibatkan orang lain. Perincian dan istilahnya berbeza sedikit antara mazhab, jadi pelajarilah daripada guru dalam tradisi anda. Nama-nama Allah seperti at-Tawwab dan al-Ghafur mengingatkan bahawa pintu ini dibuka oleh-Nya.",
        ],
        links: [["/islam/names", "99 Nama Allah"]],
      },
      {
        h2: "Langkah pertama dalam 24 jam",
        p: [
          "Jangan menunggu Isnin depan atau awal bulan. Pada hari yang sama, cari satu masa yang tenang, ambil wuduk, dan tunaikan solat yang seterusnya pada waktunya. Selepas itu, berdoalah dengan kata-kata anda sendiri tentang apa yang anda kesali dan apa yang anda harapkan.",
          "Kemudian buat satu perubahan kecil pada persekitaran yang selama ini memudahkan kesalahan: padam satu aplikasi, ubah satu laluan, atau jauhkan diri daripada satu tempat. Perubahan kecil yang konkrit lebih mudah dikekalkan daripada janji yang besar.",
        ],
        links: [["/wudu", "Latihan wuduk"], ["/prayer", "Waktu solat"]],
      },
      {
        h2: "Cara mulakan semula solat selepas lama tinggal",
        p: [
          "Ramai yang lama meninggalkan solat bimbang kerana sudah lupa urutan dan bacaannya. Latihan solat di laman ini menunjukkan setiap gerakan dengan figura, lengkap dengan bacaan Arab, transliterasi dan maksud, mengikut tradisi Sunni atau Syiah yang anda pilih.",
          "Mulakan dengan waktu yang paling mampu anda jaga, kemudian tambah satu demi satu. Soalan tentang solat yang tertinggal pada masa lalu, termasuk qada, dijawab dengan cara berbeza oleh mazhab-mazhab, jadi tanyakan kepada imam atau ulama yang anda percayai.",
        ],
        links: [["/salah", "Latihan solat"], ["/learn-salah", "Panduan belajar solat"]],
      },
      {
        h2: "Doa taubat dan istighfar",
        p: [
          "Halaman doa menghimpunkan doa memohon keampunan dalam tulisan Arab, transliterasi dan terjemahan, jadi anda boleh mula dengan satu doa pendek dan menambah yang lain secara beransur-ansur. Tidak mengapa jika anda belum menghafalnya; membaca dari skrin sambil memahami maknanya sudah satu permulaan.",
          "Jika anda mahu menyusun permohonan peribadi, penjana doa membantu menyusun doa mengikut tema dengan adab berdoa, misalnya dimulakan dengan pujian dan diakhiri dengan selawat. Doa dalam bahasa sendiri tetap doa yang bermakna.",
        ],
        links: [["/duas", "Doa"], ["/dua-generator", "Penjana doa"]],
      },
      {
        h2: "Quran sebagai teman ketika mula semula",
        p: [
          "Anda tidak perlu terus mensasarkan khatam. Mulakan dengan beberapa minit sehari: satu surah pendek bersama terjemahannya, atau mendengar radio pada stesen Penghibur hati yang memainkan ad-Duha, asy-Syarh dan Yusuf.",
          "Ramai yang mahu memahami tema taubat dan rahmat membaca Surah at-Taubah dan Surah az-Zumar bersama terjemahan. Bacalah perlahan-lahan, berhenti pada ayat yang menyentuh hati, dan bawa soalan anda kepada guru.",
        ],
        links: [["/radio", "Radio Quran"], ["/surah/9", "Surah at-Taubah"], ["/surah/39", "Surah az-Zumar"]],
      },
      {
        h2: "Apabila anda rasa tidak layak untuk berubah",
        p: [
          "Rasa tidak layak sangat biasa, tetapi ia hanya perasaan, bukan ukuran. Apabila ia datang, kecilkan langkah seterusnya sehingga mudah untuk dibuat segera: satu wuduk, satu solat, satu doa. Elakkan membandingkan diri dengan orang lain di media sosial, kerana anda hanya melihat sebahagian kecil hidup mereka.",
          "Jika anda tergelincir lagi, kembalilah lagi; jalan ini memang dilalui berulang kali. Jika beban perasaan terasa terlalu berat, seperti sedih yang berpanjangan atau sukar menjalani hari, bercakaplah juga dengan kaunselor atau profesional kesihatan mental selain guru agama.",
        ],
        links: [["/islam/daily", "Rutin harian Muslim"]],
      },
      {
        h2: "Bila perlu bertanya kepada ulama atau imam",
        p: [
          "Sebahagian perkara memerlukan bimbingan peribadi: kesalahan yang melibatkan hak orang lain, kewajipan yang tertinggal seperti solat atau puasa, dan keadaan hidup yang rumit. Laman ini tidak memberi fatwa dan tidak dapat menggantikan jawapan yang mengambil kira keadaan anda.",
          "Pilih ulama atau imam yang dipercayai dalam mazhab yang anda ikuti, dan ceritakan hanya apa yang perlu untuk mendapatkan jawapan. Anda tidak perlu mengumumkan kesalahan anda kepada orang ramai.",
        ],
        links: [["/islam/madhahib", "Mazhab dalam Islam"]],
      },
    ],
    stepsTitle: "Langkah praktikal untuk mula semula",
    steps: [
      { title: "Berhenti seketika dan berniat", body: "Akui dalam hati bahawa anda mahu kembali, dan jadikan hari ini permulaannya." },
      { title: "Ambil wuduk", body: "Jika anda lupa caranya, ikuti latihan wuduk langkah demi langkah." },
      { title: "Tunaikan solat seterusnya", body: "Semak waktu solat dan tunaikan satu waktu dahulu, kemudian tambah apabila bersedia." },
      { title: "Beristighfar dan berdoa", body: "Mohon ampun dengan doa yang dipelajari atau dengan bahasa sendiri." },
      { title: "Baca atau dengar sedikit Quran", body: "Beberapa minit sehari bersama terjemahan sudah cukup untuk membina kebiasaan." },
      { title: "Cari sokongan", body: "Bercakap dengan guru, imam atau rakan yang dipercayai tentang langkah seterusnya." },
    ],
    faqTitle: "Soalan lazim tentang taubat",
    faq: [
      { q: "Bagaimana cara bertaubat dengan betul?", a: "Secara umum ulama menyebut penyesalan, berhenti daripada kesalahan dan azam untuk tidak mengulanginya, disertai istighfar dan pemulihan hak orang lain jika ada. Untuk perincian mengikut keadaan anda, rujuk ulama mazhab yang anda ikuti." },
      { q: "Apakah syarat taubat nasuha?", a: "Taubat nasuha bermaksud taubat yang ikhlas dan bersungguh-sungguh. Syarat-syaratnya dihuraikan dalam kitab-kitab ulama dengan sedikit perbezaan antara mazhab, jadi pelajarilah daripada guru yang anda percayai." },
      { q: "Bagaimana solat taubat dilakukan?", a: "Dalam banyak kitab fiqh, solat taubat disebut sebagai solat sunat yang dilakukan ketika bertaubat. Cara, bilangan rakaat dan niatnya hendaklah dipelajari mengikut mazhab anda; asas gerakan solat boleh dilatih di halaman belajar solat." },
      { q: "Macam mana nak mula semula selepas banyak dosa?", a: "Mulakan dengan satu langkah yang boleh dibuat hari ini, seperti wuduk dan satu solat, kemudian istighfar. Jangan menunggu rasa bersedia sepenuhnya; tindakan kecil yang berulang membina kekuatan." },
      { q: "Perlukah saya menceritakan dosa saya kepada orang lain?", a: "Halaman ini tidak menyarankan anda mendedahkan kesalahan kepada orang ramai. Jika anda memerlukan nasihat, ceritakan secukupnya kepada ulama atau guru yang dipercayai." },
      { q: "Bagaimana jika saya mengulangi kesalahan yang sama?", a: "Kembali semula dan teruskan usaha, sambil mengubah perkara yang mencetuskan kesalahan itu. Jika anda rasa tersepit, minta bantuan guru atau orang yang dipercayai." },
      { q: "Adakah laman ini memberi fatwa tentang taubat?", a: "Tidak. Ia menyediakan bahan pembelajaran dan langkah praktikal. Untuk hukum dan keadaan peribadi, rujuk ulama atau imam yang anda percayai." },
    ],
    linksTitle: "Langkah seterusnya",
    links: [["/wudu", "Belajar wuduk"], ["/salah", "Belajar solat"], ["/prayer", "Waktu solat"], ["/duas", "Doa"], ["/dua-generator", "Penjana doa"], ["/islam/names", "99 Nama Allah"], ["/radio", "Radio Quran"], ["/islam", "Asas Islam"]],
    cta: ["/wudu", "Mulakan dengan wuduk"],
  },
  "learn-salah": {
    title: "Belajar Solat dari Asas: Panduan Pemula dan Mualaf",
    description: "Belajar solat dari kosong: wuduk, waktu, kiblat, gerakan dan bacaan dengan latihan bergambar. Untuk pemula, mualaf dan anak; Sunni dan Syiah.",
    kicker: "Solat",
    h1: "Belajar solat langkah demi langkah",
    intro: "Belajar solat menjadi lebih mudah apabila dipecahkan kepada bahagian kecil: bersuci, waktu dan kiblat, gerakan, kemudian bacaan. Panduan ini menyusun bahagian-bahagian itu untuk pemula, mualaf dan sesiapa yang mahu mula semula, dengan latihan bergambar yang menunjukkan setiap gerakan mengikut tradisi Sunni atau Syiah.",
    answer: "Untuk belajar solat, mulakan dengan wuduk, kemudian ketahui waktu solat dan arah kiblat, pelajari urutan gerakan, dan hafal bacaan sedikit demi sedikit bermula dengan al-Fatihah. Solat fardu lima waktu ialah Subuh, Zuhur, Asar, Maghrib dan Isyak, dan perincian caranya berbeza sedikit mengikut mazhab yang anda ikuti. Quran Masterclass menyediakan latihan solat bergambar, latihan wuduk, waktu solat dan arah kiblat secara percuma di laman web, dengan akaun yang sama dalam aplikasi iOS.",
    sections: [
      {
        h2: "Apa yang perlu dibuat sebelum solat",
        p: [
          "Sebelum bersolat, seseorang perlu berada dalam keadaan suci: berwuduk, dan mandi wajib apabila diperlukan mengikut penjelasan fiqh mazhabnya. Pakaian dan tempat hendaklah bersih, aurat ditutup, waktu solat telah masuk dan badan menghadap kiblat.",
          "Niat terletak di dalam hati, iaitu kesedaran tentang solat yang sedang ditunaikan. Jika anda baru belajar, sediakan sejadah atau satu sudut yang bersih di rumah supaya persediaan ini menjadi kebiasaan yang mudah.",
        ],
        links: [["/learn-wudu", "Cara berwuduk"], ["/wudu", "Latihan wuduk"]],
      },
      {
        h2: "Waktu solat dan arah kiblat",
        p: [
          "Halaman waktu solat mengira waktu Subuh, Syuruk, Zuhur, Asar, Maghrib dan Isyak pada peranti anda tanpa penjejakan. Anda boleh memilih bandar atau lokasi sendiri, dan kaedah pengiraan termasuk Singapura, Malaysia dan Indonesia serta pilihan waktu Asar mengikut mazhab Hanafi.",
          "Arah kiblat dipaparkan dari utara sebenar, dan di telefon anda boleh menghidupkan kompas langsung. Bandingkan juga dengan jadual rasmi jabatan agama atau masjid tempatan anda, terutamanya sekitar waktu Syuruk. Jadual bulanan boleh dicetak untuk ditampal di rumah.",
        ],
        links: [["/prayer", "Waktu solat dan kiblat"]],
      },
      {
        h2: "Cara solat langkah demi langkah untuk pemula",
        p: [
          "Latihan solat menunjukkan setiap postur dengan figura: berdiri, rukuk, iktidal, sujud, duduk antara dua sujud, tasyahhud dan salam. Bagi setiap postur, anda melihat bacaannya dalam tulisan Arab, transliterasi dan maksud.",
          "Pilih solat yang mahu dipelajari dan tradisi anda, kemudian mainkan keseluruhan urutan atau ikuti langkah demi langkah seberapa kerap yang anda mahu. Mulakan dengan Subuh yang dua rakaat sebelum beralih kepada solat empat rakaat.",
        ],
        links: [["/salah", "Latihan solat"]],
      },
      {
        h2: "Bacaan dalam solat dengan terjemahan",
        p: [
          "Bacaan asas yang perlu dihafal termasuk takbir, al-Fatihah, satu surah pendek, zikir ketika rukuk dan sujud, tasyahhud, selawat dan salam. Surah pendek yang lazim dipelajari dahulu ialah al-Ikhlas, al-Kautsar dan al-Asr.",
          "Lafaz sesetengah bacaan berbeza sedikit antara mazhab, jadi ikutlah versi tradisi anda. Hafal satu bacaan pada satu masa: dengar audionya beberapa kali, baca maknanya, kemudian sebut tanpa melihat. Memahami maksud menjadikan solat lebih dihayati dan bacaan lebih mudah diingat.",
        ],
        links: [["/surah/1", "Surah al-Fatihah"], ["/surah/108", "Surah al-Kautsar"], ["/memorize-quran", "Cara menghafaz"]],
      },
      {
        h2: "Solat Sunni dan Syiah: apa bezanya",
        p: [
          "Kedua-dua tradisi bersetuju tentang lima solat fardu, bilangan rakaatnya, arah kiblat dan rukun utama seperti berdiri, rukuk dan sujud. Perbezaan terdapat pada perincian, misalnya kedudukan tangan semasa berdiri, sebahagian lafaz dalam tasyahhud, dan amalan bersujud di atas bahan semula jadi dalam tradisi Ja'fari.",
          "Dalam kalangan mazhab Sunni sendiri pun ada perbezaan kecil; contohnya, qunut dalam solat Subuh diamalkan dalam mazhab Syafi'i yang lazim di Malaysia. Panduan berasingan untuk solat menurut Sunni dan menurut Syiah disediakan supaya anda dapat mengikut tradisi sendiri.",
        ],
        links: [["/islam/prayer-sunni", "Solat menurut Sunni"], ["/islam/prayer-shia", "Solat menurut Syiah"], ["/islam/madhahib", "Mazhab dalam Islam"]],
      },
      {
        h2: "Belajar solat bagi mualaf dan orang dewasa",
        p: [
          "Bagi mualaf, tidak perlu menguasai semuanya dalam seminggu. Tumpukan dahulu pada wuduk, urutan gerakan dan al-Fatihah, kemudian tambah bacaan yang lain. Bersolat secara berjemaah di belakang imam juga membantu, kerana anda mengikut gerakan sambil terus belajar.",
          "Soalan tentang apa yang boleh dilakukan semasa anda masih menghafal bacaan dijawab dengan cara berbeza oleh guru dan mazhab, jadi tanyakan kepada imam atau kelas mualaf berhampiran. Halaman asas Islam membantu anda melihat solat dalam gambaran yang lebih luas.",
        ],
        links: [["/learn-islam", "Belajar tentang Islam"], ["/islam/daily", "Rutin harian Muslim"]],
      },
      {
        h2: "Cara ajar anak solat",
        p: [
          "Anak-anak belajar dengan melihat. Ajak mereka berdiri di sebelah anda, tunjukkan latihan bergambar sebagai panduan visual, dan ajar satu gerakan pada satu masa. Surah pendek yang sudah mereka hafal boleh terus digunakan dalam solat.",
          "Jadikan solat bersama sebagai waktu keluarga yang tenang, bukan masa untuk memarahi kesilapan. Pujian untuk usaha kecil lebih berkesan daripada teguran yang panjang.",
        ],
        links: [["/guides/quran-for-kids", "Panduan untuk kanak-kanak"]],
      },
    ],
    stepsTitle: "Dari mana hendak bermula",
    steps: [
      { title: "Pelajari wuduk", body: "Ikuti latihan wuduk sehingga tertibnya lancar tanpa panduan." },
      { title: "Semak waktu dan kiblat", body: "Pilih lokasi anda dan kenal pasti waktu solat yang seterusnya serta arah kiblat." },
      { title: "Ikuti latihan gerakan", body: "Pilih solat dan tradisi anda, kemudian mainkan urutan postur satu demi satu." },
      { title: "Hafal al-Fatihah dan satu surah pendek", body: "Dengar, fahami maksudnya, kemudian sebut tanpa melihat." },
      { title: "Tambah zikir dan tasyahhud", body: "Hafal zikir rukuk dan sujud, kemudian tasyahhud, selawat dan salam." },
      { title: "Tunaikan satu solat, kemudian tambah", body: "Mulakan dengan satu waktu yang paling mampu dijaga, lalu tambah secara beransur-ansur." },
    ],
    faqTitle: "Soalan lazim tentang belajar solat",
    faq: [
      { q: "Berapa rakaat bagi setiap waktu solat?", a: "Subuh dua rakaat, Zuhur empat, Asar empat, Maghrib tiga dan Isyak empat. Bagi musafir ada keringanan yang dihuraikan dalam fiqh setiap mazhab." },
      { q: "Apa yang perlu dihafaz untuk bersolat?", a: "Takbir, al-Fatihah, satu surah pendek, zikir rukuk dan sujud, tasyahhud, selawat dan salam. Lafaz sesetengahnya berbeza sedikit mengikut mazhab." },
      { q: "Bolehkah saya bersolat sebelum menghafal semua bacaan?", a: "Soalan ini dijawab berbeza oleh guru dan mazhab, jadi tanyakan kepada imam anda. Sementara itu, utamakan menghafal al-Fatihah kerana ia dibaca dalam setiap rakaat." },
      { q: "Bagaimana menghafal bacaan solat dengan cepat?", a: "Hafal satu bacaan sehari, dengar audionya berulang kali, dan gunakan bacaan itu terus dalam solat. Memahami maksud setiap bacaan juga memudahkan ingatan." },
      { q: "Adakah cara solat wanita berbeza?", a: "Urutan dan rukun asasnya sama. Sebahagian perincian, seperti cara duduk dan batas aurat, dihuraikan dengan sedikit perbezaan dalam setiap mazhab; ustazah atau guru wanita boleh membantu dengan soalan yang khusus." },
      { q: "Bagaimana mengetahui arah kiblat?", a: "Gunakan halaman waktu solat untuk lokasi anda. Arah kiblat dikira pada peranti anda, dan di telefon anda boleh menghidupkan kompas langsung." },
      { q: "Adakah laman ini memberi hukum tentang solat?", a: "Tidak. Ia ialah bahan latihan dan rujukan. Untuk persoalan hukum, rujuk ulama atau guru yang anda percayai mengikut mazhab anda." },
    ],
    linksTitle: "Pautan berkaitan",
    links: [["/salah", "Latihan solat"], ["/wudu", "Latihan wuduk"], ["/prayer", "Waktu solat"], ["/islam/prayer-sunni", "Solat Sunni"], ["/islam/prayer-shia", "Solat Syiah"], ["/surah/1", "Surah al-Fatihah"], ["/learn-wudu", "Cara berwuduk"], ["/duas", "Doa"]],
    cta: ["/salah", "Mula belajar solat"],
  },
  "learn-wudu": {
    title: "Cara Berwuduk yang Betul untuk Pemula, Mualaf dan Anak",
    description: "Cara berwuduk yang betul langkah demi langkah: niat, anggota yang dibasuh, tertib dan doa, dengan latihan interaktif Sunni dan Syiah. Percuma.",
    kicker: "Bersuci",
    h1: "Cara berwuduk yang betul, langkah demi langkah",
    intro: "Cara berwuduk mudah dipelajari apabila setiap langkah dilihat, dilakukan dan diulang beberapa kali. Panduan ini menerangkan persediaan, susunan anggota wuduk, perkara wajib dan sunat, perbezaan antara mazhab dan cara mengajar anak, lalu menunjukkan latihan wuduk interaktif yang boleh anda ikuti sebelum solat.",
    answer: "Wuduk ialah bersuci dengan membasuh dan menyapu anggota tertentu mengikut tertib sebelum solat: bermula dengan niat, kemudian membasuh muka dan tangan hingga siku, menyapu kepala, dan akhirnya kaki, yang dibasuh menurut mazhab Sunni dan disapu menurut tradisi Ja'fari. Sebahagian langkah wajib dan sebahagian sunat, dan perinciannya berbeza mengikut mazhab yang anda anuti. Latihan wuduk Quran Masterclass menunjukkan setiap langkah dengan gambar, doa dan kuiz susunan, percuma di laman web dengan akaun yang sama dalam aplikasi iOS.",
    sections: [
      {
        h2: "Apa yang perlu disediakan sebelum wuduk",
        p: [
          "Gunakan air yang bersih dan menyucikan, iaitu air biasa yang tidak berubah sifatnya. Tanggalkan atau alihkan apa-apa yang menghalang air sampai ke kulit pada anggota wuduk, seperti cat atau pengilat kuku kalis air; soalan tentang balutan luka dan plaster mempunyai hukum tersendiri dalam setiap mazhab.",
          "Wuduk bermula dengan niat di dalam hati. Jika anda baru belajar, berwuduklah dengan perlahan dan ikut latihan pada skrin sehingga tertibnya melekat.",
        ],
        links: [["/learn-salah", "Persediaan sebelum solat"]],
      },
      {
        h2: "Susunan anggota wuduk",
        p: [
          "Dalam bentuk Sunni yang lazim, wuduk dimulakan dengan niat dan basmalah, membasuh kedua-dua tangan, berkumur, memasukkan air ke hidung, membasuh muka, membasuh tangan hingga siku bermula dengan kanan, menyapu kepala, menyapu telinga, dan membasuh kaki hingga buku lali bermula dengan kanan.",
          "Dalam tradisi Ja'fari, selepas niat, muka dibasuh dari atas ke bawah, kemudian tangan kanan dan kiri dari siku ke hujung jari. Bahagian hadapan kepala dan kedua-dua kaki disapu dengan baki basahan tangan tanpa air baharu, dan tertib serta berturut-turut adalah wajib.",
        ],
        links: [["/islam/prayer-sunni", "Wuduk dan solat menurut Sunni"], ["/islam/prayer-shia", "Wuduk dan solat menurut Syiah"]],
      },
      {
        h2: "Rukun dan sunat wuduk",
        p: [
          "Dalam mazhab Syafi'i, yang diamalkan secara meluas di Malaysia, rukun wuduk ada enam: niat, membasuh muka, membasuh kedua-dua tangan hingga siku, menyapu sebahagian kepala, membasuh kedua-dua kaki hingga buku lali, dan tertib. Mazhab Sunni yang lain menyusunnya sedikit berbeza, misalnya tentang tertib dan keperluan berturut-turut.",
          "Perkara sunat termasuk membaca basmalah, membasuh tangan pada permulaan, berkumur, membersihkan hidung, mendahulukan kanan dan mengulang basuhan tiga kali. Latihan wuduk menandakan setiap langkah sebagai wajib atau sunat, dan bagi tradisi Ja'fari sebagai wajib atau mustahab, berserta nota apabila mazhab berbeza pendapat.",
        ],
        links: [["/wudu", "Latihan dengan tanda wajib dan sunat"]],
      },
      {
        h2: "Apakah yang membatalkan wuduk",
        p: [
          "Mazhab-mazhab bersetuju bahawa membuang air kecil, membuang air besar dan keluar angin membatalkan wuduk, begitu juga hilang kesedaran seperti pengsan. Tidur juga membatalkan wuduk, dengan perincian yang berbeza antara mazhab.",
          "Perkara lain diperselisihkan. Contohnya, dalam mazhab Syafi'i bersentuhan kulit antara lelaki dan perempuan bukan mahram tanpa lapik membatalkan wuduk, manakala mazhab lain mempunyai pandangan yang berbeza. Dalam perkara seperti ini, ikutlah penjelasan mazhab anda dan tanyakan kepada guru apabila ragu-ragu.",
        ],
        links: [["/islam/madhahib", "Mazhab dalam Islam"]],
      },
      {
        h2: "Doa selepas berwuduk",
        p: [
          "Latihan wuduk memaparkan doa yang lazim dibaca semasa dan selepas wuduk dalam bentuk Sunni, lengkap dengan tulisan Arab, transliterasi dan maksud. Anda boleh membacanya dari skrin sehingga hafal.",
          "Dalam tradisi Ja'fari juga, doa-doa dianjurkan semasa dan selepas wuduk; latihan menyarankan agar lafaznya dipelajari daripada guru dalam mazhab tersebut. Halaman doa menghimpunkan lebih banyak doa harian untuk dipelajari kemudian.",
        ],
        links: [["/duas", "Doa harian"]],
      },
      {
        h2: "Cara ajar anak berwuduk",
        p: [
          "Kanak-kanak belajar dengan meniru. Berwuduklah di sebelah mereka, sebut nama setiap anggota sambil membasuhnya, dan biarkan mereka mengikut. Bekas air yang kecil membantu mereka belajar menjimatkan air.",
          "Gambar dalam latihan wuduk dan kuiz susunan menjadikan pembelajaran seperti permainan: langkah-langkah dicampur, dan anak perlu menyusunnya semula. Bagi kanak-kanak kecil, mulakan dengan beberapa langkah utama dahulu dan tambah langkah lain apabila mereka sudah biasa. Ulang beberapa hari berturut-turut, kemudian sambung dengan latihan solat.",
        ],
        links: [["/guides/quran-for-kids", "Panduan untuk kanak-kanak"], ["/salah", "Latihan solat"]],
      },
      {
        h2: "Wuduk untuk orang yang baru memeluk Islam",
        p: [
          "Bagi mualaf, wuduk ialah antara perkara pertama yang dipelajari kerana ia diperlukan untuk solat. Fahami langkah-langkah wajib dahulu, kemudian tambah perkara sunat apabila sudah selesa.",
          "Jangan risau jika tertib masih tersilap pada minggu-minggu pertama. Buka latihan wuduk setiap kali sebelum solat sehingga ia menjadi kebiasaan, dan tanyakan soalan kepada guru atau kelas mualaf berhampiran. Nota tentang perbezaan mazhab dalam latihan itu juga membantu anda bertanya soalan yang lebih tepat apabila bertemu guru.",
        ],
        links: [["/learn-islam", "Belajar tentang Islam"]],
      },
    ],
    stepsTitle: "Cara menggunakan latihan wuduk",
    steps: [
      { title: "Buka latihan wuduk", body: "Pilih tradisi Sunni atau Ja'fari, kemudian mula dari langkah pertama." },
      { title: "Ikuti setiap langkah", body: "Lihat gambar, lakukan langkah itu, kemudian teruskan ke langkah berikutnya." },
      { title: "Perhatikan tanda wajib dan sunat", body: "Fahami langkah mana yang wajib dan mana yang sunat dalam mazhab anda." },
      { title: "Baca doa yang dipaparkan", body: "Baca doa dari skrin bersama maknanya sehingga anda menghafalnya." },
      { title: "Jawab kuiz susunan", body: "Susun semula langkah-langkah yang dicampur untuk menguji ingatan." },
      { title: "Amalkan sebelum solat", body: "Berwuduk sendiri sebelum solat seterusnya dan semak semula jika ragu." },
    ],
    faqTitle: "Soalan lazim tentang wuduk",
    faq: [
      { q: "Berapa kali setiap anggota perlu dibasuh?", a: "Dalam mazhab Sunni, sekali basuhan yang meratai anggota sudah sah dan tiga kali adalah sunat. Tradisi Ja'fari mempunyai penjelasan tersendiri tentang bilangan basuhan, jadi ikutlah guru dalam mazhab anda." },
      { q: "Bagaimana berwuduk bagi mualaf?", a: "Ikuti latihan wuduk langkah demi langkah dan ulang sebelum setiap solat. Mulakan dengan memahami langkah-langkah wajib, kemudian tambah yang sunat." },
      { q: "Kenapa wuduk penting sebelum solat?", a: "Semua mazhab menjadikan suci daripada hadas kecil sebagai syarat sah solat, dan wuduk ialah cara bersuci itu. Ia juga menjadi saat untuk menenangkan diri sebelum berdiri untuk solat." },
      { q: "Bolehkah berwuduk jika memakai pengilat kuku atau plaster?", a: "Lapisan yang menghalang air sampai ke kulit secara umumnya perlu ditanggalkan. Bagi luka, balutan dan plaster, setiap mazhab mempunyai hukum tersendiri; tanyakan kepada guru atau ulama anda." },
      { q: "Bagaimana jika saya lupa susunan wuduk?", a: "Buka latihan wuduk dan ikut semula. Ia dibuat untuk diulang sebanyak mana yang anda perlukan." },
      { q: "Adakah wuduk lelaki dan wanita sama?", a: "Langkah-langkahnya sama. Soalan yang khusus, contohnya berkaitan tudung atau rambut ketika menyapu kepala, boleh ditanyakan kepada ustazah atau guru dalam mazhab anda." },
      { q: "Adakah latihan wuduk ini percuma?", a: "Ya, latihan wuduk percuma di laman web dan menggunakan akaun yang sama dengan aplikasi iOS." },
    ],
    linksTitle: "Langkah seterusnya",
    links: [["/wudu", "Latihan wuduk"], ["/salah", "Latihan solat"], ["/prayer", "Waktu solat"], ["/duas", "Doa"], ["/learn-salah", "Panduan belajar solat"], ["/islam/madhahib", "Mazhab dalam Islam"], ["/guides/quran-for-kids", "Panduan untuk kanak-kanak"], ["/tawbah", "Kembali dengan tenang"]],
    cta: ["/wudu", "Mula berlatih wuduk"],
  },
  "learn-islam": {
    title: "Belajar Tentang Islam: Panduan Asas untuk Pemula",
    description: "Belajar tentang Islam dari asas: iman, rukun Islam, Quran, Nabi Muhammad, solat dan kehidupan harian. Untuk mualaf dan pemula, Sunni dan Syiah.",
    kicker: "Asas Islam",
    h1: "Belajar tentang Islam dari asas",
    intro: "Belajar tentang Islam boleh dimulakan dengan tenang, satu topik pada satu masa, sama ada anda baru mengenalinya, baru memeluk Islam atau mahu menyegarkan semula asas. Panduan ini menerangkan apa yang perlu diketahui dahulu, susunan belajar yang munasabah dan di mana setiap topik boleh dibaca di Quran Masterclass.",
    answer: "Belajar tentang Islam biasanya bermula dengan kepercayaan asas, iaitu keesaan Allah, kenabian Muhammad, kitab-kitab, malaikat dan Hari Akhirat, diikuti amalan asas seperti syahadah, solat, puasa Ramadan, zakat dan haji. Huraian Sunni menyusunnya sebagai rukun iman dan rukun Islam, manakala tradisi Syiah menyusunnya sebagai usul al-din dan furu' al-din. Quran Masterclass menerangkan topik-topik ini dalam bahasa mudah dan secara neutral, percuma di laman web dengan akaun yang sama dalam aplikasi iOS.",
    sections: [
      {
        h2: "Bagaimana mula belajar tentang Islam dari asas",
        p: [
          "Susunan yang membantu ialah kepercayaan dahulu, kemudian ibadah asas, kemudian akhlak dan kehidupan harian. Dengan cara ini setiap amalan yang dipelajari mempunyai makna, dan anda tidak tenggelam dalam terlalu banyak maklumat sekali gus.",
          "Pilih sumber yang tenang dan jelas, dan berhati-hati dengan potongan video atau hantaran media sosial yang memberi jawapan pantas tanpa konteks. Catat soalan yang timbul dan bawa kepada guru, imam atau kelas di masjid berhampiran.",
        ],
        links: [["/islam", "Semua topik Islam"], ["/islam/islam", "Apa itu Islam"]],
      },
      {
        h2: "Rukun iman dan rukun Islam",
        p: [
          "Dalam huraian Sunni, rukun iman ada enam: beriman kepada Allah, para malaikat, kitab-kitab, para rasul, Hari Akhirat, serta qada dan qadar. Rukun Islam ada lima: mengucap dua kalimah syahadah, mendirikan solat, menunaikan zakat, berpuasa pada bulan Ramadan dan menunaikan haji bagi yang mampu.",
          "Tradisi Syiah menyusun asas kepercayaan sebagai usul al-din, iaitu tauhid, keadilan Ilahi, kenabian, imamah dan hari kebangkitan, dan amalan sebagai furu' al-din yang antaranya merangkumi solat, puasa, zakat, khums dan haji. Banyak isi kandungannya dikongsi oleh kedua-dua tradisi.",
        ],
        links: [["/islam/iman", "Iman"], ["/islam/madhahib", "Mazhab dalam Islam"]],
      },
      {
        h2: "Apa itu Quran dan hadis",
        p: [
          "Quran ialah kalam Allah yang diwahyukan kepada Nabi Muhammad dalam bahasa Arab, terdiri daripada 114 surah. Ia dibaca dalam solat, dihafaz, dan menjadi rujukan utama kepercayaan serta amalan. Terjemahan membantu memahami maknanya, tetapi teks Arabnya kekal sebagai Quran itu sendiri.",
          "Hadis ialah riwayat tentang kata-kata, perbuatan dan pengakuan Nabi. Tradisi Sunni dan Syiah mempunyai himpunan hadis masing-masing, seperti Sahih al-Bukhari dan Sahih Muslim dalam tradisi Sunni dan al-Kafi dalam tradisi Syiah, serta kaedah tersendiri untuk menilai riwayat.",
        ],
        links: [["/islam/quran", "Tentang Quran"], ["/quran", "Baca Quran dengan terjemahan"]],
      },
      {
        h2: "Belajar tentang Nabi Muhammad untuk pemula",
        p: [
          "Mengenali Nabi Muhammad bermula dengan garis besar kehidupan baginda: kelahiran di Makkah, permulaan wahyu, tahun-tahun dakwah, hijrah ke Madinah yang menjadi permulaan kalendar Hijrah, dan tahun-tahun terakhir baginda. Kehidupan baginda menjadi contoh dalam ibadah, keluarga dan pergaulan.",
          "Ringkasan sirah di laman ini ditulis untuk pembaca baharu. Kalendar Islam pula membantu anda mengenali bulan-bulan Hijrah dan hari-hari penting yang berkait dengan sejarah ini.",
        ],
        links: [["/islam/prophet", "Nabi Muhammad"], ["/calendar", "Kalendar Islam"]],
      },
      {
        h2: "Ibadah asas: wuduk, solat, puasa dan haji",
        p: [
          "Setelah memahami asas kepercayaan, kebanyakan orang mula dengan wuduk dan solat kerana kedua-duanya diamalkan setiap hari. Al-Fatihah dan beberapa surah pendek dipelajari pada masa yang sama kerana dibaca dalam solat.",
          "Puasa Ramadan datang setahun sekali dan elok dipelajari sebelum bulan itu tiba. Zakat dan haji mempunyai syarat tersendiri, termasuk kemampuan; bagi zakat, pihak berkuasa agama atau pusat zakat setempat biasanya boleh membantu dengan pengiraan.",
        ],
        links: [["/learn-wudu", "Cara berwuduk"], ["/learn-salah", "Belajar solat"], ["/islam/ramadan", "Ramadan"], ["/islam/hajj", "Haji"]],
      },
      {
        h2: "Asas halal dan haram untuk pemula",
        p: [
          "Prinsip yang sering diajar ialah asal sesuatu perkara adalah harus kecuali ada dalil yang melarangnya. Contoh larangan yang jelas termasuk babi, arak dan riba; perkara yang samar-samar pula elok ditanyakan kepada orang yang berilmu.",
          "Halal dan haram juga meliputi cara mencari rezeki, cara bercakap dan cara bergaul, bukan makanan semata-mata. Di Malaysia, logo halal yang diiktiraf membantu ketika membeli makanan, tetapi akhlak harian tetap bergantung pada diri sendiri.",
        ],
        links: [["/islam/halal-haram", "Halal dan haram"], ["/islam/daily", "Rutin harian"]],
      },
      {
        h2: "Panduan untuk mualaf yang baru memeluk Islam",
        p: [
          "Memeluk Islam bermula dengan syahadah yang diucapkan dengan keyakinan. Di sesetengah negara, termasuk Malaysia, pengislaman didaftarkan melalui pihak berkuasa agama negeri, jadi masjid atau pejabat agama berhampiran boleh menerangkan prosesnya.",
          "Selepas itu, tidak perlu tergesa-gesa. Pelajari wuduk dan solat, mula membaca al-Fatihah, kenali nama-nama Allah, dan kekalkan hubungan yang baik dengan keluarga. Komuniti dan guru yang sabar sangat membantu pada bulan-bulan pertama.",
        ],
        links: [["/learn-quran", "Belajar Quran"], ["/islam/names", "99 Nama Allah"], ["/duas", "Doa harian"]],
      },
    ],
    stepsTitle: "Cadangan urutan belajar",
    steps: [
      { title: "Fahami syahadah dan tauhid", body: "Mulakan dengan maksud keesaan Allah dan kenabian Muhammad." },
      { title: "Baca tentang iman dan Nabi", body: "Baca topik iman dan ringkasan sirah satu demi satu." },
      { title: "Belajar wuduk dan solat", body: "Gunakan latihan bergambar mengikut mazhab yang anda ikuti." },
      { title: "Mula membaca al-Fatihah", body: "Dengar, baca terjemahannya dan hafal sedikit demi sedikit." },
      { title: "Kenali kalendar dan musim ibadah", body: "Ketahui bila Ramadan, Aidilfitri dan Aidiladha dalam kalendar Hijrah." },
      { title: "Cari guru dan komuniti", body: "Sertai kelas di masjid atau pusat bimbingan untuk soalan yang lebih khusus." },
    ],
    faqTitle: "Soalan lazim tentang belajar Islam",
    faq: [
      { q: "Apa beza Sunni dan Syiah?", a: "Kedua-duanya berkongsi asas iman kepada Allah, Nabi Muhammad, Quran dan Hari Akhirat. Perbezaan utama berkait dengan kepimpinan umat selepas Nabi dan sebahagian perincian fiqh. Laman ini menerangkan kedua-duanya secara neutral." },
      { q: "Apakah mazhab dalam Islam?", a: "Mazhab ialah aliran fiqh. Dalam tradisi Sunni ada empat mazhab utama, iaitu Hanafi, Maliki, Syafi'i dan Hanbali, dan mazhab Syafi'i paling meluas di Malaysia. Dalam tradisi Syiah, mazhab Ja'fari ialah yang terbesar." },
      { q: "Bolehkah belajar Islam dalam talian secara percuma?", a: "Ya. Topik asas, latihan wuduk dan solat, Quran dengan terjemahan dan doa harian boleh dibaca secara percuma di laman web ini. Guru dan komuniti tetap penting untuk soalan peribadi." },
      { q: "Perlukah saya belajar bahasa Arab dahulu?", a: "Tidak. Anda boleh bermula dengan terjemahan dan belajar membaca tulisan Arab secara beransur-ansur, bermula dengan al-Fatihah untuk solat." },
      { q: "Bagaimana cara masuk Islam dan apa selepas itu?", a: "Seseorang memeluk Islam dengan mengucap dua kalimah syahadah dengan keyakinan, lazimnya di hadapan saksi di masjid. Selepas itu, pelajari solat dan asas iman secara beransur-ansur dan uruskan pendaftaran mengikut peraturan setempat." },
      { q: "Bagaimana nak belajar Islam dengan tenang?", a: "Tetapkan satu topik seminggu, baca dengan perlahan dan amalkan satu perkara kecil. Elakkan perdebatan sebelum asasnya difahami." },
      { q: "Apakah ibadah asas dalam Islam?", a: "Solat lima waktu, puasa Ramadan, zakat dan haji bagi yang mampu, bersama zikir, doa dan membaca Quran. Wuduk dipelajari sebelum solat." },
      { q: "Adakah laman ini memberi fatwa?", a: "Tidak. Ia bertujuan pembelajaran. Untuk persoalan hukum, rujuk ulama atau guru yang anda percayai mengikut mazhab anda." },
    ],
    linksTitle: "Bahan untuk dibaca",
    links: [["/islam", "Semua topik Islam"], ["/islam/islam", "Apa itu Islam"], ["/islam/prophet", "Nabi Muhammad"], ["/islam/iman", "Iman"], ["/islam/madhahib", "Mazhab"], ["/islam/ramadan", "Ramadan"], ["/learn-salah", "Belajar solat"], ["/learn-quran", "Belajar Quran"], ["/islam/names", "99 Nama Allah"]],
    cta: ["/islam", "Mulakan belajar"],
  },
};

export default hubs;
