import type { ShamsPart } from "../../shamsContent";
// Malay: the parts of the Shams Method shown on the app's Shams tab and the core of /shams; the rest falls back to
// English (see shamsContent.ts). No Quran or hadith text is typed here.
const c: ShamsPart = {
  heroKicker: "Quran Masterclass · kaedah pembelajaran",
  heroTitle: "Kaedah Shams",
  heroLead: "Satu cara mempelajari al-Quran supaya ia kekal dalam ingatan: setiap ayat didengar, dilafazkan, difahami, dijelaskan, diingat semula daripada hafalan dan dikaitkan dengan kehidupan anda – dalam tujuh langkah dan kira-kira empat minit. Apa yang diketahui oleh kajian pembelajaran bahasa dan ingatan tentang mengingat, digabungkan dengan cara guru-guru al-Quran mengajar sejak berabad-abad lamanya.",
  heroBy: "Dibangunkan oleh Nami Shams di Dubai",
  heroFacts: [
    { n: "7", l: "langkah untuk setiap ayat" },
    { n: "≈ 4", l: "minit untuk satu ayat baharu" },
    { n: "6", l: "ulang kaji terancang dalam tiga bulan" },
  ],
  stepsTitle: "Tujuh langkah secara terperinci",
  stepsLead: "Setiap langkah ada satu tugas yang jelas. Kesemuanya mengambil kira-kira empat minit bagi setiap ayat. Platform membimbing anda melalui setiap langkah – anda tidak perlu menyediakan apa-apa.",
  labels: { what: "Apa yang anda lakukan", why: "Mengapa ia berkesan", platform: "Apa yang platform lakukan untuk anda", time: "Tempoh" },
  steps: [
    { what: "Anda mendengar ayat tiga kali berturut-turut sambil mengikuti teks Arabnya. Belum ada terjemahan, belum mengulang dengan suara – hanya mendengar dan melihat.", time: "kira-kira 45 saat" },
    { what: "Ayat dibina dari hujung: mula-mula hanya perkataan terakhir, kemudian dua perkataan terakhir, kemudian tiga – hingga seluruh ayat. Setiap kali anda turut melafazkannya.", time: "kira-kira 60 saat" },
    { what: "Anda meneliti ayat perkataan demi perkataan: perkataan Arab, transliterasi, makna.", time: "kira-kira 30 saat" },
    { what: "Anda membaca terjemahan seluruh ayat dan menggunakan pengait ingatan: kata kunci, rima di hujung ayat, jambatan ke ayat seterusnya – dan jika mahu, menulis pengingat anda sendiri.", time: "kira-kira 40 saat" },
    { what: "Anda membaca huraian klasik: konteks, sebab turunnya ayat dan apa yang diajarkan oleh para ulama tentangnya.", time: "kira-kira 45 saat" },
    { what: "Perkataan hilang secara berperingkat: mula-mula anda hanya melihat huruf pertama setiap perkataan, kemudian tiada apa-apa. Anda membaca daripada hafalan, membuka teks dan menilai diri dengan jujur.", time: "kira-kira 40 saat" },
    { what: "Anda menulis satu atau dua kalimat: Apakah yang ayat ini katakan kepada saya tentang Allah? Tentang diri saya? Apakah yang saya bawa daripadanya hari ini?", time: "kira-kira 30 saat" },
  ],
  demoTitle: "Satu ayat, empat peringkat",
  demoStages: ["Seluruh ayat", "Bina dari hujung", "Huruf pertama sahaja", "Daripada hafalan"],
  finalTitle: "Ayat pertama anda mengambil empat minit",
  finalLead: "Mulakan dengan Al-Fatihah. Platform membimbing anda pada setiap langkah.",
  finalPoints: ["Tiada apa-apa untuk disediakan – platform membimbing anda pada setiap langkah.", "Transliterasi dan makna dipaparkan di bawah setiap perkataan.", "Selepas itu, model ingatan merancang ulang kaji anda."],
  whyCloseApp: "Itulah sebabnya Kaedah Shams wujud: supaya tiada sesiapa perlu menangguhkan pembelajaran yang paling penting dalam hidupnya.",
};
export default c;
