import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import AssistantChat from "@/components/AssistantChat";
import type { AppLocale } from "@/i18n/locales";
import { pageMeta } from "@/lib/site";

type Text = { kicker: string; title: string; lead: string; feature: string };
const C: Record<AppLocale, Text> = {
  de: { kicker: "Fragen Sie nach", title: "Der Quran-Masterclass-Assistent", lead: "Fragen zum Koran, zum Islam und zur Shams-Methode – rund um die Uhr. Der Assistent antwortet nur zu diesen Themen und verweist Sie bei persönlichen religiösen Fragen an einen Gelehrten.", feature: "den Assistenten" },
  en: { kicker: "Ask", title: "The Quran Masterclass Assistant", lead: "Questions about the Quran, Islam and the Shams Method – any time. The assistant only answers on these topics and refers you to a scholar for personal religious questions.", feature: "the assistant" },
  ar: { kicker: "اسأل", title: "مساعد Quran Masterclass", lead: "أسئلتك عن القرآن الكريم والإسلام ومنهج شمس في أي وقت. يجيب المساعد في هذه الموضوعات فقط، ويحيلك إلى أهل العلم في المسائل الشرعية الشخصية.", feature: "المساعد" },
  tr: { kicker: "Sorun", title: "Quran Masterclass Asistanı", lead: "Kur'an, İslam ve Shams Metodu hakkında sorular – günün her saati. Asistan yalnızca bu konularda yanıt verir; kişisel dinî sorularda sizi bir âlime yönlendirir.", feature: "asistanı" },
  ur: { kicker: "پوچھیں", title: "Quran Masterclass معاون", lead: "قرآن، اسلام اور شمس طریقہ کے بارے میں سوالات – کسی بھی وقت۔ معاون صرف انہی موضوعات پر جواب دیتا ہے اور ذاتی دینی سوالات میں آپ کو کسی عالم کی طرف رہنمائی کرتا ہے۔", feature: "معاون" },
  fa: { kicker: "بپرسید", title: "دستیار Quran Masterclass", lead: "پرسش‌هایی درباره قرآن، اسلام و روش شمس – در هر ساعت از شبانه‌روز. دستیار فقط درباره همین موضوعات پاسخ می‌دهد و در پرسش‌های دینی شخصی شما را به یک عالم ارجاع می‌دهد.", feature: "دستیار" },
  ps: { kicker: "وپوښتئ", title: "د Quran Masterclass مرستیال", lead: "د قرآن، اسلام او د شمس طریقې په اړه پوښتنې – هر وخت. مرستیال یوازې پر همدې موضوعاتو ځواب ورکوي او په شخصي دیني پوښتنو کې تاسو عالم ته لارښوونه کوي.", feature: "مرستیال" },
  fr: { kicker: "Pose ta question", title: "L'assistant Quran Masterclass", lead: "Des questions sur le Coran, l'islam et la Méthode Shams – à tout moment. L'assistant ne répond que sur ces sujets et t'oriente vers un savant pour les questions religieuses personnelles.", feature: "l'assistant" },
  es: { kicker: "Pregunta", title: "El asistente de Quran Masterclass", lead: "Preguntas sobre el Corán, el islam y el Método Shams, a cualquier hora. El asistente solo responde sobre estos temas y, ante preguntas religiosas personales, te remite a un sabio.", feature: "el asistente" },
  id: { kicker: "Tanyakan", title: "Asisten Quran Masterclass", lead: "Pertanyaan tentang Al-Qur'an, Islam, dan Metode Shams – kapan saja. Asisten hanya menjawab seputar topik ini dan merujuk Anda ke ulama untuk pertanyaan agama yang bersifat pribadi.", feature: "asisten" },
  ms: { kicker: "Tanya", title: "Pembantu Quran Masterclass", lead: "Soalan tentang Quran, Islam dan Kaedah Shams – pada bila-bila masa. Pembantu hanya menjawab tentang topik ini dan merujuk anda kepada ulama untuk soalan agama yang bersifat peribadi.", feature: "pembantu" },
  bn: { kicker: "জিজ্ঞাসা করুন", title: "Quran Masterclass সহকারী", lead: "কুরআন, ইসলাম ও শামস পদ্ধতি নিয়ে প্রশ্ন – যেকোনো সময়। সহকারী শুধু এই বিষয়গুলোতেই উত্তর দেয় এবং ব্যক্তিগত ধর্মীয় প্রশ্নে আপনাকে একজন আলেমের কাছে পাঠায়।", feature: "সহকারী" },
  ru: { kicker: "Спроси", title: "Помощник Quran Masterclass", lead: "Вопросы о Коране, исламе и Методе Шамса – в любое время. Помощник отвечает только на эти темы, а с личными религиозными вопросами отправляет тебя к учёному.", feature: "помощника" },
  zh: { kicker: "提问", title: "Quran Masterclass 助手", lead: "关于古兰经、伊斯兰教和 Shams 方法的问题，随时可问。助手只回答这些主题的问题；遇到个人宗教问题，会建议你请教学者。", feature: "助手" },
};
const content = (l: string) => C[(l in C ? l : "en") as AppLocale];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/assistant", `${c.title} | Quran Masterclass`, c.lead);
}

export default async function AssistantPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-8">
      <p className="eyebrow text-gold">{c.kicker}</p>
      <h1 className="font-display mt-2 text-4xl leading-tight sm:text-5xl">{c.title}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">{c.lead}</p>
      <div className="mt-6"><AssistantChat /></div>
    </main>
  );
}
