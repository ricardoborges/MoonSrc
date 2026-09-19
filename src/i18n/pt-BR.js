/**
 * Textos em português do Brasil.
 * As chaves são resolvidas por caminho pontilhado — veja src/i18n/index.js.
 */

export default {
  app: {
    title: 'Laboratório Espacial da Lua 3D - Descubra as Fases da Lua!',
    description: 'Simulador 3D interativo do sistema Sol, Terra e Lua para crianças aprenderem as fases da Lua de forma divertida e visual.'
  },

  brand: {
    title: 'Laboratório da Lua 3D',
    subtitle: 'Sol • Terra • Lua — Por que a Lua muda no céu?'
  },

  controls: {
    playPauseAria: 'Reproduzir ou pausar órbita',
    playPauseTitle: 'Espaço',
    pause: 'Pausar',
    resume: 'Continuar',
    speedAria: 'Velocidade da órbita',
    reset: 'Reiniciar',
    resetTitle: 'Voltar ao início da Lua Nova (R)'
  },

  camera: {
    label: 'Focar em:',
    system: 'Sistema',
    earthMoon: 'Terra e Lua',
    moon: 'Lua',
    moonTitle: 'A câmera acompanha a Lua pela órbita, vendo a mesma fase do visor da Terra'
  },

  layers: {
    label: 'Extras:',
    groupAria: 'Camadas didáticas',
    beams: 'Raios',
    beamsTitle: 'Mostrar ou esconder os raios de luz do Sol (B)',
    orbit: 'Órbita',
    orbitTitle: 'Mostrar ou esconder o caminho da órbita da Lua (O)',
    earthOrbit: 'Translação',
    earthOrbitTitle: 'Ligar a translação: a Terra percorre uma elipse com o Sol em um dos focos, 1 volta por ano, enquanto a Lua dá 12 na Terra (T)'
  },

  hud: {
    hide: 'Esconder painéis',
    hideTitle: 'Esconder os painéis e ver só o espaço (H)',
    show: 'Mostrar painéis',
    showTitle: 'Mostrar os painéis de novo (H)'
  },

  telescope: {
    title: 'Visão da Terra',
    illuminated: '{percent}% Iluminada',
    povDefault: '🔭 Visão do céu da Terra: {phase}',
    povNew: '🌙 A Lua está no céu diurno perto do Sol (lado escuro para nós)!',
    povFull: '🌟 Olhe para o céu da noite! A face visível está toda brilhante!',
    distance: '📏 {distance} km',
    distancePerigee: '📏 Perigeu: {distance} km',
    distanceApogee: '📏 Apogeu: {distance} km'
  },

  hint: {
    text: '🖱️ Arraste para girar • roda do mouse dá zoom • teclas: <kbd>espaço</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>1-8</kbd> <kbd>B</kbd> <kbd>O</kbd> <kbd>H</kbd>'
  },

  orbitReadout: {
    title: '🌍 Distância até o Sol',
    distance: '{value} milhões de km',
    date: 'por volta de {date}',
    note: 'A órbita é uma elipse com o Sol em um foco — mas tão pouco achatada que parece um círculo.',
    perihelion: '☀️ Periélio: o ponto mais perto ({value} mi km)',
    aphelion: '🧊 Afélio: o ponto mais longe ({value} mi km)'
  },

  console: {
    collapse: 'Recolher a barra de baixo',
    collapseTitle: 'Recolher a barra de baixo (C)',
    expand: 'Abrir a barra de baixo',
    expandTitle: 'Abrir a barra de baixo (C)'
  },

  timeline: {
    shelfAria: 'As 8 Fases da Lua',
    day: 'Dia {day}',
    ofCycle: 'de 29,5 (1 mês lunar)',
    sliderAria: 'Dia do ciclo lunar',
    phaseButtonTitle: '{name} (~Dia {day})'
  },

  lesson: {
    open: 'Aprender',
    close: 'Fechar',
    toggleTitle: 'Explicação da fase (L)',
    closeAria: 'Fechar explicação',
    badge: '✨ {phase}',
    badgeDefault: '✨ Descobrindo o Céu',
    whatsHappening: 'O que está acontecendo?',
    tipTitle: '💡 Dica do Astrônomo Mirim',
    funFactTitle: '🚀 Curiosidade Espacial',
    loadingExplanation: 'Carregando explicação...',
    loadingTip: 'Dica...',
    loadingFunFact: 'Curiosidade...'
  },

  language: {
    en: 'EN',
    enTitle: 'Switch the site to English',
    pt: 'PT',
    ptTitle: 'Mudar o site para português do Brasil'
  },

  months: [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ],

  /** "4 de janeiro" em português, "January 4" em inglês */
  dateFormat: '{day} de {month}',

  phases: {
    new: {
      name: 'Lua Nova',
      shortName: 'Nova',
      description: 'A Lua está entre a Terra e o Sol. Sua metade iluminada está voltada para o Sol, então da Terra vemos sua face escura.',
      funFact: 'Durante a Lua Nova, a Lua passa pelo céu durante o dia junto com o Sol, por isso quase não conseguimos vê-la!',
      tip: 'Se a Lua passar exatamente em frente ao Sol durante essa fase, acontece um eclipse solar!'
    },
    waxingCrescent: {
      name: 'Crescente Côncava',
      shortName: 'Crescente',
      description: 'Uma pontinha iluminada começa a aparecer para nós na Terra, formando um sorriso brilhante no céu da tarde.',
      funFact: 'Na fase crescente, quem mora no hemisfério Sul enxerga a Lua com formato da letra "C"!',
      tip: 'Olhe para o oeste logo após o pôr do sol para avistar essa linda casquinha prateada.'
    },
    firstQuarter: {
      name: 'Quarto Crescente',
      shortName: 'Q. Crescente',
      description: 'Vemos exatamente metade do disco lunar iluminado. A Lua completou um quarto de toda a sua viagem ao redor da Terra!',
      funFact: 'Mesmo parecendo que apenas metade da Lua existe, a outra metade está lá, apenas na sombra.',
      tip: 'Com um binóculo simples, a linha divisória entre luz e sombra revela montanhas e crateras gigantes!'
    },
    waxingGibbous: {
      name: 'Crescente Gibosa',
      shortName: 'Gibosa Cresc.',
      description: 'Mais da metade da Lua já está brilhando para nós! A palavra "gibosa" significa corcunda ou arredondada.',
      funFact: 'A cada noite que passa, a Lua fica mais brilhante e nasce mais tarde no céu.',
      tip: 'A Lua já fica visível no céu antes mesmo de o Sol se pôr por completo!'
    },
    full: {
      name: 'Lua Cheia',
      shortName: 'Cheia',
      description: 'A Terra está entre o Sol e a Lua. Toda a face da Lua voltada para nós está 100% iluminada pela luz solar!',
      funFact: 'A Lua Cheia nasce exatamente no momento em que o Sol se põe no horizonte oposto.',
      tip: 'A Lua Cheia é tão brilhante que pode até produzir sombras suaves no chão à noite!'
    },
    waningGibbous: {
      name: 'Gibosa Minguante',
      shortName: 'Gibosa Ming.',
      description: 'Depois do ápice da Lua Cheia, a área visível iluminada começa lentamente a diminuir dia após dia.',
      funFact: 'A palavra "minguante" vem do verbo minguar, que significa encolher ou diminuir.',
      tip: 'Nesta fase, a Lua nasce mais tarde da noite e brilha alta durante a madrugada.'
    },
    lastQuarter: {
      name: 'Quarto Minguante',
      shortName: 'Q. Minguante',
      description: 'Vemos novamente metade do disco lunar iluminado, mas agora é a outra metade! Ela completou três quartos da sua órbita.',
      funFact: 'Nesta fase a Lua nasce por volta da meia-noite e pode ser vista brilhando no céu na manhã seguinte!',
      tip: 'Você consegue ver o Quarto Minguante de manhã cedo quando vai para a escola!'
    },
    waningCrescent: {
      name: 'Minguante Côncava',
      shortName: 'Minguante',
      description: 'Resta apenas um fininho filete prateado antes da Lua dar uma volta completa e recomeçar o ciclo na Lua Nova.',
      funFact: 'Em apenas 2 ou 3 dias, a Lua estará novamente alinhada com o Sol, iniciando um novo mês lunar.',
      tip: 'Acorde cedinho antes do nascer do sol para ver essa última fatia brilhante a leste!'
    }
  }
};
