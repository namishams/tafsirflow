import type { KeywordSet } from "../types";

// Data riset kata kunci (Bahasa Indonesia). Tidak pernah ditampilkan sebagai daftar di halaman.
const listenShort = ["murottal al quran", "mp3 al quran", "audio al quran", "dengarkan al quran", "murottal per surah", "qari al quran", "bacaan al quran merdu", "al quran audio terjemahan"];
const listenLong = ["murottal al quran 30 juz mp3", "murottal al quran full 30 juz online", "dengarkan murottal al quran online gratis", "murottal surah per ayat dengan terjemahan", "murottal al quran untuk menenangkan hati", "murottal al quran sebelum tidur", "qari al quran terbaik untuk belajar", "murottal untuk anak menghafal", "murottal al quran tanpa iklan", "murottal al quran per qari mp3", "cara memilih qari untuk menghafal"];
const learnShort = ["belajar al quran", "belajar al quran online", "belajar membaca al quran", "belajar al quran dari nol", "belajar ngaji online", "belajar al quran gratis", "belajar al quran untuk pemula", "belajar iqra online"];
const learnLong = ["cara belajar membaca al quran dari awal", "cara belajar al quran untuk orang dewasa", "belajar ngaji dari nol untuk dewasa", "belajar al quran online gratis tanpa daftar", "aplikasi belajar al quran gratis", "cara cepat belajar membaca al quran", "belajar al quran di rumah sendiri", "dari mana mulai belajar al quran", "berapa lama belajar membaca al quran"];

