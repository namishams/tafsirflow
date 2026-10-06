import type { MapContent } from "../../mapContent";
const c: MapContent = {
  kicker: "Quran Masterclass · Shams Metodu",
  title: "Kur'an haritası",
  lead: "114 sure, 30 cüz, 6.236 ayet – ve neyin sağlam oturduğunu, neyin sallantıda olduğunu ve neyin sana zor geldiğini bir bakışta görürsün. Harita yalnızca büyüyen bir ilerleme çubuğu değildir. Hafızanın dürüst bir aynasıdır: tekrar ettiğinde yeşile döner, bir ayeti çok uzun süre kendi hâline bıraktığında solar.",
  ctaStart: "İlk ayetini Shams Metodu ile öğren",
  ctaToday: "Bugünkü görevlerine git",
  stats: [{ n: "114", l: "kutu olarak sure" }, { n: "30", l: "bir bakışta cüz" }, { n: "6.236", l: "ayet, her biri görünür" }],
  readTitle: "Haritanı nasıl okursun",
  readLead: "Her kutu bir suredir. Rengi, o surede şimdiye kadar öğrendiğin tüm ayetlerin ortalamasıdır. Bir sure yalnızca kısmen öğrenilmişse kutusu daha açık çizilir. Bir kutuya dokunduğunda sure ayet ayet açılır.",
  colors: [
    { key: "strong", t: "Yeşil – sağlam", d: "Bu ayetleri zamanında tekrar ettin, hafızan onları güvenle tutuyor.", todo: "Yapacak bir şey yok – platform onları solmadan hemen önce geri getirir." },
    { key: "mid", t: "Altın – sallantıda", d: "Son tekrarının üzerinden bir süre geçti. Ayetleri hâlâ biliyorsun ama artık zahmetsizce değil.", todo: "Bugün ya da yarın tekrar et. Ezber modunda bir tur genellikle yeterlidir." },
    { key: "weak", t: "Kırmızı – zor", d: "Ya uzun zamandır tekrar edilmedi ya da burada sık sık hata yaptın. Testlerdeki, derslerdeki ve tekrarlardaki hataların hepsi sayılır.", todo: "Önce bunlar: onları Shams Metodu ile aç, hafıza kancalarını ve sondan başa kurmayı kullan." },
    { key: "none", t: "Gri – henüz öğrenilmedi", d: "Önünde hâlâ bir yol var. Gri bir eksiklik değil, bir davettir.", todo: "Planın öyle diyorsa: sıradaki olarak öğren. Kur'an'ın sonundaki kısa sureler iyi bir başlangıçtır." },
  ],
  howTitle: "Harita neyi bildiğini nasıl bilir",
  howBody: "Öğrenilen her ayetin arkasında küçük bir hafıza modeli vardır. Ayeti en son **ne zaman** tekrar ettiğini, **hangi aralıkla** geri gelmesi gerektiğini ve onda **ne sıklıkla** hata yaptığını hatırlar.\n\n- **Aralık:** İlk öğrenmeden sonra bir ayet ertesi gün geri gelir, ardından üç gün, bir hafta, iki hafta, bir ay ve daha uzun süre sonra. Her başarılı tekrar aralığı uzatır.\n- **Solma:** Bir ayet aralığını ne kadar aşarsa tahmini gücü o kadar düşer – yeşil altına, altın kırmızıya döner. Tıpkı gerçek hafızada olduğu gibi.\n- **Kolaylık:** Kolay gelen ayetler daha uzun aralıklar alır. Hata yaptığın ayetler daha sık geri gelir. Her hata kolaylığı düşürür ve ayrıca haritada bir ceza puanı olarak sayılır.\n- **Senkronize:** Hesabınla harita her cihazda aynıdır – telefonunda öğren, dizüstü bilgisayarında gör.\n\nHarita bir tahmindir, bir hüküm değil. Bir ayetin gerçekten oturup oturmadığını sonunda yalnızca onu okumak gösterir – en iyisi seni düzeltebilecek birinin önünde.",
  useTitle: "Haritayla ne yaparsın",
  uses: [
    { t: "Sabahları: önce kırmızı", d: "Yeni bir şey öğrenmeden önce kırmızı kutuları geri getir. Beş dakikalık tekrar, yirmi dakikalık yeniden öğrenmeden daha fazlasını kurtarır." },
    { t: "Namazdan önce", d: "Altın renkle işaretli kısa sureler namaz için idealdir: onları okumak, onları tekrar etmektir – ve harita daha da yeşillenir." },
    { t: "Hocanla birlikte", d: "Haritayı hocana ya da anne babana göster. Birkaç saniyede seni nerede dinlemeleri gerektiğini görürler." },
    { t: "Ramazan için", d: "Ramazan'a kadar bir cüzü sağlam bilmek mi istiyorsun? Cüz görünümüne geç ve kırmızıdan yeşile doğru çalış." },
  ],
  viewsTitle: "Üç seviye, tek bir resim",
  views: [
    { t: "Sureler", d: "114 kutu – uzun Bakara'dan kısa Nâs'a kadar. Kur'an'ının tamamına en hızlı genel bakış." },
    { t: "Cüzler", d: "30 bölüm için 30 kutu. Cüz üzerinden düşünen hafızlık planları ve hatim planlaması için ideal." },
    { t: "Ayetler", d: "Bir sureye dokun: her ayet kendi kutusu olur. Tek bir dokunuş onu tekrar ya da yeni öğrenme için açar." },
  ],
  faqTitle: "Harita hakkında sorular",
  faq: [
    { q: "Hiçbir şeyi yanlış yapmadığım hâlde yeşil bir kutu neden altına dönüyor?", a: "Çünkü hafıza tekrar olmadan solar. Harita bir zamanlar ne öğrendiğini değil, bugün muhtemelen hâlâ neyi sağlam bildiğini gösterir. Bir tekrar onu yeniden yeşil yapar – ve bir sonraki aralık uzar." },
    { q: "Bir örnek harita görüyorum – bu benim ilerlemem mi?", a: "Hayır. Giriş yapmadığın ya da henüz bir ayet öğrenmediğin sürece, nasıl görüneceğini görebilmen için açıkça işaretlenmiş bir örnek gösteriyoruz. İlk ayetini öğrenir öğrenmez kendi haritan görünür." },
    { q: "Sadece dinlemek sayılır mı?", a: "Dinlemek Shams Metodu'nun ilk adımıdır, ancak bir ayet haritada ancak onu öğrenip hatırladığında görünür – Shams koçunda, bir derste, bir testte veya tekrar modunda." },
    { q: "Sureyi zaten ezbere biliyorsam ne olacak?", a: "Onu ezber modunda aç, her ayeti ezberden oku ve “Kolay” olarak değerlendir. Hemen haritada görünür, takvimde öne atlar ve sağlam kalması için uzun aralıklarla geri gelir." },
    { q: "Başkaları haritamı görebilir mi?", a: "Hayır. Haritan sana aittir. Hesabınla şifreli olarak aktarılır ve hiçbir zaman herkese açık gösterilmez." },
  ],
  finalTitle: "Her yeşil kutu, kalbindeki Kur'an'dan bir parçadır.",
  finalLead: "Bugün tek bir ayetle başla. Yarın onu haritanda göreceksin – ve bir yıl sonra koca bir manzara.",
};
export default c;
