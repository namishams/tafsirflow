import type { MapContent } from "../../mapContent";

const c: MapContent = {
  kicker: "Quran Masterclass · Méthode Shams",
  title: "La carte du Coran",
  lead: "114 sourates, 30 ajza', 6 236 versets – et d'un coup d'œil, vous voyez ce qui est bien ancré, ce qui est fragile et ce qui vous donne du mal. La carte n'est pas une barre de progression qui ne fait que grandir. C'est un miroir honnête de votre mémoire : elle devient verte quand vous révisez et pâlit quand vous laissez un verset de côté trop longtemps.",
  ctaStart: "Apprenez votre premier verset avec la Méthode Shams",
  ctaToday: "Aller à vos tâches du jour",
  stats: [{ n: "114", l: "sourates en cases" }, { n: "30", l: "ajza' d'un coup d'œil" }, { n: "6 236", l: "versets, chacun visible" }],
  readTitle: "Comment lire votre carte",
  readLead: "Chaque case est une sourate. Sa couleur est la moyenne de tous les versets que vous avez déjà appris dans cette sourate. Si une sourate n'est apprise qu'en partie, sa case est dessinée plus claire. Touchez une case et la sourate s'ouvre verset par verset.",
  colors: [
    { key: "strong", t: "Vert – ancré", d: "Vous avez révisé ces versets à temps, votre mémoire les retient solidement.", todo: "Rien à faire – la plateforme vous les ramène juste avant qu'ils ne s'effacent." },
    { key: "mid", t: "Or – fragile", d: "Votre dernière révision remonte à un moment. Vous connaissez encore les versets, mais plus sans effort.", todo: "Révisez aujourd'hui ou demain. Un passage en mode mémorisation suffit généralement." },
    { key: "weak", t: "Rouge – difficile", d: "Soit pas révisé depuis longtemps, soit vous vous êtes souvent trompé ici. Les erreurs dans les tests, les leçons et les révisions comptent toutes.", todo: "Ceux-ci en premier : ouvrez-les avec la Méthode Shams, utilisez les ancrages mémoriels et la construction à rebours." },
    { key: "none", t: "Gris – pas encore appris", d: "Il vous reste encore du chemin. Le gris n'est pas un échec, c'est une invitation.", todo: "Si votre plan le prévoit : à apprendre ensuite. Les courtes sourates à la fin du Coran sont un bon début." },
  ],
  howTitle: "Comment la carte sait ce que vous savez",
  howBody: "Derrière chaque verset appris se trouve un petit modèle de mémoire. Il retient **quand** vous avez révisé le verset pour la dernière fois, **à quel intervalle** il doit revenir et **combien de fois** vous vous êtes trompé dessus.\n\n- **Intervalle :** après le premier apprentissage, un verset revient dès le lendemain, puis après trois jours, une semaine, deux semaines, un mois et plus. Chaque révision réussie allonge l'intervalle.\n- **Effacement :** plus un verset dépasse son intervalle, plus sa force estimée baisse – le vert devient or, l'or devient rouge. Exactement comme la vraie mémoire.\n- **Facilité :** les versets qui vous viennent facilement reçoivent des intervalles plus longs. Ceux sur lesquels vous vous trompez reviennent plus souvent. Chaque erreur diminue la facilité et compte aussi comme une pénalité sur la carte.\n- **Synchronisé :** avec votre compte, la carte est la même sur tous vos appareils – appris sur votre téléphone, vu sur votre ordinateur.\n\nLa carte est une estimation, pas un verdict. Seule la récitation montre au final si un verset est vraiment ancré – idéalement devant quelqu'un qui peut vous corriger.",
  useTitle: "Ce que vous faites avec la carte",
  uses: [
    { t: "Le matin : le rouge d'abord", d: "Avant d'apprendre quoi que ce soit de nouveau, ramenez les cases rouges. Cinq minutes de révision sauvent plus que vingt minutes de réapprentissage." },
    { t: "Avant la prière", d: "Les courtes sourates marquées en or sont parfaites pour la salât : les réciter, c'est les réviser – et la carte devient plus verte." },
    { t: "Avec votre professeur", d: "Montrez la carte à votre professeur ou à vos parents. En quelques secondes, ils voient où vous écouter réciter." },
    { t: "Pour le Ramadan", d: "Vous voulez connaître un juz solidement d'ici le Ramadan ? Passez à la vue par juz et avancez du rouge au vert." },
  ],
  viewsTitle: "Trois niveaux, une seule image",
  views: [
    { t: "Sourates", d: "114 cases – de la longue Al-Baqarah à la courte An-Nas. La vue d'ensemble la plus rapide de tout votre Coran." },
    { t: "Ajza'", d: "30 cases pour les 30 parties. Idéal pour les plans de hifz pensés en juz et pour planifier un khatm." },
    { t: "Versets", d: "Touchez une sourate : chaque verset devient sa propre case. Une touche l'ouvre pour la révision ou pour un nouvel apprentissage." },
  ],
  faqTitle: "Questions sur la carte",
  faq: [
    { q: "Pourquoi une case verte redevient-elle dorée alors que je n'ai rien fait de mal ?", a: "Parce que la mémoire s'efface sans révision. La carte ne montre pas ce que vous avez appris un jour, mais ce que vous connaissez probablement encore solidement aujourd'hui. Une révision la rend de nouveau verte – et l'intervalle suivant s'allonge." },
    { q: "Je vois une carte d'exemple – est-ce ma progression ?", a: "Non. Tant que vous n'êtes pas connecté ou que vous n'avez encore appris aucun verset, nous affichons un exemple clairement signalé pour que vous voyiez à quoi elle ressemblera. Dès que vous apprenez votre premier verset, votre propre carte apparaît." },
    { q: "Est-ce que l'écoute compte ?", a: "L'écoute est la première étape de la Méthode Shams, mais un verset n'apparaît sur la carte qu'une fois que vous l'avez appris et rappelé – dans le coach Shams, une leçon, un test ou le mode révision." },
    { q: "Et si je connaissais déjà la sourate par cœur ?", a: "Ouvrez-la en mode mémorisation, récitez chaque verset de mémoire et évaluez-le « Facile ». Il apparaît immédiatement sur la carte, avance dans le programme et revient à de longs intervalles pour rester solide." },
    { q: "Les autres peuvent-ils voir ma carte ?", a: "Non. Votre carte vous appartient. Elle est transmise de manière chiffrée avec votre compte et n'est jamais affichée publiquement." },
  ],
  finalTitle: "Chaque case verte est un morceau du Coran dans votre cœur.",
  finalLead: "Commencez aujourd'hui avec un seul verset. Demain, vous le verrez sur votre carte – et dans un an, tout un paysage.",
};

export default c;
