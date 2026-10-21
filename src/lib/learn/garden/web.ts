// The garden on the website (mirrors the parts of mobile/src/features/garden/GardenScreen.tsx and widgets.tsx the web
// shows): who counts as Pro for the garden, keeping the cached garden fresh after the account sync, and the few texts
// only the website needs (how the tree grows, what happens in the app). English, German (Sie-form) and Arabic; every
// other language falls back to English. The growth rules themselves live unchanged in garden.ts.
import { useAuth } from "@/lib/learn/auth";
import { useLang } from "@/lib/learn/i18n";
import { reloadGarden } from "./garden";
import { reloadCatalog } from "./catalog";

/** Pro for the garden: the website is free, but the garden shows only what the app would show. Planting is always the
 *  free path (one tree, no Pro-only tree types); stages above the free limit only for a signed-in Premium account. */
export function useGardenPro(): boolean {
  const { user } = useAuth();
  return user?.plan === "premium";
}

// garden.ts and catalog.ts cache the parsed store; the account sync and other tabs write it behind their back, so the
// caches are dropped first (module level, before the store's own listeners re-render the screens).
if (typeof window !== "undefined") {
  const drop = () => { reloadGarden(); reloadCatalog(); };
  window.addEventListener("tf-synced", drop);
  window.addEventListener("storage", (e) => { if (!e.key || e.key.startsWith("qmc.garden") || e.key === "qmc.stickers2") drop(); });
}

