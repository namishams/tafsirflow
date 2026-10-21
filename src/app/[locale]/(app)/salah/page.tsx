import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import PrayerTrainer from "@/components/PrayerTrainer";
import { langOf, type Lang } from "@/lib/salah";
import { abs, pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";
import { ArrowNext } from "@/components/Icons";
import { PracticeHero, PracticeStar } from "@/components/art/PracticeArt";

type Content = { kicker: string; title: string; lead: string; whyTitle: string; why: string; more: string; links: [string, string][] };
const C: Record<Lang, Content> = {
  de: {
    kicker: "Gebet lernen · Schritt für Schritt", title: "So beten Sie – mit einem Trainer, der jede Bewegung zeigt",
    lead: "Wählen Sie das Gebet und Ihre Tradition. Die Figur zeigt jede Haltung, dazu sehen Sie die arabischen Worte, die Umschrift und die Bedeutung. Spielen Sie den Ablauf ab oder gehen Sie Schritt für Schritt – so oft Sie wollen.",
    whyTitle: "Das Gebet – das Erste, worüber wir befragt werden", why: "Der Prophet ﷺ sagte, dass das Gebet die erste Tat ist, über die ein Mensch am Tag der Auferstehung Rechenschaft ablegt (at-Tirmidhi, Abu Dawud, an-Nasa'i). Fünfmal am Tag treten Sie vor Allah – mit Körper, Zunge und Herz. Wer es einmal richtig gelernt hat, trägt es ein Leben lang.",
    more: "Ausführlich erklärt", links: [["/islam/prayer-sunni", "Wie man betet – sunnitisch"], ["/islam/prayer-shia", "Wie man betet – schiitisch (Dscha'fari)"], ["/prayer", "Gebetszeiten und Adhan"], ["/arabic", "Arabisch lesen lernen"]],
  },
  en: {
    kicker: "Learn the prayer · step by step", title: "How to pray – with a trainer that shows every movement",
    lead: "Choose the prayer and your tradition. The figure shows every posture, with the Arabic words, the transliteration and the meaning. Play the whole sequence or go step by step – as often as you like.",
    whyTitle: "The prayer – the first thing we will be asked about", why: "The Prophet ﷺ said that prayer is the first deed a person will be held to account for on the Day of Resurrection (at-Tirmidhi, Abu Dawud, an-Nasa'i). Five times a day you stand before Allah – with body, tongue and heart. Once you have learned it properly, it stays with you for life.",
    more: "Explained in detail", links: [["/islam/prayer-sunni", "How to pray – Sunni"], ["/islam/prayer-shia", "How to pray – Shia (Ja'fari)"], ["/prayer", "Prayer times and adhan"], ["/arabic", "Learn to read Arabic"]],
  },
  ar: {
    kicker: "تعلّم الصلاة خطوةً خطوة", title: "هكذا تصلّي – مع مدرّبٍ يُريك كل حركة",
    lead: "اختر الصلاة ومذهبك، فيُريك الشكل كل هيئة من هيئات الصلاة، ومعها الأذكار بالعربية. شغّل الصلاة كاملة أو تنقّل بين خطواتها كما تشاء.",
    whyTitle: "الصلاة أول ما يُحاسَب عليه العبد", why: "قال النبي ﷺ: «إنّ أوّل ما يُحاسَب به العبد يوم القيامة من عمله صلاته» (رواه الترمذي وأبو داود والنسائي). خمس مرات في اليوم تقف بين يدي الله بجسدك ولسانك وقلبك، ومن تعلّمها على وجهها الصحيح صحبته طوال عمره.",
    more: "شرح مفصّل", links: [["/islam/prayer-sunni", "صفة الصلاة عند أهل السنة"], ["/islam/prayer-shia", "صفة الصلاة في المذهب الجعفري"], ["/prayer", "مواقيت الصلاة والأذان"], ["/arabic", "تعلّم القراءة العربية"]],
  },
  tr: {
    kicker: "Namazı öğrenin · adım adım", title: "Namaz nasıl kılınır – her hareketi gösteren bir eğitimle",
    lead: "Namazı ve mezhebinizi seçin. Figür her duruşu, Arapça sözleri, okunuşu ve anlamıyla birlikte gösterir. Tüm sırayı oynatın ya da adım adım ilerleyin – istediğiniz kadar.",
    whyTitle: "Namaz – hakkında ilk sorulacağımız şey", why: "Peygamber ﷺ, kıyamet günü bir insanın hesaba çekileceği ilk amelin namaz olduğunu söylemiştir (at-Tirmidhi, Abu Dawud, an-Nasa'i). Günde beş kez Allah'ın huzuruna çıkarsınız – bedenle, dille ve kalple. Onu bir kez doğru öğrendiğinizde, ömür boyu sizinle kalır.",
    more: "Ayrıntılı anlatım", links: [["/islam/prayer-sunni", "Namaz nasıl kılınır – Sünni"], ["/islam/prayer-shia", "Namaz nasıl kılınır – Şii (Caferî)"], ["/prayer", "Namaz vakitleri ve ezan"], ["/arabic", "Arapça okumayı öğrenin"]],
  },
  ur: {
    kicker: "نماز سیکھیں · قدم بہ قدم", title: "نماز کیسے پڑھیں – ایسی مشق کے ساتھ جو ہر حرکت دکھاتی ہے",
    lead: "نماز اور اپنا مکتب منتخب کریں۔ شکل ہر ہیئت دکھاتی ہے، ساتھ عربی الفاظ، ان کا رومن تلفظ اور معنی بھی۔ پوری ترتیب چلائیں یا قدم بہ قدم آگے بڑھیں – جتنی بار چاہیں۔",
    whyTitle: "نماز – وہ پہلی چیز جس کے بارے میں ہم سے پوچھا جائے گا", why: "نبی ﷺ نے فرمایا کہ قیامت کے دن انسان سے جس عمل کا سب سے پہلے حساب لیا جائے گا وہ نماز ہے (at-Tirmidhi, Abu Dawud, an-Nasa'i)۔ دن میں پانچ بار آپ اللہ کے حضور کھڑے ہوتے ہیں – جسم، زبان اور دل کے ساتھ۔ جب آپ اسے ٹھیک طرح سیکھ لیتے ہیں تو یہ عمر بھر آپ کے ساتھ رہتی ہے۔",
    more: "تفصیل سے", links: [["/islam/prayer-sunni", "نماز کیسے پڑھیں – سنی"], ["/islam/prayer-shia", "نماز کیسے پڑھیں – شیعہ (جعفری)"], ["/prayer", "نماز کے اوقات اور اذان"], ["/arabic", "عربی پڑھنا سیکھیں"]],
  },
  fa: {
    kicker: "آموزش نماز · گام به گام", title: "نماز را چگونه بخوانیم – با تمرینی که هر حرکت را نشان می‌دهد",
    lead: "نماز و مذهب خود را انتخاب کنید. پیکر هر حالت را نشان می‌دهد، همراه با کلمات عربی، آوانگاری و معنا. کل ترتیب را پخش کنید یا گام‌به‌گام پیش بروید – هر چند بار که بخواهید.",
    whyTitle: "نماز – نخستین چیزی که دربارهٔ آن پرسیده خواهیم شد", why: "پیامبر ﷺ فرمود که نماز نخستین عملی است که انسان در روز قیامت دربارهٔ آن به حساب کشیده می‌شود (at-Tirmidhi, Abu Dawud, an-Nasa'i). روزی پنج بار در پیشگاه الله می‌ایستید – با تن، زبان و دل. وقتی آن را درست آموختید، تا آخر عمر با شما می‌ماند.",
    more: "توضیح کامل", links: [["/islam/prayer-sunni", "چگونه نماز بخوانیم – اهل سنت"], ["/islam/prayer-shia", "چگونه نماز بخوانیم – شیعه (جعفری)"], ["/prayer", "اوقات نماز و اذان"], ["/arabic", "خواندن عربی را بیاموزید"]],
  },
  ps: {
    kicker: "لمونځ زده کړه · ګام په ګام", title: "لمونځ څنګه کوو – له داسې تمرین سره چې هره حرکت ښيي",
    lead: "لمونځ او خپل مذهب وټاکئ. شکل هره حالت ښيي، له عربي ټکو، لاتیني تلفظ او معنا سره. ټوله ترتیب وغږوئ یا ګام په ګام مخکې ځئ – څومره چې وغواړئ.",
    whyTitle: "لمونځ – لومړی شی چې له موږ به پوښتل کېږي", why: "پیغمبر ﷺ وفرمایل چې لمونځ لومړی عمل دی چې انسان به د قیامت په ورځ د هغه په اړه حساب ورکوي (at-Tirmidhi, Abu Dawud, an-Nasa'i). په ورځ کې پنځه ځله تاسو د الله مخې ته ودرېږئ – په بدن، ژبه او زړه. کله چې تاسو دا سم زده کړئ، تر ژوندانه به درسره پاتې شي.",
    more: "په تفصیل سره", links: [["/islam/prayer-sunni", "لمونځ څنګه کوو – سني"], ["/islam/prayer-shia", "لمونځ څنګه کوو – شیعه (جعفري)"], ["/prayer", "د لمانځه وختونه او اذان"], ["/arabic", "عربي لوستل زده کړئ"]],
  },
  fr: {
    kicker: "Apprendre la prière · pas à pas", title: "Comment prier – avec un entraînement qui montre chaque mouvement",
    lead: "Choisissez la prière et votre tradition. La figure montre chaque posture, avec les paroles en arabe, la translittération et le sens. Lancez tout le déroulement ou avancez pas à pas – autant de fois que vous le souhaitez.",
    whyTitle: "La prière – la première chose dont nous serons interrogés", why: "Le Prophète ﷺ a dit que la prière est la première action dont une personne devra rendre compte le Jour de la Résurrection (at-Tirmidhi, Abu Dawud, an-Nasa'i). Cinq fois par jour, vous vous tenez devant Allah – avec le corps, la langue et le cœur. Une fois que vous l'avez bien apprise, elle vous accompagne toute la vie.",
    more: "Expliqué en détail", links: [["/islam/prayer-sunni", "Comment prier – sunnite"], ["/islam/prayer-shia", "Comment prier – chiite (ja'farite)"], ["/prayer", "Heures de prière et adhan"], ["/arabic", "Apprendre à lire l'arabe"]],
  },
  es: {
    kicker: "Aprenda la oración · paso a paso", title: "Cómo orar – con un entrenador que muestra cada movimiento",
    lead: "Elija la oración y su tradición. La figura muestra cada postura, con las palabras en árabe, la transliteración y el significado. Reproduzca toda la secuencia o avance paso a paso, tantas veces como quiera.",
    whyTitle: "La oración: lo primero sobre lo que se nos preguntará", why: "El Profeta ﷺ dijo que la oración es la primera acción de la que una persona deberá rendir cuentas el Día de la Resurrección (at-Tirmidhi, Abu Dawud, an-Nasa'i). Cinco veces al día se presenta usted ante Allah, con el cuerpo, la lengua y el corazón. Una vez que la ha aprendido bien, le acompaña toda la vida.",
    more: "Explicado en detalle", links: [["/islam/prayer-sunni", "Cómo orar – suní"], ["/islam/prayer-shia", "Cómo orar – chií (yafarí)"], ["/prayer", "Horarios de oración y adhan"], ["/arabic", "Aprenda a leer árabe"]],
  },
  id: {
    kicker: "Belajar shalat · langkah demi langkah", title: "Cara shalat – dengan latihan yang menunjukkan setiap gerakan",
    lead: "Pilih shalatnya dan mazhab Anda. Figur menunjukkan setiap sikap, lengkap dengan bacaan Arab, transliterasi, dan artinya. Putar seluruh urutan atau ikuti langkah demi langkah – sesering yang Anda inginkan.",
    whyTitle: "Shalat – hal pertama yang akan kita ditanyai", why: "Nabi ﷺ bersabda bahwa shalat adalah amal pertama yang akan dihisab dari seseorang pada Hari Kiamat (at-Tirmidhi, Abu Dawud, an-Nasa'i). Lima kali sehari Anda berdiri di hadapan Allah – dengan tubuh, lisan, dan hati. Setelah Anda mempelajarinya dengan benar, ia akan menyertai Anda seumur hidup.",
    more: "Penjelasan lengkap", links: [["/islam/prayer-sunni", "Cara shalat – Sunni"], ["/islam/prayer-shia", "Cara shalat – Syiah (Ja'fari)"], ["/prayer", "Waktu shalat dan azan"], ["/arabic", "Belajar membaca bahasa Arab"]],
  },
  ms: {
    kicker: "Belajar solat · langkah demi langkah", title: "Cara bersolat – dengan latihan yang menunjukkan setiap gerakan",
    lead: "Pilih solat dan mazhab anda. Figura menunjukkan setiap postur, lengkap dengan bacaan Arab, transliterasi dan maksudnya. Mainkan keseluruhan urutan atau ikuti langkah demi langkah – seberapa kerap yang anda mahu.",
    whyTitle: "Solat – perkara pertama yang akan kita ditanya", why: "Nabi ﷺ bersabda bahawa solat ialah amalan pertama yang akan dihisab ke atas seseorang pada Hari Kiamat (at-Tirmidhi, Abu Dawud, an-Nasa'i). Lima kali sehari anda berdiri di hadapan Allah – dengan jasad, lidah dan hati. Setelah anda mempelajarinya dengan betul, ia kekal bersama anda sepanjang hayat.",
    more: "Penerangan lanjut", links: [["/islam/prayer-sunni", "Cara bersolat – Sunni"], ["/islam/prayer-shia", "Cara bersolat – Syiah (Ja'fari)"], ["/prayer", "Waktu solat dan azan"], ["/arabic", "Belajar membaca bahasa Arab"]],
  },
  bn: {
    kicker: "নামাজ শিখুন · ধাপে ধাপে", title: "কীভাবে নামাজ পড়বেন – প্রতিটি নড়াচড়া দেখানো প্রশিক্ষণসহ",
    lead: "নামাজ ও আপনার মাযহাব বেছে নিন। ফিগারটি প্রতিটি ভঙ্গি দেখায়, সঙ্গে আরবি শব্দ, উচ্চারণ ও অর্থ। পুরো ক্রম চালান অথবা ধাপে ধাপে এগোন – যতবার খুশি।",
    whyTitle: "নামাজ – যে বিষয়ে আমাদের সবার আগে জিজ্ঞাসা করা হবে", why: "নবী ﷺ বলেছেন, কিয়ামতের দিন মানুষের যে আমলের হিসাব সবার আগে নেওয়া হবে তা হলো নামাজ (at-Tirmidhi, Abu Dawud, an-Nasa'i)। দিনে পাঁচবার আপনি আল্লাহর সামনে দাঁড়ান – শরীর, জিহ্বা ও হৃদয় নিয়ে। একবার ঠিকভাবে শিখে নিলে এটি সারাজীবন আপনার সঙ্গে থাকে।",
    more: "বিস্তারিত ব্যাখ্যা", links: [["/islam/prayer-sunni", "কীভাবে নামাজ পড়বেন – সুন্নি"], ["/islam/prayer-shia", "কীভাবে নামাজ পড়বেন – শিয়া (জাফরি)"], ["/prayer", "নামাজের সময় ও আযান"], ["/arabic", "আরবি পড়তে শিখুন"]],
  },
  ru: {
    kicker: "Учимся намазу · шаг за шагом", title: "Как совершать намаз – с тренажёром, который показывает каждое движение",
    lead: "Выберите намаз и свою традицию. Фигура показывает каждое положение, а рядом – арабские слова, транслитерацию и смысл. Запустите всю последовательность или проходите её шаг за шагом – сколько угодно раз.",
    whyTitle: "Намаз – то, о чём нас спросят в первую очередь", why: "Пророк ﷺ сказал, что намаз – это первое деяние, за которое человек будет держать ответ в День воскресения (at-Tirmidhi, Abu Dawud, an-Nasa'i). Пять раз в день вы стоите перед Аллахом – телом, языком и сердцем. Если вы выучите его как следует, он останется с вами на всю жизнь.",
    more: "Подробное объяснение", links: [["/islam/prayer-sunni", "Как совершать намаз – сунниты"], ["/islam/prayer-shia", "Как совершать намаз – шииты (джафариты)"], ["/prayer", "Время намаза и азан"], ["/arabic", "Учимся читать по-арабски"]],
  },
  zh: {
    kicker: "学习礼拜 · 一步一步", title: "如何礼拜——用一个展示每个动作的训练",
    lead: "选择礼拜和您所属的传统。人物会演示每个姿势，并配有阿拉伯语原文、音译和含义。可以播放整个流程，也可以一步一步来——次数不限。",
    whyTitle: "礼拜——我们最先会被问到的事", why: "先知ﷺ说，礼拜是一个人在复生日最先被清算的功课（at-Tirmidhi, Abu Dawud, an-Nasa'i）。每天五次，您以身体、舌头和心灵站在安拉面前。一旦把它学好，它会伴随您一生。",
    more: "详细讲解", links: [["/islam/prayer-sunni", "如何礼拜——逊尼派"], ["/islam/prayer-shia", "如何礼拜——什叶派（贾法里）"], ["/prayer", "礼拜时间与宣礼"], ["/arabic", "学习阅读阿拉伯语"]],
  },
};
const content = (l: string) => C[langOf(l)];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/salah", `${c.kicker} | Quran Masterclass`, c.lead.slice(0, 158));
}

