// Spanish translation of en.ts ("Para hermanas", polite "usted" address).
import type { SistersText } from "./types";

const es: SistersText = {
  kicker: "Para hermanas",
  title: "Su aprendizaje continúa todos los días",
  lead: "Qué cambia en la recitación durante la menstruación (ḥayḍ) y después del parto (nifās), cómo continúa el Método Shams, y las mujeres que transmitieron y enseñaron el Corán. El aprendizaje nunca se detiene; para algunas escuelas solo cambia su forma.",
  reviewLine: "El contenido está siendo revisado por sabios",
  notFatwa: "Esto es un resumen, no una fatua. Consulte, por favor, a un sabio de su confianza, especialmente de su propia escuela jurídica.",
  sourcesTitle: "Fuentes",
  schools: { hanafi: "Hanafí", maliki: "Malikí", shafii: "Shafií", hanbali: "Hanbalí", jafari: "Yafarí (chií)", majority: "Mayoría de los sabios", contemporary: "Organismos de fatua contemporáneos" },
  open: "Abrir",
  readVerse: "Leer y escuchar en el Corán",
  entryTitle: "Para hermanas",
  entryLead: "Recitar durante la menstruación, los días de escucha y comprensión en el Método Shams, y las mujeres que transmitieron el Corán.",
  entryCta: "Ver",

  partRecite: {
    title: "Recitar, memorizar y el muṣḥaf",
    lead: "Las escuelas difieren sobre todo en la recitación de memoria. Escuchar, el dhikr y la súplica están permitidos según todas las fuentes aquí citadas.",
    blocks: [
      {
        id: "memory",
        title: "Recitar de memoria",
        positions: [
          { school: "hanafi", text: "No está permitido con la intención de recitar, ni siquiera menos de una aleya. Está permitido: aleyas dichas con la intención de súplica, recuerdo o protección, y leer con los ojos sin pronunciar. Una maestra puede enseñar palabra por palabra con pausas, ya que esto no cuenta como recitación.", src: ["arij", "sgHanafi"] },
          { school: "maliki", text: "Mientras continúa el sangrado, una mujer en ḥayḍ – y según Dar al-Ifta también en nifās – puede recitar de memoria, tema o no olvidar. Una vez que el sangrado ha cesado pero antes del baño ritual, solo si teme olvidar.", src: ["ifta12343"] },
          { school: "shafii", text: "Ni siquiera una aleya está permitida. Las expresiones del Corán dichas como recuerdo están permitidas.", src: ["sgShafii"] },
          { school: "hanbali", text: "La posición de la escuela es la prohibición. Ibn Taymiyya consideraba permitido recitar, también en nifās cuando ella teme olvidar.", src: ["muftiwp18", "iqa2564"] },
          { school: "jafari", text: "Según el ayatolá al-Sistani, solo están prohibidas las cuatro aleyas de postración (32:15, 41:37, 53:62, 96:19) – la aleya en sí, no toda la sura. Las demás aleyas no figuran entre las prohibiciones enumeradas. Para el nifās se aplica lo mismo como precaución obligatoria.", src: ["sistani354", "sistani448", "sistani502"] },
          { school: "contemporary", text: "El muftí de los Territorios Federales de Malasia considera permitido repasar lo memorizado, también en las escuelas de hifz. islamqa.info considera mejor fundamentada la opinión permisiva y aconseja con cautela recitar solo lo que se teme olvidar.", src: ["muftiwp18", "iqa2564"] },
        ],
      },
      {
        id: "mushaf",
        title: "Tocar el muṣḥaf",
        positions: [
          { school: "majority", text: "Según la mayoría, tocar el muṣḥaf sin estado de pureza no está permitido.", src: ["iqa2564"] },
          { school: "hanafi", text: "Permitido con un paño o una funda separados que no estén sujetos al cuerpo.", src: ["bham"] },
          { school: "maliki", text: "Una mujer que aprende o enseña puede tocar y llevar el muṣḥaf o una parte de él mientras aprende o enseña. Dar al-Ifta aconseja en general la opinión de la mayoría, pero permite seguir la opinión malikí sin pecado en caso de necesidad real – memorizar, enseñar, la enseñanza como profesión.", src: ["ifta12343"] },
          { school: "jafari", text: "Tocar la escritura del Corán está prohibido.", src: ["sistani354", "sistani448"] },
        ],
      },
      {
        id: "screen",
        title: "Desde una pantalla o una aplicación",
        positions: [
          { school: "contemporary", text: "islamqa.info: un teléfono no es un muṣḥaf; puede tocarse sin estado de pureza. Dar al-Ifta (Egipto): para la mayoría, recitar está prohibido sea cual sea el medio; mirar la pantalla sin pronunciar está permitido.", src: ["iqa106961", "ifta7815"] },
          { school: "hanafi", text: "Darul Iftaa Azaadville: mientras haya texto del Corán en la pantalla, la pantalla y los iconos de esa página toman el estatus del muṣḥaf; no los toque directamente, es posible usar un lápiz táctil. Escuchar está permitido.", src: ["azaad"] },
        ],
      },
      {
        id: "always",
        title: "Lo que siempre permanece",
        points: [
          { text: "Escuchar: oír la recitación está permitido; la fuente hanafí lo califica de muy loable, también desde grabaciones. La oficina del muftí de Malasia recomienda escuchar en lugar de repasar.", src: ["azaad", "sgHanafi", "muftiwp18"] },
          { text: "El dhikr y la súplica están permitidos; la mayoría exime precisamente estos de la prohibición, siempre que no se pretendan como recitación.", src: ["iqa2564", "sgShafii"] },
          { text: "El Profeta ﷺ recitaba el Corán con la cabeza en el regazo de ʿĀʾisha mientras ella estaba menstruando. La cercanía al Corán permanece.", src: ["bukhari297", "muslim301"] },
        ],
      },
    ],
  },

  partShams: {
    title: "Cómo continúa el Método Shams",
    lead: "En los días de escucha y comprensión, su ḥifẓ sigue vivo sin recitar en voz alta. Su racha y su jardín siguen creciendo.",
    steps: [
      { id: "listen", title: "Ḥifẓ escuchando", text: "Escuche el sabaq de hoy, su sabqī y su manzil de un recitador maestro, aleya por aleya y varias veces.", src: ["muftiwp18", "sgHanafi"] },
      { id: "eyes", title: "Siga con los ojos", text: "Lea en silencio sin pronunciar. Que toque la pantalla mientras lo hace depende de su escuela (véase arriba).", src: ["sgHanafi", "ifta7815", "azaad"] },
      { id: "understand", title: "Comprender (tadabbur)", text: "Significado, tafsir y contexto de sus aleyas: el paso \"comprender\" del Método Shams." },
      { id: "words", title: "Vocabulario", text: "Las palabras de sus aleyas y sus raíces, con tarjetas de memoria." },
      { id: "tajweed", title: "Teoría del tajwīd y makhārij", text: "Aprenda las reglas, observe los diagramas de la boca y las descripciones de los puntos de articulación. Si practica letras sueltas en voz alta, aclárelo, por favor, con su maestra." },
      { id: "dua", title: "Dhikr y súplica", text: "La súplica y el recuerdo acompañan cada día.", src: ["iqa2564"] },
    ],
    notes: [
      { text: "Las maestras que siguen la escuela hanafí pueden enseñar palabra por palabra con pausas.", src: ["arij"] },
      { text: "Quienes siguen la escuela malikí pueden seguir recitando mientras continúa el sangrado y pueden tocar el muṣḥaf mientras aprenden o enseñan.", src: ["ifta12343"] },
      { text: "Después de que termina el sangrado: en la escuela malikí recitar vuelve a estar permitido solo después del baño ritual, a menos que ella tema olvidar.", src: ["ifta12343"] },
    ],
  },

  partSajda: {
    title: "Postración de recitación (sajdat al-tilāwa)",
    lead: "Qué se aplica cuando usted oye o lee una aleya de postración.",
    positions: [
      { school: "hanafi", text: "En ḥayḍ y nifās no está permitida ni es válida, y no se debe ni se recupera más tarde.", src: ["sgSajda"] },
      { school: "majority", text: "La pureza es una condición; por eso no se realiza la postración (al-Sarakhsi, Ibn Juzayy, al-Nawawi, al-Ruhaybani).", src: ["ifta24156"] },
      { school: "contemporary", text: "Otra opinión sostiene que la pureza no es necesaria (Ibn Taymiyya, al-Shawkani). Dar al-Ifta prefiere la opinión de la mayoría, pero no ve pecado en la mujer que sigue la otra opinión.", src: ["ifta24156"] },
      { school: "jafari", text: "Según al-Sistani, la postración es obligatoria al recitar u oír una de las cuatro aleyas de postración; para ello no se requiere wuḍūʾ ni ghusl. Oída desde una grabación, no se vuelve obligatoria – esto incluye las recitaciones de esta aplicación.", src: ["sistani1079"] },
    ],
  },

  partWomen: {
    title: "Las mujeres y el Corán",
    lead: "Para el paso \"comprender\": aleyas sobre las mujeres, y las mujeres que preservaron, enseñaron y recitaron el Corán.",
    versesTitle: "Aleyas para reflexionar",
    verses: [
      { ref: "33:35", topic: "Los creyentes y las creyentes son nombrados uno al lado del otro, con la misma recompensa." },
      { ref: "3:195", topic: "Ninguna obra se pierde, sea de un hombre o de una mujer." },
      { ref: "4:124", topic: "Las buenas obras de un hombre o una mujer con fe llevan al Paraíso." },
      { ref: "16:97", topic: "Una buena vida para quien obra bien y cree, hombre o mujer." },
      { ref: "58:1", topic: "Allah oyó a la mujer que discutía acerca de su esposo; la sura lleva su nombre (al-Mujādila)." },
      { ref: "66:11", topic: "La súplica de la esposa del Faraón por una casa en el Paraíso." },
      { ref: "66:12", topic: "Maryam, que creyó en las palabras de su Señor." },
      { ref: "3:42", topic: "Maryam es elegida y purificada (hasta 3:43)." },
      { ref: "28:7", topic: "La inspiración a la madre de Mūsā: no temas y no te entristezcas." },
    ],
    companionsTitle: "Compañeras que transmitieron el Corán",
    companions: [
      { text: "Ḥafṣa bint ʿUmar guardaba las hojas (ṣuḥuf) de la compilación del Corán de Abū Bakr; ʿUthmān hizo hacer las copias a partir de ellas y se las devolvió.", src: ["bukhari4986", "bukhari4987"] },
      { text: "Umm Waraqa leía el Corán; el Profeta ﷺ le permitió un llamador a la oración en su casa y le dijo que dirigiera la oración de la gente de su casa.", src: ["abudawud591", "abudawud592"] },
      { text: "ʿĀʾisha explicaba aleyas y corregía interpretaciones, por ejemplo de 2:158 y 4:3.", src: ["bukhari1643", "muslim3018"] },
      { text: "Umm Salama describió cómo el Profeta ﷺ recitaba al-Fātiḥa aleya por aleya, haciendo una pausa después de cada aleya – un fundamento del tajwīd y de la pausa (waqf).", src: ["abudawud4001", "tirmidhi2927"] },
    ],
    scholarsTitle: "Mujeres sabias",
    scholars: [
      { text: "Karīma al-Marwaziyya (m. 1069 en La Meca) fue una autoridad en la transmisión del Ṣaḥīḥ al-Bukhārī.", src: ["karima"] },
      { text: "Fāṭima bint Muḥammad al-Samarqandī conocía de memoria la obra de fiqh de su padre; las fatuas llevaban su letra junto a la de su padre y la de su esposo.", src: ["samarqandi"] },
      { text: "Mohammad Akram Nadwi escribió en árabe un diccionario de mujeres sabias del hadiz en unos 40 volúmenes; su introducción se publicó como \"Al-Muhaddithat: The Women Scholars in Islam\".", src: ["nadwi"] },
    ],
    recitersTitle: "Mujeres recitadoras",
    reciters: [
      { text: "El Concurso Internacional de Recitación del Corán de Malasia tiene una categoría propia para mujeres recitadoras (qāriʾa); entre sus ganadoras están Rogayah Sulong y Faridah Mat Saman, de Malasia, y Maria Ulfah, de Indonesia.", src: ["mtq", "aljazeera"] },
      { text: "Se conserva una grabación de 1905 de la recitadora egipcia Shaykha Mabrūka; hoy hay iniciativas que vuelven a dar visibilidad a las mujeres recitadoras.", src: ["aljazeera"] },
    ],
  },

  partTogether: {
    title: "Aprender con una maestra y con hermanas",
    lead: "La recitación se aprende escuchando a una maestra y recitándole.",
    teacher: "Conecte su Método Shams con una maestra de su elección: ella ve su plan, y sus grabaciones cuando usted se las envía.",
    circles: "En \"Juntos\" hay círculos de estudio solo para hermanas.",
    teacherCta: "Conectar una maestra",
    circlesCta: "Círculos de hermanas",
  },

  setup: {
    title: "¿Configurar \"Para hermanas\"?",
    lead: "Un área opcional que acompaña su aprendizaje todos los días.",
    points: [
      "Usted elige su escuela jurídica. Lo que se pausa en sus días depende de ella.",
      "\"Mis días\" es un simple interruptor: sí o no. Sin fecha, sin historial, sin calendario del ciclo.",
      "Todo permanece solo en este dispositivo. Nada se sincroniza con su cuenta ni se envía a un servidor o a una IA; se borra cuando cierra la sesión.",
      "Puede cambiarlo o desactivarlo en cualquier momento.",
    ],
    agree: "Sí, configurar",
    decline: "No, gracias",
    declined: "Por supuesto. No le preguntaremos nada más. La página \"Para hermanas\" sigue abierta para usted en Descubrir.",
    madhhabTitle: "¿Qué escuela jurídica sigue usted?",
    madhhabLead: "Si no lo sabe, se aplica la opinión prudente de la mayoría.",
    madhhabs: { hanafi: "Hanafí", maliki: "Malikí", shafii: "Shafií", hanbali: "Hanbalí", jafari: "Yafarí (chií)", unknown: "No lo sé" },
    done: "Listo",
    later: "Encontrará todo en Descubrir → Para hermanas.",
  },

  days: {
    title: "Mis días",
    lead: "Un interruptor, solo en este dispositivo. Mientras está activado, la aplicación pausa lo que su escuela no contempla en estos días y activa los días de escucha y comprensión. Su racha y su jardín se mantienen; los repasos se aplazan en lugar de acumularse.",
    question: "¿Está usted en sus días ahora mismo?",
    yes: "Sí",
    no: "No",
    statusOn: "Activado: los días de escucha y comprensión están activos.",
    statusOff: "Desactivado.",
    rules: {
      hanafi: "Hanafí: la recitación de memoria y los ejercicios de recitación se pausan. Escuchar, seguir la lectura con los ojos, comprender, el vocabulario, la teoría del tajwīd y la súplica se mantienen.",
      maliki: "Malikí: recitar de memoria sigue estando permitido mientras continúa el sangrado. La aplicación se lo recuerda en lugar de pausar. Toque el muṣḥaf solo mientras aprende o enseña.",
      shafii: "Shafií: la recitación de memoria y los ejercicios de recitación se pausan. Escuchar, seguir la lectura con los ojos, comprender, el vocabulario, la teoría del tajwīd y la súplica se mantienen.",
      hanbali: "Hanbalí: la recitación de memoria y los ejercicios de recitación se pausan (la posición de la escuela). Escuchar, seguir la lectura, comprender, el vocabulario, la teoría del tajwīd y la súplica se mantienen.",
      jafari: "Yafarí: omita, por favor, las cuatro aleyas de postración (32:15, 41:37, 53:62, 96:19); la aplicación se las señala. Para el estado de janāba, al-Sistani (regla 355) califica de desaconsejable (makrūh) recitar más de siete aleyas; si esto se aplica al ḥayḍ, pregunte, por favor, a su marjaʿ.",
      unknown: "Opinión prudente de la mayoría: la recitación de memoria y los ejercicios de recitación se pausan. Escuchar, seguir la lectura con los ojos, comprender, el vocabulario, la teoría del tajwīd y la súplica se mantienen.",
    },
    strictTitle: "Modo estricto",
    strictLead: "Su propia elección: en sus días todo se pausa excepto escuchar y la súplica, incluidos el tafsir y el vocabulario. Ninguna de las grandes escuelas lo exige; escuchar, el tafsir y la súplica están permitidos.",
    offTitle: "Vuelvo a estar pura",
    offNote: "Después de que termina el sangrado se requiere el baño ritual (ghusl); en la escuela malikí recitar vuelve a estar permitido solo después de él, a menos que ella tema olvidar.",
    ghuslLink: "Ir a la guía del ghusl",
    privacy: "Solo en este dispositivo. Sin fecha, sin historial, sin transmisión. Se borra cuando cierra la sesión.",
    changeMadhhab: "Cambiar de escuela jurídica",
  },

  gate: {
    pausedTitle: "En pausa hasta que terminen sus días",
    pausedMajority: "Según su escuela, en estos días no se recita de memoria. Su ḥifẓ sigue vivo: escuche hoy las mismas aleyas y aprenda su significado.",
    pausedStrict: "Usted eligió el modo estricto: hoy se mantienen la escucha y la súplica.",
    noteMaliki: "Según la escuela malikí, usted puede recitar de memoria mientras continúa el sangrado.",
    noteJafari: "Omita, por favor, las aleyas de postración 32:15, 41:37, 53:62 y 96:19.",
    listenInstead: "Hoy escuchar en lugar de recitar",
    toSection: "Para hermanas",
    openAnyway: "Abrir de todos modos",
  },

  ld: {
    title: "Días de escucha y comprensión",
    lead: "Cuando no puede o no quiere recitar en voz alta – de viaje, afónica, en sus días: su wird se convierte en escucha, comprensión y vocabulario. La racha y el jardín se mantienen.",
    on: "Días de escucha y comprensión",
    onHint: "Un simple interruptor como el modo viaje, solo en este dispositivo. No se guarda ninguna fecha.",
    activeTitle: "Hoy: un día de escucha y comprensión",
    activeLead: "Su ḥifẓ sigue vivo sin recitar en voz alta.",
    done: "Completar el día de escucha",
    doneMsg: "Mā shāʾ Allāh. Su día de escucha cuenta para su racha y su jardín.",
    off: "Volver a recitar",
    sistersLink: "Indicaciones para hermanas",
  },
};
export default es;
