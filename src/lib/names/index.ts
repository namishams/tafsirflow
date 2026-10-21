import { BOYS } from "./boys";
import { GIRLS } from "./girls";
import { LOCALE_META, type AppLocale } from "@/i18n/locales";

// Muslim baby names: data model, helpers and the page texts, labels and name meanings in every site language (a missing entry falls back to English).

export type Origin = "quran" | "prophet" | "sahabi" | "sahabiyya" | "ahl-al-bayt" | "arabic" | "other";
export const THEMES = ["faith", "light", "peace", "strength", "knowledge", "nature", "beauty", "joy", "honour", "virtue"] as const;
export type Theme = (typeof THEMES)[number];
export type Gender = "b" | "g";

// [id, Arabic, transliterations "A|B", meaning de, meaning en, meaning ar, origins, themes, Quran verse]
export type RawName = readonly [id: string, ar: string, tr: string, de: string, en: string, arM: string, o: readonly Origin[], t: readonly Theme[], q?: string];

export type BabyName = { key: string; id: string; g: Gender; ar: string; tr: string[]; de: string; en: string; arM: string; o: readonly Origin[]; t: readonly Theme[]; q?: string };

const build = (g: Gender) => (r: RawName): BabyName => ({ key: `${g}:${r[0]}`, id: r[0], g, ar: r[1], tr: r[2].split("|"), de: r[3], en: r[4], arM: r[5], o: r[6], t: r[7], q: r[8] });

export const NAMES: BabyName[] = [...BOYS.map(build("b")), ...GIRLS.map(build("g"))];
export const NAME_BY_KEY = new Map(NAMES.map((n) => [n.key, n]));
export const COUNTS = { b: BOYS.length, g: GIRLS.length };

// Lang = the language of the name logic (Arabic letters and lengths vs. Latin script; the month notes in rules.ts exist in these three).
// Every other site language counts as English there.
export type Lang = "de" | "en" | "ar";
export const langOf = (locale: string): Lang => (locale === "de" || locale === "ar" ? locale : "en");

// UiLang = every site language, for labels and name meanings (Lang is a subset, so Lang values can be passed wherever a UiLang is expected)
export type UiLang = AppLocale;
export const uiLangOf = (locale: string): UiLang => (locale in LOCALE_META ? locale : "en") as UiLang;

