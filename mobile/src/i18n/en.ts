// English is the reference: every key must exist here; German (de.ts) mirrors it.
const en = {
  tabs: { home: "Overview", quran: "Quran", learn: "Learn", library: "Library", account: "Account" },
  common: {
    cancel: "Cancel", done: "Done", save: "Save", retry: "Try again", close: "Close", continue: "Continue",
    loading: "Loading…", offline: "No connection. Please check your internet connection and try again.",
    error: "Something went wrong. Please try again.", free: "Free", locked: "Premium",
  },
  quran: {
    search: "Search surah", verses: "{n} verses", makki: "Meccan", madani: "Medinan",
    juzAmma: "Juz ʿAmma", allSurahs: "All surahs",
  },
  account: {
    title: "Account", signIn: "Sign in", signOut: "Sign out", createAccount: "Create account",
    signedInAs: "Signed in as {email}", notSignedIn: "Sign in to keep your progress on every device and on the website.",
    appearance: "Appearance", system: "System", light: "Light", dark: "Dark",
    language: "Language", languageSystem: "System", german: "Deutsch", english: "English",
    premium: "Masterclass Premium", premiumActive: "Active", restore: "Restore purchases",
    legal: "Legal", terms: "Terms of use", privacy: "Privacy policy", imprint: "Imprint", website: "Website",
    support: "Report a problem", deleteAccount: "Delete account",
    deleteTitle: "Delete account", deleteBody: "Your account, progress, notes and bookmarks will be deleted permanently. A Premium purchase stays with your Apple ID and can be restored.",
    deleteConfirm: "Delete permanently", currentPassword: "Current password", wrongPassword: "The password is not correct.",
    version: "Version {v}",
  },
  auth: {
    email: "Email", password: "Password", firstName: "First name", lastName: "Last name", country: "Country",
    birthYear: "Year of birth", chooseCountry: "Choose country",
    terms: "I accept the terms of use and the privacy policy.", marketing: "Send me news about new courses (optional).",
    signInTitle: "Sign in", registerTitle: "Create account", noAccount: "No account yet?", haveAccount: "Already have an account?",
    forgot: "Forgot password?", forgotSent: "If an account exists for this address, you will receive an email with a link.",
    errors: {
      invalid: "Email or password is not correct.", exists: "An account with this email already exists.",
      weak: "Please choose a longer password (at least 10 characters).", terms: "Please accept the terms of use.",
      age: "Please enter a valid year of birth.", country: "Please choose your country.", rate: "Too many attempts. Please wait a few minutes.",
      email: "Please enter a valid email address.", name: "Please enter your first and last name.",
    },
    verifyHint: "We sent you an email. Please confirm your address with the link in it.",
  },
};
export default en;
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dict = Widen<typeof en>;
