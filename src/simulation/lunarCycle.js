/**
 * Módulo de Simulação do Ciclo Lunar
 * Calcula posições orbitais, fases da lua, dias decorridos e iluminação aparente.
 */

export const SYNODIC_MONTH_DAYS = 29.53059;
export const TWO_PI = Math.PI * 2;

export const PHASES = [
  {
    index: 0,
    name: 'Lua Nova',
    shortName: 'Nova',
    icon: '🌑',
    targetAngle: 0,
    targetDay: 0,
    description: 'A Lua está entre a Terra e o Sol. Sua metade iluminada está voltada para o Sol, então da Terra vemos sua face escura.',
    funFact: 'Durante a Lua Nova, a Lua passa pelo céu durante o dia junto com o Sol, por isso quase não conseguimos vê-la!',
    tip: 'Se a Lua passar exatamente em frente ao Sol durante essa fase, acontece um eclipse solar!'
  },
  {
    index: 1,
    name: 'Crescente Côncava',
    shortName: 'Crescente',
    icon: '🌒',
    targetAngle: Math.PI / 4,
    targetDay: SYNODIC_MONTH_DAYS * (1 / 8),
    description: 'Uma pontinha iluminada começa a aparecer para nós na Terra, formando um sorriso brilhante no céu da tarde.',
    funFact: 'Na fase crescente, quem mora no hemisfério Sul enxerga a Lua com formato da letra "C"!',
    tip: 'Olhe para o oeste logo após o pôr do sol para avistar essa linda casquinha prateada.'
  },
  {
    index: 2,
    name: 'Quarto Crescente',
    shortName: 'Q. Crescente',
    icon: '🌓',
    targetAngle: Math.PI / 2,
    targetDay: SYNODIC_MONTH_DAYS * (2 / 8),
    description: 'Vemos exatamente metade do disco lunar iluminado. A Lua completou um quarto de toda a sua viagem ao redor da Terra!',
    funFact: 'Mesmo parecendo que apenas metade da Lua existe, a outra metade está lá, apenas na sombra.',
    tip: 'Com um binóculo simples, a linha divisória entre luz e sombra revela montanhas e crateras gigantes!'
  },
  {
    index: 3,
    name: 'Crescente Gibosa',
    shortName: 'Gibosa Cresc.',
    icon: '🌔',
    targetAngle: (3 * Math.PI) / 4,
    targetDay: SYNODIC_MONTH_DAYS * (3 / 8),
    description: 'Mais da metade da Lua já está brilhando para nós! A palavra "gibosa" significa corcunda ou arredondada.',
    funFact: 'A cada noite que passa, a Lua fica mais brilhante e nasce mais tarde no céu.',
    tip: 'A Lua já fica visível no céu antes mesmo de o Sol se pôr por completo!'
  },
  {
    index: 4,
    name: 'Lua Cheia',
    shortName: 'Cheia',
    icon: '🌕',
    targetAngle: Math.PI,
    targetDay: SYNODIC_MONTH_DAYS * (4 / 8),
    description: 'A Terra está entre o Sol e a Lua. Toda a face da Lua voltada para nós está 100% iluminada pela luz solar!',
    funFact: 'A Lua Cheia nasce exatamente no momento em que o Sol se põe no horizonte oposto.',
    tip: 'A Lua Cheia é tão brilhante que pode até produzir sombras suaves no chão à noite!'
  },
  {
    index: 5,
    name: 'Gibosa Minguante',
    shortName: 'Gibosa Ming.',
    icon: '🌖',
    targetAngle: (5 * Math.PI) / 4,
    targetDay: SYNODIC_MONTH_DAYS * (5 / 8),
    description: 'Depois do ápice da Lua Cheia, a área visível iluminada começa lentamente a diminuir dia após dia.',
    funFact: 'A palavra "minguante" vem do verbo minguar, que significa encolher ou diminuir.',
    tip: 'Nesta fase, a Lua nasce mais tarde da noite e brilha alta durante a madrugada.'
  },
  {
    index: 6,
    name: 'Quarto Minguante',
    shortName: 'Q. Minguante',
    icon: '🌗',
    targetAngle: (3 * Math.PI) / 2,
    targetDay: SYNODIC_MONTH_DAYS * (6 / 8),
    description: 'Vemos novamente metade do disco lunar iluminado, mas agora é a outra metade! Ela completou três quartos da sua órbita.',
    funFact: 'Nesta fase a Lua nasce por volta da meia-noite e pode ser vista brilhando no céu na manhã seguinte!',
    tip: 'Você consegue ver o Quarto Minguante de manhã cedo quando vai para a escola!'
  },
  {
    index: 7,
    name: 'Minguante Côncava',
    shortName: 'Minguante',
    icon: '🌘',
    targetAngle: (7 * Math.PI) / 4,
    targetDay: SYNODIC_MONTH_DAYS * (7 / 8),
    description: 'Resta apenas um fininho filete prateado antes da Lua dar uma volta completa e recomeçar o ciclo na Lua Nova.',
    funFact: 'Em apenas 2 ou 3 dias, a Lua estará novamente alinhada com o Sol, iniciando um novo mês lunar.',
    tip: 'Acorde cedinho antes do nascer do sol para ver essa última fatia brilhante a leste!'
  }
];

