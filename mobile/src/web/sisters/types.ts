// "Für Schwestern" – the shape of the section's texts (one file per language: de.ts, en.ts, ar.ts …). Pure data, no
// React, so the app gets the same files through mobile/scripts/sync-web.mjs (src/web/sisters/).
// Quran verses only by reference ("33:35"), rendered by the reader; hadith only by collection and number (SOURCES).

/** the schools a position is attributed to; "majority" = the four Sunni schools' majority, "contemporary" = a named modern fatwa body */
export type School = "hanafi" | "maliki" | "shafii" | "hanbali" | "jafari" | "majority" | "contemporary";

/** one attributed position; `src` are ids of SOURCES (sources.ts) */
export type Position = { school: School; text: string; src: string[] };
/** a plain point with its sources (facts, encouragement, practice) */
export type Point = { text: string; src?: string[] };
/** a verse by reference ("33:35") with a one-line neutral topic; the text comes from the reader */
export type VerseRef = { ref: string; topic: string };
/** a step of the listening and understanding day; `href` is an app/website route (the same on both) */
export type ListenStep = { id: "listen" | "eyes" | "understand" | "words" | "tajweed" | "dua"; title: string; text: string; src?: string[] };

export type Block = { id: string; title: string; lead?: string; positions?: Position[]; points?: Point[] };

export type SistersText = {
  // frame
  kicker: string;
  title: string;
  lead: string;
  reviewLine: string; // "Inhalt wird von Gelehrten geprüft"
  notFatwa: string; // closing line of every page
  sourcesTitle: string;
  schools: Record<School, string>;
  open: string; // "Öffnen"
  readVerse: string; // "Im Koran lesen und hören"
  // the entry card (Discover, Shams)
  entryTitle: string;
  entryLead: string;
  entryCta: string;
  // the four parts
  partRecite: { title: string; lead: string; blocks: Block[] };
  partShams: { title: string; lead: string; steps: ListenStep[]; notes: Point[] };
  partSajda: { title: string; lead: string; positions: Position[] };
  partWomen: { title: string; lead: string; versesTitle: string; verses: VerseRef[]; companionsTitle: string; companions: Point[]; scholarsTitle: string; scholars: Point[]; recitersTitle: string; reciters: Point[] };
  partTogether: { title: string; lead: string; teacher: string; circles: string; teacherCta: string; circlesCta: string };
  // the opt-in for the sisters' onboarding (consent first; declined = nothing female-specific is asked)
  setup: {
    title: string;
    lead: string;
    points: string[]; // what it does, that everything stays on the device
    agree: string;
    decline: string;
    declined: string; // shown after declining
    madhhabTitle: string;
    madhhabLead: string;
    madhhabs: Record<"hanafi" | "maliki" | "shafii" | "hanbali" | "jafari" | "unknown", string>;
    done: string; // "Fertig"
    later: string; // change later in the section
  };
  // "Meine Tage": a plain yes/no, device only
  days: {
    title: string;
    lead: string;
    question: string; // "Haben Sie gerade Ihre Tage?"
    yes: string;
    no: string;
    statusOn: string;
    statusOff: string;
    rules: Record<"hanafi" | "maliki" | "shafii" | "hanbali" | "jafari" | "unknown", string>; // what pauses, per school
    strictTitle: string;
    strictLead: string;
    offTitle: string; // "Ich bin wieder rein"
    offNote: string; // ghusl note
    ghuslLink: string;
    privacy: string;
    changeMadhhab: string;
  };
  // the calm paused state on recitation screens
  gate: {
    pausedTitle: string;
    pausedMajority: string;
    pausedStrict: string;
    noteMaliki: string;
    noteJafari: string;
    listenInstead: string;
    toSection: string;
    openAnyway: string; // her own decision, e.g. a teacher allowed it
  };
  // listening and understanding days (the pause mode; neutral wording, usable by anyone)
  ld: {
    title: string;
    lead: string;
    on: string; // switch label
    onHint: string; // what it does, privacy
    activeTitle: string; // "Heute: Hör- und Verstehenstag"
    activeLead: string;
    done: string; // button
    doneMsg: string;
    off: string; // "Zurück zum Rezitieren"
    sistersLink: string; // "Hinweise für Schwestern"
  };
};
