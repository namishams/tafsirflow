import type { MapContent } from "../../mapContent";
const c: MapContent = {
  kicker: "Quran Masterclass · Metode Shams",
  title: "Peta Quran",
  lead: "114 surah, 30 juz, 6.236 ayat – dan dalam sekejap kamu melihat apa yang sudah kuat, apa yang goyah, dan apa yang sulit bagimu. Peta ini bukan bilah kemajuan yang hanya terus bertambah. Ia adalah cermin jujur dari ingatanmu: menjadi hijau ketika kamu bermurajaah dan memudar ketika kamu membiarkan sebuah ayat terlalu lama.",
  ctaStart: "Pelajari ayat pertamamu dengan Metode Shams",
  ctaToday: "Ke tugas-tugasmu hari ini",
  stats: [{ n: "114", l: "surah sebagai kotak" }, { n: "30", l: "juz dalam sekejap" }, { n: "6.236", l: "ayat, masing-masing terlihat" }],
  readTitle: "Cara membaca petamu",
  readLead: "Setiap kotak adalah sebuah surah. Warnanya adalah rata-rata dari semua ayat yang sudah kamu pelajari dalam surah itu. Jika sebuah surah baru sebagian dipelajari, kotaknya digambar lebih terang. Ketuk sebuah kotak dan surah itu terbuka ayat demi ayat.",
  colors: [
    { key: "strong", t: "Hijau – kuat", d: "Kamu telah memurajaah ayat-ayat ini tepat waktu, ingatanmu menyimpannya dengan kokoh.", todo: "Tidak perlu melakukan apa pun – platform akan mengembalikannya sesaat sebelum mulai memudar." },
    { key: "mid", t: "Emas – goyah", d: "Murajaah terakhirmu sudah cukup lama. Kamu masih mengingat ayat-ayatnya, tetapi tidak lagi dengan mudah.", todo: "Murajaah hari ini atau besok. Satu putaran dalam mode hafalan biasanya sudah cukup." },
    { key: "weak", t: "Merah – sulit", d: "Entah sudah lama tidak dimurajaah atau kamu sering keliru di sini. Kesalahan dalam tes, pelajaran, dan murajaah semuanya ikut dihitung.", todo: "Dahulukan ayat-ayat ini: bukalah dengan Metode Shams, gunakan pengait ingatan dan penyusunan dari belakang." },
    { key: "none", t: "Abu-abu – belum dipelajari", d: "Masih ada perjalanan di depanmu. Abu-abu bukanlah kekurangan, melainkan sebuah undangan.", todo: "Jika rencanamu menghendakinya: pelajari berikutnya. Surah-surah pendek di akhir Quran adalah awal yang baik." },
  ],
  howTitle: "Bagaimana peta mengetahui apa yang kamu kuasai",
  howBody: "Di balik setiap ayat yang telah dipelajari terdapat sebuah model ingatan kecil. Ia mencatat **kapan** terakhir kali kamu memurajaah ayat itu, **dengan jarak berapa lama** ayat itu harus kembali, dan **seberapa sering** kamu keliru padanya.\n\n- **Jarak:** setelah pertama kali dipelajari, sebuah ayat kembali keesokan harinya, lalu setelah tiga hari, sepekan, dua pekan, sebulan, dan lebih lama lagi. Setiap murajaah yang berhasil memperpanjang jaraknya.\n- **Memudar:** semakin jauh sebuah ayat melewati jaraknya, semakin rendah perkiraan kekuatannya – hijau menjadi emas, emas menjadi merah. Persis seperti ingatan yang sebenarnya.\n- **Kemudahan:** ayat yang terasa mudah mendapat jarak yang lebih panjang. Ayat yang sering membuatmu keliru kembali lebih sering. Setiap kesalahan menurunkan kemudahan dan juga dihitung sebagai penalti di peta.\n- **Tersinkron:** dengan akunmu, peta ini sama di setiap perangkat – dipelajari di ponsel, dilihat di laptop.\n\nPeta ini adalah perkiraan, bukan vonis. Apakah sebuah ayat benar-benar kuat pada akhirnya hanya terbukti ketika kamu membacanya – sebaiknya di hadapan seseorang yang dapat mengoreksimu.",
  useTitle: "Apa yang kamu lakukan dengan peta ini",
  uses: [
    { t: "Pagi hari: merah dulu", d: "Sebelum mempelajari hal baru, kembalikan dulu kotak-kotak merah. Lima menit murajaah menyelamatkan lebih banyak daripada dua puluh menit belajar ulang." },
    { t: "Sebelum shalat", d: "Surah-surah pendek yang bertanda emas sangat cocok untuk shalat: membacanya berarti memurajaahnya – dan petamu menjadi semakin hijau." },
    { t: "Bersama gurumu", d: "Tunjukkan peta ini kepada guru atau orang tuamu. Dalam hitungan detik mereka melihat bagian mana yang perlu mereka simak darimu." },
    { t: "Untuk Ramadhan", d: "Ingin menguasai satu juz dengan kokoh menjelang Ramadhan? Beralihlah ke tampilan juz dan bekerjalah dari merah menuju hijau." },
  ],
  viewsTitle: "Tiga tingkat, satu gambaran",
  views: [
    { t: "Surah", d: "114 kotak – dari Al-Baqarah yang panjang hingga An-Nas yang pendek. Ikhtisar tercepat atas seluruh Quranmu." },
    { t: "Juz", d: "30 kotak untuk 30 bagian. Ideal untuk rencana tahfizh yang berpikir dalam satuan juz, dan untuk merencanakan khatam." },
    { t: "Ayat", d: "Ketuk sebuah surah: setiap ayat menjadi kotaknya sendiri. Satu ketukan membukanya untuk murajaah atau untuk dipelajari dari awal." },
  ],
  faqTitle: "Pertanyaan tentang peta",
  faq: [
    { q: "Mengapa kotak hijau menjadi emas padahal saya tidak melakukan kesalahan apa pun?", a: "Karena ingatan memudar tanpa murajaah. Peta ini tidak menunjukkan apa yang pernah kamu pelajari, melainkan apa yang kemungkinan besar masih kamu kuasai dengan kokoh hari ini. Satu kali murajaah membuatnya hijau lagi – dan jarak berikutnya menjadi lebih panjang." },
    { q: "Saya melihat contoh peta – apakah itu kemajuan saya?", a: "Bukan. Selama kamu belum masuk atau belum mempelajari satu ayat pun, kami menampilkan contoh yang ditandai dengan jelas agar kamu bisa melihat seperti apa tampilannya nanti. Begitu kamu mempelajari ayat pertamamu, petamu sendiri akan muncul." },
    { q: "Apakah mendengarkan saja ikut dihitung?", a: "Mendengarkan adalah langkah pertama Metode Shams, tetapi sebuah ayat baru muncul di peta setelah kamu mempelajari dan mengingatnya kembali – di pelatih Shams, dalam pelajaran, tes, atau mode murajaah." },
    { q: "Bagaimana jika saya sudah hafal surah itu sebelumnya?", a: "Bukalah dalam mode hafalan, bacalah setiap ayat dari hafalan, dan beri nilai “Mudah”. Ayat itu langsung muncul di peta, melompat maju dalam jadwal, dan kembali dengan jarak yang panjang agar tetap kokoh." },
    { q: "Apakah orang lain dapat melihat peta saya?", a: "Tidak. Petamu adalah milikmu. Ia dikirim secara terenkripsi bersama akunmu dan tidak pernah ditampilkan secara publik." },
  ],
  finalTitle: "Setiap kotak hijau adalah sepotong Quran di dalam hatimu.",
  finalLead: "Mulailah hari ini dengan satu ayat saja. Besok kamu akan melihatnya di petamu – dan dalam setahun, sebuah bentang alam yang utuh.",
};
export default c;
