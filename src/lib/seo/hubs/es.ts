import type { Hub, HubId } from "../types";

const hubs: Record<HubId, Hub> = {
  "learn-quran": {
    title: "Aprender el Corán online gratis, paso a paso",
    description: "Aprenda el Corán desde cero: leer árabe, recitar con tajwid, memorizar suras cortas y entender con tafsir. Gratis, sin anuncios, en 14 idiomas.",
    kicker: "Guía para empezar",
    h1: "Aprender el Corán online: un camino claro, desde la primera letra",
    intro: "Quien quiere aprender el Corán suele toparse con la misma pregunta: ¿por dónde se empieza? Esta guía ordena el camino en etapas sencillas, de las letras árabes a la recitación, la memorización y la comprensión, para adultos, niños y personas que acaban de llegar al islam.",
    answer: "Aprender el Corán es avanzar por etapas: conocer las letras árabes y sus signos, leer con soltura, recitar con tajwid, memorizar suras cortas y entender el significado con traducción y tafsir. Quran Masterclass reúne ese camino: un curso de lectura desde la primera letra, las 114 suras con audio aleya por aleya, lecciones de tajwid y el Método Shams para memorizar. La web es gratuita y sin anuncios, y la app de iOS usa la misma cuenta.",
    sections: [
      {
        h2: "Por dónde empezar a aprender el Corán",
        p: [
          "Antes de la primera lección conviene aclarar el objetivo, porque de él depende el orden. Quien no lee árabe empieza por las letras; quien lee con lentitud necesita práctica y tajwid; quien quiere memorizar suras para la oración empieza por Al-Fatiha y las suras cortas; y quien busca entender el mensaje combina desde el primer día traducción y tafsir.",
          "En Quran Masterclass, unas preguntas al empezar (si ya lee árabe, cuál es su meta y cuánto tiempo tiene) orientan su primer plan, y la página Hoy le muestra después qué repasar y por dónde seguir."
        ],
        links: [["/how", "Cómo está construido el aprendizaje"], ["/today", "Su página Hoy"]]
      },
      {
        h2: "Cómo aprender a leer el Corán en árabe",
        p: [
          "El alfabeto árabe tiene veintiocho letras que se escriben de derecha a izquierda y cambian de forma según su posición en la palabra. Encima y debajo aparecen las harakat, que indican las vocales cortas, y signos como el sukun, que marca la ausencia de vocal, o la shadda, que duplica la consonante. El texto del Corán va completamente vocalizado, así que con estas piezas ya se puede leer.",
          "El curso de lectura sigue el orden clásico de las escuelas coránicas: letras, formas de las letras, vocales cortas, vocales largas, tanwin, sukun, shadda, signos especiales y, por último, palabras reales del Corán. Las lecciones son breves, combinan tarjetas y ejercicios variados, y los errores vuelven al final para que los corrija.",
          "Una advertencia útil: la transliteración en letras latinas ayuda al principio, pero no sustituye a la lectura. Úsela como puente y vaya soltándola a medida que reconozca las letras."
        ],
        links: [["/arabic/read", "Curso de lectura del árabe"], ["/arabic", "Árabe para el Corán"]]
      },
      {
        h2: "Del leer al recitar: tajwid y suras cortas",
        p: [
          "Leer bien no es todavía recitar bien. El tajwid enseña de dónde sale cada sonido, cuándo se alarga una vocal y cómo se enlazan las letras. Lo práctico es aprender una regla por semana y aplicarla enseguida en aleyas que ya conoce, en lugar de estudiar toda la teoría de una vez.",
          "Las suras cortas son el mejor terreno de práctica: Al-Fatiha se recita en cada oración, y Al-Ijlas, Al-Falaq y An-Nas son breves y muy conocidas. En el lector, el modo Aprender se detiene tras cada aleya y la Pausa para repetir le deja el tiempo justo para recitarla usted."
        ],
        links: [["/tajweed", "Lecciones de tajwid"], ["/surah/1", "Sura Al-Fatiha"], ["/surah/112", "Sura Al-Ijlas"]]
      },
      {
        h2: "Cómo empezar a aprender el Corán de adulto",
        p: [
          "Empezar de adulto no es ningún inconveniente: un adulto entiende lo que estudia y organiza su tiempo. Lo que suele frenar es la vergüenza de equivocarse, y aprender en casa, a su ritmo y sin público, quita buena parte de ese peso.",
          "Si acaba de llegar al islam, dé prioridad a lo que necesitará cada día: recitar Al-Fatiha y una o dos suras cortas y entender lo que dicen. La traducción y la transliteración le acompañan mientras aprende las letras. Lo que se aprende despacio se queda."
        ],
        links: [["/shams", "Método Shams"], ["/guides/learn-to-read-the-quran", "Guía (en inglés): aprender a leer el Corán"]]
      },
      {
        h2: "Aprender el Corán con niños",
        p: [
          "Con los niños funciona mejor escuchar y repetir que explicar reglas. El modo niños de la plataforma usa letras grandes, colores vivos, botones sencillos y estrellas como recompensa, y la radio tiene una emisora con las suras que los niños suelen aprender primero.",
          "Sesiones cortas, a la misma hora y con un adulto al lado rinden más que una hora seguida el fin de semana. Celebre lo que el niño ya sabe y no convierta el Corán en un castigo ni en una competición entre hermanos."
        ],
        links: [["/radio", "Radio con emisora para niños"], ["/guides/quran-for-kids", "Guía (en inglés): el Corán para niños"]]
      },
      {
        h2: "Un plan para aprender el Corán en un año",
        p: [
          "Una rutina pequeña y diaria rinde más que un esfuerzo grande y esporádico. Elija una hora fija, por ejemplo después de una oración, y siga siempre el mismo orden: primero repasar lo aprendido, después avanzar con algo nuevo y al final leer el significado de lo que ha practicado.",
          "Para todo el año, el plan de 365 días ofrece varios ritmos, del Suave, para principiantes y niños, a la Ruta de hafiz, para quien estudia a tiempo completo. La Academia recorre las 114 suras empezando por las cortas, con una prueba por lección, y el planificador de jatma reparte la lectura del Corán completo en los días que usted elija."
        ],
        links: [["/plan", "Plan de 365 días"], ["/academy", "Academia"], ["/khatm", "Planificador de jatma"]]
      },
      {
        h2: "Aprender el Corán sin profesor: qué es posible y qué no",
        p: [
          "Por cuenta propia se puede avanzar mucho: letras, reglas, escucha de grandes recitadores, memorización con método y repaso a tiempo. La función Recitar y comprobar usa el reconocimiento de voz del navegador para mostrar qué palabras se reconocieron; ayuda a detectar olvidos, pero no evalúa el tajwid.",
          "La recitación se ha transmitido siempre de maestro a alumno. En cuanto pueda, recite ante una persona cualificada que le corrija, en la mezquita o en línea. El Camino del recitador prepara ese paso con recitación modelo, grabaciones propias y pruebas por niveles, y la Madrasa ordena el estudio en cuatro etapas."
        ],
        links: [["/reciter-path", "Camino del recitador"], ["/school", "La Madrasa"]]
      }
    ],
    stepsTitle: "Sus primeras seis semanas, paso a paso",
    steps: [
      { title: "Semana 1: letras y vocales", body: "Una lección corta del curso de lectura cada día." },
      { title: "Semana 2: Al-Fatiha con audio", body: "Escúchela aleya por aleya, léala con transliteración y mire su traducción." },
      { title: "Semana 3: una voz de referencia", body: "Repita siempre con un mismo recitador pausado; el oído fija la pronunciación." },
      { title: "Semana 4: la primera regla de tajwid", body: "Empiece por los puntos de articulación y aplíquelos en Al-Fatiha y en Al-Ijlas." },
      { title: "Semana 5: memorizar con método", body: "Aprenda una sura corta con el Método Shams y deje que el plan le indique cuándo repasarla." },
      { title: "Semana 6: revisar y ajustar", body: "Compruebe lo que domina y elija un plan para los próximos meses." }
    ],
    faqTitle: "Preguntas frecuentes sobre aprender el Corán",
    faq: [
      { q: "¿Se puede aprender el Corán sin saber árabe?", a: "Sí. Se empieza por las letras y las vocales, y mientras tanto se sigue cualquier sura con audio, transliteración y traducción al español. Entender el idioma lleva más tiempo." },
      { q: "¿Cuánto se tarda en aprender a leer el Corán?", a: "Depende de la constancia y del tiempo diario. Con práctica diaria, muchas personas leen despacio tras unas semanas; la soltura y un tajwid seguro llevan meses. No hay una cifra válida para todos." },
      { q: "¿Puedo aprender el Corán con traducción al español?", a: "Sí. La interfaz y la traducción están en español, junto al texto árabe y la transliteración. Se recita en árabe; la traducción sirve para entender." },
      { q: "¿Sirve para niños?", a: "Sí, con el modo niños y la emisora infantil de la radio. Aun así, es recomendable que un adulto acompañe las sesiones y escuche cómo recita el niño." },
      { q: "¿Es gratis Quran Masterclass?", a: "Sí, la web es gratuita, sin anuncios ni cuotas. La app de iOS usa la misma cuenta y ofrece además una suscripción opcional con funciones adicionales." },
      { q: "¿Quién está detrás de Quran Masterclass?", a: "La plataforma fue fundada por Nami Shams, creador del Método Shams, y la opera ICSL FZE – Islamic Coding & Software Lab, con sede en Sharjah (Emiratos Árabes Unidos). Es una herramienta de estudio, no una autoridad religiosa." }
    ],
    linksTitle: "Siga explorando",
    links: [["/quran", "Leer y escuchar el Corán"], ["/arabic/read", "Curso de lectura del árabe"], ["/tajweed", "Lecciones de tajwid"], ["/shams", "Método Shams"], ["/academy", "Academia"], ["/plan", "Plan de 365 días"], ["/courses", "Cursos"], ["/guides/how-to-learn-the-quran", "Guía (en inglés): cómo aprender el Corán"], ["/app", "App para iOS"]],
    cta: ["/quran", "Empezar a leer y escuchar"]
  },

  "quran-tafsir": {
    title: "Tafsir del Corán: qué es y cómo estudiarlo aleya por aleya",
    description: "Qué es el tafsir del Corán, en qué se diferencia de una traducción y cómo estudiarlo sura por sura, con el comentario junto a cada aleya. Gratis.",
    kicker: "Comprender el Corán",
    h1: "Tafsir del Corán: entender cada aleya junto a su explicación",
    intro: "El tafsir del Corán es la explicación de su significado: el sentido de las palabras, el contexto en que se revelaron las aleyas y lo que los sabios han enseñado sobre cada pasaje. Esta guía explica qué es, en qué se diferencia de una traducción, qué tradiciones existen y cómo estudiarlo con calma, aleya por aleya, junto al audio y la traducción.",
    answer: "El tafsir es la disciplina islámica que explica el Corán: aclara el sentido de las palabras, el contexto de la revelación y lo que los sabios han enseñado sobre cada pasaje. Una traducción traslada el texto a otro idioma; el tafsir explica lo que significa. En Quran Masterclass el comentario aparece junto a cada aleya con su fuente, gratis en la web, y la app de iOS usa la misma cuenta; cuando no hay un tafsir en español, se muestran fuentes clásicas en inglés.",
    sections: [
      {
        h2: "Qué es el tafsir del Corán",
        p: [
          "La palabra tafsir procede de una raíz árabe que significa aclarar, descubrir lo que está velado. Como disciplina, el tafsir explica el Corán apoyándose en la lengua árabe, en otras aleyas que aclaran el pasaje, en la Sunna del Profeta, en lo transmitido por las primeras generaciones y en el razonamiento de los sabios.",
          "Conviene distinguirlo del tadabbur, la reflexión personal. A reflexionar se invita a todo creyente; explicar un pasaje con autoridad, en cambio, requiere formación. Un buen estudio combina ambas cosas."
        ],
        links: [["/islam/quran", "El Corán en el islam"], ["/shams/method", "La reflexión en el Método Shams"]]
      },
      {
        h2: "Diferencia entre traducción y tafsir",
        p: [
          "Toda traducción ya es una interpretación: el traductor elige entre varios significados posibles de una palabra árabe, y por eso dos traducciones fieles pueden sonar distintas. La traducción da el sentido general; el tafsir explica por qué se entiende así y qué otros sentidos se han propuesto.",
          "Un orden práctico: escuche la aleya, lea la traducción, mire el significado palabra por palabra y, solo entonces, abra el comentario. El vocabulario coránico ayuda mucho, porque muchas palabras se repiten a lo largo del texto."
        ],
        links: [["/quran", "El Corán con traducción"], ["/vocab", "Vocabulario del Corán"]]
      },
      {
        h2: "Qué es asbab al-nuzul, el contexto de la revelación",
        p: [
          "Asbab al-nuzul son las circunstancias de la revelación: los hechos o preguntas con los que se relaciona un pasaje. Conocerlas evita lecturas fuera de contexto, aunque no todas las aleyas tienen un motivo conocido y los relatos tienen distinta solidez, que los sabios examinan.",
          "También ayuda saber si una sura es de La Meca o de Medina: las mequíes suelen centrarse en la fe, el más allá y los profetas; las mediníes tratan más la vida en comunidad. El lector indica esta clasificación, y la radio tiene una emisora con las primeras revelaciones."
        ],
        links: [["/surah/96", "Sura Al-Alaq"], ["/radio", "Radio del Corán"]]
      },
      {
        h2: "Tafsir clásico y enfoques modernos",
        p: [
          "Se suelen distinguir dos grandes métodos: el tafsir basado en lo transmitido, que explica el Corán con el propio Corán, la Sunna y las primeras generaciones, y el basado en el razonamiento, que recurre además a la gramática y la retórica. Entre las obras clásicas más citadas están los comentarios de al-Tabari, al-Qurtubi e Ibn Kathir, y el breve Tafsir al-Yalalayn.",
          "En tiempos recientes han surgido enfoques temáticos, que reúnen lo que el Corán dice sobre un asunto, y comentarios sencillos para el lector general. Para empezar suele recomendarse un comentario breve y fiable, con la orientación de un maestro."
        ],
        links: [["/guides/understanding-the-quran-tafsir", "Guía (en inglés): entender el Corán con tafsir"]]
      },
      {
        h2: "Tafsir sunní y chií: dos tradiciones con mucho en común",
        p: [
          "Sunníes y chiíes leen el mismo Corán y comparten muchas herramientas del tafsir, como el análisis de la lengua o la explicación de una aleya mediante otra. Difieren sobre todo en las transmisiones que priorizan: la tradición sunní se apoya en lo narrado por los Compañeros y sus sucesores; la chií da un lugar central a lo transmitido de la familia del Profeta y de los imames. Entre las obras chiíes más conocidas están Mayma al-Bayan, de al-Tabrisi, y al-Mizan, de Tabatabai.",
          "Quran Masterclass sirve a lectores de ambas tradiciones y no toma partido. Cada comentario se muestra con el nombre de su fuente, para que sepa de dónde procede; en las cuestiones donde hay diferencias, oriéntese por lo que enseña la escuela que usted sigue y pregunte a un sabio de esa escuela."
        ],
        links: [["/islam/madhahib", "Las escuelas del islam"]]
      },
      {
        h2: "Dónde leer el tafsir de cada sura",
        p: [
          "Abra cualquiera de las 114 suras y pulse Tafsir junto a la aleya: el comentario aparece al lado del texto, con su fuente. Cuando no existe un tafsir en español, el lector muestra fuentes clásicas en inglés, como Ibn Kathir abreviado; las explicaciones propias redactadas con ayuda de inteligencia artificial llevan una marca.",
          "Sin cuenta puede abrir el tafsir de un número limitado de aleyas al día; con una cuenta gratuita sigue leyendo y guarda sus notas y su progreso en la web y en la app de iOS. La búsqueda localiza aleyas por palabras."
        ],
        links: [["/quran", "Elegir una sura"], ["/search", "Buscar en el Corán"]]
      },
      {
        h2: "Cómo estudiar tafsir para principiantes: las suras cortas",
        p: [
          "Las suras cortas son un buen comienzo: se recitan a menudo en la oración y se estudian enteras en una semana. Al-Fatiha, Al-Asr o Al-Ijlas muestran cómo una explicación cambia la forma de escuchar un texto conocido.",
          "Lea poco y bien: una aleya al día, con su traducción y su comentario, y una nota de una o dos frases en el propio lector. El Método Shams integra ese paso, el tafsir, entre la comprensión de las palabras y la reflexión final, con tres preguntas sencillas para llevar la aleya a la vida diaria."
        ],
        links: [["/surah/1", "Sura Al-Fatiha"], ["/surah/103", "Sura Al-Asr"], ["/shams", "Método Shams"]]
      }
    ],
    stepsTitle: "Cómo estudiar una sura con tafsir",
    steps: [
      { title: "Elija una sura corta", body: "Empezar por una sura breve permite terminarla y ver el conjunto de su mensaje." },
      { title: "Escuche y lea la traducción completa", body: "Hágase una idea general antes de entrar en los detalles de cada aleya." },
      { title: "Abra el comentario aleya por aleya", body: "Lea el tafsir de cada aleya y fíjese en la fuente que aparece debajo." },
      { title: "Identifique las palabras clave", body: "Use el significado palabra por palabra para reconocer términos que se repiten en otras suras." },
      { title: "Escriba una nota breve", body: "Resuma en una o dos frases lo que aprendió y lo que le dice a usted." },
      { title: "Repase al día siguiente", body: "Vuelva a escuchar la sura y lea su nota; así el significado se asienta." }
    ],
    faqTitle: "Preguntas frecuentes sobre el tafsir",
    faq: [
      { q: "¿Qué es el tafsir del Corán?", a: "Es la explicación del Corán: aclara el sentido de las palabras, el contexto de la revelación y lo que los sabios han enseñado sobre cada pasaje. Es una disciplina con reglas propias y una larga tradición de obras." },
      { q: "¿Cuál es la diferencia entre traducción y tafsir?", a: "La traducción traslada el texto a otro idioma y ya implica elegir entre significados; el tafsir explica por qué se entiende así, qué otras lecturas existen y qué contexto lo aclara. Lo ideal es usar los dos." },
      { q: "¿Hay tafsir del Corán en español online?", a: "En Quran Masterclass la interfaz y la traducción están en español. El comentario se muestra en español cuando hay una fuente disponible; si no, aparecen fuentes clásicas en inglés, siempre con su nombre." },
      { q: "¿Qué tafsir conviene leer al empezar?", a: "Suele aconsejarse un comentario breve y fiable antes de las obras extensas, y empezar por suras cortas. Un maestro de su escuela puede recomendarle una obra adecuada a su nivel." },
      { q: "¿Son muy distintos el tafsir sunní y el chií?", a: "Comparten el texto y muchos métodos; difieren en las fuentes de transmisión que priorizan y en la interpretación de algunos pasajes. En esas cuestiones, siga lo que enseña la escuela que usted sigue." },
      { q: "¿Puedo interpretar el Corán por mi cuenta?", a: "Reflexionar sobre lo que se lee es valioso para cualquiera. Derivar normas o explicar el sentido de un pasaje con autoridad requiere formación; para eso, consulte a un sabio cualificado." },
      { q: "¿Es gratis leer el tafsir?", a: "En la web, sí. Sin cuenta puede abrir el tafsir de un número limitado de aleyas al día; con una cuenta gratuita sigue leyendo sin pagar nada." }
    ],
    linksTitle: "Enlaces útiles",
    links: [["/quran", "El Corán con traducción"], ["/surah/1", "Sura Al-Fatiha"], ["/surah/112", "Sura Al-Ijlas"], ["/shams/method", "Método Shams paso a paso"], ["/vocab", "Vocabulario del Corán"], ["/search", "Buscar en el Corán"], ["/islam/quran", "Qué es el Corán"], ["/islam/madhahib", "Las escuelas del islam"], ["/guides/understanding-the-quran-tafsir", "Guía de tafsir (en inglés)"]],
    cta: ["/quran", "Abrir el Corán con tafsir"]
  },

  "tajweed-online": {
    title: "Curso de tajwid online gratis: reglas y práctica",
    description: "Curso de tajwid online paso a paso: makharij, nun sakin y tanwin, mim sakin, qalqala, madd y pausas, con ejemplos del Corán, cuestionarios y práctica.",
    kicker: "Recitación",
    h1: "Curso de tajwid online: las reglas para recitar el Corán con corrección",
    intro: "Este curso de tajwid online le acompaña desde la pronunciación de cada letra hasta las reglas que más cambian el sonido de la recitación. El tajwid es el conjunto de normas que indica cómo pronunciar cada letra y cuánto dura cada sonido; aquí encontrará el orden en que conviene estudiarlo, consejos para hispanohablantes y la manera de practicar con aleyas reales.",
    answer: "El tajwid es el conjunto de reglas que fija cómo se pronuncia cada letra del Corán, desde qué punto de la boca o la garganta sale y cuánto se alarga cada vocal. Se aprende mejor combinando una explicación breve, la escucha de un buen recitador y la práctica diaria con aleyas reales. El curso de tajwid de Quran Masterclass sigue la lectura de Hafs an Asim, con lecciones ordenadas, ejemplos del Corán, cuestionarios y una sección de práctica, gratis en la web; la app de iOS usa la misma cuenta.",
    sections: [
      {
        h2: "Qué es el tajwid y por qué es importante",
        p: [
          "La palabra tajwid procede de una raíz árabe que significa hacer algo bien, con esmero. Aplicada al Corán, describe la forma de recitarlo tal como se ha transmitido de maestro a alumno a lo largo de generaciones: cada letra en su lugar, con sus cualidades, y cada vocal con su duración.",
          "No es solo belleza: en árabe, dos letras de sonido parecido pueden cambiar el sentido de una palabra. El curso sigue la lectura de Hafs an Asim, la más difundida hoy y la que escuchará en la mayoría de los recitadores."
        ],
        links: [["/reciters", "Escuchar a los recitadores"]]
      },
      {
        h2: "Qué reglas de tajwid aprender primero",
        p: [
          "El curso sigue un orden pensado para principiantes: la isti'adha y la basmala, los puntos de articulación, las letras gruesas y finas, la lam solar y la lunar, la nun sakin y el tanwin, la mim sakin, la ghunna, la qalqala, el madd y las pausas. Termina con Al-Fatiha recitada aplicando todo lo anterior.",
          "Si tiene poco tiempo, concéntrese primero en tres bloques que aparecen en casi cada página: los makharij, la nun sakin con el tanwin y el madd. Cada lección incluye ejemplos del Corán que puede escuchar y un cuestionario breve para comprobar que la ha entendido."
        ],
        links: [["/tajweed", "Índice del curso de tajwid"], ["/surah/1", "Sura Al-Fatiha"]]
      },
      {
        h2: "Los makharij: cómo pronunciar las letras árabes del Corán",
        p: [
          "Los makharij son los puntos de articulación: la cavidad de la boca, la garganta, la lengua, los labios y la nariz. Un ejercicio clásico consiste en pronunciar cada letra con sukun precedida de una hamza con fatha, para sentir dónde se apoya el sonido.",
          "Para hispanohablantes hay buenas noticias: la jota española se parece a la ja (خ), la erre simple de pero a la ra, la zeta peninsular a la za (ث) y la d suave de nada a la dhal (ذ). En cambio, la ha aspirada (ح), la ayn (ع), la qaf (ق) y las letras enfáticas no tienen equivalente y piden mucha escucha. Y la ha (ه) sí suena en árabe, a diferencia de la h española."
        ],
        links: [["/tajweed/makharij", "Lección de makharij"], ["/arabic/read", "Curso de lectura"]]
      },
      {
        h2: "Reglas de la nun sakin, el tanwin y la mim sakin",
        p: [
          "Cuando una nun sin vocal o un tanwin va seguido de otra letra, se aplica una de cuatro reglas: izhar, pronunciarla con claridad; idgham, fundirla con la letra siguiente; iqlab, convertirla en un sonido de mim; o ikhfa, ocultarla a medias con una resonancia nasal. Cuál toca depende de la letra que sigue, y aprender esos grupos de letras es la mitad del trabajo.",
          "La mim sakin sigue un esquema parecido y más sencillo, con su propio ocultamiento, su fusión y su pronunciación clara. Junto a ellas está la ghunna, la nasalización que acompaña a la nun y la mim con shadda y que suele sostenerse unos dos tiempos."
        ],
        links: [["/tajweed/nun-sakinah-izhar", "Nun sakin y tanwin"], ["/tajweed/mim-sakinah", "Mim sakin"]]
      },
      {
        h2: "Tipos de madd en el tajwid y qué es la qalqala",
        p: [
          "El madd es el alargamiento de una vocal. El madd natural dura dos tiempos; otros tipos, que aparecen cuando a la vocal larga le sigue una hamza o un sukun, se alargan más, hasta seis tiempos según el caso. Acortar los madd es uno de los errores más comunes en quien empieza.",
          "La qalqala es un ligero rebote que se produce en cinco letras, qaf, ta enfática, ba, yim y dal, cuando llevan sukun, y se percibe más al detenerse al final de una aleya. También existe el error contrario: aplicar el rebote a letras que no lo tienen."
        ],
        links: [["/tajweed/madd", "Madd"], ["/tajweed/qalqalah", "Qalqala"]]
      },
      {
        h2: "Cómo practicar el tajwid con ejemplos",
        p: [
          "La regla solo se asienta cuando se aplica. En la sección de práctica, un ejercicio le muestra una palabra en una aleya real y le pregunta qué regla se aplica allí, en rondas de diez lugares elegidos al azar; también hay un cuestionario por sura. Practique una regla a la vez sobre aleyas que ya conoce.",
          "Escuche a un recitador pausado, baje la velocidad del reproductor si hace falta y grábese para compararse. El Camino del recitador lleva este trabajo más lejos, con diez niveles que van de los makharij a los maqamat, recitación modelo, grabaciones propias y pruebas."
        ],
        links: [["/tajweed/practice", "Práctica de tajwid"], ["/reciter-path", "Camino del recitador"]]
      },
      {
        h2: "Cómo corregir errores de recitación",
        p: [
          "Los errores más frecuentes al empezar son previsibles: confundir la ayn con la hamza, la ha aspirada con la ha suave o la qaf con la kaf; acortar los madd; olvidar la ghunna; y detenerse en mitad de una frase sin volver atrás. Elija uno de ellos cada semana y corríjalo de forma consciente.",
          "Los errores sutiles los detecta mejor un oído entrenado: siempre que pueda, recite ante un maestro cualificado, en la mezquita o en línea."
        ],
        links: [["/guides/tajweed-for-beginners", "Guía (en inglés): tajwid para principiantes"]]
      }
    ],
    stepsTitle: "Plan de tajwid en seis pasos",
    steps: [
      { title: "Asegure la lectura", body: "Si todavía duda con las letras y los signos, complete antes el curso de lectura." },
      { title: "Aprenda los makharij", body: "Una o dos letras al día, comparando su voz con el audio." },
      { title: "Estudie la nun sakin y el tanwin", body: "Aprenda las letras de cada una de las cuatro reglas y búsquelas en Al-Fatiha y en las suras cortas." },
      { title: "Añada la mim sakin y la ghunna", body: "Escuche cómo la nasalización cambia el sonido de un pasaje." },
      { title: "Trabaje el madd y la qalqala", body: "Cuente los tiempos con los dedos al principio; después el oído lo hará por usted." },
      { title: "Practique y recite ante alguien", body: "Use la sección de práctica y, cuando pueda, recite ante un maestro que le corrija." }
    ],
    faqTitle: "Preguntas frecuentes sobre el tajwid",
    faq: [
      { q: "¿Qué es el tajwid?", a: "Es el conjunto de reglas para pronunciar correctamente las letras del Corán, con sus puntos de articulación, sus cualidades y la duración de cada sonido." },
      { q: "¿Se puede aprender tajwid online sin profesor?", a: "La teoría y gran parte de la práctica, sí. Pero los errores sutiles los corrige mejor un maestro que le escuche; lo ideal es combinar el curso con algunas sesiones de recitación ante una persona cualificada." },
      { q: "¿Cuánto tiempo lleva aprender tajwid?", a: "Las reglas básicas pueden estudiarse en pocas semanas con práctica diaria. Aplicarlas con naturalidad al recitar requiere meses, y perfeccionarlas es un trabajo de años." },
      { q: "¿Qué reglas de tajwid aprender primero?", a: "Los puntos de articulación, la nun sakin con el tanwin y el madd. Después, la mim sakin, la ghunna, la qalqala y las pausas." },
      { q: "¿Hace falta saber árabe para estudiar tajwid?", a: "No hace falta hablarlo, pero sí leer las letras y los signos de vocalización. Si aún no lee, empiece por el curso de lectura." },
      { q: "¿Qué lectura enseña el curso?", a: "La de Hafs an Asim, la más extendida hoy. Existen otras lecturas transmitidas, con reglas propias, que se estudian con maestros especializados." },
      { q: "¿Sirve el tajwid para niños?", a: "Sí, pero con los niños funciona mejor imitar a un buen recitador que aprender nombres de reglas. Las explicaciones pueden venir después." },
      { q: "¿Es gratis el curso de tajwid?", a: "En la web, las lecciones y la práctica son gratuitas. La app de iOS usa la misma cuenta; en ella, el curso completo forma parte de una suscripción opcional." }
    ],
    linksTitle: "Lecciones y recursos",
    links: [["/tajweed", "Lecciones de tajwid"], ["/tajweed/practice", "Práctica"], ["/tajweed/makharij", "Makharij"], ["/tajweed/nun-sakinah-izhar", "Nun sakin y tanwin"], ["/tajweed/madd", "Madd"], ["/tajweed/qalqalah", "Qalqala"], ["/reciter-path", "Camino del recitador"], ["/reciters", "Recitadores para escuchar"], ["/arabic/read", "Curso de lectura"]],
    cta: ["/tajweed", "Empezar el curso de tajwid"]
  },

  "memorize-quran": {
    title: "Memorizar el Corán: método, rutina y repaso",
    description: "Cómo memorizar el Corán con un método por pasos: escuchar, construir hacia atrás, entender y repasar a tiempo. Planes de hifz y repaso espaciado.",
    kicker: "Hifz",
    h1: "Memorizar el Corán: un método que cuida también el repaso",
    intro: "Memorizar el Corán no es solo aprender una aleya hoy, sino conservarla mañana y dentro de un año. Esta guía reúne lo que de verdad ayuda: un método claro para cada aleya, un plan diario realista, ciclos de repaso que evitan el olvido y consejos para adultos, niños y personas con poco tiempo.",
    answer: "Para memorizar el Corán de forma duradera conviene aprender porciones pequeñas cada día, escucharlas antes de recitarlas, entender su significado y repasar con un plan que combine lo nuevo, lo reciente y lo ya memorizado. El Método Shams de Quran Masterclass, desarrollado por Nami Shams, guía cada aleya en siete pasos, y un modelo de memoria indica cada día qué repasar. Es gratis en la web, y la app de iOS usa la misma cuenta.",
    sections: [
      {
        h2: "Cómo memorizar el Corán fácilmente: el Método Shams",
        p: [
          "No hay atajos, pero sí métodos que ahorran mucho esfuerzo. El Método Shams divide el trabajo de cada aleya en siete pasos: escuchar, construir hacia atrás, palabra por palabra, significado y ganchos de memoria, tafsir, pistas que desaparecen y reflexionar.",
          "Primero se escucha la aleya tres veces con la vista en el texto árabe, sin traducir. Después se construye desde el final: la última palabra, las dos últimas, las tres últimas, hasta completarla, de modo que cada repetición termina en la parte que ya conoce. Luego se estudian las palabras y su significado, se lee el comentario y se recita con pistas cada vez menores: primero solo la letra inicial de cada palabra, después nada."
        ],
        links: [["/shams", "Método Shams"], ["/shams/method", "Los siete pasos"]]
      },
      {
        h2: "Un plan de hifz: cuánto memorizar cada día",
        p: [
          "La cantidad ideal es la que puede sostener cada día sin descuidar el repaso. Para un adulto con trabajo y familia, pocas aleyas bien aprendidas valen más que una página olvidada a la semana; memorizar una página al día es un ritmo propio de quien estudia a tiempo completo y con maestro.",
          "El plan de 365 días ofrece cuatro ritmos: Suave, que empieza con una aleya al día y está pensado para principiantes y niños; Estándar, para la mayoría de los adultos; Intensivo; y la Ruta de hafiz, para quien se dedica por completo. En todos, la porción diaria crece poco a poco cada semana, y si se retrasa, el plan le muestra lo pendiente para que lo recupere antes de añadir más."
        ],
        links: [["/plan", "Plan de 365 días"]]
      },
      {
        h2: "Cómo repasar lo memorizado para no olvidarlo",
        p: [
          "Las escuelas de hifz trabajan desde hace siglos con tres círculos: la lección nueva del día, lo aprendido en los últimos días y todo lo anterior, repasado por turnos. Quran Masterclass sigue esa lógica y la combina con el repaso espaciado: tras recitar de memoria, usted valora con sinceridad si la aleya le salió mal, bien o con facilidad, y un modelo de memoria calcula cuándo volver a ella, al principio a los pocos días y más adelante a las semanas o los meses.",
          "La regla de oro es repasar antes de añadir. La página Hoy le muestra cuántas aleyas tiene pendientes, la prueba aleatoria tapa una aleya cualquiera de la sura para comprobar si sigue firme y la Academia le propone pruebas cronometradas por lección. Así sabe qué está seguro y qué necesita atención."
        ],
        links: [["/today", "Repaso de hoy"], ["/academy", "Academia y pruebas"]]
      },
      {
        h2: "Plan para memorizar el Yuz Amma",
        p: [
          "Muchas personas empiezan por Al-Fatiha y después por el Yuz Amma, la última de las treinta partes del Corán, que va de la sura An-Naba (78) a An-Nas (114). Sus suras son breves, se recitan a menudo en la oración y se escuchan con frecuencia, lo que facilita retenerlas.",
          "Un orden habitual es ir de las más cortas, al final del Corán, hacia las más largas del principio de la parte. Cuando el Yuz Amma esté firme, muchas personas siguen con suras muy queridas como Al-Mulk (67), Ya Sin (36) o Ar-Rahman (55), según su meta personal."
        ],
        links: [["/surah/78", "Sura An-Naba"], ["/surah/114", "Sura An-Nas"], ["/guides/juz-amma-learning-plan", "Guía (en inglés): plan del Yuz Amma"]]
      },
      {
        h2: "Técnicas para memorizar aleyas largas y aleyas parecidas",
        p: [
          "Una aleya larga se aprende por unidades de sentido, no de golpe. Divídala donde la frase hace una pausa natural, construya cada parte desde el final y únalas después. Al terminar el día, encadene: recite seguidas las aleyas de hoy y las de ayer sin mirar, para que crezcan como un pasaje.",
          "Las aleyas parecidas entre sí, llamadas mutashabihat, son una de las causas más frecuentes de confusión, incluso entre quienes ya han memorizado mucho. Compárelas lado a lado, fíjese en la palabra que cambia y busque un detalle de contexto que le recuerde en qué sura está."
        ],
        links: [["/shams/mutashabihat", "Aleyas parecidas"]]
      },
      {
        h2: "Memorizar el Corán de adulto, con niños o con poco tiempo",
        p: [
          "Un adulto puede memorizar el Corán; quizá le cueste más repetir de forma mecánica, pero suele aportar más comprensión y más disciplina. Elija una franja tranquila y fija: muchas personas prefieren la mañana temprano o el rato que sigue a una oración, pero el mejor horario es el que usted puede mantener.",
          "Con niños, escuchar mucho y repetir en voz alta funciona mejor que las explicaciones; el ritmo Suave del plan y el modo niños ayudan. Para las mujeres, la sección Para hermanas explica cómo puede continuar el hifz durante la menstruación o tras el parto, escuchando y comprendiendo, con las diferencias entre escuelas indicadas.",
          "Y quien lleva el Corán en la memoria cuida también su trato con él: la sección sobre el adab del portador del Corán reúne esa dimensión, que acompaña a la técnica."
        ],
        links: [["/sisters", "Para hermanas"], ["/shams/adab", "Adab del portador del Corán"]]
      }
    ],
    stepsTitle: "Su rutina diaria de memorización",
    steps: [
      { title: "Repase primero", body: "Empiece por las aleyas que el plan marca como pendientes, recitándolas de memoria." },
      { title: "Escuche la porción nueva", body: "Tres veces, con la vista en el texto y un recitador claro." },
      { title: "Constrúyala desde el final", body: "Añada palabras de atrás hacia delante, repitiendo en voz alta." },
      { title: "Entienda lo que dice", body: "Lea el significado de las palabras, la traducción y el comentario." },
      { title: "Recite sin pistas y valórese", body: "Tape el texto, recite, compruebe y valore con sinceridad cómo le salió." },
      { title: "Encadene y escuche antes de dormir", body: "Una las aleyas de hoy con las de ayer y escúchelas una vez más por la noche." }
    ],
    faqTitle: "Preguntas frecuentes sobre memorizar el Corán",
    faq: [
      { q: "¿Cómo memorizar el Corán fácilmente?", a: "Con porciones pequeñas, escucha previa, repetición en voz alta, comprensión del significado y repaso planificado. La facilidad viene de la constancia y del método, no de trucos." },
      { q: "¿Cuánto tarda memorizar el Corán completo?", a: "Varía mucho según el tiempo diario, la edad, la experiencia previa y el acompañamiento. Para la mayoría es una meta de años; lo sensato es fijarse objetivos intermedios, como el Yuz Amma." },
      { q: "¿Puede un adulto memorizar el Corán?", a: "Sí. Los adultos memorizan con éxito cuando eligen una cantidad realista, la sostienen y dedican al repaso tanto tiempo como a lo nuevo." },
      { q: "¿Cómo repasar lo memorizado para no olvidarlo?", a: "Repasando antes de añadir, con tres círculos: lo nuevo, lo reciente y lo antiguo. El repaso espaciado le indica qué aleyas están a punto de debilitarse." },
      { q: "¿Cuál es el mejor horario para memorizar el Corán?", a: "Uno en el que esté descansado y pueda concentrarse cada día. Muchas personas eligen la mañana temprano, pero la regularidad importa más que la hora." },
      { q: "¿Se puede memorizar el Corán sin profesor?", a: "Se puede avanzar mucho por cuenta propia, pero conviene recitar de vez en cuando ante alguien cualificado, para corregir errores que uno mismo no oye." },
      { q: "¿Qué es el Método Shams?", a: "Es un método de aprendizaje desarrollado por Nami Shams que recorre cada aleya en siete pasos, de la escucha a la reflexión. No es una nueva interpretación del Corán: las explicaciones proceden de obras de tafsir, con su fuente." },
      { q: "¿Es gratis?", a: "En la web, sí: el método, los planes y el repaso son gratuitos. La app de iOS usa la misma cuenta y ofrece además una suscripción opcional que abre el Método Shams para todas las suras." }
    ],
    linksTitle: "Recursos para memorizar",
    links: [["/shams", "Método Shams"], ["/shams/method", "Los siete pasos"], ["/plan", "Plan de 365 días"], ["/shams/mutashabihat", "Aleyas parecidas"], ["/shams/adab", "Adab de la memorización"], ["/academy", "Academia"], ["/sisters", "Para hermanas"], ["/guides/how-to-memorize-the-quran", "Guía (en inglés): cómo memorizar el Corán"], ["/app", "App para iOS"]],
    cta: ["/shams", "Comenzar con el Método Shams"]
  },

  "quran-radio": {
    title: "Radio del Corán online en directo, gratis",
    description: "Radio del Corán online con recitación continua: el Corán completo, el Yuz Amma, suras como Al-Kahf o Ya Sin y emisoras temáticas, con texto. Gratis.",
    kicker: "Radio",
    h1: "Radio del Corán online: recitación continua, cuando usted la necesite",
    intro: "La radio del Corán online de Quran Masterclass le permite escuchar recitación sin tener que elegir ni pulsar nada cada pocos minutos. Sirve para llenar la casa de un sonido sereno, acompañar las tareas, el trabajo o el estudio, o escuchar una sura querida antes de dormir.",
    answer: "La radio del Corán de Quran Masterclass reproduce recitación de forma continua en varias emisoras: el Corán completo, el Yuz Amma, suras concretas como Al-Kahf, Ya Sin o Al-Mulk y selecciones temáticas. Puede elegir el recitador, mostrar el texto con la traducción y programar un temporizador. En la web es gratuita, sin anuncios ni registro, y también funciona en la app de iOS con la misma cuenta.",
    sections: [
      {
        h2: "Radio del Corán en directo: qué es y qué no es",
        p: [
          "Aquí, radio significa emisión continua: elige una emisora, pulsa reproducir y la recitación sigue sola, aleya tras aleya y sura tras sura. Al llegar al final, la emisora vuelve a empezar o elige la siguiente sura al azar, según el caso.",
          "No es la retransmisión en vivo de una mezquita, sino recitaciones grabadas por recitadores reconocidos que se reproducen en su dispositivo. A cambio, puede pausar, saltar a la aleya siguiente o pasar a otra sura cuando quiera, y no depende del horario de nadie."
        ],
        links: [["/radio", "Abrir la radio"]]
      },
      {
        h2: "Emisoras para cada momento",
        p: [
          "Las emisoras principales ofrecen el Corán completo, de la sura 1 a la 114, el Yuz Amma con las suras cortas y la opción Sorpréndeme, que elige una sura al azar tras cada sura. Hay también versiones en muchas voces, en las que cada sura la recita alguien distinto.",
          "Las emisoras temáticas agrupan suras con un sentido común: Para niños, Antes de dormir, Viernes, Historias de los profetas, Suras queridas, Consuelo, Ramadán o Las primeras revelaciones. El Juz del día cambia de parte cada día, de modo que en treinta días recorre el Corán entero. Y hay emisoras de una sola sura, como Al-Baqara, Yusuf, Maryam o Al-Waqi'a, que se repiten una y otra vez."
        ],
        links: [["/surah/18", "Sura Al-Kahf"], ["/surah/36", "Sura Ya Sin"], ["/surah/12", "Sura Yusuf"]]
      },
      {
        h2: "Radio del Corán con varios recitadores",
        p: [
          "Puede escoger el recitador de su emisora o activar la mezcla de voces, que asigna un recitador distinto a cada sura. Escuchar varias voces le ayuda a descubrir estilos diferentes, desde la recitación pausada, ideal para aprender, hasta otras más melodiosas y ornamentadas.",
          "Si una voz le llega especialmente, en la sección de recitadores encontrará su biografía, su estilo y dónde seguir escuchándole."
        ],
        links: [["/reciters", "Recitadores"]]
      },
      {
        h2: "Radio del Corán para relajarse y para dormir",
        p: [
          "Muchas personas dejan la radio a volumen bajo al final del día. La emisora Antes de dormir reúne As-Sajda, Al-Mulk y las tres últimas suras del Corán, y el temporizador detiene la reproducción tras el tiempo que usted elija, para que no siga sonando toda la noche.",
          "La recitación puede aportar calma, pero esta página no promete efectos sobre la salud ni sustituye ningún tratamiento. Si tiene problemas de sueño persistentes, consulte a un profesional."
        ],
        links: [["/surah/67", "Sura Al-Mulk"], ["/surah/32", "Sura As-Sajda"]]
      },
      {
        h2: "Leer mientras se escucha: texto y traducción",
        p: [
          "Con la opción Mostrar texto y traducción, la aleya que suena aparece en pantalla en árabe y en español. Así la radio deja de ser solo un fondo sonoro y se convierte en una lectura acompañada.",
          "La lista Escuchado recientemente guarda las aleyas que han sonado. Si una le llama la atención, ábrala en el lector para leer su comentario, repetirla o guardarla en sus marcadores."
        ],
        links: [["/quran", "El Corán con traducción"], ["/quran-tafsir", "Tafsir del Corán"]]
      },
      {
        h2: "Radio o reproductor de suras: qué usar para estudiar",
        p: [
          "La radio es para escuchar sin decidir. Para aprender, el reproductor de cada sura ofrece más control: repetir cada aleya, repetir un pasaje en bucle, cambiar la velocidad o dejar una pausa tras cada aleya para que usted la recite.",
          "Una combinación que funciona: radio durante el día para familiarizarse con la melodía y, en un rato tranquilo, estudio en el reproductor de las aleyas que más le hayan llamado la atención.",
          "En el móvil, la radio funciona en el navegador y en la app de iOS con la misma cuenta. Para escuchar no hace falta registrarse; la cuenta sirve para guardar su progreso de estudio en todos sus dispositivos."
        ],
        links: [["/listen-quran", "Escuchar el Corán aleya por aleya"], ["/memorize-quran", "Memorizar el Corán"], ["/app", "App para iOS"]]
      }
    ],
    stepsTitle: "Cómo usar la radio",
    steps: [
      { title: "Abra la radio", body: "Entre en la página de la radio desde el navegador o desde la app." },
      { title: "Elija una emisora", body: "Principales, de voces cambiantes, temáticas o de una sola sura." },
      { title: "Elija el recitador", body: "O active la mezcla de voces para escuchar a un recitador distinto en cada sura." },
      { title: "Muestre el texto si lo desea", body: "Active el texto y la traducción para seguir lo que escucha." },
      { title: "Programe el temporizador", body: "Si la escucha para dormir, deje que se detenga sola." }
    ],
    faqTitle: "Preguntas frecuentes sobre la radio",
    faq: [
      { q: "¿Es gratis la radio del Corán?", a: "En la web, sí: es gratuita y sin anuncios. También puede escucharla en la app de iOS con la misma cuenta." },
      { q: "¿Necesito registrarme para escuchar?", a: "No. La cuenta gratuita solo sirve para guardar su progreso de estudio y sus marcadores." },
      { q: "¿Puedo elegir el recitador?", a: "Sí. Puede escoger la voz de cada emisora o activar la mezcla de voces." },
      { q: "¿Es una transmisión en vivo desde La Meca?", a: "No. Es una emisión continua de recitaciones grabadas que se reproduce en su dispositivo, sin cortes." },
      { q: "¿Hay radio del Corán en español?", a: "La recitación es siempre en árabe, como corresponde al Corán. La interfaz está en español y puede mostrar en pantalla la traducción al español de lo que suena." },
      { q: "¿Puedo escuchar la radio del Corán en el móvil?", a: "Sí, en el navegador del móvil y en la app de iOS. La radio está pensada para seguir sonando con la pantalla bloqueada." },
      { q: "¿Cómo hago que se apague sola por la noche?", a: "Con el temporizador, que detiene la radio cuando pasan los minutos que usted elija." },
      { q: "¿Sirve la radio para memorizar?", a: "Ayuda a familiarizarse con la melodía. Para memorizar es más eficaz repetir aleyas concretas en el reproductor de la sura." }
    ],
    linksTitle: "También le puede interesar",
    links: [["/radio", "Radio del Corán"], ["/reciters", "Recitadores"], ["/quran", "Corán completo"], ["/listen-quran", "Escuchar el Corán"], ["/surah/18", "Sura Al-Kahf"], ["/surah/67", "Sura Al-Mulk"], ["/prayer", "Horarios de oración"], ["/app", "App para iOS"]],
    cta: ["/radio", "Escuchar la radio"]
  },

  "listen-quran": {
    title: "Escuchar el Corán online con traducción y texto",
    description: "Escuche el Corán completo online: 114 suras, audio aleya por aleya, recitador a elegir, traducción al español y texto árabe. Gratis y sin anuncios.",
    kicker: "Audio",
    h1: "Escuchar el Corán online con texto y traducción",
    intro: "Escuchar el Corán es una de las formas más naturales de acercarse a él, sepa o no árabe. Aquí puede hacerlo sura por sura o aleya por aleya, con el texto delante, la traducción al español y el recitador que prefiera, y convertir cada escucha en un paso hacia la recitación, la memorización o la comprensión.",
    answer: "Para escuchar el Corán online basta con abrir una de las 114 suras en Quran Masterclass, elegir un recitador y pulsar reproducir: el texto árabe, la transliteración y la traducción al español acompañan al audio, y con los recitadores principales cada palabra se ilumina mientras se recita. Puede repetir una aleya, cambiar la velocidad, repetir un pasaje en bucle o dejarse una pausa para recitar usted. En la web es gratis y sin anuncios, y la app de iOS usa la misma cuenta.",
    sections: [
      {
        h2: "Escuchar una sura concreta o el Corán completo",
        p: [
          "En la lista de las 114 suras puede buscar por nombre o por número y abrir la que desee. Cada sura indica si es mequí o mediní y cuántas aleyas tiene; dentro de ella verá también la parte (yuz), el hizb y la página.",
          "Hay dos modos de escucha. En el modo Continuo, la recitación avanza sola hasta el final de la sura. En el modo Aprender, se detiene tras cada aleya y espera a que pulse Continuar, ideal cuando quiere detenerse en lo que acaba de oír. Si deja la escucha a medias, la plataforma le propone continuar donde lo dejó."
        ],
        links: [["/quran", "Las 114 suras"], ["/surah/2", "Sura Al-Baqara"], ["/surah/36", "Sura Ya Sin"]]
      },
      {
        h2: "Escuchar el Corán aleya por aleya, con texto árabe y traducción",
        p: [
          "Mientras suena el audio, el texto árabe aparece junto a la transliteración y la traducción al español, y con los recitadores principales cada palabra se ilumina en el momento en que se pronuncia. Puede tocar una palabra para oírla sola y ver su significado, y ajustar el tamaño de la letra árabe.",
          "Si prefiere la vista de lectura, que muestra el texto seguido como en un mushaf, puede alternarla con la vista por aleyas. Cuando una aleya le interese especialmente, abra su tafsir, guárdela en sus marcadores o escriba una nota personal."
        ],
        links: [["/quran-tafsir", "Tafsir junto a la aleya"], ["/vocab", "Vocabulario del Corán"]]
      },
      {
        h2: "Qué recitador elegir",
        p: [
          "En el reproductor puede elegir entre voces muy conocidas, como Mishary Alafasy, Abdul Basit Abdus Samad, Mahmoud Khalil Al-Husary o Mohamed Siddiq Al-Minshawi. Para aprender, muchas personas prefieren una recitación pausada y clara, como la de Al-Husary; para disfrutar de la melodía, otras eligen voces más ornamentadas.",
          "La sección de recitadores presenta a grandes recitadores del mundo, con su biografía, su estilo y dónde escucharles. Probar varias voces durante una semana es una buena forma de encontrar la suya."
        ],
        links: [["/reciters", "Recitadores"], ["/radio", "Radio con voces cambiantes"]]
      },
      {
        h2: "Escuchar el Corán para aprender a recitar",
        p: [
          "La escucha es el primer maestro de la recitación. Active Repetir cada aleya para oírla varias veces, baje la velocidad si el ritmo le resulta rápido y use la Pausa para repetir: tras cada aleya, el reproductor le deja exactamente el tiempo que dura para que la recite usted.",
          "El modo Escuchar y repetir del lector sigue el mismo principio, y la función Recitar y comprobar le permite grabarse y compararse con el recitador. Cuando quiera entender por qué algo se pronuncia así, las lecciones de tajwid le explican las reglas."
        ],
        links: [["/tajweed", "Lecciones de tajwid"], ["/arabic/read", "Curso de lectura"]]
      },
      {
        h2: "Escuchar para memorizar",
        p: [
          "Antes de intentar recitar de memoria, escuche: el Método Shams empieza precisamente con tres escuchas de la aleya, con la vista en el texto y sin traducir. Repetir en bucle un pasaje, de una aleya a otra, ayuda a fijar las transiciones entre aleyas.",
          "Una costumbre útil es volver a escuchar por la noche las aleyas aprendidas durante el día. Cuando ya las sepa, tape palabras o aleyas enteras en el lector y recítelas de memoria antes de comprobarlas."
        ],
        links: [["/shams", "Método Shams"], ["/memorize-quran", "Memorizar el Corán"]]
      },
      {
        h2: "Escuchar el Corán sin conexión, de noche o en el móvil",
        p: [
          "El reproductor permite guardar suras en el dispositivo para escucharlas sin conexión, por ejemplo en un viaje. El temporizador detiene la recitación tras unos minutos o al final de la sura, algo práctico si escucha antes de dormir.",
          "Todo funciona en el navegador del móvil y en la app de iOS con la misma cuenta, así que sus marcadores, notas y progreso le acompañan de un dispositivo a otro. Si solo quiere escuchar sin elegir nada, la radio reproduce recitación continua."
        ],
        links: [["/app", "App para iOS"], ["/quran-radio", "Radio del Corán online"]]
      }
    ],
    stepsTitle: "Escuchar el Corán, paso a paso",
    steps: [
      { title: "Elija una sura", body: "Búsquela por nombre o por número en la lista de las 114 suras." },
      { title: "Elija un recitador", body: "Pruebe varias voces y quédese con la que le resulte más clara." },
      { title: "Decida el modo", body: "Continuo para escuchar la sura entera; Aprender para detenerse tras cada aleya." },
      { title: "Siga el texto", body: "Lea el árabe, la transliteración o la traducción mientras escucha." },
      { title: "Repita lo que necesite", body: "Use la repetición de aleya, el bucle de un pasaje o la pausa para recitar." },
      { title: "Profundice", body: "Abra el tafsir de la aleya que más le haya llegado y escriba una nota." }
    ],
    faqTitle: "Preguntas frecuentes sobre escuchar el Corán",
    faq: [
      { q: "¿Se puede escuchar el Corán completo online?", a: "Sí, las 114 suras están disponibles con audio aleya por aleya." },
      { q: "¿Puedo escuchar el Corán y leer la traducción a la vez?", a: "Sí. El texto árabe, la transliteración y la traducción al español aparecen junto al audio." },
      { q: "¿Qué recitador es mejor para aprender?", a: "Para aprender suele recomendarse una recitación pausada y clara, como la de Al-Husary. Lo importante es que distinga bien cada palabra y que la voz le resulte agradable." },
      { q: "¿Puedo descargar el Corán en mp3?", a: "La plataforma está pensada para escuchar en línea. Para escuchar sin conexión, el reproductor permite guardar suras en el dispositivo; en la app, sin la suscripción opcional, el número de suras guardadas es limitado." },
      { q: "¿Puedo escuchar el Corán mientras duermo?", a: "Puede usar el temporizador para que la recitación se detenga sola tras unos minutos o al final de la sura." },
      { q: "¿Se puede escuchar el Corán sin anuncios?", a: "Sí. En la web, la escucha es gratuita y no tiene anuncios." },
      { q: "¿Funciona en el móvil?", a: "Sí, en el navegador del móvil y en la app de iOS, con la misma cuenta." },
      { q: "¿Puedo escuchar una sola aleya muchas veces?", a: "Sí, con Repetir cada aleya o con el bucle, que repite el pasaje entre dos aleyas que usted elija." }
    ],
    linksTitle: "Más para escuchar",
    links: [["/quran", "El Corán"], ["/reciters", "Recitadores"], ["/radio", "Radio"], ["/surah/36", "Sura Ya Sin"], ["/surah/55", "Sura Ar-Rahman"], ["/surah/67", "Sura Al-Mulk"], ["/shams", "Método Shams"], ["/app", "App para iOS"]],
    cta: ["/quran", "Elegir una sura para escuchar"]
  },

  "tawbah": {
    title: "Tawba: el arrepentimiento en el islam y volver a Alá",
    description: "Qué es la tawba, el arrepentimiento en el islam: volver a Alá con esperanza, el istighfar, primeros pasos, la oración y el Corán. Sin juicios. Gratis.",
    kicker: "Volver con calma",
    h1: "Tawba, el arrepentimiento en el islam: volver a Alá sin prisas ni juicios",
    intro: "La tawba, el arrepentimiento en el islam, significa literalmente volver. Si siente que se ha alejado y desea regresar, esta página es para usted: explica qué es la tawba, en qué se diferencia del istighfar y qué pasos pequeños y concretos pueden ayudarle a empezar de nuevo, sin sermones y sin juicios.",
    answer: "La tawba es el arrepentimiento sincero y el regreso a Alá; la palabra árabe significa volver. En la enseñanza islámica va unida a la esperanza: se reconoce el error, se pide perdón, se deja lo que aleja y se decide cambiar, reparando lo que se deba a otras personas. Quran Masterclass ofrece en su web gratuita recursos para ese camino, como duas de perdón, la guía de la oración y del wudu y el Corán con traducción; para preguntas personales, consulte a un sabio o imán de confianza de su escuela.",
    sections: [
      {
        h2: "Qué es la tawba en el islam",
        p: [
          "Tawba procede de una raíz árabe que significa volver. Quien hace tawba vuelve hacia Alá, y uno de Sus nombres, At-Tawwab, describe a quien acoge una y otra vez al que regresa. La novena sura se llama At-Tawba, y la expresión tawba nasuh, un arrepentimiento sincero, aparece en la sura At-Tahrim (66).",
          "La enseñanza islámica no presenta la tawba como un trámite reservado a quienes cometieron faltas graves, sino como algo que acompaña la vida de todo creyente. Por eso se habla de ella con un tono de esperanza: el regreso es posible y es bienvenido."
        ],
        links: [["/surah/9", "Sura At-Tawba"], ["/surah/66", "Sura At-Tahrim"], ["/islam/names", "Los 99 nombres de Alá"]]
      },
      {
        h2: "Qué es el istighfar y cuándo se dice",
        p: [
          "Istighfar significa pedir perdón a Alá. Su forma más conocida es la palabra astaghfirullah, que muchos musulmanes repiten a lo largo del día, después de la oración o en los recuerdos de la mañana y de la tarde. Es una costumbre sencilla que mantiene el corazón atento.",
          "La tawba es más amplia: incluye pedir perdón y la decisión de cambiar de rumbo. El istighfar es la palabra; la tawba, el camino. La colección de duas tiene una categoría dedicada al perdón, con texto árabe, transliteración, traducción y fuente, y el generador de dua le ayuda a componer una súplica personal con sus propias palabras."
        ],
        links: [["/duas", "Duas de perdón"], ["/dua-generator", "Generador de dua"]]
      },
      {
        h2: "Cómo hacer tawba paso a paso",
        p: [
          "Los sabios suelen describir la tawba con unos pasos comunes: reconocer con honestidad lo que estuvo mal, sentir pesar, dejarlo en la medida de lo posible y proponerse no volver. Si el error afectó a otra persona, se añade reparar lo que se le deba.",
          "En la vida diaria, puede empezar hoy: busque un momento a solas, hable con Alá con sus propias palabras, en español si lo prefiere, y elija un único cambio que pueda sostener esta semana. No espere a sentirse preparado; la tawba se hace caminando.",
          "Si hay derechos de otras personas, deudas o situaciones delicadas de por medio, pida orientación a un sabio o imán de confianza de su escuela antes de actuar."
        ],
        links: [["/learn-islam", "Aprender sobre el islam"]]
      },
      {
        h2: "Cómo volver a Alá después de un tiempo lejos",
        p: [
          "Haber estado lejos meses o años no cierra la puerta. Lo importante es el paso que se da ahora, no la distancia recorrida hasta aquí. Evite compararse con quienes parecen más firmes: no conoce sus luchas, y nadie le pide ser hoy lo que otros tardaron años en llegar a ser.",
          "Ayudan las pequeñas anclas diarias: unos minutos de Corán con la traducción, una súplica antes de dormir, un gesto de bondad. Muchas personas encuentran consuelo en suras como Ad-Duha (93) o Ash-Sharh (94), que la radio reúne en su emisora Consuelo."
        ],
        links: [["/listen-quran", "Escuchar el Corán"], ["/surah/93", "Sura Ad-Duha"], ["/surah/94", "Sura Ash-Sharh"]]
      },
      {
        h2: "Cómo volver a rezar después de dejar la oración",
        p: [
          "Para muchas personas, volver a Alá empieza por volver a rezar. No hace falta retomar las cinco oraciones el primer día: empiece con una, la que mejor encaje en su jornada, y añada otra cuando esa sea ya costumbre.",
          "Si ha olvidado los pasos, el entrenador de wudu y el de la oración le permiten repasarlos en privado, en forma sunní o chií, y los horarios le indican cuándo empieza cada oración. Qué hacer con las oraciones no rezadas lo tratan las escuelas de manera distinta; consúltelo a una persona de conocimiento. Más abajo encontrará un artículo dedicado a volver a rezar."
        ],
        links: [["/wudu", "Entrenador de wudu"], ["/salah", "Entrenador de la oración"], ["/prayer", "Horarios de oración"]]
      },
      {
        h2: "Qué hacer si recae o siente que se ha alejado de Alá",
        p: [
          "Recaer en un hábito no borra lo que ya ha andado. La enseñanza islámica valora a quien vuelve una y otra vez; la respuesta a una caída no es abandonar, sino volver a pedir perdón y retomar el plan donde lo dejó.",
          "A veces el obstáculo no es la fe, sino algo más difícil de controlar, como una adicción, una depresión o una situación de abuso. Buscar ayuda médica o psicológica es compatible con la fe y, a menudo, necesario. Si atraviesa una crisis o piensa en hacerse daño, contacte con un médico o con los servicios de emergencia de su país."
        ],
        links: [["/duas", "Duas para los momentos difíciles"]]
      },
      {
        h2: "Empezar de nuevo en la fe, a su ritmo",
        p: [
          "Volver también es aprender. Si quiere repasar lo esencial, la sección del islam explica la fe, la oración y la vida diaria con contenido sunní y chií; en los puntos donde hay diferencias, siga lo que enseña su escuela.",
          "Y si desea reconectar con el Corán de forma constante, el Método Shams le guía aleya por aleya, empezando por Al-Fatiha, con escucha, significado y una breve reflexión personal en cada aleya."
        ],
        links: [["/islam", "Fundamentos del islam"], ["/shams", "Método Shams"], ["/surah/1", "Sura Al-Fatiha"]]
      }
    ],
    stepsTitle: "Un camino de regreso en seis pasos",
    steps: [
      { title: "Deténgase y reconozca", body: "Tómese un momento a solas para nombrar con honestidad lo que desea cambiar." },
      { title: "Pida perdón con sus palabras", body: "Hable con Alá en su idioma o apóyese en una dua de la colección." },
      { title: "Deje lo que pueda dejar hoy", body: "Elija un cambio concreto y realista para esta semana." },
      { title: "Retome una oración", body: "Empiece por una al día, con el wudu repasado, y aumente poco a poco." },
      { title: "Repare con orientación", body: "Si hay derechos de otras personas de por medio, pida consejo a una persona de conocimiento antes de actuar." },
      { title: "Mantenga un hilo diario", body: "Unos minutos de Corán o una súplica cada día; si un día falla, vuelva al siguiente." }
    ],
    faqTitle: "Preguntas frecuentes sobre la tawba",
    faq: [
      { q: "¿Qué significa tawba en el islam?", a: "Significa volver: es el arrepentimiento sincero y el regreso a Alá. Incluye reconocer el error, pedir perdón, dejar lo que aleja y decidir cambiar." },
      { q: "¿Cómo hacer tawba paso a paso?", a: "Reconozca lo que estuvo mal, pida perdón a Alá con sinceridad, deje lo que pueda dejar y propóngase no volver a ello. Si afectó a otras personas, busque la forma de reparar, con orientación cuando sea necesario." },
      { q: "¿Qué es el istighfar y cuándo se dice?", a: "Es pedir perdón a Alá, por ejemplo con la palabra astaghfirullah. Muchos musulmanes lo dicen a diario, después de la oración y en los recuerdos de la mañana y de la tarde." },
      { q: "¿Cómo pedir perdón a Alá de corazón?", a: "Con sinceridad y sin prisa, en un momento a solas y con sus propias palabras. Las duas de perdón de la colección pueden ayudarle a encontrar la forma." },
      { q: "¿Qué hago si siento que me he alejado de Alá?", a: "Dé hoy un paso pequeño, aunque no se sienta preparado: una oración, unos minutos de Corán o una súplica. El regreso se construye con pasos, no esperando el momento perfecto." },
      { q: "¿Qué pasa si recaigo después de arrepentirme?", a: "Vuelva a pedir perdón y retome su plan. Una recaída no anula el camino recorrido; si se trata de una adicción, busque también ayuda profesional." },
      { q: "¿Hay una dua para pedir perdón?", a: "Sí, hay súplicas del Corán y de la Sunna dedicadas al perdón. En la colección de duas las encontrará con texto árabe, transliteración, traducción y fuente." },
      { q: "¿Esta página emite dictámenes?", a: "No. Es una ayuda práctica y general. Para su situación concreta, hable con un sabio o imán de confianza de la escuela que usted sigue." }
    ],
    linksTitle: "Recursos para volver",
    links: [["/duas", "Duas"], ["/dua-generator", "Generador de dua"], ["/islam/names", "99 nombres de Alá"], ["/wudu", "Entrenador de wudu"], ["/salah", "Guía de la oración"], ["/prayer", "Horarios de oración"], ["/listen-quran", "Escuchar el Corán"], ["/islam", "Fundamentos del islam"], ["/surah/9", "Sura At-Tawba"]],
    cta: ["/duas", "Ver las duas de perdón"]
  },

  "learn-salah": {
    title: "Aprender a rezar el salat paso a paso",
    description: "Aprenda a rezar el salat desde cero: las cinco oraciones y sus horarios, el wudu, las posturas y qué se recita. Con forma sunní y chií. Gratis.",
    kicker: "Oración",
    h1: "Aprender a rezar el salat: la oración, explicada paso a paso",
    intro: "Aprender a rezar el salat por primera vez, o volver a hacerlo tras mucho tiempo, puede intimidar. Esta guía le acompaña con calma: qué se necesita para empezar, cuándo es cada oración, cómo se hacen las posturas, qué se recita y cómo memorizarlo poco a poco, con la forma sunní y la chií explicadas por separado.",
    answer: "El salat es la oración ritual del islam y se reza cinco veces al día: fayr, dhuhr, asr, maghrib e isha, en horarios que dependen del lugar y de la fecha. Para aprender a rezar se necesita conocer los horarios y la qibla, hacer el wudu, aprender el orden de las posturas y, poco a poco, lo que se recita en árabe. Quran Masterclass ofrece en su web gratuita un entrenador de la oración en forma sunní y chií (yafarí), un entrenador de wudu y los horarios de su ciudad; en los detalles, siga lo que enseña su escuela.",
    sections: [
      {
        h2: "Qué se necesita para empezar a rezar",
        p: [
          "Para rezar se necesita estar en estado de pureza ritual, lo que en la práctica significa haber hecho el wudu, y tener el cuerpo, la ropa y el lugar limpios. Se reza orientado hacia la qibla, la dirección de la Kaaba en La Meca, una vez que ha entrado la hora de la oración y con la intención de rezar esa oración concreta.",
          "Cómo se cubre el cuerpo, qué se considera impureza y otros detalles los explica cada escuela con matices propios. Para empezar basta con lo esencial: un lugar tranquilo y limpio, una alfombra o una tela si la tiene, la dirección de la qibla y el wudu bien hecho."
        ],
        links: [["/wudu", "Entrenador de wudu"], ["/learn-wudu", "Guía del wudu"]]
      },
      {
        h2: "Cuáles son las cinco oraciones diarias y cuándo es cada una",
        p: [
          "El fayr se reza al alba, antes de la salida del sol; el dhuhr, pasado el mediodía; el asr, por la tarde; el maghrib, tras la puesta del sol; y el isha, por la noche. Según la práctica común de sunníes y chiíes, para quien no está de viaje tienen respectivamente dos, cuatro, cuatro, tres y cuatro rakat obligatorios. En la tradición chií es habitual rezar el dhuhr junto con el asr y el maghrib junto con el isha.",
          "Como los horarios cambian cada día y según la ciudad, lo práctico es consultarlos en la página de horarios, que los calcula en su dispositivo, sin seguimiento. Puede elegir el método de cálculo que usa su mezquita, incluido el asr más tardío de la escuela hanafí, ver la dirección de la qibla con una brújula en el móvil e imprimir el horario del mes. Compárelo siempre con su mezquita local."
        ],
        links: [["/prayer", "Horarios de oración y qibla"], ["/calendar", "Calendario islámico"]]
      },
      {
        h2: "Cómo rezar paso a paso: posturas y movimientos",
        p: [
          "Cada oración se compone de unidades llamadas rakat. Una rakat incluye, a grandes rasgos, estar de pie recitando, inclinarse (ruku), volver a erguirse y postrarse dos veces (suyud) con una breve sentada entre ambas postraciones. Tras la segunda rakat y al final de la oración se permanece sentado para el tashahhud, y la oración se cierra con el saludo.",
          "La forma sunní y la chií coinciden en esta estructura y difieren en algunos detalles, como la posición de las manos al estar de pie, el qunut, la superficie sobre la que se apoya la frente o las fórmulas finales; también entre las escuelas sunníes hay matices. El entrenador de la oración le deja elegir la oración y la tradición, y una figura muestra cada postura con las palabras en árabe, la transliteración y el significado. Puede reproducir toda la secuencia o avanzar paso a paso."
        ],
        links: [["/salah", "Entrenador de la oración"], ["/islam/prayer-sunni", "Oración sunní"], ["/islam/prayer-shia", "Oración chií"]]
      },
      {
        h2: "Cómo memorizar lo que se recita en la oración",
        p: [
          "Lo imprescindible es Al-Fatiha, que se recita en cada oración, y una sura corta para las dos primeras rakat, como Al-Ijlas. A ellas se suman fórmulas breves: el takbir para empezar, las alabanzas en la inclinación y en la postración, el tashahhud y el saludo final.",
          "Apréndalas por partes: primero el orden de las posturas, después Al-Fatiha y, por último, las fórmulas de cada postura. Mientras no las sepa de memoria, apóyese en la transliteración y en el audio del entrenador. El Método Shams es especialmente útil para Al-Fatiha y las suras cortas, y conocer su significado ayuda a rezar con atención."
        ],
        links: [["/surah/1", "Sura Al-Fatiha"], ["/surah/112", "Sura Al-Ijlas"], ["/shams", "Método Shams"]]
      },
      {
        h2: "Cómo aprender a rezar de adulto o como nuevo musulmán",
        p: [
          "Si es nuevo en el islam o aprende de adulto, no se exija rezar a la perfección desde el primer día. Muchas personas empiezan por una oración al día mientras aprenden y añaden las demás a medida que ganan seguridad. Lo importante es avanzar de forma constante.",
          "Rezar alguna vez junto a alguien con experiencia, en casa o en la mezquita, aclara en pocos minutos dudas que cuesta resolver a solas. Pregunte sin vergüenza: el imán o una persona de confianza de su comunidad le ayudarán con los detalles de su escuela."
        ],
        links: [["/learn-islam", "Aprender sobre el islam"], ["/arabic/read", "Leer árabe desde cero"]]
      },
      {
        h2: "Cómo se reza en casa, con ayuda de la app",
        p: [
          "Elija un rincón limpio y tranquilo, oriéntese hacia la qibla y avise a quienes viven con usted de que va a rezar. Atar cada oración a un momento fijo del día, como al despertar, al volver del trabajo o antes de cenar, facilita que se convierta en costumbre.",
          "La página de horarios puede avisarle en cada hora de oración mientras está abierta en el navegador, y muestra también los momentos de la noche y la hora de la oración del duha para quien quiera ir más allá. En la app de iOS tiene el entrenador, los horarios y el Corán con la misma cuenta."
        ],
        links: [["/prayer", "Avisos de oración"], ["/app", "App para iOS"]]
      }
    ],
    stepsTitle: "Aprender a rezar en seis pasos",
    steps: [
      { title: "Consulte los horarios y la qibla", body: "Sepa cuándo empieza cada oración en su ciudad y hacia dónde orientarse." },
      { title: "Aprenda el wudu", body: "Practíquelo con el entrenador hasta que el orden le salga solo." },
      { title: "Aprenda el orden de las posturas", body: "Elija su tradición en el entrenador y repase la secuencia completa." },
      { title: "Memorice Al-Fatiha", body: "Con audio, transliteración y significado, aleya por aleya." },
      { title: "Añada una sura corta y las fórmulas", body: "Al-Ijlas y lo que se dice en cada postura, poco a poco." },
      { title: "Rece una oración al día y aumente", body: "Cuando una oración sea costumbre, añada la siguiente." }
    ],
    faqTitle: "Preguntas frecuentes sobre la oración",
    faq: [
      { q: "¿Cuántas veces se reza al día y cuántos rakat tiene cada oración?", a: "Cinco veces: fayr, dhuhr, asr, maghrib e isha. Según la práctica común de sunníes y chiíes, tienen dos, cuatro, cuatro, tres y cuatro rakat obligatorios para quien no está de viaje." },
      { q: "¿Qué se necesita para empezar a rezar?", a: "Haber hecho el wudu, tener el cuerpo, la ropa y el lugar limpios, conocer la hora de la oración y orientarse hacia la qibla. Los detalles los explica cada escuela." },
      { q: "¿Tengo que saber árabe para rezar?", a: "Lo que se recita en la oración se dice en árabe, pero no hace falta hablar el idioma. Se aprende con audio y transliteración, y conviene conocer el significado." },
      { q: "¿Qué hago mientras no me lo sé todo de memoria?", a: "Aprenda primero lo imprescindible y apóyese en el entrenador para el resto. Cómo rezar mientras se aprende es algo que las escuelas tratan con matices; pregunte a una persona de conocimiento de la suya." },
      { q: "¿Cuándo es cada oración del día?", a: "Depende de la posición del sol en su ciudad y cambia cada día. La página de horarios la calcula para su ubicación." },
      { q: "¿Es igual la oración sunní y la chií?", a: "Comparten la estructura y difieren en algunos detalles. El entrenador y las guías del sitio muestran ambas formas por separado." },
      { q: "¿Qué hago si me equivoco durante la oración?", a: "Es normal al principio. Las escuelas enseñan formas de compensar ciertos olvidos; pregunte a un imán o a una persona de conocimiento de la suya." },
      { q: "¿Es gratis?", a: "En la web, sí: el entrenador de la oración, el de wudu y los horarios son gratuitos y sin anuncios. La app de iOS usa la misma cuenta." }
    ],
    linksTitle: "Recursos para rezar",
    links: [["/salah", "Aprender a rezar"], ["/wudu", "Entrenador de wudu"], ["/prayer", "Horarios de oración"], ["/islam/prayer-sunni", "Oración sunní"], ["/islam/prayer-shia", "Oración chií"], ["/surah/1", "Sura Al-Fatiha"], ["/arabic/read", "Leer árabe"], ["/duas", "Duas"], ["/learn-wudu", "Aprender el wudu"]],
    cta: ["/salah", "Comenzar a aprender a rezar"]
  },

  "learn-wudu": {
    title: "Aprender el wudu: la ablución paso a paso, gratis",
    description: "Aprenda el wudu con un entrenador interactivo: los pasos de la ablución en forma sunní y chií, lo obligatorio y lo recomendado, y un cuestionario final.",
    kicker: "Ablución",
    h1: "Aprender el wudu: cómo hacer la ablución paso a paso",
    intro: "Aprender el wudu bien da tranquilidad cada vez que se prepara para rezar. El wudu es la ablución con agua que precede a la oración; se aprende rápido si se practica el orden de los gestos, y aquí encontrará qué incluye, cómo varía según la escuela, qué se dice y qué errores conviene evitar.",
    answer: "El wudu es la ablución ritual con agua que se realiza antes de la oración: con la intención, se lava el rostro, se lavan los brazos, se pasa la mano húmeda por la cabeza y se lavan los pies o se pasa la mano por ellos, en un orden fijo. Las escuelas sunníes y la tradición chií (yafarí) coinciden en lo esencial y difieren en algunos detalles. El entrenador de Quran Masterclass, gratuito en la web, muestra cada paso en ambas formas, distingue lo obligatorio de lo recomendado y termina con un cuestionario sobre el orden.",
    sections: [
      {
        h2: "Qué es el wudu y cuándo se hace",
        p: [
          "El wudu es la purificación menor que se hace con agua antes de la oración. Su base está en el propio Corán: la llamada aleya del wudu, en la sura Al-Ma'ida (5), menciona el rostro, los brazos hasta los codos, la cabeza y los pies hasta los tobillos. La Sunna del Profeta muestra cómo se realiza en la práctica.",
          "Además de antes de rezar, muchas personas hacen el wudu antes de leer el Corán, como señal de respeto. Si es obligatorio para tocar el mushaf y qué ocurre al leer de memoria o desde una pantalla son cuestiones que las escuelas tratan con matices distintos; consulte lo que enseña la suya."
        ],
        links: [["/surah/5", "Sura Al-Ma'ida"], ["/wudu", "Entrenador de wudu"]]
      },
      {
        h2: "Pasos del wudu para principiantes",
        p: [
          "De forma resumida, el wudu empieza con la intención y continúa con el lavado del rostro, el de los brazos hasta los codos, empezando por el derecho, el paso de la mano húmeda por la cabeza y, por último, los pies hasta los tobillos. En la práctica sunní habitual se lavan antes las manos, la boca y la nariz, y la mayoría de los gestos se repiten tres veces.",
          "El entrenador recorre cada paso con una ilustración, indica cuántas veces se hace y por qué lado se empieza, y marca qué es obligatorio y qué es recomendable. Donde las escuelas sunníes difieren entre sí en un punto, una nota lo indica.",
          "El orden importa: hacer cada gesto en su sitio evita dudas y olvidos, sobre todo al principio. Por eso el entrenador termina con un cuestionario sobre el orden de los pasos. Repítalo hasta acertarlo sin pensar y lleve después ese orden a la práctica con agua, unos días seguidos, antes de cada oración."
        ],
        links: [["/wudu", "Practicar con el entrenador"], ["/learn-salah", "Después: aprender a rezar"]]
      },
      {
        h2: "El wudu según la escuela que se siga",
        p: [
          "Sunníes y chiíes coinciden en lo esencial, pero hay diferencias conocidas. En la forma yafarí, por ejemplo, los brazos se lavan desde el codo hacia los dedos y los pies no se lavan, sino que se pasa por ellos la mano húmeda; en la práctica sunní, los pies se lavan. También entre las escuelas sunníes hay matices, por ejemplo sobre qué parte de la cabeza se pasa o qué gestos son obligatorios.",
          "El entrenador muestra la forma sunní común y la forma yafarí por separado. Este sitio no decide por usted: siga lo que enseña la escuela a la que pertenece y, ante una duda, pregunte a una persona de conocimiento."
        ],
        links: [["/islam/madhahib", "Las escuelas del islam"], ["/islam/prayer-sunni", "Wudu y oración: forma sunní"], ["/islam/prayer-shia", "Wudu y oración: forma chií"]]
      },
      {
        h2: "Qué decir al hacer el wudu",
        p: [
          "Al empezar es habitual decir bismillah, en el nombre de Alá. Al terminar, muchas personas pronuncian el testimonio de fe y una breve súplica; el entrenador muestra estas fórmulas con el texto árabe, la transliteración, el significado y la fuente.",
          "La intención es, ante todo, la decisión consciente de purificarse para la oración. Si además se expresa con palabras, y cómo, es algo que cada escuela explica a su manera."
        ],
        links: [["/duas", "Duas"]]
      },
      {
        h2: "Qué anula el wudu y qué hacer sin agua",
        p: [
          "Todas las escuelas coinciden en que el wudu se anula cuando salen del cuerpo orina, heces o gases, con el sueño profundo y con la pérdida del conocimiento. Otros casos, como el contacto físico, el sangrado u otras secreciones, se juzgan de forma distinta según la escuela; pregunte por ellos a un maestro de la suya.",
          "Si no hay agua o su uso le perjudicaría, existe el tayammum, la purificación con tierra limpia, mencionada también en la sura Al-Ma'ida. Cómo se realiza exactamente lo describen las escuelas con algunas diferencias; la página del wudu lo explica con más detalle."
        ],
        links: [["/wudu", "Wudu y tayammum"]]
      },
      {
        h2: "Errores comunes al hacer el wudu",
        p: [
          "Los fallos más frecuentes son fáciles de evitar: dejar zonas secas, sobre todo en los talones, los codos o entre los dedos; alterar el orden; hacerlo con prisa; o no retirar algo que impide que el agua llegue a la piel, cuestión que cada escuela concreta. Tómese su tiempo las primeras semanas.",
          "Otro error habitual es el contrario: gastar mucha agua o repetir gestos por inseguridad. La moderación también forma parte del wudu. Si las dudas se vuelven constantes, coméntelo con un imán o maestro de su escuela; a menudo una explicación en persona basta para disiparlas."
        ],
        links: [["/prayer", "Horarios de oración"]]
      }
    ],
    stepsTitle: "Practique el wudu en seis pasos",
    steps: [
      { title: "Lea qué es el wudu", body: "Empiece por la página del wudu y la aleya en la que se basa." },
      { title: "Elija su tradición", body: "En el entrenador, seleccione la forma sunní o la yafarí." },
      { title: "Siga cada paso", body: "Observe la ilustración, cuántas veces se hace cada gesto y por qué lado se empieza." },
      { title: "Haga el cuestionario", body: "Ordene los pasos hasta acertarlos sin dudar." },
      { title: "Practique con agua", body: "Repita el wudu completo en casa unos días seguidos, sin prisa." },
      { title: "Pregunte lo que no esté claro", body: "Consulte los matices de su escuela a un imán o a un maestro." }
    ],
    faqTitle: "Preguntas frecuentes sobre el wudu",
    faq: [
      { q: "¿Qué es el wudu?", a: "Es la ablución ritual con agua que se hace antes de la oración: el rostro, los brazos, la cabeza y los pies, en un orden fijo y con intención." },
      { q: "¿Cuál es el orden del wudu?", a: "Intención, rostro, brazos hasta los codos empezando por el derecho, cabeza y pies. En la práctica sunní habitual se lavan antes las manos, la boca y la nariz. El entrenador muestra el orden exacto de cada tradición." },
      { q: "¿Hace falta el wudu para leer el Corán?", a: "Muchas personas lo hacen por respeto. Si es obligatorio para tocar el mushaf y qué ocurre al leer de memoria o en una pantalla depende de la escuela; consulte la suya." },
      { q: "¿Qué anula el wudu?", a: "Todas las escuelas coinciden en la salida de orina, heces o gases, el sueño profundo y la pérdida del conocimiento. Otros casos dependen de la escuela." },
      { q: "¿Es igual el wudu sunní y el chií?", a: "Coinciden en lo esencial y difieren en detalles, como lavar los pies o pasar la mano por ellos. Siga la escuela a la que pertenece." },
      { q: "¿Qué se dice al terminar el wudu?", a: "Muchas personas pronuncian el testimonio de fe y una breve súplica. El entrenador las muestra con texto árabe, transliteración, significado y fuente." },
      { q: "¿Qué hago si no hay agua?", a: "Existe el tayammum, la purificación con tierra limpia, para cuando no hay agua o usarla perjudica. Los detalles varían según la escuela." },
      { q: "¿Es gratis el entrenador de wudu?", a: "En la web, sí: es gratuito y sin anuncios. La app de iOS usa la misma cuenta." }
    ],
    linksTitle: "Relacionado",
    links: [["/wudu", "Entrenador de wudu"], ["/salah", "Aprender a rezar"], ["/learn-salah", "Guía para aprender a rezar"], ["/prayer", "Horarios de oración"], ["/islam/prayer-sunni", "Oración sunní"], ["/islam/prayer-shia", "Oración chií"], ["/duas", "Duas"], ["/tawbah", "Volver a Alá"]],
    cta: ["/wudu", "Practicar el wudu"]
  },

  "learn-islam": {
    title: "Aprender sobre el islam desde cero: guía neutral",
    description: "Introducción clara al islam: qué creen los musulmanes, los pilares, el Corán, la oración, sunníes y chiíes, y por dónde empezar. Sin juicios. Gratis.",
    kicker: "Fundamentos",
    h1: "Aprender sobre el islam desde cero, con calma y sin prisas",
    intro: "Ya sea por curiosidad, por estudios o porque ha decidido acercarse a la fe, esta página le ayuda a aprender sobre el islam paso a paso, con explicaciones claras y neutrales. Encontrará qué creen los musulmanes, cómo se practica la fe, qué distingue a sunníes y chiíes y por dónde empezar en Quran Masterclass.",
    answer: "El islam es una religión monoteísta basada en la fe en un único Dios, Alá, en los profetas, con Muhammad como el último, y en el Corán como palabra revelada. Su práctica incluye la profesión de fe, la oración diaria, el zakat, el ayuno de Ramadán y la peregrinación a La Meca. Quran Masterclass explica estos fundamentos en su web gratuita, de forma neutral, con contenido sunní y chií, y en las diferencias remite a la escuela que usted siga.",
    sections: [
      {
        h2: "Qué es el islam y qué creen los musulmanes",
        p: [
          "La palabra islam procede de una raíz árabe relacionada con la paz y la entrega, y designa la entrega consciente a Dios. Los musulmanes creen en un único Dios, Alá, que es la palabra árabe para Dios y la que usan también los cristianos de lengua árabe. Creen en una larga cadena de profetas, entre ellos Abraham, Moisés y Jesús, que culmina en el profeta Muhammad.",
          "El Corán es para los musulmanes la palabra de Alá, revelada a Muhammad a lo largo de unos veintitrés años, y la Sunna, su ejemplo y sus enseñanzas, ayuda a entenderlo y a vivirlo. Las páginas introductorias del sitio explican estos puntos con un lenguaje sencillo."
        ],
        links: [["/islam/islam", "Qué es el islam"], ["/islam/prophet", "El Profeta"], ["/islam/quran", "El Corán"]]
      },
      {
        h2: "Los fundamentos de la fe musulmana",
        p: [
          "En la tradición sunní se suele hablar de seis artículos de fe: creer en Alá, en sus ángeles, en sus libros revelados, en sus mensajeros, en el Último Día y en el decreto divino. La tradición chií resume los fundamentos de la religión (usul al-din) en cinco: la unicidad de Dios, su justicia, la profecía, el imamato y el retorno en el Día del Juicio.",
          "Ambas formulaciones comparten el núcleo: un solo Dios, la profecía y la vida después de la muerte. Conocer los 99 nombres de Alá, que el sitio presenta con su significado, es una buena puerta para entender cómo describe el islam a Dios."
        ],
        links: [["/islam/iman", "La fe (iman)"], ["/islam/names", "Los 99 nombres de Alá"]]
      },
      {
        h2: "Cuáles son los cinco pilares del islam",
        p: [
          "La práctica se resume a menudo en cinco pilares: la shahada o profesión de fe, la oración cinco veces al día, el zakat o contribución anual para quienes cumplen ciertas condiciones, el ayuno del mes de Ramadán y la peregrinación a La Meca una vez en la vida para quien puede hacerla.",
          "La tradición chií ordena la práctica en las llamadas ramas de la religión (furu al-din), que incluyen igualmente la oración, el ayuno, el zakat y la peregrinación, además del jums y otros deberes. Sea cual sea la formulación, la oración diaria es para los musulmanes el centro de la práctica."
        ],
        links: [["/learn-salah", "Aprender a rezar"], ["/islam/ramadan", "Ramadán"], ["/islam/hajj", "La peregrinación"]]
      },
      {
        h2: "Qué es el islam sunní y el islam chií",
        p: [
          "Sunníes y chiíes comparten el Corán, la oración hacia La Meca, el ayuno y la peregrinación. Su separación tiene un origen histórico en la cuestión de quién debía dirigir a la comunidad tras la muerte del Profeta, y con el tiempo dio lugar a tradiciones de derecho y de pensamiento propias.",
          "Dentro del islam sunní existen cuatro escuelas jurídicas principales, la hanafí, la malikí, la shafií y la hanbalí; en el islam chií, la más extendida es la yafarí. Quran Masterclass presenta estas tradiciones con respeto y sin tomar partido, y ofrece también textos muy valorados en la tradición chií, como el Nahy al-Balagha. En los puntos de diferencia, siga lo que enseña la escuela que usted sigue."
        ],
        links: [["/islam/madhahib", "Las escuelas del islam"], ["/nahj", "Nahy al-Balagha"]]
      },
      {
        h2: "Qué debe saber un recién convertido al islam",
        p: [
          "Si acaba de pronunciar la shahada o está pensando en hacerlo, no tiene que aprenderlo todo a la vez. Las prioridades suelen ser aprender a rezar paso a paso, empezando por el wudu y Al-Fatiha, conocer lo básico de la fe y encontrar una comunidad o una persona de confianza que le acompañe.",
          "Desconfíe de las prisas y de las polémicas en internet. Avance con calma, pregunte a un imán o a una persona de conocimiento de su entorno y cuide la relación con su familia y sus amistades. Esta plataforma es un apoyo de estudio, no una autoridad religiosa."
        ],
        links: [["/learn-wudu", "Aprender el wudu"], ["/surah/1", "Sura Al-Fatiha"], ["/learn-quran", "Aprender el Corán"]]
      },
      {
        h2: "La vida diaria: halal y haram, fiestas y calendario",
        p: [
          "Halal significa permitido y haram, prohibido. La página dedicada repasa alimentación, dinero, ropa, medios y trabajo, distinguiendo lo permitido, lo prohibido y lo discutido, con fuentes y la posición de las escuelas; sirve para orientarse, no como dictamen sobre su caso.",
          "El año islámico sigue un calendario lunar; por eso el Ramadán y las dos fiestas, el Eid al-Fitr y el Eid al-Adha, se adelantan cada año unos once días respecto al calendario gregoriano. El calendario del sitio muestra la fecha hégira de hoy y las fechas importantes del año."
        ],
        links: [["/islam/halal-haram", "Halal y haram"], ["/islam/daily", "La vida diaria"], ["/calendar", "Calendario islámico"], ["/islam/eid", "Las fiestas del Eid"]]
      },
      {
        h2: "Recursos gratuitos para aprender el islam de forma neutral",
        p: [
          "Todo el contenido de la web es gratuito y abierto, también para quien no es musulmán. Puede empezar por la sección del islam y leer y escuchar el Corán con traducción al español.",
          "Si prefiere un estudio ordenado, la Madrasa organiza el aprendizaje como una escuela islámica clásica, en cuatro etapas con varias materias, horario semanal y certificados. Y si en algún momento quiere profundizar en el Corán, la Academia y el Método Shams le guían sura por sura."
        ],
        links: [["/islam", "Sección del islam"], ["/quran", "El Corán con traducción"], ["/school", "La Madrasa"]]
      }
    ],
    stepsTitle: "Un recorrido inicial",
    steps: [
      { title: "Lea una introducción", body: "Empiece por qué es el islam y qué creen los musulmanes." },
      { title: "Conozca el Corán", body: "Lea sobre su estructura y escuche una sura corta con traducción." },
      { title: "Entienda los pilares", body: "Descubra qué significan la shahada, la oración, el zakat, el ayuno y la peregrinación." },
      { title: "Explore la diversidad", body: "Lea sobre las tradiciones sunní y chií y sus escuelas." },
      { title: "Dé un primer paso práctico", body: "Si lo desea, aprenda el wudu y la estructura de la oración." },
      { title: "Haga preguntas", body: "Hable con personas de conocimiento y de confianza de su entorno." }
    ],
    faqTitle: "Preguntas frecuentes sobre aprender el islam",
    faq: [
      { q: "¿Qué es el islam y qué creen los musulmanes?", a: "Es una religión monoteísta: los musulmanes creen en un único Dios, en los profetas, con Muhammad como el último, en el Corán como palabra revelada y en la vida después de la muerte." },
      { q: "¿Por dónde empiezo si quiero conocer el islam?", a: "Por una introducción general, el Corán con traducción y los fundamentos de la fe. Después, la práctica diaria y la diversidad de escuelas." },
      { q: "¿Cuáles son los cinco pilares del islam?", a: "La profesión de fe, la oración, el zakat, el ayuno de Ramadán y la peregrinación a La Meca para quien puede realizarla. La tradición chií los integra en las ramas de la religión, junto a otros deberes." },
      { q: "¿Qué diferencia hay entre sunníes y chiíes?", a: "Comparten el Corán y la práctica básica; se separaron por la cuestión de quién debía suceder al Profeta al frente de la comunidad y desarrollaron escuelas propias. El sitio presenta ambas tradiciones sin tomar partido." },
      { q: "¿Qué debe saber un recién convertido al islam?", a: "Que no tiene que aprenderlo todo de golpe: el wudu, la oración, Al-Fatiha y los fundamentos de la fe son un buen comienzo, con el apoyo de una comunidad o de una persona de confianza." },
      { q: "¿Puedo aprender sobre el islam sin ser musulmán?", a: "Sí. Los contenidos están abiertos a cualquiera que quiera conocer el islam, por curiosidad, por estudios o por interés personal." },
      { q: "¿Es Quran Masterclass una autoridad religiosa?", a: "No. Es una plataforma de estudio. Para cuestiones concretas, consulte a una persona de conocimiento de la escuela que usted sigue." },
      { q: "¿Los recursos son gratuitos?", a: "Sí. Todo el contenido de la web es gratuito y sin anuncios, y la app de iOS usa la misma cuenta." }
    ],
    linksTitle: "Para seguir explorando",
    links: [["/islam", "Sección del islam"], ["/islam/islam", "Qué es el islam"], ["/islam/iman", "La fe"], ["/islam/prayer-sunni", "Oración sunní"], ["/islam/prayer-shia", "Oración chií"], ["/islam/ramadan", "Ramadán"], ["/islam/names", "99 nombres de Alá"], ["/calendar", "Calendario islámico"], ["/learn-quran", "Aprender el Corán"]],
    cta: ["/islam/islam", "Leer la introducción"]
  }
};

export default hubs;
