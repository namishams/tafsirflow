import type { ShamsPart } from "../../shamsContent";
// French: the parts of the Shams Method shown on the app's Shams tab and the core of /shams; the rest falls back to
// English (see shamsContent.ts). No Quran or hadith text is typed here.
const c: ShamsPart = {
  heroKicker: "Quran Masterclass · méthode d’apprentissage",
  heroTitle: "La Méthode Shams",
  heroLead: "Une manière d’apprendre le Coran pour qu’il reste : chaque verset est écouté, prononcé, compris, expliqué, rappelé de mémoire et relié à votre vie – en sept étapes et, selon la longueur du verset, environ deux à huit minutes. Ce que la recherche sur l’apprentissage des langues et sur la mémoire sait de la rétention, uni à la manière dont les enseignants du Coran enseignent depuis des siècles.",
  heroBy: "Développée par Nami Shams à Dubaï",
  heroFacts: [
    { n: "7", l: "étapes pour chaque verset" },
    { n: "2–8", l: "minutes par nouveau verset, selon sa longueur" },
    { n: "3–6", l: "révisions en trois mois quand un verset est bien ancré – davantage s’il vacille" },
  ],
  stepsTitle: "Les sept étapes en détail",
  stepsLead: "Chaque étape a une tâche claire. Ensemble, elles prennent environ deux à huit minutes par verset, selon sa longueur. La plateforme vous guide à travers chacune d’elles – vous n’avez rien à préparer.",
  labels: { what: "Ce que vous faites", why: "Pourquoi cela fonctionne", platform: "Ce que la plateforme fait pour vous", time: "Durée" },
  steps: [
    { what: "Vous écoutez le verset trois fois de suite en suivant le texte arabe. Pas encore de traduction ni de répétition à voix haute – seulement écouter et regarder.", time: "environ 45 secondes" },
    { what: "Le verset est construit à partir de la fin : d’abord le dernier mot, puis les deux derniers, puis les trois derniers – jusqu’au verset entier. Vous le prononcez à chaque fois.", time: "environ 60 secondes" },
    { what: "Vous parcourez le verset mot à mot : le mot arabe, sa translittération, son sens.", time: "environ 30 secondes" },
    { what: "Vous lisez la traduction du verset entier et utilisez les ancrages mémoriels : le mot-clé, la rime en fin de verset, le pont vers le verset suivant – et, si vous le souhaitez, vous notez votre propre moyen mnémotechnique.", time: "environ 40 secondes" },
    { what: "Vous lisez l’explication classique : le contexte, l’occasion de la révélation et ce qu’en enseignent les savants.", time: "environ 45 secondes" },
    { what: "Les mots disparaissent par étapes : d’abord vous ne voyez plus que la première lettre de chaque mot, puis plus rien. Vous récitez de mémoire, découvrez le texte et vous évaluez honnêtement.", time: "environ 40 secondes" },
    { what: "Vous écrivez une ou deux phrases : que me dit ce verset sur Allah ? Sur moi-même ? Qu’est-ce que j’en retiens pour aujourd’hui ?", time: "environ 30 secondes" },
  ],
  demoTitle: "Un verset, quatre étapes",
  demoStages: ["Verset entier", "Construire à rebours", "Premières lettres seulement", "De mémoire"],
  finalTitle: "Votre premier verset ne prend que quelques minutes",
  finalLead: "Commencez par Al-Fatihah. La plateforme vous guide à chaque étape.",
  finalPoints: ["Rien à préparer – la plateforme vous guide à chaque étape.", "La translittération et le sens apparaissent sous chaque mot.", "Ensuite, le modèle de mémoire planifie vos révisions."],
  whyCloseApp: "C’est pourquoi la Méthode Shams existe : pour que personne n’ait à repousser l’apprentissage le plus important de sa vie.",
};
export default c;