const en = {
  howT: "How your tree grows",
  how1: "The Shams Method weighs most: every verse you learn with it makes the tree grow, a finished session and a whole surah even more, and Shams days in a row add a bonus.",
  how2: "Lessons, listening, the daily quests and stickers in the app add smaller amounts, each with its own daily limit.",
  how3: "A stage needs two things: enough growth points and a minimum age of the tree. Even the most diligent learner sees the ancient tree only after a year. A stage once reached is never taken away.",
  how4: "If you pause for three days, the tree rests. It recovers as soon as you learn again and never withers.",
  howNote: "The tree is only a picture to remind you of your intention and your effort. What counts is the sincerity of your heart.",
  webT: "On the website and in the app",
  webB: "Here you can see your tree and plant it. Watering, harvesting fruits, giving stickers and the daily sticker pack happen in the Quran Masterclass app. When you are signed in, your garden is kept in your account and is the same in the app.",
  signIn: "Sign in to keep your garden in your account.",
  heldWeb: "Healthy young tree (stage 6). It stays healthy here, and its growth keeps counting.",
  harvestApp: "Fruits are harvested in the app.",
  decoT: "Decorations", decoNone: "No decorations yet. Rare stickers and complete sticker series add them in the app.",
  unlockT: "The landscape grows with your tree", fromStage: "from stage {n}",
  un_flowers: "Myrtle hedge with blossoms", un_lanterns: "Lanterns on the terrace", un_arcade: "The arcade", un_fountains: "Fountains in the water channel", un_iwan: "The pavilion", un_archLights: "Larger lanterns", un_aura: "Light over the pavilion",
  plantIntro: "Your tree has not been planted yet.",
  needT: "Stage {n} needs {gp} growth points and a tree at least {d} days old.",
  sceneLabel: "Your garden: {name}, {type}, {stage}",
  collectionOpen: "View the collection", back: "Back to the garden",
  collectionNote: "The collection is shown read-only on the website. Stickers are earned and given to the tree in the app.",
  showMore: "Show more", noMatch: "No stickers match.",
};
type WebT = typeof en;
const de: WebT = {
  howT: "So wächst Ihr Baum",
  how1: "Die Shams-Methode zählt am meisten: Jeder Vers, den Sie damit lernen, lässt den Baum wachsen, eine abgeschlossene Sitzung und eine ganze Sure noch mehr, und Shams-Tage in Folge bringen einen Bonus.",
  how2: "Lektionen, Zuhören, die täglichen Aufgaben und Sticker in der App tragen kleinere Mengen bei, jeweils mit eigener Tagesgrenze.",
  how3: "Eine Stufe braucht zweierlei: genug Wachstumspunkte und ein Mindestalter des Baums. Auch wer sehr fleißig lernt, sieht den uralten Baum erst nach einem Jahr. Eine erreichte Stufe wird nie wieder genommen.",
  how4: "Wenn Sie drei Tage pausieren, ruht der Baum. Er erholt sich, sobald Sie wieder lernen, und verwelkt nie.",
  howNote: "Der Baum ist nur ein Bild, das Sie an Ihre Absicht und Ihre Mühe erinnert. Was zählt, ist die Aufrichtigkeit Ihres Herzens.",
  webT: "Auf der Website und in der App",
  webB: "Hier sehen Sie Ihren Baum und können ihn pflanzen. Gießen, Früchte ernten, Sticker schenken und das tägliche Stickerpaket gibt es in der Quran-Masterclass-App. Wenn Sie angemeldet sind, wird Ihr Garten in Ihrem Konto gespeichert und ist in der App derselbe.",
  signIn: "Melden Sie sich an, damit Ihr Garten in Ihrem Konto gespeichert wird.",
  heldWeb: "Gesunder junger Baum (Stufe 6). Er bleibt hier gesund, und sein Wachstum zählt weiter.",
  harvestApp: "Früchte ernten Sie in der App.",
  decoT: "Schmuck", decoNone: "Noch kein Schmuck. Seltene Sticker und vollständige Sticker-Serien schmücken Ihren Garten in der App.",
  unlockT: "Die Landschaft wächst mit Ihrem Baum", fromStage: "ab Stufe {n}",
  un_flowers: "Myrtenhecke mit Blüten", un_lanterns: "Laternen auf der Terrasse", un_arcade: "Die Arkade", un_fountains: "Brunnen im Wasserlauf", un_iwan: "Der Pavillon", un_archLights: "Größere Laternen", un_aura: "Licht über dem Pavillon",
  plantIntro: "Ihr Baum ist noch nicht gepflanzt.",
  needT: "Stufe {n} braucht {gp} Wachstumspunkte und einen Baum, der mindestens {d} Tage alt ist.",
  sceneLabel: "Ihr Garten: {name}, {type}, {stage}",
  collectionOpen: "Sammlung ansehen", back: "Zurück zum Garten",
  collectionNote: "Die Sammlung wird auf der Website nur angezeigt. Sticker verdienen und dem Baum schenken Sie in der App.",
  showMore: "Mehr anzeigen", noMatch: "Keine passenden Sticker.",
};
const ar: WebT = {
  howT: "كيف تنمو شجرتك",
  how1: "منهج شمس له الوزن الأكبر: كل آية تتعلمها به تُنمي الشجرة، والجلسة المكتملة والسورة الكاملة أكثر، وأيام شمس المتتالية تمنح مكافأة.",
  how2: "الدروس والاستماع والمهام اليومية والملصقات في التطبيق تضيف مقادير أصغر، لكلٍّ منها حدّ يومي.",
  how3: "تحتاج كل مرحلة إلى أمرين: نقاط نمو كافية وعمر أدنى للشجرة. حتى أكثر المتعلمين اجتهادًا لا يرى الشجرة العتيقة إلا بعد عام. والمرحلة التي بلغتها لا تُنزع أبدًا.",
  how4: "إذا توقفت ثلاثة أيام تستريح الشجرة، وتتعافى حين تعود إلى التعلم، ولا تذبل أبدًا.",
  howNote: "الشجرة صورة تذكّرك بنيتك وجهدك فقط، والعبرة بصدق القلب.",
  webT: "على الموقع وفي التطبيق",
  webB: "هنا ترى شجرتك ويمكنك زرعها. السقي وقطف الثمار وإهداء الملصقات والحزمة اليومية في تطبيق Quran Masterclass. إذا سجّلت الدخول تُحفظ حديقتك في حسابك وتبقى نفسها في التطبيق.",
  signIn: "سجّل الدخول لتُحفظ حديقتك في حسابك.",
  heldWeb: "شجرة فتية سليمة (المرحلة 6). تبقى سليمة هنا ويستمر احتساب نموها.",
  harvestApp: "تُقطف الثمار في التطبيق.",
  decoT: "الزينة", decoNone: "لا زينة بعد. الملصقات النادرة والسلاسل المكتملة تزيّن حديقتك في التطبيق.",
  unlockT: "المنظر ينمو مع شجرتك", fromStage: "من المرحلة {n}",
  un_flowers: "سياج آس مزهر", un_lanterns: "فوانيس على الشرفة", un_arcade: "الرواق", un_fountains: "نوافير في مجرى الماء", un_iwan: "الجوسق", un_archLights: "فوانيس أكبر", un_aura: "نور فوق الجوسق",
  plantIntro: "لم تُزرع شجرتك بعد.",
  needT: "تحتاج المرحلة {n} إلى {gp} نقطة نمو وشجرة عمرها {d} يومًا على الأقل.",
  sceneLabel: "حديقتك: {name}، {type}، {stage}",
  collectionOpen: "عرض المجموعة", back: "العودة إلى الحديقة",
  collectionNote: "تُعرض المجموعة على الموقع للاطلاع فقط. تُكسب الملصقات وتُهدى للشجرة في التطبيق.",
  showMore: "عرض المزيد", noMatch: "لا ملصقات مطابقة.",
};
const T: Record<string, WebT> = { en, de, ar };
export function useGardenWebText(): WebT { const { lang } = useLang(); return T[lang] ?? en; }