const kw: Record<string, KeywordSet> = {
  "": {
    focus: "belajar al quran online gratis",
    short: [...learnShort, "belajar tajwid", "hafalan al quran", "tafsir al quran", "al quran online", "baca al quran online", "aplikasi al quran", "murottal al quran", "jadwal shalat", "arah kiblat", "kalender hijriah", "asmaul husna", "doa harian"],
    long: ["situs belajar al quran gratis dalam bahasa indonesia", "aplikasi belajar al quran untuk iphone", "belajar membaca al quran dan menghafal sekaligus", "cara belajar al quran dengan tajwid dan arti", "belajar bahasa arab untuk memahami al quran", "belajar al quran untuk mualaf", "belajar shalat dan wudhu untuk pemula", "tempat belajar tafsir al quran online", "cara menghafal al quran dengan murajaah harian", "al quran digital dengan audio ayat per ayat", "belajar al quran dalam 14 bahasa", "jadwal shalat dan kiblat sesuai lokasi", "baca nahjul balaghah online", "belajar al quran tanpa guru bisa tidak"],
  },
  "/how": {
    focus: "cara belajar al quran bertahap",
    short: ["cara belajar al quran", "metode belajar al quran", "langkah belajar al quran", "belajar al quran step by step", "belajar membaca al quran", "metode menghafal al quran", "murajaah harian", "belajar al quran ayat per ayat", "memahami arti al quran", "belajar al quran online"],
    long: ["langkah langkah belajar al quran untuk pemula", "bagaimana cara belajar al quran dengan terjemahan per kata", "metode belajar al quran ayat demi ayat", "cara menghafal ayat dengan mendengarkan berulang", "cara membuat jadwal murajaah hafalan", "belajar al quran dari mendengar sampai menghafal", "cara memahami al quran tanpa menguasai bahasa arab", "urutan belajar membaca tajwid arti dan hafalan", "berapa menit sehari belajar al quran"],
  },
  "/app": {
    focus: "aplikasi belajar al quran iphone",
    short: ["aplikasi al quran iphone", "aplikasi quran ios", "aplikasi belajar al quran", "aplikasi murottal iphone", "aplikasi hafalan al quran", "aplikasi tajwid", "aplikasi jadwal shalat iphone", "al quran offline iphone", "aplikasi al quran gratis"],
    long: ["aplikasi belajar al quran gratis untuk iphone", "aplikasi al quran terbaik untuk ios", "aplikasi menghafal al quran dengan murajaah", "aplikasi al quran dengan audio per ayat", "aplikasi belajar tajwid untuk iphone", "aplikasi al quran satu akun dengan situs web", "aplikasi al quran terjemahan indonesia iphone", "unduh aplikasi quran masterclass", "aplikasi al quran tanpa iklan untuk iphone", "aplikasi jadwal shalat dan kiblat untuk ios", "aplikasi belajar ngaji untuk anak iphone"],
  },
  "/courses": {
    focus: "kursus al quran online",
    short: ["kursus al quran online", "kelas tahsin online", "kursus tajwid online", "kursus bahasa arab al quran", "kelas tahfidz online", "belajar tahsin", "kursus ngaji online", "pelajaran al quran", "kursus al quran gratis", "kelas ngaji dewasa"],
    long: ["kursus al quran online gratis untuk pemula", "kelas tahsin online untuk dewasa", "kursus tajwid dan tahsin dari nol", "kursus menghafal al quran online", "kursus bahasa arab untuk memahami al quran", "kelas ngaji online sesuai tempo sendiri", "kursus al quran terstruktur per pelajaran", "belajar tahsin tanpa guru bisa tidak", "kursus al quran online untuk mualaf", "kelas membaca al quran untuk ibu rumah tangga"],
  },
  "/tajweed": {
    focus: "hukum tajwid",
    short: ["hukum tajwid", "ilmu tajwid", "belajar tajwid", "tajwid dasar", "makharijul huruf", "hukum nun sukun", "hukum mim sukun", "qalqalah", "hukum mad", "idgham", "ikhfa", "izhar", "latihan tajwid", "tajwid untuk pemula"],
    long: ["hukum tajwid lengkap dengan contoh", "cara belajar tajwid untuk pemula", "hukum nun sukun dan tanwin beserta contoh", "huruf qalqalah dan cara membacanya", "macam macam mad dan cara membacanya", "makharijul huruf lengkap dan cara melafalkan", "hukum mim sukun idgham mimi ikhfa syafawi", "latihan tajwid online dengan contoh", "cara membaca izhar halqi dengan benar", "belajar tajwid tanpa daftar", "apa itu tajwid dan mengapa penting", "perbedaan idgham bighunnah dan bilaghunnah", "belajar tajwid dari nol untuk dewasa"],
  },
  "/arabic": {
    focus: "belajar bahasa arab untuk al quran",
    short: ["belajar bahasa arab", "belajar huruf hijaiyah", "huruf hijaiyah", "belajar membaca arab", "harakat bahasa arab", "huruf sambung arab", "bahasa arab al quran", "belajar baca arab gundul", "belajar iqra", "tulisan arab untuk pemula"],
    long: ["belajar membaca huruf arab dari nol untuk dewasa", "cara membaca huruf hijaiyah bersambung", "belajar harakat fathah kasrah dhammah", "belajar bahasa arab agar paham al quran", "cara cepat bisa membaca tulisan arab", "belajar membaca arab gundul untuk pemula", "huruf hijaiyah dan cara membacanya", "belajar bahasa arab gratis online", "latihan membaca huruf arab bersambung", "belajar bahasa arab al quran untuk mualaf", "apakah perlu bahasa arab untuk memahami al quran"],
  },
  "/academy": {
    focus: "akademi al quran online",
    short: ["akademi al quran online", "akademi tahfidz online", "akademi tajwid", "jalur belajar al quran", "belajar al quran terpandu", "kurikulum belajar al quran", "program belajar al quran", "madrasah online", "belajar al quran terstruktur"],
    long: ["akademi belajar al quran online gratis", "kurikulum belajar al quran untuk pemula", "jalur belajar al quran dari membaca sampai menghafal", "program belajar tajwid dan bahasa arab online", "belajar al quran terpandu tanpa biaya", "rencana belajar al quran selama setahun", "akademi tahsin dan tahfidz online", "belajar al quran terstruktur untuk dewasa pekerja", "madrasah online gratis untuk belajar al quran"],
  },
  "/blog": {
    focus: "tips belajar al quran",
    short: ["tips belajar al quran", "tips menghafal al quran", "artikel belajar al quran", "blog islami", "kebiasaan membaca al quran", "tips istiqamah membaca al quran", "tips memahami tafsir", "motivasi belajar al quran"],
    long: ["tips menghafal al quran bagi orang sibuk", "cara istiqamah membaca al quran setiap hari", "tips belajar tajwid agar cepat bisa", "cara menjaga hafalan al quran agar tidak lupa", "tips memahami tafsir al quran untuk awam", "rutinitas membaca al quran harian yang realistis", "cara mengatasi malas membaca al quran", "artikel cara belajar al quran untuk mualaf"],
  },
  "/guides": {
    focus: "panduan belajar al quran",
    short: ["panduan belajar al quran", "panduan menghafal al quran", "panduan tajwid", "panduan membaca al quran", "panduan juz amma", "belajar al quran untuk anak", "panduan memahami tafsir", "panduan kosakata al quran", "rutinitas harian al quran"],
    long: ["panduan lengkap belajar al quran untuk pemula", "panduan menghafal juz amma bertahap", "panduan belajar tajwid untuk pemula", "cara belajar membaca al quran untuk dewasa", "panduan mengajarkan al quran kepada anak", "panduan memahami tafsir al quran langkah demi langkah", "cara menyusun rutinitas al quran harian", "panduan belajar kosakata bahasa arab al quran", "panduan metode shams menghafal al quran"],
  },
  "/islam": {
    focus: "belajar islam untuk pemula",
    short: ["belajar islam", "belajar islam untuk pemula", "pengenalan islam", "rukun islam", "rukun iman", "islam untuk mualaf", "panduan mualaf", "ibadah dasar islam", "sejarah nabi muhammad", "mazhab dalam islam", "haji dan umrah", "puasa ramadan"],
    long: ["panduan belajar islam untuk mualaf baru", "apa saja yang harus dipelajari mualaf pertama kali", "penjelasan rukun islam dan rukun iman untuk pemula", "perbedaan sunni dan syiah secara netral", "perbedaan mazhab dalam islam untuk awam", "cara memulai belajar agama islam dari nol", "pengantar islam untuk yang baru tertarik", "tata cara shalat sunni dan syiah", "belajar islam online gratis dalam bahasa indonesia", "panduan ibadah haji untuk pemula", "tradisi hari raya idulfitri dan iduladha dijelaskan"],
  },
  "/quran": {
    focus: "baca al quran online",
    short: ["baca al quran online", "al quran online", "al quran digital", "al quran 114 surah", "daftar surah al quran", "al quran dan terjemahan", "al quran transliterasi latin", "al quran dengan audio", "al quran per ayat", "tafsir al quran", ...listenShort.slice(0, 4)],
    long: ["baca al quran online lengkap dengan terjemahan indonesia", "al quran online dengan tulisan latin dan arti", "al quran digital dengan audio ayat per ayat", "daftar 114 surah al quran beserta artinya", "baca al quran dengan tafsir di samping ayat", "al quran online yang bisa dihafalkan dengan jadwal murajaah", "al quran terjemahan per kata online", "membaca al quran online tanpa iklan", "surah pendek al quran dan artinya", "juz amma online dengan audio", "al quran 30 juz online", ...listenLong.slice(0, 3)],
  },
  "/reciters": {
    focus: "qari al quran",
    short: [...listenShort, "daftar qari", "qari terkenal", "qari internasional", "murottal syekh", "gaya bacaan al quran", "murottal per qari"],
    long: ["daftar qari al quran dan murottalnya", "qari al quran dengan suara paling merdu", "murottal qari terbaik untuk belajar tajwid", "qari yang cocok untuk menghafal al quran", "membandingkan gaya bacaan para qari", "murottal qari per surah online", "murottal qari untuk anak belajar menghafal", "cara memilih qari sesuai tujuan belajar", "dengarkan murottal ayat demi ayat per qari", "murottal mishary rashid alafasy", "qari dengan bacaan pelan untuk pemula"],
  },
  "/radio": {
    focus: "radio al quran online",
    short: ["radio al quran", "radio quran online", "radio murottal", "radio quran 24 jam", "radio islam online", "murottal 24 jam", "siaran al quran langsung", "radio quran live", "murottal non stop", "radio dakwah online"],
    long: ["radio al quran online 24 jam", "radio murottal non stop untuk menemani kerja", "radio quran live streaming gratis", "radio al quran untuk belajar mendengar", "radio murottal untuk tidur", "putar radio quran di latar belakang", "radio al quran dari berbagai qari", "radio quran online tanpa iklan", "radio murottal bacaan pelan untuk menghafal", "dengarkan radio quran lewat iphone"],
  },
  "/prayer": {
    focus: "jadwal shalat hari ini",
    short: ["jadwal shalat", "jadwal shalat hari ini", "waktu shalat", "jadwal sholat hari ini", "arah kiblat", "kiblat online", "waktu subuh", "waktu maghrib", "waktu dzuhur", "waktu ashar", "waktu isya", "jadwal imsakiyah", "jadwal shalat sesuai lokasi"],
    long: ["jadwal shalat hari ini sesuai lokasi saya", "jadwal sholat 5 waktu hari ini", "arah kiblat dari lokasi saya", "cara menentukan arah kiblat dengan ponsel", "jam berapa waktu shalat berikutnya", "waktu subuh hari ini di kota saya", "jadwal shalat dan kiblat di iphone", "jadwal shalat selama bepergian di luar negeri", "metode perhitungan waktu shalat yang dipakai", "jadwal shalat bulan ramadan", "kapan waktu maghrib hari ini"],
  },
  "/calendar": {
    focus: "kalender hijriah hari ini",
    short: ["kalender hijriah", "kalender islam", "tanggal hijriah hari ini", "konversi hijriah masehi", "hari besar islam", "kalender ramadan", "1 muharram", "idulfitri", "iduladha", "tahun baru hijriah", "bulan hijriah", "malam nisfu syaban"],
    long: ["tanggal hijriah hari ini berapa", "konversi tanggal masehi ke hijriah", "kalender hijriah lengkap dengan hari besar islam", "kapan 1 ramadan tahun ini", "kapan idulfitri dan iduladha tahun ini", "urutan nama bulan hijriah", "kapan tahun baru islam", "kalender islam dan peristiwa penting", "cara mengubah tanggal hijriah ke masehi", "hari besar islam sepanjang tahun"],
  },
  "/islam/names": {
    focus: "asmaul husna 99 nama allah",
    short: ["asmaul husna", "99 nama allah", "asmaul husna dan artinya", "asmaul husna latin", "asmaul husna audio", "hafalan asmaul husna", "nama nama allah", "arti asmaul husna", "asmaul husna lengkap", "asmaul husna untuk anak"],
    long: ["asmaul husna 99 nama allah lengkap dengan arti", "asmaul husna tulisan arab dan latin", "cara menghafal asmaul husna dengan mudah", "audio asmaul husna untuk dihafal", "arti dan makna asmaul husna ar rahman ar rahim", "hafalan asmaul husna beberapa nama setiap hari", "asmaul husna dan cara melafalkannya", "belajar asmaul husna bersama anak", "daftar 99 nama allah beserta pelafalan", "asmaul husna dan keutamaan mempelajarinya"],
  },
  "/duas": {
    focus: "doa harian dan artinya",
    short: ["doa harian", "kumpulan doa", "doa sehari hari", "doa dan artinya", "doa pagi", "doa sebelum makan", "doa sebelum tidur", "doa naik kendaraan", "doa masuk masjid", "doa keluar rumah", "doa latin", "doa pendek", "doa memohon ampun"],
    long: ["kumpulan doa harian lengkap arab latin dan artinya", "doa sehari hari untuk anak", "doa sebelum dan sesudah makan beserta artinya", "doa bangun tidur dan sebelum tidur", "doa keluar rumah dan masuk rumah", "doa untuk orang tua dan keluarga", "doa ketika sedang sulit atau cemas", "doa memohon ampun kepada allah", "doa naik kendaraan dan bepergian", "doa dalam tulisan arab latin dan terjemahan", "bagaimana cara berdoa yang baik"],
  },
  "/nahj": {
    focus: "nahjul balaghah online",
    short: ["nahjul balaghah", "nahj al balagha", "nahjul balaghah online", "nahjul balaghah bahasa indonesia", "khutbah imam ali", "surat imam ali", "kata mutiara imam ali", "buku syiah", "ali bin abi thalib", "sayyid radhi", "sumber syiah"],
    long: ["baca nahjul balaghah online bahasa indonesia", "nahjul balaghah lengkap khutbah surat dan hikmah", "terjemahan nahjul balaghah gratis", "kumpulan khutbah imam ali dalam nahjul balaghah", "siapa yang menyusun nahjul balaghah", "isi kitab nahjul balaghah dan pembagiannya", "nahjul balaghah per bagian untuk dipelajari", "kata hikmah imam ali dari nahjul balaghah", "belajar nahjul balaghah untuk pemula"],
  },
  "/shams": {
    focus: "metode menghafal al quran shams",
    short: ["metode shams", "metode menghafal al quran", "cara menghafal ayat", "hafalan al quran", "menghafal dari akhir ayat", "murajaah hafalan", "hafal dan paham al quran", "hafalan sambil memahami arti", "tafsir dan hafalan", "teknik menghafal"],
    long: ["metode menghafal al quran dengan memahami arti", "cara menghafal ayat dengan menyusun dari akhir", "metode shams untuk menghafal dan memahami al quran", "cara menghafal ayat mutasyabihat agar tidak tertukar", "menghafal al quran dengan petunjuk yang memudar", "cara menghafal satu ayat dengan mendengar berulang", "metode hafalan yang tidak hanya mengulang", "bagaimana merenungkan ayat setelah menghafal", "langkah menghafal satu ayat dari dengar sampai renungan", "adab menghafal al quran"],
  },
  "/salah": {
    focus: "tata cara shalat",
    short: ["tata cara shalat", "cara shalat", "belajar shalat", "bacaan shalat", "gerakan shalat", "urutan shalat", "shalat untuk pemula", "shalat lima waktu", "bacaan shalat lengkap", "rukun shalat", "shalat untuk mualaf"],
    long: ["tata cara shalat lengkap dari takbir sampai salam", "belajar shalat untuk mualaf langkah demi langkah", "bacaan dan gerakan shalat 5 waktu untuk pemula", "cara shalat subuh dua rakaat", "urutan gerakan shalat yang benar", "apa saja bacaan dalam shalat", "belajar shalat untuk anak", "cara shalat sesuai mazhab yang Anda ikuti", "bagaimana membiasakan shalat tepat waktu", "tata cara shalat sunni dan syiah"],
  },
  "/wudu": {
    focus: "cara wudhu yang benar",
    short: ["cara wudhu", "tata cara wudhu", "cara wudhu yang benar", "urutan wudhu", "rukun wudhu", "niat wudhu", "doa setelah wudhu", "wudhu untuk pemula", "yang membatalkan wudhu", "belajar wudhu", "fardhu wudhu"],
    long: ["cara berwudhu yang benar step by step", "urutan wudhu dari niat sampai selesai", "cara wudhu untuk mualaf", "kesalahan yang sering terjadi saat berwudhu", "cara wudhu sesuai mazhab yang Anda ikuti", "latihan wudhu interaktif online", "bagaimana mengajarkan wudhu kepada anak", "doa sesudah wudhu dan artinya", "apa saja yang membatalkan wudhu"],
  },
  "/khatm": {
    focus: "rencana khatam al quran",
    short: ["khatam al quran", "rencana khatam", "jadwal khatam al quran", "khatam quran ramadan", "target khatam", "tadarus al quran", "khataman bersama", "membaca al quran harian", "jadwal tadarus", "pelacak bacaan al quran"],
    long: ["jadwal khatam al quran dalam satu bulan", "rencana khatam al quran selama ramadan", "berapa halaman per hari agar khatam", "khatam al quran bersama keluarga", "cara khatam al quran dengan sibuk bekerja", "jadwal tadarus harian dan progres", "pelacak khatam al quran online", "khatam al quran dalam 30 hari", "khataman al quran bersama teman online", "cara istiqamah menyelesaikan bacaan al quran"],
  },
  "/vocab": {
    focus: "kosakata al quran",
    short: ["kosakata al quran", "kata yang sering muncul dalam al quran", "arti kata al quran", "bahasa arab al quran", "kosakata arab", "terjemahan per kata", "belajar kosakata arab", "kata kata al quran", "flashcard arab"],
    long: ["kosakata al quran yang paling sering muncul", "belajar arti kata dalam al quran", "cara memahami al quran lewat kosakata", "berapa kata arab yang perlu dikuasai untuk paham al quran", "belajar kosakata al quran dengan kartu ulasan", "kata kata arab umum dalam al quran dan artinya", "cara menghafal kosakata arab al quran", "kosakata al quran untuk pemula", "belajar arti al quran per kata"],
  },
  "/dua-generator": {
    focus: "pembuat doa pribadi",
    short: ["pembuat doa", "membuat doa sendiri", "doa pribadi", "susun doa", "doa dalam bahasa arab", "doa dengan terjemahan", "doa permohonan", "generator doa", "cara berdoa", "doa untuk hajat"],
    long: ["cara menyusun doa pribadi dalam bahasa arab", "pembuat doa online gratis dengan terjemahan", "bagaimana cara berdoa dengan kata kata sendiri", "doa pribadi dalam tulisan arab latin dan arti", "alat untuk membuat doa sesuai hajat", "contoh doa permohonan yang baik", "doa dengan adab berdoa yang benar"],
  },
  "/surah": {
    focus: "surah al quran dengan audio dan terjemahan",
    short: ["surah al quran", "surah dan artinya", "audio surah", "terjemahan surah", "tafsir surah", "hafalan surah", "surah pendek", "murottal surah", "daftar surah", "transliterasi surah", "surah ayat demi ayat"],
    long: ["surah al quran dengan audio ayat per ayat", "baca surah lengkap dengan latin dan terjemahan", "tafsir surah ayat per ayat", "cara menghafal surah pendek", "murottal surah tertentu dengan qari pilihan", "arti surah dan tafsir singkatnya", "surah yang cocok untuk dihafal pemula", "jadwal murajaah surah yang dihafal", "surah dan jumlah ayatnya"],
  },
  "/learn-quran": {
    focus: "cara belajar al quran dari nol",
    short: [...learnShort, "belajar baca al quran", "belajar tajwid", "belajar menghafal al quran", "belajar tafsir", "belajar bahasa arab al quran"],
    long: [...learnLong, "belajar al quran untuk mualaf", "cara belajar al quran sambil bekerja", "belajar al quran lewat aplikasi", "urutan belajar al quran: huruf, baca, tajwid, arti, hafalan", "belajar al quran dengan terjemahan per kata", "apakah belajar al quran online efektif", "belajar al quran untuk anak di rumah", "tips belajar al quran agar konsisten", "belajar al quran tanpa biaya"],
  },
  "/quran-tafsir": {
    focus: "tafsir al quran online",
    short: ["tafsir al quran", "tafsir online", "tafsir per ayat", "tafsir al quran bahasa indonesia", "tafsir surah", "tafsir ringkas", "arti ayat al quran", "memahami al quran", "tafsir dan terjemahan", "belajar tafsir", "tafsir sunni", "tafsir syiah"],
    long: ["tafsir al quran online per ayat bahasa indonesia", "cara memahami al quran dengan tafsir", "belajar tafsir al quran untuk pemula", "tafsir dan terjemahan per kata", "apa bedanya terjemahan dan tafsir", "tafsir ayat sesuai mazhab yang Anda ikuti", "tafsir surah pendek juz amma", "cara membaca tafsir agar tidak salah paham", "tafsir al quran gratis tanpa iklan", "tafsir singkat untuk awam", "bagaimana memahami makna ayat al quran sendiri"],
  },
  "/tajweed-online": {
    focus: "belajar tajwid online",
    short: ["belajar tajwid online", "kursus tajwid online", "tajwid dasar", "hukum tajwid lengkap", "latihan tajwid", "belajar makharijul huruf", "tajwid untuk pemula", "belajar tahsin online", "tajwid mad", "tajwid qalqalah", "tajwid nun sukun"],
    long: ["belajar tajwid online gratis dari dasar", "belajar tajwid untuk dewasa yang baru mulai", "cara memperbaiki bacaan al quran dengan tajwid", "tajwid untuk mualaf pemula", "latihan tajwid dengan contoh ayat", "urutan belajar tajwid yang tepat", "belajar tahsin online tanpa guru bisa tidak", "perbaiki makharijul huruf dengan latihan", "berapa lama belajar tajwid sampai lancar", "kesalahan umum dalam membaca al quran", "tajwid sebelum menghafal atau sesudahnya"],
  },
  "/memorize-quran": {
    focus: "cara menghafal al quran",
    short: ["cara menghafal al quran", "menghafal al quran", "hafalan al quran", "tahfidz online", "metode hafalan", "murajaah", "menghafal juz amma", "tips menghafal", "hafal al quran dewasa", "jadwal menghafal", "hifz", "menjaga hafalan"],
    long: ["cara menghafal al quran bagi orang dewasa yang sibuk", "metode menghafal al quran yang efektif", "jadwal murajaah hafalan harian", "cara menghafal juz amma untuk pemula", "bagaimana menjaga hafalan agar tidak lupa", "berapa ayat sehari sebaiknya dihafal", "menghafal al quran dengan memahami artinya", "tahfidz online untuk dewasa", "cara menghafal ayat yang mirip agar tidak tertukar", "pengulangan berjarak untuk murajaah hafalan", "apakah bisa menghafal al quran tanpa guru"],
  },
  "/quran-radio": {
    focus: "radio quran online",
    short: ["radio quran", "radio quran online", "radio al quran 24 jam", "murottal live", "siaran quran", "radio murottal", "murottal nonstop", "radio quran gratis", "streaming quran"],
    long: ["cara mendengarkan radio quran online", "radio quran untuk didengar di latar belakang", "manfaat mendengarkan radio quran saat bekerja", "radio quran atau murottal per surah mana yang lebih baik", "cara memilih qari untuk radio quran", "radio quran untuk belajar lafal dan tajwid", "radio quran live tanpa iklan", "radio murottal untuk menemani belajar", "bisakah radio quran dipakai untuk menghafal"],
  },
  "/listen-quran": {
    focus: "dengarkan al quran online",
    short: ["dengarkan al quran", "dengar al quran online", "murottal mp3", "al quran mp3", "murottal 30 juz", "al quran audio", "audio al quran per surah", "murottal ayat per ayat", "download murottal", "murottal merdu", "qari al quran", "al quran audio terjemahan indonesia"],
    long: [...listenLong, "cara mendengarkan al quran untuk belajar membaca", "dengarkan al quran ayat per ayat sambil membaca terjemahan", "murottal surah yasin dan al kahfi online", "audio al quran dengan teks yang menyala per ayat"],
  },
  "/tawbah": {
    focus: "cara taubat kepada allah",
    short: ["cara taubat", "taubat nasuha", "tobat", "doa taubat", "kembali kepada allah", "memohon ampun", "istighfar", "hijrah", "kembali shalat", "taubat dari dosa", "ingin berubah menjadi lebih baik"],
    long: ["bagaimana cara bertaubat kepada allah", "cara memulai taubat setelah lama meninggalkan shalat", "apakah allah menerima taubat saya", "langkah praktis untuk hijrah dan kembali ke agama", "cara kembali shalat setelah lama meninggalkan", "cara berhijrah pelan pelan tanpa merasa terbebani", "doa memohon ampun dan artinya", "saya merasa banyak dosa harus mulai dari mana", "cara memperbaiki diri dan mulai belajar agama lagi", "bagaimana belajar wudhu dan shalat lagi dari awal", "rasa bersalah dan ingin kembali kepada allah"],
  },
  "/learn-salah": {
    focus: "cara shalat untuk pemula",
    short: ["cara shalat untuk pemula", "belajar shalat dari nol", "tata cara shalat", "bacaan shalat", "gerakan shalat", "persiapan shalat", "shalat mualaf", "shalat 5 waktu", "rakaat shalat", "kebiasaan shalat", "bacaan shalat latin"],
    long: ["cara shalat untuk pemula langkah demi langkah", "bagaimana belajar shalat jika baru masuk islam", "apa yang harus disiapkan sebelum shalat", "berapa rakaat tiap shalat wajib", "bacaan shalat dalam tulisan latin dan arti", "cara membangun kebiasaan shalat lima waktu", "belajar shalat dengan jadwal shalat harian", "apa yang dibaca dalam rukuk dan sujud", "cara agar tidak lupa gerakan dan bacaan shalat", "belajar shalat dewasa yang belum pernah shalat", "tata cara shalat menurut mazhab yang Anda ikuti"],
  },
  "/learn-wudu": {
    focus: "cara wudhu step by step",
    short: ["cara wudhu step by step", "cara wudhu yang benar", "belajar wudhu", "urutan wudhu", "kesalahan wudhu", "wudhu pemula", "wudhu mualaf", "tata cara wudhu", "niat wudhu", "doa wudhu", "sunnah wudhu"],
    long: ["cara berwudhu dengan urutan yang benar untuk pemula", "kesalahan umum saat berwudhu dan cara menghindarinya", "bagaimana latihan wudhu supaya hafal urutannya", "berapa kali membasuh setiap anggota wudhu", "cara wudhu bagi mualaf baru", "wudhu menurut mazhab yang Anda ikuti", "apa saja yang membatalkan wudhu", "bagaimana mengajarkan anak berwudhu", "wudhu dengan air terbatas saat bepergian", "pelatih wudhu online interaktif"],
  },
  "/learn-islam": {
    focus: "belajar islam untuk pemula",
    short: ["belajar islam", "belajar islam untuk pemula", "mualaf", "masuk islam", "rukun islam", "rukun iman", "dasar agama islam", "islam untuk mualaf", "panduan mualaf", "ibadah dasar", "mengenal islam", "tertarik dengan islam"],
    long: ["apa yang perlu dipelajari pertama kali setelah masuk islam", "belajar islam dari nol untuk dewasa", "panduan mualaf pertama kali belajar shalat dan wudhu", "penjelasan rukun islam dan rukun iman sederhana", "bagaimana belajar islam secara bertahap tanpa kewalahan", "sunni dan syiah apa bedanya secara netral", "belajar islam gratis dalam bahasa indonesia", "cara membaca al quran bagi mualaf", "apa itu doa dan bagaimana berdoa", "ingin mengenal islam harus mulai dari mana", "belajar islam lewat aplikasi di iphone"],
  },
};


