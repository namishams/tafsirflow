import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { COUNTRIES_AR, COUNTRIES_DE, RECITER_BIOS, STYLE, bioText } from "@/lib/reciters";
import type { AppLocale } from "@/i18n/locales";
import { abs, pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";
import { CalligraphyDraw } from "@/components/Ornaments";
import DonateCTA from "@/components/DonateCTA";
import { QuranSeal } from "@/components/art/QuranArt";

type Text = { kicker: string; title: string; lead: string; listen: string; read: string; path: string; radio: string };
const C: Record<AppLocale, Text> = {
  de: { kicker: "Die Stimmen des Korans", title: "50 große Rezitatoren – ihre Geschichte, ihr Klang, ihr Vermächtnis", lead: "Von den Meistern aus Kairo, deren Aufnahmen seit Generationen um die Welt gehen, bis zu den Imamen der heiligen Moscheen in Mekka und Medina und den Stimmen aus den Emiraten. Lernen Sie sie kennen – und lernen Sie von ihnen: Wer einem großen Rezitator aufmerksam zuhört, lernt Aussprache, Rhythmus und Ehrfurcht.", listen: "Im Player anhören", read: "Biografie lesen", path: "Der Weg zum Rezitator", radio: "Koran-Radio" },
  en: { kicker: "The voices of the Quran", title: "50 great reciters – their story, their sound, their legacy", lead: "From the masters of Cairo whose recordings have travelled the world for generations, to the imams of the holy mosques of Makkah and Madinah and the voices of the Emirates. Get to know them – and learn from them: whoever listens attentively to a great reciter learns pronunciation, rhythm and reverence.", listen: "Listen in the player", read: "Read the biography", path: "The path to becoming a reciter", radio: "Quran radio" },
  ar: { kicker: "أصوات القرآن", title: "50 قارئًا من كبار القرّاء – قصصهم وأصواتهم وإرثهم", lead: "من أساتذة القاهرة الذين طافت تسجيلاتهم العالم جيلًا بعد جيل، إلى أئمة الحرمين الشريفين في مكة المكرمة والمدينة المنورة وأصوات الإمارات. تعرّف إليهم – وتعلّم منهم: فمن أصغى بانتباه إلى قارئ كبير تعلّم النطق والإيقاع والخشوع.", listen: "استمع في المشغّل", read: "اقرأ السيرة", path: "الطريق إلى أن تصبح قارئًا", radio: "إذاعة القرآن" },
  tr: { kicker: "Kur'an'ın sesleri", title: "50 büyük kâri – hikâyeleri, sesleri, mirasları", lead: "Kayıtları nesillerdir dünyayı dolaşan Kahire ustalarından Mekke ve Medine'nin kutsal camilerinin imamlarına ve Emirlikler'in seslerine kadar. Onları tanıyın ve onlardan öğrenin: büyük bir kâriyi dikkatle dinleyen kişi telaffuzu, ritmi ve huşuyu öğrenir.", listen: "Oynatıcıda dinleyin", read: "Biyografiyi okuyun", path: "Kâri olma yolu", radio: "Kur'an radyosu" },
  ur: { kicker: "قرآن کی آوازیں", title: "50 عظیم قرّاء – ان کی کہانی، ان کی آواز، ان کی میراث", lead: "قاہرہ کے ان اساتذہ سے جن کی ریکارڈنگز نسل در نسل دنیا بھر میں پہنچی ہیں، مکہ مکرمہ اور مدینہ منورہ کی مقدس مساجد کے ائمہ اور امارات کی آوازوں تک۔ ان سے متعارف ہوں اور ان سے سیکھیں: جو کسی بڑے قاری کو توجہ سے سنتا ہے وہ تلفظ، لَے اور خشوع سیکھتا ہے۔", listen: "پلیئر میں سنیں", read: "سوانح پڑھیں", path: "قاری بننے کا راستہ", radio: "قرآن ریڈیو" },
  fa: { kicker: "صدای قرآن", title: "50 قاری بزرگ – داستان، صدا و میراثشان", lead: "از استادان قاهره که ضبط‌هایشان نسل‌هاست در جهان می‌گردد تا امامان مسجدالحرام و مسجدالنبی و صداهای امارات. با آنان آشنا شوید و از آنان بیاموزید: هر که با دقت به قاریِ بزرگی گوش دهد، تلفظ، آهنگ و خشوع را می‌آموزد.", listen: "شنیدن در پخش‌کننده", read: "خواندن زندگی‌نامه", path: "راه قاری شدن", radio: "رادیو قرآن" },
  ps: { kicker: "د قرآن غږونه", title: "50 لوی قاریان – کیسه، غږ او میراث یې", lead: "د قاهرې له استادانو، چې ثبتونه یې نسل په نسل نړۍ ته رسېدلي، د مکې او مدینې د سپېڅلو جوماتونو امامانو او د اماراتو غږونو پورې. دوی وپېژنئ او له دوی زده کړئ: څوک چې لوی قاري ته په پام غوږ نیسي، تلفظ، ریتم او خشوع زده کوي.", listen: "په پلیر کې واورئ", read: "ژوندلیک ولولئ", path: "د قاري کېدو لار", radio: "د قرآن راډیو" },
  fr: { kicker: "Les voix du Coran", title: "50 grands récitateurs – leur histoire, leur voix, leur héritage", lead: "Des maîtres du Caire, dont les enregistrements parcourent le monde depuis des générations, aux imams des mosquées sacrées de La Mecque et de Médine et aux voix des Émirats. Faites leur connaissance – et apprenez d'eux : celui qui écoute avec attention un grand récitateur apprend la prononciation, le rythme et le recueillement.", listen: "Écouter dans le lecteur", read: "Lire la biographie", path: "Le chemin pour devenir récitateur", radio: "Radio Coran" },
  es: { kicker: "Las voces del Corán", title: "50 grandes recitadores: su historia, su sonido, su legado", lead: "Desde los maestros de El Cairo, cuyas grabaciones recorren el mundo desde hace generaciones, hasta los imanes de las mezquitas sagradas de La Meca y Medina y las voces de los Emiratos. Conózcalos y aprenda de ellos: quien escucha con atención a un gran recitador aprende pronunciación, ritmo y reverencia.", listen: "Escuchar en el reproductor", read: "Leer la biografía", path: "El camino para ser recitador", radio: "Radio Corán" },
  id: { kicker: "Suara-suara Al-Qur'an", title: "50 qari besar – kisah, suara, dan warisan mereka", lead: "Dari para guru besar Kairo yang rekamannya telah menjelajahi dunia selama beberapa generasi, hingga para imam masjid suci di Makkah dan Madinah serta suara-suara dari Emirat. Kenali mereka – dan belajarlah dari mereka: siapa yang menyimak seorang qari besar dengan saksama akan belajar pelafalan, irama, dan kekhusyukan.", listen: "Dengarkan di pemutar", read: "Baca biografi", path: "Jalan menjadi seorang qari", radio: "Radio Al-Qur'an" },
  ms: { kicker: "Suara-suara Quran", title: "50 qari terkemuka – kisah, suara dan warisan mereka", lead: "Daripada para guru besar Kaherah yang rakamannya telah menjelajah dunia selama beberapa generasi, hingga para imam masjid suci di Makkah dan Madinah serta suara-suara dari Emirat. Kenali mereka – dan belajarlah daripada mereka: sesiapa yang mendengar seorang qari terkemuka dengan teliti akan mempelajari sebutan, irama dan kekhusyukan.", listen: "Dengar dalam pemain", read: "Baca biografi", path: "Jalan menjadi seorang qari", radio: "Radio Quran" },
  bn: { kicker: "কুরআনের কণ্ঠস্বর", title: "50 জন মহান ক্বারী – তাঁদের জীবনকথা, তাঁদের সুর, তাঁদের উত্তরাধিকার", lead: "কায়রোর সেই ওস্তাদদের থেকে, যাঁদের রেকর্ডিং প্রজন্মের পর প্রজন্ম ধরে বিশ্বজুড়ে ছড়িয়েছে, মক্কা ও মদিনার পবিত্র মসজিদের ইমামগণ এবং আমিরাতের কণ্ঠস্বর পর্যন্ত। তাঁদের চিনুন এবং তাঁদের কাছ থেকে শিখুন: যিনি মনোযোগ দিয়ে একজন মহান ক্বারীর তিলাওয়াত শোনেন, তিনি উচ্চারণ, ছন্দ ও বিনয় শেখেন।", listen: "প্লেয়ারে শুনুন", read: "জীবনী পড়ুন", path: "ক্বারী হওয়ার পথ", radio: "কুরআন রেডিও" },
  ru: { kicker: "Голоса Корана", title: "50 великих чтецов – их история, их голос, их наследие", lead: "От мастеров Каира, чьи записи путешествуют по миру уже не одно поколение, до имамов священных мечетей Мекки и Медины и голосов Эмиратов. Познакомьтесь с ними – и учитесь у них: кто внимательно слушает великого чтеца, перенимает произношение, ритм и благоговение.", listen: "Слушать в плеере", read: "Читать биографию", path: "Путь к тому, чтобы стать чтецом", radio: "Радио Корана" },
  zh: { kicker: "古兰经的声音", title: "50 位伟大的诵读家——他们的故事、声音与遗产", lead: "从录音流传世界几代人的开罗大师，到麦加与麦地那两大圣寺的伊玛目，再到阿联酋的声音。认识他们，并向他们学习：认真聆听一位伟大诵读家，就能学到发音、节奏与敬畏之心。", listen: "在播放器中收听", read: "阅读生平", path: "成为诵读者之路", radio: "古兰经电台" },
};
const content = (l: string) => C[(l in C ? l : "en") as AppLocale];

// Style labels: German, English and Arabic come from STYLE (lib/reciters); the technical terms stay as they are in Latin script
type StyleKey = "murattal" | "mujawwad" | "imam" | "teacher";
const STYLE_OTHER: Partial<Record<AppLocale, Record<StyleKey, string>>> = {
  tr: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "İmam", teacher: "Öğretmen" },
  ur: { murattal: STYLE.murattal.ar, mujawwad: STYLE.mujawwad.ar, imam: "امام", teacher: "استاد" },
  fa: { murattal: STYLE.murattal.ar, mujawwad: STYLE.mujawwad.ar, imam: "امام", teacher: "استاد" },
  ps: { murattal: STYLE.murattal.ar, mujawwad: STYLE.mujawwad.ar, imam: "امام", teacher: "ښوونکی" },
  fr: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "Imam", teacher: "Enseignant" },
  es: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "Imán", teacher: "Maestro" },
  id: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "Imam", teacher: "Guru" },
  ms: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "Imam", teacher: "Guru" },
  bn: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "ইমাম", teacher: "শিক্ষক" },
  ru: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "Имам", teacher: "Учитель" },
  zh: { murattal: "Murattal", mujawwad: "Mujawwad", imam: "伊玛目", teacher: "教师" },
};
const styleName = (s: StyleKey, locale: string) => STYLE_OTHER[locale as AppLocale]?.[s] ?? STYLE[s][locale === "de" ? "de" : locale === "ar" ? "ar" : "en"];

