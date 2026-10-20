import type { MapContent } from "../../mapContent";
const c: MapContent = {
  kicker: "Quran Masterclass · Método Shams",
  title: "El mapa del Corán",
  lead: "114 suras, 30 ayza', 6.236 aleyas – y de un vistazo ves lo que está bien asentado, lo que se tambalea y lo que te resulta difícil. El mapa no es una barra de progreso que solo crece. Es un espejo sincero de tu memoria: se vuelve verde cuando repasas y se desvanece cuando dejas una aleya demasiado tiempo sin tocar.",
  ctaStart: "Aprende tu primera aleya con el Método Shams",
  ctaToday: "Ir a las tareas de hoy",
  stats: [{ n: "114", l: "suras como casillas" }, { n: "30", l: "ayza' de un vistazo" }, { n: "6.236", l: "aleyas, cada una visible" }],
  readTitle: "Cómo leer tu mapa",
  readLead: "Cada casilla es una sura. Su color es la media de todas las aleyas que ya has aprendido en esa sura. Si una sura solo está aprendida en parte, su casilla se dibuja más clara. Toca una casilla y la sura se abre aleya por aleya.",
  colors: [
    { key: "strong", t: "Verde – asentada", d: "Repasaste estas aleyas a tiempo; tu memoria las retiene con seguridad.", todo: "No hay nada que hacer – la plataforma te las trae de vuelta justo antes de que se desvanezcan." },
    { key: "mid", t: "Dorado – se tambalea", d: "Tu último repaso fue hace un tiempo. Todavía conoces las aleyas, pero ya no sin esfuerzo.", todo: "Repasa hoy o mañana. Una pasada en modo memorizar suele bastar." },
    { key: "weak", t: "Rojo – difícil", d: "O no las has repasado en mucho tiempo o te has equivocado a menudo aquí. Cuentan los errores en pruebas, lecciones y repasos.", todo: "Estas primero: ábrelas con el Método Shams, usa los ganchos de memoria y la construcción hacia atrás." },
    { key: "none", t: "Gris – aún no aprendida", d: "Todavía queda camino por delante. El gris no es una falta, es una invitación.", todo: "Si tu plan lo indica: apréndela a continuación. Las suras cortas del final del Corán son un buen comienzo." },
  ],
  howTitle: "Cómo sabe el mapa lo que sabes",
  howBody: "Detrás de cada aleya aprendida hay un pequeño modelo de memoria. Recuerda **cuándo** repasaste la aleya por última vez, **con qué intervalo** debe volver y **cuántas veces** te equivocaste en ella.\n\n- **Intervalo:** después del primer aprendizaje, una aleya vuelve al día siguiente, luego a los tres días, a la semana, a las dos semanas, al mes y más adelante. Cada repaso exitoso alarga el intervalo.\n- **Desvanecimiento:** cuanto más tiempo ha pasado una aleya de su intervalo, menor es su fuerza estimada – el verde se vuelve dorado y el dorado se vuelve rojo. Igual que en la memoria real.\n- **Facilidad:** las aleyas que te resultan fáciles reciben intervalos más largos. Las aleyas en las que te equivocas vuelven más a menudo. Cada error reduce la facilidad y además cuenta como penalización en el mapa.\n- **Sincronizado:** con tu cuenta, el mapa es el mismo en todos tus dispositivos – aprendido en el móvil, visto en el portátil.\n\nEl mapa es una estimación, no un veredicto. Si una aleya está realmente asentada solo lo demuestra, al final, recitarla – idealmente ante alguien que pueda corregirte.",
  useTitle: "Qué haces con el mapa",
  uses: [
    { t: "Por la mañana: primero el rojo", d: "Antes de aprender algo nuevo, recupera las casillas rojas. Cinco minutos de repaso ahorran más que veinte minutos de volver a aprender." },
    { t: "Antes de la oración", d: "Las suras cortas marcadas en dorado son perfectas para el salat: recitarlas es repasarlas – y el mapa se vuelve más verde." },
    { t: "Con tu maestro", d: "Enséñale el mapa a tu maestro o a tus padres. En segundos ven dónde deben escucharte." },
    { t: "Para Ramadán", d: "¿Quieres saberte un yuz con seguridad para Ramadán? Cambia a la vista por yuz y avanza del rojo al verde." },
  ],
  viewsTitle: "Tres niveles, una imagen",
  views: [
    { t: "Suras", d: "114 casillas – desde la larga Al-Baqarah hasta la breve An-Nas. La visión general más rápida de todo tu Corán." },
    { t: "Ayza'", d: "30 casillas para las 30 partes. Ideal para planes de hifz que piensan en yuz y para planificar el jatm." },
    { t: "Aleyas", d: "Toca una sura: cada aleya se convierte en su propia casilla. Un toque la abre para repasarla o para aprenderla de nuevo." },
  ],
  faqTitle: "Preguntas sobre el mapa",
  faq: [
    { q: "¿Por qué una casilla verde se vuelve dorada aunque no haya hecho nada mal?", a: "Porque la memoria se desvanece sin repaso. El mapa no muestra lo que aprendiste una vez, sino lo que probablemente todavía sabes con seguridad hoy. Un repaso la vuelve verde de nuevo – y el siguiente intervalo se alarga." },
    { q: "Veo un mapa de ejemplo – ¿es ese mi progreso?", a: "No. Mientras no hayas iniciado sesión o aún no hayas aprendido ninguna aleya, mostramos un ejemplo claramente marcado para que veas cómo será. En cuanto aprendas tu primera aleya, aparecerá tu propio mapa." },
    { q: "¿Cuenta si solo escucho?", a: "Escuchar es el primer paso del Método Shams, pero una aleya solo aparece en el mapa cuando la has aprendido y recordado – en el coach Shams, en una lección, en una prueba o en el modo de repaso." },
    { q: "¿Y si ya me sabía la sura de memoria?", a: "Ábrela en modo memorizar, recita cada aleya de memoria y valórala como “Fácil”. Aparece en el mapa de inmediato, avanza en el calendario y vuelve a intervalos largos para que siga segura." },
    { q: "¿Pueden otros ver mi mapa?", a: "No. Tu mapa te pertenece. Se transmite cifrado con tu cuenta y nunca se muestra públicamente." },
  ],
  finalTitle: "Cada casilla verde es un trozo del Corán en tu corazón.",
  finalLead: "Empieza hoy con una sola aleya. Mañana la verás en tu mapa – y dentro de un año, todo un paisaje.",
};
export default c;
