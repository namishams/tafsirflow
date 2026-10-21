import { useLang } from "@/i18n";
import { moduleText } from "@/i18n/app";

// Texts of the Instagram/TikTok-style talent profile (module "talentsProfile"): counters, achievement grid, the
// full-screen moment feed and the profile photo menu. German and English here, the other twelve languages in
// src/i18n/app/<lang>.json under "talentsProfile" (polite address everywhere). {n}, {m} are placeholders.
const S = {
  de: {
    statMashaAllah: "MashaAllah", tabAchievements: "Erfolge", tabBadges: "Abzeichen",
    photoTitle: "Profilfoto", changePhoto: "Foto ändern", photoHint: "Quadratisch zugeschnitten, ohne Standortdaten. Fotos sehen andere erst ab 16 Jahren, sonst erscheinen Ihre Initialen.",
    doubleTap: "Zweimal tippen für MashaAllah", sayMashaAllah: "MashaAllah sagen", takeBack: "MashaAllah zurücknehmen",
    close: "Schließen", share: "Teilen", noMoments: "Noch keine Erfolge.",
    noMomentsMine: "Ihre Erfolge erscheinen hier, sobald Sie die Bereiche in Ihrem Sijill zeigen.", showInSijill: "Im Sijill zeigen",
    momentOf: "Erfolg {n} von {m}", maCount: "{n} MashaAllah",
    kind_certificate: "Zertifikat", kind_exam: "Prüfung", kind_level: "Neues Level", kind_juz: "Juz auswendig", kind_tree: "Baumstufe",
    kind_sticker: "Sticker", kind_streak: "Serie", kind_course: "Kurs", kind_hifz: "Hifz-Stufe",
    legendary: "Legendär", ownHint: "Ihr eigener Erfolg. Andere können ihn mit MashaAllah würdigen.",
    usernameFree: "Verfügbar", usernameChecking: "Wird geprüft …", username_format: "3 bis 20 Zeichen: a-z, 0-9, Punkt, Unterstrich.",
    username_reserved: "Dieser Benutzername ist reserviert.", username_taken: "Dieser Benutzername ist schon vergeben.", username_inappropriate: "Bitte wählen Sie einen anderen Benutzernamen.",
    followBack: "Zurückfolgen", followedBy1: "Gefolgt von {a}", followedBy2: "Gefolgt von {a} und {b}", followedByMore: "Gefolgt von {a}, {b} und {n} weiteren",
    suggested: "Vorschläge für Sie", completeTitle: "Profil zu {n} % vollständig", completeNext: "Als Nächstes",
    complete_photo: "Profilfoto hinzufügen", complete_bio: "Kurzbeschreibung schreiben", complete_country: "Land angeben", complete_rewaya: "Rewaya angeben",
    complete_badge: "Smaragd-Häkchen erhalten", complete_sijill: "Erfolge im Sijill zeigen", complete_follow: "Ersten Talenten folgen",
    hl_certificate: "Zertifikate", hl_exam: "Prüfungen", hl_level: "Level", hl_juz: "Juz", hl_tree: "Garten", hl_sticker: "Sticker", hl_streak: "Serien", hl_course: "Kurse", hl_hifz: "Hifz",
    shareTitle: "Profil teilen", copyLink: "Link kopieren", copied: "Link kopiert", scanHint: "Scannen, um das Profil zu öffnen", qrCode: "QR-Code",
    setupTitle: "Ihr Profil", setupLead: "So erkennen Sie andere in der Gemeinschaft und können Ihre Erfolge mit MashaAllah würdigen. Alles lässt sich später unter Profil bearbeiten ändern.",
    displayName: "Anzeigename", usernameLabel: "Benutzername", usernameOffline: "Wird nach der Anmeldung geprüft und gespeichert.", photoOptional: "Profilfoto (freiwillig)",
    later: "Später", setupSaved: "Ihr Profil ist angelegt.", setupPending: "Ihr Profil wird angelegt, sobald Sie angemeldet sind.",
  },
  en: {
    statMashaAllah: "MashaAllah", tabAchievements: "Achievements", tabBadges: "Badges",
    photoTitle: "Profile photo", changePhoto: "Change photo", photoHint: "Cropped square, without location data. Others see photos only from age 16; otherwise your initials are shown.",
    doubleTap: "Double-tap to say MashaAllah", sayMashaAllah: "Say MashaAllah", takeBack: "Take back MashaAllah",
    close: "Close", share: "Share", noMoments: "No achievements yet.",
    noMomentsMine: "Your achievements appear here once you show the sections in your Sijill.", showInSijill: "Show in Sijill",
    momentOf: "Achievement {n} of {m}", maCount: "{n} MashaAllah",
    kind_certificate: "Certificate", kind_exam: "Exam", kind_level: "Level up", kind_juz: "Juz memorised", kind_tree: "Tree stage",
    kind_sticker: "Sticker", kind_streak: "Streak", kind_course: "Course", kind_hifz: "Hifz stage",
    legendary: "Legendary", ownHint: "Your own achievement. Others can honour it with MashaAllah.",
    usernameFree: "Available", usernameChecking: "Checking …", username_format: "3 to 20 characters: a-z, 0-9, dot, underscore.",
    username_reserved: "This username is reserved.", username_taken: "This username is already taken.", username_inappropriate: "Please choose a different username.",
    followBack: "Follow back", followedBy1: "Followed by {a}", followedBy2: "Followed by {a} and {b}", followedByMore: "Followed by {a}, {b} and {n} others",
    suggested: "Suggested for you", completeTitle: "Profile {n}% complete", completeNext: "Next",
    complete_photo: "Add a profile photo", complete_bio: "Write a short bio", complete_country: "Add your country", complete_rewaya: "Add your rewaya",
    complete_badge: "Earn the emerald check", complete_sijill: "Show achievements in your Sijill", complete_follow: "Follow your first talents",
    hl_certificate: "Certificates", hl_exam: "Exams", hl_level: "Levels", hl_juz: "Juz", hl_tree: "Garden", hl_sticker: "Stickers", hl_streak: "Streaks", hl_course: "Courses", hl_hifz: "Hifz",
    shareTitle: "Share profile", copyLink: "Copy link", copied: "Link copied", scanHint: "Scan to open the profile", qrCode: "QR code",
    setupTitle: "Your profile", setupLead: "This is how others recognise you in the community and can honour your achievements with MashaAllah. You can change everything later in Edit profile.",
    displayName: "Display name", usernameLabel: "Username", usernameOffline: "Checked and saved after you sign in.", photoOptional: "Profile photo (optional)",
    later: "Later", setupSaved: "Your profile has been created.", setupPending: "Your profile will be created as soon as you sign in.",
  },
};
export type PKey = keyof typeof S.en;
export function usePT() {
  const { lang } = useLang();
  return (key: PKey, vars?: Record<string, string | number>) => {
    let s = moduleText("talentsProfile", S, lang)[key] ?? S.en[key];
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  };
}
/** the English table, for the translation script */
export const PROFILE_EN = S.en;
