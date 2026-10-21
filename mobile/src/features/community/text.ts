import { useLang } from "@/i18n";
import { moduleText } from "@/i18n/app";

// App-only texts of the reciters community (module "community2"; other languages fall back to English until translated)
const S = {
  de: {
    title: "Rezitatoren-Community", lead: "Finden Sie Rezitatoren und Lehrende und folgen Sie ihnen.",
    card: "Der Rezitatoren-Community beitreten", cardText: "Profil anlegen, Rezitatoren finden und ihnen folgen.",
    search: "Name oder @benutzername suchen", all: "Alle", learner: "Lernende", reciter: "Rezitator", teacher: "Lehrkraft", reciters: "Rezitatoren", teachers: "Lehrende",
    follow: "Folgen", following: "Folge ich", followers: "Follower", followingN: "Folge ich", ijaza: "Idschaza", ijazaLong: "Hat eine Idschaza",
    empty: "Noch keine Profile gefunden.", myProfile: "Mein Profil", create: "Profil anlegen", edit: "Profil bearbeiten",
    username: "Benutzername", usernameHint: "3 bis 20 Zeichen: a-z, 0-9, Punkt, Unterstrich.", name: "Name", bio: "Über mich", bioHint: "Höchstens 160 Zeichen.",
    role: "Ich bin", style: "Rezitationsstil", styleHint: "Zum Beispiel Hafs, Warsh, Tartil.", hasIjaza: "Ich habe eine Idschaza", isPublic: "Profil öffentlich sichtbar",
    save: "Speichern", saved: "Gespeichert.", block: "Blockieren", unblock: "Blockierung aufheben", report: "Melden", reported: "Danke, wir prüfen die Meldung.",
    confirmBlock: "Dieses Profil blockieren? Sie sehen sich dann gegenseitig nicht mehr.", cancel: "Abbrechen", more: "Mehr", signIn: "Bitte melden Sie sich an, um die Community zu nutzen.", signInBtn: "Anmelden",
    ageErr: "Ein öffentliches Profil ist ab 13 Jahren möglich. Bitte hinterlegen Sie Ihr Geburtsjahr im Konto.", needProfile: "Legen Sie zuerst ein eigenes Profil an, um zu folgen.",
    e_username_format: "Benutzername: 3 bis 20 Zeichen aus a-z, 0-9, Punkt und Unterstrich.", e_username_reserved: "Dieser Benutzername ist nicht verfügbar.", e_username_taken: "Dieser Benutzername ist schon vergeben.",
    e_name_required: "Bitte geben Sie einen Namen an.", e_text_not_allowed: "Ein Text enthält nicht erlaubte Wörter oder Links.", e_age: "Ein öffentliches Profil ist ab 13 Jahren möglich.",
    e_verify: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.", e_slow_down: "Bitte einen Moment warten.", e_generic: "Das hat leider nicht geklappt.", notFound: "Profil nicht gefunden.", youBlocked: "Sie haben dieses Profil blockiert.", back: "Zurück",
  },
  en: {
    title: "Reciters community", lead: "Find reciters and teachers and follow them.",
    card: "Join the reciters community", cardText: "Create a profile, find reciters and follow them.",
    search: "Search name or @username", all: "All", learner: "Learner", reciter: "Reciter", teacher: "Teacher", reciters: "Reciters", teachers: "Teachers",
    follow: "Follow", following: "Following", followers: "Followers", followingN: "Following", ijaza: "Ijaza", ijazaLong: "Holds an ijaza",
    empty: "No profiles found yet.", myProfile: "My profile", create: "Create profile", edit: "Edit profile",
    username: "Username", usernameHint: "3 to 20 characters: a-z, 0-9, dot, underscore.", name: "Name", bio: "About me", bioHint: "Up to 160 characters.",
    role: "I am a", style: "Recitation style", styleHint: "For example Hafs, Warsh, Tartil.", hasIjaza: "I hold an ijaza", isPublic: "Profile visible to everyone",
    save: "Save", saved: "Saved.", block: "Block", unblock: "Unblock", report: "Report", reported: "Thank you, we will review the report.",
    confirmBlock: "Block this profile? You will no longer see each other.", cancel: "Cancel", more: "More", signIn: "Please sign in to use the community.", signInBtn: "Sign in",
    ageErr: "A public profile requires age 13 or older. Please add your birth year in your account.", needProfile: "Create your own profile first to follow others.",
    e_username_format: "Username: 3 to 20 characters from a-z, 0-9, dot and underscore.", e_username_reserved: "This username is not available.", e_username_taken: "This username is already taken.",
    e_name_required: "Please enter a name.", e_text_not_allowed: "A text contains words or links that are not allowed.", e_age: "A public profile requires age 13 or older.",
    e_verify: "Please confirm your e-mail address first.", e_slow_down: "Please wait a moment.", e_generic: "That did not work.", notFound: "Profile not found.", youBlocked: "You blocked this profile.", back: "Back",
  },
};
export type CKey = keyof typeof S.en;
export function useCT() {
  const { lang } = useLang();
  return (key: CKey) => moduleText("community2", S, lang)[key] ?? S.en[key];
}
