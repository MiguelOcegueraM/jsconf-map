import type { Dictionary } from "./dictionaries";

const en: Dictionary = {
  meta: {
    appDescription:
      "Venue map, schedule and your picks for JSConf México 2026 — October 29–30, Jardín Americana, Guadalajara.",
    mapTitle: "Venue map",
    mapDescription:
      "Interactive map of Jardín Americana: Stage A, Stage B, Taller A, Taller B, registration and cowork.",
    agendaTitle: "Schedule",
    agendaDescription: "Full JSConf México 2026 programme, October 29–30.",
    favoritesTitle: "My favourites",
    favoritesDescription: "Your curated JSConf México 2026 schedule.",
    translationTitle: "Translation",
    translationDescription:
      "Live interpretation and captions for every JSConf México 2026 room.",
  },

  shell: {
    home: "JSConf México — home",
    dates: "Oct 29–30",
    city: "Guadalajara",
    sections: "Sections",
    language: "Language",
  },

  nav: {
    map: "Map",
    agenda: "Schedule",
    favorites: "Favourites",
    translation: "Translation",
  },

  days: {
    "2026-10-29": { short: "Oct 29", long: "Thursday, October 29", n: "Day 1" },
    "2026-10-30": { short: "Oct 30", long: "Friday, October 30", n: "Day 2" },
    group: "Event day",
  },

  sessionTypes: {
    keynote: "Keynote",
    talk: "Talk",
    workshop: "Workshop",
    lightning: "Lightning talks",
    registration: "Registration",
    coffee: "Coffee break",
    lunch: "Lunch",
    party: "Party",
    closing: "Closing",
  },

  tones: {
    keynote: "Keynote",
    charla: "Talk",
    taller: "Workshop",
    sponsored: "Sponsored",
  },

  languageNames: { es: "Spanish", en: "English" },
  languageInline: { es: "Spanish", en: "English" },

  agenda: {
    title: "Schedule",
    intro: "Two days, four rooms: keynotes, talks and workshops. Tap a session to read the abstract.",
    timezone: "GDL time",
    filterRoom: "Room",
    filterLanguage: "Lang",
    filterType: "Type",
    allRooms: "All",
    allLanguages: "All",
    allTypes: "All",
    keynotes: "Keynotes",
    talks: "Talks",
    workshops: "Workshops",
    noticeTitle: "Subject to change.",
    noticeUnavailable:
      "We couldn't load the talks right now. Try again in a bit; meanwhile, here are registration, meals and parties.",
    noticeOver:
      "JSConf México 2026 is over — thanks for coming! The full programme stays here.",
    noticeDefault:
      "The schedule follows the official jsconf.mx programme. Sessions drop off the list once they end.",
    swipeHint: "Swipe a talk right to save it, left to remove it.",
    hidePast: "Hide what's over",
    showPast: (n: number) =>
      `Show ${n} ${n === 1 ? "session that already ended" : "sessions that already ended"}`,
    noMatches: "No sessions match those filters.",
    dayEmpty: "No sessions left today.",
    slotLabel: (time: string) => `Sessions at ${time}`,
    now: "Now",
  },

  card: {
    save: "Save",
    remove: "Remove",
    saveLabel: (title: string) => `Save “${title}” to favourites`,
    removeLabel: (title: string) => `Remove “${title}” from favourites`,
    live: "Live",
    showDetail: "Details",
    hideDetail: "Hide details",
    provisional: "Title to be confirmed",
    untitled: "Session to be announced",
    sponsoredBy: (sponsor: string) => `Presented by ${sponsor}`,
    workshopNote: (duration: string) => `${duration} workshop · bring your laptop`,
    inLanguage: { es: "In Spanish", en: "In English" },
  },

  detail: {
    when: "When",
    where: "Where",
    language: "Language",
    noAbstract: "The abstract for this session hasn't been published yet.",
    addToCalendar: "Add to calendar",
    googleCalendar: "Google Calendar",
    directions: "Directions",
    liveTranslation: "Live translation",
    venue: "Jardín Americana",
  },

  favorites: {
    title: "My favourites",
    emptyIntro: "Your curated schedule, saved on this device.",
    count: (n: number) => `${n} ${n === 1 ? "session" : "sessions"} saved on this device.`,
    addAll: "Add all to calendar",
    clear: "Clear favourites",
    hidePast: "Hide what's over",
    showPast: (n: number) =>
      `Show ${n} ${n === 1 ? "favourite that already ended" : "favourites that already ended"}`,
    allPast: "All your favourites are over.",
    emptyTitle: "Nothing saved yet",
    emptyBody:
      "Swipe a talk right in the schedule —or tap its star— and it shows up here, sorted by day and time.",
    goToAgenda: "Go to the schedule",
    icsFile: "jsconf-mx-2026.ics",
  },

  reminders: {
    title: "Reminders",
    unsupported:
      "This browser doesn't allow notifications. On iPhone, add the app to your home screen (Share → Add to Home Screen) to turn them on — or use “Add to calendar”.",
    denied: "You blocked notifications; turn them on in your browser settings.",
    description: (min: number) =>
      `A heads-up ${min} min before each favourite, with the app open or in the background.`,
    enable: "Turn on",
    enabled: "On",
    onTitle: "Reminders on",
    onBody: (min: number) => `We'll ping you ${min} minutes before each talk in your favourites.`,
    soon: (min: number, title: string) => `In ${min} min: ${title}`,
  },

  map: {
    title: "The venue",
    venue: "Jardín Americana",
    intro: "Av. Ignacio L. Vallarta 1305, Col. Americana. Tap any area to see how to get there.",
    svgLabel:
      "Map of Jardín Americana with Stage A, Stage B, Taller A, Taller B and the JSConf México 2026 services",
    stairs: "STAIRS",
    avenue: "AV. IGNACIO L. VALLARTA",
    originalPlan: "View original floor plan",
    originalPlanTitle: "Original floor plan",
    originalPlanBody:
      "The venue floor plan at 1:100, as delivered by production. The red arrow marks the stairs to the terrace stage.",
    originalPlanAlt: "Architectural floor plan of Jardín Americana showing the stage layout",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Show the whole venue",
    legend: {
      stage: "Stages",
      workshop: "Workshops",
      service: "Services",
      sponsor: "Sponsors",
      entrance: "Entrances",
    },
    kinds: {
      stage: "Stage",
      workshop: "Workshop room",
      service: "Service",
      sponsor: "Sponsors",
      food: "Food",
      entrance: "Entrance",
      restroom: "Restrooms",
    },
    upstairs: "It's upstairs. Take the stairs marked in red on the map.",
    roomAgenda: (name: string) => `See the ${name} schedule`,
    center: "Center on the map",
  },

  install: {
    title: "Put it on your home screen",
    body: "Opens like an app, works offline and reminds you before your talks.",
    button: "Install JSConf MX",
    iosTitle: "iPhone · Safari",
    iosShare: "Share",
    iosStep1: "in the bottom bar.",
    iosStep1Before: "Tap",
    iosStep2Before: "Choose",
    iosStep2: "Add to Home Screen",
    iosStep3Before: "Tap",
    iosStep3: "Add",
    iosStep3After: ". Open it from your home screen.",
    androidTitle: "Android · Chrome",
    androidStep1Before: "Tap the",
    androidStep1After: "menu at the top right.",
    androidMenu: "three dots",
    androidStep2Before: "Choose",
    androidStep2A: "Install app",
    androidStep2Or: "or",
    androidStep2B: "Add to Home screen",
    androidStep3Before: "Confirm with",
    androidStep3: "Install",
  },

  translation: {
    title: "Translation",
    intro: "Listen to every talk translated live, or follow the captions. Pick the room you're in.",
    available: "Available",
    soon: "Coming soon",
    nowOn: "Now",
    at: (time: string) => `At ${time}`,
    rooms: "Rooms",
    soonTitle: "Coming soon",
    soonBody: (room: string) =>
      `Live translation for ${room} isn't ready yet. For now it's available in Stage A and Stage B.`,
    seeRooms: "See rooms",
    connected: "Connected",
    connecting: "Connecting…",
    reconnecting: "Reconnecting…",
    iphoneTitle: "iPhone users:",
    iphoneBody:
      "don't lock your screen while listening — iOS cuts the audio. If you hear nothing, check your phone's silent switch.",
    modeLive: "Live",
    modeTest: "Audio test",
    modeIdle: "Not streaming",
    idleBody:
      "There's no translation in this room right now. Captions will show up here as soon as the talk starts.",
    connectingBody: "Connecting to the room…",
    howTo: "How do you want to follow it?",
    captionsOnly: "Captions",
    noAudio: "no audio",
    translated: "Translated",
    translatedTo: (lang: string) => `to ${lang}`,
    original: "Original",
    originalIn: (lang: string) => `in ${lang}`,
    headphones: "Use headphones so you don't disturb the people next to you.",
    audioError: "This browser didn't allow audio playback. Try again, or follow the captions.",
    trackTranslation: (lang: string) => `Translation · ${lang}`,
    trackOriginal: (lang: string) => `Original · ${lang}`,
    hide: "Hide",
    show: "Show",
    waiting: "Captions show up here as soon as someone speaks.",
  },
};

export default en;
