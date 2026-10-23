import type { MapContent } from "../../mapContent";
// Translated from English with Claude Haiku (23.10.2026); no Quran or hadith text is typed here. Corrections welcome.
const c: MapContent = {
  kicker: "Quran Masterclass · Kaedah Shams",
  title: "Peta Quran",
  lead: "114 surah, 30 ajza', 6,236 ayat – dan sekali pandang anda melihat mana yang kukuh, mana yang goyah dan mana yang sukar bagi anda. Peta ini bukan bar kemajuan yang hanya bertambah. Ia cermin jujur bagi ingatan anda: ia bertukar hijau apabila anda mengulang kaji dan pudar apabila anda membiarkan sesuatu ayat terlalu lama.",
  ctaStart: "Pelajari ayat pertama anda dengan Kaedah Shams",
  ctaToday: "Pergi ke tugas hari ini",
  stats: [
    {
      n: "114",
      l: "surah sebagai kotak",
    },
    {
      n: "30",
      l: "ajza' sekali pandang",
    },
    {
      n: "6,236",
      l: "ayat, setiap satu kelihatan",
    },
  ],
  readTitle: "Cara membaca peta anda",
  readLead: "Setiap kotak ialah satu surah. Warnanya ialah purata bagi semua ayat yang telah anda pelajari dalam surah itu. Jika sesebuah surah hanya dipelajari sebahagian, kotaknya dilukis lebih cerah. Ketik satu kotak dan surah itu terbuka ayat demi ayat.",
  colors: [
    {
      key: "strong",
      t: "Hijau – kukuh",
      d: "Anda mengulang kaji ayat-ayat ini tepat pada masanya, ingatan anda memegangnya dengan kukuh.",
      todo: "Tiada tindakan diperlukan – platform membawanya kembali sebelum ia hendak pudar.",
    },
    {
      key: "mid",
      t: "Emas – goyah",
      d: "Ulang kaji terakhir anda sudah lama berlalu. Anda masih mengetahui ayat-ayat ini, tetapi tidak lagi dengan mudah.",
      todo: "Ulang kaji hari ini atau esok. Satu kali dalam mod hafazan biasanya sudah mencukupi.",
    },
    {
      key: "weak",
      t: "Merah – sukar",
      d: "Sama ada tidak diulang kaji sudah lama atau anda kerap tersilap di sini. Kesilapan dalam ujian, pelajaran dan ulang kaji semuanya dikira.",
      todo: "Utamakan ini dahulu: buka dengan Kaedah Shams, gunakan petunjuk ingatan dan bina dari belakang.",
    },
    {
      key: "none",
      t: "Kelabu – belum dipelajari",
      d: "Perjalanan masih panjang. Kelabu bukan kegagalan, ia ialah jemputan.",
      todo: "Jika pelan anda menyarankannya: pelajari seterusnya. Surah-surah pendek di hujung Quran ialah permulaan yang baik.",
    },
  ],
  howTitle: "Bagaimana peta tahu apa yang anda tahu",
  howBody: "Di sebalik setiap ayat yang dipelajari terdapat model ingatan yang kecil. Ia mengingat **bila** anda kali terakhir mengulang kaji ayat itu, **pada selang apa** ayat itu patut kembali dan **kerap mana** anda tersilap padanya.\n\n- **Selang:** selepas pembelajaran pertama, ayat kembali keesokan harinya, kemudian selepas tiga hari, seminggu, dua minggu, sebulan dan lebih lama. Setiap ulang kaji yang berjaya memanjangkan selang.\n- **Pudar:** semakin jauh sesuatu ayat melepasi selangnya, semakin rendah anggaran kekuatannya – hijau bertukar emas, emas bertukar merah. Sama seperti ingatan sebenar.\n- **Kemudahan:** ayat yang mudah diingat mendapat selang yang lebih panjang. Ayat yang anda tersilap padanya kembali lebih kerap. Setiap kesilapan menurunkan kemudahan dan juga dikira sebagai penalti pada peta.\n- **Segerak:** dengan akaun anda, peta ini sama pada setiap peranti – dipelajari pada telefon anda, dilihat pada komputer riba anda.\n\nPeta ini ialah anggaran, bukan keputusan muktamad. Sama ada sesuatu ayat benar-benar kukuh hanya dapat ditunjukkan pada akhirnya dengan membacanya – sebaiknya kepada seseorang yang boleh membetulkan anda.",
  useTitle: "Apa yang anda lakukan dengan peta",
  uses: [
    {
      t: "Pagi: merah dahulu",
      d: "Sebelum mempelajari apa-apa yang baharu, kembalikan kotak merah. Lima minit ulang kaji menjimatkan lebih daripada dua puluh minit belajar semula.",
    },
    {
      t: "Sebelum solat",
      d: "Surah-surah pendek yang ditanda emas sesuai untuk solat: membacanya ialah mengulang kajinya – dan peta menjadi lebih hijau.",
    },
    {
      t: "Bersama guru anda",
      d: "Tunjukkan peta kepada guru atau ibu bapa anda. Dalam beberapa saat mereka dapat melihat di mana perlu mendengar bacaan anda.",
    },
    {
      t: "Untuk Ramadan",
      d: "Mahu menguasai satu juz dengan kukuh menjelang Ramadan? Tukar kepada paparan juz dan bekerja dari merah ke hijau.",
    },
  ],
  viewsTitle: "Tiga peringkat, satu gambaran",
  views: [
    {
      t: "Surah",
      d: "114 kotak – dari al-Baqarah yang panjang hingga an-Nas yang pendek. Gambaran terpantas bagi seluruh Quran anda.",
    },
    {
      t: "Ajza'",
      d: "30 kotak bagi 30 bahagian. Sesuai untuk pelan hafazan yang berfikir mengikut juz, dan untuk perancangan khatam.",
    },
    {
      t: "Ayat",
      d: "Ketik satu surah: setiap ayat menjadi kotaknya sendiri. Satu ketikan membukanya untuk ulang kaji atau pembelajaran baharu.",
    },
  ],
  faqTitle: "Soalan tentang peta",
  faq: [
    {
      q: "Mengapa kotak hijau bertukar emas walaupun saya tidak melakukan kesilapan?",
      a: "Kerana ingatan pudar tanpa ulang kaji. Peta tidak menunjukkan apa yang pernah anda pelajari, tetapi apa yang mungkin masih anda ketahui dengan kukuh hari ini. Satu ulang kaji menjadikannya hijau semula – dan selang seterusnya menjadi lebih panjang.",
    },
    {
      q: "Saya melihat peta contoh – adakah itu kemajuan saya?",
      a: "Tidak. Selagi anda belum log masuk atau belum mempelajari sebarang ayat, kami memaparkan contoh yang ditanda dengan jelas supaya anda dapat melihat rupanya. Sebaik sahaja anda mempelajari ayat pertama, peta anda sendiri akan muncul.",
    },
    {
      q: "Adakah mendengar dikira?",
      a: "Mendengar ialah langkah pertama Kaedah Shams, tetapi ayat hanya muncul pada peta apabila anda telah mempelajari dan mengingatnya semula – dalam jurulatih Kaedah Shams, pelajaran, ujian atau mod ulang kaji.",
    },
    {
      q: "Bagaimana jika saya sudah menghafal surah itu?",
      a: "Buka dalam mod hafazan, baca setiap ayat dari hafalan dan nilainya “Mudah”. Ia muncul pada peta dengan serta-merta, melompat ke hadapan dalam jadual dan kembali pada selang yang panjang supaya ia kekal kukuh.",
    },
    {
      q: "Bolehkah orang lain melihat peta saya?",
      a: "Tidak. Peta anda milik anda. Ia dipindahkan secara disulitkan bersama akaun anda dan tidak pernah dipaparkan secara terbuka.",
    },
  ],
  finalTitle: "Setiap kotak hijau ialah sekeping Quran dalam hati anda.",
  finalLead: "Mulakan hari ini dengan satu ayat. Esok anda akan melihatnya pada peta anda – dan dalam setahun, satu landskap yang utuh.",
};
export default c;
