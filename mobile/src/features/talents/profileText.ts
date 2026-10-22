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
    visTitle: "Sichtbarkeit Ihres Profils", visPublic: "Öffentliches Konto", visPublicD: "Alle in der Gemeinschaft können Ihr Profil sehen und Ihnen ohne Anfrage folgen.",
    // own profile in the Account tab (TikTok layout), follow requests, followers, search (21.10.2026)
    menuLabel: "Einstellungen und mehr", profileMenu: "Profilmenü", shareQr: "Profil teilen und QR-Code", discoverPeople: "Personen entdecken",
    suggestedAccounts: "Vorgeschlagene Konten", moreOptions: "Weitere Optionen", requestsRow: "Follower-Anfragen", requestsHint: "Bestätigen oder löschen",
    confirm: "Bestätigen", delete: "Löschen", remove: "Entfernen", removeTitle: "Follower entfernen?",
    removeBody: "@{u} wird nicht benachrichtigt, dass Sie die Person aus Ihren Followern entfernt haben.",
    createProfile: "Profil erstellen", localNote: "Ihre Erfolge auf diesem Gerät. Mit einem Profil sehen andere sie und können sie mit MashaAllah würdigen.",
    offlineNote: "Offline: Sie sehen den zuletzt geladenen Stand.", seeAll: "Alle ansehen",
    searchPh: "Suchen", searchLabel: "Konten und Inhalte suchen", tabAccounts: "Konten", tabTop: "Top", recent: "Zuletzt gesucht", clearRecent: "Alle löschen",
    removeRecent: "Aus dem Verlauf entfernen", noResults: "Keine Ergebnisse für „{q}“", learnSection: "Lerninhalte", followersN: "{n} Follower",
    searchQuran: "Im Koran nach „{q}“ suchen", searchSignIn: "Melden Sie sich an, um Konten zu suchen.", followsYou: "Folgt Ihnen", unfollow: "Nicht mehr folgen", exploreFor: "Beiträge zu „{q}“ in Entdecken",
    // profile extras, travel mode, detail pass (21.10.2026)
    followToSee: "Folgen Sie diesem Konto, um seine Erfolge zu sehen.", shareImage: "Als Bild teilen", previewTitle: "Vorschau",
    goalsTitle: "Lernziele", goalsHint: "Wählen Sie, woran Sie gerade arbeiten. Sie erscheinen als Chips im Profil.",
    cityTitle: "Stadt oder Region", cityHint: "Nur grob, nie Ihr genauer Standort.", cityUseLocation: "Ort der Gebetszeiten übernehmen",
    cityLocating: "Ort wird ermittelt …", cityNotFound: "Der Ort konnte nicht ermittelt werden.",
    travelTitle: "Reisemodus", travelHint: "Zeigt „Auf Reisen“ im Profil. Die Gebetszeiten nutzen das Reiseziel, dazu Reise-Duas und ein Hinweis zum Gebet auf Reisen.",
    travelling: "Auf Reisen", travellingTo: "Auf Reisen · {c}", destination: "Reiseziel (Stadt)",
    destinationSet: "Die Gebetszeiten gelten jetzt für {c}.", destinationNotFound: "Das Reiseziel wurde nicht gefunden. Die Gebetszeiten bleiben unverändert.",
    visibleTo: "Sichtbar für", vis_everyone: "Alle", vis_followers: "Follower", vis_me: "Nur ich",
    travelDuas: "Reise-Duas", umrahGuide: "Umrah und Hajj",
    qasrTitle: "Gebet auf Reisen",
    qasrShia: "Nach der Dschaʿfari-Schule ist das Verkürzen der Gebete mit vier Rakʿa (Dhuhr, Asr, Isha) auf zwei Pflicht, wenn die Reise mindestens acht Farsach beträgt (nach al-Sistani etwa 44 km, Hin- und Rückweg zusammen). Dhuhr mit Asr und Maghrib mit Isha dürfen immer zusammengelegt werden. In Mekka, Medina, Kufa und am Schrein von Imam al-Husain darf man wählen.", ziyaratGuide: "Heilige Stätten und Ziyara",
    qasrGeneral: "Auf Reisen dürfen nach den vier Rechtsschulen die Gebete mit vier Rak'a (Dhuhr, Asr, Isha) auf zwei Rak'a verkürzt werden (Qasr). Die schafiitische, malikitische und hanbalitische Schule erlauben außerdem, Dhuhr mit Asr und Maghrib mit Isha zusammenzulegen (Jam').",
    qasrHanafi: "Nach der hanafitischen Schule werden auf Reisen die Gebete mit vier Rak'a (Dhuhr, Asr, Isha) auf zwei Rak'a verkürzt (Qasr). Das Zusammenlegen von Gebeten (Jam') gilt in dieser Schule nur in Arafa und Muzdalifa während des Hajj.",
    qasrNote: "Ab welcher Entfernung und wie lange das gilt, sehen die Rechtsschulen unterschiedlich. Bei Fragen wenden Sie sich an Gelehrte Ihres Vertrauens.",
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
    visTitle: "Profile visibility", visPublic: "Public account", visPublicD: "Everyone in the community can see your profile and follow you without a request.",
    menuLabel: "Settings and more", profileMenu: "Profile menu", shareQr: "Share profile and QR code", discoverPeople: "Discover people",
    suggestedAccounts: "Suggested accounts", moreOptions: "More options", requestsRow: "Follow requests", requestsHint: "Confirm or delete",
    confirm: "Confirm", delete: "Delete", remove: "Remove", removeTitle: "Remove follower?",
    removeBody: "@{u} won't be notified that you removed them from your followers.",
    createProfile: "Create your profile", localNote: "Your achievements on this device. With a profile, others can see them and honour them with MashaAllah.",
    offlineNote: "Offline: you are seeing the last loaded version.", seeAll: "See all",
    searchPh: "Search", searchLabel: "Search accounts and content", tabAccounts: "Accounts", tabTop: "Top", recent: "Recent", clearRecent: "Clear all",
    removeRecent: "Remove from recent searches", noResults: "No results for “{q}”", learnSection: "Learning", followersN: "{n} followers",
    searchQuran: "Search the Quran for “{q}”", searchSignIn: "Sign in to search accounts.", followsYou: "Follows you", unfollow: "Unfollow", exploreFor: "Posts about “{q}” in Explore",
    followToSee: "Follow this account to see its achievements.", shareImage: "Share as image", previewTitle: "Preview",
    goalsTitle: "Learning goals", goalsHint: "Choose what you are working on. They appear as chips on your profile.",
    cityTitle: "City or region", cityHint: "Coarse only, never your exact location.", cityUseLocation: "Use my prayer-time place",
    cityLocating: "Finding the place …", cityNotFound: "The place could not be found.",
    travelTitle: "Travel mode", travelHint: "Shows “Travelling” on your profile. Prayer times use the destination, with travel duas and a note on praying while travelling.",
    travelling: "Travelling", travellingTo: "Travelling · {c}", destination: "Destination (city)",
    destinationSet: "Prayer times now apply to {c}.", destinationNotFound: "The destination was not found. Prayer times stay as they are.",
    visibleTo: "Visible to", vis_everyone: "Everyone", vis_followers: "Followers", vis_me: "Only me",
    travelDuas: "Travel duas", umrahGuide: "Umrah and Hajj",
    qasrTitle: "Praying while travelling",
    qasrShia: "In the Jaʿfari school shortening the four-rakʿah prayers (dhuhr, asr, isha) to two is obligatory when the journey is at least eight farsakh (about 44 km according to al-Sistani, outward and return together). Dhuhr with asr and maghrib with isha may always be combined. In Makkah, Madinah, Kufa and at the shrine of Imam al-Husayn one may choose.", ziyaratGuide: "Holy sites and ziyarah",
    qasrGeneral: "According to the four schools of law, the prayers of four rak'as (Dhuhr, Asr, Isha) may be shortened to two rak'as while travelling (qasr). The Shafi'i, Maliki and Hanbali schools also allow joining Dhuhr with Asr and Maghrib with Isha (jam').",
    qasrHanafi: "According to the Hanafi school, the prayers of four rak'as (Dhuhr, Asr, Isha) are shortened to two rak'as while travelling (qasr). In this school, joining prayers (jam') applies only at Arafa and Muzdalifa during Hajj.",
    qasrNote: "From what distance and for how long this applies differs between the schools. If you have questions, please ask scholars you trust.",
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
