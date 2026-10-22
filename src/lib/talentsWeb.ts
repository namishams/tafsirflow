// Texts of the Quran Talents pages on the website (/talents/<username>, lists, /talents/me). German and English here,
// the other twelve locales in src/lib/talentsWeb/<locale>.json (polite address; missing keys fall back to English).
// Placeholders: {n}, {m}, {u}, {c}, {v}.
import ar from "./talentsWeb/ar.json";
import bn from "./talentsWeb/bn.json";
import es from "./talentsWeb/es.json";
import fa from "./talentsWeb/fa.json";
import fr from "./talentsWeb/fr.json";
import id from "./talentsWeb/id.json";
import ms from "./talentsWeb/ms.json";
import ps from "./talentsWeb/ps.json";
import ru from "./talentsWeb/ru.json";
import tr from "./talentsWeb/tr.json";
import ur from "./talentsWeb/ur.json";
import zh from "./talentsWeb/zh.json";

const en = {
  network: "Quran Masterclass Talents", posts: "Posts", followers: "Followers", following: "Following", likes: "Likes",
  follow: "Follow", followingBtn: "Following", requested: "Requested", message: "Message", connect: "Connect",
  signInToFollow: "Sign in to follow, like and comment.", signIn: "Sign in", openApp: "Open in the app", getApp: "Get the app",
  messageInApp: "Messages, connections and recording recitations are in the Quran Masterclass app.",
  rewaya: "Rewaya", maqam: "Maqam", officialChannel: "Official channel: {c}", private: "Private account", privateText: "Only followers see the recitations of this account.",
  tabPosts: "Recitations", tabAwards: "Achievements", highlights: "Highlights", noPosts: "No recitations yet.",
  listenSignIn: "Sign in to listen.", listen: "Listen", pause: "Pause", story: "Story",
  badgeWhat: "What the badges mean",
  badge_emerald: "Blue check", badge_emerald_text: "Confirmed, complete profile: e-mail confirmed, 16 or older, details complete, community guidelines accepted.",
  badge_gold: "Grey check · Masterclass Reciter", badge_gold_text: "Blue check plus a passed Reciter Path certificate from the set level on, with a checked exam.",
  badge_official: "Official star", badge_official_text: "Well-known reciters and public figures: a proven own channel with a large audience, or an invitation from Quran Masterclass.", badge_star: "Verified reciter", badge_star_text: "A well-known reciter who has taken over his official profile, checked through an official channel.", badge_personality: "Public figure", badge_personality_text: "A well-known public figure whose identity Quran Masterclass has checked.", badge_founder: "Gold check · Founder", badge_founder_text: "The developer and founder of Quran Masterclass. This badge exists only once.", founderLine: "Founder of the Shams Method and of Quran Masterclass", founderPlace: "Dubai, UAE",
  level_talent: "Talent", level_rising: "Rising", level_master: "Master", level_sheikh: "Sheikh",
  certificates: "Certificates", juzN: "Juz {n}", treeStage: "Garden tree, stage {n}", ijazahChain: "Ijazah chain", unverifiedChain: "Stated by the member, not checked by us.",
  noBadge: "No badge yet.", report: "Report", guidelines: "Community guidelines", reportInApp: "To report or block, use the menu on the profile in the app or write to us via Support.",
  notFound: "This profile does not exist or is not public.", metaDesc: "{u} on Quran Masterclass Talents: Quran recitations, rewaya, level and achievements.",
  listTitleFollowers: "Followers of @{u}", listTitleFollowing: "@{u} follows", empty: "Nobody here yet.", restricted: "This list is only visible to followers.", loadMore: "Load more",
  meTitle: "My talent profile", meLead: "Your profile, your badges and your notifications.", noProfile: "You do not have a talent profile yet. Create it here or in the app.",
  viewProfile: "View my profile", edit: "Edit profile", save: "Save", saved: "Saved.", username: "Username", usernameHint: "3 to 20 characters: a-z, 0-9, dot, underscore.",
  name: "Name", bio: "About me", country: "Country", chooseCountry: "Choose a country", privateAccount: "Private account (new followers need your approval)",
  whoMessages: "Who may write to you", msgConnections: "Connections", msgNobody: "Nobody", acceptGuidelines: "I accept the terms of use and the community guidelines.",
  ageTitle: "Your age", ageLead: "The community is for ages 13 and up; posting and messages from 16. Nobody sees your birth year.", birthYear: "Birth year",
  ageConfirm: "I confirm that this birth year is correct.", confirm: "Confirm", under13: "The community is available from age 13.",
  badgesTitle: "My badges", badgeHave: "Earned", badgeNotYet: "Not earned yet",
  reqEmail: "E-mail address confirmed", reqPhone: "Phone number confirmed by SMS", reqAge: "16 or older", reqProfile: "Profile complete: name, about me, country and rewaya",
  reqGuidelines: "Community guidelines accepted", reqEmerald: "Emerald check earned", reqLevel: "Reciter Path: certificate level {n} (so far level {m})",
  officialHow: "Connect your YouTube channel. If it has at least {n} subscribers and its name matches your profile, you get the star right away. We only read the channel name and subscriber count.",
  connectYoutube: "Connect YouTube channel", officialSoon: "Connecting YouTube will be available soon.",
  official_ok: "Your channel is confirmed. Your profile now carries the official star.", official_low: "The channel does not have enough subscribers for the official star yet.",
  official_name: "The channel name does not match your profile name.", official_none: "No YouTube channel was found for this Google account.",
  official_error: "The check did not work. Please try again later.", official_expired: "The link has expired. Please start again.", official_denied: "The connection was cancelled.",
  notifications: "Notifications", noNotifications: "No notifications yet.",
  n_follow: "{u} now follows you.", n_follow_request: "{u} would like to follow you.", n_like: "{u} likes your recitation {v}.", n_comment: "{u} commented on your recitation {v}.",
  n_post_approved: "Your recitation {v} was approved.", n_post_rejected: "Your recitation {v} was not approved.", n_connect_request: "{u} would like to connect with you.",
  n_connect_accepted: "{u} is now connected with you.", n_verified: "Your profile was confirmed.", n_verification_rejected: "Your request for confirmation was declined.",
  error: "That did not work.", e_text_not_allowed: "A text contains words, links or contact details that are not allowed.", e_username_taken: "This username is already taken.",
  e_username_format: "Username: 3 to 20 characters from a-z, 0-9, dot and underscore.", e_username_reserved: "This username is not available.", e_guidelines: "Please accept the community guidelines.",
  e_age: "The community is available from age 13.", e_verify: "Please confirm your e-mail address first.", e_birth_year: "Please enter a valid birth year.",
};
export type TwKey = keyof typeof en;

