import type { MapContent } from "../../mapContent";

const c: MapContent = {
  kicker: "Quran Masterclass · Méthode Shams",
  title: "La carte du Coran",
  lead: "114 sourates, 30 ajza', 6 236 versets – et d'un coup d'œil, tu vois ce qui est bien ancré, ce qui est fragile et ce qui te donne du mal. La carte n'est pas une barre de progression qui ne fait que grandir. C'est un miroir honnête de ta mémoire : elle devient verte quand tu révises et pâlit quand tu laisses un verset de côté trop longtemps.",
  ctaStart: "Apprends ton premier verset avec la Méthode Shams",
  ctaToday: "Aller à tes tâches du jour",
  stats: [{ n: "114", l: "sourates en cases" }, { n: "30", l: "ajza' d'un coup d'œil" }, { n: "6 236", l: "versets, chacun visible" }],
  readTitle: "Comment lire ta carte",
  readLead: "Chaque case est une sourate. Sa couleur est la moyenne de tous les versets que tu as déjà appris dans cette sourate. Si une sourate n'est apprise qu'en partie, sa case est dessinée plus claire. Touche une case et la sourate s'ouvre verset par verset.",
  colors: [
    { key: "strong", t: "Vert – ancré", d: "Tu as révisé ces versets à temps, ta mémoire les retient solidement.", todo: "Rien à faire – la plateforme te les ramène juste avant qu'ils ne s'effacent." },
    { key: "mid", t: "Or – fragile", d: "Ta dernière révision remonte à un moment. Tu connais encore les versets, mais plus sans effort.", todo: "Révise aujourd'hui ou demain. Un passage en mode mémorisation suffit généralement." },
    { key: "weak", t: "Rouge – difficile", d: "Soit pas révisé depuis longtemps, soit tu t'es souvent trompé ici. Les erreurs dans les tests, les leçons et les révisions comptent toutes.", todo: "Ceux-ci en premier : ouvre-les avec la Méthode Shams, utilise les ancrages mémoriels et la construction à rebours." },
    { key: "none", t: "Gris – pas encore appris", d: "Il te reste encore du chemin. Le gris n'est pas un échec, c'est une invitation.", todo: "Si ton plan le prévoit : à apprendre ensuite. Les courtes sourates à la fin du Coran sont un bon début." },
  ],
  howTitle: "Comment la carte sait ce que tu sais",
  howBody: "Derrière chaque verset appris se trouve un petit modèle de mémoire. Il retient **quand** tu as révisé le verset pour la dernière fois, **à quel intervalle** il doit revenir et **combien de fois** tu t'es trompé dessus.\n\n- **Intervalle :** après le premier apprentissage, un verset revient dès le lendemain, puis après trois jours, une semaine, deux semaines, un mois et plus. Chaque révision réussie allonge l'intervalle.\n- **Effacement :** plus un verset dépasse son intervalle, plus sa force estimée baisse – le vert devient or, l'or devient rouge. Exactement comme la vraie mémoire.\n- **Facilité :** les versets qui te viennent facilement reçoivent des intervalles plus longs. Ceux sur lesquels tu te trompes reviennent plus souvent. Chaque erreur diminue la facilité et compte aussi comme une pénalité sur la carte.\n- **Synchronisé :** avec ton compte, la carte est la même sur tous tes appareils – appris sur ton téléphone, vu sur ton ordinateur.\n\nLa carte est une estimation, pas un verdict. Seule la récitation montre au final si un verset est vraiment ancré – idéalement devant quelqu'un qui peut te corriger.",
  useTitle: "Ce que tu fais avec la carte",
  uses: [
    { t: "Le matin : le rouge d'abord", d: "Avant d'apprendre quoi que ce soit de nouveau, ramène les cases rouges. Cinq minutes de révision sauvent plus que vingt minutes de réapprentissage." },
    { t: "Avant la prière", d: "Les courtes sourates marquées en or sont parfaites pour la salât : les réciter, c'est les réviser – et la carte devient plus verte." },
    { t: "Avec ton professeur", d: "Montre la carte à ton professeur ou à tes parents. En quelques secondes, ils voient où t'écouter réciter." },
    { t: "Pour le Ramadan", d: "Tu veux connaître un juz solidement d'ici le Ramadan ? Passe à la vue par juz et avance du rouge au vert." },
  ],
  viewsTitle: "Trois niveaux, une seule image",
  views: [
    { t: "Sourates", d: "114 cases – de la longue Al-Baqarah à la courte An-Nas. La vue d'ensemble la plus rapide de tout ton Coran." },
    { t: "Ajza'", d: "30 cases pour les 30 parties. Idéal pour les plans de hifz pensés en juz et pour planifier un khatm." },
    { t: "Versets", d: "Touche une sourate : chaque verset devient sa propre case. Une touche l'ouvre pour la révision ou pour un nouvel apprentissage." },
  ],
  faqTitle: "Questions sur la carte",
  faq: [
    { q: "Pourquoi une case verte redevient-elle dorée alors que je n'ai rien fait de mal ?", a: "Parce que la mémoire s'efface sans révision. La carte ne montre pas ce que tu as appris un jour, mais ce que tu connais probablement encore solidement aujourd'hui. Une révision la rend de nouveau verte – et l'intervalle suivant s'allonge." },
    { q: "Je vois une carte d'exemple – est-ce ma progression ?", a: "Non. Tant que tu n'es pas connecté ou que tu n'as encore appris aucun verset, nous affichons un exemple clairement signalé pour que tu voies à quoi elle ressemblera. Dès que tu apprends ton premier verset, ta propre carte apparaît." },
    { q: "Est-ce que l'écoute compte ?", a: "L'écoute est la première étape de la Méthode Shams, mais un verset n'apparaît sur la carte qu'une fois que tu l'as appris et rappelé – dans le coach Shams, une leçon, un test ou le mode révision." },
    { q: "Et si je connaissais déjà la sourate par cœur ?", a: "Ouvre-la en mode mémorisation, récite chaque verset de mémoire et évalue-le « Facile ». Il apparaît immédiatement sur la carte, avance dans le programme et revient à de longs intervalles pour rester solide." },
    { q: "Les autres peuvent-ils voir ma carte ?", a: "Non. Ta carte t'appartient. Elle est transmise de manière chiffrée avec ton compte et n'est jamais affichée publiquement." },
  ],
  finalTitle: "Chaque case verte est un morceau du Coran dans ton cœur.",
  finalLead: "Commence aujourd'hui avec un seul verset. Demain, tu le verras sur ta carte – et dans un an, tout un paysage.",
};

export default c;
