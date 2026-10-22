// French translation of en.ts ("Pour les sœurs", polite "vous" address).
import type { SistersText } from "./types";

const fr: SistersText = {
  kicker: "Pour les sœurs",
  title: "Votre apprentissage continue chaque jour",
  lead: "Ce qui change pour la récitation pendant les menstrues (ḥayḍ) et après l'accouchement (nifās), comment la méthode Shams continue, et les femmes qui ont transmis et enseigné le Coran. L'apprentissage ne s'arrête jamais ; pour certaines écoles, seule sa forme change.",
  reviewLine: "Le contenu est en cours de vérification par des savants",
  notFatwa: "Ceci est un aperçu, pas une fatwa. Veuillez interroger un savant de confiance, en particulier de votre propre école juridique.",
  sourcesTitle: "Sources",
  schools: { hanafi: "Hanafite", maliki: "Malikite", shafii: "Chafiite", hanbali: "Hanbalite", jafari: "Jafarite (chiite)", majority: "Majorité des savants", contemporary: "Instances de fatwa contemporaines" },
  open: "Ouvrir",
  readVerse: "Lire et écouter dans le Coran",
  entryTitle: "Pour les sœurs",
  entryLead: "Réciter pendant les menstrues, les jours d'écoute et de compréhension dans la méthode Shams, et les femmes qui ont transmis le Coran.",
  entryCta: "Voir",

  partRecite: {
    title: "Réciter, mémoriser et le muṣḥaf",
    lead: "Les écoles divergent surtout sur la récitation de mémoire. L'écoute, le dhikr et l'invocation sont permis selon toutes les sources citées ici.",
    blocks: [
      {
        id: "memory",
        title: "Réciter de mémoire",
        positions: [
          { school: "hanafi", text: "Non permis avec l'intention de réciter, pas même moins d'un verset. Permis : les versets prononcés avec l'intention d'invocation, de rappel ou de protection, et la lecture des yeux sans prononcer. Une enseignante peut enseigner mot par mot avec des pauses, car cela ne compte pas comme récitation.", src: ["arij", "sgHanafi"] },
          { school: "maliki", text: "Tant que le saignement continue, une femme en ḥayḍ – et selon Dar al-Ifta également en nifās – peut réciter de mémoire, qu'elle craigne d'oublier ou non. Une fois le saignement arrêté mais avant le bain rituel, seulement si elle craint d'oublier.", src: ["ifta12343"] },
          { school: "shafii", text: "Même un seul verset n'est pas permis. Les formules du Coran prononcées comme rappel sont permises.", src: ["sgShafii"] },
          { school: "hanbali", text: "La position de l'école est l'interdiction. Ibn Taymiyya considérait la récitation comme permise, aussi en nifās lorsqu'elle craint d'oublier.", src: ["muftiwp18", "iqa2564"] },
          { school: "jafari", text: "Selon l'ayatollah al-Sistani, seuls les quatre versets de prosternation sont interdits (32:15, 41:37, 53:62, 96:19) – le verset lui-même, pas toute la sourate. Les autres versets ne font pas partie des interdictions énumérées. Pour le nifās, la même chose s'applique par précaution obligatoire.", src: ["sistani354", "sistani448", "sistani502"] },
          { school: "contemporary", text: "Le mufti des Territoires fédéraux de Malaisie estime que la révision de sa mémorisation est permise, aussi dans les écoles de hifz. islamqa.info considère l'avis permissif comme mieux fondé et conseille prudemment de ne réciter que ce que l'on craint d'oublier.", src: ["muftiwp18", "iqa2564"] },
        ],
      },
      {
        id: "mushaf",
        title: "Toucher le muṣḥaf",
        positions: [
          { school: "majority", text: "Selon la majorité, toucher le muṣḥaf sans état de pureté n'est pas permis.", src: ["iqa2564"] },
          { school: "hanafi", text: "Permis avec un tissu ou une housse séparés, non attachés au corps.", src: ["bham"] },
          { school: "maliki", text: "Une femme qui apprend ou enseigne peut toucher et porter le muṣḥaf ou une partie de celui-ci pendant l'apprentissage ou l'enseignement. Dar al-Ifta conseille en général l'avis de la majorité, mais permet de suivre l'avis malikite sans péché en cas de besoin réel – mémorisation, enseignement, enseignement comme profession.", src: ["ifta12343"] },
          { school: "jafari", text: "Toucher l'écriture du Coran est interdit.", src: ["sistani354", "sistani448"] },
        ],
      },
      {
        id: "screen",
        title: "Depuis un écran ou une application",
        positions: [
          { school: "contemporary", text: "islamqa.info : un téléphone n'est pas un muṣḥaf ; il peut être touché sans état de pureté. Dar al-Ifta (Égypte) : pour la majorité, réciter est interdit quel que soit le support ; regarder l'écran sans prononcer est permis.", src: ["iqa106961", "ifta7815"] },
          { school: "hanafi", text: "Darul Iftaa Azaadville : tant que le texte du Coran est à l'écran, l'écran et les icônes de cette page prennent le statut du muṣḥaf ; ne les touchez pas directement, un stylet est possible. L'écoute est permise.", src: ["azaad"] },
        ],
      },
      {
        id: "always",
        title: "Ce qui demeure toujours",
        points: [
          { text: "L'écoute : entendre la récitation est permis ; la source hanafite la qualifie de très louable, aussi à partir d'enregistrements. Le bureau du mufti de Malaisie recommande l'écoute à la place de la révision.", src: ["azaad", "sgHanafi", "muftiwp18"] },
          { text: "Le dhikr et l'invocation sont permis ; la majorité exempte précisément ceux-ci de l'interdiction, tant qu'ils ne sont pas voulus comme récitation.", src: ["iqa2564", "sgShafii"] },
          { text: "Le Prophète ﷺ récitait le Coran, la tête posée sur les genoux de ʿĀʾisha alors qu'elle avait ses menstrues. La proximité avec le Coran demeure.", src: ["bukhari297", "muslim301"] },
        ],
      },
    ],
  },

  partShams: {
    title: "Comment la méthode Shams continue",
    lead: "Les jours d'écoute et de compréhension, votre ḥifẓ reste vivant sans réciter à voix haute. Votre série et votre jardin continuent de grandir.",
    steps: [
      { id: "listen", title: "Le ḥifẓ par l'écoute", text: "Écoutez le sabaq du jour, votre sabqī et votre manzil par un grand récitateur, verset par verset et plusieurs fois.", src: ["muftiwp18", "sgHanafi"] },
      { id: "eyes", title: "Suivre des yeux", text: "Suivez la lecture en silence sans prononcer. Toucher l'écran pendant ce temps dépend de votre école (voir ci-dessus).", src: ["sgHanafi", "ifta7815", "azaad"] },
      { id: "understand", title: "Comprendre (tadabbur)", text: "Le sens, le tafsir et le contexte de vos versets : l'étape « comprendre » de la méthode Shams." },
      { id: "words", title: "Vocabulaire", text: "Les mots de vos versets et leurs racines, avec des cartes mémoire." },
      { id: "tajweed", title: "Théorie du tajwīd et makhārij", text: "Apprenez les règles, regardez les schémas de la bouche et les descriptions des points d'articulation. Quant à pratiquer des lettres isolées à voix haute, veuillez le clarifier avec votre enseignante." },
      { id: "dua", title: "Dhikr et invocation", text: "L'invocation et le rappel accompagnent chaque jour.", src: ["iqa2564"] },
    ],
    notes: [
      { text: "Les enseignantes qui suivent l'école hanafite peuvent enseigner mot par mot avec des pauses.", src: ["arij"] },
      { text: "Celles qui suivent l'école malikite peuvent continuer à réciter tant que le saignement continue et peuvent toucher le muṣḥaf pendant l'apprentissage ou l'enseignement.", src: ["ifta12343"] },
      { text: "Après la fin du saignement : dans l'école malikite, réciter n'est de nouveau permis qu'après le bain rituel, sauf si elle craint d'oublier.", src: ["ifta12343"] },
    ],
  },

  partSajda: {
    title: "La prosternation de récitation (sajdat al-tilāwa)",
    lead: "Ce qui s'applique lorsque vous entendez ou lisez un verset de prosternation.",
    positions: [
      { school: "hanafi", text: "En ḥayḍ et en nifās, elle n'est ni permise ni valide, et elle n'est ni due ni rattrapée plus tard.", src: ["sgSajda"] },
      { school: "majority", text: "La pureté est une condition ; la prosternation n'est donc pas accomplie (al-Sarakhsi, Ibn Juzayy, al-Nawawi, al-Ruhaybani).", src: ["ifta24156"] },
      { school: "contemporary", text: "Un autre avis estime que la pureté n'est pas requise (Ibn Taymiyya, al-Shawkani). Dar al-Ifta préfère l'avis de la majorité mais ne voit pas de péché pour une femme qui suit l'autre avis.", src: ["ifta24156"] },
      { school: "jafari", text: "Selon al-Sistani, la prosternation est obligatoire lorsqu'on récite ou entend l'un des quatre versets de prosternation ; le wuḍūʾ ou le ghusl n'est pas requis pour cela. Entendue depuis un enregistrement, elle ne devient pas obligatoire – cela inclut les récitations de cette application.", src: ["sistani1079"] },
    ],
  },

  partWomen: {
    title: "Les femmes et le Coran",
    lead: "Pour l'étape « comprendre » : des versets sur les femmes, et les femmes qui ont préservé, enseigné et récité le Coran.",
    versesTitle: "Versets à méditer",
    verses: [
      { ref: "33:35", topic: "Les croyants et les croyantes sont nommés côte à côte, avec la même récompense." },
      { ref: "3:195", topic: "Aucune œuvre n'est perdue, qu'elle soit d'un homme ou d'une femme." },
      { ref: "4:124", topic: "Les bonnes œuvres d'un homme ou d'une femme croyants mènent au Paradis." },
      { ref: "16:97", topic: "Une bonne vie pour quiconque fait le bien et croit, homme ou femme." },
      { ref: "58:1", topic: "Allah a entendu la femme qui plaidait au sujet de son mari ; la sourate porte son nom (al-Mujādila)." },
      { ref: "66:11", topic: "L'invocation de l'épouse de Pharaon pour une maison au Paradis." },
      { ref: "66:12", topic: "Maryam, qui a cru aux paroles de son Seigneur." },
      { ref: "3:42", topic: "Maryam est choisie et purifiée (jusqu'à 3:43)." },
      { ref: "28:7", topic: "L'inspiration à la mère de Mūsā : ne crains pas et ne t'afflige pas." },
    ],
    companionsTitle: "Les Compagnonnes qui ont transmis le Coran",
    companions: [
      { text: "Ḥafṣa bint ʿUmar conservait les feuillets (ṣuḥuf) de la compilation du Coran faite par Abū Bakr ; ʿUthmān en fit faire les copies et les lui rendit.", src: ["bukhari4986", "bukhari4987"] },
      { text: "Umm Waraqa lisait le Coran ; le Prophète ﷺ lui accorda un muezzin dans sa maison et lui dit de diriger la prière des gens de sa maison.", src: ["abudawud591", "abudawud592"] },
      { text: "ʿĀʾisha expliquait des versets et corrigeait des interprétations, par exemple de 2:158 et 4:3.", src: ["bukhari1643", "muslim3018"] },
      { text: "Umm Salama a décrit comment le Prophète ﷺ récitait al-Fātiḥa verset par verset, en marquant une pause après chaque verset – un fondement du tajwīd et de l'arrêt (waqf).", src: ["abudawud4001", "tirmidhi2927"] },
    ],
    scholarsTitle: "Femmes savantes",
    scholars: [
      { text: "Karīma al-Marwaziyya (m. 1069 à La Mecque) était une autorité pour la transmission du Ṣaḥīḥ al-Bukhārī.", src: ["karima"] },
      { text: "Fāṭima bint Muḥammad al-Samarqandī connaissait par cœur l'ouvrage de fiqh de son père ; des fatwas portaient son écriture à côté de celle de son père et de son mari.", src: ["samarqandi"] },
      { text: "Mohammad Akram Nadwi a rédigé en arabe un dictionnaire des femmes savantes du hadith en environ 40 volumes ; son introduction a paru sous le titre « Al-Muhaddithat: The Women Scholars in Islam ».", src: ["nadwi"] },
    ],
    recitersTitle: "Récitatrices",
    reciters: [
      { text: "Le Concours international de récitation du Coran en Malaisie a sa propre catégorie pour les récitatrices (qāriʾa) ; parmi ses lauréates figurent Rogayah Sulong et Faridah Mat Saman de Malaisie et Maria Ulfah d'Indonésie.", src: ["mtq", "aljazeera"] },
      { text: "Un enregistrement de 1905 de la récitatrice égyptienne Shaykha Mabrūka a été conservé ; aujourd'hui, des initiatives rendent de nouveau visibles les récitatrices.", src: ["aljazeera"] },
    ],
  },

  partTogether: {
    title: "Apprendre avec une enseignante et avec des sœurs",
    lead: "La récitation s'apprend en écoutant une enseignante et en récitant devant elle.",
    teacher: "Reliez votre méthode Shams à une enseignante de votre choix : elle voit votre plan, et vos enregistrements lorsque vous les lui envoyez.",
    circles: "Dans « Ensemble », il existe des cercles d'étude réservés aux sœurs.",
    teacherCta: "Relier une enseignante",
    circlesCta: "Cercles de sœurs",
  },

  setup: {
    title: "Configurer « Pour les sœurs » ?",
    lead: "Un espace facultatif qui accompagne votre apprentissage chaque jour.",
    points: [
      "Vous choisissez votre école juridique. Ce qui est mis en pause pendant vos jours en dépend.",
      "« Mes jours » est un simple interrupteur : oui ou non. Pas de date, pas d'historique, pas de calendrier de cycle.",
      "Tout reste uniquement sur cet appareil. Rien n'est synchronisé avec votre compte ni envoyé à un serveur ou à une IA ; tout est supprimé lorsque vous vous déconnectez.",
      "Vous pouvez le modifier ou le désactiver à tout moment.",
    ],
    agree: "Oui, configurer",
    decline: "Non, merci",
    declined: "Bien sûr. Nous ne vous demanderons rien de plus. La page « Pour les sœurs » vous reste accessible dans Découvrir.",
    madhhabTitle: "Quelle école juridique suivez-vous ?",
    madhhabLead: "Si vous ne savez pas, l'avis prudent de la majorité s'applique.",
    madhhabs: { hanafi: "Hanafite", maliki: "Malikite", shafii: "Chafiite", hanbali: "Hanbalite", jafari: "Jafarite (chiite)", unknown: "Je ne sais pas" },
    done: "Terminé",
    later: "Vous trouverez tout dans Découvrir → Pour les sœurs.",
  },

  days: {
    title: "Mes jours",
    lead: "Un interrupteur, uniquement sur cet appareil. Tant qu'il est activé, l'application met en pause ce que votre école ne prévoit pas pendant ces jours et active les jours d'écoute et de compréhension. Votre série et votre jardin demeurent ; les révisions sont reportées au lieu de s'accumuler.",
    question: "Avez-vous vos règles en ce moment ?",
    yes: "Oui",
    no: "Non",
    statusOn: "Activé : les jours d'écoute et de compréhension sont actifs.",
    statusOff: "Désactivé.",
    rules: {
      hanafi: "Hanafite : la récitation de mémoire et les exercices de récitation sont en pause. L'écoute, la lecture des yeux, la compréhension, le vocabulaire, la théorie du tajwīd et l'invocation demeurent.",
      maliki: "Malikite : la récitation de mémoire reste permise tant que le saignement continue. L'application vous le rappelle au lieu de mettre en pause. Ne touchez le muṣḥaf que pendant l'apprentissage ou l'enseignement.",
      shafii: "Chafiite : la récitation de mémoire et les exercices de récitation sont en pause. L'écoute, la lecture des yeux, la compréhension, le vocabulaire, la théorie du tajwīd et l'invocation demeurent.",
      hanbali: "Hanbalite : la récitation de mémoire et les exercices de récitation sont en pause (la position de l'école). L'écoute, la lecture en suivant, la compréhension, le vocabulaire, la théorie du tajwīd et l'invocation demeurent.",
      jafari: "Jafarite : veuillez omettre les quatre versets de prosternation (32:15, 41:37, 53:62, 96:19) ; l'application vous les signale. Pour l'état de janāba, al-Sistani (règle 355) qualifie de réprouvé (makrūh) le fait de réciter plus de sept versets ; quant à savoir si cela s'applique au ḥayḍ, veuillez interroger votre marjaʿ.",
      unknown: "Avis prudent de la majorité : la récitation de mémoire et les exercices de récitation sont en pause. L'écoute, la lecture des yeux, la compréhension, le vocabulaire, la théorie du tajwīd et l'invocation demeurent.",
    },
    strictTitle: "Mode strict",
    strictLead: "Votre propre choix : pendant vos jours, tout est en pause sauf l'écoute et l'invocation, y compris le tafsir et le vocabulaire. Aucune des grandes écoles ne l'exige ; l'écoute, le tafsir et l'invocation sont permis.",
    offTitle: "Je suis de nouveau pure",
    offNote: "Après la fin du saignement, le bain rituel (ghusl) est requis ; dans l'école malikite, réciter n'est de nouveau permis qu'après celui-ci, sauf si elle craint d'oublier.",
    ghuslLink: "Vers le guide du ghusl",
    privacy: "Uniquement sur cet appareil. Pas de date, pas d'historique, pas de transfert. Supprimé lorsque vous vous déconnectez.",
    changeMadhhab: "Changer d'école juridique",
  },

  gate: {
    pausedTitle: "En pause jusqu'à la fin de vos jours",
    pausedMajority: "Selon votre école, on ne récite pas de mémoire pendant ces jours. Votre ḥifẓ reste vivant : écoutez aujourd'hui les mêmes versets et apprenez leur sens.",
    pausedStrict: "Vous avez choisi le mode strict : aujourd'hui, l'écoute et l'invocation demeurent.",
    noteMaliki: "Selon l'école malikite, vous pouvez réciter de mémoire tant que le saignement continue.",
    noteJafari: "Veuillez omettre les versets de prosternation 32:15, 41:37, 53:62 et 96:19.",
    listenInstead: "Écouter au lieu de réciter aujourd'hui",
    toSection: "Pour les sœurs",
    openAnyway: "Ouvrir quand même",
  },

  ld: {
    title: "Jours d'écoute et de compréhension",
    lead: "Lorsque vous ne pouvez pas ou ne voulez pas réciter à voix haute – en voyage, enrouée, pendant vos jours : votre wird devient écoute, compréhension et vocabulaire. La série et le jardin demeurent.",
    on: "Jours d'écoute et de compréhension",
    onHint: "Un simple interrupteur comme le mode voyage, uniquement sur cet appareil. Aucune date n'est enregistrée.",
    activeTitle: "Aujourd'hui : un jour d'écoute et de compréhension",
    activeLead: "Votre ḥifẓ reste vivant sans réciter à voix haute.",
    done: "Terminer le jour d'écoute",
    doneMsg: "Mā shāʾ Allāh. Votre jour d'écoute compte pour votre série et votre jardin.",
    off: "Réciter de nouveau",
    sistersLink: "Remarques pour les sœurs",
  },
};
export default fr;
