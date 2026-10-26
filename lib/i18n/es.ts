/**
 * Español: la fuente de verdad. `en.ts` tiene que cubrir exactamente estas
 * mismas claves (el tipo `Dictionary` lo obliga). Las funciones resuelven
 * plurales e interpolación sin librería.
 */
const es = {
  meta: {
    appDescription:
      "Mapa del venue, agenda y tu selección de charlas para JSConf México 2026 — 29 y 30 de octubre, Jardín Americana, Guadalajara.",
    mapTitle: "Mapa del venue",
    mapDescription:
      "Plano interactivo de Jardín Americana: Stage A, Stage B, Taller A, Taller B, registro y cowork.",
    agendaTitle: "Agenda",
    agendaDescription: "Programa completo de JSConf México 2026, 29 y 30 de octubre.",
    favoritesTitle: "Mis favoritos",
    favoritesDescription: "Tu agenda curada de JSConf México 2026.",
    translationTitle: "Traducción",
    translationDescription:
      "Traducción simultánea y subtítulos en vivo de cada sala de JSConf México 2026.",
  },

  shell: {
    home: "JSConf México — inicio",
    dates: "29–30 oct",
    city: "Guadalajara",
    sections: "Secciones",
    language: "Idioma",
  },

  nav: {
    map: "Mapa",
    agenda: "Agenda",
    favorites: "Favoritos",
    translation: "Traducción",
  },

  days: {
    "2026-10-29": { short: "29 oct", long: "Jueves 29 de octubre", n: "Día 1" },
    "2026-10-30": { short: "30 oct", long: "Viernes 30 de octubre", n: "Día 2" },
    group: "Día del evento",
  },

  sessionTypes: {
    keynote: "Keynote",
    talk: "Charla",
    workshop: "Taller",
    lightning: "Lightning talks",
    registration: "Registro",
    coffee: "Coffee break",
    lunch: "Comida",
    party: "Fiesta",
    closing: "Cierre",
  },

  tones: {
    keynote: "Keynote",
    charla: "Charla",
    taller: "Taller",
    sponsored: "Patrocinada",
  },

  languageNames: { es: "Español", en: "Inglés" },
  /** Para frases: "al inglés", "en español". */
  languageInline: { es: "español", en: "inglés" },

  agenda: {
    title: "Agenda",
    intro: "Dos días, cuatro salas: keynotes, charlas y talleres. Toca una sesión para leer el resumen.",
    timezone: "Hora de GDL",
    filterRoom: "Sala",
    filterLanguage: "Idioma",
    filterType: "Tipo",
    allRooms: "Todas",
    allLanguages: "Todos",
    allTypes: "Todo",
    keynotes: "Keynotes",
    talks: "Charlas",
    workshops: "Talleres",
    noticeTitle: "Sujeto a cambios.",
    noticeUnavailable:
      "No pudimos cargar las charlas en este momento. Recarga en un rato; mientras, aquí están registro, comidas y fiestas.",
    noticeOver:
      "JSConf México 2026 ya terminó — ¡gracias por venir! Aquí queda el programa completo.",
    noticeDefault:
      "La agenda se actualiza con el programa oficial de jsconf.mx. Las sesiones que terminan salen solas de la lista.",
    swipeHint: "Desliza una charla a la derecha para guardarla, a la izquierda para quitarla.",
    hidePast: "Ocultar lo que ya pasó",
    showPast: (n: number) =>
      `Ver ${n} ${n === 1 ? "sesión que ya terminó" : "sesiones que ya terminaron"}`,
    noMatches: "Ninguna sesión coincide con esos filtros.",
    dayEmpty: "Ya no quedan sesiones este día.",
    slotLabel: (time: string) => `Sesiones de las ${time}`,
    now: "Ahora",
  },

  card: {
    save: "Guardar",
    remove: "Quitar",
    saveLabel: (title: string) => `Guardar «${title}» en favoritos`,
    removeLabel: (title: string) => `Quitar «${title}» de favoritos`,
    live: "En vivo",
    showDetail: "Ver detalle",
    hideDetail: "Ocultar detalle",
    provisional: "Título por confirmar",
    untitled: "Sesión por anunciar",
    sponsoredBy: (sponsor: string) => `Presentada por ${sponsor}`,
    workshopNote: (duration: string) => `Taller de ${duration} · trae tu laptop`,
    inLanguage: { es: "En español", en: "En inglés" },
  },

  detail: {
    when: "Cuándo",
    where: "Dónde",
    language: "Idioma",
    noAbstract: "El resumen de esta sesión todavía no se publica.",
    addToCalendar: "Añadir al calendario",
    googleCalendar: "Google Calendar",
    directions: "Cómo llegar",
    liveTranslation: "Traducción en vivo",
    venue: "Jardín Americana",
  },

  favorites: {
    title: "Mis favoritos",
    emptyIntro: "Tu agenda curada, guardada en este dispositivo.",
    count: (n: number) =>
      `${n} ${n === 1 ? "sesión guardada" : "sesiones guardadas"} en este dispositivo.`,
    addAll: "Añadir todo al calendario",
    clear: "Vaciar favoritos",
    hidePast: "Ocultar lo que ya pasó",
    showPast: (n: number) =>
      `Ver ${n} ${n === 1 ? "favorito que ya terminó" : "favoritos que ya terminaron"}`,
    allPast: "Todos tus favoritos ya pasaron.",
    emptyTitle: "Todavía no guardas nada",
    emptyBody:
      "Desliza una charla a la derecha en la agenda —o toca su estrella— y aparecerá aquí, ordenada por día y hora.",
    goToAgenda: "Ir a la agenda",
    icsFile: "jsconf-mx-2026.ics",
  },

  reminders: {
    title: "Recordatorios",
    unsupported:
      "Este navegador no permite avisos. En iPhone, instala la app en tu pantalla de inicio (Compartir → Agregar a inicio) para activarlos — o usa «Añadir al calendario».",
    denied: "Bloqueaste los avisos; actívalos en los ajustes del navegador.",
    description: (min: number) =>
      `Un aviso ${min} min antes de cada favorito, con la app abierta o en segundo plano.`,
    enable: "Activar",
    enabled: "Activados",
    onTitle: "Recordatorios activados",
    onBody: (min: number) =>
      `Te avisamos ${min} minutos antes de cada charla en tus favoritos.`,
    soon: (min: number, title: string) => `En ${min} min: ${title}`,
  },

  map: {
    title: "El venue",
    venue: "Jardín Americana",
    intro: "Av. Ignacio L. Vallarta 1305, Col. Americana. Toca cualquier zona para ver cómo llegar.",
    svgLabel:
      "Plano de Jardín Americana con Stage A, Stage B, Taller A, Taller B y los servicios de JSConf México 2026",
    stairs: "ESCALERAS",
    avenue: "AV. IGNACIO L. VALLARTA",
    originalPlan: "Ver plano original",
    originalPlanTitle: "Plano arquitectónico original",
    originalPlanBody:
      "Planta del venue a escala 1:100, tal cual la entregó producción. La flecha roja marca las escaleras al escenario en terraza.",
    originalPlanAlt:
      "Planta arquitectónica de Jardín Americana con la distribución de escenarios",
    zoomIn: "Acercar",
    zoomOut: "Alejar",
    reset: "Ver todo el venue",
    legend: {
      stage: "Escenarios",
      workshop: "Talleres",
      service: "Servicios",
      sponsor: "Sponsors",
      entrance: "Accesos",
    },
    kinds: {
      stage: "Escenario",
      workshop: "Taller",
      service: "Servicio",
      sponsor: "Sponsors",
      food: "Comida",
      entrance: "Acceso",
      restroom: "Baños",
    },
    upstairs: "Está en planta alta. Súbete por las escaleras marcadas en rojo en el mapa.",
    roomAgenda: (name: string) => `Ver la agenda de ${name}`,
    center: "Centrar en el mapa",
  },

  install: {
    title: "Llévala en tu inicio",
    body: "Abre como app, funciona sin señal y te avisa antes de tus charlas.",
    button: "Instalar JSConf MX",
    iosTitle: "iPhone · Safari",
    iosShare: "Compartir",
    iosStep1: "en la barra de abajo.",
    iosStep1Before: "Toca",
    iosStep2Before: "Elige",
    iosStep2: "Agregar a inicio",
    iosStep3Before: "Toca",
    iosStep3: "Agregar",
    iosStep3After: ". Ábrela desde tu pantalla de inicio.",
    androidTitle: "Android · Chrome",
    androidStep1Before: "Toca el menú",
    androidStep1After: "arriba a la derecha.",
    androidMenu: "tres puntos",
    androidStep2Before: "Elige",
    androidStep2A: "Instalar app",
    androidStep2Or: "o",
    androidStep2B: "Agregar a pantalla principal",
    androidStep3Before: "Confirma con",
    androidStep3: "Instalar",
  },

  translation: {
    title: "Traducción",
    intro: "Escucha cada charla traducida en vivo o sigue los subtítulos. Elige la sala donde estás.",
    available: "Disponible",
    soon: "Próximamente",
    nowOn: "Ahora",
    at: (time: string) => `A las ${time}`,
    rooms: "Salas",
    soonTitle: "Próximamente",
    soonBody: (room: string) =>
      `La traducción en vivo del ${room} todavía no está lista. Por ahora la tienes en Stage A y Stage B.`,
    seeRooms: "Ver salas",
    connected: "Conectado",
    connecting: "Conectando…",
    reconnecting: "Reconectando…",
    iphoneTitle: "Usuarios de iPhone:",
    iphoneBody:
      "no bloqueen la pantalla mientras escuchan — iOS corta el audio. Si no oyes nada, revisa el botón de silencio del teléfono.",
    modeLive: "En vivo",
    modeTest: "Prueba de audio",
    modeIdle: "Sin transmisión",
    idleBody:
      "Ahora no hay traducción en esta sala. En cuanto empiece la charla, los subtítulos aparecen aquí solos.",
    connectingBody: "Conectando con la sala…",
    howTo: "¿Cómo quieres seguirla?",
    captionsOnly: "Subtítulos",
    noAudio: "sin audio",
    translated: "Traducido",
    translatedTo: (lang: string) => `al ${lang}`,
    original: "Original",
    originalIn: (lang: string) => `en ${lang}`,
    headphones: "Usa audífonos para no molestar a quien está junto a ti.",
    audioError:
      "Este navegador no dejó reproducir audio. Intenta de nuevo o sigue los subtítulos.",
    trackTranslation: (lang: string) => `Traducción · ${lang}`,
    trackOriginal: (lang: string) => `Original · ${lang}`,
    hide: "Ocultar",
    show: "Mostrar",
    waiting: "Los subtítulos aparecen aquí en cuanto alguien habla.",
  },
};

export default es;
