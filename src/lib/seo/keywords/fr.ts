import type { KeywordSet } from "../types";

const kw: Record<string, KeywordSet> = {
  "": {
    focus: "apprendre le coran",
    short: ["apprendre le coran en ligne", "coran en ligne", "coran gratuit", "lire le coran", "écouter le coran", "mémoriser le coran", "tajwid", "tafsir du coran", "application coran", "cours de coran", "arabe coranique", "heures de prière"],
    long: ["comment apprendre le coran seul", "apprendre le coran gratuitement en ligne", "comment apprendre à lire le coran en arabe", "apprendre le coran pour débutants", "site pour apprendre le coran gratuit", "application pour apprendre le coran sur iphone", "coran audio verset par verset avec traduction française", "comment mémoriser le coran facilement", "comment apprendre le tajwid à la maison", "apprendre le coran à l'âge adulte", "coran avec translittération et traduction", "apprendre le coran sans professeur", "cours de coran en ligne gratuit pour adultes", "comment comprendre le coran en français", "apprendre à réciter le coran correctement"],
  },
  "/how": {
    focus: "comment apprendre le coran",
    short: ["comment apprendre le coran", "méthode pour apprendre le coran", "apprendre le coran étape par étape", "apprentissage du coran", "mémorisation du coran", "plan de révision coran"],
    long: ["comment apprendre le coran étape par étape", "quelle méthode pour apprendre le coran", "par où commencer pour apprendre le coran", "comment écouter, comprendre et mémoriser le coran", "comment réviser ce qu'on a mémorisé du coran", "comment apprendre le coran de façon régulière", "comment fonctionne un site pour apprendre le coran", "apprendre le coran verset par verset", "comment s'organiser pour apprendre le coran"],
  },
  "/app": {
    focus: "application coran iphone",
    short: ["application coran iphone", "application coran gratuite", "appli coran ios", "application pour apprendre le coran", "coran audio iphone", "application mémorisation coran", "application tajwid"],
    long: ["meilleure application pour apprendre le coran sur iphone", "application coran gratuite sans abonnement", "application pour mémoriser le coran sur iphone", "application coran avec audio verset par verset", "application pour réviser le coran chaque jour", "application coran avec traduction française", "application pour apprendre le tajwid sur iphone", "appli pour écouter le coran sur iphone", "application coran avec même compte que le site"],
  },
  "/courses": {
    focus: "cours de coran en ligne",
    short: ["cours de coran en ligne", "cours de coran gratuit", "cours de tajwid", "cours d'arabe coranique", "cours de hifz", "apprendre le coran en ligne", "formation coran"],
    long: ["cours de coran en ligne gratuit pour adultes", "cours de coran pour débutants", "cours de coran en ligne sans inscription", "où apprendre le coran en ligne gratuitement", "cours de lecture du coran pour débutants", "cours de tajwid en ligne gratuit", "cours pour apprendre à lire l'arabe du coran", "cours de mémorisation du coran en ligne", "apprendre le coran à son rythme"],
  },
  "/tajweed": {
    focus: "règles de tajwid",
    short: ["règles de tajwid", "apprendre le tajwid", "tajwid pour débutants", "cours de tajwid", "makharij", "qalqala", "madd", "noun sakina", "mim sakina", "exercices de tajwid", "ghunna", "idgham"],
    long: ["apprendre les règles du tajwid pour débutants", "règles de tajwid expliquées simplement", "c'est quoi le tajwid", "tajwid en ligne gratuit", "exercices de tajwid en ligne", "comment apprendre le tajwid seul", "les règles du noun sakina et du tanwin", "les règles du mim sakina", "qu'est-ce que la qalqala en tajwid", "les différents types de madd en tajwid", "points d'articulation des lettres arabes makharij", "comment bien prononcer les lettres arabes du coran", "pourquoi le tajwid est important pour réciter le coran", "tajwid pour les nouveaux musulmans"],
  },
  "/arabic": {
    focus: "apprendre l'arabe du coran",
    short: ["apprendre l'arabe du coran", "arabe coranique", "alphabet arabe", "lire l'arabe", "apprendre à lire le coran", "lettres arabes", "voyelles arabes harakat", "arabe pour débutants"],
    long: ["comment apprendre à lire l'arabe pour lire le coran", "apprendre l'alphabet arabe pour lire le coran", "apprendre l'arabe coranique gratuitement", "apprendre à lire le coran en arabe pour adultes", "comment lire le coran sans savoir lire l'arabe", "comment relier les lettres arabes", "apprendre les voyelles et signes de l'arabe", "exercices de lecture de l'arabe coranique", "apprendre l'arabe du coran seul", "apprendre à lire le coran quand on est débutant"],
  },
  "/academy": {
    focus: "académie du coran en ligne",
    short: ["académie du coran", "école de coran en ligne", "parcours d'apprentissage du coran", "apprendre le coran en ligne", "formation coran gratuite", "études coraniques"],
    long: ["académie pour apprendre le coran en ligne gratuitement", "parcours guidé pour apprendre le coran", "école de coran en ligne pour adultes", "programme complet pour apprendre le coran", "comment suivre un parcours d'apprentissage du coran", "apprendre récitation tajwid et arabe en ligne", "étudier le coran de façon structurée"],
  },
  "/blog": {
    focus: "blog apprentissage du coran",
    short: ["blog coran", "conseils pour apprendre le coran", "articles sur le coran", "mémorisation du coran conseils", "tajwid article", "routine coran quotidienne"],
    long: ["conseils pour apprendre le coran plus vite", "comment rester régulier dans l'apprentissage du coran", "astuces pour mémoriser le coran", "erreurs fréquentes en apprenant le coran", "comment organiser sa routine quotidienne avec le coran", "articles pour débutants sur la lecture du coran", "comment rester motivé pour mémoriser le coran"],
  },
  "/guides": {
    focus: "guide pour apprendre le coran",
    short: ["guide pour apprendre le coran", "guide mémorisation coran", "guide tajwid", "guide tafsir", "apprendre le coran pour enfants", "juz amma", "routine quotidienne coran", "vocabulaire coranique"],
    long: ["guide complet pour apprendre à lire le coran", "guide pour mémoriser le coran étape par étape", "guide de tajwid pour débutants", "comment apprendre le juz amma", "plan d'apprentissage du juz amma", "comment comprendre le coran avec le tafsir", "comment apprendre le coran aux enfants", "comment apprendre le vocabulaire du coran", "comment construire une routine quotidienne avec le coran"],
  },
  "/islam": {
    focus: "découvrir l'islam",
    short: ["découvrir l'islam", "comprendre l'islam", "bases de l'islam", "islam pour débutants", "nouveau musulman", "piliers de l'islam", "piliers de la foi", "prière sunnite et chiite", "ramadan", "halal et haram", "hajj", "aïd"],
    long: ["islam pour débutants par où commencer", "je veux me convertir à l'islam que faire", "que faire quand on devient musulman", "les piliers de l'islam expliqués simplement", "les cinq piliers de l'islam et les six piliers de la foi", "qu'est-ce que l'islam", "différences entre sunnites et chiites", "les quatre écoles juridiques de l'islam", "comment fonctionne le ramadan", "comment se déroule le hajj", "les fêtes de l'aïd expliquées", "apprendre l'islam à son rythme", "livre pour comprendre l'islam débutant"],
  },
  "/quran": {
    focus: "lire le coran en ligne",
    short: ["lire le coran en ligne", "coran en ligne", "coran en français", "coran avec traduction", "sourates du coran", "coran audio", "liste des sourates", "coran translittération", "coran 114 sourates", "tafsir par verset"],
    long: ["lire le coran en ligne avec traduction française", "coran en arabe avec phonétique", "écouter le coran verset par verset", "toutes les sourates du coran avec audio", "liste des 114 sourates du coran", "lire le coran en ligne gratuitement", "coran avec traduction mot à mot", "coran avec tafsir verset par verset", "lire et écouter une sourate en même temps", "coran en ligne sans publicité"],
  },
  "/reciters": {
    focus: "récitateurs du coran",
    short: ["récitateurs du coran", "meilleurs récitateurs du coran", "coran par récitateur", "récitation du coran", "écouter coran mp3", "sourate audio", "récitateur coran célèbre", "voix coran"],
    long: ["écouter le coran par récitateur", "quel récitateur choisir pour apprendre le coran", "meilleur récitateur pour mémoriser le coran", "récitateur du coran à la récitation lente pour débutants", "comparer les récitateurs du coran", "écouter une sourate avec différents récitateurs", "récitation du coran en mp3 par sourate", "coran récité verset par verset pour apprendre", "récitateur coran pour réviser le hifz"],
  },
  "/radio": {
    focus: "radio coran",
    short: ["radio coran", "radio coran en direct", "coran en direct", "radio coran 24h/24", "radio coran en ligne", "récitation continue", "écouter le coran en continu", "coran radio gratuit"],
    long: ["radio coran en direct 24h/24", "écouter la radio coran en ligne gratuitement", "radio coran pour dormir", "radio coran en arrière-plan", "écouter le coran en continu sans interruption", "radio coran récitation lente", "radio coran sur iphone", "radio coran sans publicité", "radio coran pour réviser la mémorisation"],
  },
  "/prayer": {
    focus: "horaires de prière",
    short: ["horaires de prière", "heures de prière aujourd'hui", "horaires de prière près de moi", "direction de la qibla", "qibla", "salat fajr", "salat maghrib", "horaires prière ramadan"],
    long: ["horaires de prière aujourd'hui selon ma position", "heure de la prière du fajr aujourd'hui", "heure du maghrib aujourd'hui", "à quelle heure est la prière de dhuhr", "comment trouver la direction de la qibla", "boussole qibla en ligne", "horaires de prière près de chez moi", "heures des cinq prières par ville", "horaires de prière pour la France", "qibla depuis ma position"],
  },
  "/calendar": {
    focus: "calendrier islamique",
    short: ["calendrier islamique", "calendrier hégirien", "date hégirienne aujourd'hui", "calendrier musulman", "mois islamiques", "date du ramadan", "date de l'aïd", "convertisseur hégirien"],
    long: ["quelle est la date hégirienne aujourd'hui", "calendrier musulman avec dates grégoriennes", "les mois du calendrier islamique", "calendrier islamique des fêtes", "quand commence le ramadan cette année", "quand est l'aïd cette année", "convertir une date grégorienne en date hégirienne", "année hégirienne en cours", "dates importantes du calendrier musulman"],
  },
  "/islam/names": {
    focus: "99 noms d'Allah",
    short: ["99 noms d'Allah", "asma ul husna", "noms d'Allah", "noms d'Allah et leur sens", "les beaux noms d'Allah", "apprendre les noms d'Allah", "prononciation noms d'Allah"],
    long: ["les 99 noms d'Allah avec leur signification", "les 99 noms d'Allah en arabe et en français", "comment apprendre les 99 noms d'Allah", "les 99 noms d'Allah prononciation", "liste des 99 noms d'Allah", "que signifie Ar-Rahman et Ar-Rahim", "apprendre les noms d'Allah avec les enfants", "comment mémoriser les noms d'Allah facilement", "audio des 99 noms d'Allah"],
  },
  "/duas": {
    focus: "invocations du quotidien",
    short: ["invocations du quotidien", "dua", "duas en français", "invocations musulmanes", "dua avant de manger", "dua du matin et du soir", "dua pour voyager", "dua pardon", "dua pour la protection", "invocation arabe français phonétique"],
    long: ["invocations du quotidien en arabe avec traduction", "liste de duas à connaître pour un musulman", "dua à dire en entrant à la maison", "invocation avant de dormir", "invocation pour le pardon", "invocations du matin et du soir", "dua pour voyager en phonétique", "duas pour débutants avec phonétique", "quelle invocation dire dans une difficulté", "invocations pour les moments du quotidien"],
  },
  "/nahj": {
    focus: "Nahj al-Balagha",
    short: ["nahj al balagha", "nahj al-balagha en français", "nahj al balagha en ligne", "sermons de l'imam Ali", "lettres de l'imam Ali", "paroles de l'imam Ali", "nahj al balagha pdf", "livre nahj al balagha"],
    long: ["lire le nahj al balagha en ligne", "nahj al balagha traduction française", "nahj al balagha sermons lettres et sentences", "qui a compilé le nahj al balagha", "nahj al balagha sayyid radi", "par où commencer pour lire le nahj al balagha", "sentences de l'imam Ali dans le nahj al balagha", "nahj al balagha expliqué pour débutants", "lire le nahj al balagha sur mobile"],
  },
  "/shams": {
    focus: "méthode Shams",
    short: ["méthode Shams", "méthode de mémorisation du coran", "mémoriser le coran avec compréhension", "hifz", "méthode hifz", "révision du coran", "répétition espacée coran", "mémoriser sourate"],
    long: ["quelle méthode pour mémoriser le coran rapidement", "comment mémoriser le coran en comprenant le sens", "méthode de mémorisation du coran verset par verset", "comment réviser le coran pour ne pas oublier", "comment retenir les versets similaires du coran", "répétition espacée pour le hifz", "méthode simple pour apprendre une sourate par cœur", "comment mémoriser le coran quand on travaille", "versets similaires mutashabihat comment les distinguer"],
  },
  "/salah": {
    focus: "apprendre la prière",
    short: ["apprendre la prière", "comment prier", "apprendre la salat", "étapes de la prière", "prière musulmane", "prière pour débutants", "fajr dhuhr asr maghrib isha", "ce qu'on récite dans la prière"],
    long: ["comment faire la prière musulmane étape par étape", "apprendre à prier pour un nouveau musulman", "comment prier quand on ne sait pas l'arabe", "ordre des gestes de la prière", "comment prier le fajr", "combien de rakats pour chaque prière", "apprendre la prière en phonétique", "comment faire la prière chez soi pour débutant", "prière sunnite et prière chiite différences", "que réciter dans la salat"],
  },
  "/wudu": {
    focus: "faire le wudu",
    short: ["faire le wudu", "ablutions", "comment faire les ablutions", "wudu étape par étape", "ordre du wudu", "ablutions musulmanes", "apprendre le wudu"],
    long: ["comment faire les ablutions étape par étape", "ordre des ablutions en islam", "comment faire le wudu pour débutants", "ce qui annule les ablutions", "comment faire le wudu sans se tromper", "ablutions pour la prière schéma", "entraînement interactif pour apprendre le wudu", "comment faire les ablutions pour les nouveaux musulmans", "ablutions sunnite et chiite différences"],
  },
  "/khatm": {
    focus: "khatm du coran",
    short: ["khatm du coran", "finir le coran", "plan de lecture du coran", "lire le coran en un mois", "khatm ramadan", "programme de lecture du coran", "khatm en groupe"],
    long: ["comment finir le coran en un mois", "plan de khatm pour le ramadan", "combien de pages par jour pour finir le coran", "comment faire un khatm en famille", "programme de lecture du coran sur 30 jours", "suivre sa progression de lecture du coran", "organiser un khatm entre amis", "lire un juz par jour pour finir le coran", "planificateur de khatm"],
  },
  "/vocab": {
    focus: "vocabulaire coranique",
    short: ["vocabulaire coranique", "mots du coran", "mots arabes du coran", "apprendre le vocabulaire du coran", "mots fréquents du coran", "arabe coranique vocabulaire", "comprendre le coran mot à mot"],
    long: ["les mots les plus fréquents du coran", "comment apprendre le vocabulaire du coran", "apprendre les mots du coran avec leur sens", "vocabulaire arabe du coran avec traduction française", "combien de mots faut-il connaître pour comprendre le coran", "comprendre le coran sans parler arabe", "réviser le vocabulaire coranique chaque jour", "cartes de mémorisation de mots du coran"],
  },
  "/dua-generator": {
    focus: "générateur de dua",
    short: ["générateur de dua", "écrire une dua", "dua personnelle", "faire une invocation", "invocation en arabe", "créer une dua", "dua en arabe et français"],
    long: ["comment faire une invocation personnelle en arabe", "générateur d'invocation en arabe avec translittération", "comment formuler une dua", "écrire une dua avec traduction française", "comment demander à Allah dans une dua", "adab de la dua", "outil pour créer une dua en arabe", "modèle de dua personnelle"],
  },
  "/surah": {
    focus: "sourate du coran",
    short: ["sourate", "sourate audio", "sourate en français", "sourate avec traduction", "écouter une sourate", "mémoriser une sourate", "tafsir sourate", "sourate translittération"],
    long: ["écouter une sourate verset par verset", "lire une sourate avec translittération et traduction", "comment mémoriser une sourate courte", "sourate avec explication tafsir", "sourate en arabe avec phonétique", "audio de la sourate avec traduction", "comment apprendre une sourate par cœur", "sourate en mp3 avec récitateur au choix"],
  },
  "/learn-quran": {
    focus: "apprendre le coran en ligne",
    short: ["apprendre le coran", "apprendre le coran en ligne", "apprendre à lire le coran", "apprendre le coran seul", "apprendre le coran débutant", "apprendre le coran adulte", "apprendre le coran gratuit", "lecture du coran", "cours de coran"],
    long: ["comment apprendre le coran seul à la maison", "comment apprendre à lire le coran quand on est adulte", "apprendre le coran gratuitement sur internet", "par où commencer pour apprendre le coran", "combien de temps pour apprendre à lire le coran", "comment apprendre le coran sans savoir lire l'arabe", "plan pour apprendre le coran en un an", "apprendre le coran étape par étape", "faut-il un professeur pour apprendre le coran", "comment apprendre la lecture et le sens du coran", "apprendre le coran en 15 minutes par jour", "ordre d'apprentissage lettres tajwid mémorisation"],
  },
  "/quran-tafsir": {
    focus: "tafsir du coran",
    short: ["tafsir du coran", "tafsir en ligne", "tafsir en français", "explication du coran", "comprendre le coran", "tafsir verset par verset", "sens des versets", "coran mot à mot", "tafsir sourate"],
    long: ["comment comprendre le coran en français", "tafsir du coran verset par verset en ligne", "c'est quoi le tafsir", "différence entre traduction et tafsir", "comment lire un tafsir quand on débute", "tafsir sunnite et tafsir chiite", "explication d'une sourate du coran", "comprendre le coran avec le sens des mots", "quel tafsir lire pour commencer", "pourquoi lire le tafsir à côté de la traduction", "contexte de révélation des versets", "comment étudier le coran avec le tafsir"],
  },
  "/tajweed-online": {
    focus: "apprendre le tajwid en ligne",
    short: ["apprendre le tajwid", "tajwid en ligne", "règles de tajwid", "tajwid pour débutants", "cours de tajwid gratuit", "exercices de tajwid", "makharij", "qalqala", "madd", "noun sakina"],
    long: ["comment apprendre le tajwid en ligne gratuitement", "apprendre le tajwid seul pour débutants", "tajwid par où commencer", "règles de tajwid dans l'ordre pour débutants", "combien de temps pour apprendre le tajwid", "est-ce obligatoire d'apprendre le tajwid", "exercices pratiques pour appliquer le tajwid", "comment corriger sa récitation du coran", "comment savoir si ma récitation est correcte", "tajwid et écoute d'un récitateur", "les points d'articulation expliqués simplement", "règles du madd en tajwid"],
  },
  "/memorize-quran": {
    focus: "mémoriser le coran",
    short: ["mémoriser le coran", "hifz", "apprendre le coran par cœur", "méthode de hifz", "mémoriser une sourate", "réviser le coran", "hifz pour adultes", "mémoriser juz amma", "plan de mémorisation du coran"],
    long: ["comment mémoriser le coran facilement", "comment mémoriser le coran quand on est adulte", "combien de temps pour mémoriser tout le coran", "méthode pour mémoriser le coran sans professeur", "combien de versets mémoriser par jour", "comment réviser le coran pour ne pas oublier", "comment mémoriser le coran en travaillant", "plan de hifz pour débutants", "comment mémoriser le juz amma", "répétition espacée pour mémoriser le coran", "mémoriser le coran en comprenant le sens", "que faire quand on oublie ce qu'on a mémorisé", "quelle est la meilleure heure pour mémoriser le coran"],
  },
  "/quran-radio": {
    focus: "radio coran en ligne",
    short: ["radio coran", "radio coran en ligne", "radio coran en direct", "récitation du coran en continu", "écouter le coran en direct", "radio coran 24h", "radio islamique", "écoute de fond coran"],
    long: ["radio coran en direct gratuite", "comment utiliser la radio coran pour apprendre", "écouter la radio coran en arrière-plan", "radio coran avec récitateur au choix", "peut-on apprendre le coran en écoutant la radio", "radio coran pour réviser un hifz", "radio coran sur téléphone", "radio coran en continu sans publicité", "écouter le coran pendant le travail", "écouter le coran avant de dormir"],
  },
  "/listen-quran": {
    focus: "écouter le coran",
    short: ["écouter le coran", "coran audio", "coran mp3", "écouter coran en ligne", "sourate audio", "récitation du coran", "coran par récitateur", "écouter le coran verset par verset", "coran avec traduction audio"],
    long: ["écouter le coran en ligne gratuitement", "écouter le coran par sourate", "coran audio avec traduction française", "télécharger le coran en mp3", "écouter une sourate verset par verset", "quel récitateur écouter pour apprendre", "écouter le coran en suivant le texte", "écouter le coran sur iphone", "écouter le coran pour apprendre la prononciation", "écouter le coran en boucle pour mémoriser", "comment bien écouter le coran", "récitation lente du coran pour débutants"],
  },
  "/tawbah": {
    focus: "tawba",
    short: ["tawba", "repentir en islam", "comment faire tawba", "revenir à Allah", "demander pardon à Allah", "istighfar", "revenir à la prière", "dua de pardon", "retour vers Allah"],
    long: ["comment faire tawba sincèrement", "comment revenir vers Allah après un éloignement", "comment reprendre la prière après l'avoir abandonnée", "par où commencer pour revenir à la religion", "comment demander pardon à Allah", "comment se repentir étape par étape", "je veux me rapprocher d'Allah par où commencer", "comment recommencer à prier après des années", "invocations de pardon à connaître", "se sentir loin d'Allah que faire", "comment rester constant après la tawba", "redevenir pratiquant progressivement"],
  },
  "/learn-salah": {
    focus: "apprendre la salat",
    short: ["apprendre la salat", "apprendre à prier", "comment prier", "prière pour débutants", "étapes de la prière", "salat pas à pas", "prière nouveau musulman", "horaires de prière"],
    long: ["comment apprendre à prier pour un débutant", "comment prier étape par étape pour un nouveau musulman", "comment prier quand on ne connaît pas la sourate Al Fatiha", "comment apprendre la prière en phonétique", "comment prier si on ne parle pas arabe", "combien de rakats pour chaque prière", "comment installer l'habitude de prier cinq fois par jour", "préparation avant la prière", "erreurs courantes des débutants dans la prière", "prière chiite et sunnite quelles différences", "comment connaître la direction de la qibla", "par quoi commencer pour apprendre la prière"],
  },
  "/learn-wudu": {
    focus: "faire le wudu étape par étape",
    short: ["faire le wudu", "ablutions", "wudu étape par étape", "comment faire les ablutions", "ordre des ablutions", "apprendre le wudu", "wudu débutant"],
    long: ["comment faire les ablutions étape par étape pour débutants", "ordre exact des ablutions", "erreurs courantes dans le wudu", "ce qui annule le wudu", "comment faire le wudu pour un nouveau musulman", "comment faire le wudu avec des chaussettes", "ablutions et prière combien de temps cela dure", "comment s'entraîner à faire le wudu", "différences d'ablutions entre sunnites et chiites", "faut-il refaire ses ablutions avant chaque prière"],
  },
  "/learn-islam": {
    focus: "découvrir l'islam pour débutants",
    short: ["découvrir l'islam", "islam pour débutants", "comprendre l'islam", "nouveau musulman", "apprendre l'islam", "bases de l'islam", "piliers de l'islam", "convertir à l'islam"],
    long: ["islam pour débutants par où commencer", "comment découvrir l'islam sereinement", "que faire quand on devient musulman", "je suis curieux de l'islam que lire en premier", "les croyances de base en islam", "les piliers de l'islam expliqués simplement", "comment apprendre l'islam à son rythme", "livres pour comprendre l'islam en français", "comment apprendre la prière quand on est nouveau musulman", "comment commencer à lire le coran quand on est débutant", "différences entre sunnites et chiites expliquées calmement", "comment s'habituer à la vie quotidienne d'un musulman"],
  },
};

export default kw;
