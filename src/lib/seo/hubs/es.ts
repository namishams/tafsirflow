import type { Hub, HubId } from "../types";

const hubs: Record<HubId, Hub> = {
  "learn-quran": {
    title: "Aprender el Corán online gratis, paso a paso",
    description: "Aprenda el Corán desde cero: leer árabe, escuchar aleya por aleya, entender con tafsir y memorizar. Gratis y sin anuncios, en 14 idiomas.",
    kicker: "Guía para empezar",
    h1: "Aprender el Corán online: un camino claro, desde la primera letra",
    intro: "Quien quiere aprender el Corán suele toparse con la misma pregunta: ¿por dónde se empieza? Esta página ordena el camino en etapas sencillas, para que avance a su ritmo y sepa en cada momento qué toca hacer.",
    answer: "Para aprender el Corán conviene avanzar en tres etapas: primero leer el árabe con sus signos de vocalización, después escuchar y repetir con un buen recitador y, por último, entender el significado con la traducción y el tafsir. Quran Masterclass reúne las 114 suras, el audio aleya por aleya, el tajwid y la memorización en un solo lugar, gratis y sin anuncios.",
    sections: [
      {
        h2: "Empiece por leer el árabe, aunque sea despacio",
        p: [
          "Leer el texto árabe es la base de todo lo demás. Al principio basta con reconocer las letras, sus formas al unirse y las vocales cortas y largas. Con unos minutos al día se avanza más de lo que parece.",
          "Si parte de cero, el curso de lectura le lleva de las letras a las palabras sin saltos. Mientras tanto puede seguir cualquier sura con la transliteración al lado."
        ],
        links: [["/arabic/read", "Curso de lectura del árabe"], ["/arabic", "Árabe para el Corán"]]
      },
      {
        h2: "Escuche antes de intentar recitar solo",
        p: [
          "El oído aprende la melodía y la pronunciación mucho antes que la boca. Elija un recitador cuya voz le resulte agradable y escuche una aleya varias veces mirando el texto. Puede repetirla, hacerla más lenta o repetir un pasaje entero.",
          "Cada recitador tiene su ritmo; si uno le resulta rápido, pruebe con otro más pausado."
        ],
        links: [["/reciters", "Recitadores"], ["/quran", "Leer y escuchar el Corán"]]
      },
      {
        h2: "Comprenda lo que lee con traducción y tafsir",
        p: [
          "Leer sin entender cansa pronto. Junto a cada aleya encontrará la traducción, el significado palabra por palabra y el comentario clásico con sus fuentes. Así el estudio pasa de ser mecánico a tener sentido.",
          "El sitio ofrece contenido sunní y chií; en las cuestiones donde las escuelas difieren, tenga en cuenta lo que enseña la escuela que usted sigue."
        ],
        links: [["/quran-tafsir", "Tafsir del Corán"], ["/vocab", "Vocabulario del Corán"]]
      },
      {
        h2: "Mantenga una rutina pequeña pero constante",
        p: [
          "Diez minutos diarios rinden más que dos horas una vez al mes. Elija una hora fija, una sura corta y un objetivo concreto para la semana.",
          "Si le ayuda tener un plan escrito, puede apoyarse en la guía de rutina diaria y en el planificador de jatma."
        ],
        links: [["/guides/daily-quran-routine", "Rutina diaria con el Corán"], ["/khatm", "Planificador de jatma"]]
      }
    ],
    stepsTitle: "Su primer mes, en cinco pasos",
    steps: [
      { title: "Aprenda las letras y las vocales", body: "Dedique la primera semana a reconocer las letras árabes y los signos que indican cómo se pronuncian." },
      { title: "Lea una sura corta con transliteración", body: "Elija una sura breve del final del Corán y léala despacio, aleya por aleya, comprobando con el audio." },
      { title: "Escuche cada día al mismo recitador", body: "Repetir con una misma voz ayuda a fijar la pronunciación y el ritmo." },
      { title: "Lea la traducción y un poco de tafsir", body: "Después de leer una aleya, mire su significado para que el texto deje de ser solo sonido." },
      { title: "Añada tajwid poco a poco", body: "Aprenda una regla por semana y practíquela en las aleyas que ya conoce." }
    ],
    faqTitle: "Preguntas frecuentes sobre aprender el Corán",
    faq: [
      { q: "¿Se puede aprender el Corán sin saber árabe?", a: "Sí. Se empieza por las letras y las vocales, y mientras tanto se puede seguir el texto con transliteración, traducción y audio. Entender el idioma lleva más tiempo, pero leer y escuchar es posible desde el primer día." },
      { q: "¿Cuánto se tarda en aprender a leer el Corán?", a: "Depende de la constancia y del punto de partida. Muchas personas leen con soltura básica tras algunas semanas de práctica diaria, pero la fluidez y el tajwid se afianzan con meses de práctica." },
      { q: "¿Necesito un profesor?", a: "Un profesor cualificado es de gran ayuda, sobre todo para corregir la pronunciación. Una plataforma puede acompañarle y darle práctica diaria, pero no sustituye a una persona que escuche su recitación." },
      { q: "¿Es gratis Quran Masterclass?", a: "Sí. La web es gratuita y no tiene anuncios ni cuotas. La app de iOS usa la misma cuenta." },
      { q: "¿Sirve también para niños?", a: "Hay un modo para niños con colores grandes, botones sencillos y estrellas como premio. Aun así, es recomendable que un adulto acompañe el aprendizaje." },
      { q: "¿Está disponible en español?", a: "Sí, la interfaz y la traducción están disponibles en español y en otros trece idiomas." }
    ],
    linksTitle: "Siga explorando",
    links: [["/quran", "Leer y escuchar el Corán"], ["/arabic/read", "Curso de lectura del árabe"], ["/tajweed", "Lecciones de tajwid"], ["/courses", "Cursos"], ["/guides/how-to-learn-the-quran", "Guía: cómo aprender el Corán"], ["/guides/learn-to-read-the-quran", "Guía: aprender a leer el Corán"], ["/plan", "Plan de estudio"], ["/app", "App para iOS"]],
    cta: ["/quran", "Empezar a leer y escuchar"]
  },

  "quran-tafsir": {
    title: "Tafsir del Corán en español: leer aleya por aleya",
    description: "Lea el tafsir del Corán junto a cada aleya, con traducción y significado palabra por palabra. Aprenda a entender el texto con calma. Gratis.",
    kicker: "Comprender el Corán",
    h1: "Tafsir del Corán: entender cada aleya junto a su explicación",
    intro: "El tafsir es la explicación del Corán: el contexto, el sentido de las palabras y lo que los sabios han enseñado sobre cada pasaje. Aquí puede leer el tafsir del Corán al mismo tiempo que escucha la aleya.",
    answer: "El tafsir es la rama del conocimiento islámico que explica el significado del Corán. A diferencia de una traducción, que traslada las palabras a otro idioma, el tafsir añade contexto, aclara términos y recoge la comprensión de los sabios. En Quran Masterclass el comentario aparece al lado de la aleya, con su fuente.",
    sections: [
      {
        h2: "Qué aporta el tafsir que no da una traducción",
        p: [
          "Una traducción es necesaria, pero a veces insuficiente: una palabra árabe puede abarcar varios matices y el contexto histórico cambia la lectura. El tafsir ayuda a resolver esas dudas.",
          "Por eso conviene leer ambos: la traducción para tener el sentido general y el tafsir para profundizar."
        ],
        links: [["/quran", "Leer el Corán con traducción"], ["/vocab", "Vocabulario del Corán"]]
      },
      {
        h2: "Cómo leer el tafsir de una aleya",
        p: [
          "Escuche primero la aleya y lea su traducción. Después abra el comentario y fíjese en tres cosas: a quién o a qué se refiere, en qué circunstancias fue revelada y qué conclusiones prácticas extraen los sabios.",
          "No hace falta leerlo todo de una vez. Una aleya al día, bien entendida, se recuerda mejor que una página leída a toda prisa."
        ],
        links: [["/guides/understanding-the-quran-tafsir", "Guía: entender el Corán con tafsir"], ["/shams/method", "El método Shams"]]
      },
      {
        h2: "Distintas escuelas, distintas lecturas",
        p: [
          "Los comentarios clásicos proceden de distintas tradiciones y no siempre coinciden. Quran Masterclass ofrece contenido sunní y chií y no toma partido: cuando una cuestión es objeto de diferencia, consulte lo que establece la escuela que usted sigue.",
          "Este sitio es una herramienta de estudio; no emite dictámenes jurídicos."
        ],
        links: [["/islam/madhahib", "Las escuelas jurídicas"], ["/islam/quran", "El Corán en el islam"]]
      }
    ],
    stepsTitle: "Cómo estudiar una sura con tafsir",
    steps: [
      { title: "Elija una sura corta", body: "Empezar por una sura breve permite terminarla y ver el conjunto." },
      { title: "Escuche y lea la traducción", body: "Hágase una idea general del mensaje antes de entrar en los detalles." },
      { title: "Lea el comentario de cada aleya", body: "Avance aleya por aleya y anote lo que le llame la atención." },
      { title: "Fíjese en las palabras clave", body: "Use el significado palabra por palabra para reconocer términos que se repiten." },
      { title: "Repase al día siguiente", body: "Resuma en una frase lo que aprendió; es la mejor forma de fijarlo." }
    ],
    faqTitle: "Preguntas frecuentes sobre el tafsir",
    faq: [
      { q: "¿Qué significa tafsir?", a: "Es la palabra árabe para la explicación o interpretación del Corán. Abarca el sentido de las palabras, el contexto de la revelación y los comentarios de los sabios." },
      { q: "¿En qué se diferencia de la traducción?", a: "La traducción pasa el texto a otro idioma; el tafsir explica su significado y su contexto. Lo ideal es usar los dos." },
      { q: "¿Hay tafsir en español?", a: "Sí, la plataforma muestra el comentario junto a la aleya con traducción disponible en español. El alcance de cada fuente puede variar de una sura a otra." },
      { q: "¿Se puede entender el Corán solo con el tafsir?", a: "Ayuda mucho, pero el tafsir no sustituye al estudio con un docente cualificado cuando se trata de cuestiones jurídicas o doctrinales." },
      { q: "¿El sitio ofrece tafsir sunní y chií?", a: "Ofrece contenido de ambas tradiciones. En las diferencias, remítase a la escuela que usted sigue." },
      { q: "¿Es gratis?", a: "Sí, la lectura del tafsir en la web es gratuita y no requiere pago." }
    ],
    linksTitle: "Enlaces útiles",
    links: [["/quran", "El Corán con traducción"], ["/surah/1", "Sura Al-Fatiha"], ["/surah/112", "Sura Al-Ijlas"], ["/guides/understanding-the-quran-tafsir", "Guía de tafsir"], ["/vocab", "Vocabulario del Corán"], ["/shams", "Método Shams"], ["/islam/quran", "Qué es el Corán"], ["/search", "Buscar en el Corán"]],
    cta: ["/quran", "Abrir el Corán con tafsir"]
  },

  "tajweed-online": {
    title: "Aprender tajwid online gratis: reglas y práctica",
    description: "Aprenda tajwid paso a paso: puntos de articulación, madd, qalqala, nun sakin y mim sakin. Lecciones y práctica para recitar el Corán mejor.",
    kicker: "Recitación",
    h1: "Aprender tajwid online: las reglas para recitar el Corán con corrección",
    intro: "El tajwid es el conjunto de reglas que indica cómo pronunciar cada letra y cada prolongación al recitar. Si desea aprender tajwid online, aquí encontrará lecciones ordenadas y ejercicios para aplicarlas.",
    answer: "El tajwid reúne las normas de pronunciación y de duración de las letras del Corán. Se aprende mejor combinando teoría breve, escucha de un buen recitador y práctica repetida. Quran Masterclass ofrece lecciones de tajwid con ejemplos y una sección de práctica, gratis.",
    sections: [
      {
        h2: "Empiece por el lugar de cada letra",
        p: [
          "Antes de las reglas de enlace, conviene saber desde dónde sale cada sonido: la garganta, la lengua, los labios y la cavidad nasal. Se llaman makharij y son la base de una pronunciación limpia.",
          "Practique con pocas letras a la vez y compárese con el audio."
        ],
        links: [["/tajweed/makharij", "Los makharij"], ["/tajweed", "Todas las lecciones"]]
      },
      {
        h2: "Las reglas más frecuentes",
        p: [
          "Algunas reglas aparecen en casi cada página: el alargamiento (madd), la qalqala, la nun sakin y el tanwin, y la mim sakin. Dominar estas cinco áreas ya mejora mucho la recitación.",
          "Cada lección explica la regla con ejemplos y le invita a reconocerla en el texto."
        ],
        links: [["/tajweed/madd", "Madd"], ["/tajweed/qalqalah", "Qalqala"], ["/tajweed/nun-sakinah-izhar", "Nun sakin y tanwin"], ["/tajweed/mim-sakinah", "Mim sakin"]]
      },
      {
        h2: "Practique con aleyas reales",
        p: [
          "La regla solo se asienta cuando se aplica. Use la sección de práctica y recite aleyas que ya conozca, atendiendo a una regla a la vez.",
          "Un maestro cualificado puede detectar errores que ni usted ni una aplicación notan; si es posible, combine ambas cosas."
        ],
        links: [["/tajweed/practice", "Práctica de tajwid"], ["/guides/tajweed-for-beginners", "Guía: tajwid para principiantes"]]
      }
    ],
    stepsTitle: "Plan de tajwid en cinco pasos",
    steps: [
      { title: "Conozca los puntos de articulación", body: "Aprenda de dónde sale cada letra con una lección corta al día." },
      { title: "Estudie el madd", body: "Distinga las vocales largas y las prolongaciones más comunes." },
      { title: "Añada la qalqala", body: "Identifique las letras que rebotan al quedar en sukun." },
      { title: "Aprenda nun sakin y mim sakin", body: "Son las reglas que más cambian el sonido de un pasaje." },
      { title: "Recite y compare", body: "Grábese, escuche al recitador y busque diferencias." }
    ],
    faqTitle: "Preguntas frecuentes sobre el tajwid",
    faq: [
      { q: "¿Qué es el tajwid?", a: "Es el conjunto de reglas para pronunciar bien las letras del Corán y respetar la duración de las vocales y los sonidos." },
      { q: "¿Se puede aprender tajwid sin profesor?", a: "Se puede aprender la teoría y practicar solo, pero un docente cualificado corrige errores sutiles. Lo ideal es combinar ambos." },
      { q: "¿Cuánto tarda en aprenderse?", a: "Las reglas básicas pueden estudiarse en pocas semanas, pero aplicarlas con naturalidad requiere meses de práctica." },
      { q: "¿Por dónde empiezo?", a: "Por los puntos de articulación y por el madd; después, qalqala, nun sakin y mim sakin." },
      { q: "¿Hace falta saber árabe?", a: "No para empezar. Basta con leer las letras, aunque entender el idioma ayuda a reconocer las reglas." },
      { q: "¿Es gratis?", a: "Sí, las lecciones y la práctica en la web son gratuitas." }
    ],
    linksTitle: "Lecciones y recursos",
    links: [["/tajweed", "Lecciones de tajwid"], ["/tajweed/practice", "Práctica"], ["/tajweed/makharij", "Makharij"], ["/tajweed/madd", "Madd"], ["/tajweed/qalqalah", "Qalqala"], ["/reciters", "Recitadores para escuchar"], ["/arabic/read", "Curso de lectura"], ["/guides/tajweed-for-beginners", "Tajwid para principiantes"]],
    cta: ["/tajweed", "Ver las lecciones de tajwid"]
  },

  "memorize-quran": {
    title: "Memorizar el Corán: método, rutina y repaso",
    description: "Cómo memorizar el Corán con un método por pasos: escuchar, construir hacia atrás, palabra por palabra y repasar a tiempo. Gratis, con repaso espaciado.",
    kicker: "Hifz",
    h1: "Memorizar el Corán: un método que cuida también el repaso",
    intro: "Memorizar el Corán no es solo aprender una aleya hoy, sino conservarla mañana y el año que viene. Por eso este método une aprendizaje nuevo y repaso planificado.",
    answer: "Para memorizar el Corán de forma duradera conviene dividir cada aleya en partes pequeñas, repetirla en voz alta, entender su significado y repasarla con intervalos crecientes. El método Shams de Quran Masterclass lo organiza en pasos y avisa de qué repasar cada día. Es gratis.",
    sections: [
      {
        h2: "El método Shams, paso a paso",
        p: [
          "Se empieza escuchando la aleya con el texto delante, sin traducir todavía. Después se construye desde el final: primero la última palabra, luego las dos últimas, y así hasta completar la aleya.",
          "A continuación se estudia palabra por palabra, se lee el significado, se consulta el tafsir y se recita con pistas que van desapareciendo hasta hacerlo de memoria."
        ],
        links: [["/shams", "Método Shams"], ["/shams/method", "Cómo funciona el método"]]
      },
      {
        h2: "El repaso es la mitad del trabajo",
        p: [
          "Lo que no se repasa se olvida. El repaso espaciado muestra cada aleya justo cuando empieza a debilitarse, así que le dice qué repasar hoy sin que usted tenga que llevar la cuenta.",
          "Si falla un día, no se castigue: retome donde lo dejó."
        ],
        links: [["/plan", "Plan de estudio"], ["/today", "Su día de estudio"]]
      },
      {
        h2: "Cómo elegir qué memorizar primero",
        p: [
          "Muchas personas empiezan por las suras cortas del último yuz porque son breves y se oyen con frecuencia. Después pasan a otras según su meta personal.",
          "También conviene vigilar las aleyas parecidas entre sí, que se confunden con facilidad."
        ],
        links: [["/guides/juz-amma-learning-plan", "Plan del Yuz Amma"], ["/shams/mutashabihat", "Aleyas parecidas"]]
      }
    ],
    stepsTitle: "Su rutina de memorización",
    steps: [
      { title: "Elija una aleya pequeña", body: "Mejor poco y firme que mucho y flojo." },
      { title: "Escúchela varias veces", body: "Con el texto delante, sin prisa y con un recitador claro." },
      { title: "Constrúyala desde el final", body: "Añada palabras de atrás hacia delante repitiendo en voz alta." },
      { title: "Entienda lo que dice", body: "El significado crea asociaciones que ayudan a recordar." },
      { title: "Repase según el plan", body: "Haga cada día los repasos que se le indiquen antes de añadir algo nuevo." }
    ],
    faqTitle: "Preguntas frecuentes sobre memorizar el Corán",
    faq: [
      { q: "¿Cómo memorizar el Corán fácilmente?", a: "Con aleyas cortas, repetición en voz alta, comprensión del significado y repaso frecuente. No hay atajos, pero un método ordenado ahorra mucho esfuerzo." },
      { q: "¿Puede un adulto memorizar el Corán?", a: "Sí. Los adultos suelen tener más disciplina y comprensión. Lo importante es la constancia." },
      { q: "¿Cuánto tarda en memorizarse el Corán entero?", a: "Varía mucho según el tiempo diario, la edad y el acompañamiento. Es una meta a largo plazo; conviene empezar por suras cortas." },
      { q: "¿Cómo evito olvidar lo memorizado?", a: "Repasando con regularidad. El repaso espaciado programa cuándo volver a cada aleya." },
      { q: "¿Necesito un profesor?", a: "Un maestro que escuche su recitación es muy valioso para corregir errores. La app complementa, no sustituye, ese acompañamiento." },
      { q: "¿Es gratis?", a: "Sí, el método y el repaso son gratuitos en la web y en la app con la misma cuenta." }
    ],
    linksTitle: "Recursos para memorizar",
    links: [["/shams", "Método Shams"], ["/shams/mutashabihat", "Aleyas parecidas"], ["/shams/adab", "Adab de la memorización"], ["/guides/how-to-memorize-the-quran", "Guía para memorizar"], ["/guides/juz-amma-learning-plan", "Plan del Yuz Amma"], ["/reciters", "Recitadores"], ["/khatm", "Planificador de jatma"], ["/app", "App para iOS"]],
    cta: ["/shams", "Comenzar con el método Shams"]
  },

  "quran-radio": {
    title: "Radio del Corán online en directo, gratis",
    description: "Escuche la radio del Corán online con recitación continua de distintos recitadores. Ideal para acompañar el estudio, el trabajo o el descanso. Gratis.",
    kicker: "Radio",
    h1: "Radio del Corán online: recitación continua, cuando usted la necesite",
    intro: "Una radio del Corán permite escuchar recitación sin tener que elegir ni pulsar nada cada pocos minutos. Es útil para llenar la casa de sonido tranquilo o para acompañar sus tareas.",
    answer: "La radio del Corán de Quran Masterclass reproduce recitación de forma continua con distintos recitadores. Se usa desde el navegador, sin pagar ni registrarse. Para estudiar una sura concreta aleya por aleya, es mejor la sección del Corán; la radio es para escuchar sin interrupciones.",
    sections: [
      {
        h2: "Cuándo conviene la radio",
        p: [
          "La radio es práctica cuando se quiere compañía sonora: durante las tareas del hogar, en un trayecto o antes de dormir. No exige decidir qué sura escuchar.",
          "Si lo que quiere es aprender, la radio sirve para familiarizarse con la melodía y el ritmo, no para estudiar el texto."
        ],
        links: [["/radio", "Abrir la radio"], ["/reciters", "Escuchar por recitador"]]
      },
      {
        h2: "Radio o sura elegida: qué usar",
        p: [
          "Para una escucha concreta, abra la sura que desee y escúchela con el texto y la traducción. Allí puede repetir una aleya o un pasaje cuantas veces necesite.",
          "Para fondo, la radio. Ambas opciones comparten cuenta y no tienen coste."
        ],
        links: [["/quran", "Leer y escuchar una sura"], ["/surah/36", "Sura Ya Sin"]]
      },
      {
        h2: "Un complemento para su estudio",
        p: [
          "Muchas personas dejan la radio de fondo y luego estudian en la web las aleyas que más les llamaron la atención. Es una forma suave de familiarizarse con el texto.",
          "Combine la escucha con una rutina breve de lectura para sacarle más partido."
        ],
        links: [["/guides/daily-quran-routine", "Rutina diaria con el Corán"], ["/tajweed", "Lecciones de tajwid"]]
      }
    ],
    stepsTitle: "Cómo usar la radio",
    steps: [
      { title: "Abra la radio", body: "Entre en la página de la radio desde el navegador." },
      { title: "Pulse reproducir", body: "La recitación empieza y continúa sin interrupciones." },
      { title: "Ajuste el volumen", body: "Elija un nivel suave si la deja de fondo." },
      { title: "Cambie de emisión si lo desea", body: "Pruebe otra voz cuando una no le resulte cómoda." }
    ],
    faqTitle: "Preguntas frecuentes sobre la radio",
    faq: [
      { q: "¿Es gratis la radio del Corán?", a: "Sí, es gratuita y sin anuncios." },
      { q: "¿Necesito registrarme?", a: "No para escuchar. La cuenta sirve para guardar su progreso de estudio." },
      { q: "¿Puedo escuchar en el móvil?", a: "Sí, desde el navegador y también con la app de iOS." },
      { q: "¿Puedo elegir el recitador?", a: "En la radio depende de la emisión. Para elegir el recitador, use la sección de recitadores." },
      { q: "¿La radio sirve para memorizar?", a: "Ayuda a familiarizarse con la melodía, pero para memorizar es más eficaz repetir aleyas concretas." }
    ],
    linksTitle: "También le puede interesar",
    links: [["/radio", "Radio del Corán"], ["/reciters", "Recitadores"], ["/quran", "Corán completo"], ["/duas", "Duas"], ["/prayer", "Horarios de oración"], ["/listen-quran", "Escuchar el Corán"], ["/app", "App para iOS"]],
    cta: ["/radio", "Escuchar la radio"]
  },

  "listen-quran": {
    title: "Escuchar el Corán online con traducción y texto",
    description: "Escuche el Corán completo online: 114 suras, audio aleya por aleya, recitador a elegir, traducción y texto en árabe. Gratis y sin anuncios.",
    kicker: "Audio",
    h1: "Escuchar el Corán online con texto y traducción",
    intro: "Escuchar el Corán es una de las formas más naturales de acercarse a él. Aquí puede hacerlo sura por sura, aleya por aleya y con el texto delante.",
    answer: "Quran Masterclass permite escuchar las 114 suras del Corán con el recitador que usted elija, siguiendo el texto árabe, la transliteración y la traducción. Puede repetir una aleya, bajar la velocidad o repetir un pasaje. Es gratis y no tiene anuncios.",
    sections: [
      {
        h2: "Escuchar sura por sura o aleya por aleya",
        p: [
          "Si quiere oír una sura entera, ábrala y pulse reproducir. Si prefiere estudiar, escuche aleya a aleya y repítala hasta quedar satisfecho.",
          "Cada palabra se ilumina mientras se recita, lo que ayuda a asociar el sonido con la escritura."
        ],
        links: [["/quran", "Elegir una sura"], ["/surah/1", "Sura Al-Fatiha"], ["/surah/2", "Sura Al-Baqara"]]
      },
      {
        h2: "Elija la voz que le convenga",
        p: [
          "Hay recitadores de ritmo pausado, ideales para aprender, y otros más rápidos. Pruebe varios y quédese con el que le resulte más claro.",
          "Para escuchar sin elegir, tiene también la radio."
        ],
        links: [["/reciters", "Todos los recitadores"], ["/radio", "Radio del Corán"]]
      },
      {
        h2: "De escuchar a comprender",
        p: [
          "Mientras escucha, puede leer la traducción y abrir el tafsir de la aleya. Así cada audición se convierte en una pequeña lección.",
          "Cuando tenga la costumbre, añada tajwid o memorización con la misma cuenta."
        ],
        links: [["/quran-tafsir", "Tafsir"], ["/memorize-quran", "Memorizar"], ["/tajweed", "Tajwid"]]
      }
    ],
    stepsTitle: "Escuchar el Corán, paso a paso",
    steps: [
      { title: "Elija una sura", body: "Busque en la lista de las 114 suras." },
      { title: "Elija un recitador", body: "Decida qué voz le resulta más agradable." },
      { title: "Siga el texto", body: "Lea mientras escucha para unir sonido y escritura." },
      { title: "Repita lo que quiera", body: "Use la repetición de aleya o de pasaje." },
      { title: "Abra la traducción", body: "Consulte el significado cuando la audición termine." }
    ],
    faqTitle: "Preguntas frecuentes sobre escuchar el Corán",
    faq: [
      { q: "¿Se puede escuchar el Corán completo?", a: "Sí, las 114 suras están disponibles con audio." },
      { q: "¿Se puede descargar en mp3?", a: "La web está pensada para escucharse en línea. Para disponer del audio, consulte en cada momento las opciones que ofrezca la plataforma." },
      { q: "¿Puedo escuchar y leer a la vez?", a: "Sí, el texto árabe, la transliteración y la traducción aparecen junto al audio." },
      { q: "¿Puedo cambiar de recitador?", a: "Sí, desde la sección del Corán o la de recitadores." },
      { q: "¿Funciona en el móvil?", a: "Sí, en el navegador y con la app de iOS." },
      { q: "¿Es gratis?", a: "Sí, sin cuotas ni anuncios." }
    ],
    linksTitle: "Más para escuchar",
    links: [["/quran", "El Corán"], ["/reciters", "Recitadores"], ["/radio", "Radio"], ["/surah/36", "Sura Ya Sin"], ["/surah/55", "Sura Ar-Rahman"], ["/surah/67", "Sura Al-Mulk"], ["/duas", "Duas"], ["/app", "App para iOS"]],
    cta: ["/quran", "Elegir una sura para escuchar"]
  },

  "tawbah": {
    title: "Tawba: volver a Alá y empezar de nuevo",
    description: "Una guía serena sobre la tawba: cómo volver a Alá, retomar la oración, el wudu y las duas, y seguir aprendiendo sin juicios. Gratis.",
    kicker: "Volver con calma",
    h1: "Tawba: volver a Alá y empezar de nuevo, sin prisas ni juicios",
    intro: "Si siente que se ha alejado y desea volver, esta página es para usted. La tawba es un regreso, y todo regreso empieza con un paso pequeño.",
    answer: "La tawba es el arrepentimiento sincero y el regreso a Alá. En la vida diaria suele traducirse en gestos concretos: volver a la oración, cuidar el wudu, hacer duas de perdón y retomar poco a poco el aprendizaje. Esta página no emite dictámenes; para cuestiones concretas, consulte a una persona de conocimiento de la escuela que usted siga.",
    sections: [
      {
        h2: "Un primer paso pequeño",
        p: [
          "No hace falta tener todo resuelto para comenzar. Muchas personas empiezan con una sola oración al día o con unos minutos de silencio. Lo importante es que el paso sea sincero y sostenible.",
          "Evite compararse con otros. Cada camino de regreso es personal."
        ],
        links: [["/learn-salah", "Aprender a rezar"], ["/salah", "Guía de la oración"]]
      },
      {
        h2: "Cuidar la oración y el wudu",
        p: [
          "Si hace tiempo que no reza, quizá haya olvidado los pasos. Está bien: puede repasarlos con calma. El entrenador de wudu y la guía de la oración están pensados para eso.",
          "Los horarios de oración le ayudarán a organizar el día sin agobios."
        ],
        links: [["/wudu", "Entrenador de wudu"], ["/prayer", "Horarios de oración"]]
      },
      {
        h2: "Las duas y el Corán como compañía",
        p: [
          "Hablar con Alá con sus propias palabras es siempre posible. Si busca fórmulas ya hechas, hay una colección de duas, y también un generador para escribir una dua personal.",
          "Escuchar el Corán, aunque sea unos minutos, puede ser una compañía suave en este momento."
        ],
        links: [["/duas", "Duas"], ["/dua-generator", "Generador de dua"], ["/listen-quran", "Escuchar el Corán"]]
      },
      {
        h2: "Seguir aprendiendo, a su ritmo",
        p: [
          "Volver también es aprender. Los fundamentos de la fe están explicados en la sección del islam, con contenido sunní y chií; en los puntos de diferencia, siga lo que enseña su escuela.",
          "Si lo desea, hable con una persona de confianza de su comunidad."
        ],
        links: [["/islam", "Fundamentos del islam"], ["/learn-islam", "Aprender sobre el islam"]]
      }
    ],
    stepsTitle: "Un camino de regreso en cinco pasos",
    steps: [
      { title: "Reconozca y decida", body: "Admita con sinceridad lo que desea cambiar y decida volver." },
      { title: "Pida perdón a Alá", body: "Con sus palabras o con una dua que le guste." },
      { title: "Retome una oración", body: "Empiece por una sola al día y aumente poco a poco." },
      { title: "Cuide el wudu", body: "Repase los pasos para sentirse tranquilo al rezar." },
      { title: "Siga aprendiendo", body: "Dedique unos minutos al Corán o a una guía cada día." }
    ],
    faqTitle: "Preguntas frecuentes sobre la tawba",
    faq: [
      { q: "¿Qué es la tawba?", a: "Es el arrepentimiento y el regreso a Alá. Incluye reconocer el error, pedir perdón y decidir cambiar." },
      { q: "¿Por dónde empiezo si llevo tiempo sin rezar?", a: "Por un paso pequeño: una oración al día, el repaso del wudu y unos minutos de duas. Aumente de forma gradual." },
      { q: "¿Qué hago si me siento demasiado lejos?", a: "Empiece de todos modos. El regreso se hace dando pasos, no esperando sentirse preparado." },
      { q: "¿Esta página dice lo que está permitido o prohibido?", a: "No. Es una ayuda práctica. Para cuestiones concretas consulte a una persona de conocimiento de la escuela que usted siga." },
      { q: "¿Puedo hacer una dua con mis propias palabras?", a: "Sí. También puede apoyarse en la colección de duas o en el generador." },
      { q: "¿Es gratis?", a: "Sí, todo este contenido es gratuito y no necesita registrarse para leerlo." }
    ],
    linksTitle: "Recursos para volver",
    links: [["/wudu", "Entrenador de wudu"], ["/salah", "Guía de la oración"], ["/prayer", "Horarios de oración"], ["/duas", "Duas"], ["/dua-generator", "Generador de dua"], ["/listen-quran", "Escuchar el Corán"], ["/islam", "Fundamentos del islam"], ["/names", "99 nombres de Alá"]],
    cta: ["/duas", "Ver las duas"]
  },

  "learn-salah": {
    title: "Aprender a rezar el salat paso a paso",
    description: "Aprenda a rezar el salat desde cero: las cinco oraciones, sus horarios, las posturas y qué se recita. Guía clara para quien se inicia. Gratis.",
    kicker: "Oración",
    h1: "Aprender a rezar: el salat, explicado paso a paso",
    intro: "Rezar por primera vez, o volver a hacerlo tras mucho tiempo, puede intimidar. Esta guía le acompaña con calma, desde cuándo se reza hasta qué se hace en cada postura.",
    answer: "El salat es la oración ritual del islam, que se realiza cinco veces al día en horarios que varían con la ubicación. Para aprender a rezar conviene conocer los horarios, hacer el wudu, aprender las posturas y memorizar poco a poco lo que se recita. Los detalles pueden variar según la escuela que usted siga.",
    sections: [
      {
        h2: "Las cinco oraciones y sus horarios",
        p: [
          "Las oraciones llevan los nombres fayr, dhuhr, asr, maghrib e isha. La hora de cada una cambia según el lugar y el día, así que lo práctico es consultar los horarios de su ciudad.",
          "También encontrará la dirección de la qibla para orientarse."
        ],
        links: [["/prayer", "Horarios de oración y qibla"], ["/calendar", "Calendario islámico"]]
      },
      {
        h2: "Antes de rezar: el wudu",
        p: [
          "La oración requiere un estado de pureza ritual, que se alcanza con la ablución. Antes de aprender las posturas, practique el wudu con el entrenador.",
          "Los detalles de la ablución pueden variar entre escuelas."
        ],
        links: [["/wudu", "Entrenador de wudu"], ["/learn-wudu", "Guía del wudu"]]
      },
      {
        h2: "Posturas y recitación",
        p: [
          "Una oración se compone de unidades llamadas rakat, formadas por posturas como estar de pie, inclinarse y postrarse. En cada una se recita algo distinto.",
          "Hay explicaciones separadas para la oración según la tradición sunní y según la chií; consulte la que corresponda a su escuela."
        ],
        links: [["/salah", "Aprender a rezar"], ["/islam/prayer-sunni", "Oración sunní"], ["/islam/prayer-shia", "Oración chií"]]
      }
    ],
    stepsTitle: "Aprender a rezar en cinco pasos",
    steps: [
      { title: "Consulte los horarios", body: "Sepa cuándo empieza cada oración en su ciudad." },
      { title: "Practique el wudu", body: "Hágalo varias veces hasta sentirse seguro." },
      { title: "Aprenda las posturas", body: "Memorice el orden de pie, inclinación y postración." },
      { title: "Memorice lo que se recita", body: "Empiece por la sura de apertura y una sura corta." },
      { title: "Rece una oración al día", body: "Luego añada las demás de forma gradual." }
    ],
    faqTitle: "Preguntas frecuentes sobre la oración",
    faq: [
      { q: "¿Cuántas veces se reza al día?", a: "Cinco: fayr, dhuhr, asr, maghrib e isha. Algunas tradiciones agrupan ciertas oraciones; consulte la práctica de su escuela." },
      { q: "¿Debo memorizar todo antes de empezar?", a: "No. Puede comenzar con lo básico y ampliar poco a poco." },
      { q: "¿Hace falta rezar en árabe?", a: "La recitación se hace en árabe; para aprenderla se puede usar la transliteración y el audio al principio." },
      { q: "¿Qué hago si me equivoco?", a: "Es normal. Consulte a una persona de conocimiento de su escuela ante dudas concretas." },
      { q: "¿Es igual la oración sunní y chií?", a: "Tienen rasgos comunes y también diferencias. Hay guías separadas en el sitio." },
      { q: "¿Es gratis?", a: "Sí, la guía y el entrenador son gratuitos." }
    ],
    linksTitle: "Recursos para rezar",
    links: [["/salah", "Aprender a rezar"], ["/wudu", "Entrenador de wudu"], ["/prayer", "Horarios de oración"], ["/duas", "Duas"], ["/islam/prayer-sunni", "Oración sunní"], ["/islam/prayer-shia", "Oración chií"], ["/arabic/read", "Leer árabe"], ["/surah/1", "Sura Al-Fatiha"]],
    cta: ["/salah", "Comenzar a aprender a rezar"]
  },

  "learn-wudu": {
    title: "Cómo hacer el wudu: ablución paso a paso",
    description: "Aprenda a hacer el wudu (ablución) con un entrenador interactivo. Orden de los gestos, práctica y consejos para hacerlo con seguridad antes de rezar.",
    kicker: "Ablución",
    h1: "Cómo hacer el wudu: la ablución, paso a paso",
    intro: "El wudu es la ablución que prepara para la oración y para tocar el Corán. Aprenderlo bien da tranquilidad, y se aprende rápido si se practica el orden de los gestos.",
    answer: "El wudu es el lavado ritual de ciertas partes del cuerpo que se realiza antes de rezar. Consiste en una secuencia ordenada de gestos con agua. Los detalles pueden diferir según la escuela que usted siga; el entrenador interactivo de Quran Masterclass le ayuda a practicar el orden.",
    sections: [
      {
        h2: "Por qué importa el orden",
        p: [
          "El wudu se compone de varios gestos que se realizan en una secuencia. Aprenderla de memoria evita dudas cada vez que se prepara para rezar.",
          "Un entrenador interactivo le propone el orden y le permite repetirlo tantas veces como necesite."
        ],
        links: [["/wudu", "Entrenador de wudu"]]
      },
      {
        h2: "Diferencias entre escuelas",
        p: [
          "Las escuelas sunníes y la tradición chií coinciden en lo esencial, pero hay matices en algunos gestos. Este sitio no los resuelve por usted: siga lo que enseña la escuela a la que pertenece.",
          "Ante dudas, consulte a una persona de conocimiento."
        ],
        links: [["/islam/madhahib", "Las escuelas jurídicas"], ["/islam/prayer-sunni", "Oración sunní"], ["/islam/prayer-shia", "Oración chií"]]
      },
      {
        h2: "Después del wudu",
        p: [
          "Una vez preparado, puede rezar o leer el Corán con tranquilidad. Consulte los horarios para no perder la hora y repase qué se hace en la oración.",
          "También hay duas para este momento en la colección."
        ],
        links: [["/prayer", "Horarios de oración"], ["/salah", "Aprender a rezar"], ["/duas", "Duas"]]
      }
    ],
    stepsTitle: "Practique el wudu",
    steps: [
      { title: "Abra el entrenador", body: "Empiece desde el primer gesto." },
      { title: "Siga el orden propuesto", body: "Repita cada gesto en el orden indicado." },
      { title: "Repita hasta dominarlo", body: "Practique varias veces seguidas." },
      { title: "Compare con su escuela", body: "Compruebe los matices con lo que enseña su tradición." },
      { title: "Úselo antes de rezar", body: "Aplíquelo en la práctica diaria." }
    ],
    faqTitle: "Preguntas frecuentes sobre el wudu",
    faq: [
      { q: "¿Qué es el wudu?", a: "Es la ablución ritual con agua que se hace antes de la oración." },
      { q: "¿Cuándo hay que hacerlo?", a: "Antes de rezar y en otros casos que establece cada escuela. Consulte la suya." },
      { q: "¿Es igual para sunníes y chiíes?", a: "Coincide en lo esencial, con algunas diferencias. Siga la escuela a la que pertenece." },
      { q: "¿Qué lo anula?", a: "Depende de la escuela. Consulte a una persona de conocimiento de la que usted siga." },
      { q: "¿Puedo practicar sin agua?", a: "El entrenador sirve para memorizar el orden. Para hacerlo de verdad, se necesita agua según indique su escuela." },
      { q: "¿Es gratis?", a: "Sí, el entrenador es gratuito." }
    ],
    linksTitle: "Relacionado",
    links: [["/wudu", "Entrenador de wudu"], ["/salah", "Aprender a rezar"], ["/prayer", "Horarios de oración"], ["/duas", "Duas"], ["/islam/prayer-sunni", "Oración sunní"], ["/islam/prayer-shia", "Oración chií"], ["/tawbah", "Volver a Alá"]],
    cta: ["/wudu", "Practicar el wudu"]
  },

  "learn-islam": {
    title: "Aprender sobre el islam desde cero: guía neutral",
    description: "Una introducción clara al islam: creencias, pilares, Corán, oración, Ramadán y más. Contenido sunní y chií, sin juicios. Gratis.",
    kicker: "Fundamentos",
    h1: "Aprender sobre el islam desde cero, con calma y sin prisas",
    intro: "Ya sea por curiosidad, por estudios o porque ha decidido acercarse a la fe, esta página le ayuda a aprender sobre el islam paso a paso, con explicaciones claras y neutrales.",
    answer: "El islam es una religión monoteísta cuyo texto central es el Corán. Sus fundamentos prácticos incluyen la profesión de fe, la oración, el ayuno de Ramadán, la caridad y la peregrinación. Quran Masterclass ofrece contenido de las tradiciones sunní y chií; en las diferencias, remite a la escuela que usted siga.",
    sections: [
      {
        h2: "Empiece por lo esencial",
        p: [
          "Lo primero es entender qué se cree y qué se practica. Las páginas introductorias explican el islam, la fe, el Corán y la vida del Profeta en un lenguaje sencillo.",
          "Léalas en el orden que prefiera; no hay prisa."
        ],
        links: [["/islam/islam", "Qué es el islam"], ["/islam/iman", "La fe"], ["/islam/prophet", "El Profeta"], ["/islam/quran", "El Corán"]]
      },
      {
        h2: "La práctica diaria",
        p: [
          "La oración, el ayuno y la rutina del día forman la parte práctica. Hay guías sobre la oración según cada tradición y sobre la vida cotidiana.",
          "Si quiere dar los primeros pasos prácticos, empiece por aprender a rezar y a hacer el wudu."
        ],
        links: [["/islam/prayer-sunni", "Oración sunní"], ["/islam/prayer-shia", "Oración chií"], ["/islam/daily", "Vida cotidiana"], ["/islam/ramadan", "Ramadán"]]
      },
      {
        h2: "Escuelas y diversidad",
        p: [
          "El islam es diverso. Hay escuelas jurídicas y tradiciones distintas que difieren en algunos puntos. Este sitio las presenta sin tomar partido.",
          "Cuando haya diferencias, consulte lo que establece la escuela que usted siga."
        ],
        links: [["/islam/madhahib", "Escuelas jurídicas"], ["/islam/halal-haram", "Halal y haram"], ["/islam/hajj", "Hach"], ["/islam/eid", "Eid"]]
      },
      {
        h2: "Si es nuevo en el islam",
        p: [
          "Si es nuevo en la fe, avance despacio y busque una comunidad o una persona de confianza que le acompañe. Esta plataforma es un apoyo de estudio, no una autoridad religiosa.",
          "Cuando esté listo, puede añadir el Corán, el tajwid y la memorización."
        ],
        links: [["/learn-quran", "Aprender el Corán"], ["/guides", "Guías"]]
      }
    ],
    stepsTitle: "Un recorrido inicial",
    steps: [
      { title: "Lea una introducción", body: "Empiece por qué es el islam y qué creen los musulmanes." },
      { title: "Conozca el Corán", body: "Lea sobre su estructura y escuche una sura corta." },
      { title: "Aprenda lo básico de la práctica", body: "Descubra qué es la oración, el ayuno y la caridad." },
      { title: "Explore la diversidad", body: "Lea sobre las escuelas y las tradiciones." },
      { title: "Haga preguntas", body: "Hable con personas de conocimiento de su entorno." }
    ],
    faqTitle: "Preguntas frecuentes sobre aprender el islam",
    faq: [
      { q: "¿Por dónde empiezo?", a: "Por una introducción general al islam y al Corán, y después por la práctica cotidiana." },
      { q: "¿Qué diferencia hay entre suníes y chiíes?", a: "Son dos grandes tradiciones con raíces comunes y diferencias históricas y jurídicas. El sitio presenta ambas sin tomar partido." },
      { q: "¿Es una autoridad religiosa?", a: "No. Es una herramienta de estudio; para cuestiones concretas consulte a una persona de conocimiento de su escuela." },
      { q: "¿Puedo aprender sin ser musulmán?", a: "Sí. Los contenidos son abiertos a quien quiera conocer el islam." },
      { q: "¿Hay algo para nuevos musulmanes?", a: "Hay guías sobre la oración, el wudu y el Corán pensadas para empezar desde cero." },
      { q: "¿Es gratis?", a: "Sí, todo el contenido de la web es gratuito." }
    ],
    linksTitle: "Para seguir explorando",
    links: [["/islam", "Sección del islam"], ["/islam/islam", "Qué es el islam"], ["/islam/prayer-sunni", "Oración sunní"], ["/islam/prayer-shia", "Oración chií"], ["/islam/ramadan", "Ramadán"], ["/names", "99 nombres de Alá"], ["/calendar", "Calendario islámico"], ["/nahj", "Nahy al-Balagha"], ["/learn-quran", "Aprender el Corán"]],
    cta: ["/islam/islam", "Leer la introducción"]
  }
};

export default hubs;
