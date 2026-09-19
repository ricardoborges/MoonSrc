/**
 * Módulo de Simulação do Ciclo Lunar
 * Calcula posições orbitais, fases da lua, dias decorridos e iluminação aparente.
 *
 * Este módulo é independente de idioma: cada fase carrega uma `key` e os textos
 * ficam nos dicionários (src/i18n). A interface traduz na hora de exibir.
 */

export const SYNODIC_MONTH_DAYS = 29.53059;
export const TROPICAL_YEAR_DAYS = 365.2422;
/** ~12.37: quantas voltas a Lua dá em torno da Terra enquanto a Terra dá uma no Sol */
export const LUNAR_MONTHS_PER_YEAR = TROPICAL_YEAR_DAYS / SYNODIC_MONTH_DAYS;
export const TWO_PI = Math.PI * 2;

export const PHASES = [
  {
    index: 0,
    key: 'new',
    icon: '🌑',
    targetAngle: 0,
    targetDay: 0
  },
  {
    index: 1,
    key: 'waxingCrescent',
    icon: '🌒',
    targetAngle: Math.PI / 4,
    targetDay: SYNODIC_MONTH_DAYS * (1 / 8)
  },
  {
    index: 2,
    key: 'firstQuarter',
    icon: '🌓',
    targetAngle: Math.PI / 2,
    targetDay: SYNODIC_MONTH_DAYS * (2 / 8)
  },
  {
    index: 3,
    key: 'waxingGibbous',
    icon: '🌔',
    targetAngle: (3 * Math.PI) / 4,
    targetDay: SYNODIC_MONTH_DAYS * (3 / 8)
  },
  {
    index: 4,
    key: 'full',
    icon: '🌕',
    targetAngle: Math.PI,
    targetDay: SYNODIC_MONTH_DAYS * (4 / 8)
  },
  {
    index: 5,
    key: 'waningGibbous',
    icon: '🌖',
    targetAngle: (5 * Math.PI) / 4,
    targetDay: SYNODIC_MONTH_DAYS * (5 / 8)
  },
  {
    index: 6,
    key: 'lastQuarter',
    icon: '🌗',
    targetAngle: (3 * Math.PI) / 2,
    targetDay: SYNODIC_MONTH_DAYS * (6 / 8)
  },
  {
    index: 7,
    key: 'waningCrescent',
    icon: '🌘',
    targetAngle: (7 * Math.PI) / 4,
    targetDay: SYNODIC_MONTH_DAYS * (7 / 8)
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
 * Calcula os dados astronômicos para um dado ângulo orbital em radianos.
 * Os textos não vêm daqui: a UI resolve `phaseKey` no dicionário do idioma ativo.
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
    phaseKey: phaseInfo.key,
    phaseIcon: phaseInfo.icon,
    illuminatedFraction,
    illuminatedPercentage: Math.round(illuminatedFraction * 100)
  };
}
