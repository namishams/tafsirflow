import type { ShamsPart } from "../../shamsContent";
// Turkish: the parts of the Shams Method shown on the app's Shams tab and the core of /shams; the rest falls back to
// English (see shamsContent.ts). No Quran or hadith text is typed here.
const c: ShamsPart = {
  heroKicker: "Quran Masterclass · öğrenme metodu",
  heroTitle: "Shams Metodu",
  heroLead: "Kur'an'ı kalıcı biçimde öğrenmenin bir yolu: Her ayet dinlenir, okunur, anlaşılır, açıklanır, hafızadan hatırlanır ve hayatınızla bağlantılandırılır – yedi adımda ve yaklaşık dört dakikada. Dil öğrenimi ve hafıza araştırmalarının akılda tutma hakkında bildikleri, Kur'an hocalarının yüzyıllardır öğrettiği yolla birleşir.",
  heroBy: "Nami Shams tarafından Dubai'de geliştirildi",
  heroFacts: [
    { n: "7", l: "her ayet için adım" },
    { n: "≈ 4", l: "yeni bir ayet için dakika" },
    { n: "6", l: "üç ayda planlı tekrar" },
  ],
  stepsTitle: "Yedi adım ayrıntılı olarak",
  stepsLead: "Her adımın açık bir görevi vardır. Hepsi birlikte ayet başına yaklaşık dört dakika sürer. Platform sizi her birinde yönlendirir – hiçbir hazırlık yapmanız gerekmez.",
  labels: { what: "Ne yaparsınız", why: "Neden işe yarar", platform: "Platform sizin için ne yapar", time: "Süre" },
  steps: [
    { what: "Ayeti arka arkaya üç kez dinler ve Arapça metni takip edersiniz. Henüz çeviri yok, sesli tekrar yok – sadece dinlemek ve bakmak.", time: "yaklaşık 45 saniye" },
    { what: "Ayet sondan başa doğru kurulur: önce yalnızca son kelime, sonra son iki, sonra son üç kelime – ayetin tamamına kadar. Her seferinde siz de birlikte okursunuz.", time: "yaklaşık 60 saniye" },
    { what: "Ayeti kelime kelime gözden geçirirsiniz: Arapça kelime, okunuşu, anlamı.", time: "yaklaşık 30 saniye" },
    { what: "Ayetin tamamının çevirisini okur ve hafıza kancalarını kullanırsınız: anahtar kelime, ayet sonundaki kafiye, bir sonraki ayete geçiş – dilerseniz kendi hatırlatıcınızı da yazarsınız.", time: "yaklaşık 40 saniye" },
    { what: "Klasik açıklamayı okursunuz: bağlam, nüzul sebebi ve âlimlerin bu konudaki öğretisi.", time: "yaklaşık 45 saniye" },
    { what: "Kelimeler aşama aşama kaybolur: önce her kelimenin yalnızca ilk harfini görürsünüz, sonra hiçbir şey. Ezberden okur, metni açar ve kendinizi dürüstçe değerlendirirsiniz.", time: "yaklaşık 40 saniye" },
    { what: "Bir iki cümle yazarsınız: Bu ayet bana Allah hakkında ne söylüyor? Kendim hakkında? Bugün ondan yanıma ne alıyorum?", time: "yaklaşık 30 saniye" },
  ],
  demoTitle: "Bir ayet, dört aşama",
  demoStages: ["Ayetin tamamı", "Sondan başa kurmak", "Yalnızca ilk harfler", "Ezberden"],
  finalTitle: "İlk ayetiniz dört dakika sürer",
  finalLead: "Fâtiha ile başlayın. Platform sizi her adımda yönlendirir.",
  finalPoints: ["Hazırlık gerekmez – platform sizi her adımda yönlendirir.", "Okunuş ve anlam her kelimenin altında görünür.", "Ardından hafıza modeli tekrarlarınızı planlar."],
  whyCloseApp: "Shams Metodu bu yüzden var: kimse hayatının en önemli öğrenimini ertelemek zorunda kalmasın diye.",
};
export default c;