// Meanings of the given names in the other site languages: one line "id|meaning" per name, ids as in boys.ts and girls.ts.
// Name meanings only: the Arabic names and their transliterations stay as they are. A missing line falls back to the English meaning.
const MEANINGS_RAW: Partial<Record<UiLang, string>> = {
  tr: `muhammad|çok övülen
ahmad|en çok övülmeye layık olan
mahmud|övülmüş, övgüye değer
mustafa|seçilmiş olan
abdullah|Allah'ın kulu
abdurrahman|çok merhametli olanın kulu
abdurrahim|özellikle merhamet edenin kulu
abdulaziz|güçlü ve yüce olanın kulu
abdulmalik|hükümdarın kulu
abdulkarim|çok cömert olanın kulu
abdulhamid|övülmeye layık olanın kulu
abdulqadir|her şeye gücü yetenin kulu
abdussalam|esenlik kaynağının kulu
abdulwahhab|bol bol bağışlayanın kulu
abdulghani|hiçbir şeye muhtaç olmayanın kulu
abdullatif|lütuf ve inceliğin sahibi olanın kulu
abdulhadi|doğru yolu gösterenin kulu
abdulbasit|rızkı genişletenin kulu
abdulwahid|tek olanın kulu
abdulfattah|kapıları açanın kulu
abdulmajid|şanı yüce olanın kulu
abdulhayy|ebedî diri olanın kulu
abdulwadud|çok sevenin kulu
abdulghafur|çok bağışlayanın kulu
ibrahim|Peygamber İbrahim, Allah'ın yakın dostu
ismail|Peygamber İsmail; "Allah işitir"
ishaq|Peygamber İshak; "güler"
yaqub|Peygamber Yakub
yusuf|Peygamber Yusuf; "Allah artırır"
musa|Peygamber Musa
harun|Peygamber Harun, Musa'nın kardeşi
dawud|Peygamber Davud; "sevilen"
sulayman|Peygamber Süleyman; "barış insanı"
yunus|Peygamber Yunus
ayyub|Peygamber Eyyub, sabrın örneği
yahya|Peygamber Yahya; "yaşar"
zakariya|Peygamber Zekeriya
isa|Peygamber İsa
nuh|Peygamber Nuh; "dinlenme, rahatlık"
idris|Peygamber İdris; çoğu zaman "ders" (öğrenim) ile ilişkilendirilir
hud|Peygamber Hud, Âd kavmine gönderilen
salih|dürüst, erdemli; Peygamber Salih
shuayb|Peygamber Şuayb, Medyen'e gönderilen
ilyas|Peygamber İlyas
adam|Peygamber Âdem, ilk insan
imran|Kur'an'daki İmran ailesi; "umr" (ömür, gelişme) kökünden
luqman|Bilge Lokman; adını taşıyan bir sûre vardır
taha|Tâhâ Sûresi'nin başındaki harfler
yasin|Yâsîn Sûresi'nin başındaki harfler
abubakr|ilk halifenin ve en yakın arkadaşın künyesi
umar|uzun ömür; ikinci halife
uthman|üçüncü halife; aslında küçük bir toy kuşu
ali|yüce, yüksek
hasan|iyi, güzel
husayn|küçük Hasan: iyi, yakışıklı olan
qasim|dağıtan; Peygamber'in ﷺ bir oğlu
jafar|ırmak, küçük akarsu
hamza|sebatlı, güçlü; Peygamber'in ﷺ amcası
abbas|asık yüzlü; aslanın bir adı; Peygamber'in ﷺ amcası
khalid|ebedî, kalıcı
bilal|tazelik; İslam'ın ilk müezzini
zayd|artış, büyüme; Kur'an'da adı geçen tek sahabi
saad|mutluluk, talih
said|mutlu, bahtiyar
talha|bir tür akasya ağacı
zubayr|güçlü, sağlam
muadh|Allah'ın koruduğu kişi
anas|dostluk, sıcaklık
usama|aslan
ammar|bir yeri imar eden ve ona hayat veren
yasir|kolaylık seven, yumuşak huylu
suhayb|kızıl saçlı
salman|selamette, huzurlu
musab|zor evcilleşen: iradesi güçlü
jabir|onaran ve teselli eden
tamim|tam, güçlü
hakim|bilge
hassaan|çok yakışıklı; Peygamber'in ﷺ şairi
asim|koruyucu, himaye eden
safwan|berrak, pürüzsüz kaya
sahl|kolay, yumuşak
harith|çiftçi, çalışıp çabalayan
aamir|gelişen, hayat dolu
zahir|parlak, çiçek açan
zainulabidin|ibadet edenlerin süsü
tariq|gece ziyaretçisi; sabah yıldızı
ayman|bereketli; sağ taraf
ridwan|(Allah'ın) hoşnutluğu
ihsan|mükemmellik, iyilik yapma
naim|saadet, nimet
ramadan|oruç ayı
tawfiq|Allah'ın verdiği başarı
burhan|kanıt, açık delil
furqan|hak ile bâtılı ayıran ölçü
najm|yıldız
waqar|vakar, ağırbaşlılık
rayhan|kokulu bitki, fesleğen
khalifa|halef, vekil
karim|cömert, soylu
rashid|doğru yolda olan
hadi|yol gösterici
fuad|kalp, gönül
jamil|güzel, yakışıklı
khalil|yakın dost
mubarak|mübarek, bereketli
muhsin|iyiliği en güzel biçimde yapan
munir|nurlu, parlayan
siraj|kandil, ışık veren
sabir|sabırlı
sadiq|doğru sözlü
siddiq|çok doğru sözlü
shakir|şükreden
akram|en cömert, en soylu
amin|güvenilir
badr|dolunay
bashir|müjde getiren
munib|tövbe ederek Allah'a yönelen
salim|sağlam, güvenli, bütün
halim|yumuşak huylu, hoşgörülü
taqi|takvalı, Allah'tan sakınan
zaki|temiz, arı
sajid|secde eden
shahid|şahit, tanık
mubashshir|müjde veren
kazim|öfkesini yenen
amir|emir, lider
nabil|soylu
nuruddin|dinin nuru
salahuddin|dinin doğruluğu, erdemi
shamsuddin|dinin güneşi
saif|kılıç
faisal|kesin hüküm veren
fahd|çita
faris|atlı, şövalye
habib|sevgili
haytham|genç kartal
hisham|cömertlik
jalal|celâl, ululuk
jamal|cemâl, güzellik
kamal|kemâl, olgunluk
majid|şanlı, soylu
mansur|muzaffer, yardım görmüş
marwan|çakmaktaşı: sert, sağlam
mazin|yağmur bulutu
murad|dilek, amaç
nadir|ender, değerli
nasir|yardımcı, destekçi
rayyan|bol sulanmış; cennette oruç tutanlar için bir kapı
riyad|bahçeler
sami|yüce, yüksek
samir|akşam sohbeti arkadaşı
sharif|soylu, şerefli
tahir|temiz, arı
talal|ince yağmur, çiy
wasim|yakışıklı, zarif
walid|yeni doğan
ziyad|artış, çoğalma
zain|güzellik, zarafet
adil|adaletli
adnan|yerleşik kimse; Arapların atası
anwar|daha parlak
arif|bilen, bilge
asad|aslan
basil|cesur
hamid|Allah'a hamd eden
hashim|Peygamber'in ﷺ büyük dedesi; "ekmek ufalayan" (misafirler için)
imad|direk, dayanak
isam|koruma, güvence
junayd|küçük asker
labib|zeki, akıllı
malik|sahip; kral
mahdi|doğru yola erdirilmiş
mahir|usta, becerikli
mujahid|iyilik için çabalayan
najib|soylu, asil doğmuş
nasim|hafif esinti
rafiq|nazik yoldaş
raid|öncü, lider
rami|okçu
wail|sığınan
yamin|sağ el; bereket
zahid|azla yetinen, zahit
faruq|hakkı bâtıldan ayıran; Ömer'in lakabı
husam|keskin kılıç
jawad|cömert
muin|yardımcı
samih|cömert, bağışlayan
shafiq|şefkatli, merhametli
hamdan|çok hamd eden
zayed|artan, bol
humaid|küçük övülen
obaid|küçük kul (Allah'ın)
sultan|otorite, hükümdar
kerem|cömertlik, asalet
shahin|şahin
arslan|aslan (Türkçe)
arman|dilek, ideal (Farsça)
kamran|başarılı, talihli (Farsça)
maryam|Peygamber İsa'nın annesi; Kur'an'da adıyla anılan tek kadın
asiya|Firavun'un karısı, Kur'an'da örnek olarak övülür
hajar|İsmail'in annesi; Safa ile Merve arasındaki arayışı hacda yaşamaya devam eder
sara|İbrahim'in eşi; "prenses"
hawwa|Havva, insanlığın annesi
khadija|Peygamber'in ﷺ ilk eşi ve ona ilk inanan
aisha|yaşayan, hayat dolu
fatima|Peygamber'in ﷺ kızı; "sütten kesen"
zahra|parlak olan; Fatıma'nın lakabı
zaynab|Peygamber'in ﷺ kızı; çoğunlukla kokulu bir bitki olarak açıklanır
ruqayya|yükseliş; Peygamber'in ﷺ kızı
batul|kendini Allah'a adamış; Meryem ve Fatıma'nın lakabı
hafsa|genç dişi aslan; müminlerin annelerinden biri
safiyya|saf, temiz; seçilmiş dost
maymuna|bereketli, uğurlu
salma|huzurlu, güvende
sumayya|yüce; İslam'ın ilk şehidi
asma|yüce; ayrıca "isimler"
nusayba|soylu soydan; Uhud'da Peygamber'i ﷺ savundu
rufayda|yardım, destek; İslam'ın ilk hemşiresi
baraka|bereket; Ümmü Eymen'in adı
halima|yumuşak huylu, hoşgörülü; Peygamber'in ﷺ sütannesi
shayma|yüzünde ben olan; Peygamber'in ﷺ süt kardeşi
arwa|dağ keçisi; Peygamber'in ﷺ halası
hala|ayın etrafındaki hale
hind|müminlerin annelerinden Ümmü Seleme'nin adı
khawla|ceylan; yakarışını Allah'ın duyduğu sahabiye
mariya|Kıptî Mariya, Peygamber'in ﷺ oğlu İbrahim'in annesi
jamila|güzel
amina|güvende, emniyette; Peygamber'in ﷺ annesi
sakina|sükûnet, iç huzur
huda|hidayet
nur|nur, ışık
rahma|rahmet, merhamet
iman|iman
amal|umut
jannah|bahçe, cennet
firdaws|cennetin en yüksek bahçesi
kawthar|bolluk; cennette bir nehir
salsabil|cennette bir pınar
tasnim|cennette bir pınar
bushra|müjde
isra|gece yolculuğu; 17. sûrenin adı
jana|toplanmaya hazır olgun meyve
lina|narin hurma ağacı
marwa|beyaz taş; Kâbe yakınındaki Merve tepesi
rawda|bahçe, çayır
rayhana|fesleğen, kokulu bitki
sadiqa|doğru sözlü
sabira|sabırlı
sana|parıltı, ışık
yusra|kolaylık
aliya|yüce, yüksek
aya|işaret, âyet; Kur'an'ın bir âyeti
bayan|açıklık, belagat
duaa|dua
hanan|şefkat, merhamet
lulua|inci
nuha|akıl, anlayış
radiya|hoşnut, memnun
mardiyya|Allah'ın hoşnut olduğu kişi
sahar|şafaktan önceki saat
salwa|teselli; Allah'ın İsrailoğulları'na gönderdiği bıldırcınlar
shifa|şifa
sidra|sidre ağacı (Sidretü'l-Müntehâ)
taqwa|takva, Allah bilinci
duha|kuşluk ışığı
fajr|fecir, şafak
ghufran|bağışlanma
husna|en güzel, en iyi
qamar|ay
raghad|tasasız, bol bir hayat
sundus|ince ipek (cennete özgü)
qurratulayn|gözün aydınlığı ve sevinci
qanita|içtenlikle itaat eden
abida|ibadet eden
hana|mutluluk, saadet
hiba|hediye
ilham|ilham
inaya|ilgi, özen
inas|dostluk, sıcaklık
jumana|gümüş inci
layla|gece
lubna|storaks ağacı (kokulu reçine)
lujayn|gümüş
manal|ulaşma, erişme
safa|saflık, berraklık
maysa|yürüyüşü zarif
muna|dilekler, umutlar
nada|çiy; cömertlik
najla|geniş ve güzel gözlü
nawal|hediye, lütuf
rania|sevinçle bakan
reem|beyaz ceylan
samira|akşam sohbeti arkadaşı
wafa|vefa, sadakat
afaf|iffet, namus
abir|güzel koku
amira|prenses
anisa|dost canlısı yoldaş
basma|gülümseme
daliya|asma
dana|iri inci
farah|sevinç
ghada|zarif genç kadın
habiba|sevgili
hadil|güvercin sesi
hayat|hayat
ibtisam|gülümseyen
joud|cömertlik
kamila|tam, kusursuz
karima|cömert, soylu
lamis|dokunuşu yumuşak
latifa|nazik, kibar, ince
layan|yumuşaklık, nezaket
maha|güzel gözleriyle bilinen Arap oriksi
malika|kraliçe
maram|arzu, dilek
munira|nurlu
nabila|soylu
nafisa|değerli, nefis
naima|rahatlık, hafif saadet
najwa|içten sohbet
rabia|dördüncü; Rabia el-Adeviyye
rahima|merhametli
raja|umut
rasha|genç ceylan
ruba|tepeler
ruwayda|yumuşak adımlarla yürüyen
sabah|sabah
samar|akşam sohbeti
thurayya|Süreyya (Ülker) yıldız kümesi
widad|sevgi, muhabbet
wijdan|duygu, vicdan
yumna|bereketli; sağ el
zakiyya|temiz, arı
zubayda|en iyi kısım (kelime anlamı: kaymak); hacılar için su tesisleri yaptırdı
hamida|övülmeye değer
hasna|güzel
kenza|hazine
naila|iyiye kavuşan
rahaf|incelik, hassasiyet
samiha|cömert, bağışlayan
tahira|temiz, arı
nurulayn|gözün nuru
sajida|secde eden
hira|vahyin başladığı Hira Mağarası
areej|güzel koku
dima|hafif, uzun süren yağmur
ghaliya|değerli, aziz
hayfa|ince belli, zarif
leen|yumuşaklık
tuqa|takva, dindarlık
waad|söz, vaat
shahd|petekteki bal
hidaya|hidayet
salima|sağlam, güvenli
alya|yükseklikler, yücelik
warda|gül
zaina|süs, güzellik
inshirah|gönül ferahlığı ve genişliği
yasmin|yasemin
nasrin|yabani gül (Farsça)
fayruz|firuze (değerli taş, Farsça)
sawsan|zambak
narjis|nergis (çiçek)
shirin|tatlı, sevimli (Farsça)
laleh|lale (Farsça)
mahnoor|ay ışığı (Farsça-Arapça)
elif|Elif, alfabenin ilk harfi`,
  ur: `muhammad|بہت سراہا ہوا
ahmad|سب سے زیادہ قابلِ تعریف
mahmud|سراہا ہوا، قابلِ تعریف
mustafa|چنا ہوا
abdullah|اللہ کا بندہ
abdurrahman|نہایت مہربان کا بندہ
abdurrahim|خاص رحم کرنے والے کا بندہ
abdulaziz|بڑے غالب (زبردست) کا بندہ
abdulmalik|بادشاہ کا بندہ
abdulkarim|نہایت سخی کا بندہ
abdulhamid|قابلِ تعریف کا بندہ
abdulqadir|ہر چیز پر قدرت رکھنے والے کا بندہ
abdussalam|سلامتی کے سرچشمے کا بندہ
abdulwahhab|بہت عطا کرنے والے کا بندہ
abdulghani|بے نیاز کا بندہ
abdullatif|باریک بیں، مہربان کا بندہ
abdulhadi|ہدایت دینے والے کا بندہ
abdulbasit|رزق کشادہ کرنے والے کا بندہ
abdulwahid|ایک (اکیلے) کا بندہ
abdulfattah|کھولنے والے کا بندہ
abdulmajid|بزرگی والے کا بندہ
abdulhayy|ہمیشہ زندہ رہنے والے کا بندہ
abdulwadud|محبت کرنے والے کا بندہ
abdulghafur|بخشنے والے کا بندہ
ibrahim|نبی ابراہیم، اللہ کے خلیل (قریبی دوست)
ismail|نبی اسماعیل؛ "اللہ سنتا ہے"
ishaq|نبی اسحاق؛ "وہ ہنستا ہے"
yaqub|نبی یعقوب
yusuf|نبی یوسف؛ "اللہ بڑھاتا ہے"
musa|نبی موسیٰ
harun|نبی ہارون، موسیٰ کے بھائی
dawud|نبی داؤد؛ "محبوب"
sulayman|نبی سلیمان؛ "امن کا انسان"
yunus|نبی یونس
ayyub|نبی ایوب، صبر کی مثال
yahya|نبی یحییٰ؛ "وہ زندہ رہتا ہے"
zakariya|نبی زکریا
isa|نبی عیسیٰ
nuh|نبی نوح؛ "آرام، سکون"
idris|نبی ادریس؛ اکثر "درس" (پڑھنے) سے جوڑا جاتا ہے
hud|نبی ہود، جنہیں قومِ عاد کی طرف بھیجا گیا
salih|نیک؛ نبی صالح
shuayb|نبی شعیب، جنہیں مدین کی طرف بھیجا گیا
ilyas|نبی الیاس
adam|نبی آدم، پہلے انسان
imran|قرآن میں آلِ عمران؛ "عمر" (زندگی، پھلنا پھولنا) سے
luqman|حکیم لقمان، جن کے نام پر ایک سورت ہے
taha|سورۂ طٰہٰ کے ابتدائی حروف
yasin|سورۂ یٰسٓ کے ابتدائی حروف
abubakr|پہلے خلیفہ، قریب ترین ساتھی کی کنیت
umar|لمبی عمر؛ دوسرے خلیفہ
uthman|تیسرے خلیفہ؛ اصل میں تلور (پرندے) کا چھوٹا بچہ
ali|بلند، اعلیٰ
hasan|اچھا، خوبصورت
husayn|چھوٹا حسن: اچھا، خوش شکل
qasim|تقسیم کرنے والا؛ نبی ﷺ کے ایک صاحبزادے
jafar|ندی، چھوٹی نہر
hamza|ثابت قدم، مضبوط؛ نبی ﷺ کے چچا
abbas|سخت چہرے والا؛ شیر کا ایک نام؛ نبی ﷺ کے چچا
khalid|ہمیشہ رہنے والا، پائیدار
bilal|تازگی؛ اسلام کے پہلے مؤذن
zayd|اضافہ، نشوونما؛ قرآن میں نام سے مذکور واحد صحابی
saad|خوشی، خوش قسمتی
said|خوش، مبارک
talha|ایک قسم کا ببول کا درخت
zubayr|مضبوط، پختہ
muadh|جسے اللہ نے پناہ دی ہو
anas|انس، گرم جوشی
usama|شیر
ammar|جو کسی جگہ کو آباد اور زندہ کرے
yasir|آسان طبیعت، نرم مزاج
suhayb|سرخی مائل بالوں والا
salman|محفوظ، پُرسکون
musab|مشکل سے قابو میں آنے والا: مضبوط ارادے والا
jabir|جوڑنے اور تسلی دینے والا
tamim|کامل، مضبوط
hakim|دانا
hassaan|بہت خوش شکل؛ نبی ﷺ کے شاعر
asim|محافظ، نگہبان
safwan|صاف، چکنی چٹان
sahl|آسان، نرم
harith|کاشتکار، کوشش کرنے والا
aamir|آباد، زندگی سے بھرپور
zahir|روشن، کھلتا ہوا
zainulabidin|عبادت گزاروں کی زینت
tariq|رات کو آنے والا؛ صبح کا ستارہ
ayman|بابرکت؛ دائیں جانب
ridwan|(اللہ کی) خوشنودی
ihsan|حسنِ عمل، نیکی کرنا
naim|نعمت، خوشی
ramadan|روزوں کا مہینہ
tawfiq|اللہ کی عطا کردہ کامیابی
burhan|دلیل، روشن ثبوت
furqan|حق اور باطل میں فرق کرنے والی کسوٹی
najm|ستارہ
waqar|وقار، متانت
rayhan|خوشبودار پودا، ریحان
khalifa|جانشین، نائب
karim|سخی، شریف
rashid|راہِ راست پر چلنے والا
hadi|رہنما
fuad|دل
jamil|خوبصورت، خوش شکل
khalil|قریبی دوست
mubarak|بابرکت
muhsin|بہترین انداز میں نیکی کرنے والا
munir|روشن، چمکتا ہوا
siraj|چراغ
sabir|صبر کرنے والا
sadiq|سچا
siddiq|نہایت سچا
shakir|شکر گزار
akram|سب سے زیادہ سخی، سب سے زیادہ شریف
amin|امانت دار
badr|پورا چاند
bashir|خوشخبری دینے والا
munib|توبہ کر کے اللہ کی طرف رجوع کرنے والا
salim|صحیح سلامت، محفوظ، پورا
halim|بردبار، نرم مزاج
taqi|پرہیزگار، اللہ سے ڈرنے والا
zaki|پاکیزہ
sajid|سجدہ کرنے والا
shahid|گواہ
mubashshir|خوشخبری سنانے والا
kazim|غصہ پی جانے والا
amir|امیر، سردار
nabil|شریف
nuruddin|دین کا نور
salahuddin|دین کی نیکی (صلاح)
shamsuddin|دین کا سورج
saif|تلوار
faisal|فیصلہ کن فیصلہ کرنے والا
fahd|چیتا
faris|شہسوار
habib|محبوب
haytham|عقاب کا بچہ
hisham|سخاوت
jalal|جلال، عظمت
jamal|جمال، خوبصورتی
kamal|کمال، تکمیل
majid|بزرگ، شریف
mansur|فتح یاب، جسے مدد ملی ہو
marwan|چقماق کا پتھر: مضبوط
mazin|بارش کا بادل
murad|مراد، مقصد
nadir|نادر، قیمتی
nasir|مددگار، حامی
rayyan|خوب سیراب؛ روزہ داروں کے لیے جنت کا ایک دروازہ
riyad|باغات
sami|بلند، اعلیٰ
samir|شام کی گفتگو کا ساتھی
sharif|شریف، معزز
tahir|پاک
talal|ہلکی بارش، شبنم
wasim|خوش شکل، حسین
walid|نومولود
ziyad|اضافہ، بڑھوتری
zain|حسن، خوبی
adil|انصاف پسند، عادل
adnan|آباد ہونے والا؛ عربوں کے جدِ امجد
anwar|زیادہ روشن
arif|جاننے والا، دانا
asad|شیر
basil|بہادر
hamid|اللہ کی حمد کرنے والا
hashim|نبی ﷺ کے پردادا؛ "روٹی توڑنے والا" (مہمانوں کے لیے)
imad|ستون، سہارا
isam|حفاظت کا ذریعہ
junayd|چھوٹا سپاہی
labib|عقلمند، دانا
malik|مالک؛ بادشاہ
mahdi|ہدایت یافتہ
mahir|ماہر
mujahid|نیکی کے لیے کوشش کرنے والا
najib|شریف، اعلیٰ نسب
nasim|ٹھنڈی ہوا کا جھونکا
rafiq|مہربان ساتھی
raid|پیش رو، رہنما
rami|تیر انداز
wail|پناہ لینے والا
yamin|دایاں ہاتھ؛ برکت
zahid|تھوڑے پر قناعت کرنے والا، زاہد
faruq|حق و باطل میں فرق کرنے والا؛ عمر کا لقب
husam|تیز تلوار
jawad|سخی
muin|مددگار
samih|سخی، معاف کرنے والا
shafiq|شفیق، مہربان
hamdan|بہت حمد کرنے والا
zayed|بڑھتا ہوا، وافر
humaid|چھوٹا سراہا ہوا
obaid|چھوٹا بندہ (اللہ کا)
sultan|اقتدار، حکمران
kerem|سخاوت، شرافت
shahin|شاہین
arslan|شیر (ترکی)
arman|آرزو، مثالی تصور (فارسی)
kamran|کامیاب، خوش نصیب (فارسی)
maryam|نبی عیسیٰ کی والدہ؛ قرآن میں نام سے مذکور واحد خاتون
asiya|فرعون کی بیوی، جن کی قرآن میں مثال کے طور پر تعریف کی گئی
hajar|اسماعیل کی والدہ؛ صفا و مروہ کے درمیان ان کی تلاش حج میں آج بھی زندہ ہے
sara|ابراہیم کی بیوی؛ "شہزادی"
hawwa|حوا، نسلِ انسانی کی ماں
khadija|نبی ﷺ کی پہلی زوجہ اور ان پر سب سے پہلے ایمان لانے والی
aisha|زندہ، زندگی سے بھرپور
fatima|نبی ﷺ کی صاحبزادی؛ "دودھ چھڑانے والی"
zahra|روشن چہرے والی؛ فاطمہ کا لقب
zaynab|نبی ﷺ کی صاحبزادی؛ اکثر خوشبودار پودے کے معنی میں بیان کیا جاتا ہے
ruqayya|بلندی؛ نبی ﷺ کی صاحبزادی
batul|اللہ کے لیے وقف؛ مریم اور فاطمہ کا لقب
hafsa|شیرنی کا بچہ؛ ایک ام المومنین
safiyya|پاک؛ منتخب دوست
maymuna|بابرکت، مبارک
salma|پُرسکون، محفوظ
sumayya|بلند؛ اسلام کی پہلی شہید
asma|بلند؛ نیز "نام"
nusayba|اعلیٰ نسب والی؛ اُحد میں نبی ﷺ کا دفاع کیا
rufayda|مدد، سہارا؛ اسلام کی پہلی نرس
baraka|برکت؛ ام ایمن کا نام
halima|بردبار، نرم مزاج؛ نبی ﷺ کی رضاعی ماں
shayma|تل والی؛ نبی ﷺ کی رضاعی بہن
arwa|پہاڑی بکری؛ نبی ﷺ کی پھوپھی
hala|چاند کے گرد ہالہ
hind|ام المومنین ام سلمہ کا نام
khawla|ہرنی؛ وہ صحابیہ جن کی فریاد اللہ نے سنی
mariya|مصری قبطی ماریہ، نبی ﷺ کے صاحبزادے ابراہیم کی والدہ
jamila|خوبصورت
amina|محفوظ، پُرامن؛ نبی ﷺ کی والدہ
sakina|سکون، اندرونی اطمینان
huda|ہدایت
nur|نور
rahma|رحمت
iman|ایمان
amal|امید
jannah|باغ، جنت
firdaws|جنت کا سب سے اعلیٰ باغ
kawthar|کثرت؛ جنت کی ایک نہر
salsabil|جنت کا ایک چشمہ
tasnim|جنت کا ایک چشمہ
bushra|خوشخبری
isra|رات کا سفر؛ سورۂ 17 کا نام
jana|توڑنے کے لیے تیار پکا ہوا پھل
lina|نازک کھجور کا درخت
marwa|سفید پتھر؛ کعبہ کے قریب مروہ کی پہاڑی
rawda|باغ، سبزہ زار
rayhana|ریحان، خوشبودار پودا
sadiqa|سچی
sabira|صبر کرنے والی
sana|چمک، روشنی
yusra|آسانی
aliya|بلند، اعلیٰ
aya|نشانی؛ قرآن کی آیت
bayan|وضاحت، فصاحت
duaa|دعا
hanan|شفقت، ہمدردی
lulua|موتی
nuha|عقل، سمجھ
radiya|راضی، خوش
mardiyya|وہ جس سے اللہ راضی ہو
sahar|فجر سے پہلے کا وقت
salwa|تسلی؛ وہ بٹیریں جو اللہ نے بنی اسرائیل پر اتاریں
shifa|شفا
sidra|بیری کا درخت (سدرۃ المنتہیٰ)
taqwa|تقویٰ، اللہ کا خوف
duha|چاشت کی روشنی
fajr|فجر، صبحِ صادق
ghufran|مغفرت
husna|سب سے خوبصورت، سب سے بہتر
qamar|چاند
raghad|بے فکر، خوشحال زندگی
sundus|باریک ریشم (جنت کا)
qurratulayn|آنکھوں کی ٹھنڈک اور خوشی
qanita|فرماں بردار، عبادت گزار
abida|عبادت گزار
hana|خوشی، مسرت
hiba|تحفہ
ilham|الہام
inaya|توجہ، فکر
inas|انس، گرم جوشی
jumana|چاندی جیسا موتی
layla|رات
lubna|اسطرک کا درخت (خوشبودار گوند)
lujayn|چاندی
manal|حصول، کامیابی
safa|پاکیزگی، صفائی
maysa|باوقار چال والی
muna|آرزوئیں، امیدیں
nada|شبنم؛ سخاوت
najla|بڑی اور خوبصورت آنکھوں والی
nawal|عطیہ، مہربانی
rania|خوشی سے دیکھنے والی
reem|سفید ہرن
samira|شام کی گفتگو کی ساتھی
wafa|وفا، وفاداری
afaf|پاک دامنی، حیا
abir|خوشبو
amira|شہزادی
anisa|دوست ساتھی
basma|مسکراہٹ
daliya|انگور کی بیل
dana|بڑا موتی
farah|خوشی
ghada|نازک اندام نوجوان لڑکی
habiba|محبوبہ
hadil|فاختہ کی غٹرغوں
hayat|زندگی
ibtisam|مسکرانے والی
joud|سخاوت
kamila|کامل، مکمل
karima|سخی، شریف
lamis|چھونے میں نرم
latifa|نرم، مہربان، لطیف
layan|نرمی، ملائمت
maha|عربی اوریکس ہرن، جو اپنی خوبصورت آنکھوں کے لیے مشہور ہے
malika|ملکہ
maram|آرزو، مراد
munira|روشن
nabila|شریف
nafisa|قیمتی، نفیس
naima|راحت، ہلکی خوشی
najwa|رازدارانہ گفتگو
rabia|چوتھی؛ رابعہ عدویہ
rahima|رحم کرنے والی
raja|امید
rasha|ہرن کا بچہ
ruba|ٹیلے، پہاڑیاں
ruwayda|آہستہ اور نرمی سے چلنے والی
sabah|صبح
samar|شام کی گفتگو
thurayya|ثریا (ستاروں کا جھرمٹ)
widad|محبت، چاہت
wijdan|احساس، ضمیر
yumna|بابرکت؛ دایاں ہاتھ
zakiyya|پاکیزہ
zubayda|بہترین حصہ (لفظی معنی: بالائی)؛ حجاج کے لیے نہریں بنوائیں
hamida|قابلِ تعریف
hasna|خوبصورت
kenza|خزانہ
naila|بھلائی پانے والی
rahaf|نزاکت، حساسیت
samiha|سخی، معاف کرنے والی
tahira|پاک
nurulayn|آنکھوں کا نور
sajida|سجدہ کرنے والی
hira|غارِ حرا، جہاں وحی کا آغاز ہوا
areej|خوشبو
dima|ہلکی، مسلسل بارش
ghaliya|قیمتی، عزیز
hayfa|نازک کمر والی، دلکش
leen|نرمی
tuqa|تقویٰ، پرہیزگاری
waad|وعدہ
shahd|چھتے میں شہد
hidaya|ہدایت
salima|صحیح سلامت، محفوظ
alya|بلندیاں، رفعت
warda|گلاب
zaina|زینت، حسن
inshirah|شرحِ صدر، دل کی کشادگی
yasmin|چنبیلی
nasrin|جنگلی گلاب (فارسی)
fayruz|فیروزہ (قیمتی پتھر، فارسی)
sawsan|سوسن (للی)
narjis|نرگس (پھول)
shirin|میٹھی، پیاری (فارسی)
laleh|لالہ (فارسی)
mahnoor|چاندنی (فارسی و عربی)
elif|الف، حروفِ تہجی کا پہلا حرف`,
  fa: `muhammad|بسیار ستوده
ahmad|ستوده‌ترین
mahmud|ستوده، شایسته ستایش
mustafa|برگزیده
abdullah|بنده خدا
abdurrahman|بنده بسیار مهربان
abdurrahim|بنده آن‌که رحمتش ویژه است
abdulaziz|بنده نیرومند شکست‌ناپذیر
abdulmalik|بنده پادشاه
abdulkarim|بنده بسیار بخشنده
abdulhamid|بنده ستوده
abdulqadir|بنده توانای مطلق
abdussalam|بنده سرچشمه صلح و سلامت
abdulwahhab|بنده بخشنده
abdulghani|بنده بی‌نیاز
abdullatif|بنده لطیف و مهربان
abdulhadi|بنده راهنما
abdulbasit|بنده گشاینده روزی
abdulwahid|بنده یگانه
abdulfattah|بنده گشاینده
abdulmajid|بنده بزرگوار
abdulhayy|بنده زنده جاودان
abdulwadud|بنده دوستدار
abdulghafur|بنده بسیار آمرزنده
ibrahim|پیامبر ابراهیم، دوست نزدیک خدا
ismail|پیامبر اسماعیل؛ «خدا می‌شنود»
ishaq|پیامبر اسحاق؛ «او می‌خندد»
yaqub|پیامبر یعقوب
yusuf|پیامبر یوسف؛ «خدا می‌افزاید»
musa|پیامبر موسی
harun|پیامبر هارون، برادر موسی
dawud|پیامبر داوود؛ «محبوب»
sulayman|پیامبر سلیمان؛ «مرد صلح»
yunus|پیامبر یونس
ayyub|پیامبر ایوب، نمونه شکیبایی
yahya|پیامبر یحیی؛ «او زنده است»
zakariya|پیامبر زکریا
isa|پیامبر عیسی
nuh|پیامبر نوح؛ «آسایش، آرامش»
idris|پیامبر ادریس؛ اغلب با «درس» (آموختن) مرتبط دانسته می‌شود
hud|پیامبر هود، فرستاده به سوی قوم عاد
salih|نیکوکار؛ پیامبر صالح
shuayb|پیامبر شعیب، فرستاده به سوی مدین
ilyas|پیامبر الیاس
adam|پیامبر آدم، نخستین انسان
imran|خاندان عمران در قرآن؛ از «عمر»: زندگی، شکوفایی
luqman|لقمان حکیم که سوره‌ای به نام اوست
taha|حروف آغازین سوره طه
yasin|حروف آغازین سوره یس
abubakr|کنیه نخستین خلیفه، نزدیک‌ترین یار پیامبر
umar|عمر دراز؛ دومین خلیفه
uthman|سومین خلیفه؛ در اصل جوجه‌ی هوبره (پرنده)
ali|بلندمرتبه، والا
hasan|نیکو، زیبا
husayn|حسن کوچک: نیکو و خوش‌سیما
qasim|تقسیم‌کننده؛ یکی از پسران پیامبر ﷺ
jafar|جویبار، رودخانه کوچک
hamza|استوار، نیرومند؛ عموی پیامبر ﷺ
abbas|ترش‌رو؛ نامی برای شیر؛ عموی پیامبر ﷺ
khalid|جاودان، پایدار
bilal|طراوت؛ نخستین مؤذن اسلام
zayd|رشد؛ تنها صحابی که در قرآن نام او آمده است
saad|شادی، خوش‌اقبالی
said|شاد، خجسته
talha|نوعی درخت اقاقیا
zubayr|نیرومند، استوار
muadh|کسی که خدا او را پناه داده است
anas|انس، گرمی و صمیمیت
usama|شیر
ammar|آبادکننده و جان‌بخش یک مکان
yasir|آسان‌گیر، نرم‌خو
suhayb|سرخ‌مو
salman|ایمن، آرام
musab|رام‌نشدنی: دارای اراده قوی
jabir|مرهم‌گذار و دلداری‌دهنده
tamim|کامل، نیرومند
hakim|حکیم، فرزانه
hassaan|بسیار خوش‌سیما؛ شاعر پیامبر ﷺ
asim|نگهبان، پاسدار
safwan|صخره صاف و روشن
sahl|آسان، نرم
harith|کشاورز، کوشا
aamir|آباد، سرشار از زندگی
zahir|درخشان، شکوفا
zainulabidin|زینت عبادت‌کنندگان
tariq|مهمان شبانه؛ ستاره صبح
ayman|خجسته؛ سمت راست
ridwan|خشنودی (خدا)
ihsan|نیکوکاری، احسان
naim|نعمت، لذت
ramadan|ماه روزه
tawfiq|توفیقی که خدا عطا می‌کند
burhan|برهان، دلیل روشن
furqan|معیار جداسازی حق از باطل
najm|ستاره
waqar|وقار، آرامش
rayhan|گیاه خوشبو، ریحان
khalifa|جانشین، سرپرست
karim|بخشنده، بزرگوار
rashid|رشدیافته، هدایت‌شده
hadi|راهنما
fuad|دل
jamil|زیبا، خوش‌سیما
khalil|دوست نزدیک
mubarak|مبارک
muhsin|نیکوکار
munir|درخشان، روشن
siraj|چراغ
sabir|شکیبا
sadiq|راستگو
siddiq|بسیار راستگو
shakir|سپاسگزار
akram|بخشنده‌ترین، بزرگوارترین
amin|امین
badr|ماه کامل
bashir|مژده‌رسان
munib|بازگشت‌کننده به سوی خدا با توبه
salim|سالم، ایمن، کامل
halim|بردبار، نرم‌خو
taqi|پرهیزگار، خداترس
zaki|پاک
sajid|سجده‌کننده
shahid|گواه
mubashshir|مژده‌دهنده
kazim|فروبرنده خشم
amir|امیر، رهبر
nabil|نجیب
nuruddin|نور دین
salahuddin|شایستگی دین
shamsuddin|خورشید دین
saif|شمشیر
faisal|داور قاطع
fahd|یوزپلنگ
faris|سوار، شهسوار
habib|محبوب
haytham|جوجه عقاب
hisham|بخشندگی
jalal|شکوه، جلال
jamal|زیبایی، جمال
kamal|کمال
majid|بزرگوار، باشکوه
mansur|پیروز، یاری‌شده
marwan|سنگ چخماق: استوار
mazin|ابر باران‌زا
murad|آرزو، مقصود
nadir|کمیاب، گرانبها
nasir|یاور، پشتیبان
rayyan|سیراب؛ دروازه‌ای در بهشت برای روزه‌داران
riyad|باغ‌ها
sami|والا، بلندمرتبه
samir|همنشین گفتگوهای شبانه
sharif|شریف، گرامی
tahir|پاک
talal|باران نرم، شبنم
wasim|خوش‌سیما، برازنده
walid|نوزاد
ziyad|رشد، افزایش
zain|زیبایی، برازندگی
adil|دادگر، عادل
adnan|ساکن‌شونده؛ نیای عرب‌ها
anwar|درخشان‌تر
arif|آگاه، فرزانه
asad|شیر
basil|دلیر
hamid|ستایشگر خدا
hashim|نیای پیامبر ﷺ؛ «نان‌خردکن» (برای مهمانان)
imad|ستون، تکیه‌گاه
isam|پناه، نگهدارنده
junayd|سرباز کوچک
labib|هوشمند، دانا
malik|مالک؛ پادشاه
mahdi|هدایت‌شده
mahir|ماهر
mujahid|کوشنده در راه نیکی
najib|نجیب، اصیل‌زاده
nasim|نسیم ملایم
rafiq|همراه مهربان
raid|پیشگام، رهبر
rami|تیرانداز
wail|پناه‌جو
yamin|دست راست؛ برکت
zahid|قانع به اندک، زاهد
faruq|جداکننده حق از باطل؛ لقب عمر
husam|شمشیر برنده
jawad|بخشنده
muin|یاور
samih|بخشنده، گذشت‌کننده
shafiq|مهربان، دلسوز
hamdan|بسیار ستایشگر
zayed|فزاینده، فراوان
humaid|ستوده کوچک
obaid|بنده کوچک (خدا)
sultan|اقتدار، فرمانروا
kerem|بخشندگی، بزرگواری
shahin|شاهین
arslan|شیر (ترکی)
arman|آرزو، آرمان (فارسی)
kamran|کامیاب، خوش‌بخت (فارسی)
maryam|مادر پیامبر عیسی؛ تنها زنی که در قرآن نامش آمده است
asiya|همسر فرعون که قرآن او را به‌عنوان نمونه ستوده است
hajar|مادر اسماعیل؛ سعی او میان صفا و مروه در حج زنده است
sara|همسر ابراهیم؛ «شاهدخت»
hawwa|حوا، مادر انسان‌ها
khadija|نخستین همسر پیامبر ﷺ و نخستین ایمان‌آورنده به او
aisha|زنده، سرشار از زندگی
fatima|دختر پیامبر ﷺ؛ «بازگیرنده از شیر»
zahra|درخشان؛ لقب فاطمه
zaynab|دختر پیامبر ﷺ؛ اغلب به‌معنای گیاهی خوشبو دانسته می‌شود
ruqayya|بالارفتن؛ دختر پیامبر ﷺ
batul|وقف‌شده برای خدا؛ لقب مریم و فاطمه
hafsa|بچه‌شیر ماده؛ یکی از ام‌المؤمنین
safiyya|پاک؛ دوست برگزیده
maymuna|خجسته، میمون
salma|آرام، ایمن
sumayya|والا؛ نخستین شهید اسلام
asma|والا؛ همچنین «نام‌ها»
nusayba|از تبار نجیب؛ در احد از پیامبر ﷺ دفاع کرد
rufayda|یاری، پشتیبانی؛ نخستین پرستار در اسلام
baraka|برکت؛ نام ام ایمن
halima|بردبار، نرم‌خو؛ دایه پیامبر ﷺ
shayma|دارای خال زیبا؛ خواهر رضاعی پیامبر ﷺ
arwa|بز کوهی؛ عمه پیامبر ﷺ
hala|هاله اطراف ماه
hind|نام ام سلمه، یکی از ام‌المؤمنین
khawla|آهو؛ صحابیه‌ای که خدا شکایتش را شنید
mariya|ماریه قبطی، مادر ابراهیم فرزند پیامبر ﷺ
jamila|زیبا
amina|ایمن، در امان؛ مادر پیامبر ﷺ
sakina|آرامش، آسودگی درون
huda|هدایت
nur|نور
rahma|رحمت
iman|ایمان
amal|امید
jannah|باغ، بهشت
firdaws|برترین باغ بهشت
kawthar|فراوانی؛ رودی در بهشت
salsabil|چشمه‌ای در بهشت
tasnim|چشمه‌ای در بهشت
bushra|مژده
isra|سفر شبانه؛ نام سوره ۱۷
jana|میوه رسیده آماده چیدن
lina|نخل نازک
marwa|سنگ سفید؛ تپه مروه در کنار کعبه
rawda|باغ، چمنزار
rayhana|ریحان، گیاه خوشبو
sadiqa|راستگو
sabira|شکیبا
sana|درخشش، فروغ
yusra|آسانی
aliya|والا، بلندمرتبه
aya|نشانه؛ آیه قرآن
bayan|روشنی، شیوایی
duaa|دعا
hanan|مهربانی، دلسوزی
lulua|مروارید
nuha|خرد، فهم
radiya|راضی، خشنود
mardiyya|آن‌که خدا از او خشنود است
sahar|ساعت پیش از سپیده‌دم
salwa|تسلی؛ بلدرچین‌هایی که خدا برای بنی‌اسرائیل فرستاد
shifa|شفا
sidra|درخت سدر (سدرةالمنتهی)
taqwa|تقوا، خداآگاهی
duha|روشنایی چاشتگاه
fajr|سپیده‌دم
ghufran|آمرزش
husna|زیباترین، بهترین
qamar|ماه
raghad|زندگی فارغ‌بال و پرنعمت
sundus|ابریشم نازک (بهشتی)
qurratulayn|روشنی و شادی چشم
qanita|فرمانبردار با خشوع
abida|عبادت‌کننده
hana|شادی، خوشی
hiba|هدیه
ilham|الهام
inaya|توجه، دلسوزی
inas|انس، گرمی و صمیمیت
jumana|مروارید نقره‌ای
layla|شب
lubna|درخت استوراکس (صمغ خوشبو)
lujayn|نقره
manal|دستیابی، کامیابی
safa|پاکی، صفا
maysa|خوش‌خرام
muna|آرزوها، امیدها
nada|شبنم؛ بخشندگی
najla|درشت‌چشم و زیبا
nawal|بخشش، لطف
rania|نگاه‌کننده با شادی
reem|آهوی سفید
samira|همنشین گفتگوهای شبانه
wafa|وفا، وفاداری
afaf|عفت، پاکدامنی
abir|عطر
amira|شاهدخت
anisa|همراه صمیمی
basma|لبخند
daliya|تاک انگور
dana|مروارید درشت
farah|شادی
ghada|دوشیزه برازنده
habiba|محبوبه
hadil|آواز کبوتران
hayat|زندگی
ibtisam|لبخندزن
joud|بخشندگی
kamila|کامل، بی‌نقص
karima|بخشنده، بزرگوار
lamis|نرم در لمس
latifa|لطیف، مهربان
layan|نرمی، ملایمت
maha|گوزن عربی (اوریکس) که به چشمان زیبایش شهرت دارد
malika|ملکه
maram|آرزو، خواسته
munira|درخشان
nabila|نجیب
nafisa|گرانبها، نفیس
naima|آسایش، شادمانی ملایم
najwa|گفتگوی صمیمانه
rabia|چهارمین؛ رابعه عدویه
rahima|مهربان
raja|امید
rasha|بچه‌آهو
ruba|تپه‌ها
ruwayda|آرام‌خرام
sabah|بامداد
samar|گفتگوی شبانه
thurayya|ثریا (خوشه ستاره‌ای)
widad|مهر، دوستی
wijdan|احساس، وجدان
yumna|خجسته؛ دست راست
zakiyya|پاک
zubayda|بهترین بخش (در اصل: سرشیر)؛ برای حاجیان آب‌رسانی ساخت
hamida|ستوده
hasna|زیبا
kenza|گنج
naila|دستیابنده به نیکی
rahaf|ظرافت، حساسیت
samiha|بخشنده، گذشت‌کننده
tahira|پاک
nurulayn|نور چشم
sajida|سجده‌کننده
hira|غار حرا که وحی از آنجا آغاز شد
areej|عطر
dima|باران نرم و پایدار
ghaliya|گرانبها، عزیز
hayfa|باریک‌اندام، برازنده
leen|نرمی
tuqa|تقوا، پارسایی
waad|وعده
shahd|عسل در شان
hidaya|هدایت
salima|سالم، ایمن
alya|بلندی‌ها، والایی
warda|گل سرخ
zaina|زینت، زیبایی
inshirah|شرح صدر، گشایش دل
yasmin|یاس
nasrin|نسترن (فارسی)
fayruz|فیروزه (سنگ گرانبها، فارسی)
sawsan|سوسن
narjis|نرگس (گل)
shirin|شیرین، دلنشین (فارسی)
laleh|لاله (فارسی)
mahnoor|نور ماه (فارسی-عربی)
elif|الف، نخستین حرف الفبا`,
  ps: `muhammad|ډېر ستایل شوی
ahmad|تر ټولو ستاینې وړ
mahmud|ستایل شوی، د ستاینې وړ
mustafa|غوره شوی
abdullah|د الله بنده
abdurrahman|د ډېر مهربان بنده
abdurrahim|د ځانګړي رحم کوونکي بنده
abdulaziz|د ځواکمن او بریالي بنده
abdulmalik|د پاچا بنده
abdulkarim|د ډېر سخي بنده
abdulhamid|د ستاینې وړ بنده
abdulqadir|د هر څه په کولو توانا بنده
abdussalam|د سولې د سرچینې بنده
abdulwahhab|د ډېر بخښونکي بنده
abdulghani|د بې نیازه بنده
abdullatif|د نرم او مهربان بنده
abdulhadi|د لارښود بنده
abdulbasit|د روزۍ پراخوونکي بنده
abdulwahid|د یوه بنده
abdulfattah|د پرانیستونکي بنده
abdulmajid|د ستر او باعزته بنده
abdulhayy|د تل ژوندي بنده
abdulwadud|د مینې کوونکي بنده
abdulghafur|د ډېر بخښونکي بنده
ibrahim|پیغمبر ابراهیم، د الله نژدې ملګری
ismail|پیغمبر اسماعیل؛ «الله اوري»
ishaq|پیغمبر اسحاق؛ «ده خاندي»
yaqub|پیغمبر یعقوب
yusuf|پیغمبر یوسف؛ «الله زیاتوي»
musa|پیغمبر موسی
harun|پیغمبر هارون، د موسی ورور
dawud|پیغمبر داود؛ «ګران»
sulayman|پیغمبر سلیمان؛ «د سولې سړی»
yunus|پیغمبر یونس
ayyub|پیغمبر ایوب، د صبر بېلګه
yahya|پیغمبر یحیی؛ «ده ژوند کوي»
zakariya|پیغمبر زکریا
isa|پیغمبر عیسی
nuh|پیغمبر نوح؛ «آرام، راحت»
idris|پیغمبر ادریس؛ ډېر ځله له «درس» (زده کړې) سره تړل کېږي
hud|پیغمبر هود، چې د عاد قوم ته ولېږل شو
salih|نیک؛ پیغمبر صالح
shuayb|پیغمبر شعیب، چې مدین ته ولېږل شو
ilyas|پیغمبر الیاس
adam|پیغمبر آدم، لومړی انسان
imran|په قرآن کې د عمران کورنۍ؛ له «عمر» (ژوند، ودې) څخه
luqman|حکیم لقمان، چې یوه سوره یې په نوم ده
taha|د طه د سورې پیل توري
yasin|د یس د سورې پیل توري
abubakr|د لومړي خلیفه، تر ټولو نژدې ملګري کنیه
umar|اوږد عمر؛ دویم خلیفه
uthman|دریم خلیفه؛ په اصل کې د تلور (مرغۍ) کوچنی چوچه
ali|لوړ، عالي
hasan|ښه، ښکلی
husayn|کوچنی حسن: ښه او ښکلی
qasim|وېشونکی؛ د پیغمبر ﷺ یو زوی
jafar|ویاله، کوچنۍ سیند
hamza|ثابت قدم، ځواکمن؛ د پیغمبر ﷺ تره
abbas|ترخه تندی؛ د زمري یو نوم؛ د پیغمبر ﷺ تره
khalid|تلپاتې، همېشنی
bilal|تازګي؛ د اسلام لومړی مؤذن
zayd|زیاتوالی، وده؛ یوازینی صحابي چې په قرآن کې نوم یې راغلی
saad|خوشالي، نیکمرغي
said|خوشاله، مبارک
talha|د اقاقیا یو ډول ونه
zubayr|ځواکمن، پیاوړی
muadh|هغه څوک چې الله پناه ورکړې وي
anas|مینه، تودوخه
usama|زمری
ammar|هغه څوک چې یو ځای ودانوي او ژوند ورکوي
yasir|اسانه، نرم طبیعت
suhayb|سرو ويښتانو لرونکی
salman|په امن کې، آرام
musab|سخت رام کېدونکی: پياوړي اراده لرونکی
jabir|جوړوونکی او ډاډ ورکوونکی
tamim|بشپړ، پیاوړی
hakim|هوښیار
hassaan|ډېر ښکلی؛ د پیغمبر ﷺ شاعر
asim|ساتونکی، ساتندوی
safwan|پاکه، هواره ډبره
sahl|اسانه، نرم
harith|بزګر، هڅه کوونکی
aamir|ودان، د ژوند ډک
zahir|روښانه، ګل کوونکی
zainulabidin|د عبادت کوونکو ښکلا
tariq|د شپې میلمه؛ د سهار ستورى
ayman|مبارک؛ ښي خوا
ridwan|د (الله) رضا
ihsan|نیکي، ښه کار کول
naim|نعمت، خوند
ramadan|د روژې میاشت
tawfiq|هغه بریا چې الله یې ورکړي
burhan|دلیل، څرګند ثبوت
furqan|هغه معیار چې حق او باطل جلا کوي
najm|ستورى
waqar|وقار، درنوالی
rayhan|خوشبويه بوټی، ریحان
khalifa|ځایناستی، نائب
karim|سخي، شریف
rashid|په سمه لار تلونکی
hadi|لارښود
fuad|زړه
jamil|ښکلی
khalil|نژدې ملګری
mubarak|مبارک
muhsin|هغه چې نیکي په غوره ډول کوي
munir|روښانه، ځلانده
siraj|څراغ
sabir|صابر
sadiq|رښتینی
siddiq|ډېر رښتینی
shakir|شکر ګزار
akram|تر ټولو سخي، تر ټولو شریف
amin|امانتدار
badr|بشپړه سپوږمۍ
bashir|زېري ورکوونکی
munib|هغه چې په توبه الله ته رجوع کوي
salim|روغ، خوندي، بشپړ
halim|ډېر زغم لرونکی، نرم
taqi|پرهېزګار، له الله وېرېدونکی
zaki|پاک
sajid|سجده کوونکی
shahid|شاهد
mubashshir|زېری ورکوونکی
kazim|خپل غوسه خوړونکی
amir|امیر، مشر
nabil|شریف
nuruddin|د دین نور
salahuddin|د دین نیکوالی
shamsuddin|د دین لمر
saif|توره
faisal|پرېکړه کوونکی
fahd|چیتا
faris|سوار، اس سپور
habib|ګران
haytham|د عقاب چوچه
hisham|سخاوت
jalal|جلال، عظمت
jamal|جمال، ښکلا
kamal|کمال، بشپړتیا
majid|ستر، باعزته
mansur|بریالی، مرسته شوی
marwan|چقماق ډبره: پیاوړی
mazin|د باران وریځ
murad|هیله، موخه
nadir|نادر، قیمتي
nasir|مرستندوی، ملاتړی
rayyan|ښه خړوب شوی؛ د جنت یو دروازه د روژه نیوونکو لپاره
riyad|باغونه
sami|لوړ، عالي
samir|د ماښام د خبرو ملګری
sharif|شریف، محترم
tahir|پاک
talal|نرم باران، شبنم
wasim|ښکلی، ښایسته
walid|نوی زېږېدلی
ziyad|زیاتوالی، ډېرښت
zain|ښکلا، ښایست
adil|عادل
adnan|میشته؛ د عربو نیکه
anwar|تر نورو روښانه
arif|پوه، هوښیار
asad|زمری
basil|زړور
hamid|د الله ستاینه کوونکی
hashim|د پیغمبر ﷺ نیکه؛ «ډوډۍ ماتوونکی» (د میلمنو لپاره)
imad|ستن، ملاتړ
isam|ساتنه، پناه
junayd|کوچنی عسکر
labib|هوښیار، عاقل
malik|مالک؛ پاچا
mahdi|هدایت شوی
mahir|ماهر
mujahid|د نیکۍ لپاره هڅه کوونکی
najib|شریف، اصیل
nasim|نرمه سیلۍ
rafiq|مهربان ملګری
raid|مخکښ، مشر
rami|غشی ویشتونکی
wail|پناه غوښتونکی
yamin|ښي لاس؛ برکت
zahid|په لږ قناعت کوونکی، زاهد
faruq|هغه چې حق او باطل جلا کوي؛ د عمر لقب
husam|تېره توره
jawad|سخي
muin|مرستندوی
samih|سخي، بخښونکی
shafiq|مهربان، زړه سوی
hamdan|ډېر ستاینه کوونکی
zayed|زیاتیدونکی، ډېر
humaid|کوچنی ستایل شوی
obaid|کوچنی بنده (د الله)
sultan|واک، واکمن
kerem|سخاوت، شرافت
shahin|شاهین
arslan|زمری (ترکي)
arman|هیله، ارمان (فارسي)
kamran|بریالی، نیکمرغه (فارسي)
maryam|د پیغمبر عیسی مور؛ یوازینۍ ښځه چې په قرآن کې په نوم یادېږي
asiya|د فرعون ښځه، چې قرآن د بېلګې په توګه ستایلې ده
hajar|د اسماعیل مور؛ د صفا او مروې تر منځ د هغې لټون په حج کې اوس هم ژوندی دی
sara|د ابراهیم ښځه؛ «شهزادګۍ»
hawwa|حوا، د انسانانو مور
khadija|د پیغمبر ﷺ لومړۍ ښځه او هغه چې لومړی پر ده ایمان راوړ
aisha|ژوندۍ، د ژوند ډکه
fatima|د پیغمبر ﷺ لور؛ «له شیدو بېله کوونکې»
zahra|روښانه؛ د فاطمې لقب
zaynab|د پیغمبر ﷺ لور؛ ډېر ځله د خوشبويه بوټي په معنا تشریح کېږي
ruqayya|پورته کېدل؛ د پیغمبر ﷺ لور
batul|الله ته وقف شوې؛ د مریم او فاطمې لقب
hafsa|ځوانه ښځینه زمرۍ؛ د مومنانو له مورګانو یوه
safiyya|پاکه؛ غوره شوې ملګرې
maymuna|مبارکه
salma|آرامه، په امن کې
sumayya|لوړه؛ د اسلام لومړۍ شهیده
asma|لوړه؛ همدارنګه «نومونه»
nusayba|د شریفې کورنۍ؛ په احد کې یې د پیغمبر ﷺ دفاع وکړه
rufayda|مرسته، ملاتړ؛ د اسلام لومړۍ نرسه
baraka|برکت؛ د ام ایمن نوم
halima|ډېره زغملې، نرمه؛ د پیغمبر ﷺ شېدې پیاونې
shayma|خال لرونکې؛ د پیغمبر ﷺ شېدې خور
arwa|غرنۍ وزه؛ د پیغمبر ﷺ ترور
hala|د سپوږمۍ شاوخوا هاله
hind|د ام سلمې نوم، د مومنانو له مورګانو یوې
khawla|غزال؛ هغه صحابیه چې الله یې فریاد واورېد
mariya|قبطي ماریه، د پیغمبر ﷺ د زوی ابراهیم مور
jamila|ښکلې
amina|په امن کې، خوندي؛ د پیغمبر ﷺ مور
sakina|آرامي، د زړه سکون
huda|هدایت
nur|نور
rahma|رحمت
iman|ایمان
amal|هیله
jannah|باغ، جنت
firdaws|د جنت تر ټولو لوړ باغ
kawthar|ډېروالی؛ په جنت کې یو سیند
salsabil|په جنت کې یوه چینه
tasnim|په جنت کې یوه چینه
bushra|زېری
isra|د شپې سفر؛ د ۱۷ سورې نوم
jana|پخه میوه چې د ټولولو لپاره چمتو ده
lina|نازک د کجورې ونه
marwa|سپینه ډبره؛ د کعبې ترڅنګ د مروې غونډۍ
rawda|باغ، چمن
rayhana|ریحان، خوشبويه بوټی
sadiqa|رښتینې
sabira|صابره
sana|ځلا، روښانتیا
yusra|اسانتیا
aliya|لوړه، عالي
aya|نښه؛ د قرآن آیت
bayan|څرګندونه، فصاحت
duaa|دعا
hanan|مهرباني، زړه سوی
lulua|مروارید
nuha|عقل، پوهه
radiya|راضي، خوشاله
mardiyya|هغه چې الله ترې راضي وي
sahar|د سحر مخکې ساعت
salwa|تسلی؛ هغه سلواګانې چې الله بني اسرائیلو ته ولېږلې
shifa|شفا
sidra|د بیر ونه (سدرة المنتهی)
taqwa|تقوا، د الله ویره
duha|د چاشت رڼا
fajr|سحر
ghufran|بخښنه
husna|تر ټولو ښکلې، تر ټولو غوره
qamar|سپوږمۍ
raghad|بې غمه او ښه ژوند
sundus|نرمه ورېښم (د جنت)
qurratulayn|د سترګو سړوالی او خوښي
qanita|مطیعه عابده
abida|عبادت کوونکې
hana|خوښي، خوشالي
hiba|ډالۍ
ilham|الهام
inaya|پام، پاملرنه
inas|مینه، تودوخه
jumana|سپینزرو مروارید
layla|شپه
lubna|د اسټوراکس ونه (خوشبويه صمغ)
lujayn|سپین زر
manal|لاسته راوړنه، بریا
safa|پاکوالی، صفا
maysa|ښایسته خرامانه
muna|هیلې، ارمانونه
nada|شبنم؛ سخاوت
najla|لویو او ښکلو سترګو لرونکې
nawal|ډالۍ، احسان
rania|په خوښۍ کتونکې
reem|سپین غزال
samira|د ماښام د خبرو ملګرې
wafa|وفا، وفاداري
afaf|پاکلمني، حیا
abir|عطر
amira|شهزادګۍ
anisa|مهربانه ملګرې
basma|موسکا
daliya|د انګورو بیل
dana|لوی مروارید
farah|خوښي
ghada|ښایسته ځوانه نجلۍ
habiba|ګرانه
hadil|د کوترو ږغ
hayat|ژوند
ibtisam|موسکۍ
joud|سخاوت
kamila|بشپړه، کامله
karima|سخي، شریفه
lamis|په لمس کې نرمه
latifa|نرمه، مهربانه، لطیفه
layan|نرمي، نازکي
maha|عربي اوریکس، چې د خپلو ښکلو سترګو له امله مشهور دی
malika|ملکه
maram|هیله، ارمان
munira|روښانه
nabila|شریفه
nafisa|قیمتي، نفیسه
naima|آرام، نرمه خوښي
najwa|محرمانه خبرې
rabia|څلورمه؛ رابعه عدویه
rahima|مهربانه
raja|هیله
rasha|غزال ځوان
ruba|غونډۍ
ruwayda|په نرمۍ خرامانه
sabah|سهار
samar|د ماښام خبرې
thurayya|ثریا (د ستورو ډله)
widad|مینه، محبت
wijdan|احساس، ضمیر
yumna|مبارکه؛ ښي لاس
zakiyya|پاکه
zubayda|غوره برخه (په لغوي ډول: ملاسه)؛ د حاجیانو لپاره یې اوبه رسونې جوړې کړې
hamida|ستایل شوې
hasna|ښکلې
kenza|خزانه
naila|هغه چې ښه ترلاسه کوي
rahaf|نازکي، حساسیت
samiha|سخي، بخښونکې
tahira|پاکه
nurulayn|د سترګو نور
sajida|سجده کوونکې
hira|د حرا غار، چې وحې پکې پیل شو
areej|عطر
dima|نرم او اوږد باران
ghaliya|قیمتي، ګرانه
hayfa|نازک ملا، ښایسته
leen|نرمي
tuqa|تقوا، پرهېزګاري
waad|وعده
shahd|په چتر کې شات
hidaya|هدایت
salima|روغه، خوندي
alya|لوړوالی، عظمت
warda|ګل
zaina|ښکلا، ښایست
inshirah|شرح صدر، د زړه پراخوالی
yasmin|یاسمین
nasrin|وحشي ګل (فارسي)
fayruz|فیروزه (قیمتي ډبره، فارسي)
sawsan|سوسن
narjis|نرګس (ګل)
shirin|خوږه، مهربانه (فارسي)
laleh|لاله (فارسي)
mahnoor|د سپوږمۍ رڼا (فارسي-عربي)
elif|الف، د ابجد لومړی توری`,
  fr: `muhammad|le très loué
ahmad|le plus digne de louange
mahmud|loué, digne de louange
mustafa|l'élu
abdullah|serviteur d'Allah
abdurrahman|serviteur du Tout Miséricordieux
abdurrahim|serviteur du Particulièrement Miséricordieux
abdulaziz|serviteur du Tout-Puissant
abdulmalik|serviteur du Roi
abdulkarim|serviteur du Très Généreux
abdulhamid|serviteur du Digne de louange
abdulqadir|serviteur de Celui qui peut tout
abdussalam|serviteur de la Source de paix
abdulwahhab|serviteur du Dispensateur
abdulghani|serviteur de l'Autosuffisant
abdullatif|serviteur du Subtil, du Bienveillant
abdulhadi|serviteur du Guide
abdulbasit|serviteur de Celui qui étend les biens
abdulwahid|serviteur de l'Unique
abdulfattah|serviteur de Celui qui ouvre
abdulmajid|serviteur du Glorieux
abdulhayy|serviteur du Vivant éternel
abdulwadud|serviteur de l'Affectueux
abdulghafur|serviteur du Pardonneur
ibrahim|le prophète Abraham, l'ami proche d'Allah
ismail|le prophète Ismaël ; « Dieu entend »
ishaq|le prophète Isaac ; « il rit »
yaqub|le prophète Jacob
yusuf|le prophète Joseph ; « Dieu ajoute »
musa|le prophète Moïse
harun|le prophète Aaron, frère de Moïse
dawud|le prophète David ; « bien-aimé »
sulayman|le prophète Salomon ; « homme de paix »
yunus|le prophète Jonas
ayyub|le prophète Job, modèle de patience
yahya|le prophète Jean ; « il vit »
zakariya|le prophète Zacharie
isa|le prophète Jésus
nuh|le prophète Noé ; « repos, réconfort »
idris|le prophète Idris ; souvent rattaché à « dars » (étude)
hud|le prophète Hud, envoyé au peuple de 'Ad
salih|juste, vertueux ; le prophète Salih
shuayb|le prophète Chouaïb, envoyé à Madyan
ilyas|le prophète Élie
adam|le prophète Adam, le premier être humain
imran|la famille de 'Imran dans le Coran ; de 'umr : vie, épanouissement
luqman|Luqman le Sage, qui a donné son nom à une sourate
taha|les lettres initiales de la sourate Ta-Ha
yasin|les lettres initiales de la sourate Ya-Sin
abubakr|la kunya du premier calife, le plus proche compagnon
umar|longue vie ; le deuxième calife
uthman|le troisième calife ; à l'origine un jeune outardeau (oiseau)
ali|élevé, sublime
hasan|bon, beau
husayn|petit Hasan : le bon, le beau
qasim|celui qui répartit ; un fils du Prophète ﷺ
jafar|ruisseau, petit cours d'eau
hamza|ferme, fort ; oncle du Prophète ﷺ
abbas|à l'air sévère ; un nom du lion ; oncle du Prophète ﷺ
khalid|éternel, durable
bilal|fraîcheur ; le premier muezzin de l'islam
zayd|croissance ; le seul compagnon nommé dans le Coran
saad|bonheur, bonne fortune
said|heureux, béni
talha|une sorte d'acacia
zubayr|fort, solide
muadh|celui qu'Allah protège
anas|amabilité, chaleur humaine
usama|lion
ammar|celui qui bâtit un lieu et lui donne vie
yasir|facile à vivre, indulgent
suhayb|aux cheveux roux
salman|sain et sauf, paisible
musab|difficile à dompter : à la volonté ferme
jabir|celui qui répare et console
tamim|complet, fort
hakim|sage
hassaan|très beau ; poète du Prophète ﷺ
asim|protecteur, gardien
safwan|roche claire et lisse
sahl|facile, doux
harith|cultivateur, celui qui s'efforce
aamir|florissant, plein de vie
zahir|rayonnant, en fleur
zainulabidin|parure des adorateurs
tariq|visiteur de la nuit ; étoile du matin
ayman|béni ; le côté droit
ridwan|bon plaisir (d'Allah)
ihsan|excellence, faire le bien
naim|félicité, délice
ramadan|le mois du jeûne
tawfiq|réussite accordée par Allah
burhan|preuve, évidence
furqan|le critère qui distingue le vrai du faux
najm|étoile
waqar|dignité, calme
rayhan|plante parfumée, basilic
khalifa|successeur, intendant
karim|généreux, noble
rashid|bien guidé
hadi|guide
fuad|cœur
jamil|beau
khalil|ami proche
mubarak|béni
muhsin|celui qui fait le bien avec excellence
munir|rayonnant, lumineux
siraj|lampe
sabir|patient
sadiq|véridique
siddiq|éminemment véridique
shakir|reconnaissant
akram|le plus généreux, le plus noble
amin|digne de confiance
badr|pleine lune
bashir|porteur de bonne nouvelle
munib|celui qui revient à Allah par le repentir
salim|sain, sauf, entier
halim|clément, doux
taqi|pieux, conscient d'Allah
zaki|pur
sajid|celui qui se prosterne (dans la prière)
shahid|témoin
mubashshir|annonciateur de bonnes nouvelles
kazim|celui qui retient sa colère
amir|prince, chef
nabil|noble
nuruddin|lumière de la foi
salahuddin|droiture de la foi
shamsuddin|soleil de la foi
saif|épée
faisal|celui qui juge avec fermeté
fahd|guépard
faris|chevalier, cavalier
habib|bien-aimé
haytham|jeune aigle
hisham|générosité
jalal|majesté
jamal|beauté
kamal|perfection
majid|glorieux, noble
mansur|victorieux, soutenu
marwan|silex : ferme
mazin|nuage de pluie
murad|souhait, but
nadir|rare, précieux
nasir|soutien, partisan
rayyan|bien arrosé ; une porte du Paradis pour ceux qui jeûnent
riyad|jardins
sami|élevé, sublime
samir|compagnon des veillées
sharif|noble, honorable
tahir|pur
talal|pluie fine, rosée
wasim|beau, gracieux
walid|nouveau-né
ziyad|croissance, accroissement
zain|beauté, grâce
adil|juste, équitable
adnan|celui qui s'installe ; ancêtre des Arabes
anwar|plus lumineux
arif|connaisseur, sage
asad|lion
basil|brave
hamid|celui qui loue Allah
hashim|arrière-grand-père du Prophète ﷺ ; « celui qui émiette le pain » (pour ses hôtes)
imad|pilier, soutien
isam|sauvegarde
junayd|petit soldat
labib|intelligent, sage
malik|propriétaire ; roi
mahdi|bien guidé
mahir|habile
mujahid|celui qui s'efforce pour le bien
najib|noble, de noble naissance
nasim|brise douce
rafiq|compagnon bienveillant
raid|pionnier, chef
rami|archer
wail|celui qui cherche refuge
yamin|main droite ; bénédiction
zahid|content de peu, ascète
faruq|celui qui distingue le vrai du faux ; titre d'Umar
husam|épée tranchante
jawad|généreux
muin|aide, soutien
samih|généreux, indulgent
shafiq|compatissant, bon
hamdan|celui qui loue beaucoup
zayed|croissant, abondant
humaid|petit loué
obaid|petit serviteur (d'Allah)
sultan|autorité, souverain
kerem|générosité, noblesse
shahin|faucon
arslan|lion (turc)
arman|souhait, idéal (persan)
kamran|réussi, fortuné (persan)
maryam|mère du prophète Jésus ; la seule femme nommée dans le Coran
asiya|épouse de Pharaon, louée dans le Coran comme exemple
hajar|mère d'Ismaël ; sa quête entre Safa et Marwa se perpétue dans le Hajj
sara|épouse d'Abraham ; « princesse »
hawwa|Ève, mère de l'humanité
khadija|première épouse du Prophète ﷺ et première à croire en lui
aisha|vivante, pleine de vie
fatima|fille du Prophète ﷺ ; « celle qui sevre »
zahra|la radieuse ; titre de Fatima
zaynab|fille du Prophète ﷺ ; souvent expliqué comme une plante parfumée
ruqayya|ascension ; fille du Prophète ﷺ
batul|vouée à Allah ; titre de Maryam et de Fatima
hafsa|jeune lionne ; l'une des mères des croyants
safiyya|pure ; amie choisie
maymuna|bénie, de bon augure
salma|paisible, en sécurité
sumayya|élevée ; la première martyre de l'islam
asma|élevée ; aussi « noms »
nusayba|de noble lignée ; a défendu le Prophète ﷺ à Uhud
rufayda|aide, soutien ; la première infirmière de l'islam
baraka|bénédiction ; le nom d'Umm Ayman
halima|douce, indulgente ; nourrice du Prophète ﷺ
shayma|au grain de beauté ; sœur de lait du Prophète ﷺ
arwa|bouquetin ; tante du Prophète ﷺ
hala|halo autour de la lune
hind|nom d'Umm Salama, l'une des mères des croyants
khawla|gazelle ; la compagne dont Allah a entendu la plainte
mariya|Mariya la Copte, mère du fils du Prophète ﷺ, Ibrahim
jamila|belle
amina|en sécurité, protégée ; mère du Prophète ﷺ
sakina|sérénité, paix intérieure
huda|guidance
nur|lumière
rahma|miséricorde
iman|foi
amal|espoir
jannah|jardin, Paradis
firdaws|le plus haut jardin du Paradis
kawthar|abondance ; un fleuve du Paradis
salsabil|une source du Paradis
tasnim|une source du Paradis
bushra|bonne nouvelle
isra|le voyage nocturne ; nom de la sourate 17
jana|fruit mûr prêt à être cueilli
lina|palmier tendre
marwa|pierre blanche ; la colline de Marwa près de la Kaaba
rawda|jardin, prairie
rayhana|basilic, plante parfumée
sadiqa|véridique
sabira|patiente
sana|éclat, splendeur
yusra|aisance
aliya|élevée, sublime
aya|signe ; verset du Coran
bayan|clarté, éloquence
duaa|invocation
hanan|tendresse, compassion
lulua|perle
nuha|intelligence, discernement
radiya|satisfaite, contente
mardiyya|celle qui est agréable à Allah
sahar|l'heure qui précède l'aube
salwa|réconfort ; les cailles qu'Allah envoya aux Enfants d'Israël
shifa|guérison
sidra|jujubier (Sidrat al-Muntaha)
taqwa|conscience d'Allah
duha|lumière du matin
fajr|aube
ghufran|pardon
husna|la plus belle, la meilleure
qamar|lune
raghad|vie insouciante et abondante
sundus|soie fine (du Paradis)
qurratulayn|réconfort et joie des yeux
qanita|pieusement obéissante
abida|adoratrice
hana|bonheur, félicité
hiba|don
ilham|inspiration
inaya|soin, attention
inas|amabilité, chaleur humaine
jumana|perle d'argent
layla|nuit
lubna|styrax (résine parfumée)
lujayn|argent
manal|accomplissement, réussite
safa|pureté, clarté
maysa|à la démarche gracieuse
muna|souhaits, espoirs
nada|rosée ; générosité
najla|aux grands et beaux yeux
nawal|don, faveur
rania|celle qui regarde (avec joie)
reem|gazelle blanche
samira|compagne des veillées
wafa|loyauté, fidélité
afaf|pudeur, chasteté
abir|parfum
amira|princesse
anisa|compagne aimable
basma|sourire
daliya|vigne
dana|grosse perle
farah|joie
ghada|jeune femme gracieuse
habiba|bien-aimée
hadil|roucoulement des colombes
hayat|vie
ibtisam|souriante
joud|générosité
kamila|complète, parfaite
karima|généreuse, noble
lamis|douce au toucher
latifa|douce, bonne, subtile
layan|douceur, souplesse
maha|oryx d'Arabie, connu pour ses beaux yeux
malika|reine
maram|aspiration, souhait
munira|rayonnante
nabila|noble
nafisa|précieuse
naima|réconfort, douce félicité
najwa|confidence
rabia|la quatrième ; Rabi'a al-'Adawiyya
rahima|miséricordieuse
raja|espoir
rasha|jeune gazelle
ruba|collines
ruwayda|douce, à la démarche légère
sabah|matin
samar|conversation du soir
thurayya|les Pléiades (amas d'étoiles)
widad|amour, affection
wijdan|sentiment, conscience
yumna|bénie ; main droite
zakiyya|pure
zubayda|la meilleure part (littéralement : la crème) ; a fait construire des ouvrages d'eau pour les pèlerins
hamida|digne de louange
hasna|belle
kenza|trésor
naila|celle qui obtient le bien
rahaf|délicatesse, sensibilité
samiha|généreuse, indulgente
tahira|pure
nurulayn|lumière des yeux
sajida|celle qui se prosterne (dans la prière)
hira|la grotte de Hira, où la révélation a commencé
areej|parfum
dima|pluie douce et durable
ghaliya|précieuse, chère
hayfa|svelte, gracieuse
leen|douceur
tuqa|piété
waad|promesse
shahd|miel en rayon
hidaya|guidance
salima|saine, sauve
alya|hauteurs, élévation
warda|rose
zaina|parure, beauté
inshirah|soulagement et ouverture du cœur
yasmin|jasmin
nasrin|églantine (persan)
fayruz|turquoise (pierre précieuse, persan)
sawsan|lys
narjis|narcisse (fleur)
shirin|doux, charmant (persan)
laleh|tulipe (persan)
mahnoor|clair de lune (persan-arabe)
elif|Alif, la première lettre de l'alphabet`,
  es: `muhammad|el muy alabado
ahmad|el más digno de alabanza
mahmud|alabado, digno de alabanza
mustafa|el elegido
abdullah|siervo de Allah
abdurrahman|siervo del Misericordioso
abdurrahim|siervo del Especialmente Misericordioso
abdulaziz|siervo del Todopoderoso
abdulmalik|siervo del Rey
abdulkarim|siervo del Generosísimo
abdulhamid|siervo del Digno de alabanza
abdulqadir|siervo del Omnipotente
abdussalam|siervo de la Fuente de la paz
abdulwahhab|siervo del Dadivoso
abdulghani|siervo del Autosuficiente
abdullatif|siervo del Sutil, el Bondadoso
abdulhadi|siervo del Guía
abdulbasit|siervo de Quien ensancha el sustento
abdulwahid|siervo del Único
abdulfattah|siervo del Que abre
abdulmajid|siervo del Glorioso
abdulhayy|siervo del Eterno Viviente
abdulwadud|siervo del Amoroso
abdulghafur|siervo del Perdonador
ibrahim|el profeta Abraham, amigo íntimo de Allah
ismail|el profeta Ismael; «Dios escucha»
ishaq|el profeta Isaac; «él ríe»
yaqub|el profeta Jacob
yusuf|el profeta José; «Dios aumenta»
musa|el profeta Moisés
harun|el profeta Aarón, hermano de Moisés
dawud|el profeta David; «amado»
sulayman|el profeta Salomón; «hombre de paz»
yunus|el profeta Jonás
ayyub|el profeta Job, ejemplo de paciencia
yahya|el profeta Juan; «él vive»
zakariya|el profeta Zacarías
isa|el profeta Jesús
nuh|el profeta Noé; «descanso, consuelo»
idris|el profeta Idris; a menudo relacionado con «dars» (estudio)
hud|el profeta Hud, enviado al pueblo de 'Ad
salih|justo, virtuoso; el profeta Salih
shuayb|el profeta Shuaib, enviado a Madyán
ilyas|el profeta Elías
adam|el profeta Adán, el primer ser humano
imran|la familia de 'Imran en el Corán; de 'umr: vida, florecimiento
luqman|Luqman el Sabio, que da nombre a una sura
taha|las letras iniciales de la sura Ta-Ha
yasin|las letras iniciales de la sura Ya-Sin
abubakr|la kunya del primer califa, el compañero más cercano
umar|larga vida; el segundo califa
uthman|el tercer califa; originalmente una cría de avutarda (ave)
ali|elevado, sublime
hasan|bueno, hermoso
husayn|pequeño Hasan: el bueno, el apuesto
qasim|el que reparte; un hijo del Profeta ﷺ
jafar|arroyo, riachuelo
hamza|firme, fuerte; tío del Profeta ﷺ
abbas|de aspecto severo; un nombre del león; tío del Profeta ﷺ
khalid|eterno, duradero
bilal|frescura; el primer almuédano del islam
zayd|crecimiento; el único compañero nombrado en el Corán
saad|felicidad, buena fortuna
said|feliz, bendecido
talha|una especie de acacia
zubayr|fuerte, firme
muadh|el que Allah protege
anas|cordialidad, calidez
usama|león
ammar|el que construye un lugar y le da vida
yasir|de trato fácil, indulgente
suhayb|de cabello rojizo
salman|sano y salvo, apacible
musab|difícil de domar: de voluntad firme
jabir|el que repara y consuela
tamim|completo, fuerte
hakim|sabio
hassaan|muy apuesto; poeta del Profeta ﷺ
asim|protector, guardián
safwan|roca clara y lisa
sahl|fácil, suave
harith|cultivador, el que se esfuerza
aamir|próspero, lleno de vida
zahir|radiante, floreciente
zainulabidin|adorno de los adoradores
tariq|visitante nocturno; lucero del alba
ayman|bendecido; el lado derecho
ridwan|complacencia (de Allah)
ihsan|excelencia, hacer el bien
naim|dicha, deleite
ramadan|el mes del ayuno
tawfiq|éxito concedido por Allah
burhan|prueba, evidencia clara
furqan|el criterio que distingue la verdad de la falsedad
najm|estrella
waqar|dignidad, serenidad
rayhan|planta aromática, albahaca
khalifa|sucesor, administrador
karim|generoso, noble
rashid|bien guiado
hadi|guía
fuad|corazón
jamil|hermoso, apuesto
khalil|amigo íntimo
mubarak|bendecido
muhsin|el que hace el bien con excelencia
munir|radiante, resplandeciente
siraj|lámpara
sabir|paciente
sadiq|veraz
siddiq|sumamente veraz
shakir|agradecido
akram|el más generoso, el más noble
amin|digno de confianza
badr|luna llena
bashir|portador de buenas noticias
munib|el que se vuelve a Allah con arrepentimiento
salim|sano, seguro, íntegro
halim|clemente, amable
taqi|piadoso, consciente de Allah
zaki|puro
sajid|el que se postra (en la oración)
shahid|testigo
mubashshir|portador de buenas nuevas
kazim|el que contiene su ira
amir|príncipe, líder
nabil|noble
nuruddin|luz de la fe
salahuddin|rectitud de la fe
shamsuddin|sol de la fe
saif|espada
faisal|el que juzga con firmeza
fahd|guepardo
faris|caballero, jinete
habib|amado
haytham|águila joven
hisham|generosidad
jalal|majestad
jamal|belleza
kamal|perfección
majid|glorioso, noble
mansur|victorioso, auxiliado
marwan|pedernal: firme
mazin|nube de lluvia
murad|deseo, meta
nadir|raro, precioso
nasir|ayudante, defensor
rayyan|bien regado; una puerta del Paraíso para quienes ayunan
riyad|jardines
sami|elevado, sublime
samir|compañero de charlas nocturnas
sharif|noble, honorable
tahir|puro
talal|lluvia fina, rocío
wasim|apuesto, gracioso
walid|recién nacido
ziyad|crecimiento, aumento
zain|belleza, gracia
adil|justo, equitativo
adnan|el que se asienta; antepasado de los árabes
anwar|más radiante
arif|conocedor, sabio
asad|león
basil|valiente
hamid|el que alaba a Allah
hashim|bisabuelo del Profeta ﷺ; «el que parte el pan» (para sus huéspedes)
imad|pilar, apoyo
isam|salvaguarda
junayd|pequeño soldado
labib|inteligente, sabio
malik|dueño; rey
mahdi|bien guiado
mahir|hábil
mujahid|el que se esfuerza por el bien
najib|noble, de noble cuna
nasim|brisa suave
rafiq|compañero amable
raid|pionero, líder
rami|arquero
wail|el que busca refugio
yamin|mano derecha; bendición
zahid|el que se contenta con poco, asceta
faruq|el que distingue la verdad de la falsedad; título de Umar
husam|espada afilada
jawad|generoso
muin|ayudante
samih|generoso, indulgente
shafiq|compasivo, bondadoso
hamdan|el que alaba mucho
zayed|creciente, abundante
humaid|pequeño alabado
obaid|pequeño siervo (de Allah)
sultan|autoridad, gobernante
kerem|generosidad, nobleza
shahin|halcón
arslan|león (turco)
arman|deseo, ideal (persa)
kamran|exitoso, afortunado (persa)
maryam|madre del profeta Jesús; la única mujer nombrada en el Corán
asiya|esposa del faraón, elogiada en el Corán como ejemplo
hajar|madre de Ismael; su búsqueda entre Safa y Marwa sigue viva en el Hach
sara|esposa de Abraham; «princesa»
hawwa|Eva, madre de la humanidad
khadija|primera esposa del Profeta ﷺ y la primera en creer en él
aisha|viva, llena de vida
fatima|hija del Profeta ﷺ; «la que desteta»
zahra|la radiante; título de Fátima
zaynab|hija del Profeta ﷺ; a menudo explicado como una planta fragante
ruqayya|ascenso; hija del Profeta ﷺ
batul|consagrada a Allah; título de Maryam y de Fátima
hafsa|joven leona; una de las madres de los creyentes
safiyya|pura; amiga elegida
maymuna|bendita, de buen augurio
salma|apacible, segura
sumayya|elevada; la primera mártir del islam
asma|elevada; también «nombres»
nusayba|de noble linaje; defendió al Profeta ﷺ en Uhud
rufayda|ayuda, apoyo; la primera enfermera del islam
baraka|bendición; el nombre de Umm Ayman
halima|amable, indulgente; nodriza del Profeta ﷺ
shayma|con un lunar; hermana de leche del Profeta ﷺ
arwa|cabra montés; tía del Profeta ﷺ
hala|halo alrededor de la luna
hind|nombre de Umm Salama, una de las madres de los creyentes
khawla|gacela; la compañera cuya súplica escuchó Allah
mariya|Mariya la Copta, madre del hijo del Profeta ﷺ, Ibrahim
jamila|hermosa
amina|segura, a salvo; madre del Profeta ﷺ
sakina|serenidad, paz interior
huda|guía, guiaje
nur|luz
rahma|misericordia
iman|fe
amal|esperanza
jannah|jardín, Paraíso
firdaws|el jardín más alto del Paraíso
kawthar|abundancia; un río del Paraíso
salsabil|una fuente del Paraíso
tasnim|una fuente del Paraíso
bushra|buena noticia
isra|el viaje nocturno; nombre de la sura 17
jana|fruto maduro listo para cosechar
lina|palmera tierna
marwa|piedra blanca; la colina de Marwa junto a la Kaaba
rawda|jardín, prado
rayhana|albahaca, planta fragante
sadiqa|veraz
sabira|paciente
sana|resplandor, brillo
yusra|facilidad
aliya|elevada, sublime
aya|signo; aleya del Corán
bayan|claridad, elocuencia
duaa|súplica
hanan|ternura, compasión
lulua|perla
nuha|intelecto, entendimiento
radiya|satisfecha, contenta
mardiyya|la que agrada a Allah
sahar|la hora previa al amanecer
salwa|consuelo; las codornices que Allah envió a los Hijos de Israel
shifa|curación
sidra|azufaifo (Sidrat al-Muntaha)
taqwa|conciencia de Allah
duha|luz de la mañana
fajr|alba
ghufran|perdón
husna|la más hermosa, la mejor
qamar|luna
raghad|vida despreocupada y abundante
sundus|seda fina (del Paraíso)
qurratulayn|consuelo y alegría de los ojos
qanita|devotamente obediente
abida|adoradora
hana|felicidad, dicha
hiba|regalo
ilham|inspiración
inaya|cuidado, atención
inas|cordialidad, calidez
jumana|perla de plata
layla|noche
lubna|estoraque (resina fragante)
lujayn|plata
manal|logro, consecución
safa|pureza, claridad
maysa|de andar gracioso
muna|deseos, esperanzas
nada|rocío; generosidad
najla|de ojos grandes y hermosos
nawal|regalo, favor
rania|la que mira (con alegría)
reem|gacela blanca
samira|compañera de charlas nocturnas
wafa|lealtad, fidelidad
afaf|recato, castidad
abir|fragancia
amira|princesa
anisa|compañera amable
basma|sonrisa
daliya|vid
dana|perla grande
farah|alegría
ghada|joven elegante
habiba|amada
hadil|arrullo de las palomas
hayat|vida
ibtisam|sonriente
joud|generosidad
kamila|completa, perfecta
karima|generosa, noble
lamis|suave al tacto
latifa|amable, bondadosa, sutil
layan|suavidad, ternura
maha|órice de Arabia, conocido por sus hermosos ojos
malika|reina
maram|aspiración, deseo
munira|radiante
nabila|noble
nafisa|preciosa
naima|consuelo, dicha suave
najwa|conversación íntima
rabia|la cuarta; Rabi'a al-'Adawiyya
rahima|misericordiosa
raja|esperanza
rasha|gacela joven
ruba|colinas
ruwayda|suave, de andar tranquilo
sabah|mañana
samar|conversación nocturna
thurayya|las Pléyades (cúmulo de estrellas)
widad|amor, afecto
wijdan|sentimiento, conciencia
yumna|bendita; mano derecha
zakiyya|pura
zubayda|la mejor parte (literalmente: la nata); mandó construir obras de agua para los peregrinos
hamida|digna de alabanza
hasna|hermosa
kenza|tesoro
naila|la que alcanza el bien
rahaf|delicadeza, sensibilidad
samiha|generosa, indulgente
tahira|pura
nurulayn|luz de los ojos
sajida|la que se postra (en la oración)
hira|la cueva de Hira, donde comenzó la revelación
areej|fragancia
dima|lluvia suave y persistente
ghaliya|preciosa, querida
hayfa|esbelta, graciosa
leen|suavidad
tuqa|piedad
waad|promesa
shahd|miel en el panal
hidaya|guía, guiaje
salima|sana, a salvo
alya|alturas, elevación
warda|rosa
zaina|adorno, belleza
inshirah|alivio y apertura del corazón
yasmin|jazmín
nasrin|rosa silvestre (persa)
fayruz|turquesa (piedra preciosa, persa)
sawsan|lirio
narjis|narciso (flor)
shirin|dulce, encantadora (persa)
laleh|tulipán (persa)
mahnoor|luz de luna (persa-árabe)
elif|Alif, la primera letra del alfabeto`,
  id: `muhammad|yang sangat terpuji
ahmad|yang paling layak dipuji
mahmud|terpuji, layak dipuji
mustafa|yang terpilih
abdullah|hamba Allah
abdurrahman|hamba Yang Maha Pengasih
abdurrahim|hamba Yang Maha Penyayang
abdulaziz|hamba Yang Mahaperkasa
abdulmalik|hamba Sang Raja
abdulkarim|hamba Yang Mahamulia dan Dermawan
abdulhamid|hamba Yang Maha Terpuji
abdulqadir|hamba Yang Mahakuasa
abdussalam|hamba Sumber Kedamaian
abdulwahhab|hamba Yang Maha Pemberi
abdulghani|hamba Yang Mahakaya
abdullatif|hamba Yang Mahalembut dan Penyantun
abdulhadi|hamba Yang Maha Pemberi Petunjuk
abdulbasit|hamba Yang Melapangkan rezeki
abdulwahid|hamba Yang Maha Esa
abdulfattah|hamba Yang Maha Pembuka
abdulmajid|hamba Yang Mahamulia
abdulhayy|hamba Yang Mahahidup
abdulwadud|hamba Yang Maha Pengasih dan Penuh Cinta
abdulghafur|hamba Yang Maha Pengampun
ibrahim|Nabi Ibrahim, kekasih dekat Allah
ismail|Nabi Ismail; "Allah mendengar"
ishaq|Nabi Ishaq; "ia tertawa"
yaqub|Nabi Yakub
yusuf|Nabi Yusuf; "Allah menambahkan"
musa|Nabi Musa
harun|Nabi Harun, saudara Musa
dawud|Nabi Daud; "yang dikasihi"
sulayman|Nabi Sulaiman; "pria pembawa damai"
yunus|Nabi Yunus
ayyub|Nabi Ayyub, teladan kesabaran
yahya|Nabi Yahya; "ia hidup"
zakariya|Nabi Zakaria
isa|Nabi Isa
nuh|Nabi Nuh; "istirahat, ketenangan"
idris|Nabi Idris; sering dikaitkan dengan "dars" (belajar)
hud|Nabi Hud, diutus kepada kaum 'Ad
salih|saleh, berbudi; Nabi Salih
shuayb|Nabi Syuaib, diutus ke Madyan
ilyas|Nabi Ilyas
adam|Nabi Adam, manusia pertama
imran|keluarga 'Imran dalam Al-Qur'an; dari 'umr: kehidupan, kemakmuran
luqman|Luqman yang Bijak, yang namanya menjadi nama sebuah surah
taha|huruf-huruf pembuka Surah Ta-Ha
yasin|huruf-huruf pembuka Surah Ya-Sin
abubakr|kunyah khalifah pertama, sahabat terdekat
umar|umur panjang; khalifah kedua
uthman|khalifah ketiga; semula berarti anak burung hubara
ali|tinggi, mulia
hasan|baik, indah
husayn|Hasan kecil: yang baik, yang tampan
qasim|yang membagi; salah seorang putra Nabi ﷺ
jafar|sungai kecil, anak sungai
hamza|teguh, kuat; paman Nabi ﷺ
abbas|bermuka tegas; salah satu nama singa; paman Nabi ﷺ
khalid|abadi, kekal
bilal|kesegaran; muazin pertama dalam Islam
zayd|pertumbuhan; satu-satunya sahabat yang disebut namanya dalam Al-Qur'an
saad|kebahagiaan, keberuntungan
said|bahagia, diberkahi
talha|sejenis pohon akasia
zubayr|kuat, kokoh
muadh|orang yang dilindungi Allah
anas|keramahan, kehangatan
usama|singa
ammar|orang yang membangun dan menghidupkan suatu tempat
yasir|mudah bergaul, lapang dada
suhayb|berambut kemerahan
salman|selamat, damai
musab|sulit dijinakkan: berkemauan keras
jabir|orang yang memperbaiki dan menghibur
tamim|sempurna, kuat
hakim|bijaksana
hassaan|sangat tampan; penyair Nabi ﷺ
asim|pelindung, penjaga
safwan|batu yang bening dan licin
sahl|mudah, lembut
harith|petani, orang yang bersungguh-sungguh
aamir|makmur, penuh kehidupan
zahir|bersinar, bermekaran
zainulabidin|perhiasan para ahli ibadah
tariq|tamu malam hari; bintang fajar
ayman|diberkahi; sisi kanan
ridwan|keridaan (Allah)
ihsan|kebaikan, berbuat baik
naim|kenikmatan, kebahagiaan
ramadan|bulan puasa
tawfiq|keberhasilan yang dianugerahkan Allah
burhan|bukti, tanda yang jelas
furqan|pembeda antara yang benar dan yang batil
najm|bintang
waqar|kewibawaan, ketenangan
rayhan|tanaman harum, kemangi
khalifa|pengganti, pengemban amanah
karim|dermawan, mulia
rashid|yang mendapat petunjuk
hadi|pemberi petunjuk
fuad|hati
jamil|indah, tampan
khalil|sahabat dekat
mubarak|diberkahi
muhsin|orang yang berbuat baik dengan sebaik-baiknya
munir|bercahaya, bersinar
siraj|pelita
sabir|sabar
sadiq|jujur
siddiq|sangat jujur
shakir|bersyukur
akram|paling dermawan, paling mulia
amin|dapat dipercaya
badr|bulan purnama
bashir|pembawa kabar gembira
munib|orang yang kembali kepada Allah dengan bertobat
salim|selamat, utuh, sehat
halim|santun, lembut
taqi|bertakwa, sadar akan Allah
zaki|suci
sajid|orang yang bersujud (dalam salat)
shahid|saksi
mubashshir|pembawa kabar gembira
kazim|orang yang menahan amarahnya
amir|pangeran, pemimpin
nabil|mulia
nuruddin|cahaya agama
salahuddin|kebaikan agama
shamsuddin|matahari agama
saif|pedang
faisal|pemutus perkara yang tegas
fahd|citah
faris|ksatria, penunggang kuda
habib|kekasih
haytham|anak elang
hisham|kedermawanan
jalal|keagungan
jamal|keindahan
kamal|kesempurnaan
majid|mulia, agung
mansur|menang, mendapat pertolongan
marwan|batu api: teguh
mazin|awan hujan
murad|keinginan, tujuan
nadir|langka, berharga
nasir|penolong, pendukung
rayyan|yang tercukupi airnya; salah satu pintu surga bagi orang yang berpuasa
riyad|taman-taman
sami|tinggi, luhur
samir|teman bercakap-cakap di malam hari
sharif|mulia, terhormat
tahir|suci
talal|hujan gerimis, embun
wasim|tampan, anggun
walid|bayi yang baru lahir
ziyad|pertumbuhan, pertambahan
zain|keindahan, keanggunan
adil|adil
adnan|penetap; leluhur bangsa Arab
anwar|lebih bercahaya
arif|berpengetahuan, bijak
asad|singa
basil|pemberani
hamid|orang yang memuji Allah
hashim|kakek buyut Nabi ﷺ; "pemecah roti" (untuk para tamu)
imad|tiang, penopang
isam|penjaga, pelindung
junayd|prajurit kecil
labib|cerdas, bijak
malik|pemilik; raja
mahdi|yang mendapat petunjuk
mahir|terampil
mujahid|orang yang berjuang untuk kebaikan
najib|mulia, berdarah bangsawan
nasim|angin sepoi-sepoi
rafiq|teman yang baik hati
raid|perintis, pemimpin
rami|pemanah
wail|orang yang mencari perlindungan
yamin|tangan kanan; berkah
zahid|orang yang merasa cukup dengan sedikit, zuhud
faruq|pembeda antara yang benar dan yang batil; gelar Umar
husam|pedang yang tajam
jawad|dermawan
muin|penolong
samih|dermawan, pemaaf
shafiq|penyayang, baik hati
hamdan|orang yang banyak memuji
zayed|bertambah, melimpah
humaid|si kecil yang terpuji
obaid|hamba kecil (milik Allah)
sultan|kekuasaan, penguasa
kerem|kedermawanan, kemuliaan
shahin|elang pemburu
arslan|singa (bahasa Turki)
arman|keinginan, cita-cita (bahasa Persia)
kamran|berhasil, beruntung (bahasa Persia)
maryam|ibu Nabi Isa; satu-satunya perempuan yang disebut namanya dalam Al-Qur'an
asiya|istri Firaun, dipuji dalam Al-Qur'an sebagai teladan
hajar|ibu Ismail; pencariannya antara Safa dan Marwah tetap hidup dalam ibadah haji
sara|istri Ibrahim; "putri raja"
hawwa|Hawa, ibu umat manusia
khadija|istri pertama Nabi ﷺ dan orang pertama yang beriman kepadanya
aisha|hidup, penuh kehidupan
fatima|putri Nabi ﷺ; "yang menyapih"
zahra|yang bercahaya; gelar Fatimah
zaynab|putri Nabi ﷺ; sering dijelaskan sebagai tanaman yang harum
ruqayya|kenaikan; putri Nabi ﷺ
batul|yang mengabdikan diri kepada Allah; gelar Maryam dan Fatimah
hafsa|singa betina muda; salah seorang Ummul Mukminin
safiyya|suci; sahabat pilihan
maymuna|diberkahi, pembawa keberuntungan
salma|damai, selamat
sumayya|luhur; syahidah pertama dalam Islam
asma|luhur; juga "nama-nama"
nusayba|keturunan mulia; membela Nabi ﷺ di Uhud
rufayda|bantuan, dukungan; perawat pertama dalam Islam
baraka|berkah; nama Ummu Aiman
halima|santun, lemah lembut; ibu susu Nabi ﷺ
shayma|berbintik tahi lalat yang indah; saudari sesusuan Nabi ﷺ
arwa|kambing gunung; bibi Nabi ﷺ
hala|lingkaran cahaya di sekitar bulan
hind|nama Ummu Salamah, salah seorang Ummul Mukminin
khawla|kijang; sahabiyah yang pengaduannya didengar Allah
mariya|Mariyah al-Qibtiyah, ibu putra Nabi ﷺ, Ibrahim
jamila|cantik
amina|aman, terlindungi; ibu Nabi ﷺ
sakina|ketenangan, kedamaian batin
huda|petunjuk
nur|cahaya
rahma|rahmat
iman|iman
amal|harapan
jannah|taman, surga
firdaws|taman tertinggi di surga
kawthar|kelimpahan; sungai di surga
salsabil|mata air di surga
tasnim|mata air di surga
bushra|kabar gembira
isra|perjalanan malam; nama Surah ke-17
jana|buah matang yang siap dipetik
lina|pohon kurma yang lembut
marwa|batu putih; bukit Marwah dekat Kakbah
rawda|taman, padang rumput
rayhana|kemangi, tanaman harum
sadiqa|jujur
sabira|sabar
sana|cahaya, kilauan
yusra|kemudahan
aliya|tinggi, mulia
aya|tanda; ayat Al-Qur'an
bayan|kejelasan, kefasihan
duaa|doa
hanan|kelembutan hati, kasih sayang
lulua|mutiara
nuha|akal, pemahaman
radiya|rida, puas
mardiyya|yang diridai Allah
sahar|saat menjelang fajar
salwa|penghibur; burung puyuh yang Allah kirim kepada Bani Israil
shifa|kesembuhan
sidra|pohon bidara (Sidratul Muntaha)
taqwa|takwa, kesadaran akan Allah
duha|cahaya pagi
fajr|fajar
ghufran|ampunan
husna|yang paling indah, yang terbaik
qamar|bulan
raghad|hidup yang tenteram dan berkelimpahan
sundus|sutra halus (dari surga)
qurratulayn|penyejuk dan kebahagiaan mata
qanita|taat dengan tulus
abida|ahli ibadah
hana|kebahagiaan, kenikmatan batin
hiba|hadiah
ilham|ilham
inaya|perhatian, kepedulian
inas|keramahan, kehangatan
jumana|mutiara perak
layla|malam
lubna|pohon kemenyan (getah harum)
lujayn|perak
manal|pencapaian, keberhasilan
safa|kemurnian, kejernihan
maysa|anggun dalam berjalan
muna|harapan, cita-cita
nada|embun; kedermawanan
najla|bermata lebar dan indah
nawal|pemberian, anugerah
rania|yang memandang (dengan gembira)
reem|kijang putih
samira|teman bercakap-cakap di malam hari
wafa|kesetiaan
afaf|kesopanan, kesucian diri
abir|keharuman
amira|putri raja
anisa|teman yang ramah
basma|senyuman
daliya|pohon anggur merambat
dana|mutiara besar
farah|kegembiraan
ghada|gadis muda yang anggun
habiba|kekasih
hadil|dekut burung merpati
hayat|kehidupan
ibtisam|yang tersenyum
joud|kedermawanan
kamila|lengkap, sempurna
karima|dermawan, mulia
lamis|lembut saat disentuh
latifa|lembut, baik hati, halus
layan|kelembutan, kehalusan
maha|oryx Arab, dikenal dengan matanya yang indah
malika|ratu
maram|cita-cita, harapan
munira|bercahaya
nabila|mulia
nafisa|berharga
naima|kenyamanan, kebahagiaan yang lembut
najwa|percakapan akrab
rabia|yang keempat; Rabi'ah al-Adawiyah
rahima|penyayang
raja|harapan
rasha|kijang muda
ruba|bukit-bukit
ruwayda|lembut, berjalan pelan
sabah|pagi
samar|percakapan malam hari
thurayya|Pleiades (gugus bintang)
widad|cinta, kasih sayang
wijdan|perasaan, hati nurani
yumna|diberkahi; tangan kanan
zakiyya|suci
zubayda|bagian terbaik (harfiah: kepala susu); membangun saluran air bagi para jamaah haji
hamida|terpuji
hasna|cantik
kenza|harta karun
naila|yang meraih kebaikan
rahaf|kehalusan, kepekaan
samiha|dermawan, pemaaf
tahira|suci
nurulayn|cahaya mata
sajida|yang bersujud (dalam salat)
hira|Gua Hira, tempat wahyu pertama turun
areej|keharuman
dima|hujan yang lembut dan lama
ghaliya|berharga, tersayang
hayfa|ramping, anggun
leen|kelembutan
tuqa|ketakwaan
waad|janji
shahd|madu dalam sarangnya
hidaya|petunjuk
salima|selamat, utuh
alya|ketinggian, keluhuran
warda|mawar
zaina|perhiasan, keindahan
inshirah|kelapangan dan kelegaan hati
yasmin|melati
nasrin|mawar liar (bahasa Persia)
fayruz|pirus (batu permata, bahasa Persia)
sawsan|bunga bakung
narjis|narsis (bunga)
shirin|manis, menawan (bahasa Persia)
laleh|tulip (bahasa Persia)
mahnoor|cahaya bulan (Persia-Arab)
elif|Alif, huruf pertama dalam alfabet`,
  ms: `muhammad|yang sangat terpuji
ahmad|yang paling layak dipuji
mahmud|terpuji, layak dipuji
mustafa|yang terpilih
abdullah|hamba Allah
abdurrahman|hamba Yang Maha Pemurah
abdurrahim|hamba Yang Maha Mengasihani
abdulaziz|hamba Yang Maha Perkasa
abdulmalik|hamba Raja
abdulkarim|hamba Yang Maha Mulia dan Pemurah
abdulhamid|hamba Yang Maha Terpuji
abdulqadir|hamba Yang Maha Berkuasa
abdussalam|hamba Sumber Keamanan dan Kesejahteraan
abdulwahhab|hamba Yang Maha Pemberi
abdulghani|hamba Yang Maha Kaya
abdullatif|hamba Yang Maha Halus dan Penyayang
abdulhadi|hamba Yang Maha Pemberi Petunjuk
abdulbasit|hamba Yang Melapangkan rezeki
abdulwahid|hamba Yang Maha Esa
abdulfattah|hamba Yang Maha Pembuka
abdulmajid|hamba Yang Maha Mulia
abdulhayy|hamba Yang Maha Hidup
abdulwadud|hamba Yang Maha Pengasih
abdulghafur|hamba Yang Maha Pengampun
ibrahim|Nabi Ibrahim, kekasih Allah yang rapat
ismail|Nabi Ismail; "Allah mendengar"
ishaq|Nabi Ishak; "dia ketawa"
yaqub|Nabi Yaakub
yusuf|Nabi Yusuf; "Allah menambah"
musa|Nabi Musa
harun|Nabi Harun, saudara Musa
dawud|Nabi Daud; "yang dikasihi"
sulayman|Nabi Sulaiman; "insan pembawa damai"
yunus|Nabi Yunus
ayyub|Nabi Ayub, contoh kesabaran
yahya|Nabi Yahya; "dia hidup"
zakariya|Nabi Zakaria
isa|Nabi Isa
nuh|Nabi Nuh; "rehat, ketenangan"
idris|Nabi Idris; sering dikaitkan dengan "dars" (pembelajaran)
hud|Nabi Hud, diutus kepada kaum 'Ad
salih|soleh, berbudi; Nabi Salih
shuayb|Nabi Syuaib, diutus ke Madyan
ilyas|Nabi Ilyas
adam|Nabi Adam, manusia pertama
imran|keluarga 'Imran dalam Quran; daripada 'umr: kehidupan, kemakmuran
luqman|Luqman yang Bijaksana, yang namanya menjadi nama sebuah surah
taha|huruf-huruf permulaan Surah Ta-Ha
yasin|huruf-huruf permulaan Surah Ya-Sin
abubakr|kunyah khalifah pertama, sahabat paling rapat
umar|umur panjang; khalifah kedua
uthman|khalifah ketiga; asalnya anak burung hubara
ali|tinggi, mulia
hasan|baik, indah
husayn|Hasan kecil: yang baik, yang kacak
qasim|yang membahagikan; seorang putera Nabi ﷺ
jafar|sungai kecil, anak sungai
hamza|teguh, kuat; bapa saudara Nabi ﷺ
abbas|bermuka tegas; salah satu nama singa; bapa saudara Nabi ﷺ
khalid|abadi, kekal
bilal|kesegaran; muazin pertama dalam Islam
zayd|pertumbuhan; satu-satunya sahabat yang disebut namanya dalam Quran
saad|kebahagiaan, tuah
said|bahagia, diberkati
talha|sejenis pokok akasia
zubayr|kuat, kukuh
muadh|orang yang dilindungi Allah
anas|kemesraan, kehangatan
usama|singa
ammar|orang yang membangun dan menghidupkan sesuatu tempat
yasir|mudah bergaul, berlapang dada
suhayb|berambut kemerah-merahan
salman|selamat, aman damai
musab|sukar dijinakkan: berkemahuan keras
jabir|orang yang memperbaiki dan menghibur
tamim|sempurna, kuat
hakim|bijaksana
hassaan|sangat kacak; penyair Nabi ﷺ
asim|pelindung, penjaga
safwan|batu yang jernih dan licin
sahl|mudah, lembut
harith|petani, orang yang bersungguh-sungguh
aamir|makmur, penuh kehidupan
zahir|bersinar, berkembang
zainulabidin|perhiasan para ahli ibadah
tariq|tetamu malam; bintang pagi
ayman|diberkati; sebelah kanan
ridwan|keredaan (Allah)
ihsan|kebaikan, berbuat baik
naim|nikmat, kebahagiaan
ramadan|bulan puasa
tawfiq|kejayaan yang dianugerahkan Allah
burhan|bukti, tanda yang jelas
furqan|pembeza antara yang benar dengan yang batil
najm|bintang
waqar|wibawa, ketenangan
rayhan|tumbuhan wangi, selasih
khalifa|pengganti, pemegang amanah
karim|pemurah, mulia
rashid|yang mendapat petunjuk
hadi|pemberi petunjuk
fuad|hati
jamil|indah, kacak
khalil|sahabat rapat
mubarak|diberkati
muhsin|orang yang berbuat baik dengan sebaik-baiknya
munir|bercahaya, bersinar
siraj|pelita
sabir|sabar
sadiq|benar, jujur
siddiq|sangat benar
shakir|bersyukur
akram|paling pemurah, paling mulia
amin|boleh dipercayai
badr|bulan purnama
bashir|pembawa khabar gembira
munib|orang yang kembali kepada Allah dengan bertaubat
salim|selamat, sempurna, sihat
halim|penyabar, lemah lembut
taqi|bertakwa, sedar akan Allah
zaki|suci
sajid|orang yang bersujud (dalam solat)
shahid|saksi
mubashshir|pembawa berita gembira
kazim|orang yang menahan marahnya
amir|putera raja, pemimpin
nabil|mulia
nuruddin|cahaya agama
salahuddin|kebaikan agama
shamsuddin|matahari agama
saif|pedang
faisal|pemutus yang tegas
fahd|cita
faris|kesatria, penunggang kuda
habib|kekasih
haytham|anak helang
hisham|kemurahan hati
jalal|keagungan
jamal|keindahan
kamal|kesempurnaan
majid|mulia, agung
mansur|menang, mendapat pertolongan
marwan|batu api: teguh
mazin|awan hujan
murad|hasrat, matlamat
nadir|jarang, berharga
nasir|penolong, penyokong
rayyan|yang cukup air; salah satu pintu syurga bagi orang yang berpuasa
riyad|taman-taman
sami|tinggi, luhur
samir|teman berbual pada waktu malam
sharif|mulia, terhormat
tahir|suci
talal|hujan renyai, embun
wasim|kacak, anggun
walid|bayi yang baru lahir
ziyad|pertumbuhan, pertambahan
zain|keindahan, keanggunan
adil|adil
adnan|penetap; nenek moyang bangsa Arab
anwar|lebih bercahaya
arif|berpengetahuan, bijaksana
asad|singa
basil|berani
hamid|orang yang memuji Allah
hashim|moyang Nabi ﷺ; "pemecah roti" (untuk para tetamu)
imad|tiang, penyokong
isam|pelindung
junayd|askar kecil
labib|bijak, cerdik
malik|pemilik; raja
mahdi|yang mendapat petunjuk
mahir|cekap
mujahid|orang yang berjuang untuk kebaikan
najib|mulia, berketurunan bangsawan
nasim|angin sepoi-sepoi bahasa
rafiq|teman yang baik hati
raid|perintis, pemimpin
rami|pemanah
wail|orang yang mencari perlindungan
yamin|tangan kanan; berkat
zahid|orang yang berasa cukup dengan sedikit, zuhud
faruq|pembeza antara yang benar dengan yang batil; gelaran Umar
husam|pedang yang tajam
jawad|pemurah
muin|penolong
samih|pemurah, pemaaf
shafiq|penyayang, baik hati
hamdan|orang yang banyak memuji
zayed|bertambah, melimpah
humaid|si kecil yang terpuji
obaid|hamba kecil (milik Allah)
sultan|kuasa, pemerintah
kerem|kemurahan hati, kemuliaan
shahin|helang pemburu
arslan|singa (bahasa Turki)
arman|hasrat, cita-cita (bahasa Parsi)
kamran|berjaya, bertuah (bahasa Parsi)
maryam|ibu Nabi Isa; satu-satunya wanita yang disebut namanya dalam Quran
asiya|isteri Firaun, dipuji dalam Quran sebagai teladan
hajar|ibu Ismail; pencariannya antara Safa dan Marwah terus hidup dalam ibadah haji
sara|isteri Ibrahim; "puteri raja"
hawwa|Hawa, ibu umat manusia
khadija|isteri pertama Nabi ﷺ dan orang pertama yang beriman kepadanya
aisha|hidup, penuh kehidupan
fatima|puteri Nabi ﷺ; "yang menyapih"
zahra|yang bercahaya; gelaran Fatimah
zaynab|puteri Nabi ﷺ; sering diterangkan sebagai tumbuhan yang harum
ruqayya|kenaikan; puteri Nabi ﷺ
batul|yang mengabdikan diri kepada Allah; gelaran Maryam dan Fatimah
hafsa|singa betina muda; seorang daripada Ummul Mukminin
safiyya|suci; sahabat pilihan
maymuna|diberkati, membawa tuah
salma|aman damai, selamat
sumayya|luhur; syahidah pertama dalam Islam
asma|luhur; juga "nama-nama"
nusayba|keturunan mulia; mempertahankan Nabi ﷺ di Uhud
rufayda|bantuan, sokongan; jururawat pertama dalam Islam
baraka|berkat; nama Ummu Aiman
halima|penyabar, lemah lembut; ibu susuan Nabi ﷺ
shayma|bertahi lalat yang cantik; saudara sesusuan Nabi ﷺ
arwa|kambing gunung; ibu saudara Nabi ﷺ
hala|bulatan cahaya di sekeliling bulan
hind|nama Ummu Salamah, seorang daripada Ummul Mukminin
khawla|kijang; sahabiah yang rayuannya didengar Allah
mariya|Mariyah al-Qibtiyyah, ibu kepada putera Nabi ﷺ, Ibrahim
jamila|cantik
amina|selamat, terlindung; ibu Nabi ﷺ
sakina|ketenangan, kedamaian batin
huda|petunjuk
nur|cahaya
rahma|rahmat
iman|iman
amal|harapan
jannah|taman, syurga
firdaws|taman tertinggi di syurga
kawthar|kelimpahan; sungai di syurga
salsabil|mata air di syurga
tasnim|mata air di syurga
bushra|khabar gembira
isra|perjalanan malam; nama Surah ke-17
jana|buah masak yang sedia dipetik
lina|pokok kurma yang lembut
marwa|batu putih; bukit Marwah berhampiran Kaabah
rawda|taman, padang rumput
rayhana|selasih, tumbuhan wangi
sadiqa|benar, jujur
sabira|sabar
sana|cahaya, kilauan
yusra|kemudahan
aliya|tinggi, mulia
aya|tanda; ayat Quran
bayan|kejelasan, kefasihan
duaa|doa
hanan|kelembutan hati, kasih sayang
lulua|mutiara
nuha|akal, kefahaman
radiya|reda, puas hati
mardiyya|yang diredai Allah
sahar|saat menjelang fajar
salwa|penghibur; burung puyuh yang Allah kirimkan kepada Bani Israel
shifa|penyembuhan
sidra|pokok bidara (Sidratul Muntaha)
taqwa|takwa, kesedaran akan Allah
duha|cahaya pagi
fajr|fajar
ghufran|keampunan
husna|yang paling indah, yang terbaik
qamar|bulan
raghad|hidup yang tenteram dan berkelimpahan
sundus|sutera halus (dari syurga)
qurratulayn|penyejuk dan kegembiraan mata
qanita|taat dengan ikhlas
abida|ahli ibadah
hana|kebahagiaan, kenikmatan batin
hiba|hadiah
ilham|ilham
inaya|perhatian, keprihatinan
inas|kemesraan, kehangatan
jumana|mutiara perak
layla|malam
lubna|pokok kemenyan (damar wangi)
lujayn|perak
manal|pencapaian, kejayaan
safa|kemurnian, kejernihan
maysa|anggun berjalan
muna|harapan, cita-cita
nada|embun; kemurahan hati
najla|bermata luas dan indah
nawal|pemberian, anugerah
rania|yang memandang (dengan gembira)
reem|kijang putih
samira|teman berbual pada waktu malam
wafa|kesetiaan
afaf|kesopanan, kesucian diri
abir|keharuman
amira|puteri raja
anisa|teman yang mesra
basma|senyuman
daliya|pokok anggur menjalar
dana|mutiara besar
farah|kegembiraan
ghada|gadis muda yang anggun
habiba|kekasih
hadil|dekut burung merpati
hayat|kehidupan
ibtisam|yang tersenyum
joud|kemurahan hati
kamila|lengkap, sempurna
karima|pemurah, mulia
lamis|lembut apabila disentuh
latifa|lembut, baik hati, halus
layan|kelembutan, kehalusan
maha|oryx Arab, terkenal dengan matanya yang indah
malika|permaisuri
maram|cita-cita, harapan
munira|bercahaya
nabila|mulia
nafisa|berharga
naima|keselesaan, kebahagiaan yang lembut
najwa|perbualan mesra
rabia|yang keempat; Rabi'ah al-Adawiyyah
rahima|penyayang
raja|harapan
rasha|kijang muda
ruba|bukit-bukit
ruwayda|lembut, berjalan perlahan
sabah|pagi
samar|perbualan malam
thurayya|Pleiades (gugusan bintang)
widad|cinta, kasih sayang
wijdan|perasaan, hati nurani
yumna|diberkati; tangan kanan
zakiyya|suci
zubayda|bahagian terbaik (harfiah: kepala susu); membina saluran air untuk para jemaah haji
hamida|terpuji
hasna|cantik
kenza|harta karun
naila|yang meraih kebaikan
rahaf|kehalusan, kepekaan
samiha|pemurah, pemaaf
tahira|suci
nurulayn|cahaya mata
sajida|yang bersujud (dalam solat)
hira|Gua Hira, tempat wahyu mula turun
areej|keharuman
dima|hujan yang lembut dan lama
ghaliya|berharga, tersayang
hayfa|langsing, anggun
leen|kelembutan
tuqa|ketakwaan
waad|janji
shahd|madu dalam sarang
hidaya|petunjuk
salima|selamat, sempurna
alya|ketinggian, keluhuran
warda|mawar
zaina|perhiasan, keindahan
inshirah|kelapangan dan kelegaan hati
yasmin|melur
nasrin|mawar liar (bahasa Parsi)
fayruz|pirus (batu permata, bahasa Parsi)
sawsan|bunga bakung
narjis|narsisus (bunga)
shirin|manis, menawan (bahasa Parsi)
laleh|tulip (bahasa Parsi)
mahnoor|cahaya bulan (Parsi-Arab)
elif|Alif, huruf pertama dalam abjad`,
  bn: `muhammad|অতি প্রশংসিত
ahmad|সবচেয়ে প্রশংসার যোগ্য
mahmud|প্রশংসিত, প্রশংসনীয়
mustafa|মনোনীত
abdullah|আল্লাহর বান্দা
abdurrahman|পরম দয়াময়ের বান্দা
abdurrahim|বিশেষ করুণাময়ের বান্দা
abdulaziz|মহাপরাক্রমশালীর বান্দা
abdulmalik|মহাবাদশাহর বান্দা
abdulkarim|পরম দানশীলের বান্দা
abdulhamid|প্রশংসিতের বান্দা
abdulqadir|সর্বশক্তিমানের বান্দা
abdussalam|শান্তির উৎসের বান্দা
abdulwahhab|মহান দাতার বান্দা
abdulghani|অমুখাপেক্ষীর বান্দা
abdullatif|সূক্ষ্মদর্শী ও দয়ালুর বান্দা
abdulhadi|পথপ্রদর্শকের বান্দা
abdulbasit|রিজিক প্রসারকারীর বান্দা
abdulwahid|এক ও অদ্বিতীয়ের বান্দা
abdulfattah|দ্বার উন্মোচনকারীর বান্দা
abdulmajid|মহিমান্বিতের বান্দা
abdulhayy|চিরঞ্জীবের বান্দা
abdulwadud|প্রেমময়ের বান্দা
abdulghafur|ক্ষমাশীলের বান্দা
ibrahim|নবী ইবরাহিম, আল্লাহর ঘনিষ্ঠ বন্ধু
ismail|নবী ইসমাইল; "আল্লাহ শোনেন"
ishaq|নবী ইসহাক; "সে হাসে"
yaqub|নবী ইয়াকুব
yusuf|নবী ইউসুফ; "আল্লাহ বৃদ্ধি করেন"
musa|নবী মুসা
harun|নবী হারুন, মুসার ভাই
dawud|নবী দাউদ; "প্রিয়"
sulayman|নবী সুলাইমান; "শান্তির মানুষ"
yunus|নবী ইউনুস
ayyub|নবী আইয়ুব, ধৈর্যের দৃষ্টান্ত
yahya|নবী ইয়াহইয়া; "সে বেঁচে থাকে"
zakariya|নবী জাকারিয়া
isa|নবী ঈসা
nuh|নবী নুহ; "বিশ্রাম, স্বস্তি"
idris|নবী ইদরিস; প্রায়ই "দারস" (অধ্যয়ন) শব্দের সঙ্গে যুক্ত করা হয়
hud|নবী হুদ, আদ জাতির কাছে প্রেরিত
salih|সৎ, নেককার; নবী সালেহ
shuayb|নবী শুআইব, মাদইয়ানের কাছে প্রেরিত
ilyas|নবী ইলিয়াস
adam|নবী আদম, প্রথম মানুষ
imran|কুরআনে ইমরানের পরিবার; "উমর" (জীবন, সমৃদ্ধি) থেকে
luqman|জ্ঞানী লুকমান, যাঁর নামে একটি সূরা আছে
taha|সূরা তা-হার শুরুর হরফ
yasin|সূরা ইয়াসিনের শুরুর হরফ
abubakr|প্রথম খলিফা, সবচেয়ে ঘনিষ্ঠ সঙ্গীর উপনাম
umar|দীর্ঘ জীবন; দ্বিতীয় খলিফা
uthman|তৃতীয় খলিফা; মূলত হুবারা পাখির ছানা
ali|সমুন্নত, উচ্চ
hasan|ভালো, সুন্দর
husayn|ছোট্ট হাসান: ভালো, সুদর্শন
qasim|বণ্টনকারী; নবী ﷺ-এর এক পুত্র
jafar|ঝরনা, ছোট নদী
hamza|অবিচল, শক্তিশালী; নবী ﷺ-এর চাচা
abbas|গম্ভীর চেহারার; সিংহের একটি নাম; নবী ﷺ-এর চাচা
khalid|চিরস্থায়ী, অবিনশ্বর
bilal|সজীবতা; ইসলামের প্রথম মুয়াজ্জিন
zayd|বৃদ্ধি; কুরআনে নাম উল্লিখিত একমাত্র সাহাবি
saad|সুখ, সৌভাগ্য
said|সুখী, সৌভাগ্যবান
talha|এক ধরনের বাবলা গাছ
zubayr|শক্তিশালী, দৃঢ়
muadh|আল্লাহ যাঁকে আশ্রয় দিয়েছেন
anas|বন্ধুত্বপূর্ণতা, উষ্ণতা
usama|সিংহ
ammar|যে কোনো স্থানকে আবাদ করে ও প্রাণ দেয়
yasir|সহজ স্বভাবের, নমনীয়
suhayb|লালচে চুলের অধিকারী
salman|নিরাপদ, শান্ত
musab|বশ মানানো কঠিন: দৃঢ় ইচ্ছাশক্তিসম্পন্ন
jabir|যে জোড়া লাগায় ও সান্ত্বনা দেয়
tamim|পূর্ণ, শক্তিশালী
hakim|জ্ঞানী
hassaan|অত্যন্ত সুদর্শন; নবী ﷺ-এর কবি
asim|রক্ষক, অভিভাবক
safwan|স্বচ্ছ, মসৃণ পাথর
sahl|সহজ, কোমল
harith|কৃষক, চেষ্টাশীল
aamir|সমৃদ্ধ, প্রাণবন্ত
zahir|দীপ্তিময়, প্রস্ফুটিত
zainulabidin|ইবাদতকারীদের অলংকার
tariq|রাতের আগন্তুক; ভোরের তারা
ayman|বরকতময়; ডান দিক
ridwan|(আল্লাহর) সন্তুষ্টি
ihsan|শ্রেষ্ঠত্ব, সৎকর্ম করা
naim|নিয়ামত, আনন্দ
ramadan|রোজার মাস
tawfiq|আল্লাহর দেওয়া সাফল্য
burhan|প্রমাণ, সুস্পষ্ট দলিল
furqan|সত্য ও মিথ্যার পার্থক্যকারী মানদণ্ড
najm|তারা
waqar|মর্যাদা, গাম্ভীর্য
rayhan|সুগন্ধি গাছ, তুলসী
khalifa|উত্তরসূরি, প্রতিনিধি
karim|দানশীল, মহৎ
rashid|সঠিক পথপ্রাপ্ত
hadi|পথপ্রদর্শক
fuad|হৃদয়
jamil|সুন্দর, সুদর্শন
khalil|ঘনিষ্ঠ বন্ধু
mubarak|বরকতময়
muhsin|যিনি উত্তমরূপে সৎকর্ম করেন
munir|আলোকিত, দীপ্তিমান
siraj|প্রদীপ
sabir|ধৈর্যশীল
sadiq|সত্যবাদী
siddiq|পরম সত্যবাদী
shakir|কৃতজ্ঞ
akram|সবচেয়ে দানশীল, সবচেয়ে মহৎ
amin|বিশ্বস্ত
badr|পূর্ণিমার চাঁদ
bashir|সুসংবাদদাতা
munib|যে তওবা করে আল্লাহর দিকে ফেরে
salim|নিখুঁত, নিরাপদ, পূর্ণ
halim|সহনশীল, কোমল
taqi|পরহেজগার, আল্লাহভীরু
zaki|পবিত্র
sajid|যে সিজদা করে (নামাজে)
shahid|সাক্ষী
mubashshir|সুসংবাদ প্রদানকারী
kazim|যে রাগ সংবরণ করে
amir|রাজকুমার, নেতা
nabil|মহৎ
nuruddin|দ্বীনের আলো
salahuddin|দ্বীনের সততা
shamsuddin|দ্বীনের সূর্য
saif|তলোয়ার
faisal|দৃঢ়ভাবে ফয়সালাকারী
fahd|চিতা
faris|অশ্বারোহী, বীর যোদ্ধা
habib|প্রিয়
haytham|ঈগলের ছানা
hisham|বদান্যতা
jalal|মহিমা
jamal|সৌন্দর্য
kamal|পূর্ণতা
majid|মহিমান্বিত, মহৎ
mansur|বিজয়ী, সাহায্যপ্রাপ্ত
marwan|চকমকি পাথর: দৃঢ়
mazin|বর্ষণমুখর মেঘ
murad|বাসনা, লক্ষ্য
nadir|বিরল, মূল্যবান
nasir|সাহায্যকারী, সমর্থক
rayyan|সুপরিতৃপ্ত; রোজাদারদের জন্য জান্নাতের একটি দরজা
riyad|বাগানসমূহ
sami|উচ্চ, মহান
samir|সন্ধ্যার আলাপের সঙ্গী
sharif|সম্ভ্রান্ত, মর্যাদাবান
tahir|পবিত্র
talal|ঝিরঝিরে বৃষ্টি, শিশির
wasim|সুদর্শন, লাবণ্যময়
walid|নবজাতক
ziyad|বৃদ্ধি, প্রবৃদ্ধি
zain|সৌন্দর্য, লাবণ্য
adil|ন্যায়পরায়ণ
adnan|বসতি স্থাপনকারী; আরবদের পূর্বপুরুষ
anwar|অধিক উজ্জ্বল
arif|জ্ঞানী, প্রাজ্ঞ
asad|সিংহ
basil|সাহসী
hamid|যিনি আল্লাহর প্রশংসা করেন
hashim|নবী ﷺ-এর প্রপিতামহ; "রুটি ভেঙে দেন যিনি" (অতিথিদের জন্য)
imad|স্তম্ভ, অবলম্বন
isam|রক্ষাকবচ
junayd|ছোট্ট সৈনিক
labib|বুদ্ধিমান, প্রাজ্ঞ
malik|মালিক; রাজা
mahdi|সঠিক পথে পরিচালিত
mahir|দক্ষ
mujahid|যে ভালোর জন্য সংগ্রাম করে
najib|সম্ভ্রান্ত, অভিজাত বংশের
nasim|মৃদু বাতাস
rafiq|সদয় সঙ্গী
raid|অগ্রদূত, নেতা
rami|তিরন্দাজ
wail|যে আশ্রয় চায়
yamin|ডান হাত; বরকত
zahid|অল্পে তুষ্ট, দুনিয়াবিমুখ
faruq|যে সত্য-মিথ্যার পার্থক্য করে; উমরের উপাধি
husam|ধারালো তলোয়ার
jawad|দানশীল
muin|সাহায্যকারী
samih|উদার, ক্ষমাশীল
shafiq|স্নেহশীল, দয়ালু
hamdan|অধিক প্রশংসাকারী
zayed|ক্রমবর্ধমান, প্রাচুর্যপূর্ণ
humaid|ছোট্ট প্রশংসিত
obaid|ছোট্ট বান্দা (আল্লাহর)
sultan|কর্তৃত্ব, শাসক
kerem|বদান্যতা, মহত্ত্ব
shahin|বাজপাখি
arslan|সিংহ (তুর্কি)
arman|বাসনা, আদর্শ (ফারসি)
kamran|সফল, ভাগ্যবান (ফারসি)
maryam|নবী ঈসার মা; কুরআনে নাম উল্লিখিত একমাত্র নারী
asiya|ফেরাউনের স্ত্রী, কুরআনে যাঁকে আদর্শ হিসেবে প্রশংসা করা হয়েছে
hajar|ইসমাইলের মা; সাফা ও মারওয়ার মধ্যে তাঁর অন্বেষণ হজে আজও জীবন্ত
sara|ইবরাহিমের স্ত্রী; "রাজকন্যা"
hawwa|হাওয়া, মানবজাতির মা
khadija|নবী ﷺ-এর প্রথম স্ত্রী এবং তাঁর প্রতি প্রথম ঈমান আনয়নকারী
aisha|জীবন্ত, প্রাণবন্ত
fatima|নবী ﷺ-এর কন্যা; "যে দুধ ছাড়ায়"
zahra|দীপ্তিময়ী; ফাতিমার উপাধি
zaynab|নবী ﷺ-এর কন্যা; প্রায়ই সুগন্ধি গাছ অর্থে ব্যাখ্যা করা হয়
ruqayya|আরোহণ; নবী ﷺ-এর কন্যা
batul|আল্লাহর প্রতি নিবেদিতা; মারইয়াম ও ফাতিমার উপাধি
hafsa|তরুণ সিংহী; উম্মুল মুমিনিনদের একজন
safiyya|পবিত্র; মনোনীত বন্ধু
maymuna|বরকতময়ী, শুভ
salma|শান্ত, নিরাপদ
sumayya|সমুন্নত; ইসলামের প্রথম শহীদ
asma|সমুন্নত; এছাড়া "নামসমূহ"
nusayba|সম্ভ্রান্ত বংশের; উহুদে নবী ﷺ-কে রক্ষা করেছিলেন
rufayda|সাহায্য, সহায়তা; ইসলামের প্রথম নার্স
baraka|বরকত; উম্মু আইমানের নাম
halima|সহনশীল, কোমল; নবী ﷺ-এর দুধমা
shayma|সুন্দর তিলযুক্ত; নবী ﷺ-এর দুধবোন
arwa|পাহাড়ি ছাগল; নবী ﷺ-এর ফুফু
hala|চাঁদের চারপাশের জ্যোতির্বলয়
hind|উম্মু সালামার নাম, উম্মুল মুমিনিনদের একজন
khawla|হরিণী; যে সাহাবিয়ার ফরিয়াদ আল্লাহ শুনেছিলেন
mariya|কিবতি মারিয়া, নবী ﷺ-এর পুত্র ইবরাহিমের মা
jamila|সুন্দরী
amina|নিরাপদ, সুরক্ষিত; নবী ﷺ-এর মা
sakina|প্রশান্তি, আত্মিক শান্তি
huda|হেদায়াত
nur|নূর, আলো
rahma|রহমত
iman|ঈমান
amal|আশা
jannah|বাগান, জান্নাত
firdaws|জান্নাতের সর্বোচ্চ বাগান
kawthar|প্রাচুর্য; জান্নাতের একটি নদী
salsabil|জান্নাতের একটি ঝরনা
tasnim|জান্নাতের একটি ঝরনা
bushra|সুসংবাদ
isra|রাতের ভ্রমণ; ১৭ নম্বর সূরার নাম
jana|তোলার জন্য প্রস্তুত পাকা ফল
lina|কোমল খেজুর গাছ
marwa|সাদা পাথর; কাবার কাছের মারওয়া পাহাড়
rawda|বাগান, তৃণভূমি
rayhana|তুলসী, সুগন্ধি গাছ
sadiqa|সত্যবাদিনী
sabira|ধৈর্যশীলা
sana|দীপ্তি, ঔজ্জ্বল্য
yusra|স্বাচ্ছন্দ্য
aliya|সমুন্নত, উচ্চ
aya|নিদর্শন; কুরআনের আয়াত
bayan|স্পষ্টতা, বাকপটুতা
duaa|দোয়া
hanan|কোমলতা, মমতা
lulua|মুক্তা
nuha|বুদ্ধি, উপলব্ধি
radiya|সন্তুষ্ট, তৃপ্ত
mardiyya|যাঁর প্রতি আল্লাহ সন্তুষ্ট
sahar|ভোরের আগের প্রহর
salwa|সান্ত্বনা; আল্লাহ বনী ইসরাইলের কাছে যে কোয়েল পাঠিয়েছিলেন
shifa|আরোগ্য
sidra|কুল গাছ (সিদরাতুল মুনতাহা)
taqwa|তাকওয়া, আল্লাহর চেতনা
duha|পূর্বাহ্নের আলো
fajr|ভোর, ফজর
ghufran|ক্ষমা
husna|সবচেয়ে সুন্দর, সর্বোত্তম
qamar|চাঁদ
raghad|নিশ্চিন্ত ও প্রাচুর্যময় জীবন
sundus|মিহি রেশম (জান্নাতের)
qurratulayn|চোখের শীতলতা ও আনন্দ
qanita|বিনীতভাবে আনুগত্যকারিণী
abida|ইবাদতকারিণী
hana|সুখ, পরম আনন্দ
hiba|উপহার
ilham|ইলহাম, অনুপ্রেরণা
inaya|যত্ন, মনোযোগ
inas|বন্ধুত্বপূর্ণতা, উষ্ণতা
jumana|রুপালি মুক্তা
layla|রাত
lubna|স্টোরাক্স গাছ (সুগন্ধি নির্যাস)
lujayn|রুপা
manal|প্রাপ্তি, অর্জন
safa|পবিত্রতা, স্বচ্ছতা
maysa|সুন্দর চলনভঙ্গির অধিকারিণী
muna|কামনা, আশা
nada|শিশির; বদান্যতা
najla|বড় ও সুন্দর চোখের অধিকারিণী
nawal|উপহার, অনুগ্রহ
rania|যে আনন্দে তাকায়
reem|সাদা হরিণী
samira|সন্ধ্যার আলাপের সঙ্গিনী
wafa|বিশ্বস্ততা, আনুগত্য
afaf|শালীনতা, সতীত্ব
abir|সুবাস
amira|রাজকন্যা
anisa|বন্ধুসুলভ সঙ্গিনী
basma|হাসি
daliya|আঙুরলতা
dana|বড় মুক্তা
farah|আনন্দ
ghada|লাবণ্যময়ী তরুণী
habiba|প্রিয়তমা
hadil|পায়রার কূজন
hayat|জীবন
ibtisam|হাস্যোজ্জ্বল
joud|বদান্যতা
kamila|পূর্ণ, নিখুঁত
karima|দানশীলা, মহীয়সী
lamis|স্পর্শে কোমল
latifa|কোমল, দয়ালু, সূক্ষ্ম
layan|কোমলতা, নরমভাব
maha|আরবীয় ওরিক্স, সুন্দর চোখের জন্য পরিচিত
malika|রানী
maram|আকাঙ্ক্ষা, বাসনা
munira|আলোকিত
nabila|মহীয়সী
nafisa|মূল্যবান
naima|আরাম, মৃদু সুখ
najwa|অন্তরঙ্গ আলাপ
rabia|চতুর্থ; রাবেয়া আল-আদাবিয়্যা
rahima|দয়াময়ী
raja|আশা
rasha|তরুণ হরিণী
ruba|টিলাসমূহ
ruwayda|কোমল পদক্ষেপে চলা
sabah|সকাল
samar|রাতের আলাপ
thurayya|সুরাইয়া (তারাপুঞ্জ)
widad|ভালোবাসা, স্নেহ
wijdan|অনুভূতি, বিবেক
yumna|বরকতময়ী; ডান হাত
zakiyya|পবিত্র
zubayda|সেরা অংশ (আক্ষরিক অর্থ: সর), হাজীদের জন্য জলপ্রণালি নির্মাণ করেছিলেন
hamida|প্রশংসনীয়া
hasna|সুন্দরী
kenza|গুপ্তধন
naila|যে কল্যাণ লাভ করে
rahaf|সূক্ষ্মতা, সংবেদনশীলতা
samiha|উদার, ক্ষমাশীলা
tahira|পবিত্রা
nurulayn|চোখের আলো
sajida|যে সিজদা করে (নামাজে)
hira|হেরা গুহা, যেখানে ওহি শুরু হয়েছিল
areej|সুবাস
dima|মৃদু, দীর্ঘস্থায়ী বৃষ্টি
ghaliya|মূল্যবান, প্রিয়
hayfa|ক্ষীণকটি, লাবণ্যময়ী
leen|কোমলতা
tuqa|তাকওয়া, ধর্মপরায়ণতা
waad|প্রতিশ্রুতি
shahd|চাকের মধু
hidaya|হেদায়াত
salima|নিখুঁত, নিরাপদ
alya|উচ্চতা, মহিমা
warda|গোলাপ
zaina|অলংকার, সৌন্দর্য
inshirah|হৃদয়ের প্রশান্তি ও প্রশস্ততা
yasmin|জুঁই
nasrin|বুনো গোলাপ (ফারসি)
fayruz|ফিরোজা (মূল্যবান পাথর, ফারসি)
sawsan|লিলি
narjis|নার্সিসাস (ফুল)
shirin|মিষ্টি, মনোহর (ফারসি)
laleh|টিউলিপ (ফারসি)
mahnoor|চাঁদের আলো (ফারসি-আরবি)
elif|আলিফ, বর্ণমালার প্রথম হরফ`,
  ru: `muhammad|многократно восхваляемый
ahmad|наиболее достойный хвалы
mahmud|восхваляемый, достойный хвалы
mustafa|избранный
abdullah|раб Аллаха
abdurrahman|раб Всемилостивого
abdurrahim|раб Особо Милосердного
abdulaziz|раб Могущественного
abdulmalik|раб Царя
abdulkarim|раб Щедрейшего
abdulhamid|раб Достохвального
abdulqadir|раб Всесильного
abdussalam|раб Источника мира
abdulwahhab|раб Дарующего
abdulghani|раб Самодостаточного
abdullatif|раб Тонкого и Доброго
abdulhadi|раб Наставляющего на путь
abdulbasit|раб Расширяющего удел
abdulwahid|раб Единого
abdulfattah|раб Открывающего
abdulmajid|раб Славного
abdulhayy|раб Вечноживого
abdulwadud|раб Любящего
abdulghafur|раб Прощающего
ibrahim|пророк Ибрахим (Авраам), близкий друг Аллаха
ismail|пророк Исмаил (Измаил); «Аллах слышит»
ishaq|пророк Исхак (Исаак); «он смеётся»
yaqub|пророк Якуб (Иаков)
yusuf|пророк Юсуф (Иосиф); «Аллах приумножает»
musa|пророк Муса (Моисей)
harun|пророк Харун (Аарон), брат Мусы
dawud|пророк Дауд (Давид); «любимый»
sulayman|пророк Сулейман (Соломон); «человек мира»
yunus|пророк Юнус (Иона)
ayyub|пророк Аййуб (Иов), пример терпения
yahya|пророк Яхья (Иоанн); «он живёт»
zakariya|пророк Закария (Захария)
isa|пророк Иса (Иисус)
nuh|пророк Нух (Ной); «покой, утешение»
idris|пророк Идрис; часто связывается со словом «дарс» (изучение)
hud|пророк Худ, посланный к народу Ад
salih|праведный; пророк Салих
shuayb|пророк Шуайб, посланный в Мадьян
ilyas|пророк Ильяс (Илия)
adam|пророк Адам, первый человек
imran|семья Имрана в Коране; от «умр»: жизнь, расцвет
luqman|мудрый Лукман, в честь которого названа сура
taha|начальные буквы суры «Та-Ха»
yasin|начальные буквы суры «Йа-Син»
abubakr|кунья первого халифа, ближайшего сподвижника
umar|долгая жизнь; второй халиф
uthman|третий халиф; первоначально птенец дрофы
ali|высокий, возвышенный
hasan|хороший, красивый
husayn|маленький Хасан: добрый, красивый
qasim|тот, кто распределяет; один из сыновей Пророка ﷺ
jafar|ручей, небольшая река
hamza|стойкий, сильный; дядя Пророка ﷺ
abbas|суровый на вид; одно из имён льва; дядя Пророка ﷺ
khalid|вечный, непреходящий
bilal|свежесть; первый муэдзин ислама
zayd|рост; единственный сподвижник, названный в Коране по имени
saad|счастье, удача
said|счастливый, благословенный
talha|разновидность акации
zubayr|сильный, крепкий
muadh|тот, кого защитил Аллах
anas|дружелюбие, теплота
usama|лев
ammar|тот, кто строит и оживляет место
yasir|покладистый, мягкий
suhayb|рыжеволосый
salman|невредимый, мирный
musab|трудно укрощаемый: с сильной волей
jabir|тот, кто врачует и утешает
tamim|совершенный, сильный
hakim|мудрый
hassaan|очень красивый; поэт Пророка ﷺ
asim|защитник, хранитель
safwan|чистый гладкий камень
sahl|лёгкий, мягкий
harith|земледелец, усердно трудящийся
aamir|цветущий, полный жизни
zahir|сияющий, расцветающий
zainulabidin|украшение поклоняющихся
tariq|ночной гость; утренняя звезда
ayman|благословенный; правая сторона
ridwan|благоволение (Аллаха)
ihsan|совершенство, благодеяние
naim|блаженство, наслаждение
ramadan|месяц поста
tawfiq|успех, дарованный Аллахом
burhan|довод, ясное доказательство
furqan|различение истины и лжи
najm|звезда
waqar|достоинство, невозмутимость
rayhan|ароматное растение, базилик
khalifa|преемник, наместник
karim|щедрый, благородный
rashid|идущий верным путём
hadi|наставник на пути
fuad|сердце
jamil|красивый
khalil|близкий друг
mubarak|благословенный
muhsin|тот, кто творит добро наилучшим образом
munir|сияющий, светящийся
siraj|светильник
sabir|терпеливый
sadiq|правдивый
siddiq|предельно правдивый
shakir|благодарный
akram|самый щедрый, самый благородный
amin|надёжный
badr|полная луна
bashir|вестник благой вести
munib|тот, кто с раскаянием обращается к Аллаху
salim|невредимый, целостный
halim|сдержанный, мягкий
taqi|богобоязненный
zaki|чистый
sajid|совершающий земной поклон (в молитве)
shahid|свидетель
mubashshir|благовестник
kazim|тот, кто сдерживает гнев
amir|эмир, предводитель
nabil|благородный
nuruddin|свет веры
salahuddin|праведность веры
shamsuddin|солнце веры
saif|меч
faisal|тот, кто судит решительно
fahd|гепард
faris|рыцарь, всадник
habib|возлюбленный
haytham|молодой орёл
hisham|щедрость
jalal|величие
jamal|красота
kamal|совершенство
majid|славный, благородный
mansur|победоносный, получивший помощь
marwan|кремень: твёрдый
mazin|дождевая туча
murad|желание, цель
nadir|редкий, драгоценный
nasir|помощник, сторонник
rayyan|обильно орошённый; врата рая для постящихся
riyad|сады
sami|возвышенный
samir|собеседник вечерних бесед
sharif|благородный, почтенный
tahir|чистый
talal|мелкий дождь, роса
wasim|красивый, изящный
walid|новорождённый
ziyad|рост, прибавление
zain|красота, изящество
adil|справедливый
adnan|поселенец; предок арабов
anwar|более сияющий
arif|знающий, мудрый
asad|лев
basil|храбрый
hamid|тот, кто восхваляет Аллаха
hashim|прадед Пророка ﷺ; «тот, кто крошит хлеб» (для гостей)
imad|опора, столп
isam|защита, оберег
junayd|маленький воин
labib|умный, сообразительный
malik|владелец; царь
mahdi|ведомый верным путём
mahir|искусный
mujahid|тот, кто стремится к добру
najib|благородный, знатного рода
nasim|лёгкий ветерок
rafiq|добрый спутник
raid|первопроходец, лидер
rami|лучник
wail|ищущий убежища
yamin|правая рука; благословение
zahid|довольствующийся малым, аскет
faruq|различающий истину и ложь; прозвище Умара
husam|острый меч
jawad|щедрый
muin|помощник
samih|щедрый, прощающий
shafiq|сострадательный, добрый
hamdan|тот, кто много восхваляет
zayed|растущий, обильный
humaid|маленький восхваляемый
obaid|маленький раб (Аллаха)
sultan|власть, правитель
kerem|щедрость, благородство
shahin|сокол
arslan|лев (по-турецки)
arman|желание, идеал (по-персидски)
kamran|удачливый, счастливый (по-персидски)
maryam|мать пророка Исы; единственная женщина, названная в Коране по имени
asiya|жена фараона, прославленная в Коране как пример
hajar|мать Исмаила; её поиск между Сафой и Марвой живёт в хадже
sara|жена Ибрахима; «принцесса»
hawwa|Хавва (Ева), мать человечества
khadija|первая жена Пророка ﷺ и первая, уверовавшая в него
aisha|живая, полная жизни
fatima|дочь Пророка ﷺ; «отлучающая от груди»
zahra|сияющая; титул Фатимы
zaynab|дочь Пророка ﷺ; часто объясняется как ароматное растение
ruqayya|вознесение; дочь Пророка ﷺ
batul|посвятившая себя Аллаху; титул Марьям и Фатимы
hafsa|молодая львица; одна из матерей верующих
safiyya|чистая; избранная подруга
maymuna|благословенная, счастливая
salma|мирная, в безопасности
sumayya|возвышенная; первая мученица ислама
asma|возвышенная; также «имена»
nusayba|благородного рода; защищала Пророка ﷺ при Ухуде
rufayda|помощь, поддержка; первая медсестра в исламе
baraka|благодать; имя Умм Айман
halima|мягкая, терпеливая; кормилица Пророка ﷺ
shayma|с красивой родинкой; молочная сестра Пророка ﷺ
arwa|горный козёл; тётя Пророка ﷺ
hala|ореол вокруг луны
hind|имя Умм Саламы, одной из матерей верующих
khawla|газель; сподвижница, мольбу которой услышал Аллах
mariya|Мария-коптка, мать сына Пророка ﷺ Ибрахима
jamila|красивая
amina|в безопасности, защищённая; мать Пророка ﷺ
sakina|покой, внутренняя тишина
huda|прямой путь, руководство
nur|свет
rahma|милость
iman|вера
amal|надежда
jannah|сад, рай
firdaws|высший сад рая
kawthar|изобилие; река в раю
salsabil|источник в раю
tasnim|источник в раю
bushra|благая весть
isra|ночное путешествие; название суры 17
jana|спелый плод, готовый к сбору
lina|нежная пальма
marwa|белый камень; холм Марва у Каабы
rawda|сад, луг
rayhana|базилик, ароматное растение
sadiqa|правдивая
sabira|терпеливая
sana|сияние, блеск
yusra|облегчение
aliya|высокая, возвышенная
aya|знамение; аят Корана
bayan|ясность, красноречие
duaa|мольба (дуа)
hanan|нежность, сострадание
lulua|жемчужина
nuha|разум, понимание
radiya|довольная, удовлетворённая
mardiyya|та, что угодна Аллаху
sahar|предрассветный час
salwa|утешение; перепела, посланные Аллахом сынам Исраила
shifa|исцеление
sidra|лотос (Сидрат аль-Мунтаха)
taqwa|богобоязненность, осознание Аллаха
duha|утренний свет
fajr|рассвет
ghufran|прощение
husna|прекраснейшая, лучшая
qamar|луна
raghad|беззаботная и обильная жизнь
sundus|тонкий шёлк (райский)
qurratulayn|отрада очей
qanita|смиренно послушная
abida|поклоняющаяся
hana|счастье, блаженство
hiba|дар
ilham|вдохновение
inaya|забота, внимание
inas|дружелюбие, теплота
jumana|серебряная жемчужина
layla|ночь
lubna|стиракс (ароматная смола)
lujayn|серебро
manal|достижение, успех
safa|чистота, ясность
maysa|с горделивой походкой
muna|желания, надежды
nada|роса; щедрость
najla|с большими красивыми глазами
nawal|дар, милость
rania|та, что смотрит (с радостью)
reem|белая газель
samira|собеседница вечерних бесед
wafa|верность, преданность
afaf|скромность, целомудрие
abir|аромат
amira|принцесса
anisa|приветливая спутница
basma|улыбка
daliya|виноградная лоза
dana|крупная жемчужина
farah|радость
ghada|изящная юная девушка
habiba|возлюбленная
hadil|воркование голубей
hayat|жизнь
ibtisam|улыбающаяся
joud|щедрость
kamila|совершенная, безупречная
karima|щедрая, благородная
lamis|нежная на ощупь
latifa|нежная, добрая, тонкая
layan|мягкость, нежность
maha|аравийский орикс, известный красотой глаз
malika|королева
maram|стремление, желание
munira|сияющая
nabila|благородная
nafisa|драгоценная
naima|уют, тихое блаженство
najwa|задушевная беседа
rabia|четвёртая; Рабиа аль-Адавия
rahima|милосердная
raja|надежда
rasha|молодая газель
ruba|холмы
ruwayda|нежная, с мягкой поступью
sabah|утро
samar|вечерняя беседа
thurayya|Плеяды (звёздное скопление)
widad|любовь, привязанность
wijdan|чувство, совесть
yumna|благословенная; правая рука
zakiyya|чистая
zubayda|лучшая часть (букв. сливки); построила водные сооружения для паломников
hamida|достойная хвалы
hasna|красивая
kenza|сокровище
naila|та, что достигает блага
rahaf|тонкость, чуткость
samiha|щедрая, прощающая
tahira|чистая
nurulayn|свет очей
sajida|совершающая земной поклон (в молитве)
hira|пещера Хира, где началось откровение
areej|аромат
dima|тихий затяжной дождь
ghaliya|драгоценная, дорогая
hayfa|стройная, изящная
leen|мягкость
tuqa|богобоязненность
waad|обещание
shahd|мёд в сотах
hidaya|руководство на прямом пути
salima|невредимая, в безопасности
alya|высоты, величие
warda|роза
zaina|украшение, красота
inshirah|облегчение и открытость сердца
yasmin|жасмин
nasrin|дикая роза (по-персидски)
fayruz|бирюза (драгоценный камень, по-персидски)
sawsan|лилия
narjis|нарцисс (цветок)
shirin|сладкая, милая (по-персидски)
laleh|тюльпан (по-персидски)
mahnoor|лунный свет (персидско-арабское)
elif|Алиф, первая буква алфавита`,
  zh: `muhammad|备受赞美者
ahmad|最值得赞美者
mahmud|受赞美的，值得赞美的
mustafa|被选中者
abdullah|安拉的仆人
abdurrahman|至仁至慈者的仆人
abdurrahim|特别怜悯者的仆人
abdulaziz|万能强大者的仆人
abdulmalik|君王的仆人
abdulkarim|至慷慨者的仆人
abdulhamid|受赞颂者的仆人
abdulqadir|全能者的仆人
abdussalam|平安之源的仆人
abdulwahhab|赏赐者的仆人
abdulghani|无求自足者的仆人
abdullatif|至细微而仁慈者的仆人
abdulhadi|引领者的仆人
abdulbasit|拓展恩赐者的仆人
abdulwahid|独一者的仆人
abdulfattah|开启者的仆人
abdulmajid|荣耀者的仆人
abdulhayy|永生者的仆人
abdulwadud|至爱者的仆人
abdulghafur|至赦者的仆人
ibrahim|先知易卜拉欣（亚伯拉罕），安拉的挚友
ismail|先知伊斯玛仪（以实玛利）；“安拉聆听”
ishaq|先知伊斯哈格（以撒）；“他笑”
yaqub|先知叶尔孤白（雅各）
yusuf|先知优素福（约瑟）；“安拉增益”
musa|先知穆萨（摩西）
harun|先知哈伦（亚伦），穆萨的兄弟
dawud|先知达五德（大卫）；“被爱者”
sulayman|先知苏莱曼（所罗门）；“和平之人”
yunus|先知优努斯（约拿）
ayyub|先知安优卜（约伯），坚忍的榜样
yahya|先知叶哈雅（约翰）；“他活着”
zakariya|先知宰凯里雅（撒迦利亚）
isa|先知尔撒（耶稣）
nuh|先知努哈（诺亚）；“安歇，慰藉”
idris|先知伊德里斯；常与“达尔斯”（研习）联系在一起
hud|先知呼德，被派往阿德人
salih|正直的人；先知撒立哈
shuayb|先知舒阿卜，被派往麦德彦
ilyas|先知伊勒雅斯（以利亚）
adam|先知阿丹（亚当），第一个人
imran|古兰经中的伊姆兰家族；源自“欧姆尔”：生命，兴旺
luqman|智者鲁格曼，有一章以他命名
taha|《塔哈章》开头的字母
yasin|《雅辛章》开头的字母
abubakr|第一位哈里发、最亲密同伴的别名
umar|长寿；第二位哈里发
uthman|第三位哈里发；原意是小鸨（一种鸟）
ali|崇高，高贵
hasan|美好，俊美
husayn|小哈桑：美好、英俊者
qasim|分配者；先知ﷺ的一个儿子
jafar|溪流，小河
hamza|坚定，强壮；先知ﷺ的叔父
abbas|面容严肃者；狮子的别称；先知ﷺ的叔父
khalid|永恒，持久
bilal|清新；伊斯兰的第一位宣礼员
zayd|增长；古兰经中唯一被点名的圣门弟子
saad|幸福，好运
said|幸福的，蒙福的
talha|一种金合欢树
zubayr|强壮，坚固
muadh|受安拉庇护的人
anas|友善，温暖
usama|狮子
ammar|建设并使一个地方充满生机的人
yasir|随和，宽厚
suhayb|红发的人
salman|平安，安宁
musab|难以驯服者：意志坚强
jabir|修补并安慰人心者
tamim|完整，强健
hakim|智慧的
hassaan|非常英俊；先知ﷺ的诗人
asim|保护者，守护者
safwan|清澈光滑的岩石
sahl|容易，温和
harith|耕耘者，奋力进取者
aamir|兴旺，充满生机
zahir|光彩照人，绽放
zainulabidin|敬拜者的饰物
tariq|夜间来客；晨星
ayman|蒙福的；右侧
ridwan|（安拉的）喜悦
ihsan|卓越，行善
naim|恩福，喜乐
ramadan|斋戒之月
tawfiq|安拉赐予的成功
burhan|证据，明证
furqan|分辨真伪的准则
najm|星辰
waqar|庄重，沉稳
rayhan|芳香植物，罗勒
khalifa|继承人，代理者
karim|慷慨，高贵
rashid|得正道者
hadi|引路人
fuad|心
jamil|美丽，俊美
khalil|挚友
mubarak|蒙福的
muhsin|以卓越方式行善的人
munir|光明的，闪耀的
siraj|明灯
sabir|坚忍的人
sadiq|诚实的人
siddiq|极为诚实的人
shakir|感恩的人
akram|最慷慨者，最高贵者
amin|可信赖的人
badr|满月
bashir|报喜者
munib|悔过而归向安拉的人
salim|健全，安全，完整
halim|宽厚，温和
taqi|敬畏安拉者
zaki|纯洁
sajid|叩头者（礼拜中）
shahid|见证者
mubashshir|传报喜讯者
kazim|抑制怒气的人
amir|王子，领袖
nabil|高贵
nuruddin|信仰之光
salahuddin|信仰之正直
shamsuddin|信仰之太阳
saif|宝剑
faisal|果断裁决者
fahd|猎豹
faris|骑士，骑手
habib|心爱者
haytham|幼鹰
hisham|慷慨
jalal|威严
jamal|美
kamal|完美
majid|荣耀，高贵
mansur|得胜者，得助者
marwan|燧石：坚毅
mazin|雨云
murad|心愿，目标
nadir|稀有，珍贵
nasir|助手，支持者
rayyan|水源充足；天堂中为斋戒者而设的一道门
riyad|园林
sami|崇高，高远
samir|夜谈的伙伴
sharif|高贵，尊贵
tahir|纯洁
talal|细雨，露水
wasim|英俊，优雅
walid|新生儿
ziyad|增长，增加
zain|美丽，优雅
adil|公正
adnan|定居者；阿拉伯人的祖先
anwar|更加光明
arif|博识者，智者
asad|狮子
basil|勇敢
hamid|赞颂安拉的人
hashim|先知ﷺ的曾祖父；“掰饼者”（为款待客人）
imad|支柱，依靠
isam|护卫
junayd|小战士
labib|聪慧，明智
malik|主人；君王
mahdi|被引上正道者
mahir|熟练，精通
mujahid|为行善而奋斗的人
najib|高贵，出身名门
nasim|微风
rafiq|善良的同伴
raid|先驱，领袖
rami|射手
wail|寻求庇护者
yamin|右手；吉祥
zahid|知足少欲者，苦行者
faruq|分辨真伪者；欧麦尔的称号
husam|锋利的剑
jawad|慷慨者
muin|助手
samih|宽厚，宽恕
shafiq|富有同情心，善良
hamdan|常常赞颂者
zayed|增长的，丰盈的
humaid|小小的受赞颂者
obaid|小仆人（安拉的）
sultan|权威，统治者
kerem|慷慨，高尚
shahin|隼
arslan|狮子（突厥语）
arman|心愿，理想（波斯语）
kamran|成功，幸运（波斯语）
maryam|先知尔撒的母亲；古兰经中唯一被点名的女性
asiya|法老的妻子，古兰经称赞她为榜样
hajar|伊斯玛仪的母亲；她在萨法与麦尔维之间的奔走在朝觐中延续至今
sara|易卜拉欣的妻子；“公主”
hawwa|哈娃（夏娃），人类之母
khadija|先知ﷺ的第一位妻子，也是第一位信仰他的人
aisha|活着的，充满生命力
fatima|先知ﷺ的女儿；“断奶者”
zahra|光彩照人者；法蒂玛的称号
zaynab|先知ﷺ的女儿；常被解释为一种芳香植物
ruqayya|攀升；先知ﷺ的女儿
batul|专心侍奉安拉者；麦尔彦与法蒂玛的称号
hafsa|年轻的母狮；信士之母之一
safiyya|纯洁；被选中的朋友
maymuna|蒙福的，吉祥的
salma|平安，安全
sumayya|崇高；伊斯兰的第一位殉教者
asma|崇高；亦指“名字”
nusayba|出身高贵；在吴侯德战役中保护先知ﷺ
rufayda|帮助，支持；伊斯兰的第一位护士
baraka|恩惠；乌姆·艾曼的名字
halima|温和，宽厚；先知ﷺ的乳母
shayma|带美人痣的人；先知ﷺ的乳姐妹
arwa|野山羊；先知ﷺ的姑母
hala|月晕
hind|信士之母乌姆·赛莱麦的名字
khawla|羚羊；安拉听到其恳求的圣门女弟子
mariya|科普特人玛利亚，先知ﷺ之子易卜拉欣的母亲
jamila|美丽
amina|平安，受保护；先知ﷺ的母亲
sakina|安宁，内心的平静
huda|引导
nur|光
rahma|慈悯
iman|信仰
amal|希望
jannah|园圃，天堂
firdaws|天堂中最高的园圃
kawthar|丰沛；天堂中的一条河
salsabil|天堂中的一眼泉
tasnim|天堂中的一眼泉
bushra|喜讯
isra|夜行；第 17 章的名称
jana|已熟待摘的果实
lina|柔嫩的椰枣树
marwa|白石；克尔白旁的麦尔维山丘
rawda|园圃，草地
rayhana|罗勒，芳香植物
sadiqa|诚实的女子
sabira|坚忍的女子
sana|光辉，光彩
yusra|容易，轻松
aliya|崇高，高贵
aya|迹象；古兰经的一节经文
bayan|清晰，雄辩
duaa|祈祷
hanan|温柔，怜爱
lulua|珍珠
nuha|智力，理解力
radiya|满意，知足
mardiyya|令安拉喜悦的人
sahar|黎明前的时刻
salwa|慰藉；安拉赐给以色列后裔的鹌鹑
shifa|痊愈
sidra|酸枣树（极境之树）
taqwa|敬畏，对安拉的意识
duha|上午的光
fajr|黎明
ghufran|宽恕
husna|最美好，最优秀
qamar|月亮
raghad|无忧而富足的生活
sundus|天堂的细丝绸
qurratulayn|眼中的慰藉与喜悦
qanita|虔诚顺从的女子
abida|敬拜者
hana|幸福，喜乐
hiba|礼物
ilham|灵感
inaya|关怀，照料
inas|友善，温暖
jumana|银色珍珠
layla|夜晚
lubna|安息香树（芳香树脂）
lujayn|白银
manal|获得，成就
safa|纯净，清澈
maysa|步态优雅的女子
muna|愿望，期盼
nada|露水；慷慨
najla|眼睛又大又美的女子
nawal|赠礼，恩惠
rania|欣然凝望的女子
reem|白羚羊
samira|夜谈的女伴
wafa|忠诚，忠实
afaf|端庄，贞洁
abir|芬芳
amira|公主
anisa|友善的女伴
basma|微笑
daliya|葡萄藤
dana|大珍珠
farah|喜悦
ghada|优雅的少女
habiba|心爱的人
hadil|鸽子的咕咕声
hayat|生命
ibtisam|面带微笑的女子
joud|慷慨
kamila|完整，完美
karima|慷慨，高贵
lamis|触感柔软
latifa|温柔，善良，细腻
layan|柔和，温软
maha|阿拉伯长角羚，以美丽的眼睛著称
malika|王后
maram|抱负，愿望
munira|光明的女子
nabila|高贵的女子
nafisa|珍贵
naima|舒适，温柔的幸福
najwa|亲密交谈
rabia|第四；拉比娅·阿达维娅
rahima|仁慈的女子
raja|希望
rasha|小羚羊
ruba|山丘
ruwayda|温柔，步履轻缓
sabah|早晨
samar|夜谈
thurayya|昴星团（星团）
widad|爱，情谊
wijdan|情感，良知
yumna|蒙福的女子；右手
zakiyya|纯洁的女子
zubayda|最好的部分（字面意思：乳脂）；为朝觐者修建了水利设施
hamida|值得赞美的女子
hasna|美丽的女子
kenza|宝藏
naila|获得美善的女子
rahaf|细腻，敏感
samiha|慷慨宽厚的女子
tahira|纯洁的女子
nurulayn|眼中之光
sajida|叩头的女子（礼拜中）
hira|希拉山洞，启示由此开始
areej|芬芳
dima|轻柔绵长的雨
ghaliya|珍贵，亲爱
hayfa|身姿纤细优雅的女子
leen|温柔
tuqa|虔诚
waad|诺言
shahd|蜂巢里的蜜
hidaya|引导
salima|健全，平安
alya|高处，崇高
warda|玫瑰
zaina|装饰，美丽
inshirah|心胸的舒展与开阔
yasmin|茉莉
nasrin|野蔷薇（波斯语）
fayruz|绿松石（宝石，波斯语）
sawsan|百合
narjis|水仙（花）
shirin|甜美，可爱（波斯语）
laleh|郁金香（波斯语）
mahnoor|月光（波斯—阿拉伯语）
elif|艾里夫，字母表的第一个字母`,
};
const meaningTables = new Map<string, Map<string, string>>();
function meaningIn(l: UiLang, id: string) {
  let table = meaningTables.get(l);
  if (!table) {
    table = new Map();
    for (const line of (MEANINGS_RAW[l] ?? "").split("\n")) {
      const i = line.indexOf("|");
      if (i > 0) table.set(line.slice(0, i), line.slice(i + 1));
    }
    meaningTables.set(l, table);
  }
  return table.get(id);
}
export const meaningOf = (n: BabyName, l: UiLang) => (l === "de" ? n.de : l === "ar" ? n.arM : l === "en" ? n.en : meaningIn(l, n.id) ?? n.en);

