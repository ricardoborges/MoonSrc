/**
 * Textos em inglês (idioma padrão).
 * As chaves são resolvidas por caminho pontilhado — veja src/i18n/index.js.
 */

export default {
  app: {
    title: 'Moon Space Lab 3D — Discover the Phases of the Moon!',
    description: 'Interactive 3D simulator of the Sun, Earth and Moon system where kids learn the phases of the Moon in a fun, visual way.'
  },

  brand: {
    title: 'Moon Lab 3D',
    subtitle: 'Sun • Earth • Moon — Why does the Moon change in the sky?'
  },

  controls: {
    playPauseAria: 'Play or pause the orbit',
    playPauseTitle: 'Space',
    pause: 'Pause',
    resume: 'Play',
    speedAria: 'Orbit speed',
    reset: 'Restart',
    resetTitle: 'Go back to the start of the New Moon (R)'
  },

  camera: {
    label: 'Focus on:',
    system: 'System',
    earthMoon: 'Earth & Moon',
    moon: 'Moon',
    moonTitle: 'The camera follows the Moon around its orbit, showing the same phase as the Earth viewer'
  },

  layers: {
    label: 'Extras:',
    groupAria: 'Teaching layers',
    beams: 'Rays',
    beamsTitle: 'Show or hide the Sun light rays (B)',
    orbit: 'Orbit',
    orbitTitle: 'Show or hide the path of the Moon orbit (O)',
    earthOrbit: 'Revolution',
    earthOrbitTitle: 'Turn on the revolution: Earth travels an ellipse with the Sun at one focus, 1 lap per year, while the Moon makes 12 around Earth (T)'
  },

  hud: {
    hide: 'Hide panels',
    hideTitle: 'Hide the panels and see only space (H)',
    show: 'Show panels',
    showTitle: 'Show the panels again (H)'
  },

  telescope: {
    title: 'View from Earth',
    illuminated: '{percent}% Lit',
    povDefault: '🔭 View from the Earth sky: {phase}',
    povNew: '🌙 The Moon is in the daytime sky near the Sun (dark side facing us)!',
    povFull: '🌟 Look at the night sky! The side facing us is fully lit!',
    distance: '📏 {distance} km',
    distancePerigee: '📏 Perigee: {distance} km',
    distanceApogee: '📏 Apogee: {distance} km'
  },

  hint: {
    text: '🖱️ Drag to spin • mouse wheel zooms • keys: <kbd>space</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>1-8</kbd> <kbd>B</kbd> <kbd>O</kbd> <kbd>H</kbd>'
  },

  orbitReadout: {
    title: '🌍 Distance to the Sun',
    distance: '{value} million km',
    date: 'around {date}',
    note: 'The orbit is an ellipse with the Sun at one focus — but so barely squashed that it looks like a circle.',
    perihelion: '☀️ Perihelion: the closest point ({value} M km)',
    aphelion: '🧊 Aphelion: the farthest point ({value} M km)'
  },

  console: {
    collapse: 'Collapse the bottom bar',
    collapseTitle: 'Collapse the bottom bar (C)',
    expand: 'Open the bottom bar',
    expandTitle: 'Open the bottom bar (C)'
  },

  timeline: {
    shelfAria: 'The 8 Phases of the Moon',
    day: 'Day {day}',
    ofCycle: 'of 29.5 (1 lunar month)',
    sliderAria: 'Day of the lunar cycle',
    phaseButtonTitle: '{name} (~Day {day})'
  },

  lesson: {
    open: 'Learn',
    close: 'Close',
    toggleTitle: 'Phase explanation (L)',
    closeAria: 'Close explanation',
    badge: '✨ {phase}',
    badgeDefault: '✨ Discovering the Sky',
    whatsHappening: 'What is going on?',
    tipTitle: '💡 Junior Astronomer Tip',
    funFactTitle: '🚀 Space Fun Fact',
    loadingExplanation: 'Loading explanation...',
    loadingTip: 'Tip...',
    loadingFunFact: 'Fun fact...'
  },

  language: {
    en: 'EN',
    enTitle: 'Switch the site to English',
    pt: 'PT',
    ptTitle: 'Mudar o site para português do Brasil'
  },

  months: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],

  /** "January 4" em inglês, "4 de janeiro" em português */
  dateFormat: '{month} {day}',

  phases: {
    new: {
      name: 'New Moon',
      shortName: 'New',
      description: 'The Moon is between Earth and the Sun. Its lit half faces the Sun, so from Earth we only see its dark face.',
      funFact: 'During the New Moon, the Moon crosses the sky during the day together with the Sun — that is why we can barely see it!',
      tip: 'If the Moon passes exactly in front of the Sun during this phase, we get a solar eclipse!'
    },
    waxingCrescent: {
      name: 'Waxing Crescent',
      shortName: 'Waxing Cres.',
      description: 'A tiny lit sliver starts to show up for us on Earth, like a bright smile in the evening sky.',
      funFact: 'In the Southern Hemisphere the waxing crescent looks like the letter "C" — north of the equator it curves the other way!',
      tip: 'Look west right after sunset to spot this pretty silver sliver.'
    },
    firstQuarter: {
      name: 'First Quarter',
      shortName: 'First Qtr',
      description: 'We see exactly half of the lunar disc lit up. The Moon has finished one quarter of its whole trip around Earth!',
      funFact: 'Even though it looks like only half the Moon exists, the other half is right there — just in shadow.',
      tip: 'With simple binoculars, the line between light and shadow reveals giant mountains and craters!'
    },
    waxingGibbous: {
      name: 'Waxing Gibbous',
      shortName: 'Wax. Gibbous',
      description: 'More than half of the Moon is already shining for us! The word "gibbous" means humped or rounded.',
      funFact: 'Every night that passes, the Moon gets brighter and rises later in the sky.',
      tip: 'The Moon is already visible in the sky even before the Sun has fully set!'
    },
    full: {
      name: 'Full Moon',
      shortName: 'Full',
      description: 'Earth is between the Sun and the Moon. The whole face of the Moon turned towards us is 100% lit by sunlight!',
      funFact: 'The Full Moon rises at exactly the moment the Sun sets on the opposite horizon.',
      tip: 'The Full Moon is so bright it can even cast soft shadows on the ground at night!'
    },
    waningGibbous: {
      name: 'Waning Gibbous',
      shortName: 'Wan. Gibbous',
      description: 'After the peak of the Full Moon, the lit area we can see slowly starts to shrink day after day.',
      funFact: 'The word "waning" means getting smaller — the opposite of "waxing", which means growing.',
      tip: 'In this phase the Moon rises later at night and shines high in the small hours.'
    },
    lastQuarter: {
      name: 'Last Quarter',
      shortName: 'Last Qtr',
      description: 'We see half of the lunar disc lit again, but now it is the other half! It has finished three quarters of its orbit.',
      funFact: 'In this phase the Moon rises around midnight and can be seen shining in the sky the next morning!',
      tip: 'You can see the Last Quarter early in the morning on your way to school!'
    },
    waningCrescent: {
      name: 'Waning Crescent',
      shortName: 'Waning Cres.',
      description: 'Only a very thin silver thread is left before the Moon completes a full lap and starts the cycle again at New Moon.',
      funFact: 'In just 2 or 3 days the Moon will be lined up with the Sun again, starting a new lunar month.',
      tip: 'Wake up early before sunrise to see this last bright slice in the east!'
    }
  }
};