/**
 * Normaliza um ângulo em radianos para o intervalo [0, 2*PI)
 */
export function normalizeAngle(angle) {
  let a = angle % TWO_PI;
  if (a < 0) {
    a += TWO_PI;
  }
  return a;
}

/**
 * Converte radianos para o dia do mês lunar (0 a 29.53)
 */
export function angleToDay(angle) {
  const norm = normalizeAngle(angle);
  return (norm / TWO_PI) * SYNODIC_MONTH_DAYS;
}

/**
 * Converte dia do mês lunar (0 a 29.53) para radianos [0, 2*PI)
 */
export function dayToAngle(day) {
  const clamped = Math.max(0, Math.min(SYNODIC_MONTH_DAYS, day));
  return (clamped / SYNODIC_MONTH_DAYS) * TWO_PI;
}

/**
 * Retorna os metadados de uma fase a partir do índice (0 a 7)
 */
export function getPhaseByIndex(index) {
  const safeIndex = ((index % 8) + 8) % 8;
  return PHASES[safeIndex];
}

/**
 * Calcula os dados astronômicos e didáticos para um dado ângulo orbital em radianos
 * @param {number} angleInRadians
 * @returns {object}
 */
export function calculatePhase(angleInRadians) {
  const normalized = normalizeAngle(angleInRadians);
  const angleDegrees = (normalized * 180) / Math.PI;
  const day = angleToDay(normalized);

  // Fração iluminada vista da Terra: (1 - cos(theta)) / 2
  // theta = 0 (Nova) -> 0; theta = PI (Cheia) -> 1; theta = PI/2 ou 3PI/2 -> 0.5
  const illuminatedFraction = (1 - Math.cos(normalized)) / 2;

  // Determinação do índice da fase (janela de 45 graus centrada no ângulo de cada fase)
  // Cada fase i está centrada em i * 45 deg, cobrindo [i*45 - 22.5, i*45 + 22.5]
  const sliceSize = TWO_PI / 8; // 45 graus em radianos
  const halfSlice = sliceSize / 2; // 22.5 graus em radianos

  let phaseIndex = Math.floor((normalized + halfSlice) / sliceSize) % 8;
  const phaseInfo = PHASES[phaseIndex];

  return {
    angle: normalized,
    angleDegrees,
    day,
    phaseIndex,
    phaseName: phaseInfo.name,
    phaseShortName: phaseInfo.shortName,
    phaseIcon: phaseInfo.icon,
    illuminatedFraction,
    illuminatedPercentage: Math.round(illuminatedFraction * 100),
    description: phaseInfo.description,
    funFact: phaseInfo.funFact,
    tip: phaseInfo.tip
  };
}
