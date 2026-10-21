import type { MapContent } from "../../mapContent";
const c: MapContent = {
  kicker: "Quran Masterclass · Método Shams",
  title: "El mapa del Corán",
  lead: "114 suras, 30 ayza', 6.236 aleyas – y de un vistazo ve lo que está bien asentado, lo que se tambalea y lo que le resulta difícil. El mapa no es una barra de progreso que solo crece. Es un espejo sincero de su memoria: se vuelve verde cuando repasa y se desvanece cuando deja una aleya demasiado tiempo sin tocar.",
  ctaStart: "Aprenda su primera aleya con el Método Shams",
  ctaToday: "Ir a las tareas de hoy",
  stats: [{ n: "114", l: "suras como casillas" }, { n: "30", l: "ayza' de un vistazo" }, { n: "6.236", l: "aleyas, cada una visible" }],
  readTitle: "Cómo leer su mapa",
  readLead: "Cada casilla es una sura. Su color es la media de todas las aleyas que ya ha aprendido en esa sura. Si una sura solo está aprendida en parte, su casilla se dibuja más clara. Toque una casilla y la sura se abre aleya por aleya.",
  colors: [
    { key: "strong", t: "Verde – asentada", d: "Repasó estas aleyas a tiempo; su memoria las retiene con seguridad.", todo: "No hay nada que hacer – la plataforma se las trae de vuelta justo antes de que se desvanezcan." },
    { key: "mid", t: "Dorado – se tambalea", d: "Su último repaso fue hace un tiempo. Todavía conoce las aleyas, pero ya no sin esfuerzo.", todo: "Repase hoy o mañana. Una pasada en modo memorizar suele bastar." },
    { key: "weak", t: "Rojo – difícil", d: "O no las ha repasado en mucho tiempo o se ha equivocado a menudo aquí. Cuentan los errores en pruebas, lecciones y repasos.", todo: "Estas primero: ábralas con el Método Shams, use los ganchos de memoria y la construcción hacia atrás." },
    { key: "none", t: "Gris – aún no aprendida", d: "Todavía queda camino por delante. El gris no es una falta, es una invitación.", todo: "Si su plan lo indica: apréndala a continuación. Las suras cortas del final del Corán son un buen comienzo." },
  ],
  howTitle: "Cómo sabe el mapa lo que usted sabe",
  howBody: "Detrás de cada aleya aprendida hay un pequeño modelo de memoria. Recuerda **cuándo** repasó la aleya por última vez, **con qué intervalo** debe volver y **cuántas veces** se equivocó en ella.\n\n- **Intervalo:** después del primer aprendizaje, una aleya vuelve al día siguiente, luego a los tres días, a la semana, a las dos semanas, al mes y más adelante. Cada repaso exitoso alarga el intervalo.\n- **Desvanecimiento:** cuanto más tiempo ha pasado una aleya de su intervalo, menor es su fuerza estimada – el verde se vuelve dorado y el dorado se vuelve rojo. Igual que en la memoria real.\n- **Facilidad:** las aleyas que le resultan fáciles reciben intervalos más largos. Las aleyas en las que se equivoca vuelven más a menudo. Cada error reduce la facilidad y además cuenta como penalización en el mapa.\n- **Sincronizado:** con su cuenta, el mapa es el mismo en todos sus dispositivos – aprendido en el móvil, visto en el portátil.\n\nEl mapa es una estimación, no un veredicto. Si una aleya está realmente asentada solo lo demuestra, al final, recitarla – idealmente ante alguien que pueda corregirle.",
  useTitle: "Qué hace con el mapa",
  uses: [
    { t: "Por la mañana: primero el rojo", d: "Antes de aprender algo nuevo, recupere las casillas rojas. Cinco minutos de repaso ahorran más que veinte minutos de volver a aprender." },
    { t: "Antes de la oración", d: "Las suras cortas marcadas en dorado son perfectas para el salat: recitarlas es repasarlas – y el mapa se vuelve más verde." },
    { t: "Con su maestro", d: "Enséñele el mapa a su maestro o a sus padres. En segundos ven dónde deben escucharle." },
    { t: "Para Ramadán", d: "¿Quiere saberse un yuz con seguridad para Ramadán? Cambie a la vista por yuz y avance del rojo al verde." },
  ],
  viewsTitle: "Tres niveles, una imagen",
  views: [
    { t: "Suras", d: "114 casillas – desde la larga Al-Baqarah hasta la breve An-Nas. La visión general más rápida de todo su Corán." },
    { t: "Ayza'", d: "30 casillas para las 30 partes. Ideal para planes de hifz que piensan en yuz y para planificar el jatm." },
    { t: "Aleyas", d: "Toque una sura: cada aleya se convierte en su propia casilla. Un toque la abre para repasarla o para aprenderla de nuevo." },
  ],
  faqTitle: "Preguntas sobre el mapa",
  faq: [
    { q: "¿Por qué una casilla verde se vuelve dorada aunque no haya hecho nada mal?", a: "Porque la memoria se desvanece sin repaso. El mapa no muestra lo que aprendió una vez, sino lo que probablemente todavía sabe con seguridad hoy. Un repaso la vuelve verde de nuevo – y el siguiente intervalo se alarga." },
    { q: "Veo un mapa de ejemplo – ¿es ese mi progreso?", a: "No. Mientras no haya iniciado sesión o aún no haya aprendido ninguna aleya, mostramos un ejemplo claramente marcado para que vea cómo será. En cuanto aprenda su primera aleya, aparecerá su propio mapa." },
    { q: "¿Cuenta si solo escucho?", a: "Escuchar es el primer paso del Método Shams, pero una aleya solo aparece en el mapa cuando la ha aprendido y recordado – en el coach Shams, en una lección, en una prueba o en el modo de repaso." },
    { q: "¿Y si ya me sabía la sura de memoria?", a: "Ábrala en modo memorizar, recite cada aleya de memoria y valórela como “Fácil”. Aparece en el mapa de inmediato, avanza en el calendario y vuelve a intervalos largos para que siga segura." },
    { q: "¿Pueden otros ver mi mapa?", a: "No. Su mapa le pertenece. Se transmite cifrado con su cuenta y nunca se muestra públicamente." },
  ],
  finalTitle: "Cada casilla verde es un trozo del Corán en su corazón.",
  finalLead: "Empiece hoy con una sola aleya. Mañana la verá en su mapa – y dentro de un año, todo un paisaje.",
};
export default c;