// Country names (the data holds English names): German and Arabic from the tables of lib/reciters, every other language from Intl.DisplayNames
const REGION: Record<string, string> = { Egypt: "EG", "Saudi Arabia": "SA", Kuwait: "KW", "United Arab Emirates": "AE", Yemen: "YE", Sudan: "SD", Somalia: "SO", Iraq: "IQ", Libya: "LY", Morocco: "MA", Qatar: "QA", Bahrain: "BH", Oman: "OM", Jordan: "JO", Syria: "SY", Pakistan: "PK", Indonesia: "ID", Algeria: "DZ", Tunisia: "TN", Palestine: "PS", Lebanon: "LB", Turkey: "TR", Malaysia: "MY", India: "IN", Bangladesh: "BD", Iran: "IR", Afghanistan: "AF", Nigeria: "NG" };
const displayNames = new Map<string, Intl.DisplayNames | null>();
function countryName(country: string, locale: string) {
  if (locale === "en") return country;
  if (locale === "de") return COUNTRIES_DE[country] ?? country;
  if (locale === "ar") return COUNTRIES_AR[country] ?? country;
  const code = REGION[country];
  if (!code) return country;
  if (!displayNames.has(locale)) {
    try { displayNames.set(locale, new Intl.DisplayNames(locale, { type: "region" })); } catch { displayNames.set(locale, null); }
  }
  try { return displayNames.get(locale)?.of(code) ?? country; } catch { return country; }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/reciters", `${c.kicker} | Quran Masterclass`, c.lead.slice(0, 158));
}