const de: Record<TwKey, string> = {
  network: "Quran Masterclass Talents", posts: "Beiträge", followers: "Follower", following: "Folgt", likes: "Gefällt mir",
  follow: "Folgen", followingBtn: "Folge ich", requested: "Angefragt", message: "Nachricht", connect: "Vernetzen",
  signInToFollow: "Melden Sie sich an, um zu folgen, zu liken und zu kommentieren.", signIn: "Anmelden", openApp: "In der App öffnen", getApp: "App laden",
  messageInApp: "Nachrichten, Verbindungen und das Aufnehmen von Rezitationen finden Sie in der App Quran Masterclass.",
  rewaya: "Rewaya", maqam: "Maqam", officialChannel: "Offizieller Kanal: {c}", private: "Privates Konto", privateText: "Die Rezitationen dieses Kontos sehen nur Follower.",
  tabPosts: "Rezitationen", tabAwards: "Erfolge", highlights: "Highlights", noPosts: "Noch keine Rezitationen.",
  listenSignIn: "Zum Anhören bitte anmelden.", listen: "Anhören", pause: "Pause", story: "Story",
  badgeWhat: "Was die Abzeichen bedeuten",
  badge_emerald: "Blauer Haken", badge_emerald_text: "Bestätigtes, vollständiges Profil: E-Mail bestätigt, mindestens 16 Jahre, Angaben vollständig, Community-Richtlinien akzeptiert.",
  badge_gold: "Grauer Haken · Masterclass Reciter", badge_gold_text: "Blauer Haken und ein bestandenes Zertifikat des Rezitationspfads ab der festgelegten Stufe, mit geprüfter Prüfung.",
  badge_official: "Offizieller Stern", badge_official_text: "Bekannte Rezitatorinnen, Rezitatoren und öffentliche Personen: nachgewiesener eigener Kanal mit großer Reichweite oder Einladung von Quran Masterclass.", badge_star: "Verifizierter Rezitator", badge_star_text: "Ein bekannter Rezitator, der sein offizielles Profil übernommen hat, geprüft über einen offiziellen Kanal.", badge_personality: "Persönlichkeit", badge_personality_text: "Eine bekannte Persönlichkeit, deren Identität Quran Masterclass geprüft hat.", badge_founder: "Goldener Haken · Gründer", badge_founder_text: "Der Entwickler und Gründer von Quran Masterclass. Dieses Abzeichen gibt es nur einmal.", founderLine: "Gründer der Shams-Methode und von Quran Masterclass", founderPlace: "Dubai, VAE",
  level_talent: "Talent", level_rising: "Aufstrebend", level_master: "Meister", level_sheikh: "Scheich",
  certificates: "Zertifikate", juzN: "Juz {n}", treeStage: "Gartenbaum, Stufe {n}", ijazahChain: "Idschaza-Kette", unverifiedChain: "Angaben der Person, nicht von uns geprüft.",
  noBadge: "Noch kein Abzeichen.", report: "Melden", guidelines: "Community-Richtlinien", reportInApp: "Zum Melden oder Blockieren nutzen Sie das Menü im Profil in der App oder schreiben Sie uns über den Support.",
  notFound: "Dieses Profil gibt es nicht oder es ist nicht öffentlich.", metaDesc: "{u} bei Quran Masterclass Talents: Koran-Rezitationen, Rewaya, Stufe und Erfolge.",
  listTitleFollowers: "Follower von @{u}", listTitleFollowing: "@{u} folgt", empty: "Hier ist noch niemand.", restricted: "Diese Liste sehen nur Follower.", loadMore: "Mehr laden",
  meTitle: "Mein Talent-Profil", meLead: "Ihr Profil, Ihre Abzeichen und Ihre Mitteilungen.", noProfile: "Sie haben noch kein Talent-Profil. Legen Sie es hier oder in der App an.",
  viewProfile: "Mein Profil ansehen", edit: "Profil bearbeiten", save: "Speichern", saved: "Gespeichert.", username: "Benutzername", usernameHint: "3 bis 20 Zeichen: a-z, 0-9, Punkt, Unterstrich.",
  name: "Name", bio: "Über mich", country: "Land", chooseCountry: "Land wählen", privateAccount: "Privates Konto (neue Follower brauchen Ihre Zustimmung)",
  whoMessages: "Wer Ihnen schreiben darf", msgConnections: "Verbindungen", msgNobody: "Niemand", acceptGuidelines: "Ich akzeptiere die Nutzungsbedingungen und die Community-Richtlinien.",
  ageTitle: "Ihr Alter", ageLead: "Die Community ist ab 13 Jahren, Posten und Nachrichten ab 16 Jahren. Ihr Geburtsjahr sieht niemand.", birthYear: "Geburtsjahr",
  ageConfirm: "Ich bestätige, dass dieses Geburtsjahr stimmt.", confirm: "Bestätigen", under13: "Die Community ist erst ab 13 Jahren verfügbar.",
  badgesTitle: "Meine Abzeichen", badgeHave: "Erhalten", badgeNotYet: "Noch nicht erhalten",
  reqEmail: "E-Mail-Adresse bestätigt", reqPhone: "Telefonnummer per SMS bestätigt", reqAge: "Mindestens 16 Jahre", reqProfile: "Profil vollständig: Name, Über mich, Land und Rewaya",
  reqGuidelines: "Community-Richtlinien akzeptiert", reqEmerald: "Smaragd-Haken erhalten", reqLevel: "Rezitationspfad: Zertifikat Stufe {n} (bisher Stufe {m})",
  officialHow: "Verbinden Sie Ihren YouTube-Kanal. Hat er mindestens {n} Abonnenten und passt sein Name zu Ihrem Profil, erhalten Sie den Stern sofort. Wir lesen nur Kanalname und Abonnentenzahl.",
  connectYoutube: "YouTube-Kanal verbinden", officialSoon: "Die Verbindung mit YouTube ist bald verfügbar.",
  official_ok: "Ihr Kanal ist bestätigt. Ihr Profil trägt jetzt den offiziellen Stern.", official_low: "Der Kanal hat noch nicht genug Abonnenten für den offiziellen Stern.",
  official_name: "Der Kanalname passt nicht zu Ihrem Profilnamen.", official_none: "Zu diesem Google-Konto wurde kein YouTube-Kanal gefunden.",
  official_error: "Die Prüfung hat leider nicht geklappt. Bitte versuchen Sie es später erneut.", official_expired: "Der Link ist abgelaufen. Bitte starten Sie erneut.", official_denied: "Die Verbindung wurde abgebrochen.",
  notifications: "Mitteilungen", noNotifications: "Noch keine Mitteilungen.",
  n_follow: "{u} folgt Ihnen jetzt.", n_follow_request: "{u} möchte Ihnen folgen.", n_like: "{u} gefällt Ihre Rezitation {v}.", n_comment: "{u} hat Ihre Rezitation {v} kommentiert.",
  n_post_approved: "Ihre Rezitation {v} wurde freigegeben.", n_post_rejected: "Ihre Rezitation {v} wurde nicht freigegeben.", n_connect_request: "{u} möchte sich mit Ihnen vernetzen.",
  n_connect_accepted: "{u} ist jetzt mit Ihnen vernetzt.", n_verified: "Ihr Profil wurde bestätigt.", n_verification_rejected: "Ihre Anfrage zur Bestätigung wurde abgelehnt.",
  error: "Das hat leider nicht geklappt.", e_text_not_allowed: "Ein Text enthält nicht erlaubte Wörter, Links oder Kontaktdaten.", e_username_taken: "Dieser Benutzername ist schon vergeben.",
  e_username_format: "Benutzername: 3 bis 20 Zeichen aus a-z, 0-9, Punkt und Unterstrich.", e_username_reserved: "Dieser Benutzername ist nicht verfügbar.", e_guidelines: "Bitte akzeptieren Sie die Community-Richtlinien.",
  e_age: "Die Community ist erst ab 13 Jahren verfügbar.", e_verify: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.", e_birth_year: "Bitte geben Sie ein gültiges Geburtsjahr ein.",
};

const OTHER: Record<string, Partial<Record<TwKey, string>>> = { ar, bn, es, fa, fr, id, ms, ps, ru, tr, ur, zh };
export const TALENTS_WEB_EN = en;

export function talentsText(locale: string): Record<TwKey, string> {
  if (locale === "de") return de;
  if (locale === "en") return en;
  return { ...en, ...(OTHER[locale] ?? {}) };
}
/** fills {n}, {u} … */
export const fill = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((a, [k, x]) => a.split(`{${k}}`).join(String(x)), s);
