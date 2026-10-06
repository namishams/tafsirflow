import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import AssistantChat from "@/components/AssistantChat";
import { pageMeta } from "@/lib/site";

const C = {
  de: { kicker: "Frag nach", title: "Der Quran-Masterclass-Assistent", lead: "Fragen zum Koran, zum Islam und zur Shams-Methode – rund um die Uhr. Der Assistent antwortet nur zu diesen Themen und verweist dich bei persönlichen religiösen Fragen an einen Gelehrten.", feature: "den Assistenten" },
  en: { kicker: "Ask", title: "The Quran Masterclass Assistant", lead: "Questions about the Quran, Islam and the Shams Method – any time. The assistant only answers on these topics and refers you to a scholar for personal religious questions.", feature: "the assistant" },
  ar: { kicker: "اسأل", title: "مساعد Quran Masterclass", lead: "أسئلتك عن القرآن الكريم والإسلام ومنهج شمس في أي وقت. يجيب المساعد في هذه الموضوعات فقط، ويحيلك إلى أهل العلم في المسائل الشرعية الشخصية.", feature: "المساعد" },
};
const content = (l: string) => (l === "de" ? C.de : l === "ar" ? C.ar : C.en);

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
