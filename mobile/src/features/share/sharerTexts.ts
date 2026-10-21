import { pick, useLang } from "@/i18n";

// Texts of the sharer ("Verbreiter") status. Polite address in every language.
export type SharerText = { badge: string; level: string; toNext: string; tierUp: string; tierUpLead: string; topWeek: string; topLead: string; sharedWeek: string };

const T: { en: SharerText } & Record<string, SharerText> = {
  en: { badge: "Sharer", level: "Level {n}", toNext: "{n} more shares to level {l}", tierUp: "New sharer level: {n}", tierUpLead: "Thank you for passing on knowledge.", topWeek: "Top sharers this week", topLead: "Members who shared the most since Monday.", sharedWeek: "{n} shared" },
  de: { badge: "Verbreiter", level: "Stufe {n}", toNext: "Noch {n} Mal teilen bis Stufe {l}", tierUp: "Neue Verbreiter-Stufe: {n}", tierUpLead: "Danke, dass Sie Wissen weitergeben.", topWeek: "Top-Verbreiter dieser Woche", topLead: "Mitglieder, die seit Montag am meisten geteilt haben.", sharedWeek: "{n} geteilt" },
  ar: { badge: "ناشر الخير", level: "المستوى {n}", toNext: "{n} مشاركات أخرى للمستوى {l}", tierUp: "مستوى نشر جديد: {n}", tierUpLead: "شكرًا لكم على نشر العلم.", topWeek: "أكثر الناشرين هذا الأسبوع", topLead: "الأعضاء الأكثر مشاركة منذ يوم الاثنين.", sharedWeek: "{n} مشاركة" },
  tr: { badge: "Yayıcı", level: "Seviye {n}", toNext: "Seviye {l} için {n} paylaşım daha", tierUp: "Yeni yayıcı seviyesi: {n}", tierUpLead: "Bilgiyi paylaştığınız için teşekkür ederiz.", topWeek: "Bu haftanın en çok paylaşanları", topLead: "Pazartesiden beri en çok paylaşan üyeler.", sharedWeek: "{n} paylaşım" },
  ur: { badge: "پھیلانے والے", level: "درجہ {n}", toNext: "درجہ {l} تک مزید {n} شیئر", tierUp: "نیا درجہ: {n}", tierUpLead: "علم آگے پہنچانے کا شکریہ۔", topWeek: "اس ہفتے سب سے زیادہ شیئر کرنے والے", topLead: "پیر سے اب تک سب سے زیادہ شیئر کرنے والے اراکین۔", sharedWeek: "{n} شیئر" },
  fr: { badge: "Passeur", level: "Niveau {n}", toNext: "Encore {n} partages jusqu'au niveau {l}", tierUp: "Nouveau niveau de passeur : {n}", tierUpLead: "Merci de transmettre le savoir.", topWeek: "Meilleurs passeurs de la semaine", topLead: "Les membres qui ont le plus partagé depuis lundi.", sharedWeek: "{n} partages" },
  es: { badge: "Difusor", level: "Nivel {n}", toNext: "{n} veces más para el nivel {l}", tierUp: "Nuevo nivel de difusor: {n}", tierUpLead: "Gracias por transmitir el conocimiento.", topWeek: "Mejores difusores de la semana", topLead: "Miembros que más han compartido desde el lunes.", sharedWeek: "{n} compartidos" },
  id: { badge: "Penyebar", level: "Level {n}", toNext: "{n} kali berbagi lagi ke level {l}", tierUp: "Level penyebar baru: {n}", tierUpLead: "Terima kasih telah menyebarkan ilmu.", topWeek: "Penyebar teratas minggu ini", topLead: "Anggota yang paling banyak berbagi sejak Senin.", sharedWeek: "{n} dibagikan" },
  ms: { badge: "Penyebar", level: "Tahap {n}", toNext: "{n} kali kongsi lagi ke tahap {l}", tierUp: "Tahap penyebar baharu: {n}", tierUpLead: "Terima kasih kerana menyebarkan ilmu.", topWeek: "Penyebar teratas minggu ini", topLead: "Ahli yang paling banyak berkongsi sejak Isnin.", sharedWeek: "{n} dikongsi" },
  ru: { badge: "Распространитель", level: "Уровень {n}", toNext: "Ещё {n} раз поделиться до уровня {l}", tierUp: "Новый уровень: {n}", tierUpLead: "Спасибо, что делитесь знанием.", topWeek: "Лучшие распространители недели", topLead: "Участники, которые больше всех делились с понедельника.", sharedWeek: "{n} раз поделились" },
  fa: { badge: "نشردهنده", level: "سطح {n}", toNext: "{n} اشتراک دیگر تا سطح {l}", tierUp: "سطح جدید نشردهنده: {n}", tierUpLead: "از اینکه دانش را منتشر می‌کنید سپاسگزاریم.", topWeek: "برترین نشردهندگان این هفته", topLead: "اعضایی که از دوشنبه بیشترین اشتراک را داشته‌اند.", sharedWeek: "{n} اشتراک" },
  bn: { badge: "প্রচারক", level: "স্তর {n}", toNext: "স্তর {l} পর্যন্ত আরও {n}টি শেয়ার", tierUp: "নতুন প্রচারক স্তর: {n}", tierUpLead: "জ্ঞান ছড়িয়ে দেওয়ার জন্য ধন্যবাদ।", topWeek: "এই সপ্তাহের শীর্ষ প্রচারক", topLead: "সোমবার থেকে সবচেয়ে বেশি শেয়ার করা সদস্যরা।", sharedWeek: "{n}টি শেয়ার" },
  ps: { badge: "خپرونکی", level: "کچه {n}", toNext: "تر کچې {l} پورې نور {n} شریکول", tierUp: "نوې کچه: {n}", tierUpLead: "مننه چې پوهه نورو ته رسوئ.", topWeek: "د دې اونۍ غوره خپرونکي", topLead: "هغه غړي چې له دوشنبې راهیسې یې تر ټولو ډېر شریک کړي.", sharedWeek: "{n} شریک شوي" },
  zh: { badge: "传播者", level: "等级 {n}", toNext: "再分享 {n} 次即达等级 {l}", tierUp: "新的传播者等级：{n}", tierUpLead: "感谢您传播知识。", topWeek: "本周最佳传播者", topLead: "自周一以来分享最多的成员。", sharedWeek: "已分享 {n} 次" },
};

export function useSharerText(): SharerText {
  const { lang } = useLang();
  return pick<SharerText>(T, lang);
}
