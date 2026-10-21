"use client";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/locales";
import Markdown from "./Markdown";

type Msg = { role: "user" | "assistant"; content: string };
type Text = { ph: string; send: string; hello: string; off: string; err: string; limit: string; note: string; sugg: string[]; thinking: string; clear: string; login: string; loginCta: string };
const T: Record<AppLocale, Text> = {
  de: { ph: "Fragen Sie etwas über den Koran oder den Islam …", send: "Senden", hello: "As-salāmu ʿalaykum! Ich beantworte Fragen zum Koran, zum Islam und zur Shams-Methode. Bei persönlichen religiösen Urteilen verweise ich Sie an einen Gelehrten.", off: "Der Assistent wird gerade eingerichtet.", err: "Das hat nicht geklappt. Bitte versuchen Sie es gleich noch einmal.", limit: "Sie haben das Tageslimit erreicht – morgen geht es weiter.", note: "KI-gestützter Assistent: Er kann sich irren und ersetzt keinen Gelehrten. Für Fatwas und persönliche Fragen wenden Sie sich an einen qualifizierten Gelehrten.", sugg: ["Was ist die Shams-Methode?", "Wie lerne ich Al-Fatiha am besten?", "Was bedeutet Ayat al-Kursi?", "Wie bereite ich mich auf Ramadan vor?"], thinking: "denkt nach …", clear: "Neues Gespräch", login: "Die freien Fragen für heute sind aufgebraucht. Mit einem kostenlosen Konto können Sie weiterfragen.", loginCta: "Kostenlos anmelden" },
  en: { ph: "Ask something about the Quran or Islam …", send: "Send", hello: "As-salāmu ʿalaykum! I answer questions about the Quran, Islam and the Shams Method. For personal religious rulings I will refer you to a scholar.", off: "The assistant is being set up.", err: "That did not work. Please try again in a moment.", limit: "You have reached today's limit – see you tomorrow.", note: "AI-based assistant: it can make mistakes and does not replace a scholar. For fatwas and personal questions, please ask a qualified scholar.", sugg: ["What is the Shams Method?", "How do I best learn Al-Fatiha?", "What does Ayat al-Kursi mean?", "How do I prepare for Ramadan?"], thinking: "thinking …", clear: "New conversation", login: "Today's free questions are used up. With a free account you can keep asking.", loginCta: "Sign up for free" },
  ar: { ph: "اسأل عن القرآن أو الإسلام …", send: "إرسال", hello: "السلام عليكم! أجيب عن أسئلتك حول القرآن الكريم والإسلام ومنهج شمس، وفي المسائل الشرعية الشخصية أحيلك إلى أهل العلم.", off: "يجري الآن إعداد المساعد.", err: "لم تنجح العملية، حاول بعد قليل.", limit: "بلغت الحد اليومي، نلتقي غدًا بإذن الله.", note: "مساعد يعمل بالذكاء الاصطناعي، قد يخطئ ولا يغني عن العلماء. للفتوى والمسائل الشخصية ارجع إلى عالمٍ مؤهَّل.", sugg: ["ما هو منهج شمس؟", "كيف أحفظ سورة الفاتحة؟", "ما معنى آية الكرسي؟", "كيف أستعد لرمضان؟"], thinking: "يفكّر …", clear: "محادثة جديدة", login: "انتهت الأسئلة المجانية لهذا اليوم. أنشئ حسابًا مجانيًا لتواصل السؤال.", loginCta: "سجّل مجانًا" },
  tr: { ph: "Kur'an veya İslam hakkında bir şey sorun …", send: "Gönder", hello: "Es-selâmü aleyküm! Kur'an, İslam ve Shams Metodu hakkındaki soruları yanıtlıyorum. Kişisel dinî hükümler konusunda sizi bir âlime yönlendiririm.", off: "Asistan şu anda hazırlanıyor.", err: "Bu işlem olmadı. Lütfen birazdan tekrar deneyin.", limit: "Bugünkü sınıra ulaştınız – yarın devam edebilirsiniz.", note: "Yapay zekâ destekli asistan: Yanılabilir ve bir âlimin yerini tutmaz. Fetvalar ve kişisel sorular için lütfen yetkin bir âlime danışın.", sugg: ["Shams Metodu nedir?", "Fâtiha'yı en iyi nasıl öğrenirim?", "Âyetü'l-Kürsî ne anlama gelir?", "Ramazan'a nasıl hazırlanırım?"], thinking: "düşünüyor …", clear: "Yeni sohbet", login: "Bugünkü ücretsiz sorular bitti. Ücretsiz bir hesapla sormaya devam edebilirsiniz.", loginCta: "Ücretsiz kaydolun" },
  ur: { ph: "قرآن یا اسلام کے بارے میں کچھ پوچھیں …", send: "بھیجیں", hello: "السلام علیکم! میں قرآن، اسلام اور شمس طریقہ کے بارے میں سوالات کے جواب دیتا ہوں۔ ذاتی دینی احکام کے لیے آپ کو کسی عالم کی طرف رہنمائی کروں گا۔", off: "معاون اس وقت تیار کیا جا رہا ہے۔", err: "یہ کام نہیں ہو سکا۔ براہِ کرم تھوڑی دیر بعد دوبارہ کوشش کریں۔", limit: "آج کی حد پوری ہو گئی ہے – کل پھر ملاقات ہوگی۔", note: "مصنوعی ذہانت پر مبنی معاون: یہ غلطی کر سکتا ہے اور کسی عالم کا بدل نہیں۔ فتووں اور ذاتی سوالات کے لیے کسی مستند عالم سے رجوع کریں۔", sugg: ["شمس طریقہ کیا ہے؟", "سورۃ الفاتحہ سب سے بہتر طریقے سے کیسے سیکھوں؟", "آیت الکرسی کا کیا مطلب ہے؟", "رمضان کی تیاری کیسے کروں؟"], thinking: "سوچ رہا ہے …", clear: "نئی گفتگو", login: "آج کے مفت سوالات ختم ہو گئے ہیں۔ مفت اکاؤنٹ کے ساتھ آپ سوال جاری رکھ سکتے ہیں۔", loginCta: "مفت رجسٹر کریں" },
  fa: { ph: "درباره قرآن یا اسلام چیزی بپرسید …", send: "ارسال", hello: "السلام علیکم! من به پرسش‌های مربوط به قرآن، اسلام و روش شمس پاسخ می‌دهم. در احکام دینی شخصی شما را به یک عالم ارجاع می‌دهم.", off: "دستیار در حال آماده‌سازی است.", err: "انجام نشد. لطفاً کمی بعد دوباره تلاش کنید.", limit: "به سقف امروز رسیده‌اید – فردا ادامه می‌دهیم.", note: "دستیار مبتنی بر هوش مصنوعی: ممکن است اشتباه کند و جای عالم دین را نمی‌گیرد. برای فتوا و پرسش‌های شخصی به یک عالم صاحب‌صلاحیت مراجعه کنید.", sugg: ["روش شمس چیست؟", "چگونه سوره الفاتحه را به بهترین شکل یاد بگیرم؟", "آیة‌الکرسی به چه معناست؟", "چگونه برای رمضان آماده شوم؟"], thinking: "در حال فکر کردن …", clear: "گفتگوی تازه", login: "پرسش‌های رایگان امروز تمام شد. با یک حساب رایگان می‌توانید به پرسیدن ادامه دهید.", loginCta: "ثبت‌نام رایگان" },
  ps: { ph: "د قرآن یا اسلام په اړه یو څه وپوښتئ …", send: "ولېږئ", hello: "السلام علیکم! زه د قرآن، اسلام او د شمس طریقې په اړه پوښتنو ته ځواب وایم. په شخصي دیني حکمونو کې تاسو عالم ته لارښوونه کوم.", off: "مرستیال اوس جوړیږي.", err: "دا کار ونه شو. مهرباني وکړئ لږ وروسته بیا هڅه وکړئ.", limit: "تاسو د نن ورځې حد ته رسېدلي یاست – سبا به بیا یو ځای شو.", note: "په مصنوعي ځیرکتیا ولاړ مرستیال: ممکن تېروتنه وکړي او د عالم ځای نه نیسي. د فتوا او شخصي پوښتنو لپاره یو وړ عالم ته مراجعه وکړئ.", sugg: ["د شمس طریقه څه ده؟", "سورة الفاتحه څنګه په غوره ډول زده کړم؟", "آیت الکرسي څه معنا لري؟", "د رمضان لپاره څنګه ځان چمتو کړم؟"], thinking: "فکر کوي …", clear: "نوې خبرې اترې", login: "د نن ورځې وړیا پوښتنې پای ته ورسېدې. په وړیا حساب سره تاسو کولای شئ پوښتنې ته دوام ورکړئ.", loginCta: "وړیا نوم ولیکئ" },
  fr: { ph: "Posez une question sur le Coran ou l'islam …", send: "Envoyer", hello: "As-salāmu ʿalaykum ! Je réponds aux questions sur le Coran, l'islam et la Méthode Shams. Pour les avis religieux personnels, je vous oriente vers un savant.", off: "L'assistant est en cours de mise en place.", err: "Cela n'a pas fonctionné. Réessayez dans un instant.", limit: "Vous avez atteint la limite du jour – à demain.", note: "Assistant fondé sur l'IA : il peut se tromper et ne remplace pas un savant. Pour les fatwas et les questions personnelles, adressez-vous à un savant qualifié.", sugg: ["Qu'est-ce que la Méthode Shams ?", "Comment apprendre Al-Fatiha au mieux ?", "Que signifie Ayat al-Kursi ?", "Comment me préparer au Ramadan ?"], thinking: "réfléchit …", clear: "Nouvelle conversation", login: "Les questions gratuites du jour sont épuisées. Avec un compte gratuit, vous pouvez continuer à poser des questions.", loginCta: "S'inscrire gratuitement" },
  es: { ph: "Pregunte algo sobre el Corán o el islam …", send: "Enviar", hello: "¡As-salāmu ʿalaykum! Respondo preguntas sobre el Corán, el islam y el Método Shams. Para dictámenes religiosos personales le remito a un sabio.", off: "El asistente se está preparando.", err: "No ha funcionado. Inténtelo de nuevo en un momento.", limit: "Ha alcanzado el límite de hoy – hasta mañana.", note: "Asistente basado en IA: puede equivocarse y no sustituye a un sabio. Para fetuas y cuestiones personales, consulte a un sabio cualificado.", sugg: ["¿Qué es el Método Shams?", "¿Cuál es la mejor forma de aprender Al-Fatiha?", "¿Qué significa Ayat al-Kursi?", "¿Cómo me preparo para el Ramadán?"], thinking: "pensando …", clear: "Nueva conversación", login: "Las preguntas gratuitas de hoy se han agotado. Con una cuenta gratuita puede seguir preguntando.", loginCta: "Registrarse gratis" },
  id: { ph: "Tanyakan sesuatu tentang Al-Qur'an atau Islam …", send: "Kirim", hello: "Assalamu'alaikum! Saya menjawab pertanyaan tentang Al-Qur'an, Islam, dan Metode Shams. Untuk keputusan agama yang bersifat pribadi, saya akan merujuk Anda ke ulama.", off: "Asisten sedang disiapkan.", err: "Tidak berhasil. Silakan coba lagi sebentar lagi.", limit: "Anda telah mencapai batas hari ini – sampai jumpa besok.", note: "Asisten berbasis AI: dapat keliru dan tidak menggantikan ulama. Untuk fatwa dan pertanyaan pribadi, silakan bertanya kepada ulama yang berkompeten.", sugg: ["Apa itu Metode Shams?", "Bagaimana cara terbaik mempelajari Al-Fatihah?", "Apa arti Ayat Kursi?", "Bagaimana cara mempersiapkan diri menyambut Ramadan?"], thinking: "sedang berpikir …", clear: "Percakapan baru", login: "Pertanyaan gratis hari ini sudah habis. Dengan akun gratis, Anda bisa terus bertanya.", loginCta: "Daftar gratis" },
  ms: { ph: "Tanya sesuatu tentang Quran atau Islam …", send: "Hantar", hello: "Assalamualaikum! Saya menjawab soalan tentang Quran, Islam dan Kaedah Shams. Untuk hukum agama yang bersifat peribadi, saya akan merujuk anda kepada ulama.", off: "Pembantu sedang disediakan.", err: "Tidak berjaya. Sila cuba lagi sebentar nanti.", limit: "Anda telah mencapai had hari ini – jumpa lagi esok.", note: "Pembantu berasaskan AI: ia boleh tersilap dan tidak menggantikan ulama. Untuk fatwa dan soalan peribadi, sila rujuk ulama yang berkelayakan.", sugg: ["Apakah Kaedah Shams?", "Bagaimanakah cara terbaik mempelajari Al-Fatihah?", "Apakah maksud Ayat al-Kursi?", "Bagaimana saya bersiap untuk Ramadan?"], thinking: "sedang berfikir …", clear: "Perbualan baru", login: "Soalan percuma hari ini telah habis. Dengan akaun percuma, anda boleh terus bertanya.", loginCta: "Daftar percuma" },
  bn: { ph: "কুরআন বা ইসলাম নিয়ে কিছু জিজ্ঞাসা করুন …", send: "পাঠান", hello: "আসসালামু আলাইকুম! আমি কুরআন, ইসলাম ও শামস পদ্ধতি নিয়ে প্রশ্নের উত্তর দিই। ব্যক্তিগত ধর্মীয় সিদ্ধান্তের ক্ষেত্রে আপনাকে একজন আলেমের কাছে যেতে বলব।", off: "সহকারী এখন প্রস্তুত করা হচ্ছে।", err: "কাজটি হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।", limit: "আজকের সীমা শেষ হয়েছে – কাল আবার দেখা হবে।", note: "কৃত্রিম বুদ্ধিমত্তাভিত্তিক সহকারী: এটি ভুল করতে পারে এবং আলেমের বিকল্প নয়। ফতোয়া ও ব্যক্তিগত প্রশ্নে অনুগ্রহ করে একজন যোগ্য আলেমের শরণাপন্ন হোন।", sugg: ["শামস পদ্ধতি কী?", "সূরা ফাতিহা সবচেয়ে ভালোভাবে কীভাবে শিখব?", "আয়াতুল কুরসির অর্থ কী?", "রমজানের জন্য কীভাবে প্রস্তুতি নেব?"], thinking: "ভাবছে …", clear: "নতুন কথোপকথন", login: "আজকের বিনামূল্যের প্রশ্ন শেষ। একটি বিনামূল্যের অ্যাকাউন্ট খুললে আপনি প্রশ্ন চালিয়ে যেতে পারবেন।", loginCta: "বিনামূল্যে নিবন্ধন করুন" },
  ru: { ph: "Спросите что-нибудь о Коране или исламе …", send: "Отправить", hello: "Ас-саляму алейкум! Я отвечаю на вопросы о Коране, исламе и Методе Шамса. По личным религиозным вопросам я направлю вас к учёному.", off: "Помощник пока настраивается.", err: "Не получилось. Попробуйте ещё раз чуть позже.", limit: "Вы достигли дневного лимита – до завтра.", note: "Помощник на основе ИИ: он может ошибаться и не заменяет учёного. За фетвами и по личным вопросам обращайтесь к квалифицированному учёному.", sugg: ["Что такое Метод Шамса?", "Как лучше всего выучить аль-Фатиху?", "Что означает Аят аль-Курси?", "Как подготовиться к Рамадану?"], thinking: "думает …", clear: "Новый разговор", login: "Бесплатные вопросы на сегодня закончились. С бесплатным аккаунтом вы можете продолжить.", loginCta: "Зарегистрироваться бесплатно" },
  zh: { ph: "问一问关于古兰经或伊斯兰教的问题……", send: "发送", hello: "As-salāmu ʿalaykum（愿您平安）！我回答关于古兰经、伊斯兰教和 Shams 方法的问题。遇到个人宗教裁决，我会建议您请教学者。", off: "助手正在设置中。", err: "没有成功，请稍后再试。", limit: "您已达到今日上限——明天再见。", note: "基于 AI 的助手：可能出错，不能取代学者。如需教法意见（法特瓦）或涉及个人的问题，请咨询有资质的学者。", sugg: ["什么是 Shams 方法？", "怎样才能最好地学会开端章？", "宝座经是什么意思？", "如何为斋月做准备？"], thinking: "思考中……", clear: "新对话", login: "今天的免费提问次数已用完。注册免费账户即可继续提问。", loginCta: "免费注册" },
};

