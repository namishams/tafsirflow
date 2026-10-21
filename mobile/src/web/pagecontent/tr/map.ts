import type { MapContent } from "../../mapContent";
const c: MapContent = {
  kicker: "Quran Masterclass · Shams Metodu",
  title: "Kur'an haritası",
  lead: "114 sure, 30 cüz, 6.236 ayet – ve neyin sağlam oturduğunu, neyin sallantıda olduğunu ve neyin size zor geldiğini bir bakışta görürsünüz. Harita yalnızca büyüyen bir ilerleme çubuğu değildir. Hafızanızın dürüst bir aynasıdır: tekrar ettiğinizde yeşile döner, bir ayeti çok uzun süre kendi hâline bıraktığınızda solar.",
  ctaStart: "İlk ayetinizi Shams Metodu ile öğrenin",
  ctaToday: "Bugünkü görevlerinize gidin",
  stats: [{ n: "114", l: "kutu olarak sure" }, { n: "30", l: "bir bakışta cüz" }, { n: "6.236", l: "ayet, her biri görünür" }],
  readTitle: "Haritanızı nasıl okursunuz",
  readLead: "Her kutu bir suredir. Rengi, o surede şimdiye kadar öğrendiğiniz tüm ayetlerin ortalamasıdır. Bir sure yalnızca kısmen öğrenilmişse kutusu daha açık çizilir. Bir kutuya dokunduğunuzda sure ayet ayet açılır.",
  colors: [
    { key: "strong", t: "Yeşil – sağlam", d: "Bu ayetleri zamanında tekrar ettiniz, hafızanız onları güvenle tutuyor.", todo: "Yapacak bir şey yok – platform onları solmadan hemen önce geri getirir." },
    { key: "mid", t: "Altın – sallantıda", d: "Son tekrarınızın üzerinden bir süre geçti. Ayetleri hâlâ biliyorsunuz ama artık zahmetsizce değil.", todo: "Bugün ya da yarın tekrar edin. Ezber modunda bir tur genellikle yeterlidir." },
    { key: "weak", t: "Kırmızı – zor", d: "Ya uzun zamandır tekrar edilmedi ya da burada sık sık hata yaptınız. Testlerdeki, derslerdeki ve tekrarlardaki hataların hepsi sayılır.", todo: "Önce bunlar: onları Shams Metodu ile açın, hafıza kancalarını ve sondan başa kurmayı kullanın." },
    { key: "none", t: "Gri – henüz öğrenilmedi", d: "Önünüzde hâlâ bir yol var. Gri bir eksiklik değil, bir davettir.", todo: "Planınız öyle diyorsa: sıradaki olarak öğrenin. Kur'an'ın sonundaki kısa sureler iyi bir başlangıçtır." },
  ],
  howTitle: "Harita neyi bildiğinizi nasıl bilir",
  howBody: "Öğrenilen her ayetin arkasında küçük bir hafıza modeli vardır. Ayeti en son **ne zaman** tekrar ettiğinizi, **hangi aralıkla** geri gelmesi gerektiğini ve onda **ne sıklıkla** hata yaptığınızı hatırlar.\n\n- **Aralık:** İlk öğrenmeden sonra bir ayet ertesi gün geri gelir, ardından üç gün, bir hafta, iki hafta, bir ay ve daha uzun süre sonra. Her başarılı tekrar aralığı uzatır.\n- **Solma:** Bir ayet aralığını ne kadar aşarsa tahmini gücü o kadar düşer – yeşil altına, altın kırmızıya döner. Tıpkı gerçek hafızada olduğu gibi.\n- **Kolaylık:** Kolay gelen ayetler daha uzun aralıklar alır. Hata yaptığınız ayetler daha sık geri gelir. Her hata kolaylığı düşürür ve ayrıca haritada bir ceza puanı olarak sayılır.\n- **Senkronize:** Hesabınızla harita her cihazda aynıdır – telefonunuzda öğrenin, dizüstü bilgisayarınızda görün.\n\nHarita bir tahmindir, bir hüküm değil. Bir ayetin gerçekten oturup oturmadığını sonunda yalnızca onu okumak gösterir – en iyisi sizi düzeltebilecek birinin önünde.",
  useTitle: "Haritayla ne yaparsınız",
  uses: [
    { t: "Sabahları: önce kırmızı", d: "Yeni bir şey öğrenmeden önce kırmızı kutuları geri getirin. Beş dakikalık tekrar, yirmi dakikalık yeniden öğrenmeden daha fazlasını kurtarır." },
    { t: "Namazdan önce", d: "Altın renkle işaretli kısa sureler namaz için idealdir: onları okumak, onları tekrar etmektir – ve harita daha da yeşillenir." },
    { t: "Hocanızla birlikte", d: "Haritayı hocanıza ya da anne babanıza gösterin. Birkaç saniyede sizi nerede dinlemeleri gerektiğini görürler." },
    { t: "Ramazan için", d: "Ramazan'a kadar bir cüzü sağlam bilmek mi istiyorsunuz? Cüz görünümüne geçin ve kırmızıdan yeşile doğru çalışın." },
  ],
  viewsTitle: "Üç seviye, tek bir resim",
  views: [
    { t: "Sureler", d: "114 kutu – uzun Bakara'dan kısa Nâs'a kadar. Kur'an'ınızın tamamına en hızlı genel bakış." },
    { t: "Cüzler", d: "30 bölüm için 30 kutu. Cüz üzerinden düşünen hafızlık planları ve hatim planlaması için ideal." },
    { t: "Ayetler", d: "Bir sureye dokunun: her ayet kendi kutusu olur. Tek bir dokunuş onu tekrar ya da yeni öğrenme için açar." },
  ],
  faqTitle: "Harita hakkında sorular",
  faq: [
    { q: "Hiçbir şeyi yanlış yapmadığım hâlde yeşil bir kutu neden altına dönüyor?", a: "Çünkü hafıza tekrar olmadan solar. Harita bir zamanlar ne öğrendiğinizi değil, bugün muhtemelen hâlâ neyi sağlam bildiğinizi gösterir. Bir tekrar onu yeniden yeşil yapar – ve bir sonraki aralık uzar." },
    { q: "Bir örnek harita görüyorum – bu benim ilerlemem mi?", a: "Hayır. Giriş yapmadığınız ya da henüz bir ayet öğrenmediğiniz sürece, nasıl görüneceğini görebilmeniz için açıkça işaretlenmiş bir örnek gösteriyoruz. İlk ayetinizi öğrenir öğrenmez kendi haritanız görünür." },
    { q: "Sadece dinlemek sayılır mı?", a: "Dinlemek Shams Metodu'nun ilk adımıdır, ancak bir ayet haritada ancak onu öğrenip hatırladığınızda görünür – Shams koçunda, bir derste, bir testte veya tekrar modunda." },
    { q: "Sureyi zaten ezbere biliyorsam ne olacak?", a: "Onu ezber modunda açın, her ayeti ezberden okuyun ve “Kolay” olarak değerlendirin. Hemen haritada görünür, takvimde öne atlar ve sağlam kalması için uzun aralıklarla geri gelir." },
    { q: "Başkaları haritamı görebilir mi?", a: "Hayır. Haritanız size aittir. Hesabınızla şifreli olarak aktarılır ve hiçbir zaman herkese açık gösterilmez." },
  ],
  finalTitle: "Her yeşil kutu, kalbinizdeki Kur'an'dan bir parçadır.",
  finalLead: "Bugün tek bir ayetle başlayın. Yarın onu haritanızda göreceksiniz – ve bir yıl sonra koca bir manzara.",
};
export default c;
