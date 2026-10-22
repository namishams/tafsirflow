import type { ShamsPart } from "../../shamsContent";
// Spanish: the parts of the Shams Method shown on the app's Shams tab and the core of /shams; the rest falls back to
// English (see shamsContent.ts). No Quran or hadith text is typed here.
const c: ShamsPart = {
  heroKicker: "Quran Masterclass · método de aprendizaje",
  heroTitle: "El Método Shams",
  heroLead: "Una forma de aprender el Corán para que permanezca: cada aleya se escucha, se pronuncia, se entiende, se explica, se recuerda de memoria y se une a su vida – en siete pasos y, según la longitud de la aleya, unos dos a ocho minutos. Lo que la investigación sobre el aprendizaje de idiomas y la memoria sabe sobre el recuerdo, unido a la manera en que los maestros del Corán enseñan desde hace siglos.",
  heroBy: "Desarrollado por Nami Shams en Dubái",
  heroFacts: [
    { n: "7", l: "pasos para cada aleya" },
    { n: "2–8", l: "minutos por aleya nueva, según su longitud" },
    { n: "3–6", l: "repasos en tres meses cuando una aleya está bien asentada – más si flaquea" },
  ],
  stepsTitle: "Los siete pasos en detalle",
  stepsLead: "Cada paso tiene una tarea clara. Juntos duran entre dos y ocho minutos por aleya, según su longitud. La plataforma le guía a través de cada uno – no necesita preparar nada.",
  labels: { what: "Lo que usted hace", why: "Por qué funciona", platform: "Lo que la plataforma hace por usted", time: "Duración" },
  steps: [
    { what: "Escucha la aleya tres veces seguidas mientras sigue el texto árabe. Todavía sin traducción ni repetición en voz alta – solo escuchar y mirar.", time: "unos 45 segundos" },
    { what: "La aleya se construye desde el final: primero solo la última palabra, luego las dos últimas, luego las tres últimas – hasta la aleya completa. Cada vez usted la pronuncia también.", time: "unos 60 segundos" },
    { what: "Recorre la aleya palabra por palabra: la palabra árabe, la transliteración y el significado.", time: "unos 30 segundos" },
    { what: "Lee la traducción de toda la aleya y usa los ganchos de memoria: la palabra ancla, la rima al final de la aleya, el puente hacia la siguiente – y, si lo desea, escribe su propia ayuda para recordar.", time: "unos 40 segundos" },
    { what: "Lee la explicación clásica: el contexto, el motivo de la revelación y lo que enseñan los sabios al respecto.", time: "unos 45 segundos" },
    { what: "Las palabras desaparecen por etapas: primero solo ve la primera letra de cada palabra, después nada. Recita de memoria, descubre el texto y se evalúa con sinceridad.", time: "unos 40 segundos" },
    { what: "Escribe una o dos frases: ¿Qué me dice esta aleya sobre Allah? ¿Sobre mí? ¿Qué me llevo hoy de ella?", time: "unos 30 segundos" },
  ],
  demoTitle: "Una aleya, cuatro etapas",
  demoStages: ["Aleya completa", "Construir hacia atrás", "Solo las primeras letras", "De memoria"],
  finalTitle: "Su primera aleya lleva solo unos minutos",
  finalLead: "Empiece con Al-Fatihah. La plataforma le guía en cada paso.",
  finalPoints: ["Nada que preparar – la plataforma le guía en cada paso.", "La transliteración y el significado aparecen bajo cada palabra.", "Después, el modelo de memoria planifica sus repasos."],
  whyCloseApp: "Por eso existe el Método Shams: para que nadie tenga que aplazar el aprendizaje más importante de su vida.",
};
export default c;