export default async function SalahPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  const ld = { "@context": "https://schema.org", "@type": "HowTo", name: c.title, description: c.lead, url: abs(`/${locale}/salah`), inLanguage: locale };
  return (
    <>
    <JsonLd data={ld} />
    <PracticeHero uid="salah-h" word="الصلاة" kicker={c.kicker} title={c.title} lead={c.lead} />
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-5 sm:pt-12">
      <PrayerTrainer />
      <section className="mt-16 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <figure className="pa-paper px-6 pb-7 pt-8 sm:px-8">
          <h2 className="font-display text-3xl">{c.whyTitle}</h2>
          <p className="relative mt-4 text-[17px] leading-relaxed text-ink/90">{c.why}</p>
        </figure>
        <div className="pa-card p-5 pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted rtl:tracking-normal">{c.more}</p>
          <ul className="mt-3 grid gap-1">{c.links.map(([h, l]) => <li key={h}><Link href={h} className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 font-semibold text-accent hover:bg-[rgb(var(--gold))]/10"><PracticeStar size={10} /><span className="min-w-0 flex-1">{l}</span><ArrowNext /></Link></li>)}</ul>
        </div>
      </section>
    </main>
    <MoreTiles keys={["arabic", "duas", "prayer", "islam"]} />
    </>
  );
}
