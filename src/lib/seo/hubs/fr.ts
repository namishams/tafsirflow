import type { Hub, HubId } from "../types";

const hubs: Record<HubId, Hub> = {
  "learn-quran": {
    title: "Apprendre le Coran en ligne : guide gratuit",
    description: "Un parcours clair pour apprendre le Coran en ligne : lettres, lecture, tajwid, sens et mémorisation, avec leçons et audio gratuits.",
    kicker: "Guide pour débutants",
    h1: "Apprendre le Coran en ligne, étape par étape",
    intro: "Apprendre le Coran en ligne est tout à fait possible, même si vous partez de zéro et ne lisez pas encore l'arabe. Ce guide vous donne un ordre clair, des lettres jusqu'à la mémorisation, pour les adultes, les enfants et les nouveaux musulmans, et vous montre où pratiquer chaque étape gratuitement sur Quran Masterclass.",
    answer: "Pour apprendre le Coran en ligne, on avance dans cet ordre : les lettres et les voyelles arabes, la lecture lente avec l'audio d'un récitateur, les règles de base du tajwid, puis le sens et la mémorisation de courtes sourates. Une courte séance chaque jour, de 10 à 20 minutes, vaut mieux qu'une longue séance par semaine. Quran Masterclass propose ce parcours gratuitement sur son site, et l'application iOS reprend la même progression avec le même compte.",
    sections: [
      {
        h2: "Par où commencer pour apprendre le Coran",
        p: [
          "Beaucoup de débutants commencent par mémoriser ce qu'ils entendent, puis butent sur la lecture quelques mois plus tard. Un ordre simple évite ce piège : les lettres et les voyelles, la lecture lente avec l'audio, les règles de base du tajwid, de courtes sourates, puis une routine quotidienne qui relie le tout.",
          "Avant la première leçon, fixez-vous un objectif concret pour le premier mois, par exemple lire les lettres sans hésiter et réciter correctement la sourate Al-Fatiha. Un but précis se tient plus facilement que « apprendre le Coran », trop vaste pour guider une journée.",
        ],
        links: [["/how", "Comment fonctionne le site"], ["/academy", "Le parcours de l'Académie"]],
      },
      {
        h2: "Apprendre à lire le Coran quand on est adulte",
        p: [
          "Le cours de lecture du site est construit comme la Qaida Nouraniya des écoles coraniques : les lettres, leurs formes selon leur place dans le mot, les voyelles courtes, les voyelles longues, le tanwin, le soukoun, la chadda, les signes particuliers, puis de vrais mots du Coran. Chaque leçon est courte : quelques cartes pour découvrir, des exercices variés, et vos erreurs reviennent à la fin pour être corrigées.",
          "Les adultes avancent souvent plus vite qu'ils ne le craignent. La difficulté se concentre sur quelques sons absents du français, surtout les lettres de la gorge et les lettres emphatiques. La translittération aide au tout début, mais traitez-la comme une passerelle : dès que vous déchiffrez les lettres, lisez l'écriture arabe et ne gardez la transcription que pour vérifier.",
        ],
        links: [["/arabic", "Cours de lecture de l'arabe"], ["/arabic/read", "Exercices de lecture"]],
      },
      {
        h2: "Écouter, répéter, lire : apprendre verset par verset",
        p: [
          "Chacune des 114 sourates a sa page avec le texte arabe, la translittération, la traduction française et l'audio de chaque verset. Avec plusieurs récitateurs, le mot récité s'illumine au fil de l'écoute, ce qui relie le son à l'écrit. Le mode Apprendre marque une pause après chaque verset ; vous pouvez aussi répéter un verset, faire tourner une plage de versets en boucle et ralentir la vitesse.",
          "Une technique simple : écoutez un verset deux fois en suivant le texte, répétez-le à voix haute, lisez-le sans l'audio, puis réécoutez pour comparer. Au début, choisissez une récitation posée, comme celle de Mahmoud Khalil Al-Husary ou de Mohamed Siddiq Al-Minshawi, avant d'essayer d'autres voix.",
        ],
        links: [["/quran", "Les 114 sourates"], ["/surah/1", "Sourate Al-Fatiha"], ["/reciters", "Choisir un récitateur"]],
      },
      {
        h2: "Ajouter le tajwid sans se décourager",
        p: [
          "Le tajwid rassemble les règles de prononciation du Coran. Inutile de tout étudier avant de réciter : commencez par les points d'articulation des lettres, puis la qalqala, les allongements (madd) et les règles du noun sakina. Une règle par semaine, appliquée aux sourates que vous lisez déjà, suffit pour progresser sans saturer.",
          "La page d'exercices vous fait repérer les règles dans de vrais versets. Sur la page d'une sourate, la fonction Réciter et vérifier écoute votre récitation grâce à la reconnaissance vocale du navigateur et indique les mots reconnus : une aide pour la lecture et la mémoire, pas l'oreille d'un enseignant.",
        ],
        links: [["/tajweed-online", "Le tajwid en ligne"], ["/tajweed/practice", "Exercices de tajwid"]],
      },
      {
        h2: "Comment apprendre la lecture et le sens du Coran",
        p: [
          "Quand la lecture devient stable, commencez à mémoriser de courtes sourates. On commence souvent par Al-Fatiha, récitée dans chaque prière, puis par les dernières sourates du Coran, comme Al-Ikhlas, Al-Falaq et An-Nas. La méthode Shams, conçue par Nami Shams, guide chaque verset en sept étapes courtes : écouter, reconstruire à rebours, mot à mot, sens, tafsir, indices qui s'effacent et méditation.",
          "Le sens n'a pas à attendre la fin du parcours. La traduction s'affiche sous chaque verset, le tafsir s'ouvre à côté, et le vocabulaire du Coran s'apprend avec des cartes mémoire sur les mots qui reviennent le plus souvent : les reconnaître à l'écoute, c'est commencer à suivre des idées et plus seulement des sons.",
        ],
        links: [["/shams", "La méthode Shams"], ["/vocab", "Vocabulaire du Coran"], ["/quran-tafsir", "Comprendre avec le tafsir"]],
      },
      {
        h2: "Adultes, enfants, nouveaux musulmans : adapter le parcours",
        p: [
          "Si votre emploi du temps est chargé, accrochez la séance à un moment qui existe déjà, après la prière de l'aube ou avant de dormir, et mesurez vos progrès en semaines plutôt qu'en jours. Pour les enfants, le mode enfants agrandit le texte, simplifie l'écran, aide mot à mot et donne des étoiles après chaque verset ; la station radio Pour les enfants enchaîne les sourates que l'on apprend en premier.",
          "Si vous êtes nouveau musulman, la priorité est souvent Al-Fatiha et ce qui sert à la prière. Vous pouvez l'apprendre à l'oreille avec l'audio et la translittération tout en suivant le cours de lecture en parallèle : inutile d'attendre de lire l'arabe pour commencer.",
        ],
        links: [["/learn-salah", "Apprendre la salat"], ["/learn-islam", "Découvrir l'islam"], ["/radio", "Radio Coran"]],
      },
      {
        h2: "Apprendre le Coran en 15 minutes par jour",
        p: [
          "Quinze minutes régulières permettent d'avancer : cinq minutes de révision, cinq minutes de lecture ou de nouveau verset, cinq minutes d'écoute ou de sens. La page Aujourd'hui rassemble les versets à réviser, la suite de votre lecture et la prochaine prière ; un plan d'apprentissage fixe la quantité de nouveaux versets.",
          "Le site est gratuit et sans publicité. L'application iOS utilise le même compte : vous pouvez commencer sur l'ordinateur et continuer sur l'iPhone sans perdre votre progression.",
        ],
        links: [["/today", "Le programme du jour"], ["/plan", "Plans d'apprentissage"], ["/app", "Application iOS"]],
      },
    ],
    stepsTitle: "Votre premier mois, semaine par semaine",
    steps: [
      { title: "Fixez un créneau de quinze minutes", body: "Choisissez une heure tenable chaque jour, par exemple après une prière, et gardez-la un mois." },
      { title: "Semaines 1 et 2 : lettres et voyelles", body: "Suivez les premières unités du cours de lecture jusqu'à lire des syllabes, puis des mots courts, sans aide." },
      { title: "Semaine 3 : Al-Fatiha avec l'audio", body: "Écoutez la sourate verset par verset, répétez après le récitateur, puis lisez seul en ne regardant la translittération qu'en cas de doute." },
      { title: "Semaine 4 : une première règle de tajwid", body: "Étudiez la leçon sur les points d'articulation et appliquez-la aux versets d'Al-Fatiha que vous connaissez déjà." },
      { title: "Ensuite : une courte sourate à la fois", body: "Mémorisez Al-Ikhlas, puis Al-Falaq et An-Nas avec la méthode Shams, en lisant la traduction de chaque verset." },
      { title: "Chaque jour : réviser avant d'avancer", body: "Ouvrez la page Aujourd'hui, récitez d'abord les versets à revoir, et ajoutez seulement ensuite du nouveau." },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Faut-il un professeur pour apprendre le Coran ?", a: "Pas pour commencer. Avec l'audio, les leçons et les exercices, on peut apprendre seul à lire, à appliquer les bases du tajwid et à mémoriser de courtes sourates. Pour corriger finement la prononciation, réciter régulièrement devant une personne qualifiée reste très utile." },
      { q: "Combien de temps faut-il pour apprendre à lire le Coran ?", a: "Cela dépend de votre point de départ et du temps consacré. Avec une pratique quotidienne courte, beaucoup d'adultes déchiffrent lentement après quelques semaines, et la lecture fluide demande en général plusieurs mois. Nous ne pouvons pas promettre de durée précise." },
      { q: "Comment apprendre le Coran sans savoir lire l'arabe ?", a: "Commencez par l'écoute et, en parallèle, par le cours de lecture. La translittération et la traduction française aident au début, mais l'objectif reste de lire l'écriture arabe, accessible à tout âge avec de la régularité." },
      { q: "Par quoi commencer : tajwid ou mémorisation ?", a: "Par la lecture, puis les bases du tajwid, puis la mémorisation : une prononciation fautive mémorisée est plus difficile à corriger ensuite. Dès que vous lisez, vous pouvez toutefois mener les deux de front, en appliquant une règle de tajwid aux versets que vous apprenez." },
      { q: "Mes enfants peuvent-ils apprendre avec le site ?", a: "Oui. Le mode enfants simplifie l'écran et récompense chaque verset par des étoiles. Nous recommandons aux parents d'accompagner les plus jeunes et de choisir les contenus avec eux." },
      { q: "Quran Masterclass est-il vraiment gratuit ?", a: "Le site est gratuit, sans abonnement et sans publicité. L'application iOS utilise le même compte et propose un abonnement Pro facultatif pour certaines fonctions ; la radio, ainsi qu'Al-Fatiha et le juz amma avec la méthode Shams, y restent gratuits." },
      { q: "Qui est derrière Quran Masterclass ?", a: "Quran Masterclass a été fondé par Nami Shams, qui a aussi conçu la méthode Shams. La plateforme est exploitée par ICSL FZE – Islamic Coding & Software Lab, à Sharjah, aux Émirats arabes unis, et elle est disponible en 14 langues." },
    ],
    linksTitle: "Pour aller plus loin",
    links: [["/courses", "Cours de Coran"], ["/academy", "Académie"], ["/arabic", "Lire l'arabe du Coran"], ["/tajweed", "Leçons de tajwid"], ["/memorize-quran", "Mémoriser le Coran"], ["/guides/how-to-learn-the-quran", "Guide détaillé (en anglais)"], ["/app", "Application iOS"], ["/how", "Comment ça marche"]],
    cta: ["/arabic", "Commencer par les lettres"],
  },

  "quran-tafsir": {
    title: "Tafsir du Coran en ligne : comprendre les versets",
    description: "Lisez le tafsir à côté de chaque verset, avec le sens des mots et la traduction. Un guide pour comprendre le Coran pas à pas.",
    kicker: "Comprendre le Coran",
    h1: "Tafsir du Coran en ligne : comprendre chaque verset",
    intro: "Le tafsir du Coran est l'explication du texte révélé : le sens des mots, le contexte et la manière dont les savants ont compris chaque verset. Cette page explique ce qu'est le tafsir, en quoi il diffère d'une traduction, comment l'étudier sourate par sourate et comment l'ouvrir à côté de chaque verset sur Quran Masterclass.",
    answer: "Le tafsir est l'explication savante du Coran : il précise le sens des mots arabes, le contexte de la révélation et les enseignements qu'en ont tirés les commentateurs, là où une traduction rend seulement le texte dans une autre langue. Pour débuter, lisez un verset, sa traduction, puis son tafsir, une courte sourate à la fois. Sur Quran Masterclass, le tafsir s'ouvre à côté de chaque verset, gratuitement sur le site ; l'application iOS utilise le même compte.",
    sections: [
      {
        h2: "C'est quoi le tafsir ?",
        p: [
          "Le mot tafsir vient d'une racine arabe qui évoque l'idée de dévoiler, de rendre clair. Comme discipline, il désigne l'explication du sens du Coran : ses mots, son contexte, les règles qu'il contient et la guidance qu'il apporte. Les savants distinguent parfois le tafsir, proche du texte et des récits transmis, et le ta'wil, qui cherche un sens plus profond ou moins apparent.",
          "Les savants classiques ont fixé des exigences pour celui qui explique le Coran : maîtrise de l'arabe, connaissance des récits transmis, des sciences coraniques et des principes du droit. La réflexion personnelle sur les versets, le tadabbur, est encouragée pour chaque lecteur ; proposer une interprétation nouvelle demande en revanche ce savoir.",
        ],
        links: [["/islam/quran", "Le Coran en bref"]],
      },
      {
        h2: "Différence entre traduction et tafsir",
        p: [
          "Une traduction rend le texte arabe dans une autre langue, et elle est déjà une forme d'interprétation : le traducteur choisit un mot parmi plusieurs possibles. Or l'arabe du Coran est dense, un terme peut porter plusieurs nuances, et une phrase peut renvoyer à un événement que le lecteur ne connaît pas.",
          "Le tafsir complète la traduction : il explique un mot, rapproche le verset d'autres passages du Coran, rappelle les récits liés à la révélation et présente les avis des commentateurs. En pratique, lisez d'abord la traduction pour saisir l'idée générale, puis ouvrez le tafsir pour les versets qui soulèvent une question.",
        ],
        links: [["/quran", "Lire le Coran avec traduction"], ["/search", "Rechercher dans le Coran"]],
      },
      {
        h2: "Comment étudier le Coran avec le tafsir, sourate par sourate",
        p: [
          "Commencez par une courte sourate que vous récitez déjà, par exemple Al-Fatiha (1) ou Al-Asr (103). Lisez d'abord toute la traduction pour avoir une vue d'ensemble, puis reprenez verset par verset avec le tafsir. Notez une idée par passage ; à la fin, relisez vos notes pour voir comment la sourate se construit.",
          "Choisissez ensuite une sourate un peu plus longue, au contenu suivi, comme Al-Mulk (67) ou Yusuf (12), dont le récit se lit d'un seul tenant. Quelques versets par jour suffisent, et vos favoris et notes vous permettent de reprendre là où vous vous étiez arrêté.",
        ],
        links: [["/surah/103", "Sourate Al-Asr"], ["/surah/67", "Sourate Al-Mulk"], ["/surah/12", "Sourate Yusuf"]],
      },
      {
        h2: "Approche classique et approche moderne",
        p: [
          "Les savants distinguent souvent le tafsir fondé sur la transmission, qui explique le Coran par le Coran lui-même, par la Sunna et par les propos des premières générations, et le tafsir fondé sur le raisonnement, qui s'appuie davantage sur la langue, la grammaire et l'effort d'interprétation. Les commentaires modernes y ajoutent souvent une lecture par thèmes et des questions propres à notre époque.",
          "Sur la page d'une sourate, chaque explication indique sa source sous le texte. Quran.com ne propose pas encore de tafsir en français : le site affiche donc des tafsirs reconnus en anglais, un classique (l'abrégé d'Ibn Kathir), un commentaire du XXe siècle (Ma'arif al-Qur'an) et un commentaire contemporain (Tazkir al-Quran). Le site peut aussi afficher ses propres explications ; quand l'une d'elles a été rédigée avec l'aide de l'IA, elle le signale et a été validée par la rédaction.",
        ],
        links: [["/surah/1", "Al-Fatiha avec tafsir"]],
      },
      {
        h2: "Tafsir sunnite et tafsir chiite",
        p: [
          "Les deux grandes traditions de l'islam partagent le même texte coranique et une grande partie de leurs explications, et chacune possède sa propre bibliothèque de commentaires. Du côté sunnite, on cite souvent at-Tabari, al-Qurtubi et Ibn Kathir ; du côté chiite, Majma' al-Bayan d'at-Tabrisi et al-Mizan de Tabataba'i, qui explique le Coran avant tout par le Coran lui-même.",
          "Les différences portent surtout sur certains versets liés à l'histoire des débuts de l'islam, à l'autorité religieuse et à des points de droit. Ce site ne tranche pas entre les écoles : il indique toujours la source d'une explication, pour que vous puissiez lire selon l'école que vous suivez. Quand deux commentaires divergent sur un point qui vous concerne, demandez à une personne de science de votre tradition.",
        ],
        links: [["/islam/madhahib", "Les écoles de l'islam (en anglais)"]],
      },
      {
        h2: "Comprendre le Coran avec le sens des mots",
        p: [
          "Une partie importante du vocabulaire coranique revient très souvent. Les paquets de cartes mémoire du site rassemblent ces mots fréquents avec leur sens en français, leur racine et un quiz d'écoute ; chaque mot que vous savez monte d'une boîte et revient après 1, 2, 4, 8 puis 16 jours.",
          "Sur la page d'une sourate, l'affichage mot à mot place un sens sous chaque mot arabe. Dans la méthode Shams, l'étape Mot à mot précède celle du sens global, puis celle du tafsir : la compréhension se construit à partir de petites briques. La dernière étape vous invite à écrire une note personnelle sur ce que le verset vous apprend.",
        ],
        links: [["/vocab", "Vocabulaire du Coran"], ["/shams/method", "Les sept étapes Shams"]],
      },
      {
        h2: "Contexte de révélation des versets",
        p: [
          "Certains versets sont liés à un événement précis de la vie du Prophète et de la première communauté : on parle des circonstances de la révélation (asbab an-nuzul). Les connaître éclaire souvent le sens, mais tous les versets n'en ont pas, et les récits qui les rapportent n'ont pas tous la même solidité selon les spécialistes.",
          "Les tafsirs mentionnent ces récits quand ils existent, avec leurs sources. Lisez-les comme un éclairage plutôt que comme une limite : les savants rappellent généralement que l'enseignement d'un verset ne se réduit pas à la circonstance qui l'a accompagné.",
        ],
        links: [["/islam/prophet", "Le Prophète Muhammad"]],
      },
    ],
    stepsTitle: "Étudier un passage en six temps",
    steps: [
      { title: "Écoutez le verset", body: "Lancez l'audio pour entendre le rythme et la prononciation avant de lire l'explication." },
      { title: "Lisez la traduction du passage", body: "Parcourez quelques versets d'affilée pour saisir l'idée générale, sans chercher tout de suite les détails." },
      { title: "Ouvrez le tafsir", body: "Lisez l'explication du verset qui vous interroge et regardez la source indiquée sous le texte." },
      { title: "Repérez deux mots clés", body: "Avec l'affichage mot à mot, retenez deux termes importants." },
      { title: "Écrivez une note", body: "Notez en une ou deux phrases ce que le passage vous apprend ; la note reste attachée au verset." },
      { title: "Relisez le lendemain", body: "Avant d'avancer, relisez le passage de la veille et votre note." },
    ],
    faqTitle: "Questions fréquentes sur le tafsir",
    faq: [
      { q: "Quelle est la différence entre traduction et tafsir ?", a: "La traduction rend le texte dans une autre langue ; le tafsir explique ce texte : sens des mots, contexte, liens avec d'autres versets et avis des commentateurs. Les deux se lisent ensemble, la traduction d'abord, le tafsir ensuite." },
      { q: "Quel tafsir lire pour commencer ?", a: "Choisissez une explication courte et claire, dans la tradition que vous suivez, puis passez à des ouvrages plus détaillés. Sur le site, l'abrégé d'Ibn Kathir est un point de départ simple ; pour une lecture adaptée à votre école, demandez conseil à une personne qualifiée." },
      { q: "Le tafsir est-il disponible en français ?", a: "La traduction des versets est en français. Pour le tafsir, Quran.com ne propose pas encore de source en français : le site affiche des tafsirs reconnus en anglais, avec leur nom, ainsi que ses propres explications lorsqu'elles existent. Un message l'indique à l'écran pour que vous sachiez toujours ce que vous lisez." },
      { q: "Faut-il un compte pour lire le tafsir ?", a: "Sur le site, sans compte confirmé, le tafsir est accessible pour un nombre limité de versets différents par jour ; un compte gratuit, confirmé par e-mail, lève cette limite. Dans l'application iOS, le tafsir est accessible sans compte." },
      { q: "Peut-on comprendre le Coran avec la seule traduction ?", a: "On en saisit l'essentiel, mais certaines nuances, certains renvois et le contexte de plusieurs versets demandent une explication : ouvrez le tafsir quand une question se pose." },
      { q: "Le tafsir donne-t-il des avis juridiques ?", a: "Les tafsirs exposent parfois des règles tirées des versets, selon l'école de leur auteur. Ce site n'émet pas d'avis juridique : pour une question de pratique, adressez-vous à une personne qualifiée de l'école que vous suivez." },
      { q: "Faut-il savoir l'arabe pour étudier le tafsir ?", a: "Non. Le tafsir se lit en traduction et le vocabulaire coranique s'apprend petit à petit. L'arabe permet d'aller plus loin, mais il n'est pas nécessaire pour commencer." },
    ],
    linksTitle: "À consulter aussi",
    links: [["/quran", "Les 114 sourates"], ["/vocab", "Vocabulaire coranique"], ["/shams/method", "Méthode Shams"], ["/search", "Rechercher dans le Coran"], ["/islam/quran", "Le Coran en bref"], ["/arabic", "Arabe du Coran"], ["/guides/understanding-the-quran-tafsir", "Guide du tafsir (en anglais)"], ["/learn-quran", "Apprendre le Coran"]],
    cta: ["/quran", "Lire avec tafsir"],
  },

  "tajweed-online": {
    title: "Apprendre le tajwid en ligne : règles et exercices",
    description: "Apprenez le tajwid en ligne : points d'articulation, qalqala, madd et noun sakina, avec leçons et exercices. Commencez par les bases, gratuitement.",
    kicker: "Récitation",
    h1: "Apprendre le tajwid en ligne : règles, leçons, exercices",
    intro: "Apprendre le tajwid en ligne permet de travailler la prononciation du Coran à votre rythme, avec des exemples audio et des exercices sur de vrais versets. Voici les règles dans l'ordre où les débutants les abordent généralement, comment vous entraîner et comment savoir si votre récitation progresse.",
    answer: "Le tajwid est l'ensemble des règles qui permettent de réciter le Coran avec une prononciation correcte : point d'articulation de chaque lettre (makharij), lettres épaisses et fines, règles du noun et du mim sakina, qalqala, allongements (madd) et pauses. On l'apprend en écoutant un récitateur, puis en appliquant une règle à la fois sur des versets réels. Quran Masterclass propose gratuitement sur son site des leçons avec exemples, des quiz et des exercices selon la lecture de Hafs d'après Asim ; l'application iOS utilise le même compte.",
    sections: [
      {
        h2: "Est-ce obligatoire d'apprendre le tajwid ?",
        p: [
          "Le tajwid consiste à donner à chaque lettre du Coran son point d'articulation, ses qualités et sa durée. Les savants distinguent généralement les erreurs manifestes, qui altèrent un mot ou son sens et qu'il faut éviter, des raffinements plus fins, qui relèvent de la perfection de la récitation. Le statut exact de chaque règle est présenté différemment selon l'école que vous suivez.",
          "Au-delà de cette question, il y a une raison pratique d'apprendre tôt : une prononciation fautive répétée pendant des mois devient une habitude difficile à défaire. Les leçons du site suivent la lecture de Hafs d'après Asim, la plus répandue aujourd'hui, selon la voie de la Shatibiyya.",
        ],
        links: [["/arabic", "Revoir la lecture de l'arabe"]],
      },
      {
        h2: "Les règles de tajwid dans l'ordre pour débutants",
        p: [
          "Le cours compte quatorze leçons réparties en trois niveaux. On commence par l'isti'adha et la basmala, puis les points d'articulation, les lettres épaisses et fines, le lam solaire et le lam lunaire. Viennent ensuite les quatre règles du noun sakina et du tanwin, le mim sakina, la ghunna sur les lettres doublées, la qalqala, les allongements, et enfin les pauses et les reprises (waqf et ibtida). La dernière leçon reprend toute la sourate Al-Fatiha avec le tajwid.",
          "Chaque leçon donne des exemples tirés du Coran, que vous pouvez écouter, et se termine par un quiz. Suivez l'ordre proposé : les premières règles servent de base aux suivantes, et vous les entendrez partout dans les sourates courtes.",
        ],
        links: [["/tajweed", "Le cours de tajwid"], ["/surah/1", "Sourate Al-Fatiha"]],
      },
      {
        h2: "Les points d'articulation expliqués simplement",
        p: [
          "Un makhraj est l'endroit où naît une lettre. Si une lettre quitte son makhraj, elle en devient une autre, et parfois le mot change de sens. Pour trouver le point d'une lettre, placez-la avec un soukoun après une voyelle et observez où le son s'arrête.",
          "Les lettres se répartissent en cinq zones : le vide de la bouche et de la gorge pour les voyelles longues, la gorge pour six lettres sur trois niveaux, la langue pour la plus grande partie de l'alphabet, les lèvres, et la cavité nasale pour la ghunna, le son nasal du noun et du mim. Pour un francophone, l'effort porte surtout sur les lettres de la gorge et sur les lettres emphatiques, qui n'existent pas en français.",
        ],
        links: [["/tajweed/makharij", "Leçon sur les makharij"]],
      },
      {
        h2: "Noun sakina, tanwin et mim sakina",
        p: [
          "Quand un noun sans voyelle ou un tanwin rencontre la lettre suivante, quatre cas sont possibles : le prononcer clairement (izhar), le fondre dans la lettre suivante (idgham), le changer en mim (iqlab) ou le cacher avec un son nasal (ikhfa). Ce sont parmi les règles que l'on rencontre le plus souvent dans le Coran.",
          "Le mim sakina suit une logique voisine, avec trois cas : il se cache devant un ba, fusionne avec un autre mim et se prononce clairement devant les autres lettres. Apprenez chaque cas avec deux ou trois exemples à l'oreille, puis cherchez-les dans les sourates que vous récitez déjà.",
        ],
        links: [["/tajweed/nun-sakinah-izhar", "Noun sakina : izhar"], ["/tajweed/mim-sakinah", "Mim sakina"]],
      },
      {
        h2: "Qalqala et règles du madd",
        p: [
          "La qalqala est un léger rebond du son sur cinq lettres lorsqu'elles portent un soukoun : qaf, ta emphatique, ba, jim et dal. Le rebond s'entend davantage quand on s'arrête sur l'une de ces lettres, en fin de verset par exemple. C'est une règle courte, que l'on peut appliquer dès les premières semaines.",
          "Le madd règle l'allongement des voyelles longues. L'allongement naturel dure deux temps ; il se prolonge davantage quand la voyelle longue est suivie d'une hamza ou d'un soukoun, avec des durées qui dépendent du type de madd. Tenez bien les deux temps naturels avant de travailler les allongements plus longs.",
        ],
        links: [["/tajweed/qalqalah", "Qalqala"], ["/tajweed/madd", "Les types de madd"]],
      },
      {
        h2: "Exercices pratiques pour appliquer le tajwid",
        p: [
          "Comprendre une règle ne suffit pas : il faut la reconnaître dans le texte et l'entendre. La page d'exercices propose une série « Trouvez la règle » sur dix passages tirés au hasard, ainsi qu'un quiz par sourate pour vérifier que vous repérez les règles dans les versets que vous connaissez.",
          "Pour aller plus loin, le Parcours du récitateur propose dix niveaux, des makharij jusqu'aux maqamat et aux lectures, avec une récitation modèle, vos propres enregistrements, des tests et des certificats.",
        ],
        links: [["/tajweed/practice", "Exercices de tajwid"], ["/reciter-path", "Parcours du récitateur"]],
      },
      {
        h2: "Comment savoir si ma récitation est correcte",
        p: [
          "Écoutez un récitateur lent, enregistrez-vous sur le même verset et comparez. Sur la page d'une sourate, vous pouvez ralentir la vitesse, répéter un verset en boucle et utiliser Réciter et vérifier : la reconnaissance vocale du navigateur, assurée par son fournisseur, indique les mots reconnus ; si votre navigateur ne la propose pas, enregistrez-vous et réécoutez. Votre enregistrement reste dans l'onglet ouvert.",
          "Ces outils vérifient surtout les mots, pas la finesse d'une ghunna ou d'un allongement. Réciter devant une personne qualifiée, dans la tradition de la transmission orale, reste la meilleure façon de corriger les détails. À noter : l'interface du cours est en français, mais le texte des leçons et des quiz de tajwid est pour l'instant en anglais, avec les exemples en arabe et leur audio.",
        ],
        links: [["/reciters", "Choisir un récitateur"], ["/quran", "S'entraîner sur une sourate"]],
      },
    ],
    stepsTitle: "Un ordre d'étude conseillé",
    steps: [
      { title: "Lisez avec fluidité", body: "Le tajwid se travaille mieux quand les lettres et les voyelles sont familières : terminez d'abord les bases du cours de lecture." },
      { title: "Commencez par les makharij", body: "Consacrez une semaine aux points d'articulation, en particulier aux lettres de la gorge et aux lettres emphatiques." },
      { title: "Lettres épaisses, lettres fines, lam solaire", body: "Apprenez à distinguer les lettres prononcées avec épaisseur de celles prononcées finement, puis le lam solaire et le lam lunaire." },
      { title: "Noun sakina, tanwin et mim sakina", body: "Prenez un cas par jour et cherchez-le dans les sourates courtes que vous récitez." },
      { title: "Qalqala et madd", body: "Ajoutez le rebond des cinq lettres de la qalqala, puis tenez les deux temps de l'allongement naturel." },
      { title: "Pauses et Al-Fatiha complète", body: "Terminez par les règles de pause et de reprise, puis récitez Al-Fatiha en appliquant tout ce que vous avez vu." },
    ],
    faqTitle: "Questions fréquentes sur le tajwid",
    faq: [
      { q: "Le tajwid est-il obligatoire ?", a: "Son statut est présenté différemment selon les écoles. On distingue en général les erreurs qui altèrent un mot ou son sens, à éviter, et les raffinements de la récitation. Pour une réponse adaptée à votre situation, interrogez une personne qualifiée de votre école." },
      { q: "Peut-on apprendre le tajwid seul ?", a: "On peut apprendre les règles seul, avec des leçons, de l'audio et des exercices. Pour corriger finement la prononciation, réciter de temps en temps devant une personne qualifiée reste précieux." },
      { q: "Combien de temps pour apprendre le tajwid ?", a: "Les règles de base se comprennent en quelques semaines de travail régulier ; les appliquer sans y penser demande des mois de récitation. Cela dépend de votre lecture de départ et du temps consacré, et nous ne donnons pas de durée garantie." },
      { q: "Tajwid : par où commencer ?", a: "Par une lecture fluide, puis les points d'articulation. Viennent ensuite les lettres épaisses et fines, le noun et le mim sakina, la qalqala et le madd. Le cours du site suit cet ordre." },
      { q: "Les leçons de tajwid sont-elles en français ?", a: "L'interface s'affiche en français, mais le texte des leçons et des quiz est pour l'instant en anglais. Les exemples du Coran sont en arabe, avec leur audio, et s'écoutent quelle que soit la langue de l'explication." },
      { q: "Quel récitateur écouter pour le tajwid ?", a: "Une récitation lente et très articulée aide le plus au début. Mahmoud Khalil Al-Husary est souvent conseillé aux débutants pour cette raison ; comparez quelques voix sur la page des récitateurs et gardez celle que vous suivez le mieux." },
      { q: "Le tajwid aide-t-il à mémoriser ?", a: "Souvent, oui. Une récitation régulière et précise se retient plus facilement qu'un texte appris avec une prononciation hésitante, et vous n'aurez pas à corriger plus tard ce que vous avez mémorisé." },
    ],
    linksTitle: "Poursuivre l'apprentissage",
    links: [["/tajweed", "Leçons de tajwid"], ["/tajweed/practice", "Exercices"], ["/tajweed/makharij", "Makharij"], ["/reciters", "Récitateurs"], ["/reciter-path", "Parcours du récitateur"], ["/arabic", "Arabe du Coran"], ["/memorize-quran", "Mémoriser le Coran"], ["/guides/tajweed-for-beginners", "Guide du tajwid (en anglais)"]],
    cta: ["/tajweed", "Commencer les leçons"],
  },

  "memorize-quran": {
    title: "Mémoriser le Coran (hifz) : méthode et révision",
    description: "Une méthode concrète pour mémoriser le Coran : petites portions, méthode Shams, révision quotidienne et répétition espacée. Gratuit.",
    kicker: "Hifz",
    h1: "Mémoriser le Coran : une méthode concrète et un plan de révision",
    intro: "Mémoriser le Coran est un projet à la portée de nombreuses personnes, à condition d'avoir une méthode claire et de réviser régulièrement. Ce guide présente un plan de hifz concret pour les débutants et les adultes : par où commencer, combien apprendre chaque jour, comment organiser la révision et comment la méthode Shams vous accompagne verset par verset.",
    answer: "Pour mémoriser le Coran durablement, on apprend chaque jour une petite portion avec l'audio d'un récitateur, on la récite de mémoire, puis on la révise à intervalles croissants ; la révision compte autant que la nouvelle leçon. La plupart des débutants commencent par Al-Fatiha et le juz amma, les courtes sourates 78 à 114. Sur le site gratuit de Quran Masterclass, la méthode Shams guide chaque verset en sept étapes et un planning de révision fait revenir chaque verset au bon moment ; l'application iOS utilise le même compte.",
    sections: [
      {
        h2: "Mémoriser le Coran plus facilement : la règle des petites portions",
        p: [
          "Il n'existe pas de raccourci, mais certaines façons de faire rendent l'effort plus léger. La première consiste à travailler de petites portions : quelques versets bien ancrés valent mieux qu'une page vite oubliée.",
          "La seconde consiste à partir d'une lecture juste. Avant de mémoriser, assurez-vous de lire correctement le passage et d'en connaître les règles de tajwid de base, sinon vous mémoriserez aussi vos erreurs. Choisissez un récitateur posé et gardez la même voix pour toute une sourate : la mélodie devient un repère pour la mémoire.",
        ],
        links: [["/tajweed-online", "Les bases du tajwid"], ["/reciters", "Choisir un récitateur"]],
      },
      {
        h2: "La méthode Shams, verset par verset",
        p: [
          "Conçue par Nami Shams, la méthode Shams guide chaque verset en sept étapes. Vous écoutez d'abord le verset trois fois en regardant le texte, puis vous le reconstruisez à rebours, du dernier mot vers le premier, pour que chaque répétition se termine sur une partie déjà connue. Viennent ensuite le mot à mot, le sens du verset avec des ancrages mémoriels, et le tafsir.",
          "La sixième étape efface le texte peu à peu : vous ne voyez plus que la première lettre de chaque mot, puis plus rien, et vous récitez de mémoire avant de vous évaluer honnêtement. La septième vous invite à écrire une courte réflexion personnelle, car ce qui a du sens se retient mieux. Sur le site, la méthode est gratuite.",
        ],
        links: [["/shams/method", "Les sept étapes"], ["/shams", "La méthode Shams"], ["/shams/adab", "L'adab de l'étude"]],
      },
      {
        h2: "Plan de hifz pour débutants",
        p: [
          "La page des plans propose quatre parcours sur 365 jours : Doux, pour les débutants et les enfants, Standard, Intensif, et le parcours hafiz pour un hifz à plein temps. Dans chacun, la quantité quotidienne de nouveaux versets commence petite et augmente par paliers. Si des versets des jours précédents restent en attente, le plan vous demande de les rattraper avant d'en ajouter.",
          "Pour le point de départ, on choisit souvent Al-Fatiha puis le juz amma, en remontant depuis An-Nas jusqu'à An-Naba. Viennent ensuite le juz Tabarak (sourates 67 à 77) et des sourates aimées comme Ya-Sin, Al-Mulk ou Al-Kahf. L'Académie suit cette progression, avec un test chronométré à la fin de chaque leçon.",
        ],
        links: [["/plan", "Choisir un plan"], ["/guides/juz-amma-learning-plan", "Plan juz amma (en anglais)"], ["/academy", "L'Académie"]],
      },
      {
        h2: "Sabaq, sabqi, manzil : les trois portions du jour",
        p: [
          "Les enseignants traditionnels du hifz organisent chaque journée autour de trois portions : le sabaq, la nouvelle leçon du jour ; le sabqi, ce qui a été appris ces derniers jours ; le manzil, tout ce qui a été mémorisé auparavant, révisé à tour de rôle. Ce découpage évite le piège classique qui consiste à avancer vite en laissant s'effacer ce qui est derrière.",
          "Quran Masterclass reprend cette structure. La page Aujourd'hui affiche d'abord les versets à réviser, puis les nouveaux versets de votre plan, et propose ensuite de réciter les versets du jour à la suite de ceux de la veille, sans regarder. Le soir, une dernière écoute des versets du jour aide à les fixer.",
        ],
        links: [["/today", "Le programme du jour"]],
      },
      {
        h2: "Comment réviser le Coran pour ne pas oublier",
        p: [
          "La répétition espacée consiste à revoir un verset juste avant qu'il ne s'efface : d'abord après quelques jours, puis après des semaines et des mois. Après chaque récitation de mémoire, vous vous évaluez (à revoir, bien ou facile) et un modèle de mémoire calcule la prochaine date de révision. Vous ne travaillez ainsi que ce qui en a besoin.",
          "Sur la page d'une sourate, le mode Mémoriser masque la moitié ou la totalité des mots ; vous récitez, puis vous affichez le verset pour vérifier. Avec plusieurs sourates apprises, la révision prend naturellement la plus grande part du temps : c'est normal.",
        ],
        links: [["/quran", "Ouvrir une sourate"], ["/khatm", "Planificateur de khatm"]],
      },
      {
        h2: "Versets similaires : éviter les confusions",
        p: [
          "Certains versets se ressemblent presque mot pour mot et ne diffèrent que par un terme ou une tournure. Dans le contexte du hifz, on les appelle mutashabihat, et ils sont une source classique d'erreurs : on part d'une sourate et l'on termine dans une autre.",
          "L'entraîneur de versets similaires les regroupe pour les comparer côte à côte. Repérez le mot qui change, rattachez chaque version à sa sourate et à ce qui l'entoure, et révisez ces groupes plus souvent que le reste.",
        ],
        links: [["/shams/mutashabihat", "Versets similaires"]],
      },
      {
        h2: "Comment mémoriser le Coran quand on travaille",
        p: [
          "Avec un emploi du temps chargé, attachez chaque portion à un moment fixe : le nouveau verset le matin, quand l'esprit est reposé, l'écoute pendant le trajet, la révision le soir. Les jours difficiles, gardez une version minimale, par exemple la seule révision des versets dus : vous ne perdez pas le fil.",
          "Pour l'écoute, la radio propose des stations par sourate et une station Juz du jour ; sur la page d'une sourate, une plage de versets peut tourner en boucle. L'application iOS ajoute des rappels et la radio en arrière-plan, avec le même compte que sur le site.",
        ],
        links: [["/radio", "Radio Coran"], ["/app", "Application iOS"]],
      },
    ],
    stepsTitle: "Un cycle quotidien simple",
    steps: [
      { title: "Révisez d'abord", body: "Commencez par les versets que votre planning vous demande de revoir, avant toute nouvelle portion." },
      { title: "Écoutez la nouvelle portion", body: "Écoutez chaque nouveau verset au moins trois fois en suivant le texte arabe." },
      { title: "Reconstruisez à rebours", body: "Répétez le dernier mot, puis les deux derniers, et ainsi de suite jusqu'au verset entier." },
      { title: "Comprenez le sens", body: "Lisez la traduction et le mot à mot pour savoir ce que vous récitez." },
      { title: "Récitez de mémoire", body: "Masquez le texte, récitez, puis évaluez-vous honnêtement pour que le prochain rappel tombe au bon moment." },
      { title: "Enchaînez et réécoutez", body: "Récitez les versets du jour à la suite de ceux de la veille, puis réécoutez-les le soir." },
    ],
    faqTitle: "Questions fréquentes sur le hifz",
    faq: [
      { q: "Combien de versets mémoriser par jour ?", a: "Il n'y a pas de chiffre universel. Pour débuter, quelques versets bien révisés valent mieux qu'une page vite oubliée. Les plans du site commencent avec une petite quantité et l'augmentent progressivement ; si les révisions s'accumulent, ralentissez plutôt que d'ajouter." },
      { q: "Combien de temps pour mémoriser tout le Coran ?", a: "Cela dépend du temps disponible, de la régularité et de la révision. Le parcours hafiz du site est conçu pour couvrir le Coran en un an environ, à un rythme de plein temps : c'est un rythme exigeant, pas une promesse. Les autres parcours avancent plus doucement." },
      { q: "Peut-on mémoriser le Coran quand on est adulte ?", a: "Oui. Beaucoup d'adultes mémorisent des sourates entières grâce à la régularité ; prévoyez simplement plus de temps pour la révision." },
      { q: "Faut-il un professeur ?", a: "Un enseignant aide à corriger la récitation et reste recommandé pour un projet de hifz complet. Pour commencer, l'audio, la méthode Shams et un planning de révision permettent déjà d'avancer sérieusement." },
      { q: "Que faire quand on oublie ce qu'on a mémorisé ?", a: "C'est normal. Reprenez la portion, réécoutez-la, récitez-la de nouveau et évaluez-la « à revoir » : elle reviendra plus vite. Si un passage vous échappe souvent, vérifiez s'il ressemble à un autre verset." },
      { q: "Faut-il comprendre ce que l'on mémorise ?", a: "Ce n'est pas une condition, mais le sens aide la mémoire : il donne un fil à l'ordre des mots et rend la révision plus vivante. La traduction et le tafsir sont disponibles à côté de chaque verset." },
      { q: "Quelle est la meilleure heure pour mémoriser le Coran ?", a: "Le moment où vous êtes calme et disponible. Beaucoup préfèrent le matin, après la prière de l'aube, pour les nouveaux versets, et le soir pour la révision. Le plus important est de garder un horaire stable." },
      { q: "La méthode Shams est-elle gratuite ?", a: "Oui sur le site. Dans l'application iOS, Al-Fatiha et le juz amma s'apprennent gratuitement avec la méthode Shams, et les autres sourates font partie d'un abonnement facultatif. Avec un seul compte, votre progression est la même partout." },
    ],
    linksTitle: "Outils et lectures utiles",
    links: [["/shams", "Méthode Shams"], ["/plan", "Plans de mémorisation"], ["/today", "Programme du jour"], ["/shams/mutashabihat", "Versets similaires"], ["/academy", "Académie"], ["/khatm", "Khatm"], ["/listen-quran", "Écouter le Coran"], ["/guides/how-to-memorize-the-quran", "Guide du hifz (en anglais)"]],
    cta: ["/shams", "Découvrir la méthode Shams"],
  },

  "quran-radio": {
    title: "Radio Coran en ligne : stations, usages et conseils",
    description: "Radio Coran en ligne gratuite : Coran complet, juz amma, thèmes ou une sourate, récitateur au choix et minuterie de sommeil. Comment bien l'utiliser.",
    kicker: "Écoute continue",
    h1: "Radio Coran en ligne : écouter la récitation en continu",
    intro: "La radio Coran en ligne de Quran Masterclass enchaîne la récitation sans interruption, sourate après sourate, avec le texte et la traduction à l'écran si vous le souhaitez. Ce guide présente les stations, le choix du récitateur et les meilleures façons d'utiliser la radio pour l'écoute de fond, le repos, la révision ou l'apprentissage.",
    answer: "Une radio Coran est une lecture continue de la récitation : vous choisissez une station, par exemple le Coran complet, le juz amma ou une sourate seule, et la récitation s'enchaîne sans que vous ayez à intervenir. Sur Quran Masterclass, la radio est gratuite et sans publicité, avec choix du récitateur sur le site, minuterie de sommeil et affichage du texte et de la traduction ; elle reste gratuite dans l'application iOS, qui utilise le même compte. Pour mémoriser, elle complète l'écoute verset par verset d'une sourate précise, sans la remplacer.",
    sections: [
      {
        h2: "Comment fonctionne la radio Coran du site",
        p: [
          "Ce n'est pas une station FM qui diffuse le même programme pour tout le monde : la radio lit la récitation sur votre appareil, à partir de la station que vous choisissez, et passe d'un verset à l'autre puis d'une sourate à l'autre sans intervention. Vous pouvez revenir au verset précédent, passer au suivant ou sauter à la sourate suivante.",
          "Sur le site, la lecture continue pendant que vous naviguez d'une page à l'autre, et selon votre appareil, les commandes apparaissent aussi sur l'écran de verrouillage. La liste des stations écoutées récemment permet de reprendre en un geste, et un bouton ouvre la sourate en cours pour la lire en entier.",
        ],
        links: [["/radio", "Ouvrir la radio"]],
      },
      {
        h2: "Des stations pour chaque moment",
        p: [
          "Les stations principales couvrent le Coran complet, des sourates 1 à 114 puis de nouveau depuis le début, le juz amma, le juz Tabarak, le juz Qad Sami'a, une sourate au hasard, et la station Juz du jour, qui fait entendre chaque jour l'une des trente parties pour parcourir le Coran en trente jours.",
          "Les stations thématiques regroupent des sourates : Pour les enfants, Avant de dormir (As-Sajda, Al-Mulk et les trois dernières sourates), Vendredi avec Al-Kahf, Histoires des prophètes, Réconfort avec Ad-Duha, Ash-Sharh et Yusuf, ou encore Ramadan. Vous pouvez aussi écouter une seule sourate en boucle, comme Al-Kahf, Ya-Sin, Ar-Rahman, Al-Waqi'a ou Al-Baqara.",
        ],
        links: [["/surah/18", "Sourate Al-Kahf"], ["/surah/36", "Sourate Ya-Sin"], ["/surah/55", "Sourate Ar-Rahman"]],
      },
      {
        h2: "Radio Coran avec récitateur au choix",
        p: [
          "Choisissez la voix qui vous accompagne : le récitateur se change à tout moment depuis la radio. Les stations Voix variées font l'inverse : chaque sourate y est récitée par un récitateur différent, ce qui permet de découvrir des styles que vous ne connaissiez pas.",
          "Pour apprendre, mieux vaut garder une seule voix pendant un certain temps, car la mélodie sert de repère à la mémoire. La page des récitateurs vous aide à comparer les styles avant de choisir, et le parcours Masar al-Qurra propose d'étudier de près le style des grands maîtres.",
        ],
        links: [["/reciters", "Comparer les récitateurs"], ["/mishary", "Le style des grands maîtres"]],
      },
      {
        h2: "Écouter la radio Coran en arrière-plan ou avant de dormir",
        p: [
          "Au travail, en voiture ou à la maison, la radio peut rester en fond pendant que vous faites autre chose. Le soir, la minuterie de sommeil arrête la lecture après le nombre de minutes choisi, et la station Avant de dormir réunit des sourates souvent récitées à ce moment.",
          "Sur iPhone, l'application iOS permet d'écouter la radio en arrière-plan, avec le même compte que sur le site. Par respect pour la récitation, beaucoup préfèrent baisser le son ou faire une pause pendant une conversation.",
        ],
        links: [["/app", "Application iOS"]],
      },
      {
        h2: "Peut-on apprendre le Coran en écoutant la radio ?",
        p: [
          "L'écoute passive familiarise l'oreille avec la langue, le rythme et la mélodie de la récitation, et vous fait reconnaître des passages avec le temps. Elle ne remplace pas l'apprentissage actif : pour lire ou mémoriser, il faut suivre le texte, répéter et réciter soi-même.",
          "Une bonne combinaison consiste à écouter le matin la sourate que vous apprenez, grâce à une station de sourate seule, puis à la travailler le soir sur sa page, en mode Apprendre, verset par verset. Quand vous pouvez regarder l'écran, l'affichage du texte et de la traduction dans la radio aide à rester attentif.",
        ],
        links: [["/listen-quran", "Écouter verset par verset"], ["/memorize-quran", "Mémoriser le Coran"]],
      },
      {
        h2: "Radio Coran pour réviser un hifz",
        p: [
          "Si vous avez mémorisé le juz amma ou quelques sourates, la radio devient un outil de révision : choisissez la station correspondante et récitez en même temps que le récitateur, ou essayez d'anticiper le verset suivant avant qu'il ne commence.",
          "Quand un passage vous échappe, notez-le et retravaillez-le sur la page de la sourate. La révision active de la page Aujourd'hui reste la base ; la radio la complète en multipliant les occasions d'entendre ce que vous savez déjà.",
        ],
        links: [["/today", "Révisions du jour"], ["/surah/78", "Sourate An-Naba"]],
      },
    ],
    stepsTitle: "Utiliser la radio au quotidien",
    steps: [
      { title: "Choisissez une station selon le moment", body: "Le Coran complet pour l'écoute de fond, le Juz du jour pour avancer, une sourate seule pour réviser." },
      { title: "Gardez une voix pour apprendre", body: "Changez de récitateur pour découvrir, mais conservez la même voix pour les sourates que vous mémorisez." },
      { title: "Affichez le texte quand vous le pouvez", body: "Quelques minutes d'écoute en suivant le texte et la traduction apportent souvent plus qu'une heure en fond." },
      { title: "Réglez la minuterie le soir", body: "Choisissez la station Avant de dormir et une durée de minuterie pour que la lecture s'arrête d'elle-même." },
      { title: "Alternez avec un travail ciblé", body: "Un jour sur deux, ouvrez la sourate écoutée sur sa page et travaillez-la verset par verset." },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "La radio Coran est-elle en direct 24h/24 ?", a: "Elle tourne sans interruption tant que vous la laissez ouverte, mais ce n'est pas un programme diffusé à heure fixe : la récitation est lue sur votre appareil à partir de la station choisie. Vous pouvez donc la lancer à n'importe quelle heure." },
      { q: "La radio Coran est-elle gratuite et sans publicité ?", a: "Oui. L'écoute est gratuite sur le site, sans publicité et sans inscription obligatoire." },
      { q: "Peut-on écouter la radio Coran en arrière-plan sur téléphone ?", a: "Dans l'application iOS, oui, la radio continue en arrière-plan. Dans un navigateur mobile, cela dépend du système et du navigateur : la lecture peut s'interrompre quand l'écran se verrouille." },
      { q: "Peut-on choisir le récitateur ?", a: "Oui, le récitateur se choisit dans la radio et peut être changé à tout moment. Les stations Voix variées donnent au contraire un récitateur différent à chaque sourate." },
      { q: "Peut-on apprendre le Coran en écoutant la radio ?", a: "La radio entraîne l'oreille et aide à réviser ce que l'on sait déjà. Pour apprendre un nouveau passage, il faut l'écouter verset par verset sur la page de la sourate, le répéter et le réciter de mémoire." },
      { q: "Quelle station écouter avant de dormir ?", a: "La station Avant de dormir réunit As-Sajda, Al-Mulk et les trois dernières sourates du Coran. Associez-la à la minuterie de sommeil pour que la lecture s'arrête automatiquement." },
      { q: "La radio fonctionne-t-elle sans connexion ?", a: "Non, la radio a besoin d'internet. Pour écouter hors connexion, enregistrez une sourate depuis sa page : elle se lit ensuite sans réseau. Dans l'application, le nombre de sourates hors connexion gratuites est limité." },
    ],
    linksTitle: "Autres façons d'écouter",
    links: [["/radio", "Radio Coran"], ["/reciters", "Récitateurs"], ["/quran", "Sourates avec audio"], ["/listen-quran", "Écouter le Coran en ligne"], ["/prayer", "Horaires de prière"], ["/app", "Application iOS"], ["/memorize-quran", "Mémoriser le Coran"]],
    cta: ["/radio", "Ouvrir la radio Coran"],
  },

  "listen-quran": {
    title: "Écouter le Coran en ligne : sourates en audio",
    description: "Écoutez le Coran en ligne par sourate ou verset par verset, choisissez votre récitateur et suivez avec la traduction. Un guide pour bien écouter.",
    kicker: "Audio",
    h1: "Écouter le Coran en ligne, sourate par sourate",
    intro: "Pour écouter le Coran en ligne, il suffit de choisir une sourate et un récitateur : chacune des 114 sourates s'écoute verset par verset ou en continu, avec le texte arabe, la translittération et la traduction française. Ce guide vous aide à choisir une voix, à écouter avec attention et à faire de l'écoute un véritable outil d'apprentissage.",
    answer: "Sur Quran Masterclass, vous pouvez écouter gratuitement les 114 sourates du Coran, verset par verset ou en continu, avec le récitateur de votre choix, en suivant le texte arabe, la translittération et la traduction. La vitesse se règle, chaque verset peut être répété et une plage de versets peut tourner en boucle, ce qui aide à apprendre la prononciation et à mémoriser. Sur le site, une sourate peut aussi être enregistrée pour l'écoute hors connexion, et l'application iOS utilise le même compte.",
    sections: [
      {
        h2: "Écouter le Coran par sourate ou verset par verset",
        p: [
          "Chaque sourate a sa page avec l'audio de chaque verset. En mode Apprendre, la lecture s'arrête après chaque verset et attend que vous appuyiez sur Continuer : idéal pour répéter. En mode Continu, la sourate s'enchaîne du début à la fin. Vous pouvez aussi aller directement à un verset, et le juz, le hizb et la page du mushaf sont indiqués.",
          "Deux affichages sont proposés : la vue par versets, avec la translittération et la traduction sous chaque verset, et un mode lecture plus proche d'une page du mushaf. La taille du texte arabe se règle pour lire confortablement sur téléphone comme sur ordinateur.",
        ],
        links: [["/quran", "Les 114 sourates"], ["/surah/1", "Commencer par Al-Fatiha"]],
      },
      {
        h2: "Quel récitateur écouter pour apprendre",
        p: [
          "Pour apprendre, privilégiez une récitation posée (murattal), claire et régulière. Mahmoud Khalil Al-Husary est souvent conseillé aux débutants pour son articulation ; Mohamed Siddiq Al-Minshawi et Abdul Basit Abdus Samad sont proposés dans leur récitation murattal, et Mishary Rashid Alafasy a une voix que beaucoup trouvent facile à suivre. Avec ces récitateurs, le mot récité s'illumine pendant l'écoute.",
          "Comparez deux ou trois voix sur la même courte sourate, puis gardez celle que vous suivez le mieux. Pour l'écoute de détente, choisissez simplement la voix qui vous apaise. Si la récitation vous passionne, le parcours Masar al-Qurra propose d'étudier phrase par phrase le style des grands maîtres.",
        ],
        links: [["/reciters", "Les récitateurs"], ["/mishary", "Le style des grands maîtres"]],
      },
      {
        h2: "Écouter le Coran en suivant le texte",
        p: [
          "Écouter en suivant le texte relie le son à l'écriture. Si vous apprenez à lire l'arabe, c'est un excellent exercice : l'œil suit le mot qui s'illumine pendant que l'oreille confirme la prononciation. Gardez la translittération visible au début, puis masquez-la dès que vous reconnaissez les lettres.",
          "La traduction française sous chaque verset vous permet de comprendre au fil de l'écoute. Quand un verset vous arrête, ouvrez son tafsir ou ajoutez-le à vos favoris pour y revenir ; vous pouvez aussi écrire une note personnelle attachée au verset.",
        ],
        links: [["/arabic/read", "Exercices de lecture"], ["/quran-tafsir", "Comprendre avec le tafsir"]],
      },
      {
        h2: "Écouter le Coran pour apprendre la prononciation",
        p: [
          "Ralentissez la vitesse de lecture pour entendre chaque son, et activez la répétition de chaque verset. Concentrez-vous sur une difficulté à la fois, par exemple une lettre de la gorge ou un allongement, plutôt que sur tout le verset.",
          "Pour vous comparer, enregistrez-vous sur le même verset puis réécoutez votre enregistrement à côté de celui du récitateur. Les leçons de tajwid expliquent les règles que vous entendez ; celle sur les points d'articulation est un bon point de départ.",
        ],
        links: [["/tajweed-online", "Le tajwid en ligne"], ["/tajweed/makharij", "Les makharij"]],
      },
      {
        h2: "Écouter le Coran en boucle pour mémoriser",
        p: [
          "Pour mémoriser, faites tourner en boucle une plage de versets, par exemple les cinq premiers versets d'une sourate, plusieurs fois avant de commencer à réciter. L'oreille prépare le travail : quand vous essayez ensuite de réciter, le passage vous est déjà familier.",
          "Passez ensuite au mode Mémoriser, qui masque la moitié ou la totalité des mots, ou à la méthode Shams pour un apprentissage verset par verset. Réécouter les versets du jour le soir, avant de dormir, est une habitude simple qui aide à les garder.",
        ],
        links: [["/memorize-quran", "Mémoriser le Coran"], ["/shams", "La méthode Shams"]],
      },
      {
        h2: "Écouter le Coran sur iPhone, hors connexion ou en continu",
        p: [
          "L'application iOS reprend l'écoute verset par verset avec le même compte que le site : favoris, notes et progression vous suivent d'un appareil à l'autre. Elle ajoute la radio en arrière-plan et les rappels.",
          "Pour écouter sans connexion, enregistrez une sourate depuis sa page : ses fichiers audio sont conservés sur l'appareil ; dans l'application, le nombre de sourates hors connexion gratuites est limité. Et si vous voulez simplement une récitation continue sans choisir chaque sourate, la radio enchaîne les sourates par station.",
        ],
        links: [["/app", "Application iOS"], ["/radio", "Radio Coran"]],
      },
      {
        h2: "Comment bien écouter le Coran",
        p: [
          "La tradition islamique accorde une grande valeur à l'écoute attentive de la récitation. Sans en faire une règle, prévoyez de temps en temps quelques minutes d'écoute sans autre activité : téléphone posé, texte et traduction sous les yeux.",
          "Choisissez une courte sourate, écoutez-la une fois pour le son, une fois en suivant la traduction, puis notez un verset qui vous a marqué. Ce petit rituel transforme une écoute de fond en moment d'attention.",
        ],
        links: [["/surah/93", "Sourate Ad-Duha"], ["/duas", "Invocations du Coran"]],
      },
    ],
    stepsTitle: "Écouter efficacement",
    steps: [
      { title: "Choisissez une sourate courte", body: "Commencez par une sourate que vous connaissez un peu, comme Al-Fatiha ou une sourate du juz amma." },
      { title: "Sélectionnez un récitateur", body: "Comparez deux ou trois voix et gardez celle que vous suivez le mieux." },
      { title: "Suivez le texte", body: "Gardez les yeux sur le mot qui s'illumine et sur la traduction." },
      { title: "Répétez verset par verset", body: "Passez en mode Apprendre et répétez à voix haute après chaque verset." },
      { title: "Mettez en boucle ce que vous apprenez", body: "Faites tourner les versets du jour en boucle, puis réécoutez-les le soir." },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Peut-on télécharger le Coran en MP3 ?", a: "Le site ne propose pas de fichiers MP3 à télécharger un par un. Vous pouvez en revanche enregistrer une sourate depuis sa page pour l'écouter hors connexion ; elle reste disponible dans le navigateur ou dans l'application." },
      { q: "Faut-il créer un compte pour écouter le Coran ?", a: "Non, l'écoute est libre. Un compte gratuit sert à garder vos favoris, vos notes et votre progression, et à les retrouver dans l'application iOS." },
      { q: "Quel récitateur choisir pour débuter ?", a: "Une récitation lente et très articulée, comme celle d'Al-Husary, est facile à répéter. Comparez quelques voix sur la page des récitateurs et gardez celle qui vous convient." },
      { q: "Peut-on écouter le Coran avec la traduction française ?", a: "Oui, la traduction française s'affiche sous chaque verset pendant la récitation arabe, avec la translittération si vous le souhaitez. La traduction n'est pas lue à voix haute : l'audio est la récitation en arabe." },
      { q: "Peut-on ralentir la récitation ?", a: "Oui, la vitesse se règle dans le lecteur de chaque sourate. Une vitesse un peu plus lente aide à entendre chaque son quand on apprend la prononciation." },
      { q: "Comment écouter une sourate en boucle ?", a: "Dans les réglages du lecteur, activez la répétition de chaque verset ou choisissez une plage de versets à répéter, du verset de départ au verset de fin." },
      { q: "Peut-on écouter le Coran sur iPhone ?", a: "Oui, sur le site depuis Safari, ou dans l'application iOS, qui utilise le même compte et ajoute la radio en arrière-plan." },
    ],
    linksTitle: "À explorer",
    links: [["/quran", "Les 114 sourates"], ["/reciters", "Récitateurs"], ["/radio", "Radio Coran"], ["/mishary", "Masar al-Qurra"], ["/reciter-path", "Parcours du récitateur"], ["/khatm", "Planificateur de khatm"], ["/app", "Application iOS"], ["/learn-quran", "Apprendre le Coran"]],
    cta: ["/quran", "Choisir une sourate"],
  },

  "tawbah": {
    title: "Tawba : comment revenir vers Allah, pas à pas",
    description: "Un guide doux et pratique de la tawba : reprendre la prière, les ablutions et les invocations, et apprendre à votre rythme. Sans jugement.",
    kicker: "Un nouveau départ",
    h1: "Tawba : revenir vers Allah, pas à pas",
    intro: "La tawba, le retour sincère vers Allah, n'est pas réservée à ceux qui ont déjà tout réglé : elle commence souvent par une intention discrète et un premier geste simple. Si vous vous sentez loin de la prière, du Coran ou de la religion, ce guide vous propose des étapes concrètes, sans jugement, et vous indique où trouver de l'aide sur le site.",
    answer: "Dans l'enseignement islamique, la tawba désigne le retour sincère vers Allah : regretter, se détourner de ce qui éloigne, demander pardon et reprendre le chemin, avec l'espoir en Sa miséricorde. En pratique, beaucoup commencent par une prière, une demande de pardon avec leurs propres mots et quelques minutes de Coran par jour. Quran Masterclass propose les outils de ces premiers pas gratuitement sur son site, l'application iOS utilisant le même compte, mais ne rend pas d'avis : pour une question personnelle, adressez-vous à un imam ou à un savant de confiance de votre école.",
    sections: [
      {
        h2: "Tawba et istighfar : de quoi parle-t-on ?",
        p: [
          "Le mot tawba signifie revenir. Il désigne le retour du croyant vers Allah après s'être éloigné, que ce soit par une faute précise, par négligence ou simplement par oubli. L'istighfar, la demande de pardon, en est l'expression la plus courante : la demande de pardon regarde ce qui a été fait, le retour regarde le chemin qui reprend.",
          "En islam, ce retour se fait directement auprès d'Allah, sans intermédiaire ni cérémonie. Une sourate entière porte le nom At-Tawba (9), et la fin de la sourate Al-Furqan (25), qui décrit les serviteurs du Tout Miséricordieux, évoque aussi le repentir. Vous pouvez les lire avec leur traduction et leur tafsir, à votre rythme.",
        ],
        links: [["/surah/9", "Sourate At-Tawba"], ["/surah/25", "Sourate Al-Furqan"]],
      },
      {
        h2: "Je veux me rapprocher d'Allah : par où commencer ?",
        p: [
          "Inutile d'attendre la motivation parfaite. Choisissez un seul geste pour aujourd'hui, assez petit pour être sûr de le tenir : une prière, une invocation, cinq minutes d'écoute du Coran. Demain, refaites le même geste. La constance d'un petit pas compte plus que l'élan d'un jour.",
          "Selon votre situation, le point de départ change. Si vous avez arrêté de prier, commencez par les ablutions et une prière par jour. Si vous vous sentez loin sans bien savoir pourquoi, commencez par l'écoute et les invocations. Si vous voulez comprendre votre religion, commencez par le Coran avec sa traduction. Avec le temps, ces chemins se rejoignent.",
        ],
        links: [["/learn-salah", "Apprendre la salat"], ["/listen-quran", "Écouter le Coran"], ["/learn-islam", "Les bases de l'islam"]],
      },
      {
        h2: "Comment reprendre la prière après l'avoir abandonnée",
        p: [
          "Si vous avez oublié les gestes, l'entraîneur d'ablutions et l'entraîneur de prière présentent chaque étape, dans la forme sunnite et dans la forme ja'farite, avec le texte arabe, la translittération et le sens. Vous pouvez les répéter autant de fois que nécessaire, sans témoin et sans jugement.",
          "Les horaires de prière du jour et la direction de la qibla sont calculés pour votre position, et vous pouvez activer un rappel à chaque heure de prière. La question des prières manquées relève du fiqh : les écoles n'y répondent pas toutes de la même manière, posez-la à un imam de confiance. L'article sur la reprise de la prière, plus bas, propose un chemin sur quatre semaines.",
        ],
        links: [["/wudu", "Entraîneur d'ablutions"], ["/salah", "Entraîneur de prière"], ["/prayer", "Horaires et qibla"]],
      },
      {
        h2: "Invocations de pardon à connaître",
        p: [
          "Vous pouvez parler à Allah en français, avec vos mots, à tout moment. Pour trouver des formulations, la page des invocations du Coran consacre un thème au pardon et à la miséricorde : vous y trouverez notamment l'invocation d'Adam et de son épouse, dans la sourate Al-A'raf (7), et celle de Yunus, dans la sourate Al-Anbiya (21), avec le texte arabe, la traduction et l'audio.",
          "Le générateur de dua vous aide à composer une invocation personnelle à partir de ce que vous avez sur le cœur, et la page des 99 noms d'Allah permet de découvrir, un nom à la fois, ceux qui parlent de pardon et de miséricorde. Apprendre une seule invocation par semaine suffit pour commencer.",
        ],
        links: [["/duas", "Invocations du Coran"], ["/dua-generator", "Écrire sa dua"], ["/islam/names", "Les 99 noms d'Allah (en anglais)"]],
      },
      {
        h2: "Revenir au Coran sans pression",
        p: [
          "Il n'y a ni test d'entrée ni niveau minimum. Écouter une courte sourate en suivant la traduction peut suffire pour renouer. La radio propose une station Réconfort avec Ad-Duha, Ash-Sharh et Yusuf, des sourates qui parlent d'épreuve et d'espoir.",
          "Si vous ne lisez pas l'arabe, le cours de lecture part des lettres, et rien ne vous empêche d'écouter en attendant. Quand vous vous sentirez prêt, un petit plan quotidien vous aidera à garder le lien.",
        ],
        links: [["/surah/94", "Sourate Ash-Sharh"], ["/radio", "Radio Coran"], ["/arabic", "Apprendre à lire l'arabe"]],
      },
      {
        h2: "Comment rester constant après la tawba",
        p: [
          "La constance se construit avec des repères. Attachez votre geste quotidien à un moment fixe et laissez la page Aujourd'hui vous montrer ce qui reste à faire, sans vous juger sur ce qui ne l'a pas été. Un khatm sur soixante jours, quatre-vingt-dix jours ou un an donne une portion quotidienne modeste, recalculée si vous prenez du retard.",
          "Il y aura des jours sans. Ces jours-là, gardez une version minimale : une invocation, un verset. Et si vous retombez dans ce que vous vouliez quitter, revenez encore : l'enseignement islamique invite à revenir autant de fois que nécessaire plutôt qu'à abandonner.",
        ],
        links: [["/today", "Le programme du jour"], ["/khatm", "Planificateur de khatm"]],
      },
      {
        h2: "Quand demander conseil à un imam ou à un savant",
        p: [
          "Certaines questions dépassent un guide général : ce qu'il faut réparer envers d'autres personnes, les prières ou les jeûnes manqués, une situation familiale ou financière précise. Les réponses dépendent de votre situation et de l'école que vous suivez. Ce site ne rend pas d'avis : adressez-vous à un imam ou à un savant de confiance, discret, de votre tradition.",
          "Si la culpabilité devient écrasante ou si vous traversez une détresse profonde, parlez-en aussi à un médecin ou à un professionnel, et en cas d'urgence, appelez les secours. Chercher de l'aide fait partie des moyens que l'on est invité à prendre.",
        ],
        links: [["/islam", "Comprendre l'islam"]],
      },
    ],
    stepsTitle: "Une première semaine possible",
    steps: [
      { title: "Formulez votre intention", body: "Dites à Allah, avec vos mots et dans votre langue, que vous voulez revenir. Aucune formule n'est imposée." },
      { title: "Choisissez une prière à tenir", body: "Prenez celle qui s'insère le plus facilement dans votre journée et gardez-la toute la semaine." },
      { title: "Revoyez les ablutions", body: "Passez quelques minutes avec l'entraîneur, dans la forme de votre école, jusqu'à retrouver l'ordre des gestes." },
      { title: "Ajoutez une invocation de pardon", body: "Choisissez-en une dans le thème Pardon et miséricorde, écoutez-la et répétez-la chaque jour." },
      { title: "Écoutez un peu de Coran", body: "Une courte sourate avec sa traduction, ou quelques minutes de radio, suffit." },
      { title: "Parlez à une personne de confiance", body: "Un proche, un ami ou un imam de votre école peut vous soutenir et répondre aux questions de pratique." },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Comment faire tawba sincèrement ?", a: "En termes généraux, les savants décrivent la tawba sincère par le regret, l'arrêt de la faute, la décision de ne pas y revenir et, quand des droits d'autrui sont en jeu, la réparation. Ce sont des repères d'ensemble ; pour votre cas précis, parlez à un imam ou à un savant de votre école." },
      { q: "Est-il trop tard pour revenir vers Allah ?", a: "L'enseignement islamique présente la porte du retour comme ouverte à quiconque se tourne sincèrement vers Allah, quel que soit son passé. Ce site ne se prononce pas sur des situations individuelles, mais chacun peut faire un premier pas dès aujourd'hui." },
      { q: "Comment demander pardon à Allah ?", a: "Avec vos propres mots, dans votre langue, à tout moment. Vous pouvez aussi apprendre des invocations de pardon tirées du Coran, avec leur texte arabe, leur traduction et leur audio, sur la page des invocations." },
      { q: "Comment recommencer à prier après des années ?", a: "Commencez petit : revoyez les ablutions, apprenez ou réapprenez Al-Fatiha, puis tenez une prière par jour avant d'en ajouter d'autres. Pour les prières manquées, demandez à un imam de votre école ce qui s'applique à vous." },
      { q: "Je me sens loin d'Allah, que faire ?", a: "Ce sentiment est fréquent et ne signifie pas que la porte est fermée. Choisissez un geste simple et régulier, une invocation, quelques versets, une prière, et entourez-vous de personnes qui vous soutiennent. La proximité se reconstruit souvent pas à pas." },
      { q: "Peut-on redevenir pratiquant progressivement ?", a: "Comme méthode d'apprentissage, avancer par étapes aide beaucoup de personnes à tenir dans la durée. Cela ne dit rien du statut des obligations, qui relève de votre école : demandez conseil à une personne qualifiée et commencez par ce que vous pouvez faire aujourd'hui." },
      { q: "Ce site s'adresse-t-il aux sunnites et aux chiites ?", a: "Oui. Les entraîneurs de prière et d'ablutions existent dans la forme sunnite et dans la forme ja'farite, et les contenus restent neutres entre les écoles. Suivez ce qui correspond à l'école que vous pratiquez." },
    ],
    linksTitle: "Pour continuer",
    links: [["/duas", "Invocations du Coran"], ["/dua-generator", "Écrire sa dua"], ["/islam/names", "99 noms d'Allah (en anglais)"], ["/wudu", "Ablutions"], ["/salah", "Prière"], ["/prayer", "Horaires de prière"], ["/quran", "Coran"], ["/learn-islam", "Découvrir l'islam"]],
    cta: ["/learn-salah", "Reprendre la prière pas à pas"],
  },

  "learn-salah": {
    title: "Comment prier pour débutants : apprendre la salat",
    description: "Apprenez la salat en débutant : préparation, étapes de la prière, ce qu'on récite et comment en faire une habitude. Leçons et horaires gratuits.",
    kicker: "Prière",
    h1: "Comment prier : apprendre la salat pour débutants",
    intro: "Apprendre la salat quand on débute demande surtout un ordre clair : se préparer, connaître les positions, savoir ce que l'on récite, puis en faire une habitude. Ce guide suit ce chemin pas à pas, pour les nouveaux musulmans comme pour ceux qui reprennent, avec un entraîneur de prière gratuit dans la forme sunnite et dans la forme ja'farite (chiite).",
    answer: "Pour apprendre la salat, on commence par la préparation (les ablutions, l'heure de la prière et la direction de la qibla), puis on apprend les positions dans l'ordre, debout, inclinaison, prosternation et assise, avec les formules récitées à chaque étape, dont la sourate Al-Fatiha. Les prières obligatoires comptent deux unités (rakats) pour le fajr, trois pour le maghrib et quatre pour le dhuhr, l'asr et l'isha. Sur Quran Masterclass, l'entraîneur de prière présente les cinq prières pas à pas, dans la forme sunnite et dans la forme ja'farite, gratuitement sur le site ; l'application iOS utilise le même compte.",
    sections: [
      {
        h2: "Par quoi commencer pour apprendre la prière",
        p: [
          "La salat s'apprend mieux dans un ordre précis : d'abord les ablutions, puis l'heure de la prière et la direction de la qibla, ensuite les positions, puis Al-Fatiha et les autres formules, et enfin la prière complète.",
          "Choisissez dès le départ la forme que vous allez apprendre, sunnite ou ja'farite, selon l'école que vous suivez ou celle de votre famille. L'entraîneur du site présente les deux sans les mélanger, et ses notes signalent les points où les écoles sunnites diffèrent entre elles.",
        ],
        links: [["/learn-wudu", "Apprendre le wudu"], ["/salah", "Entraîneur de prière"]],
      },
      {
        h2: "Préparation avant la prière",
        p: [
          "Avant de prier, on vérifie son état de pureté, le plus souvent par les ablutions, et dans certains cas par un bain rituel complet (ghusl), dont les conditions sont détaillées par chaque école. On prie avec des vêtements propres, dans un endroit propre, en couvrant le corps selon les règles de son école, avec l'intention de la prière que l'on accomplit.",
          "La page des horaires calcule les cinq prières pour votre position, directement sur votre appareil et sans suivi, et indique la direction de la qibla ; sur téléphone, une boussole en direct vous aide à vous orienter. Comparez au besoin avec votre mosquée locale, et activez un rappel pour chaque heure de prière.",
        ],
        links: [["/prayer", "Horaires et qibla"], ["/wudu", "Entraîneur d'ablutions"]],
      },
      {
        h2: "Comment prier étape par étape",
        p: [
          "Chaque unité de prière suit le même schéma : debout, on récite Al-Fatiha, suivie dans les deux premières unités d'une autre sourate ou de quelques versets, puis on s'incline (ruku), on se redresse et l'on se prosterne deux fois (sujud), avec une courte assise entre les deux. La prière s'ouvre par le takbir. Après la deuxième unité, on s'assoit pour le tashahhud ; dans les prières de trois ou quatre unités, on se relève ensuite pour les unités restantes, et la prière se termine par le tashahhud final et la salutation.",
          "Selon les traditions, certains détails changent : la position des mains, l'invocation du qunut, la prosternation sur une surface naturelle dans la forme ja'farite. L'entraîneur montre chaque position, la formule en arabe, sa translittération et son sens, et précise ce qui se récite à voix haute ou à voix basse.",
        ],
        links: [["/salah", "La prière pas à pas"], ["/surah/1", "Sourate Al-Fatiha"]],
      },
      {
        h2: "Combien de rakats pour chaque prière",
        p: [
          "Les cinq prières obligatoires comptent deux unités pour le fajr, quatre pour le dhuhr, quatre pour l'asr, trois pour le maghrib et quatre pour l'isha. S'y ajoutent des prières surérogatoires, recommandées avant ou après certaines d'entre elles, dont le nombre est précisé par chaque école.",
          "Dans la pratique chiite, il est courant de réunir le dhuhr et l'asr, puis le maghrib et l'isha, ce qui fait trois moments de prière par jour pour cinq prières. Dans la pratique sunnite, chaque prière est en général accomplie à son heure, le regroupement étant réservé à certaines situations selon les écoles.",
        ],
        links: [["/islam/prayer-sunni", "La prière chez les sunnites"], ["/islam/prayer-shia", "La prière chez les chiites"]],
      },
      {
        h2: "Comment prier si on ne parle pas arabe",
        p: [
          "Les formules de la prière se récitent en arabe, mais on peut les apprendre sans parler la langue : l'audio donne la prononciation, la translittération aide à lire, la traduction en donne le sens. Commencez par Al-Fatiha, puis une sourate très courte comme Al-Ikhlas (112) ou Al-Kawthar (108).",
          "Que faire pendant la période où l'on apprend encore ? Les écoles donnent des indications sur ce point : posez la question à une personne qualifiée plutôt que d'attendre d'avoir tout mémorisé. Le cours de lecture de l'arabe, suivi en parallèle, rendra peu à peu la translittération inutile.",
        ],
        links: [["/surah/112", "Sourate Al-Ikhlas"], ["/surah/108", "Sourate Al-Kawthar"], ["/arabic", "Apprendre à lire l'arabe"]],
      },
      {
        h2: "Installer l'habitude de prier cinq fois par jour",
        p: [
          "Comme méthode d'apprentissage, beaucoup commencent par une ou deux prières bien tenues avant d'ajouter les autres ; l'objectif reste, selon votre école, l'ensemble des prières du jour. Rattachez chaque prière à un repère : le réveil, la pause de midi, le retour à la maison.",
          "Laissez un tapis ou une serviette propre toujours au même endroit, activez les rappels de la page des horaires et, pour le fajr, couchez-vous un peu plus tôt. Après la prière, une courte invocation tirée du Coran prolonge le moment sans l'alourdir.",
        ],
        links: [["/duas", "Invocations du Coran"], ["/today", "Prochaine prière et tâches du jour"]],
      },
      {
        h2: "Erreurs courantes des débutants dans la prière",
        p: [
          "La plus fréquente est la précipitation : enchaîner les positions sans marquer d'arrêt. Les savants insistent sur le calme dans chaque position ; prenez le temps de vous immobiliser un instant avant de passer à la suivante. Autres erreurs courantes : prier avant le début de l'heure, perdre le compte des unités, réciter si vite que les mots se déforment.",
          "Si vous vous trompez pendant la prière, les écoles prévoient des façons de réparer, comme les prosternations de l'oubli, avec des détails différents. Ce site n'émet pas d'avis : demandez à une personne qualifiée, et ne laissez pas la peur de l'erreur vous empêcher de prier.",
        ],
        links: [["/tawbah", "Revenir à la prière"], ["/learn-islam", "Découvrir l'islam"]],
      },
    ],
    stepsTitle: "Votre première prière, pas à pas",
    steps: [
      { title: "Vérifiez l'heure et la qibla", body: "Ouvrez les horaires de votre position et repérez la direction de la qibla." },
      { title: "Faites vos ablutions", body: "Suivez l'ordre des gestes avec l'entraîneur, dans la forme de votre école." },
      { title: "Choisissez votre forme de prière", body: "Dans l'entraîneur, sélectionnez la forme sunnite ou ja'farite et la prière à apprendre." },
      { title: "Apprenez Al-Fatiha à l'oreille", body: "Écoutez-la verset par verset, répétez après le récitateur et lisez la traduction." },
      { title: "Répétez les positions à blanc", body: "Parcourez l'entraîneur plusieurs fois en faisant les gestes, avant votre première vraie prière." },
      { title: "Priez, puis ajoutez une prière à la fois", body: "Commencez par la prière la plus simple dans votre journée et ajoutez la suivante quand elle est stable." },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Combien de rakats pour chaque prière ?", a: "Pour les prières obligatoires : deux pour le fajr, quatre pour le dhuhr, quatre pour l'asr, trois pour le maghrib et quatre pour l'isha. Les prières surérogatoires s'y ajoutent selon votre école." },
      { q: "Comment prier quand on ne parle pas arabe ?", a: "On apprend les formules en arabe avec l'audio et la translittération, et on comprend leur sens grâce à la traduction. Pour savoir ce qui est requis pendant que vous apprenez, demandez à une personne qualifiée de votre école." },
      { q: "Comment prier quand on ne connaît pas la sourate Al-Fatiha ?", a: "Commencez par l'apprendre : elle ne compte que sept versets, et l'audio verset par verset permet de la répéter facilement. En attendant, ce que vous pouvez réciter dépend de votre école ; posez la question à un imam plutôt que de reporter la prière." },
      { q: "Prière chiite et sunnite : quelles différences ?", a: "Les deux traditions partagent les cinq prières, leur nombre d'unités et l'essentiel des gestes. Les différences portent notamment sur la position des mains, le qunut, la surface de prosternation et le regroupement des prières. L'entraîneur et les pages dédiées présentent chaque forme sans les opposer." },
      { q: "Comment connaître la direction de la qibla ?", a: "La page des horaires de prière indique la direction de la qibla depuis votre position, par rapport au nord géographique. Sur téléphone, vous pouvez activer une boussole en direct." },
      { q: "Que faire si je me trompe en priant ?", a: "Les écoles prévoient des moyens de réparer certaines erreurs, avec des règles différentes. Ce site n'émet pas d'avis juridique ; posez la question à une personne qualifiée de votre école." },
      { q: "Peut-on apprendre à prier seul, à la maison ?", a: "Oui, l'entraîneur permet d'apprendre chez soi, à son rythme. Prier une fois à côté d'une personne de confiance, ou lui demander de vous regarder, aide souvent à corriger un geste que l'écrit décrit mal." },
      { q: "Comment installer l'habitude de prier ?", a: "Rattachez chaque prière à un repère fixe, activez les rappels et ajoutez une prière à la fois. Un jour manqué n'efface pas ce qui a été construit." },
    ],
    linksTitle: "Ressources",
    links: [["/salah", "Prière pas à pas"], ["/wudu", "Entraîneur d'ablutions"], ["/prayer", "Horaires de prière"], ["/islam/prayer-sunni", "Prière sunnite"], ["/islam/prayer-shia", "Prière chiite"], ["/surah/1", "Sourate Al-Fatiha"], ["/duas", "Invocations"], ["/learn-wudu", "Guide du wudu"]],
    cta: ["/salah", "Ouvrir l'entraîneur de prière"],
  },

  "learn-wudu": {
    title: "Comment faire le wudu étape par étape : guide",
    description: "Apprenez à faire le wudu dans le bon ordre, avec les erreurs courantes à éviter et un entraîneur. Écrit pour les débutants et les nouveaux musulmans.",
    kicker: "Purification",
    h1: "Faire le wudu étape par étape : le guide des ablutions",
    intro: "Faire le wudu étape par étape devient vite naturel quand on connaît l'ordre des gestes et ce qui varie d'une école à l'autre. Ce guide explique la préparation, l'enchaînement des ablutions dans la forme sunnite et dans la forme ja'farite (chiite), les erreurs fréquentes des débutants, et comment vous entraîner avec l'entraîneur interactif du site.",
    answer: "Le wudu, ou ablutions, est la purification par l'eau accomplie avant la prière : après l'intention, on lave le visage et les bras jusqu'aux coudes, on passe la main mouillée sur la tête, puis on lave ou on essuie les pieds selon l'école, en respectant l'ordre. La forme sunnite et la forme ja'farite partagent ce schéma mais diffèrent notamment sur le nombre de lavages, le sens du lavage des bras et les pieds, lavés dans l'une et essuyés dans l'autre. L'entraîneur de Quran Masterclass, gratuit sur le site, présente les deux formes étape par étape, avec un quiz sur l'ordre ; l'application iOS utilise le même compte.",
    sections: [
      {
        h2: "Avant de commencer : intention, eau et calme",
        p: [
          "Le wudu commence par l'intention, formulée dans le cœur : on fait ses ablutions pour Allah, en vue de la prière, sans avoir besoin de la prononcer à voix haute. Dans la forme sunnite, on dit ensuite « Bismillah », un geste recommandé, que l'école hanbalite tient pour obligatoire quand on y pense.",
          "Prévoyez une eau propre, un endroit où vous pouvez prendre votre temps, et retirez ce qui empêcherait l'eau d'atteindre la peau sur les parties à laver. Utilisez l'eau sans gaspiller : un filet d'eau suffit pour chaque geste.",
        ],
        links: [["/learn-salah", "La suite : apprendre la salat"]],
      },
      {
        h2: "L'ordre des ablutions dans la forme sunnite",
        p: [
          "Dans la forme sunnite courante, on lave d'abord les mains jusqu'aux poignets, puis on se rince la bouche et le nez, gestes recommandés que l'école hanbalite rattache au visage et tient pour obligatoires. Viennent ensuite les gestes obligatoires : laver le visage, de la naissance des cheveux au menton et d'une oreille à l'autre ; laver les bras jusqu'aux coudes inclus, le droit puis le gauche ; passer la main mouillée sur la tête ; laver les pieds jusqu'aux chevilles incluses, le droit puis le gauche, sans oublier l'espace entre les orteils. Passer les doigts mouillés sur les oreilles est recommandé.",
          "Laver chaque partie une fois suffit, et la laver trois fois est la sunna. Les écoles chaféite et hanbalite tiennent l'ordre pour obligatoire, les écoles hanafite et malikite pour recommandé ; la part de la tête à essuyer varie aussi d'une école à l'autre. On termine par une invocation après les ablutions.",
        ],
        links: [["/islam/prayer-sunni", "La prière chez les sunnites"]],
      },
      {
        h2: "L'ordre des ablutions dans la forme ja'farite",
        p: [
          "Dans la forme ja'farite, on peut commencer par laver les mains et se rincer la bouche et le nez, gestes recommandés. On lave ensuite le visage, de haut en bas, puis le bras droit et le bras gauche, chacun du coude vers le bout des doigts et non l'inverse.",
          "On essuie ensuite le devant de la tête avec l'humidité qui reste sur la main droite, sans reprendre d'eau, puis le dessus des pieds, des orteils jusqu'à la cheville, le droit puis le gauche ; l'étendue exacte dépend du marja' que l'on suit. Un lavage est obligatoire, un deuxième est permis, un troisième ne l'est pas. L'ordre et l'enchaînement sans interruption sont obligatoires.",
        ],
        links: [["/islam/prayer-shia", "La prière chez les chiites"]],
      },
      {
        h2: "Erreurs courantes dans le wudu",
        p: [
          "Les oublis les plus fréquents concernent les bords : les coudes, les chevilles, l'arrière du talon, l'espace entre les doigts et les orteils, la limite du visage près des cheveux et des oreilles. Prenez l'habitude de vérifier ces zones, surtout au début.",
          "Autres erreurs courantes : aller trop vite, inverser l'ordre des gestes, laisser couler l'eau sans arrêt. À l'inverse, certains doutent sans cesse et recommencent plusieurs fois ; si le doute devient envahissant, apprenez bien l'ordre, faites-lui confiance, et parlez-en à un imam.",
        ],
        links: [["/wudu", "S'entraîner à l'ordre des gestes"]],
      },
      {
        h2: "Ce qui annule le wudu",
        p: [
          "Les écoles citent toutes plusieurs causes, comme aller aux toilettes, émettre des gaz ou un sommeil profond qui fait perdre conscience. D'autres cas sont débattus entre les écoles, et leur détail relève du fiqh de celle que vous suivez.",
          "Ce site présente les ablutions sans rendre d'avis juridique. Pour un cas particulier, une situation médicale ou un doute répété, adressez-vous à une personne qualifiée de votre école.",
        ],
        links: [["/learn-islam", "Les bases de l'islam"]],
      },
      {
        h2: "Faut-il refaire ses ablutions avant chaque prière ?",
        p: [
          "En règle générale, tant que les ablutions n'ont pas été annulées, elles restent valables pour plusieurs prières. Beaucoup renouvellent toutefois leur wudu avant une prière, ce que de nombreux savants considèrent comme recommandé.",
          "La question des chaussettes revient souvent : les écoles sunnites admettent, sous conditions, l'essuyage sur des chaussons de cuir (khuff) enfilés en état de pureté, et divergent sur les chaussettes ordinaires ; dans l'école ja'farite, on essuie en principe le pied lui-même. Pour votre situation, voyez une personne qualifiée.",
        ],
        links: [["/prayer", "Horaires de prière"]],
      },
      {
        h2: "S'entraîner avec l'entraîneur de wudu",
        p: [
          "L'entraîneur interactif montre chaque étape sur une illustration, avec le nombre de fois, le côté droit puis gauche, et une étiquette qui précise si le geste est obligatoire ou recommandé : fard et sunna, ou wajib et mustahabb dans la forme ja'farite. Il donne aussi l'invocation qui suit les ablutions, avec le texte arabe, la translittération et le sens.",
          "À la fin, un quiz vous demande de remettre les gestes dans l'ordre et signale les erreurs. Refaites-le quelques jours de suite : l'enchaînement devient vite naturel, et vous pourrez passer à l'entraîneur de prière.",
        ],
        links: [["/wudu", "Ouvrir l'entraîneur"], ["/salah", "Entraîneur de prière"]],
      },
    ],
    stepsTitle: "S'entraîner en quelques jours",
    steps: [
      { title: "Choisissez votre forme", body: "Dans l'entraîneur, sélectionnez la forme sunnite ou ja'farite selon l'école que vous suivez." },
      { title: "Parcourez les étapes sans eau", body: "Suivez une première fois l'enchaînement à l'écran pour vous en faire une image claire." },
      { title: "Faites le quiz de l'ordre", body: "Remettez les gestes dans l'ordre et revoyez ceux qui vous ont fait hésiter." },
      { title: "Pratiquez avec de l'eau", body: "Faites le wudu calmement en suivant l'ordre appris, en vérifiant coudes, chevilles et talons." },
      { title: "Apprenez l'invocation finale", body: "Lisez-la avec la translittération et le sens, puis répétez-la jusqu'à la connaître." },
      { title: "Répétez quelques jours", body: "Refaites l'enchaînement chaque jour jusqu'à ce qu'il devienne naturel, puis passez à la prière." },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Quel est l'ordre du wudu ?", a: "Après l'intention, les étapes principales sont le visage, les bras jusqu'aux coudes, la tête et les pieds, précédées de gestes recommandés pour les mains, la bouche et le nez. Le détail du lavage ou de l'essuyage diffère entre les formes sunnite et ja'farite ; l'entraîneur présente chacune dans son ordre." },
      { q: "Qu'est-ce qui annule le wudu ?", a: "Les écoles citent en commun des causes comme aller aux toilettes, émettre des gaz ou un sommeil profond. D'autres cas varient selon les écoles ; pour une situation particulière, adressez-vous à une personne qualifiée." },
      { q: "Faut-il refaire ses ablutions avant chaque prière ?", a: "En général non, tant qu'elles n'ont pas été annulées. Les renouveler est considéré comme recommandé par de nombreux savants. Les détails relèvent de votre école." },
      { q: "Peut-on faire le wudu avec des chaussettes ?", a: "Les écoles sunnites admettent, sous conditions, l'essuyage sur des chaussons de cuir et divergent sur les chaussettes ordinaires ; l'école ja'farite demande en principe d'essuyer le pied lui-même. Demandez à une personne qualifiée de votre école." },
      { q: "Combien de temps dure le wudu ?", a: "Quelques minutes, sans se presser. Au début, l'entraîneur aide à retenir l'ordre ; ensuite, les gestes deviennent naturels." },
      { q: "Quelles différences entre le wudu sunnite et chiite ?", a: "Elles portent notamment sur le nombre de lavages, le sens du lavage des bras, la manière d'essuyer la tête et les pieds, lavés dans la forme sunnite et essuyés dans la forme ja'farite. Chaque forme est présentée séparément, sans les opposer." },
      { q: "Comment faire le wudu quand on est nouveau musulman ?", a: "Comme tout le monde : en apprenant l'ordre des gestes avec l'entraîneur, puis en pratiquant quelques jours. Pour les questions propres à la conversion, comme le bain rituel complet (ghusl), parlez à un imam de votre école." },
    ],
    linksTitle: "Poursuivre",
    links: [["/wudu", "Entraîneur de wudu"], ["/salah", "Prière pas à pas"], ["/learn-salah", "Apprendre la salat"], ["/prayer", "Horaires de prière"], ["/islam/prayer-sunni", "Prière sunnite"], ["/islam/prayer-shia", "Prière chiite"], ["/duas", "Invocations"], ["/learn-islam", "Découvrir l'islam"]],
    cta: ["/wudu", "Ouvrir l'entraîneur de wudu"],
  },

  "learn-islam": {
    title: "Découvrir l'islam pour débutants : par où commencer",
    description: "Nouveau dans l'islam ou simplement curieux ? Un guide calme : croyances, Coran, prière, vie quotidienne et apprentissage à votre rythme. Gratuit.",
    kicker: "Pour les curieux et les nouveaux musulmans",
    h1: "Découvrir l'islam pour débutants : par où commencer",
    intro: "Découvrir l'islam pour débutants commence par quelques notions simples avant les détails : en quoi croient les musulmans, ce qu'est le Coran, comment se déroulent la prière et la vie quotidienne. Que vous soyez simplement curieux, en chemin vers la conversion ou nouveau musulman, ce guide vous propose un ordre calme et vous indique où lire, écouter et pratiquer gratuitement sur Quran Masterclass.",
    answer: "L'islam est une religion monothéiste fondée sur la foi en un Dieu unique, Allah, et en Muhammad ﷺ comme Son dernier prophète ; son texte central est le Coran. Pour débuter, on découvre les croyances de base, les piliers de la pratique comme la prière, le jeûne du ramadan et l'aumône, puis la lecture du Coran, à son rythme. Quran Masterclass présente ces bases gratuitement sur son site, pour les traditions sunnite et chiite, sans les opposer ; l'application iOS utilise le même compte.",
    sections: [
      {
        h2: "Qu'est-ce que l'islam ?",
        p: [
          "Le mot islam vient d'une racine arabe liée à la soumission à Dieu et à la paix. Les musulmans croient en un Dieu unique, créateur de toute chose, et en une longue chaîne de prophètes qui comprend notamment Abraham, Moïse et Jésus, Muhammad ﷺ étant le dernier. Le Coran est pour eux la parole d'Allah, révélée au Prophète sur une période d'environ vingt-trois ans.",
          "Les premiers chapitres de la section Islam présentent ces bases en français : ce qu'est l'islam, qui était le Prophète Muhammad ﷺ et ce qu'est le Coran. Ils sont écrits pour quelqu'un qui découvre, sans supposer de connaissances préalables.",
        ],
        links: [["/islam/islam", "Qu'est-ce que l'islam ?"], ["/islam/prophet", "Le Prophète Muhammad"], ["/islam/quran", "Le Coran"]],
      },
      {
        h2: "Les croyances de base en islam",
        p: [
          "Dans la présentation sunnite, la foi (iman) repose sur six piliers : croire en Allah, en Ses anges, en Ses livres révélés, en Ses messagers, au Jour dernier et au décret divin. Dans la présentation chiite, on parle souvent des fondements de la religion : l'unicité de Dieu, Sa justice, la prophétie, l'imamat et la résurrection.",
          "Ces deux façons de présenter la foi se recoupent largement. Pour entrer dans ces notions par un autre chemin, beaucoup aiment découvrir les 99 noms d'Allah, un nom à la fois, avec leur sens : ils montrent comment les musulmans parlent de Dieu.",
        ],
        links: [["/islam/iman", "La foi (en anglais)"], ["/islam/names", "Les 99 noms d'Allah (en anglais)"]],
      },
      {
        h2: "Les piliers de l'islam expliqués simplement",
        p: [
          "Les cinq piliers de l'islam sont, dans la présentation la plus répandue : l'attestation de foi (shahada), la prière cinq fois par jour, l'aumône obligatoire (zakat) sur les biens au-delà d'un certain seuil, le jeûne du mois de ramadan et le pèlerinage à La Mecque (hajj), une fois dans la vie pour qui en a les moyens.",
          "La tradition chiite range ces pratiques parmi les branches de la religion, aux côtés d'autres obligations. Le calendrier islamique du site indique la date hégirienne et les grandes dates de l'année, comme le début du ramadan et les fêtes de l'aïd.",
        ],
        links: [["/calendar", "Calendrier islamique"], ["/islam/ramadan", "Le ramadan (en anglais)"]],
      },
      {
        h2: "Je suis curieux de l'islam : que lire en premier ?",
        p: [
          "Commencez par les chapitres d'introduction, puis écoutez une courte sourate avec sa traduction. Al-Fatiha (1), l'ouverture du Coran, est récitée dans chaque prière ; Al-Ikhlas (112) résume en quelques versets la croyance en un Dieu unique ; Maryam (19) parle de Marie et de Jésus, ce qui intéresse souvent les lecteurs venus d'une autre culture religieuse.",
          "Prenez une page à la fois et notez vos questions. Il n'est pas nécessaire de tout comprendre pour avancer, et certaines notions demandent du temps. Pour les questions de fond, une personne qualifiée et bienveillante, dans une mosquée ou une association, pourra vous répondre de vive voix.",
        ],
        links: [["/surah/112", "Sourate Al-Ikhlas"], ["/surah/19", "Sourate Maryam"], ["/islam", "Toutes les pages sur l'islam"]],
      },
      {
        h2: "Que faire quand on devient musulman ?",
        p: [
          "On devient musulman en prononçant l'attestation de foi avec conviction. Beaucoup choisissent de le faire devant un imam ou des témoins, ce qui facilite aussi l'accompagnement dans les premiers mois. Rien n'oblige ensuite à tout changer en un jour : les priorités sont généralement d'apprendre les ablutions, la prière et la sourate Al-Fatiha.",
          "Le site propose pour cela un entraîneur d'ablutions et un entraîneur de prière, dans la forme sunnite et dans la forme ja'farite, ainsi qu'un cours de lecture de l'arabe qui part des lettres. Pour les questions propres à votre situation, comme le bain rituel ou la vie de famille, rapprochez-vous d'un imam de l'école que vous suivez.",
        ],
        links: [["/learn-salah", "Apprendre la salat"], ["/learn-wudu", "Apprendre le wudu"], ["/arabic", "Lire l'arabe"]],
      },
      {
        h2: "Sunnites et chiites : comprendre calmement",
        p: [
          "Sunnites et chiites partagent le Coran, la foi en un Dieu unique et en Muhammad ﷺ comme dernier prophète, la prière, le jeûne, l'aumône et le pèlerinage. Leurs divergences sont nées de la question de la direction de la communauté après le Prophète, et portent aussi sur certains points de droit et de pratique.",
          "Chaque tradition a ses écoles juridiques : hanafite, malikite, chaféite et hanbalite du côté sunnite ; ja'farite et zaydite du côté chiite ; l'école ibadite forme une tradition distincte. Ce site présente leurs pratiques avec respect, sans les opposer, et vous laisse suivre celle qui est la vôtre.",
        ],
        links: [["/islam/madhahib", "Les écoles juridiques (en anglais)"], ["/islam/prayer-sunni", "Prière sunnite"], ["/islam/prayer-shia", "Prière chiite"]],
      },
      {
        h2: "S'habituer à la vie quotidienne d'un musulman",
        p: [
          "La prière rythme la journée : la page des horaires vous montre les heures pour votre position et la direction de la qibla. Les invocations du Coran, classées par thème, accompagnent les moments du quotidien, et la page sur la vie quotidienne présente les repères principaux en restant neutre entre les écoles.",
          "Ajoutez une pratique à la fois, quand la précédente est installée. Le site est gratuit, disponible en 14 langues, et l'application iOS utilise le même compte, ce qui permet de garder ses favoris et sa progression partout.",
        ],
        links: [["/prayer", "Horaires de prière"], ["/duas", "Invocations du Coran"], ["/islam/daily", "Vie quotidienne (en anglais)"]],
      },
    ],
    stepsTitle: "Un chemin possible sur quelques semaines",
    steps: [
      { title: "Lisez l'introduction", body: "Commencez par les chapitres sur l'islam, le Prophète et le Coran, un par jour." },
      { title: "Écoutez une courte sourate", body: "Choisissez Al-Fatiha ou Al-Ikhlas, écoutez-la plusieurs fois et lisez sa traduction." },
      { title: "Découvrez la prière", body: "Parcourez l'entraîneur d'ablutions et l'entraîneur de prière, sans pression, pour voir comment se déroule une prière." },
      { title: "Repérez les horaires", body: "Consultez les heures de prière de votre ville pour vous familiariser avec le rythme d'une journée." },
      { title: "Apprenez une invocation", body: "Choisissez une invocation courte du Coran et répétez-la pendant une semaine." },
      { title: "Posez vos questions", body: "Pour les sujets de pratique, rapprochez-vous d'une personne qualifiée de l'école que vous suivez." },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Islam pour débutants : par où commencer ?", a: "Par les chapitres d'introduction sur l'islam, le Prophète et le Coran, puis par l'écoute d'une courte sourate avec sa traduction. Viennent ensuite les ablutions et la prière. Prenez une étape à la fois." },
      { q: "Que faire quand on devient musulman ?", a: "Apprendre les ablutions, la prière et la sourate Al-Fatiha, à son rythme, et se rapprocher d'une communauté ou d'un imam pour être accompagné. Ce site aide à apprendre ; il ne remplace pas un accompagnement de personne à personne." },
      { q: "Faut-il parler arabe pour devenir musulman ?", a: "Non. On peut devenir musulman et pratiquer sans parler arabe. Les formules de la prière se récitent en arabe et s'apprennent avec l'audio et la translittération ; leur sens se comprend avec la traduction." },
      { q: "Quelles sont les différences entre sunnites et chiites ?", a: "Les deux traditions partagent l'essentiel de la foi et de la pratique. Elles divergent sur la direction de la communauté après le Prophète et sur certains points de droit et de pratique. Le site présente les deux avec neutralité." },
      { q: "Quels sont les piliers de l'islam ?", a: "Dans la présentation la plus répandue : l'attestation de foi, la prière, l'aumône obligatoire, le jeûne du ramadan et le pèlerinage à La Mecque pour qui en a les moyens. La tradition chiite présente ces pratiques parmi les branches de la religion." },
      { q: "Comment apprendre la prière quand on est nouveau musulman ?", a: "Commencez par les ablutions, puis les positions et Al-Fatiha avec l'entraîneur de prière, et ajoutez les prières progressivement. Pour ce qui est requis pendant l'apprentissage, demandez à un imam de votre école." },
      { q: "Comment commencer à lire le Coran quand on est débutant ?", a: "Écoutez d'abord des sourates courtes avec la traduction française, puis suivez le cours de lecture de l'arabe, qui part des lettres. La translittération aide au début." },
      { q: "Le site est-il gratuit et dans quelles langues ?", a: "Oui, le site est gratuit et sans publicité. Il est disponible en 14 langues, dont le français, et l'application iOS utilise le même compte." },
    ],
    linksTitle: "À lire ensuite",
    links: [["/islam", "Toutes les pages sur l'islam"], ["/islam/islam", "Qu'est-ce que l'islam ?"], ["/islam/prophet", "Le Prophète"], ["/islam/quran", "Le Coran"], ["/calendar", "Calendrier islamique"], ["/islam/names", "99 noms d'Allah (en anglais)"], ["/duas", "Invocations"], ["/learn-quran", "Apprendre le Coran"], ["/how", "Comment ça marche"]],
    cta: ["/islam", "Commencer la découverte"],
  },
};

export default hubs;