export default function AssistantChat() {
  const locale = useLocale();
  const t = T[(locale in T ? locale : "en") as AppLocale];
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const end = useRef<HTMLDivElement>(null);
  // Enter sends, but not the Enter that confirms an IME word (Chinese, Japanese): see isComposing in the textarea below
  useEffect(() => { fetch("/api/assistant").then((r) => r.json()).then((d) => setEnabled(!!d.enabled)).catch(() => setEnabled(false)); }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);

  const send = async (q: string) => {
    const content = q.trim();
    if (!content || busy) return;
    const next = [...msgs, { role: "user" as const, content }];
    setMsgs(next); setText(""); setBusy(true); setErr("");
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next, locale }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.answer) setMsgs([...next, { role: "assistant", content: d.answer }]);
      else setErr(r.status === 429 ? t.limit : r.status === 401 || r.status === 403 ? "login" : t.err);
    } catch { setErr(t.err); } finally { setBusy(false); }
  };

  if (enabled === false) return <p className="rounded-lg border border-line bg-surface p-5 text-muted">{t.off}</p>;
  return (
    <div className="flex min-h-[60dvh] flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        <div className="flex gap-3">
          <span className="stage grid h-9 w-9 shrink-0 place-items-center rounded-full font-arabic text-lg text-[rgb(var(--gold))]">ق</span>
          <div className="rounded-2xl rounded-ss-sm bg-bg px-4 py-3 text-[15px] leading-relaxed">{t.hello}</div>
        </div>
        {msgs.length === 0 && (
          <div className="flex flex-wrap gap-2 ps-12">
            {t.sugg.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-[rgb(var(--gold))]">{s}</button>)}
          </div>
        )}
        {msgs.map((m, i) => m.role === "user" ? (
          <div key={i} className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-se-sm bg-accent px-4 py-3 text-[15px] text-white">{m.content}</div></div>
        ) : (
          <div key={i} className="flex gap-3">
            <span className="stage grid h-9 w-9 shrink-0 place-items-center rounded-full font-arabic text-lg text-[rgb(var(--gold))]">ق</span>
            <div className="min-w-0 max-w-[85%] rounded-2xl rounded-ss-sm bg-bg px-4 py-1 [&>div>p:first-child]:mt-2"><Markdown text={m.content} /></div>
          </div>
        ))}
        {busy && <p className="ps-12 text-sm text-muted">{t.thinking}</p>}
        {err === "login" ? (
          <div role="alert" className="ms-12 rounded-xl border border-gold/40 bg-gold/5 p-4 text-sm"><p>{t.login}</p><Link href="/account" className="btn-gold mt-3 inline-flex h-10 items-center rounded-full px-4 text-[13px] font-bold">{t.loginCta}</Link></div>
        ) : err && <p role="alert" className="ps-12 text-sm text-red-600">{err}</p>}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="border-t border-line p-3 sm:p-4">
        <div className="flex gap-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(text); } }} maxLength={1200} rows={2} placeholder={t.ph} className="min-w-0 flex-1 resize-none rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none focus:border-[rgb(var(--gold))]" />
          <button disabled={busy || !text.trim()} className="btn-gold h-auto rounded-xl px-5 text-sm font-bold disabled:opacity-40">{t.send}</button>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
          <span>{t.note}</span>
          {msgs.length > 0 && <button type="button" onClick={() => { setMsgs([]); setErr(""); }} className="font-semibold hover:text-ink">{t.clear}</button>}
        </div>
      </form>
    </div>
  );
}
