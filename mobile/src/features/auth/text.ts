import { useCallback } from "react";
import { Platform } from "react-native";
import { useLang } from "@/i18n";
import { moduleText } from "@/i18n/app";

// Texts of sign-in with an e-mail code, passkeys and the security screen (module "auth", 21.10.2026). German and
// English here, the other twelve languages in src/i18n/app/<lang>.json under "auth" (polite address everywhere).
// {email}, {n}, {s}, {date} are placeholders.
const S = {
  de: {
    signInTitle: "Anmelden", newTitle: "Konto erstellen",
    lead: "Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen 6-stelligen Code – ganz ohne Passwort.",
    email: "E-Mail-Adresse", continue: "Weiter mit E-Mail",
    codeTitle: "Sehen Sie in Ihr Postfach", codeLead: "Wir haben einen 6-stelligen Code an {email} gesendet. Er gilt 10 Minuten.",
    codeLabel: "6-stelliger Code", paste: "Code einfügen", confirm: "Bestätigen",
    resend: "Neuen Code senden", resendIn: "Neuer Code in {s} s", resent: "Wir haben Ihnen einen neuen Code gesendet.",
    otherEmail: "Andere E-Mail-Adresse verwenden", noCode: "Kein Code erhalten?",
    noCodeHelp: "Sehen Sie bitte im Spam- oder Junk-Ordner nach und prüfen Sie, ob die Adresse richtig geschrieben ist. Die E-Mail kann eine Minute brauchen. Nach 30 Sekunden können Sie einen neuen Code anfordern.",
    or: "oder", passkey: "Mit Passkey anmelden", passkeyHint: "Mit Face ID, Touch ID oder Ihrer Bildschirmsperre. Es öffnet sich ein sicheres Anmeldefenster von quranmasterclass.com.",
    withPassword: "Mit Passwort anmelden", withCode: "Stattdessen mit E-Mail-Code anmelden", passwordRegister: "Konto mit Passwort erstellen",
    welcomeTitle: "Willkommen bei Quran Masterclass", welcomeLead: "Ihre E-Mail-Adresse {email} ist bestätigt. Noch wenige Angaben, dann ist Ihr kostenloses Konto bereit.",
    create: "Konto erstellen", privacyNote: "Wir nutzen Ihre E-Mail-Adresse nur für Ihr Konto und um Ihnen Anmeldecodes zu senden.",
    errEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.", errCode: "Dieser Code ist nicht richtig. Verbleibende Versuche: {n}.",
    errExpired: "Dieser Code ist abgelaufen oder wurde zu oft falsch eingegeben. Bitte fordern Sie einen neuen Code an.",
    errWait: "Bitte warten Sie {s} Sekunden, bevor Sie einen weiteren Code anfordern.",
    errRate: "Zu viele Versuche. Bitte warten Sie einige Minuten und versuchen Sie es dann erneut.",
    errTicket: "Die Bestätigung ist abgelaufen. Bitte geben Sie Ihre E-Mail-Adresse erneut ein.",
    errPasskey: "Der Passkey konnte nicht verwendet werden. Bitte versuchen Sie es erneut oder melden Sie sich mit einem E-Mail-Code an.",
    errGeneric: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    confirmTitle: "Bestätigen Sie, dass Sie es sind", confirmLead: "Für diesen Schritt senden wir einen 6-stelligen Code an {email}.",
    confirmSend: "Code senden", verifyByCode: "Stattdessen mit Code bestätigen", confirmed: "Bestätigt.",
    security: "Sicherheit und Anmeldung", securityLead: "Wie Sie sich anmelden, Ihre Passkeys und die Geräte, auf denen Sie angemeldet sind.",
    methods: "Anmeldewege", methodCode: "Code per E-Mail", methodPassword: "Passwort", on: "Aktiv", off: "Noch keine",
    optionalOff: "Nicht festgelegt (freiwillig)", count: "{n} gespeichert", setPassword: "Passwort per E-Mail festlegen",
    passwordSent: "Wir haben Ihnen eine E-Mail mit einem Link zum Festlegen des Passworts gesendet.",
    passkeys: "Passkeys",
    passkeysLead: "Melden Sie sich mit Face ID, Touch ID oder Ihrer Bildschirmsperre an – ohne Passwort und ohne Code. Der Passkey bleibt auf Ihrem Gerät oder in Ihrem Passwortmanager; wir speichern nur seinen öffentlichen Schlüssel.",
    add: "Passkey hinzufügen", none: "Noch keine Passkeys.", added: "Passkey hinzugefügt.",
    addedOn: "Hinzugefügt am {date}", lastUsed: "zuletzt verwendet am {date}", neverUsed: "noch nicht verwendet", synced: "synchronisiert",
    rename: "Umbenennen", name: "Name des Passkeys", save: "Speichern", cancel: "Abbrechen", remove: "Entfernen", removed: "Passkey entfernt.",
    removeConfirm: "Diesen Passkey entfernen? Sie können sich danach nicht mehr damit anmelden. Sie können ihn zusätzlich in Ihrem Passwortmanager löschen.",
    sessions: "Angemeldete Geräte", thisDevice: "Dieses Gerät", since: "Angemeldet am {date}", earlier: "Früher angemeldet",
    via_code: "mit E-Mail-Code", via_passkey: "mit Passkey", via_password: "mit Passwort", via_register: "bei der Registrierung",
    client_web: "Website", client_ios: "App auf iPhone oder iPad", client_android: Platform.OS === "ios" ? "App" : "Android-App", client_app: "App",
    signOut: "Abmelden", signOutConfirm: "Dieses Gerät abmelden?", signOutOthers: "Alle anderen Geräte abmelden",
    othersDone: "Alle anderen Geräte sind abgemeldet.", onlyThis: "Nur dieses Gerät ist angemeldet.",
    deleteByCode: "Ihr Konto hat kein Passwort. Bestätigen Sie das Löschen mit einem Code, den wir an Ihre E-Mail-Adresse senden.",
  },
  en: {
    signInTitle: "Sign in", newTitle: "Create account",
    lead: "Enter your e-mail address. We send you a 6-digit code – no password needed.",
    email: "E-mail address", continue: "Continue with e-mail",
    codeTitle: "Check your e-mail", codeLead: "We sent a 6-digit code to {email}. It is valid for 10 minutes.",
    codeLabel: "6-digit code", paste: "Paste code", confirm: "Confirm",
    resend: "Send a new code", resendIn: "New code in {s} s", resent: "We sent you a new code.",
    otherEmail: "Use a different e-mail address", noCode: "No code received?",
    noCodeHelp: "Please check your spam or junk folder and whether the address is spelled correctly. The e-mail can take a minute to arrive. After 30 seconds you can request a new code.",
    or: "or", passkey: "Sign in with a passkey", passkeyHint: "With Face ID, Touch ID or your screen lock. A secure sign-in window of quranmasterclass.com opens.",
    withPassword: "Sign in with password", withCode: "Sign in with an e-mail code instead", passwordRegister: "Create an account with a password",
    welcomeTitle: "Welcome to Quran Masterclass", welcomeLead: "Your e-mail address {email} is confirmed. A few details and your free account is ready.",
    create: "Create account", privacyNote: "We use your e-mail address only for your account and to send your sign-in codes.",
    errEmail: "Please enter a valid e-mail address.", errCode: "This code is not correct. Attempts left: {n}.",
    errExpired: "This code has expired or was entered wrongly too often. Please request a new code.",
    errWait: "Please wait {s} seconds before requesting another code.",
    errRate: "Too many attempts. Please wait a few minutes and try again.",
    errTicket: "The confirmation has expired. Please enter your e-mail address again.",
    errPasskey: "The passkey could not be used. Please try again or sign in with an e-mail code.",
    errGeneric: "Something went wrong. Please try again.",
    confirmTitle: "Confirm that it is you", confirmLead: "For this step we send a 6-digit code to {email}.",
    confirmSend: "Send code", verifyByCode: "Confirm with a code instead", confirmed: "Confirmed.",
    security: "Security and sign-in", securityLead: "How you sign in, your passkeys and the devices where you are signed in.",
    methods: "Ways to sign in", methodCode: "Code by e-mail", methodPassword: "Password", on: "On", off: "None yet",
    optionalOff: "Not set (optional)", count: "{n} saved", setPassword: "Set a password by e-mail",
    passwordSent: "We sent you an e-mail with a link to set a password.",
    passkeys: "Passkeys",
    passkeysLead: "Sign in with Face ID, Touch ID or your screen lock – no password and no code. The passkey stays on your device or in your password manager; we only store its public key.",
    add: "Add a passkey", none: "No passkeys yet.", added: "Passkey added.",
    addedOn: "Added on {date}", lastUsed: "last used on {date}", neverUsed: "not used yet", synced: "synced",
    rename: "Rename", name: "Name of the passkey", save: "Save", cancel: "Cancel", remove: "Remove", removed: "Passkey removed.",
    removeConfirm: "Remove this passkey? You can then no longer sign in with it. You can also delete it in your password manager.",
    sessions: "Signed-in devices", thisDevice: "This device", since: "Signed in on {date}", earlier: "Signed in earlier",
    via_code: "with an e-mail code", via_passkey: "with a passkey", via_password: "with a password", via_register: "at registration",
    client_web: "Website", client_ios: "iPhone or iPad app", client_android: Platform.OS === "ios" ? "App" : "Android app", client_app: "App",
    signOut: "Sign out", signOutConfirm: "Sign out this device?", signOutOthers: "Sign out all other devices",
    othersDone: "All other devices are signed out.", onlyThis: "Only this device is signed in.",
    deleteByCode: "Your account has no password. Confirm the deletion with a code we send to your e-mail address.",
  },
};

export type AuthKey = keyof typeof S.en;
export function authT(lang: string, key: AuthKey, vars?: Record<string, string | number>): string {
  let s = moduleText("auth", S, lang)[key] ?? S.en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}
export function useAuthT() {
  const { lang } = useLang();
  return useCallback((key: AuthKey, vars?: Record<string, string | number>) => authT(lang, key, vars), [lang]);
}
/** the English table, for the translation script */
export const AUTH_EN = S.en;
