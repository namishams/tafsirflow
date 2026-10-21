import type { MapContent } from "../../mapContent";
const c: MapContent = {
  kicker: "Quran Masterclass · Metode Shams",
  title: "Peta Quran",
  lead: "114 surah, 30 juz, 6.236 ayat – dan dalam sekejap Anda melihat apa yang sudah kuat, apa yang goyah, dan apa yang sulit bagi Anda. Peta ini bukan bilah kemajuan yang hanya terus bertambah. Ia adalah cermin jujur dari ingatan Anda: menjadi hijau ketika Anda bermurajaah dan memudar ketika Anda membiarkan sebuah ayat terlalu lama.",
  ctaStart: "Pelajari ayat pertama Anda dengan Metode Shams",
  ctaToday: "Ke tugas-tugas Anda hari ini",
  stats: [{ n: "114", l: "surah sebagai kotak" }, { n: "30", l: "juz dalam sekejap" }, { n: "6.236", l: "ayat, masing-masing terlihat" }],
  readTitle: "Cara membaca peta Anda",
  readLead: "Setiap kotak adalah sebuah surah. Warnanya adalah rata-rata dari semua ayat yang sudah Anda pelajari dalam surah itu. Jika sebuah surah baru sebagian dipelajari, kotaknya digambar lebih terang. Ketuk sebuah kotak dan surah itu terbuka ayat demi ayat.",
  colors: [
    { key: "strong", t: "Hijau – kuat", d: "Anda telah memurajaah ayat-ayat ini tepat waktu, ingatan Anda menyimpannya dengan kokoh.", todo: "Tidak perlu melakukan apa pun – platform akan mengembalikannya sesaat sebelum mulai memudar." },
    { key: "mid", t: "Emas – goyah", d: "Murajaah terakhir Anda sudah cukup lama. Anda masih mengingat ayat-ayatnya, tetapi tidak lagi dengan mudah.", todo: "Murajaah hari ini atau besok. Satu putaran dalam mode hafalan biasanya sudah cukup." },
    { key: "weak", t: "Merah – sulit", d: "Entah sudah lama tidak dimurajaah atau Anda sering keliru di sini. Kesalahan dalam tes, pelajaran, dan murajaah semuanya ikut dihitung.", todo: "Dahulukan ayat-ayat ini: bukalah dengan Metode Shams, gunakan pengait ingatan dan penyusunan dari belakang." },
    { key: "none", t: "Abu-abu – belum dipelajari", d: "Masih ada perjalanan di depan Anda. Abu-abu bukanlah kekurangan, melainkan sebuah undangan.", todo: "Jika rencana Anda menghendakinya: pelajari berikutnya. Surah-surah pendek di akhir Quran adalah awal yang baik." },
  ],
  howTitle: "Bagaimana peta mengetahui apa yang Anda kuasai",
  howBody: "Di balik setiap ayat yang telah dipelajari terdapat sebuah model ingatan kecil. Ia mencatat **kapan** terakhir kali Anda memurajaah ayat itu, **dengan jarak berapa lama** ayat itu harus kembali, dan **seberapa sering** Anda keliru padanya.\n\n- **Jarak:** setelah pertama kali dipelajari, sebuah ayat kembali keesokan harinya, lalu setelah tiga hari, sepekan, dua pekan, sebulan, dan lebih lama lagi. Setiap murajaah yang berhasil memperpanjang jaraknya.\n- **Memudar:** semakin jauh sebuah ayat melewati jaraknya, semakin rendah perkiraan kekuatannya – hijau menjadi emas, emas menjadi merah. Persis seperti ingatan yang sebenarnya.\n- **Kemudahan:** ayat yang terasa mudah mendapat jarak yang lebih panjang. Ayat yang sering membuat Anda keliru kembali lebih sering. Setiap kesalahan menurunkan kemudahan dan juga dihitung sebagai penalti di peta.\n- **Tersinkron:** dengan akun Anda, peta ini sama di setiap perangkat – dipelajari di ponsel, dilihat di laptop.\n\nPeta ini adalah perkiraan, bukan vonis. Apakah sebuah ayat benar-benar kuat pada akhirnya hanya terbukti ketika Anda membacanya – sebaiknya di hadapan seseorang yang dapat mengoreksi Anda.",
  useTitle: "Apa yang Anda lakukan dengan peta ini",
  uses: [
    { t: "Pagi hari: merah dulu", d: "Sebelum mempelajari hal baru, kembalikan dulu kotak-kotak merah. Lima menit murajaah menyelamatkan lebih banyak daripada dua puluh menit belajar ulang." },
    { t: "Sebelum shalat", d: "Surah-surah pendek yang bertanda emas sangat cocok untuk shalat: membacanya berarti memurajaahnya – dan peta Anda menjadi semakin hijau." },
    { t: "Bersama guru Anda", d: "Tunjukkan peta ini kepada guru atau orang tua Anda. Dalam hitungan detik mereka melihat bagian mana yang perlu mereka simak dari Anda." },
    { t: "Untuk Ramadhan", d: "Ingin menguasai satu juz dengan kokoh menjelang Ramadhan? Beralihlah ke tampilan juz dan bekerjalah dari merah menuju hijau." },
  ],
  viewsTitle: "Tiga tingkat, satu gambaran",
  views: [
    { t: "Surah", d: "114 kotak – dari Al-Baqarah yang panjang hingga An-Nas yang pendek. Ikhtisar tercepat atas seluruh Quran Anda." },
    { t: "Juz", d: "30 kotak untuk 30 bagian. Ideal untuk rencana tahfizh yang berpikir dalam satuan juz, dan untuk merencanakan khatam." },
    { t: "Ayat", d: "Ketuk sebuah surah: setiap ayat menjadi kotaknya sendiri. Satu ketukan membukanya untuk murajaah atau untuk dipelajari dari awal." },
  ],
  faqTitle: "Pertanyaan tentang peta",
  faq: [
    { q: "Mengapa kotak hijau menjadi emas padahal saya tidak melakukan kesalahan apa pun?", a: "Karena ingatan memudar tanpa murajaah. Peta ini tidak menunjukkan apa yang pernah Anda pelajari, melainkan apa yang kemungkinan besar masih Anda kuasai dengan kokoh hari ini. Satu kali murajaah membuatnya hijau lagi – dan jarak berikutnya menjadi lebih panjang." },
    { q: "Saya melihat contoh peta – apakah itu kemajuan saya?", a: "Bukan. Selama Anda belum masuk atau belum mempelajari satu ayat pun, kami menampilkan contoh yang ditandai dengan jelas agar Anda bisa melihat seperti apa tampilannya nanti. Begitu Anda mempelajari ayat pertama Anda, peta Anda sendiri akan muncul." },
    { q: "Apakah mendengarkan saja ikut dihitung?", a: "Mendengarkan adalah langkah pertama Metode Shams, tetapi sebuah ayat baru muncul di peta setelah Anda mempelajari dan mengingatnya kembali – di pelatih Shams, dalam pelajaran, tes, atau mode murajaah." },
    { q: "Bagaimana jika saya sudah hafal surah itu sebelumnya?", a: "Bukalah dalam mode hafalan, bacalah setiap ayat dari hafalan, dan beri nilai “Mudah”. Ayat itu langsung muncul di peta, melompat maju dalam jadwal, dan kembali dengan jarak yang panjang agar tetap kokoh." },
    { q: "Apakah orang lain dapat melihat peta saya?", a: "Tidak. Peta Anda adalah milik Anda. Ia dikirim secara terenkripsi bersama akun Anda dan tidak pernah ditampilkan secara publik." },
  ],
  finalTitle: "Setiap kotak hijau adalah sepotong Quran di dalam hati Anda.",
  finalLead: "Mulailah hari ini dengan satu ayat saja. Besok Anda akan melihatnya di peta Anda – dan dalam setahun, sebuah bentang alam yang utuh.",
};
export default c;