// ---- text helpers ----
export const stripHarakat = (s: string) => s.replace(/[ً-ٰٟۖ-ۭـ‌]/g, "");
export const normArabic = (s: string) => stripHarakat(s).replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[^ء-ي]/g, "");
export const normLatin = (s: string) => s.toLowerCase().replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
export const hasArabic = (s: string) => /[؀-ۿ]/.test(s);

export const latinOf = (n: BabyName) => n.tr[0];
export const lengthOf = (n: BabyName, l: Lang) => (l === "ar" ? normArabic(n.ar).length : normLatin(n.tr[0]).length);
export const letterOf = (n: BabyName, l: Lang) => (l === "ar" ? normArabic(n.ar).charAt(0) : normLatin(n.tr[0]).charAt(0).toUpperCase());
export const isAbd = (n: BabyName) => n.id.startsWith("abd");

// Easy for German/English speakers: no sounds such as kh, gh, dh, th or q, at most three syllables, short
export function isEasy(n: BabyName) {
  const s = n.tr[0].toLowerCase();
  if (/kh|gh|dh|th|q|'/.test(s) || isAbd(n)) return false;
  const syl = (s.match(/[aeiouy]+/g) ?? []).length;
  return syl <= 3 && normLatin(s).length <= 8;
}

// A typed name (Latin or Arabic) → a known name, if any (gender preferred)
export function findName(typed: string, prefer?: Gender): BabyName | null {
  const t = typed.trim();
  if (!t) return null;
  const ar = hasArabic(t);
  const k = ar ? normArabic(t) : normLatin(t);
  if (!k) return null;
  const hits = NAMES.filter((n) => (ar ? normArabic(n.ar) === k : n.tr.some((x) => normLatin(x) === k) || normLatin(n.id) === k));
  return hits.find((n) => n.g === prefer) ?? hits[0] ?? null;
}

// Arabic alphabetical order for the A–Z list in the Arabic UI
export const AR_ALPHABET = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split("");

export const ORIGIN_FILTERS = ["quran", "prophet", "companion", "ahl-al-bayt", "arabic", "other"] as const;
export type OriginFilter = (typeof ORIGIN_FILTERS)[number];
export function matchesOrigin(n: BabyName, f: OriginFilter) {
  if (f === "companion") return n.o.includes("sahabi") || n.o.includes("sahabiyya");
  return n.o.includes(f);
}
export const primaryOrigin = (n: BabyName): Origin => n.o[0];

type Dict = Record<string, string>;
const T: Record<UiLang, Dict> = {
  de: {
    metaTitle: "Muslimische Vornamen mit Bedeutung – Namen-Finder",
    metaDesc: "Über 300 muslimische Jungen- und Mädchennamen mit arabischer Schreibweise, Bedeutung und Koranvers. Der Namen-Finder schlägt passende Namen für Ihr Kind vor.",
    kicker: "Namen für Ihr Kind",
    title: "Ein schöner Name",
    lead: "Muslimische Vornamen, die Familien wirklich tragen – mit arabischer Schreibweise, Bedeutung und dem Vers, in dem der Name oder seine Wurzel im Koran vorkommt. Der Namen-Finder hört Ihnen zu und schlägt drei Namen vor.",
    heroRef: "Koran 19:7",
    tabFinder: "Namen-Finder",
    tabAll: "Alle Namen",
    step: "Schritt {n} von {total}",
    s1: "Die Familie",
    s1d: "Damit wir den Namen zu Ihrer Familie passend vorschlagen und nicht einen Namen wiederholen.",
    s2: "Das Kind",
    s2d: "Geschlecht, Geburtstermin und Geschwister – alles außer dem Geschlecht ist freiwillig.",
    s3: "Ihre Wünsche",
    s3d: "Was soll der Name ausdrücken? Wählen Sie so viel oder so wenig, wie Sie möchten.",
    s4: "Vorschläge",
    father: "Name des Vaters",
    mother: "Name der Mutter",
    family: "Familienname (freiwillig)",
    fatherPh: "z. B. Ibrahim",
    motherPh: "z. B. Maryam",
    familyPh: "z. B. Yilmaz",
    gender: "Für",
    boy: "Junge",
    girl: "Mädchen",
    both: "Beides vorschlagen",
    date: "Geburtsdatum oder errechneter Termin (freiwillig)",
    hijriIs: "Im islamischen Kalender: {date}",
    siblings: "Namen der Geschwister (freiwillig, mit Komma getrennt)",
    siblingsPh: "z. B. Yusuf, Aisha",
    letter: "Anfangsbuchstabe im Vergleich zu den Geschwistern",
    letterAny: "egal",
    letterSame: "gleicher Buchstabe",
    letterDiff: "anderer Buchstabe",
    themesQ: "Was soll der Name ausdrücken?",
    originsQ: "Woher darf der Name kommen?",
    o_quran: "aus dem Koran",
    o_prophet: "Propheten und ihre Familien",
    o_companion: "Gefährten des Propheten ﷺ",
    o_arabic: "arabische Tugend",
    maxLen: "Höchstens so viele Buchstaben",
    any: "beliebig",
    easy: "Leicht auszusprechen auf Deutsch",
    next: "Weiter",
    back: "Zurück",
    find: "Namen finden",
    shuffle: "Neu mischen",
    edit: "Angaben ändern",
    save: "Merken",
    saved: "Gemerkt",
    share: "Teilen",
    copied: "Kopiert",
    forBoy: "Für einen Jungen",
    forGirl: "Für ein Mädchen",
    classical: "Klassisch",
    withFamily: "Mit Familienname",
    v_appears: "Der Name im Koran",
    v_about: "Ein Vers über sie",
    v_root: "Ein Vers aus derselben Wurzel",
    v_theme: "Ein Vers zum Thema {theme}",
    listen: "Anhören",
    verseRef: "Koran {ref}",
    noPool: "Mit diesen Wünschen haben wir keinen passenden Namen gefunden. Lockern Sie einen Filter, dann klappt es.",
    resultLead: "Drei Namen aus den am besten passenden – jedes Mischen zeigt andere.",
    monthNote: "Ihr Kind kommt im Monat {month} zur Welt.",
    donateLine: "Möge dieser Name ein Segen für Ihr Kind sein. Der Namen-Finder bleibt für jede Familie kostenlos. Wenn er Ihnen geholfen hat, können Sie Quran Masterclass freiwillig unterstützen – als Sadaqa dschariya.",
    loved: "Bei Familien beliebt",
    lovedD: "Die Namen, die Familien hier am häufigsten gemerkt haben.",
    lovedEmpty: "Noch hat niemand einen Namen gemerkt – tippen Sie auf „Merken“, um den Anfang zu machen.",
    favTitle: "Ihre gemerkten Namen",
    favEmpty: "Noch keine Namen gemerkt. Tippen Sie bei einem Namen auf das Herz.",
    favAdd: "Merken",
    favRemove: "Nicht mehr merken",
    copyList: "Liste kopieren",
    shareList: "Liste teilen",
    filterFor: "Für",
    all: "Alle",
    theme: "Thema",
    origin: "Herkunft",
    letterF: "Anfangsbuchstabe",
    lenF: "Länge",
    search: "Name oder Bedeutung suchen …",
    count: "{n} Namen",
    surprise: "Überraschen Sie mich",
    noMatch: "Kein Name passt zu dieser Auswahl.",
    boysN: "{n} Jungennamen",
    girlsN: "{n} Mädchennamen",
    abdTitle: "Namen der Dienerschaft",
    abdText: "Namen, die die Dienerschaft gegenüber Allah ausdrücken – „Abd“ mit einem Seiner schönen Namen – sind besonders geliebt. Der Prophet ﷺ sagte:",
    abdHadith: "„Die liebsten eurer Namen bei Allah sind Abdullah und Abdurrahman.“",
    abdSrc: "Muslim 2132",
    changeTitle: "Gute Namen statt schlechter",
    changeText: "Der Prophet ﷺ änderte Namen mit schlechter Bedeutung in gute: Eine Tochter Umars hieß ʿĀṣiya („die Ungehorsame“, عاصية – nicht zu verwechseln mit Āsiya, der Frau des Pharao), und er nannte sie Jamila („die Schöne“).",
    changeSrc: "Muslim 2139",
    rulesTitle: "Was wir nie vorschlagen",
    rule1: "Namen, die allein Allah gehören, wie ar-Rahman oder al-Khaliq – sie werden nur mit „Abd“ vergeben.",
    rule2: "Namen, die eine Dienerschaft gegenüber jemand anderem als Allah ausdrücken.",
    rule3: "Namen mit schlechter oder unschöner Bedeutung.",
    rule4: "Den Namen des Vaters, der Mutter oder eines Geschwisters.",
    rightTitle: "Ein Recht des Kindes",
    rightText: "Einen guten Namen zu wählen gehört zu den Rechten des Kindes – er begleitet es ein Leben lang. Wenn Sie unsicher sind, fragen Sie Ihre Familie und einen Gelehrten.",
    meaningNote: "Bedeutungen sind kurz gefasst; viele Namen tragen mehrere Nuancen.",
    g_b: "Junge",
    g_g: "Mädchen",
  },
  en: {
    metaTitle: "Muslim baby names with meanings – name finder",
    metaDesc: "Over 300 Muslim boys' and girls' names with Arabic spelling, meaning and Quran verse. The name finder suggests fitting names for your child.",
    kicker: "Names for your child",
    title: "A beautiful name",
    lead: "Muslim names that families really use – with Arabic spelling, meaning and the verse where the name or its root appears in the Quran. The name finder listens to you and suggests three names.",
    heroRef: "Quran 19:7",
    tabFinder: "Name finder",
    tabAll: "All names",
    step: "Step {n} of {total}",
    s1: "The family",
    s1d: "So that the name suits your family and doesn't repeat a name you already have.",
    s2: "The child",
    s2d: "Gender, due date and siblings – everything except the gender is optional.",
    s3: "Your wishes",
    s3d: "What should the name express? Choose as much or as little as you like.",
    s4: "Suggestions",
    father: "Father's name",
    mother: "Mother's name",
    family: "Family name (optional)",
    fatherPh: "e.g. Ibrahim",
    motherPh: "e.g. Maryam",
    familyPh: "e.g. Khan",
    gender: "For a",
    boy: "Boy",
    girl: "Girl",
    both: "Suggest both",
    date: "Date of birth or due date (optional)",
    hijriIs: "In the Islamic calendar: {date}",
    siblings: "Siblings' names (optional, separated by commas)",
    siblingsPh: "e.g. Yusuf, Aisha",
    letter: "First letter compared to the siblings",
    letterAny: "no preference",
    letterSame: "same letter",
    letterDiff: "different letter",
    themesQ: "What should the name express?",
    originsQ: "Where may the name come from?",
    o_quran: "from the Quran",
    o_prophet: "prophets and their families",
    o_companion: "companions of the Prophet ﷺ",
    o_arabic: "Arabic virtue",
    maxLen: "At most this many letters",
    any: "any",
    easy: "Easy to pronounce in English",
    next: "Next",
    back: "Back",
    find: "Find names",
    shuffle: "Shuffle again",
    edit: "Change answers",
    save: "Save",
    saved: "Saved",
    share: "Share",
    copied: "Copied",
    forBoy: "For a boy",
    forGirl: "For a girl",
    classical: "Classical form",
    withFamily: "With family name",
    v_appears: "The name in the Quran",
    v_about: "A verse about her",
    v_root: "A verse from the same root",
    v_theme: "A verse on {theme}",
    listen: "Listen",
    verseRef: "Quran {ref}",
    noPool: "We found no name for these wishes. Loosen one filter and try again.",
    resultLead: "Three names from the best matches – every shuffle shows others.",
    monthNote: "Your child is born in the month of {month}.",
    donateLine: "May this name be a blessing for your child. The name finder stays free for every family. If it helped you, you are welcome to support Quran Masterclass voluntarily – as sadaqa jariya.",
    loved: "Most loved by families",
    lovedD: "The names families here have saved most often.",
    lovedEmpty: "No one has saved a name yet – tap “Save” to be the first.",
    favTitle: "Your saved names",
    favEmpty: "No saved names yet. Tap the heart on any name.",
    favAdd: "Save",
    favRemove: "Remove from saved",
    copyList: "Copy list",
    shareList: "Share list",
    filterFor: "For",
    all: "All",
    theme: "Theme",
    origin: "Origin",
    letterF: "First letter",
    lenF: "Length",
    search: "Search a name or meaning …",
    count: "{n} names",
    surprise: "Surprise me",
    noMatch: "No name matches this selection.",
    boysN: "{n} boys' names",
    girlsN: "{n} girls' names",
    abdTitle: "Names of servitude",
    abdText: "Names that express servitude to Allah – “Abd” with one of His beautiful names – are especially beloved. The Prophet ﷺ said:",
    abdHadith: "“The most beloved of your names to Allah are Abdullah and Abdurrahman.”",
    abdSrc: "Muslim 2132",
    changeTitle: "Good names instead of bad ones",
    changeText: "The Prophet ﷺ changed names with a bad meaning into good ones: a daughter of Umar was called ʿĀṣiya (“disobedient”, عاصية – not to be confused with Āsiya, the wife of Pharaoh), and he named her Jamila (“beautiful”).",
    changeSrc: "Muslim 2139",
    rulesTitle: "What we never suggest",
    rule1: "Names that belong to Allah alone, such as ar-Rahman or al-Khaliq – they are only given with “Abd”.",
    rule2: "Names that express servitude to anyone other than Allah.",
    rule3: "Names with a bad or unpleasant meaning.",
    rule4: "The name of the father, the mother or a sibling.",
    rightTitle: "A right of the child",
    rightText: "Choosing a good name is one of the rights of the child – it stays with them for life. If you are unsure, ask your family and a scholar.",
    meaningNote: "Meanings are kept short; many names carry several shades of meaning.",
    g_b: "Boy",
    g_g: "Girl",
  },
  ar: {
    metaTitle: "أسماء المواليد المسلمين ومعانيها – مرشد الأسماء",
    metaDesc: "أكثر من 300 اسم للبنين والبنات بالرسم العربي والمعنى والآية القرآنية، ومرشد يقترح لمولودكم أسماء تناسب عائلتكم.",
    kicker: "أسماء لمولودكم",
    title: "اسمٌ حسن",
    lead: "أسماء تحملها العائلات المسلمة حقًّا، بمعانيها والآية التي ورد فيها الاسم أو جذره في القرآن الكريم. أخبرونا عن عائلتكم، ويقترح عليكم المرشد ثلاثة أسماء.",
    heroRef: "مريم: 7",
    tabFinder: "مرشد الأسماء",
    tabAll: "كل الأسماء",
    step: "الخطوة {n} من {total}",
    s1: "العائلة",
    s1d: "لنقترح اسمًا يناسب عائلتكم ولا يكرر اسمًا موجودًا.",
    s2: "المولود",
    s2d: "الجنس وموعد الولادة والإخوة، وكل ذلك اختياري ما عدا الجنس.",
    s3: "رغباتكم",
    s3d: "ماذا تحبون أن يحمل الاسم من معنى؟ اختاروا ما شئتم.",
    s4: "الاقتراحات",
    father: "اسم الأب",
    mother: "اسم الأم",
    family: "اسم العائلة (اختياري)",
    fatherPh: "مثلًا: إبراهيم",
    motherPh: "مثلًا: مريم",
    familyPh: "مثلًا: الهاشمي",
    gender: "المولود",
    boy: "ولد",
    girl: "بنت",
    both: "اقترحوا لنا الاثنين",
    date: "تاريخ الولادة أو الموعد المتوقع (اختياري)",
    hijriIs: "بالتقويم الهجري: {date}",
    siblings: "أسماء الإخوة (اختياري، تُفصل بفاصلة)",
    siblingsPh: "مثلًا: يوسف، عائشة",
    letter: "الحرف الأول مقارنةً بالإخوة",
    letterAny: "لا يهم",
    letterSame: "الحرف نفسه",
    letterDiff: "حرف مختلف",
    themesQ: "ماذا تحبون أن يعبّر عنه الاسم؟",
    originsQ: "من أين يكون الاسم؟",
    o_quran: "من القرآن",
    o_prophet: "الأنبياء وأهلهم",
    o_companion: "الصحابة رضي الله عنهم",
    o_arabic: "فضيلة عربية",
    maxLen: "عدد الحروف على الأكثر",
    any: "أي عدد",
    easy: "سهل النطق بالألمانية والإنجليزية",
    next: "التالي",
    back: "رجوع",
    find: "اقترح الأسماء",
    shuffle: "اقتراحات أخرى",
    edit: "تعديل الإجابات",
    save: "احفظ",
    saved: "محفوظ",
    share: "مشاركة",
    copied: "تم النسخ",
    forBoy: "لولد",
    forGirl: "لبنت",
    classical: "الاسم الكامل",
    withFamily: "مع اسم العائلة",
    v_appears: "الاسم في القرآن",
    v_about: "آية عنها",
    v_root: "آية من الجذر نفسه",
    v_theme: "آية في معنى {theme}",
    listen: "استمع",
    verseRef: "الآية {ref}",
    noPool: "لم نجد اسمًا يوافق هذه الرغبات. خففوا أحد الشروط وحاولوا مرة أخرى.",
    resultLead: "ثلاثة أسماء من أنسب الأسماء، وفي كل مرة تظهر أسماء أخرى.",
    monthNote: "يولد طفلكم في شهر {month}.",
    donateLine: "جعل الله هذا الاسم بركة لطفلكم. يبقى مرشد الأسماء مجانيًّا لكل عائلة، وإن نفعكم فبإمكانكم دعم Quran Masterclass تطوّعًا صدقةً جارية.",
    loved: "الأكثر حبًّا لدى العائلات",
    lovedD: "الأسماء التي حفظتها العائلات هنا أكثر من غيرها.",
    lovedEmpty: "لم يحفظ أحد اسمًا بعد، اضغطوا «احفظ» لتكونوا أول من يفعل.",
    favTitle: "الأسماء المحفوظة",
    favEmpty: "لا توجد أسماء محفوظة بعد. اضغطوا على القلب بجانب أي اسم.",
    favAdd: "احفظ",
    favRemove: "إزالة من المحفوظات",
    copyList: "نسخ القائمة",
    shareList: "مشاركة القائمة",
    filterFor: "المولود",
    all: "الكل",
    theme: "المعنى",
    origin: "الأصل",
    letterF: "الحرف الأول",
    lenF: "الطول",
    search: "ابحث عن اسم أو معنى …",
    count: "{n} اسمًا",
    surprise: "فاجئني",
    noMatch: "لا يوجد اسم يطابق هذا الاختيار.",
    boysN: "{n} اسمًا للبنين",
    girlsN: "{n} اسمًا للبنات",
    abdTitle: "أسماء العبودية",
    abdText: "الأسماء التي تعبّر عن العبودية لله، أي «عبد» مع اسم من أسمائه الحسنى، محبوبة. قال رسول الله ﷺ:",
    abdHadith: "«إِنَّ أَحَبَّ أَسْمَائِكُمْ إِلَى اللَّهِ عَبْدُ اللَّهِ وَعَبْدُ الرَّحْمَنِ»",
    abdSrc: "رواه مسلم 2132",
    changeTitle: "تغيير الاسم القبيح إلى الحسن",
    changeText: "كان النبي ﷺ يغيّر الأسماء القبيحة إلى أسماء حسنة: كانت لعمر ابنة يقال لها «عاصية» (وليست آسية امرأة فرعون)، فسمّاها رسول الله ﷺ «جميلة».",
    changeSrc: "رواه مسلم 2139",
    rulesTitle: "ما لا نقترحه أبدًا",
    rule1: "الأسماء الخاصة بالله تعالى، مثل الرحمن والخالق، فلا يُسمّى بها إلا مع «عبد».",
    rule2: "الأسماء التي فيها تعبيد لغير الله.",
    rule3: "الأسماء ذات المعاني القبيحة أو غير اللائقة.",
    rule4: "اسم الأب أو الأم أو أحد الإخوة.",
    rightTitle: "حق من حقوق الطفل",
    rightText: "اختيار الاسم الحسن من حقوق الطفل، فهو يرافقه طوال حياته. وإن ترددتم فاستشيروا العائلة وأهل العلم.",
    meaningNote: "المعاني مختصرة، ولكثير من الأسماء أكثر من معنى.",
    g_b: "ولد",
    g_g: "بنت",
  },
  tr: {
    metaTitle: "Anlamlarıyla Müslüman bebek isimleri – isim bulucu",
    metaDesc: "Arapça yazılışı, anlamı ve Kur'an ayetiyle 300'den fazla Müslüman erkek ve kız ismi. İsim bulucu çocuğunuz için uygun isimler önerir.",
    kicker: "Çocuğunuz için isimler",
    title: "Güzel bir isim",
    lead: "Ailelerin gerçekten kullandığı Müslüman isimleri – Arapça yazılışı, anlamı ve ismin ya da kökünün Kur'an'da geçtiği ayetle. İsim bulucu sizi dinler ve üç isim önerir.",
    heroRef: "Kur'an 19:7",
    tabFinder: "İsim bulucu",
    tabAll: "Tüm isimler",
    step: "Adım {n} / {total}",
    s1: "Aile",
    s1d: "İsmi ailenize uygun önerebilmemiz ve zaten kullandığınız bir ismi tekrarlamamamız için.",
    s2: "Çocuk",
    s2d: "Cinsiyet, doğum tarihi ve kardeşler – cinsiyet dışında hepsi isteğe bağlıdır.",
    s3: "Dilekleriniz",
    s3d: "İsim neyi ifade etsin? İstediğiniz kadar çok ya da az seçin.",
    s4: "Öneriler",
    father: "Babanın adı",
    mother: "Annenin adı",
    family: "Soyadı (isteğe bağlı)",
    fatherPh: "ör. İbrahim",
    motherPh: "ör. Meryem",
    familyPh: "ör. Yılmaz",
    gender: "Cinsiyet",
    boy: "Erkek",
    girl: "Kız",
    both: "İkisini de önerin",
    date: "Doğum tarihi veya tahmini doğum günü (isteğe bağlı)",
    hijriIs: "İslamî takvimde: {date}",
    siblings: "Kardeşlerin adları (isteğe bağlı, virgülle ayırın)",
    siblingsPh: "ör. Yusuf, Ayşe",
    letter: "Kardeşlere göre baş harf",
    letterAny: "fark etmez",
    letterSame: "aynı harf",
    letterDiff: "farklı harf",
    themesQ: "İsim neyi ifade etsin?",
    originsQ: "İsim nereden gelsin?",
    o_quran: "Kur'an'dan",
    o_prophet: "peygamberler ve aileleri",
    o_companion: "Peygamber'in ﷺ sahabileri",
    o_arabic: "Arapça erdem",
    maxLen: "En fazla bu kadar harf",
    any: "fark etmez",
    easy: "İngilizce konuşanlar için kolay telaffuz edilir",
    next: "İleri",
    back: "Geri",
    find: "İsim bul",
    shuffle: "Yeniden karıştır",
    edit: "Yanıtları değiştir",
    save: "Kaydet",
    saved: "Kaydedildi",
    share: "Paylaş",
    copied: "Kopyalandı",
    forBoy: "Erkek çocuk için",
    forGirl: "Kız çocuk için",
    classical: "Klasik biçim",
    withFamily: "Soyadıyla",
    v_appears: "Kur'an'daki isim",
    v_about: "Onun hakkında bir ayet",
    v_root: "Aynı kökten bir ayet",
    v_theme: "“{theme}” temalı bir ayet",
    listen: "Dinle",
    verseRef: "Kur'an {ref}",
    noPool: "Bu dileklere uygun isim bulamadık. Bir filtreyi gevşetip yeniden deneyin.",
    resultLead: "En uygun olanlardan üç isim – her karıştırmada başkaları görünür.",
    monthNote: "Çocuğunuz {month} ayında dünyaya gelecek.",
    donateLine: "Bu isim çocuğunuz için bir hayır olsun. İsim bulucu her aile için ücretsiz kalır. Size yardımcı olduysa Quran Masterclass'ı gönüllü olarak destekleyebilirsiniz – sadaka-i câriye olarak.",
    loved: "Ailelerin en çok sevdikleri",
    lovedD: "Buradaki ailelerin en sık kaydettiği isimler.",
    lovedEmpty: "Henüz kimse bir isim kaydetmedi – ilk kişi olmak için “Kaydet”e dokunun.",
    favTitle: "Kaydettiğiniz isimler",
    favEmpty: "Henüz kaydedilmiş isim yok. Bir ismin kalbine dokunun.",
    favAdd: "Kaydet",
    favRemove: "Kayıttan kaldır",
    copyList: "Listeyi kopyala",
    shareList: "Listeyi paylaş",
    filterFor: "Kimin için",
    all: "Tümü",
    theme: "Tema",
    origin: "Köken",
    letterF: "Baş harf",
    lenF: "Uzunluk",
    search: "İsim veya anlam ara …",
    count: "{n} isim",
    surprise: "Beni şaşırt",
    noMatch: "Bu seçime uyan isim yok.",
    boysN: "{n} erkek ismi",
    girlsN: "{n} kız ismi",
    abdTitle: "Kulluk isimleri",
    abdText: "Allah'a kulluğu ifade eden isimler – Güzel isimlerinden biriyle “Abd” – özellikle sevilir. Peygamber ﷺ şöyle buyurdu:",
    abdSrc: "Müslim 2132",
    changeTitle: "Kötü isimler yerine iyi isimler",
    changeText: "Peygamber ﷺ kötü anlamlı isimleri güzelleriyle değiştirdi: Ömer'in bir kızının adı ʿĀṣiya idi (“isyankâr”, عاصية – Firavun'un karısı Āsiya ile karıştırılmamalıdır) ve Peygamber ﷺ ona Jamila (“güzel”) adını verdi.",
    changeSrc: "Müslim 2139",
    rulesTitle: "Asla önermediğimiz isimler",
    rule1: "Yalnızca Allah'a ait olan isimler, örneğin er-Rahman veya el-Hâlik – bunlar yalnızca “Abd” ile verilir.",
    rule2: "Allah'tan başkasına kulluğu ifade eden isimler.",
    rule3: "Kötü veya hoş olmayan anlamlı isimler.",
    rule4: "Babanın, annenin veya bir kardeşin ismi.",
    rightTitle: "Çocuğun bir hakkı",
    rightText: "İyi bir isim seçmek çocuğun haklarındandır – ömür boyu onunla birlikte olur. Emin değilseniz ailenize ve bir âlime danışın.",
    meaningNote: "Anlamlar kısa tutulmuştur; birçok isim birden fazla anlam inceliği taşır.",
    g_b: "Erkek",
    g_g: "Kız",
  },
  ur: {
    metaTitle: "معنی کے ساتھ مسلم بچوں کے نام – نام تلاش کرنے والا",
    metaDesc: "300 سے زیادہ مسلم لڑکوں اور لڑکیوں کے نام، عربی املا، معنی اور قرآنی آیت کے ساتھ۔ نام تلاش کرنے والا آپ کے بچے کے لیے موزوں نام تجویز کرتا ہے۔",
    kicker: "آپ کے بچے کے لیے نام",
    title: "ایک خوبصورت نام",
    lead: "مسلم نام جو خاندان واقعی رکھتے ہیں – عربی املا، معنی اور اس آیت کے ساتھ جس میں نام یا اس کی جڑ قرآن میں آتی ہے۔ نام تلاش کرنے والا آپ کی بات سنتا ہے اور تین نام تجویز کرتا ہے۔",
    heroRef: "قرآن 19:7",
    tabFinder: "نام تلاش کرنے والا",
    tabAll: "تمام نام",
    step: "مرحلہ {n} از {total}",
    s1: "خاندان",
    s1d: "تاکہ ہم نام آپ کے خاندان کے مطابق تجویز کریں اور کسی موجود نام کو نہ دہرائیں۔",
    s2: "بچہ",
    s2d: "جنس، متوقع تاریخ اور بہن بھائی – جنس کے سوا سب کچھ اختیاری ہے۔",
    s3: "آپ کی خواہشات",
    s3d: "نام کس چیز کا اظہار کرے؟ جتنا چاہیں چنیں۔",
    s4: "تجاویز",
    father: "والد کا نام",
    mother: "والدہ کا نام",
    family: "خاندانی نام (اختیاری)",
    fatherPh: "مثلاً: ابراہیم",
    motherPh: "مثلاً: مریم",
    familyPh: "مثلاً: خان",
    gender: "بچہ",
    boy: "لڑکا",
    girl: "لڑکی",
    both: "دونوں تجویز کریں",
    date: "تاریخِ پیدائش یا متوقع تاریخ (اختیاری)",
    hijriIs: "اسلامی کیلنڈر میں: {date}",
    siblings: "بہن بھائیوں کے نام (اختیاری، کومے سے الگ کریں)",
    siblingsPh: "مثلاً: یوسف، عائشہ",
    letter: "بہن بھائیوں کے مقابلے میں پہلا حرف",
    letterAny: "کوئی فرق نہیں",
    letterSame: "وہی حرف",
    letterDiff: "مختلف حرف",
    themesQ: "نام کس چیز کا اظہار کرے؟",
    originsQ: "نام کہاں سے ہو؟",
    o_quran: "قرآن سے",
    o_prophet: "انبیاء اور ان کے اہلِ خانہ",
    o_companion: "نبی ﷺ کے صحابہ",
    o_arabic: "عربی خوبی",
    maxLen: "زیادہ سے زیادہ اتنے حروف",
    any: "کوئی بھی",
    easy: "انگریزی بولنے والوں کے لیے آسان تلفظ",
    next: "اگلا",
    back: "واپس",
    find: "نام تلاش کریں",
    shuffle: "دوبارہ ملائیں",
    edit: "جوابات بدلیں",
    save: "محفوظ کریں",
    saved: "محفوظ",
    share: "شیئر کریں",
    copied: "کاپی ہو گیا",
    forBoy: "لڑکے کے لیے",
    forGirl: "لڑکی کے لیے",
    classical: "کلاسیکی صورت",
    withFamily: "خاندانی نام کے ساتھ",
    v_appears: "قرآن میں نام",
    v_about: "ان کے بارے میں ایک آیت",
    v_root: "اسی جڑ سے ایک آیت",
    v_theme: "موضوع «{theme}» پر ایک آیت",
    listen: "سنیں",
    verseRef: "قرآن {ref}",
    noPool: "ان خواہشات کے مطابق کوئی نام نہیں ملا۔ کوئی فلٹر ڈھیلا کریں اور دوبارہ کوشش کریں۔",
    resultLead: "بہترین مطابقت والے ناموں میں سے تین نام – ہر بار ملانے پر دوسرے نام آتے ہیں۔",
    monthNote: "آپ کا بچہ {month} کے مہینے میں پیدا ہو رہا ہے۔",
    donateLine: "اللہ کرے یہ نام آپ کے بچے کے لیے باعثِ برکت ہو۔ نام تلاش کرنے والا ہر خاندان کے لیے مفت رہے گا۔ اگر اس سے آپ کو فائدہ ہوا ہو تو آپ اپنی مرضی سے Quran Masterclass کی مدد کر سکتے ہیں – صدقۂ جاریہ کے طور پر۔",
    loved: "خاندانوں میں مقبول",
    lovedD: "وہ نام جو یہاں کے خاندانوں نے سب سے زیادہ محفوظ کیے۔",
    lovedEmpty: "ابھی تک کسی نے کوئی نام محفوظ نہیں کیا – پہلے بننے کے لیے «محفوظ کریں» دبائیں۔",
    favTitle: "آپ کے محفوظ کردہ نام",
    favEmpty: "ابھی کوئی نام محفوظ نہیں۔ کسی بھی نام پر دل کے نشان کو دبائیں۔",
    favAdd: "محفوظ کریں",
    favRemove: "محفوظات سے ہٹائیں",
    copyList: "فہرست کاپی کریں",
    shareList: "فہرست شیئر کریں",
    filterFor: "برائے",
    all: "سب",
    theme: "موضوع",
    origin: "ماخذ",
    letterF: "پہلا حرف",
    lenF: "لمبائی",
    search: "نام یا معنی تلاش کریں …",
    count: "{n} نام",
    surprise: "حیران کریں",
    noMatch: "اس انتخاب سے کوئی نام نہیں ملتا۔",
    boysN: "لڑکوں کے {n} نام",
    girlsN: "لڑکیوں کے {n} نام",
    abdTitle: "بندگی کے نام",
    abdText: "وہ نام جو اللہ کی بندگی کا اظہار کرتے ہیں – اس کے اچھے ناموں میں سے کسی کے ساتھ «عبد» – خاص طور پر محبوب ہیں۔ نبی ﷺ نے فرمایا:",
    abdSrc: "مسلم 2132",
    changeTitle: "برے ناموں کی جگہ اچھے نام",
    changeText: "نبی ﷺ نے برے معنی والے ناموں کو اچھے ناموں میں بدلا: عمر کی ایک بیٹی کا نام ʿĀṣiya (“نافرمان”، عاصية – فرعون کی بیوی Āsiya سے خلط نہ کیا جائے) تھا، اور نبی ﷺ نے ان کا نام Jamila (“خوبصورت”) رکھا۔",
    changeSrc: "مسلم 2139",
    rulesTitle: "جو نام ہم کبھی تجویز نہیں کرتے",
    rule1: "وہ نام جو صرف اللہ کے لیے ہیں، جیسے الرحمن یا الخالق – یہ صرف «عبد» کے ساتھ رکھے جاتے ہیں۔",
    rule2: "وہ نام جو اللہ کے سوا کسی اور کی بندگی کا اظہار کرتے ہوں۔",
    rule3: "برے یا ناپسندیدہ معنی والے نام۔",
    rule4: "والد، والدہ یا کسی بہن بھائی کا نام۔",
    rightTitle: "بچے کا ایک حق",
    rightText: "اچھا نام چننا بچے کے حقوق میں سے ہے – یہ عمر بھر اس کے ساتھ رہتا ہے۔ اگر آپ کو یقین نہ ہو تو اپنے خاندان اور کسی عالم سے پوچھیں۔",
    meaningNote: "معنی مختصر رکھے گئے ہیں؛ بہت سے ناموں کے کئی پہلو ہوتے ہیں۔",
    g_b: "لڑکا",
    g_g: "لڑکی",
  },
  fa: {
    metaTitle: "نام‌های مسلمان برای نوزاد با معنا – نام‌یاب",
    metaDesc: "بیش از 300 نام پسرانه و دخترانه مسلمان با املای عربی، معنا و آیه قرآن. نام‌یاب نام‌های مناسب برای فرزند شما پیشنهاد می‌کند.",
    kicker: "نام برای فرزند شما",
    title: "یک نام زیبا",
    lead: "نام‌های مسلمانی که خانواده‌ها واقعاً بر فرزندان خود می‌نهند – با املای عربی، معنا و آیه‌ای از قرآن که نام یا ریشه آن در آن آمده است. نام‌یاب به شما گوش می‌دهد و سه نام پیشنهاد می‌کند.",
    heroRef: "قرآن 19:7",
    tabFinder: "نام‌یاب",
    tabAll: "همه نام‌ها",
    step: "گام {n} از {total}",
    s1: "خانواده",
    s1d: "تا نام را متناسب با خانواده شما پیشنهاد دهیم و نامی را که از قبل دارید تکرار نکنیم.",
    s2: "کودک",
    s2d: "جنسیت، زمان تولد و خواهر و برادرها – جز جنسیت، همه‌چیز اختیاری است.",
    s3: "خواسته‌های شما",
    s3d: "نام چه چیزی را بیان کند؟ هر قدر که می‌خواهید انتخاب کنید.",
    s4: "پیشنهادها",
    father: "نام پدر",
    mother: "نام مادر",
    family: "نام خانوادگی (اختیاری)",
    fatherPh: "مثلاً: ابراهیم",
    motherPh: "مثلاً: مریم",
    familyPh: "مثلاً: رضایی",
    gender: "برای",
    boy: "پسر",
    girl: "دختر",
    both: "هر دو را پیشنهاد دهید",
    date: "تاریخ تولد یا موعد زایمان (اختیاری)",
    hijriIs: "در تقویم اسلامی: {date}",
    siblings: "نام خواهر و برادرها (اختیاری، با ویرگول جدا کنید)",
    siblingsPh: "مثلاً: یوسف، عایشه",
    letter: "حرف اول در مقایسه با خواهر و برادرها",
    letterAny: "فرقی نمی‌کند",
    letterSame: "همان حرف",
    letterDiff: "حرف متفاوت",
    themesQ: "نام چه چیزی را بیان کند؟",
    originsQ: "نام از کجا باشد؟",
    o_quran: "از قرآن",
    o_prophet: "پیامبران و خانواده‌هایشان",
    o_companion: "یاران پیامبر ﷺ",
    o_arabic: "فضیلت عربی",
    maxLen: "حداکثر این تعداد حرف",
    any: "هر تعداد",
    easy: "تلفظ آسان برای انگلیسی‌زبانان",
    next: "بعدی",
    back: "بازگشت",
    find: "یافتن نام",
    shuffle: "دوباره مخلوط کنید",
    edit: "تغییر پاسخ‌ها",
    save: "ذخیره",
    saved: "ذخیره شد",
    share: "اشتراک‌گذاری",
    copied: "رونوشت شد",
    forBoy: "برای پسر",
    forGirl: "برای دختر",
    classical: "شکل کلاسیک",
    withFamily: "با نام خانوادگی",
    v_appears: "نام در قرآن",
    v_about: "آیه‌ای درباره او",
    v_root: "آیه‌ای از همین ریشه",
    v_theme: "آیه‌ای با مضمون «{theme}»",
    listen: "شنیدن",
    verseRef: "قرآن {ref}",
    noPool: "برای این خواسته‌ها نامی پیدا نکردیم. یکی از فیلترها را سبک‌تر کنید و دوباره امتحان کنید.",
    resultLead: "سه نام از میان مناسب‌ترین‌ها – با هر بار مخلوط کردن نام‌های دیگری نمایش داده می‌شود.",
    monthNote: "فرزند شما در ماه {month} به دنیا می‌آید.",
    donateLine: "ان‌شاءالله این نام برای فرزندتان مایه برکت باشد. نام‌یاب برای هر خانواده رایگان می‌ماند. اگر به شما کمک کرد، می‌توانید داوطلبانه از Quran Masterclass حمایت کنید – به‌عنوان صدقه جاریه.",
    loved: "محبوب خانواده‌ها",
    lovedD: "نام‌هایی که خانواده‌های اینجا بیش از همه ذخیره کرده‌اند.",
    lovedEmpty: "هنوز کسی نامی را ذخیره نکرده – روی «ذخیره» بزنید تا اولین نفر باشید.",
    favTitle: "نام‌های ذخیره‌شده شما",
    favEmpty: "هنوز نامی ذخیره نشده. روی قلب کنار هر نام بزنید.",
    favAdd: "ذخیره",
    favRemove: "حذف از ذخیره‌شده‌ها",
    copyList: "رونوشت فهرست",
    shareList: "اشتراک‌گذاری فهرست",
    filterFor: "برای",
    all: "همه",
    theme: "مضمون",
    origin: "خاستگاه",
    letterF: "حرف اول",
    lenF: "طول",
    search: "جست‌وجوی نام یا معنا …",
    count: "{n} نام",
    surprise: "غافلگیرم کن",
    noMatch: "هیچ نامی با این انتخاب جور نیست.",
    boysN: "{n} نام پسرانه",
    girlsN: "{n} نام دخترانه",
    abdTitle: "نام‌های بندگی",
    abdText: "نام‌هایی که بندگی خدا را بیان می‌کنند – «عبد» همراه یکی از نام‌های زیبای او – بسیار محبوب‌اند. پیامبر ﷺ فرمود:",
    abdSrc: "مسلم 2132",
    changeTitle: "نام‌های نیکو به جای نام‌های ناپسند",
    changeText: "پیامبر ﷺ نام‌های دارای معنای ناپسند را به نام‌های نیکو تغییر می‌داد: یکی از دختران عمر ʿĀṣiya («نافرمان»، عاصية – که نباید با Āsiya، همسر فرعون، اشتباه شود) نام داشت و پیامبر ﷺ او را Jamila («زیبا») نامید.",
    changeSrc: "مسلم 2139",
    rulesTitle: "نام‌هایی که هرگز پیشنهاد نمی‌دهیم",
    rule1: "نام‌هایی که فقط از آنِ خدا هستند، مانند الرحمن یا الخالق – این‌ها فقط همراه «عبد» گذاشته می‌شوند.",
    rule2: "نام‌هایی که بندگی کسی جز خدا را بیان می‌کنند.",
    rule3: "نام‌هایی با معنای ناپسند یا ناخوشایند.",
    rule4: "نام پدر، مادر یا یکی از خواهر و برادرها.",
    rightTitle: "حقی از کودک",
    rightText: "انتخاب نام نیکو از حقوق کودک است – این نام تا پایان عمر همراه اوست. اگر مطمئن نیستید، از خانواده و یک عالم بپرسید.",
    meaningNote: "معناها کوتاه آمده‌اند؛ بسیاری از نام‌ها چند بُعد معنایی دارند.",
    g_b: "پسر",
    g_g: "دختر",
  },
  ps: {
    metaTitle: "د معنا سره د مسلمانو ماشومانو نومونه – نوم موندونکی",
    metaDesc: "له 300 څخه زیات مسلمان هلکانو او انجونو نومونه د عربي املا، معنا او قرآني آیت سره. نوم موندونکی ستاسو د ماشوم لپاره مناسب نومونه وړاندیز کوي.",
    kicker: "ستاسو د ماشوم لپاره نومونه",
    title: "یو ښکلی نوم",
    lead: "د مسلمانو نومونه چې کورنۍ یې په رښتیا کاروي – د عربي املا، معنا او هغه آیت سره چې نوم یا ریښه یې په قرآن کې راغلې. نوم موندونکی ستاسو خبرو ته غوږ نیسي او درې نومونه وړاندیز کوي.",
    heroRef: "قرآن 19:7",
    tabFinder: "نوم موندونکی",
    tabAll: "ټول نومونه",
    step: "{n} ګام له {total}",
    s1: "کورنۍ",
    s1d: "ترڅو نوم ستاسو کورنۍ ته مناسب وړاندیز کړو او هغه نوم تکرار نه کړو چې لا مخکې شته.",
    s2: "ماشوم",
    s2d: "جنس، د زېږون نېټه او ورونه/خویندې – له جنس پرته ټول اختیاري دي.",
    s3: "ستاسو هیلې",
    s3d: "نوم دې څه څرګند کړي؟ هرڅومره چې وغواړئ وټاکئ.",
    s4: "وړاندیزونه",
    father: "د پلار نوم",
    mother: "د مور نوم",
    family: "کورنی نوم (اختیاري)",
    fatherPh: "مثلاً: ابراهیم",
    motherPh: "مثلاً: مریم",
    familyPh: "مثلاً: احمدزی",
    gender: "لپاره",
    boy: "هلک",
    girl: "انجلۍ",
    both: "دواړه وړاندیز کړئ",
    date: "د زېږون نېټه یا اټکلي نېټه (اختیاري)",
    hijriIs: "په اسلامي کالیزه کې: {date}",
    siblings: "د ورونو/خویندو نومونه (اختیاري، په کوما جلا کړئ)",
    siblingsPh: "مثلاً: یوسف، عایشه",
    letter: "د ورونو/خویندو په پرتله لومړی توری",
    letterAny: "فرق نه کوي",
    letterSame: "ورته توری",
    letterDiff: "بل توری",
    themesQ: "نوم دې څه څرګند کړي؟",
    originsQ: "نوم دې له کومه ځایه وي؟",
    o_quran: "له قرآن څخه",
    o_prophet: "پیغمبران او د هغوی کورنۍ",
    o_companion: "د پیغمبر ﷺ صحابه",
    o_arabic: "عربي فضیلت",
    maxLen: "تر ډېره دومره توري",
    any: "هر شمېر",
    easy: "د انګلیسي ژبو لپاره په اسانۍ ویل کېږي",
    next: "بل",
    back: "شاته",
    find: "نومونه ومومئ",
    shuffle: "بیا ګډ کړئ",
    edit: "ځوابونه بدل کړئ",
    save: "خوندي کړئ",
    saved: "خوندي شو",
    share: "شریکول",
    copied: "کاپي شو",
    forBoy: "د هلک لپاره",
    forGirl: "د انجلۍ لپاره",
    classical: "کلاسیکه بڼه",
    withFamily: "له کورني نوم سره",
    v_appears: "په قرآن کې نوم",
    v_about: "د هغې په اړه یو آیت",
    v_root: "له ورته ریښې یو آیت",
    v_theme: "د «{theme}» په اړه یو آیت",
    listen: "واورئ",
    verseRef: "قرآن {ref}",
    noPool: "د دې هیلو لپاره مو نوم ونه موند. یو فلټر ورو کړئ او بیا هڅه وکړئ.",
    resultLead: "له غوره برابرو نومونو څخه درې نومونه – هر ځل ګډولو سره نور نومونه ښکاري.",
    monthNote: "ستاسو ماشوم د {month} په میاشت کې زېږېږي.",
    donateLine: "دا نوم دې ستاسو د ماشوم لپاره د برکت سبب شي. نوم موندونکی د هرې کورنۍ لپاره وړیا پاتې کېږي. که ستاسو سره یې مرسته وکړه، تاسو کولای شئ په خپله خوښه له Quran Masterclass ملاتړ وکړئ – د صدقه جاریه په توګه.",
    loved: "د کورنیو خوښ شوي",
    lovedD: "هغه نومونه چې دلته کورنیو تر ټولو ډېر خوندي کړي.",
    lovedEmpty: "تر اوسه چا نوم خوندي نه دی کړی – د لومړي کس کېدو لپاره «خوندي کړئ» ټک کړئ.",
    favTitle: "ستاسو خوندي شوي نومونه",
    favEmpty: "تر اوسه هېڅ نوم خوندي نه دی. پر هر نوم د زړه نښه ټک کړئ.",
    favAdd: "خوندي کړئ",
    favRemove: "له خوندي شویو لرې کړئ",
    copyList: "لیست کاپي کړئ",
    shareList: "لیست شریک کړئ",
    filterFor: "لپاره",
    all: "ټول",
    theme: "موضوع",
    origin: "اصل",
    letterF: "لومړی توری",
    lenF: "اوږدوالی",
    search: "نوم یا معنا ولټوئ …",
    count: "{n} نومونه",
    surprise: "ما حیران کړه",
    noMatch: "هېڅ نوم د دې انتخاب سره نه برابرېږي.",
    boysN: "د هلکانو {n} نومونه",
    girlsN: "د انجونو {n} نومونه",
    abdTitle: "د بندګۍ نومونه",
    abdText: "هغه نومونه چې د الله بندګي څرګندوي – د هغه د ښکلو نومونو له یوه سره «عبد» – ډېر ګران دي. پیغمبر ﷺ وفرمایل:",
    abdSrc: "مسلم 2132",
    changeTitle: "د بدو نومونو پر ځای ښه نومونه",
    changeText: "پیغمبر ﷺ د بد معنا نومونه په ښو نومونو بدل کړل: د عمر یوې لور ته ʿĀṣiya («نافرماني»، عاصية – چې د فرعون له ښځې Āsiya سره باید ګډوډ نشي) ویل کېدل، او پیغمبر ﷺ هغې ته Jamila («ښکلې») نوم ورکړ.",
    changeSrc: "مسلم 2139",
    rulesTitle: "هغه نومونه چې هېڅکله وړاندیز نه کوو",
    rule1: "هغه نومونه چې یوازې د الله دي، لکه الرحمن یا الخالق – دا یوازې له «عبد» سره ورکول کېږي.",
    rule2: "هغه نومونه چې د الله پر ځای د بل چا بندګي څرګندوي.",
    rule3: "د بدې یا ناوړې معنا لرونکي نومونه.",
    rule4: "د پلار، مور یا د یوه ورور/خور نوم.",
    rightTitle: "د ماشوم یو حق",
    rightText: "ښه نوم غوره کول د ماشوم له حقونو څخه دی – دا ټول عمر ورسره پاتې کېږي. که ډاډه نه یاست، له خپلې کورنۍ او یوه عالم څخه وپوښتئ.",
    meaningNote: "معناګانې لنډې ساتل شوې؛ ډېر نومونه څو معنايي رنګونه لري.",
    g_b: "هلک",
    g_g: "انجلۍ",
  },
  fr: {
    metaTitle: "Prénoms musulmans avec leur signification – chercheur de prénoms",
    metaDesc: "Plus de 300 prénoms musulmans de garçons et de filles, avec graphie arabe, signification et verset du Coran. Le chercheur de prénoms vous suggère des prénoms adaptés à votre enfant.",
    kicker: "Des prénoms pour votre enfant",
    title: "Un beau prénom",
    lead: "Des prénoms musulmans que les familles portent vraiment – avec la graphie arabe, la signification et le verset où le prénom ou sa racine apparaît dans le Coran. Le chercheur de prénoms vous écoute et propose trois prénoms.",
    heroRef: "Coran 19:7",
    tabFinder: "Chercheur de prénoms",
    tabAll: "Tous les prénoms",
    step: "Étape {n} sur {total}",
    s1: "La famille",
    s1d: "Pour que le prénom convienne à votre famille et ne répète pas un prénom que vous avez déjà.",
    s2: "L'enfant",
    s2d: "Sexe, date de naissance et frères et sœurs – tout est facultatif, sauf le sexe.",
    s3: "Vos souhaits",
    s3d: "Que doit exprimer le prénom ? Choisissez autant ou aussi peu que vous voulez.",
    s4: "Suggestions",
    father: "Prénom du père",
    mother: "Prénom de la mère",
    family: "Nom de famille (facultatif)",
    fatherPh: "p. ex. Ibrahim",
    motherPh: "p. ex. Maryam",
    familyPh: "p. ex. Benali",
    gender: "Pour",
    boy: "Garçon",
    girl: "Fille",
    both: "Proposez-nous les deux",
    date: "Date de naissance ou date prévue (facultatif)",
    hijriIs: "Dans le calendrier islamique : {date}",
    siblings: "Prénoms des frères et sœurs (facultatif, séparés par des virgules)",
    siblingsPh: "p. ex. Yusuf, Aïcha",
    letter: "Première lettre par rapport aux frères et sœurs",
    letterAny: "peu importe",
    letterSame: "même lettre",
    letterDiff: "lettre différente",
    themesQ: "Que doit exprimer le prénom ?",
    originsQ: "D'où peut venir le prénom ?",
    o_quran: "du Coran",
    o_prophet: "prophètes et leurs familles",
    o_companion: "compagnons du Prophète ﷺ",
    o_arabic: "vertu arabe",
    maxLen: "Au plus ce nombre de lettres",
    any: "peu importe",
    easy: "Facile à prononcer en anglais",
    next: "Suivant",
    back: "Retour",
    find: "Trouver des prénoms",
    shuffle: "Mélanger à nouveau",
    edit: "Modifier les réponses",
    save: "Garder",
    saved: "Gardé",
    share: "Partager",
    copied: "Copié",
    forBoy: "Pour un garçon",
    forGirl: "Pour une fille",
    classical: "Forme classique",
    withFamily: "Avec le nom de famille",
    v_appears: "Le prénom dans le Coran",
    v_about: "Un verset à son sujet",
    v_root: "Un verset de la même racine",
    v_theme: "Un verset sur le thème « {theme} »",
    listen: "Écouter",
    verseRef: "Coran {ref}",
    noPool: "Nous n'avons trouvé aucun prénom pour ces souhaits. Assouplissez un filtre et réessayez.",
    resultLead: "Trois prénoms parmi les meilleurs résultats – chaque mélange en montre d'autres.",
    monthNote: "Votre enfant naît au mois de {month}.",
    donateLine: "Que ce prénom soit une bénédiction pour votre enfant. Le chercheur de prénoms reste gratuit pour chaque famille. S'il vous a aidés, vous pouvez soutenir Quran Masterclass librement – comme sadaqa jariya.",
    loved: "Les préférés des familles",
    lovedD: "Les prénoms que les familles d'ici ont gardés le plus souvent.",
    lovedEmpty: "Personne n'a encore gardé de prénom – appuyez sur « Garder » pour être le premier.",
    favTitle: "Vos prénoms gardés",
    favEmpty: "Aucun prénom gardé pour l'instant. Appuyez sur le cœur d'un prénom.",
    favAdd: "Garder",
    favRemove: "Ne plus garder",
    copyList: "Copier la liste",
    shareList: "Partager la liste",
    filterFor: "Pour",
    all: "Tous",
    theme: "Thème",
    origin: "Origine",
    letterF: "Première lettre",
    lenF: "Longueur",
    search: "Chercher un prénom ou une signification …",
    count: "{n} prénoms",
    surprise: "Surprenez-moi",
    noMatch: "Aucun prénom ne correspond à cette sélection.",
    boysN: "{n} prénoms de garçons",
    girlsN: "{n} prénoms de filles",
    abdTitle: "Prénoms de servitude",
    abdText: "Les prénoms qui expriment la servitude envers Allah – « Abd » suivi de l'un de Ses beaux noms – sont particulièrement aimés. Le Prophète ﷺ a dit :",
    abdSrc: "Muslim 2132",
    changeTitle: "De bons prénoms à la place des mauvais",
    changeText: "Le Prophète ﷺ changeait les prénoms de mauvais sens en prénoms de bon sens : une fille d'Umar s'appelait ʿĀṣiya (« la désobéissante », عاصية – à ne pas confondre avec Āsiya, l'épouse de Pharaon), et il l'a appelée Jamila (« la belle »).",
    changeSrc: "Muslim 2139",
    rulesTitle: "Ce que nous ne proposons jamais",
    rule1: "Les prénoms qui appartiennent à Allah seul, comme ar-Rahman ou al-Khaliq – ils ne se donnent qu'avec « Abd ».",
    rule2: "Les prénoms qui expriment la servitude envers quelqu'un d'autre qu'Allah.",
    rule3: "Les prénoms de sens mauvais ou désagréable.",
    rule4: "Le prénom du père, de la mère ou d'un frère ou d'une sœur.",
    rightTitle: "Un droit de l'enfant",
    rightText: "Choisir un bon prénom fait partie des droits de l'enfant – il l'accompagne toute sa vie. En cas de doute, demandez conseil à votre famille et à un savant.",
    meaningNote: "Les significations sont courtes ; beaucoup de prénoms portent plusieurs nuances.",
    g_b: "Garçon",
    g_g: "Fille",
  },
  es: {
    metaTitle: "Nombres musulmanes para bebés con su significado – buscador de nombres",
    metaDesc: "Más de 300 nombres musulmanes de niños y niñas con escritura árabe, significado y aleya del Corán. El buscador de nombres sugiere nombres adecuados para tu bebé.",
    kicker: "Nombres para tu bebé",
    title: "Un nombre hermoso",
    lead: "Nombres musulmanes que las familias realmente usan, con su escritura árabe, su significado y la aleya del Corán donde aparece el nombre o su raíz. El buscador de nombres te escucha y te sugiere tres nombres.",
    heroRef: "Corán 19:7",
    tabFinder: "Buscador de nombres",
    tabAll: "Todos los nombres",
    step: "Paso {n} de {total}",
    s1: "La familia",
    s1d: "Para que el nombre encaje con tu familia y no repita uno que ya tienes.",
    s2: "El bebé",
    s2d: "Sexo, fecha de nacimiento y hermanos: todo es opcional salvo el sexo.",
    s3: "Tus deseos",
    s3d: "¿Qué debe expresar el nombre? Elige tanto o tan poco como quieras.",
    s4: "Sugerencias",
    father: "Nombre del padre",
    mother: "Nombre de la madre",
    family: "Apellido (opcional)",
    fatherPh: "p. ej. Ibrahim",
    motherPh: "p. ej. Maryam",
    familyPh: "p. ej. Haddad",
    gender: "Para",
    boy: "Niño",
    girl: "Niña",
    both: "Sugiéreme ambos",
    date: "Fecha de nacimiento o fecha prevista (opcional)",
    hijriIs: "En el calendario islámico: {date}",
    siblings: "Nombres de los hermanos (opcional, separados por comas)",
    siblingsPh: "p. ej. Yusuf, Aisha",
    letter: "Primera letra respecto a los hermanos",
    letterAny: "da igual",
    letterSame: "la misma letra",
    letterDiff: "otra letra",
    themesQ: "¿Qué debe expresar el nombre?",
    originsQ: "¿De dónde puede venir el nombre?",
    o_quran: "del Corán",
    o_prophet: "profetas y sus familias",
    o_companion: "compañeros del Profeta ﷺ",
    o_arabic: "virtud árabe",
    maxLen: "Como máximo esta cantidad de letras",
    any: "cualquiera",
    easy: "Fácil de pronunciar en inglés",
    next: "Siguiente",
    back: "Atrás",
    find: "Buscar nombres",
    shuffle: "Mezclar de nuevo",
    edit: "Cambiar respuestas",
    save: "Guardar",
    saved: "Guardado",
    share: "Compartir",
    copied: "Copiado",
    forBoy: "Para un niño",
    forGirl: "Para una niña",
    classical: "Forma clásica",
    withFamily: "Con apellido",
    v_appears: "El nombre en el Corán",
    v_about: "Una aleya sobre ella",
    v_root: "Una aleya de la misma raíz",
    v_theme: "Una aleya sobre el tema «{theme}»",
    listen: "Escuchar",
    verseRef: "Corán {ref}",
    noPool: "No hemos encontrado ningún nombre para estos deseos. Afloja un filtro e inténtalo de nuevo.",
    resultLead: "Tres nombres entre las mejores coincidencias; cada mezcla muestra otros.",
    monthNote: "Tu bebé nace en el mes de {month}.",
    donateLine: "Que este nombre sea una bendición para tu bebé. El buscador de nombres seguirá siendo gratuito para todas las familias. Si te ha ayudado, puedes apoyar Quran Masterclass de forma voluntaria, como sadaqa yariya.",
    loved: "Los favoritos de las familias",
    lovedD: "Los nombres que más han guardado las familias de aquí.",
    lovedEmpty: "Nadie ha guardado todavía ningún nombre: toca «Guardar» para ser el primero.",
    favTitle: "Tus nombres guardados",
    favEmpty: "Aún no has guardado ningún nombre. Toca el corazón de cualquier nombre.",
    favAdd: "Guardar",
    favRemove: "Quitar de guardados",
    copyList: "Copiar lista",
    shareList: "Compartir lista",
    filterFor: "Para",
    all: "Todos",
    theme: "Tema",
    origin: "Origen",
    letterF: "Primera letra",
    lenF: "Longitud",
    search: "Buscar un nombre o significado …",
    count: "{n} nombres",
    surprise: "Sorpréndeme",
    noMatch: "Ningún nombre coincide con esta selección.",
    boysN: "{n} nombres de niño",
    girlsN: "{n} nombres de niña",
    abdTitle: "Nombres de servidumbre",
    abdText: "Los nombres que expresan servidumbre hacia Allah («Abd» seguido de uno de Sus nombres hermosos) son especialmente queridos. El Profeta ﷺ dijo:",
    abdSrc: "Muslim 2132",
    changeTitle: "Nombres buenos en lugar de malos",
    changeText: "El Profeta ﷺ cambiaba los nombres de mal significado por otros buenos: una hija de Umar se llamaba ʿĀṣiya («la desobediente», عاصية; no debe confundirse con Āsiya, la esposa del faraón), y él la llamó Jamila («la hermosa»).",
    changeSrc: "Muslim 2139",
    rulesTitle: "Lo que nunca sugerimos",
    rule1: "Nombres que pertenecen solo a Allah, como ar-Rahman o al-Khaliq: solo se dan con «Abd».",
    rule2: "Nombres que expresan servidumbre hacia alguien que no sea Allah.",
    rule3: "Nombres con un significado malo o desagradable.",
    rule4: "El nombre del padre, de la madre o de un hermano.",
    rightTitle: "Un derecho del niño",
    rightText: "Elegir un buen nombre es uno de los derechos del niño: lo acompaña toda la vida. Si tienes dudas, pregunta a tu familia y a un sabio.",
    meaningNote: "Los significados son breves; muchos nombres tienen varios matices.",
    g_b: "Niño",
    g_g: "Niña",
  },
  id: {
    metaTitle: "Nama bayi Muslim beserta artinya – pencari nama",
    metaDesc: "Lebih dari 300 nama Muslim untuk anak laki-laki dan perempuan lengkap dengan tulisan Arab, arti, dan ayat Al-Qur'an. Pencari nama menyarankan nama yang cocok untuk anak Anda.",
    kicker: "Nama untuk anak Anda",
    title: "Nama yang indah",
    lead: "Nama-nama Muslim yang benar-benar dipakai keluarga – lengkap dengan tulisan Arab, arti, dan ayat tempat nama atau akarnya disebut dalam Al-Qur'an. Pencari nama mendengarkan Anda dan menyarankan tiga nama.",
    heroRef: "Al-Qur'an 19:7",
    tabFinder: "Pencari nama",
    tabAll: "Semua nama",
    step: "Langkah {n} dari {total}",
    s1: "Keluarga",
    s1d: "Agar nama yang disarankan cocok dengan keluarga Anda dan tidak mengulang nama yang sudah ada.",
    s2: "Anak",
    s2d: "Jenis kelamin, perkiraan lahir, dan kakak-adik – semuanya opsional kecuali jenis kelamin.",
    s3: "Harapan Anda",
    s3d: "Apa yang ingin diungkapkan oleh nama itu? Pilih sebanyak atau sesedikit yang Anda mau.",
    s4: "Saran",
    father: "Nama ayah",
    mother: "Nama ibu",
    family: "Nama keluarga (opsional)",
    fatherPh: "mis. Ibrahim",
    motherPh: "mis. Maryam",
    familyPh: "mis. Hidayat",
    gender: "Untuk",
    boy: "Laki-laki",
    girl: "Perempuan",
    both: "Sarankan keduanya",
    date: "Tanggal lahir atau perkiraan lahir (opsional)",
    hijriIs: "Dalam kalender Islam: {date}",
    siblings: "Nama kakak/adik (opsional, pisahkan dengan koma)",
    siblingsPh: "mis. Yusuf, Aisyah",
    letter: "Huruf awal dibandingkan kakak/adik",
    letterAny: "bebas",
    letterSame: "huruf yang sama",
    letterDiff: "huruf yang berbeda",
    themesQ: "Apa yang ingin diungkapkan oleh nama itu?",
    originsQ: "Dari mana nama itu boleh berasal?",
    o_quran: "dari Al-Qur'an",
    o_prophet: "para nabi dan keluarganya",
    o_companion: "sahabat Nabi ﷺ",
    o_arabic: "kebajikan Arab",
    maxLen: "Paling banyak sekian huruf",
    any: "bebas",
    easy: "Mudah diucapkan dalam bahasa Inggris",
    next: "Lanjut",
    back: "Kembali",
    find: "Cari nama",
    shuffle: "Acak lagi",
    edit: "Ubah jawaban",
    save: "Simpan",
    saved: "Tersimpan",
    share: "Bagikan",
    copied: "Tersalin",
    forBoy: "Untuk anak laki-laki",
    forGirl: "Untuk anak perempuan",
    classical: "Bentuk klasik",
    withFamily: "Dengan nama keluarga",
    v_appears: "Nama dalam Al-Qur'an",
    v_about: "Ayat tentang dirinya",
    v_root: "Ayat dari akar yang sama",
    v_theme: "Ayat bertema “{theme}”",
    listen: "Dengarkan",
    verseRef: "Al-Qur'an {ref}",
    noPool: "Kami tidak menemukan nama untuk harapan ini. Longgarkan salah satu filter, lalu coba lagi.",
    resultLead: "Tiga nama dari yang paling cocok – setiap pengacakan menampilkan nama lain.",
    monthNote: "Anak Anda lahir pada bulan {month}.",
    donateLine: "Semoga nama ini menjadi berkah bagi anak Anda. Pencari nama tetap gratis untuk setiap keluarga. Jika membantu Anda, Anda boleh mendukung Quran Masterclass secara sukarela – sebagai sedekah jariah.",
    loved: "Favorit keluarga",
    lovedD: "Nama yang paling sering disimpan keluarga di sini.",
    lovedEmpty: "Belum ada yang menyimpan nama – ketuk “Simpan” untuk menjadi yang pertama.",
    favTitle: "Nama yang Anda simpan",
    favEmpty: "Belum ada nama tersimpan. Ketuk ikon hati pada nama mana pun.",
    favAdd: "Simpan",
    favRemove: "Hapus dari simpanan",
    copyList: "Salin daftar",
    shareList: "Bagikan daftar",
    filterFor: "Untuk",
    all: "Semua",
    theme: "Tema",
    origin: "Asal",
    letterF: "Huruf awal",
    lenF: "Panjang",
    search: "Cari nama atau arti …",
    count: "{n} nama",
    surprise: "Kejutkan saya",
    noMatch: "Tidak ada nama yang cocok dengan pilihan ini.",
    boysN: "{n} nama laki-laki",
    girlsN: "{n} nama perempuan",
    abdTitle: "Nama-nama penghambaan",
    abdText: "Nama yang mengungkapkan penghambaan kepada Allah – “Abd” bersama salah satu nama-Nya yang indah – sangat dicintai. Nabi ﷺ bersabda:",
    abdSrc: "HR. Muslim 2132",
    changeTitle: "Nama yang baik sebagai ganti yang buruk",
    changeText: "Nabi ﷺ mengganti nama-nama yang berarti buruk dengan nama yang baik: seorang putri Umar bernama ʿĀṣiya (“yang durhaka”, عاصية – jangan dikacaukan dengan Āsiya, istri Firaun), dan beliau menamainya Jamila (“yang cantik”).",
    changeSrc: "HR. Muslim 2139",
    rulesTitle: "Yang tidak pernah kami sarankan",
    rule1: "Nama yang hanya milik Allah, seperti ar-Rahman atau al-Khaliq – nama itu hanya diberikan dengan “Abd”.",
    rule2: "Nama yang mengungkapkan penghambaan kepada selain Allah.",
    rule3: "Nama dengan arti buruk atau tidak pantas.",
    rule4: "Nama ayah, ibu, atau saudara kandung.",
    rightTitle: "Hak seorang anak",
    rightText: "Memilih nama yang baik termasuk hak anak – nama itu menyertainya seumur hidup. Jika ragu, tanyakan kepada keluarga Anda dan seorang ulama.",
    meaningNote: "Arti dibuat ringkas; banyak nama memiliki beberapa nuansa makna.",
    g_b: "Laki-laki",
    g_g: "Perempuan",
  },
  ms: {
    metaTitle: "Nama bayi Muslim beserta maknanya – pencari nama",
    metaDesc: "Lebih 300 nama Muslim untuk lelaki dan perempuan lengkap dengan tulisan Arab, makna dan ayat Quran. Pencari nama mencadangkan nama yang sesuai untuk anak anda.",
    kicker: "Nama untuk anak anda",
    title: "Nama yang indah",
    lead: "Nama-nama Muslim yang benar-benar digunakan oleh keluarga – lengkap dengan tulisan Arab, makna dan ayat tempat nama atau akarnya disebut dalam Quran. Pencari nama mendengar anda dan mencadangkan tiga nama.",
    heroRef: "Quran 19:7",
    tabFinder: "Pencari nama",
    tabAll: "Semua nama",
    step: "Langkah {n} daripada {total}",
    s1: "Keluarga",
    s1d: "Supaya nama yang dicadangkan sesuai dengan keluarga anda dan tidak mengulang nama yang sudah ada.",
    s2: "Anak",
    s2d: "Jantina, tarikh jangkaan lahir dan adik-beradik – semuanya pilihan kecuali jantina.",
    s3: "Harapan anda",
    s3d: "Apakah yang ingin diungkapkan oleh nama itu? Pilih sebanyak atau sesedikit yang anda mahu.",
    s4: "Cadangan",
    father: "Nama bapa",
    mother: "Nama ibu",
    family: "Nama keluarga (pilihan)",
    fatherPh: "cth. Ibrahim",
    motherPh: "cth. Maryam",
    familyPh: "cth. Hashim",
    gender: "Untuk",
    boy: "Lelaki",
    girl: "Perempuan",
    both: "Cadangkan kedua-duanya",
    date: "Tarikh lahir atau tarikh jangkaan lahir (pilihan)",
    hijriIs: "Dalam takwim Islam: {date}",
    siblings: "Nama adik-beradik (pilihan, asingkan dengan koma)",
    siblingsPh: "cth. Yusuf, Aisyah",
    letter: "Huruf pertama berbanding adik-beradik",
    letterAny: "tiada pilihan",
    letterSame: "huruf yang sama",
    letterDiff: "huruf yang berbeza",
    themesQ: "Apakah yang ingin diungkapkan oleh nama itu?",
    originsQ: "Dari mana nama itu boleh berasal?",
    o_quran: "daripada Quran",
    o_prophet: "para nabi dan keluarga mereka",
    o_companion: "sahabat Nabi ﷺ",
    o_arabic: "kebaikan Arab",
    maxLen: "Paling banyak sekian huruf",
    any: "mana-mana",
    easy: "Mudah disebut dalam bahasa Inggeris",
    next: "Seterusnya",
    back: "Kembali",
    find: "Cari nama",
    shuffle: "Kocok semula",
    edit: "Ubah jawapan",
    save: "Simpan",
    saved: "Disimpan",
    share: "Kongsi",
    copied: "Disalin",
    forBoy: "Untuk anak lelaki",
    forGirl: "Untuk anak perempuan",
    classical: "Bentuk klasik",
    withFamily: "Dengan nama keluarga",
    v_appears: "Nama dalam Quran",
    v_about: "Ayat tentang dirinya",
    v_root: "Ayat daripada akar yang sama",
    v_theme: "Ayat bertema “{theme}”",
    listen: "Dengar",
    verseRef: "Quran {ref}",
    noPool: "Kami tidak menemui nama untuk harapan ini. Longgarkan satu penapis dan cuba lagi.",
    resultLead: "Tiga nama daripada padanan terbaik – setiap kocokan menunjukkan nama lain.",
    monthNote: "Anak anda dilahirkan pada bulan {month}.",
    donateLine: "Semoga nama ini menjadi berkat untuk anak anda. Pencari nama kekal percuma untuk setiap keluarga. Jika ia membantu anda, anda dialu-alukan menyokong Quran Masterclass secara sukarela – sebagai sedekah jariah.",
    loved: "Kegemaran keluarga",
    lovedD: "Nama yang paling kerap disimpan oleh keluarga di sini.",
    lovedEmpty: "Belum ada yang menyimpan nama – ketik “Simpan” untuk menjadi yang pertama.",
    favTitle: "Nama yang anda simpan",
    favEmpty: "Belum ada nama disimpan. Ketik ikon hati pada mana-mana nama.",
    favAdd: "Simpan",
    favRemove: "Buang daripada simpanan",
    copyList: "Salin senarai",
    shareList: "Kongsi senarai",
    filterFor: "Untuk",
    all: "Semua",
    theme: "Tema",
    origin: "Asal",
    letterF: "Huruf pertama",
    lenF: "Panjang",
    search: "Cari nama atau makna …",
    count: "{n} nama",
    surprise: "Kejutkan saya",
    noMatch: "Tiada nama yang sepadan dengan pilihan ini.",
    boysN: "{n} nama lelaki",
    girlsN: "{n} nama perempuan",
    abdTitle: "Nama-nama penghambaan",
    abdText: "Nama yang mengungkapkan penghambaan kepada Allah – “Abd” bersama salah satu nama-Nya yang indah – amat disayangi. Nabi ﷺ bersabda:",
    abdSrc: "Riwayat Muslim 2132",
    changeTitle: "Nama yang baik sebagai ganti yang buruk",
    changeText: "Nabi ﷺ menukar nama yang bermakna buruk kepada nama yang baik: seorang puteri Umar bernama ʿĀṣiya (“yang derhaka”, عاصية – jangan dikelirukan dengan Āsiya, isteri Firaun), lalu baginda menamakannya Jamila (“yang cantik”).",
    changeSrc: "Riwayat Muslim 2139",
    rulesTitle: "Yang tidak pernah kami cadangkan",
    rule1: "Nama yang hanya milik Allah, seperti ar-Rahman atau al-Khaliq – nama itu hanya diberikan bersama “Abd”.",
    rule2: "Nama yang mengungkapkan penghambaan kepada selain Allah.",
    rule3: "Nama yang bermakna buruk atau tidak elok.",
    rule4: "Nama bapa, ibu atau adik-beradik.",
    rightTitle: "Hak seorang anak",
    rightText: "Memilih nama yang baik ialah antara hak anak – nama itu menyertainya sepanjang hayat. Jika anda ragu-ragu, bertanyalah kepada keluarga anda dan seorang ulama.",
    meaningNote: "Makna dipendekkan; banyak nama mempunyai beberapa lapisan makna.",
    g_b: "Lelaki",
    g_g: "Perempuan",
  },
  bn: {
    metaTitle: "অর্থসহ মুসলিম শিশুর নাম – নাম খোঁজক",
    metaDesc: "আরবি বানান, অর্থ ও কুরআনের আয়াতসহ 300-এর বেশি মুসলিম ছেলে ও মেয়ের নাম। নাম খোঁজক আপনার সন্তানের জন্য উপযুক্ত নাম প্রস্তাব করে।",
    kicker: "আপনার সন্তানের জন্য নাম",
    title: "একটি সুন্দর নাম",
    lead: "পরিবারগুলো সত্যিই যেসব মুসলিম নাম রাখে – আরবি বানান, অর্থ এবং কুরআনের যে আয়াতে নামটি বা তার মূল এসেছে তাসহ। নাম খোঁজক আপনার কথা শোনে এবং তিনটি নাম প্রস্তাব করে।",
    heroRef: "কুরআন 19:7",
    tabFinder: "নাম খোঁজক",
    tabAll: "সব নাম",
    step: "ধাপ {n}/{total}",
    s1: "পরিবার",
    s1d: "যাতে আমরা আপনার পরিবারের সঙ্গে মানানসই নাম প্রস্তাব করতে পারি এবং আগে থেকে থাকা কোনো নাম পুনরাবৃত্তি না করি।",
    s2: "সন্তান",
    s2d: "লিঙ্গ, প্রত্যাশিত জন্মতারিখ ও ভাইবোন – লিঙ্গ ছাড়া সবই ঐচ্ছিক।",
    s3: "আপনার ইচ্ছা",
    s3d: "নামটি কী প্রকাশ করবে? যত খুশি বা যত কম খুশি বেছে নিন।",
    s4: "প্রস্তাব",
    father: "বাবার নাম",
    mother: "মায়ের নাম",
    family: "বংশনাম (ঐচ্ছিক)",
    fatherPh: "যেমন: Ibrahim",
    motherPh: "যেমন: Maryam",
    familyPh: "যেমন: Khan",
    gender: "কার জন্য",
    boy: "ছেলে",
    girl: "মেয়ে",
    both: "দুটোই প্রস্তাব করুন",
    date: "জন্মতারিখ বা প্রত্যাশিত তারিখ (ঐচ্ছিক)",
    hijriIs: "ইসলামি ক্যালেন্ডারে: {date}",
    siblings: "ভাইবোনের নাম (ঐচ্ছিক, কমা দিয়ে আলাদা করুন)",
    siblingsPh: "যেমন: Yusuf, Aisha",
    letter: "ভাইবোনদের তুলনায় প্রথম অক্ষর",
    letterAny: "কোনো পছন্দ নেই",
    letterSame: "একই অক্ষর",
    letterDiff: "ভিন্ন অক্ষর",
    themesQ: "নামটি কী প্রকাশ করবে?",
    originsQ: "নামটি কোথা থেকে আসতে পারে?",
    o_quran: "কুরআন থেকে",
    o_prophet: "নবীগণ ও তাঁদের পরিবার",
    o_companion: "নবী ﷺ-এর সাহাবিগণ",
    o_arabic: "আরবি গুণ",
    maxLen: "সর্বোচ্চ এতগুলো অক্ষর",
    any: "যেকোনো",
    easy: "ইংরেজিতে সহজে উচ্চারণযোগ্য",
    next: "পরবর্তী",
    back: "পিছনে",
    find: "নাম খুঁজুন",
    shuffle: "আবার মেশান",
    edit: "উত্তর বদলান",
    save: "সংরক্ষণ করুন",
    saved: "সংরক্ষিত",
    share: "শেয়ার করুন",
    copied: "কপি হয়েছে",
    forBoy: "ছেলের জন্য",
    forGirl: "মেয়ের জন্য",
    classical: "ধ্রুপদী রূপ",
    withFamily: "বংশনামসহ",
    v_appears: "কুরআনে নামটি",
    v_about: "তাঁকে নিয়ে একটি আয়াত",
    v_root: "একই মূল থেকে একটি আয়াত",
    v_theme: "“{theme}” বিষয়ক একটি আয়াত",
    listen: "শুনুন",
    verseRef: "কুরআন {ref}",
    noPool: "এই ইচ্ছাগুলোর জন্য কোনো নাম পাইনি। একটি ফিল্টার শিথিল করে আবার চেষ্টা করুন।",
    resultLead: "সবচেয়ে মানানসইগুলোর মধ্য থেকে তিনটি নাম – প্রতিবার মেশালে অন্য নাম দেখা যায়।",
    monthNote: "আপনার সন্তান {month} মাসে জন্ম নেবে।",
    donateLine: "এই নাম আপনার সন্তানের জন্য বরকতময় হোক। নাম খোঁজক প্রতিটি পরিবারের জন্য বিনামূল্যে থাকবে। এটি আপনাকে সাহায্য করে থাকলে স্বেচ্ছায় Quran Masterclass-কে সহায়তা করতে পারেন – সদকায়ে জারিয়া হিসেবে।",
    loved: "পরিবারগুলোর প্রিয়",
    lovedD: "এখানকার পরিবারগুলো যে নামগুলো সবচেয়ে বেশি সংরক্ষণ করেছে।",
    lovedEmpty: "এখনো কেউ কোনো নাম সংরক্ষণ করেনি – প্রথম হতে “সংরক্ষণ করুন”-এ ট্যাপ করুন।",
    favTitle: "আপনার সংরক্ষিত নাম",
    favEmpty: "এখনো কোনো নাম সংরক্ষিত হয়নি। যেকোনো নামের হার্টে ট্যাপ করুন।",
    favAdd: "সংরক্ষণ করুন",
    favRemove: "সংরক্ষণ থেকে সরান",
    copyList: "তালিকা কপি করুন",
    shareList: "তালিকা শেয়ার করুন",
    filterFor: "কার জন্য",
    all: "সব",
    theme: "বিষয়",
    origin: "উৎস",
    letterF: "প্রথম অক্ষর",
    lenF: "দৈর্ঘ্য",
    search: "নাম বা অর্থ খুঁজুন …",
    count: "{n}টি নাম",
    surprise: "আমাকে চমকে দিন",
    noMatch: "এই নির্বাচনের সঙ্গে কোনো নাম মেলে না।",
    boysN: "{n}টি ছেলের নাম",
    girlsN: "{n}টি মেয়ের নাম",
    abdTitle: "আল্লাহর বান্দা-নাম",
    abdText: "আল্লাহর বান্দা হওয়ার পরিচয় প্রকাশ করে এমন নাম – তাঁর সুন্দর নামগুলোর একটির সঙ্গে “আব্দ” – বিশেষভাবে প্রিয়। নবী ﷺ বলেছেন:",
    abdSrc: "মুসলিম 2132",
    changeTitle: "মন্দ নামের বদলে ভালো নাম",
    changeText: "নবী ﷺ মন্দ অর্থের নামগুলো বদলে ভালো নাম রাখতেন: উমরের এক কন্যার নাম ছিল ʿĀṣiya (“অবাধ্য”, عاصية – ফেরাউনের স্ত্রী Āsiya-র সঙ্গে গুলিয়ে ফেলবেন না), আর তিনি তাঁর নাম রাখলেন Jamila (“সুন্দরী”)।",
    changeSrc: "মুসলিম 2139",
    rulesTitle: "যা আমরা কখনো প্রস্তাব করি না",
    rule1: "যেসব নাম কেবল আল্লাহর, যেমন আর-রহমান বা আল-খালিক – এগুলো শুধু “আব্দ”-এর সঙ্গে রাখা হয়।",
    rule2: "আল্লাহ ছাড়া অন্য কারও বান্দা হওয়ার পরিচয় প্রকাশ করে এমন নাম।",
    rule3: "মন্দ বা অশোভন অর্থের নাম।",
    rule4: "বাবা, মা বা কোনো ভাইবোনের নাম।",
    rightTitle: "সন্তানের একটি অধিকার",
    rightText: "ভালো নাম বেছে নেওয়া সন্তানের অধিকারগুলোর একটি – নামটি সারাজীবন তার সঙ্গে থাকে। নিশ্চিত না হলে পরিবারের সঙ্গে ও একজন আলেমের সঙ্গে কথা বলুন।",
    meaningNote: "অর্থ সংক্ষেপে দেওয়া; অনেক নামের একাধিক সূক্ষ্ম অর্থ থাকে।",
    g_b: "ছেলে",
    g_g: "মেয়ে",
  },
  ru: {
    metaTitle: "Мусульманские имена для малышей со значением – подбор имени",
    metaDesc: "Более 300 мусульманских мужских и женских имён с арабским написанием, значением и аятом Корана. Подбор имени предлагает подходящие имена для вашего ребёнка.",
    kicker: "Имена для вашего ребёнка",
    title: "Красивое имя",
    lead: "Мусульманские имена, которые семьи действительно дают детям, – с арабским написанием, значением и аятом, в котором в Коране встречается имя или его корень. Подбор имени выслушает вас и предложит три имени.",
    heroRef: "Коран 19:7",
    tabFinder: "Подбор имени",
    tabAll: "Все имена",
    step: "Шаг {n} из {total}",
    s1: "Семья",
    s1d: "Чтобы мы предложили имя, подходящее вашей семье, и не повторили уже имеющееся имя.",
    s2: "Ребёнок",
    s2d: "Пол, срок рождения и братья и сёстры – всё, кроме пола, необязательно.",
    s3: "Ваши пожелания",
    s3d: "Что должно выражать имя? Выберите столько или так мало, сколько захотите.",
    s4: "Предложения",
    father: "Имя отца",
    mother: "Имя матери",
    family: "Фамилия (необязательно)",
    fatherPh: "напр., Ibrahim",
    motherPh: "напр., Maryam",
    familyPh: "напр., Aliyev",
    gender: "Для",
    boy: "Мальчик",
    girl: "Девочка",
    both: "Предложите оба варианта",
    date: "Дата рождения или предполагаемая дата (необязательно)",
    hijriIs: "По исламскому календарю: {date}",
    siblings: "Имена братьев и сестёр (необязательно, через запятую)",
    siblingsPh: "напр., Yusuf, Aisha",
    letter: "Первая буква по сравнению с братьями и сёстрами",
    letterAny: "неважно",
    letterSame: "та же буква",
    letterDiff: "другая буква",
    themesQ: "Что должно выражать имя?",
    originsQ: "Откуда может быть имя?",
    o_quran: "из Корана",
    o_prophet: "пророки и их семьи",
    o_companion: "сподвижники Пророка ﷺ",
    o_arabic: "арабская добродетель",
    maxLen: "Не более стольких букв",
    any: "любое",
    easy: "Легко произносится по-английски",
    next: "Далее",
    back: "Назад",
    find: "Найти имена",
    shuffle: "Перемешать снова",
    edit: "Изменить ответы",
    save: "Сохранить",
    saved: "Сохранено",
    share: "Поделиться",
    copied: "Скопировано",
    forBoy: "Для мальчика",
    forGirl: "Для девочки",
    classical: "Классическая форма",
    withFamily: "С фамилией",
    v_appears: "Имя в Коране",
    v_about: "Аят о ней",
    v_root: "Аят с тем же корнем",
    v_theme: "Аят на тему «{theme}»",
    listen: "Слушать",
    verseRef: "Коран {ref}",
    noPool: "Для этих пожеланий мы не нашли имени. Ослабьте один из фильтров и попробуйте снова.",
    resultLead: "Три имени из наиболее подходящих – при каждом перемешивании появляются другие.",
    monthNote: "Ваш ребёнок родится в месяце {month}.",
    donateLine: "Пусть это имя будет благословением для вашего ребёнка. Подбор имени остаётся бесплатным для каждой семьи. Если он вам помог, вы можете по желанию поддержать Quran Masterclass – как садака джарийя.",
    loved: "Любимые имена семей",
    lovedD: "Имена, которые местные семьи сохраняли чаще всего.",
    lovedEmpty: "Пока никто не сохранил имя – нажмите «Сохранить», чтобы стать первым.",
    favTitle: "Ваши сохранённые имена",
    favEmpty: "Сохранённых имён пока нет. Нажмите на сердечко у любого имени.",
    favAdd: "Сохранить",
    favRemove: "Убрать из сохранённых",
    copyList: "Скопировать список",
    shareList: "Поделиться списком",
    filterFor: "Для",
    all: "Все",
    theme: "Тема",
    origin: "Происхождение",
    letterF: "Первая буква",
    lenF: "Длина",
    search: "Искать имя или значение …",
    count: "Имён: {n}",
    surprise: "Удиви меня",
    noMatch: "Ни одно имя не подходит под этот выбор.",
    boysN: "Мужских имён: {n}",
    girlsN: "Женских имён: {n}",
    abdTitle: "Имена служения",
    abdText: "Имена, выражающие служение Аллаху, – «Абд» вместе с одним из Его прекрасных имён – особенно любимы. Пророк ﷺ сказал:",
    abdSrc: "Муслим 2132",
    changeTitle: "Хорошие имена вместо плохих",
    changeText: "Пророк ﷺ менял имена с плохим значением на хорошие: одну из дочерей Умара звали ʿĀṣiya («непокорная», عاصية – не путать с Āsiya, женой фараона), и он назвал её Jamila («красивая»).",
    changeSrc: "Муслим 2139",
    rulesTitle: "Что мы никогда не предлагаем",
    rule1: "Имена, принадлежащие только Аллаху, например ар-Рахман или аль-Халик, – их дают только с «Абд».",
    rule2: "Имена, выражающие служение кому-либо, кроме Аллаха.",
    rule3: "Имена с плохим или неприятным значением.",
    rule4: "Имя отца, матери, брата или сестры.",
    rightTitle: "Право ребёнка",
    rightText: "Выбрать хорошее имя – одно из прав ребёнка: оно сопровождает его всю жизнь. Если вы не уверены, спросите свою семью и учёного.",
    meaningNote: "Значения даны кратко; у многих имён несколько оттенков смысла.",
    g_b: "Мальчик",
    g_g: "Девочка",
  },
  zh: {
    metaTitle: "附含义的穆斯林宝宝名字 – 起名助手",
    metaDesc: "300 多个穆斯林男孩和女孩的名字，附阿拉伯语拼写、含义和古兰经经文。起名助手为你的孩子推荐合适的名字。",
    kicker: "为你的孩子起名",
    title: "一个美好的名字",
    lead: "家庭真正在使用的穆斯林名字——附阿拉伯语拼写、含义，以及古兰经中出现该名字或其词根的经文。起名助手会听取你的想法，并推荐三个名字。",
    heroRef: "古兰经 19:7",
    tabFinder: "起名助手",
    tabAll: "全部名字",
    step: "第 {n} 步，共 {total} 步",
    s1: "家庭",
    s1d: "这样我们才能推荐适合你家庭的名字，也不会重复你已有的名字。",
    s2: "孩子",
    s2d: "性别、预产期和兄弟姐妹——除性别外都是选填。",
    s3: "你的期望",
    s3d: "这个名字应该表达什么？想选多少都可以。",
    s4: "推荐",
    father: "父亲的名字",
    mother: "母亲的名字",
    family: "姓氏（选填）",
    fatherPh: "例如：Ibrahim",
    motherPh: "例如：Maryam",
    familyPh: "例如：Khan",
    gender: "为",
    boy: "男孩",
    girl: "女孩",
    both: "两个都推荐",
    date: "出生日期或预产期（选填）",
    hijriIs: "伊斯兰历：{date}",
    siblings: "兄弟姐妹的名字（选填，用逗号分隔）",
    siblingsPh: "例如：Yusuf, Aisha",
    letter: "与兄弟姐妹相比的首字母",
    letterAny: "无所谓",
    letterSame: "相同的字母",
    letterDiff: "不同的字母",
    themesQ: "这个名字应该表达什么？",
    originsQ: "名字可以来自哪里？",
    o_quran: "出自古兰经",
    o_prophet: "先知及其家人",
    o_companion: "先知ﷺ的圣门弟子",
    o_arabic: "阿拉伯美德",
    maxLen: "最多这么多个字母",
    any: "不限",
    easy: "容易用英语发音",
    next: "下一步",
    back: "返回",
    find: "查找名字",
    shuffle: "重新洗牌",
    edit: "修改回答",
    save: "收藏",
    saved: "已收藏",
    share: "分享",
    copied: "已复制",
    forBoy: "给男孩",
    forGirl: "给女孩",
    classical: "经典写法",
    withFamily: "带姓氏",
    v_appears: "古兰经中的名字",
    v_about: "一节关于她的经文",
    v_root: "一节同词根的经文",
    v_theme: "一节关于“{theme}”的经文",
    listen: "收听",
    verseRef: "古兰经 {ref}",
    noPool: "没有找到符合这些期望的名字。请放宽一个筛选条件再试。",
    resultLead: "从最匹配的名字中选出三个——每次重新洗牌都会显示不同的名字。",
    monthNote: "你的孩子将在{month}出生。",
    donateLine: "愿这个名字成为你孩子的福气。起名助手对每个家庭始终免费。如果它帮到了你，欢迎自愿支持 Quran Masterclass——作为持续的施舍（萨达嘎·贾里亚）。",
    loved: "深受家庭喜爱",
    lovedD: "这里的家庭收藏最多的名字。",
    lovedEmpty: "还没有人收藏名字——点按“收藏”，成为第一个。",
    favTitle: "你收藏的名字",
    favEmpty: "还没有收藏的名字。点按任一名字上的爱心。",
    favAdd: "收藏",
    favRemove: "取消收藏",
    copyList: "复制列表",
    shareList: "分享列表",
    filterFor: "为",
    all: "全部",
    theme: "主题",
    origin: "来源",
    letterF: "首字母",
    lenF: "长度",
    search: "搜索名字或含义……",
    count: "{n} 个名字",
    surprise: "给我个惊喜",
    noMatch: "没有名字符合这个选择。",
    boysN: "{n} 个男孩名字",
    girlsN: "{n} 个女孩名字",
    abdTitle: "表示侍奉的名字",
    abdText: "表示侍奉安拉的名字——“阿卜杜”加上安拉的美名之一——尤其受人喜爱。先知ﷺ说：",
    abdSrc: "穆斯林圣训集 2132",
    changeTitle: "以好名字取代坏名字",
    changeText: "先知ﷺ把含义不好的名字改成好名字：欧麦尔的一个女儿名叫 ʿĀṣiya（“违逆者”，عاصية——不要与法老的妻子 Āsiya 混淆），先知ﷺ给她改名为 Jamila（“美丽的”）。",
    changeSrc: "穆斯林圣训集 2139",
    rulesTitle: "我们绝不推荐的名字",
    rule1: "只属于安拉的名字，例如 ar-Rahman 或 al-Khaliq——这些名字只能加上“阿卜杜”来使用。",
    rule2: "表示侍奉安拉以外者的名字。",
    rule3: "含义不好或不雅的名字。",
    rule4: "父亲、母亲或兄弟姐妹的名字。",
    rightTitle: "孩子的一项权利",
    rightText: "选一个好名字是孩子的权利之一——它会伴随孩子一生。如果拿不准，请询问家人和一位学者。",
    meaningNote: "含义写得较简短；许多名字还带有多层含义。",
    g_b: "男孩",
    g_g: "女孩",
  },
};

export const THEME_LABEL: Record<UiLang, Record<Theme, string>> = {
  de: { faith: "Glaube", light: "Licht", peace: "Frieden", strength: "Stärke", knowledge: "Wissen", nature: "Natur", beauty: "Schönheit", joy: "Freude", honour: "Ehre", virtue: "Tugend" },
  en: { faith: "Faith", light: "Light", peace: "Peace", strength: "Strength", knowledge: "Knowledge", nature: "Nature", beauty: "Beauty", joy: "Joy", honour: "Honour", virtue: "Virtue" },
  ar: { faith: "الإيمان", light: "النور", peace: "السلام", strength: "القوة", knowledge: "العلم", nature: "الطبيعة", beauty: "الجمال", joy: "الفرح", honour: "الشرف", virtue: "الأخلاق" },
  tr: { faith: "İman", light: "Nur", peace: "Barış", strength: "Güç", knowledge: "İlim", nature: "Doğa", beauty: "Güzellik", joy: "Sevinç", honour: "Onur", virtue: "Erdem" },
  ur: { faith: "ایمان", light: "نور", peace: "امن", strength: "طاقت", knowledge: "علم", nature: "فطرت", beauty: "خوبصورتی", joy: "خوشی", honour: "عزت", virtue: "اخلاق" },
  fa: { faith: "ایمان", light: "نور", peace: "صلح", strength: "قدرت", knowledge: "دانش", nature: "طبیعت", beauty: "زیبایی", joy: "شادی", honour: "شرف", virtue: "فضیلت" },
  ps: { faith: "ایمان", light: "نور", peace: "سوله", strength: "ځواک", knowledge: "پوهه", nature: "طبیعت", beauty: "ښکلا", joy: "خوښي", honour: "عزت", virtue: "فضیلت" },
  fr: { faith: "Foi", light: "Lumière", peace: "Paix", strength: "Force", knowledge: "Savoir", nature: "Nature", beauty: "Beauté", joy: "Joie", honour: "Honneur", virtue: "Vertu" },
  es: { faith: "Fe", light: "Luz", peace: "Paz", strength: "Fuerza", knowledge: "Conocimiento", nature: "Naturaleza", beauty: "Belleza", joy: "Alegría", honour: "Honor", virtue: "Virtud" },
  id: { faith: "Iman", light: "Cahaya", peace: "Damai", strength: "Kekuatan", knowledge: "Ilmu", nature: "Alam", beauty: "Keindahan", joy: "Kegembiraan", honour: "Kehormatan", virtue: "Kebajikan" },
  ms: { faith: "Iman", light: "Cahaya", peace: "Damai", strength: "Kekuatan", knowledge: "Ilmu", nature: "Alam", beauty: "Keindahan", joy: "Kegembiraan", honour: "Kehormatan", virtue: "Kebaikan" },
  bn: { faith: "ঈমান", light: "আলো", peace: "শান্তি", strength: "শক্তি", knowledge: "জ্ঞান", nature: "প্রকৃতি", beauty: "সৌন্দর্য", joy: "আনন্দ", honour: "সম্মান", virtue: "সদগুণ" },
  ru: { faith: "Вера", light: "Свет", peace: "Мир", strength: "Сила", knowledge: "Знание", nature: "Природа", beauty: "Красота", joy: "Радость", honour: "Честь", virtue: "Добродетель" },
  zh: { faith: "信仰", light: "光明", peace: "和平", strength: "力量", knowledge: "知识", nature: "自然", beauty: "美", joy: "喜乐", honour: "荣誉", virtue: "美德" },
};

export const ORIGIN_LABEL: Record<UiLang, Record<Origin | OriginFilter, string>> = {
  de: { quran: "Im Koran", prophet: "Prophet", sahabi: "Gefährte", sahabiyya: "Gefährtin", companion: "Gefährten", "ahl-al-bayt": "Ahl al-Bayt", arabic: "Arabisch", other: "Persisch/Türkisch" },
  en: { quran: "In the Quran", prophet: "Prophet", sahabi: "Companion", sahabiyya: "Companion", companion: "Companions", "ahl-al-bayt": "Ahl al-Bayt", arabic: "Arabic", other: "Persian/Turkish" },
  ar: { quran: "في القرآن", prophet: "نبي", sahabi: "صحابي", sahabiyya: "صحابية", companion: "الصحابة", "ahl-al-bayt": "آل البيت", arabic: "عربي", other: "فارسي/تركي" },
  tr: { quran: "Kur'an'da", prophet: "Peygamber", sahabi: "Sahabi", sahabiyya: "Sahabiye", companion: "Sahabeler", "ahl-al-bayt": "Ehl-i Beyt", arabic: "Arapça", other: "Farsça/Türkçe" },
  ur: { quran: "قرآن میں", prophet: "نبی", sahabi: "صحابی", sahabiyya: "صحابیہ", companion: "صحابہ", "ahl-al-bayt": "اہلِ بیت", arabic: "عربی", other: "فارسی/ترکی" },
  fa: { quran: "در قرآن", prophet: "پیامبر", sahabi: "صحابی", sahabiyya: "صحابیه", companion: "صحابه", "ahl-al-bayt": "اهل بیت", arabic: "عربی", other: "فارسی/ترکی" },
  ps: { quran: "په قرآن کې", prophet: "پیغمبر", sahabi: "صحابي", sahabiyya: "صحابیه", companion: "صحابه", "ahl-al-bayt": "اهل بیت", arabic: "عربي", other: "فارسي/ترکي" },
  fr: { quran: "Dans le Coran", prophet: "Prophète", sahabi: "Compagnon", sahabiyya: "Compagne", companion: "Compagnons", "ahl-al-bayt": "Ahl al-Bayt", arabic: "Arabe", other: "Persan/Turc" },
  es: { quran: "En el Corán", prophet: "Profeta", sahabi: "Compañero", sahabiyya: "Compañera", companion: "Compañeros", "ahl-al-bayt": "Ahl al-Bayt", arabic: "Árabe", other: "Persa/Turco" },
  id: { quran: "Dalam Al-Qur'an", prophet: "Nabi", sahabi: "Sahabat", sahabiyya: "Sahabiyah", companion: "Para sahabat", "ahl-al-bayt": "Ahlul Bait", arabic: "Arab", other: "Persia/Turki" },
  ms: { quran: "Dalam Quran", prophet: "Nabi", sahabi: "Sahabat", sahabiyya: "Sahabiah", companion: "Para sahabat", "ahl-al-bayt": "Ahlul Bait", arabic: "Arab", other: "Parsi/Turki" },
  bn: { quran: "কুরআনে", prophet: "নবী", sahabi: "সাহাবি", sahabiyya: "সাহাবিয়া", companion: "সাহাবিগণ", "ahl-al-bayt": "আহলে বাইত", arabic: "আরবি", other: "ফারসি/তুর্কি" },
  ru: { quran: "В Коране", prophet: "Пророк", sahabi: "Сподвижник", sahabiyya: "Сподвижница", companion: "Сподвижники", "ahl-al-bayt": "Ахль аль-бейт", arabic: "Арабское", other: "Персидское/тюркское" },
  zh: { quran: "古兰经中", prophet: "先知", sahabi: "圣门弟子", sahabiyya: "圣门女弟子", companion: "圣门弟子们", "ahl-al-bayt": "先知家属", arabic: "阿拉伯语", other: "波斯语/突厥语" },
};

// Page text in the reader's language with {placeholders}
export function namesText(locale: string) {
  const d = T[uiLangOf(locale)];
  return (key: string, vars?: Record<string, string | number>) => {
    let s = d[key] ?? T.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };
}
