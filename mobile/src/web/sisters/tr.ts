// Turkish translation of en.ts ("Kız kardeşler için", polite "siz" address).
import type { SistersText } from "./types";

const tr: SistersText = {
  kicker: "Kız kardeşler için",
  title: "Öğrenmeniz her gün devam eder",
  lead: "Hayız (ḥayḍ) ve doğum sonrası (nifās) dönemlerinde tilavet açısından neyin değiştiği, Shams Metodu'nun nasıl devam ettiği ve Kur'an'ı nakleden ve öğreten kadınlar. Öğrenme hiç durmaz; bazı mezheplere göre yalnızca şekli değişir.",
  reviewLine: "İçerik âlimler tarafından inceleniyor",
  notFatwa: "Bu bir genel bakıştır, fetva değildir. Lütfen güvendiğiniz bir âlime, özellikle kendi mezhebinizden bir âlime danışın.",
  sourcesTitle: "Kaynaklar",
  schools: { hanafi: "Hanefî", maliki: "Mâlikî", shafii: "Şâfiî", hanbali: "Hanbelî", jafari: "Caferî (Şia)", majority: "Âlimlerin çoğunluğu", contemporary: "Günümüz fetva kurumları" },
  open: "Aç",
  readVerse: "Kur'an'da okuyun ve dinleyin",
  entryTitle: "Kız kardeşler için",
  entryLead: "Hayız döneminde tilavet, Shams Metodu'nda dinleme ve anlama günleri ve Kur'an'ı aktaran kadınlar.",
  entryCta: "Görüntüle",

  partRecite: {
    title: "Tilavet, hıfz ve Mushaf",
    lead: "Mezhepler en çok ezberden okuma konusunda ayrılır. Dinlemek, zikir ve dua burada belirtilen bütün kaynaklara göre caizdir.",
    blocks: [
      {
        id: "memory",
        title: "Ezberden okumak",
        positions: [
          { school: "hanafi", text: "Tilavet niyetiyle caiz değildir, bir ayetten az olsa bile. Caiz olanlar: dua, zikir veya korunma niyetiyle söylenen ayetler ve telaffuz etmeden gözle okumak. Kadın hoca kelime kelime, aralar vererek öğretebilir; çünkü bu tilavet sayılmaz.", src: ["arij", "sgHanafi"] },
          { school: "maliki", text: "Kanama devam ettiği sürece hayızlı bir kadın – Dar al-Ifta'ya göre nifaslı kadın da – unutmaktan korksun ya da korkmasın ezberden okuyabilir. Kanama kesildikten sonra, ancak gusülden önce, yalnızca unutmaktan korkarsa okuyabilir.", src: ["ifta12343"] },
          { school: "shafii", text: "Tek bir ayet bile caiz değildir. Zikir olarak söylenen Kur'an ifadeleri caizdir.", src: ["sgShafii"] },
          { school: "hanbali", text: "Mezhebin görüşü yasaktır. İbn Teymiyye okumayı caiz görmüştür; unutmaktan korktuğunda nifas halinde de.", src: ["muftiwp18", "iqa2564"] },
          { school: "jafari", text: "Ayetullah es-Sistani'ye göre yalnızca dört secde ayeti haramdır (32:15, 41:37, 53:62, 96:19) – surenin tamamı değil, ayetin kendisi. Diğer ayetler sayılan yasaklar arasında değildir. Nifas için aynısı vacip ihtiyat olarak geçerlidir.", src: ["sistani354", "sistani448", "sistani502"] },
          { school: "contemporary", text: "Malezya Federal Bölgeleri Müftüsü, hıfz okullarında da dahil olmak üzere ezberi tekrar etmeyi caiz görür. islamqa.info caiz gören görüşü daha güçlü delillendirilmiş kabul eder ve ihtiyatla yalnızca unutulmasından korkulan kısmın okunmasını tavsiye eder.", src: ["muftiwp18", "iqa2564"] },
        ],
      },
      {
        id: "mushaf",
        title: "Mushaf'a dokunmak",
        positions: [
          { school: "majority", text: "Çoğunluğa göre taharetsiz olarak Mushaf'a dokunmak caiz değildir.", src: ["iqa2564"] },
          { school: "hanafi", text: "Bedene bağlı olmayan ayrı bir bez veya kılıfla caizdir.", src: ["bham"] },
          { school: "maliki", text: "Öğrenen veya öğreten bir kadın, öğrenme ya da öğretme sırasında Mushaf'a veya bir kısmına dokunabilir ve onu taşıyabilir. Dar al-Ifta genel olarak çoğunluğun görüşünü tavsiye eder, ancak gerçek ihtiyaç halinde – ezberleme, öğretme, meslek olarak öğretmenlik – günah olmaksızın Mâlikî görüşe uyulmasına izin verir.", src: ["ifta12343"] },
          { school: "jafari", text: "Kur'an yazısına dokunmak haramdır.", src: ["sistani354", "sistani448"] },
        ],
      },
      {
        id: "screen",
        title: "Ekrandan veya bir uygulamadan",
        positions: [
          { school: "contemporary", text: "islamqa.info: Telefon Mushaf değildir; taharetsiz dokunulabilir. Dar al-Ifta (Mısır): Çoğunluğa göre okumak, hangi araçla olursa olsun haramdır; telaffuz etmeden ekrana bakmak caizdir.", src: ["iqa106961", "ifta7815"] },
          { school: "hanafi", text: "Darul Iftaa Azaadville: Ekranda Kur'an metni bulunduğu sürece ekran ve o sayfanın simgeleri Mushaf hükmündedir; bunlara doğrudan dokunmayın, ekran kalemi kullanılabilir. Dinlemek caizdir.", src: ["azaad"] },
        ],
      },
      {
        id: "always",
        title: "Her zaman kalanlar",
        points: [
          { text: "Dinlemek: Tilaveti dinlemek caizdir; Hanefî kaynak bunu, kayıtlardan da olsa, çok övülmeye değer bulur. Malezya Müftülüğü tekrar yerine dinlemeyi tavsiye eder.", src: ["azaad", "sgHanafi", "muftiwp18"] },
          { text: "Zikir ve dua caizdir; çoğunluk, tilavet kastedilmediği sürece tam olarak bunları yasaktan muaf tutar.", src: ["iqa2564", "sgShafii"] },
          { text: "Peygamber ﷺ, Âişe hayızlı iken başı onun kucağındayken Kur'an okurdu. Kur'an'a yakınlık devam eder.", src: ["bukhari297", "muslim301"] },
        ],
      },
    ],
  },

  partShams: {
    title: "Shams Metodu nasıl devam eder",
    lead: "Dinleme ve anlama günlerinde hıfzınız sesli okumadan da canlı kalır. Seriniz ve bahçeniz büyümeye devam eder.",
    steps: [
      { id: "listen", title: "Dinleyerek hıfz", text: "Bugünkü sebakınızı, sebkînizi ve menzilinizi usta bir kâriden ayet ayet ve birkaç kez dinleyin.", src: ["muftiwp18", "sgHanafi"] },
      { id: "eyes", title: "Gözlerinizle takip edin", text: "Telaffuz etmeden sessizce takip ederek okuyun. Bunu yaparken ekrana dokunup dokunmamanız mezhebinize bağlıdır (yukarıya bakın).", src: ["sgHanafi", "ifta7815", "azaad"] },
      { id: "understand", title: "Anlamak (tedebbür)", text: "Ayetlerinizin anlamı, tefsiri ve bağlamı: Shams Metodu'nun \"anlama\" adımı." },
      { id: "words", title: "Kelime bilgisi", text: "Ayetlerinizin kelimeleri ve kökleri, kartlarla." },
      { id: "tajweed", title: "Tecvid bilgisi ve mahreçler", text: "Kuralları öğrenin, ağız şemalarına ve mahreçlerin açıklamalarına bakın. Tek tek harfleri sesli çalışıp çalışmayacağınızı lütfen hocanızla netleştirin." },
      { id: "dua", title: "Zikir ve dua", text: "Dua ve zikir her güne eşlik eder.", src: ["iqa2564"] },
    ],
    notes: [
      { text: "Hanefî mezhebine uyan kadın hocalar kelime kelime, aralar vererek öğretebilir.", src: ["arij"] },
      { text: "Mâlikî mezhebine uyanlar kanama devam ettiği sürece okumaya devam edebilir ve öğrenme ya da öğretme sırasında Mushaf'a dokunabilir.", src: ["ifta12343"] },
      { text: "Kanama bittikten sonra: Mâlikî mezhebinde, unutmaktan korkmadıkça okumak ancak gusülden sonra yeniden caiz olur.", src: ["ifta12343"] },
    ],
  },

  partSajda: {
    title: "Tilavet secdesi (secdetü't-tilâve)",
    lead: "Bir secde ayetini duyduğunuzda veya okuduğunuzda ne geçerlidir.",
    positions: [
      { school: "hanafi", text: "Hayız ve nifas halinde ne caizdir ne de geçerlidir; borç olmaz ve sonradan kaza edilmez.", src: ["sgSajda"] },
      { school: "majority", text: "Taharet şarttır; bu yüzden secde yapılmaz (es-Serahsî, İbn Cüzey, en-Nevevî, er-Ruhaybânî).", src: ["ifta24156"] },
      { school: "contemporary", text: "Başka bir görüşe göre taharet şart değildir (İbn Teymiyye, eş-Şevkânî). Dar al-Ifta çoğunluğun görüşünü tercih eder, ancak diğer görüşe uyan kadında bir günah görmez.", src: ["ifta24156"] },
      { school: "jafari", text: "Es-Sistani'ye göre dört secde ayetinden birini okumak veya duymakla secde vacip olur; bunun için abdest veya gusül gerekmez. Bir kayıttan duyulduğunda vacip olmaz – bu uygulamadaki tilavetler de buna dahildir.", src: ["sistani1079"] },
    ],
  },

  partWomen: {
    title: "Kadınlar ve Kur'an",
    lead: "\"Anlama\" adımı için: kadınlarla ilgili ayetler ve Kur'an'ı koruyan, öğreten ve okuyan kadınlar.",
    versesTitle: "Üzerinde düşünülecek ayetler",
    verses: [
      { ref: "33:35", topic: "Mümin erkekler ve kadınlar yan yana, aynı mükâfatla anılır." },
      { ref: "3:195", topic: "Erkek olsun kadın olsun hiçbir amel zayi olmaz." },
      { ref: "4:124", topic: "İman eden erkek veya kadının salih amelleri cennete götürür." },
      { ref: "16:97", topic: "Erkek veya kadın, iyi amel eden ve iman eden için güzel bir hayat." },
      { ref: "58:1", topic: "Allah, kocası hakkında tartışan kadını işitti; sure onun adını taşır (el-Mücâdile)." },
      { ref: "66:11", topic: "Firavun'un hanımının cennette bir ev için duası." },
      { ref: "66:12", topic: "Rabbinin kelimelerini tasdik eden Meryem." },
      { ref: "3:42", topic: "Meryem seçilmiş ve arındırılmıştır (3:43'e kadar)." },
      { ref: "28:7", topic: "Mûsâ'nın annesine vahiy: korkma ve üzülme." },
    ],
    companionsTitle: "Kur'an'ı aktaran kadın sahabiler",
    companions: [
      { text: "Hafsa bint Ömer, Ebû Bekir'in Kur'an derlemesinin sayfalarını (suhuf) saklıyordu; Osman nüshaları bunlardan çoğalttırdı ve onları ona geri verdi.", src: ["bukhari4986", "bukhari4987"] },
      { text: "Ümmü Varaka Kur'an okurdu; Peygamber ﷺ ona evinde bir müezzin bulundurmasına izin verdi ve ev halkına namaz kıldırmasını söyledi.", src: ["abudawud591", "abudawud592"] },
      { text: "Âişe ayetleri açıkladı ve yorumları düzeltti, örneğin 2:158 ve 4:3 ayetlerinin.", src: ["bukhari1643", "muslim3018"] },
      { text: "Ümmü Seleme, Peygamber'in ﷺ Fâtiha'yı ayet ayet, her ayetten sonra durarak okuduğunu anlattı – tecvid ve vakfın bir temeli.", src: ["abudawud4001", "tirmidhi2927"] },
    ],
    scholarsTitle: "Kadın âlimler",
    scholars: [
      { text: "Kerîme el-Mervezî (ö. 1069, Mekke) Sahîh-i Buhârî'nin rivayetinde bir otoriteydi.", src: ["karima"] },
      { text: "Fâtıma bint Muhammed es-Semerkandî babasının fıkıh eserini ezbere bilirdi; fetvalar babasının ve kocasının yazısının yanında onun el yazısını da taşırdı.", src: ["samarqandi"] },
      { text: "Muhammed Ekrem Nedvî, Arapça yaklaşık 40 ciltlik bir kadın hadis âlimleri sözlüğü yazdı; girişi \"Al-Muhaddithat: The Women Scholars in Islam\" adıyla yayımlandı.", src: ["nadwi"] },
    ],
    recitersTitle: "Kadın kâriler",
    reciters: [
      { text: "Malezya'daki Uluslararası Kur'an Tilavet Yarışması'nın kadın kâriler (kâria) için ayrı bir kategorisi vardır; kazananları arasında Malezya'dan Rogayah Sulong ve Faridah Mat Saman ile Endonezya'dan Maria Ulfah bulunur.", src: ["mtq", "aljazeera"] },
      { text: "Mısırlı kâri Şeyha Mebrûke'nin 1905 tarihli bir kaydı günümüze ulaşmıştır; bugün çeşitli girişimler kadın kârileri yeniden görünür kılıyor.", src: ["aljazeera"] },
    ],
  },

  partTogether: {
    title: "Kadın bir hoca ve kız kardeşlerle öğrenmek",
    lead: "Tilavet, bir hocayı dinleyerek ve ona okuyarak öğrenilir.",
    teacher: "Shams Metodu'nuzu seçtiğiniz bir hocaya bağlayın: planınızı ve gönderdiğinizde kayıtlarınızı görür.",
    circles: "\"Birlikte\" bölümünde yalnızca kız kardeşlere özel ders halkaları vardır.",
    teacherCta: "Hoca bağlayın",
    circlesCta: "Kız kardeş halkaları",
  },

  setup: {
    title: "\"Kız kardeşler için\" kurulsun mu?",
    lead: "Öğrenmenize her gün eşlik eden isteğe bağlı bir alan.",
    points: [
      "Mezhebinizi siz seçersiniz. O günlerde neyin duracağı ona göre belirlenir.",
      "\"Günlerim\" basit bir anahtardır: evet veya hayır. Tarih yok, geçmiş yok, döngü takvimi yok.",
      "Her şey yalnızca bu cihazda kalır. Hiçbir şey hesabınızla eşitlenmez, bir sunucuya veya yapay zekâya gönderilmez; oturumu kapattığınızda silinir.",
      "İstediğiniz zaman değiştirebilir veya kapatabilirsiniz.",
    ],
    agree: "Evet, kurun",
    decline: "Hayır, teşekkürler",
    declined: "Elbette. Başka bir şey sormayacağız. \"Kız kardeşler için\" sayfası Keşfet bölümünde size açık kalır.",
    madhhabTitle: "Hangi mezhebe uyuyorsunuz?",
    madhhabLead: "Bilmiyorsanız çoğunluğun ihtiyatlı görüşü uygulanır.",
    madhhabs: { hanafi: "Hanefî", maliki: "Mâlikî", shafii: "Şâfiî", hanbali: "Hanbelî", jafari: "Caferî (Şia)", unknown: "Bilmiyorum" },
    done: "Tamam",
    later: "Her şeyi Keşfet → Kız kardeşler için altında bulabilirsiniz.",
  },

  days: {
    title: "Günlerim",
    lead: "Yalnızca bu cihazda bir anahtar. Açık olduğu sürece uygulama, mezhebinizin bu günlerde öngörmediği şeyleri durdurur ve dinleme ve anlama günlerini açar. Seriniz ve bahçeniz kalır; tekrarlar birikmek yerine ileriye kayar.",
    question: "Şu anda hayızlı mısınız?",
    yes: "Evet",
    no: "Hayır",
    statusOn: "Açık: dinleme ve anlama günleri etkin.",
    statusOff: "Kapalı.",
    rules: {
      hanafi: "Hanefî: ezberden okuma ve tilavet alıştırmaları durur. Dinlemek, gözle takip ederek okumak, anlamak, kelime bilgisi, tecvid bilgisi ve dua devam eder.",
      maliki: "Mâlikî: kanama devam ettiği sürece ezberden okumak caiz olmaya devam eder. Uygulama durdurmak yerine bunu size hatırlatır. Mushaf'a yalnızca öğrenirken veya öğretirken dokunun.",
      shafii: "Şâfiî: ezberden okuma ve tilavet alıştırmaları durur. Dinlemek, gözle takip ederek okumak, anlamak, kelime bilgisi, tecvid bilgisi ve dua devam eder.",
      hanbali: "Hanbelî: ezberden okuma ve tilavet alıştırmaları durur (mezhebin görüşü). Dinlemek, takip ederek okumak, anlamak, kelime bilgisi, tecvid bilgisi ve dua devam eder.",
      jafari: "Caferî: lütfen dört secde ayetini (32:15, 41:37, 53:62, 96:19) atlayın; uygulama bunları belirtir. Cünüplük hali için es-Sistani (mesele 355) yedi ayetten fazla okumayı mekruh sayar; bunun hayız için de geçerli olup olmadığını lütfen merciinize sorun.",
      unknown: "Çoğunluğun ihtiyatlı görüşü: ezberden okuma ve tilavet alıştırmaları durur. Dinlemek, gözle takip ederek okumak, anlamak, kelime bilgisi, tecvid bilgisi ve dua devam eder.",
    },
    strictTitle: "Sıkı mod",
    strictLead: "Kendi tercihiniz: o günlerinizde tefsir ve kelime bilgisi dahil, dinleme ve dua dışında her şey durur. Büyük mezheplerin hiçbiri bunu şart koşmaz; dinlemek, tefsir ve dua caizdir.",
    offTitle: "Yeniden temizim",
    offNote: "Kanama bittikten sonra gusül gereklidir; Mâlikî mezhebinde, unutmaktan korkmadıkça okumak ancak ondan sonra yeniden caiz olur.",
    ghuslLink: "Gusül rehberine git",
    privacy: "Yalnızca bu cihazda. Tarih yok, geçmiş yok, aktarım yok. Oturumu kapattığınızda silinir.",
    changeMadhhab: "Mezhebi değiştir",
  },

  gate: {
    pausedTitle: "Günleriniz bitene kadar duraklatıldı",
    pausedMajority: "Mezhebinize göre bu günlerde ezberden okunmaz. Hıfzınız canlı kalır: bugün aynı ayetleri dinleyin ve anlamlarını öğrenin.",
    pausedStrict: "Sıkı modu seçtiniz: bugün dinleme ve dua devam eder.",
    noteMaliki: "Mâlikî mezhebine göre kanama devam ettiği sürece ezberden okuyabilirsiniz.",
    noteJafari: "Lütfen 32:15, 41:37, 53:62 ve 96:19 secde ayetlerini atlayın.",
    listenInstead: "Bugün okumak yerine dinleyin",
    toSection: "Kız kardeşler için",
    openAnyway: "Yine de aç",
  },

  ld: {
    title: "Dinleme ve anlama günleri",
    lead: "Sesli okuyamadığınızda veya okumak istemediğinizde – yolculukta, sesiniz kısıldığında, o günlerinizde: virdiniz dinleme, anlama ve kelime bilgisine dönüşür. Seri ve bahçe kalır.",
    on: "Dinleme ve anlama günleri",
    onHint: "Yolculuk modu gibi basit bir anahtar, yalnızca bu cihazda. Hiçbir tarih kaydedilmez.",
    activeTitle: "Bugün: dinleme ve anlama günü",
    activeLead: "Hıfzınız sesli okumadan da canlı kalır.",
    done: "Dinleme gününü tamamla",
    doneMsg: "Mâşâallah. Dinleme gününüz serinize ve bahçenize sayılır.",
    off: "Yeniden okuyun",
    sistersLink: "Kız kardeşler için notlar",
  },
};
export default tr;
