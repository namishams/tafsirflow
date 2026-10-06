import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteMenu from "@/components/SiteMenu";
import SupportZiina from "@/components/SupportZiina";
import TrustStrip from "@/components/TrustStrip";
import MadeInDubai from "@/components/MadeInDubai";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";

type C = {
  kicker: string; title: string; lead: string; free: string;
  hadithTitle: string; hadith: string; hadithSrc: string;
  forTitle: string; forItems: [string, string][];
  promiseTitle: string; promises: string[];
  waysTitle: string; ways: [string, string, string, string][];
  faqTitle: string; faq: [string, string][];
  contact: string; back: string;
};
const de: C = {
  kicker: "Unterstützen", title: "Hilf mit, dass der Koran für alle kostenlos bleibt",
  lead: "Quran Masterclass ist kostenlos – ohne Abo, ohne Werbung, ohne Bezahlschranke. Die Plattform wird privat von Nami Shams getragen. Wenn sie dir hilft, kannst du freiwillig mittragen: als Sadaqa, deren Lohn weiterläuft, solange Menschen hier lernen.",
  free: "Unterstützen schaltet nichts frei. Alles bleibt für alle kostenlos – ein Geschenk, kein Kauf.",
  hadithTitle: "Eine Tat, die weiterwirkt",
  hadith: "„Wenn der Mensch stirbt, enden seine Taten – außer drei: eine fortlaufende Spende (Sadaqa dschariya), Wissen, von dem man Nutzen hat, und ein rechtschaffenes Kind, das für ihn bittet.“",
  hadithSrc: "Sahih Muslim",
  forTitle: "Wofür deine Unterstützung eingesetzt wird",
  forItems: [["Server & Audio", "Der Betrieb der Plattform und das Bereitstellen der Rezitationen – Vers für Vers, für Menschen in aller Welt."], ["Neue Sprachen", "Übersetzungen der Oberfläche, der Kurse und der Artikel, damit jeder in seiner Sprache lernen kann."], ["Prüfung durch Gelehrte", "Inhalte wie die Gebetsabläufe und Erklärungen sollen von qualifizierten Gelehrten durchgesehen werden."], ["Neue Kurse", "Weitere Lektionen für Arabisch, Tadschwid und Hifz – und Werkzeuge, die das Lernen leichter machen."]],
  promiseTitle: "Unser Versprechen",
  promises: ["Der Koran und alle Lernwerkzeuge bleiben kostenlos.", "Keine Werbung, kein Verkauf von Daten.", "Unterstützung ist freiwillig und schaltet keine Funktionen frei.", "Bezahlt wird nur bei Ziina – deine Kartendaten erreichen uns nie."],
  waysTitle: "Andere Wege zu helfen",
  ways: [["Duʿāʾ", "Bitte Allah um Annahme und Segen für alle, die hier lernen und mitwirken.", "", ""], ["Weitersagen", "Erzähl Familie und Freunden davon – das kostet nichts und hilft am meisten.", "/how", "Was die Masterclass bietet"], ["Feedback geben", "Wünsche, Ideen und Fehlerhinweise machen die Plattform besser.", "/feedback", "Zum Feedback"], ["Beim Übersetzen helfen", "Du sprichst eine unserer Sprachen besonders gut? Schreib uns.", "mailto:info@quranmasterclass.com", "E-Mail schreiben"]],
  faqTitle: "Häufige Fragen",
  faq: [
    ["Kann ich meine Zakat hier geben?", "Bitte nicht. Die Zakat hat im Koran festgelegte Empfänger (9:60). Unterstützung für Quran Masterclass ist freiwillige Sadaqa. Bei Fragen zu deiner Zakat wende dich an einen Gelehrten oder eine offizielle Zakat-Stelle."],
    ["Wie kann ich bezahlen?", "Über Ziina, die Zahlungs-App aus den Emiraten – mit Apple Pay, Google Pay oder Karte. Ziina zeigt dir den Betrag vor der Zahlung an."],
    ["Bekomme ich dafür etwas freigeschaltet?", "Nein, bewusst nicht. Alles ist für alle kostenlos. Deine Unterstützung ist ein Geschenk an alle, die hier lernen."],
    ["Ist die Zahlung sicher?", "Die Zahlung läuft vollständig bei Ziina. Wir sehen und speichern keine Kartendaten."],
    ["Können Unternehmen oder Stiftungen unterstützen?", "Gern – schreib an info@quranmasterclass.com. Werbung auf der Plattform wird es trotzdem nicht geben."],
  ],
  contact: "Fragen? info@quranmasterclass.com", back: "Zurück zur Startseite",
};
const en: C = {
  kicker: "Support", title: "Help keep the Quran free for everyone",
  lead: "Quran Masterclass is free – no subscription, no ads, no paywall. The platform is privately funded by Nami Shams. If it helps you, you can voluntarily share the load: as sadaqa whose reward continues as long as people learn here.",
  free: "Supporting unlocks nothing. Everything stays free for everyone – a gift, not a purchase.",
  hadithTitle: "A deed that keeps on giving",
  hadith: "“When a person dies, his deeds come to an end except for three: ongoing charity (sadaqa jariya), knowledge that benefits, and a righteous child who prays for him.”",
  hadithSrc: "Sahih Muslim",
  forTitle: "What your support is used for",
  forItems: [["Servers & audio", "Running the platform and delivering the recitations – verse by verse, for people around the world."], ["New languages", "Translating the interface, courses and articles so everyone can learn in their own language."], ["Review by scholars", "Content such as the prayer guides and explanations should be reviewed by qualified scholars."], ["New courses", "More lessons for Arabic, tajweed and hifz – and tools that make learning easier."]],
  promiseTitle: "Our promise",
  promises: ["The Quran and all learning tools stay free.", "No ads, no selling of data.", "Support is voluntary and unlocks no features.", "Payment happens only at Ziina – your card details never reach us."],
  waysTitle: "Other ways to help",
  ways: [["Du'a", "Ask Allah to accept and bless everyone who learns and contributes here.", "", ""], ["Spread the word", "Tell family and friends – it costs nothing and helps the most.", "/how", "What the Masterclass offers"], ["Give feedback", "Wishes, ideas and error reports make the platform better.", "/feedback", "Go to feedback"], ["Help translate", "Do you speak one of our languages particularly well? Write to us.", "mailto:info@quranmasterclass.com", "Send an e-mail"]],
  faqTitle: "Frequently asked questions",
  faq: [
    ["Can I give my zakat here?", "Please don't. Zakat has recipients defined in the Quran (9:60). Support for Quran Masterclass is voluntary sadaqa. For questions about your zakat, ask a scholar or an official zakat institution."],
    ["How can I pay?", "Through Ziina, the payment app from the Emirates – with Apple Pay, Google Pay or card. Ziina shows you the amount before you pay."],
    ["Do I unlock anything?", "No, deliberately not. Everything is free for everyone. Your support is a gift to everyone who learns here."],
    ["Is the payment secure?", "The payment runs entirely at Ziina. We neither see nor store card details."],
    ["Can companies or foundations support?", "Gladly – write to info@quranmasterclass.com. There will still be no advertising on the platform."],
  ],
  contact: "Questions? info@quranmasterclass.com", back: "Back to the home page",
};
const ar: C = {
  kicker: "ادعمنا", title: "ساعد في أن يبقى القرآن مجانيًا للجميع",
  lead: "Quran Masterclass مجانية بالكامل: بلا اشتراك ولا إعلانات ولا محتوى مدفوع، ويتكفّل بها نامي شمس من ماله الخاص. فإن نفعتك فبإمكانك أن تشارك في حملها تطوّعًا، صدقةً يجري أجرها ما دام الناس يتعلّمون هنا.",
  free: "الدعم لا يفتح أي ميزة، وكل شيء يبقى مجانيًا للجميع؛ إنه هدية لا شراء.",
  hadithTitle: "عمل يبقى أثره",
  hadith: "«إذا مات الإنسان انقطع عنه عمله إلا من ثلاثة: إلا من صدقة جارية، أو علم يُنتفع به، أو ولد صالح يدعو له».",
  hadithSrc: "رواه مسلم",
  forTitle: "فيمَ يُصرف دعمك",
  forItems: [["الخوادم والصوت", "تشغيل المنصّة وإيصال التلاوات آيةً آية إلى الناس في أنحاء العالم."], ["لغات جديدة", "ترجمة الواجهة والدورات والمقالات ليتعلّم كلٌّ بلغته."], ["مراجعة العلماء", "ينبغي أن يراجع أهلُ العلم المؤهّلون محتوى مثل صفة الصلاة والشروح."], ["دورات جديدة", "دروس إضافية في العربية والتجويد والحفظ، وأدوات تيسّر التعلّم."]],
  promiseTitle: "وعدُنا",
  promises: ["القرآن وجميع أدوات التعلّم تبقى مجانية.", "لا إعلانات ولا بيع للبيانات.", "الدعم تطوّعي ولا يفتح أي ميزات.", "الدفع يتم عبر زينة فقط، ولا تصل إلينا بيانات بطاقتك أبدًا."],
  waysTitle: "طرق أخرى للمساعدة",
  ways: [["الدعاء", "ادعُ الله أن يتقبّل ويبارك لكل من يتعلّم هنا ويُسهم فيه.", "", ""], ["انشر الخير", "أخبر أهلك وأصدقاءك؛ لا يكلّفك شيئًا وهو أعظم عون.", "/how", "ماذا تقدّم الماستركلاس"], ["شاركنا رأيك", "الأمنيات والأفكار والتنبيه على الأخطاء تجعل المنصّة أفضل.", "/feedback", "إلى صفحة الآراء"], ["ساعد في الترجمة", "تتقن إحدى لغاتنا؟ راسلنا.", "mailto:info@quranmasterclass.com", "أرسل بريدًا"]],
  faqTitle: "أسئلة شائعة",
  faq: [
    ["هل يمكنني دفع زكاتي هنا؟", "نرجو ألا تفعل؛ فللزكاة مصارف حدّدها القرآن (التوبة 9:60)، ودعم Quran Masterclass صدقة تطوّعية. وفي أسئلة زكاتك ارجع إلى عالمٍ أو إلى جهة زكاة رسمية."],
    ["كيف أدفع؟", "عبر زينة، تطبيق المدفوعات الإماراتي، باستخدام Apple Pay أو Google Pay أو البطاقة، ويعرض لك المبلغ قبل الدفع."],
    ["هل أحصل على مزايا إضافية؟", "لا، وهذا مقصود؛ فكل شيء مجاني للجميع، ودعمك هدية لكل من يتعلّم هنا."],
    ["هل الدفع آمن؟", "يتم الدفع بالكامل لدى زينة، ولا نرى بيانات البطاقات ولا نحفظها."],
    ["هل يمكن للشركات والمؤسسات الدعم؟", "بكل سرور، راسلونا على info@quranmasterclass.com، ومع ذلك لن تكون هناك إعلانات على المنصّة."],
  ],
  contact: "أسئلة؟ info@quranmasterclass.com", back: "العودة إلى الصفحة الرئيسية",
};
const content = (l: string) => (l === "de" ? de : l === "ar" ? ar : en);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/support", `${c.title} | Quran Masterclass`, c.lead.slice(0, 158));
}

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", url: abs(`/${locale}/support`), mainEntity: c.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (
    <div className="min-h-screen">
      <JsonLd data={ld} />
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
          <Link href="/" className="flex items-center gap-2.5"><Logo size={28} /><span className="text-[15px] font-extrabold tracking-tight">Quran Masterclass</span></Link>
          <div className="flex items-center gap-2"><LanguageSwitcher /><SiteMenu /></div>
        </div>
      </header>

      <section className="stage text-[#eef0f3]">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 py-12 sm:py-16 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-start [&>*]:min-w-0">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{c.kicker}</p>
            <h1 className="font-display mt-4 text-[36px] leading-[1.06] sm:text-5xl">{c.title}</h1>
            <p className="mt-5 text-[17px] leading-relaxed text-white/75">{c.lead}</p>
            <p className="mt-5 text-sm font-semibold text-[rgb(var(--gold))]">{c.free}</p>
          </div>
          <Suspense><SupportZiina /></Suspense>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-5 pb-16">
        <figure className="mx-auto mt-12 max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{c.hadithTitle}</p>
          <blockquote className="font-display mt-4 text-[22px] leading-relaxed sm:text-2xl">{c.hadith}</blockquote>
          <figcaption className="mt-3 text-sm text-muted">{c.hadithSrc}</figcaption>
        </figure>

        <section className="mt-14">
          <h2 className="font-display text-3xl">{c.forTitle}</h2>
          <ul className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {c.forItems.map(([h, d], i) => <li key={h} className="bg-surface p-5"><p className="font-display text-2xl text-gold">0{i + 1}</p><h3 className="mt-1 font-bold">{h}</h3><p className="mt-1 text-[15px] leading-relaxed text-muted">{d}</p></li>)}
          </ul>
        </section>

        <section className="mt-12 rounded-xl border border-line border-s-4 border-s-gold bg-surface p-6">
          <h2 className="font-display text-2xl">{c.promiseTitle}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">{c.promises.map((p) => <li key={p} className="flex gap-2 text-[15px]"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{p}</li>)}</ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-3xl">{c.waysTitle}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {c.ways.map(([h, d, href, cta]) => (
              <li key={h} className="flex flex-col rounded-xl border border-line bg-surface p-5">
                <h3 className="font-bold">{h}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{d}</p>
                {href && (href.startsWith("mailto:") ? <a href={href} className="mt-3 text-sm font-bold text-accent hover:underline">{cta} →</a> : <Link href={href} className="mt-3 text-sm font-bold text-accent hover:underline">{cta} →</Link>)}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="font-display text-3xl">{c.faqTitle}</h2>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {c.faq.map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[17px] font-bold">{q}<span className="mt-1 text-muted transition group-open:rotate-45">+</span></summary>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14"><TrustStrip /></div>
        <div className="mt-10 flex flex-col items-center gap-3 text-sm text-muted">
          <p>{c.contact}</p>
          <MadeInDubai />
          <Link href="/" className="font-semibold text-accent">← {c.back}</Link>
        </div>
      </main>
    </div>
  );
}
