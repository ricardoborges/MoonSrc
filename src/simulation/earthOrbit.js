/**
 * Módulo da Órbita da Terra em torno do Sol (1ª e 2ª Leis de Kepler)
 *
 * A órbita é uma elipse com o Sol em um dos focos, e não um círculo com o Sol
 * no centro. Na prática a excentricidade é pequena (e = 0.0167): o desenho fica
 * quase igual a uma circunferência — e é justamente esse o fato curioso que a
 * simulação mostra, exibindo a distância real em vez de exagerar o formato.
 *
 * Convenção do ângulo: anomalia verdadeira (theta), medida a partir do periélio.
 *   theta = 0    -> periélio (~4 de janeiro, ponto mais próximo)
 *   theta = PI   -> afélio   (~4 de julho, ponto mais distante)
 */

import { TROPICAL_YEAR_DAYS, TWO_PI, normalizeAngle } from './lunarCycle.js';
import { t, tList } from '../i18n/index.js';
import {
  ellipseRadiusFactor,
  ellipseSpeedFactor,
  semiMinorFactor,
  trueToMeanAnomaly as keplerTrueToMean
} from './kepler.js';

/** Excentricidade atual da órbita terrestre */
export const ECCENTRICITY = 0.0167;

/** Semieixo maior: 1 UA, em milhões de km */
export const SEMI_MAJOR_AXIS_MKM = 149.6;

/** b = a * sqrt(1 - e^2) — apenas 0,014% menor que o semieixo maior */
export const SEMI_MINOR_FACTOR = semiMinorFactor(ECCENTRICITY);

/** Distância Sol-Terra no periélio e no afélio, em milhões de km */
export const PERIHELION_MKM = SEMI_MAJOR_AXIS_MKM * (1 - ECCENTRICITY);
export const APHELION_MKM = SEMI_MAJOR_AXIS_MKM * (1 + ECCENTRICITY);

/** Dia do ano em que a Terra passa pelo periélio (4 de janeiro, aproximado) */
const PERIHELION_DAY_OF_YEAR = 4;

/** Janela angular (radianos) para chamar a posição de "periélio"/"afélio" */
const MARKER_TOLERANCE = 0.18;

/** Dias de cada mês (ano comum): os nomes vêm do dicionário do idioma ativo */
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Razão entre a distância atual e o semieixo maior: r(theta) / a
 * Fórmula polar da elipse com o Sol no foco: r = a(1 - e^2) / (1 + e*cos(theta))
 * @param {number} trueAnomaly ângulo a partir do periélio, em radianos
 * @returns {number} fator entre (1 - e) no periélio e (1 + e) no afélio
 */
export function radiusFactor(trueAnomaly) {
  return ellipseRadiusFactor(ECCENTRICITY, trueAnomaly);
}

/**
 * Distância Sol-Terra em milhões de km para um dado ponto da órbita
 * @param {number} trueAnomaly
 * @returns {number}
 */
export function distanceMkm(trueAnomaly) {
  return SEMI_MAJOR_AXIS_MKM * radiusFactor(trueAnomaly);
}

/**
 * 2ª Lei de Kepler: a Terra varre áreas iguais em tempos iguais, ou seja,
 * corre mais rápido perto do Sol. A velocidade angular é proporcional a 1/r²,
 * então basta multiplicar o passo "médio" por este fator.
 *
 *   dtheta/dt = n * (1 + e*cos(theta))^2 / (1 - e^2)^(3/2)
 *
 * (varia de ~+3.4% no periélio a ~-3.3% no afélio)
 * @param {number} trueAnomaly
 * @returns {number} multiplicador da velocidade angular média
 */
export function angularSpeedFactor(trueAnomaly) {
  return ellipseSpeedFactor(ECCENTRICITY, trueAnomaly);
}

/**
 * Converte a anomalia verdadeira em anomalia média (o "relógio" da órbita),
 * passando pela anomalia excêntrica — é o que permite saber a data do ano.
 *   E = 2*atan( sqrt((1-e)/(1+e)) * tan(theta/2) )
 *   M = E - e*sin(E)
 * @param {number} trueAnomaly
 * @returns {number} anomalia média em radianos [0, 2*PI)
 */
export function trueToMeanAnomaly(trueAnomaly) {
  return keplerTrueToMean(ECCENTRICITY, trueAnomaly);
}

/**
 * Dia do ano (1 a ~365) correspondente a um ponto da órbita
 * @param {number} trueAnomaly
 * @returns {number}
 */
export function dayOfYear(trueAnomaly) {
  const elapsed = (trueToMeanAnomaly(trueAnomaly) / TWO_PI) * TROPICAL_YEAR_DAYS;
  const day = (PERIHELION_DAY_OF_YEAR - 1 + elapsed) % TROPICAL_YEAR_DAYS;
  return day + 1;
}

/**
 * Formata o dia do ano por extenso no idioma ativo
 * ("4 de janeiro" em português, "January 4" em inglês)
 * @param {number} day dia do ano, começando em 1
 * @returns {string}
 */
export function formatDayOfYear(day) {
  const monthNames = tList('months');
  let remaining = Math.floor(day);

  for (let i = 0; i < MONTH_DAYS.length; i += 1) {
    if (remaining <= MONTH_DAYS[i]) {
      return t('dateFormat', { day: Math.max(1, remaining), month: monthNames[i] });
    }
    remaining -= MONTH_DAYS[i];
  }

  return t('dateFormat', { day: 31, month: monthNames[11] });
}

/**
 * Reúne tudo o que a interface precisa mostrar sobre a posição da Terra
 * @param {number} trueAnomaly
 * @returns {{distanceMkm: number, dateLabel: string, marker: ('perihelion'|'aphelion'|null)}}
 */
export function describeOrbitPosition(trueAnomaly) {
  const theta = normalizeAngle(trueAnomaly);
  const distanceFromPerihelion = Math.min(theta, TWO_PI - theta);

  let marker = null;
  if (distanceFromPerihelion < MARKER_TOLERANCE) {
    marker = 'perihelion';
  } else if (Math.abs(theta - Math.PI) < MARKER_TOLERANCE) {
    marker = 'aphelion';
  }

  return {
    distanceMkm: distanceMkm(theta),
    dateLabel: formatDayOfYear(dayOfYear(theta)),
    marker
  };
}
