import { useLang } from "@/i18n";
import { moduleText } from "@/i18n/app";

// App-only texts of the radio, reciter and khatm screens (everything else comes from the website's messages via useWebT).
const S = {
  de: {
    nowPlaying: "Läuft gerade",
    openNowPlaying: "Wiedergabe öffnen",
    close: "Schließen",
    back: "Zurück",
    prevSurah: "Vorherige Sure",
    nextSurah: "Nächste Sure",
    verseOf: "Vers {v} von {n}",
    seek: "Position im Vers",
    speed: "Tempo",
    repeat: "Wiederholen",
    repeatOff: "Aus",
    repeatVerse: "Vers",
    repeatSurah: "Sure",
    sleepEnd: "Ende der Sure",
    sleepLeft: "noch {m} Min.",
    offline: "Keine Verbindung. Das Radio spielt weiter, sobald das Internet wieder da ist.",
    tryAgain: "Erneut versuchen",
    textUnavailable: "Der Text dieses Verses konnte gerade nicht geladen werden.",
    proStation: "Dieser Sender gehört zu Pro",
    proReciter: "Dieser Rezitator gehört zu Pro",
    listenRadio: "Im Radio hören",
    resume: "Weiterhören",
    elapsed: "{a} von {b}",
    syncHint: "Ihr Plan wird auf diesem Gerät gespeichert. Melden Sie sich an, damit er auch auf der Website und Ihren anderen Geräten weiterläuft.",
    signIn: "Anmelden",
    cancel: "Abbrechen",
    delete: "Löschen",
    shareRadio: "Radio teilen",
    volumeUp: "Lauter",
    volumeDown: "Leiser",
    on: "an",
    off: "aus",
    backToLive: "Zurück zu live",
    closePlayer: "Wiedergabe schließen",
  },
  en: {
    nowPlaying: "Now playing",
    openNowPlaying: "Open player",
    close: "Close",
    back: "Back",
    prevSurah: "Previous surah",
    nextSurah: "Next surah",
    verseOf: "Verse {v} of {n}",
    seek: "Position in the verse",
    speed: "Speed",
    repeat: "Repeat",
    repeatOff: "Off",
    repeatVerse: "Verse",
    repeatSurah: "Surah",
    sleepEnd: "End of surah",
    sleepLeft: "{m} min left",
    offline: "No connection. The radio continues as soon as the internet is back.",
    tryAgain: "Try again",
    textUnavailable: "The text of this verse could not be loaded right now.",
    proStation: "This station is part of Pro",
    proReciter: "This reciter is part of Pro",
    listenRadio: "Listen on the radio",
    resume: "Continue listening",
    elapsed: "{a} of {b}",
    syncHint: "Your plan is saved on this device. Sign in so it continues on the website and your other devices too.",
    signIn: "Sign in",
    cancel: "Cancel",
    delete: "Delete",
    shareRadio: "Share radio",
    volumeUp: "Louder",
    volumeDown: "Quieter",
    on: "on",
    off: "off",
    backToLive: "Back to live",
    closePlayer: "Close player",
  },
};
export type AppKey = keyof typeof S.en;

export function useAppT() {
  const { lang } = useLang();
  return (key: AppKey, params?: Record<string, string | number>) => {
    const s = moduleText("radio", S, lang)[key] ?? S.en[key];
    return params ? s.replace(/\{(\w+)\}/g, (_, p: string) => String(params[p] ?? `{${p}}`)) : s;
  };
}