// Tambahan frasa panjang per rute (pencarian berbentuk pertanyaan)
const extra: Record<string, string[]> = {
  "": ["apakah ada situs belajar al quran gratis yang lengkap", "belajar al quran online tanpa biaya untuk dewasa", "cara belajar al quran lewat hp", "belajar al quran dan bahasa arab sekaligus", "situs islami untuk belajar ibadah dan al quran", "bagaimana cara mulai belajar al quran di rumah"],
  "/how": ["bagaimana urutan belajar al quran yang efektif", "apa itu murajaah dan bagaimana jadwalnya", "cara belajar al quran dengan audio dan terjemahan", "apakah belajar al quran online bisa sampai hafal", "berapa lama murajaah setiap hari", "cara belajar al quran sambil memahami tafsir", "apa yang berbeda dari belajar al quran biasa"],
  "/app": ["apakah ada aplikasi al quran gratis dengan akun yang sama di web", "aplikasi murajaah hafalan al quran ios", "aplikasi al quran dengan tajwid dan latihan", "aplikasi al quran 14 bahasa", "aplikasi al quran yang menyimpan kemajuan belajar", "aplikasi belajar shalat dan wudhu untuk iphone", "cara memasang aplikasi quran masterclass"],
  "/courses": ["kursus tajwid gratis untuk pemula", "kursus bahasa arab al quran gratis", "kelas tahsin online tanpa daftar", "kursus hafalan al quran dengan murajaah", "belajar al quran lewat pelajaran singkat", "kursus al quran untuk anak dan dewasa", "urutan kursus al quran yang disarankan"],
  "/tajweed": ["tajwid lengkap dan contohnya dalam al quran", "cara membaca idgham bighunnah dengan benar", "cara membaca ikhfa haqiqi", "mad thabii dan mad far'i penjelasan sederhana", "cara melafalkan huruf tebal dan tipis", "belajar tajwid melalui audio qari", "kesalahan tajwid yang paling sering terjadi", "apa itu hukum qalqalah sughra dan kubra"],
  "/arabic": ["cara membaca arab gundul tanpa harakat", "belajar membaca al quran dengan transliterasi latin", "huruf hijaiyah dan bunyinya audio", "cara membedakan huruf arab yang mirip", "belajar tulisan arab bersambung untuk dewasa", "berapa lama belajar membaca huruf arab", "latihan membaca arab setiap hari 10 menit", "cara membaca tanwin dan sukun"],
  "/academy": ["akademi al quran gratis dengan jalur belajar bertahap", "apa saja yang dipelajari di akademi al quran online", "belajar al quran sistematis dari huruf sampai hafalan", "akademi ngaji online untuk dewasa", "jalur belajar tajwid dan hafalan terpadu", "program belajar al quran tanpa jadwal kaku", "akademi islami online gratis bahasa indonesia", "bagaimana memilih program belajar al quran", "akademi al quran di aplikasi iphone"],
  "/blog": ["artikel tentang cara belajar al quran dari nol", "tips agar bacaan al quran makin lancar", "bagaimana membangun kebiasaan membaca al quran", "artikel hafalan al quran dan murajaah", "tulisan tentang memahami tafsir untuk pemula", "tips belajar tajwid secara mandiri", "kesalahan umum saat menghafal al quran", "blog belajar islam untuk mualaf"],
  "/guides": ["panduan belajar membaca al quran untuk dewasa", "panduan tajwid untuk pemula lengkap", "panduan menghafal juz amma dalam jadwal", "panduan al quran untuk anak anak", "bagaimana memahami tafsir dengan benar", "panduan rutinitas al quran harian", "panduan belajar kosakata arab al quran", "langkah menghafal al quran dengan metode shams"],
  "/islam": ["apa itu islam dalam penjelasan sederhana", "kehidupan sehari hari seorang muslim", "penjelasan puasa ramadan untuk pemula", "tata cara haji secara garis besar", "halal dan haram secara umum", "perbedaan mazhab fikih secara netral", "apa itu hari raya idulfitri dan iduladha", "siapa nabi muhammad secara ringkas", "bagaimana mulai belajar islam bagi mualaf"],
  "/quran": ["al quran online dengan 114 surah lengkap", "membaca al quran dengan terjemahan per ayat", "baca al quran dan dengarkan murottal", "al quran online yang mudah dibaca di hp", "surah apa saja dalam al quran", "al quran tulisan latin dan arti", "bagaimana menghafal surah dari halaman bacaan", "urutan surah dalam al quran", "baca surah yasin online", "baca ayat kursi online dengan arti"],
  "/reciters": ["siapa qari al quran yang bagus untuk pemula", "perbedaan gaya bacaan murattal dan mujawwad", "cara memilih qari agar mudah menghafal", "qari al quran dari berbagai negara", "dengarkan qari yang sama untuk satu surah penuh", "qari bacaan pelan untuk belajar tajwid", "murottal syekh dengan bacaan jelas", "cari qari favorit dan putar per ayat", "mishary alafasy murottal online"],
  "/radio": ["apakah ada radio al quran tanpa iklan", "radio al quran untuk menemani belajar", "radio quran bacaan merdu 24 jam gratis", "radio quran di web dan aplikasi iphone", "cara mendengarkan murottal terus menerus", "radio quran untuk anak sebelum tidur", "putar siaran quran sambil bekerja", "radio al quran dengan beberapa qari bergantian"],
  "/prayer": ["jadwal shalat hari ini untuk kota saya", "waktu shalat berdasarkan lokasi otomatis", "jadwal shalat dan arah kiblat online gratis", "cara kerja perhitungan waktu shalat", "kiblat dari lokasi saya sekarang", "jam shalat jumat hari ini", "waktu shalat dhuha dan tahajud", "jadwal shalat selama ramadan dan imsak"],
  "/calendar": ["tanggal hijriah hari ini dan besok", "konversi masehi ke hijriah online", "kapan awal ramadan tahun ini", "kalender islam bulan ini", "nama nama bulan dalam kalender hijriah", "peristiwa penting dalam kalender islam", "kapan puasa arafah dan asyura", "kapan malam lailatul qadar menurut kalender", "tanggal penting islam bulan muharram"],
  "/islam/names": ["arti asmaul husna satu per satu", "cara melafalkan asmaul husna dengan benar", "asmaul husna dan penjelasan maknanya", "belajar asmaul husna lewat audio", "asmaul husna untuk dihafal anak", "daftar 99 nama allah dengan transliterasi", "bagaimana mengamalkan asmaul husna sehari hari", "hafalan asmaul husna 3 nama per hari", "asmaul husna dalam tulisan arab"],
  "/duas": ["doa sehari hari lengkap tulisan arab dan latin", "doa untuk memulai pagi dan menutup hari", "doa ketika sakit dan sedih", "doa belajar dan sebelum ujian", "doa bepergian dan naik kendaraan", "doa untuk keluarga dan anak", "kumpulan doa pendek mudah dihafal", "doa ketika hujan dan angin", "doa bersin dan menguap"],
  "/nahj": ["nahjul balaghah dalam bahasa indonesia online", "isi nahjul balaghah khutbah surat dan hikmah", "nahjul balaghah syiah dan sunni membacanya", "pembaca nahjul balaghah per bagian", "kutipan hikmah imam ali beserta sumbernya", "pelajari nahjul balaghah pelan pelan", "nahjul balaghah di ponsel", "siapa penghimpun nahjul balaghah", "nahjul balaghah untuk pemula"],
  "/shams": ["bagaimana langkah metode shams dalam menghafal", "menghafal dari akhir ayat apa manfaatnya", "bagaimana menghafal ayat dengan memahami tafsirnya", "apa itu petunjuk yang memudar saat menghafal", "cara membedakan ayat yang mirip saat menghafal", "metode menghafal yang menggabungkan arti dan tafsir", "adab dan niat saat menghafal al quran", "cara merenungkan ayat yang baru dihafal", "metode hafalan gratis online"],
  "/salah": ["cara shalat dengan gambar langkah demi langkah", "bacaan shalat dan artinya lengkap", "bagaimana belajar shalat dalam seminggu", "bacaan rukuk sujud dan duduk di antara dua sujud", "apa yang dibaca pada tasyahud", "cara shalat berjamaah untuk pemula", "bagaimana belajar al fatihah dengan benar", "waktu waktu shalat lima waktu"],
  "/wudu": ["cara wudhu lengkap dengan gambar", "berapa kali membasuh anggota wudhu", "doa niat wudhu dan sesudahnya", "latihan wudhu untuk anak", "sunnah sunnah saat berwudhu", "cara wudhu di tempat umum atau bepergian", "kesalahan saat mengusap kepala dan membasuh kaki", "bagaimana wudhu menurut mazhab ahlulbait", "pelatih wudhu interaktif gratis"],
  "/khatm": ["bagaimana membagi bacaan al quran agar khatam", "khatam al quran dalam 60 hari", "jadwal khatam dengan 20 halaman per hari", "target harian khatam al quran selama ramadan", "membaca satu juz per hari", "cara mencatat progres bacaan al quran", "khatam bersama keluarga dengan jadwal", "doa khatam al quran", "bagaimana memulai kembali khatam setelah terhenti"],
  "/vocab": ["kata kata arab yang paling sering muncul dalam al quran", "belajar arti kata allah rabb dan ilah dalam al quran", "bagaimana memahami al quran dengan 100 kata", "kartu hafalan kosakata al quran", "kosakata al quran untuk anak", "terjemahan kata per kata al quran online", "arti kata kerja dalam al quran", "belajar kosakata al quran sebelum tafsir", "ulasan kosakata dengan jadwal berjarak"],
  "/dua-generator": ["cara membuat doa sendiri sesuai hajat", "doa pribadi dalam bahasa arab dengan arti", "bagaimana menyusun doa yang baik", "adab berdoa sebelum meminta", "pembuat doa online gratis bahasa indonesia", "doa untuk kesembuhan dan kemudahan", "doa untuk keluarga yang disusun sendiri", "bagaimana memohon dengan kata kata sendiri", "contoh susunan doa dengan puji dan shalawat"],
  "/surah": ["surah apa yang cocok dihafal pertama", "arti surah dan jumlah ayatnya", "dengarkan surah per ayat dengan terjemahan", "surah pendek dengan audio dan arti", "tafsir singkat satu surah", "murajaah surah pendek harian", "urutan surah berdasarkan juz", "bagaimana membaca surah panjang dengan tajwid", "audio surah pilih qari"],
  "/learn-quran": ["belajar al quran dari nol tanpa guru", "belajar al quran untuk ibu rumah tangga", "belajar al quran 10 menit sehari", "cara belajar al quran sendiri lewat internet", "urutan materi belajar al quran untuk pemula", "belajar al quran dan tajwid sekaligus", "bagaimana mengajarkan al quran kepada diri sendiri"],
  "/quran-tafsir": ["tafsir ayat per ayat dengan arti kata", "apa itu asbabun nuzul dan di mana membacanya", "bagaimana memahami ayat yang sulit", "tafsir untuk pemula yang mudah dipahami", "cara membaca tafsir sambil mendengar murottal", "perbedaan tafsir sunni dan syiah secara netral", "apakah tafsir dan terjemahan bisa dibaca bersamaan", "tafsir al fatihah ayat per ayat", "tafsir surah ikhlas dan an nas"],
  "/tajweed-online": ["belajar tajwid online lewat latihan interaktif", "kursus tajwid singkat untuk dewasa", "belajar tajwid lewat hp", "tajwid mad dan qalqalah penjelasan sederhana", "bagaimana mengecek bacaan tajwid sendiri", "belajar makharijul huruf lewat audio", "tajwid online gratis tanpa daftar", "apa saja materi dasar tajwid", "belajar tajwid sambil mendengar qari"],
  "/memorize-quran": ["cara menghafal al quran dalam setahun", "berapa lama menghafal juz amma", "cara menghafal quran tanpa lupa", "tahfidz untuk pekerja kantoran", "hafalan al quran dengan aplikasi iphone", "murajaah hafalan sebelum tidur", "tips menghafal ayat panjang", "bagaimana menghafal surah al baqarah bertahap", "teknik menghafal menggunakan audio berulang"],
  "/quran-radio": ["radio quran mana yang cocok untuk anak", "apa perbedaan radio quran dan murottal biasa", "radio quran bacaan jelas untuk belajar", "bagaimana cara memutar radio quran di hp", "radio quran sebagai latar belakang saat bekerja", "radio quran dengan beberapa qari", "apa manfaat mendengarkan radio quran", "radio quran untuk menenangkan suasana rumah", "radio quran untuk pemula"],
  "/listen-quran": ["di mana mendengarkan al quran dengan terjemahan", "murottal per ayat dengan teks bergerak", "dengarkan al quran sambil mengikuti teks", "murottal qari pilihan untuk satu surah", "dengarkan surah pendek berulang untuk menghafal", "mendengar al quran dengan audio berkualitas baik", "dengarkan al quran di iphone", "dengarkan al quran tanpa mengunduh"],
  "/tawbah": ["bagaimana memulai lagi setelah lama jauh dari agama", "doa memohon ampun dan taubat dalam bahasa indonesia", "bagaimana mengatasi rasa bersalah dan kembali ke allah", "cara belajar lagi shalat dan wudhu tanpa malu", "langkah awal taubat yang mudah dilakukan", "kebiasaan kecil untuk kembali dekat dengan allah", "cara memperbaiki hubungan dengan allah pelan pelan", "mengapa taubat penting dalam islam secara umum"],
  "/learn-salah": ["belajar shalat untuk anak di rumah", "bagaimana cara menghafal bacaan shalat", "cara shalat bagi yang baru belajar membaca", "urutan gerakan shalat dari berdiri sampai salam", "bagaimana shalat berjamaah pertama kali", "apa persiapan sebelum shalat", "bagaimana mengatur waktu shalat saat bekerja", "cara belajar shalat dengan jadwal harian"],
  "/learn-wudu": ["wudhu sebelum shalat apa yang perlu disiapkan", "bagaimana cara berlatih wudhu di rumah", "wudhu sunni dan syiah perbedaannya secara umum", "apakah boleh wudhu dengan air sedikit", "urutan wudhu yang sering terlupa", "tata cara wudhu bagi penyandang disabilitas", "kapan wudhu harus diulang", "belajar wudhu dengan pelatih langkah demi langkah"],
  "/learn-islam": ["apa yang dipelajari mualaf dalam bulan pertama", "bagaimana memahami islam secara bertahap", "pengantar islam untuk keluarga baru", "buku dan sumber belajar islam yang netral", "bagaimana menjelaskan islam secara sederhana", "tanya jawab seputar islam untuk pemula", "belajar islam lewat video dan audio", "bagaimana membangun rutinitas ibadah dasar", "bagaimana memilih guru agama yang cocok"],
};
for (const [k, v] of Object.entries(extra)) {
  const set = new Set([...kw[k].short, ...kw[k].long]);
  kw[k].long.push(...v.filter((x) => !set.has(x)));
}

export default kw;
