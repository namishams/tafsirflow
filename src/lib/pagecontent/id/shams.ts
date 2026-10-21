import type { ShamsPart } from "../../shamsContent";
// Indonesian: the parts of the Shams Method shown on the app's Shams tab and the core of /shams; the rest falls back
// to English (see shamsContent.ts). No Quran or hadith text is typed here.
const c: ShamsPart = {
  heroKicker: "Quran Masterclass · metode belajar",
  heroTitle: "Metode Shams",
  heroLead: "Cara mempelajari Al-Qur'an agar melekat: setiap ayat didengarkan, diucapkan, dipahami, dijelaskan, diingat kembali dari hafalan, dan dihubungkan dengan hidup Anda – dalam tujuh langkah dan sekitar empat menit. Apa yang diketahui riset pembelajaran bahasa dan ingatan tentang mengingat, dipadukan dengan cara para guru Al-Qur'an mengajar selama berabad-abad.",
  heroBy: "Dikembangkan oleh Nami Shams di Dubai",
  heroFacts: [
    { n: "7", l: "langkah untuk setiap ayat" },
    { n: "≈ 4", l: "menit untuk satu ayat baru" },
    { n: "6", l: "murajaah terencana dalam tiga bulan" },
  ],
  stepsTitle: "Tujuh langkah secara rinci",
  stepsLead: "Setiap langkah punya satu tugas yang jelas. Semuanya memakan sekitar empat menit per ayat. Platform memandu Anda melalui setiap langkah – Anda tidak perlu menyiapkan apa pun.",
  labels: { what: "Yang Anda lakukan", why: "Mengapa ini berhasil", platform: "Yang dilakukan platform untuk Anda", time: "Durasi" },
  steps: [
    { what: "Anda mendengarkan ayat tiga kali berturut-turut sambil mengikuti teks Arabnya. Belum ada terjemahan, belum menirukan – hanya mendengar dan melihat.", time: "sekitar 45 detik" },
    { what: "Ayat disusun dari belakang: mula-mula hanya kata terakhir, lalu dua kata terakhir, lalu tiga kata terakhir – sampai seluruh ayat. Setiap kali Anda ikut mengucapkannya.", time: "sekitar 60 detik" },
    { what: "Anda menelusuri ayat kata per kata: kata Arab, transliterasi, makna.", time: "sekitar 30 detik" },
    { what: "Anda membaca terjemahan seluruh ayat dan memakai pengait ingatan: kata kunci, rima di akhir ayat, jembatan ke ayat berikutnya – dan bila mau, menulis pengingat Anda sendiri.", time: "sekitar 40 detik" },
    { what: "Anda membaca penjelasan klasik: konteks, sebab turunnya ayat, dan apa yang diajarkan para ulama tentangnya.", time: "sekitar 45 detik" },
    { what: "Kata-kata menghilang bertahap: mula-mula Anda hanya melihat huruf pertama setiap kata, lalu tidak ada sama sekali. Anda membaca dari hafalan, membuka teks, dan menilai diri dengan jujur.", time: "sekitar 40 detik" },
    { what: "Anda menulis satu atau dua kalimat: Apa yang dikatakan ayat ini kepada saya tentang Allah? Tentang diri saya? Apa yang saya bawa darinya hari ini?", time: "sekitar 30 detik" },
  ],
  demoTitle: "Satu ayat, empat tahap",
  demoStages: ["Seluruh ayat", "Susun dari belakang", "Hanya huruf pertama", "Dari hafalan"],
  finalTitle: "Ayat pertama Anda hanya butuh empat menit",
  finalLead: "Mulailah dengan Al-Fatihah. Platform memandu Anda di setiap langkah.",
  finalPoints: ["Tidak ada yang perlu disiapkan – platform memandu Anda di setiap langkah.", "Transliterasi dan makna muncul di bawah setiap kata.", "Setelah itu, model ingatan merencanakan murajaah Anda."],
  whyCloseApp: "Itulah sebabnya Metode Shams ada: agar tidak seorang pun harus menunda pembelajaran terpenting dalam hidupnya.",
};
export default c;