export default async function RecitersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  const ld = { "@context": "https://schema.org", "@type": "ItemList", name: c.title, itemListElement: RECITER_BIOS.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/${locale}/reciters/${r.slug}`), name: r.name })) };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <CalligraphyDraw text={"القرّاء"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{c.kicker}</p>
          <h1 className="font-display mt-4 max-w-4xl text-[40px] leading-[1.05] sm:text-6xl">{c.title}</h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/70">{c.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/islam/reciter-path" className="btn-gold inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{c.path}</Link>
            <Link href="/radio" className="inline-flex h-12 items-center rounded-md border border-white/30 px-6 text-[15px] font-bold hover:border-white">{c.radio}</Link>
          </div>
        </div>
        <span aria-hidden className="q-arcade opacity-70" />
      </section>
      <section className="q-page">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-5">
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECITER_BIOS.map((r, i) => {
            const t = bioText(r, locale);
            const initials = locale === "ar" ? r.arabic.split(/\s+/).filter((w) => !["أبو", "عبد", "ابن"].includes(w)).slice(0, 2).map((w) => w[0]).join("") : r.name.split(/[\s-]+/).filter((w) => /^[A-Z]/.test(w) && !["Al", "Ash", "As", "Ar", "Ad", "At", "Az", "An", "Abu"].includes(w)).slice(0, 2).map((w) => w[0]).join("");
            return (
              <li key={r.slug} className="min-w-0">
                <Link href={`/reciters/${r.slug}`} className="q-tile flex h-full flex-col p-5">
                  <svg aria-hidden viewBox="0 0 110 120" className="q-rec-arch"><g fill="none" stroke="currentColor" strokeWidth="1"><path d="M8 120V52C8 26 32 10 55 3c23 7 47 23 47 49v68" /><path d="M18 120V54c0-20 19-33 37-39 18 6 37 19 37 39v66" /><path d="M55 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" /></g></svg>
                  <div className="flex items-center gap-4">
                    <QuranSeal>{initials}</QuranSeal>
                    <span className="min-w-0">
                      <span className="block text-[11.5px] font-semibold tabular-nums text-[rgb(var(--q-ink-gold))]">{String(i + 1).padStart(2, "0")} · {countryName(r.country, locale)}{r.born || r.died ? ` · ${r.born ?? "?"}${r.died ? `–${r.died}` : ""}` : ""}</span>
                      {locale === "ar" ? <span className="font-callig block truncate text-[22px] leading-[1.5]" dir="rtl">{r.arabic}</span> : <><span className="mt-0.5 block truncate text-[17px] font-bold leading-snug">{r.name}</span>
                      <span className="font-callig block truncate text-[19px] leading-[1.6] text-[rgb(var(--q-ink-gold))]" dir="rtl" lang="ar">{r.arabic}</span></>}
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{t.short}</p>
                  <p className="mt-4 flex flex-wrap gap-1.5">{r.styles.map((s) => <span key={s} className="q-pill">{styleName(s, locale)}</span>)}{r.playerSlug && <span className="q-pill is-play"><svg aria-hidden viewBox="0 0 24 24" className="h-3 w-3"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>{c.listen}</span>}</p>
                </Link>
              </li>
            );
          })}
        </ol>
        <DonateCTA variant="slim" className="mt-12" />
        </div>
      </section>
      <MoreTiles keys={["radio", "shams", "tajweed", "courses"]} />
    </div>
  );
}
